/**
 * Figma on a personal access token (no OAuth app): a token pasted on
 * /figma/connect (stored sealed per user), else FIGMA_TOKEN. Used only to
 * resolve image fills of designs pasted from the Figma clipboard.
 */
import { db, defineSchema, nowIso } from '../../db.ts';
import { findAsset, publicAssetUrl, storeAsset } from '../assets/store.ts';
import { mapLimit, openSecret, sealSecret } from './github/api.ts';

export const FIGMA_API = (process.env.FIGMA_API_URL || 'https://api.figma.com').replace(/\/+$/, '');

defineSchema(`
CREATE TABLE IF NOT EXISTS figma_account (
  user_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'auto',
  token TEXT,
  handle TEXT,
  email TEXT,
  updated_at TEXT NOT NULL
);
`);

type Row = { mode: 'auto' | 'token' | 'disabled'; token: string | null; handle: string | null; email: string | null };
export type FigmaMe = { id: string; handle: string; email: string; img_url?: string };

export class FigmaError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

const row = (userId: string) => db.prepare('SELECT mode, token, handle, email FROM figma_account WHERE user_id = ?').get(userId) as Row | undefined;

export function saveFigmaToken(userId: string, token: string | null, me: FigmaMe | null, mode: Row['mode'] = token ? 'token' : 'disabled') {
  db.prepare(
    `INSERT INTO figma_account (user_id, mode, token, handle, email, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET mode = excluded.mode, token = excluded.token, handle = excluded.handle, email = excluded.email, updated_at = excluded.updated_at`,
  ).run(userId, mode, token ? sealSecret(token) : null, me?.handle ?? null, me?.email ?? null, nowIso());
  meCache.clear();
}

export function figmaToken(userId: string): { token: string; source: 'saved' | 'env' } | null {
  const r = row(userId);
  if (r?.mode === 'disabled') return null;
  const saved = r?.mode === 'token' ? openSecret(r.token) : null;
  if (saved) return { token: saved, source: 'saved' };
  return process.env.FIGMA_TOKEN ? { token: process.env.FIGMA_TOKEN, source: 'env' } : null;
}

/** PATs authenticate with X-Figma-Token (OAuth tokens would use Bearer). */
async function figmaFetch(token: string, endpoint: string): Promise<Response> {
  try {
    return await fetch(`${FIGMA_API}${endpoint}`, { headers: { 'X-Figma-Token': token }, signal: AbortSignal.timeout(60_000) });
  } catch (err) {
    throw new FigmaError(`Could not reach Figma: ${(err as Error).message}`, 502);
  }
}

const meCache = new Map<string, { at: number; me: FigmaMe | null }>();
/** GET /v1/me; null when Figma rejects the token. Cached 5 min. */
export async function figmaMe(token: string): Promise<FigmaMe | null> {
  const hit = meCache.get(token);
  if (hit && Date.now() - hit.at < 300_000) return hit.me;
  const res = await figmaFetch(token, '/v1/me');
  if (res.status === 401 || res.status === 403) {
    meCache.set(token, { at: Date.now(), me: null });
    return null;
  }
  if (!res.ok) throw new FigmaError(`Figma returned ${res.status}`, 502);
  const me = (await res.json()) as FigmaMe;
  meCache.set(token, { at: Date.now(), me });
  return me;
}

export async function figmaStatus(userId: string) {
  const t = figmaToken(userId);
  if (!t) return { connected: false, handle: null, email: null };
  const r = row(userId);
  try {
    const me = await figmaMe(t.token);
    if (!me) return { connected: false, handle: null, email: null, error: 'Figma rejected the saved token' };
    return { connected: true, handle: me.handle, email: me.email, source: t.source };
  } catch {
    // Offline: trust what we saw when the token was saved.
    return { connected: true, handle: r?.handle ?? null, email: r?.email ?? null, source: t.source };
  }
}

const HASH_RE = /^[0-9a-f]{40}$/i;
const EXT_BY_MIME: Record<string, string> = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp', 'image/svg+xml': '.svg' };

/**
 * `GET /v1/files/:key/images` (all image fills of the file, hash → signed S3
 * URL that expires within ~14 days). The requested images are copied into
 * the project's assets so pasted designs keep working; set
 * FIGMA_PERSIST_IMAGES=0 to return Figma's URLs as-is.
 */
export async function resolveFigmaImages(userId: string, projectId: string, fileKey: string, hashes: string[]): Promise<Record<string, string>> {
  const t = figmaToken(userId);
  if (!t) throw new FigmaError('Figma is not connected. Connect Figma to import images.', 400, 'FIGMA_NOT_CONNECTED');
  const wanted = [...new Set(hashes.filter((h) => typeof h === 'string' && HASH_RE.test(h)).map((h) => h.toLowerCase()))];
  if (!wanted.length) return {};
  const persist = process.env.FIGMA_PERSIST_IMAGES !== '0';
  const resolved: Record<string, string> = {};
  const todo: string[] = [];
  for (const h of wanted) {
    const existing = persist ? ['.png', '.jpg', '.gif', '.webp', '.svg'].map((e) => findAsset(projectId, `figma/${h}${e}`)).find(Boolean) : undefined;
    if (existing) resolved[h] = publicAssetUrl(existing.storage_key);
    else todo.push(h);
  }
  if (!todo.length) return resolved;

  const res = await figmaFetch(t.token, `/v1/files/${encodeURIComponent(fileKey)}/images`);
  if (res.status === 401 || res.status === 403) {
    const body = (await res.text().catch(() => '')).slice(0, 200);
    // Invalid/expired token → let the client prompt to reconnect. A valid token without file access is a different error.
    const me = await figmaMe(t.token).catch(() => null);
    if (!me) throw new FigmaError('Figma rejected the token. Reconnect Figma.', 400, 'FIGMA_NOT_CONNECTED');
    throw new FigmaError(`Your Figma account (${me.handle}) cannot read this file${body ? `: ${body}` : ''}`, 403);
  }
  if (res.status === 404) throw new FigmaError('Figma file not found (or your token cannot access it)', 404);
  if (res.status === 429) throw new FigmaError('Figma rate limit reached. Try again in a minute.', 429);
  if (!res.ok) throw new FigmaError(`Figma returned ${res.status}`, 502);
  const data = (await res.json()) as { meta?: { images?: Record<string, string | null> } };
  const images = data.meta?.images ?? {};
  const byLower = new Map(Object.entries(images).map(([k, v]) => [k.toLowerCase(), v]));

  await mapLimit(todo, 6, async (h) => {
    const url = byLower.get(h);
    if (!url) return;
    if (!persist) {
      resolved[h] = url;
      return;
    }
    try {
      const img = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!img.ok) throw new Error(`download ${img.status}`);
      const mime = (img.headers.get('content-type') ?? 'image/png').split(';')[0].trim();
      const bytes = Buffer.from(await img.arrayBuffer());
      const stored = await storeAsset(projectId, { path: `figma/${h}${EXT_BY_MIME[mime] ?? '.png'}`, contentType: mime, data: bytes });
      resolved[h] = stored.publicUrl;
    } catch (err) {
      console.warn('[figma] could not copy image', h, (err as Error).message);
      resolved[h] = url;
    }
  });
  return resolved;
}
