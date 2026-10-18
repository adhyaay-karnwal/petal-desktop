// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/AssetsPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { componentDisplayName } from "../../../../../compiler/src/runtime/ComponentCompiler.js";
import { buildCompositionTemplates, getCompositionPathForBase, isCompositionFile } from "../../../../../compiler/src/runtime/compositionFiles.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { CaretLeftIcon, CaretRightIcon, FolderIcon, InfoIcon$1, SparkleIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { o$6, r$4, r$8 } from "../../../../../../vendor/@phosphor-icons/react.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { generatePrefixedId } from "../../../shared/utils/idUtils.js";
import { parseCompositionFile } from "../../../../../compiler/src/codegen/extractCompositionElement.js";
import { setCompositionDragData, setElementDragData } from "../../../shared/utils/clipboard.js";
import { PanelSearchInput } from "./PanelSearchInput.js";
import { CompositionPreview, collectCompositionPreviewNames, getCompositionParseContext, getCompositionParseSignature, parseCompositionImports, parseCompositionRootsByExport, useCompositionRootsByExport } from "./compositionDrag.js";
import { PanelEmptyState } from "./PanelEmptyState.js";

var ASSETS_TREE_ICON_SIZE_PX = 14;
var ASSETS_TREE_GAP_PX = 6;
var DETAIL_EDGE_PADDING_PX = 16;
var DETAIL_CONTENT_INDENT_PX = 40;
var COMPOSITION_FRAME_PADDING$1 = 4;
var COMPOSITION_GENERATION_TIMEOUT_MS = 12e4;
var COMPOSITION_READ_RETRY_MS = 500;
var COMPOSITION_READ_MAX_ATTEMPTS = 40;
var FIRST_EXPORT = "first";
var EMPTY_COMPONENT_INDEX$1 = {};
var EMPTY_COMPONENTS$1 = {};
var EMPTY_ICON_LIBRARIES$1 = {};
var assetsLabelClass = "text-[13px] leading-5 tracking-[-0.01em] font-medium text-ed-foreground";
var assetsMutedLabelClass = "text-[13px] leading-5 tracking-[-0.01em] font-medium text-ed-muted-foreground";
/**
* Invent a conservative preview/drop value for one prop from scanner metadata.
* Returns undefined when we cannot invent a meaningful serializable value.
*/
function inventPropValue(propName, propInfo) {
	const propType = String(propInfo?.type || propInfo || "");
	if (propInfo?.example !== void 0) return propInfo.example;
	if (propInfo?.default !== void 0) return propInfo.default;
	if (/\[\](?:\s*\|\s*undefined)?$/.test(propType) || /^(?:Readonly)?Array\s*</.test(propType) || /^readonly\s+[^|]+\[\]/.test(propType)) return [];
	if (/^(?:Record|Partial|Required|Pick|Omit)\s*</.test(propType) || /^\s*\{/.test(propType)) return {};
	if (propType.includes("=>") || propType.includes("() =>") || propType.includes("ComponentType") || propType.includes("Element") || propType.includes("CSSProperties") || propType.includes("ReactNode") || propType.includes("ReactElement")) return;
	if (propType.includes("|") && (propType.includes("\"") || propType.includes("'"))) return propType.split("|").map((value) => value.trim().replace(/['"]/g, "")).find((value) => value !== "undefined" && value !== "null" && value.length > 0);
	if (propType.includes("string")) return propName;
	if (propType.includes("number")) return 0;
	if (propType.includes("boolean")) return false;
}
/**
* Create conservative values for required props when a raw component is added
* from Assets. Complex values cannot be meaningfully invented without a
* composition, but arrays/objects should still be initialized so the component
* does not immediately crash while the user edits them in the Props panel.
*/
function buildRequiredComponentProps(props) {
	const defaultProps = {};
	let hasChildrenProp = false;
	for (const [propName, propInfo] of Object.entries(props ?? {})) {
		if (propName === "children") {
			hasChildrenProp = true;
			continue;
		}
		if (!propInfo?.required) continue;
		const value = inventPropValue(propName, propInfo);
		if (value !== void 0) defaultProps[propName] = value;
	}
	return {
		props: defaultProps,
		hasChildrenProp
	};
}
/**
* Fill inventable props for a standalone preview (e.g. version history).
* Unlike Assets drop, also fills optional primitives/unions so the component
* is visible — empty optional title/label props are a common blank-preview cause.
*/
function buildPreviewComponentProps(props) {
	const defaultProps = {};
	let hasChildrenProp = false;
	for (const [propName, propInfo] of Object.entries(props ?? {})) {
		if (propName === "children") {
			hasChildrenProp = true;
			continue;
		}
		const value = inventPropValue(propName, propInfo);
		if (value !== void 0) defaultProps[propName] = value;
	}
	if (hasChildrenProp && defaultProps.children === void 0) defaultProps.children = "Preview";
	return {
		props: defaultProps,
		hasChildrenProp
	};
}
function isComplexRequiredProp(propName, propInfo) {
	if (!propInfo?.required) return false;
	if (propName === "children") return true;
	const propType = String(propInfo?.type || propInfo);
	return /\[\]|(?:Readonly)?Array\s*</.test(propType) || /^(?:Record|Partial|Required|Pick|Omit)\s*</.test(propType) || /^\s*\{/.test(propType) || propType.includes("ReactNode") || propType.includes("ReactElement") || propType.includes("ComponentType") || propType.includes("=>");
}
/**
* A deliberately conservative hint, not a placement rule. Files with a
* component family or required structured content are difficult to use as a
* single raw node and benefit from a ready-made composition.
*/
function shouldSuggestComposition(componentNames, componentIndex) {
	if (componentNames.length >= 3) return true;
	return componentNames.some((componentName) => Object.entries(componentIndex[componentName]?.props ?? {}).some(([propName, propInfo]) => isComplexRequiredProp(propName, propInfo)));
}
/** Return the first insertable static JSX export from a composition sidecar. */
function getFirstCompositionJsx(content) {
	const { exportNames, jsxByExport } = parseCompositionFile(content);
	const templates = buildCompositionTemplates(exportNames);
	for (const template of templates) {
		const jsx = jsxByExport.get(template.exportName);
		if (jsx) return jsx;
	}
	return null;
}
function buildComponentFileEntries(componentIndex) {
	const files = /* @__PURE__ */ new Map();
	for (const [componentName, info] of Object.entries(componentIndex)) {
		if (isCompositionFile(info.path)) continue;
		let entry = files.get(info.path);
		if (!entry) {
			const fileName = info.path.split("/").pop() ?? info.path;
			entry = {
				path: info.path,
				fileName,
				components: []
			};
			files.set(info.path, entry);
		}
		entry.components.push(componentName);
	}
	for (const entry of files.values()) entry.components.sort((a, b) => a.localeCompare(b));
	return Array.from(files.values()).sort((a, b) => a.path.localeCompare(b.path));
}
function fileMatchesSearch(entry, query) {
	if (entry.path.toLowerCase().includes(query)) return true;
	if (entry.fileName.toLowerCase().includes(query)) return true;
	return entry.components.some((name) => name.toLowerCase().includes(query));
}
function buildAssetsTree(entries) {
	const root = {
		name: "components",
		type: "folder",
		path: "components",
		children: []
	};
	for (const entry of entries) {
		const parts = entry.path.split("/");
		const startIdx = parts[0] === "components" ? 1 : 0;
		let current = root;
		for (let i = startIdx; i < parts.length - 1; i++) {
			const folderName = parts[i];
			const folderPath = parts.slice(0, i + 1).join("/");
			let folder = current.children?.find((child) => child.type === "folder" && child.name === folderName);
			if (!folder) {
				folder = {
					name: folderName,
					type: "folder",
					path: folderPath,
					children: []
				};
				current.children = current.children ?? [];
				current.children.push(folder);
			}
			current = folder;
		}
		current.children = current.children ?? [];
		current.children.push({
			name: parts[parts.length - 1],
			type: "file",
			path: entry.path
		});
	}
	return root;
}
function treeNodeMatchesSearch(node, query, fileEntries) {
	if (node.type === "file") {
		const entry = fileEntries.find((e) => e.path === node.path);
		return entry ? fileMatchesSearch(entry, query) : node.name.toLowerCase().includes(query);
	}
	return !!node.children?.some((child) => treeNodeMatchesSearch(child, query, fileEntries));
}
/** 16px base + 12px per depth → 16 / 28 / 40 … */
function assetsIndentStyle(depth) {
	return { paddingLeft: 16 + depth * 12 };
}
/** Composition file preview aligns with the folder icon in the parent row. */
function assetsCompositionFileIndentStyle(depth) {
	return { paddingLeft: 16 + (depth - 1) * 12 + ASSETS_TREE_ICON_SIZE_PX + ASSETS_TREE_GAP_PX };
}
function detailContentIndentStyle() {
	return { paddingLeft: DETAIL_CONTENT_INDENT_PX };
}
function compositionItemStyle() {
	return {
		paddingLeft: DETAIL_CONTENT_INDENT_PX,
		paddingRight: DETAIL_EDGE_PADDING_PX
	};
}
var AssetsPanel = (t0) => {
	const $ = (0, import_compiler_runtime.c)(96);
	const { onAddElement, onPasteCompositionJsx, readCompositionFile, compositionSourceId: t1, onEditComponent, componentIndex: t2, components: t3, iconLibraries: t4, allIconLibraries, readOnly: t5, onAskAI, onAskAIForComposition, compositionRefreshKey: t6, onEnsureComponentNames } = t0;
	const compositionSourceId = t1 === void 0 ? "" : t1;
	const componentIndex = t2 === void 0 ? EMPTY_COMPONENT_INDEX$1 : t2;
	const components = t3 === void 0 ? EMPTY_COMPONENTS$1 : t3;
	const iconLibraries = t4 === void 0 ? EMPTY_ICON_LIBRARIES$1 : t4;
	const readOnly = t5 === void 0 ? false : t5;
	const compositionRefreshKey = t6 === void 0 ? 0 : t6;
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [selectedFilePath, setSelectedFilePath] = (0, import_react.useState)(null);
	let t7;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = { components: true };
		$[0] = t7;
	} else t7 = $[0];
	const [expandedPaths, setExpandedPaths] = (0, import_react.useState)(t7);
	const [pendingCompositionInsert, setPendingCompositionInsert] = (0, import_react.useState)(null);
	const pendingCompositionInsertRef = (0, import_react.useRef)(null);
	const compositionReadRef = (0, import_react.useRef)(null);
	const pendingCompositionTimeoutRef = (0, import_react.useRef)(null);
	const componentClickTimerRef = (0, import_react.useRef)(null);
	let t8;
	if ($[1] !== readCompositionFile || $[2] !== selectedFilePath) {
		t8 = selectedFilePath && readCompositionFile ? getCompositionPathForBase(selectedFilePath) : null;
		$[1] = readCompositionFile;
		$[2] = selectedFilePath;
		$[3] = t8;
	} else t8 = $[3];
	const compositionPath = t8;
	let t9;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = {
			path: null,
			sourceId: "",
			content: null,
			refreshKey: 0
		};
		$[4] = t9;
	} else t9 = $[4];
	const [loadedComposition, setLoadedComposition] = (0, import_react.useState)(t9);
	const compositionIsCurrent = loadedComposition.path === compositionPath && loadedComposition.sourceId === compositionSourceId && loadedComposition.refreshKey === compositionRefreshKey;
	const compositionContent = compositionIsCurrent ? loadedComposition.content : null;
	const compositionLoading = compositionPath !== null && !compositionIsCurrent;
	let t10;
	if ($[5] !== componentIndex) {
		t10 = buildComponentFileEntries(componentIndex);
		$[5] = componentIndex;
		$[6] = t10;
	} else t10 = $[6];
	const fileEntries = t10;
	let t11;
	if ($[7] !== fileEntries) {
		t11 = buildAssetsTree(fileEntries);
		$[7] = fileEntries;
		$[8] = t11;
	} else t11 = $[8];
	const assetsTree = t11;
	let t12;
	if ($[9] !== componentIndex) {
		t12 = Object.keys(componentIndex);
		$[9] = componentIndex;
		$[10] = t12;
	} else t12 = $[10];
	const componentCount = t12.length;
	const searchLower = searchQuery.trim().toLowerCase();
	let t13;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = (path) => {
			setExpandedPaths((prev) => ({
				...prev,
				[path]: !(prev[path] ?? true)
			}));
		};
		$[11] = t13;
	} else t13 = $[11];
	const togglePath = t13;
	let t14;
	if ($[12] !== fileEntries || $[13] !== selectedFilePath) {
		t14 = selectedFilePath ? fileEntries.find((entry) => entry.path === selectedFilePath) ?? null : null;
		$[12] = fileEntries;
		$[13] = selectedFilePath;
		$[14] = t14;
	} else t14 = $[14];
	const selectedFile = t14;
	const filteredFiles = searchLower ? fileEntries.filter((entry_0) => fileMatchesSearch(entry_0, searchLower)) : fileEntries;
	let t15;
	bb0: {
		if (!compositionContent) {
			let t16;
			if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
				t16 = [];
				$[15] = t16;
			} else t16 = $[15];
			let t17;
			if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
				t17 = {
					compositionTemplates: t16,
					compositionJsxByExport: void 0
				};
				$[16] = t17;
			} else t17 = $[16];
			t15 = t17;
			break bb0;
		}
		let jsxByExport;
		let t16;
		if ($[17] !== compositionContent) {
			const { exportNames, jsxByExport: t17 } = parseCompositionFile(compositionContent);
			jsxByExport = t17;
			t16 = buildCompositionTemplates(exportNames);
			$[17] = compositionContent;
			$[18] = jsxByExport;
			$[19] = t16;
		} else {
			jsxByExport = $[18];
			t16 = $[19];
		}
		let t17;
		if ($[20] !== jsxByExport || $[21] !== t16) {
			t17 = {
				compositionTemplates: t16,
				compositionJsxByExport: jsxByExport
			};
			$[20] = jsxByExport;
			$[21] = t16;
			$[22] = t17;
		} else t17 = $[22];
		t15 = t17;
	}
	const { compositionTemplates, compositionJsxByExport } = t15;
	let t16;
	if ($[23] !== compositionContent) {
		t16 = parseCompositionImports(compositionContent);
		$[23] = compositionContent;
		$[24] = t16;
	} else t16 = $[24];
	const compositionImports = t16;
	let t17;
	if ($[25] !== allIconLibraries || $[26] !== componentIndex || $[27] !== compositionImports || $[28] !== iconLibraries) {
		t17 = getCompositionParseContext(compositionImports, iconLibraries, componentIndex, allIconLibraries);
		$[25] = allIconLibraries;
		$[26] = componentIndex;
		$[27] = compositionImports;
		$[28] = iconLibraries;
		$[29] = t17;
	} else t17 = $[29];
	const compositionParseContext = t17;
	let t18;
	if ($[30] !== compositionJsxByExport || $[31] !== compositionParseContext) {
		t18 = getCompositionParseSignature(compositionJsxByExport?.values() ?? [], compositionParseContext);
		$[30] = compositionJsxByExport;
		$[31] = compositionParseContext;
		$[32] = t18;
	} else t18 = $[32];
	const compositionRootsByExport = useCompositionRootsByExport(compositionJsxByExport, compositionParseContext, t18);
	let t19;
	let t20;
	if ($[33] !== compositionJsxByExport || $[34] !== onEnsureComponentNames || $[35] !== selectedFile) {
		t19 = () => {
			if (!selectedFile || !onEnsureComponentNames) return;
			onEnsureComponentNames(collectCompositionPreviewNames(selectedFile.components, compositionJsxByExport?.values() ?? []));
		};
		t20 = [
			selectedFile,
			compositionJsxByExport,
			onEnsureComponentNames
		];
		$[33] = compositionJsxByExport;
		$[34] = onEnsureComponentNames;
		$[35] = selectedFile;
		$[36] = t19;
		$[37] = t20;
	} else {
		t19 = $[36];
		t20 = $[37];
	}
	(0, import_react.useEffect)(t19, t20);
	let t21;
	if ($[38] !== readCompositionFile) {
		t21 = async (path_0, sourceId, refreshKey) => {
			if (!readCompositionFile) return;
			const key = `${sourceId}:${path_0}:${refreshKey}`;
			if (compositionReadRef.current?.key !== key) compositionReadRef.current = {
				key,
				promise: readCompositionFile(path_0)
			};
			return {
				path: path_0,
				sourceId,
				content: await compositionReadRef.current.promise,
				refreshKey
			};
		};
		$[38] = readCompositionFile;
		$[39] = t21;
	} else t21 = $[39];
	const loadComposition = (0, import_react.useEffectEvent)(t21);
	let t22;
	if ($[40] !== compositionPath || $[41] !== compositionRefreshKey || $[42] !== compositionSourceId || $[43] !== loadComposition) {
		t22 = () => {
			if (!compositionPath) return;
			const path_1 = compositionPath;
			const sourceId_0 = compositionSourceId;
			const refreshKey_0 = compositionRefreshKey;
			let cancelled = false;
			loadComposition(path_1, sourceId_0, refreshKey_0).then((loaded) => {
				if (cancelled || !loaded) return;
				setLoadedComposition(loaded);
			}).catch(() => {
				if (cancelled) return;
				setLoadedComposition({
					path: path_1,
					sourceId: sourceId_0,
					content: null,
					refreshKey: refreshKey_0
				});
			});
			return () => {
				cancelled = true;
			};
		};
		$[40] = compositionPath;
		$[41] = compositionRefreshKey;
		$[42] = compositionSourceId;
		$[43] = loadComposition;
		$[44] = t22;
	} else t22 = $[44];
	let t23;
	if ($[45] !== compositionPath || $[46] !== compositionRefreshKey || $[47] !== compositionSourceId) {
		t23 = [
			compositionPath,
			compositionSourceId,
			compositionRefreshKey
		];
		$[45] = compositionPath;
		$[46] = compositionRefreshKey;
		$[47] = compositionSourceId;
		$[48] = t23;
	} else t23 = $[48];
	(0, import_react.useEffect)(t22, t23);
	let t24;
	if ($[49] !== allIconLibraries || $[50] !== componentIndex || $[51] !== iconLibraries || $[52] !== onPasteCompositionJsx || $[53] !== readCompositionFile) {
		t24 = async (pending, cancelled_0) => {
			if (!readCompositionFile || !onPasteCompositionJsx) return false;
			const content_0 = await readCompositionFile(pending.compositionFilePath);
			if (cancelled_0() || pendingCompositionInsertRef.current !== pending) return false;
			const jsx = getFirstCompositionJsx(content_0);
			if (!jsx) return false;
			pendingCompositionInsertRef.current = null;
			setPendingCompositionInsert(null);
			if (pendingCompositionTimeoutRef.current) {
				clearTimeout(pendingCompositionTimeoutRef.current);
				pendingCompositionTimeoutRef.current = null;
			}
			const roots = parseCompositionRootsByExport(/* @__PURE__ */ new Map([[FIRST_EXPORT, jsx]]), getCompositionParseContext(parseCompositionImports(content_0), iconLibraries, componentIndex, allIconLibraries)).get(FIRST_EXPORT);
			onPasteCompositionJsx(jsx, roots);
			return true;
		};
		$[49] = allIconLibraries;
		$[50] = componentIndex;
		$[51] = iconLibraries;
		$[52] = onPasteCompositionJsx;
		$[53] = readCompositionFile;
		$[54] = t24;
	} else t24 = $[54];
	const insertPendingComposition = (0, import_react.useEffectEvent)(t24);
	let t25;
	if ($[55] !== compositionRefreshKey || $[56] !== insertPendingComposition) {
		t25 = () => {
			const pending_0 = pendingCompositionInsertRef.current;
			if (!pending_0 || compositionRefreshKey === pending_0.refreshKeyAtRequest) return;
			let cancelled_1 = false;
			let retryTimer = null;
			let attempts = 0;
			const tryInsert = async () => {
				attempts = attempts + 1;
				try {
					if (await insertPendingComposition(pending_0, () => cancelled_1)) return;
				} catch {}
				if (!cancelled_1 && attempts < COMPOSITION_READ_MAX_ATTEMPTS) retryTimer = setTimeout(() => {
					tryInsert();
				}, COMPOSITION_READ_RETRY_MS);
			};
			tryInsert();
			return () => {
				cancelled_1 = true;
				if (retryTimer) clearTimeout(retryTimer);
			};
		};
		$[55] = compositionRefreshKey;
		$[56] = insertPendingComposition;
		$[57] = t25;
	} else t25 = $[57];
	let t26;
	if ($[58] !== compositionRefreshKey) {
		t26 = [compositionRefreshKey];
		$[58] = compositionRefreshKey;
		$[59] = t26;
	} else t26 = $[59];
	(0, import_react.useEffect)(t25, t26);
	let t27;
	let t28;
	if ($[60] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = () => () => {
			if (pendingCompositionTimeoutRef.current) clearTimeout(pendingCompositionTimeoutRef.current);
		};
		t28 = [];
		$[60] = t27;
		$[61] = t28;
	} else {
		t27 = $[60];
		t28 = $[61];
	}
	(0, import_react.useEffect)(t27, t28);
	const handleCreateComposition = (entry_1) => {
		if (!onAskAIForComposition || !readCompositionFile || !onPasteCompositionJsx || readOnly) return;
		const pending_1 = {
			componentFilePath: entry_1.path,
			compositionFilePath: getCompositionPathForBase(entry_1.path),
			refreshKeyAtRequest: compositionRefreshKey
		};
		if (pendingCompositionTimeoutRef.current) clearTimeout(pendingCompositionTimeoutRef.current);
		pendingCompositionInsertRef.current = pending_1;
		setPendingCompositionInsert(pending_1);
		pendingCompositionTimeoutRef.current = setTimeout(() => {
			if (pendingCompositionInsertRef.current !== pending_1) return;
			pendingCompositionInsertRef.current = null;
			pendingCompositionTimeoutRef.current = null;
			setPendingCompositionInsert(null);
		}, COMPOSITION_GENERATION_TIMEOUT_MS);
		onAskAIForComposition({
			componentFilePath: entry_1.path,
			compositionFilePath: pending_1.compositionFilePath,
			componentNames: entry_1.components
		});
	};
	let t29;
	if ($[62] !== componentIndex) {
		t29 = (componentName) => {
			const componentInfo = componentIndex[componentName];
			const { props: defaultProps, hasChildrenProp } = buildRequiredComponentProps(componentInfo?.props);
			const defaultChildren = hasChildrenProp ? [] : void 0;
			return {
				id: generatePrefixedId("component"),
				type: "component",
				componentName,
				props: defaultProps,
				styles: {},
				children: defaultChildren
			};
		};
		$[62] = componentIndex;
		$[63] = t29;
	} else t29 = $[63];
	const createComponentElement = t29;
	let t30;
	if ($[64] !== createComponentElement || $[65] !== readOnly) {
		t30 = (e, componentName_0) => {
			if (readOnly) return;
			setElementDragData(e, createComponentElement(componentName_0));
		};
		$[64] = createComponentElement;
		$[65] = readOnly;
		$[66] = t30;
	} else t30 = $[66];
	const handleComponentDragStart = t30;
	const handleComponentClick = (componentName_1, filePath, e_0) => {
		if (componentClickTimerRef.current) {
			clearTimeout(componentClickTimerRef.current);
			componentClickTimerRef.current = null;
		}
		if (e_0.detail === 1) {
			if (readOnly) return;
			componentClickTimerRef.current = setTimeout(() => {
				onAddElement(createComponentElement(componentName_1));
				componentClickTimerRef.current = null;
			}, 250);
		} else if (e_0.detail === 2) onEditComponent?.(componentName_1, filePath);
	};
	let t31;
	if ($[67] !== compositionJsxByExport || $[68] !== compositionRootsByExport) {
		t31 = (e_1, exportName) => {
			const jsx_0 = compositionJsxByExport?.get(exportName);
			if (!jsx_0) return;
			setCompositionDragData(e_1, jsx_0, compositionRootsByExport?.get(exportName));
		};
		$[67] = compositionJsxByExport;
		$[68] = compositionRootsByExport;
		$[69] = t31;
	} else t31 = $[69];
	const handleCompositionDragStart = t31;
	let t32;
	if ($[70] !== compositionJsxByExport || $[71] !== compositionRootsByExport || $[72] !== onPasteCompositionJsx) {
		t32 = (e_2, exportName_0) => {
			const jsx_1 = compositionJsxByExport?.get(exportName_0);
			if (!jsx_1) return;
			e_2.stopPropagation();
			onPasteCompositionJsx?.(jsx_1, compositionRootsByExport?.get(exportName_0));
		};
		$[70] = compositionJsxByExport;
		$[71] = compositionRootsByExport;
		$[72] = onPasteCompositionJsx;
		$[73] = t32;
	} else t32 = $[73];
	const handleCompositionClick = t32;
	let t33;
	if ($[74] !== components || $[75] !== compositionJsxByExport || $[76] !== compositionParseContext) {
		t33 = (exportName_1, t34) => {
			const className = t34 === void 0 ? "" : t34;
			const jsx_2 = compositionJsxByExport?.get(exportName_1) ?? null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `w-full shrink-0 rounded border border-ed-border overflow-hidden ${className}`,
				style: {
					height: 70,
					padding: COMPOSITION_FRAME_PADDING$1,
					backgroundColor: "var(--background, #fff)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompositionPreview, {
					jsx: jsx_2,
					components,
					parseContext: compositionParseContext,
					frameHeight: 62
				})
			});
		};
		$[74] = components;
		$[75] = compositionJsxByExport;
		$[76] = compositionParseContext;
		$[77] = t33;
	} else t33 = $[77];
	const renderCompositionPreviewFrame = t33;
	let t34;
	if ($[78] !== handleCompositionClick || $[79] !== handleCompositionDragStart || $[80] !== onPasteCompositionJsx || $[81] !== readOnly || $[82] !== renderCompositionPreviewFrame) {
		t34 = (template) => {
			const canInsert = !!onPasteCompositionJsx && !readOnly;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				draggable: canInsert,
				onDragStart: (e_3) => canInsert && handleCompositionDragStart(e_3, template.exportName),
				onClick: (e_4) => canInsert && handleCompositionClick(e_4, template.exportName),
				style: compositionItemStyle(),
				className: `w-full min-w-0 max-w-full text-left flex flex-col gap-2 ${canInsert ? "cursor-grab active:cursor-grabbing" : ""}`,
				children: [renderCompositionPreviewFrame(template.exportName, canInsert ? "hover:border-ed-ring" : ""), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `${assetsLabelClass} truncate`,
					children: template.name
				})]
			}, template.exportName);
		};
		$[78] = handleCompositionClick;
		$[79] = handleCompositionDragStart;
		$[80] = onPasteCompositionJsx;
		$[81] = readOnly;
		$[82] = renderCompositionPreviewFrame;
		$[83] = t34;
	} else t34 = $[83];
	const renderCompositionTemplate = t34;
	const renderFileDetail = (entry_2) => {
		const showCompositions = compositionLoading || compositionTemplates.length > 0 && !!compositionPath;
		const showCompositionDivider = !compositionLoading && compositionTemplates.length > 0 && !!compositionPath;
		const showCompositionSuggestion = !compositionLoading && compositionTemplates.length === 0 && shouldSuggestComposition(entry_2.components, componentIndex);
		const isCreatingComposition = pendingCompositionInsert?.componentFilePath === entry_2.path;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
			className: "flex-1 bg-ed-background",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setSelectedFilePath(null),
					className: "py-2 px-4 flex items-center gap-2 min-w-0 shrink-0 w-full text-left hover:bg-ed-accent",
					"aria-label": "Back to file list",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretLeftIcon, {
							width: 16,
							height: 16,
							className: "shrink-0 text-ed-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {
							width: 14,
							height: 14,
							className: "text-ed-muted-foreground shrink-0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `${assetsLabelClass} truncate`,
							children: entry_2.path
						})
					]
				}),
				showCompositionSuggestion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-4 mt-3 rounded-xl border border-ed-border bg-ed-background p-3 shadow-md/4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-ed-border bg-ed-background text-ed-muted-foreground shadow-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoIcon$1, {
								width: 13,
								height: 13
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: assetsLabelClass,
									children: "Composition recommended"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-ed-muted-foreground",
									children: "Some components require a valid arrangement. Ask AI to create one for you."
								}),
								!readOnly && onAskAIForComposition && readCompositionFile && onPasteCompositionJsx && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "xs",
									variant: "outline",
									LeftIcon: SparkleIcon,
									loading: isCreatingComposition,
									disabled: isCreatingComposition,
									className: "mt-3",
									onClick: () => handleCreateComposition(entry_2),
									children: isCreatingComposition ? "Creating composition..." : "Create with AI"
								}),
								isCreatingComposition && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-[11px] leading-4 text-ed-muted-foreground",
									children: "It will be added when the template is ready."
								})
							]
						})]
					})
				}),
				showCompositions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-5 pt-2 pb-4",
					children: compositionLoading && compositionTemplates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: assetsMutedLabelClass,
						style: detailContentIndentStyle(),
						children: "Loading templates..."
					}) : compositionTemplates.map((template_0) => renderCompositionTemplate(template_0))
				}),
				entry_2.components.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex flex-col gap-2 pt-4 pb-4 ${showCompositionDivider ? "border-t border-ed-border" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `${assetsMutedLabelClass} px-4`,
						children: "Components"
					}), entry_2.components.map((componentName_2) => {
						const displayName = componentDisplayName(componentName_2);
						const row = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							draggable: !readOnly,
							onDragStart: (e_5) => handleComponentDragStart(e_5, componentName_2),
							onClick: (e_6) => handleComponentClick(componentName_2, entry_2.path, e_6),
							className: `relative py-1.5 pr-4 flex items-center gap-1.5 hover:bg-ed-accent rounded-md ${!readOnly && "cursor-grab active:cursor-grabbing"}`,
							style: detailContentIndentStyle(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r$8, {
									size: 14,
									weight: "fill",
									className: "text-purple-500 shrink-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `${assetsLabelClass} flex-1 min-w-0 truncate`,
									children: displayName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-panel-drag-preview": true,
									"aria-hidden": true,
									className: "absolute left-0 top-0 flex items-center gap-1.5 opacity-0 pointer-events-none whitespace-nowrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r$8, {
										size: 14,
										weight: "fill",
										className: "text-purple-500 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: assetsLabelClass,
										children: displayName
									})]
								})
							]
						}, componentName_2);
						if (readOnly) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: row
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
							side: "right",
							children: "Double-click to open component"
						})] }, componentName_2);
						return row;
					})]
				})
			]
		});
	};
	const renderAssetsTree = (node, t35) => {
		const depth = t35 === void 0 ? 0 : t35;
		if (node.type === "folder" && !node.children?.length) return null;
		if (searchLower && !treeNodeMatchesSearch(node, searchLower, fileEntries)) return null;
		if (node.type === "folder") {
			const isExpanded = expandedPaths[node.path] ?? true;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => togglePath(node.path),
				className: "w-full py-1.5 pr-4 hover:bg-ed-accent flex items-center gap-1.5 text-left",
				style: assetsIndentStyle(depth),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, {
						width: 14,
						height: 14,
						className: `text-ed-muted-foreground shrink-0 ${isExpanded ? "rotate-90" : ""}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {
						width: 14,
						height: 14,
						className: "text-ed-muted-foreground shrink-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `${assetsLabelClass} truncate`,
						children: node.name
					})
				]
			}), isExpanded && node.children?.map((child) => renderAssetsTree(child, depth + 1))] }, node.path);
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setSelectedFilePath(node.path),
			className: "w-full px-4 py-1.5 hover:bg-ed-accent flex items-center gap-1.5 text-left",
			style: assetsCompositionFileIndentStyle(depth),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r$4, {
					size: 14,
					weight: "bold",
					className: "text-ed-muted-foreground shrink-0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `${assetsLabelClass} flex-1 min-w-0 truncate`,
					children: node.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, {
					width: 14,
					height: 14,
					className: "text-ed-muted-foreground shrink-0"
				})
			]
		}, node.path);
	};
	const renderFileList = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "flex-1 bg-ed-background",
		children: renderAssetsTree(assetsTree)
	});
	const t36 = "w-full flex flex-col flex-1 overflow-hidden pt-1";
	let t37;
	if ($[84] !== readOnly) {
		t37 = readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-2 bg-ed-muted/50 border-b border-ed-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "xs",
				variant: "secondary",
				children: "View only - double-click to open component"
			})
		});
		$[84] = readOnly;
		$[85] = t37;
	} else t37 = $[85];
	let t38;
	if ($[86] !== componentCount || $[87] !== searchQuery || $[88] !== selectedFile) {
		t38 = componentCount > 0 && !selectedFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 pb-2 border-b border-ed-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSearchInput, {
					className: "relative flex-1",
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: "Search components..."
				})
			})
		});
		$[86] = componentCount;
		$[87] = searchQuery;
		$[88] = selectedFile;
		$[89] = t38;
	} else t38 = $[89];
	const t39 = "flex-1 overflow-hidden flex flex-col";
	const t40 = componentCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelEmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(o$6, {
			size: 24,
			className: "text-ed-muted-foreground"
		}),
		title: "Start adding components",
		description: "Ask AI to create your first component",
		actions: !readOnly && onAskAI ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			size: "sm",
			onClick: onAskAI,
			className: "w-full",
			children: "Ask AI"
		}) : void 0
	}) : selectedFile ? renderFileDetail(selectedFile) : filteredFiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col items-center justify-center px-4 py-12 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "sm",
			variant: "secondary",
			children: "No components match your search"
		})
	}) : renderFileList();
	let t41;
	if ($[90] !== t40) {
		t41 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t39,
			children: t40
		});
		$[90] = t40;
		$[91] = t41;
	} else t41 = $[91];
	let t42;
	if ($[92] !== t37 || $[93] !== t38 || $[94] !== t41) {
		t42 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t36,
			children: [
				t37,
				t38,
				t41
			]
		});
		$[92] = t37;
		$[93] = t38;
		$[94] = t41;
		$[95] = t42;
	} else t42 = $[95];
	return t42;
};

export { AssetsPanel, buildPreviewComponentProps, buildRequiredComponentProps, inventPropValue };
