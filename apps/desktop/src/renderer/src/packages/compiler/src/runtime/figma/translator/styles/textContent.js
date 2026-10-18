// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/textContent.ts

function lineStartIndices(node, textLength) {
	const baselines = node.derivedTextData?.baselines;
	if (!baselines || baselines.length < 2) return [];
	return baselines.slice(1).map((line) => line.firstCharacter).filter((index) => typeof index === "number" && index > 0 && index < textLength).sort((a, b) => b - a);
}
function breakLineAt(text, index) {
	return `${text.slice(0, index).trimEnd()}\n${text.slice(index).trimStart()}`;
}
function figmaTextContent(node) {
	const characters = node.textData?.characters ?? "";
	return lineStartIndices(node, characters.length).reduce(breakLineAt, characters);
}
function hasLineBreaks(node) {
	return figmaTextContent(node).includes("\n");
}

export { figmaTextContent, hasLineBreaks };
