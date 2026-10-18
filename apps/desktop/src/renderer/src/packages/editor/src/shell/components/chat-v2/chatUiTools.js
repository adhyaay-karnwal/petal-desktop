// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/chatUiTools.ts

function parseAskUserQuestions$1(input) {
	if (!Array.isArray(input?.questions)) return [];
	return input.questions.filter((entry) => entry && typeof entry.question === "string" && Array.isArray(entry.options)).map((entry) => ({
		question: entry.question,
		options: entry.options.filter((option) => option && typeof option.label === "string").map((option) => ({
			label: option.label,
			description: typeof option.description === "string" ? option.description : void 0
		}))
	})).filter((question) => question.options.length > 0);
}
function parseImportProgress$1(input) {
	if (!Array.isArray(input?.steps)) return null;
	const steps = input.steps.filter((step) => step && typeof step.label === "string").map((step) => ({
		label: step.label,
		status: step.status === "done" || step.status === "active" ? step.status : "pending"
	}));
	if (steps.length === 0) return null;
	return {
		title: typeof input.title === "string" && input.title ? input.title : void 0,
		steps
	};
}
/** Sent by the checklist card's Resume button; the skill's continuation rules pick up from the saved state. */
var RESUME_IMPORT_PROMPT$1 = "Resume the design system import from where it stopped. Check what was already imported and what is already on the canvas, then continue with the next unfinished step.";
/**
* Asked by the app the instant an import starts, so the user never waits on
* the CLI booting to choose. Mirrors the questions the import skill asks;
* the answer is queued and sent as the next message.
*/
var IMPORT_SEED_QUESTIONS$1 = [{
	question: "What do you want to import?",
	options: [
		{ label: "Styles and icons" },
		{ label: "Styles, icons, and core components" },
		{ label: "Everything" }
	]
}, {
	question: "Do you want it documented on the canvas?",
	options: [{
		label: "Document it on the canvas",
		description: "A Design System page showing the styles and every component."
	}, {
		label: "Just import it",
		description: "Styles apply and components appear in Assets. Nothing on the canvas."
	}]
}];
/** The starting checklist, shown from import kick-off until the agent's first `report_import_progress`. */
var IMPORT_SEED_PROGRESS$1 = { steps: [{
	label: "Scan the source",
	status: "active"
}, {
	label: "Choose what to import",
	status: "pending"
}] };
/**
* Whether a message starts a design-system import: the chat card and the shell
* send `IMPORT_DESIGN_SYSTEM_PROMPT`, the desktop source chooser names the
* picked folder ("Import the design system from /path …"), or the user typed
* it themselves. A question about importing ("How do I import a design
* system?") is not a request to run one.
*/
function isImportDesignSystemPrompt$1(text) {
	return /\bimport\b/i.test(text) && /design system/i.test(text) && !/^\s*(how|what|why|where|when|which|is|are|do|does|should)\b/i.test(text);
}

export { IMPORT_SEED_PROGRESS$1, IMPORT_SEED_QUESTIONS$1, RESUME_IMPORT_PROMPT$1, isImportDesignSystemPrompt$1, parseAskUserQuestions$1, parseImportProgress$1 };
