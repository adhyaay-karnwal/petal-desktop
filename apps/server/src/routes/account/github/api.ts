/**
 * GitHub on a personal token instead of a GitHub App.
 *
 * Token source, in priority order: a token the user saved on /github/connect,
 * then GITHUB_TOKEN / GH_TOKEN, then `gh auth token`. GitHub Enterprise via
 * GITHUB_API_URL. The client's GitHub App model ("installations") is mapped
 * onto the token: the token's user is installation 1, each of their orgs gets
 * a stable synthetic id (github_installation table).
 */
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import { db, defineSchema, nowIso } from '../../../db.ts';
import { AUTH_SECRET } from '../../../env.ts';
import { findExecutable, run } from '../../../lib/bin.ts';

export const GITHUB_API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/+$/, '');
/** Host for `gh auth token --hostname` and web links. */
export const GITHUB_HOST = GITHUB_API === 'https://api.github.com' ? 'github.com' : new URL(GITHUB_API).host;
export const GITHUB_WEB = GITHUB_API === 'https://api.github.com' ? 'https://github.com' : new URL(GITHUB_API).origin;

defineSchema(`
CREATE TABLE IF NOT EXISTS github_account (
  user_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'auto',
  token TEXT,
  login TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS github_installation (
  user_id TEXT NOT NULL,
  installation_id INTEGER NOT NULL,
  account_login TEXT NOT NULL,
  account_type TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, installation_id)
);
`);

// ------------------------------------------------------------ token storage

/** 'auto' = env then gh; 'token' = saved PAT; 'gh' = gh CLI; 'disabled' = user disconnected. */
export type GitHubMode = 'auto' | 'token' | 'gh' | 'disabled';
type AccountRow = { user_id: string; mode: GitHubMode; token: string | null; login: string | null };

const key = crypto.createHash('sha256').update(`github-token:${AUTH_SECRET}`).digest();
export function sealSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return `v1:${Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64')}`;
}
export function openSecret(sealed: string | null): string | null {
  if (!sealed?.startsWith('v1:')) return null;
  try {
    const raw = Buffer.from(sealed.slice(3), 'base64');
    const d = crypto.createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

function accountRow(userId: string): AccountRow | undefined {
  return db.prepare('SELECT user_id, mode, token, login FROM github_account WHERE user_id = ?').get(userId) as AccountRow | undefined;
}

export function setGitHubMode(userId: string, mode: GitHubMode, token?: string | null, login?: string | null) {
  db.prepare(
    `INSERT INTO github_account (user_id, mode, token, login, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET mode = excluded.mode, token = excluded.token, login = excluded.login, updated_at = excluded.updated_at`,
  ).run(userId, mode, token ? sealSecret(token) : null, login ?? null, nowIso());
  statusCache.delete(userId);
}

// ------------------------------------------------------------ token sources

let ghCache: { at: number; token: string | null } | null = null;
/** `gh auth token` for GITHUB_HOST (cached 60 s); null when gh is missing or logged out. */
export async function ghCliToken(): Promise<string | null> {
  if (ghCache && Date.now() - ghCache.at < 60_000) return ghCache.token;
  let token: string | null = null;
  const bin = findExecutable('gh', process.env.GH_PATH);
  if (bin) {
    try {
      const env = { ...process.env };
      delete env.GH_TOKEN;
      delete env.GITHUB_TOKEN;
      const res = await run(bin, ['auth', 'token', '--hostname', GITHUB_HOST], { timeoutMs: 10_000, env });
      const out = res.stdout.trim();
      if (res.code === 0 && out && !/\s/.test(out)) token = out;
    } catch {
      /* gh not runnable */
    }
  }
  ghCache = { at: Date.now(), token };
  return token;
}

export const envToken = () => process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;

export type TokenInfo = { token: string; source: 'saved' | 'env' | 'gh' };

export async function resolveToken(userId: string): Promise<TokenInfo | null> {
  const row = accountRow(userId);
  const mode = row?.mode ?? 'auto';
  if (mode === 'disabled') return null;
  if (mode === 'token') {
    const saved = openSecret(row?.token ?? null);
    if (saved) return { token: saved, source: 'saved' };
  }
  if (mode === 'gh') {
    const gh = await ghCliToken();
    if (gh) return { token: gh, source: 'gh' };
  }
  const env = envToken();
  if (env) return { token: env, source: 'env' };
  const gh = await ghCliToken();
  return gh ? { token: gh, source: 'gh' } : null;
}

// ------------------------------------------------------------ REST client

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
    public upstreamStatus?: number,
    public endpoint?: string,
    public requestId?: string,
    public reason?: string,
  ) {
    super(message);
  }
}

/** Upstream status → our status. 401 from GitHub is not "you're signed out of Petal". */
function mapStatus(upstream: number): number {
  if (upstream === 401) return 400;
  if (upstream === 403 || upstream === 404 || upstream === 409 || upstream === 422 || upstream === 429) return upstream;
  return 502;
}

export type GhOptions = { body?: unknown; accept?: string; allow404?: boolean };

export async function ghFetch(token: string, method: string, endpoint: string, opts: GhOptions = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: opts.accept ?? 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Petal',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err) {
    throw new GitHubError(`Could not reach GitHub: ${(err as Error).message}`, 502, undefined, `${method} ${endpoint}`);
  }
  if (!res.ok && !(opts.allow404 && res.status === 404)) {
    const text = await res.text().catch(() => '');
    let message = '';
    try {
      const data = JSON.parse(text) as { message?: string; errors?: { message?: string; code?: string }[] };
      message = [data.message, ...(data.errors ?? []).map((e) => e.message || e.code)].filter(Boolean).join(': ');
    } catch {
      message = text.slice(0, 200);
    }
    if (res.status === 401) message = 'GitHub rejected the token (expired or revoked). Reconnect GitHub.';
    else if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') message = 'GitHub API rate limit reached. Try again later.';
    else if (res.status === 404) message = message === 'Not Found' || !message ? 'Not found on GitHub (or the token has no access to it)' : message;
    throw new GitHubError(message || `GitHub request failed (${res.status})`, mapStatus(res.status), res.status, `${method} ${endpoint.replace(/\?.*$/, '')}`, res.headers.get('x-github-request-id') ?? undefined);
  }
  return res;
}

export async function gh<T>(token: string, method: string, endpoint: string, opts: GhOptions = {}): Promise<T> {
  const res = await ghFetch(token, method, endpoint, opts);
  if (res.status === 404 && opts.allow404) return null as T;
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

/** Follows `Link: rel="next"` up to `max` items. */
export async function ghPaginate<T>(token: string, endpoint: string, max = 1000): Promise<T[]> {
  const out: T[] = [];
  let next: string | null = endpoint;
  while (next && out.length < max) {
    const res = await ghFetch(token, 'GET', next);
    const page = (await res.json()) as T[];
    out.push(...page);
    const link = res.headers.get('link') ?? '';
    next = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null;
  }
  return out.slice(0, max);
}

export const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');
export function splitRepo(full: unknown): string | null {
  if (typeof full !== 'string') return null;
  const m = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(full.trim());
  return m ? `${m[1]}/${m[2]}` : null;
}

// ------------------------------------------------------------ identity + installations

export type GhUser = { login: string; id: number; name: string | null; email: string | null; type: string };
export type Installation = { installationId: number; accountLogin: string; accountType: 'User' | 'Organization' };

type StatusEntry = { at: number; token: string; user: GhUser; installations: Installation[] };
const statusCache = new Map<string, StatusEntry>();

/**
 * The token user → installation 1; orgs keep their previously assigned ids,
 * new ones get max+1. Cached 30 s per user+token.
 */
export async function loadInstallations(userId: string, token: string): Promise<{ user: GhUser; installations: Installation[] }> {
  const cached = statusCache.get(userId);
  if (cached && cached.token === token && Date.now() - cached.at < 30_000) return cached;
  const user = await gh<GhUser>(token, 'GET', '/user');
  const orgs = await ghPaginate<{ login: string }>(token, '/user/orgs?per_page=100', 300).catch(() => []);
  const rows = db.prepare('SELECT installation_id, account_login, account_type FROM github_installation WHERE user_id = ?').all(userId) as {
    installation_id: number;
    account_login: string;
    account_type: string;
  }[];
  const now = nowIso();
  const installations: Installation[] = [];
  db.transaction(() => {
    const self = rows.find((r) => r.installation_id === 1);
    if (!self || self.account_login.toLowerCase() !== user.login.toLowerCase()) {
      // A different GitHub user: the old mapping is meaningless.
      db.prepare('DELETE FROM github_installation WHERE user_id = ?').run(userId);
      rows.length = 0;
    }
    const upsert = db.prepare(
      `INSERT INTO github_installation (user_id, installation_id, account_login, account_type, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, installation_id) DO UPDATE SET account_login = excluded.account_login, account_type = excluded.account_type, updated_at = excluded.updated_at`,
    );
    upsert.run(userId, 1, user.login, 'User', now);
    installations.push({ installationId: 1, accountLogin: user.login, accountType: 'User' });
    let maxId = rows.reduce((m, r) => Math.max(m, r.installation_id), 1);
    for (const org of orgs) {
      const existing = rows.find((r) => r.installation_id !== 1 && r.account_login.toLowerCase() === org.login.toLowerCase());
      const id = existing?.installation_id ?? ++maxId;
      upsert.run(userId, id, org.login, 'Organization', now);
      installations.push({ installationId: id, accountLogin: org.login, accountType: 'Organization' });
    }
  })();
  const entry = { at: Date.now(), token, user, installations };
  statusCache.set(userId, entry);
  return entry;
}

export function forgetInstallations(userId: string) {
  db.prepare('DELETE FROM github_installation WHERE user_id = ?').run(userId);
  statusCache.delete(userId);
}

export function getInstallation(userId: string, installationId: unknown): Installation | null {
  const id = Number(installationId);
  if (!Number.isInteger(id)) return null;
  const row = db.prepare('SELECT installation_id, account_login, account_type FROM github_installation WHERE user_id = ? AND installation_id = ?').get(userId, id) as
    | { installation_id: number; account_login: string; account_type: string }
    | undefined;
  return row ? { installationId: row.installation_id, accountLogin: row.account_login, accountType: row.account_type === 'Organization' ? 'Organization' : 'User' } : null;
}

// ------------------------------------------------------------ repo contents

export type TreeEntry = { path: string; mode: string; type: 'blob' | 'tree' | 'commit'; sha: string; size?: number };

export async function branchHead(token: string, repo: string, branch: string): Promise<string | null> {
  const ref = await gh<{ object: { sha: string } } | null>(token, 'GET', `/repos/${repo}/git/ref/heads/${encodePath(branch)}`, { allow404: true }).catch((err) => {
    // 409 = the repository is empty.
    if (err instanceof GitHubError && err.upstreamStatus === 409) return null;
    throw err;
  });
  return ref?.object?.sha ?? null;
}

/** Recursive tree of a commit (blobs only). */
export async function commitTree(token: string, repo: string, commitSha: string): Promise<{ treeSha: string; blobs: TreeEntry[]; truncated: boolean }> {
  const commit = await gh<{ tree: { sha: string } }>(token, 'GET', `/repos/${repo}/git/commits/${commitSha}`);
  const tree = await gh<{ tree: TreeEntry[]; truncated: boolean }>(token, 'GET', `/repos/${repo}/git/trees/${commit.tree.sha}?recursive=1`);
  return { treeSha: commit.tree.sha, blobs: tree.tree.filter((e) => e.type === 'blob'), truncated: !!tree.truncated };
}

export const gitBlobSha = (data: Buffer) => crypto.createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}
export { mapLimit };

/**
 * Downloads the given blobs: per-blob API calls for small sets, otherwise one
 * streamed tarball of the commit (keeping only the wanted paths in memory).
 */
export async function downloadBlobs(token: string, repo: string, commitSha: string, entries: TreeEntry[]): Promise<Map<string, Buffer>> {
  const out = new Map<string, Buffer>();
  if (!entries.length) return out;
  if (entries.length <= 60) {
    await mapLimit(entries, 8, async (e) => {
      const blob = await gh<{ content: string; encoding: string }>(token, 'GET', `/repos/${repo}/git/blobs/${e.sha}`);
      out.set(e.path, Buffer.from(blob.content, blob.encoding === 'base64' ? 'base64' : 'utf8'));
    });
    return out;
  }
  const wanted = new Set(entries.map((e) => e.path));
  const res = await ghFetch(token, 'GET', `/repos/${repo}/tarball/${commitSha}`);
  if (!res.body) throw new GitHubError('GitHub returned an empty archive', 502);
  const gunzip = Readable.fromWeb(res.body as import('node:stream/web').ReadableStream).pipe(zlib.createGunzip());
  await extractTar(gunzip, (path) => wanted.has(path), (path, data) => out.set(path, data));
  // Anything the tarball missed (e.g. LFS pointers, odd names) via the blob API.
  const missing = entries.filter((e) => !out.has(e.path));
  if (missing.length && missing.length <= 200) {
    await mapLimit(missing, 8, async (e) => {
      const blob = await gh<{ content: string; encoding: string }>(token, 'GET', `/repos/${repo}/git/blobs/${e.sha}`);
      out.set(e.path, Buffer.from(blob.content, blob.encoding === 'base64' ? 'base64' : 'utf8'));
    });
  }
  return out;
}

/**
 * Minimal streaming tar reader (ustar + pax `path` + GNU long names). The
 * first path component (`owner-repo-sha/`) of GitHub archives is stripped.
 */
async function extractTar(stream: AsyncIterable<Buffer>, want: (path: string) => boolean, onFile: (path: string, data: Buffer) => void) {
  let buf: Buffer = Buffer.alloc(0);
  let entry: { name: string; type: string; size: number; remaining: number; keep: boolean; chunks: Buffer[]; got: number } | null = null;
  let nextName: string | null = null;
  const cstr = (b: Buffer) => {
    const z = b.indexOf(0);
    return b.subarray(0, z < 0 ? b.length : z).toString('utf8');
  };
  const finish = () => {
    const e = entry!;
    entry = null;
    const data = e.keep ? Buffer.concat(e.chunks) : Buffer.alloc(0);
    if (e.type === 'x') {
      const m = /(?:^|\n)\d+ path=([^\n]*)\n/.exec(data.toString('utf8'));
      if (m) nextName = m[1];
      return;
    }
    if (e.type === 'L') {
      nextName = cstr(data);
      return;
    }
    if (e.keep) onFile(e.name, data);
  };
  for await (const chunk of stream) {
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    for (;;) {
      if (!entry) {
        if (buf.length < 512) break;
        const h = buf.subarray(0, 512);
        buf = buf.subarray(512);
        if (h.every((b) => b === 0)) continue;
        let name = cstr(h.subarray(0, 100));
        const size = parseInt(cstr(h.subarray(124, 136)).trim() || '0', 8) || 0;
        const type = String.fromCharCode(h[156] || 48);
        if (h.subarray(257, 262).toString() === 'ustar') {
          const prefix = cstr(h.subarray(345, 500));
          if (prefix) name = `${prefix}/${name}`;
        }
        const meta = type === 'x' || type === 'L';
        if (!meta && type !== 'g' && nextName) {
          name = nextName;
          nextName = null;
        }
        const rel = name.split('/').slice(1).join('/');
        const isFile = type === '0' || type === '\0' || type === '7';
        const keep = meta || (isFile && !!rel && want(rel));
        entry = { name: rel, type, size, remaining: size + ((512 - (size % 512)) % 512), keep, chunks: [], got: 0 };
        if (entry.remaining === 0) finish();
        continue;
      }
      if (!buf.length) break;
      const take = Math.min(entry.remaining, buf.length);
      if (entry.keep && entry.got < entry.size) {
        const n = Math.min(take, entry.size - entry.got);
        entry.chunks.push(Buffer.from(buf.subarray(0, n)));
        entry.got += n;
      }
      buf = buf.subarray(take);
      entry.remaining -= take;
      if (entry.remaining === 0) finish();
      else break;
    }
  }
}

export function looksBinary(data: Buffer): boolean {
  const n = Math.min(data.length, 8000);
  for (let i = 0; i < n; i++) if (data[i] === 0) return true;
  return false;
}
