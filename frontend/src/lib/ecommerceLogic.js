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

/**
 * Produces a safe filesystem filename for uploaded product artwork images
 */
export function sanitizeImageFilename(baseName, ext = 'png', timestamp = Date.now()) {
  const safeBase = String(baseName || 'resin-creation')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'resin-creation';
  const safeExt = String(ext || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  return `${safeBase}-${timestamp}.${safeExt}`;
}

/**
 * Normalizes and builds a complete product record for gallery-data.json and products.js
 */
export function buildProductRecord(input, existingProduct = null) {
  const numericStock = Math.max(0, Number(input.stock ?? existingProduct?.stock ?? 0));
  const numericPrice = Math.max(1, Number(input.price ?? existingProduct?.price ?? 2500));
  const numericOriginal =
    input.originalPrice !== undefined && input.originalPrice !== '' && Number(input.originalPrice) > numericPrice
      ? Number(input.originalPrice)
      : existingProduct?.originalPrice && existingProduct.originalPrice > numericPrice
      ? existingProduct.originalPrice
      : undefined;

  const collection = input.collection || existingProduct?.collection || 'Floral Elegance';
  const category = input.category || existingProduct?.category || 'Floral Jewellery';

  const defaultArtMap = {
    'Floral Elegance': 'floral-crystal',
    'Emerald Collection': 'emerald-gold',
    'Golden Details': 'golden-amber',
    'Personalised Keepsakes': 'keepsake-pyramid'
  };

  const record = {
    id: existingProduct?.id || input.id || `unmade-${Date.now().toString().slice(-6)}`,
    name: String(input.name || existingProduct?.name || 'Untitled Resin Creation').trim(),
    subtitle: String(
      input.subtitle || existingProduct?.subtitle || 'Handcrafted botanical resin artwork'
    ).trim(),
    category,
    collection,
    price: numericPrice,
    ...(numericOriginal ? { originalPrice: numericOriginal } : {}),
    stock: numericStock,
    rating: Number(existingProduct?.rating ?? input.rating ?? 5.0),
    reviewCount: Number(existingProduct?.reviewCount ?? input.reviewCount ?? 1),
    isBestSeller: Boolean(
      input.isBestSeller !== undefined ? input.isBestSeller : existingProduct?.isBestSeller
    ),
    isNewArrival: Boolean(
      input.isNewArrival !== undefined ? input.isNewArrival : (existingProduct ? existingProduct.isNewArrival : true)
    ),
    resinArtworkType:
      input.resinArtworkType || existingProduct?.resinArtworkType || defaultArtMap[collection] || 'floral-crystal',
    ...(input.imageUrl || existingProduct?.imageUrl
      ? { imageUrl: input.imageUrl || existingProduct.imageUrl }
      : {}),
    description: String(
      input.description ||
        existingProduct?.description ||
        'Exclusive hand-poured studio creation preserving organic botanicals and metallic leaf inside optical-grade UV-stabilized resin.'
    ).trim(),
    details:
      Array.isArray(input.details) && input.details.length > 0
        ? input.details
        : existingProduct?.details || [
            'Hand-poured in small batches inside our Bengaluru atelier',
            'Optical-grade non-yellowing UV-stabilized epoxy resin',
            'Finished with hypoallergenic 18k gold-plated accents'
          ],
    specifications: {
      materials:
        input.materials ||
        input.specifications?.materials ||
        existingProduct?.specifications?.materials ||
        'UV-Stabilized Optical Resin, Artisanal Pigments',
      inclusions:
        input.inclusions ||
        input.specifications?.inclusions ||
        existingProduct?.specifications?.inclusions ||
        'Real preserved botanicals & 24k gold flakes',
      hardware:
        input.hardware ||
        input.specifications?.hardware ||
        existingProduct?.specifications?.hardware ||
        '18K Gold Plated Brass / Surgical Grade Posts',
      dimensions:
        input.dimensions ||
        input.specifications?.dimensions ||
        existingProduct?.specifications?.dimensions ||
        'Handcrafted studio dimensions',
      weight:
        input.weight ||
        input.specifications?.weight ||
        existingProduct?.specifications?.weight ||
        '12 grams',
      curingTime:
        input.curingTime ||
        input.specifications?.curingTime ||
        existingProduct?.specifications?.curingTime ||
        '72 hours slow thermal cure'
    },
    careInstructions:
      Array.isArray(input.careInstructions) && input.careInstructions.length > 0
        ? input.careInstructions
        : existingProduct?.careInstructions || [
            'Store in a cool, dry pouch away from direct sunlight.',
            'Wipe gently with a soft dry microfibre cloth.'
          ],
    inStock: numericStock > 0
  };

  return record;
}

/**
 * Resolves Featured Collections with uploaded cover images or matching product photos
 */
export function resolveFeaturedCollections(collections = [], products = []) {
  return collections.map((col) => {
    if (col.imageUrl) {
      return col;
    }
    const matchingWithPhoto = products.find(
      (p) => p.collection === col.name && p.imageUrl
    );
    return matchingWithPhoto
      ? { ...col, imageUrl: matchingWithPhoto.imageUrl }
      : col;
  });
}

/**
 * Resolves Hero & "Every Piece Has Its Own Story" showcase slots from gallery data
 */
export function resolveStoryShowcase(storyShowcase = {}, products = []) {
  const heroProduct =
    products.find((p) => p.id === storyShowcase.heroProductId) ||
    products.find((p) => p.imageUrl) ||
    products[0] ||
    null;

  const uploadedProducts = products.filter((p) => Boolean(p.imageUrl));

  return {
    heroProduct,
    primaryStory: {
      imageUrl: storyShowcase.primaryStoryImageUrl || uploadedProducts[0]?.imageUrl || '',
      imageType: storyShowcase.primaryStoryType || uploadedProducts[0]?.resinArtworkType || 'botanical-teardrop',
      title: storyShowcase.primaryStoryTitle || 'Real Wild Botanicals',
      subtitle: storyShowcase.primaryStorySubtitle || 'Ethically hand-foraged'
    },
    secondaryStory: {
      imageUrl: storyShowcase.secondaryStoryImageUrl || uploadedProducts[1]?.imageUrl || '',
      imageType: storyShowcase.secondaryStoryType || uploadedProducts[1]?.resinArtworkType || 'keepsake-pyramid',
      title: storyShowcase.secondaryStoryTitle || '24K Gold Flakes',
      subtitle: storyShowcase.secondaryStorySubtitle || 'Suspended in glass depth'
    }
  };
}

/**
 * Checks whether an upload path (e.g. /data/uploads/foo.png) is still referenced in galleryData
 */
export function isUploadPathReferenced(galleryData, uploadPath) {
  if (!uploadPath) return false;
  if ((galleryData.products || []).some((p) => p.imageUrl === uploadPath)) return true;
  if ((galleryData.collections || []).some((c) => c.imageUrl === uploadPath)) return true;
  const story = galleryData.storyShowcase || {};
  if (story.primaryStoryImageUrl === uploadPath || story.secondaryStoryImageUrl === uploadPath) {
    return true;
  }
  return false;
}

/**
 * Removes a deleted product and clears any collection cover / story showcase references to its photo
 */
export function cleanupShowcaseOnDelete(currentData, deletedProduct) {
  const remainingProducts = (currentData.products || []).filter((p) => p.id !== deletedProduct?.id);
  const deletedUrl = deletedProduct?.imageUrl;

  const nextCollections = (currentData.collections || []).map((col) => {
    if (!deletedUrl || col.imageUrl !== deletedUrl) {
      return col;
    }
    const replacement = remainingProducts.find((p) => p.collection === col.name && p.imageUrl);
    if (replacement) {
      return { ...col, imageUrl: replacement.imageUrl };
    }
    const { imageUrl: _removed, ...rest } = col;
    return rest;
  });

  const currentStory = currentData.storyShowcase || {};
  const nextStory = { ...currentStory };

  if (nextStory.heroProductId === deletedProduct?.id) {
    const defaultHero = remainingProducts.find((p) => p.id === 'unmade-001') || remainingProducts[0];
    nextStory.heroProductId = defaultHero ? defaultHero.id : '';
  }

  if (deletedUrl && nextStory.primaryStoryImageUrl === deletedUrl) {
    delete nextStory.primaryStoryImageUrl;
    nextStory.primaryStoryTitle = 'Real Wild Botanicals';
    nextStory.primaryStorySubtitle = 'Ethically hand-foraged';
  }

  if (deletedUrl && nextStory.secondaryStoryImageUrl === deletedUrl) {
    delete nextStory.secondaryStoryImageUrl;
    nextStory.secondaryStoryTitle = '24K Gold Flakes';
    nextStory.secondaryStorySubtitle = 'Suspended in glass depth';
  }

  return {
    ...currentData,
    products: remainingProducts,
    collections: nextCollections,
    storyShowcase: nextStory
  };
}

/**
 * Validates product creation / edit form inputs before updating state or persisting
 */
export function validateProductInput(input = {}, existingProducts = [], editingProductId = null) {
  const errors = {};

  const name = String(input.name ?? '').trim();
  const subtitle = String(input.subtitle ?? '').trim();
  const category = String(input.category ?? '').trim();
  const collection = String(input.collection ?? '').trim();
  const description = String(input.description ?? '').trim();
  const materials = String(input.materials ?? '').trim();
  const inclusions = String(input.inclusions ?? '').trim();

  if (!name) {
    errors.name = 'Creation name is required.';
  } else if (name.length < 3) {
    errors.name = 'Creation name must be at least 3 characters.';
  } else if (name.length > 80) {
    errors.name = 'Creation name must be 80 characters or fewer.';
  } else {
    const duplicate = (existingProducts || []).find(
      (p) => p.id !== editingProductId && String(p.name || '').trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      errors.name = `A creation named "${duplicate.name}" already exists in the catalog.`;
    }
  }

  if (!category) {
    errors.category = 'Please select a product category.';
  }

  if (!collection) {
    errors.collection = 'Please select a collection series.';
  }

  const rawPrice = input.price;
  const priceNum = rawPrice === '' || rawPrice === null || rawPrice === undefined ? NaN : Number(rawPrice);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errors.price = 'Price must be a valid amount greater than ₹0.';
  }

  const rawOriginal = input.originalPrice;
  let originalPriceNum;
  if (rawOriginal !== '' && rawOriginal !== null && rawOriginal !== undefined) {
    originalPriceNum = Number(rawOriginal);
    if (!Number.isFinite(originalPriceNum) || originalPriceNum <= 0) {
      errors.originalPrice = 'Original price must be a positive number.';
    } else if (Number.isFinite(priceNum) && originalPriceNum <= priceNum) {
      errors.originalPrice = 'Original price must be greater than the selling price.';
    }
  }

  const rawStock = input.stock;
  const stockNum = rawStock === '' || rawStock === null || rawStock === undefined ? NaN : Number(rawStock);
  if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    errors.stock = 'Stock must be a whole number (0 or greater).';
  }

  if (!description) {
    errors.description = 'Story & description is required.';
  } else if (description.length < 10) {
    errors.description = 'Please provide at least 10 characters describing the piece.';
  }

  if (input.photoDataUrl) {
    const validDataUrl = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(
      String(input.photoDataUrl)
    );
    if (!validDataUrl) {
      errors.photoDataUrl = 'Uploaded photo must be a valid PNG, JPG, WEBP, or GIF image.';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: {
      ...input,
      name,
      subtitle,
      category,
      collection,
      price: Number.isFinite(priceNum) ? Math.round(priceNum) : 0,
      originalPrice: originalPriceNum !== undefined && Number.isFinite(originalPriceNum) ? Math.round(originalPriceNum) : '',
      stock: Number.isFinite(stockNum) ? Math.trunc(stockNum) : 0,
      description,
      materials,
      inclusions
    }
  };
}



