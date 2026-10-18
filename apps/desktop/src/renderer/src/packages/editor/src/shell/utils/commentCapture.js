// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/commentCapture.ts
import { getCamera } from "../hooks/useCommentAgent.js";
import { findCommentElement, resolveCommentPosition } from "../../shared/utils/commentAnchor.js";
import { canvasRectOfElementId } from "../../canvas/utils/canvasRegionCapture.js";
import { liveRegionAtCanvasPoint } from "../../canvas/utils/liveRegionAtPoint.js";

/** Capture a comment's current anchor before opening its agent chat. */
async function captureCommentContext(input, deps) {
	if (!deps.isCurrentPage()) return null;
	const position = resolveCommentPosition(input, input.viewport);
	const live = input.canvasEl && position.canvasX != null && position.canvasY != null ? await liveRegionAtCanvasPoint(input.viewport, position.canvasX, position.canvasY) : null;
	if (!deps.isCurrentPage()) return null;
	const frame = !live && input.element?.type === "webview" && input.canvasEl && input.elementId ? canvasRectOfElementId(input.canvasEl, input.viewport, input.elementId, getCamera()) : null;
	const rect = live?.rect ?? frame;
	if (input.canvasEl && rect) {
		const info = live ? await deps.describeLiveElement(live.fingerprint) : void 0;
		if (!deps.isCurrentPage()) return null;
		const captured = deps.captureRegion(rect, info);
		if (captured) {
			const image = await captured.screenshot.catch(() => null);
			return deps.isCurrentPage() ? {
				image,
				region: captured.region,
				elementName: input.elementName
			} : null;
		}
	}
	if (input.element?.type === "webview") return {
		image: null,
		elementName: input.elementName
	};
	const element = input.elementId ? findCommentElement(input.viewport, input.elementId) : input.viewport;
	if (!(element instanceof HTMLElement)) return {
		image: null,
		elementName: input.elementName
	};
	const image = await deps.captureElement(element).catch(() => null);
	return deps.isCurrentPage() ? {
		image,
		elementName: input.elementName
	} : null;
}

export { captureCommentContext };
