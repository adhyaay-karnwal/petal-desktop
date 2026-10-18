// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/executeModule.ts
import { __bundledVitePreload } from "../../../../__bundle__/_vite_preload_helper.js";

/**
* Execute server-compiled module via ESM import from a public dist URL (R2) or blob URL.
*/
function moduleNamespaceToRecord(mod) {
	const exports = {};
	for (const key of Object.keys(mod)) exports[key] = mod[key];
	if (!("default" in exports) && "default" in mod) exports.default = mod.default;
	return exports;
}
async function importModuleUrl(url) {
	return moduleNamespaceToRecord(await __bundledVitePreload(() => import(
		/* @vite-ignore */
		url
), [], import.meta.url));
}
async function executeCompiledModule(codeUrl) {
	try {
		return await importModuleUrl(codeUrl);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to import module (${codeUrl}): ${message}`);
	}
}
/** Execute inline ESM source (snapshots) via a temporary blob URL — import() requires a URL, not raw source. */
async function executeCompiledModuleSource(code) {
	const blob = new Blob([code], { type: "text/javascript" });
	const url = URL.createObjectURL(blob);
	try {
		return await importModuleUrl(url);
	} finally {
		URL.revokeObjectURL(url);
	}
}

export { executeCompiledModule, executeCompiledModuleSource };
