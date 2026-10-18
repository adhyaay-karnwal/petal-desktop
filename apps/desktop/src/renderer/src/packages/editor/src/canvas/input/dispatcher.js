// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/dispatcher.ts
import { notifyUserCameraGesture, subscribeCamera } from "../../shell/hooks/useCommentAgent.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { createClickCounter } from "../utils/selection.js";
import { getSelectedElementIds } from "../../shared/state/selection.js";
import { isTypingTarget, matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { markCanvasKeyTaken, publishCanvasInputState, publishCanvasZoomMode, setCanvasHandleGesture } from "./inputState.js";
import { targetBeneathCursorLayer } from "../utils/collisionUtils.js";
import { isDrawableTool } from "../../shared/utils/toolElements.js";
import { zoomCameraToRegion } from "./camera.js";
import { commonAncestor } from "./selectTarget.js";
import { handleAt, handleZone } from "./handles.js";
import { createCanvasInputMachine } from "./machine.js";
import { canvasInputRoot, homePath, isRegionMaskChord } from "./states.js";

/**
* Feeds all canvas input to the state machine (LUN-376) and carries out what
* it decides. The dispatcher cancels the wheel, Safari pinch, zoom keys and
* Space when the machine consumes them, and captures the pointer for a pan.
* A press is tested against the selection's handle geometry before the DOM.
* A resize, scale or rotate, and a draw, marquee, element drag, pin drag,
* region-mask drag or zoom rectangle, hold the pointer on the handle cursor surface.
*
* Pointer listeners are passive and run in the capture phase, so a press is
* seen even when an overlay stops it. They never stop propagation, never read
* layout per move (except under the comment tool's cursor layer), and never
* cancel `contextmenu`, which opens Radix's menu. Wheel and key listeners run
* in the bubble phase on window, so an event an inner element stops (a field
* being typed in) is missed.
*/
var attribute = (name) => (hit) => hit.getAttribute(name);
/**
* First match wins. Labels sit inside `[data-overlay-interactive]`, so they come first.
* An open text edit (Tiptap's `.ProseMirror`) stops presses from reaching the canvas
* (TextEditor's container), so a press inside it starts no canvas gesture.
* The selection's handles and rotate zones take no pointer events; `pressTarget`
* finds them from geometry. The cursor surface over one resolves the same way.
*/
var HIT_RULES = [
	[
		"[data-region-mask]",
		"chrome",
		() => "region-mask"
	],
	[
		"[data-handle-cursor]",
		"chrome",
		() => "handle-cursor"
	],
	[
		"[data-comment-pin]",
		"pin",
		attribute("data-comment-id")
	],
	[
		"[data-label-control]",
		"chrome",
		() => null
	],
	[
		"[data-root-label-id]",
		"label",
		attribute("data-root-label-id")
	],
	[
		"[data-selection-label-id]",
		"label",
		attribute("data-selection-label-id")
	],
	[
		"[data-canvas-bottom-chrome], [data-overlay-interactive], [data-dismissable-layer]",
		"chrome",
		() => null
	],
	[
		".ProseMirror",
		"chrome",
		() => "text-editor"
	],
	[
		"[data-webview-handle]",
		"frameEdge",
		(hit) => hit.closest("[data-element-id]")?.getAttribute("data-element-id") ?? null
	],
	[
		"[data-element-id]",
		"element",
		attribute("data-element-id")
	]
];
function surfaceOf(target) {
	if (target.closest("[data-canvas-camera]")) return "camera";
	return target.closest("[data-overlay-container]") ? "overlay" : "other";
}
/** What the DOM under a press is, before handle geometry. Runs once per press. */
function hitTargetFor(target) {
	const surface = surfaceOf(target);
	for (const [selector, kind, id] of HIT_RULES) {
		const hit = target.closest(selector);
		if (hit) return {
			kind,
			id: id(hit),
			surface
		};
	}
	return {
		kind: "background",
		id: null,
		surface
	};
}
/**
* Whether the selection's handles are drawn over this DOM hit. They sit over
* everything the camera moves (elements and anything inside them, the text
* editor), and under labels, pins, the region mask and the editor
* chrome, as the overlay stacks them.
*/
var underHandles = (hit) => hit.surface === "camera" || hit.id === "handle-cursor";
function canvasModeFor(activeTool, { commentMode, readOnly, regionMask, editingText }) {
	return {
		tool: commentMode || activeTool === "comment" ? "comment" : activeTool === "pan" ? "hand" : activeTool === "scale" ? "scale" : isDrawableTool(activeTool) ? "draw" : "select",
		readOnly,
		regionMask,
		editingText
	};
}
var modifiersOf = (e) => ({
	shift: e.shiftKey,
	alt: e.altKey,
	meta: e.metaKey,
	ctrl: e.ctrlKey
});
var pointerTypeOf = (e) => e.pointerType === "touch" || e.pointerType === "pen" ? e.pointerType : "mouse";
/** The typing rule Canvas's Space handler and PetalEditor's key handler both use. */
function isOwnerTypingTarget(e) {
	const target = e.target;
	return !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}
/** The zoom shortcut a keydown is, with the same typing guard the zoom keys always had. */
function zoomCommandOf(e) {
	if (e.type !== "keydown" || isTypingTarget(e)) return null;
	const shortcuts = LOCAL_SHORTCUTS.canvas;
	if (matchesShortcut(e, shortcuts.zoomIn)) return "in";
	if (matchesShortcut(e, shortcuts.zoomOut)) return "out";
	if (matchesShortcut(e, shortcuts.zoomActual)) return "actual";
	return null;
}
/** The tool shortcut a keydown is. Cmd/Ctrl/Alt chords belong to other shortcuts; Shift picks Grid/Image/Video. */
function toolKeyOf(e) {
	if (e.type !== "keydown" || isTypingTarget(e) || e.metaKey || e.ctrlKey || e.altKey) return null;
	const s = LOCAL_SHORTCUTS.canvas;
	if (matchesShortcut(e, s.toolGrid)) return "grid";
	if (matchesShortcut(e, s.toolImage)) return "image";
	if (matchesShortcut(e, s.toolVideo)) return "video";
	if (matchesShortcut(e, s.toolMove)) return "move";
	if (matchesShortcut(e, s.toolScale)) return "scale";
	if (matchesShortcut(e, s.toolPan)) return "pan";
	if (matchesShortcut(e, s.toolFrame)) return "frame";
	if (matchesShortcut(e, s.toolToggleStack)) return "toggleStack";
	if (matchesShortcut(e, s.toolText)) return "text";
	if (matchesShortcut(e, s.toolEscapeToMove)) return "escapeToMove";
	return null;
}
/** A Z keydown that arms zoom to area, with the tool shortcuts' guard. ⌘Z and Ctrl+Z stay undo. */
var isZoomRegionKey = (e) => e.type === "keydown" && !isTypingTarget(e) && matchesShortcut(e, LOCAL_SHORTCUTS.canvas.zoomRegion);
/** Wheel over the canvas or a dragged copy of an element; a comment thread or composer keeps its own. */
function isCanvasWheel(target) {
	return !!target?.closest?.("[data-canvas-viewport], [data-drag-overlay]") && !target.closest(".ed-comment-surface");
}
var NO_HANDLES = {
	boxes: () => [],
	cursor: () => "",
	begin: () => false,
	move() {},
	modifiers() {},
	end() {}
};
var NO_GESTURES = {
	begin: () => null,
	move() {},
	modifiers() {},
	camera() {},
	end() {},
	regionMask() {}
};
var NO_SELECT = {
	hover() {},
	click() {},
	contextMenu() {},
	label() {},
	deep() {},
	doubleClick() {},
	comment() {}
};
var NO_TOOLS = { pick() {} };
var NO_NUDGE = {
	begin: () => false,
	move() {},
	end() {},
	selectedOther: () => false,
	spent: () => false,
	setSpent() {}
};
/**
* Stops the click that the button now down produces when released; the next press clears it if none came.
* With `mouseOnly`, a click with no mouse press behind it (keyboard activation, `el.click()`) goes through.
*/
function swallowNextClick(win, mouseOnly = false) {
	const stop = (e) => {
		if (mouseOnly && e.detail === 0) return;
		e.stopPropagation();
		e.preventDefault();
		done();
	};
	const done = () => {
		win.removeEventListener("click", stop, true);
		win.removeEventListener("pointerdown", done, true);
	};
	win.addEventListener("click", stop, true);
	win.addEventListener("pointerdown", done, true);
}
function attachCanvasInput({ win, viewport, mode, camera, host, handles = NO_HANDLES, gestures = NO_GESTURES, select = NO_SELECT, nudge = NO_NUDGE, tools = NO_TOOLS, handleCursor = null, inspect = false }) {
	let current = null;
	const captured = /* @__PURE__ */ new Map();
	const holdPointer = (pointerId, element) => {
		try {
			element.setPointerCapture(pointerId);
			captured.set(pointerId, element);
		} catch {}
	};
	const release = (pointerId) => {
		const element = captured.get(pointerId);
		captured.delete(pointerId);
		if (element?.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
	};
	let gesture = null;
	let pointerGesture = null;
	let spent = null;
	/** A gesture ended: let go of its pointer, or keep it while its button is still down. */
	const letGo = (pointerId) => {
		if (handleCursor && pressed.has(pointerId) && captured.get(pointerId) === handleCursor) {
			spent = pointerId;
			handleCursor.style.cursor = "";
			return;
		}
		release(pointerId);
		hideSurface();
	};
	/** Holds a gesture's pointer on the cursor surface, which shows `cursor` while it runs. */
	const holdOnSurface = (pointerId, screen, cursor) => {
		if (!handleCursor) {
			holdPointer(pointerId, viewport);
			return;
		}
		if (!surfaceKey) placeSurface({
			left: screen.x - originX,
			top: screen.y - originY,
			width: 1,
			height: 1,
			transform: "none",
			origin: {
				x: 0,
				y: 0
			}
		});
		surfaceKey = "gesture";
		handleCursor.style.cursor = cursor;
		holdPointer(pointerId, handleCursor);
	};
	const effects = {
		camera: camera.get,
		setCamera: camera.set,
		grabCamera: host.grab,
		releaseCamera: host.release,
		userCameraGesture: notifyUserCameraGesture,
		markWheelZoom: host.markWheelZoom,
		capturePointer: (pointerId) => holdPointer(pointerId, viewport),
		releasePointer: release,
		consume() {
			current?.preventDefault();
		},
		beginHandle(kind, target, pointerId, at) {
			const setCursor = (cursor) => {
				if (handleCursor) handleCursor.style.cursor = cursor;
			};
			if (!handles.begin(kind, target, at, setCursor)) return false;
			gesture = {
				kind,
				pointerId
			};
			setCanvasHandleGesture(kind);
			holdOnSurface(pointerId, at.screen, handles.cursor(target));
			return true;
		},
		moveHandle: (at) => handles.move(at),
		handleModifiers: (at) => handles.modifiers(at),
		endHandle(end) {
			const running = gesture;
			gesture = null;
			handles.end(end);
			setCanvasHandleGesture(null);
			if (running) letGo(running.pointerId);
			else hideSurface();
		},
		beginGesture(kind, target, pointerId, start, at) {
			const cursor = gestures.begin(kind, target, start, at, pressNodes.get(pointerId) ?? null);
			if (cursor === null) return false;
			pointerGesture = {
				kind,
				pointerId
			};
			holdOnSurface(pointerId, at.screen, cursor);
			return true;
		},
		moveGesture: (at) => gestures.move(at),
		gestureModifiers: (at) => gestures.modifiers(at),
		endGesture(end, at) {
			const running = pointerGesture;
			pointerGesture = null;
			if (running) letGo(running.pointerId);
			else hideSurface();
			if (running?.kind === "zoomRegion") swallowNextClick(win, true);
			gestures.end(end, at);
		},
		zoomToRegion(start, end) {
			const origin = readOrigin();
			const local = (p) => ({
				x: p.x - origin.left,
				y: p.y - origin.top
			});
			const next = zoomCameraToRegion(camera.get(), local(start), local(end), origin);
			if (!next) return false;
			camera.set(next);
			notifyUserCameraGesture();
			return true;
		},
		hover: () => select.hover(overNode),
		click(release) {
			select.click(clickNode(release), {
				...release,
				count: () => countClick(release.screen.x, release.screen.y, release.time)
			});
		},
		placeComment: (release) => select.comment(clickNode(release), release),
		pickTool: (tool) => tools.pick(tool),
		contextMenu() {
			if (menuNode) select.contextMenu(menuNode);
		},
		doubleClick() {
			if (doubleClickNode) select.doubleClick(doubleClickNode);
		},
		pressLabel: (id, shift) => select.label(id, shift),
		takeKey() {
			if (current) markCanvasKeyTaken(current);
		},
		beginNudge: () => nudge.begin(),
		moveNudge: (dx, dy) => nudge.move(dx, dy),
		endNudge: (commit) => nudge.end(commit),
		clickSelectedOther: () => nudge.selectedOther(),
		nudgeSpent: () => nudge.spent(),
		setNudgeSpent: (spent) => nudge.setSpent(spent)
	};
	const machine = createCanvasInputMachine({
		root: canvasInputRoot,
		mode,
		home: homePath,
		effects
	});
	const pressed = /* @__PURE__ */ new Map();
	const pressNodes = /* @__PURE__ */ new Map();
	const beneath = (target, e) => targetBeneathCursorLayer(target, e.clientX, e.clientY, win.document);
	let overNode = null;
	let menuNode = null;
	let doubleClickNode = null;
	/** Where the browser would dispatch a release's click: the nearest node holding both its press and its release. */
	const clickNode = (release) => {
		const released = current?.target ?? null;
		return commonAncestor(pressNodes.get(release.pointerId) ?? null, released?.closest ? beneath(released, current) : released);
	};
	const countClick = createClickCounter();
	let originX = 0;
	let originY = 0;
	let originStale = true;
	let pointerX = 0;
	let pointerY = 0;
	let pointerSeen = false;
	let deep = false;
	const readDeep = (on) => {
		if (on === deep) return;
		deep = on;
		select.deep(on);
	};
	let surfaceKey = "";
	let hover = null;
	const placeSurface = (zone) => {
		const style = handleCursor.style;
		style.display = "block";
		style.left = `${zone.left}px`;
		style.top = `${zone.top}px`;
		style.width = `${zone.width}px`;
		style.height = `${zone.height}px`;
		style.transform = zone.transform === "none" ? "" : zone.transform;
		style.transformOrigin = `${zone.origin.x}px ${zone.origin.y}px`;
	};
	function hideSurface() {
		if (!handleCursor || !surfaceKey) return;
		surfaceKey = "";
		handleCursor.style.display = "none";
		handleCursor.style.cursor = "";
		handleCursor.removeAttribute("data-handle-element-id");
	}
	/** Puts the cursor surface over the handle under the hovering pointer, if any. Arithmetic only. */
	const refreshHover = () => {
		if (!handleCursor || gesture || pointerGesture || spent !== null) return;
		if (!hover?.underHandles || machine.path() !== "select.idle" || machine.context().mode.readOnly) return hideSurface();
		const boxes = handles.boxes();
		if (boxes.length === 0) return hideSurface();
		const view = camera.get();
		const hit = handleAt(boxes, view, hover.local);
		if (!hit) return hideSurface();
		const zone = handleZone(boxes.find((box) => box.id === hit.id), view, hit);
		const handle = `${hit.kind} ${hit.name} ${hit.id}`;
		const key = `${handle} ${zone.left} ${zone.top} ${zone.width} ${zone.height} ${zone.transform}`;
		if (key === surfaceKey) return;
		if (!surfaceKey.startsWith(`${handle} `)) {
			handleCursor.style.cursor = handles.cursor({
				kind: hit.kind,
				id: hit.id,
				surface: "overlay",
				handle: hit.name
			});
			handleCursor.setAttribute("data-handle-element-id", hit.id);
		}
		surfaceKey = key;
		placeSurface(zone);
	};
	let maskArmed = false;
	const send = (event, dom = null) => {
		current = dom;
		try {
			machine.send(event);
		} finally {
			current = null;
		}
		const ctx = machine.context();
		publishCanvasInputState(ctx.spaceHeld, ctx.spaceHeld || ctx.mode.tool === "hand");
		publishCanvasZoomMode(machine.path().startsWith("zoomRegion."));
		if (ctx.regionMaskArmed !== maskArmed) {
			maskArmed = ctx.regionMaskArmed;
			gestures.regionMask(maskArmed, pointerSeen ? {
				x: pointerX,
				y: pointerY
			} : null);
		}
		if (surfaceKey && surfaceKey !== "gesture" && machine.path() !== "select.idle") hideSurface();
	};
	const readOrigin = () => {
		const origin = viewport.getBoundingClientRect();
		originX = origin.left;
		originY = origin.top;
		originStale = false;
		return origin;
	};
	/** The selection's handle under a press, when the handles are drawn over what the DOM says it landed on. */
	const pressTarget = (target, e) => {
		const dom = hitTargetFor(target);
		if (!underHandles(dom)) return dom;
		const hit = handleAt(handles.boxes(), camera.get(), {
			x: e.clientX - originX,
			y: e.clientY - originY
		});
		if (hit) return {
			kind: hit.kind,
			id: hit.id,
			surface: "overlay",
			handle: hit.name
		};
		return dom.id === "handle-cursor" ? {
			kind: "chrome",
			id: null,
			surface: dom.surface
		} : dom;
	};
	const pointerFields = (e) => {
		const { scale, positionX, positionY } = camera.get();
		const local = {
			x: e.clientX - originX,
			y: e.clientY - originY
		};
		return {
			pointerId: e.pointerId,
			pointerType: pointerTypeOf(e),
			button: e.button,
			screen: {
				x: e.clientX,
				y: e.clientY
			},
			canvas: {
				x: (local.x - positionX) / scale,
				y: (local.y - positionY) / scale
			},
			local,
			modifiers: modifiersOf(e),
			time: e.timeStamp
		};
	};
	const onPointerDown = (e) => {
		if (!e.isTrusted) return;
		const hit = e.target;
		if (!hit?.closest || !viewport.contains(hit)) return;
		if (win.document.body?.style.pointerEvents === "none") return;
		host.settle();
		readOrigin();
		const target = beneath(hit, e);
		const fields = pointerFields(e);
		const peers = [...pressed.values()];
		pressed.set(e.pointerId, {
			pointerId: e.pointerId,
			pointerType: fields.pointerType,
			local: fields.local
		});
		pressNodes.set(e.pointerId, target);
		send({
			type: "pointerDown",
			target: pressTarget(target, e),
			peers,
			...fields
		}, e);
	};
	const onPointerMove = (e) => {
		if (!e.isTrusted) return;
		if (e.pointerType !== "touch") {
			pointerX = e.clientX;
			pointerY = e.clientY;
			pointerSeen = true;
			readDeep(e.metaKey || e.ctrlKey);
		}
		const peer = pressed.get(e.pointerId);
		if (!peer) {
			if (e.pointerType !== "touch" && handleCursor && pressed.size === 0) hoverAt(e);
			if (e.pointerType !== "touch" && machine.context().mode.tool === "comment") {
				const node = overAt(e);
				if (node !== overNode) hoverOver(node, e.timeStamp, e);
			}
			return;
		}
		const fields = pointerFields(e);
		peer.local = fields.local;
		send({
			type: "pointerMove",
			...fields
		}, e);
	};
	const hoverAt = (e) => {
		const target = e.target;
		if (!target?.closest || !viewport.contains(target)) {
			hover = null;
			return hideSurface();
		}
		if (originStale) readOrigin();
		const local = {
			x: e.clientX - originX,
			y: e.clientY - originY
		};
		hover = {
			local,
			underHandles: true
		};
		if (!handleAt(handles.boxes(), camera.get(), local)) return hideSurface();
		hover.underHandles = underHandles(hitTargetFor(target));
		refreshHover();
	};
	const onPointerEnd = (e) => {
		if (!e.isTrusted || !pressed.delete(e.pointerId)) return;
		send({
			type: e.type === "pointerup" ? "pointerUp" : "pointerCancel",
			...pointerFields(e)
		}, e);
		pressNodes.delete(e.pointerId);
		if (spent === e.pointerId) {
			spent = null;
			release(e.pointerId);
			hideSurface();
		}
	};
	/** The pointer is over `node` now, or off the canvas (null). Off it twice in a row says nothing new. */
	const hoverOver = (node, time, dom) => {
		if (!node && !overNode) return;
		overNode = node;
		send({
			type: "hover",
			time
		}, dom);
	};
	const overAt = (e) => {
		const target = e.target;
		if (!target?.closest || !viewport.contains(target)) return null;
		return machine.context().mode.tool === "comment" ? beneath(target, e) : target;
	};
	const onPointerOver = (e) => {
		if (!e.isTrusted) return;
		hoverOver(overAt(e), e.timeStamp, e);
	};
	const onPointerOut = (e) => {
		if (!e.isTrusted || e.relatedTarget) return;
		hoverOver(null, e.timeStamp, e);
	};
	const onContextMenu = (e) => {
		const target = e.target;
		if (!target?.closest || !viewport.contains(target)) return;
		menuNode = beneath(target, e);
		try {
			send({
				type: "contextMenu",
				time: e.timeStamp
			}, e);
		} finally {
			menuNode = null;
		}
	};
	const onDoubleClick = (e) => {
		const target = e.target;
		if (!target?.closest || !viewport.contains(target)) return;
		doubleClickNode = beneath(target, e);
		try {
			send({
				type: "doubleClick",
				time: e.timeStamp
			}, e);
		} finally {
			doubleClickNode = null;
		}
	};
	const onLostCapture = (e) => {
		if (captured.get(e.pointerId) !== e.target || !pressed.has(e.pointerId)) return;
		captured.delete(e.pointerId);
		if (spent === e.pointerId) {
			spent = null;
			hideSurface();
		}
		send({
			type: "lostCapture",
			pointerId: e.pointerId,
			time: e.timeStamp
		}, e);
	};
	const zoomKeyFor = (e) => {
		const command = zoomCommandOf(e);
		if (!command) return null;
		const origin = readOrigin();
		return {
			command,
			pointer: pointerSeen ? {
				x: pointerX - originX,
				y: pointerY - originY
			} : null,
			center: {
				x: origin.width / 2,
				y: origin.height / 2
			}
		};
	};
	let escapeForLayer = null;
	let sentInCapture = null;
	const onKeyCapture = (e) => {
		if (e.key !== "Escape") {
			if (e.type === "keydown" && isRegionMaskChord(modifiersOf(e), e.code)) {
				onKey(e);
				sentInCapture = e;
			}
			return;
		}
		const pressing = machine.path() === "select.pointing";
		const { regionMaskArmed, nudge: nudging } = machine.context();
		if (!gesture && !pointerGesture && !regionMaskArmed && !nudging && !pressing) return;
		if (win.document.querySelector("[data-dismissable-layer]")) {
			escapeForLayer = e;
			return;
		}
		onKey(e);
		sentInCapture = e;
		if (!pressing) e.stopPropagation();
	};
	const onKey = (e) => {
		readDeep(e.metaKey || e.ctrlKey);
		if (e === escapeForLayer || e === sentInCapture) return;
		send({
			type: e.type === "keydown" ? "keyDown" : "keyUp",
			key: e.key,
			code: e.code,
			repeat: e.repeat,
			modifiers: modifiersOf(e),
			typing: isOwnerTypingTarget(e),
			selection: getSelectedElementIds().size,
			zoom: zoomKeyFor(e),
			tool: toolKeyOf(e),
			zoomRegion: isZoomRegionKey(e),
			time: e.timeStamp
		}, e);
	};
	const wheelEvent = (deltaX, deltaY, modifiers, clientX, clientY, time) => {
		const zoom = modifiers.ctrl || modifiers.meta;
		if (zoom) readOrigin();
		return {
			type: "wheel",
			screen: {
				x: clientX,
				y: clientY
			},
			local: zoom ? {
				x: clientX - originX,
				y: clientY - originY
			} : null,
			deltaX,
			deltaY,
			modifiers,
			time
		};
	};
	const onWheel = (e) => {
		if (!isCanvasWheel(e.target)) return;
		send(wheelEvent(e.deltaX, e.deltaY, modifiersOf(e), e.clientX, e.clientY, e.timeStamp), e);
	};
	const onGesture = (e) => {
		if (e.type === "gesturestart") return send({
			type: "gestureStart",
			time: e.timeStamp
		}, e);
		if (e.type === "gestureend") return send({
			type: "gestureEnd",
			time: e.timeStamp
		}, e);
		const ge = e;
		readOrigin();
		send({
			type: "gestureChange",
			scale: ge.scale,
			local: {
				x: ge.clientX - originX,
				y: ge.clientY - originY
			},
			time: e.timeStamp
		}, e);
	};
	const onResize = (e) => {
		originStale = true;
		send({
			type: "windowChange",
			change: "resize",
			time: e.timeStamp
		});
	};
	const onVisibility = (e) => send({
		type: "windowChange",
		change: win.document.visibilityState === "hidden" ? "hidden" : "visible",
		time: e.timeStamp
	});
	const onBlur = (e) => {
		if (e.target !== win) return;
		readDeep(false);
		send({
			type: "blur",
			time: e.timeStamp
		});
	};
	const capture = {
		capture: true,
		passive: true
	};
	const bubble = { passive: true };
	const active = { passive: false };
	const windowListeners = [
		[
			"pointerdown",
			onPointerDown,
			capture
		],
		[
			"pointermove",
			onPointerMove,
			capture
		],
		[
			"pointerup",
			onPointerEnd,
			capture
		],
		[
			"pointercancel",
			onPointerEnd,
			capture
		],
		[
			"pointerover",
			onPointerOver,
			capture
		],
		[
			"pointerout",
			onPointerOut,
			capture
		],
		[
			"contextmenu",
			onContextMenu,
			capture
		],
		[
			"dblclick",
			onDoubleClick,
			capture
		],
		[
			"wheel",
			onWheel,
			active
		],
		[
			"keydown",
			onKeyCapture,
			{
				capture: true,
				passive: false
			}
		],
		[
			"keydown",
			onKey,
			active
		],
		[
			"keyup",
			onKey,
			active
		],
		[
			"blur",
			onBlur,
			bubble
		],
		[
			"resize",
			onResize,
			bubble
		],
		[
			"visibilitychange",
			onVisibility,
			bubble
		]
	];
	const viewportListeners = [
		[
			"lostpointercapture",
			onLostCapture,
			bubble
		],
		[
			"gesturestart",
			onGesture,
			active
		],
		[
			"gesturechange",
			onGesture,
			active
		],
		[
			"gestureend",
			onGesture,
			active
		]
	];
	for (const [type, listener, options] of windowListeners) win.addEventListener(type, listener, options);
	for (const [type, listener, options] of viewportListeners) viewport.addEventListener(type, listener, options);
	publishCanvasInputState(false, mode.tool === "hand");
	const unsubscribeCamera = subscribeCamera(() => {
		if (pointerGesture) gestures.camera();
		else refreshHover();
	});
	const viewportResize = handleCursor && typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
		originStale = true;
	}) : null;
	viewportResize?.observe(viewport);
	const inspector = {
		path: machine.path,
		context: machine.context,
		log: () => [...machine.log()],
		counts: () => ({ ...machine.counts() }),
		clear: machine.clearLog
	};
	if (inspect) win.__canvasInput = inspector;
	return {
		setMode: (next) => send({
			type: "mode",
			mode: next,
			time: win.performance.now()
		}),
		beginPan(e) {
			const target = e.target;
			if (!target?.closest) return false;
			readOrigin();
			const fields = pointerFields(e);
			pressed.set(e.pointerId, {
				pointerId: e.pointerId,
				pointerType: fields.pointerType,
				local: fields.local
			});
			send({
				type: "panStart",
				pointerId: e.pointerId,
				pointerType: fields.pointerType,
				screen: fields.screen,
				target: hitTargetFor(target),
				time: e.timeStamp
			}, e);
			if (machine.path() === "panning") return true;
			pressed.delete(e.pointerId);
			return false;
		},
		forwardWheel({ deltaX, deltaY, zoom, clientX, clientY }) {
			send(wheelEvent(deltaX, deltaY, {
				shift: false,
				alt: false,
				meta: false,
				ctrl: zoom
			}, clientX, clientY, win.performance.now()));
		},
		handlesChanged: refreshHover,
		pointer: () => pointerSeen ? {
			x: pointerX,
			y: pointerY
		} : null,
		rehover() {
			if (!pointerSeen) return;
			const node = win.document.elementFromPoint(pointerX, pointerY);
			hoverOver(node && viewport.contains(node) ? node : null, win.performance.now(), null);
		},
		detach() {
			for (const [type, listener, options] of windowListeners) win.removeEventListener(type, listener, options);
			for (const [type, listener, options] of viewportListeners) viewport.removeEventListener(type, listener, options);
			unsubscribeCamera();
			viewportResize?.disconnect();
			const held = gesture?.pointerId ?? pointerGesture?.pointerId;
			if (gesture) effects.endHandle("cancel");
			const running = machine.context().gesture;
			if (running) effects.endGesture("cancel", running.last);
			if (held !== void 0 && pressed.has(held)) swallowNextClick(win);
			if (machine.context().nudge) nudge.end(true);
			if (maskArmed) gestures.regionMask(false, null);
			hideSurface();
			for (const id of [...captured.keys()]) release(id);
			camera.stop();
			if (machine.context().track) host.release();
			publishCanvasInputState(false, false);
			publishCanvasZoomMode(false);
			if (win.__canvasInput === inspector) delete win.__canvasInput;
		}
	};
}

export { attachCanvasInput, canvasModeFor };
