// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/RadioGroup.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { s$7 } from "../../../../vendor/@phosphor-icons/react.js";
import { Indicator, Item2$2, Root2$5 } from "../../../../vendor/@radix-ui/react-radio-group.js";

function RadioGroup(t0) {
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
		t1 = cn$2("grid gap-3", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2$5, {
			"data-slot": "radio-group",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function RadioGroupItem(t0) {
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
		t1 = cn$2("aspect-square size-4 shrink-0 rounded-full border border-ed-input bg-ed-card text-ed-primary shadow-ed-control outline-none dark:bg-ed-input/30", "focus-visible:border-ed-ring focus-visible:ring-ed-ring/50 focus-visible:ring-[3px]", "aria-invalid:border-ed-destructive aria-invalid:ring-ed-destructive/20 dark:aria-invalid:ring-ed-destructive/40", "disabled:cursor-not-allowed disabled:opacity-50", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
			"data-slot": "radio-group-indicator",
			className: "relative flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$7, {
				weight: "fill",
				className: "absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 text-ed-primary"
			})
		});
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$2, {
			"data-slot": "radio-group-item",
			className: t1,
			...props,
			children: t2
		});
		$[6] = props;
		$[7] = t1;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}

export { RadioGroup, RadioGroupItem };
