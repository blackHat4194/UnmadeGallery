/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import { createBackendApp, initializeBackend } from './app.js';

const PORT = Number(process.env.PORT || 5000);

async function startBackend() {
  const dbStatus = await initializeBackend();
  const app = createBackendApp();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[UNMADE GALLERY Backend] Listening on http://localhost:${PORT} (storage: ${dbStatus.mode})`
    );
  });
}

startBackend().catch((err) => {
  console.error('Backend failed to start:', err);
  process.exit(1);
});
