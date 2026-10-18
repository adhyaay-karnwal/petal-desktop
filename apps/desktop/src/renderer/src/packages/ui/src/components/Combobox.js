// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Combobox.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { n$18, s$12 } from "../../../../vendor/@phosphor-icons/react.js";
import { fieldStates, fieldSurface } from "../lib/fieldStyles.js";
import { ComboboxEmpty$1, ComboboxInput$1, ComboboxItem$1, ComboboxItemIndicator, ComboboxList$1, ComboboxPopup, ComboboxPortal, ComboboxPositioner, ComboboxRoot, ComboboxTrigger$1 } from "../../../../vendor/@base-ui-components/react.js";

var Combobox = ComboboxRoot;
function ComboboxTrigger(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	let children;
	let className;
	let props;
	if ($[0] !== t0) {
		({className, children, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = props;
	} else {
		children = $[1];
		className = $[2];
		props = $[3];
	}
	let t1;
	if ($[4] !== className) {
		t1 = cn$2("[&_svg:not([class*='size-'])]:size-4", className);
		$[4] = className;
		$[5] = t1;
	} else t1 = $[5];
	let t2;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$12, { className: "text-ed-muted-foreground size-4 pointer-events-none" });
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== children || $[8] !== props || $[9] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComboboxTrigger$1, {
			"data-slot": "combobox-trigger",
			className: t1,
			...props,
			children: [children, t2]
		});
		$[7] = children;
		$[8] = props;
		$[9] = t1;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
function ComboboxInput(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("w-full h-8 px-2 text-ed-ui placeholder:text-ed-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", fieldSurface, fieldStates, className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxInput$1, {
			"data-slot": "combobox-input",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function ComboboxContent(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	let anchor;
	let className;
	let container;
	let props;
	let t1;
	let t2;
	let t3;
	if ($[0] !== t0) {
		({className, side: t1, sideOffset: t2, align: t3, anchor, container, ...props} = t0);
		$[0] = t0;
		$[1] = anchor;
		$[2] = className;
		$[3] = container;
		$[4] = props;
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
	} else {
		anchor = $[1];
		className = $[2];
		container = $[3];
		props = $[4];
		t1 = $[5];
		t2 = $[6];
		t3 = $[7];
	}
	const side = t1 === void 0 ? "bottom" : t1;
	const sideOffset = t2 === void 0 ? 4 : t2;
	const align = t3 === void 0 ? "start" : t3;
	let t4;
	if ($[8] !== className) {
		t4 = cn$2("group/combobox-content bg-ed-menu text-ed-popover-foreground", "overflow-hidden rounded-md border border-ed-menu-border shadow-ed-popover [&_[data-slot=combobox-item]+[data-slot=combobox-item]]:mt-0.5", "flex max-h-(--available-height) w-(--anchor-width) min-w-48 flex-col", "origin-(--transform-origin)", className);
		$[8] = className;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== props || $[11] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxPopup, {
			"data-dismissable-layer": "",
			"data-slot": "combobox-content",
			className: t4,
			...props
		});
		$[10] = props;
		$[11] = t4;
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] !== align || $[14] !== anchor || $[15] !== side || $[16] !== sideOffset || $[17] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxPositioner, {
			side,
			sideOffset,
			align,
			anchor,
			positionMethod: "fixed",
			className: "isolate z-50",
			children: t5
		});
		$[13] = align;
		$[14] = anchor;
		$[15] = side;
		$[16] = sideOffset;
		$[17] = t5;
		$[18] = t6;
	} else t6 = $[18];
	let t7;
	if ($[19] !== container || $[20] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxPortal, {
			container,
			children: t6
		});
		$[19] = container;
		$[20] = t6;
		$[21] = t7;
	} else t7 = $[21];
	return t7;
}
function ComboboxList(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("max-h-[240px] min-h-0 overflow-y-auto overscroll-contain p-1", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxList$1, {
			"data-slot": "combobox-list",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function ComboboxItem(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	let children;
	let className;
	let props;
	if ($[0] !== t0) {
		({className, children, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = props;
	} else {
		children = $[1];
		className = $[2];
		props = $[3];
	}
	let t1;
	if ($[4] !== className) {
		t1 = cn$2("relative flex h-6.5 w-full cursor-default items-center rounded-sm px-2 py-0 text-ed-ui outline-hidden select-none", "data-highlighted:bg-ed-muted data-highlighted:text-ed-foreground", "data-disabled:pointer-events-none data-disabled:opacity-50", className);
		$[4] = className;
		$[5] = t1;
	} else t1 = $[5];
	let t2;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxItemIndicator, { render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute right-2 flex items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, { size: 12 })
		}) });
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== children || $[8] !== props || $[9] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComboboxItem$1, {
			"data-slot": "combobox-item",
			className: t1,
			...props,
			children: [children, t2]
		});
		$[7] = children;
		$[8] = props;
		$[9] = t1;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
function ComboboxEmpty(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("text-ed-muted-foreground hidden w-full justify-center py-2 text-center text-ed-ui", "group-data-empty/combobox-content:flex", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxEmpty$1, {
			"data-slot": "combobox-empty",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger };
