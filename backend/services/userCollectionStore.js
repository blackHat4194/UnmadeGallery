/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { getStorageMode } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Wishlist } from '../models/Wishlist.js';
import { Cart } from '../models/Cart.js';
import { INITIAL_PRODUCTS } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DATA_DIR = path.resolve(__dirname, '..', 'data');
const GALLERY_JSON_PATH = path.join(BACKEND_DATA_DIR, 'gallery-data.json');
const WISHLISTS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'wishlists.json');
const CARTS_JSON_PATH = path.join(BACKEND_DATA_DIR, 'carts.json');

const fileLocks = new Map();

function runWithLock(lockKey, task) {
  const previous = fileLocks.get(lockKey) || Promise.resolve();
  const next = previous.then(task);
  const tracked = next.catch(() => {}).then(() => {
    if (fileLocks.get(lockKey) === tracked) {
      fileLocks.delete(lockKey);
    }
  });
  fileLocks.set(lockKey, tracked);
  return next;
}

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
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
  await fs.mkdir(BACKEND_DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), 'utf-8');
    return fallbackValue;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.mkdir(BACKEND_DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

async function readCatalogProductsJson() {
  try {
    const raw = await fs.readFile(GALLERY_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function validateProductIdParam(rawProductId) {
  const clean = String(rawProductId || '').trim();
  if (!clean || clean.length > 120 || /\s/.test(clean) || !/^[a-zA-Z0-9_-]+$/.test(clean)) {
    throw createHttpError(400, 'Invalid product ID.');
  }
  return clean;
}

function toUserObjectId(userId) {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw createHttpError(401, 'Invalid authenticated user identifier.');
  }
  return new mongoose.Types.ObjectId(userId);
}

async function upsertWithDuplicateRetry(operation) {
  try {
    return await operation();
  } catch (err) {
    if (err?.code === 11000) {
      return await operation();
    }
    throw err;
  }
}

async function resolveCatalogProduct(rawProductId) {
  const cleanId = validateProductIdParam(rawProductId);

  if (getStorageMode() === 'mongodb') {
    const query = mongoose.isValidObjectId(cleanId)
      ? { $or: [{ id: cleanId }, { _id: cleanId }] }
      : { id: cleanId };
    const productDoc = await Product.findOne(query);
    if (!productDoc) {
      throw createHttpError(404, 'Product not found in gallery catalog.');
    }
    return productDoc;
  }

  const products = await readCatalogProductsJson();
  const product = products.find((p) => p.id === cleanId);
  if (!product) {
    throw createHttpError(404, 'Product not found in gallery catalog.');
  }
  return product;
}

function assertProductAvailableForCart(productDoc, targetQuantity) {
  const availableStock = Math.max(0, Number(productDoc.stock ?? 0));
  if (productDoc.inStock === false || availableStock <= 0) {
    throw createHttpError(400, `"${productDoc.name}" is currently sold out.`);
  }
  if (targetQuantity > availableStock) {
    throw createHttpError(
      409,
      `Only ${availableStock} ${availableStock === 1 ? 'piece' : 'pieces'} of "${productDoc.name}" available in studio stock.`
    );
  }
}

function formatCartPayload(resolvedItems) {
  const items = resolvedItems.map((entry) => {
    const cleanProduct = stripMongoFields(entry.product);
    const qty = Math.max(1, Number(entry.quantity || 1));
    const unitPrice = Number(cleanProduct.price || 0);
    return {
      product: cleanProduct,
      quantity: qty,
      addedAt: entry.addedAt || new Date().toISOString(),
      lineTotal: unitPrice * qty
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    itemCount
  };
}

export async function getUserWishlist(userId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    const wishlistDoc = await Wishlist.findOne({ user: userObjId }).populate('products').lean();
    if (!wishlistDoc) {
      return { products: [], productIds: [] };
    }

    const validProducts = (wishlistDoc.products || []).filter((p) => p && p.id);
    if (validProducts.length !== (wishlistDoc.products || []).length) {
      await Wishlist.updateOne(
        { user: userObjId },
        { $set: { products: validProducts.map((p) => p._id) } }
      );
    }

    const cleanProducts = validProducts.map(stripMongoFields);
    return {
      products: cleanProducts,
      productIds: cleanProducts.map((p) => p.id)
    };
  }

  return await runWithLock('wishlists', async () => {
    const [wishlists, catalogProducts] = await Promise.all([
      readJsonFile(WISHLISTS_JSON_PATH, []),
      readCatalogProductsJson()
    ]);
    const entry = wishlists.find((w) => w.user === userId);
    if (!entry) {
      return { products: [], productIds: [] };
    }

    const catalogMap = new Map(catalogProducts.map((p) => [p.id, p]));
    const seen = new Set();
    const validProducts = [];
    for (const pid of entry.products || []) {
      if (!seen.has(pid) && catalogMap.has(pid)) {
        seen.add(pid);
        validProducts.push(catalogMap.get(pid));
      }
    }

    return {
      products: validProducts,
      productIds: validProducts.map((p) => p.id)
    };
  });
}

export async function addProductToWishlist(userId, rawProductId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  const productDoc = await resolveCatalogProduct(rawProductId);

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    await upsertWithDuplicateRetry(() =>
      Wishlist.findOneAndUpdate(
        { user: userObjId },
        { $addToSet: { products: productDoc._id } },
        { upsert: true, new: true }
      )
    );
    const wishlist = await getUserWishlist(userId);
    return { added: true, ...wishlist };
  }

  await runWithLock('wishlists', async () => {
    const wishlists = await readJsonFile(WISHLISTS_JSON_PATH, []);
    const now = new Date().toISOString();
    const idx = wishlists.findIndex((w) => w.user === userId);

    if (idx < 0) {
      wishlists.push({
        user: userId,
        products: [productDoc.id],
        createdAt: now,
        updatedAt: now
      });
    } else {
      const existingIds = Array.isArray(wishlists[idx].products) ? wishlists[idx].products : [];
      if (!existingIds.includes(productDoc.id)) {
        wishlists[idx] = {
          ...wishlists[idx],
          products: [...existingIds, productDoc.id],
          updatedAt: now
        };
      }
    }

    await writeJsonFile(WISHLISTS_JSON_PATH, wishlists);
  });

  const wishlist = await getUserWishlist(userId);
  return { added: true, ...wishlist };
}

export async function removeProductFromWishlist(userId, rawProductId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  const productDoc = await resolveCatalogProduct(rawProductId);

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    await Wishlist.findOneAndUpdate(
      { user: userObjId },
      { $pull: { products: productDoc._id } },
      { new: true }
    );
    const wishlist = await getUserWishlist(userId);
    return { removed: true, ...wishlist };
  }

  await runWithLock('wishlists', async () => {
    const wishlists = await readJsonFile(WISHLISTS_JSON_PATH, []);
    const idx = wishlists.findIndex((w) => w.user === userId);
    if (idx >= 0) {
      wishlists[idx] = {
        ...wishlists[idx],
        products: (wishlists[idx].products || []).filter((pid) => pid !== productDoc.id),
        updatedAt: new Date().toISOString()
      };
      await writeJsonFile(WISHLISTS_JSON_PATH, wishlists);
    }
  });

  const wishlist = await getUserWishlist(userId);
  return { removed: true, ...wishlist };
}

export async function clearUserWishlist(userId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    await Wishlist.findOneAndUpdate(
      { user: userObjId },
      { $set: { products: [] } },
      { new: true }
    );
    return { products: [], productIds: [] };
  }

  await runWithLock('wishlists', async () => {
    const wishlists = await readJsonFile(WISHLISTS_JSON_PATH, []);
    const idx = wishlists.findIndex((w) => w.user === userId);
    if (idx >= 0) {
      wishlists[idx] = {
        ...wishlists[idx],
        products: [],
        updatedAt: new Date().toISOString()
      };
      await writeJsonFile(WISHLISTS_JSON_PATH, wishlists);
    }
  });

  return { products: [], productIds: [] };
}

export async function getUserCart(userId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    const cartDoc = await Cart.findOne({ user: userObjId }).populate('items.product').lean();
    if (!cartDoc) {
      return { items: [], subtotal: 0, itemCount: 0 };
    }

    const rawItems = cartDoc.items || [];
    const validItems = rawItems.filter((item) => item.product && item.product.id);
    if (validItems.length !== rawItems.length) {
      await Cart.updateOne(
        { user: userObjId },
        {
          $set: {
            items: validItems.map((item) => ({
              product: item.product._id,
              quantity: item.quantity,
              addedAt: item.addedAt
            }))
          }
        }
      );
    }

    return formatCartPayload(validItems);
  }

  return await runWithLock('carts', async () => {
    const [carts, catalogProducts] = await Promise.all([
      readJsonFile(CARTS_JSON_PATH, []),
      readCatalogProductsJson()
    ]);
    const entry = carts.find((c) => c.user === userId);
    if (!entry) {
      return { items: [], subtotal: 0, itemCount: 0 };
    }

    const catalogMap = new Map(catalogProducts.map((p) => [p.id, p]));
    const resolvedItems = [];
    for (const item of entry.items || []) {
      const product = catalogMap.get(item.product);
      if (product) {
        resolvedItems.push({
          product,
          quantity: item.quantity,
          addedAt: item.addedAt
        });
      }
    }

    return formatCartPayload(resolvedItems);
  });
}

export async function addCartItem(userId, rawProductId, quantity = 1) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  const parsedQty = Number(quantity);
  if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 50) {
    throw createHttpError(400, 'Quantity must be a whole number between 1 and 50.');
  }

  const productDoc = await resolveCatalogProduct(rawProductId);

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    let cartDoc = await upsertWithDuplicateRetry(() =>
      Cart.findOneAndUpdate(
        { user: userObjId },
        { $setOnInsert: { user: userObjId, items: [] } },
        { upsert: true, new: true }
      )
    );

    const existingIdx = cartDoc.items.findIndex(
      (item) => item.product.toString() === productDoc._id.toString()
    );
    const existingQty = existingIdx >= 0 ? Number(cartDoc.items[existingIdx].quantity || 0) : 0;
    const nextQty = existingQty + parsedQty;

    assertProductAvailableForCart(productDoc, nextQty);

    if (existingIdx >= 0) {
      cartDoc.items[existingIdx].quantity = nextQty;
    } else {
      cartDoc.items.push({
        product: productDoc._id,
        quantity: nextQty,
        addedAt: new Date()
      });
    }

    await cartDoc.save();
    return await getUserCart(userId);
  }

  await runWithLock('carts', async () => {
    const carts = await readJsonFile(CARTS_JSON_PATH, []);
    const now = new Date().toISOString();
    let cartIdx = carts.findIndex((c) => c.user === userId);
    if (cartIdx < 0) {
      carts.push({
        user: userId,
        items: [],
        createdAt: now,
        updatedAt: now
      });
      cartIdx = carts.length - 1;
    }

    const items = Array.isArray(carts[cartIdx].items) ? [...carts[cartIdx].items] : [];
    const existingIdx = items.findIndex((item) => item.product === productDoc.id);
    const existingQty = existingIdx >= 0 ? Number(items[existingIdx].quantity || 0) : 0;
    const nextQty = existingQty + parsedQty;

    assertProductAvailableForCart(productDoc, nextQty);

    if (existingIdx >= 0) {
      items[existingIdx] = {
        ...items[existingIdx],
        quantity: nextQty
      };
    } else {
      items.push({
        product: productDoc.id,
        quantity: nextQty,
        addedAt: now
      });
    }

    carts[cartIdx] = {
      ...carts[cartIdx],
      items,
      updatedAt: now
    };
    await writeJsonFile(CARTS_JSON_PATH, carts);
  });

  return await getUserCart(userId);
}

export async function updateCartItemQuantity(userId, rawProductId, quantity) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  const parsedQty = Number(quantity);
  if (!Number.isInteger(parsedQty) || parsedQty < 0 || parsedQty > 50) {
    throw createHttpError(400, 'Quantity must be a whole number between 0 and 50.');
  }

  const productDoc = await resolveCatalogProduct(rawProductId);

  if (parsedQty === 0) {
    return await removeCartItem(userId, productDoc.id);
  }

  assertProductAvailableForCart(productDoc, parsedQty);

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    const cartDoc = await Cart.findOne({ user: userObjId });
    if (!cartDoc) {
      throw createHttpError(404, 'Product is not in your shopping bag.');
    }

    const existingIdx = cartDoc.items.findIndex(
      (item) => item.product.toString() === productDoc._id.toString()
    );
    if (existingIdx < 0) {
      throw createHttpError(404, 'Product is not in your shopping bag.');
    }

    cartDoc.items[existingIdx].quantity = parsedQty;
    await cartDoc.save();
    return await getUserCart(userId);
  }

  await runWithLock('carts', async () => {
    const carts = await readJsonFile(CARTS_JSON_PATH, []);
    const cartIdx = carts.findIndex((c) => c.user === userId);
    if (cartIdx < 0) {
      throw createHttpError(404, 'Product is not in your shopping bag.');
    }

    const items = Array.isArray(carts[cartIdx].items) ? [...carts[cartIdx].items] : [];
    const existingIdx = items.findIndex((item) => item.product === productDoc.id);
    if (existingIdx < 0) {
      throw createHttpError(404, 'Product is not in your shopping bag.');
    }

    items[existingIdx] = {
      ...items[existingIdx],
      quantity: parsedQty
    };
    carts[cartIdx] = {
      ...carts[cartIdx],
      items,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile(CARTS_JSON_PATH, carts);
  });

  return await getUserCart(userId);
}

export async function removeCartItem(userId, rawProductId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  const productDoc = await resolveCatalogProduct(rawProductId);

  if (getStorageMode() === 'mongodb') {
    const userObjId = toUserObjectId(userId);
    await Cart.findOneAndUpdate(
      { user: userObjId },
      { $pull: { items: { product: productDoc._id } } },
      { new: true }
    );
    return await getUserCart(userId);
  }

  await runWithLock('carts', async () => {
    const carts = await readJsonFile(CARTS_JSON_PATH, []);
    const cartIdx = carts.findIndex((c) => c.user === userId);
    if (cartIdx >= 0) {
      carts[cartIdx] = {
        ...carts[cartIdx],
        items: (carts[cartIdx].items || []).filter((item) => item.product !== productDoc.id),
        updatedAt: new Date().toISOString()
      };
      await writeJsonFile(CARTS_JSON_PATH, carts);
    }
  });

  return await getUserCart(userId);
}

export async function clearUserCart(userId) {
  if (!userId) {
    throw createHttpError(401, 'Authentication required.');
  }

  if (getStorageMode() === 'mongodb') {
    if (!mongoose.isValidObjectId(userId)) {
      return { items: [], subtotal: 0, itemCount: 0 };
    }
    const userObjId = new mongoose.Types.ObjectId(userId);
    await Cart.findOneAndUpdate(
      { user: userObjId },
      { $set: { items: [] } },
      { new: true }
    );
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  await runWithLock('carts', async () => {
    const carts = await readJsonFile(CARTS_JSON_PATH, []);
    const cartIdx = carts.findIndex((c) => c.user === userId);
    if (cartIdx >= 0) {
      carts[cartIdx] = {
        ...carts[cartIdx],
        items: [],
        updatedAt: new Date().toISOString()
      };
      await writeJsonFile(CARTS_JSON_PATH, carts);
    }
  });

  return { items: [], subtotal: 0, itemCount: 0 };
}
