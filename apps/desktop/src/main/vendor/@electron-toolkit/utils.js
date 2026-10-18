// Reconstructed from index.js — original module: vendor/@electron-toolkit/utils
import { electron } from "../../__bundle__/_preamble.js";

var is = { dev: !electron.app.isPackaged };
var platform = {
	isWindows: process.platform === "win32",
	isMacOS: process.platform === "darwin",
	isLinux: process.platform === "linux"
};
var electronApp = {
	setAppUserModelId(id) {
		if (platform.isWindows) electron.app.setAppUserModelId(is.dev ? process.execPath : id);
	},
	setAutoLaunch(auto) {
		if (platform.isLinux) return false;
		const isOpenAtLogin = () => {
			return electron.app.getLoginItemSettings().openAtLogin;
		};
		if (isOpenAtLogin() !== auto) {
			electron.app.setLoginItemSettings({ openAtLogin: auto });
			return isOpenAtLogin() === auto;
		} else return true;
	},
	skipProxy() {
		return electron.session.defaultSession.setProxy({ mode: "direct" });
	}
};
var optimizer = {
	watchWindowShortcuts(window, shortcutOptions) {
		if (!window) return;
		const { webContents } = window;
		const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
		webContents.on("before-input-event", (event, input) => {
			if (input.type === "keyDown") {
				if (!is.dev) {
					if (input.code === "KeyR" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) event.preventDefault();
				} else if (input.code === "F12") {
					if (webContents.isDevToolsOpened()) webContents.closeDevTools();
					else {
						webContents.openDevTools({ mode: "undocked" });
						console.log("Open dev tool...");
					}
				}
				if (escToCloseWindow) {
					if (input.code === "Escape" && input.key !== "Process") {
						window.close();
						event.preventDefault();
					}
				}
				if (!zoom) {
					if (input.code === "Minus" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "Equal" && input.shift && (input.control || input.meta)) event.preventDefault();
				}
			}
		});
	},
	registerFramelessWindowIpc() {
		electron.ipcMain.on("win:invoke", (event, action) => {
			const win = electron.BrowserWindow.fromWebContents(event.sender);
			if (win) {
				if (action === "show") win.show();
				else if (action === "showInactive") win.showInactive();
				else if (action === "min") win.minimize();
				else if (action === "max") {
					if (win.isMaximized()) win.unmaximize();
					else win.maximize();
				} else if (action === "close") win.close();
			}
		});
	}
};

export { electronApp, is, optimizer };
