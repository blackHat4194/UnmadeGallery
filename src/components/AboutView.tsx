/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Award, Clock, ArrowRight } from 'lucide-react';
import { ResinArtImage } from './ResinArtImage';
import { BRAND_VALUES } from '../data/products';

interface AboutViewProps {
  onNavigate: (page: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
          Artisan Manifesto
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#164B3B] mt-2 mb-4 leading-tight">
          Where Ephemeral Nature Becomes Eternal Sculpture.
        </h1>
        <p className="text-sm sm:text-base text-[#29231F]/80 leading-relaxed font-normal">
          UNMADE GALLERY is an independent art studio based in Bengaluru, India. We specialize in preserving the fragile, untamed poetry of wild botanicals inside high-gloss optical resin.
        </p>
      </div>

      {/* Visual Split: The Studio Process */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border border-[#E8DFD0] p-4">
          <ResinArtImage type="monstera-leaf" alt="Artisan craftsmanship in resin" className="w-full h-full rounded-xl" />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#164B3B]">
            The Alchemy of Multi-Stage Curing
          </h2>
          <p className="text-sm text-[#29231F]/80 leading-relaxed">
            Resin casting is an uncompromising science of patience and thermodynamics. While commercial jewellery factories flash-cure synthetic plastics in minutes under UV lamps, we cure our creations through progressive thermal stages over 72 to 144 hours.
          </p>
          <p className="text-sm text-[#29231F]/80 leading-relaxed">
            This slow exothermic curing dissipates microscopic bubbles naturally and protects delicate flower pigments from heat-scorching, preserving their original vivid hues for generations.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#20634f] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore The Studio Creations</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Brand Values Grid */}
      <div className="pt-8 border-t border-[#E8DFD0]">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-center text-[#164B3B] mb-12">
          The Four Studio Pillars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRAND_VALUES.map((val, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-serif text-2xl font-bold text-[#C6A15B] block mb-2">
                  0{idx + 1}.
                </span>
                <h3 className="font-serif text-lg font-medium text-[#164B3B] mb-2">
                  {val.title}
                </h3>
                <p className="text-xs text-[#29231F]/75 leading-relaxed">
                  {val.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resin Care & Preservation Guidelines */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E8DFD0] shadow-sm">
        <h2 className="font-serif text-2xl font-medium text-[#164B3B] mb-4">
          Caring For Your Resin Heirloom
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#29231F]/80 leading-relaxed">
          <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0]">
            <h4 className="font-semibold text-[#164B3B] mb-1">Light &amp; Temperature</h4>
            <p>Our resin contains advanced UV inhibitors, but storing your jewellery in a dark velvet pouch when not in use ensures your botanicals remain vivid indefinitely.</p>
          </div>
          <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0]">
            <h4 className="font-semibold text-[#164B3B] mb-1">Chemicals &amp; Perfumes</h4>
            <p>Always put on your resin jewellery after applying makeup, hairspray, and fine perfumes. Avoid harsh alcohol cleansers, acetone, and hand sanitizer.</p>
          </div>
          <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0]">
            <h4 className="font-semibold text-[#164B3B] mb-1">Cleaning &amp; Polishing</h4>
            <p>Wipe gently with a soft dry lint-free microfibre cloth. If needed, rinse with lukewarm soapy water and towel dry immediately with a soft cloth.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
