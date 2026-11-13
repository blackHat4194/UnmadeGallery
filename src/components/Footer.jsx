/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 3000);
  };

  return (
    <footer className="bg-[#29231F] text-[#F7F3EA] border-t border-[#3d342e] pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Promise Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-14 border-b border-[#3d342e]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#164B3B] flex items-center justify-center shrink-0 border border-[#C6A15B]/30">
              <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#F7F3EA]">100% Handcrafted Exclusivity</h3>
              <p className="text-sm text-[#E8DFD0]/70 mt-1 leading-relaxed">
                No two resin currents or preserved petals are identical. Each creation is an unrepeatable piece of wearable art.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#164B3B] flex items-center justify-center shrink-0 border border-[#C6A15B]/30">
              <ShieldCheck className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#F7F3EA]">Non-Yellowing UV Guarantee</h3>
              <p className="text-sm text-[#E8DFD0]/70 mt-1 leading-relaxed">
                Formulated with museum-grade UV stabilizers and optical clarity blockers to resist yellowing for years.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#164B3B] flex items-center justify-center shrink-0 border border-[#C6A15B]/30">
              <HeartHandshake className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#F7F3EA]">Artisan Custom Commissions</h3>
              <p className="text-sm text-[#E8DFD0]/70 mt-1 leading-relaxed">
                Preserve bridal bouquets, anniversary florals, and milestone memories forever in high-gloss architectural resin.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-14 border-b border-[#3d342e]">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <span className="font-serif text-2xl font-semibold tracking-[0.2em] text-[#F7F3EA] uppercase">
              UNMADE GALLERY
            </span>
            <p className="text-xs tracking-widest text-[#C6A15B] uppercase mt-1 font-medium">
              Handmade Resin Art &amp; Botanical Keepsakes
            </p>
            <p className="text-sm text-[#E8DFD0]/70 mt-4 leading-relaxed max-w-sm">
              We bridge organic impermanence and everlasting sculptural form. Thoughtfully crafted in our artisanal studio for collectors who cherish the tactile poetry of nature.
            </p>
            <div className="mt-6 text-xs text-[#E8DFD0]/60 space-y-1">
              <p>Studio Atelier: 14 Indiranagar Arts Quarter, Bengaluru, India</p>
              <p>Concierge: atelier@unmadegallery.com · +91 (080) 4920-1122</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C6A15B] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8DFD0]/80">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  All Collections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Botanical Jewellery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Emerald Sculptures
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('custom')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Custom Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Our Artisan Story
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C6A15B] mb-4">
              Client Service
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8DFD0]/80">
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Resin Care Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Shipping &amp; Insurance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#C6A15B] transition-colors cursor-pointer">
                  Return &amp; Exchange Terms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-[#C6A15B] hover:underline transition-colors cursor-pointer">
                  Artisan Studio Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4">
            <h4 className="font-serif text-lg font-medium text-[#F7F3EA] mb-2">
              Receive The Private Journal
            </h4>
            <p className="text-sm text-[#E8DFD0]/70 mb-4 leading-relaxed">
              Subscribers receive early access to limited seasonal botanical drops and private studio commission openings.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#164B3B]/40 border border-[#164B3B] rounded-lg text-sm text-[#F7F3EA]">
                <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" />
                <span>You have been added to our private collector circle. Welcome.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full pl-4 pr-12 py-3 bg-[#1d1916] border border-[#3d342e] rounded-lg text-sm text-[#F7F3EA] placeholder:text-[#E8DFD0]/40 focus:outline-none focus:border-[#C6A15B] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#164B3B] text-[#F7F3EA] hover:bg-[#20634f] rounded-md transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#E8DFD0]/50">
                  Strictly online payments powered by Razorpay. Zero spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Security Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8DFD0]/60">
          <p>© {new Date().getFullYear()} UNMADE GALLERY. All Rights Reserved. Art That Holds A Story.</p>
          <div className="flex items-center gap-6">
            <span>Online Payments Secured by Razorpay</span>
            <span>·</span>
            <span>Handmade in Bengaluru, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
