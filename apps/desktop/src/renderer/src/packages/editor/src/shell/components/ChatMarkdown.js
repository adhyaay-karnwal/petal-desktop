// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ChatMarkdown.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { Markdown } from "../../../../../vendor/react-markdown.js";
import { remarkGfm } from "../../../../../vendor/remark-gfm.js";
import { rehypeHighlight } from "../../../../../vendor/rehype-highlight.js";

var toolBlockNames = /* @__PURE__ */ new Set([
	"ReadCanvas",
	"SearchIcons",
	"TakeScreenshot",
	"AddToCanvas",
	"UpdateElement",
	"DeleteElement",
	"ReplaceWithComponent",
	"Write",
	"Read",
	"EditCanvas",
	"InsertCanvas"
]);
/** Legacy tool calls have their own activity UI. Filter parsed fences so code examples stay intact. */
function remarkHideToolCalls() {
	return function removeToolCalls(node) {
		if (!node.children) return;
		node.children = node.children.filter((child) => child.type !== "code" || !toolBlockNames.has(child.lang?.replace(/^tool:/, "") ?? ""));
		node.children.forEach(removeToolCalls);
	};
}
var components = {
	a: ({ node: _node, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		...props,
		target: props.href?.startsWith("#") ? void 0 : "_blank",
		rel: "noopener noreferrer"
	}),
	table: ({ node: _node, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		horizontal: true,
		className: "ed-chat-markdown-table",
		role: "region",
		"aria-label": "Table",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", { ...props })
	}),
	pre: ({ node: _node, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		horizontal: true,
		className: "ed-chat-markdown-code",
		role: "region",
		"aria-label": "Code block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { ...props })
	})
};
var remarkPlugins = [remarkGfm, remarkHideToolCalls];
var rehypePlugins = [rehypeHighlight];
/** Shared by live responses, activity text, and archived conversations. */
var ChatMarkdown = (0, import_react.memo)(function ChatMarkdown(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { children } = t0;
	const t1 = `chat-${(0, import_react.useId)()}-`;
	let t2;
	if ($[0] !== t1) {
		t2 = { clobberPrefix: t1 };
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== children || $[3] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-chat-markdown",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
				remarkPlugins,
				rehypePlugins,
				remarkRehypeOptions: t2,
				components,
				children
			})
		});
		$[2] = children;
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
});

export { ChatMarkdown };
