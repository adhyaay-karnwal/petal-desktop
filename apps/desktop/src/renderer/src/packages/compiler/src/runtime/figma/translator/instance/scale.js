// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/scale.ts
import { isNearly } from "../model/matrix.js";
import { multiplyPathScale } from "./pathScale.js";

function isUnscaled(x, y) {
	return isNearly(x, 1) && isNearly(y, 1);
}
function scaleVectorGeometry(node, x, y) {
	if (isUnscaled(x, y)) return;
	const hasNetwork = node.vectorData?.vectorNetworkBlob !== void 0;
	const hasGeometry = (node.fillGeometry?.length ?? 0) > 0 || (node.strokeGeometry?.length ?? 0) > 0;
	if (hasNetwork && hasGeometry) {
		delete node.fillGeometry;
		delete node.strokeGeometry;
	} else if (hasGeometry) multiplyPathScale(node, x, y);
}
function bakeLayoutScale(subtree, symbolRootId, x, y) {
	if (isUnscaled(x, y)) return;
	for (const [id, node] of subtree) {
		if (id === symbolRootId) continue;
		if (node.size?.x !== void 0) node.size.x *= x;
		if (node.size?.y !== void 0) node.size.y *= y;
		if (node.transform?.m02 !== void 0) node.transform.m02 *= x;
		if (node.transform?.m12 !== void 0) node.transform.m12 *= y;
		scaleVectorGeometry(node, x, y);
	}
}
function ratio(instanceLength, designLength) {
	return instanceLength && designLength ? instanceLength / designLength : 1;
}
function planInstanceScale(instance, subtree, symbolRootId, designSize) {
	const unscaled = {
		cssScale: 1,
		designSize
	};
	const symbolRoot = subtree.get(symbolRootId);
	if (!symbolRoot || !designSize.x || !designSize.y) return unscaled;
	const uniform = instance.symbolData?.uniformScaleFactor;
	if (typeof uniform === "number" && Number.isFinite(uniform) && !isNearly(uniform, 1)) return {
		cssScale: uniform,
		designSize
	};
	const scaleX = ratio(instance.size?.x, designSize.x);
	const scaleY = ratio(instance.size?.y, designSize.y);
	if (Math.abs(scaleX - scaleY) < .001 && !isNearly(scaleX, 1)) return {
		cssScale: scaleX,
		designSize
	};
	if (isUnscaled(scaleX, scaleY)) return unscaled;
	bakeLayoutScale(subtree, symbolRootId, scaleX, scaleY);
	const instanceSize = instance.size;
	if (instanceSize?.x === void 0 || instanceSize?.y === void 0) return unscaled;
	symbolRoot.size = {
		x: instanceSize.x,
		y: instanceSize.y
	};
	return {
		cssScale: 1,
		designSize: {
			x: instanceSize.x,
			y: instanceSize.y
		}
	};
}

export { planInstanceScale };
