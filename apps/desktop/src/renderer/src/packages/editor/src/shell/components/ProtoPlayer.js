// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProtoPlayer.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { isTypingTarget, matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { registerPanSurface } from "../../shared/utils/mouseButtonPolicy.js";
import { ChevronLeft, ChevronRight, Fullscreen, Minus, Plus, RotateCcw } from "../../../../../vendor/lucide-react.js";
import { PresentationFrame, frameFillsSurface, useFitToWidth, useFrameContent, useFramePager } from "./presentation.js";

var ZOOM_MIN = .1;
var ZOOM_MAX = 4;
var ZOOM_STEP = 1.25;
var CHROME_HIDE_MS = 2500;
/** True while focus sits inside the played frame — every player control
*  (nav, zoom, pan) yields to the page's own inputs and controls then. */
function contentHasFocus() {
	const active = document.activeElement;
	if (!active || active === document.body) return false;
	return !!active.closest("[data-canvas-content]");
}
/**
* Prototype player: shows ONE frame at a time on a dark backdrop, scaled to fit
* the viewport width (never upscaled past 1:1) and centered, scrolling when
* taller. The frames are the launch element and its siblings, so presenting a
* selected child presents that child (LUN-150). Prev/next buttons and ←/→ page
* through them; ⌘±/⌘0/⇧0 and Ctrl/Cmd+wheel zoom; Space-hold or middle-mouse
* drag pans when zoomed in. "Viewport size" renders at window size, unscaled.
* Chrome auto-hides after a moment of stillness and returns on toolbar hover or keypress.
* Rendered by PetalEditor in protoMode, reusing its loaded store/components/
* CSS. Content is rendered in `presentationMode` so real controls stay interactive.
*/
function ProtoPlayer(t0) {
	const $ = (0, import_compiler_runtime.c)(157);
	let onViewportSizedChange;
	let pageName;
	let render;
	let rootIds;
	let startId;
	let store;
	let t1;
	if ($[0] !== t0) {
		({store, rootIds, startId, pageName, initialViewportSized: t1, onViewportSizedChange, ...render} = t0);
		$[0] = t0;
		$[1] = onViewportSizedChange;
		$[2] = pageName;
		$[3] = render;
		$[4] = rootIds;
		$[5] = startId;
		$[6] = store;
		$[7] = t1;
	} else {
		onViewportSizedChange = $[1];
		pageName = $[2];
		render = $[3];
		rootIds = $[4];
		startId = $[5];
		store = $[6];
		t1 = $[7];
	}
	const initialViewportSized = t1 === void 0 ? false : t1;
	let t2;
	if ($[8] !== rootIds || $[9] !== startId || $[10] !== store) {
		t2 = {
			store,
			rootIds,
			startId,
			prevShortcut: LOCAL_SHORTCUTS.prototypePlayer.prev,
			nextShortcut: LOCAL_SHORTCUTS.prototypePlayer.next,
			isDisabled: contentHasFocus
		};
		$[8] = rootIds;
		$[9] = startId;
		$[10] = store;
		$[11] = t2;
	} else t2 = $[11];
	const { ids, index, currentId, go } = useFramePager(t2);
	let t3;
	let t4;
	if ($[12] !== pageName) {
		t3 = () => {
			if (!pageName) return;
			const prev = document.title;
			document.title = `${pageName} . Petal`;
			return () => {
				document.title = prev;
			};
		};
		t4 = [pageName];
		$[12] = pageName;
		$[13] = t3;
		$[14] = t4;
	} else {
		t3 = $[13];
		t4 = $[14];
	}
	(0, import_react.useEffect)(t3, t4);
	const [viewportW, setViewportW] = (0, import_react.useState)(_temp$40);
	let t5;
	let t6;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => {
			const onResize = () => setViewportW(window.innerWidth);
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		};
		t6 = [];
		$[15] = t5;
		$[16] = t6;
	} else {
		t5 = $[15];
		t6 = $[16];
	}
	(0, import_react.useEffect)(t5, t6);
	const surfaceRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(null);
	const [viewportSized, setViewportSized] = (0, import_react.useState)(initialViewportSized);
	let t7;
	if ($[17] !== onViewportSizedChange || $[18] !== viewportSized) {
		t7 = () => {
			setViewportSized(!viewportSized);
			onViewportSizedChange?.(!viewportSized);
		};
		$[17] = onViewportSizedChange;
		$[18] = viewportSized;
		$[19] = t7;
	} else t7 = $[19];
	const toggleViewportSized = t7;
	let t8;
	if ($[20] !== currentId || $[21] !== store || $[22] !== viewportSized) {
		t8 = !viewportSized && frameFillsSurface(store, currentId);
		$[20] = currentId;
		$[21] = store;
		$[22] = viewportSized;
		$[23] = t8;
	} else t8 = $[23];
	const fill = t8;
	const zoomLocked = viewportSized || fill;
	const { frameSize, fit } = useFitToWidth(frameRef, viewportW, `${currentId}:${viewportSized}`, !fill);
	const frameContent = useFrameContent(currentId, store, render, viewportSized);
	const [zoom, setZoom] = (0, import_react.useState)("fit");
	const [zoomFrameId, setZoomFrameId] = (0, import_react.useState)(currentId);
	if (currentId !== zoomFrameId) {
		setZoomFrameId(currentId);
		setZoom("fit");
	}
	const scale = zoomLocked ? 1 : zoom === "fit" ? fit : zoom;
	const pendingAnchor = (0, import_react.useRef)(null);
	let t9;
	if ($[24] !== fit || $[25] !== scale || $[26] !== zoomLocked) {
		t9 = (next, clientX, clientY) => {
			if (zoomLocked) return;
			const surface = surfaceRef.current;
			const frameEl = frameRef.current;
			const cur = scale;
			const target = next === "fit" ? fit : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
			if (surface && frameEl && target !== cur) {
				const rect = surface.getBoundingClientRect();
				const px = clientX ?? rect.left + rect.width / 2;
				const py = clientY ?? rect.top + rect.height / 2;
				const fRect = frameEl.getBoundingClientRect();
				pendingAnchor.current = {
					px,
					py,
					fx: (px - fRect.left) / cur,
					fy: (py - fRect.top) / cur
				};
			}
			setZoom(next === "fit" ? "fit" : target);
		};
		$[24] = fit;
		$[25] = scale;
		$[26] = zoomLocked;
		$[27] = t9;
	} else t9 = $[27];
	const applyZoom = t9;
	let t10;
	if ($[28] !== applyZoom || $[29] !== scale) {
		t10 = (e) => {
			const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
			applyZoom(scale * Math.exp(-dy * .002), e.clientX, e.clientY);
		};
		$[28] = applyZoom;
		$[29] = scale;
		$[30] = t10;
	} else t10 = $[30];
	const onWheelZoom = (0, import_react.useEffectEvent)(t10);
	let t11;
	if ($[31] !== applyZoom || $[32] !== scale || $[33] !== zoomLocked) {
		t11 = (e_0) => {
			if (zoomLocked || isTypingTarget(e_0) || contentHasFocus()) return;
			const S = LOCAL_SHORTCUTS.prototypePlayer;
			if (matchesShortcut(e_0, S.zoomIn)) {
				e_0.preventDefault();
				applyZoom(scale * ZOOM_STEP);
			} else if (matchesShortcut(e_0, S.zoomOut)) {
				e_0.preventDefault();
				applyZoom(scale / ZOOM_STEP);
			} else if (matchesShortcut(e_0, S.zoomFitWidth)) {
				e_0.preventDefault();
				applyZoom("fit");
			} else if (matchesShortcut(e_0, S.zoomActual)) {
				e_0.preventDefault();
				applyZoom(1);
			}
		};
		$[31] = applyZoom;
		$[32] = scale;
		$[33] = zoomLocked;
		$[34] = t11;
	} else t11 = $[34];
	const onKeyZoom = (0, import_react.useEffectEvent)(t11);
	let t12;
	let t13;
	if ($[35] !== scale) {
		t12 = () => {
			const a = pendingAnchor.current;
			const surface_0 = surfaceRef.current;
			const frameEl_0 = frameRef.current;
			if (!a || !surface_0 || !frameEl_0) return;
			pendingAnchor.current = null;
			const fRect_0 = frameEl_0.getBoundingClientRect();
			surface_0.scrollLeft = surface_0.scrollLeft + (fRect_0.left + a.fx * scale - a.px);
			surface_0.scrollTop = surface_0.scrollTop + (fRect_0.top + a.fy * scale - a.py);
		};
		t13 = [scale];
		$[35] = scale;
		$[36] = t12;
		$[37] = t13;
	} else {
		t12 = $[36];
		t13 = $[37];
	}
	(0, import_react.useLayoutEffect)(t12, t13);
	let t14;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => {
			const surface_1 = surfaceRef.current;
			if (surface_1) {
				surface_1.scrollLeft = 0;
				surface_1.scrollTop = 0;
			}
		};
		$[38] = t14;
	} else t14 = $[38];
	let t15;
	if ($[39] !== currentId) {
		t15 = [currentId];
		$[39] = currentId;
		$[40] = t15;
	} else t15 = $[40];
	(0, import_react.useLayoutEffect)(t14, t15);
	let t16;
	if ($[41] !== onWheelZoom || $[42] !== zoomLocked) {
		t16 = () => {
			const surface_2 = surfaceRef.current;
			if (!surface_2) return;
			const onWheel = (e_1) => {
				if (!e_1.ctrlKey && !e_1.metaKey) return;
				if (contentHasFocus() || zoomLocked) return;
				e_1.preventDefault();
				onWheelZoom(e_1);
			};
			surface_2.addEventListener("wheel", onWheel, { passive: false });
			return () => surface_2.removeEventListener("wheel", onWheel);
		};
		$[41] = onWheelZoom;
		$[42] = zoomLocked;
		$[43] = t16;
	} else t16 = $[43];
	let t17;
	if ($[44] !== currentId || $[45] !== zoomLocked) {
		t17 = [currentId, zoomLocked];
		$[44] = currentId;
		$[45] = zoomLocked;
		$[46] = t17;
	} else t17 = $[46];
	(0, import_react.useEffect)(t16, t17);
	let t18;
	if ($[47] !== onKeyZoom) {
		t18 = () => {
			const onKey = (e_2) => onKeyZoom(e_2);
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		};
		$[47] = onKeyZoom;
		$[48] = t18;
	} else t18 = $[48];
	let t19;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = [];
		$[49] = t19;
	} else t19 = $[49];
	(0, import_react.useEffect)(t18, t19);
	let t20;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = [];
		$[50] = t20;
	} else t20 = $[50];
	(0, import_react.useEffect)(_temp3$18, t20);
	const [spaceHeld, setSpaceHeld] = (0, import_react.useState)(false);
	const [panning, setPanning] = (0, import_react.useState)(false);
	let t21;
	let t22;
	if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = () => {
			const down = (e_4) => {
				if (e_4.code !== "Space" || e_4.repeat) return;
				if (isTypingTarget(e_4) || contentHasFocus()) return;
				if (chromeRef.current?.querySelector(":focus-visible")) return;
				e_4.preventDefault();
				setSpaceHeld(true);
			};
			const up = (e_5) => {
				if (e_5.code === "Space") setSpaceHeld(false);
			};
			const cancel = () => setSpaceHeld(false);
			window.addEventListener("keydown", down);
			window.addEventListener("keyup", up);
			window.addEventListener("blur", cancel);
			return () => {
				window.removeEventListener("keydown", down);
				window.removeEventListener("keyup", up);
				window.removeEventListener("blur", cancel);
			};
		};
		t22 = [];
		$[51] = t21;
		$[52] = t22;
	} else {
		t21 = $[51];
		t22 = $[52];
	}
	(0, import_react.useEffect)(t21, t22);
	let t23;
	if ($[53] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = (node, e_6) => {
			const surface_3 = surfaceRef.current;
			if (!surface_3) return;
			node.setPointerCapture(e_6.pointerId);
			setPanning(true);
			const sx = e_6.clientX;
			const sy = e_6.clientY;
			const sl = surface_3.scrollLeft;
			const st = surface_3.scrollTop;
			const move = (ev) => {
				surface_3.scrollLeft = sl - (ev.clientX - sx);
				surface_3.scrollTop = st - (ev.clientY - sy);
			};
			const end = () => {
				node.removeEventListener("pointermove", move);
				node.removeEventListener("pointerup", end);
				node.removeEventListener("pointercancel", end);
				setPanning(false);
			};
			node.addEventListener("pointermove", move);
			node.addEventListener("pointerup", end);
			node.addEventListener("pointercancel", end);
		};
		$[53] = t23;
	} else t23 = $[53];
	const beginPan = t23;
	let t24;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = () => {
			const surface_4 = surfaceRef.current;
			if (!surface_4) return;
			return registerPanSurface(surface_4, { beginPan(e_7) {
				beginPan(surface_4, e_7);
				return true;
			} });
		};
		$[54] = t24;
	} else t24 = $[54];
	let t25;
	if ($[55] !== currentId) {
		t25 = [currentId, beginPan];
		$[55] = currentId;
		$[56] = t25;
	} else t25 = $[56];
	(0, import_react.useEffect)(t24, t25);
	const [chromeVisible, setChromeVisible] = (0, import_react.useState)(true);
	const [hintShown, setHintShown] = (0, import_react.useState)(false);
	const chromeVisibleRef = (0, import_react.useRef)(true);
	const chromeRef = (0, import_react.useRef)(null);
	const hideTimer = (0, import_react.useRef)(void 0);
	let t26;
	if ($[57] === Symbol.for("react.memo_cache_sentinel")) {
		t26 = () => {
			const tryHide = () => {
				if (chromeRef.current?.matches(":hover") || chromeRef.current?.querySelector(":focus-visible")) {
					hideTimer.current = setTimeout(tryHide, CHROME_HIDE_MS);
					return;
				}
				chromeVisibleRef.current = false;
				setChromeVisible(false);
				setHintShown(true);
			};
			tryHide();
		};
		$[57] = t26;
	} else t26 = $[57];
	const hideChrome = t26;
	let t27;
	if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = () => {
			if (!chromeVisibleRef.current) {
				chromeVisibleRef.current = true;
				setChromeVisible(true);
			}
			clearTimeout(hideTimer.current);
			hideTimer.current = setTimeout(hideChrome, CHROME_HIDE_MS);
		};
		$[58] = t27;
	} else t27 = $[58];
	const showChrome = t27;
	let t28;
	let t29;
	if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = () => {
			hideTimer.current = setTimeout(hideChrome, CHROME_HIDE_MS);
			const onKeyShow = (e_8) => {
				if (isTypingTarget(e_8) || contentHasFocus()) return;
				showChrome();
			};
			window.addEventListener("keydown", onKeyShow);
			return () => {
				clearTimeout(hideTimer.current);
				window.removeEventListener("keydown", onKeyShow);
			};
		};
		t29 = [hideChrome, showChrome];
		$[59] = t28;
		$[60] = t29;
	} else {
		t28 = $[59];
		t29 = $[60];
	}
	(0, import_react.useEffect)(t28, t29);
	const [zoomDraft, setZoomDraft] = (0, import_react.useState)(null);
	const zoomBtnRef = (0, import_react.useRef)(null);
	const restoreZoomFocus = (0, import_react.useRef)(false);
	let t30;
	if ($[61] !== applyZoom || $[62] !== zoomDraft) {
		t30 = () => {
			const n = zoomDraft ? parseInt(zoomDraft, 10) : NaN;
			if (Number.isFinite(n) && n > 0) applyZoom(n / 100);
			setZoomDraft(null);
		};
		$[61] = applyZoom;
		$[62] = zoomDraft;
		$[63] = t30;
	} else t30 = $[63];
	const commitZoomDraft = t30;
	let t31;
	let t32;
	if ($[64] !== zoomDraft) {
		t31 = () => {
			if (zoomDraft === null && restoreZoomFocus.current) {
				restoreZoomFocus.current = false;
				zoomBtnRef.current?.focus();
			}
		};
		t32 = [zoomDraft];
		$[64] = zoomDraft;
		$[65] = t31;
		$[66] = t32;
	} else {
		t31 = $[65];
		t32 = $[66];
	}
	(0, import_react.useEffect)(t31, t32);
	const pct = Math.round(scale * 100);
	const chromeCls = `transition-opacity duration-200 ${chromeVisible ? "opacity-100" : "opacity-0"}`;
	const hintCls = `transition-opacity duration-200 ${chromeVisible && !hintShown ? "opacity-100" : "opacity-0"}`;
	if (!currentId) {
		let t33;
		if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
			t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-medium text-ed-background",
				children: "Nothing to present"
			});
			$[67] = t33;
		} else t33 = $[67];
		const t34 = pageName ? `“${pageName}” has no frames yet.` : "This page has no frames yet.";
		let t35;
		if ($[68] !== t34) {
			t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t33, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ed-background/60",
				children: t34
			})] });
			$[68] = t34;
			$[69] = t35;
		} else t35 = $[69];
		let t36;
		if ($[70] === Symbol.for("react.memo_cache_sentinel")) {
			t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: _temp4$18,
				className: "rounded-md border border-ed-background/20 px-3 py-1.5 text-sm text-ed-background/80 hover:bg-ed-background/10 hover:text-ed-background",
				children: "Close"
			});
			$[70] = t36;
		} else t36 = $[70];
		let t37;
		if ($[71] !== t35) {
			t37 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 flex flex-col items-center justify-center gap-4 bg-ed-foreground text-center",
				children: [t35, t36]
			});
			$[71] = t35;
			$[72] = t37;
		} else t37 = $[72];
		return t37;
	}
	let t33;
	if ($[73] !== pct) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sr-only",
			"aria-live": "polite",
			children: [
				"Zoom ",
				pct,
				"%"
			]
		});
		$[73] = pct;
		$[74] = t33;
	} else t33 = $[74];
	const t34 = `fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center border border-ed-border bg-ed-background shadow-lg ${chromeCls}`;
	let t35;
	if ($[75] === Symbol.for("react.memo_cache_sentinel")) {
		t35 = {
			gap: 6,
			height: 52,
			paddingLeft: 6,
			paddingRight: 6,
			borderRadius: 12
		};
		$[75] = t35;
	} else t35 = $[75];
	let t36;
	if ($[76] !== go || $[77] !== ids.length) {
		t36 = ids.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => go(-1),
			"aria-label": "Previous frame",
			className: "flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 20 })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-px bg-ed-border" })] });
		$[76] = go;
		$[77] = ids.length;
		$[78] = t36;
	} else t36 = $[78];
	const t37 = pageName ? `${pageName} · ` : "";
	const t38 = index + 1;
	let t39;
	if ($[79] !== ids.length || $[80] !== t37 || $[81] !== t38) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-live": "polite",
			className: "px-2 text-xs font-medium tabular-nums text-ed-muted-foreground",
			children: [
				t37,
				t38,
				" / ",
				ids.length
			]
		});
		$[79] = ids.length;
		$[80] = t37;
		$[81] = t38;
		$[82] = t39;
	} else t39 = $[82];
	let t40;
	if ($[83] !== go || $[84] !== ids.length) {
		t40 = ids.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-px bg-ed-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => go(1),
			"aria-label": "Next frame",
			className: "flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 20 })
		})] });
		$[83] = go;
		$[84] = ids.length;
		$[85] = t40;
	} else t40 = $[85];
	let t41;
	if ($[86] !== t34 || $[87] !== t36 || $[88] !== t39 || $[89] !== t40) {
		t41 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Prototype frames",
			className: t34,
			style: t35,
			children: [
				t36,
				t39,
				t40
			]
		});
		$[86] = t34;
		$[87] = t36;
		$[88] = t39;
		$[89] = t40;
		$[90] = t41;
	} else t41 = $[90];
	const t42 = `fixed bottom-20 right-4 z-10 flex items-center border border-ed-border bg-ed-background shadow-lg sm:bottom-4 ${chromeCls}`;
	let t43;
	if ($[91] === Symbol.for("react.memo_cache_sentinel")) {
		t43 = {
			gap: 6,
			height: 52,
			paddingLeft: 6,
			paddingRight: 6,
			borderRadius: 12
		};
		$[91] = t43;
	} else t43 = $[91];
	let t44;
	if ($[92] !== applyZoom || $[93] !== scale) {
		t44 = Math.round(scale * 100) !== 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => applyZoom(1),
			"aria-label": "Zoom to 100%",
			className: "flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 15 })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-px bg-ed-border" })] });
		$[92] = applyZoom;
		$[93] = scale;
		$[94] = t44;
	} else t44 = $[94];
	let t45;
	if ($[95] !== applyZoom || $[96] !== scale) {
		t45 = () => applyZoom(scale / ZOOM_STEP);
		$[95] = applyZoom;
		$[96] = scale;
		$[97] = t45;
	} else t45 = $[97];
	const t46 = zoomLocked || pct <= Math.round(ZOOM_MIN * 100);
	let t47;
	if ($[98] === Symbol.for("react.memo_cache_sentinel")) {
		t47 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 16 });
		$[98] = t47;
	} else t47 = $[98];
	let t48;
	if ($[99] !== t45 || $[100] !== t46) {
		t48 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: t45,
			"aria-label": "Zoom out",
			disabled: t46,
			className: "flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground disabled:opacity-40 disabled:pointer-events-none",
			children: t47
		});
		$[99] = t45;
		$[100] = t46;
		$[101] = t48;
	} else t48 = $[101];
	let t49;
	if ($[102] !== commitZoomDraft || $[103] !== pct || $[104] !== scale || $[105] !== zoomDraft || $[106] !== zoomLocked) {
		t49 = zoomDraft !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			autoFocus: true,
			value: zoomDraft,
			onChange: (e_9) => setZoomDraft(e_9.target.value.replace(/\D/g, "")),
			onFocus: _temp5$16,
			onBlur: commitZoomDraft,
			onKeyDown: (e_11) => {
				if (e_11.key === "Enter") {
					e_11.preventDefault();
					restoreZoomFocus.current = true;
					commitZoomDraft();
				} else if (e_11.key === "Escape") {
					e_11.preventDefault();
					restoreZoomFocus.current = true;
					setZoomDraft(null);
				}
			},
			"aria-label": "Zoom percentage",
			inputMode: "numeric",
			className: "h-10 w-14 rounded-md border border-ed-border bg-transparent text-center text-xs font-medium tabular-nums text-ed-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-ring"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			ref: zoomBtnRef,
			type: "button",
			onClick: () => setZoomDraft(String(Math.round(scale * 100))),
			disabled: zoomLocked,
			"aria-label": zoomLocked ? `Zoom ${pct}%` : `Zoom ${pct}%, edit`,
			className: "flex h-10 items-center rounded-md px-1.5 text-xs font-medium tabular-nums text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground disabled:opacity-40 disabled:pointer-events-none",
			children: [pct, "%"]
		});
		$[102] = commitZoomDraft;
		$[103] = pct;
		$[104] = scale;
		$[105] = zoomDraft;
		$[106] = zoomLocked;
		$[107] = t49;
	} else t49 = $[107];
	let t50;
	if ($[108] !== applyZoom || $[109] !== scale) {
		t50 = () => applyZoom(scale * ZOOM_STEP);
		$[108] = applyZoom;
		$[109] = scale;
		$[110] = t50;
	} else t50 = $[110];
	const t51 = zoomLocked || pct >= Math.round(400);
	let t52;
	if ($[111] === Symbol.for("react.memo_cache_sentinel")) {
		t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 });
		$[111] = t52;
	} else t52 = $[111];
	let t53;
	if ($[112] !== t50 || $[113] !== t51) {
		t53 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: t50,
			"aria-label": "Zoom in",
			disabled: t51,
			className: "flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground disabled:opacity-40 disabled:pointer-events-none",
			children: t52
		});
		$[112] = t50;
		$[113] = t51;
		$[114] = t53;
	} else t53 = $[114];
	let t54;
	if ($[115] === Symbol.for("react.memo_cache_sentinel")) {
		t54 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-px bg-ed-border" });
		$[115] = t54;
	} else t54 = $[115];
	const t55 = viewportSized && "bg-ed-accent text-ed-foreground";
	let t56;
	if ($[116] !== t55) {
		t56 = cn$2("flex size-10 items-center justify-center rounded-md text-ed-muted-foreground hover:bg-ed-accent hover:text-ed-foreground", t55);
		$[116] = t55;
		$[117] = t56;
	} else t56 = $[117];
	let t57;
	if ($[118] === Symbol.for("react.memo_cache_sentinel")) {
		t57 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fullscreen, { size: 16 });
		$[118] = t57;
	} else t57 = $[118];
	let t58;
	if ($[119] !== t56 || $[120] !== toggleViewportSized || $[121] !== viewportSized) {
		t58 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: toggleViewportSized,
			"aria-pressed": viewportSized,
			"aria-label": "Viewport size — size the frame to the window",
			className: t56,
			children: t57
		});
		$[119] = t56;
		$[120] = toggleViewportSized;
		$[121] = viewportSized;
		$[122] = t58;
	} else t58 = $[122];
	let t59;
	if ($[123] !== t42 || $[124] !== t44 || $[125] !== t48 || $[126] !== t49 || $[127] !== t53 || $[128] !== t58) {
		t59 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "toolbar",
			"aria-label": "Zoom",
			className: t42,
			style: t43,
			children: [
				t44,
				t48,
				t49,
				t53,
				t54,
				t58
			]
		});
		$[123] = t42;
		$[124] = t44;
		$[125] = t48;
		$[126] = t49;
		$[127] = t53;
		$[128] = t58;
		$[129] = t59;
	} else t59 = $[129];
	let t60;
	if ($[130] !== hintCls || $[131] !== zoomLocked) {
		t60 = !zoomLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: `pointer-events-none fixed bottom-20 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-xs text-ed-muted-foreground max-sm:bottom-40 ${hintCls}`,
			children: "Hold Space and drag to pan · Ctrl+scroll to zoom"
		});
		$[130] = hintCls;
		$[131] = zoomLocked;
		$[132] = t60;
	} else t60 = $[132];
	let t61;
	if ($[133] !== t41 || $[134] !== t59 || $[135] !== t60) {
		t61 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: chromeRef,
			onPointerEnter: showChrome,
			children: [
				t41,
				t59,
				t60
			]
		});
		$[133] = t41;
		$[134] = t59;
		$[135] = t60;
		$[136] = t61;
	} else t61 = $[136];
	const t62 = `isolate w-screen h-screen bg-[#1e1e1e] overflow-auto ${zoomLocked ? "block" : "flex"}`;
	let t63;
	if ($[137] !== zoomLocked) {
		t63 = zoomLocked ? { scrollbarWidth: "none" } : {
			scrollbarWidth: "none",
			alignItems: "safe center",
			justifyContent: "safe center"
		};
		$[137] = zoomLocked;
		$[138] = t63;
	} else t63 = $[138];
	let t64;
	if ($[139] !== fill || $[140] !== frameContent || $[141] !== frameSize || $[142] !== scale || $[143] !== viewportSized) {
		t64 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresentationFrame, {
			frameRef,
			frameSize,
			fit: scale,
			viewportSized,
			fill,
			children: frameContent
		});
		$[139] = fill;
		$[140] = frameContent;
		$[141] = frameSize;
		$[142] = scale;
		$[143] = viewportSized;
		$[144] = t64;
	} else t64 = $[144];
	let t65;
	if ($[145] !== t62 || $[146] !== t63 || $[147] !== t64) {
		t65 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: surfaceRef,
			"data-proto-surface": true,
			className: t62,
			style: t63,
			children: t64
		});
		$[145] = t62;
		$[146] = t63;
		$[147] = t64;
		$[148] = t65;
	} else t65 = $[148];
	let t66;
	if ($[149] !== panning || $[150] !== spaceHeld) {
		t66 = (spaceHeld || panning) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[5]",
			style: { cursor: panning ? "grabbing" : "grab" },
			onPointerDown: (e_12) => {
				e_12.preventDefault();
				beginPan(e_12.currentTarget, e_12);
			}
		});
		$[149] = panning;
		$[150] = spaceHeld;
		$[151] = t66;
	} else t66 = $[151];
	let t67;
	if ($[152] !== t33 || $[153] !== t61 || $[154] !== t65 || $[155] !== t66) {
		t67 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t33,
			t61,
			t65,
			t66
		] });
		$[152] = t33;
		$[153] = t61;
		$[154] = t65;
		$[155] = t66;
		$[156] = t67;
	} else t67 = $[156];
	return t67;
}
function _temp5$16(e_10) {
	return e_10.currentTarget.select();
}
function _temp4$18() {
	return window.close();
}
function _temp3$18() {
	const onKey_0 = _temp2$23;
	window.addEventListener("keydown", onKey_0);
	return () => window.removeEventListener("keydown", onKey_0);
}
function _temp2$23(e_3) {
	if (e_3.key !== "Escape" || !contentHasFocus()) return;
	document.activeElement?.blur();
}
function _temp$40() {
	return typeof window !== "undefined" ? window.innerWidth : 1280;
}

export { ProtoPlayer };
