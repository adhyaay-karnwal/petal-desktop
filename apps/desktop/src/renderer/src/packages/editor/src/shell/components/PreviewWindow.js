// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/PreviewWindow.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { ArrowUpRight, ChevronLeft, ChevronRight, RotateCcw, X$1 } from "../../../../../vendor/lucide-react.js";
import { PresentationFrame, frameFillsSurface, useFitToWidth, useFrameContent, useFramePager } from "./presentation.js";

var MIN_W = 280;
var MIN_H = 160;
/**
* Shift+Space preview: a small, draggable, resizable floating window (dark title bar with
* prev/next, restart, pop-out, close) showing one frame fit-to-width. The frames are the
* launch element and its siblings, so previewing a selected child previews that child
* (LUN-150). Rendered over the editor by PetalEditor; reuses the loaded store/
* components/CSS. The full-screen present lives in ProtoPlayer (the /proto route).
*/
function PreviewWindow(t0) {
	const $ = (0, import_compiler_runtime.c)(74);
	let onClose;
	let onPopOut;
	let render;
	let rootIds;
	let startId;
	let store;
	if ($[0] !== t0) {
		({store, rootIds, startId, onClose, onPopOut, ...render} = t0);
		$[0] = t0;
		$[1] = onClose;
		$[2] = onPopOut;
		$[3] = render;
		$[4] = rootIds;
		$[5] = startId;
		$[6] = store;
	} else {
		onClose = $[1];
		onPopOut = $[2];
		render = $[3];
		rootIds = $[4];
		startId = $[5];
		store = $[6];
	}
	let t1;
	if ($[7] !== rootIds || $[8] !== startId || $[9] !== store) {
		t1 = {
			store,
			rootIds,
			startId,
			prevShortcut: LOCAL_SHORTCUTS.previewWindow.prev,
			nextShortcut: LOCAL_SHORTCUTS.previewWindow.next
		};
		$[7] = rootIds;
		$[8] = startId;
		$[9] = store;
		$[10] = t1;
	} else t1 = $[10];
	const { ids, index, currentId, go, goTo } = useFramePager(t1);
	let t2;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			w: 686,
			h: 427
		};
		$[11] = t2;
	} else t2 = $[11];
	const [size, setSize] = (0, import_react.useState)(t2);
	let t3;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = {
			x: 96,
			y: 96
		};
		$[12] = t3;
	} else t3 = $[12];
	const [pos, setPos] = (0, import_react.useState)(t3);
	let t4;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = {
			x: 96,
			y: 96
		};
		$[13] = t4;
	} else t4 = $[13];
	const posRef = (0, import_react.useRef)(t4);
	const winRef = (0, import_react.useRef)(null);
	const bodyRef = (0, import_react.useRef)(null);
	const sizerRef = (0, import_react.useRef)(null);
	const frameScaleRef = (0, import_react.useRef)(null);
	let t5;
	if ($[14] !== currentId || $[15] !== store) {
		t5 = frameFillsSurface(store, currentId);
		$[14] = currentId;
		$[15] = store;
		$[16] = t5;
	} else t5 = $[16];
	const fill = t5;
	const { frameSize, frameSizeRef, fit } = useFitToWidth(frameScaleRef, size.w, currentId, !fill);
	const frameContent = useFrameContent(currentId, store, render);
	let t6;
	let t7;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			winRef.current?.focus();
		};
		t7 = [];
		$[17] = t6;
		$[18] = t7;
	} else {
		t6 = $[17];
		t7 = $[18];
	}
	(0, import_react.useEffect)(t6, t7);
	let t8;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = (e) => {
			if (e.target.closest("button")) return;
			const startX = e.clientX;
			const startY = e.clientY;
			const origX = posRef.current.x;
			const origY = posRef.current.y;
			const move = (ev) => {
				const x = origX + (ev.clientX - startX);
				const y = origY + (ev.clientY - startY);
				posRef.current = {
					x,
					y
				};
				const node = winRef.current;
				if (node) {
					node.style.left = `${x}px`;
					node.style.top = `${y}px`;
				}
			};
			const cleanup = () => {
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", cleanup);
				window.removeEventListener("pointercancel", cleanup);
				setPos(posRef.current);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", cleanup);
			window.addEventListener("pointercancel", cleanup);
		};
		$[19] = t8;
	} else t8 = $[19];
	const onTitleDown = t8;
	let t9;
	if ($[20] !== fill || $[21] !== frameSizeRef || $[22] !== size.h || $[23] !== size.w) {
		t9 = (e_0, dirs) => {
			e_0.preventDefault();
			e_0.stopPropagation();
			const startX_0 = e_0.clientX;
			const startY_0 = e_0.clientY;
			const origW = size.w;
			const origH = size.h;
			const origX_0 = posRef.current.x;
			const origY_0 = posRef.current.y;
			const calc = (ev_0) => {
				const dx = ev_0.clientX - startX_0;
				const dy = ev_0.clientY - startY_0;
				let newW = origW;
				let newH = origH;
				let newX = origX_0;
				if (dirs.e) newW = Math.max(MIN_W, origW + dx);
				if (dirs.w) {
					newW = Math.max(MIN_W, origW - dx);
					newX = origX_0 + (origW - newW);
				}
				if (dirs.s) newH = Math.max(MIN_H, origH + dy);
				return {
					newW,
					newH,
					newX
				};
			};
			const move_0 = (ev_1) => {
				const { newW: newW_0, newH: newH_0, newX: newX_0 } = calc(ev_1);
				if (dirs.w) posRef.current = {
					x: newX_0,
					y: origY_0
				};
				const win = winRef.current;
				if (win) {
					win.style.width = `${newW_0}px`;
					win.style.left = `${newX_0}px`;
				}
				const body = bodyRef.current;
				if (body) {
					body.style.width = `${newW_0}px`;
					body.style.height = `${newH_0}px`;
				}
				if (fill) return;
				const fs = frameSizeRef.current;
				const f = fs ? Math.min(newW_0 / fs.w, 1) : 1;
				const sizer = sizerRef.current;
				if (sizer && fs) {
					sizer.style.width = `${fs.w * f}px`;
					sizer.style.height = `${fs.h * f}px`;
				}
				const scale = frameScaleRef.current;
				if (scale) scale.style.transform = `scale(${f})`;
			};
			const up = (ev_2) => {
				const { newW: newW_1, newH: newH_1, newX: newX_1 } = calc(ev_2);
				setSize({
					w: newW_1,
					h: newH_1
				});
				if (dirs.w) {
					posRef.current = {
						x: newX_1,
						y: origY_0
					};
					setPos({
						x: newX_1,
						y: origY_0
					});
				}
				cleanup_0();
			};
			const cleanup_0 = () => {
				window.removeEventListener("pointermove", move_0);
				window.removeEventListener("pointerup", up);
				window.removeEventListener("pointercancel", cleanup_0);
			};
			window.addEventListener("pointermove", move_0);
			window.addEventListener("pointerup", up);
			window.addEventListener("pointercancel", cleanup_0);
		};
		$[20] = fill;
		$[21] = frameSizeRef;
		$[22] = size.h;
		$[23] = size.w;
		$[24] = t9;
	} else t9 = $[24];
	const startResize = t9;
	let t10;
	if ($[25] !== pos.x || $[26] !== pos.y || $[27] !== size.w) {
		t10 = {
			left: pos.x,
			top: pos.y,
			width: size.w
		};
		$[25] = pos.x;
		$[26] = pos.y;
		$[27] = size.w;
		$[28] = t10;
	} else t10 = $[28];
	let t11;
	if ($[29] !== go || $[30] !== goTo || $[31] !== ids.length || $[32] !== index) {
		t11 = ids.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-7 items-center justify-center rounded text-ed-background/70 hover:bg-ed-background/10 hover:text-ed-background",
				onClick: () => go(-1),
				"aria-label": "Previous frame",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 16 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-7 items-center justify-center rounded text-ed-background/70 hover:bg-ed-background/10 hover:text-ed-background",
				onClick: () => go(1),
				"aria-label": "Next frame",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 16 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-7 items-center justify-center rounded text-ed-background/70 hover:bg-ed-background/10 hover:text-ed-background",
				onClick: () => goTo(0),
				"aria-label": "Restart",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 15 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-1.5 text-[11px] font-medium tabular-nums text-ed-background/70",
				children: [
					index + 1,
					" / ",
					ids.length
				]
			})
		] });
		$[29] = go;
		$[30] = goTo;
		$[31] = ids.length;
		$[32] = index;
		$[33] = t11;
	} else t11 = $[33];
	let t12;
	if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" });
		$[34] = t12;
	} else t12 = $[34];
	let t13;
	if ($[35] !== onPopOut) {
		t13 = onPopOut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "flex size-7 items-center justify-center rounded text-ed-background/70 hover:bg-ed-background/10 hover:text-ed-background",
			onClick: onPopOut,
			"aria-label": "Open full preview",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 16 })
		});
		$[35] = onPopOut;
		$[36] = t13;
	} else t13 = $[36];
	let t14;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X$1, { size: 16 });
		$[37] = t14;
	} else t14 = $[37];
	let t15;
	if ($[38] !== onClose) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "flex size-7 items-center justify-center rounded text-ed-background/70 hover:bg-ed-background/10 hover:text-ed-background",
			onClick: onClose,
			"aria-label": "Close preview",
			children: t14
		});
		$[38] = onClose;
		$[39] = t15;
	} else t15 = $[39];
	let t16;
	if ($[40] !== t11 || $[41] !== t13 || $[42] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onPointerDown: onTitleDown,
			className: "flex h-9 items-center gap-0.5 bg-ed-foreground px-1.5 cursor-grab",
			children: [
				t11,
				t12,
				t13,
				t15
			]
		});
		$[40] = t11;
		$[41] = t13;
		$[42] = t15;
		$[43] = t16;
	} else t16 = $[43];
	let t17;
	if ($[44] !== size.h || $[45] !== size.w) {
		t17 = {
			width: size.w,
			height: size.h,
			scrollbarWidth: "none",
			alignItems: "safe center"
		};
		$[44] = size.h;
		$[45] = size.w;
		$[46] = t17;
	} else t17 = $[46];
	let t18;
	if ($[47] !== fill || $[48] !== fit || $[49] !== frameContent || $[50] !== frameSize) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresentationFrame, {
			frameRef: frameScaleRef,
			sizerRef,
			frameSize,
			fit,
			fill,
			children: frameContent
		});
		$[47] = fill;
		$[48] = fit;
		$[49] = frameContent;
		$[50] = frameSize;
		$[51] = t18;
	} else t18 = $[51];
	let t19;
	if ($[52] !== t17 || $[53] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: bodyRef,
			className: "flex justify-center overflow-auto bg-[#1e1e1e]",
			style: t17,
			children: t18
		});
		$[52] = t17;
		$[53] = t18;
		$[54] = t19;
	} else t19 = $[54];
	let t20;
	if ($[55] !== startResize) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 right-0 w-1.5 cursor-ew-resize",
			onPointerDown: (e_1) => startResize(e_1, { e: true })
		});
		$[55] = startResize;
		$[56] = t20;
	} else t20 = $[56];
	let t21;
	if ($[57] !== startResize) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 left-0 w-1.5 cursor-ew-resize",
			onPointerDown: (e_2) => startResize(e_2, { w: true })
		});
		$[57] = startResize;
		$[58] = t21;
	} else t21 = $[58];
	let t22;
	if ($[59] !== startResize) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize",
			onPointerDown: (e_3) => startResize(e_3, { s: true })
		});
		$[59] = startResize;
		$[60] = t22;
	} else t22 = $[60];
	let t23;
	if ($[61] !== startResize) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute bottom-0 right-0 z-10 size-3 cursor-nwse-resize",
			onPointerDown: (e_4) => startResize(e_4, {
				e: true,
				s: true
			})
		});
		$[61] = startResize;
		$[62] = t23;
	} else t23 = $[62];
	let t24;
	if ($[63] !== startResize) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute bottom-0 left-0 z-10 size-3 cursor-nesw-resize",
			onPointerDown: (e_5) => startResize(e_5, {
				w: true,
				s: true
			})
		});
		$[63] = startResize;
		$[64] = t24;
	} else t24 = $[64];
	let t25;
	if ($[65] !== t10 || $[66] !== t16 || $[67] !== t19 || $[68] !== t20 || $[69] !== t21 || $[70] !== t22 || $[71] !== t23 || $[72] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: winRef,
			role: "dialog",
			"aria-label": "Preview",
			tabIndex: -1,
			className: "fixed z-[100] overflow-hidden rounded-[10px] bg-ed-background shadow-2xl",
			style: t10,
			children: [
				t16,
				t19,
				t20,
				t21,
				t22,
				t23,
				t24
			]
		});
		$[65] = t10;
		$[66] = t16;
		$[67] = t19;
		$[68] = t20;
		$[69] = t21;
		$[70] = t22;
		$[71] = t23;
		$[72] = t24;
		$[73] = t25;
	} else t25 = $[73];
	return t25;
}

export { PreviewWindow };
