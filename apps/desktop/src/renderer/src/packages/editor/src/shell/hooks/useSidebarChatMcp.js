// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useSidebarChatMcp.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { SIDEBAR_CHAT_PROGRESS_CHANNEL, SIDEBAR_CHAT_REQUEST_CHANNEL, SIDEBAR_CHAT_RESULT_CHANNEL } from "../../../../ai/src/sidebarChat.js";
import { SidebarChatController } from "../utils/sidebarChatController.js";

/** The IPC subscription owns its heartbeat timers, including requests that outlive unmount. */
function subscribeSidebarChatRequests(api, projectId, controller) {
	let active = true;
	const timers = /* @__PURE__ */ new Set();
	const unsubscribe = api.on(SIDEBAR_CHAT_REQUEST_CHANNEL, async (request) => {
		if (request?.projectId !== projectId()) return;
		const progress = () => api.send(SIDEBAR_CHAT_PROGRESS_CHANNEL, { requestId: request.requestId });
		progress();
		const timer = setInterval(progress, 2e3);
		timers.add(timer);
		await controller.execute(request.command).then((data) => ({
			requestId: request.requestId,
			result: {
				ok: true,
				data
			}
		}), (error) => ({
			requestId: request.requestId,
			result: {
				ok: false,
				error: error instanceof Error ? error.message : String(error)
			}
		})).then((result) => {
			if (active) api.send(SIDEBAR_CHAT_RESULT_CHANNEL, result);
		}).finally(() => {
			clearInterval(timer);
			timers.delete(timer);
		});
	});
	return () => {
		active = false;
		unsubscribe();
		for (const timer of timers) clearInterval(timer);
		timers.clear();
	};
}
/** The project renderer owns chat state; main cannot synthesize canvas/draft context. */
function useSidebarChatMcp(deps) {
	const $ = (0, import_compiler_runtime.c)(4);
	const latest = (0, import_react.useRef)(deps);
	let t0;
	if ($[0] !== deps) {
		t0 = () => {
			latest.current = deps;
		};
		$[0] = deps;
		$[1] = t0;
	} else t0 = $[1];
	(0, import_react.useLayoutEffect)(t0);
	let t1;
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const api = window.api;
			if (!api?.on || !api?.send) return;
			return subscribeSidebarChatRequests(api, () => latest.current.projectId, new SidebarChatController(() => {
				const current = latest.current;
				const pages = typeof current.pages === "function" ? current.pages() : current.pages;
				return {
					...current,
					panels: current.panelsRef.current,
					chats: current.chats.map((chat) => ({
						...chat,
						messages: current.messages(chat.id)
					})),
					pages: pages.map((page) => ({
						...page,
						store: page.id === current.activeTabId && current.storeRef ? current.storeRef.current : page.store
					}))
				};
			}));
		};
		t2 = [];
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useEffect)(t1, t2);
}

export { useSidebarChatMcp };
