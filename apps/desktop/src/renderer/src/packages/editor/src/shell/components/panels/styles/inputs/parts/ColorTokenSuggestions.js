// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/parts/ColorTokenSuggestions.tsx
import { import_jsx_runtime } from "../../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../../ui/src/lib/utils.js";
import { Popover, PopoverAnchor, PopoverContent } from "../../../../../../../../ui/src/components/Popover.js";

/**
* The token list under a color field's text input: each match shows its class
* name, swatch and resolved value so similar names stay distinguishable. The
* input keeps focus; it owns the keyboard (arrows, Enter, Escape).
*/
function ColorTokenSuggestions(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { matches, activeIndex, onPick, onDismiss, children } = t0;
	const t1 = matches.length > 0;
	let t2;
	if ($[0] !== onDismiss) {
		t2 = (open) => !open && onDismiss();
		$[0] = onDismiss;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== children) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-full min-w-0 flex-1",
				children
			})
		});
		$[2] = children;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== activeIndex || $[5] !== matches || $[6] !== onPick) {
		let t5;
		if ($[8] !== activeIndex || $[9] !== onPick) {
			t5 = (token, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "option",
				"aria-selected": i === activeIndex,
				onMouseDown: _temp3$35,
				onClick: () => onPick(token.className),
				className: cn$2("flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[11px] hover:bg-ed-muted", i === activeIndex && "bg-ed-muted"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-3.5 shrink-0 rounded-xs border border-ed-field-border",
						style: { backgroundColor: token.value }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate font-mono text-ed-foreground",
						children: token.className
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-[45%] shrink-0 truncate text-[10px] text-ed-muted-foreground",
						children: token.value
					})
				]
			}, token.className);
			$[8] = activeIndex;
			$[9] = onPick;
			$[10] = t5;
		} else t5 = $[10];
		t4 = matches.map(t5);
		$[4] = activeIndex;
		$[5] = matches;
		$[6] = onPick;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[11] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			align: "start",
			sideOffset: 6,
			variant: "menu",
			className: "w-60",
			role: "listbox",
			"aria-label": "Matching color tokens",
			onOpenAutoFocus: _temp$72,
			onCloseAutoFocus: _temp2$48,
			children: t4
		});
		$[11] = t4;
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] !== t1 || $[14] !== t2 || $[15] !== t3 || $[16] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open: t1,
			onOpenChange: t2,
			modal: false,
			children: [t3, t5]
		});
		$[13] = t1;
		$[14] = t2;
		$[15] = t3;
		$[16] = t5;
		$[17] = t6;
	} else t6 = $[17];
	return t6;
}
function _temp3$35(e_1) {
	return e_1.preventDefault();
}
function _temp2$48(e_0) {
	return e_0.preventDefault();
}
function _temp$72(e) {
	return e.preventDefault();
}

export { ColorTokenSuggestions };
