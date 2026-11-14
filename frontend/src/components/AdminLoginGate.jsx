/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, LogOut, Sparkles } from 'lucide-react';
import { apiFetch, setAuthToken } from '../lib/api.js';

export const AdminLoginGate = ({ currentUser, onAuthSuccess, onLogout, onBackToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        setIsSubmitting(false);
        return;
      }

      if (data.user?.role !== 'admin') {
        setError('This account does not have Studio Admin privileges.');
        setIsSubmitting(false);
        return;
      }

      setAuthToken(data.token);
      onAuthSuccess(data.user, data.token);
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8DFD0] shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#164B3B] border border-[#C6A15B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-[#164B3B] tracking-wide">
                UNMADE GALLERY
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
                Atelier Admin Access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-[#29231F]/70 hover:text-[#164B3B] flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
        </div>

        <div className="border-t border-[#E8DFD0] pt-5">
          {currentUser && currentUser.role !== 'admin' ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Restricted Console</span>
                </p>
                <p>
                  You are currently signed in as customer <strong>{currentUser.email}</strong>. Only authorized studio administrator accounts can manage inventory and orders.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold rounded-lg hover:bg-[#20634f] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out to Switch</span>
                </button>
                <button
                  type="button"
                  onClick={onBackToStore}
                  className="px-4 py-2.5 bg-[#E8DFD0] text-[#29231F] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Back to Shop
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#29231F]/70">
                <Lock className="w-4 h-4 text-[#164B3B]" />
                <span>Sign in with your administrator credentials.</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="admin-login-email" className="block text-xs font-medium text-[#29231F]/70 mb-1">
                  Admin Email
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unmadegallery.com"
                  className="w-full px-3 py-2.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                />
              </div>

              <div>
                <label htmlFor="admin-login-password" className="block text-xs font-medium text-[#29231F]/70 mb-1">
                  Password
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2.5 bg-[#F7F3EA] border border-[#E8DFD0] rounded-lg text-xs text-[#29231F] focus:outline-none focus:border-[#164B3B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#164B3B] text-[#F7F3EA] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#20634f] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Studio Console'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
