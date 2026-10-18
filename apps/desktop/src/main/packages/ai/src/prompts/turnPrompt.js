// Reconstructed from index.js — original module: packages/ai/src/prompts/turnPrompt.ts

/**
* Shared prompt-composition helpers for the agents-v2 drivers.
*
* Each driver lays the turn out differently, but they agree on how to join the
* parts and how to spot a message that leads with a `/skill`. The host-context
* XML (`<petal-context>`, `<references>`) is also built here: the editor
* sends facts, Electron main adds the mid-session folder diff, and this module
* owns the strings.
*/
/** Mid-session extra-folder diff: paths in `current` that were not in `previous`. */
function addedDirectories(previous, current) {
	const seen = new Set(previous);
	const added = [];
	for (const path of current) {
		if (seen.has(path)) continue;
		seen.add(path);
		added.push(path);
	}
	return added;
}
/** A message that starts with `/name` names a skill or command. */
var SLASH_COMMAND_RE = /^\/[\w:-]+(?:\s|$)/;
/**
* A `/name` after whitespace, as the composer's `/` picker writes it. Paths
* (`/a/b`, `/notes.md`) and URLs do not match.
*/
var INLINE_SLASH_RE = /(?<=\s)\/([\w:-]+?)[:-]*(?=$|\s|[.,;:!?)\]](?:\s|$))/g;
/**
* Names written as `/name` later in the message. Agents dispatch a `/name` only
* when it starts the prompt, so these arrive as plain text unless spelled out.
* The leading command is left to the agent and is not repeated here.
*/
function inlineSlashNames(prompt) {
	const leading = SLASH_COMMAND_RE.exec(prompt)?.[0].trim().slice(1);
	const names = /* @__PURE__ */ new Set();
	for (const match of prompt.matchAll(INLINE_SLASH_RE)) if (match[1] !== leading) names.add(match[1]);
	return [...names];
}
/** Tells the agent to use skills the user named mid-message. */
function formatInlineSkillsBlock(names) {
	if (names.length === 0) return void 0;
	const list = names.map((name) => `/${name}`).join(", ");
	return xmlBlock("skills", `The user's message invokes ${names.length === 1 ? "this skill" : "these skills"}: ${list}. Load each skill named here and follow its instructions for this request, as you would for a message that starts with /name.`);
}
/** Join the parts of a turn a driver places around a leading slash command. */
function joinPromptSegments(...parts) {
	return parts.filter((part) => typeof part === "string" && part.length > 0).join("\n\n");
}
function xmlBlock(tag, body) {
	return `<${tag}>\n${body}\n</${tag}>`;
}
function componentLabel(c) {
	const attrs = [...c.key !== void 0 ? [`key=${JSON.stringify(c.key)}`] : [], ...Object.entries(c.props ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`)];
	let label = `<${c.name}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
	if (c.position) label += ` (${c.position.index} of ${c.position.count})`;
	if (c.path) label += ` defined in ${c.path}`;
	return label;
}
/** Where a Live Preview area's code is: the lines below, or the project serving its URL. */
function previewLine(region) {
	const { url, elementId } = region.preview;
	const where = region.sources?.length ? "at the lines under \"Written at\"" : `in the project that serves ${JSON.stringify(url)}: find it among the folders you were given, and ask the user for it if none does`;
	return `    It is inside the Live Preview of ${JSON.stringify(url)} (element_id: ${elementId}): a running app shown on the canvas, not canvas layers. Change the app's source code ${where}; never edit canvas elements to match it. take_screenshot on that element_id shows the page.`;
}
function regionReferenceLine(name, region, hasScreenshot) {
	const { x, y, width, height } = region.rect;
	const list = (elements) => elements.map((e) => `${JSON.stringify(e.label)} (element_id: ${e.id})`).join(", ");
	const screenshot = hasScreenshot ? "The attached screenshot shows it outlined in blue, with its surroundings dimmed." : "No screenshot could be captured for it.";
	const evidence = hasScreenshot ? "the screenshot, the ids and the components below" : "the ids and the components below";
	const lines = [`  → ${name}: an area the user masked on the canvas${region.pageId ? ` (canvas_id: ${JSON.stringify(region.pageId)})` : ""} at x=${x}, y=${y}, ${width}×${height}. ${screenshot} The mask is hand-drawn, so it rarely matches element bounds exactly — use ${evidence} to work out what they mean.`];
	if (region.preview) lines.push(previewLine(region));
	if (region.inside.length) lines.push(`    Inside it: ${list(region.inside)}`);
	if (region.within.length) lines.push(`    It sits within: ${list(region.within)}`);
	if (region.partial.length) lines.push(`    Partly covered: ${region.partial.map((e) => `${JSON.stringify(e.label)} (element_id: ${e.id}, ${Math.round(e.coverage * 100)}% inside)`).join(", ")}`);
	if (region.components?.length) {
		const chain = region.components.map(componentLabel).join(" › ");
		lines.push(`    Drawn by (innermost first): ${chain}${region.componentElementId ? ` — canvas element_id: ${region.componentElementId}` : ""}. The outer components only say where it is nested.`);
	}
	if (region.sources?.length) lines.push(`    Written at (innermost first): ${region.sources.map((s) => `${s.file}:${s.line}`).join(" › ")}. These are exact JSX lines of the DOM under the area; edit the innermost one outside shared primitives (components/ui) unless the change belongs in the primitive itself.`);
	if (region.portaled) lines.push("    It renders in a portal (popover, menu or dialog), so its JSX may be in a different file from the page around it.");
	if (region.icon) lines.push(`    Icon under it: ${region.icon}`);
	if (region.text) lines.push(`    Visible text: ${JSON.stringify(region.text)}`);
	return lines.join("\n");
}
function webviewReferenceLine(ref) {
	if (!ref.webview) return null;
	return `  → Mini-browser target: ${JSON.stringify(ref.webview)}${ref.pageId ? ` (canvas_id: ${JSON.stringify(ref.pageId)})` : ""}. Source resolution may be pending or unavailable; verify before editing.`;
}
/** The `→ …` line for a component, page, or masked canvas area; null otherwise. */
function projectReferenceLine(ref) {
	if (ref.webview) return webviewReferenceLine(ref);
	if (ref.region) return regionReferenceLine(ref.name, ref.region, !!ref.data);
	if (ref.type === "component") {
		const source = ref.path ? ` (source: ${JSON.stringify(ref.path)}). Use this exact source path directly; read the source when needed for the request. Search for the component only if this path is unavailable.` : "";
		return `  → Component: ${JSON.stringify(ref.name)}${source}`;
	}
	if (ref.type === "page") return `  → Canvas page: ${JSON.stringify(ref.name)} (canvas_id: ${JSON.stringify(ref.pageId)})`;
	return null;
}
var DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
/** The image a reference attaches, or null when it carries no usable image bytes. */
function promptImage(ref) {
	if (typeof ref.data !== "string" || !ref.data) return null;
	const match = DATA_URL_RE.exec(ref.data);
	if (!match?.[1] || !match[2]) return null;
	return {
		mediaType: match[1],
		data: match[2]
	};
}
/**
* Image bytes referenced by the host context, in reference order. Empty when
* capture failed. `formatReferencesBlock` numbers the same images, so keep both
* on `promptImage`.
*/
function promptImages$1(refs) {
	return (refs ?? []).flatMap((ref) => promptImage(ref) ?? []);
}
/**
* String prompt, or a user message that also carries the captured images.
* The text still says a screenshot is attached only when `ref.data` was set;
* those bytes have to ride along or the model is told about a picture it cannot see.
*/
function userTurnPrompt(text, images) {
	if (!images?.length) return text;
	return [{
		role: "user",
		content: [{
			type: "text",
			text
		}, ...images.map((image, index) => ({
			type: "file",
			mediaType: image.mediaType,
			filename: `image-${index + 1}`,
			data: image.data
		}))]
	}];
}
/** Host-attached context for the agent turn. Connection refs get their own block. */
function formatReferencesBlock(refs) {
	const refLines = [];
	let attached = 0;
	for (const original of refs) {
		const ref = promptImage(original) ? {
			...original,
			name: `${original.name} (attached image ${++attached})`
		} : original;
		if (ref.type === "connection") continue;
		const projectLine = projectReferenceLine(ref);
		if (projectLine) refLines.push(projectLine);
		else if (ref.type === "element") refLines.push(`  → Element: ${ref.name} (${ref.id})${ref.pageId ? ` (canvas_id: ${JSON.stringify(ref.pageId)})` : ""}`);
		else if (ref.type === "folder") refLines.push(`  → Folder (this request only): ${JSON.stringify(ref.path)}`);
		else if (ref.type === "image") refLines.push(`  → Image: ${ref.name}`);
		else refLines.push(`  → File: ${ref.name}`);
	}
	if (refLines.length === 0) return void 0;
	return xmlBlock("references", refLines.join("\n"));
}
/** Keeps the transcript well under CLI argument limits; the newest messages win. */
var TRANSCRIPT_MAX_CHARS = 6e4;
function transcriptEntryText(entry) {
	const lines = [`${entry.role === "user" ? "User" : "Assistant"}: ${entry.text.trim()}`];
	if (entry.tools?.length) lines.push(`(Tools used: ${[...new Set(entry.tools)].join(", ")})`);
	return lines.join("\n");
}
/** The chat so far, newest messages kept when it runs over the limit. */
function formatTranscriptBlock(entries) {
	const kept = [];
	let size = 0;
	for (let i = entries.length - 1; i >= 0; i--) {
		const text = transcriptEntryText(entries[i]);
		if (size + text.length > TRANSCRIPT_MAX_CHARS) {
			if (kept.length === 0) kept.unshift(`…${text.slice(-6e4)}`);
			break;
		}
		kept.unshift(text);
		size += text.length;
	}
	if (kept.length === 0) return void 0;
	return xmlBlock("earlier-conversation", `You are joining this chat partway through. Here is the conversation so far; continue from it. Read a canvas page or file again before you change it: this text does not show its current state.\nA different agent may have written the earlier messages, so the tools they name can be ones you do not have. Use the tool definitions available to you now; do not call a tool because it appears here.\n\n${kept.length < entries.length ? "[Earlier messages omitted.]\n\n" : ""}${kept.join("\n\n")}`);
}
/**
* MCP servers the user picked for this message. A hint, not a restriction:
* names stay JSON-quoted (they are untrusted config keys) and verbatim, so a
* plugin server's `plugin:<plugin>:<server>` name still resolves.
*/
function formatConnectionsBlock(refs) {
	const names = [...new Set(refs.flatMap((ref) => ref.type === "connection" ? [ref.name] : []))];
	if (names.length === 0) return void 0;
	return xmlBlock("connections", ["The user selected these MCP connections for this request. Use them when relevant. If a selected connection is unavailable, say so. Other available connections may still be used as needed; existing permissions still apply.", ...names.map((name) => `- ${JSON.stringify(name)}`)].join("\n"));
}
/**
* Render the host context for one turn. Returns the joined XML, or `undefined`
* when there is nothing to send. Added-folder lines only appear when the caller
* passes the directories that were newly allowed for this turn.
*/
function formatHostPromptPrefix(input) {
	const canvasLines = [];
	if (input.activePage) canvasLines.push(`Active canvas page: ${input.activePage.name} (id ${input.activePage.id})`);
	if (input.focusedComponent) canvasLines.push(`Focused component: ${input.focusedComponent}`);
	const ids = input.selectedElementIds ?? [];
	if (ids.length > 0) canvasLines.push(`Selected canvas element ids: ${ids.join(", ")}`);
	if (input.addedDirectories?.length) {
		canvasLines.push("The user added these directories to this session. You may read and write files in them. Do not write to the workspace cwd.");
		for (const path of input.addedDirectories) canvasLines.push(`- ${path}`);
	}
	const blocks = [];
	const transcript = formatTranscriptBlock(input.transcript ?? []);
	if (transcript) blocks.push(transcript);
	if (canvasLines.length > 0) blocks.push(xmlBlock("petal-context", canvasLines.join("\n")));
	const references = formatReferencesBlock(input.references ?? []);
	if (references) blocks.push(references);
	const connections = formatConnectionsBlock(input.references ?? []);
	if (connections) blocks.push(connections);
	return blocks.length > 0 ? blocks.join("\n\n") : void 0;
}

export { SLASH_COMMAND_RE, addedDirectories, formatHostPromptPrefix, formatInlineSkillsBlock, inlineSlashNames, joinPromptSegments, promptImages$1, userTurnPrompt };
