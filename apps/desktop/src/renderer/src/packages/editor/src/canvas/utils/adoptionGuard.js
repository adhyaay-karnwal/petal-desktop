// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/adoptionGuard.ts

/**
* Whether a drawn container may take this layer as a child. `canAcceptChild`
* can't answer this — a div structurally accepts everything — so these
* exclusions are behavioural: each would land wrong or break on remount.
*
* WebGL components are deliberately allowed. Remounting rebuilds the scene,
* costing a flash, but it lands correctly — and excluding them meant a
* container silently skipped most of what it was drawn over.
*/
function canAdoptElement(el, ctx = {}) {
	if (el.type === "webview" || el.type === "capture") return false;
	if (el.type === "html" && el.props?.["data-component"] === "CapturedPage") return false;
	if (el.id === ctx.editingTextId || el.id === ctx.editingOwnerId) return false;
	return true;
}

export { canAdoptElement };
