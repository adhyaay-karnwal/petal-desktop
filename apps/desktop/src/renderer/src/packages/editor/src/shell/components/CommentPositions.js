// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentPositions.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { subscribeCamera } from "../hooks/useCommentAgent.js";
import { resolveObservedElements } from "../../shared/utils/visibleElement.js";
import { findCommentElement, paintCommentPin, resolveCommentPosition } from "../../shared/utils/commentAnchor.js";

var SUBTREE = {
	subtree: true,
	childList: true,
	attributes: true,
	characterData: true
};
var ATTRIBUTES$3 = { attributes: true };
var CHILDREN = {
	subtree: true,
	childList: true
};
function sameSet(a, b) {
	if (a.size !== b.size) return false;
	for (const item of a) if (!b.has(item)) return false;
	return true;
}
/** Observe canvas geometry here so moving an anchor doesn't rerender the editor shell. */
function CommentPositions(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { comments, viewportRef, children } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {};
		$[0] = t1;
	} else t1 = $[0];
	const [positions, setPositions] = (0, import_react.useState)(t1);
	let t2;
	let t3;
	if ($[1] !== comments || $[2] !== viewportRef) {
		t2 = () => {
			const viewport = viewportRef.current;
			const anchored = comments.filter(_temp$108);
			if (!viewport || !anchored.length) return;
			const canvas = viewport.closest("[data-canvas-root]") ?? viewport;
			let frame = null;
			let observed = /* @__PURE__ */ new Set();
			let watched = /* @__PURE__ */ new Map();
			let overlay = null;
			const objectDragging = () => {
				if (!overlay?.isConnected) overlay = canvas.querySelector("[data-comment-overlay]");
				return overlay?.dataset.objectDragging === "true";
			};
			const schedule = () => {
				if (frame === null) frame = requestAnimationFrame(measure);
			};
			const resize = new ResizeObserver(schedule);
			const mutations = new MutationObserver((records) => {
				if (!records.some(_temp2$69)) return;
				if (objectDragging()) {
					if (frame !== null) cancelAnimationFrame(frame);
					measure();
				} else schedule();
			});
			const measure = () => {
				frame = null;
				const nextObserved = /* @__PURE__ */ new Set();
				const nextWatched = /* @__PURE__ */ new Map([[canvas, CHILDREN]]);
				const next = {};
				const pins = new Map(Array.from(viewport.querySelectorAll("[data-comment-id]"), _temp3$50));
				const watchAncestors = (element) => {
					for (let parent = element.parentElement; parent && canvas.contains(parent) && parent !== canvas; parent = parent.parentElement) if (!nextWatched.has(parent)) nextWatched.set(parent, ATTRIBUTES$3);
				};
				for (const comment of anchored) {
					const element_0 = findCommentElement(viewport, comment.elementId);
					if (!element_0) continue;
					for (const host of resolveObservedElements(element_0)) nextObserved.add(host);
					for (let parent_0 = element_0.parentElement; parent_0 && canvas.contains(parent_0); parent_0 = parent_0.parentElement) nextObserved.add(parent_0);
					nextWatched.set(element_0, SUBTREE);
					watchAncestors(element_0);
					const resolved = resolveCommentPosition(comment, viewport);
					if (resolved !== comment && resolved.canvasX != null && resolved.canvasY != null) {
						next[comment.id] = {
							canvasX: resolved.canvasX,
							canvasY: resolved.canvasY
						};
						const pin_0 = pins.get(comment.id);
						if (pin_0) paintCommentPin(pin_0, resolved);
					}
				}
				if (objectDragging()) for (const preview of canvas.querySelectorAll("[data-drag-overlay]")) {
					nextWatched.set(preview, SUBTREE);
					watchAncestors(preview);
				}
				for (const el of observed) if (!nextObserved.has(el)) resize.unobserve(el);
				for (const el_0 of nextObserved) if (!observed.has(el_0)) resize.observe(el_0);
				observed = nextObserved;
				if (!sameSet(new Set(watched.keys()), new Set(nextWatched.keys()))) {
					mutations.disconnect();
					for (const [node, init] of nextWatched) mutations.observe(node, init);
					watched = nextWatched;
				}
				setPositions((previous) => Object.entries(next).every((t4) => {
					const [id, point] = t4;
					return previous[id] && Math.abs(previous[id].canvasX - point.canvasX) < .01 && Math.abs(previous[id].canvasY - point.canvasY) < .01;
				}) ? previous : {
					...previous,
					...next
				});
			};
			viewport.addEventListener("scroll", schedule, true);
			const unsubscribe = subscribeCamera(schedule);
			measure();
			return () => {
				mutations.disconnect();
				resize.disconnect();
				viewport.removeEventListener("scroll", schedule, true);
				unsubscribe();
				if (frame !== null) cancelAnimationFrame(frame);
			};
		};
		t3 = [comments, viewportRef];
		$[1] = comments;
		$[2] = viewportRef;
		$[3] = t2;
		$[4] = t3;
	} else {
		t2 = $[3];
		t3 = $[4];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	if ($[5] !== comments || $[6] !== positions) {
		let t5;
		if ($[8] !== positions) {
			t5 = (comment_0) => comment_0.elementId && positions[comment_0.id] ? {
				...comment_0,
				...positions[comment_0.id]
			} : comment_0;
			$[8] = positions;
			$[9] = t5;
		} else t5 = $[9];
		t4 = comments.map(t5);
		$[5] = comments;
		$[6] = positions;
		$[7] = t4;
	} else t4 = $[7];
	const positioned = t4;
	let t5;
	if ($[10] !== children || $[11] !== positioned) {
		t5 = children(positioned);
		$[10] = children;
		$[11] = positioned;
		$[12] = t5;
	} else t5 = $[12];
	return t5;
}
function _temp3$50(pin) {
	return [pin.dataset.commentId, pin];
}
function _temp2$69(record) {
	return !(record.target instanceof Element ? record.target : record.target.parentElement)?.closest("[data-comment-ui]");
}
function _temp$108(c) {
	return c.elementId && c.anchorX != null && c.anchorY != null;
}

export { CommentPositions };
