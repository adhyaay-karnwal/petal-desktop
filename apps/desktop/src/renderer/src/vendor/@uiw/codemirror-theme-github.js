// Reconstructed from index-C74mRL57.js — original module: vendor/@uiw/codemirror-theme-github
import { tags$1 } from "../@lezer/highlight.js";
import { _extends } from "../@babel/runtime.js";
import { createTheme } from "./codemirror-themes.js";

/**
* @name github
*/
var defaultSettingsGithubLight = {
	background: "#fff",
	foreground: "#24292e",
	selection: "#BBDFFF",
	selectionMatch: "#BBDFFF",
	gutterBackground: "#fff",
	gutterForeground: "#6e7781"
};
var githubLightStyle = [
	{
		tag: [tags$1.standard(tags$1.tagName), tags$1.tagName],
		color: "#116329"
	},
	{
		tag: [tags$1.comment, tags$1.bracket],
		color: "#6a737d"
	},
	{
		tag: [tags$1.className, tags$1.propertyName],
		color: "#6f42c1"
	},
	{
		tag: [
			tags$1.variableName,
			tags$1.attributeName,
			tags$1.number,
			tags$1.operator
		],
		color: "#005cc5"
	},
	{
		tag: [
			tags$1.keyword,
			tags$1.typeName,
			tags$1.typeOperator,
			tags$1.typeName
		],
		color: "#d73a49"
	},
	{
		tag: [
			tags$1.string,
			tags$1.meta,
			tags$1.regexp
		],
		color: "#032f62"
	},
	{
		tag: [tags$1.name, tags$1.quote],
		color: "#22863a"
	},
	{
		tag: [tags$1.heading, tags$1.strong],
		color: "#24292e",
		fontWeight: "bold"
	},
	{
		tag: [tags$1.emphasis],
		color: "#24292e",
		fontStyle: "italic"
	},
	{
		tag: [tags$1.deleted],
		color: "#b31d28",
		backgroundColor: "ffeef0"
	},
	{
		tag: [
			tags$1.atom,
			tags$1.bool,
			tags$1.special(tags$1.variableName)
		],
		color: "#e36209"
	},
	{
		tag: [
			tags$1.url,
			tags$1.escape,
			tags$1.regexp,
			tags$1.link
		],
		color: "#032f62"
	},
	{
		tag: tags$1.link,
		textDecoration: "underline"
	},
	{
		tag: tags$1.strikethrough,
		textDecoration: "line-through"
	},
	{
		tag: tags$1.invalid,
		color: "#cb2431"
	}
];
var githubLightInit = (options) => {
	var { theme = "light", settings = {}, styles = [] } = options || {};
	return createTheme({
		theme,
		settings: _extends({}, defaultSettingsGithubLight, settings),
		styles: [...githubLightStyle, ...styles]
	});
};
var githubLight = githubLightInit();
var defaultSettingsGithubDark = {
	background: "#0d1117",
	foreground: "#c9d1d9",
	caret: "#c9d1d9",
	selection: "#003d73",
	selectionMatch: "#003d73",
	lineHighlight: "#36334280"
};
var githubDarkStyle = [
	{
		tag: [tags$1.standard(tags$1.tagName), tags$1.tagName],
		color: "#7ee787"
	},
	{
		tag: [tags$1.comment, tags$1.bracket],
		color: "#8b949e"
	},
	{
		tag: [tags$1.className, tags$1.propertyName],
		color: "#d2a8ff"
	},
	{
		tag: [
			tags$1.variableName,
			tags$1.attributeName,
			tags$1.number,
			tags$1.operator
		],
		color: "#79c0ff"
	},
	{
		tag: [
			tags$1.keyword,
			tags$1.typeName,
			tags$1.typeOperator,
			tags$1.typeName
		],
		color: "#ff7b72"
	},
	{
		tag: [
			tags$1.string,
			tags$1.meta,
			tags$1.regexp
		],
		color: "#a5d6ff"
	},
	{
		tag: [tags$1.name, tags$1.quote],
		color: "#7ee787"
	},
	{
		tag: [tags$1.heading, tags$1.strong],
		color: "#d2a8ff",
		fontWeight: "bold"
	},
	{
		tag: [tags$1.emphasis],
		color: "#d2a8ff",
		fontStyle: "italic"
	},
	{
		tag: [tags$1.deleted],
		color: "#ffdcd7",
		backgroundColor: "ffeef0"
	},
	{
		tag: [
			tags$1.atom,
			tags$1.bool,
			tags$1.special(tags$1.variableName)
		],
		color: "#ffab70"
	},
	{
		tag: tags$1.link,
		textDecoration: "underline"
	},
	{
		tag: tags$1.strikethrough,
		textDecoration: "line-through"
	},
	{
		tag: tags$1.invalid,
		color: "#f97583"
	}
];
var githubDarkInit = (options) => {
	var { theme = "dark", settings = {}, styles = [] } = options || {};
	return createTheme({
		theme,
		settings: _extends({}, defaultSettingsGithubDark, settings),
		styles: [...githubDarkStyle, ...styles]
	});
};
var githubDark = githubDarkInit();

export { githubDark, githubDarkStyle, githubLight, githubLightStyle };
