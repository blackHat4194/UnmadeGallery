/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  saveStoredOrdersList,
  saveStoredCustomOrdersList,
  saveStoredUserProfile,
  clearPrivateSessionStorage,
  purgeLegacyWishlistCartStorage
} from './lib/storage.js';

export default function App() {
  // Application Data & Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState(() => getStoredProducts());
  const [collections, setCollections] = useState(FEATURED_COLLECTIONS);
  const [storyShowcase, setStoryShowcase] = useState(STORY_SHOWCASE);
  const [reviews, setReviews] = useState(CUSTOMER_REVIEWS);

  // User-Specific Database-Backed Cart & Wishlist (never persisted to localStorage)
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartMutating, setCartMutating] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [wishlistError, setWishlistError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);

  const isAdmin = currentUser?.role === 'admin';
  const currentUserRef = useRef(null);
  const productsRef = useRef(products);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Routing / View States
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  // Guest -> Login Redirect Intent & UI Notices
  const [pendingAuthAction, setPendingAuthAction] = useState(null);
  const [authPromptNotice, setAuthPromptNotice] = useState(null);
  const [storeNotice, setStoreNotice] = useState(null);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const clearClientPrivateState = useCallback(() => {
    setCart([]);
    setWishlist([]);
    setWishlistProducts([]);
    setOrders([]);
    setCustomRequests([]);
    setCartError(null);
    setWishlistError(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    clearPrivateSessionStorage();
  }, []);

  const showTransientNotice = useCallback((text, tone = 'success') => {
    setStoreNotice({ text, tone });
    setTimeout(() => {
      setStoreNotice((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product || null);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      if (product?.id) {
        newUrl.searchParams.set('productId', product.id);
      } else {
        newUrl.searchParams.delete('productId');
      }
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  // Navigation helper
  const handleNavigate = useCallback((page, params = {}, options = {}) => {
    if (!options.keepProductModal) {
      setSelectedProduct(null);
    }
    setIsCartOpen(false);
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('page', page);
      if (!options.keepProductModal) {
        newUrl.searchParams.delete('productId');
      }
      window.history.pushState({}, '', newUrl.toString());
    }
  }, []);

  const handleSessionExpired = useCallback(
    (message = 'Your session has expired. Please sign in again to continue.') => {
      clearAuthToken();
      clearClientPrivateState();
      setCurrentUser(null);
      setAuthPromptNotice({ actionLabel: 'continue with your saved Wishlist and Shopping Bag' });
      showTransientNotice(message, 'error');
      handleNavigate('account', { tab: 'profile' });
    },
    [clearClientPrivateState, handleNavigate, showTransientNotice]
  );

  const refreshPrivateOrders = useCallback(async (user) => {
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

      if (ordersRes.status === 401 || customRes.status === 401) {
        return;
      }

      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        if (Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
          saveStoredOrdersList(ordData.orders);
        }
      } else if (ordersRes.status === 403) {
        setOrders([]);
      }

      if (customRes.ok) {
        const custData = await customRes.json();
        if (Array.isArray(custData.customOrders)) {
          setCustomRequests(custData.customOrders);
          saveStoredCustomOrdersList(custData.customOrders);
        }
      } else if (customRes.status === 403) {
        setCustomRequests([]);
      }
    } catch {
      // Keep current session state on transient network failure
    }
  }, []);

  const refreshUserCollections = useCallback(
    async (user) => {
      if (!user) {
        setCart([]);
        setWishlist([]);
        setWishlistProducts([]);
        setCartError(null);
        setWishlistError(null);
        return { ok: true };
      }

      setCartLoading(true);
      setWishlistLoading(true);
      setCartError(null);
      setWishlistError(null);

      try {
        const [wishRes, cartRes] = await Promise.all([
          apiFetch('/api/wishlist'),
          apiFetch('/api/cart')
        ]);

        if (wishRes.status === 401 || cartRes.status === 401) {
          handleSessionExpired();
          return { ok: false, unauthorized: true };
        }

        if (wishRes.ok) {
          const wishData = await wishRes.json();
          setWishlist(Array.isArray(wishData.productIds) ? wishData.productIds : []);
          setWishlistProducts(Array.isArray(wishData.products) ? wishData.products : []);
        } else {
          const errData = await wishRes.json().catch(() => ({}));
          setWishlist([]);
          setWishlistProducts([]);
          setWishlistError(errData.error || 'Unable to load your saved wishlist from the server.');
        }

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCart(Array.isArray(cartData.items) ? cartData.items : []);
        } else {
          const errData = await cartRes.json().catch(() => ({}));
          setCart([]);
          setCartError(errData.error || 'Unable to load your shopping bag from the server.');
        }

        return { ok: wishRes.ok && cartRes.ok };
      } catch {
        setCartError('Unable to reach the server to load your shopping bag.');
        setWishlistError('Unable to reach the server to load your wishlist.');
        return { ok: false };
      } finally {
        setCartLoading(false);
        setWishlistLoading(false);
      }
    },
    [handleSessionExpired]
  );

  // Hydrate public catalog + verify existing JWT session on mount
  useEffect(() => {
    let cancelled = false;
    purgeLegacyWishlistCartStorage();

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
        // Keep bundled/cached public catalog if offline
      }

      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          clearClientPrivateState();
        }
        return;
      }

      try {
        const meRes = await apiFetch('/api/auth/me');
        if (!meRes.ok) {
          clearAuthToken();
          if (!cancelled) {
            setCurrentUser(null);
            clearClientPrivateState();
          }
          return;
        }
        const meData = await meRes.json();
        if (!cancelled && meData.user) {
          setCurrentUser(meData.user);
          saveStoredUserProfile(meData.user);
          await Promise.all([
            refreshPrivateOrders(meData.user),
            refreshUserCollections(meData.user)
          ]);
        }
      } catch {
        // Do not fabricate private cart/wishlist on network failure
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
        const found = productsRef.current.find((p) => p.id === productId);
        if (found) setSelectedProduct(found);
      }
    }

    loadInitialState();
    return () => {
      cancelled = true;
    };
  }, [clearClientPrivateState, refreshPrivateOrders, refreshUserCollections]);

  const redirectGuestForAuth = (action) => {
    setPendingAuthAction(action);
    setAuthPromptNotice({
      actionLabel: action.actionLabel,
      productName: action.product?.name
    });
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    handleNavigate('account', { tab: 'profile' });
    return { ok: false, requiresAuth: true };
  };

  // Database-backed Wishlist operations
  const addProductToServerWishlist = async (productId) => {
    setWishlistError(null);
    try {
      const res = await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, {
        method: 'POST'
      });
      if (res.status === 401) {
        handleSessionExpired();
        return { ok: false, requiresAuth: true };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Could not save piece to wishlist.';
        setWishlistError(msg);
        showTransientNotice(msg, 'error');
        return { ok: false, error: msg };
      }
      setWishlist(Array.isArray(data.productIds) ? data.productIds : []);
      setWishlistProducts(Array.isArray(data.products) ? data.products : []);
      return { ok: true };
    } catch {
      const msg = 'Unable to reach server to update wishlist.';
      setWishlistError(msg);
      showTransientNotice(msg, 'error');
      return { ok: false, error: msg };
    }
  };

  const handleToggleWishlist = async (productId) => {
    const targetProduct = productsRef.current.find((p) => p.id === productId) || null;
    if (!currentUserRef.current) {
      return redirectGuestForAuth({
        type: 'wishlist_add',
        productId,
        product: targetProduct,
        returnPage: activePage === 'account' ? 'shop' : activePage,
        returnParams: activePage === 'account' ? {} : pageParams,
        actionLabel: 'save this piece to your Wishlist'
      });
    }

    const currentlySaved = wishlist.includes(productId);
    const method = currentlySaved ? 'DELETE' : 'POST';
    setWishlistError(null);

    try {
      const res = await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, { method });
      if (res.status === 401) {
        handleSessionExpired();
        return { ok: false, requiresAuth: true };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Unable to update wishlist.';
        setWishlistError(msg);
        showTransientNotice(msg, 'error');
        return { ok: false, error: msg };
      }
      setWishlist(Array.isArray(data.productIds) ? data.productIds : []);
      setWishlistProducts(Array.isArray(data.products) ? data.products : []);
      return { ok: true };
    } catch {
      const msg = 'Unable to reach server to update wishlist.';
      setWishlistError(msg);
      showTransientNotice(msg, 'error');
      return { ok: false, error: msg };
    }
  };

  const handleClearWishlist = async () => {
    if (!currentUserRef.current) {
      return redirectGuestForAuth({
        type: 'open_wishlist',
        returnPage: 'account',
        returnParams: { tab: 'wishlist' },
        actionLabel: 'manage your Wishlist'
      });
    }
    setWishlistError(null);
    try {
      const res = await apiFetch('/api/wishlist', { method: 'DELETE' });
      if (res.status === 401) {
        handleSessionExpired();
        return { ok: false };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Unable to clear wishlist.';
        setWishlistError(msg);
        return { ok: false, error: msg };
      }
      setWishlist([]);
      setWishlistProducts([]);
      return { ok: true };
    } catch {
      const msg = 'Unable to reach server to clear wishlist.';
      setWishlistError(msg);
      return { ok: false, error: msg };
    }
  };

  // Database-backed Cart operations
  const addItemToServerCart = async (product, quantity = 1, { openDrawer = true } = {}) => {
    setCartMutating(true);
    setCartError(null);
    try {
      const res = await apiFetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (res.status === 401) {
        handleSessionExpired();
        return { ok: false, requiresAuth: true };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Unable to add creation to bag.';
        setCartError(msg);
        showTransientNotice(msg, 'error');
        return { ok: false, error: msg };
      }
      setCart(Array.isArray(data.items) ? data.items : []);
      if (openDrawer) {
        setIsCartOpen(true);
      }
      return { ok: true };
    } catch {
      const msg = 'Unable to reach server to update shopping bag.';
      setCartError(msg);
      showTransientNotice(msg, 'error');
      return { ok: false, error: msg };
    } finally {
      setCartMutating(false);
    }
  };

  const handleAddToCart = async (product, quantityOrEvent = 1) => {
    const quantity = typeof quantityOrEvent === 'number' ? quantityOrEvent : 1;
    if (!currentUserRef.current) {
      return redirectGuestForAuth({
        type: 'cart_add',
        productId: product.id,
        product,
        quantity,
        returnPage: activePage === 'account' ? 'shop' : activePage,
        returnParams: activePage === 'account' ? {} : pageParams,
        actionLabel: 'add this creation to your Shopping Bag'
      });
    }
    return await addItemToServerCart(product, quantity, { openDrawer: true });
  };

  const handleBuyNow = async (product, quantity = 1) => {
    if (!currentUserRef.current) {
      return redirectGuestForAuth({
        type: 'buy_now',
        productId: product.id,
        product,
        quantity,
        returnPage: activePage === 'account' ? 'shop' : activePage,
        returnParams: activePage === 'account' ? {} : pageParams,
        actionLabel: 'complete your purchase'
      });
    }
    const res = await addItemToServerCart(product, quantity, { openDrawer: false });
    if (res.ok) {
      selectProduct(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
    return res;
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (!currentUserRef.current) return;
    if (quantity <= 0) {
      await handleRemoveFromCart(productId);
      return;
    }
    setCartMutating(true);
    setCartError(null);
    try {
      const res = await apiFetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Could not update item quantity.';
        setCartError(msg);
        return;
      }
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch {
      setCartError('Unable to reach server to update quantity.');
    } finally {
      setCartMutating(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!currentUserRef.current) return;
    setCartMutating(true);
    setCartError(null);
    try {
      const res = await apiFetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCartError(data.error || 'Could not remove item from bag.');
        return;
      }
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch {
      setCartError('Unable to reach server to remove item.');
    } finally {
      setCartMutating(false);
    }
  };

  const handleClearCart = async () => {
    if (!currentUserRef.current) return;
    setCartMutating(true);
    setCartError(null);
    try {
      const res = await apiFetch('/api/cart', { method: 'DELETE' });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCartError(data.error || 'Could not clear your bag.');
        return;
      }
      setCart([]);
    } catch {
      setCartError('Unable to reach server to clear bag.');
    } finally {
      setCartMutating(false);
    }
  };

  const handleOpenCart = async () => {
    if (!currentUserRef.current) {
      redirectGuestForAuth({
        type: 'open_cart',
        returnPage: activePage === 'account' ? 'home' : activePage,
        returnParams: activePage === 'account' ? {} : pageParams,
        actionLabel: 'access your Shopping Bag'
      });
      return;
    }
    setIsCartOpen(true);
    await refreshUserCollections(currentUserRef.current);
  };

  const handleOpenWishlist = () => {
    if (!currentUserRef.current) {
      redirectGuestForAuth({
        type: 'open_wishlist',
        returnPage: 'account',
        returnParams: { tab: 'wishlist' },
        actionLabel: 'access your saved Wishlist'
      });
      return;
    }
    handleNavigate('account', { tab: 'wishlist' });
  };

  const handleAuthSuccess = async (user, token) => {
    const previousUserId = currentUserRef.current?.id;
    const isFreshLoginOrSwitch = Boolean(token) || (user && user.id !== previousUserId);

    if (token) {
      setAuthToken(token);
    }

    if (isFreshLoginOrSwitch) {
      clearClientPrivateState();
    }

    setCurrentUser(user || null);
    currentUserRef.current = user || null;
    if (user) {
      saveStoredUserProfile(user);
    }

    if (!isFreshLoginOrSwitch) {
      return;
    }

    await Promise.all([
      refreshPrivateOrders(user),
      refreshUserCollections(user)
    ]);

    if (pendingAuthAction) {
      const action = pendingAuthAction;
      setPendingAuthAction(null);
      setAuthPromptNotice(null);

      const resolvedProduct =
        productsRef.current.find((p) => p.id === (action.productId || action.product?.id)) ||
        action.product ||
        null;

      if (action.type === 'wishlist_add' && resolvedProduct) {
        const wishResult = await addProductToServerWishlist(resolvedProduct.id);
        handleNavigate(action.returnPage || 'shop', action.returnParams || {}, { keepProductModal: true });
        selectProduct(resolvedProduct);
        if (wishResult.ok) {
          showTransientNotice(`“${resolvedProduct.name}” has been saved to your Wishlist.`);
        }
      } else if (action.type === 'cart_add' && resolvedProduct) {
        const cartResult = await addItemToServerCart(resolvedProduct, action.quantity || 1, { openDrawer: false });
        handleNavigate(action.returnPage || 'shop', action.returnParams || {}, { keepProductModal: true });
        selectProduct(resolvedProduct);
        if (cartResult.ok) {
          showTransientNotice(`“${resolvedProduct.name}” has been added to your Shopping Bag.`);
        }
      } else if (action.type === 'buy_now' && resolvedProduct) {
        const cartResult = await addItemToServerCart(resolvedProduct, action.quantity || 1, { openDrawer: false });
        handleNavigate(action.returnPage || 'shop', action.returnParams || {});
        if (cartResult.ok) {
          setIsCheckoutOpen(true);
        } else {
          selectProduct(resolvedProduct);
        }
      } else if (action.type === 'open_cart') {
        handleNavigate(action.returnPage || 'home', action.returnParams || {});
        setIsCartOpen(true);
      } else if (action.type === 'open_wishlist') {
        handleNavigate('account', { tab: 'wishlist' });
      }
    }
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
    setCurrentUser(null);
    currentUserRef.current = null;
    setPendingAuthAction(null);
    setAuthPromptNotice(null);
    clearClientPrivateState();
  };

  // Order Placement (persists to MERN backend; clears DB cart when authenticated)
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
    selectProduct(null);
    setConfirmedOrder(savedOrder);
    if (currentUserRef.current) {
      await refreshUserCollections(currentUserRef.current);
    }
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
      if (currentUserRef.current) {
        await refreshUserCollections(currentUserRef.current);
      }
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
      if (currentUserRef.current) {
        await refreshUserCollections(currentUserRef.current);
      }
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
      {storeNotice && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[60] max-w-sm px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center justify-between gap-3 ${
            storeNotice.tone === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#164B3B] border-[#C6A15B]/50 text-[#F7F3EA]'
          }`}
        >
          <span>{storeNotice.text}</span>
          <button
            type="button"
            onClick={() => setStoreNotice(null)}
            className="opacity-75 hover:opacity-100 cursor-pointer font-bold"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

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
            onOpenCart={handleOpenCart}
            onOpenWishlist={handleOpenWishlist}
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
                onSelectProduct={selectProduct}
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
                onSelectProduct={selectProduct}
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
                wishlistProducts={wishlistProducts}
                wishlistLoading={wishlistLoading}
                wishlistError={wishlistError}
                authPromptNotice={authPromptNotice}
                allProducts={products}
                onToggleWishlist={handleToggleWishlist}
                onClearWishlist={handleClearWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={selectProduct}
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
          onClose={() => selectProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onSelectProduct={selectProduct}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        isLoading={cartLoading}
        isMutating={cartMutating}
        error={cartError}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
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
        onSelectProduct={selectProduct}
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
