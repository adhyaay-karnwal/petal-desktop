// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/AppearanceSection.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { BlendModeIcon } from "../../../../../../../ui/src/icons.js";
import { LayoutFieldLabel } from "../primitives.js";
import { InspectorSection } from "./InspectorSection.js";
import { InspectorDropdown } from "../inputs/parts/InspectorDropdown.js";
import { useStyleField } from "../StyleOpsContext.js";
import { StyleOpacityInput } from "../fields/layout.js";
import { VisibilityToggleButton } from "../layout/controls.js";

/**
* Appearance section — element opacity, visibility, and mix-blend mode.
*/
var MIX_BLEND_MODE_OPTIONS = [
	{
		value: "normal",
		label: "Normal"
	},
	{
		value: "multiply",
		label: "Multiply"
	},
	{
		value: "screen",
		label: "Screen"
	},
	{
		value: "overlay",
		label: "Overlay"
	},
	{
		value: "darken",
		label: "Darken"
	},
	{
		value: "lighten",
		label: "Lighten"
	},
	{
		value: "color-dodge",
		label: "Color Dodge"
	},
	{
		value: "color-burn",
		label: "Color Burn"
	},
	{
		value: "hard-light",
		label: "Hard Light"
	},
	{
		value: "soft-light",
		label: "Soft Light"
	},
	{
		value: "difference",
		label: "Difference"
	},
	{
		value: "exclusion",
		label: "Exclusion"
	},
	{
		value: "hue",
		label: "Hue"
	},
	{
		value: "saturation",
		label: "Saturation"
	},
	{
		value: "color",
		label: "Color"
	},
	{
		value: "luminosity",
		label: "Luminosity"
	},
	{
		value: "plus-darker",
		label: "Plus Darker"
	},
	{
		value: "plus-lighter",
		label: "Plus Lighter"
	}
];
function AppearanceSection(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const { className } = t1;
	const blendMode = useStyleField("mixBlendMode");
	const currentValue = blendMode.isMixed ? "" : blendMode.value || "normal";
	let t2;
	if ($[2] !== currentValue) {
		t2 = MIX_BLEND_MODE_OPTIONS.find((option) => option.value === currentValue);
		$[2] = currentValue;
		$[3] = t2;
	} else t2 = $[3];
	const currentOption = t2;
	const currentLabel = blendMode.isMixed ? "-" : currentOption?.label ?? currentValue;
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityToggleButton, {});
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Opacity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleOpacityInput, {})]
		});
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Blend mode" });
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlendModeIcon, { className: "size-4 shrink-0 text-ed-inspector-chrome" });
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== currentLabel) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [t6, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: currentLabel
			})]
		});
		$[8] = currentLabel;
		$[9] = t7;
	} else t7 = $[9];
	const t8 = currentValue || "normal";
	let t9;
	if ($[10] !== blendMode) {
		t9 = (nextValue) => {
			if (nextValue === "normal") blendMode.clear();
			else blendMode.set(nextValue);
		};
		$[10] = blendMode;
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== blendMode.isMixed || $[13] !== t7 || $[14] !== t8 || $[15] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 grid-cols-2 gap-2",
			children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-2",
				children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
					label: "Blend mode",
					value: t7,
					className: "w-full",
					contentClassName: "max-h-72",
					selectedValue: t8,
					isMixed: blendMode.isMixed,
					options: MIX_BLEND_MODE_OPTIONS,
					onValueChange: t9
				})]
			})]
		});
		$[12] = blendMode.isMixed;
		$[13] = t7;
		$[14] = t8;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== className || $[18] !== t10) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			title: "Appearance",
			action: t3,
			className,
			children: t10
		});
		$[17] = className;
		$[18] = t10;
		$[19] = t11;
	} else t11 = $[19];
	return t11;
}

export { AppearanceSection };
