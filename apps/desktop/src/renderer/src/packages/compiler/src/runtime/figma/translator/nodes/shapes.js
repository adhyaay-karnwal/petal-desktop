// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/shapes.ts
import { htmlElement, textElement, withFigmaNodeId } from "../element.js";
import { hasVisibleImageFill } from "../model/paints.js";
import { localClipPathD } from "../vector/clipPath.js";
import { registerOne } from "./register.js";
import { figmaTextContent } from "../styles/textContent.js";
import { nodeStylesToCss } from "../styles/index.js";

function hasPendingImage(ctx, nodeId) {
	return ctx.pendingImagePatches.some((patch) => patch.figmaNodeId === nodeId);
}
function tagIfImagePending(element, nodeId, ctx) {
	return hasPendingImage(ctx, nodeId) ? withFigmaNodeId(element, nodeId) : element;
}
function containerStyles({ node, nodeId, ctx, options }) {
	return nodeStylesToCss(node, nodeId, ctx, {
		container: true,
		asCanvasRoot: options.asCanvasRoot,
		rotationSlot: options.rotationSlot
	});
}
function containerElement(input) {
	return tagIfImagePending(htmlElement("div", { styles: containerStyles(input) }), input.nodeId, input.ctx);
}
function imageClipStyles(node, nodeId, ctx, styles) {
	if (node.type === "VECTOR") {
		const clipD = localClipPathD(node, nodeId, ctx);
		return clipD ? {
			clipPath: `path('${clipD}')`,
			overflow: "hidden"
		} : {};
	}
	return styles.borderRadius || hasVisibleImageFill(node) ? { overflow: "hidden" } : {};
}
function imageFillElement(input) {
	const { node, nodeId, ctx } = input;
	const styles = containerStyles(input);
	return tagIfImagePending(htmlElement("div", { styles: {
		...styles,
		...imageClipStyles(node, nodeId, ctx, styles)
	} }), nodeId, ctx);
}
var convertText = ({ store, parentId, node, nodeId, ctx, options }) => registerOne(store, parentId, textElement(figmaTextContent(node), nodeStylesToCss(node, nodeId, ctx, {
	asCanvasRoot: options.asCanvasRoot,
	rotationSlot: options.rotationSlot
})));
var convertRectangle = (input) => registerOne(input.store, input.parentId, hasVisibleImageFill(input.node) ? imageFillElement(input) : containerElement(input));
var convertLine = (input) => registerOne(input.store, input.parentId, htmlElement("div", { styles: containerStyles(input) }));

export { containerElement, convertLine, convertRectangle, convertText, imageFillElement };
