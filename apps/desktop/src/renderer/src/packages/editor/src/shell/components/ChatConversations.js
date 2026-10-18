// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ChatConversations.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/** False inside a retained conversation that is not the one on screen. */
var ChatShownContext = (0, import_react.createContext)(true);
/**
* Shown in place of a chat whose history hasn't arrived. A chat panel reads its
* messages once when it mounts, so it must not mount until they're in.
*/
function ChatHistoryLoading() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "status",
			className: "flex h-full flex-1 items-center justify-center text-ed-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Loading chat…"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: "size-4 rounded-full border-[1.5px] border-current border-t-transparent motion-safe:animate-spin"
			})]
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
/** Mount chats on first open, then retain their drafts and active responses. */
function ChatConversations(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { chats, activeChatId, renderChat, loadingChatIds } = t0;
	let t1;
	if ($[0] !== activeChatId) {
		t1 = () => new Set(activeChatId ? [activeChatId] : []);
		$[0] = activeChatId;
		$[1] = t1;
	} else t1 = $[1];
	const [openedIds, setOpenedIds] = (0, import_react.useState)(t1);
	if (activeChatId && !openedIds.has(activeChatId)) setOpenedIds(new Set(openedIds).add(activeChatId));
	let t2;
	if ($[2] !== activeChatId || $[3] !== chats || $[4] !== loadingChatIds || $[5] !== openedIds || $[6] !== renderChat) {
		let t3;
		if ($[8] !== activeChatId || $[9] !== openedIds) {
			t3 = (chat) => chat.id === activeChatId || openedIds.has(chat.id);
			$[8] = activeChatId;
			$[9] = openedIds;
			$[10] = t3;
		} else t3 = $[10];
		let t4;
		if ($[11] !== activeChatId || $[12] !== loadingChatIds || $[13] !== renderChat) {
			t4 = (chat_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-chat-id": chat_0.id,
				hidden: chat_0.id !== activeChatId,
				className: chat_0.id === activeChatId ? "h-full min-h-0" : "hidden h-full min-h-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatShownContext.Provider, {
					value: chat_0.id === activeChatId,
					children: loadingChatIds?.has(chat_0.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatHistoryLoading, {}) : renderChat(chat_0, chat_0.id === activeChatId)
				})
			}, chat_0.id);
			$[11] = activeChatId;
			$[12] = loadingChatIds;
			$[13] = renderChat;
			$[14] = t4;
		} else t4 = $[14];
		t2 = chats.filter(t3).map(t4);
		$[2] = activeChatId;
		$[3] = chats;
		$[4] = loadingChatIds;
		$[5] = openedIds;
		$[6] = renderChat;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}

export { ChatConversations, ChatHistoryLoading, ChatShownContext };
