// Reconstructed from index.js — original module: app/src/main/profiling/processTree.ts

/** The `-o` list `parsePs` expects; `comm` goes last because it can contain spaces. */
var PS_ARGS = ["-axo", "pid=,ppid=,time=,rss=,comm="];
/** `ps` TIME: `[[dd-]hh:]mm:ss[.cc]` (macOS prints minutes past 59, e.g. `75:02.31`). */
function parseCpuTime(value) {
	const [days, clock] = value.includes("-") ? value.split("-") : ["0", value];
	return clock.split(":").reduce((total, part) => total * 60 + Number(part), 0) + Number(days) * 86400;
}
function parsePs(output) {
	const rows = /* @__PURE__ */ new Map();
	for (const line of output.split("\n")) {
		const match = /^\s*(\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(.*)$/.exec(line);
		if (!match) continue;
		const pid = Number(match[1]);
		rows.set(pid, {
			pid,
			ppid: Number(match[2]),
			cpuSeconds: parseCpuTime(match[3]),
			rssKb: Number(match[4]),
			command: match[5].trim()
		});
	}
	return rows;
}
/** Every process below `rootPid`, at any depth. */
function descendantsOf(rootPid, rows) {
	const children = /* @__PURE__ */ new Map();
	for (const row of rows.values()) {
		const siblings = children.get(row.ppid);
		if (siblings) siblings.push(row);
		else children.set(row.ppid, [row]);
	}
	const result = [];
	const queue = [rootPid];
	for (let pid = queue.shift(); pid !== void 0; pid = queue.shift()) for (const child of children.get(pid) ?? []) {
		result.push(child);
		queue.push(child.pid);
	}
	return result;
}

export { PS_ARGS, descendantsOf, parsePs };
