// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/capture/snapshot.ts
import { CSS_DEFAULTS$1, SKIP_DEFAULT_VALUES } from "./constants.js";
import { collapseBorder, collapseMargin, collapsePadding, kebabToCamel$2 } from "./styles.js";

/**
* Snapshot capture for pages we don't own (the Chrome extension). The pasted
* tree must look like the page did, whatever CSS the canvas brings: the
* project's resets and globals, and the editor's own stylesheet. So:
*
*  - Source classes and ids are not carried. They would resolve against the
*    project's CSS, not the page's.
*  - A computed value is left out only when no stylesheet is likely to change
*    it on the canvas (`shouldEmit`). Diffing against browser defaults alone
*    is not enough: resets restyle exactly the tags whose defaults differ.
*  - `::before` / `::after` become real nodes.
*  - SVG paint is baked per node, since the classes that set it are gone.
*
* Must stay self-contained enough to bundle into the guest IIFE.
*/
var SKIP$1 = [
	/^(animation|transition|view-transition|scroll-|overscroll|anchor|position-try|position-anchor|timeline|view-timeline|scroll-timeline)/,
	/^(margin|padding|inset|border)-(block|inline)/,
	/^border-(start|end)-(start|end)-radius$/,
	/^(block|inline|min-block|min-inline|max-block|max-inline)-size$/,
	/^(overflow-block|overflow-inline|overflow-clip-margin)$/,
	/^(cursor|pointer-events|user-select|touch-action|caret-color|will-change|resize|speak|interactivity)$/,
	/^(orphans|widows|page|break-|print-color-adjust|ruby-|math-|text-size-adjust|forced-color-adjust|color-scheme|dynamic-range-limit|reading-flow|reading-order|interpolate-size|app-region|field-sizing)/,
	/^(corner-|shape-|offset-|zoom$)/,
	/^(fill|stroke|marker|stop-|flood-|lighting-color|color-interpolation|color-rendering|shape-rendering|text-anchor|dominant-baseline|alignment-baseline|baseline-shift|vector-effect|paint-order|buffered-rendering|mask-type|clip-rule|cx$|cy$|r$|rx$|ry$|x$|y$|d$)/,
	/^(column-rule|row-rule|rule-)/,
	/^(content-visibility|contain-intrinsic)/
];
var VENDOR_KEEP = /* @__PURE__ */ new Set([
	"-webkit-text-fill-color",
	"-webkit-text-stroke-width",
	"-webkit-text-stroke-color",
	"-webkit-line-clamp",
	"-webkit-box-orient",
	"-webkit-font-smoothing"
]);
var INHERITED = /* @__PURE__ */ new Set([
	"color",
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"font-stretch",
	"font-variant-caps",
	"font-variant-ligatures",
	"font-variant-numeric",
	"font-variant-east-asian",
	"font-variant-alternates",
	"font-variant-position",
	"font-feature-settings",
	"font-variation-settings",
	"font-kerning",
	"font-optical-sizing",
	"font-synthesis-weight",
	"font-synthesis-style",
	"font-synthesis-small-caps",
	"font-size-adjust",
	"font-palette",
	"line-height",
	"letter-spacing",
	"word-spacing",
	"text-align",
	"text-align-last",
	"text-indent",
	"text-transform",
	"text-shadow",
	"text-rendering",
	"text-underline-position",
	"text-emphasis-style",
	"text-emphasis-color",
	"text-emphasis-position",
	"text-justify",
	"white-space-collapse",
	"text-wrap-mode",
	"text-wrap-style",
	"word-break",
	"overflow-wrap",
	"line-break",
	"hyphens",
	"hyphenate-character",
	"tab-size",
	"direction",
	"writing-mode",
	"text-orientation",
	"visibility",
	"list-style-type",
	"list-style-position",
	"list-style-image",
	"border-collapse",
	"border-spacing",
	"caption-side",
	"empty-cells",
	"quotes",
	"image-rendering",
	"accent-color",
	"-webkit-text-fill-color",
	"-webkit-text-stroke-width",
	"-webkit-text-stroke-color",
	"-webkit-font-smoothing",
	"paint-order"
]);
/** What a root must state because the canvas it lands in has its own. */
var ROOT_INHERITED = /* @__PURE__ */ new Set([
	"color",
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"line-height",
	"letter-spacing",
	"text-align",
	"text-transform",
	"white-space-collapse",
	"text-wrap-mode",
	"word-break",
	"overflow-wrap",
	"direction"
]);
var AUTHOR_TARGETED_TAGS = /* @__PURE__ */ new Set([
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"p",
	"a",
	"li",
	"label",
	"button",
	"input",
	"textarea",
	"select",
	"blockquote",
	"code",
	"pre",
	"kbd",
	"small",
	"strong",
	"b",
	"em",
	"th",
	"td",
	"figcaption"
]);
var AUTHOR_TARGETED_PROPS = /* @__PURE__ */ new Set([
	"color",
	"font-family",
	"font-size",
	"font-weight",
	"line-height"
]);
var RESET_TARGETED = {
	ul: [
		"list-style-type",
		"list-style-position",
		"list-style-image"
	],
	ol: [
		"list-style-type",
		"list-style-position",
		"list-style-image"
	],
	menu: [
		"list-style-type",
		"list-style-position",
		"list-style-image"
	],
	li: [
		"list-style-type",
		"list-style-position",
		"list-style-image"
	],
	table: [
		"border-collapse",
		"border-spacing",
		"text-indent"
	]
};
var REPLACED_TAGS = /* @__PURE__ */ new Set([
	"img",
	"svg",
	"video",
	"canvas",
	"audio",
	"iframe",
	"embed",
	"object",
	"picture"
]);
var ALWAYS = /* @__PURE__ */ new Set([
	"box-sizing",
	"width",
	"height"
]);
function createUaBaseline() {
	const byTag = /* @__PURE__ */ new Map();
	let frame = null;
	let frameDoc = null;
	try {
		frame = document.createElement("iframe");
		frame.setAttribute("aria-hidden", "true");
		frame.style.cssText = "position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;pointer-events:none";
		document.documentElement.appendChild(frame);
		frameDoc = frame.contentDocument;
		frameDoc?.open();
		frameDoc?.write("<!doctype html><html><head></head><body></body></html>");
		frameDoc?.close();
	} catch {
		frameDoc = null;
	}
	const styleFor = (tag) => {
		if (byTag.has(tag)) return byTag.get(tag);
		let cs = null;
		try {
			if (frameDoc?.body) {
				const el = frameDoc.createElement(tag);
				frameDoc.body.appendChild(el);
				cs = frameDoc.defaultView.getComputedStyle(el);
			}
		} catch {
			cs = null;
		}
		byTag.set(tag, cs);
		return cs;
	};
	return {
		value(tag, property) {
			const cs = styleFor(tag);
			if (!cs) return void 0;
			const v = cs.getPropertyValue(property);
			return v === "" ? void 0 : v;
		},
		dispose() {
			frame?.remove();
			frame = null;
			frameDoc = null;
		}
	};
}
var isSkipped = (property) => {
	if (property.startsWith("--")) return true;
	if (property.startsWith("-")) return !VENDOR_KEEP.has(property);
	return SKIP$1.some((re) => re.test(property));
};
/** Fallback when the baseline iframe is unavailable (e.g. a sandboxed page). */
function differsFromInitial(property, value) {
	const initial = CSS_DEFAULTS$1[kebabToCamel$2(property)];
	if (initial !== void 0) return value !== initial;
	return !SKIP_DEFAULT_VALUES.has(value);
}
function shouldEmit(property, value, tag, parentCS, ua) {
	if (ALWAYS.has(property)) return true;
	if (RESET_TARGETED[tag]?.includes(property)) return true;
	const uaTag = ua.value(tag, property);
	const uaDiv = ua.value("div", property);
	const tagSpecific = uaTag !== void 0 && uaDiv !== void 0 && uaTag !== uaDiv;
	if (INHERITED.has(property)) {
		if (!parentCS) return ROOT_INHERITED.has(property) || (uaDiv !== void 0 ? value !== uaDiv : differsFromInitial(property, value));
		if (tagSpecific) return true;
		if (AUTHOR_TARGETED_TAGS.has(tag) && AUTHOR_TARGETED_PROPS.has(property)) return true;
		return value !== parentCS.getPropertyValue(property);
	}
	if (property === "display") return REPLACED_TAGS.has(tag) || (uaTag !== void 0 ? value !== uaTag : value !== "block");
	if (AUTHOR_TARGETED_TAGS.has(tag) && AUTHOR_TARGETED_PROPS.has(property)) return true;
	if (tagSpecific) return true;
	if (uaTag !== void 0) return value !== uaTag;
	return differsFromInitial(property, value);
}
/** `white-space` is reported as two longhands; write it back as one. */
function foldWhiteSpace(styles) {
	const collapse = styles.whiteSpaceCollapse;
	const mode = styles.textWrapMode;
	if (collapse === void 0 && mode === void 0) return;
	const c = collapse ?? "collapse";
	const m = mode ?? "wrap";
	const whiteSpace = c === "collapse" ? m === "nowrap" ? "nowrap" : "normal" : c === "preserve" ? m === "nowrap" ? "pre" : "pre-wrap" : c === "preserve-breaks" ? "pre-line" : c === "break-spaces" ? "break-spaces" : void 0;
	if (!whiteSpace) return;
	delete styles.whiteSpaceCollapse;
	delete styles.textWrapMode;
	styles.whiteSpace = whiteSpace;
}
/**
* Computed styles for one element (or pseudo-element) as a camelCase style
* object, keeping every value the canvas could otherwise render differently.
*/
function getSnapshotStyles(cs, tag, parentCS, ua, el) {
	const styles = {};
	for (let i = 0; i < cs.length; i++) {
		const property = cs[i];
		if (isSkipped(property)) continue;
		const value = cs.getPropertyValue(property);
		if (!value) continue;
		if (!shouldEmit(property, value, tag, parentCS, ua)) continue;
		styles[kebabToCamel$2(property)] = value;
	}
	for (const side of [
		"top",
		"right",
		"bottom",
		"left"
	]) {
		const Side = side[0].toUpperCase() + side.slice(1);
		const width = cs.getPropertyValue(`border-${side}-width`);
		if (width === "0px") {
			delete styles[`border${Side}Style`];
			delete styles[`border${Side}Color`];
			delete styles[`border${Side}Width`];
		} else {
			styles[`border${Side}Width`] = width;
			styles[`border${Side}Style`] = cs.getPropertyValue(`border-${side}-style`);
			styles[`border${Side}Color`] = cs.getPropertyValue(`border-${side}-color`);
		}
	}
	if (cs.outlineWidth === "0px" || cs.outlineStyle === "none") {
		delete styles.outlineStyle;
		delete styles.outlineColor;
		delete styles.outlineWidth;
		delete styles.outlineOffset;
	}
	if (parentCS && /flex|grid/.test(parentCS.display)) {
		if (cs.minWidth !== "auto") styles.minWidth = cs.minWidth;
		if (cs.minHeight !== "auto") styles.minHeight = cs.minHeight;
	}
	for (const key of CURRENT_COLOR_KEYS) if (styles[key] !== void 0 && styles[key] === cs.color) delete styles[key];
	if (styles.minWidth === "auto") delete styles.minWidth;
	if (styles.minHeight === "auto") delete styles.minHeight;
	if (styles.unicodeBidi === "normal") delete styles.unicodeBidi;
	if (styles.WebkitLineClamp !== void 0 && styles.WebkitLineClamp !== "none") {
		styles.display = "-webkit-box";
		styles.WebkitBoxOrient = "vertical";
	}
	if (cs.transform !== "none" || cs.rotate !== "none" || cs.scale !== "none" || cs.translate !== "none") {
		styles.transformOrigin = cs.transformOrigin;
		if (cs.getPropertyValue("transform-box") !== "view-box") styles.transformBox = cs.getPropertyValue("transform-box");
	} else {
		delete styles.transformOrigin;
		delete styles.transformBox;
	}
	if (cs.perspective !== "none") styles.perspectiveOrigin = cs.perspectiveOrigin;
	else delete styles.perspectiveOrigin;
	if (el) restoreAutoKeywords(el, styles);
	const sized = [
		"width",
		"height",
		"minWidth",
		"minHeight",
		"maxWidth",
		"maxHeight",
		"flexBasis"
	].some((key) => styles[key] !== void 0 && styles[key] !== "auto" && styles[key] !== "none");
	const edged = [
		"padding-top",
		"padding-right",
		"padding-bottom",
		"padding-left",
		"border-top-width",
		"border-right-width",
		"border-bottom-width",
		"border-left-width"
	].some((property) => cs.getPropertyValue(property) !== "0px");
	if (!sized || !edged) delete styles.boxSizing;
	foldWhiteSpace(styles);
	collapseBorder(styles);
	collapsePadding(styles);
	collapseMargin(styles);
	return styles;
}
var CURRENT_COLOR_KEYS = [
	"textDecorationColor",
	"textEmphasisColor",
	"WebkitTextFillColor",
	"WebkitTextStrokeColor",
	"outlineColor",
	"columnRuleColor",
	"caretColor"
];
/**
* A text run as the page laid it out. The canvas renders text with
* `white-space: pre-wrap`, so collapse the whitespace the page collapsed and
* carry `nowrap` onto the run itself.
*/
function snapshotText(raw, parentCS) {
	const collapse = parentCS?.getPropertyValue("white-space-collapse") || "collapse";
	const mode = parentCS?.getPropertyValue("text-wrap-mode") || "wrap";
	const text = collapse === "collapse" ? raw.replace(/[ \t\n\r\f]+/g, " ") : collapse === "preserve-breaks" ? raw.replace(/[ \t]+/g, " ") : raw;
	if (mode !== "nowrap") return { text };
	return {
		text,
		styles: { whiteSpace: collapse === "collapse" ? "nowrap" : "pre" }
	};
}
var MARGINS = [
	["margin-top", "marginTop"],
	["margin-right", "marginRight"],
	["margin-bottom", "marginBottom"],
	["margin-left", "marginLeft"]
];
var INSETS = [
	["top", "top"],
	["right", "right"],
	["bottom", "bottom"],
	["left", "left"]
];
/**
* `getComputedStyle` reports margins and insets as the pixels they resolved
* to. An `auto` margin is centering or pushing, so keep it `auto`; an `auto`
* inset was never set, and baking the resolved pixels pins or stretches the
* box. Typed OM still sees the keyword.
*/
function restoreAutoKeywords(el, styles) {
	const map = typeof el.computedStyleMap === "function" ? el.computedStyleMap() : null;
	const Keyword = globalThis.CSSKeywordValue;
	if (!map || !Keyword) return;
	const isAuto = (property) => {
		const value = map.get(property);
		return value instanceof Keyword && value.value === "auto";
	};
	for (const [property, key] of MARGINS) if (isAuto(property)) styles[key] = "auto";
	for (const [property, key] of INSETS) if (isAuto(property)) delete styles[key];
}
var isTransparent = (color) => color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color);
/**
* What showed through a root without a background color of its own (it may
* still have a translucent gradient): the nearest ancestor's color. On the
* canvas it would otherwise show the canvas instead.
*/
function backdropColor(el) {
	if (!isTransparent(window.getComputedStyle(el).backgroundColor)) return void 0;
	for (let node = el.parentElement; node; node = node.parentElement) {
		const color = window.getComputedStyle(node).backgroundColor;
		if (!isTransparent(color)) return color;
	}
	return "rgb(255, 255, 255)";
}
/** `name 3` pairs from a computed counter-reset / counter-increment value. */
function counterAmount(list, name, fallback) {
	const tokens = list.split(/\s+/);
	const i = tokens.indexOf(name);
	if (i < 0) return null;
	const n = Number(tokens[i + 1]);
	return Number.isFinite(n) ? n : fallback;
}
/**
* Browsers don't expose counter values, so count them: from the nearest
* element that resets `name` (or its preceding sibling scope), add every
* increment up to and including the element. Each scope and name is counted
* in one pass per capture; line-numbered code has a counter on every line.
*/
function createCounters() {
	const byScope = /* @__PURE__ */ new Map();
	return (el, name) => {
		let scope = el;
		let start = 0;
		while (scope) {
			const reset = counterAmount(window.getComputedStyle(scope).counterReset, name, 0);
			if (reset !== null) {
				start = reset;
				break;
			}
			scope = scope.parentElement;
		}
		const root = scope ?? document.body;
		let byName = byScope.get(root);
		if (!byName) byScope.set(root, byName = /* @__PURE__ */ new Map());
		let values = byName.get(name);
		if (!values) byName.set(name, values = countScope(root, name, start));
		return values.get(el) ?? start;
	};
}
/** Each element's counter value in `root`, before its own `::after`. */
function countScope(root, name, start) {
	const values = /* @__PURE__ */ new Map([[root, start]]);
	let value = start;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		for (const cs of [window.getComputedStyle(node), window.getComputedStyle(node, "::before")]) value += counterAmount(cs.counterIncrement, name, 1) ?? 0;
		values.set(node, value);
		value += counterAmount(window.getComputedStyle(node, "::after").counterIncrement, name, 1) ?? 0;
	}
	return values;
}
function formatCounter(value, style) {
	if (style === "decimal-leading-zero") return value < 10 && value > -10 ? `${value < 0 ? "-" : ""}0${Math.abs(value)}` : String(value);
	if (style === "lower-alpha" || style === "lower-latin") return String.fromCharCode(96 + (value - 1) % 26 + 1);
	if (style === "upper-alpha" || style === "upper-latin") return String.fromCharCode(64 + (value - 1) % 26 + 1);
	return String(value);
}
/** Tokens of a computed `content` value, resolved to plain text where possible. */
function pseudoContent(content, el, counters) {
	if (!content || content === "none" || content === "normal") return null;
	let text = "";
	let url;
	const re = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)|attr\(\s*([\w-]+)\s*\)|(open-quote|close-quote)|counter\(\s*([\w-]+)\s*(?:,\s*([\w-]+)\s*)?\)/g;
	let match;
	while (match = re.exec(content)) {
		const [, dq, sq, u1, u2, u3, attr, quote, counter, counterStyle] = match;
		if (dq !== void 0 || sq !== void 0) text += (dq ?? sq).replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, "$1");
		else if (u1 !== void 0 || u2 !== void 0 || u3 !== void 0) url = (u1 ?? u2 ?? u3).trim();
		else if (attr) text += el.getAttribute(attr) ?? "";
		else if (quote) text += quote === "open-quote" ? "“" : "”";
		else if (counter) text += formatCounter(counters(el, counter), counterStyle);
	}
	return {
		text,
		url
	};
}
/** `::before` / `::after` as a real node, or null when it renders nothing. */
function capturePseudo(el, which, elCS, ua, ctx) {
	const makeId = ctx.nextId;
	const cs = window.getComputedStyle(el, which);
	if (cs.display === "none") return null;
	const content = pseudoContent(cs.content, el, ctx.counters);
	if (!content) return null;
	if (cs.display === "inline" && (cs.whiteSpaceCollapse || "collapse") === "collapse") {
		if (which === "::before" && !ctx.inlineBefore) content.text = content.text.replace(/^[ \t\n\r\f]+/, "");
		if (which === "::after" && !ctx.inlineAfter) content.text = content.text.replace(/[ \t\n\r\f]+$/, "");
		if (!content.text && !content.url) return null;
	}
	const styles = getSnapshotStyles(cs, "span", elCS, ua);
	if (cs.display === "inline") {
		delete styles.width;
		delete styles.height;
	}
	if (cs.position === "fixed") ctx.place(cs, styles);
	if (content.url) return {
		id: makeId(),
		type: "html",
		tag: "img",
		props: {
			src: content.url,
			alt: ""
		},
		styles: Object.keys(styles).length > 0 ? styles : void 0
	};
	const children = content.text ? [{
		id: makeId(),
		type: "text",
		tag: "span",
		text: content.text
	}] : [];
	return {
		id: makeId(),
		type: "html",
		tag: "span",
		styles: Object.keys(styles).length > 0 ? styles : void 0,
		children: children.length > 0 ? children : void 0
	};
}
var SVG_PAINT = [
	[
		"fill",
		"rgb(0, 0, 0)",
		true
	],
	[
		"fill-opacity",
		"1",
		true
	],
	[
		"fill-rule",
		"nonzero",
		true
	],
	[
		"stroke",
		"none",
		true
	],
	[
		"stroke-width",
		"1px",
		true
	],
	[
		"stroke-opacity",
		"1",
		true
	],
	[
		"stroke-linecap",
		"butt",
		true
	],
	[
		"stroke-linejoin",
		"miter",
		true
	],
	[
		"stroke-dasharray",
		"none",
		true
	],
	[
		"stroke-dashoffset",
		"0px",
		true
	],
	[
		"stroke-miterlimit",
		"4",
		true
	],
	[
		"clip-rule",
		"nonzero",
		true
	],
	[
		"paint-order",
		"normal",
		true
	],
	[
		"vector-effect",
		"none",
		false
	],
	[
		"stop-color",
		"rgb(0, 0, 0)",
		false
	],
	[
		"stop-opacity",
		"1",
		false
	],
	[
		"opacity",
		"1",
		false
	]
];
/**
* Paint an svg node renders with, as styles. Classes are dropped in a
* snapshot, so anything a stylesheet set (`fill-current`, `stroke-2`) must be
* baked; values equal to the parent's or the node's own attribute are left out.
*/
function svgPaintStyles(el, parent) {
	const cs = window.getComputedStyle(el);
	const parentCS = parent ? window.getComputedStyle(parent) : null;
	const styles = {};
	for (const [property, initial, inherited] of SVG_PAINT) {
		const value = cs.getPropertyValue(property);
		if (!value) continue;
		if (value === (inherited && parentCS ? parentCS.getPropertyValue(property) : initial)) continue;
		const attribute = el.getAttribute(property);
		if (attribute !== null && attribute === value) continue;
		styles[kebabToCamel$2(property)] = value;
	}
	return styles;
}

export { backdropColor, capturePseudo, createCounters, createUaBaseline, getSnapshotStyles, snapshotText, svgPaintStyles };
