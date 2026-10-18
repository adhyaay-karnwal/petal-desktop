// Reconstructed from index.js — original module: app/src/main/claudeBinary.ts
import { child_process, fs, fs_promises, os, path, util } from "../../../__bundle__/_preamble.js";
import { import_semver } from "../../../vendor/uint8array-extras.js";

/**
* Locating and invoking the Claude Code CLI, across macOS, Linux and Windows.
*
* Kept free of Electron imports so it can be exercised directly in tests.
*/
var execFileAsync$8 = (0, util.promisify)(child_process.execFile);
/** Compile-time constant in Node; read through a function so tests can vary it. */
function isWindows$2() {
	return process.platform === "win32";
}
var resolvedClaudePath = null;
var claudePathResolved = false;
var resolvedShellEnv$1 = null;
/** Home directory. Windows exports USERPROFILE, not HOME. */
function userHome$1() {
	return process.env.HOME || process.env.USERPROFILE || (0, os.homedir)();
}
/** Strip OSC/ANSI control sequences that interactive shells (iTerm, Cursor) inject into stdout. */
function sanitizeShellOutput$1(raw) {
	return raw.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
}
var shellExecEnv$1 = () => ({
	HOME: process.env.HOME,
	USER: process.env.USER,
	SHELL: process.env.SHELL || "/bin/zsh"
});
function parseEnvOutput$1(stdout) {
	const env = {};
	for (const line of sanitizeShellOutput$1(stdout).split("\n")) {
		const idx = line.indexOf("=");
		if (idx > 0) env[line.slice(0, idx)] = line.slice(idx + 1);
	}
	return env;
}
async function runShellCommand(args) {
	const shell = process.env.SHELL || "/bin/zsh";
	try {
		const { stdout } = await execFileAsync$8(shell, args, {
			timeout: 5e3,
			env: shellExecEnv$1()
		});
		const line = sanitizeShellOutput$1(stdout).split("\n").find((l) => l.startsWith("/"));
		return line && !line.includes("not found") ? line : null;
	} catch {
		return null;
	}
}
async function isExecutable(path$42) {
	try {
		await (0, fs_promises.access)(path$42, fs.constants.X_OK);
		return (await (0, fs_promises.stat)(path$42)).isFile();
	} catch {
		return false;
	}
}
/** Extensions that make a file runnable. Windows needs one appended; POSIX doesn't. */
function executableExtensions() {
	if (!isWindows$2()) return [""];
	return (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean);
}
/** Resolve a bare command name against a PATH value, without spawning anything. */
async function findOnPath(name, pathValue) {
	if (!pathValue) return null;
	const extensions = executableExtensions();
	for (const entry of pathValue.split(isWindows$2() ? ";" : ":")) {
		const dir = entry.trim().replace(/^"|"$/g, "");
		if (!dir) continue;
		for (const ext of extensions) {
			const candidate = (0, path.join)(dir, name + ext);
			if (await isExecutable(candidate)) return candidate;
		}
	}
	return null;
}
/** Windows fallback: let the OS resolve it. Costs a subprocess, so it goes last. */
async function findClaudeViaWhere() {
	try {
		const { stdout } = await execFileAsync$8("where.exe", ["claude"], {
			timeout: 5e3,
			windowsHide: true
		});
		const hits = sanitizeShellOutput$1(stdout).split("\n").map((l) => l.trim()).filter((l) => /^[a-z]:\\/i.test(l));
		return hits.find((h) => h.toLowerCase().endsWith(".exe")) ?? hits[0] ?? null;
	} catch {
		return null;
	}
}
/** nvm keeps one bin dir per Node version; a global install lands in whichever was active. */
async function nvmClaudePaths(home) {
	const versionsDir = (0, path.join)(home, ".nvm", "versions", "node");
	try {
		return (await (0, fs_promises.readdir)(versionsDir)).sort().reverse().map((v) => (0, path.join)(versionsDir, v, "bin", "claude"));
	} catch {
		return [];
	}
}
/** Install locations to probe when PATH resolution comes up empty. */
async function knownInstallPaths(home) {
	if (isWindows$2()) {
		const appData = process.env.APPDATA || (0, path.join)(home, "AppData", "Roaming");
		const localAppData = process.env.LOCALAPPDATA || (0, path.join)(home, "AppData", "Local");
		return [
			(0, path.join)(home, ".local", "bin", "claude.exe"),
			(0, path.join)(localAppData, "Programs", "claude", "claude.exe"),
			(0, path.join)(appData, "npm", "claude.exe"),
			(0, path.join)(appData, "npm", "claude.cmd")
		];
	}
	return [
		(0, path.join)(home, ".local/bin/claude"),
		"/opt/homebrew/bin/claude",
		"/usr/local/bin/claude",
		(0, path.join)(home, ".bun/bin/claude"),
		(0, path.join)(home, ".volta/bin/claude"),
		...await nvmClaudePaths(home)
	];
}
async function getShellEnv$2() {
	if (resolvedShellEnv$1) return resolvedShellEnv$1;
	if (isWindows$2()) {
		resolvedShellEnv$1 = { ...process.env };
		return resolvedShellEnv$1;
	}
	const shell = process.env.SHELL || "/bin/zsh";
	for (const args of [["-lc", "env"], ["-ilc", "env"]]) try {
		const { stdout } = await execFileAsync$8(shell, args, {
			timeout: 5e3,
			env: shellExecEnv$1()
		});
		const env = parseEnvOutput$1(stdout);
		if (Object.keys(env).length > 0) {
			resolvedShellEnv$1 = env;
			return env;
		}
	} catch {}
	return { ...process.env };
}
/**
* Locate the Claude CLI.
*
* macOS launches GUI apps from launchd with a stripped PATH, so the user's login
* shell is the only place their real PATH lives — hence the shell probe, which
* stays first there. Windows and Linux hand Electron the full user PATH, so
* scanning it directly is both faster and more reliable than spawning anything;
* Windows has no POSIX shell to probe at all.
*/
async function findClaudeBinary(forceRefresh = false) {
	if (!forceRefresh && claudePathResolved) return resolvedClaudePath || "claude";
	const home = userHome$1();
	let found = isWindows$2() ? null : await runShellCommand(["-lc", "command -v claude"]) ?? await runShellCommand(["-ilc", "command -v claude"]);
	found ??= await findOnPath("claude", process.env.PATH);
	if (!found) {
		for (const candidate of await knownInstallPaths(home)) if (await isExecutable(candidate)) {
			found = candidate;
			break;
		}
	}
	if (!found && isWindows$2()) found = await findClaudeViaWhere();
	if (found) {
		resolvedClaudePath = found;
		console.log(`[AI Chat] Found claude CLI at: ${found}`);
	} else {
		resolvedClaudePath = null;
		console.log("[AI Chat] Could not find claude CLI via PATH or known install paths");
	}
	claudePathResolved = true;
	return resolvedClaudePath || "claude";
}
/**
* Windows refuses to spawn .cmd/.bat shims directly (Node's CVE-2024-27980 fix),
* and cmd.exe can't carry our arguments either: `/s` strips the quotes around a
* path under "Program Files", and a newline in the system prompt ends the command.
* So an npm or pnpm shim is resolved to the program it launches and spawned directly.
*/
async function claudeLauncher(bin) {
	if (!isWindows$2() || !/\.(cmd|bat)$/i.test(bin)) return {
		file: bin,
		args: []
	};
	const launcher = await resolveShim$1(bin);
	if (!launcher) throw new Error(`Could not find the program that ${bin} launches`);
	return launcher;
}
/** Reads the target out of the shim's last `%*` line, e.g. `"%dp0%\node_modules\…\claude.exe" %*`. */
async function resolveShim$1(shim) {
	let content;
	try {
		content = await (0, fs_promises.readFile)(shim, "utf8");
	} catch {
		return null;
	}
	const shimDir = (0, path.dirname)(shim);
	const target = [...(content.split(/\r?\n/).filter((line) => line.includes("%*")).pop() ?? "").matchAll(/"([^"]+)"/g)].map(([, quoted]) => quoted.replace(/^%(dp0%|~dp0)/i, shimDir)).filter((path$43) => path$43 !== "%_prog%" && !/(^|\\)node\.exe$/i.test(path$43)).map((path$44) => (0, path.normalize)(path$44.replace(/\\/g, path.sep))).pop();
	if (!target || !await isFile$1(target)) return null;
	if (/\.(exe|com)$/i.test(target)) return {
		file: target,
		args: []
	};
	const bundledNode = (0, path.join)(shimDir, "node.exe");
	const node = await isExecutable(bundledNode) ? bundledNode : await findOnPath("node", process.env.PATH);
	return node ? {
		file: node,
		args: [target]
	} : null;
}
async function isFile$1(path$45) {
	try {
		return (await (0, fs_promises.stat)(path$45)).isFile();
	} catch {
		return false;
	}
}
/**
* Oldest Claude Code the chat works on, found by running v1 chat turns (a canvas
* MCP tool call, an approval through `--permission-prompt-tool`) against each
* release. 2.1.71–2.1.78 check the prompt tool before connecting MCP and exit;
* 2.1.80–2.1.104 leave MCP tools out of a headless first turn, and every chat
* message is a first turn, so the canvas tools never reach the model.
* Effort values newer than this are stepped down by `effortForClaudeVersion`.
* Raise it whenever aiChat.ts starts passing a flag or value newer than this.
*/
var MIN_CLAUDE_VERSION$1 = "2.1.105";
/** Whether a reported version is below `min`. An unreadable version never blocks. */
function isOlderThan$1(version, min) {
	const parsed = (0, import_semver.valid)(version);
	return !!parsed && (0, import_semver.lt)(parsed, min);
}
/**
* The composer's effort, stepped down to one this CLI accepts: `--effort` exits on
* `xhigh` before 2.1.111 and on `ultracode` before 2.1.199 (it is ignored until
* 2.1.203). An unknown version keeps the choice, like the setup gate.
*/
function effortForClaudeVersion(effort, version) {
	if (effort === "ultracode" && isOlderThan$1(version, "2.1.203")) effort = "xhigh";
	if (effort === "xhigh" && isOlderThan$1(version, "2.1.111")) effort = "high";
	return effort;
}
/** The path resolved by the last findClaudeBinary() call, or null when none was found. */
function resolvedClaudeBinary() {
	return resolvedClaudePath;
}

export { MIN_CLAUDE_VERSION$1, claudeLauncher, effortForClaudeVersion, findClaudeBinary, getShellEnv$2, isOlderThan$1, isWindows$2, resolvedClaudeBinary, sanitizeShellOutput$1, userHome$1 };
