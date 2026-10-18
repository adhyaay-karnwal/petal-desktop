// Reconstructed from index.js — original module: packages/ai/src/agents/shared/auth-store.ts
import { node_crypto, node_fs_promises, node_os, node_path } from "../../../../../__bundle__/_preamble.js";

/**
* Petal's own agent sign-ins. Node-only.
*
* One file, `<user config dir>/Petal/auth.json` (mode 0600), holds every
* credential an in-app sign-in creates, keyed by agent id: currently only
* Cursor's minted API key. Each entry keeps the shape its driver needs; this
* module only reads, replaces and removes entries. Codex and Claude Code are
* not here: their sign-in is the CLI's own store (`~/.codex`, `~/.claude`),
* written by the CLI and shared with Petal.
*/
function userConfigDir() {
	if (process.platform === "darwin") return (0, node_path.join)((0, node_os.homedir)(), "Library", "Application Support");
	if (process.platform === "win32") return process.env.APPDATA || (0, node_path.join)((0, node_os.homedir)(), "AppData", "Roaming");
	return process.env.XDG_CONFIG_HOME || (0, node_path.join)((0, node_os.homedir)(), ".config");
}
function authFilePath() {
	return (0, node_path.join)(userConfigDir(), "Petal", "auth.json");
}
/** A missing or unreadable file is "no sign-ins", never an error. */
async function readAuthFile() {
	try {
		const parsed = JSON.parse(await (0, node_fs_promises.readFile)(authFilePath(), "utf8"));
		if (parsed?.version === 1 && parsed.agents && typeof parsed.agents === "object") return {
			version: 1,
			agents: parsed.agents
		};
	} catch {}
	return {
		version: 1,
		agents: {}
	};
}
/** Write through a fresh temp file so the result is always 0600 and never half-written. */
async function writeAuthFile(file) {
	const path = authFilePath();
	await (0, node_fs_promises.mkdir)((0, node_path.dirname)(path), {
		recursive: true,
		mode: 448
	});
	const temp = `${path}.${process.pid}.${(0, node_crypto.randomBytes)(4).toString("hex")}.tmp`;
	await (0, node_fs_promises.writeFile)(temp, JSON.stringify(file), { mode: 384 });
	await (0, node_fs_promises.rename)(temp, path);
}
var writes = Promise.resolve();
/** Read-modify-write, one at a time, so two agents' writes never drop each other. */
function update(change) {
	const next = writes.then(async () => {
		const file = await readAuthFile();
		change(file.agents);
		await writeAuthFile(file);
	});
	writes = next.catch(() => {});
	return next;
}
/** The agent's stored entry, unvalidated; the driver checks its own shape. */
async function readAgentAuth(agentId) {
	await writes;
	return (await readAuthFile()).agents[agentId];
}
function writeAgentAuth(agentId, entry) {
	return update((agents) => {
		agents[agentId] = entry;
	});
}
function clearAgentAuth(agentId) {
	return update((agents) => {
		delete agents[agentId];
	});
}

export { clearAgentAuth, readAgentAuth, writeAgentAuth };
