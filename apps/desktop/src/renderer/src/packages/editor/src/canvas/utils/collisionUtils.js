// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/collisionUtils.ts
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { accumulatedLinearTransform, invertLinear } from "./transformMatrix.js";

/**
* Check if element A is fully inside element B
*/
function isFullyInside(rectA, rectB) {
	return rectA.left >= rectB.left && rectA.right <= rectB.right && rectA.top >= rectB.top && rectA.bottom <= rectB.bottom;
}
/**
* Check if element A is completely outside element B
*/
function isCompletelyOutside(rectA, rectB) {
	return rectA.right < rectB.left || rectA.left > rectB.right || rectA.bottom < rectB.top || rectA.top > rectB.bottom;
}
/**
* Topmost canvas element at a screen point, ignoring the DragOverlay.
*
* The overlay renders a copy of the dragged element carrying the SAME
* data-element-id, and the `pointerEvents: 'none'` that is meant to keep it out
* of hit tests only *inherits*. A component whose own markup sets
* `pointer-events` inline outranks it — a WebGL/shader wrapper does exactly
* that — so the copy becomes hit-testable and sits over the canvas. Hit tests
* then land on the copy, the walk-up climbs overlay ancestors that carry no
* element id, and nesting or flex-drop silently never fires.
*
* Skipping the overlay by structure instead of by CSS cannot be defeated by
* whatever a project's components declare. Same rule getElementRect already
* applies when it filters the overlay copy out of its measurements.
*/
function canvasElementFromPoint(clientX, clientY, doc = document) {
	for (const el of doc.elementsFromPoint(clientX, clientY)) if (!el.closest(NOT_CANVAS)) return el;
	return null;
}
/** The drag copy; the dragged element's own node (useDndCanvas markDragSource: a root moved in
*  place sits under the pointer, and a hidden original still takes hits); the input machine's
*  cursor surface, which holds the pointer under it while the machine runs a drag; and the
*  canvas's mode cursor layer (hand, comment, insert tool). None of them is canvas content. */
var NOT_CANVAS = "[data-drag-overlay], [data-drag-source], [data-handle-cursor], [data-cursor-layer]";
/** An event's target, or what lies beneath it when the canvas's mode cursor layer took the press. */
function targetBeneathCursorLayer(target, clientX, clientY, doc = document) {
	if (target.getAttribute("data-cursor-layer") === null) return target;
	return canvasElementFromPoint(clientX, clientY, doc) ?? target;
}
function findRectNodes(elementId) {
	const all = document.querySelectorAll(`[data-element-id="${elementId}"]`);
	if (all.length === 0) return null;
	const onCanvas = Array.from(all).filter((el) => !el.closest("[data-drag-overlay]"));
	const elements = onCanvas.length > 0 ? onCanvas : Array.from(all);
	if (elements.length > 1) return {
		nodes: {
			size: elements[0],
			position: elements[elements.length - 1]
		},
		onCanvas: onCanvas.length > 0
	};
	let el = elements[0];
	let style = window.getComputedStyle(el);
	while (style.display === "contents" && el.firstElementChild) {
		el = el.firstElementChild;
		style = window.getComputedStyle(el);
	}
	return {
		nodes: {
			size: el,
			position: el
		},
		onCanvas: onCanvas.length > 0
	};
}
/**
* Get element's bounding rect by its data-element-id
* For elements with display:contents (like component wrappers),
* returns the rect of the first visible child instead.
* Pass `cache` to reuse the nodes found earlier in the same gesture.
*/
function getElementRect$1(elementId, cache) {
	let nodes = cache?.get(elementId);
	if (!nodes || !nodes.size.isConnected || !nodes.position.isConnected) {
		const found = findRectNodes(elementId);
		if (!found) return null;
		nodes = found.nodes;
		if (cache && found.onCanvas) cache.set(elementId, nodes);
	}
	if (nodes.size === nodes.position) return nodes.size.getBoundingClientRect();
	const outerRect = nodes.size.getBoundingClientRect();
	const innerRect = nodes.position.getBoundingClientRect();
	return new DOMRect(innerRect.left, innerRect.top, outerRect.width, outerRect.height);
}
/**
* Get canvas viewport bounding rect — the element whose top-left is the screen
* origin of the transformed canvas content (before pan/zoom is applied).
*/
function getCanvasRect() {
	const viewport = document.querySelector("[data-canvas-viewport]");
	return viewport ? viewport.getBoundingClientRect() : null;
}
/**
* Resolve a data-element-id through display:contents wrappers to the first
* element that actually produces a box. Returns null if not in DOM.
*/
function resolveVisibleDomEl(elementId) {
	const el = document.querySelector(`[data-element-id="${elementId}"]`);
	if (!el) return null;
	let node = el;
	let style = window.getComputedStyle(node);
	while (style.display === "contents" && node.firstElementChild) {
		node = node.firstElementChild;
		style = window.getComputedStyle(node);
	}
	return node;
}
/** Read the element's computed margins in CSS pixels. Resolves through display:contents wrappers. */
function getElementComputedMargins(elementId) {
	const node = resolveVisibleDomEl(elementId);
	if (!node) return {
		marginLeft: 0,
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0
	};
	const style = window.getComputedStyle(node);
	return {
		marginLeft: parseFloat(style.marginLeft) || 0,
		marginTop: parseFloat(style.marginTop) || 0,
		marginRight: parseFloat(style.marginRight) || 0,
		marginBottom: parseFloat(style.marginBottom) || 0
	};
}
/** Screen-px thickness of the insertion line. */
var INSERT_LINE_THICKNESS = 2;
/** Offset of a lone item inside `free` px of spare space under a justify/align keyword.
*  `flexFlip` swaps the flex-relative edges, `inlineFlip` the writing-mode ones too. */
function alignOffset(value, free, flexFlip = false, inlineFlip = false) {
	switch (value.replace(/^(?:un)?safe /, "")) {
		case "center":
		case "space-around":
		case "space-evenly": return free / 2;
		case "right": return free;
		case "left": return 0;
		case "end":
		case "self-end": return inlineFlip ? 0 : free;
		case "start":
		case "self-start": return inlineFlip ? free : 0;
		case "flex-end": return flexFlip !== inlineFlip ? 0 : free;
		default: return flexFlip !== inlineFlip ? free : 0;
	}
}
function createFlexSlotCache() {
	return {
		nodeById: /* @__PURE__ */ new Map(),
		parent: /* @__PURE__ */ new Map(),
		layout: /* @__PURE__ */ new Map(),
		touched: /* @__PURE__ */ new Map(),
		activeParentId: null,
		lastAppliedSlotKey: null
	};
}
function cachedResolveVisibleDomEl(id, cache) {
	if (!cache) return resolveVisibleDomEl(id);
	const hit = cache.nodeById.get(id);
	if (hit !== void 0) return hit;
	const node = resolveVisibleDomEl(id);
	cache.nodeById.set(id, node);
	return node;
}
/**
* Cheap "is this point in the flex parent's cross-axis range?" check. Used by
* useDndCanvas's priority-1 (in-parent reorder) gate — caller passes the
* DRAGGED element's center (not the cursor) so a user grabbing an edge of a
* tall element doesn't slip out of the in-parent path as the cursor wanders
* off cross-axis. Reuses FlexSlotCache for node resolution + style reads;
* getBoundingClientRect is fresh each call because canvas pan shifts the
* parent's screen rect.
*/
function isPointerWithinFlexParentCrossAxis(parentId, x, y, cache) {
	const parentDom = cachedResolveVisibleDomEl(parentId, cache);
	if (!parentDom) return false;
	const pstyle = cachedParentStyle(parentId, parentDom, cache);
	if (!pstyle) return false;
	const r = parentDom.getBoundingClientRect();
	return pstyle.isRow ? y >= r.top && y <= r.bottom && x >= r.left && x <= r.right : x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}
function cachedParentStyle(parentId, parentDom, cache) {
	if (cache) {
		const hit = cache.parent.get(parentId);
		if (hit !== void 0) return hit;
	}
	const s = window.getComputedStyle(parentDom);
	if (!s.display.includes("flex")) {
		if (cache) cache.parent.set(parentId, null);
		return null;
	}
	const direction = s.flexDirection || "row";
	const packsLine = s.flexWrap !== "nowrap" && s.alignContent !== "normal" && s.alignContent !== "stretch";
	const linear = accumulatedLinearTransform(parentDom);
	const info = {
		isRow: direction === "row" || direction === "row-reverse",
		reversed: direction === "row-reverse" || direction === "column-reverse",
		scaleX: Math.hypot(linear.a, linear.b),
		scaleY: Math.hypot(linear.c, linear.d),
		padL: parseFloat(s.paddingLeft) || 0,
		padR: parseFloat(s.paddingRight) || 0,
		padT: parseFloat(s.paddingTop) || 0,
		padB: parseFloat(s.paddingBottom) || 0,
		bordL: parseFloat(s.borderLeftWidth) || 0,
		bordR: parseFloat(s.borderRightWidth) || 0,
		bordT: parseFloat(s.borderTopWidth) || 0,
		bordB: parseFloat(s.borderBottomWidth) || 0,
		justify: s.justifyContent,
		align: packsLine ? s.alignContent : s.alignItems,
		rtl: s.direction === "rtl",
		wrapReversed: s.flexWrap === "wrap-reverse"
	};
	if (cache) cache.parent.set(parentId, info);
	return info;
}
/**
* Compute a flex drop slot for a dragged element given a potential parent.
*
* Reads the parent's computed display/flex-direction. If not a flex container,
* returns null (caller falls back to the default "inside" nesting behavior).
*
* Algorithm:
*   - Enumerate children in DOM order, excluding `excludeIds` (dragged + its descendants).
*   - Compute each child's main-axis midpoint.
*   - Flip the slot when the DRAGGED element's midpoint (not the cursor) crosses a
*     sibling's midpoint. Using the cursor made the slot lag by up to the dragged's
*     size: if the user grabbed an edge of a tall element, they'd need to drag the
*     full height past a sibling before the slot flipped.
*   - In-parent reorder: no indicator, the siblings slide apart (applyFlexReorderPreview).
*   - Insert from another parent: an insertion line centred in the gap the element
*     will land in, spanning the container's content box on the cross axis.
*/
function getFlexDropSlot(params) {
	const { parentId, allSiblingIds, childIds, draggedLeft, draggedTop, draggedWidth, draggedHeight, isInternalReorder, cache } = params;
	const parentDom = cachedResolveVisibleDomEl(parentId, cache);
	if (!parentDom) return null;
	const pstyle = cachedParentStyle(parentId, parentDom, cache);
	if (!pstyle) return null;
	const { isRow, reversed } = pstyle;
	const parentRect = parentDom.getBoundingClientRect();
	const zoom = getCamera().scale;
	const scaleX = pstyle.scaleX * zoom, scaleY = pstyle.scaleY * zoom;
	const contentLeft = parentRect.left + (pstyle.bordL + pstyle.padL) * scaleX;
	const contentTop = parentRect.top + (pstyle.bordT + pstyle.padT) * scaleY;
	const contentRight = parentRect.right - (pstyle.bordR + pstyle.padR) * scaleX;
	const contentBottom = parentRect.bottom - (pstyle.bordB + pstyle.padB) * scaleY;
	const snap = cache ? captureFlexLayout(parentId, allSiblingIds, cache) : null;
	const childRects = [];
	for (const childId of childIds) if (snap && snap.origMainPos.has(childId) && snap.sizes.has(childId)) {
		const mainStart = snap.origMainPos.get(childId) ?? 0;
		const mainSize = snap.sizes.get(childId) ?? 0;
		childRects.push({
			id: childId,
			mainStart,
			mainEnd: mainStart + mainSize
		});
	} else {
		const dom = cachedResolveVisibleDomEl(childId, cache);
		if (!dom) continue;
		const r = dom.getBoundingClientRect();
		const mainStart = isRow ? r.left : r.top;
		const mainSize = isRow ? r.width : r.height;
		childRects.push({
			id: childId,
			mainStart,
			mainEnd: mainStart + mainSize
		});
	}
	childRects.sort((a, b) => a.mainStart - b.mainStart);
	if (childRects.length === 0) {
		if (isInternalReorder) return {
			targetId: parentId,
			position: "inside",
			indicator: null
		};
		const maxW = Math.max(0, contentRight - contentLeft);
		const maxH = Math.max(0, contentBottom - contentTop);
		const width = Math.min(draggedWidth, maxW || draggedWidth);
		const height = Math.min(draggedHeight, maxH || draggedHeight);
		const { justify, align, rtl, wrapReversed } = pstyle;
		const left = isRow ? alignOffset(justify, maxW - width, reversed, rtl) : alignOffset(align, maxW - width, wrapReversed, rtl);
		const top = isRow ? alignOffset(align, maxH - height, wrapReversed) : alignOffset(justify, maxH - height, reversed);
		return {
			targetId: parentId,
			position: "inside",
			indicator: {
				kind: "slot",
				rect: {
					left: contentLeft + left,
					top: contentTop + top,
					width,
					height
				}
			}
		};
	}
	const draggedMainMid = (isRow ? draggedLeft : draggedTop) + (isRow ? draggedWidth : draggedHeight) / 2;
	let slotIndex = childRects.length;
	for (let i = 0; i < childRects.length; i++) {
		const c = childRects[i];
		if (draggedMainMid < (c.mainStart + c.mainEnd) / 2) {
			slotIndex = i;
			break;
		}
	}
	const prevChild = slotIndex > 0 ? childRects[slotIndex - 1] : null;
	const nextChild = slotIndex < childRects.length ? childRects[slotIndex] : null;
	const halfGap = (snap?.gap ?? 0) / 2;
	const contentMainStart = isRow ? contentLeft : contentTop;
	const contentMainEnd = isRow ? contentRight : contentBottom;
	let targetId;
	let position;
	let lineMain;
	if (nextChild) {
		targetId = nextChild.id;
		position = "before";
		lineMain = prevChild ? (prevChild.mainEnd + nextChild.mainStart) / 2 : Math.max(contentMainStart, nextChild.mainStart - halfGap);
	} else if (prevChild) {
		targetId = prevChild.id;
		position = "after";
		lineMain = Math.min(contentMainEnd, prevChild.mainEnd + halfGap);
	} else return null;
	if (reversed) position = position === "before" ? "after" : "before";
	if (isInternalReorder) return {
		targetId,
		position,
		indicator: null
	};
	const lineStart = lineMain - INSERT_LINE_THICKNESS / 2;
	const crossStart = isRow ? contentTop : contentLeft;
	const crossSize = Math.max(0, (isRow ? contentBottom : contentRight) - crossStart);
	return {
		targetId,
		position,
		indicator: {
			kind: "line",
			rect: isRow ? {
				left: lineStart,
				top: crossStart,
				width: INSERT_LINE_THICKNESS,
				height: crossSize
			} : {
				left: crossStart,
				top: lineStart,
				width: crossSize,
				height: INSERT_LINE_THICKNESS
			}
		}
	};
}
/**
* Capture sibling sizes + gap once per flex parent per drag. Called lazily by
* applyFlexReorderPreview — idempotent across frames.
*/
function captureFlexLayout(parentId, allSiblingIds, cache) {
	const hit = cache.layout.get(parentId);
	if (hit !== void 0) return hit;
	const parentDom = cachedResolveVisibleDomEl(parentId, cache);
	if (!parentDom) {
		cache.layout.set(parentId, null);
		return null;
	}
	const pstyle = cachedParentStyle(parentId, parentDom, cache);
	if (!pstyle) {
		cache.layout.set(parentId, null);
		return null;
	}
	const cs = window.getComputedStyle(parentDom);
	const gapRaw = pstyle.isRow ? cs.columnGap : cs.rowGap;
	let gap = parseFloat(gapRaw);
	if (isNaN(gap)) gap = parseFloat(cs.gap) || 0;
	const sizes = /* @__PURE__ */ new Map();
	const origMainPos = /* @__PURE__ */ new Map();
	const presentIds = [];
	for (const id of allSiblingIds) {
		const dom = cachedResolveVisibleDomEl(id, cache);
		if (!dom) continue;
		const r = dom.getBoundingClientRect();
		sizes.set(id, pstyle.isRow ? r.width : r.height);
		origMainPos.set(id, pstyle.isRow ? r.left : r.top);
		presentIds.push(id);
	}
	const snap = {
		isRow: pstyle.isRow,
		gap: gap * (pstyle.isRow ? pstyle.scaleX : pstyle.scaleY) * getCamera().scale,
		siblingIds: presentIds,
		sizes,
		origMainPos
	};
	cache.layout.set(parentId, snap);
	return snap;
}
/**
* In-parent reorder preview: apply CSS transforms to the flex parent's non-dragged
* children so they shift to reflect the drop order defined by `slot`, animated via
* `transition: transform`. Dragged items stay `visibility:hidden` in their original
* slots — the gap revealed by siblings shifting around them IS the drop preview.
*
* Only for reorders within the dragged's own parent. An element coming from
* another parent never moves the siblings; it gets an insertion line instead
* (see DropSlotIndicator), so the caller must clear this preview in that case.
*
* - Siblings shift to make room. Browser composites the transforms on GPU.
* - Only siblings whose delta changed get a new write; already-correct transforms
*   are skipped so active transitions aren't interrupted unnecessarily.
* - On parent switch (multi-drag peers from different parents), old parent's
*   transforms are cleared before the new parent's transforms are applied.
*/
function applyFlexReorderPreview(params) {
	const { parentId, draggedId, draggedIds, allSiblingIds, slot, cache } = params;
	const canvasScale = params.canvasScale && params.canvasScale !== 0 ? params.canvasScale : 1;
	if (cache.activeParentId && cache.activeParentId !== parentId) clearFlexReorderPreview(cache);
	cache.activeParentId = parentId;
	const slotKey = `${parentId}|${draggedId}|${slot.targetId}|${slot.position}`;
	if (cache.lastAppliedSlotKey === slotKey) return;
	cache.lastAppliedSlotKey = slotKey;
	const snap = captureFlexLayout(parentId, allSiblingIds, cache);
	if (!snap) return;
	const sortedIds = [...snap.siblingIds].sort((a, b) => (snap.origMainPos.get(a) ?? 0) - (snap.origMainPos.get(b) ?? 0));
	const withoutDragged = sortedIds.filter((id) => !draggedIds.has(id));
	let insertIdx;
	if (slot.position === "inside") insertIdx = withoutDragged.length;
	else {
		const targetIdx = withoutDragged.indexOf(slot.targetId);
		if (targetIdx < 0) return;
		insertIdx = slot.position === "before" ? targetIdx : targetIdx + 1;
	}
	const newPos = /* @__PURE__ */ new Map();
	const sortedDragged = sortedIds.filter((id) => draggedIds.has(id));
	const newVisualOrder = [
		...withoutDragged.slice(0, insertIdx),
		...sortedDragged,
		...withoutDragged.slice(insertIdx)
	];
	const origGaps = [];
	for (let i = 0; i < sortedIds.length - 1; i++) {
		const prev = sortedIds[i];
		const next = sortedIds[i + 1];
		const prevEnd = (snap.origMainPos.get(prev) ?? 0) + (snap.sizes.get(prev) ?? 0);
		const nextStart = snap.origMainPos.get(next) ?? 0;
		origGaps.push(nextStart - prevEnd);
	}
	let cursor = snap.origMainPos.get(sortedIds[0]) ?? 0;
	for (let i = 0; i < newVisualOrder.length; i++) {
		const id = newVisualOrder[i];
		newPos.set(id, cursor);
		cursor += snap.sizes.get(id) ?? 0;
		if (i < newVisualOrder.length - 1) cursor += origGaps[i] ?? 0;
	}
	const shifted = [];
	for (const id of snap.siblingIds) {
		if (draggedIds.has(id)) continue;
		const dom = cachedResolveVisibleDomEl(id, cache);
		if (dom instanceof HTMLElement || dom instanceof SVGElement) shifted.push({
			id,
			dom
		});
	}
	const firstShift = shifted.filter(({ dom }) => !cache.touched.has(dom)).map(({ dom }) => ({
		dom,
		original: {
			transform: dom.style.transform,
			transformPriority: dom.style.getPropertyPriority("transform"),
			transition: dom.style.transition,
			transitionPriority: dom.style.getPropertyPriority("transition"),
			computedTransform: getComputedStyle(dom).transform,
			parentInverse: invertLinear(accumulatedLinearTransform(dom.parentElement))
		}
	}));
	for (const { dom, original } of firstShift) {
		cache.touched.set(dom, original);
		dom.style.setProperty("transition", "transform 150ms ease", "important");
	}
	for (const { id, dom } of shifted) {
		const screenDelta = (newPos.get(id) ?? 0) - (snap.origMainPos.get(id) ?? 0);
		const original = cache.touched.get(dom);
		const dx = snap.isRow ? screenDelta / canvasScale : 0;
		const dy = snap.isRow ? 0 : screenDelta / canvasScale;
		const m = original.parentInverse;
		const x = m.a * dx + m.c * dy, y = m.b * dx + m.d * dy;
		const base = original.computedTransform === "none" ? "" : original.computedTransform;
		const next = screenDelta === 0 ? base : `translate3d(${x}px, ${y}px, 0) ${base}`.trim();
		if (dom.style.transform !== next) dom.style.setProperty("transform", next, "important");
	}
}
/**
* Remove inline transform/transition written by applyFlexReorderPreview.
* Sets `transition: none` before restoring the original `transform` so the removal is instant —
* after a tree reorder the old transforms correspond to stale DOM positions and
* animating them would cause a visible jump to the wrong spot. Since the pre-drop
* visual already matches the post-drop DOM layout (that's the whole point of the
* preview), an instant clear leaves the scene visually unchanged.
*
* Batched in three passes with a single forced reflow between passes, rather
* than one reflow per sibling.
*/
function clearFlexReorderPreview(cache) {
	if (cache.touched.size > 0) {
		for (const [node, original] of cache.touched) {
			node.style.setProperty("transition", "none", "important");
			node.style.setProperty("transform", original.transform, original.transformPriority);
		}
		const first = cache.touched.keys().next().value;
		if (first) first.getBoundingClientRect();
		for (const [node, original] of cache.touched) node.style.setProperty("transition", original.transition, original.transitionPriority);
		cache.touched.clear();
	}
	cache.activeParentId = null;
	cache.lastAppliedSlotKey = null;
}

export { applyFlexReorderPreview, canvasElementFromPoint, clearFlexReorderPreview, createFlexSlotCache, getCanvasRect, getElementComputedMargins, getElementRect$1, getFlexDropSlot, isCompletelyOutside, isFullyInside, isPointerWithinFlexParentCrossAxis, targetBeneathCursorLayer };
