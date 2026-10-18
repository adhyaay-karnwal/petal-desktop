// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/presentation.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getById, getChildren$2, getParentId, resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { isTypingTarget, matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { frameRootIsUnsized, renderTree } from "../../canvas/utils/renderElement.js";

/** The launch element and its siblings; a top-level frame's parent is ROOT, so
*  launching from one yields the page's root frames. Owned text leaves are not
*  frames of their own, so they are dropped and resolved through. */
function resolvePresentationFrames(store, rootIds, startId) {
	if (!startId || !getById(store, startId)) return {
		ids: rootIds,
		startIndex: 0
	};
	const target = resolveTextOwner(store, startId);
	const parent = getParentId(store, target);
	const ids = (parent == null ? rootIds : getChildren$2(store, parent)).filter((id) => resolveTextOwner(store, id) === id);
	return {
		ids,
		startIndex: Math.max(0, ids.indexOf(target))
	};
}
/** True when the frame root has no box of its own, so the surface supplies it
*  instead of shrink-wrapping the frame. */
function frameFillsSurface(store, id) {
	if (!id) return false;
	return frameRootIsUnsized(getById(store, id)?.styles);
}
/**
* Paging state shared by both presentation surfaces: resolve the frame set the
* launch element belongs to, track the current index, and wire ←/→ (or the given
* local shortcuts) to step through it — skipping keystrokes aimed at text inputs.
*/
function useFramePager(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { store, rootIds, startId, prevShortcut, nextShortcut, isDisabled } = t0;
	let t1;
	if ($[0] !== rootIds || $[1] !== startId || $[2] !== store) {
		t1 = resolvePresentationFrames(store, rootIds, startId);
		$[0] = rootIds;
		$[1] = startId;
		$[2] = store;
		$[3] = t1;
	} else t1 = $[3];
	const { ids, startIndex } = t1;
	const [index, setIndex] = (0, import_react.useState)(startIndex);
	let t2;
	let t3;
	if ($[4] !== startIndex) {
		t2 = () => {
			setIndex(startIndex);
		};
		t3 = [startIndex];
		$[4] = startIndex;
		$[5] = t2;
		$[6] = t3;
	} else {
		t2 = $[5];
		t3 = $[6];
	}
	(0, import_react.useEffect)(t2, t3);
	const safeIndex = ids.length ? Math.min(index, ids.length - 1) : 0;
	let t4;
	if ($[7] !== ids.length) {
		t4 = (delta) => {
			setIndex((i) => ids.length ? (Math.min(i, ids.length - 1) + delta + ids.length) % ids.length : 0);
		};
		$[7] = ids.length;
		$[8] = t4;
	} else t4 = $[8];
	const go = t4;
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (i_0) => setIndex(i_0);
		$[9] = t5;
	} else t5 = $[9];
	const goTo = t5;
	let t6;
	if ($[10] !== isDisabled) {
		t6 = () => isDisabled?.() ?? false;
		$[10] = isDisabled;
		$[11] = t6;
	} else t6 = $[11];
	const disabled = (0, import_react.useEffectEvent)(t6);
	let t7;
	if ($[12] !== disabled || $[13] !== go || $[14] !== nextShortcut || $[15] !== prevShortcut) {
		t7 = () => {
			const onKey = (e) => {
				if (isTypingTarget(e) || disabled()) return;
				if (matchesShortcut(e, nextShortcut)) {
					e.preventDefault();
					go(1);
				} else if (matchesShortcut(e, prevShortcut)) {
					e.preventDefault();
					go(-1);
				}
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		};
		$[12] = disabled;
		$[13] = go;
		$[14] = nextShortcut;
		$[15] = prevShortcut;
		$[16] = t7;
	} else t7 = $[16];
	let t8;
	if ($[17] !== go || $[18] !== nextShortcut || $[19] !== prevShortcut) {
		t8 = [
			go,
			prevShortcut,
			nextShortcut
		];
		$[17] = go;
		$[18] = nextShortcut;
		$[19] = prevShortcut;
		$[20] = t8;
	} else t8 = $[20];
	(0, import_react.useEffect)(t7, t8);
	const t9 = ids[safeIndex];
	let t10;
	if ($[21] !== go || $[22] !== ids || $[23] !== safeIndex || $[24] !== t9) {
		t10 = {
			ids,
			index: safeIndex,
			currentId: t9,
			go,
			goTo
		};
		$[21] = go;
		$[22] = ids;
		$[23] = safeIndex;
		$[24] = t9;
		$[25] = t10;
	} else t10 = $[25];
	return t10;
}
/**
* Render one frame in presentation mode (no editor wrappers, iframes live).
* Walks the frame tree via renderElement — expensive, so this stays memoized.
*/
function useFrameContent(currentId, store, render, t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const viewportSized = t0 === void 0 ? false : t0;
	const { components, componentIndex, iconLibraries, assetResolver } = render;
	let t1;
	if ($[0] !== assetResolver || $[1] !== componentIndex || $[2] !== components || $[3] !== currentId || $[4] !== iconLibraries || $[5] !== store || $[6] !== viewportSized) {
		t1 = currentId ? renderTree(currentId, store, {
			components,
			componentIndex,
			iconLibraries,
			assetResolver,
			presentationMode: true,
			isFrameRoot: true,
			frameRootViewportSized: viewportSized
		}) : null;
		$[0] = assetResolver;
		$[1] = componentIndex;
		$[2] = components;
		$[3] = currentId;
		$[4] = iconLibraries;
		$[5] = store;
		$[6] = viewportSized;
		$[7] = t1;
	} else t1 = $[7];
	return t1;
}
/**
* Measure the frame's real rendered box (offsetWidth/Height — pre-transform, so
* accurate under the scale() below) and derive a fit-to-WIDTH factor against the
* container: never upscale past 1:1, and let tall frames scroll instead of being
* crushed to fit the height. Reading the layout box beats element.styles.width/
* height, which misses sizes coming from a class, inheritance, or another prop.
* `frameSizeRef` mirrors the size for imperative (per-pointermove) consumers.
*/
function useFitToWidth(ref, containerWidth, resetKey, t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const enabled = t0 === void 0 ? true : t0;
	const [measured, setMeasured] = (0, import_react.useState)(null);
	const frameSizeRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== enabled || $[1] !== ref) {
		t1 = () => {
			if (!enabled) {
				frameSizeRef.current = null;
				return;
			}
			const node = ref.current;
			if (!node) return;
			const measure = () => {
				const s = {
					w: node.offsetWidth,
					h: node.offsetHeight
				};
				frameSizeRef.current = s;
				setMeasured(s);
			};
			measure();
			const ro = new ResizeObserver(measure);
			ro.observe(node);
			return () => ro.disconnect();
		};
		$[0] = enabled;
		$[1] = ref;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== enabled || $[4] !== ref || $[5] !== resetKey) {
		t2 = [
			ref,
			resetKey,
			enabled
		];
		$[3] = enabled;
		$[4] = ref;
		$[5] = resetKey;
		$[6] = t2;
	} else t2 = $[6];
	(0, import_react.useLayoutEffect)(t1, t2);
	const frameSize = enabled ? measured : null;
	const fit = frameSize ? Math.min(containerWidth / frameSize.w, 1) : 1;
	let t3;
	if ($[7] !== fit || $[8] !== frameSize) {
		t3 = {
			frameSize,
			frameSizeRef,
			fit
		};
		$[7] = fit;
		$[8] = frameSize;
		$[9] = t3;
	} else t3 = $[9];
	return t3;
}
/**
* The scaled frame box. The sizer takes the *scaled* footprint (overflow hidden)
* so the flex parent lays out and scrolls against the painted size — transform:
* scale() alone leaves the layout box at natural size, overflowing when the frame
* is wider than the container. Top-left origin keeps the two aligned.
*/
function PresentationFrame(t0) {
	const $ = (0, import_compiler_runtime.c)(29);
	const { frameRef, sizerRef, frameSize, fit, viewportSized: t1, fill: t2, children } = t0;
	const viewportSized = t1 === void 0 ? false : t1;
	const fill = t2 === void 0 ? false : t2;
	if (viewportSized) {
		let t3;
		if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
			t3 = {
				width: "100%",
				minHeight: "100vh"
			};
			$[0] = t3;
		} else t3 = $[0];
		let t4;
		if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
			t4 = {
				width: "100%",
				minHeight: "100vh"
			};
			$[1] = t4;
		} else t4 = $[1];
		let t5;
		if ($[2] !== children || $[3] !== frameRef) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: frameRef,
				"data-canvas-content": true,
				"data-live-content": true,
				style: t4,
				children
			});
			$[2] = children;
			$[3] = frameRef;
			$[4] = t5;
		} else t5 = $[4];
		let t6;
		if ($[5] !== sizerRef || $[6] !== t5) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: sizerRef,
				style: t3,
				children: t5
			});
			$[5] = sizerRef;
			$[6] = t5;
			$[7] = t6;
		} else t6 = $[7];
		return t6;
	}
	if (fill) {
		let t3;
		if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
			t3 = {
				width: "100%",
				height: "100%"
			};
			$[8] = t3;
		} else t3 = $[8];
		let t4;
		if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
			t4 = {
				width: "100%",
				height: "100%"
			};
			$[9] = t4;
		} else t4 = $[9];
		let t5;
		if ($[10] !== children || $[11] !== frameRef) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: frameRef,
				"data-canvas-content": true,
				"data-live-content": true,
				style: t4,
				children
			});
			$[10] = children;
			$[11] = frameRef;
			$[12] = t5;
		} else t5 = $[12];
		let t6;
		if ($[13] !== sizerRef || $[14] !== t5) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: sizerRef,
				style: t3,
				children: t5
			});
			$[13] = sizerRef;
			$[14] = t5;
			$[15] = t6;
		} else t6 = $[15];
		return t6;
	}
	let t3;
	if ($[16] !== fit || $[17] !== frameSize) {
		t3 = frameSize ? {
			width: frameSize.w * fit,
			height: frameSize.h * fit,
			flexShrink: 0,
			overflow: "hidden"
		} : void 0;
		$[16] = fit;
		$[17] = frameSize;
		$[18] = t3;
	} else t3 = $[18];
	const t4 = `scale(${fit})`;
	let t5;
	if ($[19] !== t4) {
		t5 = {
			display: "inline-block",
			width: "max-content",
			transform: t4,
			transformOrigin: "top left"
		};
		$[19] = t4;
		$[20] = t5;
	} else t5 = $[20];
	let t6;
	if ($[21] !== children || $[22] !== frameRef || $[23] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: frameRef,
			"data-canvas-content": true,
			"data-live-content": true,
			style: t5,
			children
		});
		$[21] = children;
		$[22] = frameRef;
		$[23] = t5;
		$[24] = t6;
	} else t6 = $[24];
	let t7;
	if ($[25] !== sizerRef || $[26] !== t3 || $[27] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sizerRef,
			style: t3,
			children: t6
		});
		$[25] = sizerRef;
		$[26] = t3;
		$[27] = t6;
		$[28] = t7;
	} else t7 = $[28];
	return t7;
}

export { PresentationFrame, frameFillsSurface, useFitToWidth, useFrameContent, useFramePager };
