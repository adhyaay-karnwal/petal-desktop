// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/handles.ts

var ROTATE_SIZE = 14;
var ROTATE_OFFSET = 18;
var EDGE_HALF = 3;
var EDGE_INSET = 6;
var CORNER_HALF = 4;
function zonesOf(w, h) {
	const r = ROTATE_OFFSET;
	const near = -18;
	const farX = w + r - ROTATE_SIZE;
	const farY = h + r - ROTATE_SIZE;
	const e = EDGE_HALF;
	const i = EDGE_INSET;
	const c = CORNER_HALF;
	return [
		{
			kind: "rotate",
			name: "nw",
			zone: [
				near,
				near,
				-4,
				-4
			]
		},
		{
			kind: "rotate",
			name: "ne",
			zone: [
				farX,
				near,
				farX + ROTATE_SIZE,
				-4
			]
		},
		{
			kind: "rotate",
			name: "sw",
			zone: [
				near,
				farY,
				-4,
				farY + ROTATE_SIZE
			]
		},
		{
			kind: "rotate",
			name: "se",
			zone: [
				farX,
				farY,
				farX + ROTATE_SIZE,
				farY + ROTATE_SIZE
			]
		},
		{
			kind: "handle",
			name: "n",
			zone: [
				i,
				-3,
				w - i,
				e
			]
		},
		{
			kind: "handle",
			name: "s",
			zone: [
				i,
				h - e,
				w - i,
				h + e
			]
		},
		{
			kind: "handle",
			name: "w",
			zone: [
				-3,
				i,
				e,
				h - i
			]
		},
		{
			kind: "handle",
			name: "e",
			zone: [
				w - e,
				i,
				w + e,
				h - i
			]
		},
		{
			kind: "handle",
			name: "nw",
			zone: [
				-4,
				-4,
				c,
				c
			]
		},
		{
			kind: "handle",
			name: "ne",
			zone: [
				w - c,
				-4,
				w + c,
				c
			]
		},
		{
			kind: "handle",
			name: "sw",
			zone: [
				-4,
				h - c,
				c,
				h + c
			]
		},
		{
			kind: "handle",
			name: "se",
			zone: [
				w - c,
				h - c,
				w + c,
				h + c
			]
		}
	];
}
var IDENTITY = {
	a: 1,
	b: 0,
	c: 0,
	d: 1
};
function linearOf(transform) {
	const m = /^matrix\(([^)]+)\)$/.exec(transform);
	if (!m) return IDENTITY;
	const [a, b, c, d] = m[1].split(",").map(Number);
	return [
		a,
		b,
		c,
		d
	].every(Number.isFinite) ? {
		a,
		b,
		c,
		d
	} : IDENTITY;
}
/** The box as the overlay paints it: viewport px, axes normalised to unit length. */
function projectHandleBox(box, camera) {
	const m = linearOf(box.transform);
	const x = Math.hypot(m.a, m.b) || 1;
	const y = Math.hypot(m.c, m.d) || 1;
	return {
		centerX: box.centerX * camera.scale + camera.positionX,
		centerY: box.centerY * camera.scale + camera.positionY,
		width: box.width * camera.scale * x,
		height: box.height * camera.scale * y,
		linear: {
			a: m.a / x,
			b: m.b / x,
			c: m.c / y,
			d: m.d / y
		}
	};
}
/**
* Whether a point is in a zone the way Chromium hit-tests a box: strictly
* inside, with the low edge reaching one px further (`left - 1 < x < right`).
* Measured with `elementFromPoint` and real pointer events at DPR 1, 2 and 3,
* on whole- and fractional-px edges, where it matches the painted handles
* exactly. Under a rotation Chromium's transformed hit test differs from it
* within a fraction of a px at a zone's edge.
*/
var inZone = (x, y, [left, top, right, bottom]) => x > left - 1 && x < right && y > top - 1 && y < bottom;
/**
* The topmost handle or rotate zone under `point`, or null. Later boxes are
* drawn over earlier ones, and within a box the corners over the edges over
* the rotate zones, as in the overlay's DOM.
*/
function handleAt(boxes, camera, point) {
	for (let b = boxes.length - 1; b >= 0; b--) {
		const p = projectHandleBox(boxes[b], camera);
		const { a, b: mb, c, d } = p.linear;
		const det = a * d - mb * c;
		if (!det) continue;
		const dx = point.x - p.centerX;
		const dy = point.y - p.centerY;
		const x = (d * dx - c * dy) / det + p.width / 2;
		const y = (-mb * dx + a * dy) / det + p.height / 2;
		const zones = zonesOf(p.width, p.height);
		for (let z = zones.length - 1; z >= 0; z--) if (inZone(x, y, zones[z].zone)) return {
			kind: zones[z].kind,
			id: boxes[b].id,
			name: zones[z].name
		};
	}
	return null;
}
/**
* The hit's zone as an overlay node would be styled to cover it: an
* un-transformed rect in viewport px, plus the box transform and the origin
* to apply it about (the box centre, relative to the rect).
*/
function handleZone(box, camera, hit) {
	const p = projectHandleBox(box, camera);
	const zone = zonesOf(p.width, p.height).find((z) => z.kind === hit.kind && z.name === hit.name).zone;
	const boxLeft = p.centerX - p.width / 2;
	const boxTop = p.centerY - p.height / 2;
	const { a, b, c, d } = p.linear;
	return {
		left: boxLeft + zone[0],
		top: boxTop + zone[1],
		width: zone[2] - zone[0],
		height: zone[3] - zone[1],
		transform: a === 1 && b === 0 && c === 0 && d === 1 ? "none" : `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`,
		origin: {
			x: p.width / 2 - zone[0],
			y: p.height / 2 - zone[1]
		}
	};
}

export { handleAt, handleZone };
