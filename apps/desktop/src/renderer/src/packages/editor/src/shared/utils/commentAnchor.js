// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/commentAnchor.ts
import { resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { measureVisibleBounds } from "./visibleElement.js";

function findCommentElement(scope, elementId) {
	return scope.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
}
/** Coordinates are relative to the element's visible bounds, including Fragment roots. */
function commentAnchorAt(element, clientX, clientY) {
	const elementId = element.getAttribute("data-element-id");
	const bounds = measureVisibleBounds(element);
	if (!elementId || bounds.width <= 0 || bounds.height <= 0) return void 0;
	return {
		elementId,
		anchorX: (clientX - bounds.left) / bounds.width,
		anchorY: (clientY - bounds.top) / bounds.height
	};
}
function resolveCommentPosition(comment, viewport) {
	if (!comment.elementId || comment.anchorX == null || comment.anchorY == null) return comment;
	const element = findCommentElement(viewport, comment.elementId);
	if (!element) return comment;
	const bounds = measureVisibleBounds(element);
	if (bounds.width <= 0 || bounds.height <= 0) return comment;
	let clientX = bounds.left + bounds.width * comment.anchorX;
	let clientY = bounds.top + bounds.height * comment.anchorY;
	const canvas = viewport.closest("[data-canvas-root]");
	for (const marker of canvas?.querySelectorAll("[data-comment-drag-root]") ?? []) {
		const source = findCommentElement(viewport, marker.getAttribute("data-comment-drag-root"));
		if (!source?.contains(element)) continue;
		const original = measureVisibleBounds(source);
		const preview = marker.getBoundingClientRect();
		if (original.width > 0 && original.height > 0) {
			clientX = preview.left + (clientX - original.left) / original.width * preview.width;
			clientY = preview.top + (clientY - original.top) / original.height * preview.height;
		}
		break;
	}
	const rect = viewport.getBoundingClientRect();
	const camera = getCamera();
	return {
		...comment,
		canvasX: (clientX - rect.left - camera.positionX) / camera.scale,
		canvasY: (clientY - rect.top - camera.positionY) / camera.scale
	};
}
/** Match comment hover and click targets: canvas child normally, nested layer with Cmd/Ctrl. */
function findCommentTarget(target, viewport, store, deep) {
	if (!viewport.contains(target) || target.closest("[data-comment-ui], [data-overlay-container]")) return null;
	let id = null;
	for (let node = target; node && node !== viewport; node = node.parentElement) {
		const candidate = node.getAttribute("data-element-id");
		if (candidate && store.byId.has(candidate)) {
			id = candidate;
			break;
		}
	}
	if (!id) return null;
	if (deep) id = resolveTextOwner(store, id);
	else {
		let parent = store.parentByChild.get(id);
		while (parent && parent !== "ROOT") {
			id = parent;
			parent = store.parentByChild.get(id);
		}
	}
	return findCommentElement(viewport, id);
}
/** Paint geometry without waiting for a React commit during a pointer gesture. */
function paintCommentPin(pin, position) {
	if (position.canvasX == null || position.canvasY == null || pin.dataset.dragging === "true") return;
	const camera = getCamera();
	pin.dataset.commentCanvasX = String(position.canvasX);
	pin.dataset.commentCanvasY = String(position.canvasY);
	pin.style.left = `${position.canvasX * camera.scale + camera.positionX}px`;
	pin.style.top = `${position.canvasY * camera.scale + camera.positionY}px`;
}

export { commentAnchorAt, findCommentElement, findCommentTarget, paintCommentPin, resolveCommentPosition };
