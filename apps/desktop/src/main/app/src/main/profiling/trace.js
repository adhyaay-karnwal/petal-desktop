// Reconstructed from index.js — original module: app/src/main/profiling/trace.ts
import { electron, fs_promises, path } from "../../../../__bundle__/_preamble.js";

/**
* A Chromium trace of every process on one timeline: main, renderers, GPU,
* IPC, style recalc and layout, and V8 samples. JS profiles show style and
* layout only as native time, so this is the tool for rendering cost. Writes
* `trace.json`, into which the recording's process counters are then merged;
* open it in https://ui.perfetto.dev. `ELECTRON_TRACE_CATEGORIES`
* (comma-separated) replaces the default categories.
*/
var DEFAULT_CATEGORIES = [
	"toplevel",
	"v8",
	"blink",
	"cc",
	"gpu",
	"ipc",
	"devtools.timeline",
	"disabled-by-default-devtools.timeline",
	"disabled-by-default-v8.cpu_profiler"
];
/** The trace's `metadata` object follows its events; a few tens of KB in practice. */
var TAIL_BYTES = 1048576;
var tracing = false;
async function startTrace() {
	if (tracing) return;
	tracing = true;
	const categories = process.env.ELECTRON_TRACE_CATEGORIES?.split(",").map((c) => c.trim()).filter(Boolean);
	try {
		await electron.contentTracing.startRecording({ included_categories: categories?.length ? categories : DEFAULT_CATEGORIES });
	} catch (error) {
		console.error("[Profiling] Trace failed to start:", error);
		tracing = false;
	}
}
/** Resolves with the path of the written trace, or null if none was running. */
async function stopTrace(dir) {
	if (!tracing) return null;
	tracing = false;
	try {
		return await electron.contentTracing.stopRecording((0, path.join)(dir, "trace.json"));
	} catch (error) {
		console.error("[Profiling] Trace failed to stop:", error);
		return null;
	}
}
/**
* Appends the trace events in `eventsPath` (a JSON array, possibly unclosed)
* to the trace at `tracePath`. The trace can be hundreds of MB, more than one
* JS string holds, so this splices the events in before the end of its
* `traceEvents` array instead of parsing it.
*/
async function mergeIntoTrace(tracePath, eventsPath) {
	const text = await (0, fs_promises.readFile)(eventsPath, "utf8");
	let events;
	try {
		events = JSON.parse(text);
	} catch {
		events = JSON.parse(text.trimEnd().replace(/,$/, "") + "]");
	}
	if (!events.length) return;
	const file = await (0, fs_promises.open)(tracePath, "r+");
	try {
		const { size } = await file.stat();
		const tailStart = Math.max(0, size - TAIL_BYTES);
		const tail = Buffer.alloc(size - tailStart);
		await file.read(tail, 0, tail.length, tailStart);
		const tailText = tail.toString("latin1");
		const close = lastMatch(tailText, /\]\s*,\s*"metadata"\s*:/g) ?? lastMatch(tailText, /\]\s*\}\s*$/g);
		if (close === null) {
			console.warn(`[Profiling] Couldn't find the end of traceEvents in ${tracePath}; counters are only in ${eventsPath}`);
			return;
		}
		const inserted = (/\[\s*$/.test(tailText.slice(0, close)) ? "" : ",\n") + events.map((event) => JSON.stringify(event)).join(",\n") + "\n";
		await file.truncate(tailStart + close);
		await file.write(Buffer.concat([Buffer.from(inserted), tail.subarray(close)]), 0, void 0, tailStart + close);
	} finally {
		await file.close();
	}
}
function lastMatch(text, pattern) {
	let index = null;
	for (const match of text.matchAll(pattern)) index = match.index;
	return index;
}

export { mergeIntoTrace, startTrace, stopTrace };
