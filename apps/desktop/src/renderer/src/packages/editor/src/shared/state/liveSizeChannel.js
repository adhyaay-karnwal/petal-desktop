// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/liveSizeChannel.ts

var current = null;
var listeners$2 = /* @__PURE__ */ new Set();
function getLiveSize() {
	return current;
}
/** The preview's size now, or null when the gesture ends (committed or not): show the page's value again. */
function publishLiveSize(next) {
	if (next === current) return;
	current = next;
	for (const listener of listeners$2) listener(current);
}
function subscribeLiveSize(listener) {
	listeners$2.add(listener);
	return () => {
		listeners$2.delete(listener);
	};
}

export { getLiveSize, publishLiveSize, subscribeLiveSize };
