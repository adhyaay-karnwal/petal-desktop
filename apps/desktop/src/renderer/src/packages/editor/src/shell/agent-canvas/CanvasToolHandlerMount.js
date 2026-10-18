// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/agent-canvas/CanvasToolHandlerMount.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { useCanvasToolHandler } from "../hooks/useCanvasToolHandler.js";
import { useAgentCanvas } from "./useAgentCanvas.js";

/**
* Runs exactly one canvas IPC listener at a time. Two mount components keep each
* hook unconditional per component, so the React Compiler still compiles
* `PetalEditorInner`; a conditional hook call there would not.
*/
/** Mounts the legacy `canvas_tool_request` canvas handler. */
function LegacyCanvasToolMount(t0) {
	const { deps } = t0;
	useCanvasToolHandler(deps);
	return null;
}
/** Mounts the typed `agent_canvas` canvas handler. */
function AgentCanvasToolMount(t0) {
	const { deps } = t0;
	useAgentCanvas(deps);
	return null;
}
function CanvasToolHandlerMount(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { enableAgentsV2, deps } = t0;
	let t1;
	if ($[0] !== deps || $[1] !== enableAgentsV2) {
		t1 = enableAgentsV2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCanvasToolMount, { deps }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegacyCanvasToolMount, { deps });
		$[0] = deps;
		$[1] = enableAgentsV2;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}

export { CanvasToolHandlerMount };
