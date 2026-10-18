// Reconstructed from index.js — original module: app/src/main/aiChatV2.ts
import { electron, node_fs_promises, node_path } from "../../../__bundle__/_preamble.js";
import { extractPartialCanvasDrawArgs, isCanvasDrawToolName } from "../../../packages/compiler/src/codegen/extractPartialJson.js";
import { mcpUrl } from "../../../packages/ai/src/mcp/url.js";
import { addedDirectories, formatHostPromptPrefix, joinPromptSegments, promptImages$1 } from "../../../packages/ai/src/prompts/turnPrompt.js";
import { buildAppendedSystemPrompt } from "../../../packages/ai/src/prompts/appendedSystemPrompt.js";
import { AGENT_CHAT_ABORT_CHANNEL, AGENT_CHAT_CHECK_STATUS_CHANNEL, AGENT_CHAT_DROP_TAB_CHANNEL, AGENT_CHAT_GENERATE_TITLE_CHANNEL, AGENT_CHAT_LIST_AGENTS_CHANNEL, AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL, AGENT_CHAT_LIST_MODELS_CHANNEL, AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL, AGENT_CHAT_LOGIN_CHANNEL, AGENT_CHAT_LOGOUT_CHANNEL, AGENT_CHAT_START_CHANNEL, AGENT_CHAT_STEER_CHANNEL, AGENT_CHAT_STREAM_CHANNEL, setProjectActivity } from "../../../packages/ai/src/protocol.js";
import { findRipgrep, getActiveSkillOverrides, mcpEvents, requestToolApproval } from "./mcpServer.js";
import { createAgentRuntime, listAgents, materializeAgentWorkspace, toAgentUIMessageStream } from "../../../packages/ai/src/agents/runtime.js";
import { MCP_SERVER_NAME, dropInAppMcpTab, ensureCanvasResultHandler, forwardCanvasCommand, resolveSkillsRoot, startMcpServer, withChatTab } from "./mcpServerV2.js";

/**
* agents-v2 chat runtime (Electron main).
*
* Runs the feature-flagged chat stack: a local HTTP MCP server whose canvas
* tools forward typed commands to the renderer, and `streamText()` over the
* community CLI providers. Streams `UIMessageChunk`s to the renderer over IPC.
*
* The chat wire is agent-agnostic: it receives `agentId`, `modelId`, `cwd` and
* one opaque `sessionId`. Claude `resume` / Codex `threadId` stay inside
* `@petal/ai/agents`.
*
* Additive: the old `aiChat.ts` / `mcpServer.ts` path is untouched.
*/
var sessions$1 = /* @__PURE__ */ new Map();
var controllers = /* @__PURE__ */ new Map();
/** Settles when the chat tab's latest turn has fully unwound. */
var tabTurns = /* @__PURE__ */ new Map();
/**
* The message a Stop interrupted that the resumed session will never have seen
* (the attempt never started, the CLI drops cancelled runs, or there was no
* resume token yet), waiting for that chat tab's next turn. The transcript still
* shows it, so that turn sends it again ahead of its own message.
*/
var stoppedInputs = /* @__PURE__ */ new Map();
/** Policy of the chat tab's running turn; the MCP gate skips its prompt on auto. */
function runPolicyFor(chatTabId) {
	for (const turn of controllers.values()) if (turn.chatTabId === chatTabId) return turn.policy;
}
/** Owns provider selection, CLI discovery and provider processes. */
var agentRuntime = createAgentRuntime([
	"claude-code",
	"codex",
	"cursor",
	"opencode"
], { resolveBinary: (name) => name === "rg" ? findRipgrep() : Promise.resolve(null) });
var workspaces = /* @__PURE__ */ new Map();
/** In-flight creates, so two first turns for one project share a single directory. */
var workspaceCreates = /* @__PURE__ */ new Map();
function rememberAgentChatSession(chatTabId, session) {
	if (!workspaces.has(session.projectId)) return;
	sessions$1.set(chatTabId, session);
}
function overridesKey(skillOverrides) {
	return JSON.stringify(skillOverrides ?? null);
}
async function ensureProjectAgentWorkspace(projectId, skillsRoot, skillOverrides) {
	const creating = workspaceCreates.get(projectId);
	if (creating) {
		await creating;
		return ensureProjectAgentWorkspace(projectId, skillsRoot, skillOverrides);
	}
	const run = materializeProjectWorkspace(projectId, skillsRoot, skillOverrides);
	workspaceCreates.set(projectId, run);
	try {
		return await run;
	} finally {
		if (workspaceCreates.get(projectId) === run) workspaceCreates.delete(projectId);
	}
}
/**
* One directory per project under userData. Claude stores sessions in the
* cwd, so a fresh temp dir on every launch makes resume and title lookup fail.
* The directory stays on disk across close and reload.
*/
async function pathExists(path) {
	try {
		await (0, node_fs_promises.access)(path);
		return true;
	} catch (error) {
		const code = error.code;
		if (code === "ENOENT" || code === "ENOTDIR") return false;
		throw error;
	}
}
async function materializeProjectWorkspace(projectId, skillsRoot, skillOverrides) {
	const key = overridesKey(skillOverrides);
	const existing = workspaces.get(projectId);
	if (existing && await pathExists(existing.dest)) {
		if (existing.overridesKey !== key) {
			await materializeAgentWorkspace({
				dest: existing.dest,
				skillsRoot,
				skillOverrides
			});
			existing.overridesKey = key;
		}
		return existing.dest;
	}
	const dest = (0, node_path.join)(electron.app.getPath("userData"), "agent-workspaces", projectId.replace(/[^a-zA-Z0-9_-]/g, "_"));
	await (0, node_fs_promises.mkdir)(dest, { recursive: true });
	await materializeAgentWorkspace({
		dest,
		skillsRoot,
		skillOverrides
	});
	workspaces.set(projectId, {
		dest,
		overridesKey: key
	});
	return dest;
}
async function rematerializeAgentWorkspaces(skillsRoot, skillOverrides) {
	const key = overridesKey(skillOverrides);
	await Promise.all([...workspaces.values()].map(async (workspace) => {
		await materializeAgentWorkspace({
			dest: workspace.dest,
			skillsRoot,
			skillOverrides
		});
		workspace.overridesKey = key;
	}));
}
var mcpHandle = null;
var mcpStarting = null;
var DRAW_PREVIEW_MIN_JSX = 24;
var DRAW_PREVIEW_DEBOUNCE_MS = 48;
/**
* Forward streamed `canvas_add` / `canvas_insert` JSX to the renderer as
* `previewDraw` commands so the canvas paints while the model is still
* emitting the tool call. The committed tool call replaces the preview.
*/
function createCanvasDrawPreview(projectId, chatTabId) {
	const toolNames = /* @__PURE__ */ new Map();
	const buffers = /* @__PURE__ */ new Map();
	let timer = null;
	let pending = null;
	const flush = () => {
		timer = null;
		const command = pending;
		pending = null;
		if (!command) return;
		forwardCanvasCommand(projectId, command).catch(() => {});
	};
	return {
		onChunk(chunk) {
			if (chunk.type === "tool-input-start") {
				toolNames.set(chunk.toolCallId, chunk.toolName);
				buffers.set(chunk.toolCallId, "");
				return;
			}
			if (chunk.type !== "tool-input-delta") return;
			const toolName = toolNames.get(chunk.toolCallId);
			if (!toolName || !isCanvasDrawToolName(toolName)) return;
			const json = (buffers.get(chunk.toolCallId) ?? "") + chunk.inputTextDelta;
			buffers.set(chunk.toolCallId, json);
			const args = extractPartialCanvasDrawArgs(json);
			if (!args.jsx || args.jsx.trim().length < DRAW_PREVIEW_MIN_JSX) return;
			if (args.element_id && !args.parent_id && !args.before_id && !args.after_id) return;
			pending = withChatTab({
				type: "previewDraw",
				args: {
					jsx: args.jsx,
					streamId: chunk.toolCallId,
					...args.parent_id ? { parentId: args.parent_id } : {},
					issuedAt: Date.now()
				}
			}, chatTabId);
			if (!timer) timer = setTimeout(flush, DRAW_PREVIEW_DEBOUNCE_MS);
		},
		/** Drop any in-flight preview (stream finished or aborted). */
		drop() {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			pending = null;
			toolNames.clear();
			buffers.clear();
			forwardCanvasCommand(projectId, withChatTab({
				type: "previewDrop",
				args: {}
			}, chatTabId)).catch(() => {});
		}
	};
}
/** A failed start clears the memo so the next turn retries instead of replaying the rejection. */
function getMcpHandle() {
	if (!mcpStarting) {
		const starting = startMcpServer(runPolicyFor).then((handle) => {
			mcpHandle = handle;
			return handle;
		}, (error) => {
			if (mcpStarting === starting) mcpStarting = null;
			throw error;
		});
		mcpStarting = starting;
	}
	return mcpStarting;
}
async function getAgentMcpInfo() {
	try {
		const handle = await getMcpHandle();
		const health = await fetch(`http://127.0.0.1:${handle.port}/health`).catch(() => null);
		return {
			url: handle.baseUrl,
			healthy: !!health?.ok,
			running: true
		};
	} catch {
		return {
			url: "",
			healthy: false,
			running: false
		};
	}
}
/** User-added folders from the renderer (first allowed path plus the rest). */
function userAllowedFolders(request) {
	const folders = [];
	const seen = /* @__PURE__ */ new Set();
	for (const path of [request.cwd, ...request.additionalDirectories ?? []]) {
		const trimmed = path?.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		folders.push(trimmed);
	}
	return folders;
}
/** The project's throwaway agent cwd, created on first use; also the cwd of "Manage connections" terminals. */
async function projectWorkspace(projectId) {
	return ensureProjectAgentWorkspace(projectId, resolveSkillsRoot(), getActiveSkillOverrides());
}
/** Chunks that close the renderer's assistant message; a superseded attempt must not send them. */
var TERMINAL_CHUNK_TYPES = /* @__PURE__ */ new Set([
	"finish",
	"abort",
	"error"
]);
function isErrorFinishChunk(chunk) {
	if (chunk.type !== "finish") return false;
	const reason = chunk.finishReason;
	if (reason === "error") return true;
	if (reason && typeof reason === "object" && "unified" in reason) return reason.unified === "error";
	return false;
}
async function pipeToRenderer(result, streamId, sender, attempt, sendStart, stopSignal, onChunk) {
	const stream = toAgentUIMessageStream(result, { sendStart });
	for await (const chunk of stream) {
		if (chunk.type === "abort") attempt.cancelled = true;
		if (stopSignal.aborted && isErrorFinishChunk(chunk)) attempt.cancelled = true;
		if (attempt.replacement && TERMINAL_CHUNK_TYPES.has(chunk.type)) continue;
		onChunk(chunk);
		if (sender.isDestroyed()) return;
		sender.send(AGENT_CHAT_STREAM_CHANNEL, {
			streamId,
			chunk
		});
	}
}
/** Write a steer into the running assistant message where it landed. */
function sendSteerPart(sender, streamId, part) {
	if (sender.isDestroyed()) return;
	sender.send(AGENT_CHAT_STREAM_CHANNEL, {
		streamId,
		chunk: part
	});
}
function steerPart(request) {
	return {
		type: "data-steer",
		id: request.id,
		data: request.display
	};
}
function steerInput(request) {
	const promptPrefix = formatHostPromptPrefix(request.hostContext ?? {});
	const images = promptImages$1(request.hostContext?.references);
	return {
		prompt: request.prompt,
		...promptPrefix ? { promptPrefix } : {},
		...images.length ? { images } : {}
	};
}
/** Join two turn inputs into one, in order: queued steers, or a lost first prompt and its steer. */
function mergeTurnInputs(first, second) {
	const promptPrefix = joinPromptSegments(first.promptPrefix, second.promptPrefix);
	const images = [...first.images ?? [], ...second.images ?? []];
	return {
		prompt: joinPromptSegments(first.prompt, second.prompt),
		...promptPrefix ? { promptPrefix } : {},
		...images.length ? { images } : {}
	};
}
/**
* Steer the turn running on `streamId`. A driver that takes mid-turn input
* gets the message directly; otherwise the current attempt is stopped and a
* new one resumes the same CLI session with the message, on the same stream.
*/
async function steerTurn(request, sender) {
	const turn = controllers.get(request.streamId);
	if (!turn?.attempt || turn.controller.signal.aborted) return { outcome: "not-running" };
	const input = steerInput(request);
	const attempt = turn.attempt;
	if (attempt.steer && !attempt.replacement) {
		const outcome = await attempt.steer(input);
		if (outcome === "accepted") {
			sendSteerPart(sender, request.streamId, steerPart(request));
			return { outcome: "steered" };
		}
		if (outcome === "stale") return { outcome: "not-running" };
		if (turn.attempt !== attempt || turn.controller.signal.aborted) return steerTurn(request, sender);
	}
	attempt.replacement = attempt.replacement ? {
		input: mergeTurnInputs(attempt.replacement.input, input),
		parts: [...attempt.replacement.parts, steerPart(request)]
	} : {
		input,
		parts: [steerPart(request)]
	};
	attempt.controller.abort();
	return { outcome: "restarted" };
}
async function runTurn(request, sender) {
	const controller = new AbortController();
	const active = {
		controller,
		projectId: request.projectId,
		chatTabId: request.chatTabId,
		...request.policy ? { policy: request.policy } : {}
	};
	controllers.set(request.streamId, active);
	const previousTurn = tabTurns.get(request.chatTabId);
	let settleTurn;
	const settled = new Promise((resolve) => {
		settleTurn = resolve;
	});
	tabTurns.set(request.chatTabId, settled);
	const activityKey = `chat:${request.streamId}`;
	setProjectActivity(request.projectId, activityKey, true);
	let failed = false;
	let attemptStarted = false;
	const submittedInput = steerInput({
		prompt: request.prompt,
		hostContext: request.hostContext
	});
	const send = (event) => {
		if (!sender.isDestroyed()) sender.send(AGENT_CHAT_STREAM_CHANNEL, event);
	};
	const preview = createCanvasDrawPreview(request.projectId, request.chatTabId);
	const onChunk = (chunk) => preview.onChunk(chunk);
	const workTargets = [];
	const onToolResult = (event) => {
		if (event.projectId !== request.projectId || event.chatTabId !== request.chatTabId || event.streamId !== request.streamId || !event.workTarget) return;
		workTargets.push(event.workTarget);
		send({
			streamId: request.streamId,
			chunk: {
				type: "message-metadata",
				messageMetadata: { workTargets: [...workTargets] }
			}
		});
	};
	mcpEvents.on("tool_result", onToolResult);
	try {
		await previousTurn;
		const handle = await getMcpHandle();
		if (controller.signal.aborted) return;
		const mcp = {
			name: MCP_SERVER_NAME,
			url: mcpUrl(handle.baseUrl, {
				projectId: request.projectId,
				chatTabId: request.chatTabId,
				streamId: request.streamId
			})
		};
		const stored = sessions$1.get(request.chatTabId);
		const storedSessionId = stored?.agentId === request.agentId ? stored.sessionId : void 0;
		let sessionId = request.sessionId ?? storedSessionId;
		const cwd = await projectWorkspace(request.projectId);
		if (controller.signal.aborted) {
			workspaces.delete(request.projectId);
			return;
		}
		const additionalDirectories = userAllowedFolders(request);
		const added = Boolean(stored && stored.agentId === request.agentId) ? addedDirectories(stored?.additionalDirectories ?? [], additionalDirectories) : [];
		const rememberSession = (id) => {
			rememberAgentChatSession(request.chatTabId, {
				projectId: request.projectId,
				agentId: request.agentId,
				cwd,
				...id ? { sessionId: id } : {},
				additionalDirectories
			});
		};
		rememberSession(sessionId);
		const next = steerInput({
			prompt: request.prompt,
			hostContext: {
				...request.hostContext ?? {},
				...added.length ? { addedDirectories: added } : {}
			}
		});
		const stopped = stoppedInputs.get(request.chatTabId);
		stoppedInputs.delete(request.chatTabId);
		let input = stopped?.agentId === request.agentId ? mergeTurnInputs(stopped.input, next) : next;
		const sessionKeepsCancelledRun = () => Boolean(sessionId) && !agentRuntime.dropsCancelledTurns(request.agentId);
		let result;
		let lastAttempt;
		while (input) {
			const sendStart = !lastAttempt;
			attemptStarted = true;
			const attempt = {
				controller: new AbortController(),
				input
			};
			const signal = AbortSignal.any([controller.signal, attempt.controller.signal]);
			active.attempt = attempt;
			lastAttempt = attempt;
			const { prompt, promptPrefix, images } = input;
			input = null;
			try {
				const attemptResult = await agentRuntime.streamTurn({
					agentId: request.agentId,
					session: {
						cwd,
						...additionalDirectories.length ? { additionalDirectories } : {},
						mcp,
						appendedSystemPrompt: buildAppendedSystemPrompt({
							cwd,
							...additionalDirectories.length ? { additionalDirectories } : {},
							...request.iconLibraryNames?.length ? { iconLibraryNames: request.iconLibraryNames } : {}
						}),
						...sessionId ? { sessionId } : {}
					},
					turn: {
						prompt,
						...promptPrefix ? { promptPrefix } : {},
						...request.modelId ? { modelId: request.modelId } : {},
						...request.effort ? { effort: request.effort } : {},
						...request.fast ? { fast: true } : {},
						...request.policy ? { policy: request.policy } : {},
						...images?.length ? { images } : {},
						requestApproval: async (approval) => {
							return (await requestToolApproval(request.projectId, approval.toolName, approval.args, {
								origin: "cli",
								chatTabId: request.chatTabId,
								signal
							})).approved;
						},
						abortSignal: signal,
						stopSignal: controller.signal,
						onSessionId: (id) => {
							sessionId = id;
							rememberSession(id);
							send({
								streamId: request.streamId,
								sessionId: id
							});
						},
						onSteerReady: (steer) => {
							attempt.steer = steer;
						}
					}
				});
				await pipeToRenderer(attemptResult, request.streamId, sender, attempt, sendStart, controller.signal, onChunk);
				result = attemptResult;
			} catch (err) {
				if (!attempt.replacement || controller.signal.aborted) throw err;
			}
			const replacement = controller.signal.aborted ? void 0 : attempt.replacement;
			if (replacement) {
				preview.drop();
				for (const part of replacement.parts) sendSteerPart(sender, request.streamId, part);
				input = sessionKeepsCancelledRun() ? replacement.input : mergeTurnInputs(attempt.input, replacement.input);
			}
		}
		active.attempt = void 0;
		if (active.stopped && lastAttempt?.cancelled && !sessionKeepsCancelledRun()) stoppedInputs.set(request.chatTabId, {
			agentId: request.agentId,
			input: lastAttempt.input
		});
		if (controller.signal.aborted || !result) return;
		const nextSessionId = agentRuntime.readSessionId(request.agentId, await result.finalStep);
		if (nextSessionId) rememberSession(nextSessionId);
		send({
			streamId: request.streamId,
			done: true,
			...nextSessionId ? { sessionId: nextSessionId } : {}
		});
	} catch (err) {
		if (controller.signal.aborted) send({
			streamId: request.streamId,
			done: true
		});
		else {
			failed = true;
			send({
				streamId: request.streamId,
				done: true,
				error: err instanceof Error ? err.message : String(err)
			});
		}
	} finally {
		mcpEvents.off("tool_result", onToolResult);
		if (active.stopped && !attemptStarted) {
			const previous = stoppedInputs.get(request.chatTabId);
			stoppedInputs.set(request.chatTabId, {
				agentId: request.agentId,
				input: previous?.agentId === request.agentId ? mergeTurnInputs(previous.input, submittedInput) : submittedInput
			});
		}
		active.attempt = void 0;
		preview.drop();
		controllers.delete(request.streamId);
		if (tabTurns.get(request.chatTabId) === settled) tabTurns.delete(request.chatTabId);
		settleTurn();
		setProjectActivity(request.projectId, activityKey, false, !controller.signal.aborted && !failed);
	}
}
/** Register the agents-v2 IPC listeners. Call once, after app ready. */
function setupAgentChat() {
	ensureCanvasResultHandler();
	electron.ipcMain.on(AGENT_CHAT_START_CHANNEL, (event, request) => {
		runTurn(request, event.sender);
	});
	electron.ipcMain.on(AGENT_CHAT_ABORT_CHANNEL, (_event, request) => {
		const turn = controllers.get(request.streamId);
		if (!turn) return;
		turn.stopped = true;
		turn.controller.abort();
	});
	electron.ipcMain.handle(AGENT_CHAT_STEER_CHANNEL, (event, request) => steerTurn(request, event.sender));
	electron.ipcMain.on(AGENT_CHAT_DROP_TAB_CHANNEL, (_event, request) => {
		dropAgentChatTab(request.projectId, request.chatTabId);
	});
	electron.ipcMain.handle(AGENT_CHAT_LIST_AGENTS_CHANNEL, () => listAgents());
	electron.ipcMain.handle(AGENT_CHAT_LIST_MODELS_CHANNEL, (_event, request) => agentRuntime.listModels(request.agentId));
	electron.ipcMain.handle(AGENT_CHAT_GENERATE_TITLE_CHANNEL, async (_event, request) => {
		if (typeof request?.sessionId !== "string" || !request.sessionId.trim()) throw new Error("Invalid title input");
		const cwd = request.projectId ? await projectWorkspace(request.projectId) : request.cwd?.trim();
		return agentRuntime.generateTitle(request.agentId, {
			sessionId: request.sessionId,
			...cwd ? { cwd } : {},
			...request.prompt?.trim() ? { prompt: request.prompt.trim() } : {}
		});
	});
	electron.ipcMain.handle(AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL, async (_event, request) => {
		const cwd = request.projectId ? await projectWorkspace(request.projectId) : request.cwd;
		return agentRuntime.listSlashCommands(request.agentId, cwd);
	});
	electron.ipcMain.handle(AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL, async (_event, request) => {
		const cwd = request.projectId ? await projectWorkspace(request.projectId) : void 0;
		const list = await agentRuntime.listMcpServers(request.agentId, cwd);
		return {
			...list,
			servers: list.servers.filter((server) => server.name !== MCP_SERVER_NAME)
		};
	});
	electron.ipcMain.handle(AGENT_CHAT_CHECK_STATUS_CHANNEL, (_event, request) => agentRuntime.checkStatus(request.agentId));
	electron.ipcMain.handle(AGENT_CHAT_LOGIN_CHANNEL, (_event, request) => {
		if (!request || typeof request !== "object" || typeof request.agentId !== "string" || !request.agentId.trim()) throw new Error("Invalid login input");
		return agentRuntime.login(request.agentId);
	});
	electron.ipcMain.handle(AGENT_CHAT_LOGOUT_CHANNEL, (_event, request) => agentRuntime.logout(request.agentId));
}
/** Eagerly start the MCP server so the first turn is not delayed. */
async function startAgentChat() {
	await getMcpHandle();
}
/**
* Drop per-tab runtime state when a chat is archived or closed: the resume
* token and the MCP reader state (covering reads).
*/
function dropAgentChatTab(_projectId, chatTabId) {
	sessions$1.delete(chatTabId);
	stoppedInputs.delete(chatTabId);
	dropInAppMcpTab(chatTabId);
}
function disposeAgentChatProject(projectId) {
	for (const turn of controllers.values()) if (turn.projectId === projectId) turn.controller.abort();
	workspaces.delete(projectId);
	for (const [chatTabId, session] of [...sessions$1]) if (session.projectId === projectId) dropAgentChatTab(projectId, chatTabId);
}
/** Recopy skills into live workspaces after the renderer syncs overrides. */
function syncAgentWorkspaceSkillOverrides() {
	rematerializeAgentWorkspaces(resolveSkillsRoot(), getActiveSkillOverrides());
}
/** Abort in-flight turns and close provider/MCP processes on quit. */
async function stopAgentChat() {
	for (const turn of controllers.values()) turn.controller.abort();
	controllers.clear();
	sessions$1.clear();
	await agentRuntime.close();
	await mcpHandle?.close().catch(() => {});
	mcpHandle = null;
	mcpStarting = null;
	workspaces.clear();
}

export { disposeAgentChatProject, getAgentMcpInfo, projectWorkspace, setupAgentChat, startAgentChat, stopAgentChat, syncAgentWorkspaceSkillOverrides };
