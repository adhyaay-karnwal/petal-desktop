// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/ProjectSettingsModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { BookOpenIcon, BracketsCurlyIcon, ChatIcon, CodeIcon, FontIcon, SettingsIcon } from "../../../../../ui/src/icons.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../ui/src/components/Dialog.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { AIChatSettings } from "./AIChatSettings.js";
import { CopyCodeSettings } from "./CopyCodeSettings.js";
import { GeneralSettings } from "./GeneralSettings.js";
import { IconsSettings } from "./IconsSettings.js";
import { SkillsSettings } from "./SkillsSettings.js";

var CATEGORIES = [
	{
		id: "general",
		label: "General",
		Icon: SettingsIcon
	},
	{
		id: "code",
		label: "Copy code",
		Icon: BracketsCurlyIcon
	},
	{
		id: "ai",
		label: "AI Chat",
		Icon: ChatIcon
	},
	{
		id: "icons",
		label: "Icons",
		Icon: CodeIcon
	},
	{
		id: "fonts",
		label: "Fonts",
		Icon: FontIcon
	},
	{
		id: "skills",
		label: "Skills",
		Icon: BookOpenIcon
	}
];
function ProjectSettingsModal(t0) {
	const $ = (0, import_compiler_runtime.c)(58);
	const { open, onOpenChange, projectName: t1, onRenameProject, canRename: t2, allowedPaths, onAddAllowedPath, onRemoveAllowedPath, isElectron: t3, iconLibraries: t4, onAddIconPackage, onRemoveIconPackage, onAskAIForIconSetup, initialSection: t5, projectSize, fontSettings, copyCodeIncludesComponents: t6, onChangeCopyCodeIncludesComponents, canEditCopyCode: t7, skills } = t0;
	const projectName = t1 === void 0 ? "" : t1;
	const canRename = t2 === void 0 ? false : t2;
	const isElectron = t3 === void 0 ? false : t3;
	let t8;
	if ($[0] !== t4) {
		t8 = t4 === void 0 ? [] : t4;
		$[0] = t4;
		$[1] = t8;
	} else t8 = $[1];
	const iconLibraries = t8;
	const initialSection = t5 === void 0 ? "general" : t5;
	const copyCodeIncludesComponents = t6 === void 0 ? false : t6;
	const canEditCopyCode = t7 === void 0 ? false : t7;
	const categories = skills ? CATEGORIES : CATEGORIES.filter(_temp$22);
	const [active, setActive] = (0, import_react.useState)(initialSection);
	let t9;
	if ($[2] !== initialSection || $[3] !== open) {
		t9 = {
			open,
			initialSection
		};
		$[2] = initialSection;
		$[3] = open;
		$[4] = t9;
	} else t9 = $[4];
	const [sectionWhenOpen, setSectionWhenOpen] = (0, import_react.useState)(t9);
	if (open !== sectionWhenOpen.open || initialSection !== sectionWhenOpen.initialSection) {
		setSectionWhenOpen({
			open,
			initialSection
		});
		if (open) setActive(initialSection);
	}
	const T0 = Dialog;
	const T1 = DialogContent;
	const t10 = void 0;
	const t11 = "max-w-[800px]";
	let t12;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = { height: "min(85vh, 560px)" };
		$[5] = t12;
	} else t12 = $[5];
	let t13;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "File settings" }) });
		$[6] = t13;
	} else t13 = $[6];
	const t14 = "flex min-h-0 flex-1";
	const t15 = "flex w-[180px] shrink-0 flex-col gap-0.5 border-r border-ed-divider p-3";
	let t16;
	if ($[7] !== active) {
		t16 = (c_0) => {
			const isActive = active === c_0.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setActive(c_0.id),
				className: cn$2("flex h-6.5 items-center gap-2 rounded-[5px] px-2 text-ed-ui leading-4", isActive ? "bg-ed-field text-ed-foreground shadow-ed-control" : "text-ed-muted-foreground hover:bg-ed-ghost-hover hover:text-ed-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c_0.Icon, {
					width: 12,
					height: 12,
					className: "shrink-0"
				}), c_0.label]
			}, c_0.id);
		};
		$[7] = active;
		$[8] = t16;
	} else t16 = $[8];
	const t17 = categories.map(t16);
	let t18;
	if ($[9] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: t15,
			children: t17
		});
		$[9] = t17;
		$[10] = t18;
	} else t18 = $[10];
	const t19 = active === "fonts" && fontSettings;
	let t20;
	if ($[11] !== active || $[12] !== canRename || $[13] !== onRenameProject || $[14] !== projectName || $[15] !== projectSize) {
		t20 = active === "general" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneralSettings, {
			projectName,
			onRenameProject,
			canRename,
			projectSize
		});
		$[11] = active;
		$[12] = canRename;
		$[13] = onRenameProject;
		$[14] = projectName;
		$[15] = projectSize;
		$[16] = t20;
	} else t20 = $[16];
	let t21;
	if ($[17] !== active || $[18] !== canEditCopyCode || $[19] !== copyCodeIncludesComponents || $[20] !== onChangeCopyCodeIncludesComponents) {
		t21 = active === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCodeSettings, {
			includesComponents: copyCodeIncludesComponents,
			onChangeIncludesComponents: onChangeCopyCodeIncludesComponents,
			canEdit: canEditCopyCode
		});
		$[17] = active;
		$[18] = canEditCopyCode;
		$[19] = copyCodeIncludesComponents;
		$[20] = onChangeCopyCodeIncludesComponents;
		$[21] = t21;
	} else t21 = $[21];
	let t22;
	if ($[22] !== active || $[23] !== allowedPaths || $[24] !== isElectron || $[25] !== onAddAllowedPath || $[26] !== onRemoveAllowedPath) {
		t22 = active === "ai" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIChatSettings, {
			allowedPaths,
			onAddAllowedPath,
			onRemoveAllowedPath,
			isElectron
		});
		$[22] = active;
		$[23] = allowedPaths;
		$[24] = isElectron;
		$[25] = onAddAllowedPath;
		$[26] = onRemoveAllowedPath;
		$[27] = t22;
	} else t22 = $[27];
	let t23;
	if ($[28] !== active || $[29] !== iconLibraries || $[30] !== onAddIconPackage || $[31] !== onAskAIForIconSetup || $[32] !== onRemoveIconPackage) {
		t23 = active === "icons" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconsSettings, {
			iconLibraries,
			onAddIconPackage,
			onRemoveIconPackage,
			onAskAIForIconSetup
		});
		$[28] = active;
		$[29] = iconLibraries;
		$[30] = onAddIconPackage;
		$[31] = onAskAIForIconSetup;
		$[32] = onRemoveIconPackage;
		$[33] = t23;
	} else t23 = $[33];
	let t24;
	if ($[34] !== active || $[35] !== skills) {
		t24 = active === "skills" && skills && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillsSettings, { ...skills });
		$[34] = active;
		$[35] = skills;
		$[36] = t24;
	} else t24 = $[36];
	let t25;
	if ($[37] !== t19 || $[38] !== t20 || $[39] !== t21 || $[40] !== t22 || $[41] !== t23 || $[42] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			viewportClassName: "px-5 py-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6",
				children: [
					t19,
					t20,
					t21,
					t22,
					t23,
					t24
				]
			})
		});
		$[37] = t19;
		$[38] = t20;
		$[39] = t21;
		$[40] = t22;
		$[41] = t23;
		$[42] = t24;
		$[43] = t25;
	} else t25 = $[43];
	let t26;
	if ($[44] !== t18 || $[45] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t14,
			children: [t18, t25]
		});
		$[44] = t18;
		$[45] = t25;
		$[46] = t26;
	} else t26 = $[46];
	let t27;
	if ($[47] !== T1 || $[48] !== t10 || $[49] !== t12 || $[50] !== t13 || $[51] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T1, {
			"aria-describedby": t10,
			className: t11,
			style: t12,
			children: [t13, t26]
		});
		$[47] = T1;
		$[48] = t10;
		$[49] = t12;
		$[50] = t13;
		$[51] = t26;
		$[52] = t27;
	} else t27 = $[52];
	let t28;
	if ($[53] !== T0 || $[54] !== onOpenChange || $[55] !== open || $[56] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			open,
			onOpenChange,
			children: t27
		});
		$[53] = T0;
		$[54] = onOpenChange;
		$[55] = open;
		$[56] = t27;
		$[57] = t28;
	} else t28 = $[57];
	return t28;
}
function _temp$22(c) {
	return c.id !== "skills";
}

export { ProjectSettingsModal };
