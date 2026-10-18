// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/previewAddToChat.ts

var addToChat = null;
function registerPreviewAddToChat(fn) {
	addToChat = fn;
	return () => {
		if (addToChat === fn) addToChat = null;
	};
}
function previewAddToChat() {
	addToChat?.();
}

export { previewAddToChat, registerPreviewAddToChat };
