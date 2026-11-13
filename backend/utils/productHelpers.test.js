/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeImageFilename,
  buildProductRecord,
  validateProductPayload,
  isUploadPathReferenced,
  cleanupShowcaseOnDelete
} from './productHelpers.js';

test('sanitizeImageFilename normalizes product titles and extensions safely', () => {
  const filename = sanitizeImageFilename('Aura Botanical Pendant (Gold)!', 'PNG', 1730000000);
  assert.equal(filename, 'aura-botanical-pendant-gold-1730000000.png');

  const fallback = sanitizeImageFilename('   ', '', 12345);
  assert.equal(fallback, 'resin-creation-12345.png');
});

test('validateProductPayload catches invalid prices, duplicates, and short descriptions', () => {
  const existing = [{ id: 'unmade-001', name: 'Aura Botanical Pendant' }];

  const invalid = validateProductPayload(
    {
      name: 'Aura Botanical Pendant',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 0,
      originalPrice: 100,
      stock: -2,
      description: 'Short'
    },
    existing
  );

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.price);
  assert.ok(invalid.errors.stock);
  assert.ok(invalid.errors.description);

  const valid = validateProductPayload(
    {
      name: 'Sunlit Amber Ring',
      category: 'Floral Jewellery',
      collection: 'Golden Details',
      price: 2100,
      originalPrice: 2600,
      stock: 4,
      description: 'Hand-poured botanical resin ring with suspended 24k gold leaf.'
    },
    existing
  );
  assert.equal(valid.isValid, true);
});

test('buildProductRecord builds complete normalized product defaults and stock status', () => {
  const record = buildProductRecord({
    id: 'unmade-999',
    name: 'Moonlit Fern Tray',
    category: 'Home Decor',
    collection: 'Emerald Collection',
    price: 3400,
    stock: 0,
    imageUrl: '/data/uploads/moonlit-fern.png'
  });

  assert.equal(record.id, 'unmade-999');
  assert.equal(record.resinArtworkType, 'emerald-gold');
  assert.equal(record.inStock, false);
  assert.equal(record.imageUrl, '/data/uploads/moonlit-fern.png');
});

test('cleanupShowcaseOnDelete and isUploadPathReferenced remove stale collection and story links', () => {
  const uploadUrl = '/data/uploads/deleted-piece.png';
  const galleryData = {
    products: [
      { id: 'unmade-001', name: 'Aura Botanical Pendant', collection: 'Floral Elegance' },
      { id: 'unmade-900', name: 'Temp Piece', collection: 'Floral Elegance', imageUrl: uploadUrl }
    ],
    collections: [
      { id: 'col-1', name: 'Floral Elegance', imageUrl: uploadUrl }
    ],
    storyShowcase: {
      heroProductId: 'unmade-900',
      primaryStoryImageUrl: uploadUrl,
      primaryStoryTitle: 'Temp Piece',
      primaryStorySubtitle: 'Floral Elegance'
    }
  };

  assert.equal(isUploadPathReferenced(galleryData, uploadUrl), true);

  const cleaned = cleanupShowcaseOnDelete(galleryData, galleryData.products[1]);
  assert.equal(cleaned.products.length, 1);
  assert.equal(cleaned.collections[0].imageUrl, undefined);
  assert.equal(cleaned.storyShowcase.heroProductId, 'unmade-001');
  assert.equal(cleaned.storyShowcase.primaryStoryImageUrl, undefined);
  assert.equal(isUploadPathReferenced(cleaned, uploadUrl), false);
});
