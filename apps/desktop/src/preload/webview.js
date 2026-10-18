let electron = require("electron");
//#region src/preload/webview.ts
/**
* Preload of every canvas Live Preview `<webview>` (set by main in
* `will-attach-webview`). It runs in the guest's isolated world (Electron's
* context-isolation world, id 999), which the page cannot reach. The host runs
* the preview's pick script in that same world (`webview_execute_isolated`),
* and the script reports to the host through `__lgHost.send`, so a page cannot
* forge a pick by logging or calling anything.
*/
Object.assign(globalThis, { __lgHost: {
	/** Arrives on the host's `<webview>` as an `ipc-message` event. */
	send: (channel, ...args) => electron.ipcRenderer.sendToHost(channel, ...args),
	/** Runs `code` in the page's own world (React fibers live there) and resolves with its result. */
	inPage: (code) => electron.webFrame.executeJavaScript(code)
} });
//#endregion
