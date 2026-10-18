// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/DropdownMenu.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { CheckboxItem2, Content2$4, Item2$3, ItemIndicator2, Label2, Portal2$1, RadioGroup2, RadioItem2, Root2$7, Separator2$1, Sub2, SubContent2, SubTrigger2, Trigger$5 } from "../../../../vendor/@radix-ui/react-dropdown-menu.js";
import { n$18, s$10 } from "../../../../vendor/@phosphor-icons/react.js";

var DropdownMenu = Root2$7;
var DropdownMenuTrigger = Trigger$5;
var DropdownMenuSub = Sub2;
var DropdownMenuRadioGroup = RadioGroup2;
var menuItemIconClass = "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-ed-muted-foreground";
var DropdownMenuContent = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(29);
	let className;
	let onCloseAutoFocus;
	let onInteractOutside;
	let onKeyDownCapture;
	let onPointerDownCapture;
	let props;
	let t1;
	let t2;
	if ($[0] !== t0) {
		({className, sideOffset: t1, restoreFocusOnPointerDismiss: t2, onInteractOutside, onCloseAutoFocus, onPointerDownCapture, onKeyDownCapture, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = onCloseAutoFocus;
		$[3] = onInteractOutside;
		$[4] = onKeyDownCapture;
		$[5] = onPointerDownCapture;
		$[6] = props;
		$[7] = t1;
		$[8] = t2;
	} else {
		className = $[1];
		onCloseAutoFocus = $[2];
		onInteractOutside = $[3];
		onKeyDownCapture = $[4];
		onPointerDownCapture = $[5];
		props = $[6];
		t1 = $[7];
		t2 = $[8];
	}
	const sideOffset = t1 === void 0 ? 4 : t1;
	const restoreFocusOnPointerDismiss = t2 === void 0 ? true : t2;
	const pointerDismissed = import_react.useRef(false);
	let t3;
	if ($[9] !== className) {
		t3 = cn$2("z-50 min-w-[8rem] overflow-hidden rounded-md border border-ed-menu-border bg-ed-menu p-1 text-ed-ui text-ed-popover-foreground shadow-ed-popover", className);
		$[9] = className;
		$[10] = t3;
	} else t3 = $[10];
	let t4;
	if ($[11] !== onPointerDownCapture) {
		t4 = (event) => {
			onPointerDownCapture?.(event);
			if (!event.defaultPrevented) pointerDismissed.current = true;
		};
		$[11] = onPointerDownCapture;
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== onKeyDownCapture) {
		t5 = (event_0) => {
			onKeyDownCapture?.(event_0);
			if (!event_0.defaultPrevented) pointerDismissed.current = false;
		};
		$[13] = onKeyDownCapture;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== onInteractOutside) {
		t6 = (event_1) => {
			onInteractOutside?.(event_1);
			if (!event_1.defaultPrevented && event_1.detail.originalEvent.type === "pointerdown") pointerDismissed.current = true;
		};
		$[15] = onInteractOutside;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== onCloseAutoFocus || $[18] !== restoreFocusOnPointerDismiss) {
		t7 = (event_2) => {
			onCloseAutoFocus?.(event_2);
			if (!restoreFocusOnPointerDismiss && pointerDismissed.current) event_2.preventDefault();
			pointerDismissed.current = false;
		};
		$[17] = onCloseAutoFocus;
		$[18] = restoreFocusOnPointerDismiss;
		$[19] = t7;
	} else t7 = $[19];
	let t8;
	if ($[20] !== props || $[21] !== ref || $[22] !== sideOffset || $[23] !== t3 || $[24] !== t4 || $[25] !== t5 || $[26] !== t6 || $[27] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$4, {
			ref,
			"data-dismissable-layer": "",
			sideOffset,
			className: t3,
			...props,
			onPointerDownCapture: t4,
			onKeyDownCapture: t5,
			onInteractOutside: t6,
			onCloseAutoFocus: t7
		}) });
		$[20] = props;
		$[21] = ref;
		$[22] = sideOffset;
		$[23] = t3;
		$[24] = t4;
		$[25] = t5;
		$[26] = t6;
		$[27] = t7;
		$[28] = t8;
	} else t8 = $[28];
	return t8;
});
DropdownMenuContent.displayName = Content2$4.displayName;
var DropdownMenuItem = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(11);
	let className;
	let inset;
	let props;
	if ($[0] !== t0) {
		({className, inset, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = inset;
		$[3] = props;
	} else {
		className = $[1];
		inset = $[2];
		props = $[3];
	}
	const t1 = inset && "pl-7";
	let t2;
	if ($[4] !== className || $[5] !== t1) {
		t2 = cn$2("relative flex h-6.5 cursor-default select-none items-center gap-2 rounded px-1.5 py-0 text-ed-ui outline-none", "focus:bg-ed-accent focus:text-ed-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "data-[variant=destructive]:*:[svg]:!text-ed-destructive", menuItemIconClass, t1, className);
		$[4] = className;
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== props || $[8] !== ref || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$3, {
			ref,
			"data-slot": "menu-item",
			className: t2,
			...props
		});
		$[7] = props;
		$[8] = ref;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
});
DropdownMenuItem.displayName = Item2$3.displayName;
var DropdownMenuLabel = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(11);
	let className;
	let inset;
	let props;
	if ($[0] !== t0) {
		({className, inset, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = inset;
		$[3] = props;
	} else {
		className = $[1];
		inset = $[2];
		props = $[3];
	}
	const t1 = inset && "pl-8";
	let t2;
	if ($[4] !== className || $[5] !== t1) {
		t2 = cn$2("px-2 py-1.5 text-ed-ui font-normal text-ed-foreground", t1, className);
		$[4] = className;
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== props || $[8] !== ref || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
			ref,
			className: t2,
			...props
		});
		$[7] = props;
		$[8] = ref;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
});
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(14);
	let checked;
	let children;
	let className;
	let props;
	if ($[0] !== t0) {
		({className, children, checked, ...props} = t0);
		$[0] = t0;
		$[1] = checked;
		$[2] = children;
		$[3] = className;
		$[4] = props;
	} else {
		checked = $[1];
		children = $[2];
		className = $[3];
		props = $[4];
	}
	let t1;
	if ($[5] !== className) {
		t1 = cn$2("relative flex h-6.5 cursor-default select-none items-center justify-between rounded px-1.5 py-0 text-ed-ui outline-none", "focus:bg-ed-accent focus:text-ed-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className);
		$[5] = className;
		$[6] = t1;
	} else t1 = $[6];
	let t2;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-4 flex h-3.5 w-3.5 shrink-0 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, {
				size: 12,
				weight: "bold"
			}) })
		});
		$[7] = t2;
	} else t2 = $[7];
	let t3;
	if ($[8] !== checked || $[9] !== children || $[10] !== props || $[11] !== ref || $[12] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
			ref,
			"data-slot": "menu-item",
			className: t1,
			checked,
			...props,
			children: [children, t2]
		});
		$[8] = checked;
		$[9] = children;
		$[10] = props;
		$[11] = ref;
		$[12] = t1;
		$[13] = t3;
	} else t3 = $[13];
	return t3;
});
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuSubTrigger = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(14);
	let children;
	let className;
	let inset;
	let props;
	if ($[0] !== t0) {
		({className, inset, children, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = inset;
		$[4] = props;
	} else {
		children = $[1];
		className = $[2];
		inset = $[3];
		props = $[4];
	}
	const t1 = inset && "pl-7";
	let t2;
	if ($[5] !== className || $[6] !== t1) {
		t2 = cn$2("relative flex h-6.5 cursor-default select-none items-center gap-2 rounded px-1.5 py-0 text-ed-ui outline-none", "focus:bg-ed-accent focus:text-ed-accent-foreground data-[state=open]:bg-ed-accent data-[state=open]:text-ed-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", menuItemIconClass, t1, className);
		$[5] = className;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	let t3;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$10, {
			size: 10,
			className: "ml-auto size-2.5 shrink-0 text-ed-muted-foreground"
		});
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] !== children || $[10] !== props || $[11] !== ref || $[12] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
			ref,
			"data-slot": "menu-item",
			className: t2,
			...props,
			children: [children, t3]
		});
		$[9] = children;
		$[10] = props;
		$[11] = ref;
		$[12] = t2;
		$[13] = t4;
	} else t4 = $[13];
	return t4;
});
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(11);
	let className;
	let props;
	let t1;
	if ($[0] !== t0) {
		({className, sideOffset: t1, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
	}
	const sideOffset = t1 === void 0 ? 4 : t1;
	let t2;
	if ($[4] !== className) {
		t2 = cn$2("z-50 min-w-[8rem] overflow-hidden rounded-md border border-ed-menu-border bg-ed-menu p-1 text-ed-ui text-ed-popover-foreground shadow-ed-popover", className);
		$[4] = className;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== ref || $[8] !== sideOffset || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
			ref,
			"data-dismissable-layer": "",
			sideOffset,
			className: t2,
			...props
		}) });
		$[6] = props;
		$[7] = ref;
		$[8] = sideOffset;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
});
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(12);
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
		t1 = cn$2("relative flex h-6.5 cursor-default select-none items-center justify-between gap-4 rounded px-1.5 py-0 text-ed-ui outline-none", "focus:bg-ed-accent focus:text-ed-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className);
		$[4] = className;
		$[5] = t1;
	} else t1 = $[5];
	let t2;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex h-3.5 w-3.5 shrink-0 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, {
				size: 12,
				weight: "bold"
			}) })
		});
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== children || $[8] !== props || $[9] !== ref || $[10] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
			ref,
			"data-slot": "menu-item",
			className: t1,
			...props,
			children: [children, t2]
		});
		$[7] = children;
		$[8] = props;
		$[9] = ref;
		$[10] = t1;
		$[11] = t3;
	} else t3 = $[11];
	return t3;
});
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuSeparator = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(9);
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
		t1 = cn$2("mx-1.5 my-[6px] h-px bg-ed-menu-border", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2$1, {
			ref,
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = ref;
		$[7] = t1;
		$[8] = t2;
	} else t2 = $[8];
	return t2;
});
DropdownMenuSeparator.displayName = Separator2$1.displayName;
var DropdownMenuShortcut = (t0) => {
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
		t1 = cn$2("ml-auto text-[11px] tracking-widest text-ed-muted-foreground/60", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger };
