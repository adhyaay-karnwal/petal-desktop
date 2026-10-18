/**
 * GitHub (personal token presented as a GitHub App, see github/api.ts) and
 * Figma (personal access token, see figma.ts): account routes, the browser
 * connect pages, and the per-project git routes of spec 01 §2.8/§2.9.
 */
import { db } from '../../db.ts';
import { jsonError, loadProject, type App, type Ctx } from '../../lib/http.ts';
import { ContentError } from '../content/store.ts';
import { insertProject, memberRole, projectDetail, readBody, resolveOrgId } from './common.ts';
import { figmaConnectPage, figmaDonePage, githubConnectPage, githubDonePage, signedOutPage } from './connectPages.ts';
import { FigmaError, figmaMe, figmaStatus, figmaToken, resolveFigmaImages, saveFigmaToken } from './figma.ts';
import {
  GITHUB_WEB,
  GitHubError,
  branchHead,
  commitTree,
  forgetInstallations,
  gh,
  ghCliToken,
  ghPaginate,
  getInstallation,
  loadInstallations,
  resolveToken,
  setGitHubMode,
  splitRepo,
  type GhUser,
  type Installation,
} from './github/api.ts';
import { commitProject, connectRepo, fetchFolder, gitStatus, getConn, importRepo, pullProject } from './github/sync.ts';

const NOT_CONNECTED = 'GitHub is not connected. Connect GitHub first.';
/** The desktop's loopback receiver for github-connected (main/githubOAuth.js). */
const LOOPBACK_PORT = Number(process.env.GITHUB_OAUTH_LOOPBACK_PORT || process.env.LUNACLONE_GITHUB_OAUTH_PORT) || 23574;

/** Error JSON gitFetch understands: message + details (upstream status, endpoint, request id). */
function gitError(c: Ctx, err: unknown) {
  if (err instanceof GitHubError) {
    const details = { upstreamStatus: err.upstreamStatus, endpoint: err.endpoint, requestId: err.requestId };
    return c.json({ error: err.message, message: err.message, ...(err.reason ? { code: err.reason } : {}), details }, err.status as 400);
  }
  if (err instanceof ContentError) return c.json({ error: err.message, message: err.message }, err.status as 400);
  console.error('[github]', err);
  return c.json({ error: (err as Error).message || 'GitHub request failed' }, 500);
}

/** Browser form posts must come from this server's own pages. */
function sameOrigin(c: Ctx): boolean {
  const origin = c.req.header('origin');
  if (!origin || origin === 'null') return true;
  try {
    return origin === new URL(c.req.url).origin || new URL(origin).host === c.req.header('host');
  } catch {
    return false;
  }
}

async function formField(c: Ctx, name: string): Promise<string> {
  const body = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
  const v = (body as Record<string, unknown>)[name];
  return typeof v === 'string' ? v.trim() : '';
}

/** Serialises commit/pull/import per project (double clicks, two windows). */
const busy = new Set<string>();
async function exclusive<T>(c: Ctx, key: string, fn: () => Promise<T>) {
  if (busy.has(key)) return jsonError(c, 409, 'A GitHub sync is already running for this file');
  busy.add(key);
  try {
    return c.json(await fn());
  } catch (err) {
    return gitError(c, err);
  } finally {
    busy.delete(key);
  }
}

async function installationFor(userId: string, token: string, id: unknown): Promise<Installation | null> {
  return getInstallation(userId, id) ?? (await loadInstallations(userId, token).then(() => getInstallation(userId, id)));
}

const REPO_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;

/** Account-level GitHub/Figma routes + connect pages. */
export function registerAccountIntegrations(app: App) {
  // ---------------------------------------------------------------- GitHub
  app.get('/github/status', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    if (!t) return c.json({ connected: false, appSlug: null, installations: [] });
    try {
      const { user: ghUser, installations } = await loadInstallations(user.id, t.token);
      return c.json({ connected: true, appSlug: null, installations, login: ghUser.login, source: t.source });
    } catch (err) {
      return c.json({ connected: false, appSlug: null, installations: [], source: t.source, error: (err as Error).message });
    }
  });

  app.get('/github/connect', async (c) => {
    const user = c.get('user');
    if (!user) return c.html(signedOutPage('GitHub'), 401);
    const source = c.req.query('source') || 'web';
    const t = await resolveToken(user.id);
    const current = t ? await loadInstallations(user.id, t.token).then((r) => ({ login: r.user.login, source: t.source })).catch(() => null) : null;
    const ghTok = await ghCliToken();
    const ghLogin = ghTok ? await gh<GhUser>(ghTok, 'GET', '/user').then((u) => u.login).catch(() => null) : null;
    return c.html(githubConnectPage({ source, current, ghLogin, webUrl: GITHUB_WEB, error: c.req.query('error') }));
  });

  app.post('/github/connect', async (c) => {
    const user = c.get('user');
    if (!user) return c.html(signedOutPage('GitHub'), 401);
    if (!sameOrigin(c)) return c.text('Forbidden', 403);
    const body = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const field = (k: string) => (typeof (body as Record<string, unknown>)[k] === 'string' ? String((body as Record<string, unknown>)[k]).trim() : '');
    const source = field('source') || 'web';
    const method = field('method');
    const fail = async (error: string) => {
      const ghTok = await ghCliToken();
      const ghLogin = ghTok ? await gh<GhUser>(ghTok, 'GET', '/user').then((u) => u.login).catch(() => null) : null;
      return c.html(githubConnectPage({ source, error, ghLogin, webUrl: GITHUB_WEB }), 400);
    };
    const token = method === 'gh' ? await ghCliToken() : field('token');
    if (!token) return fail(method === 'gh' ? 'The GitHub CLI is not logged in. Run `gh auth login` and try again.' : 'Paste a token first.');
    if (/\s/.test(token) || token.length > 255) return fail('That does not look like a GitHub token.');
    let ghUser: GhUser;
    try {
      ghUser = await gh<GhUser>(token, 'GET', '/user');
    } catch (err) {
      return fail(err instanceof GitHubError && err.upstreamStatus === 401 ? 'GitHub rejected this token. Check it was copied completely and has not expired.' : (err as Error).message);
    }
    if (method === 'gh') setGitHubMode(user.id, 'gh', null, ghUser.login);
    else setGitHubMode(user.id, 'token', token, ghUser.login);
    await loadInstallations(user.id, token).catch(() => null);
    console.log(`[github] ${user.email} connected GitHub as ${ghUser.login} (${method === 'gh' ? 'gh CLI' : 'token'})`);
    return c.html(githubDonePage({ login: ghUser.login, source, loopbackPort: LOOPBACK_PORT }));
  });

  // Called by desktop main after the deep link / loopback hit. The connect page already stored the credential.
  app.post('/github/exchange', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    return c.json({ ok: true, connected: !!t });
  });

  app.get('/github/installations/:installationId/repos', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    try {
      const inst = await installationFor(user.id, t.token, c.req.param('installationId'));
      if (!inst) return jsonError(c, 404, 'Unknown GitHub account');
      type Repo = { full_name: string; default_branch: string; private: boolean; pushed_at: string | null; updated_at: string; archived?: boolean };
      const repos =
        inst.accountType === 'User'
          ? await ghPaginate<Repo>(t.token, '/user/repos?affiliation=owner,collaborator&sort=pushed&per_page=100', 1000)
          : await ghPaginate<Repo>(t.token, `/orgs/${encodeURIComponent(inst.accountLogin)}/repos?type=all&sort=pushed&per_page=100`, 1000);
      return c.json({
        repos: repos
          .filter((r) => !r.archived)
          .map((r) => ({ fullName: r.full_name, defaultBranch: r.default_branch, private: r.private, updatedAt: r.pushed_at ?? r.updated_at })),
      });
    } catch (err) {
      return gitError(c, err);
    }
  });

  app.delete('/github/disconnect', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    setGitHubMode(user.id, 'disabled');
    forgetInstallations(user.id);
    return c.json({ ok: true });
  });

  // ---------------------------------------------------------------- Figma
  app.get('/figma/status', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    return c.json(await figmaStatus(user.id));
  });

  app.get('/figma/connect', async (c) => {
    const user = c.get('user');
    if (!user) return c.html(signedOutPage('Figma'), 401);
    const status = await figmaStatus(user.id);
    return c.html(figmaConnectPage({ source: c.req.query('source') || 'web', current: status.connected ? status : null }));
  });

  app.post('/figma/connect', async (c) => {
    const user = c.get('user');
    if (!user) return c.html(signedOutPage('Figma'), 401);
    if (!sameOrigin(c)) return c.text('Forbidden', 403);
    const source = (await formField(c, 'source')) || 'web';
    const token = await formField(c, 'token');
    const fail = (error: string) => c.html(figmaConnectPage({ source, error }), 400);
    if (!token || /\s/.test(token) || token.length > 512) return fail('Paste a Figma personal access token.');
    let me;
    try {
      me = await figmaMe(token);
    } catch (err) {
      return fail((err as Error).message);
    }
    if (!me) return fail('Figma rejected this token. Check it was copied completely, has the file_content:read scope and has not expired.');
    saveFigmaToken(user.id, token, me);
    console.log(`[figma] ${user.email} connected Figma as ${me.handle}`);
    return c.html(figmaDonePage({ handle: me.handle, source }));
  });

  // Disconnect button on the connect page (the desktop has no settings screen for this).
  app.post('/figma/connect/remove', async (c) => {
    const user = c.get('user');
    if (!user) return c.html(signedOutPage('Figma'), 401);
    if (!sameOrigin(c)) return c.text('Forbidden', 403);
    saveFigmaToken(user.id, null, null, 'disabled');
    return c.html(figmaConnectPage({ source: (await formField(c, 'source')) || 'web', current: null }));
  });

  app.post('/figma/exchange', (c) =>
    c.json({ error: 'Figma OAuth is not used here. Connect with a personal access token at /figma/connect.', code: 'FIGMA_NOT_CONFIGURED' }, 400),
  );

  app.delete('/figma/disconnect', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    saveFigmaToken(user.id, null, null, 'disabled');
    return c.json({ ok: true, connected: !!figmaToken(user.id) });
  });
}

/** Static `/projects/git/*` and `/projects/import-from-github` (must precede `/projects/:projectId`). */
export function registerStaticGitRoutes(app: App) {
  app.post('/projects/git/create-repo', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const body = await readBody(c);
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, '-') : '';
    if (!REPO_NAME_RE.test(name)) return jsonError(c, 400, 'Repository names may only contain letters, numbers, ".", "-" and "_"');
    try {
      const inst = body.installationId != null ? await installationFor(user.id, t.token, body.installationId) : null;
      const endpoint = inst?.accountType === 'Organization' ? `/orgs/${encodeURIComponent(inst.accountLogin)}/repos` : '/user/repos';
      type Repo = { full_name: string; default_branch: string; private: boolean; updated_at: string; html_url: string };
      const repo = await gh<Repo>(t.token, 'POST', endpoint, {
        // auto_init: the Git Data API cannot write to a repository without a first commit.
        body: { name, private: body.private !== false, auto_init: true, description: typeof body.description === 'string' ? body.description : undefined },
      });
      return c.json({ fullName: repo.full_name, defaultBranch: repo.default_branch, private: repo.private, updatedAt: repo.updated_at, htmlUrl: repo.html_url });
    } catch (err) {
      return gitError(c, err);
    }
  });

  app.get('/projects/git/repo-tree', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const repo = splitRepo(c.req.query('repo'));
    if (!repo) return jsonError(c, 400, 'repo must be "owner/name"');
    try {
      const info = await gh<{ default_branch: string }>(t.token, 'GET', `/repos/${repo}`);
      const branches = (await ghPaginate<{ name: string }>(t.token, `/repos/${repo}/branches?per_page=100`, 1000)).map((b) => b.name);
      const ref = c.req.query('ref') || info.default_branch;
      let head = await branchHead(t.token, repo, ref);
      if (!head && /^[0-9a-f]{7,40}$/i.test(ref)) head = ref;
      if (!head) return c.json({ branches, files: [], defaultBranch: info.default_branch, commitSha: null });
      const { blobs, truncated } = await commitTree(t.token, repo, head);
      const files = blobs.map((b) => b.path).filter((p) => !p.split('/').includes('node_modules'));
      return c.json({ branches, files, defaultBranch: info.default_branch, commitSha: head, truncated });
    } catch (err) {
      return gitError(c, err);
    }
  });

  app.post('/projects/git/fetch-folder', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const t = await resolveToken(user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const body = await readBody(c);
    const repo = splitRepo(body.repo);
    if (!repo) return jsonError(c, 400, 'repo must be "owner/name"');
    const folder = typeof body.path === 'string' ? body.path.trim().replace(/^\/+|\/+$/g, '') : '';
    if (folder.split('/').includes('..')) return jsonError(c, 400, 'Invalid path');
    try {
      const branch = typeof body.branch === 'string' && body.branch ? body.branch : (await gh<{ default_branch: string }>(t.token, 'GET', `/repos/${repo}`)).default_branch;
      const result = await fetchFolder(t.token, repo, branch, folder);
      console.log(`[github] fetch-folder ${repo}@${branch}:${folder || '/'} → ${result.files.length} files, ${result.assets.length} assets`);
      return c.json(result);
    } catch (err) {
      return gitError(c, err);
    }
  });

  app.post('/projects/import-from-github', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const body = await readBody(c);
    const orgId = resolveOrgId(c, body.organizationId);
    if (!orgId) return jsonError(c, 400, 'organizationId is required');
    const role = memberRole(orgId, user.id);
    if (!role) return jsonError(c, 403, 'You are not a member of this workspace');
    if (role === 'viewer') return jsonError(c, 403, 'Viewers cannot create files in this workspace');
    const t = await resolveToken(user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const repo = splitRepo(body.repo);
    if (!repo) return jsonError(c, 400, 'repo must be "owner/name"');
    const rootPath = typeof body.path === 'string' ? body.path.trim().replace(/^\/+|\/+$/g, '') : null;
    if (rootPath?.split('/').includes('..')) return jsonError(c, 400, 'Invalid path');
    let branch = typeof body.branch === 'string' && body.branch ? body.branch : '';
    try {
      if (!branch) branch = (await gh<{ default_branch: string }>(t.token, 'GET', `/repos/${repo}`)).default_branch;
    } catch (err) {
      return gitError(c, err);
    }
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 200) : (rootPath ? rootPath.split('/').pop()! : repo.split('/')[1]);
    const project = insertProject({ organizationId: orgId, name, userId: user.id });
    const started = Date.now();
    try {
      const result = await importRepo({
        token: t.token,
        projectId: project.id,
        repo,
        branch,
        rootPath,
        installationId: Number.isInteger(Number(body.installationId)) ? Number(body.installationId) : null,
        accountLogin: typeof body.accountLogin === 'string' ? body.accountLogin : null,
        userId: user.id,
      });
      console.log(`[github] imported ${repo}@${branch}${result.rootPath ? `:${result.rootPath}` : ''} → project ${project.id}: ${result.files} files, ${result.assets} assets, ${result.pages} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      return c.json({ project: projectDetail(project, user.id), import: result });
    } catch (err) {
      db.prepare('DELETE FROM project WHERE id = ?').run(project.id);
      return gitError(c, err);
    }
  });
}

/** Per-project git + figma routes. */
export function registerProjectIntegrations(app: App) {
  app.get('/projects/:projectId/git/status', async (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const conn = getConn(r.project.id);
    if (!conn) return c.json({ connected: false, repo: null, branch: null, behind: false, clean: true, changes: [] });
    const t = await resolveToken(r.user.id);
    return c.json(await gitStatus(t?.token ?? null, conn));
  });

  app.post('/projects/:projectId/git/connect', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const t = await resolveToken(r.user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const body = await readBody(c);
    const repo = splitRepo(body.repo);
    if (!repo) return jsonError(c, 400, 'repo must be "owner/name"');
    const branch = typeof body.branch === 'string' ? body.branch.trim() : '';
    return exclusive(c, r.project.id, async () => {
      await connectRepo({
        token: t.token,
        projectId: r.project.id,
        repo,
        branch,
        installationId: Number.isInteger(Number(body.installationId)) ? Number(body.installationId) : null,
        accountLogin: typeof body.accountLogin === 'string' ? body.accountLogin : null,
        userId: r.user.id,
      });
      return { ok: true, ...(await gitStatus(t.token, getConn(r.project.id)!)) };
    });
  });

  app.delete('/projects/:projectId/git/connect', (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    db.prepare('DELETE FROM project_git WHERE project_id = ?').run(r.project.id);
    return c.json({ ok: true, connected: false });
  });

  app.post('/projects/:projectId/git/commit', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const conn = getConn(r.project.id);
    if (!conn) return jsonError(c, 400, 'This file is not connected to a GitHub repository');
    const t = await resolveToken(r.user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    const body = await readBody(c);
    const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim().slice(0, 5000) : 'Update from Petal';
    return exclusive(c, r.project.id, () => commitProject(t.token, getConn(r.project.id)!, message));
  });

  app.post('/projects/:projectId/git/pull', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const conn = getConn(r.project.id);
    if (!conn) return jsonError(c, 400, 'This file is not connected to a GitHub repository');
    const t = await resolveToken(r.user.id);
    if (!t) return jsonError(c, 400, NOT_CONNECTED);
    return exclusive(c, r.project.id, () => pullProject(t.token, getConn(r.project.id)!));
  });

  app.post('/projects/:projectId/figma/resolve-images', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const fileKey = typeof body.fileKey === 'string' ? body.fileKey.trim() : '';
    if (!/^[A-Za-z0-9]{8,64}$/.test(fileKey)) return jsonError(c, 400, 'fileKey is required');
    const hashes = Array.isArray(body.hashes) ? body.hashes.filter((h): h is string => typeof h === 'string').slice(0, 500) : [];
    try {
      return c.json({ resolved: await resolveFigmaImages(r.user.id, r.project.id, fileKey, hashes) });
    } catch (err) {
      if (err instanceof FigmaError) return c.json({ error: err.message, ...(err.code ? { code: err.code } : {}) }, err.status as 400);
      throw err;
    }
  });
}
