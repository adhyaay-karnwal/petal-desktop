// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/folderShared.ts

/**
* "The user just picked a folder for the AI." Settings publishes it; the chat
* panel settles its parked folder-access prompt on it. Keyed on the pick, not
* on the allowed-path list changing: re-picking a folder that is already
* shared is a no-op mutation but still an answer.
*/
var EVENT = "petal-folder-shared";
function publishFolderShared(path) {
	window.dispatchEvent(new CustomEvent(EVENT, { detail: { path } }));
}
function subscribeFolderShared(listener) {
	const handler = (event) => listener(event.detail.path);
	window.addEventListener(EVENT, handler);
	return () => window.removeEventListener(EVENT, handler);
}

export { publishFolderShared, subscribeFolderShared };
