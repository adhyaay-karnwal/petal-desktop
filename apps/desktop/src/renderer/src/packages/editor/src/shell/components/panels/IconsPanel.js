// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/IconsPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { PackageIcon, SearchIcon, SettingsIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../../../ui/src/components/InputGroup.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../ui/src/components/Select.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { generatePrefixedId } from "../../../shared/utils/idUtils.js";
import { PanelSearchInput } from "./PanelSearchInput.js";
import { useVirtualizer } from "../../../../../../vendor/@tanstack/react-virtual.js";
import { PanelEmptyState } from "./PanelEmptyState.js";
import { extractIconNames, searchIcons } from "../../utils/iconUtils.js";

var GRID_COLUMNS = 4;
var ICON_CELL_SIZE = 88;
function IconsPanel({ iconLibraries, onOpenIconSettings, onAskAI, onAddElement, readOnly = false, variant = "default", searchValue }) {
	"use no memo";
	const [editedQuery, setEditedQuery] = (0, import_react.useState)(null);
	const searchQuery = editedQuery ?? searchValue ?? "";
	const setSearchQuery = setEditedQuery;
	const [selectedLibraryState, setSelectedLibrary] = (0, import_react.useState)(() => Object.keys(iconLibraries)[0] || "");
	const parentRef = (0, import_react.useRef)(null);
	const searchInputRef = (0, import_react.useRef)(null);
	const sidebarV2 = variant === "sidebar-v2";
	const iconCellSize = sidebarV2 ? 76 : ICON_CELL_SIZE;
	const selectedLibrary = iconLibraries[selectedLibraryState] ? selectedLibraryState : Object.keys(iconLibraries)[0] || "";
	(0, import_react.useEffect)(() => {
		if (!sidebarV2) return;
		requestAnimationFrame(() => searchInputRef.current?.focus());
	}, [sidebarV2]);
	const libraryConfig = iconLibraries[selectedLibrary];
	const filteredIcons = searchIcons(libraryConfig ? extractIconNames(libraryConfig.icons, libraryConfig.iconNames) : [], searchQuery);
	const virtualizer = useVirtualizer({
		count: Math.ceil(filteredIcons.length / GRID_COLUMNS),
		getScrollElement: () => parentRef.current,
		estimateSize: () => iconCellSize,
		overscan: 5
	});
	const createIconElement = (iconName) => ({
		id: generatePrefixedId("icon"),
		type: "icon",
		library: selectedLibrary,
		iconName,
		props: { ...libraryConfig?.defaultProps },
		styles: {}
	});
	const handleIconClick = (iconName_0) => {
		onAddElement(createIconElement(iconName_0));
	};
	if (!(Object.keys(iconLibraries).length > 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "flex-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelEmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageIcon, {
				width: 24,
				height: 24,
				className: "text-ed-muted-foreground"
			}),
			title: "Set up icon library",
			description: "Find icon packs for React and add them to this file",
			actions: !readOnly && (onOpenIconSettings || onAskAI) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [onOpenIconSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				onClick: onOpenIconSettings,
				className: "w-full",
				children: "Set up icons"
			}), onAskAI && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				size: "xs",
				onClick: onAskAI,
				className: "w-full",
				children: "Ask AI"
			})] }) : void 0
		})
	});
	const hasSettings = !!onOpenIconSettings;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$2("w-full flex flex-col flex-1 overflow-hidden", sidebarV2 ? "pt-0" : "pt-1"),
		children: [
			readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-2 bg-ed-muted/50 border-b border-ed-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "xs",
					variant: "tertiary",
					children: "View only - cannot add icons"
				})
			}),
			sidebarV2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn$2("flex shrink-0 items-center gap-2 p-3", readOnly && "pointer-events-none opacity-50"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
					size: "xs",
					className: "flex-1 shadow-none focus-within:ring-0!",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
						align: "inline-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
							width: 16,
							height: 16,
							className: "size-4 text-ed-foreground-secondary"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
						ref: searchInputRef,
						value: searchQuery,
						onChange: (event) => setSearchQuery(event.target.value),
						onKeyDown: (event_0) => {
							if (event_0.nativeEvent.isComposing || event_0.keyCode === 229) return;
							if (event_0.key === "Escape") setSearchQuery("");
						},
						placeholder: "Find...",
						"aria-label": "Find icons"
					})]
				}), searchQuery.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "icon-xs",
					variant: "ghost",
					isChildText: false,
					className: "text-ed-foreground-secondary hover:text-ed-foreground",
					onClick: () => setSearchQuery(""),
					"aria-label": "Clear icon search",
					title: "Clear search",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `px-3 pb-2 border-b border-ed-border space-y-2 ${readOnly ? "opacity-50 pointer-events-none" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [Object.keys(iconLibraries).length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedLibrary,
							onValueChange: setSelectedLibrary,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select library" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(iconLibraries).map(([key, config]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: key,
								children: config.displayName || key
							}, key)) })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "xs",
							variant: "secondary",
							className: "flex-1",
							children: iconLibraries[Object.keys(iconLibraries)[0]]?.displayName || Object.keys(iconLibraries)[0]
						}), hasSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							title: "Open icon settings",
							onClick: onOpenIconSettings,
							isChildText: false,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsIcon, {
								width: 16,
								height: 16
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSearchInput, {
						value: searchQuery,
						onChange: setSearchQuery,
						placeholder: "Search icons..."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
						size: "xs",
						variant: "tertiary",
						children: [filteredIcons.length, " icons"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				viewportRef: parentRef,
				className: cn$2("flex-1", sidebarV2 && "pt-1", readOnly && "pointer-events-none opacity-50"),
				children: filteredIcons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: sidebarV2 ? "3xs" : "sm",
						variant: "tertiary",
						children: searchQuery ? "No icons found" : "No icons available"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						height: virtualizer.getTotalSize(),
						width: "100%",
						position: "relative"
					},
					children: virtualizer.getVirtualItems().map((virtualRow) => {
						const startIndex = virtualRow.index * GRID_COLUMNS;
						const rowIcons = filteredIcons.slice(startIndex, startIndex + GRID_COLUMNS);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: iconCellSize,
								transform: `translateY(${virtualRow.start}px)`,
								display: "grid",
								gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
								gap: sidebarV2 ? 4 : void 0,
								paddingLeft: sidebarV2 ? 12 : void 0,
								paddingRight: sidebarV2 ? 12 : void 0
							},
							children: rowIcons.map((iconName_1) => {
								const IconComponent = libraryConfig?.icons?.[iconName_1];
								if (!IconComponent) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "text",
									onClick: () => handleIconClick(iconName_1),
									className: cn$2("flex w-full min-w-0 flex-col items-center justify-start overflow-hidden rounded", sidebarV2 ? "h-[72px] gap-1.5 p-2 text-[11px] font-normal text-ed-foreground-secondary hover:bg-ed-accent hover:text-ed-foreground" : "h-full p-2 hover:bg-ed-accent"),
									title: iconName_1,
									isChildText: false,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn$2("flex w-full items-center justify-center overflow-hidden", sidebarV2 ? "h-6" : "h-9"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, {
											size: 24,
											width: 24,
											height: 24,
											className: "max-h-6 max-w-6 shrink-0",
											...libraryConfig?.defaultProps
										})
									}), sidebarV2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-full max-w-full truncate text-center",
										children: iconName_1
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
										size: "3xs",
										weight: "regular",
										variant: "tertiary",
										className: "mt-1 w-full max-w-full truncate text-center",
										children: iconName_1
									})]
								}, iconName_1);
							})
						}, virtualRow.key);
					})
				})
			})
		]
	});
}

export { IconsPanel };
