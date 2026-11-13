/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_PRODUCTS,
  CUSTOMER_REVIEWS,
  BRAND_VALUES,
  FEATURED_COLLECTIONS,
  STORY_SHOWCASE
} from './src/data/products.js';
import {
  buildProductRecord,
  sanitizeImageFilename,
  cleanupShowcaseOnDelete,
  isUploadPathReferenced
} from './src/lib/ecommerceLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const GALLERY_JSON_PATH = path.join(DATA_DIR, 'gallery-data.json');
const PRODUCTS_JS_PATH = path.join(__dirname, 'src', 'data', 'products.js');

const ALLOWED_IMAGE_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

function createDefaultGalleryData() {
  return {
    products: INITIAL_PRODUCTS,
    collections: FEATURED_COLLECTIONS,
    storyShowcase: STORY_SHOWCASE,
    reviews: CUSTOMER_REVIEWS,
    brandValues: BRAND_VALUES
  };
}

async function ensureDataStore() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(GALLERY_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
      collections: Array.isArray(parsed.collections) ? parsed.collections : FEATURED_COLLECTIONS,
      storyShowcase: parsed.storyShowcase || STORY_SHOWCASE,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : CUSTOMER_REVIEWS,
      brandValues: Array.isArray(parsed.brandValues) ? parsed.brandValues : BRAND_VALUES
    };
  } catch {
    const initial = createDefaultGalleryData();
    await fs.writeFile(GALLERY_JSON_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function persistGalleryData(galleryData) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(GALLERY_JSON_PATH, JSON.stringify(galleryData, null, 2), 'utf-8');

  // Keep src/data/products.js synchronized so static JS imports and data/gallery-data.json always match
  const productsJsSource = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INITIAL_PRODUCTS = ${JSON.stringify(galleryData.products, null, 2)};

export const CUSTOMER_REVIEWS = ${JSON.stringify(galleryData.reviews, null, 2)};

export const BRAND_VALUES = ${JSON.stringify(galleryData.brandValues, null, 2)};

export const FEATURED_COLLECTIONS = ${JSON.stringify(galleryData.collections, null, 2)};

export const STORY_SHOWCASE = ${JSON.stringify(galleryData.storyShowcase, null, 2)};
`;

  await fs.writeFile(PRODUCTS_JS_PATH, productsJsSource, 'utf-8');
}

async function saveUploadedPhoto(photoDataUrl, photoFileName, productName) {
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

async function deleteUnusedUploadFile(galleryData, uploadPath) {
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
  const targetPath = path.join(UPLOADS_DIR, safeName);
  try {
    await fs.unlink(targetPath);
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn('Could not unlink unused upload:', targetPath, err);
    }
  }
}

function applyShowcaseAssignments(galleryData, product, options = {}) {
  let updatedCollections = galleryData.collections.map((col) => {
    if (col.name === product.collection && product.imageUrl) {
      if (options.useAsCollectionCover || !col.imageUrl) {
        return { ...col, imageUrl: product.imageUrl };
      }
    }
    return col;
  });

  const updatedStory = { ...galleryData.storyShowcase };
  if (options.featureInHero) {
    updatedStory.heroProductId = product.id;
  }
  if (options.featureInStory && product.imageUrl) {
    // Rotate secondary slot to previous primary, place new creation photo in primary slot
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

async function startServer() {
  await ensureDataStore();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Serve uploaded images and JSON files from data/ directory
  app.use('/data', express.static(DATA_DIR));

  // Fetch complete gallery data (products, collections, storyShowcase, reviews, brandValues)
  app.get('/api/gallery-data', async (_req, res) => {
    try {
      const data = await ensureDataStore();
      res.json(data);
    } catch (err) {
      console.error('Failed to read gallery data:', err);
      res.status(500).json({ error: 'Unable to load gallery data.' });
    }
  });

  // Add new product with optional uploaded photo saved to data/uploads/
  app.post('/api/products', async (req, res) => {
    try {
      const payload = req.body || {};
      if (!payload.name || !String(payload.name).trim()) {
        res.status(400).json({ error: 'Creation name is required.' });
        return;
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

      const currentData = await ensureDataStore();
      let nextData = {
        ...currentData,
        products: [newProduct, ...currentData.products]
      };
      nextData = applyShowcaseAssignments(nextData, newProduct, {
        useAsCollectionCover: Boolean(payload.useAsCollectionCover),
        featureInStory: Boolean(payload.featureInStory),
        featureInHero: Boolean(payload.featureInHero)
      });

      await persistGalleryData(nextData);
      res.status(201).json({ product: newProduct, galleryData: nextData });
    } catch (err) {
      console.error('Failed to create product:', err);
      res.status(400).json({ error: err?.message || 'Unable to save product.' });
    }
  });

  // Update existing product details and optionally replace uploaded photo
  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body || {};
      const currentData = await ensureDataStore();
      const existing = currentData.products.find((p) => p.id === id);

      if (!existing) {
        res.status(404).json({ error: 'Product not found.' });
        return;
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

      // Update any existing collection or story references if an uploaded photo was replaced
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

      await persistGalleryData(nextData);
      if (uploadedPath && existing.imageUrl && existing.imageUrl !== updatedProduct.imageUrl) {
        await deleteUnusedUploadFile(nextData, existing.imageUrl);
      }
      res.json({ product: updatedProduct, galleryData: nextData });
    } catch (err) {
      console.error('Failed to update product:', err);
      res.status(400).json({ error: err?.message || 'Unable to update product.' });
    }
  });

  // Delete product and clean up showcase references + unreferenced uploaded photos
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const currentData = await ensureDataStore();
      const deletedProduct = currentData.products.find((p) => p.id === id);
      if (!deletedProduct) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      const nextData = cleanupShowcaseOnDelete(currentData, deletedProduct);
      await persistGalleryData(nextData);
      await deleteUnusedUploadFile(nextData, deletedProduct.imageUrl);
      res.json({ galleryData: nextData });
    } catch (err) {
      console.error('Failed to delete product:', err);
      res.status(500).json({ error: 'Unable to delete product.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null
      },
      appType: 'spa'
    });

    // When HMR is disabled, serve a clean no-WebSocket client shim supporting CSS/React Refresh helpers
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();
const linkSheetsMap = new Map();
if (typeof document !== 'undefined') {
  document.querySelectorAll('style[data-vite-dev-id]').forEach((el) => {
    sheetsMap.set(el.getAttribute('data-vite-dev-id'), el);
  });
  document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]').forEach((el) => {
    linkSheetsMap.set(el.getAttribute('data-vite-dev-id'), el);
  });
}
export function updateStyle(id, content) {
  if (linkSheetsMap.has(id)) return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  if (linkSheetsMap.has(id)) {
    document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id="' + CSS.escape(id) + '"]').forEach((el) => el.remove());
    linkSheetsMap.delete(id);
  }
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
const noop = () => {};
export function createHotContext() {
  return {
    data: {},
    accept: noop,
    acceptExports: noop,
    dispose: noop,
    prune: noop,
    decline: noop,
    invalidate: noop,
    on: noop,
    off: noop,
    send: noop,
  };
}
export function injectQuery(url, queryToInject) {
  if (url[0] !== '.' && url[0] !== '/') return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export class ErrorOverlay {}
`);
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UNMADE GALLERY server listening on http://localhost:${PORT}`);
  });
}

startServer();
