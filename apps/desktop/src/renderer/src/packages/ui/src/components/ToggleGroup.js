// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/ToggleGroup.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Item2, Root2$1 } from "../../../../vendor/@radix-ui/react-toggle-group.js";

var ToggleGroupContext = import_react.createContext("default");
function ToggleGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	let className;
	let props;
	let t1;
	if ($[0] !== t0) {
		({className, size: t1, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
	}
	const size = t1 === void 0 ? "default" : t1;
	const t2 = size === "default" && "h-9 rounded-[5px] p-1 gap-1";
	const t3 = size === "sm" && "h-6.5 rounded-[5px] p-0.5 gap-0.5";
	let t4;
	if ($[4] !== className || $[5] !== t2 || $[6] !== t3) {
		t4 = cn$2("inline-flex items-center bg-ed-tab-track text-ed-muted-foreground w-fit", t2, t3, className);
		$[4] = className;
		$[5] = t2;
		$[6] = t3;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== props || $[9] !== size || $[10] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2$1, {
			"data-slot": "toggle-group",
			"data-size": size,
			className: t4,
			...props
		});
		$[8] = props;
		$[9] = size;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== size || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupContext.Provider, {
			value: size,
			children: t5
		});
		$[12] = size;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	return t6;
}
function ToggleGroupItem(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
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
	const size = import_react.useContext(ToggleGroupContext);
	const t1 = size === "default" && "h-full rounded-[5px] px-3 py-1.5 text-sm";
	const t2 = size === "sm" && "h-full rounded-[5px] px-1.5 text-ed-ui";
	let t3;
	if ($[3] !== className || $[4] !== t1 || $[5] !== t2) {
		t3 = cn$2("inline-flex items-center justify-center font-medium whitespace-nowrap", "disabled:pointer-events-none disabled:opacity-50", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-ring focus-visible:ring-offset-2", "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "hover:text-ed-foreground", "border border-transparent data-[state=on]:border-ed-field-border data-[state=on]:bg-ed-tab-active data-[state=on]:text-ed-foreground", t1, t2, className);
		$[3] = className;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== props || $[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
			"data-slot": "toggle-group-item",
			className: t3,
			...props
		});
		$[7] = props;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	return t4;
}

export { ToggleGroup, ToggleGroupItem };
