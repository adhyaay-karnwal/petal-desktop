// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/cornerRadius.ts
import { figmaParent, parentIdOf } from "../model/node.js";

function cornerRadiusCss(node) {
	if (node.cornerRadius !== void 0 && node.cornerRadius > 0) return `${node.cornerRadius}px`;
	const { rectangleTopLeftCornerRadius: tl, rectangleTopRightCornerRadius: tr, rectangleBottomRightCornerRadius: br, rectangleBottomLeftCornerRadius: bl } = node;
	if (tl === void 0 && tr === void 0 && br === void 0 && bl === void 0) return void 0;
	return `${tl ?? 0}px ${tr ?? 0}px ${br ?? 0}px ${bl ?? 0}px`;
}
function verticalStackParentOfFirstChild(node, ctx) {
	const parent = figmaParent(node, ctx);
	const parentId = parentIdOf(node);
	if (!parent || parent.stackMode !== "VERTICAL" || !parentId) return void 0;
	return ctx.sceneIndex.childrenByParent.get(parentId)?.[0] === node ? parent : void 0;
}
function inheritedTopRadiusCss(node, ctx) {
	const parent = verticalStackParentOfFirstChild(node, ctx);
	if (!parent || cornerRadiusCss(node)) return void 0;
	const topLeft = parent.rectangleTopLeftCornerRadius ?? parent.cornerRadius;
	const topRight = parent.rectangleTopRightCornerRadius ?? parent.cornerRadius;
	if (!topLeft && !topRight) return void 0;
	return `${topLeft ?? 0}px ${topRight ?? 0}px 0 0`;
}

export { cornerRadiusCss, inheritedTopRadiusCss };
