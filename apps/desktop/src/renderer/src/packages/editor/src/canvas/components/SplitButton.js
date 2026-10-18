// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/SplitButton.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";

/**
* Split control shared by CanvasToolbar and ComponentEditingModeBar:
* primary action + caret menu with independent hover states.
*/
/** The filled triangle caret from the design (8×4, currentColor). */
function CaretGlyph(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { muted: t1 } = t0;
	const muted = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			width: 8,
			height: 4,
			flexShrink: 0
		};
		$[0] = t2;
	} else t2 = $[0];
	const t3 = muted ? "text-ed-muted-foreground opacity-40" : "opacity-50";
	let t4;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 6L0 0h10L5 6z" });
		$[1] = t4;
	} else t4 = $[1];
	let t5;
	if ($[2] !== t3) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 10 6",
			fill: "currentColor",
			style: t2,
			className: t3,
			children: t4
		});
		$[2] = t3;
		$[3] = t5;
	} else t5 = $[3];
	return t5;
}
/** The popover content for a dropdown, rendered from a list of item configs. */
function SplitMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { items, minWidth } = t0;
	let t1;
	if ($[0] !== minWidth) {
		t1 = { minWidth };
		$[0] = minWidth;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== items) {
		t2 = items.map(_temp$91);
		$[2] = items;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "start",
			style: t1,
			children: t2
		});
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function _temp$91(t0) {
	const { icon: Icon, label, shortcut, onSelect, separatorBefore, checked } = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [separatorBefore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), checked === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		onSelect,
		children: [
			Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				size: 16,
				className: "text-ed-muted-foreground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			shortcut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: shortcut })
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
		checked,
		onSelect,
		children: label
	})] }, label);
}
function SplitButton(t0) {
	const $ = (0, import_compiler_runtime.c)(35);
	const { menu, primary, primaryLabel, active: t1, disabled: t2, onPrimary, items, minWidth, primarySize: t3, primaryVariant } = t0;
	const active = t1 === void 0 ? false : t1;
	const disabled = t2 === void 0 ? false : t2;
	const primarySize = t3 === void 0 ? "icon" : t3;
	const resolvedPrimaryVariant = primaryVariant ?? (primarySize === "icon" ? active ? "selected" : "ghost" : "outline");
	const t4 = primarySize === "sm" ? "h-7 rounded-[5px] px-2.5 text-xs" : "rounded-[5px]";
	let t5;
	if ($[0] !== disabled || $[1] !== onPrimary || $[2] !== primary || $[3] !== primaryLabel || $[4] !== primarySize || $[5] !== resolvedPrimaryVariant || $[6] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: primarySize,
				variant: resolvedPrimaryVariant,
				isChildText: false,
				"aria-label": primaryLabel,
				onClick: onPrimary,
				disabled,
				className: t4,
				children: primary
			})
		});
		$[0] = disabled;
		$[1] = onPrimary;
		$[2] = primary;
		$[3] = primaryLabel;
		$[4] = primarySize;
		$[5] = resolvedPrimaryVariant;
		$[6] = t4;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== primaryLabel) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: primaryLabel
		});
		$[8] = primaryLabel;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== t5 || $[11] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t5, t6] });
		$[10] = t5;
		$[11] = t6;
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] !== menu) {
		t8 = menu ?? { modal: false };
		$[13] = menu;
		$[14] = t8;
	} else t8 = $[14];
	const t9 = `More options for ${primaryLabel}`;
	let t10;
	if ($[15] !== primarySize) {
		t10 = primarySize === "sm" ? {
			height: 28,
			width: 20
		} : void 0;
		$[15] = primarySize;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretGlyph, { muted: true });
		$[17] = t11;
	} else t11 = $[17];
	let t12;
	if ($[18] !== disabled || $[19] !== t10 || $[20] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					isChildText: false,
					disabled,
					"aria-label": t9,
					className: "w-4!",
					style: t10,
					children: t11
				})
			})
		});
		$[18] = disabled;
		$[19] = t10;
		$[20] = t9;
		$[21] = t12;
	} else t12 = $[21];
	let t13;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: "More"
		});
		$[22] = t13;
	} else t13 = $[22];
	let t14;
	if ($[23] !== t12) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t12, t13] });
		$[23] = t12;
		$[24] = t14;
	} else t14 = $[24];
	let t15;
	if ($[25] !== items || $[26] !== minWidth) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitMenu, {
			items,
			minWidth
		});
		$[25] = items;
		$[26] = minWidth;
		$[27] = t15;
	} else t15 = $[27];
	let t16;
	if ($[28] !== t14 || $[29] !== t15 || $[30] !== t8) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			...t8,
			children: [t14, t15]
		});
		$[28] = t14;
		$[29] = t15;
		$[30] = t8;
		$[31] = t16;
	} else t16 = $[31];
	let t17;
	if ($[32] !== t16 || $[33] !== t7) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "inline-flex items-center",
			children: [t7, t16]
		});
		$[32] = t16;
		$[33] = t7;
		$[34] = t17;
	} else t17 = $[34];
	return t17;
}

export { SplitButton };
