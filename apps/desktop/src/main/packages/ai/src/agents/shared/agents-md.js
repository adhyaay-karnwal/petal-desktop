// Reconstructed from index.js — original module: packages/ai/src/agents/shared/agents-md.ts
import { node_fs_promises, node_path } from "../../../../../__bundle__/_preamble.js";

/**
* `AGENTS.md` in the throwaway cwd, for agents whose own system prompt must not
* be replaced (OpenCode, Cursor). Both read the same file from the same cwd, so
* one writer keeps them from racing each other with different contents.
*
* Node-only.
*/
var written = /* @__PURE__ */ new Map();
/** Write `<cwd>/AGENTS.md` unless it already holds `contents`. */
async function writeAgentsMd(cwd, contents) {
	if (!contents) return;
	const dest = (0, node_path.join)(cwd, "AGENTS.md");
	if (written.get(dest) === contents) return;
	try {
		if (await (0, node_fs_promises.readFile)(dest, "utf8") === contents) {
			written.set(dest, contents);
			return;
		}
	} catch {}
	await (0, node_fs_promises.writeFile)(dest, contents, "utf8");
	written.set(dest, contents);
}
/** Drop the write cache, e.g. when a driver closes and workspaces may be gone. */
function forgetWrittenAgentsMd() {
	written.clear();
}

export { forgetWrittenAgentsMd, writeAgentsMd };
