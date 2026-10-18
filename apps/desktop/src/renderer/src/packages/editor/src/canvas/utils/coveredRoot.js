// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/coveredRoot.ts
import { getParentId } from "../../../../compiler/src/store/read.js";
import { getCanvasSpaceRect } from "./domGeometry.js";

var COVER_EPSILON = 1;
var coverCache = /* @__PURE__ */ new WeakMap();
/** True when `child` leaves no pixel of `parent` exposed. Pure — unit-tested. */
function rectCovers(child, parent) {
	return child.x <= parent.x + COVER_EPSILON && child.y <= parent.y + COVER_EPSILON && child.x + child.width >= parent.x + parent.width - COVER_EPSILON && child.y + child.height >= parent.y + parent.height - COVER_EPSILON;
}
/** Reads layout, so DOM-only. */
function coversParent(childId, parentId) {
	const child = getCanvasSpaceRect(childId);
	const parent = getCanvasSpaceRect(parentId);
	if (!child || !parent) return false;
	return rectCovers(child, parent);
}
/**
* True when `elementId` should let its click/hover bubble to its parent root
* instead of taking it. Only direct children of an un-drilled top-level root
* qualify, so the cheap store checks run first and geometry is measured only
* for the handful of elements that can actually be ambiguous.
*/
function yieldsToCoveredRoot(store, elementId, drilledParentId) {
	const parentId = getParentId(store, elementId);
	if (!parentId || parentId === "ROOT") return false;
	if (getParentId(store, parentId) !== "ROOT") return false;
	if (parentId === drilledParentId) return false;
	let cached = coverCache.get(store);
	if (!cached) {
		cached = /* @__PURE__ */ new Map();
		coverCache.set(store, cached);
	}
	const hit = cached.get(elementId);
	if (hit !== void 0) return hit;
	const covers = coversParent(elementId, parentId);
	cached.set(elementId, covers);
	return covers;
}

export { yieldsToCoveredRoot };
