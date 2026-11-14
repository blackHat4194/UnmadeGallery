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
import { AdminLoginGate } from './components/AdminLoginGate.jsx';
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
  validateProductInput
} from './lib/ecommerceLogic.js';
import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from './lib/api.js';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredCart,
  saveStoredCart,
  getStoredWishlist,
  saveStoredWishlist,
  saveStoredOrdersList,
  saveStoredCustomOrdersList,
  saveStoredUserProfile,
  clearPrivateSessionStorage
} from './lib/storage.js';

export default function App() {
  // Application Data & Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState(() => getStoredProducts());
  const [collections, setCollections] = useState(FEATURED_COLLECTIONS);
  const [storyShowcase, setStoryShowcase] = useState(STORY_SHOWCASE);
  const [reviews, setReviews] = useState(CUSTOMER_REVIEWS);
  const [cart, setCart] = useState(() => getStoredCart());
  const [wishlist, setWishlist] = useState(() => getStoredWishlist());
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);

  const isAdmin = currentUser?.role === 'admin';

  // Routing / View States
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const refreshPrivateOrders = async (user) => {
    if (!user) {
      setOrders([]);
      setCustomRequests([]);
      clearPrivateSessionStorage();
      return;
    }

    const ordersEndpoint = user.role === 'admin' ? '/api/orders' : '/api/orders/my';
    const customEndpoint = user.role === 'admin' ? '/api/custom-orders' : '/api/custom-orders/my';

    try {
      const [ordersRes, customRes] = await Promise.all([
        apiFetch(ordersEndpoint),
        apiFetch(customEndpoint)
      ]);

      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        if (Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
          saveStoredOrdersList(ordData.orders);
        }
      } else if (ordersRes.status === 401 || ordersRes.status === 403) {
        setOrders([]);
      }

      if (customRes.ok) {
        const custData = await customRes.json();
        if (Array.isArray(custData.customOrders)) {
          setCustomRequests(custData.customOrders);
          saveStoredCustomOrdersList(custData.customOrders);
        }
      } else if (customRes.status === 401 || customRes.status === 403) {
        setCustomRequests([]);
      }
    } catch {
      // Keep current session state on transient network failure
    }
  };

  // Hydrate public catalog + verify existing JWT session on mount
  useEffect(() => {
    let cancelled = false;

    const loadInitialState = async () => {
      try {
        const galleryRes = await apiFetch('/api/gallery-data');
        if (galleryRes.ok && !cancelled) {
          const data = await galleryRes.json();
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
        }
      } catch {
        // Fallback smoothly to bundled catalog if backend is unavailable
      }

      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          setOrders([]);
          setCustomRequests([]);
          clearPrivateSessionStorage();
        }
        return;
      }

      try {
        const meRes = await apiFetch('/api/auth/me');
        if (!meRes.ok) {
          clearAuthToken();
          clearPrivateSessionStorage();
          if (!cancelled) {
            setCurrentUser(null);
            setOrders([]);
            setCustomRequests([]);
          }
          return;
        }
        const meData = await meRes.json();
        if (!cancelled && meData.user) {
          setCurrentUser(meData.user);
          saveStoredUserProfile(meData.user);
          await refreshPrivateOrders(meData.user);
        }
      } catch {
        // Ignore transient network errors during session check
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

    loadInitialState();
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

  const handleAuthSuccess = async (user, token) => {
    if (token) {
      setAuthToken(token);
    }
    setCurrentUser(user || null);
    if (user) {
      saveStoredUserProfile(user);
    }
    await refreshPrivateOrders(user);
  };

  const handleLogout = async () => {
    try {
      if (getAuthToken()) {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      // Proceed cleanly with client-side session teardown
    }
    clearAuthToken();
    clearPrivateSessionStorage();
    setCurrentUser(null);
    setOrders([]);
    setCustomRequests([]);
  };

  // Order Placement (persists to MERN backend; links userId when authenticated)
  const handleOrderSuccess = async (newOrder) => {
    let savedOrder = newOrder;
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          savedOrder = data.order;
        }
      }
    } catch {
      // Confirm order locally if offline
    }
    setOrders((prev) => [savedOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
    setConfirmedOrder(savedOrder);
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

  // Admin handlers: enforce server-side admin JWT authentication before updating catalog/orders
  const handleUpdateProduct = async (productId, payload) => {
    const validation = validateProductInput(payload, products, productId);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Please fix the highlighted product details.';
      return { ok: false, error: firstError, errors: validation.errors };
    }

    try {
      const res = await apiFetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized)
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          await handleLogout();
        }
        return { ok: false, error: json.error || 'Failed to update product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true, product: json.product };
    } catch {
      return { ok: false, error: 'Unable to reach studio server to update creation.' };
    }
  };

  const handleAddProduct = async (payload) => {
    const validation = validateProductInput(payload, products);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Please fix the highlighted product details.';
      return { ok: false, error: firstError, errors: validation.errors };
    }

    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized)
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          await handleLogout();
        }
        return { ok: false, error: json.error || 'Failed to publish product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true, product: json.product };
    } catch {
      return { ok: false, error: 'Unable to reach studio server to publish creation.' };
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const res = await apiFetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          await handleLogout();
        }
        return { ok: false, error: json.error || 'Failed to delete product.' };
      }
      applyGalleryPayload(json.galleryData);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while deleting product.' };
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        await handleLogout();
        return;
      }
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
    } catch {
      // Leave status unchanged on network failure
    }
  };

  const handleUpdateCustomStatus = async (requestId, status) => {
    try {
      const res = await apiFetch(`/api/custom-orders/${encodeURIComponent(requestId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        await handleLogout();
        return;
      }
      if (res.ok) {
        setCustomRequests((prev) => prev.map((c) => (c.id === requestId ? { ...c, status } : c)));
      }
    } catch {
      // Leave status unchanged on network failure
    }
  };

  // Total cart item count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#29231F]">
      {/* If Admin view is active, require authenticated Admin session before mounting AdminDashboard */}
      {activePage === 'admin' ? (
        isAdmin ? (
          <AdminDashboard
            products={products}
            orders={orders}
            customRequests={customRequests}
            currentUser={currentUser}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateCustomStatus={handleUpdateCustomStatus}
            onLogout={async () => {
              await handleLogout();
              handleNavigate('home');
            }}
            onExitAdmin={() => handleNavigate('home')}
          />
        ) : (
          <AdminLoginGate
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onBackToStore={() => handleNavigate('home')}
          />
        )
      ) : (
        <>
          {/* Main Public Header */}
          <Header
            cartCount={cartCount}
            wishlistCount={wishlist.length}
            activePage={activePage}
            isAdmin={isAdmin}
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
                onSuccess={(newRequest) => {
                  if (newRequest && typeof newRequest === 'object') {
                    setCustomRequests((prev) => [newRequest, ...prev]);
                  }
                }}
              />
            )}

            {activePage === 'about' && (
              <AboutView onNavigate={handleNavigate} />
            )}

            {activePage === 'account' && (
              <AccountView
                initialTab={pageParams.tab || 'orders'}
                currentUser={currentUser}
                orders={orders}
                wishlistIds={wishlist}
                allProducts={products}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAuthSuccess={handleAuthSuccess}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Editorial Footer */}
          <Footer isAdmin={isAdmin} onNavigate={handleNavigate} />
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
