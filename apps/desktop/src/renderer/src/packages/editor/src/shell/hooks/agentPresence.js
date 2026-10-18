// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/agentPresence.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/**
* Where agents are working on the canvas, per top-level frame.
*
* Presence never blocks the user: it only drives the "AI" badge and camera
* follow. Every agent read or write of an element touches its frame, and the
* entry expires on its own once that agent has left the frame alone for
* `ttlMs`, so a crashed or orphaned agent cannot leave a badge behind.
*/
/** Matches Paper: long enough to bridge an agent's thinking between calls. */
var AGENT_PRESENCE_TTL_MS = 4e4;
function createAgentPresence({ ttlMs = AGENT_PRESENCE_TTL_MS, now = Date.now, onChange }) {
	const entries = /* @__PURE__ */ new Map();
	let timer = null;
	const publish = () => onChange(new Map(entries));
	const schedule = () => {
		if (timer !== null) clearTimeout(timer);
		timer = null;
		let next = Infinity;
		for (const entry of entries.values()) next = Math.min(next, entry.touchedAt + ttlMs);
		if (next === Infinity) return;
		timer = setTimeout(expire, Math.max(0, next - now()));
	};
	const expire = () => {
		timer = null;
		const cutoff = now() - ttlMs;
		let changed = false;
		for (const [rootId, entry] of entries) if (entry.touchedAt <= cutoff) {
			entries.delete(rootId);
			changed = true;
		}
		if (changed) publish();
		schedule();
	};
	return {
		touch(rootIds, agent, kind) {
			const { agentId } = agent;
			const chatTabId = agent.chatTabId ?? "";
			const at = now();
			let changed = false;
			for (const rootId of rootIds) {
				const previous = entries.get(rootId);
				const sameAgent = previous?.agentId === agentId;
				const wrote = kind === "write" || sameAgent && previous.wrote;
				if (!sameAgent || previous.wrote !== wrote || previous.chatTabId !== chatTabId) changed = true;
				entries.set(rootId, {
					agentId,
					chatTabId,
					wrote,
					touchedAt: at
				});
			}
			if (changed) publish();
			schedule();
		},
		/** A chat run ended: its agent is gone, so its frames are free now. */
		clearChat(chatTabId) {
			let changed = false;
			for (const [rootId, entry] of entries) if (entry.chatTabId === chatTabId) {
				entries.delete(rootId);
				changed = true;
			}
			if (changed) {
				publish();
				schedule();
			}
		},
		dispose() {
			if (timer !== null) clearTimeout(timer);
			timer = null;
		}
	};
}
/** Presence for one editor: a stable controller plus the entries to render. */
function useAgentPresence() {
	const $ = (0, import_compiler_runtime.c)(7);
	const [entries, setEntries] = (0, import_react.useState)(_temp$34);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => createAgentPresence({ onChange: setEntries });
		$[0] = t0;
	} else t0 = $[0];
	const [presence] = (0, import_react.useState)(t0);
	let t1;
	let t2;
	if ($[1] !== presence) {
		t1 = () => () => presence.dispose();
		t2 = [presence];
		$[1] = presence;
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[4] !== entries || $[5] !== presence) {
		t3 = {
			presence,
			entries
		};
		$[4] = entries;
		$[5] = presence;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function _temp$34() {
	return /* @__PURE__ */ new Map();
}

export { useAgentPresence };
