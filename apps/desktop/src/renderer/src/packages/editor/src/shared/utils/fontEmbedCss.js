// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/fontEmbedCss.ts

/**
* @font-face CSS for the fonts `root` uses, with each font file inlined as a
* data URL. Pass it as html-to-image's `fontEmbedCSS` on every capture.
*
* html-to-image's own lookup, on a cross-origin stylesheet it cannot read (Google
* Fonts, the project's CSS), fetches that sheet and inserts every rule into the
* editor's first inline <style>. Each capture, including every agent
* screenshot, grew that sheet by the project's whole stylesheet, leaking its
* rules into the editor, and restyled the page (130-150ms on a large canvas).
* Here cross-origin CSS is parsed into a detached CSSStyleSheet, so the document
* is never touched. Like html-to-image, only top-level @font-face rules are
* used; @import is not followed.
*/
async function fontEmbedCss(root) {
	const used = usedFontFamilies(root);
	const faces = [];
	for (const sheet of Array.from(document.styleSheets)) {
		const rules = await readableRules(sheet);
		for (const rule of rules) {
			if (!(rule instanceof CSSFontFaceRule)) continue;
			if (!used.has(normalizeFontFamily(rule.style.getPropertyValue("font-family")))) continue;
			faces.push({
				cssText: rule.cssText,
				base: sheet.href ?? document.baseURI
			});
		}
	}
	return (await Promise.all(faces.map(({ cssText, base }) => inlineFontUrls(cssText, base)))).join("\n");
}
/** Detached copies of cross-origin sheets, by href (a changed sheet gets a new href). */
var FETCH_TIMEOUT_MS = 4e3;
var FAILURE_RETRY_MS = 6e4;
var remoteRules = /* @__PURE__ */ new Map();
function cached$1(cache, url, load, fallback) {
	const existing = cache.get(url);
	if (existing && Date.now() < existing.retryAt) return existing.value;
	const entry = {
		value: Promise.resolve(fallback),
		retryAt: Infinity
	};
	entry.value = load().catch(() => {
		entry.retryAt = Date.now() + FAILURE_RETRY_MS;
		return fallback;
	});
	cache.set(url, entry);
	return entry.value;
}
async function readableRules(sheet) {
	try {
		return Array.from(sheet.cssRules);
	} catch {}
	const href = sheet.href;
	if (!href) return [];
	return cached$1(remoteRules, href, () => fetch(href, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).then((res) => {
		if (!res.ok) throw new Error(`${res.status}`);
		return res.text();
	}).then((text) => {
		const detached = new CSSStyleSheet();
		detached.replaceSync(text);
		return Array.from(detached.cssRules);
	}), []);
}
function normalizeFontFamily(family) {
	return family.trim().replace(/["']/g, "");
}
function usedFontFamilies(root) {
	const used = /* @__PURE__ */ new Set();
	for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) for (const family of getComputedStyle(el).fontFamily.split(",")) used.add(normalizeFontFamily(family));
	return used;
}
/** Font files as data URLs, by absolute URL. */
var fontDataUrls = /* @__PURE__ */ new Map();
async function inlineFontUrls(cssText, base) {
	const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
	const urls = /* @__PURE__ */ new Set();
	for (const match of cssText.matchAll(urlRe)) if (!match[2].startsWith("data:")) urls.add(match[2]);
	const resolved = /* @__PURE__ */ new Map();
	for (const url of urls) {
		const absolute = new URL(url, base).href;
		const inlined = await cached$1(fontDataUrls, absolute, () => fetch(absolute, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).then((res) => {
			if (!res.ok) throw new Error(`${res.status}`);
			return res.blob();
		}).then(blobToDataUrl$1), null);
		if (inlined) resolved.set(url, inlined);
	}
	return cssText.replace(urlRe, (token, _quote, url) => {
		const inlined = resolved.get(url);
		return inlined ? `url("${inlined}")` : token;
	});
}
function blobToDataUrl$1(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export { fontEmbedCss };
