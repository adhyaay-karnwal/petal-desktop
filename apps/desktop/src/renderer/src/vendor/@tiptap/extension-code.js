// Reconstructed from index-C74mRL57.js — original module: vendor/@tiptap/extension-code
import { Mark, markInputRule, markPasteRule, mergeAttributes } from "./core.js";

var inputRegex$2 = /(^|[^`])`([^`]+)`(?!`)$/;
var pasteRegex$1 = /(^|[^`])`([^`]+)`(?!`)/g;
var Code = Mark.create({
	name: "code",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	excludes: "_",
	code: true,
	exitable: true,
	parseHTML() {
		return [{ tag: "code" }];
	},
	renderHTML({ HTMLAttributes }) {
		return [
			"code",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0
		];
	},
	markdownTokenName: "codespan",
	parseMarkdown: (token, helpers) => {
		return helpers.applyMark("code", [{
			type: "text",
			text: token.text || ""
		}]);
	},
	renderMarkdown: (node, h) => {
		if (!node.content) return "";
		return `\`${h.renderChildren(node.content)}\``;
	},
	addCommands() {
		return {
			setCode: () => ({ commands }) => {
				return commands.setMark(this.name);
			},
			toggleCode: () => ({ commands }) => {
				return commands.toggleMark(this.name);
			},
			unsetCode: () => ({ commands }) => {
				return commands.unsetMark(this.name);
			}
		};
	},
	addKeyboardShortcuts() {
		return { "Mod-e": () => this.editor.commands.toggleCode() };
	},
	addInputRules() {
		return [markInputRule({
			find: inputRegex$2,
			type: this.type
		})];
	},
	addPasteRules() {
		return [markPasteRule({
			find: pasteRegex$1,
			type: this.type
		})];
	}
});

export { Code };
