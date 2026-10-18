// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/hooks/EditorThemeProvider.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { useEditorTheme } from "./useEditorTheme.js";

var EditorThemeContext = (0, import_react.createContext)(null);
/** Owns the app-wide chrome theme. Mount exactly once, at the app root. */
function EditorThemeProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { children } = t0;
	const value = useEditorTheme();
	let t1;
	if ($[0] !== children || $[1] !== value) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorThemeContext.Provider, {
			value,
			children
		});
		$[0] = children;
		$[1] = value;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}
function useEditorThemeContext() {
	const context = (0, import_react.useContext)(EditorThemeContext);
	if (!context) throw new Error("useEditorThemeContext requires an EditorThemeProvider at the app root");
	return context;
}

export { EditorThemeProvider, useEditorThemeContext };
