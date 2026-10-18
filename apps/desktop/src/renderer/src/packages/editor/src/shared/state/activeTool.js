// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/activeTool.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { create$1, subscribeWithSelector, useShallow } from "../../../../../vendor/zustand.js";

var INSERT_TOOLS = [
	"frame",
	"stack-h",
	"stack-v",
	"grid",
	"image",
	"video",
	"text",
	"html"
];
/** True for armed insert tools — the ones that draw/click an element then revert. */
function isInsertTool(tool) {
	return INSERT_TOOLS.includes(tool);
}
var INITIAL = {
	armedTool: "move",
	commentMode: false,
	scaleFocusVersion: 0,
	scaleAspectLocked: true
};
var exitCommentMode = null;
var useActiveToolStore = create$1()(subscribeWithSelector((set, get) => ({
	...INITIAL,
	setActiveTool: (tool) => {
		if (get().commentMode && tool !== "comment") exitCommentMode?.();
		set((s) => ({
			armedTool: tool,
			scaleFocusVersion: tool === "scale" ? s.scaleFocusVersion + 1 : s.scaleFocusVersion
		}));
	},
	setScaleAspectLocked: (locked) => set({ scaleAspectLocked: locked })
})));
var activeToolOf = (s) => s.commentMode ? "comment" : s.armedTool;
function useActiveTool() {
	return useActiveToolStore(useShallow(_temp$99));
}
/**
* Mirrors the editor's comment mode into the tool store, and lets arming
* another tool leave it. The editor owns comment mode. When the editor
* unmounts, the tool goes back to Move for the next one.
*/
function _temp$99(s) {
	return {
		activeTool: activeToolOf(s),
		setActiveTool: s.setActiveTool,
		scaleFocusVersion: s.scaleFocusVersion,
		scaleAspectLocked: s.scaleAspectLocked,
		setScaleAspectLocked: s.setScaleAspectLocked
	};
}
function useActiveToolCommentMode(commentMode, onExitCommentMode) {
	const $ = (0, import_compiler_runtime.c)(7);
	let t0;
	let t1;
	if ($[0] !== commentMode) {
		t0 = () => {
			useActiveToolStore.setState({ commentMode });
		};
		t1 = [commentMode];
		$[0] = commentMode;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	(0, import_react.useLayoutEffect)(t0, t1);
	let t2;
	let t3;
	if ($[3] !== onExitCommentMode) {
		t2 = () => {
			exitCommentMode = onExitCommentMode ?? null;
			return _temp2$63;
		};
		t3 = [onExitCommentMode];
		$[3] = onExitCommentMode;
		$[4] = t2;
		$[5] = t3;
	} else {
		t2 = $[4];
		t3 = $[5];
	}
	(0, import_react.useLayoutEffect)(t2, t3);
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[6] = t4;
	} else t4 = $[6];
	(0, import_react.useLayoutEffect)(_temp4$39, t4);
}
function _temp4$39() {
	return _temp3$45;
}
function _temp3$45() {
	return useActiveToolStore.setState(INITIAL);
}
function _temp2$63() {
	exitCommentMode = null;
}

export { isInsertTool, useActiveTool, useActiveToolCommentMode };
