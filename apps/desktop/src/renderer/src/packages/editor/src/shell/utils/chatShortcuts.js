// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatShortcuts.ts

/** Cmd/Ctrl+L adds canvas selection to the prompt. */
function isAddToPromptShortcut(event) {
	return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "l";
}
/** Shift+Cmd/Ctrl+A marks the current chat's masked areas on the canvas. */
function isChatAreasShortcut(event) {
	return (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey && event.key.toLowerCase() === "a";
}
/** Cmd/Ctrl+N opens a new chat. Cmd+T opens the desktop file picker. */
function isNewChatShortcut(event) {
	return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "n";
}

export { isAddToPromptShortcut, isChatAreasShortcut, isNewChatShortcut };
