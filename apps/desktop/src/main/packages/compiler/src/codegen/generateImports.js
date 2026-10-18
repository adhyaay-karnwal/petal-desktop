// Reconstructed from index.js — original module: packages/compiler/src/codegen/generateImports.ts

/**
* Calculate relative import path from source file to target file
* Example: from '.petal/canvases/canvas-1/components/Foo.tsx' to 'components/ui/text.tsx'
* Returns: '../../../../components/ui/text'
*/
function calculateRelativePath(fromFile, toFile) {
	if (toFile.startsWith("/") && !fromFile.startsWith("/")) {
		const toParts = toFile.split("/").filter(Boolean);
		const projectDirs = /* @__PURE__ */ new Set([
			"components",
			"src",
			"lib",
			"app",
			"pages",
			".petal",
			"packages"
		]);
		for (let i = toParts.length - 1; i >= 0; i--) if (projectDirs.has(toParts[i])) return calculateRelativePath(fromFile, toParts.slice(i).join("/"));
		return calculateRelativePath(fromFile, toParts.slice(-3).join("/"));
	}
	const fromParts = fromFile.split("/").slice(0, -1);
	const toParts = toFile.split("/");
	let commonLength = 0;
	const minLength = Math.min(fromParts.length, toParts.length);
	for (let i = 0; i < minLength; i++) if (fromParts[i] === toParts[i]) commonLength++;
	else break;
	const upLevels = fromParts.length - commonLength;
	const relativeParts = toParts.slice(commonLength);
	const relPath = "../".repeat(upLevels) + relativeParts.join("/");
	return relPath.startsWith(".") ? relPath : "./" + relPath;
}
/** Icon imports grouped by library, in the save-to-code `{ component, importPath }` shape. */
function getIconImportMappings(iconsByLibrary) {
	return [...iconsByLibrary].flatMap(([library, iconNames]) => [...iconNames].map((component) => ({
		component,
		importPath: library
	})));
}
/** One mapping as an import statement, for prompts and hints. */
function formatImportMapping({ component, importPath, isDefault }) {
	return isDefault ? `import ${component} from '${importPath}'` : `import { ${component} } from '${importPath}'`;
}
/**
* Get component import mappings (for use in prompts/hints)
* Returns array of { component, importPath, isDefault? } objects
*
* @param preferAlias - when true (recommended for save-to-code), always emit
*   `@/…` paths. Relative paths like `../actions/copy-button` are how Claude
*   invents broken imports that miss the canvas module registry.
*/
function getComponentImportMappings(componentNames, componentIndex, targetFilePath, options) {
	const mappings = [];
	const seen = /* @__PURE__ */ new Set();
	const preferAlias = options?.preferAlias !== false;
	for (const componentName of componentNames) {
		const entry = resolveIndexEntry(componentIndex, componentName);
		if (!entry) {
			console.warn(`Component "${componentName}" not found in ComponentIndex`);
			continue;
		}
		const { path, exportName } = entry;
		const isDefault = exportName === "default";
		const component = isDefault ? componentName : exportName;
		if (seen.has(component)) continue;
		seen.add(component);
		const importPathNoExt = path.replace(/\.tsx?$/, "");
		let finalPath;
		if (preferAlias || !targetFilePath) finalPath = toAliasImportPath(importPathNoExt);
		else finalPath = calculateRelativePath(targetFilePath, importPathNoExt);
		mappings.push({
			component,
			importPath: finalPath,
			...isDefault ? { isDefault } : {}
		});
	}
	return mappings;
}
/** Stable `@/` import path matching canvas LOCAL_MODULES alias keys. */
function toAliasImportPath(importPathNoExt) {
	if (importPathNoExt.startsWith("@/")) return importPathNoExt;
	let p = importPathNoExt.replace(/^\/+/, "");
	if (p.startsWith("src/")) p = p.slice(4);
	return `@/${p}`;
}
/** Resolve bare or path-qualified component names against the index. */
function resolveIndexEntry(componentIndex, componentName) {
	const exact = componentIndex[componentName];
	if (exact) return exact;
	const matches = Object.entries(componentIndex).filter(([key, entry]) => {
		return (key.includes("::") ? key.slice(0, key.indexOf("::")) : key) === componentName || entry.exportName === componentName;
	});
	if (matches.length === 1) return matches[0][1];
	const byExport = matches.filter(([, e]) => e.exportName === componentName);
	if (byExport.length === 1) return byExport[0][1];
	if (byExport.length > 1) {
		const underComponents = byExport.find(([, e]) => /(?:^|\/)components\//.test(e.path.replace(/\\/g, "/")));
		if (underComponents) return underComponents[1];
	}
	if (matches.length > 1) {
		const underComponents = matches.find(([, e]) => /(?:^|\/)components\//.test(e.path.replace(/\\/g, "/")));
		if (underComponents) return underComponents[1];
	}
	return null;
}

export { formatImportMapping, getComponentImportMappings, getIconImportMappings };
