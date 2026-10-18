// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/nudge.ts
import { getById, getParentId } from "../../../../compiler/src/store/read.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { resolveVisibleElement$1 } from "../../shared/utils/visibleElement.js";
import { applyOperationsToStore, createSetPositionOperation, createSetStylesOperation } from "../../shared/utils/operations.js";
import { usePages } from "../../shared/state/pages.js";
import { overlayBaseAttr } from "../components/CanvasOverlays.js";

/**
* An arrow-key nudge of the selection, as the canvas input machine runs it.
* While the arrows are held it writes the DOM only: each moved node, its
* selection box and its name label. It touches no store and no React state.
* It ends once, either with one undo step or with everything put back.
*/
/** Roots and absolute or fixed children move with the arrows; an in-flow child reorders in its flex parent instead. */
function isNudgeable(store, id) {
	const parentId = getParentId(store, id);
	if (parentId === "ROOT" || parentId === null) return true;
	const element = getById(store, id);
	const position = element && "styles" in element ? element.styles?.position : void 0;
	return position === "absolute" || position === "fixed";
}
/** One pinned edge after a move: left/top grow with the delta; right/bottom measure from the far edge, so they shrink. */
var nudgedCoord = (start, prop, delta) => start + (prop === "left" || prop === "top" ? delta : -delta);
var num = (value) => {
	const n = typeof value === "number" ? value : parseFloat(String(value));
	return Number.isFinite(n) ? n : null;
};
var byAttribute = (name, id) => document.querySelector(`[${name}="${CSS.escape(id)}"]`);
function shownOf(node) {
	const base = node?.getAttribute("data-ov-base");
	if (!node || !base) return [];
	const rect = base.split(",").map(Number);
	return rect.length === 7 && rect[4] ? [{
		node,
		base,
		rect
	}] : [];
}
/** Writes a box or label `(dx, dy)` canvas px from its base, re-projected to the live camera as Canvas does. */
function place({ node, base, rect }, dx, dy) {
	const [left, top, width, height, scale, positionX, positionY] = rect;
	const live = getCamera();
	const k = live.scale / scale;
	const moved = {
		left: left + dx * scale,
		top: top + dy * scale,
		width,
		height
	};
	node.setAttribute("data-ov-base", dx === 0 && dy === 0 ? base : overlayBaseAttr(moved, {
		scale,
		positionX,
		positionY
	}));
	node.style.left = `${k * moved.left + live.positionX - k * positionX}px`;
	node.style.top = `${k * moved.top + live.positionY - k * positionY}px`;
}
/** Starts a nudge of the nudgeable ids among `ids` on the active page. Null when none is. */
function beginNudge(ids) {
	const store = usePages.getState().tree;
	const nudged = [...ids].filter((id) => isNudgeable(store, id));
	if (nudged.length === 0) return null;
	const targets = [];
	for (const id of nudged) {
		const element = getById(store, id);
		const shown = [...shownOf(byAttribute("data-selection-overlay-id", id)), ...shownOf(byAttribute("data-selection-label-id", id))];
		const parentId = getParentId(store, id);
		if (parentId === "ROOT" || parentId === null) {
			const node = byAttribute("data-canvas-root-id", id);
			if (!node) continue;
			const start = element && "canvasPosition" in element && element.canvasPosition ? { ...element.canvasPosition } : {
				x: 0,
				y: 0
			};
			targets.push({
				id,
				node,
				isRoot: true,
				start,
				xProp: "left",
				yProp: "top",
				inline: {
					x: node.style.left,
					y: node.style.top
				},
				shown
			});
			continue;
		}
		const raw = byAttribute("data-element-id", id);
		if (!raw) continue;
		const node = resolveVisibleElement$1(raw);
		const styles = element && "styles" in element && element.styles || {};
		const xProp = num(styles.left) === null && num(styles.right) !== null ? "right" : "left";
		const yProp = num(styles.top) === null && num(styles.bottom) !== null ? "bottom" : "top";
		const start = {
			x: num(styles[xProp]) ?? (xProp === "left" ? node.offsetLeft : 0),
			y: num(styles[yProp]) ?? (yProp === "top" ? node.offsetTop : 0)
		};
		targets.push({
			id,
			node,
			isRoot: false,
			start,
			xProp,
			yProp,
			inline: {
				x: node.style[xProp],
				y: node.style[yProp]
			},
			shown
		});
	}
	let dx = 0;
	let dy = 0;
	let open = true;
	const putBack = () => {
		for (const t of targets) {
			t.node.style[t.xProp] = t.inline.x;
			t.node.style[t.yProp] = t.inline.y;
			for (const s of t.shown) place(s, 0, 0);
		}
	};
	return {
		ids: new Set(nudged),
		move(nextDx, nextDy) {
			if (!open) return;
			dx = nextDx;
			dy = nextDy;
			for (const t of targets) {
				t.node.style[t.xProp] = `${nudgedCoord(t.start.x, t.xProp, dx)}px`;
				t.node.style[t.yProp] = `${nudgedCoord(t.start.y, t.yProp, dy)}px`;
				for (const s of t.shown) place(s, dx, dy);
			}
		},
		end(commit) {
			if (!open) return;
			open = false;
			if (dx === 0 && dy === 0) return;
			if (!commit) return putBack();
			const before = usePages.getState().tree;
			const ops = [];
			let cursor = before;
			for (const t of targets) {
				const element = getById(cursor, t.id);
				if (!element) continue;
				let op;
				if (t.isRoot) op = createSetPositionOperation(cursor, t.id, {
					x: t.start.x + dx,
					y: t.start.y + dy
				});
				else {
					const styles = { ..."styles" in element ? element.styles : void 0 };
					styles[t.xProp] = nudgedCoord(t.start.x, t.xProp, dx);
					styles[t.yProp] = nudgedCoord(t.start.y, t.yProp, dy);
					op = createSetStylesOperation(cursor, t.id, styles);
				}
				if (!op) continue;
				ops.push(op);
				cursor = applyOperationsToStore(cursor, [op]);
			}
			if (ops.length === 0) return putBack();
			usePages.getState().applyOps(ops);
			if (usePages.getState().tree === before) putBack();
		}
	};
}
var spent = false;
/**
* The held arrow's auto-repeats after such an ending do nothing, neither a
* nudge nor a flex reorder, until an arrow is pressed afresh. The machine and
* PetalEditor's arrow reorder both read this.
*/
var nudgeSpent = () => spent;
function setNudgeSpent(next) {
	spent = next;
}

export { beginNudge, isNudgeable, nudgeSpent, setNudgeSpent };
