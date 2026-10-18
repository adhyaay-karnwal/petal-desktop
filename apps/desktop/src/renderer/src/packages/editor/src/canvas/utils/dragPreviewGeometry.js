// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/dragPreviewGeometry.ts
import { resolveVisibleElement$1 } from "../../shared/utils/visibleElement.js";
import { accumulatedLinearTransform } from "./transformMatrix.js";

/** Read at pickup, before any preview is inserted: read while building the previews, computed
*  style forced a recalc of every preview inserted before it, ~5k nodes each. */
function readDragPreviewBox(id) {
	let node = Array.from(document.querySelectorAll(`[data-element-id="${CSS.escape(id)}"]`)).find((el) => !el.closest("[data-drag-overlay]"));
	if (!node) return;
	let depth = 0;
	let style = getComputedStyle(node);
	while (style.display === "contents" && node.firstElementChild) {
		node = node.firstElementChild;
		style = getComputedStyle(node);
		depth++;
	}
	return {
		depth,
		positioned: style.position === "absolute" || style.position === "fixed" || style.position === "relative"
	};
}
/** Freeze layout size and visual axes before moving an element out of its parent. */
function readDragPreviewGeometry(id) {
	const raw = Array.from(document.querySelectorAll(`[data-element-id="${CSS.escape(id)}"]`)).find((node) => !node.closest("[data-drag-overlay]"));
	if (!raw) return;
	const node = resolveVisibleElement$1(raw);
	const computed = getComputedStyle(node);
	const m = accumulatedLinearTransform(node);
	if (computed.transform === "none" && m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1) return;
	const width = node.offsetWidth, height = node.offsetHeight;
	if (!width || !height) return;
	const x = -(Math.min(0, m.a * width) + Math.min(0, m.c * height));
	const y = -(Math.min(0, m.b * width) + Math.min(0, m.d * height));
	return {
		width,
		height,
		transform: `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${x}, ${y})`
	};
}
function dragPreviewBoxSize(rect, scale) {
	return rect?.preview ? {
		width: rect.width / scale,
		height: rect.height / scale
	} : void 0;
}

export { dragPreviewBoxSize, readDragPreviewBox, readDragPreviewGeometry };
