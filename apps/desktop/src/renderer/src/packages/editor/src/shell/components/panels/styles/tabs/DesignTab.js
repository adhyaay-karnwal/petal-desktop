// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/tabs/DesignTab.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { CropIcon, GapIcon, LockAspectRatioIcon, MaxWidthIcon, OverflowSettingsIcon, ZIndexIcon } from "../../../../../../../ui/src/icons.js";
import { e$18, e$19, r$10 } from "../../../../../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../../../../../../../ui/src/components/DropdownMenu.js";
import { getById, getChildren$2, getParentId, isTextOwner } from "../../../../../../../compiler/src/store/read.js";
import { IconBtn, InspectorRailRow, LayoutAddButton, LayoutFieldLabel } from "../primitives.js";
import { getTailwindCategory, parseTailwindClass, smartMergeClasses } from "../../../../../shared/utils/tailwindScale.js";
import { InspectorSection } from "../sections/InspectorSection.js";
import { InspectorDropdown } from "../inputs/parts/InspectorDropdown.js";
import { getCanvasSpaceRect } from "../../../../../canvas/utils/domGeometry.js";
import { normalizePaddingStyles, paddingEditBase } from "../../../../../shared/utils/paddingStyles.js";
import { ScrubSessionContext } from "../../../../../shared/utils/useScrub.js";
import { TEXT_STYLE_KEYS } from "../../../../constants.js";
import { usePropertyResolution } from "../../../../utils/styleResolution.js";
import { getMergedValue, isMixed } from "../../../../utils/multiSelect.js";
import { StyleOpsContext, StyleOpsStore, mergePatch$1, useStyleOps } from "../StyleOpsContext.js";
import { AlignmentCellGlyph, DistributedItemLine, FlexAlignmentGlyph } from "../layout/glyphs.js";
import { ScaleSection, selectionRootIds } from "../sections/ScaleSection.js";
import { isInlineTypographyEdit } from "../../../../utils/tailwindClasses.js";
import { MergeableFields, MergedDimensionInput, StyleDimensionInput, StyleLayoutInput, StyleLayoutMinMaxInput } from "../fields/layout.js";
import { FLEX_DISTRIBUTIONS, asFlexDistribution } from "../layout/flexDistribution.js";
import { FlexMainAxisGapInput, FlowToggleGroup, WrapToggleButton } from "../layout/controls.js";
import { PaddingSection } from "../sections/PaddingSection.js";
import { MarginSection } from "../sections/MarginSection.js";
import { BackgroundSection } from "../sections/BackgroundSection.js";
import { ImageSection } from "../sections/ImageSection.js";
import { BorderSection } from "../sections/BorderSection.js";
import { TypographySection } from "../sections/TypographySection.js";
import { FiltersSection } from "../sections/FiltersSection.js";
import { OutlineSection } from "../sections/OutlineSection.js";
import { ShadowSection } from "../sections/ShadowSection.js";
import { AppearanceSection } from "../sections/AppearanceSection.js";
import { RadiusSection } from "../sections/RadiusSection.js";
import { alignCanvasSelection, distributeCanvasSelection } from "../../../../../shared/utils/positionAlignment.js";
import { PositionSection } from "../positioning/PositionSection.js";

/**
* Design tab — the visual styles editor. Builds the StyleOps object once
* (read/write/source/class helpers over the selected element or text
* selection, with multi-select merging) and provides it via StyleOpsContext
* so every section consumes it through useStyleField. Renders Position,
* Layout, Appearance, Radius, Margin, Background, Border, Typography, and
* Effects.
*/
var OVERFLOW_OPTIONS = [
	{
		value: "visible",
		label: "Overflow"
	},
	{
		value: "hidden",
		label: "Clip Content"
	},
	{
		value: "scroll",
		label: "Scroll Content"
	}
];
var isMediaElement = (element) => element.type === "html" && (element.tag === "img" || element.tag === "video");
function editableProps(element) {
	const props = element?.props ?? {};
	return element?.type === "text" ? {
		...props,
		className: props.className ?? element.className ?? ""
	} : props;
}
function elementWithTextSelection(rawElement, textSelectionState) {
	if (!textSelectionState || !rawElement) return rawElement;
	const baseProps = editableProps(rawElement);
	if (textSelectionState.isFull) {
		const ownerClass = String(baseProps.className ?? "");
		const runClass = textSelectionState.className ?? "";
		const merged = [...new Set([...ownerClass.split(/\s+/), ...runClass.split(/\s+/)].filter(Boolean))].join(" ");
		if (merged === ownerClass) return rawElement;
		return {
			...rawElement,
			props: {
				...baseProps,
				className: merged
			}
		};
	}
	return {
		...rawElement,
		styles: textSelectionState.styles,
		props: {
			...baseProps,
			className: textSelectionState.className ?? ""
		}
	};
}
/** Read a layout property from inline styles, then from Tailwind classes. */
function layoutStyleOf(el, prop) {
	const inline = el.styles?.[prop];
	if (inline) return String(inline);
	const className = String(el.props?.className ?? "");
	for (const token of className.split(/\s+/)) {
		const value = parseTailwindClass(token)?.[prop];
		if (value) return value;
	}
	return "";
}
/**
* Typography props a scrub has already cleared from descendant text. Outside a
* scrub nothing is remembered, so every edit reconciles.
*/
var ScrubReconciled = class {
	constructor() {
		this.props = null;
	}
	start() {
		this.props = /* @__PURE__ */ new Set();
	}
	end() {
		this.props = null;
	}
	/** The props not yet cleared in this scrub, now marked cleared. */
	claim(props) {
		const fresh = props.filter((p) => !this.props?.has(p));
		fresh.forEach((p) => this.props?.add(p));
		return fresh;
	}
};
function layoutOfParent(store, elId) {
	const parentKey = getParentId(store, elId);
	if (!parentKey || parentKey === "ROOT") return null;
	const parent = getById(store, parentKey);
	if (!parent) return null;
	const display = layoutStyleOf(parent, "display");
	if (display === "grid" || display === "inline-grid") return "grid";
	if (display !== "flex" && display !== "inline-flex") return null;
	const dir = layoutStyleOf(parent, "flexDirection");
	return dir === "column" || dir === "column-reverse" ? "column" : "row";
}
var DIMENSION_KEYS = ["width", "height"];
var OPTIONAL_DIMENSION_FIELDS = [
	{
		property: "minWidth",
		label: "Min Width",
		initialValue: "0px"
	},
	{
		property: "maxWidth",
		label: "Max Width",
		initialValue: "100%"
	},
	{
		property: "minHeight",
		label: "Min Height",
		initialValue: "0px"
	},
	{
		property: "maxHeight",
		label: "Max Height",
		initialValue: "100%"
	}
];
var FRAME_ALIGNMENT_POSITIONS = /* @__PURE__ */ new Set([
	"static",
	"relative",
	"absolute",
	"fixed",
	"sticky"
]);
function OptionalDimensionFieldsMenu() {
	const $ = (0, import_compiler_runtime.c)(7);
	const { has, set, clear } = useStyleOps();
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Size fields",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {})
			})
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] !== clear || $[2] !== has || $[3] !== set) {
		t1 = OPTIONAL_DIMENSION_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			checked: has(field.property),
			onCheckedChange: (checked) => {
				if (checked) set(field.property, field.initialValue);
				else clear(field.property);
			},
			children: field.label
		}, field.property));
		$[1] = clear;
		$[2] = has;
		$[3] = set;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
				align: "end",
				className: "w-max min-w-0",
				children: t1
			})]
		});
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	return t2;
}
function DesignTab(t0) {
	const $ = (0, import_compiler_runtime.c)(58);
	const { element: rawElement, selectedElementId, selectedElements, store, onUpdateElementStyles, onUpdateElementProps, onUpdateElement, onUpdateMultipleElementsStyles, onUpdateElementPositions, onUpdateMultipleElementsProps, onToggleTextFormat, textSelectionState, readOnly, fonts } = t0;
	let t1;
	if ($[0] !== rawElement || $[1] !== textSelectionState) {
		t1 = elementWithTextSelection(rawElement, textSelectionState);
		$[0] = rawElement;
		$[1] = textSelectionState;
		$[2] = t1;
	} else t1 = $[2];
	const element = t1;
	const isMultiSelect = selectedElements && selectedElements.length > 1;
	const [opsStore] = (0, import_react.useState)(_temp$59);
	let t2;
	if ($[3] !== opsStore) {
		t2 = () => {
			opsStore.publish();
		};
		$[3] = opsStore;
		$[4] = t2;
	} else t2 = $[4];
	(0, import_react.useLayoutEffect)(t2);
	const scrubSession = (0, import_react.useContext)(ScrubSessionContext);
	const [scrubReconciled] = (0, import_react.useState)(_temp2$39);
	let t3;
	if ($[5] !== scrubReconciled || $[6] !== scrubSession) {
		t3 = {
			onStart: () => {
				scrubReconciled.start();
				scrubSession.onStart();
			},
			onEnd: () => {
				scrubReconciled.end();
				scrubSession.onEnd();
			}
		};
		$[5] = scrubReconciled;
		$[6] = scrubSession;
		$[7] = t3;
	} else t3 = $[7];
	const reconcilingScrubSession = t3;
	const alignmentElements = selectedElements ?? (rawElement ? [rawElement] : []);
	const mediaOnly = alignmentElements.length > 0 && alignmentElements.every(isMediaElement);
	let t4;
	if ($[8] !== store) {
		t4 = (item) => getParentId(store, item.id);
		$[8] = store;
		$[9] = t4;
	} else t4 = $[9];
	const alignmentParentKeys = alignmentElements.map(t4);
	const allCanvasRoots = alignmentElements.length > 0 && alignmentParentKeys.every(_temp3$28);
	const allFrameChildren = alignmentElements.length > 0 && alignmentParentKeys.every(_temp4$27);
	const allFramePositionsSupported = alignmentElements.every(_temp5$24);
	let t5;
	if ($[10] !== store) {
		t5 = (item_1) => layoutOfParent(store, item_1.id);
		$[10] = store;
		$[11] = t5;
	} else t5 = $[11];
	const parentLayouts = alignmentElements.map(t5);
	const parentLayout = parentLayouts.every((layout) => layout === parentLayouts[0]) ? parentLayouts[0] ?? null : null;
	const hasFlowLayoutParent = allFrameChildren && parentLayouts.some(Boolean);
	const positionAlignmentScope = allCanvasRoots ? alignmentElements.length > 1 && onUpdateElementPositions ? "canvas" : "canvas-disabled" : allFrameChildren && allFramePositionsSupported ? hasFlowLayoutParent ? "frame-disabled" : "frame" : "none";
	const alignCanvasPosition = (axis, alignment) => {
		if (positionAlignmentScope !== "canvas" || !onUpdateElementPositions) return;
		const targets = selectedElements ?? (rawElement ? [rawElement] : []);
		const items = targets.flatMap(_temp6$19);
		if (items.length !== targets.length) return;
		onUpdateElementPositions(alignCanvasSelection(items, axis, alignment));
	};
	const canDistributePosition = positionAlignmentScope === "canvas" && alignmentElements.length >= 3;
	const distributeCanvasPosition = (axis_0) => {
		if (!canDistributePosition || !onUpdateElementPositions) return;
		const targets_0 = selectedElements ?? (rawElement ? [rawElement] : []);
		const items_0 = targets_0.flatMap(_temp7$16);
		if (items_0.length !== targets_0.length) return;
		onUpdateElementPositions(distributeCanvasSelection(items_0, axis_0));
	};
	let t6;
	if ($[12] !== element) {
		t6 = editableProps(element);
		$[12] = element;
		$[13] = t6;
	} else t6 = $[13];
	const elementClassName = t6.className;
	const { resolve, get: resolveGet, computed, pendingClasses, findCanvasNodes } = usePropertyResolution(selectedElementId, element?.styles, !!isMultiSelect, elementClassName);
	const styles = element?.styles || {};
	const rawStyles = rawElement?.styles || {};
	const getMergedStyle = (prop) => {
		if (!isMultiSelect || !selectedElements) return (element?.styles)?.[prop] ?? computed[prop] ?? "";
		const result = getMergedValue(selectedElements, (el) => normalizePaddingStyles(el.styles)?.[prop]);
		return result === void 0 ? "" : result;
	};
	const get = (p) => {
		if (isMultiSelect) {
			const merged = getMergedStyle(p);
			if (isMixed(merged)) return "Mixed";
			return merged === void 0 ? "" : String(merged);
		}
		return resolveGet(p);
	};
	const getExplicit = (p_0) => {
		if (isMultiSelect) return get(p_0);
		const res = resolve(p_0);
		if (res.source === "inline" || res.source === "class") return res.value;
		return "";
	};
	const classNameOf = _temp8$12;
	const findInheritedColorClass = (startId) => {
		let curr = startId;
		while (curr && curr !== "ROOT") {
			const colorClass = classNameOf(getById(store, curr)).split(/\s+/).filter(Boolean).find(_temp9$10);
			if (colorClass) return {
				className: colorClass,
				ownerId: curr
			};
			curr = getParentId(store, curr);
		}
		return null;
	};
	const isTextContext = isTextOwner(store, selectedElementId);
	const inheritedColor = isTextContext ? findInheritedColorClass(selectedElementId) : null;
	const inheritedColorClass = inheritedColor?.className;
	const inheritedColorOwnerId = inheritedColor?.ownerId;
	const removeClassFromElement = (id, cls) => {
		if (readOnly || !onUpdateElementProps) return;
		const el_1 = getById(store, id);
		const props = (el_1 && "props" in el_1 ? el_1.props : void 0) ?? {};
		const updated = classNameOf(el_1).split(/\s+/).filter(Boolean).filter((c_0) => c_0 !== cls);
		onUpdateElementProps(id, {
			...props,
			className: updated.join(" ")
		});
	};
	const getSource = (p_1) => {
		const res_0 = resolve(p_1);
		if (res_0.source === "class" || res_0.source === "inline" && res_0.isOverride) return res_0;
		if (p_1 === "color" && inheritedColorClass) return {
			value: get("color"),
			source: "class",
			sourceClass: inheritedColorClass,
			inheritedOwnerId: inheritedColorOwnerId
		};
		return null;
	};
	const replaceClasses = (cls_0, add) => {
		if (readOnly) return;
		const toRemove = new Set(Array.isArray(cls_0) ? cls_0 : [cls_0]);
		const withAdded = (existing) => {
			const updated_0 = existing.filter((c_1) => !toRemove.has(c_1));
			for (const c_2 of add) if (!updated_0.includes(c_2)) updated_0.push(c_2);
			return updated_0;
		};
		if (isMultiSelect && onUpdateMultipleElementsProps && selectedElements) {
			const ids = new Set(selectedElements.map(_temp0$9));
			onUpdateMultipleElementsProps(ids, (currentProps) => {
				const existing_0 = (currentProps?.className || "").split(/\s+/).filter(Boolean);
				return {
					...currentProps,
					className: withAdded(existing_0).join(" ")
				};
			});
		} else if (onUpdateElementProps) {
			const currentProps_0 = isInlineTypographyEdit(textSelectionState, [...toRemove, ...add]) ? editableProps(element) : editableProps(rawElement);
			const existing_1 = (currentProps_0.className || "").split(/\s+/).filter(Boolean);
			onUpdateElementProps(selectedElementId, {
				...currentProps_0,
				className: withAdded(existing_1).join(" ")
			});
		}
	};
	const removeClass = (cls_1) => replaceClasses(cls_1, []);
	const sourceProps = (p_2) => {
		const src = getSource(p_2);
		if (!src) return {};
		const inheritedOwnerId = src.inheritedOwnerId;
		return {
			source: src.source,
			sourceClass: src.sourceClass,
			isPending: src.sourceClass ? pendingClasses.has(src.sourceClass) : false,
			onClearOverride: src.isOverride ? () => clear(p_2) : inheritedOwnerId && src.sourceClass ? () => removeClassFromElement(inheritedOwnerId, src.sourceClass) : src.source === "class" && src.sourceClass ? () => removeClass(src.sourceClass) : void 0
		};
	};
	const addClass = (cls_2) => {
		if (readOnly) return;
		const classNames = Array.isArray(cls_2) ? cls_2 : [cls_2];
		if (isMultiSelect && onUpdateMultipleElementsProps && selectedElements) {
			const ids_0 = new Set(selectedElements.map(_temp1$9));
			onUpdateMultipleElementsProps(ids_0, (currentProps_1) => {
				const merged_0 = smartMergeClasses((currentProps_1?.className || "").split(/\s+/).filter(Boolean), classNames);
				return {
					...currentProps_1,
					className: merged_0.join(" ")
				};
			});
		} else if (onUpdateElementProps) {
			const currentProps_2 = isInlineTypographyEdit(textSelectionState, classNames) ? editableProps(element) : editableProps(rawElement);
			const merged_1 = smartMergeClasses((currentProps_2.className || "").split(/\s+/).filter(Boolean), classNames);
			onUpdateElementProps(selectedElementId, {
				...currentProps_2,
				className: merged_1.join(" ")
			});
		}
	};
	const categoryInlineProps = {
		padding: [
			"padding",
			"paddingTop",
			"paddingRight",
			"paddingBottom",
			"paddingLeft"
		],
		"padding-x": ["paddingLeft", "paddingRight"],
		"padding-y": ["paddingTop", "paddingBottom"],
		"padding-top": ["paddingTop"],
		"padding-right": ["paddingRight"],
		"padding-bottom": ["paddingBottom"],
		"padding-left": ["paddingLeft"],
		margin: [
			"margin",
			"marginTop",
			"marginRight",
			"marginBottom",
			"marginLeft"
		],
		"margin-x": ["marginLeft", "marginRight"],
		"margin-y": ["marginTop", "marginBottom"],
		"margin-top": ["marginTop"],
		"margin-right": ["marginRight"],
		"margin-bottom": ["marginBottom"],
		"margin-left": ["marginLeft"],
		"border-width": [
			"borderWidth",
			"borderTopWidth",
			"borderRightWidth",
			"borderBottomWidth",
			"borderLeftWidth"
		],
		"border-color": [
			"borderColor",
			"borderTopColor",
			"borderRightColor",
			"borderBottomColor",
			"borderLeftColor"
		],
		"border-style": [
			"borderStyle",
			"borderTopStyle",
			"borderRightStyle",
			"borderBottomStyle",
			"borderLeftStyle"
		],
		"border-width-top": ["borderTopWidth"],
		"border-width-right": ["borderRightWidth"],
		"border-width-bottom": ["borderBottomWidth"],
		"border-width-left": ["borderLeftWidth"],
		"border-width-x": ["borderLeftWidth", "borderRightWidth"],
		"border-width-y": ["borderTopWidth", "borderBottomWidth"],
		"border-width-start": ["borderInlineStartWidth"],
		"border-width-end": ["borderInlineEndWidth"],
		"border-color-top": ["borderTopColor"],
		"border-color-right": ["borderRightColor"],
		"border-color-bottom": ["borderBottomColor"],
		"border-color-left": ["borderLeftColor"],
		"border-color-x": ["borderLeftColor", "borderRightColor"],
		"border-color-y": ["borderTopColor", "borderBottomColor"],
		"border-color-start": ["borderInlineStartColor"],
		"border-color-end": ["borderInlineEndColor"],
		"border-style-top": ["borderTopStyle"],
		"border-style-right": ["borderRightStyle"],
		"border-style-bottom": ["borderBottomStyle"],
		"border-style-left": ["borderLeftStyle"],
		"border-style-x": ["borderLeftStyle", "borderRightStyle"],
		"border-style-y": ["borderTopStyle", "borderBottomStyle"],
		"border-style-start": ["borderInlineStartStyle"],
		"border-style-end": ["borderInlineEndStyle"],
		"border-radius": [
			"borderRadius",
			"borderTopLeftRadius",
			"borderTopRightRadius",
			"borderBottomLeftRadius",
			"borderBottomRightRadius"
		],
		background: [
			"backgroundColor",
			"background",
			"backgroundImage"
		],
		"text-color": [
			"color",
			"backgroundImage",
			"backgroundClip",
			"WebkitBackgroundClip",
			"WebkitTextFillColor"
		],
		"text-size": ["fontSize"],
		"font-weight": ["fontWeight"],
		"font-family": ["fontFamily"],
		opacity: ["opacity"],
		gap: [
			"gap",
			"rowGap",
			"columnGap"
		],
		width: ["width"],
		height: ["height"]
	};
	const addClassForProperty = (cls_3, cssProp) => {
		addClass(cls_3);
		const cat = getTailwindCategory(cls_3);
		const propsToClear = /^border(Top|Right|Bottom|Left)(Width|Color|Style)$/.test(cssProp) ? [cssProp] : cat ? categoryInlineProps[cat] : null;
		if (propsToClear) {
			const toClear = propsToClear.filter((p_3) => has(p_3));
			if (toClear.length) clear(...toClear);
		} else if (has(cssProp)) clear(cssProp);
	};
	const getIsMixed = (p_4) => {
		if (textSelectionState?.isMixed[p_4]) return true;
		if (!isMultiSelect) return false;
		return isMixed(getMergedStyle(p_4));
	};
	const has = (p_5) => {
		if (isMultiSelect && selectedElements) return selectedElements.some((el_4) => {
			const s = el_4.styles;
			return s && p_5 in s && s[p_5] !== void 0 && s[p_5] !== "";
		});
		if (styles && p_5 in styles && styles[p_5] !== void 0 && styles[p_5] !== "") return true;
		return resolve(p_5).source === "class";
	};
	const hasAny = (...t7) => {
		return t7.some((p_6) => has(p_6));
	};
	const reconcileTextDescendants = (parentId, props_1) => {
		if (textSelectionState && !textSelectionState.isFull) return;
		const keys = scrubReconciled.claim(props_1.filter(_temp10$9));
		if (!keys.length) return;
		const ids_1 = /* @__PURE__ */ new Set();
		const walk = (id_0) => {
			for (const childId of getChildren$2(store, id_0)) {
				const child = getById(store, childId);
				const cs = child?.styles;
				if (child?.type === "text" && cs && keys.some((k) => k in cs)) ids_1.add(childId);
				walk(childId);
			}
		};
		walk(parentId);
		if (!ids_1.size) return;
		if (onUpdateMultipleElementsStyles) onUpdateMultipleElementsStyles(ids_1, (cur) => {
			const next = { ...cur };
			keys.forEach((k_0) => delete next[k_0]);
			return next;
		});
		else for (const id_1 of ids_1) {
			const cs_0 = { ...getById(store, id_1)?.styles ?? {} };
			keys.forEach((k_1) => delete cs_0[k_1]);
			onUpdateElementStyles(id_1, cs_0);
		}
	};
	const set = (p_8, v) => {
		if (readOnly) return;
		if (isMultiSelect && onUpdateMultipleElementsStyles && selectedElements) {
			const ids_2 = new Set(selectedElements.map(_temp11$8));
			onUpdateMultipleElementsStyles(ids_2, (currentStyles) => ({
				...paddingEditBase(currentStyles, { [p_8]: v }),
				[p_8]: v
			}));
		} else {
			const base = textSelectionState && TEXT_STYLE_KEYS.has(p_8) ? styles : rawStyles;
			onUpdateElementStyles(selectedElementId, {
				...paddingEditBase(base, { [p_8]: v }),
				[p_8]: v
			});
			reconcileTextDescendants(selectedElementId, [p_8]);
		}
	};
	const setMultiple = (updates) => {
		if (readOnly) return;
		const applyUpdates = (base_0) => mergePatch$1(paddingEditBase(base_0, updates) ?? {}, updates);
		if (isMultiSelect && onUpdateMultipleElementsStyles && selectedElements) {
			const ids_3 = new Set(selectedElements.map(_temp12$6));
			onUpdateMultipleElementsStyles(ids_3, (currentStyles_0) => applyUpdates(currentStyles_0));
		} else {
			const updateKeys = Object.keys(updates);
			const base_1 = textSelectionState && updateKeys.every(_temp13$6) ? styles : rawStyles;
			onUpdateElementStyles(selectedElementId, applyUpdates(base_1));
			reconcileTextDescendants(selectedElementId, updateKeys);
		}
	};
	const updateElement = onUpdateElement && !readOnly && !isMultiSelect ? (updater) => onUpdateElement(selectedElementId, updater) : void 0;
	const clear = (...t8) => {
		const props_2 = t8;
		if (readOnly) return;
		if (isMultiSelect && onUpdateMultipleElementsStyles && selectedElements) {
			const ids_4 = new Set(selectedElements.map(_temp14$6));
			onUpdateMultipleElementsStyles(ids_4, (currentStyles_1) => {
				const newStyles = { ...currentStyles_1 };
				props_2.forEach((p_9) => delete newStyles[p_9]);
				return newStyles;
			});
		} else {
			const newStyles_0 = { ...textSelectionState && props_2.every(_temp15$4) ? styles : rawStyles };
			props_2.forEach((p_11) => delete newStyles_0[p_11]);
			onUpdateElementStyles(selectedElementId, newStyles_0);
			reconcileTextDescendants(selectedElementId, props_2);
		}
	};
	const isFlex = isMultiSelect && selectedElements ? selectedElements.some(_temp16$4) : get("display") === "flex" || get("display") === "inline-flex";
	if (!element && !isMultiSelect) {
		let t9;
		if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
			t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-3 text-[12px] text-ed-muted-foreground",
				children: "No element selected"
			});
			$[14] = t9;
		} else t9 = $[14];
		return t9;
	}
	const removeClassesByCategory = (categories) => {
		const wanted = new Set(Array.isArray(categories) ? categories : [categories]);
		const toRemove_0 = (elementClassName ?? "").split(/\s+/).filter(Boolean).filter((c_3) => {
			const cat_0 = getTailwindCategory(c_3);
			return cat_0 ? wanted.has(cat_0) : false;
		});
		if (toRemove_0.length) removeClass(toRemove_0);
	};
	const styleOps = {
		get,
		getExplicit,
		getIsMixed,
		has,
		hasAny,
		computed,
		set,
		setMultiple,
		updateElement,
		clear,
		addClass,
		removeClass,
		replaceClasses,
		removeClassesByCategory,
		addClassForProperty,
		sourceProps,
		readOnly: !!readOnly,
		isMultiSelect: !!isMultiSelect,
		selectedElementId,
		element: rawElement,
		elementClassName: elementClassName ?? "",
		getStore: () => store,
		isTextContext,
		findCanvasNodes,
		onUpdateElementStyles,
		positionAlignmentScope,
		alignCanvasPosition,
		canDistributePosition,
		distributeCanvasPosition,
		isFlex,
		parentLayout,
		fonts,
		onToggleTextFormat
	};
	opsStore.stage(styleOps);
	let t9;
	if ($[15] !== element || $[16] !== selectedElements) {
		t9 = selectedElements ?? (element ? [element] : []);
		$[15] = element;
		$[16] = selectedElements;
		$[17] = t9;
	} else t9 = $[17];
	const scaleElements = t9;
	let t10;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionSection, {});
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] !== mediaOnly) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSection, { media: mediaOnly });
		$[19] = mediaOnly;
		$[20] = t11;
	} else t11 = $[20];
	let t12;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceSection, {});
		$[21] = t12;
	} else t12 = $[21];
	let t13;
	if ($[22] !== mediaOnly) {
		t13 = !mediaOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaddingSection, {});
		$[22] = mediaOnly;
		$[23] = t13;
	} else t13 = $[23];
	let t14;
	let t15;
	let t16;
	if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarginSection, {});
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusSection, {});
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSection, {});
		$[24] = t14;
		$[25] = t15;
		$[26] = t16;
	} else {
		t14 = $[24];
		t15 = $[25];
		t16 = $[26];
	}
	let t17;
	if ($[27] !== mediaOnly || $[28] !== selectedElements) {
		t17 = !mediaOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackgroundSection, { selectedElements });
		$[27] = mediaOnly;
		$[28] = selectedElements;
		$[29] = t17;
	} else t17 = $[29];
	let t18;
	let t19;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderSection, {});
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutlineSection, {});
		$[30] = t18;
		$[31] = t19;
	} else {
		t18 = $[30];
		t19 = $[31];
	}
	let t20;
	if ($[32] !== mediaOnly) {
		t20 = !mediaOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypographySection, {});
		$[32] = mediaOnly;
		$[33] = t20;
	} else t20 = $[33];
	let t21;
	let t22;
	if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShadowSection, {});
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FiltersSection, {});
		$[34] = t21;
		$[35] = t22;
	} else {
		t21 = $[34];
		t22 = $[35];
	}
	let t23;
	if ($[36] !== scaleElements || $[37] !== store) {
		t23 = selectionRootIds(store, scaleElements);
		$[36] = scaleElements;
		$[37] = store;
		$[38] = t23;
	} else t23 = $[38];
	let t24;
	if ($[39] !== onUpdateElementStyles || $[40] !== onUpdateMultipleElementsStyles || $[41] !== readOnly || $[42] !== store) {
		t24 = (transforms) => {
			if (readOnly || transforms.size === 0) return;
			if (onUpdateMultipleElementsStyles) onUpdateMultipleElementsStyles(new Set(transforms.keys()), (currentStyles_2, id_2) => {
				const next_0 = { ...currentStyles_2 };
				const transform = transforms.get(id_2);
				if (transform) next_0.transform = transform;
				else delete next_0.transform;
				return next_0;
			});
			else for (const [id_3, transform_0] of transforms) {
				const current = getById(store, id_3);
				if (current) {
					const next_1 = { ...current.styles };
					if (transform_0) next_1.transform = transform_0;
					else delete next_1.transform;
					onUpdateElementStyles(id_3, next_1);
				}
			}
		};
		$[39] = onUpdateElementStyles;
		$[40] = onUpdateMultipleElementsStyles;
		$[41] = readOnly;
		$[42] = store;
		$[43] = t24;
	} else t24 = $[43];
	let t25;
	if ($[44] !== scaleElements || $[45] !== t23 || $[46] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleSection, {
			elements: scaleElements,
			rootIds: t23,
			onApply: t24
		});
		$[44] = scaleElements;
		$[45] = t23;
		$[46] = t24;
		$[47] = t25;
	} else t25 = $[47];
	let t26;
	if ($[48] !== reconcilingScrubSession || $[49] !== t11 || $[50] !== t13 || $[51] !== t17 || $[52] !== t20 || $[53] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrubSessionContext.Provider, {
			value: reconcilingScrubSession,
			children: [
				t10,
				t11,
				t12,
				t13,
				t14,
				t15,
				t16,
				t17,
				t18,
				t19,
				t20,
				t21,
				t22,
				t25
			]
		});
		$[48] = reconcilingScrubSession;
		$[49] = t11;
		$[50] = t13;
		$[51] = t17;
		$[52] = t20;
		$[53] = t25;
		$[54] = t26;
	} else t26 = $[54];
	let t27;
	if ($[55] !== opsStore || $[56] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleOpsContext.Provider, {
			value: opsStore,
			children: t26
		});
		$[55] = opsStore;
		$[56] = t26;
		$[57] = t27;
	} else t27 = $[57];
	return t27;
}
/** Flow, size, flex alignment and gap, overflow and z-index. */
function _temp16$4(el_8) {
	const d = el_8.styles?.display;
	return d === "flex" || d === "inline-flex";
}
function _temp15$4(p_10) {
	return TEXT_STYLE_KEYS.has(p_10);
}
function _temp14$6(el_7) {
	return el_7.id;
}
function _temp13$6(k_2) {
	return TEXT_STYLE_KEYS.has(k_2);
}
function _temp12$6(el_6) {
	return el_6.id;
}
function _temp11$8(el_5) {
	return el_5.id;
}
function _temp10$9(p_7) {
	return TEXT_STYLE_KEYS.has(p_7);
}
function _temp1$9(el_3) {
	return el_3.id;
}
function _temp0$9(el_2) {
	return el_2.id;
}
function _temp9$10(c) {
	return getTailwindCategory(c) === "text-color";
}
function _temp8$12(el_0) {
	if (!el_0) return "";
	if ("props" in el_0) return String(el_0.props?.className ?? "");
	if (el_0.type === "text") return String(el_0.className ?? "");
	return "";
}
function _temp7$16(item_3) {
	const rect_0 = getCanvasSpaceRect(item_3.id);
	if (!rect_0) return [];
	return [{
		id: item_3.id,
		rect: rect_0,
		position: item_3.canvasPosition ?? {
			x: rect_0.x,
			y: rect_0.y
		}
	}];
}
function _temp6$19(item_2) {
	const rect = getCanvasSpaceRect(item_2.id);
	if (!rect) return [];
	return [{
		id: item_2.id,
		rect,
		position: item_2.canvasPosition ?? {
			x: rect.x,
			y: rect.y
		}
	}];
}
function _temp5$24(item_0) {
	return FRAME_ALIGNMENT_POSITIONS.has(String(item_0.styles?.position ?? "static"));
}
function _temp4$27(parent_0) {
	return parent_0 !== "ROOT" && parent_0 !== null;
}
function _temp3$28(parent) {
	return parent === "ROOT" || parent === null;
}
function _temp2$39() {
	return new ScrubReconciled();
}
function _temp$59() {
	return new StyleOpsStore();
}
function LayoutSection(t0) {
	const $ = (0, import_compiler_runtime.c)(82);
	const { media } = t0;
	const { get, set, setMultiple, has, isFlex } = useStyleOps();
	const [aspectLocked, setAspectLocked] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== get) {
		t1 = get("flexDirection");
		$[0] = get;
		$[1] = t1;
	} else t1 = $[1];
	const flexDir = t1;
	let t2;
	if ($[2] !== get) {
		t2 = get("flexWrap");
		$[2] = get;
		$[3] = t2;
	} else t2 = $[3];
	const flexWrap = t2;
	let t3;
	if ($[4] !== get) {
		t3 = get("alignItems");
		$[4] = get;
		$[5] = t3;
	} else t3 = $[5];
	const alignItems = t3;
	let T0;
	let overflowMode;
	let overflowOption;
	let t10;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[6] !== alignItems || $[7] !== aspectLocked || $[8] !== flexDir || $[9] !== flexWrap || $[10] !== get || $[11] !== has || $[12] !== isFlex || $[13] !== media || $[14] !== set || $[15] !== setMultiple) {
		const justifyContent = get("justifyContent");
		const resolvedOverflow = get("overflow");
		overflowMode = resolvedOverflow === "Mixed" ? null : resolvedOverflow === "hidden" || resolvedOverflow === "clip" ? "hidden" : resolvedOverflow === "scroll" || resolvedOverflow === "auto" ? "scroll" : "visible";
		let t11;
		if ($[26] !== overflowMode) {
			t11 = OVERFLOW_OPTIONS.find((option) => option.value === overflowMode);
			$[26] = overflowMode;
			$[27] = t11;
		} else t11 = $[27];
		overflowOption = t11;
		const isColumnDirection = flexDir === "column" || flexDir === "column-reverse";
		const distribution = asFlexDistribution(justifyContent);
		const isFlexWrapped = flexWrap === "wrap" || flexWrap === "wrap-reverse";
		const crossGapProperty = isColumnDirection ? "columnGap" : "rowGap";
		const getAlignment = () => {
			const valToPos = {
				"flex-start": 0,
				start: 0,
				normal: 0,
				stretch: 0,
				center: 1,
				"flex-end": 2,
				end: 2
			};
			if (isColumnDirection) return [distribution ? 1 : valToPos[justifyContent] ?? 0, valToPos[alignItems] ?? 0];
			else return [valToPos[alignItems] ?? 0, distribution ? 1 : valToPos[justifyContent] ?? 0];
		};
		const setAlignment = (row_1, col_1) => {
			const vals = [
				"flex-start",
				"center",
				"flex-end"
			];
			if (isColumnDirection) setMultiple({
				justifyContent: vals[row_1],
				alignItems: vals[col_1]
			});
			else setMultiple({
				alignItems: vals[row_1],
				justifyContent: vals[col_1]
			});
		};
		const setCrossAlignment = (row_2, col_2) => {
			set("alignItems", [
				"flex-start",
				"center",
				"flex-end"
			][isColumnDirection ? col_2 : row_2]);
		};
		const cycleDistribution = (row_3, col_3) => {
			const next = FLEX_DISTRIBUTIONS[distribution ? FLEX_DISTRIBUTIONS.indexOf(distribution) + 1 : 0];
			if (!next) {
				setAlignment(row_3, col_3);
				return;
			}
			setMultiple({
				justifyContent: next,
				alignItems: [
					"flex-start",
					"center",
					"flex-end"
				][isColumnDirection ? col_3 : row_3]
			});
		};
		const [alignRow, alignCol] = getAlignment();
		T0 = InspectorSection;
		t8 = "Layout";
		t9 = true;
		if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
			t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionalDimensionFieldsMenu, {});
			$[28] = t10;
		} else t10 = $[28];
		t4 = "flex flex-col gap-2";
		if ($[29] !== isFlex || $[30] !== media) {
			t5 = !media && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Flow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
					action: isFlex ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WrapToggleButton, {}) : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowToggleGroup, {})
				})]
			});
			$[29] = isFlex;
			$[30] = media;
			$[31] = t5;
		} else t5 = $[31];
		let t12;
		if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
			t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Dimensions" });
			$[32] = t12;
		} else t12 = $[32];
		const t13 = aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio";
		let t14;
		if ($[33] !== aspectLocked) {
			t14 = () => setAspectLocked(!aspectLocked);
			$[33] = aspectLocked;
			$[34] = t14;
		} else t14 = $[34];
		let t15;
		if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
			t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockAspectRatioIcon, {});
			$[35] = t15;
		} else t15 = $[35];
		let t16;
		if ($[36] !== aspectLocked || $[37] !== t13 || $[38] !== t14) {
			t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: t13,
				active: aspectLocked,
				onClick: t14,
				children: t15
			});
			$[36] = aspectLocked;
			$[37] = t13;
			$[38] = t14;
			$[39] = t16;
		} else t16 = $[39];
		let t17;
		if ($[40] !== aspectLocked) {
			t17 = aspectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute left-1/2 top-1/2 z-10 h-1.5 w-2 -translate-x-1/2 -translate-y-1/2 bg-ed-field" });
			$[40] = aspectLocked;
			$[41] = t17;
		} else t17 = $[41];
		let t18;
		let t19;
		if ($[42] !== aspectLocked) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleDimensionInput, {
				label: "W",
				property: "width",
				aspectLocked
			});
			t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleDimensionInput, {
				label: "H",
				property: "height",
				aspectLocked
			});
			$[42] = aspectLocked;
			$[43] = t18;
			$[44] = t19;
		} else {
			t18 = $[43];
			t19 = $[44];
		}
		let t20;
		if ($[45] !== t17 || $[46] !== t18 || $[47] !== t19) {
			t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MergeableFields, {
				className: "relative grid min-w-0 grid-cols-2 gap-2",
				properties: DIMENSION_KEYS,
				label: "Width and height",
				field: MergedDimensionInput,
				children: [
					t17,
					t18,
					t19
				]
			});
			$[45] = t17;
			$[46] = t18;
			$[47] = t19;
			$[48] = t20;
		} else t20 = $[48];
		let t21;
		if ($[49] !== t16 || $[50] !== t20) {
			t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [t12, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
					action: t16,
					children: t20
				})]
			});
			$[49] = t16;
			$[50] = t20;
			$[51] = t21;
		} else t21 = $[51];
		let t22;
		if ($[52] !== has || $[53] !== set) {
			t22 = (has("maxWidth") || has("maxHeight")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 gap-2",
				children: [has("maxWidth") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutMinMaxInput, {
					property: "maxWidth",
					placeholder: "none",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaxWidthIcon, { className: "text-ed-muted-foreground" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutAddButton, {
					label: "Max Width",
					onClick: () => set("maxWidth", "100%")
				}), has("maxHeight") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutMinMaxInput, {
					property: "maxHeight",
					placeholder: "none",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(e$18, {
						size: 15,
						className: "text-ed-muted-foreground"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutAddButton, {
					label: "Max Height",
					onClick: () => set("maxHeight", "100%")
				})]
			});
			$[52] = has;
			$[53] = set;
			$[54] = t22;
		} else t22 = $[54];
		let t23;
		if ($[55] !== has || $[56] !== set) {
			t23 = (has("minWidth") || has("minHeight")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 gap-2",
				children: [has("minWidth") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutMinMaxInput, {
					property: "minWidth",
					placeholder: "0",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r$10, {
						size: 15,
						className: "text-ed-muted-foreground"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutAddButton, {
					label: "Min Width",
					onClick: () => set("minWidth", "0px")
				}), has("minHeight") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutMinMaxInput, {
					property: "minHeight",
					placeholder: "0",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(e$19, {
						size: 15,
						className: "text-ed-muted-foreground"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutAddButton, {
					label: "Min Height",
					onClick: () => set("minHeight", "0px")
				})]
			});
			$[55] = has;
			$[56] = set;
			$[57] = t23;
		} else t23 = $[57];
		if ($[58] !== t21 || $[59] !== t22 || $[60] !== t23) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					t21,
					t22,
					t23
				]
			});
			$[58] = t21;
			$[59] = t22;
			$[60] = t23;
			$[61] = t6;
		} else t6 = $[61];
		t7 = isFlex && !media && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Alignment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn$2("grid h-[60px] w-full grid-cols-3 grid-rows-3 overflow-hidden bg-ed-muted py-1", "rounded-[5px]"),
					children: [
						0,
						1,
						2
					].map((row_4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: [
						0,
						1,
						2
					].map((col_4) => {
						const isActive = alignRow === row_4 && alignCol === col_4;
						const isDistributedItem = !!distribution && (isColumnDirection ? col_4 === alignCol : row_4 === alignRow);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Set alignment; double-click to cycle distribution",
							onClick: () => {
								if (isDistributedItem) return;
								if (distribution) setCrossAlignment(row_4, col_4);
								else setAlignment(row_4, col_4);
							},
							onDoubleClick: () => cycleDistribution(row_4, col_4),
							className: cn$2("group/alignment-cell flex h-full w-full items-center justify-center rounded p-0", isDistributedItem || !distribution && isActive ? "text-ed-foreground" : "text-ed-foreground-secondary"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-3.75 shrink-0 items-center justify-center",
								children: distribution && isDistributedItem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributedItemLine, {
									direction: isColumnDirection ? "column" : "row",
									index: isColumnDirection ? row_4 : col_4,
									mode: distribution
								}) : isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexAlignmentGlyph, {
									direction: isColumnDirection ? "column" : "row",
									row: row_4,
									col: col_4
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-0.5 rounded-full bg-current opacity-50 group-hover/alignment-cell:hidden" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-ed-foreground-secondary group-hover/alignment-cell:flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignmentCellGlyph, {
										direction: isColumnDirection ? "column" : "row",
										row: row_4,
										col: col_4,
										distribution
									})
								})] })
							})
						}, `${row_4}-${col_4}`);
					}) }, row_4))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-2 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Gap" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexMainAxisGapInput, {}),
						isFlexWrapped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
							property: crossGapProperty,
							modeOptions: [{
								value: "normal",
								label: "Normal"
							}],
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GapIcon, { className: cn$2("size-3.75 shrink-0", isColumnDirection && "rotate-90") })
						})
					]
				})
			})]
		});
		$[6] = alignItems;
		$[7] = aspectLocked;
		$[8] = flexDir;
		$[9] = flexWrap;
		$[10] = get;
		$[11] = has;
		$[12] = isFlex;
		$[13] = media;
		$[14] = set;
		$[15] = setMultiple;
		$[16] = T0;
		$[17] = overflowMode;
		$[18] = overflowOption;
		$[19] = t10;
		$[20] = t4;
		$[21] = t5;
		$[22] = t6;
		$[23] = t7;
		$[24] = t8;
		$[25] = t9;
	} else {
		T0 = $[16];
		overflowMode = $[17];
		overflowOption = $[18];
		t10 = $[19];
		t4 = $[20];
		t5 = $[21];
		t6 = $[22];
		t7 = $[23];
		t8 = $[24];
		t9 = $[25];
	}
	let t11;
	if ($[62] !== media || $[63] !== overflowMode || $[64] !== overflowOption || $[65] !== setMultiple) {
		t11 = !media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label: "Overflow",
			value: overflowOption ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CropIcon, { className: "size-4 shrink-0 text-ed-inspector-chrome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: overflowOption.label
				})]
			}) : "-",
			className: "min-w-0 flex-1",
			selectedValue: overflowMode ?? "visible",
			isMixed: overflowMode === null,
			options: OVERFLOW_OPTIONS,
			onValueChange: (value) => setMultiple({
				overflow: value,
				overflowX: void 0,
				overflowY: void 0
			})
		});
		$[62] = media;
		$[63] = overflowMode;
		$[64] = overflowOption;
		$[65] = setMultiple;
		$[66] = t11;
	} else t11 = $[66];
	let t12;
	if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "group",
			"aria-label": "Z index",
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
				property: "zIndex",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZIndexIcon, { className: "!size-3.5 text-ed-inspector-chrome" }),
				placeholder: "Auto",
				unit: "",
				inputClassName: "capitalize"
			})
		});
		$[67] = t12;
	} else t12 = $[67];
	let t13;
	if ($[68] !== t11) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 gap-2",
			children: [t11, t12]
		});
		$[68] = t11;
		$[69] = t13;
	} else t13 = $[69];
	let t14;
	if ($[70] !== t13 || $[71] !== t4 || $[72] !== t5 || $[73] !== t6 || $[74] !== t7) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t4,
			children: [
				t5,
				t6,
				t7,
				t13
			]
		});
		$[70] = t13;
		$[71] = t4;
		$[72] = t5;
		$[73] = t6;
		$[74] = t7;
		$[75] = t14;
	} else t14 = $[75];
	let t15;
	if ($[76] !== T0 || $[77] !== t10 || $[78] !== t14 || $[79] !== t8 || $[80] !== t9) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			title: t8,
			reserveActionRail: t9,
			action: t10,
			children: t14
		});
		$[76] = T0;
		$[77] = t10;
		$[78] = t14;
		$[79] = t8;
		$[80] = t9;
		$[81] = t15;
	} else t15 = $[81];
	return t15;
}

export { DesignTab };
