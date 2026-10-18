// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/modifierKeys.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { isPrimaryModifier } from "../utils/platform.js";

/**
* Which modifier keys are held right now, for surfaces that change what the
* pointer does while a key is down (⌘ looks inside a component or preview, ⌥
* grabs). One pair of window listeners, installed on first subscription; a
* blur releases everything so a key let go outside the window doesn't stick.
*/
var modifiers$2 = {
	meta: false,
	alt: false,
	shift: false
};
var listeners$5 = /* @__PURE__ */ new Set();
var installed$1 = false;
function set(next) {
	if (next.meta === modifiers$2.meta && next.alt === modifiers$2.alt && next.shift === modifiers$2.shift) return;
	modifiers$2 = next;
	listeners$5.forEach((l) => l());
}
function fromEvent(e) {
	return {
		meta: isPrimaryModifier(e),
		alt: e.altKey,
		shift: e.shiftKey
	};
}
function install() {
	if (installed$1 || typeof window === "undefined") return;
	installed$1 = true;
	const onKey = (e) => set(fromEvent(e));
	const onPointer = (e) => set(fromEvent(e));
	window.addEventListener("keydown", onKey, true);
	window.addEventListener("keyup", onKey, true);
	window.addEventListener("pointermove", onPointer, {
		capture: true,
		passive: true
	});
	window.addEventListener("blur", () => set({
		meta: false,
		alt: false,
		shift: false
	}));
}
function getModifiers() {
	return modifiers$2;
}
function subscribeModifiers(listener) {
	install();
	listeners$5.add(listener);
	return () => {
		listeners$5.delete(listener);
	};
}
function useModifiers() {
	return (0, import_react.useSyncExternalStore)(subscribeModifiers, getModifiers, getModifiers);
}

export { getModifiers, subscribeModifiers, useModifiers };
