/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEYS = {
  PRODUCTS: 'unmade_products_v1',
  ORDERS: 'unmade_orders_v1',
  CUSTOM_ORDERS: 'unmade_custom_orders_v1',
  USER: 'unmade_user_profile_v1'
};

const LEGACY_COLLECTION_KEYS = ['unmade_cart_v1', 'unmade_wishlist_v1'];

export function purgeLegacyWishlistCartStorage() {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_COLLECTION_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore storage access errors
  }
}

export const EMPTY_USER_PROFILE = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  pincode: ''
};

export function getStoredProducts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(Array.isArray(products) ? products : []));
}

export function getStoredOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrder(order) {
  if (typeof window === 'undefined') return;
  const current = getStoredOrders();
  const updated = [order, ...current];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
}

export function saveStoredOrdersList(orders) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function updateStoredOrderStatus(orderId, status) {
  const current = getStoredOrders();
  const updated = current.map((o) => (o.id === orderId ? { ...o, status } : o));
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredCustomOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCustomOrder(request) {
  if (typeof window === 'undefined') return;
  const current = getStoredCustomOrders();
  const updated = [request, ...current];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(updated));
}

export function saveStoredCustomOrdersList(requests) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(requests));
}

export function updateStoredCustomOrderStatus(requestId, status) {
  const current = getStoredCustomOrders();
  const updated = current.map((c) => (c.id === requestId ? { ...c, status } : c));
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredUserProfile() {
  if (typeof window === 'undefined') return EMPTY_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? { ...EMPTY_USER_PROFILE, ...JSON.parse(raw) } : EMPTY_USER_PROFILE;
  } catch {
    return EMPTY_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile) {
  if (typeof window === 'undefined') return;
  const { passwordHash: _ph, token: _t, ...safe } = profile || {};
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safe));
}

export function clearPrivateSessionStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_ORDERS);
  localStorage.removeItem(STORAGE_KEYS.USER);
  purgeLegacyWishlistCartStorage();
}
