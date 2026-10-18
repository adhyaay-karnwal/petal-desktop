// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/sidebarChat.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { defineTool, getToolContext, textResult } from "./utils.js";

var id = require_dist$2.string().min(1).max(512);
var targets = require_dist$2.array(require_dist$2.discriminatedUnion("type", [
	require_dist$2.object({
		type: require_dist$2.literal("element"),
		id,
		page_id: id.optional()
	}).strict(),
	require_dist$2.object({
		type: require_dist$2.literal("webview"),
		id,
		page_id: id.optional()
	}).strict(),
	require_dist$2.object({
		type: require_dist$2.literal("component"),
		name: id
	}).strict(),
	require_dist$2.object({
		type: require_dist$2.literal("page"),
		id
	}).strict()
])).max(100).optional();
/** One schema source for the legacy and v2 MCP transports. */
var sidebarChatDefinitions = [
	{
		name: "project_context",
		operation: "navigate",
		description: "Return verified context for the bound project: active page and all page IDs/names/loading states. Waits for initial page loading. Does not switch tabs or pages. Optional project_id asserts the expected binding.",
		schema: require_dist$2.object({ project_id: id.optional() }).strict()
	},
	{
		name: "page_open",
		operation: "navigate",
		description: "Select and load a page in the bound project through the existing page navigation. Use page IDs from canvas_list or project_context. Returns verified active project/page context and the page list after loading; never creates a page. Optional project_id asserts the expected binding.",
		schema: require_dist$2.object({
			page_id: id,
			project_id: id.optional()
		}).strict()
	},
	{
		name: "chat_models",
		operation: "models",
		description: "Discover sidebar agents/providers, live model IDs and installed/sign-in status in the bound project. Uses existing app authentication; does not sign in or install anything.",
		schema: require_dist$2.object({ agent_id: id.optional() }).strict()
	},
	{
		name: "chat_context",
		operation: "context",
		description: "Snapshot the sidebar structured references: current selection (Cmd+L), draft attachments including Cmd+Shift+S masked areas, explicit element/page/component/webview targets, or a canvas-space region on the active page. Returns a context_id to pass to chat_send, exact IDs/source paths, and image availability without image bytes. Webview targets retain URL and the current inspected source/fingerprint when available. References guide the agent; they do not restrict its edits. Snapshot expires after ten minutes or project close.",
		schema: require_dist$2.object({
			selection: require_dist$2.boolean().optional(),
			draft: require_dist$2.boolean().optional(),
			chat_id: id.optional(),
			targets,
			region: require_dist$2.object({
				x: require_dist$2.number().finite(),
				y: require_dist$2.number().finite(),
				width: require_dist$2.number().positive().finite(),
				height: require_dist$2.number().positive().finite(),
				page_id: id.optional()
			}).strict().optional()
		}).strict()
	},
	{
		name: "chat_send",
		operation: "send",
		description: "Start a visible sidebar chat (omit chat_id) or send to an existing chat, using a provider/model from chat_models and structured context_id from chat_context. With no context_id, captures current canvas selection without consuming the draft. Reuses sidebar execution, authentication, project scope, allowed folders, approval policy and transcript persistence. Returns accepted and chat_id, not completion; inspect with chat_read. An existing chat keeps its provider. request_id is an idempotency key: reuse the same key and arguments after an uncertain response. References are prompt context, not an enforced edit boundary.",
		schema: require_dist$2.object({
			request_id: id,
			prompt: require_dist$2.string().trim().min(1).max(1e5),
			chat_id: id.optional(),
			agent_id: id.optional(),
			model_id: id.optional(),
			context_id: id.optional()
		}).strict()
	},
	{
		name: "chat_read",
		operation: "read",
		description: "List loaded sidebar chats, or inspect a chat by chat_id: running/error/approval status and a paginated transcript with structured references. Image bytes are omitted. Does not approve tools or alter the chat.",
		schema: require_dist$2.object({
			chat_id: id.optional(),
			offset: require_dist$2.number().int().nonnegative().optional(),
			limit: require_dist$2.number().int().min(1).max(100).optional()
		}).strict()
	}
];
function parseSidebarChatTool(name, input) {
	const tool = sidebarChatDefinitions.find((tool) => tool.name === name);
	if (!tool) throw new Error(`Unknown sidebar chat tool: ${name}`);
	return {
		...tool.schema.parse(input),
		operation: tool.operation
	};
}
function sidebarChatLegacyTools() {
	return sidebarChatDefinitions.map((tool) => ({
		name: tool.name,
		description: tool.description,
		inputSchema: require_dist$2.toJSONSchema(tool.schema)
	}));
}
/** External only: agents running inside a sidebar never see delegation tools. */
function createSidebarChatTools() {
	return sidebarChatDefinitions.map((tool) => defineTool({
		name: tool.name,
		config: {
			description: tool.description,
			inputSchema: tool.schema
		},
		async execute(args) {
			return textResult(await getToolContext().host.sidebarChat({
				...tool.schema.parse(args),
				operation: tool.operation
			}));
		}
	}));
}

export { createSidebarChatTools, parseSidebarChatTool, sidebarChatLegacyTools };
