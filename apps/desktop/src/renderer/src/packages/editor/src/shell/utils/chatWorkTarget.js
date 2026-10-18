// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatWorkTarget.ts
import { getById, getParentId } from "../../../../compiler/src/store/read.js";
import { componentNamesForWritePath, instanceIdsForComponentNames } from "../../canvas/utils/followAiCamera.js";
import { getBaseToolName$1, toolPartName } from "../components/chat-v2/activity.js";

/** Show the complete top-level frame containing each edited node. */
function outermostChatWorkIds(store, elementIds) {
	const roots = /* @__PURE__ */ new Set();
	for (const id of elementIds) {
		if (id === "ROOT" || !getById(store, id)) continue;
		let root = id;
		let parent = getParentId(store, root);
		while (parent && parent !== "ROOT") {
			root = parent;
			parent = getParentId(store, root);
		}
		roots.add(root);
	}
	return [...roots];
}
function chatWorkTargets(results) {
	return results.flatMap((result) => {
		if (result.payload?.error || result.payload?.success === false || ![
			"add_jsx",
			"duplicate_element",
			"update_jsx",
			"replace_with_component",
			"Write",
			"Edit"
		].includes(result.type)) return [];
		const elementIds = [...new Set([
			...result.createdElementIds ?? [],
			result.createdElementId,
			result.payload?.elementId
		].filter((id) => typeof id === "string" && id.length > 0))];
		const { componentName, path, canvasId } = result.payload ?? {};
		return elementIds.length || componentName || path ? [{
			elementIds,
			componentName,
			path,
			canvasId
		}] : [];
	});
}
/** A top-level line of a canvas result outline: `- <label> <id> …`. */
var OUTLINE_ROOT_ID = /^- [^\s:]+ (\S+)/gm;
/** Text of a tool result, in any of the shapes the agent SDKs deliver. */
function toolResultText(output) {
	if (typeof output === "string") return output;
	if (Array.isArray(output)) return output.map(toolResultText).join("\n");
	if (!output || typeof output !== "object") return "";
	const record = output;
	if (typeof record.text === "string") return record.text;
	return Array.isArray(record.content) ? toolResultText(record.content) : "";
}
/** Canvas work in an agents v2 message, read from its finished tool calls. */
function partWorkTargets(parts) {
	return parts.flatMap((part) => {
		if (part.type !== "dynamic-tool" && !part.type.startsWith("tool-") || part.state !== "output-available") return [];
		if (part.output?.isError === true) return [];
		const input = part.input ?? {};
		const canvasId = typeof input.canvas_id === "string" ? input.canvas_id : void 0;
		const ids = (values) => values.filter((id) => typeof id === "string" && id.length > 0);
		switch (getBaseToolName$1(toolPartName(part))) {
			case "canvas_add":
			case "canvas_insert":
			case "canvas_duplicate": {
				const elementIds = [...toolResultText(part.output).matchAll(OUTLINE_ROOT_ID)].map((match) => match[1]);
				return elementIds.length ? [{
					elementIds,
					canvasId
				}] : [];
			}
			case "canvas_update":
			case "canvas_edit": {
				const elementIds = ids([input.element_id]);
				return elementIds.length ? [{ elementIds }] : [];
			}
			case "canvas_patch": {
				const updates = Array.isArray(input.updates) ? input.updates : [];
				const elementIds = [...new Set(ids(updates.map((update) => update?.element_id)))];
				return elementIds.length ? [{ elementIds }] : [];
			}
			case "project_write":
			case "project_edit": return typeof input.file_path === "string" ? [{
				elementIds: [],
				path: input.file_path
			}] : [];
			default: return [];
		}
	});
}
/** Find the most recent surviving canvas work, including instances of edited files. */
function lastChatWorkTarget(messages, tabs, componentIndex, storeOf) {
	for (let m = messages.length - 1; m >= 0; m--) {
		const message = messages[m];
		if (message.role !== "assistant") continue;
		const targets = message.workTargets ?? (message.parts ? partWorkTargets(message.parts) : chatWorkTargets(message.toolResults ?? []));
		for (let t = targets.length - 1; t >= 0; t--) {
			const target = targets[t];
			for (const tab of tabs) {
				const store = storeOf(tab.id);
				const elementIds = target.elementIds.filter((id) => store && !!getById(store, id));
				if (elementIds.length) return {
					tabId: tab.id,
					elementIds
				};
			}
			const unloadedTab = target.canvasId && tabs.find((tab) => (tab.canvasId === target.canvasId || tab.id === target.canvasId) && !storeOf(tab.id));
			if (unloadedTab && target.elementIds.length) return {
				tabId: unloadedTab.id,
				elementIds: target.elementIds
			};
			if (target.elementIds.length) continue;
			const names = target.componentName ? [target.componentName] : target.path ? componentNamesForWritePath(target.path, componentIndex) : [];
			for (const tab of tabs) {
				const store = storeOf(tab.id);
				if (!store) continue;
				const elementIds = instanceIdsForComponentNames(store, names);
				if (elementIds.length) return {
					tabId: tab.id,
					elementIds
				};
			}
		}
	}
	return null;
}

export { chatWorkTargets, lastChatWorkTarget, outermostChatWorkIds };
