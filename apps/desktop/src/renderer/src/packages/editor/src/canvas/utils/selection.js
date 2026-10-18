// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/selection.ts
import { getById, getChildren$2, getParentId, getRootIds, isTextOwner } from "../../../../compiler/src/store/read.js";

/**
* Same ids, order-independent. Subscribers compare Sets by identity, so the
* selection store uses this to keep the previous instance when a commit would
* hand them an equal one.
*/
function sameSelection(a, b) {
	if (a === b) return true;
	if (a.size !== b.size) return false;
	for (const id of a) if (!b.has(id)) return false;
	return true;
}
/** The single selected id, or null. */
function soleSelectedElementId(ids) {
	if (ids.size !== 1) return null;
	for (const id of ids) return id;
	return null;
}
/**
* Enter: every selected element that has children is replaced by them; a leaf
* stays selected. Bare text isn't selectable on its own, so it doesn't count
* as a child. Null when nothing has any, so the selection stays where it is.
*/
function descendSelection(store, ids) {
	const next = /* @__PURE__ */ new Set();
	let descended = false;
	for (const id of ids) {
		const children = getChildren$2(store, id).filter((childId) => getById(store, childId)?.type !== "text");
		if (children.length === 0) {
			next.add(id);
			continue;
		}
		descended = true;
		for (const childId of children) next.add(childId);
	}
	return descended ? next : null;
}
/**
* Shift+Enter: every selected element is replaced by its parent. A top-level
* element has nothing above it and stays. A parent that sits under another
* resulting parent drops out, so the selection never nests. Null when every
* element is top-level, so the selection stays where it is.
*/
function ascendSelection(store, ids) {
	const next = /* @__PURE__ */ new Set();
	let ascended = false;
	for (const id of ids) {
		const parentKey = getParentId(store, id);
		if (parentKey === null || parentKey === "ROOT") {
			next.add(id);
			continue;
		}
		ascended = true;
		next.add(parentKey);
	}
	if (!ascended) return null;
	for (const id of next) for (let up = getParentId(store, id); up && up !== "ROOT"; up = getParentId(store, up)) if (next.has(up)) {
		next.delete(id);
		break;
	}
	return next;
}
/**
* Figma-style: parents whose children take the pointer — every non-text root,
* all ancestors of the selection, and the drilled-in parent. Siblings, parents,
* aunts/uncles and grandparents are clickable; cousins and nieces are not.
*/
function interactiveParentIdsFor(store, selectedElementIds, drilledParentId) {
	const ids = /* @__PURE__ */ new Set();
	for (const rootId of getRootIds(store)) if (!isTextOwner(store, rootId)) ids.add(rootId);
	for (const selectedId of selectedElementIds) {
		let currentId = selectedId;
		while (currentId) {
			const parentKey = getParentId(store, currentId);
			if (!parentKey || parentKey === "ROOT") break;
			ids.add(parentKey);
			currentId = parentKey;
		}
	}
	if (drilledParentId) ids.add(drilledParentId);
	return ids;
}
/** How long after a click a further click still continues the same sequence.
*  Past the platform double-click interval on purpose: a burst is deliberate,
*  and a gap this long already reads as a fresh gesture. */
var SEQUENCE_MS = 500;
/** How far a click may land from the last one and still continue it. Generous,
*  because a hand clicking five times in a second does not hold still — and a
*  reset here costs the user a level with no feedback that anything happened. */
var SEQUENCE_SLOP = 16;
var NO_CLICKS = {
	count: 0,
	at: 0,
	x: 0,
	y: 0
};
/** The sequence after a click at (x, y) at `now` ms. */
function nextClick(prev, x, y, now) {
	return {
		count: prev.count > 0 && now - prev.at < SEQUENCE_MS && Math.hypot(x - prev.x, y - prev.y) <= SEQUENCE_SLOP ? prev.count + 1 : 1,
		at: now,
		x,
		y
	};
}
/**
* A click counter. Each call gives the click's position in its rapid sequence:
* 1 for the first, then 2, 3, 4… for as long as the clicks keep coming at the
* same spot.
*
* Counted here rather than read from `MouseEvent.detail`, which cannot express
* a long burst: Chromium stops its native counter at 3 and starts the next
* click over at 1, so every 4th click read as the beginning of a new sequence
* and the descent stalled a level short — once per three clicks, forever.
* The input machine counts its clicks with one.
*/
function createClickCounter() {
	let own = NO_CLICKS;
	return (x, y, now) => {
		own = nextClick(own, x, y, now);
		return own.count;
	};
}
/**
* Whether this click descends a level. The first click of a sequence selects;
* every click after it, while the sequence lasts, goes one level deeper — so a
* quick 5-click burst lands on the 5th element down, and clicking five times
* slowly just keeps re-selecting the same one.
*
* That makes both readings hold at once: a lone click never descends, and a
* deliberate double-click descends exactly one level (counts 1 then 2) no
* matter how many times it is repeated.
*
* Reading the count instead of listening for `dblclick` is also what lets a
* burst chain — the 3rd and 4th clicks descend on their own rather than waiting
* to be paired up.
*/
function isDescendClick(click) {
	return click.detail >= 2;
}
/**
* Click descent: the direct child of `parentId` on the clicked
* element's ancestor path, or null when there is none — the click sat on
* `parentId`'s own padding, or outside it entirely. `path` runs innermost first,
* so the deepest matching child wins and overlapping siblings resolve to the one
* actually clicked.
*/
function resolveDescendTarget(store, parentId, path) {
	for (const id of path) if (id !== parentId && getParentId(store, id) === parentId) return id;
	return null;
}

export { ascendSelection, createClickCounter, descendSelection, interactiveParentIdsFor, isDescendClick, resolveDescendTarget, sameSelection, soleSelectedElementId };
