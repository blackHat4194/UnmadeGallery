/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { HomeView } from './components/HomeView.jsx';
import { ShopView } from './components/ShopView.jsx';
import { CustomOrderStudio } from './components/CustomOrderStudio.jsx';
import { AboutView } from './components/AboutView.jsx';
import { AccountView } from './components/AccountView.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { CheckoutModal } from './components/CheckoutModal.jsx';
import { SearchModal } from './components/SearchModal.jsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.jsx';

import {
  CUSTOMER_REVIEWS,
  FEATURED_COLLECTIONS,
  STORY_SHOWCASE
} from './data/products.js';
import {
  buildProductRecord,
  validateProductInput
} from './lib/ecommerceLogic.js';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredCart,
  saveStoredCart,
  getStoredWishlist,
  saveStoredWishlist,
  getStoredOrders,
  saveStoredOrder,
  updateStoredOrderStatus,
  getStoredCustomOrders,
  updateStoredCustomOrderStatus
} from './lib/storage.js';

export default function App() {
  // Application Data States
  const [products, setProducts] = useState(() => getStoredProducts());
  const [collections, setCollections] = useState(FEATURED_COLLECTIONS);
  const [storyShowcase, setStoryShowcase] = useState(STORY_SHOWCASE);
  const [reviews, setReviews] = useState(CUSTOMER_REVIEWS);
  const [cart, setCart] = useState(() => getStoredCart());
  const [wishlist, setWishlist] = useState(() => getStoredWishlist());
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [customRequests, setCustomRequests] = useState(() => getStoredCustomOrders());

  // Routing / View States
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Hydrate catalog, collections, story showcase, and reviews from data/gallery-data.json via API
  useEffect(() => {
    let cancelled = false;

    const loadGalleryData = async () => {
      try {
        const res = await fetch('/api/gallery-data');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data.products)) {
          setProducts(data.products);
          saveStoredProducts(data.products);
          if (typeof window !== 'undefined') {
            const pid = new URLSearchParams(window.location.search).get('productId');
            if (pid) {
              const found = data.products.find((p) => p.id === pid);
              if (found) setSelectedProduct(found);
            }
          }
        }
        if (Array.isArray(data.collections)) setCollections(data.collections);
        if (data.storyShowcase) setStoryShowcase(data.storyShowcase);
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      } catch {
        // Fallback smoothly to local bundled products.js data if API unavailable
      }
    };

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      const productId = urlParams.get('productId');
      if (pageParam) {
        setActivePage(pageParam);
      }
      if (productId) {
        const found = products.find((p) => p.id === productId);
        if (found) setSelectedProduct(found);
      }
    }

    loadGalleryData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync cart to storage
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Sync wishlist to storage
  useEffect(() => {
    saveStoredWishlist(wishlist);
  }, [wishlist]);

  // Navigation helper
  const handleNavigate = (page, params = {}) => {
    setSelectedProduct(null);
    setIsCartOpen(false);
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('page', page);
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Order Placement
  const handleOrderSuccess = (newOrder) => {
    saveStoredOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
    setConfirmedOrder(newOrder);
  };

  // Helper to apply galleryData payload from server
  const applyGalleryPayload = (galleryData) => {
    if (Array.isArray(galleryData?.products)) {
      setProducts(galleryData.products);
      saveStoredProducts(galleryData.products);
    }
    if (Array.isArray(galleryData?.collections)) {
      setCollections(galleryData.collections);
    }
    if (galleryData?.storyShowcase) {
      setStoryShowcase(galleryData.storyShowcase);
    }
    if (Array.isArray(galleryData?.reviews)) {
      setReviews(galleryData.reviews);
    }
  };

  // Admin handlers: validate input before updating local product state and syncing to data/gallery-data.json
  const handleUpdateProduct = async (productId, payload) => {
    const validation = validateProductInput(payload, products, productId);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Please fix the highlighted product details.';
      return { ok: false, error: firstError, errors: validation.errors };
    }

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized)
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to update product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true, product: json.product };
    } catch {
      // Fallback: update local product data state cleanly if API is unreachable
      const existing = products.find((p) => p.id === productId);
      const updated = buildProductRecord(validation.sanitized, existing);
      const nextProducts = products.map((p) => (p.id === productId ? updated : p));
      setProducts(nextProducts);
      saveStoredProducts(nextProducts);
      return { ok: true, product: updated };
    }
  };

  const handleAddProduct = async (payload) => {
    const validation = validateProductInput(payload, products);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Please fix the highlighted product details.';
      return { ok: false, error: firstError, errors: validation.errors };
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized)
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to publish product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true, product: json.product };
    } catch {
      // Fallback: validate and update local product data state cleanly if API is unreachable
      const created = buildProductRecord(validation.sanitized);
      const nextProducts = [created, ...products];
      setProducts(nextProducts);
      saveStoredProducts(nextProducts);
      return { ok: true, product: created };
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to delete product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while deleting product.' };
    }
  };

  const handleUpdateOrderStatus = (orderId, status) => {
    const updatedOrders = updateStoredOrderStatus(orderId, status);
    setOrders(updatedOrders);
  };

  const handleUpdateCustomStatus = (requestId, status) => {
    const updatedCustom = updateStoredCustomOrderStatus(requestId, status);
    setCustomRequests(updatedCustom);
  };

  // Total cart item count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#29231F]">
      {/* If Admin view is active, render the dedicated Artisan Studio Console */}
      {activePage === 'admin' ? (
        <AdminDashboard
          products={products}
          orders={orders}
          customRequests={customRequests}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateCustomStatus={handleUpdateCustomStatus}
          onExitAdmin={() => handleNavigate('home')}
        />
      ) : (
        <>
          {/* Main Public Header */}
          <Header
            cartCount={cartCount}
            wishlistCount={wishlist.length}
            activePage={activePage}
            onNavigate={handleNavigate}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Main Public Content */}
          <main className="flex-1">
            {activePage === 'home' && (
              <HomeView
                products={products}
                collections={collections}
                storyShowcase={storyShowcase}
                reviews={reviews}
                wishlistIds={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onNavigate={handleNavigate}
              />
            )}

            {(activePage === 'shop' || activePage === 'collections') && (
              <ShopView
                products={products}
                wishlistIds={wishlist}
                initialCategory={pageParams.category}
                initialCollection={pageParams.collection}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {activePage === 'custom' && (
              <CustomOrderStudio
                onSuccess={() => {
                  setCustomRequests(getStoredCustomOrders());
                }}
              />
            )}

            {activePage === 'about' && (
              <AboutView onNavigate={handleNavigate} />
            )}

            {activePage === 'account' && (
              <AccountView
                initialTab={pageParams.tab || 'orders'}
                orders={orders}
                wishlistIds={wishlist}
                allProducts={products}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}
          </main>

          {/* Editorial Footer */}
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreShop={() => handleNavigate('shop')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onNavigateToShopWithSearch={(term) => {
          handleNavigate('shop', { search: term });
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrderInAccount={() => {
          setConfirmedOrder(null);
          handleNavigate('account', { tab: 'orders' });
        }}
      />
    </div>
  );
}
