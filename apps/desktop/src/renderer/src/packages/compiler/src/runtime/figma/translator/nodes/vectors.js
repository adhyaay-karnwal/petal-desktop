// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/vectors.ts
import { hasVisibleImageFill } from "../model/paints.js";
import { firstSolidColor } from "../styles/color.js";
import { gradientFillOr } from "../vector/svgGradient.js";
import { svgStrokeProps } from "../vector/svgStroke.js";
import { vectorPaths } from "../vector/vectorPaths.js";
import { registerOne, registerVector } from "./register.js";
import { imageFillElement } from "./shapes.js";
import { ellipseNodePathD, isRing } from "../vector/ellipse.js";
import { booleanShapes } from "../vector/booleanPaths.js";
import { buildSvg } from "../vector/svgElement.js";

var convertVector = (input) => {
	const { store, parentId, node, nodeId, ctx, options } = input;
	if (hasVisibleImageFill(node)) return registerOne(store, parentId, imageFillElement(input));
	return registerVector(store, parentId, buildSvg(node, nodeId, ctx, vectorPaths(node, nodeId, ctx), options.asCanvasRoot));
};
var convertBooleanOperation = ({ store, parentId, node, nodeId, ctx, options }) => {
	const shapes = booleanShapes(node, nodeId, ctx);
	if (shapes.length === 0) return null;
	const fill = firstSolidColor(node.fillPaints, nodeId, ctx) ?? gradientFillOr(node, "currentColor");
	return registerVector(store, parentId, buildSvg(node, nodeId, ctx, shapes.map((shape) => ({
		...shape,
		fill
	})), options.asCanvasRoot));
};
var convertEllipse = ({ store, parentId, node, nodeId, ctx, options }) => {
	const d = ellipseNodePathD(node);
	if (!d) return null;
	return registerVector(store, parentId, buildSvg(node, nodeId, ctx, [{
		d,
		fill: firstSolidColor(node.fillPaints, nodeId, ctx) ?? gradientFillOr(node, "none"),
		fillRule: isRing(node) ? "evenodd" : "nonzero",
		strokeProps: svgStrokeProps(node, nodeId, ctx)
	}], options.asCanvasRoot));
};

export { convertBooleanOperation, convertEllipse, convertVector };
