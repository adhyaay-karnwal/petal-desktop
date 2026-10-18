// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/generateImports.ts
import { import_lib$2 } from "../runtime/stampMapHosts.js";

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
/**
* Generate import statements from component dependencies
*
* @param componentNames - Set of component names used in the JSX
* @param componentIndex - ComponentIndex.json mapping
* @param targetFilePath - Path of the file being generated (for relative imports)
* @returns Array of import statements
*/
function generateImports(componentNames, componentIndex, targetFilePath) {
	const imports = [];
	const importsByPath = /* @__PURE__ */ new Map();
	for (const componentName of componentNames) {
		const entry = componentIndex[componentName];
		if (!entry) {
			console.warn(`Component "${componentName}" not found in ComponentIndex`);
			continue;
		}
		const { path, exportName } = entry;
		if (!importsByPath.has(path)) importsByPath.set(path, { named: /* @__PURE__ */ new Set() });
		const group = importsByPath.get(path);
		if (exportName === "default") group.defaultName = componentName;
		else group.named.add(exportName);
	}
	for (const [path, { defaultName, named }] of importsByPath) {
		const importPath = path.replace(/\.tsx?$/, "");
		const clause = [defaultName, named.size > 0 ? `{ ${Array.from(named).sort().join(", ")} }` : null].filter(Boolean).join(", ");
		let finalPath;
		if (targetFilePath) finalPath = calculateRelativePath(targetFilePath, importPath);
		else if (importPath.startsWith("@/")) finalPath = importPath;
		else if (importPath.startsWith("/")) {
			const parts = importPath.split("/").filter(Boolean);
			const projectDirs = /* @__PURE__ */ new Set([
				"components",
				"src",
				"lib",
				"app",
				"pages",
				".petal",
				"packages"
			]);
			let relativePath = importPath;
			for (let i = parts.length - 1; i >= 0; i--) if (projectDirs.has(parts[i])) {
				relativePath = parts.slice(i).join("/");
				break;
			}
			finalPath = `@/${relativePath}`;
		} else finalPath = `@/${importPath}`;
		imports.push(`import ${clause} from '${finalPath}'`);
	}
	return imports.sort();
}
/**
* Generate import statements for icons grouped by library
*
* @param iconsByLibrary - Map of library name -> Set of icon names
* @returns Array of import statements
*/
function generateIconImports(iconsByLibrary) {
	const imports = [];
	for (const [library, iconNames] of iconsByLibrary) {
		const sortedNames = Array.from(iconNames).sort().join(", ");
		imports.push(`import { ${sortedNames} } from '${library}'`);
	}
	return imports.sort();
}
import_lib$2.default.default || import_lib$2.default;

export { generateIconImports, generateImports };
