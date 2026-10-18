// Reconstructed from index.js — original module: app/src/main/index.ts
import { crypto$1, electron, fs, path, url } from "../../../__bundle__/_preamble.js";
import "./shellPath.js";
import "./backgroundMode.js";
import { registerAssetExportIPC } from "./assetExport.js";
import { createQuitLifecycle } from "./quitLifecycle.js";
import { electronApp, is, optimizer } from "../../../vendor/@electron-toolkit/utils.js";
import { import_main } from "../../../packages/compiler/src/store/types.js";
import { ensureV2 } from "../../../packages/compiler/src/store/ensureV2.js";
import { generateJSX } from "../../../packages/compiler/src/codegen/generateJSX.js";
import { extractComponentDependencies, extractIconDependencies } from "../../../packages/compiler/src/codegen/extractDependencies.js";
import { getComponentImportMappings, getIconImportMappings } from "../../../packages/compiler/src/codegen/generateImports.js";
import { repairComponentImports, repairStripMarkdownCodeFences, validateHasEsmExports, validateJsxComponentsResolved, validateLooksLikeSourceModule, validateNotEmpty, validateParsesAsTsx } from "../../../packages/compiler/src/codegen/saveToCode.js";
import { validatePromptFolders, withPromptFolders } from "./promptFolders.js";
import { attachDesktopTabs, broadcastToRenderers, closeWindowProjects, createFileInActiveView, findContentsForProject, findWindowForProject, focusProjectTab, getProjectForContents, getWindowForContents, openFilePalette, openProjectTab, registerDesktopTabsIPC, reloadActiveView, setProjectActivity, toggleActiveDevTools, windowProjectMap } from "../../../packages/ai/src/protocol.js";
import { DESKTOP_ORIGIN, authClient, getApiUrl, getWebUrl } from "./auth.js";
import { checkMcpHealth, getMcpStartupError, getMcpUrl, getSystemSkills$1, isChatCancelled, isExistingPathAllowed, mcpEvents, releaseProject, resolveApproval, resolveFolderAccess, setProjectAllowedPaths, setSkillOverrides, startMcpServer$1, stopMcpServer } from "./mcpServer.js";
import { cancelAllSessions, cancelSession, cancelSessionsForProject, generateChatTitle, getClaudeStatus, handleChat } from "./aiChat.js";
import { listClaudeConnections, listClaudeSlashCommands } from "./claudeContext.js";
import { getSystemSkills } from "./mcpServerV2.js";
import { disposeAgentChatProject, getAgentMcpInfo, projectWorkspace, setupAgentChat, startAgentChat, stopAgentChat, syncAgentWorkspaceSkillOverrides } from "./aiChatV2.js";
import { applySourceEdit, resolveElementInSource } from "../../../packages/compiler/src/codegen/sourceEdit.js";
import { PROFILING_ENABLED, finishProfilingBeforeQuit, isRecording, isStoppingRecording, startRecording, stopRecording } from "./profiling/index.js";
import { disposeTerminalsForContents, disposeTerminalsForWindow, registerTerminalIPC } from "./terminal.js";
import { exchangeGitHubCode, startGitHubOAuthServer } from "./githubOAuth.js";
import { startEmbeddedServer, stopEmbeddedServer } from "./petalServer.js";
import { petalUpdater } from "./petalUpdater.js";
import { MergeValidationError, isClaudeAvailable, mergeWithClaude, resolveSaveToCodeAiFromEnv, resolveUpdatedInstanceProps } from "../../../packages/compiler/src/codegen/claudeMerge.js";

process.on("uncaughtException", (error) => {
	console.error("[Electron] Uncaught exception:", error);
});
process.on("unhandledRejection", (reason) => {
	console.error("[Electron] Unhandled rejection:", reason);
});
var RENDERER_FILE = (0, path.join)(__dirname, "../renderer/index.html");
/**
* A request from a frame showing the app's own renderer page. Capture windows
* share this session but load arbitrary sites, as can iframes inside the app,
* so they must not borrow the user's session. Packaged, that means the bundled
* index.html itself, not any file:// page: the MCP screenshot fallback opens a
* canvas iframe's URL in a window of its own, and that URL can be a local file.
*/
function isAppRendererRequest(details) {
	const frame = details.frame;
	return !!details.webContents && !!frame && isAppRendererPage(details.webContents, frame.url);
}
/** Whether `contents` is showing the app's own renderer page at `pageUrl`. */
function isAppRendererPage(contents, pageUrl) {
	if (contents.getType() !== "window" || !URL.canParse(pageUrl)) return false;
	const rendererUrl = is.dev ? process.env["ELECTRON_RENDERER_URL"] : void 0;
	const url$3 = new URL(pageUrl);
	if (rendererUrl) return url$3.origin === new URL(rendererUrl).origin;
	if (url$3.protocol !== "file:") return false;
	try {
		return (0, url.fileURLToPath)(url$3) === RENDERER_FILE;
	} catch {
		return false;
	}
}
function setupAuthCookieInjection() {
	const apiUrl = getApiUrl();
	electron.session.defaultSession.webRequest.onBeforeSendHeaders({ urls: [`${apiUrl}/*`] }, (details, callback) => {
		if (!isAppRendererRequest(details)) {
			callback({ requestHeaders: details.requestHeaders });
			return;
		}
		try {
			const cookie = authClient.getCookie();
			if (cookie) details.requestHeaders["Cookie"] = cookie;
			if (details.resourceType === "xhr" && !details.frame?.parent && new URL(details.url).pathname.startsWith("/api/auth/")) details.requestHeaders["Origin"] = DESKTOP_ORIGIN;
		} catch (err) {
			console.error("[Auth] Failed to read cookie for request:", err);
		}
		callback({ requestHeaders: details.requestHeaders });
	});
}
function setupWebviewCookieShim(guestSession) {
	guestSession.webRequest.onHeadersReceived((details, callback) => {
		const headers = details.responseHeaders;
		if (!headers) {
			callback({});
			return;
		}
		const setCookieKey = Object.keys(headers).find((k) => k.toLowerCase() === "set-cookie");
		if (!setCookieKey) {
			callback({ responseHeaders: headers });
			return;
		}
		const cookies = headers[setCookieKey];
		if (!cookies || !Array.isArray(cookies)) {
			callback({ responseHeaders: headers });
			return;
		}
		headers[setCookieKey] = cookies.map((cookie) => {
			let next = cookie;
			next = next.replace(/;\s*SameSite=(Lax|Strict|None)/gi, "");
			if (!/;\s*Secure/i.test(next)) next += "; Secure";
			next += "; SameSite=None";
			return next;
		});
		callback({ responseHeaders: headers });
	});
}
function isEditorWebContents(contents) {
	return contents?.getType() === "window";
}
function isMediaPermission(permission) {
	return permission === "media" || permission === "camera" || permission === "microphone";
}
/** `mediaTypes` empty or `['unknown']` means Chromium didn't say, which is allowed. */
function wantsCamera(permission, mediaTypes) {
	if (permission === "camera") return true;
	if (permission !== "media") return false;
	return mediaTypes.length === 0 || mediaTypes.includes("video") || mediaTypes.includes("unknown");
}
async function ensureMacCameraAccess() {
	if (process.platform !== "darwin") return true;
	const status = electron.systemPreferences.getMediaAccessStatus("camera");
	if (status === "granted") return true;
	if (status === "denied" || status === "restricted") return false;
	return electron.systemPreferences.askForMediaAccess("camera");
}
function setupMediaPermissions() {
	const ses = electron.session.defaultSession;
	ses.setPermissionCheckHandler((webContents, permission, _origin, details) => {
		if (!isMediaPermission(permission)) return true;
		if (webContents && !isEditorWebContents(webContents)) return false;
		return wantsCamera(permission, details.mediaType ? [details.mediaType] : []);
	});
	ses.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
		if (!isMediaPermission(permission)) {
			callback(true);
			return;
		}
		const mediaTypes = "mediaTypes" in details ? details.mediaTypes ?? [] : [];
		if (!isEditorWebContents(webContents) || !wantsCamera(permission, mediaTypes)) {
			callback(false);
			return;
		}
		callback(await ensureMacCameraAccess());
	});
}
var WEBVIEW_PARTITION = "persist:canvas-webviews";
function setupWebviewSession() {
	const ses = electron.session.fromPartition(WEBVIEW_PARTITION);
	setupWebviewCookieShim(ses);
	ses.setPermissionCheckHandler((_webContents, permission) => !isMediaPermission(permission));
	ses.setPermissionRequestHandler((_webContents, permission, callback) => callback(!isMediaPermission(permission)));
}
var windows = /* @__PURE__ */ new Set();
var quitLifecycle = createQuitLifecycle(process.platform, () => electron.app.quit());
/** Maps BrowserWindow id → projectId to open on load (for deep links into new windows) */
var pendingDeepLinkMap = /* @__PURE__ */ new Map();
var pendingDeepLinkProjectId = null;
/**
* Which local MCP stack is running. The renderer reports the agents-v2 PostHog
* flag (main cannot read it). Both stacks share one port, so one server runs
* at a time. A later signal swaps: the first answer can be a stale cached
* flag, or the v1 fallback below, while the fresh flag is v2. If no signal
* arrives (PostHog never loads), v1 starts so the app still has an MCP server.
*/
var mcpStack = null;
/** The running stack's start, so a switch waits for it before freeing the port. */
var mcpStackStarting = Promise.resolve();
var mcpStackTimer = null;
var MCP_STACK_WAIT_MS = 1e4;
function chooseMcpStack(next) {
	if (mcpStackTimer) {
		clearTimeout(mcpStackTimer);
		mcpStackTimer = null;
	}
	if (mcpStack === next) return;
	const previous = mcpStack;
	mcpStack = next;
	if (previous) console.warn(`[MCP] switching stack ${previous} → ${next}`);
	mcpStackStarting = mcpStackStarting.catch(() => {}).then(() => previous === "v1" ? stopMcpServer() : previous === "v2" ? stopAgentChat() : void 0).then(async () => {
		if (next === "v2") await startAgentChat();
		else await startMcpServer$1();
	}).then(() => {
		if (mcpStack !== next) return;
		for (const contents of electron.webContents.getAllWebContents()) if (!contents.isDestroyed()) contents.send("mcp_stack", mcpStack);
	}).catch((err) => console.error(`[MCP] Failed to start ${next}:`, err));
}
/** Start v1 if the renderer never reports a flag. */
function armMcpStackFallback() {
	if (mcpStack || mcpStackTimer) return;
	mcpStackTimer = setTimeout(() => {
		mcpStackTimer = null;
		if (mcpStack) return;
		console.warn("[MCP] no stack signal; starting v1");
		chooseMcpStack("v1");
	}, MCP_STACK_WAIT_MS);
}
/** Get the focused window, or fall back to the most recently created one */
function getFocusedWindow() {
	return electron.BrowserWindow.getFocusedWindow() ?? [...windows].pop() ?? null;
}
async function apiFetch(path$34, init) {
	const cookie = authClient.getCookie();
	return fetch(`${getApiUrl()}${path$34}`, {
		...init,
		headers: {
			...init?.headers,
			...cookie ? { Cookie: cookie } : {}
		}
	});
}
function registerIPC() {
	electron.ipcMain.on("window:set-background-color", (event, color) => {
		if (event.senderFrame !== event.sender.mainFrame) return;
		if (typeof color !== "string" || !/^#[\da-f]{6}$/i.test(color)) return;
		const win = electron.BrowserWindow.fromWebContents(event.sender);
		if (win && windows.has(win) && !win.isDestroyed()) win.setBackgroundColor(color);
	});
	electron.ipcMain.on("desktop_theme_set", (event, theme) => {
		if (!isEditorWebContents(event.sender)) return;
		if (theme === "light" || theme === "dark" || theme === "system") electron.nativeTheme.themeSource = theme;
	});
	registerAssetExportIPC(isEditorWebContents);
	electron.ipcMain.handle("canvas:capture-rect", async (event, rect) => {
		if (!isEditorWebContents(event.sender)) return null;
		const image = await event.sender.capturePage({
			x: Math.round(rect.x),
			y: Math.round(rect.y),
			width: Math.max(1, Math.round(rect.width)),
			height: Math.max(1, Math.round(rect.height))
		});
		return image.isEmpty() ? null : image.toDataURL();
	});
	electron.ipcMain.handle("get:api-url", () => getApiUrl());
	electron.ipcMain.handle("get:web-url", () => getWebUrl());
	electron.ipcMain.on("set_mcp_stack", (_event, payload) => {
		chooseMcpStack(payload?.agentsV2 ? "v2" : "v1");
	});
	electron.ipcMain.handle("get:mcp-stack", () => mcpStack);
	electron.ipcMain.handle("get:mcp-info", async (_event, options) => {
		if (options?.agentsV2) return getAgentMcpInfo();
		return {
			url: getMcpUrl(),
			healthy: await checkMcpHealth(),
			error: getMcpStartupError() ?? void 0
		};
	});
	electron.ipcMain.handle("get_app_info", () => {
		const rawName = electron.app.getName();
		return {
			name: rawName.startsWith("@") ? "Petal" : rawName,
			version: electron.app.getVersion(),
			isDevBuild: is.dev
		};
	});
	electron.ipcMain.handle("clear_all_caches", async () => {
		await electron.session.defaultSession.clearCache();
		await electron.session.defaultSession.clearStorageData({ storages: ["cachestorage"] });
		return { success: true };
	});
	registerDesktopTabsIPC();
	const authorizeSourcePath = async (event, filePath) => {
		const projectId = getProjectForContents(event.sender);
		if (projectId && await isExistingPathAllowed(filePath, projectId)) return (0, path.resolve)(filePath);
		return null;
	};
	electron.ipcMain.handle("edit_source", async (event, args) => {
		const absPath = await authorizeSourcePath(event, args.filePath);
		if (!absPath) return {
			ok: false,
			reason: "not-allowed",
			detail: args.filePath
		};
		let source;
		try {
			source = await fs.promises.readFile(absPath, "utf8");
		} catch (e) {
			return {
				ok: false,
				reason: "read-error",
				detail: String(e?.message || e)
			};
		}
		const result = applySourceEdit(source, {
			line: args.line,
			column: args.column,
			tag: args.tag,
			className: args.className
		}, args.edit);
		if (!result.ok) {
			const lines = source.split("\n");
			const nearbyJsxLines = [];
			for (let i = Math.max(0, args.line - 5); i < Math.min(lines.length, args.line + 4); i++) if (/<[A-Za-z]/.test(lines[i])) nearbyJsxLines.push(i + 1);
			return {
				...result,
				v: "edit2",
				requestedLine: args.line,
				lineText: (lines[args.line - 1] ?? "").trim().slice(0, 120),
				nearbyJsxLines
			};
		}
		try {
			await fs.promises.writeFile(absPath, result.source, "utf8");
		} catch (e) {
			return {
				ok: false,
				reason: "write-error",
				detail: String(e?.message || e)
			};
		}
		return {
			ok: true,
			before: result.before,
			after: result.after
		};
	});
	electron.ipcMain.handle("read_source", async (event, args) => {
		const absPath = await authorizeSourcePath(event, args.filePath);
		if (!absPath) return {
			ok: false,
			reason: "not-allowed",
			detail: args.filePath
		};
		try {
			return {
				ok: true,
				content: await fs.promises.readFile(absPath, "utf8")
			};
		} catch (e) {
			return {
				ok: false,
				reason: "read-error",
				detail: String(e?.message || e)
			};
		}
	});
	electron.ipcMain.handle("webview_execute_isolated", (event, args) => {
		const guest = electron.webContents.fromId(args.webContentsId);
		if (!guest || guest.getType() !== "webview" || guest.hostWebContents !== event.sender) throw new Error("not a guest of this page");
		return guest.executeJavaScriptInIsolatedWorld(999, [{ code: args.code }]);
	});
	electron.ipcMain.handle("resolve_element", async (event, args) => {
		const absPath = await authorizeSourcePath(event, args.filePath);
		if (!absPath) return {
			ok: false,
			reason: "not-allowed",
			detail: args.filePath
		};
		let source;
		try {
			source = await fs.promises.readFile(absPath, "utf8");
		} catch (e) {
			return {
				ok: false,
				reason: "read-error",
				detail: String(e?.message || e)
			};
		}
		const loc = resolveElementInSource(source, {
			tag: args.tag,
			className: args.className,
			text: args.text ?? void 0
		});
		if (!loc) return {
			ok: false,
			reason: "not-found",
			detail: `<${args.tag}> in ${args.filePath}`
		};
		return {
			ok: true,
			filePath: args.filePath,
			line: loc.line,
			column: loc.column
		};
	});
	const projectAllowedPaths = /* @__PURE__ */ new Map();
	electron.ipcMain.handle("get_allowed_paths", (event) => {
		if (!getWindowForContents(event.sender)) return { paths: [] };
		const projectId = getProjectForContents(event.sender);
		if (!projectId) return { paths: [] };
		return { paths: projectAllowedPaths.get(projectId) || [] };
	});
	electron.ipcMain.handle("set_allowed_paths", (_event, args) => {
		if (!args?.projectId) return;
		const paths = Array.isArray(args.paths) ? args.paths : [];
		projectAllowedPaths.set(args.projectId, paths);
		setProjectAllowedPaths(args.projectId, paths);
	});
	electron.ipcMain.handle("get_system_skills", async () => {
		return (mcpStack === "v2" ? await getSystemSkills() : await getSystemSkills$1()).map(({ name, description, files }) => ({
			name,
			description,
			files
		}));
	});
	electron.ipcMain.handle("set_skill_overrides", (_event, args) => {
		setSkillOverrides(!!args?.enabled, args?.overrides && typeof args.overrides === "object" ? args.overrides : {}, typeof args?.gen === "number" ? args.gen : void 0);
		syncAgentWorkspaceSkillOverrides();
	});
	electron.ipcMain.handle("pick_folder", async (event, args) => {
		const win = getWindowForContents(event.sender);
		if (!win) return { path: null };
		const result = await electron.dialog.showOpenDialog(win, {
			properties: ["openDirectory", "createDirectory"],
			title: args?.title || void 0
		});
		if (result.canceled || result.filePaths.length === 0) return { path: null };
		return { path: result.filePaths[0] };
	});
	electron.ipcMain.handle("stage_import_directory", async (_event, args) => {
		const { dirname } = await import("path");
		const { mkdir, writeFile, readFile, readdir, stat, rm, rename, rmdir } = await import("fs/promises");
		if (!args.parentPath || !(0, path.isAbsolute)(args.parentPath)) throw new Error("Choose a folder to copy the repository into");
		const parentPath = (0, path.resolve)(args.parentPath);
		if (!(await stat(parentPath).catch(() => null))?.isDirectory()) throw new Error("Choose an existing folder to copy the repository into");
		const label = (args.label || "design-system").replace(/[^\w.-]+/g, "-");
		const manifestName = ".petal-github-import.json";
		const source = {
			repo: args.source?.repo,
			branch: args.source?.branch,
			commitSha: args.source?.commitSha,
			path: args.source?.path ?? null
		};
		if (!source.repo || !source.branch || !source.commitSha) throw new Error("GitHub import source is missing");
		let suffix = 0;
		let root = (0, path.join)(parentPath, label);
		let existing = await stat(root).catch(() => null);
		while (existing) {
			if (existing.isDirectory()) {
				if ((await readdir(root)).length === 0) break;
				const previousSource = await readFile((0, path.join)(root, manifestName), "utf-8").then((contents) => JSON.parse(contents)).catch(() => null);
				if (previousSource?.repo === source.repo && previousSource.branch === source.branch && previousSource.commitSha === source.commitSha && (previousSource.path ?? null) === source.path) return { path: root };
			}
			suffix += 1;
			root = (0, path.join)(parentPath, `${label} (${suffix})`);
			existing = await stat(root).catch(() => null);
		}
		const staging = (0, path.join)(parentPath, `.petal-github-import-${crypto$1.randomUUID()}`);
		await mkdir(staging, { recursive: true });
		try {
			for (const file of args.files ?? []) {
				if (!file?.path || typeof file.content !== "string") continue;
				if (file.path.includes("..")) continue;
				const abs = (0, path.join)(staging, file.path);
				await mkdir(dirname(abs), { recursive: true });
				await writeFile(abs, file.content, "utf-8");
			}
			for (const asset of args.assets ?? []) {
				if (!asset?.path || typeof asset.base64 !== "string") continue;
				if (asset.path.includes("..")) continue;
				const abs = (0, path.join)(staging, asset.path);
				await mkdir(dirname(abs), { recursive: true });
				await writeFile(abs, Buffer.from(asset.base64, "base64"));
			}
			await writeFile((0, path.join)(staging, manifestName), JSON.stringify(source, null, 2), "utf-8");
			if (existing?.isDirectory()) await rmdir(root);
			await rename(staging, root);
		} catch (err) {
			await rm(staging, {
				recursive: true,
				force: true
			}).catch(() => {});
			throw err;
		}
		return { path: root };
	});
	electron.ipcMain.handle("pick_and_scan_directory", async (event) => {
		const win = getWindowForContents(event.sender);
		if (!win) return { cancelled: true };
		const result = await electron.dialog.showOpenDialog(win, {
			properties: ["openDirectory"],
			title: "Select project folder to import"
		});
		if (result.canceled || !result.filePaths[0]) return { cancelled: true };
		const userPickedDir = result.filePaths[0];
		const CODE_EXTS = /* @__PURE__ */ new Set([
			".tsx",
			".ts",
			".jsx",
			".js",
			".astro",
			".css",
			".json",
			".mdx",
			".md"
		]);
		const ASSET_EXTS = /* @__PURE__ */ new Set([
			".png",
			".jpg",
			".jpeg",
			".gif",
			".webp",
			".svg",
			".woff",
			".woff2",
			".ttf",
			".otf",
			".ico"
		]);
		const SCAN_DIRS = /* @__PURE__ */ new Set([
			"src",
			"app",
			"components",
			"lib",
			"utils",
			"hooks",
			"pages",
			"styles",
			"style",
			"css",
			"theme",
			".petal",
			"public",
			"assets"
		]);
		const MONOREPO_CONTAINERS = [
			"frontend",
			"web",
			"client",
			"mobile",
			"desktop"
		];
		const MONOREPO_NESTED = [
			"apps",
			"packages",
			"libs"
		];
		const APP_MARKERS = [
			"src",
			"app",
			"components"
		];
		function looksLikeAppRoot(dir) {
			try {
				const entries = fs.readdirSync(dir, { withFileTypes: true });
				const names = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
				const hasMarker = APP_MARKERS.some((m) => names.has(m));
				if (!hasMarker) return false;
				try {
					const pkg = JSON.parse(fs.readFileSync((0, path.join)(dir, "package.json"), "utf-8"));
					const deps = {
						...pkg.dependencies ?? {},
						...pkg.devDependencies ?? {}
					};
					if (deps.react || deps.next || deps.tailwindcss || deps.vite) return true;
					return hasMarker;
				} catch {
					return hasMarker;
				}
			} catch {
				return false;
			}
		}
		function findRealAppRoot(picked) {
			const pickedHasPkg = (() => {
				try {
					return fs.existsSync((0, path.join)(picked, "package.json"));
				} catch {
					return false;
				}
			})();
			if (looksLikeAppRoot(picked) && pickedHasPkg) return picked;
			const homeDir = require("os").homedir();
			let current = picked;
			for (let hop = 0; hop < 4; hop++) {
				const parent = require("path").dirname(current);
				if (!parent || parent === current || parent === homeDir || parent === "/") break;
				current = parent;
				try {
					if (fs.existsSync((0, path.join)(current, "package.json"))) {
						const entries = fs.readdirSync(current, { withFileTypes: true });
						const dirNames = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
						if (MONOREPO_NESTED.some((n) => dirNames.has(n)) || entries.some((e) => e.isFile() && (e.name === "nx.json" || e.name === "pnpm-workspace.yaml" || e.name === "lerna.json" || e.name === "rush.json" || e.name === "turbo.json"))) return current;
					}
				} catch {}
			}
			try {
				const entries = fs.readdirSync(picked, { withFileTypes: true });
				for (const e of entries) {
					if (!e.isDirectory()) continue;
					if (MONOREPO_CONTAINERS.includes(e.name)) {
						const candidate = (0, path.join)(picked, e.name);
						if (looksLikeAppRoot(candidate)) return candidate;
					}
				}
				for (const e of entries) {
					if (!e.isDirectory()) continue;
					if (!MONOREPO_NESTED.includes(e.name)) continue;
					const containerDir = (0, path.join)(picked, e.name);
					let children;
					try {
						children = fs.readdirSync(containerDir, { withFileTypes: true });
					} catch {
						continue;
					}
					for (const c of children) {
						if (!c.isDirectory()) continue;
						const candidate = (0, path.join)(containerDir, c.name);
						if (looksLikeAppRoot(candidate)) return candidate;
					}
				}
			} catch {}
			return picked;
		}
		const rootDir = findRealAppRoot(userPickedDir);
		const folderName = userPickedDir.split("/").pop() || "Untitled";
		const rerooted = rootDir !== userPickedDir;
		const ROOT_FILES = /* @__PURE__ */ new Set([
			"package.json",
			"tsconfig.json",
			"tailwind.config.ts",
			"tailwind.config.js"
		]);
		const EXT_TO_TYPE = {
			".tsx": "tsx",
			".ts": "ts",
			".jsx": "jsx",
			".js": "js",
			".css": "css",
			".json": "json",
			".mdx": "mdx",
			".md": "md"
		};
		const files = [];
		const assets = [];
		const canvases = [];
		const LUNAGRAPH_SKIP_DIRS = /* @__PURE__ */ new Set([
			"versions",
			"drafts",
			"snapshots"
		]);
		const LUNAGRAPH_SKIP_FILES = /* @__PURE__ */ new Set([
			"chat.json",
			"ComponentIndex.json",
			"safelist.html",
			"INSTRUCTIONS.md",
			"settings.json",
			"canvas.json"
		]);
		const MIME_TYPES = {
			".png": "image/png",
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".gif": "image/gif",
			".webp": "image/webp",
			".svg": "image/svg+xml",
			".woff": "font/woff",
			".woff2": "font/woff2",
			".ttf": "font/ttf",
			".otf": "font/otf",
			".ico": "image/x-icon"
		};
		function scanDir(dir, relBase) {
			let entries;
			try {
				entries = fs.readdirSync(dir, { withFileTypes: true });
			} catch {
				return;
			}
			for (const entry of entries) {
				const fullPath = (0, path.join)(dir, entry.name);
				const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
				if (entry.isSymbolicLink()) continue;
				if (entry.isDirectory()) {
					if (entry.name === "node_modules" || entry.name === ".git") continue;
					if (!relBase && !SCAN_DIRS.has(entry.name) && entry.name !== ".petal") continue;
					if (relPath === ".petal/canvases") try {
						const canvasDirs = fs.readdirSync(fullPath, { withFileTypes: true });
						for (const cd of canvasDirs) {
							if (!cd.isDirectory()) continue;
							try {
								const canvasJson = fs.readFileSync((0, path.join)(fullPath, cd.name, "canvas.json"), "utf-8");
								const canvas = JSON.parse(canvasJson);
								canvases.push({
									name: canvas.name || cd.name,
									canvas
								});
							} catch {}
						}
					} catch {}
					if (relBase?.startsWith(".petal") && LUNAGRAPH_SKIP_DIRS.has(entry.name)) continue;
					scanDir(fullPath, relPath);
					continue;
				}
				if (relBase?.startsWith(".petal") && LUNAGRAPH_SKIP_FILES.has(entry.name)) continue;
				if (!relBase && ROOT_FILES.has(entry.name)) {
					const content = fs.readFileSync(fullPath, "utf-8");
					files.push({
						path: entry.name,
						content,
						fileType: EXT_TO_TYPE[(0, path.extname)(entry.name).toLowerCase()] || "other"
					});
					continue;
				}
				if (!relBase && (0, path.extname)(entry.name).toLowerCase() === ".css") {
					const content = fs.readFileSync(fullPath, "utf-8");
					files.push({
						path: entry.name,
						content,
						fileType: EXT_TO_TYPE[(0, path.extname)(entry.name).toLowerCase()] || "other"
					});
					continue;
				}
				if (!relBase) continue;
				const ext = (0, path.extname)(entry.name).toLowerCase();
				if (ASSET_EXTS.has(ext)) {
					const buf = fs.readFileSync(fullPath);
					assets.push({
						path: relPath,
						data: buf.toString("base64"),
						mimeType: MIME_TYPES[ext] || "application/octet-stream",
						size: buf.length
					});
					continue;
				}
				if (CODE_EXTS.has(ext)) {
					const content = fs.readFileSync(fullPath, "utf-8");
					files.push({
						path: relPath,
						content,
						fileType: EXT_TO_TYPE[ext] || "other"
					});
				}
			}
		}
		scanDir(rootDir, "");
		return {
			cancelled: false,
			folderName,
			files,
			assets,
			canvases,
			rootPath: rootDir,
			userPickedPath: userPickedDir,
			rerooted
		};
	});
	electron.ipcMain.handle("save_file", async (_, args) => {
		try {
			const { projectId, options } = args;
			const ai = resolveSaveToCodeAiFromEnv(process.env, { defaultMode: "api" });
			if (ai.mode === "api") {
				console.log("[IPC] save_file: forwarding to server API");
				const saveRes = await apiFetch(`/projects/${projectId}/save-to-code`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(options)
				});
				const result = await saveRes.json().catch(() => null);
				if (!saveRes.ok || !result) return {
					success: false,
					error: result?.error || `Save to code API failed: ${saveRes.status}`
				};
				return result;
			}
			const { filePath, elements, stateContext, internalComponent, userInstructions, suggestInstanceProps, componentIndex: bodyIndex } = options;
			if (!await isClaudeAvailable()) return {
				success: false,
				error: "Claude CLI is required for saving (or set SAVE_TO_CODE_MODE=api to use the server). Install from https://claude.ai/download."
			};
			const fileRes = await apiFetch(`/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`);
			if (!fileRes.ok) return {
				success: false,
				error: `Failed to read file from API: ${fileRes.status}`
			};
			const fileData = await fileRes.json();
			if (!fileData.content) return {
				success: false,
				error: `File not found: ${filePath}`
			};
			const originalCode = fileData.content;
			const fileId = fileData.id;
			const store = ensureV2(elements);
			const generatedJSX = generateJSX(store);
			const deps = extractComponentDependencies(store);
			if (internalComponent?.name) deps.delete(internalComponent.name);
			let index = { ...bodyIndex || {} };
			try {
				const projRes = await apiFetch(`/projects/${projectId}`);
				if (projRes.ok) {
					const proj = await projRes.json();
					if (proj.scanResult) index = {
						...proj.scanResult,
						...index
					};
				}
			} catch {}
			const iconImports = getIconImportMappings(extractIconDependencies(store));
			const componentImports = [...getComponentImportMappings(deps, index, void 0, { preferAlias: true }), ...iconImports];
			const importFinalizeOpts = {
				extraNames: deps,
				excludeNames: internalComponent?.name ? [internalComponent.name] : [],
				packageImports: iconImports
			};
			const validateFileCompilesRemote = async (code) => {
				const res = await apiFetch(`/projects/${projectId}/files/validate-compile`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						path: filePath,
						content: code
					})
				});
				if (res.ok) return { ok: true };
				let message = `Compile validation failed: ${res.status}`;
				try {
					const body = await res.json();
					if (body.error) message = body.error;
				} catch {}
				return {
					ok: false,
					message
				};
			};
			const mergedCode = await mergeWithClaude({
				originalCode,
				generatedJSX,
				componentImports,
				stateContext,
				userInstructions,
				internalComponentName: internalComponent?.name,
				internalComponentRange: internalComponent ? {
					startLine: internalComponent.startLine,
					endLine: internalComponent.endLine
				} : void 0,
				mode: ai.mode,
				provider: ai.provider,
				apiKey: ai.apiKey,
				model: ai.model,
				apiBaseUrl: ai.apiBaseUrl,
				apiTimeoutMs: ai.apiTimeoutMs,
				repair: (raw) => {
					return repairComponentImports(repairStripMarkdownCodeFences(raw), index, importFinalizeOpts);
				},
				validate: { validator: async (code) => {
					const notEmpty = validateNotEmpty(code);
					if (!notEmpty.ok) return notEmpty;
					const parses = validateParsesAsTsx(code);
					if (!parses.ok) return parses;
					const moduleShape = validateLooksLikeSourceModule(code);
					if (!moduleShape.ok) return moduleShape;
					const jsx = validateJsxComponentsResolved(code, {
						componentIndex: index,
						...importFinalizeOpts
					});
					if (!jsx.ok) return jsx;
					const hasExports = validateHasEsmExports(code);
					if (!hasExports.ok) return hasExports;
					return validateFileCompilesRemote(code);
				} }
			});
			const patchRes = await apiFetch(`/projects/${projectId}/files/${fileId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: mergedCode })
			});
			if (!patchRes.ok) {
				let error = `Failed to write file to API: ${patchRes.status}`;
				try {
					const body = await patchRes.json();
					if (body.error) error = body.error;
				} catch {}
				return {
					success: false,
					error
				};
			}
			console.log("[IPC] save_file: saved", filePath);
			const updatedInstanceProps = await resolveUpdatedInstanceProps({
				originalCode,
				mergedCode,
				stateContext,
				userInstructions,
				suggestInstanceProps,
				mode: ai.mode,
				provider: ai.provider,
				apiKey: ai.apiKey,
				model: ai.model,
				apiBaseUrl: ai.apiBaseUrl,
				apiTimeoutMs: ai.apiTimeoutMs
			});
			return {
				success: true,
				filePath,
				code: mergedCode,
				...updatedInstanceProps ? { instanceProps: updatedInstanceProps } : {}
			};
		} catch (error) {
			console.error("[IPC] save_file error:", error);
			if (error instanceof MergeValidationError) return {
				success: false,
				error: "The AI couldn't apply this edit to the component. Try again, or undo and make a smaller change."
			};
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	});
	electron.ipcMain.handle("ai_chat_title", (_, input) => generateChatTitle(input));
	electron.ipcMain.handle("ai_chat", async (event, args) => {
		const { projectId, messages, options, eventChannel } = args;
		const senderContents = event.sender;
		console.log(`[IPC] ai_chat: projectId=${projectId}, messages=${messages?.length}, channel=${eventChannel}`);
		let completed = false;
		const emit = (evt) => {
			if (evt.type === "done") completed = true;
			if (evt.type === "error") completed = false;
			if (!senderContents.isDestroyed()) senderContents.send(eventChannel, evt);
		};
		const allowedPaths = projectAllowedPaths.get(projectId) || [];
		setProjectAllowedPaths(projectId, allowedPaths);
		const activityKey = `chat:${crypto$1.randomUUID()}`;
		setProjectActivity(projectId, activityKey, true);
		try {
			const folders = await validatePromptFolders(options?.promptFolders);
			const chatTabId = options?.chatTabId;
			if (typeof chatTabId !== "string" || !chatTabId) throw new Error("An active chat is required.");
			await withPromptFolders(projectId, chatTabId, folders, () => handleChat({
				projectId,
				messages,
				options,
				emit,
				apiFetch,
				sessionId: typeof args.sessionId === "string" && args.sessionId ? args.sessionId : crypto$1.randomUUID(),
				localPaths: [.../* @__PURE__ */ new Set([...allowedPaths, ...folders])]
			}));
		} catch (error) {
			console.error("[IPC] ai_chat error:", error);
			emit({
				type: "error",
				error: String(error)
			});
		} finally {
			setProjectActivity(projectId, activityKey, false, completed && !isChatCancelled(projectId, options?.chatTabId));
		}
		return { success: true };
	});
	electron.ipcMain.handle("ai_chat_cancel", (_, args) => {
		if (args?.sessionId) cancelSession(args.sessionId);
		return { success: true };
	});
	electron.ipcMain.handle("claude:check-status", () => getClaudeStatus());
	electron.ipcMain.handle("claude:list-connections", (_, args) => listClaudeConnections(typeof args?.cwd === "string" ? args.cwd : void 0));
	electron.ipcMain.handle("claude:list-commands", (_, args) => listClaudeSlashCommands(typeof args?.cwd === "string" ? args.cwd : void 0));
	electron.ipcMain.handle("mcp_tool_approval", (_, args) => {
		const { approvalId, approved } = args;
		resolveApproval(approvalId, approved);
		return { success: true };
	});
	electron.ipcMain.handle("folder_access_response", (_, args) => {
		const { requestId, granted, path: path$35 } = args ?? {};
		if (typeof requestId !== "string") return { success: false };
		resolveFolderAccess(requestId, !!granted, typeof path$35 === "string" ? path$35 : void 0);
		return { success: true };
	});
	electron.ipcMain.handle("get_pending_deep_link", (event) => {
		const win = getWindowForContents(event.sender);
		if (win) {
			const id = pendingDeepLinkMap.get(win.id);
			if (id) {
				pendingDeepLinkMap.delete(win.id);
				return id;
			}
		}
		const id = pendingDeepLinkProjectId;
		pendingDeepLinkProjectId = null;
		return id;
	});
	registerTerminalIPC({ resolveAgentWorkspace: projectWorkspace });
}
function createWindow() {
	const existing = electron.BrowserWindow.getFocusedWindow();
	let x;
	let y;
	if (existing) {
		const [ex, ey] = existing.getPosition();
		x = ex + 30;
		y = ey + 30;
	}
	const win = new electron.BrowserWindow({
		width: 1400,
		minWidth: 1e3,
		height: 900,
		minHeight: 600,
		...x !== void 0 && y !== void 0 ? {
			x,
			y
		} : {},
		show: false,
		backgroundColor: electron.nativeTheme.shouldUseDarkColors ? "#242424" : "#f7f7f7",
		titleBarStyle: "hiddenInset",
		trafficLightPosition: {
			x: 12,
			y: 14
		},
		webPreferences: {
			preload: (0, path.join)(__dirname, "../preload/index.js"),
			sandbox: false,
			webSecurity: false,
			webviewTag: true
		}
	});
	windows.add(win);
	win.webContents.on("will-prevent-unload", quitLifecycle.closeCancelled);
	attachDesktopTabs(win, {
		preload: (0, path.join)(__dirname, "../preload/index.js"),
		rendererUrl: is.dev ? process.env["ELECTRON_RENDERER_URL"] : void 0,
		rendererFile: RENDERER_FILE,
		onCloseCancelled: quitLifecycle.closeCancelled,
		disposeProject: (projectId, contentsId) => {
			cancelSessionsForProject(projectId);
			releaseProject(projectId);
			disposeTerminalsForContents(contentsId);
			disposeAgentChatProject(projectId);
		}
	});
	win.on("closed", () => {
		closeWindowProjects(win);
		windows.delete(win);
		windowProjectMap.delete(win.id);
		disposeTerminalsForWindow(win.id);
	});
	win.webContents.on("did-start-navigation", (_e, _url, _isInPlace, isMainFrame) => {
		if (!isMainFrame) return;
		closeWindowProjects(win);
		disposeTerminalsForWindow(win.id);
	});
	let devToolsAutoOpened = false;
	win.on("ready-to-show", () => {
		if (win.isDestroyed()) return;
		win.show();
		if (is.dev && !devToolsAutoOpened) {
			devToolsAutoOpened = true;
			toggleActiveDevTools(win);
		}
	});
	win.webContents.on("before-input-event", (event, input) => {
		if (win.isDestroyed()) return;
		if (input.meta && input.alt && input.key.toLowerCase() === "i") {
			event.preventDefault();
			toggleActiveDevTools(win);
		}
	});
	win.webContents.on("will-navigate", (event, url$4) => {
		if (is.dev && url$4.startsWith(process.env["ELECTRON_RENDERER_URL"] || "")) return;
		event.preventDefault();
	});
	win.webContents.setWindowOpenHandler((details) => {
		electron.shell.openExternal(details.url);
		return { action: "deny" };
	});
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	else win.loadFile(RENDERER_FILE);
	return win;
}
/** An SF Symbol sized for a menu item, tinted like its text. None off macOS. */
function menuSymbol(name) {
	if (process.platform !== "darwin") return void 0;
	const image = electron.nativeImage.createFromNamedImage(name).resize({ height: 14 });
	image.setTemplateImage(true);
	return image;
}
function revealProfile(dir) {
	if (dir) electron.shell.showItemInFolder(dir);
}
function setupMenu() {
	const isMac = process.platform === "darwin";
	const template = [
		...isMac ? [{
			label: electron.app.name,
			submenu: [
				{ role: "about" },
				{
					label: "Check for Updates…",
					click: () => petalUpdater.checkNow()
				},
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" }
			]
		}] : [],
		{
			label: "File",
			submenu: [
				{
					label: "New File",
					click: (_item, win) => {
						if (win instanceof electron.BrowserWindow) createFileInActiveView(win);
					}
				},
				{
					label: "New Tab",
					accelerator: "CmdOrCtrl+T",
					click: (_item, win) => {
						if (win instanceof electron.BrowserWindow) openFilePalette(win);
					}
				},
				{
					label: "New Window",
					accelerator: "CmdOrCtrl+Shift+N",
					click: () => createWindow()
				},
				{ type: "separator" },
				...isMac ? [] : [{
					label: "Check for Updates…",
					click: () => petalUpdater.checkNow()
				}, { type: "separator" }],
				isMac ? { role: "close" } : { role: "quit" }
			]
		},
		{ role: "editMenu" },
		{
			label: "View",
			submenu: [
				{
					label: "Reload",
					click: (_item, win) => {
						if (win instanceof electron.BrowserWindow) reloadActiveView(win);
					}
				},
				{
					label: "Force Reload",
					accelerator: "CmdOrCtrl+Alt+R",
					click: (_item, win) => {
						if (win instanceof electron.BrowserWindow) reloadActiveView(win, true);
					}
				},
				{
					label: "Toggle Developer Tools",
					accelerator: isMac ? "Alt+Command+I" : "Ctrl+Shift+I",
					click: (_item, win) => {
						if (win instanceof electron.BrowserWindow) toggleActiveDevTools(win);
					}
				},
				{ type: "separator" },
				{
					role: "resetZoom",
					accelerator: "CmdOrCtrl+Alt+0"
				},
				{
					role: "zoomIn",
					accelerator: "CmdOrCtrl+Alt+Plus"
				},
				{
					role: "zoomOut",
					accelerator: "CmdOrCtrl+Alt+-"
				},
				{ type: "separator" },
				{ role: "togglefullscreen" }
			]
		},
		{ role: "windowMenu" },
		...PROFILING_ENABLED ? [{
			label: "Profiling",
			submenu: [{
				label: isStoppingRecording() ? "Stopping…" : isRecording() ? "Stop Recording" : "Start Recording",
				enabled: !isStoppingRecording(),
				icon: menuSymbol(isRecording() ? "stop.fill" : "play.fill"),
				click: () => {
					if (isRecording()) stopRecording().then(revealProfile).finally(() => setupMenu());
					else startRecording((contents) => isAppRendererPage(contents, contents.getURL()));
					setupMenu();
				}
			}]
		}] : []
	];
	electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}
async function launchExtensionBackgroundWorkers() {
	const ses = electron.session.defaultSession;
	await Promise.all(ses.getAllExtensions().map(async (extension) => {
		const manifest = extension.manifest;
		if (manifest.manifest_version === 3 && manifest.background?.service_worker) try {
			await ses.serviceWorkers.startWorkerForScope(extension.url);
		} catch (err) {
			console.warn("[DevTools] Failed to start extension worker:", err);
		}
	}));
}
async function installReactDevTools() {
	if (!is.dev) return;
	try {
		const { installExtension, REACT_DEVELOPER_TOOLS } = await import("electron-devtools-installer");
		const ext = await installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } });
		console.log(`[DevTools] Installed ${ext.name}`);
		await launchExtensionBackgroundWorkers();
	} catch (err) {
		console.error("[DevTools] Failed to install React DevTools:", err);
	}
}
electron.app.setPath("userData", process.env.PETAL_USER_DATA || (0, path.join)(electron.app.getPath("appData"), "com.petal.desktop"));
if (is.dev) electron.app.setPath("userData", (0, path.join)(electron.app.getPath("userData"), "dev"));
if (process.platform === "linux") {
	const isKde = (process.env["XDG_CURRENT_DESKTOP"] || "").toLowerCase().includes("kde");
	electron.app.commandLine.appendSwitch("password-store", isKde ? "kwallet6" : "gnome-libsecret");
}
authClient.setupMain({
	getWindow: () => getFocusedWindow(),
	csp: false,
	scheme: true,
	bridges: true
});
if (is.dev && process.defaultApp && process.argv.length >= 2) electron.app.setAsDefaultProtocolClient("com.petal.desktop", process.execPath, [(0, path.resolve)(process.argv[1])]);
function handleDeepLinkUrl(url$5) {
	if (url$5.includes("com.petal.desktop://github-connected")) {
		exchangeGitHubCode(new URL(url$5).searchParams.get("code")).finally(() => {
			const win = getFocusedWindow();
			if (win) {
				broadcastToRenderers("github-connected");
				win.focus();
			}
		});
		return;
	}
	if (url$5.includes("com.petal.desktop://figma-connected")) {
		const win = getFocusedWindow();
		if (win) {
			broadcastToRenderers("figma-connected");
			win.focus();
		}
		return;
	}
	if (url$5.includes("com.petal.desktop://figma-connect-failed")) {
		const win = getFocusedWindow();
		if (win) {
			broadcastToRenderers("figma-connect-failed");
			win.focus();
		}
		return;
	}
	const match = url$5.match(/com\.petal\.desktop:\/\/project\/([a-zA-Z0-9_-]+)/);
	if (!match) return;
	const projectId = match[1];
	const existing = findWindowForProject(projectId);
	if (existing) {
		if (existing.isMinimized()) existing.restore();
		focusProjectTab(projectId);
		return;
	}
	if (windows.size > 0) {
		const win = getFocusedWindow();
		openProjectTab(win, projectId).catch((error) => console.error("[Tabs] Failed to open deep link", error));
		win.show();
		win.focus();
		return;
	}
	pendingDeepLinkProjectId = projectId;
}
electron.app.on("open-url", (_event, url$6) => {
	handleDeepLinkUrl(url$6);
});
electron.app.on("second-instance", (_event, argv) => {
	const url$7 = argv.find((arg) => arg.startsWith("com.petal.desktop://"));
	if (url$7) handleDeepLinkUrl(url$7);
	else {
		const win = getFocusedWindow();
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	}
});
electron.app.whenReady().then(async () => {
	console.log(`[Electron] Process started. PID: ${process.pid}`);
	await startEmbeddedServer();
	electronApp.setAppUserModelId(is.dev ? "com.petal.desktop.dev" : "com.petal.desktop");
	if (is.dev && process.platform === "darwin") electron.app.dock?.setIcon((0, path.join)(__dirname, "../../build/icon.png"));
	await installReactDevTools();
	const launchUrl = process.argv.find((arg) => arg.startsWith("com.petal.desktop://"));
	if (launchUrl) handleDeepLinkUrl(launchUrl);
	electron.app.on("browser-window-created", (_, window) => {
		window.webContents.on("console-message", (_e, level, message, line, sourceId) => {
			if (level >= 2) console.error(`[Renderer] ${message}  (${sourceId}:${line})`);
		});
		optimizer.watchWindowShortcuts(window);
	});
	electron.app.on("web-contents-created", (_event, contents) => {
		contents.on("will-attach-webview", (_e, webPreferences) => {
			webPreferences.partition = WEBVIEW_PARTITION;
			webPreferences.preload = (0, path.join)(__dirname, "../preload/webview.js");
			webPreferences.contextIsolation = true;
			webPreferences.nodeIntegration = false;
			webPreferences.nodeIntegrationInSubFrames = false;
		});
		if (contents.getType() !== "webview") return;
		contents.setWindowOpenHandler((details) => {
			electron.shell.openExternal(details.url);
			return { action: "deny" };
		});
		contents.on("did-fail-load", (_e, code, desc, validatedURL) => {
			console.error(`[Webview] load failed ${code} ${desc} — ${validatedURL}`);
		});
	});
	electron.app.on("certificate-error", (event, _webContents, url$8, _error, _cert, callback) => {
		try {
			const { hostname } = new URL(url$8);
			if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
				event.preventDefault();
				callback(true);
				return;
			}
		} catch {}
		callback(false);
	});
	setupAuthCookieInjection();
	setupMediaPermissions();
	setupWebviewSession();
	setupAgentChat();
	startGitHubOAuthServer(() => {
		const win = getFocusedWindow();
		if (win) {
			broadcastToRenderers("github-connected");
			win.focus();
		}
	});
	mcpEvents.on("file_changed", (event) => {
		findContentsForProject(event.projectId)?.send("file_changed", event);
	});
	mcpEvents.on("file_deleted", (event) => {
		for (const win of electron.BrowserWindow.getAllWindows()) if (!win.isDestroyed()) win.webContents.send("file_deleted", event);
	});
	mcpEvents.on("settings_changed", (event) => {
		findContentsForProject(event.projectId)?.send("settings_changed", event);
	});
	mcpEvents.on("plan_limit", (event) => {
		findContentsForProject(event.projectId)?.send("plan_limit", event);
	});
	mcpEvents.on("tool_approval_needed", (event) => {
		findContentsForProject(event.projectId)?.send("mcp_tool_approval_needed", event);
	});
	registerIPC();
	armMcpStackFallback();
	setupMenu();
	if (!is.dev) {
		const pendingPath = (0, path.join)(electron.app.getPath("userData"), "pending-update.json");
		let pendingUpdateVersion = null;
		const isVersionNewer = (a, b) => {
			const parse = (v) => v.replace(/^v/i, "").split(".").map((p) => parseInt(p, 10) || 0);
			const pa = parse(a);
			const pb = parse(b);
			for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
				const da = pa[i] ?? 0;
				const db = pb[i] ?? 0;
				if (da !== db) return da > db;
			}
			return false;
		};
		const setPendingUpdate = (version) => {
			pendingUpdateVersion = version;
			try {
				if (version) fs.writeFileSync(pendingPath, JSON.stringify({ version }), "utf8");
				else fs.unlinkSync(pendingPath);
			} catch (err) {
				if (version) console.error("[AutoUpdate] Failed to persist pending update:", err);
			}
		};
		try {
			const data = JSON.parse(fs.readFileSync(pendingPath, "utf8"));
			if (typeof data.version === "string" && isVersionNewer(data.version, electron.app.getVersion())) {
				pendingUpdateVersion = data.version;
				console.log("[AutoUpdate] Restored pending update from disk:", pendingUpdateVersion);
			} else setPendingUpdate(null);
		} catch {}
		petalUpdater.logger = console;
		petalUpdater.autoDownload = true;
		petalUpdater.autoInstallOnAppQuit = true;
		petalUpdater.on("update-available", (info) => {
			console.log("[AutoUpdate] Update available:", info.version);
		});
		petalUpdater.on("update-downloaded", (info) => {
			console.log("[AutoUpdate] Update downloaded:", info.version);
			setPendingUpdate(info.version);
			broadcastToRenderers("update-downloaded", info.version);
		});
		petalUpdater.on("error", (err) => {
			console.error("[AutoUpdate] Error:", err.message);
		});
		electron.ipcMain.handle("get-pending-update", () => pendingUpdateVersion);
		electron.ipcMain.handle("install-update", () => {
			setPendingUpdate(null);
			petalUpdater.quitAndInstall();
		});
		createWindow();
		setTimeout(() => petalUpdater.checkForUpdates().catch(() => {}), 1e4);
		setInterval(() => petalUpdater.checkForUpdates().catch(() => {}), 18e5);
	} else createWindow();
	electron.app.on("activate", () => {
		if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
electron.app.on("before-quit", (event) => {
	if (finishProfilingBeforeQuit(event)) return;
	quitLifecycle.beforeQuit(event);
});
electron.app.on("will-quit", () => {
	cancelAllSessions();
	stopAgentChat();
	stopEmbeddedServer();
});
electron.app.on("window-all-closed", quitLifecycle.allWindowsClosed);

export { apiFetch };
