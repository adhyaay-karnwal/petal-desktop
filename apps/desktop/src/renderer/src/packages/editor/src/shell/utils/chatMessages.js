// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatMessages.ts
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { createStore, useStore } from "../../../../../vendor/zustand.js";

var NO_MESSAGES = [];
function createChatMessagesStore() {
	return createStore(() => ({
		byChat: /* @__PURE__ */ new Map(),
		source: "load"
	}));
}
function getChatMessages(store, chatId) {
	return chatId && store.getState().byChat.get(chatId) || NO_MESSAGES;
}
function setChatMessages(store, entries, source = "edit") {
	const byChat = new Map(store.getState().byChat);
	for (const [chatId, messages] of entries) byChat.set(chatId, messages);
	store.setState({
		byChat,
		source
	});
}
function deleteChatMessages(store, chatId) {
	if (!store.getState().byChat.has(chatId)) return;
	const byChat = new Map(store.getState().byChat);
	byChat.delete(chatId);
	store.setState({
		byChat,
		source: "edit"
	});
}
function useChatMessages(store, chatId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== chatId) {
		t0 = (state) => chatId && state.byChat.get(chatId) || NO_MESSAGES;
		$[0] = chatId;
		$[1] = t0;
	} else t0 = $[1];
	return useStore(store, t0);
}
/** Observe edits for persistence without writing server-loaded transcripts back. */
function subscribeChatMessageEdits(store, onEdit) {
	return store.subscribe((state, previous) => {
		if (state.source === "load") return;
		const changed = [];
		for (const [id, messages] of state.byChat) if (previous.byChat.get(id) !== messages) changed.push(id);
		if (changed.length) onEdit(changed);
	});
}

export { createChatMessagesStore, deleteChatMessages, getChatMessages, setChatMessages, subscribeChatMessageEdits, useChatMessages };
