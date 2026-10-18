/**
 * Project ⇄ repository sync over the Git Data API.
 *
 * Mapping (matches the desktop's local import and GitPanel):
 * - project_file `<p>`        ⇄ `<root>/<p>`
 * - project asset `<p>`        ⇄ `<root>/<p>` (binary)
 * - page (canvas)             ⇄ `<root>/.petal/canvases/<dir>/canvas.json`
 *   (`{ name, ...canvas }`; `<dir>` is remembered per page, new pages use their id)
 * `<root>` is '' unless the repo was imported from a monorepo sub-package.
 *
 * Change tracking is file-granular: `synced` holds, per tracked path, the
 * remote blob sha (`r`) and the project's own blob sha (`l`) as of the last
 * import/pull/commit (they differ when e.g. canvas JSON is re-serialized), so
 * local changes are local-vs-`l` and remote changes are remote-tree-vs-`r`. Repo files
 * outside the tracked scope (README, CI, other packages) are never touched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { emitProjectChange } from '../../../bus.ts';
import { db, defineSchema, nowIso, parseJson } from '../../../db.ts';
import { touchProject } from '../../../lib/http.ts';
import { guessMime, storageFile, storeAsset } from '../../assets/store.ts';
import {
  createFile,
  createPage,
  deleteFile,
  getFileByPath,
  listFiles,
  listPages,
  snapshotCanvasVersion,
  updateFileContent,
  type PageRow,
} from '../../content/store.ts';
import { GitHubError, branchHead, commitTree, downloadBlobs, encodePath, gh, gitBlobSha, looksBinary, mapLimit, type TreeEntry } from './api.ts';

defineSchema(`
CREATE TABLE IF NOT EXISTS project_git (
  project_id TEXT PRIMARY KEY REFERENCES project(id) ON DELETE CASCADE,
  repo TEXT NOT NULL,
  branch TEXT NOT NULL,
  installation_id INTEGER,
  account_login TEXT,
  root_path TEXT NOT NULL DEFAULT '',
  last_sha TEXT,
  synced TEXT NOT NULL DEFAULT '{}',
  page_dirs TEXT NOT NULL DEFAULT '{}',
  connected_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);

export type Synced = Record<string, { r: string; l: string }>;

export type GitConn = {
  project_id: string;
  repo: string;
  branch: string;
  installation_id: number | null;
  account_login: string | null;
  root_path: string;
  last_sha: string | null;
  synced: string;
  page_dirs: string;
};

export function getConn(projectId: string): GitConn | undefined {
  return db.prepare('SELECT * FROM project_git WHERE project_id = ?').get(projectId) as GitConn | undefined;
}

export function saveConn(c: {
  projectId: string;
  repo: string;
  branch: string;
  installationId: number | null;
  accountLogin: string | null;
  rootPath: string;
  lastSha: string | null;
  synced: Synced;
  pageDirs: Record<string, string>;
  userId: string;
}) {
  const now = nowIso();
  db.prepare(
    `INSERT INTO project_git (project_id, repo, branch, installation_id, account_login, root_path, last_sha, synced, page_dirs, connected_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (project_id) DO UPDATE SET repo = excluded.repo, branch = excluded.branch, installation_id = excluded.installation_id,
       account_login = excluded.account_login, root_path = excluded.root_path, last_sha = excluded.last_sha, synced = excluded.synced,
       page_dirs = excluded.page_dirs, updated_at = excluded.updated_at`,
  ).run(c.projectId, c.repo, c.branch, c.installationId, c.accountLogin, c.rootPath, c.lastSha, JSON.stringify(c.synced), JSON.stringify(c.pageDirs), c.userId, now, now);
}

function updateSyncState(projectId: string, lastSha: string | null, synced: Synced, pageDirs: Record<string, string>) {
  db.prepare('UPDATE project_git SET last_sha = ?, synced = ?, page_dirs = ?, updated_at = ? WHERE project_id = ?').run(
    lastSha, JSON.stringify(synced), JSON.stringify(pageDirs), nowIso(), projectId,
  );
}

// ------------------------------------------------------------ scope (mirrors the desktop's pick_and_scan_directory)

const CODE_EXTS = new Set(['.tsx', '.ts', '.jsx', '.js', '.astro', '.css', '.json', '.mdx', '.md']);
const ASSET_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.otf', '.ico']);
const SCAN_DIRS = new Set(['src', 'app', 'components', 'lib', 'utils', 'hooks', 'pages', 'styles', 'style', 'css', 'theme', '.petal', 'public', 'assets']);
const ROOT_FILE_RE = /^(package\.json|components\.json|jsconfig\.json|tsconfig(\.[\w-]+)?\.json|tailwind\.config\.[cm]?[jt]s|postcss\.config\.[cm]?[jt]s|[^/]+\.css)$/;
const LUNAGRAPH_SKIP_DIRS = new Set(['versions', 'drafts', 'snapshots']);
const LUNAGRAPH_SKIP_FILES = new Set(['chat.json', 'ComponentIndex.json', 'safelist.html', 'INSTRUCTIONS.md', 'settings.json']);
const CANVAS_RE = /^\.petal\/canvases\/([^/]+)\/canvas\.json$/;
const MAX_CODE_BYTES = 1024 * 1024;
const MAX_ASSET_BYTES = 10 * 1024 * 1024;

export type Kind = 'file' | 'asset' | 'canvas';

/** What a root-relative repo path becomes in the project, or null when out of scope. */
export function classify(rel: string, size = 0): Kind | null {
  const parts = rel.split('/');
  if (parts.some((p) => p === 'node_modules' || p === '.git' || p === '')) return null;
  if (CANVAS_RE.test(rel)) return 'canvas';
  const ext = path.posix.extname(rel).toLowerCase();
  if (parts.length === 1) return ROOT_FILE_RE.test(rel) && size <= MAX_CODE_BYTES ? 'file' : null;
  if (!SCAN_DIRS.has(parts[0])) return null;
  if (parts[0] === '.petal' && (parts.slice(1, -1).some((p) => LUNAGRAPH_SKIP_DIRS.has(p)) || LUNAGRAPH_SKIP_FILES.has(parts[parts.length - 1]))) return null;
  if (ASSET_EXTS.has(ext)) return size <= MAX_ASSET_BYTES ? 'asset' : null;
  if (CODE_EXTS.has(ext)) return size <= MAX_CODE_BYTES ? 'file' : null;
  return null;
}

const MONOREPO_CONTAINERS = ['frontend', 'web', 'client', 'mobile', 'desktop'];
const MONOREPO_NESTED = ['apps', 'packages', 'libs'];
const APP_MARKERS = ['src', 'app', 'components'];

/** The desktop's findRealAppRoot on a repo listing: '' or e.g. 'packages/ui'. */
export function findAppRoot(blobPaths: string[]): string {
  const dirs = new Set<string>();
  for (const p of blobPaths) {
    const parts = p.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  const files = new Set(blobPaths);
  const join = (a: string, b: string) => (a ? `${a}/${b}` : b);
  const looksLikeAppRoot = (dir: string) => APP_MARKERS.some((m) => dirs.has(join(dir, m)));
  if (files.has('package.json') && looksLikeAppRoot('')) return '';
  for (const c of MONOREPO_CONTAINERS) if (dirs.has(c) && looksLikeAppRoot(c)) return c;
  for (const n of MONOREPO_NESTED) {
    const children = [...dirs].filter((d) => d.startsWith(`${n}/`) && !d.slice(n.length + 1).includes('/')).sort();
    for (const child of children) if (looksLikeAppRoot(child)) return child;
  }
  return '';
}

const withRoot = (root: string, p: string) => (root ? `${root}/${p}` : p);
const stripRoot = (root: string, p: string) => (!root ? p : p.startsWith(`${root}/`) ? p.slice(root.length + 1) : null);

// ------------------------------------------------------------ local snapshot

type LocalEntry = { kind: Kind; sha: string; data: () => Buffer; displayName?: string; pageId?: string };

function canvasContent(page: PageRow): string {
  return `${JSON.stringify({ name: page.name, ...parseJson<Record<string, unknown>>(page.canvas, {}) }, null, 2)}\n`;
}

const assetShaCache = new Map<string, string>();
type AssetRowLite = { path: string; storage_key: string };

/** Every tracked path of the project as `<root>/…` → blob sha (+ lazy bytes). */
function localSnapshot(projectId: string, root: string, pageDirs: Record<string, string>): Map<string, LocalEntry> {
  const out = new Map<string, LocalEntry>();
  for (const f of listFiles(projectId)) {
    const data = Buffer.from(f.content, 'utf8');
    out.set(withRoot(root, f.path), { kind: 'file', sha: gitBlobSha(data), data: () => data });
  }
  for (const page of listPages(projectId)) {
    const dir = pageDirs[page.id] ?? page.id;
    const data = Buffer.from(canvasContent(page), 'utf8');
    out.set(withRoot(root, `.petal/canvases/${dir}/canvas.json`), { kind: 'canvas', sha: gitBlobSha(data), data: () => data, displayName: page.name, pageId: page.id });
  }
  const assets = db.prepare('SELECT path, storage_key FROM project_asset WHERE project_id = ?').all(projectId) as AssetRowLite[];
  for (const a of assets) {
    const file = storageFile(a.storage_key);
    let sha = assetShaCache.get(a.storage_key);
    if (!sha) {
      try {
        sha = gitBlobSha(fs.readFileSync(file));
        assetShaCache.set(a.storage_key, sha);
      } catch {
        continue;
      }
    }
    out.set(withRoot(root, a.path), { kind: 'asset', sha, data: () => fs.readFileSync(file) });
  }
  return out;
}

export type Change = { path: string; status: 'added' | 'modified' | 'deleted'; displayName?: string };

function localChanges(local: Map<string, LocalEntry>, synced: Synced): Change[] {
  const changes: Change[] = [];
  for (const [p, e] of local) {
    if (!(p in synced)) changes.push({ path: p, status: 'added', ...(e.displayName ? { displayName: e.displayName } : {}) });
    else if (synced[p].l !== e.sha) changes.push({ path: p, status: 'modified', ...(e.displayName ? { displayName: e.displayName } : {}) });
  }
  for (const p of Object.keys(synced)) if (!local.has(p)) changes.push({ path: p, status: 'deleted' });
  return changes.sort((a, b) => a.path.localeCompare(b.path));
}

// ------------------------------------------------------------ status

export async function gitStatus(token: string | null, conn: GitConn) {
  const synced = parseJson<Synced>(conn.synced, {});
  const local = localSnapshot(conn.project_id, conn.root_path, parseJson<Record<string, string>>(conn.page_dirs, {}));
  const changes = localChanges(local, synced);
  let behind: boolean | number = false;
  let remoteError: string | null = null;
  if (token) {
    try {
      const head = await branchHead(token, conn.repo, conn.branch);
      if (head && conn.last_sha && head !== conn.last_sha) {
        const cmp = await gh<{ ahead_by: number; status: string } | null>(token, 'GET', `/repos/${conn.repo}/compare/${conn.last_sha}...${head}`, { allow404: true }).catch(() => null);
        behind = cmp && cmp.ahead_by > 0 ? cmp.ahead_by : true;
      } else if (head && !conn.last_sha) behind = true;
    } catch (err) {
      remoteError = (err as Error).message;
    }
  } else remoteError = 'GitHub is not connected';
  return {
    connected: true,
    repo: conn.repo,
    branch: conn.branch,
    installationId: conn.installation_id,
    accountLogin: conn.account_login,
    rootPath: conn.root_path || null,
    lastCommitSha: conn.last_sha,
    behind,
    clean: changes.length === 0,
    changes,
    ...(remoteError ? { remoteError } : {}),
  };
}

// ------------------------------------------------------------ apply remote content to the project

type Applied = { written: string[]; deletedFiles: string[]; pages: number; assets: number };

function pageByDir(projectId: string, pageDirs: Record<string, string>, dir: string): PageRow | undefined {
  return listPages(projectId).find((p) => (pageDirs[p.id] ?? p.id) === dir);
}

/** Writes one remote file (root-relative `rel`) into the project. */
async function applyRemote(projectId: string, rel: string, kind: Kind, data: Buffer, pageDirs: Record<string, string>, applied: Applied) {
  if (kind === 'file') {
    if (looksBinary(data)) return;
    const content = data.toString('utf8');
    const existing = getFileByPath(projectId, rel);
    if (existing) updateFileContent(existing, content, { notify: false });
    else createFile(projectId, rel, content, { notify: false });
    applied.written.push(rel);
  } else if (kind === 'asset') {
    await storeAsset(projectId, { path: rel, contentType: guessMime(rel), data });
    applied.assets++;
  } else {
    const dir = CANVAS_RE.exec(rel)![1];
    const parsed = parseJson<Record<string, unknown>>(data.toString('utf8'), {});
    const { name, ...canvas } = parsed;
    const pageName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 200) : dir;
    const page = pageByDir(projectId, pageDirs, dir);
    if (page) {
      snapshotCanvasVersion(page);
      db.prepare('UPDATE project_page SET name = ?, canvas = ?, updated_at = ? WHERE id = ?').run(pageName, JSON.stringify(canvas), nowIso(), page.id);
    } else {
      const created = createPage(projectId, { name: pageName, canvas: Object.keys(canvas).length ? canvas : undefined });
      pageDirs[created.id] = dir;
    }
    applied.pages++;
  }
}

function notify(projectId: string, applied: Applied) {
  touchProject(projectId);
  if (applied.written.length || applied.deletedFiles.length)
    emitProjectChange({ type: 'files', projectId, paths: applied.written, ...(applied.deletedFiles.length ? { deleted: applied.deletedFiles } : {}) });
}

// ------------------------------------------------------------ import

/** Imports a repo (or one of its packages) into an empty project and connects it. */
export async function importRepo(opts: {
  token: string;
  projectId: string;
  repo: string;
  branch: string;
  rootPath?: string | null;
  installationId: number | null;
  accountLogin: string | null;
  userId: string;
}) {
  const { token, projectId, repo, branch } = opts;
  const head = await branchHead(token, repo, branch);
  if (!head) throw new GitHubError(`Branch "${branch}" not found in ${repo} (or the repository is empty)`, 404);
  const { blobs, truncated } = await commitTree(token, repo, head);
  const root = opts.rootPath != null ? opts.rootPath.replace(/^\/+|\/+$/g, '') : findAppRoot(blobs.map((b) => b.path));
  const picked: { entry: TreeEntry; rel: string; kind: Kind }[] = [];
  for (const entry of blobs) {
    if (entry.mode === '120000' || entry.mode === '160000') continue; // symlinks, submodules
    const rel = stripRoot(root, entry.path);
    if (rel == null) continue;
    const kind = classify(rel, entry.size ?? 0);
    if (kind) picked.push({ entry, rel, kind });
  }
  if (picked.length > 8000) throw new GitHubError(`This repository has ${picked.length} importable files; the limit is 8000. Import a smaller package.`, 413);
  const contents = await downloadBlobs(token, repo, head, picked.map((p) => p.entry));
  const pageDirs: Record<string, string> = {};
  const synced: Synced = {};
  const applied: Applied = { written: [], deletedFiles: [], pages: 0, assets: 0 };
  const skipped: string[] = [];
  // Canvases last so pages see their final names; files in one transaction.
  const order = (k: Kind) => (k === 'file' ? 0 : k === 'asset' ? 1 : 2);
  picked.sort((a, b) => order(a.kind) - order(b.kind));
  db.transaction(() => {
    for (const p of picked) {
      if (p.kind !== 'file') continue;
      const data = contents.get(p.entry.path);
      if (!data || looksBinary(data)) {
        skipped.push(p.rel);
        continue;
      }
      createFile(projectId, p.rel, data.toString('utf8'), { notify: false });
      applied.written.push(p.rel);
    }
  })();
  for (const p of picked) {
    if (p.kind === 'file') continue;
    const data = contents.get(p.entry.path);
    if (!data) {
      skipped.push(p.rel);
      continue;
    }
    try {
      await applyRemote(projectId, p.rel, p.kind, data, pageDirs, applied);
    } catch (err) {
      console.warn('[github] import skipped', p.rel, (err as Error).message);
      skipped.push(p.rel);
    }
  }
  // Baseline = what the project now holds, so unchanged imports aren't "changes".
  const local = localSnapshot(projectId, root, pageDirs);
  const remoteSha = new Map(picked.map((p) => [p.entry.path, p.entry.sha]));
  for (const [p, e] of local) if (remoteSha.has(p)) synced[p] = { r: remoteSha.get(p)!, l: e.sha };
  saveConn({ projectId, repo, branch, installationId: opts.installationId, accountLogin: opts.accountLogin, rootPath: root, lastSha: head, synced, pageDirs, userId: opts.userId });
  notify(projectId, applied);
  return { commitSha: head, rootPath: root, files: applied.written.length, assets: applied.assets, pages: applied.pages, skipped, truncated };
}

// ------------------------------------------------------------ connect existing project

export async function connectRepo(opts: { token: string; projectId: string; repo: string; branch: string; installationId: number | null; accountLogin: string | null; userId: string }) {
  const { token, projectId, repo, branch } = opts;
  const repoInfo = await gh<{ default_branch: string; permissions?: { push?: boolean } }>(token, 'GET', `/repos/${repo}`);
  if (repoInfo.permissions && repoInfo.permissions.push === false) throw new GitHubError(`The GitHub token can read ${repo} but cannot push to it`, 403);
  const head = await branchHead(token, repo, branch || repoInfo.default_branch);
  const synced: Synced = {};
  if (head) {
    // Files already identical on the branch start out synced.
    const { blobs } = await commitTree(token, repo, head);
    const remote = new Map(blobs.map((b) => [b.path, b.sha]));
    for (const [p, e] of localSnapshot(projectId, '', {})) if (remote.get(p) === e.sha) synced[p] = { r: e.sha, l: e.sha };
  }
  saveConn({ projectId, repo, branch: branch || repoInfo.default_branch, installationId: opts.installationId, accountLogin: opts.accountLogin, rootPath: '', lastSha: head, synced, pageDirs: {}, userId: opts.userId });
}

// ------------------------------------------------------------ commit (push)

export async function commitProject(token: string, conn: GitConn, message: string) {
  const synced = parseJson<Synced>(conn.synced, {});
  const pageDirs = parseJson<Record<string, string>>(conn.page_dirs, {});
  const local = localSnapshot(conn.project_id, conn.root_path, pageDirs);
  const changes = localChanges(local, synced);
  if (!changes.length) return { ok: true, committed: false, message: 'Nothing to commit' };

  let head = await branchHead(token, conn.repo, conn.branch);
  if (!head) {
    // Empty repository: the Git Data API needs one commit first.
    const created = await gh<{ commit: { sha: string } }>(token, 'PUT', `/repos/${conn.repo}/contents/README.md`, {
      body: { message: 'Initial commit', content: Buffer.from(`# ${conn.repo.split('/')[1]}\n`).toString('base64'), branch: conn.branch },
    });
    head = created.commit.sha;
  } else if (conn.last_sha && head !== conn.last_sha) {
    throw new GitHubError(`${conn.branch} has new commits on GitHub. Pull first, then commit.`, 409, undefined, undefined, undefined, 'behind');
  }
  const { treeSha, blobs, truncated } = await commitTree(token, conn.repo, head);
  const remote = new Set(blobs.map((b) => b.path));

  const upserts = changes.filter((c) => c.status !== 'deleted');
  const created = await mapLimit(upserts, 6, async (c) => {
    const entry = local.get(c.path)!;
    const blob = await gh<{ sha: string }>(token, 'POST', `/repos/${conn.repo}/git/blobs`, { body: { content: entry.data().toString('base64'), encoding: 'base64' } });
    if (blob.sha !== entry.sha) console.warn('[github] blob sha mismatch for', c.path);
    return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha, local: entry.sha };
  });
  const deletions = changes.filter((c) => c.status === 'deleted' && (truncated || remote.has(c.path))).map((c) => ({ path: c.path, mode: '100644', type: 'blob', sha: null }));
  const tree = await gh<{ sha: string }>(token, 'POST', `/repos/${conn.repo}/git/trees`, { body: { base_tree: treeSha, tree: [...created.map(({ local: _l, ...t }) => t), ...deletions] } });
  const commit = await gh<{ sha: string; html_url: string }>(token, 'POST', `/repos/${conn.repo}/git/commits`, { body: { message, tree: tree.sha, parents: [head] } });
  await gh(token, 'PATCH', `/repos/${conn.repo}/git/refs/heads/${encodePath(conn.branch)}`, { body: { sha: commit.sha, force: false } });

  for (const c of changes) if (c.status === 'deleted') delete synced[c.path];
  for (const t of created) synced[t.path] = { r: t.sha, l: t.local };
  for (const e of local.values()) if (e.kind === 'canvas' && e.pageId && !pageDirs[e.pageId]) pageDirs[e.pageId] = e.pageId;
  updateSyncState(conn.project_id, commit.sha, synced, pageDirs);
  return { ok: true, committed: true, commitSha: commit.sha, url: commit.html_url, filesChanged: changes.length };
}

// ------------------------------------------------------------ pull

export async function pullProject(token: string, conn: GitConn) {
  const head = await branchHead(token, conn.repo, conn.branch);
  if (!head) throw new GitHubError(`Branch "${conn.branch}" no longer exists on GitHub`, 404);
  if (head === conn.last_sha) return { ok: true, upToDate: true, updated: 0, conflicts: [] as string[], keptLocal: [] as string[] };
  const synced = parseJson<Synced>(conn.synced, {});
  const pageDirs = parseJson<Record<string, string>>(conn.page_dirs, {});
  const root = conn.root_path;
  const local = localSnapshot(conn.project_id, root, pageDirs);
  const { blobs } = await commitTree(token, conn.repo, head);

  const incoming: { entry: TreeEntry; rel: string; kind: Kind }[] = [];
  const remotePaths = new Set<string>();
  for (const entry of blobs) {
    const rel = stripRoot(root, entry.path);
    if (rel == null) continue;
    const base = synced[entry.path];
    const kind = base ? classify(rel, 0) ?? 'file' : classify(rel, entry.size ?? 0);
    if (!kind) continue;
    remotePaths.add(entry.path);
    if (base?.r === entry.sha) continue; // unchanged on GitHub
    const mine = local.get(entry.path);
    if (mine?.sha === entry.sha) synced[entry.path] = { r: entry.sha, l: mine.sha }; // both sides converged
    else incoming.push({ entry, rel, kind });
  }
  const conflicts: string[] = [];
  const keptLocal: string[] = [];
  const contents = await downloadBlobs(token, conn.repo, head, incoming.map((i) => i.entry));
  const applied: Applied = { written: [], deletedFiles: [], pages: 0, assets: 0 };
  const pulled: TreeEntry[] = [];
  for (const i of incoming) {
    const data = contents.get(i.entry.path);
    if (!data) continue;
    const mine = local.get(i.entry.path);
    const base = synced[i.entry.path];
    // Both sides changed: GitHub wins; the local version stays in version history.
    if (mine && (!base || mine.sha !== base.l)) conflicts.push(i.entry.path);
    try {
      await applyRemote(conn.project_id, i.rel, i.kind, data, pageDirs, applied);
      pulled.push(i.entry);
    } catch (err) {
      console.warn('[github] pull skipped', i.entry.path, (err as Error).message);
    }
  }
  // Deleted on GitHub: delete locally unless changed locally since the last sync.
  for (const p of Object.keys(synced)) {
    if (remotePaths.has(p)) continue;
    const base = synced[p];
    delete synced[p];
    const mine = local.get(p);
    if (!mine) continue;
    if (mine.sha !== base.l) {
      keptLocal.push(p);
      continue;
    }
    const rel = stripRoot(root, p)!;
    if (mine.kind === 'file') {
      const f = getFileByPath(conn.project_id, rel);
      if (f) {
        deleteFile(f);
        applied.deletedFiles.push(rel);
      }
    } else if (mine.kind === 'asset') {
      db.prepare('DELETE FROM project_asset WHERE project_id = ? AND path = ?').run(conn.project_id, rel);
    } else if (mine.pageId && listPages(conn.project_id).length > 1) {
      db.prepare('DELETE FROM project_page WHERE id = ?').run(mine.pageId);
      delete pageDirs[mine.pageId];
    }
  }
  const after = localSnapshot(conn.project_id, root, pageDirs);
  for (const e of pulled) synced[e.path] = { r: e.sha, l: after.get(e.path)?.sha ?? e.sha };
  updateSyncState(conn.project_id, head, synced, pageDirs);
  notify(conn.project_id, applied);
  return { ok: true, upToDate: false, commitSha: head, updated: applied.written.length + applied.assets + applied.pages, deleted: applied.deletedFiles.length, conflicts, keptLocal };
}

// ------------------------------------------------------------ fetch-folder (design-system import, staged to disk by the desktop)

const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.json', '.jsonc', '.css', '.scss', '.sass', '.less', '.pcss', '.md', '.mdx',
  '.html', '.vue', '.svelte', '.astro', '.yml', '.yaml', '.toml', '.txt', '.graphql', '.gql', '.env.example',
]);
const TEXT_NAMES = new Set(['package.json', 'tsconfig.json', '.npmrc', '.nvmrc', '.prettierrc', '.eslintrc', '.babelrc', '.browserslistrc', 'README', 'LICENSE']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.turbo', '.cache', 'coverage', 'storybook-static', '.vercel', '.output', '.nuxt', '.svelte-kit']);
const LOCKFILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock', 'npm-shrinkwrap.json']);
const FOLDER_MAX_FILES = 5000;
const FOLDER_MAX_BYTES = 80 * 1024 * 1024;

export async function fetchFolder(token: string, repo: string, branch: string, folder: string) {
  const head = await branchHead(token, repo, branch);
  if (!head) throw new GitHubError(`Branch "${branch}" not found in ${repo} (or the repository is empty)`, 404);
  const { blobs, truncated } = await commitTree(token, repo, head);
  const prefix = folder ? `${folder}/` : '';
  const picked: { entry: TreeEntry; rel: string; asset: boolean }[] = [];
  let bytes = 0;
  for (const entry of blobs) {
    if (entry.mode === '120000' || entry.mode === '160000') continue;
    if (prefix && !entry.path.startsWith(prefix)) continue;
    const rel = entry.path.slice(prefix.length);
    const parts = rel.split('/');
    if (parts.slice(0, -1).some((p) => SKIP_DIRS.has(p))) continue;
    const name = parts[parts.length - 1];
    if (LOCKFILES.has(name)) continue;
    const ext = path.posix.extname(name).toLowerCase();
    const size = entry.size ?? 0;
    const asset = ASSET_EXTS.has(ext);
    if (asset ? size > 5 * 1024 * 1024 : !(TEXT_EXTS.has(ext) || TEXT_NAMES.has(name) || name.startsWith('.')) || size > MAX_CODE_BYTES) continue;
    bytes += size;
    picked.push({ entry, rel, asset });
  }
  if (!picked.length) throw new GitHubError(`No source files found in ${folder || 'the repository root'}`, 404);
  if (picked.length > FOLDER_MAX_FILES || bytes > FOLDER_MAX_BYTES)
    throw new GitHubError(`That folder is too large to import (${picked.length} files, ${(bytes / 1048576).toFixed(0)} MB). Pick a smaller folder.`, 413);
  const contents = await downloadBlobs(token, repo, head, picked.map((p) => p.entry));
  const files: { path: string; content: string }[] = [];
  const assets: { path: string; base64: string; mimeType: string; size: number }[] = [];
  for (const p of picked) {
    const data = contents.get(p.entry.path);
    if (!data) continue;
    if (p.asset) assets.push({ path: p.rel, base64: data.toString('base64'), mimeType: guessMime(p.rel), size: data.length });
    else if (!looksBinary(data)) files.push({ path: p.rel, content: data.toString('utf8') });
  }
  const label = (folder ? folder.split('/').pop()! : repo.split('/')[1]) || 'design-system';
  return { label, repo, branch, commitSha: head, path: folder || null, files, assets, truncated };
}
