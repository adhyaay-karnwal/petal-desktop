// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/imageFillEdit.ts

var listeners = /* @__PURE__ */ new Set();
function requestImageFillEdit(elementId) {
	for (const listener of listeners) listener(elementId);
}
function onImageFillEditRequest(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export { onImageFillEditRequest, requestImageFillEdit };
