// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/states.ts
import { CANVAS_ZOOM_STEP, zoomScaleForWheel } from "../utils/zoom.js";
import { pastDragThreshold } from "../components/CanvasPixelGrid.js";
import { distance, midpoint, panCamera, pinchCamera, zoomCameraAt } from "./camera.js";
import { HANDLED } from "./stateNode.js";

var ARROW_KEYS$1 = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
/** ⇧⌘S / ⇧Ctrl+S arms the region mask, even while typing. */
function isRegionMaskChord(m, code) {
	return (m.meta || m.ctrl) && m.shift && !m.alt && code === "KeyS";
}
var isRegionMaskShortcut = (e) => isRegionMaskChord(e.modifiers, e.code);
var isEscape = (e) => e.key === "Escape";
/**
* An arrow that nudges or reorders the selection: a selection, no
* Cmd/Ctrl/Alt, not typing, not read-only, any tool. The machine nudges roots
* and absolute children; PetalEditor reorders in-flow flex children.
*/
function editorArrow(e, ctx) {
	if (e.typing || ctx.mode.readOnly || !ARROW_KEYS$1.has(e.key) || e.selection === 0) return false;
	return !e.modifiers.meta && !e.modifiers.ctrl && !e.modifiers.alt;
}
/** A press on the armed region mask's surface. */
var isMaskPress = (e) => e.target.kind === "chrome" && e.target.id === "region-mask";
var ZOOM_REGION_IDLE = "zoomRegion.idle";
/**
* The idle state of whichever tool is armed now. The armed region mask comes
* first, then Space, then Z, which stand in for the armed tool while held.
*/
function homePath(ctx) {
	if (ctx.regionMaskArmed) return "regionMask.idle";
	if (ctx.spaceHeld) return "hand.idle";
	if (ctx.zoomHeldBy !== null) return ZOOM_REGION_IDLE;
	if (ctx.mode.tool === "hand") return "hand.idle";
	if (ctx.mode.tool === "draw") return "draw.idle";
	if (ctx.mode.tool === "comment") return "comment.idle";
	return "select.idle";
}
/** Z is held and neither Space nor the armed region mask comes first: a left press drags a zoom rectangle. */
var zoomRegionArmed = (ctx) => homePath(ctx) === ZOOM_REGION_IDLE;
var ownPointer = (e, ctx) => ctx.press?.pointerId === e.pointerId;
function startPress(e, ctx, plan) {
	ctx.press = {
		pointerId: e.pointerId,
		pointerType: e.pointerType,
		start: e.screen,
		target: e.target,
		plan
	};
}
/** react-zoom-pan-pinch ignored a second tap this soon after the last. */
var DOUBLE_TAP_MS = 200;
/**
* react-zoom-pan-pinch panned the camera with any one-finger touch on the
* content, whatever else that press did, and the select, draw and comment
* states keep it: their press also pans until it ends. A second tap within
* 200ms of the last did not pan.
*/
function followTouch(e, ctx) {
	if (e.pointerType !== "touch" || e.target.surface !== "camera" || e.peers.length > 0) return;
	if (ctx.lastTouchAt !== null && e.time - ctx.lastTouchAt < DOUBLE_TAP_MS) return;
	ctx.lastTouchAt = e.time;
	ctx.track = {
		kind: "pan",
		last: e.screen,
		touch: true
	};
	ctx.effects.grabCamera();
}
function touchPan(e, ctx) {
	const track = ctx.track;
	if (track?.kind !== "pan" || !track.touch || !ownPointer(e, ctx)) return;
	ctx.effects.setCamera(panCamera(ctx.effects.camera(), e.screen.x - track.last.x, e.screen.y - track.last.y));
	track.last = e.screen;
}
function endTouchPan(ctx) {
	if (ctx.track?.kind !== "pan" || !ctx.track.touch) return;
	ctx.track = null;
	ctx.effects.releaseCamera();
}
/** What a left press with the Move or Scale tool can become. */
function selectPlan(target, ctx) {
	if (ctx.mode.readOnly) return null;
	switch (target.kind) {
		case "element":
		case "label": return ctx.mode.editingText ? null : { to: "select.dragging" };
		case "background": return ctx.mode.tool === "select" ? { to: "select.marquee" } : null;
		case "pin": return { to: "select.draggingPin" };
		default: return null;
	}
}
/** The pointer gesture a press's plan becomes, where the machine runs it. */
var OWNED_PLANS = {
	"select.dragging": "elementDrag",
	"select.marquee": "marquee",
	"select.draggingPin": "pin",
	"comment.draggingPin": "pin"
};
/** Waits for the press's drag threshold. */
function pointing(id, ends) {
	return {
		id,
		on: {
			pointerMove(e, ctx) {
				touchPan(e, ctx);
				const press = ctx.press;
				if (!press?.plan || !ownPointer(e, ctx)) return HANDLED;
				if (!pastDragThreshold(e.screen.x - press.start.x, e.screen.y - press.start.y)) return HANDLED;
				const owned = OWNED_PLANS[press.plan.to];
				if (owned && !startGesture(owned, e, ctx)) {
					if (owned === "elementDrag") return { to: press.plan.to };
					press.plan = null;
					return HANDLED;
				}
				return { to: press.plan.to };
			},
			pointerUp(e, ctx) {
				if (!ownPointer(e, ctx)) return HANDLED;
				ends.onRelease?.(e, ctx);
				return {
					to: homePath(ctx),
					outcome: ends.release
				};
			},
			pointerCancel: (e, ctx) => ownPointer(e, ctx) ? {
				to: homePath(ctx),
				outcome: ends.pointerCancel
			} : HANDLED,
			keyDown: (e, ctx) => isEscape(e) && ends.escape ? ends.escape(ctx) : void 0,
			blur: (_e, ctx) => ends.blur?.(ctx),
			windowChange: (_e, ctx) => ends.windowChange?.(ctx)
		}
	};
}
/** A tool's idle state. */
var rest = (id, on) => ({
	id,
	rest: true,
	enter(ctx) {
		endTouchPan(ctx);
		ctx.press = null;
	},
	on
});
/** Starts a pointer gesture from the press; `e` is where the pointer is now. */
function startGesture(kind, e, ctx) {
	const press = ctx.press;
	const at = handlePointer(e.screen, e.modifiers);
	if (!ctx.effects.beginGesture(kind, press.target, press.pointerId, press.start, at)) return false;
	ctx.gesture = {
		kind,
		last: at
	};
	return true;
}
function endGesture(ctx, how, at) {
	const gesture = ctx.gesture;
	if (!gesture) return;
	ctx.gesture = null;
	ctx.effects.endGesture(how, at ?? gesture.last);
}
/**
* A draw, marquee, element drag, pin drag, region-mask drag or zoom rectangle the machine runs. Its
* pointer's moves preview, its release commits once, and Escape,
* `pointercancel`, a lost capture or a window blur cancel: the preview goes
* back and nothing is committed. Leaving the state any other way cancels too.
* Another mouse or pen press does nothing; a second finger goes to the root,
* which may start a pinch.
*/
function ownedGesture(id, rules = {}) {
	const interrupted = (ctx) => {
		endGesture(ctx, "cancel");
		return {
			to: rules.interrupted ?? homePath(ctx),
			outcome: "cancel"
		};
	};
	const modifierKey = (e, ctx) => {
		const gesture = ctx.gesture;
		if (!rules.modifierKeys || !gesture || !MODIFIER_KEYS.has(e.key)) return void 0;
		if (e.type === "keyUp") releaseZoom(e, ctx);
		gesture.last = handlePointer(gesture.last.screen, e.modifiers);
		ctx.effects.gestureModifiers(gesture.last);
		return HANDLED;
	};
	return {
		id,
		exit(ctx) {
			if (ctx.gesture?.handOff) ctx.gesture.handOff = false;
			else endGesture(ctx, "cancel");
		},
		on: {
			pointerDown: (e, ctx) => ownPointer(e, ctx) || e.pointerType === "touch" ? void 0 : HANDLED,
			pointerMove(e, ctx) {
				touchPan(e, ctx);
				const gesture = ctx.gesture;
				if (!gesture || !ownPointer(e, ctx)) return HANDLED;
				gesture.last = handlePointer(e.screen, e.modifiers);
				ctx.effects.moveGesture(gesture.last);
				const next = rules.next;
				const start = ctx.press.start;
				if (!next || !pastDragThreshold(e.screen.x - start.x, e.screen.y - start.y)) return HANDLED;
				gesture.handOff = true;
				return { to: next.to };
			},
			pointerUp(e, ctx) {
				if (!ownPointer(e, ctx)) return HANDLED;
				const outcome = rules.release?.(e, ctx) ?? "commit";
				endGesture(ctx, "commit", handlePointer(e.screen, e.modifiers));
				return {
					to: homePath(ctx),
					outcome
				};
			},
			pointerCancel: (e, ctx) => ownPointer(e, ctx) ? interrupted(ctx) : HANDLED,
			lostCapture: (e, ctx) => ownPointer(e, ctx) ? interrupted(ctx) : HANDLED,
			keyDown(e, ctx) {
				if (!isEscape(e)) return modifierKey(e, ctx);
				if (rules.keysToParent) return void 0;
				ctx.effects.consume();
				endGesture(ctx, "escape");
				return {
					to: homePath(ctx),
					outcome: "cancel"
				};
			},
			keyUp: modifierKey,
			blur(_e, ctx) {
				if (rules.keysToParent) return void 0;
				forgetHeldKeys(ctx);
				endGesture(ctx, "cancel");
				return {
					to: homePath(ctx),
					outcome: "cancel"
				};
			},
			windowChange: (_e, ctx) => rules.windowChange ? interrupted(ctx) : void 0
		}
	};
}
var HANDLE_STATE = {
	resize: "select.resizing",
	scale: "select.scaling",
	rotate: "select.rotating"
};
var MODIFIER_KEYS = /* @__PURE__ */ new Set([
	"Shift",
	"Alt",
	"Meta",
	"Control"
]);
var handlePointer = (screen, m) => ({
	screen,
	shift: m.shift,
	alt: m.alt,
	cmd: m.meta || m.ctrl
});
/** A left press on a resize handle or a rotate zone. The handles scale with the K tool. */
function startHandle(e, ctx) {
	const gesture = e.target.kind === "rotate" ? "rotate" : ctx.mode.tool === "scale" ? "scale" : "resize";
	const at = handlePointer(e.screen, e.modifiers);
	if (!ctx.effects.beginHandle(gesture, e.target, e.pointerId, at)) return HANDLED;
	ctx.effects.consume();
	startPress(e, ctx, null);
	ctx.handle = {
		gesture,
		last: at
	};
	return { to: HANDLE_STATE[gesture] };
}
/**
* A resize, scale or rotate from a handle. It ends with its pointer's release
* (one commit) or is cancelled by Escape, `pointercancel`, a lost capture or a
* window blur, which put the preview back. Leaving the state any other way
* cancels too. A second pointer does nothing.
*/
function handleGesture(id) {
	const end = (ctx, how) => {
		ctx.handle = null;
		ctx.effects.endHandle(how);
		return {
			to: homePath(ctx),
			outcome: how === "commit" ? "commit" : "cancel"
		};
	};
	const modifierKey = (e, ctx) => {
		const handle = ctx.handle;
		if (!handle || handle.gesture === "rotate" || !MODIFIER_KEYS.has(e.key)) return void 0;
		if (e.type === "keyUp") releaseZoom(e, ctx);
		handle.last = handlePointer(handle.last.screen, e.modifiers);
		ctx.effects.handleModifiers(handle.last);
		return HANDLED;
	};
	return {
		id,
		exit(ctx) {
			if (!ctx.handle) return;
			ctx.handle = null;
			ctx.effects.endHandle("cancel");
		},
		on: {
			pointerDown: (e, ctx) => ownPointer(e, ctx) ? void 0 : HANDLED,
			pointerMove(e, ctx) {
				const handle = ctx.handle;
				if (!handle || !ownPointer(e, ctx)) return HANDLED;
				handle.last = handlePointer(e.screen, e.modifiers);
				ctx.effects.moveHandle(handle.last);
				return HANDLED;
			},
			pointerUp: (e, ctx) => ownPointer(e, ctx) ? end(ctx, "commit") : HANDLED,
			pointerCancel: (e, ctx) => ownPointer(e, ctx) ? end(ctx, "cancel") : HANDLED,
			lostCapture: (e, ctx) => ownPointer(e, ctx) ? end(ctx, "cancel") : HANDLED,
			keyDown(e, ctx) {
				if (!isEscape(e)) return modifierKey(e, ctx);
				ctx.effects.consume();
				return end(ctx, "escape");
			},
			keyUp: modifierKey,
			blur(_e, ctx) {
				forgetHeldKeys(ctx);
				return end(ctx, "cancel");
			}
		}
	};
}
var NUDGE_DIRECTION = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1]
};
/** One arrow keydown, auto-repeats included: 1px, or 10px with Shift, read per key. */
function nudgeBy(e, ctx) {
	const nudge = ctx.nudge;
	const [x, y] = NUDGE_DIRECTION[e.key];
	const step = e.modifiers.shift ? 10 : 1;
	nudge.dx += x * step;
	nudge.dy += y * step;
	ctx.effects.consume();
	ctx.effects.moveNudge(nudge.dx, nudge.dy);
}
function endNudge(ctx, commit) {
	if (!ctx.nudge) return;
	ctx.nudge = null;
	ctx.effects.endNudge(commit);
}
/** Escape while arrows are held: put the preview back. The arrows still held then do nothing until one is pressed again. */
function cancelNudge(ctx) {
	ctx.effects.consume();
	endNudge(ctx, false);
	ctx.effects.setNudgeSpent(true);
}
/**
* A click selected another object while arrows are held: the move made so far
* commits once, and the arrows still held do nothing until one is pressed
* again, so they never move the new selection. (Before the machine, the hold
* kept moving the old targets.)
*/
function endHeldNudge(ctx) {
	endNudge(ctx, true);
	ctx.effects.setNudgeSpent(true);
}
var select = {
	id: "select",
	children: [
		rest("idle", {
			doubleClick(_e, ctx) {
				if (!ctx.mode.readOnly) ctx.effects.doubleClick();
				return HANDLED;
			},
			pointerDown(e, ctx) {
				if (e.button !== 0 || e.target.kind === "chrome") return HANDLED;
				if (!ctx.mode.readOnly && (e.target.kind === "handle" || e.target.kind === "rotate")) return startHandle(e, ctx);
				if (e.target.kind === "frameEdge") {
					if (ctx.mode.readOnly) return HANDLED;
					startPress(e, ctx, null);
					if (startGesture("frameResize", e, ctx)) return { to: "select.resizingFrame" };
					ctx.press = null;
					return HANDLED;
				}
				if (e.target.kind === "label" && e.target.id && !ctx.mode.readOnly) ctx.effects.pressLabel(e.target.id, e.modifiers.shift);
				startPress(e, ctx, selectPlan(e.target, ctx));
				followTouch(e, ctx);
				return { to: "select.pointing" };
			}
		}),
		pointing("pointing", {
			release: "click",
			onRelease(e, ctx) {
				ctx.effects.click({
					pointerId: e.pointerId,
					screen: e.screen,
					shift: e.modifiers.shift,
					alt: e.modifiers.alt,
					time: e.time
				});
				if (ctx.nudge && ctx.effects.clickSelectedOther()) endHeldNudge(ctx);
			},
			pointerCancel: "cancel",
			escape(ctx) {
				ctx.effects.takeKey();
				return {
					to: homePath(ctx),
					outcome: "cancel"
				};
			},
			blur(ctx) {
				forgetHeldKeys(ctx);
				return {
					to: homePath(ctx),
					outcome: "cancel"
				};
			},
			windowChange(ctx) {
				if (ctx.press?.plan?.to === "select.dragging") ctx.press.plan = null;
				return HANDLED;
			}
		}),
		ownedGesture("dragging", {
			windowChange: true,
			modifierKeys: true
		}),
		ownedGesture("resizingFrame"),
		handleGesture("resizing"),
		handleGesture("scaling"),
		handleGesture("rotating"),
		ownedGesture("marquee"),
		ownedGesture("draggingPin"),
		{
			id: "nudging",
			on: {
				keyDown(e, ctx) {
					if (!isEscape(e)) return void 0;
					cancelNudge(ctx);
					return {
						to: homePath(ctx),
						outcome: "cancel"
					};
				},
				keyUp(e, ctx) {
					if (!ARROW_KEYS$1.has(e.key)) return void 0;
					endNudge(ctx, true);
					return {
						to: homePath(ctx),
						outcome: "commit"
					};
				},
				blur(_e, ctx) {
					forgetHeldKeys(ctx);
					return {
						to: homePath(ctx),
						outcome: "commit"
					};
				},
				windowChange(e, ctx) {
					if (e.change !== "hidden") return void 0;
					endNudge(ctx, true);
					return {
						to: homePath(ctx),
						outcome: "commit"
					};
				},
				pointerDown: (_e, ctx) => ({
					to: homePath(ctx),
					resend: true,
					note: "the arrow nudge carries on beside the press"
				})
			}
		}
	]
};
/** What an insert tool draws from: not the editor chrome, and not a pin, which keeps its press. */
var drawsFrom = (target) => target.kind !== "chrome" && target.kind !== "pin";
var DRAW_PLAN = { to: "draw.drawing" };
var draw = {
	id: "draw",
	children: [
		rest("idle", { pointerDown(e, ctx) {
			if (e.button !== 0 || ctx.mode.readOnly || !drawsFrom(e.target)) return HANDLED;
			startPress(e, ctx, DRAW_PLAN);
			if (!startGesture("draw", e, ctx)) {
				ctx.press = null;
				return HANDLED;
			}
			followTouch(e, ctx);
			return { to: "draw.pointing" };
		} }),
		ownedGesture("pointing", {
			modifierKeys: true,
			next: DRAW_PLAN
		}),
		ownedGesture("drawing", { modifierKeys: true })
	]
};
/**
* Drags the camera with one pointer. The camera keeps wherever the drag left
* it however the drag ends: the camera is view state, not a preview of an
* edit, so a cancel only stops following the pointer.
*/
function cameraPan(id) {
	const end = (outcome) => (ctx) => ({
		to: homePath(ctx),
		outcome
	});
	return {
		id,
		enter(ctx) {
			const press = ctx.press;
			ctx.track = {
				kind: "pan",
				last: press.start
			};
			ctx.effects.capturePointer(press.pointerId);
			ctx.effects.grabCamera();
		},
		exit(ctx) {
			ctx.effects.releasePointer(ctx.press.pointerId);
			if (ctx.track?.kind === "pan") ctx.track = null;
			ctx.effects.releaseCamera();
		},
		on: {
			pointerMove(e, ctx) {
				const track = ctx.track;
				if (!ownPointer(e, ctx) || track?.kind !== "pan") return HANDLED;
				ctx.effects.setCamera(panCamera(ctx.effects.camera(), e.screen.x - track.last.x, e.screen.y - track.last.y));
				track.last = e.screen;
				return HANDLED;
			},
			pointerUp: (e, ctx) => ownPointer(e, ctx) ? end("commit")(ctx) : HANDLED,
			pointerCancel: (e, ctx) => ownPointer(e, ctx) ? end("cancel")(ctx) : HANDLED,
			lostCapture: (e, ctx) => ctx.press?.pointerId === e.pointerId ? end("cancel")(ctx) : HANDLED,
			keyDown(e, ctx) {
				if (!isEscape(e)) return void 0;
				if (e.tool === "escapeToMove") escapeToMove(ctx);
				return end("cancel")(ctx);
			},
			blur(_e, ctx) {
				forgetHeldKeys(ctx);
				return end("cancel")(ctx);
			}
		}
	};
}
/** A left press pans from what the camera moves. */
var pansByHand = (target) => target.surface === "camera";
var hand = {
	id: "hand",
	children: [rest("idle", { pointerDown(e, ctx) {
		if (e.button !== 0 || !pansByHand(e.target)) return HANDLED;
		startPress(e, ctx, null);
		return { to: "hand.panning" };
	} }), cameraPan("panning")]
};
var comment$1 = {
	id: "comment",
	children: [
		rest("idle", { pointerDown(e, ctx) {
			if (e.button !== 0 || e.target.kind === "chrome") return HANDLED;
			startPress(e, ctx, e.target.kind === "pin" ? { to: "comment.draggingPin" } : null);
			followTouch(e, ctx);
			return { to: "comment.pointing" };
		} }),
		pointing("pointing", {
			release: "click",
			onRelease(e, ctx) {
				const press = ctx.press;
				if (press?.target.surface !== "camera") return;
				if (press.pointerType === "touch" && pastDragThreshold(e.screen.x - press.start.x, e.screen.y - press.start.y)) return;
				ctx.effects.placeComment({
					pointerId: e.pointerId,
					screen: e.screen,
					shift: e.modifiers.shift,
					alt: e.modifiers.alt,
					time: e.time
				});
			},
			pointerCancel: "cancel"
		}),
		ownedGesture("draggingPin")
	]
};
/** A blur releases every held key, whichever state handles it: Space, Z, the region mask, and an arrow hold, which commits. */
function forgetHeldKeys(ctx) {
	ctx.spaceHeld = false;
	ctx.zoomHeldBy = null;
	ctx.regionMaskArmed = false;
	ctx.effects.setNudgeSpent(false);
	endNudge(ctx, true);
}
function disarm(ctx) {
	ctx.regionMaskArmed = false;
	return {
		to: homePath(ctx),
		outcome: "cancel"
	};
}
var regionMask = {
	id: "regionMask",
	children: [rest("idle", { pointerDown(e, ctx) {
		if (e.button !== 0) return HANDLED;
		if (!isMaskPress(e)) {
			ctx.regionMaskArmed = false;
			return {
				to: homePath(ctx),
				resend: true
			};
		}
		startPress(e, ctx, { to: "regionMask.dragging" });
		if (!startGesture("regionMask", e, ctx)) {
			ctx.press = null;
			return HANDLED;
		}
		ctx.effects.consume();
		return { to: "regionMask.dragging" };
	} }), ownedGesture("dragging", {
		release(e, ctx) {
			ctx.regionMaskArmed = false;
			const start = ctx.press.start;
			return pastDragThreshold(e.screen.x - start.x, e.screen.y - start.y) ? "commit" : "click";
		},
		interrupted: "regionMask.idle",
		keysToParent: true
	})],
	on: {
		keyDown(e, ctx) {
			if (isRegionMaskShortcut(e)) {
				ctx.effects.consume();
				return e.repeat ? HANDLED : disarm(ctx);
			}
			if (!isEscape(e)) return void 0;
			ctx.effects.consume();
			return disarm(ctx);
		},
		blur(_e, ctx) {
			forgetHeldKeys(ctx);
			return {
				to: homePath(ctx),
				outcome: "cancel"
			};
		}
	}
};
/** What a zoom rectangle starts from: the canvas and the overlays over it, not the editor chrome. */
var zoomsFrom = (target) => target.kind !== "chrome" && target.surface !== "other";
/**
* Z held: a left press drags a screen-space rectangle, and its release fits
* the viewport to it. The press holds the pointer on the cursor surface from
* the start, so a release before the threshold zooms, selects, places and
* opens nothing. Releasing Z mid-drag lets the drag finish. Any tool, read-only
* included: it only moves the camera.
*/
var zoomRegion = {
	id: "zoomRegion",
	children: [rest("idle", { pointerDown(e, ctx) {
		if (e.button !== 0 || !zoomsFrom(e.target)) return HANDLED;
		startPress(e, ctx, { to: "zoomRegion.dragging" });
		if (!startGesture("zoomRegion", e, ctx)) {
			ctx.press = null;
			return HANDLED;
		}
		return { to: "zoomRegion.dragging" };
	} }), ownedGesture("dragging", { release(e, ctx) {
		const start = ctx.press.start;
		if (!pastDragThreshold(e.screen.x - start.x, e.screen.y - start.y)) return "click";
		return ctx.effects.zoomToRegion(start, e.screen) ? "commit" : "cancel";
	} })]
};
/**
* Z's own keyup ends the hold, and so does ⌘'s: macOS sends no keyup for a key
* released while ⌘ is down, so Z let go under ⌘ would otherwise stay held.
* Returns whether this keyup ended it. Gestures that read ⌘ take its keyup
* before the root, so they call this too.
*/
function releaseZoom(e, ctx) {
	const held = ctx.zoomHeldBy;
	if (held === null || !(e.code === held || e.key.toLowerCase() === "z" || e.key === "Meta")) return false;
	ctx.zoomHeldBy = null;
	return true;
}
/** Middle-button drag on the pan surface, from any tool. */
var panning = cameraPan("panning");
/** The two pointers of a pinch, when `e` is the second finger of a touch press. */
function pinchStart(e, ctx) {
	const press = ctx.press;
	if (e.pointerType !== "touch" || press?.pointerType !== "touch" || e.peers.length !== 1) return null;
	const peer = e.peers[0];
	return peer.pointerId === press.pointerId && peer.pointerType === "touch" ? peer : null;
}
var pinchPointer = (e, ctx) => ctx.track?.kind === "pinch" && ctx.track.ids.includes(e.pointerId);
/**
* Two touch pointers zoom about their midpoint and pan as it moves. Lifting
* either ends it; the finger left down does nothing more.
*/
var pinching = {
	id: "pinching",
	enter(ctx) {
		ctx.effects.grabCamera();
	},
	exit(ctx) {
		ctx.track = null;
		ctx.effects.releaseCamera();
	},
	on: {
		pointerDown: () => HANDLED,
		pointerMove(e, ctx) {
			const track = ctx.track;
			if (track?.kind !== "pinch" || !track.points.has(e.pointerId)) return HANDLED;
			track.points.set(e.pointerId, e.local);
			const a = track.points.get(track.ids[0]);
			const b = track.points.get(track.ids[1]);
			ctx.effects.setCamera(pinchCamera(ctx.effects.camera(), track.pinch, a, b));
			track.pinch.lastCenter = midpoint(a, b);
			return HANDLED;
		},
		pointerUp: (e, ctx) => pinchPointer(e, ctx) ? {
			to: homePath(ctx),
			outcome: "commit"
		} : HANDLED,
		pointerCancel: (e, ctx) => pinchPointer(e, ctx) ? {
			to: homePath(ctx),
			outcome: "cancel"
		} : HANDLED,
		keyDown: (e, ctx) => isEscape(e) ? {
			to: homePath(ctx),
			outcome: "cancel"
		} : void 0,
		blur(_e, ctx) {
			forgetHeldKeys(ctx);
			return {
				to: homePath(ctx),
				outcome: "cancel"
			};
		},
		gestureStart: (_e, ctx) => consumed(ctx),
		gestureChange: (_e, ctx) => consumed(ctx),
		gestureEnd: (_e, ctx) => consumed(ctx)
	}
};
function consumed(ctx) {
	ctx.effects.consume();
	return HANDLED;
}
function zoomKey(e, ctx) {
	const key = e.zoom;
	const camera = ctx.effects.camera();
	const scale = key.command === "actual" ? 1 : camera.scale * (key.command === "in" ? CANVAS_ZOOM_STEP : 1 / CANVAS_ZOOM_STEP);
	ctx.effects.consume();
	ctx.effects.setCamera(zoomCameraAt(camera, scale, key.pointer ?? key.center));
	ctx.effects.userCameraGesture();
	return HANDLED;
}
/**
* A tool shortcut arms its tool at rest; mid-gesture it does nothing, so a key
* never cuts a drag short. Escape returns an insert tool, the hand tool or the
* scale tool to Move. From Scale it is the tool's only effect: the editor does
* not also go up a level.
*/
function toolKey(e, ctx) {
	const tool = e.tool;
	if (ctx.mode.readOnly || !ctx.atRest) return HANDLED;
	if (tool === "escapeToMove") {
		escapeToMove(ctx);
		return HANDLED;
	}
	if (tool === "scale") ctx.effects.consume();
	ctx.effects.pickTool(tool);
	return HANDLED;
}
/** Escape returns an insert tool, the hand or Scale to Move. A gesture that takes Escape calls this too (a pan). */
function escapeToMove(ctx) {
	const { tool: armed, readOnly } = ctx.mode;
	if (readOnly || armed !== "draw" && armed !== "hand" && armed !== "scale") return;
	if (armed === "scale") {
		ctx.effects.consume();
		ctx.effects.takeKey();
	}
	ctx.effects.pickTool("escapeToMove");
}
/**
* Handles what every state shares: tool changes, momentary Space and Z, ⇧⌘S,
* the arrow nudge outside `select.nudging`, blur, middle pan, pinch, and the
* wheel, Safari pinch and zoom keys, which move the camera in every state.
*/
var canvasInputRoot = {
	id: "root",
	children: [
		select,
		draw,
		hand,
		comment$1,
		regionMask,
		zoomRegion,
		panning,
		pinching
	],
	on: {
		mode(e, ctx) {
			ctx.mode = e.mode;
			if (!e.mode.regionMask) ctx.regionMaskArmed = false;
			if (ctx.gesture?.kind === "regionMask" && !ctx.regionMaskArmed) return {
				to: homePath(ctx),
				outcome: "cancel"
			};
			return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
		},
		keyDown(e, ctx) {
			if (e.zoom) return zoomKey(e, ctx);
			if (isRegionMaskShortcut(e)) {
				if (!ctx.mode.regionMask) return HANDLED;
				ctx.effects.consume();
				if (e.repeat) return HANDLED;
				ctx.regionMaskArmed = true;
				return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
			}
			if (isEscape(e) && ctx.nudge) {
				cancelNudge(ctx);
				return {
					to: ".",
					outcome: "cancel",
					note: "the arrow nudge beside another state"
				};
			}
			if (editorArrow(e, ctx)) {
				if (ctx.nudge) {
					nudgeBy(e, ctx);
					return HANDLED;
				}
				if (e.repeat && ctx.effects.nudgeSpent()) {
					ctx.effects.consume();
					return HANDLED;
				}
				if (!ctx.effects.beginNudge()) return HANDLED;
				ctx.effects.setNudgeSpent(false);
				ctx.nudge = {
					dx: 0,
					dy: 0
				};
				nudgeBy(e, ctx);
				return ctx.atRest ? { to: "select.nudging" } : HANDLED;
			}
			if (e.tool) return toolKey(e, ctx);
			if (e.zoomRegion) {
				ctx.zoomHeldBy = e.code || e.key;
				return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
			}
			if (e.typing || e.code !== "Space") return HANDLED;
			ctx.effects.consume();
			ctx.spaceHeld = true;
			return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
		},
		keyUp(e, ctx) {
			if (ARROW_KEYS$1.has(e.key)) ctx.effects.setNudgeSpent(false);
			if (ctx.nudge && ARROW_KEYS$1.has(e.key)) {
				endNudge(ctx, true);
				return {
					to: ".",
					outcome: "commit",
					note: "the arrow nudge beside another state"
				};
			}
			if (releaseZoom(e, ctx)) return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
			if (e.code !== "Space") return HANDLED;
			ctx.spaceHeld = false;
			return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
		},
		blur(_e, ctx) {
			forgetHeldKeys(ctx);
			return ctx.atRest ? { to: homePath(ctx) } : HANDLED;
		},
		pointerDown(e, ctx) {
			if (ctx.atRest) return HANDLED;
			if (ownPointer(e, ctx)) return {
				to: homePath(ctx),
				outcome: "lost",
				resend: true
			};
			const peer = pinchStart(e, ctx);
			if (peer) {
				const ownedPan = ctx.track?.kind === "pan" && !ctx.track.touch;
				endTouchPan(ctx);
				ctx.lastTouchAt = e.time;
				ctx.track = {
					kind: "pinch",
					ids: [peer.pointerId, e.pointerId],
					points: /* @__PURE__ */ new Map([[peer.pointerId, peer.local], [e.pointerId, e.local]]),
					pinch: {
						startDistance: distance(peer.local, e.local),
						startScale: ctx.effects.camera().scale,
						lastCenter: midpoint(peer.local, e.local)
					}
				};
				return ownedPan ? { to: "pinching" } : {
					to: "pinching",
					outcome: "unknown",
					note: "a second finger started a pinch"
				};
			}
			if (ctx.press) {
				ctx.press.contested = true;
				ctx.press.plan = null;
			}
			return {
				to: ".",
				outcome: "unknown",
				note: "second pointer mid-gesture: multi-touch is not modelled"
			};
		},
		wheel(e, ctx) {
			const { effects } = ctx;
			effects.consume();
			const zoom = e.modifiers.ctrl || e.modifiers.meta;
			if (zoom && ctx.safariPinchBase !== null) return HANDLED;
			const camera = effects.camera();
			if (zoom) {
				if (!e.local) return HANDLED;
				effects.markWheelZoom();
				effects.setCamera(zoomCameraAt(camera, zoomScaleForWheel(camera.scale, e.deltaY), e.local));
			} else effects.setCamera(panCamera(camera, -e.deltaX, -e.deltaY));
			effects.userCameraGesture();
			return HANDLED;
		},
		gestureStart(_e, ctx) {
			ctx.safariPinchBase = ctx.effects.camera().scale;
			return consumed(ctx);
		},
		gestureChange(e, ctx) {
			ctx.effects.consume();
			if (!Number.isFinite(e.scale)) return HANDLED;
			const camera = ctx.effects.camera();
			ctx.effects.setCamera(zoomCameraAt(camera, (ctx.safariPinchBase ?? camera.scale) * e.scale, e.local));
			ctx.effects.userCameraGesture();
			return HANDLED;
		},
		gestureEnd(_e, ctx) {
			ctx.safariPinchBase = null;
			return consumed(ctx);
		},
		lostCapture: () => HANDLED,
		windowChange(e, ctx) {
			if (e.change === "hidden") ctx.effects.setNudgeSpent(false);
			if (e.change !== "hidden" || !ctx.nudge) return HANDLED;
			endNudge(ctx, true);
			return {
				to: ".",
				outcome: "commit",
				note: "the arrow nudge beside another state"
			};
		},
		hover(_e, ctx) {
			if (zoomRegionArmed(ctx)) return HANDLED;
			if (ctx.mode.tool === "comment" || ctx.mode.tool !== "hand" && !ctx.spaceHeld) ctx.effects.hover();
			return HANDLED;
		},
		contextMenu(_e, ctx) {
			ctx.effects.contextMenu();
			return HANDLED;
		},
		doubleClick: () => HANDLED,
		panStart(e, ctx) {
			if (ctx.press || e.target.surface === "other") return HANDLED;
			ctx.press = {
				pointerId: e.pointerId,
				pointerType: e.pointerType,
				start: e.screen,
				target: e.target,
				plan: null
			};
			return ctx.atRest ? { to: "panning" } : {
				to: "panning",
				note: "the arrow nudge carries on beside the pan"
			};
		}
	}
};

export { canvasInputRoot, homePath, isRegionMaskChord };
