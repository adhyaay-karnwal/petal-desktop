// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/stroke.ts
import { visiblePaints } from "../model/paints.js";
import { rgbaToCss } from "../../utils/color.js";
import { solidPaintColor } from "./color.js";

var SIDES = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function positive(value) {
	return typeof value === "number" && value > 0 ? value : 0;
}
function sideWeight(node, side) {
	const own = positive(node[`border${side}Weight`]);
	if (node.borderStrokeWeightsIndependent === true || own > 0) return own;
	return positive(node.strokeWeight);
}
function strokeColor(node, nodeId, ctx) {
	const strokes = visiblePaints(node.strokePaints);
	const solid = solidPaintColor(strokes.find((paint) => paint.type === "SOLID"), nodeId, ctx);
	if (solid) return solid;
	const gradient = strokes.find((paint) => paint.type === "GRADIENT_LINEAR");
	return gradient ? rgbaToCss(gradient.stops?.[0]?.color, gradient.opacity ?? 1) : void 0;
}
function lineStyle(node) {
	return node.dashPattern?.some((length) => length > 0) ? "dashed" : "solid";
}
function strokeTakesNoLayoutSpace(node) {
	return node.strokesIncludedInLayout !== true && node.type !== "LINE";
}
function outlineOffset(node, weight) {
	if (node.strokeAlign === "INSIDE") return -weight;
	if (node.strokeAlign === "OUTSIDE") return 0;
	return -weight / 2;
}
function strokeExtents(node, weight) {
	if (node.strokeAlign === "INSIDE") return {
		outside: 0,
		inside: weight
	};
	if (node.strokeAlign === "OUTSIDE") return {
		outside: weight,
		inside: 0
	};
	return {
		outside: weight / 2,
		inside: weight / 2
	};
}
function coversWholePixels(extent) {
	return Number.isInteger(extent);
}
function extentShadows(extent, color, inset) {
	const whole = Math.floor(extent);
	const coverage = Math.round((extent - whole) * 100);
	const prefix = inset ? "inset " : "";
	return [...whole > 0 ? [`${prefix}0 0 0 ${whole}px ${color}`] : [], ...coverage > 0 ? [`${prefix}0 0 0 ${whole + 1}px color-mix(in srgb, ${color} ${coverage}%, transparent)`] : []];
}
function partialPixelShadow(extents, color) {
	return [...extentShadows(extents.outside, color, false), ...extentShadows(extents.inside, color, true)].join(", ");
}
function uniformStrokeStyles(node, weight, style, color) {
	const line = `${weight}px ${style} ${color}`;
	if (!strokeTakesNoLayoutSpace(node)) return { border: line };
	const extents = strokeExtents(node, weight);
	const blendsPartialPixels = !coversWholePixels(extents.outside) || !coversWholePixels(extents.inside);
	if (style === "solid" && blendsPartialPixels) return { boxShadow: partialPixelShadow(extents, color) };
	return {
		outline: line,
		outlineOffset: `${outlineOffset(node, weight)}px`
	};
}
function perSideBorderStyles(weights, style, color) {
	return Object.fromEntries(SIDES.map((side, i) => [side, weights[i]]).filter(([, weight]) => weight > 0).map(([side, weight]) => [`border${side}`, `${weight}px ${style} ${color}`]));
}
function mapStrokeStyles(node, nodeId, ctx) {
	const color = strokeColor(node, nodeId, ctx);
	if (!color) return {};
	const weights = SIDES.map((side) => sideWeight(node, side));
	if (weights.every((weight) => weight <= 0)) return {};
	const style = lineStyle(node);
	const top = weights[0] ?? 0;
	if (weights.every((weight) => weight === top)) return uniformStrokeStyles(node, top, style, color);
	return perSideBorderStyles(weights, style, color);
}

export { mapStrokeStyles };
