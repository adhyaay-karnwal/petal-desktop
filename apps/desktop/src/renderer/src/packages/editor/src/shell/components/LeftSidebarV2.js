// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/LeftSidebarV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { CaretDownIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button, buttonClassName } from "../../../../ui/src/components/Button.js";
import { ButtonGroup } from "../../../../ui/src/components/ButtonGroup.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { InlineRenameInput, usePendingRename } from "../../../../ui/src/components/InlineRenameInput.js";
import { SimpleTabs, Tabs, TabsContent, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { PetalLogo } from "../../assets/PetalLogo.js";

var TABS = [
	{
		value: "pages",
		label: "Pages"
	},
	{
		value: "assets",
		label: "Assets"
	},
	{
		value: "agents",
		label: "Agents"
	}
];
function PendingTab(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { name } = t0;
	let t1;
	if ($[0] !== name) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-full items-center justify-center px-6 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
				size: "3xs",
				variant: "secondary",
				children: [name, " is being built."]
			})
		});
		$[0] = name;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
/**
* Layout-only shell for the redesigned left sidebar.
*
* Feature panels are supplied through slots so Pages, Assets, and Agents can be
* developed independently. Domain state remains owned by PetalEditor.
*/
function LeftSidebarV2(t0) {
	const $ = (0, import_compiler_runtime.c)(86);
	const { projectName, onProjectIconClick, onOpenProjectSettings, onRenameProject, pages, assets, agents, activeTab, defaultTab: t1, onActiveTabChange, onTabActivate, hideTabs: t2, readOnly: t3, className } = t0;
	const defaultTab = t1 === void 0 ? "pages" : t1;
	const hideTabs = t2 === void 0 ? false : t2;
	const readOnly = t3 === void 0 ? false : t3;
	const [internalTab, setInternalTab] = (0, import_react.useState)(defaultTab);
	const [renaming, setRenaming] = (0, import_react.useState)(false);
	const rename = readOnly ? void 0 : onRenameProject;
	let t4;
	if ($[0] !== projectName) {
		t4 = () => projectName;
		$[0] = projectName;
		$[1] = t4;
	} else t4 = $[1];
	const pendingName = usePendingRename(t4);
	let t5;
	if ($[2] !== pendingName || $[3] !== projectName) {
		t5 = pendingName.nameOf("file", projectName);
		$[2] = pendingName;
		$[3] = projectName;
		$[4] = t5;
	} else t5 = $[4];
	const shownName = t5;
	const fileMenu = !readOnly && onOpenProjectSettings;
	const segment = (rename || fileMenu) && "group-hover/file-title:bg-ed-ghost-hover group-has-[[aria-expanded=true]]/file-title:bg-ed-ghost-hover";
	let t6;
	if ($[5] !== agents || $[6] !== assets || $[7] !== pages) {
		t6 = {
			pages,
			assets,
			agents
		};
		$[5] = agents;
		$[6] = assets;
		$[7] = pages;
		$[8] = t6;
	} else t6 = $[8];
	const slots = t6;
	let T0;
	let t10;
	let t11;
	let t12;
	let t7;
	let t8;
	let t9;
	if ($[9] !== activeTab || $[10] !== className || $[11] !== fileMenu || $[12] !== hideTabs || $[13] !== internalTab || $[14] !== onActiveTabChange || $[15] !== onOpenProjectSettings || $[16] !== onProjectIconClick || $[17] !== onTabActivate || $[18] !== pendingName || $[19] !== rename || $[20] !== renaming || $[21] !== segment || $[22] !== shownName || $[23] !== slots) {
		let t13;
		if ($[31] !== slots) {
			t13 = (tab) => {
				if (tab.value === "agents") return slots.agents != null;
				return true;
			};
			$[31] = slots;
			$[32] = t13;
		} else t13 = $[32];
		const visibleTabs = TABS.filter(t13);
		const selectedTabRaw = activeTab ?? internalTab;
		const selectedTab = visibleTabs.some((tab_0) => tab_0.value === selectedTabRaw) ? selectedTabRaw : visibleTabs[0]?.value ?? "pages";
		let t14;
		if ($[33] !== activeTab || $[34] !== onActiveTabChange || $[35] !== onTabActivate) {
			t14 = (nextTab) => {
				const tab_1 = nextTab;
				if (activeTab === void 0) setInternalTab(tab_1);
				onActiveTabChange?.(tab_1);
				onTabActivate?.(tab_1);
			};
			$[33] = activeTab;
			$[34] = onActiveTabChange;
			$[35] = onTabActivate;
			$[36] = t14;
		} else t14 = $[36];
		const handleTabChange = t14;
		if ($[37] !== className) {
			t11 = cn$2("flex h-full min-h-0 flex-col overflow-hidden bg-ed-background", className);
			$[37] = className;
			$[38] = t11;
		} else t11 = $[38];
		const t15 = onProjectIconClick ? "Back to files" : void 0;
		let t16;
		if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
			t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalLogo, { className: "size-4 shrink-0" });
			$[39] = t16;
		} else t16 = $[39];
		let t17;
		if ($[40] !== onProjectIconClick || $[41] !== t15) {
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon-xs",
				variant: "secondary",
				className: "text-ed-muted-foreground",
				isChildText: false,
				onClick: onProjectIconClick,
				title: t15,
				children: t16
			});
			$[40] = onProjectIconClick;
			$[41] = t15;
			$[42] = t17;
		} else t17 = $[42];
		const t18 = renaming && rename && "flex-1";
		let t19;
		if ($[43] !== t18) {
			t19 = cn$2("group/file-title min-w-0 shrink gap-px", t18);
			$[43] = t18;
			$[44] = t19;
		} else t19 = $[44];
		let t20;
		if ($[45] !== pendingName || $[46] !== rename || $[47] !== renaming || $[48] !== segment || $[49] !== shownName) {
			t20 = renaming && rename ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: buttonClassName("ghost", "xs", "min-w-0 flex-1 ring-1 ring-inset ring-ed-inspector-active-border hover:bg-transparent"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineRenameInput, {
					className: "flex-1 before:hidden",
					"aria-label": "File name",
					value: shownName,
					onCommit: (name) => {
						if (name) {
							pendingName.hold("file", name);
							rename(name);
						}
					},
					onDone: () => setRenaming(false)
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "xs",
				variant: "ghost",
				className: cn$2("min-w-0 shrink", segment, !rename && "pointer-events-none"),
				isChildText: false,
				tabIndex: rename ? void 0 : -1,
				onClick: rename ? () => setRenaming(true) : void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: shownName || "Untitled file"
				})
			});
			$[45] = pendingName;
			$[46] = rename;
			$[47] = renaming;
			$[48] = segment;
			$[49] = shownName;
			$[50] = t20;
		} else t20 = $[50];
		let t21;
		if ($[51] !== fileMenu || $[52] !== onOpenProjectSettings || $[53] !== renaming || $[54] !== segment) {
			t21 = fileMenu && !renaming && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "icon-xs",
					variant: "ghost",
					className: cn$2("shrink-0 text-ed-foreground-secondary", segment),
					isChildText: false,
					"aria-label": "File menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
						width: 16,
						height: 16
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
				align: "start",
				sideOffset: 4,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onSelect: onOpenProjectSettings,
					children: "File settings"
				})
			})] });
			$[51] = fileMenu;
			$[52] = onOpenProjectSettings;
			$[53] = renaming;
			$[54] = segment;
			$[55] = t21;
		} else t21 = $[55];
		let t22;
		if ($[56] !== t19 || $[57] !== t20 || $[58] !== t21) {
			t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ButtonGroup, {
				className: t19,
				children: [t20, t21]
			});
			$[56] = t19;
			$[57] = t20;
			$[58] = t21;
			$[59] = t22;
		} else t22 = $[59];
		if ($[60] !== t17 || $[61] !== t22) {
			t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 items-center justify-between gap-2 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 flex-row gap-1",
					children: [t17, t22]
				})
			});
			$[60] = t17;
			$[61] = t22;
			$[62] = t12;
		} else t12 = $[62];
		T0 = Tabs;
		t7 = selectedTab;
		t8 = handleTabChange;
		t9 = "flex min-h-0 flex-1 flex-col gap-0 overflow-hidden";
		t10 = !hideTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 items-center border-b border-ed-divider px-3 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleTabs, {
				size: "xs",
				className: "w-fit shrink-0",
				children: visibleTabs.map((t23) => {
					const { value, label } = t23;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value,
						onClick: () => {
							if (value === selectedTab) onTabActivate?.(value);
						},
						children: label
					}, value);
				})
			})
		});
		$[9] = activeTab;
		$[10] = className;
		$[11] = fileMenu;
		$[12] = hideTabs;
		$[13] = internalTab;
		$[14] = onActiveTabChange;
		$[15] = onOpenProjectSettings;
		$[16] = onProjectIconClick;
		$[17] = onTabActivate;
		$[18] = pendingName;
		$[19] = rename;
		$[20] = renaming;
		$[21] = segment;
		$[22] = shownName;
		$[23] = slots;
		$[24] = T0;
		$[25] = t10;
		$[26] = t11;
		$[27] = t12;
		$[28] = t7;
		$[29] = t8;
		$[30] = t9;
	} else {
		T0 = $[24];
		t10 = $[25];
		t11 = $[26];
		t12 = $[27];
		t7 = $[28];
		t8 = $[29];
		t9 = $[30];
	}
	let t13;
	if ($[63] !== pages) {
		t13 = pages ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingTab, { name: "Pages" });
		$[63] = pages;
		$[64] = t13;
	} else t13 = $[64];
	let t14;
	if ($[65] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "pages",
			forceMount: true,
			className: "min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden!",
			children: t13
		});
		$[65] = t13;
		$[66] = t14;
	} else t14 = $[66];
	let t15;
	if ($[67] !== assets) {
		t15 = assets ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingTab, { name: "Assets" });
		$[67] = assets;
		$[68] = t15;
	} else t15 = $[68];
	let t16;
	if ($[69] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "assets",
			className: "min-h-0 flex-1 overflow-hidden",
			children: t15
		});
		$[69] = t15;
		$[70] = t16;
	} else t16 = $[70];
	let t17;
	if ($[71] !== agents) {
		t17 = agents != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "agents",
			forceMount: true,
			className: "min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden!",
			children: agents
		});
		$[71] = agents;
		$[72] = t17;
	} else t17 = $[72];
	let t18;
	if ($[73] !== T0 || $[74] !== t10 || $[75] !== t14 || $[76] !== t16 || $[77] !== t17 || $[78] !== t7 || $[79] !== t8 || $[80] !== t9) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			value: t7,
			onValueChange: t8,
			className: t9,
			children: [
				t10,
				t14,
				t16,
				t17
			]
		});
		$[73] = T0;
		$[74] = t10;
		$[75] = t14;
		$[76] = t16;
		$[77] = t17;
		$[78] = t7;
		$[79] = t8;
		$[80] = t9;
		$[81] = t18;
	} else t18 = $[81];
	let t19;
	if ($[82] !== t11 || $[83] !== t12 || $[84] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t11,
			children: [t12, t18]
		});
		$[82] = t11;
		$[83] = t12;
		$[84] = t18;
		$[85] = t19;
	} else t19 = $[85];
	return t19;
}

export { LeftSidebarV2 };
