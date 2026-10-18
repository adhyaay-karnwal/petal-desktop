// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/slashToken.ts

/**
* Where the composer's `/` skill picker opens, and what choosing a skill writes.
*
* A `/` opens the picker at the start of the message or of a line, after a
* space, or right after an inline reference chip. Anywhere else it is part of a
* word, so `a/b`, `src/app` and `https://` never open it.
*/
var SLASH_QUERY_RE = /(?:^|\s)\/([\w:-]*)$/;
/**
* The query typed after `/`, or null when the caret is not in a skill token.
* `before` is the text from the token's boundary up to the caret: the caret's
* text node, prefixed with the last character before that node, if any.
*/
function slashQueryBefore(before) {
	return SLASH_QUERY_RE.exec(before)?.[1] ?? null;
}
/**
* The text that replaces `/query` before the caret: `/name`, plus a space
* unless the text after the caret already starts with one. The space is a
* no-break space, like the gap after a reference chip: Chrome drops a plain
* trailing space from a text node once the user types after it.
*/
function slashCommandInsertion(name, after) {
	return /^\s/.test(after) ? `/${name}` : `/${name} `;
}
/** Reference chips, line breaks and line wrappers end a word; other elements are inline text. */
function isBoundary(node) {
	const el = node;
	return !!el.dataset?.refId || el.tagName === "BR" || el.tagName === "DIV" || el.tagName === "P";
}
/**
* The last character before `node` in the same line, or '' at a boundary.
* An ordinary inline element (`<b>src</b>`) gives its last character, so
* `src/app` stays a path.
*/
function charBeforeTextNode(node) {
	let previous = node.previousSibling;
	while (previous?.nodeType === Node.TEXT_NODE && !previous.textContent) previous = previous.previousSibling;
	if (!previous) return "";
	if (previous.nodeType === Node.TEXT_NODE) return previous.textContent.slice(-1);
	return isBoundary(previous) ? "" : (previous.textContent ?? "").slice(-1);
}
/**
* True when only whitespace comes before `offset` in `node` inside `root`: the
* token starts the message, where agents also run built-in commands.
*/
function startsMessage(root, node, offset) {
	if (node.data.slice(0, offset).trim()) return false;
	for (let current = node; current && current !== root; current = current.parentNode) for (let previous = current.previousSibling; previous; previous = previous.previousSibling) if (previous.dataset?.refId || previous.textContent?.trim()) return false;
	return true;
}

export { charBeforeTextNode, slashCommandInsertion, slashQueryBefore, startsMessage };
