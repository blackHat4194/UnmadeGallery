/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { createOrPromoteAdmin } from '../services/galleryStore.js';

function parseCliArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return '';
}

async function run() {
  const email = (parseCliArg('--email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = parseCliArg('--password') || process.env.ADMIN_PASSWORD || '';
  const name = (parseCliArg('--name') || process.env.ADMIN_NAME || 'Studio Admin').trim();

  if (!email || !email.includes('@')) {
    console.error('Usage: node backend/scripts/createAdmin.js --email <admin@domain.com> --password <strong-password>');
    console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    process.exit(1);
  }

  if (!password || password.length < 10) {
    console.error('Admin password must be at least 10 characters long.');
    process.exit(1);
  }

  const dbStatus = await connectDatabase();
  const admin = await createOrPromoteAdmin({ name, email, password });

  console.log(
    `[UNMADE GALLERY] Admin account ready: ${admin.email} (role: ${admin.role}, storage: ${dbStatus.mode})`
  );

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error('Admin bootstrap failed:', err.message);
  process.exit(1);
});
