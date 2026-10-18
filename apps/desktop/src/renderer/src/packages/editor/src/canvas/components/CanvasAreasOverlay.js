// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasAreasOverlay.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getCamera, subscribeCamera } from "../../shell/hooks/useCommentAgent.js";
import { getAreaHighlight, pointerStillOnAreaChip, publishAreaHighlight, subscribeAreaHighlight } from "../../shared/state/areaHighlightChannel.js";

/**
* ⇧⌘A: every masked area in the current chat, marked on the canvas — the rest
* dimmed, each area outlined and labelled ("Area 1"). Pointer-transparent, so
* the canvas stays pannable and usable underneath.
*
* Perf: React renders once per toggle. Pan/zoom repositions the mask holes,
* outlines and labels straight from the camera channel, at most once per frame.
*/
var DIM = "rgba(0, 0, 0, 0.35)";
/** Matches the outline drawn into area screenshots. */
var AREA_BLUE = "#0A84FF";
function setRect(el, x, y, width, height) {
	if (!el) return;
	el.setAttribute("x", String(x));
	el.setAttribute("y", String(y));
	el.setAttribute("width", String(width));
	el.setAttribute("height", String(height));
}
/** `dim: false` marks without dimming the rest — a hovered chat chip points, it doesn't take over the canvas. */
function CanvasAreasOverlay(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { areas, dim: t1 } = t0;
	const dim = t1 === void 0 ? true : t1;
	const maskId = (0, import_react.useId)();
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [];
		$[0] = t2;
	} else t2 = $[0];
	const holeRefs = (0, import_react.useRef)(t2);
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = [];
		$[1] = t3;
	} else t3 = $[1];
	const outlineRefs = (0, import_react.useRef)(t3);
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[2] = t4;
	} else t4 = $[2];
	const labelRefs = (0, import_react.useRef)(t4);
	let t5;
	let t6;
	if ($[3] !== areas) {
		t5 = () => {
			let frame = 0;
			const paint = () => {
				frame = 0;
				const { scale, positionX, positionY } = getCamera();
				areas.forEach((area, i) => {
					const x = area.rect.x * scale + positionX;
					const y = area.rect.y * scale + positionY;
					const width = area.rect.width * scale;
					const height = area.rect.height * scale;
					setRect(holeRefs.current[i], x, y, width, height);
					setRect(outlineRefs.current[i], x, y, width, height);
					const label = labelRefs.current[i];
					if (label) label.style.transform = `translate(${Math.round(x)}px, ${Math.round(y) - 3}px) translateY(-100%)`;
				});
			};
			paint();
			const unsubscribe = subscribeCamera(() => {
				if (!frame) frame = requestAnimationFrame(paint);
			});
			return () => {
				unsubscribe();
				if (frame) cancelAnimationFrame(frame);
			};
		};
		t6 = [areas];
		$[3] = areas;
		$[4] = t5;
		$[5] = t6;
	} else {
		t5 = $[4];
		t6 = $[5];
	}
	(0, import_react.useLayoutEffect)(t5, t6);
	let t7;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = {
			position: "absolute",
			inset: 0,
			zIndex: 65,
			pointerEvents: "none"
		};
		$[6] = t7;
	} else t7 = $[6];
	let t8;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = {
			position: "absolute",
			inset: 0
		};
		$[7] = t8;
	} else t8 = $[7];
	let t9;
	if ($[8] !== areas || $[9] !== dim || $[10] !== maskId) {
		t9 = dim && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mask", {
			id: maskId,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "100%",
				height: "100%",
				fill: "#fff"
			}), areas.map((area_0, i_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				ref: (el) => {
					holeRefs.current[i_0] = el;
				},
				fill: "#000"
			}, area_0.key))]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: DIM,
			mask: `url(#${maskId})`
		})] });
		$[8] = areas;
		$[9] = dim;
		$[10] = maskId;
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== areas) {
		t10 = areas.map((area_1, i_1) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			ref: (el_0) => {
				outlineRefs.current[i_1] = el_0;
			},
			fill: "none",
			stroke: AREA_BLUE,
			strokeWidth: 1,
			shapeRendering: "crispEdges"
		}, area_1.key));
		$[12] = areas;
		$[13] = t10;
	} else t10 = $[13];
	let t11;
	if ($[14] !== t10 || $[15] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: "100%",
			height: "100%",
			style: t8,
			children: [t9, t10]
		});
		$[14] = t10;
		$[15] = t9;
		$[16] = t11;
	} else t11 = $[16];
	let t12;
	if ($[17] !== areas) {
		t12 = areas.map((area_2, i_2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: (el_1) => {
				labelRefs.current[i_2] = el_1;
			},
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				padding: "0 4px",
				borderRadius: 3,
				background: AREA_BLUE,
				color: "#fff",
				font: "500 10px/14px -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
				whiteSpace: "nowrap"
			},
			children: area_2.label
		}, area_2.key));
		$[17] = areas;
		$[18] = t12;
	} else t12 = $[18];
	let t13;
	if ($[19] !== t11 || $[20] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-areas-overlay": "",
			style: t7,
			children: [t11, t12]
		});
		$[19] = t11;
		$[20] = t12;
		$[21] = t13;
	} else t13 = $[21];
	return t13;
}
/**
* The area under a hovered chat chip, outlined without dimming. Subscribes to
* the channel itself, so hovering a chip never re-renders Canvas.
*/
function ChatAreaHighlightOverlay(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { pageId } = t0;
	const highlight = (0, import_react.useSyncExternalStore)(subscribeAreaHighlight, getAreaHighlight, getAreaHighlight);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	(0, import_react.useEffect)(_temp2$55, t1);
	let t2;
	if ($[1] !== highlight || $[2] !== pageId) {
		t2 = highlight && (!highlight.pageId || !pageId || highlight.pageId === pageId) ? [{
			key: highlight.key,
			label: highlight.label,
			rect: highlight.rect
		}] : null;
		$[1] = highlight;
		$[2] = pageId;
		$[3] = t2;
	} else t2 = $[3];
	const areas = t2;
	let t3;
	if ($[4] !== areas) {
		t3 = areas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasAreasOverlay, {
			areas,
			dim: false
		}) : null;
		$[4] = areas;
		$[5] = t3;
	} else t3 = $[5];
	return t3;
}
function _temp2$55() {
	const onOut = _temp$87;
	window.addEventListener("pointerout", onOut, true);
	return () => window.removeEventListener("pointerout", onOut, true);
}
function _temp$87(e) {
	const current = getAreaHighlight();
	if (!current || !pointerStillOnAreaChip(e.target, current.key) || pointerStillOnAreaChip(e.relatedTarget, current.key)) return;
	publishAreaHighlight(null);
}

export { CanvasAreasOverlay, ChatAreaHighlightOverlay };
