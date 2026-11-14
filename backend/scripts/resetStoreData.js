/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../config/env.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDatabase, getStorageMode } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { CustomOrder } from '../models/CustomOrder.js';
import { User } from '../models/User.js';
import { Wishlist } from '../models/Wishlist.js';
import { Cart } from '../models/Cart.js';
import { GalleryConfig } from '../models/GalleryConfig.js';
import {
  BACKEND_DATA_DIR,
  UPLOADS_DIR,
  bootstrapAdminFromEnv,
  ensureSeededData
} from '../services/galleryStore.js';
import { BRAND_VALUES, FEATURED_COLLECTIONS, STORY_SHOWCASE } from '../data/seedData.js';

async function resetStoreData() {
  const status = await connectDatabase();

  if (getStorageMode() === 'mongodb') {
    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      CustomOrder.deleteMany({}),
      Wishlist.deleteMany({}),
      Cart.deleteMany({}),
      User.deleteMany({}),
      GalleryConfig.findOneAndUpdate(
        { key: 'main' },
        {
          key: 'main',
          collections: FEATURED_COLLECTIONS,
          storyShowcase: STORY_SHOWCASE,
          reviews: [],
          brandValues: BRAND_VALUES
        },
        { upsert: true, new: true }
      )
    ]);
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const uploadFiles = await fs.readdir(UPLOADS_DIR).catch(() => []);
  await Promise.all(
    uploadFiles
      .filter((name) => name !== '.gitkeep')
      .map((name) => fs.unlink(path.join(UPLOADS_DIR, name)).catch(() => {}))
  );

  await Promise.all([
    fs.writeFile(
      path.join(BACKEND_DATA_DIR, 'gallery-data.json'),
      JSON.stringify(
        {
          products: [],
          collections: FEATURED_COLLECTIONS,
          storyShowcase: STORY_SHOWCASE,
          reviews: [],
          brandValues: BRAND_VALUES
        },
        null,
        2
      ),
      'utf-8'
    ),
    fs.writeFile(path.join(BACKEND_DATA_DIR, 'orders.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.join(BACKEND_DATA_DIR, 'custom-orders.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.join(BACKEND_DATA_DIR, 'users.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.join(BACKEND_DATA_DIR, 'wishlists.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.join(BACKEND_DATA_DIR, 'carts.json'), '[]\n', 'utf-8')
  ]);

  await ensureSeededData();
  const admin = await bootstrapAdminFromEnv();

  console.log(
    `[UNMADE GALLERY] Store data cleared cleanly (mode: ${status.mode}).${
      admin ? ` Re-bootstrapped env admin: ${admin.email}` : ''
    }`
  );

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

resetStoreData().catch((err) => {
  console.error('Store reset failed:', err);
  process.exit(1);
});
