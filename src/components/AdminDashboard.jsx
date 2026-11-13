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
  Search
} from 'lucide-react';
import { formatINR } from '../lib/ecommerceLogic.js';
import { ResinArtImage } from './ResinArtImage.jsx';

export const AdminDashboard = ({
  products,
  orders,
  customRequests,
  onUpdateProduct,
  onAddProduct,
  onUpdateOrderStatus,
  onUpdateCustomStatus,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Floral Jewellery');
  const [newProdPrice, setNewProdPrice] = useState(2500);
  const [newProdStock, setNewProdStock] = useState(5);
  const [newProdSubtitle, setNewProdSubtitle] = useState('');

  // Overview metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 4);
  const pendingOrders = orders.filter((o) => o.status !== 'Delivered');

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProduct = {
      id: `unmade-${Date.now().toString().slice(-4)}`,
      name: newProdName,
      subtitle: newProdSubtitle || 'Handcrafted botanical resin artwork',
      category: newProdCategory,
      collection: 'Floral Elegance',
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      rating: 5.0,
      reviewCount: 1,
      description: 'Exclusive hand-poured studio collection piece.',
      details: ['Hand-poured in small batches', 'UV-resistant optical resin', 'Finished with 18k gold accents'],
      specifications: {
        materials: 'Optical Resin, Fine Pigments',
        inclusions: 'Real dried botanical flora',
        hardware: '18K Gold Plated Brass',
        dimensions: 'Handcrafted dimensions',
        weight: '12g',
        curingTime: '72 hours'
      },
      careInstructions: ['Keep away from harsh solvents', 'Store in dry pouch'],
      resinArtworkType: 'floral-crystal',
      inStock: Number(newProdStock) > 0
    };

    onAddProduct(newProduct);
    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdSubtitle('');
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
            <span className="hidden sm:inline text-xs text-[#29231F]/60">Live Database Synced</span>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Creation</span>
            </button>
          </div>
        </div>

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
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-[#E8DFD0]">
                            <ResinArtImage type={product.resinArtworkType} alt={product.name} />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[10px] text-[#C6A15B] uppercase font-semibold">{product.category}</span>
                            <h4 className="font-serif text-sm font-medium text-[#29231F] truncate">{product.name}</h4>
                            <p className="text-xs font-semibold text-[#164B3B] tabular-nums mt-0.5">{formatINR(product.price)}</p>
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
                          onClick={() => setEditingProduct(product)}
                          className="flex-1 py-1.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Stock &amp; Price</span>
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
                      onClick={() => setEditingProduct(p)}
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
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E8DFD0] shadow-xl">
              <h3 className="font-serif text-lg font-semibold text-[#164B3B] mb-4">
                Update {editingProduct.name}
              </h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Studio Stock (Units)</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#164B3B] text-white text-xs font-semibold rounded-lg hover:bg-[#20634f] cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-[#E8DFD0] text-[#29231F] text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E8DFD0] shadow-xl">
              <h3 className="font-serif text-lg font-semibold text-[#164B3B] mb-4">
                Add New Resin Creation to Gallery
              </h3>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Creation Name *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Celestial Golden Fern Pendant"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newProdSubtitle}
                    onChange={(e) => setNewProdSubtitle(e.target.value)}
                    placeholder="Preserved gold fern frond in crystal dome"
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                  >
                    <option>Earrings</option>
                    <option>Floral Jewellery</option>
                    <option>Necklaces &amp; Pendants</option>
                    <option>Personalised Keepsakes</option>
                    <option>Artistic Decor</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#29231F]/70 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#164B3B] text-white text-xs font-semibold rounded-lg hover:bg-[#20634f] cursor-pointer"
                  >
                    Publish to Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2 bg-[#E8DFD0] text-[#29231F] text-xs font-semibold rounded-lg cursor-pointer"
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
