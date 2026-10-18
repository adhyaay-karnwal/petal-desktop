// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/codeEditorTheme.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { EditorView$1 } from "../../../../../vendor/@codemirror/view.js";

/** Explicit mono stack — avoid `ui-monospace` alone (can track UI chrome on some OS). */
var CODE_EDITOR_FONT_FAMILY = "\"ui-monospace\", \"SFMono-Regular\", \"Menlo\", \"Consolas\", monospace";
var STYLE_ID = "petal-code-editor-font";
var CODE_EDITOR_STYLES = `
.petal-code-editor,
.petal-code-editor .cm-editor,
.petal-code-editor .cm-scroller,
.petal-code-editor .cm-content,
.petal-code-editor .cm-line,
.petal-code-editor .cm-gutters,
.petal-code-editor .cm-gutterElement,
.petal-code-editor * {
  font-family: ${CODE_EDITOR_FONT_FAMILY} !important;
}
.petal-code-editor,
.petal-code-editor .cm-editor,
.petal-code-editor .cm-scroller {
  background-color: var(--ed-background) !important;
  color: var(--ed-foreground);
}
.petal-code-editor .cm-gutters {
  background-color: var(--ed-background) !important;
  color: var(--ed-muted-foreground);
  border: none !important;
}
.petal-code-editor .cm-scroller {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.petal-code-editor .cm-scroller:hover {
  scrollbar-color: color-mix(in oklab, var(--ed-foreground) 25%, transparent) transparent;
}
.petal-code-editor .cm-scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.petal-code-editor .cm-scroller::-webkit-scrollbar-track {
  background: transparent;
}
.petal-code-editor .cm-scroller::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.petal-code-editor .cm-scroller:hover::-webkit-scrollbar-thumb {
  background-color: color-mix(in oklab, var(--ed-foreground) 25%, transparent);
}
.petal-code-editor .cm-scroller::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in oklab, var(--ed-foreground) 40%, transparent);
}
`.trim();
/**
* Ensure monospace wins over app-shell Inter and runtime-injected project CSS
* (`* { font-family … }`), which is appended to `document.head` after our bundle.
* Keeps the style last in `<head>`, and leaves it alone when it already is:
* moving or rewriting a `<style>` restyles the whole document.
*/
function ensureCodeEditorFontStyles() {
	if (typeof document === "undefined") return;
	let el = document.getElementById(STYLE_ID);
	if (!el) {
		el = document.createElement("style");
		el.id = STYLE_ID;
	}
	if (el.textContent !== CODE_EDITOR_STYLES) el.textContent = CODE_EDITOR_STYLES;
	if (document.head.lastElementChild !== el) document.head.appendChild(el);
}
/** Call from BottomBar / History so the late style tag is installed. */
function useCodeEditorFontStyles() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = [];
		$[0] = t0;
	} else t0 = $[0];
	(0, import_react.useLayoutEffect)(_temp2$22, t0);
}
/**
* CodeMirror chrome for BottomBar / History (12px monospace).
* `!important` on content/lines fights sans resets; pair with
* `useCodeEditorFontStyles` + `CODE_EDITOR_CLASS`.
*/
function _temp2$22() {
	ensureCodeEditorFontStyles();
	window.addEventListener("petal-css-updated", ensureCodeEditorFontStyles);
	return _temp$39;
}
function _temp$39() {
	return window.removeEventListener("petal-css-updated", ensureCodeEditorFontStyles);
}
var CODE_EDITOR_THEME = EditorView$1.theme({
	"&": {
		fontSize: "12px",
		fontFamily: `${CODE_EDITOR_FONT_FAMILY} !important`,
		backgroundColor: "var(--ed-background)",
		color: "var(--ed-foreground)"
	},
	".cm-content": {
		padding: "8px 0",
		lineHeight: "1.7",
		fontFamily: `${CODE_EDITOR_FONT_FAMILY} !important`,
		caretColor: "var(--ed-foreground)"
	},
	".cm-line": {
		padding: "0 14px",
		fontFamily: `${CODE_EDITOR_FONT_FAMILY} !important`
	},
	".cm-gutters": {
		backgroundColor: "var(--ed-background)",
		color: "var(--ed-muted-foreground)",
		border: "none",
		fontFamily: `${CODE_EDITOR_FONT_FAMILY} !important`
	},
	".cm-lineNumbers .cm-gutterElement": {
		padding: "0 6px 0 12px",
		minWidth: "24px"
	},
	".cm-scroller": {
		fontFamily: `${CODE_EDITOR_FONT_FAMILY} !important`,
		backgroundColor: "var(--ed-background)"
	},
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "var(--ed-selected)" }
});
/** Class on the CodeMirror host — pairs with ensureCodeEditorFontStyles(). */
var CODE_EDITOR_CLASS = "petal-code-editor";

export { CODE_EDITOR_CLASS, CODE_EDITOR_THEME, useCodeEditorFontStyles };
