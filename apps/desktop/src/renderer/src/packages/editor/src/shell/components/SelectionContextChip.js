// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/SelectionContextChip.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { Popover, PopoverAnchor, PopoverContent } from "../../../../ui/src/components/Popover.js";
import { getLayerAccent, getLayerIcon } from "./panels/layerAppearance.js";
import { CanvasContextChip } from "./CanvasContextChip.js";

/** A compact live selection with individual context removal in its hover panel. */
function SelectionContextChip(t0) {
	const $ = (0, import_compiler_runtime.c)(28);
	const { elements, onRemove, onClear } = t0;
	const [open, setOpen] = (0, import_react.useState)(false);
	const timer = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			if (timer.current) clearTimeout(timer.current);
			timer.current = null;
		};
		$[0] = t1;
	} else t1 = $[0];
	const cancelTimer = t1;
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => () => {
			if (timer.current) clearTimeout(timer.current);
		};
		t3 = [];
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	if ($[3] !== open) {
		t4 = () => {
			cancelTimer();
			if (!open) timer.current = setTimeout(() => setOpen(true), 200);
		};
		$[3] = open;
		$[4] = t4;
	} else t4 = $[4];
	const enter = t4;
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => {
			cancelTimer();
			timer.current = setTimeout(() => setOpen(false), 150);
		};
		$[5] = t5;
	} else t5 = $[5];
	const leave = t5;
	const first = elements[0];
	if (!first) return null;
	if (elements.length === 1 && !open) {
		let t6;
		if ($[6] !== first || $[7] !== onClear) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
				element: first,
				onRemove: onClear,
				showNavigationIcon: false
			});
			$[6] = first;
			$[7] = onClear;
			$[8] = t6;
		} else t6 = $[8];
		return t6;
	}
	const sameAppearance = elements.every((element) => getLayerAccent(element).label === getLayerAccent(first).label && getLayerIcon(element) === getLayerIcon(first));
	let t6;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (event) => {
			if (event.key === "ArrowUp") {
				event.preventDefault();
				cancelTimer();
				setOpen(true);
			}
		};
		$[9] = t6;
	} else t6 = $[9];
	const t7 = sameAppearance ? first : void 0;
	const t8 = `${elements.length} selected`;
	let t9;
	if ($[10] !== onClear || $[11] !== t7 || $[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
			element: t7,
			label: t8,
			title: "",
			onRemove: onClear,
			showNavigationIcon: false
		});
		$[10] = onClear;
		$[11] = t7;
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== enter || $[15] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex min-w-0 max-w-full",
				onPointerEnter: enter,
				onPointerLeave: leave,
				onKeyDown: t6,
				children: t9
			})
		});
		$[14] = enter;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== elements || $[18] !== onRemove) {
		let t12;
		if ($[20] !== onRemove) {
			t12 = (element_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
				element: element_0,
				onRemove: () => onRemove(element_0.id),
				showNavigationIcon: false
			}, element_0.id);
			$[20] = onRemove;
			$[21] = t12;
		} else t12 = $[21];
		t11 = elements.map(t12);
		$[17] = elements;
		$[18] = onRemove;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[22] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			variant: "menu",
			side: "top",
			align: "start",
			sideOffset: 4,
			"aria-label": "Selected items",
			className: "w-max max-w-[min(280px,calc(100vw-24px))]",
			onPointerEnter: cancelTimer,
			onPointerLeave: leave,
			onOpenAutoFocus: _temp$44,
			onCloseAutoFocus: _temp2$27,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				viewportClassName: "max-h-48",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex max-w-64 flex-wrap gap-1.5",
					children: t11
				})
			})
		});
		$[22] = t11;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== open || $[25] !== t10 || $[26] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [t10, t12]
		});
		$[24] = open;
		$[25] = t10;
		$[26] = t12;
		$[27] = t13;
	} else t13 = $[27];
	return t13;
}
function _temp2$27(event_1) {
	return event_1.preventDefault();
}
function _temp$44(event_0) {
	return event_0.preventDefault();
}

export { SelectionContextChip };
