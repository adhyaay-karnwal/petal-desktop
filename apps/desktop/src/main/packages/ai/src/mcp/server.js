// Reconstructed from index.js — original module: packages/ai/src/mcp/server.ts
import { node_crypto, node_http } from "../../../../__bundle__/_preamble.js";
import { McpServer$1, StreamableHTTPServerTransport } from "../../../../vendor/@modelcontextprotocol/sdk.js";
import { isTrustedLocalRequest } from "./requestGuard.js";
import { McpSession } from "./session.js";
import { runWithRequestAbort } from "./requestAbort.js";
import { errorResult, runWithToolContext } from "./tools/utils.js";
import { createSessionTools } from "./tools/session.js";
import { createSidebarChatTools } from "./tools/sidebarChat.js";
import { createChatTools } from "./tools/chat.js";
import { createAgentTools } from "./tools/index.js";
import { buildMcpServerInstructions } from "../prompts/mcpServerInstructions.js";

/**
* `McpServer`: the per-transport tool server, and `startMcpServer`: the local
* HTTP listen path in front of it.
*
* An SDK `McpServer` subclass whose extras are `registerHook()` lifecycle hooks and a
* hook-wrapped `registerTool`. It is used the way the
* SDK server is: construct it, mount hooks, register tools, then
* `connect()` it. The SDK allows one transport per server (`Protocol.connect()`
* is 1:1) and one session per `StreamableHTTPServerTransport`, so
* `startMcpServer` builds a fresh `McpServer` per transport from the one-time
* composition the embedding app passes in.
*
* Hook scope and order follow the mounted stack:
*
* - first mounted is outermost (`preToolUse` runs first, post hooks last);
* - hooks apply to every matching tool regardless of whether the tool was
*   registered before or after the hook, unlike middleware;
* - each phase's `matcher` scopes it to tool names using Claude Code's matcher
*   patterns (see `matcherMatches`).
*
* Argument defaulting, context injection and request `extra` passthrough live
* here too, so every tool family behaves the same.
*
* The listen path is a local-only (127.0.0.1) Streamable HTTP JSON-RPC server
* the Claude Code / Codex CLI connects to through `mcpServers`. In-app and
* external clients share `/mcp`; optional `projectId` / `chatTabId` query
* params are forwarded to `createContext` so the host can bind on connect.
* The package owns the tool catalog (`createAgentTools`); the host owns the
* hooks and the per-session call context, including the command transport it
* binds onto that context. A bare `/mcp` transport is external and also gets
* `createSessionTools` (`project_list` / `project_pick`); a URL with a
* `projectId` is already bound and does not. A URL with both `projectId` and
* `chatTabId` is the in-app chat and also gets `createChatTools` (`ask_user`,
* `report_import_progress`), whose output is a card only that chat can show.
*
* Each CLI process opens a new HTTP transport. One `McpSession` maps to that
* transport. Durable per-tab state (covering reads) is the host's concern, not
* this listen path.
*/
/** Characters that keep a matcher on the exact-match path, per Claude Code. */
var EXACT_MATCHER = /^[A-Za-z0-9_\-, |]+$/;
/**
* Evaluate a Claude Code-style matcher against a tool name.
*
* Omitted, `""` or `"*"` matches every tool. A matcher of only letters, digits,
* `_`, `-`, spaces, `,` and `|` is an exact name or a `|`/`,`-separated list of
* names (whitespace trimmed). Anything else is an unanchored JavaScript regular
* expression tested with `RegExp.prototype.test`.
*/
function matcherMatches(matcher, name) {
	if (matcher === void 0 || matcher === "" || matcher === "*") return true;
	if (EXACT_MATCHER.test(matcher)) return matcher.split(/[|,]/).some((part) => part.trim() === name);
	return new RegExp(matcher).test(name);
}
/** Keep the phases of `hooks` whose `matcher` matches `name`, dropping empties. */
function resolveHooks(hooks, name) {
	const stack = [];
	for (const hook of hooks) {
		const resolved = {};
		if (hook.preToolUse && matcherMatches(hook.preToolUse.matcher, name)) resolved.preToolUse = hook.preToolUse.execute;
		if (hook.postToolUse && matcherMatches(hook.postToolUse.matcher, name)) resolved.postToolUse = hook.postToolUse.execute;
		if (hook.postToolUseFailure && matcherMatches(hook.postToolUseFailure.matcher, name)) resolved.postToolUseFailure = hook.postToolUseFailure.execute;
		if (resolved.preToolUse || resolved.postToolUse || resolved.postToolUseFailure) stack.push(resolved);
	}
	return stack;
}
/**
* Run the hook stack around one tool invocation, outside to in.
*
* `preToolUse` hooks run in mount order. The first to throw stops the chain
* entirely — no later hook runs, the tool does not run, and its error message
* becomes the error result. A hook may instead return a `ToolResult` to stop
* the chain with that result (used for a benign release). Otherwise post hooks
* run in reverse mount order, dispatching to `postToolUse` or
* `postToolUseFailure` on the settled result. Other return values are ignored.
*/
async function runHooks(stack, call, invoke) {
	const entered = [];
	for (const hook of stack) {
		if (hook.preToolUse) try {
			const outcome = await hook.preToolUse(call);
			if (outcome) return outcome;
		} catch (error) {
			return errorResult(errorMessage(error));
		}
		entered.push(hook);
	}
	return runPostHooks(entered, call, await invoke());
}
async function runPostHooks(entered, call, result) {
	const failed = result.isError === true;
	for (let index = entered.length - 1; index >= 0; index--) {
		const hook = entered[index];
		const execute = failed ? hook.postToolUseFailure : hook.postToolUse;
		if (execute) await execute(call, result);
	}
	return result;
}
/** The message a blocking hook threw, for the error result the client sees. */
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
var McpServer = class extends McpServer$1 {
	/** The call context every tool on this server runs with. */
	context;
	hooks = [];
	constructor(serverInfo, options) {
		const { context, ...serverOptions } = options;
		super(serverInfo, serverOptions);
		this.context = context;
	}
	/** Mount a hook that applies to every tool whose name it matches, regardless of registration order. */
	registerHook(hook) {
		this.hooks.push(hook);
		return this;
	}
	/**
	* Wrap the SDK registration so every tool call runs the hooks whose matcher
	* matches it. The hook stack is resolved when the tool is called, so a hook
	* mounted after the tool still wraps it. The callback is invoked with
	* `(args, extra)` when the tool declares an input schema, matching the SDK,
	* or `(extra)` when it does not.
	*/
	registerTool(name, config, cb) {
		const context = this.context;
		const hasInput = config.inputSchema !== void 0;
		const wrapped = ((first, second) => {
			const args = hasInput ? first : {};
			const extra = hasInput ? second : first;
			const call = {
				name,
				input: args,
				context,
				extra
			};
			const invoke = async () => {
				try {
					return hasInput ? await cb(args, extra) : await cb(extra);
				} catch (error) {
					return errorResult(errorMessage(error));
				}
			};
			return runWithToolContext(context, () => runHooks(resolveHooks(this.hooks, name), call, invoke));
		});
		return super.registerTool(name, config, wrapped);
	}
};
/** SDK identity every listen-path transport reports. */
var LISTEN_SERVER_INFO = {
	name: "petal",
	version: "0.1.0"
};
var MCP_SESSION_HEADER = "mcp-session-id";
var MAX_BODY_BYTES = 4194304;
/** Idle TTL for transports. A session with an open GET stream is never idle. */
var SESSION_IDLE_TTL_MS = 216e5;
function isInitializeRequest(body) {
	return (Array.isArray(body) ? body : [body]).some((message) => !!message && typeof message === "object" && message.method === "initialize");
}
function jsonRpcId(body) {
	if (!body || typeof body !== "object" || Array.isArray(body)) return null;
	const id = body.id;
	return typeof id === "string" || typeof id === "number" ? id : null;
}
function readBody$1(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > MAX_BODY_BYTES) {
				reject(/* @__PURE__ */ new Error("Request body too large"));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("error", reject);
		req.on("end", () => {
			if (chunks.length === 0) return resolve(void 0);
			try {
				resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
			} catch (err) {
				reject(err);
			}
		});
	});
}
/** Start the local MCP listen path. Returns once it is listening. */
async function startMcpServer$2(options) {
	const transports = /* @__PURE__ */ new Map();
	/** Open standalone GET SSE streams, keyed by session. Prune must not drop these. */
	const liveStreams = /* @__PURE__ */ new Map();
	const sessionIdleTtlMs = options.sessionIdleTtlMs ?? SESSION_IDLE_TTL_MS;
	const hostname = options.host ?? "127.0.0.1";
	const tools = createAgentTools();
	const sessionTools = [...createSessionTools(), ...createSidebarChatTools()];
	const chatTools = createChatTools();
	/**
	* Close and forget transports that have gone idle without a clean close.
	* A live GET stream keeps the session: clients close that stream on their
	* own and keep POSTing, and the SDK reconnects it.
	*/
	const pruneStaleTransports = () => {
		const now = Date.now();
		for (const [sessionId, entry] of transports) {
			if (liveStreams.has(sessionId)) continue;
			if (now - entry.lastActiveAt <= sessionIdleTtlMs) continue;
			transports.delete(sessionId);
			entry.transport.close().catch(() => {});
		}
	};
	/** Count a GET SSE stream so prune skips the session until the client drops it. */
	const noteLiveStream = (id, response, entry) => {
		liveStreams.set(id, (liveStreams.get(id) ?? 0) + 1);
		response.on("close", () => {
			const next = (liveStreams.get(id) ?? 1) - 1;
			if (next <= 0) liveStreams.delete(id);
			else liveStreams.set(id, next);
			entry.lastActiveAt = Date.now();
		});
	};
	/** Build one server for a transport from the catalog and the host's hooks. */
	const createServerForSession = (session, requestUrl) => {
		const projectId = requestUrl.searchParams.get("projectId");
		const external = !projectId;
		const inApp = Boolean(projectId && requestUrl.searchParams.get("chatTabId"));
		const context = options.createContext(session, { url: requestUrl });
		const server = new McpServer(LISTEN_SERVER_INFO, {
			capabilities: { tools: {} },
			instructions: buildMcpServerInstructions({ inApp }),
			context
		});
		const catalog = [
			...tools,
			...external ? sessionTools : [],
			...inApp ? chatTools : []
		];
		for (const tool of catalog) server.registerTool(tool.name, tool.config, tool.execute);
		for (const hook of options.hooks) server.registerHook(hook);
		return server;
	};
	const createTransport = async (requestUrl) => {
		const sessionId = (0, node_crypto.randomUUID)();
		const session = new McpSession();
		const server = createServerForSession(session, requestUrl);
		let entry;
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => sessionId,
			onsessioninitialized: () => {
				transports.set(sessionId, entry);
			}
		});
		entry = {
			transport,
			server,
			session,
			lastActiveAt: Date.now()
		};
		transport.onclose = () => {
			const closedId = transport.sessionId;
			if (closedId) transports.delete(closedId);
		};
		await server.connect(transport);
		return entry;
	};
	const handle = async (req, res) => {
		if (!(options.isTrustedRequest ?? isTrustedLocalRequest)(req.headers, port)) {
			res.writeHead(403, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Forbidden" }));
			return;
		}
		const url = new URL(req.url ?? "/", `http://${hostname}`);
		if (url.pathname === "/health") {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({
				ok: true,
				server: "petal-agents-v2",
				port,
				sessions: transports.size
			}));
			return;
		}
		if (url.pathname !== "/mcp") {
			res.writeHead(404, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Not found" }));
			return;
		}
		pruneStaleTransports();
		const sessionId = req.headers[MCP_SESSION_HEADER];
		const existing = typeof sessionId === "string" ? transports.get(sessionId) : void 0;
		if (existing) existing.lastActiveAt = Date.now();
		if (req.method === "POST") {
			let body;
			try {
				body = await readBody$1(req);
			} catch (err) {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end(JSON.stringify({
					jsonrpc: "2.0",
					id: null,
					error: {
						code: -32700,
						message: `Parse error: ${err.message}`
					}
				}));
				return;
			}
			if (typeof sessionId === "string" && !existing && !isInitializeRequest(body)) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({
					jsonrpc: "2.0",
					id: jsonRpcId(body),
					error: {
						code: -32001,
						message: "Session not found"
					}
				}));
				return;
			}
			const entry = existing ?? await createTransport(url);
			const clientGone = new AbortController();
			const onClientGone = () => {
				if (!res.writableFinished) clientGone.abort();
			};
			res.on("close", onClientGone);
			try {
				await runWithRequestAbort(clientGone.signal, () => entry.transport.handleRequest(req, res, body));
			} finally {
				res.off("close", onClientGone);
			}
			return;
		}
		if (req.method === "GET" || req.method === "DELETE") {
			if (!existing) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Session not found" }));
				return;
			}
			if (req.method === "GET" && typeof sessionId === "string") noteLiveStream(sessionId, res, existing);
			await existing.transport.handleRequest(req, res);
			return;
		}
		res.writeHead(405, { Allow: "GET, POST, DELETE" });
		res.end();
	};
	const httpServer = (0, node_http.createServer)((req, res) => {
		handle(req, res).catch((err) => {
			console.error("[agent-mcp] request failed:", err);
			if (!res.headersSent) {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: err.message }));
			}
		});
	});
	const port = await new Promise((resolve, reject) => {
		httpServer.once("error", reject);
		httpServer.listen(options.port ?? 0, hostname, () => {
			const address = httpServer.address();
			resolve(typeof address === "object" && address ? address.port : 0);
		});
	});
	return {
		port,
		baseUrl: `http://${hostname}:${port}/mcp`,
		close: async () => {
			for (const entry of transports.values()) await entry.server.close().catch(() => {});
			transports.clear();
			await new Promise((resolve) => httpServer.close(() => resolve()));
		}
	};
}

export { startMcpServer$2 };
