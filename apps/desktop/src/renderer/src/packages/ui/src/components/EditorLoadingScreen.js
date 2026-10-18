// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/EditorLoadingScreen.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";

/** A stable surface between selecting a file and painting its editor. */
function EditorLoadingScreen(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { className, logoSrc } = t0;
	let t1;
	if ($[0] !== className) {
		t1 = cn$2("flex h-full w-full items-center justify-center bg-ed-background", className);
		$[0] = className;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Loading project..."
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full border-[1.5px] border-ed-border border-t-ed-foreground-secondary motion-safe:animate-spin" });
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== logoSrc) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-hidden": "true",
			className: "relative flex size-10 items-center justify-center",
			children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: logoSrc,
				alt: "",
				width: 24,
				height: 24,
				className: "size-6 rounded-sm opacity-50 mix-blend-multiply [.editor-dark_&]:invert [.editor-dark_&]:mix-blend-screen"
			})]
		});
		$[4] = logoSrc;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== t1 || $[7] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "status",
			className: t1,
			children: [t2, t4]
		});
		$[6] = t1;
		$[7] = t4;
		$[8] = t5;
	} else t5 = $[8];
	return t5;
}

export { EditorLoadingScreen };
