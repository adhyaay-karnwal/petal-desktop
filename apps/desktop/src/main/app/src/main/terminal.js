// Reconstructed from index.js — original module: app/src/main/terminal.ts
import { electron, fs, node_pty, os, path } from "../../../__bundle__/_preamble.js";
import { getProjectForContents, getWindowForContents } from "../../../packages/ai/src/protocol.js";
import { getProjectAllowedPaths } from "./mcpServer.js";

/**
* On POSIX, node-pty spawns shells through a `spawn-helper` binary shipped in
* its prebuilds dir. Some installs leave that file without the executable bit
* (pnpm skipping the package's install scripts), which makes spawning fail with
* the opaque "posix_spawnp failed". Re-mark it executable defensively so a
* botched install can't take the integrated terminal down. This only reaches
* dev runs: in a packaged app the path resolves into app.asar, so packaging
* marks the helper itself (`scripts/after-pack.cjs`).
*/
function ensureSpawnHelperExecutable() {
	if (process.platform === "win32") return;
	try {
		const nodePtyRoot = path.join(require.resolve("node-pty"), "..", "..");
		const helperPath = path.join(nodePtyRoot, "prebuilds", `${process.platform}-${process.arch}`, "spawn-helper");
		const stat = fs.statSync(helperPath);
		if ((stat.mode & 73) === 0) fs.chmodSync(helperPath, stat.mode | 493);
	} catch {}
}
var sessions = /* @__PURE__ */ new Map();
var nextId = 1;
function makeSessionId() {
	return `term-${Date.now().toString(36)}-${nextId++}`;
}
/** Pick the shell to launch. Honors the user's login shell on POSIX. */
function resolveShell() {
	if (process.platform === "win32") return {
		file: process.env.COMSPEC || "powershell.exe",
		args: []
	};
	return {
		file: process.env.SHELL || "/bin/zsh",
		args: ["-l"]
	};
}
/**
* Default working directory for a window's terminal: the first allowed local
* path (the codebase the user attached), then the home directory. Agents-v2
* CLIs run from a throwaway workspace, but the terminal is the user's own
* shell, so it opens where their code is instead of inside that workspace.
* The exception is a tab that runs the agent's own CLI (see `TerminalDeps`).
*/
function resolveCwd(contents) {
	const projectId = getProjectForContents(contents);
	if (projectId) for (const p of getProjectAllowedPaths(projectId)) try {
		if (fs.statSync(p).isDirectory()) return p;
	} catch {}
	return os.homedir();
}
function disposeSession(id) {
	const session = sessions.get(id);
	if (!session) return;
	sessions.delete(id);
	try {
		session.pty.kill();
	} catch {}
}
/** Kill every PTY owned by a window (window closed or renderer reloaded). */
function disposeTerminalsForWindow(winId) {
	for (const [id, session] of sessions) if (session.winId === winId) disposeSession(id);
}
function disposeTerminalsForContents(contentsId) {
	for (const [id, session] of sessions) if (session.contentsId === contentsId) disposeSession(id);
}
/** The calling tab's agent workspace, or null when it has no project or the workspace cannot be made. */
async function agentWorkspaceCwd(contents, deps) {
	const projectId = getProjectForContents(contents);
	if (!projectId || !deps.resolveAgentWorkspace) return null;
	try {
		return await deps.resolveAgentWorkspace(projectId);
	} catch {
		return null;
	}
}
function registerTerminalIPC(deps = {}) {
	electron.ipcMain.handle("terminal:create", async (event, args) => {
		const win = getWindowForContents(event.sender);
		if (!win) return {
			ok: false,
			error: "No window"
		};
		const cwd = (args?.cwd === "agent-workspace" ? await agentWorkspaceCwd(event.sender, deps) : null) ?? resolveCwd(event.sender);
		if (event.sender.isDestroyed()) return {
			ok: false,
			error: "No window"
		};
		const { file, args: shellArgs } = resolveShell();
		const id = makeSessionId();
		const sender = event.sender;
		let proc;
		try {
			ensureSpawnHelperExecutable();
			proc = node_pty.spawn(file, shellArgs, {
				name: "xterm-256color",
				cols: args?.cols && args.cols > 0 ? args.cols : 80,
				rows: args?.rows && args.rows > 0 ? args.rows : 24,
				cwd,
				env: {
					...process.env,
					TERM: "xterm-256color"
				}
			});
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
		sessions.set(id, {
			pty: proc,
			winId: win.id,
			contentsId: event.sender.id
		});
		proc.onData((data) => {
			if (!sender.isDestroyed()) sender.send("terminal:data", {
				id,
				data
			});
		});
		proc.onExit(({ exitCode }) => {
			if (!sender.isDestroyed()) sender.send("terminal:exit", {
				id,
				exitCode
			});
			sessions.delete(id);
		});
		const initial = args?.initialCommand?.trim();
		if (initial) proc.write(`${initial}\r`);
		return {
			ok: true,
			id,
			cwd,
			shell: file
		};
	});
	electron.ipcMain.on("terminal:input", (_event, args) => {
		sessions.get(args?.id)?.pty.write(args.data);
	});
	electron.ipcMain.on("terminal:resize", (_event, args) => {
		const session = sessions.get(args?.id);
		if (!session || !args.cols || !args.rows) return;
		try {
			session.pty.resize(args.cols, args.rows);
		} catch {}
	});
	electron.ipcMain.on("terminal:dispose", (_event, args) => {
		disposeSession(args?.id);
	});
}

export { disposeTerminalsForContents, disposeTerminalsForWindow, registerTerminalIPC };
