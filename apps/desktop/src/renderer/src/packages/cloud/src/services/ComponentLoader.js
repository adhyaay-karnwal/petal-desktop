// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/services/ComponentLoader.ts
import { replaceEqualDeep } from "../../../../vendor/@tanstack/query-core.js";
import { ComponentCompiler } from "../../../compiler/src/runtime/ComponentCompiler.js";
import { stripUnresolvableCssImports } from "../../../compiler/src/runtime/projectCss.js";
import { executeCompiledModule } from "../../../compiler/src/runtime/executeModule.js";
import { getApiUrl } from "../client.js";
import { fetchPageList } from "./pageList.js";

/**
* ComponentLoader - Web runtime host for server-compiled project modules.
*
* project-builder compiles sources; this class initializes the runtime, imports
* pre-compiled ESM from public R2 dist URLs, and maintains the component registry.
*/
/**
* The compiler constructs absolute paths like `${projectRoot}/components/Button.tsx`.
* We use a virtual root prefix so we can strip it to get relative paths for API calls.
* The actual project ID (UUID) is stored separately.
*/
var VIRTUAL_ROOT_PREFIX = "/project/";
var WebComponentLoader = class extends ComponentCompiler {
	constructor() {
		let projectIdRef = null;
		super({ onProjectRootChanged: (root) => {
			if (root.startsWith(VIRTUAL_ROOT_PREFIX)) projectIdRef = root.slice(9);
			else projectIdRef = root;
			window.__LUNAGRAPH_RESOLVE_ASSET__ = (url) => {
				if (url.startsWith("/") && projectIdRef) return `${getApiUrl()}/projects/${projectIdRef}/assets/by-path?path=${encodeURIComponent(url.slice(1))}`;
				return url;
			};
		} });
		this._projectId = null;
		this.moduleRegistry = /* @__PURE__ */ new Map();
		this.moduleErrors = /* @__PURE__ */ new Map();
		this.moduleCatalog = /* @__PURE__ */ new Map();
		this.loadedModuleUrls = /* @__PURE__ */ new Map();
		this.lastComponentIndex = null;
		this.canvasNamesInflight = null;
		this.injectedCssPaths = /* @__PURE__ */ new Set();
		this._serverComponents = null;
		this._serverComponentIndex = null;
	}
	/** Set the project ID and create a virtual root for the compiler */
	setProject(projectId) {
		this._projectId = projectId;
		const virtualRoot = `${VIRTUAL_ROOT_PREFIX}${projectId}`;
		super.setProjectRoot(virtualRoot);
		this.moduleRegistry.clear();
		this.moduleErrors.clear();
		this.moduleCatalog.clear();
		this.loadedModuleUrls.clear();
		this.lastComponentIndex = null;
		this.canvasNamesInflight = null;
		this.injectedCssPaths.clear();
		this._serverComponents = null;
		this._serverComponentIndex = null;
		if (typeof document !== "undefined") document.querySelectorAll("[id^=\"petal-module-css-\"]").forEach((el) => el.remove());
	}
	getModuleCodeUrl(path) {
		return this.moduleCatalog.get(path)?.codeUrl;
	}
	/** Store module refs from SSE without importing every project file. */
	cacheServerModules(modules) {
		for (const mod of modules) {
			if (!mod?.path) continue;
			this.moduleCatalog.set(mod.path, mod);
		}
		this.prefetchCanvasComponentNames();
	}
	/** Overlap GET /pages with the rest of SSE so first paint does not wait on it. */
	prefetchCanvasComponentNames() {
		if (!this._projectId || this.canvasNamesInflight) return;
		this.canvasNamesInflight = this.fetchActivePageComponentNames();
	}
	pathsForIndex(index) {
		return [...new Set(Object.values(index).map((meta) => meta.path).filter(Boolean))];
	}
	/**
	* Load modules needed to paint the current canvases, then bind the index.
	* The full project index can be hundreds of files; first paint only needs
	* the components actually on a page.
	*/
	async loadModulesForIndex(index) {
		this.lastComponentIndex = index;
		const allPaths = this.pathsForIndex(index);
		const canvasPaths = await this.pathsUsedOnCanvas(index);
		const firstPaths = canvasPaths.kind === "components" ? canvasPaths.paths : canvasPaths.kind === "html-only" ? [] : allPaths;
		await this.importModulesAtPaths(firstPaths);
		return this.applyComponentIndex(index);
	}
	/**
	* Import still-unbound modules for named components (live canvas, Assets
	* composition previews). No-op when every named path is already bound.
	*/
	async ensureModulesForNames(names) {
		const index = this.lastComponentIndex ?? this._serverComponentIndex;
		if (!index) return null;
		const pathsNeedingImport = [...new Set([...names].map((name) => index[name]?.path).filter((path) => !!path))].filter((path) => !this.moduleRegistry.has(path) || this.moduleErrors.has(path));
		if (pathsNeedingImport.length === 0) return null;
		await this.importModulesAtPaths(pathsNeedingImport);
		return this.applyComponentIndex(index);
	}
	/** Re-bind components after modules:updated using the latest index (including patches). */
	async reloadIndexedModules(paths) {
		const index = this.lastComponentIndex ?? this._serverComponentIndex;
		if (!index) return null;
		const targetPaths = paths ?? this.pathsForIndex(index);
		await this.importModulesAtPaths(targetPaths);
		return this.applyComponentIndex(index);
	}
	/** Import modules from a modules:updated SSE payload, then re-bind the registry. */
	async reloadModulesFromServerUpdate(modules) {
		const list = Array.isArray(modules) ? modules : [];
		this.cacheServerModules(list);
		await this.importModules(list);
		const index = this.lastComponentIndex ?? this._serverComponentIndex;
		if (!index) return null;
		return this.applyComponentIndex(index);
	}
	async importModulesAtPaths(paths) {
		const mods = paths.map((path) => this.moduleCatalog.get(path)).filter((mod) => !!mod);
		await this.importModules(mods);
	}
	async importModules(modules) {
		const list = Array.isArray(modules) ? modules : [];
		if (list.length === 0) return;
		await this.loadCssFromModules(list);
		await this.importModulesFromUrls(list);
	}
	/** Fetch and inject sidecar CSS listed on each module (`import "./x.css"`). */
	async loadCssFromModules(modules) {
		const projectId = this._projectId;
		if (!projectId || typeof document === "undefined") return;
		const jobs = [];
		for (const mod of modules) {
			if (!mod.cssImports?.length) continue;
			for (const specifier of mod.cssImports) {
				const resolved = resolveCssImportPath(mod.path, specifier);
				if (!resolved) continue;
				if (this.injectedCssPaths.has(resolved)) continue;
				this.injectedCssPaths.add(resolved);
				jobs.push(injectCssImport(projectId, resolved).catch((err) => {
					this.injectedCssPaths.delete(resolved);
					const message = err instanceof Error ? err.message : String(err);
					console.warn(`[ComponentLoader] CSS import failed for ${resolved}: ${message}`);
				}));
			}
		}
		if (jobs.length === 0) return;
		await Promise.all(jobs);
		window.dispatchEvent(new CustomEvent("petal-css-updated"));
	}
	async pathsUsedOnCanvas(index) {
		this.prefetchCanvasComponentNames();
		try {
			const scan = await (this.canvasNamesInflight ?? this.fetchActivePageComponentNames());
			const paths = [...new Set(scan.names.map((name) => index[name]?.path).filter((path) => !!path))];
			if (paths.length > 0) return {
				kind: "components",
				paths
			};
			if (scan.parsed) return {
				kind: "html-only",
				paths: []
			};
			return {
				kind: "unknown",
				paths: []
			};
		} catch {
			return {
				kind: "unknown",
				paths: []
			};
		}
	}
	async fetchActivePageComponentNames() {
		const projectId = this._projectId;
		if (!projectId) return {
			names: [],
			parsed: false
		};
		const pages = await Promise.race([fetchPageList(projectId), new Promise((resolve) => setTimeout(resolve, 8e3, null))]);
		if (pages == null) return {
			names: [],
			parsed: false
		};
		const activeScan = scanCanvasUsage(pickActivePage(pages) ?? pages);
		if (activeScan.names.length > 0 || !Array.isArray(pages)) return activeScan;
		const allScan = scanCanvasUsage(pages);
		if (allScan.names.length > 0) return allScan;
		return activeScan;
	}
	async importModulesFromUrls(list) {
		await Promise.all(list.map(async (mod) => {
			if (mod.error || !mod.codeUrl) {
				const message = mod.error ?? "Missing compiled module URL";
				this.moduleErrors.set(mod.path, message);
				return;
			}
			const loadedUrl = this.loadedModuleUrls.get(mod.path);
			if (this.moduleRegistry.has(mod.path) && !this.moduleErrors.has(mod.path) && loadedUrl === mod.codeUrl) return;
			try {
				const exports = await executeCompiledModule(mod.codeUrl);
				this.moduleRegistry.set(mod.path, exports);
				this.loadedModuleUrls.set(mod.path, mod.codeUrl);
				this.moduleErrors.delete(mod.path);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				if (this.moduleRegistry.has(mod.path)) console.warn(`[ComponentLoader] Reload failed for ${mod.path}, keeping previous module: ${message}`);
				else {
					this.moduleErrors.set(mod.path, message);
					console.warn(`[ComponentLoader] Skipping ${mod.path}: ${message}`);
				}
			}
		}));
	}
	applyComponentIndex(index) {
		const prev = this._serverComponentIndex ?? {};
		const prevComponents = this._serverComponents ?? {};
		const rebuilt = {};
		for (const [key, meta] of Object.entries(index)) rebuilt[key] = {
			path: meta.path,
			exportName: meta.exportName,
			...prev[key]?.props ? { props: prev[key].props } : {},
			...meta.props ? { props: meta.props } : {},
			...meta.inspectsChildren || prev[key]?.inspectsChildren ? { inspectsChildren: true } : {}
		};
		const componentIndex = replaceEqualDeep(prev, rebuilt);
		const components = {};
		for (const [key, meta] of Object.entries(componentIndex)) {
			const ex = this.moduleRegistry.get(meta.path);
			const comp = meta.exportName === "default" ? ex?.default : ex?.[meta.exportName] ?? ex?.default;
			if (comp && (typeof comp === "function" || typeof comp === "object" && comp !== null && "$$typeof" in comp)) components[key] = comp;
			else if (prevComponents[key]) components[key] = prevComponents[key];
		}
		this._serverComponents = components;
		this._serverComponentIndex = componentIndex;
		this.lastComponentIndex = componentIndex;
		return {
			components: { ...components },
			componentIndex: { ...componentIndex }
		};
	}
	/** Merge a server patch and re-bind component functions from the module registry. */
	patchComponentIndex(patch) {
		const prev = this._serverComponentIndex ?? this.lastComponentIndex ?? {};
		const prevComponents = this._serverComponents ?? {};
		const componentIndex = { ...prev };
		const components = { ...prevComponents };
		for (const [key, incoming] of Object.entries(patch)) {
			const existing = prev[key];
			componentIndex[key] = replaceEqualDeep(existing, {
				path: incoming.path || existing?.path || "",
				exportName: incoming.exportName || existing?.exportName || key,
				...existing?.props ? { props: existing.props } : {},
				...incoming.props ? { props: incoming.props } : {},
				...incoming.inspectsChildren || existing?.inspectsChildren ? { inspectsChildren: true } : {}
			});
			const meta = componentIndex[key];
			const ex = this.moduleRegistry.get(meta.path);
			const comp = meta.exportName === "default" ? ex?.default : ex?.[meta.exportName] ?? ex?.default;
			if (comp && (typeof comp === "function" || typeof comp === "object" && comp !== null && "$$typeof" in comp)) components[key] = comp;
		}
		this._serverComponents = components;
		this._serverComponentIndex = componentIndex;
		this.lastComponentIndex = componentIndex;
		return {
			components: { ...components },
			componentIndex: { ...componentIndex }
		};
	}
	/**
	* Apply a components:updated patch, importing modules only when not yet bound.
	* Props-only patches must not force-reimport — that races with modules:updated
	* and can evict working bindings when the reload fails.
	*/
	async patchComponentIndexAndLoad(patch) {
		const pathsNeedingImport = this.pathsForIndex(patch).filter((path) => !this.moduleRegistry.has(path) || this.moduleErrors.has(path));
		if (pathsNeedingImport.length > 0) await this.importModulesAtPaths(pathsNeedingImport);
		return this.patchComponentIndex(patch);
	}
};
function cssDomId(cssPath) {
	return `petal-module-css-${cssPath.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}
/** Resolve a CSS import specifier against the importing module path. */
function resolveCssImportPath(modulePath, specifier) {
	const spec = specifier.trim().replace(/\\/g, "/");
	if (!spec) return null;
	if (/^https?:\/\//i.test(spec)) return spec;
	if (spec.startsWith("@/")) return spec.slice(2);
	if (!spec.startsWith(".")) return spec.replace(/^\//, "");
	const fromDir = modulePath.replace(/\\/g, "/").split("/").slice(0, -1);
	for (const part of spec.split("/")) {
		if (part === "." || part === "") continue;
		if (part === "..") {
			if (fromDir.length === 0) return null;
			fromDir.pop();
			continue;
		}
		fromDir.push(part);
	}
	return fromDir.join("/");
}
async function injectCssImport(projectId, cssPath) {
	const id = cssDomId(cssPath);
	const existing = document.getElementById(id);
	if (/^https?:\/\//i.test(cssPath)) {
		if (existing) return;
		const link = document.createElement("link");
		link.id = id;
		link.rel = "stylesheet";
		link.href = cssPath;
		document.head.appendChild(link);
		return;
	}
	const res = await fetch(`${getApiUrl()}/projects/${projectId}/files/by-path?path=${encodeURIComponent(cssPath)}`, {
		credentials: "include",
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const body = await res.json();
	const content = body && typeof body === "object" && typeof body.content === "string" ? body.content : null;
	if (content == null) return;
	const style = existing ?? document.createElement("style");
	style.id = id;
	style.textContent = stripUnresolvableCssImports(content);
	if (!existing) document.head.appendChild(style);
}
var KNOWN_CANVAS_ELEMENT_TYPES = /* @__PURE__ */ new Set([
	"html",
	"text",
	"component",
	"capture",
	"icon",
	"webview",
	"button",
	"tag",
	"single"
]);
/** Same order as the editor: the `page` URL parameter, then the last active page, then the first. */
function pickActivePage(pages) {
	if (!Array.isArray(pages) || pages.length === 0) return pages;
	const byId = (id) => id ? pages.find((page) => page && typeof page === "object" && page.id === id) : void 0;
	let urlId = null;
	let savedId = null;
	try {
		urlId = new URLSearchParams(window.location.search).get("page");
		savedId = localStorage.getItem("petal-active-page");
	} catch {}
	return byId(urlId) ?? byId(savedId) ?? pages[0];
}
function scanCanvasUsage(value) {
	const names = /* @__PURE__ */ new Set();
	let parsed = false;
	const visit = (node) => {
		if (node == null) return;
		if (Array.isArray(node)) {
			for (const item of node) visit(item);
			return;
		}
		if (typeof node !== "object") return;
		const record = node;
		if (typeof record.type === "string" && KNOWN_CANVAS_ELEMENT_TYPES.has(record.type)) parsed = true;
		if (typeof record.componentName === "string") names.add(record.componentName);
		const captured = record.capturedComponent;
		if (captured && typeof captured === "object") {
			const capturedName = captured.name;
			if (typeof capturedName === "string") names.add(capturedName);
		}
		const props = record.props;
		if (props && typeof props === "object") {
			const recordProps = props;
			const lgName = recordProps["data-lg-component"];
			const dataComponent = recordProps["data-component"];
			if (typeof lgName === "string") names.add(lgName);
			if (typeof dataComponent === "string") names.add(dataComponent);
		}
		if (record.type === "capture" && record.original && typeof record.original === "object") {
			const original = record.original;
			if (typeof original.componentName === "string") names.add(original.componentName);
		}
		if (record.byId && typeof record.byId === "object") {
			parsed = true;
			visit(record.byId instanceof Map ? [...record.byId.values()] : Object.values(record.byId));
		}
		visit(record.elements);
		visit(record.children);
		visit(record.canvas);
		visit(record.original);
	};
	visit(value);
	return {
		names: [...names],
		parsed
	};
}
var componentLoader = new WebComponentLoader();

export { componentLoader };
