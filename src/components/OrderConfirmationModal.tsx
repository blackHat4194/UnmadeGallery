/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Package, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatINR } from '../lib/ecommerceLogic';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrderInAccount: (order: Order) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewOrderInAccount
}) => {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Order Confirmation"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-[#E8DFD0] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#164B3B]/10 text-[#164B3B] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-[#164B3B]" />
        </div>

        <div>
          <span className="text-[11px] font-mono text-[#C6A15B] font-bold uppercase tracking-wider">
            Razorpay Payment Confirmed
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#164B3B] mt-1">
            Thank You For Supporting Artisan Craft
          </h2>
          <p className="text-xs font-mono text-[#29231F]/70 mt-1">
            Order Reference: <strong>{order.orderNumber}</strong>
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[#29231F]/80 leading-relaxed max-w-sm mx-auto">
          We have received your payment of <strong className="text-[#164B3B]">{formatINR(order.total)}</strong>. Your selected resin pieces are now entering our 72-hour thermal preparation and curing queue.
        </p>

        {/* Order Details Brief Box */}
        <div className="bg-[#F7F3EA] p-4 rounded-xl text-left text-xs border border-[#E8DFD0] space-y-2">
          <div className="flex justify-between border-b border-[#E8DFD0]/60 pb-1.5">
            <span className="text-[#29231F]/60">Assigned Courier</span>
            <span className="font-semibold text-[#164B3B] font-mono">{order.trackingNumber}</span>
          </div>
          <div className="flex justify-between border-b border-[#E8DFD0]/60 pb-1.5">
            <span className="text-[#29231F]/60">Recipient</span>
            <span className="font-semibold text-[#29231F]">{order.address.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#29231F]/60">Dispatch Window</span>
            <span className="font-semibold text-[#164B3B]">2-3 Studio Working Days</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onViewOrderInAccount(order)}
            className="flex-1 py-3 bg-[#164B3B] hover:bg-[#20634f] text-[#F7F3EA] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Package className="w-4 h-4 text-[#C6A15B]" />
            <span>Track in Account</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#F7F3EA] hover:bg-[#E8DFD0] text-[#29231F] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
