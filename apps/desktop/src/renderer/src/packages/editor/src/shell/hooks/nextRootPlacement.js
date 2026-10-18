// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/nextRootPlacement.ts

var DEFAULT_ROOT_ORIGIN = {
	x: 100,
	y: 100
};
var UNKNOWN_ROOT_WIDTH = 1200;
/** How far along one row the slot search walks before giving up on that row. */
var MAX_ROW_STEPS = 32;
/** Park a new root to the right of existing frames. Empty canvas uses the origin. */
function nextRootPlacement(boxes) {
	if (boxes.length === 0) return { ...DEFAULT_ROOT_ORIGIN };
	let maxRight = -Infinity;
	let alignY = DEFAULT_ROOT_ORIGIN.y;
	let sawY = false;
	for (const box of boxes) {
		if (!(box.width >= 0) || !(box.height >= 0)) continue;
		maxRight = Math.max(maxRight, box.x + box.width);
		if (!sawY) {
			alignY = box.y;
			sawY = true;
		} else alignY = Math.min(alignY, box.y);
	}
	if (!Number.isFinite(maxRight)) return { ...DEFAULT_ROOT_ORIGIN };
	return {
		x: Math.round(maxRight + 40),
		y: Math.round(alignY)
	};
}
function intersects(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
/**
* First x along a row where a box of `size` fits without touching an occupied
* box. Each collision jumps past the collider plus the gap, so a slot found this
* way is always at least one gap clear of whatever it walked past.
*/
function firstFreeSlotInRow(startX, y, size, boxes) {
	let x = startX;
	for (let step = 0; step < MAX_ROW_STEPS; step++) {
		const candidate = {
			x,
			y,
			width: size.width,
			height: size.height
		};
		const collider = boxes.find((box) => intersects(candidate, box));
		if (!collider) return {
			x,
			y
		};
		x = collider.x + collider.width + 40;
	}
	return null;
}
/**
* Nearest free slot beside `anchor` for a root of `size`: directly to its right,
* then directly below it, then further along its row. Variations of a frame end
* up next to that frame instead of at the far edge of the canvas. Falls back to
* the rightmost-frame rule when every slot near the anchor is taken.
*/
function placeBesideAnchor(anchor, size, boxes) {
	const right = {
		x: anchor.x + anchor.width + 40,
		y: anchor.y,
		...size
	};
	if (!boxes.some((box) => intersects(right, box))) return round(right);
	const below = {
		x: anchor.x,
		y: anchor.y + anchor.height + 40,
		...size
	};
	if (!boxes.some((box) => intersects(below, box))) return round(below);
	const alongRow = firstFreeSlotInRow(right.x, anchor.y, size, boxes);
	if (alongRow) return round(alongRow);
	return nextRootPlacement(boxes);
}
function round(point) {
	return {
		x: Math.round(point.x),
		y: Math.round(point.y)
	};
}
function estimateUnmeasuredRootBox(input) {
	return {
		x: typeof input.x === "number" ? input.x : DEFAULT_ROOT_ORIGIN.x,
		y: typeof input.y === "number" ? input.y : DEFAULT_ROOT_ORIGIN.y,
		width: typeof input.width === "number" && input.width > 0 ? input.width : UNKNOWN_ROOT_WIDTH,
		height: typeof input.height === "number" && input.height > 0 ? input.height : 800
	};
}

export { UNKNOWN_ROOT_WIDTH, estimateUnmeasuredRootBox, nextRootPlacement, placeBesideAnchor };
