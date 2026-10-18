// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/svgElement.ts
import { htmlElement, newId } from "../element.js";
import { flipKindOf, hasIdentityLinearPart, isRotatedOrSkewed, linearBounds, matrixOf } from "../model/matrix.js";
import { rgbaToCss } from "../../utils/color.js";
import { svgGradientDef } from "./svgGradient.js";
import { strokeOverflow } from "./svgStroke.js";
import { withoutKeys } from "../styles/withoutKeys.js";
import { nodeStylesToCss } from "../styles/index.js";

var GAUSSIAN_REACH_IN_DEVIATIONS = 3;
var DEFAULT_SHADOW_COLOR = "rgba(0,0,0,0.25)";
function viewBoxFor(m, width, height, strokePad) {
	if (!isRotatedOrSkewed(m)) return {
		x: -strokePad,
		y: -strokePad,
		width: width + strokePad * 2,
		height: height + strokePad * 2
	};
	const bounds = linearBounds(m, width, height);
	return {
		x: bounds.minX,
		y: bounds.minY,
		width: Math.max(bounds.maxX - bounds.minX, .001),
		height: Math.max(bounds.maxY - bounds.minY, .001)
	};
}
function innerSvgTransform(m, width, height) {
	if (hasIdentityLinearPart(m)) return void 0;
	switch (flipKindOf(m)) {
		case "horizontal": return `matrix(-1 0 0 1 ${width} 0)`;
		case "vertical": return `matrix(1 0 0 -1 0 ${height})`;
		case "both": return `matrix(-1 0 0 -1 ${width} ${height})`;
	}
	return isRotatedOrSkewed(m) ? `matrix(${m.m00} ${m.m10} ${m.m01} ${m.m11} 0 0)` : void 0;
}
function shadowDeviation(effect) {
	return (effect.radius ?? 0) / 2;
}
function shadowReach(shadows) {
	return Math.ceil(Math.max(...shadows.map((effect) => Math.max(Math.abs(effect.offset?.x ?? 0), Math.abs(effect.offset?.y ?? 0)) + GAUSSIAN_REACH_IN_DEVIATIONS * shadowDeviation(effect))));
}
function dropShadowFilter(node, filterId, box) {
	const shadows = node.effects?.filter((effect) => effect.visible !== false && effect.type === "DROP_SHADOW");
	if (!shadows?.length) return null;
	const reach = shadowReach(shadows);
	return {
		element: htmlElement("filter", { props: {
			id: filterId,
			x: box.x - reach,
			y: box.y - reach,
			width: box.width + reach * 2,
			height: box.height + reach * 2,
			filterUnits: "userSpaceOnUse",
			colorInterpolationFilters: "sRGB"
		} }),
		children: shadows.map((effect) => htmlElement("feDropShadow", { props: {
			dx: effect.offset?.x ?? 0,
			dy: effect.offset?.y ?? 0,
			stdDeviation: shadowDeviation(effect),
			floodColor: rgbaToCss(effect.color, effect.opacity ?? 1) ?? DEFAULT_SHADOW_COLOR
		} }))
	};
}
function svgDefs(entries) {
	const present = entries.filter((entry) => entry !== null);
	return present.length > 0 ? {
		element: htmlElement("defs"),
		entries: present
	} : void 0;
}
function shiftedPosition(styles, dx, dy) {
	if (styles.position !== "absolute") return styles;
	return {
		...styles,
		...typeof styles.left === "number" ? { left: styles.left + dx } : {},
		...typeof styles.top === "number" ? { top: styles.top + dy } : {}
	};
}
function svgBoxStyles(base, options) {
	const { box, rotated, strokePad } = options;
	const sized = {
		...withoutKeys(base, [...options.hasShadow ? ["boxShadow", "filter"] : [], ...options.hasInnerTransform ? ["transform", "transformOrigin"] : []]),
		...options.overflows ? { overflow: "visible" } : {},
		width: box.width,
		height: box.height
	};
	if (rotated) return shiftedPosition(sized, box.x, box.y);
	return strokePad > 0 ? shiftedPosition(sized, -strokePad, -strokePad) : sized;
}
function pathElement(path, filterId, gradientId) {
	return htmlElement("path", { props: {
		d: path.d,
		fill: path.fill === "figma-gradient-fill" ? `url(#${gradientId})` : path.fill,
		fillRule: path.fillRule,
		...filterId ? { filter: `url(#${filterId})` } : {},
		...path.strokeProps
	} });
}
function buildSvg(node, nodeId, ctx, paths, asCanvasRoot) {
	if (paths.length === 0) return null;
	const width = node.size?.x ?? 0;
	const height = node.size?.y ?? 0;
	const m = matrixOf(node.transform);
	const rotated = isRotatedOrSkewed(m);
	const overflow = strokeOverflow(paths);
	const strokePad = rotated ? 0 : overflow;
	const box = viewBoxFor(m, width, height, strokePad);
	const svgId = newId();
	const filterId = `figma-shadow-${svgId}`;
	const gradientId = `figma-gradient-${svgId}`;
	const shadowFilter = dropShadowFilter(node, filterId, box);
	const gradient = paths.some((path) => path.fill === "figma-gradient-fill") ? svgGradientDef(node, gradientId) : null;
	const innerTransform = innerSvgTransform(m, width, height);
	return {
		svgElement: htmlElement("svg", {
			id: svgId,
			styles: svgBoxStyles(nodeStylesToCss(node, nodeId, ctx, { asCanvasRoot }), {
				box,
				rotated,
				strokePad,
				overflows: overflow > 0,
				hasShadow: !!shadowFilter,
				hasInnerTransform: !!innerTransform
			}),
			props: {
				width: box.width,
				height: box.height,
				viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
				xmlns: "http://www.w3.org/2000/svg"
			}
		}),
		pathElements: paths.map((path) => pathElement(path, shadowFilter ? filterId : void 0, gradientId)),
		flipGroup: innerTransform ? htmlElement("g", { props: { transform: innerTransform } }) : void 0,
		defs: svgDefs([shadowFilter, gradient])
	};
}

export { buildSvg };
