// Reconstructed from index.js — original module: packages/ai/src/agents/runtime.ts
import { node_child_process, node_util, require_dist$2 } from "../../../../__bundle__/_preamble.js";
import { formatInlineSkillsBlock, inlineSlashNames, joinPromptSegments } from "../prompts/turnPrompt.js";
import { toUIMessageStream } from "../../../../vendor/ai.js";
import { writeSystemSkills } from "../skills.js";
import { claudeCode } from "./claude-code.js";
import { codex } from "./codex.js";
import { cursor } from "./cursor.js";
import { opencode } from "./opencode.js";

/**
* Unified agent runtime for the agents-v2 chat.
*
* The chat wire only names an `agentId`; this registry looks the driver up and
* delegates. Everything that differs between Claude Code, Codex, OpenCode and
* Cursor — provider selection, the persistent Codex app-server, the OpenCode v2
* service client, the in-process Cursor SDK, shell-environment resolution,
* permission mapping and resume-token reading — lives in the driver.
*
* The renderer and the chat wire only ever see `AgentInfo` / `AgentModelInfo`.
*/
var execFileAsync$2 = (0, node_util.promisify)(node_child_process.execFile);
/** A cold CLI or host often returns [] once, then the real catalog. */
var MODEL_LIST_RETRY_MS = 200;
var MODEL_LIST_RETRY_DEADLINE_MS = 1e3;
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function listModelsUntilReady(agent) {
	const deadline = Date.now() + MODEL_LIST_RETRY_DEADLINE_MS;
	for (;;) {
		const models = await agent.listModels();
		if (models.length > 0 || Date.now() >= deadline) return models;
		await sleep(MODEL_LIST_RETRY_MS);
	}
}
var AGENTS = {
	"claude-code": claudeCode,
	codex,
	cursor,
	opencode
};
/**
* UI message chunks for one agent turn.
*
* Converts with this package's `ai`, the same install that produced the stream.
* `generateId` stamps the response message the renderer adopts. Pass
* `sendStart: false` when a restarted attempt continues that message. The
* default `onError` replaces every error with "An error occurred.", which hides
* the CLI's own reason (credit, auth, rate limit) from the chat's error card.
*/
function toAgentUIMessageStream(result, options) {
	return toUIMessageStream({
		stream: result.stream,
		generateMessageId: require_dist$2.generateId,
		sendStart: options.sendStart,
		onError: (error) => error instanceof Error ? error.message : String(error)
	});
}
function listAgents() {
	return Object.values(AGENTS).map(({ id, label, mcpCommand }) => ({
		id,
		label,
		mcpCommand
	}));
}
/** Write shared skills, each agent's project config, and a git repo into `dest`. */
async function materializeAgentWorkspace(options) {
	const { dest, skillsRoot, skillOverrides } = options;
	await writeSystemSkills(dest, {
		skillsRoot,
		skillOverrides
	});
	for (const agent of Object.values(AGENTS)) await agent.writeProjectConfig?.(dest);
	await execFileAsync$2("git", [
		"-c",
		"init.defaultBranch=main",
		"init"
	], { cwd: dest }).catch(() => {});
}
/**
* Spell out skills the user named after the start of the message. Every agent
* dispatches a `/name` only when it leads the prompt, so a mid-message one
* would reach the model as plain text. Only names the agent reports as skills
* count: a built-in such as `/compact` cannot be loaded, so it stays plain text.
* The list is read only when the message has a candidate, so ordinary turns
* and leading commands reach the driver unchanged.
*/
async function withInlineSkills(agent, session, turn) {
	const named = inlineSlashNames(turn.prompt);
	if (named.length === 0) return turn;
	const commands = await agent.listSlashCommands(session.cwd).catch(() => []);
	const skills = new Set(commands.flatMap((command) => command.skill ? [command.name] : []));
	const block = formatInlineSkillsBlock(named.filter((name) => skills.has(name)));
	return block ? {
		...turn,
		promptPrefix: joinPromptSegments(turn.promptPrefix, block)
	} : turn;
}
function isAgentProviderId(agentId) {
	return agentId in AGENTS;
}
/**
* The runtime is a lookup over `Agent` objects. Pass the enabled agent ids;
* every call resolves through that table. `deps` carries host-resolved
* binaries; each driver lazily prepares its own env before its first turn.
*/
function createAgentRuntime(agentIds, deps = {}) {
	for (const agentId of agentIds) if (!isAgentProviderId(agentId)) throw new Error(`Unknown agent: ${agentId}`);
	const allowed = new Set(agentIds);
	const inflight = /* @__PURE__ */ new Map();
	const shared = (key, ask) => {
		const running = inflight.get(key);
		if (running) return running;
		const value = ask().finally(() => inflight.delete(key));
		inflight.set(key, value);
		return value;
	};
	const get = (id) => {
		if (!isAgentProviderId(id) || !allowed.has(id)) throw new Error(`Unknown agent: ${id}`);
		return AGENTS[id];
	};
	return {
		streamTurn({ agentId, session, turn }) {
			const agent = get(agentId);
			return (async () => {
				await agent.prepareEnv?.(deps);
				return agent.streamTurn(session, await withInlineSkills(agent, session, turn));
			})();
		},
		async listModels(agentId) {
			if (!isAgentProviderId(agentId) || !allowed.has(agentId)) return [];
			return listModelsUntilReady(AGENTS[agentId]);
		},
		async listSlashCommands(agentId, cwd) {
			if (!isAgentProviderId(agentId) || !allowed.has(agentId)) return [];
			return shared(JSON.stringify([
				"commands",
				agentId,
				cwd ?? ""
			]), () => AGENTS[agentId].listSlashCommands(cwd));
		},
		async listMcpServers(agentId, cwd) {
			if (!isAgentProviderId(agentId) || !allowed.has(agentId)) return { servers: [] };
			return shared(JSON.stringify([
				"mcp",
				agentId,
				cwd ?? ""
			]), () => AGENTS[agentId].listMcpServers(cwd));
		},
		async checkStatus(agentId) {
			if (!isAgentProviderId(agentId) || !allowed.has(agentId)) return {
				installed: false,
				loggedIn: false
			};
			return AGENTS[agentId].checkStatus();
		},
		async login(agentId) {
			const agent = get(agentId);
			if (!agent.login) throw new Error(`${agent.label} signs in from the terminal`);
			await agent.login();
		},
		async logout(agentId) {
			const agent = get(agentId);
			if (!agent.logout) throw new Error(`${agent.label} signs out from the terminal`);
			await agent.logout();
		},
		async generateTitle(agentId, input) {
			const agent = get(agentId);
			await agent.prepareEnv?.(deps);
			return agent.generateTitle(input);
		},
		readSessionId(agentId, step) {
			return isAgentProviderId(agentId) ? AGENTS[agentId].readSessionId(step) : void 0;
		},
		dropsCancelledTurns(agentId) {
			return isAgentProviderId(agentId) && AGENTS[agentId].dropsCancelledTurns === true;
		},
		async close() {
			await Promise.all([...allowed].map((id) => AGENTS[id].close?.()));
		}
	};
}

export { createAgentRuntime, listAgents, materializeAgentWorkspace, toAgentUIMessageStream };
