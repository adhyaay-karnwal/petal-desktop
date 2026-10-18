// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/BottomBar.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ArrowCounterClockwiseIcon, BookOpenIcon, BracketsCurlyIcon, CheckIcon, ClockIcon, CopyIcon, CursorIcon, FloppyDiskIcon, PlusIcon, SettingsIcon, TerminalIcon, XIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { c$13 } from "../../../../../vendor/@phosphor-icons/react.js";
import { Kbd } from "../../../../ui/src/components/Kbd.js";
import { Tabs, TabsList, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { toast } from "../../../../../vendor/sonner.js";
import { useIsDark } from "../../../../ui/src/hooks/useIsDark.js";
import { ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getById } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { isPlanLimitError } from "../../backends/planLimits.js";
import { useBackendOptional } from "../../backends/BackendContext.js";
import { GLOBAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { useEditorMode } from "../../shared/contexts/EditorModeContext.js";
import { useGlobalShortcut } from "../../shared/shortcuts/useGlobalShortcut.js";
import { generateCompleteFile } from "../../../../compiler/src/codegen/generateCompleteFile.js";
import { inlineLocalImports } from "../../../../compiler/src/codegen/inlineLocalImports.js";
import { useAssetResolver } from "../../shared/contexts/AssetContext.js";
import { EditorView$1 } from "../../../../../vendor/@codemirror/view.js";
import { css$1 } from "../../../../../vendor/@codemirror/lang-css.js";
import { githubDark, githubLight } from "../../../../../vendor/@uiw/codemirror-theme-github.js";
import { DARK_TERMINAL_THEME, LIGHT_TERMINAL_THEME, TerminalPanel } from "./panels/TerminalPanel.js";
import { ExternalChange, ReactCodeMirror } from "../../../../../vendor/@uiw/react-codemirror.js";
import { javascript } from "../../../../../vendor/@codemirror/lang-javascript.js";
import { CODE_EDITOR_CLASS, CODE_EDITOR_THEME, useCodeEditorFontStyles } from "../utils/codeEditorTheme.js";
import { markdown } from "../../../../../vendor/@codemirror/lang-markdown.js";
import { useSelectionJsxEditor } from "../hooks/useSelectionJsxEditor.js";
import { useInlinedComponents } from "../hooks/useInlinedComponents.js";
import { inlinedPrelude } from "../utils/inlinedPrelude.js";
import { EditorStatusBar } from "./EditorStatusBar.js";
import { EditorFileBreadcrumb, buildFileBreadcrumbItems } from "../utils/editorBreadcrumb.js";

var STORE_DEBUG_ENABLED = false;
var PROJECT_CSS_ENTRY_CANDIDATES = [
	"app/globals.css",
	"src/app/globals.css",
	"src/globals.css",
	"styles/globals.css",
	"src/index.css",
	"src/styles.css"
];
var DEFAULT_USER_CSS_PATH = "styles.css";
var EDITOR_BASIC_SETUP = {
	lineNumbers: true,
	highlightActiveLineGutter: false,
	highlightActiveLine: false,
	foldGutter: false
};
/** The single change that turns `from` into `to`: everything between their common prefix and suffix. */
function minimalChange(from, to) {
	const max = Math.min(from.length, to.length);
	let start = 0;
	while (start < max && from.charCodeAt(start) === to.charCodeAt(start)) start++;
	let endFrom = from.length;
	let endTo = to.length;
	while (endFrom > start && endTo > start && from.charCodeAt(endFrom - 1) === to.charCodeAt(endTo - 1)) {
		endFrom--;
		endTo--;
	}
	return {
		from: start,
		to: endFrom,
		insert: to.slice(start, endTo)
	};
}
function WithTooltip(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { label, children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== label) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			sideOffset: 4,
			children: label
		});
		$[2] = label;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t1, t2] });
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function dirname(path) {
	const idx = path.lastIndexOf("/");
	return idx === -1 ? "" : path.slice(0, idx);
}
function relativeCssImport(fromCssPath, toCssPath) {
	const fromParts = dirname(fromCssPath).split("/").filter(Boolean);
	const toParts = toCssPath.split("/").filter(Boolean);
	while (fromParts.length > 0 && toParts.length > 0 && fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}
	const rel = [...fromParts.map(() => ".."), ...toParts].join("/");
	return rel.startsWith(".") ? rel : `./${rel}`;
}
function addCssImport(css, importPath) {
	const importLine = `@import "${importPath}";`;
	if (css.includes(importLine) || css.includes(`@import '${importPath}';`)) return css;
	const lines = css.split("\n");
	let insertAt = 0;
	while (insertAt < lines.length && /^\s*@import\b/.test(lines[insertAt])) insertAt++;
	lines.splice(insertAt, 0, importLine);
	return lines.join("\n");
}
function isProjectCssEntry(path) {
	return PROJECT_CSS_ENTRY_CANDIDATES.includes(path);
}
function pickCssFileToEdit(files, currentPath, keepCurrent) {
	if (keepCurrent && currentPath && files.includes(currentPath)) return currentPath;
	if (files.includes(DEFAULT_USER_CSS_PATH)) return DEFAULT_USER_CSS_PATH;
	const userCss = files.find((path) => !isProjectCssEntry(path));
	if (userCss) return userCss;
	if (keepCurrent && currentPath) return currentPath;
	return DEFAULT_USER_CSS_PATH;
}
function formatSelectedElementStoreJson(store, selectedElementId) {
	if (!selectedElementId) return "// Select an element to inspect its store value";
	if (!getById(store, selectedElementId)) return "// Element not found in store";
	return JSON.stringify(storeSubtreeToLegacyNested(store, selectedElementId), null, 2);
}
function generateSelectionFile(store, selectedElementId, componentIndex, assetResolver) {
	if (!selectedElementId) return "// Select an element to see its code";
	if (!getById(store, selectedElementId)) return "// Element not found";
	return generateCompleteFile({
		componentName: "NewComponent",
		store: ensureV2([storeSubtreeToLegacyNested(store, selectedElementId)]),
		componentIndex,
		includeReactImport: false,
		assetResolver
	});
}
var NO_COMPONENT_INDEX = {};
/** Imports a user CSS file into the project's CSS entry, if it is not already there. */
async function ensureCssFileImported(backend, path) {
	if (isProjectCssEntry(path)) return;
	const files = await backend.listFiles("", ".css");
	const globalsPath = PROJECT_CSS_ENTRY_CANDIDATES.find((candidate) => files.includes(candidate)) ?? "app/globals.css";
	let globalsCss = "";
	try {
		globalsCss = await backend.readFileRaw(globalsPath);
	} catch {
		globalsCss = "@import \"tailwindcss\";\n";
	}
	const nextGlobalsCss = addCssImport(globalsCss, relativeCssImport(globalsPath, path));
	if (nextGlobalsCss !== globalsCss) await backend.writeFileRaw(globalsPath, nextGlobalsCss);
}
function BottomBar(t0) {
	const $ = (0, import_compiler_runtime.c)(379);
	const { onSaveSuccess, onSaveStart, onSaveEnd, onOpenVersionHistory, readOnly: t1, copyIncludesComponents: t2, onOpenCopySettings, selectedElementId, store, enableCssEditor: t3, componentIndex: t4, components, iconLibraries: t5, onReplaceElement, onPreviewElement, onClearPreview, openFiles, onCloseFile, activateFile, onSaveFile, openSkills, onCloseSkill, activateSkill, onSaveSkill } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const copyIncludesComponents = t2 === void 0 ? false : t2;
	const enableCssEditor = t3 === void 0 ? false : t3;
	const componentIndex = t4 === void 0 ? NO_COMPONENT_INDEX : t4;
	let t6;
	if ($[0] !== t5) {
		t6 = t5 === void 0 ? {} : t5;
		$[0] = t5;
		$[1] = t6;
	} else t6 = $[1];
	const iconLibraries = t6;
	const backend = useBackendOptional();
	const isDark = useIsDark();
	useCodeEditorFontStyles();
	const [saveStatus, setSaveStatus] = (0, import_react.useState)("idle");
	const [activeCodeTab, setActiveCodeTab] = (0, import_react.useState)("selection");
	const [hasTerminal] = (0, import_react.useState)(_temp$36);
	const [terminalTabs, setTerminalTabs] = (0, import_react.useState)(_temp2$21);
	const nextTermNumRef = (0, import_react.useRef)(2);
	let t7;
	let t8;
	if ($[2] !== hasTerminal) {
		t7 = () => {
			if (!hasTerminal) return;
			const openConnections = (event) => {
				const detail = event.detail;
				nextTermNumRef.current = nextTermNumRef.current + 1;
				const num = nextTermNumRef.current;
				const id = `tt-${Date.now().toString(36)}-${num}`;
				setTerminalTabs((tabs) => [...tabs, {
					id,
					num,
					label: "Connections",
					initialCommand: detail?.command ?? "claude /mcp",
					...detail?.cwd ? { cwd: detail.cwd } : {}
				}]);
				setActiveCodeTab(id);
			};
			window.addEventListener("petal-manage-connections", openConnections);
			return () => window.removeEventListener("petal-manage-connections", openConnections);
		};
		t8 = [hasTerminal];
		$[2] = hasTerminal;
		$[3] = t7;
		$[4] = t8;
	} else {
		t7 = $[3];
		t8 = $[4];
	}
	(0, import_react.useEffect)(t7, t8);
	let t9;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => {
			nextTermNumRef.current = nextTermNumRef.current + 1;
			const num_0 = nextTermNumRef.current;
			const tab = {
				id: `tt-${Date.now().toString(36)}-${num_0}`,
				num: num_0
			};
			setTerminalTabs((prev) => [...prev, tab]);
			setActiveCodeTab(tab.id);
		};
		$[5] = t9;
	} else t9 = $[5];
	const addTerminalTab = t9;
	let t10;
	if ($[6] !== activeCodeTab || $[7] !== terminalTabs) {
		t10 = (id_0) => {
			if (terminalTabs.length <= 1) return;
			const idx = terminalTabs.findIndex((t) => t.id === id_0);
			if (idx === -1) return;
			const next = terminalTabs.filter((t_0) => t_0.id !== id_0);
			setTerminalTabs(next);
			if (activeCodeTab === id_0) setActiveCodeTab(next[Math.max(0, idx - 1)].id);
		};
		$[6] = activeCodeTab;
		$[7] = terminalTabs;
		$[8] = t10;
	} else t10 = $[8];
	const closeTerminalTab = t10;
	let t11;
	if ($[9] !== activeCodeTab || $[10] !== terminalTabs) {
		let t12;
		if ($[12] !== activeCodeTab) {
			t12 = (t_1) => t_1.id === activeCodeTab;
			$[12] = activeCodeTab;
			$[13] = t12;
		} else t12 = $[13];
		t11 = terminalTabs.some(t12);
		$[9] = activeCodeTab;
		$[10] = terminalTabs;
		$[11] = t11;
	} else t11 = $[11];
	const isTerminalActive = t11;
	const isStoreActive = STORE_DEBUG_ENABLED;
	let t12;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = [];
		$[14] = t12;
	} else t12 = $[14];
	const [cssFiles, setCssFiles] = (0, import_react.useState)(t12);
	const [cssFilesLoaded, setCssFilesLoaded] = (0, import_react.useState)(false);
	const [selectedCssPath, setSelectedCssPath] = (0, import_react.useState)(DEFAULT_USER_CSS_PATH);
	const [cssCode, setCssCode] = (0, import_react.useState)("");
	const [cssLoadedPath, setCssLoadedPath] = (0, import_react.useState)(null);
	const [isLoadingCss, setIsLoadingCss] = (0, import_react.useState)(false);
	const [isSavingCss, setIsSavingCss] = (0, import_react.useState)(false);
	const [cssDirty, setCssDirty] = (0, import_react.useState)(false);
	const [cssError, setCssError] = (0, import_react.useState)(null);
	const [copiedKind, setCopiedKind] = (0, import_react.useState)(null);
	const [copyingInline, setCopyingInline] = (0, import_react.useState)(false);
	const assetResolver = useAssetResolver();
	let t13;
	if ($[15] !== selectedElementId || $[16] !== store) {
		t13 = !!selectedElementId && !!getById(store, selectedElementId);
		$[15] = selectedElementId;
		$[16] = store;
		$[17] = t13;
	} else t13 = $[17];
	const hasSelectedElement = t13;
	const { mode } = useEditorMode();
	const codePanelOpen = mode === "dev";
	const selectionTabShown = codePanelOpen && activeCodeTab === "selection";
	let t14;
	if ($[18] !== assetResolver || $[19] !== componentIndex || $[20] !== selectedElementId || $[21] !== selectionTabShown || $[22] !== store) {
		t14 = selectionTabShown ? generateSelectionFile(store, selectedElementId, componentIndex, assetResolver) : "";
		$[18] = assetResolver;
		$[19] = componentIndex;
		$[20] = selectedElementId;
		$[21] = selectionTabShown;
		$[22] = store;
		$[23] = t14;
	} else t14 = $[23];
	const selectedElementCode = t14;
	let t15;
	if ($[24] !== codePanelOpen || $[25] !== isStoreActive || $[26] !== selectedElementId || $[27] !== store) {
		t15 = "";
		$[24] = codePanelOpen;
		$[25] = isStoreActive;
		$[26] = selectedElementId;
		$[27] = store;
		$[28] = t15;
	} else t15 = $[28];
	const selectedElementStoreJson = t15;
	let t16;
	if ($[29] !== components) {
		t16 = components ?? {};
		$[29] = components;
		$[30] = t16;
	} else t16 = $[30];
	let t17;
	if ($[31] !== iconLibraries || $[32] !== onClearPreview || $[33] !== onPreviewElement || $[34] !== onReplaceElement || $[35] !== selectedElementCode || $[36] !== selectedElementId || $[37] !== store || $[38] !== t16) {
		t17 = {
			selectedElementId,
			selectedElementSnippet: selectedElementCode,
			store,
			iconLibraries,
			components: t16,
			onPreviewElement,
			onClearPreview,
			onReplaceElement
		};
		$[31] = iconLibraries;
		$[32] = onClearPreview;
		$[33] = onPreviewElement;
		$[34] = onReplaceElement;
		$[35] = selectedElementCode;
		$[36] = selectedElementId;
		$[37] = store;
		$[38] = t16;
		$[39] = t17;
	} else t17 = $[39];
	const selection = useSelectionJsxEditor(t17);
	const t18 = copyIncludesComponents && selectionTabShown && hasSelectedElement;
	let t19;
	if ($[40] !== backend || $[41] !== components || $[42] !== selectedElementCode || $[43] !== t18) {
		t19 = {
			enabled: t18,
			backend,
			code: selectedElementCode,
			components
		};
		$[40] = backend;
		$[41] = components;
		$[42] = selectedElementCode;
		$[43] = t18;
		$[44] = t19;
	} else t19 = $[44];
	const inlinedSelection = useInlinedComponents(t19);
	let t20;
	if ($[45] !== inlinedSelection || $[46] !== selection.draft) {
		t20 = inlinedSelection && selection.draft.startsWith(inlinedSelection.header) ? inlinedSelection : null;
		$[45] = inlinedSelection;
		$[46] = selection.draft;
		$[47] = t20;
	} else t20 = $[47];
	const inlined = t20;
	const selectionValue = inlined ? inlined.prelude + selection.draft.slice(inlined.header.length) : selection.draft;
	const writeToClipboard = _temp3$17;
	let t21;
	if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = async (text_0) => {
			if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
				const blob = text_0.then(_temp4$17);
				if (await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]).then(_temp5$15, _temp6$11)) return;
			}
			await writeToClipboard(await text_0);
		};
		$[48] = t21;
	} else t21 = $[48];
	const writeToClipboardWhenReady = t21;
	const copiedTimerRef = (0, import_react.useRef)(null);
	let t22;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = (kind) => {
			setCopiedKind(kind);
			if (copiedTimerRef.current != null) window.clearTimeout(copiedTimerRef.current);
			copiedTimerRef.current = window.setTimeout(() => setCopiedKind(null), 1500);
		};
		$[49] = t22;
	} else t22 = $[49];
	const flashCopied = t22;
	let t23;
	let t24;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = () => () => {
			if (copiedTimerRef.current != null) window.clearTimeout(copiedTimerRef.current);
		};
		t24 = [];
		$[50] = t23;
		$[51] = t24;
	} else {
		t23 = $[50];
		t24 = $[51];
	}
	(0, import_react.useEffect)(t23, t24);
	let t25;
	let t26;
	if ($[52] !== enableCssEditor) {
		t25 = () => {
			const onCss = (event_0) => {
				if (!enableCssEditor) return;
				const path = event_0.detail?.path;
				if (path) {
					setSelectedCssPath(path);
					setCssLoadedPath(null);
					setCssDirty(false);
				}
				setActiveCodeTab("css");
			};
			window.addEventListener("petal-open-css-editor", onCss);
			return () => {
				window.removeEventListener("petal-open-css-editor", onCss);
			};
		};
		t26 = [enableCssEditor];
		$[52] = enableCssEditor;
		$[53] = t25;
		$[54] = t26;
	} else {
		t25 = $[53];
		t26 = $[54];
	}
	(0, import_react.useEffect)(t25, t26);
	if (activeCodeTab === "css" && !enableCssEditor) setActiveCodeTab("selection");
	if (activeCodeTab === "store" && true) setActiveCodeTab("selection");
	if (activeCodeTab.startsWith("file:")) {
		const path_0 = activeCodeTab.slice(5);
		if (!(openFiles || []).some((f) => f.path === path_0)) setActiveCodeTab("selection");
	}
	if (activeCodeTab.startsWith("skill:")) {
		const name = activeCodeTab.slice(6);
		if (!(openSkills || []).some((s) => s.name === name)) setActiveCodeTab("selection");
	}
	const cmRef = (0, import_react.useRef)(null);
	const codeTabRef = (0, import_react.useRef)(activeCodeTab);
	let t27;
	let t28;
	if ($[55] !== activeCodeTab) {
		t27 = () => {
			codeTabRef.current = activeCodeTab;
		};
		t28 = [activeCodeTab];
		$[55] = activeCodeTab;
		$[56] = t27;
		$[57] = t28;
	} else {
		t27 = $[56];
		t28 = $[57];
	}
	(0, import_react.useLayoutEffect)(t27, t28);
	const codeViewPositionRef = (0, import_react.useRef)(null);
	let t29;
	if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = (view) => {
			const { anchor, head } = view.state.selection.main;
			codeViewPositionRef.current = {
				tab: codeTabRef.current,
				scrollTop: view.scrollDOM.scrollTop,
				anchor,
				head
			};
		};
		$[58] = t29;
	} else t29 = $[58];
	const saveCodeViewPosition = t29;
	let t30;
	if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = (view_0) => {
			view_0.scrollDOM.addEventListener("scroll", () => saveCodeViewPosition(view_0), { passive: true });
			const saved = codeViewPositionRef.current;
			if (!saved || saved.tab !== codeTabRef.current) return;
			const length = view_0.state.doc.length;
			view_0.dispatch({ selection: {
				anchor: Math.min(saved.anchor, length),
				head: Math.min(saved.head, length)
			} });
			requestAnimationFrame(() => {
				view_0.scrollDOM.scrollTop = saved.scrollTop;
			});
		};
		$[59] = t30;
	} else t30 = $[59];
	const restoreCodeViewPosition = t30;
	const [pendingScrollLine, setPendingScrollLine] = (0, import_react.useState)(null);
	const [syncedActivateFile, setSyncedActivateFile] = (0, import_react.useState)(activateFile);
	if (syncedActivateFile !== activateFile) {
		setSyncedActivateFile(activateFile);
		if (activateFile) {
			setActiveCodeTab(`file:${activateFile.path}`);
			setPendingScrollLine(activateFile.line ?? null);
		}
	}
	const [syncedActivateSkill, setSyncedActivateSkill] = (0, import_react.useState)(activateSkill);
	if (syncedActivateSkill !== activateSkill) {
		setSyncedActivateSkill(activateSkill);
		if (activateSkill) setActiveCodeTab(`skill:${activateSkill.name}`);
	}
	let t31;
	if ($[60] !== openFiles) {
		t31 = openFiles || [];
		$[60] = openFiles;
		$[61] = t31;
	} else t31 = $[61];
	let t32;
	if ($[62] !== activeCodeTab || $[63] !== t31) {
		let t33;
		if ($[65] !== activeCodeTab) {
			t33 = (f_0) => activeCodeTab === `file:${f_0.path}`;
			$[65] = activeCodeTab;
			$[66] = t33;
		} else t33 = $[66];
		t32 = t31.find(t33);
		$[62] = activeCodeTab;
		$[63] = t31;
		$[64] = t32;
	} else t32 = $[64];
	const activeOpenFile = t32;
	let t33;
	if ($[67] !== openSkills) {
		t33 = openSkills || [];
		$[67] = openSkills;
		$[68] = t33;
	} else t33 = $[68];
	let t34;
	if ($[69] !== activeCodeTab || $[70] !== t33) {
		let t35;
		if ($[72] !== activeCodeTab) {
			t35 = (s_0) => activeCodeTab === `skill:${s_0.name}`;
			$[72] = activeCodeTab;
			$[73] = t35;
		} else t35 = $[73];
		t34 = t33.find(t35);
		$[69] = activeCodeTab;
		$[70] = t33;
		$[71] = t34;
	} else t34 = $[71];
	const activeOpenSkill = t34;
	let t35;
	if ($[74] === Symbol.for("react.memo_cache_sentinel")) {
		t35 = {};
		$[74] = t35;
	} else t35 = $[74];
	const [fileDrafts, setFileDrafts] = (0, import_react.useState)(t35);
	let t36;
	if ($[75] === Symbol.for("react.memo_cache_sentinel")) {
		t36 = {};
		$[75] = t36;
	} else t36 = $[75];
	const [skillDrafts, setSkillDrafts] = (0, import_react.useState)(t36);
	const [savingFile, setSavingFile] = (0, import_react.useState)(false);
	const [savingSkill, setSavingSkill] = (0, import_react.useState)(false);
	const [cursorLine, setCursorLine] = (0, import_react.useState)(1);
	const activeFileValue = activeOpenFile ? fileDrafts[activeOpenFile.path] ?? activeOpenFile.content : "";
	const activeSkillValue = activeOpenSkill ? skillDrafts[activeOpenSkill.name] ?? activeOpenSkill.content : "";
	const activeFileDirty = !!activeOpenFile && fileDrafts[activeOpenFile.path] !== void 0 && fileDrafts[activeOpenFile.path] !== activeOpenFile.content;
	const activeSkillDirty = !!activeOpenSkill && skillDrafts[activeOpenSkill.name] !== void 0 && skillDrafts[activeOpenSkill.name] !== activeOpenSkill.content;
	let t37;
	if ($[76] !== activeOpenFile || $[77] !== fileDrafts || $[78] !== onSaveEnd || $[79] !== onSaveFile || $[80] !== onSaveStart || $[81] !== onSaveSuccess) {
		t37 = async () => {
			if (!activeOpenFile || !onSaveFile) return;
			const path_1 = activeOpenFile.path;
			const content = fileDrafts[path_1] ?? activeOpenFile.content;
			setSavingFile(true);
			onSaveStart?.();
			onSaveFile(path_1, content).then(() => {
				setFileDrafts((d) => {
					const next_0 = { ...d };
					delete next_0[path_1];
					return next_0;
				});
				onSaveSuccess?.(path_1);
				onSaveEnd?.(true);
			}).catch((err) => {
				onSaveEnd?.(false, err instanceof Error ? err.message : String(err));
			}).finally(() => setSavingFile(false));
		};
		$[76] = activeOpenFile;
		$[77] = fileDrafts;
		$[78] = onSaveEnd;
		$[79] = onSaveFile;
		$[80] = onSaveStart;
		$[81] = onSaveSuccess;
		$[82] = t37;
	} else t37 = $[82];
	const handleSaveOpenFile = t37;
	let t38;
	if ($[83] !== activeOpenSkill || $[84] !== onSaveSkill || $[85] !== skillDrafts) {
		t38 = async () => {
			if (!activeOpenSkill || !onSaveSkill) return;
			const name_0 = activeOpenSkill.name;
			const content_0 = skillDrafts[name_0] ?? activeOpenSkill.content;
			setSavingSkill(true);
			onSaveSkill(name_0, content_0).then(() => {
				setSkillDrafts((d_0) => {
					const next_1 = { ...d_0 };
					delete next_1[name_0];
					return next_1;
				});
				setSaveStatus("success");
				setTimeout(() => setSaveStatus("idle"), 2e3);
			}).catch(() => {
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 3e3);
			}).finally(() => setSavingSkill(false));
		};
		$[83] = activeOpenSkill;
		$[84] = onSaveSkill;
		$[85] = skillDrafts;
		$[86] = t38;
	} else t38 = $[86];
	const handleSaveOpenSkill = t38;
	let t39;
	if ($[87] !== handleSaveOpenFile) {
		t39 = () => {
			handleSaveOpenFile();
		};
		$[87] = handleSaveOpenFile;
		$[88] = t39;
	} else t39 = $[88];
	const onSaveFileShortcut = (0, import_react.useEffectEvent)(t39);
	let t40;
	if ($[89] !== activeOpenFile || $[90] !== onSaveFileShortcut || $[91] !== readOnly) {
		t40 = () => {
			if (!activeOpenFile || readOnly) return;
			const onKey = (e) => {
				if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "s") {
					e.preventDefault();
					e.stopPropagation();
					onSaveFileShortcut();
				}
			};
			window.addEventListener("keydown", onKey, true);
			return () => window.removeEventListener("keydown", onKey, true);
		};
		$[89] = activeOpenFile;
		$[90] = onSaveFileShortcut;
		$[91] = readOnly;
		$[92] = t40;
	} else t40 = $[92];
	let t41;
	if ($[93] !== activeOpenFile || $[94] !== readOnly) {
		t41 = [activeOpenFile, readOnly];
		$[93] = activeOpenFile;
		$[94] = readOnly;
		$[95] = t41;
	} else t41 = $[95];
	(0, import_react.useEffect)(t40, t41);
	let t42;
	if ($[96] !== handleSaveOpenSkill) {
		t42 = () => {
			handleSaveOpenSkill();
		};
		$[96] = handleSaveOpenSkill;
		$[97] = t42;
	} else t42 = $[97];
	const onSaveSkillShortcut = (0, import_react.useEffectEvent)(t42);
	let t43;
	if ($[98] !== activeOpenSkill || $[99] !== onSaveSkillShortcut || $[100] !== readOnly) {
		t43 = () => {
			if (!activeOpenSkill || readOnly) return;
			const onKey_0 = (e_0) => {
				if ((e_0.metaKey || e_0.ctrlKey) && !e_0.shiftKey && e_0.key.toLowerCase() === "s") {
					e_0.preventDefault();
					e_0.stopPropagation();
					onSaveSkillShortcut();
				}
			};
			window.addEventListener("keydown", onKey_0, true);
			return () => window.removeEventListener("keydown", onKey_0, true);
		};
		$[98] = activeOpenSkill;
		$[99] = onSaveSkillShortcut;
		$[100] = readOnly;
		$[101] = t43;
	} else t43 = $[101];
	let t44;
	if ($[102] !== activeOpenSkill || $[103] !== readOnly) {
		t44 = [activeOpenSkill, readOnly];
		$[102] = activeOpenSkill;
		$[103] = readOnly;
		$[104] = t44;
	} else t44 = $[104];
	(0, import_react.useEffect)(t43, t44);
	const documentKey = `${activeOpenFile?.path ?? ""}\u0000${activeOpenSkill?.name ?? ""}\u0000${activeCodeTab}`;
	const [syncedDocumentKey, setSyncedDocumentKey] = (0, import_react.useState)(documentKey);
	if (syncedDocumentKey !== documentKey) {
		setSyncedDocumentKey(documentKey);
		setCursorLine(1);
	}
	let t45;
	if ($[105] !== assetResolver || $[106] !== backend || $[107] !== componentIndex || $[108] !== copyIncludesComponents || $[109] !== copyingInline || $[110] !== hasSelectedElement || $[111] !== inlined || $[112] !== selectedElementId || $[113] !== selection.dirty || $[114] !== selection.draft || $[115] !== selectionTabShown || $[116] !== store) {
		t45 = async () => {
			if (!hasSelectedElement) return;
			const entry = selectionTabShown || selection.dirty ? selection.draft : generateSelectionFile(store, selectedElementId, componentIndex, assetResolver);
			if (!copyIncludesComponents || !backend || inlined) {
				const text_1 = inlined ? inlined.prelude + entry.slice(inlined.header.length) : entry;
				await writeToClipboard(text_1);
				flashCopied("selection");
				return;
			}
			if (copyingInline) return;
			setCopyingInline(true);
			const file = backend.listFiles("").then((paths) => inlineLocalImports({
				entry,
				projectPaths: new Set(paths),
				readFile: (path_2) => backend.readFileRaw(path_2)
			}));
			await writeToClipboardWhenReady(file).then(() => flashCopied("selection")).catch(_temp7$9).finally(() => setCopyingInline(false));
		};
		$[105] = assetResolver;
		$[106] = backend;
		$[107] = componentIndex;
		$[108] = copyIncludesComponents;
		$[109] = copyingInline;
		$[110] = hasSelectedElement;
		$[111] = inlined;
		$[112] = selectedElementId;
		$[113] = selection.dirty;
		$[114] = selection.draft;
		$[115] = selectionTabShown;
		$[116] = store;
		$[117] = t45;
	} else t45 = $[117];
	const copySelection = t45;
	let t46;
	if ($[118] !== activeFileValue || $[119] !== activeOpenFile) {
		t46 = async () => {
			if (!activeOpenFile) return;
			await writeToClipboard(activeFileValue);
			flashCopied("source");
		};
		$[118] = activeFileValue;
		$[119] = activeOpenFile;
		$[120] = t46;
	} else t46 = $[120];
	const copySourceFile = t46;
	let t47;
	if ($[121] !== hasSelectedElement || $[122] !== selectedElementId || $[123] !== store) {
		t47 = async () => {
			if (!hasSelectedElement) return;
			await writeToClipboard(formatSelectedElementStoreJson(store, selectedElementId));
			flashCopied("store");
		};
		$[121] = hasSelectedElement;
		$[122] = selectedElementId;
		$[123] = store;
		$[124] = t47;
	} else t47 = $[124];
	const copyStore = t47;
	let t48;
	if ($[125] !== activeOpenFile || $[126] !== copySelection || $[127] !== copySourceFile || $[128] !== copyStore || $[129] !== isStoreActive) {
		t48 = async () => {
			if (activeOpenFile) {
				await copySourceFile();
				return;
			}
			await copySelection();
		};
		$[125] = activeOpenFile;
		$[126] = copySelection;
		$[127] = copySourceFile;
		$[128] = copyStore;
		$[129] = isStoreActive;
		$[130] = t48;
	} else t48 = $[130];
	const copyCode = t48;
	let t49;
	if ($[131] !== copyCode) {
		t49 = (e_1) => {
			e_1.preventDefault();
			copyCode();
		};
		$[131] = copyCode;
		$[132] = t49;
	} else t49 = $[132];
	useGlobalShortcut("copySelectionAsJsx", t49, !!activeOpenFile || hasSelectedElement && true);
	let t50;
	if ($[133] !== backend || $[134] !== cssDirty || $[135] !== enableCssEditor) {
		t50 = async () => {
			if (!backend || !enableCssEditor) return;
			const sorted = [...new Set(await backend.listFiles("", ".css"))].sort();
			setCssFiles(sorted);
			setCssFilesLoaded(true);
			if (!cssDirty) setSelectedCssPath((current) => pickCssFileToEdit(sorted, current, true));
		};
		$[133] = backend;
		$[134] = cssDirty;
		$[135] = enableCssEditor;
		$[136] = t50;
	} else t50 = $[136];
	const refreshCssFiles = t50;
	let t51;
	if ($[137] !== refreshCssFiles) {
		t51 = () => {
			refreshCssFiles();
		};
		$[137] = refreshCssFiles;
		$[138] = t51;
	} else t51 = $[138];
	const refreshCssFilesEffect = (0, import_react.useEffectEvent)(t51);
	let t52;
	if ($[139] !== refreshCssFilesEffect) {
		t52 = () => {
			refreshCssFilesEffect();
		};
		$[139] = refreshCssFilesEffect;
		$[140] = t52;
	} else t52 = $[140];
	let t53;
	if ($[141] !== backend || $[142] !== cssDirty || $[143] !== enableCssEditor) {
		t53 = [
			backend,
			enableCssEditor,
			cssDirty
		];
		$[141] = backend;
		$[142] = cssDirty;
		$[143] = enableCssEditor;
		$[144] = t53;
	} else t53 = $[144];
	(0, import_react.useEffect)(t52, t53);
	let t54;
	let t55;
	if ($[145] !== activeCodeTab || $[146] !== backend || $[147] !== cssDirty || $[148] !== cssLoadedPath || $[149] !== enableCssEditor || $[150] !== selectedCssPath) {
		t54 = () => {
			if (!enableCssEditor || !backend || activeCodeTab !== "css" || !selectedCssPath) return;
			if (cssDirty && cssLoadedPath === selectedCssPath) return;
			let cancelled = false;
			const loadCss = () => {
				setIsLoadingCss(true);
				setCssError(null);
				backend.readFileRaw(selectedCssPath).then((raw) => {
					if (cancelled) return;
					setCssCode(raw ?? "");
					setCssLoadedPath(selectedCssPath);
					setCssDirty(false);
				}).catch((err_1) => {
					if (cancelled) return;
					setCssCode("");
					setCssLoadedPath(selectedCssPath);
					setCssDirty(false);
					setCssError(err_1 instanceof Error ? err_1.message : String(err_1));
				}).finally(() => {
					if (!cancelled) setIsLoadingCss(false);
				});
			};
			loadCss();
			return () => {
				cancelled = true;
			};
		};
		t55 = [
			backend,
			activeCodeTab,
			selectedCssPath,
			cssDirty,
			cssLoadedPath,
			enableCssEditor
		];
		$[145] = activeCodeTab;
		$[146] = backend;
		$[147] = cssDirty;
		$[148] = cssLoadedPath;
		$[149] = enableCssEditor;
		$[150] = selectedCssPath;
		$[151] = t54;
		$[152] = t55;
	} else {
		t54 = $[151];
		t55 = $[152];
	}
	(0, import_react.useEffect)(t54, t55);
	let t56;
	if ($[153] !== backend || $[154] !== enableCssEditor || $[155] !== readOnly || $[156] !== refreshCssFiles || $[157] !== selectedCssPath) {
		t56 = (rawPath, content_1) => {
			if (!backend || readOnly || !enableCssEditor) return;
			let path_3 = (rawPath ?? selectedCssPath).trim() || DEFAULT_USER_CSS_PATH;
			if (!path_3.endsWith(".css")) path_3 = path_3 + ".css";
			const starter = content_1 ?? "";
			setIsSavingCss(true);
			setCssError(null);
			backend.writeFileRaw(path_3, starter).then(() => ensureCssFileImported(backend, path_3)).then(() => {
				setSelectedCssPath(path_3);
				setCssCode(starter);
				setCssLoadedPath(path_3);
				setCssDirty(false);
				return refreshCssFiles();
			}).then(() => {
				setSaveStatus("success");
				setTimeout(() => setSaveStatus("idle"), 2e3);
			}).catch((err_2) => {
				if (isPlanLimitError(err_2)) return;
				setCssError(err_2 instanceof Error ? err_2.message : String(err_2));
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 3e3);
			}).finally(() => setIsSavingCss(false));
		};
		$[153] = backend;
		$[154] = enableCssEditor;
		$[155] = readOnly;
		$[156] = refreshCssFiles;
		$[157] = selectedCssPath;
		$[158] = t56;
	} else t56 = $[158];
	const createCssFile = t56;
	let t57;
	if ($[159] !== createCssFile) {
		t57 = () => {
			createCssFile(DEFAULT_USER_CSS_PATH);
		};
		$[159] = createCssFile;
		$[160] = t57;
	} else t57 = $[160];
	const createDefaultCssFileEffect = (0, import_react.useEffectEvent)(t57);
	let t58;
	if ($[161] !== activeCodeTab || $[162] !== backend || $[163] !== createDefaultCssFileEffect || $[164] !== cssDirty || $[165] !== cssFiles || $[166] !== cssFilesLoaded || $[167] !== enableCssEditor || $[168] !== readOnly) {
		t58 = () => {
			if (!enableCssEditor || !backend || readOnly || activeCodeTab !== "css" || !cssFilesLoaded || cssDirty) return;
			if (cssFiles.some(_temp8$7)) return;
			createDefaultCssFileEffect();
		};
		$[161] = activeCodeTab;
		$[162] = backend;
		$[163] = createDefaultCssFileEffect;
		$[164] = cssDirty;
		$[165] = cssFiles;
		$[166] = cssFilesLoaded;
		$[167] = enableCssEditor;
		$[168] = readOnly;
		$[169] = t58;
	} else t58 = $[169];
	let t59;
	if ($[170] !== activeCodeTab || $[171] !== backend || $[172] !== cssDirty || $[173] !== cssFiles || $[174] !== cssFilesLoaded || $[175] !== enableCssEditor || $[176] !== readOnly) {
		t59 = [
			backend,
			readOnly,
			activeCodeTab,
			cssFilesLoaded,
			cssDirty,
			cssFiles,
			enableCssEditor
		];
		$[170] = activeCodeTab;
		$[171] = backend;
		$[172] = cssDirty;
		$[173] = cssFiles;
		$[174] = cssFilesLoaded;
		$[175] = enableCssEditor;
		$[176] = readOnly;
		$[177] = t59;
	} else t59 = $[177];
	(0, import_react.useEffect)(t58, t59);
	let t60;
	if ($[178] !== createCssFile || $[179] !== cssCode || $[180] !== cssLoadedPath || $[181] !== selectedCssPath) {
		t60 = async () => {
			const content_2 = cssLoadedPath === selectedCssPath && cssCode.trim() ? cssCode : void 0;
			await createCssFile(selectedCssPath, content_2);
		};
		$[178] = createCssFile;
		$[179] = cssCode;
		$[180] = cssLoadedPath;
		$[181] = selectedCssPath;
		$[182] = t60;
	} else t60 = $[182];
	const handleCreateCssFile = t60;
	let t61;
	if ($[183] !== backend || $[184] !== cssCode || $[185] !== enableCssEditor || $[186] !== readOnly || $[187] !== refreshCssFiles || $[188] !== selectedCssPath) {
		t61 = () => {
			if (!backend || readOnly || !enableCssEditor || !selectedCssPath) return;
			setIsSavingCss(true);
			setCssError(null);
			backend.writeFileRaw(selectedCssPath, cssCode).then(() => {
				setCssLoadedPath(selectedCssPath);
				setCssDirty(false);
				return refreshCssFiles();
			}).then(() => {
				setSaveStatus("success");
				setTimeout(() => setSaveStatus("idle"), 2e3);
			}).catch((err_3) => {
				if (isPlanLimitError(err_3)) return;
				setCssError(err_3 instanceof Error ? err_3.message : String(err_3));
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 3e3);
			}).finally(() => setIsSavingCss(false));
		};
		$[183] = backend;
		$[184] = cssCode;
		$[185] = enableCssEditor;
		$[186] = readOnly;
		$[187] = refreshCssFiles;
		$[188] = selectedCssPath;
		$[189] = t61;
	} else t61 = $[189];
	const handleSaveCssFile = t61;
	const canEditSource = !readOnly && !!activeOpenFile && !!onSaveFile;
	const canEditSkill = !readOnly && !!activeOpenSkill && !!onSaveSkill;
	const isCssActive = enableCssEditor && activeCodeTab === "css";
	let t62;
	if ($[190] !== cssFiles || $[191] !== selectedCssPath) {
		t62 = cssFiles.includes(selectedCssPath.trim());
		$[190] = cssFiles;
		$[191] = selectedCssPath;
		$[192] = t62;
	} else t62 = $[192];
	const selectedCssFileExists = t62;
	let t63;
	if ($[193] !== isCssActive || $[194] !== selectedCssFileExists || $[195] !== selectedCssPath) {
		t63 = isCssActive && !selectedCssFileExists && selectedCssPath.trim().length > 0;
		$[193] = isCssActive;
		$[194] = selectedCssFileExists;
		$[195] = selectedCssPath;
		$[196] = t63;
	} else t63 = $[196];
	const canCreateSelectedCssFile = t63;
	let t64;
	if ($[197] !== activeFileValue || $[198] !== activeOpenFile || $[199] !== cursorLine) {
		t64 = activeOpenFile ? buildFileBreadcrumbItems(activeOpenFile.path, activeFileValue, cursorLine, activeOpenFile.componentName) : [];
		$[197] = activeFileValue;
		$[198] = activeOpenFile;
		$[199] = cursorLine;
		$[200] = t64;
	} else t64 = $[200];
	const breadcrumbItems = t64;
	let t65;
	if ($[201] !== activeCodeTab || $[202] !== activeFileValue || $[203] !== activeOpenFile || $[204] !== activeOpenSkill || $[205] !== activeSkillValue || $[206] !== canEditSkill || $[207] !== cssCode || $[208] !== handleSaveOpenFile || $[209] !== handleSaveOpenSkill || $[210] !== inlined || $[211] !== isCssActive || $[212] !== isStoreActive || $[213] !== onSaveFile || $[214] !== readOnly || $[215] !== selectedElementCode || $[216] !== selectedElementId || $[217] !== selectedElementStoreJson || $[218] !== selection || $[219] !== selectionValue) {
		t65 = isCssActive ? {
			value: cssCode,
			language: "css",
			editable: !readOnly,
			onChange: (value_0) => {
				setCssCode(value_0);
				setCssDirty(true);
			}
		} : activeOpenSkill ? {
			value: activeSkillValue,
			language: "markdown",
			editable: canEditSkill,
			onChange: (value_1) => setSkillDrafts((d_1) => ({
				...d_1,
				[activeOpenSkill.name]: value_1
			})),
			commit: () => void handleSaveOpenSkill()
		} : activeOpenFile ? {
			value: activeFileValue,
			language: activeOpenFile.path.endsWith(".css") ? "css" : activeOpenFile.path.endsWith(".md") ? "markdown" : "jsx",
			editable: !readOnly && !!onSaveFile,
			onChange: (value_2) => setFileDrafts((d_2) => ({
				...d_2,
				[activeOpenFile.path]: value_2
			})),
			commit: () => void handleSaveOpenFile()
		} : activeCodeTab === "selection" ? {
			value: selectedElementId ? selectionValue : selectedElementCode,
			language: "jsx",
			editable: !readOnly && !!selectedElementId,
			onChange: inlined ? (value_3) => selection.onChange(inlined.header + value_3.slice(inlined.prelude.length)) : selection.onChange,
			commit: selection.apply,
			commitOnBlur: true
		} : {
			value: "// No code to display",
			language: "jsx",
			editable: false,
			onChange: _temp0$4
		};
		$[201] = activeCodeTab;
		$[202] = activeFileValue;
		$[203] = activeOpenFile;
		$[204] = activeOpenSkill;
		$[205] = activeSkillValue;
		$[206] = canEditSkill;
		$[207] = cssCode;
		$[208] = handleSaveOpenFile;
		$[209] = handleSaveOpenSkill;
		$[210] = inlined;
		$[211] = isCssActive;
		$[212] = isStoreActive;
		$[213] = onSaveFile;
		$[214] = readOnly;
		$[215] = selectedElementCode;
		$[216] = selectedElementId;
		$[217] = selectedElementStoreJson;
		$[218] = selection;
		$[219] = selectionValue;
		$[220] = t65;
	} else t65 = $[220];
	const activeSurface = t65;
	const selectionPrelude = activeCodeTab === "selection" && inlined ? inlined : null;
	let t66;
	if ($[221] !== selectionPrelude) {
		t66 = selectionPrelude ? [inlinedPrelude({
			text: selectionPrelude.prelude,
			files: selectionPrelude.files
		})] : [];
		$[221] = selectionPrelude;
		$[222] = t66;
	} else t66 = $[222];
	let t67;
	if ($[223] !== activeSurface.language) {
		t67 = activeSurface.language === "css" ? [css$1()] : activeSurface.language === "markdown" ? [markdown()] : [javascript({ jsx: true })];
		$[223] = activeSurface.language;
		$[224] = t67;
	} else t67 = $[224];
	const t68 = isDark ? githubDark : githubLight;
	let t69;
	if ($[225] === Symbol.for("react.memo_cache_sentinel")) {
		t69 = EditorView$1.updateListener.of((update) => {
			if (!update.selectionSet && !update.docChanged) return;
			const line = update.state.doc.lineAt(update.state.selection.main.head).number;
			setCursorLine(line);
		});
		$[225] = t69;
	} else t69 = $[225];
	let t70;
	if ($[226] !== t66 || $[227] !== t67 || $[228] !== t68) {
		t70 = [
			...t66,
			...t67,
			t68,
			CODE_EDITOR_THEME,
			t69
		];
		$[226] = t66;
		$[227] = t67;
		$[228] = t68;
		$[229] = t70;
	} else t70 = $[229];
	const editorExtensions = t70;
	const surfaceOnChange = (0, import_react.useRef)(activeSurface.onChange);
	let t71;
	if ($[230] !== activeSurface.onChange) {
		t71 = () => {
			surfaceOnChange.current = activeSurface.onChange;
		};
		$[230] = activeSurface.onChange;
		$[231] = t71;
	} else t71 = $[231];
	(0, import_react.useLayoutEffect)(t71);
	let t72;
	if ($[232] === Symbol.for("react.memo_cache_sentinel")) {
		t72 = (value_4) => surfaceOnChange.current(value_4);
		$[232] = t72;
	} else t72 = $[232];
	const onEditorChange = t72;
	let t73;
	let t74;
	if ($[233] !== activeSurface.value) {
		t73 = () => {
			const view_1 = cmRef.current?.view;
			if (!view_1 || view_1.hasFocus) return;
			const current_0 = view_1.state.doc.toString();
			if (current_0 === activeSurface.value) return;
			view_1.dispatch({
				changes: minimalChange(current_0, activeSurface.value),
				annotations: [ExternalChange.of(true)]
			});
		};
		t74 = [activeSurface.value];
		$[233] = activeSurface.value;
		$[234] = t73;
		$[235] = t74;
	} else {
		t73 = $[234];
		t74 = $[235];
	}
	(0, import_react.useLayoutEffect)(t73, t74);
	let t75;
	if ($[236] !== activeCodeTab || $[237] !== cssError || $[238] !== saveStatus || $[239] !== selection.error || $[240] !== selection.previewUnapplied) {
		t75 = activeCodeTab === "selection" && selection.error ? {
			kind: "error",
			message: selection.error
		} : saveStatus === "error" && cssError ? {
			kind: "error",
			message: cssError
		} : saveStatus === "success" ? {
			kind: "success",
			message: "Saved"
		} : activeCodeTab === "selection" && selection.previewUnapplied ? {
			kind: "hint",
			message: "Not applied - fix the JSX to resume the live preview"
		} : null;
		$[236] = activeCodeTab;
		$[237] = cssError;
		$[238] = saveStatus;
		$[239] = selection.error;
		$[240] = selection.previewUnapplied;
		$[241] = t75;
	} else t75 = $[241];
	const status = t75;
	let t76;
	if ($[242] !== activeOpenFile || $[243] !== codePanelOpen || $[244] !== pendingScrollLine) {
		t76 = () => {
			if (pendingScrollLine == null || !activeOpenFile || !codePanelOpen) return;
			const line_0 = pendingScrollLine;
			const t_2 = setTimeout(() => {
				const view_2 = cmRef.current?.view;
				if (!view_2) return;
				const total = view_2.state.doc.lines;
				const pos = view_2.state.doc.line(Math.min(Math.max(1, line_0), total)).from;
				view_2.dispatch({
					selection: { anchor: pos },
					effects: EditorView$1.scrollIntoView(pos, { y: "center" })
				});
				setPendingScrollLine(null);
			}, 60);
			return () => clearTimeout(t_2);
		};
		$[242] = activeOpenFile;
		$[243] = codePanelOpen;
		$[244] = pendingScrollLine;
		$[245] = t76;
	} else t76 = $[245];
	let t77;
	if ($[246] !== activeCodeTab || $[247] !== activeOpenFile || $[248] !== activeSurface.value || $[249] !== codePanelOpen || $[250] !== pendingScrollLine) {
		t77 = [
			activeSurface.value,
			activeCodeTab,
			activeOpenFile,
			pendingScrollLine,
			codePanelOpen
		];
		$[246] = activeCodeTab;
		$[247] = activeOpenFile;
		$[248] = activeSurface.value;
		$[249] = codePanelOpen;
		$[250] = pendingScrollLine;
		$[251] = t77;
	} else t77 = $[251];
	(0, import_react.useEffect)(t76, t77);
	const tabsScrollRef = (0, import_react.useRef)(null);
	let t78;
	if ($[252] === Symbol.for("react.memo_cache_sentinel")) {
		t78 = () => {
			const container = tabsScrollRef.current;
			if (!container) return;
			container.querySelector("[data-state=\"active\"]")?.scrollIntoView({
				inline: "nearest",
				block: "nearest"
			});
		};
		$[252] = t78;
	} else t78 = $[252];
	let t79;
	if ($[253] !== activeCodeTab) {
		t79 = [activeCodeTab];
		$[253] = activeCodeTab;
		$[254] = t79;
	} else t79 = $[254];
	(0, import_react.useEffect)(t78, t79);
	let t80;
	if ($[255] === Symbol.for("react.memo_cache_sentinel")) {
		t80 = STORE_DEBUG_ENABLED;
		$[255] = t80;
	} else t80 = $[255];
	let t81;
	if ($[256] === Symbol.for("react.memo_cache_sentinel")) {
		t81 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "selection",
			className: "px-3 h-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CursorIcon, {
				width: 12,
				height: 12
			}), "Selection"]
		});
		$[256] = t81;
	} else t81 = $[256];
	let t82;
	if ($[257] !== enableCssEditor) {
		t82 = enableCssEditor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "css",
			className: "px-3 h-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BracketsCurlyIcon, {
				width: 12,
				height: 12
			}), "CSS"]
		});
		$[257] = enableCssEditor;
		$[258] = t82;
	} else t82 = $[258];
	let t83;
	if ($[259] !== openFiles) {
		t83 = openFiles || [];
		$[259] = openFiles;
		$[260] = t83;
	} else t83 = $[260];
	let t84;
	if ($[261] !== onCloseFile || $[262] !== t83) {
		let t85;
		if ($[264] !== onCloseFile) {
			t85 = (f_1) => {
				const id_1 = `file:${f_1.path}`;
				const label = f_1.path.split("/").pop() || f_1.path;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: f_1.path,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: id_1,
						className: "group h-6 px-3 data-[state=active]:text-ed-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$13, {
								size: 12,
								weight: "bold"
							}),
							label,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								role: "button",
								tabIndex: -1,
								"aria-label": `Close ${label}`,
								onMouseDown: _temp1$4,
								onClick: (e_3) => {
									e_3.stopPropagation();
									onCloseFile?.(f_1.path);
								},
								className: "inline-flex size-2.5 items-center justify-center rounded text-ed-muted-foreground hover:bg-ed-muted hover:text-ed-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-2.5" })
							})
						]
					})
				}, id_1);
			};
			$[264] = onCloseFile;
			$[265] = t85;
		} else t85 = $[265];
		t84 = t83.map(t85);
		$[261] = onCloseFile;
		$[262] = t83;
		$[263] = t84;
	} else t84 = $[263];
	let t85;
	if ($[266] !== openSkills) {
		t85 = openSkills || [];
		$[266] = openSkills;
		$[267] = t85;
	} else t85 = $[267];
	let t86;
	if ($[268] !== onCloseSkill || $[269] !== t85) {
		let t87;
		if ($[271] !== onCloseSkill) {
			t87 = (s_1) => {
				const id_2 = `skill:${s_1.name}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: s_1.name,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: id_2,
						className: "group h-6 px-3 data-[state=active]:text-ed-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpenIcon, {
								width: 12,
								height: 12
							}),
							s_1.name,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								role: "button",
								tabIndex: -1,
								"aria-label": `Close ${s_1.name}`,
								onMouseDown: _temp10$4,
								onClick: (e_5) => {
									e_5.stopPropagation();
									onCloseSkill?.(s_1.name);
								},
								className: "inline-flex size-2.5 items-center justify-center rounded text-ed-muted-foreground hover:bg-ed-muted hover:text-ed-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-2.5" })
							})
						]
					})
				}, id_2);
			};
			$[271] = onCloseSkill;
			$[272] = t87;
		} else t87 = $[272];
		t86 = t85.map(t87);
		$[268] = onCloseSkill;
		$[269] = t85;
		$[270] = t86;
	} else t86 = $[270];
	let t87;
	if ($[273] !== closeTerminalTab || $[274] !== terminalTabs) {
		let t88;
		if ($[276] !== closeTerminalTab || $[277] !== terminalTabs.length) {
			t88 = (t_3) => {
				const label_0 = t_3.label ?? (terminalTabs.length === 1 ? "Terminal" : `Terminal ${t_3.num}`);
				const canClose = terminalTabs.length > 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: t_3.id,
					className: "group h-6 px-3 data-[state=active]:text-ed-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {
							width: 16,
							height: 16
						}),
						label_0,
						canClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "button",
							tabIndex: -1,
							"aria-label": `Close ${label_0}`,
							onMouseDown: _temp11$4,
							onClick: (e_7) => {
								e_7.stopPropagation();
								closeTerminalTab(t_3.id);
							},
							className: "inline-flex size-2.5 items-center justify-center rounded text-ed-muted-foreground opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 hover:bg-ed-muted hover:text-ed-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-2.5" })
						})
					]
				}, t_3.id);
			};
			$[276] = closeTerminalTab;
			$[277] = terminalTabs.length;
			$[278] = t88;
		} else t88 = $[278];
		t87 = terminalTabs.map(t88);
		$[273] = closeTerminalTab;
		$[274] = terminalTabs;
		$[275] = t87;
	} else t87 = $[275];
	let t88;
	if ($[279] !== t82 || $[280] !== t84 || $[281] !== t86 || $[282] !== t87) {
		t88 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
			variant: "simple",
			className: "h-7 w-max min-w-max gap-0 border-0",
			children: [
				t80,
				t81,
				t82,
				t84,
				t86,
				t87
			]
		});
		$[279] = t82;
		$[280] = t84;
		$[281] = t86;
		$[282] = t87;
		$[283] = t88;
	} else t88 = $[283];
	let t89;
	if ($[284] !== activeCodeTab || $[285] !== t88) {
		t89 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
			value: activeCodeTab,
			onValueChange: setActiveCodeTab,
			className: "shrink-0",
			children: t88
		});
		$[284] = activeCodeTab;
		$[285] = t88;
		$[286] = t89;
	} else t89 = $[286];
	let t90;
	if ($[287] !== hasTerminal) {
		t90 = hasTerminal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
			label: "New terminal",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-2xs",
				LeftIcon: PlusIcon,
				leftIconSize: 12,
				"aria-label": "New terminal",
				className: "text-ed-muted-foreground",
				onClick: addTerminalTab
			})
		});
		$[287] = hasTerminal;
		$[288] = t90;
	} else t90 = $[288];
	let t91;
	if ($[289] !== t89 || $[290] !== t90) {
		t91 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: tabsScrollRef,
			className: "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:thin]",
			children: [t89, t90]
		});
		$[289] = t89;
		$[290] = t90;
		$[291] = t91;
	} else t91 = $[291];
	let t92;
	if ($[292] !== activeCodeTab || $[293] !== activeFileDirty || $[294] !== activeOpenFile || $[295] !== activeOpenSkill || $[296] !== activeSkillDirty || $[297] !== backend || $[298] !== canCreateSelectedCssFile || $[299] !== canEditSkill || $[300] !== canEditSource || $[301] !== cssDirty || $[302] !== handleCreateCssFile || $[303] !== handleSaveCssFile || $[304] !== handleSaveOpenFile || $[305] !== handleSaveOpenSkill || $[306] !== isCssActive || $[307] !== isSavingCss || $[308] !== isTerminalActive || $[309] !== onOpenVersionHistory || $[310] !== onReplaceElement || $[311] !== readOnly || $[312] !== savingFile || $[313] !== savingSkill || $[314] !== selectedCssFileExists || $[315] !== selectedElementId || $[316] !== selection.apply || $[317] !== selection.dirty || $[318] !== selection.reset) {
		t92 = !isTerminalActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			activeCodeTab === "selection" && selectedElementId && onReplaceElement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [selection.dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "xs",
				onMouseDown: _temp12$3,
				onClick: selection.reset,
				disabled: readOnly,
				LeftIcon: ArrowCounterClockwiseIcon,
				"aria-label": "Reset changes",
				children: "Reset"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
				label: "Apply JSX to the canvas",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "xs",
					onMouseDown: _temp13$3,
					onClick: selection.apply,
					disabled: readOnly || !selection.dirty,
					"aria-label": "Apply JSX to the canvas",
					children: [
						"Apply",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "⌘S" })
					]
				})
			})] }),
			activeOpenFile && onOpenVersionHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "xs",
				onClick: onOpenVersionHistory,
				LeftIcon: ClockIcon,
				"aria-label": "Version history",
				children: "History"
			}),
			isCssActive && !readOnly && backend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [canCreateSelectedCssFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
				label: "Create this CSS file and import it from the project CSS entry",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "xs",
					onClick: handleCreateCssFile,
					disabled: isSavingCss,
					LeftIcon: PlusIcon,
					"aria-label": "Create CSS file",
					children: "Create CSS file"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
				label: "Save changes to the selected CSS file",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "default",
					size: "xs",
					onClick: handleSaveCssFile,
					disabled: isSavingCss || !selectedCssFileExists || !cssDirty,
					loading: isSavingCss,
					LeftIcon: FloppyDiskIcon,
					"aria-label": "Save CSS file",
					children: isSavingCss ? "Saving..." : "Save CSS"
				})
			})] }),
			activeOpenFile && canEditSource && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
				label: "Save the file and rescan (props/canvas update)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "default",
					size: "xs",
					onClick: () => void handleSaveOpenFile(),
					disabled: savingFile || !activeFileDirty,
					loading: savingFile,
					LeftIcon: FloppyDiskIcon,
					"aria-label": "Save file",
					children: savingFile ? "Saving..." : "Save"
				})
			}),
			activeOpenSkill && canEditSkill && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
				label: "Save skill override to localStorage",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "default",
					size: "xs",
					onClick: () => void handleSaveOpenSkill(),
					disabled: savingSkill || !activeSkillDirty,
					loading: savingSkill,
					LeftIcon: FloppyDiskIcon,
					"aria-label": "Save skill",
					children: savingSkill ? "Saving..." : "Save"
				})
			})
		] });
		$[292] = activeCodeTab;
		$[293] = activeFileDirty;
		$[294] = activeOpenFile;
		$[295] = activeOpenSkill;
		$[296] = activeSkillDirty;
		$[297] = backend;
		$[298] = canCreateSelectedCssFile;
		$[299] = canEditSkill;
		$[300] = canEditSource;
		$[301] = cssDirty;
		$[302] = handleCreateCssFile;
		$[303] = handleSaveCssFile;
		$[304] = handleSaveOpenFile;
		$[305] = handleSaveOpenSkill;
		$[306] = isCssActive;
		$[307] = isSavingCss;
		$[308] = isTerminalActive;
		$[309] = onOpenVersionHistory;
		$[310] = onReplaceElement;
		$[311] = readOnly;
		$[312] = savingFile;
		$[313] = savingSkill;
		$[314] = selectedCssFileExists;
		$[315] = selectedElementId;
		$[316] = selection.apply;
		$[317] = selection.dirty;
		$[318] = selection.reset;
		$[319] = t92;
	} else t92 = $[319];
	const t93 = activeOpenFile ? `Copy source file (${GLOBAL_SHORTCUTS.copySelectionAsJsx.keyLabel})` : copyIncludesComponents ? `Copy selection with all its components (${GLOBAL_SHORTCUTS.copySelectionAsJsx.keyLabel})` : `Copy selection as JSX (${GLOBAL_SHORTCUTS.copySelectionAsJsx.keyLabel})`;
	const t94 = activeOpenFile ? false : !hasSelectedElement;
	let t95;
	if ($[320] !== copyCode) {
		t95 = () => void copyCode();
		$[320] = copyCode;
		$[321] = t95;
	} else t95 = $[321];
	const t96 = copiedKind ? CheckIcon : CopyIcon;
	const t97 = activeOpenFile ? "Copy source file" : "Copy selection as JSX";
	let t98;
	if ($[322] !== activeOpenFile || $[323] !== copiedKind) {
		t98 = copiedKind ? "Copied!" : activeOpenFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Copy source file",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: GLOBAL_SHORTCUTS.copySelectionAsJsx.keyLabel })
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Copy code",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: GLOBAL_SHORTCUTS.copySelectionAsJsx.keyLabel })
		] });
		$[322] = activeOpenFile;
		$[323] = copiedKind;
		$[324] = t98;
	} else t98 = $[324];
	let t99;
	if ($[325] !== copyingInline || $[326] !== t94 || $[327] !== t95 || $[328] !== t96 || $[329] !== t97 || $[330] !== t98) {
		t99 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			size: "xs",
			disabled: t94,
			loading: copyingInline,
			onClick: t95,
			LeftIcon: t96,
			"aria-label": t97,
			children: t98
		});
		$[325] = copyingInline;
		$[326] = t94;
		$[327] = t95;
		$[328] = t96;
		$[329] = t97;
		$[330] = t98;
		$[331] = t99;
	} else t99 = $[331];
	let t100;
	if ($[332] !== t93 || $[333] !== t99) {
		t100 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
			label: t93,
			children: t99
		});
		$[332] = t93;
		$[333] = t99;
		$[334] = t100;
	} else t100 = $[334];
	let t101;
	if ($[335] !== activeOpenFile || $[336] !== isStoreActive || $[337] !== onOpenCopySettings) {
		t101 = onOpenCopySettings && !activeOpenFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithTooltip, {
			label: "Copy code settings",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-xs",
				onClick: onOpenCopySettings,
				"aria-label": "Copy code settings",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsIcon, {})
			})
		});
		$[335] = activeOpenFile;
		$[336] = isStoreActive;
		$[337] = onOpenCopySettings;
		$[338] = t101;
	} else t101 = $[338];
	let t102;
	if ($[339] !== t100 || $[340] !== t101 || $[341] !== t92) {
		t102 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-2",
			children: [
				t92,
				t100,
				t101
			]
		});
		$[339] = t100;
		$[340] = t101;
		$[341] = t92;
		$[342] = t102;
	} else t102 = $[342];
	let t103;
	if ($[343] !== t102 || $[344] !== t91) {
		t103 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-ed-border bg-ed-muted/30 px-2 py-1",
			children: [t91, t102]
		});
		$[343] = t102;
		$[344] = t91;
		$[345] = t103;
	} else t103 = $[345];
	let t104;
	if ($[346] !== activeOpenSkill || $[347] !== breadcrumbItems || $[348] !== cssFiles || $[349] !== isCssActive || $[350] !== isTerminalActive || $[351] !== selectedCssPath) {
		t104 = isCssActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[22px] items-center gap-1.5 overflow-x-auto border-b border-ed-border bg-ed-background px-3 py-0.5",
			children: [cssFiles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: cssFiles.includes(selectedCssPath) ? selectedCssPath : "",
				onChange: (e_10) => {
					setSelectedCssPath(e_10.target.value);
					setCssLoadedPath(null);
					setCssDirty(false);
				},
				className: "h-5 max-w-[220px] rounded border border-ed-border bg-ed-background px-1.5 text-[10px] text-ed-foreground",
				children: cssFiles.map(_temp14$3)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: selectedCssPath,
				onChange: (e_11) => setSelectedCssPath(e_11.target.value),
				onBlur: () => {
					if (!selectedCssPath.trim()) setSelectedCssPath(DEFAULT_USER_CSS_PATH);
				},
				placeholder: DEFAULT_USER_CSS_PATH,
				className: "h-5 w-[220px] rounded border border-ed-border bg-ed-background px-1.5 text-[10px] font-mono text-ed-foreground placeholder:text-ed-muted-foreground"
			})]
		}) : activeOpenSkill ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-[22px] items-center gap-1.5 overflow-x-auto border-b border-ed-border bg-ed-background px-3 py-0.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
				size: "xs",
				className: "font-mono text-ed-muted-foreground",
				children: [activeOpenSkill.name, "/SKILL.md"]
			})
		}) : !isTerminalActive && breadcrumbItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorFileBreadcrumb, { items: breadcrumbItems });
		$[346] = activeOpenSkill;
		$[347] = breadcrumbItems;
		$[348] = cssFiles;
		$[349] = isCssActive;
		$[350] = isTerminalActive;
		$[351] = selectedCssPath;
		$[352] = t104;
	} else t104 = $[352];
	let t105;
	if ($[353] !== isTerminalActive || $[354] !== status) {
		t105 = !isTerminalActive && status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorStatusBar, { status });
		$[353] = isTerminalActive;
		$[354] = status;
		$[355] = t105;
	} else t105 = $[355];
	let t106;
	if ($[356] !== isTerminalActive) {
		t106 = isTerminalActive ? { display: "none" } : void 0;
		$[356] = isTerminalActive;
		$[357] = t106;
	} else t106 = $[357];
	let t107;
	if ($[358] !== activeSurface || $[359] !== codePanelOpen || $[360] !== editorExtensions || $[361] !== isCssActive || $[362] !== isLoadingCss) {
		t107 = !codePanelOpen ? null : isLoadingCss && isCssActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "sm",
				className: "text-ed-muted-foreground",
				children: "Loading CSS..."
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactCodeMirror, {
			ref: cmRef,
			onCreateEditor: restoreCodeViewPosition,
			onUpdate: (update_0) => {
				if (update_0.selectionSet) saveCodeViewPosition(update_0.view);
			},
			value: activeSurface.value,
			height: "100%",
			className: `${CODE_EDITOR_CLASS} h-full`,
			extensions: editorExtensions,
			editable: activeSurface.editable,
			onChange: onEditorChange,
			onBlur: () => {
				if (activeSurface.commitOnBlur) activeSurface.commit?.();
			},
			onKeyDown: (event_1) => {
				if (!(event_1.metaKey || event_1.ctrlKey) || event_1.key.toLowerCase() !== "s") return;
				if (!activeSurface.commit) return;
				event_1.preventDefault();
				activeSurface.commit();
			},
			basicSetup: EDITOR_BASIC_SETUP
		});
		$[358] = activeSurface;
		$[359] = codePanelOpen;
		$[360] = editorExtensions;
		$[361] = isCssActive;
		$[362] = isLoadingCss;
		$[363] = t107;
	} else t107 = $[363];
	let t108;
	if ($[364] !== t106 || $[365] !== t107) {
		t108 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-h-0 overflow-hidden",
			style: t106,
			children: t107
		});
		$[364] = t106;
		$[365] = t107;
		$[366] = t108;
	} else t108 = $[366];
	let t109;
	if ($[367] !== activeCodeTab || $[368] !== hasTerminal || $[369] !== isDark || $[370] !== isTerminalActive || $[371] !== terminalTabs) {
		t109 = hasTerminal && terminalTabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex-1 overflow-hidden",
			style: isTerminalActive ? void 0 : { display: "none" },
			children: terminalTabs.map((t_4) => {
				const isActive = activeCodeTab === t_4.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { display: isActive ? void 0 : "none" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalPanel, {
						active: isActive,
						initialCommand: t_4.initialCommand,
						cwd: t_4.cwd,
						theme: isDark ? DARK_TERMINAL_THEME : LIGHT_TERMINAL_THEME
					})
				}, t_4.id);
			})
		});
		$[367] = activeCodeTab;
		$[368] = hasTerminal;
		$[369] = isDark;
		$[370] = isTerminalActive;
		$[371] = terminalTabs;
		$[372] = t109;
	} else t109 = $[372];
	let t110;
	if ($[373] !== t103 || $[374] !== t104 || $[375] !== t105 || $[376] !== t108 || $[377] !== t109) {
		t110 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full flex flex-col bg-ed-background",
			children: [
				t103,
				t104,
				t105,
				t108,
				t109
			]
		});
		$[373] = t103;
		$[374] = t104;
		$[375] = t105;
		$[376] = t108;
		$[377] = t109;
		$[378] = t110;
	} else t110 = $[378];
	return t110;
}
function _temp14$3(path_5) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
		value: path_5,
		children: path_5
	}, path_5);
}
function _temp13$3(e_9) {
	return e_9.preventDefault();
}
function _temp12$3(e_8) {
	return e_8.preventDefault();
}
function _temp11$4(e_6) {
	return e_6.stopPropagation();
}
function _temp10$4(e_4) {
	return e_4.stopPropagation();
}
function _temp1$4(e_2) {
	return e_2.stopPropagation();
}
function _temp0$4() {}
function _temp8$7(path_4) {
	return !isProjectCssEntry(path_4);
}
function _temp7$9(err_0) {
	toast.error("Could not copy code", { description: err_0 instanceof Error ? err_0.message : String(err_0) });
}
function _temp6$11() {
	return false;
}
function _temp5$15() {
	return true;
}
function _temp4$17(value) {
	return new Blob([value], { type: "text/plain" });
}
async function _temp3$17(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const ta = document.createElement("textarea");
		ta.value = text;
		ta.style.position = "fixed";
		ta.style.opacity = "0";
		document.body.appendChild(ta);
		ta.select();
		document.execCommand("copy");
		document.body.removeChild(ta);
	}
}
function _temp2$21() {
	return typeof window !== "undefined" && !!window.api ? [{
		id: `tt-${Date.now().toString(36)}-1`,
		num: 1
	}] : [];
}
function _temp$36() {
	return typeof window !== "undefined" && !!window.api;
}

export { BottomBar };
