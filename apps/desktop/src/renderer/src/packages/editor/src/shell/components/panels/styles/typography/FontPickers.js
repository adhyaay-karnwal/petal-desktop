// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/typography/FontPickers.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { __bundledVitePreload } from "../../../../../../../../__bundle__/_vite_preload_helper.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { CaretDownIcon, CheckIcon, FontIcon, FontWeightIcon, SearchIcon, SpinnerIcon } from "../../../../../../../ui/src/icons.js";
import { Button } from "../../../../../../../ui/src/components/Button.js";
import { ScrollArea } from "../../../../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../../../../vendor/sonner.js";
import { Popover, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { INSPECTOR_CONTROL_TEXT_STYLE, InspectorControlAction, InspectorControlShell } from "../primitives.js";
import { InspectorPopoverContent, InspectorPopoverHeader, InspectorPopoverItem, InspectorPopoverMenu, InspectorPopoverSearch } from "../InspectorPopover.js";
import { InspectorDropdown } from "../inputs/parts/InspectorDropdown.js";
import { useFontEnvironment } from "../../../../contexts/FontContext.js";
import { formatFontWeight, getFontDisplayName, getFontWeightMenuValues, getLocalFontWeights, parseFontWeight } from "../../../../utils/typography.js";
import { useVirtualizer } from "../../../../../../../../vendor/@tanstack/react-virtual.js";
import { googleFonts_exports } from "../../../../../../../compiler/src/runtime/googleFonts.js";
import { createGoogleFontPreviewLoader, getFontPreviewBatches } from "../../../../utils/fontLoader.js";
import { cssString } from "../../../../../../../compiler/src/runtime/fontTypes.js";
import { getFontPickerRows } from "../../../../utils/fontPickerRows.js";

/**
* Font family + weight pickers for the Typography section.
*
* FontFamilyPicker — popover with All, Local, and Google Fonts source filters
* (families applied as inline font-family) and a Project option (searchable
* Tailwind font utility classes — font-sans/serif/mono plus a font-<name> per
* configured project font — applied as a className). FontWeightPicker — popover
* listing the weights a family offers (passed in by the caller), at weight.
*/
var FONT_SOURCES = [
	{
		value: "all",
		label: "All fonts"
	},
	{
		value: "local",
		label: "Local"
	},
	{
		value: "google",
		label: "Google Fonts"
	},
	{
		value: "library",
		label: "Project"
	}
];
var FONT_H = 32;
var googleFontsPromise = null;
function loadGoogleFonts() {
	if (googleFontsPromise) return googleFontsPromise;
	const request = __bundledVitePreload(() => Promise.resolve().then(() => googleFonts_exports), void 0, import.meta.url);
	googleFontsPromise = request;
	request.catch(() => {
		if (googleFontsPromise === request) googleFontsPromise = null;
	});
	return request;
}
function FontWeightPicker(t0) {
	const $ = (0, import_compiler_runtime.c)(1);
	const { family, value, fontStyle, fonts, isMixed, onChange } = t0;
	const currentWeight = isMixed ? void 0 : parseFontWeight(value);
	const localWeights = getLocalFontWeights(family, fontStyle || "normal", fonts);
	const [catalogResult, setCatalogResult] = (0, import_react.useState)();
	const loadGoogleWeights = (open) => {
		if (!open || localWeights !== void 0 || catalogResult?.family === family && catalogResult.fontStyle === fontStyle) return;
		const requestedFamily = family;
		loadGoogleFonts().then((t1) => {
			const { GOOGLE_FONTS } = t1;
			const match = GOOGLE_FONTS.find((font) => font.family.toLowerCase() === requestedFamily.toLowerCase());
			setCatalogResult({
				family: requestedFamily,
				fontStyle,
				weights: fontStyle === "italic" ? match?.italicWeights?.length ? match.italicWeights : match?.weights : match?.weights
			});
		}).catch(() => setCatalogResult({
			family: requestedFamily,
			fontStyle
		}));
	};
	const availableWeights = localWeights ?? (catalogResult?.family === family && catalogResult.fontStyle === fontStyle ? catalogResult.weights : void 0);
	const menuWeights = getFontWeightMenuValues(availableWeights, currentWeight);
	const availableSet = availableWeights === void 0 ? void 0 : new Set(availableWeights);
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontWeightIcon, { className: "shrink-0 text-ed-inspector-chrome" });
		$[0] = t2;
	} else t2 = $[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
		label: "Font weight",
		value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: isMixed ? "-" : formatFontWeight(currentWeight ?? 400)
			})]
		}),
		className: "w-full",
		onOpenChange: loadGoogleWeights,
		selectedValue: String(currentWeight ?? 400),
		isMixed,
		options: menuWeights.map((weight) => {
			const isAvailable = availableSet === void 0 || availableSet.has(weight) || weight === currentWeight;
			return {
				value: String(weight),
				label: formatFontWeight(weight),
				disabled: !isAvailable
			};
		}),
		onValueChange: onChange
	});
}
function FontFamilyPicker({ value, onChange, onSelectClass, activeClass, fonts, inheritedFamily, isMixed }) {
	"use no memo";
	const environment = useFontEnvironment();
	const [selecting, setSelecting] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [sourceFilter, setSourceFilter] = (0, import_react.useState)("all");
	const showLocalFonts = sourceFilter === "all" || sourceFilter === "local";
	const showGoogleFonts = sourceFilter === "all" || sourceFilter === "google";
	const triggerRef = (0, import_react.useRef)(null);
	const searchRef = (0, import_react.useRef)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [libSearch, setLibSearch] = (0, import_react.useState)("");
	const [catalog, setCatalog] = (0, import_react.useState)([]);
	const [catalogStatus, setCatalogStatus] = (0, import_react.useState)("idle");
	const displayName = isMixed ? "-" : getFontDisplayName(value, fonts);
	(0, import_react.useEffect)(() => {
		if (!open || !showGoogleFonts || !environment.googleFontsEnabled || catalogStatus !== "idle") return;
		setCatalogStatus("loading");
		loadGoogleFonts().then((m) => {
			setCatalog(m.GOOGLE_FONTS);
			setCatalogStatus("ready");
		}).catch(() => setCatalogStatus("error"));
	}, [
		open,
		showGoogleFonts,
		catalogStatus,
		environment.googleFontsEnabled
	]);
	const handleSelectFont = async (font) => {
		setSelecting(true);
		try {
			onChange(cssString(font.source === "local" ? await environment.selectLocalFamily(font.name) : font.family));
			setOpen(false);
			setSearch("");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not load this font.");
		}
		setSelecting(false);
	};
	const handleSelectClass = (cls) => {
		onSelectClass?.(cls);
		setOpen(false);
	};
	const rows = (0, import_react.useMemo)(() => getFontPickerRows({
		filter: sourceFilter,
		search,
		catalog,
		fonts,
		environment
	}), [
		sourceFilter,
		search,
		catalog,
		fonts,
		environment
	]);
	const scrollRef = (0, import_react.useRef)(null);
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => FONT_H,
		overscan: 8
	});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const raf = requestAnimationFrame(() => rowVirtualizer.measure());
		return () => cancelAnimationFrame(raf);
	}, [
		open,
		sourceFilter,
		rows.length,
		rowVirtualizer
	]);
	const virtualItems = rowVirtualizer.getVirtualItems();
	const previewLoader = (0, import_react.useMemo)(() => createGoogleFontPreviewLoader(), []);
	const firstPreviewIndex = virtualItems[0]?.index ?? 0;
	const lastPreviewIndex = virtualItems[virtualItems.length - 1]?.index ?? 12;
	(0, import_react.useEffect)(() => {
		previewLoader.sync(open && showGoogleFonts ? getFontPreviewBatches(rows, firstPreviewIndex, lastPreviewIndex) : []);
	}, [
		previewLoader,
		rows,
		firstPreviewIndex,
		lastPreviewIndex,
		open,
		showGoogleFonts
	]);
	(0, import_react.useEffect)(() => () => previewLoader.clear(), [previewLoader]);
	const libraryFonts = fonts ? [...fonts.google.filter((f) => f.variable).map((f_0) => ({
		name: f_0.name.replace(/_/g, " "),
		variable: f_0.variable
	})), ...fonts.local.filter((f_1) => f_1.variable).map((f_2) => ({
		name: f_2.name,
		variable: f_2.variable
	}))] : [];
	const fontClasses = (() => {
		const base = [
			{
				cls: "font-sans",
				label: "Sans",
				preview: "ui-sans-serif, system-ui, sans-serif"
			},
			{
				cls: "font-serif",
				label: "Serif",
				preview: "ui-serif, Georgia, serif"
			},
			{
				cls: "font-mono",
				label: "Mono",
				preview: "ui-monospace, monospace"
			}
		];
		const project = libraryFonts.map(({ name, variable }) => ({
			cls: variable.replace(/^--/, ""),
			label: name,
			preview: `${name}, system-ui, sans-serif`
		}));
		const seen = /* @__PURE__ */ new Set();
		return [...base, ...project].filter((c) => seen.has(c.cls) ? false : (seen.add(c.cls), true));
	})();
	const filteredClasses = libSearch ? fontClasses.filter((c_0) => c_0.cls.toLowerCase().includes(libSearch.toLowerCase()) || c_0.label.toLowerCase().includes(libSearch.toLowerCase())) : fontClasses;
	const hasFonts = sourceFilter === "library" ? fontClasses.length > 0 : (search.trim() ? getFontPickerRows({
		filter: sourceFilter,
		search: "",
		catalog,
		fonts,
		environment
	}) : rows).length > 0;
	(0, import_react.useEffect)(() => {
		if (open && hasFonts) searchRef.current?.focus({ preventScroll: true });
	}, [open, hasFonts]);
	const handleEnableLocalFonts = async () => {
		setOpen(false);
		if (await environment.enableLocalFonts() && triggerRef.current?.isConnected) setOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: async (nextOpen) => {
			if (nextOpen) {
				if (!await environment.openPicker() || !triggerRef.current?.isConnected) return;
				if (catalogStatus === "error") setCatalogStatus("idle");
				setSearch("");
				setLibSearch("");
				setOpen(true);
			} else {
				setOpen(false);
				setSearch("");
				setLibSearch("");
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			active: open,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlAction, {
					ref: triggerRef,
					title: "Font family",
					className: "min-w-0 flex-1 justify-between gap-1 px-1 font-normal text-ed-inspector-value",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontIcon, { className: "shrink-0 text-ed-inspector-chrome" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn$2("min-w-0 flex-1 truncate text-left", !displayName && "text-ed-muted-foreground/50 font-normal"),
							children: displayName || inheritedFamily || "Inter"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "shrink-0 text-ed-inspector-chrome" })
					]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverContent, {
			"aria-label": "Font picker",
			align: "center",
			className: "h-96 pb-0",
			onOpenAutoFocus: (e) => {
				e.preventDefault();
				searchRef.current?.focus({ preventScroll: true });
			},
			onCloseAutoFocus: (e_0) => {
				e_0.preventDefault();
				triggerRef.current?.blur();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverHeader, {
						closeLabel: "Close font picker",
						onClose: () => setOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverMenu, {
							label: "Font source",
							value: sourceFilter,
							options: FONT_SOURCES,
							onValueChange: (value_0) => {
								setSourceFilter(value_0);
								if (scrollRef.current) scrollRef.current.scrollTop = 0;
							},
							onCloseAutoFocus: (event) => {
								event.preventDefault();
								searchRef.current?.focus({ preventScroll: true });
							}
						})
					}),
					hasFonts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverSearch, {
						ref: searchRef,
						"aria-label": sourceFilter === "library" ? "Search project fonts" : "Search fonts",
						placeholder: sourceFilter === "library" ? "Search classes..." : "Search fonts...",
						value: sourceFilter === "library" ? libSearch : search,
						onChange: (event_0) => sourceFilter === "library" ? setLibSearch(event_0.target.value) : setSearch(event_0.target.value)
					}),
					sourceFilter !== "library" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn$2("flex flex-col gap-3 m-0 min-h-0", rows.length > 0 && "pt-1"),
						style: { flex: 1 },
						children: [
							rows.length > 0 && showLocalFonts && environment.localLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								role: "status",
								style: INSPECTOR_CONTROL_TEXT_STYLE,
								className: "flex items-center gap-2 px-1.5 pt-1.5 text-ed-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
									"aria-hidden": "true",
									className: "size-3 shrink-0 animate-spin"
								}), "Loading local fonts…"]
							}),
							rows.length > 0 && showLocalFonts && environment.localError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								role: "alert",
								className: "px-1.5 text-xs text-ed-destructive",
								children: [
									environment.localError,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void environment.openPicker(),
										className: "underline underline-offset-4",
										children: "Retry discovery"
									})
								]
							}),
							rows.length > 0 && showGoogleFonts && environment.googleFontsEnabled && catalogStatus === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								role: "alert",
								className: "px-1.5 text-xs text-ed-destructive",
								children: [
									"Couldn’t load Google Fonts.",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setCatalogStatus("idle"),
										className: "underline underline-offset-4",
										children: "Retry"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								viewportRef: scrollRef,
								className: "min-h-0 flex-1",
								viewportClassName: !rows.length ? "[&>div]:h-full" : void 0,
								children: !rows.length && (environment.projectFontsLoading || showLocalFonts && environment.localLoading || showGoogleFonts && environment.googleFontsEnabled && (catalogStatus === "idle" || catalogStatus === "loading")) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									role: "status",
									style: INSPECTOR_CONTROL_TEXT_STYLE,
									className: "flex min-h-full items-center justify-center gap-2 px-5 py-8 text-ed-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
										"aria-hidden": "true",
										className: "size-3 shrink-0 animate-spin"
									}), showLocalFonts && environment.localLoading ? "Loading local fonts…" : "Loading fonts…"]
								}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontPickerEmptyState, {
									source: sourceFilter,
									search: hasFonts ? search : "",
									googleEnabled: environment.googleFontsEnabled,
									onEnableGoogle: environment.enableGoogleFonts,
									onEnableLocal: environment.canEnableLocalFonts ? handleEnableLocalFonts : void 0,
									localEnabled: environment.localEnabled,
									localAllowed: environment.localFontsAllowed,
									desktop: environment.desktop,
									error: environment.projectFontsError ? environment.projectFontsError : showLocalFonts && environment.localError ? environment.localError : showGoogleFonts && environment.googleFontsEnabled && catalogStatus === "error" ? "Couldn’t load Google Fonts." : void 0,
									onRetry: () => {
										if (environment.projectFontsError) environment.retryProjectFonts?.();
										else if (showLocalFonts && environment.localError) environment.openPicker();
										else setCatalogStatus("idle");
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										height: rowVirtualizer.getTotalSize(),
										position: "relative"
									},
									children: virtualItems.map((vi) => {
										const row = rows[vi.index];
										const common = {
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: vi.size,
											transform: `translateY(${vi.start}px)`
										};
										const isActive = getFontDisplayName(value, fonts).toLowerCase() === row.name.toLowerCase();
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverItem, {
											disabled: selecting,
											selected: isActive,
											onClick: () => void handleSelectFont(row),
											style: common,
											className: "justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate text-sm",
												style: { fontFamily: `${cssString(row.source === "local" ? row.name : row.family)}, sans-serif` },
												children: row.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex shrink-0 items-center gap-2 text-[10px]",
												children: isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, { className: "shrink-0" })
											})]
										}, vi.key);
									})
								})
							})
						]
					}),
					sourceFilter === "library" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn$2("flex flex-col gap-3 m-0 min-h-0", filteredClasses.length > 0 && "pt-1"),
						style: { flex: 1 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "min-h-0",
							style: { flex: 1 },
							viewportClassName: !filteredClasses.length ? "[&>div]:h-full" : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn$2("flex flex-col gap-px", !filteredClasses.length && "h-full"),
								children: [!filteredClasses.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontPickerEmptyState, {
									source: "library",
									search: libSearch
								}), filteredClasses.map(({ cls: cls_0, label, preview }) => {
									const isActive_0 = activeClass === cls_0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverItem, {
										selected: isActive_0,
										onClick: () => handleSelectClass(cls_0),
										className: "justify-between py-[5px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-normal",
												style: { fontFamily: preview },
												children: label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[10px] text-ed-muted-foreground",
												children: cls_0
											})]
										}), isActive_0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {})]
									}, cls_0);
								})]
							})
						})
					})
				]
			})
		})]
	});
}
function FontPickerEmptyState(t0) {
	const $ = (0, import_compiler_runtime.c)(41);
	const { source, search, googleEnabled: t1, localEnabled: t2, localAllowed: t3, desktop: t4, error, onRetry, onEnableGoogle, onEnableLocal } = t0;
	const googleEnabled = t1 === void 0 ? true : t1;
	const localEnabled = t2 === void 0 ? false : t2;
	const localAllowed = t3 === void 0 ? true : t3;
	const desktop = t4 === void 0 ? false : t4;
	const [enablingGoogle, setEnablingGoogle] = (0, import_react.useState)(false);
	const [enableError, setEnableError] = (0, import_react.useState)("");
	let t5;
	if ($[0] !== onEnableGoogle) {
		t5 = async function enableGoogle() {
			if (!onEnableGoogle) return;
			setEnableError("");
			setEnablingGoogle(true);
			try {
				await onEnableGoogle();
			} catch (t6) {
				const error_0 = t6;
				setEnableError(error_0 instanceof Error ? error_0.message : "Couldn’t enable Google Fonts.");
			}
			setEnablingGoogle(false);
		};
		$[0] = onEnableGoogle;
		$[1] = t5;
	} else t5 = $[1];
	const enableGoogle = t5;
	let t6;
	if ($[2] !== error || $[3] !== googleEnabled || $[4] !== onEnableGoogle || $[5] !== search || $[6] !== source) {
		t6 = !error && !search.trim() && !googleEnabled && source !== "local" && source !== "library" && !!onEnableGoogle;
		$[2] = error;
		$[3] = googleEnabled;
		$[4] = onEnableGoogle;
		$[5] = search;
		$[6] = source;
		$[7] = t6;
	} else t6 = $[7];
	const showGoogleAction = t6;
	let t7;
	if ($[8] !== error || $[9] !== localEnabled || $[10] !== onEnableLocal || $[11] !== search || $[12] !== source) {
		t7 = !error && !search.trim() && !localEnabled && (source === "all" || source === "local") && !!onEnableLocal;
		$[8] = error;
		$[9] = localEnabled;
		$[10] = onEnableLocal;
		$[11] = search;
		$[12] = source;
		$[13] = t7;
	} else t7 = $[13];
	const showLocalAction = t7;
	let title = "No fonts available";
	let description = showGoogleAction || showLocalAction ? "Enable a font source to start browsing." : "Choose Project to browse the project’s font styles.";
	if (error) {
		title = "Couldn’t load fonts";
		description = error;
	} else if (search.trim()) {
		title = "No matching fonts";
		description = "Try a different name or choose another font source.";
	} else if (source === "google" && !googleEnabled) {
		title = "Google Fonts are disabled";
		description = onEnableGoogle ? "Browse Google Fonts in this project." : "A project editor can enable Google Fonts.";
	} else if (source === "local") {
		if (!localAllowed) {
			title = "Local fonts are disabled";
			description = onEnableLocal ? "Use fonts installed on your computer." : "A project editor can enable local fonts.";
		} else if (!desktop) {
			title = "No shared fonts yet";
			description = "Use local fonts in the desktop app to share them with this project.";
		} else if (!localEnabled) {
			title = "Local fonts are disabled";
			description = "Use fonts installed on your computer.";
		} else {
			title = "No local fonts found";
			description = "Install a font on your computer, then reopen this menu.";
		}
	}
	const t8 = error ? "alert" : "status";
	let t9;
	if ($[14] !== search) {
		t9 = search.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
			"aria-hidden": "true",
			className: "shrink-0 text-ed-muted-foreground"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontIcon, {
			"aria-hidden": "true",
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[14] = search;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== title) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-ed-foreground",
			children: title
		});
		$[16] = title;
		$[17] = t10;
	} else t10 = $[17];
	let t11;
	if ($[18] !== description) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-pretty text-ed-muted-foreground",
			children: description
		});
		$[18] = description;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== t10 || $[21] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1",
			children: [t10, t11]
		});
		$[20] = t10;
		$[21] = t11;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== enableGoogle || $[24] !== enablingGoogle || $[25] !== onEnableLocal || $[26] !== showGoogleAction || $[27] !== showLocalAction) {
		t13 = (showGoogleAction || showLocalAction) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2",
			children: [showGoogleAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "xs",
				loading: enablingGoogle,
				onClick: () => void enableGoogle(),
				children: "Enable Google Fonts"
			}), showLocalAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "xs",
				onClick: () => void onEnableLocal?.(),
				children: "Enable local fonts"
			})]
		});
		$[23] = enableGoogle;
		$[24] = enablingGoogle;
		$[25] = onEnableLocal;
		$[26] = showGoogleAction;
		$[27] = showLocalAction;
		$[28] = t13;
	} else t13 = $[28];
	let t14;
	if ($[29] !== enableError) {
		t14 = enableError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "text-ed-destructive",
			children: enableError
		});
		$[29] = enableError;
		$[30] = t14;
	} else t14 = $[30];
	let t15;
	if ($[31] !== error || $[32] !== onRetry) {
		t15 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "xs",
			onClick: onRetry,
			children: "Retry"
		});
		$[31] = error;
		$[32] = onRetry;
		$[33] = t15;
	} else t15 = $[33];
	let t16;
	if ($[34] !== t12 || $[35] !== t13 || $[36] !== t14 || $[37] !== t15 || $[38] !== t8 || $[39] !== t9) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: t8,
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: "flex min-h-full flex-col items-center justify-center gap-3 px-5 py-8 text-center",
			children: [
				t9,
				t12,
				t13,
				t14,
				t15
			]
		});
		$[34] = t12;
		$[35] = t13;
		$[36] = t14;
		$[37] = t15;
		$[38] = t8;
		$[39] = t9;
		$[40] = t16;
	} else t16 = $[40];
	return t16;
}

export { FontFamilyPicker, FontWeightPicker };
