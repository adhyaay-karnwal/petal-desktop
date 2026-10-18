import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { onProjectChange } from '../bus.ts';
import { db } from '../db.ts';
import { PUBLIC_URL } from '../env.ts';
import { getProject, jsonError, loadProject, type App, type Ctx, type ProjectRow } from '../lib/http.ts';
import {
  PREVIEW_DIR,
  guessMime,
  isStorageKey,
  lookupAsset,
  newStorageKey,
  normalizeAssetPath,
  publicAssetUrl,
  removeProjectStorage,
  serializeAsset,
  signUploadToken,
  storageFile,
  upsertAssetRow,
  verifyUploadToken,
  type AssetRow,
} from './assets/store.ts';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
const MAX_INLINE_BYTES = 10 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 20 * 1024 * 1024;
const UPLOAD_TTL_MS = 15 * 60 * 1000;

async function readJson(c: Ctx): Promise<Record<string, unknown>> {
  try {
    const body = await c.req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Project readers, or anyone holding a live share-link token (`?token=`). */
function loadReadableProject(c: Ctx): { ok: true; project: ProjectRow } | { ok: false; response: Response } {
  const token = c.req.query('token');
  if (token) {
    const project = getProject(c.req.param('projectId') ?? '');
    if (project && !project.deleted_at && project.link_token && project.link_access !== 'none' && project.link_token === token) {
      return { ok: true, project };
    }
  }
  const loaded = loadProject(c, 'viewer');
  return loaded.ok ? { ok: true, project: loaded.project } : loaded;
}

/** Streams a file with Range support. */
async function sendFile(c: Ctx, file: string, contentType: string, cacheControl: string): Promise<Response> {
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(file);
  } catch {
    return jsonError(c, 404, 'Asset not found');
  }
  const size = stat.size;
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
  };
  if (!c.req.header('origin')) headers['Access-Control-Allow-Origin'] = '*';
  const range = c.req.header('range');
  let start = 0;
  let end = size - 1;
  let status = 200;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m && (m[1] || m[2])) {
      if (m[1]) {
        start = Number(m[1]);
        end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      } else {
        start = Math.max(0, size - Number(m[2]));
      }
      if (start > end || start >= size) {
        return c.body(null, 416, { 'Content-Range': `bytes */${size}`, ...headers });
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
  }
  headers['Content-Length'] = String(size === 0 ? 0 : end - start + 1);
  if (c.req.method === 'HEAD' || size === 0) return c.body(null, status as 200, headers);
  const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
  return c.body(stream, status as 200, headers);
}

const previewFileRe = /^[A-Za-z0-9-]+\.webp$/;

export default function register(app: App) {
  onProjectChange((change) => {
    // Soft-deleted (trashed) projects keep their bytes; only purge once the row is gone.
    if (change.type === 'project-deleted' && !getProject(change.projectId)) removeProjectStorage(change.projectId);
  });

  // ---- upload flow: upload-url → PUT bytes → register ----
  app.post('/projects/:projectId/assets/upload-url', async (c) => {
    const loaded = loadProject(c, 'editor');
    if (!loaded.ok) return loaded.response;
    const body = await readJson(c);
    const assetPath = normalizeAssetPath(body.filename);
    if (!assetPath) return jsonError(c, 400, 'filename is required');
    const mimeType = typeof body.mimeType === 'string' && body.mimeType ? body.mimeType : guessMime(assetPath);
    const storageKey = newStorageKey(loaded.project.id, assetPath);
    const token = signUploadToken({ p: loaded.project.id, k: storageKey, m: mimeType, e: Date.now() + UPLOAD_TTL_MS });
    return c.json({ uploadUrl: `${PUBLIC_URL}/uploads/${token}`, storageKey });
  });

  app.put('/uploads/:token', async (c) => {
    const claims = verifyUploadToken(c.req.param('token'));
    if (!claims) return jsonError(c, 403, 'Invalid or expired upload URL');
    const declared = Number(c.req.header('content-length') || 0);
    if (declared > MAX_UPLOAD_BYTES) return jsonError(c, 413, 'File too large');
    const data = Buffer.from(await c.req.arrayBuffer());
    if (data.length > MAX_UPLOAD_BYTES) return jsonError(c, 413, 'File too large');
    const file = storageFile(claims.k);
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, data);
    return c.body(null, 200);
  });

  app.post('/projects/:projectId/assets', async (c) => {
    const loaded = loadProject(c, 'editor');
    if (!loaded.ok) return loaded.response;
    const body = await readJson(c);
    const assetPath = normalizeAssetPath(body.filename ?? body.path);
    if (!assetPath) return jsonError(c, 400, 'filename is required');
    const storageKey = body.storageKey;
    const prefix = `${loaded.project.id.replace(/[^A-Za-z0-9-]/g, '')}/`;
    if (!isStorageKey(storageKey) || !storageKey.startsWith(prefix)) return jsonError(c, 400, 'Invalid storageKey');
    let size: number;
    try {
      size = (await fs.promises.stat(storageFile(storageKey))).size;
    } catch {
      return jsonError(c, 400, 'Upload not found for storageKey');
    }
    const mimeType = typeof body.mimeType === 'string' && body.mimeType ? body.mimeType : guessMime(assetPath);
    const row = upsertAssetRow({ projectId: loaded.project.id, path: assetPath, storageKey, mimeType, sizeBytes: size, userId: loaded.user.id });
    return c.json(serializeAsset(row), 201);
  });

  app.get('/projects/:projectId/assets', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const rows = db.prepare('SELECT * FROM project_asset WHERE project_id = ? ORDER BY path').all(loaded.project.id) as AssetRow[];
    return c.json(rows.map(serializeAsset));
  });

  // ---- by-path: redirect (default) | inline=1 (bytes + CORS) | resolve=url ({publicUrl}) ----
  app.get('/projects/:projectId/assets/by-path', async (c) => {
    const loaded = loadReadableProject(c);
    if (!loaded.ok) return loaded.response;
    const assetPath = normalizeAssetPath(c.req.query('path'));
    if (!assetPath) return jsonError(c, 400, 'path is required');
    const row = lookupAsset(loaded.project.id, assetPath);
    if (!row) return jsonError(c, 404, 'Asset not found');
    const publicUrl = publicAssetUrl(row.storage_key);
    if (c.req.query('resolve') === 'url') {
      c.header('Cache-Control', 'private, max-age=60');
      return c.json({ publicUrl });
    }
    if (c.req.query('inline') === '1' || c.req.query('inline') === 'true') {
      if (Number(row.size_bytes) > MAX_INLINE_BYTES) return jsonError(c, 413, 'Asset too large to inline');
      return sendFile(c, storageFile(row.storage_key), row.mime_type || guessMime(row.path), 'private, max-age=60');
    }
    c.header('Cache-Control', 'private, max-age=60');
    return c.redirect(publicUrl, 302);
  });

  // Public, content-addressed object URLs (the "bucket"): unguessable keys, CORS, Range.
  app.get('/asset-files/:projectId/:file', async (c) => {
    const key = `${c.req.param('projectId')}/${c.req.param('file')}`;
    if (!isStorageKey(key)) return jsonError(c, 404, 'Not found');
    const row = db.prepare('SELECT mime_type, path FROM project_asset WHERE storage_key = ?').get(key) as { mime_type: string; path: string } | undefined;
    if (!row) return jsonError(c, 404, 'Not found');
    return sendFile(c, storageFile(key), row.mime_type || guessMime(row.path), 'public, max-age=31536000, immutable');
  });

  // ---- preview thumbnails ----
  app.post('/projects/:projectId/preview', async (c) => {
    const loaded = loadProject(c, 'editor');
    if (!loaded.ok) return loaded.response;
    const data = Buffer.from(await c.req.arrayBuffer());
    if (!data.length) return jsonError(c, 400, 'Empty preview body');
    if (data.length > MAX_PREVIEW_BYTES) return jsonError(c, 413, 'Preview too large');
    const raw = c.req.query('fingerprint') ?? '';
    const fingerprint = /^[A-Za-z0-9]{1,128}$/.test(raw) ? raw : crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);
    const projectId = loaded.project.id;
    const dir = path.join(PREVIEW_DIR, projectId.replace(/[^A-Za-z0-9-]/g, ''));
    await fs.promises.mkdir(dir, { recursive: true });
    const fileName = `${fingerprint}-${Date.now().toString(36)}.webp`;
    await fs.promises.writeFile(path.join(dir, fileName), data);
    for (const old of await fs.promises.readdir(dir)) {
      if (old !== fileName) await fs.promises.rm(path.join(dir, old), { force: true });
    }
    const previewUrl = `${PUBLIC_URL}/previews/${encodeURIComponent(projectId)}/${fileName}`;
    db.prepare(
      `UPDATE project SET preview_url = ?,
         settings = json_set(CASE WHEN json_valid(settings) THEN settings ELSE '{}' END, '$.previewFingerprint', ?)
       WHERE id = ?`,
    ).run(previewUrl, fingerprint, projectId);
    return c.json({ success: true, previewUrl, previewFingerprint: fingerprint });
  });

  app.get('/previews/:projectId/:file', async (c) => {
    const projectId = c.req.param('projectId').replace(/[^A-Za-z0-9-]/g, '');
    const file = c.req.param('file');
    if (!projectId || !previewFileRe.test(file)) return jsonError(c, 404, 'Not found');
    return sendFile(c, path.join(PREVIEW_DIR, projectId, file), 'image/webp', 'public, max-age=31536000, immutable');
  });
}
