/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true, default: null },
    orderNumber: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    items: { type: [mongoose.Schema.Types.Mixed], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'Order Placed',
        'Resin Pouring & Curing',
        'Hand Polishing & Assembly',
        'Dispatched',
        'Delivered'
      ],
      default: 'Order Placed'
    },
    trackingNumber: { type: String, default: '' },
    address: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    paymentMethod: { type: String, default: 'Razorpay Online (UPI / Card / NetBanking)' },
    paymentId: { type: String, required: true },
    paymentStatus: { type: String, default: 'PAID' }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
