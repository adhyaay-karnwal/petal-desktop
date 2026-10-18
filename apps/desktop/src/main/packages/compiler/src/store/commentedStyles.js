// Reconstructed from index.js — original module: packages/compiler/src/store/commentedStyles.ts

/**
* Editor-only sidecar for style declarations that are temporarily disabled.
*
* The value lives in a CSS custom property so it round-trips through the
* existing style operation and persistence paths without affecting rendering.
* Code generation strips the sidecar and emits the entries as block comments.
*/
var COMMENTED_STYLES_KEY = "--petal-commented-styles";
function isCommentedStyleEntry(value) {
	if (!value || typeof value !== "object") return false;
	const entry = value;
	return (entry.group === "shadow" || entry.group === "filter") && Number.isInteger(entry.index) && entry.index >= 0 && (entry.property === "boxShadow" || entry.property === "filter" || entry.property === "backdropFilter") && typeof entry.value === "string";
}
function parseCommentedStyles(value) {
	if (typeof value !== "string" || value.length === 0) return [];
	try {
		const parsed = JSON.parse(decodeURIComponent(value));
		return Array.isArray(parsed) ? parsed.filter(isCommentedStyleEntry) : [];
	} catch {
		return [];
	}
}
function splitCommentedStyles(styles) {
	if (!styles) return {
		styles: {},
		commented: []
	};
	const next = { ...styles };
	const commented = parseCommentedStyles(next[COMMENTED_STYLES_KEY]);
	delete next[COMMENTED_STYLES_KEY];
	return {
		styles: next,
		commented
	};
}
/** Serialize one entry as a plain commented-out style declaration. */
function commentedStyleComment(entry) {
	const value = JSON.stringify(entry.value).replace(/\*\//g, "*\\/");
	return `${JSON.stringify(entry.property)}: ${value},`;
}

export { commentedStyleComment, splitCommentedStyles };
