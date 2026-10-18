// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useCanvasToolHandler.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getById, getChildren$2, getDescendantIds, getIndex, getParentId, getRootIds } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { applyOperationsToStore, createInsertOperation, createRemoveOperation, createReplaceOperation, createSetNameOperation } from "../../shared/utils/operations.js";
import { usePages } from "../../shared/state/pages.js";
import { generateJSX, generateJSXWithinBudget, hashAllElementSubtreesFrom, hashElementSubtreeFrom, jsxContainsTruncationStub } from "../../../../compiler/src/codegen/generateJSX.js";
import { parseJSX } from "../../../../compiler/src/codegen/parseJSX.js";
import { parseJSXPartial } from "../../../../compiler/src/codegen/parseJSXPartial.js";
import { ancestorChainMatchesQuery, applyJsxStringEdit, lintNewlyIntroducedRawHtmlControls, lintRawHtmlControls, matchElementGrep, normalizeUpdateSubtree, summarizeSubtreeChange } from "../../../../compiler/src/codegen/canvasAiEdit.js";
import { dropPreviewRootOps, insertNestedWithPaint, replacePreviewRootOp, sanitizeDrawStreamId } from "./canvasDrawStream.js";
import { resolveDuplicateDestination } from "./duplicateDestination.js";
import { addAiCopyTarget, clearAiCopyTargets } from "../../shared/state/aiCopyTarget.js";
import { UNKNOWN_ROOT_WIDTH, nextRootPlacement, placeBesideAnchor } from "./nextRootPlacement.js";
import { isDrawPreviewId, occupiedRootBoxes, rootOccupancyBox } from "./rootBoxes.js";
import { coveringReadDelta, paintedWriteReadDelta, rootAncestorId } from "./coveringReadDelta.js";
import { copiedCoveringReads, describeAddedForAgent, describeCopyIdsForAgent, describeTreeForAgent, duplicateOperations, elementLabel, invalidNesting, parseNewElements, planPatchesByTab } from "./canvasPatch.js";

/**
* Canvas tool IPC handler hook.
*
* Listens for `canvas_tool_request` IPC messages from the MCP server
* (Electron main process) and applies canvas operations to the editor state.
*
* Operations: list_pages, read_canvas, add_to_canvas, update_element,
* edit_element, insert_element, duplicate_element, grep_canvas, query_canvas,
* delete_element, rename_element, search_icons, preview_draw, preview_drop
*
* Nothing here locks an element. Each read and write marks its frame with the
* agent's presence, and writes report how they changed the subtree hashes the
* agent has read, so `canvas_update`/`canvas_delete` can refuse to overwrite
* edits the agent has not seen.
*/
var UUID_RE$1 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A chat's canvas changes that supersede its copies as the thing to follow. */
var COPY_SUPERSEDING_OPERATIONS = /* @__PURE__ */ new Set([
	"add_to_canvas",
	"insert_element",
	"edit_element",
	"update_element",
	"delete_element"
]);
var GREP_MAX_RESULTS$1 = 40;
/** Minimum gap between progress pings to main while a paint runs (its idle deadline is 10s). */
var PROGRESS_INTERVAL_MS = 1e3;
var QUERY_MAX_RESULTS$1 = 100;
/** The top-level frame an element belongs to (itself, when it is one). */
/**
* Measured box of the frame that holds `anchorId`. Null when the anchor is
* unknown, so callers fall back to the rightmost-frame rule.
*/
function anchorRootBox(store, anchorId) {
	if (!anchorId) return null;
	const rootId = rootAncestorId(store, anchorId);
	return rootId ? rootOccupancyBox(store, rootId) : null;
}
/**
* Park a new root next to its anchor when there is one, otherwise past every
* existing frame. Returns the box the root is assumed to occupy, so a caller
* placing several roots in one call can chain them without re-measuring.
*/
function placeNewRoot$1(store, nested, anchor, boxes = occupiedRootBoxes(store)) {
	const size = anchor ? {
		width: anchor.width,
		height: anchor.height
	} : {
		width: UNKNOWN_ROOT_WIDTH,
		height: 800
	};
	const position = anchor ? placeBesideAnchor(anchor, size, boxes) : nextRootPlacement(boxes);
	nested.canvasPosition = position;
	return {
		...position,
		...size
	};
}
function describeRootForAgent$1(store, id) {
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
/** The agent behind a request, when main tagged one. */
function agentFromArgs(args) {
	if (typeof args?.agent_id !== "string" || !args.agent_id) return null;
	return {
		agentId: args.agent_id,
		chatTabId: typeof args.chat_tab_id === "string" && args.chat_tab_id ? args.chat_tab_id : void 0
	};
}
/**
* True when `elementId`'s subtree still hashes to what the agent last read.
* canvas_update and canvas_delete discard the subtree, so anything the agent
* has not seen — the user's edit, another agent's — must stop them.
*/
function isSubtreeAsRead$1(store, elementId, expectedHash) {
	return typeof expectedHash === "string" && hashElementSubtreeFrom(store, elementId) === expectedHash;
}
function changedSinceReadMessage$1(elementId) {
	return `${elementId} changed since you last read it, so this would overwrite edits you have not seen. canvas_read it again, then retry.`;
}
function subtreeIdSet$1(store, elementId) {
	return /* @__PURE__ */ new Set([elementId, ...getDescendantIds(store, elementId)]);
}
function allStoreIdSet$1(store) {
	return new Set(store.byId.keys());
}
/** Descendants-or-self matching a space-separated tag/component selector. */
function queryCanvasIds$1(store, rootId, selector) {
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
			if (results.length >= QUERY_MAX_RESULTS$1) return results;
		}
	}
	return results;
}
/** Fresh tree of a loaded page; undefined while it is still being fetched. */
function pageTree$1(pageId) {
	return usePages.getState().pages.get(pageId)?.tree;
}
/** Commit ops on any page. Tagged 'ai' so they stay out of the user's undo
*  stack and don't count as a human edit. */
function commitAi$1(pageId, ops) {
	usePages.getState().applyOps(ops, {
		pageId,
		source: "ai"
	});
}
/** Paint already-computed ops without history (progressive previews). */
function paintPage$1(pageId, ops) {
	usePages.getState().applyTransientOps(ops, pageId);
}
/** The loaded page holding an element, preferring the active page when ids overlap. */
function findElementTab(elementId) {
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
/** First "Page", "Page 2", … not taken by an existing tab or an in-flight creation. */
function nextDefaultPageName$1(tabs, pending) {
	const taken = new Set(tabs.map((tab) => tab.name.trim().toLocaleLowerCase()));
	for (const name of pending) taken.add(name);
	for (let n = 1;; n++) {
		const candidate = n === 1 ? "Page" : `Page ${n}`;
		if (!taken.has(candidate.toLocaleLowerCase())) return candidate;
	}
}
/**
* Subscribes to `canvas_tool_request` IPC and applies each operation.
*
* The handler is defined at module scope on purpose: the React Compiler
* inlines closures declared in a component or hook, so the request body's
* `try`/`catch` would bail compilation for whoever calls
* `useCanvasToolHandler`. Keeping the body out of the hook lets the hook
* itself compile, and the deps stay fresh through `latestDeps`.
*/
function subscribeToCanvasToolRequests(latestDeps, pendingPageCreationsRef, drawPreviewsRef, lastCommitAtRef) {
	return window.api.on("canvas_tool_request", async (request) => {
		const { requestId, projectId: requestProjectId, operation, args } = request;
		const respond = (result) => window.api.send("canvas_tool_result", {
			requestId,
			result
		});
		let lastProgressAt = 0;
		const reportProgress = () => {
			const now = Date.now();
			if (now - lastProgressAt < PROGRESS_INTERVAL_MS) return;
			lastProgressAt = now;
			window.api.send("canvas_tool_progress", { requestId });
		};
		const editorProjectId = latestDeps().projectId;
		if (editorProjectId && requestProjectId && String(editorProjectId) !== String(requestProjectId)) {
			respond({
				isError: true,
				content: [{
					type: "text",
					text: `Project mismatch: this canvas is ${editorProjectId}, but the MCP request targets ${requestProjectId}. No canvas changes were applied.`
				}]
			});
			return;
		}
		const { tabs, activeTabIdRef, iconLibraries, componentIndex, touchAgentPresence } = latestDeps();
		const currentTabs = tabs;
		const currentActiveTabId = activeTabIdRef.current;
		const latestStoreFor = (tabId) => (own) => pageTree$1(tabId) ?? own;
		const agent = agentFromArgs(args);
		/** Mark the frames holding `ids` as this agent's. */
		const notePresence = (store, ids, kind) => {
			if (!agent) return;
			const rootIds = /* @__PURE__ */ new Set();
			for (const id of ids) {
				const rootId = rootAncestorId(store, id);
				if (rootId && !isDrawPreviewId(rootId)) rootIds.add(rootId);
			}
			if (rootIds.size > 0) touchAgentPresence([...rootIds], agent, kind);
		};
		const dropPreviewsOnTab = (tabId, store) => {
			const { ops, removed } = dropPreviewRootOps(store, drawPreviewsRef.current.values(), tabId);
			for (const preview of removed) drawPreviewsRef.current.delete(preview.streamId);
			if (ops.length > 0) {
				(0, import_react_dom.flushSync)(() => paintPage$1(tabId, ops));
				return applyOperationsToStore(store, ops);
			}
			return store;
		};
		if (COPY_SUPERSEDING_OPERATIONS.has(operation) && typeof args?.chat_tab_id === "string") clearAiCopyTargets(args.chat_tab_id);
		try {
			if (operation === "preview_drop") {
				const store = pageTree$1(currentActiveTabId);
				if (store) dropPreviewsOnTab(currentActiveTabId, store);
				respond({ content: [{
					type: "text",
					text: "previews dropped"
				}] });
				return;
			}
			if (operation === "preview_draw") {
				if ((typeof args.issued_at === "number" ? args.issued_at : Date.now()) < lastCommitAtRef.current) {
					respond({ content: [{
						type: "text",
						text: "preview stale"
					}] });
					return;
				}
				const jsx = typeof args.jsx === "string" ? args.jsx : "";
				if (jsx.trim().length < 16) {
					respond({ content: [{
						type: "text",
						text: "preview skipped"
					}] });
					return;
				}
				const streamId = typeof args.stream_id === "string" && args.stream_id ? args.stream_id : "default";
				const parsed = parseJSXPartial(jsx, iconLibraries, componentIndex, void 0, { stableIdPrefix: `el-draw-${sanitizeDrawStreamId(streamId)}` });
				if (!parsed) {
					respond({ content: [{
						type: "text",
						text: "preview unparsed"
					}] });
					return;
				}
				const previewRootIds = getRootIds(parsed.store);
				if (previewRootIds.length === 0) {
					respond({ content: [{
						type: "text",
						text: "preview empty"
					}] });
					return;
				}
				const nested = storeSubtreeToLegacyNested(parsed.store, previewRootIds[0]);
				const existing = drawPreviewsRef.current.get(streamId);
				if (existing && existing.tabId === currentActiveTabId) {
					const targetStore = pageTree$1(existing.tabId);
					const op = targetStore ? replacePreviewRootOp(targetStore, existing, nested) : null;
					if (op) {
						if (existing.rootId !== nested.id) drawPreviewsRef.current.set(streamId, {
							...existing,
							rootId: nested.id
						});
						(0, import_react_dom.flushSync)(() => paintPage$1(existing.tabId, [op]));
					}
					respond({ content: [{
						type: "text",
						text: "preview updated"
					}] });
					return;
				}
				const parentId = typeof args.parent_id === "string" ? args.parent_id : void 0;
				let targetTabId = currentActiveTabId;
				let targetStore = pageTree$1(targetTabId);
				let insertParent = null;
				if (parentId) {
					const found = findElementTab(parentId);
					if (!found || found.tabId !== currentActiveTabId) {
						respond({ content: [{
							type: "text",
							text: "preview parent unavailable"
						}] });
						return;
					}
					targetTabId = found.tabId;
					targetStore = found.store;
					insertParent = parentId;
				}
				const targetTab = currentTabs.find((t) => t.id === targetTabId);
				if (!targetTab?.canvasId || !UUID_RE$1.test(targetTab.canvasId)) {
					respond({ content: [{
						type: "text",
						text: "preview canvas not ready"
					}] });
					return;
				}
				if (!targetStore) {
					respond({ content: [{
						type: "text",
						text: "preview canvas not ready"
					}] });
					return;
				}
				if (!insertParent) placeNewRoot$1(targetStore, nested, anchorRootBox(targetStore, typeof args.anchor_id === "string" ? args.anchor_id : void 0));
				const insertIndex = insertParent ? getChildren$2(targetStore, insertParent).length : getRootIds(targetStore).length;
				drawPreviewsRef.current.set(streamId, {
					streamId,
					rootId: nested.id,
					tabId: targetTabId
				});
				(0, import_react_dom.flushSync)(() => paintPage$1(targetTabId, [createInsertOperation(nested, insertParent, insertIndex)]));
				respond({ content: [{
					type: "text",
					text: "preview inserted"
				}] });
				return;
			}
			if (operation === "search_icons") {
				const query = args.query?.toLowerCase() || "";
				const results = [];
				for (const [, lib] of Object.entries(iconLibraries)) {
					if (lib.icons) {
						for (const iconName of Object.keys(lib.icons)) if (iconName.toLowerCase().includes(query)) {
							results.push(iconName);
							if (results.length >= 20) break;
						}
					}
					if (results.length >= 20) break;
				}
				respond({ content: [{
					type: "text",
					text: results.length > 0 ? results.join(", ") : `No icons matching "${query}"`
				}] });
				return;
			}
			if (operation === "list_pages") {
				const pages = currentTabs.map((t) => {
					const store = pageTree$1(t.id);
					const roots = store ? getRootIds(store).map((id) => describeRootForAgent$1(store, id)).filter((root) => !!root) : [];
					return {
						id: t.canvasId || t.id,
						name: t.name,
						loaded: !!store,
						active: t.id === currentActiveTabId,
						rootCount: roots.length,
						roots
					};
				});
				const active = pages.find((page) => page.active);
				respond({ content: [{
					type: "text",
					text: `${active && active.rootCount > 0 ? `Active page "${active.name}" already has ${active.rootCount} top-level frame(s). Pass anchor_id to canvas_add so a new root lands beside the frame it relates to; without it the root goes to the right of all frames. Do not draw on top of existing work — to change it, edit those ids.` : "Active page is empty. New root canvas_add starts at the origin."}\n${JSON.stringify(pages, null, 2)}`
				}] });
				return;
			}
			if (operation === "create_page") {
				const requestedName = typeof args.name === "string" && args.name.trim() ? args.name.trim() : null;
				const name = requestedName ?? nextDefaultPageName$1(currentTabs, new Set(pendingPageCreationsRef.current.keys()));
				const normalizedName = name.toLocaleLowerCase();
				const existing = requestedName ? currentTabs.find((tab) => tab.name.trim().toLocaleLowerCase() === normalizedName) : void 0;
				if (existing) {
					if (existing.id !== currentActiveTabId) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Page "${existing.name}" already exists (id ${existing.canvasId || existing.id}) but is not active. Open that page before continuing; a duplicate was not created.`
							}]
						});
						return;
					}
					respond({ content: [{
						type: "text",
						text: `Reusing existing active page "${existing.name}" (id ${existing.canvasId || existing.id}). No duplicate page was created.`
					}] });
					return;
				}
				let creation = pendingPageCreationsRef.current.get(normalizedName);
				const joinedInFlight = !!creation;
				if (!creation) {
					creation = latestDeps().createCanvasPage(name);
					pendingPageCreationsRef.current.set(normalizedName, creation);
					creation.catch(() => {}).finally(() => pendingPageCreationsRef.current.delete(normalizedName));
				}
				const res = await creation;
				if (!res.success || !res.id) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Failed to create page: ${res.error || "unknown error"}`
						}]
					});
					return;
				}
				respond({ content: [{
					type: "text",
					text: `${joinedInFlight ? "Reusing page" : "Created page"} "${res.name}" (id ${res.id}). It is now the active canvas — subsequent canvas_add calls target it.`
				}] });
				return;
			}
			if (operation === "read_canvas") {
				const canvasId = args.canvas_id;
				const elementId = args.element_id;
				const tab = currentTabs.find((t) => t.canvasId === canvasId || t.id === canvasId);
				if (!tab) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Canvas not found: ${canvasId}`
						}]
					});
					return;
				}
				const store = pageTree$1(tab.id);
				if (!store) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Canvas not loaded: ${canvasId}`
						}]
					});
					return;
				}
				if (elementId) {
					if (!getById(store, elementId)) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Element not found: ${elementId}`
							}]
						});
						return;
					}
					const { jsx, stubbedIds } = generateJSXWithinBudget(store, {
						includeDataElementId: true,
						rootId: elementId
					});
					const hashes = hashAllElementSubtreesFrom(store, elementId, stubbedIds);
					notePresence(store, [elementId], "read");
					respond({
						content: [{
							type: "text",
							text: jsx
						}],
						_coveringReads: Object.fromEntries(hashes)
					});
				} else {
					const jsx = generateJSX(store, 0, { includeDataElementId: true });
					const rootIds = getRootIds(store);
					if (jsx.length > 8e3) {
						const summary = rootIds.map((id) => {
							const el = getById(store, id);
							if (!el) return `- ${id} (missing)`;
							const childCount = getChildren$2(store, id).length;
							return `- ${el.type === "component" ? el.componentName : "tag" in el ? el.tag : el.type} id="${el.id}"${childCount > 0 ? ` (${childCount} children)` : ""}`;
						}).join("\n");
						respond({ content: [{
							type: "text",
							text: `${rootIds.length} top-level elements:\n${summary}\n\nUse canvas_read with element_id to read specific elements.`
						}] });
					} else {
						const hashes = /* @__PURE__ */ new Map();
						for (const rootId of rootIds) for (const [id, hash] of hashAllElementSubtreesFrom(store, rootId)) hashes.set(id, hash);
						respond({
							content: [{
								type: "text",
								text: jsx
							}],
							_coveringReads: Object.fromEntries(hashes)
						});
					}
				}
				return;
			}
			if (operation === "grep_canvas") {
				const patternStr = args.pattern;
				if (!patternStr || typeof patternStr !== "string") {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "pattern is required"
						}]
					});
					return;
				}
				const flags = args.case_insensitive ? "i" : "";
				let regex;
				try {
					regex = new RegExp(patternStr, flags);
				} catch (e) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Invalid regex: ${e.message}`
						}]
					});
					return;
				}
				let store = pageTree$1(currentActiveTabId);
				let rootId = typeof args.root_id === "string" ? args.root_id : null;
				if (args.canvas_id) {
					const tab = currentTabs.find((t) => t.canvasId === args.canvas_id || t.id === args.canvas_id);
					if (!tab) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Canvas not found: ${args.canvas_id}`
							}]
						});
						return;
					}
					store = pageTree$1(tab.id);
					if (!store) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Canvas not loaded: ${args.canvas_id}`
							}]
						});
						return;
					}
				}
				if (!store) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Canvas not available"
						}]
					});
					return;
				}
				if (rootId) {
					const found = findElementTab(rootId);
					if (!found || !getById(found.store, rootId)) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Element not found: ${rootId}`
							}]
						});
						return;
					}
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
					if (matches.length >= GREP_MAX_RESULTS$1) break;
				}
				const kept = hits.size - shadowed.size;
				const truncated = kept > GREP_MAX_RESULTS$1 ? `\n… truncated at ${GREP_MAX_RESULTS$1} of ${kept} matches` : "";
				respond({ content: [{
					type: "text",
					text: matches.length > 0 ? `${matches.length} match(es):\n${matches.join("\n")}${truncated}` : `No matches for /${patternStr}/`
				}] });
				return;
			}
			if (operation === "query_canvas") {
				const selector = args.selector;
				if (!selector || typeof selector !== "string") {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "selector is required (e.g. \"table\", \"tbody tr\", \"th\")"
						}]
					});
					return;
				}
				let store = pageTree$1(currentActiveTabId);
				let rootId = typeof args.root_id === "string" ? args.root_id : null;
				if (args.canvas_id) {
					const tab = currentTabs.find((t) => t.canvasId === args.canvas_id || t.id === args.canvas_id);
					if (!tab) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Canvas not found: ${args.canvas_id}`
							}]
						});
						return;
					}
					store = pageTree$1(tab.id);
				}
				if (!store) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Canvas not available"
						}]
					});
					return;
				}
				if (rootId) {
					const found = findElementTab(rootId);
					if (!found || !getById(found.store, rootId)) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Element not found: ${rootId}`
							}]
						});
						return;
					}
					store = found.store;
				}
				const ids = queryCanvasIds$1(store, rootId, selector);
				const lines = ids.map((id) => `- ${id} (${elementLabel(store, id)})`);
				respond({ content: [{
					type: "text",
					text: ids.length > 0 ? `${ids.length} element(s) matching "${selector}":\n${lines.join("\n")}` : `No elements matching "${selector}"`
				}] });
				return;
			}
			if (operation === "add_to_canvas") {
				const canvasId = args.canvas_id;
				const parentId = args.parent_id;
				const jsx = args.jsx;
				if (typeof jsx === "string" && jsxContainsTruncationStub(jsx)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "jsx contains petal:truncated stubs from a truncated canvas_read. To copy existing work, use canvas_duplicate instead of re-sending its JSX."
						}]
					});
					return;
				}
				const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
				if (lintErr) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: lintErr
						}]
					});
					return;
				}
				const parsed = parseNewElements(jsx, iconLibraries, componentIndex);
				const parsedRootIds = getRootIds(parsed);
				if (parsedRootIds.length === 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Failed to parse JSX"
						}]
					});
					return;
				}
				let targetTabId = currentActiveTabId;
				if (canvasId) {
					const tab = currentTabs.find((t) => t.canvasId === canvasId || t.id === canvasId);
					if (!tab) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `Canvas not found: ${canvasId}`
							}]
						});
						return;
					}
					if (tab.id !== currentActiveTabId) {
						respond({
							isError: true,
							content: [{
								type: "text",
								text: `canvas_add can only write to the active canvas page. "${tab.name}" is not active; ask the user to open it, or call canvas_create_page to create and activate a new page.`
							}]
						});
						return;
					}
					targetTabId = tab.id;
				}
				if (parentId) {
					const found = findElementTab(parentId);
					if (found) {
						if (found.tabId !== currentActiveTabId) {
							respond({
								isError: true,
								content: [{
									type: "text",
									text: `canvas_add can only write to the active canvas page. The parent element is on a different page; ask the user to open that page first.`
								}]
							});
							return;
						}
						targetTabId = found.tabId;
					}
				}
				const targetStore = pageTree$1(targetTabId);
				if (!targetStore) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Canvas not available"
						}]
					});
					return;
				}
				if (parentId && !getById(targetStore, parentId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Parent element not found: ${parentId}`
						}]
					});
					return;
				}
				const addNestingError = invalidNesting(parsed, parentId ? getById(targetStore, parentId) : null);
				if (addNestingError) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: addNestingError
						}]
					});
					return;
				}
				const targetCanvasId = currentTabs.find((t) => t.id === targetTabId)?.canvasId;
				if (!targetCanvasId || !UUID_RE$1.test(targetCanvasId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Canvas not yet loaded — pages are still bootstrapping. Wait a moment and retry. (Internal: target canvasId is '${targetCanvasId ?? "undefined"}', not a UUID.)`
						}]
					});
					return;
				}
				lastCommitAtRef.current = Date.now();
				let workingStore = dropPreviewsOnTab(targetTabId, targetStore);
				const storeBefore = workingStore;
				const recorded = [];
				const tx = usePages.getState().transaction(targetTabId);
				const insertedIds = [];
				try {
					const explicitX = typeof args.x === "number" ? args.x : null;
					const explicitY = typeof args.y === "number" ? args.y : null;
					let xCursor = explicitX;
					let anchor = explicitX === null && explicitY === null ? anchorRootBox(workingStore, typeof args.anchor_id === "string" ? args.anchor_id : void 0) : null;
					const rootBoxes = occupiedRootBoxes(workingStore);
					const latestTarget = latestStoreFor(targetTabId);
					for (const rootId of parsedRootIds) {
						workingStore = latestTarget(workingStore);
						const nested = storeSubtreeToLegacyNested(parsed, rootId);
						insertedIds.push(rootId);
						if (parentId) {
							const index = getById(workingStore, parentId) ? getChildren$2(workingStore, parentId).length : 0;
							recorded.push(createInsertOperation(nested, parentId, index));
							workingStore = await insertNestedWithPaint(workingStore, nested, parentId, index, (ops) => {
								tx.stage(ops);
								reportProgress();
							}, latestTarget);
						} else {
							if (anchor) {
								anchor = placeNewRoot$1(workingStore, nested, anchor, rootBoxes);
								rootBoxes.push(anchor);
							} else {
								const auto = nextRootPlacement(rootBoxes);
								nested.canvasPosition = {
									x: xCursor ?? auto.x,
									y: explicitY ?? auto.y
								};
								if (xCursor !== null) xCursor += UNKNOWN_ROOT_WIDTH + 40;
								rootBoxes.push({
									...nested.canvasPosition,
									width: UNKNOWN_ROOT_WIDTH,
									height: 800
								});
							}
							const index = getRootIds(workingStore).length;
							recorded.push(createInsertOperation(nested, null, index));
							workingStore = await insertNestedWithPaint(workingStore, nested, null, index, (ops) => {
								tx.stage(ops);
								reportProgress();
							}, latestTarget);
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
				notePresence(workingStore, parentId ? [parentId] : insertedIds, "write");
				respond({
					content: [{
						type: "text",
						text: `Added ${insertedIds.length} element(s):
${describeTreeForAgent(workingStore, insertedIds)}`
					}],
					...paintedWriteReadDelta(storeBefore, recorded, parentId ?? null, insertedIds),
					_createdElementIds: insertedIds
				});
				return;
			}
			if (operation === "insert_element") {
				const jsx = args.jsx;
				const beforeId = typeof args.before_id === "string" ? args.before_id : void 0;
				const afterId = typeof args.after_id === "string" ? args.after_id : void 0;
				const parentId = typeof args.parent_id === "string" ? args.parent_id : void 0;
				const modeCount = [
					beforeId,
					afterId,
					parentId
				].filter(Boolean).length;
				if (!jsx) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "jsx is required"
						}]
					});
					return;
				}
				if (modeCount !== 1) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Provide exactly one of before_id, after_id, or parent_id."
						}]
					});
					return;
				}
				const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
				if (lintErr) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: lintErr
						}]
					});
					return;
				}
				const anchorId = beforeId || afterId || parentId;
				const found = findElementTab(anchorId);
				if (!found || !getById(found.store, anchorId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${anchorId}`
						}]
					});
					return;
				}
				if (found.tabId !== currentActiveTabId) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "canvas_insert can only write to the active canvas page."
						}]
					});
					return;
				}
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
				if (!insertParentId) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "canvas_insert cannot insert at the canvas root — use canvas_add for new top-level sections."
						}]
					});
					return;
				}
				const parsed = parseNewElements(jsx, iconLibraries, componentIndex);
				const parsedRootIds = getRootIds(parsed);
				if (parsedRootIds.length === 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Failed to parse JSX"
						}]
					});
					return;
				}
				const insertNestingError = invalidNesting(parsed, getById(found.store, insertParentId) ?? null);
				if (insertNestingError) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: insertNestingError
						}]
					});
					return;
				}
				lastCommitAtRef.current = Date.now();
				let workingStore = dropPreviewsOnTab(found.tabId, found.store);
				const storeBefore = workingStore;
				const tx = usePages.getState().transaction(found.tabId);
				const recorded = [];
				const insertedIds = [];
				let indexCursor = insertIndex;
				const latestFound = latestStoreFor(found.tabId);
				try {
					for (const rootId of parsedRootIds) {
						const nested = storeSubtreeToLegacyNested(parsed, rootId);
						insertedIds.push(rootId);
						recorded.push(createInsertOperation(nested, insertParentId, indexCursor));
						workingStore = await insertNestedWithPaint(workingStore, nested, insertParentId, indexCursor, (ops) => {
							tx.stage(ops);
							reportProgress();
						}, latestFound);
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
				notePresence(workingStore, [insertParentId], "write");
				respond({
					content: [{
						type: "text",
						text: `Inserted ${insertedIds.length} element(s) at index ${insertIndex} under ${insertParentId}:\n${describeTreeForAgent(workingStore, insertedIds)}`
					}],
					...paintedWriteReadDelta(storeBefore, recorded, insertParentId, []),
					_createdElementIds: insertedIds
				});
				return;
			}
			if (operation === "edit_element") {
				lastCommitAtRef.current = Date.now();
				const elementId = args.element_id;
				const oldString = args.old_string;
				const newString = args.new_string;
				if (!elementId || oldString === void 0 || newString === void 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "element_id, old_string, and new_string are required"
						}]
					});
					return;
				}
				const found = findElementTab(elementId);
				if (!found || !getById(found.store, elementId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${elementId}`
						}]
					});
					return;
				}
				const previousNested = storeSubtreeToLegacyNested(found.store, elementId);
				const currentJsx = generateJSX(ensureV2([previousNested]), 0, { includeDataElementId: true });
				const edited = applyJsxStringEdit(currentJsx, oldString, newString, !!args.replace_all);
				if (edited.error || !edited.content) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: edited.error || "Edit failed"
						}]
					});
					return;
				}
				const lintErr = lintNewlyIntroducedRawHtmlControls(currentJsx, edited.content, componentIndex)?.message ?? null;
				if (lintErr) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: lintErr
						}]
					});
					return;
				}
				const parsed = parseJSX(edited.content, iconLibraries, componentIndex);
				const parsedRootIds = getRootIds(parsed);
				if (parsedRootIds.length === 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Failed to parse edited JSX"
						}]
					});
					return;
				}
				const subtreeIds = subtreeIdSet$1(found.store, elementId);
				const storeIds = allStoreIdSet$1(found.store);
				const normalized = normalizeUpdateSubtree(previousNested, storeSubtreeToLegacyNested(parsed, parsedRootIds[0]), subtreeIds, storeIds);
				if (normalized.error) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: normalized.error
						}]
					});
					return;
				}
				const newElement = normalized.element;
				if (previousNested.canvasPosition) newElement.canvasPosition = previousNested.canvasPosition;
				newElement.id = elementId;
				const summary = summarizeSubtreeChange(previousNested, newElement);
				const targetStore = found.store;
				const op = createReplaceOperation(targetStore, elementId, newElement);
				if (op) commitAi$1(found.tabId, [op]);
				const nextStore = pageTree$1(found.tabId) ?? targetStore;
				notePresence(nextStore, [elementId], "write");
				respond({
					content: [{
						type: "text",
						text: `Edited element ${elementId} (${edited.replacements ?? 1} replacement(s)). Change summary: preserved=${summary.nodes_preserved}, added=${summary.nodes_added}, removed=${summary.nodes_removed}${describeAddedForAgent(nextStore, elementId, subtreeIds)}`
					}],
					...coveringReadDelta(targetStore, nextStore, elementId)
				});
				return;
			}
			if (operation === "update_element") {
				lastCommitAtRef.current = Date.now();
				const elementId = args.element_id;
				const jsx = args.jsx;
				if (typeof jsx === "string" && jsxContainsTruncationStub(jsx)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "jsx contains petal:truncated stubs from a truncated canvas_read. Drill with canvas_read on stub ids (or update a smaller element) and send complete JSX without truncation stubs."
						}]
					});
					return;
				}
				const found = findElementTab(elementId);
				if (!found || !getById(found.store, elementId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${elementId}`
						}]
					});
					return;
				}
				if (!isSubtreeAsRead$1(found.store, elementId, args.expected_hash)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: changedSinceReadMessage$1(elementId)
						}]
					});
					return;
				}
				const lintErr = lintRawHtmlControls(jsx, componentIndex)?.message ?? null;
				if (lintErr) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: lintErr
						}]
					});
					return;
				}
				const parsed = parseJSX(jsx, iconLibraries, componentIndex);
				const parsedRootIds = getRootIds(parsed);
				if (parsedRootIds.length === 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "Failed to parse JSX"
						}]
					});
					return;
				}
				const newElementNested = storeSubtreeToLegacyNested(parsed, parsedRootIds[0]);
				const targetTabId = found.tabId;
				const targetStore = found.store;
				const previousNested = storeSubtreeToLegacyNested(targetStore, elementId);
				const subtreeIds = subtreeIdSet$1(targetStore, elementId);
				const normalized = normalizeUpdateSubtree(previousNested, newElementNested, subtreeIds, allStoreIdSet$1(targetStore));
				if (normalized.error) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: normalized.error
						}]
					});
					return;
				}
				const newElement = normalized.element;
				if (previousNested.canvasPosition) newElement.canvasPosition = previousNested.canvasPosition;
				newElement.id = elementId;
				const summary = summarizeSubtreeChange(previousNested, newElement);
				const op = createReplaceOperation(targetStore, elementId, newElement);
				if (op) commitAi$1(targetTabId, [op]);
				const nextStore = pageTree$1(targetTabId) ?? targetStore;
				notePresence(nextStore, [elementId], "write");
				respond({
					content: [{
						type: "text",
						text: `Updated element ${elementId}. Change summary: preserved=${summary.nodes_preserved}, added=${summary.nodes_added}, removed=${summary.nodes_removed}${describeAddedForAgent(nextStore, elementId, subtreeIds)}`
					}],
					...coveringReadDelta(targetStore, nextStore, elementId)
				});
				return;
			}
			if (operation === "duplicate_element") {
				lastCommitAtRef.current = Date.now();
				const elementId = args.element_id;
				const chatTabId = args.chat_tab_id;
				const beforeId = typeof args.before_id === "string" ? args.before_id : void 0;
				const afterId = typeof args.after_id === "string" ? args.after_id : void 0;
				const parentId = typeof args.parent_id === "string" ? args.parent_id : void 0;
				if (!elementId) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "element_id is required"
						}]
					});
					return;
				}
				if (args.copies != null && (!Array.isArray(args.copies) || args.copies.length === 0)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "copies must be a non-empty array of entries; omit it for one plain copy"
						}]
					});
					return;
				}
				const found = findElementTab(elementId);
				if (!found || !getById(found.store, elementId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${elementId}`
						}]
					});
					return;
				}
				if (found.tabId !== currentActiveTabId) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "canvas_duplicate can only write to the active canvas page. Ask the user to open the page holding this element."
						}]
					});
					return;
				}
				const targetTabId = found.tabId;
				const workingStore = dropPreviewsOnTab(targetTabId, found.store);
				const destination = resolveDuplicateDestination(workingStore, elementId, {
					beforeId,
					afterId,
					parentId,
					index: args.index
				});
				if (!destination.ok) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: destination.error
						}]
					});
					return;
				}
				const { parentId: destParentId, index: destIndex } = destination;
				const entries = args.copies ?? [{}];
				let anchor = anchorRootBox(workingStore, elementId);
				const boxes = occupiedRootBoxes(workingStore);
				const stamped = duplicateOperations(workingStore, elementId, entries, destination, (clone) => {
					anchor = placeNewRoot$1(workingStore, clone, anchor, boxes);
					boxes.push(anchor);
				});
				if (typeof stamped === "string") {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: stamped
						}]
					});
					return;
				}
				const { copyIds, copiedFrom, errors } = stamped;
				commitAi$1(targetTabId, stamped.ops);
				const nextStore = pageTree$1(targetTabId) ?? workingStore;
				if (chatTabId) for (const id of copyIds) addAiCopyTarget(chatTabId, id);
				notePresence(nextStore, copyIds, "write");
				const delta = coveringReadDelta(workingStore, nextStore, destParentId ?? copyIds[0]);
				const where = destParentId ? `inside ${destParentId} from index ${destIndex}` : copyIds.length === 1 ? "as a new top-level frame" : "as new top-level frames";
				const errorText = errors.length > 0 ? `\nErrors:\n${errors.map((e) => `- ${e}`).join("\n")}` : "";
				const copyTable = copiedFrom.length > 150 ? `\n${describeCopyIdsForAgent(elementId, copiedFrom)}` : "";
				respond({
					content: [{
						type: "text",
						text: `Duplicated ${elementId} ${copyIds.length === 1 ? "once" : `${copyIds.length} times`} ${where}. New elements:\n${describeTreeForAgent(nextStore, copyIds)}${copyTable}${errorText}`
					}],
					_coveringReadChanges: delta._coveringReadChanges,
					_coveringReads: Object.fromEntries(copyIds.map((id) => [id, hashElementSubtreeFrom(nextStore, id)])),
					_coveringReadsFromSource: copiedCoveringReads(workingStore, nextStore, elementId, copyIds, copiedFrom),
					_createdElementIds: copyIds
				});
				return;
			}
			if (operation === "delete_element") {
				lastCommitAtRef.current = Date.now();
				const elementId = args.element_id;
				const found = findElementTab(elementId);
				if (!found || !getById(found.store, elementId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${elementId}`
						}]
					});
					return;
				}
				const targetTabId = found.tabId;
				const targetStore = found.store;
				if (!isSubtreeAsRead$1(targetStore, elementId, args.expected_hash)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: changedSinceReadMessage$1(elementId)
						}]
					});
					return;
				}
				const op = createRemoveOperation(targetStore, elementId);
				if (op) commitAi$1(targetTabId, [op]);
				const nextStore = pageTree$1(targetTabId) ?? targetStore;
				const parentId = getParentId(targetStore, elementId);
				if (parentId && parentId !== "ROOT") notePresence(nextStore, [parentId], "write");
				respond({
					content: [{
						type: "text",
						text: `Deleted element ${elementId}`
					}],
					...coveringReadDelta(targetStore, nextStore, elementId)
				});
				return;
			}
			if (operation === "patch_elements") {
				const patches = Array.isArray(args.updates) ? args.updates : [];
				if (patches.length === 0) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: "updates must be a non-empty array"
						}]
					});
					return;
				}
				const { tabs: plans, errors } = planPatchesByTab(patches, findElementTab);
				const applied = [];
				const changes = [];
				for (const [targetTabId, plan] of plans) {
					const { targetStore, ops } = plan;
					if (ops.length > 0) {
						lastCommitAtRef.current = Date.now();
						commitAi$1(targetTabId, ops);
					}
					const nextStore = pageTree$1(targetTabId) ?? targetStore;
					notePresence(nextStore, plan.applied, "write");
					applied.push(...plan.applied);
					const seenRoots = /* @__PURE__ */ new Set();
					for (const id of plan.applied) {
						const rootId = rootAncestorId(targetStore, id);
						if (!rootId || seenRoots.has(rootId)) continue;
						seenRoots.add(rootId);
						changes.push(...coveringReadDelta(targetStore, nextStore, id)._coveringReadChanges);
					}
				}
				const summary = `Patched ${applied.length} of ${patches.length} element(s).`;
				respond({
					...applied.length === 0 ? { isError: true } : {},
					content: [{
						type: "text",
						text: errors.length > 0 ? `${summary}\nErrors:\n${errors.map((e) => `- ${e}`).join("\n")}` : summary
					}],
					_coveringReadChanges: changes
				});
				return;
			}
			if (operation === "rename_element") {
				const elementId = args.element_id;
				const name = typeof args.name === "string" ? args.name.trim() : "";
				const found = findElementTab(elementId);
				if (!found || !getById(found.store, elementId)) {
					respond({
						isError: true,
						content: [{
							type: "text",
							text: `Element not found: ${elementId}`
						}]
					});
					return;
				}
				const targetTabId = found.tabId;
				const op = createSetNameOperation(found.store, elementId, name || void 0);
				if (op) {
					lastCommitAtRef.current = Date.now();
					commitAi$1(targetTabId, [op]);
				}
				const nextStore = pageTree$1(targetTabId) ?? found.store;
				notePresence(nextStore, [elementId], "write");
				respond({
					content: [{
						type: "text",
						text: name ? `Renamed ${elementId} to "${name}"` : `Cleared the custom name of ${elementId}`
					}],
					...coveringReadDelta(found.store, nextStore, elementId)
				});
				return;
			}
			respond({
				isError: true,
				content: [{
					type: "text",
					text: `Unknown canvas operation: ${operation}`
				}]
			});
		} catch (err) {
			respond({
				isError: true,
				content: [{
					type: "text",
					text: `Canvas operation error: ${err}`
				}]
			});
		}
	});
}
function useCanvasToolHandler(deps) {
	const $ = (0, import_compiler_runtime.c)(7);
	let t0;
	if ($[0] !== deps) {
		t0 = () => deps;
		$[0] = deps;
		$[1] = t0;
	} else t0 = $[1];
	const latestDeps = (0, import_react.useEffectEvent)(t0);
	let t1;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ new Map();
		$[2] = t1;
	} else t1 = $[2];
	const pendingPageCreationsRef = (0, import_react.useRef)(t1);
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ new Map();
		$[3] = t2;
	} else t2 = $[3];
	const drawPreviewsRef = (0, import_react.useRef)(t2);
	const lastCommitAtRef = (0, import_react.useRef)(0);
	let t3;
	if ($[4] !== latestDeps) {
		t3 = () => {
			if (typeof window === "undefined" || !window.api?.on) return;
			return subscribeToCanvasToolRequests(latestDeps, pendingPageCreationsRef, drawPreviewsRef, lastCommitAtRef);
		};
		$[4] = latestDeps;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[6] = t4;
	} else t4 = $[6];
	(0, import_react.useEffect)(t3, t4);
}

export { useCanvasToolHandler };
