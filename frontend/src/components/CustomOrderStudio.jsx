/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { estimateCustomOrderPrice, formatINR } from '../lib/ecommerceLogic.js';
import { apiFetch } from '../lib/api.js';
import { saveStoredCustomOrder } from '../lib/storage.js';

export const CustomOrderStudio = ({ onSuccess }) => {
  const [itemType, setItemType] = useState('Pyramid Keepsake');
  const [selectedFlowers, setSelectedFlowers] = useState(['Dried Red Rose Petals', 'White Baby’s Breath']);
  const [metalAccents, setMetalAccents] = useState('24k Gold Leaf');
  const [resinBaseColor, setResinBaseColor] = useState('Crystal Clear');
  const [personalizedText, setPersonalizedText] = useState('');
  const [occasion] = useState('Wedding Keepsake');
  const [specialNotes, setSpecialNotes] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const availableFlowers = [
    'Dried Red Rose Petals',
    'White Baby’s Breath',
    'Periwinkle Hydrangea Florets',
    'Forget-Me-Nots',
    'Golden Fern Fronds',
    'Wild Hill Lavender'
  ];

  const toggleFlower = (flower) => {
    if (selectedFlowers.includes(flower)) {
      if (selectedFlowers.length > 1) {
        setSelectedFlowers(selectedFlowers.filter((f) => f !== flower));
      }
    } else {
      setSelectedFlowers([...selectedFlowers, flower]);
    }
  };

  const estimatedPrice = estimateCustomOrderPrice({
    itemType,
    flowerCount: selectedFlowers.length,
    metalAccents,
    hasPersonalizedText: personalizedText.trim().length > 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMsg('Please provide your name, email and phone so our studio lead can send the preview render.');
      return;
    }

    const randomId = `cust-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest = {
      id: randomId,
      requestDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      clientName,
      clientEmail,
      clientPhone,
      itemType,
      flowerInclusions: selectedFlowers,
      metalAccents,
      resinBaseColor,
      personalizedText: personalizedText.trim() || undefined,
      occasion,
      specialNotes: specialNotes.trim() || undefined,
      estimatedPrice,
      status: 'Pending Review'
    };

    let savedRequest = newRequest;
    try {
      const res = await apiFetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.customOrder) {
          savedRequest = data.customOrder;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Please check your commission details and try again.');
        return;
      }
    } catch {
      saveStoredCustomOrder(newRequest);
    }
    setSubmittedId(savedRequest.id);
    setIsSubmitted(true);
    onSuccess(savedRequest);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
          Artisan Commission Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#164B3B] mt-2 mb-4">
          Create Your Bespoke Keepsake
        </h1>
        <p className="text-sm sm:text-base text-[#29231F]/80 leading-relaxed">
          From wedding bouquet petals to milestone anniversary memories, our master resin artisans encapsulate your sacred moments inside heirloom optical resin.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8DFD0] shadow-md text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#164B3B]/10 text-[#164B3B] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#164B3B]" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#164B3B]">
            Commission Brief Received
          </h2>
          <p className="text-xs font-mono text-[#C6A15B] tracking-wider uppercase mt-1">
            Reference ID: {submittedId}
          </p>
          <p className="text-sm text-[#29231F]/80 mt-4 leading-relaxed">
            Thank you, <strong>{clientName}</strong>. Our senior resin artist will review your selected botanicals, prepare a digital placement sketch, and email you within 24 hours at <strong>{clientEmail}</strong>.
          </p>
          <div className="mt-6 p-4 bg-[#F7F3EA] rounded-xl text-left text-xs space-y-1.5 border border-[#E8DFD0]">
            <p><strong>Item Requested:</strong> {itemType}</p>
            <p><strong>Botanicals:</strong> {selectedFlowers.join(', ')}</p>
            <p><strong>Precious Flakes:</strong> {metalAccents}</p>
            <p><strong>Estimated Quote:</strong> {formatINR(estimatedPrice)} (subject to final botanical inspection)</p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-6 px-6 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#20634f] transition-all cursor-pointer"
          >
            Submit Another Commission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Interactive Builder */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-sm space-y-6 sm:space-y-8">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Item Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-3">
                1. Select Silhouette &amp; Canvas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  'Preserved Floral Pendant',
                  'Statement Earrings',
                  'Pyramid Keepsake',
                  'Coaster Set (Pair of 2)',
                  'Botanical Bookmark'
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemType(type)}
                    className={`p-3 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      itemType === type
                        ? 'border-[#164B3B] bg-[#164B3B]/5 text-[#164B3B] font-semibold ring-1 ring-[#164B3B]'
                        : 'border-[#E8DFD0] text-[#29231F]/80 hover:border-[#C6A15B]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Floral Inclusions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#29231F]/70">
                  2. Choose Preserved Botanical Inclusions
                </label>
                <span className="text-[11px] text-[#C6A15B] font-medium">
                  {selectedFlowers.length} selected
                </span>
              </div>
              <p className="text-xs text-[#29231F]/60 mb-3">
                You may select multiple flora, or mail us your own dried bridal bouquet petals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {availableFlowers.map((flower) => {
                  const isChecked = selectedFlowers.includes(flower);
                  return (
                    <button
                      key={flower}
                      type="button"
                      onClick={() => toggleFlower(flower)}
                      className={`p-2.5 text-xs text-left rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#164B3B] bg-[#164B3B] text-[#F7F3EA] font-medium'
                          : 'border-[#E8DFD0] text-[#29231F] hover:bg-[#F7F3EA]'
                      }`}
                    >
                      <span className="truncate pr-1">{flower}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Precious Metal Leaf & Base Tint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2">
                  3. Precious Foil Accents
                </label>
                <select
                  value={metalAccents}
                  onChange={(e) => setMetalAccents(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                >
                  <option>24k Gold Leaf</option>
                  <option>Rose Gold Flakes</option>
                  <option>Silver Leaf</option>
                  <option>None (Pure Resin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-2">
                  4. Resin Base Tint
                </label>
                <select
                  value={resinBaseColor}
                  onChange={(e) => setResinBaseColor(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                >
                  <option>Crystal Clear</option>
                  <option>Deep Emerald Swirl</option>
                  <option>Smoky Amber</option>
                  <option>Soft Rose Tint</option>
                </select>
              </div>
            </div>

            {/* Step 4: Personalization / Inscription */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-1">
                5. Custom Engraving / Date / Initials (Optional)
              </label>
              <input
                type="text"
                value={personalizedText}
                onChange={(e) => setPersonalizedText(e.target.value)}
                placeholder="e.g. A & R · 24.10.2026 or Forever Cherished"
                className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
              />
            </div>

            {/* Step 5: Contact Details */}
            <div className="pt-4 border-t border-[#E8DFD0]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#29231F]/70 mb-3">
                6. Contact Information For Studio Consultation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Your Email *"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Phone (for WhatsApp preview) *"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Tell us about the memory or special instructions (e.g. 'I will courier my wedding rose bouquet to your Bengaluru studio')..."
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-xl text-xs font-semibold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Bespoke Brief ({formatINR(estimatedPrice)} Estimate)</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>
          </form>

          {/* Right Column: Artisan Process & Estimate Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Pricing Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A15B]">
                Live Studio Quotation
              </span>
              <div className="mt-2 flex items-baseline justify-between border-b border-[#E8DFD0] pb-3">
                <span className="text-sm font-medium text-[#29231F]">Estimated Quote</span>
                <span className="text-2xl font-bold text-[#164B3B] tabular-nums">
                  {formatINR(estimatedPrice)}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#29231F]/80">
                <li className="flex justify-between">
                  <span>Base Canvas ({itemType})</span>
                  <span>Included</span>
                </li>
                <li className="flex justify-between">
                  <span>Flora Preservation ({selectedFlowers.length} botanical species)</span>
                  <span>{selectedFlowers.length > 1 ? `+${formatINR((selectedFlowers.length - 1) * 350)}` : 'Included'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Metal Accent ({metalAccents})</span>
                  <span>{metalAccents === '24k Gold Leaf' ? '+₹600' : metalAccents !== 'None (Pure Resin)' ? '+₹400' : '₹0'}</span>
                </li>
                {personalizedText && (
                  <li className="flex justify-between text-[#164B3B] font-medium">
                    <span>Precision Underside Inscription</span>
                    <span>+₹450</span>
                  </li>
                )}
              </ul>
              <div className="mt-4 pt-3 border-t border-[#E8DFD0] flex items-center gap-2 text-[11px] text-[#29231F]/60">
                <ShieldCheck className="w-4 h-4 text-[#164B3B]" />
                <span>Zero obligation to proceed until you approve the resin sketch</span>
              </div>
            </div>

            {/* The 4-Stage Commission Process */}
            <div className="bg-[#164B3B] text-[#F7F3EA] p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-medium text-[#F7F3EA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                <span>The Creation Journey</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex gap-3">
                  <span className="font-mono text-[#C6A15B] font-bold">01.</span>
                  <div>
                    <p className="font-semibold text-white">Botanical Intake</p>
                    <p className="text-[#E8DFD0]/70 text-[11px]">We receive or harvest your specimens, stabilizing them over 2 weeks.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-mono text-[#C6A15B] font-bold">02.</span>
                  <div>
                    <p className="font-semibold text-white">Digital Placement Preview</p>
                    <p className="text-[#E8DFD0]/70 text-[11px]">You approve a photo arrangement of petals and gold foil before resin pours.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-mono text-[#C6A15B] font-bold">03.</span>
                  <div>
                    <p className="font-semibold text-white">Multi-Layer Vacuum Degassing</p>
                    <p className="text-[#E8DFD0]/70 text-[11px]">Poured in 3 distinct thermal stages to prevent bubble traps and petal scorching.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-mono text-[#C6A15B] font-bold">04.</span>
                  <div>
                    <p className="font-semibold text-white">Heirloom Hand Polish</p>
                    <p className="text-[#E8DFD0]/70 text-[11px]">Hand-beveled, polished to glass transparency, and encased in luxury linen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
