/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 3000;
export const STANDARD_SHIPPING_FEE = 250;
export const GST_RATE = 0.03; // 3% on handcrafted fine art/jewellery

/**
 * Calculates cart subtotal, shipping fee, tax and grand total in INR (₹)
 */
export function calculateOrderSummary(items: CartItem[], appliedCoupon?: string) {
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let discount = 0;
  if (appliedCoupon?.toUpperCase() === 'FIRSTSTORY') {
    discount = Math.round(subtotal * 0.1); // 10% welcome discount
  } else if (appliedCoupon?.toUpperCase() === 'GALLERY15') {
    discount = Math.round(subtotal * 0.15); // 15% collector discount
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const isFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0;
  const shipping = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  
  // Handcrafted resin art tax
  const tax = Math.round(discountedSubtotal * GST_RATE);
  const total = discountedSubtotal + shipping + tax;

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount,
    discountedSubtotal,
    isFreeShipping,
    shipping,
    tax,
    total,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal)
  };
}

/**
 * Calculate custom commission price estimate based on item type and inclusions
 */
export function estimateCustomOrderPrice(options: {
  itemType: string;
  flowerCount: number;
  metalAccents: string;
  hasPersonalizedText: boolean;
}): number {
  let base = 2500;
  
  switch (options.itemType) {
    case 'Preserved Floral Pendant':
      base = 2400;
      break;
    case 'Statement Earrings':
      base = 3200;
      break;
    case 'Pyramid Keepsake':
      base = 4500;
      break;
    case 'Coaster Set (Pair of 2)':
      base = 3800;
      break;
    case 'Botanical Bookmark':
      base = 1800;
      break;
    default:
      base = 2500;
  }

  // Botanical complexity
  const flowerAddon = Math.max(0, (options.flowerCount - 1) * 350);

  // Metal leaf premium
  let metalAddon = 0;
  if (options.metalAccents === '24k Gold Leaf') {
    metalAddon = 600;
  } else if (options.metalAccents === 'Rose Gold Flakes' || options.metalAccents === 'Silver Leaf') {
    metalAddon = 400;
  }

  // Custom engraving/inscription
  const engravingAddon = options.hasPersonalizedText ? 450 : 0;

  return base + flowerAddon + metalAddon + engravingAddon;
}

/**
 * Formats amount into Indian Rupee standard format (e.g. ₹2,450)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
