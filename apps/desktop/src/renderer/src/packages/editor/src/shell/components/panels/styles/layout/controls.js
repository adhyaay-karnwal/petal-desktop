// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/layout/controls.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { DisplayBlockIcon, DisplayGridIcon, EyeClosedIcon, EyeIcon, GapIcon, MarginBottomIcon, MarginLeftIcon, MarginRightIcon, MarginSeparateIcon, MarginTopIcon, PaddingBottomIcon, PaddingLeftIcon, PaddingRightIcon, PaddingSeparateIcon, PaddingTopIcon } from "../../../../../../../ui/src/icons.js";
import { IconBtn, styleFieldLabel } from "../primitives.js";
import { useStyleField, useStyleOps } from "../StyleOpsContext.js";
import { FlexColumnGlyph, FlexRowGlyph, FlexWrapGlyph } from "./glyphs.js";
import { LayoutValueInput } from "../inputs/LayoutValueInput.js";
import { MergeableFields, StyleLayoutInput } from "../fields/layout.js";
import { InspectorToggleGroup } from "../InspectorToggleGroup.js";
import { asFlexDistribution } from "./flexDistribution.js";

/**
* Context-bound layout controls: the display/flow toggle group, the visibility
* toggle, and the linked-sides padding/margin grid + its link toggle button.
*/
/** Gap-menu modes. The distribution keywords are `justify-content` values. */
var MAIN_AXIS_GAP_MODES = [
	{
		value: "normal",
		label: "Normal"
	},
	{
		value: "space-between",
		label: "Space between"
	},
	{
		value: "space-around",
		label: "Space around"
	},
	{
		value: "space-evenly",
		label: "Space evenly"
	}
];
function canonicalAlignmentPosition(value) {
	if (value === "center") return "center";
	if (value === "flex-end" || value === "end") return "flex-end";
	return "flex-start";
}
/**
* Display/flow selector (Block / Flex column / Flex row / Grid). Reads the
* current display + flex-direction via the StyleOps context.
*/
function FlowToggleGroup() {
	const $ = (0, import_compiler_runtime.c)(17);
	const display = useStyleField("display");
	const flexDir = useStyleField("flexDirection");
	const alignItems = useStyleField("alignItems");
	const justifyContent = useStyleField("justifyContent");
	const { setMultiple } = useStyleOps();
	let t0;
	if ($[0] !== display || $[1] !== flexDir) {
		t0 = !display.isMixed && !flexDir.isMixed && (display.equals("flex") || display.equals("inline-flex"));
		$[0] = display;
		$[1] = flexDir;
		$[2] = t0;
	} else t0 = $[2];
	const flexActive = t0;
	const value = display.isMixed ? "__mixed__" : display.equals("block") ? "block" : display.equals("grid") ? "grid" : flexActive && flexDir.in("column", "column-reverse") ? "column" : flexActive && flexDir.in("row", "row-reverse") ? "row" : "__none__";
	let t1;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			value: "block",
			label: "Block",
			tooltip: "Block",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayBlockIcon, { className: "!size-3" })
		};
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			value: "column",
			label: "Flex Column",
			tooltip: "Flex Column",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexColumnGlyph, {})
		};
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = {
			value: "row",
			label: "Flex Row",
			tooltip: "Flex Row",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexRowGlyph, {})
		};
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [
			t1,
			t2,
			t3,
			{
				value: "grid",
				label: "Grid",
				tooltip: "Grid",
				content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayGridIcon, { className: "!size-3" })
			}
		];
		$[6] = t4;
	} else t4 = $[6];
	const options = t4;
	let t5;
	if ($[7] !== alignItems || $[8] !== display || $[9] !== flexActive || $[10] !== flexDir || $[11] !== justifyContent || $[12] !== setMultiple) {
		t5 = (nextValue) => {
			if (nextValue === "block" || nextValue === "grid") display.set(nextValue);
			else if (nextValue === "column" || nextValue === "row") {
				const currentDirection = flexDir.in("column", "column-reverse") ? "column" : "row";
				const updates = {
					display: "flex",
					flexDirection: nextValue
				};
				if (flexActive && currentDirection !== nextValue && !alignItems.isMixed && !justifyContent.isMixed && !asFlexDistribution(justifyContent.value)) {
					const verticalPosition = canonicalAlignmentPosition(currentDirection === "column" ? justifyContent.value : alignItems.value);
					const horizontalPosition = canonicalAlignmentPosition(currentDirection === "column" ? alignItems.value : justifyContent.value);
					if (nextValue === "column") {
						updates.justifyContent = verticalPosition;
						updates.alignItems = horizontalPosition;
					} else {
						updates.alignItems = verticalPosition;
						updates.justifyContent = horizontalPosition;
					}
				}
				setMultiple(updates);
			}
		};
		$[7] = alignItems;
		$[8] = display;
		$[9] = flexActive;
		$[10] = flexDir;
		$[11] = justifyContent;
		$[12] = setMultiple;
		$[13] = t5;
	} else t5 = $[13];
	let t6;
	if ($[14] !== t5 || $[15] !== value) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorToggleGroup, {
			"aria-label": "Flow",
			value,
			options,
			onValueChange: t5
		});
		$[14] = t5;
		$[15] = value;
		$[16] = t6;
	} else t6 = $[16];
	return t6;
}
/**
* Main-axis gap input. Like Figma's "Auto" spacing, the menu also offers the
* CSS distribution modes: picking one writes `justify-content` and the field
* shows that mode in place of the gap; entering a number again packs the
* items back to the start. The gap value itself is left untouched.
*/
function FlexMainAxisGapInput() {
	const $ = (0, import_compiler_runtime.c)(28);
	const flexDir = useStyleField("flexDirection");
	const justifyContent = useStyleField("justifyContent");
	const { setMultiple } = useStyleOps();
	let t0;
	if ($[0] !== flexDir) {
		t0 = flexDir.in("column", "column-reverse");
		$[0] = flexDir;
		$[1] = t0;
	} else t0 = $[1];
	const isColumn = t0;
	const property = isColumn ? "rowGap" : "columnGap";
	const gap = useStyleField(property);
	let t1;
	if ($[2] !== justifyContent.isMixed || $[3] !== justifyContent.value) {
		t1 = justifyContent.isMixed ? null : asFlexDistribution(justifyContent.value);
		$[2] = justifyContent.isMixed;
		$[3] = justifyContent.value;
		$[4] = t1;
	} else t1 = $[4];
	const distributed = t1;
	const t2 = !isColumn && "rotate-90";
	let t3;
	if ($[5] !== t2) {
		t3 = cn$2("size-3.75 shrink-0", t2);
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GapIcon, { className: t3 });
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	const t5 = distributed ?? (gap.isMixed ? "" : gap.value);
	let t6;
	if ($[9] !== distributed || $[10] !== gap || $[11] !== property || $[12] !== setMultiple) {
		t6 = (next) => {
			if (asFlexDistribution(next)) setMultiple({ justifyContent: next });
			else if (distributed) setMultiple({
				[property]: next,
				justifyContent: "flex-start"
			});
			else gap.set(next);
		};
		$[9] = distributed;
		$[10] = gap;
		$[11] = property;
		$[12] = setMultiple;
		$[13] = t6;
	} else t6 = $[13];
	const t7 = !distributed && gap.isMixed;
	let t8;
	if ($[14] !== distributed || $[15] !== gap.source) {
		t8 = distributed ? {} : gap.source;
		$[14] = distributed;
		$[15] = gap.source;
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] !== property) {
		t9 = styleFieldLabel(property);
		$[17] = property;
		$[18] = t9;
	} else t9 = $[18];
	let t10;
	if ($[19] !== gap.addClass || $[20] !== property || $[21] !== t4 || $[22] !== t5 || $[23] !== t6 || $[24] !== t7 || $[25] !== t8 || $[26] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
			icon: t4,
			value: t5,
			onChange: t6,
			modeOptions: MAIN_AXIS_GAP_MODES,
			isMixedValue: t7,
			...t8,
			cssProperty: property,
			tooltipLabel: t9,
			onSelectClass: gap.addClass
		});
		$[19] = gap.addClass;
		$[20] = property;
		$[21] = t4;
		$[22] = t5;
		$[23] = t6;
		$[24] = t7;
		$[25] = t8;
		$[26] = t9;
		$[27] = t10;
	} else t10 = $[27];
	return t10;
}
/** Toggle flex wrapping from the fixed action slot beside the flow switcher. */
function WrapToggleButton() {
	const $ = (0, import_compiler_runtime.c)(10);
	const flexWrap = useStyleField("flexWrap");
	let t0;
	if ($[0] !== flexWrap) {
		t0 = flexWrap.equals("wrap");
		$[0] = flexWrap;
		$[1] = t0;
	} else t0 = $[1];
	const isWrapped = t0;
	const t1 = isWrapped ? "Disable wrapping" : "Wrap items";
	let t2;
	if ($[2] !== flexWrap || $[3] !== isWrapped) {
		t2 = () => flexWrap.set(isWrapped ? "nowrap" : "wrap");
		$[2] = flexWrap;
		$[3] = isWrapped;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexWrapGlyph, {});
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== isWrapped || $[7] !== t1 || $[8] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t1,
			active: isWrapped,
			onClick: t2,
			children: t3
		});
		$[6] = isWrapped;
		$[7] = t1;
		$[8] = t2;
		$[9] = t4;
	} else t4 = $[9];
	return t4;
}
/**
* Section-header toggle button bound to `visibility: hidden`. Active when
* the element is hidden; clicking toggles it.
*/
function VisibilityToggleButton() {
	const $ = (0, import_compiler_runtime.c)(12);
	const f = useStyleField("visibility");
	let t0;
	if ($[0] !== f) {
		t0 = f.equals("hidden");
		$[0] = f;
		$[1] = t0;
	} else t0 = $[1];
	const isHidden = t0;
	const t1 = isHidden ? "Show" : "Hide";
	let t2;
	if ($[2] !== f || $[3] !== isHidden) {
		t2 = () => isHidden ? f.clear() : f.set("hidden");
		$[2] = f;
		$[3] = isHidden;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== isHidden) {
		t3 = isHidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeClosedIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeIcon, {});
		$[5] = isHidden;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== isHidden || $[8] !== t1 || $[9] !== t2 || $[10] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t1,
			active: isHidden,
			onClick: t2,
			children: t3
		});
		$[7] = isHidden;
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
	} else t4 = $[11];
	return t4;
}
/**
* A grid of layout inputs for the four sides of padding/margin, with link mode.
* Cmd+click merges fields (see `MergeableFields`): all four sides while
* linked, or just the clicked side's opposite pair once separated. Separated
* sides sit in pair rows (left/right, then top/bottom) so a merged pair takes
* over its own row.
*/
function LinkedSidesGrid(t0) {
	const $ = (0, import_compiler_runtime.c)(78);
	const { prefix, linked, allSidesIcon, linkedHorizontalIcon, linkedVerticalIcon, showTooltips: t1 } = t0;
	const showTooltips = t1 === void 0 ? true : t1;
	const { setMultiple } = useStyleOps();
	const top = `${prefix}Top`;
	const right = `${prefix}Right`;
	const bottom = `${prefix}Bottom`;
	const left = `${prefix}Left`;
	const label = prefix === "margin" ? "Margin" : "Padding";
	if (linked) {
		let t2;
		if ($[0] !== bottom || $[1] !== left || $[2] !== right || $[3] !== top) {
			t2 = [
				top,
				right,
				bottom,
				left
			];
			$[0] = bottom;
			$[1] = left;
			$[2] = right;
			$[3] = top;
			$[4] = t2;
		} else t2 = $[4];
		let t3;
		if ($[5] !== left || $[6] !== right || $[7] !== setMultiple) {
			t3 = (v) => setMultiple({
				[left]: v,
				[right]: v
			});
			$[5] = left;
			$[6] = right;
			$[7] = setMultiple;
			$[8] = t3;
		} else t3 = $[8];
		let t4;
		if ($[9] !== left || $[10] !== linkedHorizontalIcon || $[11] !== right || $[12] !== showTooltips || $[13] !== t3) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
				property: left,
				linkedProperty: right,
				icon: linkedHorizontalIcon,
				showTooltip: showTooltips,
				onChange: t3
			});
			$[9] = left;
			$[10] = linkedHorizontalIcon;
			$[11] = right;
			$[12] = showTooltips;
			$[13] = t3;
			$[14] = t4;
		} else t4 = $[14];
		let t5;
		if ($[15] !== bottom || $[16] !== setMultiple || $[17] !== top) {
			t5 = (v_0) => setMultiple({
				[top]: v_0,
				[bottom]: v_0
			});
			$[15] = bottom;
			$[16] = setMultiple;
			$[17] = top;
			$[18] = t5;
		} else t5 = $[18];
		let t6;
		if ($[19] !== bottom || $[20] !== linkedVerticalIcon || $[21] !== showTooltips || $[22] !== t5 || $[23] !== top) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
				property: top,
				linkedProperty: bottom,
				icon: linkedVerticalIcon,
				showTooltip: showTooltips,
				onChange: t5
			});
			$[19] = bottom;
			$[20] = linkedVerticalIcon;
			$[21] = showTooltips;
			$[22] = t5;
			$[23] = top;
			$[24] = t6;
		} else t6 = $[24];
		let t7;
		if ($[25] !== allSidesIcon || $[26] !== label || $[27] !== t2 || $[28] !== t4 || $[29] !== t6) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MergeableFields, {
				className: "contents",
				properties: t2,
				label,
				icon: allSidesIcon,
				children: [t4, t6]
			});
			$[25] = allSidesIcon;
			$[26] = label;
			$[27] = t2;
			$[28] = t4;
			$[29] = t6;
			$[30] = t7;
		} else t7 = $[30];
		return t7;
	}
	let t2;
	if ($[31] !== prefix) {
		t2 = prefix === "margin" ? {
			top: MarginTopIcon,
			bottom: MarginBottomIcon,
			left: MarginLeftIcon,
			right: MarginRightIcon
		} : {
			top: PaddingTopIcon,
			bottom: PaddingBottomIcon,
			left: PaddingLeftIcon,
			right: PaddingRightIcon
		};
		$[31] = prefix;
		$[32] = t2;
	} else t2 = $[32];
	const side = t2;
	let t3;
	if ($[33] !== left || $[34] !== right) {
		t3 = [left, right];
		$[33] = left;
		$[34] = right;
		$[35] = t3;
	} else t3 = $[35];
	const t4 = `Horizontal ${prefix}`;
	let t5;
	if ($[36] !== side.left) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(side.left, { className: "size-3.75" });
		$[36] = side.left;
		$[37] = t5;
	} else t5 = $[37];
	let t6;
	if ($[38] !== left || $[39] !== showTooltips || $[40] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
			property: left,
			icon: t5,
			showTooltip: showTooltips
		});
		$[38] = left;
		$[39] = showTooltips;
		$[40] = t5;
		$[41] = t6;
	} else t6 = $[41];
	let t7;
	if ($[42] !== side.right) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(side.right, { className: "size-3.75" });
		$[42] = side.right;
		$[43] = t7;
	} else t7 = $[43];
	let t8;
	if ($[44] !== right || $[45] !== showTooltips || $[46] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
			property: right,
			icon: t7,
			showTooltip: showTooltips
		});
		$[44] = right;
		$[45] = showTooltips;
		$[46] = t7;
		$[47] = t8;
	} else t8 = $[47];
	let t9;
	if ($[48] !== linkedHorizontalIcon || $[49] !== t3 || $[50] !== t4 || $[51] !== t6 || $[52] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MergeableFields, {
			className: "contents",
			properties: t3,
			label: t4,
			icon: linkedHorizontalIcon,
			children: [t6, t8]
		});
		$[48] = linkedHorizontalIcon;
		$[49] = t3;
		$[50] = t4;
		$[51] = t6;
		$[52] = t8;
		$[53] = t9;
	} else t9 = $[53];
	let t10;
	if ($[54] !== bottom || $[55] !== top) {
		t10 = [top, bottom];
		$[54] = bottom;
		$[55] = top;
		$[56] = t10;
	} else t10 = $[56];
	const t11 = `Vertical ${prefix}`;
	let t12;
	if ($[57] !== side.top) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(side.top, { className: "size-3.75" });
		$[57] = side.top;
		$[58] = t12;
	} else t12 = $[58];
	let t13;
	if ($[59] !== showTooltips || $[60] !== t12 || $[61] !== top) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
			property: top,
			icon: t12,
			showTooltip: showTooltips
		});
		$[59] = showTooltips;
		$[60] = t12;
		$[61] = top;
		$[62] = t13;
	} else t13 = $[62];
	let t14;
	if ($[63] !== side.bottom) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(side.bottom, { className: "size-3.75" });
		$[63] = side.bottom;
		$[64] = t14;
	} else t14 = $[64];
	let t15;
	if ($[65] !== bottom || $[66] !== showTooltips || $[67] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
			property: bottom,
			icon: t14,
			showTooltip: showTooltips
		});
		$[65] = bottom;
		$[66] = showTooltips;
		$[67] = t14;
		$[68] = t15;
	} else t15 = $[68];
	let t16;
	if ($[69] !== linkedVerticalIcon || $[70] !== t10 || $[71] !== t11 || $[72] !== t13 || $[73] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MergeableFields, {
			className: "contents",
			properties: t10,
			label: t11,
			icon: linkedVerticalIcon,
			children: [t13, t15]
		});
		$[69] = linkedVerticalIcon;
		$[70] = t10;
		$[71] = t11;
		$[72] = t13;
		$[73] = t15;
		$[74] = t16;
	} else t16 = $[74];
	let t17;
	if ($[75] !== t16 || $[76] !== t9) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t9, t16] });
		$[75] = t16;
		$[76] = t9;
		$[77] = t17;
	} else t17 = $[77];
	return t17;
}
function LinkSidesButton(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { linked, onToggle, kind: t1 } = t0;
	const SeparateIcon = (t1 === void 0 ? "padding" : t1) === "margin" ? MarginSeparateIcon : PaddingSeparateIcon;
	const t2 = linked ? "Separate sides" : "Link sides";
	const t3 = !linked;
	let t4;
	if ($[0] !== SeparateIcon) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeparateIcon, {});
		$[0] = SeparateIcon;
		$[1] = t4;
	} else t4 = $[1];
	let t5;
	if ($[2] !== onToggle || $[3] !== t2 || $[4] !== t3 || $[5] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t2,
			active: t3,
			onClick: onToggle,
			children: t4
		});
		$[2] = onToggle;
		$[3] = t2;
		$[4] = t3;
		$[5] = t4;
		$[6] = t5;
	} else t5 = $[6];
	return t5;
}

export { FlexMainAxisGapInput, FlowToggleGroup, LinkSidesButton, LinkedSidesGrid, VisibilityToggleButton, WrapToggleButton };
