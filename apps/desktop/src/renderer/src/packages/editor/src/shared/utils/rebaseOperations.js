// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/rebaseOperations.ts
import { getById, getParentId } from "../../../../compiler/src/store/read.js";
import { applyOperationToStore, createRemoveOperation, createReplaceOperation } from "./operations.js";

/**
* Element ids an operation reads or writes: its target, every node of an
* inserted, removed or replaced subtree, and the parents it inserts into or
* moves between.
*/
function operationElementIds(op) {
	switch (op.type) {
		case "insert": return op.parentId ? [...subtreeIds(op.element), op.parentId] : subtreeIds(op.element);
		case "remove": return op.parentId ? [...subtreeIds(op.element), op.parentId] : subtreeIds(op.element);
		case "replace": return [...subtreeIds(op.oldElement), ...subtreeIds(op.newElement)];
		case "move": return [
			op.elementId,
			op.fromParentId,
			op.toParentId
		].filter((id) => !!id);
		default: return [op.elementId];
	}
}
function subtreeIds(element) {
	const ids = [];
	const stack = [element];
	while (stack.length > 0) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		if (typeof node.id === "string") ids.push(node.id);
		if (Array.isArray(node.children)) stack.push(...node.children);
	}
	return ids;
}
function sameValue$1(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return a == null && b == null;
	if (typeof a !== "object" || typeof b !== "object") return false;
	try {
		return JSON.stringify(a) === JSON.stringify(b);
	} catch {
		return false;
	}
}
/**
* Re-target a record op (props or styles) at the current value: only the keys
* the op changes, and only where the current value is still the op's `from`.
* Returns null when nothing is left to change.
*/
function rebaseRecord(current, from, to) {
	const base = current ?? {};
	const next = { ...base };
	let changed = false;
	for (const key of /* @__PURE__ */ new Set([...Object.keys(from ?? {}), ...Object.keys(to ?? {})])) {
		const fromValue = from?.[key];
		const toValue = to?.[key];
		if (sameValue$1(fromValue, toValue) || !sameValue$1(base[key], fromValue)) continue;
		if (toValue === void 0) delete next[key];
		else next[key] = toValue;
		changed = true;
	}
	return changed ? next : null;
}
/**
* Rewrite an op for a store that someone else has edited since the op was
* recorded. A field is only set when it still holds the op's `from` value, so
* a later edit by another actor survives. Returns null when the op no longer
* applies.
*/
function rebaseOperation(store, op) {
	if (op.type === "remove") return createRemoveOperation(store, op.elementId);
	if (op.type === "replace") return createReplaceOperation(store, op.oldElement.id, op.newElement);
	if (op.type === "insert" || op.type === "move") return op;
	const element = getById(store, op.elementId);
	if (!element) return null;
	switch (op.type) {
		case "set_props": {
			const props = rebaseRecord(element.props, op.oldProps, op.newProps);
			return props ? {
				...op,
				oldProps: element.props,
				newProps: props
			} : null;
		}
		case "set_styles": {
			const styles = rebaseRecord(element.styles, op.oldStyles, op.newStyles);
			return styles ? {
				...op,
				oldStyles: element.styles,
				newStyles: styles
			} : null;
		}
		case "set_position": return sameValue$1(element.canvasPosition, op.oldPosition) ? op : null;
		case "set_name": return sameValue$1(element.name, op.oldName) ? op : null;
		case "set_export_settings": return sameValue$1(element.exportSettings, op.oldSettings) ? op : null;
		case "set_text": return sameValue$1(element.text || void 0, op.oldText || void 0) && sameValue$1(element.children, op.oldChildren) ? op : null;
	}
}
/**
* Apply ops recorded against an earlier store. Ops on elements for which
* `changedSince` is true are rebased onto the current values, and skipped if
* they no longer apply. Other ops apply exactly as recorded. When every op
* applies as recorded, `applied` is the `ops` array itself.
*/
function applyOperationsOntoChangedStore(store, ops, changedSince) {
	const applied = [];
	let next = store;
	for (const op of ops) {
		if (!operationElementIds(op).some(changedSince)) {
			next = applyOperationToStore(next, op);
			applied.push(op);
			continue;
		}
		const rebased = rebaseOperation(next, op);
		if (!rebased || !parentAllowsMove(next, rebased)) continue;
		try {
			next = applyOperationToStore(next, rebased);
			applied.push(rebased);
		} catch {}
	}
	const unchanged = applied.length === ops.length && applied.every((op, i) => op === ops[i]);
	return {
		store: next,
		applied: unchanged ? ops : applied
	};
}
/** A move only rewinds while the element is still where the op left it. */
function parentAllowsMove(store, op) {
	if (op.type !== "move") return true;
	const parent = getParentId(store, op.elementId);
	return (parent === "ROOT" ? null : parent ?? null) === op.fromParentId;
}

export { applyOperationsOntoChangedStore, operationElementIds };
