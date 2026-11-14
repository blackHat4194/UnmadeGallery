/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check, Grid, Columns } from 'lucide-react';
import { ProductCard } from './ProductCard.jsx';
import { formatINR, sortProducts } from '../lib/ecommerceLogic.js';

export const ShopView = ({
  products,
  wishlistIds,
  initialCategory,
  initialCollection,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedCollection, setSelectedCollection] = useState(initialCollection || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileGridColumns, setMobileGridColumns] = useState(2);

  const catalogMaxPrice = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0);
    return Math.max(6000, Math.ceil(highest / 500) * 500);
  }, [products]);

  const effectiveMaxPrice = maxPriceFilter === null ? catalogMaxPrice : Math.min(maxPriceFilter, catalogMaxPrice);

  const categories = [
    'All',
    'Earrings',
    'Floral Jewellery',
    'Personalised Keepsakes',
    'Artistic Decor'
  ];

  const collections = [
    'All',
    'Floral Elegance',
    'Emerald Collection',
    'Golden Details',
    'Personalised Keepsakes'
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Popularity (Curator’s Choice)' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Product Name: A to Z' }
  ];

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedCollection !== 'All' && product.collection !== selectedCollection) {
        return false;
      }
      if (product.price > effectiveMaxPrice) {
        return false;
      }
      if (inStockOnly && (!product.inStock || product.stock === 0)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchSub = product.subtitle.toLowerCase().includes(q);
        const matchMat = product.specifications?.materials?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSub && !matchMat) {
          return false;
        }
      }
      return true;
    });

    return sortProducts(filtered, sortBy);
  }, [products, selectedCategory, selectedCollection, effectiveMaxPrice, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCollection('All');
    setSearchQuery('');
    setMaxPriceFilter(null);
    setInStockOnly(false);
    setSortBy('popularity');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedCollection !== 'All' ||
    searchQuery.trim() !== '' ||
    (maxPriceFilter !== null && effectiveMaxPrice < catalogMaxPrice) ||
    inStockOnly ||
    sortBy !== 'popularity';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#C6A15B]">
          Curated Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#164B3B] mt-2 mb-2 sm:mb-3">
          The Gallery Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#29231F]/80 leading-relaxed max-w-lg mx-auto">
          Explore botanical jewellery, emerald fluid sculptures, and handcrafted keepsakes forged in our Bengaluru studio.
        </p>
      </div>

      {/* Control Bar: Search, Category Chips, Sorting, Grid Toggle */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E8DFD0] shadow-xs mb-6 sm:mb-8 flex flex-col gap-3 min-w-0 w-full">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flora, gold, emerald hoops..."
              className="w-full pl-9 pr-8 py-2.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] placeholder:text-[#29231F]/50 focus:outline-none focus:border-[#164B3B]"
            />
            <Search className="w-4 h-4 text-[#29231F]/50 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-[#29231F]/50 hover:text-[#29231F] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Category Chips */}
          <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto py-1 min-w-0">
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

          {/* Action Row: Mobile Filter Trigger, Sort Select, Mobile Layout Toggle */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-[#F7F3EA] hover:bg-[#E8DFD0] border border-[#E8DFD0] rounded-lg text-xs font-medium cursor-pointer"
                aria-label="Open filters and sort options"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#164B3B]" />
                <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
              </button>

              {/* Mobile Column Grid Switcher (1 vs 2 Columns) */}
              <div className="flex lg:hidden items-center border border-[#E8DFD0] rounded-lg overflow-hidden bg-[#F7F3EA]">
                <button
                  onClick={() => setMobileGridColumns(1)}
                  className={`p-2 transition-colors cursor-pointer ${
                    mobileGridColumns === 1 ? 'bg-[#164B3B] text-white' : 'text-[#29231F]/70 hover:bg-[#E8DFD0]'
                  }`}
                  title="Single column view"
                  aria-label="Single column view"
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMobileGridColumns(2)}
                  className={`p-2 transition-colors cursor-pointer ${
                    mobileGridColumns === 2 ? 'bg-[#164B3B] text-white' : 'text-[#29231F]/70 hover:bg-[#E8DFD0]'
                  }`}
                  title="Two column view"
                  aria-label="Two column view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden sm:inline text-xs text-[#29231F]/60 whitespace-nowrap">Sort:</span>
              <div className="relative min-w-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="max-w-[165px] sm:max-w-none pl-2.5 pr-7 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-medium text-[#29231F] focus:outline-none focus:border-[#164B3B] cursor-pointer appearance-none truncate"
                  aria-label="Sort product catalog"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#29231F]/50 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Chips on Tablet / Mobile */}
        <div className="flex xl:hidden flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'bg-[#F7F3EA] text-[#29231F]/80 hover:bg-[#E8DFD0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#29231F]/60">Active:</span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#164B3B]/10 text-[#164B3B] rounded-full font-medium">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="hover:text-red-700 cursor-pointer ml-1">×</button>
            </span>
          )}
          {selectedCollection !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#164B3B]/10 text-[#164B3B] rounded-full font-medium">
              Collection: {selectedCollection}
              <button onClick={() => setSelectedCollection('All')} className="hover:text-red-700 cursor-pointer ml-1">×</button>
            </span>
          )}
          {maxPriceFilter !== null && effectiveMaxPrice < catalogMaxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#164B3B]/10 text-[#164B3B] rounded-full font-medium">
              Under {formatINR(effectiveMaxPrice)}
              <button onClick={() => setMaxPriceFilter(null)} className="hover:text-red-700 cursor-pointer ml-1">×</button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#164B3B]/10 text-[#164B3B] rounded-full font-medium">
              In Studio Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-red-700 cursor-pointer ml-1">×</button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#164B3B]/10 text-[#164B3B] rounded-full font-medium">
              Keyword: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-red-700 cursor-pointer ml-1">×</button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[#C6A15B] hover:underline font-semibold ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid & Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs space-y-6 sticky top-28">
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
            <div className="space-y-2 text-xs">
              {collections.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#164B3B]"
                >
                  <input
                    type="radio"
                    name="desktop-collection"
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
              <span className="font-semibold uppercase tracking-wider text-[#29231F]/70">Max Budget:</span>
              <span className="font-bold text-[#164B3B] tabular-nums">{formatINR(effectiveMaxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max={catalogMaxPrice}
              step="250"
              value={effectiveMaxPrice}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full accent-[#164B3B] cursor-pointer"
              aria-label="Filter maximum price"
            />
            <div className="flex justify-between text-[10px] text-[#29231F]/50 mt-1 font-mono">
              <span>₹500</span>
              <span>{formatINR(catalogMaxPrice)}+</span>
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
          <div className="flex items-center justify-between mb-4 text-xs text-[#29231F]/70">
            <span>
              Showing <strong className="text-[#164B3B]">{filteredProducts.length}</strong> handcrafted {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
            <span className="hidden sm:inline text-[#29231F]/50">
              Sorted by {sortOptions.find(o => o.value === sortBy)?.label}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8DFD0] text-center">
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#29231F]">
                {products.length === 0 && !hasActiveFilters
                  ? 'The Gallery Catalog Is Currently Empty'
                  : 'No creations match your filter criteria'}
              </h3>
              <p className="text-xs sm:text-sm text-[#29231F]/70 mt-1 mb-5 max-w-md mx-auto">
                {products.length === 0 && !hasActiveFilters
                  ? 'Creations published manually through Studio Admin will appear here immediately.'
                  : 'Try widening your price range, toggling stock availability, or clearing search keywords.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={`grid gap-3 sm:gap-6 ${
                mobileGridColumns === 1
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
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

      {/* Mobile Slide-Over / Bottom Sheet Filter Modal */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex justify-end lg:hidden transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-label="Filters and sorting"
        >
          <div className="w-full max-w-sm bg-[#F7F3EA] h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#E8DFD0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#164B3B]" />
                <h3 className="font-serif text-base font-semibold text-[#164B3B]">
                  Filter &amp; Sort Gallery
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full text-[#29231F] hover:bg-[#E8DFD0] cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Sorting */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2.5">
                  Sort Order
                </h4>
                <div className="space-y-1.5">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full p-2.5 rounded-lg text-xs text-left flex items-center justify-between transition-colors ${
                        sortBy === opt.value
                          ? 'bg-[#164B3B] text-white font-semibold'
                          : 'bg-white border border-[#E8DFD0] text-[#29231F]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#C6A15B]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2.5">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#164B3B] text-white font-semibold'
                          : 'bg-white border border-[#E8DFD0] text-[#29231F]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2.5">
                  Collections
                </h4>
                <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-[#E8DFD0]">
                  {collections.map((col) => (
                    <label key={col} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-col"
                        checked={selectedCollection === col}
                        onChange={() => setSelectedCollection(col)}
                        className="accent-[#164B3B]"
                      />
                      <span className={selectedCollection === col ? 'font-semibold text-[#164B3B]' : 'text-[#29231F]'}>
                        {col}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[#29231F]/70">Max Budget:</span>
                  <span className="font-bold text-[#164B3B] tabular-nums">{formatINR(effectiveMaxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max={catalogMaxPrice}
                  step="250"
                  value={effectiveMaxPrice}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-[#164B3B]"
                />
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#29231F] cursor-pointer bg-white p-3.5 rounded-xl border border-[#E8DFD0]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#164B3B]"
                  />
                  <span>In-Studio Pieces Only</span>
                </label>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 bg-white border-t border-[#E8DFD0] flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-[#F7F3EA] text-[#29231F] text-xs font-semibold rounded-xl hover:bg-[#E8DFD0] cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#164B3B] text-white text-xs font-semibold rounded-xl hover:bg-[#20634f] cursor-pointer text-center"
              >
                View {filteredProducts.length} Creations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
