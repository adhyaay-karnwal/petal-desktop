import crypto from 'node:crypto';
import { AUTH_SECRET } from '../env.ts';

export type BuilderClaims = { sub: string | null; pid: string; perm: string; exp: number; kind?: 'ctx' };

const KEY = crypto.createHash('sha256').update(`${AUTH_SECRET}:project-builder`).digest();
const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const mac = (data: string) => crypto.createHmac('sha256', KEY).update(data).digest('base64url');

/** `<base64url(JSON)>.<HMAC-SHA256>`; the client parses `exp` (ms) from the payload. */
export function signToken(claims: BuilderClaims): string {
  const body = b64url(JSON.stringify(claims));
  return `${body}.${mac(body)}`;
}

export function verifyToken(token: string | undefined | null, now = Date.now()): BuilderClaims | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(mac(body));
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as BuilderClaims;
    if (typeof claims.exp !== 'number' || claims.exp <= now || typeof claims.pid !== 'string') return null;
    return claims;
  } catch {
    return null;
  }
}

export const EXCHANGE_TTL_MS = 60_000;
export const CTX_TTL_MS = 12 * 60 * 60 * 1000;
export const CTX_COOKIE = 'lg-pb-ctx';
