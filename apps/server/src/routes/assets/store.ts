import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, defineSchema, newId, nowIso } from '../../db.ts';
import { AUTH_SECRET, DATA_DIR, PUBLIC_URL } from '../../env.ts';

/** Binary asset bytes live on disk under DATA_DIR/assets/<projectId>/<uuid><ext>. */
export const ASSET_DIR = path.join(DATA_DIR, 'assets');
/** Preview thumbnails live under DATA_DIR/previews/<projectId>/<file>.webp. */
export const PREVIEW_DIR = path.join(DATA_DIR, 'previews');
fs.mkdirSync(ASSET_DIR, { recursive: true });
fs.mkdirSync(PREVIEW_DIR, { recursive: true });

defineSchema(`
CREATE TABLE IF NOT EXISTS project_asset (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (project_id, path)
);
`);

export type AssetRow = {
  id: string;
  project_id: string;
  path: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.pdf': 'application/pdf', '.json': 'application/json', '.txt': 'text/plain', '.css': 'text/css',
};

export function guessMime(p: string, fallback = 'application/octet-stream'): string {
  return MIME_BY_EXT[path.extname(p).toLowerCase()] ?? fallback;
}

/** Project-relative asset path: no leading slash, no `..`/empty segments. Null when invalid. */
export function normalizeAssetPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const p = value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!p || p.length > 1024) return null;
  const parts = p.split('/');
  if (parts.some((s) => !s || s === '.' || s === '..')) return null;
  return p;
}

const STORAGE_KEY_RE = /^[A-Za-z0-9-]+\/[A-Za-z0-9-]+(\.[a-z0-9]{1,10})?$/;
export const isStorageKey = (k: unknown): k is string => typeof k === 'string' && STORAGE_KEY_RE.test(k);

export function newStorageKey(projectId: string, assetPath: string): string {
  const ext = path.extname(assetPath).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 11);
  const safeProject = projectId.replace(/[^A-Za-z0-9-]/g, '');
  return `${safeProject}/${newId()}${/^\.[a-z0-9]{1,10}$/.test(ext) ? ext : ''}`;
}

export const storageFile = (key: string) => path.join(ASSET_DIR, ...key.split('/'));
export const publicAssetUrl = (key: string) => `${PUBLIC_URL}/asset-files/${key}`;

// ---------- signed upload tokens ----------

type UploadClaims = { p: string; k: string; m: string; e: number };

const sign = (payload: string) => crypto.createHmac('sha256', AUTH_SECRET).update(`asset-upload:${payload}`).digest('base64url');

export function signUploadToken(claims: UploadClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyUploadToken(token: string): UploadClaims | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as UploadClaims;
    if (typeof claims.e !== 'number' || claims.e < Date.now() || !isStorageKey(claims.k)) return null;
    return claims;
  } catch {
    return null;
  }
}

// ---------- rows ----------

export function findAsset(projectId: string, assetPath: string): AssetRow | undefined {
  return db.prepare('SELECT * FROM project_asset WHERE project_id = ? AND path = ?').get(projectId, assetPath) as AssetRow | undefined;
}

/** Path lookup with Next.js public-dir semantics: exact, `public/<p>`, then `<p>` without `public/`. */
export function lookupAsset(projectId: string, assetPath: string): AssetRow | undefined {
  const candidates = [assetPath, `public/${assetPath}`];
  if (assetPath.startsWith('public/')) candidates.push(assetPath.slice('public/'.length));
  for (const candidate of candidates) {
    const row = findAsset(projectId, candidate);
    if (row) return row;
  }
  return undefined;
}

function removeStorage(key: string) {
  fs.promises.rm(storageFile(key), { force: true }).catch(() => {});
}

/** Upserts the row for `(projectId, path)`; deletes the replaced object's bytes. */
export function upsertAssetRow(input: { projectId: string; path: string; storageKey: string; mimeType: string; sizeBytes: number; userId?: string | null }): AssetRow {
  const now = nowIso();
  const existing = findAsset(input.projectId, input.path);
  if (existing) {
    db.prepare('UPDATE project_asset SET storage_key = ?, mime_type = ?, size_bytes = ?, updated_at = ? WHERE id = ?').run(
      input.storageKey, input.mimeType, input.sizeBytes, now, existing.id,
    );
    if (existing.storage_key !== input.storageKey) removeStorage(existing.storage_key);
    return { ...existing, storage_key: input.storageKey, mime_type: input.mimeType, size_bytes: input.sizeBytes, updated_at: now };
  }
  const row: AssetRow = {
    id: newId(), project_id: input.projectId, path: input.path, storage_key: input.storageKey, mime_type: input.mimeType,
    size_bytes: input.sizeBytes, created_by: input.userId ?? null, created_at: now, updated_at: now,
  };
  db.prepare(
    `INSERT INTO project_asset (id, project_id, path, storage_key, mime_type, size_bytes, created_by, created_at, updated_at)
     VALUES (@id, @project_id, @path, @storage_key, @mime_type, @size_bytes, @created_by, @created_at, @updated_at)`,
  ).run(row);
  return row;
}

export function serializeAsset(row: AssetRow) {
  return {
    id: row.id,
    path: row.path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    url: `/${row.path}`,
    publicUrl: publicAssetUrl(row.storage_key),
    storageKey: row.storage_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Server-side ingest (used by /import/assets): writes the bytes and upserts the
 * row for `(projectId, path)`. Throws on an invalid path.
 */
export async function storeAsset(
  projectId: string,
  a: { path: string; contentType: string; data: Buffer },
): Promise<{ id: string; path: string; publicUrl: string; sizeBytes: number }> {
  const assetPath = normalizeAssetPath(a.path);
  if (!assetPath) throw new Error(`Invalid asset path: ${a.path}`);
  const key = newStorageKey(projectId, assetPath);
  const file = storageFile(key);
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(file, a.data);
  const row = upsertAssetRow({
    projectId,
    path: assetPath,
    storageKey: key,
    mimeType: a.contentType || guessMime(assetPath),
    sizeBytes: a.data.length,
  });
  return { id: row.id, path: row.path, publicUrl: publicAssetUrl(row.storage_key), sizeBytes: Number(row.size_bytes) };
}

/** Removes a project's asset bytes and previews (rows go via ON DELETE CASCADE). */
export function removeProjectStorage(projectId: string) {
  const safe = projectId.replace(/[^A-Za-z0-9-]/g, '');
  if (!safe) return;
  fs.promises.rm(path.join(ASSET_DIR, safe), { recursive: true, force: true }).catch(() => {});
  fs.promises.rm(path.join(PREVIEW_DIR, safe), { recursive: true, force: true }).catch(() => {});
}
