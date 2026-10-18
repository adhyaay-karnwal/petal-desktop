// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/model/paints.ts

function isVisiblePaint(paint) {
	return paint.visible !== false;
}
function visiblePaints(paints) {
	return (paints ?? []).filter(isVisiblePaint);
}
function firstVisibleSolid(paints) {
	return paints?.find((paint) => paint.type === "SOLID" && isVisiblePaint(paint));
}
function firstVisibleImage(paints) {
	return paints?.find((paint) => paint.type === "IMAGE" && isVisiblePaint(paint));
}
function firstVisibleGradient(paints) {
	return paints?.find((paint) => isGradientPaint(paint) && isVisiblePaint(paint));
}
function hasVisibleImageFill(node) {
	return firstVisibleImage(node.fillPaints) !== void 0;
}
function isGradientPaint(paint) {
	return paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL";
}
function hasAnyVisiblePaint(paints) {
	return visiblePaints(paints).length > 0;
}

export { firstVisibleGradient, firstVisibleImage, firstVisibleSolid, hasAnyVisiblePaint, hasVisibleImageFill, isGradientPaint, visiblePaints };
