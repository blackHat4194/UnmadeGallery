/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Heart, MapPin, User, CheckCircle2, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { formatINR } from '../lib/ecommerceLogic.js';
import { apiUrl } from '../lib/api.js';
import { ResinArtImage } from './ResinArtImage.jsx';
import { getStoredUserProfile, saveStoredUserProfile } from '../lib/storage.js';

export const AccountView = ({
  initialTab = 'orders',
  orders,
  wishlistIds,
  allProducts,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(getStoredUserProfile());
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authFeedback, setAuthFeedback] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(() => Boolean(typeof window !== 'undefined' && localStorage.getItem('unmade_jwt_token')));

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    saveStoredUserProfile(profile);
    try {
      await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch {
      // Local profile still saved
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthFeedback(null);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authMode === 'register'
          ? { name: authName, email: authEmail, password: authPassword }
          : { email: authEmail, password: authPassword };
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', text: data.error || 'Authentication failed.' });
        return;
      }
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('unmade_jwt_token', data.token);
      }
      if (data.user) {
        const nextProfile = { ...profile, ...data.user };
        setProfile(nextProfile);
        saveStoredUserProfile(nextProfile);
      }
      setIsSignedIn(true);
      setAuthPassword('');
      setAuthFeedback({
        type: 'success',
        text: authMode === 'register' ? 'Collector account created & signed in.' : 'Signed in successfully.'
      });
    } catch {
      setAuthFeedback({ type: 'error', text: 'Unable to reach authentication server.' });
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unmade_jwt_token');
    }
    setIsSignedIn(false);
    setAuthFeedback({ type: 'success', text: 'Signed out of collector session.' });
  };

  const statusSteps = [
    { label: 'Order Placed', desc: 'Payment verified via Razorpay' },
    { label: 'Resin Pouring & Curing', desc: 'Slow 72-hour thermal encapsulation' },
    { label: 'Hand Polishing & Assembly', desc: 'Mirror finish & 18k gold hardware' },
    { label: 'Dispatched', desc: 'Handed to insured priority courier' },
    { label: 'Delivered', desc: 'Safely in client possession' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Resin Pouring & Curing': return 1;
      case 'Hand Polishing & Assembly': return 2;
      case 'Dispatched': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Header */}
      <div className="border-b border-[#E8DFD0] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A15B]">
            Client Salon
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#164B3B] mt-1">
            Welcome, {profile.name || 'Resin Collector'}
          </h1>
          <p className="text-xs text-[#29231F]/70 mt-1">
            Manage your bespoke commissions, orders, and saved gallery creations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium bg-white px-3.5 py-2 rounded-xl border border-[#E8DFD0] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#164B3B]" />
          <span>Verified Client Account: {profile.email}</span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#E8DFD0]/60 text-xs font-semibold tracking-wider uppercase">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#164B3B] text-[#F7F3EA] shadow-xs'
              : 'bg-white text-[#29231F] border border-[#E8DFD0] hover:bg-[#F7F3EA]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders &amp; Tracking ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'bg-[#164B3B] text-[#F7F3EA] shadow-xs'
              : 'bg-white text-[#29231F] border border-[#E8DFD0] hover:bg-[#F7F3EA]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Pieces ({wishlistedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('address')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'address'
              ? 'bg-[#164B3B] text-[#F7F3EA] shadow-xs'
              : 'bg-white text-[#29231F] border border-[#E8DFD0] hover:bg-[#F7F3EA]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Address</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#164B3B] text-[#F7F3EA] shadow-xs'
              : 'bg-white text-[#29231F] border border-[#E8DFD0] hover:bg-[#F7F3EA]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Account</span>
        </button>
      </div>

      {/* Tab: Orders & Live Curing Tracking */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-serif text-lg font-medium text-[#29231F]">
              Purchase History
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-[#E8DFD0] text-center">
                <p className="text-xs text-[#29231F]/70">No orders placed yet.</p>
              </div>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#164B3B] shadow-md ring-1 ring-[#164B3B]'
                        : 'bg-white/80 border-[#E8DFD0] hover:border-[#C6A15B]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono font-bold text-[#164B3B]">{order.orderNumber}</span>
                      <span className="text-[11px] text-[#29231F]/60">{order.date}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#29231F]">
                          {order.items.length} {order.items.length === 1 ? 'creation' : 'creations'}
                        </p>
                        <p className="text-[11px] text-[#C6A15B] font-medium mt-0.5">
                          Status: {order.status}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#164B3B] tabular-nums">
                          {formatINR(order.total)}
                        </span>
                        <p className="text-[10px] text-emerald-700 font-medium">Razorpay Paid</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Order Detailed Progress */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD0] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD0] pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-[#C6A15B] font-semibold">
                      Order ID: {selectedOrder.orderNumber}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-[#29231F]">
                      Artisan Crafting &amp; Courier Tracking
                    </h3>
                  </div>

                  <div className="text-xs">
                    <span className="text-[#29231F]/60">Airway Bill: </span>
                    <strong className="font-mono text-[#164B3B]">{selectedOrder.trackingNumber}</strong>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="py-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-6">
                    Creation &amp; Delivery Milestones
                  </h4>

                  <div className="relative border-l-2 border-[#E8DFD0] ml-3 space-y-6">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(selectedOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={idx} className="relative pl-6">
                          <div
                            className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              isComplete
                                ? 'bg-[#164B3B] text-white ring-4 ring-[#164B3B]/10'
                                : 'bg-[#E8DFD0] text-[#29231F]/40'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 bg-[#29231F]/40 rounded-full" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-semibold ${isCurrent ? 'text-[#164B3B]' : isComplete ? 'text-[#29231F]' : 'text-[#29231F]/50'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <span className="bg-[#C6A15B]/20 text-[#164B3B] text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#29231F]/60 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="pt-4 border-t border-[#E8DFD0]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-3">
                    Items In This Consignment
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between text-xs p-2.5 bg-[#F7F3EA] rounded-lg border border-[#E8DFD0]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-white overflow-hidden shrink-0 border border-[#E8DFD0]">
                            <ResinArtImage type={item.product.resinArtworkType} imageUrl={item.product.imageUrl} alt={item.product.name} />
                          </div>
                          <div>
                            <p className="font-medium text-[#29231F]">{item.product.name}</p>
                            <p className="text-[11px] text-[#29231F]/60">Qty: {item.quantity} · {formatINR(item.product.price)} each</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#164B3B] tabular-nums">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Destination */}
                <div className="pt-4 border-t border-[#E8DFD0] text-xs space-y-1 text-[#29231F]/80">
                  <p className="font-semibold text-[#164B3B]">Shipping Address:</p>
                  <p>{selectedOrder.address.fullName} · {selectedOrder.address.phone}</p>
                  <p>{selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-[#E8DFD0] text-center text-xs text-[#29231F]/60">
                Select an order to view its artisan curing schedule.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          <h2 className="font-serif text-xl font-medium text-[#29231F] mb-6">
            Your Curated Wishlist ({wishlistedProducts.length})
          </h2>

          {wishlistedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E8DFD0] text-center max-w-md mx-auto">
              <Heart className="w-10 h-10 text-[#C6A15B] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-medium text-[#29231F]">No pieces saved yet</h3>
              <p className="text-xs text-[#29231F]/70 mt-1">
                Click the heart icon on any artwork to save it to your private portfolio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-[#E8DFD0] p-4 flex flex-col justify-between shadow-xs">
                  <div onClick={() => onSelectProduct(p)} className="cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#F7F3EA] mb-3 border border-[#E8DFD0]">
                      <ResinArtImage type={p.resinArtworkType} imageUrl={p.imageUrl} alt={p.name} />
                    </div>
                    <p className="text-[11px] text-[#C6A15B] uppercase font-semibold">{p.category}</p>
                    <h3 className="font-serif text-base font-medium text-[#29231F] mt-0.5">{p.name}</h3>
                    <p className="text-sm font-bold text-[#164B3B] mt-1 tabular-nums">{formatINR(p.price)}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DFD0] flex gap-2">
                    <button
                      onClick={() => onAddToCart(p)}
                      className="flex-1 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => onToggleWishlist(p.id)}
                      className="px-3 py-2 bg-[#F7F3EA] text-red-700 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Delivery Address */}
      {activeTab === 'address' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-sm">
          <h2 className="font-serif text-xl font-medium text-[#29231F] mb-4">
            Saved Shipping Address
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Street Address</label>
              <input
                type="text"
                value={profile.street}
                onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F]/70 mb-1">PIN Code</label>
              <input
                type="text"
                value={profile.pincode}
                onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
            >
              Update Address
            </button>
            {saveSuccess && <span className="ml-3 text-xs text-emerald-700 font-semibold">Address saved!</span>}
          </form>
        </div>
      )}

      {/* Tab: Profile Details & Collector Auth */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-sm">
            <h2 className="font-serif text-xl font-medium text-[#29231F] mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
              {saveSuccess && <span className="ml-3 text-xs text-emerald-700 font-semibold">Profile updated!</span>}
            </form>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium text-[#29231F]">
                Collector Account Access
              </h2>
              {isSignedIn && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {authFeedback && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  authFeedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {authFeedback.text}
              </div>
            )}

            <div className="flex gap-2 p-1 bg-[#F7F3EA] rounded-lg border border-[#E8DFD0] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-md cursor-pointer ${
                  authMode === 'login' ? 'bg-white text-[#164B3B] shadow-xs' : 'text-[#29231F]/70'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-md cursor-pointer ${
                  authMode === 'register' ? 'bg-white text-[#164B3B] shadow-xs' : 'text-[#29231F]/70'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="collector@example.com"
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{authMode === 'register' ? 'Create Account' : 'Sign In'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
