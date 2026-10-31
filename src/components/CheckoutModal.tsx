/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, CreditCard, Smartphone, Building, ArrowLeft, Sparkles } from 'lucide-react';
import { CartItem, Order, OrderAddress } from '../types';
import { calculateOrderSummary, formatINR } from '../lib/ecommerceLogic';
import { getStoredUserProfile, saveStoredUserProfile } from '../lib/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  onClose,
  onOrderSuccess
}) => {
  const initialProfile = getStoredUserProfile();

  const [address, setAddress] = useState<OrderAddress>({
    fullName: initialProfile.name || '',
    email: initialProfile.email || '',
    phone: initialProfile.phone || '',
    street: initialProfile.street || '',
    apartment: '',
    city: initialProfile.city || '',
    state: initialProfile.state || '',
    pincode: initialProfile.pincode || '',
    country: 'India'
  });

  const [activePaymentTab, setActivePaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('collector@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = calculateOrderSummary(cart);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs
    if (!address.fullName.trim() || !address.email.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim() || !address.pincode.trim()) {
      setValidationError('Please complete all required delivery address fields.');
      return;
    }

    if (!address.email.includes('@')) {
      setValidationError('Please provide a valid email address for order confirmation.');
      return;
    }

    setIsProcessing(true);

    // Simulate Razorpay Gateway confirmation
    setTimeout(() => {
      saveStoredUserProfile({
        name: address.fullName,
        email: address.email,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      });

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        id: `ord-${randomNum}`,
        orderNumber: `UG-2026-${randomNum}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        status: 'Order Placed',
        trackingNumber: `DELHIVERY-UG${randomNum}`,
        address: { ...address },
        paymentMethod: 'Razorpay Online (UPI / Card / NetBanking)',
        paymentId: `pay_rzp_${Date.now()}`,
        paymentStatus: 'PAID'
      };

      setIsProcessing(false);
      onOrderSuccess(newOrder);
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Secure online checkout"
    >
      <div className="relative w-full max-w-4xl bg-[#F7F3EA] rounded-2xl shadow-2xl border border-[#E8DFD0] overflow-hidden my-8 max-h-[94vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD0] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#29231F] hover:bg-[#E8DFD0] transition-colors cursor-pointer"
              aria-label="Back to bag"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-serif text-xl font-semibold tracking-wide text-[#164B3B]">
              UNMADE GALLERY · Secure Checkout
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#164B3B] bg-[#164B3B]/10 px-3 py-1 rounded-full font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Razorpay Protected</span>
          </div>
        </div>

        {/* Checkout Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {validationError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Delivery Details & Payment Integration */}
            <div className="lg:col-span-7 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <h3 className="font-serif text-lg font-medium text-[#29231F] mb-4 flex items-center justify-between">
                  <span>1. Delivery Address</span>
                  <span className="text-xs font-sans text-[#C6A15B] font-semibold">India Insured Courier</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. Devika Singhania"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Email Address (for order receipts &amp; curing updates) *
                    </label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="collector@example.com"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Street Address &amp; House/Apartment No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="e.g. 402, Magnolia Enclave, 12th Main Road, Indiranagar"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="560038"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="w-full px-3 py-2 bg-[#E8DFD0]/40 border border-[#E8DFD0] rounded-lg text-xs text-[#29231F]/80"
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Online Payment Integration Module */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-medium text-[#29231F]">
                    2. Online Payment (Razorpay Integration)
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#164B3B] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
                    <span>Online Only</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F3EA] rounded-lg border border-[#E8DFD0] mb-4 text-xs text-[#29231F]/80">
                  <p className="font-semibold text-[#164B3B]">Exclusivity &amp; Payment Policy:</p>
                  <p className="mt-0.5">
                    As all resin artworks require custom batch preparation and slow 72-hour curing, <strong>Cash on Delivery (COD) is strictly not supported</strong>. Full payment via Razorpay guarantees your reservation.
                  </p>
                </div>

                {/* Razorpay Method Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#F7F3EA] rounded-lg border border-[#E8DFD0] mb-4">
                  <button
                    type="button"
                    onClick={() => setActivePaymentTab('upi')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePaymentTab === 'upi'
                        ? 'bg-white text-[#164B3B] shadow-xs'
                        : 'text-[#29231F]/70 hover:text-[#29231F]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentTab('card')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePaymentTab === 'card'
                        ? 'bg-white text-[#164B3B] shadow-xs'
                        : 'text-[#29231F]/70 hover:text-[#29231F]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentTab('netbanking')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePaymentTab === 'netbanking'
                        ? 'bg-white text-[#164B3B] shadow-xs'
                        : 'text-[#29231F]/70 hover:text-[#29231F]'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>NetBanking</span>
                  </button>
                </div>

                {/* Simulated Payment Sub-screens */}
                {activePaymentTab === 'upi' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-[#29231F]/70">
                      Enter Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okhdfcbank"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                    />
                    <div className="flex items-center gap-3 text-[11px] text-[#29231F]/60">
                      <span>Supported:</span>
                      <span className="font-semibold text-[#164B3B]">Google Pay</span>
                      <span>·</span>
                      <span className="font-semibold text-[#164B3B]">PhonePe</span>
                      <span>·</span>
                      <span className="font-semibold text-[#164B3B]">Paytm</span>
                      <span>·</span>
                      <span className="font-semibold text-[#164B3B]">BHIM</span>
                    </div>
                  </div>
                )}

                {activePaymentTab === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                        Card Number (Visa / Mastercard / RuPay)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-mono text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Expiry</label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#29231F]/70 mb-1">CVV</label>
                        <input
                          type="password"
                          defaultValue="•••"
                          className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activePaymentTab === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">
                      Select Your Financial Institution
                    </label>
                    <select className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs sticky top-4 space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#29231F] pb-3 border-b border-[#E8DFD0]">
                  Order Summary ({summary.itemCount} Items)
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-xs py-1 border-b border-[#E8DFD0]/40">
                      <div className="flex-1 pr-2 truncate">
                        <p className="font-medium text-[#29231F] truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#29231F]/60">Qty: {item.quantity} · {item.product.collection}</p>
                      </div>
                      <span className="font-semibold text-[#164B3B] tabular-nums shrink-0">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-2 text-xs text-[#29231F]/80 pt-2 border-t border-[#E8DFD0]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#29231F] tabular-nums">{formatINR(summary.subtotal)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-[#164B3B]">
                      <span>Privilege Discount</span>
                      <span className="font-medium tabular-nums">-{formatINR(summary.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Studio Delivery</span>
                    <span className="font-medium tabular-nums">
                      {summary.shipping === 0 ? <span className="text-[#164B3B]">Complimentary</span> : formatINR(summary.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handcraft GST (3%)</span>
                    <span className="font-medium tabular-nums">{formatINR(summary.tax)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-[#164B3B] pt-3 border-t border-[#E8DFD0]">
                    <span>Grand Total</span>
                    <span className="tabular-nums">{formatINR(summary.total)}</span>
                  </div>
                </div>

                {/* Submit Payment CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-xl text-xs font-semibold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#C6A15B]" />
                      <span>Authorising Razorpay Gateway...</span>
                    </span>
                  ) : (
                    <span>Pay {formatINR(summary.total)} via Razorpay</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-[#29231F]/60">
                    By confirming, you authorize Razorpay to charge your selected instrument for {formatINR(summary.total)}.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
