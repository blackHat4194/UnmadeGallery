/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import { ensureSeededData } from './services/galleryStore.js';

async function runSeed() {
  const status = await connectDatabase();
  await ensureSeededData();
  console.log(`UNMADE GALLERY seed completed successfully (mode: ${status.mode}).`);
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
