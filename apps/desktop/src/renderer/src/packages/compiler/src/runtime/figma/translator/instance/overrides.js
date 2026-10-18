// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/overrides.ts
import { figGuidKey } from "../../utils/node.js";
import { byLayerOrder } from "../model/node.js";
import { applyOverridePatch } from "./applyPatch.js";
import { directOverrideTarget, nestedOverrideTarget, nodeWithOverrideKey, sameGuid } from "./overrideTarget.js";
import { swapToVariant } from "./variantSwap.js";

function overridePatchesOf(instance) {
	return [...instance.symbolData?.symbolOverrides ?? [], ...instance.symbolData?.derivedSymbolData ?? []];
}
function patchFields(patch) {
	const { guidPath: _guidPath, overriddenSymbolID: _variant, ...fields } = patch;
	return fields;
}
function hasFields(fields) {
	return Object.keys(fields).length > 0;
}
function lastGuidKey(guids) {
	const keys = guids.map(figGuidKey).filter((key) => !!key);
	return keys[keys.length - 1];
}
function patchTarget(ctx, subtree, symbolRootId, guids) {
	const first = guids[0];
	if (!first) return void 0;
	if (guids.length === 1) return directOverrideTarget(subtree, first);
	return nodeWithOverrideKey(subtree.values(), first)?.type === "INSTANCE" ? void 0 : nestedOverrideTarget(ctx, subtree, symbolRootId, guids.slice(1));
}
function vectorsInLayerOrder(subtree, symbolRootId) {
	return [...subtree.entries()].filter(([id, node]) => id !== symbolRootId && node.type === "VECTOR").map(([, node]) => node).sort(byLayerOrder);
}
function applyInstanceOverrides(ctx, subtree, instance, symbolRootId) {
	const vectors = vectorsInLayerOrder(subtree, symbolRootId);
	const rootSizePatches = [];
	const unplacedFillPatches = [];
	for (const patch of overridePatchesOf(instance)) {
		const guids = patch.guidPath?.guids;
		if (!guids?.length) continue;
		const [first] = guids;
		if (patch.overriddenSymbolID && guids.length === 1 && first) {
			const swapped = directOverrideTarget(subtree, first);
			if (swapped) swapToVariant(swapped, patch.overriddenSymbolID, ctx);
		}
		const fields = patchFields(patch);
		const lastKey = lastGuidKey(guids);
		const target = patchTarget(ctx, subtree, symbolRootId, guids) ?? (lastKey ? subtree.get(lastKey) : void 0);
		if (target && hasFields(fields)) applyOverridePatch(subtree, target, fields);
		else if (fields.fillPaints) unplacedFillPatches.push(fields);
		else if (fields.size) rootSizePatches.push(fields);
	}
	const symbolRoot = subtree.get(symbolRootId);
	for (const { size: _size, ...rest } of rootSizePatches) if (symbolRoot && hasFields(rest)) Object.assign(symbolRoot, rest);
	unplacedFillPatches.forEach((fields, index) => {
		const vector = vectors[index] ?? vectors[vectors.length - 1];
		if (vector) Object.assign(vector, fields);
	});
}
function applyCascadedOverrides(ctx, subtree, instance, outerInstance, symbolRootId) {
	const instanceKey = instance.overrideKey;
	if (!instanceKey) return;
	for (const patch of overridePatchesOf(outerInstance)) {
		const guids = patch.guidPath?.guids;
		if (!guids?.length || !sameGuid(guids[0], instanceKey)) continue;
		const fields = patchFields(patch);
		if (!hasFields(fields)) continue;
		if (guids.length === 1) {
			const symbolRoot = subtree.get(symbolRootId);
			if (fields.size && symbolRoot) {
				Object.assign(symbolRoot, fields);
				continue;
			}
		}
		const target = guids.length === 1 ? nodeWithOverrideKey(subtree.values(), instanceKey) : nestedOverrideTarget(ctx, subtree, symbolRootId, guids.slice(1));
		if (target) applyOverridePatch(subtree, target, fields);
	}
}

export { applyCascadedOverrides, applyInstanceOverrides };
