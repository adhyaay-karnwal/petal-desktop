import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { auth } from './auth.ts';
import { db } from './db.ts';
import { DATA_DIR, DESKTOP_SCHEME, LOCAL_USER_NAME, PORT, PUBLIC_URL } from './env.ts';

/**
 * Single-user local mode. The server runs inside the desktop app on 127.0.0.1,
 * so there is no login: every request is signed in as one built-in user whose
 * random password never leaves DATA_DIR. Requests from web pages on other
 * origins and from other Host names (DNS rebinding) are refused, since they
 * would otherwise act as that user.
 */
const CRED_FILE = path.join(DATA_DIR, 'local-user.json');
const REVALIDATE_MS = 5 * 60_000;

type Credentials = { email: string; password: string };
let sessionCookie: string | null = null;
let checkedAt = 0;
let pending: Promise<string> | null = null;

function credentials(): Credentials {
  try {
    return JSON.parse(fs.readFileSync(CRED_FILE, 'utf8')) as Credentials;
  } catch {
    const cred = { email: 'me@petal.local', password: crypto.randomBytes(24).toString('hex') };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CRED_FILE, JSON.stringify(cred), { mode: 0o600 });
    return cred;
  }
}

async function signIn(): Promise<string> {
  const { email, password } = credentials();
  const exists = db.prepare('SELECT id FROM "user" WHERE email = ?').get(email);
  if (!exists) await auth.api.signUpEmail({ body: { email, password, name: LOCAL_USER_NAME } });
  // No onboarding questionnaire for the built-in user.
  db.prepare('UPDATE "user" SET onboardingCompleted = 1, name = ? WHERE email = ?').run(LOCAL_USER_NAME, email);
  const res = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
  const cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  if (!cookie) throw new Error(`local sign-in failed (${res.status})`);
  return cookie;
}

async function localCookie(): Promise<string> {
  const stale = Date.now() - checkedAt > REVALIDATE_MS;
  if (sessionCookie && !stale) return sessionCookie;
  pending ??= (async () => {
    if (sessionCookie) {
      const live = await auth.api.getSession({ headers: new Headers({ cookie: sessionCookie }) }).catch(() => null);
      if (live) return sessionCookie;
    }
    return signIn();
  })().finally(() => (pending = null));
  sessionCookie = await pending;
  checkedAt = Date.now();
  return sessionCookie;
}

const allowedHosts = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`, new URL(PUBLIC_URL).host]);

function originAllowed(origin: string | null): boolean {
  if (!origin || origin === 'null' || origin === 'file://') return true;
  if (origin === `${DESKTOP_SCHEME}:/` || origin === `${DESKTOP_SCHEME}://` || origin === PUBLIC_URL) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'http:' && (hostname === '127.0.0.1' || hostname === 'localhost');
  } catch {
    return false;
  }
}

/** Wraps the app's fetch handler: guards the origin, then attaches the local session. */
export function localModeFetch(handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (!allowedHosts.has(req.headers.get('host') ?? '') || !originAllowed(req.headers.get('origin'))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const url = new URL(req.url);
    // Signing out of the one local account would just show a login screen with no way in.
    if (req.method === 'POST' && url.pathname === '/api/auth/sign-out') return Response.json({ success: true });
    const headers = new Headers(req.headers);
    headers.set('cookie', await localCookie());
    return handler(new Request(req, { headers, duplex: 'half' } as RequestInit));
  };
}
