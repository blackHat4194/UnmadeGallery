/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { ProductCard } from './ProductCard.jsx';
import { ResinArtImage } from './ResinArtImage.jsx';
import { CUSTOMER_REVIEWS, FEATURED_COLLECTIONS, STORY_SHOWCASE } from '../data/products.js';
import { resolveFeaturedCollections, resolveStoryShowcase } from '../lib/ecommerceLogic.js';

export const HomeView = ({
  products,
  collections = FEATURED_COLLECTIONS,
  storyShowcase = STORY_SHOWCASE,
  reviews = CUSTOMER_REVIEWS,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onNavigate
}) => {
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const resolvedCollections = resolveFeaturedCollections(collections, products);
  const resolvedStory = resolveStoryShowcase(storyShowcase, products);
  const heroProduct = resolvedStory.heroProduct;

  return (
    <div className="space-y-24">
      {/* A. Hero Section: Large Premium Editorial Showcase */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-[#E8DFD0]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#164B3B]/10 border border-[#164B3B]/20 rounded-full text-xs font-semibold text-[#164B3B] uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Bespoke Handcrafted Resin Art</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#164B3B] leading-[1.12]">
                Art That Holds <br />
                <span className="italic font-normal text-[#C6A15B]">A Story.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#29231F]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover thoughtfully crafted pieces, where art meets individuality. Preserving wild botanicals and molten fluid currents in crystal resin.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-xl text-xs font-semibold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
                </button>

                <button
                  onClick={() => onNavigate('custom')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#F7F3EA] hover:bg-white text-[#164B3B] border border-[#164B3B]/40 hover:border-[#164B3B] rounded-xl text-xs font-semibold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Create Your Custom Piece</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[#E8DFD0]/60 grid grid-cols-3 gap-2 sm:gap-6 lg:flex lg:items-center lg:justify-start lg:gap-8 text-center lg:text-left text-xs text-[#29231F]/70">
                <div>
                  <span className="font-serif text-lg sm:text-xl font-bold text-[#164B3B] block">100%</span>
                  <span className="text-[11px] sm:text-xs">Handcrafted Pours</span>
                </div>
                <div className="border-x border-[#E8DFD0] lg:border-none px-1 lg:px-0">
                  <span className="font-serif text-lg sm:text-xl font-bold text-[#164B3B] block">72+ Hrs</span>
                  <span className="text-[11px] sm:text-xs">Slow Curing</span>
                </div>
                <div>
                  <span className="font-serif text-lg sm:text-xl font-bold text-[#164B3B] block">UV Shield</span>
                  <span className="text-[11px] sm:text-xs">Glass Clarity</span>
                </div>
              </div>
            </div>

            {/* Right Visual Hero Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-4/3 sm:aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden bg-white shadow-xl border border-[#E8DFD0] p-3">
                <div className="w-full h-full rounded-xl overflow-hidden bg-[#F7F3EA] relative">
                  <ResinArtImage
                    type={heroProduct?.resinArtworkType || 'floral-crystal'}
                    imageUrl={heroProduct?.imageUrl}
                    alt={heroProduct?.name || 'UNMADE GALLERY studio artwork'}
                    className="w-full h-full"
                  />
                  {/* Floating Editorial Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-[#E8DFD0] flex items-center justify-between shadow-md">
                    <div className="min-w-0 pr-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C6A15B]">
                        {heroProduct ? 'Featured Masterwork' : 'Atelier Collection'}
                      </p>
                      <h4 className="font-serif text-base font-semibold text-[#164B3B] truncate">
                        {heroProduct?.name || 'Curated Resin Studio'}
                      </h4>
                      <p className="text-xs text-[#29231F]/70 truncate">
                        {heroProduct?.subtitle || 'New botanical creations coming soon'}
                      </p>
                    </div>
                    <button
                      onClick={() => (heroProduct ? onSelectProduct(heroProduct) : onNavigate('shop'))}
                      className="px-3.5 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer shrink-0"
                    >
                      {heroProduct ? 'View Piece' : 'Explore Gallery'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
            Artisan Curations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#164B3B] mt-2 mb-3">
            Featured Collections
          </h2>
          <p className="text-xs sm:text-sm text-[#29231F]/80 leading-relaxed">
            Every collection explores a distinct tactile dialogue between raw nature, metallic foils, and optical-grade polymer clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resolvedCollections.map((col) => (
            <div
              key={col.name}
              onClick={() => onNavigate('shop', { collection: col.id })}
              className="group resin-glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-square w-full bg-[#F7F3EA] overflow-hidden border-b border-[#E8DFD0]">
                <ResinArtImage
                  type={col.imageType}
                  imageUrl={col.imageUrl}
                  alt={col.name}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#29231F] group-hover:text-[#164B3B] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#29231F]/70 mt-1 leading-relaxed line-clamp-2">
                    {col.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DFD0]/60 flex items-center justify-between text-xs font-semibold text-[#164B3B]">
                  <span>Explore Series</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6A15B] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* D. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8DFD0]">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
              Studio Favorites
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#164B3B] mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold tracking-wider uppercase text-[#164B3B] hover:text-[#C6A15B] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {bestSellers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DFD0] p-8 sm:p-10 text-center space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#164B3B]">
              {products.length === 0 ? 'Studio Creations Coming Soon' : 'No Best Sellers Highlighted Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-[#29231F]/70 max-w-md mx-auto">
              {products.length === 0
                ? 'Our catalog is freshly opened for manual studio curation. New handcrafted pieces added by the studio will appear here.'
                : 'Explore the complete gallery catalog or request a bespoke piece tailored to your story.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate(products.length === 0 ? 'custom' : 'shop')}
                className="px-5 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer"
              >
                {products.length === 0 ? 'Request a Custom Piece' : 'Browse Full Catalog'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* E. Brand Story: "Every Piece Has Its Own Story." */}
      <section className="bg-white border-y border-[#E8DFD0] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
                The Atelier Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#164B3B] leading-tight">
                Every Piece Has Its Own Story.
              </h2>
              <p className="text-sm sm:text-base text-[#29231F]/80 leading-relaxed">
                UNMADE GALLERY began with a simple, profound reverence for nature's ephemeral moments: a single bloom at peak radiance, a swirl of alcohol ink caught mid-dispersion, a delicate gold leaf flutter frozen in time.
              </p>
              <p className="text-sm sm:text-base text-[#29231F]/80 leading-relaxed">
                Unlike mass-manufactured jewellery, we reject moulds that produce identical clones. By respecting the natural variations of real botanical flora and allowing fluid dynamics to sculpt resin currents organically, we guarantee that the piece you wear has never existed before—and will never be repeated.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0]">
                  <p className="font-serif text-xl font-bold text-[#164B3B]">Slow Craft</p>
                  <p className="text-xs text-[#29231F]/70 mt-1">Multi-layer degassing poured over 72 to 144 hours</p>
                </div>
                <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0]">
                  <p className="font-serif text-xl font-bold text-[#164B3B]">Non-Toxic</p>
                  <p className="text-xs text-[#29231F]/70 mt-1">Low-VOC, hypoallergenic skin-safe formulations</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-[#F7F3EA] border border-[#E8DFD0] shadow-md">
                    <ResinArtImage
                      type={resolvedStory.primaryStory.imageType}
                      imageUrl={resolvedStory.primaryStory.imageUrl}
                      alt={resolvedStory.primaryStory.title}
                    />
                  </div>
                  <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0] text-center">
                    <p className="font-serif font-medium text-xs text-[#164B3B] truncate">{resolvedStory.primaryStory.title}</p>
                    <p className="text-[10px] text-[#29231F]/60 truncate">{resolvedStory.primaryStory.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="p-4 bg-[#164B3B] text-[#F7F3EA] rounded-xl shadow-md text-center">
                    <p className="font-serif font-medium text-sm text-[#C6A15B] truncate">{resolvedStory.secondaryStory.title}</p>
                    <p className="text-[10px] text-[#E8DFD0]/80 truncate">{resolvedStory.secondaryStory.subtitle}</p>
                  </div>
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-[#F7F3EA] border border-[#E8DFD0] shadow-md">
                    <ResinArtImage
                      type={resolvedStory.secondaryStory.imageType}
                      imageUrl={resolvedStory.secondaryStory.imageUrl}
                      alt={resolvedStory.secondaryStory.title}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F. Custom Creation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#164B3B] text-[#F7F3EA] rounded-3xl p-8 sm:p-14 border border-[#C6A15B]/30 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
              Private Commissions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-[#F7F3EA]">
              Commission Your Own Custom Keepsake.
            </h2>
            <p className="text-sm sm:text-base text-[#E8DFD0]/80 leading-relaxed font-normal">
              Whether you wish to preserve petals from your wedding bouquet, memorialise a cherished milestone, or request a bespoke colour palette tailored to an evening ensemble, our studio is at your service.
            </p>
            <div className="pt-3">
              <button
                onClick={() => onNavigate('custom')}
                className="px-8 py-4 bg-[#C6A15B] hover:bg-[#dfc285] text-[#164B3B] rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Create Your Own</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* G. Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C6A15B]">
            Collector Impressions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#164B3B] mt-2 mb-3">
            Voices from Our Collectors
          </h2>
          <p className="text-xs sm:text-sm text-[#29231F]/80">
            Hear from art enthusiasts who have welcomed UNMADE GALLERY creations into their lives.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DFD0] p-8 text-center">
            <p className="font-serif text-lg text-[#164B3B]">No collector reviews yet</p>
            <p className="text-xs text-[#29231F]/65 mt-1">
              Verified collector impressions will appear here once pieces find their homes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C6A15B] mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C6A15B]" />
                    ))}
                  </div>
                  <p className="text-xs text-[#29231F]/80 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFD0]/60">
                  <p className="font-serif text-sm font-semibold text-[#164B3B]">{review.author}</p>
                  <p className="text-[11px] text-[#29231F]/60">{review.location}</p>
                  <p className="text-[10px] text-[#C6A15B] font-medium mt-1 uppercase tracking-wide">
                    Verified: {review.productName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
