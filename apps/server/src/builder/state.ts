import { db, parseJson } from '../db.ts';
import { PUBLIC_URL } from '../env.ts';
import { onProjectChange } from '../bus.ts';
import { cacheValid, compileFile, errorModuleCode, PLACEHOLDER_RE, type CompiledFile } from './compile.ts';
import { findComponents, type FoundComponent, type PropInfo } from './components.ts';
import { buildCss } from './css.ts';
import { scanCandidates } from './css.ts';
import { localCandidates, makeResolveCtx, probe, type ResolveCtx } from './resolve.ts';
import { CODE_EXT, isModulePath, mapLimit, sha } from './util.ts';

export type ModuleRef = { path: string; codeUrl: string; cssImports?: string[]; error?: string };
export type ComponentMeta = { path: string; exportName: string; props?: Record<string, PropInfo>; inspectsChildren?: boolean };
export type ComponentIndex = Record<string, ComponentMeta>;
export type CssState = { cssUrl: string; fontUrls: string[]; compiledClasses: string[]; builtAt: number; hash: string };
export type BuilderEvent = { type: string; payload?: Record<string, unknown> };

// ------------------------------------------------------------------ artifacts

type Artifact = { body: string; type: string };
/** Content-addressed build outputs: `${projectId}/${hash}` → body. */
const artifacts = new Map<string, Artifact>();
const retired: string[] = [];
const RETIRED_MAX = 2000;

export function getArtifact(projectId: string, hash: string) {
  return artifacts.get(`${projectId}/${hash}`);
}

const distBase = (projectId: string) => `${PUBLIC_URL}/project-builder/dist/${projectId}`;
export const moduleUrl = (projectId: string, hash: string, path: string) =>
  `${distBase(projectId)}/m/${hash}/${path.split('/').map(encodeURIComponent).join('/')}.js`;
export const cssUrl = (projectId: string, hash: string) => `${distBase(projectId)}/styles.css@${hash}`;

// ------------------------------------------------------------------ project build

export type SseClient = { send: (event: BuilderEvent) => void; close: () => void };

type ScanEntry = { key: string; found: FoundComponent[] };

class ProjectBuild {
  files = new Map<string, string>();
  compiled = new Map<string, CompiledFile>();
  hashes = new Map<string, string>();
  refs = new Map<string, ModuleRef>();
  scans = new Map<string, ScanEntry>();
  index: ComponentIndex = {};
  css: CssState | null = null;
  cssInputKey = '';
  pageCandidates = new Set<string>();
  extraClasses = new Set<string>();
  clients = new Set<SseClient>();
  ownedArtifacts = new Set<string>();
  ctx!: ResolveCtx;
  ready: Promise<void>;
  chain: Promise<void>;
  lastError: string | null = null;
  pending = { paths: new Set<string>(), deleted: new Set<string>(), classes: false };
  timer: NodeJS.Timeout | null = null;

  constructor(public projectId: string) {
    this.ready = this.initialBuild();
    this.chain = this.ready.catch(() => {});
  }

  private async initialBuild() {
    const rows = db.prepare('SELECT path, content FROM project_file WHERE project_id = ?').all(this.projectId) as Array<{ path: string; content: string }>;
    for (const r of rows) this.files.set(r.path, r.content ?? '');
    this.loadPageCandidates();
    const saved = db.prepare('SELECT scan_result FROM project WHERE id = ?').get(this.projectId) as { scan_result: string | null } | undefined;
    this.index = parseJson<ComponentIndex>(saved?.scan_result, {});
    await this.rebuild(true);
  }

  private loadPageCandidates() {
    try {
      const pages = db.prepare('SELECT canvas FROM project_page WHERE project_id = ?').all(this.projectId) as Array<{ canvas: string | null }>;
      for (const p of pages) if (p.canvas) for (const c of scanCandidates(p.canvas, 'html')) this.pageCandidates.add(c);
    } catch {
      // Pages table not present (content routes not loaded).
    }
  }

  broadcast(event: BuilderEvent) {
    for (const c of this.clients) c.send(event);
  }

  bootstrapEvents(): BuilderEvent[] {
    const css = this.css;
    return [
      ...(this.lastError ? [{ type: 'modules:build_failed', payload: { error: this.lastError } }] : []),
      { type: 'modules:ready', payload: { modules: [...this.refs.values()] } },
      { type: 'components:ready', payload: { componentIndex: this.index } },
      {
        type: 'css:ready',
        payload: css ? { cssUrl: css.cssUrl, fontUrls: css.fontUrls, compiledClasses: css.compiledClasses, builtAt: css.builtAt } : { builtAt: Date.now() },
      },
    ];
  }

  /** Coalesces bus events into one incremental rebuild. */
  schedule() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.chain = this.chain.then(() => this.applyPending()).catch((err) => console.error('[builder] rebuild failed', this.projectId, err));
    }, 40);
  }

  private async applyPending() {
    const { paths, deleted, classes } = this.pending;
    this.pending = { paths: new Set(), deleted: new Set(), classes: false };
    if (!paths.size && !deleted.size && !classes) return;
    const get = db.prepare('SELECT content FROM project_file WHERE project_id = ? AND path = ?');
    for (const p of new Set([...paths, ...deleted])) {
      const row = get.get(this.projectId, p) as { content: string } | undefined;
      if (row) this.files.set(p, row.content ?? '');
      else this.files.delete(p);
    }
    await this.rebuild(false);
  }

  private typeLoader = (spec: string, fromPath: string) => {
    const cands = localCandidates(spec, fromPath, this.ctx);
    if (!cands) return null;
    for (const c of cands) {
      const hit = probe(c, this.files, ['.tsx', '.ts', '.d.ts', '.jsx', '.js']);
      if (hit && CODE_EXT.test(hit)) return { path: hit, source: this.files.get(hit)! };
    }
    return null;
  };

  async rebuild(initial: boolean) {
    const t0 = Date.now();
    this.ctx = makeResolveCtx(this.projectId, this.files);
    const modulePaths = [...this.files.keys()].filter(isModulePath).sort();

    // 1. Per-file compile (cached by source + import resolution).
    const toCompile = modulePaths.filter((p) => !cacheValid(this.compiled.get(p), p, this.files.get(p)!, this.ctx));
    await mapLimit(toCompile, 8, async (p) => {
      this.compiled.set(p, await compileFile(p, this.files.get(p)!, this.ctx));
    });
    for (const p of [...this.compiled.keys()]) if (!this.files.has(p) || !isModulePath(p)) this.compiled.delete(p);

    // 2. Content-addressed hashes (Merkle over the import graph; cycles hashed as one SCC).
    const hashes = this.computeHashes(modulePaths);
    const refs = new Map<string, ModuleRef>();
    const live = new Set<string>();
    for (const p of modulePaths) {
      const c = this.compiled.get(p)!;
      const hash = hashes.get(p)!;
      const url = moduleUrl(this.projectId, hash, p);
      const key = `${this.projectId}/${hash}`;
      live.add(key);
      if (!artifacts.has(key)) {
        const body = c.error ? errorModuleCode(p, c.error) : c.code.replace(PLACEHOLDER_RE, (_m, dep: string) => moduleUrl(this.projectId, hashes.get(dep) ?? 'missing', dep));
        artifacts.set(key, { body, type: 'text/javascript; charset=utf-8' });
      }
      refs.set(p, { path: p, codeUrl: url, ...(c.cssImports.length ? { cssImports: c.cssImports } : {}), ...(c.error ? { error: c.error } : {}) });
    }

    // 3. Component index.
    const index = this.buildIndex(modulePaths);

    // 4. CSS.
    const cssChanged = await this.buildCssIfNeeded(live);
    if (this.css) live.add(`${this.projectId}/${this.css.hash}`);
    this.retireArtifacts(live);

    // 5. Diff + push.
    const prevRefs = this.refs;
    const prevIndex = this.index;
    this.refs = refs;
    this.hashes = hashes;
    this.index = index;
    this.lastError = null;
    const indexJson = JSON.stringify(index);
    if (indexJson !== JSON.stringify(prevIndex) || initial) {
      try {
        db.prepare('UPDATE project SET scan_result = ? WHERE id = ?').run(indexJson, this.projectId);
      } catch {}
    }
    if (!initial) {
      const changed = [...refs.values()].filter((r) => JSON.stringify(prevRefs.get(r.path)) !== JSON.stringify(r));
      const removed = [...prevRefs.keys()].filter((p) => !refs.has(p));
      const removedKeys = Object.keys(prevIndex).filter((k) => !index[k]);
      const patch: ComponentIndex = {};
      for (const [k, v] of Object.entries(index)) if (JSON.stringify(prevIndex[k]) !== JSON.stringify(v)) patch[k] = v;
      if (changed.length) this.broadcast({ type: 'modules:updated', payload: { modules: changed } });
      // Removals cannot be expressed as patches: resend the full catalog / index.
      if (removed.length) this.broadcast({ type: 'modules:ready', payload: { modules: [...refs.values()] } });
      if (removedKeys.length) {
        this.broadcast({ type: 'components:ready', payload: { componentIndex: index } });
      } else if (Object.keys(patch).length) {
        this.broadcast({ type: 'components:updated', payload: { componentIndex: patch } });
      }
      if (cssChanged && this.css) this.broadcast({ type: 'css:ready', payload: this.cssPayload() });
    }
    console.log(`[builder] ${this.projectId} built ${modulePaths.length} modules (${toCompile.length} compiled), ${Object.keys(index).length} components, css ${cssChanged ? 'rebuilt' : 'cached'} in ${Date.now() - t0}ms`);
  }

  cssPayload() {
    const c = this.css!;
    return { cssUrl: c.cssUrl, fontUrls: c.fontUrls, compiledClasses: c.compiledClasses, builtAt: c.builtAt };
  }

  private computeHashes(paths: string[]): Map<string, string> {
    const inSet = new Set(paths);
    const deps = (p: string) => (this.compiled.get(p)?.deps ?? []).filter((d) => inSet.has(d));
    // Tarjan SCC (iterative enough for project-sized graphs via recursion with guard).
    let counter = 0;
    const idx = new Map<string, number>();
    const low = new Map<string, number>();
    const stack: string[] = [];
    const onStack = new Set<string>();
    const sccOf = new Map<string, string[]>();
    const sccs: string[][] = [];
    const strong = (v: string) => {
      idx.set(v, counter);
      low.set(v, counter++);
      stack.push(v);
      onStack.add(v);
      for (const w of deps(v)) {
        if (!idx.has(w)) {
          strong(w);
          low.set(v, Math.min(low.get(v)!, low.get(w)!));
        } else if (onStack.has(w)) low.set(v, Math.min(low.get(v)!, idx.get(w)!));
      }
      if (low.get(v) === idx.get(v)) {
        const comp: string[] = [];
        let w: string;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          comp.push(w);
        } while (w !== v);
        comp.sort();
        sccs.push(comp);
        for (const m of comp) sccOf.set(m, comp);
      }
    };
    for (const p of paths) if (!idx.has(p)) strong(p);
    // Tarjan emits SCCs in reverse topological order: dependencies first.
    const hashes = new Map<string, string>();
    for (const comp of sccs) {
      const members = new Set(comp);
      const parts: string[] = [];
      for (const m of comp) {
        const c = this.compiled.get(m)!;
        parts.push(m, c.error ? `E:${c.error}` : c.code, JSON.stringify(c.cssImports));
        for (const d of deps(m)) if (!members.has(d)) parts.push(`dep:${d}:${hashes.get(d)}`);
      }
      const sccHash = sha(parts.join('\0'));
      for (const m of comp) hashes.set(m, sha(`${sccHash}\0${m}`, 20));
    }
    return hashes;
  }

  private buildIndex(modulePaths: string[]): ComponentIndex {
    const found: Array<FoundComponent & { path: string }> = [];
    for (const p of modulePaths) {
      const c = this.compiled.get(p)!;
      if (c.error && !c.exports.length) continue;
      const scanKey = sha(`${c.sourceHash}\0${c.exports.join(',')}\0${this.typeDepsKey(p)}`);
      let entry = this.scans.get(p);
      if (!entry || entry.key !== scanKey) {
        let list: FoundComponent[] = [];
        try {
          list = findComponents(p, this.files.get(p)!, c.exports, this.typeLoader);
        } catch (err) {
          console.warn('[builder] component scan failed', p, err);
        }
        entry = { key: scanKey, found: list };
        this.scans.set(p, entry);
      }
      for (const f of entry.found) found.push({ ...f, path: p });
    }
    for (const p of [...this.scans.keys()]) if (!this.files.has(p)) this.scans.delete(p);

    // Key assignment: a key stays with the file that already owns it; otherwise
    // prefer components/, .tsx, shallower, then alphabetical. Others get `Name::path`.
    const byName = new Map<string, Array<FoundComponent & { path: string }>>();
    for (const f of found) byName.set(f.name, [...(byName.get(f.name) ?? []), f]);
    const index: ComponentIndex = {};
    for (const [name, list] of byName) {
      const prevOwner = this.index[name]?.path;
      list.sort((a, b) => {
        const score = (x: { path: string }) => [x.path === prevOwner ? 0 : 1, x.path.startsWith('components/') ? 0 : 1, x.path.endsWith('.tsx') ? 0 : 1, x.path.split('/').length];
        const sa = score(a);
        const sb = score(b);
        for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return sa[i] - sb[i];
        return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
      });
      list.forEach((f, i) => {
        const key = i === 0 ? name : `${name}::${f.path}`;
        index[key] = { path: f.path, exportName: f.exportName, props: f.props, ...(f.inspectsChildren ? { inspectsChildren: true } : {}) };
      });
    }
    return Object.fromEntries(Object.entries(index).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  }

  /** Re-runs the props scan for index keys (forceRescan); returns a components:updated patch. */
  rescanProps(keys: string[]): ComponentIndex {
    const patch: ComponentIndex = {};
    for (const k of keys) {
      const meta = this.index[k];
      if (!meta) continue;
      this.scans.delete(meta.path);
      const compiled = this.compiled.get(meta.path);
      const source = this.files.get(meta.path);
      if (!compiled || source === undefined) continue;
      const found = findComponents(meta.path, source, compiled.exports, this.typeLoader).find((f) => f.exportName === meta.exportName);
      meta.props = found?.props ?? {};
      patch[k] = { ...meta };
    }
    return patch;
  }

  /** Imported local type files influence props; fold their contents into the scan cache key. */
  private typeDepsKey(p: string) {
    const src = this.files.get(p) ?? '';
    const parts: string[] = [];
    for (const m of src.matchAll(/(?:import|export)\s+[^'"]*?from\s*["']([^"']+)["']/g)) {
      const t = this.typeLoader(m[1], p);
      if (t) parts.push(`${t.path}:${sha(t.source, 16)}`);
    }
    return parts.join('|');
  }

  private candidates(): Set<string> {
    const all = new Set<string>(this.pageCandidates);
    for (const [p, content] of this.files) {
      if (p.includes('node_modules/') || p === 'package.json' || p.endsWith('.lock') || p === 'package-lock.json') continue;
      const ext = p.split('.').pop() ?? '';
      if (!/^(tsx|ts|jsx|js|mjs|html|mdx|md|vue|svelte|astro)$/.test(ext)) continue;
      for (const c of scanCandidates(content, ext)) all.add(c);
    }
    for (const c of this.extraClasses) all.add(c);
    return all;
  }

  private async buildCssIfNeeded(live: Set<string>): Promise<boolean> {
    const cands = this.candidates();
    const cssFiles = [...this.files.entries()].filter(([p]) => /\.css$/.test(p)).sort(([a], [b]) => (a < b ? -1 : 1));
    const inputKey = sha(JSON.stringify([[...cands].sort(), cssFiles, this.ctx.deps]));
    if (this.css && inputKey === this.cssInputKey) return false;
    let built;
    try {
      built = await buildCss(this.ctx, cands);
    } catch (err) {
      console.error('[builder] css build failed', this.projectId, err);
      return false;
    }
    if (built.warnings.length) console.warn(`[builder] css ${this.projectId}:`, built.warnings.join('; '));
    this.cssInputKey = inputKey;
    const hash = sha(built.css + '\0' + JSON.stringify(built.fontUrls), 20);
    const key = `${this.projectId}/${hash}`;
    artifacts.set(key, { body: built.css, type: 'text/css; charset=utf-8' });
    live.add(key);
    const prev = this.css;
    const sameOutput = prev?.hash === hash && JSON.stringify(prev.compiledClasses) === JSON.stringify(built.compiledClasses);
    if (sameOutput) return false;
    this.css = {
      cssUrl: cssUrl(this.projectId, hash),
      fontUrls: built.fontUrls,
      compiledClasses: built.compiledClasses,
      builtAt: Math.max(Date.now(), (prev?.builtAt ?? 0) + 1),
      hash,
    };
    return true;
  }

  private retireArtifacts(live: Set<string>) {
    for (const k of this.ownedArtifacts) {
      if (!live.has(k)) {
        retired.push(k);
        this.ownedArtifacts.delete(k);
      }
    }
    for (const k of live) this.ownedArtifacts.add(k);
    const liveAll = new Set<string>();
    for (const b of builds.values()) for (const k of b.ownedArtifacts) liveAll.add(k);
    while (retired.length > RETIRED_MAX) {
      const k = retired.shift()!;
      if (!liveAll.has(k)) artifacts.delete(k);
    }
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer);
    for (const c of this.clients) c.close();
    this.clients.clear();
    for (const k of this.ownedArtifacts) artifacts.delete(k);
  }
}

// ------------------------------------------------------------------ registry + bus

const builds = new Map<string, ProjectBuild>();

/** Returns the project's build, starting it lazily; resolves once the initial build is done. */
export async function ensureBuild(projectId: string): Promise<ProjectBuild> {
  let b = builds.get(projectId);
  if (!b) {
    b = new ProjectBuild(projectId);
    builds.set(projectId, b);
    b.ready.catch((err) => {
      console.error('[builder] initial build failed', projectId, err);
      b!.lastError = String((err as Error)?.message ?? err);
    });
  }
  await b.ready.catch(() => {});
  return b;
}

export function peekBuild(projectId: string) {
  return builds.get(projectId);
}

/** Waits for queued incremental rebuilds as well. */
export async function settledBuild(projectId: string) {
  const b = await ensureBuild(projectId);
  await b.chain;
  return b;
}

let subscribed = false;
export function subscribeBus() {
  if (subscribed) return;
  subscribed = true;
  onProjectChange((change) => {
    const b = builds.get(change.projectId);
    if (!b) return;
    if (change.type === 'project-deleted') {
      b.dispose();
      builds.delete(change.projectId);
      return;
    }
    if (change.type === 'files') {
      for (const p of change.paths) b.pending.paths.add(p);
      for (const p of change.deleted ?? []) b.pending.deleted.add(p);
      b.schedule();
      return;
    }
    if (change.type === 'css-classes') {
      let added = false;
      for (const cls of change.classes) {
        if (typeof cls !== 'string' || !cls || cls.length > 200) continue;
        if (!b.extraClasses.has(cls) && !b.pageCandidates.has(cls)) {
          b.extraClasses.add(cls);
          added = true;
        }
      }
      if (added) {
        b.pending.classes = true;
        b.schedule();
      }
    }
  });
}

export type { ProjectBuild };
