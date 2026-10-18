// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/services/projectStylesheet.ts
import { PROJECT_CSS_ISOLATION_TAIL } from "../utils/projectCssIsolation.js";

var COMPILED_LINK_ID = "petal-project-compiled-css";
var ISOLATION_STYLE_ID = "petal-project-css-isolation";
var LEGACY_COMPILED_LINK_ID = "petal-compiled-css";
/** projectId → cache key of the stylesheet currently applied */
var loadedKeyByProject = /* @__PURE__ */ new Map();
/** `${projectId}:${cacheKey}` → in-flight load */
var inFlightByKey = /* @__PURE__ */ new Map();
/** Content-addressed dist URLs are `…/path@hash`; extract hash for dedup. */
function cssUrlCacheKey(cssUrl) {
	try {
		const pathname = decodeURIComponent(new URL(cssUrl).pathname);
		const at = pathname.lastIndexOf("@");
		if (at !== -1) {
			const hash = pathname.slice(at + 1);
			if (hash) return hash;
		}
	} catch {
		const path = decodeURIComponent(cssUrl.split("?")[0]);
		const at = path.lastIndexOf("@");
		if (at !== -1) {
			const hash = path.slice(at + 1);
			if (hash) return hash;
		}
	}
	return cssUrl.split("?")[0];
}
function ensureIsolationTail() {
	if (document.getElementById(ISOLATION_STYLE_ID)) return;
	const isolation = document.createElement("style");
	isolation.id = ISOLATION_STYLE_ID;
	isolation.textContent = PROJECT_CSS_ISOLATION_TAIL;
	document.head.appendChild(isolation);
}
function injectFontLinks(fontUrls) {
	const previous = [...document.querySelectorAll("[data-lg-build-font]")];
	const urls = [...new Set(fontUrls)];
	urls.forEach((url, index) => {
		const link = previous[index] ?? document.createElement("link");
		link.rel = "stylesheet";
		link.dataset.lgBuildFont = String(index);
		if (link.getAttribute("href") !== url) link.href = url;
		if (!link.isConnected) document.head.appendChild(link);
	});
	previous.slice(urls.length).forEach((link) => link.remove());
}
function isStylesheetApplied(link) {
	return Boolean(link.sheet || link.href);
}
function reportCompiledClasses(compiledClasses, onCompiledClasses) {
	if (compiledClasses?.length) onCompiledClasses?.(compiledClasses);
}
/** Resolves false when the link already shows this stylesheet. */
async function loadStylesheetLink(link, cssUrl) {
	if (link.href === cssUrl && isStylesheetApplied(link)) return false;
	await new Promise((resolve, reject) => {
		const onLoad = () => {
			link.removeEventListener("load", onLoad);
			link.removeEventListener("error", onError);
			resolve();
		};
		const onError = () => {
			link.removeEventListener("load", onLoad);
			link.removeEventListener("error", onError);
			reject(/* @__PURE__ */ new Error(`Failed to load project stylesheet: ${cssUrl}`));
		};
		link.addEventListener("load", onLoad);
		link.addEventListener("error", onError);
		link.href = cssUrl;
	});
	return true;
}
/**
* Load the server-compiled project stylesheet once per content-addressed URL.
* Skips network fetch when css:ready repeats the same build output, and only
* the call that loads a new stylesheet announces `petal-css-updated`:
* listeners re-read styles and re-pin `<style>` tags, which restyles the page.
*/
async function loadProjectStylesheet(projectId, cssUrl, options = {}) {
	const { fontUrls, compiledClasses, onCompiledClasses } = options;
	const cacheKey = cssUrlCacheKey(cssUrl);
	if (fontUrls) injectFontLinks(fontUrls);
	const loadKey = `${projectId}:${cacheKey}`;
	if (loadedKeyByProject.get(projectId) === cacheKey) {
		const existing = document.getElementById(COMPILED_LINK_ID);
		if (existing && isStylesheetApplied(existing)) {
			ensureIsolationTail();
			reportCompiledClasses(compiledClasses, onCompiledClasses);
			return;
		}
	}
	const inFlight = inFlightByKey.get(loadKey);
	if (inFlight) {
		await inFlight;
		reportCompiledClasses(compiledClasses, onCompiledClasses);
		return;
	}
	const loadPromise = (async () => {
		document.getElementById(LEGACY_COMPILED_LINK_ID)?.remove();
		let link = document.getElementById(COMPILED_LINK_ID);
		if (!link) {
			link = document.createElement("link");
			link.id = COMPILED_LINK_ID;
			link.rel = "stylesheet";
			document.head.appendChild(link);
		}
		const didLoad = await loadStylesheetLink(link, cssUrl);
		ensureIsolationTail();
		loadedKeyByProject.set(projectId, cacheKey);
		return didLoad;
	})();
	inFlightByKey.set(loadKey, loadPromise);
	try {
		const didLoad = await loadPromise;
		reportCompiledClasses(compiledClasses, onCompiledClasses);
		if (didLoad) window.dispatchEvent(new CustomEvent("petal-css-updated"));
	} finally {
		if (inFlightByKey.get(loadKey) === loadPromise) inFlightByKey.delete(loadKey);
	}
}
function cleanupProjectStylesheet(projectId) {
	loadedKeyByProject.delete(projectId);
	for (const key of inFlightByKey.keys()) if (key.startsWith(`${projectId}:`)) inFlightByKey.delete(key);
	document.getElementById(COMPILED_LINK_ID)?.remove();
	document.getElementById(ISOLATION_STYLE_ID)?.remove();
	document.getElementById(LEGACY_COMPILED_LINK_ID)?.remove();
	document.querySelectorAll("[data-lg-build-font], [id^=\"petal-font-import-\"]").forEach((el) => el.remove());
}

export { cleanupProjectStylesheet, loadProjectStylesheet };
