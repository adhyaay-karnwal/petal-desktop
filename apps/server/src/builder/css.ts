import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';
import { optimize } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import { assetUrl, localCandidates, probe, type ResolveCtx } from './resolve.ts';
import { joinPath, posixDirname, sha } from './util.ts';

const require = createRequire(import.meta.url);
const TAILWIND_DIR = path.dirname(require.resolve('tailwindcss/package.json'));

/** Client fallback list (`PROJECT_CSS_ENTRY_CANDIDATES`). */
export const CSS_ENTRY_CANDIDATES = ['app/globals.css', 'src/app/globals.css', 'src/globals.css', 'styles/globals.css', 'src/index.css', 'src/styles.css'];
const DEFAULT_ENTRY = '@import "tailwindcss";\n';

export function findCssEntry(files: Map<string, string>): string | null {
  for (const c of CSS_ENTRY_CANDIDATES) if (files.has(c)) return c;
  const paths = [...files.keys()].filter((p) => p.endsWith('.css') && !p.includes('node_modules/')).sort();
  return paths.find((p) => /@import\s+(url\()?\s*["']tailwindcss["']/.test(files.get(p)!)) ?? null;
}

// ---------------------------------------------------------------- candidates

const candidateCache = new Map<string, string[]>();

/** Tailwind candidates in a piece of content (cached by content hash). */
export function scanCandidates(content: string, extension: string): string[] {
  const key = `${extension}:${sha(content, 32)}`;
  const hit = candidateCache.get(key);
  if (hit) return hit;
  // A fresh Scanner per call: oxide's Scanner is stateful and scanFiles() only returns
  // candidates it has not returned before, so a shared instance dropped every class
  // already seen in another file/project and those utilities never reached the CSS.
  const found = new Scanner({ sources: [] }).scanFiles([{ content, extension }]);
  if (candidateCache.size > 20000) candidateCache.clear();
  candidateCache.set(key, found);
  return found;
}

// ---------------------------------------------------------------- remote CSS (npm packages)

const remoteCss = new Map<string, Promise<string | null>>();

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), redirect: 'follow' });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Loads a stylesheet from an npm package via jsDelivr, honouring `style` exports. */
function loadNpmCss(name: string, version: string, sub: string): Promise<string | null> {
  const key = `${name}@${version}${sub}`;
  let p = remoteCss.get(key);
  if (!p) {
    p = (async () => {
      const root = `https://cdn.jsdelivr.net/npm/${name}@${version || 'latest'}`;
      let file = sub.replace(/^\//, '');
      if (!file || !/\.css$/.test(file)) {
        const pkg = JSON.parse((await fetchText(`${root}/package.json`)) ?? '{}');
        const exp = pkg.exports?.[file ? `./${file}` : '.'];
        const pick = (e: any): string | undefined => (typeof e === 'string' ? e : e && typeof e === 'object' ? pick(e.style ?? e.default ?? e.import) : undefined);
        file = (pick(exp) ?? (file ? `${file}.css` : pkg.style ?? (String(pkg.main ?? '').endsWith('.css') ? pkg.main : 'index.css'))).replace(/^\.\//, '');
      }
      return fetchText(`${root}/${file}`);
    })();
    remoteCss.set(key, p);
  }
  return p;
}

// ---------------------------------------------------------------- per-file preprocessing

const REMOTE_IMPORT = /@import\s+(?:url\(\s*)?(["']?)(https?:\/\/[^"')\s]+)\1\s*\)?[^;]*;/gi;

/** Pulls remote `@import url(https://…)` into fontUrls and makes `url()` references absolute. */
function preprocess(css: string, filePath: string, projectId: string, fontUrls: string[]) {
  let out = css.replace(REMOTE_IMPORT, (_m, _q, url: string) => {
    if (!fontUrls.includes(url)) fontUrls.push(url);
    return '';
  });
  out = out.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (m, q: string, ref: string) => {
    const r = ref.trim();
    if (!r || /^(data:|https?:|blob:|#|var\(|about:)/i.test(r) || r.startsWith('%23')) return m;
    const clean = r.replace(/[?#].*$/, '');
    const target = r.startsWith('/') ? clean.slice(1) : joinPath(posixDirname(filePath), clean);
    if (target === null) return m;
    return `url(${q || '"'}${assetUrl(projectId, target)}${q || '"'})`;
  });
  return out;
}

// ---------------------------------------------------------------- compile

export type CssBuild = { css: string; fontUrls: string[]; compiledClasses: string[]; warnings: string[] };

function unescapeCss(s: string) {
  return s.replace(/\\([0-9a-fA-F]{1,6}\s?|[\s\S])/g, (_m, e: string) => (/^[0-9a-fA-F]/.test(e) ? String.fromCodePoint(parseInt(e.trim(), 16)) : e));
}

const CLASS_TOKEN = /\.((?:-?(?:[_a-zA-Z -￿]|\\[0-9a-fA-F]{1,6}\s?|\\[^\n0-9a-fA-F]))(?:[\w -￿-]|\\[0-9a-fA-F]{1,6}\s?|\\[^\n0-9a-fA-F])*)/g;

/** Class names that appear in selectors of the compiled stylesheet. */
function selectorClasses(css: string): Set<string> {
  const out = new Set<string>();
  for (const m of css.matchAll(/([^{};]+)\{/g)) {
    const sel = m[1];
    if (sel.trimStart().startsWith('@') && !sel.includes('.')) continue;
    for (const c of sel.matchAll(CLASS_TOKEN)) out.add(unescapeCss(c[1]));
  }
  return out;
}

export async function buildCss(ctx: ResolveCtx, candidates: Set<string>): Promise<CssBuild> {
  const warnings: string[] = [];
  const fontUrls: string[] = [];
  const entry = findCssEntry(ctx.files);
  const entryCss = entry ? preprocess(ctx.files.get(entry)!, entry, ctx.projectId, fontUrls) : DEFAULT_ENTRY;

  const loadStylesheet = async (id: string, base: string) => {
    // Tailwind's own stylesheets.
    if (base.startsWith('npm:tailwindcss') || id === 'tailwindcss' || id.startsWith('tailwindcss/')) {
      let rel = id === 'tailwindcss' ? 'index.css' : id.startsWith('tailwindcss/') ? id.slice('tailwindcss/'.length) : id;
      if (!rel.endsWith('.css')) rel += '.css';
      const file = path.join(TAILWIND_DIR, path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, ''));
      return { path: file, base: 'npm:tailwindcss', content: fs.readFileSync(file, 'utf8') };
    }
    if (base.startsWith('npm:')) {
      // Relative import inside a fetched package stylesheet.
      const [, pkgBase] = base.split('npm:');
      const url = new URL(id, `https://cdn.jsdelivr.net/npm/${pkgBase}/`).toString();
      return { path: url, base, content: (await fetchText(url)) ?? '' };
    }
    const fromDir = base.replace(/^project:/, '');
    const candidatesFor = localCandidates(id, fromDir ? `${fromDir}/_` : '_', ctx);
    if (candidatesFor) {
      const hit = candidatesFor.map((c) => probe(c, ctx.files, ['.css'])).find(Boolean);
      if (!hit) {
        warnings.push(`Could not resolve stylesheet "${id}"`);
        return { path: id, base, content: '' };
      }
      return { path: hit, base: `project:${posixDirname(hit)}`, content: preprocess(ctx.files.get(hit)!, hit, ctx.projectId, fontUrls) };
    }
    // CSS treats `@import "x.css"` as relative; prefer a project file when one exists.
    const rel = joinPath(fromDir, id);
    const relHit = rel !== null ? probe(rel, ctx.files, ['.css']) : null;
    if (relHit && relHit.endsWith('.css')) {
      return { path: relHit, base: `project:${posixDirname(relHit)}`, content: preprocess(ctx.files.get(relHit)!, relHit, ctx.projectId, fontUrls) };
    }
    // Bare npm stylesheet (e.g. "tw-animate-css").
    const parts = id.split('/');
    const n = id.startsWith('@') ? 2 : 1;
    const name = parts.slice(0, n).join('/');
    const sub = parts.length > n ? '/' + parts.slice(n).join('/') : '';
    const version = (ctx.deps[name] ?? '').replace(/^[\^~]/, '').replace(/\s+/g, '');
    const content = await loadNpmCss(name, /^[\w.-]+$/.test(version) ? version : '', sub);
    if (content === null) warnings.push(`Could not load stylesheet "${id}"`);
    return { path: id, base: `npm:${name}@${version || 'latest'}${posixDirname(sub)}`, content: content ?? '' };
  };

  const loadModule = async (id: string, base: string, hint: 'plugin' | 'config') => {
    // Project JS (plugins/configs) is never executed server-side.
    warnings.push(`Ignored @${hint} "${id}"`);
    return { path: id, base, module: hint === 'plugin' ? () => {} : {} };
  };

  const run = async (css: string, base: string) => {
    const compiler = await compile(css, { base, loadStylesheet, loadModule });
    return compiler.build([...candidates]);
  };

  let raw: string;
  try {
    raw = await run(entryCss, `project:${entry ? posixDirname(entry) : ''}`);
  } catch (err) {
    warnings.push(`CSS compile failed for ${entry ?? 'default entry'}: ${(err as Error).message}`);
    raw = await run(DEFAULT_ENTRY, 'project:');
  }
  let css = raw;
  try {
    css = optimize(raw, { minify: false }).code;
  } catch {}
  const present = selectorClasses(css);
  const compiledClasses = [...candidates].filter((c) => present.has(c)).sort();
  return { css, fontUrls, compiledClasses, warnings };
}
