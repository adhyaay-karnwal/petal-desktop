import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PORT = Number(process.env.PORT) || 4100;
export const HOST = process.env.HOST || '127.0.0.1';
/** Public origin of this server; the desktop app's LUNACLONE_API_URL must match. */
export const PUBLIC_URL = (process.env.PUBLIC_URL || `http://${HOST}:${PORT}`).replace(/\/$/, '');
export const DATA_DIR = process.env.DATA_DIR || path.join(serverRoot, 'data');
export const WEB_DIR = process.env.WEB_DIR || path.join(serverRoot, 'web');
export const AUTH_SECRET = process.env.BETTER_AUTH_SECRET || (process.env.PETAL_LOCAL_MODE === '1' ? localSecret() : 'petal-dev-secret-change-me-0123456789');

/** Per-install random secret kept next to the database. */
function localSecret() {
  const file = path.join(DATA_DIR, 'auth-secret');
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const secret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }
}
export const DESKTOP_SCHEME = process.env.DESKTOP_SCHEME || 'com.petal.desktop';
/** Optional: enables the server-side LLM merge used by save-to-code. */
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
/**
 * Single-user local mode (the server runs inside the desktop app): no login,
 * every request acts as the one local user. See localMode.ts.
 */
export const LOCAL_MODE = process.env.PETAL_LOCAL_MODE === '1';
/** Display name for the local user (the desktop passes the OS account name). */
export const LOCAL_USER_NAME = process.env.PETAL_USER_NAME || 'Me';
