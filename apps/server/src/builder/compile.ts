import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { decide, decisionKey, type Decision, type ResolveCtx } from './resolve.ts';
import { sha } from './util.ts';

/** Output of compiling one source file, before dependency URLs are known. */
export type CompiledFile = {
  sourceHash: string;
  /** ESM with `__LGDEP[path]__` placeholders for project-module imports. */
  code: string;
  deps: string[];
  cssImports: string[];
  exports: string[];
  error?: string;
  /** specifier → decision, to re-validate the cache when other files change. */
  decisions: Record<string, string>;
};

const PLACEHOLDER = (p: string) => `__LGDEP[${p}]__`;
export const PLACEHOLDER_RE = /__LGDEP\[([^\]]+)\]__/g;

const WORK_DIR = path.join(os.tmpdir(), 'petal-builder');
fs.mkdirSync(WORK_DIR, { recursive: true });

function loaderFor(p: string): esbuild.Loader {
  if (p.endsWith('.tsx')) return 'tsx';
  if (p.endsWith('.ts')) return 'ts';
  return 'jsx'; // .js/.jsx/.mjs may contain JSX in React projects
}

const ASSET_HELPER = 'const __lgAsset = (u) => { const r = globalThis.__LUNAGRAPH_RESOLVE_ASSET__; return typeof r === "function" ? r(u) : u; };\n';
const ROOT_ASSET_PROP = /\b(src|poster|srcSet|href)(\s*:\s*)"(\/[^"/\\][^"\\]*\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp|mp4|webm|mov|m4v|mp3|wav|ogg|pdf|woff2?|ttf|otf))"/g;

/** Rewrites root-relative asset strings in props (`src: "/hero.jpg"`) through window.__LUNAGRAPH_RESOLVE_ASSET__. */
function rewriteRootAssets(code: string) {
  let used = false;
  const out = code.replace(ROOT_ASSET_PROP, (_m, key: string, sep: string, url: string) => {
    if (key === 'href' && !/\.(pdf|png|jpe?g|webp|svg)$/i.test(url)) return _m;
    used = true;
    return `${key}${sep}__lgAsset(${JSON.stringify(url)})`;
  });
  if (!used) return code;
  // Keep directives first.
  const m = out.match(/^(\s*(?:(["'])use [a-z]+\2;?\s*)*)/);
  const head = m ? m[0] : '';
  return head + ASSET_HELPER + out.slice(head.length);
}

function formatErrors(filePath: string, errors: esbuild.Message[]) {
  return errors
    .slice(0, 5)
    .map((e) => (e.location ? `${filePath}:${e.location.line}:${e.location.column}: ${e.text}` : `${filePath}: ${e.text}`))
    .join('\n');
}

export type CompileOptions = {
  /** When set, project-module imports become this absolute URL instead of a placeholder (snapshot previews). */
  moduleUrl?: (path: string) => string | null;
};

/** Per-file compile: TS/JSX → browser ESM, imports rewritten per `decide`. */
export async function compileFile(filePath: string, source: string, ctx: ResolveCtx, opts: CompileOptions = {}): Promise<CompiledFile> {
  const decisions: Record<string, string> = {};
  const deps = new Set<string>();
  const cssImports: string[] = [];
  const missing: string[] = [];
  const base = { sourceHash: sha(source), decisions };

  const plugin: esbuild.Plugin = {
    name: 'petal-project',
    setup(b) {
      b.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return { path: filePath, namespace: 'lg' };
        const d: Decision = decide(args.path, filePath, ctx);
        decisions[args.path] = decisionKey(d);
        switch (d.kind) {
          case 'bare':
          case 'url':
            return { path: d.path, external: true };
          case 'module': {
            if (opts.moduleUrl) {
              const url = opts.moduleUrl(d.path);
              if (!url) {
                missing.push(`Module "${args.path}" (${d.path}) is not available`);
                return { path: args.path, namespace: 'lg-inline', pluginData: { contents: '', loader: 'js' } };
              }
              return { path: url, external: true };
            }
            deps.add(d.path);
            return { path: PLACEHOLDER(d.path), external: true };
          }
          case 'css':
            if (!cssImports.includes(d.specifier)) cssImports.push(d.specifier);
            return {
              path: `css:${args.path}`,
              namespace: 'lg-inline',
              pluginData: {
                contents: d.cssModule ? 'export default new Proxy({}, { get: (_, k) => (typeof k === "string" ? k : undefined) });' : '',
                loader: 'js',
              },
            };
          case 'inline':
            return { path: d.path, namespace: 'lg-inline', pluginData: { contents: ctx.files.get(d.path) ?? '', loader: d.loader } };
          case 'asset':
            return { path: `asset:${args.path}`, namespace: 'lg-inline', pluginData: { contents: `export default ${JSON.stringify(d.url)};`, loader: 'js' } };
          case 'missing':
            missing.push(`${d.message} from ${filePath}`);
            return { path: `missing:${args.path}`, namespace: 'lg-inline', pluginData: { contents: '', loader: 'js' } };
        }
      });
      b.onLoad({ filter: /.*/, namespace: 'lg' }, () => ({ contents: source, loader: loaderFor(filePath) }));
      b.onLoad({ filter: /.*/, namespace: 'lg-inline' }, (args) => args.pluginData);
    },
  };

  try {
    const result = await esbuild.build({
      entryPoints: ['entry'],
      absWorkingDir: WORK_DIR,
      bundle: true,
      write: false,
      metafile: true,
      outfile: 'out.js',
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      jsx: 'automatic',
      jsxImportSource: 'react',
      keepNames: true,
      charset: 'utf8',
      legalComments: 'none',
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
      plugins: [plugin],
    });
    const exportsList = Object.values(result.metafile.outputs)[0]?.exports ?? [];
    if (missing.length) {
      return { ...base, code: '', deps: [], cssImports, exports: exportsList, error: missing.join('\n') };
    }
    const code = rewriteRootAssets(result.outputFiles[0].text);
    return { ...base, code, deps: [...deps].sort(), cssImports, exports: exportsList };
  } catch (err) {
    const e = err as { errors?: esbuild.Message[]; message?: string };
    const error = e.errors?.length ? formatErrors(filePath, e.errors) : String(e.message ?? err);
    return { ...base, code: '', deps: [], cssImports, exports: [], error };
  }
}

/** Reusable when the source is unchanged and every import still resolves the same way. */
export function cacheValid(entry: CompiledFile | undefined, filePath: string, source: string, ctx: ResolveCtx): boolean {
  if (!entry || entry.sourceHash !== sha(source)) return false;
  for (const [spec, key] of Object.entries(entry.decisions)) if (decisionKey(decide(spec, filePath, ctx)) !== key) return false;
  return true;
}

export function errorModuleCode(filePath: string, error: string) {
  return `throw new Error(${JSON.stringify(`Failed to compile ${filePath}:\n${error}`)});\n`;
}
