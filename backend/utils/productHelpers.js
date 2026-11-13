/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function sanitizeImageFilename(baseName, ext = 'png', timestamp = Date.now()) {
  const safeBase =
    String(baseName || 'resin-creation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'resin-creation';
  const safeExt = String(ext || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  return `${safeBase}-${timestamp}.${safeExt}`;
}

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

  return {
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
      input.isNewArrival !== undefined ? input.isNewArrival : existingProduct ? existingProduct.isNewArrival : true
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
}

export function validateProductPayload(input = {}, existingProducts = [], editingProductId = null) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const category = String(input.category ?? '').trim();
  const collection = String(input.collection ?? '').trim();
  const description = String(input.description ?? '').trim();

  if (!name || name.length < 3) {
    errors.name = 'Creation name must be at least 3 characters.';
  } else {
    const duplicate = (existingProducts || []).find(
      (p) => p.id !== editingProductId && String(p.name || '').trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      errors.name = `A creation named "${duplicate.name}" already exists.`;
    }
  }

  if (!category) errors.category = 'Category is required.';
  if (!collection) errors.collection = 'Collection is required.';

  const priceNum = Number(input.price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errors.price = 'Price must be greater than ₹0.';
  }

  if (input.originalPrice !== '' && input.originalPrice !== null && input.originalPrice !== undefined) {
    const origNum = Number(input.originalPrice);
    if (!Number.isFinite(origNum) || origNum <= priceNum) {
      errors.originalPrice = 'Original price must be greater than selling price.';
    }
  }

  const stockNum = Number(input.stock);
  if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    errors.stock = 'Stock must be a whole number (0 or greater).';
  }

  if (!description || description.length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

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
    nextStory.heroProductId = defaultHero ? defaultHero.id : 'unmade-001';
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
