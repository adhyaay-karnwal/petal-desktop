// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/exportAssets.ts
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { exportDimensions, exportDocument, exportFilename, exportLayerName, exportSettingsOf, fitExportScale, resolveExportScale } from "./assetExport.js";
import { __bundled__mapDeps$chunk1 } from "../../../../../__bundle__/_tail.js";
import { captureAsset, getExportBridge, withExportTimeout } from "./assetExportCapture.js";

async function rasterize(snapshot, scale, white) {
	const { width, height } = exportDimensions(snapshot.width, snapshot.height, scale);
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", String(snapshot.width));
	svg.setAttribute("height", String(snapshot.height));
	const foreign = document.createElementNS(svg.namespaceURI, "foreignObject");
	foreign.setAttribute("width", "100%");
	foreign.setAttribute("height", "100%");
	const content = document.createElement("div");
	content.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
	content.style.cssText = `position:relative;width:${snapshot.width}px;height:${snapshot.height}px;overflow:hidden;`;
	content.innerHTML = snapshot.html;
	foreign.append(content);
	svg.append(foreign);
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
	await withExportTimeout(image.decode());
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not create the export image.");
	if (white) {
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, width, height);
	}
	ctx.drawImage(image, 0, 0, width, height);
	return canvas;
}
async function encodeWithWorker(canvas, format, quality) {
	const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
	const worker = new Worker(new URL(
		/* @vite-ignore */
		"" + new URL("assetExport.worker-x1_xIgiM.js", import.meta.url).href,
		"" + import.meta.url
	), { type: "module" });
	try {
		return await withExportTimeout(new Promise((resolve, reject) => {
			worker.onmessage = (event) => {
				if (event.data.error || !event.data.buffer) reject(new Error(event.data.error || "Image encoding failed."));
				else resolve(new Blob([event.data.buffer], { type: `image/${format}` }));
			};
			worker.onerror = () => reject(/* @__PURE__ */ new Error(`Could not load the ${format.toUpperCase()} encoder. Retry the export.`));
			worker.postMessage({
				data,
				format,
				quality
			}, [data.data.buffer]);
		}), 12e4);
	} finally {
		worker.terminate();
	}
}
async function encodeRaster(snapshot, format, scale, quality = 92) {
	const canvas = await rasterize(snapshot, scale, format === "jpg");
	try {
		if (format === "avif") return await encodeWithWorker(canvas, "avif");
		const mime = `image/${format === "jpg" ? "jpeg" : format}`;
		const blob = await withExportTimeout(new Promise((resolve) => canvas.toBlob(resolve, mime, quality / 100)));
		if (blob?.type === mime) return blob;
		if (format === "webp") return await encodeWithWorker(canvas, "webp");
		throw new Error(`The browser could not encode ${format.toUpperCase()}.`);
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
}
/** Copies at the layers' actual size. Unlike an export, one past the size limit shrinks to fit rather than failing. */
async function renderClipboardPng(elements) {
	const snapshot = await captureAsset(elements.map((element) => element.id));
	const scale = fitExportScale(snapshot.width, snapshot.height, 1);
	return {
		png: await encodeRaster(snapshot, "png", scale),
		scale,
		reduced: scale < 1
	};
}
/** A small PNG of the layers for the Export section's preview, at most `maxSide` px on its longer side. */
async function renderAssetPreview(elements, maxSide) {
	const snapshot = await captureAsset(elements.map((element) => element.id));
	return encodeRaster(snapshot, "png", Math.min(1, maxSide / Math.max(snapshot.width, snapshot.height)));
}
async function printInBrowser(html) {
	const frame = document.createElement("iframe");
	frame.title = "PDF export";
	frame.style.cssText = "position:fixed;left:-100000px;top:0;width:1px;height:1px;border:0;";
	try {
		await withExportTimeout(new Promise((resolve, reject) => {
			frame.onload = () => resolve();
			frame.onerror = () => reject(/* @__PURE__ */ new Error("Could not prepare the PDF."));
			frame.srcdoc = html;
			document.body.append(frame);
		}));
		const win = frame.contentWindow;
		await withExportTimeout(win.document.fonts.ready);
		await withExportTimeout(Promise.all([...win.document.images].map((img) => img.decode())));
		win.focus();
		win.addEventListener("afterprint", () => frame.remove(), { once: true });
		setTimeout(() => frame.remove(), 3e5);
		win.print();
	} catch (error) {
		frame.remove();
		throw error;
	}
}
async function saveFiles(files) {
	const entries = Object.entries(files);
	if (!entries.length) return true;
	const bridge = getExportBridge();
	if (bridge) return bridge.invoke("assets:save", { files });
	let name, bytes;
	if (entries.length === 1) [name, bytes] = entries[0];
	else {
		const { zip } = await __bundledVitePreload(async () => {
			const { zip } = await import("../../../../../vendor/fflate.js").then((n) => n.browser_exports);
			return { zip };
		}, __bundled__mapDeps$chunk1([0,1]), import.meta.url);
		name = "Exports.zip";
		bytes = await new Promise((resolve, reject) => {
			zip(files, { level: 0 }, (error, result) => error ? reject(error) : resolve(result));
		});
	}
	const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 6e4);
	return true;
}
async function exportAssets(elements, onProgress) {
	const files = Object.create(null);
	const used = /* @__PURE__ */ new Set();
	let totalBytes = 0;
	for (const element of elements) {
		const settings = exportSettingsOf(element);
		if (!settings.length) continue;
		const name = exportLayerName(element);
		onProgress(`Capturing ${name}`);
		const snapshot = await captureAsset([element.id]);
		for (const setting of settings) {
			const filename = exportFilename(name, setting, used);
			onProgress(`Exporting ${filename}`);
			const scale = resolveExportScale(setting, snapshot.width, snapshot.height);
			let bytes;
			if (setting.format === "pdf") {
				const html = exportDocument(snapshot, scale, name);
				const bridge = getExportBridge();
				if (!bridge) {
					await printInBrowser(html);
					continue;
				}
				bytes = new Uint8Array(await bridge.invoke("assets:pdf", {
					html,
					...exportDimensions(snapshot.width, snapshot.height, scale)
				}));
			} else bytes = new Uint8Array(await (await encodeRaster(snapshot, setting.format, scale, setting.quality)).arrayBuffer());
			totalBytes += bytes.byteLength;
			if (totalBytes > 256e6) throw new Error("This export batch is too large. Export fewer layers or choose smaller sizes.");
			files[filename] = bytes;
		}
	}
	onProgress("Saving exports");
	return saveFiles(files);
}

export { encodeWithWorker, exportAssets, renderAssetPreview, renderClipboardPng };
