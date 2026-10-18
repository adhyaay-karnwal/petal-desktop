// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/pendingAdjust.ts

var pending = /* @__PURE__ */ new Map();
var peekPendingAdjust = (key) => pending.get(key);
/** The state for `key`, created on first use. */
function pendingAdjust(key) {
	let entry = pending.get(key);
	if (!entry) pending.set(key, entry = {
		session: null,
		bake: null
	});
	return entry;
}
/** Ends the preview of `key`; `restoreTo` as in PreviewSession.end. */
function endPendingPreview(key, restoreTo) {
	const entry = pending.get(key);
	entry?.session?.end(restoreTo);
	if (entry) entry.session = null;
	releasePendingAdjust(key);
}
function abortPendingBake(key) {
	const entry = pending.get(key);
	entry?.bake?.controller.abort();
	if (entry) entry.bake = null;
	releasePendingAdjust(key);
}
/** Forgets `key` once nothing previews or saves it. */
function releasePendingAdjust(key) {
	const entry = pending.get(key);
	if (entry && !entry.session && !entry.bake) pending.delete(key);
}

export { abortPendingBake, endPendingPreview, peekPendingAdjust, pendingAdjust, releasePendingAdjust };
