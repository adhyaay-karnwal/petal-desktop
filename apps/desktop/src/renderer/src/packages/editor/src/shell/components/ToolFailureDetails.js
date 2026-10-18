// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ToolFailureDetails.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../ui/src/components/Popover.js";

function ToolFailureDetails(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { children, report, onTroubleshoot, onFeedback } = t0;
	const [open, setOpen] = (0, import_react.useState)(false);
	const actionSelected = (0, import_react.useRef)(false);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = (value) => {
			actionSelected.current = false;
			setOpen(value);
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== children) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "text",
				isChildText: false,
				className: "h-auto rounded-none p-0",
				"aria-label": "Show failure details",
				children
			})
		});
		$[1] = children;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (event) => {
			if (actionSelected.current) event.preventDefault();
		};
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-2 text-ed-chat font-normal text-ed-foreground",
			children: "What went wrong"
		});
		$[3] = t3;
		$[4] = t4;
	} else {
		t3 = $[3];
		t4 = $[4];
	}
	let t5;
	if ($[5] !== report) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			viewportClassName: "max-h-48",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-wrap break-words text-ed-chat text-ed-foreground-secondary [overflow-wrap:anywhere]",
				children: report
			})
		});
		$[5] = report;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== onTroubleshoot || $[8] !== report) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: () => {
				actionSelected.current = true;
				setOpen(false);
				onTroubleshoot(report);
			},
			children: "Troubleshoot with agent"
		});
		$[7] = onTroubleshoot;
		$[8] = report;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== onFeedback || $[11] !== report) {
		t7 = onFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: () => {
				actionSelected.current = true;
				setOpen(false);
				const message = `A chat action failed.\n\n${report}`;
				onFeedback(message.length > 2e3 ? `${message.slice(0, 1997)}...` : message);
			},
			children: "Send feedback"
		});
		$[10] = onFeedback;
		$[11] = report;
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] !== t6 || $[14] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-1",
			children: [t6, t7]
		});
		$[13] = t6;
		$[14] = t7;
		$[15] = t8;
	} else t8 = $[15];
	let t9;
	if ($[16] !== t5 || $[17] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			variant: "menu",
			side: "right",
			align: "start",
			className: "w-72 p-3",
			"aria-label": "Failed action details",
			onCloseAutoFocus: t3,
			children: [
				t4,
				t5,
				t8
			]
		});
		$[16] = t5;
		$[17] = t8;
		$[18] = t9;
	} else t9 = $[18];
	let t10;
	if ($[19] !== open || $[20] !== t2 || $[21] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: t1,
			children: [t2, t9]
		});
		$[19] = open;
		$[20] = t2;
		$[21] = t9;
		$[22] = t10;
	} else t10 = $[22];
	return t10;
}

export { ToolFailureDetails };
