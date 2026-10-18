// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/fontTypes.ts

var DEFAULT_FONT_PREFERENCES = {
	localFontConsentVersion: null,
	localFontConsentAt: null,
	localFontPromptDismissed: false
};
function cssString(value) {
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/[\n\r\f]/g, " ")}"`;
}
function fontFaceCss(face) {
	return `@font-face { font-family: ${cssString(face.family)}; src: url(${cssString(face.url)}); font-weight: ${face.weight}; font-style: ${face.style}; font-display: swap; }`;
}

export { DEFAULT_FONT_PREFERENCES, cssString, fontFaceCss };
