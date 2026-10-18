// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/canvasPayload.ts
import { ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getRootIds } from "../../../../compiler/src/store/read.js";

/**
* Read either a legacy nested FEElement[] payload or a StoreWireV2 wire envelope
* and return nested FEElement[]. Saves write the wire format; pages saved before
* that are still nested.
*/
function readCanvasElements(payload) {
	if (payload == null) return [];
	if (Array.isArray(payload)) return payload;
	return storeToNested(ensureV2(payload));
}
/** A successful null canvas is an empty page; transport failures must not erase data. */
function readLoadedCanvasElements(result) {
	if (!result.success) throw new Error(result.error || "Could not load page");
	return readCanvasElements(result.canvas?.elements);
}
function storeToNested(store) {
	const build = (id) => {
		const el = store.byId.get(id);
		if (!el) throw new Error(`readCanvasElements: missing element "${id}"`);
		const childIds = store.childrenByParent.get(id) ?? [];
		if (childIds.length === 0 || !hasNestedChildren(el)) return { ...el };
		return {
			...el,
			children: childIds.map(build)
		};
	};
	return getRootIds(store).map(build);
}
function hasNestedChildren(element) {
	return element.type !== "text" && element.type !== "icon" && element.type !== "webview";
}

export { readCanvasElements, readLoadedCanvasElements };
