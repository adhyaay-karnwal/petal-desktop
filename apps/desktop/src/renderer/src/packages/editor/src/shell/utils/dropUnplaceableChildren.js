// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/dropUnplaceableChildren.ts
import { canAcceptChild } from "../../../../compiler/src/store/types.js";

/**
* A pasted tree (nested `children`) without the children the store would
* refuse, like whitespace text inside a `<picture>`. One refused child fails
* the whole insert, so a page capture must not carry any.
*/
function dropUnplaceableChildren(element) {
	if (element.type === "text") return element;
	const children = element.children;
	if (!Array.isArray(children)) return element;
	const kept = children.filter((child) => canAcceptChild(element, child)).map(dropUnplaceableChildren);
	return {
		...element,
		children: kept
	};
}

export { dropUnplaceableChildren };
