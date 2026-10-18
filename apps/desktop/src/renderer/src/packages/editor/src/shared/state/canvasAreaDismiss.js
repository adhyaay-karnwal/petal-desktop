// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/canvasAreaDismiss.ts

var dismiss = null;
function registerCanvasAreaDismiss(fn) {
	dismiss = fn;
	return () => {
		if (dismiss === fn) dismiss = null;
	};
}
function dismissCanvasAreas() {
	dismiss?.();
}

export { dismissCanvasAreas, registerCanvasAreaDismiss };
