// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/elementChatReference.ts
import { getElementLabel } from "../components/panels/layerSearch.js";
import { webviewEditStore } from "../../shared/state/webviewEditStore.js";

/** The same element attachment for Cmd+L, the selection chip, and MCP snapshots. */
function elementChatReference(element, pageId, inspection = webviewEditStore.getState()) {
	const ref = {
		type: "element",
		id: element.id,
		name: getElementLabel(element),
		elementKind: element.type === "component" || element.type === "capture" ? "component" : "element",
		...pageId ? { pageId } : {}
	};
	if (element.type === "webview") {
		const state = inspection;
		const selection = state.active && state.activeWebviewId === element.id ? state.selection : null;
		ref.webview = {
			elementId: element.id,
			url: element.src,
			...selection ? {
				tag: selection.tag,
				text: selection.text,
				className: selection.originalClassName ?? selection.className,
				resolveState: selection.resolveState,
				...selection.src ? { source: { ...selection.src } } : {}
			} : {}
		};
	}
	return ref;
}

export { elementChatReference };
