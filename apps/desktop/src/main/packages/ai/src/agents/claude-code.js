// Reconstructed from index.js — original module: packages/ai/src/agents/claude-code.ts
import { crypto$1, node_child_process, node_fs_promises, node_path, node_util } from "../../../../__bundle__/_preamble.js";
import { SLASH_COMMAND_RE, joinPromptSegments, userTurnPrompt } from "../prompts/turnPrompt.js";
import { streamText } from "../../../../vendor/ai.js";
import { getAgentEnv, sanitizeShellOutput } from "./shared/shell-env.js";
import { cliLauncher, findDeviceBinary, isOlderThan } from "./shared/cli-binary.js";
import { petalSkillNames, tagPetalSkills } from "./shared/petal-skills.js";
import { TITLE_TIMEOUT_MS, sanitizeTitle } from "./shared/types.js";

/**
* Claude Code driver. Node-only.
*
* The provider package is ESM-only, so it is loaded with a dynamic `import()`;
* Electron main (CJS output) can await that. Every turn, model list and status
* check runs the `claude` installed on the user's device, never the native
* binary the Agent SDK ships: a packaged app cannot resolve that one, so using
* it here would run a different CLI than users get.
*
* The chat wire is agent-agnostic (one opaque `sessionId`); this module maps
* that onto Claude's `resume`, the MCP HTTP server, and the shell environment,
* and reads the session id back out of the step.
*
* This module also owns Claude's throwaway cwd files: `.claude/skills` points
* at the Petal skills seeded into `<cwd>/.agents/skills`.
*/
var execFileAsync$4 = (0, node_util.promisify)(node_child_process.execFile);
/**
* Credentials the CLI accepts from the environment ahead of its own stored
* sign-in. Petal never sets them: they come from the user's shell, so they
* win here the same way they would in a terminal.
*/
var CREDENTIAL_ENV_VARS = [
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_AUTH_TOKEN",
	"CLAUDE_CODE_OAUTH_TOKEN"
];
var PROBE_TIMEOUT_MS$1 = 5e3;
var QUERY_TIMEOUT_MS = 15e3;
/** Signs the CLI in. The setup dialog runs it in the embedded terminal. */
var LOGIN_COMMAND = "claude auth login";
/**
* Every settings layer the CLI reads when run by hand in the cwd: the user's
* own (settings, plugins, skills, MCP servers), the workspace's seeded skills,
* and local overrides. Turns and the lists the composer shows use the same
* layers, so a listed command or MCP server is one the turn actually has.
*/
var SETTING_SOURCES = [
	"user",
	"project",
	"local"
];
/**
* The CLI connects MCP servers in the background and reports no "done": config
* servers show up at once as `pending`, claude.ai connectors arrive after a
* network fetch (~0.4–0.5s after the CLI first answers, measured on CLI
* 0.3.283). The list counts as settled once nothing is pending and no new name
* has appeared for `MCP_SETTLE_MS` since the first answer, or at
* `MCP_LIST_TIMEOUT_MS` regardless. A shorter window raced the connector fetch
* and listed none.
*/
var MCP_POLL_MS$1 = 150;
var MCP_SETTLE_MS = 1500;
var MCP_LIST_TIMEOUT_MS$1 = 4e3;
/** Brings a `claude` on PATH up to date, whichever way it was installed. */
var UPDATE_COMMAND = "claude update";
/**
* Oldest Claude Code this driver runs on, found by running full SDK turns (model
* list, a Petal MCP tool call, a tool approved through `canUseTool`) against
* each release. 2.1.70 and older reject `--permission-mode auto`; 2.1.80–2.1.104
* leave MCP tools out of a headless first turn, so the canvas tools never reach
* the model. Raise it when an SDK bump or a new option needs a newer CLI.
*/
var MIN_CLAUDE_VERSION = "2.1.105";
/**
* Documented aliases used only when the live list cannot be read. Opus stands
* in for the account default, which only the live list can name.
*/
var FALLBACK_MODELS = [
	{
		id: "fable",
		label: "Fable",
		rank: 0
	},
	{
		id: "opus",
		label: "Opus",
		isDefault: true,
		rank: 1
	},
	{
		id: "sonnet",
		label: "Sonnet",
		rank: 2
	},
	{
		id: "haiku",
		label: "Haiku",
		rank: 3
	}
];
/** Model lines from most to least capable; `rank` is the index. */
var MODEL_LINES$1 = [
	"fable",
	"opus",
	"sonnet",
	"haiku"
];
function modelRank(model) {
	const name = `${model.resolvedModel ?? ""} ${model.value} ${model.displayName}`.toLowerCase();
	const rank = MODEL_LINES$1.findIndex((line) => name.includes(line));
	return rank === -1 ? void 0 : rank;
}
/** Claude Code only expands `/skill` when it starts the prompt. */
function composePrompt$3(turn) {
	const { prompt, promptPrefix } = turn;
	if (SLASH_COMMAND_RE.test(prompt)) return joinPromptSegments(prompt, promptPrefix);
	return joinPromptSegments(promptPrefix, prompt);
}
/** The first credential variable set in the shell env; the CLI prefers it over its own sign-in. */
function claudeCredentialVar(env) {
	return CREDENTIAL_ENV_VARS.find((name) => (env[name] ?? "").trim() !== "");
}
/**
* The user's environment (`getAgentEnv`), with `CLAUDECODE` unset so a CLI
* launched from inside Claude Code is not nested. The CLI reads the sign-in
* that `claude auth login` stored (`~/.claude`, Keychain on macOS) and applies
* its own precedence over any credential variable the user exported.
*/
async function claudeEnv() {
	return {
		...await getAgentEnv(),
		CLAUDECODE: void 0
	};
}
async function streamTurn$3(session, turn) {
	const env = await claudeEnv();
	if (!claudeCredentialVar(env) && !await claudeCliSignedIn()) throw new Error("Claude Code is not signed in. Run `claude auth login` in a terminal, then try again.");
	const { createClaudeCode } = await Promise.resolve().then(() => require("./dist-CD1y1Ksz.js"));
	const pathToClaudeCodeExecutable = await findClaudeCodeExecutable();
	const permissionMode = turn.policy === "ask" ? "default" : "auto";
	const runningTools = /* @__PURE__ */ new Set();
	const provider = createClaudeCode({ defaultSettings: {
		cwd: session.cwd,
		permissionMode,
		settingSources: SETTING_SOURCES,
		disallowedTools: ["AskUserQuestion"],
		...session.mcp ? { sdkOptions: { allowedTools: [`mcp__${session.mcp.name}__*`] } } : {},
		...turn.requestApproval ? { canUseTool: async (toolName, input) => {
			if (await turn.requestApproval({
				toolName,
				args: input
			})) return {
				behavior: "allow",
				updatedInput: input
			};
			return {
				behavior: "deny",
				message: "The user declined this tool call."
			};
		} } : {},
		...pathToClaudeCodeExecutable ? { pathToClaudeCodeExecutable } : {},
		...turn.effort ? { effort: turn.effort } : {},
		...turn.fast ? { settings: { fastMode: true } } : {},
		...session.appendedSystemPrompt ? { systemPrompt: {
			type: "preset",
			preset: "claude_code",
			append: session.appendedSystemPrompt
		} } : {},
		...session.mcp ? { mcpServers: { [session.mcp.name]: {
			type: "http",
			url: session.mcp.url
		} } } : {},
		...session.additionalDirectories ? { additionalDirectories: session.additionalDirectories } : {},
		env: {
			...env,
			...session.env
		},
		streamingInput: "always",
		onStreamStart: (injector) => turn.onSteerReady?.(steerVia$1(injector, runningTools))
	} });
	const sessionId = session.sessionId ?? (0, crypto$1.randomUUID)();
	let sessionPublished = Boolean(session.sessionId);
	if (sessionPublished) turn.onSessionId?.(sessionId);
	return streamText({
		model: provider(turn.modelId ?? "default", { ...session.sessionId ? { resume: sessionId } : { sessionId } }),
		prompt: userTurnPrompt(composePrompt$3(turn), turn.images),
		abortSignal: turn.abortSignal,
		onChunk: ({ chunk }) => {
			if (!sessionPublished) {
				sessionPublished = true;
				turn.onSessionId?.(sessionId);
			}
			if (chunk.type === "tool-call") runningTools.add(chunk.toolCallId);
			else if (chunk.type === "tool-result" || chunk.type === "tool-error") runningTools.delete(chunk.toolCallId);
		}
	});
}
/**
* Claude Code folds a message written to its input into the running turn only
* when it next calls the model after a tool result. Sent while the model is
* writing its final answer, the message waits for the turn to end and then runs
* as a turn of its own, after the provider has stopped reading, so its reply
* never reaches the chat. Inject only while a tool is running; otherwise the
* host interrupts and restarts the turn. The injector carries text only.
*/
function steerVia$1(injector, runningTools) {
	return (input) => {
		if (input.images?.length || runningTools.size === 0) return Promise.resolve("unsupported");
		return new Promise((resolve) => {
			injector.inject(composePrompt$3(input), (delivered) => resolve(delivered ? "accepted" : "stale"));
		});
	};
}
/** Resolved live lists only. An in-flight query or the fallback aliases are not cached. */
var modelList = null;
async function listModels$3() {
	const env = await claudeEnv();
	const pathToClaudeCodeExecutable = await findClaudeCodeExecutable();
	const key = listCacheKey(pathToClaudeCodeExecutable, env);
	if (modelList?.key === key) return modelList.models;
	const models = await withClaudeQuery({
		env,
		pathToClaudeCodeExecutable,
		settingSources: []
	}, async (handle) => {
		const listed = await handle.supportedModels();
		return listed.length ? toModelInfos(listed) : FALLBACK_MODELS;
	}).catch((error) => {
		console.warn("[claude-code] live model list failed; using documented aliases", error instanceof Error ? error.message : error);
		return FALLBACK_MODELS;
	});
	if (models.length > 0 && models !== FALLBACK_MODELS) modelList = {
		key,
		models
	};
	return models;
}
/** Asked fresh every time; the composer shows its last list while this runs. */
async function listSlashCommands$3(cwd) {
	try {
		return await withClaudeQuery({
			env: await claudeEnv(),
			pathToClaudeCodeExecutable: await findClaudeCodeExecutable(),
			cwd,
			settingSources: SETTING_SOURCES
		}, async (handle) => {
			const [commands, petalSkills] = await Promise.all([handle.supportedCommands(), petalSkillNames(cwd)]);
			return tagPetalSkills(toSlashCommands$1(commands), petalSkills);
		});
	} catch (error) {
		console.warn("[claude-code] live slash-command list failed", error instanceof Error ? error.message : error);
		return [];
	}
}
async function listMcpServers$3(cwd) {
	try {
		const env = await claudeEnv();
		const pathToClaudeCodeExecutable = await findClaudeCodeExecutable();
		if (!pathToClaudeCodeExecutable) return {
			servers: [],
			unavailable: {
				message: "Install Claude Code to see your connections here.",
				installCommand: nativeClaudeInstallCommand()
			}
		};
		return { servers: toMcpServers(await withClaudeQuery({
			env,
			pathToClaudeCodeExecutable,
			cwd,
			settingSources: SETTING_SOURCES
		}, (handle) => settledMcpServerStatus(() => handle.mcpServerStatus()))) };
	} catch (error) {
		console.warn("[claude-code] live MCP server list failed", error instanceof Error ? error.message : error);
		return { servers: [] };
	}
}
/** Poll the CLI's MCP status until the list settles; see `MCP_SETTLE_MS`. */
async function settledMcpServerStatus(read) {
	const deadline = Date.now() + MCP_LIST_TIMEOUT_MS$1;
	let names = "";
	let changedAt;
	for (;;) {
		const statuses = await read();
		const next = statuses.map((server) => server.name).sort().join("\0");
		if (changedAt === void 0 || next !== names) {
			names = next;
			changedAt = Date.now();
		}
		if (!statuses.some((server) => server.status === "pending") && Date.now() - changedAt >= MCP_SETTLE_MS || Date.now() >= deadline) return statuses;
		await new Promise((resolve) => setTimeout(resolve, MCP_POLL_MS$1));
	}
}
function toMcpServers(statuses) {
	return statuses.filter((server) => server.status !== "disabled").map((server) => {
		const title = server.serverInfo?.title;
		return {
			name: server.name,
			...typeof title === "string" && title.trim() ? { displayName: title.trim() } : {}
		};
	});
}
async function generateTitle$3(input) {
	const { getSessionInfo } = await Promise.resolve().then(() => require("./sdk-DoGtLX-P.js"));
	const deadline = Date.now() + TITLE_TIMEOUT_MS;
	for (;;) {
		const title = claudeSessionTitle(await getSessionInfo(input.sessionId, input.cwd ? { dir: input.cwd } : void 0));
		if (title) return title;
		if (Date.now() >= deadline) throw new Error("Empty chat title");
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
}
function readSessionId$3(step) {
	return step.providerMetadata?.["claude-code"]?.sessionId;
}
/** Claude Code files for the throwaway project cwd: `.claude/skills` → `.agents/skills`. */
async function writeProjectConfig$2(dest) {
	const claudeDir = (0, node_path.join)(dest, ".claude");
	await (0, node_fs_promises.mkdir)(claudeDir, { recursive: true });
	await linkClaudeSkills((0, node_path.join)(dest, ".agents", "skills"), (0, node_path.join)(claudeDir, "skills"));
}
var claudeCode = {
	id: "claude-code",
	label: "Claude Code",
	mcpCommand: "claude /mcp",
	streamTurn: streamTurn$3,
	listModels: listModels$3,
	listSlashCommands: listSlashCommands$3,
	listMcpServers: listMcpServers$3,
	checkStatus: checkStatus$3,
	generateTitle: generateTitle$3,
	readSessionId: readSessionId$3,
	writeProjectConfig: writeProjectConfig$2
};
/** A user rename, or an auto-summary that is not just the first prompt. */
function claudeSessionTitle(info) {
	if (!info) return void 0;
	const custom = sanitizeTitle(info.customTitle ?? "");
	if (custom) return custom;
	const summary = sanitizeTitle(info.summary ?? "");
	const first = sanitizeTitle(info.firstPrompt ?? "");
	return summary && summary !== first ? summary : void 0;
}
/**
* Setup status for the empty-state gate.
*
* The product binary is the `claude` installed on the device (cli-binary.ts).
* Credentials without a binary are not "ready":
* every turn would throw. Signed in means a credential variable in the shell
* env (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`),
* which the CLI prefers, or the sign-in `claude auth login` stored. Signing in
* happens in the dialog's embedded terminal, not in the app, so a CLI sign-in
* is never `signedInVia: 'app'` and the dialog offers no in-app sign-out.
*/
async function checkStatus$3() {
	const env = await claudeEnv();
	const bin = await findClaudeCodeExecutable(true);
	const setup = {
		installCommand: nativeClaudeInstallCommand(),
		loginCommand: LOGIN_COMMAND
	};
	if (!bin) return {
		installed: false,
		loggedIn: false,
		...setup
	};
	const envVar = claudeCredentialVar(env);
	const [version, stored] = await Promise.all([readClaudeVersion(bin, env), envVar ? null : readClaudeAuthStatus(bin, env)]);
	if (isOlderThan(version, MIN_CLAUDE_VERSION)) return {
		installed: false,
		loggedIn: false,
		version,
		requiredVersion: MIN_CLAUDE_VERSION,
		installCommand: UPDATE_COMMAND,
		loginCommand: LOGIN_COMMAND
	};
	if (!envVar && stored?.loggedIn !== true) return {
		installed: true,
		loggedIn: false,
		...setup
	};
	return {
		installed: true,
		loggedIn: true,
		version,
		...envVar ? {
			signedInVia: "env",
			envVar
		} : {
			signedInVia: "cli",
			...stored?.account ? { account: stored.account } : {}
		},
		...setup
	};
}
function nativeClaudeInstallCommand() {
	return process.platform === "win32" ? "curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd" : "curl -fsSL https://claude.ai/install.sh | bash";
}
/**
* The `claude` installed on the device. The Agent SDK's own native binary is
* never used, in any mode: a packaged app cannot resolve it, so running it in an
* unpackaged run would exercise a CLI users never get.
*
* Status checks re-resolve it; turns reuse the last path found while it still
* exists (`findDeviceBinary`), so a CLI installed while the app runs is picked
* up without a restart.
*
* A Windows npm shim is resolved to the program it launches here, because the
* SDK spawns this path directly and cannot carry a `.cmd` or `.bat`. A shim
* that launches a JS entry point yields that script, which the SDK runs with
* Node; returning the `node` launcher instead would make every probe and turn
* run Node itself.
*/
async function findClaudeCodeExecutable(forceRefresh = false) {
	const device = await findDeviceBinary("claude", forceRefresh);
	if (!device) return void 0;
	const { cmd, args } = await cliLauncher(device).catch(() => ({
		cmd: device,
		args: []
	}));
	return args[0] ?? cmd;
}
/** Runs the CLI at `bin`, which may be a JS entry point that needs a Node. */
async function execClaude(bin, args, env) {
	const launcher = await cliLauncher(bin);
	return execFileAsync$4(launcher.cmd, [...launcher.args, ...args], {
		timeout: PROBE_TIMEOUT_MS$1,
		windowsHide: true,
		env
	});
}
async function readClaudeVersion(bin, env) {
	try {
		const { stdout } = await execClaude(bin, ["--version"], env);
		const clean = sanitizeShellOutput(stdout);
		return clean.match(/\d+\.\d+\.\d+/)?.[0] || clean || void 0;
	} catch {
		return;
	}
}
/**
* The CLI's own sign-in, as `claude auth status --json` describes it. The
* command prints its JSON and exits 1 when signed out, so the JSON found in the
* error's stdout is still the answer. Null when the CLI cannot be asked at all
* (older CLI, failed spawn), which reads as signed out.
*/
async function readClaudeAuthStatus(bin, env) {
	const stdout = await execClaude(bin, [
		"auth",
		"status",
		"--json"
	], env).then((result) => result.stdout, (error) => error.stdout);
	if (typeof stdout !== "string") return null;
	try {
		const parsed = JSON.parse(stdout);
		const account = typeof parsed.email === "string" && parsed.email ? parsed.email : void 0;
		return {
			loggedIn: parsed.loggedIn === true,
			...account ? { account } : {}
		};
	} catch {
		return null;
	}
}
/** Whether the CLI holds a sign-in of its own; false when it cannot be asked. */
async function claudeCliSignedIn() {
	return (await readClaudeAuthStatus(await findClaudeCodeExecutable() ?? "claude", await claudeEnv()))?.loggedIn === true;
}
/**
* The CLI lists the account default as a `default` alias row. The named row it
* resolves to takes its place as the default, so the picker shows a real model;
* the alias row stays only when no named row covers it.
*/
function toModelInfos(models) {
	const alias = models.find((model) => model.value === "default");
	const named = alias?.resolvedModel ? models.find((model) => model !== alias && model.resolvedModel === alias.resolvedModel) : void 0;
	const defaultModel = named ?? alias;
	return models.filter((model) => !named || model !== alias).map((model) => ({
		id: model.value,
		label: model.displayName || model.value,
		...model === defaultModel ? { isDefault: true } : {},
		...model.supportsFastMode ? { supportsFast: true } : {},
		...modelRank(model) !== void 0 ? { rank: modelRank(model) } : {},
		...model.supportsEffort && model.supportedEffortLevels?.length ? { efforts: model.supportedEffortLevels.map((value) => ({ value })) } : {}
	}));
}
function listCacheKey(pathToClaudeCodeExecutable, env) {
	const relevant = Object.entries(env).filter(([name]) => name.startsWith("CLAUDE_CODE_") || name.startsWith("ANTHROPIC_")).sort(([a], [b]) => a.localeCompare(b));
	return JSON.stringify([pathToClaudeCodeExecutable ?? "", relevant]);
}
/** The CLI marks its own commands `builtin`; the rest are skills and custom commands. */
function toSlashCommands$1(commands) {
	return commands.filter((command) => command.name).map((command) => ({
		name: command.name,
		description: (command.description ?? "").replace(/[*`_]+/g, "").replace(/\s+/g, " ").trim(),
		...command.builtin ? {} : { skill: true }
	}));
}
/** Never yields: keeps the CLI alive for the control protocol without a turn. */
async function* idlePrompt() {
	await new Promise(() => {});
}
async function withClaudeQuery(options, read) {
	const { query } = await Promise.resolve().then(() => require("./sdk-DoGtLX-P.js"));
	const abort = new AbortController();
	const timeout = setTimeout(() => abort.abort(), QUERY_TIMEOUT_MS);
	const handle = query({
		prompt: idlePrompt(),
		options: {
			abortController: abort,
			permissionMode: "default",
			settingSources: options.settingSources,
			...options.cwd ? { cwd: options.cwd } : {},
			...options.pathToClaudeCodeExecutable ? { pathToClaudeCodeExecutable: options.pathToClaudeCodeExecutable } : {},
			env: options.env
		}
	});
	try {
		return await read(handle);
	} finally {
		clearTimeout(timeout);
		handle.close();
	}
}
async function linkClaudeSkills(agentsSkills, claudeSkills) {
	try {
		await (0, node_fs_promises.symlink)("../.agents/skills", claudeSkills);
	} catch (error) {
		if (error.code === "EEXIST") {
			const stat = await (0, node_fs_promises.lstat)(claudeSkills).catch(() => null);
			if (stat && !stat.isSymbolicLink()) await (0, node_fs_promises.cp)(agentsSkills, claudeSkills, {
				recursive: true,
				force: true
			});
			return;
		}
		await (0, node_fs_promises.cp)(agentsSkills, claudeSkills, {
			recursive: true,
			force: true
		});
	}
}

export { claudeCode };
