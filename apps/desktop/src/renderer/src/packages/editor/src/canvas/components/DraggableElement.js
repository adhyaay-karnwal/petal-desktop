// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/DraggableElement.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { innerPickStore } from "../../shared/state/innerPickStore.js";

/** Elements that can start a canvas drag, by id. Written by DraggableElement on
*  mount, read by resolveDragSource on pointerdown. */
var draggables = /* @__PURE__ */ new Map();
/** Marks an element as a canvas drag source. It renders no DOM of its own
*  except the inline-block box that replaced media (img/video/svg) need, and it
*  never reads the selection: its output must not change with a click. A
*  wrapper that came and went with the selection replaced the DOM parent of
*  whole subtrees, and React remounted all of them on every click.
*  The canvas input machine starts drags (resolveDragSource). */
function DraggableElement(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { id, parentId, needsBox, display, width, height, boxStyle, children } = t0;
	let t1;
	let t2;
	if ($[0] !== id || $[1] !== needsBox || $[2] !== parentId) {
		t1 = () => {
			const entry = {
				parentId,
				needsBox
			};
			draggables.set(id, entry);
			return () => {
				if (draggables.get(id) === entry) draggables.delete(id);
			};
		};
		t2 = [
			id,
			parentId,
			needsBox
		];
		$[0] = id;
		$[1] = needsBox;
		$[2] = parentId;
		$[3] = t1;
		$[4] = t2;
	} else {
		t1 = $[3];
		t2 = $[4];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	if (!needsBox) return children;
	const wrapperDisplay = display ?? boxStyle?.display ?? "inline-block";
	let t3;
	if ($[5] !== boxStyle || $[6] !== height || $[7] !== width || $[8] !== wrapperDisplay) {
		t3 = boxStyle ? {
			...boxStyle,
			display: wrapperDisplay
		} : {
			display: wrapperDisplay,
			width,
			height
		};
		$[5] = boxStyle;
		$[6] = height;
		$[7] = width;
		$[8] = wrapperDisplay;
		$[9] = t3;
	} else t3 = $[9];
	let t4;
	if ($[10] !== children || $[11] !== id || $[12] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-element-id": id,
			style: t3,
			children
		});
		$[10] = children;
		$[11] = id;
		$[12] = t3;
		$[13] = t4;
	} else t4 = $[13];
	return t4;
}
/** An interactive layer's presses belong to its content (I, see innerPickStore):
*  it does not drag. ⌘-click and ⌥-drag are handled above it by InnerPicker.
*  Read at event time, so a toggle re-renders nothing. */
function isInteractiveLayer(id) {
	return innerPickStore.getState().interactiveIds.has(id);
}
/** The element a pointerdown at `target` drags: the innermost element that is a
*  drag source and is a root, a media box, or a child of an interactive parent.
*  `node` is the outermost DOM node carrying its id (the media box, not the media).
*  Walks the DOM, so a pointerdown inside a descendant's portal drags nothing. */
function resolveDragSource(target, root, interactiveParentIds) {
	for (let node = target; node && node !== root; node = node.parentElement) {
		const id = node.getAttribute("data-element-id");
		const entry = id ? draggables.get(id) : void 0;
		if (!id || !entry || isInteractiveLayer(id)) continue;
		if (!entry.needsBox && entry.parentId !== null && !interactiveParentIds.has(entry.parentId)) continue;
		let outer = node;
		while (outer.parentElement && outer.parentElement.getAttribute("data-element-id") === id) outer = outer.parentElement;
		return {
			id,
			node: outer
		};
	}
	return null;
}

export { DraggableElement, resolveDragSource };
