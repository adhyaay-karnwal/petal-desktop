// Reconstructed from index.js — original module: app/src/main/toolInputStream.ts

/**
* Accumulates Claude CLI `--include-partial-messages` tool-argument deltas so
* the canvas can paint while `jsx` is still being generated.
*/
var ToolInputStream = class {
	blocks = /* @__PURE__ */ new Map();
	ingest(event) {
		if (!event || typeof event !== "object") return null;
		const raw = event;
		const ev = raw.type === "stream_event" ? raw.event : event;
		if (!ev || typeof ev !== "object") return null;
		const block = ev;
		if (block.type === "content_block_start" && block.content_block?.type === "tool_use") {
			this.blocks.set(block.index ?? 0, {
				name: block.content_block.name,
				id: block.content_block.id,
				json: ""
			});
			return null;
		}
		if (block.type === "content_block_delta" && block.delta?.type === "input_json_delta") {
			const state = this.blocks.get(block.index ?? 0);
			if (!state || typeof block.delta.partial_json !== "string") return null;
			state.json += block.delta.partial_json;
			if (!state.name) return null;
			return {
				id: state.id,
				name: state.name,
				json: state.json
			};
		}
		if (block.type === "content_block_stop") this.blocks.delete(block.index ?? 0);
		return null;
	}
};

export { ToolInputStream };
