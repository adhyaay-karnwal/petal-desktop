// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/pathScale.ts

var pathScaleByNode = /* @__PURE__ */ new WeakMap();
function pathScaleOf(node) {
	return pathScaleByNode.get(node);
}
function multiplyPathScale(node, x, y) {
	const previous = pathScaleByNode.get(node);
	pathScaleByNode.set(node, {
		x: (previous?.x ?? 1) * x,
		y: (previous?.y ?? 1) * y
	});
}

export { multiplyPathScale, pathScaleOf };
