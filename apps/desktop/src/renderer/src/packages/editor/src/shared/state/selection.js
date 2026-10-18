// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/selection.ts
import { getParentId, isDescendant } from "../../../../compiler/src/store/read.js";
import { create$1, subscribeWithSelector } from "../../../../../vendor/zustand.js";
import { getVisibleTree, usePages } from "./pages.js";
import { sameSelection, soleSelectedElementId } from "../../canvas/utils/selection.js";

var EMPTY_SELECTION = /* @__PURE__ */ new Set();
var useSelection = create$1()(subscribeWithSelector((set, get) => ({
	selectedElementIds: EMPTY_SELECTION,
	drilledParentId: null,
	select: (ids, drilledParentId) => {
		const cur = get();
		const patch = {};
		if (!sameSelection(cur.selectedElementIds, ids)) patch.selectedElementIds = ids;
		if (drilledParentId !== void 0 && drilledParentId !== cur.drilledParentId) patch.drilledParentId = drilledParentId;
		if (patch.selectedElementIds || "drilledParentId" in patch) set(patch);
	},
	selectOne: (id) => {
		const parent = getParentId(usePages.getState().tree, id);
		get().select(/* @__PURE__ */ new Set([id]), parent === "ROOT" || parent === null ? null : parent);
	},
	toggle: (id) => {
		const current = get().selectedElementIds;
		const next = new Set(current);
		if (next.has(id)) next.delete(id);
		else {
			const tree = usePages.getState().tree;
			for (const selectedId of current) if (isDescendant(tree, selectedId, id) || isDescendant(tree, id, selectedId)) next.delete(selectedId);
			next.add(id);
		}
		if (next.size === 0) next.add(id);
		get().select(next);
	},
	clearSelection: () => {
		const cur = get();
		if (cur.selectedElementIds.size === 0 && cur.drilledParentId === null) return;
		set({
			selectedElementIds: EMPTY_SELECTION,
			drilledParentId: null
		});
	}
})));
function getSelectedElementIds() {
	return useSelection.getState().selectedElementIds;
}
function useSelectedElementIds() {
	return useSelection(_temp$106);
}
function _temp$106(s) {
	return s.selectedElementIds;
}
var lastNonEmptySelection = EMPTY_SELECTION;
/** The selection, or while nothing is selected the last non-empty one. Lets a
*  panel stay on its element across a deselect instead of unmounting. */
function useLastSelectedElementIds() {
	return useSelection(_temp2$68);
}
/** The single selected id. A primitive, so multi-select changes don't re-render. */
function _temp2$68(s) {
	if (s.selectedElementIds.size > 0) lastNonEmptySelection = s.selectedElementIds;
	return lastNonEmptySelection;
}
function useSoleSelectedElementId() {
	return useSelection(_temp3$49);
}
function _temp3$49(s) {
	return soleSelectedElementId(s.selectedElementIds);
}
usePages.subscribe((s) => s.activePageId, (_id, previousId) => {
	if (previousId !== null) useSelection.getState().clearSelection();
});
var lastPruned = null;
usePages.subscribe((s) => s.editRevision, () => {
	const tree = getVisibleTree();
	if (lastPruned && tree.parentByChild === lastPruned.parentByChild && tree.childrenByParent === lastPruned.childrenByParent) return;
	lastPruned = {
		parentByChild: tree.parentByChild,
		childrenByParent: tree.childrenByParent
	};
	pruneTo(tree);
});
/** Drop selected and drilled ids the tree no longer has. */
function pruneTo(tree) {
	const { selectedElementIds, drilledParentId } = useSelection.getState();
	const patch = {};
	if (selectedElementIds.size > 0) {
		const kept = /* @__PURE__ */ new Set();
		for (const id of selectedElementIds) if (tree.byId.has(id)) kept.add(id);
		if (kept.size !== selectedElementIds.size) patch.selectedElementIds = kept;
	}
	if (drilledParentId !== null && !tree.byId.has(drilledParentId)) patch.drilledParentId = null;
	if (patch.selectedElementIds || "drilledParentId" in patch) useSelection.setState(patch);
}

export { EMPTY_SELECTION, getSelectedElementIds, useLastSelectedElementIds, useSelectedElementIds, useSelection, useSoleSelectedElementId };
