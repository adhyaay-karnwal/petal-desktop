// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/LayoutValueInput.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { SpinnerIcon } from "../../../../../../../ui/src/icons.js";
import { Popover, PopoverAnchor, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { InspectorClassPickerIndicator, InspectorControlAction, InspectorControlInput, InspectorControlShell, InspectorScrubHandle } from "../primitives.js";
import { ClassPickerPopover } from "./parts/ClassPickerPopover.js";
import { inspectorPropertySupportsAuto } from "../../../../utils/unitValue.js";
import { useInspectorScrub } from "./useInspectorScrub.js";
import { UnitMenu } from "./UnitMenu.js";
import { useUnitValue } from "./useUnitValue.js";
import { displayValue } from "../../../../utils/cssValue.js";
import { HexDotGlyph } from "../layout/glyphs.js";
import { useClassSuggestions } from "../../../../hooks/useClassSuggestions.js";
import { ActiveClassChip, ActiveClassUnlinkAction } from "./parts/ActiveClassChip.js";
import { OverrideChip } from "./parts/OverrideChip.js";

/**
* LayoutValueInput — the muted-shell numeric input used throughout the Layout
* and Appearance sections (padding, gap, opacity, radius, z-index…). Leading
* scrub icon, optional unit suffix, min/max clamping, and a Tailwind-class
* suggestion affordance (HexDot glyph) on the trailing edge.
*/
function LayoutValueInput(t0) {
	const $ = (0, import_compiler_runtime.c)(144);
	const { icon, value, onChange, placeholder: t1, unit: t2, suffix, inlineSuffix: t3, unitPicker: unitPickerProp, allowedUnits, min, max, scrubStep, scrubPrecision, disabled: t4, ariaLabel, isMixedValue: t5, source, sourceClass, isPending: t6, onClearOverride, cssProperty, tooltipLabel, onSelectClass, inputClassName, modeOptions: t7, onUnitMenuOpenChange } = t0;
	const placeholder = t1 === void 0 ? "0" : t1;
	const unit = t2 === void 0 ? "px" : t2;
	const inlineSuffix = t3 === void 0 ? false : t3;
	const disabled = t4 === void 0 ? false : t4;
	const isMixedValue = t5 === void 0 ? false : t5;
	const isPending = t6 === void 0 ? false : t6;
	let t8;
	if ($[0] !== t7) {
		t8 = t7 === void 0 ? [] : t7;
		$[0] = t7;
		$[1] = t8;
	} else t8 = $[1];
	const modeOptions = t8;
	const unitPicker = unitPickerProp ?? unit === "px";
	const [unitMenuOpen, setUnitMenuOpen] = import_react.useState(false);
	const [isInputFocused, setIsInputFocused] = import_react.useState(false);
	let t9;
	if ($[2] !== cssProperty) {
		t9 = inspectorPropertySupportsAuto(cssProperty);
		$[2] = cssProperty;
		$[3] = t9;
	} else t9 = $[3];
	const allowAuto = t9;
	let t10;
	if ($[4] !== allowedUnits || $[5] !== unit || $[6] !== unitPicker) {
		t10 = unitPicker ? allowedUnits : unit ? [unit] : [];
		$[4] = allowedUnits;
		$[5] = unit;
		$[6] = unitPicker;
		$[7] = t10;
	} else t10 = $[7];
	let t11;
	if ($[8] !== modeOptions) {
		t11 = modeOptions.map(_temp$77);
		$[8] = modeOptions;
		$[9] = t11;
	} else t11 = $[9];
	let t12;
	if ($[10] !== allowAuto || $[11] !== isMixedValue || $[12] !== max || $[13] !== min || $[14] !== onChange || $[15] !== t10 || $[16] !== t11 || $[17] !== unit || $[18] !== value) {
		t12 = {
			value,
			onChange,
			isMixedValue,
			defaultUnit: unit,
			min,
			max,
			allowedUnits: t10,
			allowAuto,
			acceptedKeywords: t11
		};
		$[10] = allowAuto;
		$[11] = isMixedValue;
		$[12] = max;
		$[13] = min;
		$[14] = onChange;
		$[15] = t10;
		$[16] = t11;
		$[17] = unit;
		$[18] = value;
		$[19] = t12;
	} else t12 = $[19];
	const unitValue = useUnitValue(t12);
	const { showSuggestions, setShowSuggestions, hasSuggestions, allSuggestions } = useClassSuggestions(cssProperty, onSelectClass);
	const displayedSuffix = suffix ?? unit;
	const inlineFixedSuffix = !unitPicker && (unit === "%" || inlineSuffix && !!suffix);
	let t13;
	if ($[20] !== inlineFixedSuffix || $[21] !== isInputFocused || $[22] !== unitValue.draft || $[23] !== unitValue.isInvalid || $[24] !== unitValue.showMixed) {
		t13 = inlineFixedSuffix && !isInputFocused && !unitValue.isInvalid && !unitValue.showMixed && unitValue.draft !== "" && unitValue.draft.toLowerCase() !== "auto";
		$[20] = inlineFixedSuffix;
		$[21] = isInputFocused;
		$[22] = unitValue.draft;
		$[23] = unitValue.isInvalid;
		$[24] = unitValue.showMixed;
		$[25] = t13;
	} else t13 = $[25];
	const showInlineFixedSuffix = t13;
	let t14;
	if ($[26] !== modeOptions || $[27] !== unitValue.draft) {
		let t15;
		if ($[29] !== unitValue.draft) {
			t15 = (option_0) => option_0.value === unitValue.draft.trim().toLowerCase();
			$[29] = unitValue.draft;
			$[30] = t15;
		} else t15 = $[30];
		t14 = modeOptions.find(t15);
		$[26] = modeOptions;
		$[27] = unitValue.draft;
		$[28] = t14;
	} else t14 = $[28];
	const activeMode = t14;
	const idleModeLabel = isInputFocused ? void 0 : activeMode?.label;
	let t15;
	if ($[31] !== displayedSuffix || $[32] !== inlineFixedSuffix || $[33] !== unitPicker || $[34] !== unitValue.draft || $[35] !== unitValue.isInvalid || $[36] !== unitValue.showMixed) {
		t15 = !unitPicker && !inlineFixedSuffix && displayedSuffix && !unitValue.isInvalid && !unitValue.showMixed && unitValue.draft !== "" && unitValue.draft.toLowerCase() !== "auto";
		$[31] = displayedSuffix;
		$[32] = inlineFixedSuffix;
		$[33] = unitPicker;
		$[34] = unitValue.draft;
		$[35] = unitValue.isInvalid;
		$[36] = unitValue.showMixed;
		$[37] = t15;
	} else t15 = $[37];
	const unitSuffix = t15;
	const inputPaddingClass = unitSuffix ? "pl-1 pr-0" : "px-1";
	let t16;
	if ($[38] !== displayedSuffix || $[39] !== unitSuffix) {
		t16 = unitSuffix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex shrink-0 items-center pr-1.5 text-[11px] font-normal text-ed-inspector-chrome",
			children: displayedSuffix
		}) : null;
		$[38] = displayedSuffix;
		$[39] = unitSuffix;
		$[40] = t16;
	} else t16 = $[40];
	const unitSuffixElement = t16;
	let t17;
	if ($[41] !== inputClassName || $[42] !== inputPaddingClass) {
		t17 = cn$2(inputPaddingClass, "truncate", inputClassName);
		$[41] = inputClassName;
		$[42] = inputPaddingClass;
		$[43] = t17;
	} else t17 = $[43];
	const resolvedInputClassName = t17;
	const renderInput = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
		value: unitValue.showMixed ? "" : showInlineFixedSuffix ? `${unitValue.draft}${displayedSuffix}` : idleModeLabel ?? unitValue.draft,
		selectOnFocus: !inlineFixedSuffix && !idleModeLabel,
		onChange: (event) => unitValue.setDraft(event.target.value),
		onFocus: (event_0) => {
			setIsInputFocused(true);
			if (inlineFixedSuffix || idleModeLabel) {
				const input = event_0.currentTarget;
				requestAnimationFrame(() => input.select());
			}
		},
		onBlur: () => {
			setIsInputFocused(false);
			unitValue.commit();
		},
		onKeyDown: onInputKeyDown,
		placeholder: unitValue.showMixed ? "-" : placeholder,
		disabled,
		"aria-label": ariaLabel,
		"aria-invalid": unitValue.isInvalid || void 0,
		tooltip: unitValue.errorMessage ?? tooltipLabel,
		className: resolvedInputClassName
	});
	let t18;
	if ($[44] !== activeMode?.value || $[45] !== allowAuto || $[46] !== allowedUnits || $[47] !== cssProperty || $[48] !== modeOptions || $[49] !== onChange || $[50] !== onUnitMenuOpenChange || $[51] !== tooltipLabel || $[52] !== unitPicker || $[53] !== unitValue.selectUnit || $[54] !== unitValue.selectedUnit) {
		t18 = unitPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitMenu, {
			value: unitValue.selectedUnit,
			onValueChange: unitValue.selectUnit,
			label: cssProperty ?? "Value",
			onOpenChange: (open) => {
				setUnitMenuOpen(open);
				onUnitMenuOpenChange?.(open);
			},
			allowAuto,
			units: allowedUnits,
			modeOptions,
			selectedMode: activeMode?.value,
			onModeChange: onChange,
			showTooltip: Boolean(tooltipLabel)
		});
		$[44] = activeMode?.value;
		$[45] = allowAuto;
		$[46] = allowedUnits;
		$[47] = cssProperty;
		$[48] = modeOptions;
		$[49] = onChange;
		$[50] = onUnitMenuOpenChange;
		$[51] = tooltipLabel;
		$[52] = unitPicker;
		$[53] = unitValue.selectUnit;
		$[54] = unitValue.selectedUnit;
		$[55] = t18;
	} else t18 = $[55];
	let t19;
	if ($[56] !== t18 || $[57] !== unitSuffixElement) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [unitSuffixElement, t18] });
		$[56] = t18;
		$[57] = unitSuffixElement;
		$[58] = t19;
	} else t19 = $[58];
	const unitControl = t19;
	let t20;
	if ($[59] !== scrubPrecision || $[60] !== scrubStep || $[61] !== unitValue.showMixed) {
		t20 = {
			step: scrubStep,
			precision: scrubPrecision,
			mixed: unitValue.showMixed
		};
		$[59] = scrubPrecision;
		$[60] = scrubStep;
		$[61] = unitValue.showMixed;
		$[62] = t20;
	} else t20 = $[62];
	const { scrubRef, isScrubbing, onInputKeyDown: t21 } = useInspectorScrub(unitValue.scrubValue, unitValue.applyScrub, t20);
	const onInputKeyDown = t21;
	const t22 = disabled ? void 0 : scrubRef;
	let t23;
	if ($[63] !== icon || $[64] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: t22,
			children: icon
		});
		$[63] = icon;
		$[64] = t22;
		$[65] = t23;
	} else t23 = $[65];
	let t24;
	if ($[66] !== renderInput) {
		t24 = renderInput();
		$[66] = renderInput;
		$[67] = t24;
	} else t24 = $[67];
	let t25;
	if ($[68] !== hasSuggestions || $[69] !== isPending || $[70] !== onClearOverride || $[71] !== source || $[72] !== sourceClass) {
		t25 = sourceClass && source === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverrideChip, {
			sourceClass,
			onClearOverride,
			className: "max-w-13.5"
		}) : hasSuggestions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
				"aria-label": "Apply class",
				className: "w-0 overflow-hidden px-0 text-ed-inspector-chrome group-hover/inspector-control:w-6 group-hover/inspector-control:px-1 group-focus-within/inspector-control:w-6 group-focus-within/inspector-control:px-1 group-data-[active=true]/inspector-control:w-6 group-data-[active=true]/inspector-control:px-1",
				title: "Apply class",
				children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorClassPickerIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HexDotGlyph, {}) })
			})
		}) : null;
		$[68] = hasSuggestions;
		$[69] = isPending;
		$[70] = onClearOverride;
		$[71] = source;
		$[72] = sourceClass;
		$[73] = t25;
	} else t25 = $[73];
	let t26;
	if ($[74] !== t23 || $[75] !== t24 || $[76] !== t25 || $[77] !== unitControl) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t23,
			t24,
			t25,
			unitControl
		] });
		$[74] = t23;
		$[75] = t24;
		$[76] = t25;
		$[77] = unitControl;
		$[78] = t26;
	} else t26 = $[78];
	const inputControl = t26;
	if (sourceClass && source === "class") {
		let t27;
		if ($[79] !== value) {
			t27 = displayValue(value);
			$[79] = value;
			$[80] = t27;
		} else t27 = $[80];
		let t28;
		if ($[81] !== isPending || $[82] !== sourceClass || $[83] !== t27 || $[84] !== tooltipLabel) {
			t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
				sourceClass,
				fieldTooltip: tooltipLabel,
				value: t27,
				isPending
			});
			$[81] = isPending;
			$[82] = sourceClass;
			$[83] = t27;
			$[84] = tooltipLabel;
			$[85] = t28;
		} else t28 = $[85];
		const classChip = t28;
		let t29;
		if ($[86] !== onClearOverride) {
			t29 = onClearOverride ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassUnlinkAction, { onClear: onClearOverride }) : null;
			$[86] = onClearOverride;
			$[87] = t29;
		} else t29 = $[87];
		const clearAction = t29;
		if (!hasSuggestions) {
			const t30 = isScrubbing || unitMenuOpen;
			const t31 = disabled ? void 0 : scrubRef;
			let t32;
			if ($[88] !== icon || $[89] !== t31) {
				t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
					ref: t31,
					children: icon
				});
				$[88] = icon;
				$[89] = t31;
				$[90] = t32;
			} else t32 = $[90];
			let t33;
			if ($[91] !== classChip || $[92] !== clearAction || $[93] !== t30 || $[94] !== t32) {
				t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
					active: t30,
					children: [
						t32,
						classChip,
						clearAction
					]
				});
				$[91] = classChip;
				$[92] = clearAction;
				$[93] = t30;
				$[94] = t32;
				$[95] = t33;
			} else t33 = $[95];
			return t33;
		}
		const t30 = isScrubbing || showSuggestions || unitMenuOpen;
		const t31 = disabled ? void 0 : scrubRef;
		let t32;
		if ($[96] !== icon || $[97] !== t31) {
			t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
				ref: t31,
				children: icon
			});
			$[96] = icon;
			$[97] = t31;
			$[98] = t32;
		} else t32 = $[98];
		let t33;
		if ($[99] !== classChip) {
			t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
					className: "min-w-0 flex-1 justify-start p-0",
					children: classChip
				})
			});
			$[99] = classChip;
			$[100] = t33;
		} else t33 = $[100];
		let t34;
		if ($[101] !== clearAction || $[102] !== t30 || $[103] !== t32 || $[104] !== t33) {
			t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
					active: t30,
					children: [
						t32,
						t33,
						clearAction
					]
				})
			});
			$[101] = clearAction;
			$[102] = t30;
			$[103] = t32;
			$[104] = t33;
			$[105] = t34;
		} else t34 = $[105];
		let t35;
		if ($[106] !== onSelectClass) {
			t35 = (cls) => onSelectClass?.(cls);
			$[106] = onSelectClass;
			$[107] = t35;
		} else t35 = $[107];
		let t36;
		if ($[108] !== setShowSuggestions) {
			t36 = () => setShowSuggestions(false);
			$[108] = setShowSuggestions;
			$[109] = t36;
		} else t36 = $[109];
		let t37;
		if ($[110] !== allSuggestions || $[111] !== cssProperty || $[112] !== sourceClass || $[113] !== t35 || $[114] !== t36) {
			t37 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
				suggestions: allSuggestions,
				cssProperty,
				sourceClass,
				onSelect: t35,
				onClose: t36
			});
			$[110] = allSuggestions;
			$[111] = cssProperty;
			$[112] = sourceClass;
			$[113] = t35;
			$[114] = t36;
			$[115] = t37;
		} else t37 = $[115];
		let t38;
		if ($[116] !== setShowSuggestions || $[117] !== showSuggestions || $[118] !== t34 || $[119] !== t37) {
			t38 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showSuggestions,
				onOpenChange: setShowSuggestions,
				modal: false,
				children: [t34, t37]
			});
			$[116] = setShowSuggestions;
			$[117] = showSuggestions;
			$[118] = t34;
			$[119] = t37;
			$[120] = t38;
		} else t38 = $[120];
		return t38;
	}
	if (hasSuggestions) {
		const t27 = isScrubbing || showSuggestions || unitMenuOpen;
		const t28 = unitValue.isInvalid || void 0;
		let t29;
		if ($[121] !== inputControl || $[122] !== t27 || $[123] !== t28) {
			t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
				active: t27,
				"aria-invalid": t28,
				children: inputControl
			});
			$[121] = inputControl;
			$[122] = t27;
			$[123] = t28;
			$[124] = t29;
		} else t29 = $[124];
		let t30;
		if ($[125] !== onSelectClass) {
			t30 = (cls_0) => onSelectClass?.(cls_0);
			$[125] = onSelectClass;
			$[126] = t30;
		} else t30 = $[126];
		let t31;
		if ($[127] !== setShowSuggestions) {
			t31 = () => setShowSuggestions(false);
			$[127] = setShowSuggestions;
			$[128] = t31;
		} else t31 = $[128];
		let t32;
		if ($[129] !== allSuggestions || $[130] !== cssProperty || $[131] !== sourceClass || $[132] !== t30 || $[133] !== t31) {
			t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
				suggestions: allSuggestions,
				cssProperty,
				sourceClass,
				onSelect: t30,
				onClose: t31
			});
			$[129] = allSuggestions;
			$[130] = cssProperty;
			$[131] = sourceClass;
			$[132] = t30;
			$[133] = t31;
			$[134] = t32;
		} else t32 = $[134];
		let t33;
		if ($[135] !== setShowSuggestions || $[136] !== showSuggestions || $[137] !== t29 || $[138] !== t32) {
			t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showSuggestions,
				onOpenChange: setShowSuggestions,
				modal: false,
				children: [t29, t32]
			});
			$[135] = setShowSuggestions;
			$[136] = showSuggestions;
			$[137] = t29;
			$[138] = t32;
			$[139] = t33;
		} else t33 = $[139];
		return t33;
	}
	const t27 = isScrubbing || unitMenuOpen;
	const t28 = unitValue.isInvalid || void 0;
	let t29;
	if ($[140] !== inputControl || $[141] !== t27 || $[142] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			active: t27,
			"aria-invalid": t28,
			children: inputControl
		});
		$[140] = inputControl;
		$[141] = t27;
		$[142] = t28;
		$[143] = t29;
	} else t29 = $[143];
	return t29;
}
function _temp$77(option) {
	return option.value;
}

export { LayoutValueInput };
