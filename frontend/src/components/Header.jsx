/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, ShieldCheck, Menu, X } from 'lucide-react';

export const Header = ({
  cartCount,
  wishlistCount,
  activePage,
  isAdmin = false,
  onNavigate,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Shop', id: 'shop' },
    { label: 'Collections', id: 'collections' },
    { label: 'Custom Orders', id: 'custom' },
    { label: 'About Us', id: 'about' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EA]/95 backdrop-blur-md border-b border-[#E8DFD0] transition-colors duration-200">
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#164B3B] text-[#F7F3EA] text-xs font-medium py-1.5 px-4 text-center tracking-wider">
        <span>Complimentary insured shipping across India on orders over ₹3,000 · Code FIRSTSTORY for 10% off</span>
      </div>

      {/* Main Navigation Row - Strictly adheres to 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Zone 1: Brand Monogram + Wordmark */}
        <div className="flex items-center min-w-0">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none min-w-0"
            aria-label="UNMADE GALLERY Home"
          >
            <img
              src="/assets/aistudio/UnmadeGallary_logo_a9081e82.png"
              alt="UNMADE GALLERY Monogram"
              className="h-8 sm:h-11 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-serif text-[14px] sm:text-2xl md:text-[26px] font-semibold tracking-[0.08em] sm:tracking-[0.16em] text-[#164B3B] uppercase transition-colors group-hover:text-[#C6A15B] whitespace-nowrap truncate">
              UNMADE GALLERY
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Text Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors duration-150 py-1 border-b-2 cursor-pointer ${
                activePage === link.id
                  ? 'text-[#164B3B] border-[#164B3B] font-semibold'
                  : 'text-[#29231F]/80 border-transparent hover:text-[#164B3B] hover:border-[#C6A15B]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Functional Interactive Affordances */}
        <div className="flex items-center gap-0.5 sm:gap-3 lg:gap-4 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 text-[#29231F] hover:text-[#164B3B] hover:bg-[#E8DFD0]/40 rounded-full transition-colors cursor-pointer"
            aria-label="Search resin art collection"
          >
            <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[1.6]" />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={() => (onOpenWishlist ? onOpenWishlist() : onNavigate('account', { tab: 'wishlist' }))}
            className="relative p-1.5 sm:p-2 text-[#29231F] hover:text-[#164B3B] hover:bg-[#E8DFD0]/40 rounded-full transition-colors cursor-pointer"
            aria-label={`View wishlist, ${wishlistCount} items`}
          >
            <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[1.6]" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-[#C6A15B] text-[#164B3B] font-bold text-[10px] rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account Trigger */}
          <button
            onClick={() => onNavigate('account')}
            className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
              activePage === 'account'
                ? 'text-[#164B3B] bg-[#E8DFD0]'
                : 'text-[#29231F] hover:text-[#164B3B] hover:bg-[#E8DFD0]/40'
            }`}
            aria-label="Customer account and orders"
          >
            <User className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[1.6]" />
          </button>

          {/* Shopping Bag Trigger with Cart Count */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 bg-[#164B3B] text-[#F7F3EA] hover:bg-[#20634f] rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 ml-0.5"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
            <span className="text-xs font-semibold tracking-wider">
              {cartCount > 0 ? (
                cartCount
              ) : (
                <span className="hidden sm:inline">Bag</span>
              )}
            </span>
          </button>

          {/* Admin Studio Portal Button (Only shown to authenticated admins) */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition-colors cursor-pointer shrink-0 ${
                activePage === 'admin'
                  ? 'border-[#164B3B] text-[#164B3B] bg-[#E8DFD0]/60'
                  : 'border-[#E8DFD0] text-[#29231F]/70 hover:border-[#C6A15B] hover:text-[#164B3B]'
              }`}
              title="Switch to Artisan Admin Studio"
              aria-label="Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>Admin</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 md:hidden text-[#29231F] hover:text-[#164B3B] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F3EA] border-b border-[#E8DFD0] px-6 py-5 shadow-lg">
          <nav className="flex flex-col gap-4 text-base font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 border-b border-[#E8DFD0]/60 transition-colors ${
                  activePage === link.id
                    ? 'text-[#164B3B] font-semibold pl-2 border-l-2 border-[#164B3B]'
                    : 'text-[#29231F] hover:text-[#164B3B]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs font-medium text-[#164B3B] bg-[#E8DFD0]/80 px-3 py-2 rounded-md"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
                  Artisan Admin Studio
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
