// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/maskGroup.ts
import { figmaNodeById } from "../model/node.js";
import { htmlElement, withFigmaNodeId } from "../element.js";
import { paintImageHashHex } from "../../utils/imagePaint.js";
import { firstVisibleImage } from "../model/paints.js";
import { imageFillAsMaskStyles, mapImageFillStyles, recordPendingImage } from "../styles/image.js";
import { maskClipPathD } from "../vector/clipPath.js";

function deferredImageUrl(node, ctx) {
	const paint = firstVisibleImage(node.fillPaints);
	const hashHex = paint && paintImageHashHex(paint);
	if (!hashHex || !ctx.options.resolveImageUrl) return null;
	return ctx.options.resolveImageUrl({
		hashHex,
		fileKey: ctx.parsed.meta.fileKey
	}) ?? null;
}
function imageMaskStyles(mask, ctx) {
	const paint = firstVisibleImage(mask.node.fillPaints);
	if (!paint) return null;
	if (ctx.options.deferImages && !deferredImageUrl(mask.node, ctx)) {
		recordPendingImage(ctx, mask.id, paintImageHashHex(paint), "mask");
		return null;
	}
	const imageFill = mapImageFillStyles(mask.node, mask.id, ctx);
	return imageFill?.backgroundImage ? imageFillAsMaskStyles(imageFill) : null;
}
function isPendingMask(ctx, maskId) {
	return ctx.pendingImagePatches.some((patch) => patch.figmaNodeId === maskId && patch.kind === "mask");
}
function maskWrapper(masks, figmaParentId, ctx) {
	const clipParts = [];
	let imageMask = null;
	let pendingMaskId;
	for (const mask of masks) {
		const clip = maskClipPathD(mask.node, mask.id, ctx);
		if (clip) clipParts.push(clip);
		const styles = imageMaskStyles(mask, ctx);
		if (styles) imageMask = styles;
		else if (isPendingMask(ctx, mask.id)) pendingMaskId = mask.id;
		ctx.skipped.push({
			code: "MASK_SKIPPED",
			nodeId: mask.id,
			maskType: mask.node.maskType ?? "ALPHA"
		});
	}
	const frameSize = figmaNodeById(ctx, figmaParentId)?.size;
	const clips = !!imageMask || !!pendingMaskId || clipParts.length > 0;
	const wrapper = htmlElement("div", { styles: {
		position: "absolute",
		left: 0,
		top: 0,
		width: frameSize?.x ?? "100%",
		height: frameSize?.y ?? "100%",
		overflow: clips ? "hidden" : "visible",
		...clipParts.length > 0 ? { clipPath: `path('${clipParts.join(" ")}')` } : {},
		...imageMask ?? {}
	} });
	return pendingMaskId ? withFigmaNodeId(wrapper, pendingMaskId) : wrapper;
}

export { maskWrapper };
