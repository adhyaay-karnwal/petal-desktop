// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasRegionMask.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getCamera, subscribeCamera } from "../../shell/hooks/useCommentAgent.js";
import { canvasElementIdFor } from "../utils/canvasRegionSource.js";
import { liveProbeFor } from "../../shared/state/liveProbeChannel.js";
import { CANVAS_HIT_CHROME } from "../utils/liveRegionAtPoint.js";
import { pastDragThreshold } from "./CanvasPixelGrid.js";

/**
* Press ⇧⌘S (⇧CtrlS) to point the agent at part of the canvas. Like macOS ⌘⇧4,
* the canvas shows a crosshair until one pick, Escape, or ⇧⌘S again, and
* outlines whatever is under it. Not a held ⇧⌘: that chord is ⌘/⇧-click
* multi-select.
* - click a canvas layer → it goes into the chat like ⌘L (`onPickElement`);
* - click inside a component or popover (no layer to reference) → an area the
*   exact size of that element (`onCapture`);
* - drag → everything outside the drag dims, and release hands the hand-drawn
*   area to `onCapture`.
*
* Perf: React state flips only when the mode arms/disarms. The cursor, hover
* outline and cutout are written straight to the DOM, at most once per frame,
* and follow pan/zoom through the camera channel instead of re-rendering.
*
* The canvas input machine arms and disarms the mask and runs its drag; the
* mask listens for no keys, blur or window pointer moves of its own.
*/
var DIM$1 = "rgba(0, 0, 0, 0.35)";
var CURSOR_SIZE = 23;
/**
* Lines sit on the half-pixel centre (10.5) of an SVG placed at a whole-pixel
* offset, so a 1px stroke fills exactly one device pixel column instead of
* smearing across two.
*/
var CENTER = CURSOR_SIZE / 2;
/** Editor chrome over the canvas — hover and clicks look through it. */
var CHROME = CANVAS_HIT_CHROME;
/** Client box of a node; display:contents component wrappers use their children's union. */
function boxOf(el) {
	const rect = el.getBoundingClientRect();
	if (rect.width > 0 || rect.height > 0) return rect;
	let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
	for (const child of el.children) {
		const c = child.getBoundingClientRect();
		if (c.width === 0 && c.height === 0) continue;
		left = Math.min(left, c.left);
		top = Math.min(top, c.top);
		right = Math.max(right, c.right);
		bottom = Math.max(bottom, c.bottom);
	}
	return left === Infinity ? null : new DOMRect(left, top, right - left, bottom - top);
}
function CanvasRegionMask(t0) {
	const $ = (0, import_compiler_runtime.c)(51);
	const { viewportRef, onCapture, onPickElement, isComponentLayer, armed, pointer, register } = t0;
	const cutoutRef = (0, import_react.useRef)(null);
	const cursorRef = (0, import_react.useRef)(null);
	const hoverRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			x: -1,
			y: -1
		};
		$[0] = t1;
	} else t1 = $[0];
	const pointerRef = (0, import_react.useRef)(t1);
	const originRef = (0, import_react.useRef)(null);
	const pressTargetRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(0);
	const liveRef = (0, import_react.useRef)(null);
	const liveProbeBusyRef = (0, import_react.useRef)(false);
	let t2;
	if ($[1] !== isComponentLayer) {
		t2 = (x, y) => {
			const hit = document.elementsFromPoint(x, y).find(_temp$89);
			if (!hit || !canvasElementIdFor(hit)) return null;
			const ownId = hit.getAttribute("data-element-id");
			if (ownId) return {
				kind: "layer",
				id: ownId,
				el: hit
			};
			if (hit.tagName === "WEBVIEW" && liveProbeFor(hit)) return {
				kind: "live",
				el: hit
			};
			const layer = hit.closest("[data-element-id]");
			const layerId = layer?.getAttribute("data-element-id");
			if (layer && layerId && !isComponentLayer(layerId)) return {
				kind: "layer",
				id: layerId,
				el: layer
			};
			let svg = hit.closest("svg");
			while (svg?.parentElement?.closest("svg")) svg = svg.parentElement.closest("svg");
			return {
				kind: "dom",
				el: svg ?? hit
			};
		};
		$[1] = isComponentLayer;
		$[2] = t2;
	} else t2 = $[2];
	const targetAt = t2;
	let paint;
	let schedulePaint;
	if ($[3] !== targetAt) {
		paint = () => {
			frameRef.current = 0;
			const origin = originRef.current;
			if (!origin) return;
			const px = pointerRef.current.x - origin.left;
			const py = pointerRef.current.y - origin.top;
			if (cursorRef.current) cursorRef.current.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px)`;
			const hover = hoverRef.current;
			const drag = dragRef.current;
			if (drag) {
				if (hover) hover.style.display = "none";
				const cutout = cutoutRef.current;
				if (!cutout) return;
				const { scale, positionX, positionY } = getCamera();
				const ax = drag.startX * scale + positionX;
				const ay = drag.startY * scale + positionY;
				cutout.style.transform = `translate(${Math.min(ax, px)}px, ${Math.min(ay, py)}px)`;
				cutout.style.width = `${Math.abs(px - ax)}px`;
				cutout.style.height = `${Math.abs(py - ay)}px`;
				return;
			}
			const target = px >= 0 && py >= 0 && px <= origin.width && py <= origin.height ? targetAt(pointerRef.current.x, pointerRef.current.y) : null;
			const box = target ? target.kind === "live" ? liveBoxAt(target.el, pointerRef.current.x, pointerRef.current.y) : boxOf(target.el) : null;
			if (!hover) return;
			if (!box) {
				hover.style.display = "none";
				return;
			}
			hover.style.display = "block";
			hover.style.transform = `translate(${Math.round(box.left - origin.left)}px, ${Math.round(box.top - origin.top)}px)`;
			hover.style.width = `${Math.round(box.width)}px`;
			hover.style.height = `${Math.round(box.height)}px`;
		};
		schedulePaint = () => {
			if (!frameRef.current) frameRef.current = requestAnimationFrame(paint);
		};
		const liveBoxAt = (guest, x_0, y_0) => {
			const last = liveRef.current;
			if (!(last && last.guest === guest && last.x === x_0 && last.y === y_0) && !liveProbeBusyRef.current) {
				const probe = liveProbeFor(guest);
				if (probe) {
					liveProbeBusyRef.current = true;
					probe(x_0, y_0).then((box_0) => {
						liveProbeBusyRef.current = false;
						liveRef.current = {
							guest,
							x: x_0,
							y: y_0,
							box: box_0
						};
						schedulePaint();
					}, () => {
						liveProbeBusyRef.current = false;
					});
				}
			}
			if (!last || last.guest !== guest || !last.box) return null;
			return new DOMRect(last.box.left, last.box.top, last.box.width, last.box.height);
		};
		$[3] = targetAt;
		$[4] = paint;
		$[5] = schedulePaint;
	} else {
		paint = $[4];
		schedulePaint = $[5];
	}
	let t3;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (visible) => {
			if (cursorRef.current) cursorRef.current.style.display = visible ? "block" : "none";
		};
		$[6] = t3;
	} else t3 = $[6];
	const setCursorVisible = t3;
	let t4;
	if ($[7] !== schedulePaint) {
		t4 = () => {
			dragRef.current = null;
			if (cutoutRef.current) cutoutRef.current.style.display = "none";
			schedulePaint();
		};
		$[7] = schedulePaint;
		$[8] = t4;
	} else t4 = $[8];
	const endDrag = t4;
	let t5;
	if ($[9] !== schedulePaint) {
		t5 = () => schedulePaint();
		$[9] = schedulePaint;
		$[10] = t5;
	} else t5 = $[10];
	const repaintOnCamera = (0, import_react.useEffectEvent)(t5);
	let t6;
	if ($[11] !== armed || $[12] !== repaintOnCamera) {
		t6 = () => {
			if (!armed) return;
			return subscribeCamera(() => repaintOnCamera());
		};
		$[11] = armed;
		$[12] = repaintOnCamera;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== armed) {
		t7 = [armed];
		$[14] = armed;
		$[15] = t7;
	} else t7 = $[15];
	(0, import_react.useEffect)(t6, t7);
	let t8;
	if ($[16] !== armed || $[17] !== paint || $[18] !== pointer || $[19] !== viewportRef) {
		t8 = () => {
			if (!armed) return;
			const origin_0 = viewportRef.current?.getBoundingClientRect() ?? null;
			originRef.current = origin_0;
			const seen = pointer();
			if (seen && !dragRef.current) pointerRef.current = {
				x: seen.x,
				y: seen.y
			};
			const { x: x_1, y: y_1 } = pointerRef.current;
			setCursorVisible(!!origin_0 && x_1 >= origin_0.left && x_1 <= origin_0.right && y_1 >= origin_0.top && y_1 <= origin_0.bottom);
			paint();
		};
		$[16] = armed;
		$[17] = paint;
		$[18] = pointer;
		$[19] = viewportRef;
		$[20] = t8;
	} else t8 = $[20];
	(0, import_react.useLayoutEffect)(t8);
	let t10;
	let t9;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
		t10 = [];
		$[21] = t10;
		$[22] = t9;
	} else {
		t10 = $[21];
		t9 = $[22];
	}
	(0, import_react.useEffect)(t9, t10);
	let t11;
	if ($[23] !== paint || $[24] !== targetAt || $[25] !== viewportRef) {
		t11 = (x_2, y_2) => {
			const viewport = viewportRef.current;
			if (!viewport) return false;
			const origin_1 = viewport.getBoundingClientRect();
			originRef.current = origin_1;
			pointerRef.current = {
				x: x_2,
				y: y_2
			};
			pressTargetRef.current = targetAt(x_2, y_2);
			const { scale: scale_0, positionX: positionX_0, positionY: positionY_0 } = getCamera();
			dragRef.current = {
				startX: (x_2 - origin_1.left - positionX_0) / scale_0,
				startY: (y_2 - origin_1.top - positionY_0) / scale_0
			};
			if (cutoutRef.current) cutoutRef.current.style.display = "block";
			paint();
			return true;
		};
		$[23] = paint;
		$[24] = targetAt;
		$[25] = viewportRef;
		$[26] = t11;
	} else t11 = $[26];
	const startDrag = t11;
	let t12;
	if ($[27] !== endDrag || $[28] !== onCapture || $[29] !== onPickElement) {
		t12 = async (x_3, y_3) => {
			const drag_0 = dragRef.current;
			const origin_2 = originRef.current;
			if (!drag_0 || !origin_2) return;
			const { scale: scale_1, positionX: positionX_1, positionY: positionY_1 } = getCamera();
			const endX = (x_3 - origin_2.left - positionX_1) / scale_1;
			const endY = (y_3 - origin_2.top - positionY_1) / scale_1;
			const dragged = pastDragThreshold((endX - drag_0.startX) * scale_1, (endY - drag_0.startY) * scale_1);
			const picked = pressTargetRef.current;
			pressTargetRef.current = null;
			endDrag();
			if (dragged) {
				const width = Math.abs(endX - drag_0.startX);
				const height = Math.abs(endY - drag_0.startY);
				onCapture({
					x: Math.round(Math.min(drag_0.startX, endX)),
					y: Math.round(Math.min(drag_0.startY, endY)),
					width: Math.round(width),
					height: Math.round(height)
				});
				return;
			}
			if (!picked) return;
			if (picked.kind === "layer") {
				onPickElement?.(picked.id);
				return;
			}
			const probe_0 = picked.kind === "live" ? liveProbeFor(picked.el) : void 0;
			const liveHit = probe_0 ? await probe_0(x_3, y_3).catch(_temp2$57) : null;
			const box_1 = picked.kind === "live" ? liveHit : boxOf(picked.el);
			if (!box_1) return;
			onCapture({
				x: Math.round((box_1.left - origin_2.left - positionX_1) / scale_1),
				y: Math.round((box_1.top - origin_2.top - positionY_1) / scale_1),
				width: Math.round(box_1.width / scale_1),
				height: Math.round(box_1.height / scale_1)
			}, liveHit?.fingerprint);
		};
		$[27] = endDrag;
		$[28] = onCapture;
		$[29] = onPickElement;
		$[30] = t12;
	} else t12 = $[30];
	const releaseDrag = t12;
	let t13;
	if ($[31] !== endDrag || $[32] !== register || $[33] !== releaseDrag || $[34] !== schedulePaint || $[35] !== startDrag) {
		t13 = () => {
			register({
				begin: (at) => startDrag(at.x, at.y),
				move(at_0) {
					pointerRef.current = {
						x: at_0.x,
						y: at_0.y
					};
					schedulePaint();
				},
				end: (commit, at_1) => commit ? void releaseDrag(at_1.x, at_1.y) : endDrag()
			});
			return () => register(null);
		};
		$[31] = endDrag;
		$[32] = register;
		$[33] = releaseDrag;
		$[34] = schedulePaint;
		$[35] = startDrag;
		$[36] = t13;
	} else t13 = $[36];
	(0, import_react.useLayoutEffect)(t13);
	if (!armed) return null;
	let t14;
	let t15;
	let t16;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = {
			position: "absolute",
			inset: 0,
			zIndex: 70,
			pointerEvents: "auto",
			touchAction: "none",
			userSelect: "none",
			cursor: "none"
		};
		t15 = () => setCursorVisible(true);
		t16 = () => {
			if (dragRef.current) return;
			setCursorVisible(false);
			if (hoverRef.current) hoverRef.current.style.display = "none";
		};
		$[37] = t14;
		$[38] = t15;
		$[39] = t16;
	} else {
		t14 = $[37];
		t15 = $[38];
		t16 = $[39];
	}
	let t17;
	if ($[40] !== schedulePaint) {
		t17 = (e) => {
			pointerRef.current = {
				x: e.clientX,
				y: e.clientY
			};
			schedulePaint();
		};
		$[40] = schedulePaint;
		$[41] = t17;
	} else t17 = $[41];
	let t18;
	if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hoverRef,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				display: "none",
				outline: "1px solid var(--ed-canvas-selection)",
				pointerEvents: "none",
				willChange: "transform"
			}
		});
		$[42] = t18;
	} else t18 = $[42];
	let t19;
	if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: cutoutRef,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				display: "none",
				boxShadow: `0 0 0 200vmax ${DIM$1}`,
				outline: "1px solid rgba(255, 255, 255, 0.9)",
				pointerEvents: "none",
				willChange: "transform"
			}
		});
		$[43] = t19;
	} else t19 = $[43];
	let t20;
	if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = {
			position: "absolute",
			left: 0,
			top: 0,
			display: "none",
			pointerEvents: "none",
			willChange: "transform"
		};
		$[44] = t20;
	} else t20 = $[44];
	let t21;
	if ($[45] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = {
			position: "absolute",
			left: -11,
			top: -11,
			overflow: "visible"
		};
		$[45] = t21;
	} else t21 = $[45];
	let t22;
	let t23;
	if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: CENTER,
			cy: CENTER,
			r: 7,
			fill: "rgba(128, 128, 128, 0.4)",
			shapeRendering: "geometricPrecision"
		});
		t23 = [
			`M${CENTER} 0V10`,
			`M${CENTER} 13V${CURSOR_SIZE}`,
			`M0 ${CENTER}H10`,
			`M13 ${CENTER}H${CURSOR_SIZE}`
		];
		$[46] = t22;
		$[47] = t23;
	} else {
		t22 = $[46];
		t23 = $[47];
	}
	let t24;
	if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: cursorRef,
			"aria-hidden": true,
			style: t20,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: CURSOR_SIZE,
				height: CURSOR_SIZE,
				viewBox: `0 0 ${CURSOR_SIZE} ${CURSOR_SIZE}`,
				style: t21,
				shapeRendering: "crispEdges",
				children: [t22, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: t23.join(""),
					stroke: "#111",
					strokeWidth: 1
				})]
			})
		});
		$[48] = t24;
	} else t24 = $[48];
	let t25;
	if ($[49] !== t17) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-region-mask": "",
			style: t14,
			onPointerEnter: t15,
			onPointerLeave: t16,
			onPointerMove: t17,
			children: [
				t18,
				t19,
				t24
			]
		}) });
		$[49] = t17;
		$[50] = t25;
	} else t25 = $[50];
	return t25;
}
function _temp2$57() {
	return null;
}
function _temp$89(el) {
	return !el.closest(CHROME);
}

export { CanvasRegionMask };
