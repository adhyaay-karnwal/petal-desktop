// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/pages.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { emptyStore } from "../../../../compiler/src/store/ensureV2.js";
import { create$1, subscribeWithSelector } from "../../../../../vendor/zustand.js";
import { applyOperationsToStore, createReplaceOperation, invertOperations } from "../utils/operations.js";
import { normalizeFlowLayoutChildrenOps } from "../utils/flowLayoutChildren.js";
import { normalizeFlexShrinkOps } from "../utils/flexShrink.js";
import { expandLinkedMapOps } from "../utils/expandLinkedMapOps.js";
import { applyOperationsOntoChangedStore, operationElementIds } from "../utils/rebaseOperations.js";
import { popOperation, recordOperation } from "../utils/captureStore.js";

var EMPTY_TREE = emptyStore();
/** Coalescing session for the active page. Private UI-session state, not UI state. */
var coalescing = null;
var usePages = create$1()(subscribeWithSelector((set, get) => {
	/** Store (or, with null, drop) a page record. The active page is
	*  re-projected only when its tree or preview changed, so a history-only
	*  write leaves `visibleTree` — and every canvas node — alone. */
	function writePage(id, record, preview, extra = {}) {
		const s = get();
		const pages = new Map(s.pages);
		if (record) pages.set(id, record);
		else pages.delete(id);
		const tree = record?.tree ?? EMPTY_TREE;
		set({
			pages,
			...id === s.activePageId && (tree !== s.tree || preview !== s.preview) ? project(tree, preview) : {},
			...extra
		});
	}
	return {
		pages: /* @__PURE__ */ new Map(),
		activePageId: null,
		tree: EMPTY_TREE,
		visibleTree: EMPTY_TREE,
		preview: null,
		lastHumanEdit: null,
		editRevision: 0,
		applyOps: (ops, { pageId, source = "user" } = {}) => {
			const s = get();
			const id = pageId ?? s.activePageId;
			const record = id === null ? void 0 : s.pages.get(id);
			if (ops.length === 0 || id === null || !record) return;
			const active = id === s.activePageId;
			const next = commit(record, ops, active ? coalescing : null, source);
			if (!active) {
				writePage(id, next.record, s.preview, humanEdit(s, id, source, ops));
				return;
			}
			coalescing = next.coalescing;
			const superseded = s.preview && ops.some((op) => op.type === "replace" && op.oldElement.id === s.preview.id);
			writePage(id, next.record, superseded ? null : s.preview, {
				...humanEdit(s, id, source, ops),
				editRevision: s.editRevision + 1
			});
		},
		applyTransientOps: (ops, pageId) => {
			const s = get();
			const id = pageId ?? s.activePageId;
			const record = id === null ? void 0 : s.pages.get(id);
			if (ops.length === 0 || id === null || !record) return;
			writePage(id, {
				...record,
				tree: applyOperationsToStore(record.tree, ops)
			}, s.preview, id === s.activePageId ? { editRevision: s.editRevision + 1 } : {});
		},
		transaction: (pageId) => {
			const id = pageId ?? get().activePageId;
			const staged = [];
			let open = id !== null;
			return {
				stage: (ops) => {
					if (!open || ops.length === 0 || !get().pages.has(id)) return;
					get().applyTransientOps(ops, id);
					staged.push(...ops);
				},
				commit: ({ source = "user", ops = staged } = {}) => {
					if (!open) return;
					open = false;
					const s = get();
					const record = s.pages.get(id);
					if (ops.length === 0 || !record) return;
					const active = id === s.activePageId;
					const pushed = source === "ai" ? {
						history: recordAiBatch(record.history, ops),
						coalescing: splitCoalescing(active ? coalescing : null)
					} : pushEntry(record.history, ops, active ? coalescing : null);
					if (active) coalescing = pushed.coalescing;
					for (const op of ops) recordOperation(op, record.tree);
					writePage(id, {
						...record,
						history: pushed.history
					}, s.preview, humanEdit(s, id, source, ops));
				},
				discard: () => {
					if (!open) return;
					open = false;
					if (staged.length > 0) get().applyTransientOps(invertOperations(staged), id);
				}
			};
		},
		patchTrees: (transform) => {
			const s = get();
			const pages = new Map(s.pages);
			let changed = false;
			for (const [id, record] of s.pages) {
				const tree = transform(record.tree);
				if (tree === record.tree) continue;
				pages.set(id, {
					...record,
					tree
				});
				changed = true;
			}
			if (!changed) return;
			const active = s.activePageId === null ? void 0 : pages.get(s.activePageId);
			if (!active || active === s.pages.get(s.activePageId)) {
				set({ pages });
				return;
			}
			set({
				pages,
				...project(active.tree, s.preview),
				editRevision: s.editRevision + 1
			});
		},
		setPage: (id, tree) => {
			if (id === get().activePageId) coalescing = null;
			writePage(id, {
				tree,
				history: EMPTY_HISTORY
			}, null);
		},
		removePage: (id) => {
			if (!get().pages.has(id)) return;
			writePage(id, null, null);
		},
		markSaved: (id, tree, state) => {
			const s = get();
			const record = s.pages.get(id);
			if (!record || record.savedTree === tree && record.savedState === state) return;
			writePage(id, {
				...record,
				savedTree: tree,
				savedState: state
			}, s.preview);
		},
		activatePage: (id) => {
			coalescing = null;
			set({
				activePageId: id,
				...project(get().pages.get(id)?.tree ?? EMPTY_TREE, null)
			});
		},
		reset: () => {
			coalescing = null;
			set({
				pages: /* @__PURE__ */ new Map(),
				activePageId: null,
				...project(EMPTY_TREE, null)
			});
		},
		undo: () => {
			const s = get();
			const record = s.activePageId === null ? void 0 : s.pages.get(s.activePageId);
			const next = record && undoRecord(record);
			if (!next) return;
			if (!next.applied) {
				writePage(s.activePageId, next.record, s.preview);
				return;
			}
			writePage(s.activePageId, next.record, null, { editRevision: s.editRevision + 1 });
		},
		redo: () => {
			const s = get();
			const record = s.activePageId === null ? void 0 : s.pages.get(s.activePageId);
			const next = record && redoRecord(record);
			if (!next) return;
			if (!next.applied) {
				writePage(s.activePageId, next.record, s.preview);
				return;
			}
			writePage(s.activePageId, next.record, null, {
				...humanEdit(s, s.activePageId, "user", next.applied),
				editRevision: s.editRevision + 1
			});
		},
		beginCoalescing: () => {
			coalescing = { entryIndex: -1 };
		},
		endCoalescing: () => {
			coalescing = null;
		},
		previewElement: (id, element) => {
			set(project(get().tree, {
				id,
				element
			}));
		},
		clearPreview: () => {
			if (!get().preview) return;
			set(project(get().tree, null));
		}
	};
}));
/** Read the drawn tree outside a component render (event handlers, overlays).
*  Module scope keeps the `usePages` namespace read out of compiled
*  components, which may not reference hooks as values. */
function getVisibleTree() {
	return usePages.getState().visibleTree;
}
/** Read the saved tree (no preview draft) outside a component render. */
function getTree() {
	return usePages.getState().tree;
}
/** Inject the visible tree as the `store` prop. Panels keep their own `store`
*  prop because WebviewEditPanel passes a synthetic store. */
function withVisibleTree(Component) {
	function WithVisibleTree(props) {
		const $ = (0, import_compiler_runtime.c)(3);
		const store = usePages(_temp);
		const t0 = props;
		let t1;
		if ($[0] !== store || $[1] !== t0) {
			t1 = (0, import_react.createElement)(Component, {
				...t0,
				store
			});
			$[0] = store;
			$[1] = t0;
			$[2] = t1;
		} else t1 = $[2];
		return t1;
	}
	function _temp(s) {
		return s.visibleTree;
	}
	WithVisibleTree.displayName = `withVisibleTree(${Component.displayName ?? Component.name ?? "Component"})`;
	return WithVisibleTree;
}
var EMPTY_HISTORY = Object.freeze({
	undo: Object.freeze([]),
	redo: Object.freeze([]),
	aiSeq: 0,
	aiTouchedAt: /* @__PURE__ */ new Map()
});
var MAX_HISTORY = 50;
var COALESCABLE = /* @__PURE__ */ new Set([
	"set_props",
	"set_styles",
	"set_position"
]);
/** `tree`, `visibleTree` and `preview` for the active page. Every write of
*  those fields goes through here, so the projection cannot drift from
*  `pages`. A preview whose element is gone is dropped rather than showing a
*  stale tree. */
function project(tree, preview) {
	const op = preview && createReplaceOperation(tree, preview.id, preview.element);
	if (!op) return {
		tree,
		visibleTree: tree,
		preview: null
	};
	return {
		tree,
		visibleTree: applyOperationsToStore(tree, [op]),
		preview
	};
}
function opTypeCounts(ops) {
	const opTypes = {};
	for (const op of ops) opTypes[op.type] = (opTypes[op.type] ?? 0) + 1;
	return opTypes;
}
/** The `lastHumanEdit` bump for a commit, when a user made it. */
function humanEdit(s, pageId, source, ops) {
	return source === "user" ? { lastHumanEdit: {
		pageId,
		n: (s.lastHumanEdit?.n ?? 0) + 1,
		opTypes: opTypeCounts(ops),
		ops
	} } : {};
}
function commit(record, ops, coalescing, source) {
	let tree = applyOperationsToStore(record.tree, ops);
	const extras = normalizeExtras(tree, ops);
	const entry = extras.length > 0 ? [...ops, ...extras] : ops;
	if (extras.length > 0) tree = applyOperationsToStore(tree, extras);
	const pushed = source === "ai" ? {
		history: recordAiBatch(record.history, entry),
		coalescing: splitCoalescing(coalescing)
	} : pushEntry(record.history, entry, coalescing);
	for (const op of entry) recordOperation(op, tree);
	return {
		record: {
			...record,
			tree,
			history: pushed.history
		},
		coalescing: pushed.coalescing
	};
}
/** Remember which elements an agent batch touched; the user's stacks are untouched. */
function recordAiBatch(history, ops) {
	const aiSeq = history.aiSeq + 1;
	const aiTouchedAt = new Map(history.aiTouchedAt);
	for (const op of ops) for (const id of operationElementIds(op)) aiTouchedAt.set(id, aiSeq);
	return {
		...history,
		aiSeq,
		aiTouchedAt
	};
}
/** A coalescing session that kept merging into its entry across an agent batch
*  would undo past that batch to the value before the session; the next user
*  update starts a new entry instead. */
function splitCoalescing(coalescing) {
	return coalescing && { entryIndex: -1 };
}
/** True for elements an agent touched after `entry` was last applied. */
function touchedSince(history, entry) {
	return (id) => (history.aiTouchedAt.get(id) ?? -1) > entry.seq;
}
/** Undo the newest user step, rebased past any agent edit since. `applied` is
*  null when only the stacks changed. Null when there is nothing to undo. */
function undoRecord(record) {
	const { history } = record;
	const undo = [...history.undo];
	const redo = [...history.redo];
	while (undo.length > 0) {
		const entry = undo[undo.length - 1];
		const inverseOps = invertOperations(entry.ops);
		undo.pop();
		const { store: tree, applied } = applyOperationsOntoChangedStore(record.tree, inverseOps, touchedSince(history, entry));
		if (applied.length === 0) continue;
		const redoOps = applied === inverseOps ? entry.ops : invertOperations(applied);
		redo.push({
			ops: redoOps,
			seq: history.aiSeq
		});
		for (let i = entry.ops.length - 1; i >= 0; i--) popOperation(entry.ops[i]);
		return {
			record: {
				...record,
				tree,
				history: {
					...history,
					undo,
					redo
				}
			},
			applied
		};
	}
	if (undo.length === history.undo.length) return null;
	return {
		record: {
			...record,
			history: {
				...history,
				undo,
				redo
			}
		},
		applied: null
	};
}
/** Redo the newest undone step, rebased past any agent edit since. Same
*  contract as `undoRecord`. */
function redoRecord(record) {
	const { history } = record;
	const undo = [...history.undo];
	const redo = [...history.redo];
	while (redo.length > 0) {
		const entry = redo[redo.length - 1];
		redo.pop();
		const { store: tree, applied } = applyOperationsOntoChangedStore(record.tree, entry.ops, touchedSince(history, entry));
		if (applied.length === 0) continue;
		undo.push({
			ops: applied,
			seq: history.aiSeq
		});
		for (const op of applied) recordOperation(op, tree);
		return {
			record: {
				...record,
				tree,
				history: {
					...history,
					undo,
					redo
				}
			},
			applied
		};
	}
	if (redo.length === history.redo.length) return null;
	return {
		record: {
			...record,
			history: {
				...history,
				undo,
				redo
			}
		},
		applied: null
	};
}
/** True while a Chrome page capture is being committed. Its flex children keep
*  the flex-shrink the page rendered (see normalizeFlexShrinkOps). */
var skipFlexShrinkInserts = false;
/** Run `fn` so page commits inside it do not rewrite a capture's flex-shrink. */
function withFlexShrinkInsertsSkipped(fn) {
	const previous = skipFlexShrinkInserts;
	skipFlexShrinkInserts = true;
	try {
		return fn();
	} finally {
		skipFlexShrinkInserts = previous;
	}
}
/** Derive the normalization extras for a forward batch: flow-layout children,
*  then flex shrink, then linked-map expansion, each seeing the running tree.
*  Folded into the same undo entry. */
function normalizeExtras(storeAfter, ops) {
	const flowPositionExtra = normalizeFlowLayoutChildrenOps(storeAfter, ops);
	const afterFlowPosition = flowPositionExtra.length > 0 ? applyOperationsToStore(storeAfter, flowPositionExtra) : storeAfter;
	const flexExtra = normalizeFlexShrinkOps(afterFlowPosition, ops, { skipInserts: skipFlexShrinkInserts });
	const mapExtra = expandLinkedMapOps(flexExtra.length > 0 ? applyOperationsToStore(afterFlowPosition, flexExtra) : afterFlowPosition, ops);
	return [
		...flowPositionExtra,
		...flexExtra,
		...mapExtra
	];
}
/** Push a user batch, or merge it into the coalescing session's slot. */
function pushEntry(history, entry, coalescing) {
	const undo = [...history.undo];
	let nextCoalescing = coalescing;
	const merged = coalescing && coalescing.entryIndex >= 0 && coalescing.entryIndex < undo.length ? coalesceOps(undo[coalescing.entryIndex].ops, entry) : null;
	if (merged) undo[coalescing.entryIndex] = {
		...undo[coalescing.entryIndex],
		ops: merged
	};
	else {
		undo.push({
			ops: entry,
			seq: history.aiSeq
		});
		if (coalescing && coalescing.entryIndex < 0) nextCoalescing = { entryIndex: undo.length - 1 };
		if (undo.length > MAX_HISTORY) {
			undo.shift();
			if (nextCoalescing && nextCoalescing.entryIndex >= 0) nextCoalescing = { entryIndex: nextCoalescing.entryIndex - 1 };
		}
	}
	return {
		history: {
			...history,
			undo,
			redo: []
		},
		coalescing: nextCoalescing
	};
}
/**
* If every op in `curr` matches an op already in `prev` by (type, elementId)
* AND is one of the coalescable types, return a merged batch where each
* matching prev op keeps its original `old*` and gets `new*` from curr.
* If anything in `curr` is unmatched or non-coalescable, return null — the
* caller should push the unrelated batch as a new history entry instead of
* letting it pollute the coalesced op's undo entry.
*/
function coalesceOps(prev, curr) {
	const result = [...prev];
	for (const c of curr) {
		if (!COALESCABLE.has(c.type)) return null;
		const idx = result.findIndex((p) => p.type === c.type && p.elementId === c.elementId);
		if (idx < 0) return null;
		const p = result[idx];
		if (c.type === "set_props" && p.type === "set_props") result[idx] = {
			...p,
			newProps: c.newProps
		};
		else if (c.type === "set_styles" && p.type === "set_styles") result[idx] = {
			...p,
			newStyles: c.newStyles
		};
		else if (c.type === "set_position" && p.type === "set_position") result[idx] = {
			...p,
			newPosition: c.newPosition
		};
	}
	return result;
}

export { getTree, getVisibleTree, usePages, withFlexShrinkInsertsSkipped, withVisibleTree };
