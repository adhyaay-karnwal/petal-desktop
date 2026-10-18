// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/FigmaConnectDialog.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";

function FigmaConnectDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { open, imageCount, onConnect, onSkip } = t0;
	let t1;
	if ($[0] !== onSkip) {
		t1 = (isOpen) => {
			if (!isOpen) onSkip();
		};
		$[0] = onSkip;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Connect Figma to import images" }) });
		$[2] = t2;
	} else t2 = $[2];
	const t3 = imageCount === 1 ? "This paste includes 1 image from Figma. Importing it needs access to your Figma account." : `This paste includes ${imageCount} images from Figma. Importing them needs access to your Figma account.`;
	let t4;
	if ($[3] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t3 })
		});
		$[3] = t3;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== onSkip) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			onClick: onSkip,
			children: "Paste without images"
		});
		$[5] = onSkip;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== onConnect) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: onConnect,
			children: "Connect Figma"
		});
		$[7] = onConnect;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t5 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t5, t6] });
		$[9] = t5;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== t4 || $[13] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			t2,
			t4,
			t7
		] });
		$[12] = t4;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	let t9;
	if ($[15] !== open || $[16] !== t1 || $[17] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: t1,
			children: t8
		});
		$[15] = open;
		$[16] = t1;
		$[17] = t8;
		$[18] = t9;
	} else t9 = $[18];
	return t9;
}

export { FigmaConnectDialog };
