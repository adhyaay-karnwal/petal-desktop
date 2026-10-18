// Reconstructed from index-C74mRL57.js — original module: packages/ai/src/sidebarChat.ts

var SIDEBAR_CHAT_REQUEST_CHANNEL = "sidebar_chat_request";
var SIDEBAR_CHAT_RESULT_CHANNEL = "sidebar_chat_result";
var SIDEBAR_CHAT_PROGRESS_CHANNEL = "sidebar_chat_progress";
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

export { SIDEBAR_CHAT_PROGRESS_CHANNEL, SIDEBAR_CHAT_REQUEST_CHANNEL, SIDEBAR_CHAT_RESULT_CHANNEL, isAgentCanvasCommandType };
