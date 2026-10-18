// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useProjectBuilderSession.ts
import { import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "./useSession.js";
import { ProjectUnavailableError, projectBuilderClient } from "../services/ProjectBuilderClient.js";

var RECONNECT_BASE_MS = 1e3;
var RECONNECT_MAX_MS = 3e4;
function reconnectDelay(attempt) {
	return Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
}
function useProjectBuilderSession(projectId, projectAccessToken) {
	const $ = (0, import_compiler_runtime.c)(4);
	let t0;
	let t1;
	if ($[0] !== projectAccessToken || $[1] !== projectId) {
		t0 = () => {
			if (!projectId) {
				projectBuilderClient.disconnect();
				return;
			}
			if (projectAccessToken) projectBuilderClient.setProjectAccessToken(projectId, projectAccessToken);
			let cancelled = false;
			let attempt = 0;
			let timer = null;
			const clearTimer = () => {
				if (timer == null) return;
				clearTimeout(timer);
				timer = null;
			};
			const tryConnect = () => {
				if (cancelled) return;
				if (projectBuilderClient.isSseConnected(projectId)) return;
				projectBuilderClient.connect(projectId).catch((err) => {
					if (cancelled) return;
					console.warn("[useProjectBuilderSession] Connect failed:", err);
					if (err instanceof ProjectUnavailableError) return;
					scheduleReconnect();
				});
			};
			const scheduleReconnect = () => {
				if (cancelled) return;
				clearTimer();
				const delay = reconnectDelay(attempt);
				attempt = attempt + 1;
				timer = setTimeout(tryConnect, delay);
			};
			tryConnect();
			const unsub = projectBuilderClient.on((event) => {
				if (event.type === "connected") {
					attempt = 0;
					clearTimer();
					return;
				}
				if (event.type === "disconnected") scheduleReconnect();
			});
			const onVisibilityChange = () => {
				if (document.visibilityState !== "visible") return;
				if (projectBuilderClient.isSseConnected(projectId)) return;
				attempt = 0;
				clearTimer();
				tryConnect();
			};
			document.addEventListener("visibilitychange", onVisibilityChange);
			return () => {
				cancelled = true;
				clearTimer();
				unsub();
				document.removeEventListener("visibilitychange", onVisibilityChange);
				projectBuilderClient.disconnect();
			};
		};
		t1 = [projectId, projectAccessToken];
		$[0] = projectAccessToken;
		$[1] = projectId;
		$[2] = t0;
		$[3] = t1;
	} else {
		t0 = $[2];
		t1 = $[3];
	}
	(0, import_react.useEffect)(t0, t1);
}

export { useProjectBuilderSession };
