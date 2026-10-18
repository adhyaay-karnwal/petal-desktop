// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/image.ts
import { isIdentity, matrixOf } from "../model/matrix.js";
import { paintImageHashHex } from "../../utils/imagePaint.js";
import { firstVisibleImage } from "../model/paints.js";

var STRETCH_TO_BOX = {
	backgroundSize: "100% 100%",
	backgroundPosition: "center",
	backgroundRepeat: "no-repeat"
};
var COVER_BOX = {
	backgroundSize: "cover",
	backgroundPosition: "center",
	backgroundRepeat: "no-repeat"
};
function cropOffsetPercent(uv, sizePercent) {
	return sizePercent === 100 ? 0 : uv * sizePercent * 100 / (sizePercent - 100);
}
function cropWindowStyles(transform) {
	const m = matrixOf(transform);
	const widthPercent = 100 / (Math.hypot(m.m00, m.m10) || 1);
	const heightPercent = 100 / (Math.hypot(m.m01, m.m11) || 1);
	return {
		backgroundSize: `${widthPercent}% ${heightPercent}%`,
		backgroundPosition: `${cropOffsetPercent(m.m02, widthPercent)}% ${cropOffsetPercent(m.m12, heightPercent)}%`,
		backgroundRepeat: "no-repeat"
	};
}
function tiledImageStyles(paint) {
	const factor = paint.scale ?? 1;
	const { originalImageWidth: width, originalImageHeight: height } = paint;
	return {
		backgroundSize: width && height ? `${width * factor}px ${height * factor}px` : "auto",
		backgroundRepeat: "repeat",
		backgroundPosition: "top left"
	};
}
function imagePlacementStyles(paint) {
	const mode = paint.imageScaleMode ?? "FILL";
	if (mode === "TILE") return tiledImageStyles(paint);
	if (mode === "FIT") return {
		backgroundSize: "contain",
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat"
	};
	if (paint.transform && !isIdentity(matrixOf(paint.transform))) return cropWindowStyles(paint.transform);
	return mode === "STRETCH" ? STRETCH_TO_BOX : COVER_BOX;
}
function imageFilterCss(paint) {
	const filter = paint.paintFilter;
	if (!filter) return void 0;
	const exposure = filter.exposure ?? 0;
	const contrast = filter.contrast ?? 0;
	const parts = [
		(filter.vibrance ?? 0) < -.2 || (filter.tint ?? 0) < -.3 ? "grayscale(1)" : null,
		exposure !== 0 ? `brightness(${Math.max(.15, 1 + exposure * .5)})` : null,
		contrast !== 0 ? `contrast(${1 + contrast})` : null
	].filter((part) => part !== null);
	return parts.length > 0 ? parts.join(" ") : void 0;
}
function imageAdjustmentStyles(paint) {
	const filter = imageFilterCss(paint);
	return {
		...paint.opacity !== void 0 && paint.opacity < 1 ? { opacity: paint.opacity } : {},
		...filter ? { filter } : {}
	};
}
function resolvedImageUrl(paint, ctx) {
	const hashHex = paintImageHashHex(paint);
	if (!hashHex || ctx.options.skipImageHashes?.has(hashHex) || !ctx.options.resolveImageUrl) return null;
	return ctx.options.resolveImageUrl({
		hashHex,
		fileKey: ctx.parsed.meta.fileKey
	}) ?? null;
}
function imagePaintStyles(paint, ctx) {
	const url = resolvedImageUrl(paint, ctx);
	if (!url) return null;
	return {
		backgroundImage: `url("${url}")`,
		...imagePlacementStyles(paint),
		...imageAdjustmentStyles(paint)
	};
}
function recordPendingImage(ctx, figmaNodeId, imageHash, kind) {
	if (!imageHash) return;
	if (!ctx.pendingImagePatches.some((p) => p.figmaNodeId === figmaNodeId && p.kind === kind && p.imageHash === imageHash)) ctx.pendingImagePatches.push({
		figmaNodeId,
		imageHash,
		kind
	});
}
function mapImageFillStyles(node, nodeId, ctx) {
	const paint = firstVisibleImage(node.fillPaints);
	if (!paint) return null;
	const resolved = imagePaintStyles(paint, ctx);
	if (resolved) return resolved;
	const hashHex = paintImageHashHex(paint);
	if (ctx.options.deferImages && hashHex) {
		recordPendingImage(ctx, nodeId, hashHex, "fill");
		return {
			...imagePlacementStyles(paint),
			...imageAdjustmentStyles(paint)
		};
	}
	ctx.skipped.push({
		code: "IMAGE_FILL_SKIPPED",
		nodeId,
		...hashHex ? { imageHash: hashHex } : {}
	});
	return null;
}
function imageFillAsMaskStyles(imageFill) {
	const size = imageFill.backgroundSize ?? "100% 100%";
	const repeat = imageFill.backgroundRepeat ?? "no-repeat";
	const position = imageFill.backgroundPosition ?? "center";
	return {
		maskImage: imageFill.backgroundImage,
		WebkitMaskImage: imageFill.backgroundImage,
		maskSize: size,
		WebkitMaskSize: size,
		maskRepeat: repeat,
		WebkitMaskRepeat: repeat,
		maskPosition: position,
		WebkitMaskPosition: position
	};
}

export { imageFillAsMaskStyles, imagePaintStyles, mapImageFillStyles, recordPendingImage };
