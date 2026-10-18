// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentThread.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ChatIcon, CheckIcon, DotsThreeIcon, PencilIcon, ThumbsUpIcon, TrashIcon, XIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { useCommentMentions } from "./CommentMentionContext.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { useAssetResolver } from "../../shared/contexts/AssetContext.js";
import { CommentAvatar } from "../../canvas/components/CommentAvatar.js";
import { formatCommentTime } from "../../shared/utils/commentTime.js";
import { useCommentPopoverPosition } from "../../shared/hooks/useCommentPopoverPosition.js";
import { useCommentOutsideClick } from "../../shared/hooks/useCommentOutsideClick.js";
import { CommentInput } from "./CommentInput.js";
import { CommentBody } from "./CommentBody.js";

function CommentItem(t0) {
	const $ = (0, import_compiler_runtime.c)(44);
	const { comment, currentUserId, onDelete, onEdit, onReaction } = t0;
	const resolveAsset = useAssetResolver();
	const [editing, setEditing] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== comment.reactions?.thumbsup) {
		t1 = comment.reactions?.thumbsup ?? [];
		$[0] = comment.reactions?.thumbsup;
		$[1] = t1;
	} else t1 = $[1];
	const likes = t1;
	let t2;
	if ($[2] !== currentUserId || $[3] !== likes) {
		t2 = !!currentUserId && likes.includes(currentUserId);
		$[2] = currentUserId;
		$[3] = likes;
		$[4] = t2;
	} else t2 = $[4];
	const liked = t2;
	let t3;
	if ($[5] !== comment.author) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentAvatar, { author: comment.author });
		$[5] = comment.author;
		$[6] = t3;
	} else t3 = $[6];
	const t4 = comment.author.name || "Unknown";
	let t5;
	if ($[7] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-author",
			children: t4
		});
		$[7] = t4;
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== comment.author.isGuest) {
		t6 = comment.author.isGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-guest-badge",
			children: "Guest"
		});
		$[9] = comment.author.isGuest;
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] !== comment.agentStatus || $[12] !== comment.createdAt || $[13] !== comment.editedAt) {
		t7 = comment.agentStatus === "working" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-working-time",
			role: "status",
			children: "Agent working..."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("time", {
			dateTime: comment.createdAt,
			title: new Date(comment.createdAt).toLocaleString() + (comment.editedAt ? ` · Edited ${new Date(comment.editedAt).toLocaleString()}` : ""),
			children: [formatCommentTime(comment.createdAt), comment.editedAt && " · Edited"]
		});
		$[11] = comment.agentStatus;
		$[12] = comment.createdAt;
		$[13] = comment.editedAt;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== comment.authorId || $[16] !== comment.id || $[17] !== currentUserId || $[18] !== editing || $[19] !== onDelete) {
		t8 = currentUserId === comment.authorId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-2xs",
					isChildText: false,
					className: "ed-comment-more",
					"aria-label": "Comment actions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DotsThreeIcon, {
						width: 14,
						height: 14
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				"data-comment-menu": true,
				align: "end",
				onCloseAutoFocus: (event) => {
					if (editing) event.preventDefault();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onSelect: () => setEditing(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilIcon, {}), "Edit"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onSelect: () => onDelete(comment.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrashIcon, {}), "Delete"]
				})]
			})]
		});
		$[15] = comment.authorId;
		$[16] = comment.id;
		$[17] = currentUserId;
		$[18] = editing;
		$[19] = onDelete;
		$[20] = t8;
	} else t8 = $[20];
	let t9;
	if ($[21] !== t5 || $[22] !== t6 || $[23] !== t7 || $[24] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-meta",
			children: [
				t5,
				t6,
				t7,
				t8
			]
		});
		$[21] = t5;
		$[22] = t6;
		$[23] = t7;
		$[24] = t8;
		$[25] = t9;
	} else t9 = $[25];
	let t10;
	if ($[26] !== comment.attachments || $[27] !== comment.body || $[28] !== comment.id || $[29] !== comment.mentionSpans || $[30] !== currentUserId || $[31] !== editing || $[32] !== liked || $[33] !== likes || $[34] !== onEdit || $[35] !== onReaction || $[36] !== resolveAsset) {
		t10 = editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentInput, {
			initialValue: comment.body,
			initialMentions: comment.mentionSpans ?? [],
			placeholder: "Edit comment",
			autoFocus: true,
			allowAttachments: false,
			allowAgentMentions: false,
			onCancel: () => setEditing(false),
			onSubmit: async (body, _, mentions) => {
				await onEdit(comment.id, body, mentions);
				setEditing(false);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-message-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "ed-comment-body",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBody, {
					body: comment.body,
					mentions: comment.mentionSpans
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: liked ? "toolbarSelected" : "ghost",
				size: "icon-2xs",
				isChildText: false,
				className: "ed-comment-like",
				title: liked ? "Remove like" : "Like",
				"aria-pressed": liked,
				disabled: !currentUserId,
				onClick: () => onReaction(comment.id, "thumbsup"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUpIcon, {
					width: 14,
					height: 14
				}), likes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: likes.length })]
			})]
		}), !!comment.attachments?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-comment-attachments",
			children: comment.attachments.map((url, index) => {
				const resolved = resolveAsset ? resolveAsset(url) : url;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: resolved,
					target: "_blank",
					rel: "noopener noreferrer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: resolved,
						alt: `Attachment ${index + 1}`
					})
				}, url);
			})
		})] });
		$[26] = comment.attachments;
		$[27] = comment.body;
		$[28] = comment.id;
		$[29] = comment.mentionSpans;
		$[30] = currentUserId;
		$[31] = editing;
		$[32] = liked;
		$[33] = likes;
		$[34] = onEdit;
		$[35] = onReaction;
		$[36] = resolveAsset;
		$[37] = t10;
	} else t10 = $[37];
	let t11;
	if ($[38] !== t10 || $[39] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-item-content",
			children: [t9, t10]
		});
		$[38] = t10;
		$[39] = t9;
		$[40] = t11;
	} else t11 = $[40];
	let t12;
	if ($[41] !== t11 || $[42] !== t3) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "ed-comment-item",
			children: [t3, t11]
		});
		$[41] = t11;
		$[42] = t3;
		$[43] = t12;
	} else t12 = $[43];
	return t12;
}
function CommentThread(t0) {
	const $ = (0, import_compiler_runtime.c)(52);
	const { comment, replies, currentUserId, currentUser, onReply, onResolve, onUnresolve, onDelete, onEdit, onReaction, onClose, identityPrompt, allowAttachments, onCreateGuestIdentity } = t0;
	const { ref, style } = useCommentPopoverPosition(comment.canvasX ?? 0, comment.canvasY ?? 0, 320);
	useCommentOutsideClick(ref, onClose);
	const { openAgentChat } = useCommentMentions();
	const agentChatId = comment.agentChatId;
	let t1;
	let t2;
	if ($[0] !== onClose) {
		t1 = () => {
			const handleKeyDown = (event) => {
				if (!event.defaultPrevented && matchesShortcut(event, LOCAL_SHORTCUTS.comments.closeThread)) onClose();
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		};
		t2 = [onClose];
		$[0] = onClose;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[3] !== currentUserId || $[4] !== onDelete || $[5] !== onEdit || $[6] !== onReaction) {
		t3 = {
			currentUserId,
			onDelete,
			onEdit,
			onReaction
		};
		$[3] = currentUserId;
		$[4] = onDelete;
		$[5] = onEdit;
		$[6] = onReaction;
		$[7] = t3;
	} else t3 = $[7];
	const itemProps = t3;
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Comment" });
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== agentChatId || $[10] !== openAgentChat) {
		t5 = agentChatId && openAgentChat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-xs",
			isChildText: false,
			title: "Open agent chat",
			"aria-label": "Open agent chat",
			onClick: () => openAgentChat(agentChatId),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatIcon, {
				width: 14,
				height: 14
			})
		});
		$[9] = agentChatId;
		$[10] = openAgentChat;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== comment.resolved || $[13] !== onResolve || $[14] !== onUnresolve) {
		t6 = onResolve && onUnresolve && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: comment.resolved ? "toolbarSelected" : "ghost",
			size: "icon-xs",
			isChildText: false,
			title: comment.resolved ? "Reopen thread" : "Resolve thread",
			"aria-pressed": comment.resolved,
			onClick: comment.resolved ? onUnresolve : onResolve,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
				width: 14,
				height: 14
			})
		});
		$[12] = comment.resolved;
		$[13] = onResolve;
		$[14] = onUnresolve;
		$[15] = t6;
	} else t6 = $[15];
	let t7;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
			width: 14,
			height: 14
		});
		$[16] = t7;
	} else t7 = $[16];
	let t8;
	if ($[17] !== onClose) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "ed-comment-icon-button",
			"aria-label": "Close thread",
			onClick: onClose,
			children: t7
		});
		$[17] = onClose;
		$[18] = t8;
	} else t8 = $[18];
	let t9;
	if ($[19] !== t5 || $[20] !== t6 || $[21] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-thread-header",
			children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ed-comment-header-actions",
				children: [
					t5,
					t6,
					t8
				]
			})]
		});
		$[19] = t5;
		$[20] = t6;
		$[21] = t8;
		$[22] = t9;
	} else t9 = $[22];
	let t10;
	if ($[23] !== comment || $[24] !== itemProps) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentItem, {
			comment,
			...itemProps
		}, comment.id);
		$[23] = comment;
		$[24] = itemProps;
		$[25] = t10;
	} else t10 = $[25];
	let t11;
	if ($[26] !== itemProps || $[27] !== replies) {
		let t12;
		if ($[29] !== itemProps) {
			t12 = (reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentItem, {
				comment: reply,
				...itemProps
			}, reply.id);
			$[29] = itemProps;
			$[30] = t12;
		} else t12 = $[30];
		t11 = replies.map(t12);
		$[26] = itemProps;
		$[27] = replies;
		$[28] = t11;
	} else t11 = $[28];
	let t12;
	if ($[31] !== t10 || $[32] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-thread-messages",
			children: [t10, t11]
		});
		$[31] = t10;
		$[32] = t11;
		$[33] = t12;
	} else t12 = $[33];
	let t13;
	if ($[34] !== comment.agentStatus) {
		t13 = comment.agentStatus && comment.agentStatus !== "completed" && comment.agentStatus !== "working" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "ed-comment-agent-status",
			children: comment.agentStatus === "cancelled" ? "Agent stopped" : "Agent interrupted. Mention @Agent again to continue."
		});
		$[34] = comment.agentStatus;
		$[35] = t13;
	} else t13 = $[35];
	let t14;
	if ($[36] !== allowAttachments || $[37] !== comment.id || $[38] !== currentUser || $[39] !== identityPrompt || $[40] !== onCreateGuestIdentity || $[41] !== onReply) {
		t14 = identityPrompt ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-thread-reply",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentAvatar, { author: currentUser ?? {
				name: null,
				image: null
			} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentInput, {
				onSubmit: onReply,
				placeholder: "Reply…",
				allowAttachments,
				onCreateGuestIdentity
			}, comment.id)]
		});
		$[36] = allowAttachments;
		$[37] = comment.id;
		$[38] = currentUser;
		$[39] = identityPrompt;
		$[40] = onCreateGuestIdentity;
		$[41] = onReply;
		$[42] = t14;
	} else t14 = $[42];
	let t15;
	if ($[43] !== t12 || $[44] !== t13 || $[45] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
			className: "ed-comment-thread-body",
			children: [
				t12,
				t13,
				t14
			]
		});
		$[43] = t12;
		$[44] = t13;
		$[45] = t14;
		$[46] = t15;
	} else t15 = $[46];
	let t16;
	if ($[47] !== ref || $[48] !== style || $[49] !== t15 || $[50] !== t9) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref,
			"data-comment-ui": true,
			className: "ed-comment-thread ed-comment-surface",
			style,
			role: "region",
			"aria-label": "Comment thread",
			children: [t9, t15]
		});
		$[47] = ref;
		$[48] = style;
		$[49] = t15;
		$[50] = t9;
		$[51] = t16;
	} else t16 = $[51];
	return t16;
}

export { CommentThread };
