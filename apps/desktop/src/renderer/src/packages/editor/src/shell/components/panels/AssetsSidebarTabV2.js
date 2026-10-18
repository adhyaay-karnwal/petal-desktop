// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/AssetsSidebarTabV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { componentDisplayName } from "../../../../../compiler/src/runtime/ComponentCompiler.js";
import { buildCompositionTemplates, getCompositionPathForBase } from "../../../../../compiler/src/runtime/compositionFiles.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon, CodeIcon, DesktopIcon, DeviceMobileIcon, DeviceTabletIcon, FileCodeIcon, FilePlusIcon, FolderIcon, GlobeIcon, PackageIcon, PaletteIcon, PlusIcon, SearchIcon, SparkleIcon, TextTIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { i$5 } from "../../../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../ui/src/components/DropdownMenu.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../../../ui/src/components/InputGroup.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { IconBtn } from "./styles/primitives.js";
import { generatePrefixedId } from "../../../shared/utils/idUtils.js";
import { parseCompositionFile } from "../../../../../compiler/src/codegen/extractCompositionElement.js";
import { setCompositionDragData, setElementDragData } from "../../../shared/utils/clipboard.js";
import { createTextElement } from "../../../shared/utils/createTextElement.js";
import { createElementFromTag, htmlTags } from "../../utils/htmlTagsData.js";
import { CompositionPreview, collectCompositionPreviewNames, getCompositionParseContext, getCompositionParseSignature, parseCompositionImports, useCompositionRootsByExport } from "./compositionDrag.js";
import { buildRequiredComponentProps } from "./AssetsPanel.js";
import { extractIconNames, searchIcons } from "../../utils/iconUtils.js";
import { IconsPanel } from "./IconsPanel.js";
import { SidebarSectionHeader } from "../SidebarSectionHeader.js";

var INDENT_STEP = 20;
var INDENT_BASE = 0;
var indentOf = (depth) => depth * INDENT_STEP + INDENT_BASE;
var ASSET_ICON_PX = 14;
var ICON_SEARCH_PREVIEW = 16;
var COMPOSITION_FRAME_PADDING = 4;
var EMPTY_COMPONENT_INDEX = {};
var EMPTY_COMPONENTS = {};
var EMPTY_ICON_LIBRARIES = {};
var htmlTagIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeIcon, {
	width: ASSET_ICON_PX,
	height: ASSET_ICON_PX,
	className: "text-ed-muted-foreground"
});
var htmlTextIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextTIcon, {
	width: ASSET_ICON_PX,
	height: ASSET_ICON_PX,
	className: "text-ed-muted-foreground"
});
var kitIcon = (Icon, className) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
	width: ASSET_ICON_PX,
	height: ASSET_ICON_PX,
	className
});
var HTML_GROUPS = [
	{
		id: "typography",
		label: "Typography",
		categories: ["text"]
	},
	{
		id: "media",
		label: "Media",
		categories: ["media"]
	},
	{
		id: "forms",
		label: "Forms",
		categories: ["form"]
	},
	{
		id: "layout",
		label: "Layout",
		categories: ["layout", "semantic"]
	}
];
var WEBVIEW_SIZE_GROUPS = [
	{
		id: "mobile",
		label: "Mobile",
		Icon: DeviceMobileIcon,
		sizes: [
			{
				name: "iPhone SE",
				width: 375,
				height: 667
			},
			{
				name: "iPhone",
				width: 390,
				height: 844
			},
			{
				name: "iPhone Pro Max",
				width: 430,
				height: 932
			},
			{
				name: "Pixel",
				width: 412,
				height: 915
			}
		]
	},
	{
		id: "tablet",
		label: "Tablet",
		Icon: DeviceTabletIcon,
		sizes: [
			{
				name: "iPad mini",
				width: 768,
				height: 1024
			},
			{
				name: "iPad",
				width: 834,
				height: 1112
			},
			{
				name: "iPad Pro",
				width: 1024,
				height: 1366
			}
		]
	},
	{
		id: "desktop",
		label: "Desktop",
		Icon: DesktopIcon,
		sizes: [
			{
				name: "Laptop",
				width: 1280,
				height: 800
			},
			{
				name: "Desktop",
				width: 1440,
				height: 900
			},
			{
				name: "MacBook Pro 14\"",
				width: 1512,
				height: 982
			},
			{
				name: "Full HD",
				width: 1920,
				height: 1080
			},
			{
				name: "2K",
				width: 2560,
				height: 1440
			}
		]
	}
];
var DEFAULT_WEBVIEW_SIZE = {
	width: 1280,
	height: 800
};
function webviewSizeSearchText(size) {
	return `${size.name} ${size.width} ${size.height} ${size.width}x${size.height}`;
}
function createWebviewElement(src, viewportWidth, viewportHeight) {
	return {
		id: generatePrefixedId("webview"),
		type: "webview",
		src,
		viewportWidth,
		viewportHeight
	};
}
function compactComponentFiles(componentIndex) {
	const byPath = /* @__PURE__ */ new Map();
	for (const [componentName, info] of Object.entries(componentIndex)) {
		if (!info.path || /\.compositions?\.[jt]sx?$/.test(info.path)) continue;
		const entry = byPath.get(info.path) ?? {
			path: info.path,
			name: info.path.split("/").pop()?.replace(/\.[^.]+$/, "") || info.path,
			components: []
		};
		entry.components.push(componentName);
		byPath.set(info.path, entry);
	}
	return [...byPath.values()].map((entry) => ({
		...entry,
		components: entry.components.sort((a, b) => a.localeCompare(b))
	})).sort((a, b) => a.path.localeCompare(b.path));
}
function buildComponentTree(componentIndex) {
	const roots = [];
	for (const file of compactComponentFiles(componentIndex)) {
		const parts = file.path.split("/");
		const pathParts = parts[0] === "components" ? parts.slice(1) : parts;
		let siblings = roots;
		let currentPath = parts[0] === "components" ? "components" : "";
		for (const folderName of pathParts.slice(0, -1)) {
			currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
			let folder = siblings.find((node) => node.type === "folder" && node.path === currentPath);
			if (!folder) {
				folder = {
					type: "folder",
					name: folderName,
					path: currentPath,
					children: []
				};
				siblings.push(folder);
			}
			siblings = folder.children;
		}
		siblings.push({
			type: "file",
			name: file.name,
			path: file.path,
			file
		});
	}
	const sortNodes = (nodes) => nodes.map((node) => node.children ? {
		...node,
		children: sortNodes(node.children)
	} : node).sort((a, b) => {
		if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
	return sortNodes(roots);
}
function filterComponentTree(nodes, query) {
	if (!query) return nodes;
	return nodes.flatMap((node) => {
		const selfMatches = [
			node.name,
			node.path,
			...node.file?.components ?? []
		].some((value) => value.toLowerCase().includes(query));
		if (node.type === "file") return selfMatches ? [node] : [];
		if (selfMatches) return [node];
		const children = filterComponentTree(node.children ?? [], query);
		return children.length ? [{
			...node,
			children
		}] : [];
	});
}
function TreeRow(t0) {
	const $ = (0, import_compiler_runtime.c)(48);
	const { depth, expanded, onToggle, icon, label, trailing, onTrailingClick, draggable, onDragStart, onClick, onDoubleClick } = t0;
	const expandable = expanded !== void 0;
	const split = !!onTrailingClick;
	const t1 = split ? "gap-1" : "min-w-full w-max gap-1.5 rounded-[5px] hover:bg-ed-accent";
	const t2 = draggable && "cursor-grab active:cursor-grabbing";
	let t3;
	if ($[0] !== t1 || $[1] !== t2) {
		t3 = cn$2("relative flex h-6.5 w-full min-w-0 items-center py-0 pr-1 group", t1, t2);
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== depth) {
		t4 = indentOf(depth);
		$[3] = depth;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== t4) {
		t5 = { paddingLeft: t4 };
		$[5] = t4;
		$[6] = t5;
	} else t5 = $[6];
	const t6 = split ? void 0 : "button";
	const t7 = split ? void 0 : 0;
	const t8 = split ? void 0 : onClick;
	let t9;
	if ($[7] !== onClick || $[8] !== split) {
		t9 = split ? void 0 : (event) => {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			onClick?.(event);
		};
		$[7] = onClick;
		$[8] = split;
		$[9] = t9;
	} else t9 = $[9];
	const t10 = split ? 0 : void 0;
	const t11 = split && "h-full flex-1 group-hover:bg-ed-accent";
	let t12;
	if ($[10] !== t11) {
		t12 = cn$2("flex min-w-0 items-center gap-1.5 rounded-[5px]", t11);
		$[10] = t11;
		$[11] = t12;
	} else t12 = $[11];
	const t13 = split ? onClick : void 0;
	let t14;
	if ($[12] !== onClick || $[13] !== split) {
		t14 = split ? (event_0) => {
			if (event_0.key !== "Enter" && event_0.key !== " ") return;
			event_0.preventDefault();
			onClick?.(event_0);
		} : void 0;
		$[12] = onClick;
		$[13] = split;
		$[14] = t14;
	} else t14 = $[14];
	let t15;
	if ($[15] !== expandable || $[16] !== expanded || $[17] !== onToggle) {
		t15 = expandable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-3xs",
			isChildText: false,
			"aria-label": expanded ? "Collapse" : "Expand",
			className: "group/caret size-4 hover:bg-transparent",
			onClick: (event_1) => {
				event_1.stopPropagation();
				onToggle?.();
			},
			children: expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "size-2 text-ed-muted-foreground group-hover/caret:text-ed-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, { className: "size-2 text-ed-muted-foreground group-hover/caret:text-ed-foreground" })
		});
		$[15] = expandable;
		$[16] = expanded;
		$[17] = onToggle;
		$[18] = t15;
	} else t15 = $[18];
	let t16;
	if ($[19] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex w-4 shrink-0 items-center justify-center",
			children: t15
		});
		$[19] = t15;
		$[20] = t16;
	} else t16 = $[20];
	let t17;
	if ($[21] !== icon) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3.5",
			children: icon
		});
		$[21] = icon;
		$[22] = t17;
	} else t17 = $[22];
	let t18;
	if ($[23] !== label) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			variant: "primary",
			className: "shrink-0 select-none whitespace-nowrap text-left",
			children: label
		});
		$[23] = label;
		$[24] = t18;
	} else t18 = $[24];
	let t19;
	if ($[25] !== t10 || $[26] !== t12 || $[27] !== t13 || $[28] !== t14 || $[29] !== t16 || $[30] !== t17 || $[31] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "button",
			tabIndex: t10,
			className: t12,
			onClick: t13,
			onKeyDown: t14,
			children: [
				t16,
				t17,
				t18
			]
		});
		$[25] = t10;
		$[26] = t12;
		$[27] = t13;
		$[28] = t14;
		$[29] = t16;
		$[30] = t17;
		$[31] = t18;
		$[32] = t19;
	} else t19 = $[32];
	let t20;
	if ($[33] !== onTrailingClick || $[34] !== trailing) {
		t20 = trailing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			role: onTrailingClick ? "button" : void 0,
			tabIndex: onTrailingClick ? 0 : void 0,
			className: cn$2("ml-auto flex h-full shrink-0 items-center justify-end gap-1 text-ed-muted-foreground", onTrailingClick ? "rounded-[5px] px-1.5 group-hover:bg-ed-accent group-hover:text-ed-foreground" : "pr-1"),
			onClick: onTrailingClick ? (event_2) => {
				event_2.stopPropagation();
				onTrailingClick(event_2);
			} : void 0,
			children: trailing
		});
		$[33] = onTrailingClick;
		$[34] = trailing;
		$[35] = t20;
	} else t20 = $[35];
	let t21;
	if ($[36] !== draggable || $[37] !== onDoubleClick || $[38] !== onDragStart || $[39] !== t19 || $[40] !== t20 || $[41] !== t3 || $[42] !== t5 || $[43] !== t6 || $[44] !== t7 || $[45] !== t8 || $[46] !== t9) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			style: t5,
			role: t6,
			tabIndex: t7,
			draggable,
			onDragStart,
			onClick: t8,
			onDoubleClick,
			onKeyDown: t9,
			children: [t19, t20]
		});
		$[36] = draggable;
		$[37] = onDoubleClick;
		$[38] = onDragStart;
		$[39] = t19;
		$[40] = t20;
		$[41] = t3;
		$[42] = t5;
		$[43] = t6;
		$[44] = t7;
		$[45] = t8;
		$[46] = t9;
		$[47] = t21;
	} else t21 = $[47];
	return t21;
}
function AssetAddButton(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { label, onClick } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== label || $[2] !== onClick) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label,
			onClick,
			children: t1
		});
		$[1] = label;
		$[2] = onClick;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
}
/** Consolidated Assets tab for the feature-flagged left sidebar. */
var AssetsSidebarTabV2 = (0, import_react.forwardRef)(function AssetsSidebarTabV2(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(290);
	const { onAddElement, componentIndex: t1, components: t2, iconLibraries: t3, allIconLibraries, onEditComponent, onCreateComponentFile, onAddShadcnComponents, onImportDesignSystem, onOpenIconSettings, onAskAIForIconLibrary, onPasteCompositionJsx, readCompositionFile, compositionSourceId: t4, compositionRefreshKey: t5, readOnly: t6, isElectron: t7, onEnsureComponentNames } = t0;
	const componentIndex = t1 === void 0 ? EMPTY_COMPONENT_INDEX : t1;
	const components = t2 === void 0 ? EMPTY_COMPONENTS : t2;
	const iconLibraries = t3 === void 0 ? EMPTY_ICON_LIBRARIES : t3;
	const compositionSourceId = t4 === void 0 ? "" : t4;
	const compositionRefreshKey = t5 === void 0 ? 0 : t5;
	const readOnly = t6 === void 0 ? false : t6;
	const isElectron = t7 === void 0 ? false : t7;
	let t8;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = {
			html: false,
			components: true,
			icons: true,
			webview: false
		};
		$[0] = t8;
	} else t8 = $[0];
	const [expandedSections, setExpandedSections] = (0, import_react.useState)(t8);
	const [webviewUrl, setWebviewUrl] = (0, import_react.useState)("http://localhost:3000");
	let t9;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = {};
		$[1] = t9;
	} else t9 = $[1];
	const [expandedHtmlGroups, setExpandedHtmlGroups] = (0, import_react.useState)(t9);
	let t10;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = {};
		$[2] = t10;
	} else t10 = $[2];
	const [expandedWebviewGroups, setExpandedWebviewGroups] = (0, import_react.useState)(t10);
	let t11;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = {};
		$[3] = t11;
	} else t11 = $[3];
	const [expandedComponentPaths, setExpandedComponentPaths] = (0, import_react.useState)(t11);
	const [selectedIconLibrary, setSelectedIconLibrary] = (0, import_react.useState)(null);
	let t12;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = {};
		$[4] = t12;
	} else t12 = $[4];
	const [expandedIconLibraries, setExpandedIconLibraries] = (0, import_react.useState)(t12);
	const [selectedComponentFile, setSelectedComponentFile] = (0, import_react.useState)(null);
	const [loadedComposition, setLoadedComposition] = (0, import_react.useState)(null);
	const compositionReadRef = (0, import_react.useRef)(null);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const searchInputRef = (0, import_react.useRef)(null);
	let t13;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = () => {
			requestAnimationFrame(() => searchInputRef.current?.focus());
		};
		$[5] = t13;
	} else t13 = $[5];
	const focusSearch = t13;
	let t14;
	let t15;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => ({ openSearch: () => {
			setSelectedComponentFile(null);
			setSelectedIconLibrary(null);
			setExpandedSections(_temp$53);
			focusSearch();
		} });
		t15 = [];
		$[6] = t14;
		$[7] = t15;
	} else {
		t14 = $[6];
		t15 = $[7];
	}
	(0, import_react.useImperativeHandle)(ref, t14, t15);
	let t16;
	if ($[8] !== componentIndex) {
		t16 = buildComponentTree(componentIndex);
		$[8] = componentIndex;
		$[9] = t16;
	} else t16 = $[9];
	const componentTree = t16;
	let t17;
	if ($[10] !== searchQuery) {
		t17 = searchQuery.trim().toLowerCase();
		$[10] = searchQuery;
		$[11] = t17;
	} else t17 = $[11];
	const searchTerm = t17;
	const searching = !!searchTerm;
	const htmlOpen = searching || expandedSections.html;
	const componentsOpen = searching || expandedSections.components;
	const iconsOpen = searching || expandedSections.icons;
	const webviewOpen = searching || expandedSections.webview;
	let t18;
	bb0: {
		if (!searchTerm) {
			t18 = true;
			break bb0;
		}
		if ([
			"live preview",
			"webview",
			"localhost",
			"embed",
			"preview"
		].some((value) => value.includes(searchTerm))) {
			t18 = true;
			break bb0;
		}
		let t19;
		if ($[12] !== searchTerm) {
			t19 = WEBVIEW_SIZE_GROUPS.some((group) => group.label.toLowerCase().includes(searchTerm) || group.sizes.some((size) => webviewSizeSearchText(size).toLowerCase().includes(searchTerm)));
			$[12] = searchTerm;
			$[13] = t19;
		} else t19 = $[13];
		t18 = t19;
	}
	const webviewHasResults = t18;
	let t19;
	bb1: {
		if (!searchTerm) {
			t19 = true;
			break bb1;
		}
		if ("text".includes(searchTerm)) {
			t19 = true;
			break bb1;
		}
		let t20;
		if ($[14] !== searchTerm) {
			t20 = htmlTags.some((tag) => `${tag.title} ${tag.tag}`.toLowerCase().includes(searchTerm)) || HTML_GROUPS.some((group_0) => group_0.label.toLowerCase().includes(searchTerm));
			$[14] = searchTerm;
			$[15] = t20;
		} else t20 = $[15];
		t19 = t20;
	}
	const htmlHasResults = t19;
	let t20;
	if ($[16] !== iconLibraries || $[17] !== searchTerm) {
		t20 = Object.entries(iconLibraries).flatMap((t21) => {
			const [library, config] = t21;
			const names = extractIconNames(config.icons, config.iconNames);
			const matches = searchTerm ? searchIcons(names, searchTerm) : [];
			const libraryMatches = !searchTerm || `${config.displayName ?? ""} ${library}`.toLowerCase().includes(searchTerm);
			if (searchTerm && !libraryMatches && matches.length === 0) return [];
			return [{
				library,
				config,
				names,
				matches,
				libraryMatches
			}];
		});
		$[16] = iconLibraries;
		$[17] = searchTerm;
		$[18] = t20;
	} else t20 = $[18];
	const iconLibraryResults = t20;
	let t21;
	if ($[19] !== componentTree || $[20] !== searchTerm) {
		t21 = filterComponentTree(componentTree, searchTerm);
		$[19] = componentTree;
		$[20] = searchTerm;
		$[21] = t21;
	} else t21 = $[21];
	const filteredComponentTree = t21;
	const canReadComposition = !!readCompositionFile;
	let t22;
	if ($[22] !== canReadComposition || $[23] !== compositionRefreshKey || $[24] !== compositionSourceId || $[25] !== selectedComponentFile) {
		t22 = selectedComponentFile && canReadComposition ? `${compositionSourceId}\u0000${compositionRefreshKey}\u0000${getCompositionPathForBase(selectedComponentFile.path)}` : null;
		$[22] = canReadComposition;
		$[23] = compositionRefreshKey;
		$[24] = compositionSourceId;
		$[25] = selectedComponentFile;
		$[26] = t22;
	} else t22 = $[26];
	const compositionRequestKey = t22;
	const compositionIsCurrent = compositionRequestKey !== null && loadedComposition?.key === compositionRequestKey;
	const compositionContent = compositionIsCurrent ? loadedComposition.content : null;
	const compositionLoading = compositionRequestKey !== null && !compositionIsCurrent;
	let t23;
	bb2: {
		if (!compositionContent) {
			let t24;
			if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
				t24 = {
					compositionTemplates: [],
					compositionJsxByExport: /* @__PURE__ */ new Map()
				};
				$[27] = t24;
			} else t24 = $[27];
			t23 = t24;
			break bb2;
		}
		let jsxByExport;
		let t24;
		if ($[28] !== compositionContent) {
			const { exportNames, jsxByExport: t25 } = parseCompositionFile(compositionContent);
			jsxByExport = t25;
			t24 = buildCompositionTemplates(exportNames);
			$[28] = compositionContent;
			$[29] = jsxByExport;
			$[30] = t24;
		} else {
			jsxByExport = $[29];
			t24 = $[30];
		}
		let t25;
		if ($[31] !== jsxByExport || $[32] !== t24) {
			t25 = {
				compositionTemplates: t24,
				compositionJsxByExport: jsxByExport
			};
			$[31] = jsxByExport;
			$[32] = t24;
			$[33] = t25;
		} else t25 = $[33];
		t23 = t25;
	}
	const { compositionTemplates, compositionJsxByExport } = t23;
	let t24;
	if ($[34] !== compositionContent) {
		t24 = parseCompositionImports(compositionContent);
		$[34] = compositionContent;
		$[35] = t24;
	} else t24 = $[35];
	const compositionImports = t24;
	let t25;
	if ($[36] !== allIconLibraries || $[37] !== componentIndex || $[38] !== compositionImports || $[39] !== iconLibraries) {
		t25 = getCompositionParseContext(compositionImports, iconLibraries, componentIndex, allIconLibraries);
		$[36] = allIconLibraries;
		$[37] = componentIndex;
		$[38] = compositionImports;
		$[39] = iconLibraries;
		$[40] = t25;
	} else t25 = $[40];
	const compositionParseContext = t25;
	let t26;
	if ($[41] !== compositionJsxByExport || $[42] !== compositionParseContext) {
		t26 = getCompositionParseSignature(compositionJsxByExport.values(), compositionParseContext);
		$[41] = compositionJsxByExport;
		$[42] = compositionParseContext;
		$[43] = t26;
	} else t26 = $[43];
	const compositionRootsByExport = useCompositionRootsByExport(compositionJsxByExport, compositionParseContext, t26);
	let t27;
	let t28;
	if ($[44] !== selectedComponentFile || $[45] !== selectedIconLibrary) {
		t27 = () => {
			if (selectedComponentFile || selectedIconLibrary) return;
			requestAnimationFrame(() => searchInputRef.current?.focus());
		};
		t28 = [selectedComponentFile, selectedIconLibrary];
		$[44] = selectedComponentFile;
		$[45] = selectedIconLibrary;
		$[46] = t27;
		$[47] = t28;
	} else {
		t27 = $[46];
		t28 = $[47];
	}
	(0, import_react.useEffect)(t27, t28);
	let t29;
	if ($[48] !== readCompositionFile) {
		t29 = async (path, sourceId, refreshKey) => {
			if (!readCompositionFile) return null;
			const key = `${sourceId}:${path}:${refreshKey}`;
			if (compositionReadRef.current?.key !== key) compositionReadRef.current = {
				key,
				promise: readCompositionFile(path)
			};
			return compositionReadRef.current.promise;
		};
		$[48] = readCompositionFile;
		$[49] = t29;
	} else t29 = $[49];
	const loadComposition = (0, import_react.useEffectEvent)(t29);
	let t30;
	if ($[50] !== onEnsureComponentNames) {
		t30 = (names_0) => {
			onEnsureComponentNames?.(names_0);
		};
		$[50] = onEnsureComponentNames;
		$[51] = t30;
	} else t30 = $[51];
	const ensureComponentNames = (0, import_react.useEffectEvent)(t30);
	let t31;
	if ($[52] !== compositionRefreshKey || $[53] !== compositionRequestKey || $[54] !== compositionSourceId || $[55] !== ensureComponentNames || $[56] !== loadComposition || $[57] !== selectedComponentFile) {
		t31 = () => {
			if (!selectedComponentFile || compositionRequestKey === null) return;
			const selectedFile = selectedComponentFile;
			const key_0 = compositionRequestKey;
			ensureComponentNames(selectedFile.components);
			let cancelled = false;
			loadComposition(getCompositionPathForBase(selectedFile.path), compositionSourceId, compositionRefreshKey).then((content) => {
				if (cancelled) return;
				setLoadedComposition({
					key: key_0,
					content: content ?? null
				});
				if (!content) return;
				const { jsxByExport: jsxByExport_0 } = parseCompositionFile(content);
				ensureComponentNames(collectCompositionPreviewNames(selectedFile.components, jsxByExport_0.values()));
			}).catch(() => {
				if (!cancelled) setLoadedComposition({
					key: key_0,
					content: null
				});
			});
			return () => {
				cancelled = true;
			};
		};
		$[52] = compositionRefreshKey;
		$[53] = compositionRequestKey;
		$[54] = compositionSourceId;
		$[55] = ensureComponentNames;
		$[56] = loadComposition;
		$[57] = selectedComponentFile;
		$[58] = t31;
	} else t31 = $[58];
	let t32;
	if ($[59] !== compositionRefreshKey || $[60] !== compositionRequestKey || $[61] !== compositionSourceId || $[62] !== selectedComponentFile) {
		t32 = [
			selectedComponentFile,
			compositionRequestKey,
			compositionSourceId,
			compositionRefreshKey
		];
		$[59] = compositionRefreshKey;
		$[60] = compositionRequestKey;
		$[61] = compositionSourceId;
		$[62] = selectedComponentFile;
		$[63] = t32;
	} else t32 = $[63];
	(0, import_react.useEffect)(t31, t32);
	let t33;
	if ($[64] === Symbol.for("react.memo_cache_sentinel")) {
		t33 = (section) => {
			setExpandedSections((current_0) => ({
				...current_0,
				[section]: !current_0[section]
			}));
		};
		$[64] = t33;
	} else t33 = $[64];
	const toggleSection = t33;
	let t34;
	if ($[65] !== iconLibraries) {
		t34 = (library_0, iconName) => {
			const config_0 = iconLibraries[library_0];
			return {
				id: generatePrefixedId("icon"),
				type: "icon",
				library: library_0,
				iconName,
				props: { ...config_0?.defaultProps },
				styles: {}
			};
		};
		$[65] = iconLibraries;
		$[66] = t34;
	} else t34 = $[66];
	const createIconElement = t34;
	let t35;
	if ($[67] !== componentIndex) {
		t35 = (componentName) => {
			const info = componentIndex[componentName];
			const { props, hasChildrenProp } = buildRequiredComponentProps(info?.props);
			return {
				id: generatePrefixedId("component"),
				type: "component",
				componentName,
				props,
				styles: {},
				children: hasChildrenProp ? [] : void 0
			};
		};
		$[67] = componentIndex;
		$[68] = t35;
	} else t35 = $[68];
	const createComponentElement = t35;
	let t36;
	if ($[69] !== onAddElement || $[70] !== readOnly) {
		t36 = (createElement, event) => {
			if (readOnly) return;
			const element = createElement();
			if (event) setElementDragData(event, element);
			else onAddElement(element);
		};
		$[69] = onAddElement;
		$[70] = readOnly;
		$[71] = t36;
	} else t36 = $[71];
	const addOrDrag = t36;
	let t37;
	if ($[72] !== addOrDrag || $[73] !== isElectron || $[74] !== webviewUrl) {
		t37 = (width, height, event_0) => {
			const url = webviewUrl.trim();
			if (!url || !isElectron) return;
			addOrDrag(() => createWebviewElement(url, width, height), event_0);
		};
		$[72] = addOrDrag;
		$[73] = isElectron;
		$[74] = webviewUrl;
		$[75] = t37;
	} else t37 = $[75];
	const addWebviewAt = t37;
	let t38;
	if ($[76] !== addOrDrag || $[77] !== readOnly) {
		t38 = (tag_0, depth) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
			depth,
			icon: htmlTagIcon(),
			label: tag_0.title,
			trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "tertiary",
				className: "font-mono",
				children: tag_0.tag
			}),
			draggable: !readOnly,
			onDragStart: (event_1) => addOrDrag(() => createElementFromTag(tag_0), event_1),
			onClick: () => addOrDrag(() => createElementFromTag(tag_0))
		}, tag_0.tag);
		$[76] = addOrDrag;
		$[77] = readOnly;
		$[78] = t38;
	} else t38 = $[78];
	const renderHtmlTag = t38;
	let T0;
	let livePreviewUrlField;
	let t39;
	let t40;
	let t41;
	let t42;
	let t43;
	let t44;
	let t45;
	let t46;
	let t47;
	let t48;
	if ($[79] !== addOrDrag || $[80] !== addWebviewAt || $[81] !== componentTree || $[82] !== components || $[83] !== componentsOpen || $[84] !== compositionJsxByExport || $[85] !== compositionLoading || $[86] !== compositionParseContext || $[87] !== compositionRootsByExport || $[88] !== compositionTemplates || $[89] !== createComponentElement || $[90] !== expandedComponentPaths || $[91] !== expandedHtmlGroups || $[92] !== filteredComponentTree || $[93] !== htmlHasResults || $[94] !== htmlOpen || $[95] !== iconLibraries || $[96] !== isElectron || $[97] !== onAddElement || $[98] !== onAddShadcnComponents || $[99] !== onAskAIForIconLibrary || $[100] !== onCreateComponentFile || $[101] !== onEditComponent || $[102] !== onImportDesignSystem || $[103] !== onPasteCompositionJsx || $[104] !== readOnly || $[105] !== renderHtmlTag || $[106] !== searchQuery || $[107] !== searchTerm || $[108] !== searching || $[109] !== selectedComponentFile || $[110] !== selectedIconLibrary || $[111] !== webviewUrl) {
		t48 = Symbol.for("react.early_return_sentinel");
		bb3: {
			const renderComponentNode = (node, t49) => {
				const depth_0 = t49 === void 0 ? 0 : t49;
				const expanded = searchTerm ? true : expandedComponentPaths[node.path] ?? false;
				const toggle = () => setExpandedComponentPaths((current_1) => ({
					...current_1,
					[node.path]: !expanded
				}));
				if (node.type === "folder") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
						depth: depth_0,
						expanded,
						onToggle: toggle,
						icon: kitIcon(FolderIcon, "text-ed-canvas-component"),
						label: node.name,
						onClick: toggle
					}), expanded && node.children?.map((child) => renderComponentNode(child, depth_0 + 1))]
				}, node.path);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex flex-col",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
						depth: depth_0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(i$5, {
							size: ASSET_ICON_PX,
							weight: "regular",
							className: "text-ed-canvas-component"
						}),
						label: node.path.split("/").pop(),
						trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, { className: "size-2 text-ed-muted-foreground" }),
						onClick: () => node.file && setSelectedComponentFile(node.file)
					})
				}, node.path);
			};
			if (selectedComponentFile) {
				const primaryComponentName = selectedComponentFile.components[0];
				let t50;
				if ($[124] === Symbol.for("react.memo_cache_sentinel")) {
					t50 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Back to components",
						onClick: () => setSelectedComponentFile(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretLeftIcon, {
							width: 16,
							height: 16
						})
					});
					$[124] = t50;
				} else t50 = $[124];
				let t51;
				if ($[125] !== selectedComponentFile.path) {
					t51 = selectedComponentFile.path.split("/").pop();
					$[125] = selectedComponentFile.path;
					$[126] = t51;
				} else t51 = $[126];
				let t52;
				if ($[127] !== t51) {
					t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "2xs",
						variant: "primary",
						className: "min-w-0 flex-1 truncate text-left leading-6 text-ed-inspector-value",
						children: t51
					});
					$[127] = t51;
					$[128] = t52;
				} else t52 = $[128];
				let t53;
				if ($[129] !== onEditComponent || $[130] !== primaryComponentName || $[131] !== selectedComponentFile.path) {
					t53 = onEditComponent && primaryComponentName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Open component file",
						onClick: () => onEditComponent(primaryComponentName, selectedComponentFile.path),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeIcon, {
							width: ASSET_ICON_PX,
							height: ASSET_ICON_PX,
							className: "text-ed-canvas-component"
						})
					});
					$[129] = onEditComponent;
					$[130] = primaryComponentName;
					$[131] = selectedComponentFile.path;
					$[132] = t53;
				} else t53 = $[132];
				let t54;
				if ($[133] !== t52 || $[134] !== t53) {
					t54 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1 px-3 py-2",
						children: [
							t50,
							t52,
							t53
						]
					});
					$[133] = t52;
					$[134] = t53;
					$[135] = t54;
				} else t54 = $[135];
				let t55;
				if ($[136] !== compositionLoading) {
					t55 = compositionLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						variant: "secondary",
						className: "px-2 py-1",
						children: "Loading compositions..."
					});
					$[136] = compositionLoading;
					$[137] = t55;
				} else t55 = $[137];
				let t56;
				if ($[138] !== components || $[139] !== compositionJsxByExport || $[140] !== compositionLoading || $[141] !== compositionParseContext || $[142] !== compositionRootsByExport || $[143] !== compositionTemplates || $[144] !== onPasteCompositionJsx || $[145] !== readOnly) {
					t56 = !compositionLoading && compositionTemplates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex w-full flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "secondary",
							className: "px-2 py-1",
							children: "Compositions"
						}), compositionTemplates.map((template) => {
							const jsx = compositionJsxByExport.get(template.exportName);
							const canInsert = !!jsx && !!onPasteCompositionJsx && !readOnly;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								draggable: canInsert,
								onDragStart: (event_2) => canInsert && jsx && setCompositionDragData(event_2, jsx, compositionRootsByExport?.get(template.exportName)),
								onClick: () => canInsert && jsx && onPasteCompositionJsx?.(jsx, compositionRootsByExport?.get(template.exportName)),
								className: cn$2("flex w-full min-w-0 flex-col gap-1 px-1 py-1.5 text-left", canInsert && "cursor-grab active:cursor-grabbing"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn$2("w-full shrink-0 overflow-hidden rounded border border-ed-border", canInsert && "hover:border-ed-ring"),
									style: {
										height: 70,
										padding: COMPOSITION_FRAME_PADDING,
										backgroundColor: "var(--background, #fff)"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompositionPreview, {
										jsx: jsx ?? null,
										components,
										parseContext: compositionParseContext,
										frameHeight: 62
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "2xs",
									variant: "primary",
									className: "truncate select-none",
									children: template.name
								})]
							}, template.exportName);
						})]
					});
					$[138] = components;
					$[139] = compositionJsxByExport;
					$[140] = compositionLoading;
					$[141] = compositionParseContext;
					$[142] = compositionRootsByExport;
					$[143] = compositionTemplates;
					$[144] = onPasteCompositionJsx;
					$[145] = readOnly;
					$[146] = t56;
				} else t56 = $[146];
				let t57;
				if ($[147] === Symbol.for("react.memo_cache_sentinel")) {
					t57 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						variant: "secondary",
						className: "px-2 py-1",
						children: "Components"
					});
					$[147] = t57;
				} else t57 = $[147];
				let t58;
				if ($[148] !== addOrDrag || $[149] !== createComponentElement || $[150] !== onEditComponent || $[151] !== readOnly || $[152] !== selectedComponentFile.components || $[153] !== selectedComponentFile.path) {
					let t59;
					if ($[155] !== addOrDrag || $[156] !== createComponentElement || $[157] !== onEditComponent || $[158] !== readOnly || $[159] !== selectedComponentFile.path) {
						t59 = (componentName_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
							depth: 0,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(i$5, {
								size: ASSET_ICON_PX,
								weight: "regular",
								className: "text-ed-canvas-component"
							}),
							label: componentDisplayName(componentName_0),
							draggable: !readOnly,
							onDragStart: (event_3) => addOrDrag(() => createComponentElement(componentName_0), event_3),
							onClick: () => addOrDrag(() => createComponentElement(componentName_0)),
							onDoubleClick: () => onEditComponent?.(componentName_0, selectedComponentFile.path)
						}, componentName_0);
						$[155] = addOrDrag;
						$[156] = createComponentElement;
						$[157] = onEditComponent;
						$[158] = readOnly;
						$[159] = selectedComponentFile.path;
						$[160] = t59;
					} else t59 = $[160];
					t58 = selectedComponentFile.components.map(t59);
					$[148] = addOrDrag;
					$[149] = createComponentElement;
					$[150] = onEditComponent;
					$[151] = readOnly;
					$[152] = selectedComponentFile.components;
					$[153] = selectedComponentFile.path;
					$[154] = t58;
				} else t58 = $[154];
				let t59;
				if ($[161] !== t58) {
					t59 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-full w-max flex-col",
						children: [t57, t58]
					});
					$[161] = t58;
					$[162] = t59;
				} else t59 = $[162];
				let t60;
				if ($[163] !== t55 || $[164] !== t56 || $[165] !== t59) {
					t60 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
						horizontal: true,
						className: "min-h-0 flex-1",
						viewportClassName: "overscroll-x-contain px-3 py-1",
						children: [
							t55,
							t56,
							t59
						]
					});
					$[163] = t55;
					$[164] = t56;
					$[165] = t59;
					$[166] = t60;
				} else t60 = $[166];
				let t61;
				if ($[167] !== t54 || $[168] !== t60) {
					t61 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full min-h-0 flex-col overflow-hidden",
						children: [t54, t60]
					});
					$[167] = t54;
					$[168] = t60;
					$[169] = t61;
				} else t61 = $[169];
				t48 = t61;
				break bb3;
			}
			if (selectedIconLibrary && iconLibraries[selectedIconLibrary]) {
				let t50;
				if ($[170] === Symbol.for("react.memo_cache_sentinel")) {
					t50 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Back to assets",
						onClick: () => setSelectedIconLibrary(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretLeftIcon, {
							width: 16,
							height: 16
						})
					});
					$[170] = t50;
				} else t50 = $[170];
				const t51 = iconLibraries[selectedIconLibrary].displayName || selectedIconLibrary;
				let t52;
				if ($[171] !== t51) {
					t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1 px-3 py-2",
						children: [t50, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "2xs",
							variant: "primary",
							className: "min-w-0 flex-1 truncate text-left leading-6 text-ed-inspector-value",
							children: t51
						})]
					});
					$[171] = t51;
					$[172] = t52;
				} else t52 = $[172];
				const t53 = iconLibraries[selectedIconLibrary];
				let t54;
				if ($[173] !== selectedIconLibrary || $[174] !== t53) {
					t54 = { [selectedIconLibrary]: t53 };
					$[173] = selectedIconLibrary;
					$[174] = t53;
					$[175] = t54;
				} else t54 = $[175];
				let t55;
				if ($[176] !== onAddElement || $[177] !== onAskAIForIconLibrary || $[178] !== readOnly || $[179] !== searchQuery || $[180] !== t54) {
					t55 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconsPanel, {
						iconLibraries: t54,
						onAskAI: onAskAIForIconLibrary,
						onAddElement,
						readOnly,
						variant: "sidebar-v2",
						searchValue: searchQuery
					});
					$[176] = onAddElement;
					$[177] = onAskAIForIconLibrary;
					$[178] = readOnly;
					$[179] = searchQuery;
					$[180] = t54;
					$[181] = t55;
				} else t55 = $[181];
				let t56;
				if ($[182] !== t52 || $[183] !== t55) {
					t56 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full min-h-0 flex-col overflow-hidden",
						children: [t52, t55]
					});
					$[182] = t52;
					$[183] = t55;
					$[184] = t56;
				} else t56 = $[184];
				t48 = t56;
				break bb3;
			}
			let t50;
			let t51;
			let t52;
			if ($[185] !== addOrDrag || $[186] !== addWebviewAt || $[187] !== expandedHtmlGroups || $[188] !== htmlHasResults || $[189] !== htmlOpen || $[190] !== isElectron || $[191] !== readOnly || $[192] !== renderHtmlTag || $[193] !== searchQuery || $[194] !== searchTerm || $[195] !== searching || $[196] !== webviewUrl) {
				const divTag = htmlTags.find(_temp2$33);
				let t53;
				if ($[207] === Symbol.for("react.memo_cache_sentinel")) {
					t53 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
						align: "inline-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeIcon, {
							width: 16,
							height: 16,
							className: "size-4 text-ed-foreground-secondary"
						})
					});
					$[207] = t53;
				} else t53 = $[207];
				let t54;
				if ($[208] === Symbol.for("react.memo_cache_sentinel")) {
					t54 = (event_4) => setWebviewUrl(event_4.target.value);
					$[208] = t54;
				} else t54 = $[208];
				let t55;
				if ($[209] !== addWebviewAt) {
					t55 = (event_5) => {
						if (event_5.key !== "Enter") return;
						addWebviewAt(DEFAULT_WEBVIEW_SIZE.width, DEFAULT_WEBVIEW_SIZE.height);
					};
					$[209] = addWebviewAt;
					$[210] = t55;
				} else t55 = $[210];
				const t56 = !isElectron || readOnly;
				let t57;
				if ($[211] !== t55 || $[212] !== t56 || $[213] !== webviewUrl) {
					t57 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
						size: "xs",
						children: [t53, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
							value: webviewUrl,
							onChange: t54,
							onKeyDown: t55,
							placeholder: "http://localhost:3000",
							"aria-label": "Preview URL",
							disabled: t56
						})]
					});
					$[211] = t55;
					$[212] = t56;
					$[213] = webviewUrl;
					$[214] = t57;
				} else t57 = $[214];
				livePreviewUrlField = t57;
				t46 = "flex h-full min-h-0 flex-col";
				let t58;
				if ($[215] === Symbol.for("react.memo_cache_sentinel")) {
					t58 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
						align: "inline-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
							width: 16,
							height: 16,
							className: "size-4 text-ed-foreground-secondary"
						})
					});
					$[215] = t58;
				} else t58 = $[215];
				let t59;
				let t60;
				if ($[216] === Symbol.for("react.memo_cache_sentinel")) {
					t59 = (event_6) => setSearchQuery(event_6.target.value);
					t60 = (event_7) => {
						if (event_7.nativeEvent.isComposing || event_7.keyCode === 229) return;
						if (event_7.key === "Escape") setSearchQuery("");
					};
					$[216] = t59;
					$[217] = t60;
				} else {
					t59 = $[216];
					t60 = $[217];
				}
				let t61;
				if ($[218] !== searchQuery) {
					t61 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
						size: "xs",
						className: "flex-1 shadow-none focus-within:ring-0!",
						children: [t58, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
							ref: searchInputRef,
							value: searchQuery,
							onChange: t59,
							onKeyDown: t60,
							placeholder: "Find...",
							"aria-label": "Find assets"
						})]
					});
					$[218] = searchQuery;
					$[219] = t61;
				} else t61 = $[219];
				let t62;
				if ($[220] !== searchTerm) {
					t62 = searchTerm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon-xs",
						variant: "ghost",
						isChildText: false,
						className: "text-ed-foreground-secondary hover:text-ed-foreground",
						onClick: () => setSearchQuery(""),
						"aria-label": "Clear asset search",
						title: "Clear search",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
							width: 16,
							height: 16
						})
					});
					$[220] = searchTerm;
					$[221] = t62;
				} else t62 = $[221];
				if ($[222] !== t61 || $[223] !== t62) {
					t47 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 flex-row items-center justify-start gap-2 p-3",
						children: [t61, t62]
					});
					$[222] = t61;
					$[223] = t62;
					$[224] = t47;
				} else t47 = $[224];
				T0 = ScrollArea;
				t42 = true;
				t43 = "min-h-0 flex-1";
				t44 = "overscroll-x-contain";
				t50 = "flex flex-col";
				let t63;
				if ($[225] === Symbol.for("react.memo_cache_sentinel")) {
					t63 = () => toggleSection("html");
					$[225] = t63;
				} else t63 = $[225];
				if ($[226] !== htmlOpen) {
					t51 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
						title: "HTML",
						expanded: htmlOpen,
						onToggle: t63
					});
					$[226] = htmlOpen;
					$[227] = t51;
				} else t51 = $[227];
				t52 = htmlOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-full w-max flex flex-col px-3 pt-1 pb-2",
					children: [
						searching && !htmlHasResults && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "tertiary",
							className: "px-1.5 py-1",
							children: "No results"
						}),
						divTag && (!searchTerm || `${divTag.title} ${divTag.tag}`.toLowerCase().includes(searchTerm)) && renderHtmlTag(divTag, 0),
						(!searchTerm || "text".includes(searchTerm)) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
							depth: 0,
							icon: htmlTextIcon(),
							label: "Text",
							trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								size: "3xs",
								variant: "tertiary",
								className: "font-mono",
								children: "text"
							}),
							draggable: !readOnly,
							onDragStart: (event_8) => addOrDrag(createTextElement, event_8),
							onClick: () => addOrDrag(createTextElement)
						}),
						HTML_GROUPS.map((group_1) => {
							const tags = htmlTags.filter((tag_2) => tag_2.tag !== "div" && group_1.categories.includes(tag_2.category));
							const visibleTags = searchTerm ? tags.filter((tag_3) => `${tag_3.title} ${tag_3.tag}`.toLowerCase().includes(searchTerm)) : tags;
							const groupMatches = group_1.label.toLowerCase().includes(searchTerm);
							if (searchTerm && !groupMatches && visibleTags.length === 0) return null;
							const expanded_0 = searchTerm ? true : expandedHtmlGroups[group_1.id] ?? false;
							const toggle_0 = () => setExpandedHtmlGroups((current_2) => ({
								...current_2,
								[group_1.id]: !expanded_0
							}));
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
									depth: 0,
									expanded: expanded_0,
									onToggle: toggle_0,
									icon: kitIcon(FolderIcon, "text-ed-muted-foreground"),
									label: group_1.label,
									trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
										size: "3xs",
										variant: "tertiary",
										children: tags.length
									}),
									onClick: toggle_0
								}), expanded_0 && (groupMatches ? tags : visibleTags).map((tag_4) => renderHtmlTag(tag_4, 1))]
							}, group_1.id);
						})
					]
				});
				$[185] = addOrDrag;
				$[186] = addWebviewAt;
				$[187] = expandedHtmlGroups;
				$[188] = htmlHasResults;
				$[189] = htmlOpen;
				$[190] = isElectron;
				$[191] = readOnly;
				$[192] = renderHtmlTag;
				$[193] = searchQuery;
				$[194] = searchTerm;
				$[195] = searching;
				$[196] = webviewUrl;
				$[197] = T0;
				$[198] = livePreviewUrlField;
				$[199] = t42;
				$[200] = t43;
				$[201] = t44;
				$[202] = t46;
				$[203] = t47;
				$[204] = t50;
				$[205] = t51;
				$[206] = t52;
			} else {
				T0 = $[197];
				livePreviewUrlField = $[198];
				t42 = $[199];
				t43 = $[200];
				t44 = $[201];
				t46 = $[202];
				t47 = $[203];
				t50 = $[204];
				t51 = $[205];
				t52 = $[206];
			}
			if ($[228] !== t50 || $[229] !== t51 || $[230] !== t52) {
				t45 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: t50,
					children: [t51, t52]
				});
				$[228] = t50;
				$[229] = t51;
				$[230] = t52;
				$[231] = t45;
			} else t45 = $[231];
			t39 = "flex flex-col border-t border-ed-border";
			let t53;
			if ($[232] === Symbol.for("react.memo_cache_sentinel")) {
				t53 = () => toggleSection("components");
				$[232] = t53;
			} else t53 = $[232];
			let t54;
			if ($[233] !== componentTree || $[234] !== onAddShadcnComponents || $[235] !== onCreateComponentFile || $[236] !== onImportDesignSystem || $[237] !== readOnly) {
				t54 = !readOnly && (onCreateComponentFile || onAddShadcnComponents || onImportDesignSystem) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Add component",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					sideOffset: 4,
					children: [
						onCreateComponentFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: onCreateComponentFile,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlusIcon, {
								width: 16,
								height: 16,
								className: "text-ed-muted-foreground"
							}), "New component"]
						}),
						onAddShadcnComponents && componentTree.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: onAddShadcnComponents,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageIcon, {
								width: 16,
								height: 16,
								className: "text-ed-muted-foreground"
							}), "Add shadcn"]
						}),
						onImportDesignSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: onImportDesignSystem,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaletteIcon, {
								width: 16,
								height: 16,
								className: "text-ed-muted-foreground"
							}), "Import design system"]
						})
					]
				})] }) : void 0;
				$[233] = componentTree;
				$[234] = onAddShadcnComponents;
				$[235] = onCreateComponentFile;
				$[236] = onImportDesignSystem;
				$[237] = readOnly;
				$[238] = t54;
			} else t54 = $[238];
			if ($[239] !== componentsOpen || $[240] !== t54) {
				t40 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
					title: "Components",
					expanded: componentsOpen,
					onToggle: t53,
					actions: t54
				});
				$[239] = componentsOpen;
				$[240] = t54;
				$[241] = t40;
			} else t40 = $[241];
			t41 = componentsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-w-full w-max flex flex-col px-3 pt-1 pb-2",
				children: filteredComponentTree.length > 0 ? filteredComponentTree.map((node_0) => renderComponentNode(node_0)) : searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					className: "px-1.5 py-1",
					children: "No results"
				}) : (onAddShadcnComponents || onImportDesignSystem) && !readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [onAddShadcnComponents && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
					depth: 0,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageIcon, {
						width: ASSET_ICON_PX,
						height: ASSET_ICON_PX,
						className: "text-ed-muted-foreground"
					}),
					label: "Add shadcn",
					onClick: onAddShadcnComponents
				}), onImportDesignSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
					depth: 0,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaletteIcon, {
						width: ASSET_ICON_PX,
						height: ASSET_ICON_PX,
						className: "text-ed-muted-foreground"
					}),
					label: "Import design system",
					onClick: onImportDesignSystem
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					className: "px-1.5 py-1",
					children: "No components in this file"
				})
			});
		}
		$[79] = addOrDrag;
		$[80] = addWebviewAt;
		$[81] = componentTree;
		$[82] = components;
		$[83] = componentsOpen;
		$[84] = compositionJsxByExport;
		$[85] = compositionLoading;
		$[86] = compositionParseContext;
		$[87] = compositionRootsByExport;
		$[88] = compositionTemplates;
		$[89] = createComponentElement;
		$[90] = expandedComponentPaths;
		$[91] = expandedHtmlGroups;
		$[92] = filteredComponentTree;
		$[93] = htmlHasResults;
		$[94] = htmlOpen;
		$[95] = iconLibraries;
		$[96] = isElectron;
		$[97] = onAddElement;
		$[98] = onAddShadcnComponents;
		$[99] = onAskAIForIconLibrary;
		$[100] = onCreateComponentFile;
		$[101] = onEditComponent;
		$[102] = onImportDesignSystem;
		$[103] = onPasteCompositionJsx;
		$[104] = readOnly;
		$[105] = renderHtmlTag;
		$[106] = searchQuery;
		$[107] = searchTerm;
		$[108] = searching;
		$[109] = selectedComponentFile;
		$[110] = selectedIconLibrary;
		$[111] = webviewUrl;
		$[112] = T0;
		$[113] = livePreviewUrlField;
		$[114] = t39;
		$[115] = t40;
		$[116] = t41;
		$[117] = t42;
		$[118] = t43;
		$[119] = t44;
		$[120] = t45;
		$[121] = t46;
		$[122] = t47;
		$[123] = t48;
	} else {
		T0 = $[112];
		livePreviewUrlField = $[113];
		t39 = $[114];
		t40 = $[115];
		t41 = $[116];
		t42 = $[117];
		t43 = $[118];
		t44 = $[119];
		t45 = $[120];
		t46 = $[121];
		t47 = $[122];
		t48 = $[123];
	}
	if (t48 !== Symbol.for("react.early_return_sentinel")) return t48;
	let t49;
	if ($[242] !== t39 || $[243] !== t40 || $[244] !== t41) {
		t49 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: t39,
			children: [t40, t41]
		});
		$[242] = t39;
		$[243] = t40;
		$[244] = t41;
		$[245] = t49;
	} else t49 = $[245];
	let t50;
	if ($[246] === Symbol.for("react.memo_cache_sentinel")) {
		t50 = () => toggleSection("icons");
		$[246] = t50;
	} else t50 = $[246];
	let t51;
	if ($[247] !== onOpenIconSettings || $[248] !== readOnly) {
		t51 = !readOnly && onOpenIconSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetAddButton, {
			label: "Add icons",
			onClick: onOpenIconSettings
		}) : void 0;
		$[247] = onOpenIconSettings;
		$[248] = readOnly;
		$[249] = t51;
	} else t51 = $[249];
	let t52;
	if ($[250] !== iconsOpen || $[251] !== t51) {
		t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
			title: "Icons",
			expanded: iconsOpen,
			onToggle: t50,
			actions: t51
		});
		$[250] = iconsOpen;
		$[251] = t51;
		$[252] = t52;
	} else t52 = $[252];
	let t53;
	if ($[253] !== addOrDrag || $[254] !== createIconElement || $[255] !== expandedIconLibraries || $[256] !== iconLibraries || $[257] !== iconLibraryResults || $[258] !== iconsOpen || $[259] !== onAskAIForIconLibrary || $[260] !== onOpenIconSettings || $[261] !== readOnly || $[262] !== searching) {
		t53 = iconsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-w-full w-max flex flex-col px-3 pt-1 pb-2",
			children: [
				iconLibraryResults.map((t54) => {
					const { library: library_1, config: config_1, names: names_1, matches: matches_0 } = t54;
					const libraryOpen = searching ? expandedIconLibraries[library_1] ?? true : false;
					const preview = searching && libraryOpen ? matches_0.slice(0, ICON_SEARCH_PREVIEW) : [];
					const remaining = searching && libraryOpen ? Math.max(0, matches_0.length - preview.length) : 0;
					const count = searching ? matches_0.length : names_1.length;
					const toggleLibrary = () => setExpandedIconLibraries((current_3) => ({
						...current_3,
						[library_1]: !(current_3[library_1] ?? true)
					}));
					const openLibrary = () => setSelectedIconLibrary(library_1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
								depth: 0,
								expanded: searching ? libraryOpen : void 0,
								onToggle: searching ? toggleLibrary : void 0,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {
									width: ASSET_ICON_PX,
									height: ASSET_ICON_PX,
									className: "text-ed-canvas-component"
								}),
								label: config_1.displayName || library_1,
								trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "3xs",
									variant: "tertiary",
									children: count.toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, { className: "size-2 text-ed-muted-foreground" })] }),
								onTrailingClick: searching ? openLibrary : void 0,
								onClick: searching ? toggleLibrary : openLibrary
							}),
							preview.map((iconName_0) => {
								const Icon = config_1.icons?.[iconName_0];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
									depth: 1,
									icon: Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										width: ASSET_ICON_PX,
										height: ASSET_ICON_PX,
										className: "text-ed-canvas-component"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {
										width: ASSET_ICON_PX,
										height: ASSET_ICON_PX,
										className: "text-ed-canvas-component"
									}),
									label: iconName_0,
									draggable: !readOnly,
									onDragStart: (event_9) => addOrDrag(() => createIconElement(library_1, iconName_0), event_9),
									onClick: () => addOrDrag(() => createIconElement(library_1, iconName_0))
								}, `${library_1}-${iconName_0}`);
							}),
							remaining > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
								depth: 1,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {
									width: ASSET_ICON_PX,
									height: ASSET_ICON_PX,
									className: "text-ed-canvas-component"
								}),
								label: `${remaining.toLocaleString()} more`,
								trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, { className: "size-2 text-ed-muted-foreground" }),
								onClick: () => setSelectedIconLibrary(library_1)
							})
						]
					}, library_1);
				}),
				searching && iconLibraryResults.length === 0 && Object.keys(iconLibraries).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					className: "px-1.5 py-1",
					children: "No results"
				}),
				!searching && Object.keys(iconLibraries).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
					depth: 0,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {
						width: ASSET_ICON_PX,
						height: ASSET_ICON_PX,
						className: "text-ed-muted-foreground"
					}),
					label: "Set up an icon library",
					onClick: () => (onOpenIconSettings ?? onAskAIForIconLibrary)?.()
				})
			]
		});
		$[253] = addOrDrag;
		$[254] = createIconElement;
		$[255] = expandedIconLibraries;
		$[256] = iconLibraries;
		$[257] = iconLibraryResults;
		$[258] = iconsOpen;
		$[259] = onAskAIForIconLibrary;
		$[260] = onOpenIconSettings;
		$[261] = readOnly;
		$[262] = searching;
		$[263] = t53;
	} else t53 = $[263];
	let t54;
	if ($[264] !== t52 || $[265] !== t53) {
		t54 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col border-t border-ed-border",
			children: [t52, t53]
		});
		$[264] = t52;
		$[265] = t53;
		$[266] = t54;
	} else t54 = $[266];
	let t55;
	if ($[267] !== addWebviewAt || $[268] !== expandedWebviewGroups || $[269] !== isElectron || $[270] !== livePreviewUrlField || $[271] !== readOnly || $[272] !== searchTerm || $[273] !== searching || $[274] !== webviewHasResults || $[275] !== webviewOpen) {
		t55 = (!searching || webviewHasResults) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col border-t border-ed-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
				title: "Live Preview",
				expanded: webviewOpen,
				onToggle: () => toggleSection("webview")
			}), webviewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn$2("flex flex-col px-3 pt-1 pb-2", !isElectron && "opacity-50"),
				children: [isElectron ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1",
					children: livePreviewUrlField
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1",
						children: livePreviewUrlField
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					side: "right",
					children: "Only available in the desktop app"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative min-w-full w-max flex flex-col",
					children: WEBVIEW_SIZE_GROUPS.map((group_2) => {
						const visibleSizes = searchTerm ? group_2.sizes.filter((size_0) => webviewSizeSearchText(size_0).toLowerCase().includes(searchTerm)) : group_2.sizes;
						const groupMatches_0 = group_2.label.toLowerCase().includes(searchTerm);
						if (searchTerm && !groupMatches_0 && visibleSizes.length === 0) return null;
						const expanded_1 = searchTerm ? true : expandedWebviewGroups[group_2.id] ?? true;
						const toggle_1 = () => setExpandedWebviewGroups((current_4) => ({
							...current_4,
							[group_2.id]: !expanded_1
						}));
						const sizes = groupMatches_0 && searchTerm ? group_2.sizes : visibleSizes;
						const GroupIcon = group_2.Icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
								depth: 0,
								expanded: expanded_1,
								onToggle: toggle_1,
								icon: kitIcon(FolderIcon, "text-ed-muted-foreground"),
								label: group_2.label,
								trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "3xs",
									variant: "tertiary",
									children: group_2.sizes.length
								}),
								onClick: toggle_1
							}), expanded_1 && sizes.map((size_1) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeRow, {
								depth: 1,
								icon: kitIcon(GroupIcon, "text-ed-muted-foreground"),
								label: size_1.name,
								trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
									size: "3xs",
									variant: "tertiary",
									className: "font-mono",
									children: [
										size_1.width,
										" × ",
										size_1.height
									]
								}),
								draggable: isElectron && !readOnly,
								onDragStart: isElectron ? (event_10) => addWebviewAt(size_1.width, size_1.height, event_10) : void 0,
								onClick: isElectron ? () => addWebviewAt(size_1.width, size_1.height) : void 0
							}, size_1.name))]
						}, group_2.id);
					})
				})]
			})]
		});
		$[267] = addWebviewAt;
		$[268] = expandedWebviewGroups;
		$[269] = isElectron;
		$[270] = livePreviewUrlField;
		$[271] = readOnly;
		$[272] = searchTerm;
		$[273] = searching;
		$[274] = webviewHasResults;
		$[275] = webviewOpen;
		$[276] = t55;
	} else t55 = $[276];
	let t56;
	if ($[277] !== T0 || $[278] !== t42 || $[279] !== t43 || $[280] !== t44 || $[281] !== t45 || $[282] !== t49 || $[283] !== t54 || $[284] !== t55) {
		t56 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			horizontal: t42,
			className: t43,
			viewportClassName: t44,
			children: [
				t45,
				t49,
				t54,
				t55
			]
		});
		$[277] = T0;
		$[278] = t42;
		$[279] = t43;
		$[280] = t44;
		$[281] = t45;
		$[282] = t49;
		$[283] = t54;
		$[284] = t55;
		$[285] = t56;
	} else t56 = $[285];
	let t57;
	if ($[286] !== t46 || $[287] !== t47 || $[288] !== t56) {
		t57 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t46,
			children: [t47, t56]
		});
		$[286] = t46;
		$[287] = t47;
		$[288] = t56;
		$[289] = t57;
	} else t57 = $[289];
	return t57;
});
function _temp$53(current) {
	return {
		...current,
		html: true
	};
}
function _temp2$33(tag_1) {
	return tag_1.tag === "div";
}

export { AssetsSidebarTabV2 };
