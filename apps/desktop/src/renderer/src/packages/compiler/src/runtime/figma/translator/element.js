// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/element.ts

function newId() {
	return crypto.randomUUID();
}
function htmlElement(tag, init = {}) {
	return {
		id: init.id ?? newId(),
		type: "html",
		tag,
		...init.styles ? { styles: init.styles } : {},
		...init.props ? { props: init.props } : {}
	};
}
function textElement(text, styles) {
	return {
		id: newId(),
		type: "text",
		tag: "span",
		text,
		styles
	};
}
function withFigmaNodeId(element, figmaNodeId) {
	return {
		...element,
		props: {
			...element.props,
			"data-figma-node-id": figmaNodeId
		}
	};
}

export { htmlElement, newId, textElement, withFigmaNodeId };
