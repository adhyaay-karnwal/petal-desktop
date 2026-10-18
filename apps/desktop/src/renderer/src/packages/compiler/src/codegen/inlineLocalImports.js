// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/inlineLocalImports.ts
import { import_lib, import_lib$1, import_lib$2, import_lib$3 } from "../runtime/stampMapHosts.js";

var traverse$3 = import_lib$2.default.default || import_lib$2.default;
var ENTRY = "\0entry";
var LOCAL_EXTENSIONS = [
	".tsx",
	".ts",
	".jsx",
	".js"
];
function resolveRelativePath(fromDir, importPath) {
	const parts = fromDir ? fromDir.split("/") : [];
	for (const part of importPath.split("/")) if (part === ".") continue;
	else if (part === "..") parts.pop();
	else parts.push(part);
	return parts.join("/");
}
/**
* Mirrors project-builder's `resolveLocalImportTarget` (`@/` tries the root,
* `src/`, `components/` and `src/components/`), so a copy inlines exactly the
* files the canvas compiled.
*/
function resolveProjectImport(spec, fromPath, projectPaths) {
	const candidates = [];
	if (spec.startsWith("@/")) {
		const rest = spec.slice(2);
		candidates.push(rest, `src/${rest}`, `components/${rest}`, `src/components/${rest}`);
	} else if (spec.startsWith(".")) {
		const dir = fromPath === ENTRY ? "" : fromPath.slice(0, Math.max(0, fromPath.lastIndexOf("/")));
		candidates.push(resolveRelativePath(dir, spec));
	} else return null;
	for (const base of candidates) {
		if (projectPaths.has(base) && isCodePath(base)) return base;
		const noExt = base.replace(/\.(tsx?|jsx?)$/, "");
		if (noExt !== base) {
			for (const ext of LOCAL_EXTENSIONS) if (projectPaths.has(noExt + ext)) return noExt + ext;
		}
		for (const ext of LOCAL_EXTENSIONS) if (projectPaths.has(base + ext)) return base + ext;
		for (const ext of LOCAL_EXTENSIONS) if (projectPaths.has(`${base}/index${ext}`)) return `${base}/index${ext}`;
	}
	return null;
}
function isCodePath(path) {
	return /\.(tsx?|jsx?)$/.test(path);
}
/**
* An inlined file's `./styles.module.css` no longer sits next to it, and two
* files' `./styles.module.css` would merge into one import. Root it at `@/`.
*/
function rootSpecifier(spec, fromPath) {
	if (fromPath === ENTRY || !spec.startsWith(".")) return spec;
	return `@/${resolveRelativePath(fromPath.slice(0, Math.max(0, fromPath.lastIndexOf("/"))), spec)}`;
}
function parseModule(code) {
	return (0, import_lib.parse)(code, {
		sourceType: "module",
		plugins: ["typescript", "jsx"]
	});
}
function exportedNameOf(node) {
	return import_lib$3.isIdentifier(node) ? node.name : node.value;
}
function importedNameOf(spec) {
	if (import_lib$3.isImportDefaultSpecifier(spec)) return { kind: "default" };
	if (import_lib$3.isImportNamespaceSpecifier(spec)) return { kind: "namespace" };
	const name = exportedNameOf(spec.imported);
	return name === "default" ? { kind: "default" } : {
		kind: "named",
		name
	};
}
function importedKey(imported) {
	return imported.kind === "named" ? imported.name : `*${imported.kind}`;
}
function declarationNames(decl) {
	if (import_lib$3.isVariableDeclaration(decl)) return {
		values: decl.declarations.flatMap((d) => Object.keys(import_lib$3.getBindingIdentifiers(d.id))),
		types: []
	};
	if (import_lib$3.isTSInterfaceDeclaration(decl) || import_lib$3.isTSTypeAliasDeclaration(decl)) return {
		values: [],
		types: [decl.id.name]
	};
	if (import_lib$3.isTSEnumDeclaration(decl)) return {
		values: [decl.id.name],
		types: [decl.id.name]
	};
	if ((import_lib$3.isFunctionDeclaration(decl) || import_lib$3.isClassDeclaration(decl)) && decl.id) return {
		values: [decl.id.name],
		types: import_lib$3.isClassDeclaration(decl) ? [decl.id.name] : []
	};
	return {
		values: [],
		types: []
	};
}
function pascalFromPath(path) {
	const base = path.split("/").pop().replace(/\.[^.]+$/, "");
	const pascal = (base === "index" ? path.split("/").slice(-2, -1)[0] ?? "Default" : base).replace(/(^|[^A-Za-z0-9]+)([A-Za-z0-9])/g, (_, __, c) => c.toUpperCase());
	return /^[A-Za-z_$]/.test(pascal) ? pascal : `Default${pascal}`;
}
function analyze(path, code, projectPaths) {
	const ast = parseModule(code);
	let program;
	traverse$3(ast, { Program(p) {
		program = p;
		p.stop();
	} });
	const mod = {
		path,
		code,
		program,
		directives: ast.program.directives.map((d) => d.value.value),
		imports: [],
		sideEffectImports: [],
		ownNames: [],
		typeNames: /* @__PURE__ */ new Set(),
		exports: /* @__PURE__ */ new Map(),
		starExports: [],
		anonymousDefault: null,
		final: /* @__PURE__ */ new Map()
	};
	const addOwn = (values, types) => {
		for (const n of [...values, ...types]) if (!mod.ownNames.includes(n)) mod.ownNames.push(n);
		for (const n of types) mod.typeNames.add(n);
	};
	for (const stmt of ast.program.body) if (import_lib$3.isImportDeclaration(stmt)) {
		const target = resolveProjectImport(stmt.source.value, path, projectPaths);
		const source = rootSpecifier(stmt.source.value, path);
		if (stmt.specifiers.length === 0) {
			if (!target) mod.sideEffectImports.push(source);
			continue;
		}
		for (const spec of stmt.specifiers) {
			const typeOnly = stmt.importKind === "type" || import_lib$3.isImportSpecifier(spec) && spec.importKind === "type";
			mod.imports.push({
				local: spec.local.name,
				imported: importedNameOf(spec),
				target,
				source,
				typeOnly
			});
		}
	} else if (import_lib$3.isExportNamedDeclaration(stmt)) {
		if (stmt.declaration) {
			const { values, types } = declarationNames(stmt.declaration);
			addOwn(values, types);
			for (const n of [...values, ...types]) mod.exports.set(n, {
				kind: "local",
				local: n
			});
		} else if (stmt.source) {
			const target = resolveProjectImport(stmt.source.value, path, projectPaths);
			const source = rootSpecifier(stmt.source.value, path);
			for (const spec of stmt.specifiers) {
				const exported = exportedNameOf(spec.exported);
				const imported = import_lib$3.isExportNamespaceSpecifier(spec) ? { kind: "namespace" } : import_lib$3.isExportDefaultSpecifier(spec) || exportedNameOf(spec.local) === "default" ? { kind: "default" } : {
					kind: "named",
					name: exportedNameOf(spec.local)
				};
				mod.exports.set(exported, target ? {
					kind: "reexport",
					target,
					imported
				} : {
					kind: "external",
					key: externalKey(source, imported)
				});
				if (!target) mod.imports.push({
					local: `\0${exported}`,
					imported,
					target: null,
					source,
					typeOnly: stmt.exportKind === "type"
				});
			}
		} else for (const spec of stmt.specifiers) {
			if (!import_lib$3.isExportSpecifier(spec)) continue;
			mod.exports.set(exportedNameOf(spec.exported), {
				kind: "local",
				local: spec.local.name
			});
		}
	} else if (import_lib$3.isExportAllDeclaration(stmt)) {
		const target = resolveProjectImport(stmt.source.value, path, projectPaths);
		if (target) mod.starExports.push(target);
	} else if (import_lib$3.isExportDefaultDeclaration(stmt)) {
		const decl = stmt.declaration;
		if ((import_lib$3.isFunctionDeclaration(decl) || import_lib$3.isClassDeclaration(decl)) && decl.id) {
			addOwn([decl.id.name], []);
			mod.exports.set("default", {
				kind: "local",
				local: decl.id.name
			});
		} else if (import_lib$3.isIdentifier(decl)) mod.exports.set("default", {
			kind: "local",
			local: decl.name
		});
		else if (path !== ENTRY) {
			const name = `\0default`;
			mod.ownNames.push(name);
			mod.exports.set("default", {
				kind: "local",
				local: name
			});
			mod.anonymousDefault = { start: stmt.start };
		}
	} else if (import_lib$3.isDeclaration(stmt)) {
		const { values, types } = declarationNames(stmt);
		addOwn(values, types);
	}
	return mod;
}
function externalKey(source, imported) {
	return `${source}\0${importedKey(source === "react" && imported.kind === "default" ? { kind: "namespace" } : imported)}`;
}
function applyEdits(code, edits) {
	const removals = edits.filter((e) => e.text === "" && e.end > e.start);
	const kept = edits.filter((e) => !removals.some((r) => r !== e && r.start <= e.start && e.end <= r.end));
	const seen = /* @__PURE__ */ new Set();
	const unique = kept.filter((e) => {
		const key = `${e.start}:${e.end}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
	unique.sort((a, b) => b.start - a.start || b.end - a.end);
	let out = code;
	for (const e of unique) out = out.slice(0, e.start) + e.text + out.slice(e.end);
	return out;
}
/** Removes a whole statement plus its trailing newline. */
function removeStatement(code, node) {
	let end = node.end;
	if (code[end] === "\n") end += 1;
	return {
		start: node.start,
		end,
		text: ""
	};
}
async function inlineLocalImports(options) {
	const { prelude, entry } = await inlineLocalImportParts(options);
	return `${prelude}${entry}\n`;
}
async function inlineLocalImportParts(options) {
	const { entry, projectPaths, readFile } = options;
	const modules = /* @__PURE__ */ new Map();
	const failed = /* @__PURE__ */ new Set();
	const load = async (path, code) => {
		const mod = analyze(path, code, projectPaths);
		modules.set(path, mod);
		const targets = /* @__PURE__ */ new Set();
		for (const imp of mod.imports) if (imp.target) targets.add(imp.target);
		for (const ref of mod.exports.values()) if (ref.kind === "reexport") targets.add(ref.target);
		for (const target of mod.starExports) targets.add(target);
		const pending = [...targets].filter((p) => !modules.has(p) && !failed.has(p));
		if (modules.size + pending.length > 200) throw new Error(`Too many files to inline (more than 200).`);
		await Promise.all(pending.map(async (target) => {
			if (modules.has(target) || failed.has(target)) return;
			failed.add(target);
			const source = await readFile(target).catch(() => null);
			if (source == null) return;
			failed.delete(target);
			try {
				await load(target, source);
			} catch (err) {
				if (err instanceof Error && err.message.startsWith("Too many files")) throw err;
				modules.delete(target);
				failed.add(target);
			}
		}));
	};
	await load(ENTRY, entry);
	for (const mod of modules.values()) {
		for (const imp of mod.imports) if (imp.target && !modules.has(imp.target)) imp.target = null;
		for (const [name, ref] of mod.exports) if (ref.kind === "reexport" && !modules.has(ref.target)) mod.exports.delete(name);
		mod.starExports = mod.starExports.filter((p) => modules.has(p));
	}
	const order = [];
	const visiting = /* @__PURE__ */ new Set();
	const visit = (path) => {
		if (visiting.has(path)) return;
		visiting.add(path);
		const mod = modules.get(path);
		for (const imp of mod.imports) if (imp.target) visit(imp.target);
		for (const ref of mod.exports.values()) if (ref.kind === "reexport") visit(ref.target);
		for (const target of mod.starExports) visit(target);
		order.push(mod);
	};
	visit(ENTRY);
	const taken = /* @__PURE__ */ new Set();
	const claim = (name) => {
		let candidate = name;
		for (let i = 2; taken.has(candidate); i++) candidate = `${name}${i}`;
		taken.add(candidate);
		return candidate;
	};
	const claimOwn = (mod) => {
		for (const name of mod.ownNames) {
			if (mod.final.has(name)) continue;
			const preferred = name === "\0default" ? pascalFromPath(mod.path) : name;
			mod.final.set(name, claim(preferred));
		}
	};
	const externals = /* @__PURE__ */ new Map();
	const namespaceObjects = /* @__PURE__ */ new Map();
	const entryModule = modules.get(ENTRY);
	const naming = [entryModule, ...order.filter((m) => m !== entryModule)];
	claimOwn(entryModule);
	const preferredExternal = /* @__PURE__ */ new Map();
	for (const imp of entryModule.imports) {
		if (!imp.target) continue;
		const name = claim(imp.local);
		entryModule.final.set(imp.local, name);
		const origin = originOf$1(modules, imp.target, imp.imported);
		if (origin?.kind === "own" && !origin.mod.final.has(origin.local)) origin.mod.final.set(origin.local, name);
		else if (origin?.kind === "namespace" && !namespaceObjects.has(origin.path)) namespaceObjects.set(origin.path, name);
		else if (origin?.kind === "external" && !preferredExternal.has(origin.key)) preferredExternal.set(origin.key, name);
	}
	for (const mod of naming) for (const imp of mod.imports) {
		if (imp.target) continue;
		const key = externalKey(imp.source, imp.imported);
		const existing = externals.get(key);
		if (existing) {
			existing.typeOnly &&= imp.typeOnly;
			mod.final.set(imp.local, existing.final);
			continue;
		}
		const preferred = imp.local.startsWith("\0") ? imp.imported.kind === "named" ? imp.imported.name : pascalFromPath(imp.source) : imp.local;
		const final = preferredExternal.get(key) ?? claim(preferred);
		const merged = imp.source === "react" && imp.imported.kind === "default" ? { kind: "namespace" } : imp.imported;
		externals.set(key, {
			source: imp.source,
			imported: merged,
			final,
			typeOnly: imp.typeOnly
		});
		mod.final.set(imp.local, final);
	}
	for (const mod of naming) if (mod !== entryModule) claimOwn(mod);
	const resolveExport = (path, imported, seen = /* @__PURE__ */ new Set()) => {
		const mod = modules.get(path);
		if (!mod) return null;
		if (imported.kind === "namespace") {
			let ns = namespaceObjects.get(path);
			if (!ns) {
				ns = claim(pascalFromPath(path));
				namespaceObjects.set(path, ns);
			}
			return ns;
		}
		const exported = imported.kind === "default" ? "default" : imported.name;
		const guard = `${path}\0${exported}`;
		if (seen.has(guard)) return null;
		seen.add(guard);
		const ref = mod.exports.get(exported);
		if (ref?.kind === "local") return resolveLocal(mod, ref.local, seen);
		if (ref?.kind === "reexport") return resolveExport(ref.target, ref.imported, seen);
		if (ref?.kind === "external") return externals.get(ref.key)?.final ?? null;
		if (imported.kind === "named") for (const star of mod.starExports) {
			const found = resolveExport(star, imported, seen);
			if (found) return found;
		}
		return null;
	};
	const resolveLocal = (mod, local, seen = /* @__PURE__ */ new Set()) => {
		const known = mod.final.get(local);
		if (known) return known;
		const imp = mod.imports.find((i) => i.local === local);
		if (!imp?.target) return null;
		const resolved = resolveExport(imp.target, imp.imported, seen);
		if (resolved) mod.final.set(local, resolved);
		return resolved;
	};
	for (const mod of order) for (const imp of mod.imports) if (imp.target && !resolveLocal(mod, imp.local)) mod.final.set(imp.local, claim(imp.local));
	const valueExportsOf = (path, seen = /* @__PURE__ */ new Set()) => {
		const out = /* @__PURE__ */ new Map();
		const mod = modules.get(path);
		if (!mod || seen.has(path)) return out;
		seen.add(path);
		for (const star of mod.starExports) for (const [k, v] of valueExportsOf(star, seen)) if (k !== "default") out.set(k, v);
		for (const [name, ref] of mod.exports) {
			if (ref.kind === "local" && mod.typeNames.has(ref.local) && !mod.program.scope.hasOwnBinding(ref.local)) continue;
			const final = resolveExport(path, name === "default" ? { kind: "default" } : {
				kind: "named",
				name
			});
			if (final) out.set(name, final);
		}
		return out;
	};
	let prelude = "";
	const files = [];
	const push = (block, path) => {
		if (path) files.push({
			path,
			from: prelude.length,
			to: prelude.length + block.length
		});
		prelude += `${block}\n\n`;
	};
	if (order.some((m) => m.directives.includes("use client"))) push(`'use client'`);
	const importLines = renderExternalImports([...externals.values()], order.flatMap((m) => m.sideEffectImports));
	if (importLines.length > 0) push(importLines.join("\n"));
	for (const mod of order) {
		if (mod === entryModule) continue;
		const body = rewriteModule(mod, false).trim();
		const namespace = namespaceObjects.get(mod.path);
		const members = namespace ? [...valueExportsOf(mod.path)].map(([k, v]) => k === v ? `  ${k},` : `  ${import_lib$3.isValidIdentifier(k) ? k : JSON.stringify(k)}: ${v},`) : [];
		const parts = [body, namespace ? `const ${namespace} = {\n${members.join("\n")}\n}` : ""].filter(Boolean);
		if (parts.length > 0) push(`// ${mod.path}\n${parts.join("\n\n")}`, mod.path);
	}
	const aliases = entryModule.imports.flatMap((imp) => {
		if (!imp.target) return [];
		const target = resolveExport(imp.target, imp.imported);
		if (!target || target === imp.local) return [];
		return [imp.typeOnly ? `type ${imp.local} = ${target}` : `const ${imp.local} = ${target}`];
	});
	if (aliases.length > 0) push(aliases.join("\n"));
	const entryStart = codeStart(entryModule.program.node, entry.length);
	return {
		prelude,
		files,
		entryStart,
		entry: rewriteModule(entryModule, true).trim()
	};
}
function codeStart(program, length) {
	const first = program.body.find((s) => !import_lib$3.isImportDeclaration(s));
	return first ? first.leadingComments?.[0]?.start ?? first.start : length;
}
/**
* Where a file's code starts, after its leading directives and imports; null
* when it doesn't parse. `inlineLocalImportParts` only depends on this header
* (plus the code's own top-level names), so it keys a cache.
*/
function importHeaderEnd(code) {
	try {
		return codeStart(parseModule(code).program, code.length);
	} catch {
		return null;
	}
}
/** The declaration an import ends up at, following re-exports and imports. */
function originOf$1(modules, path, imported, seen = /* @__PURE__ */ new Set()) {
	const mod = modules.get(path);
	if (!mod) return null;
	if (imported.kind === "namespace") return {
		kind: "namespace",
		path
	};
	const exported = imported.kind === "default" ? "default" : imported.name;
	const guard = `${path}\0${exported}`;
	if (seen.has(guard)) return null;
	seen.add(guard);
	const ref = mod.exports.get(exported);
	if (ref?.kind === "local") {
		if (mod.ownNames.includes(ref.local)) return {
			kind: "own",
			mod,
			local: ref.local
		};
		const imp = mod.imports.find((i) => i.local === ref.local);
		if (!imp) return null;
		return imp.target ? originOf$1(modules, imp.target, imp.imported, seen) : {
			kind: "external",
			key: externalKey(imp.source, imp.imported)
		};
	}
	if (ref?.kind === "reexport") return originOf$1(modules, ref.target, ref.imported, seen);
	if (ref?.kind === "external") return {
		kind: "external",
		key: ref.key
	};
	if (imported.kind === "named") for (const star of mod.starExports) {
		const found = originOf$1(modules, star, imported, seen);
		if (found) return found;
	}
	return null;
}
function renderExternalImports(imports, sideEffects) {
	const bySource = /* @__PURE__ */ new Map();
	for (const imp of imports) {
		const list = bySource.get(imp.source) ?? [];
		list.push(imp);
		bySource.set(imp.source, list);
	}
	const lines = [];
	for (const [source, list] of bySource) {
		const from = `'${source}'`;
		const namespace = list.find((i) => i.imported.kind === "namespace");
		const def = list.find((i) => i.imported.kind === "default");
		const named = list.filter((i) => i.imported.kind === "named");
		const allTypes = list.every((i) => i.typeOnly);
		const typePrefix = allTypes ? "type " : "";
		const namedParts = named.map((i) => {
			const name = i.imported.name;
			const alias = name === i.final ? name : `${name} as ${i.final}`;
			return !allTypes && i.typeOnly ? `type ${alias}` : alias;
		}).sort();
		if (namespace) lines.push(`import ${typePrefix}* as ${namespace.final} from ${from}`);
		const head = [def?.final, namedParts.length > 0 ? `{ ${namedParts.join(", ")} }` : null].filter(Boolean);
		if (head.length > 0) lines.push(`import ${typePrefix}${head.join(", ")} from ${from}`);
	}
	for (const source of new Set(sideEffects)) lines.push(`import '${source}'`);
	return lines.sort((a, b) => importSource(a).localeCompare(importSource(b)));
}
function importSource(line) {
	return line.slice(line.lastIndexOf(" ") + 1);
}
function rewriteModule(mod, isEntry) {
	const { code, program } = mod;
	const edits = [];
	for (const d of program.node.directives) edits.push(removeStatement(code, d));
	for (const stmt of program.node.body) if (import_lib$3.isImportDeclaration(stmt)) edits.push(removeStatement(code, stmt));
	else if (import_lib$3.isExportAllDeclaration(stmt)) edits.push(removeStatement(code, stmt));
	else if (import_lib$3.isExportNamedDeclaration(stmt)) {
		if (!stmt.declaration) edits.push(removeStatement(code, stmt));
		else if (!isEntry) edits.push({
			start: stmt.start,
			end: stmt.declaration.start,
			text: ""
		});
	} else if (import_lib$3.isExportDefaultDeclaration(stmt)) {
		const decl = stmt.declaration;
		if (import_lib$3.isIdentifier(decl)) {
			if (!isEntry) edits.push(removeStatement(code, stmt));
		} else if (mod.anonymousDefault?.start === stmt.start && !isEntry) {
			const name = mod.final.get("\0default");
			edits.push({
				start: stmt.start,
				end: decl.start,
				text: `const ${name} = `
			});
		} else if (!isEntry) edits.push({
			start: stmt.start,
			end: decl.start,
			text: ""
		});
	}
	const renames = /* @__PURE__ */ new Map();
	for (const [local, final] of mod.final) if (local !== final && !local.startsWith("\0")) renames.set(local, final);
	if (renames.size > 0) {
		const renameAt = (node, parent) => {
			const final = renames.get(node.name);
			const shorthand = parent && import_lib$3.isObjectProperty(parent) && parent.shorthand && parent.value === node;
			edits.push({
				start: node.start,
				end: node.end,
				text: shorthand ? `${node.name}: ${final}` : final
			});
		};
		for (const [name, binding] of Object.entries(program.scope.bindings)) {
			if (!renames.has(name)) continue;
			if (binding.kind !== "module") {
				const declared = binding.path.getOuterBindingIdentifierPaths()[name];
				renameAt(binding.identifier, (Array.isArray(declared) ? declared[0] : declared)?.parent ?? null);
			}
			for (const ref of binding.referencePaths) if (import_lib$3.isIdentifier(ref.node) || import_lib$3.isJSXIdentifier(ref.node)) renameAt(ref.node, ref.parent);
			for (const violation of binding.constantViolations) {
				const target = import_lib$3.isAssignmentExpression(violation.node) ? violation.node.left : import_lib$3.isUpdateExpression(violation.node) ? violation.node.argument : null;
				if (import_lib$3.isIdentifier(target) && target.name === name) renameAt(target, violation.node);
			}
		}
		program.traverse({
			TSInterfaceDeclaration(p) {
				if (isTopLevel(p)) renameIfNamed(p.node.id);
			},
			TSTypeAliasDeclaration(p) {
				if (isTopLevel(p)) renameIfNamed(p.node.id);
			},
			TSTypeReference(p) {
				renameIfNamed(leftmost(p.node.typeName));
			},
			TSExpressionWithTypeArguments(p) {
				renameIfNamed(leftmostExpr(p.node.expression));
			},
			TSTypeQuery(p) {
				if (!import_lib$3.isTSImportType(p.node.exprName)) renameIfNamed(leftmost(p.node.exprName));
			}
		});
		function renameIfNamed(id) {
			if (id && renames.has(id.name)) renameAt(id, null);
		}
	}
	return applyEdits(code, edits);
}
function isTopLevel(p) {
	return !!(p.parentPath?.isProgram() || p.parentPath?.isExportDeclaration() && p.parentPath.parentPath?.isProgram());
}
function leftmost(name) {
	let node = name;
	while (import_lib$3.isTSQualifiedName(node)) node = node.left;
	return import_lib$3.isIdentifier(node) ? node : null;
}
function leftmostExpr(expr) {
	let node = expr;
	while (import_lib$3.isMemberExpression(node) || import_lib$3.isTSQualifiedName(node)) node = import_lib$3.isMemberExpression(node) ? node.object : node.left;
	return import_lib$3.isIdentifier(node) ? node : null;
}
import_lib$2.default.default || import_lib$2.default;
import_lib$1.default.default || import_lib$1.default;

export { importHeaderEnd, inlineLocalImportParts, inlineLocalImports };
