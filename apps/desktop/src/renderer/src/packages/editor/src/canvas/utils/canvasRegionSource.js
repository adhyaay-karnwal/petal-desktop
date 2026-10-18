// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/canvasRegionSource.ts
import { ve$2, x$3 } from "../../../../../vendor/bippy.js";
import { detectIconName, getComponentName, getFiber } from "../lib/capture/fiber.js";

/**
* What drew the pixels under a canvas mask. A prototype is one canvas element,
* but the thing the user points at is usually written in a nested component's
* file (BillingTable › TableRow › MenuButton › Button), so the agent needs the
* JSX lines and the component chain — not the prototype.
*
* Lines come from the compile-time `data-lg-src` stamp on every DOM host
* (stampCanvasSource), so they are exact in production React too. Read-only
* fiber reads, run once on mask release. Portals are followed through the
* fiber tree, so an open popover still traces back to its canvas element.
*/
/** Mirrors `LG_SRC_ATTR` in @petal/compiler's stampMapHosts. */
var LG_SRC_ATTR = "data-lg-src";
var SAMPLES_PER_AXIS = 5;
var MAX_COMPONENTS = 8;
var MAX_SOURCES = 6;
var MAX_TEXT = 140;
/** Bounds the text/icon scans when the focus is a whole page. */
var MAX_TEXT_NODES = 2e3;
var MAX_SVGS = 100;
var MAX_PROPS = 4;
var MAX_PROP_STRING = 40;
/** Editor chrome that can sit over the canvas. */
var CHROME$2 = "[data-region-mask], [data-overlay-container], [data-canvas-bottom-chrome]";
/** Library plumbing between the user's components (Radix primitives, providers, editor boundaries). */
var PLUMBING = /^(Slot|SlotClone|Slottable|Primitive|Presence|Portal|Popper|DismissableLayer|FocusScope|FocusGuards|RemoveScroll|Collection|Fragment|Suspense|StrictMode|Anonymous|ElementErrorBoundary)|Provider$|Context$|Consumer$|\./;
var SKIPPED_PROPS = /^(children|className|style|key|ref|id|on[A-Z].*|data-.*|aria-(?!label).*)$/;
function primitiveProps(fiber) {
	const props = fiber.memoizedProps;
	if (!props || typeof props !== "object") return void 0;
	const out = {};
	for (const [key, value] of Object.entries(props)) {
		if (Object.keys(out).length >= MAX_PROPS) break;
		if (SKIPPED_PROPS.test(key)) continue;
		if (typeof value === "number" || typeof value === "boolean") out[key] = value;
		else if (typeof value === "string" && value.length <= MAX_PROP_STRING) out[key] = value;
	}
	return Object.keys(out).length ? out : void 0;
}
function describe(fiber, name) {
	const hit = { name };
	if (fiber.key != null) hit.key = String(fiber.key);
	let count = 0;
	let index = 0;
	for (let sibling = fiber.return?.child ?? null; sibling; sibling = sibling.sibling) {
		if (sibling.type !== fiber.type) continue;
		count++;
		if (sibling === fiber || sibling === fiber.alternate) index = count;
	}
	if (count > 1 && index) hit.position = {
		index,
		count
	};
	const props = primitiveProps(fiber);
	if (props) hit.props = props;
	return hit;
}
/** `path:line:col` → site; the innermost stamp per file wins (it is the most specific line). */
function addSource(sources, stamp) {
	if (typeof stamp !== "string" || sources.length >= MAX_SOURCES) return;
	const match = /^(.+):(\d+):\d+$/.exec(stamp);
	if (!match || sources.some((site) => site.file === match[1])) return;
	sources.push({
		file: match[1],
		line: Number(match[2])
	});
}
/** Climb from a DOM node to the canvas element that owns it; null for editor chrome or empty canvas. */
function walkToCanvasElement(el) {
	const components = [];
	const sources = [];
	for (let fiber = getFiber(el); fiber; fiber = fiber.return) {
		if (x$3(fiber)) {
			addSource(sources, fiber.memoizedProps?.[LG_SRC_ATTR]);
			const node = fiber.stateNode;
			if (!(node instanceof Element)) continue;
			const id = node.getAttribute("data-element-id");
			if (id) {
				for (const component of components) if (component.key?.startsWith(id)) {
					delete component.key;
					delete component.position;
				}
				return {
					components,
					sources,
					canvasElementId: id
				};
			}
			if (node.hasAttribute("data-canvas-content")) return null;
			continue;
		}
		if (!ve$2(fiber) || components.length >= MAX_COMPONENTS) continue;
		const name = getComponentName(fiber);
		if (!name || PLUMBING.test(name) || components[components.length - 1]?.name === name) continue;
		components.push(describe(fiber, name));
	}
	return null;
}
/**
* The canvas element that owns a DOM node — following portals through the
* fiber tree — or null for editor chrome and empty canvas. A bare climb with
* no component descriptions, cheap enough to run per hover frame.
*/
function canvasElementIdFor(el) {
	for (let fiber = getFiber(el); fiber; fiber = fiber.return) {
		if (!x$3(fiber)) continue;
		const node = fiber.stateNode;
		if (!(node instanceof Element)) continue;
		const id = node.getAttribute("data-element-id");
		if (id) return id;
		if (node.hasAttribute("data-canvas-content")) return null;
	}
	return null;
}
function commonAncestor$1(elements) {
	let ancestor = elements[0] ?? null;
	for (const el of elements.slice(1)) while (ancestor && !ancestor.contains(el)) ancestor = ancestor.parentElement;
	return ancestor;
}
function collapse(text) {
	return (text ?? "").replace(/\s+/g, " ").trim();
}
function overlaps(rect, mask) {
	return rect.width > 0 && rect.height > 0 && rect.right > mask.left && rect.left < mask.left + mask.width && rect.bottom > mask.top && rect.top < mask.top + mask.height;
}
/**
* Text actually under the mask: text nodes whose boxes overlap it, space-joined
* in document order. `textContent` of the focus would run adjacent elements
* together ("CSM-111In orbit") and pull in everything the focus spans.
*/
function textUnder(focus, mask) {
	const walker = document.createTreeWalker(focus, NodeFilter.SHOW_TEXT);
	const range = document.createRange();
	const parts = [];
	let length = 0;
	let scanned = 0;
	for (let node = walker.nextNode(); node && scanned < MAX_TEXT_NODES && length < MAX_TEXT; node = walker.nextNode(), scanned++) {
		const text = collapse(node.textContent);
		if (!text) continue;
		range.selectNodeContents(node);
		if (!overlaps(range.getBoundingClientRect(), mask)) continue;
		parts.push(text);
		length += text.length + 1;
	}
	const joined = parts.join(" ");
	return joined ? joined.length > MAX_TEXT ? `${joined.slice(0, 139)}…` : joined : void 0;
}
/** The first named icon whose box overlaps the mask (outermost svgs only). */
function iconUnder(focus, mask) {
	const svgs = focus instanceof SVGSVGElement ? [focus] : Array.from(focus.querySelectorAll("svg")).slice(0, MAX_SVGS);
	for (const svg of svgs) {
		if (svg.parentElement?.closest("svg") || !overlaps(svg.getBoundingClientRect(), mask)) continue;
		const name = detectIconName(svg, getFiber(svg));
		if (name) return name;
	}
}
/**
* Sample a grid of points across the mask (client px), keep the hits that trace
* back to the dominant canvas element, and describe their nearest common node.
* Call only once the mask overlay has been painted away.
*/
function readRegionUnder(mask, canvasEl) {
	const walks = /* @__PURE__ */ new Map();
	for (let i = 0; i < SAMPLES_PER_AXIS; i++) for (let j = 0; j < SAMPLES_PER_AXIS; j++) {
		const x = mask.left + (i + .5) / SAMPLES_PER_AXIS * mask.width;
		const y = mask.top + (j + .5) / SAMPLES_PER_AXIS * mask.height;
		const hit = document.elementsFromPoint(x, y).find((el) => !el.closest(CHROME$2));
		if (!hit || walks.has(hit)) continue;
		const walk = walkToCanvasElement(hit);
		if (walk) walks.set(hit, walk);
	}
	if (walks.size === 0) return null;
	const votes = /* @__PURE__ */ new Map();
	for (const walk of walks.values()) votes.set(walk.canvasElementId, (votes.get(walk.canvasElementId) ?? 0) + 1);
	const canvasElementId = [...votes].sort((a, b) => b[1] - a[1])[0][0];
	const hits = [...walks].filter(([, walk]) => walk.canvasElementId === canvasElementId).map(([el]) => el);
	const ancestor = commonAncestor$1(hits);
	const ancestorWalk = ancestor ? walkToCanvasElement(ancestor) : null;
	const [focus, walk] = ancestor && ancestorWalk?.canvasElementId === canvasElementId ? [ancestor, ancestorWalk] : [hits[Math.floor(hits.length / 2)], walks.get(hits[Math.floor(hits.length / 2)])];
	return {
		components: walk.components,
		sources: walk.sources,
		canvasElementId,
		text: textUnder(focus, mask),
		icon: iconUnder(focus, mask),
		portaled: !canvasEl.contains(focus)
	};
}

export { canvasElementIdFor, readRegionUnder };
