// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/AgentFollowFrame.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";

/** A viewport overlay: stays fixed while the followed canvas pans and zooms. */
function AgentFollowFrame(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { onStop } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = { borderColor: "var(--ed-secondary)" };
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = { backgroundColor: "var(--ed-secondary)" };
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			role: "status",
			className: "whitespace-nowrap",
			children: "Following agent"
		});
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	let t4;
	if ($[3] !== onStop) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 z-50 border-2",
			style: t1,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute -top-0.5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-b-[9px] py-1 pl-3 pr-1 text-[11px] text-ed-foreground",
				style: t2,
				children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "ghost",
					className: "pointer-events-auto bg-ed-foreground/10 text-ed-foreground-secondary hover:bg-ed-foreground/15 hover:text-ed-foreground",
					"aria-label": "Stop following agent",
					tooltip: "Stop following agent",
					onPointerDown: _temp$92,
					onClick: onStop,
					children: "Stop"
				})]
			})
		});
		$[3] = onStop;
		$[4] = t4;
	} else t4 = $[4];
	return t4;
}
function _temp$92(event) {
	return event.stopPropagation();
}

export { AgentFollowFrame };
