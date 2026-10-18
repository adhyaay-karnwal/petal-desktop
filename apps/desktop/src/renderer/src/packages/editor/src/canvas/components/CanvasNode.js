// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasNode.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getVisibleTree, usePages } from "../../shared/state/pages.js";
import { renderElement, rendersChildrenInline } from "../utils/renderElement.js";

/** One live canvas node. The only recursion on the canvas; static counterpart is renderTree.
*  Memoized on its id and option values: a parent builds fresh child options on every render, and
*  without this, any edit to a container (moving a frame) re-rendered its whole subtree. A node's
*  own row, child list and text-edit session re-render it through its subscriptions. */
var CanvasNode = (0, import_react.memo)(CanvasNodeImpl, (prev, next) => prev.id === next.id && sameOptions(prev.options, next.options));
function CanvasNodeImpl(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { id, options } = t0;
	let t1;
	if ($[0] !== options.componentIndex) {
		t1 = (el) => rendersChildrenInline(el, options.componentIndex);
		$[0] = options.componentIndex;
		$[1] = t1;
	} else t1 = $[1];
	const { element, tree, childIds } = useCanvasElement(id, t1);
	const editing = useTextEditSession(id, (element ? rendersChildrenInline(element, options.componentIndex) : false) ? childIds : EMPTY_IDS);
	if (!element) return null;
	let t2;
	if ($[2] !== editing || $[3] !== options) {
		t2 = editing ? {
			...options,
			editingTextId: editing.id,
			editingTextBounds: editing.bounds
		} : options;
		$[2] = editing;
		$[3] = options;
		$[4] = t2;
	} else t2 = $[4];
	const nodeOptions = t2;
	const asNode = _temp$95;
	let t3;
	if ($[5] !== tree) {
		t3 = (childId_0, childOptions_0) => {
			if (!childOptions_0.isAsChildSlotTarget && !childOptions_0.isChildIntrospectionTarget) return asNode(childId_0, childOptions_0);
			const child = tree.byId.get(childId_0);
			return child ? renderElement(child, tree, childOptions_0, asNode) : null;
		};
		$[5] = tree;
		$[6] = t3;
	} else t3 = $[6];
	const renderChild = t3;
	let t4;
	if ($[7] !== element || $[8] !== nodeOptions || $[9] !== renderChild || $[10] !== tree) {
		t4 = renderElement(element, tree, nodeOptions, renderChild);
		$[7] = element;
		$[8] = nodeOptions;
		$[9] = renderChild;
		$[10] = tree;
		$[11] = t4;
	} else t4 = $[11];
	return t4;
}
/** Option objects with the same keys and values. Each child's options spread its parent's. */
function _temp$95(childId, childOptions) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasNode, {
		id: childId,
		options: childOptions
	}, childId);
}
function sameOptions(a, b) {
	if (a === b) return true;
	const aKeys = Object.keys(a);
	if (aKeys.length !== Object.keys(b).length) return false;
	for (const key of aKeys) if (!Object.is(a[key], b[key])) return false;
	return true;
}
/** A root's positioned wrapper. A dragged root is hidden or moved by useDndCanvas, in the DOM:
*  a prop for it would re-render every root at pickup and drop. */
function CanvasRootNode(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { id, options } = t0;
	const position = useCanvasElement(id).element?.canvasPosition;
	const t1 = position?.y ?? 20;
	const t2 = position?.x ?? 20;
	let t3;
	if ($[0] !== t1 || $[1] !== t2) {
		t3 = {
			top: t1,
			left: t2
		};
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== id || $[4] !== options) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasNode, {
			id,
			options
		});
		$[3] = id;
		$[4] = options;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== id || $[7] !== t3 || $[8] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-canvas-root-id": id,
			className: "absolute",
			style: t3,
			children: t4
		});
		$[6] = id;
		$[7] = t3;
		$[8] = t4;
		$[9] = t5;
	} else t5 = $[9];
	return t5;
}
var textEditSession = null;
var textEditListeners = /* @__PURE__ */ new Map();
/** Publish the canvas's text-edit session. Called by the canvas only. */
function setTextEditSession(next) {
	const prev = textEditSession;
	if (prev === next || prev && next && prev.id === next.id && prev.bounds === next.bounds) return;
	textEditSession = next;
	if (prev) textEditListeners.get(prev.id)?.forEach((listener) => listener());
	if (next && next.id !== prev?.id) textEditListeners.get(next.id)?.forEach((listener) => listener());
}
function subscribeTextEdit(ids, listener) {
	for (const id of ids) {
		let listeners = textEditListeners.get(id);
		if (!listeners) textEditListeners.set(id, listeners = /* @__PURE__ */ new Set());
		listeners.add(listener);
	}
	return () => {
		for (const id of ids) {
			const listeners = textEditListeners.get(id);
			listeners?.delete(listener);
			if (listeners?.size === 0) textEditListeners.delete(id);
		}
	};
}
/** The session when it edits this node or one of `inlineChildIds`; null otherwise. */
function useTextEditSession(id, inlineChildIds) {
	const $ = (0, import_compiler_runtime.c)(6);
	let t0;
	if ($[0] !== id || $[1] !== inlineChildIds) {
		t0 = (listener) => subscribeTextEdit(inlineChildIds.length ? [id, ...inlineChildIds] : [id], listener);
		$[0] = id;
		$[1] = inlineChildIds;
		$[2] = t0;
	} else t0 = $[2];
	const subscribe = t0;
	let t1;
	if ($[3] !== id || $[4] !== inlineChildIds) {
		t1 = () => textEditSession && (textEditSession.id === id || inlineChildIds.includes(textEditSession.id)) ? textEditSession : null;
		$[3] = id;
		$[4] = inlineChildIds;
		$[5] = t1;
	} else t1 = $[5];
	return (0, import_react.useSyncExternalStore)(subscribe, t1);
}
var elementSubscriptions = /* @__PURE__ */ new Map();
/** Flat [row, childList, …] per direct child, cached by identity. */
var inlineChildStateCache = /* @__PURE__ */ new Map();
var nodeSnapshots = /* @__PURE__ */ new Map();
var inlineNodeSnapshots = /* @__PURE__ */ new Map();
/** Stable empty child list. A fresh `[]` from a snapshot fails Object.is and rerenders childless nodes on every edit. */
var EMPTY_IDS = Object.freeze([]);
usePages.subscribe((s) => s.visibleTree, (next, prev) => {
	const sameChildren = next.childrenByParent === prev.childrenByParent;
	for (const [id, subs] of elementSubscriptions) {
		const own = next.byId.get(id) !== prev.byId.get(id) || !sameChildren && next.childrenByParent.get(id) !== prev.childrenByParent.get(id);
		for (const sub of subs) if (own || sub.inline) sub.listener();
	}
});
/** Visible row of a canvas node, and the tree to render it from. Re-renders when its row or child
*  list changes and, for a node that renders its children inline (Slot, introspection), when a
*  child's row or child list changes. */
function useCanvasElement(id, inline) {
	const $ = (0, import_compiler_runtime.c)(13);
	let t0;
	if ($[0] !== id) {
		t0 = (listener) => subscribeElement(id, listener, false);
		$[0] = id;
		$[1] = t0;
	} else t0 = $[1];
	const subscribeOwn = t0;
	let t1;
	if ($[2] !== id) {
		t1 = () => getVisibleTree().byId.get(id);
		$[2] = id;
		$[3] = t1;
	} else t1 = $[3];
	const row = (0, import_react.useSyncExternalStore)(subscribeOwn, t1);
	let t2;
	if ($[4] !== inline || $[5] !== row) {
		t2 = row ? inline?.(row) ?? false : false;
		$[4] = inline;
		$[5] = row;
		$[6] = t2;
	} else t2 = $[6];
	const isInline = t2;
	let t3;
	if ($[7] !== id || $[8] !== isInline) {
		t3 = (listener_0) => subscribeElement(id, listener_0, isInline);
		$[7] = id;
		$[8] = isInline;
		$[9] = t3;
	} else t3 = $[9];
	const subscribe = t3;
	let t4;
	if ($[10] !== id || $[11] !== isInline) {
		t4 = () => nodeSnapshot(id, isInline);
		$[10] = id;
		$[11] = isInline;
		$[12] = t4;
	} else t4 = $[12];
	return (0, import_react.useSyncExternalStore)(subscribe, t4);
}
function nodeSnapshot(id, inline) {
	const tree = getVisibleTree();
	const element = tree.byId.get(id);
	const childIds = tree.childrenByParent.get(id) ?? EMPTY_IDS;
	const inlineChildren = inline ? cachedChildState(id) : EMPTY_IDS;
	const snapshots = inline ? inlineNodeSnapshots : nodeSnapshots;
	const prev = snapshots.get(id);
	if (prev && prev.element === element && prev.childIds === childIds && prev.inlineChildren === inlineChildren) return prev;
	const next = {
		element,
		tree,
		childIds,
		inlineChildren
	};
	snapshots.set(id, next);
	return next;
}
function subscribeElement(id, listener, inline) {
	let subs = elementSubscriptions.get(id);
	if (!subs) {
		subs = /* @__PURE__ */ new Set();
		elementSubscriptions.set(id, subs);
	}
	const sub = {
		listener,
		inline
	};
	subs.add(sub);
	return () => {
		subs.delete(sub);
		if (subs.size === 0) {
			elementSubscriptions.delete(id);
			inlineChildStateCache.delete(id);
			nodeSnapshots.delete(id);
			inlineNodeSnapshots.delete(id);
		}
	};
}
function cachedChildState(id) {
	const tree = getVisibleTree();
	const childIds = tree.childrenByParent.get(id) ?? EMPTY_IDS;
	const next = [];
	for (const childId of childIds) next.push(tree.byId.get(childId), tree.childrenByParent.get(childId) ?? EMPTY_IDS);
	const prev = inlineChildStateCache.get(id);
	if (prev && prev.length === next.length && prev.every((v, i) => v === next[i])) return prev;
	inlineChildStateCache.set(id, next);
	return next;
}

export { CanvasRootNode, setTextEditSession };
