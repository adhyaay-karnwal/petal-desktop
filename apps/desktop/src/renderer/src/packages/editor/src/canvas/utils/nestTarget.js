// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/nestTarget.ts
import { canAcceptChild, hasChildren$1 } from "../../../../compiler/src/store/types.js";
import { getById, getParentId, isDescendant } from "../../../../compiler/src/store/read.js";
import { isFullyInside } from "./collisionUtils.js";

function resolveNestTarget(input) {
	const { store, draggedId, currentParentId, hasLeftParent, candidateIds, excludeIds, draggedRect, getRect } = input;
	if (currentParentId !== null && !hasLeftParent) return null;
	const dragged = getById(store, draggedId);
	for (const id of candidateIds) {
		if (id === draggedId || excludeIds.has(id)) continue;
		if (isDescendant(store, draggedId, id)) continue;
		if (id === currentParentId) continue;
		const candidate = getById(store, id);
		if (!candidate || !hasChildren$1(candidate)) continue;
		if (dragged && !canAcceptChild(candidate, dragged)) continue;
		const rect = getRect(id);
		if (rect && isFullyInside(draggedRect, rect)) return id;
	}
	return null;
}
/** How many ancestors an element sits under. The canvas root is depth 0. */
function nestingDepth(store, elementId) {
	let depth = 0;
	for (let cursor = elementId; cursor && cursor !== "ROOT"; cursor = getParentId(store, cursor)) depth++;
	return depth;
}
/** True when the move takes the element from an upper level down into a lower one. */
function movesDeeper(store, fromParentId, toParentId) {
	return nestingDepth(store, toParentId) > nestingDepth(store, fromParentId);
}
/**
* Whether a drop should return the dragged element to its new parent's flow.
*
* Only flex/grid parents lay children out in flow, so nothing else qualifies —
* a freeform frame positions its children absolutely, and so does the canvas
* root, which is why moving *up* and out keeps an element absolute.
*
* Going down a level into a flex/grid parent means joining that parent's layout,
* so an absolute element returns to flow. An element that merely moves up or
* sideways keeps the position mode it was given.
*/
function shouldReturnToFlow(args) {
	if (!args.targetIsFlowLayout) return false;
	return !(args.draggedPosition === "absolute" || args.draggedPosition === "fixed") || args.movedDeeper;
}

export { movesDeeper, resolveNestTarget, shouldReturnToFlow };
