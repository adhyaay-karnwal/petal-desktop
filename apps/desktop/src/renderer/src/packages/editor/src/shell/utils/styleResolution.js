// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/styleResolution.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { parseTailwindClass } from "../../shared/utils/tailwindScale.js";
import { normalizePaddingStyles } from "../../shared/utils/paddingStyles.js";
import { getCascadeBatch } from "./computedStyles.js";
import { getClassIndex } from "./classIndex.js";

/**
* Style resolution engine.
* Determines where a CSS property's value comes from (inline, class, computed).
*/
var DESIGN_PROPERTIES = [
	"display",
	"flexDirection",
	"flexWrap",
	"alignItems",
	"justifyContent",
	"width",
	"height",
	"minWidth",
	"maxWidth",
	"minHeight",
	"maxHeight",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"marginTop",
	"marginRight",
	"marginBottom",
	"marginLeft",
	"gap",
	"rowGap",
	"columnGap",
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"zIndex",
	"backgroundColor",
	"borderWidth",
	"borderColor",
	"borderStyle",
	"borderTopWidth",
	"borderRightWidth",
	"borderBottomWidth",
	"borderLeftWidth",
	"borderTopColor",
	"borderRightColor",
	"borderBottomColor",
	"borderLeftColor",
	"borderTopStyle",
	"borderRightStyle",
	"borderBottomStyle",
	"borderLeftStyle",
	"borderRadius",
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius",
	"color",
	"fontFamily",
	"fontSize",
	"fontWeight",
	"textAlign",
	"lineHeight",
	"opacity",
	"overflow",
	"overflowX",
	"overflowY",
	"visibility",
	"flex",
	"flexGrow",
	"flexShrink",
	"flexBasis",
	"boxShadow",
	"outlineWidth",
	"outlineColor",
	"outlineStyle",
	"outlineOffset",
	"filter",
	"backdropFilter",
	"WebkitBackdropFilter"
];
var INLINE_SHORTHAND = {
	paddingTop: {
		shorthand: "padding",
		side: 0
	},
	paddingRight: {
		shorthand: "padding",
		side: 1
	},
	paddingBottom: {
		shorthand: "padding",
		side: 2
	},
	paddingLeft: {
		shorthand: "padding",
		side: 3
	},
	marginTop: {
		shorthand: "margin",
		side: 0
	},
	marginRight: {
		shorthand: "margin",
		side: 1
	},
	marginBottom: {
		shorthand: "margin",
		side: 2
	},
	marginLeft: {
		shorthand: "margin",
		side: 3
	},
	borderTopLeftRadius: {
		shorthand: "borderRadius",
		side: 0
	},
	borderTopRightRadius: {
		shorthand: "borderRadius",
		side: 1
	},
	borderBottomRightRadius: {
		shorthand: "borderRadius",
		side: 2
	},
	borderBottomLeftRadius: {
		shorthand: "borderRadius",
		side: 3
	}
};
/**
* Expand a 1-4 value box shorthand to its four corners/sides.
* Returns the value at `side` (0=top, 1=right, 2=bottom, 3=left), or null if
* the shorthand contains anything fancier (functions, calc, etc).
*/
function expandBoxShorthand(shorthand, side) {
	const trimmed = String(shorthand).trim();
	if (!trimmed) return null;
	if (/[(),/]/.test(trimmed)) return null;
	const parts = trimmed.split(/\s+/);
	switch (parts.length) {
		case 1: return parts[0];
		case 2: return parts[side % 2];
		case 3: return [
			parts[0],
			parts[1],
			parts[2],
			parts[1]
		][side];
		case 4: return parts[side];
		default: return null;
	}
}
function inlineShorthandValue(styles, prop) {
	if (prop === "rowGap" || prop === "columnGap") {
		const gap = styles.gap;
		if (gap === void 0 || gap === "") return null;
		const parts = String(gap).trim().split(/\s+/);
		if (parts.length === 1) return parts[0];
		if (parts.length === 2) return prop === "rowGap" ? parts[0] : parts[1];
		return null;
	}
	const entry = INLINE_SHORTHAND[prop];
	if (!entry) return null;
	const v = styles[entry.shorthand];
	if (v === void 0 || v === "") return null;
	return expandBoxShorthand(String(v), entry.side);
}
var RELATED = {
	paddingTop: ["paddingBlock", "padding"],
	paddingBottom: ["paddingBlock", "padding"],
	paddingLeft: ["paddingInline", "padding"],
	paddingRight: ["paddingInline", "padding"],
	marginTop: ["marginBlock", "margin"],
	marginBottom: ["marginBlock", "margin"],
	marginLeft: ["marginInline", "margin"],
	marginRight: ["marginInline", "margin"],
	borderRadius: [
		"borderStartStartRadius",
		"borderStartEndRadius",
		"borderEndStartRadius",
		"borderEndEndRadius"
	],
	borderTopLeftRadius: ["borderStartStartRadius", "borderRadius"],
	borderTopRightRadius: ["borderStartEndRadius", "borderRadius"],
	borderBottomLeftRadius: ["borderEndStartRadius", "borderRadius"],
	borderBottomRightRadius: ["borderEndEndRadius", "borderRadius"],
	rowGap: ["gap"],
	columnGap: ["gap"]
};
/** Look up a property in the cascade map, checking related/shorthand keys too. */
function cascadeLookup(map, prop) {
	if (!map) return void 0;
	let entry = map.get(prop);
	if (!entry && RELATED[prop]) for (const related of RELATED[prop]) {
		entry = map.get(related);
		if (entry) break;
	}
	return entry;
}
/**
* Finds an element's canvas nodes with one document-wide query per element:
* the last result is reused while all of its nodes are still in the document,
* so edits that keep the nodes mounted don't re-scan the canvas.
*/
function useCanvasNodeLookup() {
	const $ = (0, import_compiler_runtime.c)(1);
	const cacheRef = (0, import_react.useRef)(null);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = (elementId) => {
			const cached = cacheRef.current;
			if (cached?.elementId === elementId && cached.nodes.length > 0 && cached.nodes.every(_temp$81)) return cached.nodes;
			const nodes = Array.from(document.querySelectorAll(`[data-element-id="${CSS.escape(elementId)}"]`));
			cacheRef.current = {
				elementId,
				nodes
			};
			return nodes;
		};
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
/** The element's own node: skip the drag-overlay copy and the draggable media wrapper. */
function _temp$81(node) {
	return node.isConnected;
}
function getActualDomElement(nodes) {
	for (let i = nodes.length - 1; i >= 0; i--) {
		const el = nodes[i];
		if (el.closest("[data-drag-overlay]")) continue;
		if (el.getAttribute("role") === "button" && el.getAttribute("aria-roledescription") === "draggable") continue;
		return el;
	}
	return null;
}
/** DESIGN_PROPERTIES as the browser resolved them, or null when the element has no node. */
function readComputedStyles(nodes) {
	const el = getActualDomElement(nodes);
	if (!el) return null;
	const cs = window.getComputedStyle(el);
	const comp = {};
	for (const prop of DESIGN_PROPERTIES) comp[prop] = cs[prop] ?? "";
	return comp;
}
function sameComputed(a, b) {
	for (const prop of DESIGN_PROPERTIES) if (a[prop] !== b[prop]) return false;
	return true;
}
var EMPTY_CLASS_INDEX = [];
var EMPTY_PENDING = /* @__PURE__ */ new Set();
function subscribeProjectCss(onStoreChange) {
	window.addEventListener("petal-css-updated", onStoreChange);
	return () => window.removeEventListener("petal-css-updated", onStoreChange);
}
function getProjectClassIndex() {
	return getClassIndex(document);
}
function getServerClassIndex() {
	return EMPTY_CLASS_INDEX;
}
function buildClassCascade(selectedElementId, className, index) {
	if (!selectedElementId) return {
		cascadeMap: null,
		cascadeByClass: null,
		pendingClasses: EMPTY_PENDING
	};
	const classes = className ? className.split(/\s+/).filter(Boolean) : [];
	if (classes.length === 0) return {
		cascadeMap: null,
		cascadeByClass: null,
		pendingClasses: EMPTY_PENDING
	};
	const { map, byClass } = getCascadeBatch(classes, index);
	const pending = /* @__PURE__ */ new Set();
	for (const cls of classes) {
		if (byClass.has(cls)) continue;
		const parsed = parseTailwindClass(cls);
		if (!parsed) continue;
		pending.add(cls);
		const classProps = [];
		for (const [prop, value] of Object.entries(parsed)) {
			const alreadyOwned = map.has(prop);
			if (!alreadyOwned) map.set(prop, {
				className: cls,
				value
			});
			classProps.push({
				prop,
				value,
				overridden: alreadyOwned
			});
		}
		byClass.set(cls, classProps);
	}
	return {
		cascadeMap: map,
		cascadeByClass: byClass,
		pendingClasses: pending
	};
}
function usePropertyResolution(selectedElementId, elementStyles, isMultiSelect, className) {
	const $ = (0, import_compiler_runtime.c)(42);
	const classIndex = (0, import_react.useSyncExternalStore)(subscribeProjectCss, getProjectClassIndex, getServerClassIndex);
	let t0;
	if ($[0] !== classIndex || $[1] !== className || $[2] !== selectedElementId) {
		t0 = buildClassCascade(selectedElementId, className, classIndex);
		$[0] = classIndex;
		$[1] = className;
		$[2] = selectedElementId;
		$[3] = t0;
	} else t0 = $[3];
	const { cascadeMap, cascadeByClass, pendingClasses } = t0;
	const findCanvasNodes = useCanvasNodeLookup();
	const [measured, setMeasured] = (0, import_react.useState)(null);
	let t1;
	if ($[4] !== findCanvasNodes || $[5] !== measured?.id || $[6] !== selectedElementId) {
		t1 = selectedElementId && measured?.id !== selectedElementId ? readComputedStyles(findCanvasNodes(selectedElementId)) ?? {} : null;
		$[4] = findCanvasNodes;
		$[5] = measured?.id;
		$[6] = selectedElementId;
		$[7] = t1;
	} else t1 = $[7];
	const selected = t1;
	let t2;
	if ($[8] !== measured || $[9] !== selected || $[10] !== selectedElementId) {
		t2 = measured && measured.id === selectedElementId ? measured.values : selected ?? {};
		$[8] = measured;
		$[9] = selected;
		$[10] = selectedElementId;
		$[11] = t2;
	} else t2 = $[11];
	const computedStyles = t2;
	let t3;
	if ($[12] !== elementStyles) {
		t3 = JSON.stringify(elementStyles || {});
		$[12] = elementStyles;
		$[13] = t3;
	} else t3 = $[13];
	const stylesJson = t3;
	let t4;
	if ($[14] !== findCanvasNodes || $[15] !== selectedElementId) {
		t4 = () => {
			if (!selectedElementId) return;
			const rafId = requestAnimationFrame(() => {
				const comp = readComputedStyles(findCanvasNodes(selectedElementId));
				if (!comp) {
					const editable = document.querySelector("[data-canvas-content] .ProseMirror");
					const color = editable ? window.getComputedStyle(editable).color : "";
					if (color) setMeasured((prev) => {
						const base = prev?.id === selectedElementId ? prev.values : {};
						return base.color === color ? prev : {
							id: selectedElementId,
							values: {
								...base,
								color
							}
						};
					});
					return;
				}
				setMeasured((prev_0) => {
					return sameComputed(prev_0?.id === selectedElementId ? prev_0.values : {}, comp) ? prev_0 : {
						id: selectedElementId,
						values: comp
					};
				});
			});
			return () => cancelAnimationFrame(rafId);
		};
		$[14] = findCanvasNodes;
		$[15] = selectedElementId;
		$[16] = t4;
	} else t4 = $[16];
	let t5;
	if ($[17] !== classIndex || $[18] !== className || $[19] !== findCanvasNodes || $[20] !== isMultiSelect || $[21] !== selectedElementId || $[22] !== stylesJson) {
		t5 = [
			selectedElementId,
			stylesJson,
			isMultiSelect,
			className,
			classIndex,
			findCanvasNodes
		];
		$[17] = classIndex;
		$[18] = className;
		$[19] = findCanvasNodes;
		$[20] = isMultiSelect;
		$[21] = selectedElementId;
		$[22] = stylesJson;
		$[23] = t5;
	} else t5 = $[23];
	(0, import_react.useEffect)(t4, t5);
	let t6;
	if ($[24] !== elementStyles) {
		t6 = normalizePaddingStyles(elementStyles) || {};
		$[24] = elementStyles;
		$[25] = t6;
	} else t6 = $[25];
	const styles = t6;
	let t7;
	if ($[26] !== cascadeMap || $[27] !== computedStyles || $[28] !== styles) {
		t7 = (prop) => {
			const inlineValue = styles[prop];
			const hasInline = inlineValue !== void 0 && inlineValue !== "";
			const cascadeSource = cascadeLookup(cascadeMap, prop);
			if (hasInline) return {
				value: String(inlineValue),
				source: "inline",
				isOverride: !!cascadeSource,
				sourceClass: cascadeSource?.className
			};
			const fromShorthand = inlineShorthandValue(styles, prop);
			if (fromShorthand) return {
				value: fromShorthand,
				source: "inline",
				isOverride: !!cascadeSource,
				sourceClass: cascadeSource?.className
			};
			if (cascadeSource) return {
				value: cascadeSource.value,
				source: "class",
				sourceClass: cascadeSource.className
			};
			const computedValue = computedStyles[prop];
			if (computedValue) return {
				value: computedValue,
				source: "computed"
			};
			return {
				value: "",
				source: "unset"
			};
		};
		$[26] = cascadeMap;
		$[27] = computedStyles;
		$[28] = styles;
		$[29] = t7;
	} else t7 = $[29];
	const resolve = t7;
	let t8;
	if ($[30] !== cascadeMap || $[31] !== computedStyles || $[32] !== styles) {
		t8 = (prop_0) => {
			const inlineValue_0 = styles[prop_0];
			if (inlineValue_0 !== void 0 && inlineValue_0 !== "") return String(inlineValue_0);
			const fromShorthand_0 = inlineShorthandValue(styles, prop_0);
			if (fromShorthand_0) return fromShorthand_0;
			if (computedStyles[prop_0]) return computedStyles[prop_0];
			const cascadeSource_0 = cascadeLookup(cascadeMap, prop_0);
			if (cascadeSource_0) return cascadeSource_0.value;
			return "";
		};
		$[30] = cascadeMap;
		$[31] = computedStyles;
		$[32] = styles;
		$[33] = t8;
	} else t8 = $[33];
	const get = t8;
	let t9;
	if ($[34] !== cascadeByClass || $[35] !== cascadeMap || $[36] !== computedStyles || $[37] !== findCanvasNodes || $[38] !== get || $[39] !== pendingClasses || $[40] !== resolve) {
		t9 = {
			resolve,
			get,
			computed: computedStyles,
			cascadeMap,
			cascadeByClass,
			pendingClasses,
			findCanvasNodes
		};
		$[34] = cascadeByClass;
		$[35] = cascadeMap;
		$[36] = computedStyles;
		$[37] = findCanvasNodes;
		$[38] = get;
		$[39] = pendingClasses;
		$[40] = resolve;
		$[41] = t9;
	} else t9 = $[41];
	return t9;
}

export { usePropertyResolution };
