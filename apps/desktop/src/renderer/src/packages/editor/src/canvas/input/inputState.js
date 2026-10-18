// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/inputState.ts

var IDLE = {
	spaceHeld: false,
	panMode: false
};
var state = IDLE;
var listeners$1 = /* @__PURE__ */ new Set();
function getCanvasInputState() {
	return state;
}
function publishCanvasInputState(spaceHeld, panMode) {
	if (state.spaceHeld === spaceHeld && state.panMode === panMode) return;
	state = spaceHeld || panMode ? {
		spaceHeld,
		panMode
	} : IDLE;
	for (const listener of listeners$1) listener();
}
function subscribeCanvasInputState(listener) {
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
	};
}
var zoomMode = false;
var zoomListeners = /* @__PURE__ */ new Set();
/** Z is held and a left press drags a zoom rectangle (the canvas shows the zoom-in cursor). */
function getCanvasZoomMode() {
	return zoomMode;
}
function publishCanvasZoomMode(on) {
	if (zoomMode === on) return;
	zoomMode = on;
	for (const listener of zoomListeners) listener();
}
function subscribeCanvasZoomMode(listener) {
	zoomListeners.add(listener);
	return () => {
		zoomListeners.delete(listener);
	};
}
var handleGesture$1 = null;
/**
* The handle gesture running now, for code that must stand aside while it
* does: hover and the overlay geometry store (frozen mid-rotate). Read at event
* time; nothing re-renders when it changes.
*/
function getCanvasHandleGesture() {
	return handleGesture$1;
}
var menuTarget = null;
var keyTaken = null;
/**
* The machine acted on this keydown, so the editor's own handler must not too:
* an Escape that cancelled a pending press (no going up a level).
*/
function markCanvasKeyTaken(event) {
	keyTaken = event;
}
/** Whether the machine took this key. */
function canvasTookKey(event) {
	return event === keyTaken;
}
/** The machine named the target of a right-click on `node`. */
function setCanvasContextMenuTarget(node, target) {
	menuTarget = {
		node,
		target
	};
}
/** The target the machine named for a right-click on `node`, once; null when it named none. */
function takeCanvasContextMenuTarget(node) {
	const named = menuTarget && menuTarget.node === node ? menuTarget.target : null;
	menuTarget = null;
	return named;
}
function setCanvasHandleGesture(next) {
	handleGesture$1 = next;
}

export { canvasTookKey, getCanvasHandleGesture, getCanvasInputState, getCanvasZoomMode, markCanvasKeyTaken, publishCanvasInputState, publishCanvasZoomMode, setCanvasContextMenuTarget, setCanvasHandleGesture, subscribeCanvasInputState, subscribeCanvasZoomMode, takeCanvasContextMenuTarget };
