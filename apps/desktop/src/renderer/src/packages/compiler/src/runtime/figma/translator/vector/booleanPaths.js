// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/booleanPaths.ts
import { figGuidKey } from "../../utils/node.js";
import { figmaChildren } from "../model/node.js";
import { hasIdentityLinearPart, matrixOf } from "../model/matrix.js";
import { applyFigTransformToSvgPath, translateSvgPath } from "./svgPath.js";
import { filledPathsOrAll, vectorPaths } from "./vectorPaths.js";
import { ellipseNodePathD } from "./ellipse.js";

var EVEN_ODD_OPERATIONS = /* @__PURE__ */ new Set([
	"EXCLUDE",
	"SUBTRACT",
	"XOR"
]);
function operationOf(node) {
	return node.booleanOperation ?? "UNION";
}
function isPathOperand(node) {
	return node.type === "VECTOR" || node.type === "ELLIPSE";
}
function operandLocalPaths(node, nodeId, ctx) {
	if (node.type !== "ELLIPSE") return vectorPaths(node, nodeId, ctx);
	const d = ellipseNodePathD(node);
	return d ? [{
		d,
		fill: "currentColor",
		fillRule: "nonzero",
		strokeProps: {}
	}] : [];
}
function placeInBoolean(d, node, offset) {
	const m = matrixOf(node.transform);
	const x = m.m02 + offset.x;
	const y = m.m12 + offset.y;
	if (!node.transform || hasIdentityLinearPart(m)) return translateSvgPath(d, x, y);
	return applyFigTransformToSvgPath(d, {
		...m,
		m02: x,
		m12: y
	});
}
function operandPathData(node, nodeId, ctx, offset) {
	return filledPathsOrAll(operandLocalPaths(node, nodeId, ctx)).map((path) => placeInBoolean(path.d, node, offset));
}
function childOffset(child, offset) {
	return {
		x: offset.x + (child.transform?.m02 ?? 0),
		y: offset.y + (child.transform?.m12 ?? 0)
	};
}
function shape(d, fillRule) {
	return {
		d,
		fill: void 0,
		fillRule,
		strokeProps: {}
	};
}
function childrenWithIds(node, nodeId, ctx) {
	return figmaChildren(ctx, nodeId).flatMap((child) => {
		const childId = figGuidKey(child.guid);
		const pair = childId ? [child, childId] : null;
		return pair ? [pair] : [];
	});
}
function unionShapes(node, nodeId, ctx, offset) {
	return childrenWithIds(node, nodeId, ctx).flatMap(([child, childId]) => {
		if (isPathOperand(child)) {
			const parts = operandPathData(child, childId, ctx, offset);
			return parts.length > 0 ? [shape(parts.join(" "), "nonzero")] : [];
		}
		if (child.type === "BOOLEAN_OPERATION") return booleanShapes(child, childId, ctx, childOffset(child, offset));
		return [];
	});
}
function splitRepeatedStamps(node, nodeId, ctx, offset) {
	const entries = childrenWithIds(node, nodeId, ctx).filter(([child]) => isPathOperand(child)).flatMap(([child, childId]) => filledPathsOrAll(operandLocalPaths(child, childId, ctx)).map((path) => ({
		fingerprint: path.d.trim(),
		placed: placeInBoolean(path.d, child, offset)
	})));
	const counts = /* @__PURE__ */ new Map();
	for (const { fingerprint } of entries) counts.set(fingerprint, (counts.get(fingerprint) ?? 0) + 1);
	const isRepeated = (fingerprint) => (counts.get(fingerprint) ?? 0) > 1;
	return {
		operands: entries.filter((entry) => !isRepeated(entry.fingerprint)).map((entry) => entry.placed),
		overlays: entries.filter((entry) => isRepeated(entry.fingerprint)).map((entry) => entry.placed)
	};
}
function combinedShapes(node, nodeId, ctx, offset) {
	const operation = operationOf(node);
	const parts = [];
	const overlays = [];
	for (const [child, childId] of childrenWithIds(node, nodeId, ctx)) if (isPathOperand(child)) parts.push(...operandPathData(child, childId, ctx, offset));
	else if (child.type === "BOOLEAN_OPERATION") {
		const nestedOffset = childOffset(child, offset);
		if (operation === "XOR" && operationOf(child) === "UNION") {
			const split = splitRepeatedStamps(child, childId, ctx, nestedOffset);
			parts.push(...split.operands);
			overlays.push(...split.overlays);
		} else parts.push(...booleanShapes(child, childId, ctx, nestedOffset).map((nested) => nested.d));
	}
	const fillRule = EVEN_ODD_OPERATIONS.has(operation) ? "evenodd" : "nonzero";
	return [...parts.length > 0 ? [shape(parts.join(" "), fillRule)] : [], ...overlays.map((d) => shape(d, "nonzero"))];
}
function booleanShapes(node, nodeId, ctx, offset = {
	x: 0,
	y: 0
}) {
	return operationOf(node) === "UNION" ? unionShapes(node, nodeId, ctx, offset) : combinedShapes(node, nodeId, ctx, offset);
}

export { booleanShapes };
