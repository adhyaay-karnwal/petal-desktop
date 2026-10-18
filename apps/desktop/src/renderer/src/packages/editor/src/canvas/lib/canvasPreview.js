// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/canvasPreview.ts
import { __bundled__mapDeps } from "../../../../../__bundle__/_preamble.js";
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { fontEmbedCss } from "../../shared/utils/fontEmbedCss.js";
import { cameraToFit } from "../utils/zoom.js";
import { suspendTextHighlights } from "../utils/textHighlight.js";

/**
* Captures a page — or one pinned top-level element — as the project's
* dashboard thumbnail.
*
* The default is what "Zoom to fit" shows, on the page's canvas background:
* every top-level element is rasterized separately and composed at its canvas
* position, so the cost scales with content rather than with the 4000x4000
* canvas container, and the empty space between artboards costs nothing. The
* caller decides which page and whether a pin overrides it; this module
* composes the result into a fixed frame so every thumbnail has the same shape.
*
* Each root is rasterized from the live canvas; a large page is drawn from its
* biggest elements only (`PREVIEW_ELEMENT_BUDGET`), so the cost has a ceiling.
* Given an abort signal, the capture yields between roots and stops there when
* it is aborted (the user is back). The editor's text underline is lifted for
* the read.
*/
/**
* Output frame, 16:10 to match the dashboard card. Cards stretch to ~640px CSS
* in a two-column grid; 1280 keeps that crisp on a 2x display. The API only
* accepts a WebP of exactly this size, so the frame is the contract.
*/
var PREVIEW_FRAME_WIDTH = 1280;
var PREVIEW_FRAME_HEIGHT = 800;
var PREVIEW_WEBP_QUALITY = 82;
/**
* The frame is a zoom-to-fit of a card-sized viewport rendered at 2x, so it
* stays crisp on a retina display.
*/
var FRAME_PIXEL_RATIO = 2;
/**
* A pinned element at least this wide is a page design: show its top (the
* hero) and crop the rest. Narrower pins — phones, cards, components — and
* whole-page captures are shown in full.
*/
var PAGE_MIN_WIDTH = 768;
/** A broken asset shouldn't cost us the whole preview — render a gap instead. */
var TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
/**
* Top-level elements on the page as rendered. A root's wrapper
* (`[data-canvas-root-id]`) is only editor scaffolding — an absolutely
* positioned shell at the element's canvas position — so the wrapper gives the
* geometry and the first `[data-element-id]` inside is what gets drawn.
* Offsets are layout values: zoom/pan is a transform on an ancestor and doesn't
* affect them.
*/
function collectRootBoxes(content, rootId) {
	const wrappers = rootId ? [content.querySelector(`[data-canvas-root-id="${CSS.escape(rootId)}"]`)] : Array.from(content.querySelectorAll("[data-canvas-root-id]"));
	const boxes = [];
	for (const wrapper of wrappers) {
		if (!wrapper) continue;
		const width = wrapper.offsetWidth;
		const height = wrapper.offsetHeight;
		if (width < 1 || height < 1 || !wrapper.querySelector("[data-element-id]")) continue;
		boxes.push({
			wrapper,
			x: wrapper.offsetLeft,
			y: wrapper.offsetTop,
			width,
			height
		});
	}
	return boxes;
}
/** The camera the canvas's "Zoom to fit" picks, in a card-sized viewport. */
function fitPlacement(bounds) {
	const camera = cameraToFit([bounds], PREVIEW_FRAME_WIDTH / FRAME_PIXEL_RATIO, PREVIEW_FRAME_HEIGHT / FRAME_PIXEL_RATIO);
	if (!camera) return null;
	return {
		scale: camera.scale * FRAME_PIXEL_RATIO,
		originX: camera.positionX * FRAME_PIXEL_RATIO,
		originY: camera.positionY * FRAME_PIXEL_RATIO
	};
}
/**
* A pinned page design fills the frame: centered horizontally, anchored to the
* top when taller so it shows its header rather than its middle.
*/
function coverPlacement(bounds) {
	const scale = Math.max(PREVIEW_FRAME_WIDTH / bounds.width, PREVIEW_FRAME_HEIGHT / bounds.height);
	const drawHeight = bounds.height * scale;
	return {
		scale,
		originX: (PREVIEW_FRAME_WIDTH - bounds.width * scale) / 2 - bounds.x * scale,
		originY: (drawHeight > PREVIEW_FRAME_HEIGHT ? 0 : (PREVIEW_FRAME_HEIGHT - drawHeight) / 2) - bounds.y * scale
	};
}
/**
* Computed properties copied onto each rasterized node. html-to-image copies
* every property by default (~350 reads and writes per node), which is most of
* a capture's cost on a large page; these are the ones a thumbnail shows.
*/
var THUMBNAIL_STYLE_PROPERTIES = [
	"display",
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"z-index",
	"float",
	"clear",
	"box-sizing",
	"width",
	"height",
	"min-width",
	"min-height",
	"max-width",
	"max-height",
	"aspect-ratio",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"border-top-width",
	"border-right-width",
	"border-bottom-width",
	"border-left-width",
	"border-top-style",
	"border-right-style",
	"border-bottom-style",
	"border-left-style",
	"border-top-color",
	"border-right-color",
	"border-bottom-color",
	"border-left-color",
	"border-top-left-radius",
	"border-top-right-radius",
	"border-bottom-right-radius",
	"border-bottom-left-radius",
	"border-collapse",
	"border-spacing",
	"table-layout",
	"overflow-x",
	"overflow-y",
	"text-overflow",
	"visibility",
	"opacity",
	"flex-direction",
	"flex-wrap",
	"flex-grow",
	"flex-shrink",
	"flex-basis",
	"order",
	"justify-content",
	"justify-items",
	"justify-self",
	"align-content",
	"align-items",
	"align-self",
	"row-gap",
	"column-gap",
	"grid-template-columns",
	"grid-template-rows",
	"grid-template-areas",
	"grid-auto-flow",
	"grid-auto-columns",
	"grid-auto-rows",
	"grid-column-start",
	"grid-column-end",
	"grid-row-start",
	"grid-row-end",
	"color",
	"background-color",
	"background-image",
	"background-size",
	"background-position-x",
	"background-position-y",
	"background-repeat",
	"background-clip",
	"background-origin",
	"-webkit-background-clip",
	"-webkit-text-fill-color",
	"box-shadow",
	"filter",
	"backdrop-filter",
	"mix-blend-mode",
	"transform",
	"transform-origin",
	"clip-path",
	"outline-width",
	"outline-style",
	"outline-color",
	"outline-offset",
	"object-fit",
	"object-position",
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"font-stretch",
	"font-variant",
	"line-height",
	"letter-spacing",
	"word-spacing",
	"text-align",
	"text-indent",
	"text-transform",
	"text-shadow",
	"text-decoration-line",
	"text-decoration-color",
	"text-decoration-style",
	"text-decoration-thickness",
	"white-space",
	"word-break",
	"overflow-wrap",
	"vertical-align",
	"direction",
	"writing-mode",
	"-webkit-line-clamp",
	"-webkit-box-orient",
	"list-style-type",
	"list-style-position",
	"list-style-image",
	"fill",
	"fill-opacity",
	"fill-rule",
	"stroke",
	"stroke-width",
	"stroke-opacity",
	"stroke-linecap",
	"stroke-linejoin",
	"stroke-dasharray",
	"stroke-dashoffset",
	"d",
	"cx",
	"cy",
	"r",
	"rx",
	"ry",
	"x",
	"y"
];
/**
* html-to-image embeds each <img> by `fetch`-ing its src. Project asset URLs
* (`/assets/by-path`) redirect to R2, and that cross-origin redirect fails the
* CORS fetch, so images come out blank. For the capture only, fetch their
* `inline=1` variant, which the API serves itself with CORS.
*/
async function withInlineAssetFetch(run) {
	const original = window.fetch;
	window.fetch = (input, init) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		if (!url.includes("/assets/by-path") || url.includes("inline=")) return original(input, init);
		return original(`${url}${url.includes("?") ? "&" : "?"}inline=1`, init);
	};
	try {
		return await run();
	} finally {
		window.fetch = original;
	}
}
/**
* html-to-image copies a <video>'s current frame and a <canvas>'s pixels with
* `toDataURL`, which throws on cross-origin content and fails the whole
* capture. A video with a source is skipped (its box keeps the background, as
* an unloaded video would); a canvas only when it is tainted.
*/
function unreadablePixels(node) {
	if (node instanceof HTMLVideoElement) return node.currentSrc !== "";
	if (!(node instanceof HTMLCanvasElement)) return false;
	try {
		node.toDataURL();
		return false;
	} catch {
		return true;
	}
}
/** Resolves on the next task, so input queued during a root's capture runs first. */
function nextTask() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}
/**
* Most elements on a large page are smaller than a pixel on the card. A page
* with more than this many is drawn from its biggest elements only, so the
* capture's cost stops growing with the page. Smaller pages are drawn in full.
*/
var PREVIEW_ELEMENT_BUDGET = 4e3;
/**
* The elements to draw when `targets` hold more than the budget: the biggest on
* screen, with their ancestors so each has a parent to render into. Null when
* everything fits. Screen rects all share the camera's scale, so they rank the
* same as layout sizes, and they measure SVG too.
*/
function budgetedElements(targets) {
	const elements = targets.flatMap((target) => [target, ...target.getElementsByTagName("*")]);
	if (elements.length <= PREVIEW_ELEMENT_BUDGET) return null;
	const ranked = elements.map((element) => {
		const rect = element.getBoundingClientRect();
		return {
			element,
			area: rect.width * rect.height
		};
	}).filter(({ area }) => area > 0).sort((a, b) => b.area - a.area);
	const kept = new Set(targets);
	for (const { element } of ranked) {
		if (kept.size >= PREVIEW_ELEMENT_BUDGET) break;
		for (let node = element; node && !kept.has(node); node = node.parentElement) kept.add(node);
	}
	return kept;
}
/**
* A Live Preview's page can't be rasterized as HTML, so it draws as an empty
* box. In the desktop app, a capture of the page's pixels (the asset export's
* `assets:capture-webview`) is drawn over that box. One compositor readback
* per preview, only when a thumbnail is taken; a page that can't be captured
* stays blank, as before. `x`/`y` are the root's frame position and `scale`
* frame px per canvas px.
*/
async function drawPreviewPages(ctx, box, x, y, scale) {
	const bridge = window.api;
	if (!bridge) return;
	const pages = box.wrapper.querySelectorAll("webview");
	if (pages.length === 0) return;
	const rootRect = box.wrapper.getBoundingClientRect();
	const zoom = rootRect.width / box.width;
	for (const page of pages) {
		if (!page.getWebContentsId) continue;
		try {
			const src = await bridge.invoke("assets:capture-webview", { id: page.getWebContentsId() });
			const img = document.createElement("img");
			img.src = src;
			await img.decode();
			const rect = page.getBoundingClientRect();
			ctx.drawImage(img, x + (rect.left - rootRect.left) / zoom * scale, y + (rect.top - rootRect.top) / zoom * scale, rect.width / zoom * scale, rect.height / zoom * scale);
		} catch {}
	}
}
/**
* Rasterize the page's top-level elements (or just `rootId` when pinned) into
* the preview frame, as WebP. A page with no top-level elements captures as
* its bare background, so emptying the page replaces the old thumbnail.
* Resolves null when there is nothing to capture — including when a pinned
* element isn't on the page currently in the DOM, so editing another page
* never overwrites a pinned thumbnail.
*/
async function captureCanvasPreview(rootId, signal) {
	const content = document.querySelector("[data-canvas-content]");
	if (!content) return null;
	const boxes = collectRootBoxes(content, rootId);
	if (boxes.length === 0) {
		if (rootId !== null || content.querySelector("[data-canvas-root-id]")) return null;
		const frame = backgroundFrame(content);
		return frame ? encodeWebp(frame) : null;
	}
	const minX = Math.min(...boxes.map((b) => b.x));
	const minY = Math.min(...boxes.map((b) => b.y));
	const bounds = {
		x: minX,
		y: minY,
		width: Math.max(...boxes.map((b) => b.x + b.width)) - minX,
		height: Math.max(...boxes.map((b) => b.y + b.height)) - minY
	};
	const placement = rootId !== null && bounds.width >= PAGE_MIN_WIDTH ? coverPlacement(bounds) : fitPlacement(bounds);
	if (!placement) return null;
	const { scale, originX, originY } = placement;
	const { toCanvas } = await __bundledVitePreload(async () => {
		const { toCanvas } = await import("../../../../../vendor/html-to-image.js").then((n) => n.es_exports);
		return { toCanvas };
	}, [], import.meta.url);
	const frame = backgroundFrame(content);
	const ctx = frame?.getContext("2d");
	if (!frame || !ctx) return null;
	await document.fonts.ready;
	const targets = boxes.map((box) => box.wrapper.querySelector("[data-element-id]"));
	const budgeted = budgetedElements(targets);
	const fontEmbedCSS = budgeted ? "" : await fontEmbedCss(content);
	const tooSmall = (node) => node.childElementCount === 0 && node.offsetWidth * scale < .5 && node.offsetHeight * scale < .5;
	const skipsNode = (node) => node instanceof Element && (budgeted ? !budgeted.has(node) : node instanceof HTMLElement && tooSmall(node)) || node instanceof HTMLElement && unreadablePixels(node);
	if (!await withInlineAssetFetch(async () => {
		for (const [i, box] of boxes.entries()) {
			if (signal) {
				await nextTask();
				if (signal.aborted) return false;
			}
			if (!content.isConnected) return false;
			const target = targets[i];
			const width = Math.max(1, Math.round(box.width * scale));
			const height = Math.max(1, Math.round(box.height * scale));
			const restoreHighlights = suspendTextHighlights(target);
			try {
				const rendered = await toCanvas(target, {
					width: box.width,
					height: box.height,
					canvasWidth: width,
					canvasHeight: height,
					pixelRatio: 1,
					fontEmbedCSS,
					includeStyleProperties: THUMBNAIL_STYLE_PROPERTIES,
					filter: (node) => !skipsNode(node),
					includeQueryParams: true,
					imagePlaceholder: TRANSPARENT_PIXEL
				});
				const x = Math.round(originX + box.x * scale);
				const y = Math.round(originY + box.y * scale);
				ctx.drawImage(rendered, x, y, width, height);
				await drawPreviewPages(ctx, box, x, y, scale);
			} finally {
				restoreHighlights();
			}
		}
		return true;
	})) return null;
	if (!content.isConnected) return null;
	return encodeWebp(frame);
}
/**
* An empty preview frame filled with the page's canvas background, as the
* editor paints it (a per-page colour or the theme default).
*/
function backgroundFrame(content) {
	const frame = document.createElement("canvas");
	frame.width = PREVIEW_FRAME_WIDTH;
	frame.height = PREVIEW_FRAME_HEIGHT;
	const ctx = frame.getContext("2d");
	if (!ctx) return null;
	const viewport = content.closest("[data-canvas-viewport]");
	if (viewport) {
		ctx.fillStyle = getComputedStyle(viewport).backgroundColor;
		ctx.fillRect(0, 0, PREVIEW_FRAME_WIDTH, PREVIEW_FRAME_HEIGHT);
	}
	return frame;
}
/**
* The API stores the upload as-is, so the encode happens here rather than on
* the server. Safari can't encode WebP from a canvas and hands back a PNG
* instead; that falls back to the WASM encoder the asset export already ships.
*/
async function encodeWebp(frame) {
	const blob = await new Promise((resolve) => frame.toBlob(resolve, "image/webp", PREVIEW_WEBP_QUALITY / 100));
	if (blob?.type === "image/webp") return blob;
	const { encodeWithWorker } = await __bundledVitePreload(async () => {
		const { encodeWithWorker } = await import("../../shared/utils/exportAssets.js");
		return { encodeWithWorker };
	}, [], import.meta.url);
	return encodeWithWorker(frame, "webp", PREVIEW_WEBP_QUALITY);
}

export { captureCanvasPreview };
