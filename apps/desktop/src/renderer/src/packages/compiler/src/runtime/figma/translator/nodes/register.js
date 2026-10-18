// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/nodes/register.ts
import { registerElement } from "../../../../store/ensureV2.js";

function registerOne(store, parentId, element) {
	registerElement(store, element, parentId);
	return element.id;
}
function registerVector(store, parentId, vector) {
	if (!vector) return null;
	const svgId = registerOne(store, parentId, vector.svgElement);
	if (vector.defs) {
		const defsId = registerOne(store, svgId, vector.defs.element);
		for (const entry of vector.defs.entries) {
			const entryId = registerOne(store, defsId, entry.element);
			for (const child of entry.children) registerOne(store, entryId, child);
		}
	}
	const pathParentId = vector.flipGroup ? registerOne(store, svgId, vector.flipGroup) : svgId;
	for (const path of vector.pathElements) registerOne(store, pathParentId, path);
	return svgId;
}

export { registerOne, registerVector };
