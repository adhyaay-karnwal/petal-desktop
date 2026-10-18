// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/store/legacy.ts

/**
* Materialize a single subtree as a nested legacy FEElement. Used by
* createInsertOperation / createReplaceOperation (so undo carries the full
* subtree as a payload), by paste flows materializing JSX-parsed subtrees,
* and by detectRepoRootFromCapture (fiber-shaped path walks).
*/
function storeSubtreeToLegacyNested(store, id) {
	const element = store.byId.get(id);
	if (!element) throw new Error(`storeSubtreeToLegacyNested: missing element "${id}"`);
	const children = store.childrenByParent.get(id) ?? EMPTY$2;
	if (children.length === 0 || !hasLegacyNestedChildren(element)) return { ...element };
	return {
		...element,
		children: children.map((childId) => storeSubtreeToLegacyNested(store, childId))
	};
}
function hasLegacyNestedChildren(element) {
	return element.type !== "text" && element.type !== "icon" && element.type !== "webview";
}
var EMPTY$2 = Object.freeze([]);

export { storeSubtreeToLegacyNested };
