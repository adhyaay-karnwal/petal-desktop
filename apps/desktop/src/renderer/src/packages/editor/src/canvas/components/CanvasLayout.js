// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasLayout.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Panel, PanelGroup$1 } from "../../../../../vendor/react-resizable-panels.js";
import { PanelDivider } from "../../shared/components/PanelDivider.js";
import { useEditorMode } from "../../shared/contexts/EditorModeContext.js";
import { useGlobalShortcut } from "../../shared/shortcuts/useGlobalShortcut.js";

/** Sidebars: fixed pixel widths, drag-resizable within [min, max],
*  unaffected by window resizes. */
var SIDEBAR_MIN_PX = {
	left: 300,
	right: 260
};
var SIDEBAR_DEFAULT_PX = 300;
var SIDEBAR_MAX_PX = 500;
/** Code panel height, as a percentage of the main area, when it first opens. */
var BOTTOM_PANEL_DEFAULT_SIZE = 30;
var SIDEBAR_WIDTH_KEYS = {
	left: "petal:sidebar-width:left",
	right: "petal:sidebar-width:right"
};
function clampSidebarWidth(side, width) {
	return Math.min(SIDEBAR_MAX_PX, Math.max(SIDEBAR_MIN_PX[side], width));
}
function loadSidebarWidth(side) {
	try {
		const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEYS[side]));
		if (Number.isFinite(stored) && stored > 0) return clampSidebarWidth(side, stored);
	} catch {}
	return SIDEBAR_DEFAULT_PX;
}
function saveSidebarWidth(side, width) {
	try {
		localStorage.setItem(SIDEBAR_WIDTH_KEYS[side], String(width));
	} catch {}
}
/** Drag handle and visible separator between a sidebar and the canvas. Pointer
*  capture keeps the drag alive over iframes/webviews. */
function SidebarResizeHandle(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { side, width, onResize, onResizeEnd } = t0;
	const dragRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== width) {
		t1 = (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			dragRef.current = {
				startX: e.clientX,
				startWidth: width
			};
		};
		$[0] = width;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== onResize || $[3] !== side) {
		t2 = (e_0) => {
			const drag = dragRef.current;
			if (!drag) return;
			const delta = side === "left" ? e_0.clientX - drag.startX : drag.startX - e_0.clientX;
			onResize(clampSidebarWidth(side, drag.startWidth + delta));
		};
		$[2] = onResize;
		$[3] = side;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	let t4;
	if ($[5] !== onResizeEnd) {
		t3 = (e_1) => {
			if (!dragRef.current) return;
			dragRef.current = null;
			e_1.currentTarget.releasePointerCapture(e_1.pointerId);
			onResizeEnd();
		};
		t4 = () => {
			if (!dragRef.current) return;
			dragRef.current = null;
			onResizeEnd();
		};
		$[5] = onResizeEnd;
		$[6] = t3;
		$[7] = t4;
	} else {
		t3 = $[6];
		t4 = $[7];
	}
	let t5;
	if ($[8] !== t1 || $[9] !== t2 || $[10] !== t3 || $[11] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-px shrink-0 bg-ed-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize",
				onPointerDown: t1,
				onPointerMove: t2,
				onPointerUp: t3,
				onPointerCancel: t4
			})
		});
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
		$[12] = t5;
	} else t5 = $[12];
	return t5;
}
function CanvasLayout(t0) {
	const $ = (0, import_compiler_runtime.c)(64);
	const { leftChildren, rightChildren, bottomChildren, chromeHidden: t1, bottomBarRevealSignal: t2, children } = t0;
	const chromeHidden = t1 === void 0 ? false : t1;
	const bottomBarRevealSignal = t2 === void 0 ? 0 : t2;
	const { mode, setMode } = useEditorMode();
	const showBottom = mode === "dev";
	const bottomPanelRef = (0, import_react.useRef)(null);
	const [bottomStartsOpen] = (0, import_react.useState)(showBottom);
	const bottomExpandedRef = (0, import_react.useRef)(bottomStartsOpen);
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			const panel = bottomPanelRef.current;
			if (!panel?.isCollapsed()) return;
			if (bottomExpandedRef.current) panel.expand();
			else panel.resize(BOTTOM_PANEL_DEFAULT_SIZE);
		};
		$[0] = t3;
	} else t3 = $[0];
	const openBottomPanel = t3;
	const [leftWidth, setLeftWidth] = (0, import_react.useState)(_temp$103);
	const [rightWidth, setRightWidth] = (0, import_react.useState)(_temp2$66);
	let t4;
	let t5;
	if ($[1] !== showBottom) {
		t4 = () => {
			const panel_0 = bottomPanelRef.current;
			if (!panel_0) return;
			if (showBottom) openBottomPanel();
			else if (panel_0.isExpanded()) panel_0.collapse();
		};
		t5 = [showBottom, openBottomPanel];
		$[1] = showBottom;
		$[2] = t4;
		$[3] = t5;
	} else {
		t4 = $[2];
		t5 = $[3];
	}
	(0, import_react.useLayoutEffect)(t4, t5);
	const lastRevealRef = (0, import_react.useRef)(bottomBarRevealSignal);
	let t6;
	let t7;
	if ($[4] !== bottomBarRevealSignal || $[5] !== mode || $[6] !== setMode) {
		t6 = () => {
			if (bottomBarRevealSignal === lastRevealRef.current) return;
			lastRevealRef.current = bottomBarRevealSignal;
			if (mode !== "dev") setMode("dev");
			openBottomPanel();
		};
		t7 = [
			bottomBarRevealSignal,
			mode,
			setMode,
			openBottomPanel
		];
		$[4] = bottomBarRevealSignal;
		$[5] = mode;
		$[6] = setMode;
		$[7] = t6;
		$[8] = t7;
	} else {
		t6 = $[7];
		t7 = $[8];
	}
	(0, import_react.useLayoutEffect)(t6, t7);
	let t8;
	if ($[9] !== setMode) {
		t8 = (e) => {
			e.preventDefault();
			const panel_1 = bottomPanelRef.current;
			if (!panel_1) return;
			if (panel_1.isCollapsed()) {
				setMode("dev");
				openBottomPanel();
			} else {
				setMode("design");
				panel_1.collapse();
			}
		};
		$[9] = setMode;
		$[10] = t8;
	} else t8 = $[10];
	useGlobalShortcut("toggleBottomBar", t8);
	let t9;
	if ($[11] !== mode || $[12] !== setMode) {
		t9 = () => {
			if (mode !== "design") setMode("design");
		};
		$[11] = mode;
		$[12] = setMode;
		$[13] = t9;
	} else t9 = $[13];
	const handlePanelCollapse = t9;
	let t10;
	if ($[14] !== mode || $[15] !== setMode) {
		t10 = () => {
			bottomExpandedRef.current = true;
			if (mode !== "dev") setMode("dev");
		};
		$[14] = mode;
		$[15] = setMode;
		$[16] = t10;
	} else t10 = $[16];
	const handlePanelExpand = t10;
	if (chromeHidden) {
		let t11;
		if ($[17] !== children) {
			t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full w-full overflow-hidden bg-ed-canvas-background",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative h-full overflow-hidden",
					children
				})
			});
			$[17] = children;
			$[18] = t11;
		} else t11 = $[18];
		return t11;
	}
	let t11;
	if ($[19] !== leftWidth) {
		t11 = { width: leftWidth };
		$[19] = leftWidth;
		$[20] = t11;
	} else t11 = $[20];
	let t12;
	if ($[21] !== leftChildren || $[22] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t11,
			className: "h-full shrink-0 overflow-hidden bg-ed-background",
			children: leftChildren
		});
		$[21] = leftChildren;
		$[22] = t11;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== leftWidth) {
		t13 = () => saveSidebarWidth("left", leftWidth);
		$[24] = leftWidth;
		$[25] = t13;
	} else t13 = $[25];
	let t14;
	if ($[26] !== leftWidth || $[27] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarResizeHandle, {
			side: "left",
			width: leftWidth,
			onResize: setLeftWidth,
			onResizeEnd: t13
		});
		$[26] = leftWidth;
		$[27] = t13;
		$[28] = t14;
	} else t14 = $[28];
	const t15 = bottomStartsOpen ? 70 : 100;
	let t16;
	if ($[29] !== children) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-full overflow-hidden bg-ed-canvas-background",
			children
		});
		$[29] = children;
		$[30] = t16;
	} else t16 = $[30];
	let t17;
	if ($[31] !== t15 || $[32] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			defaultSize: t15,
			minSize: 30,
			className: "bg-ed-background",
			children: t16
		});
		$[31] = t15;
		$[32] = t16;
		$[33] = t17;
	} else t17 = $[33];
	const t18 = !showBottom;
	const t19 = showBottom ? "bg-ed-border" : "bg-transparent";
	let t20;
	if ($[34] !== t18 || $[35] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelDivider, {
			disabled: t18,
			className: t19
		});
		$[34] = t18;
		$[35] = t19;
		$[36] = t20;
	} else t20 = $[36];
	const t21 = bottomStartsOpen ? BOTTOM_PANEL_DEFAULT_SIZE : 0;
	let t22;
	if ($[37] !== bottomChildren) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full w-full bg-ed-background overflow-hidden",
			children: bottomChildren
		});
		$[37] = bottomChildren;
		$[38] = t22;
	} else t22 = $[38];
	let t23;
	if ($[39] !== handlePanelCollapse || $[40] !== handlePanelExpand || $[41] !== t21 || $[42] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			ref: bottomPanelRef,
			defaultSize: t21,
			minSize: 15,
			maxSize: 70,
			collapsible: true,
			collapsedSize: 0,
			onCollapse: handlePanelCollapse,
			onExpand: handlePanelExpand,
			children: t22
		});
		$[39] = handlePanelCollapse;
		$[40] = handlePanelExpand;
		$[41] = t21;
		$[42] = t22;
		$[43] = t23;
	} else t23 = $[43];
	let t24;
	if ($[44] !== t17 || $[45] !== t20 || $[46] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full min-w-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelGroup$1, {
				direction: "vertical",
				children: [
					t17,
					t20,
					t23
				]
			})
		});
		$[44] = t17;
		$[45] = t20;
		$[46] = t23;
		$[47] = t24;
	} else t24 = $[47];
	let t25;
	if ($[48] !== rightWidth) {
		t25 = () => saveSidebarWidth("right", rightWidth);
		$[48] = rightWidth;
		$[49] = t25;
	} else t25 = $[49];
	let t26;
	if ($[50] !== rightWidth || $[51] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarResizeHandle, {
			side: "right",
			width: rightWidth,
			onResize: setRightWidth,
			onResizeEnd: t25
		});
		$[50] = rightWidth;
		$[51] = t25;
		$[52] = t26;
	} else t26 = $[52];
	let t27;
	if ($[53] !== rightWidth) {
		t27 = { width: rightWidth };
		$[53] = rightWidth;
		$[54] = t27;
	} else t27 = $[54];
	let t28;
	if ($[55] !== rightChildren || $[56] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t27,
			className: "h-full shrink-0 bg-ed-background",
			children: rightChildren
		});
		$[55] = rightChildren;
		$[56] = t27;
		$[57] = t28;
	} else t28 = $[57];
	let t29;
	if ($[58] !== t12 || $[59] !== t14 || $[60] !== t24 || $[61] !== t26 || $[62] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full overflow-hidden bg-ed-background",
			children: [
				t12,
				t14,
				t24,
				t26,
				t28
			]
		});
		$[58] = t12;
		$[59] = t14;
		$[60] = t24;
		$[61] = t26;
		$[62] = t28;
		$[63] = t29;
	} else t29 = $[63];
	return t29;
}
function _temp2$66() {
	return loadSidebarWidth("right");
}
function _temp$103() {
	return loadSidebarWidth("left");
}

export { CanvasLayout };
