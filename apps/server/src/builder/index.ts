/**
 * Project builder (spec 03 §5): exchange tokens, builder auth, SSE build
 * events, content-addressed compiled modules + Tailwind CSS, component
 * props scan, and snapshot-preview compiles. builderUrl === PUBLIC_URL.
 */
import { getCookie, setCookie } from 'hono/cookie';
import { PUBLIC_URL } from '../env.ts';
import { getProject, jsonError, projectPermission, type App, type Ctx, type Permission } from '../lib/http.ts';
import { compileFile } from './compile.ts';
import { makeResolveCtx } from './resolve.ts';
import { ensureBuild, getArtifact, peekBuild, settledBuild, subscribeBus, type BuilderEvent, type SseClient } from './state.ts';
import { CTX_COOKIE, CTX_TTL_MS, EXCHANGE_TTL_MS, signToken, verifyToken } from './token.ts';

const PING_MS = 10_000;
const encoder = new TextEncoder();

type Access = { ok: true; projectId: string; sub: string | null; perm: Permission } | { ok: false; response: Response };

/** Session access, or anonymous share-link access via `?token=<linkToken>`. */
function projectAccess(c: Ctx, projectId: string): Access {
  const project = getProject(projectId);
  const user = c.get('user');
  if (!project) return { ok: false, response: jsonError(c, 404, 'Project not found') };
  if (user) {
    const a = projectPermission(project, user.id);
    if (a) return { ok: true, projectId, sub: user.id, perm: a.permission };
  }
  const linkToken = c.req.query('token');
  if (linkToken && project.link_token && linkToken === project.link_token && project.link_access !== 'none' && !project.deleted_at) {
    return { ok: true, projectId, sub: user?.id ?? null, perm: project.link_access === 'comment' ? 'commenter' : 'viewer' };
  }
  return { ok: false, response: user ? jsonError(c, 404, 'Project not found') : jsonError(c, 401, 'Not signed in') };
}

function sseFrame(event: BuilderEvent | null) {
  return encoder.encode(event ? `data: ${JSON.stringify(event)}\n\n` : ': keepalive\n\n');
}

export default function register(app: App) {
  subscribeBus();

  // ---------------------------------------------------------------- 5.3 exchange
  app.post('/projects/:projectId/project-builder/exchange', (c) => {
    const a = projectAccess(c, c.req.param('projectId'));
    if (!a.ok) return a.response;
    void ensureBuild(a.projectId); // warm the build while the client authenticates
    const token = signToken({ sub: a.sub, pid: a.projectId, perm: a.perm, exp: Date.now() + EXCHANGE_TTL_MS });
    return c.json({ token, builderUrl: PUBLIC_URL });
  });

  // ---------------------------------------------------------------- 5.4 builder auth
  app.post('/auth/exchange', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const claims = verifyToken((body as { token?: string })?.token);
    if (!claims || claims.kind === 'ctx') return jsonError(c, 401, 'Invalid or expired token');
    const secure = PUBLIC_URL.startsWith('https://');
    const ctx = signToken({ sub: claims.sub, pid: claims.pid, perm: claims.perm, exp: Date.now() + CTX_TTL_MS, kind: 'ctx' });
    setCookie(c, CTX_COOKIE, ctx, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: secure ? 'None' : 'Lax',
      maxAge: Math.floor(CTX_TTL_MS / 1000),
    });
    return c.json({ success: true, projectId: claims.pid });
  });

  // ---------------------------------------------------------------- 5.4 SSE
  app.get('/projects/:projectId/events', async (c) => {
    const projectId = c.req.param('projectId');
    const fromToken = verifyToken(c.req.query('token'));
    const fromCookie = verifyToken(getCookie(c, CTX_COOKIE));
    const authorized = (fromToken && fromToken.kind !== 'ctx' && fromToken.pid === projectId) || (fromCookie && fromCookie.kind === 'ctx' && fromCookie.pid === projectId);
    if (!authorized) {
      const user = c.get('user');
      const project = getProject(projectId);
      if (!user || !project || !projectPermission(project, user.id)) return jsonError(c, 403, 'Session project mismatch');
    }

    let client: SseClient | null = null;
    let ping: NodeJS.Timeout | null = null;
    let closed = false;
    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (ping) clearInterval(ping);
      if (client) peekBuild(projectId)?.clients.delete(client);
    };
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const write = (e: BuilderEvent | null) => {
          if (closed) return;
          try {
            controller.enqueue(sseFrame(e));
          } catch {
            cleanup();
          }
        };
        write({ type: 'connected' });
        ping = setInterval(() => write({ type: 'ping' }), PING_MS);
        void (async () => {
          const build = await ensureBuild(projectId);
          if (closed) return;
          client = {
            send: write,
            close: () => {
              cleanup();
              try {
                controller.close();
              } catch {}
            },
          };
          // Register and replay the bootstrap in the same tick so no update is missed.
          build.clients.add(client);
          for (const e of build.bootstrapEvents()) write(e);
        })().catch((err) => {
          write({ type: 'modules:build_failed', payload: { error: String((err as Error)?.message ?? err) } });
          write({ type: 'modules:ready', payload: { modules: [] } });
          write({ type: 'components:ready', payload: { componentIndex: {} } });
          write({ type: 'css:ready', payload: { builtAt: Date.now() } });
        });
      },
      cancel() {
        cleanup();
      },
    });
    c.req.raw.signal?.addEventListener('abort', cleanup);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  });

  // ---------------------------------------------------------------- 5.5 compiled output
  const serveArtifact = async (c: Ctx, projectId: string, hash: string): Promise<Response> => {
    let art = getArtifact(projectId, hash);
    if (!art && getProject(projectId)) {
      // Content-addressed and deterministic: after a restart the lazy build recreates it.
      await settledBuild(projectId).catch(() => null);
      art = getArtifact(projectId, hash);
    }
    if (!art) return c.text('Not found', 404, { 'Access-Control-Allow-Origin': '*' });
    c.res.headers.delete('Access-Control-Allow-Credentials');
    return c.body(art.body, 200, {
      'Content-Type': art.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
  };
  // Public immutable artifacts: plain `*` CORS (the global middleware echoes the origin with credentials).
  app.use('/project-builder/dist/*', async (c, next) => {
    await next();
    c.res.headers.set('Access-Control-Allow-Origin', '*');
    c.res.headers.delete('Access-Control-Allow-Credentials');
    c.res.headers.delete('Vary');
  });
  app.get('/project-builder/dist/:projectId/m/:hash/*', (c) => serveArtifact(c, c.req.param('projectId'), c.req.param('hash')));
  app.get('/project-builder/dist/:projectId/:file', async (c): Promise<Response> => {
    const m = /^styles\.css@([0-9a-f]+)$/.exec(c.req.param('file'));
    if (!m) return c.text('Not found', 404);
    return serveArtifact(c, c.req.param('projectId'), m[1]);
  });

  // ---------------------------------------------------------------- 5.6 props scan
  app.post('/projects/:projectId/components/scan', async (c) => {
    const a = projectAccess(c, c.req.param('projectId'));
    if (!a.ok) return a.response;
    const body = (await c.req.json().catch(() => ({}))) as { componentKey?: string; forceRescan?: boolean };
    const build = await settledBuild(a.projectId);
    const key = typeof body.componentKey === 'string' ? body.componentKey : undefined;
    if (key && !build.index[key]) return jsonError(c, 404, `Component "${key}" not found`);
    const keys = key ? [key] : Object.keys(build.index);
    if (!body.forceRescan && keys.every((k) => build.index[k]?.props !== undefined)) return c.json({ status: 'cached' });

    setTimeout(() => {
      try {
        const patch = build.rescanProps(keys);
        build.broadcast({ type: 'components:updated', payload: { componentIndex: patch } });
        build.broadcast({ type: 'components:scan_complete', payload: {} });
      } catch (err) {
        build.broadcast({ type: 'components:scan_failed', payload: { error: String((err as Error)?.message ?? err) } });
      }
    }, 0);
    return c.json({ status: 'started' });
  });

  // ---------------------------------------------------------------- 5.6 snapshot previews
  app.post('/projects/:projectId/snapshot-previews', async (c) => {
    const a = projectAccess(c, c.req.param('projectId'));
    if (!a.ok) return a.response;
    const body = (await c.req.json().catch(() => null)) as { code?: unknown; path?: unknown } | null;
    if (!body || typeof body.code !== 'string') return c.json({ success: false, error: 'code is required' }, 400);
    const code = body.code;
    const build = await settledBuild(a.projectId);
    const filePath = typeof body.path === 'string' && body.path ? body.path.replace(/^\/+/, '') : guessSnapshotPath(code, build.index);
    const ctx = makeResolveCtx(a.projectId, build.files);
    const result = await compileFile(filePath, code, ctx, { moduleUrl: (p) => build.refs.get(p)?.codeUrl ?? null });
    if (result.error) return c.json({ success: false, error: result.error });
    return c.json({ success: true, compiledCode: result.code });
  });
}

/** Version-history code carries no path; place it at the file that defines one of its exported components. */
function guessSnapshotPath(code: string, index: Record<string, { path: string }>): string {
  const names = [...code.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|let)\s+([A-Z][\w$]*)/g)].map((m) => m[1]);
  for (const n of names) if (index[n]) return index[n].path;
  return 'components/__snapshot__.tsx';
}
