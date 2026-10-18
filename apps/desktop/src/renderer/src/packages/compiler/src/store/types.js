// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/store/types.ts

var ROOT = "ROOT";
var LEAF_TYPES = /* @__PURE__ */ new Set([
	"text",
	"icon",
	"webview"
]);
var VOID_HTML_TAGS = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
var VOID_SVG_TAGS = /* @__PURE__ */ new Set([
	"circle",
	"ellipse",
	"image",
	"line",
	"path",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"use",
	"feBlend",
	"feColorMatrix",
	"feComposite",
	"feConvolveMatrix",
	"feDisplacementMap",
	"feDropShadow",
	"feFlood",
	"feGaussianBlur",
	"feImage",
	"feMorphology",
	"feOffset",
	"feTile",
	"feTurbulence",
	"feMergeNode",
	"feFuncR",
	"feFuncG",
	"feFuncB",
	"feFuncA",
	"feDistantLight",
	"fePointLight",
	"feSpotLight"
]);
function hasChildren$1(el) {
	if (LEAF_TYPES.has(el.type)) return false;
	if (el.type === "html" && (VOID_HTML_TAGS.has(el.tag) || VOID_SVG_TAGS.has(el.tag))) return false;
	return true;
}
var SVG_CONTAINER_TAGS = /* @__PURE__ */ new Set([
	"svg",
	"g",
	"defs",
	"symbol",
	"marker",
	"mask",
	"pattern",
	"switch",
	"clipPath",
	"linearGradient",
	"radialGradient",
	"text",
	"tspan",
	"textPath",
	"filter",
	"feMerge",
	"feComponentTransfer",
	"feDiffuseLighting",
	"feSpecularLighting"
]);
var ALL_SVG_TAGS = /* @__PURE__ */ new Set([...SVG_CONTAINER_TAGS, ...VOID_SVG_TAGS]);
var RESTRICTED_CHILD_TAGS = {
	video: /* @__PURE__ */ new Set(["source", "track"]),
	audio: /* @__PURE__ */ new Set(["source", "track"]),
	picture: /* @__PURE__ */ new Set(["source", "img"]),
	select: /* @__PURE__ */ new Set([
		"option",
		"optgroup",
		"hr"
	]),
	optgroup: /* @__PURE__ */ new Set(["option"]),
	object: /* @__PURE__ */ new Set(["param"]),
	iframe: /* @__PURE__ */ new Set(),
	canvas: /* @__PURE__ */ new Set(),
	textarea: /* @__PURE__ */ new Set(),
	option: /* @__PURE__ */ new Set()
};
var TEXT_CONTENT_TAGS = /* @__PURE__ */ new Set(["option", "textarea"]);
var SVG_TEXT_TAGS = /* @__PURE__ */ new Set([
	"text",
	"tspan",
	"textPath"
]);
function canAcceptChild(parent, child) {
	if (!hasChildren$1(parent)) return false;
	if (parent.type !== "html") return true;
	if (parent.tag === "foreignObject") return true;
	const restricted = RESTRICTED_CHILD_TAGS[parent.tag];
	if (restricted) {
		if (child.type === "text") return TEXT_CONTENT_TAGS.has(parent.tag);
		return child.type === "html" && restricted.has(child.tag);
	}
	if (!SVG_CONTAINER_TAGS.has(parent.tag)) return true;
	if (child.type === "text") return SVG_TEXT_TAGS.has(parent.tag);
	return child.type === "html" && (ALL_SVG_TAGS.has(child.tag) || child.tag === "foreignObject");
}

export { ROOT, canAcceptChild, hasChildren$1 };
