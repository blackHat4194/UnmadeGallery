/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  Plus,
  Edit3,
  ArrowLeft,
  Layers,
  Search,
  Upload,
  Trash2,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { formatINR, validateProductInput } from '../lib/ecommerceLogic.js';
import { ResinArtImage } from './ResinArtImage.jsx';

const EMPTY_PRODUCT_FORM = {
  name: '',
  subtitle: '',
  category: 'Floral Jewellery',
  collection: 'Floral Elegance',
  price: 2500,
  originalPrice: '',
  stock: 5,
  description: '',
  materials: 'UV-Stabilized Optical Resin, 18K Gold Plating',
  inclusions: 'Real dried botanicals & 24k gold flakes',
  isBestSeller: true,
  isNewArrival: true,
  useAsCollectionCover: false,
  featureInStory: false,
  featureInHero: false,
  photoDataUrl: '',
  photoFileName: '',
  imageUrl: ''
};

export const AdminDashboard = ({
  products,
  orders,
  customRequests,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateCustomStatus,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_PRODUCT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusBanner, setStatusBanner] = useState(null);

  // Overview metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 4);
  const pendingOrders = orders.filter((o) => o.status !== 'Delivered');

  const showBanner = (message) => {
    setStatusBanner(message);
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handlePhotoFileChange = (e, setter) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size must be under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter((prev) => ({
        ...prev,
        photoDataUrl: typeof reader.result === 'string' ? reader.result : '',
        photoFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateNewField = (field, value) => {
    setNewForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  const updateEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  const openEditModal = (product) => {
    setFormError(null);
    setFieldErrors({});
    setConfirmDeleteId(null);
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      subtitle: product.subtitle || '',
      category: product.category || 'Floral Jewellery',
      collection: product.collection || 'Floral Elegance',
      price: product.price ?? 2500,
      originalPrice: product.originalPrice ?? '',
      stock: product.stock ?? 0,
      description: product.description || '',
      materials: product.specifications?.materials || '',
      inclusions: product.specifications?.inclusions || '',
      isBestSeller: Boolean(product.isBestSeller),
      isNewArrival: Boolean(product.isNewArrival),
      useAsCollectionCover: false,
      featureInStory: false,
      featureInHero: false,
      photoDataUrl: '',
      photoFileName: '',
      imageUrl: product.imageUrl || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editForm) return;

    const validation = validateProductInput(editForm, products, editingProduct.id);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(Object.values(validation.errors)[0] || 'Please review the highlighted fields.');
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const result = await onUpdateProduct(editingProduct.id, validation.sanitized);
    setIsSubmitting(false);

    if (result?.ok === false) {
      if (result.errors) setFieldErrors(result.errors);
      setFormError(result.error || 'Failed to update creation.');
      return;
    }

    setEditingProduct(null);
    setEditForm(null);
    showBanner(`Updated "${validation.sanitized.name}" and synced data/gallery-data.json.`);
  };

  const handleDeleteCurrentProduct = async () => {
    if (!editingProduct || !onDeleteProduct) return;
    setIsSubmitting(true);
    const result = await onDeleteProduct(editingProduct.id);
    setIsSubmitting(false);
    if (result?.ok === false) {
      setFormError(result.error || 'Failed to delete creation.');
      return;
    }
    const deletedName = editingProduct.name;
    setEditingProduct(null);
    setEditForm(null);
    setConfirmDeleteId(null);
    showBanner(`Removed "${deletedName}" from gallery catalog.`);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const validation = validateProductInput(newForm, products);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(Object.values(validation.errors)[0] || 'Please fix the highlighted product details before publishing.');
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const result = await onAddProduct(validation.sanitized);
    setIsSubmitting(false);

    if (result?.ok === false) {
      if (result.errors) setFieldErrors(result.errors);
      setFormError(result.error || 'Unable to save creation.');
      return;
    }

    const savedName = validation.sanitized.name;
    setIsAddingProduct(false);
    setNewForm(EMPTY_PRODUCT_FORM);
    showBanner(`Published "${savedName}"! Photo saved in data/uploads/ & synced to products.js.`);
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#29231F] flex flex-col md:flex-row">
      {/* Mobile Top Header Bar & Tabs */}
      <header className="md:hidden bg-[#29231F] text-[#F7F3EA] p-4 border-b border-[#3d342e] sticky top-0 z-30">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#164B3B] border border-[#C6A15B] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            </div>
            <span className="font-serif text-base font-semibold tracking-wider text-[#F7F3EA] uppercase">
              UNMADE STUDIO
            </span>
          </div>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#E8DFD0] bg-[#3d342e] hover:bg-[#164B3B] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#164B3B] text-white font-semibold'
                : 'text-[#E8DFD0]/80 hover:bg-[#3d342e]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#164B3B] text-white font-semibold'
                : 'text-[#E8DFD0]/80 hover:bg-[#3d342e]'
            }`}
          >
            <span>Orders ({orders.length})</span>
            {pendingOrders.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'bg-[#164B3B] text-white font-semibold'
                : 'text-[#E8DFD0]/80 hover:bg-[#3d342e]'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[#164B3B] text-white font-semibold'
                : 'text-[#E8DFD0]/80 hover:bg-[#3d342e]'
            }`}
          >
            <span>Custom ({customRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#164B3B] text-white font-semibold'
                : 'text-[#E8DFD0]/80 hover:bg-[#3d342e]'
            }`}
          >
            <span>Inventory</span>
            {lowStockProducts.length > 0 && (
              <span className="text-[10px] bg-red-900 text-red-200 px-1 rounded">
                {lowStockProducts.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#29231F] text-[#F7F3EA] p-6 flex-col justify-between shrink-0 border-r border-[#3d342e]">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#164B3B] border border-[#C6A15B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wider text-[#F7F3EA] uppercase">
                UNMADE
              </span>
              <p className="text-[10px] text-[#C6A15B] font-mono tracking-widest uppercase">
                Studio Atelier Console
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'text-[#E8DFD0]/70 hover:bg-[#3d342e] hover:text-[#F7F3EA]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#C6A15B]" />
              <span>Studio Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'text-[#E8DFD0]/70 hover:bg-[#3d342e] hover:text-[#F7F3EA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
                <span>Orders ({orders.length})</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'text-[#E8DFD0]/70 hover:bg-[#3d342e] hover:text-[#F7F3EA]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C6A15B]" />
              <span>Products &amp; Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'text-[#E8DFD0]/70 hover:bg-[#3d342e] hover:text-[#F7F3EA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                <span>Custom Commissions</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#C6A15B] text-[#164B3B] font-bold rounded">
                {customRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#164B3B] text-[#F7F3EA] font-semibold'
                  : 'text-[#E8DFD0]/70 hover:bg-[#3d342e] hover:text-[#F7F3EA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#C6A15B]" />
                <span>Inventory &amp; Alerts</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-mono">
                  {lowStockProducts.length} low
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Exit Admin */}
        <div className="pt-6 border-t border-[#3d342e]">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#E8DFD0]/80 hover:text-white bg-[#3d342e] hover:bg-[#164B3B] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#E8DFD0]">
          <div>
            <span className="text-[11px] sm:text-xs font-mono text-[#C6A15B] uppercase tracking-wider font-semibold">
              UNMADE GALLERY Admin Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#164B3B]">
              {activeTab === 'overview' && 'Atelier Performance & Metrics'}
              {activeTab === 'orders' && 'Order Management & Curing Schedule'}
              {activeTab === 'products' && 'Product Portfolio & Pricing'}
              {activeTab === 'custom' && 'Bespoke Commission Requests'}
              {activeTab === 'inventory' && 'Inventory Control & Low-Stock Alerts'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#29231F]/60">Synced with data/gallery-data.json</span>
            <button
              onClick={() => {
                setFormError(null);
                setFieldErrors({});
                setNewForm(EMPTY_PRODUCT_FORM);
                setIsAddingProduct(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Creation</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-[#164B3B] rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* KPI Cards Grid (2-cols on mobile, 4-cols on lg) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#29231F]/60">
                  Total Revenue
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#164B3B] mt-1 tabular-nums">
                  {formatINR(totalRevenue)}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">100% Online Razorpay</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#29231F]/60">
                  Total Orders
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#164B3B] mt-1 tabular-nums">
                  {orders.length}
                </p>
                <p className="text-[11px] text-[#29231F]/60 mt-1">{pendingOrders.length} in production/transit</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#29231F]/60">
                  Active Creations
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#164B3B] mt-1 tabular-nums">
                  {products.length}
                </p>
                <p className="text-[11px] text-[#29231F]/60 mt-1">Across 5 art categories</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8DFD0] shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
                  Low-Stock Attention
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-red-700 mt-1 tabular-nums">
                  {lowStockProducts.length}
                </p>
                <p className="text-[11px] text-red-600 font-medium mt-1">Under 4 units remaining</p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs">
              <h3 className="font-serif text-lg font-medium text-[#29231F] mb-4">
                Recent Orders Needing Resin Artisan Action
              </h3>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-[#E8DFD0] text-[#29231F]/60 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Collector Name</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total (₹)</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFD0]/60">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#F7F3EA]/50">
                        <td className="py-3 font-mono font-bold text-[#164B3B]">{ord.orderNumber}</td>
                        <td className="py-3 font-medium">{ord.address.fullName}</td>
                        <td className="py-3 text-[#29231F]/60">{ord.date}</td>
                        <td className="py-3">{ord.items.length} items</td>
                        <td className="py-3 font-semibold tabular-nums text-[#164B3B]">{formatINR(ord.total)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#164B3B]/10 text-[#164B3B]">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-[#C6A15B] hover:underline font-semibold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#29231F]">
              All Orders &amp; Studio Statuses
            </h3>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-[#E8DFD0] bg-[#F7F3EA]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#164B3B]">{ord.orderNumber}</span>
                      <span className="text-[11px] text-[#29231F]/60">({ord.date})</span>
                    </div>
                    <p className="text-xs font-semibold text-[#29231F]">
                      {ord.address.fullName} · {ord.address.city}, {ord.address.state} ({ord.address.phone})
                    </p>
                    <p className="text-[11px] text-[#29231F]/70">
                      Items: {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#164B3B] tabular-nums">{formatINR(ord.total)}</p>
                      <p className="text-[10px] text-emerald-700">Razorpay Paid</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#29231F]/60 mb-1">
                        Update Status
                      </label>
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#C6A15B] rounded-lg text-xs font-medium text-[#164B3B] focus:outline-none"
                      >
                        <option>Order Placed</option>
                        <option>Resin Pouring &amp; Curing</option>
                        <option>Hand Polishing &amp; Assembly</option>
                        <option>Dispatched</option>
                        <option>Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-serif text-lg font-medium text-[#29231F]">
                  Product Portfolio ({products.length} Creations)
                </h3>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search creations..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                  <Search className="w-4 h-4 text-[#29231F]/40 absolute left-2.5 top-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((product) => (
                    <div key={product.id} className="p-4 rounded-xl border border-[#E8DFD0] bg-[#F7F3EA]/30 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-3 items-center mb-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-[#E8DFD0]">
                            <ResinArtImage type={product.resinArtworkType} imageUrl={product.imageUrl} alt={product.name} />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-[#C6A15B] uppercase font-semibold">{product.category}</span>
                              {product.isBestSeller && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#164B3B]/10 text-[#164B3B] rounded font-semibold">
                                  Best Seller
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-sm font-medium text-[#29231F] truncate">{product.name}</h4>
                            <p className="text-xs font-semibold text-[#164B3B] tabular-nums mt-0.5">{formatINR(product.price)}</p>
                            {product.imageUrl && (
                              <p className="text-[10px] text-[#29231F]/50 font-mono truncate mt-0.5">{product.imageUrl}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs py-2 border-t border-[#E8DFD0]/60">
                          <span className="text-[#29231F]/70">Available Stock:</span>
                          <span className={`font-semibold tabular-nums ${product.stock <= 4 ? 'text-red-700' : 'text-[#164B3B]'}`}>
                            {product.stock} pieces
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E8DFD0]/60 flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex-1 py-1.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details &amp; Photo</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Custom Commission Requests */}
        {activeTab === 'custom' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#29231F]">
              Bespoke Custom Commission Requests ({customRequests.length})
            </h3>

            <div className="space-y-4">
              {customRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-xl border border-[#E8DFD0] bg-[#F7F3EA]/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD0] pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#C6A15B] font-bold">{req.id} · {req.requestDate}</span>
                      <h4 className="font-serif text-base font-semibold text-[#164B3B]">{req.itemType} for {req.clientName}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#164B3B] tabular-nums">Est. {formatINR(req.estimatedPrice)}</span>
                      <select
                        value={req.status}
                        onChange={(e) => onUpdateCustomStatus(req.id, e.target.value)}
                        className="px-2.5 py-1 bg-white border border-[#C6A15B] rounded text-xs font-semibold text-[#164B3B]"
                      >
                        <option>Pending Review</option>
                        <option>Artisan Quote Sent</option>
                        <option>In Production</option>
                        <option>Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#29231F]/80">
                    <p><strong>Client:</strong> {req.clientName} ({req.clientEmail} · {req.clientPhone})</p>
                    <p><strong>Occasion:</strong> {req.occasion}</p>
                    <p><strong>Selected Botanicals:</strong> {req.flowerInclusions.join(', ')}</p>
                    <p><strong>Metals &amp; Resin:</strong> {req.metalAccents} · {req.resinBaseColor}</p>
                    {req.personalizedText && <p><strong>Engraving:</strong> "{req.personalizedText}"</p>}
                    {req.specialNotes && <p><strong>Notes:</strong> {req.specialNotes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Inventory & Alerts */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#29231F] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Low-Stock Inventory Monitor (&le; 4 pieces left)</span>
            </h3>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#29231F]/70">All pieces have healthy studio reserves.</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-red-50/60 border border-red-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-serif font-medium text-[#29231F] text-sm">{p.name}</p>
                      <p className="text-xs text-red-700 font-medium">Critical Stock: Only {p.stock} units remaining</p>
                    </div>

                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1.5 bg-[#164B3B] text-white text-xs font-semibold rounded-lg hover:bg-[#20634f] cursor-pointer"
                    >
                      Restock Units
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && editForm && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl border border-[#E8DFD0] shadow-xl my-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8DFD0]">
                <h3 className="font-serif text-lg font-semibold text-[#164B3B]">
                  Edit Creation · {editingProduct.name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditForm(null);
                    setConfirmDeleteId(null);
                  }}
                  className="text-xs text-[#29231F]/60 hover:text-[#29231F] cursor-pointer"
                >
                  Close
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} noValidate className="space-y-4">
                {/* Product Photo Upload / Replace */}
                <div className="p-3.5 bg-[#F7F3EA] rounded-xl border border-[#E8DFD0] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#E8DFD0] shrink-0">
                    <ResinArtImage
                      type={editingProduct.resinArtworkType}
                      imageUrl={editForm.photoDataUrl || editForm.imageUrl}
                      alt={editForm.name}
                      showShimmer={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#164B3B]">
                      Product Photo (saved in data/uploads/)
                    </label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C6A15B] text-[#164B3B] rounded-lg text-xs font-semibold hover:bg-[#E8DFD0]/40 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>{editForm.photoFileName ? 'Change Selected Photo' : 'Upload / Replace Photo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handlePhotoFileChange(e, setEditForm)}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[11px] text-[#29231F]/60 truncate">
                      {editForm.photoFileName
                        ? `Selected: ${editForm.photoFileName}`
                        : editForm.imageUrl
                        ? `Current path: ${editForm.imageUrl}`
                        : 'Using handcrafted vector artwork until photo uploaded'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-product-name" className="block text-xs font-medium text-[#29231F]/70 mb-1">Creation Name *</label>
                    <input
                      id="edit-product-name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => updateEditField('name', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.name ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-product-subtitle" className="block text-xs font-medium text-[#29231F]/70 mb-1">Subtitle</label>
                    <input
                      id="edit-product-subtitle"
                      type="text"
                      value={editForm.subtitle}
                      onChange={(e) => updateEditField('subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-product-category" className="block text-xs font-medium text-[#29231F]/70 mb-1">Category</label>
                    <select
                      id="edit-product-category"
                      value={editForm.category}
                      onChange={(e) => updateEditField('category', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    >
                      <option>Earrings</option>
                      <option>Floral Jewellery</option>
                      <option>Personalised Keepsakes</option>
                      <option>Artistic Decor</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-product-collection" className="block text-xs font-medium text-[#29231F]/70 mb-1">Collection Series</label>
                    <select
                      id="edit-product-collection"
                      value={editForm.collection}
                      onChange={(e) => updateEditField('collection', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    >
                      <option>Floral Elegance</option>
                      <option>Emerald Collection</option>
                      <option>Golden Details</option>
                      <option>Personalised Keepsakes</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-product-price" className="block text-xs font-medium text-[#29231F]/70 mb-1">Price (₹ INR) *</label>
                    <input
                      id="edit-product-price"
                      type="number"
                      value={editForm.price}
                      onChange={(e) => updateEditField('price', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.price ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.price && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.price}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-product-original-price" className="block text-xs font-medium text-[#29231F]/70 mb-1">Original Price (₹, optional)</label>
                    <input
                      id="edit-product-original-price"
                      type="number"
                      value={editForm.originalPrice}
                      onChange={(e) => updateEditField('originalPrice', e.target.value)}
                      placeholder="Optional compare-at price"
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.originalPrice ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.originalPrice && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.originalPrice}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-product-stock" className="block text-xs font-medium text-[#29231F]/70 mb-1">Studio Stock (Units) *</label>
                    <input
                      id="edit-product-stock"
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => updateEditField('stock', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.stock ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.stock && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.stock}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-product-description" className="block text-xs font-medium text-[#29231F]/70 mb-1">Story &amp; Description *</label>
                  <textarea
                    id="edit-product-description"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => updateEditField('description', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.description ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                  />
                  {fieldErrors.description && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isBestSeller}
                      onChange={(e) => setEditForm({ ...editForm, isBestSeller: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Show in Best Sellers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isNewArrival}
                      onChange={(e) => setEditForm({ ...editForm, isNewArrival: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Mark as New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.useAsCollectionCover}
                      onChange={(e) => setEditForm({ ...editForm, useAsCollectionCover: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Set photo as Collection Cover</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.featureInStory}
                      onChange={(e) => setEditForm({ ...editForm, featureInStory: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Feature in Brand Story</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8DFD0]">
                  {onDeleteProduct && (
                    confirmDeleteId === editingProduct.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleDeleteCurrentProduct}
                          className="px-3 py-2 bg-red-700 text-white text-xs font-semibold rounded-lg hover:bg-red-800 cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-2 bg-[#E8DFD0] text-[#29231F] text-xs rounded-lg cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(editingProduct.id)}
                        className="px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setEditForm(null);
                        setConfirmDeleteId(null);
                      }}
                      className="px-4 py-2 bg-[#E8DFD0] text-[#29231F] text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#164B3B] text-white text-xs font-semibold rounded-lg hover:bg-[#20634f] cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl border border-[#E8DFD0] shadow-xl my-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8DFD0]">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#164B3B]">
                    Add New Resin Creation to Gallery
                  </h3>
                  <p className="text-[11px] text-[#29231F]/60">
                    Saves photo to data/uploads/ and updates gallery-data.json &amp; products.js
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="text-xs text-[#29231F]/60 hover:text-[#29231F] cursor-pointer"
                >
                  Close
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateProduct} noValidate className="space-y-4">
                {/* Product Photo Upload Zone */}
                <div className="p-3.5 bg-[#F7F3EA] rounded-xl border border-dashed border-[#C6A15B] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#E8DFD0] shrink-0 flex items-center justify-center">
                    {newForm.photoDataUrl ? (
                      <img
                        src={newForm.photoDataUrl}
                        alt="Uploaded product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-[#C6A15B]/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#164B3B]">
                      Product Photo (PNG / JPG / WEBP)
                    </label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#164B3B] text-[#F7F3EA] rounded-lg text-xs font-semibold hover:bg-[#20634f] cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>{newForm.photoFileName ? 'Change Photo' : 'Choose Product Photo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handlePhotoFileChange(e, setNewForm)}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[11px] text-[#29231F]/60 truncate">
                      {newForm.photoFileName
                        ? `Ready to save: ${newForm.photoFileName}`
                        : 'Photo will be saved inside data/uploads/ and shown across customer pages.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-product-name" className="block text-xs font-medium text-[#29231F]/70 mb-1">Creation Name *</label>
                    <input
                      id="new-product-name"
                      type="text"
                      value={newForm.name}
                      onChange={(e) => updateNewField('name', e.target.value)}
                      placeholder="e.g. Celestial Golden Fern Pendant"
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.name ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="new-product-subtitle" className="block text-xs font-medium text-[#29231F]/70 mb-1">Subtitle</label>
                    <input
                      id="new-product-subtitle"
                      type="text"
                      value={newForm.subtitle}
                      onChange={(e) => updateNewField('subtitle', e.target.value)}
                      placeholder="Preserved gold fern frond in crystal dome"
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-product-category" className="block text-xs font-medium text-[#29231F]/70 mb-1">Category *</label>
                    <select
                      id="new-product-category"
                      value={newForm.category}
                      onChange={(e) => updateNewField('category', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    >
                      <option>Earrings</option>
                      <option>Floral Jewellery</option>
                      <option>Personalised Keepsakes</option>
                      <option>Artistic Decor</option>
                    </select>
                    {fieldErrors.category && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.category}</p>}
                  </div>
                  <div>
                    <label htmlFor="new-product-collection" className="block text-xs font-medium text-[#29231F]/70 mb-1">Collection Series *</label>
                    <select
                      id="new-product-collection"
                      value={newForm.collection}
                      onChange={(e) => updateNewField('collection', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    >
                      <option>Floral Elegance</option>
                      <option>Emerald Collection</option>
                      <option>Golden Details</option>
                      <option>Personalised Keepsakes</option>
                    </select>
                    {fieldErrors.collection && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.collection}</p>}
                  </div>
                  <div>
                    <label htmlFor="new-product-price" className="block text-xs font-medium text-[#29231F]/70 mb-1">Price (₹) *</label>
                    <input
                      id="new-product-price"
                      type="number"
                      value={newForm.price}
                      onChange={(e) => updateNewField('price', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.price ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.price && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.price}</p>}
                  </div>
                  <div>
                    <label htmlFor="new-product-original-price" className="block text-xs font-medium text-[#29231F]/70 mb-1">Original Price (₹, optional)</label>
                    <input
                      id="new-product-original-price"
                      type="number"
                      value={newForm.originalPrice}
                      onChange={(e) => updateNewField('originalPrice', e.target.value)}
                      placeholder="Compare-at price > selling price"
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.originalPrice ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.originalPrice && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.originalPrice}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="new-product-stock" className="block text-xs font-medium text-[#29231F]/70 mb-1">Initial Stock *</label>
                    <input
                      id="new-product-stock"
                      type="number"
                      value={newForm.stock}
                      onChange={(e) => updateNewField('stock', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.stock ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                    />
                    {fieldErrors.stock && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.stock}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="new-product-description" className="block text-xs font-medium text-[#29231F]/70 mb-1">Story &amp; Description *</label>
                  <textarea
                    id="new-product-description"
                    rows={2}
                    value={newForm.description}
                    onChange={(e) => updateNewField('description', e.target.value)}
                    placeholder="Describe the botanicals, pigments, and studio craft (min 10 characters)..."
                    className={`w-full px-3 py-2 bg-[#F7F3EA] border rounded-lg text-xs ${fieldErrors.description ? 'border-red-500' : 'border-[#E8DFD0]'}`}
                  />
                  {fieldErrors.description && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-product-materials" className="block text-xs font-medium text-[#29231F]/70 mb-1">Materials</label>
                    <input
                      id="new-product-materials"
                      type="text"
                      value={newForm.materials}
                      onChange={(e) => updateNewField('materials', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-product-inclusions" className="block text-xs font-medium text-[#29231F]/70 mb-1">Inclusions</label>
                    <input
                      id="new-product-inclusions"
                      type="text"
                      value={newForm.inclusions}
                      onChange={(e) => updateNewField('inclusions', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.isBestSeller}
                      onChange={(e) => setNewForm({ ...newForm, isBestSeller: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Feature in Best Sellers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.isNewArrival}
                      onChange={(e) => setNewForm({ ...newForm, isNewArrival: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Mark as New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.useAsCollectionCover}
                      onChange={(e) => setNewForm({ ...newForm, useAsCollectionCover: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Use photo as Collection Cover</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.featureInStory}
                      onChange={(e) => setNewForm({ ...newForm, featureInStory: e.target.checked })}
                      className="accent-[#164B3B]"
                    />
                    <span>Feature in Brand Story</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#164B3B] text-white text-xs font-semibold rounded-lg hover:bg-[#20634f] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Uploading & Saving...' : 'Publish to Store'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2.5 bg-[#E8DFD0] text-[#29231F] text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
