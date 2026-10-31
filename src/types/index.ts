/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 
  | 'Earrings'
  | 'Floral Jewellery'
  | 'Necklaces & Pendants'
  | 'Personalised Keepsakes'
  | 'Artistic Decor';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  collection: 'Floral Elegance' | 'Emerald Collection' | 'Golden Details' | 'Personalised Keepsakes';
  price: number; // in INR (₹)
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  description: string;
  details: string[];
  specifications: {
    materials: string;
    inclusions: string;
    hardware: string;
    dimensions: string;
    weight: string;
    curingTime: string;
  };
  careInstructions: string[];
  resinArtworkType: 'floral-crystal' | 'emerald-gold' | 'golden-amber' | 'keepsake-pyramid' | 'botanical-teardrop' | 'ocean-marble' | 'pressed-rose' | 'monstera-leaf';
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  customEngraving?: string;
}

export interface OrderAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type OrderStatus = 'Order Placed' | 'Resin Pouring & Curing' | 'Hand Polishing & Assembly' | 'Dispatched' | 'Delivered';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  trackingNumber: string;
  address: OrderAddress;
  paymentMethod: 'Razorpay Online (UPI / Card / NetBanking)';
  paymentId: string;
  paymentStatus: 'PAID';
}

export interface CustomOrderRequest {
  id: string;
  requestDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  itemType: 'Preserved Floral Pendant' | 'Statement Earrings' | 'Pyramid Keepsake' | 'Coaster Set (Pair of 2)' | 'Botanical Bookmark';
  flowerInclusions: string[];
  metalAccents: '24k Gold Leaf' | 'Rose Gold Flakes' | 'Silver Leaf' | 'None (Pure Resin)';
  resinBaseColor: 'Crystal Clear' | 'Deep Emerald Swirl' | 'Smoky Amber' | 'Soft Rose Tint';
  personalizedText?: string;
  occasion: string;
  specialNotes?: string;
  estimatedPrice: number;
  status: 'Pending Review' | 'Artisan Quote Sent' | 'In Production' | 'Completed';
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}
