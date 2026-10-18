// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/videoPreviewSession.ts
import { resolveElementNode } from "../../../../../canvas/utils/domGeometry.js";
import { buildAdjustLut } from "../../../../../shared/imageAdjust/imageAdjust.js";
import { readableAssetUrl } from "../../../../../shared/utils/readableAssetUrl.js";
import { loadToneTables } from "../../../../../shared/imageAdjust/toneTables.js";
import { GlLutRenderer } from "../../../../../shared/imageAdjust/glLutRenderer.js";

/** Preview tables are smaller; the bake uses the full size. */
var PREVIEW_LUT_SIZE = 17;
/** Longest side of the thumbnail copy, in pixels. */
var THUMB_MAX_PX = 480;
/** How long the overlay waits for a newly committed video to load before giving up. */
var SWAP_TIMEOUT_MS = 3e3;
/** Re-seek the hidden copy when it drifts this far (seconds) from the canvas video. */
var MAX_DRIFT_S = .15;
var SYNC_EVENTS = [
	"play",
	"pause",
	"seeked",
	"ratechange"
];
function objectFitRect(fit, box, media) {
	if (fit === "fill" || !media.width || !media.height) return {
		x: 0,
		y: 0,
		...box
	};
	const contain = Math.min(box.width / media.width, box.height / media.height);
	const scale = fit === "cover" ? Math.max(box.width / media.width, box.height / media.height) : fit === "none" ? 1 : fit === "scale-down" ? Math.min(1, contain) : contain;
	const width = media.width * scale;
	const height = media.height * scale;
	return {
		x: (box.width - width) / 2,
		y: (box.height - height) / 2,
		width,
		height
	};
}
var VideoPreviewSession = class {
	constructor(key, elementId, sourceUrl, callbacks) {
		this.key = key;
		this.callbacks = callbacks;
		this.source = document.createElement("video");
		this.overlay = null;
		this.renderer = null;
		this.thumb = document.createElement("canvas");
		this.thumbRenderer = null;
		this.thumbStream = null;
		this.pixelScale = 1;
		this.pending = null;
		this.frameRequest = 0;
		this.videoFrameRequest = 0;
		this.ended = false;
		this.sync = () => {
			const { video, source } = this;
			if (!video || this.ended) return;
			source.playbackRate = video.playbackRate;
			if (Math.abs(source.currentTime - video.currentTime) > MAX_DRIFT_S) source.currentTime = video.currentTime;
			if (video.paused) source.pause();
			else source.play().catch(() => {});
		};
		const node = resolveElementNode(elementId);
		this.video = node instanceof HTMLVideoElement ? node : node?.querySelector(`video[data-lg-fill]`) ?? node?.querySelector("video") ?? null;
		const parent = this.video?.offsetParent;
		if (!this.video || !(parent instanceof HTMLElement)) return;
		try {
			this.overlay = this.createOverlay(this.video, parent);
			this.renderer = new GlLutRenderer(this.overlay);
			this.thumbRenderer = new GlLutRenderer(this.thumb);
		} catch (error) {
			this.overlay?.remove();
			this.overlay = null;
			callbacks.onLoadError(error);
			return;
		}
		this.loadSource(sourceUrl);
		for (const type of SYNC_EVENTS) this.video.addEventListener(type, this.sync);
	}
	loadSource(sourceUrl) {
		const { source } = this;
		source.crossOrigin = "anonymous";
		source.muted = true;
		source.playsInline = true;
		source.preload = "auto";
		source.addEventListener("loadeddata", this.sync, { once: true });
		source.addEventListener("error", () => this.callbacks.onLoadError(source.error), { once: true });
		readableAssetUrl(sourceUrl).then((url) => {
			if (!this.ended) source.src = url;
		});
	}
	createOverlay(video, parent) {
		const overlay = document.createElement("canvas");
		this.pixelScale = video.getBoundingClientRect().width / (video.offsetWidth || 1) * (window.devicePixelRatio || 1);
		overlay.width = Math.max(1, Math.round(video.offsetWidth * this.pixelScale));
		overlay.height = Math.max(1, Math.round(video.offsetHeight * this.pixelScale));
		const computed = getComputedStyle(video);
		Object.assign(overlay.style, {
			position: "absolute",
			left: `${video.offsetLeft}px`,
			top: `${video.offsetTop}px`,
			width: `${video.offsetWidth}px`,
			height: `${video.offsetHeight}px`,
			borderRadius: computed.borderRadius,
			pointerEvents: "none",
			zIndex: computed.zIndex
		});
		overlay.dataset.objectFit = computed.objectFit;
		if (video.parentElement === parent) video.after(overlay);
		else parent.appendChild(overlay);
		return overlay;
	}
	request(adjust) {
		if (!this.renderer) return;
		this.pending = adjust;
		if (!this.frameRequest) this.frameRequest = requestAnimationFrame(() => void this.applyPending());
	}
	async applyPending() {
		this.frameRequest = 0;
		const adjust = this.pending;
		this.pending = null;
		if (!adjust || this.ended) return;
		const tables = await loadToneTables();
		if (this.ended || !this.renderer) return;
		const lut = buildAdjustLut(adjust, tables, PREVIEW_LUT_SIZE);
		this.renderer.setLut(lut);
		this.thumbRenderer?.setLut(lut);
		this.paint();
		if (!this.videoFrameRequest) this.followPlayback();
	}
	followPlayback() {
		if (this.ended) return;
		this.videoFrameRequest = this.source.requestVideoFrameCallback(() => {
			this.paint();
			this.sync();
			this.followPlayback();
		});
	}
	paint() {
		const { source, overlay, renderer } = this;
		if (!overlay || !renderer || source.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
		const rect = objectFitRect(overlay.dataset.objectFit ?? "contain", {
			width: overlay.width,
			height: overlay.height
		}, {
			width: source.videoWidth * this.pixelScale,
			height: source.videoHeight * this.pixelScale
		});
		renderer.draw(source, {
			x: Math.round(rect.x),
			y: Math.round(rect.y),
			width: Math.round(rect.width),
			height: Math.round(rect.height)
		});
		this.paintThumb();
	}
	paintThumb() {
		const { source, thumb, thumbRenderer } = this;
		if (!thumbRenderer || !source.videoWidth || !source.videoHeight) return;
		const scale = Math.min(1, THUMB_MAX_PX / Math.max(source.videoWidth, source.videoHeight));
		const width = Math.round(source.videoWidth * scale);
		const height = Math.round(source.videoHeight * scale);
		if (thumb.width !== width || thumb.height !== height) {
			thumb.width = width;
			thumb.height = height;
		}
		thumbRenderer.draw(source);
		if (!this.thumbStream) {
			this.thumbStream = thumb.captureStream();
			this.callbacks.onShown(this.thumbStream);
		}
	}
	/** Stops previewing. Without `restoreTo` the bake committed, so the overlay waits for the new video to load. */
	end(restoreTo) {
		this.ended = true;
		if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
		if (this.videoFrameRequest) this.source.cancelVideoFrameCallback(this.videoFrameRequest);
		for (const type of SYNC_EVENTS) this.video?.removeEventListener(type, this.sync);
		const remove = () => {
			this.renderer?.dispose();
			this.thumbRenderer?.dispose();
			this.thumbStream?.getTracks().forEach((track) => track.stop());
			this.overlay?.remove();
			this.source.removeAttribute("src");
			this.source.load();
		};
		if (restoreTo !== void 0 || !this.video) {
			remove();
			return;
		}
		const timeout = setTimeout(remove, SWAP_TIMEOUT_MS);
		this.video.addEventListener("loadeddata", () => {
			clearTimeout(timeout);
			remove();
		}, { once: true });
	}
};

export { VideoPreviewSession };
