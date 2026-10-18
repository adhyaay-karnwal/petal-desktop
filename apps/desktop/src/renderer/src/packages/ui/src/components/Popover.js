// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Popover.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Anchor2, Content2, Portal, Root2, Trigger } from "../../../../vendor/@radix-ui/react-popover.js";

var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverAnchor = Anchor2;
var PopoverContent = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(15);
	let className;
	let props;
	let t1;
	let t2;
	let t3;
	if ($[0] !== t0) {
		({className, align: t1, sideOffset: t2, variant: t3, ...props} = t0);
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
	const align = t1 === void 0 ? "start" : t1;
	const sideOffset = t2 === void 0 ? 4 : t2;
	const t4 = (t3 === void 0 ? "default" : t3) === "menu" ? "border-ed-menu-border bg-ed-menu p-1 text-ed-ui" : "bg-ed-popover border-ed-border";
	let t5;
	if ($[6] !== className || $[7] !== t4) {
		t5 = cn$2("text-ed-popover-foreground z-50 rounded-md border shadow-ed-popover outline-none", t4, className);
		$[6] = className;
		$[7] = t4;
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== align || $[10] !== props || $[11] !== ref || $[12] !== sideOffset || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
			ref,
			"data-dismissable-layer": "",
			align,
			sideOffset,
			className: t5,
			...props
		}) });
		$[9] = align;
		$[10] = props;
		$[11] = ref;
		$[12] = sideOffset;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	return t6;
});
PopoverContent.displayName = Content2.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
