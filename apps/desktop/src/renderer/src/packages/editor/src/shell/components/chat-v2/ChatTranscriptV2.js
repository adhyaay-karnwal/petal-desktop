// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/ChatTranscriptV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { CaretRightIcon, CopyIcon, CursorIcon, FileCodeIcon, FileIcon, FolderOpenIcon, PencilIcon, PlusIcon, SearchIcon, SpinnerIcon, TerminalIcon, TrashIcon, WarningIcon$1 } from "../../../../../ui/src/icons.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { getById } from "../../../../../compiler/src/store/read.js";
import { commentChatDisplayText } from "../../utils/commentChatDisplay.js";
import { splitInlineChatReferences } from "../../utils/inlineChatComposer.js";
import { ChatMarkdown } from "../ChatMarkdown.js";
import { ContextChip } from "../ChatContextControls.js";
import { CanvasContextChip } from "../CanvasContextChip.js";
import { ImageContextChip } from "../ImageContextChip.js";
import { ChatReferenceChip } from "../ChatReferenceChip.js";
import { buildActivity, formatWorkDuration$1, getCompletedActivitySummary$1, getCompletedToolParts$1, getThoughtSegments$1, getToolActivityLabel$1, getToolResultBadge, getToolResultImages, groupCompletedTools$1, isCompletedTool$1, isFileWriteActivity$1, messageText, splitAtSteers } from "./activity.js";

/**
* Transcript for `ChatPanelV2`: user bubbles, the work accordion, markdown,
* screenshots, tool-result badges and error text, all driven by `UIMessage`.
*
* The visual grammar mirrors the v1 chat panel; the data comes from
* `activity.ts` instead of the legacy stream events.
*/
var WRAP_ANYWHERE_CLASS = "[overflow-wrap:anywhere] [word-break:break-word]";
function messageMetadata(message) {
	return message.metadata ?? {};
}
/** Collapse repeated file/search results into one badge per target. */
function getDisplayToolResults(activity) {
	const results = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of activity) {
		if (!isCompletedTool$1(item)) continue;
		const badge = getToolResultBadge(item);
		if (badge.kind === "other" && badge.action.endsWith("...")) continue;
		if (badge.kind === "other" && item.name === "take_screenshot") {
			const key = `shot:${item.name}`;
			if (seen.has(key)) continue;
			seen.add(key);
			results.push(item);
			continue;
		}
		if (badge.kind === "other") continue;
		const input = item.input ?? {};
		const target = input.file_path || input.path || input.pattern || "";
		const key = `${badge.kind}:${badge.action}:${String(target)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		results.push(item);
	}
	return results;
}
function UserMessage(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { message, store, variant, onSelectElement } = t0;
	let t1;
	let t2;
	let t3;
	if ($[0] !== message || $[1] !== onSelectElement || $[2] !== store || $[3] !== variant) {
		const metadata = messageMetadata(message);
		const refs = metadata.inlineRefs ?? [];
		const content = commentChatDisplayText(messageText(message));
		const { parts, remaining } = splitInlineChatReferences(content, refs, metadata.referenceMentions);
		const t4 = variant === "sidebar-v2" ? "max-w-[85%] shrink-0" : "max-w-full";
		if ($[7] !== t4) {
			t1 = cn$2("flex min-w-0 flex-col items-end gap-1.5", t4);
			$[7] = t4;
			$[8] = t1;
		} else t1 = $[8];
		t2 = remaining.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex max-w-full flex-wrap justify-end gap-1",
			children: remaining.map((ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatReferenceChip, {
				reference: ref,
				store,
				onSelectElement
			}, ref.id))
		});
		t3 = content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn$2("min-w-0 max-w-full overflow-hidden rounded-md bg-ed-chat-surface", variant === "sidebar-v2" ? "px-3 py-2" : "border border-ed-border px-2.5 py-2"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn$2(`min-w-0 max-w-full whitespace-pre-wrap text-ed-chat ${WRAP_ANYWHERE_CLASS}`, variant === "sidebar-v2" ? "leading-[1.5] text-ed-foreground/80" : "leading-[1.55] text-ed-foreground"),
				children: parts.map((part) => typeof part === "string" ? part : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatReferenceChip, {
					reference: part.reference,
					store,
					onSelectElement,
					className: "ed-inline-chat-reference"
				}, part.offset))
			})
		});
		$[0] = message;
		$[1] = onSelectElement;
		$[2] = store;
		$[3] = variant;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else {
		t1 = $[4];
		t2 = $[5];
		t3 = $[6];
	}
	let t4;
	if ($[9] !== t1 || $[10] !== t2 || $[11] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t1,
			children: [t2, t3]
		});
		$[9] = t1;
		$[10] = t2;
		$[11] = t3;
		$[12] = t4;
	} else t4 = $[12];
	return t4;
}
function ToolActivityRow(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { item } = t0;
	let t1;
	let target;
	let verb;
	if ($[0] !== item) {
		const name = item.name.includes("__") ? item.name.split("__").pop().toLowerCase() : item.name.toLowerCase();
		({verb, target} = getCompletedToolParts$1(item));
		t1 = /(write|edit|update|insert|replace|delete)/.test(name) ? PencilIcon : /(glob|grep|search|find|query)/.test(name) ? SearchIcon : /(bash|shell|terminal|command|exec)/.test(name) ? TerminalIcon : FileCodeIcon;
		$[0] = item;
		$[1] = t1;
		$[2] = target;
		$[3] = verb;
	} else {
		t1 = $[1];
		target = $[2];
		verb = $[3];
	}
	const Icon = t1;
	let t2;
	if ($[4] !== Icon) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			width: 13,
			height: 13,
			className: "shrink-0"
		});
		$[4] = Icon;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== verb) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0",
			children: verb
		});
		$[6] = verb;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== target) {
		t4 = target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate underline decoration-dotted underline-offset-2",
			children: target
		});
		$[8] = target;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== t2 || $[11] !== t3 || $[12] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2 text-ed-chat leading-5 text-ed-muted-foreground",
			children: [
				t2,
				t3,
				t4
			]
		});
		$[10] = t2;
		$[11] = t3;
		$[12] = t4;
		$[13] = t5;
	} else t5 = $[13];
	return t5;
}
function FileWriteStreamPreview(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { path, content } = t0;
	const preRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const el = preRef.current;
			if (el) el.scrollTop = el.scrollHeight;
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== content) {
		t2 = [content];
		$[1] = content;
		$[2] = t2;
	} else t2 = $[2];
	(0, import_react.useEffect)(t1, t2);
	let lines;
	let t3;
	if ($[3] !== content) {
		lines = content.split("\n");
		t3 = lines.length > 48 ? lines.slice(-48).join("\n") : content;
		$[3] = content;
		$[4] = lines;
		$[5] = t3;
	} else {
		lines = $[4];
		t3 = $[5];
	}
	const tail = t3;
	let t4;
	if ($[6] !== path) {
		t4 = path.split("/").filter(Boolean).slice(-2).join("/") || path;
		$[6] = path;
		$[7] = t4;
	} else t4 = $[7];
	const short = t4;
	let t5;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			width: 10,
			height: 10,
			className: "shrink-0 animate-spin"
		});
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== short) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 truncate",
			children: ["Writing ", short]
		});
		$[9] = short;
		$[10] = t6;
	} else t6 = $[10];
	const t7 = lines.length === 1 ? "line" : "lines";
	let t8;
	if ($[11] !== lines.length || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ml-auto shrink-0",
			children: [
				lines.length,
				" ",
				t7
			]
		});
		$[11] = lines.length;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== t6 || $[15] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 px-2 py-1 text-ed-chat text-ed-muted-foreground",
			children: [
				t5,
				t6,
				t8
			]
		});
		$[14] = t6;
		$[15] = t8;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== tail) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			ref: preRef,
			className: `max-h-36 overflow-auto px-2 py-1.5 font-mono text-[11px] leading-4 text-ed-foreground/70 ${WRAP_ANYWHERE_CLASS}`,
			children: tail
		});
		$[17] = tail;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] !== t10 || $[20] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-md border border-ed-border bg-ed-muted/30",
			children: [t9, t10]
		});
		$[19] = t10;
		$[20] = t9;
		$[21] = t11;
	} else t11 = $[21];
	return t11;
}
function ToolActivityGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { category, items, defaultOpen: t1 } = t0;
	const defaultOpen = t1 === void 0 ? false : t1;
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	const [wasDefaultOpen, setWasDefaultOpen] = (0, import_react.useState)(defaultOpen);
	if (wasDefaultOpen !== defaultOpen) {
		setWasDefaultOpen(defaultOpen);
		if (defaultOpen) setOpen(true);
	}
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => setOpen(_temp$30);
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== category || $[2] !== items.length) {
		t3 = getToolCategoryLabelLocal(category, items.length);
		$[1] = category;
		$[2] = items.length;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t3 });
		$[4] = t3;
		$[5] = t4;
	} else t4 = $[5];
	const t5 = open && "rotate-90";
	let t6;
	if ($[6] !== t5) {
		t6 = cn$2("size-2.5 shrink-0 transition-transform", t5);
		$[6] = t5;
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, {
			width: 10,
			height: 10,
			className: t6
		});
		$[8] = t6;
		$[9] = t7;
	} else t7 = $[9];
	let t8;
	if ($[10] !== t4 || $[11] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			onClick: t2,
			variant: "ghost",
			size: "text",
			isChildText: false,
			className: "flex min-h-6.5 w-fit select-none gap-1 bg-transparent! text-ed-chat leading-5 text-ed-muted-foreground hover:bg-transparent! hover:text-ed-foreground active:bg-transparent!",
			children: [t4, t7]
		});
		$[10] = t4;
		$[11] = t7;
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== items || $[14] !== open) {
		t9 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 flex min-w-0 flex-col gap-1.5 border-l border-ed-border pl-3",
			children: items.map(_temp2$18)
		});
		$[13] = items;
		$[14] = open;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== t8 || $[17] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [t8, t9]
		});
		$[16] = t8;
		$[17] = t9;
		$[18] = t10;
	} else t10 = $[18];
	return t10;
}
function _temp2$18(item, index) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolActivityRow, { item }, index);
}
function _temp$30(prev) {
	return !prev;
}
function getToolCategoryLabelLocal(category, count) {
	switch (category) {
		case "changes": return `Made ${count} ${count === 1 ? "change" : "changes"}`;
		case "reads": return `Read ${count} ${count === 1 ? "file" : "files"}`;
		case "searches": return `Ran ${count} ${count === 1 ? "search" : "searches"}`;
		case "commands": return `Ran ${count} ${count === 1 ? "command" : "commands"}`;
		default: return `Completed ${count} ${count === 1 ? "step" : "steps"}`;
	}
}
/** Collapsed activity accordion for saved and streaming messages. */
function SavedActivityAccordion(t0) {
	const $ = (0, import_compiler_runtime.c)(36);
	const { activity, durationMs, active: t1, thinking } = t0;
	const active = t1 === void 0 ? false : t1;
	const [open, setOpen] = (0, import_react.useState)(active);
	const [wasActive, setWasActive] = (0, import_react.useState)(active);
	if (wasActive !== active) {
		setWasActive(active);
		setOpen(active);
	}
	let t2;
	if ($[0] !== active || $[1] !== activity || $[2] !== durationMs || $[3] !== open || $[4] !== thinking) {
		const thoughts = getThoughtSegments$1(activity);
		const groupedTools = groupCompletedTools$1(activity);
		let t3;
		if ($[6] !== activity) {
			t3 = getCompletedActivitySummary$1(activity);
			$[6] = activity;
			$[7] = t3;
		} else t3 = $[7];
		const summary = t3;
		let t4;
		let t5;
		let t6;
		let t7;
		let writePreview;
		if ($[8] !== active || $[9] !== activity || $[10] !== durationMs || $[11] !== open || $[12] !== summary || $[13] !== thinking) {
			const pendingTool = active ? [...activity].reverse().find(_temp3$14) : void 0;
			let t8;
			if ($[19] !== durationMs) {
				t8 = durationMs ? formatWorkDuration$1(durationMs) : "";
				$[19] = durationMs;
				$[20] = t8;
			} else t8 = $[20];
			const duration = t8;
			const label = active ? `Working…${duration ? ` ${duration}` : ""}` : duration ? `Worked for ${duration}` : "Worked";
			const input = pendingTool?.input ?? {};
			writePreview = active && pendingTool && isFileWriteActivity$1(pendingTool.name) && typeof (input.content ?? input.new_string) === "string" ? {
				path: String(input.file_path || input.path || "file"),
				content: String(input.content ?? input.new_string)
			} : null;
			t4 = "min-w-0 text-ed-chat leading-normal";
			let t9;
			if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
				t9 = () => setOpen(_temp4$14);
				$[21] = t9;
			} else t9 = $[21];
			let t10;
			if ($[22] !== label) {
				t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label });
				$[22] = label;
				$[23] = t10;
			} else t10 = $[23];
			const t11 = open && "rotate-90";
			let t12;
			if ($[24] !== t11) {
				t12 = cn$2("size-2.5 shrink-0 transition-transform", t11);
				$[24] = t11;
				$[25] = t12;
			} else t12 = $[25];
			let t13;
			if ($[26] !== t12) {
				t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, {
					width: 10,
					height: 10,
					className: t12
				});
				$[26] = t12;
				$[27] = t13;
			} else t13 = $[27];
			if ($[28] !== t10 || $[29] !== t13) {
				t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: t9,
					variant: "ghost",
					size: "text",
					isChildText: false,
					className: "flex min-h-6.5 w-fit select-none gap-1 bg-transparent! text-ed-chat leading-[1.5] text-ed-muted-foreground/55 hover:bg-transparent! hover:text-ed-muted-foreground/80 active:bg-transparent!",
					children: [t10, t13]
				});
				$[28] = t10;
				$[29] = t13;
				$[30] = t5;
			} else t5 = $[30];
			if ($[31] !== open || $[32] !== summary) {
				t6 = summary && !open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-ed-chat leading-5 text-ed-muted-foreground/70",
					children: summary
				});
				$[31] = open;
				$[32] = summary;
				$[33] = t6;
			} else t6 = $[33];
			t7 = active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex min-h-5 items-center gap-1.5 text-ed-chat leading-5 text-ed-muted-foreground",
				children: [(pendingTool || thinking) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
					width: 11,
					height: 11,
					className: "shrink-0 animate-spin"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children: pendingTool ? getToolActivityLabel$1(pendingTool.name || "Tool", pendingTool.input) : thinking ? "Thinking…" : ""
				})]
			});
			$[8] = active;
			$[9] = activity;
			$[10] = durationMs;
			$[11] = open;
			$[12] = summary;
			$[13] = thinking;
			$[14] = t4;
			$[15] = t5;
			$[16] = t6;
			$[17] = t7;
			$[18] = writePreview;
		} else {
			t4 = $[14];
			t5 = $[15];
			t6 = $[16];
			t7 = $[17];
			writePreview = $[18];
		}
		let t8;
		if ($[34] !== writePreview) {
			t8 = writePreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileWriteStreamPreview, {
					path: writePreview.path,
					content: writePreview.content
				})
			});
			$[34] = writePreview;
			$[35] = t8;
		} else t8 = $[35];
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t4,
			children: [
				t5,
				t6,
				t7,
				t8,
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex min-w-0 flex-col gap-2 border-l border-ed-border pl-3",
					children: [thoughts.map(_temp5$13), Object.entries(groupedTools).filter(_temp6$10).map((t9) => {
						const [category, items_0] = t9;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolActivityGroup, {
							category,
							items: items_0,
							defaultOpen: active
						}, category);
					})]
				})
			]
		});
		$[0] = active;
		$[1] = activity;
		$[2] = durationMs;
		$[3] = open;
		$[4] = thinking;
		$[5] = t2;
	} else t2 = $[5];
	return t2;
}
function _temp6$10(t0) {
	const [, items] = t0;
	return items.length > 0;
}
function _temp5$13(thought, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-ed-chat text-ed-muted-foreground/70",
			children: "Thought"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-ed-chat leading-[1.65] text-ed-foreground/80 ${WRAP_ANYWHERE_CLASS}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMarkdown, { children: thought })
		})]
	}, i);
}
function _temp4$14(prev) {
	return !prev;
}
function _temp3$14(item) {
	return item.type === "tool" && item.pending === true;
}
function SequentialAssistantActivity(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { activity, durationMs, active: t1, thinking } = t0;
	const active = t1 === void 0 ? false : t1;
	let blocks;
	let t2;
	if ($[0] !== activity) {
		blocks = [];
		for (const item of activity) if (item.type === "text") {
			const previous = blocks[blocks.length - 1];
			if (previous?.type === "text") previous.text = previous.text + (item.text || "");
			else blocks.push({
				type: "text",
				text: item.text || ""
			});
		} else {
			const previous_0 = blocks[blocks.length - 1];
			if (previous_0?.type === "work") previous_0.items.push(item);
			else blocks.push({
				type: "work",
				items: [item]
			});
		}
		t2 = blocks.reduce(_temp7$8, -1);
		$[0] = activity;
		$[1] = blocks;
		$[2] = t2;
	} else {
		blocks = $[1];
		t2 = $[2];
	}
	const lastWorkIndex = t2;
	let t3;
	if ($[3] !== active || $[4] !== blocks || $[5] !== durationMs || $[6] !== lastWorkIndex || $[7] !== thinking) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: blocks.map((block_0, index_0) => block_0.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `min-w-0 max-w-full text-ed-chat font-normal leading-[1.65] text-ed-foreground/80 ${WRAP_ANYWHERE_CLASS}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMarkdown, { children: block_0.text })
			}, index_0) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedActivityAccordion, {
				activity: block_0.items,
				durationMs: index_0 === lastWorkIndex ? durationMs : void 0,
				active: active && index_0 === lastWorkIndex,
				thinking: active && index_0 === lastWorkIndex ? thinking : false
			}, index_0))
		});
		$[3] = active;
		$[4] = blocks;
		$[5] = durationMs;
		$[6] = lastWorkIndex;
		$[7] = thinking;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}
function _temp7$8(lastIndex, block, index) {
	return block.type === "work" ? index : lastIndex;
}
function ToolResultBadge(t0) {
	const $ = (0, import_compiler_runtime.c)(30);
	const { item, store, onSelect } = t0;
	let t1;
	if ($[0] !== item) {
		t1 = getToolResultBadge(item);
		$[0] = item;
		$[1] = t1;
	} else t1 = $[1];
	const { action, label, kind } = t1;
	let t2;
	if ($[2] !== item.input) {
		t2 = item.input ?? {};
		$[2] = item.input;
		$[3] = t2;
	} else t2 = $[3];
	const input = t2;
	const elementId = typeof input.element_id === "string" ? input.element_id : void 0;
	let t3;
	if ($[4] !== elementId || $[5] !== store) {
		t3 = elementId ? getById(store, elementId) : null;
		$[4] = elementId;
		$[5] = store;
		$[6] = t3;
	} else t3 = $[6];
	const element = t3;
	let actionIconClass;
	let t4;
	if ($[7] !== item.error || $[8] !== item.name) {
		const name = item.name.includes("__") ? item.name.split("__").pop().toLowerCase() : item.name.toLowerCase();
		const actionColor = item.error || /delete/.test(name) ? "text-ed-destructive" : /(write|edit|update|insert|add|duplicate|replace)/.test(name) ? "text-ed-success" : "text-ed-muted-foreground";
		let t5;
		if ($[11] !== actionColor) {
			t5 = cn$2("size-3.5 shrink-0", actionColor);
			$[11] = actionColor;
			$[12] = t5;
		} else t5 = $[12];
		actionIconClass = t5;
		t4 = item.error ? WarningIcon$1 : /(write|edit|update|insert|replace|delete)/.test(name) ? PencilIcon : /(glob|grep|search|find|query)/.test(name) ? SearchIcon : /delete/.test(name) ? TrashIcon : name === "canvas_add" ? PlusIcon : name === "canvas_duplicate" ? CopyIcon : name === "canvas_update" ? CursorIcon : name === "project_write" ? FileIcon : name === "ls" ? FolderOpenIcon : FileCodeIcon;
		$[7] = item.error;
		$[8] = item.name;
		$[9] = actionIconClass;
		$[10] = t4;
	} else {
		actionIconClass = $[9];
		t4 = $[10];
	}
	const Icon = t4;
	let t5;
	if ($[13] !== Icon || $[14] !== actionIconClass) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			width: 14,
			height: 14,
			className: actionIconClass
		});
		$[13] = Icon;
		$[14] = actionIconClass;
		$[15] = t5;
	} else t5 = $[15];
	let t6;
	if ($[16] !== action || $[17] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex shrink-0 items-center gap-1.5 border-r border-ed-border py-1 pl-1 pr-2 text-ed-chat leading-4 text-ed-muted-foreground",
			children: [t5, action]
		});
		$[16] = action;
		$[17] = t5;
		$[18] = t6;
	} else t6 = $[18];
	const actionSpan = t6;
	const t7 = item.error && "text-ed-destructive";
	let t8;
	if ($[19] !== t7) {
		t8 = cn$2("flex w-fit min-w-0 max-w-full items-stretch overflow-hidden rounded-[5px] border border-ed-border bg-transparent", t7);
		$[19] = t7;
		$[20] = t8;
	} else t8 = $[20];
	let t9;
	if ($[21] !== element || $[22] !== kind || $[23] !== label || $[24] !== onSelect) {
		t9 = kind === "canvas" || element ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
			variant: "segment",
			element,
			label,
			component: false,
			onClick: element && onSelect ? () => onSelect(element.id) : void 0
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChip, {
			variant: "segment",
			icon: FileCodeIcon,
			label
		});
		$[21] = element;
		$[22] = kind;
		$[23] = label;
		$[24] = onSelect;
		$[25] = t9;
	} else t9 = $[25];
	let t10;
	if ($[26] !== actionSpan || $[27] !== t8 || $[28] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "tool-result",
			className: t8,
			children: [actionSpan, t9]
		});
		$[26] = actionSpan;
		$[27] = t8;
		$[28] = t9;
		$[29] = t10;
	} else t10 = $[29];
	return t10;
}
function ScreenshotChips(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { screenshots, onOpen } = t0;
	if (!screenshots.length) return null;
	let t1;
	if ($[0] !== onOpen || $[1] !== screenshots) {
		let t2;
		if ($[3] !== onOpen || $[4] !== screenshots.length) {
			t2 = (src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageContextChip, {
				src,
				label: screenshots.length === 1 ? "Screenshot" : `Screenshot ${index + 1}`,
				onClick: () => onOpen(src)
			}, index);
			$[3] = onOpen;
			$[4] = screenshots.length;
			$[5] = t2;
		} else t2 = $[5];
		t1 = screenshots.map(t2);
		$[0] = onOpen;
		$[1] = screenshots;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 flex-wrap gap-1.5",
			children: t1
		});
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function WorkingIndicator(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { durationMs } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			width: 12,
			height: 12,
			className: "shrink-0 animate-spin"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== durationMs) {
		t2 = (durationMs ?? 0) >= 1e3 ? ` ${formatWorkDuration$1(durationMs)}` : "";
		$[1] = durationMs;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-ed-chat text-ed-muted-foreground/55",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Working…", t2] })]
		});
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function AssistantMessage(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { message, store, active, activeDurationMs, footer, onSelectElement, onOpenScreenshot } = t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let t5;
	if ($[0] !== active || $[1] !== activeDurationMs || $[2] !== footer || $[3] !== message || $[4] !== onOpenScreenshot || $[5] !== onSelectElement || $[6] !== store) {
		const activity = buildActivity(message);
		let t6;
		if ($[12] !== message) {
			t6 = messageMetadata(message);
			$[12] = message;
			$[13] = t6;
		} else t6 = $[13];
		const durationMs = active ? activeDurationMs : t6.workDurationMs;
		const images = activity.flatMap(_temp8$6);
		const results = getDisplayToolResults(activity);
		const hasText = activity.some(_temp9$5);
		const last = activity[activity.length - 1];
		const thinking = active && (!last || last.type === "thinking");
		t1 = "flex min-w-0 max-w-full flex-col gap-3";
		t2 = activity.length > 0 ? hasText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequentialAssistantActivity, {
			activity,
			durationMs,
			active,
			thinking
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedActivityAccordion, {
			activity,
			durationMs,
			active,
			thinking
		}) : active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkingIndicator, { durationMs }) : null;
		t3 = images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenshotChips, {
			screenshots: images,
			onOpen: onOpenScreenshot
		});
		t4 = footer;
		t5 = results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 max-w-full flex-col gap-2",
			children: results.map((item_1, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolResultBadge, {
				item: item_1,
				store,
				onSelect: onSelectElement
			}, index))
		});
		$[0] = active;
		$[1] = activeDurationMs;
		$[2] = footer;
		$[3] = message;
		$[4] = onOpenScreenshot;
		$[5] = onSelectElement;
		$[6] = store;
		$[7] = t1;
		$[8] = t2;
		$[9] = t3;
		$[10] = t4;
		$[11] = t5;
	} else {
		t1 = $[7];
		t2 = $[8];
		t3 = $[9];
		t4 = $[10];
		t5 = $[11];
	}
	let t6;
	if ($[14] !== t1 || $[15] !== t2 || $[16] !== t3 || $[17] !== t4 || $[18] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t1,
			children: [
				t2,
				t3,
				t4,
				t5
			]
		});
		$[14] = t1;
		$[15] = t2;
		$[16] = t3;
		$[17] = t4;
		$[18] = t5;
		$[19] = t6;
	} else t6 = $[19];
	return t6;
}
function _temp9$5(item_0) {
	return item_0.type === "text" && item_0.text.trim();
}
function _temp8$6(item) {
	return item.type === "tool" ? getToolResultImages(item.output) : [];
}
function ChatTranscriptV2(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { messages, store, variant, activeMessageId, activeDurationMs, activeFooter, onSelectElement, onOpenScreenshot } = t0;
	let t1;
	if ($[0] !== messages) {
		t1 = splitAtSteers(messages);
		$[0] = messages;
		$[1] = t1;
	} else t1 = $[1];
	const rows = t1;
	let t2;
	if ($[2] !== activeDurationMs || $[3] !== activeFooter || $[4] !== activeMessageId || $[5] !== onOpenScreenshot || $[6] !== onSelectElement || $[7] !== rows || $[8] !== store || $[9] !== variant) {
		let t3;
		if ($[11] !== activeDurationMs || $[12] !== activeFooter || $[13] !== activeMessageId || $[14] !== onOpenScreenshot || $[15] !== onSelectElement || $[16] !== store || $[17] !== variant) {
			t3 = (msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `flex min-w-0 max-w-full gap-2.5 ${msg.role === "user" ? "flex-row-reverse items-center justify-between" : "items-start"}`,
				children: msg.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMessage, {
					message: msg,
					store,
					variant,
					onSelectElement
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMessage, {
					message: msg,
					store,
					active: msg.id === activeMessageId,
					activeDurationMs,
					...msg.id === activeMessageId ? { footer: activeFooter } : {},
					onSelectElement,
					onOpenScreenshot
				})
			}, msg.id);
			$[11] = activeDurationMs;
			$[12] = activeFooter;
			$[13] = activeMessageId;
			$[14] = onOpenScreenshot;
			$[15] = onSelectElement;
			$[16] = store;
			$[17] = variant;
			$[18] = t3;
		} else t3 = $[18];
		t2 = rows.map(t3);
		$[2] = activeDurationMs;
		$[3] = activeFooter;
		$[4] = activeMessageId;
		$[5] = onOpenScreenshot;
		$[6] = onSelectElement;
		$[7] = rows;
		$[8] = store;
		$[9] = variant;
		$[10] = t2;
	} else t2 = $[10];
	let t3;
	if ($[19] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t2 });
		$[19] = t2;
		$[20] = t3;
	} else t3 = $[20];
	return t3;
}

export { ChatTranscriptV2, WorkingIndicator };
