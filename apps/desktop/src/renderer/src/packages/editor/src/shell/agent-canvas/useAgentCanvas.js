// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/agent-canvas/useAgentCanvas.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { parseAgentCanvasCommand } from "../../../../ai/src/mcp/types.js";
import { executeCanvasCommand } from "./execute.js";

/**
* Agent canvas IPC handler hook (agents-v2 `agent_canvas` wire).
*
* Listens for typed `AgentCanvasRequest`s from Electron main on the
* `agent_canvas` channel, validates the command, runs it through the shared
* executor and replies with the typed `AgentCanvasResult` on `agent_canvas_result`.
*
* Mounted instead of `useCanvasToolHandler` behind the `agents-v2` flag; the two
* listeners never run at once. This module never subscribes to the legacy
* `canvas_tool_request` channel.
*
* The subscriber is defined at module scope on purpose: the React Compiler
* inlines closures declared in a hook, and a command that publishes agent
* presence re-renders the editor. An in-hook listener that re-subscribed on
* that render could drop the IPC reply, so main timed out after 10s while the
* command itself had already applied.
*/
/**
* Subscribe to `agent_canvas` IPC. Exported for tests; the hook is the
* production caller. The result is delivered with `invoke` so main settles the
* tool call even while this renderer is busy re-rendering — fire-and-forget
* `send` can sit unflushed past the 10s timeout.
*/
function subscribeToAgentCanvas(latestDeps, pendingPageCreationsRef, drawPreviewsRef, lastCommitAtRef) {
	const api = window.api;
	return api.on("agent_canvas", async (request) => {
		let replied = false;
		const respond = async (response) => {
			if (replied) return;
			replied = true;
			try {
				await api.invoke("agent_canvas_result", response);
			} catch (error) {
				console.warn("[agent-canvas] failed to deliver result", error);
			}
		};
		const requestId = typeof request?.requestId === "string" ? request.requestId : null;
		const parsed = parseAgentCanvasCommand(request?.command);
		if (!parsed.ok) {
			if (requestId) await respond({
				requestId,
				result: {
					ok: false,
					error: parsed.error
				}
			});
			return;
		}
		if (!requestId) return;
		const command = parsed.command;
		const deps = latestDeps();
		const requestProjectId = request?.projectId;
		const editorProjectId = deps.projectId;
		if (editorProjectId && requestProjectId && String(editorProjectId) !== String(requestProjectId)) {
			await respond({
				requestId,
				result: {
					ok: false,
					error: `Project mismatch: this canvas is ${editorProjectId}, but the MCP request targets ${requestProjectId}. No canvas changes were applied.`
				}
			});
			return;
		}
		const refs = {
			pendingPageCreationsRef,
			drawPreviewsRef,
			lastCommitAtRef
		};
		let response;
		const progress = setInterval(() => {
			api.invoke("agent_canvas_progress", { requestId }).catch(() => {});
		}, 3e3);
		try {
			response = {
				requestId,
				result: await executeCanvasCommand(command, deps, refs)
			};
		} catch (error) {
			response = {
				requestId,
				result: {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				}
			};
		} finally {
			clearInterval(progress);
		}
		await respond(response);
	});
}
function useAgentCanvas(deps) {
	const $ = (0, import_compiler_runtime.c)(7);
	let t0;
	if ($[0] !== deps) {
		t0 = () => deps;
		$[0] = deps;
		$[1] = t0;
	} else t0 = $[1];
	const latestDeps = (0, import_react.useEffectEvent)(t0);
	let t1;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ new Map();
		$[2] = t1;
	} else t1 = $[2];
	const pendingPageCreationsRef = (0, import_react.useRef)(t1);
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ new Map();
		$[3] = t2;
	} else t2 = $[3];
	const drawPreviewsRef = (0, import_react.useRef)(t2);
	const lastCommitAtRef = (0, import_react.useRef)(0);
	let t3;
	if ($[4] !== latestDeps) {
		t3 = () => {
			if (typeof window === "undefined" || !window.api?.on) return;
			return subscribeToAgentCanvas(latestDeps, pendingPageCreationsRef, drawPreviewsRef, lastCommitAtRef);
		};
		$[4] = latestDeps;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[6] = t4;
	} else t4 = $[6];
	(0, import_react.useEffect)(t3, t4);
}

export { useAgentCanvas };
