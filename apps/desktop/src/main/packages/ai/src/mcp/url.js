// Reconstructed from index.js — original module: packages/ai/src/mcp/url.ts

/**
* Shared `/mcp` listen URL helpers. In-app clients append optional bind
* params; external clients use the bare path.
*/
/** Append optional in-app bind params to the shared `/mcp` listen URL. */
function mcpUrl(baseUrl, ids) {
	if (!ids?.projectId && !ids?.chatTabId && !ids?.streamId) return baseUrl;
	const url = new URL(baseUrl);
	if (ids.projectId) url.searchParams.set("projectId", ids.projectId);
	if (ids.chatTabId) url.searchParams.set("chatTabId", ids.chatTabId);
	if (ids.streamId) url.searchParams.set("streamId", ids.streamId);
	return url.href;
}
var CANVAS_COMMAND_TYPE_SET = /* @__PURE__ */ new Set([
	"readCanvas",
	"listPages",
	"createPage",
	"addToCanvas",
	"insertElement",
	"editElement",
	"updateElement",
	"patchElements",
	"renameElement",
	"duplicateElement",
	"deleteElement",
	"grepCanvas",
	"queryCanvas",
	"searchIcons",
	"previewDraw",
	"previewDrop"
]);
/** Whether an untrusted value names a canvas command type. */
function isAgentCanvasCommandType(value) {
	return typeof value === "string" && CANVAS_COMMAND_TYPE_SET.has(value);
}

export { isAgentCanvasCommandType, mcpUrl };
