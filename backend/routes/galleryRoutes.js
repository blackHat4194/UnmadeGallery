/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { getStorageMode } from '../config/db.js';
import {
  getGalleryData,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getOrders,
  createOrder,
  updateOrderStatus,
  getCustomOrders,
  createCustomOrder,
  updateCustomOrderStatus,
  registerUser,
  loginUser,
  updateUserProfile
} from '../services/galleryStore.js';

export function createGalleryRouter() {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'unmade-gallery-backend',
      storageMode: getStorageMode()
    });
  });

  // Catalog, Featured Collections, Brand Story Showcase & Reviews
  router.get('/gallery-data', async (_req, res) => {
    try {
      const data = await getGalleryData();
      res.json(data);
    } catch (err) {
      console.error('Failed to load gallery data:', err);
      res.status(500).json({ error: 'Unable to load gallery data.' });
    }
  });

  // Products CRUD + Image Upload
  router.get('/products', async (_req, res) => {
    try {
      const data = await getGalleryData();
      res.json({ products: data.products });
    } catch (err) {
      res.status(500).json({ error: 'Unable to load products.' });
    }
  });

  router.post('/products', async (req, res) => {
    try {
      const result = await createProductItem(req.body || {});
      res.status(201).json(result);
    } catch (err) {
      console.error('Failed to create product:', err);
      res.status(err.status || 400).json({
        error: err.message || 'Unable to create product.',
        ...(err.errors ? { errors: err.errors } : {})
      });
    }
  });

  router.put('/products/:id', async (req, res) => {
    try {
      const result = await updateProductItem(req.params.id, req.body || {});
      res.json(result);
    } catch (err) {
      console.error('Failed to update product:', err);
      res.status(err.status || 400).json({
        error: err.message || 'Unable to update product.',
        ...(err.errors ? { errors: err.errors } : {})
      });
    }
  });

  router.delete('/products/:id', async (req, res) => {
    try {
      const result = await deleteProductItem(req.params.id);
      res.json(result);
    } catch (err) {
      console.error('Failed to delete product:', err);
      res.status(err.status || 500).json({ error: err.message || 'Unable to delete product.' });
    }
  });

  // Orders (Razorpay online-only checkout)
  router.get('/orders', async (_req, res) => {
    try {
      const orders = await getOrders();
      res.json({ orders });
    } catch {
      res.status(500).json({ error: 'Unable to load orders.' });
    }
  });

  router.post('/orders', async (req, res) => {
    try {
      const order = await createOrder(req.body);
      res.status(201).json({ order });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Unable to record order.' });
    }
  });

  router.patch('/orders/:id/status', async (req, res) => {
    try {
      const order = await updateOrderStatus(req.params.id, req.body?.status);
      res.json({ order });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Unable to update order status.' });
    }
  });

  // Bespoke Custom Commissions
  router.get('/custom-orders', async (_req, res) => {
    try {
      const customOrders = await getCustomOrders();
      res.json({ customOrders });
    } catch {
      res.status(500).json({ error: 'Unable to load custom commissions.' });
    }
  });

  router.post('/custom-orders', async (req, res) => {
    try {
      const customOrder = await createCustomOrder(req.body);
      res.status(201).json({ customOrder });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Unable to save custom commission.' });
    }
  });

  router.patch('/custom-orders/:id/status', async (req, res) => {
    try {
      const customOrder = await updateCustomOrderStatus(req.params.id, req.body?.status);
      res.json({ customOrder });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Unable to update commission status.' });
    }
  });

  // Customer Authentication & Profile
  router.post('/auth/register', async (req, res) => {
    try {
      const result = await registerUser(req.body || {});
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message || 'Registration failed.' });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const result = await loginUser(req.body || {});
      res.json(result);
    } catch (err) {
      res.status(err.status || 401).json({ error: err.message || 'Login failed.' });
    }
  });

  router.put('/auth/profile', async (req, res) => {
    try {
      const user = await updateUserProfile(req.body?.email, req.body || {});
      res.json({ user });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Profile update failed.' });
    }
  });

  return router;
}
