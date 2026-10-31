/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, CartItem, Order, CustomOrderRequest } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEYS = {
  PRODUCTS: 'unmade_products_v1',
  CART: 'unmade_cart_v1',
  WISHLIST: 'unmade_wishlist_v1',
  ORDERS: 'unmade_orders_v1',
  CUSTOM_ORDERS: 'unmade_custom_orders_v1',
  USER: 'unmade_user_profile_v1'
};

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-8821',
    orderNumber: 'UG-2026-8821',
    date: '26 Oct 2026, 04:30 PM',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 } // Aura Botanical Pendant (₹2,450)
    ],
    subtotal: 2450,
    shipping: 250,
    tax: 74,
    total: 2774,
    status: 'Resin Pouring & Curing',
    trackingNumber: 'DELHIVERY-UG982104',
    address: {
      fullName: 'Devika Singhania',
      email: 'devika.s@example.com',
      phone: '+91 98765 43210',
      street: '402, Magnolia Enclave, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India'
    },
    paymentMethod: 'Razorpay Online (UPI / Card / NetBanking)',
    paymentId: 'pay_RAZORPAY_9821092',
    paymentStatus: 'PAID'
  },
  {
    id: 'ord-8794',
    orderNumber: 'UG-2026-8794',
    date: '14 Oct 2026, 11:15 AM',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 }, // Verdant Marble Statement Hoops (₹3,100)
      { product: INITIAL_PRODUCTS[5], quantity: 1 }  // Nocturne Emerald Coaster Set (₹3,600)
    ],
    subtotal: 6700,
    shipping: 0,
    tax: 201,
    total: 6901,
    status: 'Delivered',
    trackingNumber: 'BLUEDART-UG772199',
    address: {
      fullName: 'Aarav Singhal',
      email: 'aarav.singhal@example.com',
      phone: '+91 98112 34567',
      street: 'Flat 14-B, Silver Arch Towers, Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      country: 'India'
    },
    paymentMethod: 'Razorpay Online (UPI / Card / NetBanking)',
    paymentId: 'pay_RAZORPAY_8794123',
    paymentStatus: 'PAID'
  }
];

const SEED_CUSTOM_REQUESTS: CustomOrderRequest[] = [
  {
    id: 'cust-101',
    requestDate: '28 Oct 2026',
    clientName: 'Sunita Rao',
    clientEmail: 'sunita.rao@example.com',
    clientPhone: '+91 97654 32190',
    itemType: 'Pyramid Keepsake',
    flowerInclusions: ['Dried Red Rose Petals', 'White Baby’s Breath'],
    metalAccents: '24k Gold Leaf',
    resinBaseColor: 'Crystal Clear',
    personalizedText: 'Forever in our hearts • 2026',
    occasion: 'Wedding Anniversary Memorial Keepsake',
    specialNotes: 'Please place the rose blossom centrally with gold flecks gently rising from the base upwards.',
    estimatedPrice: 5900,
    status: 'In Production'
  },
  {
    id: 'cust-102',
    requestDate: '30 Oct 2026',
    clientName: 'Kabir Varma',
    clientEmail: 'kabir.v@example.com',
    clientPhone: '+91 98234 56789',
    itemType: 'Statement Earrings',
    flowerInclusions: ['Pressed Forget-me-nots'],
    metalAccents: '24k Gold Leaf',
    resinBaseColor: 'Deep Emerald Swirl',
    personalizedText: 'K & V',
    occasion: 'Birthday Gift',
    specialNotes: 'Would love asymmetric marbling between the left and right ear.',
    estimatedPrice: 4150,
    status: 'Pending Review'
  }
];

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function getStoredWishlist(): string[] {
  if (typeof window === 'undefined') return ['unmade-001', 'unmade-002'];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : ['unmade-001', 'unmade-002'];
  } catch {
    return ['unmade-001'];
  }
}

export function saveStoredWishlist(wishlist: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return SEED_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
}

export function saveStoredOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  const current = getStoredOrders();
  const updated = [order, ...current];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
}

export function updateStoredOrderStatus(orderId: string, status: Order['status']): Order[] {
  const current = getStoredOrders();
  const updated = current.map(o => o.id === orderId ? { ...o, status } : o);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredCustomOrders(): CustomOrderRequest[] {
  if (typeof window === 'undefined') return SEED_CUSTOM_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(SEED_CUSTOM_REQUESTS));
      return SEED_CUSTOM_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CUSTOM_REQUESTS;
  }
}

export function saveStoredCustomOrder(request: CustomOrderRequest): void {
  if (typeof window === 'undefined') return;
  const current = getStoredCustomOrders();
  const updated = [request, ...current];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(updated));
}

export function updateStoredCustomOrderStatus(requestId: string, status: CustomOrderRequest['status']): CustomOrderRequest[] {
  const current = getStoredCustomOrders();
  const updated = current.map(c => c.id === requestId ? { ...c, status } : c);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(updated));
  }
  return updated;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export function getStoredUserProfile(): UserProfile {
  const defaultProfile: UserProfile = {
    name: 'Devika Singhania',
    email: 'devika.s@example.com',
    phone: '+91 98765 43210',
    street: '402, Magnolia Enclave, 12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  };
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
}
