// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatContextReferences.ts
import { webviewReferenceLine } from "../../../../ai/src/prompts/turnPrompt.js";
import { connectionDisplayName } from "../hooks/useClaudeContext.js";

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
function getContextOptions(components, pages, connections, selectedIds, query) {
	const options = [
		...connections.map((connection) => ({
			type: "connection",
			id: `connection:${connection.name}`,
			name: connection.name,
			displayName: connectionDisplayName(connection)
		})),
		...Object.entries(components).map(([name, info]) => ({
			type: "component",
			id: `component:${name}`,
			name,
			path: info.path
		})),
		...pages.map((page) => ({
			type: "page",
			id: `page:${page.id}`,
			pageId: page.id,
			name: page.name
		}))
	];
	const words = query.trim().toLowerCase().split(/\s+/);
	return options.filter((option) => !selectedIds.has(option.id) && words.every((word) => `${option.displayName ?? option.name} ${option.name} ${option.path ?? ""}`.toLowerCase().includes(word)));
}
/** An @ token at a word boundary; email addresses do not open the picker. */
function readContextToken(input) {
	const selection = window.getSelection();
	if (!input || !selection?.isCollapsed || !selection.rangeCount || !input.contains(selection.anchorNode)) return null;
	const before = selection.getRangeAt(0).cloneRange();
	before.setStart(input, 0);
	const text = before.toString();
	const match = /(?:^|[\s(])@([^@\n]*)$/.exec(text);
	if (!match) return null;
	let offset = text.length - match[1].length - 1;
	const walker = document.createTreeWalker(input, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	while (node) {
		const length = node.textContent?.length ?? 0;
		if (offset < length) {
			const token = selection.getRangeAt(0).cloneRange();
			token.setStart(node, offset);
			if (token.cloneContents().querySelector("br, div, p")) return null;
			return token;
		}
		offset -= length;
		node = walker.nextNode();
	}
	return null;
}
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

export { getContextOptions, projectReferenceLine, readContextToken };
