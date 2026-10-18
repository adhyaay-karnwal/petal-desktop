// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/fields/controls.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { styleFieldLabel } from "../primitives.js";
import { useStyleField } from "../StyleOpsContext.js";
import { InspectorToggleGroup } from "../InspectorToggleGroup.js";
import { InlineInput } from "../inputs/InlineInput.js";

/**
* Generic context-bound controls + section layout primitives: a plain length/
* text input, a boolean checkbox, a toggle-group field, and the
* label-above-control field cell + side-by-side row used to compose sections.
*/
function StyleInlineInput(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { property, label, icon, placeholder, unit, showUnit, unitPicker, preserveUnitless, min, className, mode: t1 } = t0;
	const mode = t1 === void 0 ? "explicit" : t1;
	const f = useStyleField(property);
	const displayValue = f.isMixed ? "" : mode === "resolved" ? f.value : f.explicit;
	const t2 = f.set;
	const t3 = placeholder ?? f.computed;
	const t4 = f.isMixed;
	const t5 = f.source;
	let t6;
	if ($[0] !== property) {
		t6 = styleFieldLabel(property);
		$[0] = property;
		$[1] = t6;
	} else t6 = $[1];
	let t7;
	if ($[2] !== className || $[3] !== displayValue || $[4] !== f.addClass || $[5] !== f.isMixed || $[6] !== f.set || $[7] !== f.source || $[8] !== icon || $[9] !== label || $[10] !== min || $[11] !== preserveUnitless || $[12] !== property || $[13] !== showUnit || $[14] !== t3 || $[15] !== t6 || $[16] !== unit || $[17] !== unitPicker) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineInput, {
			label,
			icon,
			value: displayValue,
			onChange: t2,
			placeholder: t3,
			isMixedValue: t4,
			unit,
			showUnit,
			unitPicker,
			preserveUnitless,
			min,
			className,
			...t5,
			cssProperty: property,
			tooltipLabel: t6,
			onSelectClass: f.addClass
		});
		$[2] = className;
		$[3] = displayValue;
		$[4] = f.addClass;
		$[5] = f.isMixed;
		$[6] = f.set;
		$[7] = f.source;
		$[8] = icon;
		$[9] = label;
		$[10] = min;
		$[11] = preserveUnitless;
		$[12] = property;
		$[13] = showUnit;
		$[14] = t3;
		$[15] = t6;
		$[16] = unit;
		$[17] = unitPicker;
		$[18] = t7;
	} else t7 = $[18];
	return t7;
}
/**
* Inspector toggle group bound to a CSS property — used for textAlign,
* alignItems, etc. Each option maps a selected value to the CSS string to set.
*/
function StyleToggleGroupField(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { property, label, options, defaultValue } = t0;
	const f = useStyleField(property);
	const raw = f.isMixed ? "" : f.value;
	let t1;
	if ($[0] !== defaultValue || $[1] !== options || $[2] !== raw) {
		t1 = options.find((o) => o.value === raw || o.aliases?.includes(raw))?.value ?? defaultValue ?? "";
		$[0] = defaultValue;
		$[1] = options;
		$[2] = raw;
		$[3] = t1;
	} else t1 = $[3];
	const active = t1;
	const t2 = f.set;
	let t3;
	if ($[4] !== options) {
		t3 = options.map(_temp$65);
		$[4] = options;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== active || $[7] !== f.set || $[8] !== label || $[9] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorToggleGroup, {
			"aria-label": label,
			value: active,
			onValueChange: t2,
			options: t3
		});
		$[6] = active;
		$[7] = f.set;
		$[8] = label;
		$[9] = t3;
		$[10] = t4;
	} else t4 = $[10];
	return t4;
}
/** A field cell with an accessible name but no visible label. */
function _temp$65(option) {
	return {
		value: option.value,
		label: option.label,
		content: option.icon,
		tooltip: option.label
	};
}
function StyleSectionField(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { label, children } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = { flex: 1 };
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== children || $[2] !== label) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "group",
			"aria-label": label,
			className: "flex min-w-0 flex-col",
			style: t1,
			children
		});
		$[1] = children;
		$[2] = label;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
}
/** A side-by-side row of section fields. */
function StyleSectionRow(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-row gap-2",
			children
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}

export { StyleInlineInput, StyleSectionField, StyleSectionRow, StyleToggleGroupField };
