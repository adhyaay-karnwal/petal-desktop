// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/hooks/useIsDark.ts
import { import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";

function rootIsEditorDark() {
	if (typeof document === "undefined") return false;
	const classes = document.documentElement.classList;
	return classes.contains("editor-dark") || classes.contains("dark");
}
/** Editor-chrome dark mode (`editor-dark`). Canvas `dark:` utilities stay independent. */
function useIsDark() {
	const $ = (0, import_compiler_runtime.c)(2);
	const [dark, setDark] = (0, import_react.useState)(rootIsEditorDark);
	let t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => {
			const el = document.documentElement;
			const sync = () => setDark(el.classList.contains("editor-dark") || el.classList.contains("dark"));
			sync();
			const observer = new MutationObserver(sync);
			observer.observe(el, {
				attributes: true,
				attributeFilter: ["class"]
			});
			return () => observer.disconnect();
		};
		t1 = [];
		$[0] = t0;
		$[1] = t1;
	} else {
		t0 = $[0];
		t1 = $[1];
	}
	(0, import_react.useEffect)(t0, t1);
	return dark;
}

export { useIsDark };
