/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    collection: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 1 },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 1 },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    resinArtworkType: { type: String, default: 'floral-crystal' },
    imageUrl: { type: String },
    description: { type: String, required: true },
    details: { type: [String], default: [] },
    specifications: {
      materials: { type: String, default: '' },
      inclusions: { type: String, default: '' },
      hardware: { type: String, default: '' },
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
      curingTime: { type: String, default: '' }
    },
    careInstructions: { type: [String], default: [] },
    inStock: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
