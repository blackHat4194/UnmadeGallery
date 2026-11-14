/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ENV_PATH = path.resolve(__dirname, '..', '.env');
const ROOT_ENV_PATH = path.resolve(__dirname, '..', '..', '.env');

let loaded = false;

export function loadBackendEnv() {
  if (loaded) return;
  loaded = true;

  // Load backend/.env first so ADMIN_*, MONGODB_URI, JWT_SECRET work regardless of cwd
  if (fs.existsSync(BACKEND_ENV_PATH)) {
    dotenv.config({ path: BACKEND_ENV_PATH, override: false });
  }

  // Fill any remaining variables from workspace root .env without overwriting explicit/backend vars
  if (fs.existsSync(ROOT_ENV_PATH)) {
    dotenv.config({ path: ROOT_ENV_PATH, override: false });
  }
}

loadBackendEnv();
