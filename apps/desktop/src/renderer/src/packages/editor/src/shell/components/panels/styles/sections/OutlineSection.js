// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/OutlineSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { BorderWidthIcon, OutlineOffsetIcon, OverflowSettingsIcon, PlusIcon } from "../../../../../../../ui/src/icons.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../../../../../../../ui/src/components/DropdownMenu.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { getAllTailwindEffects } from "../../../../../shared/utils/tailwindScale.js";
import { InspectorSection } from "./InspectorSection.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { LayoutValueInput } from "../inputs/LayoutValueInput.js";
import { ColorRow } from "../inputs/ColorRow.js";
import { classifyEffect } from "../../../../utils/effects.js";

/** Standalone Outline section, including migration from legacy ring classes. */
var OUTLINE_PROPERTIES = [
	"outlineWidth",
	"outlineColor",
	"outlineOffset",
	"outlineStyle"
];
var OUTLINE_DEFAULTS = {
	outlineWidth: "2px",
	outlineColor: "#3B82F6",
	outlineOffset: "0px",
	outlineStyle: "solid"
};
var OUTLINE_STYLES = [
	"solid",
	"dotted",
	"dashed"
];
var OUTLINE_LENGTH_UNITS = [
	"px",
	"em",
	"rem",
	"ch"
];
var RING_TYPES = /* @__PURE__ */ new Set([
	"ring",
	"ring-color",
	"ring-offset",
	"ring-offset-color"
]);
function OutlineSection() {
	const $ = (0, import_compiler_runtime.c)(41);
	const ops = useStyleOps();
	let isSet;
	let ringClasses;
	let t0;
	let t1;
	let t2;
	if ($[0] !== ops) {
		ringClasses = ops.elementClassName.split(/\s+/).filter(Boolean).map(_temp$62).filter(_temp2$42);
		isSet = ops.hasAny(...OUTLINE_PROPERTIES) || ringClasses.length > 0;
		const ringValue = (type, fallback) => {
			const ringClass = ringClasses.find((entry_0) => entry_0.type === type);
			if (!ringClass) return fallback;
			return getAllTailwindEffects(type).find((option) => option.className === ringClass.className)?.value ?? fallback;
		};
		t0 = ops.getExplicit("outlineWidth") || ringValue("ring", OUTLINE_DEFAULTS.outlineWidth);
		t1 = ops.getExplicit("outlineColor") || ringValue("ring-color", OUTLINE_DEFAULTS.outlineColor);
		t2 = ops.getExplicit("outlineOffset") || ringValue("ring-offset", OUTLINE_DEFAULTS.outlineOffset);
		$[0] = ops;
		$[1] = isSet;
		$[2] = ringClasses;
		$[3] = t0;
		$[4] = t1;
		$[5] = t2;
	} else {
		isSet = $[1];
		ringClasses = $[2];
		t0 = $[3];
		t1 = $[4];
		t2 = $[5];
	}
	let t3;
	if ($[6] !== ops) {
		t3 = ops.getExplicit("outlineStyle") || OUTLINE_DEFAULTS.outlineStyle;
		$[6] = ops;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== t0 || $[9] !== t1 || $[10] !== t2 || $[11] !== t3) {
		t4 = {
			outlineWidth: t0,
			outlineColor: t1,
			outlineOffset: t2,
			outlineStyle: t3
		};
		$[8] = t0;
		$[9] = t1;
		$[10] = t2;
		$[11] = t3;
		$[12] = t4;
	} else t4 = $[12];
	const current = t4;
	let t5;
	if ($[13] !== ops || $[14] !== ringClasses) {
		t5 = () => {
			if (ringClasses.length > 0) ops.removeClass(ringClasses.map(_temp3$30));
		};
		$[13] = ops;
		$[14] = ringClasses;
		$[15] = t5;
	} else t5 = $[15];
	const removeRingClasses = t5;
	let t6;
	if ($[16] !== current || $[17] !== ops || $[18] !== removeRingClasses) {
		t6 = (patch) => {
			ops.setMultiple({
				...current,
				...patch
			});
			removeRingClasses();
		};
		$[16] = current;
		$[17] = ops;
		$[18] = removeRingClasses;
		$[19] = t6;
	} else t6 = $[19];
	const write = t6;
	let t7;
	if ($[20] !== ops || $[21] !== removeRingClasses) {
		t7 = () => {
			ops.setMultiple(OUTLINE_DEFAULTS);
			removeRingClasses();
		};
		$[20] = ops;
		$[21] = removeRingClasses;
		$[22] = t7;
	} else t7 = $[22];
	const addOutline = t7;
	let t8;
	if ($[23] !== ops || $[24] !== removeRingClasses) {
		t8 = () => {
			ops.clear(...OUTLINE_PROPERTIES);
			removeRingClasses();
		};
		$[23] = ops;
		$[24] = removeRingClasses;
		$[25] = t8;
	} else t8 = $[25];
	const removeOutline = t8;
	let t9;
	if ($[26] !== addOutline || $[27] !== isSet || $[28] !== ops.readOnly) {
		t9 = !ops.readOnly && !isSet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Add outline",
			onClick: addOutline,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
		}) : null;
		$[26] = addOutline;
		$[27] = isSet;
		$[28] = ops.readOnly;
		$[29] = t9;
	} else t9 = $[29];
	const addAction = t9;
	const t10 = ops.readOnly ? void 0 : removeOutline;
	let t11;
	if ($[30] !== current || $[31] !== isSet || $[32] !== ops.readOnly || $[33] !== write) {
		t11 = isSet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: !ops.readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineStyleMenu, {
				value: current.outlineStyle,
				onChange: (outlineStyle) => write({ outlineStyle })
			}) : null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineField, {
						label: "Width",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderWidthIcon, {}),
							value: current.outlineWidth,
							onChange: (outlineWidth) => write({ outlineWidth }),
							placeholder: "2",
							unit: "px",
							allowedUnits: OUTLINE_LENGTH_UNITS,
							min: 0
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineField, {
						label: "Offset",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineOffsetIcon, {}),
							value: current.outlineOffset,
							onChange: (outlineOffset) => write({ outlineOffset }),
							placeholder: "0",
							unit: "px",
							allowedUnits: OUTLINE_LENGTH_UNITS
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineField, {
					label: "Color",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
						label: "Outline color",
						hideLabel: true,
						value: current.outlineColor,
						onChange: (outlineColor) => write({ outlineColor }),
						cssProperty: "outlineColor"
					})
				})]
			})
		});
		$[30] = current;
		$[31] = isSet;
		$[32] = ops.readOnly;
		$[33] = write;
		$[34] = t11;
	} else t11 = $[34];
	let t12;
	if ($[35] !== addAction || $[36] !== addOutline || $[37] !== isSet || $[38] !== t10 || $[39] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			variant: "addable",
			title: "Outline",
			isSet,
			onAdd: addOutline,
			onRemove: t10,
			optimisticOpenOnAdd: false,
			collapsedAction: addAction,
			children: t11
		});
		$[35] = addAction;
		$[36] = addOutline;
		$[37] = isSet;
		$[38] = t10;
		$[39] = t11;
		$[40] = t12;
	} else t12 = $[40];
	return t12;
}
function _temp3$30(entry_1) {
	return entry_1.className;
}
function _temp2$42(entry) {
	return entry.type !== null && RING_TYPES.has(entry.type);
}
function _temp$62(className) {
	return {
		className,
		type: classifyEffect(className)
	};
}
function OutlineStyleMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { value, onChange } = t0;
	const triggerRef = import_react.useRef(null);
	const t1 = `Outline style: ${value}`;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {});
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				ref: triggerRef,
				label: t1,
				children: t2
			})
		});
		$[1] = t1;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (event) => {
			event.preventDefault();
			triggerRef.current?.blur();
		};
		$[3] = t4;
	} else t4 = $[3];
	let t5;
	if ($[4] !== onChange || $[5] !== value) {
		t5 = OUTLINE_STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			checked: style === value,
			onCheckedChange: (checked) => checked && onChange(style),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "capitalize",
				children: style
			})
		}, style));
		$[4] = onChange;
		$[5] = value;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "end",
			className: "min-w-[120px]",
			onCloseAutoFocus: t4,
			children: t5
		});
		$[7] = t5;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t3 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t3, t6]
		});
		$[9] = t3;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	return t7;
}
function OutlineField(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { label, children } = t0;
	let t1;
	if ($[0] !== children || $[1] !== label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "group",
			"aria-label": label,
			className: "min-w-0",
			children
		});
		$[0] = children;
		$[1] = label;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}

export { OutlineSection };
