// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/elementDrag.ts
import { canAcceptChild } from "../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getIndex, getParentId, getRootIds, isDescendant } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createMoveOperation, createSetStylesOperation } from "../../shared/utils/operations.js";
import { computeAbsoluteOffsetStyles, isRelativeFlowPosition, positionStylesForPlacement } from "./absolutePositioning.js";
import { isCompletelyOutside } from "./collisionUtils.js";
import { screenToCanvas } from "./dragFrame.js";
import { hasAncestorIn, resolveMoveTarget } from "../../shared/utils/dropPlan.js";
import { movesDeeper, resolveNestTarget, shouldReturnToFlow } from "./nestTarget.js";

/** True for a length the author set outright. An auto/percentage/missing value is
*  derived from the parent, so it is the only kind that needs locking on detach. */
function hasExplicitLength(value) {
	if (typeof value === "number") return true;
	return typeof value === "string" && /^-?\d*\.?\d+(px|rem|em|ch|vh|vw|pt)$/.test(value.trim());
}
/** The measured size is a screen rect divided by the camera scale, so at a fractional
*  zoom it round-trips to noise (360 became 359.9999785962981px in a real file).
*  Snap to whole pixels within a hair, else keep two decimals. */
function roundDetachLength(value) {
	const whole = Math.round(value);
	return Math.abs(value - whole) < .01 ? whole : Math.round(value * 100) / 100;
}
/** Style overrides applied to detached elements: lock visual size (width/height in canvas-space px)
*  for the axes the layout was deciding. An axis the author sized explicitly is left alone —
*  overwriting `width: 360px` with a re-measured 359.9999785962981px loses the authored value
*  and dirties the file for nothing.
*  Margin is intentionally preserved — canvas_pos is shifted by -margin to compensate. */
var DETACH_STYLE_OVERRIDES = (widthCanvas, heightCanvas, styles) => ({
	...hasExplicitLength(styles?.width) ? {} : { width: `${roundDetachLength(widthCanvas)}px` },
	...hasExplicitLength(styles?.height) ? {} : { height: `${roundDetachLength(heightCanvas)}px` }
});
/** Explicitly return a child to flow, clearing any offsets from an absolute parent. */
function createFlowPositionOperation(store, elementId) {
	const element = getById(store, elementId);
	if (!element || isRelativeFlowPosition(element.styles)) return null;
	return createSetStylesOperation(store, elementId, positionStylesForPlacement(element.styles, "flow"));
}
/** The nearest selected ancestor-or-self of an element, or null. */
function findSelectedAncestor(store, elementId, selectedIds) {
	if (selectedIds.has(elementId)) return elementId;
	let cursor = elementId;
	while (cursor) {
		const parentKey = getParentId(store, cursor);
		if (!parentKey || parentKey === "ROOT") return null;
		if (selectedIds.has(parentKey)) return parentKey;
		cursor = parentKey;
	}
	return null;
}
/** Selection if the lead is part of a multi-select, otherwise just the lead. */
function getDraggedIds(draggedId, selectedIds) {
	if (selectedIds.has(draggedId) && selectedIds.size > 1) return selectedIds;
	return /* @__PURE__ */ new Set([draggedId]);
}
/** Start rects top-to-bottom, then left-to-right: the visual order a multi-drop keeps. */
var visualOrder = (starts) => (a, b) => {
	const ra = starts.get(a)?.rect;
	const rb = starts.get(b)?.rect;
	if (!ra || !rb) return 0;
	if (ra.top !== rb.top) return ra.top - rb.top;
	return ra.left - rb.left;
};
/**
* Ops that nest one dragged element into `parentId` (the geometry target from
* resolveNestTarget), planned against `cursor`. Flex/grid parents normalize the child
* back into flow. Freeform parents make it absolute, rewrite its offsets relative to the
* new parent so it stays exactly where it was dropped (Framer-style), and establish a
* positioning context on the parent (mirrors onAddElement). Null when the freeform
* offsets can't be measured.
*/
function planNestOps(cursor, id, parentId, pointerDeltaScreen, drag, env) {
	const fromKey = getParentId(cursor, id);
	const fromParentId = fromKey === "ROOT" || fromKey === null ? null : fromKey;
	const ops = [];
	if (shouldReturnToFlow({
		targetIsFlowLayout: env.isFlowLayout(parentId),
		draggedPosition: getById(cursor, id)?.styles?.position,
		movedDeeper: movesDeeper(cursor, fromParentId, parentId)
	})) {
		const styleOp = createFlowPositionOperation(cursor, id);
		if (styleOp) {
			ops.push(styleOp);
			cursor = applyOperationsToStore(cursor, [styleOp]);
		}
		const moveOp = createMoveOperation(cursor, id, parentId, getChildren$2(cursor, parentId).length);
		if (moveOp) ops.push(moveOp);
		return ops;
	}
	const startState = drag.starts.get(id);
	const parentBox = env.paddingBox(parentId);
	if (!startState?.rect || !parentBox) return null;
	const newStyles = computeAbsoluteOffsetStyles({
		startStyles: positionStylesForPlacement(startState.styles, "freeform"),
		startRect: env.toLiveRect(startState.rect),
		containingBox: parentBox,
		margins: {
			marginLeft: startState.marginLeft,
			marginTop: startState.marginTop,
			marginRight: startState.marginRight,
			marginBottom: startState.marginBottom
		},
		canvasDelta: {
			x: pointerDeltaScreen.x / drag.startScale,
			y: pointerDeltaScreen.y / drag.startScale
		},
		canvasScale: env.scale,
		autoPin: true
	});
	const parentEl = getById(cursor, parentId);
	const parentPos = parentEl?.styles?.position;
	if (parentEl && parentPos !== "relative" && parentPos !== "absolute" && parentPos !== "fixed") {
		const parentStyleOp = createSetStylesOperation(cursor, parentId, {
			...parentEl.styles || {},
			position: "relative"
		});
		if (parentStyleOp) ops.push(parentStyleOp);
	}
	const selfStyleOp = createSetStylesOperation(cursor, id, newStyles);
	if (selfStyleOp) ops.push(selfStyleOp);
	const moveOp = createMoveOperation(cursor, id, parentId, getChildren$2(cursor, parentId).length);
	if (moveOp) ops.push(moveOp);
	return ops;
}
/**
* The ops a drop commits as one undo step, or null when it commits nothing.
* An empty array still commits: a flex-slot drop always does, so an Alt
* duplicate's clones are kept even when the move itself plans no ops.
*
* Multi-drag: a flex slot inserts every dragged element at it, in visual
* order; a nest target takes each one it can accept; otherwise nested
* elements detach to the root and every element keeps its preview position.
*
* Single drag:
* 1a. a flex slot moves it there;
* 1b. a nest target takes it;
* 2. pulled out of its parent, it detaches to the root where it was dropped;
* 3. a root moves;
* 4. an absolute child still in its parent gets new offsets (Framer-style);
* 5. an in-flow child still in its parent stays put.
*/
function planDrop(drop, env) {
	const { tree, activeId, draggedIds, dropSlot, overId, shouldDetach, starts, startFrame, startScale, pointerDeltaScreen } = drop;
	const canvasDelta = {
		x: pointerDeltaScreen.x / startScale,
		y: pointerDeltaScreen.y / startScale
	};
	if (draggedIds.size > 1) return planMultiDrop(drop, env, canvasDelta);
	const currentParentKey = getParentId(tree, activeId);
	const currentParentId = currentParentKey === "ROOT" || currentParentKey === null ? null : currentParentKey;
	const isAbsolutePositioned = getById(tree, activeId)?.styles?.position === "absolute";
	if (dropSlot && env.planElementMove) return env.planElementMove(activeId, dropSlot.targetId, dropSlot.position);
	if (overId) {
		const ops = planNestOps(tree, activeId, overId, pointerDeltaScreen, drop, env);
		if (ops) return ops.length > 0 ? ops : null;
		return env.planElementMove ? env.planElementMove(activeId, overId, "inside") : null;
	}
	if (shouldDetach) {
		const startState = starts.get(activeId);
		const startRect = startState?.rect ?? null;
		if (!startState || startState.parentId === null || !startRect || !startFrame) return null;
		const start = screenToCanvas({
			x: startRect.left,
			y: startRect.top
		}, startFrame);
		const newPosition = {
			x: start.x + pointerDeltaScreen.x / startFrame.scale - startState.marginLeft,
			y: start.y + pointerDeltaScreen.y / startFrame.scale - startState.marginTop
		};
		const newStyles = positionStylesForPlacement({
			...startState.styles || {},
			...DETACH_STYLE_OVERRIDES(startRect.width / startFrame.scale, startRect.height / startFrame.scale, startState.styles)
		}, "root");
		return [
			{
				type: "set_styles",
				elementId: activeId,
				oldStyles: startState.styles,
				newStyles
			},
			{
				type: "move",
				elementId: activeId,
				fromParentId: startState.parentId,
				toParentId: null,
				fromIndex: startState.index,
				toIndex: getRootIds(tree).length
			},
			{
				type: "set_position",
				elementId: activeId,
				oldPosition: startState.position ? { ...startState.position } : void 0,
				newPosition
			}
		];
	}
	if (!currentParentId) {
		if (Math.abs(canvasDelta.x) < 1 && Math.abs(canvasDelta.y) < 1) return null;
		const draggedEl = getById(tree, activeId);
		if (!draggedEl) return null;
		const delta = drop.snappedCanvasDelta;
		const newPos = {
			x: (draggedEl.canvasPosition?.x || 0) + delta.x,
			y: (draggedEl.canvasPosition?.y || 0) + delta.y
		};
		const oldPos = starts.get(activeId)?.position || draggedEl.canvasPosition || {
			x: 0,
			y: 0
		};
		if (Math.abs(oldPos.x - newPos.x) <= .1 && Math.abs(oldPos.y - newPos.y) <= .1) return null;
		return [{
			type: "set_position",
			elementId: activeId,
			oldPosition: {
				x: oldPos.x,
				y: oldPos.y
			},
			newPosition: newPos
		}];
	}
	if (isAbsolutePositioned) {
		const startState = starts.get(activeId);
		const startRect = startState?.rect ?? null;
		const containingBox = env.containingBox(activeId);
		if (!startState || !startRect || !containingBox || Math.abs(canvasDelta.x) < 1 && Math.abs(canvasDelta.y) < 1) return null;
		const op = createSetStylesOperation(tree, activeId, computeAbsoluteOffsetStyles({
			startStyles: startState.styles || {},
			startRect: env.toLiveRect(startRect),
			containingBox,
			margins: {
				marginLeft: startState.marginLeft,
				marginTop: startState.marginTop,
				marginRight: startState.marginRight,
				marginBottom: startState.marginBottom
			},
			canvasDelta: drop.snappedCanvasDelta,
			canvasScale: env.scale,
			autoPin: true
		}));
		return op ? [op] : null;
	}
	return null;
}
function planMultiDrop(drop, env, canvasDelta) {
	const { tree, draggedIds, dropSlot, overId, starts, startFrame, startScale } = drop;
	if (dropSlot) {
		const ops = [];
		let cursor = tree;
		let targetId = dropSlot.targetId;
		let position = dropSlot.position;
		for (const id of [...draggedIds].sort(visualOrder(starts))) {
			const target = resolveMoveTarget(cursor, id, targetId, position);
			const fromKey = getParentId(cursor, id);
			const fromParentId = fromKey === "ROOT" || fromKey === null ? null : fromKey;
			const flowStyleOp = target.parentId && shouldReturnToFlow({
				targetIsFlowLayout: env.isFlowLayout(target.parentId),
				draggedPosition: getById(cursor, id)?.styles?.position,
				movedDeeper: movesDeeper(cursor, fromParentId, target.parentId)
			}) ? createFlowPositionOperation(cursor, id) : null;
			if (flowStyleOp) {
				ops.push(flowStyleOp);
				cursor = applyOperationsToStore(cursor, [flowStyleOp]);
			}
			const moveOp = createMoveOperation(cursor, id, target.parentId, target.index);
			if (!moveOp) continue;
			ops.push(moveOp);
			cursor = applyOperationsToStore(cursor, [moveOp]);
			targetId = id;
			position = "after";
		}
		return ops.length > 0 ? ops : null;
	}
	if (overId && !hasAncestorIn(tree, overId, draggedIds)) {
		const nestIds = [...draggedIds].filter((id) => !hasAncestorIn(tree, id, draggedIds)).sort(visualOrder(starts));
		const target = getById(tree, overId);
		const ops = [];
		let cursor = tree;
		for (const id of nestIds) {
			const element = getById(cursor, id);
			if (!target || !element || !canAcceptChild(target, element)) continue;
			const elementOps = planNestOps(cursor, id, overId, drop.pointerDeltaScreen, drop, env) ?? [createMoveOperation(cursor, id, overId, getChildren$2(cursor, overId).length)].filter((op) => op !== null);
			ops.push(...elementOps);
			cursor = applyOperationsToStore(cursor, elementOps);
		}
		return ops.length > 0 ? ops : null;
	}
	if (Math.abs(canvasDelta.x) < 1 && Math.abs(canvasDelta.y) < 1) return null;
	const delta = drop.snappedCanvasDelta;
	const newPositions = /* @__PURE__ */ new Map();
	for (const id of draggedIds) {
		const state = starts.get(id);
		if (!state || !startFrame || !state.rect) continue;
		const start = screenToCanvas({
			x: state.rect.left,
			y: state.rect.top
		}, startFrame);
		const marginX = state.parentId !== null ? state.marginLeft : 0;
		const marginY = state.parentId !== null ? state.marginTop : 0;
		newPositions.set(id, {
			x: start.x + delta.x - marginX,
			y: start.y + delta.y - marginY
		});
	}
	const ops = [];
	let cursor = tree;
	for (const id of draggedIds) {
		const state = starts.get(id);
		if (!state || state.parentId === null) continue;
		const newPos = newPositions.get(id);
		const widthCanvas = state.rect ? state.rect.width / startScale : void 0;
		const heightCanvas = state.rect ? state.rect.height / startScale : void 0;
		const newStyles = positionStylesForPlacement({
			...state.styles || {},
			...widthCanvas != null && heightCanvas != null ? DETACH_STYLE_OVERRIDES(widthCanvas, heightCanvas, state.styles) : {}
		}, "root");
		const elementOps = [{
			type: "set_styles",
			elementId: id,
			oldStyles: state.styles,
			newStyles
		}, {
			type: "move",
			elementId: id,
			fromParentId: state.parentId,
			toParentId: null,
			fromIndex: state.index,
			toIndex: getRootIds(cursor).length
		}];
		if (newPos) elementOps.push({
			type: "set_position",
			elementId: id,
			oldPosition: state.position ? { ...state.position } : void 0,
			newPosition: newPos
		});
		ops.push(...elementOps);
		cursor = applyOperationsToStore(cursor, elementOps);
	}
	for (const id of draggedIds) {
		const state = starts.get(id);
		if (!state || state.parentId !== null) continue;
		const newPos = newPositions.get(id);
		const oldPos = state.position || {
			x: 0,
			y: 0
		};
		if (!newPos) continue;
		const op = {
			type: "set_position",
			elementId: id,
			oldPosition: {
				x: oldPos.x,
				y: oldPos.y
			},
			newPosition: newPos
		};
		ops.push(op);
		cursor = applyOperationsToStore(cursor, [op]);
	}
	return ops.length > 0 ? ops : null;
}
/**
* The element a press drags. A pressed element that is itself selected wins over
* the hover: hover only updates when the pointer crosses an element edge, so after
* a double-click into a child that fills its parent, it still names the parent.
* With Alt it is otherwise what the cursor shows (the hovered element, else the
* pressed one), lifted to its selected ancestor. Without Alt, a selected ancestor
* of the pressed element wins; otherwise the hovered element, so what moves is
* what the hover outline showed.
*/
function resolveDragLead({ tree, pressedId, hoveredId, selectedIds, alt }) {
	if (alt) {
		const cursorElement = selectedIds.has(pressedId) ? pressedId : hoveredId ?? pressedId;
		return findSelectedAncestor(tree, cursorElement, selectedIds) ?? cursorElement;
	}
	const selectedAncestor = findSelectedAncestor(tree, pressedId, selectedIds);
	if (selectedAncestor) return selectedAncestor;
	return hoveredId && hoveredId !== pressedId ? hoveredId : pressedId;
}
/** Each dragged element's tree position, styles and measured box at drag start, keyed by id. */
function snapshotDragStart(tree, ids, reads) {
	const states = /* @__PURE__ */ new Map();
	for (const id of ids) {
		const el = getById(tree, id);
		if (!el) continue;
		const parentKey = getParentId(tree, id);
		const index = getIndex(tree, id);
		const measured = reads.rect(id);
		const { marginLeft, marginTop, marginRight, marginBottom } = reads.margins(id);
		states.set(id, {
			position: el.canvasPosition ? { ...el.canvasPosition } : void 0,
			parentId: parentKey === "ROOT" || parentKey === null ? null : parentKey,
			index: index >= 0 ? index : 0,
			rect: measured ? {
				left: measured.left,
				top: measured.top,
				width: measured.width,
				height: measured.height
			} : null,
			styles: el.styles ? { ...el.styles } : void 0,
			marginLeft,
			marginTop,
			marginRight,
			marginBottom
		});
	}
	return states;
}
var moved = (rect, delta) => ({
	left: rect.left + delta.x,
	top: rect.top + delta.y,
	width: rect.width,
	height: rect.height
});
var parentOf = (tree, id) => {
	const key = getParentId(tree, id);
	return key === "ROOT" || key === null ? null : key;
};
/** Whether the dragged rect has cleared its parent entirely: a child pulled out to detach. */
function detachIntent(move, reads) {
	const parentId = parentOf(move.tree, move.activeId);
	if (!parentId) return false;
	const parentRect = reads.rect(parentId);
	if (!move.startRect || !parentRect) return false;
	return isCompletelyOutside(reads.toLiveHitRect(moved(move.startRect, move.pointerDeltaScreen)), parentRect);
}
/**
* The flex slot under the drag, if any. Out-of-flow (absolute, fixed) elements are not
* part of a flex layout: they free-move, snap and nest instead. The current parent wins
* while the dragged centre is within its cross axis (the main axis is unbounded, so a
* drag past the first or last item still snaps to the edge slots); otherwise the flex
* container under the pointer.
*/
function findFlexSlot(move, pointer, reads) {
	const { tree, activeId, draggedIds, startRect, pointerDeltaScreen } = move;
	const position = getById(tree, activeId)?.styles?.position;
	if (!pointer || !startRect || position === "absolute" || position === "fixed") return null;
	const excludeIds = new Set(draggedIds);
	const currentParentId = parentOf(tree, activeId);
	const centreX = startRect.left + startRect.width / 2 + pointerDeltaScreen.x;
	const centreY = startRect.top + startRect.height / 2 + pointerDeltaScreen.y;
	let parentId = null;
	if (currentParentId && reads.withinFlexCrossAxis(currentParentId, centreX, centreY)) parentId = currentParentId;
	if (!parentId) parentId = reads.flexContainerAt(pointer.x, pointer.y, excludeIds);
	if (!parentId || parentId === activeId || isDescendant(tree, activeId, parentId)) return null;
	const siblings = getChildren$2(tree, parentId).filter((id) => {
		const pos = getById(tree, id)?.styles?.position;
		return pos !== "absolute" && pos !== "fixed";
	});
	const candidates = siblings.filter((id) => !excludeIds.has(id));
	const reorder = candidates.length !== siblings.length;
	const slot = reads.flexSlot({
		parentId,
		allSiblingIds: siblings,
		childIds: candidates,
		draggedLeft: startRect.left + pointerDeltaScreen.x,
		draggedTop: startRect.top + pointerDeltaScreen.y,
		draggedWidth: startRect.width,
		draggedHeight: startRect.height,
		isInternalReorder: reorder
	});
	return slot ? {
		slot,
		parentId,
		siblings,
		reorder
	} : null;
}
/**
* The container the dragged rect would nest in (null for none), and the rect itself in
* drag-start screen px. Candidates come from the DOM under the rect's centre; which is
* legal is resolveNestTarget's rule. A drag still inside its parent never nests.
*/
function findNestTarget(move, leftParent, reads) {
	const previewRect = moved(move.startRect, move.pointerDeltaScreen);
	const hit = reads.toLiveHitRect(previewRect);
	return {
		overId: resolveNestTarget({
			store: move.tree,
			draggedId: move.activeId,
			currentParentId: parentOf(move.tree, move.activeId),
			hasLeftParent: leftParent,
			candidateIds: reads.idsAt(hit.left + hit.width / 2, hit.top + hit.height / 2),
			excludeIds: new Set(move.draggedIds),
			draggedRect: hit,
			getRect: reads.rect
		}),
		previewRect
	};
}

export { detachIntent, findFlexSlot, findNestTarget, getDraggedIds, hasExplicitLength, planDrop, resolveDragLead, roundDetachLength, snapshotDragStart };
