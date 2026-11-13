/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderSummary, estimateCustomOrderPrice, formatINR, sortProducts } from './ecommerceLogic.js';

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
