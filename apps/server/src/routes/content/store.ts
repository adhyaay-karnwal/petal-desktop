import path from 'node:path';
import { db, defineSchema, newId, nowIso, parseJson } from '../../db.ts';
import { touchProject } from '../../lib/http.ts';
import { emitProjectChange } from '../../bus.ts';

// Tables owned by routes/content.ts (project_file itself lives in db.ts).
defineSchema(`
CREATE TABLE IF NOT EXISTS project_file_version (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  file_id TEXT,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  UNIQUE (project_id, filename)
);
CREATE INDEX IF NOT EXISTS project_file_version_path ON project_file_version(project_id, path, seq);

CREATE TABLE IF NOT EXISTS project_page (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  canvas TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_page_project ON project_page(project_id, sort_order);

CREATE TABLE IF NOT EXISTS project_canvas_version (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  name TEXT NOT NULL,
  canvas TEXT,
  created_at TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  UNIQUE (project_id, filename)
);
CREATE INDEX IF NOT EXISTS project_canvas_version_page ON project_canvas_version(project_id, page_id, seq);

CREATE TABLE IF NOT EXISTS project_draft (
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, component_name)
);

CREATE TABLE IF NOT EXISTS project_draft_version (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  UNIQUE (project_id, filename)
);
`);

export const MAX_FILE_VERSIONS = 50;
export const MAX_CANVAS_VERSIONS = 50;
/** Optional plan cap (bytes of all file contents); 0 = unlimited. */
const MAX_PROJECT_BYTES = Number(process.env.LUNACLONE_MAX_PROJECT_BYTES) || 0;

export type FileRow = { id: string; project_id: string; path: string; content: string; created_at: string; updated_at: string };

const FILE_TYPES = new Set(['tsx', 'ts', 'jsx', 'js', 'css', 'json', 'mdx', 'md']);
export function fileTypeOf(p: string, hint?: unknown): string {
  if (typeof hint === 'string' && hint) return FILE_TYPES.has(hint) ? hint : 'other';
  const ext = path.posix.extname(p).slice(1).toLowerCase();
  return FILE_TYPES.has(ext) ? ext : 'other';
}

/** Normalises a client path; returns null when invalid. */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let p = raw.trim().replace(/\\/g, '/');
  while (p.startsWith('./')) p = p.slice(2);
  p = p.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  if (!p || p.endsWith('/')) return null;
  if (p.split('/').some((seg) => seg === '..' || seg === '.')) return null;
  return p;
}

export const byteLength = (s: string) => Buffer.byteLength(s, 'utf8');

export function fileMeta(f: FileRow) {
  return { id: f.id, path: f.path, fileType: fileTypeOf(f.path), size: byteLength(f.content), createdAt: f.created_at, updatedAt: f.updated_at };
}
export function fileJson(f: FileRow) {
  return { id: f.id, projectId: f.project_id, path: f.path, fileType: fileTypeOf(f.path), content: f.content, size: byteLength(f.content), createdAt: f.created_at, updatedAt: f.updated_at };
}

export function listFiles(projectId: string): FileRow[] {
  return db.prepare('SELECT * FROM project_file WHERE project_id = ? ORDER BY path ASC').all(projectId) as FileRow[];
}
export function getFileByPath(projectId: string, p: string): FileRow | undefined {
  return db.prepare('SELECT * FROM project_file WHERE project_id = ? AND path = ?').get(projectId, p) as FileRow | undefined;
}
export function getFileById(projectId: string, id: string): FileRow | undefined {
  return db.prepare('SELECT * FROM project_file WHERE project_id = ? AND id = ?').get(projectId, id) as FileRow | undefined;
}

export function projectBytes(projectId: string): number {
  const row = db.prepare('SELECT COALESCE(SUM(length(CAST(content AS BLOB))), 0) AS n FROM project_file WHERE project_id = ?').get(projectId) as { n: number };
  return row.n;
}

/** Returns an error message when writing `newBytes` in place of `oldBytes` exceeds the cap. */
export function sizeLimitError(projectId: string, newBytes: number, oldBytes = 0): string | null {
  if (!MAX_PROJECT_BYTES) return null;
  const next = projectBytes(projectId) - oldBytes + newBytes;
  if (next > MAX_PROJECT_BYTES && newBytes > oldBytes) return "This file is over your plan's project size limit";
  return null;
}

export class ContentError extends Error {
  constructor(public status: number, message: string, public reason?: string) {
    super(message);
  }
}

function notifyFiles(projectId: string, paths: string[], deleted?: string[]) {
  touchProject(projectId);
  emitProjectChange({ type: 'files', projectId, paths, ...(deleted?.length ? { deleted } : {}) });
}

let versionSeq = 0;
const nextSeq = () => Date.now() * 1000 + (versionSeq = (versionSeq + 1) % 1000);

/** `<basename>.<epochMs>[-n].<ext>` unique within the project. */
function uniqueFilename(table: string, projectId: string, base: string, ext: string): string {
  const ms = Date.now();
  const exists = db.prepare(`SELECT 1 FROM ${table} WHERE project_id = ? AND filename = ?`);
  let name = `${base}.${ms}${ext}`;
  for (let n = 1; exists.get(projectId, name); n++) name = `${base}.${ms}-${n}${ext}`;
  return name;
}

/** Snapshots a file's current content as a version (before it is changed). */
export function snapshotFileVersion(file: FileRow) {
  const ext = path.posix.extname(file.path);
  const base = path.posix.basename(file.path, ext) || 'file';
  const filename = uniqueFilename('project_file_version', file.project_id, base, ext);
  db.prepare('INSERT INTO project_file_version (id, project_id, file_id, path, filename, content, created_at, seq) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    newId(), file.project_id, file.id, file.path, filename, file.content, nowIso(), nextSeq(),
  );
  // Keep only the newest MAX_FILE_VERSIONS per path.
  db.prepare(
    `DELETE FROM project_file_version WHERE project_id = ? AND path = ? AND id NOT IN (
       SELECT id FROM project_file_version WHERE project_id = ? AND path = ? ORDER BY seq DESC LIMIT ${MAX_FILE_VERSIONS})`,
  ).run(file.project_id, file.path, file.project_id, file.path);
  return filename;
}

export function createFile(projectId: string, p: string, content: string, opts: { notify?: boolean } = {}): FileRow {
  if (getFileByPath(projectId, p)) throw new ContentError(409, `File already exists: ${p}`);
  const limit = sizeLimitError(projectId, byteLength(content));
  if (limit) throw new ContentError(403, limit, 'project_size');
  const now = nowIso();
  const row: FileRow = { id: newId(), project_id: projectId, path: p, content, created_at: now, updated_at: now };
  db.prepare('INSERT INTO project_file (id, project_id, path, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    row.id, row.project_id, row.path, row.content, row.created_at, row.updated_at,
  );
  if (opts.notify !== false) notifyFiles(projectId, [p]);
  return row;
}

/** PATCH semantics: version the old content (if changed), write, notify. */
export function updateFileContent(file: FileRow, content: string, opts: { notify?: boolean } = {}): FileRow {
  if (content === file.content) return file;
  const limit = sizeLimitError(file.project_id, byteLength(content), byteLength(file.content));
  if (limit) throw new ContentError(403, limit, 'project_size');
  const now = nowIso();
  db.transaction(() => {
    snapshotFileVersion(file);
    db.prepare('UPDATE project_file SET content = ?, updated_at = ? WHERE id = ?').run(content, now, file.id);
  })();
  if (opts.notify !== false) notifyFiles(file.project_id, [file.path]);
  return { ...file, content, updated_at: now };
}

export function deleteFile(file: FileRow) {
  db.transaction(() => {
    db.prepare('DELETE FROM project_file_version WHERE project_id = ? AND file_id = ?').run(file.project_id, file.id);
    db.prepare('DELETE FROM project_file WHERE id = ?').run(file.id);
  })();
  notifyFiles(file.project_id, [], [file.path]);
}

export function notifyFileWrites(projectId: string, paths: string[]) {
  if (paths.length) notifyFiles(projectId, paths);
}

// ---------------------------------------------------------------- pages

export type PageRow = { id: string; project_id: string; name: string; sort_order: number; canvas: string | null; created_at: string; updated_at: string };

export function pageJson(p: PageRow) {
  return { id: p.id, projectId: p.project_id, name: p.name, sortOrder: p.sort_order, canvas: parseJson<unknown>(p.canvas, null), createdAt: p.created_at, updatedAt: p.updated_at };
}
export function listPages(projectId: string): PageRow[] {
  return db.prepare('SELECT * FROM project_page WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC').all(projectId) as PageRow[];
}
export function getPage(projectId: string, id: string): PageRow | undefined {
  return db.prepare('SELECT * FROM project_page WHERE project_id = ? AND id = ?').get(projectId, id) as PageRow | undefined;
}

export function createPage(projectId: string, input: { name?: unknown; sortOrder?: unknown; canvas?: unknown }): PageRow {
  const pages = listPages(projectId);
  const maxOrder = pages.reduce((m, p) => Math.max(m, p.sort_order), -1);
  const now = nowIso();
  const row: PageRow = {
    id: newId(),
    project_id: projectId,
    name: typeof input.name === 'string' && input.name.trim() ? input.name : `Page ${pages.length + 1}`,
    sort_order: typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder) : maxOrder + 1,
    canvas: JSON.stringify(input.canvas && typeof input.canvas === 'object' ? input.canvas : { elements: [], zoom: 1, pan: { x: 0, y: 0 } }),
    created_at: now,
    updated_at: now,
  };
  db.prepare('INSERT INTO project_page (id, project_id, name, sort_order, canvas, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    row.id, row.project_id, row.name, row.sort_order, row.canvas, row.created_at, row.updated_at,
  );
  touchProject(projectId);
  return row;
}

export function snapshotCanvasVersion(page: PageRow) {
  const filename = uniqueFilename('project_canvas_version', page.project_id, page.id, '.json');
  db.prepare('INSERT INTO project_canvas_version (id, project_id, page_id, filename, name, canvas, created_at, seq) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    newId(), page.project_id, page.id, filename, page.name, page.canvas, nowIso(), nextSeq(),
  );
  db.prepare(
    `DELETE FROM project_canvas_version WHERE project_id = ? AND page_id = ? AND id NOT IN (
       SELECT id FROM project_canvas_version WHERE project_id = ? AND page_id = ? ORDER BY seq DESC LIMIT ${MAX_CANVAS_VERSIONS})`,
  ).run(page.project_id, page.id, page.project_id, page.id);
  return filename;
}

const CANVAS_SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
/** Throttled snapshot of the page as it was before an autosave. */
export function maybeSnapshotCanvas(page: PageRow) {
  const last = db.prepare('SELECT created_at FROM project_canvas_version WHERE project_id = ? AND page_id = ? ORDER BY seq DESC LIMIT 1').get(page.project_id, page.id) as { created_at: string } | undefined;
  if (last && Date.now() - Date.parse(last.created_at) < CANVAS_SNAPSHOT_INTERVAL_MS) return;
  snapshotCanvasVersion(page);
}
