// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/fields/layout.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { OpacityIcon, PositionBottomIcon, PositionLeftIcon, PositionRightIcon, PositionTopIcon } from "../../../../../../../ui/src/icons.js";
import { styleFieldLabel } from "../primitives.js";
import { IS_MAC } from "../../../../../shared/utils/platform.js";
import { DimensionInput } from "../inputs/DimensionInput.js";
import { useStyleField, useStyleOps } from "../StyleOpsContext.js";
import { opacityInputValue } from "../../../../utils/cssValue.js";
import { LayoutValueInput } from "../inputs/LayoutValueInput.js";
import { LayoutMinMaxInput } from "../inputs/LayoutMinMaxInput.js";
import { PositionOffsetField } from "../positioning/widgets.js";

/**
* Layout / sizing fields bound to the StyleOps context: generic length inputs,
* Width/Height (with aspect-ratio mirroring, min/max add buttons and the flex
* toggle), opacity, min/max length, and T/L/R/B position offsets.
*/
function StyleLayoutInput(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { property, icon, placeholder: t1, unit, allowedUnits, onChange, inputClassName, showTooltip: t2, modeOptions, linkedProperty } = t0;
	const placeholder = t1 === void 0 ? "0" : t1;
	const showTooltip = t2 === void 0 ? true : t2;
	const f = useStyleField(property);
	const paired = useStyleField(linkedProperty ?? property);
	const isMixed = f.isMixed || linkedProperty !== void 0 && (paired.isMixed || f.value !== paired.value);
	const t3 = isMixed ? "" : f.value;
	const t4 = onChange ?? f.set;
	let t5;
	if ($[0] !== f.source || $[1] !== isMixed) {
		t5 = isMixed ? {} : f.source;
		$[0] = f.source;
		$[1] = isMixed;
		$[2] = t5;
	} else t5 = $[2];
	let t6;
	if ($[3] !== property) {
		t6 = styleFieldLabel(property);
		$[3] = property;
		$[4] = t6;
	} else t6 = $[4];
	let t7;
	if ($[5] !== property || $[6] !== showTooltip) {
		t7 = showTooltip ? styleFieldLabel(property) : void 0;
		$[5] = property;
		$[6] = showTooltip;
		$[7] = t7;
	} else t7 = $[7];
	let t8;
	if ($[8] !== allowedUnits || $[9] !== f.addClass || $[10] !== icon || $[11] !== inputClassName || $[12] !== isMixed || $[13] !== modeOptions || $[14] !== placeholder || $[15] !== property || $[16] !== t3 || $[17] !== t4 || $[18] !== t5 || $[19] !== t6 || $[20] !== t7 || $[21] !== unit) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
			icon,
			value: t3,
			onChange: t4,
			placeholder,
			unit,
			allowedUnits,
			inputClassName,
			modeOptions,
			isMixedValue: isMixed,
			...t5,
			ariaLabel: t6,
			cssProperty: property,
			tooltipLabel: t7,
			onSelectClass: f.addClass
		});
		$[8] = allowedUnits;
		$[9] = f.addClass;
		$[10] = icon;
		$[11] = inputClassName;
		$[12] = isMixed;
		$[13] = modeOptions;
		$[14] = placeholder;
		$[15] = property;
		$[16] = t3;
		$[17] = t4;
		$[18] = t5;
		$[19] = t6;
		$[20] = t7;
		$[21] = unit;
		$[22] = t8;
	} else t8 = $[22];
	return t8;
}
var FLEX_FILL_VALUES = /* @__PURE__ */ new Set([
	"1",
	"1 1 0%",
	"1 1 auto"
]);
/**
* How Fill is written for one axis, given the parent's layout. The flex main
* axis grows (`flex: 1`); the flex cross axis and both grid axes stretch
* (`align-self` / `justify-self`), which only applies at an auto size.
*/
function fillStyleFor(property, parentLayout) {
	if (!parentLayout) return null;
	if (parentLayout === (property === "width" ? "row" : "column")) return {
		property: "flex",
		value: "1"
	};
	if (parentLayout === "grid" && property === "width") return {
		property: "justifySelf",
		value: "stretch"
	};
	return {
		property: "alignSelf",
		value: "stretch"
	};
}
/** One axis's Fill: how to apply it, whether it's on, and how a manual size clears it. */
function axisFill(ops, property) {
	const fill = fillStyleFor(property, ops.parentLayout);
	const fillValue = fill ? ops.get(fill.property) : "";
	const isFill = fill?.property === "flex" ? FLEX_FILL_VALUES.has(fillValue) : fillValue === "stretch" && ["", "auto"].includes(ops.getExplicit(property));
	const fillProperty = fill?.property ?? "flex";
	return {
		fill,
		isFill,
		clearFill: ops.has(fillProperty) && (fillProperty === "flex" || fillValue === "stretch") ? { [fillProperty]: void 0 } : {}
	};
}
/**
* Figma's Cmd/Ctrl+click merge for a group of related fields (padding sides,
* corners, width/height). Cmd+clicking any field swaps the group for one input
* that writes every property; once focus leaves it, the separate fields come
* back holding the shared value. Plain clicks pass straight through.
* The merged field is a plain length input unless `field` supplies one.
*/
function MergeableFields(t0) {
	const $ = (0, import_compiler_runtime.c)(47);
	const { properties, icon, label, onChange, field: Field, className, children } = t0;
	const ops = useStyleOps();
	const [merged, setMerged] = import_react.useState(false);
	const containerRef = import_react.useRef(null);
	const exitFrame = import_react.useRef(0);
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => () => cancelAnimationFrame(exitFrame.current);
		t2 = [];
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	import_react.useEffect(t1, t2);
	let t3;
	let t4;
	if ($[2] !== merged) {
		t3 = () => {
			if (merged) containerRef.current?.querySelector("input")?.focus();
		};
		t4 = [merged];
		$[2] = merged;
		$[3] = t3;
		$[4] = t4;
	} else {
		t3 = $[3];
		t4 = $[4];
	}
	import_react.useEffect(t3, t4);
	if (!merged) {
		let t5;
		if ($[5] !== ops.readOnly) {
			t5 = (event) => !ops.readOnly && (IS_MAC ? event.metaKey : event.ctrlKey) && event.button === 0;
			$[5] = ops.readOnly;
			$[6] = t5;
		} else t5 = $[6];
		const isMergeClick = t5;
		let t6;
		let t7;
		let t8;
		if ($[7] !== isMergeClick) {
			t6 = (event_0) => {
				if (isMergeClick(event_0)) event_0.stopPropagation();
			};
			t7 = (event_1) => {
				if (!isMergeClick(event_1)) return;
				event_1.preventDefault();
				event_1.stopPropagation();
			};
			t8 = (event_2) => {
				if (!isMergeClick(event_2)) return;
				event_2.preventDefault();
				event_2.stopPropagation();
				const focused = document.activeElement;
				if (focused instanceof HTMLElement && event_2.currentTarget.contains(focused)) focused.blur();
				setMerged(true);
			};
			$[7] = isMergeClick;
			$[8] = t6;
			$[9] = t7;
			$[10] = t8;
		} else {
			t6 = $[8];
			t7 = $[9];
			t8 = $[10];
		}
		let t9;
		if ($[11] !== children || $[12] !== className || $[13] !== t6 || $[14] !== t7 || $[15] !== t8) {
			t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className,
				onPointerDownCapture: t6,
				onMouseDownCapture: t7,
				onClickCapture: t8,
				children
			});
			$[11] = children;
			$[12] = className;
			$[13] = t6;
			$[14] = t7;
			$[15] = t8;
			$[16] = t9;
		} else t9 = $[16];
		return t9;
	}
	let t5;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => {
			exitFrame.current = requestAnimationFrame(() => setMerged(false));
		};
		$[17] = t5;
	} else t5 = $[17];
	const exitSoon = t5;
	let first;
	let t6;
	let value;
	if ($[18] !== ops || $[19] !== properties) {
		const [t7, ...rest] = properties;
		first = t7;
		let t8;
		if ($[23] !== first || $[24] !== ops) {
			t8 = ops.get(first);
			$[23] = first;
			$[24] = ops;
			$[25] = t8;
		} else t8 = $[25];
		value = t8;
		t6 = properties.some(ops.getIsMixed) || rest.some((property) => ops.get(property) !== value);
		$[18] = ops;
		$[19] = properties;
		$[20] = first;
		$[21] = t6;
		$[22] = value;
	} else {
		first = $[20];
		t6 = $[21];
		value = $[22];
	}
	const isMixed = t6;
	const t7 = isMixed ? "" : value;
	let t8;
	if ($[26] !== onChange || $[27] !== ops || $[28] !== properties) {
		t8 = onChange ?? ((v) => ops.setMultiple(Object.fromEntries(properties.map((property_0) => [property_0, v]))));
		$[26] = onChange;
		$[27] = ops;
		$[28] = properties;
		$[29] = t8;
	} else t8 = $[29];
	let t9;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = (open) => {
			if (!open) exitSoon();
		};
		$[30] = t9;
	} else t9 = $[30];
	let t10;
	if ($[31] !== isMixed || $[32] !== t7 || $[33] !== t8) {
		t10 = {
			value: t7,
			isMixed,
			onChange: t8,
			onUnitMenuOpenChange: t9
		};
		$[31] = isMixed;
		$[32] = t7;
		$[33] = t8;
		$[34] = t10;
	} else t10 = $[34];
	const field = t10;
	let t11;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = () => cancelAnimationFrame(exitFrame.current);
		$[35] = t11;
	} else t11 = $[35];
	let t12;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = (event_3) => {
			if (event_3.key === "Escape") exitSoon();
		};
		$[36] = t12;
	} else t12 = $[36];
	let t13;
	if ($[37] !== Field || $[38] !== field || $[39] !== first || $[40] !== icon || $[41] !== isMixed || $[42] !== label) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "col-span-full min-w-0",
			children: Field ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { ...field }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
				icon,
				value: field.value,
				onChange: field.onChange,
				isMixedValue: isMixed,
				ariaLabel: label,
				cssProperty: first,
				onUnitMenuOpenChange: field.onUnitMenuOpenChange
			})
		});
		$[37] = Field;
		$[38] = field;
		$[39] = first;
		$[40] = icon;
		$[41] = isMixed;
		$[42] = label;
		$[43] = t13;
	} else t13 = $[43];
	let t14;
	if ($[44] !== className || $[45] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			className,
			onFocus: t11,
			onBlur: exitSoon,
			onKeyDown: t12,
			children: t13
		});
		$[44] = className;
		$[45] = t13;
		$[46] = t14;
	} else t14 = $[46];
	return t14;
}
/** The merged W+H field: the real dimension input, so Hug, Auto and Fill still apply. */
function MergedDimensionInput(field) {
	const $ = (0, import_compiler_runtime.c)(20);
	const ops = useStyleOps();
	let t0;
	if ($[0] !== ops) {
		t0 = axisFill(ops, "width");
		$[0] = ops;
		$[1] = t0;
	} else t0 = $[1];
	const width = t0;
	let t1;
	if ($[2] !== ops) {
		t1 = axisFill(ops, "height");
		$[2] = ops;
		$[3] = t1;
	} else t1 = $[3];
	const height = t1;
	const widthFill = width.fill;
	const heightFill = height.fill;
	let t2;
	if ($[4] !== height.clearFill || $[5] !== ops || $[6] !== width.clearFill) {
		t2 = (v) => ops.setMultiple({
			width: v,
			height: v,
			...width.clearFill,
			...height.clearFill
		});
		$[4] = height.clearFill;
		$[5] = ops;
		$[6] = width.clearFill;
		$[7] = t2;
	} else t2 = $[7];
	const t3 = width.isFill && height.isFill;
	let t4;
	if ($[8] !== heightFill || $[9] !== ops || $[10] !== widthFill) {
		t4 = widthFill && heightFill ? () => ops.setMultiple({
			[widthFill.property]: widthFill.value,
			[heightFill.property]: heightFill.value,
			width: "auto",
			height: "auto"
		}) : void 0;
		$[8] = heightFill;
		$[9] = ops;
		$[10] = widthFill;
		$[11] = t4;
	} else t4 = $[11];
	const t5 = ops.computed.width;
	let t6;
	if ($[12] !== field.isMixed || $[13] !== field.onUnitMenuOpenChange || $[14] !== field.value || $[15] !== t2 || $[16] !== t3 || $[17] !== t4 || $[18] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label: "WH",
			labelClassName: "text-[10px]",
			ariaLabel: "Width and height",
			value: field.value,
			isMixedValue: field.isMixed,
			onChange: t2,
			isFill: t3,
			onFill: t4,
			onUnitMenuOpenChange: field.onUnitMenuOpenChange,
			computedValue: t5,
			defaultEditing: true
		});
		$[12] = field.isMixed;
		$[13] = field.onUnitMenuOpenChange;
		$[14] = field.value;
		$[15] = t2;
		$[16] = t3;
		$[17] = t4;
		$[18] = t5;
		$[19] = t6;
	} else t6 = $[19];
	return t6;
}
/**
* DimensionInput (Width / Height) bound to the StyleOps context.
* Handles aspect-ratio mirroring, "clear fill on manual size", and Fill
* sizing for flex and grid children — all derived from the context.
*/
function StyleDimensionInput(t0) {
	const $ = (0, import_compiler_runtime.c)(27);
	const { label, property, aspectLocked } = t0;
	const ops = useStyleOps();
	const f = useStyleField(property);
	const mirror = property === "width" ? "height" : "width";
	let t1;
	if ($[0] !== ops || $[1] !== property) {
		t1 = axisFill(ops, property);
		$[0] = ops;
		$[1] = property;
		$[2] = t1;
	} else t1 = $[2];
	const { fill, isFill, clearFill } = t1;
	let t2;
	if ($[3] !== aspectLocked || $[4] !== clearFill || $[5] !== mirror || $[6] !== ops || $[7] !== property) {
		t2 = (v) => {
			const updates = {
				[property]: v,
				...clearFill
			};
			if (aspectLocked && ops.computed[property] && ops.computed[mirror]) {
				const ratio = parseFloat(ops.computed[mirror]) / parseFloat(ops.computed[property]);
				const numV = parseFloat(v);
				if (!isNaN(ratio) && !isNaN(numV) && v.endsWith("px")) updates[mirror] = Math.round(numV * ratio) + "px";
			}
			ops.setMultiple(updates);
		};
		$[3] = aspectLocked;
		$[4] = clearFill;
		$[5] = mirror;
		$[6] = ops;
		$[7] = property;
		$[8] = t2;
	} else t2 = $[8];
	const onChange = t2;
	const t3 = f.isMixed ? "" : f.value;
	const t4 = ops.computed[property];
	let t5;
	if ($[9] !== fill || $[10] !== ops || $[11] !== property) {
		t5 = fill ? () => ops.setMultiple({
			[fill.property]: fill.value,
			[property]: "auto"
		}) : void 0;
		$[9] = fill;
		$[10] = ops;
		$[11] = property;
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] !== property) {
		t6 = (size) => String(size[property]);
		$[13] = property;
		$[14] = t6;
	} else t6 = $[14];
	let t7;
	if ($[15] !== ops.selectedElementId || $[16] !== t6) {
		t7 = {
			elementId: ops.selectedElementId,
			text: t6
		};
		$[15] = ops.selectedElementId;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== f.isMixed || $[19] !== isFill || $[20] !== label || $[21] !== onChange || $[22] !== t3 || $[23] !== t4 || $[24] !== t5 || $[25] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label,
			value: t3,
			onChange,
			computedValue: t4,
			isMixedValue: f.isMixed,
			isFill,
			onFill: t5,
			live: t7
		});
		$[18] = f.isMixed;
		$[19] = isFill;
		$[20] = label;
		$[21] = onChange;
		$[22] = t3;
		$[23] = t4;
		$[24] = t5;
		$[25] = t7;
		$[26] = t8;
	} else t8 = $[26];
	return t8;
}
/**
* Opacity input — same shape as StyleLayoutInput but applies the
* `opacityInputValue` transform (CSS opacity is a 0–1 number; UI shows `%`).
*/
function StyleOpacityInput() {
	const $ = (0, import_compiler_runtime.c)(10);
	const f = useStyleField("opacity");
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpacityIcon, { className: "text-ed-muted-foreground" });
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] !== f.isMixed || $[2] !== f.value) {
		t1 = f.isMixed ? "" : opacityInputValue(f.value);
		$[1] = f.isMixed;
		$[2] = f.value;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== f.addClass || $[5] !== f.isMixed || $[6] !== f.set || $[7] !== f.source || $[8] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
			icon: t0,
			value: t1,
			onChange: f.set,
			placeholder: "100",
			unit: "%",
			min: 0,
			max: 100,
			isMixedValue: f.isMixed,
			...f.source,
			cssProperty: "opacity",
			tooltipLabel: "Opacity",
			onSelectClass: f.addClass
		});
		$[4] = f.addClass;
		$[5] = f.isMixed;
		$[6] = f.set;
		$[7] = f.source;
		$[8] = t1;
		$[9] = t2;
	} else t2 = $[9];
	return t2;
}
function StyleLayoutMinMaxInput(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { property, icon, placeholder } = t0;
	const f = useStyleField(property);
	let t1;
	if ($[0] !== property) {
		t1 = styleFieldLabel(property);
		$[0] = property;
		$[1] = t1;
	} else t1 = $[1];
	const t2 = f.isMixed ? "" : f.value;
	let t3;
	if ($[2] !== f.clear || $[3] !== f.isMixed || $[4] !== f.set || $[5] !== icon || $[6] !== placeholder || $[7] !== property || $[8] !== t1 || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutMinMaxInput, {
			label: property,
			tooltipLabel: t1,
			value: t2,
			onChange: f.set,
			onClear: f.clear,
			placeholder,
			icon,
			isMixedValue: f.isMixed
		});
		$[2] = f.clear;
		$[3] = f.isMixed;
		$[4] = f.set;
		$[5] = icon;
		$[6] = placeholder;
		$[7] = property;
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
/** PositionOffsetField (T/L/R/B) bound to a CSS property via the StyleOps context. */
function StylePositionOffset(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { label, property, className } = t0;
	const f = useStyleField(property);
	let t1;
	if ($[0] !== property) {
		t1 = property === "left" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionLeftIcon, {}) : property === "right" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionRightIcon, {}) : property === "top" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionTopIcon, {}) : property === "bottom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionBottomIcon, {}) : void 0;
		$[0] = property;
		$[1] = t1;
	} else t1 = $[1];
	const icon = t1;
	let t2;
	if ($[2] !== property) {
		t2 = styleFieldLabel(property);
		$[2] = property;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== className || $[5] !== f.explicit || $[6] !== f.isMixed || $[7] !== f.set || $[8] !== icon || $[9] !== label || $[10] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionOffsetField, {
			label,
			tooltipLabel: t2,
			icon,
			value: f.explicit,
			isMixed: f.isMixed,
			onChange: f.set,
			className
		});
		$[4] = className;
		$[5] = f.explicit;
		$[6] = f.isMixed;
		$[7] = f.set;
		$[8] = icon;
		$[9] = label;
		$[10] = t2;
		$[11] = t3;
	} else t3 = $[11];
	return t3;
}

export { MergeableFields, MergedDimensionInput, StyleDimensionInput, StyleLayoutInput, StyleLayoutMinMaxInput, StyleOpacityInput, StylePositionOffset };
