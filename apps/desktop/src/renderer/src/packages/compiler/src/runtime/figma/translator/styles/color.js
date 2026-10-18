// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/color.ts
import { firstVisibleSolid } from "../model/paints.js";
import { rgbaToCss } from "../../utils/color.js";

function hasColorChannels(paint) {
	const color = paint.color;
	return !!color && (color.r !== void 0 || color.g !== void 0 || color.b !== void 0);
}
function solidPaintColor(paint, nodeId, ctx) {
	if (!paint || paint.visible === false) return void 0;
	if (paint.type !== "SOLID" && paint.type !== void 0) return void 0;
	if (hasColorChannels(paint)) return rgbaToCss(paint.color, paint.opacity ?? 1);
	if ("colorVar" in paint && paint.colorVar) ctx.warnings.push({
		code: "ALIAS_ONLY_PAINT",
		nodeId
	});
}
function firstSolidColor(paints, nodeId, ctx) {
	return solidPaintColor(firstVisibleSolid(paints), nodeId, ctx);
}

export { firstSolidColor, solidPaintColor };
