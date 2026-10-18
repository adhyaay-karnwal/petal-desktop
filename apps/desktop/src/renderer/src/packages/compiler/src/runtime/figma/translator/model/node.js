// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/model/node.ts
import { figGuidKey } from "../../utils/node.js";

function asFigmaNode(node) {
	return node;
}
function figmaNodeById(ctx, id) {
	const node = ctx.sceneIndex.nodeById.get(id);
	return node && asFigmaNode(node);
}
function* allFigmaNodes(ctx) {
	for (const node of ctx.sceneIndex.nodeById.values()) yield asFigmaNode(node);
}
function figmaChildren(ctx, parentId) {
	return (ctx.sceneIndex.childrenByParent.get(parentId) ?? []).map(asFigmaNode);
}
function parentIdOf(node) {
	return figGuidKey(node.parentIndex?.guid);
}
function figmaParent(node, ctx) {
	const parentId = parentIdOf(node);
	if (!parentId) return void 0;
	return ctx.instanceSubtree?.nodes.get(parentId) ?? figmaNodeById(ctx, parentId);
}
function isAutoLayoutFrame(node) {
	return node.stackMode === "HORIZONTAL" || node.stackMode === "VERTICAL";
}
function isAbsoluteInAutoLayout(node) {
	return node.stackPositioning === "ABSOLUTE";
}
function flowsInAutoLayout(node, ctx) {
	const parent = figmaParent(node, ctx);
	return !!parent && isAutoLayoutFrame(parent) && !isAbsoluteInAutoLayout(node);
}
function isMaskNode(node) {
	return node.isMask === true || node.mask === true || !!node.maskType;
}
function isFlaggedMask(node) {
	return node.isMask === true || node.mask === true;
}
function byLayerOrder(a, b) {
	const pa = a.parentIndex?.position ?? "";
	const pb = b.parentIndex?.position ?? "";
	return pa < pb ? -1 : pa > pb ? 1 : 0;
}

export { allFigmaNodes, asFigmaNode, byLayerOrder, figmaChildren, figmaNodeById, figmaParent, flowsInAutoLayout, isAbsoluteInAutoLayout, isAutoLayoutFrame, isFlaggedMask, isMaskNode, parentIdOf };
