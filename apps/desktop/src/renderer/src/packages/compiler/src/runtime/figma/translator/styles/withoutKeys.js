// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/withoutKeys.ts

function withoutKeys(styles, keys) {
	const dropped = new Set(keys);
	return Object.fromEntries(Object.entries(styles).filter(([key]) => !dropped.has(key)));
}

export { withoutKeys };
