// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/unwrapOps.ts
import { canAcceptChild } from "../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getIndex, getParentId, isTextOwner } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createMoveOperation, createRemoveOperation, createSetPositionOperation, createSetStylesOperation } from "./operations.js";
import { isFlowLayoutDisplay, isRelativeFlowPosition, positionStylesForPlacement } from "../../canvas/utils/absolutePositioning.js";
import { hasExplicitLength, roundDetachLength } from "../../canvas/utils/elementDrag.js";

/** Item props that only meant something inside the frame's own layout. */
var FRAME_ITEM_STYLE_KEYS = [
	"flex",
	"flexGrow",
	"flexShrink",
	"flexBasis",
	"alignSelf",
	"justifySelf",
	"order",
	"gridArea",
	"gridColumn",
	"gridColumnStart",
	"gridColumnEnd",
	"gridRow",
	"gridRowStart",
	"gridRowEnd"
];
/**
* Where the frame's children land. A root frame's children become roots. An
* in-flow frame in a flex/grid parent hands its children to that layout at its
* slot. Anything else (a plain parent, or an out-of-flow frame that took no
* space) pins them where they are.
*/
function unwrapPlacement(store, frameId) {
	const parentKey = getParentId(store, frameId);
	if (parentKey === "ROOT" || parentKey === null) return "root";
	const position = getById(store, frameId)?.styles?.position;
	if (position === "absolute" || position === "fixed") return "freeform";
	return isFlowLayoutDisplay(String(getById(store, parentKey)?.styles?.display ?? "")) ? "flow" : "freeform";
}
/** A plain container whose children can all move up one level. */
function canUnwrap(store, frameId) {
	const frame = getById(store, frameId);
	if (!frame || frame.type !== "html" || frame.tag === "svg" || isTextOwner(store, frameId)) return false;
	const childIds = getChildren$2(store, frameId);
	if (childIds.length === 0) return false;
	const parentKey = getParentId(store, frameId);
	const parent = parentKey === "ROOT" || parentKey === null ? null : getById(store, parentKey);
	return childIds.every((id) => {
		const child = getById(store, id);
		if (!child) return false;
		return parent ? canAcceptChild(parent, child) : child.type !== "text";
	});
}
/**
* A child entering a flex/grid parent keeps its own sizing and follows that
* layout. Pinned (root or freeform) it keeps its measured spot, and any size
* the frame's layout was deciding is locked to pixels.
*/
function unwrappedStyles(styles, box, placement) {
	if (placement === "flow" || !box) return positionStylesForPlacement(styles, "flow");
	const next = { ...styles || {} };
	const flexSized = next.flex !== void 0 || next.flexGrow !== void 0 || next.flexBasis !== void 0;
	for (const key of FRAME_ITEM_STYLE_KEYS) delete next[key];
	if (flexSized || !hasExplicitLength(next.width)) next.width = `${roundDetachLength(box.width)}px`;
	if (flexSized || !hasExplicitLength(next.height)) next.height = `${roundDetachLength(box.height)}px`;
	const placed = positionStylesForPlacement(next, placement);
	if (placement === "freeform") {
		delete placed.right;
		delete placed.bottom;
		delete placed.inset;
		placed.left = roundDetachLength(box.x);
		placed.top = roundDetachLength(box.y);
	}
	return placed;
}
/**
* Unwrap (⇧⌘G): move every child of `frameId` into the frame's parent at the
* frame's slot, placed per `unwrapPlacement`, then delete the frame.
*
* Ops are built against a walking cursor so each records the index it really
* had, and `set_styles` precedes its `move` (matching the drag-detach path) so
* undo restores the styles after moving the child back. The frame is removed
* last, once empty, so undo re-inserts an empty frame before the moves refill it.
*/
function buildUnwrapOps(store, frameId, boxes) {
	if (!canUnwrap(store, frameId)) return [];
	const placement = unwrapPlacement(store, frameId);
	const parentKey = getParentId(store, frameId);
	const parentId = parentKey === "ROOT" || parentKey === null ? null : parentKey;
	const frameIndex = getIndex(store, frameId);
	if (frameIndex < 0) return [];
	const ops = [];
	let cursor = store;
	const commit = (op) => {
		if (!op) return;
		ops.push(op);
		cursor = applyOperationsToStore(cursor, [op]);
	};
	getChildren$2(store, frameId).forEach((childId, i) => {
		const child = getById(cursor, childId);
		const box = boxes.get(childId);
		const restyle = placement === "flow" ? !isRelativeFlowPosition(child?.styles) : !!box;
		if (child && restyle) commit(createSetStylesOperation(cursor, childId, unwrappedStyles(child.styles, box, placement)));
		commit(createMoveOperation(cursor, childId, parentId, frameIndex + i));
		if (placement === "root" && box) commit(createSetPositionOperation(cursor, childId, {
			x: roundDetachLength(box.x),
			y: roundDetachLength(box.y)
		}));
	});
	commit(createRemoveOperation(cursor, frameId));
	return ops;
}

export { buildUnwrapOps, canUnwrap, unwrapPlacement };
