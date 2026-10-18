import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { auth, type SessionRecord, type SessionUser } from '../auth.ts';
import { db } from '../db.ts';

export type AppEnv = { Variables: { user: SessionUser | null; session: SessionRecord | null } };
export type App = Hono<AppEnv>;
export type Ctx = Context<AppEnv>;

/** Error body shape every client call site understands: `{ error, reason? }`. */
export function jsonError(c: Ctx, status: number, error: string, reason?: string) {
  return c.json(reason ? { error, reason } : { error }, status as 400);
}

/** Resolves the better-auth session from the Cookie header (desktop sends `; name=value` jars). */
export const withSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const raw = c.req.raw.headers;
  const headers = new Headers(raw);
  const cookie = raw.get('cookie');
  if (cookie) headers.set('cookie', cookie.split(';').map((s) => s.trim()).filter(Boolean).join('; '));
  const result = await auth.api.getSession({ headers }).catch(() => null);
  c.set('user', (result?.user as SessionUser | undefined) ?? null);
  c.set('session', (result?.session as SessionRecord | undefined) ?? null);
  await next();
};

/** Returns the signed-in user or null after sending 401. */
export function requireUser(c: Ctx): SessionUser | null {
  return c.get('user');
}

export type Permission = 'viewer' | 'commenter' | 'editor' | 'owner';
const RANK: Record<Permission, number> = { viewer: 0, commenter: 1, editor: 2, owner: 3 };

export type ProjectRow = {
  id: string;
  organization_id: string;
  name: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  preview_url: string | null;
  link_token: string | null;
  link_access: 'none' | 'view' | 'comment';
  allow_duplicate: number;
  settings: string;
  scan_result: string | null;
};

/**
 * Effective permission: org owner or project creator → owner, org editor →
 * editor, org viewer → viewer, otherwise a direct share's permission.
 */
export function projectPermission(project: ProjectRow, userId: string): { permission: Permission; shared: boolean } | null {
  const member = db.prepare('SELECT role FROM member WHERE organizationId = ? AND userId = ?').get(project.organization_id, userId) as { role: string } | undefined;
  if (member) {
    if (member.role === 'owner' || project.created_by_id === userId) return { permission: 'owner', shared: false };
    return { permission: member.role === 'viewer' ? 'viewer' : 'editor', shared: false };
  }
  if (project.created_by_id === userId) return { permission: 'owner', shared: false };
  const share = db.prepare("SELECT permission FROM project_share WHERE project_id = ? AND target_type = 'user' AND target_id = ?").get(project.id, userId) as { permission: Permission } | undefined;
  return share ? { permission: share.permission, shared: true } : null;
}

export function getProject(projectId: string): ProjectRow | undefined {
  return db.prepare('SELECT * FROM project WHERE id = ?').get(projectId) as ProjectRow | undefined;
}

/**
 * Loads `:projectId` and checks the caller has at least `min`. On failure it
 * returns a Response to send; on success the project and permission.
 */
export function loadProject(c: Ctx, min: Permission = 'viewer', projectId = c.req.param('projectId')):
  | { ok: true; project: ProjectRow; permission: Permission; user: SessionUser }
  | { ok: false; response: Response } {
  const user = c.get('user');
  if (!user) return { ok: false, response: jsonError(c, 401, 'Not signed in') };
  const project = projectId ? getProject(projectId) : undefined;
  if (!project) return { ok: false, response: jsonError(c, 404, 'Project not found') };
  const access = projectPermission(project, user.id);
  if (!access) return { ok: false, response: jsonError(c, 404, 'Project not found') };
  if (RANK[access.permission] < RANK[min]) return { ok: false, response: jsonError(c, 403, 'You do not have permission to do that') };
  return { ok: true, project, permission: access.permission, user };
}

/** Marks project content as edited (drives the projects list sort order). */
export function touchProject(projectId: string) {
  const now = new Date().toISOString();
  db.prepare('UPDATE project SET edited_at = ?, updated_at = ? WHERE id = ?').run(now, now, projectId);
}
