/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Sparkles, Clock, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ResinArtImage } from './ResinArtImage';
import { formatINR } from '../lib/ecommerceLogic';

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'artisan'>('specs');
  const [addedNotice, setAddedNotice] = useState(false);

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.collection === product.collection))
    .slice(0, 3);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Product details for ${product.name}`}
    >
      <div className="relative w-full max-w-5xl bg-[#F7F3EA] rounded-2xl shadow-2xl border border-[#E8DFD0] overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD0] bg-white/70 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#29231F]/70 uppercase tracking-widest font-medium">
            <span>UNMADE GALLERY</span>
            <span>/</span>
            <span>{product.collection}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#29231F] hover:bg-[#E8DFD0] transition-colors cursor-pointer"
            aria-label="Close product details modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Visual Artwork Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E8DFD0] shadow-sm">
                <ResinArtImage
                  type={product.resinArtworkType}
                  alt={product.name}
                  className="w-full h-full"
                />

                {/* Corner Artisan Seal */}
                <div className="absolute top-4 left-4 bg-[#164B3B] text-[#F7F3EA] text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C6A15B]" />
                  <span>Studio Cast</span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer ${
                    isWishlisted
                      ? 'bg-[#164B3B] text-[#F7F3EA]'
                      : 'bg-[#F7F3EA]/90 text-[#29231F] hover:bg-white'
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C6A15B] text-[#C6A15B]' : 'stroke-[1.8]'}`} />
                </button>
              </div>

              {/* Gallery Feature Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD0] text-center">
                  <Clock className="w-4 h-4 mx-auto text-[#164B3B] mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-[#29231F]/60">Curing Time</p>
                  <p className="text-xs font-semibold text-[#29231F]">{product.specifications.curingTime}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD0] text-center">
                  <ShieldCheck className="w-4 h-4 mx-auto text-[#164B3B] mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-[#29231F]/60">Resin Grade</p>
                  <p className="text-xs font-semibold text-[#29231F]">UV-Stabilized</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD0] text-center">
                  <Sparkles className="w-4 h-4 mx-auto text-[#164B3B] mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-[#29231F]/60">Inclusions</p>
                  <p className="text-xs font-semibold text-[#29231F]">Real Botanicals</p>
                </div>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Collection & Stock status */}
                <div className="flex items-center justify-between text-xs tracking-wider uppercase mb-2">
                  <span className="text-[#C6A15B] font-semibold">{product.collection}</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-[#164B3B]' : 'text-red-700'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} pieces)` : 'Currently Sold Out'}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#29231F] leading-tight">
                  {product.name}
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-[#29231F]/70 mt-1.5 leading-relaxed">
                  {product.subtitle}
                </p>

                {/* Price Display in INR */}
                <div className="mt-5 flex items-baseline gap-3 pb-5 border-b border-[#E8DFD0]">
                  <span className="text-2xl sm:text-3xl font-bold text-[#164B3B] tabular-nums">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-[#29231F]/50 line-through tabular-nums">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-[#29231F]/60 ml-2">
                    (Inclusive of all taxes · Free delivery on orders ₹3,000+)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#29231F]/85 leading-relaxed mt-5">
                  {product.description}
                </p>

                {/* Key Bullet Highlights */}
                <ul className="mt-4 space-y-2">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#29231F]/80">
                      <span className="text-[#C6A15B] mt-0.5">✦</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Quantity Controls & Purchase Buttons */}
                <div className="mt-6 pt-5 border-t border-[#E8DFD0] space-y-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="modal-qty" className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-[#C6A15B]/50 rounded-lg bg-white overflow-hidden shadow-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-sm font-bold text-[#29231F] hover:bg-[#E8DFD0] disabled:opacity-30 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span id="modal-qty" className="px-4 py-1.5 text-sm font-semibold tabular-nums text-[#164B3B]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 text-sm font-bold text-[#29231F] hover:bg-[#E8DFD0] disabled:opacity-30 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs text-[#29231F]/60">
                      Total: <strong className="text-[#164B3B]">{formatINR(product.price * quantity)}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleAdd}
                      disabled={!product.inStock || product.stock === 0}
                      className="py-3 px-4 bg-[#F7F3EA] border-2 border-[#164B3B] text-[#164B3B] hover:bg-[#164B3B] hover:text-[#F7F3EA] rounded-lg text-sm font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {addedNotice ? (
                        <>
                          <Check className="w-4 h-4 text-[#C6A15B]" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuy}
                      disabled={!product.inStock || product.stock === 0}
                      className="py-3 px-4 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-lg text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
                    </button>
                  </div>
                </div>

                {/* Tabs: Specifications, Care Instructions, Artisan Notes */}
                <div className="mt-8 border-t border-[#E8DFD0] pt-6">
                  <div className="flex items-center gap-4 border-b border-[#E8DFD0] pb-2 text-xs font-semibold tracking-wider uppercase">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'specs'
                          ? 'border-[#164B3B] text-[#164B3B]'
                          : 'border-transparent text-[#29231F]/60 hover:text-[#29231F]'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('care')}
                      className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'care'
                          ? 'border-[#164B3B] text-[#164B3B]'
                          : 'border-transparent text-[#29231F]/60 hover:text-[#29231F]'
                      }`}
                    >
                      Care Guide
                    </button>
                    <button
                      onClick={() => setActiveTab('artisan')}
                      className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'artisan'
                          ? 'border-[#164B3B] text-[#164B3B]'
                          : 'border-transparent text-[#29231F]/60 hover:text-[#29231F]'
                      }`}
                    >
                      Artisan Authenticity
                    </button>
                  </div>

                  <div className="pt-4 text-xs">
                    {activeTab === 'specs' && (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div>
                          <dt className="text-[#29231F]/50">Materials</dt>
                          <dd className="font-medium text-[#29231F] mt-0.5">{product.specifications.materials}</dd>
                        </div>
                        <div>
                          <dt className="text-[#29231F]/50">Inclusions</dt>
                          <dd className="font-medium text-[#29231F] mt-0.5">{product.specifications.inclusions}</dd>
                        </div>
                        <div>
                          <dt className="text-[#29231F]/50">Hardware &amp; Clasps</dt>
                          <dd className="font-medium text-[#29231F] mt-0.5">{product.specifications.hardware}</dd>
                        </div>
                        <div>
                          <dt className="text-[#29231F]/50">Dimensions &amp; Weight</dt>
                          <dd className="font-medium text-[#29231F] mt-0.5">{product.specifications.dimensions} · {product.specifications.weight}</dd>
                        </div>
                      </dl>
                    )}

                    {activeTab === 'care' && (
                      <ul className="space-y-2 text-[#29231F]/80">
                        {product.careInstructions.map((instr, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#164B3B]">✓</span>
                            <span>{instr}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {activeTab === 'artisan' && (
                      <div className="bg-white p-3.5 rounded-lg border border-[#E8DFD0] space-y-1.5 text-[#29231F]/85">
                        <p className="font-semibold text-[#164B3B]">Certificate of Handmade Origin</p>
                        <p className="leading-relaxed">
                          Every creation from UNMADE GALLERY is mixed, poured, degassed, and cured by hand in our studio atelier in Bengaluru. Small micro-variations in botanical placement verify genuine artisanal origin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Pieces Carousel / Grid */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#E8DFD0]">
              <h3 className="font-serif text-xl font-medium text-[#29231F] mb-4">
                Complementary Creations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setQuantity(1);
                    }}
                    className="p-3 bg-white rounded-lg border border-[#E8DFD0] hover:border-[#C6A15B] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[#F7F3EA] shrink-0 border border-[#E8DFD0]">
                      <ResinArtImage type={rel.resinArtworkType} alt={rel.name} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-[#C6A15B] uppercase font-semibold">{rel.category}</p>
                      <h4 className="text-xs font-serif font-medium text-[#29231F] truncate group-hover:text-[#164B3B]">
                        {rel.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#164B3B] mt-1 tabular-nums">
                        {formatINR(rel.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
