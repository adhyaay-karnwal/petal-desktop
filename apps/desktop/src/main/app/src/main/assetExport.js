// Reconstructed from index.js — original module: app/src/main/assetExport.ts
import { electron, node_crypto, node_fs_promises, node_path } from "../../../__bundle__/_preamble.js";

var EXPORT_SCHEME = "petal-export";
function validateSize(width, height) {
	if (![width, height].every((value) => Number.isFinite(value) && value >= 1 && value <= 32e3) || width * height > 64e6) throw new Error("Invalid export dimensions.");
}
function registerAssetExportIPC(isEditor) {
	const pending = /* @__PURE__ */ new Set();
	electron.ipcMain.handle("assets:pdf", async (event, input) => {
		if (!isEditor(event.sender)) throw new Error("Invalid export sender.");
		validateSize(input.width, input.height);
		if (typeof input.html !== "string" || input.html.length > 8e7) throw new Error("Export document is too large.");
		if (pending.has(event.sender.id)) throw new Error("A PDF export is already running.");
		pending.add(event.sender.id);
		const win = new electron.BrowserWindow({
			show: false,
			width: Math.min(8192, Math.ceil(input.width)),
			height: Math.min(8192, Math.ceil(input.height)),
			webPreferences: {
				sandbox: true,
				contextIsolation: true,
				nodeIntegration: false,
				webviewTag: false,
				partition: `asset-export-${event.sender.id}`,
				backgroundThrottling: false
			}
		});
		const session = win.webContents.session;
		const documentUrl = `${EXPORT_SCHEME}://document/${(0, node_crypto.randomUUID)()}`;
		let timer;
		try {
			win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
			session.protocol.handle(EXPORT_SCHEME, (request) => request.url === documentUrl ? new Response(input.html, { headers: { "content-type": "text/html; charset=utf-8" } }) : new Response(null, { status: 404 }));
			session.webRequest.onBeforeRequest((details, callback) => {
				callback({ cancel: details.url !== documentUrl && !details.url.startsWith("data:") && !details.url.startsWith("blob:") });
			});
			session.webRequest.onHeadersReceived((details, callback) => callback({ responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": ["default-src 'none'; img-src data: blob:; font-src data:; style-src 'unsafe-inline'"]
			} }));
			const work = async () => {
				await win.loadURL(documentUrl);
				await win.webContents.executeJavaScript(`Promise.all([document.fonts.ready, ...Array.from(document.images, image => image.decode())]).then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))`);
				return win.webContents.printToPDF({
					printBackground: true,
					displayHeaderFooter: false,
					preferCSSPageSize: true,
					pageSize: {
						width: input.width / 96,
						height: input.height / 96
					},
					margins: {
						top: 0,
						bottom: 0,
						left: 0,
						right: 0
					}
				});
			};
			return await Promise.race([work(), new Promise((_, reject) => {
				timer = setTimeout(() => reject(/* @__PURE__ */ new Error("PDF export timed out. Retry after images and fonts have loaded.")), 3e4);
			})]);
		} finally {
			clearTimeout(timer);
			pending.delete(event.sender.id);
			if (!win.isDestroyed()) win.destroy();
			if (session.protocol.isProtocolHandled(EXPORT_SCHEME)) session.protocol.unhandle(EXPORT_SCHEME);
		}
	});
	electron.ipcMain.handle("assets:capture-webview", async (event, input) => {
		if (!isEditor(event.sender)) throw new Error("Invalid export sender.");
		const guest = electron.webContents.fromId(input.id);
		if (!guest || guest.hostWebContents !== event.sender) throw new Error("Invalid embedded page.");
		const image = await guest.capturePage();
		if (image.isEmpty()) throw new Error("The embedded page is not ready to export.");
		return image.toDataURL();
	});
	electron.ipcMain.handle("assets:save", async (event, input) => {
		if (!isEditor(event.sender)) throw new Error("Invalid export sender.");
		const files = Object.entries(input.files ?? {});
		let totalBytes = 0;
		for (const [name, bytes] of files) {
			if ((0, node_path.basename)(name) !== name || !/\.(png|jpg|webp|avif|pdf)$/i.test(name) || !(bytes instanceof Uint8Array)) throw new Error("Invalid export file.");
			totalBytes += bytes.byteLength;
		}
		if (!files.length || totalBytes > 256e6) throw new Error("Invalid export file.");
		const parent = electron.BrowserWindow.fromWebContents(event.sender);
		if (!parent) throw new Error("The editor window has closed.");
		if (files.length === 1) {
			const [name, bytes] = files[0];
			const extension = name.split(".").pop();
			const result = await electron.dialog.showSaveDialog(parent, {
				defaultPath: name,
				filters: [{
					name: extension.toUpperCase(),
					extensions: [extension]
				}]
			});
			if (result.canceled || !result.filePath) return false;
			await (0, node_fs_promises.writeFile)(result.filePath, bytes);
			return true;
		}
		const result = await electron.dialog.showOpenDialog(parent, {
			title: "Export to folder",
			buttonLabel: "Export",
			properties: ["openDirectory", "createDirectory"]
		});
		const folder = result.filePaths[0];
		if (result.canceled || !folder) return false;
		for (const [name, bytes] of files) await (0, node_fs_promises.writeFile)((0, node_path.join)(folder, name), bytes);
		return true;
	});
}

export { registerAssetExportIPC };
