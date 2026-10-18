// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/SettingRow.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";

function SettingRow(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { title, description, action, children, divider: t1 } = t0;
	const t2 = (t1 === void 0 ? true : t1) && "[[data-slot=setting-row]+&]:border-t [[data-slot=setting-row]+&]:border-ed-divider [[data-slot=setting-row]+&]:pt-6";
	let t3;
	if ($[0] !== t2) {
		t3 = cn$2("flex flex-col gap-2", t2);
		$[0] = t2;
		$[1] = t3;
	} else t3 = $[1];
	let t4;
	if ($[2] !== title) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "div",
			size: "2xs",
			weight: "medium",
			children: title
		});
		$[2] = title;
		$[3] = t4;
	} else t4 = $[3];
	let t5;
	if ($[4] !== description) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "div",
			size: "3xs",
			variant: "tertiary",
			children: description
		});
		$[4] = description;
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== t4 || $[7] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-1",
			children: [t4, t5]
		});
		$[6] = t4;
		$[7] = t5;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== action) {
		t7 = action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: action
		});
		$[9] = action;
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== t6 || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-4",
			children: [t6, t7]
		});
		$[11] = t6;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== children || $[15] !== t3 || $[16] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "setting-row",
			className: t3,
			children: [t8, children]
		});
		$[14] = children;
		$[15] = t3;
		$[16] = t8;
		$[17] = t9;
	} else t9 = $[17];
	return t9;
}

export { SettingRow };
