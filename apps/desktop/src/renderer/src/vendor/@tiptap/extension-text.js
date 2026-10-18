// Reconstructed from index-C74mRL57.js — original module: vendor/@tiptap/extension-text
import { Node3 } from "./core.js";

var Text$2 = Node3.create({
	name: "text",
	group: "inline",
	parseMarkdown: (token) => {
		return {
			type: "text",
			text: token.text || ""
		};
	},
	renderMarkdown: (node) => node.text || ""
});

export { Text$2 };
