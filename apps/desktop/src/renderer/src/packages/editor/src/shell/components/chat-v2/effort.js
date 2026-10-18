// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/effort.ts

/**
* Pick the effort to show and send: the user's choice when the selected model
* reports it, otherwise the model's reported default, otherwise its first
* reported effort. Returns `undefined` when the model reports no efforts, which
* hides the picker and sends no effort on the turn.
*/
function resolveEffort(efforts, selected, defaultEffort) {
	if (efforts.length === 0) return void 0;
	if (selected && efforts.some((choice) => choice.value === selected)) return selected;
	if (defaultEffort && efforts.some((choice) => choice.value === defaultEffort)) return defaultEffort;
	return efforts[0]?.value;
}
/** Display text for a reported effort: capitalized, with `xhigh` spelled out. */
function effortLabel(value) {
	if (value === "xhigh") return "Extra high";
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export { effortLabel, resolveEffort };
