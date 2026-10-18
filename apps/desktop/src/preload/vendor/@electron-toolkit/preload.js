// Reconstructed from index.js — original module: vendor/@electron-toolkit/preload
import { electron } from "../../__bundle__/_tail.js";

var electronAPI = {
	ipcRenderer: {
		send(channel, ...args) {
			electron.ipcRenderer.send(channel, ...args);
		},
		sendTo(webContentsId, channel, ...args) {
			const electronVer = process.versions.electron;
			if ((electronVer ? parseInt(electronVer.split(".")[0]) : 0) >= 28) throw new Error("\"sendTo\" method has been removed since Electron 28.");
			else electron.ipcRenderer.sendTo(webContentsId, channel, ...args);
		},
		sendSync(channel, ...args) {
			return electron.ipcRenderer.sendSync(channel, ...args);
		},
		sendToHost(channel, ...args) {
			electron.ipcRenderer.sendToHost(channel, ...args);
		},
		postMessage(channel, message, transfer) {
			electron.ipcRenderer.postMessage(channel, message, transfer);
		},
		invoke(channel, ...args) {
			return electron.ipcRenderer.invoke(channel, ...args);
		},
		on(channel, listener) {
			electron.ipcRenderer.on(channel, listener);
			return () => {
				electron.ipcRenderer.removeListener(channel, listener);
			};
		},
		once(channel, listener) {
			electron.ipcRenderer.once(channel, listener);
			return () => {
				electron.ipcRenderer.removeListener(channel, listener);
			};
		},
		removeListener(channel, listener) {
			electron.ipcRenderer.removeListener(channel, listener);
			return this;
		},
		removeAllListeners(channel) {
			electron.ipcRenderer.removeAllListeners(channel);
		}
	},
	webFrame: {
		insertCSS(css) {
			return electron.webFrame.insertCSS(css);
		},
		setZoomFactor(factor) {
			if (typeof factor === "number" && factor > 0) electron.webFrame.setZoomFactor(factor);
		},
		setZoomLevel(level) {
			if (typeof level === "number") electron.webFrame.setZoomLevel(level);
		}
	},
	webUtils: { getPathForFile(file) {
		return electron.webUtils.getPathForFile(file);
	} },
	process: {
		get platform() {
			return process.platform;
		},
		get versions() {
			return process.versions;
		},
		get env() {
			return { ...process.env };
		}
	}
};

export { electronAPI };
