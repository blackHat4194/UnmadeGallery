/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/db.js';
import { validateSecurityEnv } from './utils/jwt.js';
import { BACKEND_DATA_DIR, ensureSeededData } from './services/galleryStore.js';
import { createGalleryRouter } from './routes/galleryRoutes.js';
import { safeErrorHandler } from './middleware/errorHandler.js';

export function getAllowedOrigins() {
  const origins = new Set();

  const envOrigins = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  for (const origin of envOrigins) {
    origins.add(origin);
  }

  if (process.env.FRONTEND_URL) {
    origins.add(process.env.FRONTEND_URL.trim());
  }
  if (process.env.APP_URL) {
    origins.add(process.env.APP_URL.trim());
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://127.0.0.1:5173');
  }

  return origins;
}

export async function initializeBackend() {
  validateSecurityEnv();
  const dbStatus = await connectDatabase();
  await ensureSeededData();
  return dbStatus;
}

export function createBackendApp(options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  const allowedOrigins = getAllowedOrigins();
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '15mb' }));
  app.use('/data', express.static(BACKEND_DATA_DIR));
  app.use('/api', createGalleryRouter(options.routerOptions));
  app.use(safeErrorHandler);

  return app;
}
