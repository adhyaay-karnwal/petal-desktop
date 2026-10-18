// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Switch.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Root$1, Thumb } from "../../../../vendor/@radix-ui/react-switch.js";

function Switch(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
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
	let t2;
	if ($[4] !== className) {
		t2 = cn$2("peer group/switch inline-flex shrink-0 items-center rounded-full border px-[2px] outline-none", "data-[state=checked]:border-transparent data-[state=checked]:bg-ed-primary data-[state=unchecked]:border-transparent data-[state=unchecked]:bg-ed-input", "focus-visible:border-ed-ring focus-visible:ring-ed-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", "data-[size=default]:h-4.5 data-[size=default]:w-7.5 data-[size=sm]:h-3.5 data-[size=sm]:w-6", className);
		$[4] = className;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, {
			"data-slot": "switch-thumb",
			className: "pointer-events-none block rounded-full bg-ed-card ring-0 group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2.5 data-[state=unchecked]:translate-x-0 group-data-[size=default]/switch:data-[state=checked]:translate-x-3 group-data-[size=sm]/switch:data-[state=checked]:translate-x-2 [.editor-dark_&]:data-[state=unchecked]:bg-[#7a7a7a] [.editor-dark_&]:data-[state=checked]:bg-ed-primary-foreground"
		});
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== props || $[8] !== size || $[9] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
			"data-slot": "switch",
			"data-size": size,
			className: t2,
			...props,
			children: t3
		});
		$[7] = props;
		$[8] = size;
		$[9] = t2;
		$[10] = t4;
	} else t4 = $[10];
	return t4;
}

export { Switch };
