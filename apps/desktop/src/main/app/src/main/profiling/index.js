// Reconstructed from index.js — original module: app/src/main/profiling/index.ts
import { electron, fs, path } from "../../../../__bundle__/_preamble.js";
import { startMainProfile, stopMainProfile } from "./mainProfiler.js";
import { startProcessMetrics, stopProcessMetrics } from "./metrics.js";
import { startRendererProfiles, stopRendererProfiles } from "./rendererProfiler.js";
import { mergeIntoTrace, startTrace, stopTrace } from "./trace.js";

/**
* Opt-in CPU profiling, driven from the Profiling menu that exists only when
* the app runs with `ELECTRON_PROFILE=1` (see docs/profiling.md). Nothing here
* runs at import. Each recording writes into its own
* `<logs>/profiles/<timestamp>/` folder: a whole-app trace (trace.ts) with the
* per-process CPU counters (metrics.ts) merged in, so both share one timeline,
* plus JS sampling profiles of the main process (mainProfiler.ts) and the
* app's renderers (rendererProfiler.ts).
*/
var PROFILING_ENABLED = process.env.ELECTRON_PROFILE === "1";
var recordingDir = null;
/** The in-flight stop. Trace, metrics, and the profilers are module-level singletons, so a new recording cannot start until this settles. */
var stopping = null;
function isRecording() {
	return recordingDir !== null;
}
/** True while a stop is still writing files. The menu uses this to stay disabled until the singletons are free. */
function isStoppingRecording() {
	return stopping !== null;
}
/**
* Starts a recording; returns its folder. `isAppRenderer` picks the renderers to profile.
* A call while one is active, including while it is stopping, returns that folder and does not start another.
*/
function startRecording(isAppRenderer) {
	if (recordingDir) return recordingDir;
	const dir = (0, path.join)(electron.app.getPath("logs"), "profiles", (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-"));
	(0, fs.mkdirSync)(dir, { recursive: true });
	recordingDir = dir;
	startTrace();
	startProcessMetrics(dir);
	startMainProfile();
	startRendererProfiles(isAppRenderer);
	console.log(`[Profiling] Recording to ${dir}`);
	return dir;
}
/** Stops the recording; resolves with its folder once every file is written. A second call shares the in-flight stop. */
function stopRecording() {
	if (stopping) return stopping;
	const dir = recordingDir;
	if (!dir) return Promise.resolve(null);
	stopping = finishRecording(dir).finally(() => {
		recordingDir = null;
		stopping = null;
	});
	return stopping;
}
async function finishRecording(dir) {
	const [metricsPath, tracePath] = await Promise.all([
		stopProcessMetrics(),
		stopTrace(dir),
		stopMainProfile(dir),
		stopRendererProfiles(dir)
	]);
	if (metricsPath && tracePath) await mergeIntoTrace(tracePath, metricsPath).catch((error) => console.error("[Profiling] Merging counters into the trace failed:", error));
	console.log(`[Profiling] Stopped; files in ${dir}`);
	return dir;
}
/**
* Call first in `before-quit`. While a recording is running or its files are
* still being written, this holds the quit, finishes that write, then quits
* again; returns whether it held the quit.
*/
function finishProfilingBeforeQuit(event) {
	if (!isRecording()) return false;
	event.preventDefault();
	stopRecording().finally(() => electron.app.quit());
	return true;
}

export { PROFILING_ENABLED, finishProfilingBeforeQuit, isRecording, isStoppingRecording, startRecording, stopRecording };
