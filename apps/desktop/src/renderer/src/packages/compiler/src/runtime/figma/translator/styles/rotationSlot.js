// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/rotationSlot.ts
import { flowsInAutoLayout } from "../model/node.js";
import { isRotatedOrSkewed, linearBounds, matrixOf } from "../model/matrix.js";

var DRAWN_AS_SVG = /* @__PURE__ */ new Set([
	"VECTOR",
	"BOOLEAN_OPERATION",
	"ELLIPSE"
]);
function drawnSize(node) {
	return {
		width: node.size?.x ?? 0,
		height: node.type === "LINE" ? 1 : node.size?.y ?? 0
	};
}
function needsRotationSlot(node, ctx) {
	return !DRAWN_AS_SVG.has(node.type) && isRotatedOrSkewed(matrixOf(node.transform)) && flowsInAutoLayout(node, ctx);
}
function rotatedBox(node) {
	const { width, height } = drawnSize(node);
	const bounds = linearBounds(matrixOf(node.transform), width, height);
	return {
		width: bounds.maxX - bounds.minX,
		height: bounds.maxY - bounds.minY,
		slot: {
			left: -bounds.minX,
			top: -bounds.minY
		}
	};
}
function rotationSlotStyles(box) {
	return {
		position: "relative",
		width: box.width,
		height: box.height,
		flexShrink: 0
	};
}
function rotatedInSlotStyles(node, slot) {
	const m = matrixOf(node.transform);
	const { width, height } = drawnSize(node);
	return {
		position: "absolute",
		left: 0,
		top: 0,
		width,
		height,
		transform: `matrix(${m.m00}, ${m.m10}, ${m.m01}, ${m.m11}, ${slot.left}, ${slot.top})`,
		transformOrigin: "0 0"
	};
}

export { needsRotationSlot, rotatedBox, rotatedInSlotStyles, rotationSlotStyles };
