// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/PanelEmptyState.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";

/**
* Shared empty state for the left-rail panels (Assets, Icons, ...). Top-aligned
* with consistent padding so every panel's empty state looks identical — keep
* new panels on this component rather than re-implementing the layout.
*/
function PanelEmptyState(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { icon, title, description, actions, descriptionClassName } = t0;
	let t1;
	if ($[0] !== icon) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex rounded-lg border border-ed-border bg-ed-background p-3 shadow-lg/4",
			children: icon
		});
		$[0] = icon;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== title) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			children: title
		});
		$[2] = title;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== descriptionClassName) {
		t3 = cn$2("text-center text-balance", descriptionClassName);
		$[4] = descriptionClassName;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== description || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			variant: "tertiary",
			size: "3xs",
			className: t3,
			children: description
		});
		$[6] = description;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== t2 || $[10] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2",
			children: [t2, t4]
		});
		$[9] = t2;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== t1 || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4",
			children: [t1, t5]
		});
		$[12] = t1;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	let t7;
	if ($[15] !== actions) {
		t7 = actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex w-full flex-col gap-2",
			children: actions
		});
		$[15] = actions;
		$[16] = t7;
	} else t7 = $[16];
	let t8;
	if ($[17] !== t6 || $[18] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-8 px-4 py-12 text-center",
			children: [t6, t7]
		});
		$[17] = t6;
		$[18] = t7;
		$[19] = t8;
	} else t8 = $[19];
	return t8;
}

export { PanelEmptyState };
