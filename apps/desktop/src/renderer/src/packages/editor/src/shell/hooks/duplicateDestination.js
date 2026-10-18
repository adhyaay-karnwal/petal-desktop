// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/duplicateDestination.ts
import { getById, getChildren$2, getIndex, getParentId, isDescendant } from "../../../../compiler/src/store/read.js";

/**
* Where a canvas_duplicate copy lands.
*
* Split out from the tool handler because the index arithmetic (before vs after,
* clamping an agent-supplied index, the default "next sibling") is the part worth
* testing on its own; the handler around it is claims and store mutation.
*/
function resolveDuplicateDestination(store, elementId, anchor) {
	const { beforeId, afterId, parentId } = anchor;
	if ([
		beforeId,
		afterId,
		parentId
	].filter(Boolean).length > 1) return {
		ok: false,
		error: "Provide at most one of before_id, after_id, or parent_id."
	};
	if (!getById(store, elementId)) return {
		ok: false,
		error: `Element not found: ${elementId}`
	};
	const anchorId = beforeId || afterId || parentId;
	if (anchorId && !getById(store, anchorId)) return {
		ok: false,
		error: `Element not found: ${anchorId}`
	};
	let destParentId;
	let index;
	if (parentId) {
		destParentId = parentId;
		const childCount = getChildren$2(store, parentId).length;
		index = typeof anchor.index === "number" ? Math.max(0, Math.min(Math.floor(anchor.index), childCount)) : childCount;
	} else {
		const sibling = beforeId || afterId || elementId;
		const parentKey = getParentId(store, sibling);
		destParentId = parentKey === "ROOT" || parentKey === null ? null : parentKey;
		index = getIndex(store, sibling) + (beforeId ? 0 : 1);
	}
	if (destParentId && (destParentId === elementId || isDescendant(store, elementId, destParentId))) return {
		ok: false,
		error: `Cannot duplicate ${elementId} into its own subtree.`
	};
	return {
		ok: true,
		parentId: destParentId,
		index
	};
}

export { resolveDuplicateDestination };
