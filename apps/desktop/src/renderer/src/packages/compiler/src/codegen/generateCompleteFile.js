// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/generateCompleteFile.ts
import { generateJSX } from "./generateJSX.js";
import { extractComponentDependencies, extractIconDependencies } from "./extractDependencies.js";
import { generateIconImports, generateImports } from "./generateImports.js";

/**
* Generate a complete TypeScript/React component file
*/
function generateCompleteFile(options) {
	const { componentName, store, componentIndex, targetFilePath, includeReactImport = false, includeDataElementId = false, assetResolver } = options;
	const parts = [];
	const componentDeps = extractComponentDependencies(store);
	const iconDeps = extractIconDependencies(store);
	const componentImports = generateImports(componentDeps, componentIndex, targetFilePath);
	const iconImports = generateIconImports(iconDeps);
	if (includeReactImport) parts.push("import React from 'react'");
	if (iconImports.length > 0) parts.push(...iconImports);
	if (componentImports.length > 0) parts.push(...componentImports);
	if (parts.length > 0) parts.push("");
	parts.push(`export function ${componentName}() {`);
	parts.push("  return (");
	const jsx = generateJSX(store, 2, {
		includeDataElementId,
		assetResolver
	});
	parts.push(jsx);
	parts.push("  )");
	parts.push("}");
	return parts.join("\n");
}

export { generateCompleteFile };
