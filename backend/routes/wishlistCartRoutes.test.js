/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createBackendApp } from '../app.js';
import { BACKEND_DATA_DIR, createOrPromoteAdmin, ensureSeededData } from '../services/galleryStore.js';
import { createAuthRateLimiter } from '../middleware/rateLimiters.js';
import { getJwtSecret } from '../utils/jwt.js';

const USERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'users.json');
const GALLERY_JSON_PATH = path.join(BACKEND_DATA_DIR, 'gallery-data.json');
const ORDERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'orders.json');
const WISHLISTS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'wishlists.json');
const CARTS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'carts.json');

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

async function apiRequest(route, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

test.before(async () => {
  await ensureSeededData();
  await Promise.all([
    backupFile(USERS_JSON_PATH),
    backupFile(GALLERY_JSON_PATH),
    backupFile(ORDERS_JSON_PATH),
    backupFile(WISHLISTS_JSON_PATH),
    backupFile(CARTS_JSON_PATH)
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
    restoreFile(WISHLISTS_JSON_PATH),
    restoreFile(CARTS_JSON_PATH)
  ]);
});

test('Guest requests to all Wishlist and Cart endpoints are rejected with 401', async () => {
  const responses = await Promise.all([
    apiRequest('/api/wishlist'),
    apiRequest('/api/wishlist/unmade-001', { method: 'POST' }),
    apiRequest('/api/wishlist/unmade-001', { method: 'DELETE' }),
    apiRequest('/api/wishlist', { method: 'DELETE' }),
    apiRequest('/api/cart'),
    apiRequest('/api/cart/items', { method: 'POST', body: { productId: 'unmade-001', quantity: 1 } }),
    apiRequest('/api/cart/items/unmade-001', { method: 'PATCH', body: { quantity: 2 } }),
    apiRequest('/api/cart/items/unmade-001', { method: 'DELETE' }),
    apiRequest('/api/cart', { method: 'DELETE' })
  ]);

  for (const res of responses) {
    assert.equal(res.status, 401);
  }
});

test('User A and User B have isolated Wishlists and Carts, with CRUD, deduplication, and server pricing', async () => {
  const catalogRes = await apiRequest('/api/products');
  assert.equal(catalogRes.status, 200);
  const productA = catalogRes.body.products[0];
  const productB = catalogRes.body.products[1];
  assert.ok(productA && productB);

  const regA = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'User Alpha',
      email: `alpha.${Date.now()}@example.com`,
      password: 'AlphaPassword123!'
    }
  });
  assert.equal(regA.status, 201);
  const tokenA = regA.body.token;
  const userAId = regA.body.user.id;

  const regB = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'User Beta',
      email: `beta.${Date.now()}@example.com`,
      password: 'BetaPassword123!'
    }
  });
  assert.equal(regB.status, 201);
  const tokenB = regB.body.token;

  // User A adds Product A to Wishlist (twice -> deduplicated)
  const wishAdd1 = await apiRequest(`/api/wishlist/${productA.id}`, { method: 'POST', token: tokenA });
  assert.equal(wishAdd1.status, 200);
  assert.deepEqual(wishAdd1.body.productIds, [productA.id]);

  const wishAdd2 = await apiRequest(`/api/wishlist/${productA.id}`, { method: 'POST', token: tokenA });
  assert.equal(wishAdd2.status, 200);
  assert.equal(wishAdd2.body.productIds.length, 1);

  // User A adds Product B to Cart (with spoofed price/userId -> ignored by server)
  const cartAdd1 = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: tokenA,
    body: {
      productId: productB.id,
      quantity: 1,
      price: 1,
      subtotal: 1,
      userId: regB.body.user.id
    }
  });
  assert.equal(cartAdd1.status, 200);
  assert.equal(cartAdd1.body.items.length, 1);
  assert.equal(cartAdd1.body.items[0].product.id, productB.id);
  assert.equal(cartAdd1.body.items[0].quantity, 1);
  assert.equal(cartAdd1.body.subtotal, productB.price);

  // Adding same product again increments quantity without duplicating row
  const cartAdd2 = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: tokenA,
    body: { productId: productB.id, quantity: 1 }
  });
  assert.equal(cartAdd2.status, 200);
  assert.equal(cartAdd2.body.items.length, 1);
  assert.equal(cartAdd2.body.items[0].quantity, 2);
  assert.equal(cartAdd2.body.subtotal, productB.price * 2);

  // User B must see empty Wishlist & Cart, even if tampering with query/body userId
  const wishB = await apiRequest(`/api/wishlist?userId=${userAId}`, { token: tokenB });
  assert.equal(wishB.status, 200);
  assert.deepEqual(wishB.body.productIds, []);

  const cartB = await apiRequest(`/api/cart?user=${userAId}`, { token: tokenB });
  assert.equal(cartB.status, 200);
  assert.deepEqual(cartB.body.items, []);
  assert.equal(cartB.body.subtotal, 0);

  // User B deleting User A's product only touches User B's empty cart, leaving User A intact
  await apiRequest(`/api/cart/items/${productB.id}`, { method: 'DELETE', token: tokenB });
  const cartAAfterBAttempt = await apiRequest('/api/cart', { token: tokenA });
  assert.equal(cartAAfterBAttempt.body.items.length, 1);
  assert.equal(cartAAfterBAttempt.body.items[0].quantity, 2);

  // User A updates Cart quantity via PATCH
  const cartPatch = await apiRequest(`/api/cart/items/${productB.id}`, {
    method: 'PATCH',
    token: tokenA,
    body: { quantity: 1 }
  });
  assert.equal(cartPatch.status, 200);
  assert.equal(cartPatch.body.items[0].quantity, 1);
  assert.equal(cartPatch.body.subtotal, productB.price);

  // User A removes Wishlist item
  const wishDel = await apiRequest(`/api/wishlist/${productA.id}`, { method: 'DELETE', token: tokenA });
  assert.equal(wishDel.status, 200);
  assert.deepEqual(wishDel.body.productIds, []);

  // User A removes Cart item
  const cartDel = await apiRequest(`/api/cart/items/${productB.id}`, { method: 'DELETE', token: tokenA });
  assert.equal(cartDel.status, 200);
  assert.deepEqual(cartDel.body.items, []);
  assert.equal(cartDel.body.subtotal, 0);
});

test('Invalid product IDs, unavailable stock, negative quantities, and expired/revoked JWTs are rejected', async () => {
  const adminEmail = `stockadmin.${Date.now()}@unmadegallery.test`;
  const adminPass = 'StockAdmin#2026!';
  await createOrPromoteAdmin({ name: 'Stock Admin', email: adminEmail, password: adminPass });
  const adminLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: adminPass }
  });
  const adminToken = adminLogin.body.token;

  // Create a 0-stock sold-out product and a 2-stock limited product
  const soldOutCreate = await apiRequest('/api/products', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Sold Out Test Charm',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 1500,
      stock: 0,
      description: 'Out of stock test item for cart availability check.'
    }
  });
  assert.equal(soldOutCreate.status, 201);
  const soldOutId = soldOutCreate.body.product.id;

  const limitedCreate = await apiRequest('/api/products', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Limited Two Stock Ring',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 2100,
      stock: 2,
      description: 'Limited stock ring for inventory enforcement verification.'
    }
  });
  assert.equal(limitedCreate.status, 201);
  const limitedId = limitedCreate.body.product.id;

  const regUser = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Stock Tester',
      email: `stocktester.${Date.now()}@example.com`,
      password: 'TesterPassword123!'
    }
  });
  const userToken = regUser.body.token;

  // Invalid product IDs
  const badIdWish = await apiRequest('/api/wishlist/nonexistent-product-999', {
    method: 'POST',
    token: userToken
  });
  assert.equal(badIdWish.status, 404);

  const malformedIdWish = await apiRequest('/api/wishlist/bad$id', {
    method: 'POST',
    token: userToken
  });
  assert.equal(malformedIdWish.status, 400);

  const badIdCart = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: 'nonexistent-product-999', quantity: 1 }
  });
  assert.equal(badIdCart.status, 404);

  // Unavailable (0 stock) product rejected for Cart
  const soldOutAdd = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: soldOutId, quantity: 1 }
  });
  assert.equal(soldOutAdd.status, 400);

  // Negative & invalid quantities rejected
  const negAdd = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: limitedId, quantity: -2 }
  });
  assert.equal(negAdd.status, 400);

  // Exceeding stock rejected
  const overStockAdd = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: limitedId, quantity: 3 }
  });
  assert.equal(overStockAdd.status, 409);

  // Valid add (2) then trying to add 1 more -> 409
  const okAdd = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: limitedId, quantity: 2 }
  });
  assert.equal(okAdd.status, 200);

  const overMergeAdd = await apiRequest('/api/cart/items', {
    method: 'POST',
    token: userToken,
    body: { productId: limitedId, quantity: 1 }
  });
  assert.equal(overMergeAdd.status, 409);

  const negPatch = await apiRequest(`/api/cart/items/${limitedId}`, {
    method: 'PATCH',
    token: userToken,
    body: { quantity: -1 }
  });
  assert.equal(negPatch.status, 400);

  const overPatch = await apiRequest(`/api/cart/items/${limitedId}`, {
    method: 'PATCH',
    token: userToken,
    body: { quantity: 5 }
  });
  assert.equal(overPatch.status, 409);

  // Placing an order clears authenticated user's cart
  const orderRes = await apiRequest('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      items: [{ product: { id: limitedId, name: 'Limited Two Stock Ring', price: 2100 }, quantity: 1 }],
      subtotal: 2100,
      shipping: 250,
      tax: 63,
      total: 2413,
      address: {
        fullName: 'Stock Tester',
        email: regUser.body.user.email,
        phone: '+91 98765 43210',
        street: '101 Residency Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentId: `pay_test_${Date.now()}`
    }
  });
  assert.equal(orderRes.status, 201);

  const cartAfterOrder = await apiRequest('/api/cart', { token: userToken });
  assert.equal(cartAfterOrder.status, 200);
  assert.deepEqual(cartAfterOrder.body.items, []);

  // Expired and tampered JWT tokens rejected with 401
  const expiredToken = jwt.sign(
    { id: regUser.body.user.id, email: regUser.body.user.email, role: 'customer', tv: 0 },
    getJwtSecret(),
    { expiresIn: -10 }
  );
  const expiredRes = await apiRequest('/api/wishlist', { token: expiredToken });
  assert.equal(expiredRes.status, 401);

  const tamperedRes = await apiRequest('/api/cart', { token: `${userToken}tampered` });
  assert.equal(tamperedRes.status, 401);

  // Logout immediately revokes token for Wishlist/Cart
  await apiRequest('/api/auth/logout', { method: 'POST', token: userToken });
  const afterLogoutRes = await apiRequest('/api/wishlist', { token: userToken });
  assert.equal(afterLogoutRes.status, 401);
});
