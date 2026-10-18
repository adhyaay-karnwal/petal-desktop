// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/useDndCanvas.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ROOT } from "../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getParentId, getRootIds } from "../../../../compiler/src/store/read.js";
import { getCamera, sameCamera, subscribeCamera } from "../../shell/hooks/useCommentAgent.js";
import { getTree, usePages } from "../../shared/state/pages.js";
import { useSelection } from "../../shared/state/selection.js";
import { getAbsoluteContainingBox, getElementPaddingBox, isFlowLayoutElement } from "../utils/domGeometry.js";
import { readDragPreviewBox, readDragPreviewGeometry } from "../utils/dragPreviewGeometry.js";
import { useHover } from "../../shared/state/hover.js";
import { NO_SNAP_MEMORY, collectSnapLines, computeSnap, computeSpacing, visibleSnapRects } from "../utils/snapping.js";
import { applyFlexReorderPreview, canvasElementFromPoint, clearFlexReorderPreview, createFlexSlotCache, getCanvasRect, getElementComputedMargins, getElementRect$1, getFlexDropSlot, isPointerWithinFlexParentCrossAxis } from "../utils/collisionUtils.js";
import { mapScreenPoint } from "../utils/dragFrame.js";
import { detachIntent, findFlexSlot, findNestTarget, getDraggedIds, planDrop, resolveDragLead, snapshotDragStart } from "../utils/elementDrag.js";
import { createDragPreviewLayer, emptyDragPreviewScene } from "../utils/dragPreviewLayer.js";

/** Stable empty references for the `draggedIds` / `activeElements` memos —
*  returning fresh collections each render invalidated `CanvasRootTrees`' cache
*  and re-rendered the whole element tree on every drag-move event. Treat as read-only. */
var EMPTY_DRAGGED_IDS = /* @__PURE__ */ new Set();
var EMPTY_ACTIVE_ELEMENTS = [];
/** Stacking order of a root moved in place: above every other root and its descendants. */
var DRAGGED_ROOT_Z_INDEX = 2147483647;
/** Outlasts any drag. The keyframes are constant, so the duration only has to not end. */
var MOVE_IN_PLACE_ANIMATION_MS = 864e5;
/**
* Mark a dragged element's node: hit tests skip `data-drag-source` (canvasElementFromPoint), so
* nesting and flex slots see what is underneath it. Embedded documents in it would take the
* pointer's events away from the drag, so only those are made inert: pointer-events inherits,
* and setting it on the element restyles every node in it, ~40 ms for a 5k-node layer.
*/
function markDragSource(el) {
	el.setAttribute("data-drag-source", "");
	const inert = [];
	for (const embedded of el.querySelectorAll("iframe, embed, object, webview")) {
		inert.push({
			el: embedded,
			pointerEvents: embedded.style.pointerEvents
		});
		embedded.style.pointerEvents = "none";
	}
	return {
		el,
		inert
	};
}
function unmarkDragSource({ el, inert }) {
	el.removeAttribute("data-drag-source");
	for (const { el: embedded, pointerEvents } of inert) embedded.style.pointerEvents = pointerEvents;
}
/** Screen px from a flex child's edge (along its parent's main axis) within which the drop
*  targets the parent's slot beside that child rather than the child's own layout. */
var FLEX_EDGE_ZONE_PX = 8;
function flexNodeInfo(node, excludeIds, cache) {
	const hit = cache.get(node);
	if (hit !== void 0) return hit;
	let info = null;
	const id = node.getAttribute("data-element-id");
	if (id && !excludeIds.has(id)) {
		const cs = window.getComputedStyle(node);
		if (cs.display.includes("flex")) info = {
			id,
			isRow: cs.flexDirection === "row" || cs.flexDirection === "row-reverse"
		};
	}
	cache.set(node, info);
	return info;
}
/** Nearest ancestor-or-self flex container registered with a data-element-id, skipping
*  excluded ids (dragged self / descendants). */
function nearestFlexNode(from, excludeIds, cache) {
	for (let node = from; node; node = node.parentElement) {
		const info = flexNodeInfo(node, excludeIds, cache);
		if (info) return {
			node,
			info
		};
	}
	return null;
}
/** Walk up from the element under the pointer to find the flex container the drop should
*  target. canvasElementFromPoint skips the drag copy and the dragged element's own node
*  (`data-drag-source`), so it returns what the user would actually drop on.
*
*  Edge zone (Figma parity): when the nearest flex container is itself a child of a flex
*  parent and the pointer sits within FLEX_EDGE_ZONE_PX of its edge along the parent's
*  main axis, the parent wins. Without this, two flex siblings with no gap leave a 0px
*  seam to aim for, since anywhere over either sibling resolves to that sibling's own
*  layout. The zone is capped at a third of the child's size so small children keep a
*  usable interior.
*
*  Uses a WeakMap cache of flex facts per DOM node to avoid repeated getComputedStyle
*  calls on the same ancestors across successive pointer moves. The cache is scoped to
*  a single drag (caller resets it). */
function findFlexDropContainer(pointerX, pointerY, excludeIds, cache) {
	const hit = nearestFlexNode(canvasElementFromPoint(pointerX, pointerY), excludeIds, cache);
	if (!hit) return null;
	const parent = nearestFlexNode(hit.node.parentElement, excludeIds, cache);
	if (!parent) return hit.info.id;
	const r = hit.node.getBoundingClientRect();
	const zone = Math.min(FLEX_EDGE_ZONE_PX, (parent.info.isRow ? r.width : r.height) / 3);
	return (parent.info.isRow ? pointerX - r.left < zone || r.right - pointerX < zone : pointerY - r.top < zone || r.bottom - pointerY < zone) ? parent.info.id : hit.info.id;
}
/** Container ids under a point, deepest first — the DOM half of nest targeting.
*  Which of them is a legal target is decided by resolveNestTarget (pure, tested).
*  Reads through canvasElementFromPoint, not document.elementFromPoint: the drag
*  copy of the dragged element sits under the cursor and would otherwise be the
*  top hit. */
function candidateIdsUnderPoint(x, y) {
	const ids = [];
	for (let node = canvasElementFromPoint(x, y); node; node = node.parentElement) if (node instanceof HTMLElement || node instanceof SVGElement) {
		const id = node.getAttribute("data-element-id");
		if (id) ids.push(id);
	}
	return ids;
}
function getCurrentFrame() {
	const canvasRect = getCanvasRect();
	const { scale, positionX, positionY } = getCamera();
	if (!canvasRect || !(scale > 0)) return null;
	return {
		scale,
		panX: positionX,
		panY: positionY,
		originX: canvasRect.left,
		originY: canvasRect.top
	};
}
function useDndCanvas(t0) {
	const $ = (0, import_compiler_runtime.c)(122);
	const { pageId, onSelectElement, planElementMove, selectedElementIds: t1, onStartAltDrag, zoomGestureAtRef: zoomGestureAtRefProp } = t0;
	const selectedElementIds = t1 === void 0 ? EMPTY_DRAGGED_IDS : t1;
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = createFlexSlotCache();
		$[0] = t2;
	} else t2 = $[0];
	const flexCacheRef = (0, import_react.useRef)(t2);
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ new WeakMap();
		$[1] = t3;
	} else t3 = $[1];
	const isFlexCacheRef = (0, import_react.useRef)(t3);
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ new Map();
		$[2] = t4;
	} else t4 = $[2];
	const nodeCacheRef = (0, import_react.useRef)(t4);
	let t5;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (id) => getElementRect$1(id, nodeCacheRef.current);
		$[3] = t5;
	} else t5 = $[3];
	const getDragElementRect = t5;
	let t6;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = {
			overId: null,
			dropSlot: null,
			shouldDetach: false
		};
		$[4] = t6;
	} else t6 = $[4];
	const domDropRef = (0, import_react.useRef)(t6);
	let t7;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = emptyDragPreviewScene();
		$[5] = t7;
	} else t7 = $[5];
	const sceneRef = (0, import_react.useRef)(t7);
	const guidesHostRef = (0, import_react.useRef)(null);
	const parentHostRef = (0, import_react.useRef)(null);
	const copyHostRef = (0, import_react.useRef)(null);
	const layerRef = (0, import_react.useRef)(null);
	let t8;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => {
			if (layerRef.current) return layerRef.current;
			layerRef.current = createDragPreviewLayer({
				hosts: () => ({
					guides: guidesHostRef.current,
					parent: parentHostRef.current,
					copy: copyHostRef.current
				}),
				scene: () => sceneRef.current,
				camera: getCamera,
				rect: (id_0) => getElementRect$1(id_0, nodeCacheRef.current)
			});
			return layerRef.current;
		};
		$[6] = t8;
	} else t8 = $[6];
	const previewLayer = t8;
	let t9;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = (next) => {
			domDropRef.current.overId = next;
			sceneRef.current.parentId = next;
			previewLayer().schedule();
		};
		$[7] = t9;
	} else t9 = $[7];
	const showOverId = t9;
	let t10;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = (next_0) => {
			domDropRef.current.shouldDetach = next_0;
		};
		$[8] = t10;
	} else t10 = $[8];
	const showDetach = t10;
	let t11;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = (next_1) => {
			domDropRef.current.dropSlot = next_1;
			sceneRef.current.slot = next_1?.indicator ?? null;
			previewLayer().schedule();
		};
		$[9] = t11;
	} else t11 = $[9];
	const commitDropSlot = t11;
	const pointerStartRef = (0, import_react.useRef)(null);
	const pointerCurrentRef = (0, import_react.useRef)(null);
	const altDownRef = (0, import_react.useRef)(false);
	const dragStartFrameRef = (0, import_react.useRef)(null);
	let t12;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = (pt) => {
			const start = dragStartFrameRef.current;
			const now = getCurrentFrame();
			return start && now ? mapScreenPoint(pt, now, start) : pt;
		};
		$[10] = t12;
	} else t12 = $[10];
	const toDragStartFrame = t12;
	let t13;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = (pt_0) => {
			const start_0 = dragStartFrameRef.current;
			const now_0 = getCurrentFrame();
			return start_0 && now_0 ? mapScreenPoint(pt_0, start_0, now_0) : pt_0;
		};
		$[11] = t13;
	} else t13 = $[11];
	const fromDragStartFrame = t13;
	let t14;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => dragStartFrameRef.current?.scale ?? getCamera().scale;
		$[12] = t14;
	} else t14 = $[12];
	const getDragStartScale = t14;
	let t15;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = (rect) => {
			const topLeft = fromDragStartFrame({
				x: rect.left,
				y: rect.top
			});
			const ratio = getCamera().scale / getDragStartScale();
			return {
				left: topLeft.x,
				top: topLeft.y,
				width: rect.width * ratio,
				height: rect.height * ratio
			};
		};
		$[13] = t15;
	} else t15 = $[13];
	const toLiveRect = t15;
	let t16;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = (rect_0) => {
			const live = toLiveRect(rect_0);
			return {
				...live,
				right: live.left + live.width,
				bottom: live.top + live.height
			};
		};
		$[14] = t16;
	} else t16 = $[14];
	const toLiveHitRect = t16;
	let t17;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = () => {
			if (!pointerStartRef.current || !pointerCurrentRef.current) return {
				x: 0,
				y: 0
			};
			const current = toDragStartFrame(pointerCurrentRef.current);
			return {
				x: current.x - pointerStartRef.current.x,
				y: current.y - pointerStartRef.current.y
			};
		};
		$[15] = t17;
	} else t17 = $[15];
	const getPointerDeltaScreen = t17;
	const [dragStartAnchor, setDragStartAnchor] = (0, import_react.useState)(null);
	if (!activeId && dragStartAnchor !== null) setDragStartAnchor(null);
	const snapTargetsRef = (0, import_react.useRef)(null);
	let t18;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = {
			x: 0,
			y: 0
		};
		$[16] = t18;
	} else t18 = $[16];
	const snapCorrectionRef = (0, import_react.useRef)(t18);
	const lastMovePointerRef = (0, import_react.useRef)(null);
	const groupStartRectRef = (0, import_react.useRef)(null);
	const snapSiblingRectsRef = (0, import_react.useRef)(null);
	const snapSourceRef = (0, import_react.useRef)(null);
	const snapCameraRef = (0, import_react.useRef)(null);
	const snapMemoryRef = (0, import_react.useRef)(NO_SNAP_MEMORY);
	const altCloneIdsRef = (0, import_react.useRef)(null);
	const altToggleSettleRef = (0, import_react.useRef)(false);
	const altPreCloneRef = (0, import_react.useRef)(null);
	const altTxRef = (0, import_react.useRef)(null);
	const dragPageIdRef = (0, import_react.useRef)(void 0);
	let t19;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = {
			rect: getDragElementRect,
			toLiveHitRect,
			withinFlexCrossAxis: (id_1, x, y) => isPointerWithinFlexParentCrossAxis(id_1, x, y, flexCacheRef.current),
			flexContainerAt: (x_0, y_0, excludeIds) => findFlexDropContainer(x_0, y_0, excludeIds, isFlexCacheRef.current),
			flexSlot: (query) => getFlexDropSlot({
				...query,
				cache: flexCacheRef.current
			}),
			idsAt: candidateIdsUnderPoint
		};
		$[17] = t19;
	} else t19 = $[17];
	const previewReads = t19;
	let t20;
	if ($[18] !== planElementMove) {
		t20 = () => ({
			isFlowLayout: isFlowLayoutElement,
			paddingBox: _temp$86,
			containingBox: _temp2$54,
			toLiveRect,
			scale: getCamera().scale,
			planElementMove
		});
		$[18] = planElementMove;
		$[19] = t20;
	} else t20 = $[19];
	const dropEnv = t20;
	let t21;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = (ops) => {
			const tx = altTxRef.current ?? usePages.getState().transaction();
			altTxRef.current = null;
			tx.stage(ops);
			tx.commit();
		};
		$[20] = t21;
	} else t21 = $[20];
	const commitDrop = t21;
	let t22;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = (restoreSelection) => {
			const tx_0 = altTxRef.current;
			altTxRef.current = null;
			if (!tx_0) return;
			tx_0.discard();
			if (restoreSelection) useSelection.getState().select(new Set(restoreSelection));
		};
		$[21] = t22;
	} else t22 = $[21];
	const discardAltClones = t22;
	let getLastMoveDeltaScreen;
	let getSnappedCanvasDelta;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		getSnappedCanvasDelta = () => ({
			x: (getLastMoveDeltaScreen().x + snapCorrectionRef.current.x) / getDragStartScale(),
			y: (getLastMoveDeltaScreen().y + snapCorrectionRef.current.y) / getDragStartScale()
		});
		getLastMoveDeltaScreen = () => {
			const pointer = lastMovePointerRef.current;
			const start_1 = pointerStartRef.current;
			if (!pointer || !start_1) return {
				x: 0,
				y: 0
			};
			const mapped = toDragStartFrame(pointer);
			return {
				x: mapped.x - start_1.x,
				y: mapped.y - start_1.y
			};
		};
		$[22] = getLastMoveDeltaScreen;
		$[23] = getSnappedCanvasDelta;
	} else {
		getLastMoveDeltaScreen = $[22];
		getSnappedCanvasDelta = $[23];
	}
	let t23;
	if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = [];
		$[24] = t23;
	} else t23 = $[24];
	const movedRootsRef = (0, import_react.useRef)(t23);
	let t24;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = () => {
			if (movedRootsRef.current.length === 0) return;
			const { x: x_1, y: y_1 } = getSnappedCanvasDelta();
			const at = { transform: `translate(${x_1}px, ${y_1}px)` };
			const delta = `${x_1},${y_1}`;
			const outlineWidth = `${1 / getCamera().scale}px`;
			for (const { root, animation } of movedRootsRef.current) {
				if (root.getAttribute("data-drag-delta") === delta && root.style.outlineWidth === outlineWidth) continue;
				animation.effect.setKeyframes([at, at]);
				root.setAttribute("data-drag-delta", delta);
				if (root.style.outlineWidth !== outlineWidth) root.style.outlineWidth = outlineWidth;
			}
		};
		$[25] = t24;
	} else t24 = $[25];
	const moveRootsInPlace = t24;
	const lastZoomAtRef = (0, import_react.useRef)(0);
	let t25;
	let t26;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = () => {
			let lastScale = getCamera().scale;
			return subscribeCamera((c) => {
				if (c.scale === lastScale) return;
				lastScale = c.scale;
				lastZoomAtRef.current = performance.now();
			});
		};
		t26 = [];
		$[26] = t25;
		$[27] = t26;
	} else {
		t25 = $[26];
		t26 = $[27];
	}
	(0, import_react.useEffect)(t25, t26);
	const internalZoomGestureAtRef = (0, import_react.useRef)(0);
	const zoomGestureAtRef = zoomGestureAtRefProp ?? internalZoomGestureAtRef;
	const disableSnapKeyDownRef = (0, import_react.useRef)(false);
	let t27;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = (next_2) => {
			sceneRef.current.measureRect = next_2;
			previewLayer().schedule();
		};
		$[28] = t27;
	} else t27 = $[28];
	const commitDragPreviewRect = t27;
	let t28;
	if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = (offset, guides) => {
			snapCorrectionRef.current = offset;
			sceneRef.current.snap = offset;
			sceneRef.current.guides = guides;
			previewLayer().schedule();
		};
		$[29] = t28;
	} else t28 = $[29];
	const commitSnap = t28;
	let t29;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = (measures, guides_0) => {
			sceneRef.current.spacingMeasures = measures;
			sceneRef.current.spacingGuides = guides_0;
			previewLayer().schedule();
		};
		$[30] = t29;
	} else t29 = $[30];
	const commitSpacing = t29;
	let t30;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = () => {
			snapMemoryRef.current = NO_SNAP_MEMORY;
			commitSnap({
				x: 0,
				y: 0
			}, []);
			commitDragPreviewRect(null);
			commitSpacing([], []);
		};
		$[31] = t30;
	} else t30 = $[31];
	const clearSnap = t30;
	let t31;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t31 = /* @__PURE__ */ new Map();
		$[32] = t31;
	} else t31 = $[32];
	const dragStartStateRef = (0, import_react.useRef)(t31);
	let t32;
	if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = /* @__PURE__ */ new Map();
		$[33] = t32;
	} else t32 = $[33];
	const [dragStartRects, setDragStartRects] = (0, import_react.useState)(t32);
	if (!activeId && dragStartRects.size > 0) setDragStartRects(/* @__PURE__ */ new Map());
	let t33;
	if ($[34] !== onStartAltDrag) {
		t33 = (draggedIds, leadId, rects) => {
			if (!onStartAltDrag) return null;
			const canvasRect = getCanvasRect();
			const elementsToClone = [];
			for (const id_4 of draggedIds) {
				const originalState = dragStartStateRef.current.get(id_4);
				if (!originalState) continue;
				let canvasPos;
				let lockSize = null;
				if (originalState.parentId !== null && originalState.rect && canvasRect) {
					const { scale, positionX, positionY } = getCamera();
					canvasPos = {
						x: (originalState.rect.left - canvasRect.left - positionX) / scale,
						y: (originalState.rect.top - canvasRect.top - positionY) / scale
					};
					lockSize = {
						width: originalState.rect.width / scale,
						height: originalState.rect.height / scale
					};
				} else canvasPos = originalState.position ?? null;
				elementsToClone.push({
					originalId: id_4,
					canvasPos,
					lockSize
				});
			}
			const started = onStartAltDrag(elementsToClone);
			if (!started) return null;
			altTxRef.current = started.tx;
			const { cloneIds } = started;
			if (cloneIds.length !== elementsToClone.length) {
				discardAltClones();
				return null;
			}
			altPreCloneRef.current = {
				ids: new Set(draggedIds),
				lead: leadId,
				states: new Map(dragStartStateRef.current),
				rects: new Map(rects)
			};
			altCloneIdsRef.current = new Set(cloneIds);
			for (let i = 0; i < elementsToClone.length; i++) {
				const { originalId, canvasPos: canvasPos_0 } = elementsToClone[i];
				const cloneId = cloneIds[i];
				const originalState_0 = dragStartStateRef.current.get(originalId);
				if (originalState_0) {
					dragStartStateRef.current.set(cloneId, {
						...originalState_0,
						parentId: null,
						position: canvasPos_0 ?? void 0,
						marginLeft: 0,
						marginTop: 0
					});
					dragStartStateRef.current.delete(originalId);
				}
				const rect_1 = rects.get(originalId);
				if (rect_1) {
					rects.set(cloneId, rect_1);
					rects.delete(originalId);
				}
			}
			const leadIdx = elementsToClone.findIndex((e) => e.originalId === leadId);
			return cloneIds[leadIdx >= 0 ? leadIdx : 0] ?? null;
		};
		$[34] = onStartAltDrag;
		$[35] = t33;
	} else t33 = $[35];
	const createAltClones = t33;
	let t34;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t34 = () => {
			const source = snapSourceRef.current;
			if (!source) return;
			const camera = getCamera();
			if (snapCameraRef.current && sameCamera(snapCameraRef.current, camera)) return;
			snapCameraRef.current = camera;
			const live_0 = getCanvasRect();
			const start_2 = dragStartFrameRef.current;
			let viewport;
			if (live_0) {
				const now_1 = {
					scale: camera.scale,
					panX: camera.positionX,
					panY: camera.positionY,
					originX: live_0.left,
					originY: live_0.top
				};
				const tl = start_2 ? mapScreenPoint({
					x: live_0.left,
					y: live_0.top
				}, now_1, start_2) : {
					x: live_0.left,
					y: live_0.top
				};
				const br = start_2 ? mapScreenPoint({
					x: live_0.right,
					y: live_0.bottom
				}, now_1, start_2) : {
					x: live_0.right,
					y: live_0.bottom
				};
				viewport = {
					left: tl.x,
					top: tl.y,
					right: br.x,
					bottom: br.y
				};
			}
			const visible = viewport ? visibleSnapRects(source.rects, viewport) : source.rects;
			snapTargetsRef.current = collectSnapLines(visible, source.box, viewport);
			snapSiblingRectsRef.current = visible;
		};
		$[36] = t34;
	} else t34 = $[36];
	const refreshSnapVisibility = t34;
	let t35;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t35 = (draggedIds_0, rects_0, alsoExclude) => {
			const altCloneIds = altCloneIdsRef.current;
			snapTargetsRef.current = null;
			groupStartRectRef.current = null;
			snapSiblingRectsRef.current = null;
			snapSourceRef.current = null;
			snapCameraRef.current = null;
			snapMemoryRef.current = NO_SNAP_MEMORY;
			let commonParentId = altCloneIds ? null : void 0;
			let sameParent = true;
			if (!altCloneIds) for (const id_5 of draggedIds_0) {
				const pk = getParentId(usePages.getState().tree, id_5);
				const pid = pk === "ROOT" || pk === null ? null : pk;
				if (commonParentId === void 0) commonParentId = pid;
				else if (commonParentId !== pid) {
					sameParent = false;
					break;
				}
			}
			if (!sameParent) return;
			const parentId = commonParentId ?? null;
			const movingIds = altCloneIds ?? draggedIds_0;
			const siblingIds = (parentId === null ? getRootIds(usePages.getState().tree) : getChildren$2(usePages.getState().tree, parentId)).filter((id_6) => !movingIds.has(id_6) && !alsoExclude?.has(id_6));
			const targets = [];
			for (const sid of siblingIds) {
				const r = getElementRect$1(sid);
				if (r) targets.push({
					left: r.left,
					top: r.top,
					width: r.width,
					height: r.height
				});
			}
			const box = parentId ? getElementPaddingBox(parentId, getCamera().scale) ?? void 0 : void 0;
			snapSourceRef.current = {
				rects: targets,
				box
			};
			refreshSnapVisibility();
			if (draggedIds_0.size > 1) {
				let left = Infinity;
				let top = Infinity;
				let right = -Infinity;
				let bottom = -Infinity;
				for (const r_0 of rects_0.values()) {
					left = Math.min(left, r_0.left);
					top = Math.min(top, r_0.top);
					right = Math.max(right, r_0.left + r_0.width);
					bottom = Math.max(bottom, r_0.top + r_0.height);
				}
				if (left !== Infinity) groupStartRectRef.current = {
					left,
					top,
					width: right - left,
					height: bottom - top
				};
			}
		};
		$[37] = t35;
	} else t35 = $[37];
	const collectSnapTargets = t35;
	let t36;
	if ($[38] !== createAltClones || $[39] !== onSelectElement || $[40] !== pageId || $[41] !== selectedElementIds) {
		t36 = (t37) => {
			const { pressedId: clickedElementId, pointer: initialPointer, alt: isAlt, cmd: activatorMeta } = t37;
			dragPageIdRef.current = pageId;
			previewLayer();
			domDropRef.current = {
				overId: null,
				dropSlot: null,
				shouldDetach: false
			};
			sceneRef.current = emptyDragPreviewScene();
			dragStartFrameRef.current = getCurrentFrame();
			sceneRef.current.startFrame = dragStartFrameRef.current;
			sceneRef.current.pointerStart = initialPointer;
			sceneRef.current.pointer = initialPointer;
			pointerStartRef.current = initialPointer;
			pointerCurrentRef.current = initialPointer;
			const frame = dragStartFrameRef.current;
			if (frame) setDragStartAnchor({
				pointerX: initialPointer.x,
				pointerY: initialPointer.y,
				frame
			});
			altDownRef.current = isAlt;
			disableSnapKeyDownRef.current = activatorMeta;
			let effectiveId = resolveDragLead({
				tree: usePages.getState().tree,
				pressedId: clickedElementId,
				hoveredId: useHover.getState().hoveredId,
				selectedIds: selectedElementIds,
				alt: isAlt
			});
			showDetach(false);
			commitDropSlot(null);
			flexCacheRef.current = createFlexSlotCache();
			isFlexCacheRef.current = /* @__PURE__ */ new WeakMap();
			nodeCacheRef.current = /* @__PURE__ */ new Map();
			const draggedIds_1 = getDraggedIds(effectiveId, selectedElementIds);
			dragStartStateRef.current = snapshotDragStart(usePages.getState().tree, draggedIds_1, {
				rect: getElementRect$1,
				margins: getElementComputedMargins
			});
			const rectsSnapshot = /* @__PURE__ */ new Map();
			for (const [id_7, state] of dragStartStateRef.current) if (state.rect) rectsSnapshot.set(id_7, {
				...state.rect,
				preview: readDragPreviewGeometry(id_7),
				box: readDragPreviewBox(id_7)
			});
			altCloneIdsRef.current = null;
			altPreCloneRef.current = null;
			if (isAlt) {
				const leadClone = createAltClones(draggedIds_1, effectiveId, rectsSnapshot);
				if (leadClone) effectiveId = leadClone;
			}
			lastMovePointerRef.current = null;
			clearSnap();
			collectSnapTargets(draggedIds_1, rectsSnapshot);
			setDragStartRects(rectsSnapshot);
			setActiveId(effectiveId);
			if (!isAlt && onSelectElement && !selectedElementIds.has(effectiveId)) onSelectElement(effectiveId);
		};
		$[38] = createAltClones;
		$[39] = onSelectElement;
		$[40] = pageId;
		$[41] = selectedElementIds;
		$[42] = t36;
	} else t36 = $[42];
	const beginDrag = t36;
	const endDrag = () => {
		if (dragPageIdRef.current !== pageId) {
			handleDragCancel();
			return;
		}
		dragPageIdRef.current = void 0;
		if (!activeId) {
			discardAltClones();
			setActiveId(null);
			snapTargetsRef.current = null;
			clearSnap();
			return;
		}
		const decided = domDropRef.current;
		const ops_0 = planDrop({
			tree: usePages.getState().tree,
			activeId,
			draggedIds: getDraggedIds(activeId, selectedElementIds),
			dropSlot: decided.dropSlot,
			overId: decided.overId,
			shouldDetach: decided.shouldDetach,
			starts: dragStartStateRef.current,
			startFrame: dragStartFrameRef.current,
			startScale: getDragStartScale(),
			pointerDeltaScreen: getPointerDeltaScreen(),
			snappedCanvasDelta: getSnappedCanvasDelta()
		}, dropEnv());
		if (ops_0) commitDrop(ops_0);
		discardAltClones();
		setActiveId(null);
		dragStartStateRef.current.clear();
		snapTargetsRef.current = null;
		clearSnap();
	};
	let t37;
	if ($[43] !== activeId || $[44] !== createAltClones || $[45] !== dragStartRects || $[46] !== onStartAltDrag || $[47] !== selectedElementIds) {
		t37 = (altDown) => {
			if (!activeId) return false;
			if (altDown && !altCloneIdsRef.current && onStartAltDrag) {
				const promotingIds = getDraggedIds(activeId, selectedElementIds);
				const rects_1 = new Map(dragStartRects);
				const leadClone_0 = createAltClones(promotingIds, activeId, rects_1);
				if (!leadClone_0) return false;
				setDragStartRects(rects_1);
				collectSnapTargets(promotingIds, rects_1);
				clearSnap();
				setActiveId(leadClone_0);
				altToggleSettleRef.current = true;
				return true;
			}
			const preClone = altPreCloneRef.current;
			if (!altDown && altCloneIdsRef.current && preClone) {
				const staleClones = altCloneIdsRef.current;
				discardAltClones([...preClone.ids]);
				dragStartStateRef.current = new Map(preClone.states);
				altCloneIdsRef.current = null;
				altPreCloneRef.current = null;
				setDragStartRects(preClone.rects);
				collectSnapTargets(preClone.ids, preClone.rects, staleClones);
				clearSnap();
				setActiveId(preClone.lead);
				altToggleSettleRef.current = true;
				return true;
			}
			return false;
		};
		$[43] = activeId;
		$[44] = createAltClones;
		$[45] = dragStartRects;
		$[46] = onStartAltDrag;
		$[47] = selectedElementIds;
		$[48] = t37;
	} else t37 = $[48];
	const applyAltToggle = t37;
	let t38;
	if ($[49] !== selectedElementIds) {
		t38 = (activeId_0, pointerDeltaScreen) => {
			const tree = usePages.getState().tree;
			const currentParentKey = getParentId(tree, activeId_0);
			const currentParentId = currentParentKey === "ROOT" || currentParentKey === null ? null : currentParentKey;
			const activeStartRect = dragStartStateRef.current.get(activeId_0)?.rect ?? getDragElementRect(activeId_0);
			const draggedIdsNow = getDraggedIds(activeId_0, selectedElementIds);
			const move = {
				tree,
				activeId: activeId_0,
				draggedIds: draggedIdsNow,
				startRect: activeStartRect,
				pointerDeltaScreen
			};
			const leftParent = detachIntent(move, previewReads);
			const flex = findFlexSlot(move, pointerCurrentRef.current, previewReads);
			if (flex) {
				commitDropSlot(flex.slot);
				showOverId(flex.parentId);
				if (flex.reorder) applyFlexReorderPreview({
					parentId: flex.parentId,
					draggedId: activeId_0,
					draggedIds: draggedIdsNow,
					allSiblingIds: flex.siblings,
					slot: flex.slot,
					cache: flexCacheRef.current,
					canvasScale: getCamera().scale
				});
				else clearFlexReorderPreview(flexCacheRef.current);
				showDetach(false);
				clearSnap();
				return;
			}
			commitDropSlot(null);
			clearFlexReorderPreview(flexCacheRef.current);
			showDetach(leftParent);
			if (!activeStartRect) {
				showOverId(null);
				clearSnap();
				return;
			}
			const { overId: nestTarget, previewRect } = findNestTarget({
				...move,
				startRect: activeStartRect
			}, leftParent, previewReads);
			showOverId(nestTarget);
			const canFreeMove = !nestTarget && !leftParent;
			let snapDx = 0;
			let snapDy = 0;
			if (snapTargetsRef.current && canFreeMove && !disableSnapKeyDownRef.current) {
				refreshSnapVisibility();
				const group = draggedIdsNow.size > 1 ? groupStartRectRef.current : null;
				const snapPreview = group ? {
					left: group.left + pointerDeltaScreen.x,
					top: group.top + pointerDeltaScreen.y,
					width: group.width,
					height: group.height
				} : {
					left: previewRect.left,
					top: previewRect.top,
					width: previewRect.width,
					height: previewRect.height
				};
				const snap = computeSnap(snapPreview, snapTargetsRef.current, void 0, snapMemoryRef.current);
				snapMemoryRef.current = snap.memory;
				snapDx = snap.dx;
				snapDy = snap.dy;
				const guides_1 = [...snap.guidesV.map(_temp3$39), ...snap.guidesH.map(_temp4$34)];
				let spMeasures = [];
				let spGuides = [];
				if (!group && snapSiblingRectsRef.current) {
					const sp = computeSpacing({
						left: snapPreview.left + snapDx,
						top: snapPreview.top + snapDy,
						width: snapPreview.width,
						height: snapPreview.height
					}, snapSiblingRectsRef.current);
					if (snapDx === 0) snapDx = snapDx + sp.dx;
					if (snapDy === 0) snapDy = snapDy + sp.dy;
					spMeasures = sp.measures;
					spGuides = sp.guides;
				}
				commitSnap({
					x: snapDx,
					y: snapDy
				}, guides_1);
				commitSpacing(spMeasures, spGuides);
			} else clearSnap();
			if (canFreeMove && currentParentId && getById(usePages.getState().tree, activeId_0)?.styles?.position === "absolute") commitDragPreviewRect({
				left: previewRect.left + snapDx,
				top: previewRect.top + snapDy,
				width: previewRect.width,
				height: previewRect.height
			});
			else commitDragPreviewRect(null);
		};
		$[49] = selectedElementIds;
		$[50] = t38;
	} else t38 = $[50];
	const updateDragPreview = t38;
	let t39;
	if ($[51] !== activeId || $[52] !== applyAltToggle || $[53] !== updateDragPreview) {
		t39 = () => {
			if (!activeId) return;
			const pointerDeltaScreen_0 = getPointerDeltaScreen();
			lastMovePointerRef.current = pointerCurrentRef.current;
			if (applyAltToggle(altDownRef.current)) return;
			updateDragPreview(activeId, pointerDeltaScreen_0);
		};
		$[51] = activeId;
		$[52] = applyAltToggle;
		$[53] = updateDragPreview;
		$[54] = t39;
	} else t39 = $[54];
	const runDragMove = t39;
	let t40;
	if ($[55] !== updateDragPreview) {
		t40 = (id_8) => {
			updateDragPreview(id_8, getLastMoveDeltaScreen());
		};
		$[55] = updateDragPreview;
		$[56] = t40;
	} else t40 = $[56];
	const replayLastDragPreview = (0, import_react.useEffectEvent)(t40);
	let t41;
	if ($[57] !== activeId || $[58] !== replayLastDragPreview) {
		t41 = () => {
			if (!activeId) return;
			const maybeReplay = () => {
				if (!altToggleSettleRef.current) return;
				altToggleSettleRef.current = false;
				replayLastDragPreview(activeId);
			};
			const unsubscribe = usePages.subscribe(_temp5$30, maybeReplay);
			maybeReplay();
			return unsubscribe;
		};
		$[57] = activeId;
		$[58] = replayLastDragPreview;
		$[59] = t41;
	} else t41 = $[59];
	let t42;
	if ($[60] !== activeId) {
		t42 = [activeId];
		$[60] = activeId;
		$[61] = t42;
	} else t42 = $[61];
	(0, import_react.useLayoutEffect)(t41, t42);
	const handleDragCancel = () => {
		dragPageIdRef.current = void 0;
		discardAltClones();
		setActiveId(null);
		dragStartStateRef.current.clear();
		snapTargetsRef.current = null;
		altCloneIdsRef.current = null;
		altPreCloneRef.current = null;
		clearSnap();
	};
	let t43;
	if ($[62] !== endDrag || $[63] !== handleDragCancel || $[64] !== runDragMove) {
		t43 = {
			runDragMove,
			endDrag,
			handleDragCancel,
			moveRootsInPlace
		};
		$[62] = endDrag;
		$[63] = handleDragCancel;
		$[64] = runDragMove;
		$[65] = t43;
	} else t43 = $[65];
	const latestDragRef = (0, import_react.useRef)(t43);
	let t44;
	if ($[66] !== endDrag || $[67] !== handleDragCancel || $[68] !== runDragMove) {
		t44 = () => {
			latestDragRef.current = {
				runDragMove,
				endDrag,
				handleDragCancel,
				moveRootsInPlace
			};
		};
		$[66] = endDrag;
		$[67] = handleDragCancel;
		$[68] = runDragMove;
		$[69] = t44;
	} else t44 = $[69];
	(0, import_react.useLayoutEffect)(t44);
	let t45;
	if ($[70] !== zoomGestureAtRef) {
		t45 = (at_0) => {
			altDownRef.current = at_0.alt;
			const lastZoomAt = Math.max(lastZoomAtRef.current, zoomGestureAtRef.current);
			disableSnapKeyDownRef.current = at_0.cmd && performance.now() - lastZoomAt > 400;
		};
		$[70] = zoomGestureAtRef;
		$[71] = t45;
	} else t45 = $[71];
	const readModifiers = t45;
	let t46;
	if ($[72] !== readModifiers) {
		t46 = (at_1) => {
			readModifiers(at_1);
			pointerCurrentRef.current = at_1.screen;
			sceneRef.current.pointer = at_1.screen;
			latestDragRef.current.runDragMove();
		};
		$[72] = readModifiers;
		$[73] = t46;
	} else t46 = $[73];
	const moveDrag = t46;
	let t47;
	if ($[74] !== readModifiers) {
		t47 = (at_2) => {
			readModifiers(at_2);
			latestDragRef.current.runDragMove();
		};
		$[74] = readModifiers;
		$[75] = t47;
	} else t47 = $[75];
	const dragModifiers = t47;
	const cameraMovedRef = (0, import_react.useRef)(false);
	let t48;
	if ($[76] === Symbol.for("react.memo_cache_sentinel")) {
		t48 = () => {
			cameraMovedRef.current = true;
			layerRef.current?.schedule();
		};
		$[76] = t48;
	} else t48 = $[76];
	const dragCamera = t48;
	let t49;
	if ($[77] === Symbol.for("react.memo_cache_sentinel")) {
		t49 = (at_3) => {
			pointerCurrentRef.current = at_3.screen;
			sceneRef.current.pointer = at_3.screen;
			latestDragRef.current.endDrag();
		};
		$[77] = t49;
	} else t49 = $[77];
	const dropDrag = t49;
	let t50;
	if ($[78] === Symbol.for("react.memo_cache_sentinel")) {
		t50 = () => latestDragRef.current.handleDragCancel();
		$[78] = t50;
	} else t50 = $[78];
	const cancelDrag = t50;
	let t51;
	if ($[79] !== activeId) {
		t51 = activeId ? getTree().byId.get(activeId) ?? null : null;
		$[79] = activeId;
		$[80] = t51;
	} else t51 = $[80];
	const activeElement = t51;
	let t52;
	if ($[81] !== activeId || $[82] !== selectedElementIds) {
		t52 = activeId ? getDraggedIds(activeId, selectedElementIds) : EMPTY_DRAGGED_IDS;
		$[81] = activeId;
		$[82] = selectedElementIds;
		$[83] = t52;
	} else t52 = $[83];
	const draggedIds_2 = t52;
	let activeElements;
	if ($[84] !== activeId || $[85] !== draggedIds_2) {
		activeElements = !activeId ? EMPTY_ACTIVE_ELEMENTS : [];
		if (activeId) {
			const tree_0 = getTree();
			for (const id_9 of draggedIds_2) {
				const el = tree_0.byId.get(id_9);
				if (el) activeElements.push(el);
			}
		}
		$[84] = activeId;
		$[85] = draggedIds_2;
		$[86] = activeElements;
	} else activeElements = $[86];
	let t53;
	let t54;
	if ($[87] !== activeId) {
		t53 = () => {
			if (activeId) return;
			dragStartFrameRef.current = null;
			clearFlexReorderPreview(flexCacheRef.current);
			nodeCacheRef.current = /* @__PURE__ */ new Map();
			layerRef.current?.clear();
			sceneRef.current = emptyDragPreviewScene();
		};
		t54 = [activeId];
		$[87] = activeId;
		$[88] = t53;
		$[89] = t54;
	} else {
		t53 = $[88];
		t54 = $[89];
	}
	(0, import_react.useLayoutEffect)(t53, t54);
	let t55;
	let t56;
	if ($[90] !== activeId) {
		t55 = () => {
			const layer = layerRef.current;
			if (!activeId || !layer) {
				pointerStartRef.current = null;
				pointerCurrentRef.current = null;
				return;
			}
			sceneRef.current.activeId = activeId;
			sceneRef.current.startRect = dragStartStateRef.current.get(activeId)?.rect ?? null;
			cameraMovedRef.current = false;
			layer.onFrame(() => {
				if (cameraMovedRef.current) {
					cameraMovedRef.current = false;
					latestDragRef.current.runDragMove();
				}
				latestDragRef.current.moveRootsInPlace();
			});
			layer.drawNow();
			return () => layer.onFrame(null);
		};
		t56 = [activeId];
		$[90] = activeId;
		$[91] = t55;
		$[92] = t56;
	} else {
		t55 = $[91];
		t56 = $[92];
	}
	(0, import_react.useLayoutEffect)(t55, t56);
	let t57;
	if ($[93] !== activeId || $[94] !== draggedIds_2) {
		t57 = !!activeId && [...draggedIds_2].every(_temp6$24);
		$[93] = activeId;
		$[94] = draggedIds_2;
		$[95] = t57;
	} else t57 = $[95];
	const movesInPlace = t57;
	const onRootsPlaced = (0, import_react.useEffectEvent)(moveRootsInPlace);
	let t58;
	if ($[96] !== activeId || $[97] !== draggedIds_2) {
		t58 = activeId ? Array.from(draggedIds_2).sort().join(",") : "";
		$[96] = activeId;
		$[97] = draggedIds_2;
		$[98] = t58;
	} else t58 = $[98];
	const draggedIdsKey = t58;
	let t59;
	if ($[99] !== draggedIdsKey || $[100] !== movesInPlace || $[101] !== onRootsPlaced) {
		t59 = () => {
			if (!draggedIdsKey || !movesInPlace) return;
			const moved = [];
			const sources = [];
			for (const id_11 of draggedIdsKey.split(",")) {
				const root_0 = document.querySelector(`[data-canvas-root-id="${CSS.escape(id_11)}"]`);
				if (!root_0) continue;
				sources.push(markDragSource(root_0));
				root_0.style.zIndex = String(DRAGGED_ROOT_Z_INDEX);
				const preview = getTree().byId.get(id_11)?.type === "webview";
				root_0.style.outline = `solid var(${preview ? "--ed-canvas-webview" : "--ed-canvas-selection"})`;
				const still = { transform: "none" };
				const animation_0 = root_0.animate([still, still], {
					duration: MOVE_IN_PLACE_ANIMATION_MS,
					fill: "forwards"
				});
				moved.push({
					root: root_0,
					animation: animation_0
				});
			}
			movedRootsRef.current = moved;
			onRootsPlaced();
			return () => {
				movedRootsRef.current = [];
				for (const { root: root_1, animation: animation_1 } of moved) {
					animation_1.cancel();
					root_1.removeAttribute("data-drag-delta");
					root_1.style.zIndex = "";
					root_1.style.outline = "";
				}
				for (const source_0 of sources) unmarkDragSource(source_0);
			};
		};
		$[99] = draggedIdsKey;
		$[100] = movesInPlace;
		$[101] = onRootsPlaced;
		$[102] = t59;
	} else t59 = $[102];
	let t60;
	if ($[103] !== draggedIdsKey || $[104] !== movesInPlace) {
		t60 = [draggedIdsKey, movesInPlace];
		$[103] = draggedIdsKey;
		$[104] = movesInPlace;
		$[105] = t60;
	} else t60 = $[105];
	(0, import_react.useLayoutEffect)(t59, t60);
	let t61;
	let t62;
	if ($[106] !== draggedIdsKey || $[107] !== movesInPlace) {
		t61 = () => {
			if (!draggedIdsKey || movesInPlace) return;
			const sources_0 = [];
			const hidden = [];
			for (const id_12 of draggedIdsKey.split(",")) {
				const el_0 = document.querySelector(`[data-element-id="${CSS.escape(id_12)}"]`);
				const follows = !!el_0?.hasAttribute("data-drag-follows");
				if (el_0) sources_0.push(markDragSource(el_0));
				if (el_0 && !follows) {
					const property = getComputedStyle(el_0).display === "contents" ? "visibility" : "opacity";
					hidden.push({
						el: el_0,
						property,
						value: el_0.style[property]
					});
					el_0.style[property] = property === "opacity" ? "0" : "hidden";
				}
				const root_2 = follows ? null : document.querySelector(`[data-canvas-root-id="${CSS.escape(id_12)}"]`);
				if (root_2) {
					hidden.push({
						el: root_2,
						property: "opacity",
						value: root_2.style.opacity
					});
					root_2.style.opacity = "0";
				}
			}
			return () => {
				for (const { el: el_1, property: property_0, value } of hidden) el_1.style[property_0] = value;
				for (const source_1 of sources_0) unmarkDragSource(source_1);
			};
		};
		t62 = [draggedIdsKey, movesInPlace];
		$[106] = draggedIdsKey;
		$[107] = movesInPlace;
		$[108] = t61;
		$[109] = t62;
	} else {
		t61 = $[108];
		t62 = $[109];
	}
	(0, import_react.useLayoutEffect)(t61, t62);
	const t63 = !!activeId;
	let t64;
	if ($[110] !== activeElement || $[111] !== activeElements || $[112] !== activeId || $[113] !== beginDrag || $[114] !== dragModifiers || $[115] !== dragStartAnchor || $[116] !== dragStartRects || $[117] !== draggedIds_2 || $[118] !== moveDrag || $[119] !== movesInPlace || $[120] !== t63) {
		t64 = {
			activeId,
			activeElement,
			activeElements,
			draggedIds: draggedIds_2,
			isDragging: t63,
			movesInPlace,
			previewGuidesRef: guidesHostRef,
			previewParentRef: parentHostRef,
			previewCopyRef: copyHostRef,
			dragStartAnchor,
			dragStartRects,
			beginDrag,
			moveDrag,
			dragModifiers,
			dragCamera,
			dropDrag,
			cancelDrag
		};
		$[110] = activeElement;
		$[111] = activeElements;
		$[112] = activeId;
		$[113] = beginDrag;
		$[114] = dragModifiers;
		$[115] = dragStartAnchor;
		$[116] = dragStartRects;
		$[117] = draggedIds_2;
		$[118] = moveDrag;
		$[119] = movesInPlace;
		$[120] = t63;
		$[121] = t64;
	} else t64 = $[121];
	return t64;
}
function _temp6$24(id_10) {
	return getParentId(getTree(), id_10) === ROOT;
}
function _temp5$30(s) {
	return s.tree;
}
function _temp4$34(l_0) {
	return {
		axis: "h",
		pos: l_0.pos,
		spanStart: l_0.spanStart,
		spanEnd: l_0.spanEnd
	};
}
function _temp3$39(l) {
	return {
		axis: "v",
		pos: l.pos,
		spanStart: l.spanStart,
		spanEnd: l.spanEnd
	};
}
function _temp2$54(id_3) {
	return getAbsoluteContainingBox(id_3, getCamera().scale);
}
function _temp$86(id_2) {
	return getElementPaddingBox(id_2, getCamera().scale);
}

export { useDndCanvas };
