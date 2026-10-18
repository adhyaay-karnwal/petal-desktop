// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/pointerTarget.ts
import { getParentId, resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { yieldsToCoveredRoot } from "./coveredRoot.js";

/**
* The element a pointer landing on `hitId` should target, in topmost mode.
*
* Mirrors what a left-click selects: walk up to the shallowest element whose
* parent hands the pointer to its children, let a child covering its root hand
* it back, then resolve a text leaf to the wrapper that owns it.
*/
function resolvePointerTarget(store, hitId, interactiveParentIds, drilledParentId) {
	let targetId = hitId;
	for (let parent = getParentId(store, targetId); parent && parent !== "ROOT" && !interactiveParentIds?.has(parent); parent = getParentId(store, targetId)) targetId = parent;
	while (yieldsToCoveredRoot(store, targetId, drilledParentId)) {
		const parent = getParentId(store, targetId);
		if (!parent || parent === "ROOT") break;
		targetId = parent;
	}
	return resolveTextOwner(store, targetId);
}

export { resolvePointerTarget };
