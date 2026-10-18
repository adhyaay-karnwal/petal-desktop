// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatToolFailure.ts

function toolFailureReport(result, chatId) {
	const payload = result.payload;
	const error = payload.error;
	const message = typeof error === "string" ? error : error && typeof error === "object" && "message" in error ? String(error.message) : error ? JSON.stringify(error, null, 2) : "The tool reported a failure without an error message.";
	return [
		`Action: ${payload.toolName || result.type}`,
		payload.path && `Path: ${payload.path}`,
		payload.elementId && `Element: ${payload.elementId}`,
		payload.canvasId && `Canvas: ${payload.canvasId}`,
		chatId && `Chat: ${chatId}`,
		`\nError:\n${message}`
	].filter(Boolean).join("\n");
}

export { toolFailureReport };
