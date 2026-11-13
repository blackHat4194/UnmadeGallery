/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const rawBase =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')
    : '';

// Use relative URLs when running on same origin or Vite dev proxy; use VITE_API_URL when deployed cross-origin
export const API_BASE_URL =
  typeof window !== 'undefined' &&
  rawBase &&
  window.location.hostname === 'localhost' &&
  rawBase.includes('localhost:5000') &&
  window.location.port !== '5173'
    ? ''
    : rawBase;

export function apiUrl(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
}
