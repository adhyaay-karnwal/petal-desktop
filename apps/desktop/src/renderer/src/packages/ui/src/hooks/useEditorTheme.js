// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/hooks/useEditorTheme.ts
import { import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";

var STORAGE_KEY$1 = "petal-editor-theme";
var SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";
/** Chrome-only. Do not use Tailwind's `.dark` — that would flip canvas `dark:` utilities. */
var EDITOR_DARK_CLASS = "editor-dark";
function readStoredEditorTheme() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY$1);
		return stored === "light" || stored === "dark" ? stored : "system";
	} catch {
		return "system";
	}
}
function systemPrefersDark() {
	return typeof window !== "undefined" && window.matchMedia(SYSTEM_DARK_QUERY).matches;
}
function applyEditorTheme(theme) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const dark = theme === "dark" || theme === "system" && systemPrefersDark();
	root.classList.toggle(EDITOR_DARK_CLASS, dark);
	root.classList.remove("dark");
}
/**
* Persists the app chrome theme and syncs `editor-dark` on `<html>`.
* Own it once per app via EditorThemeProvider — a second mounted instance
* would fight over the class on unmount.
*/
function useEditorTheme() {
	const $ = (0, import_compiler_runtime.c)(9);
	const [theme, setThemeState] = (0, import_react.useState)(readStoredEditorTheme);
	let t0;
	let t1;
	if ($[0] !== theme) {
		t0 = () => {
			applyEditorTheme(theme);
			if (theme !== "system" || typeof window === "undefined") return;
			const systemTheme = window.matchMedia(SYSTEM_DARK_QUERY);
			const syncSystemTheme = _temp$119;
			systemTheme.addEventListener("change", syncSystemTheme);
			return () => systemTheme.removeEventListener("change", syncSystemTheme);
		};
		t1 = [theme];
		$[0] = theme;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	(0, import_react.useEffect)(t0, t1);
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [];
		$[3] = t2;
	} else t2 = $[3];
	(0, import_react.useEffect)(_temp3$58, t2);
	let t3;
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			const syncStoredTheme = (event) => {
				if (event.key === STORAGE_KEY$1 || event.key === null) setThemeState(readStoredEditorTheme());
			};
			window.addEventListener("storage", syncStoredTheme);
			return () => window.removeEventListener("storage", syncStoredTheme);
		};
		t4 = [];
		$[4] = t3;
		$[5] = t4;
	} else {
		t3 = $[4];
		t4 = $[5];
	}
	(0, import_react.useEffect)(t3, t4);
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (next) => {
			try {
				localStorage.setItem(STORAGE_KEY$1, next);
			} catch {}
			setThemeState(next);
		};
		$[6] = t5;
	} else t5 = $[6];
	const setTheme = t5;
	let t6;
	if ($[7] !== theme) {
		t6 = {
			theme,
			setTheme
		};
		$[7] = theme;
		$[8] = t6;
	} else t6 = $[8];
	return t6;
}
function _temp3$58() {
	return _temp2$79;
}
function _temp2$79() {
	document.documentElement.classList.remove(EDITOR_DARK_CLASS, "dark");
}
function _temp$119() {
	return applyEditorTheme("system");
}

export { EDITOR_DARK_CLASS, useEditorTheme };
