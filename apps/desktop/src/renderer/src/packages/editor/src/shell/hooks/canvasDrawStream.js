// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/canvasDrawStream.ts
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { getById } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createInsertOperation, createRemoveOperation, createReplaceOperation } from "../../shared/utils/operations.js";

var STREAM_MIN_CHILDREN = 2;
var STREAM_MIN_NODES = 6;
function sanitizeDrawStreamId(streamId) {
	return streamId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "draw";
}
function countNestedNodes(element) {
	const children = element.children;
	if (!Array.isArray(children) || children.length === 0) return 1;
	return 1 + children.reduce((sum, child) => sum + countNestedNodes(child), 0);
}
function nextPaint() {
	return new Promise((resolve) => {
		let frame = 0;
		const limit = setTimeout(() => {
			cancelAnimationFrame(frame);
			resolve();
		}, 50);
		frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				clearTimeout(limit);
				resolve();
			});
		});
	});
}
function shouldStreamNested(element) {
	return (element.children?.length ?? 0) >= STREAM_MIN_CHILDREN && countNestedNodes(element) >= STREAM_MIN_NODES;
}
/**
* Insert `nested`, painting large trees node by node so the user watches it build.
*
* Painting yields between frames, and other writers — the user, another agent —
* can commit in those gaps. `current` returns the latest store to build on; each
* step applies on top of it, so their edits survive instead of being overwritten
* by a copy taken before them. It receives this paint's own last store, which is
* the right answer when nothing else can write the target (the default).
*
* `publish` receives the ops so the caller can stage them into a page
* transaction. The returned store is `current` plus those ops, not a second
* apply of whatever `publish` already committed.
*/
async function insertNestedWithPaint(store, nested, parentId, index, publish, current = (own) => own) {
	const children = (nested.children ?? []).filter((child) => !!child && typeof child === "object" && "type" in child);
	const base = current(store);
	if (parentId !== null && !getById(base, parentId)) throw new Error(`Parent element not found: ${parentId}`);
	if (!shouldStreamNested(nested)) {
		const op = createInsertOperation(nested, parentId, index);
		(0, import_react_dom.flushSync)(() => publish([op]));
		return applyOperationsToStore(base, [op]);
	}
	const shellOp = createInsertOperation({
		...nested,
		children: void 0
	}, parentId, index);
	(0, import_react_dom.flushSync)(() => publish([shellOp]));
	let next = applyOperationsToStore(base, [shellOp]);
	await nextPaint();
	let childIndex = 0;
	for (const child of children) {
		next = await insertNestedWithPaint(next, child, nested.id, childIndex, publish, current);
		childIndex += 1;
	}
	return next;
}
function dropPreviewRootOps(store, previews, tabId) {
	const ops = [];
	const removed = [];
	let next = store;
	for (const preview of previews) {
		if (preview.tabId !== tabId) continue;
		if (!getById(next, preview.rootId)) continue;
		const op = createRemoveOperation(next, preview.rootId);
		if (!op) continue;
		next = applyOperationsToStore(next, [op]);
		ops.push(op);
		removed.push(preview);
	}
	return {
		ops,
		removed
	};
}
function replacePreviewRootOp(store, preview, nested) {
	const previous = getById(store, preview.rootId);
	if (!previous) return null;
	nested.id = preview.rootId;
	if (previous.canvasPosition && !nested.canvasPosition) nested.canvasPosition = previous.canvasPosition;
	return createReplaceOperation(store, preview.rootId, nested);
}

export { dropPreviewRootOps, insertNestedWithPaint, replacePreviewRootOp, sanitizeDrawStreamId };
