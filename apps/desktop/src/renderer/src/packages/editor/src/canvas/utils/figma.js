// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/figma.ts
import { getById, getChildren$2 } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createSetStylesOperation } from "../../shared/utils/operations.js";

function indexFigmaNodeIdsInStore(store, rootIds) {
	const map = /* @__PURE__ */ new Map();
	const walk = (id) => {
		const el = getById(store, id);
		if (!el) return;
		if (el.type === "html") {
			const figmaNodeId = el.props?.["data-figma-node-id"];
			if (typeof figmaNodeId === "string") map.set(figmaNodeId, id);
		}
		for (const childId of getChildren$2(store, id)) walk(childId);
	};
	for (const rootId of rootIds) walk(rootId);
	return map;
}
function applyFigmaImagePatchesToStore(store, rootIds, patches) {
	let next = store;
	const nodeIndex = indexFigmaNodeIdsInStore(next, rootIds);
	for (const { figmaNodeId, stylePatch } of patches) {
		const elementId = nodeIndex.get(figmaNodeId);
		if (!elementId) continue;
		const el = getById(next, elementId);
		if (!el || el.type !== "html") continue;
		const merged = {
			...el.styles ?? {},
			...stylePatch
		};
		if (stylePatch.backgroundImage) delete merged.backgroundColor;
		if (stylePatch.maskImage || stylePatch.WebkitMaskImage) delete merged.backgroundColor;
		const op = createSetStylesOperation(next, elementId, merged);
		if (op) next = applyOperationsToStore(next, [op]);
	}
	return next;
}

export { applyFigmaImagePatchesToStore };
