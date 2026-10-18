// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useAgentsV2Chat.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getSelectedElementIds } from "../../shared/state/selection.js";
import { AGENT_CHAT_DROP_TAB_CHANNEL } from "../../../../ai/src/protocol.js";
import { isAgentSetUp, useAgentSetup } from "../components/chat-v2/useAgentSetup.js";
import { coerceUiMessage, createAgentChatIpc, defaultUserMessageText } from "../../../../ai/src/client/transport.js";
import { readAgentModelCatalog, readAgentModelId, readSelectedAgentId, readStoredAgentSession, readStoredString, storeString, subscribeSelectedAgentId, writeAgentModelCatalog, writeAgentModelId, writeAgentSessionId, writeSelectedAgentId } from "./agentChatStorage.js";

/**
* Editor host adapter for the agents-v2 chat stack.
*
* ChatPanelV2 is editor-agnostic; this hook owns the Electron IPC bridges,
* picker persistence, session resume tokens, approvals, titles, and the
* `AgentChatHost` built for each chat tab. It also exports the availability
* gate for the `@Agent` comment mention.
*/
/**
* agents-v2 chat IPC. `window.api` is a stable preload singleton, so the
* adapter is cached at module scope to keep a stable identity for `useChat`'s
* transport. Returns null outside Electron (the web shell has no streaming).
*/
var agentChatIpcSingleton = null;
function getAgentChatIpc() {
	if (typeof window === "undefined") return null;
	const api = window.api;
	if (!api?.on || !api?.send || !api?.invoke) return null;
	if (!agentChatIpcSingleton) agentChatIpcSingleton = createAgentChatIpc(api);
	return agentChatIpcSingleton;
}
/**
* Whether the agents-v2 stack owns the chat panel and canvas tools for this
* session. Single source of truth for `useAgentsV2Chat().active`, so callers
* that cannot reach that hook (the comment agent gate) stay in step with it.
*/
function isAgentsV2Active(enabled, projectPath) {
	return Boolean(enabled && getAgentChatIpc() && projectPath);
}
/**
* Availability of the `@Agent` comment mention on the agents-v2 stack, for
* `PetalEditor`. The v1 gate reads the `claude:check-status` IPC, which
* only exists for the Claude Code CLI; this reads the agents-v2 wire for the
* agent this project last selected, so a Codex or Cursor user is not judged by
* Claude's login state. It is separate from `useAgentsV2Chat` because the
* comment mention renders above that hook.
*
* Checks on mount and on window focus, like the v1 gate. The answer only
* decides whether the mention offers itself; if a stale selection turns out to
* be logged out, `ChatPanelV2` still opens its own setup dialog when the run
* starts. A project with no selection yet is not ready until the picker adopts
* the runtime's first agent.
*/
function useCommentAgentAvailability(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { enabled, projectPath } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = getAgentChatIpc();
		$[0] = t1;
	} else t1 = $[0];
	const ipc = t1;
	let t2;
	if ($[1] !== enabled || $[2] !== projectPath) {
		t2 = isAgentsV2Active(enabled, projectPath);
		$[1] = enabled;
		$[2] = projectPath;
		$[3] = t2;
	} else t2 = $[3];
	const active = t2;
	let t3;
	if ($[4] !== projectPath) {
		t3 = () => readSelectedAgentId(projectPath);
		$[4] = projectPath;
		$[5] = t3;
	} else t3 = $[5];
	const getAgentId = t3;
	const agentId = (0, import_react.useSyncExternalStore)(subscribeSelectedAgentId, getAgentId, getAgentId);
	let t4;
	if ($[6] !== active || $[7] !== agentId) {
		t4 = ipc && active && agentId ? () => ipc.checkStatus(agentId) : void 0;
		$[6] = active;
		$[7] = agentId;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== agentId) {
		t5 = { agentId };
		$[9] = agentId;
		$[10] = t5;
	} else t5 = $[10];
	const setup = useAgentSetup(t4, t5);
	let t6;
	if ($[11] !== active || $[12] !== setup) {
		t6 = active && isAgentSetUp(setup.status);
		$[11] = active;
		$[12] = setup;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== active || $[15] !== t6) {
		t7 = {
			active,
			ready: t6
		};
		$[14] = active;
		$[15] = t6;
		$[16] = t7;
	} else t7 = $[16];
	return t7;
}
/** Drop a tab's runtime state (resume token + MCP keys) so a reused id cannot inherit them. */
function dropAgentChatTab(projectPath, chatId) {
	if (!projectPath) return;
	window.api?.send?.(AGENT_CHAT_DROP_TAB_CHANNEL, {
		projectId: projectPath,
		chatTabId: chatId
	});
}
var AGENT_POLICY_STORAGE_KEY = "petal-agents-v2-policy";
var AGENT_EFFORT_STORAGE_KEY = "petal-agents-v2-effort";
var AGENT_FAST_STORAGE_KEY = "petal-agents-v2-fast";
/** Default reasoning effort for the v2 chat before the user picks one. */
var AGENT_DEFAULT_EFFORT = "high";
/** Ask again when the first catalog answer is empty. A logged-out agent stays empty after this. */
var MODEL_LIST_ATTEMPTS = 4;
var MODEL_LIST_RETRY_MS = 400;
/**
* Fetch an agent's model catalog with retries. `onModels` fires once per
* answered attempt; the caller decides whether to keep an empty answer.
* Returns a cancel function for the effect using it.
*/
function loadModelCatalog(ipc, targetAgentId, onModels) {
	let cancelled = false;
	let attempt = 0;
	let timer;
	const load = () => {
		attempt += 1;
		ipc.listModels(targetAgentId).then((nextModels) => {
			if (cancelled) return;
			const final = nextModels.length > 0 || attempt >= MODEL_LIST_ATTEMPTS;
			onModels(nextModels, final);
			if (!final) timer = setTimeout(load, MODEL_LIST_RETRY_MS);
		}).catch(() => {
			if (cancelled || attempt >= MODEL_LIST_ATTEMPTS) return;
			timer = setTimeout(load, MODEL_LIST_RETRY_MS);
		});
	};
	load();
	return () => {
		cancelled = true;
		clearTimeout(timer);
	};
}
/**
* Derive the model to show from a catalog. `preferred` is the tab's own choice.
* Returns undefined when the catalog is empty (no cached catalog yet).
*/
function resolveModelId(models, preferred, agentId) {
	if (models.length === 0) return void 0;
	if (preferred && models.some((model) => model.id === preferred)) return preferred;
	const lastUsed = readAgentModelId(agentId);
	if (lastUsed && models.some((model) => model.id === lastUsed)) return lastUsed;
	return models.find((model) => model.isDefault)?.id ?? models[0]?.id;
}
function useAgentsV2Chat(t0) {
	const $ = (0, import_compiler_runtime.c)(90);
	const { enabled, projectPath, allowedPaths, onAddAllowedPath, onRemoveAllowedPath, onClearAllowedPaths, onOpenSettings, setChatTabs, chatTabsRef, getMessages, pendingChatTitles, requestedChatTitles, handleChatStreamStart, handleChatStreamFinish, saveChatMessages, clearAgentPresence, activeTab, focusedComponent } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = getAgentChatIpc();
		$[0] = t1;
	} else t1 = $[0];
	const ipc = t1;
	const bridge = ipc;
	let t2;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [];
		$[1] = t2;
	} else t2 = $[1];
	const [agents, setAgents] = (0, import_react.useState)(t2);
	let t3;
	if ($[2] !== projectPath) {
		t3 = () => {
			const startingAgentId = readSelectedAgentId(projectPath);
			if (!startingAgentId) return {};
			const cached = readAgentModelCatalog(startingAgentId);
			return cached ? { [startingAgentId]: cached } : {};
		};
		$[2] = projectPath;
		$[3] = t3;
	} else t3 = $[3];
	const [modelsByAgent, setModelsByAgent] = (0, import_react.useState)(t3);
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ new Set();
		$[4] = t4;
	} else t4 = $[4];
	const neededAgentsRef = (0, import_react.useRef)(t4);
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ new Set();
		$[5] = t5;
	} else t5 = $[5];
	const catalogInflightRef = (0, import_react.useRef)(t5);
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ new Map();
		$[6] = t6;
	} else t6 = $[6];
	const firstUserTextRef = (0, import_react.useRef)(t6);
	let t7;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ new Map();
		$[7] = t7;
	} else t7 = $[7];
	const tabSettingsRef = (0, import_react.useRef)(t7);
	const [, renderTabs] = (0, import_react.useReducer)(_temp$25, 0);
	let t8;
	if ($[8] !== projectPath) {
		t8 = () => readSelectedAgentId(projectPath);
		$[8] = projectPath;
		$[9] = t8;
	} else t8 = $[9];
	const [agentId, setAgentId] = (0, import_react.useState)(t8);
	const pickerAgentId = agentId ?? agents[0]?.id;
	const [policy, setPolicy] = (0, import_react.useState)(_temp2$15);
	const [effort, setEffort] = (0, import_react.useState)(_temp3$11);
	const [fast, setFast] = (0, import_react.useState)(_temp4$11);
	let t9;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = [];
		$[10] = t9;
	} else t9 = $[10];
	const [approvals, setApprovals] = (0, import_react.useState)(t9);
	const [planLimit, setPlanLimit] = (0, import_react.useState)(null);
	let t10;
	let t11;
	if ($[11] !== enabled) {
		t10 = () => {
			if (!enabled) return;
			if (!ipc) return;
			let cancelled = false;
			ipc.listAgents().then((nextAgents) => {
				if (cancelled || nextAgents.length === 0) return;
				setAgents(nextAgents);
				setAgentId((previous) => nextAgents.some((agent) => agent.id === previous) ? previous : nextAgents[0].id);
			}).catch(_temp5$10);
			return () => {
				cancelled = true;
			};
		};
		t11 = [enabled, ipc];
		$[11] = enabled;
		$[12] = t10;
		$[13] = t11;
	} else {
		t10 = $[12];
		t11 = $[13];
	}
	(0, import_react.useEffect)(t10, t11);
	let t12;
	let t13;
	if ($[14] !== pickerAgentId || $[15] !== projectPath) {
		t12 = () => {
			if (pickerAgentId && readSelectedAgentId(projectPath) !== pickerAgentId) writeSelectedAgentId(projectPath, pickerAgentId);
		};
		t13 = [pickerAgentId, projectPath];
		$[14] = pickerAgentId;
		$[15] = projectPath;
		$[16] = t12;
		$[17] = t13;
	} else {
		t12 = $[16];
		t13 = $[17];
	}
	(0, import_react.useEffect)(t12, t13);
	let t14;
	let t15;
	if ($[18] !== enabled || $[19] !== pickerAgentId) {
		t14 = () => {
			if (!enabled) return;
			if (!ipc) return;
			if (!pickerAgentId) return;
			return loadModelCatalog(ipc, pickerAgentId, (nextModels, final) => {
				setModelsByAgent((previous_0) => {
					const existing = previous_0[pickerAgentId] ?? readAgentModelCatalog(pickerAgentId);
					if (nextModels.length === 0 && !final && existing && existing.length > 0) return previous_0;
					writeAgentModelCatalog(pickerAgentId, nextModels);
					return {
						...previous_0,
						[pickerAgentId]: nextModels
					};
				});
			});
		};
		t15 = [
			enabled,
			pickerAgentId,
			ipc
		];
		$[18] = enabled;
		$[19] = pickerAgentId;
		$[20] = t14;
		$[21] = t15;
	} else {
		t14 = $[20];
		t15 = $[21];
	}
	(0, import_react.useEffect)(t14, t15);
	let t16;
	let t17;
	if ($[22] !== enabled || $[23] !== modelsByAgent) {
		t16 = () => {
			if (!enabled || !ipc) return;
			const inflight = catalogInflightRef.current;
			const missing = [...neededAgentsRef.current].filter((target) => modelsByAgent[target] === void 0 && !inflight.has(target));
			if (missing.length === 0) return;
			const cancelAll = missing.map((target_0) => {
				inflight.add(target_0);
				return loadModelCatalog(ipc, target_0, (nextModels_0, final_0) => {
					const existing_0 = modelsByAgent[target_0] ?? readAgentModelCatalog(target_0);
					if (nextModels_0.length === 0 && !final_0 && existing_0 && existing_0.length > 0) return;
					writeAgentModelCatalog(target_0, nextModels_0);
					inflight.delete(target_0);
					setModelsByAgent((previous_1) => ({
						...previous_1,
						[target_0]: nextModels_0
					}));
				});
			});
			return () => {
				for (const cancel of cancelAll) cancel();
				for (const target_1 of missing) inflight.delete(target_1);
			};
		};
		t17 = [
			enabled,
			ipc,
			modelsByAgent
		];
		$[22] = enabled;
		$[23] = modelsByAgent;
		$[24] = t16;
		$[25] = t17;
	} else {
		t16 = $[24];
		t17 = $[25];
	}
	(0, import_react.useEffect)(t16, t17);
	let t18;
	let t19;
	if ($[26] !== enabled || $[27] !== projectPath) {
		t18 = () => {
			if (!enabled || typeof window === "undefined") return;
			const api = window.api;
			if (!api?.on) return;
			const onApproval = (approval) => {
				if (approval.projectId && projectPath && approval.projectId !== projectPath) return;
				setApprovals((previous_2) => previous_2.some((item) => item.approvalId === approval.approvalId) ? previous_2 : [...previous_2, approval]);
			};
			const onPlanLimit = (event) => {
				if (event?.projectId && projectPath && event.projectId !== projectPath) return;
				setPlanLimit({
					reason: event?.reason ?? "mcp_usage",
					message: event?.message ?? "Plan limit reached."
				});
			};
			const offApproval = api.on("mcp_tool_approval_needed", onApproval);
			const offPlanLimit = api.on("plan_limit", onPlanLimit);
			return () => {
				offApproval?.();
				offPlanLimit?.();
			};
		};
		t19 = [enabled, projectPath];
		$[26] = enabled;
		$[27] = projectPath;
		$[28] = t18;
		$[29] = t19;
	} else {
		t18 = $[28];
		t19 = $[29];
	}
	(0, import_react.useEffect)(t18, t19);
	let t20;
	if ($[30] !== chatTabsRef || $[31] !== pendingChatTitles || $[32] !== requestedChatTitles || $[33] !== saveChatMessages || $[34] !== setChatTabs) {
		t20 = (tabId, messages) => {
			saveChatMessages(tabId, messages);
			const firstUser = messages.find(_temp6$7);
			const fromMessage = firstUser ? defaultUserMessageText(firstUser).trim() : "";
			if (fromMessage) firstUserTextRef.current.set(tabId, fromMessage);
			const fallbackTitle = fromMessage.slice(0, 80);
			setChatTabs((previous_3) => previous_3.map((tab) => tab.id === tabId ? {
				...tab,
				title: tab.title ?? (fallbackTitle || null)
			} : tab));
			if (!firstUser || requestedChatTitles.current.has(tabId)) return;
			const existing_1 = chatTabsRef.current.find((tab_0) => tab_0.id === tabId);
			if (existing_1?.generatedTitle) return;
			if (existing_1?.title && !pendingChatTitles.current.has(tabId)) return;
			pendingChatTitles.current.add(tabId);
		};
		$[30] = chatTabsRef;
		$[31] = pendingChatTitles;
		$[32] = requestedChatTitles;
		$[33] = saveChatMessages;
		$[34] = setChatTabs;
		$[35] = t20;
	} else t20 = $[35];
	const applyAgentMessages = t20;
	let t21;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = (approvalId, approved) => {
			setApprovals((previous_4) => previous_4.filter((item_0) => item_0.approvalId !== approvalId));
			window.api?.invoke?.("mcp_tool_approval", {
				approvalId,
				approved
			});
		};
		$[36] = t21;
	} else t21 = $[36];
	const handleAgentResolveApproval = t21;
	let t22;
	if ($[37] !== allowedPaths || $[38] !== chatTabsRef || $[39] !== pendingChatTitles || $[40] !== projectPath || $[41] !== requestedChatTitles || $[42] !== setChatTabs) {
		t22 = (chatId, nextAgentId, sessionId) => {
			if (projectPath) writeAgentSessionId(projectPath, chatId, nextAgentId, sessionId);
			if (!ipc || requestedChatTitles.current.has(chatId)) return;
			if (!pendingChatTitles.current.has(chatId)) return;
			requestedChatTitles.current.add(chatId);
			const tab_1 = chatTabsRef.current.find((item_1) => item_1.id === chatId);
			const fromMessage_0 = firstUserTextRef.current.get(chatId) ?? "";
			const fallbackTitle_0 = fromMessage_0.slice(0, 80) || tab_1?.title?.trim() || "New chat";
			ipc.generateTitle({
				agentId: nextAgentId,
				sessionId,
				...projectPath ? { projectId: projectPath } : {},
				...allowedPaths?.[0] ? { cwd: allowedPaths[0] } : {},
				...fromMessage_0 ? { prompt: fromMessage_0.slice(0, 8e3) } : {}
			}).then((title) => {
				if (!pendingChatTitles.current.delete(chatId)) return;
				const generatedTitle = title.trim() || fallbackTitle_0;
				setChatTabs((previous_5) => previous_5.map((tab_2) => tab_2.id === chatId ? {
					...tab_2,
					title: generatedTitle,
					generatedTitle
				} : tab_2));
			}).catch(() => {
				pendingChatTitles.current.delete(chatId);
			});
		};
		$[37] = allowedPaths;
		$[38] = chatTabsRef;
		$[39] = pendingChatTitles;
		$[40] = projectPath;
		$[41] = requestedChatTitles;
		$[42] = setChatTabs;
		$[43] = t22;
	} else t22 = $[43];
	const handleAgentSessionId = t22;
	let t23;
	if ($[44] !== clearAgentPresence || $[45] !== handleChatStreamFinish) {
		t23 = (chatId_0) => {
			handleChatStreamFinish(chatId_0);
			clearAgentPresence(chatId_0);
		};
		$[44] = clearAgentPresence;
		$[45] = handleChatStreamFinish;
		$[46] = t23;
	} else t23 = $[46];
	const handleAgentStreamEnd = t23;
	let t24;
	if ($[47] !== activeTab || $[48] !== focusedComponent) {
		t24 = () => {
			const ids = [...getSelectedElementIds()];
			if (!activeTab && !focusedComponent?.name && ids.length === 0) return;
			return {
				...activeTab ? { activePage: {
					id: activeTab.canvasId || activeTab.id,
					name: activeTab.name
				} } : {},
				...focusedComponent?.name ? { focusedComponent: focusedComponent.name } : {},
				...ids.length > 0 ? { selectedElementIds: ids } : {}
			};
		};
		$[47] = activeTab;
		$[48] = focusedComponent;
		$[49] = t24;
	} else t24 = $[49];
	const buildPromptContext = t24;
	let t25;
	if ($[50] !== agents || $[51] !== allowedPaths || $[52] !== applyAgentMessages || $[53] !== approvals || $[54] !== buildPromptContext || $[55] !== effort || $[56] !== fast || $[57] !== handleAgentSessionId || $[58] !== handleAgentStreamEnd || $[59] !== handleChatStreamStart || $[60] !== modelsByAgent || $[61] !== onAddAllowedPath || $[62] !== onClearAllowedPaths || $[63] !== onOpenSettings || $[64] !== onRemoveAllowedPath || $[65] !== pickerAgentId || $[66] !== planLimit || $[67] !== policy || $[68] !== projectPath || $[69] !== renderTabs) {
		t25 = (chatTabId, messages_0) => {
			const stored = projectPath ? readStoredAgentSession(projectPath, chatTabId) : null;
			let settings = tabSettingsRef.current.get(chatTabId);
			if (!settings) {
				settings = {
					effort,
					fast,
					policy
				};
				tabSettingsRef.current.set(chatTabId, settings);
			}
			const tab_3 = settings;
			if (!tab_3.agentId) tab_3.agentId = messages_0.length > 0 && stored ? stored.agentId : pickerAgentId;
			const threadAgentId = (tab_3.external || agents.length === 0 || agents.some((agent_0) => agent_0.id === tab_3.agentId) ? tab_3.agentId : pickerAgentId) ?? "";
			neededAgentsRef.current.add(threadAgentId);
			const threadModels = modelsByAgent[threadAgentId] ?? readAgentModelCatalog(threadAgentId) ?? [];
			const threadModelId = resolveModelId(threadModels, tab_3.modelId, threadAgentId);
			if (threadModelId) tab_3.modelId = threadModelId;
			const updateTab = (patch) => {
				Object.assign(tab_3, patch);
				renderTabs();
			};
			return {
				initialMessages: messages_0.map(_temp7$5),
				onMessagesChange: (next) => applyAgentMessages(chatTabId, next),
				sessionId: stored?.agentId === threadAgentId ? stored?.sessionId : void 0,
				onSessionId: (sessionId_0) => handleAgentSessionId(chatTabId, threadAgentId, sessionId_0),
				agents,
				models: threadModels,
				listSlashCommands: async (cwd) => {
					if (!ipc) return [];
					return ipc.listSlashCommands(threadAgentId, cwd, projectPath);
				},
				listMcpServers: async () => {
					if (!ipc) return { servers: [] };
					return ipc.listMcpServers(threadAgentId, projectPath);
				},
				...ipc && threadAgentId ? {
					checkStatus: (t26) => {
						const agentId_0 = t26 === void 0 ? threadAgentId : t26;
						return ipc.checkStatus(agentId_0);
					},
					login: (t27) => {
						const agentId_1 = t27 === void 0 ? threadAgentId : t27;
						return ipc.login(agentId_1);
					},
					logout: (t28) => {
						const agentId_2 = t28 === void 0 ? threadAgentId : t28;
						return ipc.logout(agentId_2);
					}
				} : {},
				agentId: threadAgentId,
				...threadModelId ? { modelId: threadModelId } : {},
				onAgentChange: (id) => {
					updateTab({
						agentId: id,
						modelId: void 0,
						external: false
					});
					setAgentId(id);
					writeSelectedAgentId(projectPath, id);
				},
				onModelChange: (id_0) => {
					updateTab({ modelId: id_0 });
					writeAgentModelId(threadAgentId, id_0);
				},
				policy: tab_3.policy,
				onPolicyChange: (nextPolicy) => {
					updateTab({ policy: nextPolicy });
					setPolicy(nextPolicy);
					storeString(AGENT_POLICY_STORAGE_KEY, nextPolicy);
				},
				effort: tab_3.effort,
				onEffortChange: (nextEffort) => {
					updateTab({ effort: nextEffort });
					setEffort(nextEffort);
					storeString(AGENT_EFFORT_STORAGE_KEY, nextEffort);
				},
				fast: tab_3.fast,
				onFastChange: (nextFast) => {
					updateTab({ fast: nextFast });
					setFast(nextFast);
					storeString(AGENT_FAST_STORAGE_KEY, String(nextFast));
				},
				...allowedPaths?.[0] ? { cwd: allowedPaths[0] } : {},
				...allowedPaths && allowedPaths.length > 1 ? { additionalDirectories: allowedPaths.slice(1) } : {},
				...onAddAllowedPath ? { onAddAllowedPath } : {},
				...onRemoveAllowedPath ? { onRemoveAllowedPath } : {},
				...onClearAllowedPaths ? { onClearAllowedPaths } : {},
				...onOpenSettings ? { onOpenSettings } : {},
				buildPromptContext,
				onStreamStart: () => {
					if (threadModelId && !tab_3.external) writeAgentModelId(threadAgentId, threadModelId);
					setApprovals((previous_6) => previous_6.filter((approval_0) => approval_0.chatTabId !== chatTabId));
					handleChatStreamStart(chatTabId);
				},
				onStreamEnd: () => handleAgentStreamEnd(chatTabId),
				...planLimit ? { planLimit } : {},
				onDismissPlanLimit: () => setPlanLimit(null),
				approvals: approvals.filter((approval_1) => !approval_1.chatTabId || approval_1.chatTabId === chatTabId),
				onResolveApproval: handleAgentResolveApproval
			};
		};
		$[50] = agents;
		$[51] = allowedPaths;
		$[52] = applyAgentMessages;
		$[53] = approvals;
		$[54] = buildPromptContext;
		$[55] = effort;
		$[56] = fast;
		$[57] = handleAgentSessionId;
		$[58] = handleAgentStreamEnd;
		$[59] = handleChatStreamStart;
		$[60] = modelsByAgent;
		$[61] = onAddAllowedPath;
		$[62] = onClearAllowedPaths;
		$[63] = onOpenSettings;
		$[64] = onRemoveAllowedPath;
		$[65] = pickerAgentId;
		$[66] = planLimit;
		$[67] = policy;
		$[68] = projectPath;
		$[69] = renderTabs;
		$[70] = t25;
	} else t25 = $[70];
	const buildHost = t25;
	let t26;
	if ($[71] !== chatTabsRef || $[72] !== effort || $[73] !== fast || $[74] !== getMessages || $[75] !== pickerAgentId || $[76] !== policy || $[77] !== projectPath) {
		t26 = (chatId_1, targetAgentId, models, targetModelId) => {
			const existing_2 = chatTabsRef.current.find((tab_4) => tab_4.id === chatId_1);
			const stored_0 = projectPath ? readStoredAgentSession(projectPath, chatId_1) : null;
			const settings_0 = tabSettingsRef.current.get(chatId_1);
			const lockedAgent = settings_0?.agentId ?? stored_0?.agentId ?? pickerAgentId;
			if (existing_2 && getMessages(chatId_1).length > 0 && lockedAgent !== targetAgentId) throw new Error("An existing chat keeps its provider. Start a new chat to change providers.");
			const patch_0 = {
				agentId: targetAgentId,
				modelId: targetModelId,
				external: true
			};
			if (settings_0) Object.assign(settings_0, patch_0);
			else tabSettingsRef.current.set(chatId_1, {
				effort,
				fast,
				policy,
				...patch_0
			});
			setModelsByAgent((previous_7) => ({
				...previous_7,
				[targetAgentId]: models
			}));
		};
		$[71] = chatTabsRef;
		$[72] = effort;
		$[73] = fast;
		$[74] = getMessages;
		$[75] = pickerAgentId;
		$[76] = policy;
		$[77] = projectPath;
		$[78] = t26;
	} else t26 = $[78];
	const configureTab = t26;
	let t27;
	if ($[79] !== enabled || $[80] !== projectPath) {
		t27 = (chatId_2) => {
			tabSettingsRef.current.delete(chatId_2);
			if (!enabled) return;
			dropAgentChatTab(projectPath, chatId_2);
		};
		$[79] = enabled;
		$[80] = projectPath;
		$[81] = t27;
	} else t27 = $[81];
	const dropTab = t27;
	let t28;
	if ($[82] !== enabled || $[83] !== projectPath) {
		t28 = isAgentsV2Active(enabled, projectPath);
		$[82] = enabled;
		$[83] = projectPath;
		$[84] = t28;
	} else t28 = $[84];
	let t29;
	if ($[85] !== buildHost || $[86] !== configureTab || $[87] !== dropTab || $[88] !== t28) {
		t29 = {
			active: t28,
			bridge,
			catalog: ipc,
			buildHost,
			configureTab,
			dropTab
		};
		$[85] = buildHost;
		$[86] = configureTab;
		$[87] = dropTab;
		$[88] = t28;
		$[89] = t29;
	} else t29 = $[89];
	return t29;
}
function _temp7$5(message_0) {
	return coerceUiMessage(message_0);
}
function _temp6$7(message) {
	return message.role === "user";
}
function _temp5$10() {}
function _temp4$11() {
	return readStoredString(AGENT_FAST_STORAGE_KEY) === "true";
}
function _temp3$11() {
	return readStoredString(AGENT_EFFORT_STORAGE_KEY) ?? AGENT_DEFAULT_EFFORT;
}
function _temp2$15() {
	return readStoredString(AGENT_POLICY_STORAGE_KEY) === "ask" ? "ask" : "auto";
}
function _temp$25(count) {
	return count + 1;
}

export { dropAgentChatTab, useAgentsV2Chat, useCommentAgentAvailability };
