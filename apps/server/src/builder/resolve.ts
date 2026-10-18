import { PUBLIC_URL } from '../env.ts';
import { ASSET_EXT, CSS_EXT, isModulePath, joinPath, parseJsonc, posixDirname } from './util.ts';

/** Everything import resolution depends on, derived from the project's files. */
export type ResolveCtx = {
  projectId: string;
  files: Map<string, string>;
  aliases: Array<{ pattern: string; targets: string[] }>;
  baseUrl: string | null;
  deps: Record<string, string>;
};

export type Decision =
  | { kind: 'bare'; path: string }
  | { kind: 'url'; path: string }
  | { kind: 'module'; path: string }
  | { kind: 'css'; path: string | null; specifier: string; cssModule: boolean }
  | { kind: 'inline'; path: string; loader: 'json' | 'text' }
  | { kind: 'asset'; url: string }
  | { kind: 'missing'; message: string };

const PROBE_EXT = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.css'];

export function makeResolveCtx(projectId: string, files: Map<string, string>): ResolveCtx {
  const aliases: ResolveCtx['aliases'] = [];
  let baseUrl: string | null = null;
  const tsconfigPath = files.has('tsconfig.json') ? 'tsconfig.json' : files.has('jsconfig.json') ? 'jsconfig.json' : null;
  if (tsconfigPath) {
    let cfg = parseJsonc(files.get(tsconfigPath)!) ?? {};
    // One level of local `extends` (e.g. tsconfig.base.json).
    if (typeof cfg.extends === 'string' && cfg.extends.startsWith('.')) {
      const base = joinPath('', cfg.extends.endsWith('.json') ? cfg.extends : `${cfg.extends}.json`);
      const parent = base ? parseJsonc(files.get(base) ?? '') : null;
      if (parent) cfg = { ...parent, ...cfg, compilerOptions: { ...parent.compilerOptions, ...cfg.compilerOptions } };
    }
    const co = cfg.compilerOptions ?? {};
    if (typeof co.baseUrl === 'string') baseUrl = joinPath('', co.baseUrl) ?? '';
    const paths = co.paths && typeof co.paths === 'object' ? co.paths : {};
    for (const [pattern, targets] of Object.entries(paths)) {
      if (!Array.isArray(targets)) continue;
      const dir = baseUrl ?? '';
      aliases.push({ pattern, targets: targets.filter((t): t is string => typeof t === 'string').map((t) => joinPath(dir, t) ?? t) });
    }
  }
  if (!aliases.some((a) => a.pattern === '@/*')) aliases.push({ pattern: '@/*', targets: ['*', 'src/*'] });

  const deps: Record<string, string> = {};
  const pkg = parseJsonc(files.get('package.json') ?? '') ?? {};
  for (const field of ['peerDependencies', 'devDependencies', 'dependencies']) {
    const d = pkg[field];
    if (d && typeof d === 'object') for (const [k, v] of Object.entries(d)) if (typeof v === 'string') deps[k] = v;
  }
  return { projectId, files, aliases, baseUrl, deps };
}

/** Finds the project file a path refers to, trying TS/JS extension and index conventions. */
export function probe(p: string, files: Map<string, string>, exts = PROBE_EXT): string | null {
  if (files.has(p) && !p.endsWith('/')) return p;
  for (const ext of exts) if (files.has(p + ext)) return p + ext;
  const js = p.match(/^(.*)\.(m?js|jsx)$/);
  if (js) for (const ext of ['.ts', '.tsx']) if (files.has(js[1] + ext)) return js[1] + ext;
  for (const ext of exts) if (files.has(`${p}/index${ext}`)) return `${p}/index${ext}`;
  return null;
}

/** Candidate project paths for a specifier, or null when it is not a project import. */
export function localCandidates(spec: string, importer: string, ctx: ResolveCtx): string[] | null {
  if (spec.startsWith('./') || spec.startsWith('../') || spec === '.' || spec === '..') {
    const p = joinPath(posixDirname(importer), spec);
    return p === null ? [] : [p];
  }
  if (spec.startsWith('/')) return [joinPath('', spec) ?? ''];
  for (const { pattern, targets } of ctx.aliases) {
    const star = pattern.indexOf('*');
    if (star === -1) {
      if (spec === pattern) return targets;
      continue;
    }
    const pre = pattern.slice(0, star);
    const post = pattern.slice(star + 1);
    if (spec.startsWith(pre) && spec.endsWith(post) && spec.length >= pre.length + post.length) {
      const mid = spec.slice(pre.length, spec.length - post.length);
      return targets.map((t) => t.replace('*', mid));
    }
  }
  if (spec.startsWith('@/') || spec.startsWith('~/')) return [spec.slice(2)];
  return null;
}

function splitPackage(spec: string): { name: string; sub: string } {
  const parts = spec.split('/');
  const n = spec.startsWith('@') ? 2 : 1;
  return { name: parts.slice(0, n).join('/'), sub: parts.length > n ? '/' + parts.slice(n).join('/') : '' };
}

function esmVersion(raw: string | undefined): { name?: string; version: string } {
  if (!raw) return { version: '' };
  let v = raw.trim();
  let name: string | undefined;
  if (v.startsWith('npm:')) {
    const rest = v.slice(4);
    const at = rest.lastIndexOf('@');
    if (at > 0) {
      name = rest.slice(0, at);
      v = rest.slice(at + 1);
    } else {
      name = rest;
      v = '';
    }
  }
  if (/^(workspace:|file:|link:|portal:|git|github:|https?:|\.|\/)/.test(v) || v === 'latest' || v === '*') v = '';
  v = v.replace(/\s+/g, '');
  if (!/^[\w.^~<>=*|+-]*$/.test(v)) v = '';
  return { name, version: v };
}

/** `https://esm.sh/<pkg>@<version>[/subpath]` for a bare npm specifier. */
export function esmShUrl(spec: string, ctx: ResolveCtx, js = true): string {
  const { name, sub } = splitPackage(spec);
  const { name: realName, version } = esmVersion(ctx.deps[name]);
  const base = `https://esm.sh/${realName ?? name}${version ? '@' + version : ''}${sub}`;
  return js ? `${base}?external=react,react-dom` : base;
}

export function assetUrl(projectId: string, path: string) {
  return `${PUBLIC_URL}/projects/${projectId}/assets/by-path?path=${encodeURIComponent(path)}`;
}

/** Same algorithm the client uses to turn `cssImports` into project paths (ComponentLoader.resolveCssImportPath). */
export function clientCssPath(modulePath: string, specifier: string): string | null {
  const spec = specifier.trim();
  if (/^https?:\/\//i.test(spec)) return spec;
  if (spec.startsWith('@/')) return spec.slice(2);
  if (!spec.startsWith('.')) return spec.replace(/^\//, '');
  return joinPath(posixDirname(modulePath), spec);
}

function stripQuery(spec: string) {
  const q = spec.search(/[?#]/);
  return q === -1 ? spec : spec.slice(0, q);
}

/** How an import specifier inside `importer` is handled by the compiled module. */
export function decide(rawSpec: string, importer: string, ctx: ResolveCtx): Decision {
  if (/^(https?:|data:|blob:)/i.test(rawSpec)) return { kind: 'url', path: rawSpec };
  if (/^(react|react-dom|next)(\/|$)/.test(rawSpec)) return { kind: 'bare', path: rawSpec };
  const spec = stripQuery(rawSpec);
  let candidates = localCandidates(spec, importer, ctx);
  // baseUrl lets bare-looking specifiers resolve to project files (`components/Button`).
  if (!candidates && ctx.baseUrl !== null && !spec.startsWith('@')) {
    const viaBase = joinPath(ctx.baseUrl, spec);
    if (viaBase !== null && probe(viaBase, ctx.files)) candidates = [viaBase];
  }
  if (candidates) {
    if (CSS_EXT.test(spec)) {
      const target = candidates.map((c) => probe(c, ctx.files, [])).find(Boolean) ?? candidates[0] ?? null;
      // Prefer the specifier as written when the client resolves it to the same file.
      const specifier = target && clientCssPath(importer, rawSpec) === target ? rawSpec : target ? `/${target}` : rawSpec;
      return { kind: 'css', path: target, specifier, cssModule: /\.module\.\w+$/.test(spec) };
    }
    if (ASSET_EXT.test(spec)) {
      const target = candidates[0];
      if (target === undefined) return { kind: 'missing', message: `Could not resolve "${rawSpec}"` };
      const text = ctx.files.get(target);
      if (text !== undefined && /\.svg$/i.test(target)) return { kind: 'asset', url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}` };
      return { kind: 'asset', url: assetUrl(ctx.projectId, target) };
    }
    for (const c of candidates) {
      const hit = probe(c, ctx.files);
      if (!hit) continue;
      if (isModulePath(hit)) return { kind: 'module', path: hit };
      if (CSS_EXT.test(hit)) return { kind: 'css', path: hit, specifier: `/${hit}`, cssModule: /\.module\.\w+$/.test(hit) };
      if (hit.endsWith('.json')) return { kind: 'inline', path: hit, loader: 'json' };
      return { kind: 'inline', path: hit, loader: 'text' };
    }
    return { kind: 'missing', message: `Could not resolve "${rawSpec}"` };
  }
  if (spec.startsWith('node:')) return { kind: 'url', path: `https://esm.sh/${spec.slice(5)}` };
  if (CSS_EXT.test(spec)) return { kind: 'css', path: null, specifier: esmShUrl(spec, ctx, false), cssModule: false };
  return { kind: 'url', path: esmShUrl(rawSpec, ctx) };
}

export function decisionKey(d: Decision): string {
  return JSON.stringify(d);
}
