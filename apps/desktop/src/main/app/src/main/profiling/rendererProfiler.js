// Reconstructed from index.js — original module: app/src/main/profiling/rendererProfiler.ts
import { electron, fs_promises, path } from "../../../../__bundle__/_preamble.js";
import { webContentsLabel } from "./metrics.js";

/**
* V8 sampling profiles of the app's own renderers (the dashboard window and
* every file tab), through the DevTools protocol on `webContents.debugger`.
* Renderers that open during a recording are picked up once their page is
* ready. Canvas `<webview>` guests and capture windows run other sites' code
* and are left out; the process counters still show if one of them is hot.
* Workers aren't covered: profile them from chrome://inspect. Writes one
* `renderer-<label>-<pid>.cpuprofile` per renderer.
*/
var SAMPLING_INTERVAL_US = 1e3;
var profiling = null;
function startRendererProfiles(isAppRenderer) {
	if (profiling) return;
	const targets = /* @__PURE__ */ new Map();
	const consider = (contents) => {
		if (profiling !== current || contents.isDestroyed()) return;
		if (!contents.getURL()) contents.once("dom-ready", () => consider(contents));
		else if (isAppRenderer(contents)) attach(contents, targets);
	};
	const current = {
		targets,
		onCreated: (_event, contents) => consider(contents)
	};
	profiling = current;
	electron.app.on("web-contents-created", current.onCreated);
	for (const contents of electron.webContents.getAllWebContents()) consider(contents);
}
async function stopRendererProfiles(dir) {
	const current = profiling;
	if (!current) return;
	profiling = null;
	electron.app.off("web-contents-created", current.onCreated);
	await Promise.all([...current.targets].map(async ([contents, target]) => {
		current.targets.delete(contents);
		try {
			const { profile } = await contents.debugger.sendCommand("Profiler.stop");
			await (0, fs_promises.writeFile)((0, path.join)(dir, `renderer-${fileSafe(target.label)}-${target.pid}.cpuprofile`), JSON.stringify(profile));
		} catch (error) {
			console.warn(`[Profiling] No profile for ${target.label}:`, error);
		} finally {
			if (!contents.isDestroyed() && contents.debugger.isAttached()) contents.debugger.detach();
		}
	}));
}
async function attach(contents, targets) {
	const target = {
		label: webContentsLabel(contents),
		pid: contents.getOSProcessId()
	};
	try {
		contents.debugger.attach("1.3");
	} catch (error) {
		console.warn(`[Profiling] Skipped ${target.label}; another debugger is attached:`, error);
		return;
	}
	targets.set(contents, target);
	contents.debugger.once("detach", (_event, reason) => {
		if (targets.delete(contents)) console.warn(`[Profiling] Lost ${target.label} (${reason})`);
	});
	try {
		await contents.debugger.sendCommand("Profiler.enable");
		await contents.debugger.sendCommand("Profiler.setSamplingInterval", { interval: SAMPLING_INTERVAL_US });
		await contents.debugger.sendCommand("Profiler.start");
	} catch (error) {
		console.warn(`[Profiling] Couldn't profile ${target.label}:`, error);
		targets.delete(contents);
		if (!contents.isDestroyed() && contents.debugger.isAttached()) contents.debugger.detach();
	}
}
function fileSafe(label) {
	return label.replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
}

export { startRendererProfiles, stopRendererProfiles };
