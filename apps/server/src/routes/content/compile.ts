import path from 'node:path';
import { transform } from 'esbuild';

const CODE_EXTS = ['.tsx', '.ts', '.jsx', '.js', '.mjs'];
const RESOLVE_EXTS = [...CODE_EXTS, '.css', '.json'];

function loaderFor(p: string): 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | null {
  const ext = path.posix.extname(p).toLowerCase();
  if (ext === '.tsx') return 'tsx';
  if (ext === '.ts' || ext === '.mts') return 'ts';
  if (ext === '.jsx') return 'jsx';
  if (ext === '.js' || ext === '.mjs') return 'jsx';
  if (ext === '.css') return 'css';
  if (ext === '.json') return 'json';
  return null;
}

/** Resolves a local specifier (`@/…`, `./…`, `../…`, `/…`) against the project's file paths. */
export function resolveLocalImport(fromPath: string, spec: string, paths: Set<string>): string | null | undefined {
  let bases: string[];
  if (spec.startsWith('@/')) bases = [spec.slice(2), `src/${spec.slice(2)}`];
  else if (spec.startsWith('./') || spec.startsWith('../')) bases = [path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), spec))];
  else if (spec.startsWith('/')) bases = [spec.slice(1)];
  else return undefined; // bare package import, not ours to resolve
  for (const base of bases) {
    const b = base.replace(/^\.\//, '');
    if (paths.has(b)) return b;
    for (const ext of RESOLVE_EXTS) if (paths.has(b + ext)) return b + ext;
    for (const ext of CODE_EXTS) if (paths.has(`${b}/index${ext}`)) return `${b}/index${ext}`;
  }
  return null;
}

function formatEsbuildError(err: unknown, filePath: string): string {
  const errors = (err as { errors?: Array<{ text: string; location?: { line: number; column: number; lineText?: string } | null }> }).errors;
  if (Array.isArray(errors) && errors.length) {
    return errors
      .slice(0, 5)
      .map((e) => (e.location ? `${filePath}:${e.location.line}:${e.location.column}: ${e.text}${e.location.lineText ? `\n  ${e.location.lineText.trim()}` : ''}` : `${filePath}: ${e.text}`))
      .join('\n');
  }
  return err instanceof Error ? err.message : String(err);
}

/**
 * Compiles a module the way the builder would (esbuild, automatic JSX) and
 * checks that local imports point at files that exist in the project.
 */
export async function validateCompile(filePath: string, content: string, projectPaths: Iterable<string>): Promise<{ ok: true } | { ok: false; error: string }> {
  const loader = loaderFor(filePath) ?? 'tsx';
  let code: string;
  try {
    const out = await transform(content, { loader, jsx: 'automatic', format: 'esm', sourcefile: filePath, logLevel: 'silent' });
    code = out.code;
  } catch (err) {
    return { ok: false, error: formatEsbuildError(err, filePath) };
  }
  if (loader === 'css' || loader === 'json') return { ok: true };
  const paths = new Set(projectPaths);
  paths.add(filePath);
  const specs = new Set<string>();
  const re = /(?:^|[\s;])(?:import|export)\s*(?:[^'";]*?\sfrom\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of code.matchAll(re)) specs.add(m[1] ?? m[2]);
  const unresolved: string[] = [];
  for (const spec of specs) {
    const ext = path.posix.extname(spec.split('?')[0]).toLowerCase();
    // Images/fonts/etc. live in the asset store; only check code + css modules.
    if (ext && !RESOLVE_EXTS.includes(ext)) continue;
    if (resolveLocalImport(filePath, spec, paths) === null) unresolved.push(spec);
  }
  if (unresolved.length) return { ok: false, error: `${filePath}: cannot resolve import${unresolved.length > 1 ? 's' : ''} ${unresolved.map((s) => `"${s}"`).join(', ')} (no such file in the project)` };
  return { ok: true };
}
