/**
 * Component index + props scan without a TypeScript compiler. Exports come
 * from esbuild's metafile; declarations, prop types (interfaces, type
 * aliases, intersections, Omit/Pick/Partial, cva/tv `VariantProps`, local
 * type imports) and destructuring defaults are read with a bracket-aware
 * scanner over the comment-stripped source.
 */
import { indexOfTopLevel, readBalanced, skipString, skipWs, splitTopLevel, stripComments } from './util.ts';

export type PropInfo = { type: string; required: boolean; default?: unknown };
export type FoundComponent = {
  name: string;
  exportName: string;
  props: Record<string, PropInfo>;
  inspectsChildren: boolean;
};
/** Loads a project file imported by `fromPath` (used to follow type imports). */
export type TypeLoader = (spec: string, fromPath: string) => { path: string; source: string } | null;

type Scope = { path: string; src: string };
type Member = { type: string; optional: boolean; default?: unknown };
type Members = Map<string, Member>;

const PASCAL = /^[A-Z][A-Za-z0-9_]*$/;
const NEXT_SPECIAL = /(^|\/)(layout|template|route|middleware|instrumentation|global-error|not-found|error|loading|default|_app|_document)\.[jt]sx?$/;
const CHILD_INSPECTION = /\b(Children\s*\.\s*(map|toArray|forEach|only|count)|cloneElement|isValidElement)\b/;
const esc = (s: string) => s.replace(/[$]/g, '\\$');

export function isIndexableFile(filePath: string) {
  return !NEXT_SPECIAL.test(filePath) && !/\.(test|spec|stories)\.[jt]sx?$/.test(filePath) && !/(^|\/)[^/]*\.config\.[jt]s$/.test(filePath);
}

function pascalFromPath(filePath: string) {
  const parts = filePath.replace(/\.[^.\/]+$/, '').split('/');
  let base = parts.pop() ?? 'Component';
  if ((base === 'index' || base === 'page') && parts.length) base = parts.pop()! + (base === 'page' ? 'Page' : '');
  const name = base.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return /^[A-Z]/.test(name) ? name : `Component${name}`;
}

// ------------------------------------------------------------------ literals

function parseLiteral(text: string | undefined): unknown {
  if (text === undefined) return undefined;
  const t = text.trim();
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return Number(t);
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null') return null;
  if (/^'([^'\\]|\\.)*'$/.test(t)) return t.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  if (/^"([^"\\]|\\.)*"$/.test(t)) {
    try {
      return JSON.parse(t);
    } catch {
      return t.slice(1, -1);
    }
  }
  if (/^`[^`$]*`$/.test(t)) return t.slice(1, -1);
  try {
    return JSON.parse(t.replace(/'/g, '"'));
  } catch {
    return undefined;
  }
}

function typeOfLiteral(v: unknown): string {
  if (typeof v === 'string') return 'string';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  if (Array.isArray(v)) return 'any[]';
  return 'any';
}

const normType = (t: string) => t.replace(/\s+/g, ' ').trim().replace(/^\|\s*/, '').replace(/[;,]$/, '').slice(0, 400);
const stripQuotes = (k: string) => k.trim().replace(/^(['"])(.*)\1$/, '$2');

function isFunctionType(t: string) {
  const members = splitTopLevel(t, '|').map((m) => m.trim()).filter((m) => m && m !== 'undefined' && m !== 'null');
  return members.length > 0 && members.every((m) => /^(\(.*\)|<.*>\s*\(.*\))\s*=>/s.test(m) || /^(\w+\.)*\w*(EventHandler|Function|Dispatch|SetStateAction)\b/.test(m));
}

// ------------------------------------------------------------------ object literals (cva)

function objectEntries(text: string): Map<string, string> {
  const out = new Map<string, string>();
  const t = text.trim();
  if (!t.startsWith('{')) return out;
  for (const e of splitTopLevel(t.slice(1, t.lastIndexOf('}')), ',', false)) {
    const c = indexOfTopLevel(e, ':', false);
    if (c === -1) continue;
    out.set(stripQuotes(e.slice(0, c)), e.slice(c + 1).trim());
  }
  return out;
}

function cvaMembers(scope: Scope, name: string, load: TypeLoader, depth: number): Members {
  const out: Members = new Map();
  const found = findInScope(scope, name, load, depth, (s) => {
    const m = new RegExp(`(?:^|[^\\w$.])(?:const|let|var)\\s+${esc(name)}\\s*=\\s*(?:\\w+\\.)?(cva|tv)\\s*\\(`).exec(s.src);
    return m ? { s, m } : null;
  });
  if (!found) return out;
  const { s, m } = found;
  const open = m.index + m[0].length - 1;
  const args = splitTopLevel(s.src.slice(open + 1, readBalanced(s.src, open, false) - 1), ',', false);
  const config = objectEntries((m[1] === 'tv' ? args[0] : args[1]) ?? '');
  const variants = objectEntries(config.get('variants') ?? '');
  const defaults = objectEntries(config.get('defaultVariants') ?? '');
  for (const [key, value] of variants) {
    const options = [...objectEntries(value).keys()];
    if (!options.length) continue;
    const isBool = options.every((o) => o === 'true' || o === 'false');
    const def = parseLiteral(defaults.get(key));
    out.set(key, {
      type: isBool ? 'boolean' : options.map((o) => JSON.stringify(o)).join(' | '),
      optional: true,
      ...(def !== undefined ? { default: def } : {}),
    });
  }
  return out;
}

// ------------------------------------------------------------------ type resolution

/** Looks for a declaration in this file or, via `import { X } from "./local"`, in another project file. */
function findInScope<T>(scope: Scope, name: string, load: TypeLoader, depth: number, match: (s: Scope, name: string) => T | null): T | null {
  const local = match(scope, name);
  if (local || depth > 6) return local;
  for (const m of scope.src.matchAll(/import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
    for (const part of m[1].split(',')) {
      const [orig, alias] = part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).map((x) => x.trim());
      if ((alias ?? orig) !== name || !orig) continue;
      const target = load(m[2], scope.path);
      if (!target) return null;
      return findExported({ path: target.path, src: stripComments(target.source) }, orig, load, depth + 1, match);
    }
  }
  return null;
}

function findExported<T>(scope: Scope, name: string, load: TypeLoader, depth: number, match: (s: Scope, name: string) => T | null): T | null {
  const hit = findInScope(scope, name, load, depth, match);
  if (hit || depth > 6) return hit;
  for (const m of scope.src.matchAll(/export\s+(?:type\s+)?(?:\*|\{([^}]*)\})\s*from\s*["']([^"']+)["']/g)) {
    let orig = name;
    if (m[1] !== undefined) {
      const entry = m[1].split(',').map((p) => p.replace(/^\s*type\s+/, '').split(/\s+as\s+/).map((x) => x.trim())).find(([o, a]) => (a ?? o) === name);
      if (!entry) continue;
      orig = entry[0];
    }
    const target = load(m[2], scope.path);
    if (!target) continue;
    const r = findExported({ path: target.path, src: stripComments(target.source) }, orig, load, depth + 1, match);
    if (r) return r;
  }
  return null;
}

type TypeDecl = { s: Scope; kind: 'interface'; extendsList: string[]; body: string } | { s: Scope; kind: 'alias'; rhs: string };

const DECL_START = /^\s*(export|const|let|var|function|type|interface|import|class|declare|enum|default|async|@|\}|\))/;

function matchTypeDecl(s: Scope, name: string): TypeDecl | null {
  const src = s.src;
  const iface = new RegExp(`(?:^|[^\\w$.])interface\\s+${esc(name)}\\b`).exec(src);
  if (iface) {
    let i = skipWs(src, iface.index + iface[0].length);
    if (src[i] === '<') i = skipWs(src, readBalanced(src, i, true));
    let extendsList: string[] = [];
    const brace = src.indexOf('{', i);
    if (brace === -1) return null;
    const head = src.slice(i, brace).trim();
    if (head.startsWith('extends')) extendsList = splitTopLevel(head.slice(7), ',').map((x) => x.trim()).filter(Boolean);
    const end = readBalanced(src, brace, false);
    return { s, kind: 'interface', extendsList, body: src.slice(brace + 1, end - 1) };
  }
  const alias = new RegExp(`(?:^|[^\\w$.])type\\s+${esc(name)}\\b\\s*(<)?`).exec(src);
  if (alias) {
    let i = alias.index + alias[0].length;
    if (alias[1]) i = readBalanced(src, i - 1, true);
    i = skipWs(src, i);
    if (src[i] !== '=') return null;
    i++;
    const start = i;
    let depth = 0;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        i = skipString(src, i) - 1;
        continue;
      }
      if ('([{<'.includes(ch)) depth++;
      else if (')]}'.includes(ch) || (ch === '>' && src[i - 1] !== '=')) depth--;
      if (depth < 0) break;
      if (depth === 0 && ch === ';') break;
      if (depth === 0 && ch === '\n') {
        const rest = src.slice(i + 1, i + 40);
        const soFar = src.slice(start, i).trim();
        if (soFar && !/[|&=:?,<(]$/.test(soFar) && !/^\s*[|&?:]/.test(rest) && DECL_START.test(rest)) break;
      }
    }
    return { s, kind: 'alias', rhs: src.slice(start, i) };
  }
  return null;
}

function parseMembers(body: string): Members {
  const out: Members = new Map();
  const src = body;
  let i = 0;
  while (i < src.length) {
    i = skipWs(src, i);
    while (src[i] === ';' || src[i] === ',') i = skipWs(src, i + 1);
    if (i >= src.length) break;
    if (src.startsWith('readonly ', i)) i = skipWs(src, i + 9);
    let key = '';
    if (src[i] === '[') {
      i = readBalanced(src, i, false); // index signature / computed key → skip
    } else if (src[i] === '"' || src[i] === "'") {
      const end = skipString(src, i);
      key = src.slice(i + 1, end - 1);
      i = end;
    } else {
      const m = /^[A-Za-z_$][\w$-]*/.exec(src.slice(i));
      if (!m) {
        i++;
        continue;
      }
      key = m[0];
      i += key.length;
    }
    i = skipWs(src, i);
    let optional = false;
    if (src[i] === '?') {
      optional = true;
      i = skipWs(src, i + 1);
    }
    let prefix = '';
    if (src[i] === '(' || src[i] === '<') {
      // Method signature: name(args): ret → "(args) => ret"
      const gEnd = src[i] === '<' ? readBalanced(src, i, true) : i;
      const pEnd = readBalanced(src, gEnd, false);
      prefix = src.slice(i, pEnd) + ' => ';
      i = skipWs(src, pEnd);
    }
    if (src[i] !== ':') {
      // Malformed or call signature; skip to next separator.
      const next = indexOfTopLevel(src.slice(i), ';');
      i = next === -1 ? src.length : i + next + 1;
      continue;
    }
    i++;
    const start = i;
    let depth = 0;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        i = skipString(src, i) - 1;
        continue;
      }
      if ('([{<'.includes(ch)) depth++;
      else if (')]}'.includes(ch) || (ch === '>' && src[i - 1] !== '=')) depth--;
      if (depth === 0 && (ch === ';' || ch === ',')) break;
      if (depth === 0 && ch === '\n') {
        const soFar = src.slice(start, i).trim();
        const rest = src.slice(i + 1);
        if (soFar && !/[|&=:?,<(]$/.test(soFar) && !/^\s*[|&?:=]/.test(rest) && /^\s*(readonly\s+)?(['"]?[\w$-]+['"]?)\s*\??\s*[:(<]/.test(rest)) break;
      }
    }
    const type = normType(prefix + src.slice(start, i));
    if (key) out.set(key, { type, optional: optional || /\|\s*undefined\b/.test(type) });
    i++;
  }
  return out;
}

const IGNORED_GENERIC = /^(React\.)?(ComponentProps|ComponentPropsWithoutRef|ComponentPropsWithRef|HTMLAttributes|HTMLProps|[A-Z]\w*HTMLAttributes|SVGProps|SVGAttributes|AllHTMLAttributes|DetailedHTMLProps|AriaAttributes|DOMAttributes|RefAttributes|ElementRef|ComponentRef)\b/;

function resolveType(typeText: string, scope: Scope, load: TypeLoader, depth: number): Members {
  const out: Members = new Map();
  let t = typeText.trim();
  if (!t || depth > 8) return out;
  while (t.startsWith('(') && readBalanced(t, 0, false) === t.length) t = t.slice(1, -1).trim();
  const merge = (m: Members, forceOptional = false) => {
    for (const [k, v] of m) out.set(k, forceOptional ? { ...v, optional: true } : v);
  };

  const inter = splitTopLevel(t, '&').map((x) => x.trim()).filter(Boolean);
  if (inter.length > 1) {
    for (const part of inter) merge(resolveType(part, scope, load, depth + 1));
    return out;
  }
  const union = splitTopLevel(t, '|').map((x) => x.trim()).filter(Boolean);
  if (union.length > 1) {
    for (const part of union) merge(resolveType(part, scope, load, depth + 1), true);
    return out;
  }
  if (t.startsWith('{')) return parseMembers(t.slice(1, readBalanced(t, 0, false) - 1));

  const g = /^([A-Za-z_$][\w$.]*)\s*(<[\s\S]*>)?$/.exec(t);
  if (!g) return out;
  const name = g[1];
  const args = g[2] ? splitTopLevel(g[2].slice(1, -1), ',').map((x) => x.trim()) : [];
  const keysOf = (k: string | undefined) => new Set(splitTopLevel(k ?? '', '|').map((x) => stripQuotes(x)).filter(Boolean));
  const short = name.replace(/^React\./, '');
  switch (short) {
    case 'Omit': {
      const drop = keysOf(args[1]);
      for (const [k, v] of resolveType(args[0] ?? '', scope, load, depth + 1)) if (!drop.has(k)) out.set(k, v);
      return out;
    }
    case 'Pick': {
      const keep = keysOf(args[1]);
      for (const [k, v] of resolveType(args[0] ?? '', scope, load, depth + 1)) if (keep.has(k)) out.set(k, v);
      return out;
    }
    case 'Partial':
      merge(resolveType(args[0] ?? '', scope, load, depth + 1), true);
      return out;
    case 'Required':
      for (const [k, v] of resolveType(args[0] ?? '', scope, load, depth + 1)) out.set(k, { ...v, optional: false });
      return out;
    case 'Readonly':
    case 'PropsWithChildren':
    case 'PropsWithoutRef':
      return resolveType(args[0] ?? '', scope, load, depth + 1);
    case 'VariantProps': {
      const m = /^typeof\s+([\w$]+)/.exec(args[0] ?? '');
      return m ? cvaMembers(scope, m[1], load, depth) : out;
    }
  }
  if (IGNORED_GENERIC.test(name) || name.includes('.')) return out;
  const decl = findInScope(scope, name, load, depth, matchTypeDecl);
  if (!decl) return out;
  if (decl.kind === 'alias') return resolveType(decl.rhs, decl.s, load, depth + 1);
  for (const ext of decl.extendsList) merge(resolveType(ext, decl.s, load, depth + 1));
  merge(parseMembers(decl.body));
  return out;
}

// ------------------------------------------------------------------ declarations

type FnInfo = { params: string | null; typeHint: string | null; body: string };

function fnFromParens(src: string, open: number, typeHint: string | null): FnInfo {
  const close = readBalanced(src, open, false);
  const params = src.slice(open + 1, close - 1);
  let i = skipWs(src, close);
  // Optional return type annotation, then `=>` or `{`.
  if (src[i] === ':') {
    const arrow = src.indexOf('=>', i);
    const brace = src.indexOf('{', i);
    i = [arrow, brace].filter((x) => x !== -1).sort((a, b) => a - b)[0] ?? i;
  }
  if (src.startsWith('=>', i)) i = skipWs(src, i + 2);
  const body = src[i] === '{' ? src.slice(i, readBalanced(src, i, false)) : src.slice(i, i + 4000);
  return { params, typeHint, body };
}

/** Analyses a const initializer; returns null when it is not component-like. */
function analyzeInit(src: string, i: number, typeHint: string | null, depth = 0): FnInfo | 'alias' | null {
  if (depth > 4) return null;
  i = skipWs(src, i);
  if (src.startsWith('async', i) && /\s|\(/.test(src[i + 5] ?? '')) i = skipWs(src, i + 5);
  if (src.startsWith('function', i)) {
    const open = src.indexOf('(', i);
    return open === -1 ? null : fnFromParens(src, open, typeHint);
  }
  if (src[i] === '<') {
    const after = skipWs(src, readBalanced(src, i, true));
    return src[after] === '(' ? fnFromParens(src, after, typeHint) : null;
  }
  if (src[i] === '(') {
    const close = readBalanced(src, i, false);
    if (/^\s*(?::[^={;]+)?=>/.test(src.slice(close, close + 300))) return fnFromParens(src, i, typeHint);
    return null;
  }
  const ident = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/.exec(src.slice(i));
  if (!ident) return null;
  const id = ident[1];
  let j = skipWs(src, i + id.length);
  if (src.startsWith('=>', j)) {
    const body = src.slice(skipWs(src, j + 2), j + 4000);
    return { params: id, typeHint, body };
  }
  let generic: string[] = [];
  if (src[j] === '<') {
    const end = readBalanced(src, j, true);
    generic = splitTopLevel(src.slice(j + 1, end - 1), ',').map((x) => x.trim());
    j = skipWs(src, end);
  }
  if (src[j] === '(') {
    const wrapper = id.replace(/^React\./, '');
    if (wrapper === 'forwardRef' || wrapper === 'memo' || wrapper === 'observer') {
      const hint = wrapper === 'forwardRef' ? (generic[1] ?? null) : (generic[0] ?? null);
      const inner = analyzeInit(src, j + 1, hint ?? typeHint, depth + 1);
      return inner ?? 'alias';
    }
    return null;
  }
  // `const Dialog = DialogPrimitive.Root` / `const Button = BaseButton`
  const last = id.split('.').pop()!;
  return PASCAL.test(last) ? 'alias' : null;
}

function findDeclaration(src: string, name: string): FnInfo | 'alias' | null {
  const fn = new RegExp(`(?:^|[^\\w$.])function\\s*\\*?\\s+${esc(name)}\\s*(<)?`).exec(src);
  if (fn) {
    let i = fn.index + fn[0].length;
    if (fn[1]) i = readBalanced(src, i - 1, true);
    i = skipWs(src, i);
    return src[i] === '(' ? fnFromParens(src, i, null) : null;
  }
  const cls = new RegExp(`(?:^|[^\\w$.])class\\s+${esc(name)}\\s+extends\\s+(?:React\\.)?(?:Pure)?Component\\s*(<)?`).exec(src);
  if (cls) {
    let hint: string | null = null;
    if (cls[1]) {
      const start = cls.index + cls[0].length - 1;
      hint = splitTopLevel(src.slice(start + 1, readBalanced(src, start, true) - 1), ',')[0]?.trim() ?? null;
    }
    const brace = src.indexOf('{', cls.index + cls[0].length);
    return { params: null, typeHint: hint, body: brace === -1 ? '' : src.slice(brace, readBalanced(src, brace, false)) };
  }
  const v = new RegExp(`(?:^|[^\\w$.])(?:const|let|var)\\s+${esc(name)}\\b\\s*`).exec(src);
  if (v) {
    let i = v.index + v[0].length;
    let typeHint: string | null = null;
    if (src[i] === ':') {
      const rest = src.slice(i + 1);
      const eq = indexOfTopLevel(rest, '=');
      if (eq === -1) return null;
      const ann = rest.slice(0, eq).trim();
      const fc = /^(?:React\.)?(?:FC|FunctionComponent|VFC|ComponentType|ForwardRefRenderFunction)\s*<([\s\S]*)>$/.exec(ann);
      if (fc) {
        const parts = splitTopLevel(fc[1], ',').map((x) => x.trim());
        typeHint = ann.includes('ForwardRefRenderFunction') ? (parts[1] ?? null) : (parts[0] ?? null);
      }
      i = i + 1 + eq;
    }
    if (src[i] !== '=') return null;
    return analyzeInit(src, i + 1, typeHint);
  }
  return null;
}

// ------------------------------------------------------------------ props

function propsFor(info: FnInfo, scope: Scope, load: TypeLoader): Record<string, PropInfo> {
  let typeText: string | null = info.typeHint;
  const defaults = new Map<string, unknown>();
  const destructured: string[] = [];
  const first = info.params === null ? '' : splitTopLevel(info.params, ',')[0]?.trim() ?? '';
  if (first.startsWith('{')) {
    const end = readBalanced(first, 0, false);
    for (const entry of splitTopLevel(first.slice(1, end - 1), ',', false)) {
      const e = entry.trim();
      if (!e || e.startsWith('...')) continue;
      const eq = indexOfTopLevel(e, '=', false);
      const left = eq === -1 ? e : e.slice(0, eq);
      const colon = indexOfTopLevel(left, ':', false);
      const key = stripQuotes(colon === -1 ? left : left.slice(0, colon));
      if (!/^[\w$-]+$/.test(key)) continue;
      destructured.push(key);
      if (eq !== -1) {
        const lit = parseLiteral(e.slice(eq + 1));
        if (lit !== undefined) defaults.set(key, lit);
        else defaults.set(key, undefined);
      }
    }
    const rest = first.slice(end).trim();
    if (rest.startsWith(':')) {
      const ann = rest.slice(1);
      const eq = indexOfTopLevel(ann, '=');
      typeText = (eq === -1 ? ann : ann.slice(0, eq)).trim() || typeText;
    }
  } else if (first) {
    const m = /^[\w$]+\s*\??\s*:\s*([\s\S]+)$/.exec(first);
    if (m) {
      const eq = indexOfTopLevel(m[1], '=');
      typeText = (eq === -1 ? m[1] : m[1].slice(0, eq)).trim();
    }
  }

  const members = typeText ? resolveType(typeText, scope, load, 0) : new Map<string, Member>();
  const props: Record<string, PropInfo> = {};
  for (const [name, m] of members) {
    if (isFunctionType(m.type)) continue;
    const def = defaults.has(name) ? defaults.get(name) : m.default;
    props[name] = { type: m.type, required: !m.optional && !defaults.has(name), ...(def !== undefined ? { default: def } : {}) };
  }
  for (const name of destructured) {
    if (props[name] || members.has(name)) continue;
    const def = defaults.get(name);
    if (typeText && def === undefined) continue; // typed by an external (DOM) type
    props[name] = { type: def === undefined ? 'any' : typeOfLiteral(def), required: false, ...(def !== undefined ? { default: def } : {}) };
  }
  return props;
}

// ------------------------------------------------------------------ entry point

export function findComponents(filePath: string, source: string, exportNames: string[], load: TypeLoader): FoundComponent[] {
  if (!isIndexableFile(filePath)) return [];
  const src = stripComments(source);
  const scope: Scope = { path: filePath, src };
  const named = new Set(exportNames.filter((e) => e !== 'default'));
  const aliases = new Map<string, string>(); // exportName → localName
  for (const m of src.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) {
    for (const part of m[1].split(',')) {
      const [local, exported] = part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).map((x) => x.trim());
      if (local) aliases.set(exported ?? local, local);
    }
  }

  const targets: Array<{ name: string; exportName: string; local: string | null; anon?: number }> = [];
  for (const exp of named) {
    if (!PASCAL.test(exp)) continue;
    targets.push({ name: exp, exportName: exp, local: aliases.get(exp) ?? exp });
  }
  if (exportNames.includes('default')) {
    let local: string | null = null;
    let anon: number | undefined;
    const fnDecl = /export\s+default\s+(?:async\s+)?(function\s*\*?|class)\s*([A-Za-z_$][\w$]*)?/.exec(src);
    const wrapped = /export\s+default\s+(?:React\.)?(?:memo|forwardRef|observer)\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/.exec(src);
    const ident = /export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*(?:\n|$)/.exec(src);
    if (fnDecl?.[2]) local = fnDecl[2];
    else if (wrapped) local = wrapped[1];
    else if (ident && !['function', 'class', 'async'].includes(ident[1])) local = ident[1];
    else if (aliases.get('default')) local = aliases.get('default')!;
    else {
      const m = /export\s+default\s+/.exec(src);
      if (m) anon = m.index + m[0].length;
    }
    const alreadyNamed = local !== null && [...named].some((n) => (aliases.get(n) ?? n) === local);
    if (!alreadyNamed) {
      const name = local && PASCAL.test(local) ? local : pascalFromPath(filePath);
      if (!(local && !PASCAL.test(local) && !/^[a-z]/.test(local))) targets.push({ name, exportName: 'default', local, anon });
    }
  }

  const out: FoundComponent[] = [];
  for (const t of targets) {
    let info: FnInfo | 'alias' | null = null;
    try {
      if (t.local) info = findDeclaration(src, t.local);
      else if (t.anon !== undefined) {
        const head = src.slice(t.anon, t.anon + 20);
        info = /^(async\s+)?function\b/.test(head) ? analyzeInit(src, t.anon, null) : /^class\b/.test(head) ? 'alias' : analyzeInit(src, t.anon, null);
      }
    } catch {
      info = null;
    }
    if (!info) {
      // Default-exported lowercase helpers, constants, contexts etc. are not components.
      if (t.exportName === 'default' && t.local === null && t.anon === undefined) continue;
      if (!t.local || !/\.(t|j)sx$/.test(filePath)) continue;
      // Imported then re-exported locally (`import X from …; export { X }`) — skip.
      continue;
    }
    let props: Record<string, PropInfo> = {};
    let inspectsChildren = false;
    if (info !== 'alias') {
      try {
        props = propsFor(info, scope, load);
      } catch {
        props = {};
      }
      inspectsChildren = CHILD_INSPECTION.test(info.body);
    }
    out.push({ name: t.name, exportName: t.exportName, props, inspectsChildren });
  }
  return out;
}
