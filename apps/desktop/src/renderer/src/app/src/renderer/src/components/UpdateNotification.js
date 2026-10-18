// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/components/UpdateNotification.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../packages/cloud/src/hooks/useSession.js";
import { XIcon } from "../../../../../packages/ui/src/icons.js";
import { Text$4 } from "../../../../../packages/ui/src/components/Text.js";
import { Button } from "../../../../../packages/ui/src/components/Button.js";

function UpdateNotification(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { onRestart, onDismiss } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			children: "Update available"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== onDismiss) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-4 py-2",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon-xs",
				variant: "ghost",
				LeftIcon: XIcon,
				"aria-label": "Dismiss update notification",
				onClick: onDismiss
			})]
		});
		$[1] = onDismiss;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "tertiary",
				children: "A new version is ready. Restart Petal to finish installing it."
			})
		});
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== onDismiss) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "ghost",
			onClick: onDismiss,
			children: "Later"
		});
		$[4] = onDismiss;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== onRestart) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			onClick: onRestart,
			children: "Restart & update"
		});
		$[6] = onRestart;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t4 || $[9] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-end gap-2 px-4 py-2",
			children: [t4, t5]
		});
		$[8] = t4;
		$[9] = t5;
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] !== t2 || $[12] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-col",
			children: [
				t2,
				t3,
				t6
			]
		});
		$[11] = t2;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	return t7;
}

export { UpdateNotification };
