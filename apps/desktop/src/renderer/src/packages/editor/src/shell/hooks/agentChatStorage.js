// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/agentChatStorage.ts

function readStoredString(key) {
	if (typeof localStorage === "undefined") return void 0;
	try {
		return localStorage.getItem(key) ?? void 0;
	} catch {
		return;
	}
}
function storeString(key, value) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(key, value);
	} catch {}
}
var selectedAgentListeners = /* @__PURE__ */ new Set();
/** One picker selection per project, beside that project's per-chat sessions. */
function agentSelectionStorageKey(projectPath) {
	return `petal:agents-v2:${projectPath}:agent`;
}
/**
* The agent recorded on this project's chat sessions, for projects that predate
* the per-project selection. Session keys have no last-used time, and storage
* order is not recency, so this only resolves when every session names the same
* agent. Mixed agents stay unset and the picker adopts the runtime's first one.
* Enumeration can throw when storage is blocked; callers render either way.
*/
function agentFromProjectSessions(projectPath) {
	if (typeof localStorage === "undefined") return void 0;
	const prefix = `petal:agents-v2:${projectPath}:`;
	const suffix = ":session";
	try {
		let agentId;
		for (let index = 0; index < localStorage.length; index += 1) {
			const key = localStorage.key(index);
			if (!key || !key.startsWith(prefix) || !key.endsWith(suffix)) continue;
			const stored = readStoredAgentSession(projectPath, key.slice(prefix.length, key.length - 8));
			if (!stored) continue;
			if (agentId && agentId !== stored.agentId) return void 0;
			agentId = stored.agentId;
		}
		return agentId;
	} catch {
		return;
	}
}
/**
* The agent this project last selected, or undefined when it has never picked
* one. There is no built-in default: `useAgentsV2Chat` adopts the first agent
* the runtime lists, and readers that cannot reach that hook (the comment agent
* gate) read the selection here instead.
*/
function readSelectedAgentId(projectPath) {
	if (!projectPath) return void 0;
	return readStoredString(agentSelectionStorageKey(projectPath)) ?? agentFromProjectSessions(projectPath);
}
/** Notifies subscribers after a project's selection changes, for `useSyncExternalStore`. */
function subscribeSelectedAgentId(listener) {
	selectedAgentListeners.add(listener);
	return () => {
		selectedAgentListeners.delete(listener);
	};
}
function writeSelectedAgentId(projectPath, agentId) {
	if (!projectPath) return;
	storeString(agentSelectionStorageKey(projectPath), agentId);
	for (const listener of selectedAgentListeners) listener();
}
function agentSessionStorageKey(projectPath, chatId) {
	return `petal:agents-v2:${projectPath}:${chatId}:session`;
}
function agentModelStorageKey(agentId) {
	return `petal-agents-v2-model:${agentId}`;
}
/**
* The last model an agent used. One bounded key per agent, so it never grows
* with tab count. After a restart this is what a resumed thread falls back to.
*/
function readAgentModelId(agentId) {
	return readStoredString(agentModelStorageKey(agentId));
}
function writeAgentModelId(agentId, modelId) {
	storeString(agentModelStorageKey(agentId), modelId);
}
function agentModelCatalogStorageKey(agentId) {
	return `petal-agents-v2-models:${agentId}`;
}
/**
* The last catalog an agent reported. One bounded key per agent, refreshed in
* the background, so the picker renders immediately on agent switch.
*/
function readAgentModelCatalog(agentId) {
	if (typeof localStorage === "undefined") return void 0;
	try {
		const raw = localStorage.getItem(agentModelCatalogStorageKey(agentId));
		if (!raw) return void 0;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : void 0;
	} catch {
		return;
	}
}
function writeAgentModelCatalog(agentId, models) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(agentModelCatalogStorageKey(agentId), JSON.stringify(models));
	} catch {}
}
function readStoredAgentSession(projectPath, chatId) {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(agentSessionStorageKey(projectPath, chatId));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return typeof parsed.agentId === "string" && typeof parsed.sessionId === "string" ? parsed : null;
	} catch {
		return null;
	}
}
/** Copy a resume token from a `local-…` tab id onto the server id assigned later. */
function migrateAgentSessionId(projectPath, fromChatId, toChatId) {
	if (!fromChatId || !toChatId || fromChatId === toChatId) return;
	const stored = readStoredAgentSession(projectPath, fromChatId);
	if (!stored) return;
	writeAgentSessionId(projectPath, toChatId, stored.agentId, stored.sessionId);
}
function writeAgentSessionId(projectPath, chatId, agentId, sessionId) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(agentSessionStorageKey(projectPath, chatId), JSON.stringify({
			agentId,
			sessionId
		}));
	} catch {}
}

export { migrateAgentSessionId, readAgentModelCatalog, readAgentModelId, readSelectedAgentId, readStoredAgentSession, readStoredString, storeString, subscribeSelectedAgentId, writeAgentModelCatalog, writeAgentModelId, writeAgentSessionId, writeSelectedAgentId };
