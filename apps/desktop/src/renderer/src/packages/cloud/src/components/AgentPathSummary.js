// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/AgentPathSummary.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../ui/src/components/Text.js";

/** Dashboard agent path: icon, description, and optional setup action. */
function AgentPathSummary(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { path, action, className, size: t1 } = t0;
	const size = t1 === void 0 ? "2xs" : t1;
	const { Icon } = path;
	const t2 = size === "sm" ? "gap-1.5" : "gap-1";
	let t3;
	if ($[0] !== className || $[1] !== t2) {
		t3 = cn$2("flex min-w-0 flex-col", t2, className);
		$[0] = className;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== Icon) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			width: 16,
			height: 16,
			"aria-hidden": true,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[3] = Icon;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== path.title || $[6] !== size) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size,
			weight: "medium",
			variant: "primary",
			children: path.title
		});
		$[5] = path.title;
		$[6] = size;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t4 || $[9] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
			className: "flex items-center gap-2",
			children: [t4, t5]
		});
		$[8] = t4;
		$[9] = t5;
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] !== path.description || $[12] !== size) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "pl-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size,
				variant: "tertiary",
				className: "text-pretty",
				children: path.description
			})
		});
		$[11] = path.description;
		$[12] = size;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== action) {
		t8 = action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "flex pl-6 pt-2",
			children: action
		});
		$[14] = action;
		$[15] = t8;
	} else t8 = $[15];
	let t9;
	if ($[16] !== t3 || $[17] !== t6 || $[18] !== t7 || $[19] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			children: [
				t6,
				t7,
				t8
			]
		});
		$[16] = t3;
		$[17] = t6;
		$[18] = t7;
		$[19] = t8;
		$[20] = t9;
	} else t9 = $[20];
	return t9;
}

export { AgentPathSummary };
