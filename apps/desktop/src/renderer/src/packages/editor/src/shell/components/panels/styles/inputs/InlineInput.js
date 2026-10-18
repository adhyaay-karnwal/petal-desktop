// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/InlineInput.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { AddVariableIcon, XIcon } from "../../../../../../../ui/src/icons.js";
import { Tooltip } from "../../../../../../../ui/src/components/Tooltip.js";
import { Popover, PopoverAnchor, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { InspectorClassPickerIndicator, InspectorControlAction, InspectorControlInput, InspectorControlShell, InspectorScrubHandle } from "../primitives.js";
import { ClassPickerPopover } from "./parts/ClassPickerPopover.js";
import { inspectorPropertySupportsAuto } from "../../../../utils/unitValue.js";
import { useInspectorScrub } from "./useInspectorScrub.js";
import { UnitMenu } from "./UnitMenu.js";
import { useUnitValue } from "./useUnitValue.js";
import { displayValue } from "../../../../utils/cssValue.js";
import { useClassSuggestions } from "../../../../hooks/useClassSuggestions.js";
import { ActiveClassChip, ActiveClassUnlinkAction } from "./parts/ActiveClassChip.js";

/**
* InlineInput — labelled text input with an optional unit suffix, scrub-on-
* label-drag, and a Tailwind-class suggestion popover. Renders one of four
* states: active class chip, inline override (class struck through),
* normal-with-suggestions, or plain input.
*/
function InlineInput(t0) {
	const $ = (0, import_compiler_runtime.c)(75);
	const { label, icon, value, onChange, isSet: t1, unit: t2, showUnit: t3, unitPicker: t4, preserveUnitless: t5, min, placeholder: t6, className, isMixedValue: t7, source, sourceClass, isPending: t8, onClearOverride, cssProperty, tooltipLabel, onSelectClass } = t0;
	const isSet = t1 === void 0 ? false : t1;
	const unit = t2 === void 0 ? "px" : t2;
	const showUnit = t3 === void 0 ? true : t3;
	const unitPicker = t4 === void 0 ? showUnit : t4;
	const preserveUnitless = t5 === void 0 ? false : t5;
	const placeholder = t6 === void 0 ? "Auto" : t6;
	const isMixedValue = t7 === void 0 ? false : t7;
	const isPending = t8 === void 0 ? false : t8;
	const { showSuggestions, setShowSuggestions, hasSuggestions, allSuggestions } = useClassSuggestions(cssProperty, onSelectClass);
	const [unitMenuOpen, setUnitMenuOpen] = import_react.useState(false);
	let t9;
	if ($[0] !== cssProperty) {
		t9 = inspectorPropertySupportsAuto(cssProperty);
		$[0] = cssProperty;
		$[1] = t9;
	} else t9 = $[1];
	const allowAuto = t9;
	const t10 = unitPicker || showUnit ? unit : "";
	const t11 = unitPicker || showUnit;
	let t12;
	if ($[2] !== allowAuto || $[3] !== isMixedValue || $[4] !== min || $[5] !== onChange || $[6] !== preserveUnitless || $[7] !== t10 || $[8] !== t11 || $[9] !== value) {
		t12 = {
			value,
			onChange,
			isMixedValue,
			defaultUnit: t10,
			min,
			strictUnits: t11,
			preserveUnitless,
			allowAuto
		};
		$[2] = allowAuto;
		$[3] = isMixedValue;
		$[4] = min;
		$[5] = onChange;
		$[6] = preserveUnitless;
		$[7] = t10;
		$[8] = t11;
		$[9] = value;
		$[10] = t12;
	} else t12 = $[10];
	const unitValue = useUnitValue(t12);
	let t13;
	if ($[11] !== unitValue) {
		t13 = (e) => {
			unitValue.setDraft(e.target.value);
		};
		$[11] = unitValue;
		$[12] = t13;
	} else t13 = $[12];
	const handleChange = t13;
	let t14;
	if ($[13] !== min || $[14] !== unitValue.showMixed) {
		t14 = {
			min,
			mixed: unitValue.showMixed
		};
		$[13] = min;
		$[14] = unitValue.showMixed;
		$[15] = t14;
	} else t14 = $[15];
	const { scrubRef, isScrubbing, onInputKeyDown } = useInspectorScrub(unitValue.scrubValue, unitValue.applyScrub, t14);
	let t15;
	if ($[16] !== showUnit || $[17] !== unit || $[18] !== unitPicker || $[19] !== unitValue.draft || $[20] !== unitValue.showMixed) {
		t15 = !unitPicker && showUnit && unitValue.draft && !unitValue.showMixed && /^-?[\d.]+$/.test(unitValue.draft) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-foreground-secondary",
			children: unit
		}) : null;
		$[16] = showUnit;
		$[17] = unit;
		$[18] = unitPicker;
		$[19] = unitValue.draft;
		$[20] = unitValue.showMixed;
		$[21] = t15;
	} else t15 = $[21];
	const unitBadge = t15;
	let t16;
	if ($[22] !== allowAuto || $[23] !== cssProperty || $[24] !== unitPicker || $[25] !== unitValue.selectUnit || $[26] !== unitValue.selectedUnit) {
		t16 = unitPicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitMenu, {
			value: unitValue.selectedUnit,
			onValueChange: unitValue.selectUnit,
			label: cssProperty ?? "Value",
			onOpenChange: setUnitMenuOpen,
			allowAuto
		}) : null;
		$[22] = allowAuto;
		$[23] = cssProperty;
		$[24] = unitPicker;
		$[25] = unitValue.selectUnit;
		$[26] = unitValue.selectedUnit;
		$[27] = t16;
	} else t16 = $[27];
	const unitMenu = t16;
	let t17;
	if ($[28] !== icon || $[29] !== isPending || $[30] !== sourceClass || $[31] !== tooltipLabel || $[32] !== value) {
		t17 = sourceClass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
			sourceClass,
			fieldTooltip: tooltipLabel,
			value: displayValue(value),
			isPending,
			className: icon ? "pl-1.5" : void 0
		}) : null;
		$[28] = icon;
		$[29] = isPending;
		$[30] = sourceClass;
		$[31] = tooltipLabel;
		$[32] = value;
		$[33] = t17;
	} else t17 = $[33];
	const activeClassChip = t17;
	let t18;
	if ($[34] !== onClearOverride) {
		t18 = onClearOverride ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassUnlinkAction, { onClear: onClearOverride }) : null;
		$[34] = onClearOverride;
		$[35] = t18;
	} else t18 = $[35];
	const clearClassAction = t18;
	let t19;
	if ($[36] !== icon || $[37] !== label || $[38] !== scrubRef) {
		t19 = icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: !label ? scrubRef : void 0,
			children: icon
		}) : null;
		$[36] = icon;
		$[37] = label;
		$[38] = scrubRef;
		$[39] = t19;
	} else t19 = $[39];
	const leadingIcon = t19;
	let t20;
	if ($[40] !== className) {
		t20 = cn$2("relative flex items-center gap-1.5 min-w-0", className);
		$[40] = className;
		$[41] = t20;
	} else t20 = $[41];
	let t21;
	if ($[42] !== label || $[43] !== scrubRef) {
		t21 = label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			"aria-hidden": void 0,
			className: "pl-0 text-[12px] text-ed-foreground",
			children: label
		});
		$[42] = label;
		$[43] = scrubRef;
		$[44] = t21;
	} else t21 = $[44];
	let t22;
	if ($[45] !== activeClassChip || $[46] !== allSuggestions || $[47] !== clearClassAction || $[48] !== cssProperty || $[49] !== handleChange || $[50] !== hasSuggestions || $[51] !== icon || $[52] !== isScrubbing || $[53] !== isSet || $[54] !== leadingIcon || $[55] !== onClearOverride || $[56] !== onInputKeyDown || $[57] !== onSelectClass || $[58] !== placeholder || $[59] !== setShowSuggestions || $[60] !== showSuggestions || $[61] !== source || $[62] !== sourceClass || $[63] !== tooltipLabel || $[64] !== unit || $[65] !== unitBadge || $[66] !== unitMenu || $[67] !== unitMenuOpen || $[68] !== unitPicker || $[69] !== unitValue) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "group/input relative flex-1 min-w-0",
			children: sourceClass && source === "class" ? hasSuggestions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showSuggestions,
				onOpenChange: setShowSuggestions,
				modal: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
						active: isScrubbing || showSuggestions,
						className: !icon ? "pl-1" : void 0,
						children: [
							leadingIcon,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
									className: "min-w-0 flex-1 justify-start p-0",
									children: activeClassChip
								})
							}),
							clearClassAction
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
					suggestions: allSuggestions,
					cssProperty,
					sourceClass,
					onSelect: (cls) => onSelectClass?.(cls),
					onClose: () => setShowSuggestions(false)
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
				active: isScrubbing,
				className: !icon ? "pl-1" : void 0,
				children: [
					leadingIcon,
					activeClassChip,
					clearClassAction
				]
			}) : sourceClass && source === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
				active: isScrubbing || unitMenuOpen,
				"aria-invalid": unitValue.isInvalid || void 0,
				className: "relative",
				children: [
					leadingIcon,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
						value: unitValue.showMixed ? "" : unitValue.draft,
						onChange: handleChange,
						onBlur: () => {
							unitValue.commit();
							setTimeout(() => setShowSuggestions(false), 150);
						},
						onKeyDown: onInputKeyDown,
						placeholder: unitValue.showMixed ? "-" : placeholder,
						"aria-invalid": unitValue.isInvalid || void 0,
						tooltip: unitValue.errorMessage ?? tooltipLabel,
						className: cn$2("w-full text-left", icon ? "pl-1.5" : "pl-2", "pr-24")
					}),
					unitMenu,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn$2("absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5", unitPicker ? "right-7" : "right-1"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-1.5 py-0.5 rounded text-[10px] font-mono bg-ed-muted/50 text-ed-muted-foreground line-through truncate max-w-20",
							children: sourceClass
						}), onClearOverride && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: "Restore class value",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Restore class value",
								onClick: onClearOverride,
								className: "text-ed-foreground-secondary hover:text-ed-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-3.75" })
							})
						})]
					})
				]
			}) : hasSuggestions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showSuggestions,
				onOpenChange: setShowSuggestions,
				modal: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
						active: isScrubbing || showSuggestions || unitMenuOpen,
						"aria-invalid": unitValue.isInvalid || void 0,
						children: [
							leadingIcon,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
								value: unitValue.showMixed ? "" : unitValue.draft,
								onChange: handleChange,
								onBlur: unitValue.commit,
								onKeyDown: onInputKeyDown,
								placeholder: unitValue.showMixed ? "-" : placeholder,
								"aria-invalid": unitValue.isInvalid || void 0,
								tooltip: unitValue.errorMessage ?? tooltipLabel,
								className: cn$2(icon ? "pl-1.5" : "pl-2", "pr-1")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
									"aria-label": "Apply class",
									className: "ml-auto px-1.5 text-ed-foreground-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorClassPickerIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddVariableIcon, {}) })
								})
							}),
							unitMenu ?? unitBadge
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
					suggestions: allSuggestions,
					cssProperty,
					sourceClass,
					onSelect: (cls_0) => onSelectClass?.(cls_0),
					onClose: () => setShowSuggestions(false)
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
				active: isScrubbing || unitMenuOpen,
				"aria-invalid": unitValue.isInvalid || void 0,
				className: cn$2("relative", isSet && "ring-1 ring-ed-foreground/20"),
				children: [
					leadingIcon,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
						value: unitValue.showMixed ? "" : unitValue.draft,
						onChange: handleChange,
						onBlur: unitValue.commit,
						onKeyDown: onInputKeyDown,
						placeholder: unitValue.showMixed ? "-" : placeholder,
						"aria-invalid": unitValue.isInvalid || void 0,
						tooltip: unitValue.errorMessage ?? tooltipLabel,
						className: cn$2("w-full text-left", icon ? "pl-1.5" : "pl-2", "pr-6")
					}),
					unitMenu,
					unitBadge && !unitPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-1 top-1/2 -translate-y-1/2 text-[11px] text-ed-foreground-secondary",
						children: unit
					})
				]
			})
		});
		$[45] = activeClassChip;
		$[46] = allSuggestions;
		$[47] = clearClassAction;
		$[48] = cssProperty;
		$[49] = handleChange;
		$[50] = hasSuggestions;
		$[51] = icon;
		$[52] = isScrubbing;
		$[53] = isSet;
		$[54] = leadingIcon;
		$[55] = onClearOverride;
		$[56] = onInputKeyDown;
		$[57] = onSelectClass;
		$[58] = placeholder;
		$[59] = setShowSuggestions;
		$[60] = showSuggestions;
		$[61] = source;
		$[62] = sourceClass;
		$[63] = tooltipLabel;
		$[64] = unit;
		$[65] = unitBadge;
		$[66] = unitMenu;
		$[67] = unitMenuOpen;
		$[68] = unitPicker;
		$[69] = unitValue;
		$[70] = t22;
	} else t22 = $[70];
	let t23;
	if ($[71] !== t20 || $[72] !== t21 || $[73] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t20,
			children: [t21, t22]
		});
		$[71] = t20;
		$[72] = t21;
		$[73] = t22;
		$[74] = t23;
	} else t23 = $[74];
	return t23;
}

export { InlineInput };
