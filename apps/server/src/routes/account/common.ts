import crypto from 'node:crypto';
import { db, newId, nowIso, parseJson } from '../../db.ts';
import { projectPermission, type Ctx, type Permission, type ProjectRow } from '../../lib/http.ts';

export type OrgRole = 'owner' | 'editor' | 'viewer';
export const SHARE_PERMISSIONS = ['viewer', 'commenter', 'editor'] as const;
export type SharePermission = (typeof SHARE_PERMISSIONS)[number];

export const isSharePermission = (v: unknown): v is SharePermission =>
  typeof v === 'string' && (SHARE_PERMISSIONS as readonly string[]).includes(v);

/** Reads a JSON body; returns {} for missing/invalid bodies. */
export async function readBody(c: Ctx): Promise<Record<string, unknown>> {
  try {
    const body = await c.req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const linkToken = () => crypto.randomBytes(18).toString('base64url');

export function memberRole(organizationId: string, userId: string): OrgRole | null {
  const row = db.prepare('SELECT role FROM member WHERE organizationId = ? AND userId = ?').get(organizationId, userId) as
    | { role: string }
    | undefined;
  if (!row) return null;
  return row.role === 'owner' || row.role === 'viewer' ? row.role : 'editor';
}

/**
 * The session's active organization. Sessions created during sign-up can have
 * none (the personal org is created by a user after-hook that runs after the
 * session insert), so fall back to the user's first membership and persist it.
 */
export function activeOrgId(c: Ctx): string | null {
  const session = c.get('session');
  const user = c.get('user');
  if (!session || !user) return null;
  const current = session.activeOrganizationId ?? null;
  if (current && memberRole(current, user.id)) return current;
  const first = db.prepare('SELECT organizationId FROM member WHERE userId = ? ORDER BY createdAt ASC LIMIT 1').get(user.id) as
    | { organizationId: string }
    | undefined;
  const orgId = first?.organizationId ?? null;
  if (orgId !== current) {
    db.prepare('UPDATE session SET activeOrganizationId = ? WHERE id = ?').run(orgId, session.id);
    session.activeOrganizationId = orgId;
  }
  return orgId;
}

/** `organizationId` from the query/body, falling back to the session's active organization. */
export function resolveOrgId(c: Ctx, explicit: unknown): string | null {
  if (typeof explicit === 'string' && explicit) return explicit;
  return activeOrgId(c);
}

export function normalizeName(value: unknown, fallback = 'Untitled file'): string | null {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (!name || name.length > 200) return null;
  return name;
}

export function listItem(p: ProjectRow, opts: { shared: boolean; permission: Permission }) {
  return {
    id: p.id,
    name: p.name,
    organizationId: p.organization_id,
    createdById: p.created_by_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    editedAt: p.edited_at,
    deletedAt: p.deleted_at,
    previewUrl: p.preview_url,
    shared: opts.shared,
    canManage: opts.permission === 'owner',
    currentUserPermission: opts.permission,
    linkToken: p.link_token,
    linkAccess: p.link_access || 'none',
  };
}

export function projectDetail(p: ProjectRow, userId: string) {
  const access = projectPermission(p, userId);
  const permission = access?.permission ?? 'viewer';
  const settings = parseJson<Record<string, unknown>>(p.settings, {});
  return {
    ...listItem(p, { shared: access?.shared ?? false, permission }),
    allowDuplicate: !!p.allow_duplicate,
    settings: { allowGuestComments: false, ...settings },
    scanResult: parseJson<unknown>(p.scan_result, null),
  };
}

export const sortKey = (p: ProjectRow) => p.deleted_at ?? p.edited_at ?? p.updated_at;

export function insertProject(input: { organizationId: string; name: string; userId: string }): ProjectRow {
  const id = newId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO project (id, organization_id, name, created_by_id, created_at, updated_at, edited_at, link_access, allow_duplicate, settings)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'none', 0, '{}')`,
  ).run(id, input.organizationId, input.name, input.userId, now, now, now);
  return db.prepare('SELECT * FROM project WHERE id = ?').get(id) as ProjectRow;
}

function tableColumns(table: string): string[] {
  try {
    return (db.prepare(`PRAGMA table_info("${table.replace(/"/g, '')}")`).all() as { name: string }[]).map((r) => r.name);
  } catch {
    return [];
  }
}

/** Bytes stored for a project: file contents plus assets (when the assets module's table exists). */
export function projectUsedBytes(projectId: string): number {
  const files = db
    .prepare('SELECT COALESCE(SUM(LENGTH(CAST(content AS BLOB))), 0) AS n FROM project_file WHERE project_id = ?')
    .get(projectId) as { n: number };
  let total = Number(files.n) || 0;
  const cols = tableColumns('project_asset');
  const sizeCol = ['size_bytes', 'size', 'byte_length', 'bytes'].find((c) => cols.includes(c));
  if (sizeCol && cols.includes('project_id')) {
    try {
      const assets = db.prepare(`SELECT COALESCE(SUM(${sizeCol}), 0) AS n FROM project_asset WHERE project_id = ?`).get(projectId) as { n: number };
      total += Number(assets.n) || 0;
    } catch {
      /* table owned by another module; ignore schema surprises */
    }
  }
  return total;
}

/**
 * Creates pages for imported canvases. The page table is owned by the content
 * module, so its name/columns are discovered at runtime; returns how many rows
 * were written (0 when no compatible table exists).
 */
export function insertImportedPages(projectId: string, canvases: unknown[]): number {
  const table = ['project_page', 'page'].find((t) => tableColumns(t).length > 0);
  if (!table) return 0;
  const cols = tableColumns(table);
  const pick = (...names: string[]) => names.find((n) => cols.includes(n));
  const projectCol = pick('project_id', 'projectId');
  const canvasCol = pick('canvas', 'canvas_json', 'data');
  if (!projectCol || !canvasCol) return 0;
  const nameCol = pick('name');
  const sortCol = pick('sort_order', 'sortOrder', 'position');
  const idCol = pick('id');
  const createdCol = pick('created_at', 'createdAt');
  const updatedCol = pick('updated_at', 'updatedAt');
  let written = 0;
  canvases.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return;
    const item = raw as { name?: unknown; canvas?: unknown };
    const canvas = item.canvas && typeof item.canvas === 'object' ? { ...(item.canvas as Record<string, unknown>) } : { elements: [] };
    const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim().slice(0, 200) : `Page ${index + 1}`;
    const row: Record<string, unknown> = { [projectCol]: projectId, [canvasCol]: JSON.stringify(canvas) };
    if (idCol) row[idCol] = newId();
    if (nameCol) row[nameCol] = name;
    if (sortCol) row[sortCol] = index;
    const now = nowIso();
    if (createdCol) row[createdCol] = now;
    if (updatedCol) row[updatedCol] = now;
    const keys = Object.keys(row);
    try {
      db.prepare(`INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).run(
        ...keys.map((k) => row[k] as string | number),
      );
      written++;
    } catch (err) {
      console.warn('[account] could not import canvas', (err as Error).message);
    }
  });
  return written;
}

/** Normalizes a client-sent project-relative path; null when unusable. */
export function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  let p = value.replace(/\\/g, '/').trim();
  while (p.startsWith('./')) p = p.slice(2);
  p = p.replace(/^\/+/, '');
  if (!p || p.length > 1024) return null;
  if (p.split('/').some((seg) => seg === '..' || seg === '')) return null;
  return p;
}

/** Upserts project_file rows by path inside one transaction; returns written paths. */
export function upsertFiles(projectId: string, files: { path: string; content: string }[]): string[] {
  const now = nowIso();
  const stmt = db.prepare(
    `INSERT INTO project_file (id, project_id, path, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (project_id, path) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
  );
  db.transaction(() => {
    for (const f of files) stmt.run(newId(), projectId, f.path, f.content, now, now);
  })();
  return files.map((f) => f.path);
}
