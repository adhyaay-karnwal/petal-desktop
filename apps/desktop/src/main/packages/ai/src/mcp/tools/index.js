// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/index.ts
import { createCanvasTools } from "./canvas.js";
import { createProjectTools } from "./project.js";
import { createAssetTools } from "./asset.js";

/**
* The full agents-v2 tool catalog: canvas and the app families, in the
* order the client sees them. `startMcpServer` builds this once per listen path.
* Local files go through the agent CLI's own filesystem tools, not MCP.
*/
function createAgentTools() {
	return [
		...createCanvasTools(),
		...createProjectTools(),
		...createAssetTools()
	];
}

export { createAgentTools };
