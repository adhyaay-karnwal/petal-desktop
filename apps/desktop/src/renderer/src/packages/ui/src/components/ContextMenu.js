// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/ContextMenu.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Content2$2, Item2$1, Portal2, Root2$4, Separator2, Trigger$3 } from "../../../../vendor/@radix-ui/react-context-menu.js";

var ContextMenu$1 = Root2$4;
var ContextMenuTrigger = Trigger$3;
var ContextMenuContent = import_react.forwardRef((t0, ref) => {
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
		t1 = cn$2("z-50 min-w-[8rem] overflow-hidden rounded-md border border-ed-menu-border bg-ed-menu p-1 text-ed-popover-foreground shadow-ed-popover [&_[data-slot=menu-item]+[data-slot=menu-item]]:mt-0.5", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$2, {
			ref,
			"data-dismissable-layer": "",
			className: t1,
			...props
		}) });
		$[5] = props;
		$[6] = ref;
		$[7] = t1;
		$[8] = t2;
	} else t2 = $[8];
	return t2;
});
ContextMenuContent.displayName = Content2$2.displayName;
var ContextMenuItem = import_react.forwardRef((t0, ref) => {
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
		t2 = cn$2("relative flex h-6.5 cursor-default select-none items-center rounded px-1.5 py-0 text-ed-ui outline-none", "focus:bg-ed-accent focus:text-ed-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", t1, className);
		$[4] = className;
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== props || $[8] !== ref || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$1, {
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
ContextMenuItem.displayName = Item2$1.displayName;
var ContextMenuSeparator = import_react.forwardRef((t0, ref) => {
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
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
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
ContextMenuSeparator.displayName = Separator2.displayName;
var ContextMenuShortcut = (t0) => {
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
		t1 = cn$2("ml-auto text-xs tracking-widest text-ed-muted-foreground", className);
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
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export { ContextMenu$1, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger };
