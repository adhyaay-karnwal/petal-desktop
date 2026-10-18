// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/lib/planRecommendations.ts
import { isApiError } from "../client.js";

var PLAN_LIMIT_REASONS$1 = [
	"max_projects",
	"project_size",
	"invite_people",
	"mcp_usage"
];
function isPlanLimitReason$1(value) {
	return PLAN_LIMIT_REASONS$1.includes(value);
}
function isPlanLimitError$1(err) {
	return isApiError(err) && isPlanLimitReason$1(err.reason);
}
/** Next paid plan for this limit, or null when already on Pro (highest). Basic always recommends Pro. */
function recommendPaidPlan(opts) {
	const needed = opts.currentPlan === "pro" ? null : opts.currentPlan === "basic" || opts.reason === "mcp_usage" ? "pro" : "basic";
	if (needed == null) return null;
	if (opts.catalog.length > 0 && !opts.catalog.some((p) => p.id === needed)) return null;
	return needed;
}
function planLimitTitle$1(reason) {
	switch (reason) {
		case "max_projects": return "File limit reached";
		case "invite_people": return "Invites need a paid plan";
		case "project_size": return "File size limit reached";
		case "mcp_usage": return "MCP calls limit reached";
	}
}

export { isPlanLimitError$1, isPlanLimitReason$1, planLimitTitle$1, recommendPaidPlan };
