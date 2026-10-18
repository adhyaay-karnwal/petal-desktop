// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/capture/svg.ts
import { extractInlineStyles, kebabToCamel$2 } from "./styles.js";

/**
* SVG capture — rebuilds the SVG as a real element tree (svg > path, circle…)
* so it renders, shows up as layers, and saves as plain JSX. Resolves
* `currentColor`-driven fills/colors so icons look right when the captured
* tree is rendered in a context where the parent's color chain is different.
*/
var BLACK = "rgb(0, 0, 0)";
function captureSvg(el, ctx) {
	const node = svgToCaptured(el, ctx.makeId, ctx.snapshot);
	const styles = {
		...ctx.svgStyles ?? {},
		...node.styles ?? {}
	};
	if (ctx.snapshot) {
		node.styles = Object.keys(styles).length > 0 ? styles : void 0;
		return node;
	}
	if (!styles.color && ctx.cs.color && ctx.cs.color !== BLACK) styles.color = ctx.cs.color;
	const fill = ctx.cs.fill;
	const attrFill = el.getAttribute("fill");
	if (!styles.fill && fill && fill !== BLACK && fill !== "none" && attrFill !== "currentColor" && attrFill !== fill) styles.fill = fill;
	node.styles = Object.keys(styles).length > 0 ? styles : void 0;
	if (ctx.iconName) node.capturedIcon = {
		iconName: ctx.iconName,
		...ctx.iconSize ? { size: Math.round(ctx.iconSize) } : {},
		...ctx.iconProps ? { props: ctx.iconProps } : {}
	};
	return node;
}
var isExplicitPaint = (v) => typeof v === "string" && v !== "currentColor" && v !== "none" && !v.startsWith("url(");
var DEFAULT_STROKE_WIDTH = "2";
/**
* Icon-component props recoverable from a captured icon svg: an explicit
* color (stroke for stroked icons, fill for filled ones), an explicit fill on
* a stroked icon, a non-default stroke width, authored classes, data-* hooks
* (shadcn data-icon placement) and a11y attributes.
*/
function iconPropsFromSvg(svgProps, size) {
	const props = size ? { size } : {};
	if (!svgProps) return props;
	if ("stroke" in svgProps) {
		if (isExplicitPaint(svgProps.stroke)) props.color = svgProps.stroke;
		if (isExplicitPaint(svgProps.fill)) props.fill = svgProps.fill;
	} else if (isExplicitPaint(svgProps.fill)) props.color = svgProps.fill;
	if (svgProps.strokeWidth != null && svgProps.strokeWidth !== DEFAULT_STROKE_WIDTH) props.strokeWidth = Number(svgProps.strokeWidth) || svgProps.strokeWidth;
	const className = typeof svgProps.className === "string" ? svgProps.className.split(/\s+/).filter((c) => c && !/^lucide(-|$)/.test(c)).join(" ") : "";
	if (className) props.className = className;
	for (const [key, value] of Object.entries(svgProps)) {
		const isData = key.startsWith("data-") && key !== "data-element-id";
		const isA11y = key === "role" || key.startsWith("aria-") && key !== "aria-hidden";
		if (isData || isA11y) props[key] = value;
	}
	return props;
}
var ICON_LIBRARY_SIGNATURES = [
	["lucide", (p) => /(?:^|\s)lucide(?:\s|$)/.test(p.className ?? "")],
	["@phosphor-icons", (p) => p.viewBox === "0 0 256 256"],
	["@heroicons", (p) => p["data-slot"] === "icon"]
];
/** Whether a captured svg could have come from `library` (unknown libraries: yes). */
function svgMatchesIconLibrary(library, svgProps) {
	const signature = ICON_LIBRARY_SIGNATURES.find(([prefix]) => library.startsWith(prefix));
	return signature ? signature[1](svgProps ?? {}) : true;
}
var SVG_CHILD_TAGS = /* @__PURE__ */ new Set([
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
	"feSpecularLighting",
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
function capturedChildren(el, makeId, snapshot) {
	return Array.from(el.children).flatMap((c) => {
		if (c.tagName === "a") return capturedChildren(c, makeId, snapshot);
		return SVG_CHILD_TAGS.has(c.tagName) ? [svgToCaptured(c, makeId, snapshot, el)] : [];
	});
}
/** Convert an SVG DOM subtree into captured html nodes with React prop names. */
function svgToCaptured(el, makeId, snapshot, parent = null) {
	const id = makeId();
	const props = {};
	for (const { name, value } of Array.from(el.attributes)) {
		if (name === "style" || name.startsWith("on") || name.startsWith("data-lg-src")) continue;
		if (name === "class") {
			if (!snapshot) props.className = value;
		} else if (name === "xlink:href") props.href = value;
		else if (name.includes(":") || name === "xmlns") continue;
		else if (name.startsWith("data-") || name.startsWith("aria-")) props[name] = value;
		else props[kebabToCamel$2(name)] = value;
	}
	const children = capturedChildren(el, makeId, snapshot);
	const styles = snapshot ? snapshot.paint(el, parent) : extractInlineStyles(el);
	return {
		id,
		type: "html",
		tag: el.tagName,
		props: Object.keys(props).length > 0 ? props : void 0,
		styles: styles && Object.keys(styles).length > 0 ? styles : void 0,
		children: children.length > 0 ? children : void 0
	};
}

export { captureSvg, iconPropsFromSvg, svgMatchesIconLibrary };
