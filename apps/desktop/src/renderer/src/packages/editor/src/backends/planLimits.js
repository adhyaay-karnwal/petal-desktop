// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/backends/planLimits.ts

/** Plan-limit `reason` codes from the Petal API (`402` or MCP usage block). */
var PLAN_LIMIT_REASONS = [
	"max_projects",
	"project_size",
	"invite_people",
	"mcp_usage"
];
/** True when a thrown backend error was already surfaced via the upgrade modal. */
function isPlanLimitError(err) {
	if (!err || typeof err !== "object") return false;
	const reason = err.reason;
	return typeof reason === "string" && isPlanLimitReason(reason);
}
function isPlanLimitReason(value) {
	return PLAN_LIMIT_REASONS.includes(value);
}
function planLimitTitle(reason) {
	switch (reason) {
		case "max_projects": return "Project limit reached";
		case "invite_people": return "Invites need a paid plan";
		case "project_size": return "Project size limit reached";
		case "mcp_usage": return "MCP calls limit reached";
	}
}

export { isPlanLimitError, isPlanLimitReason, planLimitTitle };
