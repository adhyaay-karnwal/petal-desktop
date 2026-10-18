// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/imagePreviewSession.ts
import { resolveElementNode } from "../../../../../canvas/utils/domGeometry.js";
import { loadPixels, renderPreviewUrl } from "../../../../../shared/imageAdjust/bake.js";

/** Object URLs stay alive this long after the saved image replaces them on screen. */
var REVOKE_DELAY_MS = 2e3;
function canvasImageSlot(node, target, shownUrl) {
	const img = target === "img" ? node?.tagName === "IMG" ? node : node?.querySelector("img") : null;
	let current = null;
	return {
		show(previewUrl) {
			if (img) img.setAttribute("src", previewUrl);
			else if (node) {
				const background = node.style.backgroundImage;
				const from = current && background.includes(current) ? current : shownUrl();
				if (!background.includes(from)) return;
				node.style.backgroundImage = background.split(from).join(previewUrl);
			}
			current = previewUrl;
		},
		/** Replaces our preview, if it's still on the node, with `latestUrl`. */
		restore(latestUrl) {
			if (!current) return;
			if (img?.getAttribute("src") === current) img.setAttribute("src", latestUrl);
			else if (!img && node?.style.backgroundImage.includes(current)) node.style.backgroundImage = node.style.backgroundImage.split(current).join(latestUrl);
			current = null;
		}
	};
}
function displaySide(node) {
	const rect = node?.getBoundingClientRect();
	const side = rect ? Math.max(rect.width, rect.height) : 0;
	return Math.max(256, Math.ceil(side * (window.devicePixelRatio || 1)));
}
var ImagePreviewSession = class {
	constructor(key, elementId, target, shownUrl, sourceUrl, callbacks) {
		this.key = key;
		this.callbacks = callbacks;
		this.rendering = false;
		this.pending = null;
		this.lastPreview = null;
		this.ended = false;
		const node = resolveElementNode(elementId);
		this.slot = canvasImageSlot(node, target, shownUrl);
		this.pixels = loadPixels(sourceUrl, displaySide(node));
		this.pixels.catch(callbacks.onLoadError);
		loadPixels(sourceUrl).catch(() => {});
	}
	request(adjust) {
		this.pending = adjust;
		requestAnimationFrame(() => void this.renderLatest());
	}
	/** Stops previewing; with `restoreTo`, swaps our preview on the canvas for that (resolved) URL. */
	end(restoreTo) {
		this.ended = true;
		if (restoreTo) this.slot.restore(restoreTo);
		const stale = this.lastPreview;
		if (stale) setTimeout(() => URL.revokeObjectURL(stale), REVOKE_DELAY_MS);
	}
	async renderLatest() {
		if (this.rendering || !this.pending || this.ended) return;
		this.rendering = true;
		const adjust = this.pending;
		this.pending = null;
		try {
			const previewUrl = await renderPreviewUrl(await this.pixels, adjust);
			const decoded = new Image();
			decoded.src = previewUrl;
			await decoded.decode();
			if (this.ended) {
				URL.revokeObjectURL(previewUrl);
				return;
			}
			this.slot.show(previewUrl);
			this.callbacks.onShown(previewUrl);
			if (this.lastPreview) URL.revokeObjectURL(this.lastPreview);
			this.lastPreview = previewUrl;
		} catch {} finally {
			this.rendering = false;
			if (this.pending) requestAnimationFrame(() => void this.renderLatest());
		}
	}
};

export { ImagePreviewSession };
