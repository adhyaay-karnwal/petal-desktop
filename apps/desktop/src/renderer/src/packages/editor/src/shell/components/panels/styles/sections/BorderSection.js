// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/BorderSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { AddVariableIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, BorderWidthIcon, MinusIcon, OverflowSettingsIcon, PlusIcon } from "../../../../../../../ui/src/icons.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../../../../../../../ui/src/components/DropdownMenu.js";
import { Popover, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { BORDER_TAILWIND_CATEGORIES, removeBorderSideClasses } from "../../../../../shared/utils/tailwindScale.js";
import { ClassPickerPopover } from "../inputs/parts/ClassPickerPopover.js";
import { InspectorSection } from "./InspectorSection.js";
import { InspectorDropdown } from "../inputs/parts/InspectorDropdown.js";
import { BORDER_KEYS, BORDER_STYLES } from "../../../../constants.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { useClassesForProperty } from "../../../../hooks/useClassSuggestions.js";
import { StyleLayoutInput } from "../fields/layout.js";
import { StyleColorInput } from "../fields/color.js";

/**
* Border section — up to four independently colored/sized border sides. The
* first border targets every side; adding another converts it to Top + Bottom,
* followed by Left and Right. A shared style selector applies to every defined
* border.
*/
var BORDER_WIDTH_UNITS = [
	"px",
	"em",
	"rem",
	"ch"
];
var SIDE_ORDER = [
	"top",
	"bottom",
	"left",
	"right"
];
var SIDE_OPTIONS = [
	{
		value: "all",
		label: "All",
		icon: BorderAllIcon
	},
	{
		value: "top",
		label: "Top",
		icon: BorderTopIcon
	},
	{
		value: "bottom",
		label: "Bottom",
		icon: BorderBottomIcon
	},
	{
		value: "left",
		label: "Left",
		icon: BorderLeftIcon
	},
	{
		value: "right",
		label: "Right",
		icon: BorderRightIcon
	}
];
var SIDE_PROPS = {
	all: {
		width: "borderWidth",
		color: "borderColor",
		style: "borderStyle",
		shorthand: "border"
	},
	top: {
		width: "borderTopWidth",
		color: "borderTopColor",
		style: "borderTopStyle",
		shorthand: "borderTop"
	},
	bottom: {
		width: "borderBottomWidth",
		color: "borderBottomColor",
		style: "borderBottomStyle",
		shorthand: "borderBottom"
	},
	left: {
		width: "borderLeftWidth",
		color: "borderLeftColor",
		style: "borderLeftStyle",
		shorthand: "borderLeft"
	},
	right: {
		width: "borderRightWidth",
		color: "borderRightColor",
		style: "borderRightStyle",
		shorthand: "borderRight"
	}
};
function BorderSideSelect(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { side, usedSides, onChange } = t0;
	let t1;
	if ($[0] !== side) {
		t1 = SIDE_OPTIONS.find((option) => option.value === side);
		$[0] = side;
		$[1] = t1;
	} else t1 = $[1];
	const current = t1;
	const CurrentIcon = current.icon;
	let t2;
	if ($[2] !== CurrentIcon) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrentIcon, { className: "shrink-0 text-ed-inspector-chrome" });
		$[2] = CurrentIcon;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== current.label) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: current.label
		});
		$[4] = current.label;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t2 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [t2, t3]
		});
		$[6] = t2;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== side || $[10] !== usedSides) {
		t5 = SIDE_OPTIONS.map((option_0) => {
			const occupied = option_0.value === "all" ? side !== "all" && usedSides.size > 1 : option_0.value !== side && usedSides.has(option_0.value);
			return {
				...option_0,
				disabled: occupied
			};
		});
		$[9] = side;
		$[10] = usedSides;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== onChange) {
		t6 = (value) => onChange(value);
		$[12] = onChange;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== side || $[15] !== t4 || $[16] !== t5 || $[17] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label: "Border side",
			value: t4,
			selectedValue: side,
			options: t5,
			onValueChange: t6
		});
		$[14] = side;
		$[15] = t4;
		$[16] = t5;
		$[17] = t6;
		$[18] = t7;
	} else t7 = $[18];
	return t7;
}
function BorderStyleMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { side, value, onChange } = t0;
	const triggerRef = import_react.useRef(null);
	const t1 = `${side} border style: ${value}`;
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
		t5 = BORDER_STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
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
			className: "min-w-[140px]",
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
function BorderSection() {
	const $ = (0, import_compiler_runtime.c)(63);
	const { hasAny, get, getExplicit, setMultiple, clear, addClass, replaceClasses, removeClassesByCategory, elementClassName } = useStyleOps();
	const [showLibrary, setShowLibrary] = import_react.useState(false);
	const borderColorSuggestions = useClassesForProperty("borderColor");
	let t0;
	if ($[0] !== hasAny) {
		t0 = (side) => {
			const props = SIDE_PROPS[side];
			return hasAny(props.width, props.color, props.style, props.shorthand);
		};
		$[0] = hasAny;
		$[1] = t0;
	} else t0 = $[1];
	const sideIsDefined = t0;
	let rows;
	let t1;
	if ($[2] !== hasAny || $[3] !== sideIsDefined) {
		const sideRows = SIDE_ORDER.filter(sideIsDefined);
		const allIsDefined = hasAny(SIDE_PROPS.all.width, SIDE_PROPS.all.color, SIDE_PROPS.all.style, SIDE_PROPS.all.shorthand);
		rows = sideRows.length ? sideRows : allIsDefined ? ["all"] : [];
		t1 = new Set(rows);
		$[2] = hasAny;
		$[3] = sideIsDefined;
		$[4] = rows;
		$[5] = t1;
	} else {
		rows = $[4];
		t1 = $[5];
	}
	const usedSides = t1;
	let t2;
	if ($[6] !== get || $[7] !== getExplicit) {
		t2 = (side_0, key, fallback) => {
			const property = SIDE_PROPS[side_0][key];
			return getExplicit(property) || get(property) || fallback;
		};
		$[6] = get;
		$[7] = getExplicit;
		$[8] = t2;
	} else t2 = $[8];
	const valueFor = t2;
	let t3;
	if ($[9] !== valueFor) {
		t3 = (side_1) => ({
			width: valueFor(side_1, "width", "1px"),
			color: valueFor(side_1, "color", "#000000"),
			style: valueFor(side_1, "style", "solid")
		});
		$[9] = valueFor;
		$[10] = t3;
	} else t3 = $[10];
	const valuesFor = t3;
	const writeSide = _temp$67;
	const clearSide = _temp2$44;
	let t4;
	if ($[11] !== rows[0] || $[12] !== rows.length || $[13] !== setMultiple || $[14] !== usedSides || $[15] !== valuesFor) {
		t4 = () => {
			if (rows.length >= 4) return;
			if (rows.length === 0) {
				setMultiple(writeSide("all", {
					width: "1px",
					color: "#000000",
					style: "solid"
				}));
				return;
			}
			if (rows.length === 1 && rows[0] === "all") {
				const values_0 = valuesFor("all");
				setMultiple({
					...clearSide("all"),
					...writeSide("top", values_0),
					...writeSide("bottom", values_0)
				});
				return;
			}
			const nextSide = SIDE_ORDER.find((side_4) => !usedSides.has(side_4));
			if (!nextSide) return;
			const seed = valuesFor(rows[0]);
			setMultiple(writeSide(nextSide, seed));
		};
		$[11] = rows[0];
		$[12] = rows.length;
		$[13] = setMultiple;
		$[14] = usedSides;
		$[15] = valuesFor;
		$[16] = t4;
	} else t4 = $[16];
	const addBorder = t4;
	let t5;
	if ($[17] !== elementClassName || $[18] !== replaceClasses || $[19] !== setMultiple) {
		t5 = (side_5) => {
			setMultiple(clearSide(side_5));
			const classes = elementClassName.split(/\s+/).filter(Boolean);
			const next = removeBorderSideClasses(classes, side_5);
			replaceClasses(classes.filter((c) => !next.includes(c)), next.filter((c_0) => !classes.includes(c_0)));
		};
		$[17] = elementClassName;
		$[18] = replaceClasses;
		$[19] = setMultiple;
		$[20] = t5;
	} else t5 = $[20];
	const removeBorder = t5;
	let t6;
	if ($[21] !== setMultiple || $[22] !== valuesFor) {
		t6 = (from, to) => {
			if (from === to) return;
			const values_1 = valuesFor(from);
			setMultiple({
				...clearSide(from),
				...writeSide(to, values_1)
			});
		};
		$[21] = setMultiple;
		$[22] = valuesFor;
		$[23] = t6;
	} else t6 = $[23];
	const changeSide = t6;
	let t7;
	if ($[24] !== addClass || $[25] !== clear) {
		t7 = (className) => {
			addClass([className, "border"]);
			clear(...BORDER_KEYS);
			setShowLibrary(false);
		};
		$[24] = addClass;
		$[25] = clear;
		$[26] = t7;
	} else t7 = $[26];
	const applySectionClass = t7;
	let t8;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Apply border class",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddVariableIcon, {})
			})
		});
		$[27] = t8;
	} else t8 = $[27];
	let t9;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => setShowLibrary(false);
		$[28] = t9;
	} else t9 = $[28];
	let t10;
	if ($[29] !== applySectionClass || $[30] !== borderColorSuggestions) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
			suggestions: borderColorSuggestions,
			cssProperty: "borderColor",
			onSelect: applySectionClass,
			onClose: t9
		});
		$[29] = applySectionClass;
		$[30] = borderColorSuggestions;
		$[31] = t10;
	} else t10 = $[31];
	let t11;
	if ($[32] !== showLibrary || $[33] !== t10) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open: showLibrary,
			onOpenChange: setShowLibrary,
			modal: false,
			children: [t8, t10]
		});
		$[32] = showLibrary;
		$[33] = t10;
		$[34] = t11;
	} else t11 = $[34];
	const t12 = rows.length >= 4 ? "All border sides added" : "Add border";
	const t13 = rows.length >= 4;
	let t14;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[35] = t14;
	} else t14 = $[35];
	let t15;
	if ($[36] !== addBorder || $[37] !== t12 || $[38] !== t13) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t12,
			onClick: addBorder,
			disabled: t13,
			children: t14
		});
		$[36] = addBorder;
		$[37] = t12;
		$[38] = t13;
		$[39] = t15;
	} else t15 = $[39];
	let t16;
	if ($[40] !== t11 || $[41] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [t11, t15]
		});
		$[40] = t11;
		$[41] = t15;
		$[42] = t16;
	} else t16 = $[42];
	const headerActions = t16;
	let t17;
	if ($[43] !== hasAny) {
		t17 = hasAny(...BORDER_KEYS);
		$[43] = hasAny;
		$[44] = t17;
	} else t17 = $[44];
	let t18;
	if ($[45] !== clear || $[46] !== removeClassesByCategory) {
		t18 = () => {
			clear(...BORDER_KEYS);
			removeClassesByCategory([...BORDER_TAILWIND_CATEGORIES]);
		};
		$[45] = clear;
		$[46] = removeClassesByCategory;
		$[47] = t18;
	} else t18 = $[47];
	let t19;
	if ($[48] !== changeSide || $[49] !== removeBorder || $[50] !== rows || $[51] !== setMultiple || $[52] !== usedSides || $[53] !== valueFor) {
		t19 = rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: rows.map((side_6) => {
				const props_2 = SIDE_PROPS[side_6];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: `Remove ${side_6} border`,
							onClick: () => removeBorder(side_6),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {})
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid min-w-0 grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
								property: props_2.width,
								allowedUnits: BORDER_WIDTH_UNITS,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderWidthIcon, { className: "text-ed-inspector-chrome" }),
								onChange: (value) => setMultiple({
									[props_2.shorthand]: void 0,
									[props_2.width]: value
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderSideSelect, {
								side: side_6,
								usedSides,
								onChange: (nextSide_0) => changeSide(side_6, nextSide_0)
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderStyleMenu, {
							side: side_6,
							value: valueFor(side_6, "style", "none"),
							onChange: (style) => setMultiple({
								[props_2.shorthand]: void 0,
								[props_2.style]: style
							})
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleColorInput, {
							property: props_2.color,
							fallbackProperty: side_6 === "all" ? void 0 : "borderColor",
							label: `${side_6} border color`,
							hideLabel: true,
							onChange: (value_0) => setMultiple({
								[props_2.shorthand]: void 0,
								[props_2.color]: value_0
							})
						})
					})]
				}, side_6);
			})
		});
		$[48] = changeSide;
		$[49] = removeBorder;
		$[50] = rows;
		$[51] = setMultiple;
		$[52] = usedSides;
		$[53] = valueFor;
		$[54] = t19;
	} else t19 = $[54];
	let t20;
	if ($[55] !== addBorder || $[56] !== applySectionClass || $[57] !== borderColorSuggestions || $[58] !== headerActions || $[59] !== t17 || $[60] !== t18 || $[61] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			variant: "addable",
			title: "Border",
			isSet: t17,
			onAdd: addBorder,
			onRemove: t18,
			action: headerActions,
			classSuggestions: borderColorSuggestions,
			cssProperty: "borderColor",
			onSelectClass: applySectionClass,
			children: t19
		});
		$[55] = addBorder;
		$[56] = applySectionClass;
		$[57] = borderColorSuggestions;
		$[58] = headerActions;
		$[59] = t17;
		$[60] = t18;
		$[61] = t19;
		$[62] = t20;
	} else t20 = $[62];
	return t20;
}
function _temp2$44(side_3) {
	const props_1 = SIDE_PROPS[side_3];
	return {
		[props_1.shorthand]: void 0,
		[props_1.width]: void 0,
		[props_1.color]: void 0,
		[props_1.style]: void 0
	};
}
function _temp$67(side_2, values) {
	const props_0 = SIDE_PROPS[side_2];
	return {
		[props_0.shorthand]: void 0,
		[props_0.width]: values.width,
		[props_0.color]: values.color,
		[props_0.style]: values.style
	};
}

export { BorderSection };
