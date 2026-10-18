// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/tabs/CopyCSSButton.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { CheckIcon, CopyIcon } from "../../../../../../../ui/src/icons.js";
import { toast } from "../../../../../../../../vendor/sonner.js";
import { IconBtn } from "../primitives.js";

/** Copies `text` and confirms with a toast. Returns false when the clipboard is unavailable. */
async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
		return true;
	} catch {
		return false;
	}
}
/** Copy button for a rule. Hidden until its `group/class-rule` is hovered unless `alwaysVisible`. */
function CopyCSSButton(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { css, label, alwaysVisible } = t0;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const t1 = copied ? "Copied CSS" : label;
	const t2 = !css;
	const t3 = !alwaysVisible && "opacity-0 group-hover/class-rule:opacity-100 group-focus-within/class-rule:opacity-100 focus-visible:opacity-100";
	let t4;
	if ($[0] !== t3) {
		t4 = cn$2(t3);
		$[0] = t3;
		$[1] = t4;
	} else t4 = $[1];
	let t5;
	let t6;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => setCopied(false);
		t6 = () => setCopied(false);
		$[2] = t5;
		$[3] = t6;
	} else {
		t5 = $[2];
		t6 = $[3];
	}
	let t7;
	if ($[4] !== css) {
		t7 = async () => setCopied(await copyToClipboard(css));
		$[4] = css;
		$[5] = t7;
	} else t7 = $[5];
	let t8;
	if ($[6] !== copied) {
		t8 = copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIcon, {});
		$[6] = copied;
		$[7] = t8;
	} else t8 = $[7];
	let t9;
	if ($[8] !== t1 || $[9] !== t2 || $[10] !== t4 || $[11] !== t7 || $[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t1,
			disabled: t2,
			className: t4,
			onMouseLeave: t5,
			onBlur: t6,
			onClick: t7,
			children: t8
		});
		$[8] = t1;
		$[9] = t2;
		$[10] = t4;
		$[11] = t7;
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	return t9;
}

export { CopyCSSButton, copyToClipboard };
