// Reconstructed from index.js — original module: app/src/preload/index.ts
import { electron } from "../../../__bundle__/_tail.js";
import { electronAPI } from "../../../vendor/@electron-toolkit/preload.js";
import { setupRenderer } from "../../../vendor/@better-auth/electron.js";

setupRenderer();
if (process.isMainFrame) window.addEventListener("DOMContentLoaded", () => {
	const root = document.documentElement;
	let lastColor = "";
	const syncBackground = () => {
		const color = getComputedStyle(root).getPropertyValue("--ed-background").trim();
		if (!/^#[\da-f]{6}$/i.test(color) || color === lastColor) return;
		lastColor = color;
		electron.ipcRenderer.send("window:set-background-color", color);
	};
	syncBackground();
	const observer = new MutationObserver(syncBackground);
	observer.observe(root, {
		attributes: true,
		attributeFilter: ["class"]
	});
	window.addEventListener("unload", () => observer.disconnect(), { once: true });
}, { once: true });
var petalAPI = {
	getPathForFile: (file) => electron.webUtils.getPathForFile(file),
	invoke: (channel, args) => {
		return electron.ipcRenderer.invoke(channel, args);
	},
	send: (channel, ...args) => {
		electron.ipcRenderer.send(channel, ...args);
	},
	on: (channel, callback) => {
		const listener = (_event, ...args) => callback(...args);
		electron.ipcRenderer.on(channel, listener);
		return () => {
			electron.ipcRenderer.removeListener(channel, listener);
		};
	},
	getApiUrl: () => electron.ipcRenderer.invoke("get:api-url"),
	getWebUrl: () => electron.ipcRenderer.invoke("get:web-url"),
	getMcpInfo: (options) => electron.ipcRenderer.invoke("get:mcp-info", options),
	/** Tell main which MCP stack the resolved agents-v2 flag selected. */
	setMcpStack: (agentsV2) => electron.ipcRenderer.send("set_mcp_stack", { agentsV2 })
};
if (process.contextIsolated) try {
	electron.contextBridge.exposeInMainWorld("electron", electronAPI);
	electron.contextBridge.exposeInMainWorld("api", petalAPI);
} catch (error) {
	console.error(error);
}
else {
	window.electron = electronAPI;
	window.api = petalAPI;
}

