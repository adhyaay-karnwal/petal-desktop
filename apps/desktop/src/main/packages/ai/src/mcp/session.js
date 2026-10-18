// Reconstructed from index.js — original module: packages/ai/src/mcp/session.ts

var McpSession = class {
	/** Petal project this connection is bound to, once the host sets it. */
	projectId;
	/** In-app chat tab this connection is bound to; external clients leave it unset. */
	chatTabId;
	/** In-app turn this connection belongs to; omitted for external MCP clients. */
	streamId;
	/** `element_id → subtree hash` captured from `canvas_read` results. */
	coveringReads = /* @__PURE__ */ new Map();
	constructor(options = {}) {
		this.projectId = options.projectId;
		this.chatTabId = options.chatTabId;
		this.streamId = options.streamId;
	}
	/** Bind this connection to a Petal project. */
	bindProject(projectId) {
		this.projectId = projectId;
	}
	/** Bind this connection to an in-app chat tab. */
	bindChatTab(chatTabId) {
		this.chatTabId = chatTabId;
	}
	/** Bind this connection to one in-app chat turn. */
	bindStreamTurn(streamId) {
		this.streamId = streamId;
	}
	/** Record hashes from a typed `canvas_read` result. */
	recordCoveringReads(reads) {
		for (const [id, hash] of Object.entries(reads)) this.coveringReads.set(id, hash);
	}
	/**
	* Follow a canvas write. A recorded read moves to the write's `after` hash
	* only while it still equals `before`: the agent's own write keeps its read
	* fresh, and a read someone else had already made stale stays stale. A copied
	* node counts as read only while the source node's read is current; that is
	* checked first, against the same pre-write hashes as `coveringReadChanges`.
	*/
	recordCanvasWrite(update) {
		if (update.coveringReads) this.recordCoveringReads(update.coveringReads);
		for (const [copyId, copyHash, sourceId, sourceHash] of update.coveringReadsFromSource ?? []) if (this.coveringReads.get(sourceId) === sourceHash) this.coveringReads.set(copyId, copyHash);
		for (const [id, before, after] of update.coveringReadChanges ?? []) {
			if (this.coveringReads.get(id) !== before) continue;
			if (after === null) this.coveringReads.delete(id);
			else this.coveringReads.set(id, after);
		}
	}
};

export { McpSession };
