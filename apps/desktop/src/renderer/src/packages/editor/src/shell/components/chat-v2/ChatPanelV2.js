// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/ChatPanelV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { ArchiveIcon, ArrowUpIcon, CaretDownIcon, CheckIcon, PlusIcon, SettingsIcon, StopIcon, WarningIcon$1, XIcon } from "../../../../../ui/src/icons.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../../ui/src/components/DropdownMenu.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { Content2, Root2, Trigger } from "../../../../../../vendor/@radix-ui/react-popover.js";
import { getById } from "../../../../../compiler/src/store/read.js";
import { IconBtn } from "../panels/styles/primitives.js";
import { isAddToPromptShortcut } from "../../utils/chatShortcuts.js";
import { IS_MAC } from "../../../shared/utils/platform.js";
import { useAssetResolver } from "../../../shared/contexts/AssetContext.js";
import { PetalLogo } from "../../../assets/PetalLogo.js";
import { elementChatReference } from "../../utils/elementChatReference.js";
import { CHAT_ATTACHMENT_ACCEPT, getDroppedAttachments, readPromptAttachment } from "../../utils/chatAttachments.js";
import { connectionDisplayName } from "../../hooks/useClaudeContext.js";
import { ContextMentionMenu } from "../ContextMentionMenu.js";
import { useChatScroll } from "../../hooks/useChatScroll.js";
import { InlineChatComposer, inlineChatPrompt, joinComposerDrafts, syncInlineReferenceSpacing } from "../../utils/inlineChatComposer.js";
import { FolderChip } from "../ChatContextControls.js";
import { SelectionContextChip } from "../SelectionContextChip.js";
import { ChatReferenceChip } from "../ChatReferenceChip.js";
import { IMPORT_SEED_PROGRESS$1, IMPORT_SEED_QUESTIONS$1, RESUME_IMPORT_PROMPT$1, isImportDesignSystemPrompt$1 } from "./chatUiTools.js";
import { commentReplyText, currentImportProgress, latestAskUser, liveActivityLabel, messageText } from "./activity.js";
import { useElementChatReferences } from "../../hooks/useElementChatReferences.js";
import { isAgentSetUp, useAgentSetup } from "./useAgentSetup.js";
import { AgentSetupModal, AgentSetupPanel } from "./AgentSetupModal.js";
import { useContextMentionsV2 } from "./useContextMentionsV2.js";
import { captureReferencedElementImages } from "./referenceImages.js";
import { ContextMenuV2 } from "./ContextMenuV2.js";
import { SlashCommandMenuV2 } from "./SlashCommandMenuV2.js";
import { charBeforeTextNode, slashCommandInsertion, slashQueryBefore, startsMessage } from "./slashToken.js";
import { useAgentChat } from "../../../../../ai/src/client/react/useAgentChat.js";
import { ChatTranscriptV2, WorkingIndicator } from "./ChatTranscriptV2.js";
import { resolveEffort } from "./effort.js";
import { AgentModelPickerV2 } from "./ChatPickersV2.js";
import { QueuedMessagesV2 } from "./QueuedMessagesV2.js";
import { AskUserCard, ImportProgressCard } from "./ChatUiCards.js";

/**
* `ChatPanelV2` — the agents-v2 chat surface for the editor.
*
* Matches the v1 chat UI 1:1 while running on `useAgentChat` and `UIMessage`.
* v1's `ChatPanel` is frozen: shared satellites (`ChatMarkdown`, the context
* chips, composer utilities, scroll) are reused unmodified; the transcript,
* activity UI, pickers, slash menu, `+` menu, and `@` mentions live under
* `chat-v2/`. Connections here are whatever MCP servers the selected agent
* reports, not v1's reading of the Claude Code config.
*/
function handleAttachmentDragOver(e) {
	if (!e.dataTransfer.types.includes("Files")) return;
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = "copy";
}
/** Milliseconds since `busy` turned on, ticking once per second; 0 when idle. */
function useWorkElapsedMs(busy) {
	const $ = (0, import_compiler_runtime.c)(3);
	const [elapsedMs, setElapsedMs] = (0, import_react.useState)(0);
	let t0;
	let t1;
	if ($[0] !== busy) {
		t0 = () => {
			if (!busy) return;
			const startedAt = Date.now();
			const update = () => setElapsedMs(Date.now() - startedAt);
			const first = window.setTimeout(update, 0);
			const timer = window.setInterval(update, 1e3);
			return () => {
				window.clearTimeout(first);
				window.clearInterval(timer);
				setElapsedMs(0);
			};
		};
		t1 = [busy];
		$[0] = busy;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	(0, import_react.useEffect)(t0, t1);
	return elapsedMs;
}
var AGENT_LOGIN_COMMANDS = {
	"claude-code": "claude auth login",
	codex: "codex login",
	opencode: "opencode auth login"
};
var AUTH_ERROR_RE = /not logged in|unauthori[sz]ed|unauthenticated|authentication (?:failed|required|error)|invalid (?:user )?api key|\b401\b/;
/** Best-effort classification for a raw backend stream error. */
function classifyAgentError(err, agentId, agentLabel = "The agent") {
	const raw = err instanceof Error ? err.message : String(err);
	const trimmed = raw.length > 300 ? raw.slice(0, 300) + "…" : raw;
	const msg = raw.toLowerCase();
	if (msg.includes("rate limit") || msg.includes("429") || msg.includes("quota") || msg.includes("usage limit")) return {
		title: "Rate limit reached",
		message: `${agentLabel} hit its usage limit.`,
		action: "Wait a few minutes and try again, or check your plan."
	};
	if (agentId === "claude-code" && msg.includes("credit balance")) return {
		title: "Out of API credits",
		message: "Claude Code is billing an Anthropic API key that has no credits left.",
		action: "Add credits in the Anthropic Console, or unset ANTHROPIC_API_KEY in your shell to use your Claude subscription."
	};
	if (msg.includes("overloaded") || msg.includes("503")) return {
		title: `${agentLabel} is busy`,
		message: "The API is currently overloaded.",
		action: "Wait a moment and try again."
	};
	if (AUTH_ERROR_RE.test(msg)) {
		const loginCommand = AGENT_LOGIN_COMMANDS[agentId];
		return {
			title: "Not logged in",
			message: trimmed,
			action: agentId === "cursor" ? "Open the agent setup and sign in with Cursor, then retry." : loginCommand ? `Run \`${loginCommand}\` in your terminal to log in.` : "Log in to the agent CLI in your terminal, then retry."
		};
	}
	if (msg.includes("enoent") || msg.includes("not found") || msg.includes("spawn")) return {
		title: "Agent CLI not found",
		message: "The agent CLI is not installed or not in your PATH.",
		action: "Install it and make sure it is on your PATH, then retry."
	};
	return {
		title: "Something went wrong",
		message: trimmed
	};
}
/**
* Resolve a `sourceInfo.filePath` against the captured page's project root.
* Mirrors the v1 helper so the save-to-code prompt keeps working unchanged.
*/
function resolveAgainstRoot(filePath, root) {
	if (!filePath) return filePath;
	if (root && filePath.startsWith(root + "/")) return filePath;
	if (isLikelyFilesystemPath(filePath)) return filePath;
	if (!root) return filePath;
	let rel = filePath;
	if (rel.startsWith("/")) rel = rel.slice(1);
	if (rel.startsWith("./")) rel = rel.slice(2);
	let base = root.replace(/[\\/]+$/, "");
	while (rel.startsWith("../")) {
		rel = rel.slice(3);
		const slash = Math.max(base.lastIndexOf("/"), base.lastIndexOf("\\"));
		if (slash <= 0) break;
		base = base.slice(0, slash);
	}
	return `${base}/${rel}`;
}
function isLikelyFilesystemPath(p) {
	if (!p) return false;
	if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
	return /^\/(?:Users|home|root|opt|srv|usr|var|tmp|private|Volumes|mnt|data)\//.test(p);
}
/** "mcp__notion__notion-create-pages" → "notion: notion-create-pages"; built-ins keep their name. */
function describeApprovalTool(toolName) {
	const m = /^mcp__(.+?)__(.+)$/.exec(toolName);
	if (!m) return toolName;
	return `${m[1].split(":").pop() ?? m[1]}: ${m[2]}`;
}
function summarizeApprovalArgs(toolName, args) {
	if (toolName === "Bash" && typeof args?.command === "string") return args.command;
	let text;
	try {
		text = JSON.stringify(args ?? {}, null, 1);
	} catch {
		text = String(args);
	}
	return text.length > 400 ? `${text.slice(0, 400)}…` : text;
}
/** What a composer list shows when the agent could not be asked and nothing is known yet. */
var NO_SLASH_COMMANDS = [];
var NO_MCP_SERVERS = { servers: [] };
/** Prefix matches first, then substring matches, then description hits. */
function filterSlashCommands(commands, query) {
	const q = query.toLowerCase();
	if (!q) return commands;
	const rank = (command) => {
		const name = command.name.toLowerCase();
		if (name.startsWith(q)) return 0;
		if (name.includes(q)) return 1;
		if (command.description.toLowerCase().includes(q)) return 2;
		return -1;
	};
	return commands.map((command) => ({
		command,
		rank: rank(command)
	})).filter(({ rank }) => rank >= 0).sort((a, b) => a.rank - b.rank || a.command.name.localeCompare(b.command.name)).map(({ command }) => command);
}
/**
* Last answer per key, shared by every chat tab in this renderer, so a new tab
* or a remounted composer starts from what the agent said last instead of empty.
*/
var lastAnswers = /* @__PURE__ */ new Map();
/**
* Stale-while-revalidate for a list the agent is asked for (slash commands,
* MCP servers). Asking spawns the agent and can take seconds, so `data` is the
* last answer for `key` (null before the first), and `revalidate()` asks again
* and swaps the answer in the moment it arrives. A failed ask keeps the old
* answer, or shows `fallback` when there is none yet, so the menu does not
* read as loading forever. An answer for a key that is no longer current only
* updates the cache.
*/
function useRevalidatedList(key, ask, fallback) {
	const $ = (0, import_compiler_runtime.c)(11);
	const [answer, setAnswer] = (0, import_react.useState)(null);
	const askRef = (0, import_react.useRef)(ask);
	let t0;
	if ($[0] !== ask) {
		t0 = () => {
			askRef.current = ask;
		};
		$[0] = ask;
		$[1] = t0;
	} else t0 = $[1];
	(0, import_react.useEffect)(t0);
	let t1;
	if ($[2] !== fallback || $[3] !== key) {
		t1 = () => {
			const current = askRef.current;
			if (!current) return;
			current().then((data) => {
				lastAnswers.set(key, data);
				setAnswer({
					key,
					data
				});
			}, () => {
				if (!lastAnswers.has(key)) setAnswer({
					key,
					data: fallback
				});
			});
		};
		$[2] = fallback;
		$[3] = key;
		$[4] = t1;
	} else t1 = $[4];
	const revalidate = t1;
	let t2;
	if ($[5] !== answer || $[6] !== key) {
		t2 = answer?.key === key ? answer.data : lastAnswers.get(key) ?? null;
		$[5] = answer;
		$[6] = key;
		$[7] = t2;
	} else t2 = $[7];
	const data_0 = t2;
	let t3;
	if ($[8] !== data_0 || $[9] !== revalidate) {
		t3 = {
			data: data_0,
			revalidate
		};
		$[8] = data_0;
		$[9] = revalidate;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
function commentCanvasContext(refs) {
	const page = refs.find((ref) => ref.type === "page");
	const selectedElementIds = refs.flatMap((ref) => ref.type === "element" ? [ref.id] : []);
	return {
		...page ? { activePage: {
			id: page.id,
			name: page.name
		} } : {},
		...selectedElementIds.length > 0 ? { selectedElementIds } : {}
	};
}
var ChatPanelV2 = (0, import_react.forwardRef)(function ChatPanelV2(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(349);
	const { bridge, projectId, chatTabId, host, store, selectedElementIds, componentIndex, activeTabInfo, contextPages, onSelectElement, iconLibraryNames, variant: t1, activeChatId, chatList, onNewChat, onSwitchChat, onArchiveChat, onArchiveAllChats, onOpenArchivedChats, chatColor, chatColors } = t0;
	const variant = t1 === void 0 ? "default" : t1;
	const resolveAsset = useAssetResolver();
	let t2;
	if ($[0] !== host.additionalDirectories || $[1] !== host.cwd) {
		t2 = host.cwd ? [host.cwd, ...host.additionalDirectories ?? []] : [];
		$[0] = host.additionalDirectories;
		$[1] = host.cwd;
		$[2] = t2;
	} else t2 = $[2];
	const allowedPaths = t2;
	let t3;
	if ($[3] !== selectedElementIds || $[4] !== store) {
		t3 = Array.from(selectedElementIds).map((id) => getById(store, id)).filter(Boolean);
		$[3] = selectedElementIds;
		$[4] = store;
		$[5] = t3;
	} else t3 = $[5];
	const selectedElements = t3;
	let t4;
	if ($[6] !== componentIndex) {
		t4 = Object.entries(componentIndex).some(_temp$26);
		$[6] = componentIndex;
		$[7] = t4;
	} else t4 = $[7];
	const hasButtonComponent = t4;
	const selectedAgentLabel = host.agents.find((agent) => agent.id === host.agentId)?.label;
	const oneShotModelRef = (0, import_react.useRef)(null);
	const mcpSubmittingRef = (0, import_react.useRef)(false);
	const commentTurnRef = (0, import_react.useRef)(null);
	const commentResultRef = (0, import_react.useRef)(null);
	const commentStoppedRef = (0, import_react.useRef)(false);
	const messagesRef = (0, import_react.useRef)([]);
	const streamErrorRef = (0, import_react.useRef)(void 0);
	const sessionIdRef = (0, import_react.useRef)(host.sessionId);
	let t5;
	let t6;
	if ($[8] !== host.sessionId) {
		t5 = () => {
			sessionIdRef.current = host.sessionId;
		};
		t6 = [host.sessionId];
		$[8] = host.sessionId;
		$[9] = t5;
		$[10] = t6;
	} else {
		t5 = $[9];
		t6 = $[10];
	}
	(0, import_react.useEffect)(t5, t6);
	let t7;
	if ($[11] !== host.modelId || $[12] !== host.models) {
		t7 = host.models.find((model_0) => model_0.id === host.modelId) ?? host.models.find(_temp2$16) ?? host.models[0];
		$[11] = host.modelId;
		$[12] = host.models;
		$[13] = t7;
	} else t7 = $[13];
	const selectedModel = t7;
	let t8;
	if ($[14] !== selectedModel?.efforts) {
		t8 = selectedModel?.efforts ?? [];
		$[14] = selectedModel?.efforts;
		$[15] = t8;
	} else t8 = $[15];
	const modelEfforts = t8;
	const t9 = selectedModel?.defaultEffort;
	let t10;
	if ($[16] !== host.effort || $[17] !== modelEfforts || $[18] !== t9) {
		t10 = resolveEffort(modelEfforts, host.effort, t9);
		$[16] = host.effort;
		$[17] = modelEfforts;
		$[18] = t9;
		$[19] = t10;
	} else t10 = $[19];
	const effectiveEffort = t10;
	const fastOn = host.fast && Boolean(selectedModel?.supportsFast);
	const formatUserMessage = _temp3$12;
	let t11;
	if ($[20] !== effectiveEffort || $[21] !== fastOn || $[22] !== host || $[23] !== iconLibraryNames || $[24] !== resolveAsset || $[25] !== store) {
		t11 = async (userMessages) => {
			const commentRefs = commentTurnRef.current;
			commentTurnRef.current = null;
			const sentCanvas = userMessages.reduce(_temp4$12, void 0);
			const canvas = commentRefs ? commentCanvasContext(commentRefs) : sentCanvas ?? host.buildPromptContext?.();
			const override = oneShotModelRef.current;
			oneShotModelRef.current = null;
			const modelId = override ?? host.modelId;
			const policy = host.policy;
			const sessionId = sessionIdRef.current;
			const messageRefs = userMessages.flatMap(_temp5$11);
			const refs_0 = commentRefs || !messageRefs.some(_temp6$8) ? messageRefs : [...messageRefs, ...await captureReferencedElementImages(store, messageRefs, resolveAsset)];
			const hostContext = {
				...canvas ?? {},
				...refs_0.length > 0 ? { references: refs_0 } : {}
			};
			return {
				agentId: host.agentId,
				cwd: host.cwd ?? "",
				...modelId ? { modelId } : {},
				...host.additionalDirectories?.length ? { additionalDirectories: host.additionalDirectories } : {},
				...policy ? { policy } : {},
				...sessionId ? { sessionId } : {},
				...Object.keys(hostContext).length > 0 ? { hostContext } : {},
				...effectiveEffort ? { effort: effectiveEffort } : {},
				...iconLibraryNames?.length ? { iconLibraryNames } : {},
				...fastOn ? { fast: true } : {}
			};
		};
		$[20] = effectiveEffort;
		$[21] = fastOn;
		$[22] = host;
		$[23] = iconLibraryNames;
		$[24] = resolveAsset;
		$[25] = store;
		$[26] = t11;
	} else t11 = $[26];
	const getTurn = t11;
	let t12;
	let t13;
	let t14;
	if ($[27] !== bridge) {
		t12 = (streamId) => bridge.abort(streamId);
		t13 = (request) => bridge.steer(request);
		t14 = (listener) => bridge.onStream(listener);
		$[27] = bridge;
		$[28] = t12;
		$[29] = t13;
		$[30] = t14;
	} else {
		t12 = $[28];
		t13 = $[29];
		t14 = $[30];
	}
	let t15;
	if ($[31] !== bridge || $[32] !== chatTabId) {
		t15 = (request_0) => {
			bridge.start(Object.assign({}, request_0, { chatTabId }));
		};
		$[31] = bridge;
		$[32] = chatTabId;
		$[33] = t15;
	} else t15 = $[33];
	let t16;
	if ($[34] !== t12 || $[35] !== t13 || $[36] !== t14 || $[37] !== t15) {
		t16 = {
			abort: t12,
			steer: t13,
			onStream: t14,
			start: t15
		};
		$[34] = t12;
		$[35] = t13;
		$[36] = t14;
		$[37] = t15;
		$[38] = t16;
	} else t16 = $[38];
	const { messages, sendMessage, steer, queue, enqueue, takeQueued, promoteQueued, resumeQueue, busy, stop, error: streamError, clearError } = useAgentChat({
		bridge: t16,
		projectId,
		getTurn,
		formatUserMessage,
		initialMessages: host.initialMessages,
		onMessagesChange: host.onMessagesChange,
		onSessionId: (sessionId_0) => {
			sessionIdRef.current = sessionId_0;
			host.onSessionId?.(sessionId_0);
		},
		onStreamStart: host.onStreamStart,
		onUnsent: (unsent) => returnToComposer(unsent),
		onStreamEnd: () => {
			setSeedProgress(false);
			const finish = commentResultRef.current;
			commentResultRef.current = null;
			if (finish) {
				const stopped = commentStoppedRef.current;
				commentStoppedRef.current = false;
				const assistant = [...messagesRef.current].reverse().find(_temp7$6);
				finish({
					body: assistant ? commentReplyText(assistant) : "",
					status: stopped ? "cancelled" : streamErrorRef.current ? "errored" : "completed"
				});
			}
			host.onStreamEnd?.();
		}
	});
	let t17;
	if ($[39] !== messages || $[40] !== streamError) {
		t17 = [messages, streamError];
		$[39] = messages;
		$[40] = streamError;
		$[41] = t17;
	} else t17 = $[41];
	(0, import_react.useLayoutEffect)(() => {
		messagesRef.current = messages;
		streamErrorRef.current = streamError;
	}, t17);
	const workElapsedMs = useWorkElapsedMs(busy);
	const [answeredQuestionsKey, setAnsweredQuestionsKey] = (0, import_react.useState)(null);
	const [seedProgress, t18] = (0, import_react.useState)(false);
	const setSeedProgress = t18;
	const [seedQuestions, setSeedQuestions] = (0, import_react.useState)(false);
	const [localError, setLocalError] = (0, import_react.useState)(null);
	const [showChatList, setShowChatList] = (0, import_react.useState)(false);
	const [lightboxUrl, setLightboxUrl] = (0, import_react.useState)(null);
	const [hasComposerContent, setHasComposerContent] = (0, import_react.useState)(false);
	const [setupOpen, setSetupOpen] = (0, import_react.useState)(false);
	const [setupAgentId, setSetupAgentId] = (0, import_react.useState)(void 0);
	const setupForOtherAgent = setupAgentId !== void 0 && setupAgentId !== host.agentId;
	const t19 = setupOpen && !setupForOtherAgent;
	let t20;
	if ($[42] !== host.agentId || $[43] !== t19) {
		t20 = {
			poll: t19,
			agentId: host.agentId
		};
		$[42] = host.agentId;
		$[43] = t19;
		$[44] = t20;
	} else t20 = $[44];
	const agentSetup = useAgentSetup(host.checkStatus, t20);
	let t21;
	if ($[45] !== host.checkStatus || $[46] !== setupAgentId || $[47] !== setupForOtherAgent) {
		t21 = setupForOtherAgent && host.checkStatus ? () => host.checkStatus(setupAgentId) : void 0;
		$[45] = host.checkStatus;
		$[46] = setupAgentId;
		$[47] = setupForOtherAgent;
		$[48] = t21;
	} else t21 = $[48];
	let t22;
	if ($[49] !== setupAgentId || $[50] !== setupOpen) {
		t22 = {
			poll: setupOpen,
			agentId: setupAgentId
		};
		$[49] = setupAgentId;
		$[50] = setupOpen;
		$[51] = t22;
	} else t22 = $[51];
	const otherAgentSetup = useAgentSetup(t21, t22);
	const modalSetup = setupForOtherAgent ? otherAgentSetup : agentSetup;
	let t23;
	if ($[52] !== agentSetup.status) {
		t23 = isAgentSetUp(agentSetup.status);
		$[52] = agentSetup.status;
		$[53] = t23;
	} else t23 = $[53];
	const agentReady = t23;
	const showAgentSetup = agentSetup.isDesktop && !agentSetup.loading && !!agentSetup.status && !agentReady;
	const selectedAgent = host.agents.find((agent_0) => agent_0.id === host.agentId) ?? {
		id: host.agentId,
		label: selectedAgentLabel ?? host.agentId
	};
	const setupAgent = setupForOtherAgent ? host.agents.find((agent_1) => agent_1.id === setupAgentId) ?? {
		id: setupAgentId,
		label: setupAgentId
	} : selectedAgent;
	let t24;
	if ($[54] !== setSetupOpen) {
		t24 = (agentId) => {
			setSetupAgentId(agentId);
			setSetupOpen(true);
		};
		$[54] = setSetupOpen;
		$[55] = t24;
	} else t24 = $[55];
	const openAgentSetup = t24;
	let t25;
	if ($[56] !== agentSetup || $[57] !== host || $[58] !== setSetupOpen || $[59] !== setupAgentId || $[60] !== setupForOtherAgent) {
		t25 = () => {
			setSetupOpen(false);
			setSetupAgentId(void 0);
			if (!setupForOtherAgent) {
				agentSetup.refresh();
				return;
			}
			const agentId_0 = setupAgentId;
			const check = host.checkStatus;
			if (!agentId_0 || !check) return;
			check(agentId_0).then((status) => {
				if (isAgentSetUp(status)) host.onAgentChange?.(agentId_0);
			}, _temp8$5);
		};
		$[56] = agentSetup;
		$[57] = host;
		$[58] = setSetupOpen;
		$[59] = setupAgentId;
		$[60] = setupForOtherAgent;
		$[61] = t25;
	} else t25 = $[61];
	const closeAgentSetup = t25;
	const { viewportRef: messagesScrollRef, contentRef: messagesContentRef, atBottom: messagesAtBottom, scrollToBottom: scrollMessagesToBottom } = useChatScroll();
	const inputRef = (0, import_react.useRef)(null);
	const error = localError ?? (streamError ? classifyAgentError(streamError, host.agentId, selectedAgentLabel) : null);
	const isSetupError = error?.title === "Not logged in" || error?.title === "Agent CLI not found";
	const refreshSetup = agentSetup.refresh;
	let t26;
	let t27;
	if ($[62] !== host.agentId || $[63] !== refreshSetup || $[64] !== selectedAgentLabel || $[65] !== streamError) {
		t26 = () => {
			if (streamError) {
				const info = classifyAgentError(streamError, host.agentId, selectedAgentLabel);
				if (info.title === "Not logged in" || info.title === "Agent CLI not found") refreshSetup();
			}
		};
		t27 = [
			streamError,
			host.agentId,
			selectedAgentLabel,
			refreshSetup
		];
		$[62] = host.agentId;
		$[63] = refreshSetup;
		$[64] = selectedAgentLabel;
		$[65] = streamError;
		$[66] = t26;
		$[67] = t27;
	} else {
		t26 = $[66];
		t27 = $[67];
	}
	(0, import_react.useEffect)(t26, t27);
	let t28;
	if ($[68] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = () => {
			const input = inputRef.current;
			if (!input) {
				setHasComposerContent(false);
				return;
			}
			setHasComposerContent(Boolean(input.textContent?.trim() || input.querySelector("[data-ref-id]")));
		};
		$[68] = t28;
	} else t28 = $[68];
	const updateComposerContentState = t28;
	let t29;
	if ($[69] !== updateComposerContentState) {
		t29 = (suggestion) => {
			const input_0 = inputRef.current;
			if (!input_0) return;
			input_0.textContent = suggestion;
			updateComposerContentState();
			requestAnimationFrame(() => {
				input_0.focus();
				const range = document.createRange();
				range.selectNodeContents(input_0);
				range.collapse(false);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
			});
		};
		$[69] = updateComposerContentState;
		$[70] = t29;
	} else t29 = $[70];
	const applyComposerSuggestion = t29;
	let t30;
	let t31;
	if ($[71] !== variant) {
		t30 = () => {
			if (variant !== "sidebar-v2") return;
			const input_1 = inputRef.current;
			if (!input_1) return;
			const pane = input_1.closest("[data-state]");
			const focusIfVisible = () => {
				if (input_1.closest(".hidden")) return;
				if (pane?.getAttribute("data-state") === "inactive") return;
				requestAnimationFrame(() => input_1.focus());
			};
			focusIfVisible();
			if (!pane) return;
			const observer = new MutationObserver(focusIfVisible);
			observer.observe(pane, {
				attributes: true,
				attributeFilter: ["data-state"]
			});
			return () => observer.disconnect();
		};
		t31 = [variant];
		$[71] = variant;
		$[72] = t30;
		$[73] = t31;
	} else {
		t30 = $[72];
		t31 = $[73];
	}
	(0, import_react.useEffect)(t30, t31);
	const inlineComposerRef = (0, import_react.useRef)(null);
	let t32;
	if ($[74] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = [];
		$[74] = t32;
	} else t32 = $[74];
	const [referenceMounts, setReferenceMounts] = (0, import_react.useState)(t32);
	const contextRefs = referenceMounts.map(_temp9$4);
	const [pendingAttachments, setPendingAttachments] = (0, import_react.useState)(0);
	let t33;
	if ($[75] !== updateComposerContentState) {
		t33 = (ref_1) => {
			inlineComposerRef.current?.insertSelection([ref_1], false);
			updateComposerContentState();
		};
		$[75] = updateComposerContentState;
		$[76] = t33;
	} else t33 = $[76];
	const addContextRef = t33;
	const selectedRefs = useElementChatReferences(selectedElements, activeTabInfo?.id);
	const [dismissedSelection, setDismissedSelection] = (0, import_react.useState)(null);
	const selectionRefs = selectedRefs.filter((ref_2) => !(dismissedSelection?.selection === selectedElementIds && dismissedSelection.ids.has(ref_2.id)) && !contextRefs.some((inline) => inline.id === ref_2.id));
	let t34;
	if ($[77] !== selectedElementIds) {
		t34 = (id_0) => {
			setDismissedSelection((previous) => ({
				selection: selectedElementIds,
				ids: /* @__PURE__ */ new Set([...previous?.selection === selectedElementIds ? previous.ids : [], id_0])
			}));
		};
		$[77] = selectedElementIds;
		$[78] = t34;
	} else t34 = $[78];
	const removeSelectionItem = t34;
	let t35;
	let t36;
	if ($[79] !== updateComposerContentState) {
		t35 = () => {
			if (!inputRef.current) return;
			const composer = inlineComposerRef.current ?? new InlineChatComposer(inputRef.current, true);
			inlineComposerRef.current = composer;
			composer.connect();
			const syncComposer = () => {
				syncInlineReferenceSpacing(inputRef.current);
				updateComposerContentState();
				const mounts = composer.getReferenceMounts();
				setReferenceMounts((previous_0) => previous_0.length === mounts.length && previous_0.every((mount_0, index) => mount_0 === mounts[index]) ? previous_0 : mounts);
			};
			syncComposer();
			const observer_0 = new MutationObserver(syncComposer);
			observer_0.observe(inputRef.current, {
				childList: true,
				characterData: true,
				subtree: true
			});
			return () => {
				composer.dispose();
				observer_0.disconnect();
			};
		};
		t36 = [updateComposerContentState];
		$[79] = updateComposerContentState;
		$[80] = t35;
		$[81] = t36;
	} else {
		t35 = $[80];
		t36 = $[81];
	}
	(0, import_react.useLayoutEffect)(t35, t36);
	const connectionAgentId = (0, import_react.useRef)(host.agentId);
	let t37;
	let t38;
	if ($[82] !== host.agentId) {
		t37 = () => {
			if (connectionAgentId.current === host.agentId) return;
			connectionAgentId.current = host.agentId;
			const composer_0 = inlineComposerRef.current;
			if (!composer_0) return;
			for (const mount_1 of composer_0.getReferenceMounts()) if (mount_1.reference.type === "connection") composer_0.removeReference(mount_1.key);
		};
		t38 = [host.agentId];
		$[82] = host.agentId;
		$[83] = t37;
		$[84] = t38;
	} else {
		t37 = $[83];
		t38 = $[84];
	}
	(0, import_react.useEffect)(t37, t38);
	let t39;
	if ($[85] !== selectedRefs || $[86] !== updateComposerContentState) {
		t39 = () => {
			inlineComposerRef.current?.insertSelection(selectedRefs, false);
			updateComposerContentState();
		};
		$[85] = selectedRefs;
		$[86] = updateComposerContentState;
		$[87] = t39;
	} else t39 = $[87];
	const pinSelection = t39;
	const [slashQuery, setSlashQuery] = (0, import_react.useState)(null);
	const [slashSkillsOnly, setSlashSkillsOnly] = (0, import_react.useState)(false);
	const [slashIndexState, setSlashIndex] = (0, import_react.useState)(0);
	const [slashIndexQuery, setSlashIndexQuery] = (0, import_react.useState)(null);
	if (slashIndexQuery !== slashQuery) {
		setSlashIndexQuery(slashQuery);
		setSlashIndex(0);
	}
	const slashOpenRef = (0, import_react.useRef)(false);
	const slashDismissedRef = (0, import_react.useRef)(null);
	const slashCwd = allowedPaths[0];
	let t40;
	if ($[88] !== host.listSlashCommands || $[89] !== slashCwd) {
		t40 = host.listSlashCommands ? () => host.listSlashCommands(slashCwd) : void 0;
		$[88] = host.listSlashCommands;
		$[89] = slashCwd;
		$[90] = t40;
	} else t40 = $[90];
	const slashList = useRevalidatedList(`slash\0${host.agentId}\0${slashCwd ?? ""}`, t40, NO_SLASH_COMMANDS);
	const slashCommands = host.listSlashCommands ? slashList.data : [];
	const revalidateSlashCommands = slashList.revalidate;
	let t41;
	if ($[91] === Symbol.for("react.memo_cache_sentinel")) {
		t41 = () => {
			const input_2 = inputRef.current;
			const selection_0 = window.getSelection();
			if (!input_2 || !selection_0 || !selection_0.isCollapsed || selection_0.rangeCount === 0) return null;
			const node = selection_0.anchorNode;
			if (!node || node.nodeType !== Node.TEXT_NODE || !input_2.contains(node)) return null;
			const text_0 = node;
			const offset = selection_0.anchorOffset;
			const query = slashQueryBefore(charBeforeTextNode(text_0) + text_0.data.slice(0, offset));
			if (query === null) return null;
			const start = offset - query.length - 1;
			if (start < 0) return null;
			return {
				node: text_0,
				start,
				end: offset,
				query,
				atStart: startsMessage(input_2, text_0, start)
			};
		};
		$[91] = t41;
	} else t41 = $[91];
	const readSlashToken = t41;
	let t42;
	if ($[92] === Symbol.for("react.memo_cache_sentinel")) {
		t42 = () => {
			slashOpenRef.current = false;
			setSlashQuery(null);
		};
		$[92] = t42;
	} else t42 = $[92];
	const closeSlashMenu = t42;
	let t43;
	if ($[93] !== revalidateSlashCommands) {
		t43 = () => {
			const token = readSlashToken();
			if (!token) {
				slashDismissedRef.current = null;
				if (slashOpenRef.current) closeSlashMenu();
				return;
			}
			const dismissed = slashDismissedRef.current;
			if (dismissed !== null) {
				if (token.query.startsWith(dismissed)) return;
				slashDismissedRef.current = null;
			}
			if (!slashOpenRef.current) {
				slashOpenRef.current = true;
				revalidateSlashCommands();
			}
			setSlashQuery(token.query);
			setSlashSkillsOnly(!token.atStart);
		};
		$[93] = revalidateSlashCommands;
		$[94] = t43;
	} else t43 = $[94];
	const syncSlashMenu = t43;
	let t44;
	let t45;
	if ($[95] !== revalidateSlashCommands) {
		t44 = () => {
			if (slashOpenRef.current) revalidateSlashCommands();
		};
		t45 = [revalidateSlashCommands];
		$[95] = revalidateSlashCommands;
		$[96] = t44;
		$[97] = t45;
	} else {
		t44 = $[96];
		t45 = $[97];
	}
	(0, import_react.useEffect)(t44, t45);
	const slashOpen = slashQuery !== null;
	let t46;
	if ($[98] !== slashSkillsOnly) {
		t46 = (command) => !slashSkillsOnly || command.skill;
		$[98] = slashSkillsOnly;
		$[99] = t46;
	} else t46 = $[99];
	const slashCommandsList = (slashCommands ?? []).filter(t46);
	const filteredSlash = slashOpen ? [...filterSlashCommands(slashCommandsList.filter(_temp0$3), slashQuery), ...filterSlashCommands(slashCommandsList.filter(_temp1$3), slashQuery)] : [];
	if (slashIndexState > 0 && slashIndexState > filteredSlash.length - 1) setSlashIndex(filteredSlash.length === 0 ? 0 : filteredSlash.length - 1);
	const slashIndex = Math.min(slashIndexState, Math.max(0, filteredSlash.length - 1));
	let t47;
	if ($[100] !== updateComposerContentState) {
		t47 = (command_2) => {
			const token_0 = readSlashToken();
			if (!token_0) return;
			const range_0 = document.createRange();
			range_0.setStart(token_0.node, token_0.start);
			range_0.setEnd(token_0.node, token_0.end);
			range_0.deleteContents();
			const text_1 = document.createTextNode(slashCommandInsertion(command_2.name, token_0.node.data.slice(token_0.start)));
			range_0.insertNode(text_1);
			range_0.setStartAfter(text_1);
			range_0.collapse(true);
			const selection_1 = window.getSelection();
			selection_1?.removeAllRanges();
			selection_1?.addRange(range_0);
			closeSlashMenu();
			updateComposerContentState();
		};
		$[100] = updateComposerContentState;
		$[101] = t47;
	} else t47 = $[101];
	const applySlashCommand = t47;
	const mcpList = useRevalidatedList(`mcp\0${projectId}\0${host.agentId}`, host.listMcpServers, NO_MCP_SERVERS);
	const mcpServers = mcpList.data;
	const revalidateMcpServers = mcpList.revalidate;
	let t48;
	if ($[102] !== activeTabInfo || $[103] !== contextPages) {
		t48 = contextPages ?? (activeTabInfo ? [activeTabInfo] : []);
		$[102] = activeTabInfo;
		$[103] = contextPages;
		$[104] = t48;
	} else t48 = $[104];
	let t49;
	if ($[105] !== host.listMcpServers || $[106] !== mcpServers?.servers) {
		t49 = host.listMcpServers ? mcpServers?.servers ?? null : [];
		$[105] = host.listMcpServers;
		$[106] = mcpServers?.servers;
		$[107] = t49;
	} else t49 = $[107];
	const mentions = useContextMentionsV2(inputRef, componentIndex, t48, addContextRef, updateComposerContentState, t49);
	const { sync: syncMentions, close: closeMentions } = mentions;
	let t50;
	let t51;
	if ($[108] !== mentions.open || $[109] !== revalidateMcpServers) {
		t50 = () => {
			if (mentions.open) revalidateMcpServers();
		};
		t51 = [mentions.open, revalidateMcpServers];
		$[108] = mentions.open;
		$[109] = revalidateMcpServers;
		$[110] = t50;
		$[111] = t51;
	} else {
		t50 = $[110];
		t51 = $[111];
	}
	(0, import_react.useEffect)(t50, t51);
	let t52;
	if ($[112] !== syncMentions || $[113] !== syncSlashMenu) {
		t52 = () => {
			syncSlashMenu();
			syncMentions();
		};
		$[112] = syncMentions;
		$[113] = syncSlashMenu;
		$[114] = t52;
	} else t52 = $[114];
	const syncComposerMenus = t52;
	let t53;
	if ($[115] !== syncComposerMenus || $[116] !== updateComposerContentState) {
		t53 = () => {
			updateComposerContentState();
			syncComposerMenus();
		};
		$[115] = syncComposerMenus;
		$[116] = updateComposerContentState;
		$[117] = t53;
	} else t53 = $[117];
	const handleComposerInput = t53;
	const [composerFocused, setComposerFocused] = (0, import_react.useState)(false);
	const slashCommandsMissing = slashCommands === null;
	const mcpServersMissing = mcpServers === null;
	let t54;
	if ($[118] !== mcpServersMissing || $[119] !== revalidateMcpServers || $[120] !== revalidateSlashCommands || $[121] !== slashCommandsMissing || $[122] !== syncComposerMenus) {
		t54 = () => {
			setComposerFocused(true);
			syncComposerMenus();
			if (slashCommandsMissing) revalidateSlashCommands();
			if (mcpServersMissing) revalidateMcpServers();
		};
		$[118] = mcpServersMissing;
		$[119] = revalidateMcpServers;
		$[120] = revalidateSlashCommands;
		$[121] = slashCommandsMissing;
		$[122] = syncComposerMenus;
		$[123] = t54;
	} else t54 = $[123];
	const handleComposerFocus = t54;
	let t55;
	if ($[124] !== closeMentions) {
		t55 = () => {
			setComposerFocused(false);
			closeSlashMenu();
			closeMentions();
		};
		$[124] = closeMentions;
		$[125] = t55;
	} else t55 = $[125];
	const handleComposerBlur = t55;
	let t56;
	if ($[126] !== syncSlashMenu || $[127] !== updateComposerContentState) {
		t56 = () => {
			const input_3 = inputRef.current;
			if (!input_3) return;
			input_3.focus();
			const walker = document.createTreeWalker(input_3, NodeFilter.SHOW_TEXT);
			let node_0 = walker.nextNode();
			while (node_0 && !node_0.data.trim()) node_0 = walker.nextNode();
			const token_1 = node_0 && /^\s*\/[\w:-]*/.exec(node_0.data);
			let offset_0;
			if (node_0 && token_1) offset_0 = token_1[0].length;
			else {
				node_0 = document.createTextNode(input_3.textContent?.trim() ? "/ " : "/");
				input_3.prepend(node_0);
				offset_0 = 1;
			}
			const range_1 = document.createRange();
			range_1.setStart(node_0, offset_0);
			range_1.collapse(true);
			const selection_2 = window.getSelection();
			selection_2?.removeAllRanges();
			selection_2?.addRange(range_1);
			updateComposerContentState();
			slashDismissedRef.current = null;
			syncSlashMenu();
		};
		$[126] = syncSlashMenu;
		$[127] = updateComposerContentState;
		$[128] = t56;
	} else t56 = $[128];
	const openSkillsMenu = t56;
	const hasFolder = allowedPaths.length > 0;
	const canSend = pendingAttachments === 0 && (hasComposerContent || contextRefs.length > 0 || selectionRefs.length > 0);
	const parseInput = () => {
		if (!inputRef.current) return {
			text: "",
			refs: []
		};
		const draft = inlineComposerRef.current?.parseInput() ?? {
			text: "",
			refs: [],
			mentions: []
		};
		return {
			...draft,
			refs: [...draft.refs, ...selectionRefs.filter((ref_3) => !draft.refs.some((inline_0) => inline_0.id === ref_3.id))]
		};
	};
	let t57;
	if ($[129] !== agentSetup || $[130] !== host.agentId || $[131] !== selectedAgentLabel) {
		t57 = (err) => {
			const info_0 = classifyAgentError(err, host.agentId, selectedAgentLabel);
			if (info_0.title === "Not logged in" || info_0.title === "Agent CLI not found") agentSetup.refresh();
			setLocalError(info_0);
		};
		$[129] = agentSetup;
		$[130] = host.agentId;
		$[131] = selectedAgentLabel;
		$[132] = t57;
	} else t57 = $[132];
	const reportSendError = t57;
	const submitTurn = (text_2, metadata_0) => {
		clearError();
		sendMessage({
			text: text_2,
			metadata: metadata_0
		}).catch(reportSendError).finally(() => {
			mcpSubmittingRef.current = false;
		});
	};
	const handleSubmit = (t58) => {
		const mode = t58 === void 0 ? "steer" : t58;
		const { text: text_3, refs: refs_1, mentions: referenceMentions } = parseInput();
		if (!text_3 && refs_1.length === 0) return false;
		if (pendingAttachments > 0 || busy && mode === "new-turn" || !busy && mcpSubmittingRef.current) return false;
		if (!chatTabId) {
			setLocalError({
				title: "No active chat",
				message: "Create or select a chat before sending."
			});
			return false;
		}
		if (showAgentSetup) {
			setSetupOpen(true);
			return false;
		}
		const metadata_1 = {
			...refs_1.length > 0 ? { inlineRefs: refs_1 } : {},
			...referenceMentions && referenceMentions.length > 0 ? { referenceMentions } : {}
		};
		inlineComposerRef.current?.reset([]);
		updateComposerContentState();
		setLocalError(null);
		scrollMessagesToBottom();
		const importKickoff = !busy && messages.length === 0 && isImportDesignSystemPrompt$1(text_3);
		if (importKickoff) setSeedProgress(true);
		setSeedQuestions(importKickoff);
		if (busy) {
			if (mode === "queue") enqueue({
				text: text_3,
				metadata: metadata_1
			});
			else steer({
				text: text_3,
				metadata: metadata_1
			});
			return true;
		}
		const overrideModel = oneShotModelRef.current;
		if (overrideModel !== null) host.onModelChange?.(overrideModel);
		submitTurn(text_3, metadata_1);
		return true;
	};
	const returnToComposer = (returned) => {
		const composer_1 = inlineComposerRef.current;
		if (!composer_1) return;
		const drafts = returned.map(_temp10$3);
		composer_1.load([...drafts, composer_1.parseInput()].reduce(joinComposerDrafts));
		updateComposerContentState();
	};
	const editQueued = (id_1) => {
		const queued = takeQueued(id_1);
		if (queued) returnToComposer([queued]);
	};
	const handleStop = () => {
		if (commentResultRef.current) commentStoppedRef.current = true;
		stop();
	};
	const handleComposerKeyDown = (e) => {
		if (e.nativeEvent.isComposing) return;
		if (mentions.onKeyDown(e)) return;
		if (slashOpen) {
			const count = filteredSlash.length;
			const current = filteredSlash[slashIndex];
			if (e.key === "ArrowDown" && count) {
				e.preventDefault();
				setSlashIndex((i) => (i + 1) % count);
				return;
			}
			if (e.key === "ArrowUp" && count) {
				e.preventDefault();
				setSlashIndex((i_0) => (i_0 - 1 + count) % count);
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				slashDismissedRef.current = slashQuery;
				closeSlashMenu();
				return;
			}
			if (current && (e.key === "Tab" || e.key === "Enter" && !e.shiftKey && current.name !== slashQuery)) {
				e.preventDefault();
				applySlashCommand(current);
				return;
			}
			if (e.key === "Enter") closeSlashMenu();
		}
		if (e.key === "Escape" && busy) {
			e.preventDefault();
			handleStop();
			return;
		}
		const mod = e.metaKey || e.ctrlKey;
		if (e.key === "Enter" && !(mod && e.altKey)) {
			if (mod && e.shiftKey) {
				e.preventDefault();
				promoteQueued();
			} else if (!e.shiftKey) {
				e.preventDefault();
				handleSubmit(mod ? "queue" : "steer");
			}
		}
		if (isAddToPromptShortcut(e)) {
			e.preventDefault();
			e.stopPropagation();
			pinSelection();
		}
	};
	let t59;
	if ($[133] !== addContextRef) {
		t59 = (e_0) => {
			const items = e_0.clipboardData?.items;
			if (!items) return;
			for (const item of Array.from(items)) if (item.type.startsWith("image/")) {
				e_0.preventDefault();
				const file = item.getAsFile();
				if (!file) continue;
				const reader = new FileReader();
				reader.onload = () => {
					addContextRef({
						type: "image",
						id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
						name: "Screenshot",
						data: reader.result
					});
				};
				reader.readAsDataURL(file);
				return;
			}
			const pastedText = e_0.clipboardData?.getData("text/plain") || "";
			if (pastedText.startsWith("data:image/")) {
				e_0.preventDefault();
				addContextRef({
					type: "image",
					id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					name: "Pasted image",
					data: pastedText
				});
				return;
			}
			const imgMatch = (e_0.clipboardData?.getData("text/html") || "").match(/<img[^>]+src="(data:image\/[^"]+)"/);
			if (imgMatch) {
				e_0.preventDefault();
				addContextRef({
					type: "image",
					id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					name: "Pasted image",
					data: imgMatch[1]
				});
			}
		};
		$[133] = addContextRef;
		$[134] = t59;
	} else t59 = $[134];
	const handlePaste = t59;
	const attachInputRef = (0, import_react.useRef)(null);
	const attachFiles = async (items_0) => {
		if (items_0.length === 0) return;
		inlineComposerRef.current?.prepareInsertion();
		setPendingAttachments((count_0) => count_0 + items_0.length);
		const results = await Promise.allSettled(items_0.map(readPromptAttachment));
		setPendingAttachments((count_1) => count_1 - items_0.length);
		const failures = [];
		for (const result of results) if (result.status === "fulfilled") addContextRef(result.value);
		else failures.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
		if (failures.length > 0) setLocalError({
			title: "Could not attach",
			message: failures.join("\n")
		});
	};
	const handleDrop = (e_1) => {
		if (!e_1.dataTransfer.types.includes("Files")) return;
		e_1.preventDefault();
		e_1.stopPropagation();
		attachFiles(getDroppedAttachments(e_1.dataTransfer));
	};
	(0, import_react.useImperativeHandle)(ref, () => ({
		getMcpMessages: () => messagesRef.current,
		getMcpState: () => ({
			busy: busy || mcpSubmittingRef.current,
			agentId: host.agentId,
			modelId: host.modelId,
			approvals: host.approvals?.length ?? 0,
			...streamError || localError ? { error: streamError?.message ?? localError?.message } : {}
		}),
		getMcpDraft: () => {
			if (pendingAttachments > 0) throw new Error("Draft attachments are still loading. Retry after capture finishes.");
			const draft_0 = inlineComposerRef.current?.parseInput() ?? {
				text: "",
				refs: []
			};
			return {
				text: draft_0.text,
				references: draft_0.refs
			};
		},
		sendMcpMessage: (turn) => {
			if (busy || mcpSubmittingRef.current) throw new Error("This chat is already running.");
			if (!chatTabId || showAgentSetup) throw new Error("The sidebar agent is unavailable. Open the chat for setup details.");
			if (!turn.prompt.trim()) throw new Error("A prompt is required.");
			oneShotModelRef.current = turn.modelId;
			mcpSubmittingRef.current = true;
			setLocalError(null);
			setSeedQuestions(false);
			scrollMessagesToBottom();
			submitTurn(turn.prompt, {
				inlineRefs: turn.references,
				canvasContext: turn.canvasContext
			});
		},
		attachDroppedFiles: (data) => {
			attachFiles(getDroppedAttachments(data));
		},
		addSelectedElements: (elementIds) => {
			if (elementIds) {
				const references = elementIds.flatMap((id_2) => {
					const element = getById(store, id_2);
					return element ? [elementChatReference(element, activeTabInfo?.id)] : [];
				});
				inlineComposerRef.current?.insertSelection(references, false);
				updateComposerContentState();
			} else pinSelection();
			inputRef.current?.focus();
		},
		getDraftCanvasReferences: () => inlineComposerRef.current?.getReferenceMounts().flatMap(_temp11$3) ?? [],
		addCanvasRegion: (region, screenshot) => {
			const composer_2 = inlineComposerRef.current;
			if (!composer_2) return;
			const areaNumber = _temp12$2;
			const taken = [...messages.flatMap((message_3) => ((message_3.metadata ?? {}).inlineRefs ?? []).flatMap(areaNumber)), ...composer_2.getReferenceMounts().flatMap((mount_3) => areaNumber(mount_3.reference))];
			const reference = {
				type: "image",
				id: `region:${crypto.randomUUID()}`,
				name: `Area ${Math.max(0, ...taken) + 1}`,
				region
			};
			composer_2.insertSelection([reference], false);
			updateComposerContentState();
			setPendingAttachments(_temp13$2);
			screenshot.then((data_0) => {
				if (!data_0) return;
				reference.data = data_0;
				setReferenceMounts(_temp14$2);
			}).finally(() => setPendingAttachments(_temp15$2));
		},
		setInputText: (text_5) => {
			const input_5 = inputRef.current;
			if (!input_5) return;
			input_5.textContent = text_5;
			updateComposerContentState();
			requestAnimationFrame(() => {
				input_5.focus();
				const range_2 = document.createRange();
				range_2.selectNodeContents(input_5);
				range_2.collapse(false);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range_2);
			});
		},
		sendMessage: (text_6, model_1) => {
			const input_6 = inputRef.current;
			if (!input_6) return;
			oneShotModelRef.current = model_1 ?? null;
			input_6.textContent = text_6;
			updateComposerContentState();
			setTimeout(() => {
				if (!handleSubmit("new-turn")) oneShotModelRef.current = null;
			}, 0);
		},
		sendCommentMessage: (text_7, refs_2, agentContext) => {
			if (!text_7 && refs_2.length === 0 || busy || pendingAttachments > 0 || !chatTabId || showAgentSetup) {
				if (showAgentSetup) setSetupOpen(true);
				return Promise.reject(/* @__PURE__ */ new Error("The agent could not start or finish this response. Open the chat for details."));
			}
			commentTurnRef.current = refs_2;
			commentStoppedRef.current = false;
			clearError();
			const metadata_3 = {
				...refs_2.length > 0 ? { inlineRefs: refs_2 } : {},
				...agentContext ? { agentContext } : {}
			};
			return new Promise((resolve, reject) => {
				commentResultRef.current = resolve;
				sendMessage({
					text: text_7,
					metadata: metadata_3
				}).catch((err_0) => {
					commentTurnRef.current = null;
					if (!commentResultRef.current) return;
					commentResultRef.current = null;
					reject(err_0 instanceof Error ? err_0 : /* @__PURE__ */ new Error("The agent could not start or finish this response. Open the chat for details."));
				});
			});
		},
		setSaveToCodePrompt: (descriptions, sourceUrl, _componentNames, _capturedElementId, canvasId, screenshotDataUrl, projectRoot, componentEdit) => {
			const input_7 = inputRef.current;
			if (!input_7) return;
			const esc = _temp16$2;
			const codeOps = descriptions.filter(_temp17$2);
			const astOps = codeOps.filter(_temp18$2);
			const aiOps = codeOps.filter(_temp19$2);
			const formatOp = (d_2) => {
				let srcPart = "";
				if (d_2.sourceInfo?.filePath) {
					const resolved = resolveAgainstRoot(d_2.sourceInfo.filePath, projectRoot);
					srcPart = ` (${d_2.sourceInfo.lineNumber ? `${resolved}:${d_2.sourceInfo.lineNumber}` : resolved})`;
				}
				const summary = d_2.summary.replace(/\s+@\s+\S+:\d+/g, "");
				let line = `- [${d_2.op.type}] ${esc(d_2.componentName)}${esc(srcPart)}: ${esc(summary)}`;
				if (d_2.targetElementId && canvasId) line = line + ` → canvas_read canvas_id=${esc(canvasId)} element_id=${esc(d_2.targetElementId)}`;
				else if (d_2.targetElementId) line = line + ` → canvas_read element_id=${esc(d_2.targetElementId)}`;
				return line + "\n";
			};
			let opList = "";
			if (astOps.length > 0) {
				opList = "\n\nSimple edits (sourceInfo known, find & replace):\n";
				for (const d_3 of astOps) opList = opList + formatOp(d_3);
			}
			if (aiOps.length > 0) {
				opList = opList + "\n\nStructural edits (read file, then insert/remove/move):\n";
				for (const d_4 of aiOps) opList = opList + formatOp(d_4);
			}
			let html = !!componentEdit || sourceUrl.startsWith("component://") ? "Apply these design edits to the <b>component definition</b> (not a per-instance override)." : `Apply these design edits to the source code. Source: ${esc(sourceUrl)}`;
			if (componentEdit) {
				html = html + `<br>Target file: <code>${esc(componentEdit.path || componentEdit.componentName)}</code>`;
				html = html + `<br>Component: <code>${esc(componentEdit.componentName)}</code>`;
				html = html + "<br><br>The designer interacted with a <b>live</b> instance on the canvas, then froze the UI they were looking at into editable layers. The snapshot reflects that runtime state (e.g. step 2 of a flow) — not necessarily the component&#39;s initial render. Patch the definition so <em>that</em> state matches the design.";
				if (componentEdit.propsJson && componentEdit.propsJson !== "{}") html = html + `<br><br>Instance props at edit time: <code>${esc(componentEdit.propsJson)}</code>`;
			}
			if (projectRoot) html = html + `<br>Project root: <code>${esc(projectRoot)}</code>`;
			if (screenshotDataUrl) html = html + "<br><br>A screenshot of the designer&#39;s final canvas is attached above. Use it to understand the visual intent.";
			else html = html + "<br><br><b>Step 1:</b> Run <code>take_screenshot</code> to see the final design. Do NOT edit files before seeing the screenshot.";
			html = html + `<br><br><b>Step ${screenshotDataUrl ? "1" : "2"}:</b> For EVERY operation below, run the <code>canvas_read</code> shown to see the element&#39;s full structure. Do this BEFORE editing any files.`;
			html = html + `<br><br><b>Step ${screenshotDataUrl ? "2" : "3"}:</b> Synthesize what the designer intended in 1-2 sentences, then edit the source code to match.`;
			if (opList) html = html + `<br><br><b>Operations:</b>${opList.replace(/\n/g, "<br>")}`;
			if (aiOps.length > 0) html = html + "<br><br><b>If anything is ambiguous, ASK before editing.</b>";
			if (descriptions.length > 0) {
				html = html + "<br>";
				for (const d_5 of descriptions) {
					const truncatedSummary = d_5.summary.length > 60 ? d_5.summary.slice(0, 60) + "…" : d_5.summary;
					const badgeColor = d_5.method === "ast" ? "#2563eb" : "#d97706";
					const badgeBg = d_5.method === "ast" ? "rgba(37,99,235,0.08)" : "rgba(217,119,6,0.08)";
					const methodLabel = d_5.method === "ast" ? "AST" : "AI";
					html = html + `<span contenteditable="false" data-change-badge="true" style="display:inline-flex;align-items:center;gap:4px;font-size:var(--ed-chat-font-size);font-weight:500;color:${badgeColor};background-color:${badgeBg};border-radius:4px;padding:2px 8px;margin:2px;vertical-align:middle;user-select:none;"><span style="font-size:8px;font-weight:700;border-radius:2px;padding:0 3px;background:${badgeBg};color:${badgeColor};">${methodLabel}</span><span style="font-weight:600;flex-shrink:0;">${esc(d_5.componentName)}</span><span style="color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(truncatedSummary)}</span></span>`;
				}
			}
			input_7.innerHTML = html;
			if (screenshotDataUrl) addContextRef({
				type: "image",
				id: `save-to-code-screenshot-${Date.now()}`,
				name: "Canvas screenshot",
				data: screenshotDataUrl
			});
			updateComposerContentState();
		}
	}));
	const lastMessage = messages[messages.length - 1];
	const activeMessageId = busy && lastMessage?.role === "assistant" ? lastMessage.id : null;
	const showBareWorking = busy && !activeMessageId;
	let t60;
	if ($[135] !== lastMessage) {
		t60 = lastMessage?.role === "assistant" ? latestAskUser(lastMessage) : null;
		$[135] = lastMessage;
		$[136] = t60;
	} else t60 = $[136];
	const askUser = t60;
	const showSeedQuestions = !askUser && seedQuestions;
	let t61;
	if ($[137] !== askUser?.questions || $[138] !== showSeedQuestions) {
		t61 = askUser?.questions ?? (showSeedQuestions ? IMPORT_SEED_QUESTIONS$1 : []);
		$[137] = askUser?.questions;
		$[138] = showSeedQuestions;
		$[139] = t61;
	} else t61 = $[139];
	const questions = t61;
	const questionsKey = askUser && lastMessage ? `${lastMessage.id}:${askUser.toolCallId}` : showSeedQuestions ? "import-seed" : null;
	let t62;
	if ($[140] !== busy || $[141] !== enqueue || $[142] !== questionsKey || $[143] !== reportSendError || $[144] !== scrollMessagesToBottom || $[145] !== sendMessage) {
		t62 = (reply) => {
			setAnsweredQuestionsKey(questionsKey);
			setSeedQuestions(false);
			scrollMessagesToBottom();
			if (busy) enqueue({ text: reply });
			else sendMessage({ text: reply }).catch(reportSendError);
		};
		$[140] = busy;
		$[141] = enqueue;
		$[142] = questionsKey;
		$[143] = reportSendError;
		$[144] = scrollMessagesToBottom;
		$[145] = sendMessage;
		$[146] = t62;
	} else t62 = $[146];
	const answerQuestions = t62;
	let importLiveDetail;
	let importProgress;
	let showQuestions;
	let t63;
	if ($[147] !== activeMessageId || $[148] !== answeredQuestionsKey || $[149] !== busy || $[150] !== lastMessage || $[151] !== messages || $[152] !== questions.length || $[153] !== questionsKey || $[154] !== seedProgress) {
		importProgress = currentImportProgress(messages, busy) ?? (busy && seedProgress ? IMPORT_SEED_PROGRESS$1 : null);
		importLiveDetail = importProgress && activeMessageId && lastMessage ? liveActivityLabel(lastMessage) : void 0;
		showQuestions = questions.length > 0 && questionsKey !== answeredQuestionsKey;
		t63 = !!importProgress && !busy && !showQuestions && importProgress.steps.some(_temp20$2);
		$[147] = activeMessageId;
		$[148] = answeredQuestionsKey;
		$[149] = busy;
		$[150] = lastMessage;
		$[151] = messages;
		$[152] = questions.length;
		$[153] = questionsKey;
		$[154] = seedProgress;
		$[155] = importLiveDetail;
		$[156] = importProgress;
		$[157] = showQuestions;
		$[158] = t63;
	} else {
		importLiveDetail = $[155];
		importProgress = $[156];
		showQuestions = $[157];
		t63 = $[158];
	}
	const importStopped = t63;
	let t64;
	if ($[159] !== reportSendError || $[160] !== scrollMessagesToBottom || $[161] !== sendMessage) {
		t64 = () => {
			scrollMessagesToBottom();
			sendMessage({ text: RESUME_IMPORT_PROMPT$1 }).catch(reportSendError);
		};
		$[159] = reportSendError;
		$[160] = scrollMessagesToBottom;
		$[161] = sendMessage;
		$[162] = t64;
	} else t64 = $[162];
	const resumeImport = t64;
	let t65;
	if ($[163] !== host.approvals) {
		t65 = host.approvals ?? [];
		$[163] = host.approvals;
		$[164] = t65;
	} else t65 = $[164];
	const approvals = t65;
	let t66;
	if ($[165] !== approvals || $[166] !== host) {
		t66 = approvals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: approvals.map((approval) => {
				const filePath = approval.args?.file_path || approval.args?.path || "";
				const shortPath = filePath ? filePath.split("/").slice(-2).join("/") : "file";
				const copyTargets = /local_copy_file$/.test(approval.toolName) ? (Array.isArray(approval.args?.files) ? approval.args.files : [approval.args]).flatMap(_temp21$2) : [];
				const isFileTool = !/shell/i.test(approval.toolName) && /write|edit|delete/i.test(approval.toolName);
				const actionLabel = approval.toolName.includes("delete") || approval.toolName === "Delete" ? "Delete" : approval.toolName.includes("write") || approval.toolName === "Write" ? "Write" : "Edit";
				const title = approval.origin === "cli" && !isFileTool ? describeApprovalTool(approval.toolName) : copyTargets.length > 1 ? `Copy ${copyTargets.length} files` : copyTargets.length === 1 ? `Copy to ${copyTargets[0].split("/").slice(-2).join("/")}` : `${actionLabel} ${shortPath}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-ed-border rounded-lg p-2.5 bg-ed-muted/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-ed-chat font-medium text-ed-foreground mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
								width: 13,
								height: 13,
								className: "text-yellow-500 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: title
							})]
						}),
						approval.sensitive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-ed-chat text-ed-muted-foreground mb-1.5",
							children: "Always asks: this file can run code outside your app."
						}),
						copyTargets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border whitespace-pre-wrap break-all",
							children: copyTargets.join("\n")
						}),
						approval.origin === "cli" && !isFileTool && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border whitespace-pre-wrap break-all",
							children: summarizeApprovalArgs(approval.toolName, approval.args)
						}),
						isFileTool && (approval.toolName.includes("edit") || approval.toolName === "Edit") && approval.args?.old_string && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-red-400 line-through",
								children: [approval.args.old_string.slice(0, 200), approval.args.old_string.length > 200 ? "..." : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-emerald-400 mt-0.5",
								children: [approval.args.new_string?.slice(0, 200), (approval.args.new_string?.length || 0) > 200 ? "..." : ""]
							})]
						}),
						isFileTool && (approval.toolName.includes("write") || approval.toolName === "Write") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-ed-chat text-ed-muted-foreground mb-1.5",
							children: approval.args?.content ? `${approval.args.content.split("\n").length} lines` : "New file"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: () => host.onResolveApproval?.(approval.approvalId, true),
								size: "xs",
								className: "bg-emerald-600 text-ed-chat font-medium text-white hover:bg-emerald-500",
								LeftIcon: CheckIcon,
								leftIconSize: 11,
								children: "Approve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: () => host.onResolveApproval?.(approval.approvalId, false),
								variant: "outline",
								size: "xs",
								className: "border-ed-border bg-ed-muted text-ed-chat font-medium text-ed-muted-foreground hover:bg-ed-muted/80",
								LeftIcon: XIcon,
								leftIconSize: 11,
								children: "Reject"
							})]
						})
					]
				}, approval.approvalId);
			})
		}) : null;
		$[165] = approvals;
		$[166] = host;
		$[167] = t66;
	} else t66 = $[167];
	const approvalCards = t66;
	const t67 = variant === "default" && "pt-1";
	let t68;
	if ($[168] !== t67) {
		t68 = cn$2("flex h-full flex-col overflow-hidden bg-ed-background", t67);
		$[168] = t67;
		$[169] = t68;
	} else t68 = $[169];
	let t69;
	if ($[170] !== activeChatId || $[171] !== busy || $[172] !== chatColor || $[173] !== chatColors || $[174] !== chatList || $[175] !== host || $[176] !== onArchiveAllChats || $[177] !== onArchiveChat || $[178] !== onNewChat || $[179] !== onOpenArchivedChats || $[180] !== onSwitchChat || $[181] !== showChatList || $[182] !== variant) {
		t69 = variant === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2 px-3 pb-2 border-b border-ed-border",
			children: [
				chatColor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-2.5 h-2.5 rounded-full shrink-0",
					style: { backgroundColor: chatColor }
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalLogo, { className: "size-4 shrink-0" }),
				chatList && chatList.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1 overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, {
						open: showChatList,
						onOpenChange: setShowChatList,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "text",
								isChildText: false,
								className: "flex w-full min-w-0 max-w-full shrink justify-start gap-1 overflow-hidden text-ed-chat text-ed-foreground hover:text-ed-foreground/80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 truncate",
									children: chatList.find((c) => c.id === activeChatId)?.title || "New chat"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
									width: 12,
									height: 12,
									className: "text-ed-muted-foreground shrink-0"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
							align: "start",
							side: "bottom",
							sideOffset: 4,
							collisionPadding: 8,
							onOpenAutoFocus: _temp22$2,
							onCloseAutoFocus: _temp23$2,
							className: "w-72 bg-ed-background border border-ed-border rounded-lg shadow-lg z-50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								viewportClassName: "max-h-80 p-1",
								children: chatList.map((chat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `group relative flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${chat.id === activeChatId ? "bg-ed-muted text-ed-foreground" : "text-ed-muted-foreground hover:bg-ed-muted/50 hover:text-ed-foreground"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											className: "absolute inset-0 h-full w-full rounded-md bg-transparent hover:bg-transparent",
											"aria-label": `Open ${chat.title || "chat"}`,
											onClick: () => {
												onSwitchChat?.(chat.id);
												setShowChatList(false);
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none relative w-2 h-2 rounded-full flex-shrink-0",
											style: { backgroundColor: chatList.length > 1 ? chatColors?.get(chat.id) || "#2563eb" : "transparent" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none relative truncate flex-1 min-w-0",
											children: chat.title || "New chat"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
											appearance: "inline",
											className: "relative shrink-0 text-ed-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
											tooltip: "Archive chat",
											label: `Archive ${chat.title || "chat"}`,
											disabled: !onArchiveChat || chat.id === activeChatId && busy,
											onClick: (event) => {
												event.stopPropagation();
												event.preventDefault();
												onArchiveChat?.(chat.id);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveIcon, {})
										})
									]
								}, chat.id))
							})
						})]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-ed-chat font-medium text-ed-foreground",
					children: "AI Assistant"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex shrink-0 items-center gap-1.5",
					children: [onNewChat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						className: "h-6 w-6",
						onClick: () => onNewChat(),
						title: "New chat",
						LeftIcon: PlusIcon,
						leftIconSize: 14
					}), (host.onOpenSettings || onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
						modal: false,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								className: "h-6 w-6",
								title: "AI settings",
								LeftIcon: SettingsIcon,
								leftIconSize: 14,
								"aria-label": "AI settings"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							sideOffset: 4,
							children: [
								onOpenArchivedChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onSelect: onOpenArchivedChats,
									children: "Archived chats"
								}),
								onArchiveAllChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									disabled: !chatList || chatList.length === 0,
									onSelect: onArchiveAllChats,
									children: "Archive all chats"
								}),
								host.onOpenSettings && (onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								host.onOpenSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onSelect: () => host.onOpenSettings?.(),
									children: "Settings"
								})
							]
						})]
					})]
				})
			]
		});
		$[170] = activeChatId;
		$[171] = busy;
		$[172] = chatColor;
		$[173] = chatColors;
		$[174] = chatList;
		$[175] = host;
		$[176] = onArchiveAllChats;
		$[177] = onArchiveChat;
		$[178] = onNewChat;
		$[179] = onOpenArchivedChats;
		$[180] = onSwitchChat;
		$[181] = showChatList;
		$[182] = variant;
		$[183] = t69;
	} else t69 = $[183];
	const t70 = variant === "sidebar-v2" ? "gap-7" : "gap-6";
	let t71;
	if ($[184] !== t70) {
		t71 = cn$2("relative flex flex-col", t70);
		$[184] = t70;
		$[185] = t71;
	} else t71 = $[185];
	let t72;
	if ($[186] !== applyComposerSuggestion || $[187] !== hasButtonComponent || $[188] !== messages.length || $[189] !== variant) {
		t72 = messages.length === 0 && (variant === "sidebar-v2" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 items-center justify-center py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full max-w-64 flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 text-center text-ed-chat text-ed-muted-foreground/60",
					children: "Try asking"
				}), [
					{
						label: "Import design system",
						prompt: "Import my design system from my local codebase (colours, typography, spacing, icons and components) into this file."
					},
					{ label: "Design a profile card" },
					{ label: hasButtonComponent ? "Show all Button variants" : "Make a Button component" },
					{ label: "Make 3 hero variations" }
				].map((t73) => {
					const { label, prompt } = t73;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "xs",
						variant: "secondary",
						isChildText: false,
						className: "w-full justify-start px-3 text-ed-muted-foreground hover:text-ed-foreground",
						onClick: () => applyComposerSuggestion(prompt ?? label),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: label
						})
					}, label);
				})]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center text-ed-muted-foreground text-ed-chat py-12 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ask me to help with your design." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-ed-chat text-ed-muted-foreground/60",
				children: "Select something on the canvas and it joins your message"
			})]
		}));
		$[186] = applyComposerSuggestion;
		$[187] = hasButtonComponent;
		$[188] = messages.length;
		$[189] = variant;
		$[190] = t72;
	} else t72 = $[190];
	let t73;
	if ($[191] !== activeMessageId || $[192] !== approvalCards || $[193] !== messages || $[194] !== onSelectElement || $[195] !== setLightboxUrl || $[196] !== store || $[197] !== variant || $[198] !== workElapsedMs) {
		t73 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatTranscriptV2, {
			messages,
			store,
			variant,
			activeMessageId,
			activeFooter: approvalCards,
			activeDurationMs: workElapsedMs,
			onSelectElement,
			onOpenScreenshot: setLightboxUrl
		});
		$[191] = activeMessageId;
		$[192] = approvalCards;
		$[193] = messages;
		$[194] = onSelectElement;
		$[195] = setLightboxUrl;
		$[196] = store;
		$[197] = variant;
		$[198] = workElapsedMs;
		$[199] = t73;
	} else t73 = $[199];
	let t74;
	if ($[200] !== approvalCards || $[201] !== showBareWorking || $[202] !== workElapsedMs) {
		t74 = showBareWorking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 max-w-full items-start gap-2.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 max-w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkingIndicator, { durationMs: workElapsedMs }), approvalCards && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2",
					children: approvalCards
				})]
			})
		});
		$[200] = approvalCards;
		$[201] = showBareWorking;
		$[202] = workElapsedMs;
		$[203] = t74;
	} else t74 = $[203];
	let t75;
	if ($[204] !== busy || $[205] !== importLiveDetail || $[206] !== importProgress || $[207] !== importStopped || $[208] !== resumeImport) {
		t75 = importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportProgressCard, {
			progress: importProgress,
			liveDetail: importLiveDetail,
			running: busy,
			onResume: importStopped ? resumeImport : void 0
		});
		$[204] = busy;
		$[205] = importLiveDetail;
		$[206] = importProgress;
		$[207] = importStopped;
		$[208] = resumeImport;
		$[209] = t75;
	} else t75 = $[209];
	let t76;
	if ($[210] !== agentSetup.status || $[211] !== messages.length || $[212] !== selectedAgent || $[213] !== setSetupOpen || $[214] !== showAgentSetup || $[215] !== variant) {
		t76 = messages.length > 0 && showAgentSetup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSetupPanel, {
			agent: selectedAgent,
			onSetup: () => setSetupOpen(true),
			status: agentSetup.status,
			variant
		});
		$[210] = agentSetup.status;
		$[211] = messages.length;
		$[212] = selectedAgent;
		$[213] = setSetupOpen;
		$[214] = showAgentSetup;
		$[215] = variant;
		$[216] = t76;
	} else t76 = $[216];
	let t77;
	if ($[217] !== host) {
		t77 = host.planLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-lg border border-ed-border bg-ed-muted/40 p-3 text-ed-chat",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
						width: 14,
						height: 14,
						className: "text-yellow-500 shrink-0 mt-0.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-ed-foreground",
							children: "Plan limit reached"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-ed-muted-foreground mt-0.5",
							children: host.planLimit.message
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => host.onDismissPlanLimit?.(),
						variant: "ghost",
						size: "icon-xs",
						className: "text-ed-muted-foreground hover:text-ed-foreground",
						LeftIcon: XIcon,
						leftIconSize: 12,
						"aria-label": "Dismiss"
					})
				]
			})
		});
		$[217] = host;
		$[218] = t77;
	} else t77 = $[218];
	let t78;
	if ($[219] !== clearError || $[220] !== error || $[221] !== isSetupError || $[222] !== showAgentSetup) {
		t78 = error && !(showAgentSetup && isSetupError) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-3 my-2 rounded-lg border border-ed-destructive/30 bg-ed-destructive/5 p-3 text-ed-chat",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
						width: 14,
						height: 14,
						className: "text-ed-destructive shrink-0 mt-0.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-ed-destructive",
								children: error.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-ed-muted-foreground mt-0.5",
								children: error.message
							}),
							error.action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-ed-foreground/70 mt-1.5 bg-ed-muted rounded px-2 py-1.5 font-mono text-[11px] leading-relaxed",
								children: error.action
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => {
							setLocalError(null);
							clearError();
						},
						variant: "ghost",
						size: "icon-xs",
						className: "text-ed-muted-foreground hover:text-ed-foreground",
						LeftIcon: XIcon,
						leftIconSize: 12,
						"aria-label": "Dismiss error"
					})
				]
			})
		});
		$[219] = clearError;
		$[220] = error;
		$[221] = isSetupError;
		$[222] = showAgentSetup;
		$[223] = t78;
	} else t78 = $[223];
	let t79;
	if ($[224] !== messagesContentRef || $[225] !== t71 || $[226] !== t72 || $[227] !== t73 || $[228] !== t74 || $[229] !== t75 || $[230] !== t76 || $[231] !== t77 || $[232] !== t78) {
		t79 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: messagesContentRef,
			className: t71,
			children: [
				t72,
				t73,
				t74,
				t75,
				t76,
				t77,
				t78
			]
		});
		$[224] = messagesContentRef;
		$[225] = t71;
		$[226] = t72;
		$[227] = t73;
		$[228] = t74;
		$[229] = t75;
		$[230] = t76;
		$[231] = t77;
		$[232] = t78;
		$[233] = t79;
	} else t79 = $[233];
	let t80;
	if ($[234] !== messagesScrollRef || $[235] !== t79) {
		t80 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1 bg-ed-background",
			viewportClassName: "select-text px-3 pt-3 pb-5",
			viewportRef: messagesScrollRef,
			children: t79
		});
		$[234] = messagesScrollRef;
		$[235] = t79;
		$[236] = t80;
	} else t80 = $[236];
	const t81 = variant === "sidebar-v2" ? "px-3 pb-3" : "px-2 pb-2";
	let t82;
	if ($[237] !== t81) {
		t82 = cn$2("relative -mt-2", t81);
		$[237] = t81;
		$[238] = t82;
	} else t82 = $[238];
	let t83;
	if ($[239] !== mentions.open || $[240] !== messagesAtBottom || $[241] !== scrollMessagesToBottom || $[242] !== slashOpen || $[243] !== variant) {
		t83 = variant === "sidebar-v2" && !messagesAtBottom && !slashOpen && !mentions.open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 bottom-full z-20 h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "icon-xs",
				isChildText: false,
				className: "pointer-events-auto absolute bottom-2 right-3 size-6 border-ed-border bg-ed-background p-0 text-ed-muted-foreground shadow-sm hover:bg-ed-ghost-hover",
				onClick: () => scrollMessagesToBottom("smooth"),
				"aria-label": "Scroll to newest message",
				title: "Scroll to newest message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
					width: 12,
					height: 12,
					className: "size-3"
				})
			})
		});
		$[239] = mentions.open;
		$[240] = messagesAtBottom;
		$[241] = scrollMessagesToBottom;
		$[242] = slashOpen;
		$[243] = variant;
		$[244] = t83;
	} else t83 = $[244];
	let t84;
	if ($[245] !== answerQuestions || $[246] !== questions || $[247] !== questionsKey || $[248] !== showQuestions) {
		t84 = showQuestions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 mb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskUserCard, {
				questions,
				onReply: answerQuestions
			}, questionsKey)
		});
		$[245] = answerQuestions;
		$[246] = questions;
		$[247] = questionsKey;
		$[248] = showQuestions;
		$[249] = t84;
	} else t84 = $[249];
	let t85;
	if ($[250] !== mentions.id || $[251] !== mentions.loading || $[252] !== mentions.open || $[253] !== mentions.options || $[254] !== mentions.select || $[255] !== mentions.selectedIndex || $[256] !== mentions.setIndex) {
		t85 = mentions.open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMentionMenu, {
			id: mentions.id,
			options: mentions.options,
			selectedIndex: mentions.selectedIndex,
			onHover: mentions.setIndex,
			onSelect: mentions.select,
			loading: mentions.loading
		});
		$[250] = mentions.id;
		$[251] = mentions.loading;
		$[252] = mentions.open;
		$[253] = mentions.options;
		$[254] = mentions.select;
		$[255] = mentions.selectedIndex;
		$[256] = mentions.setIndex;
		$[257] = t85;
	} else t85 = $[257];
	const t86 = slashOpen || mentions.open ? "rounded-b-md" : "rounded-md";
	const t87 = variant === "sidebar-v2" ? "gap-2 px-2 py-2" : "gap-1.5 p-2.5";
	let t88;
	if ($[258] !== t86 || $[259] !== t87) {
		t88 = cn$2("relative z-10 flex flex-col border bg-ed-card shadow-[0_3px_12px_rgba(0,0,0,0.05)]", t86, t87);
		$[258] = t86;
		$[259] = t87;
		$[260] = t88;
	} else t88 = $[260];
	const t89 = composerFocused || slashOpen || mentions.open ? "var(--ed-menu-border)" : "var(--ed-border)";
	let t90;
	if ($[261] !== t89) {
		t90 = { borderColor: t89 };
		$[261] = t89;
		$[262] = t90;
	} else t90 = $[262];
	let t91;
	if ($[263] !== hasComposerContent) {
		t91 = !hasComposerContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute left-0.5 top-0 text-ed-chat leading-5 text-ed-muted-foreground/50",
			children: "Design, build, / for skills, @ for context"
		});
		$[263] = hasComposerContent;
		$[264] = t91;
	} else t91 = $[264];
	const t92 = mentions.open;
	const t93 = variant === "sidebar-v2" ? "min-h-6.5 text-ed-chat" : "min-h-[28px] text-ed-chat";
	let t94;
	if ($[265] !== t93) {
		t94 = cn$2("ed-chat-composer w-full min-w-0 max-w-full max-h-[300px] overflow-y-auto whitespace-pre-wrap bg-transparent px-0.5 text-ed-foreground focus:outline-none [overflow-wrap:anywhere] [word-break:break-word]", t93, "leading-5");
		$[265] = t93;
		$[266] = t94;
	} else t94 = $[266];
	let t95;
	if ($[267] !== onSelectElement || $[268] !== referenceMounts || $[269] !== store) {
		t95 = referenceMounts.map((mount_4) => (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatReferenceChip, {
			reference: mount_4.reference,
			store,
			onSelectElement,
			onRemove: () => inlineComposerRef.current?.removeReference(mount_4.key)
		}), mount_4.node, mount_4.key));
		$[267] = onSelectElement;
		$[268] = referenceMounts;
		$[269] = store;
		$[270] = t95;
	} else t95 = $[270];
	let t96;
	if ($[271] !== host.agentId || $[272] !== host.agents) {
		t96 = host.agents.length > 0 ? host.agents : [{
			id: host.agentId,
			label: host.agentId
		}];
		$[271] = host.agentId;
		$[272] = host.agents;
		$[273] = t96;
	} else t96 = $[273];
	const t97 = t96;
	let t98;
	if ($[274] !== agentSetup.isDesktop || $[275] !== host.agentId || $[276] !== openAgentSetup) {
		t98 = agentSetup.isDesktop ? { onManageAgent: () => openAgentSetup(host.agentId) } : {};
		$[274] = agentSetup.isDesktop;
		$[275] = host.agentId;
		$[276] = openAgentSetup;
		$[277] = t98;
	} else t98 = $[277];
	const t99 = host.models;
	const t100 = host.policy ?? "auto";
	let t101;
	if ($[278] !== host.checkStatus) {
		t101 = host.checkStatus ? { checkAgentStatus: host.checkStatus } : {};
		$[278] = host.checkStatus;
		$[279] = t101;
	} else t101 = $[279];
	let t102;
	if ($[280] !== agentSetup.status || $[281] !== busy || $[282] !== effectiveEffort || $[283] !== host.agentId || $[284] !== host.fast || $[285] !== host.modelId || $[286] !== host.onAgentChange || $[287] !== host.onEffortChange || $[288] !== host.onFastChange || $[289] !== host.onModelChange || $[290] !== host.onPolicyChange || $[291] !== modelEfforts || $[292] !== openAgentSetup || $[293] !== showAgentSetup || $[294] !== t100 || $[295] !== t101 || $[296] !== t97 || $[297] !== t98 || $[298] !== t99) {
		t102 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 items-center gap-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModelPickerV2, {
				agents: t97,
				agentId: host.agentId,
				onAgentChange: host.onAgentChange,
				agentLocked: busy,
				...t98,
				models: t99,
				modelId: host.modelId,
				onModelChange: host.onModelChange,
				efforts: modelEfforts,
				effort: effectiveEffort,
				onEffortChange: host.onEffortChange,
				policy: t100,
				onPolicyChange: host.onPolicyChange,
				fast: host.fast,
				onFastChange: host.onFastChange,
				agentNeedsSetup: showAgentSetup,
				agentStatus: agentSetup.status,
				...t101,
				onSetUpAgent: openAgentSetup
			})
		});
		$[280] = agentSetup.status;
		$[281] = busy;
		$[282] = effectiveEffort;
		$[283] = host.agentId;
		$[284] = host.fast;
		$[285] = host.modelId;
		$[286] = host.onAgentChange;
		$[287] = host.onEffortChange;
		$[288] = host.onFastChange;
		$[289] = host.onModelChange;
		$[290] = host.onPolicyChange;
		$[291] = modelEfforts;
		$[292] = openAgentSetup;
		$[293] = showAgentSetup;
		$[294] = t100;
		$[295] = t101;
		$[296] = t97;
		$[297] = t98;
		$[298] = t99;
		$[299] = t102;
	} else t102 = $[299];
	const T0 = ContextMenuV2;
	const t103 = host.onAddAllowedPath;
	const t104 = host.onRemoveAllowedPath;
	let t105;
	if ($[300] === Symbol.for("react.memo_cache_sentinel")) {
		t105 = () => attachInputRef.current?.click();
		$[300] = t105;
	} else t105 = $[300];
	const t106 = selectedRefs.length > 0 ? pinSelection : void 0;
	let t107;
	if ($[301] !== host.listMcpServers || $[302] !== mcpServers || $[303] !== revalidateMcpServers) {
		t107 = host.listMcpServers ? {
			mcpServers,
			onLoadMcpServers: revalidateMcpServers
		} : {};
		$[301] = host.listMcpServers;
		$[302] = mcpServers;
		$[303] = revalidateMcpServers;
		$[304] = t107;
	} else t107 = $[304];
	const t108 = contextRefs.flatMap(_temp26$1);
	let t109;
	if ($[305] !== addContextRef || $[306] !== updateComposerContentState) {
		t109 = (server, selected) => {
			const id_3 = `connection:${server.name}`;
			if (selected) addContextRef({
				type: "connection",
				id: id_3,
				name: server.name,
				displayName: connectionDisplayName(server)
			});
			else {
				inlineComposerRef.current?.removeReferences(id_3);
				updateComposerContentState();
				inputRef.current?.focus();
			}
		};
		$[305] = addContextRef;
		$[306] = updateComposerContentState;
		$[307] = t109;
	} else t109 = $[307];
	let t110;
	if ($[308] !== T0 || $[309] !== allowedPaths || $[310] !== host.onAddAllowedPath || $[311] !== host.onRemoveAllowedPath || $[312] !== openSkillsMenu || $[313] !== selectedAgent.mcpCommand || $[314] !== t105 || $[315] !== t106 || $[316] !== t107 || $[317] !== t108 || $[318] !== t109) {
		t110 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			folders: allowedPaths,
			onAddFolder: t103,
			onRemoveFolder: t104,
			onAttach: t105,
			onPinSelection: t106,
			onOpenSkills: openSkillsMenu,
			...t107,
			selectedConnections: t108,
			onConnectionChange: t109,
			mcpCommand: selectedAgent.mcpCommand,
			onRunInTerminal: _temp27$1
		});
		$[308] = T0;
		$[309] = allowedPaths;
		$[310] = host.onAddAllowedPath;
		$[311] = host.onRemoveAllowedPath;
		$[312] = openSkillsMenu;
		$[313] = selectedAgent.mcpCommand;
		$[314] = t105;
		$[315] = t106;
		$[316] = t107;
		$[317] = t108;
		$[318] = t109;
		$[319] = t110;
	} else t110 = $[319];
	let t111;
	if ($[320] !== busy || $[321] !== handleStop) {
		t111 = busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Stop response (Esc)",
			onClick: handleStop,
			variant: "outline",
			className: "text-ed-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopIcon, {})
		});
		$[320] = busy;
		$[321] = handleStop;
		$[322] = t111;
	} else t111 = $[322];
	let t112;
	if ($[323] !== busy || $[324] !== canSend || $[325] !== handleSubmit) {
		t112 = (!busy || canSend) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: busy ? `Steer current run (Enter) · Queue (${IS_MAC ? "⌘" : "Ctrl+"}Enter)` : "Send message",
			onClick: () => handleSubmit(),
			variant: "secondary",
			"aria-disabled": !canSend,
			className: cn$2(!canSend && "text-ed-muted-foreground"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {})
		});
		$[323] = busy;
		$[324] = canSend;
		$[325] = handleSubmit;
		$[326] = t112;
	} else t112 = $[326];
	let t113;
	if ($[327] !== lightboxUrl || $[328] !== setLightboxUrl) {
		t113 = lightboxUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 flex items-center justify-center bg-black/70",
			style: {
				zIndex: 99999,
				WebkitAppRegion: "no-drag"
			},
			onClick: () => setLightboxUrl(null),
			onKeyDown: (e_5) => e_5.key === "Escape" && setLightboxUrl(null),
			tabIndex: 0,
			ref: _temp28$1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: (e_6) => {
					e_6.stopPropagation();
					setLightboxUrl(null);
				},
				variant: "ghost",
				size: "icon-sm",
				className: "absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70 hover:text-white",
				LeftIcon: XIcon,
				leftIconSize: 20,
				"aria-label": "Close screenshot"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: lightboxUrl,
				alt: "Screenshot",
				className: "max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
			})]
		});
		$[327] = lightboxUrl;
		$[328] = setLightboxUrl;
		$[329] = t113;
	} else t113 = $[329];
	let t114;
	if ($[330] !== closeAgentSetup || $[331] !== setSetupOpen) {
		t114 = (next) => {
			if (next) setSetupOpen(true);
			else closeAgentSetup();
		};
		$[330] = closeAgentSetup;
		$[331] = setSetupOpen;
		$[332] = t114;
	} else t114 = $[332];
	let t115;
	if ($[333] !== host.login || $[334] !== setupAgent) {
		t115 = host.login ? { onSignIn: () => host.login(setupAgent.id) } : {};
		$[333] = host.login;
		$[334] = setupAgent;
		$[335] = t115;
	} else t115 = $[335];
	let t116;
	if ($[336] !== host.logout || $[337] !== setupAgent) {
		t116 = host.logout ? { onSignOut: () => host.logout(setupAgent.id) } : {};
		$[336] = host.logout;
		$[337] = setupAgent;
		$[338] = t116;
	} else t116 = $[338];
	let t117;
	if ($[339] !== modalSetup.error || $[340] !== modalSetup.loading || $[341] !== modalSetup.refresh || $[342] !== modalSetup.status || $[343] !== setupAgent || $[344] !== setupOpen || $[345] !== t114 || $[346] !== t115 || $[347] !== t116) {
		t117 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSetupModal, {
			open: setupOpen,
			onOpenChange: t114,
			onConsent: modalSetup.refresh,
			agent: setupAgent,
			...t115,
			...t116,
			status: modalSetup.status,
			loading: modalSetup.loading,
			error: modalSetup.error,
			refresh: modalSetup.refresh
		});
		$[339] = modalSetup.error;
		$[340] = modalSetup.loading;
		$[341] = modalSetup.refresh;
		$[342] = modalSetup.status;
		$[343] = setupAgent;
		$[344] = setupOpen;
		$[345] = t114;
		$[346] = t115;
		$[347] = t116;
		$[348] = t117;
	} else t117 = $[348];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: t68,
		onDrop: handleDrop,
		onDragOver: handleAttachmentDragOver,
		children: [
			t69,
			t80,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: t82,
				children: [
					t83,
					t84,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueuedMessagesV2, {
						queue,
						busy,
						onEdit: editQueued,
						onRemove: takeQueued,
						onSendNow: promoteQueued,
						onResume: resumeQueue
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							t85,
							slashOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlashCommandMenuV2, {
								commands: filteredSlash,
								selectedIndex: slashIndex,
								onHover: setSlashIndex,
								onSelect: applySlashCommand,
								loading: slashCommands === null,
								agentName: selectedAgentLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: t88,
								style: t90,
								children: [
									(hasFolder || selectionRefs.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn$2("flex flex-wrap items-center gap-1 border-b border-ed-border pb-2", variant === "sidebar-v2" ? "-mx-2 px-2" : "-mx-2.5 px-2.5"),
										children: [hasFolder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderChip, {
											folders: allowedPaths,
											onAdd: host.onAddAllowedPath,
											onRemove: host.onRemoveAllowedPath,
											onClear: host.onClearAllowedPaths
										}), selectionRefs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionContextChip, {
											elements: selectionRefs.map((ref_5) => getById(store, ref_5.id)).filter(_temp24$2),
											onRemove: removeSelectionItem,
											onClear: () => setDismissedSelection({
												selection: selectedElementIds,
												ids: new Set(selectedElementIds)
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative min-w-0",
										children: [
											t91,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												ref: inputRef,
												contentEditable: true,
												role: "combobox",
												"aria-label": "Message",
												"aria-autocomplete": "list",
												"aria-expanded": t92,
												"aria-controls": mentions.open ? mentions.id : void 0,
												"aria-activedescendant": mentions.open && mentions.options.length ? `${mentions.id}-option-${mentions.selectedIndex}` : void 0,
												onInput: handleComposerInput,
												onKeyDown: handleComposerKeyDown,
												onKeyUp: syncComposerMenus,
												onClick: syncComposerMenus,
												onFocus: handleComposerFocus,
												onBlur: handleComposerBlur,
												onPaste: handlePaste,
												"data-placeholder": "Design, build, / for skills, @ for context",
												className: t94
											}),
											t95
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "-ml-1 flex min-w-0 items-center justify-between gap-2",
										children: [t102, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex shrink-0 items-center gap-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													ref: attachInputRef,
													type: "file",
													accept: CHAT_ATTACHMENT_ACCEPT,
													multiple: true,
													className: "hidden",
													onChange: (e_4) => {
														const files = e_4.target.files;
														if (!files) return;
														attachFiles(Array.from(files, _temp25$1));
														e_4.target.value = "";
													}
												}),
												t110,
												t111,
												t112
											]
										})]
									})
								]
							})
						]
					})
				]
			}),
			t113,
			t117
		]
	});
});
function _temp$26(t0) {
	const [name, entry] = t0;
	return name.toLowerCase() === "button" || String(entry?.exportName || "").toLowerCase() === "button";
}
function _temp2$16(model) {
	return model.isDefault;
}
function _temp3$12(message) {
	const metadata = message.metadata ?? {};
	const text = metadata.agentContext || messageText(message);
	const refs = metadata.inlineRefs ?? [];
	if (refs.length === 0) return text;
	return inlineChatPrompt(text, refs, metadata.referenceMentions);
}
function _temp4$12(found, message_0) {
	return message_0.metadata?.canvasContext ?? found;
}
function _temp5$11(message_1) {
	return (message_1.metadata ?? {}).inlineRefs ?? [];
}
function _temp6$8(ref_0) {
	return ref_0.type === "element";
}
function _temp7$6(message_2) {
	return message_2.role === "assistant";
}
function _temp8$5() {}
function _temp9$4(mount) {
	return mount.reference;
}
function _temp0$3(command_0) {
	return command_0.source === "petal";
}
function _temp1$3(command_1) {
	return command_1.source !== "petal";
}
function _temp10$3(t0) {
	const { text: text_4, metadata: metadata_2 } = t0;
	const { inlineRefs, referenceMentions: referenceMentions_0 } = metadata_2 ?? {};
	return {
		text: text_4,
		refs: inlineRefs ?? [],
		mentions: referenceMentions_0
	};
}
function _temp11$3(mount_2) {
	return mount_2.reference.region || mount_2.reference.type === "element" ? [mount_2.reference] : [];
}
function _temp12$2(ref_4) {
	const match = ref_4.region && /^Area (\d+)$/.exec(ref_4.name);
	return match ? [Number(match[1])] : [];
}
function _temp13$2(count_2) {
	return count_2 + 1;
}
function _temp14$2(previous_1) {
	return [...previous_1];
}
function _temp15$2(count_3) {
	return count_3 - 1;
}
function _temp16$2(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function _temp17$2(d) {
	return !d.canvasOnly;
}
function _temp18$2(d_0) {
	return d_0.method === "ast";
}
function _temp19$2(d_1) {
	return d_1.method === "ai";
}
function _temp20$2(step) {
	return step.status !== "done";
}
function _temp21$2(file_0) {
	return typeof file_0?.local_path === "string" ? [file_0.local_path] : [];
}
function _temp22$2(e_2) {
	return e_2.preventDefault();
}
function _temp23$2(e_3) {
	return e_3.preventDefault();
}
function _temp24$2(element_0) {
	return !!element_0;
}
function _temp25$1(file_1) {
	return {
		file: file_1,
		isDirectory: false
	};
}
function _temp26$1(ref_6) {
	return ref_6.type === "connection" ? [ref_6.name] : [];
}
function _temp27$1(command_3) {
	return window.dispatchEvent(new CustomEvent("petal-manage-connections", { detail: {
		command: command_3,
		cwd: "agent-workspace"
	} }));
}
function _temp28$1(el) {
	return el?.focus();
}

export { ChatPanelV2 };
