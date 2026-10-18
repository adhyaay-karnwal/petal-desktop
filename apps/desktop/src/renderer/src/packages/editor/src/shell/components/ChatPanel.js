// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ChatPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { ArchiveIcon, ArrowClockwiseIcon, ArrowUpIcon, CaretDownIcon, CaretRightIcon, CheckIcon, CopyIcon, CursorIcon, FileCodeIcon, FileIcon, FolderOpenIcon, PencilIcon, PlusIcon, SearchIcon, SettingsIcon, SpinnerIcon, StopIcon, TerminalIcon, TrashIcon, WarningIcon$1, XIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { Tabs, TabsList, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { Content2, Root2, Trigger } from "../../../../../vendor/@radix-ui/react-popover.js";
import { getById, walk } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { toWire } from "../../../../compiler/src/store/wire.js";
import { isPlanLimitReason, planLimitTitle } from "../../backends/planLimits.js";
import { useBackendOptional } from "../../backends/BackendContext.js";
import { captureElementImage } from "../../shared/utils/captureElementImage.js";
import { isClaudeSetUp, useClaudeStatus } from "../hooks/useClaudeStatus.js";
import { IconBtn } from "./panels/styles/primitives.js";
import { isAddToPromptShortcut } from "../utils/chatShortcuts.js";
import { getElementLabel } from "./panels/layerSearch.js";
import { CLAUDE_EFFORT_LEVELS, resolveClaudeEffort } from "../../../../compiler/src/codegen/claudeEffort.js";
import { useAssetResolver } from "../../shared/contexts/AssetContext.js";
import { PetalLogo } from "../../assets/PetalLogo.js";
import { IMPORT_MODEL } from "../constants.js";
import { PanelEmptyState } from "./panels/PanelEmptyState.js";
import { ChatShownContext } from "./ChatConversations.js";
import { elementChatReference } from "../utils/elementChatReference.js";
import { commentChatDisplayText } from "../utils/commentChatDisplay.js";
import { startChatWork } from "../utils/chatWorkTiming.js";
import { CHAT_ATTACHMENT_ACCEPT, getDroppedAttachments, readPromptAttachment } from "../utils/chatAttachments.js";
import { ImportDesignSystemIllustration } from "./ImportDesignSystemIllustration.js";
import { ClaudeCodeSetupModal } from "./ClaudeCodeSetupModal.js";
import { LUNAGRAPH_COMMANDS, buildConnectionPrompt, connectionDisplayName, fetchSlashCommands, filterSlashCommands$1 } from "../hooks/useClaudeContext.js";
import { ContextMentionMenu } from "./ContextMentionMenu.js";
import { useChatScroll } from "../hooks/useChatScroll.js";
import { projectReferenceLine } from "../utils/chatContextReferences.js";
import { useContextMentions } from "../hooks/useContextMentions.js";
import { InlineChatComposer, inlineChatPrompt, splitInlineChatReferences, syncInlineReferenceSpacing } from "../utils/inlineChatComposer.js";
import { SlashCommandMenu } from "./SlashCommandMenu.js";
import { ChatMarkdown } from "./ChatMarkdown.js";
import { ContextChip, ContextMenu, EffortPicker, FolderChip, ModelPicker, pickFolder } from "./ChatContextControls.js";
import { CanvasContextChip } from "./CanvasContextChip.js";
import { SelectionContextChip } from "./SelectionContextChip.js";
import { ImageContextChip } from "./ImageContextChip.js";
import { ChatReferenceChip } from "./ChatReferenceChip.js";
import { ToolFailureDetails } from "./ToolFailureDetails.js";
import { toolFailureReport } from "../utils/chatToolFailure.js";
import { chatWorkTargets } from "../utils/chatWorkTarget.js";
import { publishAiWriteTarget } from "../../shared/state/aiWriteTarget.js";
import { subscribeFolderShared } from "../../shared/state/folderShared.js";
import { useElementChatReferences } from "../hooks/useElementChatReferences.js";

function handleAttachmentDragOver$1(e) {
	if (!e.dataTransfer.types.includes("Files")) return;
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = "copy";
}
function classifyFrontendError(err) {
	const msg = String(err instanceof Error ? err.message : err).toLowerCase();
	if (msg.includes("not available") || msg.includes("no backend")) return {
		code: "not_installed",
		title: "AI chat unavailable",
		message: "No AI backend is configured.",
		action: "Make sure Claude Code CLI is installed and you have an active Claude Pro or Max subscription."
	};
	if (msg.includes("rate limit") || msg.includes("429") || msg.includes("quota") || msg.includes("usage limit")) return {
		code: "rate_limited",
		title: "Rate limit reached",
		message: "You've hit the usage limit for your Claude plan.",
		action: "Wait a few minutes and try again, or upgrade your plan at claude.ai."
	};
	if (msg.includes("overloaded") || msg.includes("503")) return {
		code: "overloaded",
		title: "Claude is busy",
		message: "The API is currently overloaded.",
		action: "Wait a moment and try again."
	};
	if (msg.includes("not logged in") || msg.includes("unauthorized") || msg.includes("auth")) return {
		code: "not_authenticated",
		title: "Not logged in",
		message: "Claude Code is not authenticated.",
		action: "Run `claude /login` in your terminal to log in."
	};
	if (msg.includes("enoent") || msg.includes("not found") || msg.includes("spawn")) return {
		code: "not_installed",
		title: "Claude Code not found",
		message: "Claude Code CLI is not installed or not in your PATH.",
		action: "Open Set up Claude Code in Petal, or follow https://code.claude.com/docs/en/quickstart to install it, then sign in with your Claude subscription."
	};
	const raw = err instanceof Error ? err.message : String(err);
	return {
		code: "unknown",
		title: "Something went wrong",
		message: raw.length > 200 ? raw.slice(0, 200) + "…" : raw
	};
}
/** Capture a canvas element as a PNG data URL (same helper as MCP take_screenshot). */
async function captureElementScreenshot$1(elementId) {
	if (typeof document === "undefined") return null;
	let el = document.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
	if (!el) for (const iframe of Array.from(document.querySelectorAll("iframe"))) try {
		const found = iframe.contentDocument?.querySelector(`[data-element-id="${CSS.escape(elementId)}"]`);
		if (found) {
			el = found;
			break;
		}
	} catch {}
	if (!el) return null;
	try {
		return await captureElementImage(el);
	} catch {
		return null;
	}
}
var WRAP_ANYWHERE_CLASS$1 = "[overflow-wrap:anywhere] [word-break:break-word]";
/** Per-element image URL extraction (inspects this element only — caller walks the subtree). */
function extractImageUrlsForElement$1(el, resolveAsset) {
	const results = [];
	if (el.type === "html" && (el.tag === "img" || el.tag === "video") && el.props?.src) results.push({
		url: resolveAsset(el.props.src),
		name: `${el.tag} in ${el.id}`
	});
	if (el.type === "component" && el.props) {
		for (const [key, value] of Object.entries(el.props)) if (typeof value === "string" && (key.toLowerCase().includes("src") || key.toLowerCase().includes("image") || key.toLowerCase().includes("avatar")) && (value.startsWith("data:image/") || value.startsWith("http") || value.includes(".petal-assets/"))) results.push({
			url: resolveAsset(value),
			name: `${key} in ${el.id}`
		});
	}
	if (el.styles?.backgroundImage) {
		const bgMatch = String(el.styles.backgroundImage).match(/url\(["']?(.+?)["']?\)/);
		if (bgMatch) results.push({
			url: resolveAsset(bgMatch[1]),
			name: `background in ${el.id}`
		});
	}
	return results;
}
/** Walk a subtree in the Store and collect image URLs from every node. */
function extractImageUrlsFromSubtree$1(store, rootId, resolveAsset) {
	const results = [];
	const visit = (id) => {
		const el = getById(store, id);
		if (el) results.push(...extractImageUrlsForElement$1(el, resolveAsset));
	};
	visit(rootId);
	walk(store, rootId, (descId) => visit(descId));
	return results;
}
/** Fetch an image URL and return it as a data URL. Returns null on failure. */
async function fetchImageAsDataUrl$1(url) {
	try {
		if (url.startsWith("data:image/")) return url;
		const response = await fetch(url);
		if (!response.ok) return null;
		const blob = await response.blob();
		if (!blob.type.startsWith("image/")) return null;
		if (blob.size > 3e6) return null;
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}
function generateMessageId() {
	return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
/** Human-readable label for a tool activity indicator */
function getToolActivityLabel(name, input) {
	const path = input?.path || input?.file_path || "";
	const short = path ? path.split("/").slice(-2).join("/") : "";
	const baseName = name.includes("__") ? name.split("__").pop() : name;
	switch (baseName) {
		case "project_read": return short ? `Reading ${short}` : "Reading file...";
		case "read_skill": return input?.name ? `Loading ${input.name}` : "Loading skill...";
		case "project_write": return short ? `Writing ${short}` : "Writing file...";
		case "project_copy_file": {
			const dest = input?.project_path || (Array.isArray(input?.files) ? input.files[0]?.project_path : "");
			const destShort = dest ? String(dest).split("/").slice(-2).join("/") : "";
			const extra = Array.isArray(input?.files) && input.files.length > 1 ? ` +${input.files.length - 1} more` : "";
			return destShort ? `Copying ${destShort}${extra}` : "Copying file...";
		}
		case "project_write_batch": {
			const count = Array.isArray(input?.files) ? input.files.length : 0;
			return count ? `Writing ${count} ${count === 1 ? "file" : "files"}` : "Writing files...";
		}
		case "project_copy_asset": {
			const asset = input?.project_path || input?.local_path;
			const assetName = asset ? String(asset).split("/").pop() : "";
			return assetName ? `Copying ${assetName}` : "Copying asset...";
		}
		case "project_edit": return short ? `Editing ${short}` : "Editing file...";
		case "project_delete": return short ? `Deleting ${short}` : "Deleting file...";
		case "project_glob": return input?.pattern ? `Finding ${input.pattern}` : "Finding files...";
		case "project_grep": return input?.pattern ? `Searching for "${input.pattern}"` : "Searching...";
		case "LS": return short ? `Listing ${short}` : "Listing directory...";
		case "local_folders": return "Checking shared folders...";
		case "local_read": return short ? `Reading ${short}` : "Reading file...";
		case "local_read_batch": {
			const count = Array.isArray(input?.paths) ? input.paths.length : 0;
			return count ? `Reading ${count} ${count === 1 ? "file" : "files"}` : "Reading files...";
		}
		case "local_glob": return input?.pattern ? `Finding ${input.pattern}` : "Finding files...";
		case "local_grep": return input?.pattern ? `Searching for "${input.pattern}"` : "Searching...";
		case "scan_project": return "Scanning the codebase...";
		case "canvas_create_import_scaffold": return "Setting up the Design System page...";
		case "report_import_progress": return "Updating import checklist...";
		case "ask_user": return "Asking for your input...";
		case "AddToCanvas":
		case "canvas_add": return "Adding to canvas...";
		case "UpdateElement":
		case "canvas_update": return input?.element_id || input?.elementId ? "Updating element" : "Updating element...";
		case "canvas_edit": return "Editing element...";
		case "canvas_patch": return "Editing elements...";
		case "canvas_insert": return "Inserting on canvas...";
		case "canvas_duplicate": return "Duplicating on canvas...";
		case "canvas_grep": return input?.pattern ? `Grepping canvas: "${input.pattern}"` : "Grepping canvas...";
		case "canvas_query": return input?.selector ? `Querying canvas: "${input.selector}"` : "Querying canvas...";
		case "get_theme": return "Reading theme...";
		case "DeleteElement":
		case "canvas_delete": return "Deleting element...";
		case "canvas_rename": return input?.name ? `Renaming element to "${input.name}"` : "Renaming element...";
		case "ReplaceWithComponent": return input?.componentName ? `Replacing with ${input.componentName}` : "Replacing element...";
		case "ReadCanvas":
		case "canvas_read": return input?.element_id ? "Reading element..." : "Reading canvas...";
		case "SearchIcons":
		case "search_icons": return input?.query ? `Searching icons: "${input.query}"` : "Searching icons...";
		case "take_screenshot":
		case "TakeScreenshot": return "Taking screenshot...";
		default: return `${baseName}...`;
	}
}
function getBaseToolName(name) {
	return (name.includes("__") ? name.split("__").pop() : name).toLowerCase();
}
function formatWorkDuration(durationMs) {
	if (!durationMs || durationMs < 1e3) return "a moment";
	const seconds = Math.round(durationMs / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
function getToolActivityCategory(item) {
	const name = getBaseToolName(item.name || "");
	if (/(write|edit|delete|add|update|insert|replace|copy)/.test(name)) return "changes";
	if (name === "read" || name === "project_read" || name === "canvas_read" || name === "readcanvas") return "reads";
	if (/(glob|grep|search|find|query)/.test(name)) return "searches";
	if (/(bash|shell|terminal|command|exec)/.test(name)) return "commands";
	return "other";
}
function getToolCategoryLabel(category, count) {
	switch (category) {
		case "changes": return `Made ${count} ${count === 1 ? "change" : "changes"}`;
		case "reads": return `Read ${count} ${count === 1 ? "file" : "files"}`;
		case "searches": return `Ran ${count} ${count === 1 ? "search" : "searches"}`;
		case "commands": return `Ran ${count} ${count === 1 ? "command" : "commands"}`;
		default: return `Completed ${count} ${count === 1 ? "step" : "steps"}`;
	}
}
function isCompletedTool(item) {
	return item.type === "tool" && item.pending !== true;
}
function groupCompletedTools(activity) {
	return activity.filter(isCompletedTool).reduce((groups, tool) => {
		groups[getToolActivityCategory(tool)].push(tool);
		return groups;
	}, {
		changes: [],
		reads: [],
		searches: [],
		commands: [],
		other: []
	});
}
function getCompletedActivitySummary(activity) {
	return Object.entries(groupCompletedTools(activity)).filter(([, items]) => items.length > 0).map(([category, items]) => getToolCategoryLabel(category, items.length)).join(" · ");
}
function isFileWriteActivity(name) {
	const base = getBaseToolName(name || "");
	return base === "project_write" || base === "project_edit" || base === "local_write" || base === "local_edit";
}
function isStreamingActivity(name) {
	const base = getBaseToolName(name || "");
	return isFileWriteActivity(name) || base === "canvas_add" || base === "canvas_insert" || base === "canvas_update";
}
function slimToolInput(input) {
	if (!input || typeof input !== "object") return input;
	const slim = { ...input };
	for (const key of [
		"content",
		"new_string",
		"old_string",
		"jsx"
	]) if (typeof slim[key] === "string" && slim[key].length > 160) slim[key] = `${slim[key].slice(0, 80)}…`;
	return slim;
}
function upsertPendingTool(prev, event) {
	const input = slimToolInput(event.input ?? {});
	const id = event.id || void 0;
	const pending = isStreamingActivity(event.name);
	const at = Date.now();
	for (let i = prev.length - 1; i >= 0; i--) {
		const item = prev[i];
		if (item.type !== "tool" || item.pending !== true) continue;
		const sameId = Boolean(id && item.id && id === item.id);
		const sameName = getBaseToolName(item.name || "") === getBaseToolName(event.name);
		const itemPath = item.input?.file_path || item.input?.path;
		const nextPath = input.file_path || input.path;
		if (sameId || sameName && (Boolean(itemPath && nextPath && itemPath === nextPath) || !itemPath && !nextPath)) {
			const next = [...prev];
			next[i] = {
				type: "tool",
				name: event.name,
				input: {
					...item.input,
					...input
				},
				id: item.id || id,
				pending,
				at
			};
			return next;
		}
	}
	return [...prev, {
		type: "tool",
		name: event.name,
		input,
		id,
		pending,
		at
	}];
}
function getThoughtSegments(activity) {
	return activity.filter((item) => item.type === "thinking" && !!item.text?.trim()).map((item) => item.text.trim());
}
function isImportProgressItem(item) {
	return item.type === "tool" && getBaseToolName(item.name || "") === "report_import_progress";
}
function isAskUserItem(item) {
	return item.type === "tool" && getBaseToolName(item.name || "") === "ask_user";
}
/** Progress/question calls are UI bookkeeping, not work — kept out of activity accordions. */
function isBookkeepingItem(item) {
	return isImportProgressItem(item) || isAskUserItem(item);
}
function parseImportProgress(input) {
	if (!Array.isArray(input?.steps)) return null;
	const steps = input.steps.filter((step) => step && typeof step.label === "string").map((step) => ({
		label: step.label,
		status: step.status === "done" || step.status === "active" ? step.status : "pending"
	}));
	if (steps.length === 0) return null;
	return {
		title: typeof input.title === "string" && input.title ? input.title : void 0,
		steps
	};
}
/** Sent by the checklist card's Resume button; the skill's continuation rules pick up from the saved state. */
var RESUME_IMPORT_PROMPT = "Resume the design system import from where it stopped. Check what was already imported and what is already on the canvas, then continue with the next unfinished step.";
/**
* Asked by the app the instant an import starts, so the user never waits on
* the CLI booting to choose. Mirrors the questions the import skill asks;
* the answer is queued and sent as the next message.
*/
var IMPORT_SEED_QUESTIONS = [{
	question: "What do you want to import?",
	options: [
		{ label: "Styles and icons" },
		{ label: "Styles, icons, and core components" },
		{ label: "Everything" }
	]
}, {
	question: "Do you want it documented on the canvas?",
	options: [{
		label: "Document it on the canvas",
		description: "A Design System page showing the styles and every component."
	}, {
		label: "Just import it",
		description: "Styles apply and components appear in Assets. Nothing on the canvas."
	}]
}];
/** The starting checklist, shown from import kick-off until the agent's first `report_import_progress`. */
var IMPORT_SEED_PROGRESS = { steps: [{
	label: "Scan the source",
	status: "active"
}, {
	label: "Choose what to import",
	status: "pending"
}] };
/** The latest checklist in a timeline, or null when it has none. */
function latestImportProgress(activity) {
	for (let i = activity.length - 1; i >= 0; i--) if (isImportProgressItem(activity[i])) return parseImportProgress(activity[i].input);
	return null;
}
/**
* The single import checklist card, rendered once at the bottom of the
* conversation. `liveDetail` is the current tool activity (derived from the
* stream, not agent-authored) shown under the active step.
*/
function ImportProgressCard$1(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { progress, liveDetail, running, onResume } = t0;
	let t1;
	if ($[0] !== progress.steps) {
		t1 = progress.steps.findIndex(_temp$43);
		$[0] = progress.steps;
		$[1] = t1;
	} else t1 = $[1];
	const detailIndex = t1;
	const t2 = progress.title ?? "Importing design system";
	let t3;
	if ($[2] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1.5 text-ed-chat font-medium text-ed-foreground",
			children: t2
		});
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== detailIndex || $[5] !== liveDetail || $[6] !== progress.steps || $[7] !== running) {
		let t5;
		if ($[9] !== detailIndex || $[10] !== liveDetail || $[11] !== running) {
			t5 = (step_0, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2 text-ed-chat leading-5",
					children: [step_0.status === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
						width: 12,
						height: 12,
						className: "shrink-0 text-ed-foreground"
					}) : step_0.status === "active" && running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
						width: 12,
						height: 12,
						className: "shrink-0 animate-spin text-ed-muted-foreground"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3 shrink-0 rounded-full border border-ed-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn$2("min-w-0 truncate", step_0.status === "active" ? "text-ed-foreground" : step_0.status === "done" ? "text-ed-muted-foreground" : "text-ed-muted-foreground/60"),
						children: step_0.label
					})]
				}), index === detailIndex && running && liveDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 truncate pl-5 text-ed-chat leading-5 text-ed-muted-foreground/60",
					children: liveDetail
				})]
			}, index);
			$[9] = detailIndex;
			$[10] = liveDetail;
			$[11] = running;
			$[12] = t5;
		} else t5 = $[12];
		t4 = progress.steps.map(t5);
		$[4] = detailIndex;
		$[5] = liveDetail;
		$[6] = progress.steps;
		$[7] = running;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[13] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-1",
			children: t4
		});
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== onResume) {
		t6 = onResume && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "xs",
				variant: "outline",
				onClick: onResume,
				children: "Resume import"
			})
		});
		$[15] = onResume;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== t3 || $[18] !== t5 || $[19] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 max-w-full rounded-lg border border-ed-border bg-ed-muted/30 px-3 py-2.5",
			children: [
				t3,
				t5,
				t6
			]
		});
		$[17] = t3;
		$[18] = t5;
		$[19] = t6;
		$[20] = t7;
	} else t7 = $[20];
	return t7;
}
function _temp$43(step) {
	return step.status === "active";
}
function parseAskUserQuestions(input) {
	if (!Array.isArray(input?.questions)) return [];
	return input.questions.filter((entry) => entry && typeof entry.question === "string" && Array.isArray(entry.options)).map((entry) => ({
		question: entry.question,
		options: entry.options.filter((option) => option && typeof option.label === "string").map((option) => ({
			label: option.label,
			description: typeof option.description === "string" ? option.description : void 0
		}))
	})).filter((question) => question.options.length > 0);
}
/**
* Interactive multiple-choice question card fed by the `ask_user` MCP tool —
* one question at a time; the collected answers go back as a single reply.
* Every question is answered by picking an option; a custom answer can still
* be typed in the composer while the card is up.
*/
function AskUserCard$1(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { questions, onReply } = t0;
	const [index, setIndex] = (0, import_react.useState)(0);
	const answersRef = (0, import_react.useRef)([]);
	const optionsRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== index || $[1] !== questions.length) {
		t1 = () => {
			if (index > 0 && index < questions.length) optionsRef.current?.querySelector("button")?.focus();
		};
		t2 = [index, questions.length];
		$[0] = index;
		$[1] = questions.length;
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useEffect)(t1, t2);
	const advance = (answer) => {
		answersRef.current[index] = answer;
		if (index + 1 < questions.length) {
			setIndex(index + 1);
			return;
		}
		setIndex(questions.length);
		onReply(questions.length === 1 ? answersRef.current[0] : questions.map((question, i) => `${question.question} ${answersRef.current[i]}`).join("\n"));
	};
	if (index >= questions.length) return null;
	const current = questions[index];
	const t3 = "min-w-0 max-w-full rounded-lg border border-ed-border bg-ed-muted/30";
	let t4;
	if ($[4] !== index || $[5] !== questions.length) {
		t4 = questions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-ed-chat text-ed-muted-foreground/70",
			children: [
				"Question ",
				index + 1,
				" of ",
				questions.length
			]
		});
		$[4] = index;
		$[5] = questions.length;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== current.question) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-ed-chat font-medium text-ed-foreground",
			children: current.question
		});
		$[7] = current.question;
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== t4 || $[10] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-0.5 px-3 pt-2.5 pb-2",
			children: [t4, t5]
		});
		$[9] = t4;
		$[10] = t5;
		$[11] = t6;
	} else t6 = $[11];
	const t7 = "flex flex-col divide-y divide-ed-border border-t border-ed-border";
	const t8 = current.options.map((option, i_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => advance(option.label),
		className: "group flex w-full cursor-default items-start gap-2.5 px-3 py-2 text-left last:rounded-b-lg hover:bg-ed-accent focus-visible:bg-ed-accent focus-visible:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ed-chat font-medium leading-5 text-ed-foreground",
				children: option.label
			}), option.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ed-chat leading-[1.45] text-pretty text-ed-muted-foreground",
				children: option.description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {
			width: 12,
			height: 12,
			"aria-hidden": true,
			className: "mt-1 shrink-0 text-ed-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
		})]
	}, i_0));
	let t9;
	if ($[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: optionsRef,
			className: t7,
			children: t8
		});
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== t6 || $[15] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			children: [t6, t9]
		});
		$[14] = t6;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	return t10;
}
function getCompletedToolParts(item) {
	const name = getBaseToolName(item.name || "");
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
	if (name === "canvas_read" || name === "readcanvas") return {
		verb: "Read",
		target: input.element_id ? "element" : "canvas"
	};
	if (/(write|edit|update|insert|replace|copy)/.test(name)) return {
		verb: "Edited",
		target: shortPath || input.project_path || input.element_id || "a file"
	};
	if (/(delete)/.test(name)) return {
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
	return { verb: getToolActivityLabel(item.name || "Tool", input).replace(/\.\.\.$/, "") };
}
function ToolActivityRow$1(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { item } = t0;
	let t1;
	let target;
	let verb;
	if ($[0] !== item) {
		const name = getBaseToolName(item.name || "");
		({verb, target} = getCompletedToolParts(item));
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
function FileWriteStreamPreview$1(t0) {
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
			className: `max-h-36 overflow-auto px-2 py-1.5 font-mono text-[11px] leading-4 text-ed-foreground/70 ${WRAP_ANYWHERE_CLASS$1}`,
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
function ToolActivityGroup$1(t0) {
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
		t2 = () => setOpen(_temp2$26);
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== category || $[2] !== items.length) {
		t3 = getToolCategoryLabel(category, items.length);
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
			children: items.map(_temp3$20)
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
/** Time since `startedAt`, ticking once a second in this leaf rather than in the panel. */
function _temp3$20(item, index) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolActivityRow$1, { item }, index);
}
function _temp2$26(prev) {
	return !prev;
}
function WorkElapsed(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { startedAt, children } = t0;
	const [elapsedMs, setElapsedMs] = (0, import_react.useState)(0);
	let t1;
	let t2;
	if ($[0] !== startedAt) {
		t1 = () => {
			const updateElapsed = () => setElapsedMs(startedAt ? Date.now() - startedAt : 0);
			updateElapsed();
			const timer = window.setInterval(updateElapsed, 1e3);
			return () => window.clearInterval(timer);
		};
		t2 = [startedAt];
		$[0] = startedAt;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[3] !== children || $[4] !== elapsedMs) {
		t3 = children(elapsedMs);
		$[3] = children;
		$[4] = elapsedMs;
		$[5] = t3;
	} else t3 = $[5];
	return t3;
}
/** True once `ms` have passed since `since`; re-armed whenever `since` changes. */
function useTimePassed(since, ms) {
	const $ = (0, import_compiler_runtime.c)(4);
	const [passedSince, setPassedSince] = (0, import_react.useState)(null);
	let t0;
	let t1;
	if ($[0] !== ms || $[1] !== since) {
		t0 = () => {
			if (since === void 0) return;
			const timer = window.setTimeout(() => setPassedSince(since), since + ms - Date.now());
			return () => window.clearTimeout(timer);
		};
		t1 = [since, ms];
		$[0] = ms;
		$[1] = since;
		$[2] = t0;
		$[3] = t1;
	} else {
		t0 = $[2];
		t1 = $[3];
	}
	(0, import_react.useEffect)(t0, t1);
	return since !== void 0 && passedSince === since;
}
/** Collapsed activity accordion for saved messages */
function SavedActivityAccordion$1(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { activity: allActivity, durationMs, startedAt: t1, active: t2, fileWriteStream, thinking } = t0;
	const startedAt = t1 === void 0 ? null : t1;
	const active = t2 === void 0 ? false : t2;
	const activity = allActivity.filter(_temp4$20);
	const [open, setOpen] = (0, import_react.useState)(active);
	const [wasActive, setWasActive] = (0, import_react.useState)(active);
	if (wasActive !== active) {
		setWasActive(active);
		setOpen(active);
	}
	const thoughts = getThoughtSegments(activity);
	const groupedTools = groupCompletedTools(activity);
	const summary = getCompletedActivitySummary(activity);
	const pendingTool = active ? [...activity].reverse().find(_temp5$18) : void 0;
	let t3;
	if ($[0] !== durationMs) {
		t3 = durationMs ? formatWorkDuration(durationMs) : "";
		$[0] = durationMs;
		$[1] = t3;
	} else t3 = $[1];
	const duration = t3;
	let t4;
	if ($[2] !== active || $[3] !== duration || $[4] !== startedAt) {
		t4 = active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkElapsed, {
			startedAt,
			children: _temp6$13
		}) : duration ? `Worked for ${duration}` : "Worked";
		$[2] = active;
		$[3] = duration;
		$[4] = startedAt;
		$[5] = t4;
	} else t4 = $[5];
	const label = t4;
	const writePreview = fileWriteStream?.content ? fileWriteStream : pendingTool && isFileWriteActivity(pendingTool.name) && typeof pendingTool.input?.content === "string" ? {
		path: String(pendingTool.input.file_path || pendingTool.input.path || "file"),
		content: pendingTool.input.content
	} : null;
	const t5 = "min-w-0 text-ed-chat leading-normal";
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => setOpen(_temp7$11);
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] !== label) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label });
		$[7] = label;
		$[8] = t7;
	} else t7 = $[8];
	const t8 = open && "rotate-90";
	let t9;
	if ($[9] !== t8) {
		t9 = cn$2("size-2.5 shrink-0 transition-transform", t8);
		$[9] = t8;
		$[10] = t9;
	} else t9 = $[10];
	let t10;
	if ($[11] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, {
			width: 10,
			height: 10,
			className: t9
		});
		$[11] = t9;
		$[12] = t10;
	} else t10 = $[12];
	let t11;
	if ($[13] !== t10 || $[14] !== t7) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			onClick: t6,
			variant: "ghost",
			size: "text",
			isChildText: false,
			className: "flex min-h-6.5 w-fit select-none gap-1 bg-transparent! text-ed-chat leading-[1.5] text-ed-muted-foreground/55 hover:bg-transparent! hover:text-ed-muted-foreground/80 active:bg-transparent!",
			children: [t7, t10]
		});
		$[13] = t10;
		$[14] = t7;
		$[15] = t11;
	} else t11 = $[15];
	const t12 = summary && !open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5 text-ed-chat leading-5 text-ed-muted-foreground/70",
		children: summary
	});
	const t13 = active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex min-h-5 items-center gap-1.5 text-ed-chat leading-5 text-ed-muted-foreground",
		children: [(pendingTool || thinking) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			width: 11,
			height: 11,
			className: "shrink-0 animate-spin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: pendingTool ? getToolActivityLabel(pendingTool.name || "Tool", pendingTool.input) : thinking ? "Thinking…" : ""
		})]
	});
	const t14 = active && writePreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileWriteStreamPreview$1, {
			path: writePreview.path,
			content: writePreview.content
		})
	});
	const t15 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex min-w-0 flex-col gap-2 border-l border-ed-border pl-3",
		children: [thoughts.map(_temp8$9), Object.entries(groupedTools).filter(_temp9$7).map((t16) => {
			const [category, items_0] = t16;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolActivityGroup$1, {
				category,
				items: items_0,
				defaultOpen: active
			}, category);
		})]
	});
	let t17;
	if ($[16] !== t11 || $[17] !== t12 || $[18] !== t13 || $[19] !== t14 || $[20] !== t15) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t5,
			children: [
				t11,
				t12,
				t13,
				t14,
				t15
			]
		});
		$[16] = t11;
		$[17] = t12;
		$[18] = t13;
		$[19] = t14;
		$[20] = t15;
		$[21] = t17;
	} else t17 = $[21];
	return t17;
}
function _temp9$7(t0) {
	const [, items] = t0;
	return items.length > 0;
}
function _temp8$9(thought, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-ed-chat text-ed-muted-foreground/70",
			children: "Thought"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-ed-chat leading-[1.65] text-ed-foreground/80 ${WRAP_ANYWHERE_CLASS$1}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMarkdown, { children: thought })
		})]
	}, i);
}
function _temp7$11(prev) {
	return !prev;
}
function _temp6$13(elapsedMs) {
	return `Working…${elapsedMs ? ` ${formatWorkDuration(elapsedMs)}` : ""}`;
}
function _temp5$18(item_0) {
	return item_0.type === "tool" && item_0.pending === true;
}
function _temp4$20(item) {
	return !isBookkeepingItem(item);
}
function SequentialAssistantActivity$1(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { activity, durationMs, startedAt, active: t1, fileWriteStream, thinking } = t0;
	const active = t1 === void 0 ? false : t1;
	let blocks;
	let t2;
	if ($[0] !== activity) {
		blocks = [];
		for (const item of activity.filter(_temp0$6)) if (item.type === "text") {
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
		t2 = blocks.reduce(_temp1$6, -1);
		$[0] = activity;
		$[1] = blocks;
		$[2] = t2;
	} else {
		blocks = $[1];
		t2 = $[2];
	}
	const lastWorkIndex = t2;
	let t3;
	if ($[3] !== active || $[4] !== blocks || $[5] !== durationMs || $[6] !== fileWriteStream || $[7] !== lastWorkIndex || $[8] !== startedAt || $[9] !== thinking) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: blocks.map((block_0, index_0) => block_0.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `min-w-0 max-w-full text-ed-chat font-normal leading-[1.65] text-ed-foreground/80 ${WRAP_ANYWHERE_CLASS$1}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMarkdown, { children: block_0.text })
			}, index_0) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedActivityAccordion$1, {
				activity: block_0.items,
				durationMs: index_0 === lastWorkIndex ? durationMs : void 0,
				startedAt,
				active: active && index_0 === lastWorkIndex,
				fileWriteStream: active && index_0 === lastWorkIndex ? fileWriteStream : null,
				thinking: active && index_0 === lastWorkIndex ? thinking : false
			}, index_0))
		});
		$[3] = active;
		$[4] = blocks;
		$[5] = durationMs;
		$[6] = fileWriteStream;
		$[7] = lastWorkIndex;
		$[8] = startedAt;
		$[9] = thinking;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
function _temp1$6(lastIndex, block, index) {
	return block.type === "work" ? index : lastIndex;
}
function _temp0$6(entry) {
	return !isBookkeepingItem(entry);
}
function ToolResultBadge$1(t0) {
	const $ = (0, import_compiler_runtime.c)(42);
	const { result, store, onSelect, chatId, onTroubleshoot, onFeedback } = t0;
	const payload = result.payload;
	const clickableId = result.createdElementId || result.createdElementIds?.[0] || (result.type === "replace_with_component" ? payload.elementId : void 0);
	let t1;
	if ($[0] !== chatId || $[1] !== clickableId || $[2] !== onFeedback || $[3] !== onSelect || $[4] !== onTroubleshoot || $[5] !== payload.actionCount || $[6] !== payload.componentName || $[7] !== payload.componentRegistered || $[8] !== payload.elements?.length || $[9] !== payload.error || $[10] !== payload.files?.length || $[11] !== payload.path || $[12] !== payload.success || $[13] !== result || $[14] !== store) {
		const element = clickableId ? getById(store, clickableId) : null;
		const canNavigate = !!element && result.type !== "delete_element";
		const isComponent = !!payload.componentRegistered || element?.type === "component" || result.type === "replace_with_component";
		const isCanvasElement = [
			"add_jsx",
			"duplicate_element",
			"update_jsx",
			"delete_element",
			"replace_with_component"
		].includes(result.type);
		const hasError = !!payload.error || payload.success === false;
		const actionColor = hasError || result.type === "delete_element" || result.type === "Delete" ? "text-ed-destructive" : [
			"add_jsx",
			"duplicate_element",
			"update_jsx",
			"Write",
			"Edit"
		].includes(result.type) ? "text-ed-success" : "text-ed-muted-foreground";
		let t2;
		if ($[16] !== actionColor) {
			t2 = cn$2("size-3.5 shrink-0", actionColor);
			$[16] = actionColor;
			$[17] = t2;
		} else t2 = $[17];
		const actionIconClass = t2;
		let t3;
		if ($[18] !== actionIconClass || $[19] !== hasError || $[20] !== payload.componentRegistered || $[21] !== result.type) {
			t3 = () => {
				if (hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
					width: 14,
					height: 14,
					className: actionIconClass
				});
				switch (result.type) {
					case "add_jsx": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "duplicate_element": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "update_jsx": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CursorIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "delete_element":
					case "Delete": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrashIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "replace_with_component": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowClockwiseIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "Read": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "Write": return payload.componentRegistered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "Edit": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "LS": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpenIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					case "Glob": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
					default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {
						width: 14,
						height: 14,
						className: actionIconClass
					});
				}
			};
			$[18] = actionIconClass;
			$[19] = hasError;
			$[20] = payload.componentRegistered;
			$[21] = result.type;
			$[22] = t3;
		} else t3 = $[22];
		const getIcon = t3;
		const getLabel = () => {
			if (result.type === "add_jsx" || result.type === "duplicate_element") {
				const count = result.createdElementIds?.length || payload.actionCount || payload.elements?.length || 1;
				if (count > 1) return `${count} elements`;
				return element ? getElementLabel(element) : "Element";
			}
			if (result.type === "update_jsx") return element ? getElementLabel(element) : "Element";
			if (result.type === "delete_element") return "Element";
			if (result.type === "replace_with_component") return element ? getElementLabel(element) : payload.componentName || "Component";
			if (result.type === "Read") return payload.path || "file";
			if (result.type === "Write" || result.type === "Edit" || result.type === "Delete") {
				if (payload.componentRegistered) return element ? getElementLabel(element) : payload.componentName;
				return (payload.path || "file").split("/").slice(-2).join("/");
			}
			if (result.type === "LS") return payload.path || ".";
			if (result.type === "Glob") return `${payload.files?.length || 0} files`;
			return "Action";
		};
		let t4;
		if ($[23] !== hasError || $[24] !== payload.componentRegistered || $[25] !== payload.success || $[26] !== result.type) {
			t4 = () => {
				if (hasError) switch (result.type) {
					case "add_jsx": return "Add failed";
					case "duplicate_element": return "Duplicate failed";
					case "update_jsx": return "Update failed";
					case "delete_element":
					case "Delete": return "Delete failed";
					case "replace_with_component": return "Replace failed";
					case "Read": return "Read failed";
					case "Write": return "Write failed";
					case "Edit": return "Edit failed";
					case "LS": return "List failed";
					case "Glob": return "Search failed";
					default: return "Failed";
				}
				switch (result.type) {
					case "add_jsx": return "Added";
					case "duplicate_element": return "Duplicated";
					case "update_jsx": return "Updated";
					case "delete_element": return "Deleted";
					case "replace_with_component": return "Replaced";
					case "Read": return "Reading";
					case "Write": return payload.componentRegistered ? "Added" : payload.success ? "Wrote" : "Failed";
					case "Edit": return payload.success ? "Edited" : "Failed";
					case "Delete": return payload.success ? "Deleted file" : "Failed";
					case "LS": return "Listed";
					case "Glob": return "Found";
					default: return "";
				}
			};
			$[23] = hasError;
			$[24] = payload.componentRegistered;
			$[25] = payload.success;
			$[26] = result.type;
			$[27] = t4;
		} else t4 = $[27];
		const getAction = t4;
		let t5;
		if ($[28] !== getIcon) {
			t5 = getIcon();
			$[28] = getIcon;
			$[29] = t5;
		} else t5 = $[29];
		const t6 = getAction();
		let t7;
		if ($[30] !== t5 || $[31] !== t6) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex shrink-0 items-center gap-1.5 border-r border-ed-border py-1 pl-1 pr-2 text-ed-chat leading-4 text-ed-muted-foreground",
				children: [t5, t6]
			});
			$[30] = t5;
			$[31] = t6;
			$[32] = t7;
		} else t7 = $[32];
		const action = t7;
		const t8 = hasError && "text-ed-destructive";
		let t9;
		if ($[33] !== t8) {
			t9 = cn$2("flex w-fit min-w-0 max-w-full items-stretch overflow-hidden rounded-[5px] border border-ed-border bg-transparent", t8);
			$[33] = t8;
			$[34] = t9;
		} else t9 = $[34];
		let t10;
		if ($[35] !== action || $[36] !== chatId || $[37] !== hasError || $[38] !== onFeedback || $[39] !== onTroubleshoot || $[40] !== result) {
			t10 = hasError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolFailureDetails, {
				report: toolFailureReport(result, chatId),
				onTroubleshoot,
				onFeedback,
				children: action
			}) : action;
			$[35] = action;
			$[36] = chatId;
			$[37] = hasError;
			$[38] = onFeedback;
			$[39] = onTroubleshoot;
			$[40] = result;
			$[41] = t10;
		} else t10 = $[41];
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "tool-result",
			className: t9,
			children: [t10, isCanvasElement || isComponent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
				variant: "segment",
				element,
				label: getLabel(),
				component: isComponent,
				title: result.type === "delete_element" ? "This element was deleted" : void 0,
				onClick: canNavigate && clickableId ? () => onSelect(clickableId) : void 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChip, {
				variant: "segment",
				icon: FileCodeIcon,
				label: getLabel()
			})]
		});
		$[0] = chatId;
		$[1] = clickableId;
		$[2] = onFeedback;
		$[3] = onSelect;
		$[4] = onTroubleshoot;
		$[5] = payload.actionCount;
		$[6] = payload.componentName;
		$[7] = payload.componentRegistered;
		$[8] = payload.elements?.length;
		$[9] = payload.error;
		$[10] = payload.files?.length;
		$[11] = payload.path;
		$[12] = payload.success;
		$[13] = result;
		$[14] = store;
		$[15] = t1;
	} else t1 = $[15];
	return t1;
}
/** Collapse implementation noise into one useful row per file or canvas action. */
function getDisplayToolResults$1(results, store) {
	const fileResults = /* @__PURE__ */ new Map();
	const canvasResults = /* @__PURE__ */ new Map();
	const otherResults = /* @__PURE__ */ new Map();
	const componentIdsByName = /* @__PURE__ */ new Map();
	const pairedComponentIds = /* @__PURE__ */ new Set();
	for (const result of results) {
		const ids = [...result.createdElementIds || [], ...result.createdElementId ? [result.createdElementId] : []];
		for (const id of ids) {
			const element = getById(store, id);
			if (element?.type === "component") componentIdsByName.set(element.componentName, id);
			if (element?.type === "capture") componentIdsByName.set(element.original.componentName, id);
		}
	}
	for (const result of results) {
		const componentMatch = typeof result.payload?.path === "string" ? result.payload.path.match(/(?:^|\/)components?\/([^/]+?)\.(?:tsx|jsx|ts|js)$/i) : null;
		const componentId = componentMatch ? componentIdsByName.get(componentMatch[1]) : void 0;
		if (componentId) pairedComponentIds.add(componentId);
	}
	for (const result of results) {
		if (result.payload.error || result.payload.success === false) {
			otherResults.set(`failed:${otherResults.size}`, result);
			continue;
		}
		if ([
			"Write",
			"Edit",
			"Delete",
			"Read"
		].includes(result.type)) {
			const key = result.payload?.path || `${result.type}:${fileResults.size}`;
			const componentName = (typeof result.payload?.path === "string" ? result.payload.path.match(/(?:^|\/)components?\/([^/]+?)\.(?:tsx|jsx|ts|js)$/i) : null)?.[1];
			const componentId = componentName ? componentIdsByName.get(componentName) : void 0;
			fileResults.set(key, componentName ? {
				...result,
				payload: {
					...result.payload,
					componentRegistered: true,
					componentName
				},
				createdElementId: componentId || result.createdElementId
			} : result);
			continue;
		}
		if ([
			"add_jsx",
			"duplicate_element",
			"update_jsx",
			"delete_element",
			"replace_with_component"
		].includes(result.type)) {
			const resultIds = [...result.createdElementIds || [], ...result.createdElementId ? [result.createdElementId] : []];
			const remainingIds = resultIds.filter((id) => !pairedComponentIds.has(id));
			if ((result.type === "add_jsx" || result.type === "duplicate_element") && resultIds.length > 0 && remainingIds.length === 0) continue;
			const displayResult = remainingIds.length === resultIds.length ? result : {
				...result,
				createdElementId: remainingIds[0],
				createdElementIds: remainingIds
			};
			const resultKey = `${displayResult.type}:${displayResult.payload.error || displayResult.payload.success === false ? "failed" : "success"}`;
			const previous = canvasResults.get(resultKey);
			if (!previous) {
				canvasResults.set(resultKey, {
					...displayResult,
					payload: {
						...displayResult.payload,
						actionCount: 1
					},
					createdElementIds: displayResult.createdElementIds ? [...displayResult.createdElementIds] : void 0
				});
				continue;
			}
			const ids = /* @__PURE__ */ new Set([
				...previous.createdElementIds || [],
				...previous.createdElementId ? [previous.createdElementId] : [],
				...displayResult.createdElementIds || [],
				...displayResult.createdElementId ? [displayResult.createdElementId] : []
			]);
			canvasResults.set(resultKey, {
				...previous,
				payload: {
					...previous.payload,
					actionCount: (previous.payload?.actionCount || 1) + 1
				},
				createdElementIds: ids.size ? Array.from(ids) : void 0
			});
			continue;
		}
		const key = `${result.type}:${result.payload?.path || result.payload?.elementId || otherResults.size}`;
		otherResults.set(key, result);
	}
	return [
		...fileResults.values(),
		...canvasResults.values(),
		...otherResults.values()
	];
}
function ScreenshotChips$1(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { screenshots, onOpen } = t0;
	if (!screenshots.length) return null;
	let t1;
	if ($[0] !== onOpen || $[1] !== screenshots) {
		let t2;
		if ($[3] !== onOpen || $[4] !== screenshots.length) {
			t2 = (shot, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageContextChip, {
				src: shot.dataUrl,
				label: screenshots.length === 1 ? "Screenshot" : `Screenshot ${index + 1}`,
				onClick: () => onOpen(shot.dataUrl)
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
/** v2 tabs persist AI SDK `{ parts, metadata }` instead of v1 `content` / `inlineRefs`. */
function persistedChatMessage(message) {
	const v2 = message;
	return {
		content: typeof message.content === "string" ? message.content : Array.isArray(v2.parts) ? v2.parts.filter((part) => part?.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n") : "",
		refs: message.inlineRefs ?? v2.metadata?.inlineRefs ?? [],
		mentions: message.referenceMentions ?? v2.metadata?.referenceMentions
	};
}
function UserMessage$1(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { message, store, variant, onSelectElement } = t0;
	let t1;
	let t2;
	let t3;
	if ($[0] !== message || $[1] !== onSelectElement || $[2] !== store || $[3] !== variant) {
		const { content: storedContent, refs, mentions } = persistedChatMessage(message);
		const content = commentChatDisplayText(storedContent);
		const { parts, remaining } = splitInlineChatReferences(content, refs, mentions);
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
				className: cn$2(`min-w-0 max-w-full whitespace-pre-wrap text-ed-chat ${WRAP_ANYWHERE_CLASS$1}`, variant === "sidebar-v2" ? "leading-[1.5] text-ed-foreground/80" : "leading-[1.55] text-ed-foreground"),
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
/**
* Saved messages. Memoized so the panel's own renders (composer, run state,
* selection) skip it: it re-renders when the messages or the store change.
*/
var ChatTranscript = (0, import_react.memo)(function ChatTranscript({ messages, ...props }) {
	return messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TranscriptMessage, {
		msg,
		...props
	}, msg.id));
});
function TranscriptMessage(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { msg, store, variant, activeChatId, onSelectElement, onFeedback, onTroubleshoot, onOpenScreenshot } = t0;
	let t1;
	if ($[0] !== msg.toolResults || $[1] !== store) {
		t1 = msg.toolResults && msg.toolResults.length > 0 ? getDisplayToolResults$1(msg.toolResults, store) : [];
		$[0] = msg.toolResults;
		$[1] = store;
		$[2] = t1;
	} else t1 = $[2];
	const displayToolResults = t1;
	let t2;
	if ($[3] !== msg) {
		t2 = msg.role === "assistant" ? persistedChatMessage(msg).content : "";
		$[3] = msg;
		$[4] = t2;
	} else t2 = $[4];
	const assistantText = t2;
	const t3 = `flex min-w-0 max-w-full gap-2.5 ${msg.role === "user" ? "flex-row-reverse items-center justify-between" : "items-start"}`;
	let t4;
	if ($[5] !== activeChatId || $[6] !== assistantText || $[7] !== displayToolResults || $[8] !== msg || $[9] !== onFeedback || $[10] !== onOpenScreenshot || $[11] !== onSelectElement || $[12] !== onTroubleshoot || $[13] !== store || $[14] !== variant) {
		t4 = msg.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMessage$1, {
			message: msg,
			store,
			variant,
			onSelectElement
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 max-w-full flex-col gap-3",
			children: [
				msg.activity?.some(_temp10$6) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequentialAssistantActivity$1, {
					activity: msg.activity,
					durationMs: msg.workDurationMs
				}) : msg.activity?.some(_temp11$6) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedActivityAccordion$1, {
					activity: msg.activity,
					durationMs: msg.workDurationMs
				}) : null,
				assistantText && !msg.activity?.some(_temp12$4) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `min-w-0 max-w-full text-ed-chat font-normal leading-[1.65] text-ed-foreground/80 ${WRAP_ANYWHERE_CLASS$1}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMarkdown, { children: assistantText })
				}),
				msg.screenshots && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenshotChips$1, {
					screenshots: msg.screenshots,
					onOpen: onOpenScreenshot
				}),
				msg.toolResults && msg.toolResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-0 max-w-full flex-col gap-2",
					children: displayToolResults.map((result, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolResultBadge$1, {
						store,
						result,
						onSelect: onSelectElement,
						chatId: activeChatId ?? void 0,
						onFeedback,
						onTroubleshoot
					}, i))
				})
			]
		});
		$[5] = activeChatId;
		$[6] = assistantText;
		$[7] = displayToolResults;
		$[8] = msg;
		$[9] = onFeedback;
		$[10] = onOpenScreenshot;
		$[11] = onSelectElement;
		$[12] = onTroubleshoot;
		$[13] = store;
		$[14] = variant;
		$[15] = t4;
	} else t4 = $[15];
	let t5;
	if ($[16] !== t3 || $[17] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-ph-mask": true,
			className: t3,
			children: t4
		});
		$[16] = t3;
		$[17] = t4;
		$[18] = t5;
	} else t5 = $[18];
	return t5;
}
/**
* Resolve a `sourceInfo.filePath` against the captured page's project root.
*
* Source maps from different bundler/monorepo combos emit paths with
* different anchors:
*  - Vite, plain Next-Turbopack → already absolute (`/Users/.../src/foo.tsx`)
*  - Next + webpack → `./src/foo.tsx` relative to webpack rootDir
*  - Nx + Next + webpack → `../../libs/foo.tsx` (escapes the app root into
*     workspace `libs/`)
*
* `root` should be the WEBPACK ROOTDIR (where `next dev` runs from), not
* the workspace root — that's what `./` and `../` resolve from. The capture
* pipeline auto-detects this when possible (`detectProjectRoot`); when it
* falls back to the manual picker, we trust the user's pick as the anchor.
*
* Already-absolute paths pass through unchanged.
*/
function _temp12$4(item_1) {
	return item_1.type === "text";
}
function _temp11$6(item) {
	return !isBookkeepingItem(item);
}
function _temp10$6(item_0) {
	return item_0.type === "text";
}
function resolveAgainstRoot$1(filePath, root) {
	if (!filePath) return filePath;
	if (root && filePath.startsWith(root + "/")) return filePath;
	if (isLikelyFilesystemPath$1(filePath)) return filePath;
	if (!root) return filePath;
	let rel = filePath;
	if (rel.startsWith("/")) rel = rel.slice(1);
	if (rel.startsWith("./")) rel = rel.slice(2);
	let base = root.replace(/[\\/]+$/, "");
	while (rel.startsWith("../")) {
		rel = rel.slice(3);
		const slash = Math.max(base.lastIndexOf("/"), base.lastIndexOf("\\"));
		if (slash <= 0) break;
		base = base.slice(0, slash);
	}
	return `${base}/${rel}`;
}
/**
* Mirrors `isLikelyFilesystemPath` in `fiberExtract.ts`. Duplicated here to
* avoid importing the whole capture-utils module just for one regex.
*/
function isLikelyFilesystemPath$1(p) {
	if (!p) return false;
	if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
	return /^\/(?:Users|home|root|opt|srv|usr|var|tmp|private|Volumes|mnt|data)\//.test(p);
}
/**
* Prompt behind every "Import design system" entry point. The chat card and the
* onboarding CTA send it as-is (the agent asks which folder to read when none is
* shared yet); the Components panel prefills it so the user can name the path.
*/
var IMPORT_DESIGN_SYSTEM_PROMPT = "Import my design system from my local codebase (colours, typography, spacing, icons and components) into this file.";
/**
* Whether a message starts a design-system import: the chat card and the shell
* send `IMPORT_DESIGN_SYSTEM_PROMPT`, the desktop source chooser names the
* picked folder ("Import the design system from /path …"), or the user typed
* it themselves. A question about importing ("How do I import a design
* system?") is not a request to run one.
*/
function isImportDesignSystemPrompt(text) {
	return /\bimport\b/i.test(text) && /design system/i.test(text) && !/^\s*(how|what|why|where|when|which|is|are|do|does|should)\b/i.test(text);
}
/**
* The chat's primary empty-state call to action: importing your design system is
* the first thing to do in a new file. Sends the prompt straight away.
*/
function ImportDesignSystemCard(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { onImport } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDesignSystemIllustration, { className: "rounded-none border-0 border-b border-ed-border bg-ed-background px-3 py-4" });
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				weight: "medium",
				variant: "primary",
				children: "Import your design system"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "tertiary",
				className: "text-pretty",
				children: "Import your styles and components with the same variants and props they have in code."
			})]
		});
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== onImport) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-64 flex-col overflow-hidden rounded-lg border border-ed-border bg-ed-card",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 p-3",
				children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "outline",
					className: "w-full",
					onClick: onImport,
					children: "Import"
				})]
			})]
		});
		$[2] = onImport;
		$[3] = t3;
	} else t3 = $[3];
	return t3;
}
/** Compact chat list date: relative for recent, short date otherwise. */
function formatChatDate(dateStr) {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "";
	const diffMs = Date.now() - d.getTime();
	const diffMin = Math.floor(diffMs / 6e4);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHrs = Math.floor(diffMin / 60);
	if (diffHrs < 24) return `${diffHrs}h ago`;
	const diffDays = Math.floor(diffHrs / 24);
	if (diffDays < 7) return `${diffDays}d ago`;
	return d.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
/** "mcp__notion__notion-create-pages" → "notion: notion-create-pages"; built-in tools keep their name. */
function describeApprovalTool$1(toolName) {
	const m = /^mcp__(.+?)__(.+)$/.exec(toolName);
	if (!m) return toolName;
	return `${m[1].split(":").pop() ?? m[1]}: ${m[2]}`;
}
function summarizeApprovalArgs$1(toolName, args) {
	if (toolName === "Bash" && typeof args?.command === "string") return args.command;
	let text;
	try {
		text = JSON.stringify(args ?? {}, null, 1);
	} catch {
		text = String(args);
	}
	return text.length > 400 ? `${text.slice(0, 400)}…` : text;
}
async function runChatStream(deps) {
	const { store, componentIndex, iconLibraryNames, selectedElementIds, refs, fromComment, activeTabInfo, focusedComponent, activeChatId, messages: newMessages, submitModel, selectedEffort, backend, resolveAsset, onPlanLimit, onProjectFilesEdited, run, abortController, thinkingOffsetRef, streamingContentRef, autoApproveRef, cliMessageCountRef, workStartedAtRef, activityTimelineRef, streamingScreenshotsRef, setActivityTimeline, setStreamingScreenshots, setThinking, setFileWriteStream, setPendingApprovals, setFolderAccessRequest, setError } = deps;
	const toolResultsWithIds = [];
	try {
		const attachedElements = refs.filter((r) => r.type === "element").map((r) => {
			if (!getById(store, r.id)) return null;
			return {
				id: r.id,
				el: storeSubtreeToLegacyNested(store, r.id)
			};
		}).filter((p) => p !== null);
		const inlineRefsForContext = refs.flatMap((r) => r.type === "connection" || r.type === "folder" || r.type === "component" || r.type === "page" ? [] : [{
			type: r.type,
			id: r.id,
			name: r.name,
			data: r.data,
			elementKind: r.elementKind
		}]);
		if (attachedElements.length > 0) {
			const shotResults = await Promise.all(attachedElements.filter(({ el }) => el.type !== "webview").slice(0, 3).map(async ({ id }) => {
				const dataUrl = await captureElementScreenshot$1(id);
				return dataUrl ? {
					id,
					dataUrl
				} : null;
			}));
			for (const shot of shotResults) {
				if (!shot) continue;
				const imgId = `ref-shot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
				inlineRefsForContext.push({
					type: "image",
					id: imgId,
					name: `Screenshot of referenced element ${shot.id}`,
					data: shot.dataUrl
				});
			}
			const imageUrls = [];
			for (const { id } of attachedElements) imageUrls.push(...extractImageUrlsFromSubtree$1(store, id, resolveAsset));
			const imageResults = await Promise.all(imageUrls.slice(0, 5).map(async ({ url, name }) => {
				const dataUrl = await fetchImageAsDataUrl$1(url);
				return dataUrl ? {
					name,
					dataUrl
				} : null;
			}));
			for (const result of imageResults) if (result) {
				const imgId = `canvas-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
				inlineRefsForContext.push({
					type: "image",
					id: imgId,
					name: result.name,
					data: result.dataUrl
				});
			}
		}
		const chatMessages = newMessages.flatMap((m) => {
			if (!m.content && m.role !== "user" && !m.toolResults) return [];
			let content = (m.role === "user" ? m.agentContext ?? m.content : m.content) || "";
			if (m.role === "assistant" && m.toolResults && m.toolResults.length > 0) {
				const actionLines = m.toolResults.map((r) => {
					const id = r.createdElementId || r.createdElementIds?.[0] || r.payload?.elementId || "";
					if (r.type === "add_jsx") return `  → Added: ${r.createdElementIds?.join(", ") || id || "element"}`;
					if (r.type === "duplicate_element") return `  → Duplicated: ${r.createdElementIds?.join(", ") || id || "element"}`;
					if (r.type === "update_jsx") return `  → Updated: ${r.payload?.elementId || id}`;
					if (r.type === "delete_element") return `  → Deleted: ${r.payload?.elementId || id}`;
					if (r.type === "replace_with_component") return `  → Replaced ${r.payload?.elementId} with ${r.payload?.componentName}`;
					if (r.type === "Read") return `  → Read: ${r.payload?.path}`;
					if (r.type === "Write") return `  → Wrote: ${r.payload?.path}${r.payload?.componentRegistered ? ` (registered ${r.payload.componentName})` : ""}`;
					if (r.type === "Glob") return `  → Found: ${r.payload?.matches?.length || 0} files`;
					return null;
				}).filter(Boolean);
				if (actionLines.length > 0) content = (content || "") + "\n[Actions]\n" + actionLines.join("\n");
				if (!content) content = "[Applied changes]\n" + actionLines.join("\n");
			}
			if (m.role === "user" && m.inlineRefs && m.inlineRefs.length > 0) {
				content = inlineChatPrompt(content, m.inlineRefs, m.referenceMentions);
				const refLines = [];
				const connectionNames = [];
				for (const ref of m.inlineRefs) {
					const projectLine = projectReferenceLine(ref);
					if (projectLine) refLines.push(projectLine);
					else if (ref.type === "connection") connectionNames.push(ref.name);
					else if (ref.type === "element") refLines.push(`  → Element: ${ref.name} (${ref.id})`);
					else if (ref.type === "folder") refLines.push(`  → Folder (this request only): ${JSON.stringify(ref.path)}`);
					else if (ref.type === "image") refLines.push(`  → Image: ${ref.name}`);
					else refLines.push(`  → File: ${ref.name}`);
				}
				if (refLines.length > 0) content += "\n[References]\n" + refLines.join("\n");
				content += buildConnectionPrompt(connectionNames);
			}
			return content ? [{
				role: m.role,
				content
			}] : [];
		});
		let fullText = "";
		let lastResponseText = "";
		let finalResponseText;
		if (backend) {
			const generator = backend.chat(chatMessages, [], {
				elements: toWire(store),
				componentIndex,
				attachedElements: attachedElements.length > 0 ? attachedElements.map((p) => p.el) : void 0,
				iconLibraryNames,
				model: submitModel,
				effort: resolveClaudeEffort(submitModel, selectedEffort),
				selectedElementIds: fromComment ? refs.filter((ref) => ref.type === "element").map((ref) => ref.id) : Array.from(selectedElementIds),
				inlineRefs: inlineRefsForContext,
				promptFolders: refs.flatMap((ref) => ref.type === "folder" && ref.path ? [ref.path] : []),
				activeTabInfo: fromComment ? refs.filter((ref) => ref.type === "page").map((ref) => ({
					id: ref.id,
					name: ref.name
				}))[0] : activeTabInfo,
				focusedComponent: fromComment ? void 0 : focusedComponent,
				autoApprove: autoApproveRef.current,
				cliMessageIndex: cliMessageCountRef.current,
				chatTabId: activeChatId,
				signal: abortController.signal
			});
			for await (const event of generator) {
				if (abortController.signal.aborted) throw new DOMException("Aborted", "AbortError");
				if (event.type === "final_text") finalResponseText = event.text;
				else if (event.type === "thinking") {
					lastResponseText = "";
					setThinking(true);
					const newText = event.text || "";
					setActivityTimeline((prev) => {
						const last = prev[prev.length - 1];
						const segment = newText.slice(thinkingOffsetRef.current);
						if (!segment) return prev;
						if (last?.type === "thinking") return [...prev.slice(0, -1), {
							type: "thinking",
							text: last.text + segment
						}];
						return [...prev, {
							type: "thinking",
							text: segment
						}];
					});
					thinkingOffsetRef.current = newText.length;
				} else if (event.type === "thinking_progress") {
					lastResponseText = "";
					setThinking(true);
				} else if (event.type === "text") {
					setThinking(false);
					fullText += event.text;
					lastResponseText += event.text;
					streamingContentRef.current = fullText;
					setActivityTimeline((prev) => {
						const last = prev[prev.length - 1];
						if (last?.type === "text") return [...prev.slice(0, -1), {
							type: "text",
							text: last.text + event.text
						}];
						return [...prev, {
							type: "text",
							text: event.text
						}];
					});
				} else if (event.type === "tool_use") {
					lastResponseText = "";
					thinkingOffsetRef.current = 0;
					setThinking(false);
					const path = event.input?.file_path || event.input?.path;
					const content = event.input?.content || event.input?.new_string;
					if (isFileWriteActivity(event.name) && typeof content === "string") setFileWriteStream({
						path: typeof path === "string" && path ? path : "file",
						content
					});
					setActivityTimeline((prev) => upsertPendingTool(prev, event));
				} else if (event.type === "tool_approval") {
					if (autoApproveRef.current && event.origin !== "cli" && !event.sensitive) {
						if (typeof window !== "undefined" && window.api?.invoke) window.api.invoke("mcp_tool_approval", {
							approvalId: event.approvalId,
							approved: true
						});
					} else setPendingApprovals((prev) => [...prev, {
						approvalId: event.approvalId,
						toolName: event.toolName,
						args: event.args,
						origin: event.origin ?? "petal",
						sensitive: event.sensitive
					}]);
				} else if (event.type === "folder_access_needed") setFolderAccessRequest((prev) => prev ? {
					ids: [...prev.ids, event.requestId],
					path: prev.path ?? event.path
				} : {
					ids: [event.requestId],
					path: event.path
				});
				else if (event.type === "mcp_tool_result") {
					if (isFileWriteActivity(event.name)) setFileWriteStream(null);
					setActivityTimeline((prev) => {
						const next = [...prev];
						for (let i = next.length - 1; i >= 0; i--) {
							const item = next[i];
							if (item.type === "tool" && item.pending === true && getBaseToolName(item.name || "") === getBaseToolName(event.name)) {
								next[i] = {
									...item,
									pending: false,
									input: {
										...item.input,
										...slimToolInput(event.args)
									}
								};
								return next;
							}
						}
						return prev;
					});
					if (event.reason && isPlanLimitReason(event.reason)) {
						const message = event.error || "This action is over the limit for your plan.";
						onPlanLimit?.({
							reason: event.reason,
							message
						});
						setError({
							code: "unknown",
							title: planLimitTitle(event.reason),
							message
						});
					}
					const badgeType = {
						project_write: "Write",
						project_write_batch: "Write",
						project_edit: "Edit",
						project_delete: "Delete",
						canvas_add: "add_jsx",
						canvas_update: "update_jsx",
						canvas_edit: "update_jsx",
						canvas_insert: "add_jsx",
						canvas_duplicate: "duplicate_element",
						canvas_delete: "delete_element"
					}[event.name];
					if (!badgeType) continue;
					const elementId = event.args?.element_id || "";
					const filePath = event.args?.file_path || elementId;
					const createdIds = event.createdElementIds;
					const firstCreatedId = createdIds?.[0] || elementId || void 0;
					toolResultsWithIds.push({
						type: badgeType,
						payload: {
							toolName: event.name,
							path: filePath,
							elementId: firstCreatedId || event.args?.parent_id,
							canvasId: event.args?.canvas_id ?? activeTabInfo?.id,
							success: event.success,
							...event.error ? { error: event.error } : {}
						},
						createdElementId: firstCreatedId,
						createdElementIds: createdIds
					});
					if (event.success) {
						if (event.name.startsWith("canvas_")) run.canvasWrites++;
						else run.codeWrites++;
					}
					if (event.success && onProjectFilesEdited && (event.name === "project_write" || event.name === "project_edit") && typeof event.args?.file_path === "string") onProjectFilesEdited([event.args.file_path]);
				} else if (event.type === "screenshot") setStreamingScreenshots((prev) => [...prev, {
					dataUrl: event.dataUrl,
					elementId: event.elementId
				}]);
				else if (event.type === "error") {
					setActivityTimeline([]);
					thinkingOffsetRef.current = 0;
					setStreamingScreenshots([]);
					setFileWriteStream(null);
					if (event.errorInfo) setError(event.errorInfo);
					else setError(classifyFrontendError(new Error(event.error)));
					run.outcome = "errored";
					return { completed: false };
				}
			}
		} else {
			setError(classifyFrontendError(/* @__PURE__ */ new Error("AI chat is not available — no backend configured")));
			return { completed: false };
		}
		if (abortController.signal.aborted) throw new DOMException("Aborted", "AbortError");
		const savedActivity = activityTimelineRef.current.length > 0 ? activityTimelineRef.current.map((item) => {
			if (item.type === "thinking") return {
				type: "thinking",
				text: item.text
			};
			if (item.type === "text") return {
				type: "text",
				text: item.text
			};
			return {
				type: "tool",
				name: item.name,
				input: slimToolInput(item.input),
				id: item.id
			};
		}) : void 0;
		const savedScreenshots = streamingScreenshotsRef.current.length > 0 ? [...streamingScreenshotsRef.current] : void 0;
		const savedToolResults = toolResultsWithIds.length > 0 ? getDisplayToolResults$1(toolResultsWithIds, store) : void 0;
		const finalText = streamingContentRef.current || fullText;
		streamingContentRef.current = "";
		setActivityTimeline([]);
		thinkingOffsetRef.current = 0;
		setStreamingScreenshots([]);
		setFileWriteStream(null);
		return {
			completed: true,
			assistantMessage: {
				id: generateMessageId(),
				role: "assistant",
				content: finalText,
				toolResults: savedToolResults,
				workTargets: chatWorkTargets(toolResultsWithIds),
				activity: savedActivity,
				workDurationMs: workStartedAtRef.current ? Date.now() - workStartedAtRef.current : void 0,
				screenshots: savedScreenshots
			},
			responseBody: finalResponseText ?? lastResponseText
		};
	} catch (err) {
		run.outcome = err instanceof DOMException && err.name === "AbortError" ? "cancelled" : "errored";
		if (err instanceof DOMException && err.name === "AbortError") {
			const partialText = streamingContentRef.current;
			const partialActivity = activityTimelineRef.current.length > 0 ? activityTimelineRef.current.map((item) => ({ ...item })) : void 0;
			const partialScreenshots = streamingScreenshotsRef.current.length > 0 ? [...streamingScreenshotsRef.current] : void 0;
			streamingContentRef.current = "";
			setActivityTimeline([]);
			thinkingOffsetRef.current = 0;
			setStreamingScreenshots([]);
			setFileWriteStream(null);
			if (partialText || partialActivity?.length) return {
				completed: false,
				assistantMessage: {
					id: generateMessageId(),
					role: "assistant",
					content: partialText,
					workTargets: chatWorkTargets(toolResultsWithIds),
					activity: partialActivity,
					screenshots: partialScreenshots,
					workDurationMs: workStartedAtRef.current ? Date.now() - workStartedAtRef.current : void 0
				}
			};
			return { completed: false };
		}
		setActivityTimeline([]);
		thinkingOffsetRef.current = 0;
		setStreamingScreenshots([]);
		setFileWriteStream(null);
		const errObj = err;
		if (errObj.errorInfo) setError(errObj.errorInfo);
		else setError(classifyFrontendError(err));
		return { completed: false };
	}
}
/** Last model the user picked, or the default. */
function readStoredModel() {
	try {
		return localStorage.getItem("petal-ai-model") || "claude-opus-4-8";
	} catch {
		return "claude-opus-4-8";
	}
}
/** Last reasoning effort the user picked, or `high`. */
function readStoredEffort() {
	try {
		const saved = localStorage.getItem("petal-ai-effort");
		if (saved && CLAUDE_EFFORT_LEVELS.includes(saved)) return saved;
		return "high";
	} catch {
		return "high";
	}
}
/** Auto-approve defaults to on; only an explicit `'0'` turns it off. */
function readStoredAutoApprove() {
	try {
		const saved = localStorage.getItem("petal-auto-approve");
		if (saved === null) return true;
		return saved === "1";
	} catch {
		return true;
	}
}
var ChatPanel = (0, import_react.forwardRef)(function ChatPanel(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(295);
	const { store, selectedElementIds, componentIndex, activeTabInfo, contextPages, focusedComponent, messages, onMessagesChange, onSelectElement, iconLibraryNames, activeChatId, chatList, onNewChat, onSwitchChat, onArchiveChat, onArchiveAllChats, onOpenArchivedChats, onStreamStart, onStreamEnd, onRunStart, onRunComplete, onProjectFilesEdited, onPlanLimit, onFeedback, chatColor, chatColors, onOpenProjectSettings, variant: t1, allowedPaths, onAddAllowedPath, onImportDesignSystem, onRemoveAllowedPath, onClearAllowedPaths } = t0;
	const variant = t1 === void 0 ? "default" : t1;
	const backend = useBackendOptional();
	const resolveAsset = useAssetResolver();
	let t2;
	if ($[0] !== selectedElementIds || $[1] !== store) {
		t2 = Array.from(selectedElementIds).map((id) => getById(store, id)).filter(Boolean);
		$[0] = selectedElementIds;
		$[1] = store;
		$[2] = t2;
	} else t2 = $[2];
	const selectedElements = t2;
	let t3;
	if ($[3] !== componentIndex) {
		t3 = Object.entries(componentIndex).some(_temp13$4);
		$[3] = componentIndex;
		$[4] = t3;
	} else t3 = $[4];
	const hasButtonComponent = t3;
	const chatShown = (0, import_react.useContext)(ChatShownContext);
	const [transcriptStore, setTranscriptStore] = (0, import_react.useState)(store);
	if (chatShown && transcriptStore !== store) setTranscriptStore(store);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const workStartedAtRef = (0, import_react.useRef)(null);
	const [workStartedAt, setWorkStartedAt] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [selectedModel, setSelectedModel] = (0, import_react.useState)(readStoredModel);
	const [selectedEffort, setSelectedEffort] = (0, import_react.useState)(readStoredEffort);
	const [showChatList, setShowChatList] = (0, import_react.useState)(false);
	const [lightboxUrl, setLightboxUrl] = (0, import_react.useState)(null);
	const [autoApprove, setAutoApprove] = (0, import_react.useState)(readStoredAutoApprove);
	const [hasComposerContent, setHasComposerContent] = (0, import_react.useState)(false);
	const claudeStatus = useClaudeStatus();
	const [setupOpen, setSetupOpen] = (0, import_react.useState)(false);
	let t4;
	if ($[5] !== claudeStatus.isDesktop || $[6] !== claudeStatus.loading || $[7] !== claudeStatus.status) {
		t4 = claudeStatus.isDesktop && !claudeStatus.loading && !!claudeStatus.status && !isClaudeSetUp(claudeStatus.status);
		$[5] = claudeStatus.isDesktop;
		$[6] = claudeStatus.loading;
		$[7] = claudeStatus.status;
		$[8] = t4;
	} else t4 = $[8];
	const showClaudeSetup = t4;
	const autoApproveRef = (0, import_react.useRef)(autoApprove);
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = crypto.randomUUID();
		$[9] = t5;
	} else t5 = $[9];
	const cliSessionIdRef = (0, import_react.useRef)(t5);
	const cliMessageCountRef = (0, import_react.useRef)(0);
	const { viewportRef: messagesScrollRef, contentRef: messagesContentRef, atBottom: messagesAtBottom, scrollToBottom: scrollMessagesToBottom } = useChatScroll();
	const inputRef = (0, import_react.useRef)(null);
	const submittingRunRef = (0, import_react.useRef)(false);
	const setupCheckPendingRef = (0, import_react.useRef)(false);
	const abortControllerRef = (0, import_react.useRef)(null);
	const oneShotModelRef = (0, import_react.useRef)(null);
	const [importSeedVisible, setImportSeedVisible] = (0, import_react.useState)(false);
	const queuedReplyRef = (0, import_react.useRef)(null);
	const [queuedReply, setQueuedReply] = (0, import_react.useState)(null);
	const [answeredQuestionKey, setAnsweredQuestionKey] = (0, import_react.useState)(null);
	const [seedQuestionsChatId, setSeedQuestionsChatId] = (0, import_react.useState)(null);
	let t6;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			const input = inputRef.current;
			if (!input) {
				setHasComposerContent(false);
				return;
			}
			setHasComposerContent(Boolean(input.textContent?.trim() || input.querySelector("[data-ref-id]")));
		};
		$[10] = t6;
	} else t6 = $[10];
	const updateComposerContentState = t6;
	let t7;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = (report) => {
			const input_0 = inputRef.current;
			if (!input_0) return;
			const prompt = `Help me troubleshoot this failed action. Explain what went wrong and fix it if it is still unresolved.\n\n${report}`;
			input_0.append(document.createTextNode(`${input_0.textContent ? "\n\n" : ""}${prompt}`));
			updateComposerContentState();
			requestAnimationFrame(() => {
				input_0.focus();
				const range = document.createRange();
				range.selectNodeContents(input_0);
				range.collapse(false);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
			});
		};
		$[11] = t7;
	} else t7 = $[11];
	const onTroubleshoot = t7;
	let t8;
	let t9;
	if ($[12] !== variant) {
		t8 = () => {
			if (variant !== "sidebar-v2") return;
			const input_1 = inputRef.current;
			if (!input_1) return;
			const pane = input_1.closest("[data-state]");
			const focusIfVisible = () => {
				if (input_1.closest(".hidden")) return;
				if (pane?.getAttribute("data-state") === "inactive") return;
				requestAnimationFrame(() => input_1.focus());
			};
			focusIfVisible();
			if (!pane) return;
			const observer = new MutationObserver(focusIfVisible);
			observer.observe(pane, {
				attributes: true,
				attributeFilter: ["data-state"]
			});
			return () => observer.disconnect();
		};
		t9 = [variant];
		$[12] = variant;
		$[13] = t8;
		$[14] = t9;
	} else {
		t8 = $[13];
		t9 = $[14];
	}
	(0, import_react.useEffect)(t8, t9);
	let t10;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = (suggestion) => {
			const input_2 = inputRef.current;
			if (!input_2) return;
			input_2.textContent = suggestion;
			updateComposerContentState();
			requestAnimationFrame(() => {
				input_2.focus();
				const range_0 = document.createRange();
				range_0.selectNodeContents(input_2);
				range_0.collapse(false);
				const selection_0 = window.getSelection();
				selection_0?.removeAllRanges();
				selection_0?.addRange(range_0);
			});
		};
		$[15] = t10;
	} else t10 = $[15];
	const applyComposerSuggestion = t10;
	const inlineComposerRef = (0, import_react.useRef)(null);
	let t11;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = [];
		$[16] = t11;
	} else t11 = $[16];
	const [referenceMounts, setReferenceMounts] = (0, import_react.useState)(t11);
	const contextRefs = referenceMounts.map(_temp14$4);
	const [pendingAttachments, setPendingAttachments] = (0, import_react.useState)(0);
	let t12;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = (ref_0) => {
			inlineComposerRef.current?.insertSelection([ref_0], false);
			updateComposerContentState();
		};
		$[17] = t12;
	} else t12 = $[17];
	const addContextRef = t12;
	let t13;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = (id_0) => {
			inlineComposerRef.current?.removeReferences(id_0);
		};
		$[18] = t13;
	} else t13 = $[18];
	const removeContextRef = t13;
	const selectedRefs = useElementChatReferences(selectedElements, activeTabInfo?.id);
	const [dismissedSelection, setDismissedSelection] = (0, import_react.useState)(null);
	const selectionRefs = selectedRefs.filter((ref_1) => !(dismissedSelection?.selection === selectedElementIds && dismissedSelection.ids.has(ref_1.id)) && !contextRefs.some((inline) => inline.id === ref_1.id));
	let t14;
	if ($[19] !== selectedElementIds) {
		t14 = (id_1) => {
			setDismissedSelection((previous) => ({
				selection: selectedElementIds,
				ids: /* @__PURE__ */ new Set([...previous?.selection === selectedElementIds ? previous.ids : [], id_1])
			}));
		};
		$[19] = selectedElementIds;
		$[20] = t14;
	} else t14 = $[20];
	const removeSelectionItem = t14;
	let t15;
	let t16;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = () => {
			if (!inputRef.current) return;
			const composer = inlineComposerRef.current ?? new InlineChatComposer(inputRef.current, true);
			inlineComposerRef.current = composer;
			composer.connect();
			const syncComposer = () => {
				syncInlineReferenceSpacing(inputRef.current);
				updateComposerContentState();
				const mounts = composer.getReferenceMounts();
				setReferenceMounts((previous_0) => previous_0.length === mounts.length && previous_0.every((mount_0, index) => mount_0 === mounts[index]) ? previous_0 : mounts);
			};
			syncComposer();
			const observer_0 = new MutationObserver(syncComposer);
			observer_0.observe(inputRef.current, {
				childList: true,
				characterData: true,
				subtree: true
			});
			return () => {
				composer.dispose();
				observer_0.disconnect();
			};
		};
		t16 = [updateComposerContentState];
		$[21] = t15;
		$[22] = t16;
	} else {
		t15 = $[21];
		t16 = $[22];
	}
	(0, import_react.useLayoutEffect)(t15, t16);
	let t17;
	if ($[23] !== selectedRefs) {
		t17 = () => {
			inlineComposerRef.current?.insertSelection(selectedRefs, false);
			updateComposerContentState();
		};
		$[23] = selectedRefs;
		$[24] = t17;
	} else t17 = $[24];
	const pinSelection = t17;
	const [slashQuery, setSlashQuery] = (0, import_react.useState)(null);
	const [slashIndexState, setSlashIndex] = (0, import_react.useState)(0);
	const [slashIndexQuery, setSlashIndexQuery] = (0, import_react.useState)(null);
	if (slashIndexQuery !== slashQuery) {
		setSlashIndexQuery(slashQuery);
		setSlashIndex(0);
	}
	const [slashCommands, setSlashCommands] = (0, import_react.useState)(null);
	const slashOpenRef = (0, import_react.useRef)(false);
	const slashDismissedRef = (0, import_react.useRef)(null);
	const slashCwd = allowedPaths?.[0];
	let t18;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = () => {
			const input_3 = inputRef.current;
			const selection_1 = window.getSelection();
			if (!input_3 || !selection_1 || !selection_1.isCollapsed || selection_1.rangeCount === 0) return null;
			const node = selection_1.anchorNode;
			if (!node || node.nodeType !== Node.TEXT_NODE || !input_3.contains(node)) return null;
			const offset = selection_1.anchorOffset;
			const before = document.createRange();
			before.setStart(input_3, 0);
			before.setEnd(node, offset);
			const contents = before.cloneContents();
			contents.querySelectorAll("[data-ref-id]").forEach(_temp15$3);
			const m = /^\s*\/([\w:-]*)$/.exec(contents.textContent ?? "");
			if (!m) return null;
			return {
				node,
				start: offset - m[1].length - 1,
				end: offset,
				query: m[1]
			};
		};
		$[25] = t18;
	} else t18 = $[25];
	const readSlashToken = t18;
	let t19;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = () => {
			slashOpenRef.current = false;
			setSlashQuery(null);
		};
		$[26] = t19;
	} else t19 = $[26];
	const closeSlashMenu = t19;
	let t20;
	if ($[27] !== claudeStatus.isDesktop || $[28] !== slashCwd) {
		t20 = () => {
			if (!claudeStatus.isDesktop) return;
			const token = readSlashToken();
			if (!token) {
				slashDismissedRef.current = null;
				if (slashOpenRef.current) closeSlashMenu();
				return;
			}
			const dismissed = slashDismissedRef.current;
			if (dismissed !== null) {
				if (token.query.startsWith(dismissed)) return;
				slashDismissedRef.current = null;
			}
			if (!slashOpenRef.current) {
				slashOpenRef.current = true;
				fetchSlashCommands(slashCwd).then(setSlashCommands);
			}
			setSlashQuery(token.query);
		};
		$[27] = claudeStatus.isDesktop;
		$[28] = slashCwd;
		$[29] = t20;
	} else t20 = $[29];
	const syncSlashMenu = t20;
	const slashOpen = slashQuery !== null;
	let t21;
	if ($[30] !== slashCommands || $[31] !== slashOpen || $[32] !== slashQuery) {
		t21 = slashOpen ? [...filterSlashCommands$1(LUNAGRAPH_COMMANDS, slashQuery), ...slashCommands ? filterSlashCommands$1(slashCommands, slashQuery) : []] : [];
		$[30] = slashCommands;
		$[31] = slashOpen;
		$[32] = slashQuery;
		$[33] = t21;
	} else t21 = $[33];
	const filteredSlash = t21;
	if (slashIndexState > 0 && slashIndexState > filteredSlash.length - 1) setSlashIndex(filteredSlash.length === 0 ? 0 : filteredSlash.length - 1);
	const slashIndex = Math.min(slashIndexState, Math.max(0, filteredSlash.length - 1));
	let t22;
	if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = (command) => {
			const token_0 = readSlashToken();
			if (!token_0) return;
			const range_1 = document.createRange();
			range_1.setStart(token_0.node, token_0.start);
			range_1.setEnd(token_0.node, token_0.end);
			range_1.deleteContents();
			const text = document.createTextNode(`/${command.name} `);
			range_1.insertNode(text);
			range_1.setStartAfter(text);
			range_1.collapse(true);
			const selection_2 = window.getSelection();
			selection_2?.removeAllRanges();
			selection_2?.addRange(range_1);
			closeSlashMenu();
			updateComposerContentState();
		};
		$[34] = t22;
	} else t22 = $[34];
	const applySlashCommand = t22;
	let t23;
	if ($[35] !== activeTabInfo || $[36] !== contextPages) {
		t23 = contextPages ?? (activeTabInfo ? [activeTabInfo] : []);
		$[35] = activeTabInfo;
		$[36] = contextPages;
		$[37] = t23;
	} else t23 = $[37];
	const mentions = useContextMentions(inputRef, componentIndex, t23, addContextRef, updateComposerContentState, slashCwd);
	const { sync: syncMentions, close: closeMentions } = mentions;
	let t24;
	if ($[38] !== syncMentions || $[39] !== syncSlashMenu) {
		t24 = () => {
			syncSlashMenu();
			syncMentions();
		};
		$[38] = syncMentions;
		$[39] = syncSlashMenu;
		$[40] = t24;
	} else t24 = $[40];
	const syncComposerMenus = t24;
	let t25;
	if ($[41] !== syncComposerMenus) {
		t25 = () => {
			updateComposerContentState();
			syncComposerMenus();
		};
		$[41] = syncComposerMenus;
		$[42] = t25;
	} else t25 = $[42];
	const handleComposerInput = t25;
	const [composerFocused, setComposerFocused] = (0, import_react.useState)(false);
	let t26;
	if ($[43] !== syncComposerMenus) {
		t26 = () => {
			setComposerFocused(true);
			syncComposerMenus();
		};
		$[43] = syncComposerMenus;
		$[44] = t26;
	} else t26 = $[44];
	const handleComposerFocus = t26;
	let t27;
	if ($[45] !== closeMentions) {
		t27 = () => {
			setComposerFocused(false);
			closeSlashMenu();
			closeMentions();
		};
		$[45] = closeMentions;
		$[46] = t27;
	} else t27 = $[46];
	const handleComposerBlur = t27;
	let t28;
	if ($[47] !== syncSlashMenu) {
		t28 = () => {
			const input_4 = inputRef.current;
			if (!input_4) return;
			input_4.focus();
			const walker = document.createTreeWalker(input_4, NodeFilter.SHOW_TEXT);
			let node_0 = walker.nextNode();
			while (node_0 && !node_0.data.trim()) node_0 = walker.nextNode();
			const token_1 = node_0 && /^\s*\/[\w:-]*/.exec(node_0.data);
			let offset_0;
			if (node_0 && token_1) offset_0 = token_1[0].length;
			else {
				node_0 = document.createTextNode(input_4.textContent?.trim() ? "/ " : "/");
				input_4.prepend(node_0);
				offset_0 = 1;
			}
			const range_2 = document.createRange();
			range_2.setStart(node_0, offset_0);
			range_2.collapse(true);
			const selection_3 = window.getSelection();
			selection_3?.removeAllRanges();
			selection_3?.addRange(range_2);
			updateComposerContentState();
			slashDismissedRef.current = null;
			syncSlashMenu();
		};
		$[47] = syncSlashMenu;
		$[48] = t28;
	} else t28 = $[48];
	const openSkillsMenu = t28;
	const canSend = pendingAttachments === 0 && (hasComposerContent || contextRefs.length > 0 || selectionRefs.length > 0);
	const hasFolder = claudeStatus.isDesktop && (allowedPaths?.length ?? 0) > 0;
	const parseInput = () => {
		if (!inputRef.current) return {
			text: "",
			refs: []
		};
		const draft = inlineComposerRef.current?.parseInput() ?? {
			text: "",
			refs: [],
			mentions: []
		};
		return {
			...draft,
			refs: [...draft.refs, ...selectionRefs.filter((ref_2) => !draft.refs.some((inline_0) => inline_0.id === ref_2.id))]
		};
	};
	const streamingContentRef = (0, import_react.useRef)("");
	let t29;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = [];
		$[49] = t29;
	} else t29 = $[49];
	const [activityTimeline, _setActivityTimeline] = (0, import_react.useState)(t29);
	let t30;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = [];
		$[50] = t30;
	} else t30 = $[50];
	const activityTimelineRef = (0, import_react.useRef)(t30);
	let t31;
	if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
		t31 = (val) => {
			const next = typeof val === "function" ? val(activityTimelineRef.current) : val;
			activityTimelineRef.current = next;
			_setActivityTimeline(next);
		};
		$[51] = t31;
	} else t31 = $[51];
	const setActivityTimeline = t31;
	const thinkingOffsetRef = (0, import_react.useRef)(0);
	let t32;
	if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = [];
		$[52] = t32;
	} else t32 = $[52];
	const [streamingScreenshots, _setStreamingScreenshots] = (0, import_react.useState)(t32);
	let t33;
	if ($[53] === Symbol.for("react.memo_cache_sentinel")) {
		t33 = [];
		$[53] = t33;
	} else t33 = $[53];
	const streamingScreenshotsRef = (0, import_react.useRef)(t33);
	let t34;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t34 = (val_0) => {
			const next_0 = typeof val_0 === "function" ? val_0(streamingScreenshotsRef.current) : val_0;
			streamingScreenshotsRef.current = next_0;
			_setStreamingScreenshots(next_0);
		};
		$[54] = t34;
	} else t34 = $[54];
	const setStreamingScreenshots = t34;
	const [fileWriteStream, setFileWriteStream] = (0, import_react.useState)(null);
	const [thinking, setThinking] = (0, import_react.useState)(false);
	let t35;
	if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
		t35 = [];
		$[55] = t35;
	} else t35 = $[55];
	const [pendingApprovals, setPendingApprovals] = (0, import_react.useState)(t35);
	let t36;
	if ($[56] === Symbol.for("react.memo_cache_sentinel")) {
		t36 = [];
		$[56] = t36;
	} else t36 = $[56];
	const [debugMessages, setDebugMessages] = (0, import_react.useState)(t36);
	const [folderAccessRequest, setFolderAccessRequest] = (0, import_react.useState)(null);
	let t37;
	if ($[57] === Symbol.for("react.memo_cache_sentinel")) {
		t37 = (ids, granted, path) => {
			setFolderAccessRequest(null);
			const invoke = window.api?.invoke;
			if (typeof invoke !== "function") return;
			for (const requestId of ids) invoke("folder_access_response", {
				requestId,
				granted,
				path
			}).catch(_temp16$3);
		};
		$[57] = t37;
	} else t37 = $[57];
	const answerFolderAccess = t37;
	let t38;
	let t39;
	if ($[58] !== folderAccessRequest) {
		t38 = () => {
			if (!folderAccessRequest) return;
			const { ids: ids_0 } = folderAccessRequest;
			return subscribeFolderShared((path_0) => answerFolderAccess(ids_0, true, path_0));
		};
		t39 = [folderAccessRequest, answerFolderAccess];
		$[58] = folderAccessRequest;
		$[59] = t38;
		$[60] = t39;
	} else {
		t38 = $[59];
		t39 = $[60];
	}
	(0, import_react.useEffect)(t38, t39);
	const writeStreamPath = fileWriteStream?.path;
	let t40;
	let t41;
	if ($[61] !== activeChatId || $[62] !== writeStreamPath) {
		t40 = () => {
			publishAiWriteTarget(writeStreamPath && activeChatId ? {
				chatId: activeChatId,
				path: writeStreamPath
			} : null);
			return _temp17$3;
		};
		t41 = [writeStreamPath, activeChatId];
		$[61] = activeChatId;
		$[62] = writeStreamPath;
		$[63] = t40;
		$[64] = t41;
	} else {
		t40 = $[63];
		t41 = $[64];
	}
	(0, import_react.useEffect)(t40, t41);
	let t42;
	if ($[65] === Symbol.for("react.memo_cache_sentinel")) {
		t42 = (approvalId, approved) => {
			setPendingApprovals((prev) => prev.filter((a) => a.approvalId !== approvalId));
			if (typeof window !== "undefined" && window.api?.invoke) window.api.invoke("mcp_tool_approval", {
				approvalId,
				approved
			});
		};
		$[65] = t42;
	} else t42 = $[65];
	const handleApproval = t42;
	const toggleAutoApprove = (on) => {
		setAutoApprove(on);
		autoApproveRef.current = on;
		const stored = on ? "1" : "0";
		try {
			localStorage.setItem("petal-auto-approve", stored);
		} catch {}
	};
	const handleSubmit = (request, reply, t43) => {
		const setupChecked = t43 === void 0 ? false : t43;
		const overrideModel = request ? null : oneShotModelRef.current;
		const { text: text_0, refs, mentions: mentions_0 } = request ? {
			...request,
			mentions: void 0
		} : reply !== void 0 ? {
			text: reply,
			refs: [],
			mentions: void 0
		} : parseInput();
		if (!text_0 && refs.length === 0) return;
		if (isLoading || submittingRunRef.current || reply === void 0 && pendingAttachments > 0) return;
		if (!request && reply === void 0 && setupCheckPendingRef.current) return;
		if (!activeChatId) {
			setError({
				code: "unknown",
				title: "No active chat",
				message: "Create or select a chat before sending."
			});
			return;
		}
		if (showClaudeSetup && !setupChecked) {
			setSetupOpen(true);
			return;
		}
		if (!request) oneShotModelRef.current = null;
		setQueuedReply(null);
		setAnsweredQuestionKey(null);
		const isImportKickoff = messages.length === 0 && isImportDesignSystemPrompt(text_0);
		if (isImportKickoff) setImportSeedVisible(true);
		setSeedQuestionsChatId(isImportKickoff ? activeChatId : null);
		const submitModel = overrideModel ?? selectedModel;
		if (overrideModel !== null) {
			setSelectedModel(overrideModel);
			try {
				localStorage.setItem("petal-ai-model", overrideModel);
			} catch {}
		}
		const userMessage = {
			id: generateMessageId(),
			role: "user",
			content: text_0,
			agentContext: request?.agentContext,
			inlineRefs: refs.length > 0 ? refs : void 0,
			referenceMentions: mentions_0
		};
		submittingRunRef.current = true;
		const newMessages = [...messages, userMessage];
		scrollMessagesToBottom();
		onMessagesChange(newMessages);
		const run = {
			durationMs: 0,
			outcome: "completed",
			canvasWrites: 0,
			codeWrites: 0
		};
		if (!request && reply === void 0 && inputRef.current) inlineComposerRef.current?.reset([]);
		updateComposerContentState();
		startChatWork(workStartedAtRef, setWorkStartedAt);
		setIsLoading(true);
		if (activeChatId) onStreamStart?.(activeChatId);
		onRunStart?.({ model: submitModel });
		setActivityTimeline([]);
		thinkingOffsetRef.current = 0;
		streamingContentRef.current = "";
		setFileWriteStream(null);
		setThinking(false);
		setPendingApprovals([]);
		setFolderAccessRequest(null);
		setDebugMessages([]);
		setError(null);
		const abortController = new AbortController();
		abortControllerRef.current = abortController;
		return runChatStream({
			store,
			componentIndex,
			iconLibraryNames,
			selectedElementIds,
			refs,
			fromComment: !!request,
			activeTabInfo,
			focusedComponent,
			activeChatId,
			messages: newMessages,
			onMessagesChange,
			submitModel,
			selectedEffort,
			backend,
			resolveAsset,
			onPlanLimit,
			onProjectFilesEdited,
			run,
			abortController,
			thinkingOffsetRef,
			streamingContentRef,
			autoApproveRef,
			cliMessageCountRef,
			workStartedAtRef,
			activityTimelineRef,
			streamingScreenshotsRef,
			setActivityTimeline,
			setStreamingScreenshots,
			setThinking,
			setFileWriteStream,
			setPendingApprovals,
			setFolderAccessRequest,
			setError
		}).then((outcome) => {
			const assistantMessage = outcome.assistantMessage;
			if (assistantMessage) onMessagesChange([...newMessages, assistantMessage]);
			if (outcome.completed) cliMessageCountRef.current = cliMessageCountRef.current + 1;
			return {
				body: outcome.responseBody ?? "",
				status: run.outcome
			};
		}).finally(() => {
			submittingRunRef.current = false;
			abortControllerRef.current = null;
			setFolderAccessRequest(null);
			setIsLoading(false);
			setImportSeedVisible(false);
			run.durationMs = workStartedAtRef.current ? Date.now() - workStartedAtRef.current : 0;
			workStartedAtRef.current = null;
			setWorkStartedAt(null);
			inputRef.current?.focus();
			if (activeChatId) onStreamEnd?.(activeChatId);
			onRunComplete?.(run);
		});
	};
	const handleSubmitRef = (0, import_react.useRef)(handleSubmit);
	(0, import_react.useEffect)(() => {
		handleSubmitRef.current = handleSubmit;
	});
	const sendMessageFromPanel = (text_1) => {
		const input_6 = inputRef.current;
		if (!input_6) return;
		input_6.textContent = text_1;
		updateComposerContentState();
		setupCheckPendingRef.current = true;
		claudeStatus.refresh().then((status) => {
			setupCheckPendingRef.current = false;
			if (status && !isClaudeSetUp(status)) {
				setSetupOpen(true);
				return;
			}
			handleSubmitRef.current(void 0, void 0, true);
		});
	};
	const submitQuestionReply = (reply_0) => {
		if (isLoading) return;
		handleSubmit(void 0, reply_0);
	};
	const submitQuestionReplyRef = (0, import_react.useRef)(submitQuestionReply);
	let t44;
	if ($[66] !== submitQuestionReply) {
		t44 = () => {
			submitQuestionReplyRef.current = submitQuestionReply;
		};
		$[66] = submitQuestionReply;
		$[67] = t44;
	} else t44 = $[67];
	(0, import_react.useEffect)(t44);
	let t45;
	let t46;
	if ($[68] !== isLoading) {
		t45 = () => {
			if (isLoading || !queuedReplyRef.current) return;
			const reply_1 = queuedReplyRef.current;
			queuedReplyRef.current = null;
			submitQuestionReplyRef.current(reply_1);
		};
		t46 = [isLoading];
		$[68] = isLoading;
		$[69] = t45;
		$[70] = t46;
	} else {
		t45 = $[69];
		t46 = $[70];
	}
	(0, import_react.useEffect)(t45, t46);
	const resumeImport = () => {
		oneShotModelRef.current = IMPORT_MODEL;
		submitQuestionReply(RESUME_IMPORT_PROMPT);
	};
	let t47;
	if ($[71] !== addContextRef) {
		t47 = async (items) => {
			if (items.length === 0) return;
			inlineComposerRef.current?.prepareInsertion();
			setPendingAttachments((count) => count + items.length);
			const results = await Promise.allSettled(items.map(readPromptAttachment));
			setPendingAttachments((count_0) => count_0 - items.length);
			const failures = [];
			for (const result of results) if (result.status === "fulfilled") addContextRef(result.value);
			else failures.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
			if (failures.length > 0) setError({
				code: "unknown",
				title: "Could not attach",
				message: failures.join("\n")
			});
		};
		$[71] = addContextRef;
		$[72] = t47;
	} else t47 = $[72];
	const attachFiles = t47;
	(0, import_react.useImperativeHandle)(ref, () => ({
		attachDroppedFiles: (data) => {
			attachFiles(getDroppedAttachments(data));
		},
		addSelectedElements: (elementIds) => {
			if (elementIds) {
				const references = elementIds.flatMap((id_2) => {
					const element = getById(store, id_2);
					return element ? [elementChatReference(element, activeTabInfo?.id)] : [];
				});
				inlineComposerRef.current?.insertSelection(references, false);
				updateComposerContentState();
			} else pinSelection();
			inputRef.current?.focus();
		},
		getDraftCanvasReferences: () => inlineComposerRef.current?.getReferenceMounts().flatMap(_temp18$3) ?? [],
		addCanvasRegion: (region, screenshot) => {
			const composer_0 = inlineComposerRef.current;
			if (!composer_0) return;
			const areaNumber = _temp19$3;
			const taken = [...messages.flatMap((message) => (message.inlineRefs ?? []).flatMap(areaNumber)), ...composer_0.getReferenceMounts().flatMap((mount_2) => areaNumber(mount_2.reference))];
			const reference = {
				type: "image",
				id: `region:${crypto.randomUUID()}`,
				name: `Area ${Math.max(0, ...taken) + 1}`,
				region
			};
			composer_0.insertSelection([reference], false);
			updateComposerContentState();
			setPendingAttachments(_temp20$3);
			screenshot.then((data_0) => {
				if (!data_0) return;
				reference.data = data_0;
				setReferenceMounts(_temp21$3);
			}).finally(() => setPendingAttachments(_temp22$3));
		},
		setInputText: (text_2) => {
			const input_7 = inputRef.current;
			if (!input_7) return;
			input_7.textContent = text_2;
			updateComposerContentState();
			requestAnimationFrame(() => {
				input_7.focus();
				const range_3 = document.createRange();
				range_3.selectNodeContents(input_7);
				range_3.collapse(false);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range_3);
			});
		},
		sendCommentMessage: async (text_3, refs_0, agentContext) => {
			const result_0 = await handleSubmit({
				text: text_3,
				refs: refs_0,
				agentContext
			});
			if (!result_0) throw new Error("The agent could not start or finish this response. Open the chat for details.");
			return result_0;
		},
		sendMessage: (text_4, model) => {
			oneShotModelRef.current = model ?? null;
			sendMessageFromPanel(text_4);
		},
		setSaveToCodePrompt: (descriptions, sourceUrl, _componentNames, _capturedElementId, canvasId, screenshotDataUrl, projectRoot, componentEdit) => {
			const input_8 = inputRef.current;
			if (!input_8) return;
			const esc = _temp23$3;
			const codeOps = descriptions.filter(_temp24$3);
			const astOps = codeOps.filter(_temp25$2);
			const aiOps = codeOps.filter(_temp26$2);
			const formatOp = (d_2) => {
				let srcPart = "";
				if (d_2.sourceInfo?.filePath) {
					const resolved = resolveAgainstRoot$1(d_2.sourceInfo.filePath, projectRoot);
					srcPart = ` (${d_2.sourceInfo.lineNumber ? `${resolved}:${d_2.sourceInfo.lineNumber}` : resolved})`;
				}
				const summary = d_2.summary.replace(/\s+@\s+\S+:\d+/g, "");
				let line = `- [${d_2.op.type}] ${esc(d_2.componentName)}${esc(srcPart)}: ${esc(summary)}`;
				if (d_2.targetElementId && canvasId) line = line + ` → canvas_read canvas_id=${esc(canvasId)} element_id=${esc(d_2.targetElementId)}`;
				else if (d_2.targetElementId) line = line + ` → canvas_read element_id=${esc(d_2.targetElementId)}`;
				line = line + "\n";
				return line;
			};
			let opList = "";
			if (astOps.length > 0) {
				opList = "\n\nSimple edits (sourceInfo known, find & replace):\n";
				for (const d_3 of astOps) opList = opList + formatOp(d_3);
			}
			if (aiOps.length > 0) {
				opList = opList + "\n\nStructural edits (read file, then insert/remove/move):\n";
				for (const d_4 of aiOps) opList = opList + formatOp(d_4);
			}
			let html = !!componentEdit || sourceUrl.startsWith("component://") ? "Apply these design edits to the <b>component definition</b> (not a per-instance override)." : `Apply these design edits to the source code. Source: ${esc(sourceUrl)}`;
			if (componentEdit) {
				html = html + `<br>Target file: <code>${esc(componentEdit.path || componentEdit.componentName)}</code>`;
				html = html + `<br>Component: <code>${esc(componentEdit.componentName)}</code>`;
				html = html + "<br><br>The designer interacted with a <b>live</b> instance on the canvas, then froze the UI they were looking at into editable layers. The snapshot reflects that runtime state (e.g. step 2 of a flow) — not necessarily the component&#39;s initial render. Patch the definition so <em>that</em> state matches the design.";
				if (componentEdit.propsJson && componentEdit.propsJson !== "{}") html = html + `<br><br>Instance props at edit time: <code>${esc(componentEdit.propsJson)}</code>`;
			}
			if (projectRoot) html = html + `<br>Project root: <code>${esc(projectRoot)}</code>`;
			if (screenshotDataUrl) html = html + "<br><br>A screenshot of the designer&#39;s final canvas is attached above. Use it to understand the visual intent.";
			else html = html + "<br><br><b>Step 1:</b> Run <code>take_screenshot</code> to see the final design. Do NOT edit files before seeing the screenshot.";
			html = html + `<br><br><b>Step ${screenshotDataUrl ? "1" : "2"}:</b> For EVERY operation below, run the <code>canvas_read</code> shown to see the element&#39;s full structure. Do this BEFORE editing any files.`;
			html = html + `<br><br><b>Step ${screenshotDataUrl ? "2" : "3"}:</b> Synthesize what the designer intended in 1-2 sentences, then edit the source code to match.`;
			if (opList) html = html + `<br><br><b>Operations:</b>${opList.replace(/\n/g, "<br>")}`;
			if (aiOps.length > 0) html = html + "<br><br><b>If anything is ambiguous, ASK before editing.</b>";
			if (descriptions.length > 0) {
				html = html + "<br>";
				for (const d_5 of descriptions) {
					const truncatedSummary = d_5.summary.length > 60 ? d_5.summary.slice(0, 60) + "…" : d_5.summary;
					const badgeColor = d_5.method === "ast" ? "#2563eb" : "#d97706";
					const badgeBg = d_5.method === "ast" ? "rgba(37,99,235,0.08)" : "rgba(217,119,6,0.08)";
					const methodLabel = d_5.method === "ast" ? "AST" : "AI";
					html = html + `<span contenteditable="false" data-change-badge="true" style="display:inline-flex;align-items:center;gap:4px;font-size:var(--ed-chat-font-size);font-weight:500;color:${badgeColor};background-color:${badgeBg};border-radius:4px;padding:2px 8px;margin:2px;vertical-align:middle;user-select:none;"><span style="font-size:8px;font-weight:700;border-radius:2px;padding:0 3px;background:${badgeBg};color:${badgeColor};">${methodLabel}</span><span style="font-weight:600;flex-shrink:0;">${esc(d_5.componentName)}</span><span style="color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(truncatedSummary)}</span></span>`;
				}
			}
			input_8.innerHTML = html;
			if (screenshotDataUrl) addContextRef({
				type: "image",
				id: `save-to-code-screenshot-${Date.now()}`,
				name: "Canvas screenshot",
				data: screenshotDataUrl
			});
			updateComposerContentState();
		}
	}));
	const handleStop = () => {
		abortControllerRef.current?.abort();
	};
	const handleKeyDown = (e) => {
		if (e.nativeEvent.isComposing) return;
		if (mentions.onKeyDown(e)) return;
		if (slashOpen) {
			const count_3 = filteredSlash.length;
			const current = filteredSlash[slashIndex];
			if (e.key === "ArrowDown" && count_3) {
				e.preventDefault();
				setSlashIndex((i) => (i + 1) % count_3);
				return;
			}
			if (e.key === "ArrowUp" && count_3) {
				e.preventDefault();
				setSlashIndex((i_0) => (i_0 - 1 + count_3) % count_3);
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				slashDismissedRef.current = slashQuery;
				closeSlashMenu();
				return;
			}
			if (current && (e.key === "Tab" || e.key === "Enter" && !e.shiftKey && current.name !== slashQuery)) {
				e.preventDefault();
				applySlashCommand(current);
				return;
			}
			if (e.key === "Enter") closeSlashMenu();
		}
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
		if (isAddToPromptShortcut(e)) {
			e.preventDefault();
			e.stopPropagation();
			pinSelection();
		}
	};
	let t48;
	if ($[73] !== addContextRef) {
		t48 = (e_0) => {
			const items_0 = e_0.clipboardData?.items;
			if (!items_0) return;
			for (const item of Array.from(items_0)) if (item.type.startsWith("image/")) {
				e_0.preventDefault();
				const file = item.getAsFile();
				if (!file) continue;
				const reader = new FileReader();
				reader.onload = () => {
					const base64 = reader.result;
					addContextRef({
						type: "image",
						id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
						name: "Screenshot",
						data: base64
					});
				};
				reader.readAsDataURL(file);
				return;
			}
			const pastedText = e_0.clipboardData?.getData("text/plain") || "";
			if (pastedText.startsWith("data:image/")) {
				e_0.preventDefault();
				addContextRef({
					type: "image",
					id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					name: "Pasted image",
					data: pastedText
				});
				return;
			}
			const imgMatch = (e_0.clipboardData?.getData("text/html") || "").match(/<img[^>]+src="(data:image\/[^"]+)"/);
			if (imgMatch) {
				e_0.preventDefault();
				addContextRef({
					type: "image",
					id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					name: "Pasted image",
					data: imgMatch[1]
				});
				return;
			}
		};
		$[73] = addContextRef;
		$[74] = t48;
	} else t48 = $[74];
	const handlePaste = t48;
	let t49;
	if ($[75] !== attachFiles) {
		t49 = (e_1) => {
			if (!e_1.dataTransfer.types.includes("Files")) return;
			e_1.preventDefault();
			e_1.stopPropagation();
			attachFiles(getDroppedAttachments(e_1.dataTransfer));
		};
		$[75] = attachFiles;
		$[76] = t49;
	} else t49 = $[76];
	const handleDrop = t49;
	const attachInputRef = (0, import_react.useRef)(null);
	let importProgress = latestImportProgress(activityTimeline);
	if (!importProgress) {
		const recentMessages = messages.slice(-4);
		for (let i_1 = recentMessages.length - 1; i_1 >= 0 && !importProgress; i_1--) {
			const activity = recentMessages[i_1].activity ?? [];
			importProgress = latestImportProgress(activity);
			if (importProgress && isLoading && activity.some(isAskUserItem)) importProgress = {
				...importProgress,
				steps: importProgress.steps.map(_temp27$2)
			};
		}
	}
	if (!importProgress && isLoading && importSeedVisible) importProgress = IMPORT_SEED_PROGRESS;
	let importLiveDetail;
	const liveTail = importProgress && isLoading ? activityTimeline[activityTimeline.length - 1] : void 0;
	const liveTailStale = useTimePassed(liveTail?.type === "tool" ? liveTail.at : void 0, 1e4);
	if (importProgress && isLoading && activityTimeline.length > 0) {
		const tail = activityTimeline[activityTimeline.length - 1];
		if (tail.type === "tool" && !isBookkeepingItem(tail)) {
			let t50;
			if ($[77] !== liveTailStale || $[78] !== tail.input || $[79] !== tail.name) {
				t50 = liveTailStale ? "Thinking…" : getToolActivityLabel(tail.name || "", tail.input);
				$[77] = liveTailStale;
				$[78] = tail.input;
				$[79] = tail.name;
				$[80] = t50;
			} else t50 = $[80];
			importLiveDetail = t50;
		} else if (tail.type === "thinking") importLiveDetail = "Thinking…";
	}
	const lastMessage = messages[messages.length - 1];
	let askUserQuestions;
	let t50;
	if ($[81] !== activeChatId || $[82] !== activityTimeline || $[83] !== isLoading || $[84] !== lastMessage || $[85] !== messages || $[86] !== seedQuestionsChatId) {
		const questionSource = isLoading ? activityTimeline : lastMessage?.role === "assistant" ? lastMessage.activity ?? [] : [];
		askUserQuestions = [];
		let questionCallId;
		for (let i_2 = questionSource.length - 1; i_2 >= 0; i_2--) {
			const item_0 = questionSource[i_2];
			if (isAskUserItem(item_0)) {
				askUserQuestions = parseAskUserQuestions(item_0.input);
				questionCallId = item_0.id;
				break;
			}
		}
		if (askUserQuestions.length === 0 && seedQuestionsChatId && seedQuestionsChatId === activeChatId) askUserQuestions = IMPORT_SEED_QUESTIONS;
		let questionTurnId;
		for (let i_3 = messages.length - 1; i_3 >= 0; i_3--) if (messages[i_3].role === "user") {
			questionTurnId = messages[i_3].id;
			break;
		}
		t50 = askUserQuestions.length > 0 ? JSON.stringify([
			activeChatId,
			questionTurnId,
			questionCallId,
			askUserQuestions
		]) : null;
		$[81] = activeChatId;
		$[82] = activityTimeline;
		$[83] = isLoading;
		$[84] = lastMessage;
		$[85] = messages;
		$[86] = seedQuestionsChatId;
		$[87] = askUserQuestions;
		$[88] = t50;
	} else {
		askUserQuestions = $[87];
		t50 = $[88];
	}
	const questionsKey = t50;
	if (questionsKey && (questionsKey === answeredQuestionKey || isLoading && queuedReply)) {
		let t51;
		if ($[89] === Symbol.for("react.memo_cache_sentinel")) {
			t51 = [];
			$[89] = t51;
		} else t51 = $[89];
		askUserQuestions = t51;
	}
	let t51;
	if ($[90] !== isLoading || $[91] !== questionsKey || $[92] !== submitQuestionReply) {
		t51 = (reply_2) => {
			setAnsweredQuestionKey(questionsKey);
			setSeedQuestionsChatId(null);
			if (!isLoading) {
				submitQuestionReply(reply_2);
				return;
			}
			queuedReplyRef.current = reply_2;
			setQueuedReply(reply_2);
		};
		$[90] = isLoading;
		$[91] = questionsKey;
		$[92] = submitQuestionReply;
		$[93] = t51;
	} else t51 = $[93];
	const answerQuestions = t51;
	const importStopped = !!importProgress && !isLoading && askUserQuestions.length === 0 && importProgress.steps.some(_temp28$2);
	const t52 = variant === "default" && "pt-1";
	let t53;
	if ($[94] !== t52) {
		t53 = cn$2("flex h-full flex-col overflow-hidden bg-ed-background", t52);
		$[94] = t52;
		$[95] = t53;
	} else t53 = $[95];
	const t54 = handleAttachmentDragOver$1;
	const t55 = variant === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2 px-3 pb-2 border-b border-ed-border",
		children: [
			chatColor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-2.5 h-2.5 rounded-full shrink-0",
				style: { backgroundColor: chatColor }
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalLogo, { className: "size-4 shrink-0" }),
			chatList && chatList.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, {
					open: showChatList,
					onOpenChange: setShowChatList,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "text",
							isChildText: false,
							className: "flex w-full min-w-0 max-w-full shrink justify-start gap-1 overflow-hidden text-ed-chat text-ed-foreground hover:text-ed-foreground/80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate",
								children: chatList.find((c) => c.id === activeChatId)?.title || "New chat"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
								width: 12,
								height: 12,
								className: "text-ed-muted-foreground shrink-0"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
						"data-dismissable-layer": "",
						align: "start",
						side: "bottom",
						sideOffset: 4,
						collisionPadding: 8,
						onOpenAutoFocus: _temp29$1,
						onCloseAutoFocus: _temp30$1,
						className: "w-72 bg-ed-background border border-ed-border rounded-lg shadow-lg z-50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							viewportClassName: "max-h-80 p-1",
							children: chatList.map((chat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `group relative flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${chat.id === activeChatId ? "bg-ed-muted text-ed-foreground" : "text-ed-muted-foreground hover:bg-ed-muted/50 hover:text-ed-foreground"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										className: "absolute inset-0 h-full w-full rounded-md bg-transparent hover:bg-transparent",
										"aria-label": `Open ${chat.title || "chat"}`,
										onClick: () => {
											onSwitchChat?.(chat.id);
											setShowChatList(false);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "pointer-events-none relative w-2 h-2 rounded-full flex-shrink-0",
										style: { backgroundColor: chatList && chatList.length > 1 ? chatColors?.get(chat.id) || "#2563eb" : "transparent" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "pointer-events-none relative truncate flex-1 min-w-0",
										children: chat.title || "New chat"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "pointer-events-none relative text-ed-muted-foreground flex-shrink-0 tabular-nums",
										children: formatChatDate(chat.createdAt || chat.updatedAt)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
										appearance: "inline",
										className: "relative shrink-0 text-ed-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
										tooltip: "Archive chat",
										label: `Archive ${chat.title || "chat"}`,
										disabled: !onArchiveChat || chat.id === activeChatId && isLoading,
										onClick: (event) => {
											event.stopPropagation();
											event.preventDefault();
											onArchiveChat?.(chat.id);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveIcon, {})
									})
								]
							}, chat.id))
						})
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate text-ed-chat font-medium text-ed-foreground",
				children: "AI Assistant"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex shrink-0 items-center gap-1.5",
				children: [onNewChat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "h-6 w-6",
					onClick: () => {
						onNewChat();
						cliSessionIdRef.current = crypto.randomUUID();
						cliMessageCountRef.current = 0;
					},
					title: "New chat",
					LeftIcon: PlusIcon,
					leftIconSize: 14
				}), (onOpenProjectSettings || onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
					modal: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							className: "h-6 w-6",
							title: "AI settings",
							LeftIcon: SettingsIcon,
							leftIconSize: 14,
							"aria-label": "AI settings"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						sideOffset: 4,
						children: [
							onOpenArchivedChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onSelect: onOpenArchivedChats,
								children: "Archived chats"
							}),
							onArchiveAllChats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								disabled: !chatList || chatList.length === 0,
								onSelect: onArchiveAllChats,
								children: "Archive all chats"
							}),
							onOpenProjectSettings && (onArchiveAllChats || onOpenArchivedChats) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							onOpenProjectSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onSelect: onOpenProjectSettings,
								children: "Settings"
							})
						]
					})]
				})]
			})
		]
	});
	const t56 = messages.length === 0 && "[&>div]:flex! [&>div]:min-h-full [&>div]:flex-col";
	let t57;
	if ($[96] !== t56) {
		t57 = cn$2("select-text px-3 pt-3 pb-5", t56);
		$[96] = t56;
		$[97] = t57;
	} else t57 = $[97];
	const t58 = variant === "sidebar-v2" ? "gap-5" : "gap-4";
	const t59 = messages.length === 0 && "flex-1";
	let t60;
	if ($[98] !== t58 || $[99] !== t59) {
		t60 = cn$2("relative flex flex-col", t58, t59);
		$[98] = t58;
		$[99] = t59;
		$[100] = t60;
	} else t60 = $[100];
	let t61;
	if ($[101] !== messages.length || $[102] !== setSetupOpen || $[103] !== showClaudeSetup || $[104] !== variant) {
		t61 = messages.length === 0 && showClaudeSetup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelEmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {
				width: 24,
				height: 24,
				className: "text-ed-muted-foreground"
			}),
			title: "Set up Claude Code",
			description: "Install and log in to Claude Code to start chatting",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: variant === "sidebar-v2" ? "xs" : "default",
				className: "w-full",
				onClick: () => setSetupOpen(true),
				children: "Setup Claude Code"
			})
		});
		$[101] = messages.length;
		$[102] = setSetupOpen;
		$[103] = showClaudeSetup;
		$[104] = variant;
		$[105] = t61;
	} else t61 = $[105];
	let t62;
	if ($[106] !== autoApprove || $[107] !== hasButtonComponent || $[108] !== messages.length || $[109] !== onImportDesignSystem || $[110] !== sendMessageFromPanel || $[111] !== showClaudeSetup || $[112] !== toggleAutoApprove || $[113] !== variant) {
		t62 = messages.length === 0 && !showClaudeSetup && (variant === "sidebar-v2" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDesignSystemCard, { onImport: onImportDesignSystem ?? (() => sendMessageFromPanel("Import my design system from my local codebase (colours, typography, spacing, icons and components) into this file.")) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full max-w-64 flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-2 text-center text-ed-chat text-ed-muted-foreground/60",
					children: "Or try asking"
				}), [
					"Design a profile card",
					hasButtonComponent ? "Show all Button variants" : "Make a Button component",
					"Make 3 hero variations"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "xs",
					variant: "secondary",
					isChildText: false,
					className: "w-full justify-start border border-ed-border bg-ed-card px-3 text-ed-muted-foreground hover:bg-ed-muted/50 hover:text-ed-foreground",
					onClick: () => applyComposerSuggestion(label),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: label
					})
				}, label))]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center gap-2 text-ed-chat text-ed-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDesignSystemCard, { onImport: onImportDesignSystem ?? (() => sendMessageFromPanel("Import my design system from my local codebase (colours, typography, spacing, icons and components) into this file.")) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4",
					children: "Ask me to help with your design."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-ed-chat text-ed-muted-foreground/60",
					children: "Select something on the canvas and it joins your message"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2 text-ed-chat",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ed-muted-foreground/70",
						children: "Approvals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: autoApprove ? "auto" : "ask",
						onValueChange: (value) => toggleAutoApprove(value === "auto"),
						className: "w-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							size: "xs",
							className: "h-7 w-auto rounded-lg border border-ed-border bg-ed-muted/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "ask",
								className: "px-2",
								children: "Ask first"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "auto",
								className: "px-2",
								children: "Auto"
							})]
						})
					})]
				})
			]
		}));
		$[106] = autoApprove;
		$[107] = hasButtonComponent;
		$[108] = messages.length;
		$[109] = onImportDesignSystem;
		$[110] = sendMessageFromPanel;
		$[111] = showClaudeSetup;
		$[112] = toggleAutoApprove;
		$[113] = variant;
		$[114] = t62;
	} else t62 = $[114];
	let t63;
	if ($[115] !== activeChatId || $[116] !== messages || $[117] !== onFeedback || $[118] !== onSelectElement || $[119] !== setLightboxUrl || $[120] !== transcriptStore || $[121] !== variant) {
		t63 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatTranscript, {
			messages,
			store: transcriptStore,
			variant,
			activeChatId,
			onSelectElement,
			onFeedback,
			onTroubleshoot,
			onOpenScreenshot: setLightboxUrl
		});
		$[115] = activeChatId;
		$[116] = messages;
		$[117] = onFeedback;
		$[118] = onSelectElement;
		$[119] = setLightboxUrl;
		$[120] = transcriptStore;
		$[121] = variant;
		$[122] = t63;
	} else t63 = $[122];
	let t64;
	if ($[123] !== activityTimeline || $[124] !== fileWriteStream || $[125] !== isLoading || $[126] !== pendingApprovals || $[127] !== setLightboxUrl || $[128] !== streamingScreenshots || $[129] !== thinking || $[130] !== workStartedAt) {
		t64 = isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 max-w-full items-start gap-2.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 max-w-full",
				children: [
					activityTimeline.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequentialAssistantActivity$1, {
						activity: activityTimeline,
						startedAt: workStartedAt,
						active: true,
						fileWriteStream,
						thinking
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-ed-chat text-ed-muted-foreground/55",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
							width: 12,
							height: 12,
							className: "shrink-0 animate-spin"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Working…", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkElapsed, {
							startedAt: workStartedAt,
							children: _temp31$1
						})] })]
					}),
					streamingScreenshots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenshotChips$1, {
							screenshots: streamingScreenshots,
							onOpen: setLightboxUrl
						})
					}),
					pendingApprovals.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2 mt-2",
						children: pendingApprovals.map((approval) => {
							const filePath = approval.args?.file_path || "";
							const shortPath = filePath ? filePath.split("/").slice(-2).join("/") : "file";
							const copyTargets = /local_copy_file$/.test(approval.toolName) ? (Array.isArray(approval.args?.files) ? approval.args.files : [approval.args]).flatMap(_temp32$1) : [];
							const isFileTool = /write|edit|delete/i.test(approval.toolName);
							const actionLabel = approval.toolName.includes("delete") || approval.toolName === "Delete" ? "Delete" : approval.toolName.includes("write") || approval.toolName === "Write" ? "Write" : "Edit";
							const title = approval.origin === "cli" && !isFileTool ? describeApprovalTool$1(approval.toolName) : copyTargets.length > 1 ? `Copy ${copyTargets.length} files` : copyTargets.length === 1 ? `Copy to ${copyTargets[0].split("/").slice(-2).join("/")}` : `${actionLabel} ${shortPath}`;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-ed-border rounded-lg p-2.5 bg-ed-muted/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-ed-chat font-medium text-ed-foreground mb-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
											width: 13,
											height: 13,
											className: "text-yellow-500 shrink-0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: title
										})]
									}),
									approval.sensitive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-ed-chat text-ed-muted-foreground mb-1.5",
										children: "Always asks: this file can run code outside your app."
									}),
									copyTargets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border whitespace-pre-wrap break-all",
										children: copyTargets.join("\n")
									}),
									approval.origin === "cli" && !isFileTool && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border whitespace-pre-wrap break-all",
										children: summarizeApprovalArgs$1(approval.toolName, approval.args)
									}),
									(approval.toolName.includes("edit") || approval.toolName === "Edit") && approval.args?.old_string && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] font-mono bg-ed-background rounded p-1.5 mb-1.5 max-h-24 overflow-y-auto border border-ed-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-red-400 line-through",
											children: [approval.args.old_string.slice(0, 200), approval.args.old_string.length > 200 ? "..." : ""]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-emerald-400 mt-0.5",
											children: [approval.args.new_string?.slice(0, 200), (approval.args.new_string?.length || 0) > 200 ? "..." : ""]
										})]
									}),
									(approval.toolName.includes("write") || approval.toolName === "Write") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-ed-chat text-ed-muted-foreground mb-1.5",
										children: approval.args?.content ? `${approval.args.content.split("\n").length} lines` : "New file"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											onClick: () => handleApproval(approval.approvalId, true),
											size: "xs",
											className: "bg-emerald-600 text-ed-chat font-medium text-white hover:bg-emerald-500",
											LeftIcon: CheckIcon,
											leftIconSize: 11,
											children: "Approve"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											onClick: () => handleApproval(approval.approvalId, false),
											variant: "outline",
											size: "xs",
											className: "border-ed-border bg-ed-muted text-ed-chat font-medium text-ed-muted-foreground hover:bg-ed-muted/80",
											LeftIcon: XIcon,
											leftIconSize: 11,
											children: "Reject"
										})]
									})
								]
							}, approval.approvalId);
						})
					})
				]
			})
		});
		$[123] = activityTimeline;
		$[124] = fileWriteStream;
		$[125] = isLoading;
		$[126] = pendingApprovals;
		$[127] = setLightboxUrl;
		$[128] = streamingScreenshots;
		$[129] = thinking;
		$[130] = workStartedAt;
		$[131] = t64;
	} else t64 = $[131];
	let t65;
	if ($[132] !== debugMessages) {
		t65 = debugMessages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-ed-muted-foreground/40 font-mono px-4 py-1 space-y-0.5",
			children: debugMessages.map(_temp33$1)
		});
		$[132] = debugMessages;
		$[133] = t65;
	} else t65 = $[133];
	let t66;
	if ($[134] !== error || $[135] !== variant) {
		t66 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn$2("mx-3 my-2 rounded-lg border border-ed-destructive/30 bg-ed-destructive/5 p-3", variant === "sidebar-v2" ? "text-ed-chat" : "text-ed-chat"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, {
						width: 14,
						height: 14,
						className: "text-ed-destructive shrink-0 mt-0.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-ed-destructive",
								children: error.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-ed-muted-foreground mt-0.5",
								children: error.message
							}),
							error.action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-ed-foreground/70 mt-1.5 bg-ed-muted rounded px-2 py-1.5 font-mono text-[11px] leading-relaxed",
								children: error.action
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => setError(null),
						variant: "ghost",
						size: "icon-xs",
						className: "text-ed-muted-foreground hover:text-ed-foreground",
						LeftIcon: XIcon,
						leftIconSize: 12,
						"aria-label": "Dismiss error"
					})
				]
			})
		});
		$[134] = error;
		$[135] = variant;
		$[136] = t66;
	} else t66 = $[136];
	let t67;
	if ($[137] !== folderAccessRequest || $[138] !== onAddAllowedPath) {
		t67 = folderAccessRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-ed-border rounded-lg p-2.5 bg-ed-muted/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 text-ed-chat font-normal text-ed-foreground mb-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpenIcon, {
						width: 13,
						height: 13,
						className: "text-ed-muted-foreground shrink-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Let the AI open a folder?" })]
				}),
				folderAccessRequest.path && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-mono text-ed-muted-foreground truncate mb-1.5",
					children: folderAccessRequest.path
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "xs",
						variant: "outline",
						className: "border-ed-border bg-ed-background font-medium",
						onClick: async () => {
							const path_1 = await pickFolder();
							if (!path_1) return;
							onAddAllowedPath?.(path_1);
							answerFolderAccess(folderAccessRequest.ids, true, path_1);
						},
						disabled: !onAddAllowedPath,
						children: "Add local folder"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "xs",
						variant: "ghost",
						className: "font-medium text-ed-muted-foreground",
						onClick: () => answerFolderAccess(folderAccessRequest.ids, false),
						children: "Cancel"
					})]
				})
			]
		});
		$[137] = folderAccessRequest;
		$[138] = onAddAllowedPath;
		$[139] = t67;
	} else t67 = $[139];
	let t68;
	if ($[140] !== importLiveDetail || $[141] !== importProgress || $[142] !== importStopped || $[143] !== isLoading || $[144] !== resumeImport) {
		t68 = importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportProgressCard$1, {
			progress: importProgress,
			liveDetail: importLiveDetail,
			running: isLoading,
			onResume: importStopped ? resumeImport : void 0
		});
		$[140] = importLiveDetail;
		$[141] = importProgress;
		$[142] = importStopped;
		$[143] = isLoading;
		$[144] = resumeImport;
		$[145] = t68;
	} else t68 = $[145];
	let t69;
	if ($[146] !== messagesContentRef || $[147] !== t60 || $[148] !== t61 || $[149] !== t62 || $[150] !== t63 || $[151] !== t64 || $[152] !== t65 || $[153] !== t66 || $[154] !== t67 || $[155] !== t68) {
		t69 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: messagesContentRef,
			className: t60,
			children: [
				t61,
				t62,
				t63,
				t64,
				t65,
				t66,
				t67,
				t68
			]
		});
		$[146] = messagesContentRef;
		$[147] = t60;
		$[148] = t61;
		$[149] = t62;
		$[150] = t63;
		$[151] = t64;
		$[152] = t65;
		$[153] = t66;
		$[154] = t67;
		$[155] = t68;
		$[156] = t69;
	} else t69 = $[156];
	let t70;
	if ($[157] !== messagesScrollRef || $[158] !== t57 || $[159] !== t69) {
		t70 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1 bg-ed-background",
			viewportClassName: t57,
			viewportRef: messagesScrollRef,
			children: t69
		});
		$[157] = messagesScrollRef;
		$[158] = t57;
		$[159] = t69;
		$[160] = t70;
	} else t70 = $[160];
	const t71 = variant === "sidebar-v2" ? "px-3 pb-3" : "px-2 pb-2";
	let t72;
	if ($[161] !== t71) {
		t72 = cn$2("relative -mt-2", t71);
		$[161] = t71;
		$[162] = t72;
	} else t72 = $[162];
	let t73;
	if ($[163] !== answerQuestions || $[164] !== askUserQuestions || $[165] !== questionsKey) {
		t73 = askUserQuestions.length > 0 && questionsKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 mb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskUserCard$1, {
				questions: askUserQuestions,
				onReply: answerQuestions
			}, questionsKey)
		});
		$[163] = answerQuestions;
		$[164] = askUserQuestions;
		$[165] = questionsKey;
		$[166] = t73;
	} else t73 = $[166];
	let t74;
	if ($[167] !== askUserQuestions.length || $[168] !== isLoading || $[169] !== queuedReply) {
		t74 = askUserQuestions.length === 0 && queuedReply && isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 mb-2 flex items-center gap-1.5 px-1 text-ed-chat text-ed-muted-foreground/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
				width: 12,
				height: 12,
				className: "shrink-0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: "Answered. Sending when the agent finishes setting up."
			})]
		});
		$[167] = askUserQuestions.length;
		$[168] = isLoading;
		$[169] = queuedReply;
		$[170] = t74;
	} else t74 = $[170];
	let t75;
	if ($[171] !== mentions.open || $[172] !== messagesAtBottom || $[173] !== scrollMessagesToBottom || $[174] !== slashOpen || $[175] !== variant) {
		t75 = variant === "sidebar-v2" && !messagesAtBottom && !slashOpen && !mentions.open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 bottom-full z-20 h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "icon-xs",
				isChildText: false,
				className: "pointer-events-auto absolute bottom-2 right-3 size-6 border-ed-border bg-ed-background p-0 text-ed-muted-foreground hover:bg-ed-ghost-hover",
				onClick: () => scrollMessagesToBottom("smooth"),
				"aria-label": "Scroll to newest message",
				title: "Scroll to newest message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
					width: 12,
					height: 12,
					className: "size-3"
				})
			})
		});
		$[171] = mentions.open;
		$[172] = messagesAtBottom;
		$[173] = scrollMessagesToBottom;
		$[174] = slashOpen;
		$[175] = variant;
		$[176] = t75;
	} else t75 = $[176];
	const t76 = "relative";
	let t77;
	if ($[177] !== mentions.id || $[178] !== mentions.loading || $[179] !== mentions.open || $[180] !== mentions.options || $[181] !== mentions.select || $[182] !== mentions.selectedIndex || $[183] !== mentions.setIndex) {
		t77 = mentions.open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMentionMenu, {
			id: mentions.id,
			options: mentions.options,
			selectedIndex: mentions.selectedIndex,
			onHover: mentions.setIndex,
			onSelect: mentions.select,
			loading: mentions.loading
		});
		$[177] = mentions.id;
		$[178] = mentions.loading;
		$[179] = mentions.open;
		$[180] = mentions.options;
		$[181] = mentions.select;
		$[182] = mentions.selectedIndex;
		$[183] = mentions.setIndex;
		$[184] = t77;
	} else t77 = $[184];
	let t78;
	if ($[185] !== filteredSlash || $[186] !== slashCommands || $[187] !== slashIndex || $[188] !== slashOpen) {
		t78 = slashOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlashCommandMenu, {
			commands: filteredSlash,
			selectedIndex: slashIndex,
			onHover: setSlashIndex,
			onSelect: applySlashCommand,
			loading: slashCommands === null
		});
		$[185] = filteredSlash;
		$[186] = slashCommands;
		$[187] = slashIndex;
		$[188] = slashOpen;
		$[189] = t78;
	} else t78 = $[189];
	const t79 = slashOpen || mentions.open ? "rounded-b-md" : "rounded-md";
	const t80 = variant === "sidebar-v2" ? "gap-2 px-2 py-2" : "gap-1.5 p-2.5";
	let t81;
	if ($[190] !== t79 || $[191] !== t80) {
		t81 = cn$2("relative z-10 flex flex-col border bg-ed-card shadow-[0_3px_12px_rgba(0,0,0,0.05)]", t79, t80);
		$[190] = t79;
		$[191] = t80;
		$[192] = t81;
	} else t81 = $[192];
	const t82 = composerFocused || slashOpen || mentions.open ? "var(--ed-menu-border)" : "var(--ed-border)";
	let t83;
	if ($[193] !== t82) {
		t83 = { borderColor: t82 };
		$[193] = t82;
		$[194] = t83;
	} else t83 = $[194];
	const t84 = (hasFolder || selectionRefs.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$2("flex flex-wrap items-center gap-1 border-b border-ed-border pb-2", variant === "sidebar-v2" ? "-mx-2 px-2" : "-mx-2.5 px-2.5"),
		children: [hasFolder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderChip, {
			folders: allowedPaths ?? [],
			onAdd: onAddAllowedPath,
			onRemove: onRemoveAllowedPath,
			onClear: onClearAllowedPaths
		}), selectionRefs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionContextChip, {
			elements: selectionRefs.map((ref_4) => getById(store, ref_4.id)).filter(_temp34$1),
			onRemove: removeSelectionItem,
			onClear: () => setDismissedSelection({
				selection: selectedElementIds,
				ids: new Set(selectedElementIds)
			})
		})]
	});
	let t85;
	if ($[195] !== hasComposerContent) {
		t85 = !hasComposerContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute left-0.5 top-0 text-ed-chat leading-5 text-ed-muted-foreground/50",
			children: "Design, build, / for skills, @ for context"
		});
		$[195] = hasComposerContent;
		$[196] = t85;
	} else t85 = $[196];
	const t86 = mentions.open;
	const t87 = mentions.open ? mentions.id : void 0;
	const t88 = mentions.open && mentions.options.length ? `${mentions.id}-option-${mentions.selectedIndex}` : void 0;
	const t89 = variant === "sidebar-v2" ? "min-h-6.5 text-ed-chat" : "min-h-[28px] text-ed-chat";
	let t90;
	if ($[197] !== t89) {
		t90 = cn$2(`ed-chat-composer w-full min-w-0 max-w-full max-h-[300px] overflow-y-auto whitespace-pre-wrap bg-transparent px-0.5 text-ed-foreground focus:outline-none ${WRAP_ANYWHERE_CLASS$1}`, t89, "leading-5");
		$[197] = t89;
		$[198] = t90;
	} else t90 = $[198];
	let t91;
	if ($[199] !== handleComposerBlur || $[200] !== handleComposerFocus || $[201] !== handleComposerInput || $[202] !== handleKeyDown || $[203] !== handlePaste || $[204] !== mentions.open || $[205] !== syncComposerMenus || $[206] !== t87 || $[207] !== t88 || $[208] !== t90) {
		t91 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: inputRef,
			contentEditable: true,
			"data-ph-mask": true,
			role: "combobox",
			"aria-label": "Message",
			"aria-autocomplete": "list",
			"aria-expanded": t86,
			"aria-controls": t87,
			"aria-activedescendant": t88,
			onInput: handleComposerInput,
			onKeyDown: handleKeyDown,
			onKeyUp: syncComposerMenus,
			onClick: syncComposerMenus,
			onFocus: handleComposerFocus,
			onBlur: handleComposerBlur,
			onPaste: handlePaste,
			"data-placeholder": "Design, build, / for skills, @ for context",
			className: t90
		});
		$[199] = handleComposerBlur;
		$[200] = handleComposerFocus;
		$[201] = handleComposerInput;
		$[202] = handleKeyDown;
		$[203] = handlePaste;
		$[204] = mentions.open;
		$[205] = syncComposerMenus;
		$[206] = t87;
		$[207] = t88;
		$[208] = t90;
		$[209] = t91;
	} else t91 = $[209];
	let t92;
	if ($[210] !== onSelectElement || $[211] !== referenceMounts || $[212] !== store) {
		t92 = referenceMounts.map((mount_3) => (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatReferenceChip, {
			reference: mount_3.reference,
			store,
			onSelectElement,
			onRemove: () => inlineComposerRef.current?.removeReference(mount_3.key)
		}), mount_3.node, mount_3.key));
		$[210] = onSelectElement;
		$[211] = referenceMounts;
		$[212] = store;
		$[213] = t92;
	} else t92 = $[213];
	let t93;
	if ($[214] !== t85 || $[215] !== t91 || $[216] !== t92) {
		t93 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-w-0",
			children: [
				t85,
				t91,
				t92
			]
		});
		$[214] = t85;
		$[215] = t91;
		$[216] = t92;
		$[217] = t93;
	} else t93 = $[217];
	const t94 = "-ml-1 flex min-w-0 items-center justify-between gap-2";
	let t95;
	if ($[218] === Symbol.for("react.memo_cache_sentinel")) {
		t95 = (value_0) => {
			setSelectedModel(value_0);
			try {
				localStorage.setItem("petal-ai-model", value_0);
			} catch {}
		};
		$[218] = t95;
	} else t95 = $[218];
	let t96;
	if ($[219] !== autoApprove || $[220] !== selectedModel || $[221] !== toggleAutoApprove) {
		t96 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPicker, {
			model: selectedModel,
			onModelChange: t95,
			autoApprove,
			onAutoApproveChange: toggleAutoApprove
		});
		$[219] = autoApprove;
		$[220] = selectedModel;
		$[221] = toggleAutoApprove;
		$[222] = t96;
	} else t96 = $[222];
	let t97;
	if ($[223] === Symbol.for("react.memo_cache_sentinel")) {
		t97 = (value_1) => {
			setSelectedEffort(value_1);
			try {
				localStorage.setItem("petal-ai-effort", value_1);
			} catch {}
		};
		$[223] = t97;
	} else t97 = $[223];
	let t98;
	if ($[224] !== selectedEffort || $[225] !== selectedModel) {
		t98 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffortPicker, {
			model: selectedModel,
			effort: selectedEffort,
			onEffortChange: t97
		});
		$[224] = selectedEffort;
		$[225] = selectedModel;
		$[226] = t98;
	} else t98 = $[226];
	let t99;
	if ($[227] !== t96 || $[228] !== t98) {
		t99 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-1",
			children: [t96, t98]
		});
		$[227] = t96;
		$[228] = t98;
		$[229] = t99;
	} else t99 = $[229];
	const t100 = "flex shrink-0 items-center gap-0.5";
	let t101;
	if ($[230] !== attachFiles) {
		t101 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: attachInputRef,
			type: "file",
			accept: CHAT_ATTACHMENT_ACCEPT,
			multiple: true,
			className: "hidden",
			onChange: (e_4) => {
				const files = e_4.target.files;
				if (!files) return;
				attachFiles(Array.from(files, _temp35$1));
				e_4.target.value = "";
			}
		});
		$[230] = attachFiles;
		$[231] = t101;
	} else t101 = $[231];
	const T0 = ContextMenu;
	let t102;
	if ($[232] !== allowedPaths) {
		t102 = allowedPaths ?? [];
		$[232] = allowedPaths;
		$[233] = t102;
	} else t102 = $[233];
	let t103;
	if ($[234] === Symbol.for("react.memo_cache_sentinel")) {
		t103 = () => attachInputRef.current?.click();
		$[234] = t103;
	} else t103 = $[234];
	const t104 = selectedRefs.length > 0 ? pinSelection : void 0;
	const t105 = contextRefs.flatMap(_temp36$1);
	let t106;
	if ($[235] !== addContextRef || $[236] !== removeContextRef) {
		t106 = (connection, selected) => {
			const id_3 = `connection:${connection.name}`;
			if (selected) addContextRef({
				type: "connection",
				id: id_3,
				name: connection.name,
				displayName: connectionDisplayName(connection)
			});
			else {
				removeContextRef(id_3);
				inputRef.current?.focus();
			}
		};
		$[235] = addContextRef;
		$[236] = removeContextRef;
		$[237] = t106;
	} else t106 = $[237];
	let t107;
	if ($[238] !== T0 || $[239] !== onAddAllowedPath || $[240] !== onRemoveAllowedPath || $[241] !== openSkillsMenu || $[242] !== t102 || $[243] !== t103 || $[244] !== t104 || $[245] !== t105 || $[246] !== t106) {
		t107 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			folders: t102,
			onAddFolder: onAddAllowedPath,
			onRemoveFolder: onRemoveAllowedPath,
			onAttach: t103,
			onPinSelection: t104,
			onOpenSkills: openSkillsMenu,
			selectedConnections: t105,
			onConnectionChange: t106
		});
		$[238] = T0;
		$[239] = onAddAllowedPath;
		$[240] = onRemoveAllowedPath;
		$[241] = openSkillsMenu;
		$[242] = t102;
		$[243] = t103;
		$[244] = t104;
		$[245] = t105;
		$[246] = t106;
		$[247] = t107;
	} else t107 = $[247];
	let t108;
	if ($[248] !== canSend || $[249] !== handleStop || $[250] !== handleSubmit || $[251] !== isLoading) {
		t108 = isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Stop response",
			onClick: handleStop,
			variant: "outline",
			className: "text-ed-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopIcon, {})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Send message",
			onClick: () => {
				handleSubmit();
			},
			variant: "secondary",
			"aria-disabled": !canSend,
			className: cn$2(!canSend && "text-ed-muted-foreground"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {})
		});
		$[248] = canSend;
		$[249] = handleStop;
		$[250] = handleSubmit;
		$[251] = isLoading;
		$[252] = t108;
	} else t108 = $[252];
	let t109;
	if ($[253] !== t101 || $[254] !== t107 || $[255] !== t108) {
		t109 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t100,
			children: [
				t101,
				t107,
				t108
			]
		});
		$[253] = t101;
		$[254] = t107;
		$[255] = t108;
		$[256] = t109;
	} else t109 = $[256];
	let t110;
	if ($[257] !== t109 || $[258] !== t99) {
		t110 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t94,
			children: [t99, t109]
		});
		$[257] = t109;
		$[258] = t99;
		$[259] = t110;
	} else t110 = $[259];
	let t111;
	if ($[260] !== t110 || $[261] !== t81 || $[262] !== t83 || $[263] !== t84 || $[264] !== t93) {
		t111 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t81,
			style: t83,
			children: [
				t84,
				t93,
				t110
			]
		});
		$[260] = t110;
		$[261] = t81;
		$[262] = t83;
		$[263] = t84;
		$[264] = t93;
		$[265] = t111;
	} else t111 = $[265];
	let t112;
	if ($[266] !== t111 || $[267] !== t77 || $[268] !== t78) {
		t112 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t76,
			children: [
				t77,
				t78,
				t111
			]
		});
		$[266] = t111;
		$[267] = t77;
		$[268] = t78;
		$[269] = t112;
	} else t112 = $[269];
	let t113;
	if ($[270] !== t112 || $[271] !== t72 || $[272] !== t73 || $[273] !== t74 || $[274] !== t75) {
		t113 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t72,
			children: [
				t73,
				t74,
				t75,
				t112
			]
		});
		$[270] = t112;
		$[271] = t72;
		$[272] = t73;
		$[273] = t74;
		$[274] = t75;
		$[275] = t113;
	} else t113 = $[275];
	let t114;
	if ($[276] !== lightboxUrl || $[277] !== setLightboxUrl) {
		t114 = lightboxUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 flex items-center justify-center bg-black/70",
			style: {
				zIndex: 99999,
				WebkitAppRegion: "no-drag"
			},
			onClick: () => setLightboxUrl(null),
			onKeyDown: (e_5) => e_5.key === "Escape" && setLightboxUrl(null),
			tabIndex: 0,
			ref: _temp37$1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: (e_6) => {
					e_6.stopPropagation();
					setLightboxUrl(null);
				},
				variant: "ghost",
				size: "icon-sm",
				className: "absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70 hover:text-white",
				LeftIcon: XIcon,
				leftIconSize: 20,
				"aria-label": "Close screenshot"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: lightboxUrl,
				alt: "Screenshot",
				className: "max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
			})]
		});
		$[276] = lightboxUrl;
		$[277] = setLightboxUrl;
		$[278] = t114;
	} else t114 = $[278];
	let t115;
	if ($[279] !== claudeStatus || $[280] !== setSetupOpen) {
		t115 = (next_1) => {
			setSetupOpen(next_1);
			if (!next_1) claudeStatus.refresh();
		};
		$[279] = claudeStatus;
		$[280] = setSetupOpen;
		$[281] = t115;
	} else t115 = $[281];
	let t116;
	if ($[282] !== claudeStatus.refresh || $[283] !== setupOpen || $[284] !== t115) {
		t116 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupModal, {
			open: setupOpen,
			onOpenChange: t115,
			onConsent: claudeStatus.refresh
		});
		$[282] = claudeStatus.refresh;
		$[283] = setupOpen;
		$[284] = t115;
		$[285] = t116;
	} else t116 = $[285];
	let t117;
	if ($[286] !== handleDrop || $[287] !== t113 || $[288] !== t114 || $[289] !== t116 || $[290] !== t53 || $[291] !== t54 || $[292] !== t55 || $[293] !== t70) {
		t117 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t53,
			onDrop: handleDrop,
			onDragOver: t54,
			children: [
				t55,
				t70,
				t113,
				t114,
				t116
			]
		});
		$[286] = handleDrop;
		$[287] = t113;
		$[288] = t114;
		$[289] = t116;
		$[290] = t53;
		$[291] = t54;
		$[292] = t55;
		$[293] = t70;
		$[294] = t117;
	} else t117 = $[294];
	return t117;
});
function _temp13$4(t0) {
	const [name, entry] = t0;
	return name.toLowerCase() === "button" || String(entry?.exportName || "").toLowerCase() === "button";
}
function _temp14$4(mount) {
	return mount.reference;
}
function _temp15$3(chip) {
	return chip.remove();
}
function _temp16$3() {}
function _temp17$3() {
	return publishAiWriteTarget(null);
}
function _temp18$3(mount_1) {
	return mount_1.reference.region || mount_1.reference.type === "element" ? [mount_1.reference] : [];
}
function _temp19$3(ref_3) {
	const match = ref_3.region && /^Area (\d+)$/.exec(ref_3.name);
	return match ? [Number(match[1])] : [];
}
function _temp20$3(count_1) {
	return count_1 + 1;
}
function _temp21$3(previous_1) {
	return [...previous_1];
}
function _temp22$3(count_2) {
	return count_2 - 1;
}
function _temp23$3(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function _temp24$3(d) {
	return !d.canvasOnly;
}
function _temp25$2(d_0) {
	return d_0.method === "ast";
}
function _temp26$2(d_1) {
	return d_1.method === "ai";
}
function _temp27$2(step) {
	return step.status === "active" ? {
		...step,
		status: "done"
	} : step;
}
function _temp28$2(step_0) {
	return step_0.status !== "done";
}
function _temp29$1(e_2) {
	return e_2.preventDefault();
}
function _temp30$1(e_3) {
	return e_3.preventDefault();
}
function _temp31$1(elapsedMs) {
	return elapsedMs >= 1e3 ? ` ${formatWorkDuration(elapsedMs)}` : "";
}
function _temp32$1(file_0) {
	return typeof file_0?.local_path === "string" ? [file_0.local_path] : [];
}
function _temp33$1(msg, i_4) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["[debug] ", msg] }, i_4);
}
function _temp34$1(element_0) {
	return !!element_0;
}
function _temp35$1(file_1) {
	return {
		file: file_1,
		isDirectory: false
	};
}
function _temp36$1(ref_5) {
	return ref_5.type === "connection" ? [ref_5.name] : [];
}
function _temp37$1(el) {
	return el?.focus();
}

export { ChatPanel, IMPORT_DESIGN_SYSTEM_PROMPT };
