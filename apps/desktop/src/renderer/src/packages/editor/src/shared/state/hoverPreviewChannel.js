// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/hoverPreviewChannel.ts

var previewIds = [];
var previewListeners = /* @__PURE__ */ new Set();
function publishHoverPreview(ids) {
	if (ids.length === 0 && previewIds.length === 0) return;
	previewIds = ids;
	for (const listener of previewListeners) listener(ids);
}
function subscribeHoverPreview(listener) {
	previewListeners.add(listener);
	return () => {
		previewListeners.delete(listener);
	};
}

export { publishHoverPreview, subscribeHoverPreview };
