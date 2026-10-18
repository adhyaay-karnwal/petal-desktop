// Reconstructed from index-C74mRL57.js — original module: packages/ai/src/client/react/useAgentChat.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { useChat } from "../../../../../vendor/@ai-sdk/react.js";
import { coerceUiMessage, createAgentChatTransport, defaultUserMessageText } from "../transport.js";

/**
* Headless renderer chat state for the agents-v2 wire.
*
* Owns the IPC transport, the CLI session token, the stream lifecycle and the
* follow-up queue, and exposes a `useChat`-shaped surface (`messages`,
* `sendMessage`, `status`, `stop`, `error`) plus `steer` and the queue. It
* renders nothing: the editor supplies the UI and reads `UIMessage.parts`
* directly.
*
* A message sent mid-turn either steers the running turn or waits in the queue
* for it to end. As in Claude Code, everything queued sends together as the
* next turn: one user message each, joined into one prompt. Stop hands every
* message the agent has not seen back to the caller (the composer). A turn
* that fails holds the queue until `resumeQueue`.
*
* The transport must stay stable across renders, so the caller's `getTurn`
* runs imperatively at send time through a ref instead of being recreated.
* Every other callback is read from the same ref, so re-renders do not restart
* the stream or re-persist the transcript.
*/
/** The outgoing message itself, without queue bookkeeping. */
function toOutgoing({ text, metadata }) {
	return {
		text,
		...metadata !== void 0 ? { metadata } : {}
	};
}
/** The transcript user message for an outgoing message, shaped as `sendMessage` builds it. */
function toUserMessage({ text, metadata }) {
	return {
		id: crypto.randomUUID(),
		role: "user",
		parts: [{
			type: "text",
			text
		}],
		...metadata !== void 0 ? { metadata } : {}
	};
}
/** The prompt text main receives for a user message. */
function formatPrompt(options, message) {
	return options.formatUserMessage?.(message) ?? defaultUserMessageText(message);
}
function useAgentChat(options) {
	const optionsRef = (0, import_react.useRef)(options);
	(0, import_react.useLayoutEffect)(() => {
		optionsRef.current = options;
	});
	const streamIdRef = (0, import_react.useRef)(null);
	const streamChunkReceivedRef = (0, import_react.useRef)(false);
	const [transport] = (0, import_react.useState)(() => createAgentChatTransport({
		bridge: options.bridge,
		projectId: options.projectId,
		getTurn: (userMessages) => optionsRef.current.getTurn(userMessages),
		formatUserMessage: (message) => formatPrompt(optionsRef.current, message),
		onSessionId: (sessionId) => optionsRef.current.onSessionId?.(sessionId),
		onStreamId: (streamId) => {
			streamIdRef.current = streamId;
		},
		onStreamChunk: () => {
			streamChunkReceivedRef.current = true;
		}
	}));
	const [queue, setQueue] = (0, import_react.useState)([]);
	const queueRef = (0, import_react.useRef)(queue);
	const updateQueue = (0, import_react.useCallback)((update) => {
		const next = update(queueRef.current);
		if (next === queueRef.current) return;
		queueRef.current = next;
		setQueue(next);
	}, []);
	const busyRef = (0, import_react.useRef)(false);
	const drainedBatchRef = (0, import_react.useRef)(null);
	const steersInFlightRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	/** Settle the stream's steers and return the ones that never reached it. */
	const endSteers = (0, import_react.useCallback)((streamId_0, reason) => {
		const unsent = [];
		for (const [id, steer] of steersInFlightRef.current) {
			if (steer.streamId !== streamId_0) continue;
			if (steer.restarted) {
				steersInFlightRef.current.delete(id);
				unsent.push(steer.message);
			} else steer.streamEnd = reason;
		}
		return unsent;
	}, []);
	const [seedMessages] = (0, import_react.useState)(() => (options.initialMessages ?? []).map((message_0) => coerceUiMessage(message_0)));
	const { messages, setMessages, sendMessage, status, stop, error, clearError } = useChat({
		transport,
		messages: seedMessages,
		onData: (part) => {
			if (part.type === "data-steer") steersInFlightRef.current.delete(part.id ?? "");
		},
		onFinish: ({ isAbort, isError }) => {
			const unsent_0 = endSteers(streamIdRef.current, isAbort ? "stop" : isError ? "error" : "done");
			if (isAbort) {
				unsent_0.push(...queueRef.current.map(toOutgoing));
				updateQueue((previous) => previous.length === 0 ? previous : []);
				drainedBatchRef.current = null;
			} else if (isError) {
				const batch = drainedBatchRef.current;
				if (batch && !streamChunkReceivedRef.current) {
					const batchTexts = batch.map((message_1) => message_1.text);
					setMessages((previous_0) => {
						const next_0 = [...previous_0];
						for (let index = batchTexts.length - 1; index >= 0; index -= 1) {
							const text = batchTexts[index];
							let at = -1;
							for (let messageIndex = next_0.length - 1; messageIndex >= 0; messageIndex -= 1) {
								const message_2 = next_0[messageIndex];
								if (message_2.role === "user" && defaultUserMessageText(message_2) === text) {
									at = messageIndex;
									break;
								}
							}
							if (at === -1) break;
							next_0.splice(at, 1);
						}
						return next_0;
					});
					updateQueue((previous_1) => [...batch.map((message_3) => ({
						...message_3,
						held: true
					})), ...previous_1.map((message_4) => ({
						...message_4,
						held: true
					}))]);
				} else updateQueue((previous_2) => previous_2.length === 0 ? previous_2 : previous_2.map((message_5) => ({
					...message_5,
					held: true
				})));
				drainedBatchRef.current = null;
			} else drainedBatchRef.current = null;
			streamChunkReceivedRef.current = false;
			if (unsent_0.length > 0) optionsRef.current.onUnsent?.(unsent_0);
		}
	});
	const busy = status === "submitted" || status === "streaming";
	const startingRef = (0, import_react.useRef)(false);
	(0, import_react.useLayoutEffect)(() => {
		busyRef.current = busy;
		if (busy) startingRef.current = false;
	});
	const drainQueue = (0, import_react.useCallback)(() => {
		if (busyRef.current || startingRef.current) return;
		const batch_0 = queueRef.current.filter((message_6) => !message_6.held);
		const last = batch_0[batch_0.length - 1];
		if (!last) return;
		startingRef.current = true;
		drainedBatchRef.current = batch_0;
		streamChunkReceivedRef.current = false;
		updateQueue((previous_3) => previous_3.filter((message_7) => message_7.held));
		if (batch_0.length > 1) setMessages((previous_4) => [...previous_4, ...batch_0.slice(0, -1).map(toUserMessage)]);
		const body = { userMessageCount: batch_0.length };
		sendMessage(toOutgoing(last), { body });
	}, [
		sendMessage,
		setMessages,
		updateQueue
	]);
	const drainQueueRef = (0, import_react.useRef)(drainQueue);
	(0, import_react.useLayoutEffect)(() => {
		drainQueueRef.current = drainQueue;
	});
	(0, import_react.useEffect)(() => {
		if (!busy) drainQueueRef.current();
	}, [busy, queue]);
	const enqueueAt = (0, import_react.useCallback)((message_8, front) => {
		const queued = {
			...message_8,
			id: crypto.randomUUID()
		};
		updateQueue((previous_5) => front ? [queued, ...previous_5] : [...previous_5, queued]);
		if (!busyRef.current) drainQueueRef.current();
	}, [updateQueue]);
	const enqueue = (0, import_react.useCallback)((message_9) => enqueueAt(message_9, false), [enqueueAt]);
	const steer_0 = (0, import_react.useCallback)(async (message_10) => {
		const streamId_1 = streamIdRef.current;
		if (!busyRef.current || !streamId_1) {
			enqueueAt(message_10, true);
			return;
		}
		const draft = toUserMessage(message_10);
		const { hostContext } = await optionsRef.current.getTurn([draft]);
		const id_0 = crypto.randomUUID();
		steersInFlightRef.current.set(id_0, {
			streamId: streamId_1,
			message: message_10
		});
		const { outcome } = await options.bridge.steer({
			id: id_0,
			streamId: streamId_1,
			prompt: formatPrompt(optionsRef.current, draft),
			...hostContext ? { hostContext } : {},
			display: {
				text: message_10.text,
				...message_10.metadata !== void 0 ? { metadata: message_10.metadata } : {}
			}
		}).catch(() => ({ outcome: "not-running" }));
		const pending = steersInFlightRef.current.get(id_0);
		if (!pending) return;
		if (outcome === "restarted" && !pending.streamEnd) {
			pending.restarted = true;
			return;
		}
		steersInFlightRef.current.delete(id_0);
		if (outcome === "restarted") optionsRef.current.onUnsent?.([message_10]);
		else if (outcome === "not-running") {
			if (pending.streamEnd === "stop" || pending.streamEnd === "error") optionsRef.current.onUnsent?.([message_10]);
			else enqueueAt(message_10, true);
		}
	}, [enqueueAt, options.bridge]);
	const takeQueued = (0, import_react.useCallback)((id_1) => {
		const taken = queueRef.current.find((message_11) => message_11.id === id_1);
		if (taken) updateQueue((previous_6) => previous_6.filter((message_12) => message_12.id !== id_1));
		return taken;
	}, [updateQueue]);
	const promoteQueued = (0, import_react.useCallback)((id_2) => {
		const promoted = id_2 === void 0 ? queueRef.current[0] : queueRef.current.find((message_13) => message_13.id === id_2);
		if (!promoted) return;
		updateQueue((previous_7) => previous_7.filter((message_14) => message_14.id !== promoted.id));
		steer_0(toOutgoing(promoted));
	}, [steer_0, updateQueue]);
	const resumeQueue = (0, import_react.useCallback)(() => {
		updateQueue((previous_8) => previous_8.some((message_16) => message_16.held) ? previous_8.map(({ held: _held, ...message_15 }) => message_15) : previous_8);
		drainQueueRef.current();
	}, [updateQueue]);
	const messagesRef = (0, import_react.useRef)(messages);
	(0, import_react.useLayoutEffect)(() => {
		messagesRef.current = messages;
	});
	const wasBusyRef = (0, import_react.useRef)(false);
	const startedAtRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (busy && !wasBusyRef.current) {
			startedAtRef.current = Date.now();
			optionsRef.current.onStreamStart?.();
			optionsRef.current.onMessagesChange?.(messagesRef.current);
		}
		if (!busy && wasBusyRef.current) {
			const startedAt = startedAtRef.current;
			startedAtRef.current = null;
			optionsRef.current.onStreamEnd?.();
			const previous_9 = messagesRef.current;
			const last_0 = previous_9[previous_9.length - 1];
			const next_1 = startedAt === null || !last_0 || last_0.role !== "assistant" || last_0.metadata?.workDurationMs ? previous_9 : [...previous_9.slice(0, -1), {
				...last_0,
				metadata: {
					...last_0.metadata ?? {},
					workDurationMs: Date.now() - startedAt
				}
			}];
			if (next_1 !== previous_9) {
				const stamped = next_1[next_1.length - 1];
				setMessages((current) => current.map((message_17) => message_17.id === stamped.id ? stamped : message_17));
			}
			optionsRef.current.onMessagesChange?.(next_1);
		}
		wasBusyRef.current = busy;
	}, [busy, setMessages]);
	return {
		messages,
		sendMessage,
		steer: steer_0,
		queue,
		enqueue,
		takeQueued,
		promoteQueued,
		resumeQueue,
		status,
		busy,
		stop,
		error,
		clearError
	};
}

export { useAgentChat };
