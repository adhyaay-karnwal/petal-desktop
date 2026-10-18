// Reconstructed from index-C74mRL57.js — original module: packages/ai/src/prompts/turnPrompt.ts

function webviewReferenceLine(ref) {
	if (!ref.webview) return null;
	return `  → Mini-browser target: ${JSON.stringify(ref.webview)}${ref.pageId ? ` (canvas_id: ${JSON.stringify(ref.pageId)})` : ""}. Source resolution may be pending or unavailable; verify before editing.`;
}

export { webviewReferenceLine };
