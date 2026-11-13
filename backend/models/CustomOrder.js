/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    requestDate: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientPhone: { type: String, required: true },
    itemType: { type: String, required: true },
    flowerInclusions: { type: [String], default: [] },
    metalAccents: { type: String, required: true },
    resinBaseColor: { type: String, required: true },
    personalizedText: { type: String },
    occasion: { type: String, default: 'Wedding Keepsake' },
    specialNotes: { type: String },
    estimatedPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending Review', 'Artisan Quote Sent', 'In Production', 'Completed'],
      default: 'Pending Review'
    }
  },
  { timestamps: true }
);

export const CustomOrder =
  mongoose.models.CustomOrder || mongoose.model('CustomOrder', customOrderSchema);
