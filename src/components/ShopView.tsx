/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check, RefreshCw } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { formatINR } from '../lib/ecommerceLogic';

interface ShopViewProps {
  products: Product[];
  wishlistIds: string[];
  initialCategory?: string;
  initialCollection?: string;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  wishlistIds,
  initialCategory,
  initialCollection,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popularity'>('popularity');
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: string[] = [
    'All',
    'Earrings',
    'Floral Jewellery',
    'Personalised Keepsakes',
    'Artistic Decor'
  ];

  const collections: string[] = [
    'All',
    'Floral Elegance',
    'Emerald Collection',
    'Golden Details',
    'Personalised Keepsakes'
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }
        // Collection filter
        if (selectedCollection !== 'All' && product.collection !== selectedCollection) {
          return false;
        }
        // Price filter
        if (product.price > maxPrice) {
          return false;
        }
        // Stock filter
        if (inStockOnly && (!product.inStock || product.stock === 0)) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchSub = product.subtitle.toLowerCase().includes(q);
          const matchMat = product.specifications.materials.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSub && !matchMat) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return b.rating - a.rating; // popularity
      });
  }, [products, selectedCategory, selectedCollection, maxPrice, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCollection('All');
    setSearchQuery('');
    setMaxPrice(6000);
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C6A15B]">
          Curated Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#164B3B] mt-2 mb-3">
          The Gallery Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#29231F]/80 leading-relaxed">
          Explore botanical jewellery, emerald fluid sculptures, and handcrafted keepsakes forged in our Bengaluru studio.
        </p>
      </div>

      {/* Control Bar: Search & Sort & Mobile Filter Toggle */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DFD0] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flora, gold, emerald hopps..."
            className="w-full pl-9 pr-8 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] placeholder:text-[#29231F]/50 focus:outline-none focus:border-[#164B3B]"
          />
          <Search className="w-4 h-4 text-[#29231F]/50 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#29231F]/50 hover:text-[#29231F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#164B3B] text-[#F7F3EA] shadow-xs font-semibold'
                  : 'bg-[#F7F3EA] text-[#29231F]/80 hover:bg-[#E8DFD0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right side: Sorting & Mobile Trigger */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-medium cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#164B3B]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#29231F]/60 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-medium text-[#29231F] focus:outline-none focus:border-[#164B3B]"
            >
              <option value="popularity">Curator's Choice</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:col-span-3 bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
            <h3 className="font-serif text-base font-semibold text-[#164B3B]">
              Refine Gallery
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-[#C6A15B] hover:underline font-medium cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Collection Filter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2.5">
              Collections
            </h4>
            <div className="space-y-1.5 text-xs">
              {collections.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#164B3B]"
                >
                  <input
                    type="radio"
                    name="collection"
                    checked={selectedCollection === col}
                    onChange={() => setSelectedCollection(col)}
                    className="accent-[#164B3B]"
                  />
                  <span className={selectedCollection === col ? 'font-semibold text-[#164B3B]' : 'text-[#29231F]/80'}>
                    {col}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-[#E8DFD0]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[#29231F]/70">Max Price:</span>
              <span className="font-bold text-[#164B3B] tabular-nums">{formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="1500"
              max="6000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#164B3B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#29231F]/50 mt-1">
              <span>₹1,500</span>
              <span>₹6,000+</span>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-[#E8DFD0]">
            <label className="flex items-center gap-2.5 text-xs font-medium text-[#29231F] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#164B3B]"
              />
              <span>In-Studio Pieces Only</span>
            </label>
          </div>

          {/* Guarantee Seal */}
          <div className="p-3.5 bg-[#F7F3EA] rounded-lg border border-[#E8DFD0] text-[11px] text-[#29231F]/70 leading-relaxed">
            All pieces are 100% genuine botanical and alcohol ink castings. Free insured delivery applies on all orders above ₹3,000.
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-4 text-xs text-[#29231F]/60">
            <span>Showing {filteredProducts.length} handcrafted pieces</span>
            {selectedCategory !== 'All' && (
              <span className="font-semibold text-[#164B3B]">Filtered by {selectedCategory}</span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E8DFD0] text-center">
              <h3 className="font-serif text-xl font-medium text-[#29231F]">
                No creations match your filter criteria
              </h3>
              <p className="text-xs text-[#29231F]/70 mt-1 mb-4">
                Try widening your price range or clearing search keywords.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={(p) => onAddToCart(p)}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
