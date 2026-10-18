// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/activity.ts
import { parseAskUserQuestions$1, parseImportProgress$1 } from "./chatUiTools.js";

function isToolPart(part) {
	return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}
/** Display name for a tool part: explicit `toolName`, else the type suffix. */
function toolPartName(part) {
	if (typeof part.toolName === "string" && part.toolName) return part.toolName;
	if (part.type === "dynamic-tool") return "Tool";
	return part.type.slice(5) || "Tool";
}
/** True when a tool part has produced its final result. */
function isToolPartSettled(part) {
	return part.state === "output-available" || part.state === "output-error";
}
/**
* Build the ordered activity timeline for one assistant message. Text and
* reasoning parts extend the previous item of the same kind so a streamed
* message reads as a few blocks, not one item per delta.
*/
function buildActivity(message) {
	const items = [];
	const parts = Array.isArray(message.parts) ? message.parts : [];
	for (const raw of parts) {
		const part = raw;
		if (part.type === "text" && typeof raw.text === "string") {
			const text = raw.text;
			const previous = items[items.length - 1];
			if (previous?.type === "text") previous.text += text;
			else items.push({
				type: "text",
				text
			});
			continue;
		}
		if (part.type === "reasoning" && typeof raw.text === "string") {
			const text = raw.text;
			const previous = items[items.length - 1];
			if (previous?.type === "thinking") previous.text += text;
			else items.push({
				type: "thinking",
				text
			});
			continue;
		}
		if (isToolPart(part)) {
			if (isChatUiToolPart(part)) continue;
			items.push({
				type: "tool",
				name: toolPartName(part),
				input: part.input,
				...part.output !== void 0 ? { output: part.output } : {},
				...isToolPartSettled(part) ? {} : { pending: true },
				...part.state === "output-error" ? { error: true } : {}
			});
		}
	}
	return items;
}
var ASK_USER = "ask_user";
var REPORT_IMPORT_PROGRESS = "report_import_progress";
/**
* Tools whose output is a card in the chat, not work. They stay out of the
* activity timeline; the panel reads them with `latestAskUser` and
* `currentImportProgress`.
*/
var CHAT_UI_TOOLS = /* @__PURE__ */ new Set([ASK_USER, REPORT_IMPORT_PROGRESS]);
/** True when the wire name is a Petal MCP tool (Claude/Codex/Cursor or OpenCode). */
function isPetalToolName(name) {
	const lower = name.toLowerCase();
	return lower.startsWith("mcp__petal__") || lower.startsWith("petal_");
}
function isChatUiToolPart(part) {
	const wire = toolPartName(part);
	return isPetalToolName(wire) && CHAT_UI_TOOLS.has(getBaseToolName$1(wire));
}
function isToolNamed(part, name) {
	if (!isToolPart(part)) return false;
	const wire = toolPartName(part);
	return isPetalToolName(wire) && getBaseToolName$1(wire) === name;
}
/**
* What a running turn is doing now, as the tail of `buildActivity` would show
* it: its pending tool's label, or "Thinking…". Undefined while it writes
* prose or between tools. Reads the trailing parts instead of building the
* whole timeline, because it runs on every stream delta.
*/
function liveActivityLabel(message) {
	const parts = Array.isArray(message.parts) ? message.parts : [];
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i];
		const hasText = typeof part.text === "string";
		if (part.type === "text" && hasText) return void 0;
		if (part.type === "reasoning" && hasText) return "Thinking…";
		if (!isToolPart(part) || isChatUiToolPart(part)) continue;
		return isToolPartSettled(part) ? void 0 : getToolActivityLabel$1(toolPartName(part), part.input);
	}
}
/**
* Questions from the latest `ask_user` call in a message, keyed by the call.
* Skips a call whose input is still streaming (the card would remount on every
* delta) or that failed validation (the agent was told it failed). A steer
* after the call already answered it in the user's own words.
*/
function latestAskUser(message) {
	const parts = Array.isArray(message.parts) ? message.parts : [];
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i];
		if (isSteerPart(part)) return null;
		if (!isToolNamed(part, ASK_USER)) continue;
		if (part.state === "input-streaming" || part.state === "output-error") continue;
		const questions = parseAskUserQuestions$1(part.input);
		if (questions.length > 0) return {
			toolCallId: part.toolCallId ?? String(i),
			questions
		};
	}
	return null;
}
/** The latest checklist a message published, or null. */
function latestImportProgress$1(message) {
	const parts = Array.isArray(message.parts) ? message.parts : [];
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i];
		if (!isToolNamed(part, REPORT_IMPORT_PROGRESS) || part.state === "output-error") continue;
		const progress = parseImportProgress$1(part.input);
		if (progress) return progress;
	}
	return null;
}
/**
* The import checklist to pin under the conversation: the latest one from the
* last two exchanges, so it survives the agent's questions and the user's
* reply, then drops off once the conversation moves on. When it came from an
* earlier turn that asked a question and a new turn is running, the user
* answered, so its waiting step shows done until the agent's next checklist.
*/
function currentImportProgress(messages, busy) {
	const lastIndex = messages.length - 1;
	for (let i = lastIndex; i >= Math.max(0, lastIndex - 3); i--) {
		const message = messages[i];
		if (message.role !== "assistant") continue;
		const progress = latestImportProgress$1(message);
		if (!progress) continue;
		const asked = Array.isArray(message.parts) && message.parts.some((part) => isToolNamed(part, ASK_USER));
		if (!busy || i === lastIndex || !asked) return progress;
		return {
			...progress,
			steps: progress.steps.map((step) => step.status === "active" ? {
				...step,
				status: "done"
			} : step)
		};
	}
	return null;
}
function isSteerPart(part) {
	return part.type === "data-steer";
}
function hasSteer(message) {
	return message.role === "assistant" && Array.isArray(message.parts) && message.parts.some(isSteerPart);
}
/**
* Split each assistant message where a message the user sent mid-turn landed,
* so the transcript shows it as a user turn at that point. The last piece keeps
* the message id and metadata, so the live turn and its duration stay on it.
* Returns `messages` itself when no turn was steered.
*/
function splitAtSteers(messages) {
	if (!messages.some(hasSteer)) return messages;
	return messages.flatMap((message) => {
		if (!hasSteer(message)) return [message];
		const pieces = [];
		let parts = [];
		for (const part of message.parts) {
			if (!isSteerPart(part)) {
				parts.push(part);
				continue;
			}
			if (parts.length > 0) pieces.push({
				id: `${message.id}:${pieces.length}`,
				role: "assistant",
				parts
			});
			parts = [];
			pieces.push({
				id: `${message.id}:${part.id}`,
				role: "user",
				parts: [{
					type: "text",
					text: part.data.text
				}],
				...part.data.metadata ? { metadata: part.data.metadata } : {}
			});
		}
		pieces.push({
			...message,
			parts
		});
		return pieces;
	});
}
/** Trailing assistant text after the last tool or thinking block.
* Comment replies post this summary and leave the rest of the turn in the chat. */
function commentReplyText(message) {
	const items = buildActivity(message);
	for (let i = items.length - 1; i >= 0; i--) {
		const item = items[i];
		if (!item) continue;
		if (item.type === "tool" || item.type === "thinking") return "";
		if (item.type === "text" && item.text.trim()) return item.text;
	}
	return "";
}
/** Plain text of a message's text parts (for titles and fallbacks). */
function messageText(message) {
	return (Array.isArray(message.parts) ? message.parts : []).filter((part) => part.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n");
}
/** Strip the MCP server prefix (`mcp__petal__canvas_add` / `petal_canvas_add` → `canvas_add`). */
function getBaseToolName$1(name) {
	const lower = name.toLowerCase();
	if (lower.startsWith("mcp__petal__")) return lower.slice(12);
	if (lower.startsWith("petal_")) return lower.slice(6);
	return lower.includes("__") ? lower.split("__").pop() : lower;
}
/** Human-readable label for a tool activity indicator. */
function getToolActivityLabel$1(name, input) {
	const args = input ?? {};
	const path = args.path || args.file_path || "";
	const short = path ? String(path).split("/").slice(-2).join("/") : "";
	const baseName = getBaseToolName$1(name);
	switch (baseName) {
		case "project_read":
		case "read": return short ? `Reading ${short}` : "Reading file...";
		case "read_skill": return args.name ? `Loading ${args.name}` : "Loading skill...";
		case "project_write":
		case "write": return short ? `Writing ${short}` : "Writing file...";
		case "project_copy_file": {
			const dest = args.project_path || (Array.isArray(args.files) ? args.files[0]?.project_path : "");
			const destShort = dest ? String(dest).split("/").slice(-2).join("/") : "";
			const extra = Array.isArray(args.files) && args.files.length > 1 ? ` +${args.files.length - 1} more` : "";
			return destShort ? `Copying ${destShort}${extra}` : "Copying file...";
		}
		case "project_edit":
		case "edit": return short ? `Editing ${short}` : "Editing file...";
		case "project_delete":
		case "delete": return short ? `Deleting ${short}` : "Deleting file...";
		case "project_glob":
		case "glob": return args.pattern ? `Finding ${args.pattern}` : "Finding files...";
		case "project_grep":
		case "grep": return args.pattern ? `Searching for "${args.pattern}"` : "Searching...";
		case "ls": return short ? `Listing ${short}` : "Listing directory...";
		case "canvas_add": return "Adding to canvas...";
		case "canvas_update": return args.element_id || args.elementId ? "Updating element" : "Updating element...";
		case "canvas_edit": return "Editing element...";
		case "canvas_patch": return "Editing elements...";
		case "canvas_insert": return "Inserting on canvas...";
		case "canvas_duplicate": return "Duplicating on canvas...";
		case "canvas_grep": return args.pattern ? `Grepping canvas: "${args.pattern}"` : "Grepping canvas...";
		case "canvas_query": return args.selector ? `Querying canvas: "${args.selector}"` : "Querying canvas...";
		case "get_theme": return "Reading theme...";
		case "canvas_delete": return "Deleting element...";
		case "canvas_rename": return args.name ? `Renaming element to "${args.name}"` : "Renaming element...";
		case "canvas_read": return args.element_id ? "Reading element..." : "Reading canvas...";
		case "search_icons": return args.query ? `Searching icons: "${args.query}"` : "Searching icons...";
		case "take_screenshot": return "Taking screenshot...";
		default: return `${baseName}...`;
	}
}
function formatWorkDuration$1(durationMs) {
	if (!durationMs || durationMs < 1e3) return "a moment";
	const seconds = Math.round(durationMs / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
function getToolActivityCategory$1(item) {
	const name = getBaseToolName$1(item.name);
	if (/(write|edit|delete|add|update|insert|replace|copy)/.test(name)) return "changes";
	if (name === "read" || name === "project_read" || name === "canvas_read") return "reads";
	if (/(glob|grep|search|find|query)/.test(name)) return "searches";
	if (/(bash|shell|terminal|command|exec)/.test(name)) return "commands";
	return "other";
}
function getToolCategoryLabel$1(category, count) {
	switch (category) {
		case "changes": return `Made ${count} ${count === 1 ? "change" : "changes"}`;
		case "reads": return `Read ${count} ${count === 1 ? "file" : "files"}`;
		case "searches": return `Ran ${count} ${count === 1 ? "search" : "searches"}`;
		case "commands": return `Ran ${count} ${count === 1 ? "command" : "commands"}`;
		default: return `Completed ${count} ${count === 1 ? "step" : "steps"}`;
	}
}
function isCompletedTool$1(item) {
	return item.type === "tool" && item.pending !== true;
}
function groupCompletedTools$1(activity) {
	return activity.filter(isCompletedTool$1).reduce((groups, tool) => {
		groups[getToolActivityCategory$1(tool)].push(tool);
		return groups;
	}, {
		changes: [],
		reads: [],
		searches: [],
		commands: [],
		other: []
	});
}
function getCompletedActivitySummary$1(activity) {
	return Object.entries(groupCompletedTools$1(activity)).filter(([, items]) => items.length > 0).map(([category, items]) => getToolCategoryLabel$1(category, items.length)).join(" · ");
}
function isFileWriteActivity$1(name) {
	const base = getBaseToolName$1(name || "");
	return base === "project_write" || base === "project_edit" || base === "local_write" || base === "local_edit" || base === "write" || base === "edit";
}
function getThoughtSegments$1(activity) {
	return activity.filter((item) => item.type === "thinking" && !!item.text?.trim()).map((item) => item.text.trim());
}
/** Verb and target for one completed tool row. */
function getCompletedToolParts$1(item) {
	const name = getBaseToolName$1(item.name);
	const input = item.input ?? {};
	const path = input.path || input.file_path;
	const shortPath = path ? String(path).split("/").slice(-2).join("/") : void 0;
	if (name === "read" || name === "project_read") return {
		verb: "Read",
		target: shortPath || "a file"
	};
	if (name === "read_skill") return {
		verb: "Loaded",
		target: input.name || "skill"
	};
	if (name === "canvas_read") return {
		verb: "Read",
		target: input.element_id ? "element" : "canvas"
	};
	if (/(write|edit|update|insert|replace|copy)/.test(name)) return {
		verb: "Edited",
		target: shortPath || input.project_path || input.element_id || "a file"
	};
	if (/delete/.test(name)) return {
		verb: "Deleted",
		target: shortPath || input.element_id || "an item"
	};
	if (/(glob|grep|search|find|query)/.test(name)) return {
		verb: "Searched for",
		target: input.pattern || input.query || input.selector || "matches"
	};
	if (/(bash|shell|terminal|command|exec)/.test(name)) return {
		verb: "Ran",
		target: input.command || input.cmd || "a command"
	};
	if (name === "take_screenshot") return {
		verb: "Captured",
		target: "a screenshot"
	};
	return { verb: getToolActivityLabel$1(item.name, input).replace(/\.\.\.$/, "") };
}
/** Action word and target for a completed tool-result badge. */
function getToolResultBadge(item) {
	const name = getBaseToolName$1(item.name);
	const input = item.input ?? {};
	const path = input.path || input.file_path;
	const short = path ? String(path).split("/").slice(-2).join("/") : "";
	if (item.error) return {
		action: "Failed",
		label: short || getToolActivityLabel$1(item.name, input).replace(/\.\.\.$/, ""),
		kind: "other"
	};
	if (name === "project_write" || name === "write" || name === "local_write") return {
		action: "Wrote",
		label: short || "file",
		kind: "file"
	};
	if (name === "project_edit" || name === "edit" || name === "local_edit") return {
		action: "Edited",
		label: short || "file",
		kind: "file"
	};
	if (name === "project_delete" || name === "delete") return {
		action: "Deleted file",
		label: short || "file",
		kind: "file"
	};
	if (name === "project_read" || name === "read") return {
		action: "Read",
		label: short || "file",
		kind: "file"
	};
	if (name === "project_glob" || name === "glob") return {
		action: "Found",
		label: input.pattern || "files",
		kind: "search"
	};
	if (name === "project_grep" || name === "grep") return {
		action: "Searched",
		label: input.pattern || "matches",
		kind: "search"
	};
	if (name === "canvas_add" || name === "canvas_insert") return {
		action: "Added",
		label: "to canvas",
		kind: "canvas"
	};
	if (name === "canvas_update" || name === "canvas_edit") return {
		action: "Updated",
		label: "element",
		kind: "canvas"
	};
	if (name === "canvas_patch") return {
		action: "Updated",
		label: "elements",
		kind: "canvas"
	};
	if (name === "canvas_duplicate") return {
		action: "Duplicated",
		label: "element",
		kind: "canvas"
	};
	if (name === "canvas_delete") return {
		action: "Deleted",
		label: "element",
		kind: "canvas"
	};
	if (name === "canvas_rename") return {
		action: "Renamed",
		label: "element",
		kind: "canvas"
	};
	if (name === "take_screenshot") return {
		action: "Captured",
		label: "screenshot",
		kind: "other"
	};
	return {
		action: getToolActivityLabel$1(item.name, input).replace(/\.\.\.$/, ""),
		label: "",
		kind: "other"
	};
}
/** Image data URLs (normalized) carried by a tool result, if any. */
function getToolResultImages(output) {
	const images = [];
	const visit = (value) => {
		if (!value) return;
		if (typeof value === "string") {
			if (value.startsWith("data:image/")) images.push(value);
			return;
		}
		if (Array.isArray(value)) {
			value.forEach(visit);
			return;
		}
		if (typeof value === "object") {
			const record = value;
			if (record.type === "image" && typeof record.data === "string") {
				images.push(record.data.startsWith("data:image/") ? record.data : `data:${record.mimeType ?? "image/png"};base64,${record.data}`);
				return;
			}
			if (typeof record.data === "string" && record.data.startsWith("data:image/")) images.push(record.data);
			if (Array.isArray(record.content)) record.content.forEach(visit);
			if (Array.isArray(record.parts)) record.parts.forEach(visit);
		}
	};
	visit(output);
	return images;
}

export { buildActivity, commentReplyText, currentImportProgress, formatWorkDuration$1, getBaseToolName$1, getCompletedActivitySummary$1, getCompletedToolParts$1, getThoughtSegments$1, getToolActivityLabel$1, getToolResultBadge, getToolResultImages, groupCompletedTools$1, isCompletedTool$1, isFileWriteActivity$1, latestAskUser, liveActivityLabel, messageText, splitAtSteers, toolPartName };
