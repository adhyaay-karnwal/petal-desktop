// Reconstructed from index.js — original module: app/src/main/agentActivity.ts
import { createIdleDeadline } from "./idleDeadline.js";

/**
* "Agent working" for external MCP clients.
*
* In-app chat marks its project as working for the whole run. An external client
* (Cursor, a terminal agent) has no run boundary we can see, so a session counts
* as working while it keeps calling tools, and finishes once it has been quiet
* for `idleMs`.
*/
function createAgentActivityTracker(options) {
	const { idleMs, setActivity } = options;
	const active = /* @__PURE__ */ new Map();
	const keyFor = (sessionId) => `mcp:${sessionId}`;
	function finish(sessionId, completed) {
		const entry = active.get(sessionId);
		if (!entry) return;
		entry.deadline.cancel();
		active.delete(sessionId);
		setActivity(entry.projectId, keyFor(sessionId), false, completed);
	}
	return {
		/** A tool call from `sessionId` on `projectId`: working now, finished once quiet. */
		touch(sessionId, projectId) {
			const entry = active.get(sessionId);
			if (entry?.projectId === projectId) {
				entry.deadline.touch();
				return;
			}
			if (entry) finish(sessionId, false);
			active.set(sessionId, {
				projectId,
				deadline: createIdleDeadline(idleMs, () => finish(sessionId, true))
			});
			setActivity(projectId, keyFor(sessionId), true);
		},
		/** The session is gone; stop showing it without a completion mark. */
		end(sessionId) {
			finish(sessionId, false);
		},
		/** The project closed; drop every session working on it. */
		endProject(projectId) {
			for (const [sessionId, entry] of active) if (entry.projectId === projectId) finish(sessionId, false);
		}
	};
}

export { createAgentActivityTracker };
