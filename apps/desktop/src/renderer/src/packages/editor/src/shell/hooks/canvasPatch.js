// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/canvasPatch.ts
import { canAcceptChild } from "../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getDescendantIds, getParentId, getRootIds } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { cloneElementWithNewIds } from "../../shared/utils/elementCloning.js";
import { applyOperationsToStore, createInsertOperation, createSetPropsOperation, createSetStylesOperation, createSetTextOperation } from "../../shared/utils/operations.js";
import { hashAllElementSubtreesFrom } from "../../../../compiler/src/codegen/generateJSX.js";
import { parseJSX } from "../../../../compiler/src/codegen/parseJSX.js";

/**
* Pure helpers for the agent canvas writes that both canvas handlers share:
* the legacy `useCanvasToolHandler` and the agents-v2 executor
* (`agent-canvas/execute.ts`). Parsing new elements, the outline a write
* returns, canvas_patch's per-id edits, canvas_duplicate's copies and the
* nesting check live here so the two tool surfaces cannot drift apart.
*/
/** Tag, component or icon name, for one-line descriptions of an element. */
function elementLabel(store, id) {
	const el = getById(store, id);
	if (!el) return id;
	if (el.type === "component") return el.componentName;
	if (el.type === "html") return el.tag;
	if (el.type === "icon") return el.iconName;
	return el.type;
}
/**
* New elements for canvas_add / canvas_insert, which accept several siblings.
* Agents often send siblings without a wrapper; a fragment makes them separate roots.
*/
function parseNewElements(jsx, iconLibraries, componentIndex) {
	try {
		return parseJSX(jsx, iconLibraries, componentIndex, void 0, {
			forceNewIds: true,
			silent: true
		});
	} catch (err) {
		if (!/Adjacent JSX elements/.test(String(err))) {
			console.error("Failed to parse JSX:", err);
			throw err;
		}
		return parseJSX(`<>${jsx}</>`, iconLibraries, componentIndex, void 0, { forceNewIds: true });
	}
}
var OUTLINE_TEXT_PREVIEW = 40;
/** The text an element shows directly: its own run, or its only child's. */
function directText(store, id) {
	const el = getById(store, id);
	if (!el) return null;
	if (el.type === "text") return el.text ?? el.children?.map((run) => run.text ?? "").join("") ?? null;
	const children = getChildren$2(store, id);
	if (children.length !== 1) return null;
	const only = getById(store, children[0]);
	return only?.type === "text" ? directText(store, only.id) : null;
}
/**
* Indented `tag id "text"` lines for new elements, so an agent can target any of
* them by id (canvas_patch, canvas_edit) without reading them back. A text node
* that is its parent's only child is folded into the parent's line as
* `(text <id>)`; canvas_patch `text` on the parent sets it, and its own id takes
* the run's className.
*/
function describeTreeForAgent(store, rootIds) {
	const lines = [];
	let omitted = 0;
	const visit = (id, depth) => {
		if (!getById(store, id)) return;
		if (lines.length >= 150) {
			omitted++;
			return;
		}
		const text = directText(store, id);
		const preview = text ? ` "${text.length > OUTLINE_TEXT_PREVIEW ? `${text.slice(0, OUTLINE_TEXT_PREVIEW)}…` : text}"` : "";
		const children = getChildren$2(store, id);
		const folded = children.length === 1 && getById(store, children[0])?.type === "text" ? children[0] : null;
		lines.push(`${"  ".repeat(depth)}- ${elementLabel(store, id)} ${id}${preview}${folded ? ` (text ${folded})` : ""}`);
		if (!folded) for (const child of children) visit(child, depth + 1);
	};
	for (const id of rootIds) visit(id, 0);
	if (omitted > 0) lines.push(`… ${omitted} more; find them with canvas_grep or canvas_query`);
	return lines.join("\n");
}
var COPY_ID_TABLE_MAX_IDS = 400;
/**
* Every copy's ids, one line per source node, for when the outline above is cut
* off: `- <source id>: <id in copy 1>, <id in copy 2>, …`. Past the cap only the
* copy roots are listed, so copying a whole screen stays short.
*/
function describeCopyIdsForAgent(sourceId, copiedFrom) {
	const bySource = /* @__PURE__ */ new Map([[sourceId, []]]);
	for (const [copyId, fromId] of copiedFrom) {
		const ids = bySource.get(fromId);
		if (ids) ids.push(copyId);
		else bySource.set(fromId, [copyId]);
	}
	const rows = copiedFrom.length > COPY_ID_TABLE_MAX_IDS ? [[sourceId, bySource.get(sourceId)]] : [...bySource];
	const note = rows.length < bySource.size ? "\nRead a copy with canvas_read for the ids inside it." : "";
	return `Ids in every copy, by source node, in copy order:\n${rows.map(([from, ids]) => `- ${from}: ${ids.join(", ")}`).join("\n")}${note}`;
}
function mergePatch(base, patch) {
	const next = { ...base ?? {} };
	for (const [key, value] of Object.entries(patch)) if (value === null) delete next[key];
	else next[key] = value;
	return next;
}
var isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
/**
* Operations for one canvas_patch entry, applied to `store`. Each field is set
* by id, so nothing depends on matching serialized JSX. Returns an error string
* when the entry cannot apply.
*/
function patchOperations(store, patch) {
	const id = typeof patch.element_id === "string" ? patch.element_id : "";
	const el = id ? getById(store, id) : void 0;
	if (!el) return `Element not found: ${id || "(missing element_id)"}`;
	const ops = [];
	let working = store;
	const push = (op) => {
		if (!op) return;
		ops.push(op);
		working = applyOperationsToStore(working, [op]);
	};
	if (patch.text !== void 0) {
		if (typeof patch.text !== "string") return `${id}: text must be a string`;
		let textId = el.type === "text" ? id : null;
		if (!textId) {
			const children = getChildren$2(working, id);
			const only = children.length === 1 ? getById(working, children[0]) : void 0;
			if (only?.type !== "text") return `${id}: has ${children.length} children, not a single text run. Patch the text element itself.`;
			textId = only.id;
		}
		push(createSetTextOperation(working, textId, { text: patch.text }));
	}
	if (patch.style !== void 0) {
		if (!isRecord(patch.style)) return `${id}: style must be an object`;
		push(createSetStylesOperation(working, id, mergePatch(getById(working, id).styles, patch.style)));
	}
	if (patch.props !== void 0 || patch.className !== void 0) {
		if (patch.props !== void 0 && !isRecord(patch.props)) return `${id}: props must be an object`;
		if (patch.className !== void 0 && typeof patch.className !== "string") return `${id}: className must be a string`;
		const nextProps = mergePatch(getById(working, id).props, patch.props ?? {});
		if (typeof patch.className === "string") nextProps.className = patch.className;
		if (el.type === "text") {
			if (patch.className !== void 0 || Object.prototype.hasOwnProperty.call(patch.props ?? {}, "className")) push(createSetPropsOperation(working, id, { className: nextProps.className ?? "" }));
		} else push(createSetPropsOperation(working, id, nextProps));
	}
	return {
		ops,
		store: working
	};
}
/**
* Group canvas_patch entries by the tab holding each element, applying each on
* that tab's working store. Ids from reads and searches can sit on different
* open pages; an entry that fails reports its error and the rest still apply.
*/
function planPatchesByTab(patches, storeFor) {
	const tabs = /* @__PURE__ */ new Map();
	const errors = [];
	for (const patch of patches) {
		const id = typeof patch.element_id === "string" ? patch.element_id : "";
		const found = id ? storeFor(id) : null;
		if (!found) {
			errors.push(`Element not found: ${id || "(missing element_id)"}`);
			continue;
		}
		let plan = tabs.get(found.tabId);
		if (!plan) {
			plan = {
				targetStore: found.store,
				store: found.store,
				ops: [],
				applied: []
			};
			tabs.set(found.tabId, plan);
		}
		const result = patchOperations(plan.store, patch);
		if (typeof result === "string") {
			errors.push(result);
			continue;
		}
		plan.ops.push(...result.ops);
		plan.store = result.store;
		plan.applied.push(id);
	}
	return {
		tabs,
		errors
	};
}
/** Source id → copy id for every node, walking the source and its clone in parallel. */
function clonedIdMap(source, clone, map = /* @__PURE__ */ new Map()) {
	map.set(source.id, clone.id);
	const sourceKids = source.children ?? [];
	const cloneKids = clone.children ?? [];
	sourceKids.forEach((kid, i) => {
		if (cloneKids[i]) clonedIdMap(kid, cloneKids[i], map);
	});
	return map;
}
/**
* `[copyNodeId, copyHash, sourceNodeId, sourceHash]` for every copied node. Main
* records the copy's hash only for a reader whose recorded source hash still
* equals `sourceHash`, so an agent that wrote or read the source can edit inside
* its copies without reading them again.
*/
function copiedCoveringReads(before, after, sourceId, copyIds, copiedFrom) {
	const sourceHashes = hashAllElementSubtreesFrom(before, sourceId);
	const copyHashes = /* @__PURE__ */ new Map();
	for (const id of copyIds) for (const [nodeId, hash] of hashAllElementSubtreesFrom(after, id)) copyHashes.set(nodeId, hash);
	const out = [];
	for (const [copyNodeId, sourceNodeId] of copiedFrom) {
		const copyHash = copyHashes.get(copyNodeId);
		const sourceHash = sourceHashes.get(sourceNodeId);
		if (copyHash && sourceHash) out.push([
			copyNodeId,
			copyHash,
			sourceNodeId,
			sourceHash
		]);
	}
	return out;
}
/**
* Whether a node goes by `name`: its layer name, or the `name` attribute. A layer
* name never appears in canvas_read, so the attribute is the name agents see.
*/
function hasName(el, name) {
	if (!el) return false;
	if (el.name?.trim() === name) return true;
	const attr = "props" in el ? el.props?.name : void 0;
	return typeof attr === "string" && attr.trim() === name;
}
/**
* canvas_duplicate with `copies`: one clone of `sourceId` per entry, inserted in
* order from `dest`, each with its entry's changes applied. An entry maps a node
* in the source subtree (its id, or its name for every node with that name; see
* `hasName`) to canvas_patch fields. A key that matches nothing is reported, not fatal.
* `copiedFrom` pairs every node of every copy with the source node it was cloned from.
*/
function duplicateOperations(store, sourceId, entries, dest, placeRoot = () => {}) {
	if (entries.length > 50) return `copies takes at most 50 entries`;
	const bad = entries.findIndex((entry) => !isRecord(entry));
	if (bad !== -1) return `copies[${bad}] must be an object`;
	const source = storeSubtreeToLegacyNested(store, sourceId);
	const sourceIds = [sourceId, ...getDescendantIds(store, sourceId)];
	const ops = [];
	const copyIds = [];
	const copiedFrom = [];
	const errors = [];
	let working = store;
	entries.forEach((entry, i) => {
		const clone = cloneElementWithNewIds(source, {
			x: 0,
			y: 0
		});
		if (dest.parentId === null) placeRoot(clone);
		else delete clone.canvasPosition;
		const insert = createInsertOperation(clone, dest.parentId, dest.index + i);
		ops.push(insert);
		working = applyOperationsToStore(working, [insert]);
		copyIds.push(clone.id);
		const idMap = clonedIdMap(source, clone);
		for (const [sourceNodeId, copyNodeId] of idMap) copiedFrom.push([copyNodeId, sourceNodeId]);
		for (const [key, fields] of Object.entries(entry)) {
			const targets = idMap.has(key) ? [idMap.get(key)] : sourceIds.filter((id) => hasName(getById(store, id), key)).map((id) => idMap.get(id));
			if (targets.length === 0) {
				errors.push(`copies[${i}]: no element with id or name "${key}" in ${sourceId}`);
				continue;
			}
			if (!isRecord(fields)) {
				errors.push(`copies[${i}].${key}: must be an object of text / style / className / props`);
				continue;
			}
			for (const target of targets) {
				const result = patchOperations(working, {
					...fields,
					element_id: target
				});
				if (typeof result === "string") {
					errors.push(`copies[${i}].${key}: ${result}`);
					continue;
				}
				ops.push(...result.ops);
				working = result.store;
			}
		}
	});
	return {
		ops,
		copyIds,
		copiedFrom,
		errors
	};
}
/**
* Indented outline of the nodes in `elementId`'s subtree that were not there
* before, so an edit that adds children reports their ids like an insert does.
*/
function describeAddedForAgent(store, elementId, before) {
	const added = new Set(getDescendantIds(store, elementId).filter((id) => !before.has(id)));
	const roots = [...added].filter((id) => !added.has(getParentId(store, id) ?? ""));
	return roots.length > 0 ? `\nNew elements:\n${describeTreeForAgent(store, roots)}` : "";
}
/**
* First parent/child pair in the new elements that the store would refuse,
* checked before painting so a bad chunk fails whole instead of leaving half
* a section on the canvas.
*/
function invalidNesting(parsed, parent) {
	const check = (owner, id) => {
		const el = getById(parsed, id);
		if (!el) return null;
		if (owner && !canAcceptChild(owner, el)) {
			const tag = (x) => "tag" in x ? `<${x.tag}>` : x.type;
			return `${tag(owner)} cannot contain ${tag(el)}. Nothing was added; fix the markup and retry.`;
		}
		for (const child of getChildren$2(parsed, id)) {
			const problem = check(el, child);
			if (problem) return problem;
		}
		return null;
	};
	for (const rootId of getRootIds(parsed)) {
		const problem = check(parent, rootId);
		if (problem) return problem;
	}
	return null;
}

export { copiedCoveringReads, describeAddedForAgent, describeCopyIdsForAgent, describeTreeForAgent, duplicateOperations, elementLabel, invalidNesting, parseNewElements, planPatchesByTab };
