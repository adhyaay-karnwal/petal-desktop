// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/bakeVideo.ts
import { readableAssetUrl } from "../utils/readableAssetUrl.js";

/** Thrown when the browser can't decode or encode this video. */
var UnsupportedVideoError = class extends Error {};
var queue = Promise.resolve();
/** Runs `task` once every earlier one has settled. */
function exclusive(task) {
	const result = queue.then(task);
	queue = result.catch(() => {});
	return result;
}
function bakeInWorker(request, signal, onProgress) {
	return new Promise((resolve, reject) => {
		if (signal.aborted) return reject(signal.reason);
		const worker = new Worker(new URL(
			/* @vite-ignore */
			"" + new URL("bakeVideo.worker-CBlmnIlm.js", import.meta.url).href,
			"" + import.meta.url
		), { type: "module" });
		const settle = () => {
			worker.terminate();
			signal.removeEventListener("abort", abort);
		};
		const abort = () => {
			settle();
			reject(signal.reason);
		};
		signal.addEventListener("abort", abort, { once: true });
		worker.onmessage = ({ data }) => {
			if (data.type === "progress") return onProgress(data.progress);
			settle();
			if (data.type === "done") resolve(data.buffer);
			else reject(data.unsupported ? new UnsupportedVideoError(data.message) : new Error(data.message));
		};
		worker.onerror = (event) => {
			settle();
			reject(new Error(event.message || "The video worker failed to start"));
		};
		worker.postMessage(request);
	});
}
/**
* Bakes `sourceUrl` (resolved) and uploads it as MP4, reporting progress 0..1.
* Waits for any bake already running; an aborted bake stops at once and never uploads.
*/
async function bakeVideoAndUpload(sourceUrl, adjust, backend, signal, onProgress) {
	const buffer = await exclusive(async () => {
		const url = new URL(await readableAssetUrl(sourceUrl), window.location.href).href;
		return bakeInWorker({
			url,
			adjust
		}, signal, onProgress);
	});
	signal.throwIfAborted();
	const blob = new Blob([buffer], { type: "video/mp4" });
	const result = await backend.uploadAsset(blob, `video-adjusted-${Date.now()}.mp4`);
	if (!result.success || !result.url) throw new Error(result.error ?? "Upload failed");
	return result.url;
}

export { UnsupportedVideoError, bakeVideoAndUpload };
