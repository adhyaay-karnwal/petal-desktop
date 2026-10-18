// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/QueuedMessagesV2.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { ArrowUpIcon, PencilIcon, PlayIcon, XIcon } from "../../../../../ui/src/icons.js";
import { IconBtn } from "../panels/styles/primitives.js";
import { splitInlineChatReferences } from "../../utils/inlineChatComposer.js";

/**
* Follow-ups waiting above the composer for the running turn to end. Each one
* can go back into the composer, be dropped, or be sent into the running turn
* now. After a failed turn the queue is held until resumed; a Stop returns
* it to the composer instead.
*/
/** Inline references read as `@name` in the one-line preview, labelled as their chips are. */
function previewText({ text, metadata }) {
	const { inlineRefs, referenceMentions } = metadata ?? {};
	return splitInlineChatReferences(text, inlineRefs ?? [], referenceMentions).parts.map((part) => typeof part === "string" ? part : `@${part.reference.displayName ?? part.reference.name}`).join("").replace(/\s+/g, " ").trim();
}
function QueuedMessagesV2(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { queue, busy, onEdit, onRemove, onSendNow, onResume } = t0;
	if (queue.length === 0) return null;
	let t1;
	if ($[0] !== queue) {
		t1 = queue.some(_temp$28);
		$[0] = queue;
		$[1] = t1;
	} else t1 = $[1];
	const held = t1;
	let t2;
	if ($[2] !== held || $[3] !== onResume) {
		t2 = held && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 px-2 pb-1 text-ed-chat text-ed-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Queue paused" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Resume queue",
				onClick: onResume,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayIcon, {})
			})]
		});
		$[2] = held;
		$[3] = onResume;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== busy || $[6] !== onEdit || $[7] !== onRemove || $[8] !== onSendNow || $[9] !== queue) {
		let t4;
		if ($[11] !== busy || $[12] !== onEdit || $[13] !== onRemove || $[14] !== onSendNow) {
			t4 = (message_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group flex min-w-0 items-center gap-1 pl-2 pr-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn$2("min-w-0 flex-1 truncate text-ed-chat leading-6", message_0.held ? "text-ed-muted-foreground" : "text-ed-foreground/80"),
						children: previewText(message_0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: busy ? "Steer current run with this message" : "Send now",
						onClick: () => onSendNow(message_0.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Edit queued message",
						onClick: () => onEdit(message_0.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilIcon, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Remove queued message",
						onClick: () => onRemove(message_0.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {})
					})
				]
			}, message_0.id);
			$[11] = busy;
			$[12] = onEdit;
			$[13] = onRemove;
			$[14] = onSendNow;
			$[15] = t4;
		} else t4 = $[15];
		t3 = queue.map(t4);
		$[5] = busy;
		$[6] = onEdit;
		$[7] = onRemove;
		$[8] = onSendNow;
		$[9] = queue;
		$[10] = t3;
	} else t3 = $[10];
	let t4;
	if ($[16] !== t2 || $[17] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1.5 flex flex-col rounded-md border border-ed-border bg-ed-card py-1",
			children: [t2, t3]
		});
		$[16] = t2;
		$[17] = t3;
		$[18] = t4;
	} else t4 = $[18];
	return t4;
}
function _temp$28(message) {
	return message.held;
}

export { QueuedMessagesV2 };
