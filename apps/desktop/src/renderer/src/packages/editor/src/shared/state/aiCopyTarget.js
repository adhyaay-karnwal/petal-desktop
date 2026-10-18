// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/aiCopyTarget.ts

/** Copies each chat made with canvas_duplicate since its last other canvas change. Follow-camera reads them; the canvas tool handler publishes them. */
var EMPTY = [];
var targets = /* @__PURE__ */ new Map();
function getAiCopyTargets(chatId) {
	return targets.get(chatId) ?? EMPTY;
}
function addAiCopyTarget(chatId, elementId) {
	const ids = targets.get(chatId);
	if (ids) ids.push(elementId);
	else targets.set(chatId, [elementId]);
}
function clearAiCopyTargets(chatId) {
	targets.delete(chatId);
}

export { addAiCopyTarget, clearAiCopyTargets, getAiCopyTargets };
