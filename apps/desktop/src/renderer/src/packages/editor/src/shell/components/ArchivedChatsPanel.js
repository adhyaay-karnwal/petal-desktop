// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ArchivedChatsPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ArrowCounterClockwiseIcon, CaretLeftIcon, TrashIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";
import { IconBtn } from "./panels/styles/primitives.js";
import { ChatListRow } from "./ChatListRow.js";
import { getChatDeletionQueue } from "../utils/chatDeletion.js";

function ArchivedChatsPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(38);
	const { backend, onRestore, onBack } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = { status: "loading" };
		$[0] = t1;
	} else t1 = $[0];
	const [state, setState] = (0, import_react.useState)(t1);
	const [reload, setReload] = (0, import_react.useState)(0);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const deletions = getChatDeletionQueue(backend);
	const hiddenIds = (0, import_react.useSyncExternalStore)(deletions.subscribe, deletions.getSnapshot, deletions.getSnapshot);
	const visibleChats = state.status === "ready" ? state.chats.filter((chat) => !hiddenIds.has(chat.id)) : [];
	let t2;
	if ($[1] !== backend) {
		t2 = () => {
			let cancelled = false;
			(backend?.listChats?.({
				includeArchived: true,
				summary: true
			}) ?? Promise.reject(/* @__PURE__ */ new Error("Chat archive is unavailable."))).then((chats) => {
				if (!cancelled) setState({
					status: "ready",
					chats: chats.filter(_temp$50).sort(_temp2$30)
				});
			}).catch((reason) => {
				if (!cancelled) setState({
					status: "error",
					message: reason instanceof Error ? reason.message : "Could not load archived chats."
				});
			});
			return () => {
				cancelled = true;
			};
		};
		$[1] = backend;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== backend || $[4] !== reload) {
		t3 = [backend, reload];
		$[3] = backend;
		$[4] = reload;
		$[5] = t3;
	} else t3 = $[5];
	(0, import_react.useEffect)(t2, t3);
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (id) => {
			setState((previous) => previous.status === "ready" ? {
				...previous,
				chats: previous.chats.filter((chat_1) => chat_1.id !== id)
			} : previous);
			setViewing((previous_0) => previous_0?.id === id ? null : previous_0);
		};
		$[6] = t4;
	} else t4 = $[6];
	const removeFromList = t4;
	let t5;
	if ($[7] !== onRestore) {
		t5 = async (chat_2) => {
			setPending(chat_2.id);
			setError(null);
			try {
				await onRestore(chat_2.id);
				removeFromList(chat_2.id);
				toast.success("Chat restored");
			} catch (t6) {
				const reason_0 = t6;
				setError(reason_0 instanceof Error ? reason_0.message : "Could not restore chat.");
			}
			setPending(null);
		};
		$[7] = onRestore;
		$[8] = t5;
	} else t5 = $[8];
	const restore = t5;
	let t6;
	if ($[9] !== backend) {
		t6 = async (chat_3) => {
			if (chat_3.messages) {
				setViewing(chat_3);
				return;
			}
			if (!backend?.getChat) {
				setError("Could not load this conversation.");
				return;
			}
			setPending(chat_3.id);
			setError(null);
			try {
				const detail = await backend.getChat(chat_3.id, { includeArchived: true });
				if (detail) setViewing({
					...chat_3,
					...detail
				});
				else setError("Could not load this conversation.");
			} catch (t7) {
				const reason_1 = t7;
				setError(reason_1 instanceof Error ? reason_1.message : "Could not load chat.");
			}
			setPending(null);
		};
		$[9] = backend;
		$[10] = t6;
	} else t6 = $[10];
	const view = t6;
	const permanentlyDelete = (chat_4) => {
		const deletion = deletions.begin(chat_4.id);
		if (!deletion) return;
		setError(null);
		const commit = () => {
			deletion.commit().catch(_temp3$23);
		};
		toast.success("Chat deleted", {
			description: chat_4.title || "Untitled chat",
			duration: 5e3,
			action: {
				label: "Undo",
				onClick: deletion.undo
			},
			onAutoClose: commit,
			onDismiss: commit
		});
	};
	const t7 = "Archived chats";
	const t8 = "flex h-full min-h-0 flex-col text-ed-chat";
	const t9 = viewing ? "Back to archive" : "Back to chats";
	const t10 = viewing ? "Back to archive" : "Back to chats";
	let t11;
	if ($[11] !== onBack || $[12] !== viewing) {
		t11 = () => viewing ? setViewing(null) : onBack();
		$[11] = onBack;
		$[12] = viewing;
		$[13] = t11;
	} else t11 = $[13];
	let t12;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretLeftIcon, {});
		$[14] = t12;
	} else t12 = $[14];
	let t13;
	if ($[15] !== t10 || $[16] !== t11 || $[17] !== t9) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t9,
			tooltip: t10,
			onClick: t11,
			children: t12
		});
		$[15] = t10;
		$[16] = t11;
		$[17] = t9;
		$[18] = t13;
	} else t13 = $[18];
	const t14 = viewing?.title || (viewing ? "Untitled chat" : "Archived chats");
	let t15;
	if ($[19] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate font-normal text-ed-foreground-secondary",
			children: t14
		});
		$[19] = t14;
		$[20] = t15;
	} else t15 = $[20];
	let t16;
	if ($[21] !== pending || $[22] !== restore || $[23] !== viewing) {
		t16 = viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Restore chat",
			disabled: pending !== null,
			onClick: () => void restore(viewing),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowCounterClockwiseIcon, {})
		});
		$[21] = pending;
		$[22] = restore;
		$[23] = viewing;
		$[24] = t16;
	} else t16 = $[24];
	let t17;
	if ($[25] !== t13 || $[26] !== t15 || $[27] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-10 shrink-0 items-center gap-1.5 px-3",
			children: [
				t13,
				t15,
				t16
			]
		});
		$[25] = t13;
		$[26] = t15;
		$[27] = t16;
		$[28] = t17;
	} else t17 = $[28];
	let t18;
	if ($[29] !== viewing) {
		t18 = viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "shrink-0 px-3 pb-3 text-ed-muted-foreground",
			children: "Restore this chat to continue the conversation."
		});
		$[29] = viewing;
		$[30] = t18;
	} else t18 = $[30];
	let t19;
	if ($[31] !== error) {
		t19 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "px-3 pb-3 text-ed-chat text-ed-destructive",
			children: error
		});
		$[31] = error;
		$[32] = t19;
	} else t19 = $[32];
	const t20 = viewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "min-h-0 flex-1",
		viewportClassName: "px-3 pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4 text-ed-chat",
			children: viewing.messages?.length ? viewing.messages.map(_temp5$20) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-ed-muted-foreground",
				children: "This chat has no messages."
			})
		})
	}) }) : state.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		className: "px-3 text-ed-chat text-ed-muted-foreground",
		children: "Loading archived chats…"
	}) : state.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 px-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "text-ed-chat",
			children: state.message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "secondary",
			onClick: () => {
				setState({ status: "loading" });
				setReload(_temp6$15);
			},
			children: "Try again"
		})]
	}) : visibleChats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-center text-ed-chat text-ed-muted-foreground",
		children: "No archived chats."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "min-h-0 flex-1",
		viewportClassName: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex w-full flex-col gap-1 py-2",
			children: visibleChats.map((chat_5) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatListRow, {
				title: chat_5.title || "Untitled chat",
				disabled: pending !== null,
				onSelect: () => void view(chat_5),
				actions: [{
					key: "restore",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowCounterClockwiseIcon, {}),
					label: `Restore ${chat_5.title || "chat"}`,
					tooltip: "Restore chat",
					disabled: pending !== null,
					onClick: () => void restore(chat_5)
				}, {
					key: "delete",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrashIcon, {}),
					label: `Delete ${chat_5.title || "chat"}`,
					tooltip: "Delete permanently",
					disabled: pending !== null || !backend?.deleteChat,
					onClick: () => permanentlyDelete(chat_5)
				}]
			}, chat_5.id))
		})
	});
	let t21;
	if ($[33] !== t17 || $[34] !== t18 || $[35] !== t19 || $[36] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-label": t7,
			className: t8,
			children: [
				t17,
				t18,
				t19,
				t20
			]
		});
		$[33] = t17;
		$[34] = t18;
		$[35] = t19;
		$[36] = t20;
		$[37] = t21;
	} else t21 = $[37];
	return t21;
}
/** Keep chats mounted while browsing the archive so drafts and running responses survive. */
function _temp6$15(value) {
	return value + 1;
}
function _temp5$20(message, index) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-ed-muted-foreground",
				children: message.role === "user" ? "You" : "Agent"
			}),
			message.inlineRefs?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-ed-muted-foreground",
				children: message.inlineRefs.map(_temp4$23).join(", ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "whitespace-pre-wrap break-words text-ed-foreground",
				children: message.content || (message.role === "assistant" ? "Completed actions" : "")
			})
		]
	}, message.id ?? index);
}
function _temp4$23(ref) {
	return ref.displayName ?? ref.name;
}
function _temp3$23() {
	return toast.error("Could not delete chat. It is still in Archived chats.");
}
function _temp2$30(a, b) {
	return (b.archivedAt ?? "").localeCompare(a.archivedAt ?? "");
}
function _temp$50(chat_0) {
	return chat_0.archivedAt;
}
function ChatArchiveView(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	let children;
	let onBack;
	let open;
	let props;
	if ($[0] !== t0) {
		({open, onBack, children, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = onBack;
		$[3] = open;
		$[4] = props;
	} else {
		children = $[1];
		onBack = $[2];
		open = $[3];
		props = $[4];
	}
	const t1 = open ? "hidden" : "h-full min-h-0";
	let t2;
	if ($[5] !== children || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t1,
			children
		});
		$[5] = children;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	let t3;
	if ($[8] !== onBack || $[9] !== open || $[10] !== props) {
		t3 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchivedChatsPanel, {
			...props,
			onBack
		});
		$[8] = onBack;
		$[9] = open;
		$[10] = props;
		$[11] = t3;
	} else t3 = $[11];
	let t4;
	if ($[12] !== t2 || $[13] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full min-h-0",
			children: [t2, t3]
		});
		$[12] = t2;
		$[13] = t3;
		$[14] = t4;
	} else t4 = $[14];
	return t4;
}

export { ChatArchiveView };
