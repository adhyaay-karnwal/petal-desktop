// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/renderElement.tsx
// Contains an import cycle merged from: packages/editor/src/canvas/utils/renderElement.tsx, packages/editor/src/canvas/hooks/useSnapshotDrag.tsx, packages/editor/src/canvas/components/WebviewRenderer.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CaretDownIcon, CaretUpIcon, GlobeIcon } from "../../../../ui/src/icons.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { r$15 } from "../../../../../vendor/@phosphor-icons/react.js";
import { toast } from "../../../../../vendor/sonner.js";
import { coerceClassName, isPlainObject$3, sanitizeDomRenderProps } from "../../../../compiler/src/store/sanitize.js";
import { ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getById, getChildren$2, getParentId } from "../../../../compiler/src/store/read.js";
import { VIDEO_FILL_PROP, parseVideoFill, videoFillElement } from "../../../../compiler/src/store/videoFill.js";
import { getCameraScale, subscribeCameraScale } from "../../shell/hooks/useCommentAgent.js";
import { measureVisibleBounds } from "../../shared/utils/visibleElement.js";
import { liveProbeFor, registerLiveProbe, registerLiveSource } from "../../shared/state/liveProbeChannel.js";
import { dismissCanvasAreas } from "../../shared/state/canvasAreaDismiss.js";
import { previewAddToChat } from "../../shared/state/previewAddToChat.js";
import { startLog } from "../../shared/utils/captureStore.js";
import { getSelectedElementIds, useSelection } from "../../shared/state/selection.js";
import { isTypingTarget } from "../../shared/shortcuts/matchShortcut.js";
import { captureFromIframe, captureFromWebview, detectRepoRootFromCapture, ensureCaptureArtifactInWebview, getTargetFingerprint, markWebviewArtifactStale, parseCaptureJson, runCaptureInWebview } from "./fiberExtract.js";
import { GUEST_FINGERPRINT_SRC, PAGE_SOURCE_AT, buildPickScript, buildSnapshotScript } from "./webviewGuestScripts.js";
import { IS_ELECTRON, isPrimaryModifier } from "../../shared/utils/platform.js";
import { getModifiers, subscribeModifiers } from "../../shared/state/modifierKeys.js";
import { innerPickStore } from "../../shared/state/innerPickStore.js";
import { normalizePaddingStyles } from "../../shared/utils/paddingStyles.js";
import { DraggableElement } from "../components/DraggableElement.js";
import { MediaWithFallback } from "../components/MediaWithFallback.js";
import { ElementErrorBoundary } from "../components/ErrorBoundary.js";
import { CapturedPageRenderer } from "../components/CapturedPageRenderer.js";
import { TextEditor } from "../components/TextEditor.js";
import { startEdgePanLoop } from "./edgePan.js";
import { PICK_HOVER_OUTLINE, PICK_SELECT_OUTLINE, pickLabelStyle, resolvedPickColor } from "./pickOutline.js";
import { hasOpenLayer } from "../../shared/utils/mouseButtonPolicy.js";
import { useWebviewEditState, webviewEditStore } from "../../shared/state/webviewEditStore.js";
import { useActiveTool } from "../../shared/state/activeTool.js";
import { normalizePreviewUrl } from "../../shared/utils/previewUrl.js";

/**
* Wraps a live-rendered captured component with an EMPTY-render safety net.
* After mount, it checks whether the live render produced any visible DOM — a
* data component that lost its runtime data re-renders to nothing (no crash, so
* the error boundary never fires). If nothing visible came out, swap to the
* `frozen` capture. Paired with ElementErrorBoundary (crash case), this means a
* captured component can never blank the canvas: worst case is accurate frozen
* pixels. Only applied to capture upgrades (`frozenFallback`), never authored
* components — an authored component that legitimately renders empty stays empty.
*/
function LiveOrFrozen(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { live, frozen } = t0;
	const hostRef = (0, import_react.useRef)(null);
	const [useFrozen, setUseFrozen] = (0, import_react.useState)(false);
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const node = hostRef.current;
			if (!node) return;
			const r = measureVisibleBounds(node);
			if (!(r.width > 0 && r.height > 0)) setUseFrozen(true);
		};
		t2 = [];
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	if (useFrozen) {
		let t3;
		if ($[2] !== frozen) {
			t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: frozen });
			$[2] = frozen;
			$[3] = t3;
		} else t3 = $[3];
		return t3;
	}
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = { display: "contents" };
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== live) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hostRef,
			style: t3,
			children: live
		});
		$[5] = live;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}
var crashedElementRenders = /* @__PURE__ */ new Map();
/** Last committed function for this instance + componentName. */
var lastGoodElementRenders = /* @__PURE__ */ new Map();
/** Last-good for children that cannot mount RememberLastGood, flushed by the nearest parent. */
var pendingChildLastGoods = /* @__PURE__ */ new Map();
/** Element ids already reported as unrenderable — one console line each, not one per render. */
var warnedRenderFailures = /* @__PURE__ */ new Set();
function elementRenderKey(elementId, componentName) {
	return `${elementId}\0${componentName}`;
}
function isRenderableComponent(value) {
	return typeof value === "function" || typeof value === "object" && value !== null && "$$typeof" in value;
}
function appendChildLastGoods(parentId, records) {
	if (!parentId) return;
	const dest = pendingChildLastGoods.get(parentId);
	if (dest) dest.push(...records);
	else pendingChildLastGoods.set(parentId, records);
}
function takeChildLastGoods(parentId) {
	const list = pendingChildLastGoods.get(parentId);
	if (!list) return;
	pendingChildLastGoods.delete(parentId);
	return list;
}
function reparentChildLastGoods(fromId, toId) {
	const list = takeChildLastGoods(fromId);
	if (!list || !toId) return;
	appendChildLastGoods(toId, list);
}
function RememberLastGood(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { elementId, component, componentName, alsoRemember, children } = t0;
	let t1;
	let t2;
	if ($[0] !== alsoRemember || $[1] !== component || $[2] !== componentName || $[3] !== elementId) {
		t1 = () => {
			lastGoodElementRenders.set(elementRenderKey(elementId, componentName), component);
			if (!alsoRemember) return;
			for (const record of alsoRemember) lastGoodElementRenders.set(record.renderKey, record.component);
		};
		t2 = [
			elementId,
			component,
			componentName,
			alsoRemember
		];
		$[0] = alsoRemember;
		$[1] = component;
		$[2] = componentName;
		$[3] = elementId;
		$[4] = t1;
		$[5] = t2;
	} else {
		t1 = $[4];
		t2 = $[5];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	return children;
}
function createComponentNode(type, props, children) {
	return Array.isArray(children) && children.length === 0 ? (0, import_react.createElement)(type, props) : (0, import_react.createElement)(type, props, children);
}
var DEFAULT_DEV_SERVER_URL = typeof process !== "undefined" && {}.NEXT_PUBLIC_LUNAGRAPH_DEV_SERVER || "http://localhost:4001";
function resolveAssetSrc(props, assetResolver) {
	if (props.src && assetResolver) props.src = assetResolver(props.src);
}
function renderVideoFill(fill, assetResolver) {
	const { props, styles } = videoFillElement(fill);
	return (0, import_react.createElement)("video", {
		...props,
		key: "lg-video-fill",
		src: assetResolver ? assetResolver(fill.src) : fill.src,
		style: styles,
		ref: (node) => {
			if (node) node.muted = true;
		}
	});
}
function looksLikeAssetPath(v) {
	return v.includes(".petal-assets/") || v.startsWith("/assets/") || v.startsWith("/public/");
}
function resolveCssUrlAssets(value, assetResolver) {
	return value.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, path) => looksLikeAssetPath(path) ? `url(${quote}${assetResolver(path)}${quote})` : match);
}
function resolveStyleAssets(style, assetResolver) {
	if (!style || !assetResolver) return style;
	const s = style;
	const fixBi = typeof s.backgroundImage === "string" && s.backgroundImage.includes("url(");
	const fixBg = typeof s.background === "string" && s.background.includes("url(");
	if (!fixBi && !fixBg) return style;
	const next = { ...s };
	if (fixBi) next.backgroundImage = resolveCssUrlAssets(s.backgroundImage, assetResolver);
	if (fixBg) next.background = resolveCssUrlAssets(s.background, assetResolver);
	return next;
}
/**
* Determines if an element is interactive (should stop event propagation and handle clicks/hovers).
* Extracted for testability.
*/
function isElementInteractive(selectionMode, _currentParentId, interactiveParentIds) {
	if (selectionMode === "deepest") return true;
	if (_currentParentId === null) return true;
	if (interactiveParentIds && interactiveParentIds.has(_currentParentId)) return true;
	return false;
}
/** Walk up from `leafId` to the nearest ancestor that paints its text with a
*  gradient (background-clip:text), returning that element's styles — or
*  undefined. Walks all ancestors (not just the direct parent) so an imported /
*  captured clip on a grandparent still carries onto the in-place editor. */
function ownerWithTextGradient(store, leafId) {
	let curr = getParentId(store, leafId);
	while (curr && curr !== "ROOT") {
		const styles = getById(store, curr)?.styles;
		if (styles && (styles.backgroundClip === "text" || styles.WebkitBackgroundClip === "text")) return styles;
		curr = getParentId(store, curr);
	}
}
/** True when this node hands its direct children to the component as real elements (Slot, introspection). */
function rendersChildrenInline(element, componentIndex) {
	return element.type === "component" && (element.props?.asChild === true || componentIndex?.[element.componentName]?.inspectsChildren === true);
}
/**
* Render one FEElement from the flat Store.
*
* The caller supplies `renderChild`, which renders a child by id — the live
* canvas mounts a subscribed node, static callers recurse with `renderTree`.
* This function never recurses itself; it is the only place child options
* are derived.
*/
var BOX_STYLE_KEYS = [
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"inset",
	"margin",
	"marginTop",
	"marginRight",
	"marginBottom",
	"marginLeft",
	"width",
	"height",
	"minWidth",
	"minHeight",
	"maxWidth",
	"maxHeight",
	"transform",
	"transformOrigin",
	"zIndex",
	"flex",
	"flexGrow",
	"flexShrink",
	"flexBasis",
	"alignSelf",
	"justifySelf",
	"order",
	"gridArea",
	"gridColumn",
	"gridColumnStart",
	"gridColumnEnd",
	"gridRow",
	"gridRowStart",
	"gridRowEnd"
];
/** True for positioning that takes an element out of flow, so its box must live on a real wrapper. */
function isOutOfFlow(position) {
	return position === "absolute" || position === "fixed";
}
/** Offsets that only mean something once an element is positioned. */
var OFFSET_STYLE_KEYS = [
	"top",
	"right",
	"bottom",
	"left",
	"inset"
];
/** An out-of-flow root whose whole box came from its offsets: with those dropped
*  there is no size left to measure, so only the surface can supply one. */
function frameRootIsUnsized(styles) {
	return isOutOfFlow(styles?.position) && styles?.width === void 0 && styles?.height === void 0;
}
/**
* A frame root in presentation mode *is* the frame: the preview measures its
* layout box to size and scale the page. Out-of-flow positioning leaves that
* box empty, so the root paints into a 0x0 clip and vanishes (LUN-304). Put it
* back in flow as `relative` — still an anchor for absolute children — and drop
* the offsets so the measured box and the painted box stay identical. A root with
* no size of its own then fills its surface rather than collapsing to 0x0.
*
* `viewportSized` sizes the root from the viewport instead of its own box: the
* artboard sizing is what is being simulated away, so its limits are overridden
* (a class-authored clamp survives having the inline key removed). The floor is
* `100vh` — a percentage would resolve against an auto-height ancestor and
* collapse an empty frame to nothing.
*/
function normalizeFrameRootStyles(styles, viewportSized = false) {
	const outOfFlow = isOutOfFlow(styles?.position);
	if (!outOfFlow && !viewportSized) return styles;
	const next = { ...styles };
	if (outOfFlow) {
		next.position = "relative";
		for (const key of OFFSET_STYLE_KEYS) delete next[key];
	}
	if (!viewportSized && frameRootIsUnsized(styles)) {
		next.width = "100%";
		next.height = "100%";
	}
	if (viewportSized) {
		next.minWidth = 0;
		next.maxWidth = "none";
		next.maxHeight = "none";
		next.width = "100%";
		next.height = "auto";
		next.minHeight = "100vh";
	}
	return next;
}
/**
* Split styles into the box (position + size, moves to the wrapper) and the
* paint (everything else, stays on the element).
*/
function splitBoxStyles(styles) {
	const box = {};
	const paint = { ...styles };
	for (const key of BOX_STYLE_KEYS) {
		if (styles?.[key] === void 0) continue;
		box[key] = styles[key];
		delete paint[key];
	}
	return {
		box,
		paint
	};
}
function asStyleObject(value) {
	return isPlainObject$3(value) ? value : void 0;
}
function domTag(tag) {
	return typeof tag === "string" && tag.length > 0 ? tag : "div";
}
function renderElement(element, store, options = {}, renderChild) {
	try {
		return renderElementOrThrow(element, store, options, renderChild);
	} catch (error) {
		const id = element?.id;
		if (id && !warnedRenderFailures.has(id)) {
			warnedRenderFailures.add(id);
			console.warn("[renderElement]", id, error);
		}
		return null;
	}
}
/** Render a whole subtree from a fixed store (previews, presentation, drag overlay).
*  Static counterpart of CanvasNode, which walks the live document with subscriptions. */
function renderTree(root, store, options = {}) {
	const renderChild = (id, childOptions) => {
		const child = getById(store, id);
		return child ? renderElement(child, store, childOptions, renderChild) : null;
	};
	const element = typeof root === "string" ? getById(store, root) : root;
	return element ? renderElement(element, store, options, renderChild) : null;
}
function renderElementOrThrow(initialElement, store, options = {}, renderChild) {
	let element = initialElement;
	const paddingStyles = normalizePaddingStyles(element.styles);
	if (paddingStyles !== element.styles) element = {
		...element,
		styles: paddingStyles
	};
	if (options.isFrameRoot) {
		const styles = normalizeFrameRootStyles(element.styles, options.frameRootViewportSized);
		options = {
			...options,
			isFrameRoot: false
		};
		if (styles !== element.styles) element = {
			...element,
			styles
		};
	}
	const isChildIntrospectionTarget = options.isChildIntrospectionTarget === true;
	if (isChildIntrospectionTarget) options = {
		...options,
		isChildIntrospectionTarget: false
	};
	const { isDragPreview = false, presentationMode = false, isSVGContext = false, devServerUrl = DEFAULT_DEV_SERVER_URL, assetResolver } = options;
	const { _currentParentId = null } = options;
	const liveTree = options.liveTree ?? (() => store);
	const isSVGElement = element.type === "html" && element.tag === "svg";
	const childSVGContext = isSVGContext || isSVGElement;
	const placeChildren = (ids) => {
		return ids.map((childId) => renderChild(childId, {
			...options,
			isSVGContext: childSVGContext,
			_currentParentId: element.id
		}));
	};
	const isTopLevelSvg = isSVGElement && !isSVGContext;
	const commonProps = { "data-element-id": element.id };
	let content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Default Content" });
	let wrapperBoxStyle;
	const renderSlot = () => {
		return null;
	};
	if (element.type === "html") {
		if (element.props?.["data-component"] === "CapturedPage" && !isDragPreview) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CapturedPageRenderer, {
			element,
			store,
			options,
			renderChild
		}, element.id);
		const isVoidElement = [
			"img",
			"input",
			"br",
			"hr",
			"area",
			"base",
			"col",
			"embed",
			"link",
			"meta",
			"param",
			"source",
			"track",
			"wbr"
		].includes(element.tag);
		const isTextarea = element.tag === "textarea";
		const childIds = getChildren$2(store, element.id);
		const hasChildren = childIds.length > 0;
		const needsResetOverride = element.tag === "img" || element.tag === "video";
		const className = typeof element.props?.className === "string" ? element.props.className : "";
		const hasMaxWidthClass = /\bmax-w-/.test(className);
		const hasMaxWidthInline = element.styles?.maxWidth !== void 0;
		let elementStyle = needsResetOverride && !hasMaxWidthClass && !hasMaxWidthInline ? {
			maxWidth: "none",
			...element.styles
		} : element.styles;
		const wrappedReplaced = (needsResetOverride || isTopLevelSvg) && !isDragPreview && !presentationMode && !(isSVGContext && !isSVGElement) && !options.isAsChildSlotTarget && !isChildIntrospectionTarget;
		if (wrappedReplaced && (element.styles?.width !== void 0 || element.styles?.height !== void 0)) elementStyle = {
			...elementStyle,
			...element.styles?.width !== void 0 ? { width: "100%" } : null,
			...element.styles?.height !== void 0 ? { height: "100%" } : null
		};
		if (wrappedReplaced) {
			const { box, paint } = splitBoxStyles(element.styles);
			if (element.styles?.width !== void 0) paint.width = "100%";
			if (element.styles?.height !== void 0) paint.height = "100%";
			if (needsResetOverride && !hasMaxWidthClass && !hasMaxWidthInline) paint.maxWidth = "none";
			wrapperBoxStyle = box;
			elementStyle = paint;
		}
		elementStyle = resolveStyleAssets(elementStyle, assetResolver);
		const isIframe = element.tag === "iframe";
		const iframeInteractionEnabled = presentationMode || element.props?.["data-interaction-enabled"] === "true";
		if (element.tag === "img" || element.tag === "video") {
			const elementProps = sanitizeDomRenderProps(element.props);
			resolveAssetSrc(elementProps, assetResolver);
			if (element.tag === "video" && !presentationMode) {
				const { controlsList } = elementProps;
				elementProps.controlsList = typeof controlsList === "string" && controlsList ? `${controlsList} nofullscreen` : "nofullscreen";
			}
			const mediaChildren = element.tag === "video" && hasChildren ? placeChildren(childIds) : void 0;
			content = (0, import_react.createElement)(MediaWithFallback, {
				tag: element.tag,
				elementProps,
				style: elementStyle,
				commonProps,
				children: mediaChildren,
				onCommitSource: options.onSetMediaSource ? (src) => options.onSetMediaSource(element.id, src) : void 0
			});
		} else if (isVoidElement || isTextarea) {
			const elementProps = sanitizeDomRenderProps(element.props);
			if (element.tag === "source") resolveAssetSrc(elementProps, assetResolver);
			content = (0, import_react.createElement)(domTag(element.tag), {
				...elementProps,
				style: elementStyle,
				...commonProps,
				draggable: false
			});
		} else if (isIframe) {
			const elementProps = { ...sanitizeDomRenderProps(element.props) };
			const useProxy = elementProps["data-use-proxy"] === "true" || elementProps["data-use-proxy"] === true;
			const scale = parseFloat(String(elementProps["data-scale"] ?? "")) || 1;
			delete elementProps["data-interaction-enabled"];
			delete elementProps["data-use-proxy"];
			delete elementProps["data-scale"];
			let iframeSrc = elementProps.src;
			if (useProxy && iframeSrc && iframeSrc !== "about:blank") iframeSrc = `${devServerUrl}/proxy?url=${encodeURIComponent(iframeSrc)}`;
			const containerWidth = elementStyle?.width;
			const containerHeight = elementStyle?.height;
			const iframeWidth = scale !== 1 ? `${100 / scale}%` : "100%";
			const iframeHeight = scale !== 1 ? `${100 / scale}%` : "100%";
			const iframeBox = isOutOfFlow(elementStyle?.position) ? splitBoxStyles(elementStyle).box : null;
			content = (0, import_react.createElement)("div", {
				style: {
					position: "relative",
					display: "inline-block",
					width: containerWidth,
					height: containerHeight,
					overflow: "hidden",
					...iframeBox
				},
				...commonProps
			}, (0, import_react.createElement)(domTag(element.tag), {
				...elementProps,
				src: iframeSrc,
				style: {
					...iframeBox ? splitBoxStyles(elementStyle).paint : elementStyle,
					width: iframeWidth,
					height: iframeHeight,
					transform: scale !== 1 ? `scale(${scale})` : void 0,
					transformOrigin: "top left",
					border: "none"
				},
				draggable: false
			}), !iframeInteractionEnabled && (0, import_react.createElement)("div", {
				style: {
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "transparent",
					cursor: "default"
				},
				"data-iframe-overlay": "true"
			}));
		} else {
			const elementProps = sanitizeDomRenderProps(element.props);
			const fill = parseVideoFill(elementProps[VIDEO_FILL_PROP]);
			delete elementProps[VIDEO_FILL_PROP];
			content = (0, import_react.createElement)(domTag(element.tag), {
				...elementProps,
				style: elementStyle,
				...commonProps
			}, fill || hasChildren ? [fill && renderVideoFill(fill, assetResolver), ...placeChildren(childIds)] : void 0);
		}
	} else if (element.type === "text") {
		if (options.editingTextId === element.id) {
			const bounds = options.editingTextBounds;
			const gradientStyles = ownerWithTextGradient(liveTree(), element.id);
			const inheritedPaint = gradientStyles ? {
				backgroundImage: gradientStyles.backgroundImage,
				backgroundClip: gradientStyles.backgroundClip,
				WebkitBackgroundClip: gradientStyles.WebkitBackgroundClip,
				WebkitTextFillColor: gradientStyles.WebkitTextFillColor,
				color: gradientStyles.color
			} : void 0;
			return (0, import_react.createElement)(TextEditor, {
				key: element.id,
				initialNode: element,
				minHeight: bounds?.height,
				inheritedPaint,
				onCommit: (content) => {
					options.onEditText?.(element.id, content);
					options.onStopEditText?.();
				},
				onActivate: options.onActivateTextEditor,
				onDeactivate: options.onDeactivateTextEditor,
				onSelectionChange: options.onTextSelectionChange
			});
		}
		const richChildren = element.children;
		const inner = richChildren && richChildren.length > 0 ? richChildren.map((run) => {
			if (!(run.styles && Object.keys(run.styles).length > 0) && !run.className) return (0, import_react.createElement)(import_react.Fragment, { key: run.id }, run.text ?? "");
			return (0, import_react.createElement)("span", {
				key: run.id,
				style: run.styles,
				className: run.className
			}, run.text ?? "");
		}) : element.text ?? "";
		const textHasSize = element.styles?.width != null || element.styles?.height != null;
		const isAutoWidthText = element.canvasPosition != null && !textHasSize;
		const textStyle = {
			...textHasSize || isAutoWidthText ? { display: "inline-block" } : {},
			...element.styles,
			whiteSpace: isAutoWidthText ? "pre" : element.styles?.whiteSpace ?? "pre-wrap",
			userSelect: "none"
		};
		content = (0, import_react.createElement)("span", {
			key: element.id,
			style: textStyle,
			...commonProps,
			"data-text-element": "true"
		}, inner);
	} else if (element.type === "capture") {
		const captureChildren = placeChildren(getChildren$2(store, element.id));
		content = (0, import_react.createElement)("div", {
			style: { display: "contents" },
			...commonProps
		}, captureChildren);
	} else if (element.type === "component") {
		const componentElement = element;
		const componentInfo = options.componentIndex?.[element.componentName];
		const hasChildrenProp = componentInfo?.props?.children !== void 0;
		const componentChildIds = getChildren$2(store, element.id);
		const hasChildren = componentChildIds.length > 0;
		const registryComponent = options.components?.[element.componentName];
		let renderSignature;
		try {
			renderSignature = JSON.stringify({
				props: element.props ?? null,
				styles: element.styles ?? null,
				children: componentChildIds,
				inspectsChildren: componentInfo?.inspectsChildren === true,
				revision: options.componentsRevision ?? 0
			});
		} catch {
			renderSignature = `${componentChildIds.join(",")}:${componentInfo?.inspectsChildren === true}:${options.componentsRevision ?? 0}`;
		}
		const renderKey = elementRenderKey(element.id, element.componentName);
		const crashedRender = crashedElementRenders.get(renderKey);
		const lastGoodComponent = lastGoodElementRenders.get(renderKey);
		const stillCrashed = (component) => !!component && !!crashedRender && crashedRender.component === component && crashedRender.signature === renderSignature;
		if (crashedRender && !stillCrashed(registryComponent) && !stillCrashed(lastGoodComponent)) crashedElementRenders.delete(renderKey);
		const Component = isRenderableComponent(registryComponent) && !stillCrashed(registryComponent) ? registryComponent : lastGoodComponent && !stillCrashed(lastGoodComponent) ? lastGoodComponent : void 0;
		const usingLastGood = !!Component && Component !== registryComponent;
		if (!Component) {
			const fallbackChildren = placeChildren(componentChildIds);
			if (!element.id.startsWith("el-draw-")) element._componentMissing = true;
			else if (element._componentMissing) delete element._componentMissing;
			content = (0, import_react.createElement)("div", {
				style: { ...element.styles },
				...commonProps
			}, fallbackChildren);
		} else {
			if (element._componentMissing) delete element._componentMissing;
			const componentMountKey = usingLastGood ? `${element.id}:last-good` : `${element.id}:r${options.componentsRevision ?? 0}`;
			const componentPositioned = isOutOfFlow(element.styles?.position);
			const { box, paint } = splitBoxStyles(element.styles);
			const propsStyle = asStyleObject(element.props?.style);
			const componentStyle = resolveStyleAssets(componentPositioned ? {
				...asStyleObject(paint),
				...element.styles?.width !== void 0 ? { width: "100%" } : null,
				...element.styles?.height !== void 0 ? { height: "100%" } : null,
				...propsStyle
			} : propsStyle ? {
				...asStyleObject(element.styles),
				...propsStyle
			} : element.styles, assetResolver);
			const wrapperStyle = componentPositioned ? box : { display: "contents" };
			const filteredProps = {};
			if (element.props) for (const [key, value] of Object.entries(element.props)) {
				if (key === "children") continue;
				if (key === "className") {
					const className = coerceClassName(value);
					if (className !== void 0) filteredProps.className = className;
					continue;
				}
				if (key === "style") {
					const style = asStyleObject(value);
					if (style) filteredProps.style = style;
					continue;
				}
				if (value !== void 0) filteredProps[key] = assetResolver && typeof value === "string" && looksLikeAssetPath(value) ? assetResolver(value) : value;
			}
			const isAsChildChild = options.isAsChildSlotTarget && element.type === "component";
			const isChildIntrospectionChild = isChildIntrospectionTarget && element.type === "component";
			let parentHasAsChild = filteredProps.asChild === true;
			const parentInspectsChildren = componentInfo?.inspectsChildren === true;
			if (options.isDragPreview && parentHasAsChild) filteredProps.asChild = false;
			if (parentHasAsChild) {
				const onlyChild = componentChildIds.length === 1 ? getById(store, componentChildIds[0]) : void 0;
				if (!(!!onlyChild && (onlyChild.type === "html" || onlyChild.type === "component"))) {
					filteredProps.asChild = false;
					parentHasAsChild = false;
				}
			}
			const renderedChildren = hasChildrenProp && !hasChildren ? renderSlot() : componentChildIds.map((childId) => renderChild(childId, {
				...options,
				isSVGContext: childSVGContext,
				isDragPreview,
				isAsChildSlotTarget: parentHasAsChild,
				isChildIntrospectionTarget: parentInspectsChildren,
				_currentParentId: element.id
			}));
			if (isAsChildChild || isChildIntrospectionChild) {
				if (lastGoodElementRenders.get(renderKey) !== Component) appendChildLastGoods(options._currentParentId, [{
					renderKey,
					component: Component
				}]);
				reparentChildLastGoods(element.id, options._currentParentId);
				return createComponentNode(Component, {
					...filteredProps,
					key: componentMountKey,
					style: componentStyle,
					...commonProps
				}, renderedChildren);
			}
			const childList = Array.isArray(renderedChildren) ? renderedChildren : [];
			const childrenToPass = parentHasAsChild && childList.length === 1 ? childList[0] : renderedChildren;
			const liveElement = createComponentNode(Component, {
				...filteredProps,
				key: componentMountKey,
				style: componentStyle
			}, childrenToPass);
			const boundaryProps = {
				elementId: element.id,
				elementName: element.componentName,
				elementProps: filteredProps,
				silent: element.id.startsWith("el-draw-"),
				onFixWithAI: options.onFixWithAI
			};
			const lastGoodFallback = lastGoodComponent && lastGoodComponent !== Component ? (0, import_react.createElement)(ElementErrorBoundary, {
				...boundaryProps,
				resetKey: [renderSignature]
			}, createComponentNode(lastGoodComponent, {
				...filteredProps,
				style: componentStyle
			}, childrenToPass)) : void 0;
			const componentInner = (0, import_react.createElement)(ElementErrorBoundary, {
				...boundaryProps,
				resetKey: [componentMountKey, renderSignature],
				fallback: lastGoodFallback,
				onCrash: () => {
					crashedElementRenders.set(renderKey, {
						component: Component,
						signature: renderSignature
					});
					if (usingLastGood) lastGoodElementRenders.delete(renderKey);
				}
			}, (0, import_react.createElement)(RememberLastGood, {
				elementId: element.id,
				component: Component,
				componentName: element.componentName,
				alsoRemember: takeChildLastGoods(element.id)
			}, liveElement));
			content = (0, import_react.createElement)("div", {
				style: wrapperStyle,
				...commonProps
			}, componentElement.frozenFallback ? (0, import_react.createElement)(LiveOrFrozen, {
				live: componentInner,
				frozen: renderedChildren
			}) : componentInner);
		}
	} else if (element.type === "icon") {
		const IconComponent = (options.iconLibraries?.[element.library])?.icons[element.iconName];
		if (!IconComponent || typeof IconComponent !== "function" && !(typeof IconComponent === "object" && IconComponent !== null && "$$typeof" in IconComponent)) content = (0, import_react.createElement)("div", {
			style: {
				...element.styles,
				width: Number(element.props?.size) || 16,
				height: Number(element.props?.size) || 16,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				border: "1px dashed #f59e0b",
				borderRadius: "2px",
				backgroundColor: "#fef3c7",
				color: "#92400e",
				fontSize: "10px"
			},
			title: `Icon not found: ${element.iconName} from ${element.library}`,
			...commonProps
		}, "?");
		else {
			const iconProps = { ...element.props };
			if (typeof iconProps.size === "string") {
				const num = Number(iconProps.size);
				if (!isNaN(num)) iconProps.size = num;
			}
			const hasNumericSize = typeof iconProps.size === "number";
			if (iconProps.size === void 0 && iconProps.width === void 0 && iconProps.height === void 0) {
				iconProps.width = 24;
				iconProps.height = 24;
			}
			if (hasNumericSize) {
				if (iconProps.width === void 0) iconProps.width = iconProps.size;
				if (iconProps.height === void 0) iconProps.height = iconProps.size;
			}
			const iconClassName = iconProps.className;
			if (iconProps.className) delete iconProps.className;
			const iconCssStyles = element.styles || {};
			content = (0, import_react.createElement)("span", {
				style: {
					display: "inline-flex",
					...iconCssStyles
				},
				...iconClassName ? { className: iconClassName } : {},
				...commonProps
			}, (0, import_react.createElement)(IconComponent, iconProps));
		}
	} else if (element.type === "webview") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebviewRenderer, {
		element,
		options
	}, element.id);
	const isTableElement = element.type === "html" && [
		"thead",
		"tbody",
		"tfoot",
		"tr",
		"th",
		"td",
		"colgroup",
		"col",
		"caption"
	].includes(element.tag);
	const needsInlineBlock = element.type === "html" && (["img", "video"].includes(element.tag) || isTopLevelSvg);
	const blockReplaced = needsInlineBlock && element.styles?.display === "block" && element.styles?.width !== void 0;
	if (options.isAsChildSlotTarget || isChildIntrospectionTarget) return content;
	if (isDragPreview || presentationMode || isSVGContext && !isSVGElement || isTableElement) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: content }, element.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraggableElement, {
		id: element.id,
		parentId: _currentParentId,
		needsBox: needsInlineBlock,
		display: blockReplaced ? "block" : void 0,
		width: needsInlineBlock ? element.styles?.width : void 0,
		height: needsInlineBlock ? element.styles?.height : void 0,
		boxStyle: wrapperBoxStyle,
		children: content
	}, element.id);
}
/**
* ⌥-drag a snapshot out of a component instance or a Live Preview onto the
* canvas. Owns the whole gesture after `start`: a ghost that follows the
* cursor (the element's box at first, the captured layers once the capture
* resolves), the canvas's edge auto-pan, and the drop, which hands the
* captured element to the editor at the ghost's top-left.
*
* Pointer moves and the release reach it either as host mouse events (window
* listeners it installs for the drag's lifetime) or through `move`/`finish`
* for gestures the host cannot see (a Live Preview's guest keeps the pressed
* pointer, so the guest relays them).
*/
function useSnapshotDrag(input) {
	const $ = (0, import_compiler_runtime.c)(18);
	const canvasScale = (0, import_react.useSyncExternalStore)(subscribeCameraScale, getCameraScale, getCameraScale);
	const inputRef = (0, import_react.useRef)(input);
	let t0;
	if ($[0] !== input) {
		t0 = () => {
			inputRef.current = input;
		};
		$[0] = input;
		$[1] = t0;
	} else t0 = $[1];
	(0, import_react.useLayoutEffect)(t0);
	const dragRef = (0, import_react.useRef)(null);
	const mountedRef = (0, import_react.useRef)(false);
	let t1;
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			mountedRef.current = true;
			return () => {
				mountedRef.current = false;
				dragRef.current?.detach();
				dragRef.current = null;
			};
		};
		t2 = [];
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	const ghostRef = (0, import_react.useRef)(null);
	const [ghost, setGhost] = (0, import_react.useState)(null);
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (clientX, clientY) => {
			const d = dragRef.current;
			if (!d) return;
			d.clientX = clientX;
			d.clientY = clientY;
			const el = ghostRef.current;
			if (el) el.style.transform = `translate(${Math.round(clientX - d.offsetX)}px, ${Math.round(clientY - d.offsetY)}px)`;
		};
		$[4] = t3;
	} else t3 = $[4];
	const move = t3;
	let t4;
	let t5;
	if ($[5] !== ghost) {
		t4 = () => {
			const d_0 = dragRef.current;
			if (ghost && d_0) move(d_0.clientX, d_0.clientY);
		};
		t5 = [ghost, move];
		$[5] = ghost;
		$[6] = t4;
		$[7] = t5;
	} else {
		t4 = $[6];
		t5 = $[7];
	}
	(0, import_react.useLayoutEffect)(t4, t5);
	let t6;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			if (!dragRef.current) return;
			dragRef.current.detach();
			dragRef.current = null;
			setGhost(null);
			inputRef.current.onEnd?.();
		};
		$[8] = t6;
	} else t6 = $[8];
	const cancel = t6;
	let t7;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = (clientX_0, clientY_0) => {
			const d_1 = dragRef.current;
			if (!d_1) return;
			d_1.detach();
			dragRef.current = null;
			setGhost(null);
			const current = inputRef.current;
			current.onEnd?.();
			if (current.isHomeAt?.(clientX_0, clientY_0)) return;
			d_1.payload.then((captured) => {
				if (!mountedRef.current) return;
				if (!captured) {
					toast.error("Could not snapshot that element");
					return;
				}
				inputRef.current.onPlace?.(captured, {
					clientX: clientX_0 - d_1.offsetX,
					clientY: clientY_0 - d_1.offsetY,
					pointerX: clientX_0,
					pointerY: clientY_0
				});
			});
		};
		$[9] = t7;
	} else t7 = $[9];
	const finish = t7;
	let t8;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = (d_2) => {
			dragRef.current?.detach();
			const onMove = (e) => move(e.clientX, e.clientY);
			const onUp = (e_0) => finish(e_0.clientX, e_0.clientY);
			const onKey = (e_1) => {
				if (e_1.key !== "Escape") return;
				e_1.preventDefault();
				e_1.stopPropagation();
				cancel();
			};
			window.addEventListener("mousemove", onMove, true);
			window.addEventListener("mouseup", onUp, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("blur", cancel);
			window.addEventListener("pointercancel", cancel);
			const viewport = inputRef.current.viewportOf();
			const stopEdgePan = viewport && inputRef.current.onViewportPan ? startEdgePanLoop({
				getPointer: () => dragRef.current ? {
					x: dragRef.current.clientX,
					y: dragRef.current.clientY
				} : null,
				viewport,
				pan: (dx, dy) => inputRef.current.onViewportPan?.(-dx, -dy)
			}) : null;
			const payload = d_2.payload.catch(_temp$100);
			payload.then((captured_0) => {
				if (captured_0 && dragRef.current?.payload === payload) setGhost((g) => g ? {
					...g,
					element: captured_0
				} : g);
			});
			dragRef.current = {
				payload,
				offsetX: d_2.clientX - d_2.box.left,
				offsetY: d_2.clientY - d_2.box.top,
				clientX: d_2.clientX,
				clientY: d_2.clientY,
				detach: () => {
					stopEdgePan?.();
					window.removeEventListener("mousemove", onMove, true);
					window.removeEventListener("mouseup", onUp, true);
					window.removeEventListener("keydown", onKey, true);
					window.removeEventListener("blur", cancel);
					window.removeEventListener("pointercancel", cancel);
				}
			};
			setGhost({
				width: d_2.box.width,
				height: d_2.box.height,
				label: d_2.label,
				element: null
			});
		};
		$[10] = t8;
	} else t8 = $[10];
	const start = t8;
	let t9;
	if ($[11] !== canvasScale || $[12] !== ghost || $[13] !== input) {
		t9 = ghost ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: ghostRef,
			"data-drag-overlay": "",
			style: {
				position: "fixed",
				left: 0,
				top: 0,
				zIndex: 1e4,
				pointerEvents: "none",
				width: ghost.width,
				height: ghost.height,
				outline: PICK_SELECT_OUTLINE,
				background: ghost.element ? void 0 : "color-mix(in oklch, var(--ed-canvas-selection) 8%, transparent)",
				willChange: "transform"
			},
			children: [ghost.element && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					transform: `scale(${canvasScale})`,
					transformOrigin: "top left",
					width: ghost.width / canvasScale,
					height: ghost.height / canvasScale,
					overflow: "hidden",
					opacity: .9
				},
				children: renderTree(ghost.element.id, ensureV2([ghost.element]), {
					isDragPreview: true,
					presentationMode: true,
					components: input.renderOptions.components,
					iconLibraries: input.renderOptions.iconLibraries,
					assetResolver: input.renderOptions.assetResolver
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					...pickLabelStyle,
					position: "absolute",
					left: 0,
					top: -1,
					transform: "translateY(-100%)"
				},
				children: ghost.label
			})]
		}), document.body) : null;
		$[11] = canvasScale;
		$[12] = ghost;
		$[13] = input;
		$[14] = t9;
	} else t9 = $[14];
	const ghostNode = t9;
	const t10 = ghost !== null;
	let t11;
	if ($[15] !== ghostNode || $[16] !== t10) {
		t11 = {
			start,
			move,
			finish,
			cancel,
			isDragging: t10,
			ghost: ghostNode
		};
		$[15] = ghostNode;
		$[16] = t10;
		$[17] = t11;
	} else t11 = $[17];
	return t11;
}
function _temp$100() {
	return null;
}
/**
* WebviewRenderer - Embeds a live URL (e.g., localhost:3000) on the canvas.
*
* In Electron: renders a <webview> tag (own session, real browser cookies).
* On the web: falls back to an <iframe>.
*
* Includes a "Capture" button that extracts the DOM tree (enriched with React
* Fiber data) and places it as FEElements on the canvas.
*/
var ElectronWebview = "webview";
/**
* Run code in the guest's pick world: the isolated world of the webview
* preload, where `buildPickScript` runs and the page cannot reach. Resolves
* with the result, or null when the guest isn't attached.
*/
function runInPickWorld(wv, code) {
	const api = window.api;
	if (!api || typeof wv?.getWebContentsId !== "function") return Promise.resolve(null);
	try {
		return api.invoke("webview_execute_isolated", {
			webContentsId: wv.getWebContentsId(),
			code
		}).catch(() => null);
	} catch {
		return Promise.resolve(null);
	}
}
/**
* Snapshot the guest's page, or the element picked inside it, with the same
* capture the Chrome extension runs. Null when the guest has nothing to give.
*/
async function snapshotGuest(wv) {
	try {
		await ensureCaptureArtifactInWebview(wv);
		await wv.executeJavaScript(buildSnapshotScript());
		const picked = await runInPickWorld(wv, "window.__lgPick ? window.__lgPick.capturePick() : null");
		return (picked ? parseCaptureJson(picked) : await runCaptureInWebview(wv, "window.__lgSnapshot.capture(null)"))?.elements[0] ?? null;
	} catch (err) {
		console.error("[WebviewSnapshot] failed:", err);
		return null;
	}
}
/** A guest pick as the host's fingerprint of it, tagged with its preview. */
function pickFingerprint(sel, previewId) {
	return {
		tag: sel.tag,
		className: sel.className,
		text: sel.text,
		file: sel.file,
		componentName: sel.componentName,
		visibleText: sel.visibleText,
		frames: sel.frames,
		previewId
	};
}
/** How long a source lookup in the page may take before the chip goes in without it. */
var SOURCE_LOOKUP_MS = 3e3;
function isSourceLine(value) {
	const v = value;
	return !!v && typeof v.file === "string" && typeof v.line === "number";
}
/**
* Comment-mode hover inside a Live Preview: ask the guest what is under the
* pointer and outline it. The probe answers in host px; the outline lives in
* the frame (unscaled, inside the canvas transform), so it is drawn in guest
* px. One probe in flight; a move during it queues exactly one more.
*/
function probeCommentHover(wv, state, boxRef) {
	const probe = liveProbeFor(wv);
	if (!probe || state.busy) return;
	state.busy = true;
	state.pending = false;
	probe(state.x, state.y).then((hit) => {
		state.busy = false;
		const box = boxRef.current;
		if (box) {
			if (!hit) box.style.display = "none";
			else {
				const rect = wv.getBoundingClientRect();
				const sx = rect.width / (wv.offsetWidth || 1);
				const sy = rect.height / (wv.offsetHeight || 1);
				box.style.display = "block";
				box.style.transform = `translate(${Math.round((hit.left - rect.left) / sx)}px, ${Math.round((hit.top - rect.top) / sy)}px)`;
				box.style.width = `${Math.round(hit.width / sx)}px`;
				box.style.height = `${Math.round(hit.height / sy)}px`;
			}
		}
		if (state.pending) probeCommentHover(wv, state, boxRef);
	}, () => {
		state.busy = false;
	});
}
/**
* Build the self-contained JS we inject into the guest document to drive
* Inspect mode. `enable=false` returns a teardown snippet that calls the
* cleanup the enable-pass stashed on `window.__lgInspectCleanup`.
*
* The inspector reads the React fiber off the hovered DOM node, climbs to the
* nearest named component, and draws a highlight + a `Component  file:line`
* label. Component name comes from `fiber.type` (works on any React build);
* the source file comes from `_debugSource`, which only exists on dev builds
* (React <= 18). On a production or React-19 guest the name still resolves but
* the file may be absent — we show "(no React source)" in that case.
*/
function buildInspectorScript(enable) {
	if (!enable) return `(function(){try{if(window.__lgInspectCleanup){window.__lgInspectCleanup();window.__lgInspectCleanup=null;}}catch(e){}})()`;
	return `(function(){
  try {
    if (window.__lgInspectCleanup) { window.__lgInspectCleanup(); window.__lgInspectCleanup = null; }
    var box = document.createElement('div');
    box.setAttribute('data-lg-pick-ui', '');
    box.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:1px solid #6366f1;background:rgba(99,102,241,0.12);border-radius:2px;display:none;';
    var label = document.createElement('div');
    label.setAttribute('data-lg-pick-ui', '');
    label.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;background:#1f2328;color:#fff;font:500 11px -apple-system,system-ui,sans-serif;padding:3px 7px;border-radius:5px;white-space:nowrap;display:none;box-shadow:0 2px 8px rgba(0,0,0,.3);';
    document.body.appendChild(box); document.body.appendChild(label);
    function getFiber(node){ for (var k in node){ if (k.indexOf('__reactFiber$')===0 || k.indexOf('__reactInternalInstance$')===0) return node[k]; } return null; }
    function compName(t){ if (!t || typeof t === 'string') return null; return t.displayName || t.name || (t.render && (t.render.displayName||t.render.name)) || null; }
    function resolve(node){
      var f = getFiber(node), name = null, src = null;
      while (f){
        if (!name){ var n = compName(f.type); if (n){ name = n; if (f._debugSource) src = f._debugSource; } }
        if (!src && name && f._debugSource) src = f._debugSource;
        if (name && src) break;
        f = f.return;
      }
      return { name: name, src: src };
    }
    var raf = 0;
    function onMove(e){
      if (raf) return;
      raf = requestAnimationFrame(function(){
        raf = 0;
        var el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el === box || el === label) return;
        var r = el.getBoundingClientRect();
        box.style.display='block'; box.style.left=r.left+'px'; box.style.top=r.top+'px';
        box.style.width=r.width+'px'; box.style.height=r.height+'px';
        var info = resolve(el);
        var tag = el.tagName ? el.tagName.toLowerCase() : '';
        var text;
        if (info.name){
          var file = info.src ? String(info.src.fileName||'').split('/').slice(-2).join('/') : '';
          text = info.name + (file ? '   ' + file + (info.src.lineNumber ? (':'+info.src.lineNumber) : '') : '');
        } else { text = tag + '   (no React source)'; }
        label.textContent = text; label.style.display='block';
        var ly = r.top - 22; if (ly < 2) ly = r.top + 4;
        label.style.left = Math.max(2, r.left) + 'px'; label.style.top = ly + 'px';
      });
    }
    function onLeave(){ box.style.display='none'; label.style.display='none'; }
    // Click an element to open its source in the bottom bar. Stash it so the
    // host can fingerprint + resolve it the same way Edit does (one resolver).
    function onClick(e){
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el === box || el === label) return;
      e.preventDefault(); e.stopPropagation();
      window.__lgEditTarget = el;
      console.log('__LGINSPECT_CLICK');
    }
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseleave', onLeave, true);
    document.addEventListener('click', onClick, true);
    window.__lgInspectCleanup = function(){
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseleave', onLeave, true);
      document.removeEventListener('click', onClick, true);
      if (raf) cancelAnimationFrame(raf);
      box.remove(); label.remove();
    };
  } catch(e){ /* guest not ready */ }
})()`;
}
/**
* Editor-mode guest script. On click it selects the element, reads its source
* location from the React fiber (`_debugSource`), and emits the selection to
* the host via `console.log('__LGEDIT_SELECT ...')` (the webview surfaces it as
* a `console-message` event, which the page can forge too). It also exposes
* `window.__lgEditPreview*` so the host can apply OPTIMISTIC visual changes
* (inline style) instantly, before the deterministic source write commits.
*/
function buildEditorScript(enable) {
	if (!enable) return `(function(){try{if(window.__lgEditCleanup){window.__lgEditCleanup();window.__lgEditCleanup=null;}}catch(e){}})()`;
	return `(function(){
  try {
    if (window.__lgEditCleanup) { window.__lgEditCleanup(); window.__lgEditCleanup = null; }
    var hov = document.createElement('div');
    hov.setAttribute('data-lg-pick-ui', '');
    hov.style.cssText='position:fixed;z-index:2147483640;pointer-events:none;border:1px dashed #6366f1;border-radius:2px;display:none;';
    var sel = document.createElement('div');
    sel.setAttribute('data-lg-pick-ui', '');
    sel.style.cssText='position:fixed;z-index:2147483641;pointer-events:none;border:2px solid #6366f1;border-radius:2px;box-shadow:0 0 0 3px rgba(99,102,241,.2);display:none;';
    document.body.appendChild(hov); document.body.appendChild(sel);
    function place(box, el){ var r=el.getBoundingClientRect(); box.style.display='block'; box.style.left=r.left+'px'; box.style.top=r.top+'px'; box.style.width=r.width+'px'; box.style.height=r.height+'px'; }
    var raf=0;
    function onMove(e){ if(raf)return; raf=requestAnimationFrame(function(){ raf=0; var el=document.elementFromPoint(e.clientX,e.clientY); if(!el||el===hov||el===sel)return; place(hov,el); }); }
    function onClick(e){
      e.preventDefault(); e.stopPropagation();
      var el=e.target; if(!el||el===hov||el===sel) return;
      window.__lgEditTarget=el; place(sel,el);
      // Source location is resolved on the HOST via the capture pipeline
      // (source maps), not here — raw _debugSource is unreliable.
      var payload={ tag:(el.tagName||'').toLowerCase(), className:(el.getAttribute&&el.getAttribute('class'))||'', text:(el.children&&el.children.length===0)?el.textContent:null };
      console.log('__LGEDIT_SELECT '+JSON.stringify(payload));
    }
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    // Track previewed elements + their original class/style/text so CLEAR can
    // restore them after Save — then the screen shows only the live HMR'd source.
    window.__lgPreviewed = window.__lgPreviewed || [];
    function stash(el){ if(!el.__lgOrig){ el.__lgOrig={ style:el.getAttribute('style'), cls:el.getAttribute('class'), text:null }; window.__lgPreviewed.push(el); } }
    window.__lgEditPreviewSpacing=function(axis,val){ var el=window.__lgEditTarget; if(!el)return; stash(el); var rem=(Number(val)*0.25)+'rem'; if(axis==='y'){el.style.paddingTop=rem;el.style.paddingBottom=rem;} else {el.style.paddingLeft=rem;el.style.paddingRight=rem;} place(sel,el); };
    window.__lgEditPreviewText=function(t){ var el=window.__lgEditTarget; if(el){ stash(el); if(el.__lgOrig.text===null) el.__lgOrig.text=el.textContent; el.textContent=t; place(sel,el); } };
    window.__lgEditPreviewClassName=function(c){ var el=window.__lgEditTarget; if(el){ stash(el); el.setAttribute('class', c); place(sel,el); } };
    window.__lgEditPreviewStyle=function(s){ var el=window.__lgEditTarget; if(!el)return; stash(el); try{ var o=(typeof s==='string')?JSON.parse(s):s; for(var k in o){ el.style[k]=o[k]; } }catch(e){} place(sel,el); };
    window.__lgClearPreviews=function(){ (window.__lgPreviewed||[]).forEach(function(el){ var o=el.__lgOrig; if(!o)return; if(o.style===null)el.removeAttribute('style'); else el.setAttribute('style',o.style); if(o.cls===null)el.removeAttribute('class'); else el.setAttribute('class',o.cls); if(o.text!==null)el.textContent=o.text; delete el.__lgOrig; }); window.__lgPreviewed=[]; sel.style.display='none'; };
    // After SAVE, the preview already shows the saved value, so drop the stash
    // WITHOUT restoring (restoring would flash the old value). HMR will re-render
    // the same value moments later. Differs from Clear, which reverts.
    window.__lgFinalizePreviews=function(){ (window.__lgPreviewed||[]).forEach(function(el){ delete el.__lgOrig; }); window.__lgPreviewed=[]; sel.style.display='none'; };
    // Resolve once the live app actually re-renders (first real DOM mutation that
    // isn't our own overlay), or after a timeout. Lets the host show "syncing".
    window.__lgWatchSync=function(timeoutMs){ return new Promise(function(resolve){ var done=false; function fin(r){ if(done)return; done=true; try{obs.disconnect();}catch(e){} clearTimeout(tm); resolve(r); } var obs; try{ obs=new MutationObserver(function(muts){ for(var i=0;i<muts.length;i++){ var t=muts[i].target; if(t===sel||t===hov||(sel.contains&&sel.contains(t))||(hov.contains&&hov.contains(t)))continue; fin('hmr'); return; } }); obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,characterData:true}); }catch(e){ resolve('no-observe'); return; } var tm=setTimeout(function(){ fin('timeout'); }, timeoutMs||4000); }); };
    window.__lgEditCleanup=function(){ document.removeEventListener('mousemove',onMove,true); document.removeEventListener('click',onClick,true); if(raf)cancelAnimationFrame(raf); if(window.__lgClearPreviews)window.__lgClearPreviews(); hov.remove(); sel.remove(); window.__lgEditTarget=null; window.__lgEditPreviewSpacing=null; window.__lgEditPreviewText=null; window.__lgEditPreviewClassName=null; window.__lgEditPreviewStyle=null; window.__lgClearPreviews=null; window.__lgFinalizePreviews=null; window.__lgWatchSync=null; };
  } catch(e){ /* guest not ready */ }
})()`;
}
/** The frame around the page: the address bar row, and the padding beside and below the page. */
var PREVIEW_TOOLBAR_HEIGHT = 56;
var PREVIEW_PADDING = 8;
var PREVIEW_CHROME_WIDTH = 20;
var PREVIEW_CHROME_HEIGHT = 68;
var MIN_PAGE_SIZE$1 = 200;
/** Fit to the page stops here: an endless feed would otherwise make a preview tens of thousands of px tall. */
var MAX_FIT_HEIGHT = 2e4;
/**
* A preview's page size. `styles.width/height` is the whole frame's box, as
* for any layer (the canvas's resize handles write it); without it the
* element's viewport fields are the page.
*/
function previewPageSize(element) {
	const styles = element.styles;
	return {
		width: typeof styles?.width === "number" ? styles.width - PREVIEW_CHROME_WIDTH : element.viewportWidth,
		height: typeof styles?.height === "number" ? styles.height - PREVIEW_CHROME_HEIGHT : element.viewportHeight || 600
	};
}
/** A preview's frame box: what `styles.width/height` hold, and what its own edges resize. */
function previewFrameSize(element) {
	const page = previewPageSize(element);
	return {
		width: page.width + PREVIEW_CHROME_WIDTH,
		height: page.height + PREVIEW_CHROME_HEIGHT
	};
}
/** The page inside a frame box of `frame`'s size. */
function previewPageOfFrame(frame) {
	return {
		width: frame.width - PREVIEW_CHROME_WIDTH,
		height: frame.height - PREVIEW_CHROME_HEIGHT
	};
}
/** The smallest frame box: the smallest page, in its chrome. */
var PREVIEW_MIN_FRAME_SIZE = {
	width: 220,
	height: 268
};
/** Where something taken out of a preview lands: on the canvas, just right of the preview's frame. */
function besidePreview(element) {
	return {
		x: (element.canvasPosition?.x ?? 0) + previewPageSize(element).width + PREVIEW_CHROME_WIDTH + 100,
		y: element.canvasPosition?.y ?? 0
	};
}
var ADDRESS_BUTTON_STYLE = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: 26,
	height: 26,
	borderRadius: 999,
	flexShrink: 0,
	color: "var(--ed-muted-foreground)",
	background: "transparent",
	border: "none",
	cursor: "default"
};
/**
* The address pill on the preview's frame: shows where the page is, takes a
* new URL (Enter goes, Esc or leaving the field puts it back, like a browser),
* reloads, and fits the preview to the page's height. Its own component so typing re-renders only the field.
*/
function PreviewAddressBar(t0) {
	const $ = (0, import_compiler_runtime.c)(36);
	const { url, readOnly, onGo, onReload, fitted, onToggleFit } = t0;
	const [draft, setDraft] = (0, import_react.useState)(null);
	let shown = url;
	try {
		let t1;
		if ($[0] !== url) {
			t1 = new URL(url);
			$[0] = url;
			$[1] = t1;
		} else t1 = $[1];
		const parsed = t1;
		shown = `${parsed.origin}${parsed.pathname}`;
	} catch {}
	let t1;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			width: 400,
			height: 40,
			display: "flex",
			alignItems: "center",
			gap: 8,
			background: "var(--ed-field)",
			border: "1px solid var(--ed-field-border)",
			boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
			borderRadius: 999,
			paddingLeft: 14,
			paddingRight: 8,
			fontSize: 12,
			color: "var(--ed-foreground)"
		};
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeIcon, {
			width: 14,
			height: 14,
			style: {
				color: "var(--ed-muted-foreground)",
				flexShrink: 0
			}
		});
		$[3] = t2;
	} else t2 = $[3];
	const t3 = draft ?? shown;
	let t4;
	if ($[4] !== readOnly || $[5] !== url) {
		t4 = (e) => {
			if (!readOnly) {
				setDraft(url);
				requestAnimationFrame(() => e.target.select());
			}
		};
		$[4] = readOnly;
		$[5] = url;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	let t6;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (e_0) => setDraft(e_0.target.value);
		t6 = () => setDraft(null);
		$[7] = t5;
		$[8] = t6;
	} else {
		t5 = $[7];
		t6 = $[8];
	}
	let t7;
	if ($[9] !== draft || $[10] !== onGo) {
		t7 = (e_1) => {
			if (e_1.key === "Enter" && draft != null) {
				const next = normalizePreviewUrl(draft);
				if (next) onGo(next);
				e_1.currentTarget.blur();
			} else if (e_1.key === "Escape") {
				e_1.stopPropagation();
				e_1.currentTarget.blur();
			}
		};
		$[9] = draft;
		$[10] = onGo;
		$[11] = t7;
	} else t7 = $[11];
	const t8 = readOnly ? "default" : "text";
	let t9;
	if ($[12] !== t8) {
		t9 = {
			flex: 1,
			minWidth: 0,
			height: "100%",
			textOverflow: "ellipsis",
			background: "transparent",
			border: "none",
			outline: "none",
			color: "inherit",
			font: "inherit",
			cursor: t8
		};
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== readOnly || $[15] !== t3 || $[16] !== t4 || $[17] !== t7 || $[18] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			"aria-label": "Preview URL",
			value: t3,
			readOnly,
			spellCheck: false,
			onFocus: t4,
			onChange: t5,
			onBlur: t6,
			onKeyDown: t7,
			onClick: _temp$98,
			style: t9
		});
		$[14] = readOnly;
		$[15] = t3;
		$[16] = t4;
		$[17] = t7;
		$[18] = t9;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== onReload) {
		t11 = (e_3) => {
			e_3.stopPropagation();
			onReload();
		};
		$[20] = onReload;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r$15, { size: 14 });
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== t11) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Reload",
				onClick: t11,
				style: ADDRESS_BUTTON_STYLE,
				children: t12
			})
		});
		$[23] = t11;
		$[24] = t13;
	} else t13 = $[24];
	let t14;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: "Reload"
		});
		$[25] = t14;
	} else t14 = $[25];
	let t15;
	if ($[26] !== t13) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t13, t14] });
		$[26] = t13;
		$[27] = t15;
	} else t15 = $[27];
	let t16;
	if ($[28] !== fitted || $[29] !== onToggleFit || $[30] !== readOnly) {
		t16 = !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": fitted ? "Restore height" : "Fit to page height",
				"aria-pressed": fitted,
				onClick: (e_4) => {
					e_4.stopPropagation();
					onToggleFit();
				},
				style: {
					...ADDRESS_BUTTON_STYLE,
					color: fitted ? "var(--ed-foreground)" : "var(--ed-muted-foreground)"
				},
				children: fitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretUpIcon, {
					width: 14,
					height: 14
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
					width: 14,
					height: 14
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: fitted ? "Restore height" : "Fit to page height"
		})] });
		$[28] = fitted;
		$[29] = onToggleFit;
		$[30] = readOnly;
		$[31] = t16;
	} else t16 = $[31];
	let t17;
	if ($[32] !== t10 || $[33] !== t15 || $[34] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t1,
			children: [
				t2,
				t10,
				t15,
				t16
			]
		});
		$[32] = t10;
		$[33] = t15;
		$[34] = t16;
		$[35] = t17;
	} else t17 = $[35];
	return t17;
}
/**
* What the canvas drags in place of a Live Preview. A copy of the preview
* would be a second <webview> that loads the page from scratch (blank, then
* scrolled to the top), so the drag copy is an empty box the frame's size and
* the real preview follows it every frame. Its offset is a Web Animation
* whose keyframes are replaced as the copy moves (compositor-only; an inline
* transform re-layerizes the whole page each frame, see useDndCanvas), so the
* page never reloads; the drop moves the layer itself.
*/
function _temp$98(e_2) {
	return e_2.stopPropagation();
}
function WebviewDragStandIn(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { element } = t0;
	const boxRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== element.id) {
		t1 = () => {
			const box = boxRef.current;
			const frame = document.querySelector(`[data-element-id="${CSS.escape(element.id)}"][data-drag-follows]`);
			if (!box || !frame) return;
			const still = { transform: "translate(0px, 0px)" };
			const animation = frame.animate([still, still], {
				duration: 864e5,
				fill: "forwards"
			});
			let x = 0;
			let y = 0;
			let raf = 0;
			const follow = () => {
				const target = box.getBoundingClientRect();
				const current = frame.getBoundingClientRect();
				const dx = target.left - current.left;
				const dy = target.top - current.top;
				if (Math.abs(dx) >= .5 || Math.abs(dy) >= .5) {
					const scale = frame.offsetWidth ? current.width / frame.offsetWidth : 1;
					x = x + dx / scale;
					y = y + dy / scale;
					const at = { transform: `translate(${x}px, ${y}px)` };
					animation.effect.setKeyframes([at, at]);
				}
				raf = requestAnimationFrame(follow);
			};
			follow();
			return () => {
				cancelAnimationFrame(raf);
				animation.cancel();
			};
		};
		t2 = [element.id];
		$[0] = element.id;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	const styles = element.styles;
	const t3 = styles?.width;
	const t4 = styles?.height;
	let t5;
	if ($[3] !== t3 || $[4] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: boxRef,
			style: {
				width: t3,
				height: t4
			}
		});
		$[3] = t3;
		$[4] = t4;
		$[5] = t5;
	} else t5 = $[5];
	return t5;
}
function WebviewRenderer(t0) {
	const $ = (0, import_compiler_runtime.c)(311);
	const { element, options } = t0;
	const embedRef = (0, import_react.useRef)(null);
	const wrapperRef = (0, import_react.useRef)(null);
	const selectSeqRef = (0, import_react.useRef)(0);
	const [captureStatus, setCaptureStatus] = (0, import_react.useState)(null);
	const [pendingAllowPath, setPendingAllowPath] = (0, import_react.useState)(null);
	const [, setEditStatus] = (0, import_react.useState)(null);
	const ws = useWebviewEditState();
	let t1;
	if ($[0] !== element) {
		t1 = previewPageSize(element);
		$[0] = element;
		$[1] = t1;
	} else t1 = $[1];
	const page = t1;
	const { activeTool } = useActiveTool();
	const commentMode = activeTool === "comment";
	const inert = activeTool === "pan";
	const ownsSession = !options.isDragPreview && ws.activeWebviewId === element.id;
	let t2;
	if ($[2] !== element.id) {
		t2 = (s) => s.selectedElementIds.size === 1 && s.selectedElementIds.has(element.id);
		$[2] = element.id;
		$[3] = t2;
	} else t2 = $[3];
	const selectedNow = useSelection(t2);
	const isSelected = !options.isDragPreview && selectedNow;
	const inspectEnabled = ownsSession && ws.mode === "inspect" && !commentMode;
	const editModeEnabled = ownsSession && ws.mode === "edit" && !commentMode;
	const setSelected = webviewEditStore.setSelection;
	const canvasScale = (0, import_react.useSyncExternalStore)(subscribeCameraScale, getCameraScale, getCameraScale);
	const inverseScale = 1 / canvasScale;
	let t3;
	if ($[4] !== element.canvasPosition?.x || $[5] !== element.canvasPosition?.y || $[6] !== element.src || $[7] !== element.viewportWidth || $[8] !== options.allowedPaths || $[9] !== options.components || $[10] !== options.onAddAllowedPath || $[11] !== options.onAddElement || $[12] !== ws.captureMode) {
		t3 = async () => {
			const mode = ws.captureMode;
			const embed = embedRef.current;
			if (!embed) {
				setCaptureStatus("No embed");
				return;
			}
			const knownComponents = mode === "components" && options.components ? Object.keys(options.components) : [];
			let currentSourceUrl = element.src;
			let result;
			if (IS_ELECTRON) {
				const wv = embed;
				let guestUrl;
				try {
					if (typeof wv.getURL === "function") guestUrl = wv.getURL();
				} catch {}
				if (guestUrl) currentSourceUrl = guestUrl;
				try {
					result = await captureFromWebview(wv, { knownComponents });
				} catch (t4) {
					console.error("[WebviewCapture] executeJavaScript threw:", t4);
					setCaptureStatus("Capture failed (see console)");
					setTimeout(() => setCaptureStatus(null), 3e3);
					return;
				}
			} else {
				const iframe = embed;
				let doc;
				try {
					doc = iframe.contentDocument;
				} catch {
					setCaptureStatus("Cannot access iframe (cross-origin)");
					return;
				}
				if (!doc) {
					setCaptureStatus("No document in iframe");
					return;
				}
				currentSourceUrl = doc.location.href;
				result = await captureFromIframe(doc, { knownComponents });
			}
			if (!result || result.elements.length === 0) {
				setCaptureStatus("No React tree found — page may be a production build");
				setTimeout(() => setCaptureStatus(null), 5e3);
				return;
			}
			setCaptureStatus(`Rendering ${result.elementCount} elements…`);
			if (options.onAddElement) {
				const containerId = `html-capture-${Date.now()}`;
				startLog(containerId);
				const detectedRepoRoot = result.projectRoot || detectRepoRootFromCapture(result.elements);
				const capturedRenderedWidth = element.viewportWidth + 364;
				const container = {
					id: containerId,
					type: "html",
					tag: "div",
					props: {
						"data-component": "CapturedPage",
						"data-source-url": currentSourceUrl,
						...detectedRepoRoot ? { "data-detected-repo-root": detectedRepoRoot } : {}
					},
					styles: {
						width: element.viewportWidth,
						minHeight: 200
					},
					children: result.elements,
					canvasPosition: {
						x: (element.canvasPosition?.x || 0) - capturedRenderedWidth - 100,
						y: element.canvasPosition?.y || 0
					}
				};
				(0, import_react.startTransition)(() => {
					options.onAddElement(container);
				});
				if (options.onAddAllowedPath && detectedRepoRoot && !(options.allowedPaths || []).some((p) => detectedRepoRoot === p || detectedRepoRoot.startsWith(p + "/"))) setPendingAllowPath(detectedRepoRoot);
			}
			setTimeout(() => setCaptureStatus(null), 3e3);
		};
		$[4] = element.canvasPosition?.x;
		$[5] = element.canvasPosition?.y;
		$[6] = element.src;
		$[7] = element.viewportWidth;
		$[8] = options.allowedPaths;
		$[9] = options.components;
		$[10] = options.onAddAllowedPath;
		$[11] = options.onAddElement;
		$[12] = ws.captureMode;
		$[13] = t3;
	} else t3 = $[13];
	const handleCapture = (0, import_react.useEffectEvent)(t3);
	let t4;
	let t5;
	if ($[14] !== inspectEnabled) {
		t4 = () => {
			if (!IS_ELECTRON) return;
			const wv_0 = embedRef.current;
			if (!wv_0 || typeof wv_0.executeJavaScript !== "function") return;
			try {
				wv_0.executeJavaScript(buildInspectorScript(inspectEnabled)).catch(_temp2$62);
			} catch {}
		};
		t5 = [inspectEnabled];
		$[14] = inspectEnabled;
		$[15] = t4;
		$[16] = t5;
	} else {
		t4 = $[15];
		t5 = $[16];
	}
	(0, import_react.useEffect)(t4, t5);
	let t6;
	let t7;
	if ($[17] !== inspectEnabled) {
		t6 = () => {
			if (!IS_ELECTRON) return;
			const wv_1 = embedRef.current;
			if (!wv_1 || typeof wv_1.addEventListener !== "function") return;
			const reinject = () => {
				if (inspectEnabled) try {
					wv_1.executeJavaScript(buildInspectorScript(true)).catch(_temp3$44);
				} catch {}
			};
			wv_1.addEventListener("did-finish-load", reinject);
			return () => wv_1.removeEventListener("did-finish-load", reinject);
		};
		t7 = [inspectEnabled];
		$[17] = inspectEnabled;
		$[18] = t6;
		$[19] = t7;
	} else {
		t6 = $[18];
		t7 = $[19];
	}
	(0, import_react.useEffect)(t6, t7);
	let t8;
	let t9;
	if ($[20] !== inspectEnabled || $[21] !== options) {
		t8 = () => {
			if (!IS_ELECTRON || !inspectEnabled) return;
			const wv_2 = embedRef.current;
			if (!wv_2 || typeof wv_2.addEventListener !== "function") return;
			const onConsole = (e) => {
				if (e?.message !== "__LGINSPECT_CLICK") return;
				getTargetFingerprint(wv_2).then(async (fp) => {
					if (!fp?.file) return;
					const res = await window.api?.invoke("resolve_element", {
						filePath: fp.file,
						tag: fp.tag,
						className: fp.className,
						text: fp.text
					});
					options.onOpenFile?.(res?.ok ? res.filePath : fp.file, res?.ok ? res.line : void 0);
				});
			};
			wv_2.addEventListener("console-message", onConsole);
			return () => wv_2.removeEventListener("console-message", onConsole);
		};
		t9 = [inspectEnabled, options];
		$[20] = inspectEnabled;
		$[21] = options;
		$[22] = t8;
		$[23] = t9;
	} else {
		t8 = $[22];
		t9 = $[23];
	}
	(0, import_react.useEffect)(t8, t9);
	let t10;
	if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = (script) => {
			const wv_3 = embedRef.current;
			if (!wv_3 || typeof wv_3.executeJavaScript !== "function") return;
			try {
				wv_3.executeJavaScript(script).catch(_temp4$38);
			} catch {}
		};
		$[24] = t10;
	} else t10 = $[24];
	const runInGuest = t10;
	let t11;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = (code) => {
			runInPickWorld(embedRef.current, code);
		};
		$[25] = t11;
	} else t11 = $[25];
	const runPick = t11;
	let t12;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = (script_0) => {
			const wv_4 = embedRef.current;
			if (!wv_4 || typeof wv_4.executeJavaScript !== "function") return Promise.resolve(null);
			try {
				return wv_4.executeJavaScript(script_0).catch(_temp5$33);
			} catch {
				return Promise.resolve(null);
			}
		};
		$[26] = t12;
	} else t12 = $[26];
	const runInGuestAsync = t12;
	let t13;
	let t14;
	if ($[27] !== editModeEnabled || $[28] !== ownsSession) {
		t13 = () => {
			if (!IS_ELECTRON) return;
			runInGuest(buildEditorScript(editModeEnabled));
			if (!editModeEnabled && ownsSession) setSelected(null);
		};
		t14 = [
			editModeEnabled,
			runInGuest,
			setSelected,
			ownsSession
		];
		$[27] = editModeEnabled;
		$[28] = ownsSession;
		$[29] = t13;
		$[30] = t14;
	} else {
		t13 = $[29];
		t14 = $[30];
	}
	(0, import_react.useEffect)(t13, t14);
	let t15;
	let t16;
	if ($[31] !== editModeEnabled) {
		t15 = () => {
			if (!IS_ELECTRON) return;
			const wv_5 = embedRef.current;
			if (!wv_5 || typeof wv_5.addEventListener !== "function") return;
			const reinject_0 = () => {
				if (editModeEnabled) runInGuest(buildEditorScript(true));
			};
			wv_5.addEventListener("did-finish-load", reinject_0);
			return () => wv_5.removeEventListener("did-finish-load", reinject_0);
		};
		t16 = [editModeEnabled, runInGuest];
		$[31] = editModeEnabled;
		$[32] = t15;
		$[33] = t16;
	} else {
		t15 = $[32];
		t16 = $[33];
	}
	(0, import_react.useEffect)(t15, t16);
	let t17;
	if ($[34] !== editModeEnabled || $[35] !== setEditStatus) {
		t17 = () => {
			if (!IS_ELECTRON || !editModeEnabled) return;
			const wv_6 = embedRef.current;
			if (!wv_6 || typeof wv_6.addEventListener !== "function") return;
			const onConsole_0 = (e_0) => {
				const msg = e_0?.message;
				if (typeof msg !== "string" || msg.indexOf("__LGEDIT_SELECT ") !== 0) return;
				let payload;
				try {
					payload = JSON.parse(msg.slice(16));
				} catch {
					return;
				}
				const seq = selectSeqRef.current = selectSeqRef.current + 1;
				webviewEditStore.setSelection({
					...payload,
					originalClassName: payload.className,
					src: null,
					tier: "unknown",
					resolveState: "pending"
				});
				getTargetFingerprint(wv_6).then(async (fp_0) => {
					if (selectSeqRef.current !== seq) return;
					if (!fp_0?.file) {
						webviewEditStore.patchSelection({
							src: null,
							tier: "unknown",
							resolveState: "failed"
						});
						return;
					}
					const res_0 = await window.api?.invoke("resolve_element", {
						filePath: fp_0.file,
						tag: fp_0.tag,
						className: fp_0.className,
						text: fp_0.text
					});
					if (selectSeqRef.current !== seq) return;
					if (res_0?.ok) {
						webviewEditStore.patchSelection({
							src: {
								filePath: res_0.filePath,
								lineNumber: res_0.line,
								columnNumber: res_0.column
							},
							tier: "direct",
							resolveState: "resolved"
						});
						setEditStatus(null);
					} else {
						webviewEditStore.patchSelection({
							src: null,
							tier: "unknown",
							resolveState: "failed"
						});
						setEditStatus(res_0?.reason === "not-found" ? "Couldn't pinpoint this element in source (ambiguous or dynamic) — needs AI/plugin." : `Resolve failed: ${res_0?.reason || "unknown"}`);
					}
				});
			};
			wv_6.addEventListener("console-message", onConsole_0);
			return () => wv_6.removeEventListener("console-message", onConsole_0);
		};
		$[34] = editModeEnabled;
		$[35] = setEditStatus;
		$[36] = t17;
	} else t17 = $[36];
	let t18;
	if ($[37] !== editModeEnabled) {
		t18 = [editModeEnabled];
		$[37] = editModeEnabled;
		$[38] = t18;
	} else t18 = $[38];
	(0, import_react.useEffect)(t17, t18);
	const stageEdit = _temp6$27;
	let t19;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = (text) => {
			runInGuest(`window.__lgEditPreviewText && window.__lgEditPreviewText(${JSON.stringify(text)})`);
			stageEdit({
				kind: "text",
				value: text
			}, text);
		};
		$[39] = t19;
	} else t19 = $[39];
	const commitText = t19;
	let t20;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = (className) => {
			runInGuest(`window.__lgEditPreviewClassName && window.__lgEditPreviewClassName(${JSON.stringify(className)})`);
			stageEdit({
				kind: "className-set",
				value: className
			}, className);
		};
		$[40] = t20;
	} else t20 = $[40];
	const applyClassName = t20;
	let t21;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = (styles) => {
			runInGuest(`window.__lgEditPreviewStyle && window.__lgEditPreviewStyle(${JSON.stringify(styles)})`);
			const desc = Object.entries(styles).map(_temp7$20).join(", ");
			stageEdit({
				kind: "style-merge",
				styles
			}, desc);
		};
		$[41] = t21;
	} else t21 = $[41];
	const applyStyles = t21;
	let t22;
	if ($[42] !== setEditStatus) {
		t22 = async () => {
			const api_1 = window.api;
			const changes = webviewEditStore.getState().changes.filter(_temp8$16).sort(_temp9$14);
			if (!changes.length) return;
			setEditStatus("Saving…");
			let okCount = 0;
			let unresolved = 0;
			for (const c_0 of changes) {
				if (c_0.tier !== "direct" || !c_0.edit) continue;
				if (!c_0.filePath) {
					unresolved++;
					continue;
				}
				const res_1 = await api_1?.invoke("edit_source", {
					filePath: c_0.filePath,
					line: c_0.line,
					column: c_0.column,
					tag: c_0.tag,
					className: c_0.matchClass,
					edit: c_0.edit
				});
				if (res_1?.ok) {
					webviewEditStore.setChangeSaved(c_0.id, true);
					okCount++;
				} else if (res_1?.reason === "not-literal") webviewEditStore.recordChange({
					...c_0,
					tier: "ai",
					saved: false
				});
				else setEditStatus(`Save failed for ${c_0.label}: ${res_1?.reason || "unknown"}`);
			}
			const aiCount = webviewEditStore.getState().changes.filter(_temp0$13).length;
			if (okCount > 0) {
				runInGuest("window.__lgFinalizePreviews && window.__lgFinalizePreviews()");
				webviewEditStore.setSelection(null);
				webviewEditStore.clearSavedChanges();
				webviewEditStore.setStatus(null);
				toast.success(`Saved ${okCount} change${okCount === 1 ? "" : "s"} to code${aiCount ? ` · ${aiCount} need AI` : ""}`);
				webviewEditStore.setSyncing(true);
				runInGuestAsync("(window.__lgWatchSync ? window.__lgWatchSync(5000) : Promise.resolve(\"no-watch\"))").finally(_temp1$12);
			} else if (unresolved > 0) webviewEditStore.setStatus(`Couldn’t save ${unresolved} change${unresolved === 1 ? "" : "s"} — source not located. Use AI or Capture for this element.`);
			else webviewEditStore.setStatus(`Nothing saved${aiCount ? ` · ${aiCount} need AI` : ""}`);
		};
		$[42] = setEditStatus;
		$[43] = t22;
	} else t22 = $[43];
	const saveToCode = t22;
	let t23;
	if ($[44] !== element.id) {
		t23 = () => {
			const inner = innerPickStore.getState().inner;
			return inner?.kind === "webview" && inner.layerId === element.id;
		};
		$[44] = element.id;
		$[45] = t23;
	} else t23 = $[45];
	const engaged = (0, import_react.useSyncExternalStore)(innerPickStore.subscribe, t23, _temp10$12);
	const live = isSelected && ownsSession && ws.live;
	const capture = live && ws.tool === "capture";
	const interactive = live && !capture;
	const pickEnabled = !inspectEnabled && !editModeEnabled && !commentMode;
	let t24;
	if ($[46] !== capture || $[47] !== interactive || $[48] !== pickEnabled) {
		t24 = {
			interactive,
			capture,
			pickEnabled
		};
		$[46] = capture;
		$[47] = interactive;
		$[48] = pickEnabled;
		$[49] = t24;
	} else t24 = $[49];
	const guestModeRef = (0, import_react.useRef)(t24);
	let t25;
	if ($[50] !== capture || $[51] !== interactive || $[52] !== pickEnabled) {
		t25 = () => {
			guestModeRef.current = {
				interactive,
				capture,
				pickEnabled
			};
		};
		$[50] = capture;
		$[51] = interactive;
		$[52] = pickEnabled;
		$[53] = t25;
	} else t25 = $[53];
	(0, import_react.useLayoutEffect)(t25);
	const guestSelectionRef = (0, import_react.useRef)(null);
	const documentVersionRef = (0, import_react.useRef)(0);
	const [pageUrl, setPageUrl] = (0, import_react.useState)(null);
	const pageUrlRef = (0, import_react.useRef)("");
	let t26;
	if ($[54] !== element.src || $[55] !== pageUrl) {
		t26 = () => {
			pageUrlRef.current = pageUrl ?? normalizePreviewUrl(element.src);
		};
		$[54] = element.src;
		$[55] = pageUrl;
		$[56] = t26;
	} else t26 = $[56];
	(0, import_react.useLayoutEffect)(t26);
	let t27;
	let t28;
	if ($[57] !== element.id || $[58] !== options.isDragPreview) {
		t27 = () => {
			if (options.isDragPreview) return;
			return registerLiveSource(element.id, async (fingerprint_0) => {
				const url = pageUrlRef.current;
				const wv_7 = embedRef.current;
				if (!IS_ELECTRON || !fingerprint_0.frames?.length || typeof wv_7?.executeJavaScript !== "function") return { url };
				const lookup = wv_7.executeJavaScript(`(${PAGE_SOURCE_AT})(${JSON.stringify(fingerprint_0.frames)})`).catch(_temp11$10);
				const timeout = new Promise(_temp12$8);
				const at = await Promise.race([lookup, timeout]);
				return isSourceLine(at) ? {
					url,
					source: {
						file: at.file,
						line: at.line
					}
				} : { url };
			});
		};
		t28 = [element.id, options.isDragPreview];
		$[57] = element.id;
		$[58] = options.isDragPreview;
		$[59] = t27;
		$[60] = t28;
	} else {
		t27 = $[59];
		t28 = $[60];
	}
	(0, import_react.useEffect)(t27, t28);
	let t29;
	if ($[61] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = (gx, gy) => {
			const wv_8 = embedRef.current;
			if (!wv_8) return {
				clientX: gx,
				clientY: gy,
				sx: 1,
				sy: 1
			};
			const rect = wv_8.getBoundingClientRect();
			const sx = rect.width / (wv_8.offsetWidth || 1);
			const sy = rect.height / (wv_8.offsetHeight || 1);
			return {
				clientX: rect.left + gx * sx,
				clientY: rect.top + gy * sy,
				sx,
				sy
			};
		};
		$[61] = t29;
	} else t29 = $[61];
	const guestToClient = t29;
	let t30;
	let t31;
	if ($[62] !== element.id) {
		t30 = () => innerPickStore.registerHitResolver(element.id, () => {
			const sel_0 = guestSelectionRef.current;
			if (!sel_0) return null;
			const { clientX, clientY, sx: sx_0, sy: sy_0 } = guestToClient(sel_0.left, sel_0.top);
			return {
				left: clientX,
				top: clientY,
				width: sel_0.width * sx_0,
				height: sel_0.height * sy_0,
				fingerprint: pickFingerprint(sel_0, element.id)
			};
		});
		t31 = [element.id, guestToClient];
		$[62] = element.id;
		$[63] = t30;
		$[64] = t31;
	} else {
		t30 = $[63];
		t31 = $[64];
	}
	(0, import_react.useEffect)(t30, t31);
	const selectRequestedRef = (0, import_react.useRef)(false);
	let t32;
	if ($[65] !== element.id) {
		t32 = () => {
			if (getSelectedElementIds().has(element.id)) return;
			selectRequestedRef.current = true;
			useSelection.getState().selectOne(element.id);
		};
		$[65] = element.id;
		$[66] = t32;
	} else t32 = $[66];
	const selectSelf = t32;
	let t33;
	let t34;
	if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
		t33 = () => embedRef.current?.closest("[data-canvas-viewport]") ?? null;
		t34 = (x, y) => {
			const f = embedRef.current?.getBoundingClientRect();
			return !!f && x >= f.left && x <= f.right && y >= f.top && y <= f.bottom;
		};
		$[67] = t33;
		$[68] = t34;
	} else {
		t33 = $[67];
		t34 = $[68];
	}
	let t35;
	if ($[69] !== element.id) {
		t35 = () => {
			innerPickStore.clear(element.id);
			runPick("window.__lgPick && window.__lgPick.cancelDrag()");
		};
		$[69] = element.id;
		$[70] = t35;
	} else t35 = $[70];
	let t36;
	if ($[71] !== options.assetResolver || $[72] !== options.components || $[73] !== options.iconLibraries) {
		t36 = {
			components: options.components,
			iconLibraries: options.iconLibraries,
			assetResolver: options.assetResolver
		};
		$[71] = options.assetResolver;
		$[72] = options.components;
		$[73] = options.iconLibraries;
		$[74] = t36;
	} else t36 = $[74];
	let t37;
	if ($[75] !== options.onPlaceCapturedElement || $[76] !== options.onViewportPan || $[77] !== t35 || $[78] !== t36) {
		t37 = {
			onPlace: options.onPlaceCapturedElement,
			onViewportPan: options.onViewportPan,
			viewportOf: t33,
			isHomeAt: t34,
			onEnd: t35,
			renderOptions: t36
		};
		$[75] = options.onPlaceCapturedElement;
		$[76] = options.onViewportPan;
		$[77] = t35;
		$[78] = t36;
		$[79] = t37;
	} else t37 = $[79];
	const drag = useSnapshotDrag(t37);
	let t38;
	let t39;
	if ($[80] !== element.id || $[81] !== options.isDragPreview) {
		t38 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			const wv_9 = embedRef.current;
			if (!wv_9 || typeof wv_9.executeJavaScript !== "function") return;
			return registerLiveProbe(wv_9, async (clientX_0, clientY_0) => {
				const rect_0 = wv_9.getBoundingClientRect();
				const sx_1 = rect_0.width / (wv_9.offsetWidth || 1);
				const sy_1 = rect_0.height / (wv_9.offsetHeight || 1);
				const script_1 = `(function(x, y){
        ${GUEST_FINGERPRINT_SRC}
        var els = document.elementsFromPoint(x, y);
        for (var i = 0; i < els.length; i++) {
          var el = els[i];
          if (el.closest && el.closest('[data-lg-pick-ui]')) continue;
          if (el === document.documentElement || el === document.body) return null;
          var r = el.getBoundingClientRect();
          return JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height, fingerprint: __lgFingerprint(el) });
        }
        return null;
      })(${(clientX_0 - rect_0.left) / sx_1}, ${(clientY_0 - rect_0.top) / sy_1})`;
				let raw;
				try {
					raw = await wv_9.executeJavaScript(script_1);
				} catch {
					return null;
				}
				if (typeof raw !== "string") return null;
				try {
					const hit = JSON.parse(raw);
					return {
						left: rect_0.left + hit.left * sx_1,
						top: rect_0.top + hit.top * sy_1,
						width: hit.width * sx_1,
						height: hit.height * sy_1,
						fingerprint: {
							...hit.fingerprint,
							previewId: element.id
						}
					};
				} catch {
					return null;
				}
			});
		};
		t39 = [options.isDragPreview, element.id];
		$[80] = element.id;
		$[81] = options.isDragPreview;
		$[82] = t38;
		$[83] = t39;
	} else {
		t38 = $[82];
		t39 = $[83];
	}
	(0, import_react.useEffect)(t38, t39);
	const commentHoverRef = (0, import_react.useRef)(null);
	let t40;
	if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
		t40 = {
			busy: false,
			x: 0,
			y: 0,
			pending: false
		};
		$[84] = t40;
	} else t40 = $[84];
	const commentProbeRef = (0, import_react.useRef)(t40);
	let t41;
	let t42;
	if ($[85] !== commentMode || $[86] !== options.isDragPreview) {
		t41 = () => {
			if (!commentMode || options.isDragPreview) return;
			const state = commentProbeRef.current;
			let frame = 0;
			const hide = () => {
				state.pending = false;
				if (commentHoverRef.current) commentHoverRef.current.style.display = "none";
			};
			const check = () => {
				frame = 0;
				const wv_10 = embedRef.current;
				const r = wv_10?.getBoundingClientRect();
				if (!wv_10 || !r || state.x < r.left || state.x > r.right || state.y < r.top || state.y > r.bottom) return hide();
				state.pending = true;
				probeCommentHover(wv_10, state, commentHoverRef);
			};
			const move = (e_1) => {
				state.x = e_1.clientX;
				state.y = e_1.clientY;
				if (!frame) frame = requestAnimationFrame(check);
			};
			window.addEventListener("pointermove", move, {
				capture: true,
				passive: true
			});
			return () => {
				window.removeEventListener("pointermove", move, true);
				cancelAnimationFrame(frame);
				hide();
			};
		};
		t42 = [commentMode, options.isDragPreview];
		$[85] = commentMode;
		$[86] = options.isDragPreview;
		$[87] = t41;
		$[88] = t42;
	} else {
		t41 = $[87];
		t42 = $[88];
	}
	(0, import_react.useEffect)(t41, t42);
	let t43;
	if ($[89] === Symbol.for("react.memo_cache_sentinel")) {
		t43 = (clientX_1, clientY_1) => {
			const wv_11 = embedRef.current;
			if (!wv_11) return null;
			const rect_1 = wv_11.getBoundingClientRect();
			return {
				gx: (clientX_1 - rect_1.left) / (rect_1.width / (wv_11.offsetWidth || 1)),
				gy: (clientY_1 - rect_1.top) / (rect_1.height / (wv_11.offsetHeight || 1))
			};
		};
		$[89] = t43;
	} else t43 = $[89];
	const clientToGuest = t43;
	let t44;
	if ($[90] === Symbol.for("react.memo_cache_sentinel")) {
		t44 = {
			raf: 0,
			gx: 0,
			gy: 0,
			active: false
		};
		$[90] = t44;
	} else t44 = $[90];
	const deepHoverRef = (0, import_react.useRef)(t44);
	let t45;
	if ($[91] === Symbol.for("react.memo_cache_sentinel")) {
		t45 = () => {
			const hover = deepHoverRef.current;
			hover.raf = 0;
			runPick(hover.active ? `window.__lgPick && window.__lgPick.hoverDeepAt(${hover.gx}, ${hover.gy})` : "window.__lgPick && window.__lgPick.clearHover()");
		};
		$[91] = t45;
	} else t45 = $[91];
	const flushDeepHover = t45;
	let t46;
	if ($[92] === Symbol.for("react.memo_cache_sentinel")) {
		t46 = (at_0) => {
			const hover_0 = deepHoverRef.current;
			if (!at_0 && !hover_0.active) return;
			hover_0.active = !!at_0;
			if (at_0) {
				hover_0.gx = at_0.gx;
				hover_0.gy = at_0.gy;
			}
			if (!hover_0.raf) hover_0.raf = requestAnimationFrame(flushDeepHover);
		};
		$[92] = t46;
	} else t46 = $[92];
	const setDeepHover = t46;
	let t47;
	if ($[93] === Symbol.for("react.memo_cache_sentinel")) {
		t47 = (e_2) => {
			setDeepHover(isPrimaryModifier(e_2) ? clientToGuest(e_2.clientX, e_2.clientY) : null);
		};
		$[93] = t47;
	} else t47 = $[93];
	const onOverlayMouseMove = t47;
	let t48;
	if ($[94] === Symbol.for("react.memo_cache_sentinel")) {
		t48 = () => setDeepHover(null);
		$[94] = t48;
	} else t48 = $[94];
	const onOverlayMouseLeave = t48;
	let t49;
	let t50;
	if ($[95] === Symbol.for("react.memo_cache_sentinel")) {
		t49 = () => subscribeModifiers(() => {
			if (!getModifiers().meta) setDeepHover(null);
		});
		t50 = [setDeepHover];
		$[95] = t49;
		$[96] = t50;
	} else {
		t49 = $[95];
		t50 = $[96];
	}
	(0, import_react.useEffect)(t49, t50);
	let t51;
	let t52;
	if ($[97] === Symbol.for("react.memo_cache_sentinel")) {
		t51 = () => () => {
			if (deepHoverRef.current.raf) cancelAnimationFrame(deepHoverRef.current.raf);
		};
		t52 = [];
		$[97] = t51;
		$[98] = t52;
	} else {
		t51 = $[97];
		t52 = $[98];
	}
	(0, import_react.useEffect)(t51, t52);
	let t53;
	if ($[99] !== options.isDragPreview) {
		t53 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			const wv_12 = embedRef.current;
			if (!wv_12 || typeof wv_12.executeJavaScript !== "function") return;
			const inject = async () => {
				await ensureCaptureArtifactInWebview(wv_12);
				await runInGuestAsync(buildSnapshotScript());
				await runInPickWorld(wv_12, buildPickScript(true, resolvedPickColor("--ed-canvas-webview")));
				runPick(`window.__lgPick && window.__lgPick.setInteractive(${guestModeRef.current.interactive})`);
				runPick(`window.__lgPick && window.__lgPick.setCapture(${guestModeRef.current.capture})`);
				runPick(`window.__lgPick && window.__lgPick.setZoom(${getCameraScale()})`);
				runPick(`window.__lgPick && window.__lgPick.setEnabled(${guestModeRef.current.pickEnabled})`);
			};
			inject();
			const reinject_1 = () => {
				inject();
			};
			wv_12.addEventListener("did-finish-load", reinject_1);
			return () => wv_12.removeEventListener("did-finish-load", reinject_1);
		};
		$[99] = options.isDragPreview;
		$[100] = t53;
	} else t53 = $[100];
	let t54;
	if ($[101] !== element.id || $[102] !== options.isDragPreview) {
		t54 = [
			options.isDragPreview,
			element.id,
			runPick,
			runInGuestAsync
		];
		$[101] = element.id;
		$[102] = options.isDragPreview;
		$[103] = t54;
	} else t54 = $[103];
	(0, import_react.useEffect)(t53, t54);
	let t55;
	let t56;
	if ($[104] !== capture || $[105] !== interactive || $[106] !== options.isDragPreview) {
		t55 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			runPick(`window.__lgPick && window.__lgPick.setInteractive(${interactive})`);
			runPick(`window.__lgPick && window.__lgPick.setCapture(${capture})`);
		};
		t56 = [
			interactive,
			capture,
			options.isDragPreview,
			runPick
		];
		$[104] = capture;
		$[105] = interactive;
		$[106] = options.isDragPreview;
		$[107] = t55;
		$[108] = t56;
	} else {
		t55 = $[107];
		t56 = $[108];
	}
	(0, import_react.useEffect)(t55, t56);
	let t57;
	let t58;
	if ($[109] !== options.isDragPreview || $[110] !== pickEnabled) {
		t57 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			runPick(`window.__lgPick && window.__lgPick.setEnabled(${pickEnabled})`);
		};
		t58 = [
			pickEnabled,
			options.isDragPreview,
			runPick
		];
		$[109] = options.isDragPreview;
		$[110] = pickEnabled;
		$[111] = t57;
		$[112] = t58;
	} else {
		t57 = $[111];
		t58 = $[112];
	}
	(0, import_react.useEffect)(t57, t58);
	let t59;
	let t60;
	if ($[113] !== canvasScale || $[114] !== options.isDragPreview) {
		t59 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			runPick(`window.__lgPick && window.__lgPick.setZoom(${canvasScale})`);
		};
		t60 = [
			canvasScale,
			options.isDragPreview,
			runPick
		];
		$[113] = canvasScale;
		$[114] = options.isDragPreview;
		$[115] = t59;
		$[116] = t60;
	} else {
		t59 = $[115];
		t60 = $[116];
	}
	(0, import_react.useEffect)(t59, t60);
	const metaCaptureRef = (0, import_react.useRef)(false);
	let t61;
	if ($[117] !== live) {
		t61 = (held) => {
			const { tool } = webviewEditStore.getState();
			if (held) {
				if (!live || metaCaptureRef.current || tool !== "interact") return;
				metaCaptureRef.current = true;
				webviewEditStore.goLive("capture");
			} else if (metaCaptureRef.current) {
				metaCaptureRef.current = false;
				if (live && tool === "capture") webviewEditStore.goLive("interact");
			}
		};
		$[117] = live;
		$[118] = t61;
	} else t61 = $[118];
	const holdCapture = (0, import_react.useEffectEvent)(t61);
	let t62;
	if ($[119] !== holdCapture || $[120] !== live) {
		t62 = () => {
			if (!live) {
				metaCaptureRef.current = false;
				return;
			}
			return subscribeModifiers(() => holdCapture(getModifiers().meta));
		};
		$[119] = holdCapture;
		$[120] = live;
		$[121] = t62;
	} else t62 = $[121];
	let t63;
	if ($[122] !== live) {
		t63 = [live];
		$[122] = live;
		$[123] = t63;
	} else t63 = $[123];
	(0, import_react.useEffect)(t62, t63);
	let t64;
	if ($[124] !== live) {
		t64 = () => {
			if (live) webviewEditStore.goLive(webviewEditStore.getState().tool === "capture" ? "interact" : "capture");
		};
		$[124] = live;
		$[125] = t64;
	} else t64 = $[125];
	const toggleTool = (0, import_react.useEffectEvent)(t64);
	let t65;
	if ($[126] !== drag || $[127] !== element.id || $[128] !== holdCapture || $[129] !== options || $[130] !== selectSelf || $[131] !== toggleTool) {
		t65 = () => {
			if (!IS_ELECTRON || options.isDragPreview) return;
			const wv_13 = embedRef.current;
			if (!wv_13 || typeof wv_13.addEventListener !== "function") return;
			const point = (p_0) => p_0 && Number.isFinite(p_0.x) && Number.isFinite(p_0.y) ? guestToClient(p_0.x, p_0.y) : null;
			const onMessage = (e_3) => {
				if (e_3.channel !== "lg-pick" || !Array.isArray(e_3.args)) return;
				const msg_0 = e_3.args;
				switch (msg_0[0]) {
					case "select": {
						const sel_1 = msg_0[1] ?? null;
						guestSelectionRef.current = sel_1;
						if (!sel_1) {
							if (innerPickStore.getState().inner?.layerId === element.id) innerPickStore.setHit(element.id, "webview", null);
							return;
						}
						if (sel_1.refresh && innerPickStore.getState().inner?.layerId !== element.id) return;
						const { clientX: clientX_3, clientY: clientY_3, sx: sx_3, sy: sy_3 } = guestToClient(sel_1.left, sel_1.top);
						const fingerprint_1 = pickFingerprint(sel_1, element.id);
						innerPickStore.setHit(element.id, "webview", {
							left: clientX_3,
							top: clientY_3,
							width: sel_1.width * sx_3,
							height: sel_1.height * sy_3,
							fingerprint: fingerprint_1
						});
						if (!sel_1.refresh) metaCaptureRef.current = false;
						selectSelf();
						return;
					}
					case "dragStart": {
						const d_0 = msg_0[1];
						if (!d_0) return;
						const { clientX: clientX_2, clientY: clientY_2, sx: sx_2, sy: sy_2 } = guestToClient(d_0.x, d_0.y);
						const origin = guestToClient(d_0.left, d_0.top);
						drag.start({
							clientX: clientX_2,
							clientY: clientY_2,
							box: {
								left: origin.clientX,
								top: origin.clientY,
								width: d_0.width * sx_2,
								height: d_0.height * sy_2
							},
							label: d_0.label,
							payload: runInPickWorld(wv_13, "window.__lgPick && window.__lgPick.pending").then(_temp13$8)
						});
						return;
					}
					case "dragMove": {
						const pt_1 = point(msg_0[1]);
						if (pt_1) drag.move(pt_1.clientX, pt_1.clientY);
						return;
					}
					case "dragEnd": {
						const pt_0 = point(msg_0[1]);
						if (pt_0) drag.finish(pt_0.clientX, pt_0.clientY);
						else drag.cancel();
						return;
					}
					case "dragCancel":
						drag.cancel();
						return;
					case "escape":
						dismissCanvasAreas();
						return;
					case "meta":
						holdCapture(!!msg_0[1]);
						return;
					case "toggleTool":
						toggleTool();
						return;
					case "addToChat":
						previewAddToChat();
						return;
					case "copied":
						toast.success("Copied");
						return;
					case "copyFailed":
						toast.error("Couldn’t copy that element");
						return;
					case "exit":
						if (innerPickStore.getState().inner?.layerId === element.id) innerPickStore.clear(element.id);
						else webviewEditStore.goStatic();
						return;
					case "wheel": {
						const w = msg_0[1];
						const pt = w && Number.isFinite(w.dy) ? point(w) : null;
						if (pt) options.onViewportZoom?.(w.dy, pt.clientX, pt.clientY);
						return;
					}
					case "pan": {
						const d = msg_0[1];
						if (d && Number.isFinite(d.x) && Number.isFinite(d.y)) options.onViewportPan?.(-d.x, -d.y);
					}
				}
			};
			wv_13.addEventListener("ipc-message", onMessage);
			return () => wv_13.removeEventListener("ipc-message", onMessage);
		};
		$[126] = drag;
		$[127] = element.id;
		$[128] = holdCapture;
		$[129] = options;
		$[130] = selectSelf;
		$[131] = toggleTool;
		$[132] = t65;
	} else t65 = $[132];
	let t66;
	if ($[133] !== drag || $[134] !== element.id || $[135] !== options || $[136] !== selectSelf) {
		t66 = [
			options,
			element.id,
			guestToClient,
			drag,
			selectSelf
		];
		$[133] = drag;
		$[134] = element.id;
		$[135] = options;
		$[136] = selectSelf;
		$[137] = t66;
	} else t66 = $[137];
	(0, import_react.useEffect)(t65, t66);
	let t67;
	if ($[138] === Symbol.for("react.memo_cache_sentinel")) {
		t67 = async () => {
			const text_0 = await runInPickWorld(embedRef.current, "window.__lgPick ? window.__lgPick.copyPayload() : null");
			if (typeof text_0 !== "string") {
				toast.error("Couldn’t copy that element");
				return;
			}
			try {
				await navigator.clipboard.writeText(text_0);
				toast.success("Copied");
			} catch {
				toast.error("Couldn’t copy that element");
			}
		};
		$[138] = t67;
	} else t67 = $[138];
	const copyFromGuest = (0, import_react.useEffectEvent)(t67);
	let t68;
	if ($[139] !== copyFromGuest || $[140] !== engaged) {
		t68 = () => {
			if (!engaged) return;
			const onKey = (e_4) => {
				if (isTypingTarget(e_4) || e_4.altKey || e_4.shiftKey) return;
				const cmd = isPrimaryModifier(e_4);
				const escape = e_4.key === "Escape" && !cmd && !hasOpenLayer();
				const copy = cmd && e_4.code === "KeyC" && !window.getSelection()?.toString();
				if (!escape && !copy) return;
				e_4.preventDefault();
				e_4.stopImmediatePropagation();
				if (escape) runPick("window.__lgPick && window.__lgPick.escape()");
				else copyFromGuest();
			};
			window.addEventListener("keydown", onKey, true);
			return () => window.removeEventListener("keydown", onKey, true);
		};
		$[139] = copyFromGuest;
		$[140] = engaged;
		$[141] = t68;
	} else t68 = $[141];
	let t69;
	if ($[142] !== engaged) {
		t69 = [engaged, runPick];
		$[142] = engaged;
		$[143] = t69;
	} else t69 = $[143];
	(0, import_react.useEffect)(t68, t69);
	let t70;
	let t71;
	if ($[144] !== engaged || $[145] !== live) {
		t70 = () => {
			if (!live || engaged) return;
			const onKey_0 = _temp14$8;
			window.addEventListener("keydown", onKey_0, true);
			return () => window.removeEventListener("keydown", onKey_0, true);
		};
		t71 = [live, engaged];
		$[144] = engaged;
		$[145] = live;
		$[146] = t70;
		$[147] = t71;
	} else {
		t70 = $[146];
		t71 = $[147];
	}
	(0, import_react.useEffect)(t70, t71);
	const wasLiveRef = (0, import_react.useRef)(false);
	let t72;
	let t73;
	if ($[148] !== live) {
		t72 = () => {
			if (wasLiveRef.current && !live) embedRef.current?.blur();
			wasLiveRef.current = live;
		};
		t73 = [live];
		$[148] = live;
		$[149] = t72;
		$[150] = t73;
	} else {
		t72 = $[149];
		t73 = $[150];
	}
	(0, import_react.useEffect)(t72, t73);
	let t74;
	if ($[151] !== element || $[152] !== options) {
		t74 = async () => {
			if (!IS_ELECTRON) {
				toast.error("Snapshots need the desktop app");
				return;
			}
			const wv_14 = embedRef.current;
			if (!wv_14 || typeof wv_14.executeJavaScript !== "function" || !options.onPlaceCapturedElement) return;
			const documentVersion = documentVersionRef.current;
			webviewEditStore.setSnapshotting(true);
			const toastId = toast.loading("Snapshotting…");
			const captured = await snapshotGuest(wv_14);
			webviewEditStore.setSnapshotting(false);
			if (embedRef.current !== wv_14 || documentVersionRef.current !== documentVersion) {
				toast.dismiss(toastId);
				return;
			}
			if (!captured) {
				toast.error("Nothing to snapshot — is the page loaded?", {
					id: toastId,
					duration: 3e3
				});
				return;
			}
			toast.dismiss(toastId);
			const at_1 = besidePreview(element);
			options.onPlaceCapturedElement?.(captured, {
				canvasX: at_1.x,
				canvasY: at_1.y
			});
		};
		$[151] = element;
		$[152] = options;
		$[153] = t74;
	} else t74 = $[153];
	const handleSnapshot = (0, import_react.useEffectEvent)(t74);
	let t75;
	let t76;
	if ($[154] !== element.id || $[155] !== isSelected || $[156] !== options.isDragPreview) {
		t75 = () => {
			if (options.isDragPreview) return;
			const { droppedChanges } = webviewEditStore.setActiveWebview(element.id, isSelected);
			if (droppedChanges > 0) toast.warning(`Discarded ${droppedChanges} unsaved change${droppedChanges === 1 ? "" : "s"} from the previous preview`);
		};
		t76 = [
			isSelected,
			element.id,
			options.isDragPreview
		];
		$[154] = element.id;
		$[155] = isSelected;
		$[156] = options.isDragPreview;
		$[157] = t75;
		$[158] = t76;
	} else {
		t75 = $[157];
		t76 = $[158];
	}
	(0, import_react.useEffect)(t75, t76);
	const goLiveWhenOwnedRef = (0, import_react.useRef)(null);
	let t77;
	let t78;
	if ($[159] !== isSelected || $[160] !== ownsSession) {
		t77 = () => {
			const tool_0 = goLiveWhenOwnedRef.current;
			if (!tool_0 || !isSelected || !ownsSession) return;
			goLiveWhenOwnedRef.current = null;
			webviewEditStore.goLive(tool_0);
		};
		t78 = [isSelected, ownsSession];
		$[159] = isSelected;
		$[160] = ownsSession;
		$[161] = t77;
		$[162] = t78;
	} else {
		t77 = $[161];
		t78 = $[162];
	}
	(0, import_react.useEffect)(t77, t78);
	let t79;
	if ($[163] !== element.id || $[164] !== isSelected || $[165] !== ownsSession) {
		t79 = (tool_1) => {
			if (isSelected && ownsSession) {
				webviewEditStore.goLive(tool_1);
				return;
			}
			goLiveWhenOwnedRef.current = tool_1;
			useSelection.getState().selectOne(element.id);
		};
		$[163] = element.id;
		$[164] = isSelected;
		$[165] = ownsSession;
		$[166] = t79;
	} else t79 = $[166];
	const goLiveAs = t79;
	let t80;
	let t81;
	if ($[167] !== element.id || $[168] !== options.isDragPreview) {
		t80 = () => {
			if (options.isDragPreview) return;
			return () => {
				webviewEditStore.setActiveWebview(element.id, false);
				innerPickStore.clear(element.id);
			};
		};
		t81 = [element.id, options.isDragPreview];
		$[167] = element.id;
		$[168] = options.isDragPreview;
		$[169] = t80;
		$[170] = t81;
	} else {
		t80 = $[169];
		t81 = $[170];
	}
	(0, import_react.useEffect)(t80, t81);
	let t82;
	let t83;
	if ($[171] !== element.src || $[172] !== isSelected || $[173] !== page.height || $[174] !== page.width) {
		t82 = () => {
			if (!isSelected) return;
			webviewEditStore.setWebviewInfo(element.src, page.width, page.height);
		};
		t83 = [
			isSelected,
			element.src,
			page.width,
			page.height
		];
		$[171] = element.src;
		$[172] = isSelected;
		$[173] = page.height;
		$[174] = page.width;
		$[175] = t82;
		$[176] = t83;
	} else {
		t82 = $[175];
		t83 = $[176];
	}
	(0, import_react.useEffect)(t82, t83);
	let t84;
	if ($[177] !== element.id || $[178] !== options) {
		t84 = (width, height) => {
			options.onResizeViewport?.(element.id, Math.max(MIN_PAGE_SIZE$1, width) + PREVIEW_CHROME_WIDTH, Math.max(MIN_PAGE_SIZE$1, height) + PREVIEW_CHROME_HEIGHT);
		};
		$[177] = element.id;
		$[178] = options;
		$[179] = t84;
	} else t84 = $[179];
	const setSize = t84;
	let t85;
	if ($[180] === Symbol.for("react.memo_cache_sentinel")) {
		t85 = (url_0) => {
			const embed_0 = embedRef.current;
			if (embed_0) try {
				embed_0.src = url_0;
			} catch {}
		};
		$[180] = t85;
	} else t85 = $[180];
	const navigate = t85;
	let t86;
	if ($[181] === Symbol.for("react.memo_cache_sentinel")) {
		t86 = () => {
			const embed_1 = embedRef.current;
			if (IS_ELECTRON && typeof embed_1?.reload === "function") try {
				embed_1.reload();
			} catch {}
			else if (embed_1) try {
				embed_1.src = embed_1.src;
			} catch {}
		};
		$[181] = t86;
	} else t86 = $[181];
	const reloadGuest = t86;
	let t87;
	if ($[182] !== element.id || $[183] !== element.src || $[184] !== options) {
		t87 = (url_1) => {
			if (url_1 !== element.src && options.onNavigatePreview) options.onNavigatePreview(element.id, url_1);
			else navigate(url_1);
		};
		$[182] = element.id;
		$[183] = element.src;
		$[184] = options;
		$[185] = t87;
	} else t87 = $[185];
	const goTo = t87;
	let t88;
	if ($[186] === Symbol.for("react.memo_cache_sentinel")) {
		t88 = () => {
			runInGuest("window.__lgClearPreviews && window.__lgClearPreviews()");
			webviewEditStore.clearChanges();
			webviewEditStore.setSelection(null);
			webviewEditStore.setStatus(null);
		};
		$[186] = t88;
	} else t88 = $[186];
	const discardChanges = t88;
	let t89;
	let t90;
	if ($[187] !== isSelected || $[188] !== saveToCode || $[189] !== setSize) {
		t89 = () => {
			if (!isSelected) return;
			webviewEditStore.setActions({
				commitText,
				applyClassName,
				applyStyles,
				saveToCode,
				discardChanges,
				setSize,
				navigate
			});
			return _temp15$6;
		};
		t90 = [
			isSelected,
			commitText,
			applyClassName,
			applyStyles,
			saveToCode,
			discardChanges,
			setSize,
			navigate
		];
		$[187] = isSelected;
		$[188] = saveToCode;
		$[189] = setSize;
		$[190] = t89;
		$[191] = t90;
	} else {
		t89 = $[190];
		t90 = $[191];
	}
	(0, import_react.useEffect)(t89, t90);
	const seenRefreshRef = (0, import_react.useRef)(ws.refreshNonce);
	const seenCaptureRef = (0, import_react.useRef)(ws.captureNonce);
	const seenSnapshotRef = (0, import_react.useRef)(ws.snapshotNonce);
	let t91;
	let t92;
	if ($[192] !== ownsSession || $[193] !== ws.refreshNonce) {
		t91 = () => {
			if (ws.refreshNonce === seenRefreshRef.current) return;
			seenRefreshRef.current = ws.refreshNonce;
			if (ownsSession) reloadGuest();
		};
		t92 = [
			ws.refreshNonce,
			ownsSession,
			reloadGuest
		];
		$[192] = ownsSession;
		$[193] = ws.refreshNonce;
		$[194] = t91;
		$[195] = t92;
	} else {
		t91 = $[194];
		t92 = $[195];
	}
	(0, import_react.useEffect)(t91, t92);
	let t93;
	if ($[196] !== handleCapture || $[197] !== ownsSession || $[198] !== ws.captureNonce) {
		t93 = () => {
			if (ws.captureNonce === seenCaptureRef.current) return;
			seenCaptureRef.current = ws.captureNonce;
			if (ownsSession) handleCapture();
		};
		$[196] = handleCapture;
		$[197] = ownsSession;
		$[198] = ws.captureNonce;
		$[199] = t93;
	} else t93 = $[199];
	let t94;
	if ($[200] !== ownsSession || $[201] !== ws.captureNonce) {
		t94 = [ws.captureNonce, ownsSession];
		$[200] = ownsSession;
		$[201] = ws.captureNonce;
		$[202] = t94;
	} else t94 = $[202];
	(0, import_react.useEffect)(t93, t94);
	let t95;
	let t96;
	if ($[203] !== element.id || $[204] !== engaged || $[205] !== isSelected) {
		t95 = () => {
			if (isSelected) selectRequestedRef.current = false;
			if (engaged && !isSelected && !selectRequestedRef.current) {
				innerPickStore.clear(element.id);
				runPick("window.__lgPick && window.__lgPick.clearSelection()");
			}
		};
		t96 = [
			engaged,
			isSelected,
			element.id,
			runPick
		];
		$[203] = element.id;
		$[204] = engaged;
		$[205] = isSelected;
		$[206] = t95;
		$[207] = t96;
	} else {
		t95 = $[206];
		t96 = $[207];
	}
	(0, import_react.useEffect)(t95, t96);
	const wasEngagedRef = (0, import_react.useRef)(false);
	let t97;
	let t98;
	if ($[208] !== engaged) {
		t97 = () => {
			if (wasEngagedRef.current && !engaged) runPick("window.__lgPick && window.__lgPick.clearSelection()");
			wasEngagedRef.current = engaged;
		};
		t98 = [engaged, runPick];
		$[208] = engaged;
		$[209] = t97;
		$[210] = t98;
	} else {
		t97 = $[209];
		t98 = $[210];
	}
	(0, import_react.useEffect)(t97, t98);
	let t100;
	let t99;
	if ($[211] !== element.id || $[212] !== interactive) {
		t99 = () => {
			if (interactive) innerPickStore.clear(element.id);
		};
		t100 = [interactive, element.id];
		$[211] = element.id;
		$[212] = interactive;
		$[213] = t100;
		$[214] = t99;
	} else {
		t100 = $[213];
		t99 = $[214];
	}
	(0, import_react.useEffect)(t99, t100);
	const [fit, setFit] = (0, import_react.useState)(null);
	const fitted = fit !== null && page.height === fit.fittedTo;
	const seenFitRef = (0, import_react.useRef)(ws.fitHeightNonce);
	let t101;
	if ($[215] !== fit || $[216] !== fitted || $[217] !== page.height || $[218] !== page.width || $[219] !== setSize) {
		t101 = async () => {
			if (fitted) {
				setFit(null);
				setSize(page.width, fit.restoreTo);
				return;
			}
			const full = await runInGuestAsync("Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)");
			if (typeof full !== "number" || !full) {
				toast.error("Couldn’t measure the page");
				return;
			}
			const fittedTo = Math.max(MIN_PAGE_SIZE$1, Math.min(MAX_FIT_HEIGHT, Math.round(full)));
			if (fittedTo === page.height) return;
			setFit({
				restoreTo: page.height,
				fittedTo
			});
			setSize(page.width, fittedTo);
		};
		$[215] = fit;
		$[216] = fitted;
		$[217] = page.height;
		$[218] = page.width;
		$[219] = setSize;
		$[220] = t101;
	} else t101 = $[220];
	const toggleFitHeight = t101;
	let t102;
	if ($[221] !== toggleFitHeight) {
		t102 = () => {
			toggleFitHeight();
		};
		$[221] = toggleFitHeight;
		$[222] = t102;
	} else t102 = $[222];
	const toggleFitFromStore = (0, import_react.useEffectEvent)(t102);
	let t103;
	if ($[223] !== ownsSession || $[224] !== toggleFitFromStore || $[225] !== ws.fitHeightNonce) {
		t103 = () => {
			if (ws.fitHeightNonce === seenFitRef.current) return;
			seenFitRef.current = ws.fitHeightNonce;
			if (ownsSession) toggleFitFromStore();
		};
		$[223] = ownsSession;
		$[224] = toggleFitFromStore;
		$[225] = ws.fitHeightNonce;
		$[226] = t103;
	} else t103 = $[226];
	let t104;
	if ($[227] !== ownsSession || $[228] !== ws.fitHeightNonce) {
		t104 = [ws.fitHeightNonce, ownsSession];
		$[227] = ownsSession;
		$[228] = ws.fitHeightNonce;
		$[229] = t104;
	} else t104 = $[229];
	(0, import_react.useEffect)(t103, t104);
	let t105;
	let t106;
	if ($[230] !== fitted || $[231] !== ownsSession) {
		t105 = () => {
			if (ownsSession) webviewEditStore.setFittedHeight(fitted);
		};
		t106 = [ownsSession, fitted];
		$[230] = fitted;
		$[231] = ownsSession;
		$[232] = t105;
		$[233] = t106;
	} else {
		t105 = $[232];
		t106 = $[233];
	}
	(0, import_react.useEffect)(t105, t106);
	let t107;
	if ($[234] !== handleSnapshot || $[235] !== ownsSession || $[236] !== ws.snapshotNonce) {
		t107 = () => {
			if (ws.snapshotNonce === seenSnapshotRef.current) return;
			seenSnapshotRef.current = ws.snapshotNonce;
			if (ownsSession) handleSnapshot();
		};
		$[234] = handleSnapshot;
		$[235] = ownsSession;
		$[236] = ws.snapshotNonce;
		$[237] = t107;
	} else t107 = $[237];
	let t108;
	if ($[238] !== ownsSession || $[239] !== ws.snapshotNonce) {
		t108 = [ws.snapshotNonce, ownsSession];
		$[238] = ownsSession;
		$[239] = ws.snapshotNonce;
		$[240] = t108;
	} else t108 = $[240];
	(0, import_react.useEffect)(t107, t108);
	let t109;
	let t110;
	if ($[241] !== options) {
		t109 = () => {
			if (IS_ELECTRON) return;
			const iframe_0 = embedRef.current;
			if (!iframe_0) return;
			let detachWheel;
			const onLoad = () => {
				detachWheel?.();
				detachWheel = void 0;
				try {
					const iframeDoc = iframe_0.contentDocument;
					const iframeWin = iframe_0.contentWindow;
					if (!iframeDoc) return;
					if (!iframeWin) return;
					iframeDoc.documentElement.style.overscrollBehavior = "none";
					const handleWheel = (e_6) => {
						e_6.preventDefault();
						e_6.stopPropagation();
						if (e_6.ctrlKey || e_6.metaKey) {
							const box = iframe_0.getBoundingClientRect();
							const sx_4 = iframe_0.clientWidth ? box.width / iframe_0.clientWidth : 1;
							const sy_4 = iframe_0.clientHeight ? box.height / iframe_0.clientHeight : 1;
							options.onViewportZoom?.(e_6.deltaY, box.left + e_6.clientX * sx_4, box.top + e_6.clientY * sy_4);
						} else options.onViewportPan?.(e_6.deltaX, e_6.deltaY);
					};
					iframeDoc.addEventListener("wheel", handleWheel, {
						passive: false,
						capture: true
					});
					iframeWin.addEventListener("wheel", handleWheel, {
						passive: false,
						capture: true
					});
					detachWheel = () => {
						iframeDoc.removeEventListener("wheel", handleWheel, { capture: true });
						iframeWin.removeEventListener("wheel", handleWheel, { capture: true });
					};
				} catch {}
			};
			iframe_0.addEventListener("load", onLoad);
			return () => {
				iframe_0.removeEventListener("load", onLoad);
				detachWheel?.();
			};
		};
		t110 = [
			options,
			options.onViewportPan,
			options.onViewportZoom
		];
		$[241] = options;
		$[242] = t109;
		$[243] = t110;
	} else {
		t109 = $[242];
		t110 = $[243];
	}
	(0, import_react.useEffect)(t109, t110);
	let t111;
	let t112;
	if ($[244] !== element.id) {
		t111 = () => {
			if (!IS_ELECTRON) return;
			const wv_15 = embedRef.current;
			if (!wv_15 || typeof wv_15.addEventListener !== "function") return;
			const invalidate = () => {
				documentVersionRef.current = documentVersionRef.current + 1;
				markWebviewArtifactStale(wv_15);
				innerPickStore.clear(element.id);
			};
			const onFail = _temp16$6;
			const onStartNavigation = (e_8) => {
				if (e_8.isMainFrame && !e_8.isInPlace) invalidate();
			};
			const onNavigated = (e_9) => {
				if (e_9.url) setPageUrl(e_9.url);
			};
			wv_15.addEventListener("did-start-navigation", onStartNavigation);
			wv_15.addEventListener("did-fail-load", onFail);
			wv_15.addEventListener("did-navigate", onNavigated);
			wv_15.addEventListener("did-navigate-in-page", onNavigated);
			return () => {
				wv_15.removeEventListener("did-start-navigation", onStartNavigation);
				wv_15.removeEventListener("did-fail-load", onFail);
				wv_15.removeEventListener("did-navigate", onNavigated);
				wv_15.removeEventListener("did-navigate-in-page", onNavigated);
			};
		};
		t112 = [element.id];
		$[244] = element.id;
		$[245] = t111;
		$[246] = t112;
	} else {
		t111 = $[245];
		t112 = $[246];
	}
	(0, import_react.useEffect)(t111, t112);
	let t113;
	let t114;
	if ($[247] !== pendingAllowPath) {
		t113 = () => {
			if (!pendingAllowPath) return;
			const t = setTimeout(() => setPendingAllowPath(null), 3e4);
			return () => clearTimeout(t);
		};
		t114 = [pendingAllowPath];
		$[247] = pendingAllowPath;
		$[248] = t113;
		$[249] = t114;
	} else {
		t113 = $[248];
		t114 = $[249];
	}
	(0, import_react.useEffect)(t113, t114);
	const { styles: styles_0 } = element;
	let t115;
	if ($[250] !== element.src) {
		t115 = normalizePreviewUrl(element.src);
		$[250] = element.src;
		$[251] = t115;
	} else t115 = $[251];
	const src_0 = t115;
	const resizeHandleWidth = 8 * inverseScale;
	const t116 = page.width + PREVIEW_CHROME_WIDTH;
	const t117 = page.height + PREVIEW_CHROME_HEIGHT;
	let t118;
	if ($[252] !== styles_0 || $[253] !== t116 || $[254] !== t117) {
		t118 = {
			...styles_0,
			background: "var(--ed-card)",
			border: "1px solid var(--ed-border)",
			boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.07)",
			position: "relative",
			display: "flex",
			flexDirection: "column",
			boxSizing: "border-box",
			width: t116,
			height: t117,
			touchAction: "none",
			overflow: "hidden",
			borderRadius: 24,
			fontSize: 14,
			lineHeight: 1.6
		};
		$[252] = styles_0;
		$[253] = t116;
		$[254] = t117;
		$[255] = t118;
	} else t118 = $[255];
	let t119;
	if ($[256] === Symbol.for("react.memo_cache_sentinel")) {
		t119 = {
			height: PREVIEW_TOOLBAR_HEIGHT,
			flexShrink: 0,
			boxSizing: "border-box",
			fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
			justifyContent: "center",
			cursor: "grab"
		};
		$[256] = t119;
	} else t119 = $[256];
	const t120 = pageUrl ?? src_0;
	const t121 = inert || !options.onNavigatePreview;
	let t122;
	if ($[257] !== toggleFitHeight) {
		t122 = () => {
			toggleFitHeight();
		};
		$[257] = toggleFitHeight;
		$[258] = t122;
	} else t122 = $[258];
	let t123;
	if ($[259] !== fitted || $[260] !== goTo || $[261] !== t120 || $[262] !== t121 || $[263] !== t122) {
		t123 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-select-zone": "",
			className: "flex items-center gap-2.5 px-3 py-2",
			style: t119,
			"data-drag-grip": "",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewAddressBar, {
				url: t120,
				readOnly: t121,
				onGo: goTo,
				onReload: reloadGuest,
				fitted,
				onToggleFit: t122
			})
		});
		$[259] = fitted;
		$[260] = goTo;
		$[261] = t120;
		$[262] = t121;
		$[263] = t122;
		$[264] = t123;
	} else t123 = $[264];
	let t124;
	if ($[265] === Symbol.for("react.memo_cache_sentinel")) {
		t124 = {
			flex: 1,
			minHeight: 0,
			padding: `0 ${PREVIEW_PADDING}px ${PREVIEW_PADDING}px`,
			position: "relative"
		};
		$[265] = t124;
	} else t124 = $[265];
	let t125;
	if ($[266] !== captureStatus) {
		t125 = captureStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				position: "absolute",
				bottom: 18,
				left: "50%",
				transform: "translateX(-50%)",
				background: "rgba(0,0,0,0.8)",
				color: "#fff",
				padding: "6px 12px",
				borderRadius: 6,
				fontSize: 11,
				zIndex: 20,
				whiteSpace: "nowrap"
			},
			children: captureStatus
		});
		$[266] = captureStatus;
		$[267] = t125;
	} else t125 = $[267];
	let t126;
	if ($[268] !== options || $[269] !== pendingAllowPath) {
		t126 = pendingAllowPath && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				position: "absolute",
				bottom: 16,
				left: "50%",
				transform: "translateX(-50%)",
				background: "#fff",
				border: "1px solid #e5e7eb",
				borderRadius: 12,
				padding: "12px 16px",
				zIndex: 21,
				display: "flex",
				alignItems: "center",
				gap: 12,
				boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				maxWidth: "90%",
				fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
				fontSize: 13
			},
			onClick: _temp17$5,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { flex: 1 },
					children: [
						"Allow AI to edit ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pendingAllowPath }),
						"?"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e_11) => {
						e_11.stopPropagation();
						options.onAddAllowedPath?.(pendingAllowPath);
						setPendingAllowPath(null);
					},
					style: {
						background: "#1f2328",
						color: "#fff",
						border: "none",
						borderRadius: 6,
						padding: "6px 12px",
						cursor: "default",
						fontWeight: 500
					},
					children: "Allow"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e_12) => {
						e_12.stopPropagation();
						setPendingAllowPath(null);
					},
					style: {
						background: "#f3f4f6",
						color: "#374151",
						border: "none",
						borderRadius: 6,
						padding: "6px 12px",
						cursor: "default"
					},
					children: "Skip"
				})
			]
		});
		$[268] = options;
		$[269] = pendingAllowPath;
		$[270] = t126;
	} else t126 = $[270];
	let t127;
	if ($[271] === Symbol.for("react.memo_cache_sentinel")) {
		t127 = {
			width: "100%",
			height: "100%",
			boxSizing: "border-box",
			overflow: "hidden",
			position: "relative",
			borderRadius: 15,
			background: "var(--ed-background)",
			border: "1px solid var(--ed-border)"
		};
		$[271] = t127;
	} else t127 = $[271];
	let t128;
	if ($[272] !== src_0) {
		t128 = IS_ELECTRON ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElectronWebview, {
			ref: embedRef,
			src: src_0,
			allowpopups: "true",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "inline-flex"
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			ref: embedRef,
			src: src_0,
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block"
			}
		});
		$[272] = src_0;
		$[273] = t128;
	} else t128 = $[273];
	let t129;
	if ($[274] !== commentMode || $[275] !== editModeEnabled || $[276] !== goLiveAs || $[277] !== inert || $[278] !== inspectEnabled || $[279] !== live) {
		t129 = (commentMode || !(live || editModeEnabled || inspectEnabled)) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-live-preview-overlay": "",
			"data-select-zone": "",
			"data-drag-grip": inert || commentMode ? void 0 : "",
			style: {
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 1,
				background: "transparent",
				cursor: "default",
				touchAction: "none"
			},
			onClick: (e_13) => {
				if (commentMode) return;
				const at_2 = !inert && !e_13.shiftKey && isPrimaryModifier(e_13) ? clientToGuest(e_13.clientX, e_13.clientY) : null;
				if (!at_2) return;
				e_13.stopPropagation();
				runPick(`window.__lgPick && window.__lgPick.pickDeepAt(${at_2.gx}, ${at_2.gy})`);
				goLiveAs("capture");
			},
			onDoubleClick: (e_14) => {
				if (commentMode || inert || e_14.shiftKey || isPrimaryModifier(e_14)) return;
				e_14.stopPropagation();
				goLiveAs("interact");
			},
			onMouseMove: inert || commentMode ? void 0 : onOverlayMouseMove,
			onMouseLeave: commentMode ? void 0 : onOverlayMouseLeave
		});
		$[274] = commentMode;
		$[275] = editModeEnabled;
		$[276] = goLiveAs;
		$[277] = inert;
		$[278] = inspectEnabled;
		$[279] = live;
		$[280] = t129;
	} else t129 = $[280];
	let t130;
	if ($[281] !== commentMode) {
		t130 = commentMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: commentHoverRef,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				display: "none",
				zIndex: 2,
				pointerEvents: "none",
				outline: PICK_HOVER_OUTLINE,
				willChange: "transform"
			}
		});
		$[281] = commentMode;
		$[282] = t130;
	} else t130 = $[282];
	let t131;
	if ($[283] !== t128 || $[284] !== t129 || $[285] !== t130) {
		t131 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t127,
			children: [
				t128,
				t129,
				t130
			]
		});
		$[283] = t128;
		$[284] = t129;
		$[285] = t130;
		$[286] = t131;
	} else t131 = $[286];
	let t132;
	if ($[287] !== t125 || $[288] !== t126 || $[289] !== t131) {
		t132 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t124,
			children: [
				t125,
				t126,
				t131
			]
		});
		$[287] = t125;
		$[288] = t126;
		$[289] = t131;
		$[290] = t132;
	} else t132 = $[290];
	const t133 = -resizeHandleWidth / 2;
	let t134;
	if ($[291] !== resizeHandleWidth || $[292] !== t133) {
		t134 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-webview-handle": "e",
			style: {
				position: "absolute",
				right: t133,
				top: 0,
				width: resizeHandleWidth,
				height: "100%",
				cursor: "ew-resize"
			}
		});
		$[291] = resizeHandleWidth;
		$[292] = t133;
		$[293] = t134;
	} else t134 = $[293];
	const t135 = -resizeHandleWidth / 2;
	let t136;
	if ($[294] !== resizeHandleWidth || $[295] !== t135) {
		t136 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-webview-handle": "s",
			style: {
				position: "absolute",
				left: 0,
				bottom: t135,
				width: "100%",
				height: resizeHandleWidth,
				cursor: "ns-resize"
			}
		});
		$[294] = resizeHandleWidth;
		$[295] = t135;
		$[296] = t136;
	} else t136 = $[296];
	const t137 = -resizeHandleWidth / 2;
	const t138 = -resizeHandleWidth / 2;
	const t139 = resizeHandleWidth * 1.5;
	const t140 = resizeHandleWidth * 1.5;
	let t141;
	if ($[297] !== t137 || $[298] !== t138 || $[299] !== t139 || $[300] !== t140) {
		t141 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-webview-handle": "se",
			style: {
				position: "absolute",
				right: t137,
				bottom: t138,
				width: t139,
				height: t140,
				cursor: "nwse-resize",
				background: "transparent"
			}
		});
		$[297] = t137;
		$[298] = t138;
		$[299] = t139;
		$[300] = t140;
		$[301] = t141;
	} else t141 = $[301];
	let t142;
	if ($[302] !== drag.ghost || $[303] !== element.id || $[304] !== t118 || $[305] !== t123 || $[306] !== t132 || $[307] !== t134 || $[308] !== t136 || $[309] !== t141) {
		t142 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: wrapperRef,
			"data-element-id": element.id,
			"data-drag-follows": "",
			style: t118,
			children: [
				t123,
				t132,
				drag.ghost,
				t134,
				t136,
				t141
			]
		});
		$[302] = drag.ghost;
		$[303] = element.id;
		$[304] = t118;
		$[305] = t123;
		$[306] = t132;
		$[307] = t134;
		$[308] = t136;
		$[309] = t141;
		$[310] = t142;
	} else t142 = $[310];
	return t142;
}
function _temp17$5(e_10) {
	return e_10.stopPropagation();
}
function _temp16$6(e_7) {
	if (e_7?.errorCode === -3) return;
	console.error(`[WebviewRenderer] load failed: ${e_7?.errorCode} ${e_7?.errorDescription} url=${e_7?.validatedURL}`);
}
function _temp15$6() {
	return webviewEditStore.setActions(null);
}
function _temp14$8(e_5) {
	if (e_5.key !== "Escape" || e_5.metaKey || e_5.ctrlKey || e_5.altKey || e_5.shiftKey || isTypingTarget(e_5) || hasOpenLayer()) return;
	e_5.preventDefault();
	e_5.stopImmediatePropagation();
	webviewEditStore.goStatic();
}
function _temp13$8(raw_0) {
	return parseCaptureJson(raw_0)?.elements[0] ?? null;
}
function _temp12$8(resolve) {
	return setTimeout(() => resolve(null), SOURCE_LOOKUP_MS);
}
function _temp11$10() {
	return null;
}
function _temp10$12() {
	return false;
}
function _temp1$12() {
	return webviewEditStore.setSyncing(false);
}
function _temp0$13(c_1) {
	return !c_1.saved && c_1.tier === "ai";
}
function _temp9$14(a, b) {
	return (a.property === "text" ? -1 : 1) - (b.property === "text" ? -1 : 1);
}
function _temp8$16(c) {
	return !c.saved;
}
function _temp7$20(t0) {
	const [k, v] = t0;
	return `${k}: ${v}`;
}
function _temp6$27(edit, after) {
	const sel = webviewEditStore.getState().selection;
	if (!sel) return;
	const src = sel.src;
	const fingerprint = sel.originalClassName ?? sel.className;
	const label = src ? `<${sel.tag}> ${src.filePath.split("/").slice(-1)[0]}` : `<${sel.tag}>`;
	const property = edit.kind === "text" ? "text" : edit.kind === "style-merge" ? "style" : "className";
	const before = edit.kind === "text" ? sel.text ?? "" : edit.kind === "style-merge" ? "" : fingerprint;
	if (edit.kind === "text") webviewEditStore.patchSelection({ text: after });
	else if (edit.kind !== "style-merge") webviewEditStore.patchSelection({ className: after });
	webviewEditStore.recordChange({
		id: `${fingerprint}:${property}`,
		label,
		filePath: src?.filePath ?? "",
		line: src?.lineNumber ?? 0,
		column: src?.columnNumber,
		tag: sel.tag,
		matchClass: fingerprint,
		property,
		before,
		after,
		edit,
		tier: sel.tier === "ai" ? "ai" : "direct",
		saved: false
	});
}
function _temp5$33() {
	return null;
}
function _temp4$38() {}
function _temp3$44() {}
function _temp2$62() {}

export { PREVIEW_MIN_FRAME_SIZE, WebviewDragStandIn, besidePreview, frameRootIsUnsized, isElementInteractive, previewFrameSize, previewPageOfFrame, renderElement, renderTree, rendersChildrenInline, useSnapshotDrag };
