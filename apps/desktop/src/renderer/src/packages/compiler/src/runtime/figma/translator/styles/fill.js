// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/fill.ts
import { paintImageHashHex } from "../../utils/imagePaint.js";
import { isGradientPaint, visiblePaints } from "../model/paints.js";
import { imagePaintStyles, mapImageFillStyles, recordPendingImage } from "./image.js";
import { firstSolidColor, solidPaintColor } from "./color.js";
import { gradientPaintCss } from "./gradient.js";

function needsLayeredBackground(paints) {
	return paints.length > 1 || paints.some(isGradientPaint);
}
function gradientLayer(paint, width, height) {
	const image = gradientPaintCss(paint, width, height);
	return image ? {
		image,
		size: "100% 100%",
		position: "center",
		repeat: "no-repeat"
	} : null;
}
function imageLayer(paint, nodeId, ctx) {
	const styles = imagePaintStyles(paint, ctx);
	if (!styles?.backgroundImage) {
		if (ctx.options.deferImages) recordPendingImage(ctx, nodeId, paintImageHashHex(paint), "layered");
		return null;
	}
	return {
		image: String(styles.backgroundImage),
		size: String(styles.backgroundSize ?? "100% 100%"),
		position: String(styles.backgroundPosition ?? "center"),
		repeat: String(styles.backgroundRepeat ?? "no-repeat")
	};
}
function mapLayeredFillStyles(paints, nodeId, ctx, width = 0, height = 0) {
	const visible = visiblePaints(paints);
	if (visible.length === 0 || !needsLayeredBackground(visible)) return null;
	const layers = [];
	let bottomSolid;
	for (const paint of [...visible].reverse()) if (isGradientPaint(paint)) {
		const layer = gradientLayer(paint, width, height);
		if (layer) layers.push(layer);
	} else if (paint.type === "IMAGE") {
		const layer = imageLayer(paint, nodeId, ctx);
		if (layer) layers.push(layer);
	} else if (paint.type === "SOLID") bottomSolid = solidPaintColor(paint, nodeId, ctx) ?? bottomSolid;
	const color = bottomSolid ? { backgroundColor: bottomSolid } : {};
	if (layers.length === 0) return bottomSolid ? color : null;
	return {
		backgroundImage: layers.map((layer) => layer.image).join(", "),
		backgroundSize: layers.map((layer) => layer.size).join(", "),
		backgroundPosition: layers.map((layer) => layer.position).join(", "),
		backgroundRepeat: layers.map((layer) => layer.repeat).join(", "),
		...color
	};
}
function mapFillStyles(node, nodeId, ctx) {
	const layered = mapLayeredFillStyles(node.fillPaints, nodeId, ctx, node.size?.x ?? 0, node.size?.y ?? 0);
	if (layered) return layered;
	const imageFill = mapImageFillStyles(node, nodeId, ctx);
	const solid = firstSolidColor(node.fillPaints, nodeId, ctx);
	if (imageFill) return imageFill;
	return solid ? { backgroundColor: solid } : {};
}

export { mapFillStyles, mapLayeredFillStyles };
