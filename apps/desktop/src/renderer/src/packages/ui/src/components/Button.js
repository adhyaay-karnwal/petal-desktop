// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Button.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { SpinnerIcon } from "../icons.js";
import { Text$4 } from "./Text.js";
import { Tooltip } from "./Tooltip.js";

var buttonVariants = {
	default: "bg-ed-primary text-ed-primary-foreground hover:bg-ed-primary/90",
	destructive: "bg-ed-destructive text-white hover:bg-ed-destructive/90 focus-visible:ring-ed-destructive dark:bg-ed-destructive/60",
	outline: "border border-ed-field-border bg-ed-field text-ed-foreground",
	secondary: "bg-ed-secondary text-ed-foreground hover:bg-ed-secondary/80",
	ghost: "text-ed-inspector-value hover:bg-ed-ghost-hover hover:text-ed-accent-foreground",
	link: "text-ed-primary underline-offset-4 hover:underline",
	selected: "bg-ed-selected text-ed-selected-foreground hover:bg-ed-selected hover:text-ed-selected-foreground",
	toolbarSelected: "bg-ed-toolbar-active text-ed-toolbar-active-foreground hover:bg-ed-toolbar-active hover:text-ed-toolbar-active-foreground"
};
var sizes$1 = {
	default: "h-9 px-4 py-2 has-[>svg]:px-3",
	sm: "h-8 rounded-[5px] gap-1.5 px-3 has-[>svg]:px-2.5",
	xs: "h-6.5 gap-1 rounded-[5px] px-2 text-ed-ui font-normal has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
	text: "",
	icon: "size-9",
	"icon-sm": "size-8",
	"icon-xs": "size-6.5 rounded-[5px] [&_svg:not([class*='size-'])]:size-3",
	"icon-2xs": "size-5 rounded-[5px] [&_svg:not([class*='size-'])]:size-2.5",
	"icon-3xs": "",
	"icon-lg": "size-10",
	lg: "h-10 rounded-[5px] px-6 has-[>svg]:px-4"
};
var textSizes = {
	default: {
		size: "sm",
		weight: "medium"
	},
	sm: {
		size: "xs",
		weight: "medium"
	},
	xs: {
		size: "2xs",
		weight: "regular"
	},
	text: {
		size: "sm",
		weight: "medium"
	},
	icon: {
		size: "sm",
		weight: "medium"
	},
	"icon-sm": {
		size: "xs",
		weight: "medium"
	},
	"icon-xs": {
		size: "2xs",
		weight: "medium"
	},
	"icon-2xs": {
		size: "3xs",
		weight: "medium"
	},
	"icon-3xs": {
		size: "3xs",
		weight: "medium"
	},
	"icon-lg": {
		size: "sm",
		weight: "medium"
	},
	lg: {
		size: "sm",
		weight: "medium"
	}
};
var iconSizes = {
	default: 16,
	sm: 14,
	xs: 12,
	text: 16,
	icon: 20,
	"icon-sm": 16,
	"icon-xs": 12,
	"icon-2xs": 10,
	"icon-3xs": 10,
	"icon-lg": 24,
	lg: 16
};
/**
* Button's classes, for a non-button element that must take a button's exact place —
* e.g. a row that swaps its button for a rename field, which can't nest in a button.
*/
function buttonClassName(variant, size, className) {
	return cn$2("inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-2 focus-visible:ring-ed-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ed-background aria-invalid:border-ed-destructive aria-invalid:ring-ed-destructive/20 dark:aria-invalid:ring-ed-destructive/40", buttonVariants[variant || "default"], sizes$1[size || "default"], className);
}
var Button = import_react.forwardRef((t0, ref) => {
	const $ = (0, import_compiler_runtime.c)(57);
	let LeftIcon;
	let RightIcon;
	let className;
	let leftIconClassName;
	let leftIconProps;
	let leftIconSize;
	let loading;
	let props;
	let rightIconClassName;
	let rightIconProps;
	let rightIconSize;
	let size;
	let t1;
	let title;
	let tooltip;
	let tooltipProps;
	let variant;
	if ($[0] !== t0) {
		({className, variant, size, LeftIcon, leftIconClassName, leftIconSize, RightIcon, rightIconClassName, rightIconSize, loading, leftIconProps, rightIconProps, isChildText: t1, tooltip, tooltipProps, title, ...props} = t0);
		$[0] = t0;
		$[1] = LeftIcon;
		$[2] = RightIcon;
		$[3] = className;
		$[4] = leftIconClassName;
		$[5] = leftIconProps;
		$[6] = leftIconSize;
		$[7] = loading;
		$[8] = props;
		$[9] = rightIconClassName;
		$[10] = rightIconProps;
		$[11] = rightIconSize;
		$[12] = size;
		$[13] = t1;
		$[14] = title;
		$[15] = tooltip;
		$[16] = tooltipProps;
		$[17] = variant;
	} else {
		LeftIcon = $[1];
		RightIcon = $[2];
		className = $[3];
		leftIconClassName = $[4];
		leftIconProps = $[5];
		leftIconSize = $[6];
		loading = $[7];
		props = $[8];
		rightIconClassName = $[9];
		rightIconProps = $[10];
		rightIconSize = $[11];
		size = $[12];
		t1 = $[13];
		title = $[14];
		tooltip = $[15];
		tooltipProps = $[16];
		variant = $[17];
	}
	const isChildText = t1 === void 0 ? true : t1;
	const tooltipContent = tooltip ?? title;
	const accessibleLabel = props["aria-label"] ?? (typeof tooltipContent === "string" ? tooltipContent : void 0);
	const t2 = variant || "default";
	const t3 = size || "default";
	let t4;
	if ($[18] !== className || $[19] !== size || $[20] !== variant) {
		t4 = buttonClassName(variant, size, className);
		$[18] = className;
		$[19] = size;
		$[20] = variant;
		$[21] = t4;
	} else t4 = $[21];
	const t5 = loading || props.disabled;
	let t6;
	if ($[22] !== LeftIcon || $[23] !== leftIconClassName || $[24] !== leftIconProps || $[25] !== leftIconSize || $[26] !== loading || $[27] !== size) {
		t6 = LeftIcon && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftIcon, {
			width: leftIconSize || iconSizes[size || "default"],
			height: leftIconSize || iconSizes[size || "default"],
			className: cn$2("shrink-0", leftIconClassName),
			...leftIconProps
		});
		$[22] = LeftIcon;
		$[23] = leftIconClassName;
		$[24] = leftIconProps;
		$[25] = leftIconSize;
		$[26] = loading;
		$[27] = size;
		$[28] = t6;
	} else t6 = $[28];
	let t7;
	if ($[29] !== loading) {
		t7 = loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			className: "animate-spin",
			width: 16,
			height: 16
		});
		$[29] = loading;
		$[30] = t7;
	} else t7 = $[30];
	let t8;
	if ($[31] !== isChildText || $[32] !== props.children || $[33] !== size) {
		t8 = props.children && isChildText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: textSizes[size || "default"].size,
			weight: textSizes[size || "default"].weight,
			className: "text-inherit",
			children: props.children
		}) : props.children;
		$[31] = isChildText;
		$[32] = props.children;
		$[33] = size;
		$[34] = t8;
	} else t8 = $[34];
	let t9;
	if ($[35] !== RightIcon || $[36] !== rightIconClassName || $[37] !== rightIconProps || $[38] !== rightIconSize || $[39] !== size) {
		t9 = RightIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightIcon, {
			width: rightIconSize || iconSizes[size || "default"],
			height: rightIconSize || iconSizes[size || "default"],
			className: cn$2("shrink-0", rightIconClassName),
			...rightIconProps
		});
		$[35] = RightIcon;
		$[36] = rightIconClassName;
		$[37] = rightIconProps;
		$[38] = rightIconSize;
		$[39] = size;
		$[40] = t9;
	} else t9 = $[40];
	let t10;
	if ($[41] !== accessibleLabel || $[42] !== props || $[43] !== ref || $[44] !== t2 || $[45] !== t3 || $[46] !== t4 || $[47] !== t5 || $[48] !== t6 || $[49] !== t7 || $[50] !== t8 || $[51] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			"data-slot": "button",
			"data-variant": t2,
			"data-size": t3,
			className: t4,
			ref,
			...props,
			"aria-label": accessibleLabel,
			disabled: t5,
			children: [
				t6,
				t7,
				t8,
				t9
			]
		});
		$[41] = accessibleLabel;
		$[42] = props;
		$[43] = ref;
		$[44] = t2;
		$[45] = t3;
		$[46] = t4;
		$[47] = t5;
		$[48] = t6;
		$[49] = t7;
		$[50] = t8;
		$[51] = t9;
		$[52] = t10;
	} else t10 = $[52];
	const button = t10;
	let t11;
	if ($[53] !== button || $[54] !== tooltipContent || $[55] !== tooltipProps) {
		t11 = tooltipContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: tooltipContent,
			contentProps: tooltipProps,
			children: button
		}) : button;
		$[53] = button;
		$[54] = tooltipContent;
		$[55] = tooltipProps;
		$[56] = t11;
	} else t11 = $[56];
	return t11;
});
Button.displayName = "Button";

export { Button, buttonClassName };
