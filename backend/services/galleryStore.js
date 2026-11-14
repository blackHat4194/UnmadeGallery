/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { getStorageMode } from '../config/db.js';
import { Product } from '../models/Product.js';
import { GalleryConfig } from '../models/GalleryConfig.js';
import { Order } from '../models/Order.js';
import { CustomOrder } from '../models/CustomOrder.js';
import { User } from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import {
  INITIAL_PRODUCTS,
  CUSTOMER_REVIEWS,
  BRAND_VALUES,
  FEATURED_COLLECTIONS,
  STORY_SHOWCASE,
  SEED_ORDERS,
  SEED_CUSTOM_REQUESTS
} from '../data/seedData.js';
import {
  buildProductRecord,
  sanitizeImageFilename,
  cleanupShowcaseOnDelete,
  isUploadPathReferenced,
  validateProductPayload
} from '../utils/productHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKEND_DATA_DIR = path.resolve(__dirname, '..', 'data');
export const UPLOADS_DIR = path.join(BACKEND_DATA_DIR, 'uploads');
const GALLERY_JSON_PATH = path.join(BACKEND_DATA_DIR, 'gallery-data.json');
const ORDERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'orders.json');
const CUSTOM_ORDERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'custom-orders.json');
const USERS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'users.json');

const ALLOWED_IMAGE_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

function sanitizeUser(user) {
  if (!user) return null;
  const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const id = plain.id || (plain._id ? plain._id.toString() : '');
  return {
    id,
    name: plain.name || '',
    email: plain.email || '',
    phone: plain.phone || '',
    street: plain.street || '',
    city: plain.city || '',
    state: plain.state || '',
    pincode: plain.pincode || '',
    role: plain.role === 'admin' ? 'admin' : 'customer'
  };
}

function createDefaultGalleryData() {
  return {
    products: INITIAL_PRODUCTS,
    collections: FEATURED_COLLECTIONS,
    storyShowcase: STORY_SHOWCASE,
    reviews: CUSTOMER_REVIEWS,
    brandValues: BRAND_VALUES
  };
}

function stripMongoFields(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete plain._id;
  delete plain.__v;
  delete plain.createdAt;
  delete plain.updatedAt;
  return plain;
}

async function readJsonFile(filePath, fallbackValue) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), 'utf-8');
    return fallbackValue;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

export async function ensureSeededData() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  if (getStorageMode() === 'mongodb') {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
    }

    const configExists = await GalleryConfig.findOne({ key: 'main' });
    if (!configExists) {
      await GalleryConfig.create({
        key: 'main',
        collections: FEATURED_COLLECTIONS,
        storyShowcase: STORY_SHOWCASE,
        reviews: CUSTOMER_REVIEWS,
        brandValues: BRAND_VALUES
      });
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(SEED_ORDERS);
    }

    const customCount = await CustomOrder.countDocuments();
    if (customCount === 0) {
      await CustomOrder.insertMany(SEED_CUSTOM_REQUESTS);
    }
    return;
  }

  await readJsonFile(GALLERY_JSON_PATH, createDefaultGalleryData());
  await readJsonFile(ORDERS_JSON_PATH, SEED_ORDERS);
  await readJsonFile(CUSTOM_ORDERS_JSON_PATH, SEED_CUSTOM_REQUESTS);
  await readJsonFile(USERS_JSON_PATH, []);
}

export async function saveUploadedPhoto(photoDataUrl, photoFileName, productName) {
  if (!photoDataUrl || typeof photoDataUrl !== 'string') {
    return null;
  }
  const match = photoDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Invalid image format. Please upload a PNG, JPG, WEBP, or GIF image.');
  }
  const mimeType = match[1].toLowerCase();
  const base64Body = match[2];
  const ext = ALLOWED_IMAGE_MIME[mimeType];
  if (!ext) {
    throw new Error('Unsupported image format. Allowed formats: PNG, JPG, WEBP, GIF.');
  }

  const baseTitle = productName || (photoFileName ? photoFileName.replace(/\.[^.]+$/, '') : 'resin-creation');
  const filename = sanitizeImageFilename(baseTitle, ext, Date.now());
  const targetPath = path.join(UPLOADS_DIR, filename);

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(base64Body, 'base64'));
  return `/data/uploads/${filename}`;
}

export async function deleteUnusedUploadFile(galleryData, uploadPath) {
  if (!uploadPath || typeof uploadPath !== 'string' || !uploadPath.startsWith('/data/uploads/')) {
    return;
  }
  if (isUploadPathReferenced(galleryData, uploadPath)) {
    return;
  }
  const safeName = path.basename(uploadPath);
  if (!safeName || safeName === '.gitkeep') {
    return;
  }
  try {
    await fs.unlink(path.join(UPLOADS_DIR, safeName));
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn('Could not unlink unused upload:', safeName, err);
    }
  }
}

function applyShowcaseAssignments(galleryData, product, options = {}) {
  const updatedCollections = (galleryData.collections || []).map((col) => {
    if (col.name === product.collection && product.imageUrl) {
      if (options.useAsCollectionCover || !col.imageUrl) {
        return { ...col, imageUrl: product.imageUrl };
      }
    }
    return col;
  });

  const updatedStory = { ...(galleryData.storyShowcase || STORY_SHOWCASE) };
  if (options.featureInHero) {
    updatedStory.heroProductId = product.id;
  }
  if (options.featureInStory && product.imageUrl) {
    if (updatedStory.primaryStoryImageUrl && updatedStory.primaryStoryImageUrl !== product.imageUrl) {
      updatedStory.secondaryStoryImageUrl = updatedStory.primaryStoryImageUrl;
      updatedStory.secondaryStoryTitle = updatedStory.primaryStoryTitle || '24K Gold Flakes';
      updatedStory.secondaryStorySubtitle = updatedStory.primaryStorySubtitle || 'Suspended in glass depth';
    }
    updatedStory.primaryStoryImageUrl = product.imageUrl;
    updatedStory.primaryStoryTitle = product.name;
    updatedStory.primaryStorySubtitle = product.collection;
  }

  return {
    ...galleryData,
    collections: updatedCollections,
    storyShowcase: updatedStory
  };
}

export async function getGalleryData() {
  if (getStorageMode() === 'mongodb') {
    const [products, configDoc] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).lean(),
      GalleryConfig.findOne({ key: 'main' }).lean()
    ]);
    return {
      products: products.map(stripMongoFields),
      collections: configDoc?.collections || FEATURED_COLLECTIONS,
      storyShowcase: configDoc?.storyShowcase || STORY_SHOWCASE,
      reviews: configDoc?.reviews || CUSTOMER_REVIEWS,
      brandValues: configDoc?.brandValues || BRAND_VALUES
    };
  }

  const data = await readJsonFile(GALLERY_JSON_PATH, createDefaultGalleryData());
  return {
    products: Array.isArray(data.products) ? data.products : INITIAL_PRODUCTS,
    collections: Array.isArray(data.collections) ? data.collections : FEATURED_COLLECTIONS,
    storyShowcase: data.storyShowcase || STORY_SHOWCASE,
    reviews: Array.isArray(data.reviews) ? data.reviews : CUSTOMER_REVIEWS,
    brandValues: Array.isArray(data.brandValues) ? data.brandValues : BRAND_VALUES
  };
}

export async function createProductItem(payload) {
  const currentData = await getGalleryData();
  const validation = validateProductPayload(payload, currentData.products);
  if (!validation.isValid) {
    const firstMsg = Object.values(validation.errors)[0] || 'Invalid product payload.';
    const err = new Error(firstMsg);
    err.status = 400;
    err.errors = validation.errors;
    throw err;
  }

  const uploadedPath = await saveUploadedPhoto(
    payload.photoDataUrl,
    payload.photoFileName,
    payload.name
  );

  const newProduct = buildProductRecord({
    ...payload,
    imageUrl: uploadedPath || payload.imageUrl || undefined
  });

  let nextData = {
    ...currentData,
    products: [newProduct, ...currentData.products]
  };
  nextData = applyShowcaseAssignments(nextData, newProduct, {
    useAsCollectionCover: Boolean(payload.useAsCollectionCover),
    featureInStory: Boolean(payload.featureInStory),
    featureInHero: Boolean(payload.featureInHero)
  });

  if (getStorageMode() === 'mongodb') {
    await Product.create(newProduct);
    await GalleryConfig.findOneAndUpdate(
      { key: 'main' },
      { collections: nextData.collections, storyShowcase: nextData.storyShowcase },
      { upsert: true }
    );
  } else {
    await writeJsonFile(GALLERY_JSON_PATH, nextData);
  }

  return { product: newProduct, galleryData: nextData };
}

export async function updateProductItem(id, payload) {
  const currentData = await getGalleryData();
  const existing = currentData.products.find((p) => p.id === id);
  if (!existing) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  const validation = validateProductPayload({ ...existing, ...payload }, currentData.products, id);
  if (!validation.isValid) {
    const firstMsg = Object.values(validation.errors)[0] || 'Invalid product update payload.';
    const err = new Error(firstMsg);
    err.status = 400;
    err.errors = validation.errors;
    throw err;
  }

  const uploadedPath = await saveUploadedPhoto(
    payload.photoDataUrl,
    payload.photoFileName,
    payload.name || existing.name
  );

  const updatedProduct = buildProductRecord(
    {
      ...payload,
      imageUrl: uploadedPath || payload.imageUrl || existing.imageUrl
    },
    existing
  );

  let nextData = {
    ...currentData,
    products: currentData.products.map((p) => (p.id === id ? updatedProduct : p))
  };

  if (uploadedPath && existing.imageUrl && existing.imageUrl !== updatedProduct.imageUrl) {
    nextData.collections = nextData.collections.map((col) =>
      col.imageUrl === existing.imageUrl ? { ...col, imageUrl: updatedProduct.imageUrl } : col
    );
    if (nextData.storyShowcase?.primaryStoryImageUrl === existing.imageUrl) {
      nextData.storyShowcase = {
        ...nextData.storyShowcase,
        primaryStoryImageUrl: updatedProduct.imageUrl
      };
    }
    if (nextData.storyShowcase?.secondaryStoryImageUrl === existing.imageUrl) {
      nextData.storyShowcase = {
        ...nextData.storyShowcase,
        secondaryStoryImageUrl: updatedProduct.imageUrl
      };
    }
  }

  nextData = applyShowcaseAssignments(nextData, updatedProduct, {
    useAsCollectionCover: Boolean(payload.useAsCollectionCover),
    featureInStory: Boolean(payload.featureInStory),
    featureInHero: Boolean(payload.featureInHero)
  });

  if (getStorageMode() === 'mongodb') {
    await Product.findOneAndUpdate({ id }, updatedProduct, { new: true });
    await GalleryConfig.findOneAndUpdate(
      { key: 'main' },
      { collections: nextData.collections, storyShowcase: nextData.storyShowcase },
      { upsert: true }
    );
  } else {
    await writeJsonFile(GALLERY_JSON_PATH, nextData);
  }

  if (uploadedPath && existing.imageUrl && existing.imageUrl !== updatedProduct.imageUrl) {
    await deleteUnusedUploadFile(nextData, existing.imageUrl);
  }

  return { product: updatedProduct, galleryData: nextData };
}

export async function deleteProductItem(id) {
  const currentData = await getGalleryData();
  const deletedProduct = currentData.products.find((p) => p.id === id);
  if (!deletedProduct) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  const nextData = cleanupShowcaseOnDelete(currentData, deletedProduct);

  if (getStorageMode() === 'mongodb') {
    await Product.deleteOne({ id });
    await GalleryConfig.findOneAndUpdate(
      { key: 'main' },
      { collections: nextData.collections, storyShowcase: nextData.storyShowcase },
      { upsert: true }
    );
  } else {
    await writeJsonFile(GALLERY_JSON_PATH, nextData);
  }

  await deleteUnusedUploadFile(nextData, deletedProduct.imageUrl);
  return { galleryData: nextData };
}

export async function getOrders() {
  if (getStorageMode() === 'mongodb') {
    const docs = await Order.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(stripMongoFields);
  }
  return await readJsonFile(ORDERS_JSON_PATH, SEED_ORDERS);
}

export async function getOrdersForUser(user) {
  if (!user) return [];
  const cleanEmail = String(user.email || '').trim().toLowerCase();
  if (getStorageMode() === 'mongodb') {
    const docs = await Order.find({
      $or: [{ userId: user.id }, { 'address.email': cleanEmail }]
    })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(stripMongoFields);
  }
  const all = await getOrders();
  return all.filter(
    (ord) =>
      (ord.userId && ord.userId === user.id) ||
      String(ord.address?.email || '').trim().toLowerCase() === cleanEmail
  );
}

export async function createOrder(orderPayload, user = null) {
  const record = {
    ...orderPayload,
    id: orderPayload.id || `ord-${Date.now().toString().slice(-6)}`,
    orderNumber: orderPayload.orderNumber || `UG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date:
      orderPayload.date ||
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: 'Order Placed',
    userId: user?.id || null
  };

  if (getStorageMode() === 'mongodb') {
    const created = await Order.create(record);
    return stripMongoFields(created);
  }
  const current = await getOrders();
  const next = [record, ...current];
  await writeJsonFile(ORDERS_JSON_PATH, next);
  return record;
}

export async function updateOrderStatus(id, status) {
  if (getStorageMode() === 'mongodb') {
    const updated = await Order.findOneAndUpdate({ id }, { status }, { new: true }).lean();
    if (!updated) {
      const err = new Error('Order not found.');
      err.status = 404;
      throw err;
    }
    return stripMongoFields(updated);
  }
  const current = await getOrders();
  const exists = current.some((o) => o.id === id);
  if (!exists) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }
  const next = current.map((o) => (o.id === id ? { ...o, status } : o));
  await writeJsonFile(ORDERS_JSON_PATH, next);
  return next.find((o) => o.id === id);
}

export async function getCustomOrders() {
  if (getStorageMode() === 'mongodb') {
    const docs = await CustomOrder.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(stripMongoFields);
  }
  return await readJsonFile(CUSTOM_ORDERS_JSON_PATH, SEED_CUSTOM_REQUESTS);
}

export async function getCustomOrdersForUser(user) {
  if (!user) return [];
  const cleanEmail = String(user.email || '').trim().toLowerCase();
  if (getStorageMode() === 'mongodb') {
    const docs = await CustomOrder.find({
      $or: [{ userId: user.id }, { clientEmail: cleanEmail }]
    })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(stripMongoFields);
  }
  const all = await getCustomOrders();
  return all.filter(
    (req) =>
      (req.userId && req.userId === user.id) ||
      String(req.clientEmail || '').trim().toLowerCase() === cleanEmail
  );
}

export async function createCustomOrder(customPayload, user = null) {
  const record = {
    ...customPayload,
    id: customPayload.id || `cust-${Math.floor(100 + Math.random() * 900)}`,
    requestDate:
      customPayload.requestDate ||
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'Pending Review',
    userId: user?.id || null
  };

  if (getStorageMode() === 'mongodb') {
    const created = await CustomOrder.create(record);
    return stripMongoFields(created);
  }
  const current = await getCustomOrders();
  const next = [record, ...current];
  await writeJsonFile(CUSTOM_ORDERS_JSON_PATH, next);
  return record;
}

export async function updateCustomOrderStatus(id, status) {
  if (getStorageMode() === 'mongodb') {
    const updated = await CustomOrder.findOneAndUpdate({ id }, { status }, { new: true }).lean();
    if (!updated) {
      const err = new Error('Custom commission not found.');
      err.status = 404;
      throw err;
    }
    return stripMongoFields(updated);
  }
  const current = await getCustomOrders();
  const exists = current.some((c) => c.id === id);
  if (!exists) {
    const err = new Error('Custom commission not found.');
    err.status = 404;
    throw err;
  }
  const next = current.map((c) => (c.id === id ? { ...c, status } : c));
  await writeJsonFile(CUSTOM_ORDERS_JSON_PATH, next);
  return next.find((c) => c.id === id);
}

export async function findAuthUserById(userId) {
  if (!userId) return null;
  if (getStorageMode() === 'mongodb') {
    const doc = await User.findById(userId).lean();
    if (!doc) return null;
    return {
      ...sanitizeUser(doc),
      tokenVersion: Number(doc.tokenVersion || 0)
    };
  }
  const users = await readJsonFile(USERS_JSON_PATH, []);
  const found = users.find((u) => u.id === userId);
  if (!found) return null;
  return {
    ...sanitizeUser(found),
    tokenVersion: Number(found.tokenVersion || 0)
  };
}

export async function registerUser({ name, email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!name?.trim() || !cleanEmail.includes('@') || !password || password.length < 8) {
    const err = new Error('Please enter name, valid email, and a password of at least 8 characters.');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (getStorageMode() === 'mongodb') {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.status = 409;
      throw err;
    }
    // Public registration ALWAYS enforces role: 'customer'
    const created = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'customer',
      tokenVersion: 0,
      lastLoginAt: new Date()
    });
    const safeUser = sanitizeUser(created);
    const token = signAuthToken({ ...safeUser, tokenVersion: created.tokenVersion || 0 });
    return { user: safeUser, token };
  }

  const users = await readJsonFile(USERS_JSON_PATH, []);
  if (users.some((u) => u.email === cleanEmail)) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }
  const newUser = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    role: 'customer',
    tokenVersion: 0,
    lastLoginAt: new Date().toISOString()
  };
  await writeJsonFile(USERS_JSON_PATH, [...users, newUser]);
  const safeUser = sanitizeUser(newUser);
  const token = signAuthToken({ ...safeUser, tokenVersion: 0 });
  return { user: safeUser, token };
}

export async function loginUser({ email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    const err = new Error('Email and password are required.');
    err.status = 400;
    throw err;
  }

  if (getStorageMode() === 'mongodb') {
    const found = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }
    found.lastLoginAt = new Date();
    await found.save();
    const safeUser = sanitizeUser(found);
    const token = signAuthToken({ ...safeUser, tokenVersion: found.tokenVersion || 0 });
    return { user: safeUser, token };
  }

  const users = await readJsonFile(USERS_JSON_PATH, []);
  const idx = users.findIndex((u) => u.email === cleanEmail);
  const found = idx >= 0 ? users[idx] : null;
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }
  users[idx] = { ...found, lastLoginAt: new Date().toISOString() };
  await writeJsonFile(USERS_JSON_PATH, users);
  const safeUser = sanitizeUser(users[idx]);
  const token = signAuthToken({ ...safeUser, tokenVersion: Number(found.tokenVersion || 0) });
  return { user: safeUser, token };
}

export async function logoutUser(userId) {
  if (!userId) return;
  if (getStorageMode() === 'mongodb') {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    return;
  }
  const users = await readJsonFile(USERS_JSON_PATH, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    users[idx] = { ...users[idx], tokenVersion: Number(users[idx].tokenVersion || 0) + 1 };
    await writeJsonFile(USERS_JSON_PATH, users);
  }
}

export async function updateUserProfile(userId, profileFields) {
  if (!userId) {
    const err = new Error('Authenticated user ID is required.');
    err.status = 401;
    throw err;
  }

  const allowed = {
    name: String(profileFields.name || '').trim(),
    phone: String(profileFields.phone || '').trim(),
    street: String(profileFields.street || '').trim(),
    city: String(profileFields.city || '').trim(),
    state: String(profileFields.state || '').trim(),
    pincode: String(profileFields.pincode || '').trim()
  };

  if (getStorageMode() === 'mongodb') {
    const updated = await User.findByIdAndUpdate(userId, allowed, { new: true }).lean();
    if (!updated) {
      const err = new Error('Account not found.');
      err.status = 404;
      throw err;
    }
    return sanitizeUser(updated);
  }

  const users = await readJsonFile(USERS_JSON_PATH, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) {
    const err = new Error('Account not found.');
    err.status = 404;
    throw err;
  }
  users[idx] = { ...users[idx], ...allowed };
  await writeJsonFile(USERS_JSON_PATH, users);
  return sanitizeUser(users[idx]);
}

export async function createOrPromoteAdmin({ name, email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail.includes('@') || !password || password.length < 10) {
    throw new Error('Valid admin email and password (min 10 chars) are required.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (getStorageMode() === 'mongodb') {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      existing.name = name || existing.name;
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      await existing.save();
      return sanitizeUser(existing);
    }
    const created = await User.create({
      name: name || 'Studio Admin',
      email: cleanEmail,
      passwordHash,
      role: 'admin',
      tokenVersion: 0
    });
    return sanitizeUser(created);
  }

  const users = await readJsonFile(USERS_JSON_PATH, []);
  const idx = users.findIndex((u) => u.email === cleanEmail);
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      name: name || users[idx].name,
      passwordHash,
      role: 'admin'
    };
    await writeJsonFile(USERS_JSON_PATH, users);
    return sanitizeUser(users[idx]);
  }

  const adminUser = {
    id: `adm-${Date.now()}`,
    name: name || 'Studio Admin',
    email: cleanEmail,
    passwordHash,
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    role: 'admin',
    tokenVersion: 0
  };
  await writeJsonFile(USERS_JSON_PATH, [...users, adminUser]);
  return sanitizeUser(adminUser);
}
