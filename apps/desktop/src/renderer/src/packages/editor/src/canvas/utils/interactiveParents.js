// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/interactiveParents.ts
import { getVisibleTree } from "../../shared/state/pages.js";
import { interactiveParentIdsFor, sameSelection } from "./selection.js";
import { useSelection } from "../../shared/state/selection.js";

/** Interactive parents of the drawn tree's selection, read at event time. Cached
*  on tree, selection and drill, and keeps its identity while the members match. */
function getInteractiveParentIds() {
	const tree = getVisibleTree();
	const { selectedElementIds: ids, drilledParentId: drill } = useSelection.getState();
	const cached = interactiveCache;
	if (cached && cached.tree === tree && cached.ids === ids && cached.drill === drill) return cached.result;
	const next = interactiveParentIdsFor(tree, ids, drill);
	const prevResult = cached?.result;
	const result = prevResult && sameSelection(prevResult, next) ? prevResult : next;
	interactiveCache = {
		tree,
		ids,
		drill,
		result
	};
	return result;
}
var interactiveCache = null;

export { getInteractiveParentIds };
