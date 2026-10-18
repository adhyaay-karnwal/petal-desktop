// Reconstructed from index.js — original module: app/src/main/mcpSession.ts

var DEFAULT_TTL_MS = 216e5;
function createMcpSessionRegistry(options) {
	const { getOpenProjectIds, onSessionDestroyed, ttlMs = DEFAULT_TTL_MS, now = Date.now, newSessionId = () => crypto.randomUUID() } = options;
	const sessions = /* @__PURE__ */ new Map();
	const streams = /* @__PURE__ */ new Map();
	function create() {
		const sessionId = newSessionId();
		sessions.set(sessionId, { lastActiveAt: now() });
		return sessionId;
	}
	function has(sessionId) {
		return sessions.has(sessionId);
	}
	function touch(sessionId) {
		const session = sessions.get(sessionId);
		if (session) session.lastActiveAt = now();
	}
	function destroy(sessionId) {
		sessions.delete(sessionId);
		onSessionDestroyed?.(sessionId);
		const open = streams.get(sessionId);
		if (!open) return;
		streams.delete(sessionId);
		for (const stream of open) try {
			if (!stream.writableEnded) stream.end();
		} catch {}
	}
	/**
	* Drop idle sessions. A session with an open SSE stream is never idle: the
	* client is still attached even if it has sent no requests.
	*/
	function prune() {
		const at = now();
		for (const [sessionId, session] of sessions) {
			if (streams.has(sessionId)) continue;
			if (at - session.lastActiveAt > ttlMs) destroy(sessionId);
		}
	}
	function setProject(sessionId, projectId) {
		const session = sessions.get(sessionId);
		if (session) session.projectId = projectId;
	}
	function projectIdOf(sessionId) {
		return sessions.get(sessionId)?.projectId;
	}
	/**
	* External clients arrive without a project. With a single project open there
	* is nothing to disambiguate, so bind to it and save the client a
	* project_list + project_pick round trip. With several open the choice is
	* genuinely the user's — stay unbound so the client is routed through
	* project_pick.
	*/
	function ensureBound(sessionId) {
		if (projectIdOf(sessionId)) return;
		const openIds = getOpenProjectIds();
		if (openIds.length === 1) setProject(sessionId, openIds[0]);
	}
	/**
	* A project the user closed must not keep a session pointing at it: the next
	* tool call would be told the project "is not open", which reads as fatal and
	* stops the agent. Clearing the binding routes it through project_pick and
	* lets it recover on its own.
	*/
	function unbindProject(projectId) {
		for (const session of sessions.values()) if (session.projectId === projectId) session.projectId = void 0;
	}
	/** Resolve the session for a post-initialize request (`tools/list`, `tools/call`). */
	function resolveForCall(sessionId) {
		if (!sessionId) return {
			ok: false,
			status: 400,
			code: -32e3,
			message: "Mcp-Session-Id required"
		};
		if (!sessions.has(sessionId)) return {
			ok: false,
			status: 404,
			code: -32001,
			message: "Session not found"
		};
		return {
			ok: true,
			sessionId
		};
	}
	/**
	* Resolve for `initialize`, which must always succeed — it is the recovery
	* path a 404 sends the client down, so an unknown id starts a fresh session
	* rather than failing.
	*/
	function resolveForInitialize(sessionId) {
		if (sessionId && sessions.has(sessionId)) return sessionId;
		prune();
		return create();
	}
	function addStream(sessionId, stream) {
		let open = streams.get(sessionId);
		if (!open) {
			open = /* @__PURE__ */ new Set();
			streams.set(sessionId, open);
		}
		open.add(stream);
	}
	/**
	* Detach a closed SSE stream. The session deliberately survives: clients may
	* close the standalone stream at any time and keep POSTing, and the SDK
	* client reconnects it. Idle sessions are reclaimed by `prune`.
	*/
	function removeStream(sessionId, stream) {
		const open = streams.get(sessionId);
		if (!open || !open.has(stream)) return false;
		open.delete(stream);
		if (open.size === 0) streams.delete(sessionId);
		touch(sessionId);
		return true;
	}
	function hasStream(sessionId) {
		return streams.has(sessionId);
	}
	return {
		create,
		has,
		touch,
		destroy,
		prune,
		setProject,
		projectIdOf,
		ensureBound,
		unbindProject,
		resolveForCall,
		resolveForInitialize,
		addStream,
		removeStream,
		hasStream,
		get size() {
			return sessions.size;
		}
	};
}

export { createMcpSessionRegistry };
