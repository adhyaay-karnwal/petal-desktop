// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/clipPath.ts
import { applyFigTransformToSvgPath } from "./svgPath.js";
import { filledPathsOrAll, vectorPaths } from "./vectorPaths.js";

function localClipPathD(node, nodeId, ctx) {
	const paths = filledPathsOrAll(vectorPaths(node, nodeId, ctx));
	return paths.length > 0 ? paths.map((path) => path.d).join(" ") : null;
}
function maskClipPathD(node, nodeId, ctx) {
	const local = localClipPathD(node, nodeId, ctx);
	return local ? applyFigTransformToSvgPath(local, node.transform) : null;
}

export { localClipPathD, maskClipPathD };
