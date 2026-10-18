// Reconstructed from index.js — original module: packages/ai/src/mcp/types.ts
import { isAgentCanvasCommandType } from "./url.js";

/** Narrow an untrusted IPC payload to a canvas command by its `type` discriminator. */
function isAgentCanvasCommand(input) {
	if (!input || typeof input !== "object") return false;
	return isAgentCanvasCommandType(input.type);
}

export { isAgentCanvasCommand };
