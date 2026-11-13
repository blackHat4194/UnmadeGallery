/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ResinArtImage } from './ResinArtImage.jsx';
import { calculateOrderSummary, formatINR, FREE_SHIPPING_THRESHOLD } from '../lib/ecommerceLogic.js';

export const CartDrawer = ({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onExploreShop
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(undefined);
  const [couponError, setCouponError] = useState(null);

  if (!isOpen) return null;

  const summary = calculateOrderSummary(cart, appliedCoupon);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === 'FIRSTSTORY' || code === 'GALLERY15') {
      setAppliedCoupon(code);
    } else {
      setCouponError('Invalid promotion code. Try FIRSTSTORY for 10% off.');
    }
  };

  const progressPercent = Math.min(100, Math.round((summary.discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#29231F]/60 backdrop-blur-sm flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Your shopping bag"
    >
      <div className="w-full max-w-md bg-[#F7F3EA] h-full shadow-2xl flex flex-col justify-between border-l border-[#E8DFD0]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#164B3B]" />
            <h2 className="font-serif text-lg font-medium text-[#29231F]">
              Your Shopping Bag ({summary.itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#29231F] hover:bg-[#E8DFD0] transition-colors cursor-pointer"
            aria-label="Close shopping bag drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#E8DFD0]/40 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#E8DFD0]">
          {summary.isFreeShipping && cart.length > 0 ? (
            <div className="flex items-center gap-2 text-xs text-[#164B3B] font-semibold">
              <Sparkles className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>You have unlocked Complimentary Insured Delivery across India!</span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#29231F]/80">
                Add <strong className="text-[#164B3B]">{formatINR(summary.amountToFreeShipping)}</strong> more to unlock complimentary delivery
              </p>
              <div className="w-full bg-[#E8DFD0] rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-[#164B3B] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#E8DFD0]/50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#164B3B]/60" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#29231F]">
                Your Bag Is Waiting
              </h3>
              <p className="text-xs text-[#29231F]/70 mt-1 max-w-xs leading-relaxed">
                Discover thoughtfully crafted resin jewellery, botanical keepsakes, and collector pieces.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreShop();
                }}
                className="mt-6 px-5 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#20634f] transition-all cursor-pointer shadow-sm"
              >
                Explore The Gallery
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3.5 bg-white rounded-xl border border-[#E8DFD0] flex gap-3 shadow-xs"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F7F3EA] shrink-0 border border-[#E8DFD0]">
                  <ResinArtImage
                    type={item.product.resinArtworkType}
                    alt={item.product.name}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-sm font-medium text-[#29231F] leading-snug">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#29231F]/40 hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#C6A15B] uppercase tracking-wider font-semibold mt-0.5">
                      {item.product.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#E8DFD0] rounded-md overflow-hidden bg-[#F7F3EA]">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-[#E8DFD0] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-semibold tabular-nums text-[#164B3B]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-[#E8DFD0] transition-colors cursor-pointer disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-[#164B3B] tabular-nums">
                      {formatINR(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Summary / Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8DFD0] bg-white space-y-3 sm:space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (e.g. FIRSTSTORY)"
                  className="w-full pl-3 pr-3 py-1.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs uppercase tracking-wider focus:outline-none focus:border-[#C6A15B]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#E8DFD0] hover:bg-[#C6A15B] hover:text-[#164B3B] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-[#164B3B] font-medium bg-[#164B3B]/10 px-2.5 py-1 rounded">
                <span>Code {appliedCoupon} active</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(undefined)}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#29231F]/80 pt-2 border-t border-[#E8DFD0]/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#29231F]">{formatINR(summary.subtotal)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-[#164B3B]">
                  <span>Privilege Discount</span>
                  <span className="tabular-nums font-medium">-{formatINR(summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Studio Shipping</span>
                <span className="tabular-nums font-medium">
                  {summary.shipping === 0 ? <span className="text-[#164B3B]">Complimentary</span> : formatINR(summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Handcraft GST (3%)</span>
                <span className="tabular-nums font-medium">{formatINR(summary.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#164B3B] pt-2 border-t border-[#E8DFD0]">
                <span>Order Total</span>
                <span className="tabular-nums">{formatINR(summary.total)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-xl text-xs font-semibold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#29231F]/60 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#164B3B] shrink-0" />
              <span>Only Online Payment Supported · Razorpay 256-bit Secure</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
