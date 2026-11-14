/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { getStorageMode } from '../config/db.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { createAuthRateLimiter, createSensitiveRateLimiter } from '../middleware/rateLimiters.js';
import {
  validateBody,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  orderStatusSchema,
  customOrderStatusSchema,
  customOrderCreateSchema,
  orderCreateSchema
} from '../middleware/validate.js';
import { apiNotFoundHandler } from '../middleware/errorHandler.js';
import {
  getGalleryData,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getOrders,
  getOrdersForUser,
  createOrder,
  updateOrderStatus,
  getCustomOrders,
  getCustomOrdersForUser,
  createCustomOrder,
  updateCustomOrderStatus,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile
} from '../services/galleryStore.js';

export function createGalleryRouter(options = {}) {
  const router = express.Router();
  const authLimiter = options.authLimiter || createAuthRateLimiter();
  const sensitiveLimiter = options.sensitiveLimiter || createSensitiveRateLimiter();

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'unmade-gallery-backend',
      storageMode: getStorageMode()
    });
  });

  // Public Catalog, Featured Collections, Brand Story Showcase & Reviews
  router.get('/gallery-data', async (_req, res, next) => {
    try {
      const data = await getGalleryData();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/products', async (_req, res, next) => {
    try {
      const data = await getGalleryData();
      res.json({ products: data.products });
    } catch (err) {
      next(err);
    }
  });

  // Admin-Protected Product CRUD + Image Upload
  router.post('/products', requireAuth, requireAdmin, sensitiveLimiter, async (req, res, next) => {
    try {
      const result = await createProductItem(req.body || {});
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/products/:id', requireAuth, requireAdmin, sensitiveLimiter, async (req, res, next) => {
    try {
      const result = await updateProductItem(req.params.id, req.body || {});
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/products/:id', requireAuth, requireAdmin, sensitiveLimiter, async (req, res, next) => {
    try {
      const result = await deleteProductItem(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // Orders: Admin-only full list & status updates; customer-scoped personal orders
  router.get('/orders', requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const orders = await getOrders();
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  });

  router.get('/orders/my', requireAuth, async (req, res, next) => {
    try {
      const orders = await getOrdersForUser(req.user);
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/orders',
    optionalAuth,
    sensitiveLimiter,
    validateBody(orderCreateSchema),
    async (req, res, next) => {
      try {
        const order = await createOrder(req.body, req.user);
        res.status(201).json({ order });
      } catch (err) {
        next(err);
      }
    }
  );

  router.patch(
    '/orders/:id/status',
    requireAuth,
    requireAdmin,
    sensitiveLimiter,
    validateBody(orderStatusSchema),
    async (req, res, next) => {
      try {
        const order = await updateOrderStatus(req.params.id, req.body.status);
        res.json({ order });
      } catch (err) {
        next(err);
      }
    }
  );

  // Bespoke Custom Commissions: Admin-only full list & status updates; customer-scoped personal list
  router.get('/custom-orders', requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const customOrders = await getCustomOrders();
      res.json({ customOrders });
    } catch (err) {
      next(err);
    }
  });

  router.get('/custom-orders/my', requireAuth, async (req, res, next) => {
    try {
      const customOrders = await getCustomOrdersForUser(req.user);
      res.json({ customOrders });
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/custom-orders',
    optionalAuth,
    sensitiveLimiter,
    validateBody(customOrderCreateSchema),
    async (req, res, next) => {
      try {
        const customOrder = await createCustomOrder(req.body, req.user);
        res.status(201).json({ customOrder });
      } catch (err) {
        next(err);
      }
    }
  );

  router.patch(
    '/custom-orders/:id/status',
    requireAuth,
    requireAdmin,
    sensitiveLimiter,
    validateBody(customOrderStatusSchema),
    async (req, res, next) => {
      try {
        const customOrder = await updateCustomOrderStatus(req.params.id, req.body.status);
        res.json({ customOrder });
      } catch (err) {
        next(err);
      }
    }
  );

  // Authentication & Strictly Authenticated User Profile
  router.post(
    '/auth/register',
    authLimiter,
    validateBody(registerSchema),
    async (req, res, next) => {
      try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    '/auth/login',
    authLimiter,
    validateBody(loginSchema),
    async (req, res, next) => {
      try {
        const result = await loginUser(req.body);
        res.json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  router.get('/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  router.post('/auth/logout', requireAuth, async (req, res, next) => {
    try {
      await logoutUser(req.user.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    '/auth/profile',
    requireAuth,
    sensitiveLimiter,
    validateBody(profileUpdateSchema),
    async (req, res, next) => {
      try {
        // Strictly updates the authenticated user ID from verified JWT
        const user = await updateUserProfile(req.user.id, req.body);
        res.json({ user });
      } catch (err) {
        next(err);
      }
    }
  );

  router.use(apiNotFoundHandler);
  return router;
}
