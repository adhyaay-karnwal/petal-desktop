// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/coveringReadDelta.ts
import { getById, getParentId } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore } from "../../shared/utils/operations.js";
import { hashAllElementSubtreesFrom } from "../../../../compiler/src/codegen/generateJSX.js";

function rootAncestorId(store, id) {
	let current = id;
	while (current) {
		const parent = getParentId(store, current);
		if (parent === "ROOT" || parent === null) return getById(store, current) ? current : null;
		current = parent;
	}
	return null;
}
/**
* How a write changed the subtree hashes in the frame holding `anchorId`:
* `[id, before, after]` for every node whose hash moved (`after` null when the
* node is gone), and the hashes of nodes the write created. Main moves an
* agent's recorded read to `after` only when it still equals `before`.
*/
function coveringReadDelta(before, after, anchorId) {
	const rootId = rootAncestorId(before, anchorId) ?? rootAncestorId(after, anchorId);
	const changes = [];
	const created = {};
	if (rootId) {
		const was = hashAllElementSubtreesFrom(before, rootId);
		const now = hashAllElementSubtreesFrom(after, rootId);
		for (const [id, hash] of was) {
			const next = now.get(id) ?? null;
			if (next !== hash) changes.push([
				id,
				hash,
				next
			]);
		}
		for (const [id, hash] of now) if (!was.has(id)) created[id] = hash;
	}
	return {
		_coveringReadChanges: changes,
		_coveringReads: created
	};
}
/**
* The delta for a painted write (canvas_add, canvas_insert). Painting builds each
* step on the live store, so the user or another agent can commit in between;
* diffing against the live result would hand the agent their edits as read, and
* a later canvas_update would overwrite them. The hashes here come from the
* agent's own ops replayed on the store it started from: where nobody else
* changed anything they equal the live hashes, and where someone did they don't,
* so that read stays stale until the agent reads again.
*/
function paintedWriteReadDelta(before, ops, anchorId, createdRootIds) {
	const written = applyOperationsToStore(before, ops);
	const delta = anchorId ? coveringReadDelta(before, written, anchorId) : {
		_coveringReadChanges: [],
		_coveringReads: {}
	};
	for (const id of createdRootIds) for (const [nodeId, hash] of hashAllElementSubtreesFrom(written, id)) delta._coveringReads[nodeId] = hash;
	return delta;
}

export { coveringReadDelta, paintedWriteReadDelta, rootAncestorId };
