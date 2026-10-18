import { emitProjectChange } from '../../bus.ts';
import { db, newId, nowIso } from '../../db.ts';
import { getProject, jsonError, loadProject, projectPermission, touchProject, type App, type Ctx, type ProjectRow } from '../../lib/http.ts';
import {
  insertImportedPages,
  insertProject,
  isSharePermission,
  linkToken,
  listItem,
  memberRole,
  normalizeName,
  normalizePath,
  projectDetail,
  projectUsedBytes,
  readBody,
  resolveOrgId,
  sortKey,
  upsertFiles,
} from './common.ts';
import { registerProjectIntegrations, registerStaticGitRoutes } from './integrations.ts';
import { storeAsset } from '../assets/store.ts';

const MAX_ASSET_BYTES = 10 * 1024 * 1024;

type UserRow = { id: string; name: string | null; email: string; image: string | null };

/** Org members with write access may create projects in the org. */
function checkCreateAccess(c: Ctx, organizationId: string | null) {
  const user = c.get('user');
  if (!user) return jsonError(c, 401, 'Not signed in');
  if (!organizationId) return jsonError(c, 400, 'organizationId is required');
  const role = memberRole(organizationId, user.id);
  if (!role) return jsonError(c, 403, 'You are not a member of this workspace');
  if (role === 'viewer') return jsonError(c, 403, 'Viewers cannot create files in this workspace');
  return null;
}

function listProjects(c: Ctx, trash: boolean) {
  const user = c.get('user');
  if (!user) return jsonError(c, 401, 'Not signed in');
  const orgId = resolveOrgId(c, c.req.query('organizationId'));
  if (!orgId) return c.json([]);
  if (!memberRole(orgId, user.id)) return jsonError(c, 403, 'You are not a member of this workspace');

  const own = db
    .prepare(`SELECT * FROM project WHERE organization_id = ? AND deleted_at IS ${trash ? 'NOT NULL' : 'NULL'}`)
    .all(orgId) as ProjectRow[];
  const items = own.map((p) => ({ row: p, access: projectPermission(p, user.id) ?? { permission: 'viewer' as const, shared: false } }));

  if (!trash) {
    // Projects shared directly with the user that live in other workspaces.
    const shared = db
      .prepare(
        `SELECT p.* FROM project p JOIN project_share s ON s.project_id = p.id
         WHERE s.target_type = 'user' AND s.target_id = ? AND p.organization_id != ? AND p.deleted_at IS NULL`,
      )
      .all(user.id, orgId) as ProjectRow[];
    for (const p of shared) {
      const access = projectPermission(p, user.id);
      if (access) items.push({ row: p, access: { permission: access.permission, shared: true } });
    }
  }

  items.sort((a, b) => sortKey(b.row).localeCompare(sortKey(a.row)));
  return c.json(items.map(({ row, access }) => listItem(row, access)));
}

function sharesPayload(project: ProjectRow) {
  const owners = new Map<string, UserRow>();
  const orgOwners = db
    .prepare(`SELECT u.id, u.name, u.email, u.image FROM member m JOIN "user" u ON u.id = m.userId WHERE m.organizationId = ? AND m.role = 'owner'`)
    .all(project.organization_id) as UserRow[];
  for (const u of orgOwners) owners.set(u.id, u);
  const creator = db.prepare('SELECT id, name, email, image FROM "user" WHERE id = ?').get(project.created_by_id) as UserRow | undefined;
  if (creator) owners.set(creator.id, creator);

  const shares = db
    .prepare(
      `SELECT s.target_type, s.target_id, s.permission, s.created_at, u.name, u.email, u.image
       FROM project_share s LEFT JOIN "user" u ON s.target_type = 'user' AND u.id = s.target_id
       WHERE s.project_id = ? ORDER BY s.created_at ASC`,
    )
    .all(project.id) as { target_type: string; target_id: string; permission: string; created_at: string; name: string | null; email: string | null; image: string | null }[];
  const invites = db
    .prepare('SELECT id, token, email, permission, created_at FROM project_invite WHERE project_id = ? AND accepted_at IS NULL ORDER BY created_at ASC')
    .all(project.id) as { id: string; token: string; email: string; permission: string; created_at: string }[];

  return {
    owners: [...owners.values()].map((u) => ({ id: u.id, name: u.name, email: u.email, image: u.image ?? null })),
    shares: shares.map((s) => ({
      targetType: s.target_type,
      targetId: s.target_id,
      permission: s.permission,
      userName: s.name,
      userEmail: s.email,
      userImage: s.image ?? null,
      createdAt: s.created_at,
    })),
    invites: invites.map((i) => ({ id: i.id, token: i.token, email: i.email, permission: i.permission, createdAt: i.created_at })),
  };
}

type StoreAsset = (projectId: string, asset: { path: string; contentType: string; data: Buffer }) => unknown;

async function loadStoreAsset(): Promise<StoreAsset | null> {
  return storeAsset as StoreAsset;
}

export function registerProjectRoutes(app: App) {
  // ---- static /projects/* paths (before /projects/:projectId) ----
  app.get('/projects', (c) => listProjects(c, false));
  app.get('/projects/trash', (c) => listProjects(c, true));

  app.get('/projects/invites', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const rows = db
      .prepare(
        `SELECT i.id, i.token, i.project_id, i.permission, p.name AS project_name, u.name AS inviter_name
         FROM project_invite i JOIN project p ON p.id = i.project_id LEFT JOIN "user" u ON u.id = i.inviter_id
         WHERE lower(i.email) = lower(?) AND i.accepted_at IS NULL AND p.deleted_at IS NULL ORDER BY i.created_at DESC`,
      )
      .all(user.email) as { id: string; token: string; project_id: string; permission: string; project_name: string; inviter_name: string | null }[];
    return c.json(
      rows.map((r) => ({ id: r.id, token: r.token, projectId: r.project_id, projectName: r.project_name, inviterName: r.inviter_name, permission: r.permission })),
    );
  });

  app.post('/projects/invites/:token/accept', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const key = c.req.param('token');
    const invite = db.prepare('SELECT * FROM project_invite WHERE token = ? OR id = ?').get(key, key) as
      | { id: string; project_id: string; email: string; permission: string; accepted_at: string | null }
      | undefined;
    if (!invite || invite.email.toLowerCase() !== user.email.toLowerCase()) return jsonError(c, 404, 'Invite not found');
    const project = getProject(invite.project_id);
    if (!project || project.deleted_at) return jsonError(c, 404, 'Project not found');
    const now = nowIso();
    db.transaction(() => {
      const access = projectPermission(project, user.id);
      if (!access || access.shared) {
        db.prepare(
          `INSERT INTO project_share (project_id, target_type, target_id, permission, created_at) VALUES (?, 'user', ?, ?, ?)
           ON CONFLICT (project_id, target_type, target_id) DO UPDATE SET permission = excluded.permission`,
        ).run(project.id, user.id, invite.permission, now);
      }
      if (!invite.accepted_at) db.prepare('UPDATE project_invite SET accepted_at = ? WHERE id = ?').run(now, invite.id);
    })();
    return c.json({ projectId: project.id, permission: invite.permission });
  });

  registerStaticGitRoutes(app);

  app.post('/projects', async (c) => {
    const body = await readBody(c);
    const orgId = resolveOrgId(c, body.organizationId);
    const denied = checkCreateAccess(c, orgId);
    if (denied) return denied;
    const name = normalizeName(body.name);
    if (!name) return jsonError(c, 400, 'Name must be 1-200 characters');
    const user = c.get('user')!;
    const project = insertProject({ organizationId: orgId!, name, userId: user.id });
    // Starter content the client assumes exists (CSS entry + package.json).
    const paths = upsertFiles(project.id, [
      { path: 'app/globals.css', content: '@import "tailwindcss";\n' },
      { path: 'package.json', content: `${JSON.stringify({ name: project.name, private: true, dependencies: {} }, null, 2)}\n` },
    ]);
    emitProjectChange({ type: 'files', projectId: project.id, paths });
    return c.json(projectDetail(project, user.id));
  });

  // ---- import ----
  app.post('/import', async (c) => {
    const body = await readBody(c);
    const orgId = resolveOrgId(c, body.organizationId);
    const denied = checkCreateAccess(c, orgId);
    if (denied) return denied;
    const name = normalizeName(body.name, 'Imported file');
    if (!name) return jsonError(c, 400, 'Name must be 1-200 characters');
    const user = c.get('user')!;
    const project = insertProject({ organizationId: orgId!, name, userId: user.id });
    const canvases = Array.isArray(body.canvases) ? body.canvases : [];
    const pages = canvases.length ? insertImportedPages(project.id, canvases) : 0;
    return c.json({ project: projectDetail(project, user.id), pages });
  });

  app.post('/import/files', async (c) => {
    const body = await readBody(c);
    const r = loadProject(c, 'editor', typeof body.projectId === 'string' ? body.projectId : '');
    if (!r.ok) return r.response;
    if (!Array.isArray(body.files)) return jsonError(c, 400, 'files must be an array');
    if (body.files.length > 500) return jsonError(c, 400, 'Too many files in one batch (max 500)');
    const files: { path: string; content: string }[] = [];
    for (const raw of body.files as unknown[]) {
      const f = (raw ?? {}) as { path?: unknown; content?: unknown };
      const path = normalizePath(f.path);
      if (!path || typeof f.content !== 'string') return jsonError(c, 400, `Invalid file entry${typeof f.path === 'string' ? `: ${f.path}` : ''}`);
      files.push({ path, content: f.content });
    }
    const paths = upsertFiles(r.project.id, files);
    if (paths.length) {
      touchProject(r.project.id);
      emitProjectChange({ type: 'files', projectId: r.project.id, paths });
    }
    return c.json({ ok: true, written: paths.length, paths });
  });

  app.post('/import/assets', async (c) => {
    const body = await readBody(c);
    const r = loadProject(c, 'editor', typeof body.projectId === 'string' ? body.projectId : '');
    if (!r.ok) return r.response;
    if (!Array.isArray(body.assets)) return jsonError(c, 400, 'assets must be an array');
    const storeAsset = await loadStoreAsset();
    if (!storeAsset) return jsonError(c, 501, 'Asset storage is not available on this server');
    let uploaded = 0;
    const failed: string[] = [];
    for (const raw of body.assets as unknown[]) {
      const a = (raw ?? {}) as { path?: unknown; data?: unknown; mimeType?: unknown };
      const label = typeof a.path === 'string' ? a.path : '(unknown)';
      const path = normalizePath(a.path);
      if (!path || typeof a.data !== 'string') {
        failed.push(label);
        continue;
      }
      const data = Buffer.from(a.data, 'base64');
      if (data.length > MAX_ASSET_BYTES) {
        failed.push(label);
        continue;
      }
      try {
        await storeAsset(r.project.id, { path, contentType: typeof a.mimeType === 'string' && a.mimeType ? a.mimeType : 'application/octet-stream', data });
        uploaded++;
      } catch (err) {
        console.warn('[account] import asset failed', path, (err as Error).message);
        failed.push(label);
      }
    }
    if (uploaded) touchProject(r.project.id);
    return c.json({ uploaded, failed });
  });

  // ---- /projects/:projectId ----
  app.get('/projects/:projectId', (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json(projectDetail(r.project, r.user.id));
  });

  app.patch('/projects/:projectId', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const sets: string[] = [];
    const values: (string | number)[] = [];
    if ('name' in body) {
      const name = normalizeName(body.name, '');
      if (!name) return jsonError(c, 400, 'Name must be 1-200 characters');
      sets.push('name = ?');
      values.push(name);
    }
    if ('allowDuplicate' in body) {
      if (typeof body.allowDuplicate !== 'boolean') return jsonError(c, 400, 'allowDuplicate must be a boolean');
      sets.push('allow_duplicate = ?');
      values.push(body.allowDuplicate ? 1 : 0);
    }
    if (sets.length) {
      sets.push('updated_at = ?');
      values.push(nowIso());
      db.prepare(`UPDATE project SET ${sets.join(', ')} WHERE id = ?`).run(...values, r.project.id);
    }
    return c.json(projectDetail(getProject(r.project.id)!, r.user.id));
  });

  app.delete('/projects/:projectId', (c) => {
    const r = loadProject(c, 'owner');
    if (!r.ok) return r.response;
    if (!r.project.deleted_at) {
      const now = nowIso();
      db.prepare('UPDATE project SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, r.project.id);
    }
    return c.json({ ok: true });
  });

  app.post('/projects/:projectId/restore', (c) => {
    const r = loadProject(c, 'owner');
    if (!r.ok) return r.response;
    db.prepare('UPDATE project SET deleted_at = NULL, updated_at = ? WHERE id = ?').run(nowIso(), r.project.id);
    return c.json(projectDetail(getProject(r.project.id)!, r.user.id));
  });

  app.delete('/projects/:projectId/permanent', (c) => {
    const r = loadProject(c, 'owner');
    if (!r.ok) return r.response;
    db.prepare('DELETE FROM project WHERE id = ?').run(r.project.id);
    emitProjectChange({ type: 'project-deleted', projectId: r.project.id });
    return c.json({ ok: true });
  });

  app.get('/projects/:projectId/usage', (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json({ usedBytes: projectUsedBytes(r.project.id), maxProjectBytes: null });
  });

  // ---- sharing ----
  app.get('/projects/:projectId/shares', (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json(sharesPayload(r.project));
  });

  app.post('/projects/:projectId/shares', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) return jsonError(c, 400, 'A valid email is required');
    if (!isSharePermission(body.permission)) return jsonError(c, 400, 'permission must be viewer, commenter or editor');
    const permission = body.permission;
    const now = nowIso();
    const target = db.prepare('SELECT id, name, email, image FROM "user" WHERE lower(email) = ?').get(email) as UserRow | undefined;
    if (target) {
      if (target.id === r.user.id) return jsonError(c, 400, 'You already have access to this file');
      const access = projectPermission(r.project, target.id);
      if (access && !access.shared && access.permission === 'owner') return jsonError(c, 400, `${target.email} already owns this file`);
      db.prepare(
        `INSERT INTO project_share (project_id, target_type, target_id, permission, created_at) VALUES (?, 'user', ?, ?, ?)
         ON CONFLICT (project_id, target_type, target_id) DO UPDATE SET permission = excluded.permission`,
      ).run(r.project.id, target.id, permission, now);
      // A pending invite for the same email is superseded by the direct share.
      db.prepare('UPDATE project_invite SET accepted_at = ? WHERE project_id = ? AND lower(email) = ? AND accepted_at IS NULL').run(now, r.project.id, email);
      console.log(`[account] shared project ${r.project.id} with ${email} (${permission})`);
      return c.json({
        share: { targetType: 'user', targetId: target.id, permission, userName: target.name, userEmail: target.email, userImage: target.image ?? null },
      });
    }
    const existing = db.prepare('SELECT id, token FROM project_invite WHERE project_id = ? AND lower(email) = ? AND accepted_at IS NULL').get(r.project.id, email) as
      | { id: string; token: string }
      | undefined;
    let invite: { id: string; token: string };
    if (existing) {
      db.prepare('UPDATE project_invite SET permission = ? WHERE id = ?').run(permission, existing.id);
      invite = existing;
    } else {
      invite = { id: newId(), token: linkToken() };
      db.prepare('INSERT INTO project_invite (id, token, project_id, email, permission, inviter_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        invite.id,
        invite.token,
        r.project.id,
        email,
        permission,
        r.user.id,
        now,
      );
      console.log(`[account] pending invite for ${email} to project ${r.project.id} (no email sent; self-hosted)`);
    }
    return c.json({ invite: { id: invite.id, token: invite.token, email, permission } });
  });

  app.delete('/projects/:projectId/shares/:targetId', (c) => {
    const targetId = c.req.param('targetId');
    const self = c.get('user')?.id === targetId;
    const r = loadProject(c, self ? 'viewer' : 'editor');
    if (!r.ok) return r.response;
    db.prepare('DELETE FROM project_share WHERE project_id = ? AND target_id = ?').run(r.project.id, targetId);
    return c.json({ ok: true });
  });

  app.delete('/projects/:projectId/invites/:token', (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const key = c.req.param('token');
    db.prepare('DELETE FROM project_invite WHERE project_id = ? AND (token = ? OR id = ?)').run(r.project.id, key, key);
    return c.json({ ok: true });
  });

  const linkPayload = (projectId: string) => {
    const p = getProject(projectId)!;
    return { ok: true, linkToken: p.link_token, linkAccess: p.link_access, settings: projectDetail(p, p.created_by_id).settings };
  };

  app.post('/projects/:projectId/share-link', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const access = body.access === undefined ? 'view' : body.access;
    if (access !== 'view' && access !== 'comment') return jsonError(c, 400, 'access must be view or comment');
    db.prepare('UPDATE project SET link_token = COALESCE(link_token, ?), link_access = ?, updated_at = ? WHERE id = ?').run(linkToken(), access, nowIso(), r.project.id);
    return c.json(linkPayload(r.project.id));
  });

  app.patch('/projects/:projectId/share-link', async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const now = nowIso();
    if (body.access !== undefined) {
      if (body.access !== 'view' && body.access !== 'comment' && body.access !== 'none') return jsonError(c, 400, 'access must be view or comment');
      db.prepare('UPDATE project SET link_token = COALESCE(link_token, ?), link_access = ?, updated_at = ? WHERE id = ?').run(linkToken(), body.access, now, r.project.id);
    }
    if (body.allowGuests !== undefined) {
      if (typeof body.allowGuests !== 'boolean') return jsonError(c, 400, 'allowGuests must be a boolean');
      db.prepare("UPDATE project SET settings = json_set(COALESCE(NULLIF(settings, ''), '{}'), '$.allowGuestComments', json(?)), updated_at = ? WHERE id = ?").run(
        body.allowGuests ? 'true' : 'false',
        now,
        r.project.id,
      );
    }
    return c.json(linkPayload(r.project.id));
  });

  app.delete('/projects/:projectId/share-link', (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    db.prepare("UPDATE project SET link_token = NULL, link_access = 'none', updated_at = ? WHERE id = ?").run(nowIso(), r.project.id);
    return c.json(linkPayload(r.project.id));
  });

  registerProjectIntegrations(app);
}
