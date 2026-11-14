/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
    email: z.string().trim().email('Please provide a valid email address.').max(120),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password is too long.')
  })
  .strip();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please provide a valid email address.'),
    password: z.string().min(1, 'Password is required.').max(128)
  })
  .strip();

// Strictly allows profile contact & delivery fields; never accepts email, role, or id
export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(80),
    phone: z.string().trim().max(24).optional().default(''),
    street: z.string().trim().max(200).optional().default(''),
    city: z.string().trim().max(80).optional().default(''),
    state: z.string().trim().max(80).optional().default(''),
    pincode: z.string().trim().max(12).optional().default('')
  })
  .strip();

export const orderStatusSchema = z
  .object({
    status: z.enum([
      'Order Placed',
      'Resin Pouring & Curing',
      'Hand Polishing & Assembly',
      'Dispatched',
      'Delivered'
    ])
  })
  .strip();

export const customOrderStatusSchema = z
  .object({
    status: z.enum(['Pending Review', 'Artisan Quote Sent', 'In Production', 'Completed'])
  })
  .strip();

export const customOrderCreateSchema = z
  .object({
    id: z.string().trim().optional(),
    requestDate: z.string().trim().optional(),
    clientName: z.string().trim().min(2, 'Name is required.').max(100),
    clientEmail: z.string().trim().email('Valid email is required.').max(120),
    clientPhone: z.string().trim().min(6, 'Valid phone number is required.').max(24),
    itemType: z.string().trim().min(2).max(100),
    flowerInclusions: z.array(z.string().trim().max(80)).min(1),
    metalAccents: z.string().trim().min(2).max(80),
    resinBaseColor: z.string().trim().min(2).max(80),
    personalizedText: z.string().trim().max(120).optional(),
    occasion: z.string().trim().max(100).optional().default('Wedding Keepsake'),
    specialNotes: z.string().trim().max(1000).optional(),
    estimatedPrice: z.number().finite().positive()
  })
  .strip();

export const orderCreateSchema = z
  .object({
    id: z.string().trim().optional(),
    orderNumber: z.string().trim().optional(),
    date: z.string().trim().optional(),
    items: z
      .array(
        z.object({
          product: z.object({
            id: z.string().trim().min(1),
            name: z.string().trim().min(1),
            price: z.number().finite().positive()
          }).passthrough(),
          quantity: z.number().int().min(1).max(50)
        })
      )
      .min(1, 'Order must contain at least one item.'),
    subtotal: z.number().finite().nonnegative(),
    shipping: z.number().finite().nonnegative(),
    tax: z.number().finite().nonnegative(),
    total: z.number().finite().positive(),
    trackingNumber: z.string().trim().max(80).optional(),
    address: z.object({
      fullName: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(120),
      phone: z.string().trim().min(6).max(24),
      street: z.string().trim().min(3).max(200),
      apartment: z.string().trim().max(100).optional(),
      city: z.string().trim().min(2).max(80),
      state: z.string().trim().max(80).optional().default(''),
      pincode: z.string().trim().min(4).max(12),
      country: z.string().trim().max(60).optional().default('India')
    }),
    paymentMethod: z.string().trim().max(120).optional(),
    paymentId: z.string().trim().min(1),
    paymentStatus: z.string().trim().max(40).optional()
  })
  .strip();

export const cartAddItemSchema = z
  .object({
    productId: z.string().trim().min(1, 'Product ID is required.').max(120, 'Invalid product ID.'),
    quantity: z
      .number({ message: 'Quantity must be a whole number.' })
      .int('Quantity must be a whole number.')
      .min(1, 'Quantity must be at least 1.')
      .max(50, 'Maximum 50 units per creation.')
      .optional()
      .default(1)
  })
  .strip();

export const cartUpdateItemSchema = z
  .object({
    quantity: z
      .number({ message: 'Quantity must be a whole number.' })
      .int('Quantity must be a whole number.')
      .min(0, 'Quantity cannot be negative.')
      .max(50, 'Maximum 50 units per creation.')
  })
  .strip();

export function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'body';
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      const firstError = parsed.error.issues[0]?.message || 'Invalid request payload.';
      res.status(400).json({ error: firstError, errors: fieldErrors });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
