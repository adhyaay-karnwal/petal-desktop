// Reconstructed from index-C74mRL57.js — original module: vendor/@tiptap/extension-document
import { Node3 } from "./core.js";

var Document$1 = Node3.create({
	name: "doc",
	topNode: true,
	content: "block+",
	renderMarkdown: (node, h) => {
		if (!node.content) return "";
		return h.renderChildren(node.content, "\n\n");
	}
});

export { Document$1 };
