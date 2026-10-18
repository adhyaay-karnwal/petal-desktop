// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/constants/agentPaths.ts
import { ClaudeIcon, McpIcon } from "../../../ui/src/icons.js";

/** Marketing-site page with the desktop download. Both agent paths need the desktop app. */
var DESKTOP_DOWNLOAD_URL = "https://github.com/adhyaay-karnwal/petal-desktop/releases/latest";
/** Deep link that opens (or focuses) the installed desktop app at the dashboard. */
var DESKTOP_DEEP_LINK = "com.petal.desktop://";
/**
* Claude Code path copy on the desktop dashboard once the CLI check has resolved: the card
* knows the state, so it says what is true and what to do next instead of the generic line.
*/
var CLAUDE_STATE_COPY = {
	connected: { description: "Chat on the canvas. Claude Code is installed on your computer, so Petal is connected and uses your own subscription." },
	updateRequired: {
		description: "Chat on the canvas. Your Claude Code is older than Petal supports. Update it and Petal connects automatically.",
		action: "Update Claude Code"
	},
	notLoggedIn: {
		description: "Chat on the canvas. Claude Code is installed but not logged in. Log in with your Anthropic account and Petal connects automatically.",
		action: "Log in to Claude Code"
	},
	notInstalled: {
		description: "Chat on the canvas. Install the Claude Code CLI on your computer and Petal connects automatically, using your own subscription.",
		action: "Install Claude Code"
	}
};
/**
* The two ways to work with an agent in Petal, shown on the dashboard's
* "Connect an agent" card (with setup actions), so
* the copy lives in one place.
*/
var AGENT_PATHS = [{
	id: "claude",
	title: "Claude Code in Petal",
	description: "Chat on the canvas. When the Claude Code CLI is installed on your computer, Petal connects to it automatically and uses your own subscription.",
	webDescription: "Chat on the canvas. The desktop app connects automatically to the Claude Code CLI installed on your computer, using your own subscription.",
	Icon: ClaudeIcon
}, {
	id: "mcp",
	title: "MCP",
	description: "Connect Claude Code, Codex, Cursor, or any other agent that supports MCP, and control Petal from the tools you already use.",
	webDescription: "Connect Claude Code, Codex, Cursor, or any other agent that supports MCP. The MCP server runs inside the desktop app on your computer, so connect from there.",
	Icon: McpIcon
}];

export { AGENT_PATHS, CLAUDE_STATE_COPY, DESKTOP_DEEP_LINK, DESKTOP_DOWNLOAD_URL };
