// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/vectorPaths.ts
import { getBlobBytes, resolveVectorNodePaths } from "../../../../../../../vendor/openfig-core.js";
import { pathScaleOf } from "../instance/pathScale.js";
import { scaleSvgPath } from "./svgPath.js";
import { vectorNetworkBlobToPaths } from "../../parser/vector.js";
import { firstSolidColor } from "../styles/color.js";
import { gradientFillOr } from "./svgGradient.js";
import { svgFillRule, svgStrokeProps } from "./svgStroke.js";

function fillForStyleId(node, nodeId, ctx, styleId) {
	const override = styleId !== 0 ? node.vectorData?.styleOverrideTable?.find((entry) => entry.styleID === styleId) : void 0;
	if (override?.fillPaints?.length === 0) return void 0;
	return (override && firstSolidColor(override.fillPaints, nodeId, ctx)) ?? firstSolidColor(node.fillPaints, nodeId, ctx);
}
function warnMissingGeometryBlobs(node, nodeId, ctx) {
	const geometry = [...node.fillGeometry ?? [], ...node.strokeGeometry ?? []];
	for (const { commandsBlob } of geometry) if (typeof commandsBlob === "number" && !getBlobBytes(ctx.parsed.doc, commandsBlob)) ctx.warnings.push({
		code: "MISSING_BLOB",
		nodeId,
		blobIndex: commandsBlob
	});
}
function vectorNetworkPaths(node, nodeId, ctx) {
	const vectorData = node.vectorData;
	const blobIndex = vectorData?.vectorNetworkBlob;
	if (!vectorData || blobIndex === void 0) return [];
	const bytes = getBlobBytes(ctx.parsed.doc, blobIndex);
	if (!bytes) {
		ctx.warnings.push({
			code: "MISSING_BLOB",
			nodeId,
			blobIndex
		});
		return [];
	}
	const loops = vectorNetworkBlobToPaths(bytes, {
		normalizedSize: vectorData.normalizedSize,
		size: node.size,
		nodeCornerRadius: node.cornerRadius,
		styleOverrideTable: vectorData.styleOverrideTable
	});
	const fill = fillForStyleId(node, nodeId, ctx, 0);
	return loops.map((loop) => ({
		d: loop.d,
		fill: loop.strokeOnly ? "none" : fill ?? gradientFillOr(node, "none"),
		fillRule: svgFillRule(loop.windingRule),
		strokeProps: svgStrokeProps(node, nodeId, ctx)
	}));
}
function vectorPaths(node, nodeId, ctx) {
	warnMissingGeometryBlobs(node, nodeId, ctx);
	const geometry = resolveVectorNodePaths(ctx.parsed.doc, node);
	const scale = pathScaleOf(node);
	const paths = [...geometry.fill.map((path) => ({
		d: scaleSvgPath(path.svgPath, scale),
		fill: fillForStyleId(node, nodeId, ctx, path.styleID ?? 0) ?? gradientFillOr(node, "currentColor"),
		fillRule: svgFillRule(path.windingRule),
		strokeProps: {}
	})), ...geometry.stroke.map((path) => ({
		d: scaleSvgPath(path.svgPath, scale),
		fill: "none",
		fillRule: svgFillRule(path.windingRule),
		strokeProps: svgStrokeProps(node, nodeId, ctx)
	}))];
	return paths.length > 0 ? paths : vectorNetworkPaths(node, nodeId, ctx);
}
function filledPathsOrAll(paths) {
	const filled = paths.filter((path) => path.fill && path.fill !== "none");
	return filled.length > 0 ? filled : paths;
}

export { filledPathsOrAll, vectorPaths };
