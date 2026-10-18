// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/referenceImages.ts
import { getById, walk } from "../../../../../compiler/src/store/read.js";
import { captureElementImage } from "../../../shared/utils/captureElementImage.js";

/**
* Images attached to an agents-v2 turn for `@`-referenced canvas elements: a
* screenshot of each element and the images inside its subtree. They go to the
* agent only, so they are neither shown in the message nor saved with the chat.
* v1's `ChatPanel` keeps its own copy until it is removed.
*/
/** Screenshots per turn; each costs image tokens. */
var MAX_ELEMENT_SCREENSHOTS = 3;
/** Subtree images per turn, across every referenced element. */
var MAX_SUBTREE_IMAGES = 5;
/** Raw bytes. A larger image is omitted rather than attached to the turn. */
var MAX_IMAGE_BYTES = 3e6;
/** Bound screenshot and asset capture so a stuck image cannot hold the turn. */
var CAPTURE_TIMEOUT_MS = 7e3;
/** Capture a canvas element as a PNG data URL (same helper as MCP take_screenshot). */
async function captureElementScreenshot(elementId) {
	if (typeof document === "undefined") return null;
	let el = document.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
	if (!el) for (const iframe of Array.from(document.querySelectorAll("iframe"))) try {
		const found = iframe.contentDocument?.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
		if (found) {
			el = found;
			break;
		}
	} catch {}
	if (!el) return null;
	try {
		return await captureElementImage(el, { timeoutMs: CAPTURE_TIMEOUT_MS });
	} catch {
		return null;
	}
}
/** Per-element image URL extraction (inspects this element only — caller walks the subtree). */
function extractImageUrlsForElement(el, resolveAsset) {
	const results = [];
	if (el.type === "html" && el.tag === "img" && el.props?.src) results.push({
		url: resolveAsset(el.props.src),
		name: `img ${el.id}`
	});
	if (el.type === "component" && el.props) {
		for (const [key, value] of Object.entries(el.props)) if (typeof value === "string" && (key.toLowerCase().includes("src") || key.toLowerCase().includes("image") || key.toLowerCase().includes("avatar")) && (value.startsWith("data:image/") || value.startsWith("http") || value.includes(".petal-assets/"))) results.push({
			url: resolveAsset(value),
			name: `${key} of ${el.id}`
		});
	}
	if (el.styles?.backgroundImage) {
		const bgMatch = String(el.styles.backgroundImage).match(/url\(["']?(.+?)["']?\)/);
		if (bgMatch) results.push({
			url: resolveAsset(bgMatch[1]),
			name: `background of ${el.id}`
		});
	}
	return results;
}
/** Walk a subtree in the Store and collect image URLs from every node. */
function extractImageUrlsFromSubtree(store, rootId, resolveAsset) {
	const results = [];
	const visit = (id) => {
		const el = getById(store, id);
		if (el) results.push(...extractImageUrlsForElement(el, resolveAsset));
	};
	visit(rootId);
	walk(store, rootId, (descId) => visit(descId));
	return results;
}
/** Decoded byte length of a data URL, or the URL's own length when it is not one. */
function dataUrlByteLength(url) {
	const comma = url.indexOf(",");
	if (comma < 0) return url.length;
	const payload = url.slice(comma + 1);
	if (/;base64/i.test(url.slice(0, comma))) {
		const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
		return Math.floor(payload.length * 3 / 4) - padding;
	}
	try {
		return new TextEncoder().encode(decodeURIComponent(payload)).byteLength;
	} catch {
		return payload.length;
	}
}
function mediaType(header) {
	return (header ?? "").split(";")[0].trim().toLowerCase();
}
/** Read at most `maxBytes`, and nothing when the response already declares it is larger. */
async function readCappedBlob(response, maxBytes) {
	const declared = response.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (Number.isFinite(size) && size > maxBytes) {
			await response.body?.cancel();
			return null;
		}
	}
	const reader = response.body?.getReader();
	if (!reader) {
		const blob = await response.blob();
		return blob.size > maxBytes ? null : blob;
	}
	const chunks = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}
	return new Blob(chunks, { type: mediaType(response.headers.get("content-type")) });
}
/** Encode a blob as a data URL. Chunked so a multi-megabyte image does not overflow the stack. */
async function blobToDataUrl(blob) {
	const bytes = new Uint8Array(await blob.arrayBuffer());
	let binary = "";
	const chunkSize = 32768;
	for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	return `data:${blob.type};base64,${btoa(binary)}`;
}
/** Fetch an image URL and return it as a data URL. Returns null on failure. */
async function fetchImageAsDataUrl(url) {
	if (url.startsWith("data:")) {
		if (!url.startsWith("data:image/") || dataUrlByteLength(url) > MAX_IMAGE_BYTES) return null;
		return url;
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) return null;
		const type = mediaType(response.headers.get("content-type"));
		if (type && !type.startsWith("image/")) {
			await response.body?.cancel();
			return null;
		}
		const blob = await readCappedBlob(response, MAX_IMAGE_BYTES);
		if (!blob?.type.startsWith("image/")) return null;
		return await blobToDataUrl(blob);
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}
/**
* Image references for the elements a turn mentions, so the model sees the UI
* without calling take_screenshot first. Names say which referenced element
* each image belongs to. An element mentioned twice is captured once, an image
* reached through two referenced elements (one inside the other) is attached
* once, and elements no longer in `store` are skipped. A capture that fails is
* dropped rather than failing the turn.
*/
async function captureReferencedElementImages(store, refs, resolveAsset) {
	const elements = /* @__PURE__ */ new Map();
	for (const ref of refs) if (ref.type === "element" && !elements.has(ref.id) && getById(store, ref.id)) elements.set(ref.id, ref.name);
	if (elements.size === 0) return [];
	const label = (id) => `${elements.get(id)} (${id})`;
	const shots = await Promise.all([...elements.keys()].slice(0, MAX_ELEMENT_SCREENSHOTS).map(async (id) => {
		const dataUrl = await captureElementScreenshot(id);
		return dataUrl ? {
			id,
			dataUrl
		} : null;
	}));
	const imageUrls = /* @__PURE__ */ new Map();
	for (const id of elements.keys()) for (const { url, name } of extractImageUrlsFromSubtree(store, id, resolveAsset)) if (!imageUrls.has(url)) imageUrls.set(url, `Image inside ${label(id)}: ${name}`);
	const images = await Promise.all([...imageUrls].slice(0, MAX_SUBTREE_IMAGES).map(async ([url, name]) => {
		const dataUrl = await fetchImageAsDataUrl(url);
		return dataUrl ? {
			name,
			dataUrl
		} : null;
	}));
	const result = [];
	for (const shot of shots) {
		if (!shot) continue;
		result.push({
			type: "image",
			id: `ref-shot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			name: `Screenshot of ${label(shot.id)}`,
			data: shot.dataUrl
		});
	}
	for (const image of images) {
		if (!image) continue;
		result.push({
			type: "image",
			id: `canvas-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			name: image.name,
			data: image.dataUrl
		});
	}
	return result;
}

export { captureReferencedElementImages };
