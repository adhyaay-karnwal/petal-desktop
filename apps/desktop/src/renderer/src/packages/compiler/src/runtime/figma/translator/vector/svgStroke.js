// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/svgStroke.ts
import { firstSolidColor } from "../styles/color.js";

var LINECAP = {
	ROUND: "round",
	SQUARE: "square"
};
var LINEJOIN = {
	ROUND: "round",
	BEVEL: "bevel"
};
function svgStrokeProps(node, nodeId, ctx) {
	const dashPattern = node.dashPattern ?? [];
	const dashed = dashPattern.some((length) => length > 0);
	return {
		stroke: firstSolidColor(node.strokePaints, nodeId, ctx) ?? "none",
		strokeWidth: node.strokeWeight ?? 0,
		strokeLinecap: (node.strokeCap && LINECAP[node.strokeCap]) ?? "butt",
		strokeLinejoin: (node.strokeJoin && LINEJOIN[node.strokeJoin]) ?? "miter",
		...dashed ? { strokeDasharray: dashPattern.join(" ") } : {}
	};
}
function svgFillRule(windingRule) {
	return windingRule === "ODD" || windingRule === "EVENODD" ? "evenodd" : "nonzero";
}
function strokeOverflow(paths) {
	return paths.reduce((max, path) => {
		const { stroke, strokeWidth } = path.strokeProps;
		return typeof strokeWidth === "number" && strokeWidth > 0 && !!stroke && stroke !== "none" ? Math.max(max, strokeWidth / 2) : max;
	}, 0);
}

export { strokeOverflow, svgFillRule, svgStrokeProps };
