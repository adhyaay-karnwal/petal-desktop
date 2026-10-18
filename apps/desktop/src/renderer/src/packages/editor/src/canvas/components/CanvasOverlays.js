// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasOverlays.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { CrosshairIcon, CursorIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { m$8 } from "../../../../../vendor/@phosphor-icons/react.js";
import { InlineRenameInput } from "../../../../ui/src/components/InlineRenameInput.js";
import { ROOT } from "../../../../compiler/src/store/types.js";
import { getById, getParentId, getRootIds, isTextOwner } from "../../../../compiler/src/store/read.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { hasMultiRootContents, measureVisibleBounds, resolveObservedElements, resolveVisibleElement$1 } from "../../shared/utils/visibleElement.js";
import { accumulatedLinearTransformString, transformLinearMatrix } from "../utils/transformMatrix.js";
import { isInsideComponentEdit } from "../utils/captureComponentInstance.js";
import { getVisibleTree, usePages } from "../../shared/state/pages.js";
import { useWebviewEditValue } from "../../shared/state/webviewEditStore.js";
import { parseTransformControls, topEdgeOfRotatedBox, withTransformRotation } from "../../shared/utils/transformControls.js";
import { useHover } from "../../shared/state/hover.js";
import { subscribeHoverPreview } from "../../shared/state/hoverPreviewChannel.js";
import { getLiveSize, subscribeLiveSize } from "../../shared/state/liveSizeChannel.js";
import { applyTextHighlight } from "../utils/textHighlight.js";
import { componentSelectionTone } from "../utils/componentSelectionTone.js";
import { getCanvasHandleGesture } from "../input/inputState.js";

function paintViewOf(overlayMode) {
	return overlayMode ? getCamera() : {
		scale: 1,
		positionX: 0,
		positionY: 0
	};
}
var ROTATE_CORNER_BASE = {
	nw: 270,
	ne: 0,
	se: 90,
	sw: 180
};
var SELECTION_UNDERLINE = {
	line: "underline",
	color: "var(--ed-canvas-selection)",
	thickness: "1px"
};
function readTextDecoration(el) {
	return {
		line: el.style.textDecorationLine,
		color: el.style.textDecorationColor,
		thickness: el.style.textDecorationThickness
	};
}
function isSameTextDecoration(a, b) {
	return a.line === b.line && a.color === b.color && a.thickness === b.thickness;
}
function canvasOutlineClass(opts) {
	if (opts.isEdit) return "outline-ed-canvas-component-edit";
	if (opts.isMissingComponent) return "outline-ed-canvas-missing";
	if (opts.isComponent) return "outline-ed-canvas-component";
	if (opts.isWebview) return "outline-ed-canvas-webview";
	return "outline-ed-canvas-selection";
}
function canvasLabelClass(opts) {
	if (opts.isEdit) return "text-ed-canvas-component-edit";
	if (opts.isMissingComponent) return "text-ed-canvas-missing";
	if (opts.isComponent) return "text-ed-canvas-component";
	if (opts.isWebview) return "text-ed-canvas-webview";
	return "text-ed-canvas-selection";
}
function canvasToneOf(store, id) {
	const { isComponent, isMissingComponent } = componentSelectionTone(store, id);
	return {
		isEdit: isInsideComponentEdit(store, id),
		isMissingComponent,
		isComponent,
		isWebview: getById(store, id)?.type === "webview"
	};
}
function canvasOutlineColor(opts) {
	if (opts.isEdit) return "var(--ed-canvas-component-edit)";
	if (opts.isMissingComponent) return "var(--ed-canvas-missing)";
	if (opts.isComponent) return "var(--ed-canvas-component)";
	if (opts.isWebview) return "var(--ed-canvas-webview)";
	return "var(--ed-canvas-selection)";
}
var RESIZE_NWSE_INNER = `<g fill="none" transform="translate(9 9)"><path d="m4.257 7.087 4.072 4.068-2.829 2.828 8.473-.013.013-8.47-2.841 2.842-4.075-4.068-1.414-1.415 2.844-2.842h-8.486v8.484l2.829-2.827z" fill="#fff"/><path d="m5.317 6.733 4.427 4.424-1.828 1.828 5.056-.016.014-5.054-1.842 1.841-4.428-4.422-2.474-2.475 1.844-1.843h-5.073v5.071l1.83-1.828z" fill="#000"/></g>`;
var RESIZE_NESW_INNER = `<g fill="none" transform="translate(9 9)"><path d="m9.743 7.087-4.072 4.068 2.829 2.828-8.473-.013-.013-8.47 2.841 2.842 4.075-4.068 1.414-1.415-2.844-2.842h8.486v8.484l-2.83-2.827z" fill="#fff"/><path d="m8.683 6.733-4.427 4.424 1.828 1.828-5.056-.016-.014-5.054 1.842 1.841 4.428-4.422 2.474-2.475-1.844-1.843h5.073v5.071l-1.83-1.828z" fill="#000"/></g>`;
var ROTATE_INNER = "<g transform=\"translate(16 16) scale(0.25) translate(-50 -50)\"><path fill=\"none\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" vector-effect=\"non-scaling-stroke\" d=\"m77.1 90.3 13.9-21.8h-12.1c0.1-17.9-10.2-36.5-27.3-43.1-4.8-2.4-10.6-4.5-19.9-4.5v-11.8l-22.2 14.2 21.9 14.3 0.2-11.8c20.3 0 38.3 14.7 42.7 33.6 0.5 2.8 0.7 6 0.7 9.1h-13l14.4 21.8h0.7z\"/><path fill=\"#010202\" d=\"m76.7 90.3 13.9-21.9h-11.8c0.2-17.8-10.2-36.4-27.2-43-4.8-2.4-10.6-4.2-20.2-4.2v-12.1l-21.9 14.2 21.6 14.2 0.1-12.1c20.4 0 38.4 14.4 42.7 34 0.5 2.8 0.7 5.9 0.7 8.8h-12.6l14.3 22.1h0.4z\"/></g>";
var cursorCache = /* @__PURE__ */ new Map();
function buildRotatedCursor(inner, rotationDeg, fallback = "alias", matrix = null) {
	const q = (Math.round(rotationDeg) % 360 + 360) % 360;
	const key = `${inner}:${q}:${fallback}:${matrix ? matrix.map((n) => +n.toFixed(3)).join(",") : ""}`;
	const cached = cursorCache.get(key);
	if (cached) return cached;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">${matrix ? `<g transform="translate(16 16) matrix(${matrix[0]} ${matrix[1]} ${matrix[2]} ${matrix[3]} 0 0) translate(-16 -16)">` : ""}<g transform="rotate(${q} 16 16)">${inner}</g>${matrix ? "</g>" : ""}</svg>`;
	const url = `url("data:image/svg+xml;base64,${typeof btoa === "function" ? btoa(svg) : ""}") 16 16, ${fallback}`;
	cursorCache.set(key, url);
	return url;
}
function angleFromTransformString(t) {
	if (!t || t === "none") return 0;
	const m = t.match(/^matrix\(([^)]+)\)$/);
	if (!m) return 0;
	const p = m[1].split(",").map((s) => parseFloat(s.trim()));
	if (p.length < 4 || Number.isNaN(p[0]) || Number.isNaN(p[1])) return 0;
	return Math.atan2(p[1], p[0]) * 180 / Math.PI;
}
function parseLinearMatrix(t) {
	const id = {
		a: 1,
		b: 0,
		c: 0,
		d: 1
	};
	if (!t || t === "none") return id;
	const m = t.match(/^matrix\(([^)]+)\)$/);
	if (!m) return id;
	const p = m[1].split(",").map((s) => parseFloat(s.trim()));
	if (p.length < 4 || p.slice(0, 4).some((n) => Number.isNaN(n))) return id;
	return {
		a: p[0],
		b: p[1],
		c: p[2],
		d: p[3]
	};
}
function isReflectedTransform(t) {
	const m = parseLinearMatrix(t);
	return m.a * m.d - m.b * m.c < 0;
}
var ROTATE_CURSOR_FALLBACK = "alias";
var RESIZE_CURSOR_FALLBACK_NWSE = "nwse-resize";
var RESIZE_CURSOR_FALLBACK_NESW = "nesw-resize";
var RESIZE_CURSOR_FALLBACK_EW = "ew-resize";
var RESIZE_CURSOR_FALLBACK_NS = "ns-resize";
var toCanvasX = (x, v) => (x - v.originX - v.positionX) / v.scale;
var toCanvasY = (y, v) => (y - v.originY - v.positionY) / v.scale;
/**
* Live view for a measurement pass, or null while the origin has no box yet.
*
* The transform is read off the DOM rather than taken from React state or the
* pan library's own state. Everything else here is a DOM read, and unprojecting
* a DOM rect with a transform captured at a different instant bakes a permanent
* error into the stored canvas-space geom — permanent because canvas space is
* never recomputed on a view change. `at` is only the fallback for the
* no-pan/zoom case, where there is no transform component to read.
*/
function readMeasureView(at, originEl) {
	if (!originEl) return null;
	const o = originEl.getBoundingClientRect();
	const component = document.querySelector(".react-transform-component");
	const live = component ? new DOMMatrix(getComputedStyle(component).transform) : null;
	return {
		scale: live?.a ?? at?.scale ?? 1,
		positionX: live?.e ?? at?.positionX ?? 0,
		positionY: live?.f ?? at?.positionY ?? 0,
		originX: o.left,
		originY: o.top
	};
}
/**
* Canvas-space geom → the overlay container's own pixels at `at`.
*
* Geoms are stored in canvas space (layout px, relative to the canvas content
* at identity pan/zoom) precisely so a pan or a zoom cannot invalidate them —
* the view only enters here, at paint.
*/
function projectGeom(g, at) {
	const s = at.scale;
	const m = parseLinearMatrix(g.transform);
	const x = Math.hypot(m.a, m.b) || 1;
	const y = Math.hypot(m.c, m.d) || 1;
	return {
		centerX: g.centerX * s + at.positionX,
		centerY: g.centerY * s + at.positionY,
		width: g.width * s * x,
		height: g.height * s * y,
		transform: g.transform === "none" ? "none" : `matrix(${m.a / x}, ${m.b / x}, ${m.c / y}, ${m.d / y}, 0, 0)`
	};
}
function topEdge(geom) {
	const e = topEdgeOfRotatedBox(geom.centerX, geom.centerY, geom.width, geom.height, geom.transform);
	return {
		anchor: {
			x: e.x,
			y: e.y
		},
		angleDeg: e.angleDeg,
		length: e.length
	};
}
/** Canvas-space slack: layout rounding leaves hairline gaps between two edges
*  that are meant to be flush. */
var LABEL_ANCHOR_EPSILON = 1;
/** One label line, in screen px — labels sharing an anchor stack by this much. */
var LABEL_STACK_STEP = 18;
/**
* True when two elements would anchor their name labels at the same point.
* Every label hangs off its element's top edge, so a child flush with its
* parent's top stacks the two labels into one unreadable string. Compared in
* canvas space, so the answer does not change with pan or zoom.
*/
function labelAnchorsCoincide(a, b) {
	const p = topEdge(a).anchor;
	const q = topEdge(b).anchor;
	return Math.abs(p.x - q.x) <= LABEL_ANCHOR_EPSILON && Math.abs(p.y - q.y) <= LABEL_ANCHOR_EPSILON;
}
function readRotatedGeom(el, view, walkCache) {
	const aabb = el.getBoundingClientRect();
	const centerX = toCanvasX(aabb.left + aabb.width / 2, view);
	const centerY = toCanvasY(aabb.top + aabb.height / 2, view);
	const aabbWidth = aabb.width / view.scale;
	const aabbHeight = aabb.height / view.scale;
	const accumulated = accumulatedLinearTransformString(el, walkCache);
	if (accumulated === "none") return {
		centerX,
		centerY,
		width: aabbWidth,
		height: aabbHeight,
		transform: "none"
	};
	const html = el;
	return {
		centerX,
		centerY,
		width: html.offsetWidth || aabbWidth,
		height: html.offsetHeight || aabbHeight,
		transform: accumulated
	};
}
/**
* A box's rect plus the canvas transform it was measured at, serialised onto the
* node. Lets the per-frame sync re-project it from the live transform without
* re-measuring, re-rendering, or reading back styles it wrote itself.
*/
function overlayBaseAttr(rect, at) {
	return `${rect.left},${rect.top},${rect.width},${rect.height},${at.scale},${at.positionX},${at.positionY}`;
}
function readElementGeom(source, view, walkCache) {
	function geomFromAabb(aabb) {
		const left = toCanvasX(aabb.left, view);
		const top = toCanvasY(aabb.top, view);
		const width = aabb.width / view.scale;
		const height = aabb.height / view.scale;
		return {
			centerX: left + width / 2,
			centerY: top + height / 2,
			width,
			height,
			transform: "none"
		};
	}
	if (!(source instanceof Element)) {
		if (source.observed.length > 1) {
			let left = Infinity;
			let top = Infinity;
			let right = -Infinity;
			let bottom = -Infinity;
			let found = false;
			for (const o of source.observed) {
				const r = o.getBoundingClientRect();
				if (r.width <= 0 && r.height <= 0) continue;
				found = true;
				left = Math.min(left, r.left);
				top = Math.min(top, r.top);
				right = Math.max(right, r.right);
				bottom = Math.max(bottom, r.bottom);
			}
			return geomFromAabb(found ? new DOMRect(left, top, right - left, bottom - top) : new DOMRect(0, 0, 0, 0));
		}
		return readRotatedGeom(source.resolved, view, walkCache);
	}
	if (hasMultiRootContents(source)) return geomFromAabb(measureVisibleBounds(source));
	return readRotatedGeom(resolveVisibleElement$1(source), view, walkCache);
}
/**
* HoverOverlay — the one React reader of the hover store, so the parent (Canvas)
* never re-renders on hover.
*/
function HoverOverlay(t0) {
	const $ = (0, import_compiler_runtime.c)(30);
	const { selectedElementIds, overlayMode: t1, canvasRef } = t0;
	const overlayMode = t1 === void 0 ? false : t1;
	const store = usePages(_temp$97);
	const hoverElementId = useHover(_temp2$61);
	const [measuredHover, setMeasuredHover] = (0, import_react.useState)(null);
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [];
		$[0] = t2;
	} else t2 = $[0];
	(0, import_react.useEffect)(_temp4$37, t2);
	const hoverIsActive = !!hoverElementId && !selectedElementIds.has(hoverElementId);
	let t3;
	let t4;
	if ($[1] !== canvasRef || $[2] !== hoverElementId || $[3] !== overlayMode || $[4] !== selectedElementIds) {
		t3 = () => {
			if (!hoverElementId || selectedElementIds.has(hoverElementId)) return;
			const domEl = document.querySelector(`[data-element-id="${hoverElementId}"]`);
			if (!domEl) return;
			const measure = () => {
				const view = readMeasureView(getCamera(), overlayMode ? document.querySelector("[data-overlay-container]") : canvasRef?.current ?? null);
				if (!view) return;
				setMeasuredHover({
					id: hoverElementId,
					geom: readElementGeom(domEl, view)
				});
			};
			measure();
			let raf = null;
			const schedule = () => {
				if (raf !== null) return;
				raf = requestAnimationFrame(() => {
					raf = null;
					measure();
				});
			};
			const observer = new ResizeObserver(schedule);
			observer.observe(resolveVisibleElement$1(domEl));
			const container = document.querySelector("[data-overlay-container]");
			if (container) observer.observe(container);
			return () => {
				if (raf !== null) cancelAnimationFrame(raf);
				observer.disconnect();
			};
		};
		t4 = [
			hoverElementId,
			selectedElementIds,
			resolveVisibleElement$1,
			canvasRef,
			overlayMode
		];
		$[1] = canvasRef;
		$[2] = hoverElementId;
		$[3] = overlayMode;
		$[4] = selectedElementIds;
		$[5] = t3;
		$[6] = t4;
	} else {
		t3 = $[5];
		t4 = $[6];
	}
	(0, import_react.useLayoutEffect)(t3, t4);
	const hoverGeom = hoverIsActive && measuredHover?.id === hoverElementId ? measuredHover.geom : null;
	let t5;
	let t6;
	if ($[7] !== hoverElementId || $[8] !== selectedElementIds || $[9] !== store) {
		t5 = () => {
			if (!hoverElementId || selectedElementIds.has(hoverElementId)) return;
			if (getParentId(store, hoverElementId) !== "ROOT") return;
			const text = document.querySelector(`[data-root-label-id="${CSS.escape(hoverElementId)}"] > *`);
			if (!text) return;
			const prev = {
				color: text.style.color,
				letterSpacing: text.style.letterSpacing
			};
			text.style.color = canvasOutlineColor(canvasToneOf(store, hoverElementId));
			text.style.letterSpacing = "calc(-0.01em + 0.01px)";
			return () => {
				text.style.color = prev.color;
				text.style.letterSpacing = prev.letterSpacing;
			};
		};
		t6 = [
			hoverElementId,
			selectedElementIds,
			store
		];
		$[7] = hoverElementId;
		$[8] = selectedElementIds;
		$[9] = store;
		$[10] = t5;
		$[11] = t6;
	} else {
		t5 = $[10];
		t6 = $[11];
	}
	(0, import_react.useEffect)(t5, t6);
	let t7;
	let t8;
	if ($[12] !== hoverElementId || $[13] !== selectedElementIds) {
		t7 = () => {
			if (!hoverElementId || !selectedElementIds.has(hoverElementId)) return;
			const box = document.querySelector(`[data-selection-overlay-id="${CSS.escape(hoverElementId)}"]`);
			if (!box) return;
			const prev_0 = box.style.outlineWidth;
			box.style.outlineWidth = "2px";
			return () => {
				box.style.outlineWidth = prev_0;
			};
		};
		t8 = [hoverElementId, selectedElementIds];
		$[12] = hoverElementId;
		$[13] = selectedElementIds;
		$[14] = t7;
		$[15] = t8;
	} else {
		t7 = $[14];
		t8 = $[15];
	}
	(0, import_react.useEffect)(t7, t8);
	let t10;
	let t9;
	if ($[16] !== hoverElementId || $[17] !== selectedElementIds || $[18] !== store) {
		t9 = () => {
			if (!hoverElementId || selectedElementIds.has(hoverElementId)) return;
			if (!isTextOwner(store, hoverElementId)) return;
			const domEl_0 = document.querySelector(`[data-element-id="${hoverElementId}"]`);
			if (!domEl_0) return;
			return applyTextHighlight(domEl_0, "2px");
		};
		t10 = [
			hoverElementId,
			selectedElementIds,
			store
		];
		$[16] = hoverElementId;
		$[17] = selectedElementIds;
		$[18] = store;
		$[19] = t10;
		$[20] = t9;
	} else {
		t10 = $[19];
		t9 = $[20];
	}
	(0, import_react.useEffect)(t9, t10);
	if (!hoverElementId || selectedElementIds.has(hoverElementId) || !hoverGeom) return null;
	let t11;
	let t12;
	if ($[21] !== hoverElementId || $[22] !== hoverGeom || $[23] !== overlayMode || $[24] !== store) {
		t12 = Symbol.for("react.early_return_sentinel");
		bb0: {
			const hoveredElement = getById(store, hoverElementId);
			if (!hoveredElement) {
				t12 = null;
				break bb0;
			}
			const view_0 = paintViewOf(overlayMode);
			const paintGeom = projectGeom(hoverGeom, view_0);
			const relativeRect = {
				left: paintGeom.centerX - paintGeom.width / 2,
				top: paintGeom.centerY - paintGeom.height / 2,
				width: paintGeom.width,
				height: paintGeom.height
			};
			const hoverTone = canvasToneOf(store, hoverElementId);
			let t13;
			if ($[27] !== hoverElementId || $[28] !== store) {
				t13 = isTextOwner(store, hoverElementId);
				$[27] = hoverElementId;
				$[28] = store;
				$[29] = t13;
			} else t13 = $[29];
			const isText = t13;
			const childRects = [];
			const hoveredChildIds = hoveredElement ? store.childrenByParent.get(hoveredElement.id) ?? [] : [];
			if (hoveredElement && !isText && hoveredChildIds.length > 0) {
				const childView = readMeasureView(getCamera(), overlayMode ? document.querySelector("[data-overlay-container]") : document.querySelector("[data-canvas-content]"));
				const childWalkCache = /* @__PURE__ */ new Map();
				for (const childId of childView ? hoveredChildIds : []) {
					const childDom = document.querySelector(`[data-element-id="${childId}"]`);
					if (childDom) {
						const childGeom = projectGeom(readRotatedGeom(resolveVisibleElement$1(childDom), childView, childWalkCache), view_0);
						childRects.push({
							id: childId,
							rect: {
								left: childGeom.centerX - childGeom.width / 2,
								top: childGeom.centerY - childGeom.height / 2,
								width: childGeom.width,
								height: childGeom.height
							},
							transform: childGeom.transform
						});
					}
				}
			}
			t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!isText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-hover-outline-id": hoverElementId,
				"data-ov-base": overlayBaseAttr(relativeRect, view_0),
				className: cn$2("absolute pointer-events-none outline outline-[2px]", canvasOutlineClass(hoverTone)),
				style: {
					left: relativeRect.left,
					top: relativeRect.top,
					width: relativeRect.width,
					height: relativeRect.height,
					transform: paintGeom.transform === "none" ? void 0 : paintGeom.transform,
					transformOrigin: "center center"
				}
			}), childRects.map((t14) => {
				const { id, rect, transform: childTransform } = t14;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute pointer-events-none",
					"data-hover-child-id": id,
					"data-ov-base": overlayBaseAttr(rect, view_0),
					style: {
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height,
						outline: "1px dashed",
						outlineColor: canvasOutlineColor(hoverTone),
						outlineOffset: "-1px",
						transform: childTransform === "none" ? void 0 : childTransform,
						transformOrigin: "center center"
					}
				}, `hover-child-${id}`);
			})] });
		}
		$[21] = hoverElementId;
		$[22] = hoverGeom;
		$[23] = overlayMode;
		$[24] = store;
		$[25] = t11;
		$[26] = t12;
	} else {
		t11 = $[25];
		t12 = $[26];
	}
	if (t12 !== Symbol.for("react.early_return_sentinel")) return t12;
	return t11;
}
/** A rotate drag's pointer sample: screen px, and whether Shift snaps to 15°. */
function _temp4$37() {
	return _temp3$43;
}
function _temp3$43() {
	return useHover.getState().clearHover();
}
function _temp2$61(s_0) {
	return s_0.hoveredId;
}
function _temp$97(s) {
	return s.visibleTree;
}
/**
* Starts a rotate drag from a press on a corner's rotate zone, or returns null
* when the element or its geometry is gone. The canvas input machine runs it.
*/
function beginRotate({ store, elementId, corner, geoms, overlayMode, pointer, setCursor, onCommit }) {
	const element = getById(store, elementId);
	if (!element) return null;
	const geom = geoms.get(elementId);
	if (!geom) return null;
	const styles = element.styles || {};
	const transformParts = parseTransformControls(styles.transform);
	const rawDomElement = document.querySelector(`[data-element-id="${elementId}"]`);
	if (!rawDomElement) return null;
	const domElement = resolveVisibleElement$1(rawDomElement);
	const rect = domElement.getBoundingClientRect();
	const startScreenCenter = {
		x: rect.x + rect.width / 2,
		y: rect.y + rect.height / 2
	};
	const cornerBaseDeg = ROTATE_CORNER_BASE[corner];
	const oldOwnMatrix = transformLinearMatrix(getComputedStyle(domElement).transform);
	const oldAccMatrix = geom.transform && geom.transform !== "none" ? new DOMMatrix(geom.transform) : new DOMMatrix();
	const ancestorMatrix = oldAccMatrix.multiply(oldOwnMatrix.inverse());
	const [ox, oy] = getComputedStyle(domElement).transformOrigin.split(" ").map(parseFloat);
	const dx = ox - domElement.offsetWidth / 2, dy = oy - domElement.offsetHeight / 2;
	const zoom = getCamera().scale || 1;
	const centerX = startScreenCenter.x + (oldAccMatrix.a * dx + oldAccMatrix.c * dy) * zoom;
	const centerY = startScreenCenter.y + (oldAccMatrix.b * dx + oldAccMatrix.d * dy) * zoom;
	const startPointerAngle = Math.atan2(pointer.clientY - centerY, pointer.clientX - centerX);
	const startGeomCenter = {
		x: geom.centerX,
		y: geom.centerY
	};
	const baseTransform = styles.transform || "";
	const overlayElement = document.querySelector(`[data-selection-overlay-id="${CSS.escape(elementId)}"]`);
	const labelElement = document.querySelector(`[data-selection-label-id="${CSS.escape(elementId)}"]`);
	const originals = [
		domElement,
		overlayElement,
		labelElement
	].flatMap((node) => node ? [{
		node,
		cssText: node.style.cssText
	}] : []);
	let latestTransform = baseTransform;
	let last = null;
	let raf = null;
	const apply = () => {
		raf = null;
		const e = last;
		if (!e) return;
		const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
		let next = transformParts.rotate + (angle - startPointerAngle) * 180 / Math.PI;
		if (e.shiftKey) next = Math.round(next / 15) * 15;
		else next = +next.toFixed(2);
		next = ((next + 180) % 360 + 360) % 360 - 180;
		if (!e.shiftKey) next = +next.toFixed(2);
		const composed = withTransformRotation(transformParts, next);
		latestTransform = composed;
		domElement.style.transform = composed || "";
		setCursor(buildRotatedCursor(ROTATE_INNER, cornerBaseDeg + next, ROTATE_CURSOR_FALLBACK));
		const newOwn = transformLinearMatrix(composed);
		const newAcc = ancestorMatrix.multiply(newOwn);
		const newTransform = newAcc.a === 1 && newAcc.b === 0 && newAcc.c === 0 && newAcc.d === 1 ? "none" : `matrix(${newAcc.a}, ${newAcc.b}, ${newAcc.c}, ${newAcc.d}, 0, 0)`;
		const old = geoms.get(elementId);
		if (old) {
			const live = domElement.getBoundingClientRect();
			const liveZoom = getCamera().scale || 1;
			const painted = projectGeom({
				...old,
				transform: newTransform,
				centerX: startGeomCenter.x + (live.x + live.width / 2 - startScreenCenter.x) / liveZoom,
				centerY: startGeomCenter.y + (live.y + live.height / 2 - startScreenCenter.y) / liveZoom
			}, paintViewOf(overlayMode));
			if (overlayElement) Object.assign(overlayElement.style, {
				left: `${painted.centerX - painted.width / 2}px`,
				top: `${painted.centerY - painted.height / 2}px`,
				width: `${painted.width}px`,
				height: `${painted.height}px`,
				transform: painted.transform === "none" ? "" : painted.transform
			});
			if (labelElement) {
				const edge = topEdge(painted);
				labelElement.style.left = `${edge.anchor.x}px`;
				labelElement.style.top = `${edge.anchor.y}px`;
				labelElement.style.transform = `rotate(${edge.angleDeg}deg)`;
				capSelectionLabel(labelElement, edge.length);
			}
		}
	};
	setCursor(buildRotatedCursor(ROTATE_INNER, cornerBaseDeg + transformParts.rotate, ROTATE_CURSOR_FALLBACK));
	return {
		move(next) {
			last = next;
			if (raf !== null) return;
			raf = requestAnimationFrame(apply);
		},
		end(commit) {
			if (raf !== null) {
				cancelAnimationFrame(raf);
				raf = null;
			}
			if (!commit) {
				for (const { node, cssText } of originals) node.style.cssText = cssText;
				return;
			}
			if (last) apply();
			if (latestTransform === baseTransform) return;
			const newStyles = { ...styles };
			if (latestTransform) newStyles.transform = latestTransform;
			else delete newStyles.transform;
			onCommit?.(elementId, newStyles);
		}
	};
}
/** A rotate drag is running. Geoms stay as they were at its start. */
var isRotating = () => getCanvasHandleGesture() === "rotate";
/**
* Outlines the layers an inspector control would act on while the pointer is
* over it (see publishHoverPreview). Measured once per preview: the pointer is
* on the inspector, so the view doesn't move underneath it.
*/
function HoverPreviewOverlay(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { overlayMode: t1, canvasRef } = t0;
	const overlayMode = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [];
		$[0] = t2;
	} else t2 = $[0];
	const [geoms, setGeoms] = (0, import_react.useState)(t2);
	let t3;
	let t4;
	if ($[1] !== canvasRef || $[2] !== overlayMode) {
		t3 = () => subscribeHoverPreview((ids) => {
			const view = readMeasureView(getCamera(), overlayMode ? document.querySelector("[data-overlay-container]") : canvasRef.current);
			if (!view || ids.length === 0) {
				setGeoms([]);
				return;
			}
			const walkCache = /* @__PURE__ */ new Map();
			const tree = getVisibleTree();
			const next = [];
			for (const id of ids) {
				const domEl = document.querySelector(`[data-element-id="${CSS.escape(id)}"]`);
				if (domEl) next.push({
					id,
					geom: readElementGeom(domEl, view, walkCache),
					outline: canvasOutlineClass(canvasToneOf(tree, id))
				});
			}
			setGeoms(next);
		});
		t4 = [overlayMode, canvasRef];
		$[1] = canvasRef;
		$[2] = overlayMode;
		$[3] = t3;
		$[4] = t4;
	} else {
		t3 = $[3];
		t4 = $[4];
	}
	(0, import_react.useEffect)(t3, t4);
	if (geoms.length === 0) return null;
	let t5;
	if ($[5] !== geoms || $[6] !== overlayMode) {
		const view_0 = paintViewOf(overlayMode);
		t5 = geoms.map((t6) => {
			const { id: id_0, geom, outline } = t6;
			const paint = projectGeom(geom, view_0);
			const rect = {
				left: paint.centerX - paint.width / 2,
				top: paint.centerY - paint.height / 2,
				width: paint.width,
				height: paint.height
			};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-ov-base": overlayBaseAttr(rect, view_0),
				className: cn$2("absolute pointer-events-none outline outline-[1px]", outline),
				style: {
					...rect,
					transform: paint.transform === "none" ? void 0 : paint.transform,
					transformOrigin: "center center"
				}
			}, id_0);
		});
		$[5] = geoms;
		$[6] = overlayMode;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t5 });
		$[8] = t5;
		$[9] = t6;
	} else t6 = $[9];
	return t6;
}
function SelectionOverlay(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { selectedElementIds, overlayMode, noInteract, geoms, resizePreviewRectRef, onUpdateElementProps, onRenameElement } = t0;
	const store = usePages(_temp5$32);
	const [renamingId, setRenamingId] = (0, import_react.useState)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ new Map();
		$[0] = t1;
	} else t1 = $[0];
	const underlinedRef = (0, import_react.useRef)(t1);
	let t2;
	let t3;
	if ($[1] !== selectedElementIds || $[2] !== store) {
		t2 = () => {
			const underlined = underlinedRef.current;
			const targets = /* @__PURE__ */ new Set();
			for (const id of selectedElementIds) {
				if (!isTextOwner(store, id)) continue;
				const el = document.querySelector(`[data-element-id="${id}"]`);
				if (el) targets.add(el);
			}
			for (const [el_0, restore] of underlined) {
				if (targets.has(el_0)) continue;
				restore();
				underlined.delete(el_0);
			}
			for (const el_1 of targets) {
				if (underlined.has(el_1) && isSameTextDecoration(readTextDecoration(el_1), SELECTION_UNDERLINE)) continue;
				underlined.get(el_1)?.();
				underlined.set(el_1, applyTextHighlight(el_1, "1px"));
			}
		};
		t3 = [selectedElementIds, store];
		$[1] = selectedElementIds;
		$[2] = store;
		$[3] = t2;
		$[4] = t3;
	} else {
		t2 = $[3];
		t3 = $[4];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => {
			const underlined_0 = underlinedRef.current;
			return () => {
				for (const restore_0 of underlined_0.values()) restore_0();
				underlined_0.clear();
			};
		};
		t5 = [];
		$[5] = t4;
		$[6] = t5;
	} else {
		t4 = $[5];
		t5 = $[6];
	}
	(0, import_react.useEffect)(t4, t5);
	let t6;
	if ($[7] !== noInteract || $[8] !== onRenameElement || $[9] !== selectedElementIds) {
		t6 = (e, elementId) => {
			if (noInteract) return;
			e.preventDefault();
			if (e.detail === 2 && onRenameElement && selectedElementIds.has(elementId)) setRenamingId(elementId);
		};
		$[7] = noInteract;
		$[8] = onRenameElement;
		$[9] = selectedElementIds;
		$[10] = t6;
	} else t6 = $[10];
	const handleLabelMouseDown = t6;
	let t7;
	if ($[11] !== resizePreviewRectRef) {
		t7 = () => {
			const preview = resizePreviewRectRef?.current;
			if (!preview) return;
			const box = document.querySelector(`[data-selection-overlay-id="${CSS.escape(preview.id)}"]`);
			if (box) {
				box.style.left = `${preview.left}px`;
				box.style.top = `${preview.top}px`;
				box.style.width = `${preview.width}px`;
				box.style.height = `${preview.height}px`;
			}
			const label = document.querySelector(`[data-selection-label-id="${CSS.escape(preview.id)}"]`);
			if (!label) return;
			const edge = topEdgeOfRotatedBox(preview.left + preview.width / 2, preview.top + preview.height / 2, preview.width, preview.height, box?.style.transform);
			label.style.left = `${edge.x}px`;
			label.style.top = `${edge.y}px`;
			label.style.transform = `rotate(${edge.angleDeg}deg)`;
			capSelectionLabel(label, edge.length);
		};
		$[11] = resizePreviewRectRef;
		$[12] = t7;
	} else t7 = $[12];
	(0, import_react.useLayoutEffect)(t7);
	if (selectedElementIds.size === 0) return null;
	let t8;
	if ($[13] !== geoms || $[14] !== handleLabelMouseDown || $[15] !== noInteract || $[16] !== onRenameElement || $[17] !== onUpdateElementProps || $[18] !== overlayMode || $[19] !== renamingId || $[20] !== selectedElementIds || $[21] !== store) {
		const selectionRects = /* @__PURE__ */ new Map();
		for (const id_0 of selectedElementIds) {
			const geom = geoms.get(id_0);
			if (geom) selectionRects.set(id_0, geom);
		}
		const paintView = paintViewOf(overlayMode);
		const overlays = [];
		const isSingleSelection = selectedElementIds.size === 1;
		for (const selectedElementId of selectedElementIds) {
			const selectedElement = getById(store, selectedElementId);
			if (!selectedElement) continue;
			const stored = selectionRects.get(selectedElementId);
			if (!stored) continue;
			const geom_0 = projectGeom(stored, paintView);
			const relativeRect = {
				left: geom_0.centerX - geom_0.width / 2,
				top: geom_0.centerY - geom_0.height / 2,
				width: geom_0.width,
				height: geom_0.height
			};
			const { isComponent, isMissingComponent } = componentSelectionTone(store, selectedElementId);
			const selTone = {
				isEdit: isInsideComponentEdit(store, selectedElementId),
				isMissingComponent,
				isComponent,
				isWebview: selectedElement.type === "webview"
			};
			const isText = isTextOwner(store, selectedElementId);
			const screenAngle = angleFromTransformString(geom_0.transform);
			const reflected = isReflectedTransform(geom_0.transform);
			const m = parseLinearMatrix(geom_0.transform);
			const lenX = Math.hypot(m.a, m.b) || 1;
			const lenY = Math.hypot(m.c, m.d) || 1;
			const normM = [
				m.a / lenX,
				m.b / lenX,
				m.c / lenY,
				m.d / lenY
			];
			const rotateCursor = (corner) => buildRotatedCursor(ROTATE_INNER, ROTATE_CORNER_BASE[corner], ROTATE_CURSOR_FALLBACK, normM);
			const resizeCursor = (diag) => {
				return (reflected ? diag === "nwse" ? "nesw" : "nwse" : diag) === "nwse" ? buildRotatedCursor(RESIZE_NWSE_INNER, screenAngle, RESIZE_CURSOR_FALLBACK_NWSE) : buildRotatedCursor(RESIZE_NESW_INNER, screenAngle, RESIZE_CURSOR_FALLBACK_NESW);
			};
			const edgeCursor = (axis) => axis === "ew" ? buildRotatedCursor(RESIZE_NWSE_INNER, screenAngle - 45, RESIZE_CURSOR_FALLBACK_EW) : buildRotatedCursor(RESIZE_NWSE_INNER, screenAngle + 45, RESIZE_CURSOR_FALLBACK_NS);
			overlays.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-selection-overlay-id": selectedElementId,
				"data-ov-base": overlayBaseAttr(relativeRect, paintView),
				"data-overlay-interactive": "",
				className: cn$2("absolute pointer-events-none outline-[1px]", canvasOutlineClass(selTone)),
				style: {
					left: relativeRect.left,
					top: relativeRect.top,
					width: relativeRect.width,
					height: relativeRect.height,
					transform: geom_0.transform === "none" ? void 0 : geom_0.transform,
					transformOrigin: "center center"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					!noInteract && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute",
							style: {
								left: -18,
								top: -18,
								width: 14,
								height: 14,
								cursor: rotateCursor("nw")
							},
							"data-rotate-handle": "nw"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute",
							style: {
								right: -18,
								top: -18,
								width: 14,
								height: 14,
								cursor: rotateCursor("ne")
							},
							"data-rotate-handle": "ne"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute",
							style: {
								left: -18,
								bottom: -18,
								width: 14,
								height: 14,
								cursor: rotateCursor("sw")
							},
							"data-rotate-handle": "sw"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute",
							style: {
								right: -18,
								bottom: -18,
								width: 14,
								height: 14,
								cursor: rotateCursor("se")
							},
							"data-rotate-handle": "se"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute",
						style: {
							left: 6,
							right: 6,
							top: -3,
							height: 6,
							cursor: edgeCursor("ns")
						},
						"data-resize-handle": "n"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute",
						style: {
							left: 6,
							right: 6,
							bottom: -3,
							height: 6,
							cursor: edgeCursor("ns")
						},
						"data-resize-handle": "s"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute",
						style: {
							top: 6,
							bottom: 6,
							left: -3,
							width: 6,
							cursor: edgeCursor("ew")
						},
						"data-resize-handle": "w"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute",
						style: {
							top: 6,
							bottom: 6,
							right: -3,
							width: 6,
							cursor: edgeCursor("ew")
						},
						"data-resize-handle": "e"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute w-2 h-2 flex items-center justify-center",
						style: {
							left: -4,
							top: -4,
							cursor: resizeCursor("nwse")
						},
						"data-resize-handle": "nw",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-1.5 rounded-[1px] border bg-white",
							style: { borderColor: canvasOutlineColor(selTone) }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute w-2 h-2 flex items-center justify-center",
						style: {
							right: -4,
							top: -4,
							cursor: resizeCursor("nesw")
						},
						"data-resize-handle": "ne",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-1.5 rounded-[1px] border bg-white",
							style: { borderColor: canvasOutlineColor(selTone) }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute w-2 h-2 flex items-center justify-center",
						style: {
							left: -4,
							bottom: -4,
							cursor: resizeCursor("nesw")
						},
						"data-resize-handle": "sw",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-1.5 rounded-[1px] border bg-white",
							style: { borderColor: canvasOutlineColor(selTone) }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute w-2 h-2 flex items-center justify-center",
						style: {
							right: -4,
							bottom: -4,
							cursor: resizeCursor("nwse")
						},
						"data-resize-handle": "se",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-1.5 rounded-[1px] border bg-white",
							style: { borderColor: canvasOutlineColor(selTone) }
						})
					})
				] })
			}, selectedElementId));
			const showName = getParentId(store, selectedElementId) === ROOT;
			const showIframeToggle = selectedElement.type === "html" && selectedElement.tag === "iframe" && !noInteract;
			if (isSingleSelection && !isText && (showName || showIframeToggle)) {
				const edge_0 = topEdge(geom_0);
				const labelText = elementLabelText(selectedElement);
				const isRenaming = showName && renamingId === selectedElementId && !!onRenameElement;
				overlays.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-selection-label-id": selectedElementId,
					"data-overlay-interactive": "",
					"data-ov-base": overlayBaseAttr({
						left: edge_0.anchor.x,
						top: edge_0.anchor.y,
						width: 0,
						height: 0
					}, paintView),
					style: {
						position: "absolute",
						left: edge_0.anchor.x,
						top: edge_0.anchor.y,
						width: 0,
						height: 0,
						transformOrigin: "0 0",
						transform: `rotate(${edge_0.angleDeg}deg)`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn$2("absolute flex items-center gap-1 select-none whitespace-nowrap", !noInteract && "pointer-events-auto"),
						"data-root-label-span": showName ? edge_0.length / paintView.scale : void 0,
						style: {
							left: 0,
							bottom: 1,
							maxWidth: showName ? edge_0.length : void 0
						},
						onMouseDown: (e_0) => handleLabelMouseDown(e_0, selectedElementId),
						children: [
							showName && selectedElement.type === "webview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewModeIcon, { previewId: selectedElementId }),
							showName && (isRenaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								size: "xs",
								className: "text-ed-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineRenameInput, {
									"data-label-control": "",
									"aria-label": `Rename ${labelText}`,
									value: selectedElement.name ?? labelText,
									onCommit: (name) => onRenameElement?.(selectedElementId, name),
									onDone: () => setRenamingId(null),
									className: "min-w-max before:bg-ed-field"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedName, {
								text: labelText,
								className: canvasLabelClass(selTone)
							})),
							showIframeToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: cn$2("flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium", selectedElement.props?.["data-interaction-enabled"] !== "true" ? "bg-ed-muted text-ed-muted-foreground hover:bg-ed-accent" : "bg-ed-canvas-selection text-white hover:bg-ed-canvas-selection/90"),
									onClick: (e_1) => {
										e_1.stopPropagation();
										e_1.preventDefault();
										const currentEnabled = selectedElement.props?.["data-interaction-enabled"] === "true";
										onUpdateElementProps?.(selectedElementId, { "data-interaction-enabled": currentEnabled ? "false" : "true" });
									},
									onMouseDown: _temp6$26,
									"data-label-control": "",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$8, {
										size: 10,
										weight: "bold"
									})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
								side: "top",
								children: selectedElement.props?.["data-interaction-enabled"] !== "true" ? "Interaction disabled. Click to enable." : "Interaction enabled. Click to disable."
							})] })
						]
					})
				}, `label-${selectedElementId}`));
			}
		}
		if (isSingleSelection) {
			const selectedId = Array.from(selectedElementIds)[0];
			const parentKey = getParentId(store, selectedId);
			const parentId = parentKey === "ROOT" || parentKey === null ? null : parentKey;
			if (parentId) {
				const storedParent = geoms.get(parentId);
				const parentGeom = storedParent ? projectGeom(storedParent, paintView) : null;
				const parentIsComponent = componentSelectionTone(store, parentId).isComponent;
				const parentIsEdit = isInsideComponentEdit(store, parentId);
				if (parentGeom) {
					const parentRect = {
						left: parentGeom.centerX - parentGeom.width / 2,
						top: parentGeom.centerY - parentGeom.height / 2,
						width: parentGeom.width,
						height: parentGeom.height
					};
					overlays.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute pointer-events-none",
						"data-parent-outline-id": parentId,
						"data-ov-base": overlayBaseAttr(parentRect, paintView),
						style: {
							...parentRect,
							outline: "1px dashed",
							outlineColor: canvasOutlineColor({
								isEdit: parentIsEdit,
								isMissingComponent: false,
								isComponent: !!parentIsComponent
							}),
							outlineOffset: "-1px",
							transform: parentGeom.transform === "none" ? void 0 : parentGeom.transform,
							transformOrigin: "center center"
						}
					}, `parent-${parentId}`));
				}
			}
		}
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: overlays });
		$[13] = geoms;
		$[14] = handleLabelMouseDown;
		$[15] = noInteract;
		$[16] = onRenameElement;
		$[17] = onUpdateElementProps;
		$[18] = overlayMode;
		$[19] = renamingId;
		$[20] = selectedElementIds;
		$[21] = store;
		$[22] = t8;
	} else t8 = $[22];
	return t8;
}
/** Screen px a name reaches away from its pivot other than along its cap. */
function _temp6$26(e_2) {
	return e_2.stopPropagation();
}
function _temp5$32(s) {
	return s.visibleTree;
}
var NAME_SCREEN_MARGIN = 32;
/** The zoom each name row's cap was last settled for, and the max-width it had then. */
var settledCaps = /* @__PURE__ */ new WeakMap();
/**
* Keeps one name row's "…" cap (`data-root-label-span`, canvas px) in step
* with the live zoom, from the per-camera-tick overlay sync. Work is skipped
* where the result can't change on screen:
* - already settled for this zoom (every pan tick);
* - off screen, judged from the pivot position the sync just wrote — a stale
*   cap is fixed on the first tick the name is back on screen, before paint;
* - not cut before or after (the text fits both caps), so a new cap would
*   render the same.
* `view` null is a full pass: no off-screen skip. Run one when a gesture
* settles and when the viewport resizes, so nothing stays stale.
*/
function syncNameCap(row, scale, view) {
	const settled = settledCaps.get(row);
	if (settled?.scale === scale && settled.maxWidth === row.style.maxWidth) return;
	const cap = +row.dataset.rootLabelSpan * scale;
	if (view) {
		const pivot = row.parentElement;
		const x = parseFloat(pivot?.style.left ?? "");
		const y = parseFloat(pivot?.style.top ?? "");
		const reach = cap + NAME_SCREEN_MARGIN;
		if (x < -reach || y < -reach || x > view.width + reach || y > view.height + reach) return;
	}
	const nameWidth = +(row.firstElementChild?.dataset.nameWidth ?? NaN) + 1;
	const current = parseFloat(row.style.maxWidth);
	if (!(cap >= nameWidth && current >= nameWidth)) row.style.maxWidth = `${cap}px`;
	settledCaps.set(row, {
		scale,
		maxWidth: row.style.maxWidth
	});
}
/**
* Caps a selection label at the live width of the edge it sits on, for the
* imperative resize/rotate previews. `pivot` is the [data-selection-label-id]
* node; its row is the element that carries the cap.
*/
function capSelectionLabel(pivot, edgeLength) {
	const row = pivot.firstElementChild;
	if (row?.dataset.rootLabelSpan !== void 0) row.style.maxWidth = `${edgeLength}px`;
}
/** The name a canvas label shows for an element. */
function elementLabelText(element) {
	return element.name?.trim() || (element.type === "html" ? element?.props?.["data-component"] || element.tag : element.type === "icon" ? element.iconName : element.type === "component" ? element.componentName : element.type === "capture" ? element.original.componentName : element.type === "webview" ? "Live Preview" : element.type === "text" ? "Text" : "Element");
}
/**
* Left of a Live Preview's name while it is live: the page takes the pointer
* (Interact) or picks from it (Capture). A static preview shows none. Reads
* the store itself so a mode switch re-renders only this icon.
*/
function PreviewModeIcon(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { previewId } = t0;
	let t1;
	if ($[0] !== previewId) {
		t1 = (s) => s.live && s.activeWebviewId === previewId ? s.tool : null;
		$[0] = previewId;
		$[1] = t1;
	} else t1 = $[1];
	const tool = useWebviewEditValue(t1);
	if (!tool) return null;
	const t2 = tool === "capture" ? "Capturing" : "Interactive";
	let t3;
	if ($[2] !== tool) {
		t3 = tool === "capture" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, { className: "size-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CursorIcon, {
			className: "size-2.5",
			fill: "currentColor"
		});
		$[2] = tool;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== t2 || $[5] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-label": t2,
			className: "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] bg-ed-canvas-webview text-black",
			children: t3
		});
		$[4] = t2;
		$[5] = t3;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}
/** A root's name on the canvas, capped by its row's max-width and ending in "…". */
function TruncatedName(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { text, className } = t0;
	const ref = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const el = ref.current;
			if (!el) return;
			const measure = () => {
				el.dataset.nameWidth = String(el.scrollWidth);
			};
			measure();
			let live = true;
			document.fonts?.ready.then(() => {
				if (live) measure();
			});
			return () => {
				live = false;
			};
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== text) {
		t2 = [text];
		$[1] = text;
		$[2] = t2;
	} else t2 = $[2];
	(0, import_react.useLayoutEffect)(t1, t2);
	let t3;
	if ($[3] !== className) {
		t3 = cn$2("min-w-[1em] truncate", className);
		$[3] = className;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block" });
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== t3 || $[7] !== text) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			ref,
			size: "xs",
			className: t3,
			children: [t4, text]
		});
		$[6] = t3;
		$[7] = text;
		$[8] = t5;
	} else t5 = $[8];
	return t5;
}
/**
* A dragged root's name, riding on its drag preview (the original, and so its
* RootLabel, is hidden for the drag). Sits inside the preview, which is scaled
* by `zoom`, so it scales back to screen size; capped at the frame's width.
*/
function DragPreviewLabel(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { element, width, zoom } = t0;
	const t1 = zoom === null ? `calc(${width}px * var(--lg-drag-zoom))` : width * zoom;
	const t2 = zoom === null ? "scale(calc(1 / var(--lg-drag-zoom)))" : `scale(${1 / zoom})`;
	let t3;
	if ($[0] !== t1 || $[1] !== t2) {
		t3 = {
			left: 0,
			bottom: "100%",
			paddingBottom: 1,
			maxWidth: t1,
			transform: t2,
			transformOrigin: "0 100%"
		};
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== element) {
		t4 = elementLabelText(element);
		$[3] = element;
		$[4] = t4;
	} else t4 = $[4];
	const t5 = element.type === "webview" ? "text-ed-canvas-webview" : "text-ed-canvas-selection";
	let t6;
	if ($[5] !== t4 || $[6] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedName, {
			text: t4,
			className: t5
		});
		$[5] = t4;
		$[6] = t5;
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== t3 || $[9] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "absolute flex whitespace-nowrap",
			style: t3,
			children: t6
		});
		$[8] = t3;
		$[9] = t6;
		$[10] = t7;
	} else t7 = $[10];
	return t7;
}
function RootLabel(t0) {
	const $ = (0, import_compiler_runtime.c)(29);
	const { rootId, geom, overlayMode, labelText, noInteract, stackIndex } = t0;
	let edge;
	let span;
	let t1;
	let t2;
	if ($[0] !== geom || $[1] !== overlayMode) {
		const paintView = paintViewOf(overlayMode);
		edge = topEdge(projectGeom(geom, paintView));
		span = edge.length / paintView.scale;
		t1 = "";
		t2 = overlayBaseAttr({
			left: edge.anchor.x,
			top: edge.anchor.y,
			width: 0,
			height: 0
		}, paintView);
		$[0] = geom;
		$[1] = overlayMode;
		$[2] = edge;
		$[3] = span;
		$[4] = t1;
		$[5] = t2;
	} else {
		edge = $[2];
		span = $[3];
		t1 = $[4];
		t2 = $[5];
	}
	const t3 = `rotate(${edge.angleDeg}deg)`;
	let t4;
	if ($[6] !== edge.anchor.x || $[7] !== edge.anchor.y || $[8] !== t3) {
		t4 = {
			position: "absolute",
			left: edge.anchor.x,
			top: edge.anchor.y,
			width: 0,
			height: 0,
			transformOrigin: "0 0",
			transform: t3
		};
		$[6] = edge.anchor.x;
		$[7] = edge.anchor.y;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	const t5 = !noInteract && "pointer-events-auto cursor-default";
	let t6;
	if ($[10] !== t5) {
		t6 = cn$2("absolute flex items-center gap-1 select-none whitespace-nowrap", t5);
		$[10] = t5;
		$[11] = t6;
	} else t6 = $[11];
	const t7 = 1 + stackIndex * LABEL_STACK_STEP;
	let t8;
	if ($[12] !== edge.length || $[13] !== t7) {
		t8 = {
			left: 0,
			bottom: t7,
			maxWidth: edge.length
		};
		$[12] = edge.length;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	const t9 = noInteract ? void 0 : _temp7$19;
	let t10;
	if ($[15] !== labelText) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedName, {
			text: labelText,
			className: "text-ed-muted-foreground"
		});
		$[15] = labelText;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== rootId || $[18] !== span || $[19] !== t10 || $[20] !== t6 || $[21] !== t8 || $[22] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-root-label-id": rootId,
			"data-root-label-span": span,
			className: t6,
			style: t8,
			onMouseDown: t9,
			children: t10
		});
		$[17] = rootId;
		$[18] = span;
		$[19] = t10;
		$[20] = t6;
		$[21] = t8;
		$[22] = t9;
		$[23] = t11;
	} else t11 = $[23];
	let t12;
	if ($[24] !== t1 || $[25] !== t11 || $[26] !== t2 || $[27] !== t4) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-overlay-interactive": t1,
			"data-ov-base": t2,
			style: t4,
			children: t11
		});
		$[24] = t1;
		$[25] = t11;
		$[26] = t2;
		$[27] = t4;
		$[28] = t12;
	} else t12 = $[28];
	return t12;
}
/**
* Always-on name label above every top-level root (LUN-96).
*
* Own component so hover (HoverOverlay) and geom recomputes in Canvas do not
* rebuild every label — the compiler can skip this tree when its props are
* unchanged. Hidden while the root IS the single selection (the richer
* selection label renders in its place).
*/
function _temp7$19(e) {
	return e.preventDefault();
}
function RootLabels(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { selectedElementIds, hiddenIds, overlayMode, noInteract, geoms } = t0;
	const store = usePages(_temp8$15);
	const isSingleSelection = selectedElementIds.size === 1;
	let t1;
	if ($[0] !== geoms || $[1] !== hiddenIds || $[2] !== isSingleSelection || $[3] !== noInteract || $[4] !== overlayMode || $[5] !== selectedElementIds || $[6] !== store) {
		const selectedId = isSingleSelection ? Array.from(selectedElementIds)[0] : null;
		const selected = selectedId ? getById(store, selectedId) : null;
		const selectionGeom = selected?.type === "html" && selected.tag === "iframe" ? geoms.get(selected.id) ?? null : null;
		const labels = [];
		const placed = [];
		for (const rootId of getRootIds(store)) {
			if (isTextOwner(store, rootId) || hiddenIds.has(rootId)) continue;
			if (isSingleSelection && selectedElementIds.has(rootId)) continue;
			const stored = geoms.get(rootId);
			if (!stored) continue;
			if (selectionGeom && labelAnchorsCoincide(stored, selectionGeom)) continue;
			const element = getById(store, rootId);
			if (!element) continue;
			const labelText = elementLabelText(element);
			const stackIndex = placed.filter((g) => labelAnchorsCoincide(g, stored)).length;
			placed.push(stored);
			labels.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootLabel, {
				stackIndex,
				rootId,
				geom: stored,
				overlayMode,
				labelText,
				noInteract
			}, rootId));
		}
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: labels });
		$[0] = geoms;
		$[1] = hiddenIds;
		$[2] = isSingleSelection;
		$[3] = noInteract;
		$[4] = overlayMode;
		$[5] = selectedElementIds;
		$[6] = store;
		$[7] = t1;
	} else t1 = $[7];
	return t1;
}
function _temp8$15(s) {
	return s.visibleTree;
}
/** Canvas-space AABB of a frame — pan/zoom cannot invalidate it. */
function measurePresenceBox(elementId) {
	const overlayEl = document.querySelector("[data-overlay-container]");
	const domEl = document.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
	if (!overlayEl || !domEl) return null;
	const origin = overlayEl.getBoundingClientRect();
	const rect = measureVisibleBounds(domEl);
	if (rect.width <= 0 && rect.height <= 0) return null;
	const { scale, positionX, positionY } = getCamera();
	return {
		left: (rect.left - origin.left - positionX) / scale,
		top: (rect.top - origin.top - positionY) / scale,
		width: rect.width / scale,
		height: rect.height / scale
	};
}
function projectPresenceBox(box, at) {
	return {
		left: box.left * at.scale + at.positionX,
		top: box.top * at.scale + at.positionY,
		width: box.width * at.scale,
		height: box.height * at.scale
	};
}
function presenceOverlayBox(elementId, geoms, view) {
	const stored = geoms?.get(elementId);
	if (stored && (stored.width > 0 || stored.height > 0)) {
		const geom = projectGeom(stored, view);
		return {
			box: {
				left: geom.centerX - geom.width / 2,
				top: geom.centerY - geom.height / 2,
				width: geom.width,
				height: geom.height
			},
			transform: geom.transform
		};
	}
	const fallback = measurePresenceBox(elementId);
	if (!fallback) return null;
	return {
		box: projectPresenceBox(fallback, view),
		transform: "none"
	};
}
/**
* Presence overlays sit outside the pan/zoom CSS transform (same layer as selection).
* Measured in canvas space so a view change cannot stale them; `data-ov-base` lets
* `syncOverlayToLiveTransform` re-project on every camera tick without a React render.
*
* Size comes from the observer-backed geom store, which republishes when a frame
* resizes, so streaming children into a shell grows the rim with it. Falls back to
* a live DOM read if the node is not tracked yet.
*
* Display only: every layer is `pointer-events: none`, so the user can select,
* drag and edit a frame while an agent works in it.
*/
var HALFTONE_CELLS = [
	{
		x: 2,
		y: 2,
		delay: 0
	},
	{
		x: 6,
		y: 2,
		delay: .12
	},
	{
		x: 10,
		y: 2,
		delay: .24
	},
	{
		x: 2,
		y: 6,
		delay: .12
	},
	{
		x: 6,
		y: 6,
		delay: .24
	},
	{
		x: 10,
		y: 6,
		delay: .36
	},
	{
		x: 2,
		y: 10,
		delay: .24
	},
	{
		x: 6,
		y: 10,
		delay: .36
	},
	{
		x: 10,
		y: 10,
		delay: .48
	}
];
/** Chat colors are saturated; mix them toward a chrome token so the rim reads as UI, not content. */
function presenceTone(color, chroma, toward = "var(--ed-muted-foreground)") {
	return `color-mix(in oklab, ${color} ${chroma}%, ${toward} ${100 - chroma}%)`;
}
/** The chip is a scrim over arbitrary user content, so it stays dark in both themes. */
var PRESENCE_CHIP_BACKGROUND = "rgba(12, 14, 16, 0.62)";
var PRESENCE_CHIP_FOREGROUND = "rgba(248, 250, 252, 0.88)";
function AgentPresenceOverlays(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { agentPresence, hiddenIds, geoms } = t0;
	if (agentPresence.size === 0) return null;
	let overlays;
	if ($[0] !== agentPresence || $[1] !== geoms || $[2] !== hiddenIds) {
		const view = getCamera();
		overlays = [];
		for (const [elementId, color] of agentPresence) {
			if (hiddenIds.has(elementId)) continue;
			const measured = presenceOverlayBox(elementId, geoms, view);
			if (!measured) continue;
			const { box, transform } = measured;
			const rim = presenceTone(color, 32);
			const sweep = presenceTone(color, 46, "var(--ed-border)");
			const sheen = presenceTone(color, 28, "var(--ed-card)");
			overlays.push(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-agent-presence-id": elementId,
				"data-ov-base": overlayBaseAttr(box, view),
				role: "img",
				"aria-label": "AI is working here",
				style: {
					position: "absolute",
					left: box.left,
					top: box.top,
					width: box.width,
					height: box.height,
					boxSizing: "border-box",
					overflow: "hidden",
					borderRadius: 4,
					pointerEvents: "none",
					zIndex: 50,
					transform: transform === "none" ? void 0 : transform,
					transformOrigin: "center center"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": true,
						style: {
							position: "absolute",
							inset: 0,
							overflow: "hidden",
							pointerEvents: "none"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							position: "absolute",
							inset: 0,
							background: `linear-gradient(105deg, transparent 28%, ${sheen} 50%, transparent 72%)`,
							opacity: .22,
							animation: "petal-presence-shimmer 1.7s ease-in-out infinite",
							willChange: "transform"
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						inset: 0,
						borderRadius: 4,
						boxShadow: `inset 0 0 0 1px ${rim}`,
						pointerEvents: "none"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "absolute",
							top: 5,
							right: 5,
							display: "flex",
							alignItems: "center",
							gap: 6,
							height: 18,
							padding: "0 7px 0 6px",
							borderRadius: 3,
							background: PRESENCE_CHIP_BACKGROUND,
							boxShadow: `inset 0 0 0 1px ${rim}`,
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
							pointerEvents: "none"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "12",
							height: "12",
							viewBox: "0 0 12 12",
							"aria-hidden": true,
							children: HALFTONE_CELLS.map((t1) => {
								const { x, y, delay } = t1;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: x,
									cy: y,
									r: "1.05",
									fill: sweep,
									style: { animation: `petal-halftone-cell 1.8s ease-in-out ${delay}s infinite` }
								}, `${x}-${y}`);
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 9,
								fontWeight: 500,
								color: PRESENCE_CHIP_FOREGROUND,
								letterSpacing: "0.08em",
								textTransform: "uppercase"
							},
							children: "AI"
						})]
					})
				]
			}, `presence-${elementId}`));
		}
		$[0] = agentPresence;
		$[1] = geoms;
		$[2] = hiddenIds;
		$[3] = overlays;
	} else overlays = $[3];
	let t1;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: "\n        @keyframes petal-halftone-cell {\n          0%, 100% { opacity: 0.22; }\n          50% { opacity: 0.95; }\n        }\n        @keyframes petal-presence-shimmer {\n          0% { transform: translateX(-100%); }\n          100% { transform: translateX(100%); }\n        }\n      " });
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== overlays) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t1, overlays] });
		$[5] = overlays;
		$[6] = t2;
	} else t2 = $[6];
	return t2;
}
/** The ids overlays read geoms for: roots, the selection and its parents, and elements an agent is working on. */
function overlayTrackedIdsKey(store, selectedIds, presenceIds) {
	const ids = new Set(getRootIds(store));
	for (const id of selectedIds) {
		ids.add(id);
		const parentId = getParentId(store, id);
		if (parentId && parentId !== "ROOT") ids.add(parentId);
	}
	if (presenceIds) for (const id of presenceIds.keys()) ids.add(id);
	return [...ids].sort().join(",");
}
function useOverlayGeoms(t0) {
	const $ = (0, import_compiler_runtime.c)(86);
	const { canvasRef, selectedElementIds, trackedIdsKey, componentsRevision, isDragging, isResizing } = t0;
	const dragActive = isDragging ?? false;
	const resizeActive = isResizing ?? false;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ new Map();
		$[0] = t1;
	} else t1 = $[0];
	const elementByIdRef = (0, import_react.useRef)(t1);
	let t2;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ new Map();
		$[1] = t2;
	} else t2 = $[1];
	const geomByIdRef = (0, import_react.useRef)(t2);
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => ({ get: (id) => geomByIdRef.current.get(id) });
		$[2] = t3;
	} else t3 = $[2];
	const [geoms, setGeoms] = (0, import_react.useState)(t3);
	const geomRafRef = (0, import_react.useRef)(null);
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => {
			setGeoms(() => ({ get: (id_0) => geomByIdRef.current.get(id_0) }));
		};
		$[3] = t4;
	} else t4 = $[3];
	const publishGeoms = t4;
	let t5;
	if ($[4] !== canvasRef) {
		t5 = () => readMeasureView(getCamera(), document.querySelector("[data-overlay-container]") ?? canvasRef?.current ?? null);
		$[4] = canvasRef;
		$[5] = t5;
	} else t5 = $[5];
	const currentMeasureView = t5;
	let t6;
	if ($[6] !== resizeActive) {
		t6 = () => resizeActive;
		$[6] = resizeActive;
		$[7] = t6;
	} else t6 = $[7];
	const isResizingNow = (0, import_react.useEffectEvent)(t6);
	const recomputeAllGeomsRef = (0, import_react.useRef)(_temp9$13);
	const geomRecomputePendingRef = (0, import_react.useRef)(false);
	let t7;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = (t8) => {
			if (t8 === void 0 ? false : t8) geomRecomputePendingRef.current = true;
			if (geomRafRef.current !== null) return;
			geomRafRef.current = requestAnimationFrame(() => {
				geomRafRef.current = null;
				if (geomRecomputePendingRef.current) {
					geomRecomputePendingRef.current = false;
					recomputeAllGeomsRef.current();
				}
				publishGeoms();
			});
		};
		$[8] = t7;
	} else t7 = $[8];
	const scheduleGeomBump = t7;
	const resizeObserverRef = (0, import_react.useRef)(null);
	let t8;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ new Map();
		$[9] = t8;
	} else t8 = $[9];
	const idByResolvedRef = (0, import_react.useRef)(t8);
	let t9;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = (tracked) => {
			const ro = resizeObserverRef.current;
			const idByResolved = idByResolvedRef.current;
			for (const o of tracked.observed) {
				if (ro) ro.unobserve(o);
				idByResolved.delete(o);
			}
		};
		$[10] = t9;
	} else t9 = $[10];
	const unobserveTracked = t9;
	let t10;
	if ($[11] !== canvasRef) {
		t10 = (id_1) => {
			const tracked_0 = elementByIdRef.current.get(id_1);
			if (!tracked_0) return null;
			if (!tracked_0.element.isConnected) {
				const remounted = canvasRef.current?.querySelector(`[data-element-id="${CSS.escape(id_1)}"]`);
				if (!remounted) {
					unobserveTracked(tracked_0);
					elementByIdRef.current.delete(id_1);
					geomByIdRef.current.delete(id_1);
					return null;
				}
				tracked_0.element = remounted;
			}
			const resolved = resolveVisibleElement$1(tracked_0.element);
			const observed = resolveObservedElements(tracked_0.element);
			const observedChanged = observed.length !== tracked_0.observed.length || observed.some((el, i) => el !== tracked_0.observed[i]);
			if (resolved !== tracked_0.resolved || observedChanged) {
				unobserveTracked(tracked_0);
				tracked_0.resolved = resolved;
				tracked_0.observed = observed;
				const ro_0 = resizeObserverRef.current;
				const idByResolved_0 = idByResolvedRef.current;
				for (const o_0 of observed) {
					idByResolved_0.set(o_0, id_1);
					if (ro_0) ro_0.observe(o_0);
				}
			}
			return resolved;
		};
		$[11] = canvasRef;
		$[12] = t10;
	} else t10 = $[12];
	const syncResolved = t10;
	let t11;
	if ($[13] !== trackedIdsKey) {
		t11 = new Set(trackedIdsKey ? trackedIdsKey.split(",") : []);
		$[13] = trackedIdsKey;
		$[14] = t11;
	} else t11 = $[14];
	const trackedIds = t11;
	const trackedIdsRef = (0, import_react.useRef)(trackedIds);
	let t12;
	if ($[15] !== trackedIds) {
		t12 = () => {
			trackedIdsRef.current = trackedIds;
		};
		$[15] = trackedIds;
		$[16] = t12;
	} else t12 = $[16];
	(0, import_react.useLayoutEffect)(t12);
	let t13;
	if ($[17] !== canvasRef) {
		t13 = (view, walkCache) => {
			const canvas = canvasRef.current;
			const ro_1 = resizeObserverRef.current;
			if (!canvas || !ro_1) return false;
			const wanted = trackedIdsRef.current;
			const tracked_1 = elementByIdRef.current;
			const idByResolved_1 = idByResolvedRef.current;
			let changed = false;
			for (const [id_2, entry] of tracked_1) {
				if (wanted.has(id_2) && entry.element.isConnected) continue;
				unobserveTracked(entry);
				tracked_1.delete(id_2);
				geomByIdRef.current.delete(id_2);
				changed = true;
			}
			for (const id_3 of wanted) {
				if (tracked_1.has(id_3)) continue;
				const element = canvas.querySelector(`[data-element-id="${CSS.escape(id_3)}"]`);
				if (!element) continue;
				const entry_0 = {
					element,
					resolved: resolveVisibleElement$1(element),
					observed: resolveObservedElements(element)
				};
				tracked_1.set(id_3, entry_0);
				for (const o_1 of entry_0.observed) {
					idByResolved_1.set(o_1, id_3);
					ro_1.observe(o_1);
				}
				if (view) geomByIdRef.current.set(id_3, readElementGeom(entry_0, view, walkCache));
				changed = true;
			}
			return changed;
		};
		$[17] = canvasRef;
		$[18] = t13;
	} else t13 = $[18];
	const ensureTracked = t13;
	let t14;
	if ($[19] !== currentMeasureView || $[20] !== syncResolved) {
		t14 = () => {
			const view_0 = currentMeasureView();
			if (!view_0) return;
			const walkCache_0 = /* @__PURE__ */ new Map();
			for (const id_4 of Array.from(elementByIdRef.current.keys())) {
				if (!elementByIdRef.current.has(id_4)) continue;
				if (!syncResolved(id_4)) continue;
				const live = elementByIdRef.current.get(id_4);
				if (!live) continue;
				geomByIdRef.current.set(id_4, readElementGeom(live, view_0, walkCache_0));
			}
		};
		$[19] = currentMeasureView;
		$[20] = syncResolved;
		$[21] = t14;
	} else t14 = $[21];
	const recomputeAllGeoms = t14;
	let t15;
	if ($[22] !== recomputeAllGeoms) {
		t15 = () => {
			recomputeAllGeomsRef.current = recomputeAllGeoms;
		};
		$[22] = recomputeAllGeoms;
		$[23] = t15;
	} else t15 = $[23];
	(0, import_react.useLayoutEffect)(t15);
	let t16;
	if ($[24] !== canvasRef || $[25] !== currentMeasureView || $[26] !== ensureTracked || $[27] !== isResizingNow || $[28] !== syncResolved) {
		t16 = () => {
			const canvas_0 = canvasRef.current;
			if (!canvas_0) return;
			const trackedElements = elementByIdRef.current;
			const geomMap = geomByIdRef.current;
			const idByResolved_2 = idByResolvedRef.current;
			idByResolved_2.clear();
			const overlayContainer = document.querySelector("[data-overlay-container]");
			const resizeObserver = new ResizeObserver((entries) => {
				if (isResizingNow() || getLiveSize()) return;
				const view_1 = currentMeasureView();
				if (!view_1) return;
				const walkCache_1 = /* @__PURE__ */ new Map();
				let changed_0 = false;
				for (const entry_1 of entries) {
					if (entry_1.target === canvas_0 || entry_1.target === overlayContainer) {
						scheduleGeomBump(true);
						continue;
					}
					const id_5 = idByResolved_2.get(entry_1.target);
					if (!id_5) continue;
					const tracked_2 = elementByIdRef.current.get(id_5);
					if (!tracked_2) continue;
					if (!entry_1.target.isConnected || !tracked_2.observed.includes(entry_1.target)) {
						if (!syncResolved(id_5)) continue;
						const next = elementByIdRef.current.get(id_5);
						if (!next) continue;
						geomByIdRef.current.set(id_5, readElementGeom(next, view_1, walkCache_1));
						changed_0 = true;
						continue;
					}
					geomByIdRef.current.set(id_5, readElementGeom(tracked_2, view_1, walkCache_1));
					changed_0 = true;
				}
				if (changed_0) scheduleGeomBump();
			});
			resizeObserverRef.current = resizeObserver;
			ensureTracked(currentMeasureView(), /* @__PURE__ */ new Map());
			resizeObserver.observe(canvas_0);
			if (overlayContainer) resizeObserver.observe(overlayContainer);
			scheduleGeomBump();
			const mutationObserver = new MutationObserver((mutations) => {
				let view_2;
				const measureView = () => view_2 === void 0 ? view_2 = currentMeasureView() : view_2;
				const walkCache_2 = /* @__PURE__ */ new Map();
				let dirty = false;
				for (const [id_6, tracked_3] of elementByIdRef.current) {
					if (!tracked_3.element.isConnected) continue;
					if (!mutations.some((m) => tracked_3.element.contains(m.target))) continue;
					if (!syncResolved(id_6)) continue;
					const live_0 = elementByIdRef.current.get(id_6);
					const current = measureView();
					if (live_0 && current) geomByIdRef.current.set(id_6, readElementGeom(live_0, current, walkCache_2));
					dirty = true;
				}
				if ([...trackedIdsRef.current].some((id_7) => !elementByIdRef.current.get(id_7)?.element.isConnected) && ensureTracked(measureView(), walkCache_2)) dirty = true;
				if (dirty) scheduleGeomBump();
			});
			mutationObserver.observe(canvas_0, {
				childList: true,
				subtree: true
			});
			const onWinResize = () => scheduleGeomBump(true);
			window.addEventListener("resize", onWinResize);
			const onScroll = (e) => {
				const target = e.target;
				if (!target) return;
				if (target === document || target instanceof Node && (target.contains(canvas_0) || canvas_0.contains(target))) scheduleGeomBump(true);
			};
			document.addEventListener("scroll", onScroll, {
				capture: true,
				passive: true
			});
			const unsubscribeLiveSize = subscribeLiveSize((size) => {
				if (!size) scheduleGeomBump(true);
			});
			return () => {
				unsubscribeLiveSize();
				resizeObserver.disconnect();
				mutationObserver.disconnect();
				window.removeEventListener("resize", onWinResize);
				document.removeEventListener("scroll", onScroll, { capture: true });
				resizeObserverRef.current = null;
				trackedElements.clear();
				geomMap.clear();
				idByResolved_2.clear();
			};
		};
		$[24] = canvasRef;
		$[25] = currentMeasureView;
		$[26] = ensureTracked;
		$[27] = isResizingNow;
		$[28] = syncResolved;
		$[29] = t16;
	} else t16 = $[29];
	let t17;
	if ($[30] !== canvasRef || $[31] !== currentMeasureView || $[32] !== ensureTracked || $[33] !== syncResolved) {
		t17 = [
			canvasRef,
			scheduleGeomBump,
			syncResolved,
			currentMeasureView,
			ensureTracked
		];
		$[30] = canvasRef;
		$[31] = currentMeasureView;
		$[32] = ensureTracked;
		$[33] = syncResolved;
		$[34] = t17;
	} else t17 = $[34];
	(0, import_react.useEffect)(t16, t17);
	let t18;
	if ($[35] !== currentMeasureView || $[36] !== dragActive || $[37] !== ensureTracked || $[38] !== resizeActive || $[39] !== selectedElementIds || $[40] !== syncResolved) {
		t18 = () => {
			if (dragActive || isRotating() || resizeActive || selectedElementIds.size === 0) return;
			const view_3 = currentMeasureView();
			if (!view_3) return;
			const walkCache_3 = /* @__PURE__ */ new Map();
			let changed_1 = ensureTracked(view_3, walkCache_3);
			for (const id_8 of selectedElementIds) {
				if (!syncResolved(id_8)) continue;
				const tracked_4 = elementByIdRef.current.get(id_8);
				if (!tracked_4) continue;
				const next_0 = readElementGeom(tracked_4, view_3, walkCache_3);
				const previous = geomByIdRef.current.get(id_8);
				if (previous && previous.centerX === next_0.centerX && previous.centerY === next_0.centerY && previous.width === next_0.width && previous.height === next_0.height && previous.transform === next_0.transform) continue;
				geomByIdRef.current.set(id_8, next_0);
				changed_1 = true;
			}
			if (changed_1) publishGeoms();
		};
		$[35] = currentMeasureView;
		$[36] = dragActive;
		$[37] = ensureTracked;
		$[38] = resizeActive;
		$[39] = selectedElementIds;
		$[40] = syncResolved;
		$[41] = t18;
	} else t18 = $[41];
	let t19;
	if ($[42] !== componentsRevision || $[43] !== currentMeasureView || $[44] !== dragActive || $[45] !== ensureTracked || $[46] !== resizeActive || $[47] !== selectedElementIds || $[48] !== syncResolved) {
		t19 = [
			componentsRevision,
			selectedElementIds,
			dragActive,
			resizeActive,
			currentMeasureView,
			syncResolved,
			publishGeoms,
			ensureTracked
		];
		$[42] = componentsRevision;
		$[43] = currentMeasureView;
		$[44] = dragActive;
		$[45] = ensureTracked;
		$[46] = resizeActive;
		$[47] = selectedElementIds;
		$[48] = syncResolved;
		$[49] = t19;
	} else t19 = $[49];
	(0, import_react.useLayoutEffect)(t18, t19);
	let t20;
	if ($[50] !== currentMeasureView || $[51] !== ensureTracked) {
		t20 = () => {
			if (ensureTracked(currentMeasureView(), /* @__PURE__ */ new Map())) publishGeoms();
		};
		$[50] = currentMeasureView;
		$[51] = ensureTracked;
		$[52] = t20;
	} else t20 = $[52];
	let t21;
	if ($[53] !== currentMeasureView || $[54] !== ensureTracked || $[55] !== trackedIds) {
		t21 = [
			trackedIds,
			ensureTracked,
			currentMeasureView,
			publishGeoms
		];
		$[53] = currentMeasureView;
		$[54] = ensureTracked;
		$[55] = trackedIds;
		$[56] = t21;
	} else t21 = $[56];
	(0, import_react.useLayoutEffect)(t20, t21);
	let t22;
	let t23;
	if ($[57] !== dragActive || $[58] !== recomputeAllGeoms || $[59] !== resizeActive) {
		t22 = () => {
			if (dragActive || resizeActive) return;
			return usePages.subscribe(_temp0$12, () => {
				if (geomRafRef.current !== null) cancelAnimationFrame(geomRafRef.current);
				geomRafRef.current = requestAnimationFrame(() => {
					geomRafRef.current = null;
					if (isRotating()) return;
					recomputeAllGeoms();
					publishGeoms();
				});
			});
		};
		t23 = [
			dragActive,
			resizeActive,
			recomputeAllGeoms,
			publishGeoms
		];
		$[57] = dragActive;
		$[58] = recomputeAllGeoms;
		$[59] = resizeActive;
		$[60] = t22;
		$[61] = t23;
	} else {
		t22 = $[60];
		t23 = $[61];
	}
	(0, import_react.useEffect)(t22, t23);
	let t24;
	if ($[62] !== dragActive || $[63] !== recomputeAllGeoms || $[64] !== resizeActive) {
		t24 = () => {
			if (dragActive || isRotating() || resizeActive) return;
			if (geomRafRef.current !== null) cancelAnimationFrame(geomRafRef.current);
			geomRafRef.current = requestAnimationFrame(() => {
				geomRafRef.current = null;
				recomputeAllGeoms();
				publishGeoms();
			});
			return () => {
				if (geomRafRef.current !== null) {
					cancelAnimationFrame(geomRafRef.current);
					geomRafRef.current = null;
				}
			};
		};
		$[62] = dragActive;
		$[63] = recomputeAllGeoms;
		$[64] = resizeActive;
		$[65] = t24;
	} else t24 = $[65];
	let t25;
	if ($[66] !== componentsRevision || $[67] !== dragActive || $[68] !== recomputeAllGeoms || $[69] !== resizeActive) {
		t25 = [
			componentsRevision,
			dragActive,
			resizeActive,
			recomputeAllGeoms,
			publishGeoms
		];
		$[66] = componentsRevision;
		$[67] = dragActive;
		$[68] = recomputeAllGeoms;
		$[69] = resizeActive;
		$[70] = t25;
	} else t25 = $[70];
	(0, import_react.useEffect)(t24, t25);
	const prevDraggingRef = (0, import_react.useRef)(dragActive);
	let t26;
	let t27;
	if ($[71] !== dragActive || $[72] !== recomputeAllGeoms) {
		t26 = () => {
			if (prevDraggingRef.current && !dragActive) requestAnimationFrame(() => {
				recomputeAllGeoms();
				publishGeoms();
			});
			prevDraggingRef.current = dragActive;
		};
		t27 = [
			dragActive,
			recomputeAllGeoms,
			publishGeoms
		];
		$[71] = dragActive;
		$[72] = recomputeAllGeoms;
		$[73] = t26;
		$[74] = t27;
	} else {
		t26 = $[73];
		t27 = $[74];
	}
	(0, import_react.useEffect)(t26, t27);
	const prevResizingRef = (0, import_react.useRef)(resizeActive);
	let t28;
	let t29;
	if ($[75] !== recomputeAllGeoms || $[76] !== resizeActive) {
		t28 = () => {
			if (prevResizingRef.current && !resizeActive) {
				recomputeAllGeoms();
				publishGeoms();
			}
			prevResizingRef.current = resizeActive;
		};
		t29 = [
			resizeActive,
			recomputeAllGeoms,
			publishGeoms
		];
		$[75] = recomputeAllGeoms;
		$[76] = resizeActive;
		$[77] = t28;
		$[78] = t29;
	} else {
		t28 = $[77];
		t29 = $[78];
	}
	(0, import_react.useLayoutEffect)(t28, t29);
	let t30;
	let t31;
	if ($[79] !== currentMeasureView || $[80] !== selectedElementIds || $[81] !== syncResolved) {
		t30 = () => {
			if (selectedElementIds.size === 0) return;
			const view_4 = currentMeasureView();
			const walkCache_4 = /* @__PURE__ */ new Map();
			let changed_2 = false;
			for (const id_9 of selectedElementIds) {
				if (!syncResolved(id_9)) continue;
				const tracked_5 = elementByIdRef.current.get(id_9);
				if (!tracked_5) continue;
				if (view_4) geomByIdRef.current.set(id_9, readElementGeom(tracked_5, view_4, walkCache_4));
				changed_2 = true;
			}
			if (changed_2) scheduleGeomBump();
		};
		t31 = [
			selectedElementIds,
			syncResolved,
			scheduleGeomBump,
			currentMeasureView
		];
		$[79] = currentMeasureView;
		$[80] = selectedElementIds;
		$[81] = syncResolved;
		$[82] = t30;
		$[83] = t31;
	} else {
		t30 = $[82];
		t31 = $[83];
	}
	(0, import_react.useEffect)(t30, t31);
	let t32;
	if ($[84] !== geoms) {
		t32 = { geoms };
		$[84] = geoms;
		$[85] = t32;
	} else t32 = $[85];
	return t32;
}
function _temp0$12(s) {
	return s.visibleTree;
}
function _temp9$13() {}

export { AgentPresenceOverlays, DragPreviewLabel, HoverOverlay, HoverPreviewOverlay, RootLabels, SelectionOverlay, beginRotate, capSelectionLabel, overlayBaseAttr, overlayTrackedIdsKey, syncNameCap, useOverlayGeoms };
