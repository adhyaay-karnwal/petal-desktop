// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/frameAdoptionOps.ts
import { canAcceptChild } from "../../../../compiler/src/store/types.js";
import { getById, getIndex, getParentId } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createMoveOperation, createSetStylesOperation } from "./operations.js";
import { OUT_OF_FLOW_STYLE_KEYS } from "../../canvas/utils/absolutePositioning.js";

/** Hold the child exactly where the container was drawn over it. */
function pinned(styles, child) {
	return {
		...styles || {},
		position: "absolute",
		left: child.left,
		top: child.top,
		width: child.width,
		height: child.height
	};
}
/**
* Drop the child into flow with an explicit relative position. Null only when
* it is already normalized and carries no absolute offsets.
*/
function inFlow(styles) {
	const next = { ...styles };
	let stripped = false;
	for (const key of OUT_OF_FLOW_STYLE_KEYS) {
		if (next[key] === void 0) continue;
		delete next[key];
		stripped = true;
	}
	next.position = "relative";
	return stripped || styles?.position !== "relative" ? next : null;
}
/** How each layout restyles an adopted child. Add a layout by adding an entry. */
var CHILD_STYLES = {
	absolute: pinned,
	row: inFlow,
	column: inFlow,
	grid: inFlow
};
/**
* Draw-to-wrap (LUN-141): move each enclosed sibling into the container that
* `store` already contains.
*
* Ops are built against a walking cursor so every move records the index it
* actually had; `invertOperations` replays in reverse, so indices from a stale
* snapshot would corrupt order on undo. `set_styles` precedes its `move`,
* matching the drag-detach path, so the inverse restores styles after the move.
*/
function buildFrameAdoptionOps(store, containerId, adoption) {
	const container = getById(store, containerId);
	if (!container) return [];
	const restyle = CHILD_STYLES[adoption.layout];
	const ops = [];
	let cursor = store;
	let childIndex = 0;
	for (const child of adoption.children) {
		const el = getById(cursor, child.id);
		if (!el || !canAcceptChild(container, el)) continue;
		const nextStyles = restyle(el.styles, child);
		if (nextStyles) {
			const styleOp = createSetStylesOperation(cursor, child.id, nextStyles);
			if (styleOp) {
				ops.push(styleOp);
				cursor = applyOperationsToStore(cursor, [styleOp]);
			}
		}
		const moveOp = createMoveOperation(cursor, child.id, containerId, childIndex);
		if (!moveOp) continue;
		ops.push(moveOp);
		cursor = applyOperationsToStore(cursor, [moveOp]);
		childIndex += 1;
	}
	return ops;
}
/**
* Slot of the topmost layer being swallowed, so the container takes their place
* in the stack instead of jumping above every untouched sibling. Null when
* nothing is adopted from `parentId` — the caller appends.
*/
function frameSlotAmongAdoptees(store, adopt, parentId) {
	if (!adopt || adopt.children.length === 0) return null;
	let slot = Infinity;
	for (const child of adopt.children) {
		const parentKey = getParentId(store, child.id);
		if (!(parentId === null ? parentKey === "ROOT" || parentKey === null : parentKey === parentId)) continue;
		const index = getIndex(store, child.id);
		if (index >= 0 && index < slot) slot = index;
	}
	return slot === Infinity ? null : slot;
}

export { buildFrameAdoptionOps, frameSlotAmongAdoptees };
