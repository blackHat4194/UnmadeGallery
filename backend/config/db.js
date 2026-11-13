/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

let currentStorageMode = 'json-fallback';

/**
 * Connects to MongoDB if MONGODB_URI is configured and reachable.
 * Gracefully falls back to JSON file persistence inside backend/data/ when running without MongoDB.
 */
export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || !mongoUri.trim()) {
    currentStorageMode = 'json-fallback';
    console.log('[UNMADE GALLERY] MONGODB_URI not set — running with backend/data/*.json persistence.');
    return { mode: currentStorageMode, connected: false };
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    currentStorageMode = 'mongodb';
    console.log(`[UNMADE GALLERY] Connected to MongoDB: ${mongoose.connection.name}`);
    return { mode: currentStorageMode, connected: true };
  } catch (err) {
    currentStorageMode = 'json-fallback';
    console.warn('[UNMADE GALLERY] MongoDB unreachable, falling back to backend/data/*.json:', err.message);
    return { mode: currentStorageMode, connected: false };
  }
}

export function getStorageMode() {
  return mongoose.connection.readyState === 1 ? 'mongodb' : currentStorageMode;
}
