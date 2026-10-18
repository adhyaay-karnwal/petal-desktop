// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/bake.ts
import { applyAdjustLut, buildAdjustLut } from "./imageAdjust.js";
import { readableAssetUrl } from "../utils/readableAssetUrl.js";
import { loadToneTables } from "./toneTables.js";

/** Thrown when the image's pixels can't be read (another origin without CORS). */
var UnreadableImageError = class extends Error {};
/** Table resolution: smaller while dragging, full for the saved image. */
var PREVIEW_LUT_SIZE$1 = 17;
var BAKE_LUT_SIZE = 33;
var WEBP_QUALITY = .95;
/** Longest side a bake decodes at; larger images would need several hundred MB per pixel buffer. */
var MAX_BAKE_SIDE = 8192;
async function readPixels(url, maxSide) {
	let res;
	try {
		res = await fetch(await readableAssetUrl(url));
	} catch (error) {
		throw new UnreadableImageError(error instanceof Error ? error.message : String(error));
	}
	if (!res.ok) throw new Error(`Image request failed: HTTP ${res.status}`);
	const bitmap = await createImageBitmap(await res.blob());
	const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const ctx = makeCanvas(width, height).getContext("2d", { willReadFrequently: true });
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();
	return ctx.getImageData(0, 0, width, height);
}
var PIXEL_CACHE_SIZE = 2;
var pixelCache = /* @__PURE__ */ new Map();
/** Pixels of `url` (resolved), at most `maxSide` on the longer side; shared between calls. */
function loadPixels(url, maxSide = MAX_BAKE_SIDE) {
	const key = `${maxSide}|${url}`;
	let pixels = pixelCache.get(key);
	if (!pixels) {
		pixels = readPixels(url, maxSide);
		const settled = pixels;
		settled.catch(() => {
			if (pixelCache.get(key) === settled) pixelCache.delete(key);
		});
		if (pixelCache.size >= PIXEL_CACHE_SIZE) pixelCache.delete(pixelCache.keys().next().value);
	} else pixelCache.delete(key);
	pixelCache.set(key, pixels);
	return pixels;
}
function makeCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}
async function render(source, adjust, lutSize) {
	const tables = await loadToneTables();
	const pixels = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
	applyAdjustLut(pixels.data, buildAdjustLut(adjust, tables, lutSize));
	const canvas = makeCanvas(source.width, source.height);
	canvas.getContext("2d").putImageData(pixels, 0, 0);
	return canvas;
}
async function encode$1(canvas) {
	const toBlob = (type, quality) => new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(/* @__PURE__ */ new Error("Encoding failed")), type, quality));
	const webp = await toBlob("image/webp", WEBP_QUALITY);
	return webp.type === "image/webp" ? webp : toBlob("image/png");
}
/** Preview for a slider drag, returned as an object URL the caller revokes. */
async function renderPreviewUrl(source, adjust) {
	return URL.createObjectURL(await encode$1(await render(source, adjust, PREVIEW_LUT_SIZE$1)));
}
/**
* Bakes and uploads at full size (capped at MAX_BAKE_SIDE); resolves with the canonical URL once decoded, so the swap can't flash.
* An aborted bake stops at the next stage and never uploads.
*/
async function bakeAndUpload(sourceUrl, adjust, backend, resolveAsset, signal) {
	const pixels = await loadPixels(sourceUrl);
	signal.throwIfAborted();
	const canvas = await render(pixels, adjust, BAKE_LUT_SIZE);
	signal.throwIfAborted();
	const blob = await encode$1(canvas);
	signal.throwIfAborted();
	const extension = blob.type === "image/webp" ? "webp" : "png";
	const result = await backend.uploadAsset(blob, `image-adjusted-${Date.now()}.${extension}`);
	if (!result.success || !result.url) throw new Error(result.error ?? "Upload failed");
	signal.throwIfAborted();
	const decoded = new Image();
	decoded.src = resolveAsset(result.url);
	await decoded.decode();
	return result.url;
}

export { UnreadableImageError, bakeAndUpload, loadPixels, renderPreviewUrl };
