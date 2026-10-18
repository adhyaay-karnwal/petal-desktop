/**
 * Project content (spec 02): files, pages, drafts, version history,
 * settings, save-to-code, validate-compile and the shadcn starter seed.
 * `components/scan` is owned by the builder.
 */
import path from 'node:path';
import { db, newId, nowIso, parseJson } from '../db.ts';
import { emitProjectChange } from '../bus.ts';
import { jsonError, loadProject, touchProject, type App, type Ctx, type ProjectRow } from '../lib/http.ts';
import {
  ContentError,
  createFile,
  createPage,
  deleteFile,
  fileJson,
  fileMeta,
  getFileById,
  getFileByPath,
  getPage,
  listFiles,
  listPages,
  maybeSnapshotCanvas,
  normalizePath,
  notifyFileWrites,
  pageJson,
  snapshotCanvasVersion,
  updateFileContent,
  type FileRow,
  type PageRow,
} from './content/store.ts';
import { validateCompile } from './content/compile.ts';
import { MERGE_FAILED_MESSAGE, mergeSnapshotIntoFile, type SaveToCodeBody } from './content/saveToCode.ts';
import { DESIGN_PAGE_NAME, TEMPLATE_FILES, buildDesignCanvas, mergeGlobalsCss, mergePackageJson } from './content/template.ts';

type Json = Record<string, unknown>;

async function readBody(c: Ctx): Promise<Json> {
  try {
    const body = await c.req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Json) : {};
  } catch {
    return {};
  }
}

function contentError(c: Ctx, err: unknown) {
  if (err instanceof ContentError) return jsonError(c, err.status, err.message, err.reason);
  throw err;
}

// ------------------------------------------------------------ settings

type StoredSettings = {
  iconLibraries?: string[] | null;
  previewElementId?: string | null;
  previewFingerprint?: string | null;
  copyCodeIncludesComponents?: boolean;
  [k: string]: unknown;
};

const BUNDLED_ICON_LIBRARIES = new Set(['lucide-react', '@phosphor-icons/react', '@heroicons/react/24/outline', '@heroicons/react/24/solid', '@heroicons/react/20/solid']);
function isLoadableIconLibrary(lib: string) {
  const seg = '[a-z0-9][a-z0-9._~-]*';
  return new RegExp(`^(@${seg}\\/${seg}|${seg})(\\/${seg})*$`).test(lib);
}
function isLikelyIconLibraryPackage(name: string) {
  if (!isLoadableIconLibrary(name)) return false;
  if (BUNDLED_ICON_LIBRARIES.has(name)) return true;
  if (name === '@mui/icons-material' || name === '@tabler/icons-react' || name === 'react-icons') return true;
  return /(?:^|[/@_-])icons?(?:$|[/_-])/.test(name);
}

function readSettings(project: ProjectRow): StoredSettings {
  const fresh = db.prepare('SELECT settings FROM project WHERE id = ?').get(project.id) as { settings: string } | undefined;
  return parseJson<StoredSettings>(fresh?.settings ?? project.settings, {});
}
function writeSettings(projectId: string, patch: Partial<StoredSettings>) {
  db.transaction(() => {
    const row = db.prepare('SELECT settings FROM project WHERE id = ?').get(projectId) as { settings: string };
    const next = { ...parseJson<StoredSettings>(row?.settings, {}), ...patch };
    db.prepare('UPDATE project SET settings = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(next), nowIso(), projectId);
  })();
}

function detectIconLibraries(projectId: string): string[] {
  const pkg = getFileByPath(projectId, 'package.json');
  if (!pkg) return [];
  const json = parseJson<{ dependencies?: Json; devDependencies?: Json }>(pkg.content, {});
  const names = [...Object.keys(json.dependencies ?? {}), ...Object.keys(json.devDependencies ?? {})];
  const out: string[] = [];
  for (const name of names) {
    if (!isLikelyIconLibraryPackage(name)) continue;
    const spec = name === '@heroicons/react' ? '@heroicons/react/24/outline' : name;
    if (!out.includes(spec)) out.push(spec);
  }
  return out;
}

function settingsJson(project: ProjectRow) {
  const s = readSettings(project);
  const explicit = Array.isArray(s.iconLibraries) ? s.iconLibraries : null;
  return {
    iconLibraries: explicit ?? detectIconLibraries(project.id),
    preferredIconLibraries: explicit,
    previewElementId: typeof s.previewElementId === 'string' ? s.previewElementId : null,
    previewFingerprint: typeof s.previewFingerprint === 'string' ? s.previewFingerprint : null,
    copyCodeIncludesComponents: s.copyCodeIncludesComponents === true,
    fonts: { google: [], local: [] },
  };
}

// ------------------------------------------------------------ drafts

type DraftRow = { project_id: string; component_name: string; data: string; created_at: string; updated_at: string };
function draftJson(row: DraftRow) {
  return { ...parseJson<Json>(row.data, {}), componentName: row.component_name, createdAt: row.created_at, updatedAt: row.updated_at };
}
function getDraft(projectId: string, name: string) {
  return db.prepare('SELECT * FROM project_draft WHERE project_id = ? AND component_name = ?').get(projectId, name) as DraftRow | undefined;
}
function sourceFileForDraft(projectId: string, draft: Json, componentName: string): FileRow | undefined {
  const fp = normalizePath(draft.filePath);
  if (fp) {
    const f = getFileByPath(projectId, fp);
    if (f) return f;
  }
  const lower = componentName.toLowerCase();
  return listFiles(projectId).find((f) => path.posix.basename(f.path).replace(/\.(tsx|ts|jsx|js)$/, '').toLowerCase() === lower);
}
function snapshotDraft(row: DraftRow) {
  const ms = Date.now();
  const exists = db.prepare('SELECT 1 FROM project_draft_version WHERE project_id = ? AND filename = ?');
  let filename = `${row.component_name}.draft.${ms}.json`;
  for (let n = 1; exists.get(row.project_id, filename); n++) filename = `${row.component_name}.draft.${ms}-${n}.json`;
  db.prepare('INSERT INTO project_draft_version (id, project_id, component_name, filename, data, created_at, seq) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    newId(), row.project_id, row.component_name, filename, JSON.stringify(draftJson(row)), nowIso(), ms,
  );
  db.prepare(
    `DELETE FROM project_draft_version WHERE project_id = ? AND component_name = ? AND id NOT IN (
       SELECT id FROM project_draft_version WHERE project_id = ? AND component_name = ? ORDER BY seq DESC, rowid DESC LIMIT 50)`,
  ).run(row.project_id, row.component_name, row.project_id, row.component_name);
}
function upsertDraft(projectId: string, componentName: string, data: Json): DraftRow {
  const existing = getDraft(projectId, componentName);
  const now = nowIso();
  const { createdAt: _c, updatedAt: _u, ...rest } = data;
  void _c;
  void _u;
  const payload = JSON.stringify({ ...rest, componentName });
  if (existing) {
    snapshotDraft(existing);
    db.prepare('UPDATE project_draft SET data = ?, updated_at = ? WHERE project_id = ? AND component_name = ?').run(payload, now, projectId, componentName);
  } else {
    db.prepare('INSERT INTO project_draft (project_id, component_name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(projectId, componentName, payload, now, now);
  }
  touchProject(projectId);
  return getDraft(projectId, componentName)!;
}

// ------------------------------------------------------------ routes

export default function register(app: App) {
  const P = '/projects/:projectId';

  // ---------------------------------------------------------------- files
  app.get(`${P}/files`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json(listFiles(r.project.id).map(fileMeta));
  });

  app.get(`${P}/files/by-path`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const p = normalizePath(c.req.query('path'));
    const file = p ? getFileByPath(r.project.id, p) : undefined;
    if (!file) return jsonError(c, 404, 'File not found');
    return c.json(fileJson(file));
  });

  app.post(`${P}/files/validate-compile`, async (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const p = normalizePath(body.path);
    if (!p) return jsonError(c, 400, 'path is required');
    if (typeof body.content !== 'string') return jsonError(c, 400, 'content must be a string');
    const result = await validateCompile(p, body.content, listFiles(r.project.id).map((f) => f.path));
    return result.ok ? c.json({ ok: true }) : c.json({ error: result.error }, 422);
  });

  app.post(`${P}/files`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const p = normalizePath(body.path);
    if (!p) return jsonError(c, 400, 'A valid project-relative path is required');
    const content = typeof body.content === 'string' ? body.content : '';
    try {
      const file = createFile(r.project.id, p, content);
      return c.json(fileJson(file), 201);
    } catch (err) {
      return contentError(c, err);
    }
  });

  app.get(`${P}/files/:fileId`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const file = getFileById(r.project.id, c.req.param('fileId'));
    if (!file) return jsonError(c, 404, 'File not found');
    return c.json(fileJson(file));
  });

  app.patch(`${P}/files/:fileId`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const file = getFileById(r.project.id, c.req.param('fileId'));
    if (!file) return jsonError(c, 404, 'File not found');
    const body = await readBody(c);
    if (typeof body.content !== 'string') return jsonError(c, 400, 'content must be a string');
    try {
      return c.json(fileJson(updateFileContent(file, body.content)));
    } catch (err) {
      return contentError(c, err);
    }
  });

  app.delete(`${P}/files/:fileId`, (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const file = getFileById(r.project.id, c.req.param('fileId'));
    if (!file) return jsonError(c, 404, 'File not found');
    deleteFile(file);
    return c.json({ success: true });
  });

  // ---------------------------------------------------------------- pages
  app.get(`${P}/pages`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json(listPages(r.project.id).map(pageJson));
  });

  app.post(`${P}/pages/reorder`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const order = Array.isArray(body.order) ? body.order : [];
    const stmt = db.prepare('UPDATE project_page SET sort_order = ?, updated_at = ? WHERE project_id = ? AND id = ?');
    const now = nowIso();
    db.transaction(() => {
      for (const item of order as Json[]) {
        if (item && typeof item.id === 'string' && typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)) stmt.run(Math.trunc(item.sortOrder), now, r.project.id, item.id);
      }
    })();
    touchProject(r.project.id);
    return c.json({ success: true });
  });

  app.post(`${P}/pages`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    return c.json(pageJson(createPage(r.project.id, body)), 201);
  });

  app.get(`${P}/pages/:pageId`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const page = getPage(r.project.id, c.req.param('pageId'));
    if (!page) return jsonError(c, 404, 'Page not found');
    return c.json(pageJson(page));
  });

  app.patch(`${P}/pages/:pageId`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const page = getPage(r.project.id, c.req.param('pageId'));
    if (!page) return jsonError(c, 404, 'Page not found');
    const body = await readBody(c);
    const name = typeof body.name === 'string' && body.name.trim() ? body.name : page.name;
    let canvas = page.canvas;
    if (body.canvas && typeof body.canvas === 'object' && !Array.isArray(body.canvas)) {
      canvas = JSON.stringify({ ...parseJson<Json>(page.canvas, {}), ...(body.canvas as Json) });
    }
    if (canvas !== page.canvas) maybeSnapshotCanvas(page);
    db.prepare('UPDATE project_page SET name = ?, canvas = ?, updated_at = ? WHERE id = ?').run(name, canvas, nowIso(), page.id);
    touchProject(r.project.id);
    if (Array.isArray(body.newClasses)) {
      const classes = [...new Set((body.newClasses as unknown[]).filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length < 512))];
      if (classes.length) emitProjectChange({ type: 'css-classes', projectId: r.project.id, classes });
    }
    return c.json({ success: true });
  });

  app.delete(`${P}/pages/:pageId`, (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const page = getPage(r.project.id, c.req.param('pageId'));
    if (!page) return jsonError(c, 404, 'Page not found');
    const pages = listPages(r.project.id);
    if (pages.length <= 1) return jsonError(c, 400, 'A file must have at least one page');
    db.transaction(() => {
      db.prepare('DELETE FROM project_canvas_version WHERE project_id = ? AND page_id = ?').run(r.project.id, page.id);
      db.prepare('DELETE FROM project_page WHERE id = ?').run(page.id);
      const upd = db.prepare('UPDATE project_page SET sort_order = ? WHERE id = ?');
      pages.filter((p) => p.id !== page.id).forEach((p, i) => p.sort_order !== i && upd.run(i, p.id));
    })();
    touchProject(r.project.id);
    return c.json({ success: true });
  });

  // ---------------------------------------------------------------- drafts (legacy)
  app.get(`${P}/drafts`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const rows = db.prepare('SELECT * FROM project_draft WHERE project_id = ? ORDER BY updated_at DESC').all(r.project.id) as DraftRow[];
    return c.json({ success: true, drafts: rows.map(draftJson) });
  });

  app.post(`${P}/drafts`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    if (typeof body.componentName !== 'string' || !body.componentName) return c.json({ success: false, error: 'componentName is required' }, 400);
    return c.json({ success: true, draft: draftJson(upsertDraft(r.project.id, body.componentName, body)) });
  });

  app.get(`${P}/drafts/by-component`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const name = c.req.query('name') ?? '';
    const row = name ? getDraft(r.project.id, name) : undefined;
    if (!row) return c.json({ success: true, draft: null, sourceModifiedSinceDraft: false });
    const draft = draftJson(row);
    const src = sourceFileForDraft(r.project.id, draft, name);
    return c.json({ success: true, draft, sourceModifiedSinceDraft: !!src && Date.parse(src.updated_at) > Date.parse(row.updated_at) });
  });

  app.delete(`${P}/drafts/by-component`, (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const name = c.req.query('name') ?? '';
    db.prepare('DELETE FROM project_draft WHERE project_id = ? AND component_name = ?').run(r.project.id, name);
    return c.json({ success: true });
  });

  app.get(`${P}/drafts/versions-by-component`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const rows = db
      .prepare('SELECT filename, created_at FROM project_draft_version WHERE project_id = ? AND component_name = ? ORDER BY seq DESC, rowid DESC')
      .all(r.project.id, c.req.query('name') ?? '') as { filename: string; created_at: string }[];
    return c.json({ success: true, versions: rows.map((v) => ({ filename: v.filename, createdAt: v.created_at })) });
  });

  app.get(`${P}/draft-versions/:filename`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const row = db.prepare('SELECT data FROM project_draft_version WHERE project_id = ? AND filename = ?').get(r.project.id, c.req.param('filename')) as { data: string } | undefined;
    if (!row) return c.json({ success: false, error: 'Version not found' }, 404);
    return c.json({ success: true, draft: parseJson<Json>(row.data, {}) });
  });

  app.post(`${P}/drafts/restore-version`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const row = db
      .prepare('SELECT component_name, data FROM project_draft_version WHERE project_id = ? AND filename = ?')
      .get(r.project.id, typeof body.versionId === 'string' ? body.versionId : '') as { component_name: string; data: string } | undefined;
    if (!row) return c.json({ success: false, error: 'Version not found' }, 404);
    const name = typeof body.componentName === 'string' && body.componentName ? body.componentName : row.component_name;
    return c.json({ success: true, draft: draftJson(upsertDraft(r.project.id, name, parseJson<Json>(row.data, {}))) });
  });

  // ---------------------------------------------------------------- file versions
  app.get(`${P}/file-versions`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const p = normalizePath(c.req.query('path'));
    if (!p) return c.json({ success: true, versions: [] });
    const rows = db
      .prepare('SELECT filename, path, created_at, length(CAST(content AS BLOB)) AS size FROM project_file_version WHERE project_id = ? AND path = ? ORDER BY seq DESC')
      .all(r.project.id, p) as { filename: string; path: string; created_at: string; size: number }[];
    return c.json({ success: true, versions: rows.map((v) => ({ filename: v.filename, path: v.path, createdAt: v.created_at, size: v.size })) });
  });

  app.post(`${P}/file-versions/restore`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const version = db
      .prepare('SELECT * FROM project_file_version WHERE project_id = ? AND filename = ?')
      .get(r.project.id, typeof body.versionId === 'string' ? body.versionId : '') as { file_id: string | null; path: string; content: string } | undefined;
    if (!version) return c.json({ success: false, error: 'Version not found' }, 404);
    const targetPath = normalizePath(body.filePath) ?? version.path;
    let file = getFileByPath(r.project.id, targetPath) ?? (version.file_id ? getFileById(r.project.id, version.file_id) : undefined);
    try {
      if (file) file = updateFileContent(file, version.content);
      else file = createFile(r.project.id, targetPath, version.content);
    } catch (err) {
      if (err instanceof ContentError) return c.json({ success: false, error: err.message, ...(err.reason ? { reason: err.reason } : {}) }, err.status as 403);
      throw err;
    }
    return c.json({ success: true, filePath: file.path, content: file.content });
  });

  app.get(`${P}/file-versions/:filename`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const row = db
      .prepare('SELECT filename, path, content, created_at FROM project_file_version WHERE project_id = ? AND filename = ?')
      .get(r.project.id, c.req.param('filename')) as { filename: string; path: string; content: string; created_at: string } | undefined;
    if (!row) return c.json({ success: false, error: 'Version not found' }, 404);
    return c.json({ success: true, content: row.content, filename: row.filename, path: row.path, createdAt: row.created_at });
  });

  // ---------------------------------------------------------------- canvas versions (legacy)
  app.get(`${P}/canvas-versions`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const rows = db
      .prepare('SELECT filename, created_at FROM project_canvas_version WHERE project_id = ? AND page_id = ? ORDER BY seq DESC')
      .all(r.project.id, c.req.query('pageId') ?? '') as { filename: string; created_at: string }[];
    return c.json({ success: true, versions: rows.map((v) => ({ filename: v.filename, createdAt: v.created_at })) });
  });

  app.post(`${P}/canvas-versions/restore`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const version = db
      .prepare('SELECT * FROM project_canvas_version WHERE project_id = ? AND filename = ?')
      .get(r.project.id, typeof body.versionId === 'string' ? body.versionId : '') as { page_id: string; canvas: string | null } | undefined;
    if (!version) return c.json({ success: false, error: 'Version not found' }, 404);
    const page = getPage(r.project.id, typeof body.pageId === 'string' && body.pageId ? body.pageId : version.page_id);
    if (!page) return c.json({ success: false, error: 'Page not found' }, 404);
    snapshotCanvasVersion(page);
    db.prepare('UPDATE project_page SET canvas = ?, updated_at = ? WHERE id = ?').run(version.canvas, nowIso(), page.id);
    touchProject(r.project.id);
    return c.json({ success: true });
  });

  app.get(`${P}/canvas-versions/:filename`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    const row = db
      .prepare('SELECT name, canvas, created_at, page_id FROM project_canvas_version WHERE project_id = ? AND filename = ?')
      .get(r.project.id, c.req.param('filename')) as { name: string; canvas: string | null; created_at: string; page_id: string } | undefined;
    if (!row) return c.json({ success: false, error: 'Version not found' }, 404);
    return c.json({ success: true, canvas: parseJson<unknown>(row.canvas, null), name: row.name, pageId: row.page_id, createdAt: row.created_at });
  });

  // ---------------------------------------------------------------- settings
  app.get(`${P}/settings`, (c) => {
    const r = loadProject(c, 'viewer');
    if (!r.ok) return r.response;
    return c.json(settingsJson(r.project));
  });

  app.patch(`${P}/settings/icon-libraries`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const libs = body.iconLibraries;
    if (libs !== null && !Array.isArray(libs)) return jsonError(c, 400, 'iconLibraries must be an array or null');
    let value: string[] | null = null;
    if (Array.isArray(libs)) {
      value = [];
      for (const lib of libs) {
        if (typeof lib !== 'string' || !isLoadableIconLibrary(lib)) return jsonError(c, 400, `Invalid icon library: ${String(lib)}`);
        if (!value.includes(lib)) value.push(lib);
      }
    }
    writeSettings(r.project.id, { iconLibraries: value });
    return c.json(settingsJson(r.project));
  });

  app.patch(`${P}/settings/copy-code`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    if (typeof body.includeComponents !== 'boolean') return jsonError(c, 400, 'includeComponents must be a boolean');
    writeSettings(r.project.id, { copyCodeIncludesComponents: body.includeComponents });
    return c.json(settingsJson(r.project));
  });

  app.patch(`${P}/settings/preview-element`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = await readBody(c);
    const id = body.elementId;
    if (id !== null && typeof id !== 'string') return jsonError(c, 400, 'elementId must be a string or null');
    writeSettings(r.project.id, { previewElementId: id || null });
    return c.json(settingsJson(r.project));
  });

  // ---------------------------------------------------------------- save to code
  app.post(`${P}/save-to-code`, async (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const body = (await readBody(c)) as SaveToCodeBody;
    const filePath = normalizePath(body.filePath);
    if (!filePath) return c.json({ success: false, error: 'filePath is required' }, 400);
    const file = getFileByPath(r.project.id, filePath);
    if (!file || !file.content) return c.json({ success: false, error: `File not found: ${filePath}` }, 404);
    let merged: string;
    try {
      merged = await mergeSnapshotIntoFile({
        body,
        filePath,
        originalCode: file.content,
        scanResult: parseJson<Record<string, unknown>>(r.project.scan_result, {}),
        projectPaths: listFiles(r.project.id).map((f) => f.path),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[save-to-code]', filePath, message);
      return c.json({ success: false, error: message || MERGE_FAILED_MESSAGE }, 422);
    }
    // Re-read: the file may have changed while merging.
    const current = getFileById(r.project.id, file.id) ?? file;
    try {
      updateFileContent(current, merged);
    } catch (err) {
      if (err instanceof ContentError) return c.json({ success: false, error: err.message, ...(err.reason ? { reason: err.reason } : {}) }, err.status as 403);
      throw err;
    }
    return c.json({ success: true, filePath, code: merged });
  });

  // ---------------------------------------------------------------- starter template
  app.post(`${P}/seed-template`, (c) => {
    const r = loadProject(c, 'editor');
    if (!r.ok) return r.response;
    const projectId = r.project.id;
    let copied = 0;
    let skipped = 0;
    const written: string[] = [];
    try {
      db.transaction(() => {
        for (const t of TEMPLATE_FILES) {
          if (getFileByPath(projectId, t.path)) { skipped++; continue; }
          createFile(projectId, t.path, t.content, { notify: false });
          written.push(t.path);
          copied++;
        }
        const pkg = getFileByPath(projectId, 'package.json');
        const nextPkg = mergePackageJson(pkg?.content ?? null, r.project.name);
        const css = getFileByPath(projectId, 'app/globals.css');
        const nextCss = mergeGlobalsCss(css?.content ?? null);
        for (const [p, existing, next] of [['package.json', pkg, nextPkg], ['app/globals.css', css, nextCss]] as const) {
          if (next == null) continue;
          if (existing) updateFileContent(existing, next, { notify: false });
          else createFile(projectId, p, next, { notify: false });
          written.push(p);
        }
      })();
    } catch (err) {
      return contentError(c, err);
    }
    notifyFileWrites(projectId, written);

    let designPageId: string | undefined;
    if (copied > 0) {
      const existing = listPages(projectId).find((p: PageRow) => p.name === DESIGN_PAGE_NAME);
      designPageId = existing?.id ?? createPage(projectId, { name: DESIGN_PAGE_NAME, canvas: buildDesignCanvas() }).id;
    }
    touchProject(projectId);
    return c.json({ copied, skipped, ...(designPageId ? { designPageId } : {}) });
  });

}
