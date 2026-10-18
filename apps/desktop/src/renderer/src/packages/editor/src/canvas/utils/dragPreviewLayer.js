// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/dragPreviewLayer.ts
import { computeEdgeDistances, getAbsoluteContainingBox } from "./domGeometry.js";
import { GUIDE_COLOR, GUIDE_LABEL_STYLE, edgeMeasureLines, liveGuideRect, snapGuideBox, spacingSegment } from "./dragGuides.js";
import { mapScreenPoint, previewZoomDrift } from "./dragFrame.js";

function emptyDragPreviewScene() {
	return {
		activeId: null,
		startRect: null,
		startFrame: null,
		pointerStart: null,
		pointer: null,
		snap: {
			x: 0,
			y: 0
		},
		guides: [],
		spacingMeasures: [],
		spacingGuides: [],
		measureRect: null,
		parentId: null,
		slot: null
	};
}
var UNITLESS = /* @__PURE__ */ new Set(["zIndex", "opacity"]);
function setStyles(node, styles) {
	const style = node.style;
	for (const key in styles) {
		const value = styles[key];
		const next = typeof value === "number" && !UNITLESS.has(key) ? `${value}px` : String(value);
		if (style[key] !== next) style[key] = next;
	}
}
function placeBox(node, box, origin) {
	setStyles(node, {
		left: box.left - origin.left,
		top: box.top - origin.top,
		width: box.width,
		height: box.height
	});
}
function setText(node, text) {
	if (node.textContent !== text) node.textContent = text;
}
/** Child elements of one host, created on demand and reused across frames: a frame reorders no nodes. */
var NodePool = class {
	constructor(host, create) {
		this.host = host;
		this.create = create;
		this.nodes = [];
		this.used = 0;
	}
	begin() {
		this.used = 0;
	}
	next() {
		let node = this.nodes[this.used];
		if (!node) {
			node = this.create();
			this.nodes.push(node);
			this.host.appendChild(node);
		}
		this.used++;
		return node;
	}
	/** Removes the nodes this frame did not use, as React unmounts the extra keyed children. */
	end() {
		for (const node of this.nodes.splice(this.used)) node.remove();
	}
};
function div(attrs, styles, className) {
	const node = document.createElement("div");
	for (const name in attrs) node.setAttribute(name, attrs[name]);
	if (className) node.className = className;
	setStyles(node, styles);
	return node;
}
/** The drop-target outline, empty-container slot and insertion line: at most one of each, in this order. */
function parentLayer(host) {
	const make = {
		outline: () => div({}, {}, "absolute pointer-events-none outline outline-2 outline-ed-canvas-selection"),
		slot: () => div({}, {
			background: "color-mix(in srgb, var(--ed-canvas-selection) 25%, transparent)",
			outline: "2px solid var(--ed-canvas-selection)",
			outlineOffset: "-1px",
			borderRadius: 2
		}, "absolute pointer-events-none"),
		line: () => div({ "data-drop-insert-line": "" }, {}, "absolute pointer-events-none rounded-full bg-ed-canvas-selection")
	};
	const order = [
		"outline",
		"slot",
		"line"
	];
	const nodes = /* @__PURE__ */ new Map();
	return {
		host,
		/** The part's node while `on`, created in place; removed otherwise. */
		show(part, on) {
			let node = nodes.get(part) ?? null;
			if (!on) {
				node?.remove();
				nodes.delete(part);
				return null;
			}
			if (!node) {
				node = make[part]();
				nodes.set(part, node);
				const after = order.slice(order.indexOf(part) + 1).map((p) => nodes.get(p)).find(Boolean) ?? null;
				host.insertBefore(node, after);
			}
			return node;
		},
		removeAll() {
			for (const node of nodes.values()) node.remove();
			nodes.clear();
		}
	};
}
var LINE_STYLE = {
	position: "absolute",
	backgroundColor: GUIDE_COLOR,
	pointerEvents: "none"
};
/**
* Draws an element drag's preview straight into the DOM, at most once per animation frame, so a
* pointer move commits nothing to React. Reads its scene and the live camera when the frame runs.
* Matches what Canvas renders for the same scene on the legacy path: the same nodes, attributes,
* classes and geometry.
*/
function createDragPreviewLayer({ hosts, scene, camera, rect }) {
	let frameId = null;
	let beforeFrame = null;
	let inFrame = false;
	let pools = null;
	let parent = null;
	const guidePools = (host) => {
		if (pools?.host !== host) pools = {
			host,
			guides: new NodePool(host, () => div({}, {
				...LINE_STYLE,
				zIndex: 60
			})),
			spacing: new NodePool(host, () => {
				const wrap = document.createElement("div");
				wrap.style.display = "contents";
				wrap.append(div({}, {
					...LINE_STYLE,
					zIndex: 60
				}, "petal-guide-measure"), div({}, GUIDE_LABEL_STYLE));
				return wrap;
			}),
			measure: new NodePool(host, () => {
				const wrap = document.createElement("div");
				wrap.style.display = "contents";
				wrap.append(div({ "data-axis": "x" }, {
					...LINE_STYLE,
					zIndex: 59
				}, "petal-guide-measure"), div({}, GUIDE_LABEL_STYLE), div({ "data-axis": "y" }, {
					...LINE_STYLE,
					zIndex: 59
				}, "petal-guide-measure"), div({}, GUIDE_LABEL_STYLE));
				return wrap;
			})
		};
		return pools;
	};
	const parentParts = (host) => {
		if (parent?.host !== host) parent = parentLayer(host);
		return parent;
	};
	const draw = () => {
		const s = scene();
		const cam = camera();
		const { guides: guidesHost, parent: parentHost, copy } = hosts();
		const start = s.startFrame;
		const live = start && {
			...start,
			scale: cam.scale,
			panX: cam.positionX,
			panY: cam.positionY
		};
		const map = (x, y) => start && live ? mapScreenPoint({
			x,
			y
		}, start, live) : {
			x,
			y
		};
		const startScale = start?.scale ?? cam.scale;
		const zoomRatio = live ? cam.scale / startScale : 1;
		const overlay = (guidesHost ?? parentHost)?.closest("[data-overlay-container]")?.getBoundingClientRect() ?? null;
		const parentRect = s.parentId ? rect(s.parentId) : null;
		const measureBox = s.measureRect && s.activeId ? getAbsoluteContainingBox(s.activeId, cam.scale) : null;
		if (copy) {
			if (s.startRect && s.pointerStart && s.pointer) {
				const drift = previewZoomDrift(s.startRect, s.pointerStart, startScale, cam.scale);
				setStyles(copy, {
					transform: `translate3d(${s.startRect.left + s.pointer.x - s.pointerStart.x + s.snap.x + drift.x}px, ${s.startRect.top + s.pointer.y - s.pointerStart.y + s.snap.y + drift.y}px, 0)`,
					visibility: "visible"
				});
				copy.style.setProperty("--lg-drag-zoom", String(cam.scale));
				const preview = copy.firstElementChild;
				if (preview) setStyles(preview, { transform: `scale(${cam.scale})` });
			} else setStyles(copy, { visibility: "hidden" });
		}
		if (guidesHost) {
			const p = guidePools(guidesHost);
			p.guides.begin();
			p.spacing.begin();
			p.measure.begin();
			if (overlay) {
				for (const g of s.guides) {
					const node = p.guides.next();
					node.setAttribute("data-snap-guide", g.axis);
					placeBox(node, snapGuideBox(g, map), overlay);
				}
				if (s.measureRect && measureBox) {
					const lines = edgeMeasureLines(computeEdgeDistances(liveGuideRect(s.measureRect, map, zoomRatio), measureBox));
					const [xLine, xLabel, yLine, yLabel] = Array.from(p.measure.next().children);
					placeBox(xLine, lines.x.line, overlay);
					setStyles(xLabel, {
						left: lines.x.center.x - overlay.left,
						top: lines.x.center.y - overlay.top
					});
					setText(xLabel, `${Math.round(Math.abs(lines.x.distance) / cam.scale)}`);
					placeBox(yLine, lines.y.line, overlay);
					setStyles(yLabel, {
						left: lines.y.center.x - overlay.left,
						top: lines.y.center.y - overlay.top
					});
					setText(yLabel, `${Math.round(Math.abs(lines.y.distance) / cam.scale)}`);
				}
				const equalGaps = s.spacingGuides.length > 0;
				for (const g of equalGaps ? s.spacingGuides : s.spacingMeasures) {
					const { line, center } = spacingSegment(g, map);
					const [lineNode, label] = Array.from(p.spacing.next().children);
					lineNode.setAttribute("data-spacing-guide", equalGaps ? "g" : "m");
					lineNode.setAttribute("data-axis", g.axis);
					placeBox(lineNode, line, overlay);
					setStyles(label, {
						left: center.x - overlay.left,
						top: center.y - overlay.top
					});
					setText(label, `${Math.round(g.gap / startScale)}`);
				}
			}
			p.guides.end();
			p.spacing.end();
			p.measure.end();
		}
		if (parentHost) {
			const parts = parentParts(parentHost);
			const outlined = overlay && s.parentId && parentRect ? s.parentId : null;
			const slot = overlay && s.slot?.kind === "slot" ? s.slot.rect : null;
			const line = overlay && s.slot?.kind === "line" ? s.slot.rect : null;
			const outline = parts.show("outline", !!outlined);
			if (outline && outlined && parentRect && overlay) {
				outline.setAttribute("data-potential-parent-outline", outlined);
				placeBox(outline, parentRect, overlay);
			}
			const slotNode = parts.show("slot", !!slot);
			if (slotNode && slot && overlay) placeBox(slotNode, slot, overlay);
			const lineNode = parts.show("line", !!line);
			if (lineNode && line && overlay) placeBox(lineNode, line, overlay);
		}
	};
	const runFrame = () => {
		frameId = null;
		inFrame = true;
		try {
			beforeFrame?.();
		} finally {
			inFrame = false;
		}
		draw();
	};
	return {
		/** Runs at the start of each frame, before anything is read; may update the scene. */
		onFrame(fn) {
			beforeFrame = fn;
		},
		/** Draw on the next animation frame. Calls before it runs share it. */
		schedule() {
			if (frameId !== null || inFrame) return;
			frameId = requestAnimationFrame(runFrame);
		},
		/** Draw now, before the browser paints: the copy has just mounted at no position. */
		drawNow() {
			if (frameId !== null) cancelAnimationFrame(frameId);
			frameId = null;
			draw();
		},
		/** Remove everything drawn and drop any pending frame. */
		clear() {
			if (frameId !== null) cancelAnimationFrame(frameId);
			frameId = null;
			for (const pool of pools ? [
				pools.guides,
				pools.spacing,
				pools.measure
			] : []) {
				pool.begin();
				pool.end();
			}
			parent?.removeAll();
		}
	};
}

export { createDragPreviewLayer, emptyDragPreviewScene };
