// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/mouseButtonPolicy.ts
import { IS_MAC } from "./platform.js";

/**
* App-wide mouse-button policy (LUN-373):
*
* - Left does everything.
* - Right only opens the context menu.
* - Middle only pans a registered pan surface. Anywhere else it does nothing.
* - While a press is held, presses of other buttons do nothing.
* - A right or middle press outside an open menu, popover or dialog only closes it.
*
* Live content is exempt. The prototype player and preview window render the
* user's own components, which may use any button, so a press that starts
* inside `[data-live-content]` keeps browser behaviour for all its events.
*
* Capture-phase listeners on `window` apply the policy before any component
* sees the event, so component handlers never check `event.button`. They run
* on press, release and click events only, never on pointer moves.
*
* Events dispatched by our own code (`isTrusted === false`) pass untouched.
* Pan surfaces and the layer dismissal rely on that.
*/
/** Set on the content of every portalled menu, popover, select, combobox and dialog in `@petal/ui`. Radix marks open content with `data-state`, Base UI with `data-open`. */
var OPEN_LAYER_SELECTOR = "[data-dismissable-layer][data-state=\"open\"], [data-dismissable-layer][data-open]";
/** Whether a menu, popover, select, combobox or dialog is open. Its own Esc should close it first. */
function hasOpenLayer() {
	return typeof document !== "undefined" && document.querySelector(OPEN_LAYER_SELECTOR) !== null;
}
/** Set on the frame `PresentationFrame` renders. */
var LIVE_CONTENT_SELECTOR = "[data-live-content]";
var surfaces = /* @__PURE__ */ new Map();
var installed = false;
/** Idempotent. App entries call it before rendering; pan surfaces call it too. */
function installMouseButtonPolicy() {
	if (installed || typeof window === "undefined") return;
	installed = true;
	createMouseButtonGate(window);
}
/** Middle presses inside `element` start its pan. The innermost surface wins. */
function registerPanSurface(element, surface) {
	installMouseButtonPolicy();
	surfaces.set(element, surface);
	return () => {
		if (surfaces.get(element) === surface) surfaces.delete(element);
	};
}
function surfaceAt(target) {
	let found = null;
	for (const entry of surfaces) if (entry[0].contains(target) && (!found || found[0].contains(entry[0]))) found = entry;
	return found?.[1] ?? null;
}
/** Exported for tests. Returns the uninstaller. */
function createMouseButtonGate(win, { isUserInput = (event) => event.isTrusted, isMac = IS_MAC } = {}) {
	const doc = win.document;
	const decisions = /* @__PURE__ */ new Map();
	let sequence = null;
	const buttonOf = (event) => isMac && event.button === 0 && event.ctrlKey ? 2 : event.button;
	const stop = (event, cancel) => {
		if (cancel) event.preventDefault();
		event.stopImmediatePropagation();
	};
	/** Closes open layers through their own outside-press handling. */
	const dismissLayersOutside = (event) => {
		const layers = doc.querySelectorAll(OPEN_LAYER_SELECTOR);
		if (layers.length === 0) return false;
		const target = event.target;
		for (const layer of layers) if (target && layer.contains(target)) return false;
		doc.documentElement.dispatchEvent(new win.PointerEvent("pointerdown", {
			bubbles: true,
			cancelable: true,
			composed: true,
			pointerType: "mouse",
			isPrimary: true,
			button: event.button,
			buttons: event.buttons,
			clientX: event.clientX,
			clientY: event.clientY
		}));
		return true;
	};
	const decide = (event, button) => {
		if (button === 0) return "pass";
		if (dismissLayersOutside(event)) return "block";
		if (button === 1) {
			const target = event.target;
			return target && surfaceAt(target)?.beginPan(event) ? "pan" : "block";
		}
		return button === 2 ? "menu" : "block";
	};
	const onPointerDown = (event) => {
		if (!isUserInput(event)) return;
		decisions.clear();
		const button = buttonOf(event);
		const decision = event.target?.closest?.(LIVE_CONTENT_SELECTOR) ? "native" : decide(event, button);
		decisions.set(button, decision);
		sequence = decision;
		if (decision !== "pass" && decision !== "native") stop(event, false);
	};
	const onMouseDown = (event) => {
		if (!isUserInput(event)) return;
		const button = buttonOf(event);
		let decision = decisions.get(button);
		if (decision === void 0) {
			decision = sequence === "native" ? "native" : "block";
			decisions.set(button, decision);
		}
		if (decision === "pass" || decision === "native") return;
		stop(event, button <= 1);
	};
	const onMouseUpOrClick = (event) => {
		if (!isUserInput(event)) return;
		if (event.type === "click" && event.detail === 0) return;
		const button = buttonOf(event);
		const decision = decisions.get(button);
		if (decision === "pass" || decision === "native") return;
		if (decision === "pan" && event.type === "mouseup") return;
		stop(event, button === 1);
	};
	const onPointerUp = (event) => {
		if (!isUserInput(event)) return;
		if (sequence === "pass" || sequence === "pan" || sequence === "native") return;
		stop(event, false);
	};
	const onContextMenu = (event) => {
		if (!isUserInput(event)) return;
		const decision = decisions.get(buttonOf(event));
		if (decision === "menu" || decision === "native") return;
		if (event.button === 0 && event.buttons === 0 && !(isMac && event.ctrlKey)) return;
		stop(event, true);
	};
	const listeners = [
		["pointerdown", onPointerDown],
		["mousedown", onMouseDown],
		["pointerup", onPointerUp],
		["mouseup", onMouseUpOrClick],
		["click", onMouseUpOrClick],
		["auxclick", onMouseUpOrClick],
		["dblclick", onMouseUpOrClick],
		["contextmenu", onContextMenu]
	];
	for (const [type, listener] of listeners) win.addEventListener(type, listener, { capture: true });
	return () => {
		for (const [type, listener] of listeners) win.removeEventListener(type, listener, { capture: true });
	};
}

export { hasOpenLayer, installMouseButtonPolicy, registerPanSurface };
