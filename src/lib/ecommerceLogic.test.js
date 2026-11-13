/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderSummary,
  estimateCustomOrderPrice,
  formatINR,
  sortProducts,
  sanitizeImageFilename,
  buildProductRecord,
  resolveFeaturedCollections,
  resolveStoryShowcase,
  cleanupShowcaseOnDelete,
  isUploadPathReferenced,
  validateProductInput
} from './ecommerceLogic.js';

const mockProduct = {
  id: 'test-1',
  name: 'Test Resin Ring',
  subtitle: 'Subtitle',
  category: 'Floral Jewellery',
  collection: 'Floral Elegance',
  price: 2000,
  stock: 10,
  rating: 5,
  reviewCount: 1,
  description: 'Desc',
  details: [],
  specifications: {
    materials: 'Resin',
    inclusions: 'Flowers',
    hardware: 'Gold',
    dimensions: '20mm',
    weight: '5g',
    curingTime: '48h'
  },
  careInstructions: [],
  resinArtworkType: 'floral-crystal',
  inStock: true
};

const sampleList = [
  { ...mockProduct, id: 'unmade-001', name: 'Alpha Piece', price: 3000, rating: 4.8, reviewCount: 10, isBestSeller: false, isNewArrival: false },
  { ...mockProduct, id: 'unmade-002', name: 'Beta Piece', price: 1500, rating: 4.9, reviewCount: 50, isBestSeller: true, isNewArrival: false },
  { ...mockProduct, id: 'unmade-003', name: 'Gamma Piece', price: 4500, rating: 5.0, reviewCount: 20, isBestSeller: false, isNewArrival: true }
];

test('sortProducts sorts by price-asc correctly', () => {
  const sorted = sortProducts(sampleList, 'price-asc');
  assert.equal(sorted[0].name, 'Beta Piece'); // 1500
  assert.equal(sorted[1].name, 'Alpha Piece'); // 3000
  assert.equal(sorted[2].name, 'Gamma Piece'); // 4500
});

test('sortProducts sorts by price-desc correctly', () => {
  const sorted = sortProducts(sampleList, 'price-desc');
  assert.equal(sorted[0].name, 'Gamma Piece'); // 4500
  assert.equal(sorted[1].name, 'Alpha Piece'); // 3000
  assert.equal(sorted[2].name, 'Beta Piece'); // 1500
});

test('sortProducts sorts by newest correctly, placing new arrivals first', () => {
  const sorted = sortProducts(sampleList, 'newest');
  assert.equal(sorted[0].name, 'Gamma Piece'); // isNewArrival: true
});

test('sortProducts sorts by popularity prioritizing bestsellers and review metrics', () => {
  const sorted = sortProducts(sampleList, 'popularity');
  assert.equal(sorted[0].name, 'Beta Piece'); // isBestSeller: true
});

test('calculateOrderSummary calculates correct subtotal and applies shipping when under threshold', () => {
  const items = [
    { product: mockProduct, quantity: 1 } // ₹2,000 (< ₹3,000)
  ];
  const summary = calculateOrderSummary(items);
  assert.equal(summary.subtotal, 2000);
  assert.equal(summary.isFreeShipping, false);
  assert.equal(summary.shipping, 250);
  assert.equal(summary.amountToFreeShipping, 1000);
  assert.equal(summary.tax, Math.round(2000 * 0.03));
  assert.equal(summary.total, 2000 + 250 + 60);
});

test('calculateOrderSummary grants free shipping when above ₹3,000', () => {
  const items = [
    { product: mockProduct, quantity: 2 } // ₹4,000 (>= ₹3,000)
  ];
  const summary = calculateOrderSummary(items);
  assert.equal(summary.subtotal, 4000);
  assert.equal(summary.isFreeShipping, true);
  assert.equal(summary.shipping, 0);
  assert.equal(summary.amountToFreeShipping, 0);
});

test('calculateOrderSummary applies FIRSTSTORY discount code correctly', () => {
  const items = [
    { product: mockProduct, quantity: 2 } // ₹4,000
  ];
  const summary = calculateOrderSummary(items, 'FIRSTSTORY');
  assert.equal(summary.discount, 400); // 10%
  assert.equal(summary.discountedSubtotal, 3600);
  assert.equal(summary.isFreeShipping, true);
});

test('estimateCustomOrderPrice accurately prices botanical keepsakes', () => {
  const price = estimateCustomOrderPrice({
    itemType: 'Pyramid Keepsake',
    flowerCount: 2, // 1 additional flower (+350)
    metalAccents: '24k Gold Leaf', // (+600)
    hasPersonalizedText: true // (+450)
  });
  // 4500 base + 350 + 600 + 450 = 5900
  assert.equal(price, 5900);
});

test('formatINR formats currency strings with Indian formatting', () => {
  const formatted = formatINR(2450);
  assert.ok(formatted.includes('2,450') || formatted.includes('₹'));
});

test('sanitizeImageFilename builds clean kebab-case file names', () => {
  const fname = sanitizeImageFilename('Celestial Golden Fern Pendant!', 'PNG', 12345);
  assert.equal(fname, 'celestial-golden-fern-pendant-12345.png');
});

test('buildProductRecord preserves imageUrl, stock flags, and collection artwork fallback', () => {
  const built = buildProductRecord({
    name: 'Emerald Fern Hoops',
    collection: 'Emerald Collection',
    category: 'Earrings',
    price: 3400,
    stock: 3,
    isBestSeller: true,
    imageUrl: '/data/uploads/emerald-fern-123.png'
  });
  assert.equal(built.imageUrl, '/data/uploads/emerald-fern-123.png');
  assert.equal(built.resinArtworkType, 'emerald-gold');
  assert.equal(built.isBestSeller, true);
  assert.equal(built.inStock, true);
});

test('resolveFeaturedCollections binds uploaded product image to matching collection when cover unset', () => {
  const collections = [
    { id: 'Floral Elegance', name: 'Floral Elegance', subtitle: 'Sub', imageType: 'floral-crystal' },
    { id: 'Emerald Collection', name: 'Emerald Collection', subtitle: 'Sub', imageType: 'emerald-gold' }
  ];
  const products = [
    { ...mockProduct, collection: 'Emerald Collection', imageUrl: '/data/uploads/emerald-1.jpg' }
  ];
  const resolved = resolveFeaturedCollections(collections, products);
  assert.equal(resolved[0].imageUrl, undefined);
  assert.equal(resolved[1].imageUrl, '/data/uploads/emerald-1.jpg');
});

test('resolveStoryShowcase picks hero product and uploaded story images', () => {
  const products = [
    { ...mockProduct, id: 'p-1', imageUrl: '/data/uploads/one.png' },
    { ...mockProduct, id: 'p-2', imageUrl: '/data/uploads/two.png' }
  ];
  const resolved = resolveStoryShowcase({ heroProductId: 'p-2' }, products);
  assert.equal(resolved.heroProduct.id, 'p-2');
  assert.equal(resolved.primaryStory.imageUrl, '/data/uploads/one.png');
  assert.equal(resolved.secondaryStory.imageUrl, '/data/uploads/two.png');
});

test('cleanupShowcaseOnDelete clears deleted photo from collections and storyShowcase', () => {
  const deleted = {
    ...mockProduct,
    id: 'custom-99',
    collection: 'Floral Elegance',
    imageUrl: '/data/uploads/monsoon-fern.png'
  };
  const state = {
    products: [
      { ...mockProduct, id: 'unmade-001', collection: 'Floral Elegance' },
      deleted
    ],
    collections: [
      {
        id: 'Floral Elegance',
        name: 'Floral Elegance',
        subtitle: 'Sub',
        imageType: 'floral-crystal',
        imageUrl: '/data/uploads/monsoon-fern.png'
      }
    ],
    storyShowcase: {
      heroProductId: 'custom-99',
      primaryStoryType: 'botanical-teardrop',
      primaryStoryImageUrl: '/data/uploads/monsoon-fern.png',
      primaryStoryTitle: 'Monsoon Fern',
      primaryStorySubtitle: 'Floral Elegance',
      secondaryStoryType: 'keepsake-pyramid',
      secondaryStoryTitle: '24K Gold Flakes',
      secondaryStorySubtitle: 'Suspended in glass depth'
    }
  };

  const cleaned = cleanupShowcaseOnDelete(state, deleted);
  assert.equal(cleaned.products.length, 1);
  assert.equal(cleaned.collections[0].imageUrl, undefined);
  assert.equal(cleaned.storyShowcase.heroProductId, 'unmade-001');
  assert.equal(cleaned.storyShowcase.primaryStoryImageUrl, undefined);
  assert.equal(cleaned.storyShowcase.primaryStoryTitle, 'Real Wild Botanicals');
  assert.equal(isUploadPathReferenced(cleaned, '/data/uploads/monsoon-fern.png'), false);
});

test('validateProductInput rejects invalid price, negative/decimal stock, short name/description, and duplicate names', () => {
  const result = validateProductInput(
    {
      name: 'Ab',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 0,
      originalPrice: 1500,
      stock: -2.5,
      description: 'Short'
    },
    [mockProduct]
  );

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.price);
  assert.ok(result.errors.stock);
  assert.ok(result.errors.description);

  const dupResult = validateProductInput(
    {
      name: '  test resin ring ',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: 2000,
      originalPrice: 1800,
      stock: 4,
      description: 'A handcrafted resin ring preserving wildflowers.'
    },
    [mockProduct]
  );

  assert.equal(dupResult.isValid, false);
  assert.ok(dupResult.errors.name.includes('already exists'));
  assert.ok(dupResult.errors.originalPrice.includes('greater than'));
});

test('validateProductInput accepts valid product details and returns sanitized values', () => {
  const result = validateProductInput(
    {
      name: '  Saffron Orchid Pendant  ',
      subtitle: '  Pressed orchid in clear dome ',
      category: 'Floral Jewellery',
      collection: 'Floral Elegance',
      price: '2850',
      originalPrice: '3200',
      stock: '6',
      description: '  Hand-poured optical resin pendant preserving a delicate saffron orchid petal.  '
    },
    [mockProduct]
  );

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.name, 'Saffron Orchid Pendant');
  assert.equal(result.sanitized.price, 2850);
  assert.equal(result.sanitized.originalPrice, 3200);
  assert.equal(result.sanitized.stock, 6);
});



