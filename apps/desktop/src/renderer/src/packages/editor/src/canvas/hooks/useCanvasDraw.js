// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/useCanvasDraw.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getCameraScale } from "../../shell/hooks/useCommentAgent.js";
import { isFlowLayoutDisplay, positionStylesForPlacement } from "../utils/absolutePositioning.js";
import { countGridColumns$1, orderAdoptedChildren } from "../components/PreviewToolbar.js";
import { findContainerAt } from "./drawParent.js";
import { pastDragThreshold } from "../components/CanvasPixelGrid.js";
import { DEFAULT_TOOL_SIZE, createToolElement, isDrawableTool } from "../../shared/utils/toolElements.js";

/**
* Tools that swallow what they are drawn over, and how they hold it.
* Frame pins its children in place; the stacks pull them into flow along their
* own axis. Every other drawable tool just draws an overlay.
*/
var ADOPTION_LAYOUT = {
	frame: "absolute",
	"stack-h": "row",
	"stack-v": "column",
	grid: "grid"
};
/** Screen-space rect for a drag-to-draw gesture; Shift locks it to a square anchored at the start corner. */
function computeDrawRect(start, current, shiftHeld) {
	const rawW = Math.abs(current.x - start.x);
	const rawH = Math.abs(current.y - start.y);
	const width = shiftHeld ? Math.max(rawW, rawH) : rawW;
	const height = shiftHeld ? Math.max(rawW, rawH) : rawH;
	return {
		originX: current.x >= start.x ? start.x : start.x - width,
		originY: current.y >= start.y ? start.y : start.y - height,
		width,
		height
	};
}
/** Nests a drawn element into the host under the drag start (or canvas root). */
function placeDrawnElement(args) {
	const { el, origin, drawStartClient, drawnRect, canvasRect, scale, tool, onAddElement, canHostChild, collectAdoptions } = args;
	const layout = ADOPTION_LAYOUT[tool];
	const framingRect = layout ? drawnRect : null;
	const container = findContainerAt(drawStartClient.x, drawStartClient.y, el, canHostChild, framingRect ?? void 0);
	const parentId = container?.getAttribute("data-element-id") || null;
	const adopt = framingRect && layout ? toAdoption(collectAdoptions?.(framingRect, parentId, scale), layout) : void 0;
	if (adopt?.layout === "grid") el.styles = {
		...el.styles,
		gridTemplateColumns: `repeat(${countGridColumns$1(adopt.children)}, 1fr)`
	};
	if (!container) {
		el.canvasPosition = {
			x: Math.round((origin.x - canvasRect.left) / scale),
			y: Math.round((origin.y - canvasRect.top) / scale)
		};
		onAddElement?.(el, {
			atRoot: true,
			adopt
		});
		return;
	}
	const cs = getComputedStyle(container);
	const flowParent = isFlowLayoutDisplay(cs.display);
	el.styles = positionStylesForPlacement(el.styles, flowParent ? "flow" : "freeform");
	if (!flowParent) {
		const prect = container.getBoundingClientRect();
		el.styles = {
			...el.styles,
			left: Math.round((origin.x - prect.left) / scale - parseFloat(cs.borderLeftWidth || "0")),
			top: Math.round((origin.y - prect.top) / scale - parseFloat(cs.borderTopWidth || "0"))
		};
	}
	onAddElement?.(el, {
		parentId: parentId || void 0,
		adopt
	});
}
function toAdoption(children, layout) {
	if (!children || children.length === 0) return void 0;
	return {
		layout,
		children: orderAdoptedChildren(children, layout)
	};
}
function useCanvasDraw(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { canvasRef, viewportRef, onAddElement, setActiveTool, onSelectElement, canHostChild, collectAdoptions } = t0;
	const sessionRef = (0, import_react.useRef)(null);
	const overlayRef = (0, import_react.useRef)(null);
	const badgeRef = (0, import_react.useRef)(null);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const rafRef = (0, import_react.useRef)(null);
	const gestureRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== canHostChild || $[1] !== canvasRef || $[2] !== collectAdoptions || $[3] !== onAddElement || $[4] !== onSelectElement || $[5] !== setActiveTool) {
		t1 = (end, d) => {
			const canvasRect = canvasRef.current?.getBoundingClientRect();
			if (canvasRect) {
				const scale = getCameraScale();
				const isClick = !pastDragThreshold(end.x - d.startClient.x, end.y - d.startClient.y);
				const rect = computeDrawRect(d.startClient, end, d.shiftHeld);
				const origin = isClick ? d.startClient : {
					x: rect.originX,
					y: rect.originY
				};
				const defaultSize = DEFAULT_TOOL_SIZE[d.tool] ?? {
					width: 200,
					height: 100
				};
				const width = isClick ? defaultSize.width : rect.width / scale;
				const height = isClick ? defaultSize.height : rect.height / scale;
				const el = createToolElement(d.tool, {
					width,
					height
				});
				if (el) {
					placeDrawnElement({
						el,
						origin,
						drawStartClient: d.startClient,
						drawnRect: isClick ? null : {
							left: rect.originX,
							top: rect.originY,
							width: rect.width,
							height: rect.height
						},
						canvasRect,
						scale,
						tool: d.tool,
						onAddElement,
						canHostChild,
						collectAdoptions
					});
					onSelectElement?.(el.id);
				}
			}
			setActiveTool("move");
		};
		$[0] = canHostChild;
		$[1] = canvasRef;
		$[2] = collectAdoptions;
		$[3] = onAddElement;
		$[4] = onSelectElement;
		$[5] = setActiveTool;
		$[6] = t1;
	} else t1 = $[6];
	const finishDraw = (0, import_react.useEffectEvent)(t1);
	let t2;
	if ($[7] !== setActiveTool) {
		t2 = () => {
			setActiveTool("move");
		};
		$[7] = setActiveTool;
		$[8] = t2;
	} else t2 = $[8];
	const cancelDraw = (0, import_react.useEffectEvent)(t2);
	let t3;
	if ($[9] !== viewportRef) {
		t3 = () => viewportRef.current?.getBoundingClientRect() ?? null;
		$[9] = viewportRef;
		$[10] = t3;
	} else t3 = $[10];
	const viewportRect = (0, import_react.useEffectEvent)(t3);
	let t4;
	if ($[11] !== cancelDraw || $[12] !== finishDraw || $[13] !== viewportRect) {
		t4 = () => {
			const cleanup = () => {
				if (rafRef.current !== null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}
			};
			const endSession = () => {
				cleanup();
				sessionRef.current = null;
				setMounted(false);
			};
			const scheduleApplyPreview = () => {
				if (rafRef.current === null) rafRef.current = requestAnimationFrame(applyPreview);
			};
			const applyPreview = () => {
				rafRef.current = null;
				const d_0 = sessionRef.current;
				const ov = overlayRef.current;
				if (!d_0 || !ov) return;
				const { originX: left, originY: top, width: w, height: h } = computeDrawRect({
					x: d_0.startClient.x - d_0.viewportRect.left,
					y: d_0.startClient.y - d_0.viewportRect.top
				}, {
					x: d_0.latest.x - d_0.viewportRect.left,
					y: d_0.latest.y - d_0.viewportRect.top
				}, d_0.shiftHeld);
				ov.style.left = `${left}px`;
				ov.style.top = `${top}px`;
				ov.style.width = `${w}px`;
				ov.style.height = `${h}px`;
				const badge = badgeRef.current;
				if (badge) {
					const scale_0 = getCameraScale();
					const shown = w > 1 || h > 1;
					badge.style.display = shown ? "block" : "none";
					if (shown) badge.textContent = `${Math.round(w / scale_0)} × ${Math.round(h / scale_0)}`;
				}
			};
			gestureRef.current = {
				begin(tool, start_0, shift) {
					const rect_0 = isDrawableTool(tool) ? viewportRect() : null;
					if (!rect_0) return false;
					sessionRef.current = {
						startClient: start_0,
						viewportRect: rect_0,
						tool,
						latest: {
							x: start_0.x,
							y: start_0.y
						},
						shiftHeld: shift
					};
					setMounted(true);
					return true;
				},
				move(at, shift_0) {
					const d_1 = sessionRef.current;
					if (!d_1) return;
					d_1.latest.x = at.x;
					d_1.latest.y = at.y;
					d_1.shiftHeld = shift_0;
					scheduleApplyPreview();
				},
				modifiers(shift_1) {
					if (sessionRef.current) sessionRef.current.shiftHeld = shift_1;
					scheduleApplyPreview();
				},
				end(end_0, at_0) {
					const d_2 = sessionRef.current;
					if (!d_2) return;
					endSession();
					if (end_0 === "commit") finishDraw(at_0, d_2);
					else if (end_0 === "escape") cancelDraw();
				}
			};
			return () => {
				cleanup();
				gestureRef.current = null;
			};
		};
		$[11] = cancelDraw;
		$[12] = finishDraw;
		$[13] = viewportRect;
		$[14] = t4;
	} else t4 = $[14];
	let t5;
	if ($[15] !== canvasRef) {
		t5 = [canvasRef];
		$[15] = canvasRef;
		$[16] = t5;
	} else t5 = $[16];
	(0, import_react.useEffect)(t4, t5);
	let t6;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = {
			begin: (tool_0, start_1, shift_2) => !!gestureRef.current?.begin(tool_0, start_1, shift_2),
			move: (at_1, shift_3) => gestureRef.current?.move(at_1, shift_3),
			modifiers: (shift_4) => gestureRef.current?.modifiers(shift_4),
			end: (end_1, at_2) => gestureRef.current?.end(end_1, at_2)
		};
		$[17] = t6;
	} else t6 = $[17];
	const drawGesture = t6;
	let t7;
	if ($[18] !== mounted) {
		t7 = {
			drawMounted: mounted,
			drawOverlayRef: overlayRef,
			drawBadgeRef: badgeRef,
			drawGesture
		};
		$[18] = mounted;
		$[19] = t7;
	} else t7 = $[19];
	return t7;
}

export { useCanvasDraw };
