/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createBackendApp } from '../app.js';
import { BACKEND_DATA_DIR, createOrPromoteAdmin, ensureSeededData } from '../services/galleryStore.js';
import { createAuthRateLimiter } from '../middleware/rateLimiters.js';
import { validateSecurityEnv } from '../utils/jwt.js';

const USERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'users.json');
const GALLERY_JSON_PATH = path.join(BACKEND_DATA_DIR, 'gallery-data.json');
const ORDERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'orders.json');
const CUSTOM_ORDERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'custom-orders.json');

let server;
let baseUrl;
const backups = new Map();

async function backupFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    backups.set(filePath, content);
  } catch {
    backups.set(filePath, null);
  }
}

async function restoreFile(filePath) {
  const original = backups.get(filePath);
  if (original === null) {
    await fs.unlink(filePath).catch(() => {});
  } else if (typeof original === 'string') {
    await fs.writeFile(filePath, original, 'utf-8');
  }
}

async function apiRequest(route, { method = 'GET', token, body, origin } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (origin) headers.Origin = origin;

  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, body: json };
}

test.before(async () => {
  await ensureSeededData();
  await Promise.all([
    backupFile(USERS_JSON_PATH),
    backupFile(GALLERY_JSON_PATH),
    backupFile(ORDERS_JSON_PATH),
    backupFile(CUSTOM_ORDERS_JSON_PATH)
  ]);

  const app = createBackendApp({
    routerOptions: {
      authLimiter: createAuthRateLimiter({ max: 200 }),
      sensitiveLimiter: createAuthRateLimiter({ max: 200 })
    }
  });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await Promise.all([
    restoreFile(USERS_JSON_PATH),
    restoreFile(GALLERY_JSON_PATH),
    restoreFile(ORDERS_JSON_PATH),
    restoreFile(CUSTOM_ORDERS_JSON_PATH)
  ]);
});

test('Unauthenticated requests cannot access admin APIs or customer PII', async () => {
  const checks = await Promise.all([
    apiRequest('/api/products', { method: 'POST', body: { name: 'Hack Piece' } }),
    apiRequest('/api/products/unmade-001', { method: 'PUT', body: { price: 1 } }),
    apiRequest('/api/products/unmade-001', { method: 'DELETE' }),
    apiRequest('/api/orders'),
    apiRequest('/api/orders/my'),
    apiRequest('/api/orders/ord-8821/status', { method: 'PATCH', body: { status: 'Delivered' } }),
    apiRequest('/api/custom-orders'),
    apiRequest('/api/custom-orders/my'),
    apiRequest('/api/custom-orders/cust-101/status', { method: 'PATCH', body: { status: 'Completed' } }),
    apiRequest('/api/auth/me'),
    apiRequest('/api/auth/profile', { method: 'PUT', body: { name: 'Hacked' } })
  ]);

  for (const res of checks) {
    assert.equal(res.status, 401);
  }
});

test('Public registration ignores admin role attempts, hides passwordHash, and locks profile updates to authenticated user ID', async () => {
  const uniqueEmail = `collector.${Date.now()}@example.com`;
  const victimEmail = `victim.${Date.now()}@example.com`;

  // Register victim first
  const victimRes = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Original Victim',
      email: victimEmail,
      password: 'VictimPassword123!'
    }
  });
  assert.equal(victimRes.status, 201);
  assert.equal(victimRes.body.user.role, 'customer');

  // Attempt privilege escalation on public register endpoint
  const regRes = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Curious Collector',
      email: uniqueEmail,
      password: 'StrongPassword123!',
      role: 'admin'
    }
  });

  assert.equal(regRes.status, 201);
  assert.equal(regRes.body.user.role, 'customer');
  assert.equal('passwordHash' in regRes.body.user, false);
  assert.equal('tokenVersion' in regRes.body.user, false);
  assert.ok(regRes.body.token);

  const customerToken = regRes.body.token;

  // Attempt IDOR: pass victimEmail in body during profile update
  const updateRes = await apiRequest('/api/auth/profile', {
    method: 'PUT',
    token: customerToken,
    body: {
      name: 'Updated Collector',
      email: victimEmail,
      role: 'admin',
      phone: '+91 90000 00001',
      city: 'Pune'
    }
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.user.email, uniqueEmail);
  assert.equal(updateRes.body.user.role, 'customer');
  assert.equal(updateRes.body.user.name, 'Updated Collector');

  // Verify victim profile was untouched
  const victimMe = await apiRequest('/api/auth/me', { token: victimRes.body.token });
  assert.equal(victimMe.status, 200);
  assert.equal(victimMe.body.user.name, 'Original Victim');

  // Customer must be blocked with 403 from all admin routes
  const forbiddenChecks = await Promise.all([
    apiRequest('/api/products', { method: 'POST', token: customerToken, body: { name: 'Unauthorized' } }),
    apiRequest('/api/products/unmade-001', { method: 'PUT', token: customerToken, body: { name: 'Hacked' } }),
    apiRequest('/api/products/unmade-001', { method: 'DELETE', token: customerToken }),
    apiRequest('/api/orders', { token: customerToken }),
    apiRequest('/api/orders/ord-8821/status', {
      method: 'PATCH',
      token: customerToken,
      body: { status: 'Delivered' }
    }),
    apiRequest('/api/custom-orders', { token: customerToken }),
    apiRequest('/api/custom-orders/cust-101/status', {
      method: 'PATCH',
      token: customerToken,
      body: { status: 'Completed' }
    })
  ]);

  for (const res of forbiddenChecks) {
    assert.equal(res.status, 403);
  }

  // Customer /my routes return only empty/own orders (never other customers' seed PII)
  const myOrders = await apiRequest('/api/orders/my', { token: customerToken });
  assert.equal(myOrders.status, 200);
  assert.equal(myOrders.body.orders.length, 0);
});

test('Admin login grants access to admin APIs and logout immediately revokes token', async () => {
  const adminEmail = `admin.${Date.now()}@unmadegallery.test`;
  const adminPass = 'AtelierAdmin#2026!';
  await createOrPromoteAdmin({
    name: 'Test Studio Admin',
    email: adminEmail,
    password: adminPass
  });

  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: adminPass }
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.user.role, 'admin');
  assert.equal('passwordHash' in loginRes.body.user, false);
  const adminToken = loginRes.body.token;

  // Admin can list orders & create/delete product
  const ordersRes = await apiRequest('/api/orders', { token: adminToken });
  assert.equal(ordersRes.status, 200);
  assert.ok(Array.isArray(ordersRes.body.orders));

  const createRes = await apiRequest('/api/products', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'RBAC Verified Pendant',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 2600,
      stock: 3,
      description: 'Created during RBAC integration verification test.'
    }
  });
  assert.equal(createRes.status, 201);
  const createdId = createRes.body.product.id;

  const delRes = await apiRequest(`/api/products/${createdId}`, {
    method: 'DELETE',
    token: adminToken
  });
  assert.equal(delRes.status, 200);

  // Logout invalidates token server-side
  const logoutRes = await apiRequest('/api/auth/logout', { method: 'POST', token: adminToken });
  assert.equal(logoutRes.status, 200);

  const afterLogout = await apiRequest('/api/orders', { token: adminToken });
  assert.equal(afterLogout.status, 401);
});

test('Rate limiter blocks excessive login attempts and CORS rejects untrusted origins', async () => {
  const limitedApp = createBackendApp({
    routerOptions: {
      authLimiter: createAuthRateLimiter({ max: 2, windowMs: 60_000 })
    }
  });
  const limitedServer = http.createServer(limitedApp);
  await new Promise((resolve) => limitedServer.listen(0, '127.0.0.1', resolve));
  const { port } = limitedServer.address();
  const limitedUrl = `http://127.0.0.1:${port}`;

  try {
    const r1 = await fetch(`${limitedUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' })
    });
    const r2 = await fetch(`${limitedUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' })
    });
    const r3 = await fetch(`${limitedUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' })
    });
    assert.equal(r1.status, 401);
    assert.equal(r2.status, 401);
    assert.equal(r3.status, 429);

    const corsBlocked = await fetch(`${limitedUrl}/api/health`, {
      headers: { Origin: 'https://evil-attacker.example.com' }
    });
    assert.equal(corsBlocked.status, 403);
  } finally {
    await new Promise((resolve) => limitedServer.close(resolve));
  }
});

test('Production startup rejects missing or weak JWT_SECRET', () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.JWT_SECRET;
  try {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short_secret';
    assert.throws(() => validateSecurityEnv(), /JWT_SECRET/);
  } finally {
    process.env.NODE_ENV = prevEnv;
    if (prevSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = prevSecret;
  }
});
