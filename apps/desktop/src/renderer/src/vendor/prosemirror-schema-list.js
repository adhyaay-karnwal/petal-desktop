// Reconstructed from index-C74mRL57.js — original module: vendor/prosemirror-schema-list
import { Fragment$6, NodeRange, Slice } from "./prosemirror-model.js";
import { ReplaceAroundStep, canJoin, canSplit, findWrapping, liftTarget } from "./prosemirror-transform.js";

/**
Returns a command function that wraps the selection in a list with
the given type an attributes. If `dispatch` is null, only return a
value to indicate whether this is possible, but don't actually
perform the change.
*/
function wrapInList$1(listType, attrs = null) {
	return function(state, dispatch) {
		let { $from, $to } = state.selection;
		let range = $from.blockRange($to);
		if (!range) return false;
		let tr = dispatch ? state.tr : null;
		if (!wrapRangeInList(tr, range, listType, attrs)) return false;
		if (dispatch) dispatch(tr.scrollIntoView());
		return true;
	};
}
/**
Try to wrap the given node range in a list of the given type.
Return `true` when this is possible, `false` otherwise. When `tr`
is non-null, the wrapping is added to that transaction. When it is
`null`, the function only queries whether the wrapping is
possible.
*/
function wrapRangeInList(tr, range, listType, attrs = null) {
	let doJoin = false, outerRange = range, doc = range.$from.doc;
	if (range.depth >= 2 && range.$from.node(range.depth - 1).type.compatibleContent(listType) && range.startIndex == 0) {
		if (range.$from.index(range.depth - 1) == 0) return false;
		let $insert = doc.resolve(range.start - 2);
		outerRange = new NodeRange($insert, $insert, range.depth);
		if (range.endIndex < range.parent.childCount) range = new NodeRange(range.$from, doc.resolve(range.$to.end(range.depth)), range.depth);
		doJoin = true;
	}
	let wrap = findWrapping(outerRange, listType, attrs, range);
	if (!wrap) return false;
	if (tr) doWrapInList(tr, range, wrap, doJoin, listType);
	return true;
}
function doWrapInList(tr, range, wrappers, joinBefore, listType) {
	let content = Fragment$6.empty;
	for (let i = wrappers.length - 1; i >= 0; i--) content = Fragment$6.from(wrappers[i].type.create(wrappers[i].attrs, content));
	tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end, new Slice(content, 0, 0), wrappers.length, true));
	let found = 0;
	for (let i = 0; i < wrappers.length; i++) if (wrappers[i].type == listType) found = i + 1;
	let splitDepth = wrappers.length - found;
	let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent;
	for (let i = range.startIndex, e = range.endIndex, first = true; i < e; i++, first = false) {
		if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
			tr.split(splitPos, splitDepth);
			splitPos += 2 * splitDepth;
		}
		splitPos += parent.child(i).nodeSize;
	}
	return tr;
}
/**
Create a command to lift the list item around the selection up into
a wrapping list.
*/
function liftListItem$1(itemType) {
	return function(state, dispatch) {
		let { $from, $to } = state.selection;
		let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type == itemType);
		if (!range) return false;
		if (!dispatch) return true;
		if ($from.node(range.depth - 1).type == itemType) return liftToOuterList(state, dispatch, itemType, range);
		else return liftOutOfList(state, dispatch, range);
	};
}
function liftToOuterList(state, dispatch, itemType, range) {
	let tr = state.tr, end = range.end, endOfList = range.$to.end(range.depth);
	if (end < endOfList) {
		tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment$6.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
		range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
	}
	const target = liftTarget(range);
	if (target == null) return false;
	tr.lift(range, target);
	let $after = tr.doc.resolve(tr.mapping.map(end, -1) - 1);
	if (canJoin(tr.doc, $after.pos) && $after.nodeBefore.type == $after.nodeAfter.type) tr.join($after.pos);
	dispatch(tr.scrollIntoView());
	return true;
}
function liftOutOfList(state, dispatch, range) {
	let tr = state.tr, list = range.parent;
	for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
		pos -= list.child(i).nodeSize;
		tr.delete(pos - 1, pos + 1);
	}
	let $start = tr.doc.resolve(range.start), item = $start.nodeAfter;
	if (tr.mapping.map(range.end) != range.start + $start.nodeAfter.nodeSize) return false;
	let atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
	let parent = $start.node(-1), indexBefore = $start.index(-1);
	if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, item.content.append(atEnd ? Fragment$6.empty : Fragment$6.from(list)))) return false;
	let start = $start.pos, end = start + item.nodeSize;
	tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1, new Slice((atStart ? Fragment$6.empty : Fragment$6.from(list.copy(Fragment$6.empty))).append(atEnd ? Fragment$6.empty : Fragment$6.from(list.copy(Fragment$6.empty))), atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1));
	dispatch(tr.scrollIntoView());
	return true;
}
/**
Create a command to sink the list item around the selection down
into an inner list.
*/
function sinkListItem$1(itemType) {
	return function(state, dispatch) {
		let { $from, $to } = state.selection;
		let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type == itemType);
		if (!range) return false;
		let startIndex = range.startIndex;
		if (startIndex == 0) return false;
		let parent = range.parent, nodeBefore = parent.child(startIndex - 1);
		if (nodeBefore.type != itemType) return false;
		if (dispatch) {
			let nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type;
			let inner = Fragment$6.from(nestedBefore ? itemType.create() : null);
			let slice = new Slice(Fragment$6.from(itemType.create(null, Fragment$6.from(parent.type.create(null, inner)))), nestedBefore ? 3 : 1, 0);
			let before = range.start, after = range.end;
			dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after, before, after, slice, 1, true)).scrollIntoView());
		}
		return true;
	};
}

export { liftListItem$1, sinkListItem$1, wrapInList$1 };
