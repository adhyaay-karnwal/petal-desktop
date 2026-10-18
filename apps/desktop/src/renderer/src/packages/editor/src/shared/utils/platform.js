// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/platform.ts

/** macOS, where Ctrl+left click is a right click. */
var IS_MAC = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
/** The desktop app's renderer (webviewTag is enabled in main). */
var IS_ELECTRON = typeof navigator !== "undefined" && /Electron\//i.test(navigator.userAgent);
/** ⌘ on macOS, Ctrl elsewhere. On macOS Ctrl+click is a right click, never ⌘. */
function isPrimaryModifier(e) {
	return IS_MAC ? e.metaKey : e.ctrlKey;
}

export { IS_ELECTRON, IS_MAC, isPrimaryModifier };
