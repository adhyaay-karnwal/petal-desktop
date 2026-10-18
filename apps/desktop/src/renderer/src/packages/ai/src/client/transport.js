// Reconstructed from index-C74mRL57.js — original module: packages/ai/src/client/transport.ts
import { AGENT_CHAT_ABORT_CHANNEL, AGENT_CHAT_CHECK_STATUS_CHANNEL, AGENT_CHAT_GENERATE_TITLE_CHANNEL, AGENT_CHAT_LIST_AGENTS_CHANNEL, AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL, AGENT_CHAT_LIST_MODELS_CHANNEL, AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL, AGENT_CHAT_LOGIN_CHANNEL, AGENT_CHAT_LOGOUT_CHANNEL, AGENT_CHAT_START_CHANNEL, AGENT_CHAT_STEER_CHANNEL, AGENT_CHAT_STREAM_CHANNEL } from "../protocol.js";

/** Adapt the Electron preload `window.api` surface to one chat + catalog IPC object. */
function createAgentChatIpc(api) {
	return {
		start: (request) => api.send(AGENT_CHAT_START_CHANNEL, request),
		abort: (streamId) => api.send(AGENT_CHAT_ABORT_CHANNEL, { streamId }),
		steer: (request) => api.invoke(AGENT_CHAT_STEER_CHANNEL, request),
		onStream: (listener) => api.on(AGENT_CHAT_STREAM_CHANNEL, listener),
		listAgents: () => api.invoke(AGENT_CHAT_LIST_AGENTS_CHANNEL),
		listModels: (agentId) => api.invoke(AGENT_CHAT_LIST_MODELS_CHANNEL, { agentId }),
		listSlashCommands: (agentId, cwd, projectId) => api.invoke(AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL, {
			agentId,
			...cwd ? { cwd } : {},
			...projectId ? { projectId } : {}
		}),
		listMcpServers: (agentId, projectId) => api.invoke(AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL, {
			agentId,
			...projectId ? { projectId } : {}
		}),
		checkStatus: (agentId) => api.invoke(AGENT_CHAT_CHECK_STATUS_CHANNEL, { agentId }),
		login: (agentId) => api.invoke(AGENT_CHAT_LOGIN_CHANNEL, { agentId }),
		logout: (agentId) => api.invoke(AGENT_CHAT_LOGOUT_CHANNEL, { agentId }),
		generateTitle: (request) => api.invoke(AGENT_CHAT_GENERATE_TITLE_CHANNEL, request)
	};
}
/** Messages of a turn joined into one prompt: every CLI takes a turn as a single string. */
var TURN_MESSAGE_SEPARATOR = "\n\n";
/**
* v1 transcripts are `{ role, content }` with no `parts`. v2 `UIMessage`s already
* have `parts`. Either shape has to be safe to put in `useChat`.
*/
function coerceUiMessage(message) {
	if (message && typeof message === "object" && Array.isArray(message.parts)) return message;
	const legacy = message ?? {};
	const text = typeof legacy.content === "string" ? legacy.content : "";
	return {
		id: typeof legacy.id === "string" && legacy.id ? legacy.id : crypto.randomUUID(),
		role: legacy.role === "assistant" ? "assistant" : "user",
		parts: [{
			type: "text",
			text
		}],
		...typeof legacy.workDurationMs === "number" ? { metadata: { workDurationMs: legacy.workDurationMs } } : {}
	};
}
/** Text parts of a message, newline-joined. The default prompt formatter. */
function defaultUserMessageText(message) {
	const fromParts = (Array.isArray(message?.parts) ? message.parts : []).filter((part) => part?.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n");
	if (fromParts) return fromParts;
	const content = message?.content;
	return typeof content === "string" ? content : "";
}
/** Tool names called in a message's parts, in call order. */
function toolNames(message) {
	const names = [];
	for (const part of message.parts ?? []) if (part.type === "dynamic-tool") names.push(part.toolName);
	else if (part.type.startsWith("tool-")) names.push(part.type.slice(5));
	return names;
}
/** Earlier messages as the agent should read them; empty ones are left out. */
function transcriptEntries(messages, formatUserMessage = defaultUserMessageText) {
	const entries = [];
	for (const message of messages) if (message.role === "user") {
		const text = formatUserMessage(message).trim();
		if (text) entries.push({
			role: "user",
			text
		});
	} else if (message.role === "assistant") {
		const text = defaultUserMessageText(message).trim();
		const tools = toolNames(message);
		if (text || tools.length) entries.push({
			role: "assistant",
			text,
			...tools.length ? { tools } : {}
		});
	}
	return entries;
}
/** The user messages this request sends: the newest one, or the batch the body names. */
function turnUserMessages(messages, body) {
	const count = body?.userMessageCount;
	if (count && count > 1) return messages.slice(-count);
	const lastUser = [...messages].reverse().find((m) => m.role === "user");
	return lastUser ? [lastUser] : [];
}
function createAgentChatTransport(options) {
	const { bridge, projectId, getTurn, formatUserMessage, onSessionId, onStreamId, onStreamChunk } = options;
	const newStreamId = options.createStreamId ?? (() => crypto.randomUUID());
	return {
		async sendMessages({ messages, abortSignal, body }) {
			const streamId = newStreamId();
			onStreamId?.(streamId);
			let unsubscribe = null;
			let settled = false;
			return new ReadableStream({
				async start(controller) {
					const finish = () => {
						if (settled) return;
						settled = true;
						unsubscribe?.();
						unsubscribe = null;
						try {
							controller.close();
						} catch {}
					};
					unsubscribe = bridge.onStream((event) => {
						if (event.streamId !== streamId || settled) return;
						if (event.error) {
							settled = true;
							unsubscribe?.();
							unsubscribe = null;
							try {
								controller.error(new Error(event.error));
							} catch {}
							return;
						}
						if (event.sessionId) onSessionId?.(event.sessionId);
						if (event.chunk) {
							onStreamChunk?.();
							controller.enqueue(event.chunk);
						}
						if (event.done) finish();
					});
					abortSignal?.addEventListener("abort", () => {
						bridge.abort(streamId);
						finish();
					}, { once: true });
					const userMessages = turnUserMessages(messages, body);
					let turn;
					try {
						turn = await getTurn(userMessages);
					} catch (error) {
						if (settled) return;
						settled = true;
						unsubscribe?.();
						unsubscribe = null;
						controller.error(error);
						return;
					}
					if (settled) return;
					const userText = userMessages.map((m) => (formatUserMessage ?? defaultUserMessageText)(m)).join(TURN_MESSAGE_SEPARATOR);
					const turnStart = userMessages.length > 0 ? messages.indexOf(userMessages[0]) : -1;
					const transcript = turn.sessionId || turnStart <= 0 ? [] : transcriptEntries(messages.slice(0, turnStart), formatUserMessage);
					const hostContext = transcript.length > 0 ? {
						...turn.hostContext,
						transcript
					} : turn.hostContext;
					bridge.start({
						streamId,
						projectId,
						prompt: userText,
						agentId: turn.agentId,
						cwd: turn.cwd,
						...hostContext ? { hostContext } : {},
						...turn.modelId ? { modelId: turn.modelId } : {},
						...turn.additionalDirectories ? { additionalDirectories: turn.additionalDirectories } : {},
						...turn.policy ? { policy: turn.policy } : {},
						...turn.sessionId ? { sessionId: turn.sessionId } : {},
						...turn.effort ? { effort: turn.effort } : {},
						...turn.iconLibraryNames?.length ? { iconLibraryNames: turn.iconLibraryNames } : {},
						...turn.fast ? { fast: true } : {}
					});
				},
				cancel() {
					bridge.abort(streamId);
					settled = true;
					unsubscribe?.();
					unsubscribe = null;
				}
			});
		},
		async reconnectToStream() {
			return null;
		}
	};
}

export { coerceUiMessage, createAgentChatIpc, createAgentChatTransport, defaultUserMessageText };
