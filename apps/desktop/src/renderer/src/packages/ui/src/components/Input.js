// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Input.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Tooltip } from "./Tooltip.js";
import { fieldStates, fieldSurface } from "../lib/fieldStyles.js";

var inputSizeClasses = {
	default: "h-9 px-3 py-1 text-sm",
	xs: "h-6.5 px-2 text-ed-ui placeholder:text-ed-muted-foreground/70"
};
function Input(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	let className;
	let props;
	let t1;
	let tooltip;
	let tooltipProps;
	let type;
	if ($[0] !== t0) {
		({className, type, size: t1, tooltip, tooltipProps, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
		$[4] = tooltip;
		$[5] = tooltipProps;
		$[6] = type;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
		tooltip = $[4];
		tooltipProps = $[5];
		type = $[6];
	}
	const size = t1 === void 0 ? "default" : t1;
	const t2 = inputSizeClasses[size];
	let t3;
	if ($[7] !== className || $[8] !== t2) {
		t3 = cn$2("file:text-ed-foreground placeholder:text-ed-muted-foreground selection:bg-ed-primary selection:text-ed-primary-foreground w-full min-w-0 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", t2, fieldSurface, fieldStates, className);
		$[7] = className;
		$[8] = t2;
		$[9] = t3;
	} else t3 = $[9];
	const t4 = props["aria-label"] ?? (typeof tooltip === "string" ? tooltip : void 0);
	let t5;
	if ($[10] !== props || $[11] !== size || $[12] !== t3 || $[13] !== t4 || $[14] !== type) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			"data-slot": "input",
			"data-size": size,
			className: t3,
			...props,
			"aria-label": t4
		});
		$[10] = props;
		$[11] = size;
		$[12] = t3;
		$[13] = t4;
		$[14] = type;
		$[15] = t5;
	} else t5 = $[15];
	const input = t5;
	let t6;
	if ($[16] !== input || $[17] !== tooltip || $[18] !== tooltipProps) {
		t6 = tooltip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: tooltip,
			contentProps: tooltipProps,
			children: input
		}) : input;
		$[16] = input;
		$[17] = tooltip;
		$[18] = tooltipProps;
		$[19] = t6;
	} else t6 = $[19];
	return t6;
}

export { Input };
