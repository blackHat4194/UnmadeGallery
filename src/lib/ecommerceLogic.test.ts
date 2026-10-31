/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderSummary, estimateCustomOrderPrice, formatINR, FREE_SHIPPING_THRESHOLD } from './ecommerceLogic';
import { CartItem, Product } from '../types';

const mockProduct: Product = {
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

test('calculateOrderSummary calculates correct subtotal and applies shipping when under threshold', () => {
  const items: CartItem[] = [
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
  const items: CartItem[] = [
    { product: mockProduct, quantity: 2 } // ₹4,000 (>= ₹3,000)
  ];
  const summary = calculateOrderSummary(items);
  assert.equal(summary.subtotal, 4000);
  assert.equal(summary.isFreeShipping, true);
  assert.equal(summary.shipping, 0);
  assert.equal(summary.amountToFreeShipping, 0);
});

test('calculateOrderSummary applies FIRSTSTORY discount code correctly', () => {
  const items: CartItem[] = [
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
