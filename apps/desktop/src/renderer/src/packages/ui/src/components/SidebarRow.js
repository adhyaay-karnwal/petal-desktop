// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/SidebarRow.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Slot$4 } from "../../../../vendor/@radix-ui/react-slot.js";

var sizes = {
	default: "text-xs",
	sm: "text-[11px]"
};
/**
* Dashboard sidebar row: 26px tall, 15px icons, accent fill when active or when
* the menu it triggers is open. `group/sidebar-row` lets children react to hover.
*/
function SidebarRow(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	let className;
	let props;
	let t1;
	let t2;
	let t3;
	if ($[0] !== t0) {
		({asChild: t1, isActive: t2, size: t3, className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
		$[4] = t2;
		$[5] = t3;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
		t2 = $[4];
		t3 = $[5];
	}
	const asChild = t1 === void 0 ? false : t1;
	const isActive = t2 === void 0 ? false : t2;
	const size = t3 === void 0 ? "default" : t3;
	const Comp = asChild ? Slot$4 : "button";
	const t4 = sizes[size];
	let t5;
	if ($[6] !== className || $[7] !== t4) {
		t5 = cn$2(t4, "group/sidebar-row flex h-6.5 w-full cursor-default items-center gap-2 overflow-hidden rounded px-1.5 text-left leading-4 tracking-[-0.01em] text-ed-foreground-secondary outline-hidden ring-ed-ring", "hover:bg-ed-accent hover:text-ed-foreground focus-visible:ring-2 active:bg-ed-accent", "data-[active=true]:bg-ed-accent data-[active=true]:text-ed-foreground data-[state=open]:bg-ed-accent data-[state=open]:text-ed-foreground", "disabled:pointer-events-none disabled:opacity-50", "[&_svg]:size-[15px] [&_svg]:shrink-0 [&>span:last-child]:truncate", className);
		$[6] = className;
		$[7] = t4;
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== Comp || $[10] !== isActive || $[11] !== props || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
			"data-slot": "sidebar-row",
			"data-active": isActive,
			className: t5,
			...props
		});
		$[9] = Comp;
		$[10] = isActive;
		$[11] = props;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}
/** Centers an icon in the 20px slot that row avatars also take. */
function SidebarRowIcon(t0) {
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
		t1 = cn$2("flex size-5 shrink-0 items-center justify-center", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-slot": "sidebar-row-icon",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}

export { SidebarRow, SidebarRowIcon };
