// Reconstructed from index.js — original module: app/src/main/profiling/metrics.ts
import { child_process, electron, fs, os, path, util } from "../../../../__bundle__/_preamble.js";
import { getTabNameForContents } from "../../../../packages/ai/src/protocol.js";
import { PS_ARGS, descendantsOf, parsePs } from "./processTree.js";

/**
* Records CPU, memory and idle wakeups for every process the app runs, to
* `process-metrics.json` in a recording's folder, in Chrome's trace event
* format: open it in https://ui.perfetto.dev (or chrome://tracing) and each
* process shows up as its own set of counter tracks. Timestamps and pids are
* the ones Chromium's tracing uses (`process.hrtime` shares its monotonic
* clock), so these events merge into the recording's trace.json unchanged.
*
* CPU is percent of one core over the last interval, like Activity Monitor,
* so a busy process can read above 100. On macOS/Linux it comes from the
* change in each process's cumulative CPU time in `ps`, for every process
* under the main one: Chromium's, and the Claude CLI, terminal shells and
* their children that `app.getAppMetrics()` doesn't list. Don't switch
* Chromium's processes to `percentCPUUsage`: on macOS it is a share of the
* whole machine, under-reporting by the core count (1.4 vs Activity Monitor's
* 15 on 11 cores). Windows has no `ps`, so there it is scaled back up.
* `getAppMetrics()` still names the processes and gives memory and wakeups.
*
* The file is a JSON array closed when recording stops; Perfetto accepts
* it unclosed too, so a recording cut short by a crash still opens.
*/
var execFileAsync$1 = (0, util.promisify)(child_process.execFile);
var INTERVAL_MS = 2e3;
/** Track order in the viewer: main first, spawned processes last. */
var SORT_INDEX = {
	Browser: 0,
	GPU: 1,
	Utility: 2,
	Tab: 3,
	child: 5
};
var recording = null;
function startProcessMetrics(dir) {
	if (recording) return;
	const path$36 = (0, path.join)(dir, "process-metrics.json");
	const current = {
		path: path$36,
		stream: (0, fs.createWriteStream)(path$36),
		sampling: false,
		wroteEvent: false,
		names: /* @__PURE__ */ new Map(),
		previousCpu: /* @__PURE__ */ new Map(),
		timer: setInterval(() => void sample(current), INTERVAL_MS)
	};
	recording = current;
	current.stream.write("[\n");
	write(current, [{
		ph: "i",
		s: "p",
		name: "Recording started",
		ts: traceNow(),
		pid: process.pid,
		tid: process.pid,
		args: {
			version: electron.app.getVersion(),
			platform: process.platform,
			arch: process.arch,
			cores: (0, os.cpus)().length,
			intervalMs: INTERVAL_MS,
			startedAt: (/* @__PURE__ */ new Date()).toISOString()
		}
	}]);
	electron.app.getAppMetrics();
	sample(current);
}
/** Resolves with the file's path once it is closed. */
function stopProcessMetrics() {
	if (!recording) return Promise.resolve(null);
	const { path: path$37, stream, timer } = recording;
	clearInterval(timer);
	recording = null;
	return new Promise((resolve) => stream.end("\n]\n", () => resolve(path$37)));
}
function write(current, events) {
	for (const event of events) {
		current.stream.write((current.wroteEvent ? ",\n" : "") + JSON.stringify(event));
		current.wroteEvent = true;
	}
}
async function sample(current) {
	if (current.sampling) return;
	current.sampling = true;
	try {
		const at = Date.now();
		const ts = traceNow();
		const metrics = electron.app.getAppMetrics();
		const contentsByPid = describeWebContents();
		const rows = await listAppProcesses();
		const seenCpu = /* @__PURE__ */ new Map();
		const psCpu = (row) => {
			const previous = current.previousCpu.get(row.pid);
			seenCpu.set(row.pid, {
				cpuSeconds: row.cpuSeconds,
				at
			});
			return previous ? (row.cpuSeconds - previous.cpuSeconds) / ((at - previous.at) / 1e3) * 100 : null;
		};
		const processes = metrics.map((metric) => {
			const row = rows?.get(metric.pid);
			return {
				pid: metric.pid,
				kind: metric.type,
				name: electronProcessName(metric, contentsByPid.get(metric.pid)),
				cpu: row ? psCpu(row) : metric.cpu.percentCPUUsage * (0, os.cpus)().length,
				wakeups: metric.cpu.idleWakeupsPerSecond,
				memMB: metric.memory.workingSetSize / 1024
			};
		});
		const known = new Set(metrics.map((metric) => metric.pid));
		for (const row of rows?.values() ?? []) {
			if (known.has(row.pid)) continue;
			processes.push({
				pid: row.pid,
				kind: "child",
				name: (0, path.basename)(row.command),
				cpu: psCpu(row),
				memMB: row.rssKb / 1024
			});
		}
		current.previousCpu = seenCpu;
		if (recording !== current) return;
		const events = [];
		for (const p of processes) {
			if (current.names.get(p.pid) !== p.name) {
				current.names.set(p.pid, p.name);
				events.push({
					ph: "M",
					name: "process_name",
					pid: p.pid,
					tid: p.pid,
					args: { name: p.name }
				}, {
					ph: "M",
					name: "process_sort_index",
					pid: p.pid,
					tid: p.pid,
					args: { sort_index: SORT_INDEX[p.kind] ?? 4 }
				});
			}
			if (p.cpu !== null) events.push({
				ph: "C",
				name: "cpu",
				pid: p.pid,
				tid: p.pid,
				ts,
				args: { "%": round(p.cpu) }
			});
			events.push({
				ph: "C",
				name: "memory",
				pid: p.pid,
				tid: p.pid,
				ts,
				args: { MB: round(p.memMB) }
			});
			if (p.wakeups !== void 0) events.push({
				ph: "C",
				name: "idle wakeups",
				pid: p.pid,
				tid: p.pid,
				ts,
				args: { "/s": p.wakeups }
			});
		}
		const total = processes.reduce((sum, p) => sum + (p.cpu ?? 0), 0);
		events.push({
			ph: "C",
			name: "all processes cpu",
			pid: process.pid,
			tid: process.pid,
			ts,
			args: { "%": round(total) }
		});
		write(current, events);
	} catch (error) {
		console.error("[Profiling] Sample failed:", error);
	} finally {
		current.sampling = false;
	}
}
/** What each renderer process is showing: one process can host several web contents. */
function describeWebContents() {
	const byPid = /* @__PURE__ */ new Map();
	for (const contents of electron.webContents.getAllWebContents()) {
		if (contents.isDestroyed()) continue;
		const pid = contents.getOSProcessId();
		const label = webContentsLabel(contents);
		const list = byPid.get(pid);
		if (list) list.push(label);
		else byPid.set(pid, [label]);
	}
	return byPid;
}
/** What a web contents shows: the file tab's name, else its type and URL. */
function webContentsLabel(contents) {
	const tabName = getTabNameForContents(contents);
	return tabName !== null ? `File "${tabName}"` : `${contents.getType()} ${shortUrl(contents.getURL())}`;
}
function electronProcessName(metric, contents) {
	if (metric.type === "Browser") return "Main";
	if (metric.type === "Tab") return `Renderer: ${contents?.join(", ") ?? "no web contents"}`;
	return [metric.type, metric.name ?? metric.serviceName].filter(Boolean).join(": ");
}
function shortUrl(url) {
	try {
		const { protocol, host, pathname } = new URL(url);
		return protocol === "file:" ? (0, path.basename)(pathname) : host + pathname;
	} catch {
		return url.slice(0, 80);
	}
}
/** The main process and everything under it, by pid; null where there is no `ps`. */
async function listAppProcesses() {
	if (process.platform === "win32") return null;
	const ps = execFileAsync$1("ps", PS_ARGS, { maxBuffer: 16777216 });
	const all = parsePs((await ps).stdout);
	const main = all.get(process.pid);
	const rows = descendantsOf(process.pid, all).filter((row) => row.pid !== ps.child.pid);
	return new Map((main ? [main, ...rows] : rows).map((row) => [row.pid, row]));
}
/** Microseconds on the clock Chromium's trace events and V8 profiles use. */
function traceNow() {
	return Number(process.hrtime.bigint() / 1000n);
}
function round(value) {
	return Math.round(value * 10) / 10;
}

export { startProcessMetrics, stopProcessMetrics, webContentsLabel };
