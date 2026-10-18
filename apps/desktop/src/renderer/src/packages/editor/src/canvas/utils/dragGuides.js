// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/dragGuides.ts

/** Snap/measurement/spacing guide color — the registered editor `guide` token (Tailwind --color-guide). */
var GUIDE_COLOR = "var(--guide)";
/** Distance label pinned at its centre point, shared by spacing and measurement guides. */
var GUIDE_LABEL_STYLE = {
	position: "absolute",
	transform: "translate(-50%, -50%)",
	background: GUIDE_COLOR,
	color: "white",
	fontSize: 10,
	lineHeight: "14px",
	padding: "0 4px",
	borderRadius: 3,
	pointerEvents: "none",
	zIndex: 61,
	whiteSpace: "nowrap"
};
/** The 1px line of an alignment guide. */
function snapGuideBox(g, map) {
	const vertical = g.axis === "v";
	const a = map(vertical ? g.pos : g.spanStart, vertical ? g.spanStart : g.pos);
	const b = map(vertical ? g.pos : g.spanEnd, vertical ? g.spanEnd : g.pos);
	return vertical ? {
		left: a.x,
		top: Math.min(a.y, b.y),
		width: 1,
		height: Math.abs(b.y - a.y)
	} : {
		left: Math.min(a.x, b.x),
		top: a.y,
		width: Math.abs(b.x - a.x),
		height: 1
	};
}
/** The line of a gap measure, at least 1px long, and the centre its label sits on. */
function spacingSegment(g, map) {
	const horizontal = g.axis === "x";
	const a = map(horizontal ? g.start : g.pos, horizontal ? g.pos : g.start);
	const b = map(horizontal ? g.end : g.pos, horizontal ? g.pos : g.end);
	const lo = horizontal ? Math.min(a.x, b.x) : Math.min(a.y, b.y);
	const len = Math.max(Math.abs(horizontal ? b.x - a.x : b.y - a.y), 1);
	const pos = horizontal ? a.y : a.x;
	return horizontal ? {
		line: {
			left: lo,
			top: pos,
			width: len,
			height: 1
		},
		center: {
			x: lo + len / 2,
			y: pos
		}
	} : {
		line: {
			left: pos,
			top: lo,
			width: 1,
			height: len
		},
		center: {
			x: pos,
			y: lo + len / 2
		}
	};
}
/** The two distance-to-container lines of an absolute element, each with its label centre. */
function edgeMeasureLines(m) {
	const h = m.horizontal, v = m.vertical;
	const hx1 = Math.min(h.x1, h.x2), hx2 = Math.max(h.x1, h.x2);
	const vy1 = Math.min(v.y1, v.y2), vy2 = Math.max(v.y1, v.y2);
	return {
		x: {
			line: {
				left: hx1,
				top: h.y,
				width: Math.max(hx2 - hx1, 1),
				height: 1
			},
			center: {
				x: (h.x1 + h.x2) / 2,
				y: h.y
			},
			distance: h.distance
		},
		y: {
			line: {
				left: v.x,
				top: vy1,
				width: 1,
				height: Math.max(vy2 - vy1, 1)
			},
			center: {
				x: v.x,
				y: (v.y1 + v.y2) / 2
			},
			distance: v.distance
		}
	};
}
/** A drag-start-frame rect re-projected into the live camera. */
function liveGuideRect(rect, map, zoomRatio) {
	const tl = map(rect.left, rect.top);
	return {
		left: tl.x,
		top: tl.y,
		width: rect.width * zoomRatio,
		height: rect.height * zoomRatio
	};
}
/** The box a drop-target outline frames: the element's own box, through a `display: contents` wrapper. */
function potentialParentRect(id) {
	const node = document.querySelector(`[data-element-id="${id}"]`);
	if (!node) return null;
	return (window.getComputedStyle(node).display === "contents" && node.firstElementChild ? node.firstElementChild : node).getBoundingClientRect();
}

export { GUIDE_COLOR, GUIDE_LABEL_STYLE, edgeMeasureLines, liveGuideRect, potentialParentRect, snapGuideBox, spacingSegment };
