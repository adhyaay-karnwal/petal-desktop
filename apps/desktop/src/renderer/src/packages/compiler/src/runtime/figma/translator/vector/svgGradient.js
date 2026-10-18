// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/svgGradient.ts
import { extractRenderableGradientFill, resolveGradientGeometry } from "../../../../../../../vendor/openfig-core.js";
import { SVG_GRADIENT_FILL } from "../constants.js";
import { htmlElement } from "../element.js";
import { firstVisibleGradient, firstVisibleSolid } from "../model/paints.js";
import { rgbaToCss } from "../../utils/color.js";

function gradientFillOr(node, fallback) {
	return !firstVisibleSolid(node.fillPaints) && !!firstVisibleGradient(node.fillPaints) ? SVG_GRADIENT_FILL : fallback;
}
function gradientElement(geometry, id) {
	if (geometry.type === "linear") return htmlElement("linearGradient", { props: {
		id,
		gradientUnits: "userSpaceOnUse",
		x1: geometry.start.x,
		y1: geometry.start.y,
		x2: geometry.end.x,
		y2: geometry.end.y
	} });
	const { center, radiusX, radiusY, angle } = geometry;
	const degrees = angle * 180 / Math.PI;
	return htmlElement("radialGradient", { props: {
		id,
		gradientUnits: "userSpaceOnUse",
		cx: 0,
		cy: 0,
		r: 1,
		gradientTransform: `translate(${center.x} ${center.y}) rotate(${degrees}) scale(${radiusX} ${radiusY})`
	} });
}
function svgGradientDef(node, id) {
	const fill = extractRenderableGradientFill([firstVisibleGradient(node.fillPaints)].filter((p) => !!p));
	const width = node.size?.x ?? 0;
	const height = node.size?.y ?? 0;
	const geometry = fill && resolveGradientGeometry(fill, width > 0 ? width : 1, height > 0 ? height : 1);
	if (!fill || !geometry) return null;
	const stops = fill.stops.map((stop) => htmlElement("stop", { props: {
		offset: stop.position,
		stopColor: rgbaToCss(stop.color, fill.opacity)
	} }));
	return {
		element: gradientElement(geometry, id),
		children: stops
	};
}

export { gradientFillOr, svgGradientDef };
