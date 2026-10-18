// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/typography/TextFormatRow.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { TextBoldIcon, TextItalicIcon, TextStrikethroughIcon, TextUnderlineIcon } from "../../../../../../../ui/src/icons.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../../ui/src/components/Tooltip.js";
import { IconBtn } from "../primitives.js";
import { isBoldFontWeight } from "../../../../utils/typography.js";

/**
* Bold / Italic / Underline / Strikethrough toggle row. Active state is a hint
* derived from the resolved fontWeight/fontStyle/textDecoration — when a text
* selection is active the editor owns the authoritative per-run state and
* corrects any mismatch on the next selection update.
*/
function TextFormatRow(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { fontWeight, fontStyle, textDecoration, onToggle } = t0;
	const td = String(textDecoration ?? "");
	let t1;
	if ($[0] !== fontWeight) {
		t1 = isBoldFontWeight(fontWeight);
		$[0] = fontWeight;
		$[1] = t1;
	} else t1 = $[1];
	const isBold = t1;
	const isItalic = fontStyle === "italic";
	let t2;
	if ($[2] !== td) {
		t2 = td.includes("underline");
		$[2] = td;
		$[3] = t2;
	} else t2 = $[3];
	const isUnderline = t2;
	let t3;
	if ($[4] !== td) {
		t3 = td.includes("line-through");
		$[4] = td;
		$[5] = t3;
	} else t3 = $[5];
	const isStrike = t3;
	let t4;
	if ($[6] !== isBold) {
		t4 = {
			key: "bold",
			active: isBold,
			tip: "Bold",
			Icon: TextBoldIcon
		};
		$[6] = isBold;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== isItalic) {
		t5 = {
			key: "italic",
			active: isItalic,
			tip: "Italic",
			Icon: TextItalicIcon
		};
		$[8] = isItalic;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== isUnderline) {
		t6 = {
			key: "underline",
			active: isUnderline,
			tip: "Underline",
			Icon: TextUnderlineIcon
		};
		$[10] = isUnderline;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] !== isStrike) {
		t7 = {
			key: "strikethrough",
			active: isStrike,
			tip: "Strikethrough",
			Icon: TextStrikethroughIcon
		};
		$[12] = isStrike;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== t4 || $[15] !== t5 || $[16] !== t6 || $[17] !== t7) {
		t8 = [
			t4,
			t5,
			t6,
			t7
		];
		$[14] = t4;
		$[15] = t5;
		$[16] = t6;
		$[17] = t7;
		$[18] = t8;
	} else t8 = $[18];
	const buttons = t8;
	let t9;
	if ($[19] !== buttons || $[20] !== onToggle) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2",
			children: buttons.map((t10) => {
				const { key, active, tip, Icon } = t10;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: tip,
						active,
						onMouseDown: _temp$66,
						onClick: () => onToggle(key),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: tip })] }, key);
			})
		});
		$[19] = buttons;
		$[20] = onToggle;
		$[21] = t9;
	} else t9 = $[21];
	return t9;
}
function _temp$66(e) {
	return e.preventDefault();
}

export { TextFormatRow };
