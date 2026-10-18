// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/instance.ts
import { figGuidKey } from "../../utils/node.js";
import { htmlElement } from "../element.js";
import { isNearly } from "../model/matrix.js";
import { resolveInstanceSubtree } from "../instance/subtree.js";
import { registerOne } from "./register.js";
import { containerElement } from "./shapes.js";

function needsScaleLayer({ cssScale, designSize }) {
	return !isNearly(cssScale, 1) && designSize.x > 0 && designSize.y > 0;
}
function scaleLayer({ cssScale, designSize }) {
	return htmlElement("div", { styles: {
		position: "absolute",
		left: 0,
		top: 0,
		width: designSize.x,
		height: designSize.y,
		transform: `scale(${cssScale})`,
		transformOrigin: "0 0"
	} });
}
function insideInstance(ctx, instance, subtree, convert) {
	const outer = {
		pasteInstance: ctx.pasteInstance,
		instanceSubtree: ctx.instanceSubtree
	};
	ctx.pasteInstance = instance;
	ctx.instanceSubtree = subtree;
	convert();
	if (outer.pasteInstance) ctx.pasteInstance = outer.pasteInstance;
	else delete ctx.pasteInstance;
	if (outer.instanceSubtree) ctx.instanceSubtree = outer.instanceSubtree;
	else delete ctx.instanceSubtree;
}
var convertInstance = (input) => {
	const { store, parentId, node, nodeId, ctx, convertChildren } = input;
	const symbolId = figGuidKey(node.symbolData?.symbolID);
	const subtree = resolveInstanceSubtree(node, ctx);
	if (!symbolId || !subtree) {
		ctx.warnings.push({
			code: "MISSING_SYMBOL",
			nodeId,
			symbolId: symbolId ?? "unknown"
		});
		return null;
	}
	const wrapperId = registerOne(store, parentId, containerElement(input));
	const childrenParentId = needsScaleLayer(subtree) ? registerOne(store, wrapperId, scaleLayer(subtree)) : wrapperId;
	insideInstance(ctx, node, subtree, () => convertChildren(childrenParentId, symbolId, subtree));
	return wrapperId;
};

export { convertInstance };
