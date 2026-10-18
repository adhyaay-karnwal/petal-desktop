import fs from 'node:fs';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth, migrateAuthSchema } from './auth.ts';
import { DESKTOP_SCHEME, HOST, LOCAL_MODE, PORT, PUBLIC_URL, WEB_DIR } from './env.ts';
import { localModeFetch } from './localMode.ts';
import { withSession, type AppEnv, type Ctx } from './lib/http.ts';
import registerAccount from './routes/account.ts';
import registerContent from './routes/content.ts';
import registerCollab from './routes/collab.ts';
import registerAssets from './routes/assets.ts';
import registerBuilder from './builder/index.ts';
import registerInternal from './routes/internal.ts';

await migrateAuthSchema();

const app = new Hono<AppEnv>();

// The packaged desktop renderer runs with webSecurity off; CORS matters for
// dev renderers (http://localhost) and the web pages served here.
app.use('*', cors({ origin: (origin) => origin || '*', credentials: true, exposeHeaders: ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges'] }));

app.get('/health', (c) => c.json({ ok: true }));
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// Web pages the desktop app opens in the system browser.
const page = (file: string) => (c: Ctx) =>
  c.html(fs.readFileSync(path.join(WEB_DIR, file), 'utf8').replaceAll('__DESKTOP_SCHEME__', DESKTOP_SCHEME));
app.get('/login', page('login.html'));
app.get('/', (c) => c.redirect('/login'));

app.use('*', withSession);
registerAccount(app);
registerContent(app);
registerCollab(app);
registerAssets(app);
registerBuilder(app);
registerInternal(app);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error('[server]', c.req.method, c.req.path, err);
  return c.json({ error: err.message || 'Internal error' }, 500);
});

serve({ fetch: LOCAL_MODE ? localModeFetch(app.fetch) : app.fetch, hostname: HOST, port: PORT }, () => {
  console.log(`[server] API listening on ${PUBLIC_URL}${LOCAL_MODE ? ' (local mode)' : ''}`);
  // Embedded in the desktop app: tell the parent process we are ready.
  (process as { parentPort?: { postMessage(m: unknown): void } }).parentPort?.postMessage({ type: 'ready', url: PUBLIC_URL });
});
