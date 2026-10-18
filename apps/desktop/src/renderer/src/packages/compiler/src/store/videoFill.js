// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/store/videoFill.ts
import { hasChildren$1 } from "./types.js";

var VIDEO_FILL_PROP = "data-lg-video-fill";
/** Marks the rendered/emitted <video> as a fill rather than content. */
var VIDEO_FILL_MARKER = "data-lg-fill";
var NO_FILL_TAGS = /* @__PURE__ */ new Set([
	"video",
	"audio",
	"canvas",
	"iframe",
	"textarea",
	"select",
	"svg"
]);
/** Whether `el` can show a video fill: an HTML element that renders its children. */
function canHoldVideoFill(el) {
	return el.type === "html" && hasChildren$1(el) && !NO_FILL_TAGS.has(el.tag);
}
var FITS = [
	"cover",
	"contain",
	"fill"
];
var asFit = (value) => FITS.includes(value) ? value : "cover";
function parseVideoFill(value) {
	if (typeof value !== "string" || !value) return null;
	try {
		const parsed = JSON.parse(value);
		return typeof parsed.src === "string" && parsed.src ? {
			src: parsed.src,
			fit: asFit(parsed.fit)
		} : null;
	} catch {
		return null;
	}
}
function serializeVideoFill(fill) {
	return JSON.stringify({
		src: fill.src,
		fit: fill.fit
	});
}
/** Props and styles of the <video> that renders `fill`; the parent supplies position and isolation. */
function videoFillElement(fill) {
	return {
		props: {
			[VIDEO_FILL_MARKER]: true,
			src: fill.src,
			autoPlay: true,
			muted: true,
			loop: true,
			playsInline: true
		},
		styles: {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: fill.fit,
			zIndex: -1,
			pointerEvents: "none",
			borderRadius: "inherit"
		}
	};
}
/** Reads a `<video data-lg-fill>` back into a fill, or null if it isn't one. */
function videoFillFromElement(tag, props, styles) {
	if (tag !== "video" || !props || props["data-lg-fill"] === void 0) return null;
	return typeof props.src === "string" && props.src ? {
		src: props.src,
		fit: asFit(styles?.objectFit)
	} : null;
}

export { VIDEO_FILL_PROP, canHoldVideoFill, parseVideoFill, serializeVideoFill, videoFillElement, videoFillFromElement };
