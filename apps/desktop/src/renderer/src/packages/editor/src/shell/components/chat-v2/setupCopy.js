// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/setupCopy.ts

/** Per-agent wording. Unknown agents fall back to generic wording. */
var AGENT_SETUP_COPY = {
	"claude-code": {
		account: "your Anthropic account",
		plan: "your Claude plan",
		subscription: "your Claude subscription",
		signInScope: "Petal uses the sign-in that `claude auth login` stores, so the app and the claude CLI share one account. Logging in or out with the CLI changes both."
	},
	codex: {
		account: "your ChatGPT account",
		plan: "your ChatGPT plan",
		subscription: "your ChatGPT subscription",
		signInScope: "Petal uses the sign-in that `codex login` stores, so the app and the codex CLI share one account. Logging in or out with the CLI changes both."
	},
	opencode: {
		account: "a model provider",
		plan: "your provider plan",
		subscription: "OpenCode"
	},
	cursor: {
		account: "your Cursor account",
		plan: "your Cursor plan",
		subscription: "your Cursor subscription",
		signInScope: "This sign-in belongs to Petal and is separate from the Cursor app and the cursor-agent CLI. Signing in creates an API key named “Petal” in your Cursor account.",
		signOutScope: "Signing out removes that key from this computer. It keeps working until it expires; to revoke it now, delete “Petal” under API keys in your Cursor dashboard.",
		envVars: ["CURSOR_API_KEY"],
		upgrade: "Cursor's free plan doesn't let you use its agent in external apps like Petal."
	}
};
var GENERIC_SETUP_COPY = {
	account: "your account",
	plan: "your plan",
	subscription: "your subscription"
};
function setupCopy(agentId) {
	return AGENT_SETUP_COPY[agentId] ?? GENERIC_SETUP_COPY;
}
/** Empty-state line for a signed-in account whose plan can't run the agent. */
function upgradeDescription(agent) {
	return setupCopy(agent.id).upgrade ?? `Your ${agent.label} plan doesn't include using it in Petal.`;
}

export { setupCopy, upgradeDescription };
