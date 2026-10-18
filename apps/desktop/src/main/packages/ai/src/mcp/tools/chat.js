// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/chat.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { defineTool, textResult } from "./utils.js";

/**
* Chat-UI MCP tools.
*
* Their real output is a card in the Petal chat, not data: the chat reads
* the card's content straight from the tool call's input, and the handler only
* tells the agent what happened. `/mcp` registers them only on a transport
* bound to a chat tab (`chatTabId` query), so an external client, which has
* nowhere to show the card, never sees them.
*/
/** The chat-UI tool catalog; no tool here reaches the host. */
function createChatTools() {
	return [defineTool({
		name: "report_import_progress",
		config: {
			description: "Publish a live import checklist to the Petal chat UI. Call it as your very first action when an import starts, right before every ask_user call, and again whenever a step starts or finishes. Always send the complete step list (the UI shows only the latest call), with statuses pending | active | done — exactly one step is active at a time. The UI shows file-level activity from your tool calls automatically — no need to narrate it.",
			inputSchema: {
				title: require_dist$2.string().optional().describe("Card heading, e.g. \"Importing Acme design system\""),
				steps: require_dist$2.array(require_dist$2.object({
					label: require_dist$2.string().describe("Short user-facing step name, e.g. \"Colors and fonts\""),
					status: require_dist$2._enum([
						"pending",
						"active",
						"done"
					])
				})).min(1).max(30).describe("The full checklist, resent on every call")
			}
		},
		async execute() {
			return textResult("Progress shown to the user.");
		}
	}), defineTool({
		name: "ask_user",
		config: {
			description: "Ask the user one or more multiple-choice questions in the Petal chat. Renders an interactive question card (one question at a time, options with a short bold label and an optional muted description). The card appears immediately, so ask as early as possible and keep doing preparatory work (reading, scanning) while the user answers; the selections arrive as the user's next chat message, one \"<question> <answer>\" line per question, after your turn ends. Never wait for the answer inside a turn: finish the work that does not depend on it, then end your turn.",
			inputSchema: { questions: require_dist$2.array(require_dist$2.object({
				question: require_dist$2.string().describe("The question, e.g. \"What do you want to import?\""),
				options: require_dist$2.array(require_dist$2.object({
					label: require_dist$2.string().describe("Short answer label, e.g. \"Styles only\""),
					description: require_dist$2.string().optional().describe("Optional one-line clarification, e.g. \"Colors, fonts, spacing and effects, plus icon setup\"")
				})).min(2).max(5)
			})).min(1).max(4) }
		},
		async execute() {
			return textResult("Questions shown to the user. End your turn and wait for their reply.");
		}
	})];
}

export { createChatTools };
