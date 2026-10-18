// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/Canvas.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CHAT_ICON_PATH, XIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { i$5 } from "../../../../../vendor/@phosphor-icons/react.js";
import { toast } from "../../../../../vendor/sonner.js";
import { canAcceptChild, hasChildren$1 } from "../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getParentId, getRootIds, resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { getCamera, getCameraScale, isCameraDriving, notifyUserCameraGesture, publishCamera, registerCameraDriver, subscribeCamera, subscribeCameraScale } from "../../shell/hooks/useCommentAgent.js";
import { commentAnchorAt, findCommentTarget } from "../../shared/utils/commentAnchor.js";
import { applyOperationsToStore, createMoveOperation, createSetStylesOperation } from "../../shared/utils/operations.js";
import { isRelativeFlowPosition, positionStylesForPlacement } from "../utils/absolutePositioning.js";
import { getVisibleTree, usePages } from "../../shared/state/pages.js";
import { EMPTY_SELECTION, getSelectedElementIds, useSelectedElementIds, useSelection } from "../../shared/state/selection.js";
import { getElementPaddingBox, isFlowLayoutElement } from "../utils/domGeometry.js";
import { dragPreviewBoxSize } from "../utils/dragPreviewGeometry.js";
import { DragPreviewClone } from "./DragPreviewClone.js";
import { resolveDragSource } from "./DraggableElement.js";
import { useUploadImage } from "../../shared/hooks/useUploadImage.js";
import { createImageElement, getImageFromDropEvent, getPendingPanelDragElement, isCanvasInsertDrag, isCanvasInsertDragType, isFileDragType, looksLikeHTML } from "../../shared/utils/clipboard.js";
import { ElementErrorBoundary } from "./ErrorBoundary.js";
import { startEdgePanLoop } from "../utils/edgePan.js";
import { registerPanSurface } from "../../shared/utils/mouseButtonPolicy.js";
import { useWebviewEditValue } from "../../shared/state/webviewEditStore.js";
import { isInsertTool, useActiveTool } from "../../shared/state/activeTool.js";
import { PREVIEW_MIN_FRAME_SIZE, WebviewDragStandIn, previewFrameSize } from "../utils/renderElement.js";
import { useHover } from "../../shared/state/hover.js";
import { getCanvasHandleGesture, getCanvasInputState, getCanvasZoomMode, setCanvasContextMenuTarget, subscribeCanvasInputState, subscribeCanvasZoomMode } from "../input/inputState.js";
import { AgentPresenceOverlays, DragPreviewLabel, HoverOverlay, HoverPreviewOverlay, RootLabels, SelectionOverlay, beginRotate, overlayTrackedIdsKey, syncNameCap, useOverlayGeoms } from "./CanvasOverlays.js";
import { collectSnapLines, visibleSnapRects } from "../utils/snapping.js";
import { useResizing } from "../hooks/useResizing.js";
import { GUIDE_COLOR, snapGuideBox } from "../utils/dragGuides.js";
import { usePotentialParentOverlay } from "../hooks/usePotentialParentOverlay.js";
import { CanvasRootNode, setTextEditSession } from "./CanvasNode.js";
import { getInteractiveParentIds } from "../utils/interactiveParents.js";
import { InnerPicker, innerPickTookPress } from "./InnerPicker.js";
import { PreviewToolbar, collectAdoptedChildren } from "./PreviewToolbar.js";
import { getElementComputedMargins, getElementRect$1 } from "../utils/collisionUtils.js";
import { findContainerAt } from "../hooks/drawParent.js";
import { useAssetResolver } from "../../shared/contexts/AssetContext.js";
import { AgentFollowFrame } from "./AgentFollowFrame.js";
import { CanvasToolbar } from "./CanvasToolbar.js";
import { CanvasPixelGrid, pastDragThreshold } from "./CanvasPixelGrid.js";
import { CanvasRegionMask } from "./CanvasRegionMask.js";
import { beginPinDrag } from "./CommentPins.js";
import { CanvasAreasOverlay, ChatAreaHighlightOverlay } from "./CanvasAreasOverlay.js";
import { ComponentEditingModeBar } from "./ComponentEditingModeBar.js";
import { clickTarget, contextMenuTarget, hoverTarget } from "../input/selectTarget.js";
import { attachCanvasInput, canvasModeFor } from "../input/dispatcher.js";
import { beginNudge, nudgeSpent, setNudgeSpent } from "../utils/nudge.js";
import { CanvasCamera } from "./CanvasCamera.js";
import { useCanvasDraw } from "../hooks/useCanvasDraw.js";
import { resolveMoveTarget } from "../../shared/utils/dropPlan.js";
import { useDndCanvas } from "../hooks/useDndCanvas.js";
import { beginFrameResize, isFrameEdge } from "../utils/frameResize.js";
import { canAdoptElement } from "../utils/adoptionGuard.js";
import { useCanvasMarquee } from "../hooks/useCanvasMarquee.js";

var CAMERA_SETTLE_MS = 150;
/** Stand-in child for the drop outline during a file drag: dragover can't read the
*  files, and every media drop inserts an <img>/<video>, which hosts accept alike. */
var MEDIA_DROP_PROBE = createImageElement("");
/** Stable empty root list; a fresh `[]` from the selector would re-render an empty page on every edit. */
var NO_ROOTS = Object.freeze([]);
var COMMENT_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path d="${CHAT_ICON_PATH}" fill="#292929" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg>`)}") 4 28, crosshair`;
function PasteStyleCleanPrompt(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { nodeCount, onApply, onDismiss } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			width: 360,
			gap: "12px",
			padding: "12px",
			display: "flex",
			flexDirection: "column"
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			display: "flex",
			flexDirection: "column",
			gap: "2px"
		};
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "sm",
			weight: "medium",
			variant: "primary",
			children: "Found matching classes in your project"
		});
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	const t4 = nodeCount === 1 ? "" : "s";
	let t5;
	if ($[3] !== nodeCount || $[4] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t2,
			children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
				size: "xs",
				weight: "regular",
				variant: "tertiary",
				children: [
					nodeCount,
					" pasted element",
					t4,
					" carry inline styles your classes already cover. Remove them?"
				]
			})]
		});
		$[3] = nodeCount;
		$[4] = t4;
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = {
			display: "flex",
			flexDirection: "row",
			gap: "8px",
			alignItems: "center",
			justifyContent: "space-between"
		};
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] !== onDismiss) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: onDismiss,
			children: "Keep"
		});
		$[7] = onDismiss;
		$[8] = t7;
	} else t7 = $[8];
	let t8;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = {
			gap: 8,
			display: "flex",
			alignItems: "center",
			flexShrink: 0
		};
		$[9] = t8;
	} else t8 = $[9];
	let t9;
	if ($[10] !== onApply) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			size: "sm",
			onClick: () => onApply("class"),
			children: "Remove class-derived"
		});
		$[10] = onApply;
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== onApply) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => onApply("all"),
			children: "Remove all inline"
		});
		$[12] = onApply;
		$[13] = t10;
	} else t10 = $[13];
	let t11;
	if ($[14] !== t10 || $[15] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t8,
			children: [t9, t10]
		});
		$[14] = t10;
		$[15] = t9;
		$[16] = t11;
	} else t11 = $[16];
	let t12;
	if ($[17] !== t11 || $[18] !== t7) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t6,
			children: [t7, t11]
		});
		$[17] = t11;
		$[18] = t7;
		$[19] = t12;
	} else t12 = $[19];
	let t13;
	if ($[20] !== t12 || $[21] !== t5) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: t1,
				className: "bg-card shadow-lg border border-border rounded-lg",
				children: [t5, t12]
			})
		});
		$[20] = t12;
		$[21] = t5;
		$[22] = t13;
	} else t13 = $[22];
	return t13;
}
/** A frame moved in place keeps its name above it, as the drag copy did (DragPreviewLabel).
*  Portalled into the frame's wrapper, so it moves with the frame's drag animation. */
function MovedRootLabel(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { element, width } = t0;
	let t1;
	if ($[0] !== element.id) {
		t1 = document.querySelector(`[data-canvas-root-id="${CSS.escape(element.id)}"]`);
		$[0] = element.id;
		$[1] = t1;
	} else t1 = $[1];
	const host = t1;
	const zoom = (0, import_react.useSyncExternalStore)(subscribeCameraScale, getCameraScale);
	let t2;
	if ($[2] !== element || $[3] !== host || $[4] !== width || $[5] !== zoom) {
		t2 = host && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragPreviewLabel, {
			element,
			width,
			zoom
		}), host);
		$[2] = element;
		$[3] = host;
		$[4] = width;
		$[5] = zoom;
		$[6] = t2;
	} else t2 = $[6];
	return t2;
}
function CanvasRootTrees(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { readOnly, renderOptions, onStopEditText, canvasScale, onResizeElement, onViewportZoom, onViewportPan, assetResolver } = t0;
	const rootIds = usePages(_temp$85);
	const treeSize = usePages(_temp2$53);
	const t1 = readOnly ? _temp3$38 : onStopEditText;
	let t2;
	if ($[0] !== onResizeElement || $[1] !== readOnly) {
		t2 = readOnly ? void 0 : (id, width, height) => {
			onResizeElement(id, {
				width,
				height
			});
		};
		$[0] = onResizeElement;
		$[1] = readOnly;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== assetResolver || $[4] !== canvasScale || $[5] !== onViewportPan || $[6] !== onViewportZoom || $[7] !== t1 || $[8] !== t2) {
		t3 = {
			onStopEditText: t1,
			canvasScale,
			onResizeViewport: t2,
			onViewportZoom,
			onViewportPan,
			assetResolver,
			liveTree: getVisibleTree
		};
		$[3] = assetResolver;
		$[4] = canvasScale;
		$[5] = onViewportPan;
		$[6] = onViewportZoom;
		$[7] = t1;
		$[8] = t2;
		$[9] = t3;
	} else t3 = $[9];
	const canvasOptions = t3;
	let t4;
	if ($[10] !== canvasOptions || $[11] !== renderOptions) {
		t4 = {
			...renderOptions,
			...canvasOptions
		};
		$[10] = canvasOptions;
		$[11] = renderOptions;
		$[12] = t4;
	} else t4 = $[12];
	const options = t4;
	let t5;
	if ($[13] !== options || $[14] !== rootIds || $[15] !== treeSize) {
		let t6;
		if ($[17] !== options || $[18] !== treeSize) {
			t6 = (rootId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementErrorBoundary, {
				elementId: rootId,
				silent: rootId.startsWith("el-draw-"),
				resetKey: [treeSize],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasRootNode, {
					id: rootId,
					options
				})
			}, rootId);
			$[17] = options;
			$[18] = treeSize;
			$[19] = t6;
		} else t6 = $[19];
		t5 = rootIds.map(t6);
		$[13] = options;
		$[14] = rootIds;
		$[15] = treeSize;
		$[16] = t5;
	} else t5 = $[16];
	let t6;
	if ($[20] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t5 });
		$[20] = t5;
		$[21] = t6;
	} else t6 = $[21];
	return t6;
}
function _temp3$38() {}
function _temp2$53(s_0) {
	return s_0.visibleTree.byId.size;
}
function _temp$85(s) {
	return s.visibleTree.childrenByParent.get("ROOT") ?? NO_ROOTS;
}
function Canvas(t0) {
	const $ = (0, import_compiler_runtime.c)(437);
	const { onSelectElement, onSelectElements, onResizeElement, renderOptions, editingTextId, onStartEditText: onStartEditTextProp, onStopEditText: onStopEditTextProp, componentsRevision: t1, editingFile: t2, onCloseEdit, onAddElement, onDropElement, canvasRefProp, viewportRefProp, onStopFollowingAgent, readOnly: t3, backgroundColor, initialTransform, onUpdateElementStyles, onUpdateElementProps, onRenameElement, commentOverlay, commentMode: t4, onCommentClick, showCommentTools: t5, onToggleCommentMode, showResolvedComments: t6, onShowResolvedChange, onPickPreviewPreset, onOpenMoreHtml, onCaptureRegion, onPickElementForChat, chatAreas, pageId, pasteStyleSuggestion, onApplyPasteStyleClean, onDismissPasteStyleClean, componentEditMode, agentPresence, onStartAltDrag } = t0;
	const componentsRevision = t1 === void 0 ? 0 : t1;
	const editingFile = t2 === void 0 ? null : t2;
	const readOnly = t3 === void 0 ? false : t3;
	const commentMode = t4 === void 0 ? false : t4;
	const showCommentTools = t5 === void 0 ? false : t5;
	const showResolvedComments = t6 === void 0 ? false : t6;
	const selectedElementIds = useSelectedElementIds();
	const assetResolver = useAssetResolver();
	const uploadImage = useUploadImage();
	const { activeTool, setActiveTool, scaleAspectLocked } = useActiveTool();
	const internalCanvasRef = (0, import_react.useRef)(null);
	const zoomGestureAtRef = (0, import_react.useRef)(0);
	const canvasRef = canvasRefProp || internalCanvasRef;
	const activePreviewId = useWebviewEditValue(_temp4$33);
	let t7;
	if ($[0] !== onSelectElement) {
		t7 = (id, t8, click, t9) => {
			onSelectElement(id, t8 === void 0 ? false : t8, t9 === void 0 ? false : t9, click);
		};
		$[0] = onSelectElement;
		$[1] = t7;
	} else t7 = $[1];
	const selectElement = t7;
	const internalViewportRef = (0, import_react.useRef)(null);
	const viewportRef = viewportRefProp || internalViewportRef;
	const [resizing, setResizing] = (0, import_react.useState)(null);
	const panMode = (0, import_react.useSyncExternalStore)(subscribeCanvasInputState, getCanvasInputState).spaceHeld || activeTool === "pan";
	const zoomMode = (0, import_react.useSyncExternalStore)(subscribeCanvasZoomMode, getCanvasZoomMode);
	const layerCursor = zoomMode ? "zoom-in" : panMode ? "grab" : commentMode ? COMMENT_CURSOR : isInsertTool(activeTool) ? "crosshair" : null;
	const selectionModeRef = (0, import_react.useRef)("topmost");
	const panTimeoutRef = (0, import_react.useRef)(null);
	const selectionOverlayRef = (0, import_react.useRef)(null);
	const isPanningRef = (0, import_react.useRef)(false);
	const isDraggingRef = (0, import_react.useRef)(false);
	const cameraApplierRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const inputRegionMask = !!onCaptureRegion && !readOnly;
	const inputEditingText = !!editingTextId && !readOnly;
	let t8;
	if ($[2] !== activeTool || $[3] !== commentMode || $[4] !== inputEditingText || $[5] !== inputRegionMask || $[6] !== readOnly) {
		t8 = () => canvasModeFor(activeTool, {
			commentMode,
			readOnly,
			regionMask: inputRegionMask,
			editingText: inputEditingText
		});
		$[2] = activeTool;
		$[3] = commentMode;
		$[4] = inputEditingText;
		$[5] = inputRegionMask;
		$[6] = readOnly;
		$[7] = t8;
	} else t8 = $[7];
	const currentInputMode = (0, import_react.useEffectEvent)(t8);
	let t9;
	if ($[8] !== viewportRef.current) {
		t9 = () => {
			const viewport = viewportRef.current;
			if (!viewport) return;
			return registerPanSurface(viewport, { beginPan: (event) => inputRef.current?.beginPan(event) ?? false });
		};
		$[8] = viewportRef.current;
		$[9] = t9;
	} else t9 = $[9];
	let t10;
	if ($[10] !== viewportRef) {
		t10 = [viewportRef];
		$[10] = viewportRef;
		$[11] = t10;
	} else t10 = $[11];
	(0, import_react.useEffect)(t9, t10);
	let t11;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = (t12) => {
			const fullPass = t12 === void 0 ? false : t12;
			const wrapper = selectionOverlayRef.current;
			const live = cameraApplierRef.current?.get();
			if (!wrapper || !live) return;
			for (const node of wrapper.querySelectorAll("[data-ov-base]")) {
				const raw = node.dataset.ovBase;
				if (!raw) continue;
				const p = raw.split(",");
				const baseScale = +p[4];
				if (!baseScale) continue;
				const k = live.scale / baseScale;
				const tx = live.positionX - k * +p[5];
				const ty = live.positionY - k * +p[6];
				node.style.left = `${k * +p[0] + tx}px`;
				node.style.top = `${k * +p[1] + ty}px`;
				if (+p[2]) node.style.width = `${k * +p[2]}px`;
				if (+p[3]) node.style.height = `${k * +p[3]}px`;
			}
			const view = fullPass ? null : overlaySizeRef.current;
			for (const node_0 of wrapper.querySelectorAll("[data-root-label-span]")) syncNameCap(node_0, live.scale, view);
		};
		$[12] = t11;
	} else t11 = $[12];
	const syncOverlayToLiveTransform = t11;
	const overlaySizeRef = (0, import_react.useRef)(null);
	let t12;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = () => syncOverlayToLiveTransform(true);
		$[13] = t12;
	} else t12 = $[13];
	const onOverlayResize = (0, import_react.useEffectEvent)(t12);
	let t13;
	if ($[14] !== onOverlayResize) {
		t13 = () => {
			const wrapper_0 = selectionOverlayRef.current;
			if (!wrapper_0) return;
			const observer = new ResizeObserver((t14) => {
				const [entry] = t14;
				overlaySizeRef.current = {
					width: entry.contentRect.width,
					height: entry.contentRect.height
				};
				onOverlayResize();
			});
			observer.observe(wrapper_0);
			return () => observer.disconnect();
		};
		$[14] = onOverlayResize;
		$[15] = t13;
	} else t13 = $[15];
	let t14;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = [];
		$[16] = t14;
	} else t14 = $[16];
	(0, import_react.useEffect)(t13, t14);
	let t15;
	if ($[17] !== onSelectElement) {
		t15 = (id_0) => onSelectElement(id_0);
		$[17] = onSelectElement;
		$[18] = t15;
	} else t15 = $[18];
	let t16;
	if ($[19] !== editingTextId) {
		t16 = (drawnRect, parentId, scale) => {
			const store = usePages.getState().visibleTree;
			const siblingIds = parentId === null ? getRootIds(store) : getChildren$2(store, parentId);
			if (siblingIds.length === 0) return [];
			const editingOwnerId = editingTextId ? resolveTextOwner(store, editingTextId) : null;
			const candidates = [];
			const guard = {
				editingTextId,
				editingOwnerId
			};
			for (const id_1 of siblingIds) {
				const el = getById(store, id_1);
				if (!el || !canAdoptElement(el, guard)) continue;
				const rect = getElementRect$1(id_1);
				if (!rect) continue;
				const { marginLeft, marginTop } = getElementComputedMargins(id_1);
				candidates.push({
					id: id_1,
					rect: {
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height
					},
					marginLeft,
					marginTop
				});
			}
			return collectAdoptedChildren(drawnRect, candidates, scale);
		};
		$[19] = editingTextId;
		$[20] = t16;
	} else t16 = $[20];
	let t17;
	if ($[21] !== canvasRef || $[22] !== onAddElement || $[23] !== setActiveTool || $[24] !== t15 || $[25] !== t16 || $[26] !== viewportRef) {
		t17 = {
			canvasRef,
			viewportRef,
			onAddElement,
			setActiveTool,
			onSelectElement: t15,
			canHostChild: _temp5$29,
			collectAdoptions: t16
		};
		$[21] = canvasRef;
		$[22] = onAddElement;
		$[23] = setActiveTool;
		$[24] = t15;
		$[25] = t16;
		$[26] = viewportRef;
		$[27] = t17;
	} else t17 = $[27];
	const { drawMounted, drawOverlayRef, drawBadgeRef, drawGesture } = useCanvasDraw(t17);
	let t18;
	let t19;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = () => registerCameraDriver((next, durationMs) => {
			const applier = cameraApplierRef.current;
			if (applier) applier.animate(next, durationMs);
			else publishCamera(next);
		});
		t19 = [];
		$[28] = t18;
		$[29] = t19;
	} else {
		t18 = $[28];
		t19 = $[29];
	}
	(0, import_react.useEffect)(t18, t19);
	let t20;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = () => {
			if (isDraggingRef.current) {
				if (panTimeoutRef.current) {
					clearTimeout(panTimeoutRef.current);
					panTimeoutRef.current = null;
				}
				isPanningRef.current = false;
				return;
			}
			if (panTimeoutRef.current) clearTimeout(panTimeoutRef.current);
			panTimeoutRef.current = setTimeout(() => {
				isPanningRef.current = false;
				syncOverlayToLiveTransform(true);
				inputRef.current?.rehover();
			}, CAMERA_SETTLE_MS);
		};
		$[30] = t20;
	} else t20 = $[30];
	const scheduleCameraSettle = t20;
	let t21;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = () => {
			cameraApplierRef.current?.stop();
			if (panTimeoutRef.current) {
				clearTimeout(panTimeoutRef.current);
				panTimeoutRef.current = null;
			}
			if (!isCameraDriving()) notifyUserCameraGesture();
		};
		$[31] = t21;
	} else t21 = $[31];
	const grabCamera = (0, import_react.useEffectEvent)(t21);
	let t22;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = () => {
			scheduleCameraSettle();
			syncOverlayToLiveTransform(true);
			inputRef.current?.rehover();
		};
		$[32] = t22;
	} else t22 = $[32];
	const releaseCamera = (0, import_react.useEffectEvent)(t22);
	let t23;
	if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = () => {
			zoomGestureAtRef.current = performance.now();
		};
		$[33] = t23;
	} else t23 = $[33];
	const markWheelZoom = (0, import_react.useEffectEvent)(t23);
	let t24;
	if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = () => {
			if (!isPanningRef.current) return;
			isPanningRef.current = false;
			inputRef.current?.rehover();
		};
		$[34] = t24;
	} else t24 = $[34];
	const settleAtPress = (0, import_react.useEffectEvent)(t24);
	const updateCommentPinPositions = _temp6$23;
	let t25;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = (camera) => {
			isPanningRef.current = true;
			updateCommentPinPositions(camera.scale, camera.positionX, camera.positionY);
			syncOverlayToLiveTransform();
			scheduleCameraSettle();
		};
		$[35] = t25;
	} else t25 = $[35];
	const onLiveCamera = (0, import_react.useEffectEvent)(t25);
	let t26;
	if ($[36] !== onLiveCamera) {
		t26 = () => {
			const unsubscribe = subscribeCamera((camera_0) => {
				onLiveCamera(camera_0);
			});
			return () => {
				unsubscribe();
				if (panTimeoutRef.current) clearTimeout(panTimeoutRef.current);
			};
		};
		$[36] = onLiveCamera;
		$[37] = t26;
	} else t26 = $[37];
	let t27;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = [];
		$[38] = t27;
	} else t27 = $[38];
	(0, import_react.useEffect)(t26, t27);
	let t28;
	if ($[39] !== canvasRef.current || $[40] !== viewportRef.current) {
		t28 = () => {
			const viewport_0 = viewportRef.current;
			if (!viewport_0) return;
			const pinScroll = (e) => {
				const node_1 = e.target;
				const content = canvasRef.current;
				if (!content || !(node_1 instanceof HTMLElement) || !node_1.contains(content)) return;
				if (node_1.scrollLeft !== 0) node_1.scrollLeft = 0;
				if (node_1.scrollTop !== 0) node_1.scrollTop = 0;
			};
			viewport_0.addEventListener("scroll", pinScroll, {
				capture: true,
				passive: true
			});
			return () => viewport_0.removeEventListener("scroll", pinScroll, { capture: true });
		};
		$[39] = canvasRef.current;
		$[40] = viewportRef.current;
		$[41] = t28;
	} else t28 = $[41];
	let t29;
	if ($[42] !== canvasRef || $[43] !== viewportRef) {
		t29 = [viewportRef, canvasRef];
		$[42] = canvasRef;
		$[43] = viewportRef;
		$[44] = t29;
	} else t29 = $[44];
	(0, import_react.useEffect)(t28, t29);
	let t30;
	if ($[45] !== initialTransform?.positionX || $[46] !== initialTransform?.positionY || $[47] !== initialTransform?.scale) {
		t30 = () => {
			publishCamera({
				scale: initialTransform?.scale ?? 1,
				positionX: initialTransform?.positionX ?? 0,
				positionY: initialTransform?.positionY ?? 0
			});
		};
		$[45] = initialTransform?.positionX;
		$[46] = initialTransform?.positionY;
		$[47] = initialTransform?.scale;
		$[48] = t30;
	} else t30 = $[48];
	const publishInitialCamera = (0, import_react.useEffectEvent)(t30);
	let t31;
	if ($[49] !== publishInitialCamera) {
		t31 = () => {
			publishInitialCamera();
		};
		$[49] = publishInitialCamera;
		$[50] = t31;
	} else t31 = $[50];
	let t32;
	if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = [];
		$[51] = t32;
	} else t32 = $[51];
	(0, import_react.useLayoutEffect)(t31, t32);
	let t33;
	if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
		const getLiveCamera = () => cameraApplierRef.current?.get() ?? getCamera();
		t33 = (clientX, clientY, viewportRect) => {
			const { scale: scale_1, positionX: positionX_0, positionY: positionY_0 } = getLiveCamera();
			return {
				x: (clientX - viewportRect.left - positionX_0) / scale_1,
				y: (clientY - viewportRect.top - positionY_0) / scale_1
			};
		};
		$[52] = t33;
	} else t33 = $[52];
	const viewportPointToCanvas = t33;
	let t34;
	if ($[53] !== onSelectElements) {
		t34 = { onSelectElements };
		$[53] = onSelectElements;
		$[54] = t34;
	} else t34 = $[54];
	const { marqueeRef, marqueeOverlayRef, marqueeHoverContainerRef, marqueeMounted, marqueeGesture } = useCanvasMarquee(t34);
	let t35;
	if ($[55] !== marqueeRef) {
		t35 = (id_2) => {
			if (isPanningRef.current) return;
			if (marqueeRef.current?.active) return;
			if (getCanvasHandleGesture()) return;
			if (isDraggingRef.current) return;
			if (id_2) useHover.getState().setHovered(id_2, "canvas");
			else useHover.getState().clearHover();
		};
		$[55] = marqueeRef;
		$[56] = t35;
	} else t35 = $[56];
	const throttledHoverElement = t35;
	let t36;
	if ($[57] !== resizing) {
		t36 = [resizing];
		$[57] = resizing;
		$[58] = t36;
	} else t36 = $[58];
	(0, import_react.useEffect)(_temp7$18, t36);
	let t37;
	if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
		t37 = [];
		$[59] = t37;
	} else t37 = $[59];
	(0, import_react.useEffect)(_temp9$12, t37);
	let t38;
	if ($[60] === Symbol.for("react.memo_cache_sentinel")) {
		t38 = [];
		$[60] = t38;
	} else t38 = $[60];
	(0, import_react.useEffect)(_temp0$11, t38);
	let t39;
	if ($[61] !== selectElement) {
		t39 = (id_3) => selectElement(id_3, false);
		$[61] = selectElement;
		$[62] = t39;
	} else t39 = $[62];
	let t40;
	if ($[63] !== onStartAltDrag || $[64] !== pageId || $[65] !== selectedElementIds || $[66] !== t39) {
		t40 = {
			pageId,
			onSelectElement: t39,
			planElementMove: _temp1$11,
			selectedElementIds,
			onStartAltDrag,
			zoomGestureAtRef
		};
		$[63] = onStartAltDrag;
		$[64] = pageId;
		$[65] = selectedElementIds;
		$[66] = t39;
		$[67] = t40;
	} else t40 = $[67];
	const { activeId, activeElement, activeElements, draggedIds, isDragging, movesInPlace, previewGuidesRef, previewParentRef, previewCopyRef, dragStartAnchor, dragStartRects, beginDrag, moveDrag, dragModifiers, dragCamera, dropDrag, cancelDrag } = useDndCanvas(t40);
	let t41;
	if ($[68] !== isDragging) {
		t41 = () => {
			isDraggingRef.current = isDragging;
		};
		$[68] = isDragging;
		$[69] = t41;
	} else t41 = $[69];
	(0, import_react.useLayoutEffect)(t41);
	const [insertDropParentId, setInsertDropParentId] = (0, import_react.useState)(null);
	const [overlayContainer, setOverlayContainer] = (0, import_react.useState)(null);
	const lastInsertProbeRef = (0, import_react.useRef)(null);
	const resolveInsertDropParent = _temp10$11;
	let t42;
	if ($[70] === Symbol.for("react.memo_cache_sentinel")) {
		t42 = (clientX_1, clientY_1, child_1) => {
			const x = Math.round(clientX_1);
			const y = Math.round(clientY_1);
			const last = lastInsertProbeRef.current;
			if (last && last.x === x && last.y === y) return;
			const id_4 = resolveInsertDropParent(clientX_1, clientY_1, child_1);
			lastInsertProbeRef.current = {
				x,
				y,
				id: id_4
			};
			setInsertDropParentId((prev) => prev === id_4 ? prev : id_4);
		};
		$[70] = t42;
	} else t42 = $[70];
	const probeInsertDropParent = t42;
	let t43;
	if ($[71] === Symbol.for("react.memo_cache_sentinel")) {
		t43 = () => {
			lastInsertProbeRef.current = null;
			setInsertDropParentId(_temp11$9);
		};
		$[71] = t43;
	} else t43 = $[71];
	const clearInsertDropParent = t43;
	let t44;
	let t45;
	if ($[72] !== insertDropParentId) {
		t44 = () => {
			if (!insertDropParentId) return;
			const onDragEnd = () => clearInsertDropParent();
			window.addEventListener("dragend", onDragEnd);
			return () => window.removeEventListener("dragend", onDragEnd);
		};
		t45 = [insertDropParentId];
		$[72] = insertDropParentId;
		$[73] = t44;
		$[74] = t45;
	} else {
		t44 = $[73];
		t45 = $[74];
	}
	(0, import_react.useEffect)(t44, t45);
	let t46;
	if ($[75] !== viewportRef.current) {
		t46 = (id_5) => {
			const store_1 = usePages.getState().tree;
			const parentKey = getParentId(store_1, id_5);
			const parentId_0 = parentKey === "ROOT" || parentKey === null ? null : parentKey;
			const siblingIds_0 = (parentId_0 === null ? getRootIds(store_1) : getChildren$2(store_1, parentId_0)).filter((s_0) => s_0 !== id_5);
			const targets = [];
			for (const sid of siblingIds_0) {
				const r = getElementRect$1(sid);
				if (r) targets.push({
					left: r.left,
					top: r.top,
					width: r.width,
					height: r.height
				});
			}
			const box = parentId_0 ? getElementPaddingBox(parentId_0, getCamera().scale) ?? void 0 : void 0;
			const viewport_1 = viewportRef.current?.getBoundingClientRect();
			return collectSnapLines(viewport_1 ? visibleSnapRects(targets, viewport_1) : targets, box, viewport_1);
		};
		$[75] = viewportRef.current;
		$[76] = t46;
	} else t46 = $[76];
	const getResizeSnapTargets = t46;
	const t47 = activeTool === "scale";
	let t48;
	if ($[77] !== setActiveTool) {
		t48 = () => setActiveTool("move");
		$[77] = setActiveTool;
		$[78] = t48;
	} else t48 = $[78];
	let t49;
	if ($[79] !== getResizeSnapTargets || $[80] !== onResizeElement || $[81] !== scaleAspectLocked || $[82] !== selectedElementIds || $[83] !== t47 || $[84] !== t48) {
		t49 = {
			setResizing,
			onResizeElement,
			scaleMode: t47,
			scaleAspectLocked,
			onCancelScale: t48,
			onScaleElements: _temp12$7,
			getSnapTargets: getResizeSnapTargets,
			selectedElementIds
		};
		$[79] = getResizeSnapTargets;
		$[80] = onResizeElement;
		$[81] = scaleAspectLocked;
		$[82] = selectedElementIds;
		$[83] = t47;
		$[84] = t48;
		$[85] = t49;
	} else t49 = $[85];
	const { resizeFromHandle, resizeSnapGuides, resizePreviewRectRef } = useResizing(t49);
	const resizingId = resizing?.id ?? null;
	let t50;
	if ($[86] !== draggedIds || $[87] !== isDragging || $[88] !== resizingId) {
		t50 = isDragging ? draggedIds : new Set(resizingId ? [resizingId] : []);
		$[86] = draggedIds;
		$[87] = isDragging;
		$[88] = resizingId;
		$[89] = t50;
	} else t50 = $[89];
	const movingRootIds = t50;
	let t51;
	if ($[90] !== agentPresence || $[91] !== selectedElementIds) {
		t51 = (s_1) => overlayTrackedIdsKey(s_1.visibleTree, selectedElementIds, agentPresence);
		$[90] = agentPresence;
		$[91] = selectedElementIds;
		$[92] = t51;
	} else t51 = $[92];
	const trackedIdsKey = usePages(t51);
	const t52 = !!resizing;
	let t53;
	if ($[93] !== canvasRef || $[94] !== componentsRevision || $[95] !== isDragging || $[96] !== selectedElementIds || $[97] !== t52 || $[98] !== trackedIdsKey) {
		t53 = {
			canvasRef,
			selectedElementIds,
			trackedIdsKey,
			componentsRevision,
			isDragging,
			isResizing: t52
		};
		$[93] = canvasRef;
		$[94] = componentsRevision;
		$[95] = isDragging;
		$[96] = selectedElementIds;
		$[97] = t52;
		$[98] = trackedIdsKey;
		$[99] = t53;
	} else t53 = $[99];
	const { geoms } = useOverlayGeoms(t53);
	let t54;
	if ($[100] === Symbol.for("react.memo_cache_sentinel")) {
		t54 = [];
		$[100] = t54;
	} else t54 = $[100];
	const handleBoxesRef = (0, import_react.useRef)(t54);
	const handleCursorRef = (0, import_react.useRef)(null);
	const handleRunRef = (0, import_react.useRef)(null);
	const handleCursorOf = (0, import_react.useEffectEvent)(_temp13$7);
	let t55;
	if ($[101] !== geoms || $[102] !== onUpdateElementStyles || $[103] !== resizeFromHandle) {
		t55 = (gesture, target_1, at, setCursor) => {
			const id_7 = target_1.id;
			const name_0 = target_1.handle;
			if (!id_7 || !name_0) return false;
			const tree_1 = getVisibleTree();
			if (gesture === "rotate") {
				const session = beginRotate({
					store: tree_1,
					elementId: id_7,
					corner: name_0,
					geoms,
					overlayMode: true,
					pointer: {
						clientX: at.screen.x,
						clientY: at.screen.y,
						shiftKey: at.shift
					},
					setCursor,
					onCommit: onUpdateElementStyles
				});
				handleRunRef.current = session && {
					kind: "rotate",
					session
				};
				return !!session;
			}
			if (!resizeFromHandle.begin(id_7, name_0, {
				clientX: at.screen.x,
				clientY: at.screen.y,
				shift: at.shift,
				alt: at.alt,
				cmd: at.cmd
			})) return false;
			handleRunRef.current = {
				kind: "resize",
				gesture
			};
			return true;
		};
		$[101] = geoms;
		$[102] = onUpdateElementStyles;
		$[103] = resizeFromHandle;
		$[104] = t55;
	} else t55 = $[104];
	const beginHandleGesture = (0, import_react.useEffectEvent)(t55);
	let t56;
	if ($[105] !== resizeFromHandle) {
		t56 = (at_0) => {
			const run = handleRunRef.current;
			if (run?.kind === "rotate") run.session.move({
				clientX: at_0.screen.x,
				clientY: at_0.screen.y,
				shiftKey: at_0.shift
			});
			else if (run) resizeFromHandle.move({
				clientX: at_0.screen.x,
				clientY: at_0.screen.y,
				shift: at_0.shift,
				alt: at_0.alt,
				cmd: at_0.cmd
			});
		};
		$[105] = resizeFromHandle;
		$[106] = t56;
	} else t56 = $[106];
	const moveHandleGesture = (0, import_react.useEffectEvent)(t56);
	let t57;
	if ($[107] !== resizeFromHandle) {
		t57 = (at_1) => {
			if (handleRunRef.current?.kind !== "resize") return;
			resizeFromHandle.modifiers({
				clientX: at_1.screen.x,
				clientY: at_1.screen.y,
				shift: at_1.shift,
				alt: at_1.alt,
				cmd: at_1.cmd
			});
		};
		$[107] = resizeFromHandle;
		$[108] = t57;
	} else t57 = $[108];
	const handleGestureModifiers = (0, import_react.useEffectEvent)(t57);
	let t58;
	if ($[109] !== resizeFromHandle || $[110] !== setActiveTool) {
		t58 = (end) => {
			const run_0 = handleRunRef.current;
			handleRunRef.current = null;
			if (!run_0) return;
			if (run_0.kind === "rotate") {
				run_0.session.end(end === "commit");
				return;
			}
			resizeFromHandle.end(end === "commit");
			if (end === "escape" && run_0.gesture === "scale") setActiveTool("move");
		};
		$[109] = resizeFromHandle;
		$[110] = setActiveTool;
		$[111] = t58;
	} else t58 = $[111];
	const endHandleGesture = (0, import_react.useEffectEvent)(t58);
	const gestureRunRef = (0, import_react.useRef)(null);
	const zoomRegionPreviewRef = (0, import_react.useRef)(null);
	const [regionMaskArmed, setRegionMaskArmed] = (0, import_react.useState)(false);
	const regionMaskDragRef = (0, import_react.useRef)(null);
	let t59;
	if ($[112] !== canvasRef.current) {
		t59 = (target_2, pressed, cmd) => {
			const canvasEl = canvasRef.current;
			if (!canvasEl || innerPickTookPress()) return null;
			if (target_2.kind === "label") {
				const node_2 = target_2.id ? document.querySelector(`[data-element-id="${CSS.escape(target_2.id)}"]`) : null;
				if (!node_2) return null;
				return resolveDragSource(node_2, canvasEl, getInteractiveParentIds())?.id ?? (node_2.querySelector("[data-drag-grip]") ? target_2.id : null);
			}
			if (!(pressed instanceof HTMLElement) || pressed.tagName === "INPUT" || pressed.tagName === "TEXTAREA" || pressed.isContentEditable) return null;
			const grip = pressed.closest("[data-drag-grip]");
			if (grip) return cmd && grip.hasAttribute("data-live-preview-overlay") ? null : grip.closest("[data-element-id]")?.getAttribute("data-element-id") ?? null;
			return resolveDragSource(pressed, canvasEl, getInteractiveParentIds())?.id ?? null;
		};
		$[112] = canvasRef.current;
		$[113] = t59;
	} else t59 = $[113];
	const elementDragSource = t59;
	let t60;
	if ($[114] !== activeTool || $[115] !== beginDrag || $[116] !== cancelDrag || $[117] !== canvasRef.current || $[118] !== dragCamera || $[119] !== dragModifiers || $[120] !== drawGesture || $[121] !== dropDrag || $[122] !== elementDragSource || $[123] !== marqueeGesture || $[124] !== moveDrag || $[125] !== onResizeElement || $[126] !== readOnly || $[127] !== selectedElementIds || $[128] !== viewportRef.current) {
		t60 = (...t61) => {
			const [gesture_0, target_3, start, at_2, pressed_0] = t61;
			switch (gesture_0) {
				case "frameResize": {
					const edge = pressed_0?.closest("[data-webview-handle]")?.getAttribute("data-webview-handle");
					const element_0 = target_3.id ? getById(usePages.getState().tree, target_3.id) : null;
					if (readOnly || !isFrameEdge(edge) || element_0?.type !== "webview") return null;
					const webview = element_0;
					const resize = beginFrameResize({
						id: webview.id,
						edge,
						start: previewFrameSize(webview),
						min: PREVIEW_MIN_FRAME_SIZE,
						from: start,
						commit: (size) => onResizeElement(webview.id, size)
					});
					if (!resize) return null;
					return {
						cursor: edge === "e" ? "ew-resize" : edge === "s" ? "ns-resize" : "nwse-resize",
						run: {
							move: (next_9) => resize.move(next_9.screen),
							modifiers() {},
							camera() {},
							end: (end_5, last_4) => {
								if (end_5 === "commit") resize.move(last_4.screen);
								resize.end(end_5 === "commit");
							}
						}
					};
				}
				case "elementDrag": {
					const pressedId = elementDragSource(target_3, pressed_0, at_2.cmd);
					if (!pressedId) return null;
					(0, import_react_dom.flushSync)(() => beginDrag({
						pressedId,
						pointer: start,
						alt: at_2.alt,
						cmd: at_2.cmd
					}));
					useHover.getState().clearHover();
					moveDrag(at_2);
					return {
						cursor: "default",
						run: {
							move: (next_7) => moveDrag(next_7),
							modifiers: (next_8) => dragModifiers(next_8),
							camera: () => dragCamera(),
							end: (end_4, last_3) => end_4 === "commit" ? dropDrag(last_3) : cancelDrag()
						}
					};
				}
				case "draw":
					if (!drawGesture.begin(activeTool, start, at_2.shift)) return null;
					return {
						cursor: "crosshair",
						run: {
							move: (next_5) => drawGesture.move(next_5.screen, next_5.shift),
							modifiers: (next_6) => drawGesture.modifiers(next_6.shift),
							camera() {},
							end: (end_3, last_2) => drawGesture.end(end_3, last_2.screen)
						}
					};
				case "marquee": {
					const viewport_3 = viewportRef.current;
					if (!viewport_3) return null;
					const pointer = _temp14$7;
					marqueeGesture.begin(start, {
						canvasEl: canvasRef.current,
						viewportRect: viewport_3.getBoundingClientRect(),
						selectedElementIds
					}, pointer(at_2));
					return {
						cursor: "default",
						run: {
							move: (next_4) => marqueeGesture.move(pointer(next_4)),
							modifiers() {},
							camera: () => marqueeGesture.camera(),
							end: (end_2) => marqueeGesture.end(end_2 === "commit")
						}
					};
				}
				case "regionMask": {
					const drag_0 = regionMaskDragRef.current;
					if (!drag_0?.begin(start)) return null;
					drag_0.move(at_2.screen);
					return {
						cursor: "none",
						run: {
							move: (next_2) => drag_0.move(next_2.screen),
							modifiers() {},
							camera() {},
							end: (end_1, last_1) => drag_0.end(end_1 === "commit", last_1.screen)
						}
					};
				}
				case "zoomRegion": {
					const viewport_2 = viewportRef.current;
					const box_0 = zoomRegionPreviewRef.current;
					if (!viewport_2 || !box_0) return null;
					const origin = viewport_2.getBoundingClientRect();
					const place = (next_1) => {
						const { x: x_0, y: y_0 } = next_1.screen;
						if (!pastDragThreshold(x_0 - start.x, y_0 - start.y)) {
							box_0.style.display = "none";
							return;
						}
						box_0.style.display = "block";
						box_0.style.left = `${Math.min(start.x, x_0) - origin.left}px`;
						box_0.style.top = `${Math.min(start.y, y_0) - origin.top}px`;
						box_0.style.width = `${Math.abs(x_0 - start.x)}px`;
						box_0.style.height = `${Math.abs(y_0 - start.y)}px`;
					};
					place(at_2);
					return {
						cursor: "zoom-in",
						run: {
							move: place,
							modifiers() {},
							camera() {},
							end: () => {
								box_0.style.display = "none";
							}
						}
					};
				}
				case "pin": {
					const drag = target_3.id ? beginPinDrag(target_3.id, start) : null;
					if (!drag) return null;
					drag.move(at_2.screen);
					return {
						cursor: "grabbing",
						run: {
							move: (next_0) => drag.move(next_0.screen),
							modifiers() {},
							camera() {},
							end: (end_0, last_0) => drag.end(end_0 === "commit", last_0.screen)
						}
					};
				}
				default: return null;
			}
		};
		$[114] = activeTool;
		$[115] = beginDrag;
		$[116] = cancelDrag;
		$[117] = canvasRef.current;
		$[118] = dragCamera;
		$[119] = dragModifiers;
		$[120] = drawGesture;
		$[121] = dropDrag;
		$[122] = elementDragSource;
		$[123] = marqueeGesture;
		$[124] = moveDrag;
		$[125] = onResizeElement;
		$[126] = readOnly;
		$[127] = selectedElementIds;
		$[128] = viewportRef.current;
		$[129] = t60;
	} else t60 = $[129];
	const startPointerGesture = t60;
	let t61;
	if ($[130] !== startPointerGesture) {
		t61 = (...t62) => {
			const begun = startPointerGesture(...t62);
			gestureRunRef.current = begun?.run ?? null;
			return begun?.cursor ?? null;
		};
		$[130] = startPointerGesture;
		$[131] = t61;
	} else t61 = $[131];
	const beginPointerGesture = (0, import_react.useEffectEvent)(t61);
	let t62;
	if ($[132] === Symbol.for("react.memo_cache_sentinel")) {
		t62 = (at_3) => gestureRunRef.current?.move(at_3);
		$[132] = t62;
	} else t62 = $[132];
	const movePointerGesture = (0, import_react.useEffectEvent)(t62);
	let t63;
	if ($[133] === Symbol.for("react.memo_cache_sentinel")) {
		t63 = (at_4) => gestureRunRef.current?.modifiers(at_4);
		$[133] = t63;
	} else t63 = $[133];
	const pointerGestureModifiers = (0, import_react.useEffectEvent)(t63);
	let t64;
	if ($[134] === Symbol.for("react.memo_cache_sentinel")) {
		t64 = () => gestureRunRef.current?.camera();
		$[134] = t64;
	} else t64 = $[134];
	const pointerGestureCamera = (0, import_react.useEffectEvent)(t64);
	let t65;
	if ($[135] === Symbol.for("react.memo_cache_sentinel")) {
		t65 = (end_6, at_5) => {
			const run_1 = gestureRunRef.current;
			gestureRunRef.current = null;
			run_1?.end(end_6, at_5);
		};
		$[135] = t65;
	} else t65 = $[135];
	const endPointerGesture = (0, import_react.useEffectEvent)(t65);
	let t66;
	if ($[136] === Symbol.for("react.memo_cache_sentinel")) {
		t66 = () => ({
			tree: getVisibleTree(),
			mode: selectionModeRef.current,
			interactiveParentIds: getInteractiveParentIds(),
			drilledParentId: useSelection.getState().drilledParentId
		});
		$[136] = t66;
	} else t66 = $[136];
	const selectTargetContext = t66;
	let t67;
	if ($[137] !== activeTool || $[138] !== commentMode || $[139] !== isDragging || $[140] !== panMode || $[141] !== readOnly || $[142] !== resizing || $[143] !== throttledHoverElement || $[144] !== viewportRef.current) {
		t67 = (node_3) => {
			if (commentMode) {
				const viewport_4 = viewportRef.current;
				const target_4 = node_3 && viewport_4 && !panMode ? findCommentTarget(node_3, viewport_4, usePages.getState().visibleTree, selectionModeRef.current === "deepest") : null;
				throttledHoverElement(target_4?.getAttribute("data-element-id") ?? null);
				return;
			}
			const target_5 = hoverTarget(node_3, selectTargetContext());
			if (target_5.kind === "within" && useHover.getState().hoveredId === target_5.id) return;
			const labelsInteract = !(panMode || readOnly || isDragging || !!resizing || isInsertTool(activeTool));
			throttledHoverElement(target_5.kind === "element" || target_5.kind === "label" && labelsInteract ? target_5.id : null);
		};
		$[137] = activeTool;
		$[138] = commentMode;
		$[139] = isDragging;
		$[140] = panMode;
		$[141] = readOnly;
		$[142] = resizing;
		$[143] = throttledHoverElement;
		$[144] = viewportRef.current;
		$[145] = t67;
	} else t67 = $[145];
	const hoverFromInput = (0, import_react.useEffectEvent)(t67);
	let t68;
	if ($[146] !== selectElement) {
		t68 = (node_4, release) => {
			const target_6 = clickTarget(node_4, selectTargetContext());
			if (target_6.kind === "background") selectElement(null);
			else if (target_6.kind === "element") selectElement(target_6.id, release.shift, {
				x: release.screen.x,
				y: release.screen.y,
				detail: release.count(),
				path: target_6.path
			}, release.alt);
			else if (target_6.kind === "zone") selectElement(target_6.id, target_6.shift && release.shift, void 0, release.alt);
		};
		$[146] = selectElement;
		$[147] = t68;
	} else t68 = $[147];
	const clickFromInput = (0, import_react.useEffectEvent)(t68);
	let t69;
	if ($[148] !== selectElement) {
		t69 = (id_8, shift) => {
			if (!useSelection.getState().selectedElementIds.has(id_8)) selectElement(id_8, shift);
		};
		$[148] = selectElement;
		$[149] = t69;
	} else t69 = $[149];
	const labelFromInput = (0, import_react.useEffectEvent)(t69);
	let t70;
	if ($[150] === Symbol.for("react.memo_cache_sentinel")) {
		t70 = (on) => {
			selectionModeRef.current = on ? "deepest" : "topmost";
			inputRef.current?.rehover();
		};
		$[150] = t70;
	} else t70 = $[150];
	const deepFromInput = (0, import_react.useEffectEvent)(t70);
	let t71;
	if ($[151] !== activeTool || $[152] !== setActiveTool) {
		t71 = (tool) => {
			if (tool === "escapeToMove") setActiveTool("move");
			else if (tool === "toggleStack") setActiveTool(activeTool === "stack-h" ? "stack-v" : "stack-h");
			else setActiveTool(tool);
		};
		$[151] = activeTool;
		$[152] = setActiveTool;
		$[153] = t71;
	} else t71 = $[153];
	const toolFromInput = (0, import_react.useEffectEvent)(t71);
	let t72;
	if ($[154] !== onCommentClick || $[155] !== viewportRef.current) {
		t72 = (node_5, release_0) => {
			const viewport_5 = viewportRef.current;
			if (!onCommentClick || !viewport_5) return;
			const rect_0 = viewport_5.getBoundingClientRect();
			const { x: clientX_2, y: clientY_2 } = release_0.screen;
			const { x: x_1, y: y_1 } = viewportPointToCanvas(clientX_2, clientY_2, rect_0);
			const element_1 = node_5 ? findCommentTarget(node_5, viewport_5, usePages.getState().visibleTree, selectionModeRef.current === "deepest") : null;
			const anchor = element_1 ? commentAnchorAt(element_1, clientX_2, clientY_2) : void 0;
			onCommentClick(Math.round(x_1), Math.round(y_1), clientX_2 - rect_0.left, clientY_2 - rect_0.top, anchor);
		};
		$[154] = onCommentClick;
		$[155] = viewportRef.current;
		$[156] = t72;
	} else t72 = $[156];
	const commentFromInput = (0, import_react.useEffectEvent)(t72);
	const [editingTextBounds, setEditingTextBounds] = (0, import_react.useState)(null);
	const editingId = readOnly ? null : editingTextId ?? null;
	let t73;
	let t74;
	if ($[157] !== editingId || $[158] !== editingTextBounds) {
		t73 = () => {
			setTextEditSession(editingId ? {
				id: editingId,
				bounds: editingTextBounds
			} : null);
		};
		t74 = [editingId, editingTextBounds];
		$[157] = editingId;
		$[158] = editingTextBounds;
		$[159] = t73;
		$[160] = t74;
	} else {
		t73 = $[159];
		t74 = $[160];
	}
	(0, import_react.useLayoutEffect)(t73, t74);
	let t75;
	if ($[161] === Symbol.for("react.memo_cache_sentinel")) {
		t75 = [];
		$[161] = t75;
	} else t75 = $[161];
	(0, import_react.useLayoutEffect)(_temp16$5, t75);
	let t76;
	if ($[162] !== onStopEditTextProp) {
		t76 = () => {
			setEditingTextBounds(null);
			onStopEditTextProp?.();
		};
		$[162] = onStopEditTextProp;
		$[163] = t76;
	} else t76 = $[163];
	const stopEditText = t76;
	let t77;
	if ($[164] !== canvasRef.current || $[165] !== onStartEditTextProp || $[166] !== selectElement) {
		t77 = (node_6) => {
			const leaf = node_6.closest("[data-text-element][data-element-id]");
			if (!leaf || !canvasRef.current?.contains(leaf)) return;
			const id_9 = leaf.getAttribute("data-element-id");
			const ownerId = resolveTextOwner(getVisibleTree(), id_9);
			if (!useSelection.getState().selectedElementIds.has(ownerId)) return;
			setEditingTextBounds({
				width: 0,
				height: leaf.getBoundingClientRect().height
			});
			onStartEditTextProp?.(id_9);
			selectElement(ownerId);
		};
		$[164] = canvasRef.current;
		$[165] = onStartEditTextProp;
		$[166] = selectElement;
		$[167] = t77;
	} else t77 = $[167];
	const doubleClickFromInput = (0, import_react.useEffectEvent)(t77);
	const contextMenuFromInput = (0, import_react.useEffectEvent)(_temp17$4);
	let t78;
	if ($[168] !== beginHandleGesture || $[169] !== beginPointerGesture || $[170] !== clickFromInput || $[171] !== commentFromInput || $[172] !== contextMenuFromInput || $[173] !== currentInputMode || $[174] !== deepFromInput || $[175] !== doubleClickFromInput || $[176] !== endHandleGesture || $[177] !== endPointerGesture || $[178] !== grabCamera || $[179] !== handleCursorOf || $[180] !== handleGestureModifiers || $[181] !== hoverFromInput || $[182] !== labelFromInput || $[183] !== markWheelZoom || $[184] !== moveHandleGesture || $[185] !== movePointerGesture || $[186] !== pointerGestureCamera || $[187] !== pointerGestureModifiers || $[188] !== releaseCamera || $[189] !== settleAtPress || $[190] !== toolFromInput || $[191] !== viewportRef.current) {
		t78 = () => {
			const viewport_6 = viewportRef.current;
			const camera_1 = cameraApplierRef.current;
			if (!viewport_6 || !camera_1) return;
			let nudge = null;
			const input = attachCanvasInput({
				win: window,
				viewport: viewport_6,
				mode: currentInputMode(),
				camera: camera_1,
				host: {
					grab: grabCamera,
					release: releaseCamera,
					markWheelZoom,
					settle: settleAtPress
				},
				handles: {
					boxes: () => handleBoxesRef.current,
					cursor: handleCursorOf,
					begin: beginHandleGesture,
					move: moveHandleGesture,
					modifiers: handleGestureModifiers,
					end: endHandleGesture
				},
				gestures: {
					begin: beginPointerGesture,
					move: movePointerGesture,
					modifiers: pointerGestureModifiers,
					camera: pointerGestureCamera,
					end: endPointerGesture,
					regionMask: (armed) => setRegionMaskArmed(armed)
				},
				select: {
					hover: hoverFromInput,
					click: clickFromInput,
					contextMenu: contextMenuFromInput,
					label: labelFromInput,
					deep: deepFromInput,
					doubleClick: doubleClickFromInput,
					comment: commentFromInput
				},
				nudge: {
					begin() {
						nudge = beginNudge(getSelectedElementIds());
						return nudge !== null;
					},
					move: (dx, dy) => nudge?.move(dx, dy),
					end(commit) {
						nudge?.end(commit);
						nudge = null;
					},
					selectedOther() {
						const moving = nudge?.ids;
						if (!moving) return false;
						for (const id_10 of getSelectedElementIds()) if (!moving.has(id_10)) return true;
						return false;
					},
					spent: nudgeSpent,
					setSpent: setNudgeSpent
				},
				tools: { pick: toolFromInput },
				handleCursor: handleCursorRef.current
			});
			inputRef.current = input;
			return () => {
				input.detach();
				inputRef.current = null;
			};
		};
		$[168] = beginHandleGesture;
		$[169] = beginPointerGesture;
		$[170] = clickFromInput;
		$[171] = commentFromInput;
		$[172] = contextMenuFromInput;
		$[173] = currentInputMode;
		$[174] = deepFromInput;
		$[175] = doubleClickFromInput;
		$[176] = endHandleGesture;
		$[177] = endPointerGesture;
		$[178] = grabCamera;
		$[179] = handleCursorOf;
		$[180] = handleGestureModifiers;
		$[181] = hoverFromInput;
		$[182] = labelFromInput;
		$[183] = markWheelZoom;
		$[184] = moveHandleGesture;
		$[185] = movePointerGesture;
		$[186] = pointerGestureCamera;
		$[187] = pointerGestureModifiers;
		$[188] = releaseCamera;
		$[189] = settleAtPress;
		$[190] = toolFromInput;
		$[191] = viewportRef.current;
		$[192] = t78;
	} else t78 = $[192];
	let t79;
	if ($[193] !== viewportRef) {
		t79 = [viewportRef];
		$[193] = viewportRef;
		$[194] = t79;
	} else t79 = $[194];
	(0, import_react.useLayoutEffect)(t78, t79);
	let t80;
	if ($[195] !== currentInputMode) {
		t80 = () => {
			inputRef.current?.setMode(currentInputMode());
		};
		$[195] = currentInputMode;
		$[196] = t80;
	} else t80 = $[196];
	let t81;
	if ($[197] !== activeTool || $[198] !== commentMode || $[199] !== inputEditingText || $[200] !== inputRegionMask || $[201] !== readOnly) {
		t81 = [
			activeTool,
			commentMode,
			readOnly,
			inputRegionMask,
			inputEditingText
		];
		$[197] = activeTool;
		$[198] = commentMode;
		$[199] = inputEditingText;
		$[200] = inputRegionMask;
		$[201] = readOnly;
		$[202] = t81;
	} else t81 = $[202];
	(0, import_react.useLayoutEffect)(t80, t81);
	let t82;
	if ($[203] !== activeTool || $[204] !== commentMode || $[205] !== isDragging || $[206] !== panMode || $[207] !== readOnly) {
		t82 = !isDragging && !commentMode && !isInsertTool(activeTool) && !panMode && !readOnly;
		$[203] = activeTool;
		$[204] = commentMode;
		$[205] = isDragging;
		$[206] = panMode;
		$[207] = readOnly;
		$[208] = t82;
	} else t82 = $[208];
	const handlesLive = t82;
	let t83;
	let t84;
	if ($[209] !== geoms || $[210] !== handlesLive || $[211] !== selectedElementIds) {
		t83 = () => {
			const boxes = [];
			if (handlesLive) {
				const tree_2 = getVisibleTree();
				for (const id_11 of selectedElementIds) {
					const geom = geoms.get(id_11);
					if (geom && getById(tree_2, id_11)) boxes.push({
						id: id_11,
						...geom
					});
				}
			}
			handleBoxesRef.current = boxes;
			inputRef.current?.handlesChanged();
		};
		t84 = [
			handlesLive,
			selectedElementIds,
			geoms
		];
		$[209] = geoms;
		$[210] = handlesLive;
		$[211] = selectedElementIds;
		$[212] = t83;
		$[213] = t84;
	} else {
		t83 = $[212];
		t84 = $[213];
	}
	(0, import_react.useLayoutEffect)(t83, t84);
	let t85;
	if ($[214] !== isDragging || $[215] !== viewportRef.current) {
		t85 = () => {
			if (!isDragging) return;
			const viewport_7 = viewportRef.current;
			if (!viewport_7) return;
			return startEdgePanLoop({
				getPointer: () => inputRef.current?.pointer() ?? null,
				viewport: viewport_7,
				pan: (dx_0, dy_0) => {
					const applier_0 = cameraApplierRef.current;
					if (!applier_0) return;
					const state = applier_0.get();
					applier_0.set({
						scale: state.scale,
						positionX: state.positionX + dx_0,
						positionY: state.positionY + dy_0
					});
				}
			});
		};
		$[214] = isDragging;
		$[215] = viewportRef.current;
		$[216] = t85;
	} else t85 = $[216];
	let t86;
	if ($[217] !== isDragging || $[218] !== viewportRef) {
		t86 = [isDragging, viewportRef];
		$[217] = isDragging;
		$[218] = viewportRef;
		$[219] = t86;
	} else t86 = $[219];
	(0, import_react.useEffect)(t85, t86);
	let t87;
	if ($[220] !== activeElements || $[221] !== activeId || $[222] !== dragStartAnchor?.frame.scale || $[223] !== dragStartRects) {
		t87 = () => {
			const startScale = dragStartAnchor?.frame.scale ?? getCamera().scale;
			const activeStartRect = activeId ? dragStartRects.get(activeId) : void 0;
			const previewOutline = _temp18$4;
			const previewCopy = (el_1, rect_1) => el_1.type === "webview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebviewDragStandIn, { element: el_1 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragPreviewClone, {
				elementId: el_1.id,
				rect: rect_1,
				startScale,
				sized: el_1.type !== "capture"
			});
			const previewLabel = (el_2) => {
				const rect_2 = dragStartRects.get(el_2.id);
				if (!rect_2 || getParentId(usePages.getState().visibleTree, el_2.id) !== "ROOT") return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragPreviewLabel, {
					element: el_2,
					width: rect_2.width / startScale,
					zoom: null
				});
			};
			const commentDragBounds = (id_12) => {
				const rect_3 = dragStartRects.get(id_12);
				if (!rect_3) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-comment-drag-root": id_12,
					"aria-hidden": true,
					style: {
						position: "absolute",
						left: 0,
						top: 0,
						width: rect_3.width / startScale,
						height: rect_3.height / startScale,
						pointerEvents: "none"
					}
				});
			};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "petal-canvas",
				"data-drag-overlay": "",
				"data-ph-block": true,
				style: {
					transformOrigin: "top left",
					pointerEvents: "none"
				},
				children: activeElements.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						position: "relative",
						...dragPreviewBoxSize(activeStartRect, startScale)
					},
					children: [
						previewCopy(activeElements[0], activeStartRect),
						previewOutline(activeElements[0]),
						previewLabel(activeElements[0]),
						commentDragBounds(activeElements[0].id)
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { position: "relative" },
					children: activeElements.map((el_3) => {
						const thisRect = dragStartRects.get(el_3.id);
						const isActive = el_3.id === activeId;
						const offsetX = activeStartRect && thisRect ? (thisRect.left - activeStartRect.left) / startScale : 0;
						const offsetY = activeStartRect && thisRect ? (thisRect.top - activeStartRect.top) / startScale : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								position: isActive ? "relative" : "absolute",
								left: isActive ? 0 : offsetX,
								top: isActive ? 0 : offsetY,
								...dragPreviewBoxSize(thisRect, startScale)
							},
							children: [
								previewCopy(el_3, thisRect),
								previewOutline(el_3),
								previewLabel(el_3),
								commentDragBounds(el_3.id)
							]
						}, el_3.id);
					})
				})
			});
		};
		$[220] = activeElements;
		$[221] = activeId;
		$[222] = dragStartAnchor?.frame.scale;
		$[223] = dragStartRects;
		$[224] = t87;
	} else t87 = $[224];
	const renderDragPreview = t87;
	let t88;
	if ($[225] !== insertDropParentId || $[226] !== overlayContainer) {
		t88 = {
			overlayContainer,
			potentialParentId: insertDropParentId
		};
		$[225] = insertDropParentId;
		$[226] = overlayContainer;
		$[227] = t88;
	} else t88 = $[227];
	const { renderPotentialParentOverlay } = usePotentialParentOverlay(t88);
	let t89;
	if ($[228] === Symbol.for("react.memo_cache_sentinel")) {
		t89 = () => {
			useHover.getState().clearHover();
			const frame = requestAnimationFrame(() => inputRef.current?.rehover());
			return () => cancelAnimationFrame(frame);
		};
		$[228] = t89;
	} else t89 = $[228];
	let t90;
	if ($[229] !== commentMode) {
		t90 = [commentMode];
		$[229] = commentMode;
		$[230] = t90;
	} else t90 = $[230];
	(0, import_react.useEffect)(t89, t90);
	const getComponentNameFromPath = _temp19$4;
	let t91;
	if ($[231] !== editingFile) {
		t91 = editingFile ? getComponentNameFromPath(editingFile) : null;
		$[231] = editingFile;
		$[232] = t91;
	} else t91 = $[232];
	const componentName = t91;
	let t92;
	if ($[233] === Symbol.for("react.memo_cache_sentinel")) {
		t92 = (deltaY, clientX_3, clientY_3) => {
			inputRef.current?.forwardWheel({
				deltaX: 0,
				deltaY,
				zoom: true,
				clientX: clientX_3,
				clientY: clientY_3
			});
		};
		$[233] = t92;
	} else t92 = $[233];
	const onViewportZoom = t92;
	let t93;
	if ($[234] === Symbol.for("react.memo_cache_sentinel")) {
		t93 = (deltaX, deltaY_0) => {
			inputRef.current?.forwardWheel({
				deltaX,
				deltaY: deltaY_0,
				zoom: false,
				clientX: 0,
				clientY: 0
			});
		};
		$[234] = t93;
	} else t93 = $[234];
	const onViewportPan = t93;
	const t94 = initialTransform?.scale ?? 1;
	const t95 = initialTransform?.positionX ?? 0;
	const t96 = initialTransform?.positionY ?? 0;
	let t97;
	if ($[235] !== t94 || $[236] !== t95 || $[237] !== t96) {
		t97 = {
			scale: t94,
			positionX: t95,
			positionY: t96
		};
		$[235] = t94;
		$[236] = t95;
		$[237] = t96;
		$[238] = t97;
	} else t97 = $[238];
	const initialCamera = t97;
	const t98 = layerCursor ?? "auto";
	const t99 = layerCursor ? "auto" : "none";
	let t100;
	if ($[239] !== t98 || $[240] !== t99) {
		t100 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-cursor-layer": "",
			style: {
				position: "absolute",
				inset: 0,
				cursor: t98,
				pointerEvents: t99
			}
		});
		$[239] = t98;
		$[240] = t99;
		$[241] = t100;
	} else t100 = $[241];
	const cursorLayer = t100;
	let t101;
	if ($[242] === Symbol.for("react.memo_cache_sentinel")) {
		t101 = {
			minWidth: "4000px",
			pointerEvents: "auto",
			minHeight: "4000px",
			width: "max-content",
			height: "max-content"
		};
		$[242] = t101;
	} else t101 = $[242];
	let t102;
	if ($[243] !== assetResolver || $[244] !== onResizeElement || $[245] !== readOnly || $[246] !== renderOptions || $[247] !== stopEditText) {
		t102 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasRootTrees, {
			readOnly,
			renderOptions,
			onStopEditText: stopEditText,
			canvasScale: 1,
			onResizeElement,
			onViewportZoom,
			onViewportPan,
			assetResolver
		});
		$[243] = assetResolver;
		$[244] = onResizeElement;
		$[245] = readOnly;
		$[246] = renderOptions;
		$[247] = stopEditText;
		$[248] = t102;
	} else t102 = $[248];
	let t103;
	if ($[249] !== canvasRef || $[250] !== t102) {
		t103 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-canvas-content": true,
			style: t101,
			ref: canvasRef,
			onClickCapture: _temp20$4,
			children: t102
		});
		$[249] = canvasRef;
		$[250] = t102;
		$[251] = t103;
	} else t103 = $[251];
	const cameraContent = t103;
	let t104;
	if ($[252] === Symbol.for("react.memo_cache_sentinel")) {
		t104 = {
			width: "100%",
			height: "100%",
			clipPath: "inset(0)"
		};
		$[252] = t104;
	} else t104 = $[252];
	let t105;
	if ($[253] !== componentName || $[254] !== editingFile || $[255] !== onCloseEdit) {
		t105 = editingFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 py-2 border-b border-ed-border bg-ed-accent/50",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "sm",
					weight: "medium",
					variant: "secondary",
					children: "Editing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(i$5, {
						size: 14,
						weight: "fill",
						className: "text-ed-canvas-component"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "sm",
						weight: "medium",
						children: componentName
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onCloseEdit,
				className: "p-1 hover:bg-ed-accent rounded",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
					width: 16,
					height: 16,
					className: "text-ed-muted-foreground"
				})
			})]
		});
		$[253] = componentName;
		$[254] = editingFile;
		$[255] = onCloseEdit;
		$[256] = t105;
	} else t105 = $[256];
	let t106;
	if ($[257] !== commentMode) {
		t106 = commentMode ? { "data-comment-mode": "" } : {};
		$[257] = commentMode;
		$[258] = t106;
	} else t106 = $[258];
	let t107;
	if ($[259] !== backgroundColor) {
		t107 = {
			cursor: "default",
			touchAction: "none",
			overscrollBehavior: "none",
			backgroundColor
		};
		$[259] = backgroundColor;
		$[260] = t107;
	} else t107 = $[260];
	let t108;
	if ($[261] !== readOnly) {
		t108 = (e_2) => {
			e_2.preventDefault();
			e_2.stopPropagation();
			if (readOnly) return;
			if (isCanvasInsertDragType(e_2.dataTransfer)) probeInsertDropParent(e_2.clientX, e_2.clientY, getPendingPanelDragElement());
			else if (isFileDragType(e_2.dataTransfer)) probeInsertDropParent(e_2.clientX, e_2.clientY, MEDIA_DROP_PROBE);
		};
		$[261] = readOnly;
		$[262] = t108;
	} else t108 = $[262];
	let t109;
	if ($[263] === Symbol.for("react.memo_cache_sentinel")) {
		t109 = (e_3) => {
			if (e_3.currentTarget.contains(e_3.relatedTarget)) return;
			clearInsertDropParent();
		};
		$[263] = t109;
	} else t109 = $[263];
	let t110;
	if ($[264] !== onAddElement || $[265] !== onDropElement || $[266] !== readOnly || $[267] !== uploadImage || $[268] !== viewportRef.current) {
		t110 = async (e_4) => {
			e_4.preventDefault();
			e_4.stopPropagation();
			clearInsertDropParent();
			if (readOnly) return;
			const droppedText = e_4.dataTransfer.getData("text/plain");
			const isInsertDrag = isCanvasInsertDrag(e_4.dataTransfer);
			const isHtmlOrJsx = droppedText && looksLikeHTML(droppedText);
			const hasMediaFile = Array.from(e_4.dataTransfer.files).some(_temp21$4);
			if ((isInsertDrag || isHtmlOrJsx || hasMediaFile) && onDropElement) {
				const viewportRect_0 = viewportRef.current?.getBoundingClientRect();
				if (viewportRect_0) await onDropElement(e_4.dataTransfer, viewportPointToCanvas(e_4.clientX, e_4.clientY, viewportRect_0), {
					clientX: e_4.clientX,
					clientY: e_4.clientY
				});
				else await onDropElement(e_4.dataTransfer);
				return;
			}
			if (!onAddElement) return;
			const result = await getImageFromDropEvent(e_4, readOnly ? void 0 : uploadImage);
			if (result.error) {
				toast.error(result.errorMessage || "Failed to add image");
				return;
			}
			if (result.src) {
				const viewportRect_1 = viewportRef.current?.getBoundingClientRect();
				if (viewportRect_1) onAddElement(createImageElement(result.src, viewportPointToCanvas(e_4.clientX, e_4.clientY, viewportRect_1)));
			}
		};
		$[264] = onAddElement;
		$[265] = onDropElement;
		$[266] = readOnly;
		$[267] = uploadImage;
		$[268] = viewportRef.current;
		$[269] = t110;
	} else t110 = $[269];
	let t111;
	if ($[270] !== cameraContent || $[271] !== cursorLayer || $[272] !== initialCamera) {
		t111 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasCamera, {
			initial: initialCamera,
			applierRef: cameraApplierRef,
			overlay: cursorLayer,
			children: cameraContent
		});
		$[270] = cameraContent;
		$[271] = cursorLayer;
		$[272] = initialCamera;
		$[273] = t111;
	} else t111 = $[273];
	let t112;
	if ($[274] === Symbol.for("react.memo_cache_sentinel")) {
		t112 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasPixelGrid, {});
		$[274] = t112;
	} else t112 = $[274];
	let t113;
	if ($[275] !== onStopFollowingAgent) {
		t113 = onStopFollowingAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentFollowFrame, { onStop: onStopFollowingAgent });
		$[275] = onStopFollowingAgent;
		$[276] = t113;
	} else t113 = $[276];
	let t114;
	if ($[277] !== activePreviewId || $[278] !== commentMode || $[279] !== componentEditMode || $[280] !== editingFile || $[281] !== onApplyPasteStyleClean || $[282] !== onDismissPasteStyleClean || $[283] !== onOpenMoreHtml || $[284] !== onPickPreviewPreset || $[285] !== onShowResolvedChange || $[286] !== onToggleCommentMode || $[287] !== pasteStyleSuggestion || $[288] !== readOnly || $[289] !== showCommentTools || $[290] !== showResolvedComments) {
		t114 = !editingFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [pasteStyleSuggestion && onApplyPasteStyleClean && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasteStyleCleanPrompt, {
			nodeCount: pasteStyleSuggestion.nodeCount,
			onApply: onApplyPasteStyleClean,
			onDismiss: onDismissPasteStyleClean
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-bottom-chrome": true,
			className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-3",
			children: [
				componentEditMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentEditingModeBar, {
					componentName: componentEditMode.componentName,
					filePath: componentEditMode.filePath,
					isPreparing: componentEditMode.isPreparing,
					onSave: componentEditMode.onSave,
					onCancel: componentEditMode.onCancel
				}),
				!readOnly && activePreviewId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewToolbar, { previewId: activePreviewId }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasToolbar, {
					readOnly,
					showCommentTools,
					commentMode,
					onToggleCommentMode,
					showResolvedComments,
					onShowResolvedChange,
					onPickPreviewPreset,
					onOpenMoreHtml
				})
			]
		})] });
		$[277] = activePreviewId;
		$[278] = commentMode;
		$[279] = componentEditMode;
		$[280] = editingFile;
		$[281] = onApplyPasteStyleClean;
		$[282] = onDismissPasteStyleClean;
		$[283] = onOpenMoreHtml;
		$[284] = onPickPreviewPreset;
		$[285] = onShowResolvedChange;
		$[286] = onToggleCommentMode;
		$[287] = pasteStyleSuggestion;
		$[288] = readOnly;
		$[289] = showCommentTools;
		$[290] = showResolvedComments;
		$[291] = t114;
	} else t114 = $[291];
	let t115;
	if ($[292] !== marqueeHoverContainerRef || $[293] !== marqueeMounted || $[294] !== marqueeOverlayRef) {
		t115 = marqueeMounted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: marqueeHoverContainerRef,
			"data-marquee-hits": "",
			className: "absolute inset-0 pointer-events-none"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: marqueeOverlayRef,
			"data-marquee-preview": "",
			style: {
				position: "absolute",
				border: "1px solid var(--ed-canvas-selection)",
				backgroundColor: "color-mix(in srgb, var(--ed-canvas-selection) 10%, transparent)",
				pointerEvents: "none"
			}
		})] });
		$[292] = marqueeHoverContainerRef;
		$[293] = marqueeMounted;
		$[294] = marqueeOverlayRef;
		$[295] = t115;
	} else t115 = $[295];
	let t116;
	if ($[296] !== drawBadgeRef || $[297] !== drawMounted || $[298] !== drawOverlayRef) {
		t116 = drawMounted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: drawOverlayRef,
			"data-draw-preview": "",
			style: {
				position: "absolute",
				border: "1px solid var(--ed-canvas-selection)",
				backgroundColor: "color-mix(in srgb, var(--ed-canvas-selection) 10%, transparent)",
				pointerEvents: "none"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: drawBadgeRef,
				style: {
					position: "absolute",
					top: "100%",
					left: "50%",
					transform: "translate(-50%, 6px)",
					display: "none",
					padding: "1px 6px",
					borderRadius: 4,
					background: "var(--ed-canvas-selection)",
					color: "#fff",
					fontSize: 11,
					lineHeight: "16px",
					fontWeight: 500,
					whiteSpace: "nowrap"
				}
			})
		});
		$[296] = drawBadgeRef;
		$[297] = drawMounted;
		$[298] = drawOverlayRef;
		$[299] = t116;
	} else t116 = $[299];
	let t117;
	if ($[300] === Symbol.for("react.memo_cache_sentinel")) {
		t117 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: zoomRegionPreviewRef,
			"data-zoom-region-preview": "",
			style: {
				position: "absolute",
				display: "none",
				border: "1px solid var(--ed-canvas-selection)",
				backgroundColor: "color-mix(in srgb, var(--ed-canvas-selection) 10%, transparent)",
				pointerEvents: "none"
			}
		});
		$[300] = t117;
	} else t117 = $[300];
	let t118;
	if ($[301] === Symbol.for("react.memo_cache_sentinel")) {
		t118 = {
			position: "absolute",
			inset: 0
		};
		$[301] = t118;
	} else t118 = $[301];
	let t119;
	if ($[302] !== activeTool || $[303] !== commentMode || $[304] !== geoms || $[305] !== isDragging || $[306] !== onRenameElement || $[307] !== onUpdateElementProps || $[308] !== panMode || $[309] !== readOnly || $[310] !== resizePreviewRectRef || $[311] !== selectedElementIds || $[312] !== zoomMode) {
		t119 = !isDragging && !commentMode && !isInsertTool(activeTool) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionOverlay, {
			selectedElementIds,
			overlayMode: true,
			noInteract: panMode || zoomMode || readOnly,
			geoms,
			resizePreviewRectRef,
			onUpdateElementProps,
			onRenameElement: readOnly ? void 0 : onRenameElement
		});
		$[302] = activeTool;
		$[303] = commentMode;
		$[304] = geoms;
		$[305] = isDragging;
		$[306] = onRenameElement;
		$[307] = onUpdateElementProps;
		$[308] = panMode;
		$[309] = readOnly;
		$[310] = resizePreviewRectRef;
		$[311] = selectedElementIds;
		$[312] = zoomMode;
		$[313] = t119;
	} else t119 = $[313];
	let t120;
	if ($[314] === Symbol.for("react.memo_cache_sentinel")) {
		t120 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: handleCursorRef,
			"data-handle-cursor": "",
			"data-overlay-interactive": "",
			className: "absolute pointer-events-auto",
			style: { display: "none" }
		});
		$[314] = t120;
	} else t120 = $[314];
	let t121;
	if ($[315] !== activeTool || $[316] !== commentMode || $[317] !== geoms || $[318] !== isDragging || $[319] !== movingRootIds || $[320] !== panMode || $[321] !== readOnly || $[322] !== resizing || $[323] !== selectedElementIds || $[324] !== zoomMode) {
		t121 = !commentMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootLabels, {
			selectedElementIds,
			hiddenIds: movingRootIds,
			overlayMode: true,
			noInteract: panMode || zoomMode || readOnly || isDragging || !!resizing || isInsertTool(activeTool),
			geoms
		});
		$[315] = activeTool;
		$[316] = commentMode;
		$[317] = geoms;
		$[318] = isDragging;
		$[319] = movingRootIds;
		$[320] = panMode;
		$[321] = readOnly;
		$[322] = resizing;
		$[323] = selectedElementIds;
		$[324] = zoomMode;
		$[325] = t121;
	} else t121 = $[325];
	let t122;
	if ($[326] !== resizing) {
		t122 = !!resizing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			"data-aspect-guide-id": resizing.id,
			className: "absolute pointer-events-none text-ed-canvas-selection",
			style: {
				left: 0,
				top: 0,
				display: "none",
				overflow: "visible",
				transformOrigin: "center center"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				"data-aspect-guide-line": true,
				x1: "0",
				y1: "0",
				x2: "100%",
				y2: "100%",
				stroke: "currentColor",
				strokeWidth: 1,
				strokeDasharray: "4 3",
				vectorEffect: "non-scaling-stroke"
			})
		});
		$[326] = resizing;
		$[327] = t122;
	} else t122 = $[327];
	let t123;
	if ($[328] === Symbol.for("react.memo_cache_sentinel")) {
		t123 = { display: "contents" };
		$[328] = t123;
	} else t123 = $[328];
	let t124;
	if ($[329] !== previewGuidesRef) {
		t124 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: previewGuidesRef,
			"data-drag-preview-guides": "",
			style: t123
		});
		$[329] = previewGuidesRef;
		$[330] = t124;
	} else t124 = $[330];
	let t125;
	bb0: {
		let t126;
		if ($[331] !== resizeSnapGuides || $[332] !== resizing) {
			t126 = resizing ? resizeSnapGuides : [];
			$[331] = resizeSnapGuides;
			$[332] = resizing;
			$[333] = t126;
		} else t126 = $[333];
		const guides = t126;
		if (guides.length === 0) {
			t125 = null;
			break bb0;
		}
		let t127;
		if ($[334] !== overlayContainer) {
			t127 = overlayContainer?.getBoundingClientRect();
			$[334] = overlayContainer;
			$[335] = t127;
		} else t127 = $[335];
		const overlayRect = t127;
		if (!overlayRect) {
			t125 = null;
			break bb0;
		}
		let t128;
		if ($[336] !== guides || $[337] !== overlayRect) {
			let t129;
			if ($[339] !== overlayRect) {
				t129 = (g, i) => {
					const box_1 = snapGuideBox(g, _temp22$4);
					const style = {
						position: "absolute",
						backgroundColor: GUIDE_COLOR,
						pointerEvents: "none",
						zIndex: 60,
						left: box_1.left - overlayRect.left,
						top: box_1.top - overlayRect.top,
						width: box_1.width,
						height: box_1.height
					};
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-snap-guide": g.axis,
						style
					}, `snap-${i}`);
				};
				$[339] = overlayRect;
				$[340] = t129;
			} else t129 = $[340];
			t128 = guides.map(t129);
			$[336] = guides;
			$[337] = overlayRect;
			$[338] = t128;
		} else t128 = $[338];
		let t129;
		if ($[341] !== t128) {
			t129 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t128 });
			$[341] = t128;
			$[342] = t129;
		} else t129 = $[342];
		t125 = t129;
	}
	let t126;
	if ($[343] !== agentPresence || $[344] !== geoms || $[345] !== movingRootIds) {
		t126 = agentPresence && agentPresence.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPresenceOverlays, {
			agentPresence,
			hiddenIds: movingRootIds,
			geoms
		});
		$[343] = agentPresence;
		$[344] = geoms;
		$[345] = movingRootIds;
		$[346] = t126;
	} else t126 = $[346];
	let t127;
	if ($[347] !== activeTool || $[348] !== canvasRef || $[349] !== commentMode || $[350] !== isDragging || $[351] !== panMode || $[352] !== selectedElementIds || $[353] !== zoomMode) {
		t127 = !isDragging && !panMode && !zoomMode && !isInsertTool(activeTool) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverOverlay, {
			selectedElementIds: commentMode ? EMPTY_SELECTION : selectedElementIds,
			overlayMode: true,
			canvasRef
		});
		$[347] = activeTool;
		$[348] = canvasRef;
		$[349] = commentMode;
		$[350] = isDragging;
		$[351] = panMode;
		$[352] = selectedElementIds;
		$[353] = zoomMode;
		$[354] = t127;
	} else t127 = $[354];
	let t128;
	if ($[355] !== canvasRef) {
		t128 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreviewOverlay, {
			overlayMode: true,
			canvasRef
		});
		$[355] = canvasRef;
		$[356] = t128;
	} else t128 = $[356];
	let t129;
	if ($[357] !== t119 || $[358] !== t121 || $[359] !== t122 || $[360] !== t124 || $[361] !== t125 || $[362] !== t126 || $[363] !== t127 || $[364] !== t128) {
		t129 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: selectionOverlayRef,
			style: t118,
			children: [
				t119,
				t120,
				t121,
				t122,
				t124,
				t125,
				t126,
				t127,
				t128
			]
		});
		$[357] = t119;
		$[358] = t121;
		$[359] = t122;
		$[360] = t124;
		$[361] = t125;
		$[362] = t126;
		$[363] = t127;
		$[364] = t128;
		$[365] = t129;
	} else t129 = $[365];
	let t130;
	if ($[366] !== insertDropParentId || $[367] !== renderPotentialParentOverlay) {
		t130 = insertDropParentId && renderPotentialParentOverlay();
		$[366] = insertDropParentId;
		$[367] = renderPotentialParentOverlay;
		$[368] = t130;
	} else t130 = $[368];
	let t131;
	if ($[369] === Symbol.for("react.memo_cache_sentinel")) {
		t131 = { display: "contents" };
		$[369] = t131;
	} else t131 = $[369];
	let t132;
	if ($[370] !== previewParentRef) {
		t132 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: previewParentRef,
			"data-drag-preview-parent": "",
			style: t131
		});
		$[370] = previewParentRef;
		$[371] = t132;
	} else t132 = $[371];
	const t133 = isDragging || void 0;
	let t134;
	if ($[372] === Symbol.for("react.memo_cache_sentinel")) {
		t134 = { zIndex: 50 };
		$[372] = t134;
	} else t134 = $[372];
	let t135;
	if ($[373] !== commentOverlay) {
		t135 = typeof commentOverlay === "function" ? commentOverlay(getCamera()) : commentOverlay;
		$[373] = commentOverlay;
		$[374] = t135;
	} else t135 = $[374];
	let t136;
	if ($[375] !== t133 || $[376] !== t135) {
		t136 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-comment-overlay": true,
			"data-object-dragging": t133,
			className: "absolute inset-0 pointer-events-none",
			style: t134,
			children: t135
		});
		$[375] = t133;
		$[376] = t135;
		$[377] = t136;
	} else t136 = $[377];
	let t137;
	if ($[378] !== chatAreas) {
		t137 = chatAreas && chatAreas.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasAreasOverlay, { areas: chatAreas });
		$[378] = chatAreas;
		$[379] = t137;
	} else t137 = $[379];
	let t138;
	if ($[380] !== pageId) {
		t138 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatAreaHighlightOverlay, { pageId });
		$[380] = pageId;
		$[381] = t138;
	} else t138 = $[381];
	let t139;
	if ($[382] !== activeTool || $[383] !== assetResolver || $[384] !== commentMode || $[385] !== onSelectElement || $[386] !== pageId || $[387] !== panMode || $[388] !== readOnly || $[389] !== renderOptions || $[390] !== selectedElementIds || $[391] !== viewportRef) {
		t139 = !readOnly && !commentMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InnerPicker, {
			disabled: panMode || isInsertTool(activeTool),
			viewportRef,
			selectedElementIds,
			onSelectElement: (id_13) => onSelectElement(id_13),
			onPlaceCapturedElement: renderOptions.onPlaceCapturedElement,
			onViewportPan,
			renderOptions: {
				components: renderOptions.components,
				iconLibraries: renderOptions.iconLibraries,
				assetResolver
			}
		}, pageId);
		$[382] = activeTool;
		$[383] = assetResolver;
		$[384] = commentMode;
		$[385] = onSelectElement;
		$[386] = pageId;
		$[387] = panMode;
		$[388] = readOnly;
		$[389] = renderOptions;
		$[390] = selectedElementIds;
		$[391] = viewportRef;
		$[392] = t139;
	} else t139 = $[392];
	let t140;
	if ($[393] !== onCaptureRegion || $[394] !== onPickElementForChat || $[395] !== readOnly || $[396] !== regionMaskArmed || $[397] !== viewportRef) {
		t140 = onCaptureRegion && !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasRegionMask, {
			viewportRef,
			onCapture: onCaptureRegion,
			onPickElement: onPickElementForChat,
			isComponentLayer: _temp23$4,
			armed: regionMaskArmed,
			pointer: () => inputRef.current?.pointer() ?? null,
			register: (drag_1) => {
				regionMaskDragRef.current = drag_1;
			}
		});
		$[393] = onCaptureRegion;
		$[394] = onPickElementForChat;
		$[395] = readOnly;
		$[396] = regionMaskArmed;
		$[397] = viewportRef;
		$[398] = t140;
	} else t140 = $[398];
	let t141;
	if ($[399] !== t115 || $[400] !== t116 || $[401] !== t129 || $[402] !== t130 || $[403] !== t132 || $[404] !== t136 || $[405] !== t137 || $[406] !== t138 || $[407] !== t139 || $[408] !== t140) {
		t141 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: setOverlayContainer,
			className: "absolute inset-0 pointer-events-none",
			"data-overlay-container": true,
			children: [
				t115,
				t116,
				t117,
				t129,
				t130,
				t132,
				t136,
				t137,
				t138,
				t139,
				t140
			]
		});
		$[399] = t115;
		$[400] = t116;
		$[401] = t129;
		$[402] = t130;
		$[403] = t132;
		$[404] = t136;
		$[405] = t137;
		$[406] = t138;
		$[407] = t139;
		$[408] = t140;
		$[409] = t141;
	} else t141 = $[409];
	let t142;
	if ($[410] !== t106 || $[411] !== t107 || $[412] !== t108 || $[413] !== t110 || $[414] !== t111 || $[415] !== t113 || $[416] !== t114 || $[417] !== t141 || $[418] !== viewportRef) {
		t142 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: viewportRef,
			className: "flex-1 relative overflow-hidden bg-ed-canvas-background",
			"data-canvas-viewport": "",
			...t106,
			style: t107,
			onDragOver: t108,
			onDragLeave: t109,
			onDrop: t110,
			children: [
				t111,
				t112,
				t113,
				t114,
				t141
			]
		});
		$[410] = t106;
		$[411] = t107;
		$[412] = t108;
		$[413] = t110;
		$[414] = t111;
		$[415] = t113;
		$[416] = t114;
		$[417] = t141;
		$[418] = viewportRef;
		$[419] = t142;
	} else t142 = $[419];
	let t143;
	if ($[420] !== activeElement || $[421] !== activeElements.length || $[422] !== movesInPlace || $[423] !== previewCopyRef || $[424] !== renderDragPreview) {
		t143 = !movesInPlace && activeElements.length > 0 && activeElement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: previewCopyRef,
			style: {
				position: "fixed",
				left: 0,
				top: 0,
				zIndex: 40,
				pointerEvents: "none",
				visibility: "hidden"
			},
			children: renderDragPreview()
		});
		$[420] = activeElement;
		$[421] = activeElements.length;
		$[422] = movesInPlace;
		$[423] = previewCopyRef;
		$[424] = renderDragPreview;
		$[425] = t143;
	} else t143 = $[425];
	let t144;
	if ($[426] !== activeElements || $[427] !== dragStartAnchor?.frame.scale || $[428] !== dragStartRects || $[429] !== movesInPlace) {
		t144 = movesInPlace && activeElements.map((el_4) => {
			const rect_4 = dragStartRects.get(el_4.id);
			const startScale_0 = dragStartAnchor?.frame.scale ?? getCamera().scale;
			return rect_4 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovedRootLabel, {
				element: el_4,
				width: rect_4.width / startScale_0
			}, el_4.id);
		});
		$[426] = activeElements;
		$[427] = dragStartAnchor?.frame.scale;
		$[428] = dragStartRects;
		$[429] = movesInPlace;
		$[430] = t144;
	} else t144 = $[430];
	let t145;
	if ($[431] === Symbol.for("react.memo_cache_sentinel")) {
		t145 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-canvas-modal-shield": "" });
		$[431] = t145;
	} else t145 = $[431];
	let t146;
	if ($[432] !== t105 || $[433] !== t142 || $[434] !== t143 || $[435] !== t144) {
		t146 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-root": "",
			className: "w-full h-full relative overflow-hidden flex flex-col",
			style: t104,
			children: [
				t105,
				t142,
				t143,
				t144,
				t145
			]
		});
		$[432] = t105;
		$[433] = t142;
		$[434] = t143;
		$[435] = t144;
		$[436] = t146;
	} else t146 = $[436];
	return t146;
}
function _temp23$4(id_14) {
	const type = getById(usePages.getState().visibleTree, id_14)?.type;
	return type === "component" || type === "capture";
}
function _temp22$4(x_2, y_2) {
	return {
		x: x_2,
		y: y_2
	};
}
function _temp21$4(f) {
	return f.type.startsWith("image/") || f.type.startsWith("video/");
}
function _temp20$4(e_1) {
	if (e_1.target.closest("a[href]")) {
		e_1.preventDefault();
		return;
	}
}
function _temp19$4(path) {
	return (path.split("/").pop() || "").replace(/\.tsx?$/, "");
}
function _temp18$4(el_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		"data-drag-preview-outline": "",
		style: {
			position: "absolute",
			inset: 0,
			outline: `calc(1px / var(--lg-drag-zoom)) solid ${el_0.type === "webview" ? "var(--ed-canvas-webview)" : "var(--ed-canvas-selection)"}`,
			pointerEvents: "none"
		}
	});
}
function _temp17$4(node_7) {
	const { selectedElementIds: selected, drilledParentId } = useSelection.getState();
	setCanvasContextMenuTarget(node_7, contextMenuTarget(node_7, {
		tree: getVisibleTree(),
		interactiveParentIds: getInteractiveParentIds(),
		drilledParentId,
		selectedElementIds: selected
	}));
}
function _temp16$5() {
	return _temp15$5;
}
function _temp15$5() {
	return setTextEditSession(null);
}
function _temp14$7(next_3) {
	return {
		x: next_3.screen.x,
		y: next_3.screen.y,
		shift: next_3.shift,
		cmd: next_3.cmd
	};
}
function _temp13$7(target_0) {
	const name = target_0.handle;
	if (!target_0.id || !name) return "";
	return document.querySelector(`[data-selection-overlay-id="${CSS.escape(target_0.id)}"] [${target_0.kind === "rotate" ? "data-rotate-handle" : "data-resize-handle"}="${name}"]`)?.style.cursor ?? "";
}
function _temp12$7(changes) {
	const tree_0 = usePages.getState().tree;
	const ops_0 = changes.flatMap((t0) => {
		const { id: id_6, styles, pivot } = t0;
		const op = getById(tree_0, id_6) && createSetStylesOperation(tree_0, id_6, styles, null, pivot);
		return op ? [op] : [];
	});
	const tx_0 = usePages.getState().transaction();
	tx_0.stage(ops_0);
	tx_0.commit();
}
function _temp11$9(prev_0) {
	return prev_0 === null ? prev_0 : null;
}
function _temp10$11(clientX_0, clientY_0, child_0) {
	if (!child_0) return null;
	const store_0 = usePages.getState().visibleTree;
	return findContainerAt(clientX_0, clientY_0, child_0, (hostId_0, candidate) => {
		const parent = getById(store_0, hostId_0);
		return !!parent && hasChildren$1(parent) && canAcceptChild(parent, candidate);
	})?.getAttribute("data-element-id") ?? null;
}
function _temp1$11(draggedId, targetId, position) {
	const tree = usePages.getState().tree;
	const { parentId: toParentId, index: toIndex } = resolveMoveTarget(tree, draggedId, targetId, position);
	const ops = [];
	let cursor = tree;
	const dragged = getById(cursor, draggedId);
	if (toParentId && isFlowLayoutElement(toParentId) && dragged && !isRelativeFlowPosition(dragged.styles)) {
		const styleOp = createSetStylesOperation(cursor, draggedId, positionStylesForPlacement(dragged.styles, "flow"));
		if (styleOp) {
			ops.push(styleOp);
			cursor = applyOperationsToStore(cursor, [styleOp]);
		}
	}
	const moveOp = createMoveOperation(cursor, draggedId, toParentId, toIndex);
	if (moveOp) ops.push(moveOp);
	return ops;
}
function _temp0$11() {
	const originalBodyOverscroll = document.body.style.overscrollBehavior;
	const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
	document.body.style.overscrollBehavior = "none";
	document.documentElement.style.overscrollBehavior = "none";
	return () => {
		document.body.style.overscrollBehavior = originalBodyOverscroll;
		document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
	};
}
function _temp9$12() {
	const blockHorizontalSwipe = _temp8$14;
	window.addEventListener("wheel", blockHorizontalSwipe, {
		passive: false,
		capture: true
	});
	return () => {
		window.removeEventListener("wheel", blockHorizontalSwipe, { capture: true });
	};
}
function _temp8$14(e_0) {
	if (Math.abs(e_0.deltaX) > Math.abs(e_0.deltaY) && Math.abs(e_0.deltaX) > 5) {
		const markedRegion = (e_0.target instanceof Element ? e_0.target : null)?.closest("[data-horizontal-scroll]");
		const scrollRegion = markedRegion?.matches("[data-slot=\"scroll-area-viewport\"]") ? markedRegion : markedRegion?.querySelector("[data-slot=\"scroll-area-viewport\"]") ?? markedRegion;
		if (scrollRegion) {
			const maxScrollLeft = scrollRegion.scrollWidth - scrollRegion.clientWidth;
			if (e_0.deltaX < 0 ? scrollRegion.scrollLeft > 0 : scrollRegion.scrollLeft < maxScrollLeft) return;
		}
		e_0.preventDefault();
	}
}
function _temp7$18() {
	useHover.getState().clearHover();
}
function _temp6$23(scale_0, positionX, positionY) {
	const pins = document.querySelectorAll("[data-comment-canvas-x]");
	for (const pin of pins) {
		const cx = parseFloat(pin.dataset.commentCanvasX);
		const cy = parseFloat(pin.dataset.commentCanvasY);
		if (isNaN(cx) || isNaN(cy)) continue;
		pin.style.left = `${cx * scale_0 + positionX}px`;
		pin.style.top = `${cy * scale_0 + positionY}px`;
	}
}
function _temp5$29(hostId, child) {
	const host = getById(usePages.getState().visibleTree, hostId);
	return !!host && canAcceptChild(host, child);
}
function _temp4$33(s) {
	return s.activeWebviewId;
}

export { Canvas };
