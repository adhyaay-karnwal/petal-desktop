// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/useCanvasMarquee.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getChildren$2, getRootIds } from "../../../../compiler/src/store/read.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { usePages } from "../../shared/state/pages.js";
import { useHover } from "../../shared/state/hover.js";

/**
* How rects measured at camera `from` sit on screen at camera `to`: x ↦ k·x + dx,
* with `origin` the viewport's screen position. The identity when the camera
* has not moved, exactly.
*/
function marqueeProjection(from, to, origin) {
	const k = to.scale / from.scale;
	return {
		k,
		dx: origin.left + to.positionX - k * (origin.left + from.positionX),
		dy: origin.top + to.positionY - k * (origin.top + from.positionY)
	};
}
function recursiveMarqueeHitTest(ids, store, rectOf, minX, minY, maxX, maxY, hits) {
	for (const id of ids) {
		const rect = rectOf(id);
		if (!rect) continue;
		if (rect.right < minX || rect.left > maxX || rect.bottom < minY || rect.top > maxY) continue;
		if (rect.left >= minX && rect.right <= maxX && rect.top >= minY && rect.bottom <= maxY) {
			hits.add(id);
			continue;
		}
		const children = getChildren$2(store, id);
		if (children.length > 0) recursiveMarqueeHitTest(children, store, rectOf, minX, minY, maxX, maxY, hits);
		else hits.add(id);
	}
}
/**
* Rects of the roots and their children, plus a lookup that measures any other
* element on demand. One pass collects the nodes without reading layout;
* measuring all of them cost a layout read per element, ~29k on a large file.
* A rect measured after the camera moved is mapped back to `measuredAt`, so every
* rect shares the frame the marquee projects from.
*/
function measureMarqueeRects(store, canvasEl, measuredAt, viewportRect) {
	const nodes = /* @__PURE__ */ new Map();
	canvasEl?.querySelectorAll("[data-element-id]").forEach((el) => {
		const id = el.getAttribute("data-element-id");
		if (!id) return;
		const list = nodes.get(id);
		if (list) list.push(el);
		else nodes.set(id, [el]);
	});
	const measured = /* @__PURE__ */ new Map();
	const rectOf = (id) => {
		const hit = measured.get(id);
		if (hit !== void 0) return hit;
		let result = null;
		for (const el of nodes.get(id) ?? []) {
			let rect = el.getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) {
				const child = el.firstElementChild;
				if (child) rect = child.getBoundingClientRect();
			}
			if (rect.width > 0 || rect.height > 0) result = rect;
		}
		if (result) {
			const view = marqueeProjection(measuredAt, getCamera(), viewportRect);
			if (view.k !== 1 || view.dx !== 0 || view.dy !== 0) result = new DOMRect((result.left - view.dx) / view.k, (result.top - view.dy) / view.k, result.width / view.k, result.height / view.k);
		}
		measured.set(id, result);
		return result;
	};
	const level1 = /* @__PURE__ */ new Map();
	const level2 = /* @__PURE__ */ new Map();
	for (const id of getRootIds(store)) {
		const r = rectOf(id);
		if (r) level1.set(id, r);
		const children = r ? getChildren$2(store, id) : [];
		if (children.length === 0) {
			if (r) level2.set(id, r);
		} else for (const childId of children) {
			const cr = rectOf(childId);
			if (cr) level2.set(childId, cr);
		}
	}
	return {
		level1,
		level2,
		rectOf
	};
}
function useCanvasMarquee(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { onSelectElements } = t0;
	let t1;
	if ($[0] !== onSelectElements) {
		t1 = (ids) => {
			onSelectElements?.(ids);
		};
		$[0] = onSelectElements;
		$[1] = t1;
	} else t1 = $[1];
	const selectElements = (0, import_react.useEffectEvent)(t1);
	const marqueeRef = (0, import_react.useRef)(null);
	const marqueeOverlayRef = (0, import_react.useRef)(null);
	const marqueeHoverContainerRef = (0, import_react.useRef)(null);
	const [marqueeMounted, setMarqueeMounted] = (0, import_react.useState)(false);
	const gestureRef = (0, import_react.useRef)(null);
	let t2;
	if ($[2] !== selectElements) {
		t2 = () => {
			const activate = (m) => {
				m.active = true;
				setMarqueeMounted(true);
				useHover.getState().clearHover();
			};
			const preview = (m_0, at) => {
				m_0.last = at;
				const view = marqueeProjection(m_0.measuredAt, getCamera(), m_0.viewportRect);
				const minX = Math.min(m_0.startClient.x, at.x);
				const minY = Math.min(m_0.startClient.y, at.y);
				const maxX = Math.max(m_0.startClient.x, at.x);
				const maxY = Math.max(m_0.startClient.y, at.y);
				const overlay = marqueeOverlayRef.current;
				if (overlay) {
					overlay.style.left = `${minX - m_0.viewportRect.left}px`;
					overlay.style.top = `${minY - m_0.viewportRect.top}px`;
					overlay.style.width = `${maxX - minX}px`;
					overlay.style.height = `${maxY - minY}px`;
				}
				const x0 = (minX - view.dx) / view.k;
				const y0 = (minY - view.dy) / view.k;
				const x1 = (maxX - view.dx) / view.k;
				const y1 = (maxY - view.dy) / view.k;
				const { rects } = m_0;
				const newHits = /* @__PURE__ */ new Set();
				if (at.cmd) recursiveMarqueeHitTest(getRootIds(m_0.store), m_0.store, rects.rectOf, x0, y0, x1, y1, newHits);
				else {
					let anyLevel1Contained = false;
					for (const rect of rects.level1.values()) if (rect.left >= x0 && rect.right <= x1 && rect.top >= y0 && rect.bottom <= y1) {
						anyLevel1Contained = true;
						break;
					}
					const testRects = anyLevel1Contained || rects.level2.size === 0 ? rects.level1 : rects.level2;
					for (const [id, rect_0] of testRects) if (!(rect_0.right < x0 || rect_0.left > x1 || rect_0.bottom < y0 || rect_0.top > y1)) newHits.add(id);
				}
				const finalHits = at.shift ? /* @__PURE__ */ new Set([...m_0.baseSelection, ...newHits]) : newHits;
				const container = marqueeHoverContainerRef.current;
				if (container) {
					for (const [id_0, div] of m_0.hoverOutlines) if (!finalHits.has(id_0)) {
						div.remove();
						m_0.hoverOutlines.delete(id_0);
					}
					for (const id_1 of finalHits) {
						if (m_0.hoverOutlines.has(id_1)) continue;
						const rect_1 = rects.rectOf(id_1);
						if (!rect_1) continue;
						const div_0 = document.createElement("div");
						div_0.style.cssText = `position:absolute;left:${view.k * rect_1.left + view.dx - m_0.viewportRect.left}px;top:${view.k * rect_1.top + view.dy - m_0.viewportRect.top}px;width:${view.k * rect_1.width}px;height:${view.k * rect_1.height}px;outline:1px solid var(${m_0.store.byId.get(id_1)?.type === "webview" ? "--ed-canvas-webview" : "--ed-canvas-selection"});pointer-events:none;`;
						container.appendChild(div_0);
						m_0.hoverOutlines.set(id_1, div_0);
					}
				}
				m_0.lastHits = finalHits;
			};
			const reproject = (m_1) => {
				m_1.frame = 0;
				const view_0 = marqueeProjection(m_1.measuredAt, getCamera(), m_1.viewportRect);
				for (const [id_2, div_1] of m_1.hoverOutlines) {
					const rect_2 = m_1.rects.rectOf(id_2);
					if (!rect_2) continue;
					div_1.style.left = `${view_0.k * rect_2.left + view_0.dx - m_1.viewportRect.left}px`;
					div_1.style.top = `${view_0.k * rect_2.top + view_0.dy - m_1.viewportRect.top}px`;
					div_1.style.width = `${view_0.k * rect_2.width}px`;
					div_1.style.height = `${view_0.k * rect_2.height}px`;
				}
				preview(m_1, m_1.last);
			};
			const finish = (m_2) => {
				if (m_2.frame) cancelAnimationFrame(m_2.frame);
				m_2.frame = 0;
				for (const div_2 of m_2.hoverOutlines.values()) div_2.remove();
				m_2.hoverOutlines.clear();
				marqueeRef.current = null;
				setMarqueeMounted(false);
			};
			gestureRef.current = {
				begin(start, params, at_0) {
					const m_3 = measure$1(start, params);
					marqueeRef.current = m_3;
					activate(m_3);
					preview(m_3, at_0);
				},
				move(at_1) {
					const m_4 = marqueeRef.current;
					if (m_4) preview(m_4, at_1);
				},
				camera() {
					const m_5 = marqueeRef.current;
					if (m_5 && !m_5.frame) m_5.frame = requestAnimationFrame(() => reproject(m_5));
				},
				end(commit) {
					const m_6 = marqueeRef.current;
					if (!m_6) return;
					if (m_6.frame) reproject(m_6);
					finish(m_6);
					if (commit && m_6.active) selectElements([...m_6.lastHits]);
				}
			};
			return () => {
				gestureRef.current = null;
				const m_7 = marqueeRef.current;
				if (m_7?.frame) cancelAnimationFrame(m_7.frame);
			};
		};
		$[2] = selectElements;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = [];
		$[4] = t3;
	} else t3 = $[4];
	(0, import_react.useEffect)(t2, t3);
	let t4;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = {
			begin: (start_0, params_0, at_2) => gestureRef.current?.begin(start_0, params_0, at_2),
			move: (at_3) => gestureRef.current?.move(at_3),
			camera: () => gestureRef.current?.camera(),
			end: (commit_0) => gestureRef.current?.end(commit_0)
		};
		$[5] = t4;
	} else t4 = $[5];
	const marqueeGesture = t4;
	let t5;
	if ($[6] !== marqueeMounted) {
		t5 = {
			marqueeRef,
			marqueeOverlayRef,
			marqueeHoverContainerRef,
			marqueeMounted,
			marqueeGesture
		};
		$[6] = marqueeMounted;
		$[7] = t5;
	} else t5 = $[7];
	return t5;
}
/** Starts a marquee from a press at `start` (client px). Measures only the roots and their
*  children now; anything else when the marquee first reaches it (measureMarqueeRects). */
function measure$1(start, { canvasEl, viewportRect, selectedElementIds }) {
	const store = usePages.getState().visibleTree;
	const measuredAt = getCamera();
	return {
		startClient: start,
		baseSelection: new Set(selectedElementIds),
		store,
		rects: measureMarqueeRects(store, canvasEl, measuredAt, viewportRect),
		viewportRect,
		active: false,
		lastHits: /* @__PURE__ */ new Set(),
		hoverOutlines: /* @__PURE__ */ new Map(),
		measuredAt,
		last: {
			x: start.x,
			y: start.y,
			shift: false,
			cmd: false
		},
		frame: 0
	};
}

export { useCanvasMarquee };
