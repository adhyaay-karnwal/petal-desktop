// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/machine.ts
import { NO_EFFECTS } from "./effects.js";

/** Root-to-leaf node chains, keyed by dotted path. Parents resolve to their first leaf. */
function indexPaths(root) {
	const paths = /* @__PURE__ */ new Map();
	const visit = (node, chain, path) => {
		const own = [...chain, node];
		const leaf = node.children?.length ? node.children.map((child) => visit(child, own, path ? `${path}.${child.id}` : child.id))[0] : own;
		if (path) paths.set(path, leaf);
		return leaf;
	};
	visit(root, [], "");
	return paths;
}
var chainPath = (chain) => chain.slice(1).map((node) => node.id).join(".");
function keyChord(m, key) {
	return `${m.meta ? "Meta+" : ""}${m.ctrl ? "Ctrl+" : ""}${m.alt ? "Alt+" : ""}${m.shift ? "Shift+" : ""}${key}`;
}
/** Short, human-readable input summary. Built only when a transition is logged. */
function describeInput(event) {
	switch (event.type) {
		case "pointerDown": return `pointerDown b${event.button}${event.pointerType === "mouse" ? "" : ` ${event.pointerType}`} ${event.target.kind}${event.target.handle ? ` ${event.target.handle}` : ""}${event.target.id ? `:${event.target.id}` : ""} @${Math.round(event.screen.x)},${Math.round(event.screen.y)}`;
		case "pointerMove":
		case "pointerUp":
		case "pointerCancel": return `${event.type} @${Math.round(event.screen.x)},${Math.round(event.screen.y)}`;
		case "keyDown":
		case "keyUp": return `${event.type} ${keyChord(event.modifiers, event.key === " " ? "Space" : event.key)}${event.repeat ? " (repeat)" : ""}`;
		case "wheel": return `wheel ${keyChord(event.modifiers, `${Math.round(event.deltaX)},${Math.round(event.deltaY)}`)}`;
		case "gestureStart":
		case "gestureEnd": return event.type;
		case "gestureChange": return `gestureChange ×${event.scale.toFixed(2)}`;
		case "lostCapture": return `lostCapture ${event.pointerId}`;
		case "mode": return `mode ${event.mode.tool}${event.mode.readOnly ? " readOnly" : ""}${event.mode.editingText ? " editingText" : ""}`;
		case "panStart": return `panStart @${Math.round(event.screen.x)},${Math.round(event.screen.y)}`;
		case "blur": return "blur";
		case "hover": return "hover";
		case "contextMenu": return "contextMenu";
		case "doubleClick": return "doubleClick";
		case "windowChange": return `window ${event.change}`;
	}
}
/**
* Runs a state tree. It holds the active path, its context and a bounded
* transition log; state nodes reach anything else only through `effects`.
*/
function createCanvasInputMachine({ root, mode, home, effects = NO_EFFECTS, logSize = 200 }) {
	const paths = indexPaths(root);
	const ctx = {
		mode,
		press: null,
		spaceHeld: false,
		regionMaskArmed: false,
		zoomHeldBy: null,
		atRest: true,
		track: null,
		safariPinchBase: null,
		lastTouchAt: null,
		handle: null,
		gesture: null,
		nudge: null,
		effects
	};
	const resolve = (path) => {
		const chain = paths.get(path);
		if (!chain) throw new Error(`Unknown canvas input state: ${path}`);
		return chain;
	};
	let chain = resolve(home(ctx));
	for (const node of chain) node.enter?.(ctx);
	const entries = [];
	const counts = {};
	let seq = 0;
	const transition = (result, event) => {
		const next = result.to === "." ? chain : resolve(result.to);
		const from = chainPath(chain);
		const to = chainPath(next);
		if (from === to && !result.outcome) return;
		const contested = !!result.outcome && !!ctx.press?.contested && !!next[next.length - 1].rest;
		const outcome = contested ? "unknown" : result.outcome;
		const note = contested ? `ended after a second pointer (would be ${result.outcome})` : result.note;
		let shared = 0;
		while (shared < chain.length && shared < next.length && chain[shared] === next[shared]) shared++;
		for (let i = chain.length - 1; i >= shared; i--) chain[i].exit?.(ctx);
		chain = next;
		for (const node of next.slice(shared)) node.enter?.(ctx);
		entries.push({
			seq: ++seq,
			time: event.time,
			observed: describeInput(event),
			from,
			to,
			outcome,
			...note ? { note } : {}
		});
		if (entries.length > logSize) entries.shift();
	};
	const dispatch = (event, allowResend) => {
		ctx.atRest = !!chain[chain.length - 1].rest;
		for (let i = chain.length - 1; i >= 0; i--) {
			const handler = chain[i].on?.[event.type];
			const result = handler?.(event, ctx);
			if (result === void 0) continue;
			if (result === "handled") return;
			transition(result, event);
			if (result.resend && allowResend) dispatch(event, false);
			return;
		}
	};
	return {
		send(event) {
			counts[event.type] = (counts[event.type] ?? 0) + 1;
			dispatch(event, true);
		},
		path: () => chainPath(chain),
		context: () => ctx,
		log: () => entries,
		counts: () => counts,
		clearLog() {
			entries.length = 0;
			for (const type in counts) delete counts[type];
		}
	};
}

export { createCanvasInputMachine };
