// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/tabs/ClassesTab.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { ScrollArea } from "../../../../../../../ui/src/components/ScrollArea.js";
import { camelToKebab } from "../../../../utils/computedStyles.js";
import { CopyCSSButton } from "./CopyCSSButton.js";
import { ClassStyles } from "./ClassStyles.js";

/**
* Classes list — read-only CSS rules for each class on the selected
* element(s), stacked in reverse source order so the winning rule is first.
*/
function ClassStyleRow(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { declarations, inlineStyles, className, count, total } = t0;
	const t1 = `.${className}`;
	let t2;
	if ($[0] !== className) {
		t2 = typeof CSS === "undefined" ? className : CSS.escape(className);
		$[0] = className;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 break-words font-mono",
			children: [
				".",
				t2,
				" {"
			]
		});
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== count || $[5] !== total) {
		t4 = count < total && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-ed-muted-foreground",
			children: [
				count,
				"/",
				total
			]
		});
		$[4] = count;
		$[5] = total;
		$[6] = t4;
	} else t4 = $[6];
	const t5 = `Copy ${className} CSS`;
	let t6;
	if ($[7] !== declarations) {
		t6 = declarations?.map(_temp$79).join("\n") ?? "";
		$[7] = declarations;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t5 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCSSButton, {
			label: t5,
			css: t6
		});
		$[9] = t5;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== t4 || $[13] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1",
			children: [t4, t7]
		});
		$[12] = t4;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	let t9;
	if ($[15] !== t3 || $[16] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-6 items-center justify-between gap-2",
			children: [t3, t8]
		});
		$[15] = t3;
		$[16] = t8;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== declarations || $[19] !== inlineStyles) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pl-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassStyles, {
				declarations,
				inlineStyles
			})
		});
		$[18] = declarations;
		$[19] = inlineStyles;
		$[20] = t10;
	} else t10 = $[20];
	let t11;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono",
			children: "}"
		});
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== t1 || $[23] !== t10 || $[24] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "group/class-rule w-full min-w-0 border-b border-ed-divider px-3 py-2 text-[11px] text-ed-foreground",
			"aria-label": t1,
			children: [
				t9,
				t10,
				t11
			]
		});
		$[22] = t1;
		$[23] = t10;
		$[24] = t9;
		$[25] = t12;
	} else t12 = $[25];
	return t12;
}
function _temp$79(t0) {
	const { prop, value } = t0;
	return `${camelToKebab(prop)}: ${value};`;
}
/**
* Classes on the selection, most specific rule first. Multi-select counts
* how many of the selected elements carry each class.
*/
function orderedClassRules(element, selectedElements, cascadeByClass) {
	const isMultiSelect = selectedElements && selectedElements.length > 1;
	let classItems;
	if (isMultiSelect) {
		const classCounts = {};
		const total = selectedElements.length;
		for (const el of selectedElements) {
			if (el.type === "text") continue;
			const className = el.props?.className || "";
			for (const cls of className.split(/\s+/).filter(Boolean)) classCounts[cls] = (classCounts[cls] || 0) + 1;
		}
		classItems = Object.entries(classCounts).map(([cls, count]) => ({
			cls,
			count,
			total
		})).sort((a, b) => b.count - a.count || a.cls.localeCompare(b.cls));
	} else classItems = (element && element.type !== "text" ? element.props?.className || "" : "").split(/\s+/).filter(Boolean).map((cls) => ({
		cls,
		count: 1,
		total: 1
	}));
	const cascadeOrder = new Map(Array.from(cascadeByClass?.keys() ?? []).reverse().map((cls, index) => [cls, index]));
	return classItems.sort((a, b) => (cascadeOrder.get(a.cls) ?? Number.MAX_SAFE_INTEGER) - (cascadeOrder.get(b.cls) ?? Number.MAX_SAFE_INTEGER));
}
function ClassesTab(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { children, cascadeByClass, element, selectedElements } = t0;
	let T0;
	let t1;
	let t2;
	let t3;
	if ($[0] !== cascadeByClass || $[1] !== children || $[2] !== element || $[3] !== selectedElements) {
		const orderedClasses = orderedClassRules(element, selectedElements, cascadeByClass);
		T0 = ScrollArea;
		t1 = "h-full select-text";
		t2 = children;
		let t4;
		if ($[8] !== cascadeByClass || $[9] !== element?.styles) {
			t4 = (t5) => {
				const { cls, count, total } = t5;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassStyleRow, {
					declarations: cascadeByClass?.get(cls),
					inlineStyles: element?.styles,
					className: cls,
					count,
					total
				}, cls);
			};
			$[8] = cascadeByClass;
			$[9] = element?.styles;
			$[10] = t4;
		} else t4 = $[10];
		t3 = orderedClasses.map(t4);
		$[0] = cascadeByClass;
		$[1] = children;
		$[2] = element;
		$[3] = selectedElements;
		$[4] = T0;
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
	} else {
		T0 = $[4];
		t1 = $[5];
		t2 = $[6];
		t3 = $[7];
	}
	let t4;
	if ($[11] !== T0 || $[12] !== t1 || $[13] !== t2 || $[14] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			className: t1,
			children: [t2, t3]
		});
		$[11] = T0;
		$[12] = t1;
		$[13] = t2;
		$[14] = t3;
		$[15] = t4;
	} else t4 = $[15];
	return t4;
}

export { ClassesTab, orderedClassRules };
