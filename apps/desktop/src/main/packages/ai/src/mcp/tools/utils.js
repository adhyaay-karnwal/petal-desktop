// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/utils.ts
import { node_async_hooks } from "../../../../../__bundle__/_preamble.js";
import { currentRequestAbortSignal, linkAbortSignals } from "../requestAbort.js";

/**
* Tool-family utilities: the tool authoring helper, the tool-call context and
* result builders.
*
* `defineTool` authors one `McpToolDefinition` while keeping the input shape
* inferred from `config.inputSchema`, so `execute` sees the parsed args.
*
* Tool callbacks are SDK-shaped: `(args, extra)`. The call context — the
* durable `McpSession` plus anything else the server attaches — is not a
* callback argument, so `McpServer` runs each call inside an
* `AsyncLocalStorage` scope and tool callbacks read it with `getToolContext()`.
*
* `textResult` and `errorResult` build the SDK's `CallToolResult` shape.
* `commandResult` builds the tool result for a host command from the data it
* resolved; `formatCommandResult` turns an `AgentResult` envelope into it.
*/
var toolContextStore = new node_async_hooks.AsyncLocalStorage();
/** Run `run` with `context` as the current tool context. Used by `McpServer`. */
function runWithToolContext(context, run) {
	return toolContextStore.run(context, run);
}
/** The context of the tool call currently executing. */
function getToolContext() {
	const context = toolContextStore.getStore();
	if (!context) throw new Error("getToolContext() called outside an MCP tool call");
	return context;
}
/**
* Author a tool definition. Inlining a literal into `McpToolDefinition` erases
* its input shape (`execute` would see `ShapeOutput<ZodRawShapeCompat>`), so
* tools declare their definition through this helper: `InputArgs` is inferred
* from `config.inputSchema`, and `execute` receives that shape's parsed args.
*
* The result is widened back to `McpToolDefinition` — the callback param types
* are contravariant, so the narrow definition is not structurally assignable,
* but every consumer (`McpServer`, the host) only ever invokes it with SDK
* arguments that the server already validated against the same shape.
*/
function defineTool(definition) {
	return definition;
}
var textResult = (text) => ({ content: [{
	type: "text",
	text
}] });
var errorResult = (text) => ({
	content: [{
		type: "text",
		text
	}],
	isError: true
});
/**
* Build the tool result for a host command from the data it resolved and the
* human-readable text the client should see.
*/
function commandResult(type, data, text) {
	return formatCommandResult({
		ok: true,
		type,
		text,
		data
	});
}
/**
* Turn one tool-call envelope into the SDK result the MCP client receives.
*
* `content` (and `isError`) are the only enumerable keys, so the typed envelope
* never rides along on the wire; its fields are defined non-enumerable and stay
* readable in process for tools and hooks that need `data`.
*/
function formatCommandResult(result) {
	const output = {};
	const define = (key, value, enumerable) => {
		Object.defineProperty(output, key, {
			value,
			enumerable,
			configurable: true
		});
	};
	let content;
	const image = result.data?.image;
	if (!result.ok) content = [{
		type: "text",
		text: result.error
	}];
	else if (result.type === "takeScreenshot" && image) content = [{
		type: "image",
		data: image.data,
		mimeType: image.mimeType
	}, {
		type: "text",
		text: result.text
	}];
	else content = [{
		type: "text",
		text: result.text
	}];
	define("content", content, true);
	if (!result.ok) define("isError", true, true);
	define("ok", result.ok, false);
	define("type", result.type, false);
	if (result.ok) {
		define("text", result.text, false);
		if (result.data !== void 0) define("data", result.data, false);
	} else define("error", result.error, false);
	return output;
}
/**
* Bind the host's raw command dispatcher to the per-command `HostCommandApi`.
*
* The proxy property name **is** the command `type`: `host.readCanvas(args)`
* calls `invoke({ type: "readCanvas", args })`, resolves the command's data, and
* throws an `Error` when the command fails. Hosts and tests wrap their dispatcher
* once: `host: bindHostCommands(invokeHostCommand)`.
*/
function bindHostCommands(invoke) {
	return new Proxy({}, { get(_target, property) {
		return async (args, signal) => {
			const outcome = await invoke({
				type: String(property),
				args
			}, linkAbortSignals(signal, currentRequestAbortSignal()));
			if (!outcome.ok) throw new Error(outcome.error);
			return outcome.data;
		};
	} });
}

export { bindHostCommands, commandResult, defineTool, errorResult, getToolContext, runWithToolContext, textResult };
