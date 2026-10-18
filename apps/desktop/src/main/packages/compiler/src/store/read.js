// Reconstructed from index.js — original module: packages/compiler/src/store/read.ts

function getById(store, id) {
	return store.byId.get(id);
}
function getParentId(store, id) {
	return store.parentByChild.get(id) ?? null;
}
function getChildren(store, parent) {
	return store.childrenByParent.get(parent) ?? EMPTY$1;
}
function getRootIds(store) {
	return store.childrenByParent.get("ROOT") ?? EMPTY$1;
}
function walk(store, rootKey, visit) {
	const recurse = (parent, depth) => {
		const children = store.childrenByParent.get(parent);
		if (!children) return;
		for (const childId of children) {
			visit(childId, depth);
			recurse(childId, depth + 1);
		}
	};
	recurse(rootKey, 0);
}
var EMPTY$1 = Object.freeze([]);

export { getById, getChildren, getParentId, getRootIds, walk };
