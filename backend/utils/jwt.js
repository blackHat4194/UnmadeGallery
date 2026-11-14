/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const WEAK_PLACEHOLDERS = new Set([
  'unmade_gallery_dev_jwt_secret',
  'unmade_gallery_dev_jwt_secret_change_in_production',
  'change_this_to_a_strong_random_secret',
  'replace_with_at_least_32_characters_of_cryptographic_randomness',
  'secret',
  'jwt_secret'
]);

let ephemeralDevSecret = null;
let warnedEphemeral = false;

export function getJwtSecret() {
  const configured = String(process.env.JWT_SECRET || '').trim();
  const isWeak = !configured || configured.length < 32 || WEAK_PLACEHOLDERS.has(configured);

  if (!isWeak) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET environment variable must be set to a strong random string (min 32 characters) in production.'
    );
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(48).toString('hex');
  }
  if (!warnedEphemeral && process.env.NODE_ENV !== 'test') {
    warnedEphemeral = true;
    console.warn(
      '[UNMADE GALLERY Security] Using ephemeral per-process JWT secret for non-production runtime because JWT_SECRET is unset or too weak.'
    );
  }
  return ephemeralDevSecret;
}

export function validateSecurityEnv() {
  getJwtSecret();
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tv: Number(user.tokenVersion || 0)
    },
    getJwtSecret(),
    {
      algorithm: 'HS256',
      expiresIn: '7d'
    }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
}
