/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

const galleryConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    collections: { type: [mongoose.Schema.Types.Mixed], default: [] },
    storyShowcase: { type: mongoose.Schema.Types.Mixed, default: {} },
    reviews: { type: [mongoose.Schema.Types.Mixed], default: [] },
    brandValues: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { timestamps: true }
);

export const GalleryConfig =
  mongoose.models.GalleryConfig || mongoose.model('GalleryConfig', galleryConfigSchema);
