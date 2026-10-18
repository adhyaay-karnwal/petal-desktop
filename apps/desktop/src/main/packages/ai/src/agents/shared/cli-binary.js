// Reconstructed from index.js — original module: packages/ai/src/agents/shared/cli-binary.ts
import { node_child_process, node_fs_promises, node_os, node_path, node_util, require_rolldown_runtime } from "../../../../../__bundle__/_preamble.js";
import { import_semver } from "../../../../../vendor/uint8array-extras.js";
import { require_lib } from "../../../../../vendor/which.js";
import { getShellEnv$1, sanitizeShellOutput } from "./shell-env.js";

/**
* Locating the agent CLI installed on the user's device.
*
* One resolution order, in every mode. A driver that fell back to a binary its
* dependency happened to ship would run a different CLI in an unpackaged run
* than in a packaged one, where that binary is not there to resolve: dev would
* exercise a CLI users never get, and the version gate would pass or fail by
* accident of mode. The device CLI is the only CLI, so an outdated one is
* reported by the setup gate in both.
*
* Order, cheapest and most authoritative first:
*   1. the login shell's `command -v` — the only place a macOS GUI app's real
*      PATH lives; interactive login as well, since a PATH set in `.zshrc` is
*      invisible to a non-interactive shell;
*   2. the resolved PATH, then known install locations for a PATH that arrived
*      stripped (LUN-308), scanned by `which` without spawning anything;
*   3. `where.exe` on Windows, which has no POSIX shell to probe.
*
* A found path is reused while the file is still there, so a turn costs one
* `stat`, not a login shell. Installing a CLI must never require an app restart,
* so a miss is never cached, and status checks re-resolve to pick up a newly
* installed CLI that shadows the cached one.
*
* Node-only.
*/
var import_lib = /* @__PURE__ */ require_rolldown_runtime.__toESM(require_lib(), 1);
var execFileAsync$5 = (0, node_util.promisify)(node_child_process.execFile);
var PROBE_TIMEOUT_MS$2 = 5e3;
function isWindows() {
	return process.platform === "win32";
}
/** Home directory. Windows exports USERPROFILE, not HOME. */
function userHome() {
	return process.env.HOME || process.env.USERPROFILE || (0, node_os.homedir)();
}
async function isFile(path) {
	try {
		return (await (0, node_fs_promises.stat)(path)).isFile();
	} catch {
		return false;
	}
}
/**
* Scan directories for a runnable file, without spawning anything. Empty entries
* are dropped: `which` reads one as the working directory, as a shell would.
* On Windows `which` also checks the working directory before every entry, as
* cmd.exe does, and offers no way to opt out.
*/
function findInDirs(name, dirs) {
	const path = dirs.flatMap((dirList) => dirList?.split(node_path.delimiter) ?? []).filter((dir) => dir.trim()).join(node_path.delimiter);
	return (0, import_lib.default)(name, {
		path,
		nothrow: true
	});
}
/** Windows fallback: let the OS resolve it. Costs a subprocess, so it goes last. */
async function findViaWhere(name) {
	try {
		const { stdout } = await execFileAsync$5("where.exe", [name], {
			timeout: PROBE_TIMEOUT_MS$2,
			windowsHide: true
		});
		const hits = sanitizeShellOutput(stdout).split("\n").map((line) => line.trim()).filter((line) => /^[a-z]:\\/i.test(line));
		return hits.find((hit) => hit.toLowerCase().endsWith(".exe")) ?? hits[0] ?? null;
	} catch {
		return null;
	}
}
/**
* Newest Node first. nvm names the directories `vX.Y.Z`, and string order puts
* `v9` after `v22` and `v22.3` after `v22.10`.
*/
function compareNvmVersionDirs(a, b) {
	const aValid = (0, import_semver.valid)(a);
	const bValid = (0, import_semver.valid)(b);
	if (aValid && bValid) return (0, import_semver.rcompare)(a, b);
	if (aValid) return -1;
	if (bValid) return 1;
	return b.localeCompare(a);
}
/** nvm keeps one bin dir per Node version; a global install lands in whichever was active. */
async function nvmBinDirs(home) {
	const versionsDir = (0, node_path.join)(home, ".nvm", "versions", "node");
	try {
		return (await (0, node_fs_promises.readdir)(versionsDir)).sort(compareNvmVersionDirs).map((version) => (0, node_path.join)(versionsDir, version, "bin"));
	} catch {
		return [];
	}
}
/**
* Install directories to probe after the PATH. A macOS GUI launch with no usable
* login shell leaves PATH stripped (LUN-308), so the native installer's fixed
* location is the only place left to look.
*/
async function knownInstallDirs(home, name) {
	if (isWindows()) {
		const appData = process.env.APPDATA || (0, node_path.join)(home, "AppData", "Roaming");
		const localAppData = process.env.LOCALAPPDATA || (0, node_path.join)(home, "AppData", "Local");
		return [
			(0, node_path.join)(home, ".local", "bin"),
			(0, node_path.join)(localAppData, "Programs", name),
			(0, node_path.join)(appData, "npm")
		];
	}
	return [
		(0, node_path.join)(home, ".local/bin"),
		"/opt/homebrew/bin",
		"/usr/local/bin",
		(0, node_path.join)(home, ".bun/bin"),
		(0, node_path.join)(home, ".volta/bin"),
		...await nvmBinDirs(home)
	];
}
/**
* `command -v` in the user's shell. `-lc` reads a login shell's profile; `-ilc`
* adds `.zshrc`, where many users put their PATH, and a shell may accept one but
* not the other. Runs with the already-resolved shell environment rather than a
* bare one, so an rc file that prompts (a password manager, a version manager)
* cannot block the probe on a Touch ID request.
*/
async function findViaShell(name) {
	if (isWindows()) return null;
	const shell = process.env.SHELL || "/bin/zsh";
	const env = await getShellEnv$1();
	for (const args of [["-lc", `command -v ${name}`], ["-ilc", `command -v ${name}`]]) try {
		const { stdout } = await execFileAsync$5(shell, [...args], {
			timeout: PROBE_TIMEOUT_MS$2,
			env
		});
		const line = sanitizeShellOutput(stdout).split("\n").find((entry) => entry.startsWith("/"));
		if (line && !line.includes("not found")) return line;
	} catch {}
	return null;
}
/** The last path found per CLI name. Only hits are kept. */
var foundBinaries = /* @__PURE__ */ new Map();
/**
* The path to the CLI installed on the device, or null when there is none.
*
* Null means "not installed": the caller reports that through its setup gate
* rather than guessing at a path that would fail later, in the CLI's own words.
* `forceRefresh` skips the cached path; a cached path that no longer exists is
* re-resolved either way.
*/
async function findDeviceBinary(name, forceRefresh = false) {
	const cached = foundBinaries.get(name);
	if (!forceRefresh && cached && await isFile(cached)) return cached;
	const found = await resolveDeviceBinary(name);
	if (found) foundBinaries.set(name, found);
	else foundBinaries.delete(name);
	return found;
}
async function resolveDeviceBinary(name) {
	const found = await findViaShell(name) ?? await findInDirs(name, [
		(await getShellEnv$1()).PATH,
		process.env.PATH,
		...await knownInstallDirs(userHome(), name)
	]);
	if (found) return found;
	return isWindows() ? findViaWhere(name) : null;
}
/**
* Whether a CLI's reported version is below `min`. An unreadable version never
* blocks; only a parseable one can read as too old.
*/
function isOlderThan(version, min) {
	const parsed = (0, import_semver.valid)(version);
	return !!parsed && (0, import_semver.lt)(parsed, min);
}
/**
* The program to spawn for a CLI, and the arguments that precede its own.
*
* Three shapes reach here, and only the first is spawnable as-is:
*   - a native binary (the usual case, and what the native installers lay down);
*   - an npm-installed `.cmd`/`.bat` shim, which Windows refuses to spawn
*     directly and `cmd.exe` cannot carry our arguments through, so the program
*     the shim launches is read out of it instead;
*   - a bare JS entry point, which needs a Node to run it.
*/
async function cliLauncher(file) {
	if (isWindows() && /\.(cmd|bat)$/i.test(file)) {
		const target = await resolveShim(file);
		if (!target) throw new Error(`Could not find the program that ${file} launches`);
		return target;
	}
	return /\.(js|mjs|cjs)$/i.test(file) ? {
		cmd: "node",
		args: [file]
	} : {
		cmd: file,
		args: []
	};
}
/**
* Reads the program out of a Windows shim's last `%*` line, e.g.
* `"%dp0%\node_modules\…\claude.exe" %*`.
*
* Spawning the `.cmd` itself is not an option: Node refuses since CVE-2024-27980,
* and going through `cmd.exe` mangles our arguments — `/s` strips the quotes
* around a path under "Program Files", and a newline in the system prompt ends
* the command.
*/
async function resolveShim(shim) {
	let content;
	try {
		content = await (0, node_fs_promises.readFile)(shim, "utf8");
	} catch {
		return null;
	}
	const shimDir = (0, node_path.dirname)(shim);
	const target = [...(content.split(/\r?\n/).filter((line) => line.includes("%*")).pop() ?? "").matchAll(/"([^"]+)"/g)].map(([, quoted]) => quoted.replace(/^%(dp0%|~dp0)/i, shimDir)).filter((path) => path !== "%_prog%" && !/(^|\\)node\.exe$/i.test(path)).map((path) => (0, node_path.normalize)(path.replace(/\\/g, node_path.sep))).pop();
	if (!target || !await isFile(target)) return null;
	if (/\.(exe|com)$/i.test(target)) return {
		cmd: target,
		args: []
	};
	const node = await findInDirs("node.exe", [shimDir, process.env.PATH]);
	return node ? {
		cmd: node,
		args: [target]
	} : null;
}

export { cliLauncher, findDeviceBinary, isOlderThan };
