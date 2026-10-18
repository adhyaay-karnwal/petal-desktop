// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/ScrollArea.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Corner, Root, ScrollAreaScrollbar, ScrollAreaThumb, Viewport$1 } from "../../../../vendor/@radix-ui/react-scroll-area.js";

/**
* Radix's Viewport renders a <style> whose dangerouslySetInnerHTML is a new
* object on every render, and React rewrites the innerHTML of a <style> whenever
* that object changes: every re-render of a scroll area replaced a stylesheet and
* invalidated style across the page. The content reaches the viewport through
* context instead, so the Viewport element itself stays the same and React skips
* it; only ViewportContent re-renders with new children.
*/
var ViewportChildren = import_react.createContext(null);
function ViewportContent() {
	return import_react.useContext(ViewportChildren);
}
var VIEWPORT_CONTENT = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportContent, {});
function setViewportRef(ref, node) {
	if (typeof ref === "function") return ref(node);
	if (ref) ref.current = node;
}
/**
* Figma-style overlay scroll container. The native scrollbar is hidden, so
* content keeps its full width and layout never shifts when scrollability
* changes; a slim semi-transparent thumb is drawn OVER the content and only
* appears while hovering the area (or scrolling). Use this instead of
* `overflow-y-auto` for chrome panels.
*
* The viewport is the actual scroll element — pass `viewportRef` when scroll
* logic (virtualizers, scrollTo, wheel handlers) needs it, and
* `viewportClassName` for constraints that must live on the scroll element
* itself (e.g. `max-h-*` in popovers, `overscroll-*`).
*/
function ScrollArea(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	let children;
	let className;
	let props;
	let t1;
	let viewportClassName;
	let viewportRef;
	if ($[0] !== t0) {
		({className, viewportClassName, viewportRef, horizontal: t1, children, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = props;
		$[4] = t1;
		$[5] = viewportClassName;
		$[6] = viewportRef;
	} else {
		children = $[1];
		className = $[2];
		props = $[3];
		t1 = $[4];
		viewportClassName = $[5];
		viewportRef = $[6];
	}
	const horizontal = t1 === void 0 ? false : t1;
	const internalViewportRef = import_react.useRef(null);
	let t2;
	if ($[7] !== viewportRef) {
		t2 = (viewport) => {
			internalViewportRef.current = viewport;
			const refCleanup = setViewportRef(viewportRef, viewport);
			return () => {
				internalViewportRef.current = null;
				if (typeof refCleanup === "function") refCleanup();
				else setViewportRef(viewportRef, null);
			};
		};
		$[7] = viewportRef;
		$[8] = t2;
	} else t2 = $[8];
	const attachViewport = t2;
	let t3;
	let t4;
	if ($[9] !== horizontal) {
		t3 = () => {
			const viewport_0 = internalViewportRef.current;
			if (!horizontal || !viewport_0) return;
			const root = viewport_0.parentElement;
			if (!root) return;
			const onWheel = (event) => {
				if (!event.shiftKey || event.ctrlKey || event.defaultPrevented || event.deltaX !== 0 || event.deltaY === 0) return;
				if (!(event.target instanceof Element) || event.target.closest("[data-slot=\"scroll-area\"]") !== root) return;
				if (viewport_0.scrollWidth <= viewport_0.clientWidth) return;
				const unit = event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? viewport_0.clientWidth : event.deltaMode === WheelEvent.DOM_DELTA_LINE ? parseFloat(getComputedStyle(viewport_0).lineHeight) || 16 : 1;
				event.preventDefault();
				viewport_0.scrollLeft = viewport_0.scrollLeft + event.deltaY * unit;
			};
			root.addEventListener("wheel", onWheel, { passive: false });
			return () => root.removeEventListener("wheel", onWheel);
		};
		t4 = [horizontal];
		$[9] = horizontal;
		$[10] = t3;
		$[11] = t4;
	} else {
		t3 = $[10];
		t4 = $[11];
	}
	import_react.useEffect(t3, t4);
	let t5;
	if ($[12] !== viewportClassName) {
		t5 = cn$2("size-full [&>div]:!block [&>div]:!w-full", viewportClassName);
		$[12] = viewportClassName;
		$[13] = t5;
	} else t5 = $[13];
	let t6;
	if ($[14] !== attachViewport || $[15] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport$1, {
			ref: attachViewport,
			"data-slot": "scroll-area-viewport",
			className: t5,
			children: VIEWPORT_CONTENT
		});
		$[14] = attachViewport;
		$[15] = t5;
		$[16] = t6;
	} else t6 = $[16];
	const viewport_1 = t6;
	let t7;
	if ($[17] !== className) {
		t7 = cn$2("relative overflow-hidden", className);
		$[17] = className;
		$[18] = t7;
	} else t7 = $[18];
	let t8;
	if ($[19] !== children || $[20] !== viewport_1) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChildren.Provider, {
			value: children,
			children: viewport_1
		});
		$[19] = children;
		$[20] = viewport_1;
		$[21] = t8;
	} else t8 = $[21];
	let t9;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {});
		$[22] = t9;
	} else t9 = $[22];
	let t10;
	if ($[23] !== horizontal) {
		t10 = horizontal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, { orientation: "horizontal" });
		$[23] = horizontal;
		$[24] = t10;
	} else t10 = $[24];
	let t11;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {});
		$[25] = t11;
	} else t11 = $[25];
	let t12;
	if ($[26] !== props || $[27] !== t10 || $[28] !== t7 || $[29] !== t8) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
			"data-slot": "scroll-area",
			type: "hover",
			scrollHideDelay: 400,
			className: t7,
			...props,
			children: [
				t8,
				t9,
				t10,
				t11
			]
		});
		$[26] = props;
		$[27] = t10;
		$[28] = t7;
		$[29] = t8;
		$[30] = t12;
	} else t12 = $[30];
	return t12;
}
function ScrollBar(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	let className;
	let props;
	let t1;
	if ($[0] !== t0) {
		({className, orientation: t1, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
	}
	const orientation = t1 === void 0 ? "vertical" : t1;
	const t2 = orientation === "vertical" && "h-full w-2";
	const t3 = orientation === "horizontal" && "h-2 flex-col";
	let t4;
	if ($[4] !== className || $[5] !== t2 || $[6] !== t3) {
		t4 = cn$2("z-50 flex touch-none select-none p-0.5 transition-opacity", "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100", t2, t3, className);
		$[4] = className;
		$[5] = t2;
		$[6] = t3;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, {
			"data-slot": "scroll-area-thumb",
			className: "relative flex-1 rounded-full bg-ed-foreground/25 hover:bg-ed-foreground/40"
		});
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== orientation || $[10] !== props || $[11] !== t4) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
			"data-slot": "scroll-area-scrollbar",
			orientation,
			className: t4,
			...props,
			children: t5
		});
		$[9] = orientation;
		$[10] = props;
		$[11] = t4;
		$[12] = t6;
	} else t6 = $[12];
	return t6;
}

export { ScrollArea };
