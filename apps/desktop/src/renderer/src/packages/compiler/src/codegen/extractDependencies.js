// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/extractDependencies.ts
import { ROOT } from "../store/types.js";
import { getById, walk } from "../store/read.js";

/**
* Extract unique component names from FEElement tree
*/
function extractComponentDependencies(store) {
	const components = /* @__PURE__ */ new Set();
	walk(store, ROOT, (id) => {
		const element = getById(store, id);
		if (!element) return;
		if (element.type === "component") components.add(element.componentName);
	});
	return components;
}
/**
* Extract icon dependencies from element tree
* Returns a Map of library -> Set of icon names
*/
function extractIconDependencies(store) {
	const iconsByLibrary = /* @__PURE__ */ new Map();
	walk(store, ROOT, (id) => {
		const element = getById(store, id);
		if (!element) return;
		if (element.type === "icon") {
			if (!iconsByLibrary.has(element.library)) iconsByLibrary.set(element.library, /* @__PURE__ */ new Set());
			iconsByLibrary.get(element.library).add(element.iconName);
		}
	});
	return iconsByLibrary;
}

export { extractComponentDependencies, extractIconDependencies };
