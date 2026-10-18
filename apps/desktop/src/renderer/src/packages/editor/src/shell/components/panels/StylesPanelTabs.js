// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/StylesPanelTabs.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { SimpleTabs, Tabs, TabsContent, TabsTrigger } from "../../../../../ui/src/components/Tabs.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { getById } from "../../../../../compiler/src/store/read.js";
import { ExportPanel } from "./ExportPanel.js";
import { useActiveTool } from "../../../shared/state/activeTool.js";
import { CodeView } from "./styles/tabs/CodeView.js";
import { DesignTab } from "./styles/tabs/DesignTab.js";
import { SelectionColorsSection } from "./styles/sections/SelectionColorsSection.js";

var EMPTY_SELECTED_IDS$1 = /* @__PURE__ */ new Set();
function StylesPanelTabs(t0) {
	const $ = (0, import_compiler_runtime.c)(63);
	const { onUpdateExportSettings, onExported, exportRequest: t1, onExportRequestHandled, selectedElementId, selectedElementIds: t2, store, onUpdateElementStyles, onUpdateElementProps, onUpdateElement, onUpdateMultipleElementsProps, onUpdateMultipleElementsStyles, onUpdateMultipleElements, onSelectElements, onUpdateElementPositions, onToggleTextFormat, textSelectionState, readOnly: t3, fonts, propsPanel, header, headerActions, showStyles: t4 } = t0;
	const exportRequest = t1 === void 0 ? null : t1;
	const selectedElementIds = t2 === void 0 ? EMPTY_SELECTED_IDS$1 : t2;
	const readOnly = t3 === void 0 ? false : t3;
	const showStyles = t4 === void 0 ? true : t4;
	const { scaleFocusVersion } = useActiveTool();
	const [view, setView] = (0, import_react.useState)(showStyles ? "design" : propsPanel ? "props" : "inspect");
	const [previousScaleFocus, setPreviousScaleFocus] = (0, import_react.useState)(scaleFocusVersion);
	if (previousScaleFocus !== scaleFocusVersion) {
		setPreviousScaleFocus(scaleFocusVersion);
		setView("design");
	}
	const [previousExportRequest, setPreviousExportRequest] = (0, import_react.useState)(exportRequest);
	if (previousExportRequest !== exportRequest) {
		setPreviousExportRequest(exportRequest);
		if (exportRequest && showStyles) setView("design");
	}
	let t5;
	if ($[0] !== selectedElementId || $[1] !== store) {
		t5 = selectedElementId ? getById(store, selectedElementId) ?? null : null;
		$[0] = selectedElementId;
		$[1] = store;
		$[2] = t5;
	} else t5 = $[2];
	const element = t5;
	const isMultiSelect = selectedElementIds.size > 1;
	let t6;
	let t7;
	if ($[3] !== propsPanel || $[4] !== showStyles || $[5] !== view) {
		t6 = () => {
			if (!showStyles && view === "design") setView(propsPanel ? "props" : "inspect");
			else if (!propsPanel && view === "props") setView(showStyles ? "design" : "inspect");
		};
		t7 = [
			propsPanel,
			showStyles,
			view
		];
		$[3] = propsPanel;
		$[4] = showStyles;
		$[5] = view;
		$[6] = t6;
		$[7] = t7;
	} else {
		t6 = $[6];
		t7 = $[7];
	}
	import_react.useEffect(t6, t7);
	let selectedElements;
	if ($[8] !== isMultiSelect || $[9] !== selectedElementIds || $[10] !== store) {
		selectedElements = isMultiSelect ? [] : void 0;
		if (selectedElements) for (const id of selectedElementIds) {
			const el = getById(store, id);
			if (el) selectedElements.push(el);
		}
		$[8] = isMultiSelect;
		$[9] = selectedElementIds;
		$[10] = store;
		$[11] = selectedElements;
	} else selectedElements = $[11];
	if (!selectedElementId && !isMultiSelect) {
		let t8;
		if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
			t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full flex flex-col overflow-hidden",
				"data-text-edit-safe": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 flex items-center justify-center p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] text-ed-muted-foreground text-center",
						children: "Select an element"
					})
				})
			});
			$[12] = t8;
		} else t8 = $[12];
		return t8;
	}
	let t8;
	if ($[13] !== selectedElementId || $[14] !== selectedElementIds) {
		t8 = selectedElementId || Array.from(selectedElementIds)[0];
		$[13] = selectedElementId;
		$[14] = selectedElementIds;
		$[15] = t8;
	} else t8 = $[15];
	const effectiveId = t8;
	let t9;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = (value) => setView(value);
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== showStyles) {
		t10 = showStyles && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
			value: "design",
			children: "Styles"
		});
		$[17] = showStyles;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] !== propsPanel) {
		t11 = propsPanel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
			value: "props",
			children: "Props"
		});
		$[19] = propsPanel;
		$[20] = t11;
	} else t11 = $[20];
	let t12;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
			value: "inspect",
			children: "Inspect"
		});
		$[21] = t12;
	} else t12 = $[21];
	let t13;
	if ($[22] !== t10 || $[23] !== t11) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SimpleTabs, {
			size: "xs",
			className: "w-fit shrink-0",
			children: [
				t10,
				t11,
				t12
			]
		});
		$[22] = t10;
		$[23] = t11;
		$[24] = t13;
	} else t13 = $[24];
	let t14;
	if ($[25] !== headerActions || $[26] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "z-10 flex min-w-0 shrink-0 items-center justify-between gap-1 border-b border-ed-divider bg-ed-background px-3 pb-3",
			children: [t13, headerActions]
		});
		$[25] = headerActions;
		$[26] = t13;
		$[27] = t14;
	} else t14 = $[27];
	let t15;
	if ($[28] !== effectiveId || $[29] !== element || $[30] !== exportRequest || $[31] !== fonts || $[32] !== onExportRequestHandled || $[33] !== onExported || $[34] !== onSelectElements || $[35] !== onToggleTextFormat || $[36] !== onUpdateElement || $[37] !== onUpdateElementPositions || $[38] !== onUpdateElementProps || $[39] !== onUpdateElementStyles || $[40] !== onUpdateExportSettings || $[41] !== onUpdateMultipleElements || $[42] !== onUpdateMultipleElementsProps || $[43] !== onUpdateMultipleElementsStyles || $[44] !== readOnly || $[45] !== selectedElements || $[46] !== showStyles || $[47] !== store || $[48] !== textSelectionState) {
		t15 = showStyles && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "design",
			className: "w-full min-w-0 max-w-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
				className: "h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesignTab, {
						element,
						selectedElementId: effectiveId,
						selectedElements,
						store,
						onUpdateElementStyles,
						onUpdateElementProps,
						onUpdateElement,
						onUpdateMultipleElementsStyles,
						onUpdateElementPositions,
						onUpdateMultipleElementsProps,
						onToggleTextFormat,
						textSelectionState,
						readOnly,
						fonts
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionColorsSection, {
						store,
						rootIds: selectedElements?.map(_temp$57) ?? [effectiveId],
						onUpdateMultipleElements: readOnly ? void 0 : onUpdateMultipleElements,
						onSelectElements
					}),
					onUpdateExportSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportPanel, {
						elements: selectedElements ?? (element ? [element] : []),
						onUpdateSettings: onUpdateExportSettings,
						onExported,
						readOnly,
						exportRequest,
						onExportRequestHandled
					}, (selectedElements?.map(_temp2$37) ?? [effectiveId]).join(",")),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: "h-[200px] shrink-0"
					})
				]
			})
		});
		$[28] = effectiveId;
		$[29] = element;
		$[30] = exportRequest;
		$[31] = fonts;
		$[32] = onExportRequestHandled;
		$[33] = onExported;
		$[34] = onSelectElements;
		$[35] = onToggleTextFormat;
		$[36] = onUpdateElement;
		$[37] = onUpdateElementPositions;
		$[38] = onUpdateElementProps;
		$[39] = onUpdateElementStyles;
		$[40] = onUpdateExportSettings;
		$[41] = onUpdateMultipleElements;
		$[42] = onUpdateMultipleElementsProps;
		$[43] = onUpdateMultipleElementsStyles;
		$[44] = readOnly;
		$[45] = selectedElements;
		$[46] = showStyles;
		$[47] = store;
		$[48] = textSelectionState;
		$[49] = t15;
	} else t15 = $[49];
	let t16;
	if ($[50] !== propsPanel) {
		t16 = propsPanel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "props",
			className: "w-full min-w-0 max-w-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
				className: "h-full",
				children: [propsPanel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: "h-[200px] shrink-0"
				})]
			})
		});
		$[50] = propsPanel;
		$[51] = t16;
	} else t16 = $[51];
	let t17;
	if ($[52] !== effectiveId || $[53] !== element || $[54] !== selectedElements) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
			value: "inspect",
			className: "w-full min-w-0 max-w-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeView, {
				element,
				selectedElementId: effectiveId,
				selectedElements
			})
		});
		$[52] = effectiveId;
		$[53] = element;
		$[54] = selectedElements;
		$[55] = t17;
	} else t17 = $[55];
	let t18;
	if ($[56] !== header || $[57] !== t14 || $[58] !== t15 || $[59] !== t16 || $[60] !== t17 || $[61] !== view) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: view,
			onValueChange: t9,
			className: "min-h-0 w-full min-w-0 max-w-full flex-1 overflow-hidden flex flex-col",
			"data-text-edit-safe": "true",
			"data-inspector-panel": "",
			children: [
				t14,
				header,
				t15,
				t16,
				t17
			]
		});
		$[56] = header;
		$[57] = t14;
		$[58] = t15;
		$[59] = t16;
		$[60] = t17;
		$[61] = view;
		$[62] = t18;
	} else t18 = $[62];
	return t18;
}
function _temp2$37(el_1) {
	return el_1.id;
}
function _temp$57(el_0) {
	return el_0.id;
}

export { StylesPanelTabs };
