// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/PetalEditor.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { isCompositionFile } from "../../../../compiler/src/runtime/compositionFiles.js";
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { SparkleIcon } from "../../../../ui/src/icons.js";
import { Tooltip } from "../../../../ui/src/components/Tooltip.js";
import { g$3 } from "../../../../../vendor/@phosphor-icons/react.js";
import { ContextMenu$1, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "../../../../ui/src/components/ContextMenu.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";
import { Toaster } from "../../../../ui/src/components/Sonner.js";
import { ROOT, canAcceptChild, hasChildren$1 } from "../../../../compiler/src/store/types.js";
import { sanitizeElementProps } from "../../../../compiler/src/store/sanitize.js";
import { emptyStore, ensureV2 } from "../../../../compiler/src/store/ensureV2.js";
import { getById, getChildren$2, getDescendantIds, getIndex, getParentId, getRootIds, isDescendant, resolveTextOwner } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { toWire } from "../../../../compiler/src/store/wire.js";
import { isPlanLimitReason } from "../../backends/planLimits.js";
import { useBackendOptional } from "../../backends/BackendContext.js";
import { CommentMentionContext } from "./CommentMentionContext.js";
import { driveCamera, getCamera, notifyUserCameraGesture, subscribeCamera, subscribeUserCameraGesture, useCommentAgent } from "../hooks/useCommentAgent.js";
import { resolveVisibleElement$1 } from "../../shared/utils/visibleElement.js";
import { resolveCommentPosition } from "../../shared/utils/commentAnchor.js";
import { fontEmbedCss } from "../../shared/utils/fontEmbedCss.js";
import { stripPropSynthesizedChildren } from "../../canvas/lib/capture/fiber.js";
import { canvasRectOfElementId, captureRegionScreenshot, readCanvasRegion } from "../../canvas/utils/canvasRegionCapture.js";
import { liveSourceFor } from "../../shared/state/liveProbeChannel.js";
import { captureCommentContext } from "../utils/commentCapture.js";
import { isClaudeSetUp, useClaudeStatus } from "../hooks/useClaudeStatus.js";
import { copiedPngMessage, exportSettingsOf } from "../../shared/utils/assetExport.js";
import { ExportPanel } from "./panels/ExportPanel.js";
import { useInitialCanvasReady } from "../hooks/useInitialCanvasReady.js";
import { CommentPositions } from "./CommentPositions.js";
import { isAddToPromptShortcut, isChatAreasShortcut, isNewChatShortcut } from "../utils/chatShortcuts.js";
import { getAreaHighlight, publishAreaHighlight } from "../../shared/state/areaHighlightChannel.js";
import { registerCanvasAreaDismiss } from "../../shared/state/canvasAreaDismiss.js";
import { registerPreviewAddToChat } from "../../shared/state/previewAddToChat.js";
import { getElementLabel } from "./panels/layerSearch.js";
import { GLOBAL_SHORTCUTS, LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { generatePrefixedId } from "../../shared/utils/idUtils.js";
import { cloneElementWithNewIds } from "../../shared/utils/elementCloning.js";
import { applyOperationsToStore, createElementWriteOperations, createInsertOperation, createMoveOperation, createRemoveOperation, createReplaceOperation, createSetNameOperation, createSetPositionOperation, createSetPropsOperation, createSetStylesOperation, createSetTextOperation } from "../../shared/utils/operations.js";
import { isRelativeFlowPosition, positionStylesForPlacement } from "../../canvas/utils/absolutePositioning.js";
import { stripCanvasInvalidPosition } from "../../canvas/lib/capture/styles.js";
import { iconPropsFromSvg, svgMatchesIconLibrary } from "../../canvas/lib/capture/svg.js";
import { captureComponentInstance, clearComponentEditSession, editSessionFromElement, findEditRootId$1, findEditSessionsInStore, getComponentEditSession, rendersThroughWebgl, stashComponentEditSession } from "../../canvas/utils/captureComponentInstance.js";
import { clearLog, describeOperation, ensureLog, getOperations, squashOperations, startLog } from "../../shared/utils/captureStore.js";
import { getTree, getVisibleTree, usePages, withFlexShrinkInsertsSkipped, withVisibleTree } from "../../shared/state/pages.js";
import { ascendSelection, descendSelection, isDescendClick, resolveDescendTarget, soleSelectedElementId } from "../../canvas/utils/selection.js";
import { EMPTY_SELECTION, getSelectedElementIds, useLastSelectedElementIds, useSelectedElementIds, useSelection, useSoleSelectedElementId } from "../../shared/state/selection.js";
import { isCodeEditorTarget, isTypingTarget, matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { getCanvasSpaceRect, isFlowLayoutElement } from "../../canvas/utils/domGeometry.js";
import { cameraToFit } from "../../canvas/utils/zoom.js";
import { CanvasZoomMenu } from "../../canvas/components/CanvasZoomMenu.js";
import { resetRemovedFonts } from "../../../../compiler/src/runtime/fontRemoval.js";
import { useFontEnvironment } from "../contexts/FontContext.js";
import { Panel, PanelGroup$1 } from "../../../../../vendor/react-resizable-panels.js";
import { PanelDivider } from "../../shared/components/PanelDivider.js";
import { EditorModeProvider } from "../../shared/contexts/EditorModeContext.js";
import { useGlobalShortcut } from "../../shared/shortcuts/useGlobalShortcut.js";
import { CanvasLayout } from "../../canvas/components/CanvasLayout.js";
import { innerPickStore } from "../../shared/state/innerPickStore.js";
import { generateJSX } from "../../../../compiler/src/codegen/generateJSX.js";
import { parseJSX } from "../../../../compiler/src/codegen/parseJSX.js";
import { generateCompleteFile } from "../../../../compiler/src/codegen/generateCompleteFile.js";
import { useUploadImage } from "../../shared/hooks/useUploadImage.js";
import { COMPOSITION_DRAG_MIME, copyElementToClipboard, copyElementsAsPng, createCompositionDragPayload, createImageElement, createVideoElement, fileToUrl, htmlToJsx, isCanvasInsertDrag, looksLikeHTML, readElementFromClipboard } from "../../shared/utils/clipboard.js";
import { webviewEditStore } from "../../shared/state/webviewEditStore.js";
import { useShallow } from "../../../../../vendor/zustand.js";
import { useActiveToolCommentMode } from "../../shared/state/activeTool.js";
import { besidePreview } from "../../canvas/utils/renderElement.js";
import { canvasTookKey, takeCanvasContextMenuTarget } from "../../canvas/input/inputState.js";
import { getInteractiveParentIds } from "../../canvas/utils/interactiveParents.js";
import { getElementComputedMargins, getElementRect$1, targetBeneathCursorLayer } from "../../canvas/utils/collisionUtils.js";
import { findContainerAt } from "../../canvas/hooks/drawParent.js";
import { AssetProvider } from "../../shared/contexts/AssetContext.js";
import { CommentPins } from "../../canvas/components/CommentPins.js";
import { cameraToFitRect } from "../../canvas/utils/fitCamera.js";
import { contextMenuTarget } from "../../canvas/input/selectTarget.js";
import { isNudgeable, nudgeSpent, setNudgeSpent } from "../../canvas/utils/nudge.js";
import { planDropMoves } from "../../shared/utils/dropPlan.js";
import { Canvas } from "../../canvas/components/Canvas.js";
import { ScrubSessionContext } from "../../shared/utils/useScrub.js";
import { readCanvasElements } from "../../canvas/utils/canvasPayload.js";
import { loadSelectedPage } from "../utils/loadSelectedPage.js";
import { isUnconfirmedEmptyPage } from "../utils/emptyPageGuard.js";
import { ARROW_KEYS, CHAT_COLORS, EMPTY_STORE, EXTERNAL_AGENT_COLOR, IMPORT_MODEL, TEXT_RUN_STYLE_KEYS } from "../constants.js";
import { InsertPanel } from "./panels/InsertPanel.js";
import { isCompiledClass } from "../utils/classIndex.js";
import { applyElementUpdater } from "./panels/styles/StyleOpsContext.js";
import { isInlineTypographyEdit } from "../utils/tailwindClasses.js";
import { requestImageFillEdit } from "../../shared/state/imageFillEdit.js";
import { isEmptyImage, parseFills } from "../utils/backgroundFills.js";
import { canvasGoogleFamilies, clearGoogleFontLinks, syncGoogleFontLinks } from "../utils/fontLoader.js";
import { StylesPanelTabs } from "./panels/StylesPanelTabs.js";
import { WebviewEditPanel } from "./panels/WebviewEditPanel.js";
import { AssetsPanel } from "./panels/AssetsPanel.js";
import { IconsPanel } from "./panels/IconsPanel.js";
import { LayersPanelLive } from "./panels/LayersPanel.js";
import { PagesPanel } from "./panels/PagesPanel.js";
import { PagePanel } from "./panels/PagePanel.js";
import { PagesSidebarTabV2 } from "./panels/PagesSidebarTabV2.js";
import { AssetsSidebarTabV2 } from "./panels/AssetsSidebarTabV2.js";
import { ChatConversations, ChatHistoryLoading } from "./ChatConversations.js";
import { AgentsSidebarTabV2 } from "./panels/AgentsSidebarTabV2.js";
import { ChatPersistence, normalizeChatMessages } from "../utils/chatPersistence.js";
import { ChatArchiveView } from "./ArchivedChatsPanel.js";
import { usePromptContextInsertion } from "../hooks/usePromptContextInsertion.js";
import { useSidebarChatMcp } from "../hooks/useSidebarChatMcp.js";
import { useLoadedPageRecovery } from "../hooks/useLoadedPageRecovery.js";
import { cameraToFitFollowRect, componentNamesForWritePath, followRectForTarget, followTargetIds, instanceIdsForComponentNames, liveCanvasComponentKey, liveCanvasComponentNames, unionFollowRects } from "../../canvas/utils/followAiCamera.js";
import { lastChatWorkTarget, outermostChatWorkIds } from "../utils/chatWorkTarget.js";
import { getAiWriteTarget } from "../../shared/state/aiWriteTarget.js";
import { ChatPanel, IMPORT_DESIGN_SYSTEM_PROMPT } from "./ChatPanel.js";
import { createChatMessagesStore, deleteChatMessages, getChatMessages, setChatMessages, subscribeChatMessageEdits, useChatMessages } from "../utils/chatMessages.js";
import { LeftSidebarV2 } from "./LeftSidebarV2.js";
import { ElementHeader, PropsPanel } from "./panels/PropsPanel.js";
import { ProtoPlayer } from "./ProtoPlayer.js";
import { PreviewWindow } from "./PreviewWindow.js";
import { CreateComponentModal } from "./CreateComponentModal.js";
import { useBackendActions } from "../hooks/useBackendActions.js";
import { VersionHistoryModal } from "./VersionHistoryModal.js";
import { BottomBar } from "./BottomBar.js";
import { CommentComposer } from "./CommentComposer.js";
import { CommentThread } from "./CommentThread.js";
import { CommentsSidebar } from "./CommentsSidebar.js";
import { useCanvasPersistence } from "../../canvas/hooks/useCanvasPersistence.js";
import { clearAiCopyTargets, getAiCopyTargets } from "../../shared/state/aiCopyTarget.js";
import { placeBesideAnchor } from "../hooks/nextRootPlacement.js";
import { measuredRootBounds, occupiedRootBoxes, rootContentSettled, rootOccupancyBox } from "../hooks/rootBoxes.js";
import { CanvasToolHandlerMount } from "../agent-canvas/CanvasToolHandlerMount.js";
import { useAgentPresence } from "../hooks/agentPresence.js";
import { ChatPanelV2 } from "./chat-v2/ChatPanelV2.js";
import { migrateAgentSessionId } from "../hooks/agentChatStorage.js";
import { dropAgentChatTab, useAgentsV2Chat, useCommentAgentAvailability } from "../hooks/useAgentsV2Chat.js";
import { planSelectionReorder } from "../../shared/utils/reorderSelection.js";
import { groupElementsByTarget, resolveMultiPasteTargets } from "../../shared/utils/pasteTargets.js";
import { isFigmaClipboardHtml } from "../../../../compiler/src/runtime/figma/parser/clipboard.js";
import { buildFigmaImageStylePatches } from "../../../../compiler/src/runtime/figma/translator/styles/imagePatches.js";
import { convertFigmaClipboardHtmlSync } from "../../../../compiler/src/runtime/figma/paste.js";
import { applyFigmaImagePatchesToStore } from "../../canvas/utils/figma.js";
import { lastAgentWorkTarget } from "./chat-v2/lastResult.js";
import { readCamera, writeCamera } from "../../shared/lib/cameraStore.js";
import { buildFrameAdoptionOps, frameSlotAmongAdoptees } from "../../shared/utils/frameAdoptionOps.js";
import { buildUnwrapOps, canUnwrap, unwrapPlacement } from "../../shared/utils/unwrapOps.js";
import { dropUnplaceableChildren } from "../utils/dropUnplaceableChildren.js";
import { copyToFigma } from "../../canvas/lib/figmaExport.js";
import { captureCanvasPreview } from "../../canvas/lib/canvasPreview.js";
import { normalizeTextRuns } from "../utils/normalizeTextRuns.js";
import { addedUncompiledClasses } from "../utils/uncompiledClasses.js";
import { createSaveQueue } from "../utils/saveQueue.js";
import { buildClassPropertyMap, computeCleanedStyles, pasteHasResolvingClasses } from "../utils/pasteClassStyles.js";

var useSearchParamsCompat = () => {
	const [params] = (0, import_react.useState)(_temp$24);
	return params;
};
/** Top-level element count of a stored canvas payload (legacy nested array or v2 store). */
function countCanvasRoots(payload) {
	if (Array.isArray(payload)) return payload.length;
	return payload ? getRootIds(ensureV2(payload)).length : 0;
}
/** Count "elements" in a CanvasData shape returned by the server. The wire
*  may be StoreWireV2 (count `byId` keys) or legacy nested (array length of
*  top-level entries). */
function countCanvasElements(payload) {
	if (!payload) return 0;
	if (Array.isArray(payload)) return payload.length;
	if (typeof payload === "object") {
		const obj = payload;
		if (obj.schemaVersion === 2 && obj.byId && typeof obj.byId === "object") return Object.keys(obj.byId).length;
		if (Array.isArray(obj.elements)) return obj.elements.length;
	}
	return 0;
}
function findAncestorCanvasPos(store, id) {
	let current = id;
	while (current) {
		const el = getById(store, current);
		if (el?.canvasPosition) return el.canvasPosition;
		const parentKey = getParentId(store, current);
		current = parentKey === "ROOT" || parentKey === null ? null : parentKey;
	}
	return null;
}
/** The top-level element containing `id` (itself, if it is one). */
function findRootId(store, id) {
	let current = id;
	while (current) {
		const parentKey = getParentId(store, current);
		if (parentKey === "ROOT") return current;
		current = parentKey;
	}
	return null;
}
function elementFallbackSize(element) {
	const width = element.styles?.width;
	const height = element.styles?.height;
	return {
		width: typeof width === "number" ? width : 200,
		height: typeof height === "number" ? height : 200
	};
}
function cameraToCenterOnPoint(canvasPos, size, viewport, rect, scale) {
	const centerX = rect ? rect.x + rect.width / 2 : canvasPos.x + size.width / 2;
	const centerY = rect ? rect.y + rect.height / 2 : canvasPos.y + size.height / 2;
	return {
		scale,
		positionX: viewport.width / 2 - centerX * scale,
		positionY: viewport.height / 2 - centerY * scale
	};
}
/** Controls and popups that act on Enter themselves, so it never reaches the canvas. */
var ENTER_OWNER_SELECTOR = "button, a[href], summary, [role=button], [role=menu], [role=menuitem], [role=option], [role=tab], [role=dialog], [role=alertdialog]";
var FOLLOW_AI_STORAGE_KEY = "petal-follow-ai";
var FOLLOW_AI_TICK_MS = 200;
var FOLLOW_AI_CAMERA_MS = 220;
/** Consecutive frames the content bounds must hold still before the fit commits. */
var FIT_STABLE_FRAMES = 2;
/** Safety valve — reveal rather than hold the canvas back if content never settles. */
var FIT_SETTLE_TIMEOUT_MS = 2500;
/** How long to keep watching for a late resize after an unsettled fit. */
var LATE_REFIT_WINDOW_MS = 15e3;
var LATE_REFIT_POLL_MS = 250;
/** Animated, so a correction reads as intentional rather than as a glitch. */
var LATE_REFIT_MS = 220;
/** Bounds must move by more than this for a correction to be worth the motion. */
var LATE_REFIT_MIN_DELTA = 8;
function readFollowAiPreference() {
	try {
		return localStorage.getItem(FOLLOW_AI_STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}
function writeFollowAiPreference(on) {
	try {
		localStorage.setItem(FOLLOW_AI_STORAGE_KEY, on ? "1" : "0");
	} catch {}
}
function resolveInitialActivePageId(initialPages) {
	try {
		const savedPage = localStorage.getItem("petal-active-page");
		if (savedPage && initialPages?.some((p) => p.id === savedPage)) return savedPage;
	} catch {}
	if (initialPages && initialPages.length > 0) return initialPages[0].id;
	return "canvas-1";
}
/**
* Tabs plus the trees of the pages whose content is already known. Without
* initial content, 'canvas-1' is a placeholder until the page list lands, and
* gets no tree.
*/
function buildInitialTabs(initialPages, initialActivePageId, initialElements) {
	const trees = /* @__PURE__ */ new Map();
	if (initialPages && initialPages.length > 0) return {
		tabs: initialPages.map((p) => {
			const isActive = p.id === initialActivePageId;
			const elements = readCanvasElements(p.elements);
			if (isActive || elements.length > 0) trees.set(p.id, ensureV2(elements));
			return {
				id: p.id,
				name: p.name,
				canvasId: p.id,
				canvasPath: `.petal/canvases/${p.id}/`,
				backgroundColor: p.backgroundColor,
				backgroundToken: p.backgroundToken
			};
		}),
		trees
	};
	const elements = readCanvasElements(initialElements);
	if (initialElements) trees.set("canvas-1", ensureV2(elements));
	return {
		tabs: [{
			id: "canvas-1",
			name: "Page 1",
			canvasId: "canvas-1",
			canvasPath: ".petal/canvases/canvas-1/"
		}],
		trees
	};
}
function findFocusedComponentEditSession(store, selectedElementIds) {
	for (const id of selectedElementIds) {
		const rootId = findEditRootId$1(store, id);
		if (!rootId) continue;
		return getComponentEditSession(rootId) ?? findEditSessionsInStore(store).find((s) => s.containerId === rootId) ?? null;
	}
	return null;
}
/** Read a video file's intrinsic dimensions via a detached <video> metadata load.
*  Returns null if the file can't be decoded (caller keeps a default size). */
function getVideoDimensions(file) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const video = document.createElement("video");
		video.preload = "metadata";
		video.onloadedmetadata = () => {
			resolve({
				width: video.videoWidth,
				height: video.videoHeight
			});
			URL.revokeObjectURL(url);
		};
		video.onerror = () => {
			resolve(null);
			URL.revokeObjectURL(url);
		};
		video.src = url;
	});
}
/** Replace an element's props as one undoable edit. Module-level so callbacks built on it stay stable. */
function setElementProps(elementId, props) {
	const op = createSetPropsOperation(usePages.getState().tree, elementId, sanitizeElementProps(props) ?? {});
	if (op) usePages.getState().applyOps([op]);
}
/** Apply `updater` to the element's live styles and props as one undoable edit. Reads the store
*  at call time, since callers may finish after the panel that started them unmounted. */
function updateElement(elementId, updater) {
	const { tree, applyOps } = usePages.getState();
	const latest = getById(tree, elementId);
	const update = latest && applyElementUpdater(latest, updater);
	if (!update) return;
	const ops = [update.styles && createSetStylesOperation(tree, elementId, update.styles), update.props && createSetPropsOperation(tree, elementId, sanitizeElementProps(update.props) ?? {})].filter((op) => !!op);
	if (ops.length) applyOps(ops);
}
/** Drop out-of-flow positioning from an element about to become a canvas root.
*  Roots are placed by canvasPosition inside an unsized wrapper, so a root
*  `position: absolute` (common in markup copied from a web page, where the
*  browser inlines the source's computed styles) takes it out of flow, collapses
*  the wrapper to 0x0, and any `max-width: %` then resolves to 0 — the element
*  pastes in invisible. Nested absolutes are untouched; they're valid. */
function stripRootPositioning(element) {
	if (element.styles) stripCanvasInvalidPosition(element.styles, true);
}
function inferSelectionLayoutDirection(rects) {
	if (rects.length < 2) return "row";
	const centers = rects.map((rect) => ({
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2
	}));
	const minX = Math.min(...centers.map((center) => center.x));
	const maxX = Math.max(...centers.map((center) => center.x));
	const minY = Math.min(...centers.map((center) => center.y));
	return Math.max(...centers.map((center) => center.y)) - minY > maxX - minX ? "column" : "row";
}
function sortIdsByLayoutDirection(ids, rectsById, direction) {
	return [...ids].sort((a, b) => {
		const rectA = rectsById.get(a);
		const rectB = rectsById.get(b);
		if (!rectA || !rectB) return ids.indexOf(a) - ids.indexOf(b);
		const primaryDelta = direction === "column" ? rectA.top - rectB.top : rectA.left - rectB.left;
		if (Math.abs(primaryDelta) > 1) return primaryDelta;
		return direction === "column" ? rectA.left - rectB.left : rectA.top - rectB.top;
	});
}
async function readSourceFileForBottomBar(readFileRaw, filePath) {
	let content = "";
	if (readFileRaw) {
		const raw = await readFileRaw(filePath);
		if (raw) content = raw;
	}
	if (!content) {
		const invoke = window.api?.invoke;
		if (typeof invoke === "function") {
			const res = await invoke("read_source", { filePath });
			if (res && res.ok) content = res.content;
		}
	}
	return content;
}
async function loadSystemSkillMarkdown(name) {
	const api = window.api;
	if (!api) return void 0;
	const skills = await api.invoke("get_system_skills");
	if (!Array.isArray(skills)) return void 0;
	const baseline = skills.find((s) => s.name === name);
	if (!baseline) return void 0;
	const skillMd = baseline.files.find((f) => f.path === "SKILL.md");
	if (skillMd) return skillMd.content;
	const first = baseline.files[0];
	if (first) return first.content;
	return "";
}
function titleFromFirstUserMessage(messages) {
	const firstUserMsg = messages.find((m) => m.role === "user");
	if (!firstUserMsg?.content) return null;
	const cleanContent = firstUserMsg.content.replace(/\[@[^\]]*\]/g, "").replace(/\n\[References\][\s\S]*/g, "").trim();
	if (!cleanContent) return null;
	return cleanContent.slice(0, 50) + (cleanContent.length > 50 ? "..." : "");
}
function chatTabsFromList(list) {
	return list.map((item) => {
		const messages = normalizeChatMessages(item.messages);
		return {
			tab: {
				id: item.id,
				title: item.title ?? titleFromFirstUserMessage(messages),
				createdAt: item.createdAt || item.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
			},
			messages
		};
	});
}
/**
* A chat list as the editor opens with it. `unloaded`: chats listed without their history.
* Outside the component: the React Compiler can't compile `??` or optional chains inside a try block.
*/
function splitChatList(list) {
	const loaded = chatTabsFromList(list);
	const unloaded = new Set(list.filter((item) => !Array.isArray(item.messages)).map((item) => item.id));
	return {
		tabs: loaded.map(({ tab }) => tab),
		withHistory: list.filter((item) => Array.isArray(item.messages)),
		unloaded,
		messageEntries: loaded.filter(({ tab }) => !unloaded.has(tab.id)).map(({ tab, messages }) => [tab.id, messages])
	};
}
/** The chat written to most recently, so a project opens on the conversation the user was in. */
function mostRecentlyUpdatedIndex(list) {
	let best = 0;
	let bestTime = -Infinity;
	list.forEach((item, index) => {
		const time = Date.parse(item.updatedAt || item.createdAt || "");
		if (time > bestTime) {
			best = index;
			bestTime = time;
		}
	});
	return best;
}
function persistMissingChatTitles(list, updateChatTitle) {
	for (const item of list) {
		if (item.title) continue;
		const title = titleFromFirstUserMessage(normalizeChatMessages(item.messages));
		if (title) updateChatTitle(item.id, title);
	}
}
/** Save-to-code screenshot. Same toPng options as the previous inline capture. */
async function captureSaveToCodeScreenshot(el) {
	const { toPng } = await __bundledVitePreload(async () => {
		const { toPng } = await import("../../../../../vendor/html-to-image.js").then((n) => n.es_exports);
		return { toPng };
	}, [], import.meta.url);
	return toPng(el, {
		fontEmbedCSS: await fontEmbedCss(el),
		cacheBust: true,
		pixelRatio: 1,
		width: Math.min(el.scrollWidth, 1600),
		height: Math.min(el.scrollHeight, 1200),
		includeQueryParams: true
	});
}
var EMPTY_COMMENT_PEOPLE = [];
/** Top-level element count at which a page counts as having a real design on it. */
var POPULATED_PAGE_ROOT_COUNT = 5;
/** Minimum gap between two canvas_edited emits; edits in between are batched into `edits`. */
var CANVAS_EDIT_THROTTLE_MS = 3e5;
/**
* What a pick inside a Live Preview adds to its area: the preview's URL, the
* element's component and visible text from the guest, and its exact source
* line. The preview maps React 19's creation stack through the page's source
* maps; React 18 dev builds instead give a file, which the main process
* content-searches the way the webview's Inspect mode does.
*/
async function describeLiveElement(live) {
	const text = live.text ?? live.visibleText;
	const info = {
		...live.componentName ? { components: [{ name: live.componentName }] } : {},
		...text ? { text } : {}
	};
	const page = live.previewId ? await liveSourceFor(live.previewId)?.(live).catch(() => null) : null;
	if (page && live.previewId) info.preview = {
		elementId: live.previewId,
		url: page.url
	};
	if (page?.source) {
		info.sources = [page.source];
		return info;
	}
	if (!live.file) return info;
	try {
		const res = await window.api?.invoke("resolve_element", {
			filePath: live.file,
			tag: live.tag,
			className: live.className,
			text: live.text
		});
		if (res?.ok) info.sources = [{
			file: res.filePath,
			line: res.line
		}];
	} catch {}
	return info;
}
/**
* Build the chat region payload for a ⇧⌘S mask. Lives at module scope because
* the React Compiler cannot lower value blocks (`?.`, `||`, `?:`) inside the
* `try`/`catch` that has to stay around DOM reads.
*/
function captureCanvasRegionForPrompt(input) {
	try {
		const capture = readCanvasRegion(input.canvasEl, input.viewportEl, input.rect, getCamera());
		const describe = (id) => {
			const element = getById(input.store, id);
			return {
				id,
				label: element ? getElementLabel(element) : id
			};
		};
		const under = capture.under;
		const components = under?.components.map((component) => {
			const path = input.componentIndex?.[component.name]?.path;
			return path ? {
				...component,
				path
			} : component;
		});
		return {
			region: {
				pageId: input.pageId,
				rect: input.rect,
				inside: capture.inside.map(describe),
				within: capture.within.map(describe),
				partial: capture.partial.map(({ id, coverage }) => ({
					...describe(id),
					coverage
				})),
				...components?.length ? {
					components,
					componentElementId: under.canvasElementId
				} : {},
				...under?.sources.length ? { sources: under.sources } : {},
				...under?.text ? { text: under.text } : {},
				...under?.icon ? { icon: under.icon } : {},
				...under?.portaled ? { portaled: true } : {},
				...input.live ?? {}
			},
			screenshot: captureRegionScreenshot(input.canvasEl, input.viewportEl, input.rect)
		};
	} catch (err) {
		console.error("[canvas region] capture failed", err);
		toast.error("Could not capture that area");
		return null;
	}
}
var ChatPanelLiveSelection = (0, import_react.forwardRef)(function ChatPanelLiveSelection(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(12);
	let active;
	let messagesStore;
	let props;
	if ($[0] !== t0) {
		({active, messagesStore, ...props} = t0);
		$[0] = t0;
		$[1] = active;
		$[2] = messagesStore;
		$[3] = props;
	} else {
		active = $[1];
		messagesStore = $[2];
		props = $[3];
	}
	const messages = useChatMessages(messagesStore, props.activeChatId);
	let t1;
	if ($[4] !== active) {
		t1 = (s) => active ? s.selectedElementIds : EMPTY_SELECTION;
		$[4] = active;
		$[5] = t1;
	} else t1 = $[5];
	const selectedElementIds = useSelection(t1);
	const store = usePages(_temp2$14);
	let t2;
	if ($[6] !== messages || $[7] !== props || $[8] !== ref || $[9] !== selectedElementIds || $[10] !== store) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {
			...props,
			ref,
			store,
			selectedElementIds,
			messages
		});
		$[6] = messages;
		$[7] = props;
		$[8] = ref;
		$[9] = selectedElementIds;
		$[10] = store;
		$[11] = t2;
	} else t2 = $[11];
	return t2;
});
var ChatPanelV2Live = (0, import_react.forwardRef)(function ChatPanelV2Live(t0, ref) {
	const $ = (0, import_compiler_runtime.c)(10);
	let active;
	let props;
	if ($[0] !== t0) {
		({active, ...props} = t0);
		$[0] = t0;
		$[1] = active;
		$[2] = props;
	} else {
		active = $[1];
		props = $[2];
	}
	const store = usePages(_temp3$10);
	const deferredStore = (0, import_react.useDeferredValue)(store);
	let t1;
	if ($[3] !== active) {
		t1 = (s_0) => active ? s_0.selectedElementIds : EMPTY_SELECTION;
		$[3] = active;
		$[4] = t1;
	} else t1 = $[4];
	const selectedElementIds = useSelection(t1);
	const deferredSelectedElementIds = (0, import_react.useDeferredValue)(selectedElementIds);
	let t2;
	if ($[5] !== deferredSelectedElementIds || $[6] !== deferredStore || $[7] !== props || $[8] !== ref) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanelV2, {
			...props,
			ref,
			store: deferredStore,
			selectedElementIds: deferredSelectedElementIds
		});
		$[5] = deferredSelectedElementIds;
		$[6] = deferredStore;
		$[7] = props;
		$[8] = ref;
		$[9] = t2;
	} else t2 = $[9];
	return t2;
});
var PropsPanelLive = withVisibleTree(PropsPanel);
var StylesPanelLive = withVisibleTree(StylesPanelTabs);
function ProtoPlayerFromStore(props) {
	const $ = (0, import_compiler_runtime.c)(9);
	let rest;
	let store;
	if ($[0] !== props) {
		({store, ...rest} = props);
		$[0] = props;
		$[1] = rest;
		$[2] = store;
	} else {
		rest = $[1];
		store = $[2];
	}
	let t0;
	if ($[3] !== store) {
		t0 = getRootIds(store);
		$[3] = store;
		$[4] = t0;
	} else t0 = $[4];
	let t1;
	if ($[5] !== rest || $[6] !== store || $[7] !== t0) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtoPlayer, {
			...rest,
			store,
			rootIds: t0
		});
		$[5] = rest;
		$[6] = store;
		$[7] = t0;
		$[8] = t1;
	} else t1 = $[8];
	return t1;
}
var ProtoPlayerLive = withVisibleTree(ProtoPlayerFromStore);
function PreviewWindowFromStore(props) {
	const $ = (0, import_compiler_runtime.c)(10);
	let rest;
	let store;
	if ($[0] !== props) {
		({store, ...rest} = props);
		$[0] = props;
		$[1] = rest;
		$[2] = store;
	} else {
		rest = $[1];
		store = $[2];
	}
	const startId = useSoleSelectedElementId() ?? void 0;
	let t0;
	if ($[3] !== store) {
		t0 = getRootIds(store);
		$[3] = store;
		$[4] = t0;
	} else t0 = $[4];
	let t1;
	if ($[5] !== rest || $[6] !== startId || $[7] !== store || $[8] !== t0) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewWindow, {
			...rest,
			store,
			rootIds: t0,
			startId
		});
		$[5] = rest;
		$[6] = startId;
		$[7] = store;
		$[8] = t0;
		$[9] = t1;
	} else t1 = $[9];
	return t1;
}
var PreviewWindowLive = withVisibleTree(PreviewWindowFromStore);
function FrameSelectionItem(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { onSelect, disabled } = t0;
	if (!useSelection(_temp4$10)) return null;
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Frame selection" });
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⌘G" });
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	let t3;
	if ($[2] !== disabled || $[3] !== onSelect) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
			disabled,
			onSelect,
			children: [t1, t2]
		});
		$[2] = disabled;
		$[3] = onSelect;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function _temp4$10(s) {
	return s.selectedElementIds.size > 0;
}
function FlexFrameSelectionItem(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { onSelect, disabled } = t0;
	if (!useSelection(_temp5$9)) return null;
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Frame selection with flex" });
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⇧A" });
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	let t3;
	if ($[2] !== disabled || $[3] !== onSelect) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
			disabled,
			onSelect,
			children: [t1, t2]
		});
		$[2] = disabled;
		$[3] = onSelect;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function _temp5$9(s) {
	return s.selectedElementIds.size > 0;
}
function UnwrapSelectionItem(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { onSelect, disabled } = t0;
	const ids = useSelection(_temp6$6);
	let t1;
	if ($[0] !== ids) {
		t1 = (s_0) => {
			for (const id of ids) if (canUnwrap(s_0.tree, id)) return true;
			return false;
		};
		$[0] = ids;
		$[1] = t1;
	} else t1 = $[1];
	if (!usePages(t1)) return null;
	let t2;
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unwrap" });
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⇧⌘G" });
		$[2] = t2;
		$[3] = t3;
	} else {
		t2 = $[2];
		t3 = $[3];
	}
	let t4;
	if ($[4] !== disabled || $[5] !== onSelect) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
			disabled,
			onSelect,
			children: [t2, t3]
		});
		$[4] = disabled;
		$[5] = onSelect;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}
function _temp6$6(s) {
	return s.selectedElementIds;
}
function SelectedElementHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { elementId, getComponentFilePath, onOpenComponentFile, iconLibraries } = t0;
	let t1;
	if ($[0] !== elementId) {
		t1 = (s) => s.visibleTree.byId.get(elementId);
		$[0] = elementId;
		$[1] = t1;
	} else t1 = $[1];
	const element = usePages(t1);
	if (element?.type === "component") {
		const componentName = element.componentName;
		let t2;
		if ($[2] !== componentName || $[3] !== getComponentFilePath) {
			t2 = getComponentFilePath(componentName);
			$[2] = componentName;
			$[3] = getComponentFilePath;
			$[4] = t2;
		} else t2 = $[4];
		const componentFilePath = t2;
		let t3;
		if ($[5] !== componentFilePath || $[6] !== componentName || $[7] !== onOpenComponentFile) {
			t3 = componentFilePath ? () => onOpenComponentFile(componentName, componentFilePath) : void 0;
			$[5] = componentFilePath;
			$[6] = componentName;
			$[7] = onOpenComponentFile;
			$[8] = t3;
		} else t3 = $[8];
		let t4;
		if ($[9] !== componentName || $[10] !== t3) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementHeader, {
				name: componentName,
				kind: "component",
				onGoToMain: t3
			});
			$[9] = componentName;
			$[10] = t3;
			$[11] = t4;
		} else t4 = $[11];
		return t4;
	}
	if (element?.type === "icon") {
		const t2 = iconLibraries?.[element.library]?.displayName || element.library;
		let t3;
		if ($[12] !== element.iconName || $[13] !== t2) {
			t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementHeader, {
				name: element.iconName,
				kind: "icon",
				detail: t2
			});
			$[12] = element.iconName;
			$[13] = t2;
			$[14] = t3;
		} else t3 = $[14];
		return t3;
	}
	return null;
}
function WebviewExportPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { webviewId, onUpdateSettings, onExported, readOnly, exportRequest, onExportRequestHandled } = t0;
	let t1;
	if ($[0] !== webviewId) {
		t1 = (s) => s.visibleTree.byId.get(webviewId);
		$[0] = webviewId;
		$[1] = t1;
	} else t1 = $[1];
	const element = usePages(t1);
	if (!element) return null;
	let t2;
	if ($[2] !== element) {
		t2 = [element];
		$[2] = element;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== exportRequest || $[5] !== onExportRequestHandled || $[6] !== onExported || $[7] !== onUpdateSettings || $[8] !== readOnly || $[9] !== t2 || $[10] !== webviewId) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportPanel, {
			elements: t2,
			onUpdateSettings,
			onExported,
			readOnly,
			exportRequest,
			onExportRequestHandled
		}, webviewId);
		$[4] = exportRequest;
		$[5] = onExportRequestHandled;
		$[6] = onExported;
		$[7] = onUpdateSettings;
		$[8] = readOnly;
		$[9] = t2;
		$[10] = webviewId;
		$[11] = t3;
	} else t3 = $[11];
	return t3;
}
function RightRailZoomStrip(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { activeTabLoaded, showGitPanel, gitPanel, enableWebviewTweak, viewportRef, commentsHidden, onCommentsHiddenChange } = t0;
	const nothingSelected = useSelection(_temp7$4);
	const soleSelectedId = useSoleSelectedElementId();
	let t1;
	if ($[0] !== soleSelectedId) {
		t1 = (s_0) => soleSelectedId !== null && getById(s_0.visibleTree, soleSelectedId)?.type === "webview";
		$[0] = soleSelectedId;
		$[1] = t1;
	} else t1 = $[1];
	const soleSelectedIsWebview = usePages(t1);
	if (!activeTabLoaded) return null;
	if (!(nothingSelected || showGitPanel && gitPanel || enableWebviewTweak && soleSelectedIsWebview)) return null;
	let t2;
	if ($[2] !== commentsHidden || $[3] !== onCommentsHiddenChange || $[4] !== viewportRef) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "z-10 flex min-w-0 shrink-0 items-center justify-end border-b border-ed-divider bg-ed-background px-3 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasZoomMenu, {
				viewportRef,
				commentsHidden,
				onCommentsHiddenChange
			})
		});
		$[2] = commentsHidden;
		$[3] = onCommentsHiddenChange;
		$[4] = viewportRef;
		$[5] = t2;
	} else t2 = $[5];
	return t2;
}
function _temp7$4(s) {
	return s.selectedElementIds.size === 0;
}
function SelectionView(t0) {
	const $ = (0, import_compiler_runtime.c)(86);
	const { enableWebviewTweak, readOnly, mergedComponentIndex, iconLibraries, onReplaceElement, onUpdateExportSettings, onExported, exportRequest, onExportRequestHandled, openComponentFile, onUpdateElementStyles, onUpdateElementProps, onSetElementPropsTransient, onUpdateMultipleElementsProps, onUpdateMultipleElementsStyles, onUpdateMultipleElements, onSelectElements, onUpdateElementPositions, onToggleTextFormat, textSelectionState, onCreateComponent, scanLoading, onRequestPropsScan, fonts, activeTabLoaded, activeTabBackgroundColor, activeTabBackgroundToken, isPageLoading, onChangeBackground, viewportRef, commentsHidden, onCommentsHiddenChange } = t0;
	const liveSelectedIds = useSelectedElementIds();
	const retainedIds = useLastSelectedElementIds();
	let t1;
	if ($[0] !== retainedIds) {
		t1 = (s) => {
			for (const id of retainedIds) if (s.visibleTree.byId.has(id)) return true;
			return false;
		};
		$[0] = retainedIds;
		$[1] = t1;
	} else t1 = $[1];
	const retainedOnPage = usePages(t1);
	const firstRootId = usePages(_temp8$4);
	let t2;
	if ($[2] !== firstRootId) {
		t2 = firstRootId ? /* @__PURE__ */ new Set([firstRootId]) : EMPTY_SELECTION;
		$[2] = firstRootId;
		$[3] = t2;
	} else t2 = $[3];
	const warmIds = t2;
	const nothingSelected = !readOnly && liveSelectedIds.size === 0;
	const selectedElementIds = !nothingSelected ? liveSelectedIds : retainedOnPage ? retainedIds : warmIds;
	let t3;
	if ($[4] !== selectedElementIds) {
		t3 = soleSelectedElementId(selectedElementIds);
		$[4] = selectedElementIds;
		$[5] = t3;
	} else t3 = $[5];
	const selectedElementId = t3;
	let t4;
	if ($[6] !== selectedElementId) {
		t4 = (s_1) => selectedElementId ? getById(s_1.visibleTree, selectedElementId)?.type : void 0;
		$[6] = selectedElementId;
		$[7] = t4;
	} else t4 = $[7];
	const selectedType = usePages(t4);
	let t5;
	if ($[8] !== selectedElementIds) {
		t5 = (s_2) => {
			for (const id_0 of selectedElementIds) {
				const type = getById(s_2.visibleTree, id_0)?.type;
				if (type === "component" || type === "icon" || type === "html" || type === "webview") return true;
			}
			return false;
		};
		$[8] = selectedElementIds;
		$[9] = t5;
	} else t5 = $[9];
	const showPropsTab = usePages(t5);
	if (enableWebviewTweak && !nothingSelected && selectedType === "webview" && selectedElementId) {
		const webviewId = selectedElementId;
		let t6;
		if ($[10] !== onReplaceElement || $[11] !== webviewId) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebviewEditPanel, { onNavigate: (url) => {
					const el = getById(getVisibleTree(), webviewId);
					if (el?.type === "webview") onReplaceElement(webviewId, {
						...el,
						src: url
					});
				} })
			});
			$[10] = onReplaceElement;
			$[11] = webviewId;
			$[12] = t6;
		} else t6 = $[12];
		let t7;
		if ($[13] !== exportRequest || $[14] !== onExportRequestHandled || $[15] !== onExported || $[16] !== onUpdateExportSettings || $[17] !== readOnly || $[18] !== webviewId) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[45%] shrink-0 overflow-auto border-t border-ed-divider",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebviewExportPanel, {
					webviewId,
					onUpdateSettings: onUpdateExportSettings,
					onExported,
					readOnly,
					exportRequest,
					onExportRequestHandled
				})
			});
			$[13] = exportRequest;
			$[14] = onExportRequestHandled;
			$[15] = onExported;
			$[16] = onUpdateExportSettings;
			$[17] = readOnly;
			$[18] = webviewId;
			$[19] = t7;
		} else t7 = $[19];
		let t8;
		if ($[20] !== t6 || $[21] !== t7) {
			t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [t6, t7]
			});
			$[20] = t6;
			$[21] = t7;
			$[22] = t8;
		} else t8 = $[22];
		return t8;
	}
	let t6;
	if ($[23] !== iconLibraries || $[24] !== mergedComponentIndex || $[25] !== openComponentFile || $[26] !== selectedElementId) {
		t6 = selectedElementId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedElementHeader, {
			elementId: selectedElementId,
			getComponentFilePath: (componentName) => mergedComponentIndex?.[componentName]?.path,
			onOpenComponentFile: openComponentFile,
			iconLibraries
		}) : void 0;
		$[23] = iconLibraries;
		$[24] = mergedComponentIndex;
		$[25] = openComponentFile;
		$[26] = selectedElementId;
		$[27] = t6;
	} else t6 = $[27];
	const elementHeaderEl = t6;
	const hideHeader = selectedType === "component" || selectedType === "icon";
	let t7;
	if ($[28] !== hideHeader || $[29] !== iconLibraries || $[30] !== mergedComponentIndex || $[31] !== onCreateComponent || $[32] !== onReplaceElement || $[33] !== onRequestPropsScan || $[34] !== onSetElementPropsTransient || $[35] !== onUpdateElementProps || $[36] !== onUpdateMultipleElementsProps || $[37] !== openComponentFile || $[38] !== readOnly || $[39] !== scanLoading || $[40] !== selectedElementId || $[41] !== selectedElementIds) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropsPanelLive, {
			selectedElementId,
			selectedElementIds,
			componentIndex: mergedComponentIndex,
			iconLibraries,
			onUpdateElementProps,
			onSetElementPropsTransient,
			onUpdateMultipleElementsProps,
			onReplaceElement,
			onOpenComponent: openComponentFile,
			onCreateComponent,
			readOnly,
			scanLoading,
			onRequestPropsScan,
			hideHeader
		});
		$[28] = hideHeader;
		$[29] = iconLibraries;
		$[30] = mergedComponentIndex;
		$[31] = onCreateComponent;
		$[32] = onReplaceElement;
		$[33] = onRequestPropsScan;
		$[34] = onSetElementPropsTransient;
		$[35] = onUpdateElementProps;
		$[36] = onUpdateMultipleElementsProps;
		$[37] = openComponentFile;
		$[38] = readOnly;
		$[39] = scanLoading;
		$[40] = selectedElementId;
		$[41] = selectedElementIds;
		$[42] = t7;
	} else t7 = $[42];
	const t8 = showPropsTab ? t7 : void 0;
	const t9 = !readOnly;
	let t10;
	if ($[43] !== activeTabLoaded || $[44] !== commentsHidden || $[45] !== onCommentsHiddenChange || $[46] !== viewportRef) {
		t10 = activeTabLoaded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasZoomMenu, {
			viewportRef,
			commentsHidden,
			onCommentsHiddenChange
		});
		$[43] = activeTabLoaded;
		$[44] = commentsHidden;
		$[45] = onCommentsHiddenChange;
		$[46] = viewportRef;
		$[47] = t10;
	} else t10 = $[47];
	let t11;
	if ($[48] !== elementHeaderEl || $[49] !== exportRequest || $[50] !== fonts || $[51] !== onCreateComponent || $[52] !== onExportRequestHandled || $[53] !== onExported || $[54] !== onSelectElements || $[55] !== onToggleTextFormat || $[56] !== onUpdateElementPositions || $[57] !== onUpdateElementProps || $[58] !== onUpdateElementStyles || $[59] !== onUpdateExportSettings || $[60] !== onUpdateMultipleElements || $[61] !== onUpdateMultipleElementsProps || $[62] !== onUpdateMultipleElementsStyles || $[63] !== readOnly || $[64] !== selectedElementId || $[65] !== selectedElementIds || $[66] !== t10 || $[67] !== t8 || $[68] !== t9 || $[69] !== textSelectionState) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylesPanelLive, {
			onUpdateExportSettings,
			onExported,
			exportRequest,
			onExportRequestHandled,
			selectedElementId,
			selectedElementIds,
			onUpdateElementStyles,
			onUpdateElementProps,
			onUpdateElement: updateElement,
			onUpdateMultipleElementsProps,
			onUpdateMultipleElementsStyles,
			onUpdateMultipleElements,
			onSelectElements,
			onUpdateElementPositions,
			onToggleTextFormat,
			textSelectionState,
			onCreateComponent,
			readOnly,
			fonts,
			propsPanel: t8,
			showStyles: t9,
			header: elementHeaderEl,
			headerActions: t10
		});
		$[48] = elementHeaderEl;
		$[49] = exportRequest;
		$[50] = fonts;
		$[51] = onCreateComponent;
		$[52] = onExportRequestHandled;
		$[53] = onExported;
		$[54] = onSelectElements;
		$[55] = onToggleTextFormat;
		$[56] = onUpdateElementPositions;
		$[57] = onUpdateElementProps;
		$[58] = onUpdateElementStyles;
		$[59] = onUpdateExportSettings;
		$[60] = onUpdateMultipleElements;
		$[61] = onUpdateMultipleElementsProps;
		$[62] = onUpdateMultipleElementsStyles;
		$[63] = readOnly;
		$[64] = selectedElementId;
		$[65] = selectedElementIds;
		$[66] = t10;
		$[67] = t8;
		$[68] = t9;
		$[69] = textSelectionState;
		$[70] = t11;
	} else t11 = $[70];
	const stylesPanelEl = t11;
	let t12;
	if ($[71] !== activeTabBackgroundColor || $[72] !== activeTabBackgroundToken || $[73] !== activeTabLoaded || $[74] !== isPageLoading || $[75] !== nothingSelected || $[76] !== onChangeBackground) {
		t12 = nothingSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePanel, {
				backgroundColor: activeTabBackgroundColor,
				backgroundToken: activeTabBackgroundToken,
				onChangeBackground,
				disabled: isPageLoading || !activeTabLoaded
			})
		});
		$[71] = activeTabBackgroundColor;
		$[72] = activeTabBackgroundToken;
		$[73] = activeTabLoaded;
		$[74] = isPageLoading;
		$[75] = nothingSelected;
		$[76] = onChangeBackground;
		$[77] = t12;
	} else t12 = $[77];
	const t13 = nothingSelected ? "hidden" : "visible";
	let t14;
	if ($[78] !== stylesPanelEl) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-hidden flex flex-col",
			children: stylesPanelEl
		});
		$[78] = stylesPanelEl;
		$[79] = t14;
	} else t14 = $[79];
	let t15;
	if ($[80] !== t13 || $[81] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Activity, {
			mode: t13,
			children: t14
		});
		$[80] = t13;
		$[81] = t14;
		$[82] = t15;
	} else t15 = $[82];
	let t16;
	if ($[83] !== t12 || $[84] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t12, t15] });
		$[83] = t12;
		$[84] = t15;
		$[85] = t16;
	} else t16 = $[85];
	return t16;
}
function _temp8$4(s_0) {
	return s_0.visibleTree.childrenByParent.get("ROOT")?.[0] ?? null;
}
function BottomBarSelectionWrapper(props) {
	const $ = (0, import_compiler_runtime.c)(7);
	let rest;
	let store;
	if ($[0] !== props) {
		({store, ...rest} = props);
		$[0] = props;
		$[1] = rest;
		$[2] = store;
	} else {
		rest = $[1];
		store = $[2];
	}
	const selectedElementId = useSoleSelectedElementId();
	let t0;
	if ($[3] !== rest || $[4] !== selectedElementId || $[5] !== store) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomBar, {
			...rest,
			store,
			selectedElementId
		});
		$[3] = rest;
		$[4] = selectedElementId;
		$[5] = store;
		$[6] = t0;
	} else t0 = $[6];
	return t0;
}
var BottomBarSelectionLive = withVisibleTree(BottomBarSelectionWrapper);
var PetalEditorInner = (t0) => {
	const $ = (0, import_compiler_runtime.c)(1242);
	const { onInitialCanvasReady, components, componentIndex, iconLibraries: t1, allIconLibraries: t2, readOnly: t3, initialElements, initialPages, assetResolver, onComponentCreated, onCanvasSaved, previewElementId: t4, previewPinLoaded: t5, previewFingerprint: t6, copyCodeIncludesComponents: t7, getPreviewBuildKey, flushPreviewRef, onSetPreviewElement, onActivity, compilePreview, projectPath, webBaseUrl, allowedPaths, onAddAllowedPath, onRemoveAllowedPath, onClearAllowedPaths, isElectron, onOpenProjectSettings, onPlanLimit, onFeedback, onAddShadcnComponents, externalChatDraft, focusChatOnMount, onImportDesignSystem, enableCssEditor: t8, scanLoading: t9, onRequestPropsScan, onEnsureComponentNames, serverDrivenFileRefresh: t10, componentsRevision: t11, onProjectFilesEdited, enableComponentEditV2: t12, enableWebviewTweak: t13, enableSkillCustomization: t14, enableSidebarV2: t15, enableAgentsV2: t16, projectName: t17, projectIconUrl, onProjectIconClick, onRenameProject, skillOverrides: t18, onUpdateSkillOverrides, leftHeader, rightHeader, protoMode: t19, gitPanel, figmaImageResolver, onFileChangedRef, openPreviewRef, onActivePageChange, skillActionsRef, onCopySelectionLink, comments: t20, commentReplies: t21, commentsLoading: t22, commentsError: t23, onRetryComments, commentMentionPeople: t24, commentAgentTransport, currentUserId: t25, currentUser, onCreateComment, onCreateReply, commentIdentityPrompt, onCreateGuestCommentIdentity, allowCommentAttachments, onResolveComment, onUnresolveComment, onDeleteComment, onEditComment, onToggleReaction, onMoveComment, onActiveCommentChange, showCommentTools: t26, commentModeActive, onCommentModeChange, showResolvedComments: showResolvedProp, onShowResolvedChange, commentsHidden: commentsHiddenProp, onCommentsHiddenChange, fonts } = t0;
	let t27;
	if ($[0] !== t1) {
		t27 = t1 === void 0 ? {} : t1;
		$[0] = t1;
		$[1] = t27;
	} else t27 = $[1];
	const iconLibraries = t27;
	const allIconLibraries = t2 === void 0 ? iconLibraries : t2;
	const readOnly = t3 === void 0 ? false : t3;
	const previewElementId = t4 === void 0 ? null : t4;
	const previewPinLoaded = t5 === void 0 ? true : t5;
	const previewFingerprint = t6 === void 0 ? null : t6;
	const copyCodeIncludesComponents = t7 === void 0 ? false : t7;
	const enableCssEditor = t8 === void 0 ? false : t8;
	const scanLoading = t9 === void 0 ? false : t9;
	const serverDrivenFileRefresh = t10 === void 0 ? false : t10;
	const componentsRevision = t11 === void 0 ? 0 : t11;
	const enableComponentEditV2 = t12 === void 0 ? false : t12;
	const enableWebviewTweak = t13 === void 0 ? false : t13;
	const enableSkillCustomization = t14 === void 0 ? false : t14;
	const enableSidebarV2 = t15 === void 0 ? false : t15;
	const enableAgentsV2 = t16 === void 0 ? false : t16;
	const projectName = t17 === void 0 ? "Petal" : t17;
	let t28;
	if ($[2] !== t18) {
		t28 = t18 === void 0 ? {} : t18;
		$[2] = t18;
		$[3] = t28;
	} else t28 = $[3];
	const skillOverrides = t28;
	const protoMode = t19 === void 0 ? false : t19;
	let t29;
	if ($[4] !== t20) {
		t29 = t20 === void 0 ? [] : t20;
		$[4] = t20;
		$[5] = t29;
	} else t29 = $[5];
	const commentsProp = t29;
	let t30;
	if ($[6] !== t21) {
		t30 = t21 === void 0 ? [] : t21;
		$[6] = t21;
		$[7] = t30;
	} else t30 = $[7];
	const commentRepliesProp = t30;
	const commentsLoading = t22 === void 0 ? false : t22;
	const commentsError = t23 === void 0 ? false : t23;
	const commentMentionPeople = t24 === void 0 ? EMPTY_COMMENT_PEOPLE : t24;
	const currentUserId = t25 === void 0 ? null : t25;
	const showCommentTools = t26 === void 0 ? false : t26;
	const uploadImage = useUploadImage();
	const searchParams = useSearchParamsCompat();
	let t31;
	if ($[8] !== searchParams) {
		t31 = searchParams?.get("element") ?? null;
		$[8] = searchParams;
		$[9] = t31;
	} else t31 = $[9];
	const elementParam = t31;
	let t32;
	if ($[10] !== searchParams) {
		t32 = searchParams?.get("page") ?? null;
		$[10] = searchParams;
		$[11] = t32;
	} else t32 = $[11];
	const pageParam = t32;
	let t33;
	if ($[12] !== searchParams) {
		t33 = searchParams?.get("comment") ?? null;
		$[12] = searchParams;
		$[13] = t33;
	} else t33 = $[13];
	const commentParam = t33;
	let t34;
	if ($[14] !== searchParams) {
		t34 = searchParams?.get("viewport");
		$[14] = searchParams;
		$[15] = t34;
	} else t34 = $[15];
	const viewportParam = t34 === "1";
	let t35;
	if ($[16] !== elementParam) {
		t35 = () => elementParam ? /* @__PURE__ */ new Set([elementParam]) : EMPTY_SELECTION;
		$[16] = elementParam;
		$[17] = t35;
	} else t35 = $[17];
	const [initialSelection] = (0, import_react.useState)(t35);
	let t36;
	let t37;
	if ($[18] !== initialSelection) {
		t36 = () => {
			useSelection.getState().select(initialSelection);
		};
		t37 = [initialSelection];
		$[18] = initialSelection;
		$[19] = t36;
		$[20] = t37;
	} else {
		t36 = $[19];
		t37 = $[20];
	}
	(0, import_react.useLayoutEffect)(t36, t37);
	const pendingCenterRef = (0, import_react.useRef)(elementParam);
	const [centerEpoch, setCenterEpoch] = (0, import_react.useState)(0);
	const [pendingChatWorkTarget, setPendingChatWorkTarget] = (0, import_react.useState)(null);
	let t38;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t38 = [];
		$[21] = t38;
	} else t38 = $[21];
	const [chatTabs, setChatTabs] = (0, import_react.useState)(t38);
	const [chatMessages] = (0, import_react.useState)(createChatMessagesStore);
	const [chatsLoading, setChatsLoading] = (0, import_react.useState)(true);
	const [appliedHelpDraft, setAppliedHelpDraft] = (0, import_react.useState)(null);
	const [visibleChatIndex, setVisibleChatIndex] = (0, import_react.useState)(0);
	const [chatHistoryOpen, setChatHistoryOpen] = (0, import_react.useState)(false);
	const [archiveOpen, setArchiveOpen] = (0, import_react.useState)(false);
	const [runningChatIds, setRunningChatIds] = (0, import_react.useState)(_temp9$3);
	const [unreadChatIds, setUnreadChatIds] = (0, import_react.useState)(_temp0$2);
	const [followAi, setFollowAi] = (0, import_react.useState)(readFollowAiPreference);
	let t39;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t39 = (on) => {
			setFollowAi(on);
			writeFollowAiPreference(on);
		};
		$[22] = t39;
	} else t39 = $[22];
	const persistFollowAi = t39;
	const chatTabsRef = (0, import_react.useRef)(chatTabs);
	const visibleChatIndexRef = (0, import_react.useRef)(visibleChatIndex);
	let t40;
	if ($[23] !== chatTabs || $[24] !== visibleChatIndex) {
		t40 = () => {
			chatTabsRef.current = chatTabs;
			visibleChatIndexRef.current = visibleChatIndex;
		};
		$[23] = chatTabs;
		$[24] = visibleChatIndex;
		$[25] = t40;
	} else t40 = $[25];
	(0, import_react.useLayoutEffect)(t40);
	const { presence: agentPresence, entries: agentPresenceEntries } = useAgentPresence();
	let map;
	if ($[26] !== chatTabs) {
		map = /* @__PURE__ */ new Map();
		chatTabs.forEach((chat, i) => {
			map.set(chat.id, CHAT_COLORS[i % CHAT_COLORS.length]);
		});
		$[26] = chatTabs;
		$[27] = map;
	} else map = $[27];
	const chatColorMap = map;
	let next;
	if ($[28] !== agentPresenceEntries || $[29] !== chatColorMap) {
		next = /* @__PURE__ */ new Map();
		for (const [rootId, entry] of agentPresenceEntries) next.set(rootId, entry.chatTabId === "" ? EXTERNAL_AGENT_COLOR : chatColorMap.get(entry.chatTabId) || "#64748b");
		$[28] = agentPresenceEntries;
		$[29] = chatColorMap;
		$[30] = next;
	} else next = $[30];
	const agentPresenceColors = next;
	let next_0;
	if ($[31] !== agentPresenceEntries) {
		next_0 = /* @__PURE__ */ new Map();
		for (const [rootId_0, entry_0] of agentPresenceEntries) if (entry_0.wrote) next_0.set(rootId_0, entry_0.chatTabId);
		$[31] = agentPresenceEntries;
		$[32] = next_0;
	} else next_0 = $[32];
	const agentWriteOwners = next_0;
	const [leftPanelTab, setLeftPanelTab] = (0, import_react.useState)(readOnly ? "layers" : "chat");
	const [sidebarV2Tab, setSidebarV2Tab] = (0, import_react.useState)("pages");
	const layersSearchRef = (0, import_react.useRef)(null);
	const pagesSidebarRef = (0, import_react.useRef)(null);
	const assetsSidebarRef = (0, import_react.useRef)(null);
	const pendingAssetsSearchRef = (0, import_react.useRef)(false);
	const leftTabsListRef = (0, import_react.useRef)(null);
	let t41;
	if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
		t41 = () => {
			setChatHistoryOpen(false);
			setArchiveOpen(false);
			setLeftPanelTab("chat");
			setSidebarV2Tab("agents");
		};
		$[33] = t41;
	} else t41 = $[33];
	const revealChatPanel = t41;
	let t42;
	if ($[34] !== enableSidebarV2) {
		t42 = () => {
			if (enableSidebarV2) {
				setSidebarV2Tab("assets");
				if (assetsSidebarRef.current) assetsSidebarRef.current.openSearch();
				else pendingAssetsSearchRef.current = true;
				return;
			}
			setLeftPanelTab("insert");
		};
		$[34] = enableSidebarV2;
		$[35] = t42;
	} else t42 = $[35];
	const revealInsertPanel = t42;
	let t43;
	let t44;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t43 = () => {
			const tabsList = leftTabsListRef.current;
			if (!tabsList) return;
			const handleWheel = (e) => {
				if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
					tabsList.scrollLeft = tabsList.scrollLeft + e.deltaY;
					e.preventDefault();
				}
				e.stopPropagation();
			};
			tabsList.addEventListener("wheel", handleWheel, { passive: false });
			return () => tabsList.removeEventListener("wheel", handleWheel);
		};
		t44 = [];
		$[36] = t43;
		$[37] = t44;
	} else {
		t43 = $[36];
		t44 = $[37];
	}
	(0, import_react.useEffect)(t43, t44);
	const [renameRequestId, setRenameRequestId] = (0, import_react.useState)(null);
	const suppressMenuCloseFocusRef = (0, import_react.useRef)(false);
	const [chromeHidden, setChromeHidden] = (0, import_react.useState)(false);
	let t45;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t45 = (id) => {
			setChromeHidden(false);
			setLeftPanelTab("layers");
			setSidebarV2Tab("pages");
			setRenameRequestId(id);
		};
		$[38] = t45;
	} else t45 = $[38];
	const requestRename = t45;
	let t46;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t46 = (id_0) => {
			suppressMenuCloseFocusRef.current = true;
			requestRename(id_0);
		};
		$[39] = t46;
	} else t46 = $[39];
	const handleRequestRename = t46;
	const [compositionRefreshKey, setCompositionRefreshKey] = (0, import_react.useState)(0);
	const [bottomBarRevealSignal, setBottomBarRevealSignal] = (0, import_react.useState)(0);
	let t47;
	let t48;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t47 = () => {
			const openConnections = () => {
				setChromeHidden(false);
				setBottomBarRevealSignal(_temp1$2);
			};
			window.addEventListener("petal-manage-connections", openConnections);
			return () => window.removeEventListener("petal-manage-connections", openConnections);
		};
		t48 = [];
		$[40] = t47;
		$[41] = t48;
	} else {
		t47 = $[40];
		t48 = $[41];
	}
	(0, import_react.useEffect)(t47, t48);
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const previewOpenTriggerRef = (0, import_react.useRef)(null);
	const [showGitPanel, setShowGitPanel] = (0, import_react.useState)(false);
	let t49;
	let t50;
	if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
		t49 = () => {
			const handler = (e_0) => {
				if (e_0.detail?.tab === "git") setShowGitPanel(_temp10$2);
			};
			window.addEventListener("petal-switch-tab", handler);
			return () => window.removeEventListener("petal-switch-tab", handler);
		};
		t50 = [];
		$[42] = t49;
		$[43] = t50;
	} else {
		t49 = $[42];
		t50 = $[43];
	}
	(0, import_react.useEffect)(t49, t50);
	let t51;
	let t52;
	if ($[44] !== openPreviewRef) {
		t51 = () => {
			if (!openPreviewRef) return;
			openPreviewRef.current = () => {
				previewOpenTriggerRef.current = "menu";
				setPreviewOpen(true);
			};
			return () => {
				openPreviewRef.current = null;
			};
		};
		t52 = [openPreviewRef];
		$[44] = openPreviewRef;
		$[45] = t51;
		$[46] = t52;
	} else {
		t51 = $[45];
		t52 = $[46];
	}
	(0, import_react.useEffect)(t51, t52);
	const [commentsHiddenInternal, setCommentsHiddenInternal] = (0, import_react.useState)(false);
	const commentsHidden = commentsHiddenProp ?? commentsHiddenInternal;
	const setCommentsHidden = onCommentsHiddenChange ?? setCommentsHiddenInternal;
	const [commentModeInternal, setCommentModeInternal] = (0, import_react.useState)(false);
	const commentMode = commentsHidden ? false : commentModeActive ?? commentModeInternal;
	const setCommentMode = onCommentModeChange ?? setCommentModeInternal;
	const showResolvedComments = showResolvedProp ?? false;
	let t53;
	if ($[47] !== searchParams) {
		t53 = () => searchParams?.get("comment") ?? null;
		$[47] = searchParams;
		$[48] = t53;
	} else t53 = $[48];
	const [activeCommentId, setActiveCommentId] = (0, import_react.useState)(t53);
	const [pendingCommentPosition, setPendingCommentPosition] = (0, import_react.useState)(null);
	const effectiveProjectPath = projectPath;
	const effectiveAllowedPaths = allowedPaths;
	const effectiveOnAdd = onAddAllowedPath;
	const chatBackend = useBackendOptional();
	let t54;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t54 = [];
		$[49] = t54;
	} else t54 = $[49];
	const [openCodeFiles, setOpenCodeFiles] = (0, import_react.useState)(t54);
	const openCodeFilesRef = (0, import_react.useRef)(openCodeFiles);
	let t55;
	if ($[50] !== openCodeFiles) {
		t55 = () => {
			openCodeFilesRef.current = openCodeFiles;
		};
		$[50] = openCodeFiles;
		$[51] = t55;
	} else t55 = $[51];
	(0, import_react.useLayoutEffect)(t55);
	const [fileOpenSignal, setFileOpenSignal] = (0, import_react.useState)(null);
	const fileOpenCountRef = (0, import_react.useRef)(0);
	let t56;
	if ($[52] !== chatBackend) {
		t56 = async (filePath, options) => {
			setOpenCodeFiles((prev_0) => prev_0.some((f) => f.path === filePath) ? prev_0 : [...prev_0, {
				path: filePath,
				content: "",
				componentName: options?.componentName
			}]);
			fileOpenCountRef.current = fileOpenCountRef.current + 1;
			setFileOpenSignal({
				path: filePath,
				n: fileOpenCountRef.current,
				line: options?.line
			});
			const readFileRaw = chatBackend ? chatBackend.readFileRaw : void 0;
			let content = "";
			try {
				content = await readSourceFileForBottomBar(readFileRaw, filePath);
			} catch {
				content = `// Couldn't read ${filePath}`;
			}
			setOpenCodeFiles((prev_1) => prev_1.map((f_0) => f_0.path === filePath ? {
				...f_0,
				content
			} : f_0));
		};
		$[52] = chatBackend;
		$[53] = t56;
	} else t56 = $[53];
	const openFileInBottomBar = t56;
	let t57;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t57 = (filePath_0) => {
			setOpenCodeFiles((prev_2) => prev_2.filter((f_1) => f_1.path !== filePath_0));
		};
		$[54] = t57;
	} else t57 = $[54];
	const closeCodeFile = t57;
	let t58;
	if ($[55] !== chatBackend) {
		t58 = async (filePath_1, content_0) => {
			if (!chatBackend?.writeFileRaw) return;
			await chatBackend.writeFileRaw(filePath_1, content_0);
			setOpenCodeFiles((prev_3) => prev_3.map((f_2) => f_2.path === filePath_1 ? {
				...f_2,
				content: content_0
			} : f_2));
		};
		$[55] = chatBackend;
		$[56] = t58;
	} else t58 = $[56];
	const saveCodeFile = t58;
	let t59;
	if ($[57] === Symbol.for("react.memo_cache_sentinel")) {
		t59 = [];
		$[57] = t59;
	} else t59 = $[57];
	const [openSkills, setOpenSkills] = (0, import_react.useState)(t59);
	const [skillOpenSignal, setSkillOpenSignal] = (0, import_react.useState)(null);
	const skillOpenCountRef = (0, import_react.useRef)(0);
	if (readOnly && sidebarV2Tab === "agents") setSidebarV2Tab("pages");
	let t60;
	let t61;
	if ($[58] !== sidebarV2Tab) {
		t60 = () => {
			if (sidebarV2Tab !== "assets" || !pendingAssetsSearchRef.current) return;
			pendingAssetsSearchRef.current = false;
			assetsSidebarRef.current?.openSearch();
		};
		t61 = [sidebarV2Tab];
		$[58] = sidebarV2Tab;
		$[59] = t60;
		$[60] = t61;
	} else {
		t60 = $[59];
		t61 = $[60];
	}
	(0, import_react.useEffect)(t60, t61);
	let t62;
	if ($[61] !== skillOverrides) {
		t62 = (skill) => {
			const override = skillOverrides[skill.name];
			const files = override?.files?.length ? override.files : skill.files;
			const content_1 = files.find(_temp11$2)?.content ?? files[0]?.content ?? "";
			setChromeHidden(false);
			setBottomBarRevealSignal(_temp12$1);
			setOpenSkills((prev_4) => {
				if (prev_4.find((s) => s.name === skill.name)) return prev_4.map((s_0) => s_0.name === skill.name ? {
					...s_0,
					content: content_1
				} : s_0);
				return [...prev_4, {
					name: skill.name,
					content: content_1
				}];
			});
			skillOpenCountRef.current = skillOpenCountRef.current + 1;
			setSkillOpenSignal({
				name: skill.name,
				n: skillOpenCountRef.current
			});
		};
		$[61] = skillOverrides;
		$[62] = t62;
	} else t62 = $[62];
	const openSkillInBottomBar = t62;
	let t63;
	if ($[63] === Symbol.for("react.memo_cache_sentinel")) {
		t63 = (name) => {
			setOpenSkills((prev_5) => prev_5.filter((s_1) => s_1.name !== name));
		};
		$[63] = t63;
	} else t63 = $[63];
	const closeSkill = t63;
	let t64;
	if ($[64] !== onUpdateSkillOverrides || $[65] !== skillOverrides) {
		t64 = async (name_0, content_2) => {
			if (!onUpdateSkillOverrides) return;
			const existingFiles = skillOverrides[name_0]?.files;
			const nextFiles = existingFiles?.length ? existingFiles.map((f_4) => f_4.path === "SKILL.md" ? {
				...f_4,
				content: content_2
			} : f_4) : [{
				path: "SKILL.md",
				content: content_2
			}];
			if (!nextFiles.some(_temp13$1)) nextFiles.push({
				path: "SKILL.md",
				content: content_2
			});
			const next_1 = {
				...skillOverrides,
				[name_0]: {
					files: nextFiles,
					active: skillOverrides[name_0]?.active ?? false
				}
			};
			onUpdateSkillOverrides(next_1);
			setOpenSkills((prev_6) => prev_6.map((s_2) => s_2.name === name_0 ? {
				...s_2,
				content: content_2
			} : s_2));
		};
		$[64] = onUpdateSkillOverrides;
		$[65] = skillOverrides;
		$[66] = t64;
	} else t64 = $[66];
	const saveSkill = t64;
	let t65;
	if ($[67] !== onUpdateSkillOverrides || $[68] !== skillOverrides) {
		t65 = (name_1) => {
			if (!onUpdateSkillOverrides) return;
			const next_2 = { ...skillOverrides };
			delete next_2[name_1];
			onUpdateSkillOverrides(next_2);
			(async () => {
				let content_3;
				try {
					content_3 = await loadSystemSkillMarkdown(name_1);
				} catch {
					return;
				}
				if (content_3 === void 0) return;
				setOpenSkills((prev_7) => prev_7.map((s_3) => s_3.name === name_1 ? {
					...s_3,
					content: content_3
				} : s_3));
			})();
		};
		$[67] = onUpdateSkillOverrides;
		$[68] = skillOverrides;
		$[69] = t65;
	} else t65 = $[69];
	const resetSkillOverride = t65;
	let t66;
	if ($[70] !== onUpdateSkillOverrides || $[71] !== skillOverrides) {
		t66 = (name_2, active) => {
			if (!onUpdateSkillOverrides) return;
			const existing_0 = skillOverrides[name_2];
			if (!active && !existing_0?.files?.length) {
				if (!existing_0) return;
				const next_3 = { ...skillOverrides };
				delete next_3[name_2];
				onUpdateSkillOverrides(next_3);
				return;
			}
			onUpdateSkillOverrides({
				...skillOverrides,
				[name_2]: {
					files: existing_0?.files ?? [],
					active
				}
			});
		};
		$[70] = onUpdateSkillOverrides;
		$[71] = skillOverrides;
		$[72] = t66;
	} else t66 = $[72];
	const toggleSkillOverrideActive = t66;
	const canCustomizeSkills = !!(enableSkillCustomization && isElectron && !readOnly);
	let t67;
	if ($[73] !== canCustomizeSkills || $[74] !== openSkillInBottomBar || $[75] !== resetSkillOverride || $[76] !== skillActionsRef || $[77] !== toggleSkillOverrideActive) {
		t67 = () => {
			if (!skillActionsRef || !canCustomizeSkills) return;
			skillActionsRef.current = {
				onOpenSkill: openSkillInBottomBar,
				onResetSkill: resetSkillOverride,
				onToggleSkillActive: toggleSkillOverrideActive
			};
			return () => {
				skillActionsRef.current = null;
			};
		};
		$[73] = canCustomizeSkills;
		$[74] = openSkillInBottomBar;
		$[75] = resetSkillOverride;
		$[76] = skillActionsRef;
		$[77] = toggleSkillOverrideActive;
		$[78] = t67;
	} else t67 = $[78];
	(0, import_react.useEffect)(t67);
	const chatLoadedRef = (0, import_react.useRef)(false);
	const [unloadedChatIds, setUnloadedChatIds] = (0, import_react.useState)(_temp14$1);
	const unloadedChatIdsRef = (0, import_react.useRef)(unloadedChatIds);
	let t68;
	if ($[79] === Symbol.for("react.memo_cache_sentinel")) {
		t68 = /* @__PURE__ */ new Set();
		$[79] = t68;
	} else t68 = $[79];
	const chatHistoryRequestsRef = (0, import_react.useRef)(t68);
	let t69;
	if ($[80] !== chatBackend || $[81] !== chatMessages) {
		t69 = () => {
			if (chatLoadedRef.current) return;
			let cancelled = false;
			const load = async () => {
				const emptyTab = _temp15$1;
				if (!chatBackend?.listChats) {
					if (!cancelled) {
						setChatTabs([emptyTab()]);
						setVisibleChatIndex(0);
						setChatsLoading(false);
						chatLoadedRef.current = true;
					}
					return;
				}
				try {
					const list = await chatBackend.listChats({ summary: true });
					if (cancelled) return;
					if (list.length > 0) {
						const { tabs, withHistory, unloaded, messageEntries } = splitChatList(list);
						unloadedChatIdsRef.current = unloaded;
						setUnloadedChatIds(unloaded);
						setChatMessages(chatMessages, messageEntries, "load");
						setChatTabs(tabs);
						setVisibleChatIndex(mostRecentlyUpdatedIndex(list));
						if (chatBackend.updateChatTitle) persistMissingChatTitles(withHistory, chatBackend.updateChatTitle);
					} else {
						setChatTabs([emptyTab()]);
						setVisibleChatIndex(0);
					}
					setChatsLoading(false);
					chatLoadedRef.current = true;
				} catch {
					if (!cancelled) {
						setChatTabs([emptyTab()]);
						setVisibleChatIndex(0);
						setChatsLoading(false);
						chatLoadedRef.current = true;
					}
				}
			};
			load();
			return () => {
				cancelled = true;
			};
		};
		$[80] = chatBackend;
		$[81] = chatMessages;
		$[82] = t69;
	} else t69 = $[82];
	let t70;
	if ($[83] !== chatBackend || $[84] !== chatMessages || $[85] !== effectiveProjectPath) {
		t70 = [
			chatBackend,
			effectiveProjectPath,
			chatMessages
		];
		$[83] = chatBackend;
		$[84] = chatMessages;
		$[85] = effectiveProjectPath;
		$[86] = t70;
	} else t70 = $[86];
	(0, import_react.useEffect)(t69, t70);
	const t71 = chatBackend ?? null;
	let t72;
	if ($[87] !== t71) {
		t72 = new ChatPersistence(t71);
		$[87] = t71;
		$[88] = t72;
	} else t72 = $[88];
	const chatPersistence = t72;
	let t73;
	if ($[89] === Symbol.for("react.memo_cache_sentinel")) {
		t73 = /* @__PURE__ */ new Set();
		$[89] = t73;
	} else t73 = $[89];
	const requestedChatTitles = (0, import_react.useRef)(t73);
	let t74;
	if ($[90] === Symbol.for("react.memo_cache_sentinel")) {
		t74 = /* @__PURE__ */ new Set();
		$[90] = t74;
	} else t74 = $[90];
	const pendingChatTitles = (0, import_react.useRef)(t74);
	let t75;
	if ($[91] === Symbol.for("react.memo_cache_sentinel")) {
		t75 = /* @__PURE__ */ new Set();
		$[91] = t75;
	} else t75 = $[91];
	const archivingChatIdsRef = (0, import_react.useRef)(t75);
	let t76;
	if ($[92] !== chatMessages) {
		t76 = (tab_0) => ({
			...tab_0,
			messages: unloadedChatIdsRef.current.has(tab_0.id) ? null : getChatMessages(chatMessages, tab_0.id)
		});
		$[92] = chatMessages;
		$[93] = t76;
	} else t76 = $[93];
	const persistedChat = t76;
	let t77;
	if ($[94] === Symbol.for("react.memo_cache_sentinel")) {
		t77 = /* @__PURE__ */ new Set();
		$[94] = t77;
	} else t77 = $[94];
	const unsavedChatIdsRef = (0, import_react.useRef)(t77);
	const chatSaveTimerRef = (0, import_react.useRef)(void 0);
	let t78;
	if ($[95] !== chatMessages || $[96] !== chatPersistence || $[97] !== effectiveProjectPath) {
		t78 = () => {
			clearTimeout(chatSaveTimerRef.current);
			const unsaved = [...unsavedChatIdsRef.current];
			unsavedChatIdsRef.current.clear();
			for (const chatId of unsaved) {
				if (unloadedChatIdsRef.current.has(chatId)) continue;
				const tab_1 = chatTabsRef.current.find((item) => item.id === chatId);
				const messages = getChatMessages(chatMessages, chatId);
				if (tab_1 && messages.length > 0) chatPersistence.save({
					...tab_1,
					messages
				}).then((serverId) => {
					if (serverId && serverId !== tab_1.id && effectiveProjectPath) migrateAgentSessionId(effectiveProjectPath, tab_1.id, serverId);
				}).catch(_temp16$1);
			}
		};
		$[95] = chatMessages;
		$[96] = chatPersistence;
		$[97] = effectiveProjectPath;
		$[98] = t78;
	} else t78 = $[98];
	const flushChatSaves = t78;
	let t79;
	if ($[99] !== flushChatSaves) {
		t79 = (chatIds) => {
			for (const chatId_0 of chatIds) unsavedChatIdsRef.current.add(chatId_0);
			clearTimeout(chatSaveTimerRef.current);
			chatSaveTimerRef.current = setTimeout(flushChatSaves, 500);
		};
		$[99] = flushChatSaves;
		$[100] = t79;
	} else t79 = $[100];
	const saveChatsSoon = t79;
	let t80;
	let t81;
	if ($[101] !== chatMessages || $[102] !== saveChatsSoon) {
		t80 = () => subscribeChatMessageEdits(chatMessages, saveChatsSoon);
		t81 = [chatMessages, saveChatsSoon];
		$[101] = chatMessages;
		$[102] = saveChatsSoon;
		$[103] = t80;
		$[104] = t81;
	} else {
		t80 = $[103];
		t81 = $[104];
	}
	(0, import_react.useEffect)(t80, t81);
	let t82;
	let t83;
	if ($[105] !== flushChatSaves) {
		t82 = () => flushChatSaves;
		t83 = [flushChatSaves];
		$[105] = flushChatSaves;
		$[106] = t82;
		$[107] = t83;
	} else {
		t82 = $[106];
		t83 = $[107];
	}
	(0, import_react.useEffect)(t82, t83);
	const chatHasMessages = (chatId_1) => !!chatId_1 && (getChatMessages(chatMessages, chatId_1).length > 0 || unloadedChatIds.has(chatId_1));
	const [chatHistoryRetry, setChatHistoryRetry] = (0, import_react.useState)(0);
	let t84;
	if ($[108] === Symbol.for("react.memo_cache_sentinel")) {
		t84 = /* @__PURE__ */ new Map();
		$[108] = t84;
	} else t84 = $[108];
	const chatHistoryFailuresRef = (0, import_react.useRef)(t84);
	let t85;
	if ($[109] !== chatBackend || $[110] !== chatMessages || $[111] !== saveChatsSoon) {
		t85 = (chatId_2) => {
			if (!chatBackend?.getChat || !unloadedChatIdsRef.current.has(chatId_2) || chatHistoryRequestsRef.current.has(chatId_2)) return;
			chatHistoryRequestsRef.current.add(chatId_2);
			chatBackend.getChat(chatId_2).then((detail) => {
				chatHistoryRequestsRef.current.delete(chatId_2);
				chatHistoryFailuresRef.current.delete(chatId_2);
				if (!unloadedChatIdsRef.current.has(chatId_2)) return;
				const stored = normalizeChatMessages(detail?.messages);
				const sentMeanwhile = getChatMessages(chatMessages, chatId_2);
				const unloaded_0 = new Set(unloadedChatIdsRef.current);
				unloaded_0.delete(chatId_2);
				unloadedChatIdsRef.current = unloaded_0;
				setUnloadedChatIds(unloaded_0);
				setChatMessages(chatMessages, [[chatId_2, [...stored, ...sentMeanwhile]]], "load");
				if (sentMeanwhile.length > 0) saveChatsSoon([chatId_2]);
				if (detail && !detail.title) {
					const title = titleFromFirstUserMessage(stored);
					if (title) {
						setChatTabs((prev_8) => prev_8.map((tab_2) => tab_2.id === chatId_2 && !tab_2.title ? {
							...tab_2,
							title
						} : tab_2));
						chatBackend.updateChatTitle?.(chatId_2, title);
					}
				}
			}).catch(() => {
				chatHistoryRequestsRef.current.delete(chatId_2);
				const failures = (chatHistoryFailuresRef.current.get(chatId_2) ?? 0) + 1;
				chatHistoryFailuresRef.current.set(chatId_2, failures);
				setTimeout(() => setChatHistoryRetry(_temp17$1), Math.min(1e4, 1e3 * failures));
			});
		};
		$[109] = chatBackend;
		$[110] = chatMessages;
		$[111] = saveChatsSoon;
		$[112] = t85;
	} else t85 = $[112];
	const loadChatHistory = (0, import_react.useEffectEvent)(t85);
	const visibleChatId = chatTabs[visibleChatIndex]?.id;
	let t86;
	if ($[113] !== loadChatHistory || $[114] !== visibleChatId) {
		t86 = () => {
			if (visibleChatId) loadChatHistory(visibleChatId);
		};
		$[113] = loadChatHistory;
		$[114] = visibleChatId;
		$[115] = t86;
	} else t86 = $[115];
	let t87;
	if ($[116] !== chatHistoryRetry || $[117] !== unloadedChatIds || $[118] !== visibleChatId) {
		t87 = [
			visibleChatId,
			unloadedChatIds,
			chatHistoryRetry
		];
		$[116] = chatHistoryRetry;
		$[117] = unloadedChatIds;
		$[118] = visibleChatId;
		$[119] = t87;
	} else t87 = $[119];
	(0, import_react.useEffect)(t86, t87);
	let t88;
	if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
		t88 = () => {
			const id_1 = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
			setChatTabs((prev_9) => [{
				id: id_1,
				title: null,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...prev_9]);
			setVisibleChatIndex(0);
			revealChatPanel();
			return id_1;
		};
		$[120] = t88;
	} else t88 = $[120];
	const handleNewChat = t88;
	let t89;
	if ($[121] !== chatTabs) {
		t89 = (chatId_3) => {
			const idx = chatTabs.findIndex((t) => t.id === chatId_3);
			if (idx !== -1) {
				setVisibleChatIndex(idx);
				setUnreadChatIds((previous) => {
					if (!previous.has(chatId_3)) return previous;
					const next_4 = new Set(previous);
					next_4.delete(chatId_3);
					return next_4;
				});
			}
		};
		$[121] = chatTabs;
		$[122] = t89;
	} else t89 = $[122];
	const handleSwitchChat = t89;
	let t90;
	if ($[123] === Symbol.for("react.memo_cache_sentinel")) {
		t90 = (chatId_4) => {
			setRunningChatIds((previous_0) => new Set(previous_0).add(chatId_4));
			setUnreadChatIds((previous_1) => {
				if (!previous_1.has(chatId_4)) return previous_1;
				const next_5 = new Set(previous_1);
				next_5.delete(chatId_4);
				return next_5;
			});
		};
		$[123] = t90;
	} else t90 = $[123];
	const handleChatStreamStart = t90;
	let t91;
	if ($[124] === Symbol.for("react.memo_cache_sentinel")) {
		t91 = (chatId_5) => {
			clearAiCopyTargets(chatId_5);
			setRunningChatIds((previous_2) => {
				const next_6 = new Set(previous_2);
				next_6.delete(chatId_5);
				return next_6;
			});
			const visibleChat = chatTabsRef.current[visibleChatIndexRef.current];
			if (visibleChat?.id === chatId_5) {
				setFollowAi(false);
				writeFollowAiPreference(false);
			}
			if (visibleChat?.id !== chatId_5) setUnreadChatIds((previous_3) => new Set(previous_3).add(chatId_5));
		};
		$[124] = t91;
	} else t91 = $[124];
	const handleChatStreamFinish = t91;
	let t92;
	if ($[125] !== chatBackend || $[126] !== chatMessages || $[127] !== saveChatsSoon) {
		t92 = (tabId, newMessages, currentTitle) => {
			setChatMessages(chatMessages, [[tabId, newMessages]]);
			const fallbackTitle = !currentTitle ? titleFromFirstUserMessage(newMessages) : null;
			if (fallbackTitle && chatTabsRef.current.some((t_1) => t_1.id === tabId && t_1.title == null)) setChatTabs((prev_10) => prev_10.map((t_0) => t_0.id === tabId && t_0.title == null ? {
				...t_0,
				title: fallbackTitle
			} : t_0));
			const firstMessage = newMessages.find(_temp18$1);
			if (!currentTitle && firstMessage && chatBackend?.generateChatTitle && !requestedChatTitles.current.has(tabId)) {
				requestedChatTitles.current.add(tabId);
				pendingChatTitles.current.add(tabId);
				const fallback = titleFromFirstUserMessage(newMessages) || "New chat";
				chatBackend.generateChatTitle({
					message: firstMessage.content,
					context: firstMessage.inlineRefs?.map(_temp19$1) ?? []
				}).then((title_0) => {
					if (!pendingChatTitles.current.delete(tabId)) return;
					const generatedTitle = title_0.trim() || fallback;
					setChatTabs((previous_4) => previous_4.map((tab_3) => tab_3.id === tabId ? {
						...tab_3,
						title: generatedTitle,
						generatedTitle
					} : tab_3));
					saveChatsSoon([tabId]);
				}).catch(() => {
					pendingChatTitles.current.delete(tabId);
				});
			}
		};
		$[125] = chatBackend;
		$[126] = chatMessages;
		$[127] = saveChatsSoon;
		$[128] = t92;
	} else t92 = $[128];
	const applyChatMessages = t92;
	let t93;
	if ($[129] !== chatPersistence || $[130] !== enableAgentsV2 || $[131] !== persistedChat) {
		t93 = (chatId_6, title_1) => {
			const tab_4 = chatTabsRef.current.find((item_0) => item_0.id === chatId_6);
			const name_3 = title_1.trim().slice(0, 500);
			if (!tab_4 || !name_3) return;
			pendingChatTitles.current.delete(chatId_6);
			if (enableAgentsV2) requestedChatTitles.current.add(chatId_6);
			setChatTabs((previous_5) => previous_5.map((item_1) => item_1.id === chatId_6 ? {
				...item_1,
				title: name_3,
				generatedTitle: void 0
			} : item_1));
			chatPersistence.rename(persistedChat(tab_4), name_3).catch(_temp20$1);
		};
		$[129] = chatPersistence;
		$[130] = enableAgentsV2;
		$[131] = persistedChat;
		$[132] = t93;
	} else t93 = $[132];
	const handleRenameChat = t93;
	let t94;
	if ($[133] !== chatMessages || $[134] !== chatPersistence) {
		t94 = async (id_2) => {
			const restored = await chatPersistence.restore(id_2);
			setArchiveOpen(false);
			setChatHistoryOpen(false);
			const [t95] = chatTabsFromList([restored]);
			const { tab: tab_5, messages: messages_0 } = t95;
			setChatMessages(chatMessages, [[tab_5.id, messages_0]], "load");
			setChatTabs((previous_6) => [tab_5, ...previous_6.filter((item_2) => chatPersistence.idFor(item_2.id) !== restored.id)]);
			setVisibleChatIndex(0);
		};
		$[133] = chatMessages;
		$[134] = chatPersistence;
		$[135] = t94;
	} else t94 = $[135];
	const handleRestoreChat = t94;
	let t95;
	if ($[136] !== chatMessages || $[137] !== chatPersistence || $[138] !== enableAgentsV2 || $[139] !== handleRestoreChat || $[140] !== persistedChat || $[141] !== projectPath || $[142] !== runningChatIds) {
		t95 = async (chatId_7) => {
			if (runningChatIds.has(chatId_7)) {
				toast.info("Stop the response before archiving this chat.");
				return;
			}
			if (archivingChatIdsRef.current.has(chatId_7)) return;
			const tab_6 = chatTabsRef.current.find((item_3) => item_3.id === chatId_7);
			if (!tab_6) return;
			archivingChatIdsRef.current.add(chatId_7);
			if (enableAgentsV2) dropAgentChatTab(projectPath, chatId_7);
			const emptyTab_0 = {
				id: `local-${crypto.randomUUID()}`,
				title: null,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			const current = chatTabsRef.current;
			const selected = current[visibleChatIndexRef.current]?.id;
			const remaining = current.filter((item_4) => item_4.id !== chatId_7);
			setChatTabs((previous_7) => {
				const next_7 = previous_7.filter((item_5) => item_5.id !== chatId_7);
				return next_7.length ? next_7 : [emptyTab_0];
			});
			setVisibleChatIndex(Math.max(0, remaining.findIndex((item_6) => item_6.id === selected)));
			setUnreadChatIds((previous_8) => {
				const next_8 = new Set(previous_8);
				next_8.delete(chatId_7);
				return next_8;
			});
			try {
				const id_3 = await chatPersistence.archive(persistedChat(tab_6));
				deleteChatMessages(chatMessages, chatId_7);
				if (unloadedChatIdsRef.current.has(chatId_7)) {
					const unloaded_1 = new Set(unloadedChatIdsRef.current);
					unloaded_1.delete(chatId_7);
					unloadedChatIdsRef.current = unloaded_1;
					setUnloadedChatIds(unloaded_1);
				}
				toast.success("Chat archived", { action: {
					label: "Undo",
					onClick: () => {
						handleRestoreChat(id_3).catch(_temp21$1);
					}
				} });
			} catch (t96) {
				const error = t96;
				setChatTabs((previous_9) => [tab_6, ...previous_9.filter((item_7) => item_7.id !== chatId_7 && item_7.id !== emptyTab_0.id)]);
				setVisibleChatIndex(0);
				toast.error(error instanceof Error ? error.message : "Could not archive chat.");
			}
			archivingChatIdsRef.current.delete(chatId_7);
		};
		$[136] = chatMessages;
		$[137] = chatPersistence;
		$[138] = enableAgentsV2;
		$[139] = handleRestoreChat;
		$[140] = persistedChat;
		$[141] = projectPath;
		$[142] = runningChatIds;
		$[143] = t95;
	} else t95 = $[143];
	const handleArchiveChat = t95;
	let t96;
	if ($[144] !== handleArchiveChat || $[145] !== runningChatIds.size) {
		t96 = async () => {
			if (runningChatIds.size > 0) {
				toast.info("Stop running responses before archiving all chats.");
				return;
			}
			await Promise.all(chatTabsRef.current.map((tab_7) => handleArchiveChat(tab_7.id)));
			setVisibleChatIndex(0);
		};
		$[144] = handleArchiveChat;
		$[145] = runningChatIds.size;
		$[146] = t96;
	} else t96 = $[146];
	const handleArchiveAllChats = t96;
	const hasHandledShareLinkRef = (0, import_react.useRef)(false);
	const [editingTextId, setEditingTextId] = (0, import_react.useState)(null);
	let t97;
	if ($[147] === Symbol.for("react.memo_cache_sentinel")) {
		t97 = {
			onSelectElement: _temp22$1,
			onSelectElements: _temp23$1,
			onDragElements: _temp24$1,
			onRenameElement: _temp25,
			onFocusElement: _temp26,
			onContextMenuRow: _temp27
		};
		$[147] = t97;
	} else t97 = $[147];
	const sidebarLayerActionsRef = (0, import_react.useRef)(t97);
	let t98;
	if ($[148] === Symbol.for("react.memo_cache_sentinel")) {
		t98 = (id_4, add) => {
			sidebarLayerActionsRef.current.onSelectElement(id_4, add);
		};
		$[148] = t98;
	} else t98 = $[148];
	const onSidebarSelectElement = t98;
	let t99;
	if ($[149] === Symbol.for("react.memo_cache_sentinel")) {
		t99 = (ids) => {
			sidebarLayerActionsRef.current.onSelectElements(ids);
		};
		$[149] = t99;
	} else t99 = $[149];
	const onSidebarSelectElements = t99;
	let t100;
	if ($[150] === Symbol.for("react.memo_cache_sentinel")) {
		t100 = (draggedIds, targetId, position) => {
			sidebarLayerActionsRef.current.onDragElements(draggedIds, targetId, position);
		};
		$[150] = t100;
	} else t100 = $[150];
	const onSidebarDragElements = t100;
	let t101;
	if ($[151] === Symbol.for("react.memo_cache_sentinel")) {
		t101 = (id_5, name_4) => sidebarLayerActionsRef.current.onRenameElement(id_5, name_4);
		$[151] = t101;
	} else t101 = $[151];
	const onSidebarRenameElement = t101;
	let t102;
	if ($[152] === Symbol.for("react.memo_cache_sentinel")) {
		t102 = (id_6) => {
			sidebarLayerActionsRef.current.onFocusElement(id_6);
		};
		$[152] = t102;
	} else t102 = $[152];
	const onSidebarFocusElement = t102;
	let t103;
	if ($[153] === Symbol.for("react.memo_cache_sentinel")) {
		t103 = (id_7) => {
			sidebarLayerActionsRef.current.onContextMenuRow(id_7);
		};
		$[153] = t103;
	} else t103 = $[153];
	const onSidebarContextMenuRow = t103;
	const openFileInBottomBarRef = (0, import_react.useRef)(openFileInBottomBar);
	let t104;
	if ($[154] !== openFileInBottomBar) {
		t104 = () => {
			openFileInBottomBarRef.current = openFileInBottomBar;
		};
		$[154] = openFileInBottomBar;
		$[155] = t104;
	} else t104 = $[155];
	(0, import_react.useLayoutEffect)(t104);
	const descendInto = _temp28;
	let t105;
	if ($[156] !== readOnly) {
		t105 = (childId) => {
			if (readOnly) return;
			if (getById(usePages.getState().tree, childId)?.type === "text") setEditingTextId(childId);
		};
		$[156] = readOnly;
		$[157] = t105;
	} else t105 = $[157];
	const editTextOnDescent = t105;
	let t106;
	if ($[158] !== readOnly) {
		t106 = (id_8) => {
			if (readOnly) return;
			const element = getById(usePages.getState().tree, id_8);
			if (!element || element.type === "text") return;
			if (element.type === "html" && (element.tag === "img" || element.tag === "video") && element.props?.src) {
				requestImageFillEdit(id_8);
				return;
			}
			const { backgroundImage, background } = element.styles ?? {};
			const fills = parseFills({
				backgroundImage,
				background
			});
			if ("props" in element && element.props?.["data-lg-video-fill"] || fills.some(_temp29)) requestImageFillEdit(id_8);
		};
		$[158] = readOnly;
		$[159] = t106;
	} else t106 = $[159];
	const editImageFillOnDescent = t106;
	let t107;
	if ($[160] !== editImageFillOnDescent || $[161] !== editTextOnDescent) {
		t107 = (id_9, t108, t109, click) => {
			const addToSelection = t108 === void 0 ? false : t108;
			if (t109 === void 0 ? false : t109) return;
			const { select, selectOne, toggle, clearSelection } = useSelection.getState();
			if (id_9 === null) {
				clearSelection();
				return;
			}
			if (addToSelection) {
				if (click && isDescendClick(click)) for (const selectedId of getSelectedElementIds()) {
					const childId_0 = descendInto(selectedId, click.path);
					if (childId_0) {
						const next_9 = new Set(getSelectedElementIds());
						next_9.delete(selectedId);
						next_9.add(resolveTextOwner(usePages.getState().tree, childId_0));
						select(next_9, selectedId);
						editTextOnDescent(childId_0);
						return;
					}
				}
				toggle(id_9);
			} else {
				const current_0 = getSelectedElementIds();
				if (click && isDescendClick(click) && current_0.size === 1) {
					const from = current_0.values().next().value;
					const childId_1 = descendInto(from, click.path);
					if (childId_1) {
						select(/* @__PURE__ */ new Set([resolveTextOwner(usePages.getState().tree, childId_1)]), from);
						editTextOnDescent(childId_1);
						return;
					}
					if (from === id_9) editImageFillOnDescent(id_9);
				}
				selectOne(id_9);
			}
		};
		$[160] = editImageFillOnDescent;
		$[161] = editTextOnDescent;
		$[162] = t107;
	} else t107 = $[162];
	const handleSelectElement = t107;
	const handleSelectElements = _temp30;
	const activeTextEditorRef = (0, import_react.useRef)(null);
	const [textSelectionState, setTextSelectionState] = (0, import_react.useState)(null);
	const [showCreateComponentModal, setShowCreateComponentModal] = (0, import_react.useState)(false);
	let t108;
	if ($[163] === Symbol.for("react.memo_cache_sentinel")) {
		t108 = () => setShowCreateComponentModal(true);
		$[163] = t108;
	} else t108 = $[163];
	const openCreateComponent = t108;
	const [canvasMenuTargetId, setCanvasMenuTargetId] = (0, import_react.useState)(null);
	const contextMenuPointRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const viewportRef = (0, import_react.useRef)(null);
	let t109;
	if ($[164] === Symbol.for("react.memo_cache_sentinel")) {
		t109 = {
			x: 0,
			y: 0,
			valid: false
		};
		$[164] = t109;
	} else t109 = $[164];
	const lastPointerScreenRef = (0, import_react.useRef)(t109);
	const chatPanelRef = (0, import_react.useRef)(null);
	let t110;
	if ($[165] === Symbol.for("react.memo_cache_sentinel")) {
		t110 = (elementId) => {
			useSelection.getState().select(/* @__PURE__ */ new Set([elementId]));
			pendingCenterRef.current = elementId;
			setCenterEpoch(_temp31);
		};
		$[165] = t110;
	} else t110 = $[165];
	const handleSelectChatElement = t110;
	const t111 = !chromeHidden && !archiveOpen && !chatHistoryOpen && (enableSidebarV2 ? sidebarV2Tab === "agents" : leftPanelTab === "chat");
	const t112 = chatTabs[visibleChatIndex]?.id;
	let t113;
	if ($[166] === Symbol.for("react.memo_cache_sentinel")) {
		t113 = () => {
			setChromeHidden(false);
			revealChatPanel();
		};
		$[166] = t113;
	} else t113 = $[166];
	let t114;
	if ($[167] !== chatTabs.length || $[168] !== chatsLoading || $[169] !== t111 || $[170] !== t112) {
		t114 = {
			loading: chatsLoading,
			visible: t111,
			chatCount: chatTabs.length,
			activeChatId: t112,
			panelRef: chatPanelRef,
			reveal: t113,
			createChat: handleNewChat
		};
		$[167] = chatTabs.length;
		$[168] = chatsLoading;
		$[169] = t111;
		$[170] = t112;
		$[171] = t114;
	} else t114 = $[171];
	const addToPrompt = usePromptContextInsertion(t114);
	let t115;
	if ($[172] !== addToPrompt || $[173] !== componentIndex) {
		t115 = async (rect, live) => {
			const canvasEl = canvasRef.current;
			const viewportEl = viewportRef.current;
			if (!canvasEl || !viewportEl) return;
			const captured = captureCanvasRegionForPrompt({
				canvasEl,
				viewportEl,
				rect,
				store: usePages.getState().tree,
				componentIndex,
				pageId: activePageIdRef.current || void 0
			});
			if (!captured) return;
			if (live) Object.assign(captured.region, await describeLiveElement(live));
			addToPrompt((panel) => panel.addCanvasRegion(captured.region, captured.screenshot));
		};
		$[172] = addToPrompt;
		$[173] = componentIndex;
		$[174] = t115;
	} else t115 = $[174];
	const handleCaptureCanvasRegion = t115;
	const [chatAreas, setChatAreas] = (0, import_react.useState)(null);
	let t116;
	if ($[175] !== chatAreas || $[176] !== chatTabs || $[177] !== visibleChatIndex) {
		t116 = () => !!chatAreas && chatAreas.chatId === chatTabs[visibleChatIndex]?.id && chatAreas.pageId === activePageIdRef.current;
		$[175] = chatAreas;
		$[176] = chatTabs;
		$[177] = visibleChatIndex;
		$[178] = t116;
	} else t116 = $[178];
	const chatAreasShown = t116;
	let t117;
	if ($[179] !== chatAreasShown || $[180] !== chatMessages || $[181] !== chatTabs || $[182] !== visibleChatIndex) {
		t117 = () => {
			if (chatAreasShown()) {
				setChatAreas(null);
				return;
			}
			const pageId = activePageIdRef.current;
			const areas = [];
			const elements = /* @__PURE__ */ new Map();
			const collect = (ref_0, source) => {
				if (ref_0.region) {
					if (!ref_0.region.pageId || !pageId || ref_0.region.pageId === pageId) areas.push({
						id: ref_0.id,
						name: ref_0.name,
						source,
						rect: ref_0.region.rect
					});
				} else if (ref_0.type === "element" && !elements.has(ref_0.id)) elements.set(ref_0.id, ref_0.name.replace(/^<([^>]+)>.*$/, "$1"));
			};
			let userMessage = 0;
			for (const message_0 of getChatMessages(chatMessages, chatTabs[visibleChatIndex]?.id)) {
				if (message_0.role !== "user") continue;
				userMessage++;
				for (const ref_1 of message_0.inlineRefs ?? []) collect(ref_1, `#${userMessage}`);
			}
			for (const ref_2 of chatPanelRef.current?.getDraftCanvasReferences() ?? []) collect(ref_2, "draft");
			const nameCounts = /* @__PURE__ */ new Map();
			for (const area of areas) nameCounts.set(area.name, (nameCounts.get(area.name) ?? 0) + 1);
			const marks = areas.map((area_0, i_0) => ({
				key: `${area_0.id}:${i_0}`,
				label: nameCounts.get(area_0.name) > 1 ? `${area_0.name} · ${area_0.source}` : area_0.name,
				rect: area_0.rect
			}));
			const canvasEl_0 = canvasRef.current;
			const viewportEl_0 = viewportRef.current;
			if (canvasEl_0 && viewportEl_0) {
				const camera = getCamera();
				for (const [id_10, label] of elements) {
					const rect_0 = canvasRectOfElementId(canvasEl_0, viewportEl_0, id_10, camera);
					if (rect_0) marks.push({
						key: `element:${id_10}`,
						label,
						rect: rect_0
					});
				}
			}
			if (marks.length === 0) {
				toast.info("Nothing from this chat on this page");
				return;
			}
			setChatAreas({
				chatId: chatTabs[visibleChatIndex]?.id,
				pageId,
				marks
			});
			const fitted = viewportEl_0 && cameraToFit(marks.map(_temp32), viewportEl_0.clientWidth, viewportEl_0.clientHeight);
			if (fitted) {
				driveCamera(fitted);
				notifyUserCameraGesture();
			}
		};
		$[179] = chatAreasShown;
		$[180] = chatMessages;
		$[181] = chatTabs;
		$[182] = visibleChatIndex;
		$[183] = t117;
	} else t117 = $[183];
	const toggleChatAreas = t117;
	let t118;
	if ($[184] === Symbol.for("react.memo_cache_sentinel")) {
		t118 = () => {
			setChatAreas(null);
			publishAreaHighlight(null);
		};
		$[184] = t118;
	} else t118 = $[184];
	const dismissCanvasAreaChrome = (0, import_react.useEffectEvent)(t118);
	let t119;
	if ($[185] !== dismissCanvasAreaChrome) {
		t119 = () => registerCanvasAreaDismiss(() => dismissCanvasAreaChrome());
		$[185] = dismissCanvasAreaChrome;
		$[186] = t119;
	} else t119 = $[186];
	let t120;
	if ($[187] === Symbol.for("react.memo_cache_sentinel")) {
		t120 = [];
		$[187] = t120;
	} else t120 = $[187];
	(0, import_react.useEffect)(t119, t120);
	let t121;
	if ($[188] !== addToPrompt) {
		t121 = (elementId_0) => {
			addToPrompt((panel_0) => panel_0.addSelectedElements([elementId_0]));
		};
		$[188] = addToPrompt;
		$[189] = t121;
	} else t121 = $[189];
	const handlePickElementForChat = t121;
	let t122;
	if ($[190] !== chatMessages) {
		t122 = (text) => {
			revealChatPanel();
			const current_1 = chatTabsRef.current[visibleChatIndexRef.current];
			let targetId_0 = current_1?.id;
			if (!current_1 || getChatMessages(chatMessages, current_1.id).length > 0 || unloadedChatIdsRef.current.has(current_1.id)) {
				const newId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
				targetId_0 = newId;
				setChatTabs((prev_11) => [{
					id: newId,
					title: null,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...prev_11]);
				setVisibleChatIndex(0);
			}
			let attemptsLeft = 40;
			const trySetDraft = () => {
				const visibleTab = chatTabsRef.current[visibleChatIndexRef.current];
				if (chatPanelRef.current && visibleTab?.id === targetId_0) {
					chatPanelRef.current.setInputText(text);
					return;
				}
				attemptsLeft = attemptsLeft - 1;
				if (attemptsLeft > 0) setTimeout(trySetDraft, 50);
			};
			setTimeout(trySetDraft, 0);
		};
		$[190] = chatMessages;
		$[191] = t122;
	} else t122 = $[191];
	const openHelpDraftInNewChat = t122;
	const incomingHelpDraft = !chatsLoading ? externalChatDraft ? {
		key: `draft-${externalChatDraft.id}`,
		text: externalChatDraft.text,
		preferredId: `local-draft-${externalChatDraft.id}`,
		send: !!externalChatDraft.send
	} : focusChatOnMount ? {
		key: "mount",
		text: "",
		preferredId: "local-focus-on-mount",
		send: false
	} : null : null;
	if (incomingHelpDraft && appliedHelpDraft?.key !== incomingHelpDraft.key) {
		const current_2 = chatTabs[visibleChatIndex];
		const reuse = !!current_2 && !chatHasMessages(current_2.id);
		const targetId_1 = reuse ? current_2.id : incomingHelpDraft.preferredId;
		setAppliedHelpDraft({
			key: incomingHelpDraft.key,
			text: incomingHelpDraft.text,
			targetId: targetId_1,
			send: incomingHelpDraft.send
		});
		if (incomingHelpDraft.send && !followAi) setFollowAi(true);
		if (!reuse) {
			setChatTabs((previous_10) => [{
				id: incomingHelpDraft.preferredId,
				title: null,
				createdAt: incomingHelpDraft.key
			}, ...previous_10]);
			if (visibleChatIndex !== 0) setVisibleChatIndex(0);
		}
		if (chatHistoryOpen) setChatHistoryOpen(false);
		if (archiveOpen) setArchiveOpen(false);
		if (leftPanelTab !== "chat") setLeftPanelTab("chat");
		if (sidebarV2Tab !== "agents") setSidebarV2Tab("agents");
	}
	const appliedComposerKeyRef = (0, import_react.useRef)(null);
	let t123;
	let t124;
	if ($[192] !== appliedHelpDraft || $[193] !== chatTabs || $[194] !== visibleChatIndex) {
		t123 = () => {
			if (!appliedHelpDraft) return;
			if (appliedComposerKeyRef.current === appliedHelpDraft.key) return;
			const visibleTab_0 = chatTabs[visibleChatIndex];
			if (!chatPanelRef.current || visibleTab_0?.id !== appliedHelpDraft.targetId) return;
			if (appliedHelpDraft.send) {
				writeFollowAiPreference(true);
				chatPanelRef.current.sendMessage(appliedHelpDraft.text, IMPORT_MODEL);
			} else chatPanelRef.current.setInputText(appliedHelpDraft.text);
			appliedComposerKeyRef.current = appliedHelpDraft.key;
		};
		t124 = [
			appliedHelpDraft,
			chatTabs,
			visibleChatIndex
		];
		$[192] = appliedHelpDraft;
		$[193] = chatTabs;
		$[194] = visibleChatIndex;
		$[195] = t123;
		$[196] = t124;
	} else {
		t123 = $[195];
		t124 = $[196];
	}
	(0, import_react.useLayoutEffect)(t123, t124);
	let t125;
	if ($[197] !== openHelpDraftInNewChat) {
		t125 = () => {
			openHelpDraftInNewChat("Help me set up an icon library for this project. Find a React icon pack (for example lucide-react, @heroicons/react, or @phosphor-icons/react), add it to package.json, and enable it in the Petal icon settings.");
		};
		$[197] = openHelpDraftInNewChat;
		$[198] = t125;
	} else t125 = $[198];
	const handleAskAIForIconLibrary = t125;
	let t126;
	if ($[199] !== onImportDesignSystem || $[200] !== openHelpDraftInNewChat) {
		t126 = () => {
			if (onImportDesignSystem) onImportDesignSystem();
			else openHelpDraftInNewChat(IMPORT_DESIGN_SYSTEM_PROMPT);
		};
		$[199] = onImportDesignSystem;
		$[200] = openHelpDraftInNewChat;
		$[201] = t126;
	} else t126 = $[201];
	const handleImportDesignSystem = t126;
	let t127;
	if ($[202] !== openHelpDraftInNewChat) {
		t127 = (componentName, error_0) => {
			openHelpDraftInNewChat(`Fix the error in ${componentName}: ${error_0}`);
		};
		$[202] = openHelpDraftInNewChat;
		$[203] = t127;
	} else t127 = $[203];
	const handleFixWithAI = t127;
	let t128;
	if ($[204] === Symbol.for("react.memo_cache_sentinel")) {
		t128 = () => {
			revealChatPanel();
			chatPanelRef.current?.setInputText("Create a Button component with several useful variants and sizes, then add a small showcase of those variants to the current canvas.");
		};
		$[204] = t128;
	} else t128 = $[204];
	const handleAskAIForStarterComponent = t128;
	let t129;
	if ($[205] === Symbol.for("react.memo_cache_sentinel")) {
		t129 = (request) => {
			const componentList = request.componentNames.length > 0 ? ` The scanner found these exports: ${request.componentNames.join(", ")}.` : "";
			const prompt = [
				"Use the petal-compositions skill.",
				`Read ${request.componentFilePath} and create or update its paired composition sidecar at ${request.compositionFilePath}.`,
				`${componentList} Create useful, valid static JSX composition exports based on the real component API.`,
				"Write the composition file to the Petal project and then stop. Petal will validate it and add the first composition to the current canvas automatically."
			].join(" ");
			revealChatPanel();
			requestAnimationFrame(() => chatPanelRef.current?.sendMessage(prompt));
		};
		$[205] = t129;
	} else t129 = $[205];
	const handleAskAIForComposition = t129;
	let t130;
	if ($[206] === Symbol.for("react.memo_cache_sentinel")) {
		t130 = async (prompt_0, changes, sourceUrl, componentNames, capturedElementId, projectRoot) => {
			if (sourceUrl && componentNames && capturedElementId) {
				let screenshotDataUrl;
				try {
					const el = document.querySelector(`[data-element-id="${capturedElementId}"]`);
					if (el) screenshotDataUrl = await captureSaveToCodeScreenshot(el);
				} catch {}
				const editSession = getComponentEditSession(capturedElementId);
				const componentEdit = editSession ? {
					componentName: editSession.original.componentName,
					path: editSession.sourceInfo?.filePath || "",
					propsJson: JSON.stringify(editSession.original.props ?? {})
				} : void 0;
				chatPanelRef.current?.setSaveToCodePrompt(changes || [], sourceUrl, componentNames, capturedElementId, activePageIdRef.current || void 0, screenshotDataUrl, projectRoot, componentEdit);
			} else chatPanelRef.current?.setInputText(prompt_0);
			revealChatPanel();
		};
		$[206] = t130;
	} else t130 = $[206];
	const handleSaveToCode = t130;
	const activePageIdRef = (0, import_react.useRef)("");
	const pendingSidebarCommentRef = (0, import_react.useRef)(null);
	const commentClaudeStatus = useClaudeStatus();
	let t131;
	if ($[207] !== enableAgentsV2 || $[208] !== projectPath) {
		t131 = {
			enabled: enableAgentsV2,
			projectPath
		};
		$[207] = enableAgentsV2;
		$[208] = projectPath;
		$[209] = t131;
	} else t131 = $[209];
	const commentAgentV2 = useCommentAgentAvailability(t131);
	let t132;
	if ($[210] !== chatBackend?.chat || $[211] !== commentAgentTransport || $[212] !== commentAgentV2 || $[213] !== commentClaudeStatus || $[214] !== currentUserId || $[215] !== readOnly) {
		t132 = !readOnly && !!currentUserId && !!commentAgentTransport && (commentAgentV2.active ? commentAgentV2.ready : !!chatBackend?.chat && isClaudeSetUp(commentClaudeStatus.status) && !commentClaudeStatus.error);
		$[210] = chatBackend?.chat;
		$[211] = commentAgentTransport;
		$[212] = commentAgentV2;
		$[213] = commentClaudeStatus;
		$[214] = currentUserId;
		$[215] = readOnly;
		$[216] = t132;
	} else t132 = $[216];
	const agentAvailable = t132;
	let t133;
	if ($[217] === Symbol.for("react.memo_cache_sentinel")) {
		t133 = /* @__PURE__ */ new Map();
		$[217] = t133;
	} else t133 = $[217];
	const commentChatPanels = (0, import_react.useRef)(t133);
	let t134;
	if ($[218] !== chatBackend || $[219] !== chatMessages || $[220] !== chatPersistence) {
		t134 = async (id_11) => {
			const existing_1 = chatTabsRef.current.find((tab_8) => chatPersistence.idFor(tab_8.id) === id_11);
			const stored_0 = !existing_1 && chatBackend?.getChat ? await chatBackend.getChat(id_11) : null;
			const loaded = stored_0 ? chatTabsFromList([stored_0])[0] : void 0;
			if (loaded) setChatMessages(chatMessages, [[loaded.tab.id, loaded.messages]], "load");
			const tab_9 = existing_1 ?? loaded?.tab;
			if (!tab_9) throw new Error("Could not open the agent conversation.");
			const nextTabs = existing_1 ? chatTabsRef.current : [tab_9, ...chatTabsRef.current];
			if (!existing_1) setChatTabs(nextTabs);
			setVisibleChatIndex(nextTabs.findIndex((item_8) => item_8.id === tab_9.id));
			revealChatPanel();
			return new Promise((resolve, reject) => {
				const deadline = Date.now() + 1e4;
				const ready = () => {
					const panel_1 = commentChatPanels.current.get(tab_9.id);
					if (panel_1) resolve(panel_1);
					else if (Date.now() >= deadline) reject(/* @__PURE__ */ new Error("Could not open the agent conversation."));
					else requestAnimationFrame(ready);
				};
				requestAnimationFrame(ready);
			});
		};
		$[218] = chatBackend;
		$[219] = chatMessages;
		$[220] = chatPersistence;
		$[221] = t134;
	} else t134 = $[221];
	const openCommentAgentChat = t134;
	let t135;
	if ($[222] !== openCommentAgentChat) {
		t135 = (id_12) => {
			openCommentAgentChat(id_12).catch(_temp33);
		};
		$[222] = openCommentAgentChat;
		$[223] = t135;
	} else t135 = $[223];
	let t136;
	if ($[224] !== agentAvailable || $[225] !== commentMentionPeople || $[226] !== t135) {
		t136 = {
			people: commentMentionPeople,
			agentAvailable,
			openAgentChat: t135
		};
		$[224] = agentAvailable;
		$[225] = commentMentionPeople;
		$[226] = t135;
		$[227] = t136;
	} else t136 = $[227];
	const commentMentionContext = t136;
	let t137;
	if ($[228] !== componentIndex) {
		t137 = (target) => {
			const { elementId: elementId_1, pageId: pageId_0 } = target;
			if (pageId_0 !== activePageIdRef.current) return Promise.resolve(null);
			const viewport = viewportRef.current;
			if (!viewport) return Promise.resolve(null);
			const canvasEl_1 = canvasRef.current;
			const element_0 = elementId_1 ? getById(usePages.getState().tree, elementId_1) : void 0;
			return captureCommentContext({
				...target,
				viewport,
				canvasEl: canvasEl_1,
				element: element_0,
				elementName: element_0 ? getElementLabel(element_0) : void 0
			}, {
				isCurrentPage: () => pageId_0 === activePageIdRef.current && canvasEl_1 === canvasRef.current,
				describeLiveElement,
				captureElement: captureSaveToCodeScreenshot,
				captureRegion: (rect_1, live_0) => canvasEl_1 ? captureCanvasRegionForPrompt({
					canvasEl: canvasEl_1,
					viewportEl: viewport,
					rect: rect_1,
					store: usePages.getState().tree,
					componentIndex,
					pageId: pageId_0,
					live: live_0
				}) : null
			});
		};
		$[228] = componentIndex;
		$[229] = t137;
	} else t137 = $[229];
	let t138;
	if ($[230] !== agentAvailable || $[231] !== commentAgentTransport || $[232] !== openCommentAgentChat || $[233] !== t137) {
		t138 = {
			available: agentAvailable,
			transport: commentAgentTransport,
			openChat: openCommentAgentChat,
			capture: t137
		};
		$[230] = agentAvailable;
		$[231] = commentAgentTransport;
		$[232] = openCommentAgentChat;
		$[233] = t137;
		$[234] = t138;
	} else t138 = $[234];
	const runCommentAgent = useCommentAgent(t138);
	let t139;
	if ($[235] !== activeCommentId || $[236] !== onActiveCommentChange || $[237] !== pendingCommentPosition) {
		t139 = (canvasX, canvasY, screenX, screenY, anchor) => {
			setPendingCommentPosition(pendingCommentPosition || activeCommentId ? null : {
				canvasX,
				canvasY,
				screenX,
				screenY,
				...anchor
			});
			setActiveCommentId(null);
			onActiveCommentChange?.(null);
		};
		$[235] = activeCommentId;
		$[236] = onActiveCommentChange;
		$[237] = pendingCommentPosition;
		$[238] = t139;
	} else t139 = $[238];
	const handleCommentClick = t139;
	let t140;
	if ($[239] !== onCreateComment || $[240] !== pendingCommentPosition || $[241] !== runCommentAgent) {
		t140 = async (body, attachments, mentions) => {
			if (!pendingCommentPosition || !onCreateComment) return;
			const position_0 = viewportRef.current ? resolveCommentPosition(pendingCommentPosition, viewportRef.current) : pendingCommentPosition;
			const created = await onCreateComment({
				body,
				mentionSpans: mentions,
				elementId: position_0.elementId,
				anchorX: position_0.anchorX,
				anchorY: position_0.anchorY,
				canvasX: Math.round(position_0.canvasX),
				canvasY: Math.round(position_0.canvasY),
				pageId: activePageIdRef.current,
				...attachments?.length ? { attachments } : {}
			});
			setPendingCommentPosition(null);
			if (created && mentions?.some(_temp34)) runCommentAgent(created.id);
		};
		$[239] = onCreateComment;
		$[240] = pendingCommentPosition;
		$[241] = runCommentAgent;
		$[242] = t140;
	} else t140 = $[242];
	const handleCommentSubmit = t140;
	let t141;
	if ($[243] !== activeCommentId || $[244] !== onCreateReply || $[245] !== runCommentAgent) {
		t141 = async (body_0, attachments_0, mentions_0) => {
			if (!activeCommentId || !onCreateReply) return;
			const created_0 = await onCreateReply({
				body: body_0,
				parentId: activeCommentId,
				pageId: activePageIdRef.current,
				attachments: attachments_0,
				mentionSpans: mentions_0
			});
			if (created_0 && mentions_0?.some(_temp35)) runCommentAgent(created_0.id);
		};
		$[243] = activeCommentId;
		$[244] = onCreateReply;
		$[245] = runCommentAgent;
		$[246] = t141;
	} else t141 = $[246];
	const handleCommentReply = t141;
	let t142;
	if ($[247] !== activeCommentId || $[248] !== onActiveCommentChange) {
		t142 = (commentId) => {
			const next_10 = activeCommentId === commentId ? null : commentId;
			setActiveCommentId(next_10);
			onActiveCommentChange?.(next_10);
			setPendingCommentPosition(null);
		};
		$[247] = activeCommentId;
		$[248] = onActiveCommentChange;
		$[249] = t142;
	} else t142 = $[249];
	const handleSelectComment = t142;
	let t143;
	if ($[250] === Symbol.for("react.memo_cache_sentinel")) {
		t143 = (comment) => {
			if (comment.canvasX == null || comment.canvasY == null) return;
			const viewportElement = viewportRef.current;
			if (!viewportElement) return;
			const viewport_0 = viewportElement.getBoundingClientRect();
			const position_1 = resolveCommentPosition(comment, viewportElement);
			const camera_0 = getCamera();
			const targetX = Math.max(32, (viewport_0.width - 364) / 2);
			const targetY = viewport_0.height / 2;
			driveCamera({
				scale: camera_0.scale,
				positionX: targetX - position_1.canvasX * camera_0.scale,
				positionY: targetY - position_1.canvasY * camera_0.scale
			}, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
		};
		$[250] = t143;
	} else t143 = $[250];
	const centerSidebarComment = t143;
	let t144;
	if ($[251] !== onActiveCommentChange || $[252] !== setCommentMode) {
		t144 = () => {
			pendingSidebarCommentRef.current = null;
			setCommentMode(false);
			setPendingCommentPosition(null);
			setActiveCommentId(null);
			onActiveCommentChange?.(null);
		};
		$[251] = onActiveCommentChange;
		$[252] = setCommentMode;
		$[253] = t144;
	} else t144 = $[253];
	const handleExitCommentMode = t144;
	useActiveToolCommentMode(commentMode, handleExitCommentMode);
	useGlobalShortcut("exitCommentMode", handleExitCommentMode, commentMode);
	let t145;
	if ($[254] !== commentMode || $[255] !== setCommentMode) {
		t145 = (e_1) => {
			if (isTypingTarget(e_1)) return;
			setCommentMode(!commentMode);
		};
		$[254] = commentMode;
		$[255] = setCommentMode;
		$[256] = t145;
	} else t145 = $[256];
	useGlobalShortcut("toggleCommentMode", t145, showCommentTools);
	let t146;
	if ($[257] === Symbol.for("react.memo_cache_sentinel")) {
		t146 = {};
		$[257] = t146;
	} else t146 = $[257];
	const tabTransformsRef = (0, import_react.useRef)(t146);
	const transformSaveTimerRef = (0, import_react.useRef)(null);
	const [cameraReadyTabId, setCameraReadyTabId] = (0, import_react.useState)(null);
	const hasResolvedFirstCameraRef = (0, import_react.useRef)(false);
	const fitFrameRef = (0, import_react.useRef)(null);
	const fitGenerationRef = (0, import_react.useRef)(0);
	const fitInFlightTabIdRef = (0, import_react.useRef)(null);
	const lateRefitRef = (0, import_react.useRef)(null);
	const lateRefitTimerRef = (0, import_react.useRef)(null);
	const lateRefitUnsubRef = (0, import_react.useRef)(null);
	const [pageCamera, setPageCamera] = (0, import_react.useState)(void 0);
	let t147;
	if ($[258] === Symbol.for("react.memo_cache_sentinel")) {
		t147 = (elementId_2) => {
			useSelection.getState().select(/* @__PURE__ */ new Set([elementId_2]));
			pendingCenterRef.current = elementId_2;
			setCenterEpoch(_temp36);
		};
		$[258] = t147;
	} else t147 = $[258];
	const handleFocusElement = t147;
	let t148;
	if ($[259] !== initialPages) {
		t148 = () => {
			if (initialPages && initialPages.length > 0) return initialPages.map(_temp37);
			return [{
				id: "canvas-1",
				name: "Page 1"
			}];
		};
		$[259] = initialPages;
		$[260] = t148;
	} else t148 = $[260];
	const [pages, setPages] = (0, import_react.useState)(t148);
	let t149;
	if ($[261] !== initialPages) {
		t149 = () => resolveInitialActivePageId(initialPages);
		$[261] = initialPages;
		$[262] = t149;
	} else t149 = $[262];
	const [activeTabId, setActiveTabId] = (0, import_react.useState)(t149);
	let t150;
	let t151;
	if ($[263] !== activeTabId) {
		t150 = () => {
			setPageCamera(tabTransformsRef.current[activeTabId]);
		};
		t151 = [activeTabId];
		$[263] = activeTabId;
		$[264] = t150;
		$[265] = t151;
	} else {
		t150 = $[264];
		t151 = $[265];
	}
	(0, import_react.useLayoutEffect)(t150, t151);
	let t152;
	if ($[266] !== activeTabId || $[267] !== initialElements || $[268] !== initialPages) {
		t152 = () => ({
			activeId: activeTabId,
			...buildInitialTabs(initialPages, activeTabId, initialElements)
		});
		$[266] = activeTabId;
		$[267] = initialElements;
		$[268] = initialPages;
		$[269] = t152;
	} else t152 = $[269];
	const [initialContent] = (0, import_react.useState)(t152);
	const [tabs_0, setTabs] = (0, import_react.useState)(initialContent.tabs);
	let t153;
	if ($[270] !== activeTabId) {
		t153 = (s_4) => s_4.pages.has(activeTabId);
		$[270] = activeTabId;
		$[271] = t153;
	} else t153 = $[271];
	const activeTabLoaded = usePages(t153);
	let t154;
	if ($[272] !== initialElements || $[273] !== initialPages) {
		t154 = () => !!(initialElements || initialPages);
		$[272] = initialElements;
		$[273] = initialPages;
		$[274] = t154;
	} else t154 = $[274];
	const [pagesReady, setPagesReady] = (0, import_react.useState)(t154);
	const boundsKeyOf = _temp38;
	let t155;
	if ($[275] === Symbol.for("react.memo_cache_sentinel")) {
		t155 = (bounds_0, viewport_1) => {
			const chrome = viewportRef.current?.querySelector("[data-canvas-bottom-chrome]")?.getBoundingClientRect();
			return cameraToFitRect(bounds_0, viewport_1, { padding: {
				top: 32,
				right: 32,
				bottom: chrome && chrome.height > 0 ? Math.max(32, viewport_1.bottom - chrome.top + 16) : 32,
				left: 32
			} });
		};
		$[275] = t155;
	} else t155 = $[275];
	const fitCameraFor = t155;
	let t156;
	if ($[276] === Symbol.for("react.memo_cache_sentinel")) {
		t156 = () => {
			if (lateRefitTimerRef.current) clearInterval(lateRefitTimerRef.current);
			lateRefitTimerRef.current = null;
			lateRefitUnsubRef.current?.();
			lateRefitUnsubRef.current = null;
			lateRefitRef.current = null;
		};
		$[276] = t156;
	} else t156 = $[276];
	const cancelLateRefit = t156;
	let t157;
	if ($[277] === Symbol.for("react.memo_cache_sentinel")) {
		const lateRefitTick = (startedAt) => {
			if (!lateRefitRef.current) return cancelLateRefit();
			if (performance.now() - startedAt > LATE_REFIT_WINDOW_MS) return cancelLateRefit();
			const viewport_2 = viewportRef.current?.getBoundingClientRect();
			if (!viewport_2 || viewport_2.width < 8 || viewport_2.height < 8) return;
			if (!rootContentSettled()) return;
			const bounds_1 = measuredRootBounds();
			if (!bounds_1) return;
			const tabId_0 = lateRefitRef.current.tabId;
			const camera_1 = fitCameraFor(bounds_1, viewport_2);
			const live_1 = getCamera();
			const moved = !!camera_1 && (Math.abs(camera_1.positionX - live_1.positionX) > LATE_REFIT_MIN_DELTA || Math.abs(camera_1.positionY - live_1.positionY) > LATE_REFIT_MIN_DELTA || Math.abs(camera_1.scale - live_1.scale) > .001);
			if (camera_1 && moved) {
				tabTransformsRef.current[tabId_0] = camera_1;
				driveCamera(camera_1, LATE_REFIT_MS);
			}
			cancelLateRefit();
		};
		t157 = () => {
			if (!lateRefitRef.current || lateRefitTimerRef.current) return;
			const startedAt_0 = performance.now();
			lateRefitUnsubRef.current = subscribeUserCameraGesture(() => cancelLateRefit());
			lateRefitTimerRef.current = setInterval(() => lateRefitTick(startedAt_0), LATE_REFIT_POLL_MS);
		};
		$[277] = t157;
	} else t157 = $[277];
	const armLateRefit = t157;
	let t158;
	if ($[278] === Symbol.for("react.memo_cache_sentinel")) {
		t158 = () => {
			if (fitFrameRef.current !== null) cancelAnimationFrame(fitFrameRef.current);
			fitFrameRef.current = null;
			fitInFlightTabIdRef.current = null;
			cancelLateRefit();
		};
		$[278] = t158;
	} else t158 = $[278];
	const cancelPendingFit = t158;
	let t159;
	if ($[279] === Symbol.for("react.memo_cache_sentinel")) {
		t159 = (tabId_1) => {
			fitInFlightTabIdRef.current = null;
			hasResolvedFirstCameraRef.current = true;
			setCameraReadyTabId(tabId_1);
		};
		$[279] = t159;
	} else t159 = $[279];
	const markCameraReady = t159;
	const { listFileVersions, restoreFileVersion, saveFile } = useBackendActions();
	const { createPage, deletePage, reorderPages, saveCanvas, savePreview, loadCanvas, listCanvases, createComponent } = useCanvasPersistence();
	const activeTabIdRef = (0, import_react.useRef)(activeTabId);
	let t160;
	if ($[280] !== activeTabId) {
		t160 = () => {
			activeTabIdRef.current = activeTabId;
		};
		$[280] = activeTabId;
		$[281] = t160;
	} else t160 = $[281];
	(0, import_react.useLayoutEffect)(t160);
	let t161;
	if ($[282] === Symbol.for("react.memo_cache_sentinel")) {
		t161 = (nextId) => {
			setActiveTabId(nextId);
			activeTabIdRef.current = nextId;
			usePages.getState().activatePage(nextId);
			try {
				localStorage.setItem("petal-active-page", nextId);
			} catch {}
		};
		$[282] = t161;
	} else t161 = $[282];
	const switchTab = t161;
	let t162;
	if ($[283] !== projectPath || $[284] !== tabs_0) {
		t162 = (tabId_2) => {
			if (!tabs_0.find((t_2) => t_2.id === tabId_2)) return;
			cancelPendingFit();
			const generation = fitGenerationRef.current = fitGenerationRef.current + 1;
			fitInFlightTabIdRef.current = tabId_2;
			const restored_0 = hasResolvedFirstCameraRef.current ? tabTransformsRef.current[tabId_2] ?? readCamera(projectPath ?? "", tabId_2) : null;
			if (restored_0) {
				tabTransformsRef.current[tabId_2] = restored_0;
				driveCamera(restored_0, 0);
				markCameraReady(tabId_2);
				return;
			}
			if (getRootIds(usePages.getState().pages.get(tabId_2)?.tree ?? EMPTY_STORE).length === 0) {
				markCameraReady(tabId_2);
				return;
			}
			const deadline_0 = performance.now() + FIT_SETTLE_TIMEOUT_MS;
			let lastBoundsKey = "";
			let stableFrames = 0;
			const measureAndFit = () => {
				fitFrameRef.current = null;
				if (generation !== fitGenerationRef.current) return;
				const viewport_3 = viewportRef.current?.getBoundingClientRect();
				const bounds_2 = !!viewport_3 && viewport_3.width >= 8 && viewport_3.height >= 8 ? unionFollowRects(occupiedRootBoxes(usePages.getState().pages.get(tabId_2)?.tree ?? EMPTY_STORE)) : null;
				const boundsKey = boundsKeyOf(bounds_2);
				stableFrames = boundsKey !== "" && boundsKey === lastBoundsKey ? stableFrames + 1 : 0;
				lastBoundsKey = boundsKey;
				const settled = !!bounds_2 && rootContentSettled() && stableFrames >= FIT_STABLE_FRAMES;
				if (!settled && performance.now() < deadline_0) {
					fitFrameRef.current = requestAnimationFrame(measureAndFit);
					return;
				}
				const camera_2 = bounds_2 && viewport_3 ? fitCameraFor(bounds_2, viewport_3) : null;
				if (!settled) lateRefitRef.current = { tabId: tabId_2 };
				if (camera_2) {
					tabTransformsRef.current[tabId_2] = camera_2;
					driveCamera(camera_2, 0);
				}
				markCameraReady(tabId_2);
				armLateRefit();
			};
			fitFrameRef.current = requestAnimationFrame(measureAndFit);
		};
		$[283] = projectPath;
		$[284] = tabs_0;
		$[285] = t162;
	} else t162 = $[285];
	const resolveCameraForTab = (0, import_react.useEffectEvent)(t162);
	let t163;
	if ($[286] !== activeTabId || $[287] !== activeTabLoaded || $[288] !== cameraReadyTabId || $[289] !== elementParam || $[290] !== pagesReady || $[291] !== protoMode || $[292] !== resolveCameraForTab) {
		t163 = () => {
			if (cameraReadyTabId === activeTabId) return;
			if (protoMode) return;
			if (elementParam) return;
			if (activeTabId === "canvas-1" && !pagesReady) return;
			if (fitInFlightTabIdRef.current === activeTabId) return;
			if (!activeTabLoaded) return;
			resolveCameraForTab(activeTabId);
		};
		$[286] = activeTabId;
		$[287] = activeTabLoaded;
		$[288] = cameraReadyTabId;
		$[289] = elementParam;
		$[290] = pagesReady;
		$[291] = protoMode;
		$[292] = resolveCameraForTab;
		$[293] = t163;
	} else t163 = $[293];
	let t164;
	if ($[294] !== activeTabId || $[295] !== activeTabLoaded || $[296] !== cameraReadyTabId || $[297] !== elementParam || $[298] !== pagesReady || $[299] !== protoMode) {
		t164 = [
			activeTabLoaded,
			activeTabId,
			cameraReadyTabId,
			elementParam,
			pagesReady,
			protoMode
		];
		$[294] = activeTabId;
		$[295] = activeTabLoaded;
		$[296] = cameraReadyTabId;
		$[297] = elementParam;
		$[298] = pagesReady;
		$[299] = protoMode;
		$[300] = t164;
	} else t164 = $[300];
	(0, import_react.useEffect)(t163, t164);
	let t165;
	let t166;
	if ($[301] === Symbol.for("react.memo_cache_sentinel")) {
		t165 = () => () => {
			if (fitFrameRef.current !== null) cancelAnimationFrame(fitFrameRef.current);
			if (lateRefitTimerRef.current) clearInterval(lateRefitTimerRef.current);
			lateRefitUnsubRef.current?.();
		};
		t166 = [];
		$[301] = t165;
		$[302] = t166;
	} else {
		t165 = $[301];
		t166 = $[302];
	}
	(0, import_react.useEffect)(t165, t166);
	const canvasCameraPending = !protoMode && !elementParam && cameraReadyTabId !== activeTabId;
	const [focusedComponent, setFocusedComponent] = (0, import_react.useState)();
	let t167;
	if ($[303] !== activeTabId || $[304] !== tabs_0) {
		let t168;
		if ($[306] !== activeTabId) {
			t168 = (t_3) => t_3.id === activeTabId;
			$[306] = activeTabId;
			$[307] = t168;
		} else t168 = $[307];
		t167 = tabs_0.find(t168);
		$[303] = activeTabId;
		$[304] = tabs_0;
		$[305] = t167;
	} else t167 = $[305];
	const activeTab = t167;
	let t168;
	if ($[308] !== initialContent.activeId || $[309] !== initialContent.trees) {
		t168 = () => {
			const { setPage, activatePage, reset } = usePages.getState();
			for (const [id_13, tree] of initialContent.trees) setPage(id_13, tree);
			if (initialContent.trees.size > 0) activatePage(initialContent.activeId);
			return () => reset();
		};
		$[308] = initialContent.activeId;
		$[309] = initialContent.trees;
		$[310] = t168;
	} else t168 = $[310];
	let t169;
	if ($[311] !== initialContent) {
		t169 = [initialContent];
		$[311] = initialContent;
		$[312] = t169;
	} else t169 = $[312];
	(0, import_react.useLayoutEffect)(t168, t169);
	let t170;
	if ($[313] !== activeTabLoaded || $[314] !== onInitialCanvasReady || $[315] !== pagesReady) {
		t170 = {
			pagesReady,
			tabLoaded: activeTabLoaded,
			onReady: onInitialCanvasReady
		};
		$[313] = activeTabLoaded;
		$[314] = onInitialCanvasReady;
		$[315] = pagesReady;
		$[316] = t170;
	} else t170 = $[316];
	useInitialCanvasReady(t170);
	const activePageId = activeTab?.canvasId || activeTabId;
	let t171;
	if ($[317] === Symbol.for("react.memo_cache_sentinel")) {
		t171 = /* @__PURE__ */ new Map();
		$[317] = t171;
	} else t171 = $[317];
	const pageBackgroundByCanvasRef = (0, import_react.useRef)(t171);
	let t172;
	if ($[318] !== tabs_0) {
		t172 = () => {
			for (const tab_11 of tabs_0) if (tab_11.canvasId) pageBackgroundByCanvasRef.current.set(tab_11.canvasId, {
				color: tab_11.backgroundColor,
				token: tab_11.backgroundToken
			});
		};
		$[318] = tabs_0;
		$[319] = t172;
	} else t172 = $[319];
	(0, import_react.useLayoutEffect)(t172);
	let t173;
	if ($[320] !== activePageId) {
		t173 = () => {
			activePageIdRef.current = activePageId;
		};
		$[320] = activePageId;
		$[321] = t173;
	} else t173 = $[321];
	(0, import_react.useLayoutEffect)(t173);
	let t174;
	if ($[322] !== activePageId || $[323] !== commentsProp) {
		let t175;
		if ($[325] !== activePageId) {
			t175 = (comment_0) => !comment_0.pageId || comment_0.pageId === activePageId;
			$[325] = activePageId;
			$[326] = t175;
		} else t175 = $[326];
		t174 = commentsProp.filter(t175);
		$[322] = activePageId;
		$[323] = commentsProp;
		$[324] = t174;
	} else t174 = $[324];
	const pageComments = t174;
	let t175;
	if ($[327] !== pendingCommentPosition) {
		t175 = pendingCommentPosition ? [{
			id: "draft",
			...pendingCommentPosition
		}] : [];
		$[327] = pendingCommentPosition;
		$[328] = t175;
	} else t175 = $[328];
	const draftComments = t175;
	const centerPendingSidebarComment = (0, import_react.useEffectEvent)(centerSidebarComment);
	let t176;
	if ($[329] !== activePageId || $[330] !== activeTabId || $[331] !== cameraReadyTabId || $[332] !== centerPendingSidebarComment) {
		t176 = () => {
			const target_0 = pendingSidebarCommentRef.current;
			if (!target_0 || target_0.pageId !== activePageId || cameraReadyTabId !== activeTabId) return;
			pendingSidebarCommentRef.current = null;
			centerPendingSidebarComment(target_0);
		};
		$[329] = activePageId;
		$[330] = activeTabId;
		$[331] = cameraReadyTabId;
		$[332] = centerPendingSidebarComment;
		$[333] = t176;
	} else t176 = $[333];
	let t177;
	if ($[334] !== activePageId || $[335] !== activeTabId || $[336] !== cameraReadyTabId) {
		t177 = [
			activePageId,
			activeTabId,
			cameraReadyTabId
		];
		$[334] = activePageId;
		$[335] = activeTabId;
		$[336] = cameraReadyTabId;
		$[337] = t177;
	} else t177 = $[337];
	(0, import_react.useEffect)(t176, t177);
	let t178;
	let t179;
	if ($[338] !== activePageId || $[339] !== onActivePageChange) {
		t178 = () => {
			onActivePageChange?.(activePageId);
		};
		t179 = [activePageId, onActivePageChange];
		$[338] = activePageId;
		$[339] = onActivePageChange;
		$[340] = t178;
		$[341] = t179;
	} else {
		t178 = $[340];
		t179 = $[341];
	}
	(0, import_react.useEffect)(t178, t179);
	const copyLayersAsPng = _temp40;
	let t180;
	if ($[342] !== activePageId || $[343] !== onCopySelectionLink) {
		t180 = async (t181) => {
			const elementId_3 = t181 === void 0 ? soleSelectedElementId(getSelectedElementIds()) : t181;
			if (!elementId_3 || !onCopySelectionLink) return;
			const pageId_1 = activePageId || null;
			try {
				await onCopySelectionLink(elementId_3, pageId_1);
			} catch {
				toast.error("Failed to copy link");
			}
		};
		$[342] = activePageId;
		$[343] = onCopySelectionLink;
		$[344] = t180;
	} else t180 = $[344];
	const copySelectionLink = t180;
	let t181;
	if ($[345] !== activeTabId || $[346] !== canvasCameraPending || $[347] !== projectPath) {
		t181 = (t_4) => {
			if (canvasCameraPending) return;
			tabTransformsRef.current[activeTabId] = t_4;
			if (activeTabId === "canvas-1") return;
			if (!projectPath) return;
			if (transformSaveTimerRef.current) clearTimeout(transformSaveTimerRef.current);
			transformSaveTimerRef.current = setTimeout(() => {
				writeCamera(projectPath, activeTabId, t_4);
			}, 150);
		};
		$[345] = activeTabId;
		$[346] = canvasCameraPending;
		$[347] = projectPath;
		$[348] = t181;
	} else t181 = $[348];
	const persistCamera = (0, import_react.useEffectEvent)(t181);
	let t182;
	if ($[349] !== persistCamera) {
		t182 = () => subscribeCamera((t_5) => persistCamera(t_5));
		$[349] = persistCamera;
		$[350] = t182;
	} else t182 = $[350];
	let t183;
	if ($[351] === Symbol.for("react.memo_cache_sentinel")) {
		t183 = [];
		$[351] = t183;
	} else t183 = $[351];
	(0, import_react.useEffect)(t182, t183);
	let t184;
	let t185;
	if ($[352] === Symbol.for("react.memo_cache_sentinel")) {
		t184 = () => () => {
			if (transformSaveTimerRef.current) clearTimeout(transformSaveTimerRef.current);
		};
		t185 = [];
		$[352] = t184;
		$[353] = t185;
	} else {
		t184 = $[352];
		t185 = $[353];
	}
	(0, import_react.useEffect)(t184, t185);
	const onActivityRef = (0, import_react.useRef)(onActivity);
	let t186;
	let t187;
	if ($[354] !== onActivity) {
		t186 = () => {
			onActivityRef.current = onActivity;
		};
		t187 = [onActivity];
		$[354] = onActivity;
		$[355] = t186;
		$[356] = t187;
	} else {
		t186 = $[355];
		t187 = $[356];
	}
	(0, import_react.useEffect)(t186, t187);
	let t188;
	let t189;
	if ($[357] !== previewOpen) {
		t188 = () => {
			const trigger = previewOpenTriggerRef.current;
			previewOpenTriggerRef.current = null;
			if (previewOpen && trigger) onActivityRef.current?.({
				type: "preview_window_opened",
				trigger
			});
		};
		t189 = [previewOpen];
		$[357] = previewOpen;
		$[358] = t188;
		$[359] = t189;
	} else {
		t188 = $[358];
		t189 = $[359];
	}
	(0, import_react.useEffect)(t188, t189);
	let t190;
	if ($[360] === Symbol.for("react.memo_cache_sentinel")) {
		t190 = {
			edits: 0,
			opTypes: {},
			pageId: "",
			window: null
		};
		$[360] = t190;
	} else t190 = $[360];
	const canvasEditBatchRef = (0, import_react.useRef)(t190);
	let t191;
	if ($[361] === Symbol.for("react.memo_cache_sentinel")) {
		t191 = (pageId_2, edits, opTypes) => {
			const batch = canvasEditBatchRef.current;
			batch.pageId = pageId_2;
			if (batch.window) {
				batch.edits = batch.edits + edits;
				for (const [op, n_3] of Object.entries(opTypes)) batch.opTypes[op] = (batch.opTypes[op] ?? 0) + n_3;
				return;
			}
			onActivityRef.current?.({
				type: "canvas_edited",
				pageId: pageId_2,
				edits,
				opTypes
			});
			const closeWindow = () => {
				if (batch.edits === 0) {
					batch.window = null;
					return;
				}
				onActivityRef.current?.({
					type: "canvas_edited",
					pageId: batch.pageId,
					edits: batch.edits,
					opTypes: batch.opTypes
				});
				batch.edits = 0;
				batch.opTypes = {};
				batch.window = setTimeout(closeWindow, CANVAS_EDIT_THROTTLE_MS);
			};
			batch.window = setTimeout(closeWindow, CANVAS_EDIT_THROTTLE_MS);
		};
		$[361] = t191;
	} else t191 = $[361];
	const noteCanvasEdit = t191;
	let t192;
	let t193;
	if ($[362] === Symbol.for("react.memo_cache_sentinel")) {
		t192 = () => () => {
			const batch_0 = canvasEditBatchRef.current;
			if (batch_0.window) clearTimeout(batch_0.window);
		};
		t193 = [];
		$[362] = t192;
		$[363] = t193;
	} else {
		t192 = $[362];
		t193 = $[363];
	}
	(0, import_react.useEffect)(t192, t193);
	let t194;
	if ($[364] === Symbol.for("react.memo_cache_sentinel")) {
		t194 = /* @__PURE__ */ new Set();
		$[364] = t194;
	} else t194 = $[364];
	const populatedPageIdsRef = (0, import_react.useRef)(t194);
	const [savingComponentEditIds, setSavingComponentEditIds] = (0, import_react.useState)(_temp41);
	const [showVersionHistory, setShowVersionHistory] = (0, import_react.useState)(false);
	let t195;
	if ($[365] !== chatBackend || $[366] !== createPage || $[367] !== listCanvases || $[368] !== loadCanvas || $[369] !== pageParam) {
		t195 = async () => {
			const listResult = await listCanvases();
			if (listResult.success && listResult.canvases && listResult.canvases.length > 0) {
				const sortedCanvases = listResult.canvases;
				setPages(sortedCanvases.map(_temp42));
				for (const c_0 of sortedCanvases) if (countCanvasRoots(c_0.elements) >= POPULATED_PAGE_ROOT_COUNT) populatedPageIdsRef.current.add(c_0.id);
				let savedPage = null;
				try {
					savedPage = localStorage.getItem("petal-active-page");
				} catch {}
				const targetPageId = pageParam && sortedCanvases.some((c_2) => c_2.id === pageParam) ? pageParam : savedPage && sortedCanvases.some((c_1) => c_1.id === savedPage) ? savedPage : sortedCanvases[0].id;
				const targetElements = readCanvasElements(sortedCanvases.find((c_3) => c_3.id === targetPageId)?.elements);
				const canvasTabs = sortedCanvases.map(_temp43);
				setTabs(canvasTabs);
				usePages.getState().setPage(targetPageId, ensureV2(targetElements));
				switchTab(targetPageId);
			} else if (chatBackend && !listResult.success) console.error("[loadAllPages] Failed to list pages:", listResult.error);
			else if (chatBackend) {
				const created_1 = await createPage({
					name: "Page 1",
					sortOrder: 0,
					canvas: {
						elements: [],
						zoom: 1,
						pan: {
							x: 0,
							y: 0
						}
					}
				});
				if (created_1.success) {
					const newId_0 = String(created_1.page?.id ?? created_1.id);
					setPages([{
						id: newId_0,
						name: "Page 1",
						elementCount: 0
					}]);
					setTabs([{
						id: newId_0,
						name: "Page 1",
						canvasId: newId_0,
						canvasPath: `.petal/canvases/${newId_0}/`
					}]);
					usePages.getState().setPage(newId_0, emptyStore());
					switchTab(newId_0);
				} else console.error("[loadAllPages] Failed to create initial page:", created_1.error);
			} else {
				const result = await loadCanvas("canvas-1");
				const elements_1 = result.success && result.canvas ? readCanvasElements(result.canvas.elements) : [];
				usePages.getState().setPage("canvas-1", ensureV2(elements_1));
				usePages.getState().activatePage("canvas-1");
			}
		};
		$[365] = chatBackend;
		$[366] = createPage;
		$[367] = listCanvases;
		$[368] = loadCanvas;
		$[369] = pageParam;
		$[370] = t195;
	} else t195 = $[370];
	const loadAllPages = (0, import_react.useEffectEvent)(t195);
	const pagesLoadRef = (0, import_react.useRef)(null);
	let t196;
	if ($[371] !== initialElements || $[372] !== initialPages || $[373] !== loadAllPages) {
		t196 = () => {
			if (initialElements || initialPages) return;
			if (!pagesLoadRef.current) pagesLoadRef.current = loadAllPages().finally(() => {
				pagesLoadRef.current = null;
			});
			pagesLoadRef.current.then(() => setPagesReady(true));
		};
		$[371] = initialElements;
		$[372] = initialPages;
		$[373] = loadAllPages;
		$[374] = t196;
	} else t196 = $[374];
	let t197;
	if ($[375] !== initialElements || $[376] !== initialPages) {
		t197 = [initialElements, initialPages];
		$[375] = initialElements;
		$[376] = initialPages;
		$[377] = t197;
	} else t197 = $[377];
	(0, import_react.useEffect)(t196, t197);
	const [isPageLoading, setIsPageLoading] = (0, import_react.useState)(false);
	const pageLoadIdRef = (0, import_react.useRef)(0);
	let t198;
	if ($[378] !== activeTabLoaded) {
		t198 = {
			activeLoaded: activeTabLoaded,
			isLoaded: _temp44
		};
		$[378] = activeTabLoaded;
		$[379] = t198;
	} else t198 = $[379];
	const loadedPageForRecovery = useLoadedPageRecovery(tabs_0, activeTabId, t198);
	let t199;
	if ($[380] !== activePageId || $[381] !== activeTabId || $[382] !== loadCanvas || $[383] !== loadedPageForRecovery || $[384] !== onActiveCommentChange || $[385] !== onEnsureComponentNames) {
		t199 = async (pageId_3) => {
			if (pageId_3 === activePageId && usePages.getState().pages.has(pageId_3)) return;
			const previousPageId = activeTabId;
			const loadId = pageLoadIdRef.current = pageLoadIdRef.current + 1;
			pendingSidebarCommentRef.current = null;
			setPendingCommentPosition(null);
			setActiveCommentId(null);
			onActiveCommentChange?.(null);
			switchTab(pageId_3);
			const loadedTree = usePages.getState().pages.get(pageId_3)?.tree;
			if (loadedTree) {
				setIsPageLoading(false);
				onEnsureComponentNames?.(liveCanvasComponentNames(loadedTree));
				return;
			}
			setIsPageLoading(true);
			return loadSelectedPage({
				load: () => loadCanvas(pageId_3),
				isCurrent: () => loadId === pageLoadIdRef.current,
				apply: (newElements) => {
					const newStore = ensureV2(newElements);
					usePages.getState().setPage(pageId_3, newStore);
					onEnsureComponentNames?.(liveCanvasComponentNames(newStore));
				},
				recover: (error_3) => {
					const restoredPageId = loadedPageForRecovery(previousPageId) ?? previousPageId;
					switchTab(restoredPageId);
					toast.error("Could not open page", { description: error_3 instanceof Error ? error_3.message : "Try opening it again." });
				},
				finish: () => setIsPageLoading(false)
			});
		};
		$[380] = activePageId;
		$[381] = activeTabId;
		$[382] = loadCanvas;
		$[383] = loadedPageForRecovery;
		$[384] = onActiveCommentChange;
		$[385] = onEnsureComponentNames;
		$[386] = t199;
	} else t199 = $[386];
	const handleSelectPage = t199;
	const selectPageFromUrl = (0, import_react.useEffectEvent)(handleSelectPage);
	let t200;
	if ($[387] !== handleSelectPage || $[388] !== onActiveCommentChange || $[389] !== onShowResolvedChange) {
		t200 = (comment_1) => {
			pendingSidebarCommentRef.current = null;
			const switchingPage = comment_1.pageId && comment_1.pageId !== activePageIdRef.current;
			if (switchingPage) {
				handleSelectPage(comment_1.pageId);
				pendingSidebarCommentRef.current = comment_1;
			}
			setPendingCommentPosition(null);
			setActiveCommentId(comment_1.id);
			onActiveCommentChange?.(comment_1.id);
			if (comment_1.resolved) onShowResolvedChange?.(true);
			if (!switchingPage) centerSidebarComment(comment_1);
		};
		$[387] = handleSelectPage;
		$[388] = onActiveCommentChange;
		$[389] = onShowResolvedChange;
		$[390] = t200;
	} else t200 = $[390];
	const handleSidebarCommentSelect = t200;
	let t201;
	if ($[391] !== createPage || $[392] !== pages.length) {
		t201 = async () => {
			const newName = `Page ${pages.length + 1}`;
			const result_0 = await createPage({
				name: newName,
				sortOrder: pages.length,
				canvas: {
					elements: [],
					zoom: 1,
					pan: {
						x: 0,
						y: 0
					}
				}
			});
			if (!result_0.success) {
				console.error("[CreatePage] Failed:", result_0.error);
				return;
			}
			const newId_1 = String(result_0.page?.id ?? result_0.id);
			const newPage = {
				id: newId_1,
				name: newName,
				elementCount: 0
			};
			setPages((prev_12) => [...prev_12, newPage]);
			setTabs((prev_13) => [...prev_13, {
				id: newId_1,
				name: newName,
				canvasId: newId_1,
				canvasPath: `.petal/canvases/${newId_1}/`
			}]);
			usePages.getState().setPage(newId_1, emptyStore());
			switchTab(newId_1);
		};
		$[391] = createPage;
		$[392] = pages.length;
		$[393] = t201;
	} else t201 = $[393];
	const handleCreatePage = t201;
	let t202;
	if ($[394] !== createPage || $[395] !== pages.length) {
		t202 = async (name_5) => {
			const result_1 = await createPage({
				name: name_5,
				sortOrder: pages.length,
				canvas: {
					elements: [],
					zoom: 1,
					pan: {
						x: 0,
						y: 0
					}
				}
			});
			if (!result_1.success) return {
				success: false,
				error: result_1.error || "Failed to create page"
			};
			const newId_2 = String(result_1.page?.id ?? result_1.id);
			setPages((prev_14) => [...prev_14, {
				id: newId_2,
				name: name_5,
				elementCount: 0
			}]);
			setTabs((prev_15) => [...prev_15, {
				id: newId_2,
				name: name_5,
				canvasId: newId_2,
				canvasPath: `.petal/canvases/${newId_2}/`
			}]);
			usePages.getState().setPage(newId_2, emptyStore());
			switchTab(newId_2);
			return {
				success: true,
				id: newId_2,
				name: name_5
			};
		};
		$[394] = createPage;
		$[395] = pages.length;
		$[396] = t202;
	} else t202 = $[396];
	const createCanvasPage = t202;
	let t203;
	if ($[397] !== loadCanvas || $[398] !== saveCanvas || $[399] !== tabs_0) {
		t203 = async (pageId_4, newName_0) => {
			setPages((prev_16) => prev_16.map((p_0) => p_0.id === pageId_4 ? {
				...p_0,
				name: newName_0
			} : p_0));
			setTabs((prev_17) => prev_17.map((tab_12) => tab_12.canvasId === pageId_4 ? {
				...tab_12,
				name: newName_0
			} : tab_12));
			const canvasTab = tabs_0.find((t_6) => t_6.canvasId === pageId_4);
			if (!canvasTab) return;
			let elementsStore = usePages.getState().pages.get(canvasTab.id)?.tree;
			if (!elementsStore) {
				const stored_1 = await loadCanvas(pageId_4);
				if (!stored_1.success || !stored_1.canvas) {
					toast.error("Couldn't save the page name.", { id: "canvas-save-error" });
					return;
				}
				elementsStore = ensureV2(readCanvasElements(stored_1.canvas.elements));
			}
			await saveCanvas({
				id: pageId_4,
				name: newName_0,
				elements: toWire(elementsStore),
				backgroundColor: canvasTab.backgroundColor,
				backgroundToken: canvasTab.backgroundToken
			});
		};
		$[397] = loadCanvas;
		$[398] = saveCanvas;
		$[399] = tabs_0;
		$[400] = t203;
	} else t203 = $[400];
	const handleRenamePage = t203;
	const pageBackgroundSaveRef = (0, import_react.useRef)(null);
	let t204;
	if ($[401] !== activePageId || $[402] !== pages || $[403] !== readOnly || $[404] !== saveCanvas || $[405] !== tabs_0) {
		t204 = (color, token) => {
			if (readOnly) return;
			const tab_13 = tabs_0.find((t_7) => t_7.canvasId === activePageId);
			const tree_0 = tab_13 && usePages.getState().pages.get(tab_13.id)?.tree;
			if (!tab_13?.canvasId || !tree_0) return;
			pageBackgroundByCanvasRef.current.set(tab_13.canvasId, {
				color,
				token
			});
			setTabs((prev_18) => prev_18.map((t_8) => t_8.canvasId === tab_13.canvasId ? {
				...t_8,
				backgroundColor: color,
				backgroundToken: token
			} : t_8));
			if (pageBackgroundSaveRef.current) clearTimeout(pageBackgroundSaveRef.current);
			const rootCount = getRootIds(tree_0).length;
			const previousElementCount = pages.find((p_1) => p_1.id === tab_13.canvasId)?.elementCount ?? 0;
			if (rootCount === 0 && previousElementCount > 0) {
				console.warn("[PageBackground] Skipping save: would overwrite", previousElementCount, "elements with empty store");
				return;
			}
			const tabId_3 = tab_13.id;
			pageBackgroundSaveRef.current = setTimeout(async () => {
				pageBackgroundSaveRef.current = null;
				const elementsStore_0 = usePages.getState().pages.get(tabId_3)?.tree;
				if (!elementsStore_0) return;
				if ((await saveCanvas({
					id: tab_13.canvasId,
					name: tab_13.name,
					elements: toWire(elementsStore_0),
					zoom: activePageIdRef.current === tab_13.canvasId ? getCamera().scale : void 0,
					backgroundColor: color,
					backgroundToken: token
				})).success) toast.dismiss("canvas-save-error");
				else toast.error("Failed to save page background. Will retry on the next change.", {
					id: "canvas-save-error",
					duration: Infinity
				});
			}, 500);
		};
		$[401] = activePageId;
		$[402] = pages;
		$[403] = readOnly;
		$[404] = saveCanvas;
		$[405] = tabs_0;
		$[406] = t204;
	} else t204 = $[406];
	const handleSetPageBackground = t204;
	let t205;
	let t206;
	if ($[407] === Symbol.for("react.memo_cache_sentinel")) {
		t205 = () => () => {
			if (pageBackgroundSaveRef.current) clearTimeout(pageBackgroundSaveRef.current);
		};
		t206 = [];
		$[407] = t205;
		$[408] = t206;
	} else {
		t205 = $[407];
		t206 = $[408];
	}
	(0, import_react.useEffect)(t205, t206);
	let t207;
	if ($[409] !== activePageId || $[410] !== deletePage || $[411] !== handleSelectPage || $[412] !== pages) {
		t207 = async (pageId_5) => {
			if (pages.length <= 1) return;
			const newPages = pages.filter((p_2) => p_2.id !== pageId_5);
			setPages(newPages);
			setTabs((prev_19) => prev_19.filter((t_9) => t_9.canvasId !== pageId_5));
			if (pageId_5 === activePageId) {
				const nextPage = newPages[0];
				if (nextPage) handleSelectPage(nextPage.id);
			}
			usePages.getState().removePage(pageId_5);
			deletePage(pageId_5).catch(_temp45);
		};
		$[409] = activePageId;
		$[410] = deletePage;
		$[411] = handleSelectPage;
		$[412] = pages;
		$[413] = t207;
	} else t207 = $[413];
	const handleDeletePage = t207;
	let t208;
	if ($[414] !== reorderPages) {
		t208 = (reorderedPages) => {
			setPages(reorderedPages);
			const order = reorderedPages.map(_temp46);
			reorderPages(order).catch(_temp47);
		};
		$[414] = reorderPages;
		$[415] = t208;
	} else t208 = $[415];
	const handleReorderPages = t208;
	let t209;
	if ($[416] !== activePageId || $[417] !== elementParam || $[418] !== pageParam || $[419] !== pages || $[420] !== pagesReady || $[421] !== selectPageFromUrl) {
		t209 = () => {
			if (hasHandledShareLinkRef.current) return;
			if (!elementParam) return;
			if (!pagesReady) return;
			if (pageParam && pageParam !== activePageId) {
				if (pages.some((p_4) => p_4.id === pageParam)) {
					hasHandledShareLinkRef.current = true;
					selectPageFromUrl(pageParam);
					return;
				}
			}
			hasHandledShareLinkRef.current = true;
		};
		$[416] = activePageId;
		$[417] = elementParam;
		$[418] = pageParam;
		$[419] = pages;
		$[420] = pagesReady;
		$[421] = selectPageFromUrl;
		$[422] = t209;
	} else t209 = $[422];
	let t210;
	if ($[423] !== activePageId || $[424] !== elementParam || $[425] !== pageParam || $[426] !== pages || $[427] !== pagesReady) {
		t210 = [
			elementParam,
			pageParam,
			activePageId,
			pages,
			pagesReady
		];
		$[423] = activePageId;
		$[424] = elementParam;
		$[425] = pageParam;
		$[426] = pages;
		$[427] = pagesReady;
		$[428] = t210;
	} else t210 = $[428];
	(0, import_react.useEffect)(t209, t210);
	const hasHandledCommentLinkRef = (0, import_react.useRef)(false);
	let t211;
	if ($[429] !== activePageId || $[430] !== commentParam || $[431] !== onActiveCommentChange || $[432] !== pageParam || $[433] !== pages || $[434] !== pagesReady || $[435] !== selectPageFromUrl) {
		t211 = () => {
			if (hasHandledCommentLinkRef.current) return;
			if (!commentParam) return;
			if (!pagesReady) return;
			if (pageParam && pageParam !== activePageId) {
				if (pages.some((p_5) => p_5.id === pageParam)) {
					hasHandledCommentLinkRef.current = true;
					selectPageFromUrl(pageParam).then(() => {
						onActiveCommentChange?.(commentParam);
					});
					return;
				}
			}
			hasHandledCommentLinkRef.current = true;
			onActiveCommentChange?.(commentParam);
		};
		$[429] = activePageId;
		$[430] = commentParam;
		$[431] = onActiveCommentChange;
		$[432] = pageParam;
		$[433] = pages;
		$[434] = pagesReady;
		$[435] = selectPageFromUrl;
		$[436] = t211;
	} else t211 = $[436];
	let t212;
	if ($[437] !== activePageId || $[438] !== commentParam || $[439] !== onActiveCommentChange || $[440] !== pageParam || $[441] !== pages || $[442] !== pagesReady) {
		t212 = [
			commentParam,
			pageParam,
			activePageId,
			pages,
			pagesReady,
			onActiveCommentChange
		];
		$[437] = activePageId;
		$[438] = commentParam;
		$[439] = onActiveCommentChange;
		$[440] = pageParam;
		$[441] = pages;
		$[442] = pagesReady;
		$[443] = t212;
	} else t212 = $[443];
	(0, import_react.useEffect)(t211, t212);
	let t213;
	if ($[444] !== activeTabId) {
		t213 = () => {
			const targetId_2 = pendingCenterRef.current;
			if (!targetId_2) return;
			const targetStore = usePages.getState().tree;
			const target_1 = getById(targetStore, targetId_2);
			const canvasPos = target_1 ? findAncestorCanvasPos(targetStore, targetId_2) : null;
			if (!target_1 || !canvasPos) return;
			pendingCenterRef.current = null;
			const viewportRect = viewportRef.current?.getBoundingClientRect();
			const viewportWidth = viewportRect?.width || window.innerWidth - 520;
			let viewportHeight = viewportRect?.height || window.innerHeight - 120;
			if (viewportHeight > 1500) viewportHeight = window.innerHeight - 120;
			const rect_2 = getCanvasSpaceRect(targetId_2);
			const scale = rect_2 ? getCamera().scale || 1 : 1;
			const camera_3 = cameraToCenterOnPoint(canvasPos, elementFallbackSize(target_1), {
				width: viewportWidth,
				height: viewportHeight
			}, rect_2, scale);
			tabTransformsRef.current[activeTabId] = camera_3;
			driveCamera(camera_3, 0);
		};
		$[444] = activeTabId;
		$[445] = t213;
	} else t213 = $[445];
	let t214;
	if ($[446] !== activeTabId || $[447] !== centerEpoch || $[448] !== tabs_0) {
		t214 = [
			tabs_0,
			activeTabId,
			centerEpoch
		];
		$[446] = activeTabId;
		$[447] = centerEpoch;
		$[448] = tabs_0;
		$[449] = t214;
	} else t214 = $[449];
	(0, import_react.useLayoutEffect)(t213, t214);
	let t215;
	if ($[450] !== elementParam) {
		t215 = (s_5) => elementParam ? s_5.visibleTree.byId.get(elementParam) : void 0;
		$[450] = elementParam;
		$[451] = t215;
	} else t215 = $[451];
	const urlCenterTarget = usePages(t215);
	let t216;
	if ($[452] !== elementParam) {
		t216 = (s_6) => {
			const pos = elementParam ? findAncestorCanvasPos(s_6.visibleTree, elementParam) : null;
			return pos ? [pos.x, pos.y] : null;
		};
		$[452] = elementParam;
		$[453] = t216;
	} else t216 = $[453];
	const urlCenterPos = usePages(useShallow(t216));
	let t217;
	if ($[454] !== urlCenterPos || $[455] !== urlCenterTarget) {
		t217 = urlCenterTarget && urlCenterPos ? cameraToCenterOnPoint({
			x: urlCenterPos[0],
			y: urlCenterPos[1]
		}, elementFallbackSize(urlCenterTarget), {
			width: typeof window === "undefined" ? 1200 : window.innerWidth - 520,
			height: typeof window === "undefined" ? 800 : Math.min(window.innerHeight - 120, 1500)
		}, null, 1) : void 0;
		$[454] = urlCenterPos;
		$[455] = urlCenterTarget;
		$[456] = t217;
	} else t217 = $[456];
	const urlCenterCamera = t217;
	const mergedComponentIndex = componentIndex;
	let t218;
	if ($[457] !== mergedComponentIndex || $[458] !== openFileInBottomBar) {
		t218 = (componentName_0, filePath_2) => {
			const resolvedPath = filePath_2 ?? mergedComponentIndex[componentName_0]?.path;
			if (!resolvedPath) return;
			setChromeHidden(false);
			setBottomBarRevealSignal(_temp48);
			setFocusedComponent({
				name: componentName_0,
				filePath: resolvedPath
			});
			openFileInBottomBar(resolvedPath, { componentName: componentName_0 });
		};
		$[457] = mergedComponentIndex;
		$[458] = openFileInBottomBar;
		$[459] = t218;
	} else t218 = $[459];
	const openComponentFile = t218;
	let t219;
	if ($[460] !== mergedComponentIndex) {
		t219 = () => {
			const existingPaths = /* @__PURE__ */ new Set([...Object.values(mergedComponentIndex).map(_temp49), ...openCodeFilesRef.current.map(_temp50)]);
			let suffix = 1;
			let componentName_1 = "NewComponent";
			let filePath_3 = `components/${componentName_1}.tsx`;
			while (existingPaths.has(filePath_3)) {
				suffix = suffix + 1;
				componentName_1 = `NewComponent${suffix}`;
				filePath_3 = `components/${componentName_1}.tsx`;
			}
			const content_4 = `export function ${componentName_1}() {\n  return <div />\n}\n`;
			setChromeHidden(false);
			setBottomBarRevealSignal(_temp51);
			setOpenCodeFiles((files_0) => [...files_0, {
				path: filePath_3,
				content: content_4,
				componentName: componentName_1
			}]);
			fileOpenCountRef.current = fileOpenCountRef.current + 1;
			setFileOpenSignal({
				path: filePath_3,
				n: fileOpenCountRef.current
			});
		};
		$[460] = mergedComponentIndex;
		$[461] = t219;
	} else t219 = $[461];
	const openNewComponentFile = t219;
	const { onFontsRemoved } = useFontEnvironment();
	let t220;
	let t221;
	if ($[462] !== onFontsRemoved) {
		t220 = () => onFontsRemoved?.(_temp52);
		t221 = [onFontsRemoved];
		$[462] = onFontsRemoved;
		$[463] = t220;
		$[464] = t221;
	} else {
		t220 = $[463];
		t221 = $[464];
	}
	(0, import_react.useEffect)(t220, t221);
	let t222;
	if ($[465] === Symbol.for("react.memo_cache_sentinel")) {
		t222 = [];
		$[465] = t222;
	} else t222 = $[465];
	(0, import_react.useEffect)(_temp54, t222);
	let t223;
	if ($[466] === Symbol.for("react.memo_cache_sentinel")) {
		t223 = (targetIds, t224) => {
			const padding = t224 === void 0 ? "viewport" : t224;
			const store = usePages.getState().visibleTree;
			const union = unionFollowRects(outermostChatWorkIds(store, targetIds).flatMap((id_16) => {
				const el_0 = getById(store, id_16);
				const rect_3 = followRectForTarget({
					measured: getCanvasSpaceRect(id_16),
					canvasX: el_0?.canvasPosition?.x,
					canvasY: el_0?.canvasPosition?.y,
					styleWidth: typeof el_0?.styles?.width === "number" ? el_0.styles.width : void 0,
					styleHeight: typeof el_0?.styles?.height === "number" ? el_0.styles.height : void 0
				});
				return rect_3 ? [rect_3] : [];
			}));
			if (!union) return false;
			const viewport_4 = viewportRef.current?.getBoundingClientRect();
			if (!viewport_4 || viewport_4.width < 8 || viewport_4.height < 8) return false;
			const next_11 = cameraToFitFollowRect(union, {
				width: viewport_4.width,
				height: viewport_4.height
			}, getCamera(), padding === "fixed" ? 60 : {
				x: viewport_4.width * .1,
				y: viewport_4.height * .1
			});
			if (next_11) driveCamera(next_11, FOLLOW_AI_CAMERA_MS);
			return true;
		};
		$[466] = t223;
	} else t223 = $[466];
	const fitCanvasTargets = (0, import_react.useEffectEvent)(t223);
	let t224;
	if ($[467] !== agentWriteOwners || $[468] !== chatTabs || $[469] !== componentIndex || $[470] !== fitCanvasTargets || $[471] !== followAi || $[472] !== visibleChatIndex) {
		t224 = () => {
			if (!followAi) return;
			const activeChat = chatTabs[visibleChatIndex];
			if (!activeChat) return;
			const store_0 = usePages.getState().visibleTree;
			let targetIds_0 = followTargetIds(store_0, agentWriteOwners, activeChat.id, getAiCopyTargets(activeChat.id));
			if (targetIds_0.length === 0) {
				const write = getAiWriteTarget();
				if (write?.chatId === activeChat.id) targetIds_0 = instanceIdsForComponentNames(store_0, componentNamesForWritePath(write.path, componentIndex));
			}
			fitCanvasTargets(targetIds_0);
		};
		$[467] = agentWriteOwners;
		$[468] = chatTabs;
		$[469] = componentIndex;
		$[470] = fitCanvasTargets;
		$[471] = followAi;
		$[472] = visibleChatIndex;
		$[473] = t224;
	} else t224 = $[473];
	const fitToFollowAi = (0, import_react.useEffectEvent)(t224);
	let t225;
	if ($[474] === Symbol.for("react.memo_cache_sentinel")) {
		t225 = () => persistFollowAi(false);
		$[474] = t225;
	} else t225 = $[474];
	const turnOffFollowAi = (0, import_react.useEffectEvent)(t225);
	let t226;
	if ($[475] !== turnOffFollowAi) {
		t226 = () => subscribeUserCameraGesture(() => turnOffFollowAi());
		$[475] = turnOffFollowAi;
		$[476] = t226;
	} else t226 = $[476];
	let t227;
	if ($[477] === Symbol.for("react.memo_cache_sentinel")) {
		t227 = [];
		$[477] = t227;
	} else t227 = $[477];
	(0, import_react.useEffect)(t226, t227);
	const followedChatId = chatTabs[visibleChatIndex]?.id;
	let t228;
	if ($[478] !== followAi || $[479] !== followedChatId || $[480] !== runningChatIds) {
		t228 = followAi && !!followedChatId && runningChatIds.has(followedChatId);
		$[478] = followAi;
		$[479] = followedChatId;
		$[480] = runningChatIds;
		$[481] = t228;
	} else t228 = $[481];
	const followingAi = t228;
	let t229;
	if ($[482] !== fitToFollowAi || $[483] !== followingAi) {
		t229 = () => {
			if (!followingAi) return;
			fitToFollowAi();
			const intervalId = window.setInterval(fitToFollowAi, FOLLOW_AI_TICK_MS);
			return () => window.clearInterval(intervalId);
		};
		$[482] = fitToFollowAi;
		$[483] = followingAi;
		$[484] = t229;
	} else t229 = $[484];
	let t230;
	if ($[485] !== followedChatId || $[486] !== followingAi) {
		t230 = [followingAi, followedChatId];
		$[485] = followedChatId;
		$[486] = followingAi;
		$[487] = t230;
	} else t230 = $[487];
	(0, import_react.useEffect)(t229, t230);
	const handleFocusLastChatResult = (chatId_8) => {
		persistFollowAi(false);
		const chat_0 = chatTabs.find((tab_14) => tab_14.id === chatId_8);
		const orderedTabs = [...tabs_0.filter((tab_15) => tab_15.id === activeTabId), ...tabs_0.filter((tab_16) => tab_16.id !== activeTabId)];
		const findTarget = agentsV2.active && agentsV2.bridge && projectPath ? lastAgentWorkTarget : lastChatWorkTarget;
		const target_2 = chat_0 && findTarget(getChatMessages(chatMessages, chat_0.id), orderedTabs, componentIndex, _temp55);
		if (!target_2) {
			toast.info("No canvas result to show");
			return;
		}
		pendingCenterRef.current = null;
		setPendingChatWorkTarget(target_2);
		if (target_2.tabId !== activeTabId) handleSelectPage(target_2.tabId);
	};
	let t231;
	if ($[488] !== activeTabId || $[489] !== activeTabLoaded || $[490] !== fitCanvasTargets || $[491] !== pendingChatWorkTarget) {
		t231 = () => {
			if (!pendingChatWorkTarget || pendingChatWorkTarget.tabId !== activeTabId || !activeTabLoaded) return;
			let frame = requestAnimationFrame(() => {
				frame = requestAnimationFrame(() => {
					fitCanvasTargets(pendingChatWorkTarget.elementIds, "fixed");
					setPendingChatWorkTarget(null);
				});
			});
			return () => cancelAnimationFrame(frame);
		};
		$[488] = activeTabId;
		$[489] = activeTabLoaded;
		$[490] = fitCanvasTargets;
		$[491] = pendingChatWorkTarget;
		$[492] = t231;
	} else t231 = $[492];
	let t232;
	if ($[493] !== activeTabId || $[494] !== activeTabLoaded || $[495] !== pendingChatWorkTarget) {
		t232 = [
			pendingChatWorkTarget,
			activeTabId,
			activeTabLoaded
		];
		$[493] = activeTabId;
		$[494] = activeTabLoaded;
		$[495] = pendingChatWorkTarget;
		$[496] = t232;
	} else t232 = $[496];
	(0, import_react.useEffect)(t231, t232);
	const reconciledTabRef = (0, import_react.useRef)(null);
	let t233;
	let t234;
	if ($[497] !== activeTabId) {
		t233 = () => {
			if (reconciledTabRef.current === activeTabId) return;
			reconciledTabRef.current = activeTabId;
			for (const session of findEditSessionsInStore(usePages.getState().tree)) {
				stashComponentEditSession(session);
				ensureLog(session.containerId);
			}
		};
		t234 = [activeTabId];
		$[497] = activeTabId;
		$[498] = t233;
		$[499] = t234;
	} else {
		t233 = $[498];
		t234 = $[499];
	}
	(0, import_react.useEffect)(t233, t234);
	const [focusedComponentEditSession, setFocusedComponentEditSession] = (0, import_react.useState)(null);
	let t235;
	if ($[500] !== agentPresence) {
		t235 = (rootIds, agent, kind) => agentPresence.touch(rootIds, agent, kind);
		$[500] = agentPresence;
		$[501] = t235;
	} else t235 = $[501];
	let t236;
	if ($[502] !== activeTabId || $[503] !== componentIndex || $[504] !== createCanvasPage || $[505] !== iconLibraries || $[506] !== projectPath || $[507] !== t235 || $[508] !== tabs_0) {
		t236 = {
			projectId: projectPath,
			tabs: tabs_0,
			activeTabId,
			iconLibraries,
			componentIndex,
			activeTabIdRef,
			touchAgentPresence: t235,
			createCanvasPage
		};
		$[502] = activeTabId;
		$[503] = componentIndex;
		$[504] = createCanvasPage;
		$[505] = iconLibraries;
		$[506] = projectPath;
		$[507] = t235;
		$[508] = tabs_0;
		$[509] = t236;
	} else t236 = $[509];
	const canvasToolDeps = t236;
	let t237;
	if ($[510] !== onOpenProjectSettings) {
		t237 = onOpenProjectSettings ? () => onOpenProjectSettings("ai") : void 0;
		$[510] = onOpenProjectSettings;
		$[511] = t237;
	} else t237 = $[511];
	let t238;
	if ($[512] !== chatMessages) {
		t238 = (id_17) => getChatMessages(chatMessages, id_17);
		$[512] = chatMessages;
		$[513] = t238;
	} else t238 = $[513];
	let t239;
	if ($[514] !== chatMessages) {
		t239 = (chatId_9, messages_1) => setChatMessages(chatMessages, [[chatId_9, messages_1]]);
		$[514] = chatMessages;
		$[515] = t239;
	} else t239 = $[515];
	let t240;
	if ($[516] !== agentPresence) {
		t240 = (chatId_10) => agentPresence.clearChat(chatId_10);
		$[516] = agentPresence;
		$[517] = t240;
	} else t240 = $[517];
	let t241;
	if ($[518] !== activeTab || $[519] !== effectiveAllowedPaths || $[520] !== effectiveOnAdd || $[521] !== enableAgentsV2 || $[522] !== focusedComponent || $[523] !== onClearAllowedPaths || $[524] !== onRemoveAllowedPath || $[525] !== projectPath || $[526] !== t237 || $[527] !== t238 || $[528] !== t239 || $[529] !== t240) {
		t241 = {
			enabled: enableAgentsV2,
			projectPath,
			allowedPaths: effectiveAllowedPaths,
			onAddAllowedPath: effectiveOnAdd,
			onRemoveAllowedPath,
			onClearAllowedPaths,
			onOpenSettings: t237,
			setChatTabs,
			chatTabsRef,
			getMessages: t238,
			pendingChatTitles,
			requestedChatTitles,
			handleChatStreamStart,
			handleChatStreamFinish,
			saveChatMessages: t239,
			clearAgentPresence: t240,
			activeTab,
			focusedComponent
		};
		$[518] = activeTab;
		$[519] = effectiveAllowedPaths;
		$[520] = effectiveOnAdd;
		$[521] = enableAgentsV2;
		$[522] = focusedComponent;
		$[523] = onClearAllowedPaths;
		$[524] = onRemoveAllowedPath;
		$[525] = projectPath;
		$[526] = t237;
		$[527] = t238;
		$[528] = t239;
		$[529] = t240;
		$[530] = t241;
	} else t241 = $[530];
	const agentsV2 = useAgentsV2Chat(t241);
	let t242;
	if ($[531] !== chatMessages) {
		t242 = (id_18) => getChatMessages(chatMessages, id_18);
		$[531] = chatMessages;
		$[532] = t242;
	} else t242 = $[532];
	const t243 = chatTabs[visibleChatIndex]?.id;
	let t244;
	if ($[533] !== tabs_0) {
		t244 = () => {
			const loaded_0 = usePages.getState().pages;
			return tabs_0.map((tab_17) => ({
				...tab_17,
				store: loaded_0.get(tab_17.id)?.tree ?? EMPTY_STORE,
				loaded: loaded_0.has(tab_17.id)
			}));
		};
		$[533] = tabs_0;
		$[534] = t244;
	} else t244 = $[534];
	const t245 = !pagesReady || isPageLoading;
	let t246;
	if ($[535] !== handleSelectPage) {
		t246 = async (id_19) => {
			if (await handleSelectPage(id_19) === false) throw new Error(`Could not load page ${id_19}. Previous page restored.`);
		};
		$[535] = handleSelectPage;
		$[536] = t246;
	} else t246 = $[536];
	let t247;
	if ($[537] !== activeTab) {
		t247 = activeTab ? { activePage: {
			id: activeTab.canvasId || activeTab.id,
			name: activeTab.name
		} } : {};
		$[537] = activeTab;
		$[538] = t247;
	} else t247 = $[538];
	let t248;
	if ($[539] !== focusedComponent) {
		t248 = focusedComponent?.name ? { focusedComponent: focusedComponent.name } : {};
		$[539] = focusedComponent;
		$[540] = t248;
	} else t248 = $[540];
	let t249;
	if ($[541] !== t247 || $[542] !== t248) {
		t249 = {
			...t247,
			...t248
		};
		$[541] = t247;
		$[542] = t248;
		$[543] = t249;
	} else t249 = $[543];
	let t250;
	if ($[544] !== handleSwitchChat) {
		t250 = (id_20) => {
			setChromeHidden(false);
			handleSwitchChat(id_20);
			revealChatPanel();
		};
		$[544] = handleSwitchChat;
		$[545] = t250;
	} else t250 = $[545];
	let t251;
	if ($[546] !== agentsV2 || $[547] !== chatMessages) {
		t251 = (id_21) => agentsV2.buildHost(id_21, getChatMessages(chatMessages, id_21));
		$[546] = agentsV2;
		$[547] = chatMessages;
		$[548] = t251;
	} else t251 = $[548];
	let t252;
	if ($[549] !== mergedComponentIndex) {
		t252 = async (rect_4) => {
			if (rect_4.page_id && rect_4.page_id !== activePageIdRef.current) throw new Error("Region capture requires the active page. Switch to the requested page first.");
			if (!canvasRef.current || !viewportRef.current) throw new Error("Canvas is unavailable.");
			const pageId_6 = activePageIdRef.current;
			const captured_0 = captureCanvasRegionForPrompt({
				canvasEl: canvasRef.current,
				viewportEl: viewportRef.current,
				rect: rect_4,
				store: getTree(),
				componentIndex: mergedComponentIndex,
				pageId: pageId_6 || void 0
			});
			if (!captured_0) throw new Error("Could not capture that area.");
			const data = await captured_0.screenshot;
			if (activePageIdRef.current !== pageId_6) throw new Error("Page changed during capture. Capture chat_context again.");
			return {
				type: "image",
				id: `region:${crypto.randomUUID()}`,
				name: "Canvas area",
				region: captured_0.region,
				...data ? { data } : {}
			};
		};
		$[549] = mergedComponentIndex;
		$[550] = t252;
	} else t252 = $[550];
	let t253;
	if ($[551] !== activeTabId || $[552] !== agentsV2.active || $[553] !== agentsV2.catalog || $[554] !== agentsV2.configureTab || $[555] !== chatTabs || $[556] !== chatsLoading || $[557] !== mergedComponentIndex || $[558] !== projectPath || $[559] !== readOnly || $[560] !== runningChatIds || $[561] !== t242 || $[562] !== t243 || $[563] !== t244 || $[564] !== t245 || $[565] !== t246 || $[566] !== t249 || $[567] !== t250 || $[568] !== t251 || $[569] !== t252) {
		t253 = {
			projectId: projectPath,
			active: agentsV2.active,
			loading: chatsLoading,
			readOnly,
			catalog: agentsV2.catalog,
			chats: chatTabs,
			messages: t242,
			currentChatId: t243,
			panelsRef: commentChatPanels,
			running: runningChatIds,
			pages: t244,
			activeTabId,
			navigationLoading: t245,
			selectPage: t246,
			canvasContext: t249,
			selection: _temp56,
			components: mergedComponentIndex,
			createChat: handleNewChat,
			openChat: t250,
			host: t251,
			configureTab: agentsV2.configureTab,
			captureRegion: t252
		};
		$[551] = activeTabId;
		$[552] = agentsV2.active;
		$[553] = agentsV2.catalog;
		$[554] = agentsV2.configureTab;
		$[555] = chatTabs;
		$[556] = chatsLoading;
		$[557] = mergedComponentIndex;
		$[558] = projectPath;
		$[559] = readOnly;
		$[560] = runningChatIds;
		$[561] = t242;
		$[562] = t243;
		$[563] = t244;
		$[564] = t245;
		$[565] = t246;
		$[566] = t249;
		$[567] = t250;
		$[568] = t251;
		$[569] = t252;
		$[570] = t253;
	} else t253 = $[570];
	useSidebarChatMcp(t253);
	const onDragElements = _temp57;
	let t254;
	if ($[571] !== activeTabId) {
		t254 = (elements_2) => {
			if (!activeTabId) return null;
			const store_2 = usePages.getState().tree;
			const ops_0 = [];
			const cloneIds = [];
			let cursor_0 = store_2;
			for (const { originalId, canvasPos: canvasPos_0, lockSize } of elements_2) {
				const nested = storeSubtreeToLegacyNested(cursor_0, originalId);
				if (!nested) continue;
				const clone = cloneElementWithNewIds(nested, {
					x: 0,
					y: 0
				});
				if (canvasPos_0) clone.canvasPosition = canvasPos_0;
				if (lockSize) clone.styles = {
					...clone.styles || {},
					width: `${lockSize.width}px`,
					height: `${lockSize.height}px`
				};
				const op_0 = createInsertOperation(clone, null, getRootIds(cursor_0).length);
				ops_0.push(op_0);
				cursor_0 = applyOperationsToStore(cursor_0, [op_0]);
				cloneIds.push(clone.id);
			}
			if (ops_0.length === 0) return null;
			const tx = usePages.getState().transaction();
			tx.stage(ops_0);
			useSelection.getState().select(new Set(cloneIds));
			return {
				cloneIds,
				tx
			};
		};
		$[571] = activeTabId;
		$[572] = t254;
	} else t254 = $[572];
	const onStartAltDrag = t254;
	let t255;
	if ($[573] !== activeTabId) {
		t255 = (element_2, opts) => {
			if (!activeTabId) return;
			const selectedId_0 = soleSelectedElementId(getSelectedElementIds());
			let targetParentId = opts?.parentId ?? null;
			if (!targetParentId && !opts?.atRoot && selectedId_0) {
				const sel = getById(usePages.getState().tree, selectedId_0);
				if (sel && hasChildren$1(sel) && canAcceptChild(sel, element_2)) targetParentId = selectedId_0;
			}
			if (targetParentId) {
				const targetEl = getById(usePages.getState().tree, targetParentId);
				if (!targetEl || !canAcceptChild(targetEl, element_2)) targetParentId = null;
			}
			element_2 = {
				...element_2,
				styles: positionStylesForPlacement(element_2.styles, !targetParentId ? "root" : isFlowLayoutElement(targetParentId) ? "flow" : "freeform")
			};
			if (targetParentId) {
				const { canvasPosition: _canvasPosition, ...elementWithoutPosition } = element_2;
				const ops_1 = [];
				if (element_2.styles?.position === "absolute") {
					const parent = getById(usePages.getState().tree, targetParentId);
					const parentPos = parent?.styles?.position;
					if (parent && parentPos !== "relative" && parentPos !== "absolute" && parentPos !== "fixed") {
						const styleOp_0 = createSetStylesOperation(usePages.getState().tree, targetParentId, {
							...parent.styles || {},
							position: "relative"
						});
						if (styleOp_0) ops_1.push(styleOp_0);
					}
				}
				const slot = frameSlotAmongAdoptees(usePages.getState().tree, opts?.adopt, targetParentId) ?? getChildren$2(usePages.getState().tree, targetParentId).length;
				ops_1.push(createInsertOperation(elementWithoutPosition, targetParentId, slot));
				if (opts?.adopt) ops_1.push(...buildFrameAdoptionOps(applyOperationsToStore(usePages.getState().tree, ops_1), element_2.id, opts.adopt));
				usePages.getState().applyOps(ops_1);
				if (element_2.type === "text") setEditingTextId(element_2.id);
				return;
			}
			let canvasPosition = element_2.canvasPosition ?? {
				x: 100,
				y: 100
			};
			if (!element_2.canvasPosition && viewportRef.current && canvasRef.current) {
				const viewportRect_0 = viewportRef.current.getBoundingClientRect();
				const canvasRect = canvasRef.current.getBoundingClientRect();
				const { scale: scale_0 } = getCamera();
				const screenX_0 = viewportRect_0.left + 100;
				const screenY_0 = viewportRect_0.top + 150;
				canvasPosition = {
					x: (screenX_0 - canvasRect.left) / scale_0,
					y: (screenY_0 - canvasRect.top) / scale_0
				};
			}
			const ops_2 = [createInsertOperation({
				...element_2,
				canvasPosition
			}, null, frameSlotAmongAdoptees(usePages.getState().tree, opts?.adopt, null) ?? getRootIds(usePages.getState().tree).length)];
			if (opts?.adopt) ops_2.push(...buildFrameAdoptionOps(applyOperationsToStore(usePages.getState().tree, ops_2), element_2.id, opts.adopt));
			usePages.getState().applyOps(ops_2);
			if (element_2.type === "text") setEditingTextId(element_2.id);
		};
		$[573] = activeTabId;
		$[574] = t255;
	} else t255 = $[574];
	const onAddElement = t255;
	const onResizeElement = _temp58;
	const onUndo = _temp59;
	const onRedo = _temp60;
	let t256;
	if ($[575] !== activeTabId) {
		t256 = (elementIds_0) => {
			if (!activeTabId || elementIds_0.size === 0) return;
			const ops_4 = [];
			let cursor_2 = usePages.getState().tree;
			for (const id_23 of elementIds_0) {
				const op_1 = createRemoveOperation(cursor_2, id_23);
				if (op_1) {
					ops_4.push(op_1);
					cursor_2 = applyOperationsToStore(cursor_2, [op_1]);
				}
			}
			if (ops_4.length > 0) usePages.getState().applyOps(ops_4);
			useSelection.getState().clearSelection();
		};
		$[575] = activeTabId;
		$[576] = t256;
	} else t256 = $[576];
	const onDeleteElements = t256;
	let t257;
	if ($[577] !== activeTabId) {
		t257 = (elementIds_1) => {
			if (!activeTabId || elementIds_1.size === 0) return;
			const store_3 = usePages.getState().tree;
			const ops_5 = [];
			const cloneIds_0 = [];
			let cursor_3 = store_3;
			const rootBoxes = occupiedRootBoxes(store_3);
			for (const elementId_5 of elementIds_1) {
				if (!getById(cursor_3, elementId_5)) continue;
				const nested_0 = storeSubtreeToLegacyNested(cursor_3, elementId_5);
				if (!nested_0) continue;
				const duplicate = cloneElementWithNewIds(nested_0);
				const parentKey = getParentId(cursor_3, elementId_5);
				const parentId_0 = parentKey === "ROOT" || parentKey === null ? null : parentKey;
				const index = getIndex(cursor_3, elementId_5);
				const sourceBox = parentId_0 === null ? rootOccupancyBox(store_3, elementId_5) : null;
				if (sourceBox) {
					const size_0 = {
						width: sourceBox.width,
						height: sourceBox.height
					};
					duplicate.canvasPosition = placeBesideAnchor(sourceBox, size_0, rootBoxes);
					rootBoxes.push({
						...duplicate.canvasPosition,
						...size_0
					});
				}
				const op_2 = createInsertOperation(duplicate, parentId_0, index + 1);
				ops_5.push(op_2);
				cursor_3 = applyOperationsToStore(cursor_3, [op_2]);
				cloneIds_0.push(duplicate.id);
			}
			if (ops_5.length === 0) return;
			usePages.getState().applyOps(ops_5);
			useSelection.getState().select(new Set(cloneIds_0));
		};
		$[577] = activeTabId;
		$[578] = t257;
	} else t257 = $[578];
	const onDuplicateElements = t257;
	let t258;
	if ($[579] !== mergedComponentIndex || $[580] !== openComponentFile) {
		t258 = () => {
			const selectedElementId = soleSelectedElementId(getSelectedElementIds());
			if (!selectedElementId) return;
			const element_4 = getById(usePages.getState().tree, selectedElementId);
			if (element_4?.type === "component") {
				const componentName_2 = element_4.componentName;
				const componentInfo = mergedComponentIndex[componentName_2];
				if (componentInfo?.path) openComponentFile(componentName_2, componentInfo.path);
			}
		};
		$[579] = mergedComponentIndex;
		$[580] = openComponentFile;
		$[581] = t258;
	} else t258 = $[581];
	const openSelectedComponentFile = t258;
	let t259;
	if ($[582] !== readOnly) {
		t259 = (e_2) => {
			const { selectedElementIds: selected_0, drilledParentId } = useSelection.getState();
			const { id: targetId_4, keepSelection } = takeCanvasContextMenuTarget(e_2.target) ?? contextMenuTarget(targetBeneathCursorLayer(e_2.target, e_2.clientX, e_2.clientY), {
				tree: usePages.getState().visibleTree,
				interactiveParentIds: getInteractiveParentIds(),
				drilledParentId,
				selectedElementIds: selected_0
			});
			if (readOnly && !targetId_4) {
				e_2.preventDefault();
				return;
			}
			if (targetId_4 && !keepSelection) useSelection.getState().select(/* @__PURE__ */ new Set([targetId_4]));
			contextMenuPointRef.current = {
				x: e_2.clientX,
				y: e_2.clientY
			};
			setCanvasMenuTargetId(targetId_4);
		};
		$[582] = readOnly;
		$[583] = t259;
	} else t259 = $[583];
	const handleCanvasContextMenu = t259;
	const onEditText = _temp61;
	const onRenameElement = _temp62;
	let t260;
	if ($[584] !== activeTabId || $[585] !== readOnly) {
		t260 = (ids_2, update) => {
			if (!activeTabId || readOnly) return;
			const operations = [];
			for (const elementId_8 of ids_2) {
				const element_5 = getById(usePages.getState().tree, elementId_8);
				if (!element_5) continue;
				const updated = update(exportSettingsOf(element_5));
				const next_12 = updated.length ? updated : void 0;
				if (JSON.stringify(next_12) === JSON.stringify(element_5.exportSettings)) continue;
				operations.push({
					type: "set_export_settings",
					elementId: elementId_8,
					oldSettings: element_5.exportSettings,
					newSettings: next_12
				});
			}
			if (operations.length) usePages.getState().applyOps(operations);
		};
		$[584] = activeTabId;
		$[585] = readOnly;
		$[586] = t260;
	} else t260 = $[586];
	const onUpdateExportSettings = t260;
	let t261;
	if ($[587] !== activeTabId || $[588] !== editingTextId || $[589] !== textSelectionState?.isFull || $[590] !== textSelectionState?.styles) {
		t261 = (elementId_9, styles) => {
			if (!activeTabId) return;
			const ate = activeTextEditorRef.current;
			const editingText = !!(ate && editingTextId);
			if (editingText && ate.hasTextStyleTarget()) {
				const baseStyles = textSelectionState?.styles ?? {};
				const newAny = styles;
				const textPatch = {};
				let textChanged = false;
				for (const key of Object.keys(newAny)) if (TEXT_RUN_STYLE_KEYS.has(key)) {
					if (newAny[key] === baseStyles[key]) continue;
					textPatch[key] = newAny[key];
					textChanged = true;
				}
				for (const key_0 of Object.keys(baseStyles)) {
					if (key_0 in newAny) continue;
					if (TEXT_RUN_STYLE_KEYS.has(key_0)) {
						textPatch[key_0] = null;
						textChanged = true;
					}
				}
				if (textChanged) {
					ate.applyStyles(textPatch);
					return;
				}
				if (Object.keys(newAny).some(_temp63)) return;
			}
			if (editingText && textSelectionState?.isFull) {
				const ownerStyles = getById(usePages.getState().tree, elementId_9)?.styles ?? {};
				const newAny_0 = styles;
				const clearPatch = {};
				for (const key_1 of Object.keys(newAny_0)) {
					if (!TEXT_RUN_STYLE_KEYS.has(key_1)) continue;
					if (newAny_0[key_1] === ownerStyles[key_1]) continue;
					clearPatch[key_1] = null;
				}
				if (Object.keys(clearPatch).length) ate.applyStyles(clearPatch);
			}
			const op_5 = createSetStylesOperation(usePages.getState().tree, elementId_9, styles);
			if (op_5) usePages.getState().applyOps([op_5]);
		};
		$[587] = activeTabId;
		$[588] = editingTextId;
		$[589] = textSelectionState?.isFull;
		$[590] = textSelectionState?.styles;
		$[591] = t261;
	} else t261 = $[591];
	const onUpdateElementStyles = t261;
	let t262;
	if ($[592] !== activeTabId || $[593] !== editingTextId) {
		t262 = (elementId_10, format) => {
			if (!activeTabId) return;
			const ate_0 = activeTextEditorRef.current;
			if (ate_0 && editingTextId && ate_0.hasTextStyleTarget()) {
				ate_0.toggleFormat(format);
				return;
			}
			const el_1 = getById(usePages.getState().tree, elementId_10);
			if (!el_1) return;
			const styles_0 = el_1.styles ?? {};
			const next_13 = { ...styles_0 };
			if (format === "bold") {
				if (styles_0.fontWeight === "bold" || styles_0.fontWeight === "700" || typeof styles_0.fontWeight === "number" && styles_0.fontWeight >= 600) delete next_13.fontWeight;
				else next_13.fontWeight = 700;
			} else if (format === "italic") {
				if (styles_0.fontStyle === "italic") delete next_13.fontStyle;
				else next_13.fontStyle = "italic";
			} else {
				const target_3 = format === "underline" ? "underline" : "line-through";
				const parts = String(styles_0.textDecoration ?? "").split(/\s+/).filter(Boolean);
				const has = parts.includes(target_3);
				const filtered = parts.filter((p_7) => p_7 !== target_3);
				if (!has) filtered.push(target_3);
				if (filtered.length === 0) delete next_13.textDecoration;
				else next_13.textDecoration = filtered.join(" ");
			}
			const op_6 = createSetStylesOperation(usePages.getState().tree, elementId_10, next_13);
			if (op_6) usePages.getState().applyOps([op_6]);
		};
		$[592] = activeTabId;
		$[593] = editingTextId;
		$[594] = t262;
	} else t262 = $[594];
	const onToggleTextFormat = t262;
	let t263;
	if ($[595] !== activeTabId || $[596] !== editingTextId || $[597] !== textSelectionState) {
		t263 = (elementId_11, props) => {
			if (!activeTabId) return;
			const ate_1 = activeTextEditorRef.current;
			const editingText_0 = !!(ate_1 && editingTextId);
			const editingTextLeaf = editingText_0 && getById(usePages.getState().tree, elementId_11)?.type === "text";
			if (editingText_0 && (ate_1.hasTextStyleTarget() || editingTextLeaf)) {
				const baseClassName = textSelectionState?.className ?? "";
				const current_4 = getById(usePages.getState().tree, elementId_11)?.props ?? {};
				const newAny_1 = props;
				if (!Object.keys(newAny_1).some((k_0) => k_0 !== "className" && newAny_1[k_0] !== current_4[k_0]) && typeof newAny_1.className === "string") {
					const existing_2 = baseClassName.split(/\s+/).filter(Boolean);
					const incoming = newAny_1.className.split(/\s+/).filter(Boolean);
					const added = incoming.filter((c_6) => !existing_2.includes(c_6));
					const removed = existing_2.filter((c_7) => !incoming.includes(c_7));
					if (editingTextLeaf || isInlineTypographyEdit(textSelectionState, [...added, ...removed])) {
						if (added.length) ate_1.addClassName(added.join(" "));
						if (removed.length) ate_1.removeClassName(removed.join(" "));
						return;
					}
				}
			}
			setElementProps(elementId_11, props);
		};
		$[595] = activeTabId;
		$[596] = editingTextId;
		$[597] = textSelectionState;
		$[598] = t263;
	} else t263 = $[598];
	const onUpdateElementProps = t263;
	const onSetElementPropsTransient = _temp64;
	let t264;
	if ($[599] === Symbol.for("react.memo_cache_sentinel")) {
		t264 = /* @__PURE__ */ new Set();
		$[599] = t264;
	} else t264 = $[599];
	const strippedOwnedDomPropsRef = (0, import_react.useRef)(t264);
	let t265;
	if ($[600] !== readOnly) {
		t265 = () => {
			const selectedElementId_0 = soleSelectedElementId(getSelectedElementIds());
			if (readOnly || !selectedElementId_0) return;
			const targetElement = getById(usePages.getState().tree, selectedElementId_0);
			if (targetElement?.type === "html" && targetElement.props?.["data-element-id"] && !strippedOwnedDomPropsRef.current.has(selectedElementId_0)) {
				strippedOwnedDomPropsRef.current.add(selectedElementId_0);
				const cleaned_0 = sanitizeElementProps(targetElement.props) ?? {};
				onSetElementPropsTransient(selectedElementId_0, cleaned_0);
			}
		};
		$[600] = readOnly;
		$[601] = t265;
	} else t265 = $[601];
	const stripStaleOwnedDomPropsEvent = (0, import_react.useEffectEvent)(t265);
	let t266;
	if ($[602] !== activeTabId) {
		t266 = (elementIds_2, propsUpdater) => {
			if (!activeTabId || elementIds_2.size === 0) return;
			const operations_0 = [];
			for (const elementId_13 of elementIds_2) {
				const element_6 = getById(usePages.getState().tree, elementId_13);
				if (!element_6) continue;
				const newProps = propsUpdater(element_6.type === "text" ? { className: element_6.className ?? "" } : element_6.props || {});
				const op_8 = createSetPropsOperation(usePages.getState().tree, elementId_13, newProps);
				if (op_8) operations_0.push(op_8);
			}
			if (operations_0.length > 0) usePages.getState().applyOps(operations_0);
		};
		$[602] = activeTabId;
		$[603] = t266;
	} else t266 = $[603];
	const onUpdateMultipleElementsProps = t266;
	let t267;
	if ($[604] !== activeTabId) {
		t267 = (elementIds_3, stylesUpdater) => {
			if (!activeTabId || elementIds_3.size === 0) return;
			const operations_1 = [];
			for (const elementId_14 of elementIds_3) {
				const element_7 = getById(usePages.getState().tree, elementId_14);
				if (!element_7) continue;
				const newStyles_0 = stylesUpdater(element_7.styles || {}, elementId_14);
				const op_9 = createSetStylesOperation(usePages.getState().tree, elementId_14, newStyles_0);
				if (op_9) operations_1.push(op_9);
			}
			if (operations_1.length > 0) usePages.getState().applyOps(operations_1);
		};
		$[604] = activeTabId;
		$[605] = t267;
	} else t267 = $[605];
	const onUpdateMultipleElementsStyles = t267;
	let t268;
	if ($[606] !== activeTabId) {
		t268 = (elementIds_4, updater) => {
			if (!activeTabId || elementIds_4.length === 0) return;
			const operations_2 = createElementWriteOperations(usePages.getState().tree, elementIds_4, updater);
			if (operations_2.length > 0) usePages.getState().applyOps(operations_2);
		};
		$[606] = activeTabId;
		$[607] = t268;
	} else t268 = $[607];
	const onUpdateMultipleElements = t268;
	let t269;
	if ($[608] !== activeTabId) {
		t269 = (positions) => {
			if (!activeTabId || positions.size === 0) return;
			const operations_3 = [];
			let cursor_4 = usePages.getState().tree;
			for (const [elementId_15, position_3] of positions) {
				const op_10 = createSetPositionOperation(cursor_4, elementId_15, position_3);
				if (!op_10) continue;
				operations_3.push(op_10);
				cursor_4 = applyOperationsToStore(cursor_4, [op_10]);
			}
			if (operations_3.length > 0) usePages.getState().applyOps(operations_3);
		};
		$[608] = activeTabId;
		$[609] = t269;
	} else t269 = $[609];
	const onUpdateElementPositions = t269;
	const [pasteStyleSuggestion, setPasteStyleSuggestion] = (0, import_react.useState)(null);
	let t270;
	if ($[610] !== activeTabId || $[611] !== pasteStyleSuggestion) {
		t270 = (mode) => {
			if (!activeTabId || !pasteStyleSuggestion) return;
			const { rootId: rootId_1 } = pasteStyleSuggestion;
			const classProps = buildClassPropertyMap(document);
			const ids_3 = [rootId_1, ...getDescendantIds(usePages.getState().tree, rootId_1)];
			const operations_4 = [];
			for (const id_24 of ids_3) {
				const el_2 = getById(usePages.getState().tree, id_24);
				const styles_1 = el_2 && el_2.styles;
				if (!styles_1 || Object.keys(styles_1).length === 0) continue;
				const className = el_2.props?.className;
				const { next: next_14, changed } = computeCleanedStyles(styles_1, className, classProps, mode);
				if (!changed) continue;
				const op_11 = createSetStylesOperation(usePages.getState().tree, id_24, next_14 ?? {});
				if (op_11) operations_4.push(op_11);
			}
			if (operations_4.length > 0) usePages.getState().applyOps(operations_4);
			setPasteStyleSuggestion(null);
		};
		$[610] = activeTabId;
		$[611] = pasteStyleSuggestion;
		$[612] = t270;
	} else t270 = $[612];
	const applyPasteStyleClean = t270;
	const onReplaceElement = _temp65;
	let t271;
	if ($[613] === Symbol.for("react.memo_cache_sentinel")) {
		t271 = (id_25, url) => {
			const el_3 = getById(usePages.getState().tree, id_25);
			if (el_3?.type === "webview") onReplaceElement(id_25, {
				...el_3,
				src: url
			});
		};
		$[613] = t271;
	} else t271 = $[613];
	const navigatePreview = t271;
	const onPreviewElement = _temp66;
	const onClearPreview = _temp67;
	const onCopyElement = _temp68;
	const onCopyElements = _temp69;
	let t272;
	if ($[614] !== activeTabId) {
		t272 = async (elementId_17) => {
			if (!activeTabId) return;
			if (!getById(usePages.getState().tree, elementId_17)) return;
			if (!await copyElementToClipboard(storeSubtreeToLegacyNested(usePages.getState().tree, elementId_17))) return;
			const op_13 = createRemoveOperation(usePages.getState().tree, elementId_17);
			if (op_13) usePages.getState().applyOps([op_13]);
		};
		$[614] = activeTabId;
		$[615] = t272;
	} else t272 = $[615];
	const onCutElement = t272;
	let t273;
	if ($[616] !== activeTabId) {
		t273 = async (elementIds_6) => {
			if (!activeTabId || elementIds_6.size === 0) return;
			const elementsToCut = [];
			for (const id_27 of elementIds_6) {
				if (!getById(usePages.getState().tree, id_27)) continue;
				elementsToCut.push(storeSubtreeToLegacyNested(usePages.getState().tree, id_27));
			}
			if (elementsToCut.length === 0) return;
			const clipboardData_0 = {
				__petal: true,
				__multi: true,
				elements: elementsToCut
			};
			try {
				await navigator.clipboard.writeText(JSON.stringify(clipboardData_0));
			} catch (t274) {
				console.error("Failed to copy to clipboard:", t274);
				return;
			}
			const ops_6 = [];
			let cursor_5 = usePages.getState().tree;
			for (const id_28 of elementIds_6) {
				const op_14 = createRemoveOperation(cursor_5, id_28);
				if (op_14) {
					ops_6.push(op_14);
					cursor_5 = applyOperationsToStore(cursor_5, [op_14]);
				}
			}
			if (ops_6.length > 0) usePages.getState().applyOps(ops_6);
			useSelection.getState().clearSelection();
		};
		$[616] = activeTabId;
		$[617] = t273;
	} else t273 = $[617];
	const onCutElements = t273;
	let t274;
	if ($[618] === Symbol.for("react.memo_cache_sentinel")) {
		t274 = () => {
			const viewport_5 = viewportRef.current;
			const canvas = canvasRef.current;
			if (!viewport_5 || !canvas) return;
			const viewportRect_1 = viewport_5.getBoundingClientRect();
			const canvasRect_0 = canvas.getBoundingClientRect();
			const { scale: scale_1 } = getCamera();
			const pointer = lastPointerScreenRef.current;
			const overViewport = pointer.valid && pointer.x >= viewportRect_1.left && pointer.x <= viewportRect_1.right && pointer.y >= viewportRect_1.top && pointer.y <= viewportRect_1.bottom;
			const screenX_1 = overViewport ? pointer.x : viewportRect_1.left + viewportRect_1.width / 2;
			const screenY_1 = overViewport ? pointer.y : viewportRect_1.top + viewportRect_1.height / 2;
			return {
				x: (screenX_1 - canvasRect_0.left) / scale_1,
				y: (screenY_1 - canvasRect_0.top) / scale_1
			};
		};
		$[618] = t274;
	} else t274 = $[618];
	const getPasteCanvasPosition = t274;
	let t275;
	if ($[619] !== activeTabId) {
		t275 = (containerIds, elements_3, sources_0) => {
			if (!activeTabId) return [];
			const ops_7 = [];
			const newIds = [];
			const byTarget = groupElementsByTarget(elements_3, sources_0, containerIds);
			for (const containerId of containerIds) {
				let index_0 = getChildren$2(usePages.getState().tree, containerId).length;
				for (const el_4 of byTarget.get(containerId) ?? []) {
					const cloned = cloneElementWithNewIds(el_4);
					ops_7.push(createInsertOperation(cloned, containerId, index_0++));
					newIds.push(cloned.id);
				}
			}
			if (ops_7.length === 0) return [];
			usePages.getState().applyOps(ops_7);
			useSelection.getState().select(new Set(newIds));
			return newIds;
		};
		$[619] = activeTabId;
		$[620] = t275;
	} else t275 = $[620];
	const pasteIntoContainers = t275;
	let t276;
	if ($[621] !== activeTabId || $[622] !== pasteIntoContainers) {
		t276 = (element_8, opts_0) => {
			if (!activeTabId) return;
			const selection_0 = opts_0?.selection ?? getSelectedElementIds();
			const droppedInto = opts_0?.parentId ?? null;
			if (!opts_0?.atRoot && !droppedInto) {
				const targets = resolveMultiPasteTargets(usePages.getState().tree, selection_0, [element_8]);
				if (targets.length > 0) return pasteIntoContainers(targets, [element_8])[0];
			}
			const pastedElement = cloneElementWithNewIds(element_8);
			const soleSelectedId = soleSelectedElementId(selection_0);
			let targetId_5 = droppedInto ?? (opts_0?.atRoot ? null : soleSelectedId ?? null);
			if (!droppedInto && !opts_0?.atRoot && soleSelectedId && soleSelectedId === element_8.id) {
				const parentKey_1 = getParentId(usePages.getState().tree, soleSelectedId);
				targetId_5 = parentKey_1 === "ROOT" || parentKey_1 === null ? null : parentKey_1;
			}
			if (!targetId_5) {
				stripRootPositioning(pastedElement);
				if (!pastedElement.canvasPosition) pastedElement.canvasPosition = getPasteCanvasPosition() ?? {
					x: 20,
					y: 20
				};
				const op_15 = createInsertOperation(pastedElement, null, getRootIds(usePages.getState().tree).length);
				usePages.getState().applyOps([op_15]);
			} else {
				const parent_0 = getById(usePages.getState().tree, targetId_5);
				if (!parent_0 || !hasChildren$1(parent_0) || !canAcceptChild(parent_0, pastedElement)) {
					stripRootPositioning(pastedElement);
					pastedElement.canvasPosition = {
						x: 20,
						y: 20
					};
					const op_16 = createInsertOperation(pastedElement, null, getRootIds(usePages.getState().tree).length);
					usePages.getState().applyOps([op_16]);
					return pastedElement.id;
				}
				const childrenCount = getChildren$2(usePages.getState().tree, targetId_5).length;
				const op_17 = createInsertOperation(pastedElement, targetId_5, childrenCount);
				usePages.getState().applyOps([op_17]);
			}
			return pastedElement.id;
		};
		$[621] = activeTabId;
		$[622] = pasteIntoContainers;
		$[623] = t276;
	} else t276 = $[623];
	const addPastedElementToCanvas = t276;
	let t277;
	if ($[624] !== activeTabId || $[625] !== readOnly) {
		t277 = async (selectedIds) => {
			if (readOnly || !activeTabId || selectedIds.size === 0) return;
			let clipboardText;
			try {
				clipboardText = await navigator.clipboard.readText();
			} catch {
				return;
			}
			if (!clipboardText) return;
			let payload;
			try {
				payload = JSON.parse(clipboardText);
			} catch {
				return;
			}
			if (!payload?.__petal) return;
			const rawSources = payload.__multi && Array.isArray(payload.elements) ? payload.elements : payload.element != null ? [payload.element] : [];
			const KNOWN_ELEMENT_TYPES = /* @__PURE__ */ new Set([
				"html",
				"component",
				"text",
				"icon",
				"webview"
			]);
			const sources_1 = rawSources.filter((s_8) => !!s_8 && typeof s_8 === "object" && typeof s_8.type === "string" && KNOWN_ELEMENT_TYPES.has(s_8.type));
			if (sources_1.length === 0) return;
			const targets_0 = Array.from(selectedIds);
			const ops_8 = [];
			const newIds_0 = [];
			let cursor_6 = usePages.getState().tree;
			targets_0.forEach((targetId_6, i_2) => {
				const target_4 = getById(cursor_6, targetId_6);
				if (!target_4) return;
				const parentKey_2 = getParentId(cursor_6, targetId_6);
				const parentId_1 = parentKey_2 === "ROOT" || parentKey_2 === null ? null : parentKey_2;
				const index_1 = getIndex(cursor_6, targetId_6);
				const clone_0 = cloneElementWithNewIds(sources_1[i_2 % sources_1.length], {
					x: 0,
					y: 0
				});
				if (parentId_1 === null) {
					stripRootPositioning(clone_0);
					if ("canvasPosition" in target_4 && target_4.canvasPosition) clone_0.canvasPosition = { ...target_4.canvasPosition };
				} else {
					delete clone_0.canvasPosition;
					const tStyles = "styles" in target_4 && target_4.styles || {};
					if (tStyles.position === "absolute" || tStyles.position === "fixed") {
						const inherited = {
							...clone_0.styles || {},
							position: tStyles.position
						};
						for (const k_1 of [
							"left",
							"top",
							"right",
							"bottom"
						]) if (tStyles[k_1] !== void 0) inherited[k_1] = tStyles[k_1];
						clone_0.styles = inherited;
					}
				}
				const removeOp = createRemoveOperation(cursor_6, targetId_6);
				if (removeOp) {
					ops_8.push(removeOp);
					cursor_6 = applyOperationsToStore(cursor_6, [removeOp]);
				}
				const insertOp = createInsertOperation(clone_0, parentId_1, index_1);
				ops_8.push(insertOp);
				cursor_6 = applyOperationsToStore(cursor_6, [insertOp]);
				newIds_0.push(clone_0.id);
			});
			if (ops_8.length > 0) {
				usePages.getState().applyOps(ops_8);
				useSelection.getState().select(new Set(newIds_0));
			}
		};
		$[624] = activeTabId;
		$[625] = readOnly;
		$[626] = t277;
	} else t277 = $[626];
	const onPasteToReplace = t277;
	let resolveCapturedComponents;
	if ($[627] !== allIconLibraries || $[628] !== components || $[629] !== mergedComponentIndex) {
		resolveCapturedComponents = (el_5, counter, opts_1) => {
			const upgradeAll = opts_1?.upgradeAllRegistry === true;
			const anyEl = el_5;
			const children = Array.isArray(anyEl.children) ? anyEl.children.map((c_8) => resolveCapturedComponents(c_8, counter, opts_1)) : void 0;
			const ci = anyEl.capturedIcon;
			if (el_5.type === "html" && ci?.iconName) {
				const libKey = Object.keys(allIconLibraries).find((k_2) => allIconLibraries[k_2]?.icons?.[ci.iconName] && svgMatchesIconLibrary(k_2, anyEl.props));
				if (libKey) {
					counter.n = counter.n + 1;
					return {
						id: el_5.id,
						type: "icon",
						library: libKey,
						iconName: ci.iconName,
						props: ci.props ? {
							...ci.props,
							...ci.props.size == null && ci.size ? { size: ci.size } : {}
						} : iconPropsFromSvg(anyEl.props, ci.size),
						...anyEl.styles ? { styles: anyEl.styles } : {},
						...el_5.canvasPosition ? { canvasPosition: el_5.canvasPosition } : {}
					};
				}
				const { capturedIcon: _capturedIcon, ...rest } = anyEl;
				return children ? {
					...rest,
					children
				} : rest;
			}
			const cc = anyEl.capturedComponent;
			const dataComponent = typeof anyEl.props?.["data-component"] === "string" ? anyEl.props["data-component"] : void 0;
			const dataSlot = typeof anyEl.props?.["data-slot"] === "string" ? anyEl.props["data-slot"] : void 0;
			const lgComponent = typeof anyEl.props?.["data-lg-component"] === "string" ? anyEl.props["data-lg-component"] : void 0;
			const pascal = dataSlot?.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(_temp70).join("") ?? "";
			const fromSlot = upgradeAll && pascal && (components[pascal] || mergedComponentIndex[pascal]) ? pascal : void 0;
			const inReg = (n_5) => !!(n_5 && (components[n_5] || mergedComponentIndex[n_5]));
			const registryName = (inReg(lgComponent) ? lgComponent : void 0) || (inReg(cc?.name) ? cc.name : void 0) || (inReg(dataComponent) ? dataComponent : void 0) || fromSlot || lgComponent || cc?.name || dataComponent;
			const inRuntime = !!(registryName && components[registryName]);
			const inIndex = !!(registryName && mergedComponentIndex[registryName]);
			const canUpgrade = !!(registryName && (inRuntime || upgradeAll && inIndex));
			const liveOk = upgradeAll || cc?.liveSafe !== false;
			if (el_5.type === "html" && canUpgrade && liveOk && registryName) {
				counter.n = counter.n + 1;
				const componentProps = cc?.props ? { ...cc.props } : {};
				if (typeof anyEl.props?.className === "string" && !componentProps.className) componentProps.className = anyEl.props.className;
				delete componentProps["data-slot"];
				delete componentProps["data-state"];
				delete componentProps["data-component"];
				delete componentProps["data-lg-component"];
				delete componentProps["data-lg-src"];
				if (typeof componentProps.id === "string" && /(^radix-|:r[0-9a-z]+:)/.test(componentProps.id)) delete componentProps.id;
				for (const k_3 of Object.keys(componentProps)) if (componentProps[k_3] === void 0) delete componentProps[k_3];
				const prunedChildren = stripPropSynthesizedChildren(children, componentProps);
				return {
					id: el_5.id,
					type: "component",
					componentName: registryName,
					props: Object.keys(componentProps).length ? componentProps : void 0,
					frozenFallback: true,
					children: prunedChildren,
					...el_5.canvasPosition ? { canvasPosition: el_5.canvasPosition } : {}
				};
			}
			if (cc && !upgradeAll) {
				const { capturedComponent: _capturedComponent, ...rest_0 } = anyEl;
				return {
					...rest_0,
					children
				};
			}
			if (cc && upgradeAll) {
				const { capturedComponent: _unusedCapturedComponent, ...rest_1 } = anyEl;
				return {
					...rest_1,
					children
				};
			}
			if (el_5.type === "component") {
				counter.n = counter.n + 1;
				const compEl = anyEl;
				const cleanedProps = compEl.props ? { ...compEl.props } : void 0;
				if (cleanedProps) {
					for (const k_4 of Object.keys(cleanedProps)) if (cleanedProps[k_4] === void 0) delete cleanedProps[k_4];
				}
				return {
					...compEl,
					props: cleanedProps && Object.keys(cleanedProps).length ? cleanedProps : void 0,
					children: stripPropSynthesizedChildren(children, cleanedProps),
					frozenFallback: true
				};
			}
			return children ? {
				...anyEl,
				children
			} : el_5;
		};
		$[627] = allIconLibraries;
		$[628] = components;
		$[629] = mergedComponentIndex;
		$[630] = resolveCapturedComponents;
	} else resolveCapturedComponents = $[630];
	let t278;
	if ($[631] !== activeTabId || $[632] !== components || $[633] !== mergedComponentIndex || $[634] !== readOnly || $[635] !== resolveCapturedComponents) {
		t278 = async (elementId_18) => {
			if (readOnly) return;
			const el_6 = getById(usePages.getState().tree, elementId_18);
			if (!el_6 || el_6.type !== "component") return;
			const existingRoot = findEditRootId$1(usePages.getState().tree, elementId_18);
			if (existingRoot) {
				useSelection.getState().select(/* @__PURE__ */ new Set([existingRoot]));
				return;
			}
			const componentName_3 = el_6.componentName;
			const filePath_4 = mergedComponentIndex[componentName_3]?.path;
			if (!filePath_4) {
				toast.error("Component file not found in code index");
				return;
			}
			if (rendersThroughWebgl(elementId_18)) {
				toast.error(`${componentName_3} draws with WebGL — edit its file instead of the canvas`);
				return;
			}
			if (!activeTabId) return;
			const toastId_0 = toast.loading("Entering component edit…");
			try {
				const knownComponents = [.../* @__PURE__ */ new Set([...Object.keys(components), ...Object.keys(mergedComponentIndex)])];
				const result_3 = await captureComponentInstance({
					elementId: elementId_18,
					store: usePages.getState().tree,
					knownComponents,
					componentName: componentName_3,
					filePath: filePath_4
				});
				if ("error" in result_3) {
					toast.error(result_3.error, { id: toastId_0 });
					return;
				}
				const persisted = resolveCapturedComponents(result_3.replacement, { n: 0 }, { upgradeAllRegistry: true });
				const session_0 = editSessionFromElement(persisted);
				if (!session_0) {
					toast.error("Could not enter edit mode", { id: toastId_0 });
					return;
				}
				const replaceOp = createReplaceOperation(usePages.getState().tree, elementId_18, persisted);
				if (!replaceOp) {
					toast.error("Could not enter edit mode", { id: toastId_0 });
					return;
				}
				startLog(persisted.id);
				stashComponentEditSession(session_0);
				usePages.getState().applyOps([replaceOp]);
				useSelection.getState().select(/* @__PURE__ */ new Set([persisted.id]));
				toast.success(`Editing ${componentName_3}`, { id: toastId_0 });
			} catch (t279) {
				console.error("[Edit component] failed:", t279);
				toast.error("Failed to enter component edit", { id: toastId_0 });
			}
		};
		$[631] = activeTabId;
		$[632] = components;
		$[633] = mergedComponentIndex;
		$[634] = readOnly;
		$[635] = resolveCapturedComponents;
		$[636] = t278;
	} else t278 = $[636];
	const handleEditComponent = t278;
	let t279;
	if ($[637] !== activeTabId) {
		t279 = (session_1, overrides) => {
			if (!activeTabId) return;
			const { containerId: containerId_0 } = session_1;
			const captureEl = getById(usePages.getState().tree, containerId_0);
			const original = (captureEl?.type === "capture" ? captureEl.original : void 0) ?? session_1.original;
			if (!original || original.type !== "component") return;
			if (!captureEl) return;
			const restored_1 = {
				...structuredClone(original),
				...overrides?.props ? { props: overrides.props } : {},
				...captureEl.canvasPosition ? { canvasPosition: captureEl.canvasPosition } : original.canvasPosition ? { canvasPosition: original.canvasPosition } : {}
			};
			const op_18 = createReplaceOperation(usePages.getState().tree, containerId_0, restored_1);
			if (op_18) {
				usePages.getState().applyOps([op_18]);
				useSelection.getState().select(/* @__PURE__ */ new Set([restored_1.id]));
			}
			clearLog(containerId_0);
			clearComponentEditSession(containerId_0);
		};
		$[637] = activeTabId;
		$[638] = t279;
	} else t279 = $[638];
	const remountComponentEditInstance = t279;
	let t280;
	if ($[639] !== focusedComponentEditSession || $[640] !== remountComponentEditInstance) {
		t280 = () => {
			if (!focusedComponentEditSession) return;
			const captureEl_0 = getById(usePages.getState().tree, focusedComponentEditSession.containerId);
			const original_0 = (captureEl_0?.type === "capture" ? captureEl_0.original : void 0) ?? focusedComponentEditSession.original;
			if (!original_0 || original_0.type !== "component") {
				toast.error("Cannot cancel — original component was not saved with this edit");
				return;
			}
			remountComponentEditInstance(focusedComponentEditSession);
		};
		$[639] = focusedComponentEditSession;
		$[640] = remountComponentEditInstance;
		$[641] = t280;
	} else t280 = $[641];
	const handleCancelComponentEdit = t280;
	let t281;
	if ($[642] !== activeTabId || $[643] !== focusedComponentEditSession || $[644] !== listFileVersions || $[645] !== mergedComponentIndex || $[646] !== openComponentFile || $[647] !== remountComponentEditInstance || $[648] !== restoreFileVersion || $[649] !== saveFile) {
		t281 = async (designerNotes) => {
			if (!focusedComponentEditSession) return;
			const session_2 = focusedComponentEditSession;
			const { containerId: containerId_1, original: original_1 } = session_2;
			const componentName_4 = original_1.componentName;
			const filePath_5 = session_2.sourceInfo?.filePath || "";
			if (!filePath_5) {
				toast.error("Cannot save — component file path is missing");
				return;
			}
			setSavingComponentEditIds((prev_20) => new Set(prev_20).add(containerId_1));
			const toastId_1 = toast.loading(`Saving ${componentName_4}…`);
			const runSave = async () => {
				const subtree_1 = storeSubtreeToLegacyNested(usePages.getState().tree, containerId_1);
				const descriptions = squashOperations(getOperations(containerId_1), usePages.getState().tree).map(_temp71).filter(_temp72);
				const instanceProps = original_1.props ?? {};
				const opLines = descriptions.map(_temp73).join("\n");
				const trimmedNotes = designerNotes?.trim();
				const userInstructions = [
					`Update the "${componentName_4}" component definition in this file (not a per-instance override).`,
					"The EDITED SNAPSHOT is the designer's FINAL canvas state for the UI they were looking at after interacting with a live instance — treat it as the target render for that state.",
					"Preserve hooks, props API, conditionals, .map() templates, and imports; apply visual/structural edits into the existing source patterns (prefer Tailwind classes over inline styles when the file already uses them).",
					Object.keys(instanceProps).length > 0 ? `Instance props at edit time: ${JSON.stringify(instanceProps)}` : null,
					opLines ? `Design operations (intent log):\n${opLines}` : "No discrete operations were logged — match the snapshot visually.",
					trimmedNotes ? `Designer instructions (follow these carefully):\n${trimmedNotes}` : null
				].filter(Boolean).join("\n\n");
				const previousInstanceProps = structuredClone(original_1.props ?? instanceProps);
				const instanceElementId = original_1.id;
				const result_4 = await saveFile({
					filePath: filePath_5,
					elements: [subtree_1],
					stateContext: {
						componentName: componentName_4,
						instanceProps,
						observedState: "Snapshot is a rendered branch after user interaction (e.g. a later step), not necessarily the initial render."
					},
					userInstructions,
					componentIndex: mergedComponentIndex,
					suggestInstanceProps: Boolean(trimmedNotes)
				});
				onActivityRef.current?.({
					type: "save_to_code_completed",
					componentName: componentName_4,
					withNotes: Boolean(trimmedNotes),
					success: result_4.success
				});
				if (!result_4.success) {
					toast.error(result_4.error || `Failed to save ${componentName_4}`, { id: toastId_1 });
					return;
				}
				openComponentFile(componentName_4, filePath_5);
				refreshFocusedComponentRef.current(filePath_5);
				const appliedInstanceProps = result_4.instanceProps;
				const saveTabId = activeTabId;
				toast.success(`Saved ${componentName_4}`, {
					id: toastId_1,
					duration: 8e3,
					action: {
						label: "Undo",
						onClick: async () => {
							const versionsResult = await listFileVersions(componentName_4, filePath_5);
							if (!versionsResult.success || versionsResult.versions.length === 0) {
								toast.error("No previous version found to restore");
								return;
							}
							const latestVersion = versionsResult.versions[0];
							const restoreResult = await restoreFileVersion(componentName_4, latestVersion.filename, filePath_5);
							if (!restoreResult.success) {
								toast.error(`Failed to revert: ${restoreResult.error}`);
								return;
							}
							refreshFocusedComponentRef.current(filePath_5);
							if (appliedInstanceProps && saveTabId && getById(usePages.getState().tree, instanceElementId)) {
								const op_20 = createSetPropsOperation(usePages.getState().tree, instanceElementId, sanitizeElementProps(previousInstanceProps) ?? {});
								if (op_20) usePages.getState().applyOps([op_20], { pageId: saveTabId });
							}
							toast.success(`${componentName_4} reverted to previous version`);
						}
					}
				});
				remountComponentEditInstance(session_2, appliedInstanceProps ? { props: appliedInstanceProps } : void 0);
			};
			try {
				await runSave();
			} catch (t282) {
				const err_2 = t282;
				console.error("[Edit component] save failed:", err_2);
				toast.error(err_2 instanceof Error ? err_2.message : `Failed to save ${componentName_4}`, { id: toastId_1 });
			}
			setSavingComponentEditIds((prev_21) => {
				const next_15 = new Set(prev_21);
				next_15.delete(containerId_1);
				return next_15;
			});
		};
		$[642] = activeTabId;
		$[643] = focusedComponentEditSession;
		$[644] = listFileVersions;
		$[645] = mergedComponentIndex;
		$[646] = openComponentFile;
		$[647] = remountComponentEditInstance;
		$[648] = restoreFileVersion;
		$[649] = saveFile;
		$[650] = t281;
	} else t281 = $[650];
	const handleSaveComponentEdit = t281;
	let countCapturedNodes;
	if ($[651] === Symbol.for("react.memo_cache_sentinel")) {
		countCapturedNodes = (el_7) => {
			const kids = el_7.children;
			return 1 + (Array.isArray(kids) ? kids.reduce((s_9, c_9) => s_9 + countCapturedNodes(c_9), 0) : 0);
		};
		$[651] = countCapturedNodes;
	} else countCapturedNodes = $[651];
	const applyDropPosition = _temp74;
	let t282;
	if ($[652] !== addPastedElementToCanvas || $[653] !== resolveCapturedComponents) {
		t282 = (raw, dropPosition, opts_2) => {
			const total = countCapturedNodes(raw);
			const toastId_2 = toast.loading("Pasting…");
			const counter_1 = { n: 0 };
			let resolved;
			let rootId_2;
			const isPageCapture = opts_2?.fromChromeExt === true;
			try {
				resolved = dropUnplaceableChildren(resolveCapturedComponents(raw, counter_1));
				applyDropPosition(resolved, dropPosition);
				if (isPageCapture) rootId_2 = withFlexShrinkInsertsSkipped(() => addPastedElementToCanvas(resolved, opts_2));
				else rootId_2 = addPastedElementToCanvas(resolved, opts_2);
			} catch (t283) {
				console.error("[paste] failed to insert captured element:", t283);
				toast.error("Could not paste capture.", {
					id: toastId_2,
					duration: 3e3
				});
				return;
			}
			if ((opts_2 ? opts_2.fromChromeExt : void 0) && rootId_2 && pasteHasResolvingClasses(resolved, document)) setPasteStyleSuggestion({
				rootId: rootId_2,
				nodeCount: total
			});
			setTimeout(() => {
				const els = `${total} element${total === 1 ? "" : "s"}`;
				const msg = counter_1.n > 0 ? `Pasted ${els}, ${counter_1.n} component${counter_1.n === 1 ? "" : "s"}` : `Pasted ${els}`;
				toast.success(msg, {
					id: toastId_2,
					duration: 3e3
				});
			}, 450);
		};
		$[652] = addPastedElementToCanvas;
		$[653] = resolveCapturedComponents;
		$[654] = t282;
	} else t282 = $[654];
	const pasteCapturedElement = t282;
	let t283;
	if ($[655] !== pasteCapturedElement) {
		t283 = (raw_0, at) => {
			let dropPosition_0;
			if ("clientX" in at) {
				const viewportRect_2 = viewportRef.current?.getBoundingClientRect();
				const canvasRect_1 = canvasRef.current?.getBoundingClientRect();
				if (!viewportRect_2 || !canvasRect_1) return;
				const px = at.pointerX ?? at.clientX;
				const py = at.pointerY ?? at.clientY;
				if (!(px >= viewportRect_2.left && px <= viewportRect_2.right && py >= viewportRect_2.top && py <= viewportRect_2.bottom)) return;
				const { scale: scale_2 } = getCamera();
				dropPosition_0 = {
					x: (at.clientX - canvasRect_1.left) / scale_2,
					y: (at.clientY - canvasRect_1.top) / scale_2
				};
			} else dropPosition_0 = {
				x: at.canvasX,
				y: at.canvasY
			};
			pasteCapturedElement(raw_0, dropPosition_0, {
				atRoot: true,
				fromChromeExt: false
			});
		};
		$[655] = pasteCapturedElement;
		$[656] = t283;
	} else t283 = $[656];
	const handlePlaceCapturedElement = t283;
	let onPasteElement;
	let t284;
	if ($[657] !== activeTabId || $[658] !== addPastedElementToCanvas || $[659] !== componentIndex || $[660] !== figmaImageResolver || $[661] !== iconLibraries || $[662] !== pasteCapturedElement || $[663] !== pasteIntoContainers || $[664] !== readOnly || $[665] !== uploadImage) {
		onPasteElement = async (clipboardData_1, dropPosition_1, cursorClientPoint, opts_3) => {
			if (!activeTabId) return;
			const selectionAtEvent = getSelectedElementIds();
			const isPanelDrag = isCanvasInsertDrag(clipboardData_1);
			const atRoot = opts_3?.atRoot || isPanelDrag || !!cursorClientPoint;
			const dropParentFor = (child) => {
				if (!cursorClientPoint) return null;
				return findContainerAt(cursorClientPoint.clientX, cursorClientPoint.clientY, child, _temp75)?.getAttribute("data-element-id") ?? null;
			};
			const insertHtmlMarkup = async (markup) => {
				let jsx;
				try {
					jsx = htmlToJsx(markup);
				} catch {
					return false;
				}
				if (!jsx) return false;
				let parsedStore;
				try {
					parsedStore = parseJSX(jsx, iconLibraries, componentIndex, void 0, { forceNewIds: true });
				} catch {
					return false;
				}
				const els_0 = getRootIds(parsedStore).map((id_29) => storeSubtreeToLegacyNested(parsedStore, id_29));
				if (els_0.length === 0) return false;
				if (els_0.length === 1) {
					applyDropPosition(els_0[0], dropPosition_1);
					addPastedElementToCanvas(els_0[0], {
						atRoot,
						parentId: dropParentFor(els_0[0]),
						selection: selectionAtEvent
					});
				} else await pasteMultipleElements(els_0, {
					atRoot,
					dropPosition: dropPosition_1,
					parentId: dropParentFor(els_0[0]),
					selection: selectionAtEvent
				});
				return true;
			};
			let clipboardText_0 = null;
			let clipboardHtml = null;
			let clipboardMediaFiles = [];
			if (clipboardData_1) {
				clipboardText_0 = clipboardData_1.getData("text/plain") || null;
				clipboardHtml = clipboardData_1.getData("text/html") || null;
				clipboardMediaFiles = Array.from(clipboardData_1.items).filter(_temp76).map(_temp77).filter(_temp78);
			} else try {
				clipboardText_0 = await navigator.clipboard.readText();
			} catch {}
			if (clipboardText_0) {
				let parsed;
				try {
					parsed = JSON.parse(clipboardText_0);
				} catch {
					parsed = null;
				}
				if (parsed && parsed.__petal && parsed.__multi && Array.isArray(parsed.elements)) {
					await pasteMultipleElements(parsed.elements, {
						atRoot,
						dropPosition: dropPosition_1,
						sources: parsed.sources,
						parentId: dropParentFor(parsed.elements[0]),
						selection: selectionAtEvent
					});
					return;
				}
				if (parsed && parsed.__petal && parsed.element) {
					const fromChromeExt_0 = typeof parsed.__schema === "string";
					pasteCapturedElement(parsed.element, dropPosition_1, {
						atRoot,
						fromChromeExt: fromChromeExt_0,
						parentId: dropParentFor(parsed.element),
						selection: selectionAtEvent
					});
					return;
				}
			}
			if (clipboardHtml && isFigmaClipboardHtml(clipboardHtml)) {
				let phase1;
				try {
					phase1 = convertFigmaClipboardHtmlSync(clipboardHtml);
				} catch (t285) {
					console.error("[paste] failed to paste from Figma:", t285);
					toast.error("Failed to paste from Figma", { duration: 3e3 });
					return;
				}
				if (phase1 && phase1.elements.length > 0) {
					const { elements: elements_4, imageHashes } = phase1;
					let pastedRootIds = [];
					if (elements_4.length === 1) {
						applyDropPosition(elements_4[0], dropPosition_1);
						const rootId_3 = addPastedElementToCanvas(elements_4[0], {
							atRoot,
							parentId: dropParentFor(elements_4[0]),
							selection: selectionAtEvent
						});
						if (rootId_3) pastedRootIds = [rootId_3];
					} else pastedRootIds = await pasteMultipleElements(elements_4, {
						atRoot,
						dropPosition: dropPosition_1,
						parentId: dropParentFor(elements_4[0]),
						selection: selectionAtEvent
					});
					const needsImageLoad = imageHashes.length > 0 && figmaImageResolver && pastedRootIds.length > 0;
					const toastId_3 = needsImageLoad ? toast.loading("Loading images from Figma") : toast.success("Pasted from Figma", { duration: 3e3 });
					if (needsImageLoad && figmaImageResolver) {
						const phase1Snapshot = phase1;
						const rootsSnapshot = pastedRootIds;
						const resolveImages = figmaImageResolver;
						(async () => {
							let urls;
							try {
								urls = await resolveImages({
									fileKey: phase1Snapshot.parsed.meta.fileKey,
									imageHashes: phase1Snapshot.imageHashes
								});
							} catch (t286) {
								console.error("[paste] failed to load Figma images:", t286);
								toast.error("Failed to load images from Figma", {
									id: toastId_3,
									duration: 3e3
								});
								return;
							}
							if (urls === "skip") {
								toast.success("Pasted from Figma", {
									id: toastId_3,
									duration: 3e3
								});
								return;
							}
							const patches = buildFigmaImageStylePatches(phase1Snapshot.parsed, phase1Snapshot.pendingImagePatches, urls);
							if (patches.length > 0) usePages.getState().patchTrees((prev_22) => applyFigmaImagePatchesToStore(prev_22, rootsSnapshot, patches));
							toast.success("Pasted from Figma", {
								id: toastId_3,
								duration: 3e3
							});
						})();
					}
					return;
				}
			}
			if (clipboardText_0 && looksLikeHTML(clipboardText_0)) {
				let parsedStore_0;
				try {
					parsedStore_0 = parseJSX(clipboardText_0.replace(/(?<=\s)class=/g, "className=").replace(/(?<=\s)for=/g, "htmlFor="), iconLibraries, componentIndex, void 0, { forceNewIds: true });
				} catch {
					parsedStore_0 = void 0;
				}
				if (parsedStore_0) {
					const jsxElements = getRootIds(parsedStore_0).map((id_30) => storeSubtreeToLegacyNested(parsedStore_0, id_30));
					if (jsxElements.length > 0) {
						if (jsxElements.length === 1) {
							applyDropPosition(jsxElements[0], dropPosition_1);
							addPastedElementToCanvas(jsxElements[0], {
								atRoot,
								parentId: dropParentFor(jsxElements[0]),
								selection: selectionAtEvent
							});
						} else await pasteMultipleElements(jsxElements, {
							atRoot,
							dropPosition: dropPosition_1,
							parentId: dropParentFor(jsxElements[0]),
							selection: selectionAtEvent
						});
						return;
					}
				}
			}
			if (clipboardHtml && await insertHtmlMarkup(clipboardHtml)) return;
			if (clipboardText_0 && looksLikeHTML(clipboardText_0) && await insertHtmlMarkup(clipboardText_0)) return;
			const mediaCols = Math.ceil(Math.sqrt(clipboardMediaFiles.length));
			const mediaBase = dropPosition_1 ?? getPasteCanvasPosition() ?? {
				x: 20,
				y: 20
			};
			let mediaCol = 0;
			let mediaCursorX = 0;
			let mediaRowTop = 0;
			let mediaRowMaxH = 0;
			for (const file_0 of clipboardMediaFiles) {
				if (file_0.type === "image/svg+xml" && await insertHtmlMarkup(await file_0.text())) continue;
				const isVideo = file_0.type.startsWith("video/");
				let width = 400;
				let height = 300;
				if (isVideo) {
					const dims = await getVideoDimensions(file_0);
					if (dims) {
						width = dims.width;
						height = dims.height;
					}
				} else {
					let bmp;
					try {
						bmp = await createImageBitmap(file_0);
					} catch {
						bmp = void 0;
					}
					if (bmp) {
						width = bmp.width;
						height = bmp.height;
						if (typeof bmp.close === "function") bmp.close();
					}
				}
				const previewUrl = isVideo ? void 0 : URL.createObjectURL(file_0);
				const placeholder = isVideo ? createVideoElement("") : createImageElement("");
				placeholder.styles = {
					...placeholder.styles,
					width,
					height
				};
				const baseProps = { ...placeholder.props };
				placeholder.canvasPosition = {
					x: mediaBase.x + mediaCursorX,
					y: mediaBase.y + mediaRowTop
				};
				mediaCursorX = mediaCursorX + (width + 20);
				mediaRowMaxH = Math.max(mediaRowMaxH, height);
				if (++mediaCol >= mediaCols) {
					mediaCol = 0;
					mediaCursorX = 0;
					mediaRowTop = mediaRowTop + (mediaRowMaxH + 20);
					mediaRowMaxH = 0;
				}
				const placeholderId = addPastedElementToCanvas(placeholder, {
					atRoot,
					parentId: dropParentFor(placeholder),
					selection: selectionAtEvent
				});
				const markedProps = {
					...baseProps,
					"data-uploading": "true",
					...previewUrl ? { "data-upload-preview": previewUrl } : {}
				};
				if (placeholderId) {
					const markerOp = createSetPropsOperation(usePages.getState().tree, placeholderId, markedProps);
					if (markerOp) usePages.getState().applyTransientOps([markerOp]);
				}
				const clearOpFor = (tree_3) => placeholderId ? createSetPropsOperation(tree_3, placeholderId, baseProps) : null;
				const toastId_4 = toast.loading(`Adding ${file_0.name || (isVideo ? "video" : "image")}…`);
				const result_5 = await fileToUrl(file_0, readOnly ? void 0 : uploadImage);
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				if (result_5.error || !result_5.src) {
					if (placeholderId) {
						const clearOp = clearOpFor(usePages.getState().tree);
						if (clearOp) usePages.getState().applyTransientOps([clearOp]);
					}
					if (result_5.error) toast.error(result_5.errorMessage || `Failed to paste ${isVideo ? "video" : "image"}`, { id: toastId_4 });
					else toast.dismiss(toastId_4);
					continue;
				}
				if (placeholderId) {
					const newProps_0 = isVideo ? {
						src: result_5.src,
						controls: true
					} : {
						src: result_5.src,
						alt: "Image"
					};
					const clearOp_0 = clearOpFor(usePages.getState().tree);
					if (clearOp_0) usePages.getState().applyTransientOps([clearOp_0]);
					const cleared = usePages.getState().tree;
					const setOp = createSetPropsOperation(cleared, placeholderId, newProps_0);
					if (setOp) usePages.getState().applyOps([setOp]);
				}
				toast.dismiss(toastId_4);
			}
			if (clipboardMediaFiles.length > 0) return;
			const result_6 = await readElementFromClipboard(readOnly ? void 0 : uploadImage);
			if (result_6.error) {
				toast.error(result_6.errorMessage || "Failed to paste image");
				return;
			}
			if (result_6.element) {
				applyDropPosition(result_6.element, dropPosition_1);
				addPastedElementToCanvas(result_6.element, { selection: selectionAtEvent });
			}
		};
		const pasteMultipleElements = async (elementsToPaste, opts_4) => {
			if (!activeTabId || elementsToPaste.length === 0) return [];
			const selection_1 = opts_4?.selection ?? getSelectedElementIds();
			const ops_10 = [];
			const newIds_1 = [];
			const pastedIds = new Set(elementsToPaste.map(_temp79));
			if (!opts_4?.atRoot && !opts_4?.parentId) {
				const targets_1 = resolveMultiPasteTargets(usePages.getState().tree, selection_1, elementsToPaste);
				if (targets_1.length > 0) return pasteIntoContainers(targets_1, elementsToPaste, opts_4?.sources);
			}
			const solePasteId = soleSelectedElementId(selection_1);
			let targetId_7 = opts_4?.parentId ?? (opts_4?.atRoot ? null : solePasteId ?? null);
			if (!opts_4?.parentId && !opts_4?.atRoot && solePasteId && pastedIds.has(solePasteId)) {
				const parentKey_3 = getParentId(usePages.getState().tree, solePasteId);
				targetId_7 = parentKey_3 === "ROOT" || parentKey_3 === null ? null : parentKey_3;
			}
			const targetElement_0 = targetId_7 ? getById(usePages.getState().tree, targetId_7) : null;
			if (!!targetElement_0 && hasChildren$1(targetElement_0) && elementsToPaste.every((el_9) => canAcceptChild(targetElement_0, el_9))) {
				const childrenCount_0 = getChildren$2(usePages.getState().tree, targetId_7).length;
				for (const el_10 of elementsToPaste) {
					const cloned_0 = cloneElementWithNewIds(el_10);
					ops_10.push(createInsertOperation(cloned_0, targetId_7, childrenCount_0 + ops_10.length));
					newIds_1.push(cloned_0.id);
				}
			} else {
				let minX = Infinity;
				let minY = Infinity;
				let hasExplicitPositions = false;
				for (const el_11 of elementsToPaste) if (el_11.canvasPosition) {
					hasExplicitPositions = true;
					minX = Math.min(minX, el_11.canvasPosition.x);
					minY = Math.min(minY, el_11.canvasPosition.y);
				}
				let basePosition = {
					x: 20,
					y: 20
				};
				if (opts_4?.dropPosition) basePosition = opts_4.dropPosition;
				else if (hasExplicitPositions && minX !== Infinity && minY !== Infinity) basePosition = {
					x: minX,
					y: minY
				};
				else basePosition = getPasteCanvasPosition() ?? basePosition;
				if (minX === Infinity) minX = 0;
				if (minY === Infinity) minY = 0;
				for (const el_12 of elementsToPaste) {
					const cloned_1 = cloneElementWithNewIds(el_12);
					stripRootPositioning(cloned_1);
					if (el_12.canvasPosition) cloned_1.canvasPosition = {
						x: basePosition.x + (el_12.canvasPosition.x - minX),
						y: basePosition.y + (el_12.canvasPosition.y - minY)
					};
					else cloned_1.canvasPosition = basePosition;
					ops_10.push(createInsertOperation(cloned_1, null, getRootIds(usePages.getState().tree).length + ops_10.length));
					newIds_1.push(cloned_1.id);
				}
			}
			if (ops_10.length > 0) {
				usePages.getState().applyOps(ops_10);
				useSelection.getState().select(new Set(newIds_1));
			}
			return newIds_1;
		};
		t284 = (jsx_0, elements_5) => {
			const dataTransfer = new DataTransfer();
			dataTransfer.setData("text/plain", elements_5?.length ? createCompositionDragPayload(elements_5) : jsx_0);
			dataTransfer.setData(COMPOSITION_DRAG_MIME, "1");
			onPasteElement(dataTransfer);
		};
		$[657] = activeTabId;
		$[658] = addPastedElementToCanvas;
		$[659] = componentIndex;
		$[660] = figmaImageResolver;
		$[661] = iconLibraries;
		$[662] = pasteCapturedElement;
		$[663] = pasteIntoContainers;
		$[664] = readOnly;
		$[665] = uploadImage;
		$[666] = onPasteElement;
		$[667] = t284;
	} else {
		onPasteElement = $[666];
		t284 = $[667];
	}
	const pasteCompositionJsx = t284;
	let t285;
	if ($[668] !== activeTab?.canvasId || $[669] !== activeTabId || $[670] !== componentIndex || $[671] !== createComponent || $[672] !== onComponentCreated || $[673] !== onPlanLimit) {
		t285 = async (componentName_5) => {
			const selectedElementId_1 = soleSelectedElementId(getSelectedElementIds());
			if (!selectedElementId_1) {
				console.error("Cannot create component: no element selected");
				return;
			}
			if (!activeTab?.canvasId) {
				console.error("Cannot create component: not in a valid canvas tab");
				return;
			}
			const element_10 = getById(usePages.getState().tree, selectedElementId_1);
			if (!element_10) {
				console.error("Selected element not found");
				return;
			}
			const elementWithSubtree = storeSubtreeToLegacyNested(usePages.getState().tree, selectedElementId_1);
			const targetFilePath = `components/${componentName_5}.tsx`;
			const code = generateCompleteFile({
				componentName: componentName_5,
				store: ensureV2([JSON.parse(JSON.stringify(elementWithSubtree))]),
				componentIndex,
				targetFilePath
			});
			const result_7 = await createComponent({
				componentName: componentName_5,
				code,
				sourceFilePath: targetFilePath
			});
			if (!result_7.success) {
				console.error("Failed to create component:", result_7.error);
				if (result_7.reason && isPlanLimitReason(result_7.reason)) {
					const description = result_7.error ?? "This action is over the limit for your plan.";
					onPlanLimit?.({
						reason: result_7.reason,
						message: description
					});
					return;
				}
				toast.error(`Failed to create component: ${result_7.error}`);
				return;
			}
			toast.success(`Created component: ${componentName_5}`);
			if (onComponentCreated && result_7.path) await onComponentCreated(componentName_5, result_7.path, code);
			const componentElement_0 = {
				id: generatePrefixedId("component"),
				type: "component",
				componentName: componentName_5,
				props: {},
				...!hasChildren$1(element_10) || element_10.canvasPosition ? { canvasPosition: element_10.canvasPosition } : {}
			};
			const op_21 = createReplaceOperation(usePages.getState().tree, selectedElementId_1, componentElement_0);
			if (op_21 && activeTabId) usePages.getState().applyOps([op_21]);
			useSelection.getState().clearSelection();
		};
		$[668] = activeTab?.canvasId;
		$[669] = activeTabId;
		$[670] = componentIndex;
		$[671] = createComponent;
		$[672] = onComponentCreated;
		$[673] = onPlanLimit;
		$[674] = t285;
	} else t285 = $[674];
	const onCreateComponent = t285;
	let t286;
	if ($[675] !== activeTabId) {
		t286 = (opts_5) => {
			const selectedIds_0 = Array.from(getSelectedElementIds());
			if (selectedIds_0.length === 0 || !activeTabId) return;
			const store_4 = usePages.getState().tree;
			const rectsById = /* @__PURE__ */ new Map();
			for (const id_31 of selectedIds_0) {
				const rect_5 = getElementRect$1(id_31);
				if (rect_5) rectsById.set(id_31, rect_5);
			}
			if (rectsById.size === 0) return;
			const rects = Array.from(rectsById.values());
			const layoutDirection = inferSelectionLayoutDirection(rects);
			const ids_4 = sortIdsByLayoutDirection(selectedIds_0, rectsById, layoutDirection);
			const left = Math.min(...rects.map(_temp80));
			const top = Math.min(...rects.map(_temp81));
			const bbox = {
				left,
				top,
				width: Math.max(...rects.map(_temp82)) - left,
				height: Math.max(...rects.map(_temp83)) - top
			};
			const canvasRect_2 = canvasRef.current?.getBoundingClientRect();
			if (!canvasRect_2) return;
			const { scale: scale_3 } = getCamera();
			const firstId = ids_4[0];
			const first = getById(store_4, firstId);
			if (!first) return;
			const parentKey_4 = getParentId(store_4, firstId);
			const parentId_2 = parentKey_4 === "ROOT" || parentKey_4 === null ? null : parentKey_4;
			const insertIndex = getIndex(store_4, firstId);
			if (insertIndex < 0) return;
			const container = opts_5.makeContainer({
				first,
				layoutDirection,
				bbox,
				scale: scale_3,
				canvasRect: canvasRect_2
			});
			const ops_11 = [createInsertOperation(container, parentId_2, insertIndex)];
			let cursor_7 = applyOperationsToStore(store_4, ops_11);
			let target_5 = 0;
			for (const id_32 of ids_4) {
				if (opts_5.pinChild) {
					const el_13 = getById(store_4, id_32);
					const rect_6 = rectsById.get(id_32);
					if (el_13 && rect_6) {
						const styleOp_2 = createSetStylesOperation(cursor_7, id_32, opts_5.pinChild({
							el: el_13,
							rect: rect_6,
							bbox,
							scale: scale_3
						}));
						if (styleOp_2) {
							ops_11.push(styleOp_2);
							cursor_7 = applyOperationsToStore(cursor_7, [styleOp_2]);
						}
					}
				}
				const move_0 = createMoveOperation(cursor_7, id_32, container.id, target_5);
				if (move_0) {
					ops_11.push(move_0);
					cursor_7 = applyOperationsToStore(cursor_7, [move_0]);
					target_5 = target_5 + 1;
				}
			}
			usePages.getState().applyOps(ops_11);
			useSelection.getState().select(/* @__PURE__ */ new Set([container.id]));
		};
		$[675] = activeTabId;
		$[676] = t286;
	} else t286 = $[676];
	const wrapSelectionInContainer = t286;
	let t287;
	if ($[677] !== readOnly || $[678] !== wrapSelectionInContainer) {
		t287 = () => {
			if (readOnly) return;
			wrapSelectionInContainer({ makeContainer: _temp84 });
		};
		$[677] = readOnly;
		$[678] = wrapSelectionInContainer;
		$[679] = t287;
	} else t287 = $[679];
	const onWrapInDiv = t287;
	let t288;
	if ($[680] !== readOnly || $[681] !== wrapSelectionInContainer) {
		t288 = () => {
			if (readOnly) return;
			wrapSelectionInContainer({
				makeContainer: _temp85,
				pinChild: _temp86
			});
		};
		$[680] = readOnly;
		$[681] = wrapSelectionInContainer;
		$[682] = t288;
	} else t288 = $[682];
	const onFrameSelection = t288;
	let t289;
	if ($[683] !== activeTabId || $[684] !== readOnly) {
		t289 = () => {
			if (readOnly || !activeTabId) return;
			const store_5 = usePages.getState().tree;
			const candidates = Array.from(getSelectedElementIds()).filter((id_33) => canUnwrap(store_5, id_33));
			const frameIds = candidates.filter((id_34) => !candidates.some((other) => other !== id_34 && isDescendant(store_5, other, id_34)));
			if (frameIds.length === 0) return;
			const canvasRect_4 = canvasRef.current?.getBoundingClientRect();
			if (!canvasRect_4) return;
			const { scale: scale_6 } = getCamera();
			const plans = [];
			for (const frameId of frameIds) {
				const placement = unwrapPlacement(store_5, frameId);
				const frameRect = getElementRect$1(frameId);
				const raw_1 = document.querySelector(`[data-element-id="${CSS.escape(frameId)}"]`);
				const frameNode = raw_1 ? resolveVisibleElement$1(raw_1) : null;
				if (!frameRect || !(frameNode instanceof HTMLElement)) continue;
				const boxes = /* @__PURE__ */ new Map();
				for (const childId_2 of getChildren$2(store_5, frameId)) {
					const rect_8 = getElementRect$1(childId_2);
					if (!rect_8) continue;
					const { marginLeft, marginTop } = getElementComputedMargins(childId_2);
					const x = placement === "root" ? (rect_8.left - canvasRect_4.left) / scale_6 : frameNode.offsetLeft + (rect_8.left - frameRect.left) / scale_6;
					const y = placement === "root" ? (rect_8.top - canvasRect_4.top) / scale_6 : frameNode.offsetTop + (rect_8.top - frameRect.top) / scale_6;
					boxes.set(childId_2, {
						x: x - marginLeft,
						y: y - marginTop,
						width: rect_8.width / scale_6,
						height: rect_8.height / scale_6
					});
				}
				plans.push({
					frameId,
					boxes
				});
			}
			const ops_12 = [];
			let cursor_8 = store_5;
			const freed = [];
			for (const { frameId: frameId_0, boxes: boxes_0 } of plans) {
				const childIds = getChildren$2(cursor_8, frameId_0);
				const frameOps = buildUnwrapOps(cursor_8, frameId_0, boxes_0);
				if (frameOps.length === 0) continue;
				ops_12.push(...frameOps);
				cursor_8 = applyOperationsToStore(cursor_8, frameOps);
				freed.push(...childIds);
			}
			if (ops_12.length === 0) return;
			usePages.getState().applyOps(ops_12);
			useSelection.getState().select(new Set(freed));
		};
		$[683] = activeTabId;
		$[684] = readOnly;
		$[685] = t289;
	} else t289 = $[685];
	const onUnwrap = t289;
	let t290;
	if ($[686] !== chatBackend) {
		t290 = async (filePath_6) => {
			const match = openCodeFilesRef.current.find((f_8) => f_8.path === filePath_6 || f_8.path.endsWith("/" + filePath_6) || filePath_6.endsWith("/" + f_8.path));
			if (!match) return;
			const readFileRaw_0 = chatBackend ? chatBackend.readFileRaw : void 0;
			if (!readFileRaw_0) return;
			let content_6;
			try {
				content_6 = await readFileRaw_0(match.path);
			} catch {
				return;
			}
			if (content_6 != null) setOpenCodeFiles((prev_23) => prev_23.map((f_9) => f_9.path === match.path ? {
				...f_9,
				content: content_6
			} : f_9));
		};
		$[686] = chatBackend;
		$[687] = t290;
	} else t290 = $[687];
	const refreshOpenCodeFile = t290;
	const refreshOpenCodeFileRef = (0, import_react.useRef)(refreshOpenCodeFile);
	let t291;
	if ($[688] !== refreshOpenCodeFile) {
		t291 = () => {
			refreshOpenCodeFileRef.current = refreshOpenCodeFile;
		};
		$[688] = refreshOpenCodeFile;
		$[689] = t291;
	} else t291 = $[689];
	(0, import_react.useLayoutEffect)(t291);
	let t292;
	if ($[690] === Symbol.for("react.memo_cache_sentinel")) {
		t292 = async (filePath_7) => {
			if (isCompositionFile(filePath_7)) setCompositionRefreshKey(_temp87);
			refreshOpenCodeFileRef.current(filePath_7);
		};
		$[690] = t292;
	} else t292 = $[690];
	const refreshFocusedComponent = t292;
	const refreshFocusedComponentRef = (0, import_react.useRef)(refreshFocusedComponent);
	let t293;
	if ($[691] === Symbol.for("react.memo_cache_sentinel")) {
		t293 = () => {
			refreshFocusedComponentRef.current = refreshFocusedComponent;
		};
		$[691] = t293;
	} else t293 = $[691];
	(0, import_react.useLayoutEffect)(t293);
	let t294;
	let t295;
	if ($[692] !== onFileChangedRef) {
		t294 = () => {
			if (onFileChangedRef) {
				onFileChangedRef.current = (filePath_8) => {
					refreshFocusedComponentRef.current(filePath_8);
				};
				return () => {
					onFileChangedRef.current = null;
				};
			}
		};
		t295 = [onFileChangedRef];
		$[692] = onFileChangedRef;
		$[693] = t294;
		$[694] = t295;
	} else {
		t294 = $[693];
		t295 = $[694];
	}
	(0, import_react.useEffect)(t294, t295);
	let t296;
	if ($[695] === Symbol.for("react.memo_cache_sentinel")) {
		t296 = /* @__PURE__ */ new Set();
		$[695] = t296;
	} else t296 = $[695];
	const unsavedPageIdsRef = (0, import_react.useRef)(t296);
	const previewCaptureRef = (0, import_react.useRef)(null);
	const previewDrawnAtRef = (0, import_react.useRef)(-Infinity);
	const previewFingerprintRef = (0, import_react.useRef)(previewFingerprint);
	let t297;
	let t298;
	if ($[696] !== previewFingerprint) {
		t297 = () => {
			previewFingerprintRef.current = previewFingerprint;
		};
		t298 = [previewFingerprint];
		$[696] = previewFingerprint;
		$[697] = t297;
		$[698] = t298;
	} else {
		t297 = $[697];
		t298 = $[698];
	}
	(0, import_react.useEffect)(t297, t298);
	const previewFingerprintCacheRef = (0, import_react.useRef)(null);
	let t299;
	if ($[699] !== onSetPreviewElement) {
		t299 = async (rootId_4) => {
			if (!onSetPreviewElement) return;
			try {
				await onSetPreviewElement(rootId_4);
			} catch {
				toast.error("Failed to update thumbnail");
				return;
			}
			toast.success(rootId_4 ? "Thumbnail set" : "Default thumbnail restored");
		};
		$[699] = onSetPreviewElement;
		$[700] = t299;
	} else t299 = $[700];
	const setPreviewElement = t299;
	let t300;
	if ($[701] !== activePageId || $[702] !== getPreviewBuildKey) {
		t300 = async (rootId_5) => {
			const buildKey = getPreviewBuildKey ? getPreviewBuildKey() : "";
			if (buildKey === null) return null;
			const background_0 = pageBackgroundByCanvasRef.current.get(activePageId);
			const prefix = JSON.stringify([
				rootId_5,
				activePageId,
				background_0?.color ?? null,
				background_0?.token ?? null,
				buildKey
			]);
			const { tree: store_6, pages: pageRecords, activePageId: storePageId } = usePages.getState();
			const cached = previewFingerprintCacheRef.current;
			if (cached && cached.store === store_6 && cached.prefix === prefix) return cached.fingerprint;
			const record = storePageId === null ? void 0 : pageRecords.get(storePageId);
			const pageJson = record?.savedTree === store_6 && record.savedState !== void 0 ? record.savedState : JSON.stringify(toWire(store_6));
			const source_0 = `${prefix.slice(0, -1)},${pageJson}]`;
			const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source_0)));
			const fingerprint = Array.from(digest.subarray(0, 16), _temp88).join("");
			previewFingerprintCacheRef.current = {
				store: store_6,
				prefix,
				fingerprint
			};
			return fingerprint;
		};
		$[701] = activePageId;
		$[702] = getPreviewBuildKey;
		$[703] = t300;
	} else t300 = $[703];
	const fingerprintPreview = t300;
	let t301;
	if ($[704] !== activePageId || $[705] !== fingerprintPreview || $[706] !== pages[0]?.id || $[707] !== previewElementId || $[708] !== previewPinLoaded || $[709] !== readOnly || $[710] !== savePreview) {
		t301 = async (signal_1) => {
			const rootId_6 = previewElementId;
			let inFlight = previewCaptureRef.current;
			while (inFlight && inFlight.rootId !== rootId_6) {
				await inFlight.run;
				inFlight = previewCaptureRef.current;
			}
			if (inFlight) return inFlight.run;
			if (readOnly || !previewPinLoaded || !rootId_6 && activePageId !== pages[0]?.id) return "done";
			const run = (async () => {
				const fingerprint_0 = await fingerprintPreview(rootId_6);
				if (fingerprint_0 === null) return "not-ready";
				if (fingerprint_0 === previewFingerprintRef.current) return "done";
				previewDrawnAtRef.current = performance.now();
				const image = await captureCanvasPreview(rootId_6, signal_1);
				if (signal_1?.aborted) return "aborted";
				if (!image) return "done";
				if ((await savePreview(image, fingerprint_0)).success) previewFingerprintRef.current = fingerprint_0;
				return "done";
			})().catch(_temp89).finally(() => {
				previewCaptureRef.current = null;
			});
			previewCaptureRef.current = {
				rootId: rootId_6,
				run
			};
			return run;
		};
		$[704] = activePageId;
		$[705] = fingerprintPreview;
		$[706] = pages[0]?.id;
		$[707] = previewElementId;
		$[708] = previewPinLoaded;
		$[709] = readOnly;
		$[710] = savePreview;
		$[711] = t301;
	} else t301 = $[711];
	const capturePreview = (0, import_react.useEffectEvent)(t301);
	const previewPendingSinceRef = (0, import_react.useRef)(null);
	const lastInputAtRef = (0, import_react.useRef)(0);
	const previewAbortRef = (0, import_react.useRef)(null);
	let t302;
	if ($[712] !== capturePreview) {
		t302 = async () => {
			const pendingSince = previewPendingSinceRef.current;
			if (pendingSince === null || previewAbortRef.current) return;
			if (performance.now() - Math.max(pendingSince, lastInputAtRef.current) < 3e3) return;
			if (performance.now() - previewDrawnAtRef.current < 3e4) return;
			const controller = new AbortController();
			previewAbortRef.current = controller;
			const result_9 = await capturePreview(controller.signal);
			previewAbortRef.current = null;
			if (result_9 === "done" && previewPendingSinceRef.current === pendingSince) previewPendingSinceRef.current = null;
		};
		$[712] = capturePreview;
		$[713] = t302;
	} else t302 = $[713];
	const runPausedPreview = (0, import_react.useEffectEvent)(t302);
	let t303;
	if ($[714] !== readOnly || $[715] !== runPausedPreview) {
		t303 = () => {
			if (readOnly) return;
			const onInput = () => {
				lastInputAtRef.current = performance.now();
				previewAbortRef.current?.abort();
			};
			const inputs = [
				"pointerdown",
				"pointermove",
				"keydown",
				"wheel"
			];
			for (const type of inputs) window.addEventListener(type, onInput, {
				capture: true,
				passive: true
			});
			const timer = setInterval(() => {
				runPausedPreview();
			}, 1e3);
			return () => {
				for (const type_0 of inputs) window.removeEventListener(type_0, onInput, { capture: true });
				clearInterval(timer);
				previewAbortRef.current?.abort();
			};
		};
		$[714] = readOnly;
		$[715] = runPausedPreview;
		$[716] = t303;
	} else t303 = $[716];
	let t304;
	if ($[717] !== readOnly) {
		t304 = [readOnly];
		$[717] = readOnly;
		$[718] = t304;
	} else t304 = $[718];
	(0, import_react.useEffect)(t303, t304);
	let t305;
	if ($[719] === Symbol.for("react.memo_cache_sentinel")) {
		t305 = /* @__PURE__ */ new Set();
		$[719] = t305;
	} else t305 = $[719];
	const previewedOnLoadRef = (0, import_react.useRef)(t305);
	let t306;
	if ($[720] === Symbol.for("react.memo_cache_sentinel")) {
		t306 = () => {
			previewedOnLoadRef.current.clear();
		};
		$[720] = t306;
	} else t306 = $[720];
	let t307;
	if ($[721] !== previewElementId) {
		t307 = [previewElementId];
		$[721] = previewElementId;
		$[722] = t307;
	} else t307 = $[722];
	(0, import_react.useEffect)(t306, t307);
	const firstPageId = pages[0]?.id;
	let t308;
	if ($[723] !== activeTab || $[724] !== activeTabLoaded || $[725] !== firstPageId || $[726] !== previewElementId || $[727] !== previewPinLoaded || $[728] !== readOnly) {
		t308 = () => {
			if (readOnly || !previewPinLoaded || !activeTabLoaded || !activeTab?.canvasId) return;
			if (!(previewElementId ? getParentId(getTree(), previewElementId) === "ROOT" : activeTab.canvasId === firstPageId) || previewedOnLoadRef.current.has(activeTab.canvasId)) return;
			previewedOnLoadRef.current.add(activeTab.canvasId);
			previewPendingSinceRef.current = performance.now();
		};
		$[723] = activeTab;
		$[724] = activeTabLoaded;
		$[725] = firstPageId;
		$[726] = previewElementId;
		$[727] = previewPinLoaded;
		$[728] = readOnly;
		$[729] = t308;
	} else t308 = $[729];
	const t309 = activeTab?.canvasId;
	let t310;
	if ($[730] !== activeTabLoaded || $[731] !== firstPageId || $[732] !== previewElementId || $[733] !== previewPinLoaded || $[734] !== readOnly || $[735] !== t309) {
		t310 = [
			readOnly,
			previewPinLoaded,
			activeTabLoaded,
			t309,
			firstPageId,
			previewElementId
		];
		$[730] = activeTabLoaded;
		$[731] = firstPageId;
		$[732] = previewElementId;
		$[733] = previewPinLoaded;
		$[734] = readOnly;
		$[735] = t309;
		$[736] = t310;
	} else t310 = $[736];
	(0, import_react.useEffect)(t308, t310);
	let t311;
	if ($[737] !== onCanvasSaved || $[738] !== saveCanvas) {
		t311 = async (canvasId, canvasName, tree_4, wirePayload, currentState) => {
			const savedTree = usePages.getState().pages.get(canvasId)?.savedTree;
			const latestBackground = pageBackgroundByCanvasRef.current.get(canvasId);
			if ((await saveCanvas({
				id: canvasId,
				name: canvasName,
				elements: wirePayload,
				elementsJson: currentState,
				changedElements: savedTree ? [...tree_4.byId.values()].filter((element_11) => savedTree.byId.get(element_11.id) !== element_11) : void 0,
				zoom: activePageIdRef.current === canvasId ? getCamera().scale : void 0,
				backgroundColor: latestBackground?.color,
				backgroundToken: latestBackground?.token
			})).success) {
				usePages.getState().markSaved(canvasId, tree_4, currentState);
				const savedElementCount = countCanvasElements(wirePayload);
				setPages((prev_24) => prev_24.some((p_10) => p_10.id === canvasId && p_10.elementCount !== savedElementCount) ? prev_24.map((p_9) => p_9.id === canvasId ? {
					...p_9,
					elementCount: savedElementCount
				} : p_9) : prev_24);
				onCanvasSaved?.();
				unsavedPageIdsRef.current.delete(canvasId);
				toast.dismiss("canvas-save-error");
				previewPendingSinceRef.current = performance.now();
			} else toast.error("Failed to save page. Will retry on next edit.", {
				id: "canvas-save-error",
				duration: Infinity
			});
		};
		$[737] = onCanvasSaved;
		$[738] = saveCanvas;
		$[739] = t311;
	} else t311 = $[739];
	const persistCanvas = (0, import_react.useEffectEvent)(t311);
	let t312;
	let t313;
	if ($[740] !== readOnly) {
		t312 = () => {
			if (readOnly) return;
			const handleBeforeUnload = (e_3) => {
				if (unsavedPageIdsRef.current.size > 0) e_3.preventDefault();
			};
			window.addEventListener("beforeunload", handleBeforeUnload);
			return () => window.removeEventListener("beforeunload", handleBeforeUnload);
		};
		t313 = [readOnly];
		$[740] = readOnly;
		$[741] = t312;
		$[742] = t313;
	} else {
		t312 = $[741];
		t313 = $[742];
	}
	(0, import_react.useEffect)(t312, t313);
	let t314;
	if ($[743] !== capturePreview) {
		t314 = async () => {
			previewAbortRef.current?.abort();
			if (await capturePreview() === "done") previewPendingSinceRef.current = null;
		};
		$[743] = capturePreview;
		$[744] = t314;
	} else t314 = $[744];
	const flushPreview = (0, import_react.useEffectEvent)(t314);
	let t315;
	if ($[745] !== flushPreview || $[746] !== flushPreviewRef || $[747] !== readOnly) {
		t315 = () => {
			if (readOnly) return;
			const handleVisibilityChange = () => {
				if (document.visibilityState === "hidden") flushPreview();
			};
			document.addEventListener("visibilitychange", handleVisibilityChange);
			if (flushPreviewRef) flushPreviewRef.current = () => flushPreview();
			return () => {
				document.removeEventListener("visibilitychange", handleVisibilityChange);
				if (flushPreviewRef) flushPreviewRef.current = null;
			};
		};
		$[745] = flushPreview;
		$[746] = flushPreviewRef;
		$[747] = readOnly;
		$[748] = t315;
	} else t315 = $[748];
	let t316;
	if ($[749] !== flushPreviewRef || $[750] !== readOnly) {
		t316 = [readOnly, flushPreviewRef];
		$[749] = flushPreviewRef;
		$[750] = readOnly;
		$[751] = t316;
	} else t316 = $[751];
	(0, import_react.useEffect)(t315, t316);
	let t317;
	if ($[752] !== enableSidebarV2) {
		t317 = (e_4) => {
			if (isCodeEditorTarget(e_4)) return;
			e_4.preventDefault();
			if (enableSidebarV2) {
				setSidebarV2Tab("pages");
				pagesSidebarRef.current?.openSearch();
				return;
			}
			setLeftPanelTab("layers");
			requestAnimationFrame(() => layersSearchRef.current?.focus());
		};
		$[752] = enableSidebarV2;
		$[753] = t317;
	} else t317 = $[753];
	useGlobalShortcut("focusLayersSearch", t317);
	let t318;
	if ($[754] === Symbol.for("react.memo_cache_sentinel")) {
		t318 = (e_5) => {
			if (isTypingTarget(e_5)) return;
			e_5.preventDefault();
			previewOpenTriggerRef.current = "shortcut";
			setPreviewOpen(_temp90);
		};
		$[754] = t318;
	} else t318 = $[754];
	useGlobalShortcut("togglePreviewWindow", t318);
	let t319;
	if ($[755] === Symbol.for("react.memo_cache_sentinel")) {
		t319 = (e_6) => {
			if (isTypingTarget(e_6)) return;
			e_6.preventDefault();
			setPreviewOpen(false);
		};
		$[755] = t319;
	} else t319 = $[755];
	useGlobalShortcut("closePreviewWindow", t319, previewOpen);
	let t320;
	if ($[756] !== copySelectionLink) {
		t320 = (e_7) => {
			if (!soleSelectedElementId(getSelectedElementIds())) return;
			if (isTypingTarget(e_7)) return;
			e_7.preventDefault();
			copySelectionLink();
		};
		$[756] = copySelectionLink;
		$[757] = t320;
	} else t320 = $[757];
	useGlobalShortcut("copySelectionLink", t320);
	const [exportRequest, setExportRequest] = (0, import_react.useState)(null);
	let t321;
	let t322;
	if ($[758] !== exportRequest) {
		t321 = () => {
			if (!exportRequest) return;
			return useSelection.subscribe(_temp91, () => setExportRequest(null));
		};
		t322 = [exportRequest];
		$[758] = exportRequest;
		$[759] = t321;
		$[760] = t322;
	} else {
		t321 = $[759];
		t322 = $[760];
	}
	(0, import_react.useEffect)(t321, t322);
	let t323;
	if ($[761] === Symbol.for("react.memo_cache_sentinel")) {
		t323 = (e_8) => {
			if (getSelectedElementIds().size === 0) return;
			if (isTypingTarget(e_8)) return;
			e_8.preventDefault();
			setExportRequest({});
		};
		$[761] = t323;
	} else t323 = $[761];
	useGlobalShortcut("exportSelection", t323);
	let t324;
	if ($[762] === Symbol.for("react.memo_cache_sentinel")) {
		t324 = () => setExportRequest(null);
		$[762] = t324;
	} else t324 = $[762];
	const clearExportRequest = t324;
	let t325;
	if ($[763] === Symbol.for("react.memo_cache_sentinel")) {
		t325 = (e_9) => {
			if (getSelectedElementIds().size === 0) return;
			if (isTypingTarget(e_9)) return;
			e_9.preventDefault();
			copyLayersAsPng(getSelectedElementIds());
		};
		$[763] = t325;
	} else t325 = $[763];
	useGlobalShortcut("copySelectionAsPng", t325);
	let t326;
	if ($[764] !== openSelectedComponentFile) {
		t326 = (e_10) => {
			if (!soleSelectedElementId(getSelectedElementIds())) return;
			if (isTypingTarget(e_10)) return;
			e_10.preventDefault();
			openSelectedComponentFile();
		};
		$[764] = openSelectedComponentFile;
		$[765] = t326;
	} else t326 = $[765];
	useGlobalShortcut("openComponentFile", t326);
	let t327;
	if ($[766] !== revealInsertPanel) {
		t327 = (e_11) => {
			if (isTypingTarget(e_11)) return;
			e_11.preventDefault();
			revealInsertPanel();
		};
		$[766] = revealInsertPanel;
		$[767] = t327;
	} else t327 = $[767];
	useGlobalShortcut("openInsertPanel", t327, !readOnly);
	let t328;
	if ($[768] !== previewOpen || $[769] !== readOnly) {
		t328 = (e_12) => {
			e_12.preventDefault();
			const selection_2 = getSelectedElementIds();
			if (readOnly || previewOpen || isTypingTarget(e_12) || selection_2.size !== 1) return;
			const id_35 = selection_2.values().next().value;
			if (id_35) requestRename(id_35);
		};
		$[768] = previewOpen;
		$[769] = readOnly;
		$[770] = t328;
	} else t328 = $[770];
	useGlobalShortcut("renameLayer", t328);
	const undoLatest = (0, import_react.useEffectEvent)(onUndo);
	const redoLatest = (0, import_react.useEffectEvent)(onRedo);
	let t329;
	if ($[771] !== addToPrompt || $[772] !== handleCaptureCanvasRegion || $[773] !== readOnly) {
		t329 = () => {
			if (readOnly) return;
			const inner = innerPickStore.getState().inner;
			const hit = innerPickStore.currentHit();
			const canvasRect_5 = hit ? canvasRef.current?.getBoundingClientRect() : null;
			if (hit && canvasRect_5) {
				const { scale: scale_7 } = getCamera();
				handleCaptureCanvasRegion({
					x: Math.round((hit.left - canvasRect_5.left) / scale_7),
					y: Math.round((hit.top - canvasRect_5.top) / scale_7),
					width: Math.round(hit.width / scale_7),
					height: Math.round(hit.height / scale_7)
				}, inner?.kind === "webview" ? hit.fingerprint : void 0);
				return;
			}
			const elementIds_7 = [...getSelectedElementIds()];
			addToPrompt((panel_2) => panel_2.addSelectedElements(elementIds_7));
		};
		$[771] = addToPrompt;
		$[772] = handleCaptureCanvasRegion;
		$[773] = readOnly;
		$[774] = t329;
	} else t329 = $[774];
	const addPickOrSelectionToChat = (0, import_react.useEffectEvent)(t329);
	let t330;
	if ($[775] !== addPickOrSelectionToChat) {
		t330 = () => registerPreviewAddToChat(() => addPickOrSelectionToChat());
		$[775] = addPickOrSelectionToChat;
		$[776] = t330;
	} else t330 = $[776];
	let t331;
	if ($[777] === Symbol.for("react.memo_cache_sentinel")) {
		t331 = [];
		$[777] = t331;
	} else t331 = $[777];
	(0, import_react.useEffect)(t330, t331);
	let t332;
	if ($[778] !== activeTabId || $[779] !== addPickOrSelectionToChat || $[780] !== chatAreasShown || $[781] !== chromeHidden || $[782] !== dismissCanvasAreaChrome || $[783] !== onCutElement || $[784] !== onCutElements || $[785] !== onDeleteElements || $[786] !== onDuplicateElements || $[787] !== onFrameSelection || $[788] !== onPasteToReplace || $[789] !== onUnwrap || $[790] !== onWrapInDiv || $[791] !== readOnly || $[792] !== redoLatest || $[793] !== toggleChatAreas || $[794] !== undoLatest) {
		t332 = (e_13) => {
			const selectedElementIds = getSelectedElementIds();
			const selectedElementId_2 = soleSelectedElementId(selectedElementIds);
			if (isAddToPromptShortcut(e_13)) {
				e_13.preventDefault();
				addPickOrSelectionToChat();
				return;
			}
			if (isChatAreasShortcut(e_13) && !readOnly) {
				e_13.preventDefault();
				toggleChatAreas();
				return;
			}
			if (isNewChatShortcut(e_13) && !readOnly) {
				e_13.preventDefault();
				handleNewChat();
				return;
			}
			if (e_13.key === "Escape" && (chatAreasShown() || getAreaHighlight())) {
				dismissCanvasAreaChrome();
				return;
			}
			const target_6 = e_13.target;
			if (target_6.tagName === "INPUT" || target_6.tagName === "TEXTAREA" || target_6.isContentEditable) return;
			if (!readOnly && matchesShortcut(e_13, LOCAL_SHORTCUTS.canvas.toggleInteractive)) {
				const store_7 = usePages.getState().visibleTree;
				const selected_1 = [...getSelectedElementIds()];
				if (selected_1.some((id_36) => getById(store_7, id_36)?.type === "webview")) {
					e_13.preventDefault();
					const { live: live_2, tool } = webviewEditStore.getState();
					webviewEditStore.goLive(live_2 && tool === "capture" ? "interact" : "capture");
					return;
				}
				const ids_5 = selected_1.filter((id_37) => getById(store_7, id_37)?.type === "component");
				if (ids_5.length > 0) {
					e_13.preventDefault();
					for (const id_38 of ids_5) innerPickStore.toggleInteractive(id_38);
					return;
				}
			}
			if ((e_13.metaKey || e_13.ctrlKey) && e_13.key === "\\") {
				e_13.preventDefault();
				setChromeHidden(_temp92);
				return;
			}
			if (e_13.key === "Escape" && chromeHidden) {
				setChromeHidden(false);
				return;
			}
			if (e_13.key === "Escape" && !canvasTookKey(e_13)) {
				if (selectedElementIds.size > 0) {
					const selectedId_1 = Array.from(selectedElementIds)[0];
					const store_8 = usePages.getState().tree;
					const parentKey_5 = getParentId(store_8, selectedId_1);
					const parentId_3 = parentKey_5 === "ROOT" || parentKey_5 === null ? null : parentKey_5;
					if (parentId_3) {
						const grandparentKey = getParentId(store_8, parentId_3);
						const grandparentId = grandparentKey === "ROOT" || grandparentKey === null ? null : grandparentKey;
						useSelection.getState().select(/* @__PURE__ */ new Set([parentId_3]), grandparentId);
					} else useSelection.getState().clearSelection();
					return;
				}
			}
			if (e_13.key === "Enter" && e_13.shiftKey && selectedElementIds.size > 0) {
				e_13.preventDefault();
				const store_9 = usePages.getState().tree;
				const parents = ascendSelection(store_9, selectedElementIds);
				if (parents) {
					const parentId_4 = soleSelectedElementId(parents);
					const grandparentKey_0 = parentId_4 ? getParentId(store_9, parentId_4) : void 0;
					useSelection.getState().select(parents, grandparentKey_0 === void 0 ? void 0 : grandparentKey_0 === "ROOT" ? null : grandparentKey_0);
				}
				return;
			}
			if (e_13.key === "Enter" && !e_13.shiftKey && !e_13.metaKey && !e_13.ctrlKey && !e_13.altKey && !e_13.repeat && selectedElementIds.size > 0 && !target_6.closest(ENTER_OWNER_SELECTOR)) {
				const children_0 = descendSelection(usePages.getState().tree, selectedElementIds);
				if (children_0) {
					e_13.preventDefault();
					useSelection.getState().select(children_0, soleSelectedElementId(selectedElementIds) ?? void 0);
					return;
				}
			}
			if ((e_13.metaKey || e_13.ctrlKey) && !e_13.shiftKey && !e_13.altKey && e_13.key.toLowerCase() === "a") {
				e_13.preventDefault();
				const store_10 = getTree();
				const parents_0 = /* @__PURE__ */ new Set();
				if (selectedElementIds.size === 0) parents_0.add(ROOT);
				for (const id_39 of selectedElementIds) {
					const parentKey_6 = getParentId(store_10, id_39);
					if (parentKey_6 !== null) parents_0.add(parentKey_6);
				}
				const ids_6 = /* @__PURE__ */ new Set();
				for (const parent_2 of parents_0) for (const childId_3 of getChildren$2(store_10, parent_2)) if (getById(store_10, childId_3)?.type !== "text") ids_6.add(childId_3);
				const parentKey_7 = parents_0.size === 1 ? parents_0.values().next().value : void 0;
				useSelection.getState().select(ids_6, parentKey_7 === void 0 ? void 0 : parentKey_7 === "ROOT" ? null : parentKey_7);
				return;
			}
			if ((e_13.metaKey || e_13.ctrlKey) && (e_13.key === "c" || e_13.key === "x")) {
				const selection_3 = window.getSelection();
				if (selection_3 && selection_3.toString().length > 0) return;
			}
			if ((e_13.key === "Delete" || e_13.key === "Backspace") && selectedElementIds.size > 0) {
				e_13.preventDefault();
				onDeleteElements(selectedElementIds);
			}
			if ((e_13.metaKey || e_13.ctrlKey) && !e_13.shiftKey && e_13.key === "z") {
				e_13.preventDefault();
				undoLatest();
			}
			if ((e_13.metaKey || e_13.ctrlKey) && e_13.shiftKey && e_13.key === "z" || (e_13.metaKey || e_13.ctrlKey) && e_13.key === "y") {
				e_13.preventDefault();
				redoLatest();
			}
			if ((e_13.metaKey || e_13.ctrlKey) && e_13.key === "d" && selectedElementIds.size > 0) {
				e_13.preventDefault();
				onDuplicateElements(selectedElementIds);
			}
			if ((e_13.metaKey || e_13.ctrlKey) && !e_13.shiftKey && e_13.key === "c" && selectedElementIds.size > 0) {
				e_13.preventDefault();
				if (selectedElementIds.size === 1) onCopyElement(Array.from(selectedElementIds)[0]);
				else onCopyElements(selectedElementIds);
			}
			if ((e_13.metaKey || e_13.ctrlKey) && e_13.key === "x" && selectedElementIds.size > 0) {
				e_13.preventDefault();
				if (selectedElementIds.size === 1) onCutElement(Array.from(selectedElementIds)[0]);
				else onCutElements(selectedElementIds);
			}
			if ((e_13.metaKey || e_13.ctrlKey) && e_13.shiftKey && e_13.key.toLowerCase() === "r") {
				e_13.preventDefault();
				if (selectedElementIds.size > 0) onPasteToReplace(selectedElementIds);
			}
			if (e_13.altKey && e_13.code === "KeyK" && selectedElementId_2 && (e_13.metaKey && !e_13.ctrlKey || e_13.ctrlKey && !e_13.metaKey)) {
				e_13.preventDefault();
				setShowCreateComponentModal(true);
			}
			if (e_13.shiftKey && e_13.key.toLowerCase() === "a" && selectedElementIds.size > 0) {
				e_13.preventDefault();
				onWrapInDiv();
			}
			if (e_13.code === "KeyG" && (e_13.metaKey && !e_13.ctrlKey || e_13.ctrlKey && !e_13.metaKey)) {
				e_13.preventDefault();
				if (selectedElementIds.size > 0) {
					if (e_13.shiftKey) {
						if (!e_13.altKey) onUnwrap();
					} else onFrameSelection();
				}
			}
			if (ARROW_KEYS.includes(e_13.key)) {
				if (e_13.repeat && nudgeSpent()) {
					e_13.preventDefault();
					return;
				}
				if (!e_13.repeat) setNudgeSpent(false);
			}
			if (ARROW_KEYS.includes(e_13.key) && selectedElementIds.size > 0 && !e_13.metaKey && !e_13.ctrlKey && !e_13.altKey && activeTabId) {
				const store_11 = usePages.getState().tree;
				if (Array.from(selectedElementIds).some((id_40) => isNudgeable(store_11, id_40))) return;
			}
			if (ARROW_KEYS.includes(e_13.key) && selectedElementIds.size > 0 && activeTabId && !e_13.metaKey && !e_13.ctrlKey && !e_13.altKey && !e_13.shiftKey) {
				const steps = planSelectionReorder(usePages.getState().tree, selectedElementIds, e_13.key);
				if (steps.length === 0) return;
				e_13.preventDefault();
				const ops_13 = [];
				let cursor_9 = usePages.getState().tree;
				for (const step of steps) {
					const siblings = step.parentId === null ? getRootIds(cursor_9) : getChildren$2(cursor_9, step.parentId);
					const fromIndex = siblings.indexOf(step.id);
					if (fromIndex === -1) continue;
					const toIndex = fromIndex + step.offset;
					if (toIndex < 0 || toIndex >= siblings.length) continue;
					const moveOp = createMoveOperation(cursor_9, step.id, step.parentId, toIndex);
					if (!moveOp) continue;
					ops_13.push(moveOp);
					cursor_9 = applyOperationsToStore(cursor_9, [moveOp]);
				}
				if (ops_13.length > 0) usePages.getState().applyOps(ops_13);
			}
		};
		$[778] = activeTabId;
		$[779] = addPickOrSelectionToChat;
		$[780] = chatAreasShown;
		$[781] = chromeHidden;
		$[782] = dismissCanvasAreaChrome;
		$[783] = onCutElement;
		$[784] = onCutElements;
		$[785] = onDeleteElements;
		$[786] = onDuplicateElements;
		$[787] = onFrameSelection;
		$[788] = onPasteToReplace;
		$[789] = onUnwrap;
		$[790] = onWrapInDiv;
		$[791] = readOnly;
		$[792] = redoLatest;
		$[793] = toggleChatAreas;
		$[794] = undoLatest;
		$[795] = t332;
	} else t332 = $[795];
	const handleKeyDown = (0, import_react.useEffectEvent)(t332);
	let t333;
	if ($[796] !== onPasteElement) {
		t333 = (e_14) => {
			const target_7 = e_14.target;
			if (target_7?.tagName === "INPUT" || target_7?.tagName === "TEXTAREA" || target_7?.isContentEditable) return;
			e_14.preventDefault();
			const selected_2 = getSelectedElementIds();
			const only = selected_2.size === 1 ? getById(usePages.getState().tree, [...selected_2][0]) : void 0;
			if (only?.type === "webview") onPasteElement(e_14.clipboardData, besidePreview(only), void 0, { atRoot: true });
			else onPasteElement(e_14.clipboardData, getPasteCanvasPosition());
		};
		$[796] = onPasteElement;
		$[797] = t333;
	} else t333 = $[797];
	const handlePaste = (0, import_react.useEffectEvent)(t333);
	let t334;
	if ($[798] !== handleKeyDown || $[799] !== handlePaste || $[800] !== previewOpen || $[801] !== readOnly) {
		t334 = () => {
			if (readOnly || previewOpen) return;
			const handlePointerMove = (e_15) => {
				const p_11 = lastPointerScreenRef.current;
				p_11.x = e_15.clientX;
				p_11.y = e_15.clientY;
				p_11.valid = true;
			};
			window.addEventListener("keydown", handleKeyDown);
			window.addEventListener("paste", handlePaste);
			window.addEventListener("pointermove", handlePointerMove, { passive: true });
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
				window.removeEventListener("paste", handlePaste);
				window.removeEventListener("pointermove", handlePointerMove);
			};
		};
		$[798] = handleKeyDown;
		$[799] = handlePaste;
		$[800] = previewOpen;
		$[801] = readOnly;
		$[802] = t334;
	} else t334 = $[802];
	let t335;
	if ($[803] !== previewOpen || $[804] !== readOnly) {
		t335 = [readOnly, previewOpen];
		$[803] = previewOpen;
		$[804] = readOnly;
		$[805] = t335;
	} else t335 = $[805];
	(0, import_react.useEffect)(t334, t335);
	let t336;
	if ($[806] === Symbol.for("react.memo_cache_sentinel")) {
		t336 = {
			onStart: _temp93,
			onEnd: _temp94
		};
		$[806] = t336;
	} else t336 = $[806];
	const scrubSessionValue = t336;
	let t337;
	if ($[807] === Symbol.for("react.memo_cache_sentinel")) {
		t337 = (id_41) => {
			if (!getSelectedElementIds().has(id_41)) useSelection.getState().select(/* @__PURE__ */ new Set([id_41]));
			contextMenuPointRef.current = null;
		};
		$[807] = t337;
	} else t337 = $[807];
	const handleLayersContextMenuRow = t337;
	let t338;
	if ($[808] !== handleSelectElement) {
		t338 = () => {
			sidebarLayerActionsRef.current = {
				onSelectElement: handleSelectElement,
				onSelectElements: handleSelectElements,
				onDragElements,
				onRenameElement,
				onFocusElement: handleFocusElement,
				onContextMenuRow: handleLayersContextMenuRow
			};
		};
		$[808] = handleSelectElement;
		$[809] = t338;
	} else t338 = $[809];
	(0, import_react.useLayoutEffect)(t338);
	const focusedSessionContainerIdRef = (0, import_react.useRef)(null);
	let t339;
	if ($[810] !== setFocusedComponentEditSession) {
		t339 = (session_3) => {
			const containerId_2 = session_3?.containerId ?? null;
			if (focusedSessionContainerIdRef.current === containerId_2) return;
			focusedSessionContainerIdRef.current = containerId_2;
			setFocusedComponentEditSession(session_3);
		};
		$[810] = setFocusedComponentEditSession;
		$[811] = t339;
	} else t339 = $[811];
	const publishFocusedSession = t339;
	let t340;
	if ($[812] === Symbol.for("react.memo_cache_sentinel")) {
		t340 = () => setPasteStyleSuggestion(null);
		$[812] = t340;
	} else t340 = $[812];
	const clearPasteSuggestion = t340;
	const pasteRootId = pasteStyleSuggestion?.rootId ?? null;
	let t341;
	let t342;
	if ($[813] !== fonts) {
		t341 = () => usePages.subscribe(_temp95, (tree_5) => {
			syncGoogleFontLinks("canvas", canvasGoogleFamilies(tree_5, fonts));
		}, { fireImmediately: true });
		t342 = [fonts];
		$[813] = fonts;
		$[814] = t341;
		$[815] = t342;
	} else {
		t341 = $[814];
		t342 = $[815];
	}
	(0, import_react.useEffect)(t341, t342);
	let t343;
	if ($[816] !== onEnsureComponentNames) {
		t343 = (tree_6) => {
			if (!onEnsureComponentNames) return;
			const names = liveCanvasComponentNames(tree_6);
			if (names.length === 0) return;
			onEnsureComponentNames(names);
		};
		$[816] = onEnsureComponentNames;
		$[817] = t343;
	} else t343 = $[817];
	const ensureComponentNames = (0, import_react.useEffectEvent)(t343);
	let t344;
	if ($[818] !== ensureComponentNames) {
		t344 = () => {
			let lastKey = null;
			return usePages.subscribe(_temp96, (tree_7) => {
				const key_3 = liveCanvasComponentKey(tree_7);
				if (key_3 === lastKey) return;
				lastKey = key_3;
				if (key_3 === "") return;
				ensureComponentNames(tree_7);
			}, { fireImmediately: true });
		};
		$[818] = ensureComponentNames;
		$[819] = t344;
	} else t344 = $[819];
	let t345;
	if ($[820] === Symbol.for("react.memo_cache_sentinel")) {
		t345 = [];
		$[820] = t345;
	} else t345 = $[820];
	(0, import_react.useEffect)(t344, t345);
	let t346;
	if ($[821] === Symbol.for("react.memo_cache_sentinel")) {
		t346 = () => clearPasteSuggestion();
		$[821] = t346;
	} else t346 = $[821];
	const pasteRootMissing = (0, import_react.useEffectEvent)(t346);
	const publishSession = (0, import_react.useEffectEvent)(publishFocusedSession);
	let t347;
	if ($[822] !== pasteRootId || $[823] !== pasteRootMissing || $[824] !== publishSession || $[825] !== stripStaleOwnedDomPropsEvent) {
		t347 = () => {
			const tree_8 = getVisibleTree();
			stripStaleOwnedDomPropsEvent();
			if (pasteRootId && !getById(tree_8, pasteRootId)) pasteRootMissing();
			publishSession(findFocusedComponentEditSession(tree_8, getSelectedElementIds()));
		};
		$[822] = pasteRootId;
		$[823] = pasteRootMissing;
		$[824] = publishSession;
		$[825] = stripStaleOwnedDomPropsEvent;
		$[826] = t347;
	} else t347 = $[826];
	const syncEvent = (0, import_react.useEffectEvent)(t347);
	let t348;
	if ($[827] !== syncEvent) {
		t348 = () => {
			syncEvent();
			const unsubscribeTree = usePages.subscribe(_temp97, () => syncEvent());
			const unsubscribeSelection = useSelection.subscribe(() => syncEvent());
			return () => {
				unsubscribeTree();
				unsubscribeSelection();
			};
		};
		$[827] = syncEvent;
		$[828] = t348;
	} else t348 = $[828];
	let t349;
	if ($[829] !== pasteRootId || $[830] !== readOnly) {
		t349 = [pasteRootId, readOnly];
		$[829] = pasteRootId;
		$[830] = readOnly;
		$[831] = t349;
	} else t349 = $[831];
	(0, import_react.useEffect)(t348, t349);
	const [enqueueCanvasSave] = (0, import_react.useState)(createSaveQueue);
	let t350;
	if ($[832] === Symbol.for("react.memo_cache_sentinel")) {
		t350 = (event) => onActivityRef.current?.(event);
		$[832] = t350;
	} else t350 = $[832];
	const reportActivity = (0, import_react.useEffectEvent)(t350);
	let t351;
	if ($[833] !== pages || $[834] !== reportActivity || $[835] !== tabs_0) {
		t351 = (pageId_7, tree_9, previousTree) => {
			const tab_18 = tabs_0.find((t_11) => t_11.id === pageId_7);
			const canvasId_0 = tab_18?.canvasId;
			if (!tab_18 || !canvasId_0) return "skip";
			const rootCount_0 = getRootIds(tree_9).length;
			if (rootCount_0 >= POPULATED_PAGE_ROOT_COUNT && !populatedPageIdsRef.current.has(canvasId_0)) {
				populatedPageIdsRef.current.add(canvasId_0);
				reportActivity({
					type: "page_populated",
					pageId: canvasId_0,
					elementCount: rootCount_0
				});
			}
			if (isUnconfirmedEmptyPage(tree_9, previousTree, pages.find((p_12) => p_12.id === canvasId_0)?.elementCount ?? 0)) return "skip";
			return "save";
		};
		$[833] = pages;
		$[834] = reportActivity;
		$[835] = tabs_0;
		$[836] = t351;
	} else t351 = $[836];
	const pageSavePlan = (0, import_react.useEffectEvent)(t351);
	let t352;
	if ($[837] !== enqueueCanvasSave || $[838] !== persistCanvas || $[839] !== tabs_0) {
		t352 = (pageId_8) => {
			const record_0 = usePages.getState().pages.get(pageId_8);
			const tab_19 = tabs_0.find((t_12) => t_12.id === pageId_8);
			const canvasId_1 = tab_19?.canvasId;
			if (!record_0 || !tab_19 || !canvasId_1) return;
			const wirePayload_0 = toWire(record_0.tree);
			const currentState_0 = JSON.stringify(wirePayload_0);
			if (currentState_0 === record_0.savedState) {
				usePages.getState().markSaved(pageId_8, record_0.tree, currentState_0);
				unsavedPageIdsRef.current.delete(pageId_8);
				return;
			}
			enqueueCanvasSave(() => persistCanvas(canvasId_1, tab_19.name, record_0.tree, wirePayload_0, currentState_0));
		};
		$[837] = enqueueCanvasSave;
		$[838] = persistCanvas;
		$[839] = tabs_0;
		$[840] = t352;
	} else t352 = $[840];
	const savePageIfDirty = (0, import_react.useEffectEvent)(t352);
	let t353;
	if ($[841] !== pageSavePlan || $[842] !== readOnly || $[843] !== savePageIfDirty) {
		t353 = () => {
			if (readOnly) return;
			const timers = /* @__PURE__ */ new Map();
			const stylesheetPending = /* @__PURE__ */ new Set();
			let lastEdit = usePages.getState().lastHumanEdit;
			const unsubscribe = usePages.subscribe(_temp98, (next_16, prev_25) => {
				const edit = usePages.getState().lastHumanEdit;
				if (edit && edit !== lastEdit && addedUncompiledClasses(edit.ops, _temp99).length > 0) stylesheetPending.add(edit.pageId);
				lastEdit = edit;
				for (const [id_42, timer_0] of timers) {
					if (next_16.has(id_42)) continue;
					clearTimeout(timer_0);
					timers.delete(id_42);
					stylesheetPending.delete(id_42);
					unsavedPageIdsRef.current.delete(id_42);
				}
				for (const [id_43, record_1] of next_16) {
					const before = prev_25.get(id_43);
					if (!before || before.tree === record_1.tree) continue;
					if (pageSavePlan(id_43, record_1.tree, before.tree) !== "save") continue;
					clearTimeout(timers.get(id_43));
					timers.delete(id_43);
					unsavedPageIdsRef.current.add(id_43);
					timers.set(id_43, setTimeout(() => {
						timers.delete(id_43);
						stylesheetPending.delete(id_43);
						savePageIfDirty(id_43);
					}, stylesheetPending.has(id_43) ? 0 : 1e3));
				}
			});
			return () => {
				for (const timer_1 of timers.values()) clearTimeout(timer_1);
				unsubscribe();
			};
		};
		$[841] = pageSavePlan;
		$[842] = readOnly;
		$[843] = savePageIfDirty;
		$[844] = t353;
	} else t353 = $[844];
	let t354;
	if ($[845] !== readOnly) {
		t354 = [readOnly];
		$[845] = readOnly;
		$[846] = t354;
	} else t354 = $[846];
	(0, import_react.useEffect)(t353, t354);
	const noteEdit = (0, import_react.useEffectEvent)(noteCanvasEdit);
	let t355;
	if ($[847] !== noteEdit) {
		t355 = () => usePages.subscribe(_temp100, (edit_0) => {
			if (edit_0) noteEdit(edit_0.pageId, 1, edit_0.opTypes);
		});
		$[847] = noteEdit;
		$[848] = t355;
	} else t355 = $[848];
	let t356;
	if ($[849] === Symbol.for("react.memo_cache_sentinel")) {
		t356 = [];
		$[849] = t356;
	} else t356 = $[849];
	(0, import_react.useEffect)(t355, t356);
	if (protoMode) {
		const t357 = elementParam ?? void 0;
		let t358;
		if ($[850] !== activePageId || $[851] !== pages) {
			t358 = pages.find((p_13) => p_13.id === activePageId)?.name;
			$[850] = activePageId;
			$[851] = pages;
			$[852] = t358;
		} else t358 = $[852];
		let t359;
		if ($[853] !== assetResolver || $[854] !== componentIndex || $[855] !== components || $[856] !== iconLibraries || $[857] !== t357 || $[858] !== t358 || $[859] !== viewportParam) {
			t359 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtoPlayerLive, {
				startId: t357,
				pageName: t358,
				initialViewportSized: viewportParam,
				onViewportSizedChange: _temp101,
				components,
				componentIndex,
				iconLibraries,
				assetResolver
			}) });
			$[853] = assetResolver;
			$[854] = componentIndex;
			$[855] = components;
			$[856] = iconLibraries;
			$[857] = t357;
			$[858] = t358;
			$[859] = viewportParam;
			$[860] = t359;
		} else t359 = $[860];
		return t359;
	}
	let t357;
	if ($[861] !== addToPrompt || $[862] !== copySelectionLink || $[863] !== enableComponentEditV2 || $[864] !== handleEditComponent || $[865] !== mergedComponentIndex || $[866] !== onCopySelectionLink || $[867] !== onFrameSelection || $[868] !== onPasteElement || $[869] !== onPasteToReplace || $[870] !== onSetPreviewElement || $[871] !== onUnwrap || $[872] !== onWrapInDiv || $[873] !== openComponentFile || $[874] !== openHelpDraftInNewChat || $[875] !== previewElementId || $[876] !== readOnly || $[877] !== setPreviewElement) {
		t357 = (targetId_8) => {
			const el_15 = targetId_8 ? getById(getVisibleTree(), targetId_8) : null;
			const isComponent = el_15?.type === "component";
			const isCapture = el_15?.type === "capture";
			const componentName_6 = isComponent ? el_15.componentName : null;
			const componentFilePath = componentName_6 ? mergedComponentIndex[componentName_6]?.path : void 0;
			const thumbnailRootId = targetId_8 ? findRootId(getVisibleTree(), targetId_8) : null;
			const isThumbnail = thumbnailRootId !== null && thumbnailRootId === previewElementId;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				isComponent && componentName_6 && componentFilePath && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					enableComponentEditV2 && !readOnly && targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
						disabled: rendersThroughWebgl(targetId_8),
						onSelect: () => {
							handleEditComponent(targetId_8);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rendersThroughWebgl(targetId_8) ? "Edit component (WebGL — edit the file)" : "Edit component" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						onSelect: () => openHelpDraftInNewChat(`Edit the ${componentName_6} component at ${componentFilePath}.`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit with AI" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {
							width: 14,
							height: 14,
							className: "ml-auto"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						onSelect: () => openComponentFile(componentName_6, componentFilePath),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Open component file" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⌃⌥⌘K" })]
					})
				] }),
				!readOnly && !isComponent && !isCapture && targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
					onSelect: () => setShowCreateComponentModal(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create component" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⌥⌘K" })]
				}),
				!readOnly && targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
					onSelect: () => {
						suppressMenuCloseFocusRef.current = true;
						const selection_4 = getSelectedElementIds();
						const elementIds_8 = selection_4.has(targetId_8) ? [...selection_4] : [targetId_8];
						requestAnimationFrame(() => addToPrompt((panel_3) => panel_3.addSelectedElements(elementIds_8)));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add to prompt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⌘L" })]
				}),
				!readOnly && targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
					onSelect: () => handleRequestRename(targetId_8),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rename" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: GLOBAL_SHORTCUTS.renameLayer.keyLabel })]
				}),
				!readOnly && onSetPreviewElement && thumbnailRootId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
					onSelect: () => {
						setPreviewElement(isThumbnail ? null : thumbnailRootId);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isThumbnail ? "Restore default thumbnail" : "Set as thumbnail" })
				}),
				!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FrameSelectionItem, { onSelect: () => onFrameSelection() }),
				!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexFrameSelectionItem, { onSelect: () => onWrapInDiv() }),
				!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnwrapSelectionItem, { onSelect: () => onUnwrap() }),
				targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
					onSelect: () => {
						const selection_5 = getSelectedElementIds();
						const ids_7 = selection_5.size > 0 ? selection_5 : /* @__PURE__ */ new Set([targetId_8]);
						if (ids_7.size <= 1) onCopyElement(Array.from(ids_7)[0]);
						else onCopyElements(ids_7);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⌘C" })]
				})] }),
				!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
					onSelect: () => {
						const rect_9 = canvasRef.current?.getBoundingClientRect();
						const { scale: scale_8 } = getCamera();
						const pt = contextMenuPointRef.current;
						const dropPosition_2 = rect_9 && pt ? {
							x: (pt.x - rect_9.left) / scale_8,
							y: (pt.y - rect_9.top) / scale_8
						} : void 0;
						onPasteElement(void 0, dropPosition_2, void 0, targetId_8 ? void 0 : { atRoot: true });
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paste here" })
				}),
				!readOnly && onSetPreviewElement && !targetId_8 && previewElementId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
					onSelect: () => {
						setPreviewElement(null);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reset thumbnail" })
				}),
				!readOnly && targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
					onSelect: () => {
						const selection_6 = getSelectedElementIds();
						const ids_8 = selection_6.size > 0 ? selection_6 : /* @__PURE__ */ new Set([targetId_8]);
						onPasteToReplace(ids_8);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paste to replace" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⇧⌘R" })]
				}),
				targetId_8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						onSelect: async () => {
							const jsx_1 = generateJSX(ensureV2([storeSubtreeToLegacyNested(getTree(), targetId_8)]));
							try {
								await navigator.clipboard.writeText(jsx_1);
								toast.success("Copied as React");
							} catch {
								toast.error("Failed to copy as React");
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy as React" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⇧⌘C" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						onSelect: () => {
							const selection_7 = getSelectedElementIds();
							copyLayersAsPng(selection_7.has(targetId_8) ? selection_7 : [targetId_8]);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy as PNG" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: GLOBAL_SHORTCUTS.copySelectionAsPng.keyLabel })]
					}),
					onCopySelectionLink && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						onSelect: async () => {
							await copySelectionLink(targetId_8);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy link to selection" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuShortcut, { children: "⇧⌘L" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
						className: "gap-2",
						onSelect: async () => {
							const ids_9 = Array.from(getSelectedElementIds());
							if (ids_9.length === 0) ids_9.push(targetId_8);
							if (await copyToFigma(ids_9, getCamera().scale)) toast.success("Copied to Figma clipboard - paste in Figma");
							else toast.error("Failed to copy to Figma");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(g$3, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy to Figma" })]
					})
				] })
			] });
		};
		$[861] = addToPrompt;
		$[862] = copySelectionLink;
		$[863] = enableComponentEditV2;
		$[864] = handleEditComponent;
		$[865] = mergedComponentIndex;
		$[866] = onCopySelectionLink;
		$[867] = onFrameSelection;
		$[868] = onPasteElement;
		$[869] = onPasteToReplace;
		$[870] = onSetPreviewElement;
		$[871] = onUnwrap;
		$[872] = onWrapInDiv;
		$[873] = openComponentFile;
		$[874] = openHelpDraftInNewChat;
		$[875] = previewElementId;
		$[876] = readOnly;
		$[877] = setPreviewElement;
		$[878] = t357;
	} else t357 = $[878];
	const renderContextMenuItems = t357;
	let t358;
	if ($[879] === Symbol.for("react.memo_cache_sentinel")) {
		t358 = (id_44) => setEditingTextId(id_44);
		$[879] = t358;
	} else t358 = $[879];
	const handleStartEditText = t358;
	let t359;
	if ($[880] === Symbol.for("react.memo_cache_sentinel")) {
		t359 = () => setEditingTextId(null);
		$[880] = t359;
	} else t359 = $[880];
	const handleStopEditText = t359;
	let t360;
	if ($[881] === Symbol.for("react.memo_cache_sentinel")) {
		t360 = (api) => {
			activeTextEditorRef.current = api;
		};
		$[881] = t360;
	} else t360 = $[881];
	const handleActivateTextEditor = t360;
	let t361;
	if ($[882] === Symbol.for("react.memo_cache_sentinel")) {
		t361 = () => {
			activeTextEditorRef.current = null;
		};
		$[882] = t361;
	} else t361 = $[882];
	const handleDeactivateTextEditor = t361;
	let t362;
	if ($[883] === Symbol.for("react.memo_cache_sentinel")) {
		t362 = (filePath_9, line) => {
			openFileInBottomBarRef.current(filePath_9, { line });
		};
		$[883] = t362;
	} else t362 = $[883];
	const handleOpenFileFromCanvas = t362;
	let t363;
	if ($[884] !== focusedComponentEditSession || $[885] !== savingComponentEditIds) {
		t363 = !!focusedComponentEditSession && savingComponentEditIds.has(focusedComponentEditSession.containerId);
		$[884] = focusedComponentEditSession;
		$[885] = savingComponentEditIds;
		$[886] = t363;
	} else t363 = $[886];
	const isPreparingComponentEdit = t363;
	let t364;
	if ($[887] !== onOpenProjectSettings) {
		t364 = onOpenProjectSettings ? () => onOpenProjectSettings("general") : void 0;
		$[887] = onOpenProjectSettings;
		$[888] = t364;
	} else t364 = $[888];
	const handleOpenFileSettings = t364;
	let t365;
	if ($[889] !== onOpenProjectSettings) {
		t365 = onOpenProjectSettings ? () => onOpenProjectSettings("icons") : void 0;
		$[889] = onOpenProjectSettings;
		$[890] = t365;
	} else t365 = $[890];
	const handleOpenIconSettings = t365;
	let t366;
	if ($[891] !== onOpenProjectSettings) {
		t366 = onOpenProjectSettings ? () => onOpenProjectSettings("ai") : void 0;
		$[891] = onOpenProjectSettings;
		$[892] = t366;
	} else t366 = $[892];
	const handleOpenAiSettings = t366;
	let t367;
	if ($[893] !== chatTabs.length || $[894] !== chatsLoading) {
		t367 = (tab_20) => {
			if (tab_20 !== "agents") return;
			setArchiveOpen(false);
			setChatHistoryOpen(false);
			if (!chatsLoading && chatTabs.length === 0) handleNewChat();
		};
		$[893] = chatTabs.length;
		$[894] = chatsLoading;
		$[895] = t367;
	} else t367 = $[895];
	const handleSidebarTabActivate = t367;
	let t368;
	if ($[896] === Symbol.for("react.memo_cache_sentinel")) {
		t368 = () => setRenameRequestId(null);
		$[896] = t368;
	} else t368 = $[896];
	const handleRenameRequestHandled = t368;
	let t369;
	if ($[897] === Symbol.for("react.memo_cache_sentinel")) {
		t369 = (data_0) => {
			chatPanelRef.current?.attachDroppedFiles(data_0);
		};
		$[897] = t369;
	} else t369 = $[897];
	const handleSidebarDropAttachments = t369;
	let t370;
	if ($[898] === Symbol.for("react.memo_cache_sentinel")) {
		t370 = () => setArchiveOpen(true);
		$[898] = t370;
	} else t370 = $[898];
	const handleOpenArchivedChats = t370;
	let t371;
	if ($[899] === Symbol.for("react.memo_cache_sentinel")) {
		t371 = () => setArchiveOpen(false);
		$[899] = t371;
	} else t371 = $[899];
	const handleArchiveViewBack = t371;
	let t372;
	if ($[900] !== chatBackend || $[901] !== readOnly) {
		t372 = readOnly || !chatBackend?.readFileRaw ? void 0 : (path_0) => chatBackend.readFileRaw(path_0);
		$[900] = chatBackend;
		$[901] = readOnly;
		$[902] = t372;
	} else t372 = $[902];
	const readCompositionFile = t372;
	const t373 = readOnly ? void 0 : onRenameProject;
	let t374;
	if ($[903] !== activePageId || $[904] !== handleCreatePage || $[905] !== handleDeletePage || $[906] !== handleRenamePage || $[907] !== handleReorderPages || $[908] !== handleSelectPage || $[909] !== isPageLoading || $[910] !== pages || $[911] !== readOnly) {
		t374 = {
			pages,
			activePageId,
			isPageLoading,
			onSelectPage: handleSelectPage,
			onCreatePage: handleCreatePage,
			onRenamePage: handleRenamePage,
			onDeletePage: handleDeletePage,
			onReorderPages: handleReorderPages,
			readOnly
		};
		$[903] = activePageId;
		$[904] = handleCreatePage;
		$[905] = handleDeletePage;
		$[906] = handleRenamePage;
		$[907] = handleReorderPages;
		$[908] = handleSelectPage;
		$[909] = isPageLoading;
		$[910] = pages;
		$[911] = readOnly;
		$[912] = t374;
	} else t374 = $[912];
	let t375;
	if ($[913] !== renderContextMenuItems) {
		t375 = (id_45) => renderContextMenuItems(id_45);
		$[913] = renderContextMenuItems;
		$[914] = t375;
	} else t375 = $[914];
	let t376;
	if ($[915] !== readOnly || $[916] !== renameRequestId || $[917] !== t375) {
		t376 = {
			onSelectElement: onSidebarSelectElement,
			onSelectElements: onSidebarSelectElements,
			onDragElements: onSidebarDragElements,
			onRenameElement: onSidebarRenameElement,
			onFocusElement: onSidebarFocusElement,
			searchInputRef: layersSearchRef,
			renameRequestId,
			onRenameRequestHandled: handleRenameRequestHandled,
			suppressMenuCloseFocusRef,
			onContextMenuRow: onSidebarContextMenuRow,
			renderRowContextMenu: t375,
			readOnly
		};
		$[915] = readOnly;
		$[916] = renameRequestId;
		$[917] = t375;
		$[918] = t376;
	} else t376 = $[918];
	let t377;
	if ($[919] !== t374 || $[920] !== t376) {
		t377 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagesSidebarTabV2, {
			ref: pagesSidebarRef,
			pageProps: t374,
			layerProps: t376
		});
		$[919] = t374;
		$[920] = t376;
		$[921] = t377;
	} else t377 = $[921];
	const t378 = readOnly ? void 0 : pasteCompositionJsx;
	let t379;
	if ($[922] !== allIconLibraries || $[923] !== componentIndex || $[924] !== components || $[925] !== compositionRefreshKey || $[926] !== effectiveProjectPath || $[927] !== handleAskAIForIconLibrary || $[928] !== handleImportDesignSystem || $[929] !== handleOpenIconSettings || $[930] !== iconLibraries || $[931] !== isElectron || $[932] !== onAddElement || $[933] !== onAddShadcnComponents || $[934] !== onEnsureComponentNames || $[935] !== openComponentFile || $[936] !== openNewComponentFile || $[937] !== readCompositionFile || $[938] !== readOnly || $[939] !== t378) {
		t379 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetsSidebarTabV2, {
			ref: assetsSidebarRef,
			onAddElement,
			componentIndex,
			components,
			iconLibraries,
			allIconLibraries,
			onEditComponent: openComponentFile,
			onCreateComponentFile: openNewComponentFile,
			onAddShadcnComponents,
			onImportDesignSystem: handleImportDesignSystem,
			onOpenIconSettings: handleOpenIconSettings,
			onAskAIForIconLibrary: handleAskAIForIconLibrary,
			onPasteCompositionJsx: t378,
			readCompositionFile,
			compositionSourceId: effectiveProjectPath,
			compositionRefreshKey,
			readOnly,
			isElectron,
			onEnsureComponentNames
		});
		$[922] = allIconLibraries;
		$[923] = componentIndex;
		$[924] = components;
		$[925] = compositionRefreshKey;
		$[926] = effectiveProjectPath;
		$[927] = handleAskAIForIconLibrary;
		$[928] = handleImportDesignSystem;
		$[929] = handleOpenIconSettings;
		$[930] = iconLibraries;
		$[931] = isElectron;
		$[932] = onAddElement;
		$[933] = onAddShadcnComponents;
		$[934] = onEnsureComponentNames;
		$[935] = openComponentFile;
		$[936] = openNewComponentFile;
		$[937] = readCompositionFile;
		$[938] = readOnly;
		$[939] = t378;
		$[940] = t379;
	} else t379 = $[940];
	let t380;
	if ($[941] !== activeTab || $[942] !== agentPresence || $[943] !== agentsV2 || $[944] !== applyChatMessages || $[945] !== archiveOpen || $[946] !== chatBackend || $[947] !== chatColorMap || $[948] !== chatHistoryOpen || $[949] !== chatMessages || $[950] !== chatTabs || $[951] !== chatsLoading || $[952] !== effectiveAllowedPaths || $[953] !== effectiveOnAdd || $[954] !== focusedComponent?.name || $[955] !== followAi || $[956] !== handleArchiveAllChats || $[957] !== handleArchiveChat || $[958] !== handleFocusLastChatResult || $[959] !== handleImportDesignSystem || $[960] !== handleOpenAiSettings || $[961] !== handleRenameChat || $[962] !== handleRestoreChat || $[963] !== handleSwitchChat || $[964] !== iconLibraries || $[965] !== mergedComponentIndex || $[966] !== onClearAllowedPaths || $[967] !== onFeedback || $[968] !== onPlanLimit || $[969] !== onProjectFilesEdited || $[970] !== onRemoveAllowedPath || $[971] !== projectPath || $[972] !== readOnly || $[973] !== runningChatIds || $[974] !== tabs_0 || $[975] !== unloadedChatIds || $[976] !== unreadChatIds || $[977] !== visibleChatIndex) {
		t380 = !readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatArchiveView, {
			open: archiveOpen,
			onBack: handleArchiveViewBack,
			backend: chatBackend ?? null,
			onRestore: handleRestoreChat,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentsSidebarTabV2, {
				onRenameChat: handleRenameChat,
				chats: chatTabs.map(_temp102),
				activeChatId: chatTabs[visibleChatIndex]?.id,
				historyOpen: chatHistoryOpen,
				onHistoryOpenChange: setChatHistoryOpen,
				runningChatIds,
				unreadChatIds,
				loading: chatsLoading,
				onNewChat: handleNewChat,
				onOpenSettings: handleOpenAiSettings,
				onSwitchChat: handleSwitchChat,
				onArchiveChat: handleArchiveChat,
				onDropAttachments: handleSidebarDropAttachments,
				onArchiveAllChats: handleArchiveAllChats,
				onOpenArchivedChats: handleOpenArchivedChats,
				followAi,
				onFollowAiChange: persistFollowAi,
				onFocusLastResult: handleFocusLastChatResult,
				renderChat: (chat_2, active_0) => {
					const chatTab = chatTabs.find((candidate_0) => candidate_0.id === chat_2.id);
					if (!chatTab) return null;
					if (unloadedChatIds.has(chatTab.id)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatHistoryLoading, {});
					return agentsV2.active && agentsV2.bridge && projectPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanelV2Live, {
						active: active_0,
						ref: (panel_4) => {
							if (panel_4) commentChatPanels.current.set(chat_2.id, panel_4);
							else commentChatPanels.current.delete(chat_2.id);
							if (active_0) chatPanelRef.current = panel_4;
						},
						variant: "sidebar-v2",
						bridge: agentsV2.bridge,
						projectId: projectPath,
						chatTabId: chatTab.id,
						host: agentsV2.buildHost(chatTab.id, getChatMessages(chatMessages, chatTab.id)),
						componentIndex: mergedComponentIndex,
						contextPages: tabs_0.flatMap(_temp103),
						activeTabInfo: activeTab ? {
							name: activeTab.name,
							id: activeTab.id
						} : void 0,
						iconLibraryNames: Object.keys(iconLibraries),
						onSelectElement: handleSelectChatElement
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanelLiveSelection, {
						active: active_0,
						ref: (panel_5) => {
							if (panel_5) commentChatPanels.current.set(chatTab.id, panel_5);
							else commentChatPanels.current.delete(chatTab.id);
							if (active_0) chatPanelRef.current = panel_5;
						},
						variant: "sidebar-v2",
						componentIndex: mergedComponentIndex,
						contextPages: tabs_0.flatMap(_temp104),
						activeTabInfo: activeTab ? {
							name: activeTab.name,
							id: activeTab.id
						} : void 0,
						focusedComponent: focusedComponent?.name,
						messagesStore: chatMessages,
						onMessagesChange: (newMessages_0) => {
							applyChatMessages(chatTab.id, newMessages_0, chatTab.title);
						},
						activeChatId: chatTab.id,
						chatList: chatTabs.map(_temp105),
						onNewChat: handleNewChat,
						onSwitchChat: handleSwitchChat,
						onArchiveChat: handleArchiveChat,
						onArchiveAllChats: handleArchiveAllChats,
						onOpenArchivedChats: handleOpenArchivedChats,
						chatColor: chatTabs.length > 1 ? chatColorMap.get(chatTab.id) || "#2563eb" : void 0,
						chatColors: chatTabs.length > 1 ? chatColorMap : void 0,
						iconLibraryNames: Object.keys(iconLibraries),
						allowedPaths: effectiveAllowedPaths,
						onAddAllowedPath: effectiveOnAdd,
						onImportDesignSystem: handleImportDesignSystem,
						onRemoveAllowedPath,
						onClearAllowedPaths,
						onOpenProjectSettings: handleOpenAiSettings,
						onProjectFilesEdited,
						onPlanLimit,
						onFeedback,
						onStreamStart: handleChatStreamStart,
						onRunStart: (run_0) => onActivityRef.current?.({
							type: "ai_chat_started",
							...run_0
						}),
						onRunComplete: (run_1) => onActivityRef.current?.({
							type: "ai_chat_completed",
							...run_1
						}),
						onStreamEnd: (chatTabId) => {
							handleChatStreamFinish(chatTabId);
							agentPresence.clearChat(chatTabId);
						},
						onSelectElement: handleSelectChatElement
					});
				}
			})
		}) : void 0;
		$[941] = activeTab;
		$[942] = agentPresence;
		$[943] = agentsV2;
		$[944] = applyChatMessages;
		$[945] = archiveOpen;
		$[946] = chatBackend;
		$[947] = chatColorMap;
		$[948] = chatHistoryOpen;
		$[949] = chatMessages;
		$[950] = chatTabs;
		$[951] = chatsLoading;
		$[952] = effectiveAllowedPaths;
		$[953] = effectiveOnAdd;
		$[954] = focusedComponent?.name;
		$[955] = followAi;
		$[956] = handleArchiveAllChats;
		$[957] = handleArchiveChat;
		$[958] = handleFocusLastChatResult;
		$[959] = handleImportDesignSystem;
		$[960] = handleOpenAiSettings;
		$[961] = handleRenameChat;
		$[962] = handleRestoreChat;
		$[963] = handleSwitchChat;
		$[964] = iconLibraries;
		$[965] = mergedComponentIndex;
		$[966] = onClearAllowedPaths;
		$[967] = onFeedback;
		$[968] = onPlanLimit;
		$[969] = onProjectFilesEdited;
		$[970] = onRemoveAllowedPath;
		$[971] = projectPath;
		$[972] = readOnly;
		$[973] = runningChatIds;
		$[974] = tabs_0;
		$[975] = unloadedChatIds;
		$[976] = unreadChatIds;
		$[977] = visibleChatIndex;
		$[978] = t380;
	} else t380 = $[978];
	let t381;
	if ($[979] !== handleOpenFileSettings || $[980] !== handleSidebarTabActivate || $[981] !== onProjectIconClick || $[982] !== projectIconUrl || $[983] !== projectName || $[984] !== readOnly || $[985] !== sidebarV2Tab || $[986] !== t373 || $[987] !== t377 || $[988] !== t379 || $[989] !== t380) {
		t381 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftSidebarV2, {
			projectName,
			projectIconUrl,
			onProjectIconClick,
			onOpenProjectSettings: handleOpenFileSettings,
			onRenameProject: t373,
			activeTab: sidebarV2Tab,
			onActiveTabChange: setSidebarV2Tab,
			onTabActivate: handleSidebarTabActivate,
			hideTabs: readOnly,
			readOnly,
			pages: t377,
			assets: t379,
			agents: t380
		});
		$[979] = handleOpenFileSettings;
		$[980] = handleSidebarTabActivate;
		$[981] = onProjectIconClick;
		$[982] = projectIconUrl;
		$[983] = projectName;
		$[984] = readOnly;
		$[985] = sidebarV2Tab;
		$[986] = t373;
		$[987] = t377;
		$[988] = t379;
		$[989] = t380;
		$[990] = t381;
	} else t381 = $[990];
	const leftSidebarV2 = t381;
	const t382 = readOnly ? void 0 : handlePlaceCapturedElement;
	const t383 = readOnly ? void 0 : navigatePreview;
	const t384 = readOnly ? void 0 : _temp106;
	const t385 = readOnly ? _temp107 : onEditText;
	const t386 = readOnly ? void 0 : handleActivateTextEditor;
	const t387 = readOnly ? void 0 : handleDeactivateTextEditor;
	const t388 = readOnly ? void 0 : setTextSelectionState;
	let t389;
	if ($[991] !== componentIndex || $[992] !== components || $[993] !== componentsRevision || $[994] !== effectiveAllowedPaths || $[995] !== effectiveOnAdd || $[996] !== handleFixWithAI || $[997] !== iconLibraries || $[998] !== onAddElement || $[999] !== t382 || $[1e3] !== t383 || $[1001] !== t384 || $[1002] !== t385 || $[1003] !== t386 || $[1004] !== t387 || $[1005] !== t388) {
		t389 = {
			components,
			componentIndex,
			componentsRevision,
			iconLibraries,
			onFixWithAI: handleFixWithAI,
			onSaveToCode: handleSaveToCode,
			onOpenFile: handleOpenFileFromCanvas,
			onPlaceCapturedElement: t382,
			onNavigatePreview: t383,
			allowedPaths: effectiveAllowedPaths,
			onAddAllowedPath: effectiveOnAdd,
			onAddElement,
			onSetMediaSource: t384,
			onEditText: t385,
			onActivateTextEditor: t386,
			onDeactivateTextEditor: t387,
			onTextSelectionChange: t388
		};
		$[991] = componentIndex;
		$[992] = components;
		$[993] = componentsRevision;
		$[994] = effectiveAllowedPaths;
		$[995] = effectiveOnAdd;
		$[996] = handleFixWithAI;
		$[997] = iconLibraries;
		$[998] = onAddElement;
		$[999] = t382;
		$[1e3] = t383;
		$[1001] = t384;
		$[1002] = t385;
		$[1003] = t386;
		$[1004] = t387;
		$[1005] = t388;
		$[1006] = t389;
	} else t389 = $[1006];
	const canvasRenderOptions = t389;
	let t390;
	if ($[1007] === Symbol.for("react.memo_cache_sentinel")) {
		t390 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {});
		$[1007] = t390;
	} else t390 = $[1007];
	let t391;
	if ($[1008] !== agentsV2.active || $[1009] !== canvasToolDeps) {
		t391 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasToolHandlerMount, {
			enableAgentsV2: agentsV2.active,
			deps: canvasToolDeps
		});
		$[1008] = agentsV2.active;
		$[1009] = canvasToolDeps;
		$[1010] = t391;
	} else t391 = $[1010];
	let t392;
	if ($[1011] !== activePageId || $[1012] !== activeTab || $[1013] !== agentPresence || $[1014] !== agentsV2 || $[1015] !== allIconLibraries || $[1016] !== applyChatMessages || $[1017] !== archiveOpen || $[1018] !== chatBackend || $[1019] !== chatColorMap || $[1020] !== chatMessages || $[1021] !== chatTabs || $[1022] !== chatsLoading || $[1023] !== componentIndex || $[1024] !== components || $[1025] !== compositionRefreshKey || $[1026] !== effectiveAllowedPaths || $[1027] !== effectiveOnAdd || $[1028] !== effectiveProjectPath || $[1029] !== enableSidebarV2 || $[1030] !== focusedComponent?.name || $[1031] !== handleArchiveAllChats || $[1032] !== handleArchiveChat || $[1033] !== handleAskAIForIconLibrary || $[1034] !== handleCreatePage || $[1035] !== handleDeletePage || $[1036] !== handleImportDesignSystem || $[1037] !== handleRenamePage || $[1038] !== handleReorderPages || $[1039] !== handleRestoreChat || $[1040] !== handleSelectElement || $[1041] !== handleSelectPage || $[1042] !== handleSwitchChat || $[1043] !== iconLibraries || $[1044] !== isElectron || $[1045] !== isPageLoading || $[1046] !== leftHeader || $[1047] !== leftPanelTab || $[1048] !== leftSidebarV2 || $[1049] !== mergedComponentIndex || $[1050] !== onAddElement || $[1051] !== onClearAllowedPaths || $[1052] !== onEnsureComponentNames || $[1053] !== onFeedback || $[1054] !== onOpenProjectSettings || $[1055] !== onPlanLimit || $[1056] !== onProjectFilesEdited || $[1057] !== onRemoveAllowedPath || $[1058] !== openComponentFile || $[1059] !== pages || $[1060] !== pasteCompositionJsx || $[1061] !== projectPath || $[1062] !== readOnly || $[1063] !== renameRequestId || $[1064] !== renderContextMenuItems || $[1065] !== tabs_0 || $[1066] !== unloadedChatIds || $[1067] !== visibleChatIndex) {
		t392 = enableSidebarV2 ? leftSidebarV2 : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col h-full overflow-hidden",
			children: [leftHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 border-b border-ed-border",
				children: leftHeader
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelGroup$1, {
				direction: "vertical",
				className: "flex-1",
				autoSaveId: "left-pages-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						defaultSize: 15,
						minSize: 5,
						collapsible: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "h-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagesPanel, {
								pages,
								activePageId,
								isPageLoading,
								onSelectPage: handleSelectPage,
								onCreatePage: handleCreatePage,
								onRenamePage: handleRenamePage,
								onDeletePage: handleDeletePage,
								onReorderPages: handleReorderPages,
								readOnly
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelDivider, { className: "bg-ed-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						defaultSize: 85,
						minSize: 30,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							value: leftPanelTab,
							onValueChange: setLeftPanelTab,
							className: "w-full gap-0 h-full overflow-hidden flex flex-col",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									ref: leftTabsListRef,
									className: "!w-full p-2 overflow-x-auto overflow-y-hidden scrollbar-hide shrink-0 flex-nowrap",
									"data-horizontal-scroll": "",
									variant: "simple",
									children: [
										!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "chat",
											className: "shrink-0",
											children: "Chat"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "layers",
											className: "shrink-0",
											children: "Layers"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "insert",
											className: "shrink-0",
											children: "Insert"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "assets",
											className: "relative gap-1 shrink-0",
											children: "Assets"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "icons",
											className: "shrink-0",
											children: "Icons"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "layers",
									className: "h-full overflow-hidden flex flex-col",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanelLive, {
										onSelectElement: handleSelectElement,
										onSelectElements: handleSelectElements,
										onDragElements,
										onRenameElement,
										onFocusElement: handleFocusElement,
										searchInputRef: layersSearchRef,
										renameRequestId,
										onRenameRequestHandled: () => setRenameRequestId(null),
										suppressMenuCloseFocusRef,
										onContextMenuRow: handleLayersContextMenuRow,
										renderRowContextMenu: (id_47) => renderContextMenuItems(id_47),
										readOnly
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "insert",
									className: "h-full overflow-hidden flex flex-col",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsertPanel, {
										onAddElement,
										readOnly,
										isElectron
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "assets",
									className: "h-full overflow-hidden flex flex-col",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetsPanel, {
										onAddElement,
										onPasteCompositionJsx: readOnly ? void 0 : pasteCompositionJsx,
										readCompositionFile: readOnly || !chatBackend?.readFileRaw ? void 0 : (path_1) => chatBackend.readFileRaw(path_1),
										compositionSourceId: effectiveProjectPath,
										componentIndex,
										components,
										iconLibraries,
										allIconLibraries,
										onEditComponent: openComponentFile,
										readOnly,
										onAskAI: handleAskAIForStarterComponent,
										onAskAIForComposition: handleAskAIForComposition,
										compositionRefreshKey,
										onEnsureComponentNames
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "icons",
									className: "h-full overflow-hidden flex flex-col",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconsPanel, {
										iconLibraries,
										onOpenIconSettings: onOpenProjectSettings ? () => onOpenProjectSettings("icons") : void 0,
										onAskAI: handleAskAIForIconLibrary,
										onAddElement,
										readOnly
									})
								}),
								!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "chat",
									forceMount: true,
									className: "h-full overflow-hidden flex flex-col data-[state=inactive]:hidden!",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatArchiveView, {
										open: archiveOpen,
										onBack: () => setArchiveOpen(false),
										backend: chatBackend ?? null,
										onRestore: handleRestoreChat,
										children: chatsLoading && chatTabs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-1 items-center justify-center text-sm text-ed-muted-foreground",
											children: "Loading chats…"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatConversations, {
											chats: chatTabs,
											activeChatId: chatTabs[visibleChatIndex]?.id,
											loadingChatIds: unloadedChatIds,
											renderChat: (chatTab_0, active_1) => agentsV2.active && agentsV2.bridge && projectPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanelV2Live, {
												active: active_1,
												ref: (panel_6) => {
													if (panel_6) commentChatPanels.current.set(chatTab_0.id, panel_6);
													else commentChatPanels.current.delete(chatTab_0.id);
													if (active_1) chatPanelRef.current = panel_6;
												},
												bridge: agentsV2.bridge,
												projectId: projectPath,
												chatTabId: chatTab_0.id,
												host: agentsV2.buildHost(chatTab_0.id, getChatMessages(chatMessages, chatTab_0.id)),
												componentIndex: mergedComponentIndex,
												contextPages: tabs_0.flatMap(_temp108),
												activeTabInfo: activeTab ? {
													name: activeTab.name,
													id: activeTab.id
												} : void 0,
												iconLibraryNames: Object.keys(iconLibraries),
												onSelectElement: handleSelectChatElement,
												activeChatId: chatTab_0.id,
												chatList: chatTabs.map((t_13) => ({
													id: t_13.id,
													title: t_13.title,
													createdAt: t_13.createdAt,
													updatedAt: t_13.createdAt,
													archivedAt: null,
													messageCount: getChatMessages(chatMessages, t_13.id).length
												})),
												onNewChat: handleNewChat,
												onSwitchChat: handleSwitchChat,
												onArchiveChat: handleArchiveChat,
												onArchiveAllChats: handleArchiveAllChats,
												onOpenArchivedChats: () => setArchiveOpen(true),
												chatColor: chatTabs.length > 1 ? chatColorMap.get(chatTab_0.id) || "#2563eb" : void 0,
												chatColors: chatTabs.length > 1 ? chatColorMap : void 0
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanelLiveSelection, {
												active: active_1,
												ref: (panel_7) => {
													if (panel_7) commentChatPanels.current.set(chatTab_0.id, panel_7);
													else commentChatPanels.current.delete(chatTab_0.id);
													if (active_1) chatPanelRef.current = panel_7;
												},
												componentIndex: mergedComponentIndex,
												contextPages: tabs_0.flatMap(_temp109),
												activeTabInfo: activeTab ? {
													name: activeTab.name,
													id: activeTab.id
												} : void 0,
												focusedComponent: focusedComponent?.name,
												messagesStore: chatMessages,
												onMessagesChange: (newMsgs) => {
													applyChatMessages(chatTab_0.id, newMsgs, chatTab_0.title);
												},
												activeChatId: chatTab_0.id,
												chatList: chatTabs.map(_temp110),
												onNewChat: handleNewChat,
												onSwitchChat: handleSwitchChat,
												onArchiveChat: handleArchiveChat,
												onArchiveAllChats: handleArchiveAllChats,
												onOpenArchivedChats: () => setArchiveOpen(true),
												chatColor: chatTabs.length > 1 ? chatColorMap.get(chatTab_0.id) || "#2563eb" : void 0,
												chatColors: chatTabs.length > 1 ? chatColorMap : void 0,
												iconLibraryNames: Object.keys(iconLibraries),
												allowedPaths: effectiveAllowedPaths,
												onAddAllowedPath: effectiveOnAdd,
												onImportDesignSystem: handleImportDesignSystem,
												onRemoveAllowedPath,
												onClearAllowedPaths,
												onOpenProjectSettings: onOpenProjectSettings ? () => onOpenProjectSettings("ai") : void 0,
												onProjectFilesEdited,
												onPlanLimit,
												onFeedback,
												onStreamStart: handleChatStreamStart,
												onRunStart: (run_2) => onActivityRef.current?.({
													type: "ai_chat_started",
													...run_2
												}),
												onRunComplete: (run_3) => onActivityRef.current?.({
													type: "ai_chat_completed",
													...run_3
												}),
												onStreamEnd: (chatTabId_0) => {
													handleChatStreamFinish(chatTabId_0);
													agentPresence.clearChat(chatTabId_0);
												},
												onSelectElement: handleSelectChatElement
											})
										})
									})
								})
							]
						})
					})
				]
			})]
		});
		$[1011] = activePageId;
		$[1012] = activeTab;
		$[1013] = agentPresence;
		$[1014] = agentsV2;
		$[1015] = allIconLibraries;
		$[1016] = applyChatMessages;
		$[1017] = archiveOpen;
		$[1018] = chatBackend;
		$[1019] = chatColorMap;
		$[1020] = chatMessages;
		$[1021] = chatTabs;
		$[1022] = chatsLoading;
		$[1023] = componentIndex;
		$[1024] = components;
		$[1025] = compositionRefreshKey;
		$[1026] = effectiveAllowedPaths;
		$[1027] = effectiveOnAdd;
		$[1028] = effectiveProjectPath;
		$[1029] = enableSidebarV2;
		$[1030] = focusedComponent?.name;
		$[1031] = handleArchiveAllChats;
		$[1032] = handleArchiveChat;
		$[1033] = handleAskAIForIconLibrary;
		$[1034] = handleCreatePage;
		$[1035] = handleDeletePage;
		$[1036] = handleImportDesignSystem;
		$[1037] = handleRenamePage;
		$[1038] = handleReorderPages;
		$[1039] = handleRestoreChat;
		$[1040] = handleSelectElement;
		$[1041] = handleSelectPage;
		$[1042] = handleSwitchChat;
		$[1043] = iconLibraries;
		$[1044] = isElectron;
		$[1045] = isPageLoading;
		$[1046] = leftHeader;
		$[1047] = leftPanelTab;
		$[1048] = leftSidebarV2;
		$[1049] = mergedComponentIndex;
		$[1050] = onAddElement;
		$[1051] = onClearAllowedPaths;
		$[1052] = onEnsureComponentNames;
		$[1053] = onFeedback;
		$[1054] = onOpenProjectSettings;
		$[1055] = onPlanLimit;
		$[1056] = onProjectFilesEdited;
		$[1057] = onRemoveAllowedPath;
		$[1058] = openComponentFile;
		$[1059] = pages;
		$[1060] = pasteCompositionJsx;
		$[1061] = projectPath;
		$[1062] = readOnly;
		$[1063] = renameRequestId;
		$[1064] = renderContextMenuItems;
		$[1065] = tabs_0;
		$[1066] = unloadedChatIds;
		$[1067] = visibleChatIndex;
		$[1068] = t392;
	} else t392 = $[1068];
	let t393;
	if ($[1069] !== rightHeader) {
		t393 = rightHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: rightHeader
		});
		$[1069] = rightHeader;
		$[1070] = t393;
	} else t393 = $[1070];
	let t394;
	if ($[1071] !== activeTabLoaded || $[1072] !== commentsHidden || $[1073] !== enableWebviewTweak || $[1074] !== gitPanel || $[1075] !== setCommentsHidden || $[1076] !== showGitPanel) {
		t394 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightRailZoomStrip, {
			activeTabLoaded,
			showGitPanel,
			gitPanel,
			enableWebviewTweak,
			viewportRef,
			commentsHidden,
			onCommentsHiddenChange: setCommentsHidden
		});
		$[1071] = activeTabLoaded;
		$[1072] = commentsHidden;
		$[1073] = enableWebviewTweak;
		$[1074] = gitPanel;
		$[1075] = setCommentsHidden;
		$[1076] = showGitPanel;
		$[1077] = t394;
	} else t394 = $[1077];
	let t395;
	if ($[1078] !== activeCommentId || $[1079] !== activePageId || $[1080] !== activeTab?.backgroundColor || $[1081] !== activeTab?.backgroundToken || $[1082] !== activeTab?.name || $[1083] !== activeTabLoaded || $[1084] !== commentMode || $[1085] !== commentsError || $[1086] !== commentsHidden || $[1087] !== commentsLoading || $[1088] !== commentsProp || $[1089] !== currentUserId || $[1090] !== enableWebviewTweak || $[1091] !== exportRequest || $[1092] !== fonts || $[1093] !== gitPanel || $[1094] !== handleSetPageBackground || $[1095] !== handleSidebarCommentSelect || $[1096] !== iconLibraries || $[1097] !== isPageLoading || $[1098] !== mergedComponentIndex || $[1099] !== onActiveCommentChange || $[1100] !== onDeleteComment || $[1101] !== onEditComment || $[1102] !== onRequestPropsScan || $[1103] !== onResolveComment || $[1104] !== onRetryComments || $[1105] !== onToggleTextFormat || $[1106] !== onUnresolveComment || $[1107] !== onUpdateElementPositions || $[1108] !== onUpdateElementProps || $[1109] !== onUpdateElementStyles || $[1110] !== onUpdateExportSettings || $[1111] !== onUpdateMultipleElements || $[1112] !== onUpdateMultipleElementsProps || $[1113] !== onUpdateMultipleElementsStyles || $[1114] !== openComponentFile || $[1115] !== readOnly || $[1116] !== scanLoading || $[1117] !== setCommentsHidden || $[1118] !== showGitPanel || $[1119] !== textSelectionState) {
		t395 = commentMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSidebar, {
			activePageId,
			comments: commentsProp,
			activeCommentId,
			pageName: activeTab?.name,
			loading: commentsLoading,
			error: commentsError,
			onRetry: onRetryComments,
			currentUserId,
			onEdit: onEditComment,
			onDelete: onDeleteComment ? (id_48) => {
				onDeleteComment(id_48);
				if (id_48 === activeCommentId) {
					setActiveCommentId(null);
					onActiveCommentChange?.(null);
				}
			} : void 0,
			onSelect: handleSidebarCommentSelect,
			onResolve: onResolveComment,
			onUnresolve: onUnresolveComment
		}) : showGitPanel && gitPanel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full flex flex-col overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-3 py-2 border-b border-ed-border shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium text-ed-foreground",
					children: "Git"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: () => setShowGitPanel(false),
						className: "p-0.5 rounded hover:bg-ed-accent text-ed-muted-foreground hover:text-ed-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "14",
							height: "14",
							viewBox: "0 0 14 14",
							fill: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M4 4l6 6M10 4l-6 6",
								stroke: "currentColor",
								strokeWidth: "1.5",
								strokeLinecap: "round"
							})
						})
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto",
				children: gitPanel
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionView, {
			enableWebviewTweak,
			readOnly,
			mergedComponentIndex,
			iconLibraries,
			onReplaceElement,
			onUpdateExportSettings,
			onExported: (result_11) => onActivityRef.current?.({
				type: "export_completed",
				...result_11
			}),
			exportRequest,
			onExportRequestHandled: clearExportRequest,
			openComponentFile,
			onUpdateElementStyles,
			onUpdateElementProps,
			onSetElementPropsTransient,
			onUpdateMultipleElementsProps,
			onUpdateMultipleElementsStyles,
			onUpdateMultipleElements,
			onSelectElements: handleSelectElements,
			onUpdateElementPositions,
			onToggleTextFormat,
			textSelectionState,
			onCreateComponent: openCreateComponent,
			scanLoading,
			onRequestPropsScan,
			fonts,
			activeTabLoaded,
			activeTabBackgroundColor: activeTab?.backgroundColor,
			activeTabBackgroundToken: activeTab?.backgroundToken,
			isPageLoading,
			onChangeBackground: handleSetPageBackground,
			viewportRef,
			commentsHidden,
			onCommentsHiddenChange: setCommentsHidden
		});
		$[1078] = activeCommentId;
		$[1079] = activePageId;
		$[1080] = activeTab?.backgroundColor;
		$[1081] = activeTab?.backgroundToken;
		$[1082] = activeTab?.name;
		$[1083] = activeTabLoaded;
		$[1084] = commentMode;
		$[1085] = commentsError;
		$[1086] = commentsHidden;
		$[1087] = commentsLoading;
		$[1088] = commentsProp;
		$[1089] = currentUserId;
		$[1090] = enableWebviewTweak;
		$[1091] = exportRequest;
		$[1092] = fonts;
		$[1093] = gitPanel;
		$[1094] = handleSetPageBackground;
		$[1095] = handleSidebarCommentSelect;
		$[1096] = iconLibraries;
		$[1097] = isPageLoading;
		$[1098] = mergedComponentIndex;
		$[1099] = onActiveCommentChange;
		$[1100] = onDeleteComment;
		$[1101] = onEditComment;
		$[1102] = onRequestPropsScan;
		$[1103] = onResolveComment;
		$[1104] = onRetryComments;
		$[1105] = onToggleTextFormat;
		$[1106] = onUnresolveComment;
		$[1107] = onUpdateElementPositions;
		$[1108] = onUpdateElementProps;
		$[1109] = onUpdateElementStyles;
		$[1110] = onUpdateExportSettings;
		$[1111] = onUpdateMultipleElements;
		$[1112] = onUpdateMultipleElementsProps;
		$[1113] = onUpdateMultipleElementsStyles;
		$[1114] = openComponentFile;
		$[1115] = readOnly;
		$[1116] = scanLoading;
		$[1117] = setCommentsHidden;
		$[1118] = showGitPanel;
		$[1119] = textSelectionState;
		$[1120] = t395;
	} else t395 = $[1120];
	let t396;
	if ($[1121] !== t393 || $[1122] !== t394 || $[1123] !== t395) {
		t396 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full flex flex-col overflow-hidden",
			children: [
				t393,
				t394,
				t395
			]
		});
		$[1121] = t393;
		$[1122] = t394;
		$[1123] = t395;
		$[1124] = t396;
	} else t396 = $[1124];
	let t397;
	if ($[1125] !== activeTab || $[1126] !== componentIndex || $[1127] !== components || $[1128] !== copyCodeIncludesComponents || $[1129] !== enableCssEditor || $[1130] !== fileOpenSignal || $[1131] !== focusedComponent?.filePath || $[1132] !== focusedComponent?.name || $[1133] !== iconLibraries || $[1134] !== listFileVersions || $[1135] !== onOpenProjectSettings || $[1136] !== openCodeFiles || $[1137] !== openSkills || $[1138] !== readOnly || $[1139] !== restoreFileVersion || $[1140] !== saveCodeFile || $[1141] !== saveSkill || $[1142] !== serverDrivenFileRefresh || $[1143] !== skillOpenSignal) {
		t397 = activeTab && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomBarSelectionLive, {
			tab: activeTab,
			copyIncludesComponents: copyCodeIncludesComponents,
			onOpenCopySettings: onOpenProjectSettings ? () => onOpenProjectSettings("code") : void 0,
			openFiles: openCodeFiles,
			onCloseFile: closeCodeFile,
			activateFile: fileOpenSignal,
			onSaveFile: saveCodeFile,
			openSkills,
			onCloseSkill: closeSkill,
			activateSkill: skillOpenSignal,
			onSaveSkill: saveSkill,
			onSaveSuccess: serverDrivenFileRefresh ? void 0 : refreshFocusedComponent,
			onSaveEnd: (success, errorMsg) => {
				const componentName_7 = focusedComponent?.name || activeTab?.name || "Component";
				const componentFilePath_0 = focusedComponent?.filePath;
				if (success) toast.success(`${componentName_7} saved to code`, {
					duration: 8e3,
					action: componentFilePath_0 ? {
						label: "Undo",
						onClick: async () => {
							const versionsResult_0 = await listFileVersions(componentName_7, componentFilePath_0);
							if (!versionsResult_0.success || versionsResult_0.versions.length === 0) {
								toast.error("No previous version found to restore");
								return;
							}
							const latestVersion_0 = versionsResult_0.versions[0];
							const restoreResult_0 = await restoreFileVersion(componentName_7, latestVersion_0.filename, componentFilePath_0);
							if (restoreResult_0.success) {
								toast.success(`${componentName_7} reverted to previous version`);
								refreshFocusedComponentRef.current(componentFilePath_0);
							} else toast.error(`Failed to revert: ${restoreResult_0.error}`);
						}
					} : void 0
				});
				else toast.error(`Failed to save ${componentName_7}`, { description: errorMsg || "Unknown error" });
			},
			onOpenVersionHistory: () => setShowVersionHistory(true),
			readOnly,
			enableCssEditor,
			componentIndex,
			components,
			iconLibraries,
			onReplaceElement,
			onPreviewElement,
			onClearPreview
		});
		$[1125] = activeTab;
		$[1126] = componentIndex;
		$[1127] = components;
		$[1128] = copyCodeIncludesComponents;
		$[1129] = enableCssEditor;
		$[1130] = fileOpenSignal;
		$[1131] = focusedComponent?.filePath;
		$[1132] = focusedComponent?.name;
		$[1133] = iconLibraries;
		$[1134] = listFileVersions;
		$[1135] = onOpenProjectSettings;
		$[1136] = openCodeFiles;
		$[1137] = openSkills;
		$[1138] = readOnly;
		$[1139] = restoreFileVersion;
		$[1140] = saveCodeFile;
		$[1141] = saveSkill;
		$[1142] = serverDrivenFileRefresh;
		$[1143] = skillOpenSignal;
		$[1144] = t397;
	} else t397 = $[1144];
	let t398;
	if ($[1145] !== activeCommentId || $[1146] !== activePageId || $[1147] !== activeTab || $[1148] !== activeTabLoaded || $[1149] !== agentPresenceColors || $[1150] !== allowCommentAttachments || $[1151] !== applyPasteStyleClean || $[1152] !== canvasCameraPending || $[1153] !== canvasMenuTargetId || $[1154] !== canvasRenderOptions || $[1155] !== chatAreas || $[1156] !== chatTabs || $[1157] !== commentIdentityPrompt || $[1158] !== commentMode || $[1159] !== commentRepliesProp || $[1160] !== commentsHidden || $[1161] !== commentsProp.length || $[1162] !== componentsRevision || $[1163] !== currentUser || $[1164] !== currentUserId || $[1165] !== draftComments || $[1166] !== editingTextId || $[1167] !== focusedComponentEditSession || $[1168] !== followingAi || $[1169] !== handleCancelComponentEdit || $[1170] !== handleCanvasContextMenu || $[1171] !== handleCaptureCanvasRegion || $[1172] !== handleCommentClick || $[1173] !== handleCommentReply || $[1174] !== handleCommentSubmit || $[1175] !== handlePickElementForChat || $[1176] !== handleSaveComponentEdit || $[1177] !== handleSelectComment || $[1178] !== handleSelectElement || $[1179] !== isPreparingComponentEdit || $[1180] !== onActiveCommentChange || $[1181] !== onAddElement || $[1182] !== onCreateGuestCommentIdentity || $[1183] !== onDeleteComment || $[1184] !== onEditComment || $[1185] !== onMoveComment || $[1186] !== onPasteElement || $[1187] !== onResolveComment || $[1188] !== onShowResolvedChange || $[1189] !== onStartAltDrag || $[1190] !== onToggleReaction || $[1191] !== onUnresolveComment || $[1192] !== onUpdateElementProps || $[1193] !== onUpdateElementStyles || $[1194] !== pageCamera || $[1195] !== pageComments || $[1196] !== pasteStyleSuggestion || $[1197] !== pendingCommentPosition || $[1198] !== readOnly || $[1199] !== renderContextMenuItems || $[1200] !== revealInsertPanel || $[1201] !== setCommentMode || $[1202] !== showCommentTools || $[1203] !== showResolvedComments || $[1204] !== urlCenterCamera || $[1205] !== visibleChatIndex) {
		t398 = activeTab && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full relative",
			children: [(!activeTabLoaded || canvasCameraPending) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col items-center gap-2 text-ed-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenu$1, {
				onOpenChange: (open) => {
					if (!open) setCanvasMenuTargetId(null);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuTrigger, {
					asChild: true,
					onContextMenu: handleCanvasContextMenu,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "contents",
							visibility: canvasCameraPending ? "hidden" : void 0
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
							backgroundColor: activeTab.backgroundColor,
							onSelectElement: handleSelectElement,
							onResizeElement,
							renderOptions: canvasRenderOptions,
							editingTextId,
							onStartEditText: handleStartEditText,
							onStopEditText: handleStopEditText,
							componentsRevision,
							canvasRefProp: canvasRef,
							viewportRefProp: viewportRef,
							onStopFollowingAgent: !readOnly && followingAi ? () => persistFollowAi(false) : void 0,
							onAddElement,
							onDropElement: readOnly ? void 0 : onPasteElement,
							onOpenMoreHtml: readOnly ? void 0 : revealInsertPanel,
							onCaptureRegion: readOnly ? void 0 : handleCaptureCanvasRegion,
							chatAreas: chatAreas && chatAreas.chatId === chatTabs[visibleChatIndex]?.id && chatAreas.pageId === activePageId ? chatAreas.marks : null,
							onPickElementForChat: readOnly ? void 0 : handlePickElementForChat,
							pageId: activePageId,
							readOnly,
							initialTransform: urlCenterCamera || pageCamera,
							onUpdateElementStyles,
							onUpdateElementProps,
							onRenameElement,
							pasteStyleSuggestion,
							onApplyPasteStyleClean: applyPasteStyleClean,
							onDismissPasteStyleClean: () => setPasteStyleSuggestion(null),
							componentEditMode: focusedComponentEditSession ? {
								componentName: focusedComponentEditSession.original.componentName,
								filePath: focusedComponentEditSession.sourceInfo?.filePath || "",
								isPreparing: isPreparingComponentEdit,
								onSave: (designerNotes_0) => {
									handleSaveComponentEdit(designerNotes_0);
								},
								onCancel: handleCancelComponentEdit
							} : null,
							agentPresence: agentPresenceColors,
							commentMode,
							onCommentClick: handleCommentClick,
							showCommentTools,
							onToggleCommentMode: () => setCommentMode(!commentMode),
							showResolvedComments,
							onShowResolvedChange,
							commentOverlay: !commentsHidden && (showCommentTools || commentsProp.length > 0) ? (transform_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentPositions, {
								comments: pageComments,
								viewportRef,
								children: (positionedComments) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentPins, {
										comments: positionedComments,
										transform: transform_0,
										activeCommentId,
										onSelectComment: handleSelectComment,
										onMoveComment,
										showResolved: showResolvedComments
									}),
									pendingCommentPosition && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentPositions, {
										comments: draftComments,
										viewportRef,
										children: (t399) => {
											const [position_5] = t399;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentComposer, {
												identityPrompt: commentIdentityPrompt,
												onCreateGuestIdentity: onCreateGuestCommentIdentity,
												allowAttachments: allowCommentAttachments,
												position: {
													canvasX: position_5.canvasX,
													canvasY: position_5.canvasY
												},
												onSubmit: handleCommentSubmit,
												onCancel: () => setPendingCommentPosition(null)
											});
										}
									}),
									activeCommentId && (() => {
										const activeComment = positionedComments.find((c_10) => c_10.id === activeCommentId);
										if (!activeComment || activeComment.canvasX == null || activeComment.canvasY == null) return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentThread, {
											identityPrompt: commentIdentityPrompt,
											onCreateGuestIdentity: onCreateGuestCommentIdentity,
											allowAttachments: allowCommentAttachments,
											comment: activeComment,
											replies: commentRepliesProp,
											currentUserId,
											currentUser,
											onReply: handleCommentReply,
											onResolve: onResolveComment ? () => onResolveComment(activeCommentId) : void 0,
											onUnresolve: onUnresolveComment ? () => onUnresolveComment(activeCommentId) : void 0,
											onDelete: (id_49) => {
												onDeleteComment?.(id_49);
												if (id_49 === activeCommentId) setActiveCommentId(null);
											},
											onEdit: (id_50, body_1, mentions_1) => onEditComment?.(id_50, body_1, mentions_1),
											onReaction: (id_51, emoji) => onToggleReaction?.(id_51, emoji),
											onClose: () => {
												setActiveCommentId(null);
												onActiveCommentChange?.(null);
											}
										});
									})()
								] })
							}) : void 0,
							onStartAltDrag,
							onSelectElements: handleSelectElements
						}, `canvas-${activeTab.id}`)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuContent, {
					className: "min-w-[14rem]",
					onCloseAutoFocus: (e_16) => {
						if (suppressMenuCloseFocusRef.current) {
							e_16.preventDefault();
							suppressMenuCloseFocusRef.current = false;
						}
					},
					children: renderContextMenuItems(canvasMenuTargetId)
				})]
			})]
		});
		$[1145] = activeCommentId;
		$[1146] = activePageId;
		$[1147] = activeTab;
		$[1148] = activeTabLoaded;
		$[1149] = agentPresenceColors;
		$[1150] = allowCommentAttachments;
		$[1151] = applyPasteStyleClean;
		$[1152] = canvasCameraPending;
		$[1153] = canvasMenuTargetId;
		$[1154] = canvasRenderOptions;
		$[1155] = chatAreas;
		$[1156] = chatTabs;
		$[1157] = commentIdentityPrompt;
		$[1158] = commentMode;
		$[1159] = commentRepliesProp;
		$[1160] = commentsHidden;
		$[1161] = commentsProp.length;
		$[1162] = componentsRevision;
		$[1163] = currentUser;
		$[1164] = currentUserId;
		$[1165] = draftComments;
		$[1166] = editingTextId;
		$[1167] = focusedComponentEditSession;
		$[1168] = followingAi;
		$[1169] = handleCancelComponentEdit;
		$[1170] = handleCanvasContextMenu;
		$[1171] = handleCaptureCanvasRegion;
		$[1172] = handleCommentClick;
		$[1173] = handleCommentReply;
		$[1174] = handleCommentSubmit;
		$[1175] = handlePickElementForChat;
		$[1176] = handleSaveComponentEdit;
		$[1177] = handleSelectComment;
		$[1178] = handleSelectElement;
		$[1179] = isPreparingComponentEdit;
		$[1180] = onActiveCommentChange;
		$[1181] = onAddElement;
		$[1182] = onCreateGuestCommentIdentity;
		$[1183] = onDeleteComment;
		$[1184] = onEditComment;
		$[1185] = onMoveComment;
		$[1186] = onPasteElement;
		$[1187] = onResolveComment;
		$[1188] = onShowResolvedChange;
		$[1189] = onStartAltDrag;
		$[1190] = onToggleReaction;
		$[1191] = onUnresolveComment;
		$[1192] = onUpdateElementProps;
		$[1193] = onUpdateElementStyles;
		$[1194] = pageCamera;
		$[1195] = pageComments;
		$[1196] = pasteStyleSuggestion;
		$[1197] = pendingCommentPosition;
		$[1198] = readOnly;
		$[1199] = renderContextMenuItems;
		$[1200] = revealInsertPanel;
		$[1201] = setCommentMode;
		$[1202] = showCommentTools;
		$[1203] = showResolvedComments;
		$[1204] = urlCenterCamera;
		$[1205] = visibleChatIndex;
		$[1206] = t398;
	} else t398 = $[1206];
	let t399;
	if ($[1207] === Symbol.for("react.memo_cache_sentinel")) {
		t399 = () => setShowCreateComponentModal(false);
		$[1207] = t399;
	} else t399 = $[1207];
	let t400;
	if ($[1208] !== onCreateComponent || $[1209] !== showCreateComponentModal) {
		t400 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateComponentModal, {
			isOpen: showCreateComponentModal,
			onClose: t399,
			onConfirm: onCreateComponent
		});
		$[1208] = onCreateComponent;
		$[1209] = showCreateComponentModal;
		$[1210] = t400;
	} else t400 = $[1210];
	let t401;
	if ($[1211] !== compilePreview || $[1212] !== focusedComponent || $[1213] !== mergedComponentIndex || $[1214] !== showVersionHistory) {
		t401 = showVersionHistory && focusedComponent?.filePath && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VersionHistoryModal, {
			componentName: focusedComponent.name,
			filePath: focusedComponent.filePath,
			onClose: () => setShowVersionHistory(false),
			onRestore: (fp) => refreshFocusedComponentRef.current(fp),
			componentIndex: mergedComponentIndex,
			compilePreview
		});
		$[1211] = compilePreview;
		$[1212] = focusedComponent;
		$[1213] = mergedComponentIndex;
		$[1214] = showVersionHistory;
		$[1215] = t401;
	} else t401 = $[1215];
	let t402;
	if ($[1216] !== bottomBarRevealSignal || $[1217] !== chromeHidden || $[1218] !== t392 || $[1219] !== t396 || $[1220] !== t397 || $[1221] !== t398 || $[1222] !== t400 || $[1223] !== t401) {
		t402 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CanvasLayout, {
			chromeHidden,
			bottomBarRevealSignal,
			leftChildren: t392,
			rightChildren: t396,
			bottomChildren: t397,
			children: [
				t398,
				t400,
				t401
			]
		});
		$[1216] = bottomBarRevealSignal;
		$[1217] = chromeHidden;
		$[1218] = t392;
		$[1219] = t396;
		$[1220] = t397;
		$[1221] = t398;
		$[1222] = t400;
		$[1223] = t401;
		$[1224] = t402;
	} else t402 = $[1224];
	let t403;
	if ($[1225] !== assetResolver || $[1226] !== componentIndex || $[1227] !== components || $[1228] !== effectiveProjectPath || $[1229] !== iconLibraries || $[1230] !== previewOpen || $[1231] !== webBaseUrl) {
		t403 = previewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewWindowLive, {
			components,
			componentIndex,
			iconLibraries,
			assetResolver,
			onClose: () => setPreviewOpen(false),
			onPopOut: effectiveProjectPath ? () => {
				const popId = soleSelectedElementId(getSelectedElementIds());
				return window.open(`${webBaseUrl ?? ""}/proto/${effectiveProjectPath}${popId ? `?element=${popId}` : ""}`, "_blank");
			} : void 0
		});
		$[1225] = assetResolver;
		$[1226] = componentIndex;
		$[1227] = components;
		$[1228] = effectiveProjectPath;
		$[1229] = iconLibraries;
		$[1230] = previewOpen;
		$[1231] = webBaseUrl;
		$[1232] = t403;
	} else t403 = $[1232];
	let t404;
	if ($[1233] !== t402 || $[1234] !== t403) {
		t404 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrubSessionContext.Provider, {
			value: scrubSessionValue,
			children: [t402, t403]
		});
		$[1233] = t402;
		$[1234] = t403;
		$[1235] = t404;
	} else t404 = $[1235];
	let t405;
	if ($[1236] !== commentMentionContext || $[1237] !== t404) {
		t405 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorModeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentMentionContext.Provider, {
			value: commentMentionContext,
			children: t404
		}) });
		$[1236] = commentMentionContext;
		$[1237] = t404;
		$[1238] = t405;
	} else t405 = $[1238];
	let t406;
	if ($[1239] !== t391 || $[1240] !== t405) {
		t406 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t390,
			t391,
			t405
		] });
		$[1239] = t391;
		$[1240] = t405;
		$[1241] = t406;
	} else t406 = $[1241];
	return t406;
};
var PetalEditor = (t0) => {
	const $ = (0, import_compiler_runtime.c)(9);
	let assetResolver;
	let props;
	if ($[0] !== t0) {
		({assetResolver, ...props} = t0);
		$[0] = t0;
		$[1] = assetResolver;
		$[2] = props;
	} else {
		assetResolver = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== assetResolver || $[4] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalEditorInner, {
			...props,
			assetResolver
		});
		$[3] = assetResolver;
		$[4] = props;
		$[5] = t1;
	} else t1 = $[5];
	let t2;
	if ($[6] !== assetResolver || $[7] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetProvider, {
			resolver: assetResolver,
			children: t1
		});
		$[6] = assetResolver;
		$[7] = t1;
		$[8] = t2;
	} else t2 = $[8];
	return t2;
};
function _temp$24() {
	return typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
}
function _temp2$14(s_0) {
	return s_0.visibleTree;
}
function _temp3$10(s) {
	return s.visibleTree;
}
function _temp9$3() {
	return /* @__PURE__ */ new Set();
}
function _temp0$2() {
	return /* @__PURE__ */ new Set();
}
function _temp1$2(signal) {
	return signal + 1;
}
function _temp10$2(prev) {
	return !prev;
}
function _temp11$2(f_3) {
	return f_3.path === "SKILL.md";
}
function _temp12$1(n) {
	return n + 1;
}
function _temp13$1(f_5) {
	return f_5.path === "SKILL.md";
}
function _temp14$1() {
	return /* @__PURE__ */ new Set();
}
function _temp15$1() {
	return {
		id: `local-${Date.now()}`,
		title: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function _temp16$1() {}
function _temp17$1(n_0) {
	return n_0 + 1;
}
function _temp18$1(message) {
	return message.role === "user";
}
function _temp19$1(ref) {
	return `${ref.type}: ${ref.displayName ?? ref.name}`;
}
function _temp20$1() {
	return toast.error("Could not save the chat name. Try again.");
}
function _temp21$1() {
	return toast.error("Could not restore chat. Try again from Archived chats.");
}
function _temp22$1(_id, _add) {}
function _temp23$1(_ids) {}
function _temp24$1(_draggedIds, _targetId, _position) {}
function _temp25(_id_0, _name) {
	return false;
}
function _temp26(_id_1) {}
function _temp27(_id_2) {}
function _temp28(parentId, path) {
	return resolveDescendTarget(usePages.getState().tree, parentId, path);
}
function _temp29(f_6) {
	return f_6.kind === "image" && !isEmptyImage(f_6);
}
function _temp30(ids_0) {
	useSelection.getState().select(new Set(ids_0));
}
function _temp31(n_1) {
	return n_1 + 1;
}
function _temp32(mark) {
	return mark.rect;
}
function _temp33(error_1) {
	return toast.error(error_1.message);
}
function _temp34(mention) {
	return mention.id === "agent";
}
function _temp35(mention_0) {
	return mention_0.id === "agent";
}
function _temp36(n_2) {
	return n_2 + 1;
}
function _temp37(p) {
	return {
		id: p.id,
		name: p.name,
		elementCount: countCanvasElements(p.elements)
	};
}
function _temp38(bounds) {
	return bounds ? `${bounds.x},${bounds.y},${bounds.width},${bounds.height}` : "";
}
function _temp39(id_14) {
	return getById(usePages.getState().visibleTree, id_14) ?? [];
}
async function _temp40(elementIds) {
	const elements_0 = [...elementIds].flatMap(_temp39);
	if (!elements_0.length) return;
	const toastId = toast.loading("Copying as PNG…");
	await copyElementsAsPng(elements_0).then((copied) => toast.success(copiedPngMessage(copied), { id: toastId }), (error_2) => toast.error(error_2 instanceof Error ? error_2.message : "Failed to copy as PNG", { id: toastId }));
}
function _temp41() {
	return /* @__PURE__ */ new Set();
}
function _temp42(c) {
	return {
		id: c.id,
		name: c.name || c.id,
		elementCount: countCanvasElements(c.elements)
	};
}
function _temp43(c_4) {
	return {
		id: c_4.id,
		name: c_4.name || c_4.id,
		canvasId: c_4.id,
		canvasPath: `.petal/canvases/${c_4.id}/`,
		backgroundColor: c_4.backgroundColor,
		backgroundToken: c_4.backgroundToken
	};
}
function _temp44(id_15) {
	return usePages.getState().pages.has(id_15);
}
function _temp45() {}
function _temp46(p_3, i_1) {
	return {
		id: p_3.id,
		sortOrder: i_1
	};
}
function _temp47() {}
function _temp48(n_4) {
	return n_4 + 1;
}
function _temp49(entry_1) {
	return entry_1.path;
}
function _temp50(file) {
	return file.path;
}
function _temp51(signal_0) {
	return signal_0 + 1;
}
function _temp52(families) {
	usePages.getState().patchTrees((tree_1) => resetRemovedFonts(tree_1, families));
}
function _temp53() {
	return clearGoogleFontLinks("canvas");
}
function _temp54() {
	return _temp53;
}
function _temp55(tabId_4) {
	return usePages.getState().pages.get(tabId_4)?.tree;
}
function _temp56() {
	return [...getSelectedElementIds()];
}
function _temp57(draggedIds_0, targetId_3, position_2) {
	const store_1 = usePages.getState().tree;
	const moves = planDropMoves(store_1, new Set(draggedIds_0), targetId_3, position_2);
	if (moves.length === 0) return;
	const ops = [];
	let cursor = store_1;
	for (const move of moves) {
		const element_1 = getById(cursor, move.elementId);
		if (move.toParentId && isFlowLayoutElement(move.toParentId) && element_1 && !isRelativeFlowPosition(element_1.styles)) {
			const styleOp = createSetStylesOperation(cursor, move.elementId, positionStylesForPlacement(element_1.styles, "flow"));
			if (styleOp) {
				ops.push(styleOp);
				cursor = applyOperationsToStore(cursor, [styleOp]);
			}
		}
		ops.push(move);
		cursor = applyOperationsToStore(cursor, [move]);
	}
	usePages.getState().applyOps(ops);
}
function _temp58(elementId_4, size, pos_0, transform, companions) {
	const ops_3 = [];
	let cursor_1 = usePages.getState().tree;
	const addOps = (id_22, s_7, p_6, t_10) => {
		const element_3 = getById(cursor_1, id_22);
		if (!element_3) return;
		const newStyles = {
			...element_3.styles || {},
			width: s_7.width,
			height: s_7.height,
			...t_10 !== void 0 ? { transform: t_10 || void 0 } : {}
		};
		const styleOp_1 = createSetStylesOperation(cursor_1, id_22, newStyles);
		if (styleOp_1) {
			ops_3.push(styleOp_1);
			cursor_1 = applyOperationsToStore(cursor_1, [styleOp_1]);
		}
		if (p_6) {
			const posOp = createSetPositionOperation(cursor_1, id_22, p_6);
			if (posOp) {
				ops_3.push(posOp);
				cursor_1 = applyOperationsToStore(cursor_1, [posOp]);
			}
		}
	};
	addOps(elementId_4, size, pos_0, transform);
	for (const c_5 of companions ?? []) addOps(c_5.id, c_5.size, c_5.pos);
	if (ops_3.length > 0) usePages.getState().applyOps(ops_3);
}
function _temp59() {
	return usePages.getState().undo();
}
function _temp60() {
	return usePages.getState().redo();
}
function _temp61(elementId_6, content_5) {
	const normalized = typeof content_5 === "string" ? { text: content_5 } : content_5;
	const cleaned = normalizeTextRuns(usePages.getState().tree, elementId_6, normalized);
	const op_3 = createSetTextOperation(usePages.getState().tree, elementId_6, cleaned);
	if (op_3) usePages.getState().applyOps([op_3]);
}
function _temp62(elementId_7, name_6) {
	const tree_2 = usePages.getState().tree;
	const op_4 = createSetNameOperation(tree_2, elementId_7, name_6);
	if (!op_4) return false;
	usePages.getState().applyOps([op_4]);
	return getById(usePages.getState().tree, elementId_7)?.name === op_4.newName;
}
function _temp63(k) {
	return TEXT_RUN_STYLE_KEYS.has(k);
}
function _temp64(elementId_12, props_0) {
	const op_7 = createSetPropsOperation(usePages.getState().tree, elementId_12, sanitizeElementProps(props_0) ?? {});
	if (op_7) usePages.getState().applyTransientOps([op_7]);
}
function _temp65(oldElementId, newElement) {
	const op_12 = createReplaceOperation(usePages.getState().tree, oldElementId, newElement);
	if (op_12) usePages.getState().applyOps([op_12]);
}
function _temp66(oldElementId_0, newElement_0) {
	usePages.getState().previewElement(oldElementId_0, newElement_0);
}
function _temp67() {
	return usePages.getState().clearPreview();
}
async function _temp68(elementId_16) {
	if (!getById(usePages.getState().tree, elementId_16)) return;
	await copyElementToClipboard(storeSubtreeToLegacyNested(usePages.getState().tree, elementId_16));
}
async function _temp69(elementIds_5) {
	if (elementIds_5.size === 0) return;
	const elementsToCopy = [];
	const sources = [];
	for (const id_26 of elementIds_5) {
		if (!getById(usePages.getState().tree, id_26)) continue;
		elementsToCopy.push(storeSubtreeToLegacyNested(usePages.getState().tree, id_26));
		const parentKey_0 = getParentId(usePages.getState().tree, id_26);
		sources.push(parentKey_0 === "ROOT" || parentKey_0 === null ? "" : parentKey_0);
	}
	if (elementsToCopy.length === 0) return;
	const clipboardData = {
		__petal: true,
		__multi: true,
		sources,
		elements: elementsToCopy
	};
	try {
		await navigator.clipboard.writeText(JSON.stringify(clipboardData));
	} catch (t0) {
		console.error("Failed to copy to clipboard:", t0);
	}
}
function _temp70(p_8) {
	return p_8.charAt(0).toUpperCase() + p_8.slice(1);
}
function _temp71(op_19) {
	return describeOperation(op_19, usePages.getState().tree);
}
function _temp72(d) {
	return !d.canvasOnly;
}
function _temp73(d_0) {
	return `- [${d_0.op.type}] ${d_0.summary}`;
}
function _temp74(element_9, position_4) {
	if (!position_4) return;
	element_9.canvasPosition = position_4;
}
function _temp75(hostId, candidate) {
	const parent_1 = getById(usePages.getState().tree, hostId);
	return !!parent_1 && hasChildren$1(parent_1) && canAcceptChild(parent_1, candidate);
}
function _temp76(i_3) {
	return i_3.kind === "file" && (i_3.type.startsWith("image/") || i_3.type.startsWith("video/"));
}
function _temp77(i_4) {
	return i_4.getAsFile();
}
function _temp78(f_7) {
	return f_7 != null;
}
function _temp79(el_8) {
	return el_8.id;
}
function _temp80(r) {
	return r.left;
}
function _temp81(r_0) {
	return r_0.top;
}
function _temp82(r_1) {
	return r_1.right;
}
function _temp83(r_2) {
	return r_2.bottom;
}
function _temp84(t0) {
	const { first: first_0, layoutDirection: layoutDirection_0 } = t0;
	return {
		id: generatePrefixedId("wrapper"),
		type: "html",
		tag: "div",
		styles: {
			display: "flex",
			flexDirection: layoutDirection_0,
			gap: "8px"
		},
		canvasPosition: first_0.canvasPosition ? { ...first_0.canvasPosition } : void 0
	};
}
function _temp85(t0) {
	const { bbox: bbox_0, scale: scale_4, canvasRect: canvasRect_3 } = t0;
	return {
		id: generatePrefixedId("frame"),
		type: "html",
		tag: "div",
		styles: {
			position: "relative",
			width: Math.round(bbox_0.width / scale_4),
			height: Math.round(bbox_0.height / scale_4)
		},
		canvasPosition: {
			x: (bbox_0.left - canvasRect_3.left) / scale_4,
			y: (bbox_0.top - canvasRect_3.top) / scale_4
		}
	};
}
function _temp86(t0) {
	const { el: el_14, rect: rect_7, bbox: bbox_1, scale: scale_5 } = t0;
	return {
		...el_14.styles || {},
		position: "absolute",
		left: Math.round((rect_7.left - bbox_1.left) / scale_5),
		top: Math.round((rect_7.top - bbox_1.top) / scale_5),
		width: Math.round(rect_7.width / scale_5),
		height: Math.round(rect_7.height / scale_5)
	};
}
function _temp87(key_2) {
	return key_2 + 1;
}
function _temp88(byte) {
	return byte.toString(16).padStart(2, "0");
}
function _temp89() {
	return "done";
}
function _temp90(v) {
	return !v;
}
function _temp91(s_10) {
	return s_10.selectedElementIds;
}
function _temp92(v_0) {
	return !v_0;
}
function _temp93() {
	return usePages.getState().beginCoalescing();
}
function _temp94() {
	return usePages.getState().endCoalescing();
}
function _temp95(s_11) {
	return s_11.visibleTree;
}
function _temp96(s_12) {
	return s_12.visibleTree;
}
function _temp97(s_13) {
	return s_13.visibleTree;
}
function _temp98(s_14) {
	return s_14.pages;
}
function _temp99(cls) {
	return isCompiledClass(document, cls);
}
function _temp100(s_15) {
	return s_15.lastHumanEdit;
}
function _temp101(on_0) {
	const url_0 = new URL(window.location.href);
	if (on_0) url_0.searchParams.set("viewport", "1");
	else url_0.searchParams.delete("viewport");
	window.history.replaceState(window.history.state, "", url_0);
}
function _temp102(chat_1) {
	return {
		id: chat_1.id,
		title: chat_1.title,
		generatedTitle: chat_1.generatedTitle,
		createdAt: chat_1.createdAt
	};
}
function _temp103(tab_21) {
	return tab_21.canvasId ? [{
		id: tab_21.canvasId,
		name: tab_21.name
	}] : [];
}
function _temp104(tab_22) {
	return tab_22.canvasId ? [{
		id: tab_22.canvasId,
		name: tab_22.name
	}] : [];
}
function _temp105(tab_23) {
	return {
		id: tab_23.id,
		title: tab_23.title,
		createdAt: tab_23.createdAt,
		updatedAt: tab_23.createdAt,
		archivedAt: null
	};
}
function _temp106(id_46, src) {
	const node = getById(usePages.getState().tree, id_46);
	const props_1 = { ...node?.props ?? {} };
	props_1.src = src;
	if (node?.tag === "video") props_1.controls = true;
	setElementProps(id_46, props_1);
}
function _temp107() {}
function _temp108(tab_24) {
	return tab_24.canvasId ? [{
		id: tab_24.canvasId,
		name: tab_24.name
	}] : [];
}
function _temp109(tab_25) {
	return tab_25.canvasId ? [{
		id: tab_25.canvasId,
		name: tab_25.name
	}] : [];
}
function _temp110(t_14) {
	return {
		id: t_14.id,
		title: t_14.title,
		createdAt: t_14.createdAt,
		updatedAt: t_14.createdAt,
		archivedAt: null
	};
}

export { PetalEditor };
