// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/lastResult.ts
import { getById } from "../../../../../compiler/src/store/read.js";
import { componentNamesForWritePath, instanceIdsForComponentNames } from "../../../canvas/utils/followAiCamera.js";

/**
* "Show last result" for agents-v2 chats.
*
* Electron main saves what each turn changed on the assistant message as
* `metadata.workTargets` (see `AgentWorkTarget`). v1 chats keep their own
* shape and lookup in `utils/chatWorkTarget.ts`.
*/
function workTargets(message) {
	const targets = message.metadata?.workTargets;
	if (!Array.isArray(targets)) return [];
	return targets.filter((target) => !!target && typeof target === "object" && Array.isArray(target.elementIds));
}
/** Find the most recent surviving work, including instances of edited files. */
function lastAgentWorkTarget(messages, tabs, componentIndex, storeOf) {
	for (let m = messages.length - 1; m >= 0; m--) {
		const message = messages[m];
		if (message.role !== "assistant") continue;
		const targets = workTargets(message);
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
			if (target.elementIds.length || !target.path) continue;
			const names = componentNamesForWritePath(target.path, componentIndex);
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

export { lastAgentWorkTarget };
