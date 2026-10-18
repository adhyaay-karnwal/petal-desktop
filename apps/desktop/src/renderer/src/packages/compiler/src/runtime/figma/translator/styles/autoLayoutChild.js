// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/autoLayoutChild.ts
import { figmaParent } from "../model/node.js";
import { matrixOf } from "../model/matrix.js";
import { linearTransformStyles } from "./position.js";
import { cssAlign } from "./stackAlign.js";

function isHugSizing(sizing) {
	return sizing === "RESIZE_TO_FIT" || sizing === "RESIZE_TO_FIT_WITH_IMPLICIT_SIZE" || sizing === "AUTO";
}
function dropsMeasuredSize(sizing) {
	return sizing === "RESIZE_TO_FIT" || sizing === "AUTO";
}
function sizingThatDecidesHug(node) {
	if (node.stackMode === "HORIZONTAL") return node.stackCounterSizing;
	if (node.stackMode === "VERTICAL") return node.stackPrimarySizing;
}
function hugsContent(node, ownStackMode) {
	const sizing = sizingThatDecidesHug(node);
	return node.stackMode === ownStackMode && isHugSizing(sizing) && dropsMeasuredSize(sizing);
}
function alignsToStart(parent) {
	const align = parent.stackCounterAlignItems;
	return align === void 0 || align === "MIN" || align === "STRETCH";
}
function isGrowing(node) {
	return !!node.stackChildPrimaryGrow;
}
function widthStyles(node, parent) {
	const width = node.size?.x;
	if (width === void 0) return {};
	if (hugsContent(node, "VERTICAL")) return {
		flexShrink: 0,
		...parent.stackMode === "HORIZONTAL" && alignsToStart(parent) ? { alignSelf: "flex-start" } : {}
	};
	if (isGrowing(node)) return { width };
	return node.stackPrimarySizing === "FIXED" && parent.stackMode === "HORIZONTAL" ? {
		width,
		flex: `0 0 ${width}px`
	} : {
		width,
		flexShrink: 0
	};
}
function heightStyles(node, parent) {
	const height = node.size?.y;
	if (height === void 0) return {};
	if (hugsContent(node, "HORIZONTAL")) return {
		flexShrink: 0,
		...parent.stackMode === "VERTICAL" && alignsToStart(parent) ? { alignSelf: "flex-start" } : {}
	};
	return !isGrowing(node) && node.stackPrimarySizing === "FIXED" && parent.stackMode === "VERTICAL" ? {
		height,
		flex: `0 0 ${height}px`
	} : { height };
}
function hasFixedCrossAxisSize(node, parent) {
	if (parent.stackMode === "VERTICAL") return node.size?.x !== void 0;
	if (parent.stackMode === "HORIZONTAL") return node.size?.y !== void 0;
	return false;
}
function alignSelfStyles(node, parent) {
	const alignSelf = cssAlign(node.stackChildAlignSelf);
	if (!alignSelf) return {};
	return alignSelf === "stretch" && hasFixedCrossAxisSize(node, parent) && !isGrowing(node) ? {} : { alignSelf };
}
function growStyles(node, parent) {
	if (!isGrowing(node)) return {};
	const width = node.size?.x;
	if (parent.stackMode === "HORIZONTAL" && parent.stackPrimaryAlignItems === "CENTER" && width !== void 0) return { flex: `0 0 ${width}px` };
	return {
		flexGrow: 1,
		flexShrink: 1,
		minWidth: 0,
		minHeight: 0
	};
}
function mapAutoLayoutChildStyles(node, ctx) {
	const parent = figmaParent(node, ctx);
	if (!parent) return {};
	return {
		...linearTransformStyles(matrixOf(node.transform)),
		...widthStyles(node, parent),
		...heightStyles(node, parent),
		...alignSelfStyles(node, parent),
		...growStyles(node, parent)
	};
}

export { mapAutoLayoutChildStyles };
