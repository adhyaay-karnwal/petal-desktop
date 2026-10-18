// Reconstructed from index.js — original module: packages/compiler/src/codegen/saveToCode.ts
import { require_rolldown_runtime } from "../../../../__bundle__/_preamble.js";
import { import_lib$3, import_lib$4 } from "./parseJSX.js";
import { formatImportMapping, getComponentImportMappings } from "./generateImports.js";
import { require_lib$1 } from "../../../../vendor/@babel/traverse.js";

/**
* Save-to-code post-merge repair and validate.
*
* Claude is told which imports to add, but still sometimes omits or invents
* paths — which shows up as `[undefined component]` in the jsx shim when the
* file recompiles. This module:
*   1. Repairs missing / wrong imports from the project index
*   2. Validates that merged output is parseable TSX with resolved JSX tags
*
* Prefer string insertion for new import lines so we don't reformat the whole
* file (keeps save diffs small).
*/
var import_lib$2 = /* @__PURE__ */ require_rolldown_runtime.__toESM(require_lib$1(), 1);
var traverse$5 = import_lib$2.default.default || import_lib$2.default;
var REACT_BUILTINS = /* @__PURE__ */ new Set([
	"Fragment",
	"Suspense",
	"StrictMode",
	"Profiler",
	"Activity"
]);
function parseCode(code) {
	try {
		return (0, import_lib$3.parse)(code, {
			sourceType: "module",
			plugins: ["jsx", "typescript"],
			errorRecovery: true
		});
	} catch {
		return null;
	}
}
/** Format Babel parse errors for AI retry feedback (first 1–2 only). */
function formatParseErrors(errors) {
	const out = [];
	for (const err of errors.slice(0, 2)) {
		if (!err || typeof err !== "object") continue;
		const e = err;
		if (!e.message) continue;
		const loc = e.loc?.line != null ? ` (line ${e.loc.line}${e.loc.column != null ? `, col ${e.loc.column}` : ""})` : "";
		out.push(`${e.message}${loc}`);
	}
	return out;
}
/**
* PascalCase names bound anywhere in this file, split by origin.
*
* Read from scope bindings at every depth, so a component bound inside a
* function body counts as defined — `const Comp = asChild ? Slot : 'button'`,
* a destructured render prop, a locally computed icon. Calling those undefined
* is a dead end for the merge retry loop: there is no import the AI could add.
*/
function collectBoundComponentNames(ast) {
	const imported = /* @__PURE__ */ new Set();
	const local = /* @__PURE__ */ new Set();
	traverse$5(ast, { Scopable(path) {
		for (const [name, binding] of Object.entries(path.scope.bindings)) {
			if (!/^[A-Z]/.test(name)) continue;
			if (binding.kind === "module") imported.add(name);
			else local.add(name);
		}
	} });
	return {
		imported,
		local
	};
}
/** PascalCase JSX tags used in the file (component references). */
function collectJsxComponentNames(code) {
	const ast = parseCode(code);
	if (!ast) return [];
	const names = /* @__PURE__ */ new Set();
	traverse$5(ast, { JSXOpeningElement(path) {
		const nameNode = path.node.name;
		if (import_lib$4.isJSXIdentifier(nameNode) && /^[A-Z]/.test(nameNode.name)) {
			if (!REACT_BUILTINS.has(nameNode.name)) names.add(nameNode.name);
		}
	} });
	return [...names].sort();
}
/**
* Normalize import paths for comparison (`@/foo/bar` ≡ `foo/bar` ≡ `./foo/bar`).
*/
function normalizeImportPath(p) {
	return p.replace(/\\/g, "/").replace(/\.tsx?$/, "").replace(/^@\//, "").replace(/^\.\//, "");
}
function pathsEquivalent(a, b) {
	const na = normalizeImportPath(a);
	const nb = normalizeImportPath(b);
	if (na === nb) return true;
	if (a.startsWith(".") || b.startsWith(".") || na.includes("..") || nb.includes("..")) return false;
	return na.endsWith("/" + nb) || nb.endsWith("/" + na);
}
/**
* Prefer `@/` if the file already uses it. Never leave a relative mapping as-is
* when the file is alias-based — Claude's `../actions/foo` mistakes must be
* replaced with `@/components/actions/foo`.
*/
function resolveImportPathForFile(code, importPath) {
	const usesAlias = /from\s+['"]@\//.test(code);
	if (importPath.startsWith("@/")) return importPath;
	if (usesAlias) {
		let cleaned = importPath.replace(/^\.\//, "");
		cleaned = cleaned.replace(/^(\.\.\/)+/, "");
		if (/^(components|src|lib|app|pages)\//.test(cleaned)) {
			if (cleaned.startsWith("src/")) cleaned = cleaned.slice(4);
			return `@/${cleaned}`;
		}
		if (!importPath.startsWith(".") && !importPath.startsWith("/")) return `@/${importPath}`;
		if (cleaned) return `@/${cleaned}`;
	}
	return importPath;
}
function quoteStyle(code) {
	const alias = code.match(/from\s+(['"])@\//);
	if (alias) return alias[1];
	return code.match(/from\s+(['"])/)?.[1] || "'";
}
function listImportDecls(code, ast) {
	const out = [];
	for (const stmt of ast.program.body) {
		if (!import_lib$4.isImportDeclaration(stmt) || stmt.start == null || stmt.end == null) continue;
		const names = /* @__PURE__ */ new Set();
		for (const spec of stmt.specifiers) if (import_lib$4.isImportSpecifier(spec) && import_lib$4.isIdentifier(spec.local)) names.add(spec.local.name);
		else if (import_lib$4.isImportDefaultSpecifier(spec) || import_lib$4.isImportNamespaceSpecifier(spec)) names.add(spec.local.name);
		out.push({
			start: stmt.start,
			end: stmt.end,
			source: stmt.source.value.replace(/\.tsx?$/, ""),
			names,
			text: code.slice(stmt.start, stmt.end)
		});
	}
	return out;
}
function isPlainNamedImport(text) {
	return /^import\s*\{/.test(text.trim()) && !/\bas\s+\w/.test(text);
}
function formatNamedImport(names, importPath, q) {
	return `import { ${[...names].sort().join(", ")} } from ${q}${importPath}${q}`;
}
/** Resolve `@/` import mappings for PascalCase JSX tags (+ extras − excludes), plus used package imports. */
function resolveSaveToCodeImportMappings(code, componentIndex, options) {
	const names = new Set(collectJsxComponentNames(code));
	for (const n of options?.extraNames ?? []) names.add(n);
	for (const n of options?.excludeNames ?? []) names.delete(n);
	const componentMappings = getComponentImportMappings(names, componentIndex, void 0, { preferAlias: true });
	const claimed = new Set(componentMappings.map((m) => m.component));
	const packageMappings = (options?.packageImports ?? []).filter((m) => names.has(m.component) && !claimed.has(m.component)).map((m) => ({
		...m,
		verbatim: true
	}));
	return [...componentMappings, ...packageMappings];
}
function mappingPathForFile(code, mapping) {
	return mapping.verbatim ? mapping.importPath : resolveImportPathForFile(code, mapping.importPath);
}
/**
* Strip surrounding whitespace and markdown ``` fences from a model response.
* Models often wrap TSX output in fenced blocks despite being told not to.
*/
function repairStripMarkdownCodeFences(response) {
	let cleaned = response.trim();
	const fenceMatch = cleaned.match(/```(?:tsx?|jsx?)?\n([\s\S]*?)```/);
	if (fenceMatch) cleaned = fenceMatch[1].trim();
	return cleaned;
}
/**
* Deterministic repair for save-to-code: resolve JSX components from the project
* index, force `@/` imports, and rewrite wrong relative paths.
*/
function repairComponentImports(code, componentIndex, options) {
	const mappings = resolveSaveToCodeImportMappings(code, componentIndex, options);
	if (!mappings.length) return code;
	const ast = parseCode(code);
	if (!ast) return code;
	const { local: locals } = collectBoundComponentNames(ast);
	const q = quoteStyle(code);
	let next = code;
	const decls = listImportDecls(next, ast);
	const desired = /* @__PURE__ */ new Map();
	const desiredDefaults = /* @__PURE__ */ new Map();
	for (const mapping of mappings) {
		if (locals.has(mapping.component)) continue;
		if (mapping.verbatim && decls.some((d) => d.names.has(mapping.component))) continue;
		(mapping.isDefault ? desiredDefaults : desired).set(mapping.component, mappingPathForFile(code, mapping));
	}
	if (desired.size === 0 && desiredDefaults.size === 0) return code;
	const declState = /* @__PURE__ */ new Map();
	for (const d of decls) declState.set(d.start, {
		start: d.start,
		end: d.end,
		source: d.source,
		names: new Set(d.names),
		named: isPlainNamedImport(d.text)
	});
	const needNew = /* @__PURE__ */ new Map();
	const addNeed = (path, name) => {
		if (!needNew.has(path)) needNew.set(path, /* @__PURE__ */ new Set());
		needNew.get(path).add(name);
	};
	for (const [component, wantPath] of desired) {
		const fromDecl = decls.find((d) => d.names.has(component));
		if (fromDecl) {
			if (pathsEquivalent(fromDecl.source, wantPath)) continue;
			const state = declState.get(fromDecl.start);
			if (state?.named) state.names.delete(component);
			addNeed(wantPath, component);
			continue;
		}
		addNeed(wantPath, component);
	}
	for (const [wantPath, namesToAdd] of [...needNew.entries()]) {
		const existing = [...declState.values()].find((d) => d.named && pathsEquivalent(d.source, wantPath));
		if (!existing) continue;
		for (const n of namesToAdd) existing.names.add(n);
		needNew.delete(wantPath);
	}
	const ops = [];
	for (const state of declState.values()) {
		if (!state.named) continue;
		const original = decls.find((d) => d.start === state.start);
		if (!original) continue;
		const samePath = pathsEquivalent(original.source, state.source);
		const sameNames = original.names.size === state.names.size && [...original.names].every((n) => state.names.has(n));
		if (samePath && sameNames) continue;
		if (state.names.size === 0) {
			let end = state.end;
			if (next[end] === "\n") end++;
			else if (next[end] === ";" && next[end + 1] === "\n") end += 2;
			ops.push({
				start: state.start,
				end,
				text: ""
			});
		} else ops.push({
			start: state.start,
			end: state.end,
			text: formatNamedImport([...state.names], state.source, q)
		});
	}
	ops.sort((a, b) => b.start - a.start);
	for (const op of ops) next = next.slice(0, op.start) + op.text + next.slice(op.end);
	if (needNew.size > 0) {
		const ast2 = parseCode(next);
		const decls2 = ast2 ? listImportDecls(next, ast2) : [];
		const stillNew = /* @__PURE__ */ new Map();
		const mergeOps = [];
		for (const [wantPath, namesToAdd] of needNew) {
			const existing = decls2.find((d) => pathsEquivalent(d.source, wantPath) && isPlainNamedImport(d.text));
			if (existing) {
				const merged = /* @__PURE__ */ new Set([...existing.names, ...namesToAdd]);
				mergeOps.push({
					start: existing.start,
					end: existing.end,
					text: formatNamedImport([...merged], wantPath, q)
				});
			} else stillNew.set(wantPath, namesToAdd);
		}
		mergeOps.sort((a, b) => b.start - a.start);
		for (const op of mergeOps) next = next.slice(0, op.start) + op.text + next.slice(op.end);
		if (stillNew.size > 0) {
			const lines = [...stillNew.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([path, namesToAdd]) => formatNamedImport([...namesToAdd], path, q));
			next = insertImportLines(next, lines);
		}
	}
	if (desiredDefaults.size > 0) next = repairDefaultImports(next, desiredDefaults, q);
	return next;
}
/**
* Adds `import X from '…'` for unbound default-exported components, and
* re-points a lone default import at the wrong path. A name bound any other way
* is left alone: rewriting it could break what it actually refers to.
*/
function repairDefaultImports(code, desired, q) {
	const ast = parseCode(code);
	if (!ast) return code;
	const decls = listImportDecls(code, ast);
	const ops = [];
	const lines = [];
	for (const [component, wantPath] of [...desired].sort(([a], [b]) => a.localeCompare(b))) {
		const line = `import ${component} from ${q}${wantPath}${q}`;
		const fromDecl = decls.find((d) => d.names.has(component));
		if (!fromDecl) lines.push(line);
		else if (!pathsEquivalent(fromDecl.source, wantPath) && fromDecl.names.size === 1 && /^import\s+[\w$]+\s+from\b/.test(fromDecl.text.trim())) ops.push({
			start: fromDecl.start,
			end: fromDecl.end,
			text: line
		});
	}
	let next = code;
	for (const op of ops.sort((a, b) => b.start - a.start)) next = next.slice(0, op.start) + op.text + next.slice(op.end);
	return lines.length > 0 ? insertImportLines(next, lines) : next;
}
/** Inserts import lines after the last import, or after a leading `'use client'`. */
function insertImportLines(code, lines) {
	const ast = parseCode(code);
	const decls = ast ? listImportDecls(code, ast) : [];
	let insertAt = 0;
	if (decls.length > 0) {
		const nl = code.indexOf("\n", decls[decls.length - 1].end);
		if (nl === -1) return `${code}\n${lines.join("\n")}\n`;
		insertAt = nl + 1;
	} else if (code.startsWith("'use client'") || code.startsWith("\"use client\"")) {
		const nl = code.indexOf("\n");
		insertAt = nl === -1 ? code.length : nl + 1;
	}
	return code.slice(0, insertAt) + lines.join("\n") + "\n" + code.slice(insertAt);
}
/**
* Names used as JSX components that are neither imported nor locally defined.
* These will render as `[undefined component]` at runtime.
*/
function findUnresolvedJsxComponents(code) {
	const ast = parseCode(code);
	if (!ast) return [];
	const { imported, local } = collectBoundComponentNames(ast);
	return collectJsxComponentNames(code).filter((n) => !imported.has(n) && !local.has(n) && !REACT_BUILTINS.has(n));
}
/**
* Validate source parses as TypeScript/TSX.
* Surfaces Babel errors (even with errorRecovery) so AI retries can fix syntax.
*/
function validateParsesAsTsx(code) {
	const ast = parseCode(code);
	const recoveryErrors = Array.isArray(ast?.errors) ? ast.errors : [];
	if (!(!ast || recoveryErrors.length > 0)) return { ok: true };
	const details = formatParseErrors(recoveryErrors);
	return {
		ok: false,
		message: `Your attempt failed because the output is not valid, parseable TypeScript/TSX.${details.length > 0 ? `\n\nParser errors:\n${details.map((d) => `- ${d}`).join("\n")}` : ""}

You MUST output a complete, syntactically valid TypeScript/TSX file.
- Fix any truncated tags, unclosed braces/parens, or incomplete statements
- NO markdown fences, NO commentary before/after the code
- Output the COMPLETE file from first line to last line`
	};
}
/**
* Validate the first line looks like a TS/TSX module, not prose or a chat reply.
*/
function validateLooksLikeSourceModule(code) {
	const first = code.trim().split("\n")[0]?.trim() ?? "";
	if (!(first.startsWith("import ") || first.startsWith("export ") || first.startsWith("'use client'") || first.startsWith("\"use client\"") || first.startsWith("'use server'") || first.startsWith("\"use server\"") || first.startsWith("//") || first.startsWith("/*") || first.startsWith("function ") || first.startsWith("const ") || first.startsWith("let ") || first.startsWith("var ") || first.startsWith("type ") || first.startsWith("interface ") || first.startsWith("class ") || first.startsWith("enum ") || first.startsWith("declare ") || first.startsWith("namespace ") || first.startsWith("module "))) {
		const preview = first.length > 80 ? `${first.slice(0, 80)}…` : first;
		return {
			ok: false,
			message: `Your attempt failed because you output explanatory text instead of code.${preview ? `\n\nFirst line was: "${preview}"` : ""}

You MUST output ONLY the complete TypeScript/TSX source code file.
- NO explanations, summaries, or descriptions
- NO "Here's the updated file" or "The changes are..."
- Start DIRECTLY with the first line of code (import statement or 'use client')
- Output the COMPLETE file from first line to last line`
		};
	}
	return { ok: true };
}
/**
* Reject empty / whitespace-only AI output before further validate steps.
*/
function validateNotEmpty(code) {
	if (typeof code === "string" && code.trim()) return { ok: true };
	return {
		ok: false,
		message: `Your attempt failed because the output was empty.

You MUST output the COMPLETE TypeScript/TSX source code file.
- NO explanations or commentary
- Start DIRECTLY with the first line of code
- Output the COMPLETE file from first line to last line`
	};
}
/**
* Reject code with no `export` binding (source or esbuild ESM output).
* Catches expression junk like `Hello, world!` that esbuild may accept
* without producing a module.
*/
function validateHasEsmExports(code) {
	if (/\bexport\b/.test(code)) return { ok: true };
	return {
		ok: false,
		message: `Your attempt failed because the output compiles but exports nothing — it does not look like a source module.

You MUST output a complete TypeScript/TSX component module.
- Include a named or default export (e.g. export function Component …)
- NO explanations, summaries, or bare expressions
- Start DIRECTLY with the first line of code
- Output the COMPLETE file from first line to last line`
	};
}
/**
* Validate PascalCase JSX tags are imported or locally defined.
*
* Pass `componentIndex` to derive which names must resolve from the project
* index (save-to-code path). Or pass `requiredComponents` explicitly.
* Non-empty `requiredComponents` / resolved names narrow the check; omit /
* empty means every unresolved tag fails.
*/
function validateJsxComponentsResolved(code, options) {
	const mappings = options?.componentIndex ? resolveSaveToCodeImportMappings(code, options.componentIndex, options) : [];
	const required = options?.requiredComponents !== void 0 ? options.requiredComponents : options?.componentIndex ? mappings.map((m) => m.component) : void 0;
	const unresolved = findUnresolvedJsxComponents(code);
	const critical = required && required.length > 0 ? unresolved.filter((n) => required.includes(n)) : unresolved;
	if (critical.length > 0) {
		const suggested = mappings.filter((m) => critical.includes(m.component)).map((m) => `- ${formatImportMapping({
			...m,
			importPath: mappingPathForFile(code, m)
		})}`);
		return {
			ok: false,
			message: `Your attempt failed because these JSX components are used but not imported or defined: ${critical.join(", ")}.

Unresolved PascalCase tags render as [undefined component] at runtime.${suggested.length > 0 ? `\n\nSuggested imports:\n${suggested.join("\n")}` : ""}

You MUST add the correct imports (or define the component locally).
- Prefer the exact paths from COMPONENT IMPORTS NEEDED in the original task
- Do NOT invent alternate relative paths
- Keep every other part of the file intact
- Output the COMPLETE corrected file`
		};
	}
	return { ok: true };
}
import_lib$2.default.default || import_lib$2.default;

export { import_lib$2, repairComponentImports, repairStripMarkdownCodeFences, validateHasEsmExports, validateJsxComponentsResolved, validateLooksLikeSourceModule, validateNotEmpty, validateParsesAsTsx };
