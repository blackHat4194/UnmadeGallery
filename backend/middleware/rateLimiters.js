/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import rateLimit from 'express-rate-limit';

export function createAuthRateLimiter(options = {}) {
  const defaultMax = process.env.NODE_ENV === 'test' ? 100 : 20;
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: Number(options.max || process.env.RATE_LIMIT_MAX_AUTH || defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many authentication attempts. Please wait a few minutes and try again.'
    }
  });
}

export function createSensitiveRateLimiter(options = {}) {
  const defaultMax = process.env.NODE_ENV === 'test' ? 200 : 60;
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: Number(options.max || process.env.RATE_LIMIT_MAX_SENSITIVE || defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests to this protected endpoint. Please slow down.'
    }
  });
}
