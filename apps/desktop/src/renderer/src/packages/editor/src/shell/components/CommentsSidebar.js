// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentsSidebar.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ChatIcon, CheckIcon, DotsThreeIcon, FilterIcon, PencilIcon, SearchIcon, TrashIcon, XIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { IconBtn, InspectorControlShell } from "./panels/styles/primitives.js";
import { CommentAvatar } from "../../canvas/components/CommentAvatar.js";
import { formatCommentTime } from "../../shared/utils/commentTime.js";
import { SidebarSectionHeader } from "./SidebarSectionHeader.js";
import { CommentInput } from "./CommentInput.js";
import { CommentBody } from "./CommentBody.js";

function CommentsSidebar(t0) {
	const $ = (0, import_compiler_runtime.c)(79);
	const { comments, activeCommentId, activePageId, pageName, loading: t1, error: t2, onRetry, onSelect, onResolve, onUnresolve, currentUserId, onEdit, onDelete } = t0;
	const loading = t1 === void 0 ? false : t1;
	const error = t2 === void 0 ? false : t2;
	const [search, setSearch] = (0, import_react.useState)("");
	const [showResolved, setShowResolved] = (0, import_react.useState)(false);
	const [activePageOnly, setActivePageOnly] = (0, import_react.useState)(false);
	const [onlyYourThreads, setOnlyYourThreads] = (0, import_react.useState)(false);
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = [];
		$[0] = t3;
	} else t3 = $[0];
	const [lingering, setLingering] = (0, import_react.useState)(t3);
	let t4;
	if ($[1] !== activeCommentId || $[2] !== search || $[3] !== showResolved) {
		t4 = {
			activeCommentId,
			search,
			showResolved
		};
		$[1] = activeCommentId;
		$[2] = search;
		$[3] = showResolved;
		$[4] = t4;
	} else t4 = $[4];
	const [lingerKey, setLingerKey] = (0, import_react.useState)(t4);
	if (lingerKey.activeCommentId !== activeCommentId || lingerKey.search !== search || lingerKey.showResolved !== showResolved) {
		setLingerKey({
			activeCommentId,
			search,
			showResolved
		});
		if (lingering.length) setLingering([]);
	}
	let t5;
	if ($[5] !== onResolve) {
		t5 = onResolve ? (id) => {
			setLingering((previous) => previous.includes(id) ? previous : [...previous, id]);
			onResolve(id);
		} : void 0;
		$[5] = onResolve;
		$[6] = t5;
	} else t5 = $[6];
	const resolve = t5;
	let T0;
	let t10;
	let t11;
	let t12;
	let t13;
	let t14;
	let t15;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[7] !== activeCommentId || $[8] !== activePageId || $[9] !== activePageOnly || $[10] !== comments || $[11] !== currentUserId || $[12] !== error || $[13] !== lingering || $[14] !== loading || $[15] !== onDelete || $[16] !== onEdit || $[17] !== onRetry || $[18] !== onSelect || $[19] !== onUnresolve || $[20] !== onlyYourThreads || $[21] !== pageName || $[22] !== resolve || $[23] !== search || $[24] !== showResolved) {
		const query = search.trim().toLocaleLowerCase();
		const visibleComments = comments.filter((comment) => {
			if (onlyYourThreads && (!currentUserId || comment.authorId !== currentUserId)) return false;
			if (activePageOnly && comment.pageId && comment.pageId !== activePageId) return false;
			if (!showResolved && comment.resolved && comment.id !== activeCommentId && !lingering.includes(comment.id)) return false;
			return !query || `${comment.body} ${comment.author.name ?? ""}`.toLocaleLowerCase().includes(query);
		});
		const groups = /* @__PURE__ */ new Map();
		for (const comment_0 of visibleComments) {
			const key = comment_0.pageId ?? "";
			const group = groups.get(key) ?? {
				name: comment_0.pageName || pageName || "Current page",
				comments: []
			};
			group.comments.push(comment_0);
			groups.set(key, group);
		}
		t11 = true;
		t12 = "ed-comments-sidebar";
		t13 = "File comments";
		let t16;
		if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
			t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Filter comments",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterIcon, {})
				})
			});
			$[36] = t16;
		} else t16 = $[36];
		let t17;
		if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
			t17 = (checked) => setShowResolved(checked === true);
			$[37] = t17;
		} else t17 = $[37];
		let t18;
		if ($[38] !== showResolved) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
				checked: showResolved,
				onCheckedChange: t17,
				children: "Show resolved comments"
			});
			$[38] = showResolved;
			$[39] = t18;
		} else t18 = $[39];
		const t19 = !currentUserId;
		let t20;
		if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
			t20 = (checked_0) => setOnlyYourThreads(checked_0 === true);
			$[40] = t20;
		} else t20 = $[40];
		let t21;
		if ($[41] !== onlyYourThreads || $[42] !== t19) {
			t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
				checked: onlyYourThreads,
				disabled: t19,
				onCheckedChange: t20,
				children: "Only your threads"
			});
			$[41] = onlyYourThreads;
			$[42] = t19;
			$[43] = t21;
		} else t21 = $[43];
		let t22;
		if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
			t22 = (checked_1) => setActivePageOnly(checked_1 === true);
			$[44] = t22;
		} else t22 = $[44];
		let t23;
		if ($[45] !== activePageOnly) {
			t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
				checked: activePageOnly,
				onCheckedChange: t22,
				children: "Only current page"
			});
			$[45] = activePageOnly;
			$[46] = t23;
		} else t23 = $[46];
		if ($[47] !== t18 || $[48] !== t21 || $[49] !== t23) {
			t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
				title: "Comments",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
					modal: false,
					children: [t16, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						"data-comment-menu": true,
						align: "end",
						children: [
							t18,
							t21,
							t23
						]
					})]
				})
			});
			$[47] = t18;
			$[48] = t21;
			$[49] = t23;
			$[50] = t14;
		} else t14 = $[50];
		let t24;
		if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
			t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, { className: "size-3.5 shrink-0 ml-2 text-ed-muted-foreground" });
			$[51] = t24;
		} else t24 = $[51];
		let t25;
		let t26;
		if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
			t25 = (event) => setSearch(event.target.value);
			t26 = (event_0) => {
				if (event_0.key === "Escape") {
					event_0.stopPropagation();
					setSearch("");
				}
			};
			$[52] = t25;
			$[53] = t26;
		} else {
			t25 = $[52];
			t26 = $[53];
		}
		let t27;
		let t28;
		if ($[54] !== search) {
			t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"aria-label": "Search comments",
				placeholder: "Search comments…",
				value: search,
				onChange: t25,
				onKeyDown: t26
			});
			t28 = search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Clear search",
				onClick: () => setSearch(""),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {})
			});
			$[54] = search;
			$[55] = t27;
			$[56] = t28;
		} else {
			t27 = $[55];
			t28 = $[56];
		}
		if ($[57] !== t27 || $[58] !== t28) {
			t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ed-comments-sidebar-search",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, { children: [
					t24,
					t27,
					t28
				] })
			});
			$[57] = t27;
			$[58] = t28;
			$[59] = t15;
		} else t15 = $[59];
		T0 = ScrollArea;
		t6 = "ed-comments-sidebar-list";
		if ($[60] !== error || $[61] !== onRetry) {
			t7 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ed-comments-sidebar-empty",
				role: "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Couldn’t load comments." }), onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "xs",
					onClick: onRetry,
					children: "Try again"
				})]
			});
			$[60] = error;
			$[61] = onRetry;
			$[62] = t7;
		} else t7 = $[62];
		if ($[63] !== loading) {
			t8 = loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "ed-comments-sidebar-status",
				role: "status",
				children: "Loading comments…"
			});
			$[63] = loading;
			$[64] = t8;
		} else t8 = $[64];
		t9 = !loading && !error && visibleComments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comments-sidebar-empty",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatIcon, {
					width: 20,
					height: 20,
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: query ? "No matching comments" : onlyYourThreads ? "No threads started by you" : !showResolved ? "No open comments" : "No comments yet" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: query ? "Try a different name or phrase." : comments.length ? "Adjust the filters to see more threads." : "Click the canvas to leave a comment." })
			]
		});
		t10 = [...groups].map((t29) => {
			const [pageId, group_0] = t29;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ed-comments-sidebar-page-group",
				children: [!activePageOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ed-comments-sidebar-summary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: group_0.name,
						children: group_0.name
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: group_0.comments.map((comment_1) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentSidebarRow, {
					comment: comment_1,
					active: comment_1.id === activeCommentId,
					currentUserId,
					onSelect,
					onResolve: resolve,
					onUnresolve,
					onEdit,
					onDelete
				}, comment_1.id)) })]
			}, pageId);
		});
		$[7] = activeCommentId;
		$[8] = activePageId;
		$[9] = activePageOnly;
		$[10] = comments;
		$[11] = currentUserId;
		$[12] = error;
		$[13] = lingering;
		$[14] = loading;
		$[15] = onDelete;
		$[16] = onEdit;
		$[17] = onRetry;
		$[18] = onSelect;
		$[19] = onUnresolve;
		$[20] = onlyYourThreads;
		$[21] = pageName;
		$[22] = resolve;
		$[23] = search;
		$[24] = showResolved;
		$[25] = T0;
		$[26] = t10;
		$[27] = t11;
		$[28] = t12;
		$[29] = t13;
		$[30] = t14;
		$[31] = t15;
		$[32] = t6;
		$[33] = t7;
		$[34] = t8;
		$[35] = t9;
	} else {
		T0 = $[25];
		t10 = $[26];
		t11 = $[27];
		t12 = $[28];
		t13 = $[29];
		t14 = $[30];
		t15 = $[31];
		t6 = $[32];
		t7 = $[33];
		t8 = $[34];
		t9 = $[35];
	}
	let t16;
	if ($[65] !== T0 || $[66] !== t10 || $[67] !== t6 || $[68] !== t7 || $[69] !== t8 || $[70] !== t9) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			className: t6,
			children: [
				t7,
				t8,
				t9,
				t10
			]
		});
		$[65] = T0;
		$[66] = t10;
		$[67] = t6;
		$[68] = t7;
		$[69] = t8;
		$[70] = t9;
		$[71] = t16;
	} else t16 = $[71];
	let t17;
	if ($[72] !== t11 || $[73] !== t12 || $[74] !== t13 || $[75] !== t14 || $[76] !== t15 || $[77] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-comment-ui": t11,
			className: t12,
			"aria-label": t13,
			children: [
				t14,
				t15,
				t16
			]
		});
		$[72] = t11;
		$[73] = t12;
		$[74] = t13;
		$[75] = t14;
		$[76] = t15;
		$[77] = t16;
		$[78] = t17;
	} else t17 = $[78];
	return t17;
}
function CommentSidebarRow(t0) {
	const $ = (0, import_compiler_runtime.c)(59);
	const { comment, active, currentUserId, onSelect, onResolve, onUnresolve, onEdit, onDelete } = t0;
	const [editing, setEditing] = (0, import_react.useState)(false);
	const isAuthor = !!currentUserId && currentUserId === comment.authorId;
	const t1 = isAuthor && !!(onEdit || onDelete);
	let t2;
	if ($[0] !== comment || $[1] !== onSelect) {
		t2 = () => onSelect(comment);
		$[0] = comment;
		$[1] = onSelect;
		$[2] = t2;
	} else t2 = $[2];
	const t3 = active ? "true" : void 0;
	const t4 = comment.agentStatus === "working";
	let t5;
	if ($[3] !== comment.author || $[4] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentAvatar, {
			author: comment.author,
			working: t4
		});
		$[3] = comment.author;
		$[4] = t4;
		$[5] = t5;
	} else t5 = $[5];
	const t6 = comment.author.name || "Unknown";
	let t7;
	if ($[6] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-author",
			children: t6
		});
		$[6] = t6;
		$[7] = t7;
	} else t7 = $[7];
	let t8;
	if ($[8] !== comment.author.isGuest) {
		t8 = comment.author.isGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-guest-badge",
			children: "Guest"
		});
		$[8] = comment.author.isGuest;
		$[9] = t8;
	} else t8 = $[9];
	let t9;
	if ($[10] !== comment.agentStatus || $[11] !== comment.createdAt || $[12] !== comment.editedAt) {
		t9 = comment.agentStatus === "working" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-working-time",
			role: "status",
			children: "Agent working..."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("time", {
			dateTime: comment.createdAt,
			children: [formatCommentTime(comment.createdAt), comment.editedAt && " · Edited"]
		});
		$[10] = comment.agentStatus;
		$[11] = comment.createdAt;
		$[12] = comment.editedAt;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== t7 || $[15] !== t8 || $[16] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ed-comment-meta",
			children: [
				t7,
				t8,
				t9
			]
		});
		$[14] = t7;
		$[15] = t8;
		$[16] = t9;
		$[17] = t10;
	} else t10 = $[17];
	let t11;
	if ($[18] !== comment.body || $[19] !== comment.mentionSpans || $[20] !== editing) {
		t11 = !editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comments-sidebar-excerpt",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBody, {
				body: comment.body || "Image attachment",
				mentions: comment.mentionSpans
			})
		});
		$[18] = comment.body;
		$[19] = comment.mentionSpans;
		$[20] = editing;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== comment.replyCount) {
		t12 = (comment.replyCount ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comments-sidebar-footer",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ed-comments-sidebar-replies",
				children: [
					comment.replyCount,
					" ",
					comment.replyCount === 1 ? "reply" : "replies"
				]
			})
		});
		$[22] = comment.replyCount;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== t10 || $[25] !== t11 || $[26] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ed-comments-sidebar-content",
			children: [
				t10,
				t11,
				t12
			]
		});
		$[24] = t10;
		$[25] = t11;
		$[26] = t12;
		$[27] = t13;
	} else t13 = $[27];
	let t14;
	if ($[28] !== t13 || $[29] !== t2 || $[30] !== t3 || $[31] !== t5) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "ed-comments-sidebar-open",
			onClick: t2,
			"aria-current": t3,
			children: [t5, t13]
		});
		$[28] = t13;
		$[29] = t2;
		$[30] = t3;
		$[31] = t5;
		$[32] = t14;
	} else t14 = $[32];
	let t15;
	if ($[33] !== comment.body || $[34] !== comment.id || $[35] !== comment.mentionSpans || $[36] !== editing || $[37] !== onEdit) {
		t15 = editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-comments-sidebar-edit ed-comment-edit",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentInput, {
				initialValue: comment.body,
				initialMentions: comment.mentionSpans ?? [],
				placeholder: "Edit comment",
				autoFocus: true,
				allowAttachments: false,
				allowAgentMentions: false,
				onCancel: () => setEditing(false),
				onSubmit: async (body, _, mentions) => {
					await onEdit?.(comment.id, body, mentions);
					setEditing(false);
				}
			})
		});
		$[33] = comment.body;
		$[34] = comment.id;
		$[35] = comment.mentionSpans;
		$[36] = editing;
		$[37] = onEdit;
		$[38] = t15;
	} else t15 = $[38];
	let t16;
	if ($[39] !== comment.id || $[40] !== editing || $[41] !== isAuthor || $[42] !== onDelete || $[43] !== onEdit) {
		t16 = isAuthor && (onEdit || onDelete) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Comment actions",
					className: "ed-comments-sidebar-more",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DotsThreeIcon, { className: "size-3" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				"data-comment-menu": true,
				align: "end",
				onCloseAutoFocus: (event) => {
					if (editing) event.preventDefault();
				},
				children: [onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onSelect: () => setEditing(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilIcon, {}), "Edit"]
				}), onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onSelect: () => onDelete(comment.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrashIcon, {}), "Delete"]
				})]
			})]
		});
		$[39] = comment.id;
		$[40] = editing;
		$[41] = isAuthor;
		$[42] = onDelete;
		$[43] = onEdit;
		$[44] = t16;
	} else t16 = $[44];
	let t17;
	if ($[45] !== comment.id || $[46] !== comment.resolved || $[47] !== onResolve || $[48] !== onUnresolve) {
		t17 = onResolve && onUnresolve && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: comment.resolved ? "Reopen thread" : "Resolve thread",
			active: comment.resolved,
			className: "ed-comments-sidebar-resolve",
			onClick: () => comment.resolved ? onUnresolve?.(comment.id) : onResolve?.(comment.id),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, { className: "size-3" })
		});
		$[45] = comment.id;
		$[46] = comment.resolved;
		$[47] = onResolve;
		$[48] = onUnresolve;
		$[49] = t17;
	} else t17 = $[49];
	let t18;
	if ($[50] !== t16 || $[51] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comments-sidebar-actions",
			children: [t16, t17]
		});
		$[50] = t16;
		$[51] = t17;
		$[52] = t18;
	} else t18 = $[52];
	let t19;
	if ($[53] !== active || $[54] !== t1 || $[55] !== t14 || $[56] !== t15 || $[57] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "ed-comments-sidebar-row",
			"data-active": active,
			"data-own": t1,
			children: [
				t14,
				t15,
				t18
			]
		});
		$[53] = active;
		$[54] = t1;
		$[55] = t14;
		$[56] = t15;
		$[57] = t18;
		$[58] = t19;
	} else t19 = $[58];
	return t19;
}

export { CommentsSidebar };
