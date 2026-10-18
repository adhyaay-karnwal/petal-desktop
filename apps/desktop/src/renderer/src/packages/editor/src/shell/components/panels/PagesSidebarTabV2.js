// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/PagesSidebarTabV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { SearchIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../../../ui/src/components/InputGroup.js";
import { LayersPanelLive } from "./LayersPanel.js";
import { PagesPanel } from "./PagesPanel.js";
import { PagesLayersSplit } from "./PagesLayersSplit.js";

/** Pages-tab composition for the v2 left sidebar. */
var PagesSidebarTabV2 = (0, import_react.forwardRef)(function PagesSidebarTabV2(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(34);
	const { pageProps, layerProps } = t0;
	const localSearchInputRef = (0, import_react.useRef)(null);
	const [pagesExpanded, setPagesExpanded] = (0, import_react.useState)(true);
	const [searchMode, setSearchMode] = (0, import_react.useState)(false);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => setSearchMode(true);
		$[0] = t1;
	} else t1 = $[0];
	const openSearch = t1;
	const searchInputRef = layerProps.searchInputRef ?? localSearchInputRef;
	let t2;
	let t3;
	if ($[1] !== searchInputRef) {
		t2 = () => ({ openSearch: () => {
			setSearchMode(true);
			requestAnimationFrame(() => searchInputRef.current?.focus());
		} });
		t3 = [searchInputRef];
		$[1] = searchInputRef;
		$[2] = t2;
		$[3] = t3;
	} else {
		t2 = $[2];
		t3 = $[3];
	}
	(0, import_react.useImperativeHandle)(ref, t2, t3);
	let t4;
	let t5;
	if ($[4] !== searchInputRef || $[5] !== searchMode) {
		t4 = () => {
			if (!searchMode) return;
			requestAnimationFrame(() => searchInputRef.current?.focus());
		};
		t5 = [searchMode, searchInputRef];
		$[4] = searchInputRef;
		$[5] = searchMode;
		$[6] = t4;
		$[7] = t5;
	} else {
		t4 = $[6];
		t5 = $[7];
	}
	(0, import_react.useEffect)(t4, t5);
	let t6;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			setSearchQuery("");
			setSearchMode(false);
		};
		$[8] = t6;
	} else t6 = $[8];
	const closeSearch = t6;
	if (searchMode) {
		let t7;
		if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
				align: "inline-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
					width: 16,
					height: 16,
					className: "size-4 text-ed-foreground-secondary"
				})
			});
			$[9] = t7;
		} else t7 = $[9];
		let t8;
		let t9;
		if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
			t8 = (event) => setSearchQuery(event.target.value);
			t9 = (event_0) => {
				if (event_0.nativeEvent.isComposing || event_0.keyCode === 229) return;
				if (event_0.key === "Escape") closeSearch();
			};
			$[10] = t8;
			$[11] = t9;
		} else {
			t8 = $[10];
			t9 = $[11];
		}
		let t10;
		if ($[12] !== searchInputRef || $[13] !== searchQuery) {
			t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
				size: "xs",
				className: "flex-1 shadow-none focus-within:ring-0!",
				children: [t7, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
					ref: searchInputRef,
					"aria-label": "Find layers",
					placeholder: "Find...",
					value: searchQuery,
					onChange: t8,
					onKeyDown: t9
				})]
			});
			$[12] = searchInputRef;
			$[13] = searchQuery;
			$[14] = t10;
		} else t10 = $[14];
		let t11;
		if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
			t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon-xs",
				variant: "ghost",
				isChildText: false,
				className: "text-ed-foreground-secondary hover:text-ed-foreground",
				onClick: closeSearch,
				"aria-label": "Close search",
				title: "Close search",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {})
			});
			$[15] = t11;
		} else t11 = $[15];
		let t12;
		if ($[16] !== t10) {
			t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-row items-center justify-start gap-2 p-3",
				children: [t10, t11]
			});
			$[16] = t10;
			$[17] = t12;
		} else t12 = $[17];
		let t13;
		if ($[18] !== layerProps || $[19] !== searchQuery) {
			t13 = searchQuery.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanelLive, {
					...layerProps,
					headerVariant: "hidden",
					searchValue: searchQuery,
					onSearchValueChange: setSearchQuery
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-0 flex-1 items-center justify-center px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "secondary",
					children: "Search layers"
				})
			});
			$[18] = layerProps;
			$[19] = searchQuery;
			$[20] = t13;
		} else t13 = $[20];
		let t14;
		if ($[21] !== t12 || $[22] !== t13) {
			t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full min-h-0 flex-col",
				children: [t12, t13]
			});
			$[21] = t12;
			$[22] = t13;
			$[23] = t14;
		} else t14 = $[23];
		return t14;
	}
	let t7;
	if ($[24] !== pageProps || $[25] !== pagesExpanded) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagesPanel, {
			...pageProps,
			variant: "sidebar-v2",
			expanded: pagesExpanded,
			onExpandedChange: setPagesExpanded,
			onSearchClick: openSearch
		});
		$[24] = pageProps;
		$[25] = pagesExpanded;
		$[26] = t7;
	} else t7 = $[26];
	let t8;
	if ($[27] !== layerProps) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanelLive, {
			...layerProps,
			headerVariant: "sidebar-v2"
		});
		$[27] = layerProps;
		$[28] = t8;
	} else t8 = $[28];
	let t9;
	if ($[29] !== pageProps.pages.length || $[30] !== pagesExpanded || $[31] !== t7 || $[32] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagesLayersSplit, {
			pageCount: pageProps.pages.length,
			expanded: pagesExpanded,
			onExpandedChange: setPagesExpanded,
			pages: t7,
			layers: t8
		});
		$[29] = pageProps.pages.length;
		$[30] = pagesExpanded;
		$[31] = t7;
		$[32] = t8;
		$[33] = t9;
	} else t9 = $[33];
	return t9;
});

export { PagesSidebarTabV2 };
