// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/computedStyles.ts

/**
* CSS cascade utilities for the styles panel.
* Provides class → CSS declaration mapping from the stylesheet index.
*/
/**
* Convert camelCase to kebab-case
*/
function camelToKebab(str) {
	return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}
/**
* Convert kebab-case to camelCase
*/
function kebabToCamel(str) {
	return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
function getCascadeBatch(classes, classIndex) {
	const map = /* @__PURE__ */ new Map();
	const byClass = /* @__PURE__ */ new Map();
	const selected = new Set(classes);
	const owners = /* @__PURE__ */ new Map();
	for (const { className, declarations, variant } of classIndex) {
		if (!selected.has(className)) continue;
		const classProps = byClass.get(className) ?? [];
		for (const [prop, value] of Object.entries(declarations)) {
			const key = variant ? `${variant}:${prop}` : prop;
			const previous = owners.get(key);
			if (previous) previous.overridden = true;
			const declaration = {
				prop,
				value,
				variant,
				overridden: false
			};
			classProps.push(declaration);
			owners.set(key, declaration);
			map.set(key, {
				className,
				value,
				variant
			});
		}
		if (classProps.length) {
			byClass.delete(className);
			byClass.set(className, classProps);
		}
	}
	return {
		map,
		byClass
	};
}

export { camelToKebab, getCascadeBatch, kebabToCamel };
