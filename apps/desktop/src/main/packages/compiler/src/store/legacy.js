// Reconstructed from index.js — original module: packages/compiler/src/store/legacy.ts
import { getRootIds } from "./read.js";

/**
* Materialize an entire Store as nested legacy FEElement[]. Used at boundaries
* where the consumer is inherently nested-shaped (e.g. snapshot merge, where
* one side comes from React rendering as a nested tree).
*/
function storeToLegacyNested(store) {
	return getRootIds(store).map((id) => storeSubtreeToLegacyNested(store, id));
}
/**
* Materialize a single subtree as a nested legacy FEElement. Used by
* createInsertOperation / createReplaceOperation (so undo carries the full
* subtree as a payload), by paste flows materializing JSX-parsed subtrees,
* and by detectRepoRootFromCapture (fiber-shaped path walks).
*/
function storeSubtreeToLegacyNested(store, id) {
	const element = store.byId.get(id);
	if (!element) throw new Error(`storeSubtreeToLegacyNested: missing element "${id}"`);
	const children = store.childrenByParent.get(id) ?? EMPTY;
	if (children.length === 0 || !hasLegacyNestedChildren(element)) return { ...element };
	return {
		...element,
		children: children.map((childId) => storeSubtreeToLegacyNested(store, childId))
	};
}
function hasLegacyNestedChildren(element) {
	return element.type !== "text" && element.type !== "icon" && element.type !== "webview";
}
var EMPTY = Object.freeze([]);

export { storeToLegacyNested };
