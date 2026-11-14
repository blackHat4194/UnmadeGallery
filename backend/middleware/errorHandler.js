/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function apiNotFoundHandler(req, res) {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
}

export function safeErrorHandler(err, _req, res, _next) {
  if (err?.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'Origin not allowed by CORS policy.' });
    return;
  }

  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request payload exceeds maximum allowed size.' });
    return;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON request body.' });
    return;
  }

  const statusCode = Number(err?.status || err?.statusCode || 500);
  const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  if (safeStatus >= 500) {
    console.error('[UNMADE GALLERY Error]', err?.message || 'Internal Server Error');
    res.status(safeStatus).json({ error: 'An internal server error occurred.' });
    return;
  }

  res.status(safeStatus).json({
    error: err?.message || 'Request could not be processed.',
    ...(err?.errors ? { errors: err.errors } : {})
  });
}
