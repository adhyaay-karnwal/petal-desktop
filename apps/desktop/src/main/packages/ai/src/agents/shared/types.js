// Reconstructed from index.js — original module: packages/ai/src/agents/shared/types.ts

/** Longest title the renderer keeps, matching the v1 CLI path. */
var TITLE_MAX_LENGTH = 80;
/** How long to wait for the agent to persist a session name. */
var TITLE_TIMEOUT_MS = 25e3;
/** Normalize a stored session name into a title, or empty when none is usable. */
function sanitizeTitle(raw) {
	return raw.trim().replace(/^["“]|["”]$/g, "").replace(/\s+/g, " ").trim().slice(0, TITLE_MAX_LENGTH);
}

export { TITLE_TIMEOUT_MS, sanitizeTitle };
