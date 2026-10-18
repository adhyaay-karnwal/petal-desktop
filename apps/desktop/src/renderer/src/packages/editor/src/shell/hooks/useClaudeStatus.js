// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useClaudeStatus.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

function sameStatus(a, b) {
	return !!a && a.installed === b.installed && a.loggedIn === b.loggedIn && a.installCommand === b.installCommand && a.version === b.version && a.requiredVersion === b.requiredVersion && a.account === b.account;
}
function getBridge$2() {
	if (typeof window === "undefined") return null;
	const api = window.api;
	return api && typeof api.invoke === "function" ? api : null;
}
/**
* Every mounted instance in this window hears each check's answer. A chat that
* stays open does not check again on its own (desktop file tabs never blur), so
* without this it kept "logged in" after a newer chat found Claude signed out.
*/
var statusListeners = /* @__PURE__ */ new Set();
/**
* Checks are numbered as they start, window-wide. Instances run their own
* checks, so an older one can answer after a newer one: only an answer newer
* than the last one applied reaches the chats. A superseded check resolves to
* the newer answer, so a send gate waiting on it never acts on the stale one.
*/
var lastCheckId = 0;
var applied = null;
function startCheck() {
	lastCheckId += 1;
	return lastCheckId;
}
/** An answer already applied from a check started after `id`, if any. */
function newerAnswer(id) {
	return applied && applied.id > id ? applied.status : null;
}
/** Apply check `id`'s answer unless a newer one is in; resolve to whichever stands. */
function settleCheck(id, next) {
	const newer = newerAnswer(id);
	if (newer) return newer;
	applied = {
		id,
		status: next
	};
	for (const listener of statusListeners) listener(next);
	return next;
}
function isClaudeSetUp(status) {
	return !!status?.installed && !!status?.loggedIn && !status.requiredVersion;
}
/**
* Reads Claude Code setup state over the Electron `claude:check-status` IPC.
* Pass `{ poll: true }` (e.g. while the setup wizard is open) to re-check on an
* interval so a freshly installed / logged-in CLI is picked up automatically.
*/
function useClaudeStatus(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const { poll: t2, intervalMs: t3 } = t1;
	const poll = t2 === void 0 ? false : t2;
	const intervalMs = t3 === void 0 ? 1500 : t3;
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = getBridge$2();
		$[2] = t4;
	} else t4 = $[2];
	const isDesktop = t4 !== null;
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(false);
	const inFlight = (0, import_react.useRef)(null);
	const mounted = (0, import_react.useRef)(true);
	let t5;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => {
			const bridge = getBridge$2();
			if (!bridge) return Promise.resolve(null);
			if (inFlight.current) return inFlight.current;
			const id = startCheck();
			const check = bridge.invoke("claude:check-status").then((next) => settleCheck(id, next)).catch(() => {
				const newer = newerAnswer(id);
				if (newer) return newer;
				if (mounted.current) setError(true);
				return null;
			}).finally(() => {
				inFlight.current = null;
			});
			inFlight.current = check;
			return check;
		};
		$[3] = t5;
	} else t5 = $[3];
	const refresh = t5;
	let t6;
	let t7;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			const listener = (next_0) => {
				setStatus((prev) => sameStatus(prev, next_0) ? prev : next_0);
				setError(false);
			};
			statusListeners.add(listener);
			return () => {
				statusListeners.delete(listener);
			};
		};
		t7 = [];
		$[4] = t6;
		$[5] = t7;
	} else {
		t6 = $[4];
		t7 = $[5];
	}
	(0, import_react.useEffect)(t6, t7);
	let t8;
	let t9;
	if ($[6] !== intervalMs || $[7] !== poll) {
		t8 = () => {
			mounted.current = true;
			refresh();
			if (!isDesktop) return () => {
				mounted.current = false;
			};
			const onFocus = () => void refresh();
			window.addEventListener("focus", onFocus);
			const timer = poll ? setInterval(() => void refresh(), intervalMs) : null;
			return () => {
				mounted.current = false;
				window.removeEventListener("focus", onFocus);
				if (timer) clearInterval(timer);
			};
		};
		t9 = [
			poll,
			intervalMs,
			isDesktop,
			refresh
		];
		$[6] = intervalMs;
		$[7] = poll;
		$[8] = t8;
		$[9] = t9;
	} else {
		t8 = $[8];
		t9 = $[9];
	}
	(0, import_react.useEffect)(t8, t9);
	const loading = isDesktop && !status && !error;
	let t10;
	if ($[10] !== error || $[11] !== loading || $[12] !== status) {
		t10 = {
			status,
			loading,
			error,
			refresh,
			isDesktop
		};
		$[10] = error;
		$[11] = loading;
		$[12] = status;
		$[13] = t10;
	} else t10 = $[13];
	return t10;
}

export { isClaudeSetUp, useClaudeStatus };
