// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/tabs/ClassStyles.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { CopyIcon } from "../../../../../../../ui/src/icons.js";
import { Tooltip } from "../../../../../../../ui/src/components/Tooltip.js";
import { useIsDark } from "../../../../../../../ui/src/hooks/useIsDark.js";
import { camelToKebab } from "../../../../utils/computedStyles.js";
import { highlightTree, tagHighlighter } from "../../../../../../../../vendor/@lezer/highlight.js";
import { cssLanguage } from "../../../../../../../../vendor/@codemirror/lang-css.js";
import { githubDarkStyle, githubLightStyle } from "../../../../../../../../vendor/@uiw/codemirror-theme-github.js";
import { copyToClipboard } from "./CopyCSSButton.js";

/** Syntax-highlighted declarations for a class rule section. */
var declarationParser = cssLanguage.configure({ top: "Styles" }).parser;
var themeStyles = {
	dark: githubDarkStyle,
	light: githubLightStyle
};
var highlighters = {
	dark: tagHighlighter(githubDarkStyle.map(({ tag }, index) => ({
		tag,
		class: String(index)
	}))),
	light: tagHighlighter(githubLightStyle.map(({ tag }, index) => ({
		tag,
		class: String(index)
	})))
};
function tokenize(text, theme) {
	const tokens = [];
	highlightTree(declarationParser.parse(text), highlighters[theme], (from, to, classes) => {
		let color;
		for (const token of classes.split(" ")) color = themeStyles[theme][Number(token)]?.color ?? color;
		tokens.push({
			from,
			to,
			color
		});
	});
	return tokens;
}
/** Renders `text[from, to)` with the syntax colours of the tokens that overlap it. */
function highlightRange(text, tokens, from, to, inactive) {
	const nodes = [];
	let cursor = from;
	for (const token of tokens) {
		const start = Math.max(token.from, from);
		const end = Math.min(token.to, to);
		if (start >= end) continue;
		if (start > cursor) nodes.push(text.slice(cursor, start));
		nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: inactive ? void 0 : { color: token.color },
			children: text.slice(start, end)
		}, start));
		cursor = end;
	}
	if (cursor < to) nodes.push(text.slice(cursor, to));
	return nodes;
}
var COPY_TARGET_CLASS = "relative cursor-default rounded-[3px] py-0.5 focus-visible:bg-ed-accent focus-visible:outline-none";
var FRONT_ICON_CLASS = "absolute left-1 top-[3px] size-3 text-ed-muted-foreground";
function onActivate(handler) {
	return (event) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		event.stopPropagation();
		handler();
	};
}
/**
* One `prop: value;` line. Hovering the property highlights the whole
* declaration and a click copies it; hovering the value highlights and copies
* only the value, dimming the property and hiding the semicolon. The line's
* target reaches into the indent so the space in front of it hovers too, and
* the highlight fits a copy icon: at the front of the line, or after the value.
*/
function CopyableDeclaration(t0) {
	const $ = (0, import_compiler_runtime.c)(68);
	const { prop, value, inactive } = t0;
	const dark = useIsDark();
	const [hovered, setHovered] = (0, import_react.useState)(null);
	let t1;
	if ($[0] !== prop) {
		t1 = camelToKebab(prop);
		$[0] = prop;
		$[1] = t1;
	} else t1 = $[1];
	const label = `${t1}: `;
	const declaration = `${label}${value};`;
	const t2 = dark ? "dark" : "light";
	let t3;
	if ($[2] !== declaration || $[3] !== t2) {
		t3 = tokenize(declaration, t2);
		$[2] = declaration;
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	const tokens = t3;
	const valueEnd = label.length + value.length;
	let t4;
	if ($[5] !== declaration) {
		t4 = () => void copyToClipboard(declaration);
		$[5] = declaration;
		$[6] = t4;
	} else t4 = $[6];
	const copyDeclaration = t4;
	let t5;
	if ($[7] !== value) {
		t5 = () => void copyToClipboard(value);
		$[7] = value;
		$[8] = t5;
	} else t5 = $[8];
	const copyValue = t5;
	const t6 = `Copy ${declaration}`;
	const t7 = hovered === "declaration" && "bg-ed-accent";
	let t8;
	if ($[9] !== t7) {
		t8 = cn$2(COPY_TARGET_CLASS, "-ml-5 -mr-1 pl-5 pr-1", t7);
		$[9] = t7;
		$[10] = t8;
	} else t8 = $[10];
	let t10;
	let t9;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => setHovered("declaration");
		t10 = () => setHovered(null);
		$[11] = t10;
		$[12] = t9;
	} else {
		t10 = $[11];
		t9 = $[12];
	}
	let t11;
	if ($[13] !== copyDeclaration) {
		t11 = onActivate(copyDeclaration);
		$[13] = copyDeclaration;
		$[14] = t11;
	} else t11 = $[14];
	let t12;
	if ($[15] !== hovered) {
		t12 = hovered === "declaration" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIcon, {
			"aria-hidden": "true",
			className: FRONT_ICON_CLASS
		});
		$[15] = hovered;
		$[16] = t12;
	} else t12 = $[16];
	const t13 = hovered === "value" && "opacity-50";
	let t14;
	if ($[17] !== t13) {
		t14 = cn$2(t13);
		$[17] = t13;
		$[18] = t14;
	} else t14 = $[18];
	const t15 = inactive || hovered === "value";
	let t16;
	if ($[19] !== declaration || $[20] !== label.length || $[21] !== t15 || $[22] !== tokens) {
		t16 = highlightRange(declaration, tokens, 0, label.length, t15);
		$[19] = declaration;
		$[20] = label.length;
		$[21] = t15;
		$[22] = tokens;
		$[23] = t16;
	} else t16 = $[23];
	let t17;
	if ($[24] !== t14 || $[25] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t14,
			children: t16
		});
		$[24] = t14;
		$[25] = t16;
		$[26] = t17;
	} else t17 = $[26];
	const t18 = `Copy ${value}`;
	const t19 = hovered === "value" && "bg-ed-accent";
	let t20;
	if ($[27] !== t19) {
		t20 = cn$2(COPY_TARGET_CLASS, "-mx-1 px-1", t19);
		$[27] = t19;
		$[28] = t20;
	} else t20 = $[28];
	let t21;
	let t22;
	if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = () => setHovered("value");
		t22 = () => setHovered("declaration");
		$[29] = t21;
		$[30] = t22;
	} else {
		t21 = $[29];
		t22 = $[30];
	}
	let t23;
	let t24;
	if ($[31] !== copyValue) {
		t23 = (event) => {
			event.stopPropagation();
			copyValue();
		};
		t24 = onActivate(copyValue);
		$[31] = copyValue;
		$[32] = t23;
		$[33] = t24;
	} else {
		t23 = $[32];
		t24 = $[33];
	}
	let t25;
	if ($[34] !== declaration || $[35] !== inactive || $[36] !== label.length || $[37] !== tokens || $[38] !== valueEnd) {
		t25 = highlightRange(declaration, tokens, label.length, valueEnd, inactive);
		$[34] = declaration;
		$[35] = inactive;
		$[36] = label.length;
		$[37] = tokens;
		$[38] = valueEnd;
		$[39] = t25;
	} else t25 = $[39];
	let t26;
	if ($[40] !== hovered) {
		t26 = hovered === "value" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIcon, {
			"aria-hidden": "true",
			className: "ml-1 inline-block size-3 -translate-y-px align-middle text-ed-muted-foreground"
		});
		$[40] = hovered;
		$[41] = t26;
	} else t26 = $[41];
	let t27;
	if ($[42] !== t18 || $[43] !== t20 || $[44] !== t23 || $[45] !== t24 || $[46] !== t25 || $[47] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			role: "button",
			tabIndex: 0,
			"aria-label": t18,
			className: t20,
			onMouseEnter: t21,
			onMouseLeave: t22,
			onClick: t23,
			onKeyDown: t24,
			children: [t25, t26]
		});
		$[42] = t18;
		$[43] = t20;
		$[44] = t23;
		$[45] = t24;
		$[46] = t25;
		$[47] = t26;
		$[48] = t27;
	} else t27 = $[48];
	const t28 = hovered === "value" && "hidden";
	let t29;
	if ($[49] !== t28) {
		t29 = cn$2(t28);
		$[49] = t28;
		$[50] = t29;
	} else t29 = $[50];
	let t30;
	if ($[51] !== declaration || $[52] !== inactive || $[53] !== tokens || $[54] !== valueEnd) {
		t30 = highlightRange(declaration, tokens, valueEnd, declaration.length, inactive);
		$[51] = declaration;
		$[52] = inactive;
		$[53] = tokens;
		$[54] = valueEnd;
		$[55] = t30;
	} else t30 = $[55];
	let t31;
	if ($[56] !== t29 || $[57] !== t30) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t29,
			children: t30
		});
		$[56] = t29;
		$[57] = t30;
		$[58] = t31;
	} else t31 = $[58];
	let t32;
	if ($[59] !== copyDeclaration || $[60] !== t11 || $[61] !== t12 || $[62] !== t17 || $[63] !== t27 || $[64] !== t31 || $[65] !== t6 || $[66] !== t8) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			role: "button",
			tabIndex: 0,
			"aria-label": t6,
			className: t8,
			onMouseEnter: t9,
			onMouseLeave: t10,
			onClick: copyDeclaration,
			onKeyDown: t11,
			children: [
				t12,
				t17,
				t27,
				t31
			]
		});
		$[59] = copyDeclaration;
		$[60] = t11;
		$[61] = t12;
		$[62] = t17;
		$[63] = t27;
		$[64] = t31;
		$[65] = t6;
		$[66] = t8;
		$[67] = t32;
	} else t32 = $[67];
	return t32;
}
function ClassStyles(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { declarations, inlineStyles: t1, emptyMessage: t2 } = t0;
	let t3;
	if ($[0] !== t1) {
		t3 = t1 === void 0 ? {} : t1;
		$[0] = t1;
		$[1] = t3;
	} else t3 = $[1];
	const inlineStyles = t3;
	const emptyMessage = t2 === void 0 ? "No CSS details available for this class." : t2;
	if (!declarations?.length) {
		let t4;
		if ($[2] !== emptyMessage) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-ed-muted-foreground",
				children: emptyMessage
			});
			$[2] = emptyMessage;
			$[3] = t4;
		} else t4 = $[3];
		return t4;
	}
	const styles = inlineStyles;
	let t4;
	if ($[4] !== declarations) {
		t4 = new Map(declarations.map(_temp$80));
		$[4] = declarations;
		$[5] = t4;
	} else t4 = $[5];
	const uniqueDeclarations = t4;
	let t5;
	if ($[6] !== styles || $[7] !== uniqueDeclarations) {
		let t6;
		if ($[9] !== styles) {
			t6 = (t7) => {
				const [key, t8] = t7;
				const { prop, value, variant, overridden } = t8;
				const inlineOverride = !variant && styles[prop] !== void 0 && styles[prop] !== "";
				const inactive = overridden || inlineOverride;
				const declaration_0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn$2("whitespace-pre-wrap break-words font-mono text-[11px]", inactive ? "text-ed-muted-foreground line-through" : "text-ed-foreground"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyableDeclaration, {
						prop,
						value,
						inactive
					})
				});
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [variant && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] text-ed-muted-foreground",
					children: [":", variant]
				}), inactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: inlineOverride ? "Overridden by element CSS" : "Overridden",
					children: declaration_0
				}) : declaration_0] }, key);
			};
			$[9] = styles;
			$[10] = t6;
		} else t6 = $[10];
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1 text-[11px] text-ed-foreground",
			children: Array.from(uniqueDeclarations, t6)
		});
		$[6] = styles;
		$[7] = uniqueDeclarations;
		$[8] = t5;
	} else t5 = $[8];
	return t5;
}
function _temp$80(declaration) {
	return [JSON.stringify(declaration), declaration];
}

export { ClassStyles };
