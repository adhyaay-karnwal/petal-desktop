// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasToolbar.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ArrowsOutIcon, BrowserIcon, ChatIcon, CodeIcon, CursorIcon, DeviceMobileIcon, DeviceTabletIcon, DisplayFlexColumnIcon, DisplayFlexRowIcon, DisplayGridIcon, FrameIcon, HandIcon, ScaleIcon, TextTIcon } from "../../../../ui/src/icons.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { useEditorMode } from "../../shared/contexts/EditorModeContext.js";
import { useActiveTool } from "../../shared/state/activeTool.js";
import { SplitButton } from "./SplitButton.js";

var TOOLBAR_ICON_STROKE_WIDTH = .8;
var SHOW_COMPONENTS = false;
var SHOW_LIVE_PREVIEW = false;
var LAST_INSERT_KEY = "petal-last-insert-tool";
/** Single source of truth for the Insert dropdown. `frame` stays first so it is
*  the fallback when nothing has been used yet. */
var INSERT_OPTIONS = [
	{
		tool: "frame",
		icon: FrameIcon,
		label: "Frame",
		shortcut: "F"
	},
	{
		tool: "stack-h",
		icon: DisplayFlexRowIcon,
		label: "Stack (H)",
		shortcut: "S"
	},
	{
		tool: "stack-v",
		icon: DisplayFlexColumnIcon,
		label: "Stack (V)",
		shortcut: "S"
	},
	{
		tool: "grid",
		icon: DisplayGridIcon,
		label: "Grid",
		shortcut: "⇧G"
	},
	...[]
];
/** A plain 36px icon button with a tooltip. */
function ToolButton(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { icon: Icon, label, active: t1, onClick } = t0;
	const active = t1 === void 0 ? false : t1;
	const t2 = active ? "toolbarSelected" : "ghost";
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = { borderRadius: 5 };
		$[0] = t3;
	} else t3 = $[0];
	const t4 = active ? "size-[22px]" : "size-[22px] text-ed-muted-foreground";
	let t5;
	if ($[1] !== Icon || $[2] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			strokeWidth: TOOLBAR_ICON_STROKE_WIDTH,
			className: t4
		});
		$[1] = Icon;
		$[2] = t4;
		$[3] = t5;
	} else t5 = $[3];
	let t6;
	if ($[4] !== label || $[5] !== onClick || $[6] !== t2 || $[7] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon",
				variant: t2,
				isChildText: false,
				"aria-label": label,
				onClick,
				style: t3,
				children: t5
			})
		});
		$[4] = label;
		$[5] = onClick;
		$[6] = t2;
		$[7] = t5;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== label) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: label
		});
		$[9] = label;
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== t6 || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t6, t7] });
		$[11] = t6;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	return t8;
}
function CanvasToolbar(t0) {
	const $ = (0, import_compiler_runtime.c)(87);
	const { readOnly: t1, showCommentTools: t2, commentMode: t3, onToggleCommentMode, showResolvedComments: t4, onShowResolvedChange, onPickPreviewPreset, onOpenMoreHtml } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const showCommentTools = t2 === void 0 ? false : t2;
	const commentMode = t3 === void 0 ? false : t3;
	const showResolvedComments = t4 === void 0 ? false : t4;
	const { activeTool, setActiveTool } = useActiveTool();
	const { mode, setMode } = useEditorMode();
	const [openMenu, setOpenMenu] = (0, import_react.useState)(null);
	const [lastInsertTool, setLastInsertTool] = (0, import_react.useState)(_temp$90);
	let t5;
	if ($[0] !== openMenu) {
		t5 = (id) => ({
			open: openMenu === id,
			onOpenChange: (o) => setOpenMenu((prev) => o ? id : prev === id ? null : prev),
			modal: false
		});
		$[0] = openMenu;
		$[1] = t5;
	} else t5 = $[1];
	const menuProps = t5;
	let t6;
	if ($[2] !== setActiveTool) {
		t6 = (tool) => setActiveTool(tool);
		$[2] = setActiveTool;
		$[3] = t6;
	} else t6 = $[3];
	const arm = t6;
	let t7;
	if ($[4] !== activeTool) {
		t7 = INSERT_OPTIONS.find((o_0) => o_0.tool === activeTool);
		$[4] = activeTool;
		$[5] = t7;
	} else t7 = $[5];
	const activeOption = t7;
	const isInsertActive = !!activeOption;
	let t8;
	if ($[6] !== activeOption || $[7] !== lastInsertTool) {
		t8 = activeOption ?? INSERT_OPTIONS.find((o_1) => o_1.tool === lastInsertTool) ?? INSERT_OPTIONS[0];
		$[6] = activeOption;
		$[7] = lastInsertTool;
		$[8] = t8;
	} else t8 = $[8];
	const insertOption = t8;
	const InsertIcon = insertOption.icon;
	if (activeOption && activeOption.tool !== lastInsertTool) setLastInsertTool(activeOption.tool);
	let t10;
	let t9;
	if ($[9] !== lastInsertTool) {
		t9 = () => {
			try {
				localStorage.setItem(LAST_INSERT_KEY, lastInsertTool);
			} catch {}
		};
		t10 = [lastInsertTool];
		$[9] = lastInsertTool;
		$[10] = t10;
		$[11] = t9;
	} else {
		t10 = $[10];
		t9 = $[11];
	}
	(0, import_react.useEffect)(t9, t10);
	let t11;
	if ($[12] !== arm) {
		t11 = {
			icon: CursorIcon,
			label: "Move",
			shortcut: "V",
			onSelect: () => arm("move")
		};
		$[12] = arm;
		$[13] = t11;
	} else t11 = $[13];
	let t12;
	if ($[14] !== arm) {
		t12 = {
			icon: HandIcon,
			label: "Pan",
			shortcut: "H",
			onSelect: () => arm("pan")
		};
		$[14] = arm;
		$[15] = t12;
	} else t12 = $[15];
	let t13;
	if ($[16] !== t11 || $[17] !== t12) {
		t13 = [t11, t12];
		$[16] = t11;
		$[17] = t12;
		$[18] = t13;
	} else t13 = $[18];
	const moveItems = t13;
	let t14;
	if ($[19] !== arm || $[20] !== onOpenMoreHtml) {
		let t15;
		if ($[22] !== arm) {
			t15 = (o_2) => ({
				icon: o_2.icon,
				label: o_2.label,
				shortcut: o_2.shortcut,
				separatorBefore: o_2.separatorBefore,
				onSelect: () => arm(o_2.tool)
			});
			$[22] = arm;
			$[23] = t15;
		} else t15 = $[23];
		let t16;
		if ($[24] !== onOpenMoreHtml) {
			t16 = {
				icon: CodeIcon,
				label: "More HTML",
				shortcut: "⌘K",
				onSelect: () => onOpenMoreHtml?.(),
				separatorBefore: true
			};
			$[24] = onOpenMoreHtml;
			$[25] = t16;
		} else t16 = $[25];
		t14 = [...INSERT_OPTIONS.map(t15), t16];
		$[19] = arm;
		$[20] = onOpenMoreHtml;
		$[21] = t14;
	} else t14 = $[21];
	const insertItems = t14;
	let t15;
	if ($[26] !== onPickPreviewPreset) {
		t15 = {
			icon: BrowserIcon,
			label: "Browser",
			shortcut: "⇧P",
			onSelect: () => onPickPreviewPreset?.("browser")
		};
		$[26] = onPickPreviewPreset;
		$[27] = t15;
	} else t15 = $[27];
	let t16;
	if ($[28] !== onPickPreviewPreset) {
		t16 = {
			icon: DeviceMobileIcon,
			label: "Mobile",
			onSelect: () => onPickPreviewPreset?.("mobile")
		};
		$[28] = onPickPreviewPreset;
		$[29] = t16;
	} else t16 = $[29];
	let t17;
	if ($[30] !== onPickPreviewPreset) {
		t17 = {
			icon: DeviceTabletIcon,
			label: "Tablet",
			onSelect: () => onPickPreviewPreset?.("tablet")
		};
		$[30] = onPickPreviewPreset;
		$[31] = t17;
	} else t17 = $[31];
	let t18;
	if ($[32] !== onPickPreviewPreset) {
		t18 = {
			icon: ArrowsOutIcon,
			label: "Responsive",
			onSelect: () => onPickPreviewPreset?.("responsive"),
			separatorBefore: true
		};
		$[32] = onPickPreviewPreset;
		$[33] = t18;
	} else t18 = $[33];
	let t19;
	if ($[34] !== t15 || $[35] !== t16 || $[36] !== t17 || $[37] !== t18) {
		t19 = [
			t15,
			t16,
			t17,
			t18
		];
		$[34] = t15;
		$[35] = t16;
		$[36] = t17;
		$[37] = t18;
		$[38] = t19;
	} else t19 = $[38];
	const previewItems = t19;
	const moveOrPanActive = activeTool === "move" || activeTool === "pan" || !readOnly && activeTool === "scale";
	const MoveIcon = activeTool === "pan" ? HandIcon : !readOnly && activeTool === "scale" ? ScaleIcon : CursorIcon;
	let t20;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = {
			gap: 6,
			height: 52,
			paddingTop: 0,
			paddingBottom: 0,
			paddingLeft: 6,
			paddingRight: 6,
			borderRadius: 12
		};
		$[39] = t20;
	} else t20 = $[39];
	let t21;
	if ($[40] !== menuProps) {
		t21 = menuProps("move");
		$[40] = menuProps;
		$[41] = t21;
	} else t21 = $[41];
	const t22 = moveOrPanActive ? "size-[22px]" : "size-[22px] text-ed-muted-foreground";
	let t23;
	if ($[42] !== MoveIcon || $[43] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveIcon, {
			strokeWidth: TOOLBAR_ICON_STROKE_WIDTH,
			className: t22
		});
		$[42] = MoveIcon;
		$[43] = t22;
		$[44] = t23;
	} else t23 = $[44];
	const t24 = !readOnly && activeTool === "scale" ? "Scale (K)" : "Move / Pan";
	const t25 = moveOrPanActive ? "toolbarSelected" : "ghost";
	let t26;
	if ($[45] !== activeTool || $[46] !== arm || $[47] !== readOnly) {
		t26 = () => arm(activeTool === "pan" ? "pan" : !readOnly && activeTool === "scale" ? "scale" : "move");
		$[45] = activeTool;
		$[46] = arm;
		$[47] = readOnly;
		$[48] = t26;
	} else t26 = $[48];
	let t27;
	if ($[49] !== moveItems || $[50] !== moveOrPanActive || $[51] !== t21 || $[52] !== t23 || $[53] !== t24 || $[54] !== t25 || $[55] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitButton, {
			menu: t21,
			primary: t23,
			primaryLabel: t24,
			active: moveOrPanActive,
			primaryVariant: t25,
			onPrimary: t26,
			items: moveItems,
			minWidth: "10rem"
		});
		$[49] = moveItems;
		$[50] = moveOrPanActive;
		$[51] = t21;
		$[52] = t23;
		$[53] = t24;
		$[54] = t25;
		$[55] = t26;
		$[56] = t27;
	} else t27 = $[56];
	let t28;
	if ($[57] !== InsertIcon || $[58] !== activeTool || $[59] !== arm || $[60] !== insertItems || $[61] !== insertOption.label || $[62] !== insertOption.tool || $[63] !== isInsertActive || $[64] !== menuProps || $[65] !== readOnly) {
		t28 = !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "row",
				gap: 8
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitButton, {
					menu: menuProps("insert"),
					primary: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsertIcon, {
						strokeWidth: TOOLBAR_ICON_STROKE_WIDTH,
						className: isInsertActive ? "size-[22px]" : "size-[22px] text-ed-muted-foreground"
					}),
					primaryLabel: `Insert ${insertOption.label}`,
					active: isInsertActive,
					primaryVariant: isInsertActive ? "toolbarSelected" : "ghost",
					onPrimary: () => arm(insertOption.tool),
					items: insertItems,
					minWidth: "12rem"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
					icon: TextTIcon,
					label: "Text (T)",
					active: activeTool === "text",
					onClick: () => arm("text")
				}),
				SHOW_COMPONENTS
			]
		}) });
		$[57] = InsertIcon;
		$[58] = activeTool;
		$[59] = arm;
		$[60] = insertItems;
		$[61] = insertOption.label;
		$[62] = insertOption.tool;
		$[63] = isInsertActive;
		$[64] = menuProps;
		$[65] = readOnly;
		$[66] = t28;
	} else t28 = $[66];
	let t29;
	if ($[67] !== commentMode || $[68] !== menuProps || $[69] !== onShowResolvedChange || $[70] !== onToggleCommentMode || $[71] !== previewItems || $[72] !== showCommentTools || $[73] !== showResolvedComments) {
		t29 = showCommentTools && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "row",
				gap: 2
			},
			children: [SHOW_LIVE_PREVIEW, showCommentTools && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitButton, {
				menu: menuProps("comment"),
				primary: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatIcon, { className: commentMode ? "size-[22px]" : "size-[22px] text-ed-muted-foreground" }),
				primaryLabel: "Comment (C)",
				primaryVariant: commentMode ? "toolbarSelected" : "ghost",
				active: commentMode,
				onPrimary: () => onToggleCommentMode?.(),
				items: [{
					label: "Comment mode",
					checked: commentMode,
					onSelect: () => onToggleCommentMode?.()
				}, {
					label: "Show resolved",
					checked: showResolvedComments,
					onSelect: () => onShowResolvedChange?.(!showResolvedComments)
				}],
				minWidth: "11rem"
			})]
		});
		$[67] = commentMode;
		$[68] = menuProps;
		$[69] = onShowResolvedChange;
		$[70] = onToggleCommentMode;
		$[71] = previewItems;
		$[72] = showCommentTools;
		$[73] = showResolvedComments;
		$[74] = t29;
	} else t29 = $[74];
	let t30;
	if ($[75] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 6
		};
		$[75] = t30;
	} else t30 = $[75];
	const t31 = mode === "dev";
	let t32;
	if ($[76] !== mode || $[77] !== setMode) {
		t32 = () => setMode(mode === "dev" ? "design" : "dev");
		$[76] = mode;
		$[77] = setMode;
		$[78] = t32;
	} else t32 = $[78];
	let t33;
	if ($[79] !== t31 || $[80] !== t32) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t30,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
				icon: CodeIcon,
				label: "Code window",
				active: t31,
				onClick: t32
			})
		});
		$[79] = t31;
		$[80] = t32;
		$[81] = t33;
	} else t33 = $[81];
	let t34;
	if ($[82] !== t27 || $[83] !== t28 || $[84] !== t29 || $[85] !== t33) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center border border-ed-border bg-ed-toolbar shadow-lg pointer-events-auto",
			style: t20,
			children: [
				t27,
				t28,
				t29,
				t33
			]
		});
		$[82] = t27;
		$[83] = t28;
		$[84] = t29;
		$[85] = t33;
		$[86] = t34;
	} else t34 = $[86];
	return t34;
}
function _temp$90() {
	try {
		const stored = localStorage.getItem(LAST_INSERT_KEY);
		if (stored) return stored;
	} catch {}
	return "frame";
}

export { CanvasToolbar };
