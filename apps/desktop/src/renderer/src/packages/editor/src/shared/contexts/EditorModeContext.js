// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/contexts/EditorModeContext.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

var EditorModeContext = (0, import_react.createContext)({
	mode: "dev",
	setMode: () => {}
});
function EditorModeProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { children } = t0;
	const [mode, setModeState] = (0, import_react.useState)(_temp$104);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = (m) => {
			setModeState(m);
			try {
				localStorage.setItem("petal-editor-mode", m);
			} catch {}
		};
		$[0] = t1;
	} else t1 = $[0];
	const setMode = t1;
	let t2;
	if ($[1] !== mode) {
		t2 = {
			mode,
			setMode
		};
		$[1] = mode;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== children || $[4] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorModeContext.Provider, {
			value: t2,
			children
		});
		$[3] = children;
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	return t3;
}
function _temp$104() {
	try {
		const stored = localStorage.getItem("petal-editor-mode");
		if (stored === "design") return stored;
		if (stored === "dev") return stored;
	} catch {}
	return "dev";
}
function useEditorMode() {
	return (0, import_react.useContext)(EditorModeContext);
}

export { EditorModeProvider, useEditorMode };
