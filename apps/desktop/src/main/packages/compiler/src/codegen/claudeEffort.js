// Reconstructed from index.js — original module: packages/compiler/src/codegen/claudeEffort.ts

var CLAUDE_EFFORT_LEVELS = [
	"low",
	"medium",
	"high",
	"xhigh",
	"max",
	"ultracode"
];
var STANDARD_LEVELS = [
	"low",
	"medium",
	"high",
	"max"
];
var FULL_EFFORT_MODELS = /* @__PURE__ */ new Set([
	"claude-fable-5-1",
	"claude-fable-5",
	"claude-opus-5-5",
	"claude-opus-5",
	"claude-opus-4-8",
	"claude-opus-4-7",
	"claude-sonnet-5"
]);
/** Claude Code's supported effort levels for the models offered by Petal. */
function getClaudeEffortLevels(model) {
	if (FULL_EFFORT_MODELS.has(model)) return CLAUDE_EFFORT_LEVELS;
	if (model === "claude-opus-4-6" || model === "claude-sonnet-4-6") return STANDARD_LEVELS;
	return [];
}
/** Validate saved/IPC input and match Claude Code's fallback for older models. */
function resolveClaudeEffort(model, effort) {
	const supported = getClaudeEffortLevels(model);
	if (typeof effort !== "string" || !CLAUDE_EFFORT_LEVELS.includes(effort) || supported.length === 0) return void 0;
	if ((effort === "xhigh" || effort === "ultracode") && !supported.includes("xhigh")) return "high";
	return effort;
}
/**
* Map a composer choice to a `CLAUDE_CODE_EFFORT_LEVEL` value. The env var is parsed
* without the `ultracode` alias that `--effort` accepts, so it must be pre-resolved to
* xhigh; pass `ultracode` through verbatim to `--effort`, which is what enables the mode.
*/
function toClaudeEffortEnvValue(effort) {
	return effort === "ultracode" ? "xhigh" : effort;
}
new RegExp("^(?:" + [
	"m[trblxyse]?-.+",
	"flex-(?:1|auto|initial|none)",
	"grow(?:-.+)?",
	"shrink(?:-.+)?",
	"basis-.+",
	"self-.+",
	"justify-self-.+",
	"place-self-.+",
	"order-.+",
	"(?:col|row)-(?:span|start|end)-.+",
	"(?:col|row)-auto",
	"w-.+",
	"min-[wh]-.+",
	"max-[wh]-.+",
	"h-(?:full|auto|fit|screen|dvh|svh|lvh)",
	"size-full",
	"aspect-.+",
	"static",
	"relative",
	"absolute",
	"fixed",
	"sticky",
	"inset(?:-[xy])?-.+",
	"(?:top|right|bottom|left|start|end)-.+",
	"z-.+",
	"hidden",
	"invisible",
	"visible",
	"sr-only",
	"not-sr-only",
	"contents",
	"isolate",
	"(?:group|peer)(?:/.+)?"
].join("|") + ")$");

export { resolveClaudeEffort, toClaudeEffortEnvValue };
