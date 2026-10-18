// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/gradient.ts
import { extractRenderableGradientFill, resolveGradientGeometry } from "../../../../../../../vendor/openfig-core.js";
import { rgbaToCss } from "../../utils/color.js";

function gradientStopsCss(fill) {
	return fill.stops.map((stop) => {
		const color = rgbaToCss(stop.color, fill.opacity);
		return color ? `${color} ${(stop.position * 100).toFixed(2)}%` : null;
	}).filter((stop) => stop !== null).join(", ");
}
function gradientPaintCss(paint, width, height) {
	const fill = extractRenderableGradientFill([paint]);
	if (!fill) return null;
	const geometry = resolveGradientGeometry(fill, width > 0 ? width : 1, height > 0 ? height : 1);
	if (!geometry) return null;
	const stops = gradientStopsCss(fill);
	if (!stops) return null;
	if (geometry.type === "linear") {
		const dx = geometry.end.x - geometry.start.x;
		const dy = geometry.end.y - geometry.start.y;
		return `linear-gradient(${Math.round(Math.atan2(dx, -dy) * 180 / Math.PI)}deg, ${stops})`;
	}
	return `radial-gradient(ellipse ${geometry.radiusX}px ${geometry.radiusY}px at ${geometry.center.x}px ${geometry.center.y}px, ${stops})`;
}

export { gradientPaintCss };
