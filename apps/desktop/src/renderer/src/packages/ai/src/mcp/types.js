// Reconstructed from index-C74mRL57.js — original module: packages/ai/src/mcp/types.ts
import { isAgentCanvasCommandType } from "../sidebarChat.js";

/** Narrow an untrusted IPC payload to a canvas command by its `type` discriminator. */
function isAgentCanvasCommand(input) {
	if (!input || typeof input !== "object") return false;
	return isAgentCanvasCommandType(input.type);
}
/** Narrow an untrusted IPC payload to a canvas command, or return an error. */
function parseAgentCanvasCommand(input) {
	if (isAgentCanvasCommand(input)) return {
		ok: true,
		command: input
	};
	return {
		ok: false,
		error: "Invalid agent canvas command."
	};
}

export { parseAgentCanvasCommand };
