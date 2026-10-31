/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { ResinArtImage } from './ResinArtImage';
import { formatINR } from '../lib/ecommerceLogic';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group resin-glass-card rounded-xl flex flex-col h-full cursor-pointer transition-all duration-300"
    >
      {/* Top Image Showcase */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F3EA] border-b border-[#E8DFD0]/60">
        <ResinArtImage
          type={product.resinArtworkType}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges / Indicators */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isBestSeller && (
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#164B3B] bg-[#F7F3EA]/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-[#C6A15B]/30">
              Curator’s Choice
            </span>
          )}
          {product.stock <= 4 && product.stock > 0 && (
            <span className="text-[11px] font-medium tracking-wide text-[#8A252C] bg-[#FFF5F5]/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-[#E8C0C0]">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-[#164B3B] text-[#F7F3EA] shadow-md'
              : 'bg-[#F7F3EA]/80 text-[#29231F] hover:bg-white hover:text-[#164B3B] shadow-sm'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C6A15B] text-[#C6A15B]' : 'stroke-[1.8]'}`} />
        </button>

        {/* Hover Quick Actions */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock || product.stock === 0}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
              justAdded
                ? 'bg-[#164B3B] text-[#F7F3EA]'
                : 'bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA]'
            }`}
            aria-label={`Quick add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="p-2 bg-white/95 hover:bg-white text-[#29231F] rounded-lg shadow-md transition-colors cursor-pointer"
            aria-label={`View details for ${product.name}`}
            title="Inspect Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Metadata Row: Category & Stock with clean bullet */}
          <div className="flex items-center gap-2 text-xs text-[#29231F]/60 tracking-wider uppercase mb-1.5 font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className={product.stock > 0 ? 'text-[#164B3B]' : 'text-red-700'}>
              {product.stock > 0 ? 'In Studio' : 'Sold Out'}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-medium text-[#29231F] group-hover:text-[#164B3B] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Subtitle / Botanical Inclusions */}
          <p className="text-xs text-[#29231F]/70 line-clamp-1 mt-1 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Price & Primary Baseline */}
        <div className="mt-4 pt-3 border-t border-[#E8DFD0]/60 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#164B3B] tabular-nums">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#29231F]/50 line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-[#C6A15B] tracking-wide">
            ★ {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>
      </div>
    </article>
  );
};
