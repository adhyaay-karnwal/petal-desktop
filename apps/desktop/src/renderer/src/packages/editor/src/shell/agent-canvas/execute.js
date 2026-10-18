// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/agent-canvas/execute.ts
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getById, getChildren$2, getDescendantIds, getIndex, getParentId, getRootIds } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { applyOperationsToStore, createInsertOperation, createRemoveOperation, createReplaceOperation, createSetNameOperation } from "../../shared/utils/operations.js";
import { usePages } from "../../shared/state/pages.js";
import { generateJSX, generateJSXWithinBudget, hashAllElementSubtreesFrom, hashElementSubtreeFrom, jsxContainsTruncationStub } from "../../../../compiler/src/codegen/generateJSX.js";
import { parseJSX } from "../../../../compiler/src/codegen/parseJSX.js";
import { parseJSXPartial } from "../../../../compiler/src/codegen/parseJSXPartial.js";
import { ancestorChainMatchesQuery, applyJsxStringEdit, lintNewlyIntroducedRawHtmlControls, lintRawHtmlControls, matchElementGrep, normalizeUpdateSubtree, summarizeSubtreeChange } from "../../../../compiler/src/codegen/canvasAiEdit.js";
import { dropPreviewRootOps, insertNestedWithPaint, replacePreviewRootOp, sanitizeDrawStreamId } from "../hooks/canvasDrawStream.js";
import { resolveDuplicateDestination } from "../hooks/duplicateDestination.js";
import { UNKNOWN_ROOT_WIDTH, nextRootPlacement } from "../hooks/nextRootPlacement.js";
import { isDrawPreviewId, occupiedRootBoxes, rootOccupancyBox } from "../hooks/rootBoxes.js";
import { coveringReadDelta, paintedWriteReadDelta, rootAncestorId } from "../hooks/coveringReadDelta.js";
import { copiedCoveringReads, describeAddedForAgent, describeCopyIdsForAgent, describeTreeForAgent, duplicateOperations, elementLabel, invalidNesting, parseNewElements, planPatchesByTab } from "../hooks/canvasPatch.js";

/**
* agents-v2 canvas command executor.
*
* The v2 canvas host. Each `AgentCanvasCommandType` is a camelCase method that
* takes the command's typed `args` and resolves the command's structured data,
* or throws an `Error`. A `satisfies CanvasHost` map turns a new command type
* into a compile error until it is implemented here.
*
* `executeCanvasCommand` catches those errors and returns the wire outcome
* (`{ ok: true; data } | { ok: false; error }`) the IPC reply carries — the
* renderer cannot throw across the process boundary.
*
* This is a deliberate duplicate of the legacy `useCanvasToolHandler`
* (`canvas_tool_request`) implementation so the v2 path can evolve without
* touching v1. There is no shared code between the two.
*
* Nothing here locks an element. Each read and write marks its frame with the
* agent's presence, and writes report how they changed the subtree hashes the
* agent has read, so `canvas_update`/`canvas_delete` can refuse to overwrite
* edits the agent has not seen.
*/
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var GREP_MAX_RESULTS = 40;
var QUERY_MAX_RESULTS = 100;
function chatTabIdOf(args) {
	const value = args.chatTabId;
	return typeof value === "string" && value ? value : void 0;
}
/** The agent behind a command, when main tagged one. */
function agentOf(args) {
	const agentId = args.agentId;
	if (typeof agentId !== "string" || !agentId) return null;
	return {
		agentId,
		chatTabId: chatTabIdOf(args)
	};
}
/**
* True when `elementId`'s subtree still hashes to what the agent last read.
* canvas_update and canvas_delete discard the subtree, so anything the agent
* has not seen — the user's edit, another agent's — must stop them.
*/
function isSubtreeAsRead(store, elementId, expectedHash) {
	return typeof expectedHash === "string" && hashElementSubtreeFrom(store, elementId) === expectedHash;
}
function changedSinceReadMessage(elementId) {
	return `${elementId} changed since you last read it, so this would overwrite edits you have not seen. canvas_read it again, then retry.`;
}
/** The typed result fields for a write's covering-read delta. */
function readUpdate(delta) {
	return {
		coveringReads: delta._coveringReads,
		coveringReadChanges: delta._coveringReadChanges
	};
}
function placeNewRoot(store, nested) {
	nested.canvasPosition = nextRootPlacement(occupiedRootBoxes(store));
}
function describeRootForAgent(store, id) {
	const el = getById(store, id);
	if (!el || isDrawPreviewId(id)) return null;
	const box = rootOccupancyBox(store, id);
	if (!box) return null;
	return {
		id,
		name: el.name?.trim() || (el.type === "component" ? el.componentName : "tag" in el ? el.tag : el.type),
		x: Math.round(box.x),
		y: Math.round(box.y),
		width: Math.round(box.width),
		height: Math.round(box.height)
	};
}
/** Fresh tree of a loaded page; undefined while it is still being fetched. */
function pageTree(pageId) {
	return usePages.getState().pages.get(pageId)?.tree;
}
/** The loaded page holding an element, preferring the active page when ids overlap. */
function findElementPage(elementId) {
	const { pages, activePageId } = usePages.getState();
	const active = activePageId === null ? void 0 : pages.get(activePageId);
	if (active && getById(active.tree, elementId)) return {
		tabId: activePageId,
		store: active.tree
	};
	for (const [tabId, { tree }] of pages) if (getById(tree, elementId)) return {
		tabId,
		store: tree
	};
	return null;
}
/** Commit ops on any page. Tagged 'ai' so they stay out of the user's undo
*  stack and don't count as a human edit. */
function commitAi(pageId, ops) {
	usePages.getState().applyOps(ops, {
		pageId,
		source: "ai"
	});
}
/** Paint already-computed ops without history (progressive previews). */
function paintPage(pageId, ops) {
	usePages.getState().applyTransientOps(ops, pageId);
}
function subtreeIdSet(store, elementId) {
	return /* @__PURE__ */ new Set([elementId, ...getDescendantIds(store, elementId)]);
}
function allStoreIdSet(store) {
	return new Set(store.byId.keys());
}
/** Descendants-or-self matching a space-separated tag/component selector. */
function queryCanvasIds(store, rootId, selector) {
	const parts = selector.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return [];
	const roots = rootId ? [rootId] : [...getRootIds(store)];
	const results = [];
	function matchesPath(id) {
		const chain = [];
		let cur = id;
		while (cur && cur !== "ROOT") {
			chain.unshift(cur);
			const parent = getParentId(store, cur);
			cur = parent && parent !== "ROOT" ? parent : null;
		}
		let nodes = chain;
		if (rootId) {
			const idx = chain.indexOf(rootId);
			if (idx === -1) return false;
			nodes = chain.slice(idx);
		}
		return ancestorChainMatchesQuery(nodes.map((nodeId) => getById(store, nodeId)).filter((el) => !!el).map((el) => el), parts);
	}
	for (const r of roots) {
		const candidates = [r, ...getDescendantIds(store, r)];
		for (const id of candidates) if (matchesPath(id)) {
			results.push(id);
			if (results.length >= QUERY_MAX_RESULTS) return results;
		}
	}
	return results;
}
/** First "Page", "Page 2", … not taken by an existing tab or an in-flight creation. */
function nextDefaultPageName(tabs, pending) {
	const taken = new Set(tabs.map((tab) => tab.name.trim().toLocaleLowerCase()));
	for (const name of pending) taken.add(name);
	for (let n = 1;; n++) {
		const candidate = n === 1 ? "Page" : `Page ${n}`;
		if (!taken.has(candidate.toLocaleLowerCase())) return candidate;
	}
}
/**
* The v2 canvas host: every command implemented against the canvas Store with
* camelCase args. Each resolves the command's structured data, or throws.
*/
function createCanvasHost(deps, refs) {
	const { tabs, activeTabIdRef, iconLibraries, componentIndex, touchAgentPresence } = deps;
	const currentTabs = tabs;
	const activeTabId = () => activeTabIdRef.current;
	const findElementTab = findElementPage;
	const latestStoreFor = (tabId) => (own) => pageTree(tabId) ?? own;
	const dropPreviewsOnTab = (tabId, store) => {
		const { ops, removed } = dropPreviewRootOps(store, refs.drawPreviewsRef.current.values(), tabId);
		for (const preview of removed) refs.drawPreviewsRef.current.delete(preview.streamId);
		if (ops.length > 0) {
			(0, import_react_dom.flushSync)(() => paintPage(tabId, ops));
			return applyOperationsToStore(store, ops);
		}
		return store;
	};
	/** Mark the frames holding `ids` as the commanding agent's. */
	const notePresence = (args, store, ids, kind) => {
		const agent = agentOf(args);
		if (!agent) return;
		const rootIds = /* @__PURE__ */ new Set();
		for (const id of ids) {
			const rootId = rootAncestorId(store, id);
			if (rootId && !isDrawPreviewId(rootId)) rootIds.add(rootId);
		}
		if (rootIds.size > 0) touchAgentPresence([...rootIds], agent, kind);
	};
	return {
		async readCanvas(args) {
			const canvasId = args.canvasId;
			const elementId = args.elementId;
			const tab = currentTabs.find((t) => t.canvasId === canvasId || t.id === canvasId);
			if (!tab) throw new Error(`Canvas not found: ${canvasId}`);
			const store = pageTree(tab.id);
			if (!store) throw new Error(`Canvas not loaded: ${canvasId}`);
			if (elementId) {
				if (!getById(store, elementId)) throw new Error(`Element not found: ${elementId}`);
				const { jsx, stubbedIds } = generateJSXWithinBudget(store, {
					includeDataElementId: true,
					rootId: elementId
				});
				const hashes = hashAllElementSubtreesFrom(store, elementId, stubbedIds);
				notePresence(args, store, [elementId], "read");
				return {
					text: jsx,
					coveringReads: Object.fromEntries(hashes)
				};
			}
			const jsx = generateJSX(store, 0, { includeDataElementId: true });
			const rootIds = getRootIds(store);
			if (jsx.length > 8e3) {
				const summary = rootIds.map((id) => {
					const el = getById(store, id);
					if (!el) return `- ${id} (missing)`;
					const childCount = getChildren$2(store, id).length;
					return `- ${el.type === "component" ? el.componentName : "tag" in el ? el.tag : el.type} id="${el.id}"${childCount > 0 ? ` (${childCount} children)` : ""}`;
				}).join("\n");
				return {
					text: `${rootIds.length} top-level elements:\n${summary}\n\nUse canvas_read with element_id to read specific elements.`,
					truncated: true
				};
			}
			const hashes = /* @__PURE__ */ new Map();
			for (const rootId of rootIds) for (const [id, hash] of hashAllElementSubtreesFrom(store, rootId)) hashes.set(id, hash);
			return {
				text: jsx,
				coveringReads: Object.fromEntries(hashes)
			};
		},
		async listPages() {
			const pages = currentTabs.map((t) => {
				const store = pageTree(t.id);
				const roots = store ? getRootIds(store).map((id) => describeRootForAgent(store, id)).filter((root) => !!root) : [];
				return {
					id: t.canvasId || t.id,
					name: t.name,
					loaded: !!store,
					active: t.id === activeTabId(),
					rootCount: roots.length,
					roots
				};
			});
			const active = pages.find((page) => page.active);
			return {
				pages,
				note: active && active.rootCount > 0 ? `Active page "${active.name}" already has ${active.rootCount} top-level frame(s). New root canvas_add is auto-placed to their right — do not draw on top of existing work. To change existing work, edit those ids.` : "Active page is empty. New root canvas_add starts at the origin."
			};
		},
		async createPage(args) {
			const requestedName = typeof args.name === "string" && args.name.trim() ? args.name.trim() : null;
			const name = requestedName ?? nextDefaultPageName(currentTabs, new Set(refs.pendingPageCreationsRef.current.keys()));
			const normalizedName = name.toLocaleLowerCase();
			const existing = requestedName ? currentTabs.find((tab) => tab.name.trim().toLocaleLowerCase() === normalizedName) : void 0;
			if (existing) {
				const id = existing.canvasId || existing.id;
				if (existing.id !== activeTabId()) throw new Error(`Page "${existing.name}" already exists (id ${id}) but is not active. Open that page before continuing; a duplicate was not created.`);
				return {
					id,
					name: existing.name,
					reused: true
				};
			}
			let creation = refs.pendingPageCreationsRef.current.get(normalizedName);
			const joinedInFlight = !!creation;
			if (!creation) {
				creation = deps.createCanvasPage(name);
				refs.pendingPageCreationsRef.current.set(normalizedName, creation);
				creation.catch(() => {}).finally(() => refs.pendingPageCreationsRef.current.delete(normalizedName));
			}
			const res = await creation;
			if (!res.success || !res.id) throw new Error(`Failed to create page: ${res.error || "unknown error"}`);
			return {
				id: res.id,
				name: res.name ?? name,
				reused: joinedInFlight
			};
		},
		async searchIcons(args) {
			const query = args.query.toLowerCase();
			const icons = [];
			for (const [, lib] of Object.entries(iconLibraries)) {
				if (lib.icons) {
					for (const iconName of Object.keys(lib.icons)) if (iconName.toLowerCase().includes(query)) {
						icons.push(iconName);
						if (icons.length >= 20) break;
					}
				}
				if (icons.length >= 20) break;
			}
			return { icons };
		},
		async previewDrop() {
			const store = pageTree(activeTabId());
			if (store) dropPreviewsOnTab(activeTabId(), store);
			return {};
		},
		async previewDraw(args) {
			if ((typeof args.issuedAt === "number" ? args.issuedAt : Date.now()) < refs.lastCommitAtRef.current) return { status: "stale" };
			const jsx = typeof args.jsx === "string" ? args.jsx : "";
			if (jsx.trim().length < 16) return { status: "skipped" };
			const streamId = typeof args.streamId === "string" && args.streamId ? args.streamId : "default";
			const parsed = parseJSXPartial(jsx, iconLibraries, componentIndex, void 0, { stableIdPrefix: `el-draw-${sanitizeDrawStreamId(streamId)}` });
			if (!parsed) return { status: "unparsed" };
			const previewRootIds = getRootIds(parsed.store);
			if (previewRootIds.length === 0) return { status: "empty" };
			const nested = storeSubtreeToLegacyNested(parsed.store, previewRootIds[0]);
			const existing = refs.drawPreviewsRef.current.get(streamId);
			if (existing && existing.tabId === activeTabId()) {
				const targetStore = pageTree(existing.tabId);
				const op = targetStore ? replacePreviewRootOp(targetStore, existing, nested) : null;
				if (op) {
					if (existing.rootId !== nested.id) refs.drawPreviewsRef.current.set(streamId, {
						...existing,
						rootId: nested.id
					});
					(0, import_react_dom.flushSync)(() => paintPage(existing.tabId, [op]));
				}
				return { status: "updated" };
			}
			const parentId = typeof args.parentId === "string" ? args.parentId : void 0;
			let targetTabId = activeTabId();
			let targetStore = pageTree(targetTabId);
			let insertParent = null;
			if (parentId) {
				const found = findElementTab(parentId);
				if (!found || found.tabId !== activeTabId()) return { status: "parent-unavailable" };
				targetTabId = found.tabId;
				targetStore = found.store;
				insertParent = parentId;
			}
			const targetTab = currentTabs.find((t) => t.id === targetTabId);
			if (!targetTab?.canvasId || !UUID_RE.test(targetTab.canvasId) || !targetStore) return { status: "canvas-not-ready" };
			if (!insertParent) placeNewRoot(targetStore, nested);
			const insertIndex = insertParent ? getChildren$2(targetStore, insertParent).length : getRootIds(targetStore).length;
			refs.drawPreviewsRef.current.set(streamId, {
				streamId,
				rootId: nested.id,
				tabId: targetTabId
			});
			(0, import_react_dom.flushSync)(() => paintPage(targetTabId, [createInsertOperation(nested, insertParent, insertIndex)]));
			return { status: "inserted" };
		},
		async grepCanvas(args) {
			const patternStr = args.pattern;
			const flags = args.caseInsensitive ? "i" : "";
			let regex;
			try {
				regex = new RegExp(patternStr, flags);
			} catch (e) {
				throw new Error(`Invalid regex: ${e.message}`);
			}
			let store = pageTree(activeTabId());
			let rootId = typeof args.rootId === "string" ? args.rootId : null;
			if (args.canvasId) {
				const tab = currentTabs.find((t) => t.canvasId === args.canvasId || t.id === args.canvasId);
				if (!tab) throw new Error(`Canvas not found: ${args.canvasId}`);
				store = pageTree(tab.id);
				if (!store) throw new Error(`Canvas not loaded: ${args.canvasId}`);
			}
			if (!store) throw new Error("Canvas not loaded");
			if (rootId) {
				const found = findElementTab(rootId);
				if (!found || !getById(found.store, rootId)) throw new Error(`Element not found: ${rootId}`);
				store = found.store;
			}
			const candidates = rootId ? [rootId, ...getDescendantIds(store, rootId)] : [...getRootIds(store)].flatMap((id) => [id, ...getDescendantIds(store, id)]);
			const hits = /* @__PURE__ */ new Map();
			for (const id of candidates) {
				const hit = matchElementGrep(id, generateJSX(ensureV2([storeSubtreeToLegacyNested(store, id)]), 0, { includeDataElementId: true }), new RegExp(regex.source, regex.flags));
				if (hit) hits.set(id, hit.snippet);
			}
			const shadowed = /* @__PURE__ */ new Set();
			for (const id of hits.keys()) {
				let parent = getParentId(store, id);
				while (parent && parent !== "ROOT") {
					if (hits.has(parent)) shadowed.add(parent);
					parent = getParentId(store, parent);
				}
			}
			const matches = [];
			for (const [id, snippet] of hits) {
				if (shadowed.has(id)) continue;
				matches.push(`- ${id} (${elementLabel(store, id)}): ${snippet}`);
				if (matches.length >= GREP_MAX_RESULTS) break;
			}
			const kept = hits.size - shadowed.size;
			const truncated = kept > GREP_MAX_RESULTS ? `\n… truncated at ${GREP_MAX_RESULTS} of ${kept} matches` : "";
			return { text: matches.length > 0 ? `${matches.length} match(es):\n${matches.join("\n")}${truncated}` : `No matches for /${patternStr}/` };
		},
		async queryCanvas(args) {
			const selector = args.selector;
			let store = pageTree(activeTabId());
			let rootId = typeof args.rootId === "string" ? args.rootId : null;
			if (args.canvasId) {
				const tab = currentTabs.find((t) => t.canvasId === args.canvasId || t.id === args.canvasId);
				if (!tab) throw new Error(`Canvas not found: ${args.canvasId}`);
				store = pageTree(tab.id);
				if (!store) throw new Error(`Canvas not loaded: ${args.canvasId}`);
			}
			if (!store) throw new Error("Canvas not loaded");
			if (rootId) {
				const found = findElementTab(rootId);
				if (!found || !getById(found.store, rootId)) throw new Error(`Element not found: ${rootId}`);
				store = found.store;
			}
			const ids = queryCanvasIds(store, rootId, selector);
			const lines = ids.map((id) => `- ${id} (${elementLabel(store, id)})`);
			return { text: ids.length > 0 ? `${ids.length} element(s) matching "${selector}":\n${lines.join("\n")}` : `No elements matching "${selector}"` };
		},
		async addToCanvas(args) {
			const canvasId = args.canvasId;
			const parentId = args.parentId;
			const jsx = args.jsx;
			if (typeof jsx === "string" && jsxContainsTruncationStub(jsx)) throw new Error("jsx contains petal:truncated stubs from a truncated canvas_read. To copy existing work, use canvas_duplicate instead of re-sending its JSX.");
			const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
			if (lintErr) throw new Error(lintErr);
			const parsed = parseNewElements(jsx, iconLibraries, componentIndex);
			const parsedRootIds = getRootIds(parsed);
			if (parsedRootIds.length === 0) throw new Error("Failed to parse JSX");
			let targetTabId = activeTabId();
			if (canvasId) {
				const tab = currentTabs.find((t) => t.canvasId === canvasId || t.id === canvasId);
				if (!tab) throw new Error(`Canvas not found: ${canvasId}`);
				if (tab.id !== activeTabId()) throw new Error(`canvas_add can only write to the active canvas page. "${tab.name}" is not active; ask the user to open it, or call canvas_create_page to create and activate a new page.`);
				targetTabId = tab.id;
			}
			if (parentId) {
				const found = findElementTab(parentId);
				if (found) {
					if (found.tabId !== activeTabId()) throw new Error("canvas_add can only write to the active canvas page. The parent element is on a different page; ask the user to open that page first.");
					targetTabId = found.tabId;
				}
			}
			const targetStore = pageTree(targetTabId);
			if (!targetStore) throw new Error("Canvas not available");
			if (parentId && !getById(targetStore, parentId)) throw new Error(`Parent element not found: ${parentId}`);
			const nestingError = invalidNesting(parsed, parentId ? getById(targetStore, parentId) : null);
			if (nestingError) throw new Error(nestingError);
			const targetCanvasId = currentTabs.find((t) => t.id === targetTabId)?.canvasId;
			if (!targetCanvasId || !UUID_RE.test(targetCanvasId)) throw new Error(`Canvas not yet loaded — pages are still bootstrapping. Wait a moment and retry. (Internal: target canvasId is '${targetCanvasId ?? "undefined"}', not a UUID.)`);
			refs.lastCommitAtRef.current = Date.now();
			let workingStore = dropPreviewsOnTab(targetTabId, targetStore);
			const storeBefore = workingStore;
			const tx = usePages.getState().transaction(targetTabId);
			const latest = latestStoreFor(targetTabId);
			const recorded = [];
			const explicitX = typeof args.x === "number" ? args.x : null;
			const explicitY = typeof args.y === "number" ? args.y : null;
			let xCursor = explicitX;
			const insertedIds = [];
			try {
				for (const rootId of parsedRootIds) {
					workingStore = latest(workingStore);
					const nested = storeSubtreeToLegacyNested(parsed, rootId);
					insertedIds.push(rootId);
					if (parentId) {
						const index = getById(workingStore, parentId) ? getChildren$2(workingStore, parentId).length : 0;
						recorded.push(createInsertOperation(nested, parentId, index));
						workingStore = await insertNestedWithPaint(workingStore, nested, parentId, index, (ops) => tx.stage(ops), latest);
					} else {
						const auto = nextRootPlacement(occupiedRootBoxes(workingStore));
						nested.canvasPosition = {
							x: xCursor ?? auto.x,
							y: explicitY ?? auto.y
						};
						if (xCursor !== null) xCursor += UNKNOWN_ROOT_WIDTH + 40;
						const index = getRootIds(workingStore).length;
						recorded.push(createInsertOperation(nested, null, index));
						workingStore = await insertNestedWithPaint(workingStore, nested, null, index, (ops) => tx.stage(ops), latest);
					}
				}
				if (recorded.length > 0) tx.commit({
					source: "ai",
					ops: recorded
				});
			} catch (err) {
				tx.discard();
				throw err;
			}
			notePresence(args, workingStore, parentId ? [parentId] : insertedIds, "write");
			return {
				elementIds: insertedIds,
				outline: describeTreeForAgent(pageTree(targetTabId) ?? workingStore, insertedIds),
				...readUpdate(paintedWriteReadDelta(storeBefore, recorded, parentId ?? null, insertedIds))
			};
		},
		async insertElement(args) {
			const jsx = args.jsx;
			const beforeId = typeof args.beforeId === "string" ? args.beforeId : void 0;
			const afterId = typeof args.afterId === "string" ? args.afterId : void 0;
			const parentId = typeof args.parentId === "string" ? args.parentId : void 0;
			const modeCount = [
				beforeId,
				afterId,
				parentId
			].filter(Boolean).length;
			if (!jsx) throw new Error("jsx is required");
			if (modeCount !== 1) throw new Error("Provide exactly one of before_id, after_id, or parent_id.");
			const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
			if (lintErr) throw new Error(lintErr);
			const anchorId = beforeId || afterId || parentId;
			const found = findElementTab(anchorId);
			if (!found || !getById(found.store, anchorId)) throw new Error(`Element not found: ${anchorId}`);
			if (found.tabId !== activeTabId()) throw new Error("canvas_insert can only write to the active canvas page.");
			let insertParentId;
			let insertIndex;
			if (parentId) {
				insertParentId = parentId;
				insertIndex = typeof args.index === "number" ? args.index : getChildren$2(found.store, parentId).length;
			} else if (beforeId) {
				const p = getParentId(found.store, beforeId);
				insertParentId = p === "ROOT" || p === null ? null : p;
				insertIndex = getIndex(found.store, beforeId);
			} else {
				const p = getParentId(found.store, afterId);
				insertParentId = p === "ROOT" || p === null ? null : p;
				insertIndex = getIndex(found.store, afterId) + 1;
			}
			if (!insertParentId) throw new Error("canvas_insert cannot insert at the canvas root — use canvas_add for new top-level sections.");
			const parsed = parseNewElements(jsx, iconLibraries, componentIndex);
			const parsedRootIds = getRootIds(parsed);
			if (parsedRootIds.length === 0) throw new Error("Failed to parse JSX");
			const nestingError = invalidNesting(parsed, getById(found.store, insertParentId) ?? null);
			if (nestingError) throw new Error(nestingError);
			refs.lastCommitAtRef.current = Date.now();
			let workingStore = dropPreviewsOnTab(found.tabId, pageTree(found.tabId) ?? found.store);
			const storeBefore = workingStore;
			const tx = usePages.getState().transaction(found.tabId);
			const latest = latestStoreFor(found.tabId);
			const recorded = [];
			const insertedIds = [];
			let indexCursor = insertIndex;
			try {
				for (const rootId of parsedRootIds) {
					const nested = storeSubtreeToLegacyNested(parsed, rootId);
					insertedIds.push(rootId);
					recorded.push(createInsertOperation(nested, insertParentId, indexCursor));
					workingStore = await insertNestedWithPaint(workingStore, nested, insertParentId, indexCursor, (ops) => tx.stage(ops), latest);
					indexCursor += 1;
				}
				tx.commit({
					source: "ai",
					ops: recorded
				});
			} catch (err) {
				tx.discard();
				throw err;
			}
			notePresence(args, workingStore, [insertParentId], "write");
			return {
				elementIds: insertedIds,
				parentId: insertParentId,
				index: insertIndex,
				outline: describeTreeForAgent(pageTree(found.tabId) ?? workingStore, insertedIds),
				...readUpdate(paintedWriteReadDelta(storeBefore, recorded, insertParentId, []))
			};
		},
		async editElement(args) {
			refs.lastCommitAtRef.current = Date.now();
			const elementId = args.elementId;
			const oldString = args.oldString;
			const newString = args.newString;
			if (!elementId || oldString === void 0 || newString === void 0) throw new Error("element_id, old_string, and new_string are required");
			const found = findElementTab(elementId);
			if (!found || !getById(found.store, elementId)) throw new Error(`Element not found: ${elementId}`);
			const previousNested = storeSubtreeToLegacyNested(found.store, elementId);
			const currentJsx = generateJSX(ensureV2([previousNested]), 0, { includeDataElementId: true });
			const edited = applyJsxStringEdit(currentJsx, oldString, newString, !!args.replaceAll);
			if (edited.error || !edited.content) throw new Error(edited.error || "Edit failed");
			const lintErr = lintNewlyIntroducedRawHtmlControls(currentJsx, edited.content, componentIndex)?.message ?? null;
			if (lintErr) throw new Error(lintErr);
			const parsed = parseJSX(edited.content, iconLibraries, componentIndex);
			const parsedRootIds = getRootIds(parsed);
			if (parsedRootIds.length === 0) throw new Error("Failed to parse edited JSX");
			const subtreeIds = subtreeIdSet(found.store, elementId);
			const storeIds = allStoreIdSet(found.store);
			const normalized = normalizeUpdateSubtree(previousNested, storeSubtreeToLegacyNested(parsed, parsedRootIds[0]), subtreeIds, storeIds);
			if (normalized.error) throw new Error(normalized.error);
			const newElement = normalized.element;
			if (previousNested.canvasPosition) newElement.canvasPosition = previousNested.canvasPosition;
			newElement.id = elementId;
			const summary = summarizeSubtreeChange(previousNested, newElement);
			const targetStore = pageTree(found.tabId) ?? found.store;
			const op = createReplaceOperation(targetStore, elementId, newElement);
			if (op) commitAi(found.tabId, [op]);
			const nextStore = pageTree(found.tabId) ?? targetStore;
			notePresence(args, nextStore, [elementId], "write");
			return {
				summary: {
					nodesPreserved: summary.nodes_preserved,
					nodesAdded: summary.nodes_added,
					nodesRemoved: summary.nodes_removed
				},
				replacements: edited.replacements ?? 1,
				added: describeAddedForAgent(nextStore, elementId, subtreeIds),
				...readUpdate(coveringReadDelta(targetStore, nextStore, elementId))
			};
		},
		async updateElement(args) {
			refs.lastCommitAtRef.current = Date.now();
			const elementId = args.elementId;
			const jsx = args.jsx;
			if (typeof jsx === "string" && jsxContainsTruncationStub(jsx)) throw new Error("jsx contains petal:truncated stubs from a truncated canvas_read. Drill with canvas_read on stub ids (or update a smaller element) and send complete JSX without truncation stubs.");
			const found = findElementTab(elementId);
			if (!found || !getById(found.store, elementId)) throw new Error(`Element not found: ${elementId}`);
			if (!isSubtreeAsRead(pageTree(found.tabId) ?? found.store, elementId, args.expectedHash)) throw new Error(changedSinceReadMessage(elementId));
			const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
			if (lintErr) throw new Error(lintErr);
			const parsed = parseJSX(jsx, iconLibraries, componentIndex);
			const parsedRootIds = getRootIds(parsed);
			if (parsedRootIds.length === 0) throw new Error("Failed to parse JSX");
			const newElementNested = storeSubtreeToLegacyNested(parsed, parsedRootIds[0]);
			const targetTabId = found.tabId;
			const targetStore = pageTree(targetTabId) ?? found.store;
			const previousNested = storeSubtreeToLegacyNested(targetStore, elementId);
			const subtreeIds = subtreeIdSet(targetStore, elementId);
			const normalized = normalizeUpdateSubtree(previousNested, newElementNested, subtreeIds, allStoreIdSet(targetStore));
			if (normalized.error) throw new Error(normalized.error);
			const newElement = normalized.element;
			if (previousNested.canvasPosition) newElement.canvasPosition = previousNested.canvasPosition;
			newElement.id = elementId;
			const summary = summarizeSubtreeChange(previousNested, newElement);
			const op = createReplaceOperation(targetStore, elementId, newElement);
			if (op) commitAi(targetTabId, [op]);
			const nextStore = pageTree(targetTabId) ?? targetStore;
			notePresence(args, nextStore, [elementId], "write");
			return {
				summary: {
					nodesPreserved: summary.nodes_preserved,
					nodesAdded: summary.nodes_added,
					nodesRemoved: summary.nodes_removed
				},
				added: describeAddedForAgent(nextStore, elementId, subtreeIds),
				...readUpdate(coveringReadDelta(targetStore, nextStore, elementId))
			};
		},
		async patchElements(args) {
			const { tabs: plans, errors } = planPatchesByTab(args.updates, findElementTab);
			const applied = [];
			const changes = [];
			for (const [targetTabId, plan] of plans) {
				const { targetStore, ops } = plan;
				if (ops.length > 0) {
					refs.lastCommitAtRef.current = Date.now();
					commitAi(targetTabId, ops);
				}
				const nextStore = pageTree(targetTabId) ?? targetStore;
				notePresence(args, nextStore, plan.applied, "write");
				applied.push(...plan.applied);
				const seenRoots = /* @__PURE__ */ new Set();
				for (const id of plan.applied) {
					const rootId = rootAncestorId(targetStore, id);
					if (!rootId || seenRoots.has(rootId)) continue;
					seenRoots.add(rootId);
					changes.push(...coveringReadDelta(targetStore, nextStore, id)._coveringReadChanges);
				}
			}
			return {
				applied,
				errors,
				coveringReadChanges: changes
			};
		},
		async duplicateElement(args) {
			refs.lastCommitAtRef.current = Date.now();
			const elementId = args.elementId;
			const beforeId = typeof args.beforeId === "string" ? args.beforeId : void 0;
			const afterId = typeof args.afterId === "string" ? args.afterId : void 0;
			const parentId = typeof args.parentId === "string" ? args.parentId : void 0;
			if (!elementId) throw new Error("element_id is required");
			const found = findElementTab(elementId);
			if (!found || !getById(found.store, elementId)) throw new Error(`Element not found: ${elementId}`);
			if (found.tabId !== activeTabId()) throw new Error("canvas_duplicate can only write to the active canvas page. Ask the user to open the page holding this element.");
			const targetTabId = found.tabId;
			const workingStore = dropPreviewsOnTab(targetTabId, pageTree(targetTabId) ?? found.store);
			const destination = resolveDuplicateDestination(workingStore, elementId, {
				beforeId,
				afterId,
				parentId,
				index: args.index
			});
			if (!destination.ok) throw new Error(destination.error);
			const { parentId: destParentId, index: destIndex } = destination;
			const boxes = occupiedRootBoxes(workingStore);
			const sourceBox = rootOccupancyBox(workingStore, elementId);
			const size = sourceBox ? {
				width: sourceBox.width,
				height: sourceBox.height
			} : {
				width: UNKNOWN_ROOT_WIDTH,
				height: 800
			};
			const stamped = duplicateOperations(workingStore, elementId, args.copies ?? [{}], destination, (clone) => {
				const position = nextRootPlacement(boxes);
				clone.canvasPosition = position;
				boxes.push({
					...position,
					...size
				});
			});
			if (typeof stamped === "string") throw new Error(stamped);
			const { copyIds, copiedFrom, errors } = stamped;
			commitAi(targetTabId, stamped.ops);
			const nextStore = pageTree(targetTabId) ?? workingStore;
			notePresence(args, nextStore, copyIds, "write");
			const copyTable = copiedFrom.length > 150 ? `\n${describeCopyIdsForAgent(elementId, copiedFrom)}` : "";
			return {
				elementIds: copyIds,
				parentId: destParentId,
				index: destIndex,
				outline: `${describeTreeForAgent(nextStore, copyIds)}${copyTable}`,
				errors,
				coveringReadChanges: coveringReadDelta(workingStore, nextStore, destParentId ?? copyIds[0])._coveringReadChanges,
				coveringReads: Object.fromEntries(copyIds.map((id) => [id, hashElementSubtreeFrom(nextStore, id)])),
				coveringReadsFromSource: copiedCoveringReads(workingStore, nextStore, elementId, copyIds, copiedFrom)
			};
		},
		async deleteElement(args) {
			refs.lastCommitAtRef.current = Date.now();
			const elementId = args.elementId;
			const found = findElementTab(elementId);
			if (!found || !getById(found.store, elementId)) throw new Error(`Element not found: ${elementId}`);
			const targetTabId = found.tabId;
			const targetStore = pageTree(targetTabId) ?? found.store;
			if (!isSubtreeAsRead(targetStore, elementId, args.expectedHash)) throw new Error(changedSinceReadMessage(elementId));
			const op = createRemoveOperation(targetStore, elementId);
			if (op) commitAi(targetTabId, [op]);
			const nextStore = pageTree(targetTabId) ?? targetStore;
			const parentId = getParentId(targetStore, elementId);
			if (parentId && parentId !== "ROOT") notePresence(args, nextStore, [parentId], "write");
			return readUpdate(coveringReadDelta(targetStore, nextStore, elementId));
		},
		async renameElement(args) {
			const elementId = args.elementId;
			const found = findElementTab(elementId);
			if (!found || !getById(found.store, elementId)) throw new Error(`Element not found: ${elementId}`);
			const targetTabId = found.tabId;
			const targetStore = pageTree(targetTabId) ?? found.store;
			const op = createSetNameOperation(targetStore, elementId, args.name || void 0);
			if (op) {
				refs.lastCommitAtRef.current = Date.now();
				commitAi(targetTabId, [op]);
			}
			const nextStore = pageTree(targetTabId) ?? targetStore;
			notePresence(args, nextStore, [elementId], "write");
			return readUpdate(coveringReadDelta(targetStore, nextStore, elementId));
		}
	};
}
/**
* Execute a typed `agent_canvas` command.
*
* This is the entry point for the flagged renderer path. The separate v1
* `useCanvasToolHandler` keeps its own copy of the operation body, so the legacy
* wire contract is untouched. A failed command is returned as `{ ok: false }`:
* the renderer cannot throw across the IPC boundary.
*/
async function executeCanvasCommand(command, deps, refs) {
	const handler = createCanvasHost(deps, refs)[command.type];
	try {
		return {
			ok: true,
			data: await handler(command.args)
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

export { executeCanvasCommand };
