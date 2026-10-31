/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ShopView } from './components/ShopView';
import { CustomOrderStudio } from './components/CustomOrderStudio';
import { AboutView } from './components/AboutView';
import { AccountView } from './components/AccountView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';

import { Product, CartItem, Order, CustomOrderRequest } from './types';
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
} from './lib/storage';

export default function App() {
  // Application Data States
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart());
  const [wishlist, setWishlist] = useState<string[]>(() => getStoredWishlist());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>(() => getStoredCustomOrders());

  // Routing / View States
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync state to URL params on mount if present
  useEffect(() => {
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
  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
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
  const handleAddToCart = (product: Product, quantity: number = 1) => {
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

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
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

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Order Placement
  const handleOrderSuccess = (newOrder: Order) => {
    saveStoredOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
    setConfirmedOrder(newOrder);
  };

  // Admin handlers
  const handleUpdateProduct = (updated: Product) => {
    const next = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(next);
    saveStoredProducts(next);
  };

  const handleAddProduct = (newProd: Product) => {
    const next = [newProd, ...products];
    setProducts(next);
    saveStoredProducts(next);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = updateStoredOrderStatus(orderId, status);
    setOrders(updatedOrders);
  };

  const handleUpdateCustomStatus = (requestId: string, status: CustomOrderRequest['status']) => {
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
                onSuccess={(id) => {
                  setCustomRequests(getStoredCustomOrders());
                }}
              />
            )}

            {activePage === 'about' && (
              <AboutView onNavigate={handleNavigate} />
            )}

            {activePage === 'account' && (
              <AccountView
                initialTab={(pageParams.tab as any) || 'orders'}
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
        onViewOrderInAccount={(order) => {
          setConfirmedOrder(null);
          handleNavigate('account', { tab: 'orders' });
        }}
      />
    </div>
  );
}
