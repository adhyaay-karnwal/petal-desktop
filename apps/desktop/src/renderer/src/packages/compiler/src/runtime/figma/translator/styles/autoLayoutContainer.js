// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/autoLayoutContainer.ts
import { figmaChildren, isAutoLayoutFrame, isMaskNode } from "../model/node.js";
import { hasAnyVisiblePaint } from "../model/paints.js";
import { cssAlign, isDistributedAlign } from "./stackAlign.js";

function paddingCss(node) {
	const { stackVerticalPadding: top, stackPaddingRight: right, stackPaddingBottom: bottom, stackHorizontalPadding: left } = node;
	if (top === void 0 && right === void 0 && bottom === void 0 && left === void 0) return void 0;
	return `${top ?? 0}px ${right ?? 0}px ${bottom ?? 0}px ${left ?? 0}px`;
}
function flexStyles(node) {
	if (!isAutoLayoutFrame(node)) return {};
	const padding = paddingCss(node);
	const justifyContent = cssAlign(node.stackPrimaryAlignItems);
	const gapApplies = node.stackSpacing !== void 0 && !isDistributedAlign(node.stackPrimaryAlignItems);
	return {
		display: "flex",
		flexDirection: node.stackMode === "HORIZONTAL" ? "row" : "column",
		...gapApplies ? { gap: node.stackSpacing } : {},
		...padding ? { padding } : {},
		...justifyContent ? { justifyContent } : {},
		alignItems: cssAlign(node.stackCounterAlignItems) ?? "flex-start"
	};
}
function isFormerGroup(node) {
	return node.type === "FRAME" && node.resizeToFit === true && !hasAnyVisiblePaint(node.fillPaints) && !hasAnyVisiblePaint(node.strokePaints) && !hasAnyVisiblePaint(node.backgroundPaints);
}
function clipsContent(node) {
	if (node.clipsContent !== void 0) return node.clipsContent;
	return node.frameMaskDisabled !== true && !isFormerGroup(node);
}
function clipStyles(node, nodeId, ctx) {
	if (!clipsContent(node)) return {};
	return figmaChildren(ctx, nodeId).some(isMaskNode) ? {} : { overflow: "hidden" };
}
function mapContainerLayoutStyles(node, nodeId, ctx) {
	return {
		...flexStyles(node),
		...clipStyles(node, nodeId, ctx)
	};
}

export { mapContainerLayoutStyles };
