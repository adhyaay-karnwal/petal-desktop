// Reconstructed from index.js — original module: packages/ai/src/protocol.ts
import { electron } from "../../../__bundle__/_preamble.js";

var AGENT_CHAT_START_CHANNEL = "agent_chat_start";
var AGENT_CHAT_STREAM_CHANNEL = "agent_chat_stream";
var AGENT_CHAT_ABORT_CHANNEL = "agent_chat_abort";
var AGENT_CHAT_STEER_CHANNEL = "agent_chat_steer";
var AGENT_CHAT_DROP_TAB_CHANNEL = "agent_chat_drop_tab";
var AGENT_CHAT_LIST_AGENTS_CHANNEL = "agent_chat_list_agents";
var AGENT_CHAT_LIST_MODELS_CHANNEL = "agent_chat_list_models";
var AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL = "agent_chat_list_slash_commands";
var AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL = "agent_chat_list_mcp_servers";
var AGENT_CHAT_CHECK_STATUS_CHANNEL = "agent_chat_check_status";
var AGENT_CHAT_GENERATE_TITLE_CHANNEL = "agent_chat_generate_title";
var AGENT_CHAT_LOGIN_CHANNEL = "agent_chat_login";
var AGENT_CHAT_LOGOUT_CHANNEL = "agent_chat_logout";
/** Active project only. Never use this map to route project operations. */
var windowProjectMap = /* @__PURE__ */ new Map();
var projects = /* @__PURE__ */ new Map();
var pendingCloses = /* @__PURE__ */ new Map();
var pendingOpens = /* @__PURE__ */ new Map();
var pendingSelections = /* @__PURE__ */ new Map();
var rendererReady = /* @__PURE__ */ new Map();
var windowOptions = /* @__PURE__ */ new Map();
/** Per window, stops watching file views for the press that ends a tab rename. */
var renameWatchers = /* @__PURE__ */ new Map();
var lastFocusedWindowId = null;
/**
* Background tabs stay visible (see layout), so a file's editor never sees
* itself hidden: ask it to capture its thumbnail when it's left or closed. A
* capture of a very large file takes a few seconds; the cap keeps a stuck one
* from holding a closed renderer alive. The tab leaves the bar before this
* wait, so closing still feels instant.
*/
var THUMBNAIL_FLUSH_TIMEOUT_MS = 1e4;
var thumbnailFlushSeq = 0;
function flushThumbnail(tab) {
	const contents = tab.view.webContents;
	if (contents.isDestroyed() || !tab.loaded) return Promise.resolve();
	const requestId = `${tab.projectId}:${++thumbnailFlushSeq}`;
	return new Promise((resolve) => {
		const done = () => {
			clearTimeout(timer);
			electron.ipcMain.removeListener("desktop_tab_thumbnail_flushed", onReply);
			contents.removeListener("destroyed", done);
			resolve();
		};
		const onReply = (event, id) => {
			if (event.sender === contents && id === requestId) done();
		};
		const timer = setTimeout(done, THUMBNAIL_FLUSH_TIMEOUT_MS);
		electron.ipcMain.on("desktop_tab_thumbnail_flushed", onReply);
		contents.once("destroyed", done);
		contents.send("desktop_tab_flush_thumbnail", requestId);
	});
}
function findWindowForProject(projectId) {
	const tab = projects.get(projectId);
	return tab && !tab.window.isDestroyed() ? tab.window : null;
}
function findContentsForProject(projectId) {
	const contents = projects.get(projectId)?.view.webContents;
	return contents && !contents.isDestroyed() ? contents : null;
}
function getProjectForContents(contents) {
	for (const tab of projects.values()) if (tab.view.webContents === contents) return tab.projectId;
	return null;
}
function getTabNameForContents(contents) {
	for (const tab of projects.values()) if (tab.view.webContents === contents) return tab.name;
	return null;
}
function getWindowForContents(contents) {
	const projectId = getProjectForContents(contents);
	return (projectId ? findWindowForProject(projectId) : null) ?? electron.BrowserWindow.fromWebContents(contents);
}
function getOpenProjectIds() {
	return [...projects.keys()].filter((id) => !!findContentsForProject(id));
}
/** Selection inside the owning window does not depend on OS foreground focus. */
function isProjectTabSelected(projectId) {
	const win = findWindowForProject(projectId);
	return !!win && windowProjectMap.get(win.id) === projectId;
}
/** Apply an API-confirmed rename without changing tab selection or permissions. */
function updateProjectTabName(projectId, name) {
	const tab = projects.get(projectId);
	if (!tab || !name.trim()) return;
	tab.name = name;
	publish$1(tab.window);
}
function getActiveProjectId() {
	const focused = electron.BrowserWindow.getFocusedWindow();
	if (focused && windowOptions.has(focused.id)) lastFocusedWindowId = focused.id;
	return lastFocusedWindowId === null ? null : windowProjectMap.get(lastFocusedWindowId) ?? null;
}
/** Last-used desktop host, including Home when no project is open. */
function getDesktopWindow() {
	const focused = electron.BrowserWindow.getFocusedWindow();
	if (focused && windowOptions.has(focused.id) && !focused.isDestroyed()) return focused;
	if (lastFocusedWindowId !== null) {
		const last = electron.BrowserWindow.fromId(lastFocusedWindowId);
		if (last && windowOptions.has(last.id) && !last.isDestroyed()) return last;
	}
	for (const id of windowOptions.keys()) {
		const win = electron.BrowserWindow.fromId(id);
		if (win && !win.isDestroyed()) return win;
	}
	return null;
}
function getWindowProjectIds(windowId) {
	return [...projects.values()].filter((tab) => tab.window.id === windowId).map((tab) => tab.projectId);
}
function broadcastToRenderers(channel, payload) {
	for (const windowId of windowOptions.keys()) {
		const win = electron.BrowserWindow.fromId(windowId);
		if (win && !win.webContents.isDestroyed()) win.webContents.send(channel, payload);
	}
	for (const tab of projects.values()) if (!tab.view.webContents.isDestroyed()) tab.view.webContents.send(channel, payload);
}
function snapshot(win) {
	return {
		activeProjectId: pendingSelections.get(win.id) ?? windowProjectMap.get(win.id) ?? null,
		tabs: [...projects.values()].filter((tab) => tab.window === win && !tab.closing).map((tab) => ({
			projectId: tab.projectId,
			name: tab.name,
			canRename: tab.canRename,
			loading: !tab.loaded,
			working: tab.activity.size > 0,
			hasUnreadCompletion: tab.hasUnreadCompletion
		}))
	};
}
function publish$1(win) {
	if (!win.isDestroyed() && !win.webContents.isDestroyed()) win.webContents.send("desktop_tabs_changed", snapshot(win));
}
function setProjectActivity(projectId, key, working, completed = false) {
	const tab = projects.get(projectId);
	if (!tab) return;
	const before = tab.activity.size > 0;
	const unreadBefore = tab.hasUnreadCompletion;
	if (working) tab.activity.add(key);
	else if (tab.activity.delete(key) && completed && windowProjectMap.get(tab.window.id) !== projectId) tab.hasUnreadCompletion = true;
	if (before !== tab.activity.size > 0 || unreadBefore !== tab.hasUnreadCompletion) publish$1(tab.window);
}
function layout(win) {
	if (win.isDestroyed()) return;
	const [width, height] = win.getContentSize();
	const visibleProjectId = pendingSelections.get(win.id) ?? windowProjectMap.get(win.id);
	for (const tab of projects.values()) {
		if (tab.window !== win) continue;
		tab.view.setBounds({
			x: visibleProjectId === tab.projectId ? 0 : -width,
			y: 42,
			width,
			height: Math.max(1, height - 42)
		});
		tab.view.setVisible(true);
	}
}
/** A project view's palette can't reach the tab bar above it; the host dims that strip to match. */
function dimTabBar(win, dimmed) {
	if (!win.isDestroyed() && !win.webContents.isDestroyed()) win.webContents.send("desktop_tab_bar_dimmed", dimmed);
}
function selectProjectTab(win, projectId) {
	const selectedTab = projectId ? projects.get(projectId) : void 0;
	if (projectId && selectedTab?.window !== win) return;
	if (selectedTab && !selectedTab.loaded) return;
	pendingSelections.delete(win.id);
	dimTabBar(win, false);
	const leftTab = projects.get(windowProjectMap.get(win.id) ?? "");
	if (leftTab && leftTab !== selectedTab && !leftTab.closing) flushThumbnail(leftTab);
	if (selectedTab) {
		windowProjectMap.set(win.id, selectedTab.projectId);
		selectedTab.hasUnreadCompletion = false;
	} else windowProjectMap.delete(win.id);
	layout(win);
	publish$1(win);
	if (projectId) findContentsForProject(projectId)?.focus();
	else win.webContents.focus();
}
/** Where View-menu actions land: the selected project view, or the host renderer on Home. */
function activeContents(win) {
	const projectId = windowProjectMap.get(win.id);
	return projectId && findContentsForProject(projectId) || win.webContents;
}
function reloadActiveView(win, ignoreCache = false) {
	const contents = activeContents(win);
	if (ignoreCache) contents.reloadIgnoringCache();
	else contents.reload();
}
/** Project views paint over the host renderer, so host DevTools must detach to stay visible. */
function toggleActiveDevTools(win) {
	const pendingProjectId = pendingSelections.get(win.id);
	const contents = pendingProjectId && findContentsForProject(pendingProjectId) || activeContents(win);
	if (contents.isDevToolsOpened()) contents.closeDevTools();
	else if (pendingProjectId || contents === win.webContents) contents.openDevTools({ mode: "detach" });
	else contents.openDevTools();
}
/** Tab-bar clicks and menu accelerators land elsewhere; keys must reach the renderer that acts. */
function focusAndSend(win, channel) {
	const contents = activeContents(win);
	contents.send(channel);
	contents.focus();
}
function openFilePalette(win) {
	focusAndSend(win, "desktop_open_file_palette");
}
function createFileInActiveView(win) {
	focusAndSend(win, "desktop_new_file");
}
function focusProjectTab(projectId) {
	const win = findWindowForProject(projectId);
	if (!win) return;
	selectProjectTab(win, projectId);
	if (win.isMinimized()) win.restore();
	win.show();
	win.focus();
}
/** The nearest loaded, open tab before `ids[index]`, else after it. */
function neighbourTab(ids, index) {
	const selectable = (id) => projects.get(id)?.loaded && !projects.get(id)?.closing;
	return ids.slice(0, index).reverse().find(selectable) ?? ids.slice(index + 1).find(selectable) ?? null;
}
function removeProject(tab) {
	if (projects.get(tab.projectId) !== tab) return;
	rendererReady.get(tab.projectId)?.reject(/* @__PURE__ */ new Error("File closed while opening"));
	const ids = getWindowProjectIds(tab.window.id);
	const index = ids.indexOf(tab.projectId);
	windowOptions.get(tab.window.id)?.disposeProject(tab.projectId, tab.contentsId);
	projects.delete(tab.projectId);
	if (pendingSelections.get(tab.window.id) === tab.projectId) pendingSelections.delete(tab.window.id);
	if (!tab.window.isDestroyed()) {
		tab.window.contentView.removeChildView(tab.view);
		if (windowProjectMap.get(tab.window.id) === tab.projectId) selectProjectTab(tab.window, neighbourTab(ids, index));
		else {
			layout(tab.window);
			publish$1(tab.window);
		}
	}
}
function closeWindowProjects(win) {
	for (const id of getWindowProjectIds(win.id)) {
		const tab = projects.get(id);
		removeProject(tab);
		if (!tab.view.webContents.isDestroyed()) tab.view.webContents.close();
	}
	windowProjectMap.delete(win.id);
}
function attachDesktopTabs(win, options) {
	windowOptions.set(win.id, options);
	if (electron.BrowserWindow.getFocusedWindow() === win) lastFocusedWindowId = win.id;
	win.on("focus", () => {
		lastFocusedWindowId = win.id;
	});
	win.on("resize", () => layout(win));
	let closingWindow = false;
	win.on("close", (event) => {
		const ids = getWindowProjectIds(win.id);
		if (ids.length === 0) return;
		event.preventDefault();
		if (closingWindow) return;
		closingWindow = true;
		(async () => {
			for (const id of ids) {
				const tab = projects.get(id);
				if (tab && !await requestCloseProjectTab(tab)) {
					options.onCloseCancelled?.();
					return;
				}
			}
			win.close();
		})().finally(() => {
			closingWindow = false;
		});
	});
	win.on("closed", () => {
		closeWindowProjects(win);
		windowOptions.delete(win.id);
		if (lastFocusedWindowId === win.id) lastFocusedWindowId = null;
	});
}
function openProjectTab(win, projectId, focusChat = false, name = "File") {
	if (pendingOpens.has(projectId)) return pendingOpens.get(projectId);
	const existing = projects.get(projectId);
	if (existing?.closing) {
		existing.closing = false;
		selectProjectTab(existing.window, projectId);
	}
	if (existing) {
		focusProjectTab(projectId);
		return Promise.resolve();
	}
	const options = windowOptions.get(win.id);
	if (!options) throw new Error("Desktop window is not ready");
	const view = new electron.WebContentsView({ webPreferences: {
		preload: options.preload,
		sandbox: false,
		webSecurity: false,
		webviewTag: true,
		backgroundThrottling: false
	} });
	view.setBackgroundColor(electron.nativeTheme.shouldUseDarkColors ? "#242424" : "#f7f7f7");
	const tab = {
		projectId,
		name,
		canRename: false,
		window: win,
		view,
		contentsId: view.webContents.id,
		activity: /* @__PURE__ */ new Set(),
		hasUnreadCompletion: false,
		loaded: false,
		closing: false
	};
	projects.set(projectId, tab);
	pendingSelections.set(win.id, projectId);
	layout(win);
	win.contentView.addChildView(view);
	publish$1(win);
	view.webContents.on("destroyed", () => removeProject(tab));
	view.webContents.on("render-process-gone", () => {
		options.disposeProject(projectId, view.webContents.id);
		if (windowProjectMap.get(win.id) === projectId) dimTabBar(win, false);
		tab.activity.clear();
		tab.hasUnreadCompletion = false;
		publish$1(win);
	});
	view.webContents.on("did-start-navigation", (_event, _url, _inPlace, mainFrame) => {
		if (!mainFrame) return;
		options.disposeProject(projectId, view.webContents.id);
		if (windowProjectMap.get(win.id) === projectId) dimTabBar(win, false);
		tab.activity.clear();
		tab.hasUnreadCompletion = false;
		publish$1(win);
	});
	view.webContents.setWindowOpenHandler(({ url }) => {
		electron.shell.openExternal(url);
		return { action: "deny" };
	});
	view.webContents.on("will-navigate", (event, url) => {
		if (!options.rendererUrl || !url.startsWith(options.rendererUrl)) event.preventDefault();
	});
	view.webContents.on("before-input-event", (event, input) => {
		if (!(process.platform === "darwin" ? input.meta : input.control) || input.type !== "keyDown") return;
		if (input.key.toLowerCase() === "w") {
			event.preventDefault();
			requestCloseProjectTab(tab);
		}
		if (input.alt && input.key.toLowerCase() === "i") {
			event.preventDefault();
			view.webContents.toggleDevTools();
		}
	});
	const query = {
		projectTab: projectId,
		...focusChat ? { focusChat: "1" } : {}
	};
	let readyTimeout;
	const ready = new Promise((resolve, reject) => {
		rendererReady.set(projectId, {
			resolve,
			reject
		});
		readyTimeout = setTimeout(() => reject(/* @__PURE__ */ new Error("File did not finish loading")), 6e4);
	});
	const load = options.rendererUrl ? view.webContents.loadURL(`${options.rendererUrl}?${new URLSearchParams(query)}`) : view.webContents.loadFile(options.rendererFile, { query });
	const opened = Promise.all([load, ready]).then(() => {
		if (projects.get(projectId) !== tab || win.isDestroyed()) throw new Error("File closed while opening");
		tab.loaded = true;
		if (pendingSelections.get(win.id) === projectId) selectProjectTab(win, projectId);
		else publish$1(win);
	}).catch((error) => {
		removeProject(tab);
		if (!view.webContents.isDestroyed()) view.webContents.close();
		throw error;
	}).finally(() => {
		clearTimeout(readyTimeout);
		rendererReady.delete(projectId);
		pendingOpens.delete(projectId);
	});
	pendingOpens.set(projectId, opened);
	return opened;
}
function requestCloseProjectTab(tab) {
	const pending = pendingCloses.get(tab.projectId);
	if (pending) return pending;
	const closing = closeProjectTab(tab).finally(() => pendingCloses.delete(tab.projectId));
	pendingCloses.set(tab.projectId, closing);
	return closing;
}
async function closeProjectTab(tab) {
	if (tab.activity.size > 0) {
		const { response } = await electron.dialog.showMessageBox(tab.window, {
			type: "question",
			message: `Close ${tab.name}?`,
			detail: "Agents are still working in this file. Closing it will stop them.",
			buttons: ["Keep open", "Stop agents and close"],
			defaultId: 0,
			cancelId: 0
		});
		if (response !== 1) return false;
	}
	const contents = tab.view.webContents;
	if (contents.isDestroyed()) return true;
	tab.closing = true;
	if (windowProjectMap.get(tab.window.id) === tab.projectId) {
		const ids = getWindowProjectIds(tab.window.id);
		selectProjectTab(tab.window, neighbourTab(ids, ids.indexOf(tab.projectId)));
	} else publish$1(tab.window);
	await flushThumbnail(tab);
	if (!tab.closing) return false;
	if (contents.isDestroyed()) return true;
	return new Promise((resolve) => {
		const finish = (closed) => {
			contents.removeListener("destroyed", destroyed);
			contents.removeListener("will-prevent-unload", prevented);
			resolve(closed);
		};
		const destroyed = () => finish(true);
		const prevented = async () => {
			const { response } = await electron.dialog.showMessageBox(tab.window, {
				type: "warning",
				message: `${tab.name} has unsaved changes`,
				detail: "Keep the file open to let saving finish, or discard the unsaved changes.",
				buttons: ["Keep open", "Discard and close"],
				defaultId: 0,
				cancelId: 0
			});
			if (response === 1 && !contents.isDestroyed()) contents.close();
			else {
				tab.closing = false;
				selectProjectTab(tab.window, tab.projectId);
				finish(false);
			}
		};
		contents.once("destroyed", destroyed);
		contents.once("will-prevent-unload", prevented);
		contents.close({ waitForBeforeUnload: true });
	});
}
function registerDesktopTabsIPC() {
	electron.ipcMain.handle("desktop_tabs_ready", (event) => {
		const projectId = getProjectForContents(event.sender);
		if (projectId) rendererReady.get(projectId)?.resolve();
	});
	electron.ipcMain.handle("desktop_tabs_get", (event) => {
		const win = getWindowForContents(event.sender);
		return win ? snapshot(win) : {
			tabs: [],
			activeProjectId: null
		};
	});
	electron.ipcMain.handle("desktop_tabs_open", (event, args) => {
		const win = getWindowForContents(event.sender);
		if (win && typeof args?.projectId === "string" && args.projectId) return openProjectTab(win, args.projectId, args.focusChat, typeof args.name === "string" && args.name.trim() ? args.name : void 0);
		throw new Error("Could not open file: invalid window or project");
	});
	electron.ipcMain.handle("desktop_tabs_pick", (event) => {
		const win = getWindowForContents(event.sender);
		if (win) openFilePalette(win);
	});
	electron.ipcMain.handle("desktop_palette_state", (event, args) => {
		const win = getWindowForContents(event.sender);
		if (win && getProjectForContents(event.sender) && activeContents(win) === event.sender) dimTabBar(win, args.open === true);
	});
	electron.ipcMain.handle("desktop_palette_dismiss", (event) => {
		const win = getWindowForContents(event.sender);
		if (!win) return;
		activeContents(win).send("desktop_close_file_palette");
		dimTabBar(win, false);
	});
	electron.ipcMain.handle("desktop_tabs_select", (event, args) => {
		const win = getWindowForContents(event.sender);
		if (win) selectProjectTab(win, args.projectId);
	});
	electron.ipcMain.handle("desktop_tabs_close", async (event, args) => {
		const tab = projects.get(args.projectId);
		if (tab && tab.window === getWindowForContents(event.sender)) await requestCloseProjectTab(tab);
	});
	electron.ipcMain.handle("desktop_tab_bar_renaming", (event, active) => {
		const win = getWindowForContents(event.sender);
		if (!win) return;
		renameWatchers.get(win.id)?.();
		if (active !== true) return;
		win.webContents.focus();
		const views = [...projects.values()].filter((tab) => tab.window === win).map((tab) => tab.view.webContents);
		let pressed = false;
		const detach = () => {
			for (const [contents, listener] of listeners) if (!contents.isDestroyed()) contents.off("before-mouse-event", listener);
		};
		const listeners = new Map(views.map((contents) => [contents, (mouseEvent, input) => {
			if (!pressed && input.type !== "mouseDown") return;
			mouseEvent.preventDefault();
			if (input.type === "mouseUp") detach();
			if (input.type !== "mouseDown" || pressed) return;
			pressed = true;
			renameWatchers.delete(win.id);
			contents.focus();
			if (!win.webContents.isDestroyed()) win.webContents.send("desktop_tab_bar_blur");
		}]));
		for (const [contents, listener] of listeners) contents.on("before-mouse-event", listener);
		renameWatchers.set(win.id, () => {
			renameWatchers.delete(win.id);
			if (!pressed) detach();
		});
	});
	electron.ipcMain.handle("desktop_tabs_update", (event, args) => {
		const id = getProjectForContents(event.sender);
		const tab = id ? projects.get(id) : void 0;
		if (!tab || typeof args.name !== "string" || !args.name.trim()) return;
		tab.name = args.name;
		tab.canRename = args.canRename === true;
		publish$1(tab.window);
	});
	electron.ipcMain.handle("desktop_tabs_sign_out", () => {
		for (const id of windowOptions.keys()) {
			const win = electron.BrowserWindow.fromId(id);
			if (win) closeWindowProjects(win);
		}
		broadcastToRenderers("desktop_signed_out");
	});
}

export { AGENT_CHAT_ABORT_CHANNEL, AGENT_CHAT_CHECK_STATUS_CHANNEL, AGENT_CHAT_DROP_TAB_CHANNEL, AGENT_CHAT_GENERATE_TITLE_CHANNEL, AGENT_CHAT_LIST_AGENTS_CHANNEL, AGENT_CHAT_LIST_MCP_SERVERS_CHANNEL, AGENT_CHAT_LIST_MODELS_CHANNEL, AGENT_CHAT_LIST_SLASH_COMMANDS_CHANNEL, AGENT_CHAT_LOGIN_CHANNEL, AGENT_CHAT_LOGOUT_CHANNEL, AGENT_CHAT_START_CHANNEL, AGENT_CHAT_STEER_CHANNEL, AGENT_CHAT_STREAM_CHANNEL, attachDesktopTabs, broadcastToRenderers, closeWindowProjects, createFileInActiveView, findContentsForProject, findWindowForProject, focusProjectTab, getActiveProjectId, getDesktopWindow, getOpenProjectIds, getProjectForContents, getTabNameForContents, getWindowForContents, isProjectTabSelected, openFilePalette, openProjectTab, registerDesktopTabsIPC, reloadActiveView, setProjectActivity, toggleActiveDevTools, updateProjectTabName, windowProjectMap };
