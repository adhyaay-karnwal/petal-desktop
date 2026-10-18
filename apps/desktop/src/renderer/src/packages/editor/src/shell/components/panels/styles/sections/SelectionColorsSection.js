// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/SelectionColorsSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { CrosshairIcon, MinusIcon, PlusIcon } from "../../../../../../../ui/src/icons.js";
import { getById, getChildren$2 } from "../../../../../../../compiler/src/store/read.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { parseTailwindClass } from "../../../../../shared/utils/tailwindScale.js";
import { InspectorSection } from "./InspectorSection.js";
import { publishHoverPreview } from "../../../../../shared/state/hoverPreviewChannel.js";
import { useClassesForProperty } from "../../../../hooks/useClassSuggestions.js";
import { colorTokenName } from "../../../../utils/colorTokenMatch.js";
import { ColorRow } from "../inputs/ColorRow.js";
import { canBecomeSolid, collectSelectionColors, gradientToSolid, recolorElement, sameColorSlot } from "../../../../utils/selectionColors.js";

/**
* Selection colors (Figma's section of the same name): every distinct color
* and gradient the selected layers and their descendants use, one row each. Editing a row
* recolors every use of it inside the selection, as one undo step; content
* outside the selection is untouched. Token rows show the token name; picking
* a raw color for one rebinds its uses inline and never edits the token.
* See {@link collectSelectionColors} for which colors are listed.
*/
/** Swatches the closed header previews before the "+N" count. */
var PREVIEW_COUNT = 3;
var byClass = (list) => new Map(list.map((s) => [s.className, s.value]));
/**
* Class → color from the project stylesheet, then the static Tailwind palette,
* with a per-element uses cache that is dropped when the stylesheet changes.
*/
function useClassColorResolver() {
	const $ = (0, import_compiler_runtime.c)(28);
	const bg = useClassesForProperty("backgroundColor");
	const text = useClassesForProperty("color");
	const border = useClassesForProperty("borderColor");
	const top = useClassesForProperty("borderTopColor");
	const right = useClassesForProperty("borderRightColor");
	const bottom = useClassesForProperty("borderBottomColor");
	const left = useClassesForProperty("borderLeftColor");
	const outline = useClassesForProperty("outlineColor");
	let t0;
	if ($[0] !== bg) {
		t0 = byClass(bg);
		$[0] = bg;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== text) {
		t1 = byClass(text);
		$[2] = text;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== border) {
		t2 = byClass(border);
		$[4] = border;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== top) {
		t3 = byClass(top);
		$[6] = top;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== right) {
		t4 = byClass(right);
		$[8] = right;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== bottom) {
		t5 = byClass(bottom);
		$[10] = bottom;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== left) {
		t6 = byClass(left);
		$[12] = left;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== outline) {
		t7 = byClass(outline);
		$[14] = outline;
		$[15] = t7;
	} else t7 = $[15];
	let t8;
	if ($[16] !== t0 || $[17] !== t1 || $[18] !== t2 || $[19] !== t3 || $[20] !== t4 || $[21] !== t5 || $[22] !== t6 || $[23] !== t7) {
		const maps = {
			backgroundColor: t0,
			color: t1,
			borderColor: t2,
			borderTopColor: t3,
			borderRightColor: t4,
			borderBottomColor: t5,
			borderLeftColor: t6,
			outlineColor: t7
		};
		t8 = (cls, property) => maps[property].get(cls) ?? parseTailwindClass(cls)?.[property];
		$[16] = t0;
		$[17] = t1;
		$[18] = t2;
		$[19] = t3;
		$[20] = t4;
		$[21] = t5;
		$[22] = t6;
		$[23] = t7;
		$[24] = t8;
	} else t8 = $[24];
	const resolve = t8;
	let t9;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ new WeakMap();
		$[25] = t9;
	} else t9 = $[25];
	let t10;
	if ($[26] !== resolve) {
		t10 = {
			resolve,
			cache: t9
		};
		$[26] = resolve;
		$[27] = t10;
	} else t10 = $[27];
	return t10;
}
function SelectionColorsSection(t0) {
	const $ = (0, import_compiler_runtime.c)(55);
	const { store, rootIds, onUpdateMultipleElements, onSelectElements } = t0;
	const { resolve, cache } = useClassColorResolver();
	const deferredStore = (0, import_react.useDeferredValue)(store);
	let t1;
	if ($[0] !== rootIds) {
		t1 = rootIds.join(",");
		$[0] = rootIds;
		$[1] = t1;
	} else t1 = $[1];
	const rootKey = t1;
	let t2;
	if ($[2] !== deferredStore || $[3] !== rootIds[0] || $[4] !== rootIds.length) {
		t2 = rootIds.length < 2 && getChildren$2(deferredStore, rootIds[0] ?? "").length === 0;
		$[2] = deferredStore;
		$[3] = rootIds[0];
		$[4] = rootIds.length;
		$[5] = t2;
	} else t2 = $[5];
	const single = t2;
	let t3;
	if ($[6] !== cache || $[7] !== deferredStore || $[8] !== resolve || $[9] !== rootKey || $[10] !== single) {
		t3 = single ? [] : collectSelectionColors(deferredStore, rootKey.split(","), resolve, cache);
		$[6] = cache;
		$[7] = deferredStore;
		$[8] = resolve;
		$[9] = rootKey;
		$[10] = single;
		$[11] = t3;
	} else t3 = $[11];
	const colors = t3;
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const [editingFor, setEditingFor] = (0, import_react.useState)(rootKey);
	if (editingFor !== rootKey) {
		setEditingFor(rootKey);
		setEditing(null);
		setExpanded(false);
	}
	let t4;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[12] = t4;
	} else t4 = $[12];
	(0, import_react.useEffect)(_temp2$38, t4);
	const rows = editing?.rows ?? colors;
	let t5;
	if ($[13] !== colors || $[14] !== editing) {
		t5 = (index, row) => {
			if (editing?.index !== index) return row;
			const slot = editing.uses[0];
			return colors.find((c) => c.uses.some((u) => sameColorSlot(u, slot))) ?? row;
		};
		$[13] = colors;
		$[14] = editing;
		$[15] = t5;
	} else t5 = $[15];
	const live = t5;
	const elementIds = new Set(colors.flatMap(_temp4$26));
	const onlySelectedLayer = elementIds.size < 2 && [...elementIds].every((id) => rootIds.includes(id));
	if (!onUpdateMultipleElements || onlySelectedLayer) return null;
	let t6;
	if ($[16] !== editing || $[17] !== rows) {
		t6 = (index_0) => editing?.index === index_0 ? editing.uses : rows[index_0]?.uses;
		$[16] = editing;
		$[17] = rows;
		$[18] = t6;
	} else t6 = $[18];
	const usesAt = t6;
	const idsOf = _temp6$18;
	let t7;
	if ($[19] !== onUpdateMultipleElements || $[20] !== resolve || $[21] !== usesAt) {
		t7 = (index_1, target) => {
			const uses_0 = usesAt(index_1);
			if (!uses_0?.length) return;
			onUpdateMultipleElements(idsOf(uses_0), (el) => recolorElement(el, uses_0, target, resolve));
		};
		$[19] = onUpdateMultipleElements;
		$[20] = resolve;
		$[21] = usesAt;
		$[22] = t7;
	} else t7 = $[22];
	const apply = t7;
	let t8;
	if ($[23] !== apply || $[24] !== editing || $[25] !== onUpdateMultipleElements || $[26] !== resolve || $[27] !== store || $[28] !== usesAt) {
		t8 = (index_2, value) => {
			const uses_1 = usesAt(index_2);
			if (!uses_1?.length) return;
			if (!uses_1.some(_temp7$15)) return apply(index_2, { value });
			const ids = idsOf(uses_1);
			onUpdateMultipleElements(ids, (el_0) => gradientToSolid(el_0, uses_1, value, resolve)?.write ?? null);
			if (editing?.index !== index_2) return;
			const solids = ids.flatMap((id_0) => {
				const el_1 = getById(store, id_0);
				return el_1 && gradientToSolid(el_1, uses_1, value, resolve)?.uses || [];
			});
			if (solids.length > 0) setEditing({
				...editing,
				uses: solids
			});
		};
		$[23] = apply;
		$[24] = editing;
		$[25] = onUpdateMultipleElements;
		$[26] = resolve;
		$[27] = store;
		$[28] = usesAt;
		$[29] = t8;
	} else t8 = $[29];
	const applySolid = t8;
	let t9;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => setExpanded(true);
		$[30] = t9;
	} else t9 = $[30];
	let t10;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Hide selection colors",
			onClick: () => {
				setExpanded(false);
				setEditing(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {})
		});
		$[31] = t10;
	} else t10 = $[31];
	let t11;
	if ($[32] !== rows) {
		t11 = rows.slice(0, PREVIEW_COUNT).map(_temp8$11);
		$[32] = rows;
		$[33] = t11;
	} else t11 = $[33];
	let t12;
	if ($[34] !== rows.length) {
		t12 = rows.length > PREVIEW_COUNT && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-[11px] text-ed-muted-foreground",
			children: ["+", rows.length - PREVIEW_COUNT]
		});
		$[34] = rows.length;
		$[35] = t12;
	} else t12 = $[35];
	let t13;
	if ($[36] !== t11 || $[37] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5",
			"aria-hidden": true,
			children: [t11, t12]
		});
		$[36] = t11;
		$[37] = t12;
		$[38] = t13;
	} else t13 = $[38];
	let t14;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Show selection colors",
			onClick: () => setExpanded(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
		});
		$[39] = t14;
	} else t14 = $[39];
	let t15;
	if ($[40] !== t13) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t13, t14] });
		$[40] = t13;
		$[41] = t15;
	} else t15 = $[41];
	let t16;
	if ($[42] !== apply || $[43] !== applySolid || $[44] !== editing?.index || $[45] !== expanded || $[46] !== live || $[47] !== onSelectElements || $[48] !== resolve || $[49] !== rows) {
		t16 = expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: rows.map((row_1, index_3) => {
				const color = live(index_3, row_1);
				const property = color.uses.find(_temp9$9)?.property ?? "color";
				const solidable = color.gradient && canBecomeSolid(color.uses);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
					action: onSelectElements && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Select layers with this color",
						onPointerEnter: () => publishHoverPreview([...new Set(color.uses.map(_temp0$8))]),
						onPointerLeave: _temp1$8,
						onClick: () => {
							publishHoverPreview([]);
							onSelectElements([...new Set(color.uses.map(_temp10$8))]);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, {})
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
						label: color.token ?? (color.gradient ? "Gradient" : color.value),
						hideLabel: true,
						showTooltip: false,
						value: color.value,
						cssProperty: color.gradient ? "background" : property,
						source: color.token ? "class" : void 0,
						sourceClass: color.token,
						allowedFillKinds: color.gradient ? solidable ? ["gradient", "solid"] : ["gradient"] : void 0,
						onChange: (value_0) => apply(index_3, { value: value_0 }),
						onChangeFill: color.gradient ? (value_1, kind) => {
							if (kind !== "solid") apply(index_3, { value: value_1 });
							else if (solidable) applySolid(index_3, value_1);
						} : void 0,
						onSelectClass: color.gradient ? void 0 : (cls) => apply(index_3, {
							token: colorTokenName(cls),
							value: resolve(cls, property)
						}),
						onClearOverride: color.token ? () => apply(index_3, { value: color.value }) : void 0,
						clearOverrideTitle: "Detach",
						open: editing?.index === index_3,
						onOpenChange: (open) => setEditing(open ? {
							index: index_3,
							uses: color.uses,
							rows
						} : null)
					})
				}, index_3);
			})
		});
		$[42] = apply;
		$[43] = applySolid;
		$[44] = editing?.index;
		$[45] = expanded;
		$[46] = live;
		$[47] = onSelectElements;
		$[48] = resolve;
		$[49] = rows;
		$[50] = t16;
	} else t16 = $[50];
	let t17;
	if ($[51] !== expanded || $[52] !== t15 || $[53] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			variant: "addable",
			title: "Selection colors",
			isSet: expanded,
			onAdd: t9,
			action: t10,
			collapsedAction: t15,
			reserveActionRail: true,
			children: t16
		});
		$[51] = expanded;
		$[52] = t15;
		$[53] = t16;
		$[54] = t17;
	} else t17 = $[54];
	return t17;
}
function _temp10$8(u_5) {
	return u_5.elementId;
}
function _temp1$8() {
	return publishHoverPreview([]);
}
function _temp0$8(u_4) {
	return u_4.elementId;
}
function _temp9$9(u_3) {
	return u_3.source === "style" && u_3.index === void 0;
}
function _temp8$11(row_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "size-4 shrink-0 rounded-xs border border-ed-field-border",
		style: { background: row_0.value }
	}, row_0.key);
}
function _temp7$15(u_2) {
	return u_2.gradient;
}
function _temp6$18(uses) {
	return [...new Set(uses.map(_temp5$23))];
}
function _temp5$23(u_1) {
	return u_1.elementId;
}
function _temp4$26(c_0) {
	return c_0.uses.map(_temp3$27);
}
function _temp3$27(u_0) {
	return u_0.elementId;
}
function _temp2$38() {
	return _temp$58;
}
function _temp$58() {
	return publishHoverPreview([]);
}

export { SelectionColorsSection };
