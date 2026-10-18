// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/colorTokenMatch.ts

var COLOR_PREFIX = /^(?:border-[trblxyse]|ring-offset|bg|text|border|outline|ring|shadow|decoration|fill|stroke|accent|caret|divide|placeholder)-/;
/** The token part of a color class: `bg-neutral-foreground` → `neutral-foreground`. */
function colorTokenName(className) {
	return className.replace(COLOR_PREFIX, "");
}
/** True when the browser accepts `text` as a color (`red`, `#fff`, `rgb(…)`). */
function isCssColor(text) {
	return typeof CSS !== "undefined" && CSS.supports("color", text.trim());
}
/** Text that could name a token: a bare word, not a hex code or color function. */
function isTokenQuery(text) {
	return /^[a-z][\w-]*$/i.test(text.trim());
}
var normalize$3 = (text) => colorTokenName(text.trim().toLowerCase());
/**
* Tokens whose name contains the query: exact names first, then names that
* start with it, then the rest, each in library order.
*/
function matchColorTokens(tokens, query, limit = 8) {
	if (!isTokenQuery(query)) return [];
	const q = normalize$3(query);
	const ranked = [];
	for (const token of tokens) {
		const name = colorTokenName(token.className).toLowerCase();
		const rank = name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : -1;
		if (rank >= 0) ranked.push({
			token,
			rank
		});
	}
	return ranked.sort((a, b) => a.rank - b.rank).slice(0, limit).map((r) => r.token);
}
/** The one token named exactly `query`, or null when none or several are. */
function exactColorToken(tokens, query) {
	if (!isTokenQuery(query)) return null;
	const q = normalize$3(query);
	const exact = tokens.filter((t) => colorTokenName(t.className).toLowerCase() === q);
	return exact.length === 1 ? exact[0] : null;
}

export { colorTokenName, exactColorToken, isCssColor, isTokenQuery, matchColorTokens };
