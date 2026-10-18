// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/ShadowSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { BoxShadowIcon, CaretDownIcon, DropShadowIcon, EyeClosedIcon, EyeIcon, InnerShadowIcon, MinusIcon, PlusIcon, ShadowSoftnessIcon, ShadowSpreadIcon } from "../../../../../../../ui/src/icons.js";
import { Popover, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { COMMENTED_STYLES_KEY, parseCommentedStyles, serializeCommentedStyles } from "../../../../../../../compiler/src/store/commentedStyles.js";
import { IconBtn, InspectorControlAction, InspectorControlShell, InspectorRailRow } from "../primitives.js";
import { InspectorPopoverContent, InspectorPopoverHeader } from "../InspectorPopover.js";
import { InspectorSection } from "./InspectorSection.js";
import { InspectorDropdown } from "../inputs/parts/InspectorDropdown.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { LayoutValueInput } from "../inputs/LayoutValueInput.js";
import { ColorRow } from "../inputs/ColorRow.js";
import { parseShadowValues, replaceFilterFunctions, serializeBoxShadows, serializeShadowValue } from "../../../../utils/effectValues.js";
import { classifyEffect } from "../../../../utils/effects.js";

/** Repeatable shadow rows with a left-side property editor popover. */
var DROP_SHADOW_FUNCTION = /* @__PURE__ */ new Set(["drop-shadow"]);
var SHADOW_TYPES = [
	{
		value: "drop",
		label: "Drop Shadow",
		icon: DropShadowIcon
	},
	{
		value: "box",
		label: "Box Shadow",
		icon: BoxShadowIcon
	},
	{
		value: "inner",
		label: "Inner Shadow",
		icon: InnerShadowIcon
	}
];
var nextShadowRowId = 0;
function allocateShadowRowId() {
	nextShadowRowId += 1;
	return nextShadowRowId;
}
function parseShadowRows(boxShadowValue, filterValue, commentedValue) {
	const values = parseShadowValues(boxShadowValue, filterValue).map((value) => ({
		...value,
		enabled: true
	}));
	const hidden = parseCommentedStyles(commentedValue).filter((entry) => entry.group === "shadow").sort((a, b) => a.index - b.index);
	for (const entry of hidden) {
		const parsed = parseShadowValues(entry.property === "boxShadow" ? entry.value : "", entry.property === "filter" ? entry.value : "")[0];
		if (!parsed) continue;
		values.splice(Math.min(entry.index, values.length), 0, {
			...parsed,
			enabled: false
		});
	}
	return values.map((value) => ({
		...value,
		id: allocateShadowRowId()
	}));
}
function defaultShadow(kind = "drop") {
	if (kind === "drop") return {
		kind,
		x: "0px",
		y: "4px",
		blur: "6px",
		spread: "0px",
		color: "rgb(0 0 0 / 0.15)"
	};
	if (kind === "inner") return {
		kind,
		x: "0px",
		y: "2px",
		blur: "4px",
		spread: "0px",
		color: "rgb(0 0 0 / 0.08)"
	};
	return {
		kind,
		x: "0px",
		y: "4px",
		blur: "6px",
		spread: "-1px",
		color: "rgb(0 0 0 / 0.1)"
	};
}
function ShadowSection() {
	const $ = (0, import_compiler_runtime.c)(16);
	const ops = useStyleOps();
	const shadowClasses = ops.elementClassName.split(/\s+/).filter(Boolean).filter(_temp$61);
	const [openId, setOpenId] = import_react.useState(null);
	const boxShadowValue = ops.sourceProps("boxShadow").source === "class" ? shadowClasses.length > 0 ? ops.get("boxShadow") : "" : ops.getExplicit("boxShadow");
	let t0;
	if ($[0] !== ops) {
		t0 = ops.sourceProps("filter").source === "class" ? ops.get("filter") : ops.getExplicit("filter");
		$[0] = ops;
		$[1] = t0;
	} else t0 = $[1];
	const filterValue = t0;
	let t1;
	if ($[2] !== ops) {
		t1 = ops.getExplicit(COMMENTED_STYLES_KEY);
		$[2] = ops;
		$[3] = t1;
	} else t1 = $[3];
	const commentedValue = t1;
	const sourceKey = `${ops.selectedElementId}\n${boxShadowValue}\n${filterValue}\n${commentedValue}`;
	let t2;
	if ($[4] !== boxShadowValue || $[5] !== commentedValue || $[6] !== filterValue) {
		t2 = () => parseShadowRows(boxShadowValue, filterValue, commentedValue);
		$[4] = boxShadowValue;
		$[5] = commentedValue;
		$[6] = filterValue;
		$[7] = t2;
	} else t2 = $[7];
	const [rows, setRows] = import_react.useState(t2);
	const [rowsSourceKey, setRowsSourceKey] = import_react.useState(sourceKey);
	const [writtenKey, setWrittenKey] = import_react.useState(void 0);
	if (sourceKey !== rowsSourceKey) {
		setRowsSourceKey(sourceKey);
		if (writtenKey === `${boxShadowValue}\n${filterValue}\n${commentedValue}`) setWrittenKey(void 0);
		else {
			setRows(parseShadowRows(boxShadowValue, filterValue, commentedValue));
			setOpenId(null);
		}
	}
	const removeShadowClasses = () => {
		if (shadowClasses.length > 0) ops.removeClass(shadowClasses);
	};
	const write = (nextRows) => {
		const nextBoxShadow = serializeBoxShadows(nextRows.filter(_temp2$41));
		const dropShadows = nextRows.filter(_temp3$29).map(serializeShadowValue);
		const nextFilter = replaceFilterFunctions(filterValue, DROP_SHADOW_FUNCTION, dropShadows);
		const preservedComments = parseCommentedStyles(commentedValue).filter(_temp4$28);
		const shadowComments = nextRows.flatMap(_temp5$25);
		const nextCommented = [...preservedComments, ...shadowComments];
		const nextCommentedValue = nextCommented.length > 0 ? serializeCommentedStyles(nextCommented) : void 0;
		setRows(nextRows);
		setWrittenKey(`${nextBoxShadow}\n${nextFilter}\n${nextCommentedValue ?? ""}`);
		ops.setMultiple({
			boxShadow: nextBoxShadow || void 0,
			filter: nextFilter || void 0,
			[COMMENTED_STYLES_KEY]: nextCommentedValue
		});
		removeShadowClasses();
	};
	const addShadow = () => {
		const row_2 = {
			...defaultShadow(),
			id: allocateShadowRowId(),
			enabled: true
		};
		write([...rows, row_2]);
		setOpenId(row_2.id);
	};
	const patchShadow = (id, patch) => write(rows.map((row_3) => row_3.id === id ? {
		...row_3,
		...patch
	} : row_3));
	const toggleShadow = (id_0) => write(rows.map((row_4) => row_4.id === id_0 ? {
		...row_4,
		enabled: !row_4.enabled
	} : row_4));
	const removeShadow = (id_1) => {
		write(rows.filter((row_5) => row_5.id !== id_1));
		if (openId === id_1) setOpenId(null);
	};
	const addAction = !ops.readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
		label: "Add shadow",
		onClick: addShadow,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
	}) : null;
	const T0 = InspectorSection;
	const t3 = true;
	const t4 = "addable";
	const t5 = "Shadow";
	const t6 = rows.length > 0;
	const t7 = false;
	const t8 = "space-y-2";
	const t9 = rows.map((row_6) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
		action: !ops.readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: `Remove ${SHADOW_TYPES.find((type_0) => type_0.value === row_6.kind)?.label ?? "shadow"}`,
			onClick: () => removeShadow(row_6.id),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {})
		}) : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 grid-cols-[minmax(0,1fr)_26px] gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: row_6.enabled ? void 0 : "opacity-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowRow, {
					value: row_6,
					open: openId === row_6.id,
					onOpenChange: (open) => setOpenId(open ? row_6.id : null),
					onChange: (patch_0) => patchShadow(row_6.id, patch_0),
					readOnly: ops.readOnly
				})
			}), !ops.readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: `${row_6.enabled ? "Hide" : "Show"} ${SHADOW_TYPES.find((type_1) => type_1.value === row_6.kind)?.label ?? "shadow"}`,
				active: !row_6.enabled,
				onClick: () => toggleShadow(row_6.id),
				children: row_6.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeClosedIcon, {})
			})]
		})
	}, row_6.id));
	let t10;
	if ($[8] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t8,
			children: t9
		});
		$[8] = t9;
		$[9] = t10;
	} else t10 = $[9];
	let t11;
	if ($[10] !== T0 || $[11] !== addAction || $[12] !== addShadow || $[13] !== t10 || $[14] !== t6) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			reserveActionRail: t3,
			variant: t4,
			title: t5,
			isSet: t6,
			onAdd: addShadow,
			optimisticOpenOnAdd: t7,
			collapsedAction: addAction,
			action: addAction,
			children: t10
		});
		$[10] = T0;
		$[11] = addAction;
		$[12] = addShadow;
		$[13] = t10;
		$[14] = t6;
		$[15] = t11;
	} else t11 = $[15];
	return t11;
}
function _temp5$25(row_1, index) {
	return row_1.enabled ? [] : [{
		group: "shadow",
		index,
		property: row_1.kind === "drop" ? "filter" : "boxShadow",
		value: serializeShadowValue(row_1)
	}];
}
function _temp4$28(entry) {
	return entry.group !== "shadow";
}
function _temp3$29(row_0) {
	return row_0.enabled && row_0.kind === "drop";
}
function _temp2$41(row) {
	return row.enabled;
}
function _temp$61(className) {
	const type = classifyEffect(className);
	return type === "shadow" || type === "shadow-color";
}
function ShadowRow(t0) {
	const $ = (0, import_compiler_runtime.c)(80);
	const { value, open, onOpenChange, onChange, readOnly } = t0;
	let t1;
	if ($[0] !== value) {
		t1 = SHADOW_TYPES.find((option) => option.value === value.kind);
		$[0] = value;
		$[1] = t1;
	} else t1 = $[1];
	const type = t1;
	const ShadowTypeIcon = type.icon;
	let t2;
	if ($[2] !== ShadowTypeIcon) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowTypeIcon, { className: "size-4 shrink-0 text-ed-inspector-chrome" });
		$[2] = ShadowTypeIcon;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== type.label) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate text-left",
			children: type.label
		});
		$[4] = type.label;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== readOnly) {
		t4 = !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "shrink-0 text-ed-inspector-chrome" });
		$[6] = readOnly;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== t2 || $[9] !== t3 || $[10] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t2,
			t3,
			t4
		] });
		$[8] = t2;
		$[9] = t3;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	const triggerContent = t5;
	if (readOnly) {
		let t6;
		if ($[12] !== triggerContent) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex min-w-0 flex-1 items-center gap-1.5 px-1 text-ed-ui",
				children: triggerContent
			}) });
			$[12] = triggerContent;
			$[13] = t6;
		} else t6 = $[13];
		return t6;
	}
	let t6;
	if ($[14] !== triggerContent) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
				className: "min-w-0 flex-1 justify-start gap-1.5 px-1 text-ed-inspector-value hover:text-ed-inspector-value",
				children: triggerContent
			})
		});
		$[14] = triggerContent;
		$[15] = t6;
	} else t6 = $[15];
	let t7;
	if ($[16] !== open || $[17] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			active: open,
			children: t6
		});
		$[16] = open;
		$[17] = t6;
		$[18] = t7;
	} else t7 = $[18];
	let t8;
	if ($[19] !== onOpenChange) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverHeader, {
			title: "Shadow properties",
			closeLabel: "Close shadow editor",
			onClose: () => onOpenChange(false)
		});
		$[19] = onOpenChange;
		$[20] = t8;
	} else t8 = $[20];
	let t9;
	if ($[21] !== ShadowTypeIcon) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowTypeIcon, { className: "size-4 shrink-0 text-ed-inspector-chrome" });
		$[21] = ShadowTypeIcon;
		$[22] = t9;
	} else t9 = $[22];
	let t10;
	if ($[23] !== type.label) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: type.label
		});
		$[23] = type.label;
		$[24] = t10;
	} else t10 = $[24];
	let t11;
	if ($[25] !== t10 || $[26] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [t9, t10]
		});
		$[25] = t10;
		$[26] = t9;
		$[27] = t11;
	} else t11 = $[27];
	const t12 = value.kind;
	let t13;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = SHADOW_TYPES.map(_temp6$20);
		$[28] = t13;
	} else t13 = $[28];
	let t14;
	if ($[29] !== onChange || $[30] !== value.spread) {
		t14 = (next) => {
			const kind = next;
			onChange({
				kind,
				spread: kind === "drop" ? "0px" : value.spread
			});
		};
		$[29] = onChange;
		$[30] = value.spread;
		$[31] = t14;
	} else t14 = $[31];
	let t15;
	if ($[32] !== t11 || $[33] !== t14 || $[34] !== value.kind) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowField, {
			label: "Type",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
				label: "Shadow type",
				value: t11,
				selectedValue: t12,
				options: t13,
				onValueChange: t14
			})
		});
		$[32] = t11;
		$[33] = t14;
		$[34] = value.kind;
		$[35] = t15;
	} else t15 = $[35];
	let t16;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "flex size-4 items-center justify-center text-[10px] font-medium leading-none",
			children: "X"
		});
		$[36] = t16;
	} else t16 = $[36];
	let t17;
	if ($[37] !== onChange) {
		t17 = (x) => onChange({ x });
		$[37] = onChange;
		$[38] = t17;
	} else t17 = $[38];
	let t18;
	if ($[39] !== t17 || $[40] !== value.x) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowLengthField, {
			label: "X",
			icon: t16,
			value: value.x,
			onChange: t17
		});
		$[39] = t17;
		$[40] = value.x;
		$[41] = t18;
	} else t18 = $[41];
	let t19;
	if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "flex size-4 items-center justify-center text-[10px] font-medium leading-none",
			children: "Y"
		});
		$[42] = t19;
	} else t19 = $[42];
	let t20;
	if ($[43] !== onChange) {
		t20 = (y) => onChange({ y });
		$[43] = onChange;
		$[44] = t20;
	} else t20 = $[44];
	let t21;
	if ($[45] !== t20 || $[46] !== value.y) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowLengthField, {
			label: "Y",
			icon: t19,
			value: value.y,
			onChange: t20
		});
		$[45] = t20;
		$[46] = value.y;
		$[47] = t21;
	} else t21 = $[47];
	let t22;
	if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowSoftnessIcon, {});
		$[48] = t22;
	} else t22 = $[48];
	let t23;
	if ($[49] !== onChange) {
		t23 = (blur) => onChange({ blur });
		$[49] = onChange;
		$[50] = t23;
	} else t23 = $[50];
	let t24;
	if ($[51] !== t23 || $[52] !== value.blur) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowLengthField, {
			label: "Blur",
			icon: t22,
			value: value.blur,
			min: 0,
			onChange: t23
		});
		$[51] = t23;
		$[52] = value.blur;
		$[53] = t24;
	} else t24 = $[53];
	let t25;
	if ($[54] !== onChange || $[55] !== value.kind || $[56] !== value.spread) {
		t25 = value.kind !== "drop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowLengthField, {
			label: "Spread",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowSpreadIcon, {}),
			value: value.spread,
			onChange: (spread) => onChange({ spread })
		});
		$[54] = onChange;
		$[55] = value.kind;
		$[56] = value.spread;
		$[57] = t25;
	} else t25 = $[57];
	let t26;
	if ($[58] !== t18 || $[59] !== t21 || $[60] !== t24 || $[61] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [
				t18,
				t21,
				t24,
				t25
			]
		});
		$[58] = t18;
		$[59] = t21;
		$[60] = t24;
		$[61] = t25;
		$[62] = t26;
	} else t26 = $[62];
	let t27;
	if ($[63] !== onChange) {
		t27 = (color) => onChange({ color });
		$[63] = onChange;
		$[64] = t27;
	} else t27 = $[64];
	let t28;
	if ($[65] !== t27 || $[66] !== value.color) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowField, {
			label: "Color",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
				label: "Shadow color",
				hideLabel: true,
				value: value.color,
				onChange: t27,
				cssProperty: "color"
			})
		});
		$[65] = t27;
		$[66] = value.color;
		$[67] = t28;
	} else t28 = $[67];
	let t29;
	if ($[68] !== t15 || $[69] !== t26 || $[70] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 overflow-y-auto p-1 pt-0",
			children: [
				t15,
				t26,
				t28
			]
		});
		$[68] = t15;
		$[69] = t26;
		$[70] = t28;
		$[71] = t29;
	} else t29 = $[71];
	let t30;
	if ($[72] !== t29 || $[73] !== t8) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverContent, {
			"aria-label": "Shadow properties",
			children: [t8, t29]
		});
		$[72] = t29;
		$[73] = t8;
		$[74] = t30;
	} else t30 = $[74];
	let t31;
	if ($[75] !== onOpenChange || $[76] !== open || $[77] !== t30 || $[78] !== t7) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange,
			modal: false,
			children: [t7, t30]
		});
		$[75] = onOpenChange;
		$[76] = open;
		$[77] = t30;
		$[78] = t7;
		$[79] = t31;
	} else t31 = $[79];
	return t31;
}
function _temp6$20(t0) {
	const { value: value_0, label } = t0;
	return {
		value: value_0,
		label
	};
}
function ShadowLengthField(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { label, icon, value, min, onChange } = t0;
	let t1;
	if ($[0] !== icon || $[1] !== min || $[2] !== onChange || $[3] !== value) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
			icon,
			value,
			onChange,
			placeholder: "0",
			unit: "px",
			min
		});
		$[0] = icon;
		$[1] = min;
		$[2] = onChange;
		$[3] = value;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== label || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowField, {
			label,
			children: t1
		});
		$[5] = label;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function ShadowField(t0) {
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

export { ShadowSection };
