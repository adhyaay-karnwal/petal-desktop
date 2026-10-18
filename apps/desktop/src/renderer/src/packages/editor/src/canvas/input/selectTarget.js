// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/selectTarget.ts
import { getById, getParentId, isDescendant, resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { isElementInteractive } from "../utils/renderElement.js";
import { yieldsToCoveredRoot } from "../utils/coveredRoot.js";
import { resolvePointerTarget } from "../utils/pointerTarget.js";

/**
* Elements whose renderer owns its own select and hover zones (the webview
* frame, a captured page). The machine leaves a press inside them to those
* handlers unless a canvas element below took it first.
*/
function rendererOwned(tree, id) {
	const element = getById(tree, id);
	return element?.type === "webview" || element?.type === "html" && element.props?.["data-component"] === "CapturedPage";
}
/** renderElement's `takesPointer`, for an element found in the walk. */
function takesPointer(ctx, id) {
	const parent = getParentId(ctx.tree, id);
	return isElementInteractive(ctx.mode, parent === null || parent === "ROOT" ? null : parent, ctx.interactiveParentIds) && !(ctx.mode !== "deepest" && yieldsToCoveredRoot(ctx.tree, id, ctx.drilledParentId));
}
/** Ids carried by `node` and its ancestors, innermost first: a click's descent path. */
function elementPath(node) {
	const path = [];
	for (let n = node; n; n = n.parentElement) {
		const id = n.getAttribute("data-element-id");
		if (id) path.push(id);
	}
	return path;
}
/**
* What a click on `node` selects. `node` is where the browser would dispatch
* the click: the nearest common ancestor of the press and release targets.
* A background click deselects inside the camera's wrapper, as its handlers did.
*/
function clickTarget(node, ctx) {
	if (!node?.closest(CAMERA)) return { kind: "none" };
	if (node.closest(".ProseMirror")) return { kind: "none" };
	for (let n = node; n; n = n.parentElement) {
		const id = n.getAttribute("data-element-id");
		if (!id) continue;
		if (!getById(ctx.tree, id)) continue;
		if (rendererOwned(ctx.tree, id)) return rendererZone(node, n, id, ctx.tree);
		if (takesPointer(ctx, id)) return {
			kind: "element",
			id: resolveTextOwner(ctx.tree, id),
			path: elementPath(node)
		};
	}
	return node.closest("[data-element-id]") ? { kind: "none" } : { kind: "background" };
}
/**
* A click inside a webview frame or a captured page that no canvas element
* took. Their renderers mark where a click selects them (`data-select-zone`):
* anywhere inside the zone, or with `self` the zone node only. The webview
* frame also selects on its own root, and passes Shift; a captured page does not.
*/
function rendererZone(node, root, id, tree) {
	const shift = getById(tree, id)?.type === "webview";
	if (node === root && shift) return {
		kind: "zone",
		id,
		shift
	};
	const zone = node.closest("[data-select-zone]");
	if (!zone || zone.closest("[data-element-id]") !== root) return { kind: "none" };
	if (zone.getAttribute("data-select-zone") === "self" && zone !== node) return { kind: "none" };
	return {
		kind: "zone",
		id,
		shift
	};
}
/**
* What hovering `node` outlines. As the per-element handlers: the innermost
* element that takes the pointer, except that outside deepest mode a text
* element lets its parent's outline win. A renderer's own zone answers as its
* handlers do (see `within`).
*/
function hoverTarget(node, ctx) {
	const label = node?.closest("[data-root-label-id]");
	if (label) return {
		kind: "label",
		id: label.getAttribute("data-root-label-id")
	};
	let found = null;
	for (let n = node; n; n = n.parentElement) {
		const id = n.getAttribute("data-element-id");
		if (!id || !getById(ctx.tree, id)) continue;
		if (rendererOwned(ctx.tree, id)) {
			if (found) break;
			return getById(ctx.tree, id)?.type === "webview" ? {
				kind: "element",
				id
			} : {
				kind: "within",
				id
			};
		}
		if (!takesPointer(ctx, id)) continue;
		found = resolveTextOwner(ctx.tree, id);
		if (getById(ctx.tree, id)?.type !== "text" || ctx.mode === "deepest") break;
	}
	return found ? {
		kind: "element",
		id: found
	} : { kind: "clear" };
}
/** The camera's wrapper (CanvasCamera). */
var CAMERA = "[data-canvas-camera]";
var CONTEXT_MENU_TARGETS = "[data-element-id],[data-root-label-id],[data-selection-label-id],[data-selection-overlay-id],[data-handle-element-id]";
/**
* The element a right-click on `node` targets, and whether it keeps the
* selection. Inside the selection it keeps it and targets the covering selected
* element; outside, the element a left-click would pick by the store-parent
* rule (resolvePointerTarget). Labels, the selection box and the handle cursor
* surface name their element.
*/
function contextMenuTarget(node, ctx) {
	const hit = node?.closest(CONTEXT_MENU_TARGETS) ?? null;
	const hitId = hit && (hit.getAttribute("data-element-id") ?? hit.getAttribute("data-root-label-id") ?? hit.getAttribute("data-selection-label-id") ?? hit.getAttribute("data-selection-overlay-id") ?? hit.getAttribute("data-handle-element-id")) || null;
	if (!hitId) return {
		id: null,
		keepSelection: false
	};
	const covering = [...ctx.selectedElementIds].find((sel) => sel === hitId || isDescendant(ctx.tree, sel, hitId));
	if (covering) return {
		id: covering,
		keepSelection: true
	};
	return {
		id: resolvePointerTarget(ctx.tree, hitId, ctx.interactiveParentIds, ctx.drilledParentId),
		keepSelection: false
	};
}
/** The nearest node containing both: where the browser dispatches the click. */
function commonAncestor(a, b) {
	if (!a || !b) return null;
	const seen = /* @__PURE__ */ new Set();
	for (let n = a; n; n = n.parentElement) seen.add(n);
	for (let n = b; n; n = n.parentElement) if (seen.has(n)) return n;
	return null;
}

export { clickTarget, commonAncestor, contextMenuTarget, hoverTarget };
