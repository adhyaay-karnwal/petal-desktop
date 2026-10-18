// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/InspectorPopover.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../ui/src/lib/utils.js";
import { CaretDownIcon, SearchIcon, XIcon } from "../../../../../../ui/src/icons.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../../../../../../ui/src/components/DropdownMenu.js";
import { PopoverAnchor, PopoverContent } from "../../../../../../ui/src/components/Popover.js";
import { INSPECTOR_CONTROL_TEXT_STYLE, IconBtn, InspectorControlInput, InspectorControlShell, releaseInspectorControlFocus } from "./primitives.js";

/**
* The shared shell for popovers that open from the inspector over the canvas
* (font, color, shadow, export settings, class pickers). Styled after the font
* picker: menu surface, opens to the left of its trigger, a header row with a
* close button, an optional search field and font-picker list rows.
*/
function preventAutoFocus(event) {
	event.preventDefault();
}
/**
* Every inspector popover opens beside the inspector's left edge (or beside
* the popover it was opened from), level with the control that opened it —
* not beside that control, which can sit anywhere across the panel.
*
* A hidden marker rendered in place of the popover sits in the DOM right after
* that control (a trigger, or the field a `PopoverAnchor` wraps), so it works
* for popovers opened without a `PopoverTrigger` too. Radix takes a virtual
* anchor only when the anchor mounts, so one instance lives as long as the
* popover.
*/
var InspectorEdgeAnchor = class {
	constructor() {
		this.marker = null;
	}
	control() {
		return this.marker?.previousElementSibling ?? this.marker?.parentElement;
	}
	/** Presses on the opening control are left to it, so a second click closes. */
	contains(target) {
		return target instanceof Node && !!this.control()?.contains(target);
	}
	get contextElement() {
		return this.control() ?? void 0;
	}
	getBoundingClientRect() {
		const control = this.control();
		if (!control) return new DOMRect();
		const edge = control.closest("[data-inspector-popover], [data-inspector-panel]") ?? control;
		const rect = control.getBoundingClientRect();
		return new DOMRect(edge.getBoundingClientRect().left, rect.top, 0, rect.height);
	}
};
var InspectorPopoverContent = import_react.forwardRef((t0, forwardedRef) => {
	const $ = (0, import_compiler_runtime.c)(25);
	let className;
	let onInteractOutside;
	let props;
	let t1;
	let t2;
	let t3;
	let t4;
	let t5;
	if ($[0] !== t0) {
		({className, align: t1, sideOffset: t2, collisionPadding: t3, onOpenAutoFocus: t4, onCloseAutoFocus: t5, onInteractOutside, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = onInteractOutside;
		$[3] = props;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
		$[7] = t4;
		$[8] = t5;
	} else {
		className = $[1];
		onInteractOutside = $[2];
		props = $[3];
		t1 = $[4];
		t2 = $[5];
		t3 = $[6];
		t4 = $[7];
		t5 = $[8];
	}
	const align = t1 === void 0 ? "start" : t1;
	const sideOffset = t2 === void 0 ? 0 : t2;
	const collisionPadding = t3 === void 0 ? 8 : t3;
	const onOpenAutoFocus = t4 === void 0 ? preventAutoFocus : t4;
	const onCloseAutoFocus = t5 === void 0 ? releaseInspectorControlFocus : t5;
	const [anchorRef] = import_react.useState(_temp$112);
	let t6;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, { virtualRef: anchorRef });
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			hidden: true,
			ref: (node) => {
				anchorRef.current.marker = node;
			}
		});
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== onInteractOutside) {
		t8 = (event) => {
			onInteractOutside?.(event);
			if (anchorRef.current.contains(event.target)) event.preventDefault();
		};
		$[11] = onInteractOutside;
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== className) {
		t9 = cn$2("flex w-64 max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden", className);
		$[13] = className;
		$[14] = t9;
	} else t9 = $[14];
	let t10;
	if ($[15] !== align || $[16] !== collisionPadding || $[17] !== forwardedRef || $[18] !== onCloseAutoFocus || $[19] !== onOpenAutoFocus || $[20] !== props || $[21] !== sideOffset || $[22] !== t8 || $[23] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t6,
			t7,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				ref: forwardedRef,
				"data-inspector-popover": "",
				variant: "menu",
				side: "left",
				align,
				sideOffset,
				collisionPadding,
				onOpenAutoFocus,
				onCloseAutoFocus,
				onInteractOutside: t8,
				className: t9,
				...props
			})
		] });
		$[15] = align;
		$[16] = collisionPadding;
		$[17] = forwardedRef;
		$[18] = onCloseAutoFocus;
		$[19] = onOpenAutoFocus;
		$[20] = props;
		$[21] = sideOffset;
		$[22] = t8;
		$[23] = t9;
		$[24] = t10;
	} else t10 = $[24];
	return t10;
});
InspectorPopoverContent.displayName = "InspectorPopoverContent";
/** Title (or custom leading content such as a source menu) plus a close button. */
function InspectorPopoverHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { title, children, closeLabel: t1, onClose } = t0;
	const closeLabel = t1 === void 0 ? "Close" : t1;
	let t2;
	if ($[0] !== title) {
		t2 = title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: "flex h-6.5 min-w-0 items-center truncate px-1.5 font-medium text-ed-foreground",
			children: title
		});
		$[0] = title;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {});
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== closeLabel || $[4] !== onClose) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: closeLabel,
			onClick: onClose,
			className: "ml-auto shrink-0",
			children: t3
		});
		$[3] = closeLabel;
		$[4] = onClose;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== children || $[7] !== t2 || $[8] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1 pb-1.5",
			children: [
				t2,
				children,
				t4
			]
		});
		$[6] = children;
		$[7] = t2;
		$[8] = t4;
		$[9] = t5;
	} else t5 = $[9];
	return t5;
}
/** Header dropdown that switches the popover's source or mode. */
function InspectorPopoverMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { label, value, options, onValueChange, onCloseAutoFocus } = t0;
	let t1;
	if ($[0] !== options || $[1] !== value) {
		t1 = options.find((option) => option.value === value)?.label;
		$[0] = options;
		$[1] = value;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "size-3 shrink-0" });
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== label || $[5] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": label,
				style: INSPECTOR_CONTROL_TEXT_STYLE,
				className: "flex h-6.5 shrink-0 items-center gap-1 whitespace-nowrap rounded px-1.5 font-normal text-ed-foreground hover:bg-ed-ghost-hover",
				children: [t1, t2]
			})
		});
		$[4] = label;
		$[5] = t1;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== onValueChange) {
		t4 = (next) => onValueChange(next);
		$[7] = onValueChange;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== options) {
		t5 = options.map(_temp2$73);
		$[9] = options;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t4 || $[12] !== t5 || $[13] !== value) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
			value,
			onValueChange: t4,
			children: t5
		});
		$[11] = t4;
		$[12] = t5;
		$[13] = value;
		$[14] = t6;
	} else t6 = $[14];
	let t7;
	if ($[15] !== onCloseAutoFocus || $[16] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "start",
			className: "min-w-40",
			onCloseAutoFocus,
			children: t6
		});
		$[15] = onCloseAutoFocus;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== t3 || $[19] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t3, t7]
		});
		$[18] = t3;
		$[19] = t7;
		$[20] = t8;
	} else t8 = $[20];
	return t8;
}
function _temp2$73(option_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: option_0.value,
		children: option_0.label
	}, option_0.value);
}
var InspectorPopoverSearch = import_react.forwardRef((props, ref) => {
	const $ = (0, import_compiler_runtime.c)(4);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex shrink-0 items-center pl-1 text-ed-foreground-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {})
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] !== props || $[2] !== ref) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
			className: "shrink-0",
			children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
				ref,
				...props
			})]
		});
		$[1] = props;
		$[2] = ref;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
});
InspectorPopoverSearch.displayName = "InspectorPopoverSearch";
/** A selectable list row. `highlighted` marks the keyboard cursor. */
var InspectorPopoverItem = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(14);
	let className;
	let highlighted;
	let props;
	let selected;
	let t1;
	if ($[0] !== t0) {
		({selected, highlighted, className, type: t1, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = highlighted;
		$[3] = props;
		$[4] = selected;
		$[5] = t1;
	} else {
		className = $[1];
		highlighted = $[2];
		props = $[3];
		selected = $[4];
		t1 = $[5];
	}
	const type = t1 === void 0 ? "button" : t1;
	const t2 = selected ? "bg-ed-accent text-ed-accent-foreground" : highlighted ? "bg-ed-accent/50" : "hover:bg-ed-accent/50";
	let t3;
	if ($[6] !== className || $[7] !== t2) {
		t3 = cn$2("flex w-full items-center gap-2 rounded-[5px] px-1.5 text-left", t2, className);
		$[6] = className;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] !== props || $[10] !== ref || $[11] !== t3 || $[12] !== type) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			ref,
			type,
			className: t3,
			...props
		});
		$[9] = props;
		$[10] = ref;
		$[11] = t3;
		$[12] = type;
		$[13] = t4;
	} else t4 = $[13];
	return t4;
});
InspectorPopoverItem.displayName = "InspectorPopoverItem";
function InspectorPopoverSectionLabel(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: "px-1.5 pt-1.5 pb-1 text-ed-muted-foreground",
			children
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function InspectorPopoverSeparator() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "separator",
			className: "-mx-1 my-1 h-px shrink-0 bg-ed-menu-border"
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function _temp$112() {
	return { current: new InspectorEdgeAnchor() };
}

export { InspectorPopoverContent, InspectorPopoverHeader, InspectorPopoverItem, InspectorPopoverMenu, InspectorPopoverSearch, InspectorPopoverSectionLabel, InspectorPopoverSeparator };
