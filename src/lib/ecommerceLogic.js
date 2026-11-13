/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FREE_SHIPPING_THRESHOLD = 3000;
export const STANDARD_SHIPPING_FEE = 250;
export const GST_RATE = 0.03; // 3% on handcrafted fine art/jewellery

/**
 * Deterministically sorts catalog products based on selected criteria
 */
export function sortProducts(products, sortBy) {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': {
        const diff = a.price - b.price;
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case 'price-desc': {
        const diff = b.price - a.price;
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case 'newest': {
        // Prioritize explicit new arrivals
        if (Boolean(a.isNewArrival) !== Boolean(b.isNewArrival)) {
          return a.isNewArrival ? -1 : 1;
        }
        // Then by ID descending (e.g. unmade-008 > unmade-001)
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      }
      case 'name-asc': {
        return a.name.localeCompare(b.name);
      }
      case 'popularity':
      default: {
        // Popularity: Curator's Choice / Best Sellers (+500 score) + (reviewCount * rating)
        const scoreA = (a.isBestSeller ? 500 : 0) + (a.reviewCount * a.rating);
        const scoreB = (b.isBestSeller ? 500 : 0) + (b.reviewCount * b.rating);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return b.rating - a.rating;
      }
    }
  });
}

/**
 * Calculates cart subtotal, shipping fee, tax and grand total in INR (₹)
 */
export function calculateOrderSummary(items, appliedCoupon) {
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
export function estimateCustomOrderPrice(options) {
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
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
