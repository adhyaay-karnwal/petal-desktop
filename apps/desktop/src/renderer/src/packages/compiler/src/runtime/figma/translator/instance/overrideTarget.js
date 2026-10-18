// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/overrideTarget.ts
import { nodeId } from "../../../../../../../vendor/openfig-core.js";
import { figGuidKey } from "../../utils/node.js";
import { allFigmaNodes, figmaChildren, figmaNodeById, parentIdOf } from "../model/node.js";

function sameGuid(a, b) {
	return a != null && b != null && a.sessionID === b.sessionID && a.localID === b.localID;
}
function nodeWithOverrideKey(nodes, key) {
	for (const node of nodes) if (sameGuid(node.overrideKey, key)) return node;
}
function enclosingComponentId(ctx, nodeId$2) {
	let current = figmaNodeById(ctx, nodeId$2);
	while (current) {
		if (current.type === "SYMBOL" || current.type === "COMPONENT") return nodeId(current);
		const parentId = parentIdOf(current);
		if (!parentId) break;
		current = figmaNodeById(ctx, parentId);
	}
	return null;
}
function childIndexPath(ctx, rootId, targetId) {
	const path = [];
	let currentId = targetId;
	while (currentId !== rootId) {
		const current = figmaNodeById(ctx, currentId);
		const parentId = current && parentIdOf(current);
		if (!parentId) return null;
		const index = figmaChildren(ctx, parentId).findIndex((sibling) => nodeId(sibling) === currentId);
		if (index < 0) return null;
		path.unshift(index);
		currentId = parentId;
	}
	return path;
}
function nodeAtChildIndexPath(subtree, ctx, rootId, path) {
	let currentId = rootId;
	for (const index of path) {
		const child = figmaChildren(ctx, currentId)[index];
		const childId = child && nodeId(child);
		if (!childId) return void 0;
		currentId = childId;
	}
	return subtree.get(currentId);
}
function nestedOverrideTarget(ctx, subtree, symbolRootId, guids) {
	const lastKey = guids[guids.length - 1];
	if (!lastKey) return void 0;
	const reference = nodeWithOverrideKey(allFigmaNodes(ctx), lastKey);
	if (!reference) return nodeWithOverrideKey(subtree.values(), lastKey);
	const referenceId = nodeId(reference);
	const componentId = referenceId && enclosingComponentId(ctx, referenceId);
	const path = componentId && referenceId ? childIndexPath(ctx, componentId, referenceId) : null;
	return path ? nodeAtChildIndexPath(subtree, ctx, symbolRootId, path) : void 0;
}
function directOverrideTarget(subtree, key) {
	const id = figGuidKey(key);
	return nodeWithOverrideKey(subtree.values(), key) ?? (id ? subtree.get(id) : void 0);
}

export { directOverrideTarget, nestedOverrideTarget, nodeWithOverrideKey, sameGuid };
