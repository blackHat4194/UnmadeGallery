/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import { BACKEND_DATA_DIR, ensureSeededData } from './services/galleryStore.js';
import { createGalleryRouter } from './routes/galleryRoutes.js';

export async function initializeBackend() {
  const dbStatus = await connectDatabase();
  await ensureSeededData();
  return dbStatus;
}

export function createBackendApp() {
  const app = express();

  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === allowedOrigin || origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '15mb' }));
  app.use('/data', express.static(BACKEND_DATA_DIR));
  app.use('/api', createGalleryRouter());

  return app;
}
