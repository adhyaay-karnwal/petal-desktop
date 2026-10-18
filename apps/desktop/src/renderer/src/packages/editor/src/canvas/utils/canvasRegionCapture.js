// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/canvasRegionCapture.ts
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { fontEmbedCss } from "../../shared/utils/fontEmbedCss.js";
import { resolveCaptureElement } from "../../shared/utils/captureElementImage.js";
import { readRegionUnder } from "./canvasRegionSource.js";

/**
* What a hand-drawn canvas mask points at, in two parts:
* - `readCanvasRegion` (sync): the elements and React components it lands on.
*   Runs on release, so the chat chip can land immediately.
* - `captureRegionScreenshot` (async): a context screenshot — the mask plus its
*   surroundings, dimmed outside and outlined — filled into the chip after.
* Neither runs per pointer move; each reads element rects in one batched pass.
*/
var MAX_INSIDE = 12;
var MAX_WITHIN = 3;
var MAX_PARTIAL = 8;
/** Below this share of an element inside the mask, it is incidental. */
var MIN_COVERAGE = .02;
/** Output width cap — enough to read UI text without bloating the prompt. */
var MAX_IMAGE_WIDTH = 1600;
var MAX_UPSCALE = 2;
/** html-to-image rasterizes the whole host before we crop, so bound the host raster. */
var MAX_HOST_PIXELS = 12e6;
/** aiChat drops inline images whose base64 exceeds 4MB. */
var MAX_DATA_URL_LENGTH = 39e5;
var CAPTURE_TIMEOUT_MS$1 = 8e3;
/** Context around the mask, in screen px: proportional, within bounds. */
var CONTEXT_PAD_RATIO = .6;
var MIN_CONTEXT_PAD = 48;
var MAX_CONTEXT_PAD = 480;
/** Context shots are at least this wide for their height — a tall, narrow mask still gets surroundings. */
var MIN_CONTEXT_ASPECT = 4 / 3;
var DIM$2 = "rgba(0, 0, 0, 0.35)";
var OUTLINE = "#0A84FF";
function area(r) {
	return r.width * r.height;
}
function intersect(a, b) {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	const right = Math.min(a.x + a.width, b.x + b.width);
	const bottom = Math.min(a.y + a.height, b.y + b.height);
	return right > x && bottom > y ? {
		x,
		y,
		width: right - x,
		height: bottom - y
	} : null;
}
function contains$1(outer, inner, tolerance) {
	return inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance && inner.x + inner.width <= outer.x + outer.width + tolerance && inner.y + inner.height <= outer.y + outer.height + tolerance;
}
function clamp$2(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
/**
* The context frame around a mask: padded, widened to landscape around the
* mask's centre, and — when `bounds` is given — slid back inside them rather
* than cut at the edge, shrinking only if the frame is larger than the bounds.
*/
function framedCrop(mask, pad, bounds) {
	const height = mask.height + pad * 2;
	const width = Math.max(mask.width + pad * 2, height * MIN_CONTEXT_ASPECT);
	const frame = {
		x: mask.x + mask.width / 2 - width / 2,
		y: mask.y + mask.height / 2 - height / 2,
		width,
		height
	};
	if (!bounds) return frame;
	frame.width = Math.min(frame.width, bounds.width);
	frame.height = Math.min(frame.height, bounds.height);
	frame.x = clamp$2(frame.x, bounds.x, bounds.x + bounds.width - frame.width);
	frame.y = clamp$2(frame.y, bounds.y, bounds.y + bounds.height - frame.height);
	return frame;
}
/** Screen px of padding around the mask for the context screenshot. */
function contextPad(maskScreenWidth, maskScreenHeight) {
	return Math.min(MAX_CONTEXT_PAD, Math.max(MIN_CONTEXT_PAD, Math.max(maskScreenWidth, maskScreenHeight) * CONTEXT_PAD_RATIO));
}
/**
* Canvas-space rect of a DOM node. Client rects are scaled by the pan/zoom
* transform; subtracting the camera and dividing by its scale gives layout px.
* Component wrappers are display:contents and have no box, so fall back to
* the union of their children.
*/
function canvasRectOf(el, origin, camera) {
	let r = el.getBoundingClientRect();
	if (r.width === 0 && r.height === 0) {
		let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
		for (const child of el.children) {
			const c = child.getBoundingClientRect();
			if (c.width === 0 && c.height === 0) continue;
			left = Math.min(left, c.left);
			top = Math.min(top, c.top);
			right = Math.max(right, c.right);
			bottom = Math.max(bottom, c.bottom);
		}
		if (left === Infinity) return null;
		r = new DOMRect(left, top, right - left, bottom - top);
	}
	return {
		x: (r.left - origin.left - camera.positionX) / camera.scale,
		y: (r.top - origin.top - camera.positionY) / camera.scale,
		width: r.width / camera.scale,
		height: r.height / camera.scale
	};
}
/** Canvas-space box of a canvas element by id, or null when it isn't rendered (e.g. another page). */
function canvasRectOfElementId(canvasEl, viewportEl, id, camera) {
	const el = canvasEl.querySelector(`[data-element-id="${CSS.escape(id)}"]`);
	return el ? canvasRectOf(el, viewportEl.getBoundingClientRect(), camera) : null;
}
/** Canvas elements overlapping `area`, one batched layout read. */
function canvasHits(canvasEl, origin, camera, bounds) {
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const el of canvasEl.querySelectorAll("[data-element-id]")) {
		const id = el.dataset.elementId;
		if (seen.has(id)) continue;
		const rect = canvasRectOf(el, origin, camera);
		if (!rect || !intersect(bounds, rect)) continue;
		seen.add(id);
		hits.push({
			id,
			el,
			rect
		});
	}
	return hits;
}
var bySize = (a, b) => area(a.rect) - area(b.rect);
function readCanvasRegion(canvasEl, viewportEl, region, camera) {
	const vp = viewportEl.getBoundingClientRect();
	const tolerance = 1 / camera.scale;
	const hits = canvasHits(canvasEl, vp, camera, region);
	const insideHits = hits.filter((h) => contains$1(region, h.rect, tolerance));
	const insideEls = new Set(insideHits.map((h) => h.el));
	const outermostInside = insideHits.filter((h) => {
		const parent = h.el.parentElement?.closest("[data-element-id]");
		return !(parent instanceof HTMLElement && insideEls.has(parent));
	});
	const withinHits = hits.filter((h) => !insideEls.has(h.el) && contains$1(h.rect, region, tolerance)).sort(bySize);
	const partial = hits.filter((h) => !insideEls.has(h.el) && !contains$1(h.rect, region, tolerance)).map((h) => ({
		id: h.id,
		coverage: area(intersect(region, h.rect)) / Math.max(area(h.rect), 1),
		size: area(h.rect)
	})).filter((p) => p.coverage >= MIN_COVERAGE).sort((a, b) => b.coverage - a.coverage || a.size - b.size);
	return {
		inside: outermostInside.slice(0, MAX_INSIDE).map((h) => h.id),
		within: withinHits.slice(0, MAX_WITHIN).map((h) => h.id),
		partial: partial.slice(0, MAX_PARTIAL).map(({ id, coverage }) => ({
			id,
			coverage
		})),
		under: readRegionUnder({
			left: vp.left + camera.positionX + region.x * camera.scale,
			top: vp.top + camera.positionY + region.y * camera.scale,
			width: region.width * camera.scale,
			height: region.height * camera.scale
		}, canvasEl)
	};
}
async function withTimeout(work) {
	let timeout;
	try {
		return await Promise.race([work, new Promise((_, reject) => {
			timeout = setTimeout(() => reject(/* @__PURE__ */ new Error("Region capture timed out")), CAPTURE_TIMEOUT_MS$1);
		})]);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}
/**
* Draw `sourceRect` of `source` (showing `crop`) and mark `mask` on it: dim
* outside, outline inside. `crop` and `mask` share one unit; `sourceRect` is in
* source pixels.
*/
function renderAnnotated(source, sourceRect, crop, mask) {
	const scale = Math.min(MAX_IMAGE_WIDTH / crop.width, sourceRect.width / crop.width);
	const out = document.createElement("canvas");
	out.width = Math.max(1, Math.round(crop.width * scale));
	out.height = Math.max(1, Math.round(crop.height * scale));
	const ctx = out.getContext("2d");
	if (!ctx) return null;
	ctx.drawImage(source, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, 0, 0, out.width, out.height);
	const visible = intersect(mask, crop);
	if (visible) {
		const x = (visible.x - crop.x) * scale;
		const y = (visible.y - crop.y) * scale;
		const w = visible.width * scale;
		const h = visible.height * scale;
		ctx.fillStyle = DIM$2;
		ctx.fillRect(0, 0, out.width, y);
		ctx.fillRect(0, y + h, out.width, out.height - y - h);
		ctx.fillRect(0, y, x, h);
		ctx.fillRect(x + w, y, out.width - x - w, h);
		ctx.lineWidth = 2;
		ctx.strokeStyle = OUTLINE;
		ctx.strokeRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2));
	}
	const png = out.toDataURL("image/png");
	return png.length <= MAX_DATA_URL_LENGTH ? png : out.toDataURL("image/jpeg", .85);
}
/**
* Hide the editor chrome drawn over the design — selection/hover outlines and
* labels, toolbar, prompts, agent-follow frame, pixel grid: every viewport
* child except the pan/zoom wrapper that holds the design itself. Inline on
* those few nodes rather than a stylesheet, which would make the browser
* re-match styles across the whole canvas. Returns the restore.
*/
function hideEditorChrome(viewportEl) {
	const chrome = Array.from(viewportEl.children).filter((el) => el instanceof HTMLElement && !el.classList.contains("react-transform-wrapper"));
	const previous = chrome.map((el) => el.style.visibility);
	for (const el of chrome) el.style.visibility = "hidden";
	return () => chrome.forEach((el, i) => {
		el.style.visibility = previous[i];
	});
}
function nextFrames(count) {
	return new Promise((resolve) => {
		const step = (left) => left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
		step(count);
	});
}
function clientMaskOf(region, viewport, camera) {
	return {
		x: viewport.left + camera.positionX + region.x * camera.scale,
		y: viewport.top + camera.positionY + region.y * camera.scale,
		width: region.width * camera.scale,
		height: region.height * camera.scale
	};
}
/**
* Desktop: the pixels Electron already composited — open popovers, the current
* animation frame and WebGL included, none of which a DOM re-render reproduces.
*/
async function captureNative(invoke, mask, viewport) {
	const crop = framedCrop(mask, contextPad(mask.width, mask.height), {
		x: viewport.left,
		y: viewport.top,
		width: viewport.width,
		height: viewport.height
	});
	const rounded = {
		x: Math.floor(crop.x),
		y: Math.floor(crop.y),
		width: Math.ceil(crop.width),
		height: Math.ceil(crop.height)
	};
	const dataUrl = await invoke("canvas:capture-rect", rounded);
	if (typeof dataUrl !== "string") return null;
	const img = new Image();
	img.src = dataUrl;
	await img.decode();
	return renderAnnotated(img, {
		x: 0,
		y: 0,
		width: img.naturalWidth,
		height: img.naturalHeight
	}, rounded, mask);
}
/** Web: rasterize the tightest element around the context frame and mark the mask on it. */
async function captureRendered(host, mask, pad, origin, camera) {
	const target = resolveCaptureElement(host);
	const hostRect = canvasRectOf(target, origin, camera);
	if (!hostRect || !intersect(mask, hostRect)) return null;
	const visibleCrop = framedCrop(mask, pad, hostRect);
	const scale = Math.min(MAX_UPSCALE, MAX_IMAGE_WIDTH / visibleCrop.width, Math.sqrt(MAX_HOST_PIXELS / area(hostRect)));
	const { toCanvas } = await __bundledVitePreload(async () => {
		const { toCanvas } = await import("../../../../../vendor/html-to-image.js").then((n) => n.es_exports);
		return { toCanvas };
	}, [], import.meta.url);
	return renderAnnotated(await withTimeout(fontEmbedCss(target).then((fontEmbedCSS) => toCanvas(target, {
		fontEmbedCSS,
		width: hostRect.width,
		height: hostRect.height,
		canvasWidth: Math.max(1, Math.round(hostRect.width * scale)),
		canvasHeight: Math.max(1, Math.round(hostRect.height * scale)),
		pixelRatio: 1,
		filter: (node) => !node?.hasAttribute?.("data-overlay-container"),
		includeQueryParams: true
	}))), {
		x: (visibleCrop.x - hostRect.x) * scale,
		y: (visibleCrop.y - hostRect.y) * scale,
		width: visibleCrop.width * scale,
		height: visibleCrop.height * scale
	}, visibleCrop, mask);
}
/**
* The mask in context. Desktop grabs the screen with editor chrome hidden for
* those few frames (it flickers off briefly), so selection outlines and labels
* stay out of the shot; web re-renders the design, which never includes chrome.
* Viewport and camera are read at capture time, so a chat panel opening
* meanwhile cannot misplace the crop. Never throws.
*/
async function captureRegionScreenshot(canvasEl, viewportEl, region) {
	const invoke = window.api?.invoke;
	if (invoke) {
		const restoreChrome = hideEditorChrome(viewportEl);
		try {
			await nextFrames(2);
			const viewport = viewportEl.getBoundingClientRect();
			const shot = await captureNative(invoke, clientMaskOf(region, viewport, getCamera()), viewport);
			if (shot) return shot;
		} catch (err) {
			console.warn("[canvas region] native capture failed", err);
		} finally {
			restoreChrome();
		}
	}
	const camera = getCamera();
	const vp = viewportEl.getBoundingClientRect();
	const clientMask = clientMaskOf(region, vp, camera);
	const tolerance = 1 / camera.scale;
	const pad = contextPad(clientMask.width, clientMask.height) / camera.scale;
	const contextCrop = framedCrop(region, pad);
	const hits = canvasHits(canvasEl, vp, camera, contextCrop);
	const maskHits = hits.filter((h) => intersect(region, h.rect));
	let host = hits.filter((h) => contains$1(h.rect, contextCrop, tolerance)).sort(bySize)[0]?.el ?? maskHits.filter((h) => contains$1(h.rect, region, tolerance)).sort(bySize)[0]?.el ?? null;
	if (!host) {
		let best = 0;
		let bestSize = Infinity;
		for (const hit of maskHits) {
			const overlap = area(intersect(region, hit.rect));
			const size = area(hit.rect);
			if (overlap > best || overlap === best && size < bestSize) {
				best = overlap;
				bestSize = size;
				host = hit.el;
			}
		}
	}
	if (!host) return null;
	try {
		return await captureRendered(host, region, pad, vp, camera);
	} catch (err) {
		console.warn("[canvas region] screenshot failed", err);
		return null;
	}
}

export { canvasRectOfElementId, captureRegionScreenshot, readCanvasRegion };
