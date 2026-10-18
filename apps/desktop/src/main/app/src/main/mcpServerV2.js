// Reconstructed from index.js — original module: app/src/main/mcpServerV2.ts
import { electron, node_crypto, node_path } from "../../../__bundle__/_preamble.js";
import { isTrustedLocalRequest } from "../../../packages/ai/src/mcp/requestGuard.js";
import { currentRequestAbortSignal } from "../../../packages/ai/src/mcp/requestAbort.js";
import { bindHostCommands } from "../../../packages/ai/src/mcp/tools/utils.js";
import { startMcpServer$2 } from "../../../packages/ai/src/mcp/server.js";
import { isAgentCanvasCommand } from "../../../packages/ai/src/mcp/types.js";
import { workTargetForToolCall } from "../../../packages/ai/src/mcp/workTargets.js";
import { findContentsForProject, getOpenProjectIds } from "../../../packages/ai/src/protocol.js";
import { handleSidebarChat } from "./sidebarChat.js";
import { dispatchProjectSession, isProjectSessionCommand } from "./projectSessionDispatch.js";
import { DESTRUCTIVE_TOOLS, PLAN_LIMIT_REASONS, TOOL_HANDLERS, formatClosedProjectError, formatResetHint, gateMcpCall, getApprovalNotificationTarget, getMcpListenPort, mcpEvents, mcpResultText, projectSessionHost, requestToolApproval, writesSensitiveLocalPath } from "./mcpServer.js";
import { loadSystemSkills } from "../../../packages/ai/src/skills.js";

/**
* agents-v2 MCP host layer (Electron main).
*
* The legacy `mcpServer.ts` still serves the old `aiChat` path. This module
* composes the agents-v2 side and starts it: it wraps the shared app-tool
* handlers in the policies every tool call passes through, and mounts the hooks
* and per-session context once at app start for the package's listen path. The
* package owns the tool catalog, so this host never lists tools. Nothing locks
* the canvas: each canvas command carries the agent making it, so the editor
* can show where that agent is working.
*/
/** Server name as the CLI sees it; canvas tools are named `mcp__<name>__*`. */
var MCP_SERVER_NAME = "petal";
/** IPC channel between Electron main (MCP tools) and the renderer (canvas handlers). */
var AGENT_CANVAS_CHANNEL = "agent_canvas";
/** Renderer → main reply channel carrying the typed `AgentCanvasResult`. */
var AGENT_CANVAS_RESULT_CHANNEL = "agent_canvas_result";
/** Renderer → main ping while a canvas command is still painting. */
var AGENT_CANVAS_PROGRESS_CHANNEL = "agent_canvas_progress";
/** Silence budget. A live paint resets it; a dead renderer still fails. */
var CANVAS_IDLE_MS = 1e4;
var bumpCanvasIdle = /* @__PURE__ */ new Map();
/** In-flight canvas RPCs keyed by the renderer `invoke` request id. */
var pendingCanvasResults = /* @__PURE__ */ new Map();
var canvasResultHandlerRegistered = false;
/**
* Renderer replies with `ipcRenderer.invoke` so this handle runs (and the
* pending command settles) before the renderer continues to paint lock overlays.
* Fire-and-forget `webContents.send` / `ipcRenderer.send` has no such guarantee.
* Call at app start so the first renderer invoke cannot miss the handle.
*/
function ensureCanvasResultHandler() {
	if (canvasResultHandlerRegistered) return;
	canvasResultHandlerRegistered = true;
	try {
		electron.ipcMain.handle(AGENT_CANVAS_RESULT_CHANNEL, (_event, payload) => {
			const finish = pendingCanvasResults.get(payload?.requestId);
			if (!finish) return false;
			finish(payload.result);
			return true;
		});
		electron.ipcMain.handle(AGENT_CANVAS_PROGRESS_CHANNEL, (_event, payload) => {
			if (!payload?.requestId) return false;
			bumpCanvasIdle.get(payload.requestId)?.();
			return true;
		});
	} catch {}
}
/** Forward a typed command to the project renderer and await its result. */
function forwardCanvasCommand(projectId, command, signal) {
	const webContents = findContentsForProject(projectId);
	if (!webContents) return Promise.resolve({
		ok: false,
		type: command.type,
		error: `No Petal window is open for project ${projectId}.`
	});
	ensureCanvasResultHandler();
	const requestId = (0, node_crypto.randomUUID)();
	return new Promise((resolve) => {
		let settled = false;
		let timer;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			pendingCanvasResults.delete(requestId);
			bumpCanvasIdle.delete(requestId);
			clearTimeout(timer);
			signal?.removeEventListener("abort", onAbort);
			resolve(result);
		};
		const onAbort = () => finish({
			ok: false,
			error: "Canvas operation aborted."
		});
		const armIdle = () => {
			clearTimeout(timer);
			timer = setTimeout(() => finish({
				ok: false,
				error: "Canvas operation timed out."
			}), CANVAS_IDLE_MS);
		};
		armIdle();
		bumpCanvasIdle.set(requestId, armIdle);
		pendingCanvasResults.set(requestId, finish);
		signal?.addEventListener("abort", onAbort, { once: true });
		const request = {
			requestId,
			projectId,
			command
		};
		webContents.send(AGENT_CANVAS_CHANNEL, request);
	});
}
/** Settle `work` early when the MCP client has already hung up. */
function untilClientDisconnect(work, signal) {
	if (!signal) return work;
	if (signal.aborted) return Promise.reject(/* @__PURE__ */ new Error("The client disconnected."));
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(/* @__PURE__ */ new Error("The client disconnected."));
		signal.addEventListener("abort", onAbort, { once: true });
		work.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", onAbort);
			reject(error);
		});
	});
}
/** Join the text blocks of a legacy SDK tool result the way MCP clients see them. */
function toolResultText(result) {
	return result.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
}
/**
* Adapt a legacy `TOOL_HANDLERS` result into the shared command envelope. This
* is the v2 boundary: the handlers keep their SDK `ToolResult` shape.
*/
function adaptAppResult(type, result) {
	const text = toolResultText(result);
	if (result.isError) return {
		ok: false,
		error: text || "Tool failed."
	};
	const image = result.content.find((block) => block.type === "image");
	if (type === "takeScreenshot" && image) return {
		ok: true,
		data: {
			image: {
				data: image.data,
				mimeType: image.mimeType
			},
			text
		}
	};
	return {
		ok: true,
		data: text
	};
}
/**
* The v2 camelCase app-command map. The v1 `TOOL_HANDLERS` table keeps its
* snake_case keys; this points each typed command at the same handler function.
* Typing the value as `Record<AppCommandType, …>` makes a new app command a
* compile error until it is routed here.
*/
var appHandlers = {
	sidebarChat: handleSidebarChat,
	getTheme: TOOL_HANDLERS.get_theme,
	takeScreenshot: TOOL_HANDLERS.take_screenshot,
	projectRead: TOOL_HANDLERS.project_read,
	projectGlob: TOOL_HANDLERS.project_glob,
	projectGrep: TOOL_HANDLERS.project_grep,
	projectWrite: TOOL_HANDLERS.project_write,
	projectWriteBatch: TOOL_HANDLERS.project_write_batch,
	projectEdit: TOOL_HANDLERS.project_edit,
	projectDelete: TOOL_HANDLERS.project_delete,
	projectCopyAsset: TOOL_HANDLERS.project_copy_asset,
	projectCopyFile: TOOL_HANDLERS.project_copy_file,
	scanProject: TOOL_HANDLERS.scan_project,
	searchComponents: TOOL_HANDLERS.search_components,
	setIconLibrary: TOOL_HANDLERS.set_icon_library
};
/**
* Reject a call once the plan's MCP usage limit is reached. Mounted outermost
* so a limited call never reaches the tool or the activity reporter.
*/
function enforcePlanLimits() {
	return { preToolUse: { async execute(call) {
		const { name, input: args } = call;
		const { session } = call.context;
		const projectId = session.projectId;
		if (!projectId) return;
		const meter = await gateMcpCall(projectId, name);
		if (meter.allowed) return;
		const windowLabel = meter.window === "week" ? "weekly" : "daily";
		const message = `${windowLabel[0].toUpperCase()}${windowLabel.slice(1)} MCP calls limit reached (${meter.used}/${meter.limit}).${formatResetHint(meter.resetsAt)} Upgrade the plan to keep using AI tools.`;
		mcpEvents.emit("plan_limit", {
			projectId,
			reason: meter.reason ?? "mcp_usage",
			message
		});
		mcpEvents.emit("tool_result", {
			projectId,
			name,
			args,
			error: message,
			success: false,
			reason: meter.reason ?? "mcp_usage"
		});
		throw new Error(message);
	} } };
}
/**
* Ask the user to approve a destructive tool before it runs, as the v1 chat
* does: in-app chat only, and only when the tab's running turn is not on auto.
* A sensitive local write (git hooks, CI, env, package scripts) asks even on
* auto. External MCP clients approve in the tool the user is looking at. A
* denied call stops the chain without invoking the tool and emits its own
* `tool_result`, because a throwing hook aborts the activity reporter's post
* hook.
*/
function approveDestructiveTools(runPolicy) {
	return { preToolUse: { async execute(call) {
		const { name, input: args } = call;
		const { session } = call.context;
		if (!DESTRUCTIVE_TOOLS.has(name)) return;
		const projectId = session.projectId;
		if (!projectId) return;
		const chatTabId = session.chatTabId ?? sessionChatTabs.get(session);
		if (!chatTabId) return;
		const sensitive = await writesSensitiveLocalPath(projectId, name, args, chatTabId);
		if (!sensitive && runPolicy(chatTabId) === "auto") return;
		const decision = await requestToolApproval(projectId, name, args, {
			origin: "petal",
			chatTabId,
			sensitive,
			signal: currentRequestAbortSignal()
		});
		if (decision.approved) return;
		const message = decision.reason === "timeout" ? `Timed out waiting for Petal approval for ${name}. Open the project window or use Auto-approve in the approval bar.` : decision.reason === "cancelled" ? "The chat was stopped." : `User rejected ${name} operation on ${getApprovalNotificationTarget(args)}`;
		mcpEvents.emit("tool_result", {
			projectId,
			name,
			args,
			success: false,
			error: message
		});
		throw new Error(message);
	} } };
}
/**
* Emit `tool_call` when a call starts and `tool_result` when it settles, for the
* tools the chat UI tracks. A result carrying a plan-limit reason also emits
* `plan_limit`.
*/
function reportToolActivity() {
	return {
		preToolUse: { execute(call) {
			const { name, input: args } = call;
			const projectId = call.context.session.projectId;
			if (!projectId) return;
			mcpEvents.emit("tool_call", {
				projectId,
				name,
				input: args
			});
		} },
		postToolUse: { execute(call, result) {
			reportToolResult(call, result);
		} },
		postToolUseFailure: { execute(call, result) {
			reportToolResult(call, result);
		} }
	};
}
/**
* Emit `tool_result` (and a plan-limit event) for a settled tracked call. An
* in-app call carries its chat tab and, when it changed something the user can
* be shown, the `workTarget` the running turn records for "Show last result".
*/
function reportToolResult(call, result) {
	const { name, input: args } = call;
	const { session } = call.context;
	const projectId = session.projectId;
	if (!projectId) return;
	if (!DESTRUCTIVE_TOOLS.has(name) && !name.startsWith("canvas_") && name !== "take_screenshot") return;
	const errorText = result.isError ? mcpResultText(result) : void 0;
	const reason = result.reason;
	if (reason && PLAN_LIMIT_REASONS.has(reason)) mcpEvents.emit("plan_limit", {
		projectId,
		reason,
		message: errorText || "This action is over the limit for your plan."
	});
	const chatTabId = session.chatTabId ?? sessionChatTabs.get(session);
	const streamId = session.streamId;
	const workTarget = chatTabId ? workTargetForToolCall(name, args, result) : null;
	mcpEvents.emit("tool_result", {
		projectId,
		...chatTabId ? { chatTabId } : {},
		...streamId ? { streamId } : {},
		name,
		args,
		success: !result.isError,
		reason,
		error: errorText,
		...workTarget ? { workTarget } : {}
	});
}
/**
* Resolve the built-in skills root for the current mode. electron-vite bundles
* `@petal/ai` into out/main, so the skills loader's `import.meta.url`
* default is unusable; the host resolves the root explicitly:
*   packaged → extraResources copies packages/ai/skills to system-skills-agents
*   dev      → __dirname is out/main; repo path is four levels up
*/
function resolveSkillsRoot() {
	return electron.app.isPackaged ? (0, node_path.join)(process.resourcesPath, "system-skills-agents") : (0, node_path.join)(__dirname, "..", "..", "resources", "system-skills-agents");
}
function extractSkillDescription(skillMd) {
	const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatter) return void 0;
	return frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
}
/** Built-in skills from `packages/ai/skills`. Used by the Skills UI on the v2 stack. */
async function getSystemSkills() {
	return (await loadSystemSkills(resolveSkillsRoot())).map((skill) => ({
		name: skill.name,
		description: extractSkillDescription(skill.files.find((f) => f.path === "SKILL.md")?.content ?? ""),
		files: skill.files
	}));
}
/** Covering reads kept across CLI reconnects, keyed by chat tab. */
var tabMcpState = /* @__PURE__ */ new Map();
var sessionChatTabs = /* @__PURE__ */ new WeakMap();
/** Drop per-tab covering-read state when a chat is archived. */
function dropInAppMcpTab(chatTabId) {
	tabMcpState.delete(chatTabId);
}
function snapshotTabState(session) {
	const chatTabId = sessionChatTabs.get(session);
	if (!chatTabId) return;
	tabMcpState.set(chatTabId, { coveringReads: Object.fromEntries(session.coveringReads) });
}
/**
* Save the tab's covering reads once each tool has settled. The tool records
* the hashes its command returned after the command resolves, so a snapshot
* taken in the dispatcher missed the last read or write of a turn, and the
* next turn's `canvas_update` was refused as stale.
*/
function persistTabState() {
	const persist = (call) => snapshotTabState(call.context.session);
	return {
		postToolUse: { execute: persist },
		postToolUseFailure: { execute: persist }
	};
}
/** Bind from optional `/mcp?projectId=&chatTabId=&streamId=` query; omit any to leave it unset. */
function bindFromRequest(session, url) {
	const projectId = url.searchParams.get("projectId") || void 0;
	const chatTabId = url.searchParams.get("chatTabId") || void 0;
	const streamId = url.searchParams.get("streamId") || void 0;
	if (projectId) session.bindProject(projectId);
	if (streamId) session.bindStreamTurn(streamId);
	if (!chatTabId) return void 0;
	session.bindChatTab(chatTabId);
	sessionChatTabs.set(session, chatTabId);
	const saved = tabMcpState.get(chatTabId);
	if (saved) session.recordCoveringReads(saved.coveringReads);
	return chatTabId;
}
/** Stamp the in-app chat tab onto canvas IPC so the editor knows which chat drew. */
function withChatTab(command, chatTabId) {
	if (!chatTabId) return command;
	return {
		...command,
		args: {
			...command.args,
			chatTabId
		}
	};
}
/**
* Stamp the agent making a canvas command: `chatTabId` for an in-app chat, and
* `agentId` for every caller, so the editor can show where each agent works.
*/
function withAgent(command, chatTabId, agentId) {
	const tagged = withChatTab(command, chatTabId);
	return {
		...tagged,
		args: {
			...tagged.args,
			agentId
		}
	};
}
/** Message an unbound external session gets until it picks an open project. */
var NO_PROJECT_SELECTED_MSG = "No project selected. Call project_list, then project_pick with the project the user wants to work on.";
/**
* External `/mcp` clients arrive without a project. With exactly one open there
* is nothing to disambiguate, so bind it and save the client a `project_list` +
* `project_pick` round trip; with several the choice is the user's and the
* session stays unbound. Re-checked before every command so a project opened
* after connect is still picked up.
*/
function autoBindSoleOpenProject(session) {
	if (session.projectId) return;
	const openIds = getOpenProjectIds();
	if (openIds.length === 1) session.bindProject(openIds[0]);
}
/**
* Run one typed command for a session: the session-binding commands bind the
* transport itself; canvas types go to the renderer that owns the project over
* `agent_canvas`, tagged with the agent; app commands go to the legacy
* `TOOL_HANDLERS` table and are adapted into the same envelope.
*
* Auto-binding and the list/pick commands run before the project check so an
* unbound external session can still bind. A bound project that is no longer
* open fails with the closed-project message rather than silently switching.
*/
function createDispatcher(session, chatTabId) {
	const agentId = chatTabId ? `chat:${chatTabId}` : `mcp:${(0, node_crypto.randomUUID)()}`;
	return async (command, signal) => {
		if (!isProjectSessionCommand(command) || command.type === "listOpenProjects" || command.type === "pickProject") autoBindSoleOpenProject(session);
		if (isProjectSessionCommand(command)) return dispatchProjectSession(command, projectSessionHost((id) => session.bindProject(id)));
		const projectId = session.projectId;
		if (!projectId) return {
			ok: false,
			error: NO_PROJECT_SELECTED_MSG
		};
		if (!getOpenProjectIds().includes(projectId)) return {
			ok: false,
			error: await formatClosedProjectError(projectId)
		};
		if (isAgentCanvasCommand(command)) return forwardCanvasCommand(projectId, withAgent(command, chatTabId, agentId), signal);
		const { type, args } = command;
		const handler = appHandlers[type];
		if (!handler) return {
			ok: false,
			error: `Unknown command: ${type}`
		};
		let handled;
		try {
			handled = await untilClientDisconnect(Promise.resolve(handler(projectId, args, chatTabId)), signal);
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "The client disconnected."
			};
		}
		return adaptAppResult(type, handled);
	};
}
/**
* Start the agents-v2 MCP listen path with this host's policies: the scoped
* gates and the host policy hooks. The package owns the tool catalog.
* `createContext` binds the command transport, where the dispatcher closes over
* the project and chat tab from the request URL and `bindHostCommands` exposes
* it as `context.host`. An external transport starts unbound: the dispatcher
* auto-binds a sole open project before each command, so the initialize
* instructions correctly describe the unbound case.
*/
async function startMcpServer(runPolicy) {
	ensureCanvasResultHandler();
	return startMcpServer$2({
		port: getMcpListenPort(),
		isTrustedRequest: isTrustedLocalRequest,
		createContext: (session, request) => {
			return {
				session,
				host: bindHostCommands(createDispatcher(session, bindFromRequest(session, request.url)))
			};
		},
		hooks: [
			enforcePlanLimits(),
			persistTabState(),
			reportToolActivity(),
			approveDestructiveTools(runPolicy)
		]
	});
}

export { MCP_SERVER_NAME, dropInAppMcpTab, ensureCanvasResultHandler, forwardCanvasCommand, getSystemSkills, resolveSkillsRoot, startMcpServer, withChatTab };
