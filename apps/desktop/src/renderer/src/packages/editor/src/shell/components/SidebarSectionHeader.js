// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/SidebarSectionHeader.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { CaretDownIcon, CaretRightIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";

/** Matches compact inspector controls: 26px tall, 12px type, 5px radius. */
var SIDEBAR_LIST_ROW_CLASS = "h-6.5 justify-start gap-2 rounded-[5px] px-1.5 text-ed-ui font-normal text-ed-foreground-secondary hover:text-ed-foreground [&_svg]:size-4";
var SIDEBAR_LIST_ROW_ACTIVE_CLASS = "data-[active=true]:bg-ed-accent data-[active=true]:text-ed-foreground";
/**
* Left-sidebar section title + action rail, matching the Styles header:
* 11px / leading-6 title, 26px icon buttons, and 12px horizontal insets.
*/
function SidebarSectionHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(39);
	const { title, icon, expanded, onToggle, actions, leadingAction, className, alignWithLayerRows: t1, showScrollBorder: t2, titleClassName } = t0;
	const alignWithLayerRows = t1 === void 0 ? false : t1;
	const showScrollBorder = t2 === void 0 ? false : t2;
	const toggleable = !!onToggle;
	const ChevronIcon = expanded ? CaretDownIcon : CaretRightIcon;
	const t3 = showScrollBorder ? "" : void 0;
	const t4 = toggleable ? "button" : void 0;
	const t5 = toggleable ? 0 : void 0;
	const t6 = alignWithLayerRows && "pl-2 pr-1";
	let t7;
	if ($[0] !== className || $[1] !== t6) {
		t7 = cn$2("relative flex h-10 shrink-0 items-center justify-between px-3 outline-none focus-visible:ring-2 focus-visible:ring-ed-ring", "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-transparent data-[scroll-border]:after:bg-ed-border", t6, className);
		$[0] = className;
		$[1] = t6;
		$[2] = t7;
	} else t7 = $[2];
	let t8;
	if ($[3] !== onToggle) {
		t8 = (event) => {
			if (!onToggle) return;
			if (event.target !== event.currentTarget) return;
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			onToggle();
		};
		$[3] = onToggle;
		$[4] = t8;
	} else t8 = $[4];
	const t9 = toggleable ? expanded : void 0;
	const t10 = toggleable ? `${expanded ? "Collapse" : "Expand"} ${title}` : void 0;
	const t11 = leadingAction || alignWithLayerRows ? "gap-1" : "gap-1.5";
	let t12;
	if ($[5] !== t11) {
		t12 = cn$2("flex h-6 min-w-0 items-center", t11);
		$[5] = t11;
		$[6] = t12;
	} else t12 = $[6];
	let t13;
	if ($[7] !== leadingAction) {
		t13 = leadingAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex shrink-0 items-center",
			onClick: _temp$55,
			children: leadingAction
		});
		$[7] = leadingAction;
		$[8] = t13;
	} else t13 = $[8];
	let t14;
	if ($[9] !== ChevronIcon || $[10] !== alignWithLayerRows || $[11] !== toggleable) {
		t14 = toggleable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-4 shrink-0 items-center justify-center text-ed-foreground-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronIcon, { className: alignWithLayerRows ? "size-2.5 translate-x-0.5" : "size-2" })
		});
		$[9] = ChevronIcon;
		$[10] = alignWithLayerRows;
		$[11] = toggleable;
		$[12] = t14;
	} else t14 = $[12];
	let t15;
	if ($[13] !== icon) {
		t15 = icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-4 shrink-0 items-center justify-center text-ed-foreground-secondary [&_svg]:size-4",
			children: icon
		});
		$[13] = icon;
		$[14] = t15;
	} else t15 = $[14];
	let t16;
	if ($[15] !== titleClassName) {
		t16 = cn$2("min-w-0 truncate leading-6", titleClassName);
		$[15] = titleClassName;
		$[16] = t16;
	} else t16 = $[16];
	let t17;
	if ($[17] !== t16 || $[18] !== title) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			variant: "secondary",
			className: t16,
			children: title
		});
		$[17] = t16;
		$[18] = title;
		$[19] = t17;
	} else t17 = $[19];
	let t18;
	if ($[20] !== t12 || $[21] !== t13 || $[22] !== t14 || $[23] !== t15 || $[24] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t12,
			children: [
				t13,
				t14,
				t15,
				t17
			]
		});
		$[20] = t12;
		$[21] = t13;
		$[22] = t14;
		$[23] = t15;
		$[24] = t17;
		$[25] = t18;
	} else t18 = $[25];
	let t19;
	if ($[26] !== actions) {
		t19 = actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 items-center gap-1.5",
			onClick: _temp2$35,
			children: actions
		});
		$[26] = actions;
		$[27] = t19;
	} else t19 = $[27];
	let t20;
	if ($[28] !== onToggle || $[29] !== t10 || $[30] !== t18 || $[31] !== t19 || $[32] !== t3 || $[33] !== t4 || $[34] !== t5 || $[35] !== t7 || $[36] !== t8 || $[37] !== t9) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-scroll-border": t3,
			role: t4,
			tabIndex: t5,
			className: t7,
			onClick: onToggle,
			onKeyDown: t8,
			"aria-expanded": t9,
			"aria-label": t10,
			children: [t18, t19]
		});
		$[28] = onToggle;
		$[29] = t10;
		$[30] = t18;
		$[31] = t19;
		$[32] = t3;
		$[33] = t4;
		$[34] = t5;
		$[35] = t7;
		$[36] = t8;
		$[37] = t9;
		$[38] = t20;
	} else t20 = $[38];
	return t20;
}
function _temp2$35(event_1) {
	return event_1.stopPropagation();
}
function _temp$55(event_0) {
	return event_0.stopPropagation();
}

export { SIDEBAR_LIST_ROW_ACTIVE_CLASS, SIDEBAR_LIST_ROW_CLASS, SidebarSectionHeader };
