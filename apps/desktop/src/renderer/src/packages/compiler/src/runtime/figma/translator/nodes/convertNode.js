// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/convertNode.ts
import { NON_VISUAL_NODE_TYPES } from "../constants.js";
import { asFigmaNode, isFlaggedMask } from "../model/node.js";
import { htmlElement } from "../element.js";
import { needsRotationSlot, rotatedBox, rotationSlotStyles } from "../styles/rotationSlot.js";
import { registerOne } from "./register.js";
import { convertChildren } from "./children.js";
import { containerElement, convertLine, convertRectangle, convertText } from "./shapes.js";
import { convertInstance } from "./instance.js";
import { convertBooleanOperation, convertEllipse, convertVector } from "./vectors.js";

var convertContainer = (input) => {
	const elementId = registerOne(input.store, input.parentId, containerElement(input));
	input.convertChildren(elementId, input.nodeId, input.options.instanceSubtree);
	return elementId;
};
var CONVERTERS = {
	FRAME: convertContainer,
	GROUP: convertContainer,
	SYMBOL: convertContainer,
	COMPONENT: convertContainer,
	SECTION: convertContainer,
	INSTANCE: convertInstance,
	TEXT: convertText,
	RECTANGLE: convertRectangle,
	ROUNDED_RECTANGLE: convertRectangle,
	LINE: convertLine,
	VECTOR: convertVector,
	BOOLEAN_OPERATION: convertBooleanOperation,
	ELLIPSE: convertEllipse
};
function shouldConvert(node, ctx, options) {
	if (node.phase !== void 0 && node.phase !== "CREATED") return false;
	if (node.type !== void 0 && NON_VISUAL_NODE_TYPES.has(node.type)) return false;
	if (ctx.options.skipHidden && node.visible === false) return false;
	return node.guid?.sessionID !== 20003008 || !!options.instanceSubtree;
}
function convertElement(input) {
	const { node, nodeId, ctx, options } = input;
	if (!shouldConvert(node, ctx, options)) return null;
	if (isFlaggedMask(node)) {
		ctx.skipped.push({
			code: "MASK_SKIPPED",
			nodeId,
			maskType: node.type ?? "UNKNOWN"
		});
		input.convertChildren(input.parentId, nodeId, options.instanceSubtree);
		return null;
	}
	const converter = CONVERTERS[node.type ?? ""];
	if (!converter) {
		ctx.warnings.push({
			code: "UNSUPPORTED_NODE_TYPE",
			nodeId,
			figmaType: node.type ?? "UNKNOWN"
		});
		return null;
	}
	if (!needsRotationSlot(node, ctx) || options.rotationSlot) return converter(input);
	const box = rotatedBox(node);
	const slotId = registerOne(input.store, input.parentId, htmlElement("div", { styles: rotationSlotStyles(box) }));
	return converter({
		...input,
		parentId: slotId,
		options: {
			...options,
			rotationSlot: box.slot
		}
	});
}
function keepLayerName(store, elementId, node) {
	const name = typeof node.name === "string" ? node.name.trim() : "";
	const element = elementId ? store.byId.get(elementId) : void 0;
	if (elementId && element && name) store.byId.set(elementId, {
		...element,
		name
	});
}
function convertFigmaNode(store, parentId, figNode, nodeId, ctx, options = {}) {
	const node = asFigmaNode(figNode);
	const elementId = convertElement({
		store,
		parentId,
		node,
		nodeId,
		ctx,
		options,
		convertChildren: childrenConverter(store, ctx)
	});
	keepLayerName(store, elementId, node);
	return elementId;
}
function childrenConverter(store, ctx) {
	const convertOne = (parentId, child, childId, childOptions) => convertFigmaNode(store, parentId, child, childId, ctx, childOptions);
	return (parentId, figmaParentId, subtree) => convertChildren(store, parentId, figmaParentId, ctx, convertOne, subtree);
}

export { convertFigmaNode };
