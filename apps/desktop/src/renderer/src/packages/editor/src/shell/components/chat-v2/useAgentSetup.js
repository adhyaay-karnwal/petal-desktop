// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/useAgentSetup.ts
import { import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";

/**
* Selected-agent setup state for `ChatPanelV2`.
*
* Reads `host.checkStatus` on the v2 wire — not the v1 `claude:check-status` IPC.
*/
function isAgentSetUp(status) {
	return !!status?.installed && !!status?.loggedIn && !status.upgradeRequired;
}
/** Opens the agent's plans in the browser; the desktop app sends new windows there. */
function openUpgradePage(url) {
	window.open(url, "_blank", "noopener,noreferrer");
}
function useAgentSetup(checkStatus, t0) {
	const $ = (0, import_compiler_runtime.c)(24);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const { poll: t2, intervalMs: t3, agentId } = t1;
	const poll = t2 === void 0 ? false : t2;
	const intervalMs = t3 === void 0 ? 1500 : t3;
	const isDesktop = checkStatus !== void 0;
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(false);
	const [statusAgentId, setStatusAgentId] = (0, import_react.useState)(agentId);
	if (statusAgentId !== agentId) {
		setStatusAgentId(agentId);
		setStatus(null);
		setError(false);
	}
	let t4;
	if ($[2] !== agentId) {
		t4 = { agentId };
		$[2] = agentId;
		$[3] = t4;
	} else t4 = $[3];
	const owner = (0, import_react.useRef)(t4);
	const inFlight = (0, import_react.useRef)(null);
	const mounted = (0, import_react.useRef)(true);
	const checkStatusRef = (0, import_react.useRef)(checkStatus);
	let t5;
	if ($[4] !== checkStatus) {
		t5 = () => {
			checkStatusRef.current = checkStatus;
		};
		$[4] = checkStatus;
		$[5] = t5;
	} else t5 = $[5];
	(0, import_react.useEffect)(t5);
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			const load = checkStatusRef.current;
			if (!load) return Promise.resolve(null);
			const requestOwner = owner.current;
			if (inFlight.current === requestOwner) return Promise.resolve(null);
			inFlight.current = requestOwner;
			const isCurrent = () => mounted.current && owner.current === requestOwner;
			return load().then((next) => {
				if (isCurrent()) {
					setStatus(next);
					setError(false);
				}
				return next;
			}).catch(() => {
				if (isCurrent()) setError(true);
				return null;
			}).finally(() => {
				if (inFlight.current === requestOwner) inFlight.current = null;
			});
		};
		$[6] = t6;
	} else t6 = $[6];
	const refresh = t6;
	let t7;
	let t8;
	if ($[7] !== agentId) {
		t7 = () => {
			if (owner.current.agentId !== agentId) owner.current = { agentId };
		};
		t8 = [agentId];
		$[7] = agentId;
		$[8] = t7;
		$[9] = t8;
	} else {
		t7 = $[8];
		t8 = $[9];
	}
	(0, import_react.useLayoutEffect)(t7, t8);
	let t9;
	if ($[10] !== intervalMs || $[11] !== isDesktop || $[12] !== poll) {
		t9 = () => {
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
		$[10] = intervalMs;
		$[11] = isDesktop;
		$[12] = poll;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== agentId || $[15] !== intervalMs || $[16] !== isDesktop || $[17] !== poll) {
		t10 = [
			poll,
			intervalMs,
			isDesktop,
			refresh,
			agentId
		];
		$[14] = agentId;
		$[15] = intervalMs;
		$[16] = isDesktop;
		$[17] = poll;
		$[18] = t10;
	} else t10 = $[18];
	(0, import_react.useEffect)(t9, t10);
	const loading = isDesktop && !status && !error;
	let t11;
	if ($[19] !== error || $[20] !== isDesktop || $[21] !== loading || $[22] !== status) {
		t11 = {
			status,
			loading,
			error,
			refresh,
			isDesktop
		};
		$[19] = error;
		$[20] = isDesktop;
		$[21] = loading;
		$[22] = status;
		$[23] = t11;
	} else t11 = $[23];
	return t11;
}

export { isAgentSetUp, openUpgradePage, useAgentSetup };
