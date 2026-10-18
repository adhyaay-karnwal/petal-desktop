// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/compositionDrag.ts
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { normalizeIconLibrarySpecifier } from "../../../../../compiler/src/runtime/settingsParser.js";
import { ImageIcon } from "../../../../../ui/src/icons.js";
import { getRootIds } from "../../../../../compiler/src/store/read.js";
import { buildParseContextFromImports, parseCompositionJsx, parseCompositionJsxToNestedRoots } from "../../../../../compiler/src/codegen/parseComposition.js";
import { ElementErrorBoundary } from "../../../canvas/components/ErrorBoundary.js";
import { renderTree } from "../../../canvas/utils/renderElement.js";
import { useAssetResolver } from "../../../shared/contexts/AssetContext.js";

var EMPTY_IMPORTS = {
	iconNames: /* @__PURE__ */ new Set(),
	aliasesBySpecifier: /* @__PURE__ */ new Map()
};
var UPPERCASE_JSX_TAG_RE = /<\s*([A-Z][A-Za-z0-9_$]*)\b/g;
function uppercaseJsxTagNames(jsx) {
	return [...jsx.matchAll(UPPERCASE_JSX_TAG_RE)].map((match) => match[1]);
}
/** Babel-parse a sidecar's imports. Memoize on the source string — this is the
*  only expensive step, and everything downstream is object spreads. */
function parseCompositionImports(compositionSource) {
	if (!compositionSource) return EMPTY_IMPORTS;
	let importContext;
	try {
		importContext = buildParseContextFromImports(compositionSource);
	} catch {
		return EMPTY_IMPORTS;
	}
	const iconNames = /* @__PURE__ */ new Set();
	const aliasesBySpecifier = /* @__PURE__ */ new Map();
	for (const [specifier, config] of Object.entries(importContext.iconLibraries)) {
		for (const localName of Object.keys(config.icons ?? {})) iconNames.add(localName);
		if (config.iconAliases && Object.keys(config.iconAliases).length > 0) aliasesBySpecifier.set(specifier, config.iconAliases);
	}
	return {
		iconNames,
		aliasesBySpecifier
	};
}
/**
* Build the registries used to parse one composition sidecar.
*
* Two things go wrong when the editor's raw registries are used as-is, and both
* bite shadcn projects specifically:
*
* 1. parseJSX gives local components precedence over icons, so a project that
*    exports `components/ui/calendar.tsx` renders a full month grid wherever the
*    composition meant lucide's `<Calendar />`. shadcn collides on Calendar,
*    Command, Table, Sidebar and Badge. The file's own imports say which name
*    means the icon, so drop those names from the component index.
* 2. shadcn writes `import { Calendar as CalendarIcon }`. The icon registry is
*    keyed by the library's real exports, so the tag `CalendarIcon` matches
*    nothing and lands as an unresolved component that renders as nothing.
*    Alias the local name onto the real icon, and record it in `iconAliases` so
*    parseJSX still persists the canonical export name.
*/
function getCompositionParseContext(imports, iconLibraries, componentIndex, allIconLibraries) {
	const merged = {
		...allIconLibraries,
		...iconLibraries
	};
	if (imports.iconNames.size === 0) return {
		iconLibraries: merged,
		componentIndex
	};
	const nextIconLibraries = { ...merged };
	for (const [specifier, aliases] of imports.aliasesBySpecifier) {
		const installedName = Object.keys(nextIconLibraries).find((libraryName) => normalizeIconLibrarySpecifier(libraryName) === specifier);
		if (!installedName) continue;
		const installed = nextIconLibraries[installedName];
		const aliasedIcons = {};
		const iconAliases = {};
		for (const [localName, importedName] of Object.entries(aliases)) {
			const icon = installed.icons?.[importedName];
			if (!icon) continue;
			aliasedIcons[localName] = icon;
			iconAliases[localName] = importedName;
		}
		if (Object.keys(iconAliases).length === 0) continue;
		nextIconLibraries[installedName] = {
			...installed,
			icons: {
				...installed.icons,
				...aliasedIcons
			},
			iconAliases: {
				...installed.iconAliases,
				...iconAliases
			}
		};
	}
	const hasIcon = (name) => Object.values(nextIconLibraries).some((config) => !!config.icons?.[name]);
	let nextComponentIndex = componentIndex;
	const shadowed = Object.keys(componentIndex).filter((name) => imports.iconNames.has(name) && hasIcon(name));
	if (shadowed.length > 0) {
		nextComponentIndex = { ...componentIndex };
		for (const name of shadowed) delete nextComponentIndex[name];
	}
	return {
		iconLibraries: nextIconLibraries,
		componentIndex: nextComponentIndex
	};
}
/**
* Describe only the registry state that can change how composition JSX parses.
*
* The editor rebuilds `componentIndex` / `iconLibraries` object identities during
* ordinary canvas renders. Using those identities as a memo key reparses every
* export on every render — and because composition parsing forces new element
* ids, that also remounts each preview and flashes it blank. What actually
* affects the parse is only whether each uppercase tag resolves to a local
* component, to an icon (which library, under which canonical name), or to
* nothing at all.
*/
function getCompositionParseSignature(jsxValues, { iconLibraries, componentIndex }) {
	const tagNames = /* @__PURE__ */ new Set();
	for (const jsx of jsxValues) for (const tagName of uppercaseJsxTagNames(jsx)) tagNames.add(tagName);
	return Array.from(tagNames).sort().map((tagName) => {
		if (tagName in componentIndex) return `${tagName}:component`;
		for (const [libraryName, config] of Object.entries(iconLibraries)) {
			if (!config.icons?.[tagName]) continue;
			return `${tagName}:icon:${libraryName}:${config.iconAliases?.[tagName] ?? tagName}`;
		}
		return `${tagName}:unknown`;
	}).join("|");
}
/** Component names the Assets panel must have loaded to render a sidecar. */
function collectCompositionPreviewNames(fileComponents, jsxValues) {
	const names = new Set(fileComponents);
	for (const jsx of jsxValues) for (const tagName of uppercaseJsxTagNames(jsx)) names.add(tagName);
	return [...names];
}
/** Parse composition exports into canvas-ready roots so drag/drop can use the
*  native multi-element payload instead of reparsing JSX on drop. */
function parseCompositionRootsByExport(jsxByExport, context) {
	const rootsByExport = /* @__PURE__ */ new Map();
	for (const [exportName, jsx] of jsxByExport) try {
		const roots = parseCompositionJsxToNestedRoots(jsx, context.iconLibraries, context.componentIndex);
		if (roots.length > 0) rootsByExport.set(exportName, roots);
	} catch {}
	return rootsByExport;
}
function parseCompositionRootsBundle(jsxByExport, context, signature) {
	return {
		jsxByExport,
		signature,
		roots: jsxByExport ? parseCompositionRootsByExport(jsxByExport, context) : void 0
	};
}
/**
* Parse composition roots, re-parsing only when the JSX or its classification
* signature changes.
*
* `getCompositionParseSignature` is the real cache key: the editor rebuilds the
* registry objects behind `context` during ordinary canvas renders, so their
* identities would reparse every export on every render — minting new element
* ids and flashing each preview blank. The signature changes only when a tag's
* component/icon classification does, which is the only thing that can change
* the parse result.
*
* The cache lives in state, not a ref or memo: the freshly parsed roots must be
* returned on the same render the key changes so consumers never see a stale
* frame, and a ref write during render is rejected by react-hooks/refs.
*/
function useCompositionRootsByExport(jsxByExport, context, signature) {
	const $ = (0, import_compiler_runtime.c)(8);
	let t0;
	if ($[0] !== context || $[1] !== jsxByExport || $[2] !== signature) {
		t0 = () => parseCompositionRootsBundle(jsxByExport, context, signature);
		$[0] = context;
		$[1] = jsxByExport;
		$[2] = signature;
		$[3] = t0;
	} else t0 = $[3];
	const [cached, setCached] = (0, import_react.useState)(t0);
	if (cached.jsxByExport !== jsxByExport || cached.signature !== signature) {
		let t1;
		if ($[4] !== context || $[5] !== jsxByExport || $[6] !== signature) {
			t1 = parseCompositionRootsBundle(jsxByExport, context, signature);
			$[4] = context;
			$[5] = jsxByExport;
			$[6] = signature;
			$[7] = t1;
		} else t1 = $[7];
		const next = t1;
		setCached(next);
		return next.roots;
	}
	return cached.roots;
}
var EMPTY_COMPONENTS$2 = {};
var EMPTY_PARSE_CONTEXT = {
	iconLibraries: {},
	componentIndex: {}
};
var NO_JSX = [];
function PreviewFallback() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center w-full h-full min-h-[40px] bg-ed-muted/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, {
				width: 14,
				height: 14,
				className: "text-ed-muted-foreground/60"
			})
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function parseCompositionStore(jsx, { iconLibraries, componentIndex }) {
	if (!jsx?.trim()) return null;
	try {
		return parseCompositionJsx(jsx, iconLibraries, componentIndex, { forceNewIds: true });
	} catch {
		return null;
	}
}
function buildPreviewComponents(components, resolvedIconLibraries) {
	const merged = { ...components };
	for (const config of Object.values(resolvedIconLibraries)) {
		if (!config.icons || typeof config.icons !== "object") continue;
		for (const [name, iconComponent] of Object.entries(config.icons)) {
			if (name in merged) continue;
			if (!/^[A-Z]/.test(name)) continue;
			if (name === "Icon" || name === "IconBase" || name.startsWith("__")) continue;
			if (typeof iconComponent === "function" || typeof iconComponent === "object" && iconComponent !== null && "$$typeof" in iconComponent) merged[name] = iconComponent;
		}
	}
	return merged;
}
/**
* Parses the composition and renders it.
*
* The parsing has to run inside a memo boundary rather than a `useMemo`: the
* parse signature is what says whether a parse is needed (the host rebuilds the
* registry objects it is derived from on ordinary canvas renders), and the
* compiler cannot lower a memo whose dependency array is a hand-picked subset of
* the values the body reads. `parseSignature` therefore reaches this component
* as a prop, and the `React.memo` comparator below does the gating.
*/
function CompositionPreviewBody(t0) {
	const $ = (0, import_compiler_runtime.c)(35);
	const { jsx, components, parseContext, frameHeight } = t0;
	const assetResolver = useAssetResolver();
	const frameRef = (0, import_react.useRef)(null);
	const contentRef = (0, import_react.useRef)(null);
	const [contentHeight, setContentHeight] = (0, import_react.useState)(1);
	const [frameWidth, setFrameWidth] = (0, import_react.useState)(0);
	const scale = !frameWidth || !contentHeight ? 1 : Math.min(frameWidth / 400, frameHeight / contentHeight, 1);
	const previewComponents = buildPreviewComponents(components, parseContext.iconLibraries);
	const store = parseCompositionStore(jsx, parseContext);
	const rootIds = store ? getRootIds(store) : [];
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const content = contentRef.current;
			if (!content) return;
			const nextHeight = Math.max(content.scrollHeight, 1);
			setContentHeight((prev) => {
				if (nextHeight <= 1 && prev > 1) return prev;
				return prev === nextHeight ? prev : nextHeight;
			});
		};
		$[0] = t1;
	} else t1 = $[0];
	const measureContent = t1;
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => {
			const frameEl = frameRef.current;
			if (!frameEl) return;
			const updateFrameWidth = () => {
				setFrameWidth(frameEl.clientWidth);
			};
			updateFrameWidth();
			const frameObserver = new ResizeObserver(updateFrameWidth);
			frameObserver.observe(frameEl);
			return () => frameObserver.disconnect();
		};
		t3 = [];
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	(0, import_react.useLayoutEffect)(t2, t3);
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => {
			const content_0 = contentRef.current;
			if (!content_0) return;
			measureContent();
			const contentObserver = new ResizeObserver(measureContent);
			contentObserver.observe(content_0);
			return () => contentObserver.disconnect();
		};
		$[3] = t4;
	} else t4 = $[3];
	(0, import_react.useLayoutEffect)(t4, [
		measureContent,
		jsx,
		rootIds.length
	]);
	if (!store || rootIds.length === 0) {
		let t5;
		if ($[4] !== frameHeight) {
			t5 = { height: frameHeight };
			$[4] = frameHeight;
			$[5] = t5;
		} else t5 = $[5];
		let t6;
		if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewFallback, {});
			$[6] = t6;
		} else t6 = $[6];
		let t7;
		if ($[7] !== t5) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: frameRef,
				"data-panel-drag-preview": true,
				className: "w-full overflow-hidden flex items-center justify-center pointer-events-none",
				style: t5,
				children: t6
			});
			$[7] = t5;
			$[8] = t7;
		} else t7 = $[8];
		return t7;
	}
	const renderOptions = {
		isDragPreview: true,
		components: previewComponents,
		componentIndex: parseContext.componentIndex,
		iconLibraries: parseContext.iconLibraries,
		assetResolver
	};
	const scaledWidth = 400 * scale;
	const scaledHeight = contentHeight * scale;
	const t5 = true;
	const t6 = "w-full overflow-hidden flex items-center justify-center pointer-events-none";
	let t7;
	if ($[9] !== frameHeight) {
		t7 = { height: frameHeight };
		$[9] = frameHeight;
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== scaledHeight || $[12] !== scaledWidth) {
		t8 = {
			width: scaledWidth,
			height: scaledHeight,
			overflow: "hidden"
		};
		$[11] = scaledHeight;
		$[12] = scaledWidth;
		$[13] = t8;
	} else t8 = $[13];
	const t9 = `scale(${scale})`;
	let t10;
	if ($[14] !== contentHeight || $[15] !== t9) {
		t10 = {
			width: 400,
			height: contentHeight,
			transform: t9,
			transformOrigin: "top left"
		};
		$[14] = contentHeight;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	const t11 = true;
	let t12;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = {
			width: 400,
			backgroundColor: "var(--background, #fff)"
		};
		$[17] = t12;
	} else t12 = $[17];
	const T0 = ElementErrorBoundary;
	let t13;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewFallback, {});
		$[18] = t13;
	} else t13 = $[18];
	const t14 = rootIds.map((id) => renderTree(id, store, renderOptions));
	let t15;
	if ($[19] !== T0 || $[20] !== t13 || $[21] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			fallback: t13,
			children: t14
		});
		$[19] = T0;
		$[20] = t13;
		$[21] = t14;
		$[22] = t15;
	} else t15 = $[22];
	let t16;
	if ($[23] !== t12 || $[24] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: contentRef,
			"data-canvas-content": t11,
			style: t12,
			children: t15
		});
		$[23] = t12;
		$[24] = t15;
		$[25] = t16;
	} else t16 = $[25];
	let t17;
	if ($[26] !== t10 || $[27] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t10,
			children: t16
		});
		$[26] = t10;
		$[27] = t16;
		$[28] = t17;
	} else t17 = $[28];
	let t18;
	if ($[29] !== t17 || $[30] !== t8) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t8,
			children: t17
		});
		$[29] = t17;
		$[30] = t8;
		$[31] = t18;
	} else t18 = $[31];
	let t19;
	if ($[32] !== t18 || $[33] !== t7) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: frameRef,
			"data-panel-drag-preview": t5,
			className: t6,
			style: t7,
			children: t18
		});
		$[32] = t18;
		$[33] = t7;
		$[34] = t19;
	} else t19 = $[34];
	return t19;
}
/**
* Signature-keyed memo boundary for {@link CompositionPreviewBody}.
*
* The signature covers everything the parser reads from the registries, so two
* renders with the same signature produce the same preview. Comparing it here
* keeps a canvas render that rebuilt an equivalent registry from re-parsing —
* which would remount the preview and flash it blank — while still re-parsing
* when a tag's component/icon classification actually changes.
*/
/**
* Signatures are recomputed in the comparator rather than carried as a prop so
* the body does not take an argument it never reads. This walk classifies tag
* names; the parse it guards is far more expensive.
*/
function compositionSignature({ jsx, parseContext = EMPTY_PARSE_CONTEXT }) {
	return getCompositionParseSignature(jsx ? [jsx] : NO_JSX, parseContext);
}
var CompositionPreview = import_react.memo(function CompositionPreview(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { jsx, components: t1, parseContext: t2, frameHeight: t3 } = t0;
	const components = t1 === void 0 ? EMPTY_COMPONENTS$2 : t1;
	const parseContext = t2 === void 0 ? EMPTY_PARSE_CONTEXT : t2;
	const frameHeight = t3 === void 0 ? 70 : t3;
	if (!jsx) {
		let t4;
		if ($[0] !== frameHeight) {
			t4 = { height: frameHeight };
			$[0] = frameHeight;
			$[1] = t4;
		} else t4 = $[1];
		let t5;
		if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewFallback, {});
			$[2] = t5;
		} else t5 = $[2];
		let t6;
		if ($[3] !== t4) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full overflow-hidden flex items-center justify-center pointer-events-none",
				style: t4,
				children: t5
			});
			$[3] = t4;
			$[4] = t6;
		} else t6 = $[4];
		return t6;
	}
	let t4;
	if ($[5] !== components || $[6] !== frameHeight || $[7] !== jsx || $[8] !== parseContext) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompositionPreviewBody, {
			jsx,
			components,
			parseContext,
			frameHeight
		});
		$[5] = components;
		$[6] = frameHeight;
		$[7] = jsx;
		$[8] = parseContext;
		$[9] = t4;
	} else t4 = $[9];
	return t4;
}, (prev, next) => prev.jsx === next.jsx && prev.components === next.components && prev.frameHeight === next.frameHeight && compositionSignature(prev) === compositionSignature(next));

export { CompositionPreview, collectCompositionPreviewNames, getCompositionParseContext, getCompositionParseSignature, parseCompositionImports, parseCompositionRootsByExport, useCompositionRootsByExport };
