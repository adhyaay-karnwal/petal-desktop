// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ImageContextChip.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ImageIcon } from "../../../../ui/src/icons.js";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../../ui/src/components/HoverCard.js";
import { ContextChip } from "./ChatContextControls.js";

/** Attachments and agent screenshots share the same chip and hover preview. */
function ImageContextChip(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { src, label, onClick, onRemove, className } = t0;
	const t1 = onClick ? void 0 : 0;
	const t2 = `Preview ${label}`;
	let t3;
	if ($[0] !== className || $[1] !== label || $[2] !== onClick || $[3] !== onRemove) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChip, {
			icon: ImageIcon,
			label,
			title: "",
			onClick,
			onRemove,
			className
		});
		$[0] = className;
		$[1] = label;
		$[2] = onClick;
		$[3] = onRemove;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== t1 || $[6] !== t2 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				tabIndex: t1,
				"aria-label": t2,
				children: t3
			})
		});
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== label || $[10] !== src) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContent, {
			side: "top",
			sideOffset: 8,
			align: "center",
			className: "ed-image-chip-preview pointer-events-none w-auto max-w-48 overflow-hidden rounded-md p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: label,
				className: "block max-h-36 max-w-full rounded object-contain"
			})
		});
		$[9] = label;
		$[10] = src;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== t4 || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverCard, {
			openDelay: 0,
			closeDelay: 0,
			children: [t4, t5]
		});
		$[12] = t4;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	return t6;
}

export { ImageContextChip };
