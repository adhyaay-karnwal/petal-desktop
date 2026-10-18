// Reconstructed from index.js — original module: app/src/main/profiling/mainProfiler.ts
import { fs_promises, node_inspector_promises, path } from "../../../../__bundle__/_preamble.js";

/**
* V8 sampling profile of the main process, through an in-process inspector
* session. Unlike `--cpu-prof` it starts and stops with a recording, needs no
* relaunch, and works in packaged builds. Writes `main-<pid>.cpuprofile`.
*/
var SAMPLING_INTERVAL_US$1 = 1e3;
var session$1 = null;
async function startMainProfile() {
	if (session$1) return;
	const current = new node_inspector_promises.Session();
	session$1 = current;
	current.connect();
	try {
		await current.post("Profiler.enable");
		await current.post("Profiler.setSamplingInterval", { interval: SAMPLING_INTERVAL_US$1 });
		await current.post("Profiler.start");
	} catch (error) {
		console.error("[Profiling] Main profile failed to start:", error);
		if (session$1 === current) session$1 = null;
		current.disconnect();
	}
}
async function stopMainProfile(dir) {
	const current = session$1;
	if (!current) return;
	session$1 = null;
	try {
		const { profile } = await current.post("Profiler.stop");
		await (0, fs_promises.writeFile)((0, path.join)(dir, `main-${process.pid}.cpuprofile`), JSON.stringify(profile));
	} catch (error) {
		console.error("[Profiling] Main profile failed to stop:", error);
	} finally {
		current.disconnect();
	}
}

export { startMainProfile, stopMainProfile };
