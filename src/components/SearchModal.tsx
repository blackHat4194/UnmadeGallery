/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../lib/ecommerceLogic';
import { ResinArtImage } from './ResinArtImage';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToShopWithSearch: (term: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
  onNavigateToShopWithSearch
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const popularSearches = [
    'Baby’s Breath',
    'Emerald Hoops',
    'Preserved Rose',
    'Gold Leaf',
    'Coasters',
    'Hydrangea'
  ];

  const results = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specifications.inclusions.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search the gallery"
    >
      <div className="bg-[#F7F3EA] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DFD0] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD0] bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-[#164B3B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by botanical flower, collection, or resin piece..."
            className="flex-1 bg-transparent text-sm text-[#29231F] placeholder:text-[#29231F]/50 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#29231F]/50 hover:text-[#29231F] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#164B3B] px-2.5 py-1 rounded hover:bg-[#E8DFD0] transition-colors cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Modal Results / Popular Searches */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/60 mb-3">
                Curated Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-white border border-[#E8DFD0] rounded-lg text-xs font-medium text-[#29231F] hover:border-[#C6A15B] hover:text-[#164B3B] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/60 mb-2">
                Found {results.length} Pieces
              </p>
              {results.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="p-3 bg-white rounded-xl border border-[#E8DFD0] hover:border-[#C6A15B] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F7F3EA] shrink-0 border border-[#E8DFD0]">
                      <ResinArtImage type={p.resinArtworkType} alt={p.name} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#C6A15B] uppercase font-semibold">{p.category}</p>
                      <h4 className="font-serif text-sm font-medium text-[#29231F] group-hover:text-[#164B3B]">
                        {p.name}
                      </h4>
                      <p className="text-xs text-[#29231F]/60 truncate max-w-xs">{p.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="text-xs font-bold text-[#164B3B] tabular-nums">
                      {formatINR(p.price)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#C6A15B] ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  onNavigateToShopWithSearch(query);
                  onClose();
                }}
                className="w-full mt-3 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer text-center"
              >
                View all results in Shop
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm font-serif text-[#29231F]">No creations found for "{query}"</p>
              <p className="text-xs text-[#29231F]/60 mt-1">Try searching for "rose", "emerald", "gold", or "earrings".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
