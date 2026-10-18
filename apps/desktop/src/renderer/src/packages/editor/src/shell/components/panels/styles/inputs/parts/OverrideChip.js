// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/parts/OverrideChip.tsx
import { import_jsx_runtime } from "../../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../../ui/src/lib/utils.js";
import { XIcon } from "../../../../../../../../ui/src/icons.js";
import { Tooltip } from "../../../../../../../../ui/src/components/Tooltip.js";

/**
* The struck-through class badge shown when an inline value overrides a
* Tailwind class (source === "inline"). Clicking the X restores the class
* value. The numeric inputs share this; ColorRow uses the higher-level
* SourceChip primitive instead because its layout differs.
*/
function OverrideChip(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { sourceClass, onClearOverride, className, xSize: t1 } = t0;
	const xSize = t1 === void 0 ? 8 : t1;
	let t2;
	if ($[0] !== className) {
		t2 = cn$2("text-[10px] font-mono text-ed-muted-foreground/50 line-through truncate", className);
		$[0] = className;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== sourceClass || $[3] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t2,
			children: sourceClass
		});
		$[2] = sourceClass;
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== onClearOverride || $[6] !== xSize) {
		t4 = onClearOverride && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: "Restore class value",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Restore class value",
				onClick: (e) => {
					e.stopPropagation();
					onClearOverride();
				},
				className: "text-ed-muted-foreground/50 hover:text-ed-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
					width: xSize,
					height: xSize
				})
			})
		});
		$[5] = onClearOverride;
		$[6] = xSize;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== t3 || $[9] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-0.5 px-1 shrink-0",
			children: [t3, t4]
		});
		$[8] = t3;
		$[9] = t4;
		$[10] = t5;
	} else t5 = $[10];
	return t5;
}

export { OverrideChip };
