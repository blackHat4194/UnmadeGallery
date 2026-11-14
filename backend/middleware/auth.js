/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { verifyAuthToken } from '../utils/jwt.js';
import { findAuthUserById } from '../services/galleryStore.js';

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token.trim();
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }

    const decoded = verifyAuthToken(token);
    const authUser = await findAuthUserById(decoded.id);

    if (!authUser) {
      res.status(401).json({ error: 'Session is invalid or account no longer exists.' });
      return;
    }

    if (Number(authUser.tokenVersion || 0) !== Number(decoded.tv ?? 0)) {
      res.status(401).json({ error: 'Session has been signed out. Please sign in again.' });
      return;
    }

    const { tokenVersion: _tv, passwordHash: _ph, ...safeUser } = authUser;
    req.user = safeUser;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
      return;
    }
    res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      req.user = null;
      next();
      return;
    }

    const decoded = verifyAuthToken(token);
    const authUser = await findAuthUserById(decoded.id);
    if (authUser && Number(authUser.tokenVersion || 0) === Number(decoded.tv ?? 0)) {
      const { tokenVersion: _tv, passwordHash: _ph, ...safeUser } = authUser;
      req.user = safeUser;
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Studio admin privileges required.' });
    return;
  }
  next();
}
