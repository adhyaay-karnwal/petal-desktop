import crypto from 'node:crypto';

export const sha = (s: string | Buffer, len = 64) => crypto.createHash('sha256').update(s).digest('hex').slice(0, len);

export const CODE_EXT = /\.(tsx|ts|jsx|js|mjs)$/;
export const CSS_EXT = /\.(css|scss|sass|less)$/;
export const ASSET_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|woff2?|ttf|otf|eot|mp4|webm|mov|m4v|ogv|mp3|wav|ogg|m4a|flac|aac|pdf|glb|gltf|hdr|wasm)$/i;

/** Project files the builder compiles to browser modules. */
export function isModulePath(p: string) {
  if (!CODE_EXT.test(p) || p.endsWith('.d.ts')) return false;
  return !p.split('/').some((seg) => seg === 'node_modules' || (seg.startsWith('.') && seg.length > 1));
}

export function posixDirname(p: string) {
  const i = p.lastIndexOf('/');
  return i === -1 ? '' : p.slice(0, i);
}

/** Joins and normalises project-relative POSIX paths; null when it escapes the root. */
export function joinPath(dir: string, rel: string): string | null {
  const out: string[] = dir ? dir.split('/').filter(Boolean) : [];
  for (const part of rel.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (!out.length) return null;
      out.pop();
    } else out.push(part);
  }
  return out.join('/');
}

/** Parses JSON with comments / trailing commas (tsconfig.json). */
export function parseJsonc(text: string): any {
  try {
    return JSON.parse(text);
  } catch {}
  try {
    return JSON.parse(stripComments(text).replace(/,(\s*[}\]])/g, '$1'));
  } catch {
    return null;
  }
}

/**
 * Replaces // and /* *\/ comments with spaces (newlines kept), leaving string
 * and template literal contents untouched. Regex literals are not detected.
 */
export function stripComments(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  const templateDepth: number[] = [];
  let braceDepth = 0;
  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      while (i < n && src[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      for (; i < stop; i++) out += src[i] === '\n' ? '\n' : ' ';
      continue;
    }
    if (ch === '"' || ch === "'") {
      const start = i;
      i++;
      while (i < n && src[i] !== ch && src[i] !== '\n') i += src[i] === '\\' ? 2 : 1;
      i++;
      out += src.slice(start, i);
      continue;
    }
    if (ch === '`' || (ch === '}' && templateDepth.length && templateDepth[templateDepth.length - 1] === braceDepth)) {
      if (ch === '}') templateDepth.pop();
      const start = i;
      i++;
      while (i < n && src[i] !== '`') {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '$' && src[i + 1] === '{') {
          i += 2;
          templateDepth.push(braceDepth);
          break;
        }
        i++;
      }
      if (src[i] === '`') i++;
      out += src.slice(start, i);
      continue;
    }
    if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    out += ch;
    i++;
  }
  return out;
}

const OPEN: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };
const CLOSERS = new Set([')', ']', '}', '>']);

/** Skips a string/template literal starting at i; returns index after it. */
export function skipString(src: string, i: number): number {
  const q = src[i];
  i++;
  if (q === '`') {
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') i += 2;
      else if (src[i] === '$' && src[i + 1] === '{') i = readBalanced(src, i + 1);
      else i++;
    }
    return i + 1;
  }
  while (i < src.length && src[i] !== q && src[i] !== '\n') i += src[i] === '\\' ? 2 : 1;
  return i + 1;
}

/**
 * Given src[i] an opening bracket, returns the index just after its matching
 * closer. Angle brackets count only when `angles` (type contexts); `=>` is not a closer.
 */
export function readBalanced(src: string, i: number, angles = src[i] === '<'): number {
  const stack: string[] = [];
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(src, i) - 1;
      continue;
    }
    if (ch in OPEN && (ch !== '<' || angles)) {
      stack.push(OPEN[ch]);
      continue;
    }
    if (CLOSERS.has(ch)) {
      if (ch === '>' && (!angles || src[i - 1] === '=')) continue;
      if (stack[stack.length - 1] === ch) stack.pop();
      else if (ch !== '>') stack.pop();
      if (!stack.length) return i + 1;
    }
  }
  return src.length;
}

/** Splits at top-level occurrences of any char in `seps` (brackets/strings respected). */
export function splitTopLevel(src: string, seps: string, angles = true): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(src, i) - 1;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{' || (angles && ch === '<')) depth++;
    else if (ch === ')' || ch === ']' || ch === '}' || (angles && ch === '>' && src[i - 1] !== '=')) depth--;
    else if (depth === 0 && seps.includes(ch)) {
      parts.push(src.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(src.slice(start));
  return parts;
}

/** Index of the first top-level `ch` in src, or -1. */
export function indexOfTopLevel(src: string, ch: string, angles = true): number {
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      i = skipString(src, i) - 1;
      continue;
    }
    if (c === '(' || c === '[' || c === '{' || (angles && c === '<')) depth++;
    else if (c === ')' || c === ']' || c === '}' || (angles && c === '>' && src[i - 1] !== '=')) depth--;
    else if (depth === 0 && c === ch) {
      if (ch === '=' && (src[i + 1] === '>' || src[i + 1] === '=' || src[i - 1] === '=' || src[i - 1] === '!' || src[i - 1] === '<' || src[i - 1] === '>')) continue;
      return i;
    }
  }
  return -1;
}

export function skipWs(src: string, i: number) {
  while (i < src.length && /\s/.test(src[i])) i++;
  return i;
}

export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
