// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/position.ts
import { flipKindOf, hasIdentityLinearPart, isAxisAligned, matrixOf } from "../model/matrix.js";

var FLIP_TRANSFORM = {
	horizontal: "scaleX(-1)",
	vertical: "scaleY(-1)",
	both: "scale(-1)"
};
function linearTransformStyles(m) {
	const flip = flipKindOf(m);
	if (flip) return {
		transform: FLIP_TRANSFORM[flip],
		transformOrigin: "50% 50%"
	};
	if (hasIdentityLinearPart(m)) return {};
	return {
		transform: `matrix(${m.m00}, ${m.m10}, ${m.m01}, ${m.m11}, 0, 0)`,
		transformOrigin: "0 0"
	};
}
function boxOrigin(node, m) {
	const size = node.size;
	if (!isAxisAligned(m)) return {
		left: m.m02,
		top: m.m12
	};
	return {
		left: m.m00 < 0 && size?.x !== void 0 ? m.m02 - size.x : m.m02,
		top: m.m11 < 0 && size?.y !== void 0 ? m.m12 - size.y : m.m12
	};
}
function absolutePositionStyles(node) {
	const m = matrixOf(node.transform);
	const size = node.size;
	return {
		position: "absolute",
		...boxOrigin(node, m),
		...linearTransformStyles(m),
		...size?.x !== void 0 ? { width: size.x } : {},
		...size?.y !== void 0 ? { height: size.y } : {}
	};
}

export { absolutePositionStyles, linearTransformStyles };
