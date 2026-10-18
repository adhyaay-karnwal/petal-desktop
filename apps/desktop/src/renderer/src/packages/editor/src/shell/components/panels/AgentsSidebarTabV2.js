// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/AgentsSidebarTabV2.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { ArchiveIcon, CaretLeftIcon, CrosshairIcon, OverflowSettingsIcon, PlusIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../../ui/src/components/DropdownMenu.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { IconBtn } from "./styles/primitives.js";
import { EditableChatTitle } from "../EditableChatTitle.js";
import { ChatActivityIndicator, ChatListRow } from "../ChatListRow.js";
import { ChatConversations } from "../ChatConversations.js";

var GROUP_LABELS = {
	yesterday: "Yesterday",
	week: "Previous 7 days",
	older: "Older"
};
var GROUP_ORDER = [
	"today",
	"yesterday",
	"week",
	"older"
];
var EMPTY_CHAT_IDS = /* @__PURE__ */ new Set();
function groupForDate(value) {
	const date = new Date(value);
	const now = /* @__PURE__ */ new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const chatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	const days = Math.floor((today - chatDay) / 864e5);
	if (days <= 0) return "today";
	if (days === 1) return "yesterday";
	if (days <= 7) return "week";
	return "older";
}
function ChatHeaderActions(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { historyOpen, chats, runningChatIds: t1, loading, onNewChat, onOpenSettings, onArchiveAllChats, onOpenArchivedChats } = t0;
	const runningChatIds = t1 === void 0 ? EMPTY_CHAT_IDS : t1;
	let t2;
	if ($[0] !== chats || $[1] !== historyOpen || $[2] !== onArchiveAllChats || $[3] !== onOpenArchivedChats || $[4] !== onOpenSettings || $[5] !== runningChatIds) {
		t2 = historyOpen && (onOpenSettings || onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Agent settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				sideOffset: 4,
				children: [
					onArchiveAllChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						disabled: chats.length === 0 || runningChatIds.size > 0,
						onSelect: onArchiveAllChats,
						children: "Archive all chats"
					}),
					onOpenArchivedChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: onOpenArchivedChats,
						children: "Archived chats"
					}),
					onOpenSettings && (onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					onOpenSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: onOpenSettings,
						children: "Settings"
					})
				]
			})]
		});
		$[0] = chats;
		$[1] = historyOpen;
		$[2] = onArchiveAllChats;
		$[3] = onOpenArchivedChats;
		$[4] = onOpenSettings;
		$[5] = runningChatIds;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== loading || $[9] !== onNewChat) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "New chat",
			disabled: loading,
			onClick: onNewChat,
			children: t3
		});
		$[8] = loading;
		$[9] = onNewChat;
		$[10] = t4;
	} else t4 = $[10];
	let t5;
	if ($[11] !== t2 || $[12] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1.5",
			children: [t2, t4]
		});
		$[11] = t2;
		$[12] = t4;
		$[13] = t5;
	} else t5 = $[13];
	return t5;
}
/** Switch between the current conversation and a full-height chat history. */
function AgentsSidebarTabV2(t0) {
	const $ = (0, import_compiler_runtime.c)(82);
	const { chats, activeChatId, historyOpen, onHistoryOpenChange, runningChatIds: t1, unreadChatIds: t2, loading: t3, onNewChat, onOpenSettings, onSwitchChat, onArchiveChat, onRenameChat, onDropAttachments, onArchiveAllChats, onOpenArchivedChats, followAi: t4, onFollowAiChange, onFocusLastResult, renderChat } = t0;
	const runningChatIds = t1 === void 0 ? EMPTY_CHAT_IDS : t1;
	const unreadChatIds = t2 === void 0 ? EMPTY_CHAT_IDS : t2;
	const loading = t3 === void 0 ? false : t3;
	const followAi = t4 === void 0 ? false : t4;
	let t5;
	if ($[0] !== chats) {
		const groups = /* @__PURE__ */ new Map();
		for (const chat of chats) {
			const group = groupForDate(chat.createdAt);
			const items = groups.get(group) ?? [];
			items.push(chat);
			groups.set(group, items);
		}
		t5 = GROUP_ORDER.flatMap((group_0) => {
			const items_0 = groups.get(group_0);
			return items_0?.length ? [{
				group: group_0,
				items: items_0
			}] : [];
		});
		$[0] = chats;
		$[1] = t5;
	} else t5 = $[1];
	const visibleGroups = t5;
	let t6;
	if ($[2] !== activeChatId || $[3] !== chats) {
		t6 = chats.find((chat_0) => chat_0.id === activeChatId) ?? chats[0];
		$[2] = activeChatId;
		$[3] = chats;
		$[4] = t6;
	} else t6 = $[4];
	const activeChat = t6;
	let t7;
	if ($[5] !== onHistoryOpenChange || $[6] !== onSwitchChat) {
		t7 = (id) => {
			onSwitchChat(id);
			onHistoryOpenChange(false);
		};
		$[5] = onHistoryOpenChange;
		$[6] = onSwitchChat;
		$[7] = t7;
	} else t7 = $[7];
	const openChat = t7;
	let t8;
	if ($[8] !== onHistoryOpenChange || $[9] !== onNewChat) {
		t8 = () => {
			onNewChat();
			onHistoryOpenChange(false);
		};
		$[8] = onHistoryOpenChange;
		$[9] = onNewChat;
		$[10] = t8;
	} else t8 = $[10];
	const newChat = t8;
	let t9;
	if ($[11] !== followAi || $[12] !== onArchiveChat || $[13] !== onFocusLastResult || $[14] !== onFollowAiChange || $[15] !== onSwitchChat) {
		t9 = (chat_1, active, running) => {
			const following = active && running && followAi;
			const actions = [];
			if (onFollowAiChange) actions.push({
				key: "follow",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, {}),
				label: running ? following ? "Stop following agent" : "Follow agent" : "Show last result",
				active: following,
				onClick: () => {
					if (!active) onSwitchChat(chat_1.id);
					if (running) onFollowAiChange(!active || !followAi);
					else onFocusLastResult?.(chat_1.id);
				}
			});
			actions.push({
				key: "archive",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveIcon, {}),
				label: `Archive ${chat_1.title || "chat"}`,
				tooltip: "Archive chat",
				disabled: running,
				onClick: () => onArchiveChat(chat_1.id)
			});
			return actions;
		};
		$[11] = followAi;
		$[12] = onArchiveChat;
		$[13] = onFocusLastResult;
		$[14] = onFollowAiChange;
		$[15] = onSwitchChat;
		$[16] = t9;
	} else t9 = $[16];
	const rowActions = t9;
	let t10;
	let t11;
	if ($[17] !== historyOpen || $[18] !== onDropAttachments) {
		t10 = (event) => {
			if (historyOpen || !onDropAttachments || !event.dataTransfer.types.includes("Files")) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = "copy";
		};
		t11 = (event_0) => {
			if (historyOpen || !onDropAttachments || !event_0.dataTransfer.types.includes("Files")) return;
			event_0.preventDefault();
			event_0.stopPropagation();
			onDropAttachments(event_0.dataTransfer);
		};
		$[17] = historyOpen;
		$[18] = onDropAttachments;
		$[19] = t10;
		$[20] = t11;
	} else {
		t10 = $[19];
		t11 = $[20];
	}
	let t12;
	if ($[21] !== historyOpen || $[22] !== onHistoryOpenChange) {
		t12 = !historyOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "All chats",
			onClick: () => onHistoryOpenChange(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretLeftIcon, {})
		});
		$[21] = historyOpen;
		$[22] = onHistoryOpenChange;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== activeChat || $[25] !== historyOpen || $[26] !== onRenameChat) {
		t13 = historyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate pl-1.5 text-ed-chat font-normal text-ed-foreground-secondary",
			children: "All chats"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableChatTitle, {
			title: activeChat?.title || "New chat",
			animate: !!activeChat?.generatedTitle && activeChat.title === activeChat.generatedTitle,
			className: "text-ed-foreground-secondary",
			onRename: activeChat && onRenameChat ? (title) => onRenameChat(activeChat.id, title) : void 0
		}, activeChat?.id);
		$[24] = activeChat;
		$[25] = historyOpen;
		$[26] = onRenameChat;
		$[27] = t13;
	} else t13 = $[27];
	let t14;
	if ($[28] !== activeChat || $[29] !== historyOpen || $[30] !== runningChatIds) {
		t14 = !historyOpen && activeChat && runningChatIds.has(activeChat.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-6.5 shrink-0 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatActivityIndicator, {})
		});
		$[28] = activeChat;
		$[29] = historyOpen;
		$[30] = runningChatIds;
		$[31] = t14;
	} else t14 = $[31];
	let t15;
	if ($[32] !== activeChat || $[33] !== followAi || $[34] !== historyOpen || $[35] !== onFocusLastResult || $[36] !== onFollowAiChange || $[37] !== runningChatIds) {
		t15 = !historyOpen && activeChat && onFollowAiChange && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: runningChatIds.has(activeChat.id) ? followAi ? "Stop following agent" : "Follow agent" : "Show last result",
			active: runningChatIds.has(activeChat.id) && followAi,
			onClick: () => runningChatIds.has(activeChat.id) ? onFollowAiChange(!followAi) : onFocusLastResult?.(activeChat.id),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, {})
		});
		$[32] = activeChat;
		$[33] = followAi;
		$[34] = historyOpen;
		$[35] = onFocusLastResult;
		$[36] = onFollowAiChange;
		$[37] = runningChatIds;
		$[38] = t15;
	} else t15 = $[38];
	let t16;
	if ($[39] !== chats || $[40] !== historyOpen || $[41] !== loading || $[42] !== newChat || $[43] !== onArchiveAllChats || $[44] !== onOpenArchivedChats || $[45] !== onOpenSettings || $[46] !== runningChatIds) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatHeaderActions, {
			historyOpen,
			chats,
			runningChatIds,
			loading,
			onNewChat: newChat,
			onOpenSettings,
			onArchiveAllChats,
			onOpenArchivedChats
		});
		$[39] = chats;
		$[40] = historyOpen;
		$[41] = loading;
		$[42] = newChat;
		$[43] = onArchiveAllChats;
		$[44] = onOpenArchivedChats;
		$[45] = onOpenSettings;
		$[46] = runningChatIds;
		$[47] = t16;
	} else t16 = $[47];
	let t17;
	if ($[48] !== t12 || $[49] !== t13 || $[50] !== t14 || $[51] !== t15 || $[52] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-10 shrink-0 items-center gap-1.5 border-b border-ed-border px-3",
			children: [
				t12,
				t13,
				t14,
				t15,
				t16
			]
		});
		$[48] = t12;
		$[49] = t13;
		$[50] = t14;
		$[51] = t15;
		$[52] = t16;
		$[53] = t17;
	} else t17 = $[53];
	let t18;
	if ($[54] !== activeChat?.id || $[55] !== chats.length || $[56] !== historyOpen || $[57] !== loading || $[58] !== onRenameChat || $[59] !== openChat || $[60] !== rowActions || $[61] !== runningChatIds || $[62] !== unreadChatIds || $[63] !== visibleGroups) {
		t18 = historyOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex w-full flex-col gap-4 py-2",
				children: loading && chats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "secondary",
					className: "px-3 py-2 text-ed-chat",
					children: "Loading chats…"
				}) : visibleGroups.map((t19) => {
					const { group: group_1, items: items_1 } = t19;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full flex-col gap-1",
						children: [GROUP_LABELS[group_1] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4.5 text-ed-chat font-normal leading-6 text-ed-muted-foreground/75",
							children: GROUP_LABELS[group_1]
						}), items_1.map((chat_2) => {
							const active_0 = chat_2.id === activeChat?.id;
							const running_0 = runningChatIds.has(chat_2.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatListRow, {
								title: chat_2.title || "New chat",
								animateTitle: !!chat_2.generatedTitle && chat_2.title === chat_2.generatedTitle,
								active: active_0,
								status: running_0 ? "running" : unreadChatIds.has(chat_2.id) ? "unread" : void 0,
								actions: rowActions(chat_2, active_0, running_0),
								onSelect: () => openChat(chat_2.id),
								onRename: onRenameChat ? (title_0) => onRenameChat(chat_2.id, title_0) : void 0
							}, chat_2.id);
						})]
					}, group_1);
				})
			})
		});
		$[54] = activeChat?.id;
		$[55] = chats.length;
		$[56] = historyOpen;
		$[57] = loading;
		$[58] = onRenameChat;
		$[59] = openChat;
		$[60] = rowActions;
		$[61] = runningChatIds;
		$[62] = unreadChatIds;
		$[63] = visibleGroups;
		$[64] = t18;
	} else t18 = $[64];
	const t19 = historyOpen ? "hidden" : "min-h-0 flex-1";
	let t20;
	if ($[65] !== chats.length || $[66] !== loading) {
		t20 = loading && chats.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			variant: "secondary",
			className: "px-3 py-2 text-ed-chat",
			children: "Loading chats…"
		});
		$[65] = chats.length;
		$[66] = loading;
		$[67] = t20;
	} else t20 = $[67];
	const t21 = activeChat?.id;
	let t22;
	if ($[68] !== chats || $[69] !== renderChat || $[70] !== t21) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatConversations, {
			chats,
			activeChatId: t21,
			renderChat
		});
		$[68] = chats;
		$[69] = renderChat;
		$[70] = t21;
		$[71] = t22;
	} else t22 = $[71];
	let t23;
	if ($[72] !== t19 || $[73] !== t20 || $[74] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t19,
			children: [t20, t22]
		});
		$[72] = t19;
		$[73] = t20;
		$[74] = t22;
		$[75] = t23;
	} else t23 = $[75];
	let t24;
	if ($[76] !== t10 || $[77] !== t11 || $[78] !== t17 || $[79] !== t18 || $[80] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full min-h-0 flex-col",
			onDragOver: t10,
			onDrop: t11,
			children: [
				t17,
				t18,
				t23
			]
		});
		$[76] = t10;
		$[77] = t11;
		$[78] = t17;
		$[79] = t18;
		$[80] = t23;
		$[81] = t24;
	} else t24 = $[81];
	return t24;
}

export { AgentsSidebarTabV2 };
