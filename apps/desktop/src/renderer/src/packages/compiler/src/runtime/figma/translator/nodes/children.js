// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/children.ts
import { nodeId } from "../../../../../../../vendor/openfig-core.js";
import { figmaChildren, isMaskNode } from "../model/node.js";
import { instanceChildIds } from "../instance/subtree.js";
import { maskWrapper } from "./maskGroup.js";
import { registerOne } from "./register.js";

function childNodes(ctx, figmaParentId, subtree) {
	if (!subtree) return figmaChildren(ctx, figmaParentId);
	return (figmaParentId === subtree.symbolRootId ? subtree.rootChildIds : instanceChildIds(subtree.nodes, figmaParentId)).map((id) => subtree.nodes.get(id)).filter((node) => !!node);
}
function takeWhile(items, start, keep) {
	const taken = [];
	for (const item of items.slice(start)) {
		if (!keep(item)) break;
		taken.push(item);
	}
	return taken;
}
function asMaskLayers(nodes) {
	return takeWhile(nodes, 0, (node) => !!nodeId(node) && isMaskNode(node)).map((node) => ({
		node,
		id: nodeId(node)
	}));
}
function convertChildren(store, parentId, figmaParentId, ctx, convertOne, subtree) {
	const children = childNodes(ctx, figmaParentId, subtree);
	const options = subtree ? { instanceSubtree: subtree } : {};
	let index = 0;
	while (index < children.length) {
		const child = children[index];
		const childId = child && nodeId(child);
		if (!child || !childId) {
			index++;
			continue;
		}
		if (!isMaskNode(child)) {
			convertOne(parentId, child, childId, options);
			index++;
			continue;
		}
		const masks = asMaskLayers(children.slice(index));
		const wrapperId = registerOne(store, parentId, maskWrapper(masks, figmaParentId, ctx));
		const masked = takeWhile(children, index + masks.length, (node) => !isMaskNode(node));
		for (const node of masked) {
			const nodeId$1 = nodeId(node);
			if (nodeId$1) convertOne(wrapperId, node, nodeId$1, options);
		}
		index += masks.length + masked.length;
	}
}

export { convertChildren };
