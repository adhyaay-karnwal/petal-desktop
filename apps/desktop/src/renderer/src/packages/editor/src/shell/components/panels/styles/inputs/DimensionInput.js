// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/DimensionInput.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { InspectorControlInput, InspectorControlShell, InspectorScrubHandle } from "../primitives.js";
import { subscribeLiveSize } from "../../../../../shared/state/liveSizeChannel.js";
import { getInspectorUnitNumericValue } from "../../../../utils/unitValue.js";
import { useInspectorScrub } from "./useInspectorScrub.js";
import { UnitMenu } from "./UnitMenu.js";
import { useUnitValue } from "./useUnitValue.js";

/**
* DimensionInput — the Width/Height control. Click the value to type a length;
* the unit trigger switches CSS units and intrinsic/flex sizing modes.
*/
function DimensionInput(t0) {
	const $ = (0, import_compiler_runtime.c)(75);
	const { label, value, onChange, computedValue, isMixedValue: t1, isFill: t2, onFill, fixedPixels: t3, disabled: t4, ariaLabel, min: t5, defaultEditing: t6, onUnitMenuOpenChange, labelClassName, live } = t0;
	const isMixedValue = t1 === void 0 ? false : t1;
	const isFill = t2 === void 0 ? false : t2;
	const fixedPixels = t3 === void 0 ? false : t3;
	const disabled = t4 === void 0 ? false : t4;
	const min = t5 === void 0 ? 0 : t5;
	const [editing, setEditing] = (0, import_react.useState)(t6 === void 0 ? false : t6);
	const [unitMenuOpen, setUnitMenuOpen] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	let t7;
	if ($[0] !== computedValue) {
		t7 = getInspectorUnitNumericValue(computedValue) ?? 100;
		$[0] = computedValue;
		$[1] = t7;
	} else t7 = $[1];
	const fallbackNumericValue = t7;
	let t8;
	if ($[2] !== fixedPixels) {
		t8 = fixedPixels ? ["px"] : void 0;
		$[2] = fixedPixels;
		$[3] = t8;
	} else t8 = $[3];
	let t9;
	if ($[4] !== fixedPixels) {
		t9 = fixedPixels ? [] : ["fit-content"];
		$[4] = fixedPixels;
		$[5] = t9;
	} else t9 = $[5];
	const t10 = !fixedPixels;
	let t11;
	if ($[6] !== fallbackNumericValue || $[7] !== isMixedValue || $[8] !== min || $[9] !== onChange || $[10] !== t10 || $[11] !== t8 || $[12] !== t9 || $[13] !== value) {
		t11 = {
			value,
			onChange,
			isMixedValue,
			min,
			fallbackNumericValue,
			allowedUnits: t8,
			acceptedKeywords: t9,
			allowAuto: t10
		};
		$[6] = fallbackNumericValue;
		$[7] = isMixedValue;
		$[8] = min;
		$[9] = onChange;
		$[10] = t10;
		$[11] = t8;
		$[12] = t9;
		$[13] = value;
		$[14] = t11;
	} else t11 = $[14];
	const unitValue = useUnitValue(t11);
	let t12;
	if ($[15] !== value) {
		t12 = typeof value === "string" && value.endsWith("%");
		$[15] = value;
		$[16] = t12;
	} else t12 = $[16];
	const isPercent = t12;
	let t13;
	if ($[17] !== isFill || $[18] !== isMixedValue || $[19] !== isPercent || $[20] !== value) {
		t13 = () => {
			if (isMixedValue) return "mixed";
			if (isFill) return "fill";
			if (value === "fit-content") return "hug";
			if (value === "auto" || value === "") return "auto";
			if (isPercent) return "percent";
			return "fixed";
		};
		$[17] = isFill;
		$[18] = isMixedValue;
		$[19] = isPercent;
		$[20] = value;
		$[21] = t13;
	} else t13 = $[21];
	const mode = t13();
	let t14;
	if ($[22] !== fixedPixels || $[23] !== onChange || $[24] !== onFill || $[25] !== unitValue) {
		t14 = () => {
			const trimmed = unitValue.draft.trim().toLowerCase();
			if (!fixedPixels && (trimmed === "hug" || trimmed === "fit-content")) onChange("fit-content");
			else if (!fixedPixels && trimmed === "fill" && onFill) onFill();
			else unitValue.commit();
			setEditing(false);
		};
		$[22] = fixedPixels;
		$[23] = onChange;
		$[24] = onFill;
		$[25] = unitValue;
		$[26] = t14;
	} else t14 = $[26];
	const save = t14;
	let t15;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = () => {
			setEditing(true);
			setTimeout(() => inputRef.current?.select(), 0);
		};
		$[27] = t15;
	} else t15 = $[27];
	const startEditing = t15;
	const untypedModeLabel = unitValue.isDirty ? void 0 : mode === "hug" ? "Hug" : mode === "fill" ? "Fill" : void 0;
	let t16;
	if ($[28] !== onChange) {
		t16 = () => onChange("fit-content");
		$[28] = onChange;
		$[29] = t16;
	} else t16 = $[29];
	const setHug = t16;
	let t17;
	if ($[30] !== mode || $[31] !== onChange || $[32] !== unitValue) {
		t17 = (selection) => {
			if (selection === "%" && mode !== "percent") onChange("100%");
			else unitValue.selectUnit(selection);
		};
		$[30] = mode;
		$[31] = onChange;
		$[32] = unitValue;
		$[33] = t17;
	} else t17 = $[33];
	const selectUnit = t17;
	const displayedValue = isMixedValue ? "-" : mode === "auto" ? "Auto" : mode === "hug" ? "Hug" : mode === "fill" ? "Fill" : unitValue.draft;
	const valueRef = (0, import_react.useRef)(null);
	const renderedRef = (0, import_react.useRef)(displayedValue);
	const liveTextRef = (0, import_react.useRef)(live?.text);
	let t18;
	if ($[34] !== displayedValue || $[35] !== live?.text) {
		t18 = () => {
			renderedRef.current = displayedValue;
			liveTextRef.current = live?.text;
		};
		$[34] = displayedValue;
		$[35] = live?.text;
		$[36] = t18;
	} else t18 = $[36];
	(0, import_react.useLayoutEffect)(t18);
	const liveId = live?.elementId;
	let t19;
	let t20;
	if ($[37] !== liveId) {
		t19 = () => {
			if (!liveId) return;
			return subscribeLiveSize((size) => {
				const text = valueRef.current?.firstChild;
				const liveText = liveTextRef.current;
				if (!text || text.nodeType !== Node.TEXT_NODE || !liveText) return;
				text.nodeValue = size?.elementId === liveId ? liveText(size) : renderedRef.current;
			});
		};
		t20 = [liveId];
		$[37] = liveId;
		$[38] = t19;
		$[39] = t20;
	} else {
		t19 = $[38];
		t20 = $[39];
	}
	(0, import_react.useEffect)(t19, t20);
	let t21;
	if ($[40] !== unitValue.showMixed) {
		t21 = { mixed: unitValue.showMixed };
		$[40] = unitValue.showMixed;
		$[41] = t21;
	} else t21 = $[41];
	const { scrubRef, isScrubbing, onInputKeyDown } = useInspectorScrub(unitValue.scrubValue, unitValue.applyScrub, t21);
	const t22 = editing || isScrubbing || unitMenuOpen;
	const t23 = unitValue.isInvalid || void 0;
	const t24 = disabled ? void 0 : scrubRef;
	let t25;
	if ($[42] !== labelClassName) {
		t25 = cn$2("flex size-4 items-center justify-center whitespace-nowrap", labelClassName);
		$[42] = labelClassName;
		$[43] = t25;
	} else t25 = $[43];
	let t26;
	if ($[44] !== label || $[45] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t25,
			children: label
		});
		$[44] = label;
		$[45] = t25;
		$[46] = t26;
	} else t26 = $[46];
	let t27;
	if ($[47] !== t24 || $[48] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: t24,
			"aria-hidden": void 0,
			className: "pl-1 font-normal",
			children: t26
		});
		$[47] = t24;
		$[48] = t26;
		$[49] = t27;
	} else t27 = $[49];
	let t28;
	if ($[50] !== ariaLabel || $[51] !== disabled || $[52] !== displayedValue || $[53] !== editing || $[54] !== isMixedValue || $[55] !== onInputKeyDown || $[56] !== save || $[57] !== unitValue || $[58] !== untypedModeLabel) {
		t28 = editing || unitValue.isInvalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-full min-w-0 flex-1 items-center overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex h-full min-w-0 flex-1 items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
					ref: inputRef,
					"aria-label": ariaLabel,
					disabled,
					value: unitValue.showMixed ? "" : untypedModeLabel ?? unitValue.draft,
					onChange: (event) => {
						setEditing(true);
						unitValue.setDraft(event.target.value);
					},
					onBlur: save,
					onKeyDown: (e) => {
						onInputKeyDown(e);
						if (e.key === "Escape") {
							setEditing(false);
							unitValue.reset();
						}
					},
					placeholder: isMixedValue ? "-" : "Auto",
					"aria-invalid": unitValue.isInvalid || void 0,
					title: unitValue.errorMessage,
					autoFocus: true,
					className: "px-1"
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			ref: valueRef,
			type: "button",
			onClick: startEditing,
			"aria-label": ariaLabel,
			disabled,
			className: cn$2("h-full min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-1 text-left", "text-ed-inspector-value"),
			children: displayedValue
		});
		$[50] = ariaLabel;
		$[51] = disabled;
		$[52] = displayedValue;
		$[53] = editing;
		$[54] = isMixedValue;
		$[55] = onInputKeyDown;
		$[56] = save;
		$[57] = unitValue;
		$[58] = untypedModeLabel;
		$[59] = t28;
	} else t28 = $[59];
	let t29;
	if ($[60] !== fixedPixels || $[61] !== label || $[62] !== mode || $[63] !== onFill || $[64] !== onUnitMenuOpenChange || $[65] !== selectUnit || $[66] !== setHug || $[67] !== unitValue.selectedUnit) {
		t29 = !fixedPixels && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitMenu, {
			value: mode === "auto" ? "auto" : mode === "hug" || mode === "fill" ? null : unitValue.selectedUnit,
			onValueChange: selectUnit,
			label: `${label} dimension`,
			showTooltip: false,
			onOpenChange: (open) => {
				setUnitMenuOpen(open);
				onUnitMenuOpenChange?.(open);
			},
			allowAuto: !fixedPixels,
			units: fixedPixels ? ["px"] : void 0,
			selectedMode: mode === "hug" || mode === "fill" ? mode : void 0,
			modeOptions: fixedPixels ? [] : [{
				value: "hug",
				label: "Hug"
			}, {
				value: "fill",
				label: "Fill",
				disabled: !onFill
			}],
			onModeChange: (nextMode) => {
				if (nextMode === "hug") setHug();
				if (nextMode === "fill") onFill?.();
			}
		});
		$[60] = fixedPixels;
		$[61] = label;
		$[62] = mode;
		$[63] = onFill;
		$[64] = onUnitMenuOpenChange;
		$[65] = selectUnit;
		$[66] = setHug;
		$[67] = unitValue.selectedUnit;
		$[68] = t29;
	} else t29 = $[68];
	let t30;
	if ($[69] !== t22 || $[70] !== t23 || $[71] !== t27 || $[72] !== t28 || $[73] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0 overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
					active: t22,
					"aria-invalid": t23,
					className: "group/dim w-full",
					children: [
						t27,
						t28,
						t29
					]
				})
			})
		});
		$[69] = t22;
		$[70] = t23;
		$[71] = t27;
		$[72] = t28;
		$[73] = t29;
		$[74] = t30;
	} else t30 = $[74];
	return t30;
}

export { DimensionInput };
