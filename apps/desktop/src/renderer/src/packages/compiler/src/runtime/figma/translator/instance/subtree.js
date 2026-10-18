// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/subtree.ts
import { nodeId } from "../../../../../../../vendor/openfig-core.js";
import { figGuidKey } from "../../utils/node.js";
import { byLayerOrder, figmaChildren, figmaNodeById, parentIdOf } from "../model/node.js";
import { applyCascadedOverrides, applyInstanceOverrides } from "./overrides.js";
import { planInstanceScale } from "./scale.js";

function copyComponentLayers(ctx, rootId) {
	const copies = /* @__PURE__ */ new Map();
	const copy = (id) => {
		const node = figmaNodeById(ctx, id);
		if (!node) return;
		copies.set(id, structuredClone(node));
		for (const child of figmaChildren(ctx, id)) {
			const childId = nodeId(child);
			if (childId) copy(childId);
		}
	};
	copy(rootId);
	return copies;
}
function instanceChildIds(subtree, symbolRootId) {
	if (!subtree.has(symbolRootId)) return [];
	return [...subtree.entries()].filter(([id, node]) => id !== symbolRootId && parentIdOf(node) === symbolRootId).sort(([, a], [, b]) => byLayerOrder(a, b)).map(([id]) => id);
}
function resolveInstanceSubtree(instance, ctx) {
	const symbolId = figGuidKey(instance.symbolData?.symbolID);
	if (!symbolId || !figmaNodeById(ctx, symbolId)) return null;
	const nodes = copyComponentLayers(ctx, symbolId);
	const rootSize = nodes.get(symbolId)?.size;
	const designSize = {
		x: rootSize?.x ?? 0,
		y: rootSize?.y ?? 0
	};
	applyInstanceOverrides(ctx, nodes, instance, symbolId);
	const scale = planInstanceScale(instance, nodes, symbolId, designSize);
	if (ctx.pasteInstance && ctx.pasteInstance !== instance) applyCascadedOverrides(ctx, nodes, instance, ctx.pasteInstance, symbolId);
	return {
		nodes,
		symbolRootId: symbolId,
		rootChildIds: instanceChildIds(nodes, symbolId),
		...scale
	};
}

export { instanceChildIds, resolveInstanceSubtree };
