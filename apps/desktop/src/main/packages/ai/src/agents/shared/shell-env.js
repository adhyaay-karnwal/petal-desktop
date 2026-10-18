// Reconstructed from index.js — original module: packages/ai/src/agents/shared/shell-env.ts
import { child_process, util } from "../../../../../__bundle__/_preamble.js";

/**
* The user's login-shell environment, resolved once per process.
*
* CLI drivers run with the same endpoint and credentials as the user's terminal,
* which live in rc files a GUI-launched process never sources. This module is
* Node-only and imports nothing from the providers.
*/
var execFileAsync$6 = (0, util.promisify)(child_process.execFile);
/** Compile-time constant in Node; read through a function so tests can vary it. */
function isWindows$1() {
	return process.platform === "win32";
}
var resolvedShellEnv = null;
/** Strip OSC/ANSI control sequences that interactive shells (iTerm, Cursor) inject into stdout. */
function sanitizeShellOutput(raw) {
	return raw.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
}
var shellExecEnv = () => ({
	HOME: process.env.HOME,
	USER: process.env.USER,
	SHELL: process.env.SHELL || "/bin/zsh"
});
function parseEnvOutput(stdout) {
	const env = {};
	for (const line of sanitizeShellOutput(stdout).split("\n")) {
		const idx = line.indexOf("=");
		if (idx > 0) env[line.slice(0, idx)] = line.slice(idx + 1);
	}
	return env;
}
var probeLoginShell = async (args) => {
	const { stdout } = await execFileAsync$6(process.env.SHELL || "/bin/zsh", args, {
		timeout: 5e3,
		env: shellExecEnv()
	});
	return stdout;
};
/**
* Overlay the interactive login shell (`-ilc`) on the login shell (`-lc`).
*
* Users export provider configuration — `ANTHROPIC_BASE_URL`,
* `ANTHROPIC_AUTH_TOKEN` — in `~/.zshrc`, which a non-interactive `-lc` never
* sources. Without the overlay the CLI runs against the default endpoint and
* advertises a different model list than the user's terminal `/model`. A shell
* that rejects `-ilc` (or times out) still leaves the `-lc` result in place.
*/
async function overlayLoginShellEnv(probe = probeLoginShell) {
	const env = {};
	for (const args of [["-lc", "env"], ["-ilc", "env"]]) try {
		Object.assign(env, parseEnvOutput(await probe([...args])));
	} catch {}
	return env;
}
/**
* The user's shell environment, so a turn runs with the same endpoint and
* credentials as their terminal. Cached for the process lifetime.
*/
async function getShellEnv$1() {
	if (resolvedShellEnv) return resolvedShellEnv;
	if (isWindows$1()) {
		resolvedShellEnv = { ...process.env };
		return resolvedShellEnv;
	}
	const shellEnv = await overlayLoginShellEnv();
	resolvedShellEnv = Object.keys(shellEnv).length > 0 ? shellEnv : { ...process.env };
	return resolvedShellEnv;
}
async function getAgentEnv() {
	return agentEnvFrom(await getShellEnv$1(), process.env);
}
/** `getAgentEnv` for a given shell and app environment. */
function agentEnvFrom(shell, appEnv) {
	const env = {};
	for (const key of Object.keys(appEnv)) if (!(key in shell)) env[key] = void 0;
	return Object.assign(env, shell);
}

export { getAgentEnv, getShellEnv$1, sanitizeShellOutput };
