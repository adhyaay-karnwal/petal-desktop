// Reconstructed from index.js — original module: packages/ai/src/agents/shared/model-provider.ts

/**
* The company behind a model, for agents whose catalogs mix several (Cursor,
* OpenCode) and report none. Matched on the model id and label, since a
* gateway such as OpenCode Zen serves many companies' models under one
* provider id.
*/
var MODEL_PROVIDERS = [
	[/claude|opus|sonnet|haiku|fable/, "Anthropic"],
	[/gpt|codex|\bo\d/, "OpenAI"],
	[/gemini|gemma/, "Google"],
	[/grok/, "xAI"],
	[/composer/, "Cursor"],
	[/kimi/, "Moonshot"],
	[/glm/, "Z.ai"],
	[/llama|muse/, "Meta"],
	[/\bmai\b|\bphi\b/, "Microsoft"],
	[/deepseek/, "DeepSeek"],
	[/qwen/, "Qwen"],
	[/mistral|codestral|devstral/, "Mistral"],
	[/minimax/, "MiniMax"]
];
function modelProvider(id, label) {
	const name = `${id} ${label}`.toLowerCase();
	return MODEL_PROVIDERS.find(([pattern]) => pattern.test(name))?.[1];
}

export { modelProvider };
