// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/areaHighlightChannel.ts

/** On the chat chip that owns a highlight, so a leave can be told from a move inside it. */
var AREA_CHIP_ATTR = "data-lg-area-ref";
/**
* True while `relatedTarget` is still inside the chip for `key`. A leave into
* a Live Preview often has no related target — that is a leave, not a hover.
*/
function pointerStillOnAreaChip(relatedTarget, key) {
	const node = relatedTarget instanceof Node ? relatedTarget : null;
	const el = node instanceof Element ? node : node?.parentElement ?? null;
	if (!el || typeof CSS === "undefined" || typeof CSS.escape !== "function") return false;
	return el.closest(`[${AREA_CHIP_ATTR}="${CSS.escape(key)}"]`) != null;
}
var current$1 = null;
var listeners$7 = /* @__PURE__ */ new Set();
function getAreaHighlight() {
	return current$1;
}
/** No-ops when unchanged, so chips can publish on every enter/leave. */
function publishAreaHighlight(next) {
	if (current$1 === next || current$1 && next && current$1.key === next.key) return;
	current$1 = next;
	for (const listener of listeners$7) listener();
}
function subscribeAreaHighlight(listener) {
	listeners$7.add(listener);
	return () => {
		listeners$7.delete(listener);
	};
}

export { AREA_CHIP_ATTR, getAreaHighlight, pointerStillOnAreaChip, publishAreaHighlight, subscribeAreaHighlight };
