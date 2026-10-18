// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/canvasDisplayPreferences.ts

var PIXEL_GRID_KEY = "petal:canvas:pixel-grid";
var pixelGridEnabled;
var listeners$6 = /* @__PURE__ */ new Set();
function getPixelGridEnabled() {
	if (pixelGridEnabled !== void 0) return pixelGridEnabled;
	if (typeof window === "undefined") return true;
	try {
		pixelGridEnabled = localStorage.getItem(PIXEL_GRID_KEY) !== "false";
	} catch {
		pixelGridEnabled = true;
	}
	return pixelGridEnabled;
}
function setPixelGridEnabled(enabled) {
	pixelGridEnabled = enabled;
	try {
		localStorage.setItem(PIXEL_GRID_KEY, String(enabled));
	} catch {}
	for (const listener of listeners$6) listener();
}
function onStorage(event) {
	if (event.key !== PIXEL_GRID_KEY && event.key !== null) return;
	pixelGridEnabled = void 0;
	for (const listener of listeners$6) listener();
}
function subscribePixelGridEnabled(listener) {
	if (listeners$6.size === 0) window.addEventListener("storage", onStorage);
	listeners$6.add(listener);
	return () => {
		listeners$6.delete(listener);
		if (listeners$6.size === 0) window.removeEventListener("storage", onStorage);
	};
}

export { getPixelGridEnabled, setPixelGridEnabled, subscribePixelGridEnabled };
