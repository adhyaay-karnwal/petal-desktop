import { db, defineSchema, newId, nowIso, parseJson } from '../db.ts';
import { jsonError, loadProject, type App, type Ctx, type Permission, type ProjectRow } from '../lib/http.ts';

defineSchema(`
CREATE TABLE IF NOT EXISTS project_chat (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT,
  messages TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  source TEXT,
  comment_id TEXT
);
CREATE INDEX IF NOT EXISTS project_chat_owner ON project_chat(project_id, user_id, updated_at);

CREATE TABLE IF NOT EXISTS project_comment (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  page_id TEXT,
  parent_id TEXT REFERENCES project_comment(id) ON DELETE CASCADE,
  author_id TEXT,
  guest_name TEXT,
  is_agent INTEGER NOT NULL DEFAULT 0,
  body TEXT NOT NULL DEFAULT '',
  mention_spans TEXT NOT NULL DEFAULT '[]',
  attachments TEXT NOT NULL DEFAULT '[]',
  canvas_x INTEGER,
  canvas_y INTEGER,
  element_id TEXT,
  anchor_x REAL,
  anchor_y REAL,
  resolved INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  resolved_by TEXT,
  agent_status TEXT,
  agent_chat_id TEXT,
  agent_heartbeat_at TEXT,
  agent_request_id TEXT,
  agent_run_chat_id TEXT,
  created_at TEXT NOT NULL,
  edited_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_comment_roots ON project_comment(project_id, parent_id, created_at, id);
CREATE INDEX IF NOT EXISTS project_comment_parent ON project_comment(parent_id, created_at);

CREATE TABLE IF NOT EXISTS project_comment_reaction (
  comment_id TEXT NOT NULL REFERENCES project_comment(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, user_id, emoji)
);
`);

const RANK: Record<Permission, number> = { viewer: 0, commenter: 1, editor: 2, owner: 3 };
/** A `working` run blocks a new one while its heartbeat is this fresh. */
const AGENT_BUSY_MS = 90_000;
/** `working` runs whose heartbeat is older than this are marked `failed`. */
const AGENT_STALE_MS = 120_000;
const AGENT_STATUSES = ['working', 'completed', 'failed', 'cancelled'] as const;
type AgentStatus = (typeof AGENT_STATUSES)[number];

async function readJson(c: Ctx): Promise<Record<string, unknown>> {
  try {
    const body = await c.req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const isoAgo = (ms: number) => new Date(Date.now() - ms).toISOString();

// =====================================================================
// Chats (§1) — scoped to (project, user); messages stored verbatim.
// =====================================================================

type ChatRow = {
  id: string;
  project_id: string;
  user_id: string;
  title: string | null;
  messages: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  source: string | null;
  comment_id: string | null;
};

function serializeChat(row: ChatRow, withMessages: boolean) {
  const chat: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
  if (withMessages) chat.messages = parseJson<unknown[]>(row.messages, []);
  return chat;
}

function insertChat(input: { projectId: string; userId: string; title: string | null; messages: unknown[]; source?: string; commentId?: string }): ChatRow {
  const now = nowIso();
  const row: ChatRow = {
    id: newId(),
    project_id: input.projectId,
    user_id: input.userId,
    title: input.title,
    messages: JSON.stringify(input.messages),
    created_at: now,
    updated_at: now,
    archived_at: null,
    source: input.source ?? null,
    comment_id: input.commentId ?? null,
  };
  db.prepare(
    `INSERT INTO project_chat (id, project_id, user_id, title, messages, created_at, updated_at, archived_at, source, comment_id)
     VALUES (@id, @project_id, @user_id, @title, @messages, @created_at, @updated_at, @archived_at, @source, @comment_id)`,
  ).run(row);
  return row;
}

function getChat(projectId: string, userId: string, chatId: string): ChatRow | undefined {
  return db.prepare('SELECT * FROM project_chat WHERE id = ? AND project_id = ? AND user_id = ?').get(chatId, projectId, userId) as ChatRow | undefined;
}

const normTitle = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null);

function registerChats(app: App) {
  app.get('/projects/:projectId/chats', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const includeArchived = c.req.query('includeArchived') === 'true';
    const summary = c.req.query('summary') === 'true';
    const rows = db
      .prepare(
        `SELECT * FROM project_chat WHERE project_id = ? AND user_id = ? ${includeArchived ? '' : 'AND archived_at IS NULL'}
         ORDER BY updated_at DESC, id`,
      )
      .all(loaded.project.id, loaded.user.id) as ChatRow[];
    return c.json(rows.map((r) => serializeChat(r, !summary)));
  });

  app.get('/projects/:projectId/chats/:chatId', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row || (row.archived_at && c.req.query('includeArchived') !== 'true')) return jsonError(c, 404, 'Chat not found');
    return c.json(serializeChat(row, true));
  });

  app.post('/projects/:projectId/chats', async (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const body = await readJson(c);
    if (body.messages !== undefined && !Array.isArray(body.messages)) return jsonError(c, 400, 'messages must be an array');
    const row = insertChat({
      projectId: loaded.project.id,
      userId: loaded.user.id,
      title: normTitle(body.title),
      messages: (body.messages as unknown[] | undefined) ?? [],
    });
    return c.json(serializeChat(row, true), 201);
  });

  app.put('/projects/:projectId/chats/:chatId/messages', async (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const body = await readJson(c);
    if (!Array.isArray(body.messages)) return jsonError(c, 400, 'messages must be an array');
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row) return jsonError(c, 404, 'Chat not found');
    db.prepare('UPDATE project_chat SET messages = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(body.messages), nowIso(), row.id);
    return c.json({ success: true });
  });

  app.patch('/projects/:projectId/chats/:chatId', async (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const body = await readJson(c);
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row) return jsonError(c, 404, 'Chat not found');
    if (body.title !== undefined) {
      db.prepare('UPDATE project_chat SET title = ?, updated_at = ? WHERE id = ?').run(normTitle(body.title), nowIso(), row.id);
    }
    return c.json(serializeChat(getChat(loaded.project.id, loaded.user.id, row.id)!, false));
  });

  app.post('/projects/:projectId/chats/:chatId/archive', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row) return jsonError(c, 404, 'Chat not found');
    if (!row.archived_at) db.prepare('UPDATE project_chat SET archived_at = ? WHERE id = ?').run(nowIso(), row.id);
    return c.json({ success: true });
  });

  app.post('/projects/:projectId/chats/:chatId/restore', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row) return jsonError(c, 404, 'Chat not found');
    db.prepare('UPDATE project_chat SET archived_at = NULL, updated_at = ? WHERE id = ?').run(nowIso(), row.id);
    return c.json(serializeChat(getChat(loaded.project.id, loaded.user.id, row.id)!, true));
  });

  app.delete('/projects/:projectId/chats/:chatId', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const row = getChat(loaded.project.id, loaded.user.id, c.req.param('chatId'));
    if (!row) return jsonError(c, 404, 'Chat not found');
    db.prepare('DELETE FROM project_chat WHERE id = ?').run(row.id);
    db.prepare('UPDATE project_comment SET agent_chat_id = NULL WHERE agent_chat_id = ?').run(row.id);
    return c.json({ success: true });
  });
}

// =====================================================================
// Comments (§2)
// =====================================================================

type CommentRow = {
  id: string;
  project_id: string;
  page_id: string | null;
  parent_id: string | null;
  author_id: string | null;
  guest_name: string | null;
  is_agent: number;
  body: string;
  mention_spans: string;
  attachments: string;
  canvas_x: number | null;
  canvas_y: number | null;
  element_id: string | null;
  anchor_x: number | null;
  anchor_y: number | null;
  resolved: number;
  resolved_at: string | null;
  resolved_by: string | null;
  agent_status: AgentStatus | null;
  agent_chat_id: string | null;
  agent_heartbeat_at: string | null;
  agent_request_id: string | null;
  agent_run_chat_id: string | null;
  created_at: string;
  edited_at: string | null;
  updated_at: string;
};

type UserInfo = { id: string; name: string | null; image: string | null; email?: string };

function usersById(ids: string[]): Map<string, UserInfo> {
  const out = new Map<string, UserInfo>();
  const unique = [...new Set(ids.filter((id) => id && !id.startsWith('guest:')))];
  if (!unique.length) return out;
  const rows = db.prepare(`SELECT id, name, image, email FROM user WHERE id IN (${unique.map(() => '?').join(',')})`).all(...unique) as UserInfo[];
  for (const r of rows) out.set(r.id, r);
  return out;
}

function tableColumns(table: string): string[] {
  try {
    return (db.prepare(`PRAGMA table_info("${table}")`).all() as { name: string }[]).map((r) => r.name);
  } catch {
    return [];
  }
}

/** Page names from the content module's page table (name discovered at runtime). */
function pageNames(projectId: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const table of ['project_page', 'page']) {
    const cols = tableColumns(table);
    const projectCol = ['project_id', 'projectId'].find((col) => cols.includes(col));
    if (!cols.includes('id') || !cols.includes('name') || !projectCol) continue;
    try {
      const rows = db.prepare(`SELECT id, name FROM "${table}" WHERE "${projectCol}" = ?`).all(projectId) as { id: string; name: string }[];
      for (const r of rows) out.set(r.id, r.name);
    } catch {
      /* schema owned elsewhere */
    }
    break;
  }
  return out;
}

function sweepStaleAgents(projectId: string) {
  db.prepare(
    `UPDATE project_comment SET agent_status = 'failed', updated_at = ?
     WHERE project_id = ? AND agent_status = 'working' AND (agent_heartbeat_at IS NULL OR agent_heartbeat_at < ?)`,
  ).run(nowIso(), projectId, isoAgo(AGENT_STALE_MS));
}

function serializeComments(projectId: string, rows: CommentRow[]) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const marks = ids.map(() => '?').join(',');
  const reactions = new Map<string, Record<string, string[]>>();
  for (const r of db
    .prepare(`SELECT comment_id, user_id, emoji FROM project_comment_reaction WHERE comment_id IN (${marks}) ORDER BY created_at`)
    .all(...ids) as { comment_id: string; user_id: string; emoji: string }[]) {
    const map = reactions.get(r.comment_id) ?? {};
    (map[r.emoji] ??= []).push(r.user_id);
    reactions.set(r.comment_id, map);
  }
  const replyCounts = new Map<string, number>();
  for (const r of db
    .prepare(`SELECT parent_id, COUNT(*) AS n FROM project_comment WHERE parent_id IN (${marks}) GROUP BY parent_id`)
    .all(...ids) as { parent_id: string; n: number }[]) {
    replyCounts.set(r.parent_id, Number(r.n));
  }
  const users = usersById(rows.map((r) => r.author_id ?? ''));
  const pages = pageNames(projectId);
  return rows.map((r) => {
    const isGuest = !!r.author_id?.startsWith('guest:');
    const user = r.author_id ? users.get(r.author_id) : undefined;
    const author = r.is_agent
      ? { id: null, name: 'Agent', image: null, isGuest: false, isAgent: true }
      : { id: r.author_id, name: isGuest ? r.guest_name ?? 'Guest' : user?.name ?? null, image: user?.image ?? null, isGuest, isAgent: false };
    return {
      id: r.id,
      projectId: r.project_id,
      pageId: r.page_id,
      pageName: r.page_id ? pages.get(r.page_id) ?? null : null,
      parentId: r.parent_id,
      authorId: r.author_id,
      author,
      body: r.body,
      mentionSpans: parseJson<unknown[]>(r.mention_spans, []),
      attachments: parseJson<string[]>(r.attachments, []),
      canvasX: r.canvas_x,
      canvasY: r.canvas_y,
      elementId: r.element_id,
      anchorX: r.anchor_x,
      anchorY: r.anchor_y,
      resolved: !!r.resolved,
      resolvedAt: r.resolved_at,
      reactions: reactions.get(r.id) ?? {},
      replyCount: r.parent_id ? 0 : replyCounts.get(r.id) ?? 0,
      agentStatus: r.agent_status,
      agentChatId: r.agent_chat_id,
      createdAt: r.created_at,
      editedAt: r.edited_at,
      updatedAt: r.updated_at,
    };
  });
}

const serializeOne = (projectId: string, row: CommentRow) => serializeComments(projectId, [row])[0];

function getComment(projectId: string, id: string): CommentRow | undefined {
  return db.prepare('SELECT * FROM project_comment WHERE id = ? AND project_id = ?').get(id, projectId) as CommentRow | undefined;
}

function rootOf(projectId: string, row: CommentRow): CommentRow {
  return row.parent_id ? getComment(projectId, row.parent_id) ?? row : row;
}

const encodeCursor = (row: { created_at: string; id: string }) => Buffer.from(JSON.stringify([row.created_at, row.id])).toString('base64url');
function decodeCursor(raw: string | undefined): [string, string] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    return Array.isArray(v) && typeof v[0] === 'string' && typeof v[1] === 'string' ? [v[0], v[1]] : null;
  } catch {
    return null;
  }
}

const intOrNull = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null);
const floatOrNull = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const strOrNull = (v: unknown) => (typeof v === 'string' && v ? v : null);

function normSpans(v: unknown): unknown[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) return null;
  return v
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({ id: String(s.id ?? ''), label: String(s.label ?? ''), start: Number(s.start) || 0, end: Number(s.end) || 0 }));
}

function normAttachments(v: unknown): string[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > 10 || v.some((a) => typeof a !== 'string' || a.length > 2048)) return null;
  return v as string[];
}

const canManage = (permission: Permission) => RANK[permission] >= RANK.editor;

function registerComments(app: App) {
  app.get('/projects/:projectId/comments', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    sweepStaleAgents(projectId);
    const pageId = c.req.query('pageId');
    const includeResolved = c.req.query('includeResolved') === 'true';
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50));
    const cursor = decodeCursor(c.req.query('cursor'));
    const where = ['project_id = ?', 'parent_id IS NULL'];
    const params: unknown[] = [projectId];
    if (pageId) {
      where.push('(page_id = ? OR page_id IS NULL)');
      params.push(pageId);
    }
    if (!includeResolved) where.push('resolved = 0');
    if (cursor) {
      where.push('(created_at > ? OR (created_at = ? AND id > ?))');
      params.push(cursor[0], cursor[0], cursor[1]);
    }
    const rows = db
      .prepare(`SELECT * FROM project_comment WHERE ${where.join(' AND ')} ORDER BY created_at ASC, id ASC LIMIT ?`)
      .all(...params, limit + 1) as CommentRow[];
    const page = rows.slice(0, limit);
    const nextCursor = rows.length > limit ? encodeCursor(page[page.length - 1]) : null;
    return c.json({ items: serializeComments(projectId, page), nextCursor });
  });

  // Literal route before /comments/:id.
  app.get('/projects/:projectId/comments/people', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const p: ProjectRow = loaded.project;
    const rows = db
      .prepare(
        `SELECT u.id, u.name, u.image, u.email FROM user u WHERE u.id IN (
           SELECT userId FROM member WHERE organizationId = ?
           UNION SELECT target_id FROM project_share WHERE project_id = ? AND target_type = 'user'
           UNION SELECT ?
         ) ORDER BY COALESCE(u.name, u.email) COLLATE NOCASE`,
      )
      .all(p.organization_id, p.id, p.created_by_id) as UserInfo[];
    return c.json(rows.map((u) => ({ id: u.id, name: u.name, image: u.image, email: u.email })));
  });

  app.post('/projects/:projectId/comments', async (c) => {
    const loaded = loadProject(c, 'commenter');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    const body = await readJson(c);
    const text = typeof body.body === 'string' ? body.body.slice(0, 20000) : '';
    const mentionSpans = normSpans(body.mentionSpans);
    const attachments = normAttachments(body.attachments);
    if (!mentionSpans) return jsonError(c, 400, 'mentionSpans must be an array');
    if (!attachments) return jsonError(c, 400, 'attachments must be at most 10 asset paths');
    if (!text.trim() && !attachments.length) return jsonError(c, 400, 'Comment body is required');

    let parent: CommentRow | undefined;
    if (body.parentId) {
      if (typeof body.parentId !== 'string') return jsonError(c, 400, 'Invalid parentId');
      parent = getComment(projectId, body.parentId);
      if (!parent) return jsonError(c, 404, 'Parent comment not found');
      parent = rootOf(projectId, parent); // one level of replies
    }
    const now = nowIso();
    const row = {
      id: newId(),
      project_id: projectId,
      page_id: parent ? parent.page_id ?? strOrNull(body.pageId) : strOrNull(body.pageId),
      parent_id: parent?.id ?? null,
      author_id: loaded.user.id,
      body: text,
      mention_spans: JSON.stringify(mentionSpans),
      attachments: JSON.stringify(attachments),
      canvas_x: parent ? null : intOrNull(body.canvasX),
      canvas_y: parent ? null : intOrNull(body.canvasY),
      element_id: parent ? null : strOrNull(body.elementId),
      anchor_x: parent ? null : floatOrNull(body.anchorX),
      anchor_y: parent ? null : floatOrNull(body.anchorY),
      created_at: now,
      updated_at: now,
    };
    db.prepare(
      `INSERT INTO project_comment (id, project_id, page_id, parent_id, author_id, body, mention_spans, attachments,
         canvas_x, canvas_y, element_id, anchor_x, anchor_y, created_at, updated_at)
       VALUES (@id, @project_id, @page_id, @parent_id, @author_id, @body, @mention_spans, @attachments,
         @canvas_x, @canvas_y, @element_id, @anchor_x, @anchor_y, @created_at, @updated_at)`,
    ).run(row);
    if (parent) db.prepare('UPDATE project_comment SET updated_at = ? WHERE id = ?').run(now, parent.id);
    return c.json(serializeOne(projectId, getComment(projectId, row.id)!), 201);
  });

  app.patch('/projects/:projectId/comments/:id', async (c) => {
    const loaded = loadProject(c, 'commenter');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    const row = getComment(projectId, c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Comment not found');
    const isAuthor = row.author_id === loaded.user.id;
    const body = await readJson(c);
    const sets: string[] = [];
    const params: unknown[] = [];
    const now = nowIso();
    if (body.body !== undefined) {
      if (!isAuthor) return jsonError(c, 403, 'Only the author can edit this comment');
      if (typeof body.body !== 'string') return jsonError(c, 400, 'body must be a string');
      const spans = normSpans(body.mentionSpans);
      if (!spans) return jsonError(c, 400, 'mentionSpans must be an array');
      sets.push('body = ?', 'mention_spans = ?', 'edited_at = ?');
      params.push(body.body.slice(0, 20000), JSON.stringify(spans), now);
      if (body.attachments !== undefined) {
        const att = normAttachments(body.attachments);
        if (!att) return jsonError(c, 400, 'attachments must be at most 10 asset paths');
        sets.push('attachments = ?');
        params.push(JSON.stringify(att));
      }
    }
    const moving = ['canvasX', 'canvasY', 'elementId', 'anchorX', 'anchorY'].some((k) => k in body);
    if (moving) {
      if (!isAuthor && !canManage(loaded.permission)) return jsonError(c, 403, 'You cannot move this comment');
      if ('canvasX' in body) { sets.push('canvas_x = ?'); params.push(intOrNull(body.canvasX)); }
      if ('canvasY' in body) { sets.push('canvas_y = ?'); params.push(intOrNull(body.canvasY)); }
      // A move without anchor keys means it was dropped on empty canvas: clear the anchor.
      const anchored = 'elementId' in body || 'anchorX' in body || 'anchorY' in body;
      sets.push('element_id = ?', 'anchor_x = ?', 'anchor_y = ?');
      params.push(anchored ? strOrNull(body.elementId) : null, anchored ? floatOrNull(body.anchorX) : null, anchored ? floatOrNull(body.anchorY) : null);
      if ('pageId' in body) { sets.push('page_id = ?'); params.push(strOrNull(body.pageId)); }
    }
    if (sets.length) {
      sets.push('updated_at = ?');
      params.push(now);
      db.prepare(`UPDATE project_comment SET ${sets.join(', ')} WHERE id = ?`).run(...params, row.id);
    }
    return c.json(serializeOne(projectId, getComment(projectId, row.id)!));
  });

  app.delete('/projects/:projectId/comments/:id', (c) => {
    const loaded = loadProject(c, 'commenter');
    if (!loaded.ok) return loaded.response;
    const row = getComment(loaded.project.id, c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Comment not found');
    if (row.author_id !== loaded.user.id && !canManage(loaded.permission)) return jsonError(c, 403, 'You cannot delete this comment');
    db.prepare('DELETE FROM project_comment WHERE id = ?').run(row.id); // replies + reactions cascade
    return c.json({ success: true });
  });

  const setResolved = (resolved: boolean) => (c: Ctx) => {
    const loaded = loadProject(c, 'commenter');
    if (!loaded.ok) return loaded.response;
    const row = getComment(loaded.project.id, c.req.param('id') ?? '');
    if (!row) return jsonError(c, 404, 'Comment not found');
    const root = rootOf(loaded.project.id, row);
    const now = nowIso();
    db.prepare('UPDATE project_comment SET resolved = ?, resolved_at = ?, resolved_by = ?, updated_at = ? WHERE id = ?').run(
      resolved ? 1 : 0, resolved ? now : null, resolved ? loaded.user.id : null, now, root.id,
    );
    return c.json(serializeOne(loaded.project.id, getComment(loaded.project.id, root.id)!));
  };
  app.post('/projects/:projectId/comments/:id/resolve', setResolved(true));
  app.post('/projects/:projectId/comments/:id/unresolve', setResolved(false));

  app.post('/projects/:projectId/comments/:id/reactions', async (c) => {
    const loaded = loadProject(c, 'commenter');
    if (!loaded.ok) return loaded.response;
    const row = getComment(loaded.project.id, c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Comment not found');
    const body = await readJson(c);
    const emoji = typeof body.emoji === 'string' ? body.emoji.trim().slice(0, 64) : '';
    if (!emoji) return jsonError(c, 400, 'emoji is required');
    const removed = db.prepare('DELETE FROM project_comment_reaction WHERE comment_id = ? AND user_id = ? AND emoji = ?').run(row.id, loaded.user.id, emoji);
    if (!removed.changes) {
      db.prepare('INSERT INTO project_comment_reaction (comment_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)').run(row.id, loaded.user.id, emoji, nowIso());
    }
    return c.json(serializeOne(loaded.project.id, row));
  });

  app.get('/projects/:projectId/comments/:id/replies', (c) => {
    const loaded = loadProject(c, 'viewer');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    const row = getComment(projectId, c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Comment not found');
    sweepStaleAgents(projectId);
    const root = rootOf(projectId, row);
    const replies = db.prepare('SELECT * FROM project_comment WHERE parent_id = ? ORDER BY created_at ASC, id ASC').all(root.id) as CommentRow[];
    return c.json(serializeComments(projectId, replies));
  });

  // ---- comment agent (§2.6): the run itself happens on the desktop; the server keeps state. ----
  app.post('/projects/:projectId/comments/:id/agent', (c) => {
    const loaded = loadProject(c, 'editor');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    const request = getComment(projectId, c.req.param('id'));
    if (!request || request.is_agent) return jsonError(c, 404, 'Comment not found');
    sweepStaleAgents(projectId);
    if (request.agent_run_chat_id) return jsonError(c, 409, 'An agent already started for this comment');
    const root = rootOf(projectId, request);
    const busy = db
      .prepare(
        `SELECT 1 FROM project_comment WHERE (id = ? OR parent_id = ?) AND agent_status = 'working' AND agent_heartbeat_at >= ? LIMIT 1`,
      )
      .get(root.id, root.id, isoAgo(AGENT_BUSY_MS));
    if (busy) return jsonError(c, 409, 'This thread is busy');

    const users = usersById([request.author_id ?? '', root.author_id ?? '']);
    const nameOf = (r: CommentRow) =>
      r.is_agent ? 'Agent' : r.author_id?.startsWith('guest:') ? r.guest_name ?? 'Guest' : (r.author_id && users.get(r.author_id)?.name) || null;
    const earlier =
      request.id === root.id
        ? []
        : (db
            .prepare(
              `SELECT * FROM project_comment WHERE parent_id = ? AND id != ? AND (created_at < ? OR (created_at = ? AND id < ?))
               ORDER BY created_at ASC, id ASC`,
            )
            .all(root.id, request.id, request.created_at, request.created_at, request.id) as CommentRow[]);
    for (const [id, u] of usersById(earlier.map((r) => r.author_id ?? ''))) users.set(id, u);

    const requestText = request.body.replace(/@Agent\b/gi, '').replace(/\s+/g, ' ').trim();
    const chat = insertChat({
      projectId,
      userId: loaded.user.id,
      title: (requestText ? `Comment: ${requestText}` : 'Comment agent').slice(0, 80),
      messages: [],
      source: 'comment-agent',
      commentId: request.id,
    });
    const now = nowIso();
    const tx = db.transaction(() => {
      // Any older, not-yet-swept run in this thread is superseded.
      db.prepare(`UPDATE project_comment SET agent_status = 'failed', updated_at = ? WHERE parent_id = ? AND is_agent = 1 AND agent_status = 'working'`).run(now, root.id);
      db.prepare('UPDATE project_comment SET agent_run_chat_id = ?, updated_at = ? WHERE id = ?').run(chat.id, now, request.id);
      db.prepare(`UPDATE project_comment SET agent_status = 'working', agent_chat_id = ?, agent_heartbeat_at = ?, updated_at = ? WHERE id = ?`).run(chat.id, now, now, root.id);
      db.prepare(
        `INSERT INTO project_comment (id, project_id, page_id, parent_id, author_id, is_agent, body, agent_status, agent_chat_id,
           agent_heartbeat_at, agent_request_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, 1, '', 'working', ?, ?, ?, ?, ?)`,
      ).run(newId(), projectId, root.page_id, root.id, chat.id, now, request.id, now, now);
    });
    tx();

    const pages = pageNames(projectId);
    return c.json({
      chatId: chat.id,
      request: { id: request.id, body: request.body, author: nameOf(request), isGuest: !!request.author_id?.startsWith('guest:') },
      thread: {
        id: root.id,
        pageId: root.page_id ?? '',
        pageName: (root.page_id && pages.get(root.page_id)) || 'Page',
        elementId: root.element_id,
        canvasX: root.canvas_x ?? 0,
        canvasY: root.canvas_y ?? 0,
        anchorX: root.anchor_x,
        anchorY: root.anchor_y,
        body: root.body,
        isGuest: !!root.author_id?.startsWith('guest:'),
      },
      replies: earlier.map((r) => ({ author: nameOf(r), body: r.body, isGuest: !!r.author_id?.startsWith('guest:'), isAgent: !!r.is_agent })),
    });
  });

  app.patch('/projects/:projectId/comments/:id/agent', async (c) => {
    const loaded = loadProject(c, 'editor');
    if (!loaded.ok) return loaded.response;
    const projectId = loaded.project.id;
    const request = getComment(projectId, c.req.param('id'));
    if (!request) return jsonError(c, 404, 'Comment not found');
    if (!request.agent_run_chat_id) return jsonError(c, 409, 'No agent run for this comment');
    const body = await readJson(c);
    const status = body.status as AgentStatus;
    if (!AGENT_STATUSES.includes(status)) return jsonError(c, 400, 'Invalid status');
    const root = rootOf(projectId, request);
    const chatId = request.agent_run_chat_id;
    const current = root.agent_chat_id === chatId; // the root reflects only the latest run
    let reply = db
      .prepare('SELECT * FROM project_comment WHERE parent_id = ? AND is_agent = 1 AND agent_request_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(root.id, request.id) as CommentRow | undefined;
    const now = nowIso();

    const tx = db.transaction(() => {
      if (status === 'working') {
        if (reply && reply.agent_status !== 'working' && reply.agent_status !== 'failed') return; // already finished
        if (reply) db.prepare(`UPDATE project_comment SET agent_status = 'working', agent_heartbeat_at = ? WHERE id = ?`).run(now, reply.id);
        if (current) db.prepare(`UPDATE project_comment SET agent_status = 'working', agent_heartbeat_at = ? WHERE id = ?`).run(now, root.id);
        return;
      }
      if (status === 'completed') {
        const text = (typeof body.body === 'string' && body.body.trim() ? body.body : 'Finished. Open the agent chat to review the result.').slice(0, 10000);
        if (!reply) {
          const id = newId();
          db.prepare(
            `INSERT INTO project_comment (id, project_id, page_id, parent_id, author_id, is_agent, body, agent_chat_id, agent_request_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, NULL, 1, '', ?, ?, ?, ?)`,
          ).run(id, projectId, root.page_id, root.id, chatId, request.id, now, now);
          reply = getComment(projectId, id);
        }
        db.prepare(`UPDATE project_comment SET body = ?, agent_status = 'completed', agent_heartbeat_at = ?, updated_at = ? WHERE id = ?`).run(text, now, now, reply!.id);
      } else if (reply) {
        // failed / cancelled: drop an empty placeholder, keep a reply that already has text.
        if (!reply.body.trim()) db.prepare('DELETE FROM project_comment WHERE id = ?').run(reply.id);
        else db.prepare('UPDATE project_comment SET agent_status = ?, updated_at = ? WHERE id = ?').run(status, now, reply.id);
      }
      if (current) db.prepare('UPDATE project_comment SET agent_status = ?, agent_heartbeat_at = ?, updated_at = ? WHERE id = ?').run(status, now, now, root.id);
    });
    tx();
    return c.json({ success: true, status });
  });
}

export default function register(app: App) {
  registerChats(app);
  registerComments(app);
}
