// Reconstructed from index-C74mRL57.js — original module: vendor/@codemirror/theme-one-dark
import { tags$1 } from "../@lezer/highlight.js";
import { EditorView$1 } from "./view.js";
import { HighlightStyle, syntaxHighlighting } from "./language.js";

var chalky = "#e5c07b";
var coral = "#e06c75";
var cyan = "#56b6c2";
var invalid = "#ffffff";
var ivory = "#abb2bf";
var stone = "#7d8799";
var malibu = "#61afef";
var sage = "#98c379";
var whiskey = "#d19a66";
var violet = "#c678dd";
var darkBackground = "#21252b";
var highlightBackground = "#2c313a";
var background = "#282c34";
var tooltipBackground = "#353a42";
var selection = "#3E4451";
var cursor = "#528bff";
/**
Extension to enable the One Dark theme (both the editor theme and
the highlight style).
*/
var oneDark = [/* @__PURE__ */ EditorView$1.theme({
	"&": {
		color: ivory,
		backgroundColor: background
	},
	".cm-content": { caretColor: cursor },
	".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
	"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: selection },
	".cm-panels": {
		backgroundColor: darkBackground,
		color: ivory
	},
	".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
	".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },
	".cm-searchMatch": {
		backgroundColor: "#72a1ff59",
		outline: "1px solid #457dff"
	},
	".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#6199ff2f" },
	".cm-activeLine": { backgroundColor: "#6699ff0b" },
	".cm-selectionMatch": { backgroundColor: "#aafe661a" },
	"&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bad0f847" },
	".cm-gutters": {
		backgroundColor: background,
		color: stone,
		border: "none"
	},
	".cm-activeLineGutter": { backgroundColor: highlightBackground },
	".cm-foldPlaceholder": {
		backgroundColor: "transparent",
		border: "none",
		color: "#ddd"
	},
	".cm-tooltip": {
		border: "none",
		backgroundColor: tooltipBackground
	},
	".cm-tooltip .cm-tooltip-arrow:before": {
		borderTopColor: "transparent",
		borderBottomColor: "transparent"
	},
	".cm-tooltip .cm-tooltip-arrow:after": {
		borderTopColor: tooltipBackground,
		borderBottomColor: tooltipBackground
	},
	".cm-tooltip-autocomplete": { "& > ul > li[aria-selected]": {
		backgroundColor: highlightBackground,
		color: ivory
	} }
}, { dark: true }), /*@__PURE__*/ syntaxHighlighting(/* @__PURE__ */ HighlightStyle.define([
	{
		tag: tags$1.keyword,
		color: violet
	},
	{
		tag: [
			tags$1.name,
			tags$1.deleted,
			tags$1.character,
			tags$1.propertyName,
			tags$1.macroName
		],
		color: coral
	},
	{
		tag: [/*@__PURE__*/ tags$1.function(tags$1.variableName), tags$1.labelName],
		color: malibu
	},
	{
		tag: [
			tags$1.color,
			/*@__PURE__*/ tags$1.constant(tags$1.name),
			/*@__PURE__*/ tags$1.standard(tags$1.name)
		],
		color: whiskey
	},
	{
		tag: [/*@__PURE__*/ tags$1.definition(tags$1.name), tags$1.separator],
		color: ivory
	},
	{
		tag: [
			tags$1.typeName,
			tags$1.className,
			tags$1.number,
			tags$1.changed,
			tags$1.annotation,
			tags$1.modifier,
			tags$1.self,
			tags$1.namespace
		],
		color: chalky
	},
	{
		tag: [
			tags$1.operator,
			tags$1.operatorKeyword,
			tags$1.url,
			tags$1.escape,
			tags$1.regexp,
			tags$1.link,
			/*@__PURE__*/ tags$1.special(tags$1.string)
		],
		color: cyan
	},
	{
		tag: [tags$1.meta, tags$1.comment],
		color: stone
	},
	{
		tag: tags$1.strong,
		fontWeight: "bold"
	},
	{
		tag: tags$1.emphasis,
		fontStyle: "italic"
	},
	{
		tag: tags$1.strikethrough,
		textDecoration: "line-through"
	},
	{
		tag: tags$1.link,
		color: stone,
		textDecoration: "underline"
	},
	{
		tag: tags$1.heading,
		fontWeight: "bold",
		color: coral
	},
	{
		tag: [
			tags$1.atom,
			tags$1.bool,
			/*@__PURE__*/ tags$1.special(tags$1.variableName)
		],
		color: whiskey
	},
	{
		tag: [
			tags$1.processingInstruction,
			tags$1.string,
			tags$1.inserted
		],
		color: sage
	},
	{
		tag: tags$1.invalid,
		color: invalid
	}
]))];

export { oneDark };
