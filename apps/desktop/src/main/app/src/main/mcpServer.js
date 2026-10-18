// Reconstructed from index.js — original module: app/src/main/mcpServer.ts
import { child_process, crypto$1, electron, events, fs_promises, http, path, util } from "../../../__bundle__/_preamble.js";
import { ensureV2 } from "../../../packages/compiler/src/store/ensureV2.js";
import { getRootIds } from "../../../packages/compiler/src/store/read.js";
import { hashAllElementSubtreesFrom, jsxContainsTruncationStub } from "../../../packages/compiler/src/codegen/generateJSX.js";
import { extractPartialCanvasDrawArgs, extractPartialMcpToolName, isCanvasDrawToolName } from "../../../packages/compiler/src/codegen/extractPartialJson.js";
import { isLoadableIconLibrary } from "../../../packages/compiler/src/runtime/settingsParser.js";
import { buildMcpServerInstructions$1 } from "../../../packages/compiler/src/codegen/aiShared.js";
import { inspectLocalCopyBuffer, normalizeLocalCopyFileArgs, normalizeProjectCopyFileArgs } from "../../../packages/compiler/src/codegen/projectCopyFile.js";
import { formatComponentSearchLine } from "../../../packages/compiler/src/codegen/canvasAiEdit.js";
import { getPromptFolders } from "./promptFolders.js";
import { isExistingDestinationAllowed, isPathOrAncestorAllowed, isSensitiveWriteTarget, resolveGlobScope } from "./localPathAccess.js";
import { combineQueryResults, getCreatedCanvasElementIds, stripCreatedElementIds } from "./canvasToolResult.js";
import { createIdleDeadline } from "./idleDeadline.js";
import { createAgentActivityTracker } from "./agentActivity.js";
import { createMcpSessionRegistry } from "./mcpSession.js";
import { createMcpRequestListener } from "./mcpTransport.js";
import { isTrustedLocalRequest } from "../../../packages/ai/src/mcp/requestGuard.js";
import { parseSidebarChatTool, sidebarChatLegacyTools } from "../../../packages/ai/src/mcp/tools/sidebarChat.js";
import { broadcastToRenderers, findContentsForProject, findWindowForProject, focusProjectTab, getActiveProjectId, getDesktopWindow, getOpenProjectIds, isProjectTabSelected, openProjectTab, setProjectActivity, updateProjectTabName } from "../../../packages/ai/src/protocol.js";
import { handleSidebarChat } from "./sidebarChat.js";
import { createProjectNavigation } from "./projectNavigation.js";
import { handleLegacyProjectSession } from "./projectSessionDispatch.js";
import { authClient, getApiUrl } from "./auth.js";
import { toPngBase64 } from "./captureImage.js";
import { scanProject } from "../../../packages/compiler/src/runtime/projectScanner.js";
import { loadSystemSkills$1 } from "../../../packages/compiler/src/runtime/skills.js";

/**
* Local HTTP MCP server for project file access.
*
* Runs inside the Electron main process on a fixed loopback port (21209 prod,
* 23563 dev) — external clients are given it in the connect modal.
* Claude CLI (and other MCP clients like Cursor) connect via:
*   External: { "type": "http", "url": "http://127.0.0.1:PORT/mcp" } + project_list / project_pick
*   In-app chat: http://127.0.0.1:PORT/mcp/PROJECT_ID (project bound from URL)
*
* All file operations proxy to the Petal API using the auth cookie
* from the main process — no credentials written to disk.
*/
var execFileAsync$9 = (0, util.promisify)(child_process.execFile);
var SIDEBAR_CHAT_TOOLS = sidebarChatLegacyTools();
var EXTERNAL_ONLY_TOOLS = /* @__PURE__ */ new Set([
	...SIDEBAR_CHAT_TOOLS.map((tool) => tool.name),
	"project_open",
	"project_create",
	"project_rename"
]);
var server$1 = null;
var purgeTimer = null;
/** 0 until `startMcpServer` binds; see `mcpStartupError` when it stays 0. */
var mcpPort = 0;
/** Why the server is not listening, surfaced to the renderer via `getMcpInfo`. */
var mcpStartupError = null;
/** Emits tool activity events so the chat UI can show real-time MCP tool calls */
var mcpEvents = new events.EventEmitter();
/** Active Petal chat panel sessions per project (for MCP event routing). */
var activeChatTabSessions = /* @__PURE__ */ new Map();
/** Register a Petal chat panel session for MCP event routing and canvas presence. */
function registerMcpChatSession(projectId, chatTabId) {
	let sessions = activeChatTabSessions.get(projectId);
	if (!sessions) {
		sessions = /* @__PURE__ */ new Set();
		activeChatTabSessions.set(projectId, sessions);
	}
	sessions.add(chatTabId);
	return () => {
		sessions.delete(chatTabId);
		if (sessions.size === 0) activeChatTabSessions.delete(projectId);
		clearReaderKeyedState(designSkillChatKey(projectId, chatTabId));
	};
}
function resolveChatTabId(projectId) {
	const sessions = activeChatTabSessions.get(projectId);
	if (sessions?.size === 1) return [...sessions][0];
}
/**
* Tag a canvas operation with the agent making it: `chat_tab_id` for an in-app
* chat, and `agent_id` for every caller, so the renderer can show where each
* agent is working.
*/
function withAgent$1(args, chatTabId, sessionId) {
	const agentId = chatTabId ? `chat:${chatTabId}` : sessionId ? `mcp:${sessionId}` : void 0;
	return {
		...args,
		...chatTabId ? { chat_tab_id: chatTabId } : {},
		...agentId ? { agent_id: agentId } : {}
	};
}
var DESIGN_SKILL_NAME = "petal-design";
var DESIGN_SKILL_REQUIRED_TOOLS = /* @__PURE__ */ new Set([
	"canvas_add",
	"canvas_update",
	"canvas_edit",
	"canvas_insert",
	"canvas_patch",
	"canvas_create_import_scaffold"
]);
var DESIGN_SKILL_REQUIRED_MSG = `Design skill not loaded. Before ${[...DESIGN_SKILL_REQUIRED_TOOLS].join("/")}, call read_skill with name "${DESIGN_SKILL_NAME}" and follow it (including the screenshot-critique loop).`;
/** Keys that have successfully loaded petal-design this session (MCP session or chat tab). */
var designSkillLoadedKeys = /* @__PURE__ */ new Set();
function designSkillSessionKey(sessionId) {
	return `s:${sessionId}`;
}
function designSkillChatKey(projectId, chatTabId) {
	return `c:${projectId}:${chatTabId}`;
}
function markDesignSkillLoaded(opts) {
	if (opts.sessionId) designSkillLoadedKeys.add(designSkillSessionKey(opts.sessionId));
	if (opts.projectId && opts.chatTabId) designSkillLoadedKeys.add(designSkillChatKey(opts.projectId, opts.chatTabId));
}
function hasDesignSkillLoaded(opts) {
	if (opts.sessionId && designSkillLoadedKeys.has(designSkillSessionKey(opts.sessionId))) return true;
	if (opts.projectId && opts.chatTabId && designSkillLoadedKeys.has(designSkillChatKey(opts.projectId, opts.chatTabId))) return true;
	if (opts.projectId && !opts.chatTabId) {
		const sole = resolveChatTabId(opts.projectId);
		if (sole && designSkillLoadedKeys.has(designSkillChatKey(opts.projectId, sole))) return true;
	}
	return false;
}
function clearReaderKeyedState(readerKey) {
	designSkillLoadedKeys.delete(readerKey);
	coveringReadsByReader.delete(readerKey);
}
function isDesignSkillRead(toolName, toolArgs) {
	return toolName === "read_skill" && toolArgs?.name === DESIGN_SKILL_NAME;
}
/** readerKey (`c:project:chatTab` or `s:sessionId`) → elementId → subtree hash */
var coveringReadsByReader = /* @__PURE__ */ new Map();
/**
* Covering-read identity. Prefer MCP session when present (external clients).
* Otherwise use chatTabId — callers must pass explicit `?chatTab=` only, never
* sole-tab inference (that remkeys external sessions onto an in-app tab).
*/
function readerKeyFor(opts) {
	if (opts.sessionId) return designSkillSessionKey(opts.sessionId);
	if (opts.chatTabId) return designSkillChatKey(opts.projectId, opts.chatTabId);
}
function recordCoveringRead(readerKey, elementId, subtreeHash) {
	let map = coveringReadsByReader.get(readerKey);
	if (!map) {
		map = /* @__PURE__ */ new Map();
		coveringReadsByReader.set(readerKey, map);
	}
	map.set(elementId, subtreeHash);
}
/**
* Seed covering-read hashes for in-app @-attached elements, so the agent can
* update them without a redundant canvas_read of ids already in chat context.
*/
function seedCoveringReadsFromAttachedElements(projectId, chatTabId, attachedElements) {
	if (!attachedElements.length) return;
	const readerKey = designSkillChatKey(projectId, chatTabId);
	for (const raw of attachedElements) {
		if (!raw || typeof raw !== "object") continue;
		try {
			const store = ensureV2([raw]);
			for (const rootId of getRootIds(store)) for (const [elementId, subtreeHash] of hashAllElementSubtreesFrom(store, rootId)) recordCoveringRead(readerKey, elementId, subtreeHash);
		} catch {}
	}
}
/** Lifecycle and binding live in mcpSession.ts so they can be tested without electron. */
/**
* External agents have no visible run boundary, so they count as working while
* they keep calling tools. Measured with Claude Code on real design tasks, the
* longest gap between tool calls was 16.8s (generating a component file before
* `project_write`); canvas generation stayed under 9s. Longer file writes can
* still outlast it and flicker the indicator — that is the trade for clearing
* soon after the agent finishes.
*/
var EXTERNAL_AGENT_IDLE_MS = 2e4;
var MCP_SESSION_PRUNE_INTERVAL_MS = 3e4;
var externalAgentActivity = createAgentActivityTracker({
	idleMs: EXTERNAL_AGENT_IDLE_MS,
	setActivity: setProjectActivity
});
var mcpSessions = createMcpSessionRegistry({
	getOpenProjectIds,
	onSessionDestroyed: (sessionId) => {
		clearReaderKeyedState(designSkillSessionKey(sessionId));
		externalAgentActivity.end(sessionId);
	}
});
/** Session error → JSON-RPC body, using the status the registry chose. */
function sessionErrorResponse(resolution, rpcId) {
	return {
		status: resolution.status,
		body: {
			jsonrpc: "2.0",
			id: rpcId,
			error: {
				code: resolution.code,
				message: resolution.message
			}
		}
	};
}
async function fetchProjectName(projectId) {
	try {
		const res = await apiFetch$1(`/projects/${projectId}`);
		if (res.ok) {
			const data = await res.json().catch(() => ({}));
			if (typeof data.name === "string" && data.name.trim()) return data.name.trim();
		}
	} catch {}
	return projectId.slice(0, 8);
}
/**
* `project_list` text: one line per open project, `(active tab)` on the marked
* one, active first then by name. Empty string when nothing is open. Shared by
* the v1 handler and the v2 session dispatcher so both list identically.
*/
async function formatOpenProjectList() {
	const openIds = getOpenProjectIds();
	const activeId = getActiveProjectId();
	const projects = await Promise.all(openIds.map(async (id) => ({
		id,
		name: await fetchProjectName(id)
	})));
	projects.sort((a, b) => {
		if (a.id === activeId) return -1;
		if (b.id === activeId) return 1;
		return a.name.localeCompare(b.name);
	});
	return projects.map((p) => `- name: ${p.name}, id: ${p.id}${p.id === activeId ? " (active tab)" : ""}`).join("\n");
}
var projectNavigation = createProjectNavigation({
	apiFetch: apiFetch$1,
	projectChanged: (projectId, name) => {
		updateProjectTabName(projectId, name);
		broadcastToRenderers("project_metadata_changed", { projectId });
	},
	openIds: getOpenProjectIds,
	activeId: getActiveProjectId,
	isSelected: isProjectTabSelected,
	context: (id) => handleSidebarChat(id, {
		operation: "navigate",
		project_id: id
	}),
	openProject: async (id, name) => {
		const win = findWindowForProject(id) ?? getDesktopWindow();
		if (!win) throw new Error("No Petal desktop window is open.");
		if (win.isMinimized()) win.restore();
		win.show();
		win.focus();
		await openProjectTab(win, id, false, name);
		focusProjectTab(id);
	}
});
async function listMcpProjects(args) {
	if (args.scope && args.scope !== "open" && args.scope !== "all") throw new Error("scope must be open or all.");
	if (args.organizationId !== void 0 && (typeof args.organizationId !== "string" || !args.organizationId.trim() || args.organizationId.length > 512)) throw new Error("Invalid organization_id.");
	return args.scope === "all" ? projectNavigation.list(args.organizationId) : await formatOpenProjectList() || "No projects are open. Discover accessible projects with project_list scope all, then project_open.";
}
var openMcpProject = projectNavigation.open;
var createMcpProject = projectNavigation.create;
var renameMcpProject = projectNavigation.rename;
function projectSessionHost(bind, hasSession = true) {
	return {
		list: listMcpProjects,
		open: openMcpProject,
		create: createMcpProject,
		rename: renameMcpProject,
		openIds: getOpenProjectIds,
		openList: formatOpenProjectList,
		name: fetchProjectName,
		bind,
		hasSession
	};
}
async function formatClosedProjectError(projectId) {
	return `Project "${await fetchProjectName(projectId)}" is no longer open in Petal. Call project_list and project_pick again.`;
}
var TOOLS_WITHOUT_BOUND_PROJECT = /* @__PURE__ */ new Set([
	"project_list",
	"project_pick",
	"project_open",
	"project_create",
	"project_rename",
	"list_skills",
	"read_skill"
]);
var NO_PROJECT_SELECTED_MSG$1 = "No project selected. Call project_list, then project_pick with the project the user wants to work on.";
var builtInSkillsPromise = null;
var skillOverridesEnabled = false;
var skillOverrides = {};
function extractSkillDescription$1(skillMd) {
	const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatter) return void 0;
	return frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
}
async function loadAvailableSkills() {
	if (!builtInSkillsPromise) builtInSkillsPromise = (async () => {
		return (await loadSystemSkills$1(electron.app.isPackaged ? (0, path.join)(process.resourcesPath, "system-skills") : (0, path.join)(__dirname, "..", "..", "resources", "system-skills"))).map((skill) => ({
			...skill,
			source: "built-in",
			description: extractSkillDescription$1(skill.files.find((f) => f.path === "SKILL.md")?.content ?? "")
		}));
	})();
	return builtInSkillsPromise;
}
/** Built-in skills from disk (no localStorage overrides). Used by the Skills UI. */
async function getSystemSkills$1() {
	return loadAvailableSkills();
}
/** Sync skill overrides from the renderer (localStorage is source of truth). */
var skillOverrideApplyGen = 0;
function getActiveSkillOverrides() {
	if (!skillOverridesEnabled) return void 0;
	return skillOverrides;
}
function setSkillOverrides(enabled, overrides, gen) {
	if (typeof gen === "number") {
		if (gen < skillOverrideApplyGen) return;
		skillOverrideApplyGen = gen;
	}
	skillOverridesEnabled = !!enabled;
	const incoming = overrides && typeof overrides === "object" ? overrides : {};
	const next = {};
	for (const [name, entry] of Object.entries(incoming)) if (entry?.active === true && Array.isArray(entry.files) && entry.files.length > 0) next[name] = entry;
	skillOverrides = next;
}
function applySkillOverrides(skills) {
	if (!skillOverridesEnabled) return skills;
	return skills.map((skill) => {
		const override = skillOverrides[skill.name];
		if (!override?.files?.length) return skill;
		const files = override.files.map((f) => ({
			path: f.path,
			content: f.content
		}));
		return {
			...skill,
			files,
			description: extractSkillDescription$1(files.find((f) => f.path === "SKILL.md")?.content ?? "") ?? skill.description
		};
	});
}
async function handleListSkills(_projectId, _args) {
	const skills = applySkillOverrides(await loadAvailableSkills());
	return { content: [{
		type: "text",
		text: JSON.stringify(skills.map(({ name, source, description }) => ({
			name,
			source,
			description
		})), null, 2)
	}] };
}
async function handleReadSkill(_projectId, args) {
	const name = args.name;
	if (!name || typeof name !== "string") return {
		isError: true,
		content: [{
			type: "text",
			text: "name is required"
		}]
	};
	const skill = applySkillOverrides(await loadAvailableSkills()).find((candidate) => candidate.name === name);
	if (!skill) return {
		isError: true,
		content: [{
			type: "text",
			text: `Skill not found: ${name}`
		}]
	};
	return { content: [{
		type: "text",
		text: JSON.stringify({
			name: skill.name,
			source: skill.source,
			description: skill.description,
			files: skill.files
		}, null, 2)
	}] };
}
var DESTRUCTIVE_TOOLS = /* @__PURE__ */ new Set([
	"project_write",
	"project_write_batch",
	"project_edit",
	"project_delete",
	"project_copy_asset",
	"project_copy_file",
	"local_write",
	"local_edit",
	"local_copy_file",
	"set_icon_library"
]);
/** Local paths a destructive call writes to. */
function localWriteTargets(toolName, args) {
	if (toolName === "local_write" || toolName === "local_edit") return typeof args?.file_path === "string" ? [args.file_path] : [];
	if (toolName !== "local_copy_file") return [];
	return (Array.isArray(args?.files) ? args.files : [args]).flatMap((file) => typeof file?.local_path === "string" ? [file.local_path] : []);
}
/**
* True when the call writes a local file that can run code outside the app
* (git hooks, CI, env, package scripts). These ask even when the chat is on
* Auto, so a planted instruction in a comment thread or a read file cannot
* reach them unseen.
*/
async function writesSensitiveLocalPath(projectId, toolName, args, chatTabId) {
	const targets = localWriteTargets(toolName, args);
	if (targets.length === 0) return false;
	const allowed = getAllowedLocalPaths(projectId, chatTabId);
	return (await Promise.all(targets.map((target) => isSensitiveWriteTarget(target, allowed)))).some(Boolean);
}
var pendingApprovals = /* @__PURE__ */ new Map();
var APPROVAL_TIMEOUT_MS = 45e3;
function getApprovalNotificationTarget(args) {
	if (args?.file_path) return String(args.file_path);
	if (Array.isArray(args?.files)) {
		const first = args.files[0]?.file_path || args.files[0]?.project_path;
		if (first) return args.files.length === 1 ? String(first) : `${first} +${args.files.length - 1} more`;
		return `${args.files.length} files`;
	}
	if (args?.project_path) return String(args.project_path);
	return "project files";
}
function focusProjectWindow(projectId) {
	const win = findWindowForProject(projectId);
	if (!win) return;
	if (win.isMinimized()) win.restore();
	focusProjectTab(projectId);
}
/** Called from IPC when user approves or rejects a tool call */
function resolveApproval(approvalId, approved) {
	pendingApprovals.get(approvalId)?.settle({
		approved,
		reason: approved ? void 0 : "rejected"
	});
}
/** Cancel all pending approvals (e.g. when chat session ends) */
function cancelAllApprovals() {
	cancelAllFolderGrants();
	for (const pending of [...pendingApprovals.values()]) pending.settle({
		approved: false,
		reason: "cancelled"
	});
}
var cancelledChats = /* @__PURE__ */ new Set();
function chatCancelKey(projectId, chatTabId) {
	return chatTabId ? `${projectId}:${chatTabId}` : projectId;
}
/** Stop in-flight canvas/MCP work for this chat. New sends clear the flag. */
function markChatCancelled(projectId, chatTabId) {
	cancelCanvasDrawPreview(projectId);
	sendCanvasOperation(projectId, "preview_drop", { chat_tab_id: chatTabId }).catch(() => {});
	cancelledChats.add(chatCancelKey(projectId, chatTabId));
	cancelAllApprovals();
}
function clearChatCancelled(projectId, chatTabId) {
	cancelledChats.delete(chatCancelKey(projectId, chatTabId));
}
function isChatCancelled(projectId, chatTabId) {
	if (chatTabId && cancelledChats.has(`${projectId}:${chatTabId}`)) return true;
	return cancelledChats.has(projectId);
}
async function requestToolApproval(projectId, toolName, args, options) {
	const { signal } = options ?? {};
	if (signal?.aborted) return {
		approved: false,
		reason: "cancelled"
	};
	const approvalId = (0, crypto$1.randomUUID)();
	return new Promise((resolve) => {
		let timeout;
		const onClientGone = () => settle({
			approved: false,
			reason: "cancelled"
		});
		const settle = (decision) => {
			if (!pendingApprovals.delete(approvalId)) return;
			clearTimeout(timeout);
			signal?.removeEventListener("abort", onClientGone);
			resolve(decision);
		};
		pendingApprovals.set(approvalId, { settle });
		timeout = setTimeout(() => settle({
			approved: false,
			reason: "timeout"
		}), APPROVAL_TIMEOUT_MS);
		signal?.addEventListener("abort", onClientGone, { once: true });
		mcpEvents.emit("tool_approval_needed", {
			approvalId,
			projectId,
			chatTabId: options?.chatTabId,
			toolName,
			args,
			origin: options?.origin ?? "petal",
			...options?.sensitive ? { sensitive: true } : {}
		});
	});
}
/** Tool the Claude CLI is pointed at with --permission-prompt-tool. */
var PERMISSION_PROMPT_TOOL = "approve";
/**
* Claude Code's permission prompt for the in-app chat: whatever the permission
* mode could not decide on its own lands here, and the user answers it in the
* chat's approval card. Returns the CLI's expected payload as a JSON string.
*/
async function handleApprove(projectId, args, chatTabId) {
	const toolName = typeof args?.tool_name === "string" && args.tool_name ? args.tool_name : "unknown tool";
	const input = args?.input && typeof args.input === "object" ? args.input : {};
	const decision = await requestToolApproval(projectId, toolName, input, {
		origin: "cli",
		chatTabId
	});
	const payload = decision.approved ? {
		behavior: "allow",
		updatedInput: input
	} : {
		behavior: "deny",
		message: decision.reason === "timeout" ? "No answer from the user within 2 minutes. Do not retry; ask the user how to proceed." : decision.reason === "cancelled" ? "The chat was stopped." : "The user declined this action in Petal. Do not retry it; ask how to proceed."
	};
	return { content: [{
		type: "text",
		text: JSON.stringify(payload)
	}] };
}
function apiFetch$1(path$46, init) {
	const cookie = authClient.getCookie();
	const url = `${getApiUrl()}${path$46}`;
	console.log(`[MCP apiFetch] ${init?.method ?? "GET"} ${url}`);
	return fetch(url, {
		...init,
		headers: {
			...init?.headers,
			...cookie ? { Cookie: cookie } : {}
		}
	}).then((res) => {
		console.log(`[MCP apiFetch] ${res.status} ${url}`);
		return res;
	}).catch((err) => {
		console.error(`[MCP apiFetch] FAILED ${url}:`, err.message);
		throw err;
	});
}
var PLAN_LIMIT_REASONS = /* @__PURE__ */ new Set([
	"max_projects",
	"project_size",
	"invite_people",
	"mcp_usage"
]);
/** Parse a failed cloud API response so the model sees the real error, not just a status code. */
async function mcpResultFromFailedResponse(res, fallback) {
	const raw = await res.text().catch(() => "");
	let error;
	let reason;
	if (raw) try {
		const body = JSON.parse(raw);
		if (typeof body.error === "string" && body.error.trim()) error = body.error;
		if (typeof body.reason === "string" && body.reason.trim()) reason = body.reason;
	} catch {
		const trimmed = raw.trim();
		if (trimmed) error = trimmed.slice(0, 400);
	}
	return {
		isError: true,
		content: [{
			type: "text",
			text: error || fallback
		}],
		...reason ? { reason } : {}
	};
}
function mcpResultText(result) {
	const text = result?.content?.find((c) => c.type === "text")?.text;
	return typeof text === "string" && text.length > 0 ? text : void 0;
}
/**
* Server-authoritative MCP usage metering. Records one tool call against the
* project's org and reports whether this user is within their plan quota. The
* tool name is sent for the server's analytics event log (no arguments are sent).
* Fails open — a metering outage must never block real work, and in observe
* mode (no configured cap) every call is allowed.
*
* On a block the server names the week window and when it resets, so the
* client can tell the user exactly how long they're gated.
*/
async function meterMcpCall(projectId, toolName) {
	try {
		const res = await apiFetch$1("/billing/mcp-usage", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId,
				toolName
			})
		});
		if (!res.ok) return { allowed: true };
		return await res.json();
	} catch (err) {
		console.warn("[MCP] usage metering failed (allowing):", err?.message);
		return { allowed: true };
	}
}
/** Re-check a cached block after this, so an upgrade mid-session unblocks. */
var MCP_METER_BLOCK_TTL_MS = 6e4;
var mcpMeterGate = /* @__PURE__ */ new Map();
function rememberMeter(projectId, meter) {
	mcpMeterGate.set(projectId, {
		...meter,
		cachedAt: Date.now()
	});
	return meter;
}
/**
* First check is awaited so a hard cap still blocks. Later allowed calls
* fire-and-forget the record; the result is written back so a later block
* (quota hit, or a recovered 429) applies on the next tool.
*/
async function gateMcpCall(projectId, toolName) {
	const cached = mcpMeterGate.get(projectId);
	if (cached?.allowed) {
		meterMcpCall(projectId, toolName).then((meter) => {
			rememberMeter(projectId, meter);
		});
		return cached;
	}
	if (cached && Date.now() - cached.cachedAt < MCP_METER_BLOCK_TTL_MS) return cached;
	return rememberMeter(projectId, await meterMcpCall(projectId, toolName));
}
/** Human-friendly "resets in ~X" phrasing for a limit-reached message. */
function formatResetHint(resetsAt) {
	if (!resetsAt) return "";
	const ms = new Date(resetsAt).getTime() - Date.now();
	if (!Number.isFinite(ms) || ms <= 0) return "";
	const hours = Math.ceil(ms / 36e5);
	if (hours <= 48) return ` Resets in ~${hours}h.`;
	return ` Resets in ~${Math.ceil(hours / 24)}d.`;
}
var metadataCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 3e4;
async function getFileMetadata(projectId) {
	const cached = metadataCache.get(projectId);
	if (cached && Date.now() - cached.time < CACHE_TTL) return cached.files;
	const res = await apiFetch$1(`/projects/${projectId}/files`);
	if (!res.ok) throw new Error(`Failed to list files: ${res.status}`);
	const files = await res.json();
	metadataCache.set(projectId, {
		files,
		time: Date.now()
	});
	return files;
}
function invalidateCache(projectId) {
	metadataCache.delete(projectId);
}
function globToRegex(pattern) {
	let regex = "^";
	let i = 0;
	while (i < pattern.length) {
		const c = pattern[i];
		if (c === "*" && pattern[i + 1] === "*") {
			if (pattern[i + 2] === "/") {
				regex += "(?:.+/)?";
				i += 3;
			} else {
				regex += ".*";
				i += 2;
			}
		} else if (c === "*") {
			regex += "[^/]*";
			i++;
		} else if (c === "?") {
			regex += "[^/]";
			i++;
		} else if (".()[]{}+^$|\\".includes(c)) {
			regex += "\\" + c;
			i++;
		} else {
			regex += c;
			i++;
		}
	}
	return new RegExp(regex + "$");
}
var IGNORE_GLOBS = [
	"!node_modules",
	"!.git",
	"!dist",
	"!build",
	"!out",
	"!.next",
	"!.turbo",
	"!.cache",
	"!coverage",
	"!.DS_Store"
];
var resolvedRgPath;
async function findRipgrep() {
	if (resolvedRgPath !== void 0) return resolvedRgPath;
	try {
		const { rgPath } = require("@vscode/ripgrep");
		if (rgPath) {
			const unpackedPath = rgPath.includes("app.asar") ? rgPath.replace("app.asar", "app.asar.unpacked") : rgPath;
			try {
				if ((await (0, fs_promises.stat)(unpackedPath)).isFile()) {
					resolvedRgPath = unpackedPath;
					console.log(`[MCP] ripgrep (bundled): ${unpackedPath}`);
					return unpackedPath;
				}
			} catch {}
		}
	} catch {}
	const candidates = process.platform === "win32" ? [] : [
		"/opt/homebrew/bin/rg",
		"/usr/local/bin/rg",
		"/usr/bin/rg",
		"/opt/local/bin/rg"
	];
	for (const p of candidates) try {
		if ((await (0, fs_promises.stat)(p)).isFile()) {
			resolvedRgPath = p;
			console.log(`[MCP] ripgrep (system): ${p}`);
			return p;
		}
	} catch {}
	try {
		const { stdout } = await execFileAsync$9(process.env.SHELL || "/bin/sh", ["-lc", "which rg"], { timeout: 3e3 });
		const found = stdout.trim().split("\n").pop()?.trim();
		if (found && !found.includes("not found")) try {
			if ((await (0, fs_promises.stat)(found)).isFile()) {
				resolvedRgPath = found;
				console.log(`[MCP] ripgrep (PATH): ${found}`);
				return found;
			}
		} catch {}
	} catch {}
	resolvedRgPath = null;
	console.warn("[MCP] ripgrep not found — using JS fallback for local_glob/local_grep (slower, less accurate)");
	return null;
}
/** Try to read a project file, return content or null */
async function tryReadProjectFile(projectId, filePath) {
	try {
		const res = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
		if (!res.ok) return null;
		return (await res.json()).content || null;
	} catch {
		return null;
	}
}
/** Extract CSS custom property definitions from CSS content */
function extractCssVariables(css) {
	const vars = {};
	const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
	let match;
	while ((match = re.exec(css)) !== null) vars[match[1]] = match[2].trim();
	return vars;
}
/**
* Tailwind v4 `@theme` namespaces and the utilities each one generates. An
* imported design system writes tokens like `--color-surface`, so matching only
* shadcn's `--primary`/`--card` names reports "no theme" for the very design
* system the import just created — and the model falls back to inline styles.
* Order matters: `font-size-` must be tested before `font-`.
*/
var THEME_NAMESPACES = [
	[/^color-/, "--color-<name> → bg-<name>, text-<name>, border-<name>"],
	[/^text-/, "--text-<name> → text-<name> (font size)"],
	[/^font-weight-/, "--font-weight-<name> → font-<name>"],
	[/^font-/, "--font-<name> → font-<name> (font family)"],
	[/^radius-/, "--radius-<name> → rounded-<name>"],
	[/^spacing-/, "--spacing-<name> → p-<name>, m-<name>, gap-<name>"],
	[/^shadow-/, "--shadow-<name> → shadow-<name>"],
	[/^tracking-/, "--tracking-<name> → tracking-<name>"],
	[/^leading-/, "--leading-<name> → leading-<name>"],
	[/^breakpoint-/, "--breakpoint-<name> → <name>: responsive variants"]
];
/**
* Variables outside a `@theme` namespace generate no utility at all. They are
* still usable, but only through v4's variable shorthand — `text-(length:--x)`
* is `text-[length:var(--x)]`, where `length:` disambiguates font-size from
* color. Reporting these as if they minted `text-<name>` sends the model
* chasing classes that never compile.
*/
var NON_NAMESPACED_HINT = "--<name> (outside a @theme namespace) → no generated utility; reference it as bg-(--<name>), or text-(length:--<name>) for a size";
var SHADCN_THEME_RE = /^(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|radius|sidebar|chart)/;
/**
* Discover theme info from project files (globals.css, tailwind.config).
* Returns a short summary string for the system prompt, or empty string.
*/
async function getProjectThemeSummary(projectId) {
	try {
		const filePaths = (await getFileMetadata(projectId)).map((f) => f.path);
		const cssPath = [
			"app/globals.css",
			"src/app/globals.css",
			"styles/globals.css",
			"src/styles/globals.css",
			"src/index.css",
			"src/styles.css",
			"globals.css"
		].find((c) => filePaths.includes(c)) || filePaths.find((p) => p.endsWith(".css") && p.includes("global")) || filePaths.find((p) => p.endsWith(".css") && p.includes("index"));
		if (!cssPath) return "";
		const cssContent = await tryReadProjectFile(projectId, cssPath);
		if (!cssContent) return "";
		const vars = extractCssVariables(cssContent);
		if (Object.keys(vars).length === 0) return "";
		const themeVars = Object.entries(vars).filter(([name]) => THEME_NAMESPACES.some(([re]) => re.test(name)) || SHADCN_THEME_RE.test(name));
		if (themeVars.length === 0) return "";
		const hints = THEME_NAMESPACES.filter(([re]) => themeVars.some(([name]) => re.test(name))).map(([, hint]) => `  ${hint}`);
		if (themeVars.some(([name]) => SHADCN_THEME_RE.test(name))) hints.push("  --<name> (shadcn style) → bg-<name>, text-<name> (e.g. --primary → bg-primary)");
		if (themeVars.some(([name]) => !THEME_NAMESPACES.some(([re]) => re.test(name)))) hints.push(`  ${NON_NAMESPACED_HINT}`);
		const lines = [
			`## Project Theme (from ${cssPath})`,
			"These are the project's actual token values. Prefer the generated utility",
			"classes below over inline styles or raw hex codes on canvas:",
			...hints,
			""
		];
		for (const [name, value] of themeVars) lines.push(`  --${name}: ${value}`);
		return "\n" + lines.join("\n");
	} catch (err) {
		console.warn("[MCP] Theme discovery failed:", err);
		return "";
	}
}
var DEFAULT_READ_LIMIT = 2e3;
/** Slice file content into numbered lines with offset/limit pagination */
function sliceLines(content, filePath, offset, limit) {
	const allLines = content.split("\n");
	const totalLines = allLines.length;
	const start = Math.max(0, (offset ?? 1) - 1);
	const max = limit ?? DEFAULT_READ_LIMIT;
	const numbered = allLines.slice(start, start + max).map((line, i) => `${start + i + 1}\t${line}`).join("\n");
	return `${`File: ${filePath} (${totalLines} lines total)`}\n${numbered}${start + max < totalLines ? `\n... (${totalLines - start - max} more lines, use offset/limit to read more)` : ""}`;
}
async function handleRead(projectId, args) {
	const filePath = args.file_path;
	if (!filePath) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path is required"
		}]
	};
	const res = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
	if (!res.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: `File not found: ${filePath}`
		}]
	};
	const file = await res.json();
	if (!file.content) return { content: [{
		type: "text",
		text: "(empty file)"
	}] };
	return { content: [{
		type: "text",
		text: sliceLines(file.content, filePath, args.offset, args.limit)
	}] };
}
async function handleGlob(projectId, args) {
	const pattern = args.pattern || "*";
	const files = await getFileMetadata(projectId);
	const re = globToRegex(pattern);
	const matches = files.filter((f) => re.test(f.path)).map((f) => f.path).sort();
	if (matches.length === 0) return { content: [{
		type: "text",
		text: `No files matching: ${pattern}`
	}] };
	return { content: [{
		type: "text",
		text: matches.join("\n")
	}] };
}
async function handleGrep(projectId, args) {
	const pattern = args.pattern;
	if (!pattern) return {
		isError: true,
		content: [{
			type: "text",
			text: "pattern is required"
		}]
	};
	let filePaths = (await getFileMetadata(projectId)).map((f) => f.path);
	if (args.glob) {
		const re = globToRegex(args.glob);
		filePaths = filePaths.filter((p) => re.test(p));
	}
	const regex = new RegExp(pattern, args.case_insensitive ? "gi" : "g");
	const outputMode = args.output_mode || "content";
	const headLimit = args.head_limit ?? 250;
	const contextBefore = args.context_before ?? args.context ?? 0;
	const contextAfter = args.context_after ?? args.context ?? 0;
	const results = [];
	const BATCH_SIZE = 16;
	const MAX_FILES = 2e3;
	const searchList = filePaths.slice(0, MAX_FILES);
	for (let b = 0; b < searchList.length; b += BATCH_SIZE) {
		if (headLimit > 0 && results.length >= headLimit) break;
		const batch = searchList.slice(b, b + BATCH_SIZE);
		const contents = await Promise.all(batch.map(async (fp) => {
			try {
				const res = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(fp)}`);
				if (!res.ok) return null;
				const file = await res.json();
				return file.content ? {
					fp,
					content: file.content
				} : null;
			} catch {
				return null;
			}
		}));
		for (const item of contents) {
			if (!item) continue;
			if (headLimit > 0 && results.length >= headLimit) break;
			const { fp, content } = item;
			const lines = content.split("\n");
			const matchedLineNums = /* @__PURE__ */ new Set();
			for (let i = 0; i < lines.length; i++) if (regex.test(lines[i])) {
				matchedLineNums.add(i);
				regex.lastIndex = 0;
			}
			if (matchedLineNums.size === 0) continue;
			if (outputMode === "files_with_matches") results.push(fp);
			else if (outputMode === "count") results.push(`${fp}:${matchedLineNums.size}`);
			else {
				const linesToShow = /* @__PURE__ */ new Set();
				for (const lineNum of matchedLineNums) for (let c = Math.max(0, lineNum - contextBefore); c <= Math.min(lines.length - 1, lineNum + contextAfter); c++) linesToShow.add(c);
				const sortedLines = [...linesToShow].sort((a, b) => a - b);
				let lastLine = -2;
				for (const lineNum of sortedLines) {
					if (headLimit > 0 && results.length >= headLimit) break;
					if (lineNum > lastLine + 1 && lastLine >= 0) results.push("--");
					const prefix = matchedLineNums.has(lineNum) ? ":" : "-";
					results.push(`${fp}:${lineNum + 1}${prefix} ${lines[lineNum]}`);
					lastLine = lineNum;
				}
			}
		}
	}
	if (results.length === 0) return { content: [{
		type: "text",
		text: `No matches for: ${pattern}`
	}] };
	const truncNote = filePaths.length > MAX_FILES ? `\n... (searched first ${MAX_FILES} of ${filePaths.length} files — narrow with glob to search more)` : "";
	return { content: [{
		type: "text",
		text: results.join("\n") + truncNote
	}] };
}
/** Fix common AI mistakes in component file JSX before saving */
function fixComponentJSX(filePath, content) {
	if (!/\.(tsx|jsx)$/.test(filePath)) return content;
	return content.replace(/\s*style=\{\{\s*"className"\s*:\s*"([^"]*)"\s*\}\}/g, " className=\"$1\"");
}
/**
* Keep MCP component discovery useful during the same chat turn that creates a
* component. The renderer receives the authoritative project-builder index via
* SSE, but the MCP process otherwise keeps the snapshot captured when chat
* started. This intentionally covers common source exports only; the builder
* remains authoritative for compilation and complex re-export resolution.
*/
function mergeWrittenComponentsIntoIndex(projectId, files) {
	const next = { ...projectComponentIndex.get(projectId) ?? {} };
	for (const file of files) {
		if (!/\.(tsx|jsx)$/.test(file.path)) continue;
		const previousForPath = /* @__PURE__ */ new Map();
		for (const [name, entry] of Object.entries(next)) if (entry.path === file.path) {
			previousForPath.set(name, entry);
			delete next[name];
		}
		const found = /* @__PURE__ */ new Map();
		for (const match of file.content.matchAll(/\bexport\s+(?:declare\s+)?(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_$]*)/g)) found.set(match[1], match[1]);
		for (const match of file.content.matchAll(/\bexport\s*\{([^}]+)\}(?!\s*from\b)/g)) for (const rawPart of match[1].split(",")) {
			const part = rawPart.trim().replace(/^type\s+/, "");
			const exportedName = /^(\w+)\s+as\s+(\w+)$/.exec(part)?.[2] ?? part;
			if (/^[A-Z][A-Za-z0-9_$]*$/.test(exportedName)) found.set(exportedName, exportedName);
		}
		const namedDefault = /\bexport\s+default\s+(?:function|class)\s+([A-Z][A-Za-z0-9_$]*)/.exec(file.content);
		const identifierDefault = /\bexport\s+default\s+([A-Z][A-Za-z0-9_$]*)\s*;?/.exec(file.content);
		const defaultName = namedDefault?.[1] ?? identifierDefault?.[1];
		if (defaultName) found.set(defaultName, "default");
		for (const [name, exportName] of found) {
			const props = previousForPath.get(name)?.props;
			next[name] = props ? {
				path: file.path,
				exportName,
				props
			} : {
				path: file.path,
				exportName
			};
		}
	}
	projectComponentIndex.set(projectId, next);
}
async function handleWrite(projectId, args) {
	const filePath = args.file_path;
	let content = args.content;
	if (!filePath || content === void 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path and content are required"
		}]
	};
	content = fixComponentJSX(filePath, content);
	const getRes = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
	if (getRes.ok) {
		const patchRes = await apiFetch$1(`/projects/${projectId}/files/${(await getRes.json()).id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content })
		});
		if (!patchRes.ok) return mcpResultFromFailedResponse(patchRes, `Failed to write ${filePath} (${patchRes.status})`);
		invalidateCache(projectId);
		mergeWrittenComponentsIntoIndex(projectId, [{
			path: filePath,
			content
		}]);
		mcpEvents.emit("file_changed", {
			projectId,
			filePath,
			content
		});
		return { content: [{
			type: "text",
			text: `Updated: ${filePath}`
		}] };
	} else {
		const ext = filePath.split(".").pop() || "";
		const createRes = await apiFetch$1(`/projects/${projectId}/files`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				path: filePath,
				fileType: {
					tsx: "tsx",
					ts: "ts",
					jsx: "jsx",
					js: "js",
					css: "css",
					json: "json"
				}[ext] || "other",
				content
			})
		});
		if (!createRes.ok) return mcpResultFromFailedResponse(createRes, `Failed to create ${filePath} (${createRes.status})`);
		invalidateCache(projectId);
		mergeWrittenComponentsIntoIndex(projectId, [{
			path: filePath,
			content
		}]);
		mcpEvents.emit("file_changed", {
			projectId,
			filePath,
			content,
			isNew: true
		});
		return { content: [{
			type: "text",
			text: `Created: ${filePath}`
		}] };
	}
}
async function handleWriteBatch(projectId, args) {
	if (!Array.isArray(args.files) || args.files.length === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "files array is required (1-500 entries)"
		}]
	};
	if (args.files.length > 500) return {
		isError: true,
		content: [{
			type: "text",
			text: `Too many files (${args.files.length}). Max 500 per batch — split into multiple calls.`
		}]
	};
	const typeMap = {
		tsx: "tsx",
		ts: "ts",
		jsx: "jsx",
		js: "js",
		css: "css",
		json: "json"
	};
	const filesPayload = [];
	for (const f of args.files) {
		if (!f?.file_path || f?.content === void 0) return {
			isError: true,
			content: [{
				type: "text",
				text: "each file needs file_path and content"
			}]
		};
		const ext = String(f.file_path).split(".").pop() || "";
		filesPayload.push({
			path: f.file_path,
			content: fixComponentJSX(f.file_path, f.content),
			fileType: typeMap[ext] || "other"
		});
	}
	const existingRes = await apiFetch$1(`/projects/${projectId}/files`);
	if (!existingRes.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: `Failed to inspect existing files before batch write: ${existingRes.status}`
		}]
	};
	const existingFiles = await existingRes.json();
	const existingPaths = new Set(existingFiles.map((f) => f.path).filter(Boolean));
	const skippedExisting = filesPayload.filter((f) => existingPaths.has(f.path));
	const newFiles = filesPayload.filter((f) => !existingPaths.has(f.path));
	if (newFiles.length > 0) {
		const res = await apiFetch$1(`/import/files`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId,
				files: newFiles
			})
		});
		if (!res.ok) return mcpResultFromFailedResponse(res, `Batch write failed (${res.status})`);
		invalidateCache(projectId);
		mergeWrittenComponentsIntoIndex(projectId, newFiles);
		for (const f of newFiles) mcpEvents.emit("file_changed", {
			projectId,
			filePath: f.path,
			content: f.content,
			isNew: true
		});
	}
	const parts = [`Batch wrote ${newFiles.length} new file${newFiles.length === 1 ? "" : "s"}`];
	if (newFiles.length > 0) parts.push(newFiles.map((f) => f.path).join(", "));
	if (skippedExisting.length > 0) parts.push(`Skipped ${skippedExisting.length} existing file${skippedExisting.length === 1 ? "" : "s"} (use project_write/project_edit to update): ${skippedExisting.map((f) => f.path).join(", ")}`);
	return { content: [{
		type: "text",
		text: parts.join(". ")
	}] };
}
async function handleEdit(projectId, args) {
	const filePath = args.file_path;
	const oldText = args.old_string;
	const newText = args.new_string;
	if (!filePath || oldText === void 0 || newText === void 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path, old_string, and new_string are required"
		}]
	};
	if (oldText === newText) return {
		isError: true,
		content: [{
			type: "text",
			text: "old_string and new_string are identical — nothing to change"
		}]
	};
	const getRes = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
	if (!getRes.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: `File not found: ${filePath}`
		}]
	};
	const file = await getRes.json();
	if (!file.content || !file.content.includes(oldText)) return {
		isError: true,
		content: [{
			type: "text",
			text: `old_string not found in ${filePath}. Make sure you read the file first and use the exact text including whitespace/indentation.`
		}]
	};
	let updated;
	if (args.replace_all) {
		const parts = file.content.split(oldText);
		const count = parts.length - 1;
		updated = fixComponentJSX(filePath, parts.join(newText));
		const patchRes = await apiFetch$1(`/projects/${projectId}/files/${file.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: updated })
		});
		if (!patchRes.ok) return mcpResultFromFailedResponse(patchRes, `Failed to save ${filePath} (${patchRes.status})`);
		invalidateCache(projectId);
		mcpEvents.emit("file_changed", {
			projectId,
			filePath,
			content: updated
		});
		return { content: [{
			type: "text",
			text: `Edited: ${filePath} (replaced ${count} occurrences)`
		}] };
	}
	const firstIdx = file.content.indexOf(oldText);
	const secondIdx = file.content.indexOf(oldText, firstIdx + 1);
	if (secondIdx !== -1) return {
		isError: true,
		content: [{
			type: "text",
			text: `old_string is not unique in ${filePath} (found at lines ${file.content.slice(0, firstIdx).split("\n").length} and ${file.content.slice(0, secondIdx).split("\n").length}). Include more surrounding context to make it unique, or use replace_all to replace all occurrences.`
		}]
	};
	updated = fixComponentJSX(filePath, file.content.replace(oldText, newText));
	const patchRes = await apiFetch$1(`/projects/${projectId}/files/${file.id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content: updated })
	});
	if (!patchRes.ok) return mcpResultFromFailedResponse(patchRes, `Failed to save ${filePath} (${patchRes.status})`);
	invalidateCache(projectId);
	mcpEvents.emit("file_changed", {
		projectId,
		filePath,
		content: updated
	});
	return { content: [{
		type: "text",
		text: `Edited: ${filePath}`
	}] };
}
async function handleDelete(projectId, args) {
	const filePath = args.file_path;
	if (!filePath) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path is required"
		}]
	};
	const getRes = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
	if (!getRes.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: `File not found: ${filePath}`
		}]
	};
	const delRes = await apiFetch$1(`/projects/${projectId}/files/${(await getRes.json()).id}`, { method: "DELETE" });
	if (!delRes.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: `Failed to delete: ${delRes.status}`
		}]
	};
	invalidateCache(projectId);
	mcpEvents.emit("file_deleted", {
		projectId,
		filePath
	});
	return { content: [{
		type: "text",
		text: `Deleted: ${filePath}`
	}] };
}
var projectAllowedPaths = /* @__PURE__ */ new Map();
/** Set allowed local paths for a project (called from aiChat before spawning CLI) */
function setProjectAllowedPaths(projectId, paths) {
	projectAllowedPaths.set(projectId, paths);
}
/** Read allowed local paths for a project (used to pick the terminal cwd) */
function getProjectAllowedPaths(projectId) {
	return projectAllowedPaths.get(projectId) || [];
}
/** Include one-request folders only for the chat that attached them. */
function getAllowedLocalPaths(projectId, chatTabId) {
	return [.../* @__PURE__ */ new Set([...getProjectAllowedPaths(projectId), ...getPromptFolders(projectId, chatTabId)])];
}
var pendingFolderGrants = /* @__PURE__ */ new Map();
var FOLDER_GRANT_TIMEOUT_MS = 3e5;
/**
* Called from IPC when the user answers the chat's folder-access prompt.
* `path` is added to the project's allowed list here, in the main process,
* rather than waiting for the renderer's `set_allowed_paths` effect to land,
* otherwise the re-check in `ensureLocalAccess` races that round trip and the
* tool fails on a folder the user just granted.
*
* Answering resolves EVERY pending grant for the project, not just this one:
* parallel tool calls each raise their own request, and one shared folder is
* the answer to all of them. Each caller still re-checks its own path.
*/
function resolveFolderAccess(requestId, granted, path$47) {
	const pending = pendingFolderGrants.get(requestId);
	if (!pending) return;
	const { projectId } = pending;
	if (granted && path$47) {
		const current = projectAllowedPaths.get(projectId) || [];
		if (!current.includes(path$47)) setProjectAllowedPaths(projectId, [...current, path$47]);
	}
	for (const [id, grant] of [...pendingFolderGrants]) {
		if (grant.projectId !== projectId) continue;
		clearTimeout(grant.timeout);
		pendingFolderGrants.delete(id);
		grant.resolve({
			granted,
			reason: granted ? void 0 : "declined"
		});
	}
}
/** Drop every waiting folder prompt (chat cancelled / session ended). */
function cancelAllFolderGrants() {
	for (const [id, grant] of pendingFolderGrants) {
		clearTimeout(grant.timeout);
		grant.resolve({
			granted: false,
			reason: "cancelled"
		});
		pendingFolderGrants.delete(id);
	}
}
function requestFolderAccess(projectId, filePath, chatTabId) {
	const requestId = (0, crypto$1.randomUUID)();
	return new Promise((resolve) => {
		const timeout = setTimeout(() => {
			pendingFolderGrants.delete(requestId);
			resolve({
				granted: false,
				reason: "timeout"
			});
		}, FOLDER_GRANT_TIMEOUT_MS);
		pendingFolderGrants.set(requestId, {
			resolve,
			projectId,
			timeout
		});
		mcpEvents.emit("local_access_needed", {
			projectId,
			chatTabId,
			requestId,
			path: filePath
		});
	});
}
/**
* Is the path inside a shared folder, ignoring whether it exists yet?
* Lexical check plus realpath of the nearest EXISTING ancestor, so a
* symlinked ancestor can't smuggle the target out. This only decides whether
* to PROMPT: `isExistingPathAllowed` still returns false for a missing file,
* and a typo'd path inside a folder the user already shared must surface as
* not-found, not as a folder-access prompt.
*/
async function isPathInSharedFolder(filePath, projectId, chatTabId) {
	return isPathOrAncestorAllowed(filePath, getAllowedLocalPaths(projectId, chatTabId));
}
/** The per-call deny once a path has passed the shared-folder gate. */
function denyPath(filePath) {
	return {
		isError: true,
		content: [{
			type: "text",
			text: `Cannot access ${filePath}: it does not exist, or it resolves outside the shared folders.`
		}]
	};
}
/**
* Gate a local-filesystem tool call on the user having shared the folder.
* Returns null when the path is inside a shared folder (or one gets shared),
* otherwise the MCP error result to return verbatim. Without `filePath` the
* question is just "is any folder shared?" (glob / grep / local_folders).
*
* When the folder isn't shared this BLOCKS the tool call while the chat shows
* a grant prompt, the same shape as `requestToolApproval`. Blocking is the whole
* point: returning "access denied" immediately let the model narrate the
* refusal and carry on guessing, instead of waiting for the user to answer.
* The check runs again after a grant because the user may pick a different
* folder than the one that was asked for. Callers still run their own
* existence / symlink check afterwards.
*/
async function ensureLocalAccess(projectId, filePath, chatTabId) {
	const check = () => filePath ? isPathInSharedFolder(filePath, projectId, chatTabId) : getAllowedLocalPaths(projectId, chatTabId).length > 0;
	if (await check()) return null;
	const target = filePath ? `\`${filePath}\`` : "a folder on the local filesystem";
	if (mcpEvents.listenerCount("local_access_needed") === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: `Access denied: ${target} is not in a folder shared with Petal. Ask the user to add it from the + menu in the Petal chat, then retry.`
		}]
	};
	const decision = await requestFolderAccess(projectId, filePath, chatTabId);
	if (decision.granted && await check()) return null;
	return {
		isError: true,
		content: [{
			type: "text",
			text: decision.granted ? `The user shared a folder, but ${target} is still outside it. Stop and ask them which folder holds the files you need. Do not retry other paths.` : decision.reason === "timeout" ? `Still waiting on the user to share ${target}. Stop here and ask them to grant folder access when they're ready. Do not retry.` : `The user declined access to ${target}. Stop and ask them how they'd like to proceed. Do not retry this or any other local path.`
		}]
	};
}
/** Validate an existing path after resolving symlinks. */
async function isExistingPathAllowed(filePath, projectId, chatTabId) {
	return isExistingDestinationAllowed(filePath, getAllowedLocalPaths(projectId, chatTabId));
}
/** Validate a write destination. Existing files use their target realpath; new files walk to the nearest existing ancestor so mkdir -p destinations stay allowed. */
async function isWritePathAllowed(filePath, projectId, chatTabId) {
	return isPathOrAncestorAllowed(filePath, getAllowedLocalPaths(projectId, chatTabId));
}
var projectComponentIndex = /* @__PURE__ */ new Map();
function setProjectComponentIndex(projectId, index) {
	projectComponentIndex.set(projectId, index);
}
/** Recursively list files in a directory (respecting gitignore-like patterns). Fallback only — prefer ripgrep. */
async function walkDir(dir, base, results, maxFiles = 5e4) {
	if (results.length >= maxFiles) return;
	const SKIP_DIRS = /* @__PURE__ */ new Set([
		"node_modules",
		".git",
		".next",
		"dist",
		"build",
		"out",
		".cache",
		".turbo",
		"coverage",
		"target",
		"__pycache__"
	]);
	let entries;
	try {
		entries = await (0, fs_promises.readdir)(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (results.length >= maxFiles) return;
		const fullPath = (0, path.join)(dir, entry.name);
		const relPath = (0, path.relative)(base, fullPath);
		if (entry.isSymbolicLink()) continue;
		else if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
			await walkDir(fullPath, base, results, maxFiles);
		} else results.push(relPath);
	}
}
async function handleLocalRead(_projectId, args, chatTabId) {
	const filePath = args.file_path;
	if (!filePath) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path is required"
		}]
	};
	const denied = await ensureLocalAccess(_projectId, filePath, chatTabId);
	if (denied) return denied;
	if (!await isExistingPathAllowed(filePath, _projectId, chatTabId)) return denyPath(filePath);
	try {
		const content = await (0, fs_promises.readFile)(filePath, "utf-8");
		if (!content) return { content: [{
			type: "text",
			text: "(empty file)"
		}] };
		return { content: [{
			type: "text",
			text: sliceLines(content, filePath, args.offset, args.limit)
		}] };
	} catch (err) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to read: ${err.message}`
			}]
		};
	}
}
async function handleLocalReadBatch(_projectId, args, chatTabId) {
	const filePaths = args.file_paths;
	if (!Array.isArray(filePaths) || filePaths.length === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_paths is required (1-10 absolute paths)"
		}]
	};
	if (filePaths.length > 10) return {
		isError: true,
		content: [{
			type: "text",
			text: `Too many files (${filePaths.length}). Max 10 per batch.`
		}]
	};
	if (filePaths.some((filePath) => typeof filePath !== "string" || !filePath)) return {
		isError: true,
		content: [{
			type: "text",
			text: "every file_paths entry must be a non-empty absolute path"
		}]
	};
	for (const filePath of filePaths) {
		const denied = await ensureLocalAccess(_projectId, filePath, chatTabId);
		if (denied) return denied;
	}
	const deniedIndex = (await Promise.all(filePaths.map((filePath) => isExistingPathAllowed(filePath, _projectId, chatTabId)))).findIndex((isAllowed) => !isAllowed);
	if (deniedIndex !== -1) return denyPath(filePaths[deniedIndex]);
	return { content: [{
		type: "text",
		text: (await Promise.all(filePaths.map(async (filePath) => {
			try {
				const content = await (0, fs_promises.readFile)(filePath, "utf-8");
				return content ? sliceLines(content, filePath, args.offset, args.limit) : `File: ${filePath}\n(empty file)`;
			} catch (err) {
				return `File: ${filePath}\n[read failed: ${err.message}]`;
			}
		}))).join("\n\n")
	}] };
}
async function handleLocalWrite(_projectId, args, chatTabId) {
	const filePath = args.file_path;
	const content = args.content;
	if (!filePath || content === void 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path and content are required"
		}]
	};
	const denied = await ensureLocalAccess(_projectId, filePath, chatTabId);
	if (denied) return denied;
	if (!await isWritePathAllowed(filePath, _projectId, chatTabId)) return denyPath(filePath);
	try {
		await (0, fs_promises.mkdir)((0, path.dirname)(filePath), { recursive: true });
		await (0, fs_promises.writeFile)(filePath, content, "utf-8");
		return { content: [{
			type: "text",
			text: `Written: ${filePath}`
		}] };
	} catch (err) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to write: ${err.message}`
			}]
		};
	}
}
async function handleLocalEdit(_projectId, args, chatTabId) {
	const filePath = args.file_path;
	const oldText = args.old_string;
	const newText = args.new_string;
	if (!filePath || oldText === void 0 || newText === void 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "file_path, old_string, and new_string are required"
		}]
	};
	if (oldText === newText) return {
		isError: true,
		content: [{
			type: "text",
			text: "old_string and new_string are identical — nothing to change"
		}]
	};
	const denied = await ensureLocalAccess(_projectId, filePath, chatTabId);
	if (denied) return denied;
	if (!await isWritePathAllowed(filePath, _projectId, chatTabId)) return denyPath(filePath);
	try {
		const content = await (0, fs_promises.readFile)(filePath, "utf-8");
		if (!content.includes(oldText)) return {
			isError: true,
			content: [{
				type: "text",
				text: `old_string not found in ${filePath}. Make sure you read the file first and use the exact text including whitespace/indentation.`
			}]
		};
		if (args.replace_all) {
			const parts = content.split(oldText);
			const count = parts.length - 1;
			await (0, fs_promises.writeFile)(filePath, parts.join(newText), "utf-8");
			return { content: [{
				type: "text",
				text: `Edited: ${filePath} (replaced ${count} occurrences)`
			}] };
		}
		const firstIdx = content.indexOf(oldText);
		const secondIdx = content.indexOf(oldText, firstIdx + 1);
		if (secondIdx !== -1) return {
			isError: true,
			content: [{
				type: "text",
				text: `old_string is not unique in ${filePath} (found at lines ${content.slice(0, firstIdx).split("\n").length} and ${content.slice(0, secondIdx).split("\n").length}). Include more surrounding context to make it unique, or use replace_all to replace all occurrences.`
			}]
		};
		await (0, fs_promises.writeFile)(filePath, content.replace(oldText, newText), "utf-8");
		return { content: [{
			type: "text",
			text: `Edited: ${filePath}`
		}] };
	} catch (err) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to edit: ${err.message}`
			}]
		};
	}
}
async function handleLocalFolders(_projectId, _args, chatTabId) {
	const noFolders = await ensureLocalAccess(_projectId, void 0, chatTabId);
	if (noFolders) return noFolders;
	return { content: [{
		type: "text",
		text: `Folders you can read and write:\n${getAllowedLocalPaths(_projectId, chatTabId).map((dir) => `- ${dir}`).join("\n")}`
	}] };
}
/** Petal fix: run ripgrep with cwd at each root so -g globs are root-relative. Pass "." explicitly: with no path rg would read the piped stdin and hang. */
async function petalRgPerRoot(rgPath, rgArgs, roots) {
	const out = [];
	for (const root of roots) {
		let stdout = "";
		try {
			({ stdout } = await execFileAsync$9(rgPath, [...rgArgs, "."], { maxBuffer: 52428800, cwd: root }));
		} catch (err) {
			if (err.code === 1) continue;
			throw err;
		}
		const prefix = root.replace(/[\\/]+$/, "") + path.sep;
		for (const line of stdout.split("\n")) if (line) out.push(line === "--" ? line : prefix + line.replace(/^\.[\\/]/, ""));
	}
	return out;
}
async function handleLocalGlob(_projectId, args, chatTabId) {
	const pattern = args.pattern || "**/*";
	const headLimit = args.head_limit ?? 500;
	const noFolders = await ensureLocalAccess(_projectId, void 0, chatTabId);
	if (noFolders) return noFolders;
	const scope = resolveGlobScope(pattern, getAllowedLocalPaths(_projectId, chatTabId));
	const rgPath = await findRipgrep();
	if (rgPath) try {
		const rgArgs = [
			"--files",
			"--hidden",
			"--no-messages"
		];
		for (const g of IGNORE_GLOBS) rgArgs.push("-g", g);
		rgArgs.push("-g", scope.pattern);
		const matches = (await petalRgPerRoot(rgPath, rgArgs, scope.roots)).sort();
		if (matches.length === 0) return { content: [{
			type: "text",
			text: `No files matching: ${pattern}`
		}] };
		const truncated = headLimit > 0 && matches.length > headLimit;
		const shown = truncated ? matches.slice(0, headLimit) : matches;
		const truncNote = truncated ? `\n... (${matches.length - headLimit} more files, use head_limit to see more)` : "";
		return { content: [{
			type: "text",
			text: shown.join("\n") + truncNote
		}] };
	} catch (err) {
		if (err.code === 1) return { content: [{
			type: "text",
			text: `No files matching: ${pattern}`
		}] };
		console.warn("[MCP] ripgrep glob failed, falling back to JS walker:", err.message);
	}
	const re = globToRegex(pattern);
	const allMatches = [];
	for (const dir of scope.roots) {
		const files = [];
		await walkDir(dir, dir, files);
		for (const f of files) {
			const absPath = (0, path.join)(dir, f);
			if (re.test(f) || re.test(absPath)) allMatches.push(absPath);
		}
	}
	allMatches.sort();
	if (allMatches.length === 0) return { content: [{
		type: "text",
		text: `No files matching: ${pattern}`
	}] };
	const truncated = headLimit > 0 && allMatches.length > headLimit;
	const shown = truncated ? allMatches.slice(0, headLimit) : allMatches;
	const truncNote = truncated ? `\n... (${allMatches.length - headLimit} more files, use head_limit to see more)` : "";
	return { content: [{
		type: "text",
		text: shown.join("\n") + truncNote
	}] };
}
async function handleLocalGrep(_projectId, args, chatTabId) {
	const pattern = args.pattern;
	if (!pattern) return {
		isError: true,
		content: [{
			type: "text",
			text: "pattern is required"
		}]
	};
	const noFolders = await ensureLocalAccess(_projectId, void 0, chatTabId);
	if (noFolders) return noFolders;
	const allowed = getAllowedLocalPaths(_projectId, chatTabId);
	const outputMode = args.output_mode || "content";
	const headLimit = args.head_limit ?? 250;
	const contextBefore = args.context_before ?? args.context ?? 0;
	const contextAfter = args.context_after ?? args.context ?? 0;
	const rgPath = await findRipgrep();
	if (rgPath) try {
		const rgArgs = ["--hidden", "--no-messages"];
		for (const g of IGNORE_GLOBS) rgArgs.push("-g", g);
		if (args.case_insensitive) rgArgs.push("-i");
		if (args.glob) rgArgs.push("-g", args.glob);
		if (outputMode === "files_with_matches") rgArgs.push("-l");
		else if (outputMode === "count") rgArgs.push("-c");
		else {
			rgArgs.push("-n");
			if (contextBefore > 0) rgArgs.push("-B", String(contextBefore));
			if (contextAfter > 0) rgArgs.push("-A", String(contextAfter));
		}
		rgArgs.push("--with-filename", "-e", pattern);
		const lines = await petalRgPerRoot(rgPath, rgArgs, allowed);
		if (lines.length === 0) return { content: [{
			type: "text",
			text: `No matches for: ${pattern}`
		}] };
		const truncated = headLimit > 0 && lines.length > headLimit;
		const shown = truncated ? lines.slice(0, headLimit) : lines;
		const truncNote = truncated ? `\n... (${lines.length - headLimit} more results, use head_limit to see more)` : "";
		return { content: [{
			type: "text",
			text: shown.join("\n") + truncNote
		}] };
	} catch (err) {
		if (err.code === 1) return { content: [{
			type: "text",
			text: `No matches for: ${pattern}`
		}] };
		console.warn("[MCP] ripgrep grep failed, falling back to JS walker:", err.message);
	}
	const TEXT_EXTS = /* @__PURE__ */ new Set([
		".ts",
		".tsx",
		".js",
		".jsx",
		".css",
		".json",
		".md",
		".mdx",
		".html",
		".yml",
		".yaml",
		".toml",
		".txt",
		".env",
		".sh"
	]);
	const regex = new RegExp(pattern, args.case_insensitive ? "gi" : "g");
	const results = [];
	for (const dir of allowed) {
		const files = [];
		await walkDir(dir, dir, files);
		if (args.glob) {
			const filterRe = globToRegex(args.glob);
			files.splice(0, files.length, ...files.filter((f) => filterRe.test(f) || filterRe.test((0, path.join)(dir, f))));
		}
		for (const f of files) {
			if (headLimit > 0 && results.length >= headLimit) break;
			const ext = "." + f.split(".").pop();
			if (!TEXT_EXTS.has(ext)) continue;
			const absPath = (0, path.join)(dir, f);
			try {
				const fileLines = (await (0, fs_promises.readFile)(absPath, "utf-8")).split("\n");
				const matchedLineNums = /* @__PURE__ */ new Set();
				for (let i = 0; i < fileLines.length; i++) if (regex.test(fileLines[i])) {
					matchedLineNums.add(i);
					regex.lastIndex = 0;
				}
				if (matchedLineNums.size === 0) continue;
				if (outputMode === "files_with_matches") results.push(absPath);
				else if (outputMode === "count") results.push(`${absPath}:${matchedLineNums.size}`);
				else {
					const linesToShow = /* @__PURE__ */ new Set();
					for (const lineNum of matchedLineNums) for (let c = Math.max(0, lineNum - contextBefore); c <= Math.min(fileLines.length - 1, lineNum + contextAfter); c++) linesToShow.add(c);
					const sortedLines = [...linesToShow].sort((a, b) => a - b);
					let lastLine = -2;
					for (const lineNum of sortedLines) {
						if (headLimit > 0 && results.length >= headLimit) break;
						if (lineNum > lastLine + 1 && lastLine >= 0) results.push("--");
						const prefix = matchedLineNums.has(lineNum) ? ":" : "-";
						results.push(`${absPath}:${lineNum + 1}${prefix} ${fileLines[lineNum]}`);
						lastLine = lineNum;
					}
				}
			} catch {}
		}
	}
	if (results.length === 0) return { content: [{
		type: "text",
		text: `No matches for: ${pattern}`
	}] };
	return { content: [{
		type: "text",
		text: results.join("\n")
	}] };
}
async function handleSearchComponents(projectId, args) {
	const index = projectComponentIndex.get(projectId);
	if (!index || Object.keys(index).length === 0) return { content: [{
		type: "text",
		text: "No components found. Use project_glob(\"components/**/*.tsx\") to discover component files."
	}] };
	const query = (args.query || "").toLowerCase().trim();
	const entries = Object.entries(index);
	const matched = query ? entries.filter(([name, info]) => name.toLowerCase().includes(query) || info.path.toLowerCase().includes(query)) : entries;
	if (matched.length === 0) return { content: [{
		type: "text",
		text: `No components matching "${args.query}". Try a broader search or use project_glob to find files.`
	}] };
	const grouped = /* @__PURE__ */ new Map();
	for (const [name, info] of matched) {
		const dir = info.path.split("/").slice(0, -1).join("/") || ".";
		const line = formatComponentSearchLine(name, info.path, info.props);
		if (!grouped.has(dir)) grouped.set(dir, []);
		grouped.get(dir).push(line);
	}
	const lines = [`${matched.length} components${query ? ` matching "${args.query}"` : ""}:\n`];
	for (const [dir, items] of grouped) {
		lines.push(`${dir}/`);
		lines.push(...items);
	}
	return { content: [{
		type: "text",
		text: lines.join("\n")
	}] };
}
async function handleGetTheme(projectId, _args) {
	const summary = await getProjectThemeSummary(projectId);
	if (!summary) return { content: [{
		type: "text",
		text: "No project theme found (looked for app/globals.css and common alternatives). Prefer Tailwind theme classes once tokens exist."
	}] };
	return { content: [{
		type: "text",
		text: summary
	}] };
}
function textFromToolResult(result) {
	if (!Array.isArray(result?.content)) return "";
	return result.content.filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n");
}
/** Keep a project name with braces or angle brackets from breaking the scaffold JSX. */
function escapeJsxText(text) {
	return text.replace(/[{}<>]/g, " ").replace(/\s+/g, " ").trim();
}
function createdElementIdsFromResult(result) {
	return getCreatedCanvasElementIds("canvas_add", result) ?? [];
}
async function handleGetDesignContext(projectId, _args) {
	const [theme, pagesResult] = await Promise.all([getProjectThemeSummary(projectId), handleCanvasList(projectId, {})]);
	const index = projectComponentIndex.get(projectId) ?? {};
	const componentEntries = Object.entries(index);
	const shownComponents = componentEntries.slice(0, 80).map(([name, info]) => formatComponentSearchLine(name, info.path, info.props));
	const componentSummary = shownComponents.length > 0 ? `${componentEntries.length} registered components:\n${shownComponents.join("\n")}${componentEntries.length > shownComponents.length ? `\n... (${componentEntries.length - shownComponents.length} more; use targeted search_components)` : ""}` : "No registered project components.";
	const pages = textFromToolResult(pagesResult) || "Canvas page information unavailable.";
	return { content: [{
		type: "text",
		text: [
			`THEME\n${theme || "No project theme yet. If this is an import, write the source tokens into app/globals.css first, then style the canvas with the utilities they generate — do not build a parallel inline-style system."}`,
			`COMPONENTS\n${componentSummary}`,
			`CANVAS\n${pages}`
		].join("\n\n")
	}] };
}
var lastUnreachableNotice = /* @__PURE__ */ new Map();
var UNREACHABLE_NOTICE_INTERVAL_MS = 6e4;
/**
* An external agent can work for many minutes before the user looks at the
* app again. If its canvas edits are going nowhere, say so on the first
* failure rather than letting them come back to an untouched canvas.
*/
function notifyCanvasUnreachable(projectId, projectName) {
	if (!electron.Notification.isSupported()) return;
	const last = lastUnreachableNotice.get(projectId) ?? 0;
	if (Date.now() - last < UNREACHABLE_NOTICE_INTERVAL_MS) return;
	lastUnreachableNotice.set(projectId, Date.now());
	const notification = new electron.Notification({
		title: "Petal canvas unreachable",
		body: `An agent tried to edit "${projectName}" but its window is not open. No changes were applied.`,
		silent: false
	});
	notification.on("click", () => focusProjectWindow(projectId));
	notification.show();
}
/**
* Say which project could not be reached and how to recover. Canvas work used
* to fall back to `BrowserWindow.getAllWindows()[0]`, which silently applied
* edits to whichever project happened to be in the first window; failing is
* correct, but the failure has to reach both the agent and the user.
*/
async function noWindowError(projectId, action) {
	const name = await fetchProjectName(projectId);
	notifyCanvasUnreachable(projectId, name);
	return {
		isError: true,
		content: [{
			type: "text",
			text: getOpenProjectIds().includes(projectId) ? `Cannot ${action}: project "${name}" is open but its window is not responding. Focus that window in Petal and retry.` : `Cannot ${action}: project "${name}" is not open in Petal. Stop and tell the user — do not retry this or any further canvas call until they reopen it.`
		}]
	};
}
/** Resolve only the requested project renderer, including a background tab. */
function resolveProjectWindow(projectId) {
	const webContents = findContentsForProject(projectId);
	return webContents ? { webContents } : null;
}
/** How long the renderer may stay silent before a canvas operation is abandoned. */
var CANVAS_IDLE_TIMEOUT_MS = 1e4;
/** Send a canvas operation to the renderer and wait for the result */
async function sendCanvasOperation(projectId, operation, args) {
	if (isChatCancelled(projectId, typeof args?.chat_tab_id === "string" ? args.chat_tab_id : void 0)) return {
		isError: true,
		content: [{
			type: "text",
			text: "Stopped"
		}]
	};
	const target = resolveProjectWindow(projectId);
	if (!target) return noWindowError(projectId, `apply ${operation}`);
	return new Promise((resolve) => {
		const requestId = (0, crypto$1.randomUUID)();
		const stopListening = () => {
			electron.ipcMain.removeListener("canvas_tool_result", handler);
			electron.ipcMain.removeListener("canvas_tool_progress", onProgress);
		};
		const deadline = createIdleDeadline(CANVAS_IDLE_TIMEOUT_MS, () => {
			stopListening();
			resolve({
				isError: true,
				content: [{
					type: "text",
					text: `The canvas stopped responding for ${CANVAS_IDLE_TIMEOUT_MS / 1e3}s during ${operation}. Part of the change may already be on the canvas: call canvas_list or canvas_read before retrying, or you may duplicate it.`
				}]
			});
		});
		const onProgress = (_, progress) => {
			if (progress?.requestId === requestId) deadline.touch();
		};
		const handler = (_, response) => {
			if (response.requestId === requestId) {
				deadline.cancel();
				stopListening();
				resolve(response.result);
			}
		};
		electron.ipcMain.on("canvas_tool_result", handler);
		electron.ipcMain.on("canvas_tool_progress", onProgress);
		target.webContents.send("canvas_tool_request", {
			requestId,
			projectId,
			operation,
			args
		});
	});
}
var DRAW_PREVIEW_MIN_JSX$1 = 24;
var drawPreviewTimers = /* @__PURE__ */ new Map();
/** Paint incomplete canvas JSX while the tool arguments are still streaming in. */
function enqueueCanvasDrawPreview(projectId, args) {
	if (isChatCancelled(projectId, args.chat_tab_id)) return;
	const jsx = args.jsx;
	if (!jsx || jsx.trim().length < DRAW_PREVIEW_MIN_JSX$1) return;
	if (args.element_id && !args.parent_id && !args.before_id && !args.after_id) return;
	const key = `${projectId}:${args.stream_id ?? args.chat_tab_id ?? "default"}`;
	const pending = drawPreviewTimers.get(key);
	if (pending) clearTimeout(pending);
	drawPreviewTimers.set(key, setTimeout(() => {
		drawPreviewTimers.delete(key);
		sendCanvasOperation(projectId, "preview_draw", {
			jsx,
			stream_id: args.stream_id ?? args.chat_tab_id ?? "default",
			parent_id: args.parent_id,
			before_id: args.before_id,
			after_id: args.after_id,
			anchor_id: args.anchor_id,
			chat_tab_id: args.chat_tab_id,
			issued_at: Date.now()
		}).catch(() => {});
	}, 48));
}
function cancelCanvasDrawPreview(projectId, streamId) {
	const match = streamId ? `${projectId}:${streamId}` : `${projectId}:`;
	for (const [key, timer] of drawPreviewTimers) if (key === match || key.startsWith(match)) {
		clearTimeout(timer);
		drawPreviewTimers.delete(key);
	}
}
function maybePreviewPartialMcpBody(projectId, body, chatTabId) {
	if (!projectId) return;
	if (!isCanvasDrawToolName(extractPartialMcpToolName(body))) return;
	enqueueCanvasDrawPreview(projectId, {
		...extractPartialCanvasDrawArgs(body),
		stream_id: chatTabId ?? "mcp",
		chat_tab_id: chatTabId
	});
}
/** A text block naming images that failed to load, so the agent fixes them without hunting. */
function failedImagesNote(failed) {
	if (!Array.isArray(failed) || failed.length === 0) return [];
	const lines = failed.filter((img) => typeof img?.id === "string" && typeof img?.src === "string").map((img) => `- ${img.id}: ${img.src}`);
	if (lines.length === 0) return [];
	return [{
		type: "text",
		text: `${lines.length} image(s) failed to load and show as empty boxes:\n${lines.join("\n")}\nSet a working src on each in one canvas_patch call, or replace them with labelled placeholders.`
	}];
}
async function handleScreenshot(projectId, args, chatTabId) {
	const win = resolveProjectWindow(projectId);
	if (!win) return noWindowError(projectId, "take a screenshot");
	const elementId = typeof args.element_id === "string" && args.element_id ? args.element_id : null;
	if (!elementId) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id is required"
		}]
	};
	const requestId = (0, crypto$1.randomUUID)();
	return new Promise((resolve) => {
		const timeout = setTimeout(() => {
			electron.ipcMain.removeListener("screenshot_result", handler);
			resolve({
				isError: true,
				content: [{
					type: "text",
					text: "Screenshot renderer did not respond within 12s"
				}]
			});
		}, 12e3);
		const handler = async (_, response) => {
			if (response.requestId === requestId) {
				clearTimeout(timeout);
				electron.ipcMain.removeListener("screenshot_result", handler);
				if (!response.dataUrl && response.nativeCaptureRect) try {
					const image = await win.webContents.capturePage(response.nativeCaptureRect, {
						stayHidden: true,
						stayAwake: true
					});
					if (!image.isEmpty()) {
						const pngBase64 = toPngBase64(image);
						const dataUrl = `data:image/png;base64,${pngBase64}`;
						mcpEvents.emit("screenshot_captured", {
							projectId,
							chatTabId,
							dataUrl,
							elementId
						});
						resolve({ content: [
							{
								type: "image",
								data: pngBase64,
								mimeType: "image/png"
							},
							{
								type: "text",
								text: "Screenshot captured with Electron fallback"
							},
							...failedImagesNote(response.failedImages)
						] });
						return;
					}
				} catch (err) {
					console.warn("[MCP Screenshot] native capture failed:", err);
				}
				if (!response.dataUrl && response.iframeUrl) {
					try {
						const { width, height } = response.iframeSize || {
							width: 1200,
							height: 800
						};
						const offscreen = new electron.BrowserWindow({
							width: width || 1200,
							height: height || 800,
							show: false,
							webPreferences: { offscreen: true }
						});
						try {
							await offscreen.loadURL(response.iframeUrl);
							await new Promise((r) => setTimeout(r, 1500));
							const fullHeight = await offscreen.webContents.executeJavaScript("Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)");
							if (fullHeight > (height || 800)) {
								offscreen.setSize(width || 1200, Math.min(fullHeight, 16e3));
								await new Promise((r) => setTimeout(r, 500));
							}
							const pngBase64 = toPngBase64(await offscreen.webContents.capturePage());
							const dataUrl = `data:image/png;base64,${pngBase64}`;
							mcpEvents.emit("screenshot_captured", {
								projectId,
								chatTabId,
								dataUrl,
								elementId
							});
							resolve({ content: [{
								type: "image",
								data: pngBase64,
								mimeType: "image/png"
							}, {
								type: "text",
								text: `Screenshot of ${response.iframeUrl}`
							}] });
						} finally {
							offscreen.destroy();
						}
						return;
					} catch (err) {
						console.warn("[MCP Screenshot] iframe URL capture failed:", err);
					}
					resolve({
						isError: true,
						content: [{
							type: "text",
							text: "Screenshot capture failed — could not load iframe URL"
						}]
					});
					return;
				}
				if (!response.dataUrl) {
					if (!args.__render_retry) {
						setTimeout(() => {
							handleScreenshot(projectId, {
								...args,
								__render_retry: true
							}, chatTabId).then(resolve).catch((err) => resolve({
								isError: true,
								content: [{
									type: "text",
									text: `Screenshot capture failed on render retry: ${err?.message || err}`
								}]
							}));
						}, 250);
						return;
					}
					resolve({
						isError: true,
						content: [{
							type: "text",
							text: `Screenshot capture failed — element may not be visible${response.captureError ? ` (${response.captureError})` : ""}`
						}]
					});
					return;
				}
				const match = response.dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
				if (match) {
					mcpEvents.emit("screenshot_captured", {
						projectId,
						chatTabId,
						dataUrl: response.dataUrl,
						elementId
					});
					resolve({ content: [
						{
							type: "image",
							data: match[2],
							mimeType: match[1]
						},
						{
							type: "text",
							text: "Screenshot captured"
						},
						...failedImagesNote(response.failedImages)
					] });
				} else resolve({ content: [{
					type: "text",
					text: "Screenshot captured but encoding failed"
				}] });
			}
		};
		electron.ipcMain.on("screenshot_result", handler);
		win.webContents.send("screenshot_request_mcp", {
			requestId,
			projectId,
			elementId
		});
	});
}
async function handleSearchIcons(projectId, args) {
	const queries = [...typeof args.query === "string" && args.query ? [args.query] : [], ...Array.isArray(args.queries) ? args.queries.filter((q) => typeof q === "string" && !!q) : []];
	if (queries.length === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "query or queries is required"
		}]
	};
	if (queries.length === 1) return sendCanvasOperation(projectId, "search_icons", { query: queries[0] });
	return combineQueryResults(queries, await Promise.all(queries.map((query) => sendCanvasOperation(projectId, "search_icons", { query }))));
}
var DEFAULT_ICON_LIBRARIES = [
	"lucide-react",
	"@phosphor-icons/react",
	"@heroicons/react/24/outline"
];
async function handleSetIconLibrary(projectId, args) {
	const raw = args.library ?? args.libraries;
	const requestedLibs = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
	if (requestedLibs.length === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "library is required. Pass an npm package name or subpath import, e.g. lucide-react or @scope/icons-react."
		}]
	};
	const invalid = requestedLibs.filter((l) => !isLoadableIconLibrary(l));
	if (invalid.length > 0) return {
		isError: true,
		content: [{
			type: "text",
			text: `Invalid icon library package specifier: ${invalid.join(", ")}. Use an npm package name or subpath import.`
		}]
	};
	const settingsRes = await apiFetch$1(`/projects/${projectId}/settings`);
	const settings = settingsRes.ok ? await settingsRes.json().catch(() => ({})) : {};
	const existingSettingsLibs = Array.isArray(settings.preferredIconLibraries) ? settings.preferredIconLibraries : settings.iconLibraries;
	const existingLibs = Array.isArray(existingSettingsLibs) ? existingSettingsLibs.filter((lib) => typeof lib === "string") : [];
	const libs = Array.from(/* @__PURE__ */ new Set([...existingLibs, ...requestedLibs]));
	const res = await apiFetch$1(`/projects/${projectId}/settings/icon-libraries`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ iconLibraries: libs })
	});
	if (!res.ok) {
		const errText = await res.text().catch(() => "");
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to set icon library: ${res.status} ${errText.slice(0, 200)}`
			}]
		};
	}
	mcpEvents.emit("settings_changed", {
		projectId,
		key: "iconLibraries"
	});
	return { content: [{
		type: "text",
		text: `Icon libraries enabled: ${libs.join(", ")}. Use <i data-icon="X" data-icon-library="${requestedLibs[0]}" /> in canvas JSX.`
	}] };
}
var ASSET_MIME_BY_EXT = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
	svg: "image/svg+xml",
	avif: "image/avif",
	ico: "image/x-icon",
	woff: "font/woff",
	woff2: "font/woff2",
	ttf: "font/ttf",
	otf: "font/otf",
	mp4: "video/mp4",
	webm: "video/webm"
};
var MAX_ASSET_BYTES = 1e7;
async function handleProjectCopyAsset(projectId, args, chatTabId) {
	const localPath = args.local_path;
	const projectPath = args.project_path;
	if (!localPath || !projectPath) return {
		isError: true,
		content: [{
			type: "text",
			text: "local_path and project_path are required"
		}]
	};
	const denied = await ensureLocalAccess(projectId, localPath, chatTabId);
	if (denied) return denied;
	if (!await isExistingPathAllowed(localPath, projectId, chatTabId)) return denyPath(localPath);
	let buffer;
	try {
		buffer = await (0, fs_promises.readFile)(localPath);
	} catch (err) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to read ${localPath}: ${err.message}`
			}]
		};
	}
	if (buffer.length > MAX_ASSET_BYTES) return {
		isError: true,
		content: [{
			type: "text",
			text: `Asset too large: ${buffer.length} bytes (max ${MAX_ASSET_BYTES}). Compress or scale the image first.`
		}]
	};
	const mimeType = ASSET_MIME_BY_EXT[(localPath.split(".").pop() || "").toLowerCase()] || "application/octet-stream";
	const res = await apiFetch$1(`/import/assets`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			projectId,
			assets: [{
				path: projectPath,
				data: buffer.toString("base64"),
				mimeType,
				size: buffer.length
			}]
		})
	});
	if (!res.ok) return mcpResultFromFailedResponse(res, `Upload failed (${res.status})`);
	const result = await res.json().catch(() => ({
		uploaded: 0,
		failed: [projectPath]
	}));
	if (result.failed && result.failed.length > 0) return {
		isError: true,
		content: [{
			type: "text",
			text: `Server rejected asset: ${result.failed.join(", ")}`
		}]
	};
	invalidateCache(projectId);
	return { content: [{
		type: "text",
		text: `Copied ${localPath} → ${projectPath} (${buffer.length} bytes, ${mimeType})`
	}] };
}
async function handleProjectCopyFile(projectId, args, chatTabId) {
	const parsed = normalizeProjectCopyFileArgs(args);
	if (!parsed.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: parsed.error
		}]
	};
	const payloads = [];
	for (const pair of parsed.files) {
		const denied = await ensureLocalAccess(projectId, pair.local_path, chatTabId);
		if (denied) return denied;
		if (!await isExistingPathAllowed(pair.local_path, projectId, chatTabId)) return denyPath(pair.local_path);
		let buffer;
		try {
			buffer = await (0, fs_promises.readFile)(pair.local_path);
		} catch (err) {
			return {
				isError: true,
				content: [{
					type: "text",
					text: `Failed to read ${pair.local_path}: ${err.message}`
				}]
			};
		}
		const inspected = inspectLocalCopyBuffer(pair.project_path, buffer);
		if (!inspected.ok) return {
			isError: true,
			content: [{
				type: "text",
				text: inspected.error
			}]
		};
		payloads.push({
			...pair,
			content: inspected.content
		});
	}
	const copied = [];
	for (const file of payloads) {
		const result = await handleWrite(projectId, {
			file_path: file.project_path,
			content: file.content
		});
		if (result?.isError) return result;
		copied.push(`${file.local_path} → ${file.project_path}`);
	}
	return { content: [{
		type: "text",
		text: `Copied ${copied.length} file${copied.length === 1 ? "" : "s"} (bytes stayed on the machine; the model did not re-type them):\n${copied.join("\n")}`
	}] };
}
async function handleLocalCopyFile(projectId, args, chatTabId) {
	const parsed = normalizeLocalCopyFileArgs(args);
	if (!parsed.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: parsed.error
		}]
	};
	const payloads = [];
	for (const pair of parsed.files) {
		if (!(0, path.isAbsolute)(pair.local_path)) return {
			isError: true,
			content: [{
				type: "text",
				text: `local_path must be absolute: ${pair.local_path}`
			}]
		};
		const denied = await ensureLocalAccess(projectId, pair.local_path, chatTabId);
		if (denied) return denied;
		if (!await isWritePathAllowed(pair.local_path, projectId, chatTabId)) return denyPath(pair.local_path);
		const res = await apiFetch$1(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(pair.project_path)}`);
		if (!res.ok) return {
			isError: true,
			content: [{
				type: "text",
				text: `File not found in project: ${pair.project_path}`
			}]
		};
		const file = await res.json();
		payloads.push({
			...pair,
			content: file.content ?? ""
		});
	}
	const copied = [];
	for (const file of payloads) {
		try {
			await (0, fs_promises.mkdir)((0, path.dirname)(file.local_path), { recursive: true });
			await (0, fs_promises.writeFile)(file.local_path, file.content, "utf-8");
		} catch (err) {
			return {
				isError: true,
				content: [{
					type: "text",
					text: `Failed to write ${file.local_path}: ${err.message}`
				}]
			};
		}
		copied.push(`${file.project_path} → ${file.local_path}`);
	}
	return { content: [{
		type: "text",
		text: `Copied ${copied.length} file${copied.length === 1 ? "" : "s"} to disk (bytes went straight from the project; the model did not re-type them):\n${copied.join("\n")}`
	}] };
}
async function handleCanvasList(projectId, _args) {
	return sendCanvasOperation(projectId, "list_pages", {});
}
async function handleCanvasCreatePage(projectId, args) {
	if (!args.name || typeof args.name !== "string") return {
		isError: true,
		content: [{
			type: "text",
			text: "name is required"
		}]
	};
	return sendCanvasOperation(projectId, "create_page", { name: args.name });
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function handleCanvasRead(projectId, args, chatTabId, sessionId) {
	if (!args.canvas_id) return {
		isError: true,
		content: [{
			type: "text",
			text: "canvas_id is required"
		}]
	};
	if (!UUID_RE.test(args.canvas_id)) return {
		isError: true,
		content: [{
			type: "text",
			text: `canvas_id '${args.canvas_id}' is not a valid UUID. Call canvas_list first to get the real IDs (they look like 'a1b2c3d4-e5f6-...').`
		}]
	};
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), await sendCanvasOperation(projectId, "read_canvas", withAgent$1(args, chatTabId, sessionId)));
}
/**
* Keep the caller's covering reads in step with the canvas, then strip the
* bookkeeping so it never reaches the agent's context.
*
* `_coveringReads` are hashes the agent has now seen in full: a read, or content
* it just wrote. `_coveringReadChanges` lists `[id, before, after]` for every
* node a write changed. A recorded hash moves to `after` only if it still equals
* `before`, so the agent's own write keeps its read fresh, while a read that was
* already stale (someone else edited the node since) stays stale.
*
* `_coveringReadsFromSource` (canvas_duplicate) lists `[copyId, copyHash,
* sourceId, sourceHash]`: a copied node counts as read only when the reader's
* hash for its source node is current. It is applied before `_coveringReadChanges`,
* whose `before` hashes match the same pre-write state.
*/
function absorbCoveringReads(readerKey, result) {
	if (readerKey && result && !result.isError) {
		const hashes = result._coveringReads;
		if (hashes && typeof hashes === "object" && !Array.isArray(hashes)) {
			for (const [elementId, subtreeHash] of Object.entries(hashes)) if (typeof subtreeHash === "string") recordCoveringRead(readerKey, elementId, subtreeHash);
		}
		const copied = result._coveringReadsFromSource;
		const sourceReads = coveringReadsByReader.get(readerKey);
		if (Array.isArray(copied) && sourceReads) for (const entry of copied) {
			if (!Array.isArray(entry)) continue;
			const [copyId, copyHash, sourceId, sourceHash] = entry;
			if (typeof copyId !== "string" || typeof copyHash !== "string" || typeof sourceId !== "string") continue;
			if (sourceReads.get(sourceId) === sourceHash) sourceReads.set(copyId, copyHash);
		}
		const changes = result._coveringReadChanges;
		const reads = coveringReadsByReader.get(readerKey);
		if (Array.isArray(changes) && reads) for (const change of changes) {
			if (!Array.isArray(change)) continue;
			const [elementId, before, after] = change;
			if (typeof elementId !== "string") continue;
			if (reads.get(elementId) !== before) continue;
			if (typeof after === "string") reads.set(elementId, after);
			else reads.delete(elementId);
		}
	}
	if (result && ("_coveringReads" in result || "_coveringReadChanges" in result || "_coveringReadsFromSource" in result)) {
		const { _coveringReads: _reads, _coveringReadChanges: _changes, _coveringReadsFromSource: _copied, ...rest } = result;
		return rest;
	}
	return result;
}
/**
* `canvas_update` and `canvas_delete` throw away whatever is in the subtree, so
* they only go through if the subtree is what the agent last read. The renderer
* compares this hash with the live one.
*/
function expectedSubtreeHash(projectId, elementId, chatTabId, sessionId) {
	const readerKey = readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	});
	const hash = readerKey ? coveringReadsByReader.get(readerKey)?.get(elementId) : void 0;
	if (!hash) return { error: {
		isError: true,
		content: [{
			type: "text",
			text: `${elementId} has not been read in this session. canvas_read it (or an ancestor) first, so the change does not overwrite edits you have not seen.`
		}]
	} };
	return { hash };
}
async function handleCanvasAdd(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!args.jsx) return {
		isError: true,
		content: [{
			type: "text",
			text: "jsx is required"
		}]
	};
	const enriched = withAgent$1(args, chatTabId, sessionId);
	let result;
	if (args.canvas_id && !UUID_RE.test(args.canvas_id)) {
		const { canvas_id: _canvas_id, ...rest } = enriched;
		result = await sendCanvasOperation(projectId, "add_to_canvas", rest);
	} else result = await sendCanvasOperation(projectId, "add_to_canvas", enriched);
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasDuplicate(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!args.element_id) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id is required"
		}]
	};
	const result = await sendCanvasOperation(projectId, "duplicate_element", withAgent$1(args, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
/**
* The import reference page's skeleton is fixed: a design-system column beside a
* page-recreation column, with the token/component sections in a known order.
* Building it here instead of describing it in the skill means the widths cannot
* drift, the empty columns cannot collapse to 0px, and the caller gets element
* ids as data rather than scraping them out of prose.
*/
var IMPORT_SCAFFOLD_SECTIONS = [
	{
		key: "colors",
		heading: "Color tokens",
		note: "every semantic colour token, each swatch drawn with the utility it documents"
	},
	{
		key: "typography",
		heading: "Typography",
		note: "the type scale in the source fonts"
	},
	{
		key: "spacing",
		heading: "Radius, spacing & motion",
		note: "radii, gutters, and transition tokens"
	},
	{
		key: "icons",
		heading: "Icons",
		note: "a representative set from the source icon pack"
	},
	{
		key: "components",
		heading: "Components",
		note: "one subsection per component you actually imported, by its real exported name, showing every variant, size, and state as labeled examples of the real component"
	}
];
async function handleCreateImportScaffold(projectId, args, chatTabId, sessionId) {
	const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : null;
	if (!title) return {
		isError: true,
		content: [{
			type: "text",
			text: "title is required (the source project name)"
		}]
	};
	const tagline = typeof args.tagline === "string" ? args.tagline.trim() : "";
	const readerKey = readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	});
	const addOne = async (jsx, parentId) => {
		const addArgs = { jsx };
		if (parentId) addArgs.parent_id = parentId;
		const result = absorbCoveringReads(readerKey, await sendCanvasOperation(projectId, "add_to_canvas", withAgent$1(addArgs, chatTabId, sessionId)));
		if (result?.isError) throw new Error(textFromToolResult(result) || "canvas add failed");
		const id = createdElementIdsFromResult(result)[0];
		if (!id) throw new Error("canvas add returned no element id");
		return id;
	};
	try {
		const rootId = await addOne("<div className=\"flex gap-16 p-12 bg-background text-foreground\"></div>");
		const designColumnId = await addOne("<div data-section=\"design-system\" className=\"flex flex-col gap-12 w-[1200px] min-h-[3200px]\"></div>", rootId);
		const pageColumnId = await addOne("<div data-section=\"page-recreation\" className=\"flex flex-col gap-8 w-[1400px] min-h-[3200px]\"></div>", rootId);
		await addOne(tagline ? `<header className="flex flex-col gap-2"><h1 className="text-4xl font-semibold">${escapeJsxText(title)}</h1><p className="text-base opacity-70">${escapeJsxText(tagline)}</p></header>` : `<header className="flex flex-col gap-2"><h1 className="text-4xl font-semibold">${escapeJsxText(title)}</h1></header>`, designColumnId);
		const sections = {};
		for (const section of IMPORT_SCAFFOLD_SECTIONS) sections[section.key] = await addOne(`<section data-section="${section.key}" className="flex flex-col gap-4"><h2 className="text-2xl font-semibold">${escapeJsxText(section.heading)}</h2></section>`, designColumnId);
		const fillOrder = IMPORT_SCAFFOLD_SECTIONS.map((section) => `  ${section.key} (${sections[section.key]}) — ${section.note}`).join("\n");
		return { content: [{
			type: "text",
			text: [
				"Import scaffold created. Add into these ids with canvas_add(parent_id);",
				"do not add another root element and do not position sections with margins.",
				"",
				JSON.stringify({
					root_id: rootId,
					design_system_column_id: designColumnId,
					page_column_id: pageColumnId,
					sections
				}, null, 2),
				"",
				"Fill the design-system column in this order, one canvas_add per section:",
				fillOrder,
				"",
				`Then recreate one real source page inside ${pageColumnId}.`
			].join("\n")
		}] };
	} catch (err) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `Failed to create import scaffold: ${err?.message || err}`
			}]
		};
	}
}
async function handleCanvasUpdate(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!args.element_id || !args.jsx) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id and jsx are required"
		}]
	};
	if (typeof args.jsx === "string" && jsxContainsTruncationStub(args.jsx)) return {
		isError: true,
		content: [{
			type: "text",
			text: "jsx contains petal:truncated stubs from a truncated canvas_read. Drill with canvas_read on stub ids (or update a smaller element) and send complete JSX without truncation stubs."
		}]
	};
	const expected = expectedSubtreeHash(projectId, args.element_id, chatTabId, sessionId);
	if ("error" in expected) return expected.error;
	const result = await sendCanvasOperation(projectId, "update_element", withAgent$1({
		...args,
		expected_hash: expected.hash
	}, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasEdit(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!args.element_id || args.old_string === void 0 || args.new_string === void 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id, old_string, and new_string are required"
		}]
	};
	const result = await sendCanvasOperation(projectId, "edit_element", withAgent$1(args, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasPatch(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!Array.isArray(args.updates) || args.updates.length === 0) return {
		isError: true,
		content: [{
			type: "text",
			text: "updates must be a non-empty array of { element_id, text?, style?, className?, props? }"
		}]
	};
	const result = await sendCanvasOperation(projectId, "patch_elements", withAgent$1(args, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasInsert(projectId, args, chatTabId, sessionId) {
	cancelCanvasDrawPreview(projectId);
	if (!args.jsx) return {
		isError: true,
		content: [{
			type: "text",
			text: "jsx is required"
		}]
	};
	if ([
		args.before_id,
		args.after_id,
		args.parent_id
	].filter((x) => typeof x === "string" && x).length !== 1) return {
		isError: true,
		content: [{
			type: "text",
			text: "Provide exactly one of before_id, after_id, or parent_id."
		}]
	};
	const result = await sendCanvasOperation(projectId, "insert_element", withAgent$1(args, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasGrep(projectId, args) {
	if (!args.pattern) return {
		isError: true,
		content: [{
			type: "text",
			text: "pattern is required"
		}]
	};
	return sendCanvasOperation(projectId, "grep_canvas", args);
}
async function handleCanvasQuery(projectId, args) {
	if (!args.selector) return {
		isError: true,
		content: [{
			type: "text",
			text: "selector is required (e.g. \"table\", \"tbody tr\", \"th\")"
		}]
	};
	return sendCanvasOperation(projectId, "query_canvas", args);
}
async function handleCanvasDelete(projectId, args, chatTabId, sessionId) {
	if (!args.element_id) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id is required"
		}]
	};
	const expected = expectedSubtreeHash(projectId, args.element_id, chatTabId, sessionId);
	if ("error" in expected) return expected.error;
	const result = await sendCanvasOperation(projectId, "delete_element", withAgent$1({
		...args,
		expected_hash: expected.hash
	}, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
async function handleCanvasRename(projectId, args, chatTabId, sessionId) {
	if (!args.element_id) return {
		isError: true,
		content: [{
			type: "text",
			text: "element_id is required"
		}]
	};
	if (typeof args.name !== "string") return {
		isError: true,
		content: [{
			type: "text",
			text: "name is required (empty string clears the custom name)"
		}]
	};
	const result = await sendCanvasOperation(projectId, "rename_element", withAgent$1(args, chatTabId, sessionId));
	return absorbCoveringReads(readerKeyFor({
		projectId,
		chatTabId,
		sessionId
	}), result);
}
var TOOLS = [
	...SIDEBAR_CHAT_TOOLS,
	{
		name: "project_create",
		description: "Create a new top-level Petal design file on Home. Uses the current organization unless organization_id is provided. Opens and binds by default; open=false creates without switching. Reuse request_id and identical arguments after uncertain responses within this app run. If created=true and opened=false, retry project_open with the returned project_id. Does not create a source-code file.",
		inputSchema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					minLength: 1,
					maxLength: 200
				},
				organization_id: {
					type: "string",
					minLength: 1,
					maxLength: 512
				},
				request_id: {
					type: "string",
					minLength: 1,
					maxLength: 512
				},
				open: { type: "boolean" }
			},
			required: ["name", "request_id"],
			additionalProperties: false
		}
	},
	{
		name: "project_rename",
		description: "Rename a top-level Petal design file by project_id, including closed files. API owner permissions apply. Refreshes Home and open tab names without opening or rebinding. Does not rename a source-code path.",
		inputSchema: {
			type: "object",
			properties: {
				project_id: {
					type: "string",
					minLength: 1,
					maxLength: 512
				},
				name: {
					type: "string",
					minLength: 1,
					maxLength: 200
				}
			},
			required: ["project_id", "name"],
			additionalProperties: false
		}
	},
	{
		name: "project_list",
		description: "List projects currently open in Petal. Returns one line per project with name and id; (active tab) marks the selected project in the last-used Petal window, even when another app has focus. For requests about the current/open tab, bind that marked project with project_pick; if none is marked (for example Home is selected), ask which project. This does not change an existing session binding. Call this first when no project is bound, or when the user asks to switch projects. If exactly one project is open, call project_pick with its id immediately without asking the user.",
		inputSchema: {
			type: "object",
			properties: {
				scope: {
					type: "string",
					enum: ["open", "all"],
					description: "Default open; all discovers accessible unopened projects."
				},
				organization_id: {
					type: "string",
					minLength: 1,
					maxLength: 512,
					description: "For scope all; defaults to the authenticated session organization."
				}
			}
		}
	},
	{
		name: "project_open",
		description: "Open an accessible project by stable ID using existing desktop tab navigation. Reuses an open tab, waits for verified active project/page context, then binds this MCP session. Discover IDs with project_list scope all. Preserves other tabs and edits.",
		inputSchema: {
			type: "object",
			properties: { project_id: {
				type: "string",
				minLength: 1,
				maxLength: 512
			} },
			required: ["project_id"],
			additionalProperties: false
		}
	},
	{
		name: "project_pick",
		description: "Bind this MCP session to a project that is open in Petal. Required before other project/canvas/local tools (except list_skills/read_skill). Call again with a different project_id only when the user explicitly asks to switch projects.",
		inputSchema: {
			type: "object",
			properties: { project_id: {
				type: "string",
				description: "Project id from project_list (the value after \"id: \")"
			} },
			required: ["project_id"]
		}
	},
	{
		name: "project_read",
		description: "Read a file from the project with line numbers. Supports offset/limit for reading specific sections of large files. Always read before editing.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative file path (e.g. components/Button.tsx)"
				},
				offset: {
					type: "number",
					description: "Start reading from this line number (1-based). Default: 1"
				},
				limit: {
					type: "number",
					description: "Number of lines to read. Default: 2000. Use smaller values for large files."
				}
			},
			required: ["file_path"]
		}
	},
	{
		name: "project_glob",
		description: "Find files matching a glob pattern. Returns matching file paths.",
		inputSchema: {
			type: "object",
			properties: { pattern: {
				type: "string",
				description: "Glob pattern (e.g. **/*.tsx, components/*)"
			} },
			required: ["pattern"]
		}
	},
	{
		name: "project_grep",
		description: "Search file contents for a regex pattern. Returns matching lines with file paths and line numbers. Supports context lines around matches.",
		inputSchema: {
			type: "object",
			properties: {
				pattern: {
					type: "string",
					description: "Regex pattern to search for"
				},
				glob: {
					type: "string",
					description: "Optional glob to filter which files to search"
				},
				case_insensitive: {
					type: "boolean",
					description: "Case insensitive search"
				},
				output_mode: {
					type: "string",
					enum: [
						"content",
						"files_with_matches",
						"count"
					],
					description: "Output mode: \"content\" shows matching lines (default), \"files_with_matches\" shows only file paths, \"count\" shows match counts per file"
				},
				context: {
					type: "number",
					description: "Number of lines to show before AND after each match"
				},
				context_before: {
					type: "number",
					description: "Number of lines to show before each match"
				},
				context_after: {
					type: "number",
					description: "Number of lines to show after each match"
				},
				head_limit: {
					type: "number",
					description: "Limit output to first N lines/entries. Default: 250"
				}
			},
			required: ["pattern"]
		}
	},
	{
		name: "project_write",
		description: "Write content to a file. Creates the file if it does not exist, or overwrites if it does. Use this for normal file creation and updates, including ordinary two-file changes. project_write_batch is reserved for bulk import workflows that create many new files at once.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative file path"
				},
				content: {
					type: "string",
					description: "Full file content to write"
				}
			},
			required: ["file_path", "content"]
		}
	},
	{
		name: "project_write_batch",
		description: "Bulk import helper for creating many NEW files in one call. Use this for Petal import workflows/codebase imports, not ordinary small edits or two-file component copies. Up to 500 files per call. Files must NOT already exist (this tool only creates, does not overwrite — use project_write or project_edit for updates).",
		inputSchema: {
			type: "object",
			properties: { files: {
				type: "array",
				description: "Array of files to create",
				items: {
					type: "object",
					properties: {
						file_path: {
							type: "string",
							description: "Relative file path (e.g. components/Button.tsx)"
						},
						content: {
							type: "string",
							description: "Full file content"
						}
					},
					required: ["file_path", "content"]
				},
				minItems: 1,
				maxItems: 500
			} },
			required: ["files"]
		}
	},
	{
		name: "project_edit",
		description: "Edit a file by replacing a specific string. The old_string must be unique in the file (or use replace_all). ALWAYS read the file first before editing to get the exact text.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative file path"
				},
				old_string: {
					type: "string",
					description: "Exact text to find and replace (must match exactly including whitespace/indentation)"
				},
				new_string: {
					type: "string",
					description: "Text to replace it with (must be different from old_string)"
				},
				replace_all: {
					type: "boolean",
					description: "Replace all occurrences instead of requiring uniqueness. Default: false"
				}
			},
			required: [
				"file_path",
				"old_string",
				"new_string"
			]
		}
	},
	{
		name: "project_delete",
		description: "Delete a file from the project.",
		inputSchema: {
			type: "object",
			properties: { file_path: {
				type: "string",
				description: "Relative file path to delete"
			} },
			required: ["file_path"]
		}
	},
	{
		name: "approve",
		description: "Permission prompt handler for the in-app chat. Claude Code calls this itself when a tool needs the user's consent; never call it directly.",
		inputSchema: {
			type: "object",
			properties: {
				tool_name: { type: "string" },
				input: {
					type: "object",
					additionalProperties: true
				},
				tool_use_id: { type: "string" }
			},
			required: ["tool_name"]
		}
	},
	{
		name: "list_skills",
		description: "List Petal-owned workflow skills available in this project context. Use this to discover app workflows such as import-from-project without relying on Claude-global skills.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "read_skill",
		description: `Read a Petal-owned workflow skill by exact name. Returns SKILL.md plus any bundled reference files. For ANY design work (new UI, restyle, polish, empty states, forms, dashboards), you MUST call this with name "${DESIGN_SKILL_NAME}" BEFORE the first canvas_add / canvas_update / canvas_edit / canvas_insert — those tools error until you do.`,
		inputSchema: {
			type: "object",
			properties: { name: {
				type: "string",
				description: "Exact skill name from list_skills"
			} },
			required: ["name"]
		}
	},
	{
		name: "take_screenshot",
		description: "Capture a screenshot of a canvas element. Returns the image as base64 PNG. The screenshot is also displayed to the user in chat. Images in the element that failed to load are listed by id and src, so no extra screenshot is needed to find them.",
		inputSchema: {
			type: "object",
			properties: { element_id: {
				type: "string",
				description: "Element to capture"
			} },
			required: ["element_id"]
		}
	},
	{
		name: "search_icons",
		description: "Search the icon library for icons matching a query. Returns icon names. Pass every icon you need as `queries` in one call.",
		inputSchema: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Search query (e.g. \"calendar\", \"email\", \"settings\")"
				},
				queries: {
					type: "array",
					items: { type: "string" },
					description: "Several searches in one call, e.g. [\"calendar\", \"mail\", \"settings\"]"
				}
			}
		}
	},
	{
		name: "search_components",
		description: "Search available project components by name. Returns names, paths, prop types (with required/examples when known), and a short usage hint for variant/size unions. Use before drafting UI — never invent raw <button>/<input> when Button/Input exist. Call with no query to list all components.",
		inputSchema: {
			type: "object",
			properties: { query: {
				type: "string",
				description: "Optional search query to filter by component name or path (e.g. \"button\", \"table\", \"ui/\")"
			} },
			required: []
		}
	},
	{
		name: "canvas_list",
		description: "List canvas pages (names, IDs, loaded/active) plus each page's existing top-level frames and their canvas boxes. Call when you need page IDs or frame positions, or after creating a page. canvas_add writes to the active page and places a new root beside its anchor_id frame, or to the right of all frames when no anchor is given.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "canvas_create_page",
		description: "Create a new, empty canvas page and make it the active canvas. Returns the new page id. Use this before bulk canvas work (e.g. an import) so you build on a dedicated page instead of clobbering whatever page the user currently has open. Subsequent canvas_add calls target the newly created page.",
		inputSchema: {
			type: "object",
			properties: { name: {
				type: "string",
				description: "Name for the new page, e.g. \"Design System\""
			} },
			required: ["name"]
		}
	},
	{
		name: "canvas_read",
		description: "Read elements from a canvas page. Returns the JSX structure of the canvas or a specific element. Oversized trees may include petal:truncated stubs — canvas_read those ids if needed.",
		inputSchema: {
			type: "object",
			properties: {
				canvas_id: {
					type: "string",
					description: "Canvas page ID to read from"
				},
				element_id: {
					type: "string",
					description: "Optional: read a specific element instead of the whole canvas"
				}
			},
			required: ["canvas_id"]
		}
	},
	{
		name: "canvas_add",
		description: "Add new elements to the active/open canvas page. The canvas paints as JSX arrives — add a visible shell first, then 2–4 chunks so the user watches it build instead of one late dump. Creates a new element from JSX and adds it to the canvas. REQUIRES read_skill(\"petal-design\") earlier in this session — otherwise this tool returns an error. Do not ask the user to choose a non-active existing page; canvas_add cannot write there. If the user wants a different existing page, ask them to open it first. To work on a fresh page, call canvas_create_page; it creates and activates the new page.\n\nFor NEW nodes, omit data-element-id (Petal mints ids). Raw <button>/<input>/<select>/<textarea> are rejected when the project has Button/Input/Select/Textarea.\n\nPositioning: when adding to ROOT (no parent_id), pass anchor_id — the frame the user selected, referenced, or that this work relates to — and the editor parks the new section in the nearest free slot beside that frame (right of it, else below it). Without anchor_id it lands to the right of every existing frame, which is far from the user's work on a busy page. Omit `x` / `y` unless you have an exact coordinate. canvas_list reports existing frames and their boxes. To change existing work, edit it — do not add a parallel root on top. NEVER use CSS `marginLeft` or `position: absolute` in JSX to position a root section — those are ignored by the canvas. When adding to a parent (parent_id set), `x` / `y` are ignored — children follow the parent's flex/grid layout.",
		inputSchema: {
			type: "object",
			properties: {
				canvas_id: {
					type: "string",
					description: "Optional active canvas page ID. If provided, it must be the currently active/open canvas page."
				},
				parent_id: {
					type: "string",
					description: "Parent element ID to add inside (optional, adds to root if omitted)"
				},
				jsx: {
					type: "string",
					description: "JSX code for the new element(s)"
				},
				anchor_id: {
					type: "string",
					description: "For ROOT insertions: the element this new frame relates to — the user's selection, an @-referenced element, or the frame you are making a variation of. Any element id works; the editor uses its top-level frame. The new root lands in the nearest free slot beside that frame. Ignored when parent_id, x, or y is set."
				},
				x: {
					type: "number",
					description: "Optional X position in canvas pixels for ROOT insertions only. Ignored when parent_id is set. Omit this unless you have a specific coordinate — prefer anchor_id so the editor places the root beside related work. Do not pass 100/100 (or any overlap) when the page already has work on it."
				},
				y: {
					type: "number",
					description: "Optional Y position in canvas pixels for ROOT insertions only. Ignored when parent_id is set. Omit with x so auto-placement can align to existing frames."
				}
			},
			required: ["jsx"]
		}
	},
	{
		name: "canvas_update",
		description: "Replace an existing element's full JSX. REQUIRES read_skill(\"petal-design\"). Prefer canvas_edit / canvas_insert for surgical changes. Replaces the whole subtree, so it is refused if the element changed since you last read it: canvas_read it again and retry. You MAY include data-element-id from canvas_read to preserve child identity — same id = same node; unknown ids are reminted; foreign/duplicate ids error. Raw <button>/<input>/<select>/<textarea> rejected when project components exist.",
		inputSchema: {
			type: "object",
			properties: {
				element_id: {
					type: "string",
					description: "Element ID to update"
				},
				jsx: {
					type: "string",
					description: "New JSX code for the element"
				}
			},
			required: ["element_id", "jsx"]
		}
	},
	{
		name: "canvas_edit",
		description: "Surgically edit an element by string replace on its JSX (like local_edit / project_edit). REQUIRES read_skill(\"petal-design\"). Prefer this over canvas_update for additive changes (e.g. insert a column cell). old_string must be unique unless replace_all. Applies to the element as it is now; if old_string is not found, someone changed it — canvas_read and retry. Preserves identity for untouched nodes.",
		inputSchema: {
			type: "object",
			properties: {
				element_id: {
					type: "string",
					description: "Element whose JSX to edit"
				},
				old_string: {
					type: "string",
					description: "Exact text to find (must match including whitespace)"
				},
				new_string: {
					type: "string",
					description: "Replacement text"
				},
				replace_all: {
					type: "boolean",
					description: "Replace all occurrences. Default false (requires unique old_string)."
				}
			},
			required: [
				"element_id",
				"old_string",
				"new_string"
			]
		}
	},
	{
		name: "canvas_patch",
		description: "Change text, inline style, className or props on existing elements by id, in one batch. No read and no string matching needed: ids come from canvas_add / canvas_insert results, canvas_grep or canvas_read. Use this instead of canvas_edit for copy changes, colour, spacing, size and class tweaks. `style` and `props` merge into what is there; a null value removes that key. `text` on an element with a single text run sets that run. Each entry reports its own error; the rest still apply.",
		inputSchema: {
			type: "object",
			properties: { updates: {
				type: "array",
				items: {
					type: "object",
					properties: {
						element_id: { type: "string" },
						text: {
							type: "string",
							description: "New text content"
						},
						style: {
							type: "object",
							description: "Inline style keys to set (camelCase, like React style). null removes a key."
						},
						className: {
							type: "string",
							description: "Replaces the whole className"
						},
						props: {
							type: "object",
							description: "Component props or attributes to set. null removes a key."
						}
					},
					required: ["element_id"]
				}
			} },
			required: ["updates"]
		}
	},
	{
		name: "canvas_insert",
		description: "Insert new JSX as a sibling or child without rewriting the parent. REQUIRES read_skill(\"petal-design\"). Provide exactly one of before_id, after_id, or parent_id. New nodes always get fresh ids. Cannot insert at the canvas root — use canvas_add for new top-level sections.",
		inputSchema: {
			type: "object",
			properties: {
				jsx: {
					type: "string",
					description: "JSX for the new element(s)"
				},
				before_id: {
					type: "string",
					description: "Insert as previous sibling of this element"
				},
				after_id: {
					type: "string",
					description: "Insert as next sibling of this element"
				},
				parent_id: {
					type: "string",
					description: "Insert as child of this element (append, or at index)"
				},
				index: {
					type: "number",
					description: "Optional child index when using parent_id (default: append)"
				}
			},
			required: ["jsx"]
		}
	},
	{
		name: "canvas_duplicate",
		description: "Copy an existing canvas element (with its whole subtree) without re-sending its JSX. USE THIS FOR VARIATIONS: when the user asks for another version of a screen, section, card or row that already exists, duplicate it and edit the copy — never redraw it from scratch, and never canvas_read a large tree just to paste it back through canvas_add (big trees come back truncated). The copy gets fresh ids at every node.\n\nPlacement: by default the copy lands next to its source — a top-level frame takes the nearest free slot beside the original (right of it, else below it), a child becomes the next sibling. Pass before_id / after_id / parent_id (+ optional index) to put it somewhere else.\n\nREPEATED ITEMS: for rows, cards, tiers, list items or nav links, build the first one, then make the rest in one call with `copies` — one entry per copy, each mapping a node in the source (its id, or its name) to canvas_patch fields: copies: [{ \"<title-id>\": { text: \"Pro\" }, \"<price-id>\": { text: \"$19\" } }, …]. An empty entry {} is a plain copy. Copies land in order and the result lists every new id, so later changes go through canvas_patch with no read.",
		inputSchema: {
			type: "object",
			properties: {
				element_id: {
					type: "string",
					description: "Element to copy (its whole subtree comes with it)"
				},
				after_id: {
					type: "string",
					description: "Optional: place the copy directly after this element"
				},
				before_id: {
					type: "string",
					description: "Optional: place the copy directly before this element"
				},
				parent_id: {
					type: "string",
					description: "Optional: place the copy inside this element"
				},
				index: {
					type: "number",
					description: "Optional child index when using parent_id (default: append)"
				},
				copies: {
					type: "array",
					description: "Optional: make one copy per entry (max 50). Each entry maps a node in the source subtree, by id or name, to the fields to change on that copy: text, style, className, props (same as canvas_patch). Omit for a single plain copy.",
					items: {
						type: "object",
						additionalProperties: { type: "object" }
					}
				}
			},
			required: ["element_id"]
		}
	},
	{
		name: "canvas_grep",
		description: "Search canvas element JSX for a regex pattern. Returns matching element ids with short snippets. Use after a screenshot to find anchors (e.g. \"Category\") without reading a huge tree.",
		inputSchema: {
			type: "object",
			properties: {
				pattern: {
					type: "string",
					description: "Regex pattern to search for"
				},
				root_id: {
					type: "string",
					description: "Optional: limit search to this element subtree"
				},
				canvas_id: {
					type: "string",
					description: "Optional canvas page ID (defaults to active)"
				},
				case_insensitive: {
					type: "boolean",
					description: "Case insensitive search"
				}
			},
			required: ["pattern"]
		}
	},
	{
		name: "canvas_query",
		description: "Find canvas elements by simple tag/component selector (descendant combinator). Examples: \"table\", \"th\", \"tbody tr\", \"Button\". Returns matching element ids.",
		inputSchema: {
			type: "object",
			properties: {
				selector: {
					type: "string",
					description: "Space-separated tag or component names, e.g. \"tbody tr\""
				},
				root_id: {
					type: "string",
					description: "Optional: limit query to this element subtree"
				},
				canvas_id: {
					type: "string",
					description: "Optional canvas page ID (defaults to active)"
				}
			},
			required: ["selector"]
		}
	},
	{
		name: "canvas_delete",
		description: "Delete an element from the canvas. Refused if the element changed since you last read it: canvas_read it again and retry.",
		inputSchema: {
			type: "object",
			properties: { element_id: {
				type: "string",
				description: "Element ID to delete"
			} },
			required: ["element_id"]
		}
	},
	{
		name: "canvas_rename",
		description: "Set the display name of an element, shown as its row in the Layers panel. Markup is untouched, so no screenshot is needed. Pass an empty name to fall back to the tag or component name.",
		inputSchema: {
			type: "object",
			properties: {
				element_id: {
					type: "string",
					description: "Element ID to rename"
				},
				name: {
					type: "string",
					description: "New display name. Empty clears the custom name."
				}
			},
			required: ["element_id", "name"]
		}
	},
	{
		name: "get_theme",
		description: "Return the project theme summary extracted from globals.css (CSS variables for colors, radius, etc.). Call this when deriving the visual language — prefer theme Tailwind classes (bg-primary, text-muted-foreground) over hardcoded colors.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "canvas_create_import_scaffold",
		description: "Create the design-system import reference page in one call: a root holding a design-system column (header + colour, typography, spacing, icon and component sections, in that order) beside an empty page-recreation column. Returns every element id as JSON. Use this instead of hand-building the layout with canvas_add — it fixes the column widths and section order so imports stay comparable.",
		inputSchema: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "Source project name, used as the page heading"
				},
				tagline: {
					type: "string",
					description: "Optional one-line description of the design system"
				}
			},
			required: ["title"]
		}
	},
	{
		name: "get_design_context",
		description: "Gather the project theme, registered component catalog, and active canvas-page summary in one call. Use once at the start of a design task instead of separate get_theme, unfiltered search_components, and canvas_list calls.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "local_read",
		description: "Read a file from the user's local filesystem with line numbers. Use ABSOLUTE paths. Supports offset/limit for reading specific sections of large files. Always read before editing.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Absolute file path (e.g. /Users/name/code/repo/src/index.ts)"
				},
				offset: {
					type: "number",
					description: "Start reading from this line number (1-based). Default: 1"
				},
				limit: {
					type: "number",
					description: "Number of lines to read. Default: 2000. Use smaller values for large files."
				}
			},
			required: ["file_path"]
		}
	},
	{
		name: "local_read_batch",
		description: "Read 1-10 text files from the user's local filesystem in one call. Use this for bounded component-import chunks instead of issuing many consecutive local_read calls. Returns each file under an absolute-path heading.",
		inputSchema: {
			type: "object",
			properties: {
				file_paths: {
					type: "array",
					items: { type: "string" },
					description: "Absolute file paths to read (1-10)"
				},
				offset: {
					type: "number",
					description: "Optional shared start line (1-based). Default: 1"
				},
				limit: {
					type: "number",
					description: "Optional shared line limit per file. Default: 2000"
				}
			},
			required: ["file_paths"]
		}
	},
	{
		name: "local_write",
		description: "Write content to a file on the user's local filesystem. Creates the file and parent directories if they don't exist. Use ABSOLUTE paths. Only works within allowed directories.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Absolute file path"
				},
				content: {
					type: "string",
					description: "Full file content to write"
				}
			},
			required: ["file_path", "content"]
		}
	},
	{
		name: "local_edit",
		description: "Edit a file on the user's local filesystem by replacing a specific string. The old_string must be unique in the file (or use replace_all). ALWAYS read the file first before editing to get the exact text. Use ABSOLUTE paths.",
		inputSchema: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Absolute file path"
				},
				old_string: {
					type: "string",
					description: "Exact text to find and replace (must match exactly including whitespace/indentation)"
				},
				new_string: {
					type: "string",
					description: "Text to replace it with (must be different from old_string)"
				},
				replace_all: {
					type: "boolean",
					description: "Replace all occurrences instead of requiring uniqueness. Default: false"
				}
			},
			required: [
				"file_path",
				"old_string",
				"new_string"
			]
		}
	},
	{
		name: "local_folders",
		description: "List the folders on the user's computer that you are allowed to read and write. If the user has not shared any yet, this shows them a prompt to share one and waits for their answer. Call this FIRST whenever a task needs their local codebase (importing a design system, porting components, \"my code\"), before any local_glob/local_read, so the user is asked up front rather than midway through.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "local_glob",
		description: "Find files matching a glob pattern on the user's local filesystem. Searches within all allowed directories. Returns absolute file paths.",
		inputSchema: {
			type: "object",
			properties: {
				pattern: {
					type: "string",
					description: "Glob pattern (e.g. **/*.tsx, src/components/*)"
				},
				head_limit: {
					type: "number",
					description: "Limit output to first N files. Default: 500"
				}
			},
			required: ["pattern"]
		}
	},
	{
		name: "local_grep",
		description: "Search file contents on the user's local filesystem for a regex pattern. Returns matching lines with file paths and line numbers. Supports context lines around matches.",
		inputSchema: {
			type: "object",
			properties: {
				pattern: {
					type: "string",
					description: "Regex pattern to search for"
				},
				glob: {
					type: "string",
					description: "Optional glob to filter which files to search"
				},
				case_insensitive: {
					type: "boolean",
					description: "Case insensitive search"
				},
				output_mode: {
					type: "string",
					enum: [
						"content",
						"files_with_matches",
						"count"
					],
					description: "Output mode: \"content\" shows matching lines (default), \"files_with_matches\" shows only file paths, \"count\" shows match counts per file"
				},
				context: {
					type: "number",
					description: "Number of lines to show before AND after each match"
				},
				context_before: {
					type: "number",
					description: "Number of lines to show before each match"
				},
				context_after: {
					type: "number",
					description: "Number of lines to show after each match"
				},
				head_limit: {
					type: "number",
					description: "Limit output to first N lines/entries. Default: 250"
				}
			},
			required: ["pattern"]
		}
	},
	{
		name: "project_copy_asset",
		description: `Copy a binary asset (image, font, icon, video) from the user's local filesystem into the project's asset storage so JSX can reference it. Use this whenever recreated canvas JSX references a local asset — <img src="/hero.jpg">, <Image src="/logo.svg">, CSS background-image: url('/bg.webp'), etc. — BEFORE writing the canvas_add that references it. Without this call, the JSX renders with a broken image (the path 404s).

Typical flow: read the source page with local_read, identify each <img>/Image/url() reference, resolve the path relative to the project's public/ or assets/ folder, then call this tool with the absolute local path and the project-relative destination. Keep the project_path consistent with what the JSX expects (e.g. JSX src="/hero.jpg" → project_path "public/hero.jpg" so the same URL resolves).

Supported formats: png, jpg, jpeg, gif, webp, avif, svg, ico, woff, woff2, ttf, otf, mp4, webm. Max 10MB per asset — compress or scale large hero images before copying.`,
		inputSchema: {
			type: "object",
			properties: {
				local_path: {
					type: "string",
					description: "Absolute path to the source file on the user's filesystem (must be within allowed paths)"
				},
				project_path: {
					type: "string",
					description: "Relative path in the project where the asset should land (e.g. \"public/hero.jpg\"). Match the path the JSX expects."
				}
			},
			required: ["local_path", "project_path"]
		}
	},
	{
		name: "project_copy_file",
		description: `Copy a local text file (or several) into the Petal project without sending the file through the model. Use this when the user wants a local .ts/.tsx/.css/.json file in the project as-is — "copy this component", "port these files", "bring LiquidMenu over". Do NOT local_read + project_write the same bytes; that is slow. After the copy, project_edit only the lines that must change (imports, mocks). Images/fonts/video still use project_copy_asset.

Pass local_path + project_path for one file, or files[] (up to 50) for a batch. local_path is absolute and must be in an allowed directory. project_path is project-relative (e.g. components/LiquidMenu.tsx). Overwrites if the destination already exists.`,
		inputSchema: {
			type: "object",
			properties: {
				local_path: {
					type: "string",
					description: "Absolute path of the source text file on the user's machine"
				},
				project_path: {
					type: "string",
					description: "Relative destination in the Petal project, e.g. components/LiquidMenu.tsx"
				},
				files: {
					type: "array",
					description: "Batch of copies. Prefer this over many single calls when porting a small module graph.",
					items: {
						type: "object",
						properties: {
							local_path: {
								type: "string",
								description: "Absolute source path"
							},
							project_path: {
								type: "string",
								description: "Relative project destination"
							}
						},
						required: ["local_path", "project_path"]
					}
				}
			}
		}
	},
	{
		name: "local_copy_file",
		description: `Copy a project text file (or several) out to the user's local filesystem without sending the file through the model. Use this whenever the user wants a canvas component or any project file on disk — "save this to my repo", "write these components out", "export it to my project". Do NOT project_read + local_write the same bytes; that re-types the whole file through the model and is slow.

Pass project_path + local_path for one file, or files[] (up to 50) for a batch. project_path is project-relative (e.g. components/LiquidMenu.tsx). local_path is absolute, must be in an allowed directory, and parent directories are created as needed. Overwrites if the destination already exists. After the copy, local_edit only the lines that must change (imports, aliases).`,
		inputSchema: {
			type: "object",
			properties: {
				project_path: {
					type: "string",
					description: "Project-relative source path, e.g. components/LiquidMenu.tsx"
				},
				local_path: {
					type: "string",
					description: "Absolute destination path on the user's machine"
				},
				files: {
					type: "array",
					description: "Batch of copies. Prefer this over many single calls when writing out a small module graph.",
					items: {
						type: "object",
						properties: {
							project_path: {
								type: "string",
								description: "Project-relative source path"
							},
							local_path: {
								type: "string",
								description: "Absolute destination path"
							}
						},
						required: ["project_path", "local_path"]
					}
				}
			}
		}
	},
	{
		name: "set_icon_library",
		description: `Enable an icon library for this project so canvas JSX with <i data-icon="X" data-icon-library="Y" /> renders. This appends to the existing icon libraries; it does not remove libraries the user already enabled. Pass an npm package name or subpath import that exports React icon components as named exports. Bundled defaults are available immediately: ${DEFAULT_ICON_LIBRARIES.join(", ")}. For Heroicons, use a subpath such as '@heroicons/react/24/outline' because '@heroicons/react' does not export icons from its root, and use names like ArrowDownCircleIcon. Other packages are loaded dynamically in the editor. Pass a single library name (most common) or an array.`,
		inputSchema: {
			type: "object",
			properties: { library: { oneOf: [{
				type: "string",
				description: "Icon library package to enable for this project, e.g. lucide-react, @heroicons/react/24/outline, @tabler/icons-react, react-icons/fa, or @scope/icons-react."
			}, {
				type: "array",
				items: { type: "string" },
				description: "Multiple icon library packages (rare — usually pick one)."
			}] } },
			required: ["library"]
		}
	},
	{
		name: "report_import_progress",
		description: "Publish a live import checklist to the Petal chat UI. Call it as your very first action when an import starts, right before every ask_user call, and again whenever a step starts or finishes. Always send the complete step list (the UI shows only the latest call), with statuses pending | active | done — exactly one step is active at a time. The UI shows file-level activity from your tool calls automatically — no need to narrate it.",
		inputSchema: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "Card heading, e.g. \"Importing Acme design system\""
				},
				steps: {
					type: "array",
					description: "The full checklist, resent on every call",
					items: {
						type: "object",
						properties: {
							label: {
								type: "string",
								description: "Short user-facing step name, e.g. \"Colors and fonts\""
							},
							status: {
								type: "string",
								enum: [
									"pending",
									"active",
									"done"
								]
							}
						},
						required: ["label", "status"]
					},
					minItems: 1,
					maxItems: 30
				}
			},
			required: ["steps"]
		}
	},
	{
		name: "ask_user",
		description: "Ask the user one or more multiple-choice questions in the Petal chat. Renders an interactive question card (one question at a time, options with a short bold label and an optional muted description). The card appears immediately, so ask as early as possible and keep doing preparatory work (reading, scanning) while the user answers; the selections arrive as the user's next chat message, one \"<question> <answer>\" line per question, after your turn ends. Never wait for the answer inside a turn: finish the work that does not depend on it, then end your turn.",
		inputSchema: {
			type: "object",
			properties: { questions: {
				type: "array",
				minItems: 1,
				maxItems: 4,
				items: {
					type: "object",
					properties: {
						question: {
							type: "string",
							description: "The question, e.g. \"What do you want to import?\""
						},
						options: {
							type: "array",
							minItems: 2,
							maxItems: 5,
							items: {
								type: "object",
								properties: {
									label: {
										type: "string",
										description: "Short answer label, e.g. \"Styles only\""
									},
									description: {
										type: "string",
										description: "Optional one-line clarification, e.g. \"Colors, fonts, spacing and effects, plus icon setup\""
									}
								},
								required: ["label"]
							}
						}
					},
					required: ["question", "options"]
				}
			} },
			required: ["questions"]
		}
	},
	{
		name: "scan_project",
		description: "Run a deterministic pre-pass on a local React codebase to extract a structured project map: stack (framework + Tailwind/styling system), tier routing (tailwind/translated), tokens (CSS vars + color scales), fonts, icon pack, candidate components ranked by import frequency, and provider stack. Returns compact JSON (top components per category truncated, totalCounts retained). Use this BEFORE importing components — one cheap call (~50-300ms even on huge monorepos) replaces minutes of grepping.",
		inputSchema: {
			type: "object",
			properties: {
				root_path: {
					type: "string",
					description: "Absolute path to the user's project root (the folder they want to import from)"
				},
				top_n: {
					type: "number",
					description: "Max components per category (primitives/composites/pages) to include. Default 25. Increase if you need to see more candidates."
				}
			},
			required: ["root_path"]
		}
	}
];
/** Rendered by the in-app chat only; an external MCP client has nowhere to show them. */
var CHAT_UI_TOOLS = /* @__PURE__ */ new Set(["report_import_progress", "ask_user"]);
function getToolsForClient(source) {
	if (source === "internal") return TOOLS.filter((tool) => !EXTERNAL_ONLY_TOOLS.has(tool.name));
	return TOOLS.filter((tool) => tool.name !== "approve" && !CHAT_UI_TOOLS.has(tool.name));
}
var TOOL_HANDLERS = {
	...Object.fromEntries(SIDEBAR_CHAT_TOOLS.map((tool) => [tool.name, (projectId, args) => handleSidebarChat(projectId, parseSidebarChatTool(tool.name, args))])),
	project_read: handleRead,
	project_glob: handleGlob,
	project_grep: handleGrep,
	project_write: handleWrite,
	project_write_batch: handleWriteBatch,
	project_edit: handleEdit,
	project_delete: handleDelete,
	list_skills: handleListSkills,
	read_skill: handleReadSkill,
	project_copy_asset: handleProjectCopyAsset,
	project_copy_file: handleProjectCopyFile,
	take_screenshot: handleScreenshot,
	search_icons: handleSearchIcons,
	set_icon_library: handleSetIconLibrary,
	search_components: handleSearchComponents,
	get_theme: handleGetTheme,
	get_design_context: handleGetDesignContext,
	canvas_list: handleCanvasList,
	canvas_create_page: handleCanvasCreatePage,
	canvas_read: handleCanvasRead,
	canvas_add: handleCanvasAdd,
	canvas_create_import_scaffold: handleCreateImportScaffold,
	canvas_update: handleCanvasUpdate,
	canvas_edit: handleCanvasEdit,
	canvas_insert: handleCanvasInsert,
	canvas_patch: handleCanvasPatch,
	canvas_duplicate: handleCanvasDuplicate,
	canvas_grep: handleCanvasGrep,
	canvas_query: handleCanvasQuery,
	canvas_delete: handleCanvasDelete,
	canvas_rename: handleCanvasRename,
	local_read: handleLocalRead,
	local_read_batch: handleLocalReadBatch,
	local_write: handleLocalWrite,
	local_copy_file: handleLocalCopyFile,
	local_edit: handleLocalEdit,
	local_folders: handleLocalFolders,
	local_glob: handleLocalGlob,
	local_grep: handleLocalGrep,
	scan_project: handleScanProject,
	report_import_progress: handleReportImportProgress,
	ask_user: handleAskUser
};
var IMPORT_STEP_STATUSES = /* @__PURE__ */ new Set([
	"pending",
	"active",
	"done"
]);
/**
* The chat renders these tools straight from their `tool_call` input, so the dispatcher
* runs this before emitting it. Mirrors the inputSchema limits. Returns an error or null.
*/
function chatUiArgsError(toolName, args) {
	if (toolName === "report_import_progress") {
		const steps = args?.steps;
		return Array.isArray(steps) && steps.length >= 1 && steps.length <= 30 && steps.every((step) => step && typeof step.label === "string" && IMPORT_STEP_STATUSES.has(step.status)) ? null : "steps is required: an array of 1-30 { label, status } with status pending | active | done";
	}
	if (toolName === "ask_user") {
		const questions = args?.questions;
		return Array.isArray(questions) && questions.length >= 1 && questions.length <= 4 && questions.every((entry) => entry && typeof entry.question === "string" && Array.isArray(entry.options) && entry.options.length >= 2 && entry.options.length <= 5 && entry.options.every((option) => option && typeof option.label === "string")) ? null : "questions is required: an array of 1-4 { question, options: [{ label, description? }] } with 2-5 options each";
	}
	return null;
}
async function handleReportImportProgress() {
	return { content: [{
		type: "text",
		text: "Progress shown to the user."
	}] };
}
async function handleAskUser() {
	return { content: [{
		type: "text",
		text: "Questions shown to the user. End your turn and wait for their reply."
	}] };
}
async function handleScanProject(_projectId, args, chatTabId) {
	if (!args.root_path) return {
		isError: true,
		content: [{
			type: "text",
			text: "root_path is required (absolute path to the project root)"
		}]
	};
	if (typeof args.root_path !== "string" || !(0, path.isAbsolute)(args.root_path)) return {
		isError: true,
		content: [{
			type: "text",
			text: `root_path must be an absolute path, got: ${args.root_path}`
		}]
	};
	const denied = await ensureLocalAccess(_projectId, args.root_path, chatTabId);
	if (denied) return denied;
	if (!await isExistingPathAllowed(args.root_path, _projectId, chatTabId)) return denyPath(args.root_path);
	const topN = typeof args.top_n === "number" && args.top_n > 0 ? Math.floor(args.top_n) : 25;
	try {
		const map = await scanProject(args.root_path);
		const compact = {
			...map,
			components: {
				primitives: map.components.primitives.slice(0, topN),
				composites: map.components.composites.slice(0, topN),
				pages: map.components.pages.slice(0, topN),
				totalCounts: {
					primitives: map.components.primitives.length,
					composites: map.components.composites.length,
					pages: map.components.pages.length,
					truncated: map.components.primitives.length > topN || map.components.composites.length > topN || map.components.pages.length > topN,
					topN
				}
			},
			warnings: map.warnings.slice(0, 10),
			warningsTruncated: map.warnings.length > 10 ? map.warnings.length - 10 : 0
		};
		return { content: [{
			type: "text",
			text: JSON.stringify(compact, null, 2)
		}] };
	} catch (e) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: `scan_project failed: ${e.message}`
			}]
		};
	}
}
async function handleMcpRequest(sessionId, msg, options) {
	const { id, method, params } = msg;
	const legacyProjectId = options?.legacyProjectId;
	const legacyChatTabId = options?.legacyChatTabId;
	switch (method) {
		case "initialize": {
			if (legacyProjectId) {
				const themeSummary = await getProjectThemeSummary(legacyProjectId);
				const base = buildMcpServerInstructions$1({ sessionPrebound: true });
				return {
					status: 200,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							protocolVersion: "2024-11-05",
							capabilities: { tools: {} },
							serverInfo: {
								name: "petal",
								version: "1.0.0"
							},
							instructions: themeSummary ? `${base}\n\n${themeSummary}` : base
						}
					}
				};
			}
			const sid = mcpSessions.resolveForInitialize(sessionId);
			mcpSessions.ensureBound(sid);
			const sessionPrebound = !!mcpSessions.projectIdOf(sid);
			const boundProjectId = mcpSessions.projectIdOf(sid);
			const themeSummary = boundProjectId ? await getProjectThemeSummary(boundProjectId) : "";
			const base = buildMcpServerInstructions$1({ sessionPrebound });
			return {
				status: 200,
				sessionId: sid,
				body: {
					jsonrpc: "2.0",
					id,
					result: {
						protocolVersion: "2024-11-05",
						capabilities: { tools: {} },
						serverInfo: {
							name: "petal",
							version: "1.0.0"
						},
						instructions: themeSummary ? `${base}\n\n${themeSummary}` : base
					}
				}
			};
		}
		case "notifications/initialized":
			if (legacyProjectId) return { status: 202 };
			return {
				status: 202,
				sessionId
			};
		case "tools/list":
			if (legacyProjectId) return {
				status: 200,
				body: {
					jsonrpc: "2.0",
					id,
					result: { tools: getToolsForClient("internal") }
				}
			};
			const listSession = mcpSessions.resolveForCall(sessionId);
			if (!listSession.ok) return sessionErrorResponse(listSession, id);
			mcpSessions.ensureBound(listSession.sessionId);
			mcpSessions.touch(listSession.sessionId);
			return {
				status: 200,
				sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					result: { tools: getToolsForClient("external") }
				}
			};
		case "tools/call": {
			if (!legacyProjectId) {
				const callSession = mcpSessions.resolveForCall(sessionId);
				if (!callSession.ok) return sessionErrorResponse(callSession, id);
				mcpSessions.ensureBound(callSession.sessionId);
				mcpSessions.touch(callSession.sessionId);
			}
			const toolName = params?.name;
			const toolArgs = params?.arguments || {};
			if (legacyProjectId && EXTERNAL_ONLY_TOOLS.has(toolName)) return {
				status: 200,
				sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					result: {
						isError: true,
						content: [{
							type: "text",
							text: `${toolName} is only available to external MCP clients.`
						}]
					}
				}
			};
			if (toolName === "approve") {
				if (!legacyProjectId) return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							isError: true,
							content: [{
								type: "text",
								text: `${PERMISSION_PROMPT_TOOL} is only available to the Petal in-app chat`
							}]
						}
					}
				};
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: await handleApprove(legacyProjectId, toolArgs, legacyChatTabId)
					}
				};
			}
			if (CHAT_UI_TOOLS.has(toolName)) {
				const error = legacyProjectId ? chatUiArgsError(toolName, toolArgs) : `${toolName} is only available to the Petal in-app chat`;
				if (error) return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							isError: true,
							content: [{
								type: "text",
								text: error
							}]
						}
					}
				};
			}
			if (TOOLS_WITHOUT_BOUND_PROJECT.has(toolName)) try {
				let result;
				const projectResult = await handleLegacyProjectSession(toolName, toolArgs, projectSessionHost((projectId) => mcpSessions.setProject(sessionId, projectId), !!sessionId));
				if (projectResult) result = projectResult;
				else {
					const skillHandler = TOOL_HANDLERS[toolName];
					if (!skillHandler) return {
						status: 200,
						sessionId,
						body: {
							jsonrpc: "2.0",
							id,
							result: {
								isError: true,
								content: [{
									type: "text",
									text: `Unknown tool: ${toolName}`
								}]
							}
						}
					};
					result = await skillHandler("", toolArgs);
					if (!result?.isError && isDesignSkillRead(toolName, toolArgs)) markDesignSkillLoaded({
						sessionId,
						projectId: legacyProjectId,
						chatTabId: legacyChatTabId ?? (legacyProjectId ? resolveChatTabId(legacyProjectId) : void 0)
					});
				}
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result
					}
				};
			} catch (err) {
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							isError: true,
							content: [{
								type: "text",
								text: `Error: ${err.message}`
							}]
						}
					}
				};
			}
			const handler = TOOL_HANDLERS[toolName];
			if (!handler) return {
				status: 200,
				sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					result: {
						isError: true,
						content: [{
							type: "text",
							text: `Unknown tool: ${toolName}`
						}]
					}
				}
			};
			const projectId = legacyProjectId ?? (sessionId && mcpSessions.projectIdOf(sessionId));
			if (!projectId) return {
				status: 200,
				sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					result: {
						isError: true,
						content: [{
							type: "text",
							text: NO_PROJECT_SELECTED_MSG$1
						}]
					}
				}
			};
			if (!getOpenProjectIds().includes(projectId)) return {
				status: 200,
				sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					result: {
						isError: true,
						content: [{
							type: "text",
							text: await formatClosedProjectError(projectId)
						}]
					}
				}
			};
			const meter = await gateMcpCall(projectId, toolName);
			if (!meter.allowed) {
				const windowLabel = meter.window === "week" ? "weekly" : "daily";
				const msg = `${windowLabel[0].toUpperCase()}${windowLabel.slice(1)} MCP calls limit reached (${meter.used}/${meter.limit}).${formatResetHint(meter.resetsAt)} Upgrade the plan to keep using AI tools.`;
				mcpEvents.emit("plan_limit", {
					projectId,
					reason: meter.reason ?? "mcp_usage",
					message: msg
				});
				mcpEvents.emit("tool_result", {
					projectId,
					chatTabId: legacyChatTabId,
					name: toolName,
					args: toolArgs,
					error: msg,
					success: false,
					reason: meter.reason ?? "mcp_usage"
				});
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							isError: true,
							content: [{
								type: "text",
								text: msg
							}]
						}
					}
				};
			}
			mcpEvents.emit("tool_call", {
				projectId,
				chatTabId: legacyChatTabId,
				name: toolName,
				input: toolArgs
			});
			if (!legacyProjectId && sessionId) externalAgentActivity.touch(sessionId, projectId);
			if (DESIGN_SKILL_REQUIRED_TOOLS.has(toolName)) {
				if (!hasDesignSkillLoaded({
					sessionId,
					projectId,
					chatTabId: legacyChatTabId ?? resolveChatTabId(projectId)
				})) {
					// Petal fix: a refused write must not leave its streamed draw preview behind.
					cancelCanvasDrawPreview(projectId);
					sendCanvasOperation(projectId, "preview_drop", { chat_tab_id: legacyChatTabId }).catch(() => {});
					mcpEvents.emit("tool_result", {
						projectId,
						chatTabId: legacyChatTabId,
						name: toolName,
						args: toolArgs,
						error: DESIGN_SKILL_REQUIRED_MSG,
						success: false
					});
					return {
						status: 200,
						sessionId,
						body: {
							jsonrpc: "2.0",
							id,
							result: {
								isError: true,
								content: [{
									type: "text",
									text: DESIGN_SKILL_REQUIRED_MSG
								}]
							}
						}
					};
				}
			}
			if (legacyProjectId && DESTRUCTIVE_TOOLS.has(toolName)) {
				const decision = await requestToolApproval(projectId, toolName, toolArgs, {
					chatTabId: legacyChatTabId,
					sensitive: await writesSensitiveLocalPath(projectId, toolName, toolArgs, legacyChatTabId),
					signal: options?.signal
				});
				if (!decision.approved) {
					const message = decision.reason === "timeout" ? `Timed out waiting for approval for ${toolName}. Ask the user to answer the approval prompt in the Petal chat, then retry.` : `User rejected ${toolName} operation on ${toolArgs.file_path || "file"}`;
					mcpEvents.emit("tool_result", {
						projectId,
						chatTabId: legacyChatTabId,
						name: toolName,
						args: toolArgs,
						error: message,
						success: false
					});
					return {
						status: 200,
						sessionId,
						body: {
							jsonrpc: "2.0",
							id,
							result: {
								isError: true,
								content: [{
									type: "text",
									text: message
								}]
							}
						}
					};
				}
			}
			try {
				const result = await handler(projectId, toolArgs, legacyChatTabId, sessionId).finally(() => {
					if (!legacyProjectId && sessionId) externalAgentActivity.touch(sessionId, projectId);
				});
				if (DESTRUCTIVE_TOOLS.has(toolName) || toolName.startsWith("canvas_") || toolName === "take_screenshot") {
					const createdElementIds = getCreatedCanvasElementIds(toolName, result);
					const errorText = result?.isError ? mcpResultText(result) : void 0;
					const reason = typeof result?.reason === "string" ? result.reason : void 0;
					if (reason && PLAN_LIMIT_REASONS.has(reason)) mcpEvents.emit("plan_limit", {
						projectId,
						reason,
						message: errorText || "This action is over the limit for your plan."
					});
					mcpEvents.emit("tool_result", {
						projectId,
						chatTabId: legacyChatTabId,
						name: toolName,
						args: toolArgs,
						success: !result?.isError,
						error: errorText,
						createdElementIds,
						reason
					});
				}
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: stripCreatedElementIds(result)
					}
				};
			} catch (err) {
				if (DESTRUCTIVE_TOOLS.has(toolName) || toolName.startsWith("canvas_")) mcpEvents.emit("tool_result", {
					projectId,
					chatTabId: legacyChatTabId,
					name: toolName,
					args: toolArgs,
					error: err.message,
					success: false
				});
				return {
					status: 200,
					sessionId,
					body: {
						jsonrpc: "2.0",
						id,
						result: {
							isError: true,
							content: [{
								type: "text",
								text: `Error: ${err.message}`
							}]
						}
					}
				};
			}
		}
		default:
			if (legacyProjectId) {
				if (id !== void 0) return {
					status: 200,
					body: {
						jsonrpc: "2.0",
						id,
						error: {
							code: -32601,
							message: `Method not found: ${method}`
						}
					}
				};
				return { status: 202 };
			}
			const defaultSession = mcpSessions.resolveForCall(sessionId);
			if (!defaultSession.ok) {
				if (id !== void 0) return sessionErrorResponse(defaultSession, id);
				return { status: defaultSession.status };
			}
			if (id !== void 0) return {
				status: 200,
				sessionId: defaultSession.sessionId,
				body: {
					jsonrpc: "2.0",
					id,
					error: {
						code: -32601,
						message: `Method not found: ${method}`
					}
				}
			};
			return {
				status: 202,
				sessionId: defaultSession.sessionId
			};
	}
}
/**
* The one local MCP port both stacks share: dev (localhost:4000) uses 23563,
* prod (api.petal.invalid) uses 21209. The renderer tells main which stack to
* start, so exactly one server binds here and they never collide.
*/
function getMcpListenPort() {
	return Number(process.env.PETAL_MCP_PORT) || 21229;
}
async function startMcpServer$1() {
	return new Promise((resolve, reject) => {
		server$1 = (0, http.createServer)(createMcpRequestListener({
			sessions: mcpSessions,
			dispatch: (sessionId, message, context) => handleMcpRequest(sessionId, message, context),
			getOpenProjectCount: () => getOpenProjectIds().length,
			isTrustedRequest: (headers) => isTrustedLocalRequest(headers, mcpPort),
			onPartialBody: maybePreviewPartialMcpBody,
			log: (message) => console.log(`[MCP] ${message}`),
			logError: (message, err) => console.error(`[MCP] ${message}:`, err)
		}));
		const mcpListenPort = getMcpListenPort();
		server$1.on("error", (err) => {
			mcpStartupError = err.code === "EADDRINUSE" ? `Port ${mcpListenPort} is already in use — another Petal instance is probably running. AI tools will not work until it is closed.` : `MCP server failed to start: ${err.message}`;
			console.error(`[MCP] ${mcpStartupError}`);
			reject(err);
		});
		server$1.listen(mcpListenPort, "127.0.0.1", () => {
			const addr = server$1.address();
			mcpPort = typeof addr === "object" && addr ? addr.port : 0;
			mcpStartupError = null;
			console.log(`[MCP] Server listening on http://127.0.0.1:${mcpPort}`);
			if (purgeTimer) clearInterval(purgeTimer);
			purgeTimer = setInterval(() => mcpSessions.prune(), MCP_SESSION_PRUNE_INTERVAL_MS);
			resolve(mcpPort);
		});
	});
}
/**
* Free the shared port so the v2 stack can bind it. Open SSE streams keep
* their sockets alive, so `close()` alone would never finish.
*/
async function stopMcpServer() {
	if (purgeTimer) clearInterval(purgeTimer);
	purgeTimer = null;
	const closing = server$1;
	server$1 = null;
	mcpPort = 0;
	mcpStartupError = null;
	if (!closing?.listening) return;
	await new Promise((resolve) => {
		closing.close(() => resolve());
		closing.closeAllConnections();
	});
}
/** Why the server is not listening, or null when it is. */
function getMcpStartupError() {
	return mcpStartupError;
}
/**
* Release everything keyed to a project when its tab closes.
*
* The binding matters most: a session left pointing at a closed project gets
* "is not open in Petal" on its next call, which reads as fatal and stops
* the agent. Unbinding routes it through project_pick so it recovers itself.
* The caches are dropped here because nothing else ever evicts them.
*/
function releaseProject(projectId) {
	mcpSessions.unbindProject(projectId);
	metadataCache.delete(projectId);
	projectComponentIndex.delete(projectId);
	mcpMeterGate.delete(projectId);
	lastUnreachableNotice.delete(projectId);
	externalAgentActivity.endProject(projectId);
}
/** MCP URL for in-app AI chat — project id in path (pre-bound, no project_list/pick). */
function getMcpChatUrl(projectId, chatTabId) {
	if (!chatTabId) throw new Error("getMcpChatUrl requires chatTabId (?chatTab= is mandatory for in-app MCP)");
	if (!mcpPort) throw new Error(mcpStartupError ?? "MCP server is not running");
	return `http://127.0.0.1:${mcpPort}/mcp/${encodeURIComponent(projectId)}?chatTab=${encodeURIComponent(chatTabId)}`;
}
/** MCP URL for external clients (Cursor, etc.) — use project_list / project_pick to bind. */
function getMcpUrl() {
	return `http://127.0.0.1:${mcpPort}/mcp`;
}
/** Check if the MCP server is running and healthy */
async function checkMcpHealth() {
	try {
		return (await fetch(`http://127.0.0.1:${mcpPort}/health`, { signal: AbortSignal.timeout(2e3) })).ok;
	} catch {
		return false;
	}
}

export { DESTRUCTIVE_TOOLS, PERMISSION_PROMPT_TOOL, PLAN_LIMIT_REASONS, TOOLS_WITHOUT_BOUND_PROJECT, TOOL_HANDLERS, cancelAllApprovals, checkMcpHealth, clearChatCancelled, enqueueCanvasDrawPreview, findRipgrep, formatClosedProjectError, formatResetHint, gateMcpCall, getActiveSkillOverrides, getApprovalNotificationTarget, getMcpChatUrl, getMcpListenPort, getMcpStartupError, getMcpUrl, getProjectAllowedPaths, getProjectThemeSummary, getSystemSkills$1, isChatCancelled, isExistingPathAllowed, markChatCancelled, mcpEvents, mcpResultText, projectSessionHost, registerMcpChatSession, releaseProject, requestToolApproval, resolveApproval, resolveFolderAccess, seedCoveringReadsFromAttachedElements, setProjectAllowedPaths, setProjectComponentIndex, setSkillOverrides, startMcpServer$1, stopMcpServer, writesSensitiveLocalPath };
