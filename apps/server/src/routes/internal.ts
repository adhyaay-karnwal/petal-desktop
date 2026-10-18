import crypto from 'node:crypto';
import { LOCAL_MODE } from '../env.ts';
import { jsonError, type App } from '../lib/http.ts';
import { resolveToken } from './account/github/api.ts';

/**
 * Routes for the desktop main process only (local mode). Callers must send the
 * per-launch key the desktop passed in PETAL_INTERNAL_KEY.
 */
export default function registerInternal(app: App) {
  const key = process.env.PETAL_INTERNAL_KEY;
  if (!LOCAL_MODE || !key) return;
  const expected = Buffer.from(key);
  const authorized = (header: string | undefined) => {
    const got = Buffer.from(header ?? '');
    return got.length === expected.length && crypto.timingSafeEqual(got, expected);
  };

  // The updater reads Petal's private release feed with the user's GitHub connection.
  app.get('/internal/github-token', async (c) => {
    if (!authorized(c.req.header('x-petal-internal'))) return jsonError(c, 403, 'Forbidden');
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const info = await resolveToken(user.id);
    return c.json({ token: info?.token ?? null, source: info?.source ?? null });
  });
}
