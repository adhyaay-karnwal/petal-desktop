// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/fontLoader.ts
import { buildGoogleFontsUrl, extractInlineFontFamilies } from "../../../../compiler/src/runtime/googleFonts.js";

var CHUNK_SIZE = 30;
/** Round to stable batches and warm the neighboring rows in both directions. */
function getFontPreviewBatches(rows, first, last) {
	const start = Math.max(0, Math.floor(first / CHUNK_SIZE) - 1) * CHUNK_SIZE;
	const end = Math.min(rows.length, (Math.floor(last / CHUNK_SIZE) + 2) * CHUNK_SIZE);
	const batches = [];
	for (let i = start; i < end; i += CHUNK_SIZE) {
		const names = [];
		for (const row of rows.slice(i, i + CHUNK_SIZE)) if (row.source === "google") names.push(row.name);
		if (names.length) batches.push(names);
	}
	return batches;
}
/** Bounded LRU: keep up to six stable stylesheet batches while the picker is open. */
function createGoogleFontPreviewLoader() {
	const links = /* @__PURE__ */ new Map();
	const remove = (url, link) => {
		link.onload = null;
		link.remove();
		links.delete(url);
	};
	const clear = () => {
		for (const [url, link] of links) remove(url, link);
	};
	return {
		clear,
		sync(batches) {
			if (typeof document === "undefined") return;
			if (!batches.length) {
				clear();
				return;
			}
			for (const names of batches) {
				const url = buildGoogleFontsUrl(names, true);
				if (!url) continue;
				let link = links.get(url);
				if (link) links.delete(url);
				else {
					link = document.createElement("link");
					link.rel = "stylesheet";
					link.dataset.lgFontOwner = "picker";
					link.href = url;
					link.onload = () => {
						for (const name of names) document.fonts.load(`14px ${JSON.stringify(name)}`, name).catch(() => {});
					};
					document.head.appendChild(link);
				}
				links.set(url, link);
			}
			while (links.size > 6) {
				const [url, link] = links.entries().next().value;
				remove(url, link);
			}
		}
	};
}
/** Reconcile a bounded set of links. Removed families leave the DOM immediately. */
function syncGoogleFontLinks(id, families, preview = false) {
	if (typeof document === "undefined") return;
	const names = [...new Set(families)].sort();
	const urls = [];
	for (let i = 0; i < names.length; i += CHUNK_SIZE) {
		const url = buildGoogleFontsUrl(names.slice(i, i + CHUNK_SIZE), preview);
		if (url) urls.push(url);
	}
	const previous = [...document.querySelectorAll(`link[data-lg-font-owner="${id}"]`)];
	urls.forEach((url, index) => {
		const link = previous[index] ?? document.createElement("link");
		link.rel = "stylesheet";
		link.dataset.lgFontOwner = id;
		if (link.getAttribute("href") !== url) link.href = url;
		if (!link.isConnected) document.head.appendChild(link);
	});
	previous.slice(urls.length).forEach((link) => link.remove());
}
function clearGoogleFontLinks(id) {
	document.querySelectorAll(`link[data-lg-font-owner="${id}"]`).forEach((link) => link.remove());
}
function canvasGoogleFamilies(store, fonts) {
	const local = new Set(fonts?.local.map((font) => font.name.toLowerCase()) ?? []);
	return [...extractInlineFontFamilies(store)].filter((name) => !local.has(name.toLowerCase()));
}

export { canvasGoogleFamilies, clearGoogleFontLinks, createGoogleFontPreviewLoader, getFontPreviewBatches, syncGoogleFontLinks };
