// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/extractCompositionElement.ts
import { import_lib, import_lib$1, import_lib$2, import_lib$3 } from "../runtime/stampMapHosts.js";

var traverse$1 = import_lib$2.default.default || import_lib$2.default;
var generate = import_lib$1.default.default || import_lib$1.default;
function unwrapExpression(node) {
	if (!node) return node;
	if (import_lib$3.isTSAsExpression(node) || import_lib$3.isTSTypeAssertion(node) || import_lib$3.isTSSatisfiesExpression(node)) return unwrapExpression(node.expression);
	if (import_lib$3.isParenthesizedExpression(node)) return unwrapExpression(node.expression);
	return node;
}
function isStaticExpression(node, bindings, seen = /* @__PURE__ */ new Set()) {
	const value = unwrapExpression(node);
	if (!value) return false;
	if (import_lib$3.isStringLiteral(value) || import_lib$3.isNumericLiteral(value) || import_lib$3.isBooleanLiteral(value) || import_lib$3.isNullLiteral(value)) return true;
	if (import_lib$3.isTemplateLiteral(value)) return value.expressions.length === 0;
	if (import_lib$3.isUnaryExpression(value)) return value.operator === "-" && import_lib$3.isNumericLiteral(value.argument);
	if (import_lib$3.isNewExpression(value) && import_lib$3.isIdentifier(value.callee, { name: "Date" })) return value.arguments.length === 1 && (import_lib$3.isStringLiteral(value.arguments[0]) || import_lib$3.isNumericLiteral(value.arguments[0]));
	if (import_lib$3.isIdentifier(value)) {
		if (seen.has(value.name)) return false;
		const binding = bindings.get(value.name);
		if (!binding) return false;
		const nextSeen = new Set(seen);
		nextSeen.add(value.name);
		return isStaticExpression(binding, bindings, nextSeen);
	}
	if (import_lib$3.isArrayExpression(value)) return value.elements.every((element) => element !== null && !import_lib$3.isSpreadElement(element) && isStaticExpression(element, bindings, seen));
	if (import_lib$3.isObjectExpression(value)) return value.properties.every((property) => import_lib$3.isObjectProperty(property) && !property.computed && isStaticExpression(property.value, bindings, seen));
	return false;
}
function resolveStaticExpression(name, bindings, seen = /* @__PURE__ */ new Set()) {
	if (seen.has(name)) return null;
	const binding = bindings.get(name);
	if (!binding) return null;
	const nextSeen = new Set(seen);
	nextSeen.add(name);
	if (!isStaticExpression(binding, bindings, nextSeen)) return null;
	const unwrapped = unwrapExpression(binding);
	if (!unwrapped) return null;
	if (import_lib$3.isIdentifier(unwrapped)) return resolveStaticExpression(unwrapped.name, bindings, nextSeen);
	const cloned = import_lib$3.cloneNode(unwrapped, true);
	const file = import_lib$3.file(import_lib$3.program([import_lib$3.expressionStatement(cloned)]));
	traverse$1(file, { ReferencedIdentifier(path) {
		const replacement = resolveStaticExpression(path.node.name, bindings, nextSeen);
		if (replacement) path.replaceWith(replacement);
	} });
	return file.program.body[0].expression;
}
function inlineStaticBindings(node, bindings) {
	const cloned = import_lib$3.cloneNode(node, true);
	const file = import_lib$3.file(import_lib$3.program([import_lib$3.expressionStatement(cloned)]));
	traverse$1(file, { ReferencedIdentifier(path) {
		const replacement = resolveStaticExpression(path.node.name, bindings);
		if (replacement) path.replaceWith(replacement);
	} });
	return file.program.body[0].expression;
}
function jsxToString(node, bindings) {
	if (import_lib$3.isJSXElement(node) || import_lib$3.isJSXFragment(node)) return generate(inlineStaticBindings(node, bindings), {
		retainLines: false,
		compact: false
	}).code;
	return null;
}
function isJsxExpression(node) {
	const unwrapped = unwrapExpression(node);
	return !!unwrapped && (import_lib$3.isJSXElement(unwrapped) || import_lib$3.isJSXFragment(unwrapped));
}
function extractJsxFromInit(init, bindings) {
	const unwrapped = unwrapExpression(init);
	if (!unwrapped) return null;
	return jsxToString(unwrapped, bindings);
}
function extractJsxFromBinding(binding, bindings) {
	const bindingPath = binding.path;
	if (bindingPath.isVariableDeclarator()) return extractJsxFromInit(bindingPath.node.init, bindings);
	return null;
}
function isCompositionElementDeclarator(declarator) {
	return import_lib$3.isIdentifier(declarator.id) && /^[A-Z]/.test(declarator.id.name) && isJsxExpression(declarator.init);
}
function getExportSpecifierName(exported) {
	if (import_lib$3.isIdentifier(exported)) return exported.name;
	if (import_lib$3.isStringLiteral(exported)) return exported.value;
	return null;
}
function collectCompositionElements(ast) {
	const jsxByExport = /* @__PURE__ */ new Map();
	const staticBindings = /* @__PURE__ */ new Map();
	traverse$1(ast, { VariableDeclaration(path) {
		if (path.node.kind !== "const") return;
		for (const declarator of path.node.declarations) {
			if (!import_lib$3.isIdentifier(declarator.id) || !declarator.init) continue;
			const init = unwrapExpression(declarator.init);
			if (init && !import_lib$3.isJSXElement(init) && !import_lib$3.isJSXFragment(init)) staticBindings.set(declarator.id.name, init);
		}
	} });
	traverse$1(ast, { ExportNamedDeclaration(path) {
		const decl = path.node.declaration;
		if (decl && import_lib$3.isVariableDeclaration(decl)) for (const declarator of decl.declarations) {
			if (!isCompositionElementDeclarator(declarator)) continue;
			const name = declarator.id.name;
			const jsx = extractJsxFromInit(declarator.init, staticBindings);
			if (jsx) jsxByExport.set(name, jsx);
		}
		for (const specifier of path.node.specifiers) {
			if (!import_lib$3.isExportSpecifier(specifier)) continue;
			const exported = getExportSpecifierName(specifier.exported);
			if (!exported || !/^[A-Z]/.test(exported)) continue;
			const localName = import_lib$3.isIdentifier(specifier.local) ? specifier.local.name : exported;
			const binding = path.scope.getBinding(localName);
			if (binding?.path.isVariableDeclarator() && isCompositionElementDeclarator(binding.path.node)) {
				const jsx = extractJsxFromBinding(binding, staticBindings);
				if (jsx) jsxByExport.set(exported, jsx);
			}
		}
	} });
	return {
		exportNames: [...jsxByExport.keys()],
		jsxByExport
	};
}
/** Parse a *.compositions.* file and collect all element exports and their JSX. */
function parseCompositionFile(content) {
	let ast;
	try {
		ast = (0, import_lib.parse)(content, {
			sourceType: "module",
			plugins: ["jsx", "typescript"]
		});
	} catch {
		return {
			exportNames: [],
			jsxByExport: /* @__PURE__ */ new Map()
		};
	}
	return collectCompositionElements(ast);
}

export { parseCompositionFile };
