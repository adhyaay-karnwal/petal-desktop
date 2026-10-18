// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/liveRegionAtPoint.ts
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { liveProbeFor } from "../../shared/state/liveProbeChannel.js";

/**
* The element under a comment pin inside a Live Preview, as a canvas-space
* area. Same hit as a click in the ⇧⌘S mask: look through editor chrome, ask
* the guest what is under the point, and use that element's box.
*/
/** Editor chrome drawn over the canvas, and the cursor layer over its content in comment and hand mode. Hit-tests look through it. */
var CANVAS_HIT_CHROME = "[data-cursor-layer], [data-region-mask], [data-overlay-container], [data-canvas-bottom-chrome], [data-inner-pick], [data-live-preview-overlay], [data-hover-outline-id], [data-selection-overlay-id], [data-selection-label-id], [data-comment-ui]";
/** Guest element under a canvas point, or null when the point is not inside a Live Preview. */
async function liveRegionAtCanvasPoint(viewport, canvasX, canvasY) {
	const camera = getCamera();
	const origin = viewport.getBoundingClientRect();
	const clientX = origin.left + camera.positionX + canvasX * camera.scale;
	const clientY = origin.top + camera.positionY + canvasY * camera.scale;
	const hit = document.elementsFromPoint(clientX, clientY).find((el) => !el.closest(CANVAS_HIT_CHROME));
	if (hit?.tagName !== "WEBVIEW" || !viewport.contains(hit)) return null;
	const box = await liveProbeFor(hit)?.(clientX, clientY).catch(() => null);
	if (!box || box.width <= 0 || box.height <= 0) return null;
	const width = Math.round(box.width / camera.scale);
	const height = Math.round(box.height / camera.scale);
	if (width <= 0 || height <= 0) return null;
	return {
		rect: {
			x: Math.round((box.left - origin.left - camera.positionX) / camera.scale),
			y: Math.round((box.top - origin.top - camera.positionY) / camera.scale),
			width,
			height
		},
		fingerprint: box.fingerprint
	};
}

export { CANVAS_HIT_CHROME, liveRegionAtCanvasPoint };
