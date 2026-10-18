// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/compositionFiles.ts

var COMPOSITION_FILE_RE = /\.compositions\.(tsx|ts|jsx|js)$/;
function isCompositionFile(path) {
	return COMPOSITION_FILE_RE.test(path);
}
/** `button.tsx` → `button.compositions.tsx` */
function getCompositionPathForBase(basePath) {
	return basePath.replace(/\.(tsx|ts|jsx|js)$/, ".compositions.$1");
}
/** `CardDefault` → `Card Default` */
function exportNameToDisplayName(exportName) {
	return exportName.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}
function buildCompositionTemplates(exportNames) {
	return exportNames.map((exportName) => ({
		exportName,
		name: exportNameToDisplayName(exportName)
	}));
}

export { buildCompositionTemplates, getCompositionPathForBase, isCompositionFile };
