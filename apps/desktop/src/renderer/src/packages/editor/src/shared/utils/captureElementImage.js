// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/captureElementImage.ts
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { fontEmbedCss } from "./fontEmbedCss.js";

/**
* Element → PNG capture shared by the AI chat and MCP screenshot paths.
*
* Screenshots are for visual review, so width drives legibility and the scale
* must be uniform — clamping width and height independently stretches the image
* (html-to-image draws the source into the whole canvas) and flattens tall pages.
*/
/** Cap on output width; a full-width desktop page still fits comfortably under it. */
var MAX_WIDTH = 2400;
/** html-to-image rasterizes from the DOM, so upscaling adds real detail — but only up to a point. */
var MAX_UPSCALE$1 = 2;
/** Ceiling on canvas area — bounds raster cost and encoded size for very tall pages. */
var MAX_PIXELS = 6e6;
/** Uniform scale that fits an element into the capture budget without distorting it. */
function captureScale(width, height) {
	return Math.min(MAX_UPSCALE$1, MAX_WIDTH / width, Math.sqrt(MAX_PIXELS / (width * height)));
}
/**
* Component identity lives on a display:contents wrapper so it does not alter
* project layout. That wrapper has no box of its own; measuring/rasterizing it
* produces a fallback-sized bitmap with the real component offset and clipped.
* Resolve through single-host component wrappers to the element that paints.
*/
function resolveCaptureElement(el) {
	let current = el;
	const seen = /* @__PURE__ */ new Set();
	while (!seen.has(current)) {
		seen.add(current);
		const view = current.ownerDocument.defaultView;
		if (!view || view.getComputedStyle(current).display !== "contents") break;
		const children = Array.from(current.children).filter((child) => child instanceof view.HTMLElement);
		if (children.length !== 1) break;
		current = children[0];
	}
	return current;
}
/**
* A Live Preview's page, which html-to-image cannot read (its `<webview>` is a
* guest process), so a capture of the layer shows a blank page. In the desktop
* app the guest's own pixels are read back instead (`assets:capture-webview`).
* Null when `el` holds no preview; `dataUrl` is null when the page could not be
* read back, and `url` is the page it shows, for a capture that loads it anew.
*/
async function captureLivePreviewPage(el) {
	const page = el.localName === "webview" ? el : el.querySelector("webview");
	if (!page) return null;
	const url = page.getURL?.() || page.getAttribute("src");
	const bridge = window.api;
	if (!bridge || !page.getWebContentsId) return {
		dataUrl: null,
		url
	};
	try {
		return {
			dataUrl: await bridge.invoke("assets:capture-webview", { id: page.getWebContentsId() }),
			url
		};
	} catch {
		return {
			dataUrl: null,
			url
		};
	}
}
/** Rasterize an element to a PNG data URL, preserving its aspect ratio. */
async function captureElementImage(el, options = {}) {
	const { toPng } = await __bundledVitePreload(async () => {
		const { toPng } = await import("../../../../../vendor/html-to-image.js").then((n) => n.es_exports);
		return { toPng };
	}, [], import.meta.url);
	const target = resolveCaptureElement(el);
	const width = target.scrollWidth || target.offsetWidth || 200;
	const height = target.scrollHeight || target.offsetHeight || 200;
	const scale = captureScale(width, height);
	const capture = fontEmbedCss(target).then((fontEmbedCSS) => toPng(target, {
		fontEmbedCSS,
		width,
		height,
		canvasWidth: Math.max(1, Math.round(width * scale)),
		canvasHeight: Math.max(1, Math.round(height * scale)),
		pixelRatio: 1,
		filter: (node) => !node?.hasAttribute?.("data-overlay-container"),
		includeQueryParams: true
	}));
	if (!options.timeoutMs) return capture;
	let timeout;
	try {
		return await Promise.race([capture, new Promise((_, reject) => {
			timeout = setTimeout(() => reject(/* @__PURE__ */ new Error(`html-to-image timed out after ${options.timeoutMs}ms`)), options.timeoutMs);
		})]);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var t$2 = `bippy-0.5.39`;
var n$1 = Object.defineProperty;
var r$2 = Object.prototype.hasOwnProperty;
var i$4 = () => {};
var a$2 = (e) => {
	try {
		Function.prototype.toString.call(e).indexOf(`^_^`) > -1 && setTimeout(() => {
			throw Error(`React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build`);
		});
	} catch {}
};
var o$2 = (e = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => !!(e && `getFiberRoots` in e);
var s$2 = !1;
var c$3;
var l$2 = (e = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => s$2 ? !0 : (e && typeof e.inject == `function` && (c$3 = e.inject.toString()), !!c$3?.includes(`(injected)`));
var u$2 = /* @__PURE__ */ new Set();
var d$2 = /* @__PURE__ */ new Set();
var f$2 = (e) => {
	let r = /* @__PURE__ */ new Map(), o = 0, s = {
		_instrumentationIsActive: !1,
		_instrumentationSource: t$2,
		checkDCE: a$2,
		hasUnsupportedRendererAttached: !1,
		inject(e) {
			let t = ++o;
			return r.set(t, e), d$2.add(e), s._instrumentationIsActive || (s._instrumentationIsActive = !0, u$2.forEach((e) => e())), t;
		},
		on: i$4,
		onCommitFiberRoot: i$4,
		onCommitFiberUnmount: i$4,
		onPostCommitFiberRoot: i$4,
		renderers: r,
		supportsFiber: !0,
		supportsFlight: !0
	};
	try {
		n$1(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, {
			configurable: !0,
			enumerable: !0,
			get() {
				return s;
			},
			set(t) {
				if (t && typeof t == `object`) {
					let n = s.renderers;
					s = t, n.size > 0 && (n.forEach((e, n) => {
						d$2.add(e), t.renderers.set(n, e);
					}), p$2(e));
				}
			}
		});
		let t = window.hasOwnProperty, r = !1;
		n$1(window, `hasOwnProperty`, {
			configurable: !0,
			value: function(...e) {
				try {
					if (!r && e[0] === `__REACT_DEVTOOLS_GLOBAL_HOOK__`) return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = void 0, r = !0, -0;
				} catch {}
				return t.apply(this, e);
			},
			writable: !0
		});
	} catch {
		p$2(e);
	}
	return s;
};
var p$2 = (e) => {
	e && u$2.add(e);
	try {
		let n = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!n) return;
		if (!n._instrumentationSource) {
			n.checkDCE = a$2, n.supportsFiber = !0, n.supportsFlight = !0, n.hasUnsupportedRendererAttached = !1, n._instrumentationSource = t$2, n._instrumentationIsActive = !1;
			let e = o$2(n);
			if (e || (n.on = i$4), n.renderers.size) {
				n._instrumentationIsActive = !0, u$2.forEach((e) => e());
				return;
			}
			let r = n.inject, c = l$2(n);
			c && !e && (s$2 = !0, n.inject({ scheduleRefresh() {} }) && (n._instrumentationIsActive = !0)), n.inject = (e) => {
				let t = r(e);
				return d$2.add(e), c && n.renderers.set(t, e), n._instrumentationIsActive = !0, u$2.forEach((e) => e()), t;
			};
		}
		(n.renderers.size || n._instrumentationIsActive || l$2()) && e?.();
	} catch {}
};
var m$2 = () => r$2.call(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`);
var h$3 = (e) => m$2() ? (p$2(e), globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) : f$2(e);
var g$2 = () => !!(typeof window < `u` && (window.document?.createElement || window.navigator?.product === `ReactNative`));
var _$2 = () => {
	try {
		g$2() && h$3();
	} catch {}
};

export { _$2, captureElementImage, captureLivePreviewPage, d$2, h$3, resolveCaptureElement };
