/**
 * Save-to-code: turns an edited canvas snapshot (FEElement tree / StoreWireV2)
 * back into the component's source file.
 *
 * Deterministic path (always available): reuses the recovered compiler
 * codegen (ensureV2 → generateJSX, dependency + import mapping) from the
 * desktop clone, then splices the generated JSX into the target component's
 * final `return (...)` with Babel positions and adds any missing imports.
 *
 * LLM path: the original server's merge prompt, run through the Anthropic
 * Messages API when ANTHROPIC_API_KEY is set, otherwise through the local
 * `claude` CLI (`claude -p`, the user's Claude subscription) when it is
 * installed. Output is import-repaired and validated (parse + exports +
 * compile), retried, and falls back to the deterministic merge on any failure.
 *
 * Who merges: the desktop's `save_file` IPC defaults to SAVE_TO_CODE_MODE=api,
 * which forwards to this route and does no merge itself. With
 * SAVE_TO_CODE_MODE=cli the desktop merges locally with the CLI and PATCHes
 * the file, never calling this route — so a snapshot is merged exactly once.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ANTHROPIC_API_KEY } from '../../env.ts';
import { findExecutable, run } from '../../lib/bin.ts';
import { validateCompile } from './compile.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Desktop source root holding the compiler modules; PETAL_DESKTOP_SRC is set by the bundled (embedded) build. */
const desktopSrc = process.env.PETAL_DESKTOP_SRC || path.resolve(here, '../../../../desktop/src');
const RENDERER_COMPILER = process.env.LUNACLONE_COMPILER_DIR || path.join(desktopSrc, 'renderer/src/packages/compiler/src');
const MAIN_COMPILER = path.join(desktopSrc, 'main/packages/compiler/src');

export const MERGE_FAILED_MESSAGE = "The AI couldn't apply this edit to the component. Try again, or undo and make a smaller change.";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyNode = any;
type Compiler = {
  ensureV2: (raw: unknown) => any;
  generateJSX: (store: any, indent?: number, options?: Record<string, unknown>) => string;
  getRootIds: (store: any) => string[];
  extractComponentDependencies: (store: any) => Set<string>;
  extractIconDependencies: (store: any) => Map<string, Set<string>>;
  getComponentImportMappings: (names: Iterable<string>, index: Record<string, unknown>, target?: string, opts?: { preferAlias?: boolean }) => ImportMapping[];
  getIconImportMappings: (icons: Map<string, Set<string>>) => ImportMapping[];
  parse: (code: string, opts: Record<string, unknown>) => AnyNode;
};
export type ImportMapping = { component: string; importPath: string; isDefault?: boolean };

let compilerPromise: Promise<Compiler> | null = null;
const load = (file: string): Promise<any> => import(pathToFileURL(file).href);

export function loadCompiler(): Promise<Compiler> {
  compilerPromise ??= (async () => {
    if (!fs.existsSync(RENDERER_COMPILER)) throw new Error(`Compiler modules not found at ${RENDERER_COMPILER}`);
    const [ensure, gen, read, deps, babel] = await Promise.all([
      load(path.join(RENDERER_COMPILER, 'store/ensureV2.js')),
      load(path.join(RENDERER_COMPILER, 'codegen/generateJSX.js')),
      load(path.join(RENDERER_COMPILER, 'store/read.js')),
      load(path.join(RENDERER_COMPILER, 'codegen/extractDependencies.js')),
      load(path.join(RENDERER_COMPILER, 'runtime/stampMapHosts.js')),
    ]);
    // The main-process build of generateImports has the save-to-code mapping helpers and no deps.
    const imports = await load(path.join(MAIN_COMPILER, 'codegen/generateImports.js'));
    return {
      ensureV2: ensure.ensureV2,
      generateJSX: gen.generateJSX,
      getRootIds: read.getRootIds,
      extractComponentDependencies: deps.extractComponentDependencies,
      extractIconDependencies: deps.extractIconDependencies,
      getComponentImportMappings: imports.getComponentImportMappings,
      getIconImportMappings: imports.getIconImportMappings,
      parse: (code, opts) => babel.import_lib.parse(code, opts),
    };
  })();
  compilerPromise.catch(() => (compilerPromise = null));
  return compilerPromise;
}

const PARSE_OPTS = { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: false };

// ------------------------------------------------------------ AST helpers

function unwrapExpr(node: AnyNode): AnyNode {
  while (node && (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression' || node.type === 'ParenthesizedExpression' || node.type === 'TSNonNullExpression')) node = node.expression;
  return node;
}
function unwrapFn(node: AnyNode): AnyNode | null {
  node = unwrapExpr(node);
  if (!node) return null;
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return node;
  if (node.type === 'CallExpression') for (const a of node.arguments) { const f = unwrapFn(a); if (f) return f; } // memo(), forwardRef()
  return null;
}
const isJsx = (n: AnyNode) => !!n && (n.type === 'JSXElement' || n.type === 'JSXFragment');

type ComponentDef = { name: string | null; fn: AnyNode; exported: boolean; isDefault: boolean };

function collectTopLevel(program: AnyNode) {
  const defs: ComponentDef[] = [];
  const declared = new Set<string>();
  const exportedNames = new Set<string>();
  let defaultName: string | null = null;
  for (const stmt of program.body) {
    if (stmt.type === 'ImportDeclaration') {
      for (const s of stmt.specifiers) declared.add(s.local.name);
      continue;
    }
    if (stmt.type === 'ExportNamedDeclaration' && !stmt.declaration) {
      for (const s of stmt.specifiers ?? []) if (s.local?.name) exportedNames.add(s.local.name);
      continue;
    }
    const isExport = stmt.type === 'ExportNamedDeclaration' || stmt.type === 'ExportDefaultDeclaration';
    const isDefault = stmt.type === 'ExportDefaultDeclaration';
    const decl = isExport ? stmt.declaration : stmt;
    if (!decl) continue;
    if (isDefault && decl.type === 'Identifier') { defaultName = decl.name; continue; }
    if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
      const name = decl.id?.name ?? null;
      if (name) declared.add(name);
      if (decl.type === 'FunctionDeclaration') defs.push({ name, fn: decl, exported: isExport, isDefault });
    } else if (decl.type === 'VariableDeclaration') {
      for (const d of decl.declarations) {
        if (d.id?.type !== 'Identifier') continue;
        declared.add(d.id.name);
        const fn = unwrapFn(d.init);
        if (fn) defs.push({ name: d.id.name, fn, exported: isExport, isDefault: false });
      }
    } else if (isDefault) {
      const fn = unwrapFn(decl);
      if (fn) defs.push({ name: null, fn, exported: true, isDefault: true });
    } else if (decl.type === 'TSEnumDeclaration' || decl.type === 'TSTypeAliasDeclaration' || decl.type === 'TSInterfaceDeclaration') {
      if (decl.id?.name) declared.add(decl.id.name);
    }
  }
  for (const d of defs) {
    if (d.name && exportedNames.has(d.name)) d.exported = true;
    if (d.name && d.name === defaultName) { d.exported = true; d.isDefault = true; }
  }
  return { defs, declared };
}

/** The node whose source range holds the component's rendered JSX (last JSX return). */
function findRenderTarget(fn: AnyNode): { node: AnyNode; anchor: AnyNode } | null {
  if (fn.body?.type !== 'BlockStatement') {
    const body = unwrapExpr(fn.body);
    return isJsx(body) ? { node: fn.body, anchor: fn.body } : null;
  }
  let found: { node: AnyNode; anchor: AnyNode } | null = null;
  const visit = (node: AnyNode) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (typeof node.type !== 'string') return;
    if (node !== fn.body && (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' || node.type === 'ClassMethod' || node.type === 'ObjectMethod')) return;
    if (node.type === 'ReturnStatement' && isJsx(unwrapExpr(node.argument))) {
      if (!found || node.start > found.anchor.start) found = { node: node.argument, anchor: node };
      return;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'extra' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue;
      const v = node[key];
      if (v && typeof v === 'object') visit(v);
    }
  };
  visit(fn.body);
  return found;
}

function pascal(s: string) {
  return s.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
}

function pickComponent(defs: ComponentDef[], names: (string | undefined)[]): ComponentDef | null {
  const withJsx = defs.filter((d) => findRenderTarget(d.fn));
  for (const n of names) {
    if (!n) continue;
    const hit = withJsx.find((d) => d.name === n) ?? withJsx.find((d) => d.name?.toLowerCase() === n.toLowerCase());
    if (hit) return hit;
  }
  return withJsx.find((d) => d.isDefault) ?? withJsx.find((d) => d.exported) ?? withJsx[0] ?? null;
}

type Edit = { from: number; to: number; text: string };
const applyEdits = (code: string, edits: Edit[]) =>
  [...edits].sort((a, b) => b.from - a.from).reduce((acc, e) => acc.slice(0, e.from) + e.text + acc.slice(e.to), code);

const lineIndent = (code: string, pos: number) => {
  const ls = code.lastIndexOf('\n', pos - 1) + 1;
  return (code.slice(ls, pos).match(/^[ \t]*/) ?? [''])[0];
};

/** Edits adding imports for mappings whose names are not yet bound in the file. */
function importEdits(code: string, program: AnyNode, declared: Set<string>, mappings: ImportMapping[]): Edit[] {
  const edits: Edit[] = [];
  const pending = new Map<string, { named: string[]; def?: string }>();
  const seen = new Set<string>();
  for (const m of mappings) {
    if (declared.has(m.component) || seen.has(m.component)) continue;
    seen.add(m.component);
    const g = pending.get(m.importPath) ?? { named: [] };
    if (m.isDefault) g.def = m.component;
    else g.named.push(m.component);
    pending.set(m.importPath, g);
  }
  if (!pending.size) return edits;
  const imports = program.body.filter((s: AnyNode) => s.type === 'ImportDeclaration');
  const newLines: string[] = [];
  for (const [source, g] of pending) {
    const existing = imports.find((s: AnyNode) => s.source.value === source && s.importKind !== 'type' && s.specifiers.some((sp: AnyNode) => sp.type === 'ImportSpecifier'));
    if (existing && g.named.length) {
      const specs = existing.specifiers.filter((sp: AnyNode) => sp.type === 'ImportSpecifier');
      edits.push({ from: specs[specs.length - 1].end, to: specs[specs.length - 1].end, text: `, ${g.named.join(', ')}` });
      g.named = [];
    }
    const clause = [g.def, g.named.length ? `{ ${g.named.sort().join(', ')} }` : null].filter(Boolean).join(', ');
    if (clause) newLines.push(`import ${clause} from '${source}'`);
  }
  if (newLines.length) {
    const text = newLines.sort().join('\n');
    if (imports.length) {
      const last = imports[imports.length - 1];
      edits.push({ from: last.end, to: last.end, text: `\n${text}` });
    } else {
      const directives = program.directives ?? [];
      if (directives.length) {
        const d = directives[directives.length - 1];
        edits.push({ from: d.end, to: d.end, text: `\n\n${text}` });
      } else {
        const start = program.body[0]?.start ?? 0;
        // Keep leading comments (license headers) above the imports.
        const insertAt = program.body[0]?.leadingComments?.[0]?.start ?? start;
        edits.push({ from: insertAt, to: insertAt, text: `${text}\n\n` });
      }
    }
  }
  return edits;
}

export function addMissingImports(compiler: Compiler, code: string, mappings: ImportMapping[]): string {
  let ast: AnyNode;
  try { ast = compiler.parse(code, PARSE_OPTS); } catch { return code; }
  const { declared } = collectTopLevel(ast.program);
  return applyEdits(code, importEdits(code, ast.program, declared, mappings));
}

// ------------------------------------------------------------ public API

export type SaveToCodeBody = {
  filePath?: string;
  elements?: unknown;
  stateContext?: { componentName?: string; instanceProps?: Record<string, unknown>; [k: string]: unknown };
  userInstructions?: string;
  componentIndex?: Record<string, { path: string; exportName: string; props?: unknown }>;
  suggestInstanceProps?: boolean;
  internalComponent?: { name: string; startLine: number; endLine: number };
};

type Prepared = {
  compiler: Compiler;
  generatedJSX: string;
  rootCount: number;
  mappings: ImportMapping[];
  unresolved: string[];
  targetNames: (string | undefined)[];
};

async function prepare(body: SaveToCodeBody, filePath: string, scanResult: Record<string, unknown>): Promise<Prepared> {
  const compiler = await loadCompiler();
  const store = compiler.ensureV2(body.elements ?? null);
  const roots = compiler.getRootIds(store);
  const generatedJSX = compiler.generateJSX(store, 0);
  const targetNames = [body.internalComponent?.name, body.stateContext?.componentName, pascal(path.posix.basename(filePath, path.posix.extname(filePath)))];
  const deps = compiler.extractComponentDependencies(store);
  for (const n of targetNames) if (n) deps.delete(n);
  const index = { ...scanResult, ...(body.componentIndex ?? {}) };
  const mappings = [...compiler.getComponentImportMappings(deps, index, undefined, { preferAlias: true }), ...compiler.getIconImportMappings(compiler.extractIconDependencies(store))];
  const mapped = new Set(mappings.map((m) => m.component));
  const unresolved = [...deps].filter((d) => !mapped.has(d));
  // A capture whose only child is a fragment/capture still yields one root expression.
  return { compiler, generatedJSX, rootCount: roots.length, mappings, unresolved, targetNames };
}

const jsxName = (n: AnyNode): string => {
  if (!n) return '';
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${jsxName(n.object)}.${jsxName(n.property)}`;
  if (n.type === 'JSXNamespacedName') return `${n.namespace.name}:${n.name.name}`;
  return '';
};
const significantChildren = (n: AnyNode): AnyNode[] =>
  (n.children ?? []).filter((ch: AnyNode) => !(ch.type === 'JSXText' && !ch.value.trim()) && !(ch.type === 'JSXExpressionContainer' && ch.expression?.type === 'JSXEmptyExpression'));
const KEEP_ATTR = (name: string) => /^on[A-Z]/.test(name) || name === 'ref' || name === 'key';

/**
 * The snapshot is a *rendered* tree: expressions were evaluated and event
 * handlers dropped. Walk the original JSX and the generated JSX in parallel
 * (same tag at the same position) and carry back what the canvas cannot
 * represent: event handlers/ref/key/spread attributes, and `{expr}` children
 * whose rendered text is unchanged (e.g. `{title}` rendered as "Pro").
 */
function reattachDynamics(compiler: Compiler, jsx: string, original: AnyNode, originalCode: string, instanceProps: Record<string, unknown>): string {
  const wrapped = `<>${jsx}</>`;
  let gen: AnyNode;
  try {
    gen = compiler.parse(wrapped, PARSE_OPTS).program.body[0]?.expression;
  } catch {
    return jsx;
  }
  if (!gen) return jsx;
  const src = (n: AnyNode) => originalCode.slice(n.start, n.end);
  const propValues = new Map<string, string>();
  for (const [k, v] of Object.entries(instanceProps ?? {})) if (typeof v === 'string' || typeof v === 'number') propValues.set(String(v), k);
  const edits: Edit[] = [];

  const visit = (o: AnyNode, g: AnyNode) => {
    if (o.type === 'JSXElement' && g.type === 'JSXElement') {
      if (jsxName(o.openingElement.name) !== jsxName(g.openingElement.name)) return;
      const have = new Set(g.openingElement.attributes.filter((a: AnyNode) => a.type === 'JSXAttribute').map((a: AnyNode) => jsxName(a.name)));
      const carry = o.openingElement.attributes
        .filter((a: AnyNode) => a.type === 'JSXSpreadAttribute' || (a.type === 'JSXAttribute' && KEEP_ATTR(jsxName(a.name)) && !have.has(jsxName(a.name))))
        .map(src);
      if (carry.length) edits.push({ from: g.openingElement.name.end, to: g.openingElement.name.end, text: ` ${carry.join(' ')}` });
    } else if (!(o.type === 'JSXFragment' && g.type === 'JSXFragment')) return;
    const oc = significantChildren(o);
    const gc = significantChildren(g);
    if (oc.length !== gc.length) {
      // Structure changed here; still recurse into same-tag element pairs in order.
      let j = 0;
      for (const child of gc) {
        if (child.type !== 'JSXElement') continue;
        while (j < oc.length && !(oc[j].type === 'JSXElement' && jsxName(oc[j].openingElement.name) === jsxName(child.openingElement.name))) j++;
        if (j < oc.length) visit(oc[j++], child);
      }
      return;
    }
    oc.forEach((och: AnyNode, i: number) => {
      const gch = gc[i];
      if (och.type === 'JSXExpressionContainer' && gch.type === 'JSXText') {
        const text = gch.value.trim();
        const expr = och.expression;
        // `{title}` rendered as the instance prop's value, or any simple expression whose text is unchanged.
        if (expr?.type === 'Identifier' && propValues.get(text) === expr.name) edits.push({ from: gch.start, to: gch.end, text: gch.value.replace(text, src(och)) });
        else if (expr?.type === 'MemberExpression' && propValues.has(text) && src(expr).endsWith(`.${propValues.get(text)}`)) edits.push({ from: gch.start, to: gch.end, text: gch.value.replace(text, src(och)) });
      } else if (och.type === 'JSXElement' || och.type === 'JSXFragment') visit(och, gch);
    });
  };
  const roots = significantChildren(gen);
  const origRoot = unwrapExpr(original);
  if (roots.length === 1) visit(origRoot, roots[0]);
  else visit(origRoot, gen);
  if (!edits.length) return jsx;
  return applyEdits(wrapped, edits).slice(2, -3);
}

function deterministicMerge(p: Prepared, originalCode: string, instanceProps: Record<string, unknown>): string {
  const { compiler } = p;
  if (!p.generatedJSX.trim()) throw new Error('Nothing to save: the snapshot has no elements');
  const ast = compiler.parse(originalCode, PARSE_OPTS);
  const { defs, declared } = collectTopLevel(ast.program);
  const target = pickComponent(defs, p.targetNames);
  if (!target) throw new Error('Could not find a component that returns JSX in this file');
  const missing = p.unresolved.filter((n) => !declared.has(n));
  if (missing.length) throw new Error(`Unknown component${missing.length > 1 ? 's' : ''} ${missing.join(', ')} (not in the component index)`);
  const render = findRenderTarget(target.fn)!;

  let jsx = p.generatedJSX.replace(/\s+$/, '');
  if (p.rootCount > 1) jsx = `<>\n${jsx.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')}\n</>`;
  const node = render.node;
  jsx = reattachDynamics(compiler, jsx, node, originalCode, instanceProps);

  const parenthesized = !!node.extra?.parenthesized;
  const anchorIndent = lineIndent(originalCode, render.anchor.start);
  const inner = anchorIndent + '  ';
  const block = jsx.split('\n').map((l) => (l ? inner + l : l)).join('\n');
  const lineStart = originalCode.lastIndexOf('\n', node.start - 1) + 1;
  const before = originalCode.slice(lineStart, node.start);
  let edit: Edit;
  if (parenthesized && /^[ \t]*$/.test(before)) edit = { from: lineStart, to: node.end, text: block };
  else if (parenthesized) edit = { from: node.start, to: node.end, text: `\n${block}\n${anchorIndent}` };
  else edit = { from: node.start, to: node.end, text: `(\n${block}\n${anchorIndent})` };

  const edits = [edit, ...importEdits(originalCode, ast.program, declared, p.mappings)];
  return applyEdits(originalCode, edits);
}

const ICONS_RULE = 'Icons and SVGs: use icon components imported from their library or inline <svg> JSX — never dangerouslySetInnerHTML or <i data-icon> in component files';

function buildPrompt(p: Prepared, body: SaveToCodeBody, originalCode: string): string {
  const importsSection = p.mappings.length
    ? `\n\nCOMPONENT IMPORTS NEEDED (required — do not invent alternate paths):\nThe edited snapshot uses these project components and icons. EVERY one MUST appear as an import in your output if not already imported:\n${p.mappings.map((m) => `- ${m.isDefault ? `import ${m.component} from '${m.importPath}'` : `import { ${m.component} } from '${m.importPath}'`}`).join('\n')}\n`
    : '';
  const sc = body.stateContext && Object.keys(body.stateContext).length
    ? `\n\nIMPORTANT - SNAPSHOT RENDERING CONTEXT:\nThe JSX below is a RENDERED SNAPSHOT with these mock values:\n${Object.entries(body.stateContext).map(([k, v]) => `  ${k} = ${JSON.stringify(v)}`).join('\n')}\n\nThis means:\n- Any dynamic expressions ({variables}, loops, conditionals) were evaluated with the above values\n- The JSX shows what the component looked like when rendered with this specific state\n- DO NOT treat this as literal code to copy - treat it as a visual reference of what changed\n`
    : '';
  const ui = body.userInstructions ? `\n\nUSER INSTRUCTIONS (from the designer):\n${body.userInstructions}\n\nFollow these instructions carefully when applying the changes.\n` : '';
  const internal = body.internalComponent?.name
    ? `\n\nOnly modify the internal component "${body.internalComponent.name}" (approximately lines ${body.internalComponent.startLine}-${body.internalComponent.endLine}); all other code must stay exactly as it is.`
    : '';
  return `You are a code transformation tool. Output ONLY valid TypeScript code, nothing else.

TASK: Merge visual edits into a React component file.${internal}

ORIGINAL FILE:
\`\`\`tsx
${originalCode}
\`\`\`

EDITED SNAPSHOT (FINAL designed render — the designer's target UI, as JSX from the canvas):
\`\`\`jsx
${p.generatedJSX}
\`\`\`${sc}${ui}${importsSection}

INSTRUCTIONS:
1. Compare original vs the FINAL snapshot to find what changed (colors, text, styles, structure, nested components)
2. Apply those changes to the ORIGINAL FILE — the snapshot is the target render, not throwaway draft code
3. Keep all imports, hooks, logic, expressions, loops, conditionals intact
4. If original uses Tailwind classes, convert any inline styles to Tailwind
5. Prefer preserving component usages (e.g. <Button>) from the snapshot when they match project components
6. CRITICAL — IMPORTS: Every PascalCase JSX tag in the merged file MUST be imported or defined in this file.
7. ${ICONS_RULE}
8. Output the COMPLETE UPDATED FILE from start to end

OUTPUT REQUIREMENTS:
- Output must be valid, parseable TypeScript/TSX code
- Start with the import statements from the original file
- Include every line of the file
- No markdown code fences
- No explanations or comments about what changed
- Do not output anything except the updated source code`;
}

function stripFences(raw: string): string {
  const m = raw.match(/```(?:tsx|typescript|ts|jsx|javascript|js)?\s*\n([\s\S]*?)\n```/);
  return (m ? m[1] : raw).trim() + '\n';
}

async function callAnthropic(messages: Message[]): Promise<string> {
  const timeout = Number(process.env.SAVE_TO_CODE_API_TIMEOUT_MS) || 120_000;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.SAVE_TO_CODE_MODEL || 'claude-sonnet-4-20250514', max_tokens: 16384, messages }),
    signal: AbortSignal.timeout(timeout),
  });
  const data = (await res.json().catch(() => null)) as { content?: { type: string; text?: string }[]; error?: { message?: string } } | null;
  if (!res.ok || !data) throw new Error(`Anthropic API error ${res.status}: ${data?.error?.message ?? 'no body'}`);
  return (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('');
}

async function validateMerged(compiler: Compiler, code: string, filePath: string, paths: string[]): Promise<string | null> {
  if (!code.trim()) return 'Output is empty';
  let ast: AnyNode;
  try { ast = compiler.parse(code, PARSE_OPTS); } catch (err) { return `Does not parse as TSX: ${(err as Error).message}`; }
  if (!ast.program.body.some((s: AnyNode) => s.type === 'ExportNamedDeclaration' || s.type === 'ExportDefaultDeclaration' || s.type === 'ExportAllDeclaration')) return 'The file has no ESM exports';
  const compiled = await validateCompile(filePath, code, paths);
  return compiled.ok ? null : compiled.error;
}

type Message = { role: 'user' | 'assistant'; content: string };
type LlmEngine = { label: string; maxAttempts: number; run: (messages: Message[]) => Promise<string> };

// ------------------------------------------------------------ claude CLI

/** Locates the `claude` CLI: CLAUDE_CLI_PATH, then PATH, then common install dirs. Cached. */
let claudeCliPath: string | null | undefined;
export function findClaudeCli(): string | null {
  if (claudeCliPath === undefined) claudeCliPath = findExecutable('claude', process.env.CLAUDE_CLI_PATH);
  return claudeCliPath;
}

/** The CLI is single-turn: fold a retry conversation into one prompt. */
function flattenForCli(messages: Message[]): string {
  if (messages.length === 1) return messages[0].content;
  const [first, ...rest] = messages;
  const parts = [first.content];
  for (const m of rest) {
    parts.push(m.role === 'assistant' ? `YOUR PREVIOUS OUTPUT:\n\`\`\`tsx\n${m.content}\n\`\`\`` : m.content);
  }
  return parts.join('\n\n');
}

const CLI_SYSTEM_PROMPT = 'You are a code transformation tool. You never use tools and never ask questions. You reply with only the complete updated source file, no prose, no markdown fences.';

async function callClaudeCli(messages: Message[]): Promise<string> {
  const bin = findClaudeCli();
  if (!bin) throw new Error('claude CLI not found');
  const timeoutMs = Number(process.env.SAVE_TO_CODE_CLI_TIMEOUT_MS) || 120_000;
  const model = process.env.SAVE_TO_CODE_CLI_MODEL || 'sonnet';
  const args = ['-p', '--model', model, '--output-format', 'json', '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--system-prompt', CLI_SYSTEM_PROMPT];
  const env = { ...process.env };
  // Not a nested Claude Code session, not Electron's node mode, and the subscription login rather than an API key.
  for (const k of ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'ELECTRON_RUN_AS_NODE', 'ANTHROPIC_API_KEY']) delete env[k];
  env.PATH = [path.dirname(bin), env.PATH ?? ''].join(path.delimiter);
  const res = await run(bin, args, { input: flattenForCli(messages), timeoutMs, env, cwd: os.tmpdir() });
  if (res.timedOut) throw new Error(`claude CLI timed out after ${Math.round(timeoutMs / 1000)}s`);
  let data: { result?: unknown; is_error?: boolean; subtype?: string } | null = null;
  try { data = JSON.parse(res.stdout.trim()); } catch { /* reported below */ }
  if (res.code !== 0 || !data || data.is_error || typeof data.result !== 'string') {
    const detail = (typeof data?.result === 'string' ? data.result : res.stderr || res.stdout).trim().slice(0, 300);
    throw new Error(`claude CLI failed (exit ${res.code}${data?.subtype ? `, ${data.subtype}` : ''}): ${detail}`);
  }
  return data.result;
}

/**
 * ANTHROPIC_API_KEY wins; otherwise the local claude CLI (opt out with
 * SAVE_TO_CODE_CLI=0); otherwise none (deterministic only). SAVE_TO_CODE_MODE
 * is not used for the CLI opt-out because the desktop reads the same variable
 * (its `api` = "forward to this server").
 */
function pickEngine(): LlmEngine | null {
  if (process.env.SAVE_TO_CODE_MODE === 'deterministic') return null;
  if (ANTHROPIC_API_KEY) return { label: 'Anthropic API', maxAttempts: 3, run: callAnthropic };
  if (process.env.SAVE_TO_CODE_CLI !== '0' && findClaudeCli()) return { label: 'claude CLI', maxAttempts: 2, run: callClaudeCli };
  return null;
}

async function llmMerge(engine: LlmEngine, p: Prepared, body: SaveToCodeBody, originalCode: string, filePath: string, paths: string[]): Promise<string> {
  const messages: Message[] = [{ role: 'user', content: buildPrompt(p, body, originalCode) }];
  let lastError = '';
  for (let attempt = 1; attempt <= engine.maxAttempts; attempt++) {
    const code = addMissingImports(p.compiler, stripFences(await engine.run(messages)), p.mappings);
    const problem = await validateMerged(p.compiler, code, filePath, paths);
    if (!problem) return code;
    lastError = problem;
    messages.push({ role: 'assistant', content: code }, { role: 'user', content: `VALIDATION FAILED — fix these issues and output the COMPLETE corrected file:\n${problem}` });
  }
  throw new Error(lastError);
}

/** Produces the merged file content; throws with a user-facing message on failure. */
export async function mergeSnapshotIntoFile(opts: {
  body: SaveToCodeBody;
  filePath: string;
  originalCode: string;
  scanResult: Record<string, unknown>;
  projectPaths: string[];
}): Promise<string> {
  const { body, filePath, originalCode, scanResult, projectPaths } = opts;
  const p = await prepare(body, filePath, scanResult);
  const engine = pickEngine();
  if (engine) {
    const started = Date.now();
    try {
      const merged = await llmMerge(engine, p, body, originalCode, filePath, projectPaths);
      console.log(`[save-to-code] merged ${filePath} with ${engine.label} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      return merged;
    } catch (err) {
      console.warn(`[save-to-code] ${engine.label} merge failed, falling back to deterministic merge:`, (err as Error).message);
    }
  }
  const merged = deterministicMerge(p, originalCode, (body.stateContext?.instanceProps as Record<string, unknown>) ?? {});
  const problem = await validateMerged(p.compiler, merged, filePath, projectPaths);
  if (problem) {
    console.warn('[save-to-code] merged code failed validation:', problem);
    throw new Error(MERGE_FAILED_MESSAGE);
  }
  return merged;
}
