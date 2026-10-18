// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/tabs/CodeView.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { camelToKebab } from "../../../../utils/computedStyles.js";
import { usePropertyResolution } from "../../../../utils/styleResolution.js";
import { getMergedValue, isMixed } from "../../../../utils/multiSelect.js";
import { CopyCSSButton } from "./CopyCSSButton.js";
import { ClassStyles } from "./ClassStyles.js";
import { ClassesTab, orderedClassRules } from "./ClassesTab.js";

function hasValue(value) {
	return value !== void 0 && value !== "";
}
function elementDeclarations(element, selectedElements) {
	if (selectedElements && selectedElements.length > 1) {
		const props = /* @__PURE__ */ new Set();
		for (const el of selectedElements) for (const prop of Object.keys(el.styles ?? {})) props.add(prop);
		const declarations = [];
		for (const prop of Array.from(props).sort()) {
			const merged = getMergedValue(selectedElements, (el) => el.styles?.[prop]);
			if (isMixed(merged)) declarations.push({
				prop,
				value: "Mixed",
				overridden: false
			});
			else if (hasValue(merged)) declarations.push({
				prop,
				value: String(merged),
				overridden: false
			});
		}
		return declarations;
	}
	return Object.entries(element?.styles ?? {}).filter(([, value]) => hasValue(value)).map(([prop, value]) => ({
		prop,
		value: String(value),
		overridden: false
	}));
}
function declarationLines(declarations, indent = "") {
	return Array.from(declarations, ([prop, value]) => `${indent}${camelToKebab(prop)}: ${value};`).join("\n");
}
/**
* The selection's effective styles as one declaration list: class rules in
* cascade order with element styles on top, then each variant (hover, etc.)
* as a nested `&:variant` block. Overridden class declarations are left out.
*/
function resolvedCss(elementDeclarations, classRules) {
	const base = /* @__PURE__ */ new Map();
	const variants = /* @__PURE__ */ new Map();
	for (const { declarations = [] } of [...classRules].reverse()) for (const { prop, value, variant, overridden } of declarations) {
		if (overridden) continue;
		if (!variant) {
			base.set(prop, value);
			continue;
		}
		const group = variants.get(variant) ?? /* @__PURE__ */ new Map();
		group.set(prop, value);
		variants.set(variant, group);
	}
	for (const { prop, value } of elementDeclarations) base.set(prop, value);
	const blocks = [declarationLines(base)];
	for (const [variant, group] of variants) blocks.push(`&:${variant} {\n${declarationLines(group, "  ")}\n}`);
	return blocks.filter(Boolean).join("\n\n");
}
function CodeView(t0) {
	const $ = (0, import_compiler_runtime.c)(27);
	const { element, selectedElementId, selectedElements } = t0;
	const isMultiSelect = selectedElements && selectedElements.length > 1;
	const elementClassName = element?.props?.className;
	const resolution = usePropertyResolution(selectedElementId, element?.styles, !!isMultiSelect, elementClassName);
	if (!element && !isMultiSelect) {
		let t1;
		if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-3 text-[11px] text-ed-muted-foreground",
				children: "No element selected"
			});
			$[0] = t1;
		} else t1 = $[0];
		return t1;
	}
	let css;
	let declarations;
	let t1;
	if ($[1] !== element || $[2] !== resolution.cascadeByClass || $[3] !== selectedElements) {
		declarations = elementDeclarations(element, selectedElements);
		css = declarations.map(_temp$78).join("\n");
		let t2;
		if ($[7] !== resolution.cascadeByClass) {
			t2 = (t3) => {
				const { cls } = t3;
				return {
					cls,
					declarations: resolution.cascadeByClass?.get(cls)
				};
			};
			$[7] = resolution.cascadeByClass;
			$[8] = t2;
		} else t2 = $[8];
		t1 = resolvedCss(declarations, orderedClassRules(element, selectedElements, resolution.cascadeByClass).map(t2));
		$[1] = element;
		$[2] = resolution.cascadeByClass;
		$[3] = selectedElements;
		$[4] = css;
		$[5] = declarations;
		$[6] = t1;
	} else {
		css = $[4];
		declarations = $[5];
		t1 = $[6];
	}
	const allCss = t1;
	let t2;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-ed-muted-foreground",
			children: "CSS"
		});
		$[9] = t2;
	} else t2 = $[9];
	let t3;
	if ($[10] !== allCss) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-6 items-center justify-between border-b border-ed-divider px-3 py-2 text-[11px]",
			children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCSSButton, {
				label: "Copy all styles",
				css: allCss,
				alwaysVisible: true
			})]
		});
		$[10] = allCss;
		$[11] = t3;
	} else t3 = $[11];
	let t4;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ed-muted-foreground",
				children: "element.style"
			}), " {"]
		});
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== css) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-6 items-center justify-between",
			children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCSSButton, {
				label: "Copy element styles",
				css
			})]
		});
		$[13] = css;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== declarations) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pl-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassStyles, {
				declarations,
				emptyMessage: "No element styles."
			})
		});
		$[15] = declarations;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono",
			children: "}"
		});
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== t5 || $[19] !== t6) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "group/class-rule border-b border-ed-divider px-3 py-2 text-[11px] text-ed-foreground",
			"aria-label": "Element styles",
			children: [
				t5,
				t6,
				t7
			]
		});
		$[18] = t5;
		$[19] = t6;
		$[20] = t8;
	} else t8 = $[20];
	let t9;
	if ($[21] !== element || $[22] !== resolution.cascadeByClass || $[23] !== selectedElements || $[24] !== t3 || $[25] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ClassesTab, {
			cascadeByClass: resolution.cascadeByClass,
			element,
			selectedElements,
			children: [t3, t8]
		});
		$[21] = element;
		$[22] = resolution.cascadeByClass;
		$[23] = selectedElements;
		$[24] = t3;
		$[25] = t8;
		$[26] = t9;
	} else t9 = $[26];
	return t9;
}
function _temp$78(t0) {
	const { prop, value } = t0;
	return `${camelToKebab(prop)}: ${value};`;
}

export { CodeView };
