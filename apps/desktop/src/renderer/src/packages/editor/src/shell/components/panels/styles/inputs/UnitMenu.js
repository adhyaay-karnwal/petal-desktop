// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/UnitMenu.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { Tooltip } from "../../../../../../../ui/src/components/Tooltip.js";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../../../../../../../ui/src/components/Select.js";
import { releaseInspectorControlFocus } from "../primitives.js";
import { INSPECTOR_LENGTH_UNITS } from "../../../../utils/unitValue.js";

function unitLabel(value, selectedMode) {
	if (selectedMode || !value || value === "auto") return "–";
	return value;
}
function menuUnitLabel(value) {
	return value === "auto" ? "Auto" : value;
}
function UnitMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(37);
	const { value, onValueChange, label: t1, className, onOpenChange, allowAuto: t2, units: t3, modeOptions: t4, selectedMode, onModeChange, showTooltip: t5 } = t0;
	const label = t1 === void 0 ? "Value" : t1;
	const allowAuto = t2 === void 0 ? false : t2;
	const units = t3 === void 0 ? INSPECTOR_LENGTH_UNITS : t3;
	let t6;
	if ($[0] !== t4) {
		t6 = t4 === void 0 ? [] : t4;
		$[0] = t4;
		$[1] = t6;
	} else t6 = $[1];
	const modeOptions = t6;
	const showTooltip = t5 === void 0 ? true : t5;
	const [open, setOpen] = import_react.useState(false);
	const triggerRef = import_react.useRef(null);
	const selectedValue = selectedMode ?? value ?? "auto";
	const hasModeOptions = allowAuto || modeOptions.length > 0;
	const isUnitlessMode = !value || value === "auto" || Boolean(selectedMode);
	let t7;
	if ($[2] !== modeOptions || $[3] !== onModeChange || $[4] !== onValueChange) {
		t7 = (nextValue) => {
			if (modeOptions.some((option) => option.value === nextValue)) {
				onModeChange?.(nextValue);
				return;
			}
			onValueChange(nextValue);
		};
		$[2] = modeOptions;
		$[3] = onModeChange;
		$[4] = onValueChange;
		$[5] = t7;
	} else t7 = $[5];
	let t8;
	if ($[6] !== onOpenChange) {
		t8 = (nextOpen) => {
			setOpen(nextOpen);
			onOpenChange?.(nextOpen);
		};
		$[6] = onOpenChange;
		$[7] = t8;
	} else t8 = $[7];
	const t9 = `${label} unit`;
	const t10 = showTooltip ? void 0 : false;
	const t11 = `${label} unit: ${selectedMode ?? value ?? "unset"}`;
	const t12 = isUnitlessMode ? "opacity-0 group-hover/inspector-control:opacity-100 group-focus-within/inspector-control:opacity-100 group-data-[active=true]/inspector-control:opacity-100 [&>span]:invisible [&>span]:absolute [&>span]:right-1.5 [&>span]:top-1/2 [&>span]:-translate-y-1/2 [&>svg]:size-3.5 [&>svg]:opacity-100" : "[&>svg]:hidden";
	let t13;
	if ($[8] !== className || $[9] !== t12) {
		t13 = cn$2("relative h-full w-auto min-w-6 gap-0 rounded-none border-0 bg-transparent px-1.5 py-0 text-[11px] font-normal tabular-nums text-ed-inspector-chrome shadow-none before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-ed-field-border before:opacity-0 before:content-[''] group-hover/inspector-control:before:opacity-100 group-focus-within/inspector-control:before:bg-ed-inspector-active-border group-focus-within/inspector-control:before:opacity-100 group-data-[active=true]/inspector-control:before:bg-ed-inspector-active-border group-data-[active=true]/inspector-control:before:opacity-100 group-aria-invalid/inspector-control:before:bg-ed-destructive hover:text-ed-foreground-secondary focus:text-ed-foreground-secondary focus:ring-0 data-[state=open]:text-ed-foreground-secondary", t12, className);
		$[8] = className;
		$[9] = t12;
		$[10] = t13;
	} else t13 = $[10];
	let t14;
	if ($[11] !== selectedMode || $[12] !== value) {
		t14 = unitLabel(value, selectedMode);
		$[11] = selectedMode;
		$[12] = value;
		$[13] = t14;
	} else t14 = $[13];
	let t15;
	if ($[14] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { children: t14 });
		$[14] = t14;
		$[15] = t15;
	} else t15 = $[15];
	let t16;
	if ($[16] !== t11 || $[17] !== t13 || $[18] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			ref: triggerRef,
			"aria-label": t11,
			className: t13,
			children: t15
		});
		$[16] = t11;
		$[17] = t13;
		$[18] = t15;
		$[19] = t16;
	} else t16 = $[19];
	let t17;
	if ($[20] !== t10 || $[21] !== t16 || $[22] !== t9) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: t9,
			open: t10,
			children: t16
		});
		$[20] = t10;
		$[21] = t16;
		$[22] = t9;
		$[23] = t17;
	} else t17 = $[23];
	let t18;
	if ($[24] !== allowAuto || $[25] !== hasModeOptions || $[26] !== modeOptions || $[27] !== open || $[28] !== units) {
		t18 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
			position: "item-aligned",
			className: "w-max min-w-0",
			onCloseAutoFocus: (event) => {
				releaseInspectorControlFocus(event);
				triggerRef.current?.blur();
			},
			children: [
				units.map(_temp$82),
				hasModeOptions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator, {}),
				allowAuto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "auto",
					className: "justify-start gap-1.5 [&>span:first-child]:ml-0",
					children: "Auto"
				}),
				modeOptions.map(_temp2$51)
			]
		});
		$[24] = allowAuto;
		$[25] = hasModeOptions;
		$[26] = modeOptions;
		$[27] = open;
		$[28] = units;
		$[29] = t18;
	} else t18 = $[29];
	let t19;
	if ($[30] !== open || $[31] !== selectedValue || $[32] !== t17 || $[33] !== t18 || $[34] !== t7 || $[35] !== t8) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: selectedValue,
			onValueChange: t7,
			open,
			onOpenChange: t8,
			children: [t17, t18]
		});
		$[30] = open;
		$[31] = selectedValue;
		$[32] = t17;
		$[33] = t18;
		$[34] = t7;
		$[35] = t8;
		$[36] = t19;
	} else t19 = $[36];
	return t19;
}
function _temp2$51(option_1) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
		value: option_1.value,
		disabled: option_1.disabled,
		className: "justify-start gap-1.5 [&>span:first-child]:ml-0",
		children: option_1.label
	}, option_1.value);
}
function _temp$82(option_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
		value: option_0,
		className: "justify-start gap-1.5 [&>span:first-child]:ml-0",
		children: menuUnitLabel(option_0)
	}, option_0);
}

export { UnitMenu };
