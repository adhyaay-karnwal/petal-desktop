// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/EditorView.tsx
import { isCancelledError } from "../../../../vendor/@tanstack/query-core.js";
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { __bundledVitePreload } from "../../../../__bundle__/_vite_preload_helper.js";
import { executeCompiledModuleSource } from "../../../compiler/src/runtime/executeModule.js";
import { getApiUrl, getWebUrl } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime, useSession } from "../hooks/useSession.js";
import { useSeedTemplate } from "../hooks/useProjects.js";
import { invalidateProjectUsage } from "../hooks/useProject.js";
import { useSkillOverrides, useUpdateSkillOverrides } from "../hooks/useSkillOverrides.js";
import { isLoadableIconLibrary } from "../../../compiler/src/runtime/settingsParser.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { toast } from "../../../../vendor/sonner.js";
import { EditorLoadingScreen } from "../../../ui/src/components/EditorLoadingScreen.js";
import { fetchProjectSettings, projectSettingsKey } from "../hooks/useProjectIconSettings.js";
import { useCommentAgentTransport, useCommentMentionPeople } from "../hooks/useComments.js";
import { projectBuilderClient } from "../services/ProjectBuilderClient.js";
import { useComponents } from "../hooks/useComponents.js";
import { useProjectBuilderSession } from "../hooks/useProjectBuilderSession.js";
import { isFigmaNotConnectedError, useFigmaIntegration } from "../hooks/useFigma.js";
import { createCloudBackend } from "../backends/CloudBackend.js";
import { BackendProvider } from "../../../editor/src/backends/BackendContext.js";
import { PetalEditor } from "../../../editor/src/shell/components/PetalEditor.js";
import { FigmaConnectDialog } from "../../../editor/src/shell/components/FigmaConnectDialog.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { applyFonts, cleanupFonts } from "../../../editor/src/canvas/lib/fontUtils.js";
import { FeedbackDialog } from "./ProjectsSidebarFeedback.js";
import { cleanupProjectStylesheet, loadProjectStylesheet } from "../services/projectStylesheet.js";
import { planLimitPayloadFromReason, useOpenUpgradeModal } from "./UpgradeModalProvider.js";
import { ImportDesignSystemDialog, importDesignSystemPrompt } from "./ImportDesignSystemDialog.js";
import { useProjectFonts } from "../hooks/useFonts.js";
import { ProjectFontProvider } from "./ProjectFontProvider.js";
import { logoText_default } from "../assets/logoText.png.js";
import { logoIcon_default } from "../assets/logoIcon.png.js";

/**
* EditorView - Web version of the Electron EditorWithProject
*
* Pipeline:
* 1. Connect project-builder session (SSE)
* 2. Initialize shared React runtime
* 3. Execute server-compiled modules on modules:ready; component index on components:ready
*    (includes cached props when distMeta is warm). Otherwise props stream via
*    components:updated after lazy scan on first component selection.
* 4. Fetch project settings → detect icon libraries, fonts
* 5. Mount PetalEditor
*/
var ICON_LIBRARY_DISPLAY_NAMES = {
	"lucide-react": "Lucide",
	"@phosphor-icons/react": "Phosphor",
	"@heroicons/react": "Heroicons",
	"@heroicons/react/24/outline": "Heroicons Outline",
	"@heroicons/react/24/solid": "Heroicons Solid",
	"@heroicons/react/20/solid": "Heroicons Mini"
};
/**
* No SSE event is guaranteed to arrive if the server's initial build stalls.
* Reconnect once silently, then surface a retry.
*/
var INITIAL_LOAD_TIMEOUT_MS = 2e4;
var INITIAL_LOAD_AUTO_RETRIES = 1;
function getIconLibraryDisplayName(library) {
	if (ICON_LIBRARY_DISPLAY_NAMES[library]) return ICON_LIBRARY_DISPLAY_NAMES[library];
	return (library.split("/").pop() || library).replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
var iconLibraryCache = /* @__PURE__ */ new Map();
/** Modules are cached per library, so equal names, order and modules mean nothing changed. */
function sameIconLibraries(previous, next) {
	const previousKeys = Object.keys(previous);
	const nextKeys = Object.keys(next);
	return previousKeys.length === nextKeys.length && nextKeys.every((key, index) => previousKeys[index] === key && previous[key].icons === next[key].icons);
}
async function getIconLibraryExternal(library) {
	const existing = iconLibraryCache.get(library);
	if (existing) return existing;
	if (!isLoadableIconLibrary(library)) return void 0;
	try {
		const mod = await __bundledVitePreload(() => import(
			/* @vite-ignore */
			`https://esm.sh/${library}?external=react,react-dom`
), [], import.meta.url);
		iconLibraryCache.set(library, mod);
		return mod;
	} catch (err) {
		console.warn(`[EditorView] Failed to load icon library ${library}:`, err);
		return;
	}
}
function EditorView(t0) {
	const $ = (0, import_compiler_runtime.c)(235);
	const { onInitialRender, projectPath, projectAccessToken, readOnly: t1, leftHeader, rightHeader, gitPanel, protoMode: t2, onActivePageChange, onCopySelectionLink, commentProps, createBackend: createBackendProp, onRebuildRef, openPreviewRef, skillActionsRef, flushPreviewRef, allowedPaths, onAddAllowedPath, onRemoveAllowedPath, onClearAllowedPaths, isElectron, onOpenProjectSettings, externalChatDraft, focusChatOnMount, settingsRevision, enableCssEditor: t3, enableComponentEditV2: t4, enableWebviewTweak: t5, enableSkillCustomization: t6, enableSidebarV2: t7, enableAgentsV2: t8, projectName, projectIconUrl, onProjectIconClick, onRenameProject } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const protoMode = t2 === void 0 ? false : t2;
	const enableCssEditor = t3 === void 0 ? false : t3;
	const enableComponentEditV2 = t4 === void 0 ? false : t4;
	const enableWebviewTweak = t5 === void 0 ? false : t5;
	const enableSkillCustomization = t6 === void 0 ? false : t6;
	const enableSidebarV2 = t7 === void 0 ? false : t7;
	const enableAgentsV2 = t8 === void 0 ? false : t8;
	const [feedbackDraft, setFeedbackDraft] = (0, import_react.useState)(null);
	const projectId = projectPath;
	let t9;
	if ($[0] !== commentProps) {
		t9 = !!commentProps?.currentUserId && !commentProps.currentUserId.startsWith("guest:");
		$[0] = commentProps;
		$[1] = t9;
	} else t9 = $[1];
	const mentionPeople = useCommentMentionPeople(projectId, t9);
	const commentAgentTransport = useCommentAgentTransport(projectId);
	const posthog = usePostHog();
	const { session } = useSession();
	const organizationId = session?.activeOrganizationId ?? null;
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [importDraft, setImportDraft] = (0, import_react.useState)(null);
	const chatDraft = importDraft && (!externalChatDraft || importDraft.id > externalChatDraft.id) ? importDraft : externalChatDraft;
	let t10;
	if ($[2] !== isElectron) {
		t10 = isElectron ? () => setImportOpen(true) : void 0;
		$[2] = isElectron;
		$[3] = t10;
	} else t10 = $[3];
	const openImportChooser = t10;
	let t11;
	if ($[4] !== posthog || $[5] !== projectId) {
		t11 = (event) => {
			bb68: switch (event.type) {
				case "canvas_edited":
					posthog.capture("canvas_edited", {
						project_id: projectId,
						page_id: event.pageId,
						edits: event.edits,
						op_types: event.opTypes
					});
					break bb68;
				case "page_populated":
					posthog.capture("page_populated", {
						project_id: projectId,
						page_id: event.pageId,
						element_count: event.elementCount
					});
					break bb68;
				case "ai_chat_started":
					posthog.capture("ai_chat_started", {
						project_id: projectId,
						model: event.model
					});
					break bb68;
				case "ai_chat_completed":
					posthog.capture("ai_chat_completed", {
						project_id: projectId,
						duration_ms: event.durationMs,
						outcome: event.outcome,
						canvas_writes: event.canvasWrites,
						code_writes: event.codeWrites
					});
					break bb68;
				case "export_completed":
					posthog.capture("export_completed", {
						project_id: projectId,
						formats: event.formats,
						count: event.count,
						outcome: event.outcome,
						duration_ms: event.durationMs
					});
					break bb68;
				case "preview_window_opened":
					posthog.capture("preview_window_opened", {
						project_id: projectId,
						trigger: event.trigger
					});
					break bb68;
				case "save_to_code_completed": posthog.capture("save_to_code_completed", {
					project_id: projectId,
					component_name: event.componentName,
					with_notes: event.withNotes,
					success: event.success
				});
			}
		};
		$[4] = posthog;
		$[5] = projectId;
		$[6] = t11;
	} else t11 = $[6];
	const handleActivity = t11;
	const sharedFonts = useProjectFonts(projectId);
	useProjectBuilderSession(projectId, projectAccessToken);
	const fileChangedRef = (0, import_react.useRef)(null);
	let t12;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = (paths) => {
			for (const path of paths) if (/\.(tsx?|jsx?)$/.test(path)) fileChangedRef.current?.(path);
		};
		$[7] = t12;
	} else t12 = $[7];
	const onSourceFilesUpdated = t12;
	let t13;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = { onSourceFilesUpdated };
		$[8] = t13;
	} else t13 = $[8];
	const { initialized, loading, error, components, componentIndex, registryRevision, reload, reconnect, scanLoading, requestPropsScan, waitForComponent, refreshComponentPaths, ensureComponentNames } = useComponents(projectId, t13);
	const upgradeModal = useOpenUpgradeModal();
	let t14;
	if ($[9] !== projectId || $[10] !== upgradeModal) {
		t14 = (payload) => {
			const next = planLimitPayloadFromReason(payload.reason, payload.message);
			if (next) upgradeModal?.openUpgradeModal(next);
			if (payload.reason === "project_size") invalidateProjectUsage(projectId);
		};
		$[9] = projectId;
		$[10] = upgradeModal;
		$[11] = t14;
	} else t14 = $[11];
	const notifyPlanLimit = t14;
	const { data: skillOverridesData } = useSkillOverrides();
	const { mutate: updateSkillOverrides } = useUpdateSkillOverrides(!!(isElectron && enableSkillCustomization));
	let t15;
	if ($[12] !== skillOverridesData?.overrides) {
		t15 = skillOverridesData?.overrides ?? {};
		$[12] = skillOverridesData?.overrides;
		$[13] = t15;
	} else t15 = $[13];
	const skillOverrides = t15;
	let t16;
	if ($[14] !== updateSkillOverrides) {
		t16 = (overrides) => {
			updateSkillOverrides(overrides);
		};
		$[14] = updateSkillOverrides;
		$[15] = t16;
	} else t16 = $[15];
	const handleUpdateSkillOverrides = t16;
	const { openFigmaOAuth, openFigmaOAuthElectron, resolveFigmaImages, ensureFigmaStatus } = useFigmaIntegration(projectId);
	const figmaDialogPromiseRef = (0, import_react.useRef)(null);
	const [figmaDialogOpen, setFigmaDialogOpen] = (0, import_react.useState)(false);
	const [figmaDialogCount, setFigmaDialogCount] = (0, import_react.useState)(0);
	let t17;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = (count) => new Promise((resolve) => {
			figmaDialogPromiseRef.current = { resolve };
			setFigmaDialogCount(count);
			setFigmaDialogOpen(true);
		});
		$[16] = t17;
	} else t17 = $[16];
	const promptFigmaConnect = t17;
	let t18;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = () => {
			setFigmaDialogOpen(false);
			figmaDialogPromiseRef.current?.resolve("connect");
			figmaDialogPromiseRef.current = null;
		};
		$[17] = t18;
	} else t18 = $[17];
	const handleFigmaDialogConnect = t18;
	let t19;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = () => {
			setFigmaDialogOpen(false);
			figmaDialogPromiseRef.current?.resolve("skip");
			figmaDialogPromiseRef.current = null;
		};
		$[18] = t19;
	} else t19 = $[18];
	const handleFigmaDialogSkip = t19;
	let t20;
	if ($[19] !== isElectron || $[20] !== openFigmaOAuth || $[21] !== openFigmaOAuthElectron) {
		t20 = async () => {
			if (isElectron) {
				openFigmaOAuthElectron();
				return new Promise(_temp$13);
			}
			const oauthResult = await openFigmaOAuth();
			if (!oauthResult.connected && oauthResult.error) toast.error(oauthResult.error);
			return oauthResult.connected;
		};
		$[19] = isElectron;
		$[20] = openFigmaOAuth;
		$[21] = openFigmaOAuthElectron;
		$[22] = t20;
	} else t20 = $[22];
	const runFigmaOAuthConnect = t20;
	let t21;
	if ($[23] !== ensureFigmaStatus || $[24] !== resolveFigmaImages || $[25] !== runFigmaOAuthConnect) {
		t21 = async (ctx) => {
			const hashes = ctx.imageHashes;
			let connected;
			try {
				connected = (await ensureFigmaStatus()).connected;
			} catch {
				connected = false;
			}
			if (!connected) {
				if (await promptFigmaConnect(hashes.length) === "skip") return "skip";
				connected = await runFigmaOAuthConnect();
				if (!connected) {
					toast.error("Figma connection failed or was cancelled");
					return "skip";
				}
			}
			const resolveImages = async () => {
				const result = await resolveFigmaImages(ctx.fileKey, hashes);
				if (Object.keys(result.resolved).length === 0) {
					toast.error("Could not fetch images from Figma");
					return "skip";
				}
				return new Map(Object.entries(result.resolved));
			};
			try {
				return await resolveImages();
			} catch (t22) {
				const err = t22;
				if (!isFigmaNotConnectedError(err)) {
					const message = err instanceof Error ? err.message : "Failed to fetch images from Figma";
					toast.error(message);
					return "skip";
				}
				queryClient.invalidateQueries({ queryKey: ["figma-status"] });
				if (await promptFigmaConnect(hashes.length) === "skip") return "skip";
				if (!await runFigmaOAuthConnect()) return "skip";
				try {
					return await resolveImages();
				} catch (t23) {
					const retryErr = t23;
					const message_0 = retryErr instanceof Error ? retryErr.message : "Failed to fetch images from Figma";
					toast.error(message_0);
					return "skip";
				}
			}
		};
		$[23] = ensureFigmaStatus;
		$[24] = resolveFigmaImages;
		$[25] = runFigmaOAuthConnect;
		$[26] = t21;
	} else t21 = $[26];
	const figmaImageResolver = t21;
	const [cssLoaded, setCssLoaded] = (0, import_react.useState)(false);
	const [cssLoadedForProject, setCssLoadedForProject] = (0, import_react.useState)(projectId);
	if (cssLoadedForProject !== projectId) {
		setCssLoadedForProject(projectId);
		setCssLoaded(false);
	}
	let t22;
	if ($[27] !== components || $[28] !== error || $[29] !== loading) {
		t22 = !loading && !!error && Object.keys(components).length === 0;
		$[27] = components;
		$[28] = error;
		$[29] = loading;
		$[30] = t22;
	} else t22 = $[30];
	const isInitialLoading = (loading || !cssLoaded) && !t22;
	const [loadRetries, setLoadRetries] = (0, import_react.useState)(0);
	const [loadTimedOut, setLoadTimedOut] = (0, import_react.useState)(false);
	const [wasInitialLoading, setWasInitialLoading] = (0, import_react.useState)(isInitialLoading);
	if (wasInitialLoading !== isInitialLoading) {
		setWasInitialLoading(isInitialLoading);
		if (!isInitialLoading) {
			setLoadRetries(0);
			setLoadTimedOut(false);
		}
	}
	let t23;
	let t24;
	if ($[31] !== isInitialLoading || $[32] !== loadRetries || $[33] !== reconnect) {
		t23 = () => {
			if (!isInitialLoading) return;
			const timer = setTimeout(() => {
				if (loadRetries < INITIAL_LOAD_AUTO_RETRIES) {
					setLoadRetries(_temp2$8);
					reconnect();
				} else setLoadTimedOut(true);
			}, INITIAL_LOAD_TIMEOUT_MS);
			return () => clearTimeout(timer);
		};
		t24 = [
			isInitialLoading,
			loadRetries,
			reconnect
		];
		$[31] = isInitialLoading;
		$[32] = loadRetries;
		$[33] = reconnect;
		$[34] = t23;
		$[35] = t24;
	} else {
		t23 = $[34];
		t24 = $[35];
	}
	(0, import_react.useEffect)(t23, t24);
	let t25;
	if ($[36] !== reconnect) {
		t25 = () => {
			setLoadRetries(0);
			setLoadTimedOut(false);
			reconnect();
		};
		$[36] = reconnect;
		$[37] = t25;
	} else t25 = $[37];
	const retryInitialLoad = t25;
	let t26;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t26 = {};
		$[38] = t26;
	} else t26 = $[38];
	const [iconLibraries, setIconLibraries] = (0, import_react.useState)(t26);
	const [previewElementId, setPreviewElementId] = (0, import_react.useState)(null);
	const [previewPinLoaded, setPreviewPinLoaded] = (0, import_react.useState)(false);
	const [previewFingerprint, setPreviewFingerprint] = (0, import_react.useState)(null);
	const [copyCodeIncludesComponents, setCopyCodeIncludesComponents] = (0, import_react.useState)(false);
	const [projectFonts, setProjectFonts] = (0, import_react.useState)(void 0);
	const [editorInstanceKey, setEditorInstanceKey] = (0, import_react.useState)(0);
	const { isPending: seedTemplatePending, mutateAsync: seedTemplate } = useSeedTemplate();
	const [compiledClassNames] = (0, import_react.useState)(_temp3$6);
	let t27;
	if ($[39] !== projectId || $[40] !== reload || $[41] !== seedTemplate || $[42] !== seedTemplatePending) {
		t27 = async () => {
			if (seedTemplatePending) return;
			const toastId = toast.loading("Adding shadcn components...");
			try {
				const result_0 = await seedTemplate(projectId);
				if (result_0.designPageId) try {
					localStorage.setItem("petal-active-page", result_0.designPageId);
				} catch {}
				await reload();
				setEditorInstanceKey(_temp4$6);
				let successMessage = "shadcn components added";
				if (result_0.copied === 0) successMessage = "shadcn is already in this file, nothing to add";
				else if (result_0.skipped > 0) successMessage = `Added ${result_0.copied} shadcn files, ${result_0.skipped} already in this file`;
				toast.success(successMessage, { id: toastId });
			} catch (t28) {
				const error_0 = t28;
				let message_1 = "Failed to add shadcn components";
				if (error_0 instanceof Error) message_1 = error_0.message;
				if (message_1 === "404 Not Found") message_1 = "Starter components are unavailable. Restart the API server and try again.";
				toast.error(message_1, { id: toastId });
			}
		};
		$[39] = projectId;
		$[40] = reload;
		$[41] = seedTemplate;
		$[42] = seedTemplatePending;
		$[43] = t27;
	} else t27 = $[43];
	const handleAddShadcnComponents = t27;
	let t28;
	if ($[44] !== compiledClassNames) {
		t28 = (classes) => {
			for (const cls of classes) compiledClassNames.add(cls);
		};
		$[44] = compiledClassNames;
		$[45] = t28;
	} else t28 = $[45];
	const applyCompiledClasses = t28;
	const previewCssKeyRef = (0, import_react.useRef)(null);
	let t29;
	if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = /* @__PURE__ */ new Map();
		$[46] = t29;
	} else t29 = $[46];
	const previewModuleKeysRef = (0, import_react.useRef)(t29);
	let t30;
	if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = () => {
			if (previewCssKeyRef.current === null) return null;
			return [previewCssKeyRef.current, ...[...previewModuleKeysRef.current.values()].sort()].join("|");
		};
		$[47] = t30;
	} else t30 = $[47];
	const getPreviewBuildKey = t30;
	let t31;
	let t32;
	if ($[48] !== projectId) {
		t31 = () => {
			previewModuleKeysRef.current = /* @__PURE__ */ new Map();
			return projectBuilderClient.on((event_0) => {
				if (event_0.type !== "modules:ready" && event_0.type !== "modules:updated") return;
				if (event_0.type === "modules:ready") previewModuleKeysRef.current.clear();
				const modules = event_0.payload?.modules;
				for (const module of Array.isArray(modules) ? modules : []) previewModuleKeysRef.current.set(module.path, module.codeUrl.split("?")[0]);
			}, projectId);
		};
		t32 = [projectId];
		$[48] = projectId;
		$[49] = t31;
		$[50] = t32;
	} else {
		t31 = $[49];
		t32 = $[50];
	}
	(0, import_react.useEffect)(t31, t32);
	let t33;
	let t34;
	if ($[51] !== applyCompiledClasses || $[52] !== projectId) {
		t33 = () => {
			previewCssKeyRef.current = null;
			return projectBuilderClient.on((event_1) => {
				if (event_1.type === "css:ready") {
					const payload_0 = event_1.payload;
					const cssKey = payload_0?.cssUrl?.split("?")[0] ?? "";
					if (payload_0?.cssUrl) loadProjectStylesheet(projectId, payload_0.cssUrl, {
						fontUrls: payload_0.fontUrls,
						compiledClasses: payload_0.compiledClasses,
						onCompiledClasses: applyCompiledClasses
					}).then(() => {
						previewCssKeyRef.current = cssKey;
						setCssLoaded(true);
					}).catch((err_0) => {
						console.error("[EditorView] css:ready load failed:", err_0);
						previewCssKeyRef.current = cssKey;
						setCssLoaded(true);
					});
					else {
						previewCssKeyRef.current = cssKey;
						setCssLoaded(true);
					}
				}
			}, projectId);
		};
		t34 = [projectId, applyCompiledClasses];
		$[51] = applyCompiledClasses;
		$[52] = projectId;
		$[53] = t33;
		$[54] = t34;
	} else {
		t33 = $[53];
		t34 = $[54];
	}
	(0, import_react.useEffect)(t33, t34);
	let t35;
	if ($[55] !== waitForComponent) {
		t35 = async (componentName) => {
			await waitForComponent(componentName);
		};
		$[55] = waitForComponent;
		$[56] = t35;
	} else t35 = $[56];
	const onComponentCreated = t35;
	let t36;
	let t37;
	if ($[57] !== projectId || $[58] !== refreshComponentPaths || $[59] !== reload) {
		t36 = () => {
			const onWorkspaceFile = (e) => {
				const detail = e.detail;
				if (!detail || detail.projectId !== projectId) return;
				if (detail.deleted) {
					reload().then(() => {
						fileChangedRef.current?.(detail.path);
					});
					return;
				}
				onSourceFilesUpdated([detail.path]);
				if (/\.(tsx?|jsx?)$/.test(detail.path)) refreshComponentPaths([detail.path]);
			};
			const onStoreUpdated = (e_0) => {
				const detail_0 = e_0.detail;
				if (!detail_0 || detail_0.projectId !== projectId) return;
				reload();
			};
			window.addEventListener("petal-workspace-file-changed", onWorkspaceFile);
			window.addEventListener("petal-project-store-updated", onStoreUpdated);
			return () => {
				window.removeEventListener("petal-workspace-file-changed", onWorkspaceFile);
				window.removeEventListener("petal-project-store-updated", onStoreUpdated);
			};
		};
		t37 = [
			projectId,
			onSourceFilesUpdated,
			reload,
			refreshComponentPaths
		];
		$[57] = projectId;
		$[58] = refreshComponentPaths;
		$[59] = reload;
		$[60] = t36;
		$[61] = t37;
	} else {
		t36 = $[60];
		t37 = $[61];
	}
	(0, import_react.useEffect)(t36, t37);
	const [backendChangedFile, setBackendChangedFile] = (0, import_react.useState)(null);
	let t38;
	let t39;
	if ($[62] !== backendChangedFile || $[63] !== refreshComponentPaths) {
		t38 = () => {
			if (!backendChangedFile) return;
			onSourceFilesUpdated([backendChangedFile.path]);
			if (backendChangedFile.deleted) return;
			refreshComponentPaths([backendChangedFile.path]);
		};
		t39 = [
			backendChangedFile,
			onSourceFilesUpdated,
			refreshComponentPaths
		];
		$[62] = backendChangedFile;
		$[63] = refreshComponentPaths;
		$[64] = t38;
		$[65] = t39;
	} else {
		t38 = $[64];
		t39 = $[65];
	}
	(0, import_react.useEffect)(t38, t39);
	const [settingsNonce, setSettingsNonce] = (0, import_react.useState)(0);
	const backendFactory = createBackendProp ?? createCloudBackend;
	let t40;
	if ($[66] === Symbol.for("react.memo_cache_sentinel")) {
		t40 = () => setSettingsNonce(_temp5$5);
		$[66] = t40;
	} else t40 = $[66];
	let t41;
	if ($[67] !== projectId || $[68] !== upgradeModal) {
		t41 = (payload_1) => {
			const next_0 = planLimitPayloadFromReason(payload_1.reason, payload_1.message);
			if (next_0) upgradeModal?.openUpgradeModal(next_0);
			if (payload_1.reason === "project_size") invalidateProjectUsage(projectId);
		};
		$[67] = projectId;
		$[68] = upgradeModal;
		$[69] = t41;
	} else t41 = $[69];
	let t42;
	if ($[70] !== isElectron) {
		t42 = isElectron ? (filePath) => {
			if (/\.(tsx?|jsx?)$/.test(filePath)) setBackendChangedFile((prev) => ({
				path: filePath,
				n: (prev?.n ?? 0) + 1
			}));
		} : void 0;
		$[70] = isElectron;
		$[71] = t42;
	} else t42 = $[71];
	let t43;
	if ($[72] !== isElectron) {
		t43 = isElectron ? (filePath_0) => {
			if (/\.(tsx?|jsx?)$/.test(filePath_0)) setBackendChangedFile((prev_0) => ({
				path: filePath_0,
				n: (prev_0?.n ?? 0) + 1,
				deleted: true
			}));
		} : void 0;
		$[72] = isElectron;
		$[73] = t43;
	} else t43 = $[73];
	let t44;
	if ($[74] !== backendFactory || $[75] !== compiledClassNames || $[76] !== projectId || $[77] !== t41 || $[78] !== t42 || $[79] !== t43) {
		t44 = backendFactory(projectId, {
			compiledClasses: compiledClassNames,
			onSettingsChanged: t40,
			onPlanLimit: t41,
			onFileChanged: t42,
			onFileDeleted: t43
		});
		$[74] = backendFactory;
		$[75] = compiledClassNames;
		$[76] = projectId;
		$[77] = t41;
		$[78] = t42;
		$[79] = t43;
		$[80] = t44;
	} else t44 = $[80];
	const backend = t44;
	let t45;
	let t46;
	if ($[81] !== backend) {
		t45 = () => () => {
			backend.dispose?.();
		};
		t46 = [backend];
		$[81] = backend;
		$[82] = t45;
		$[83] = t46;
	} else {
		t45 = $[82];
		t46 = $[83];
	}
	(0, import_react.useEffect)(t45, t46);
	let t47;
	if ($[84] !== projectId) {
		t47 = async (sourceCode, componentName_0) => {
			const result_1 = await projectBuilderClient.compileSnapshotPreview(projectId, { code: sourceCode });
			if (!result_1.success || !result_1.compiledCode) return null;
			const exports = await executeCompiledModuleSource(result_1.compiledCode);
			if (typeof exports.default === "function") return exports.default;
			if (typeof exports[componentName_0] === "function") return exports[componentName_0];
			for (const [name, value] of Object.entries(exports)) if (/^[A-Z]/.test(name) && typeof value === "function") return value;
			return null;
		};
		$[84] = projectId;
		$[85] = t47;
	} else t47 = $[85];
	const compilePreview = t47;
	const handleRebuild = _temp6$3;
	let t48;
	let t49;
	if ($[86] !== onRebuildRef) {
		t48 = () => {
			if (onRebuildRef) onRebuildRef.current = handleRebuild;
			return () => {
				if (onRebuildRef) onRebuildRef.current = null;
			};
		};
		t49 = [handleRebuild, onRebuildRef];
		$[86] = onRebuildRef;
		$[87] = t48;
		$[88] = t49;
	} else {
		t48 = $[87];
		t49 = $[88];
	}
	(0, import_react.useEffect)(t48, t49);
	let t50;
	if ($[89] !== projectId) {
		t50 = (url) => {
			if (url.startsWith("/")) return `${getApiUrl()}/projects/${projectId}/assets/by-path?path=${encodeURIComponent(url.slice(1))}`;
			return url;
		};
		$[89] = projectId;
		$[90] = t50;
	} else t50 = $[90];
	const assetResolver = t50;
	let t51;
	let t52;
	if ($[91] !== projectId) {
		t51 = () => () => {
			cleanupProjectStylesheet(projectId);
			cleanupFonts();
			queryClient.invalidateQueries({
				queryKey: projectSettingsKey(projectId),
				refetchType: "none"
			});
		};
		t52 = [projectId];
		$[91] = projectId;
		$[92] = t51;
		$[93] = t52;
	} else {
		t51 = $[92];
		t52 = $[93];
	}
	(0, import_react.useEffect)(t51, t52);
	let t53;
	if ($[94] === Symbol.for("react.memo_cache_sentinel")) {
		t53 = Promise.resolve();
		$[94] = t53;
	} else t53 = $[94];
	const pinQueueRef = (0, import_react.useRef)(t53);
	const pinRevisionRef = (0, import_react.useRef)(0);
	let t54;
	if ($[95] !== projectId) {
		t54 = (elementId) => {
			pinRevisionRef.current = pinRevisionRef.current + 1;
			const save = pinQueueRef.current.then(async () => {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/settings/preview-element`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ elementId })
				});
				if (!res.ok) throw new Error(`Failed to update thumbnail: ${res.status}`);
				setPreviewElementId(elementId);
			});
			pinQueueRef.current = save.catch(_temp7$2);
			return save;
		};
		$[95] = projectId;
		$[96] = t54;
	} else t54 = $[96];
	const setPreviewElement = t54;
	const settingsLoadedForRef = (0, import_react.useRef)(null);
	let t55;
	if ($[97] !== projectId) {
		t55 = async () => {
			const refresh = settingsLoadedForRef.current === projectId;
			settingsLoadedForRef.current = projectId;
			const settingsQuery = {
				queryKey: projectSettingsKey(projectId),
				queryFn: () => fetchProjectSettings(projectId)
			};
			const request = refresh ? queryClient.cancelQueries({ queryKey: settingsQuery.queryKey }).then(() => queryClient.fetchQuery({
				...settingsQuery,
				staleTime: 0
			})) : queryClient.fetchQuery(settingsQuery);
			const pinRevision = pinRevisionRef.current;
			let settings;
			try {
				settings = await request;
			} catch (t56) {
				const err_2 = t56;
				if (isCancelledError(err_2)) return;
				console.warn("[EditorView] Failed to load settings:", err_2);
				return;
			}
			const libraryNames = settings.iconLibraries ?? [];
			const libraryModules = await Promise.all(libraryNames.map(_temp8$2));
			const activeLibs = {};
			libraryNames.forEach((library_0, index) => {
				const icons = libraryModules[index];
				if (icons) activeLibs[library_0] = {
					icons,
					displayName: getIconLibraryDisplayName(library_0)
				};
			});
			setIconLibraries((previous) => sameIconLibraries(previous, activeLibs) ? previous : activeLibs);
			if (pinRevision === pinRevisionRef.current) setPreviewElementId(settings.previewElementId ?? null);
			setPreviewPinLoaded(true);
			setPreviewFingerprint(settings.previewFingerprint ?? null);
			setCopyCodeIncludesComponents(settings.copyCodeIncludesComponents === true);
			const fonts = settings.fonts;
			if (fonts) {
				const hasGoogle = fonts.google.length > 0;
				const hasLocal = fonts.local.length > 0;
				if (hasGoogle || hasLocal) {
					applyFonts(fonts, (relativePath) => `${getApiUrl()}/projects/${projectId}/assets/by-path?path=${encodeURIComponent(relativePath)}`);
					setProjectFonts(fonts);
				} else {
					cleanupFonts();
					setProjectFonts(fonts);
				}
			}
		};
		$[97] = projectId;
		$[98] = t55;
	} else t55 = $[98];
	const loadSettings = (0, import_react.useEffectEvent)(t55);
	let t56;
	if ($[99] !== initialized || $[100] !== loadSettings) {
		t56 = () => {
			if (!initialized) return;
			loadSettings();
		};
		$[99] = initialized;
		$[100] = loadSettings;
		$[101] = t56;
	} else t56 = $[101];
	let t57;
	if ($[102] !== initialized || $[103] !== projectId || $[104] !== settingsNonce || $[105] !== settingsRevision) {
		t57 = [
			initialized,
			projectId,
			settingsRevision,
			settingsNonce
		];
		$[102] = initialized;
		$[103] = projectId;
		$[104] = settingsNonce;
		$[105] = settingsRevision;
		$[106] = t57;
	} else t57 = $[106];
	(0, import_react.useEffect)(t56, t57);
	let t58;
	if ($[107] !== components || $[108] !== error || $[109] !== isInitialLoading || $[110] !== loadTimedOut) {
		t58 = loadTimedOut || !isInitialLoading && !!error && Object.keys(components).length === 0;
		$[107] = components;
		$[108] = error;
		$[109] = isInitialLoading;
		$[110] = loadTimedOut;
		$[111] = t58;
	} else t58 = $[111];
	const initialRenderReady = t58;
	let t59;
	if ($[112] !== onInitialRender) {
		t59 = () => onInitialRender?.();
		$[112] = onInitialRender;
		$[113] = t59;
	} else t59 = $[113];
	const notifyInitialRender = (0, import_react.useEffectEvent)(t59);
	let t60;
	if ($[114] !== initialRenderReady || $[115] !== notifyInitialRender) {
		t60 = () => {
			if (!initialRenderReady) return;
			let secondFrame = 0;
			const firstFrame = requestAnimationFrame(() => {
				secondFrame = requestAnimationFrame(() => notifyInitialRender());
			});
			return () => {
				cancelAnimationFrame(firstFrame);
				cancelAnimationFrame(secondFrame);
			};
		};
		$[114] = initialRenderReady;
		$[115] = notifyInitialRender;
		$[116] = t60;
	} else t60 = $[116];
	let t61;
	if ($[117] !== initialRenderReady) {
		t61 = [initialRenderReady];
		$[117] = initialRenderReady;
		$[118] = t61;
	} else t61 = $[118];
	(0, import_react.useEffect)(t60, t61);
	sharedFonts.data?.faces;
	let t62;
	if ($[119] !== projectFonts?.google || $[120] !== projectFonts?.local || $[121] !== sharedFonts.data?.faces) {
		const shared = /* @__PURE__ */ new Map();
		for (const face of sharedFonts.data?.faces ?? []) {
			let family = shared.get(face.family);
			if (!family) {
				family = {
					name: face.family,
					variable: "",
					files: []
				};
				shared.set(face.family, family);
			}
			family.files.push({
				path: face.path,
				weight: face.weight,
				style: face.style
			});
		}
		let t63;
		if ($[123] !== projectFonts?.google) {
			t63 = projectFonts?.google ?? [];
			$[123] = projectFonts?.google;
			$[124] = t63;
		} else t63 = $[124];
		let t64;
		if ($[125] !== projectFonts?.local) {
			t64 = projectFonts?.local ?? [];
			$[125] = projectFonts?.local;
			$[126] = t64;
		} else t64 = $[126];
		t62 = {
			google: t63,
			local: [...t64, ...shared.values()]
		};
		$[119] = projectFonts?.google;
		$[120] = projectFonts?.local;
		$[121] = sharedFonts.data?.faces;
		$[122] = t62;
	} else t62 = $[122];
	const availableFonts = t62;
	if (isInitialLoading && !loadTimedOut) {
		let t63;
		if ($[127] === Symbol.for("react.memo_cache_sentinel")) {
			t63 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorLoadingScreen, { logoSrc: logoIcon_default });
			$[127] = t63;
		} else t63 = $[127];
		return t63;
	}
	const timedOut = loadTimedOut && isInitialLoading;
	if (timedOut || error && Object.keys(components).length === 0) {
		let t63;
		if ($[128] !== error || $[129] !== timedOut) {
			t63 = !timedOut && /fetch|network|ERR_|ECONNREFUSED|Failed to fetch/i.test(String(error));
			$[128] = error;
			$[129] = timedOut;
			$[130] = t63;
		} else t63 = $[130];
		const isNetworkError = t63;
		let t64;
		if ($[131] === Symbol.for("react.memo_cache_sentinel")) {
			t64 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: logoText_default,
				alt: "Petal",
				className: "h-7 w-auto [.editor-dark_&]:invert"
			});
			$[131] = t64;
		} else t64 = $[131];
		const t65 = timedOut ? "This file is taking a while to load" : isNetworkError ? "Can't reach the server" : "Couldn't load this file";
		let t66;
		if ($[132] !== t65) {
			t66 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "xl",
				weight: "medium",
				children: t65
			});
			$[132] = t65;
			$[133] = t66;
		} else t66 = $[133];
		const t67 = timedOut ? "The first build of a file can take a moment. Try again to reconnect." : isNetworkError ? "Check your connection and try again." : "Something went wrong loading your components. This usually clears up on its own.";
		let t68;
		if ($[134] !== t67) {
			t68 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "sm",
				variant: "tertiary",
				className: "mt-1",
				children: t67
			});
			$[134] = t67;
			$[135] = t68;
		} else t68 = $[135];
		let t69;
		if ($[136] !== t66 || $[137] !== t68) {
			t69 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-8 flex flex-col gap-1",
				children: [t66, t68]
			});
			$[136] = t66;
			$[137] = t68;
			$[138] = t69;
		} else t69 = $[138];
		let t70;
		if ($[139] !== error || $[140] !== isNetworkError || $[141] !== timedOut) {
			t70 = !timedOut && !isNetworkError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-32 overflow-auto px-3 py-2 bg-ed-muted rounded text-xs font-mono text-ed-foreground whitespace-pre-wrap break-words",
				children: error
			});
			$[139] = error;
			$[140] = isNetworkError;
			$[141] = timedOut;
			$[142] = t70;
		} else t70 = $[142];
		let t71;
		if ($[143] !== retryInitialLoad) {
			t71 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: retryInitialLoad,
				className: "w-full",
				children: "Try again"
			});
			$[143] = retryInitialLoad;
			$[144] = t71;
		} else t71 = $[144];
		let t72;
		if ($[145] !== t70 || $[146] !== t71) {
			t72 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 px-8 pt-2 pb-10",
				children: [t70, t71]
			});
			$[145] = t70;
			$[146] = t71;
			$[147] = t72;
		} else t72 = $[147];
		let t73;
		if ($[148] !== t69 || $[149] !== t72) {
			t73 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center w-full h-full bg-ed-muted gap-8",
				children: [t64, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-[400px] flex flex-col overflow-hidden rounded-3xl border border-ed-border shadow-2xl/7 bg-ed-background",
					children: [t69, t72]
				})]
			});
			$[148] = t69;
			$[149] = t72;
			$[150] = t73;
		} else t73 = $[150];
		return t73;
	}
	const t63 = !!isElectron;
	const t64 = !readOnly;
	const t65 = readOnly ? void 0 : setPreviewElement;
	let t66;
	if ($[151] === Symbol.for("react.memo_cache_sentinel")) {
		t66 = getWebUrl();
		$[151] = t66;
	} else t66 = $[151];
	const t67 = readOnly ? void 0 : figmaImageResolver;
	let t68;
	if ($[152] !== commentAgentTransport || $[153] !== commentProps || $[154] !== mentionPeople || $[155] !== readOnly) {
		t68 = commentProps ? {
			commentMentionPeople: mentionPeople.data ?? [],
			commentAgentTransport: readOnly ? void 0 : commentAgentTransport,
			comments: commentProps.comments,
			commentReplies: commentProps.commentReplies,
			commentsLoading: commentProps.commentsLoading,
			commentsError: commentProps.commentsError,
			onRetryComments: commentProps.onRetryComments,
			currentUserId: commentProps.currentUserId,
			currentUser: commentProps.currentUser,
			onCreateComment: commentProps.onCreateComment,
			onCreateReply: commentProps.onCreateReply,
			commentIdentityPrompt: commentProps.commentIdentityPrompt,
			onCreateGuestCommentIdentity: commentProps.onCreateGuestCommentIdentity,
			allowCommentAttachments: commentProps.allowCommentAttachments,
			onResolveComment: commentProps.onResolveComment,
			onUnresolveComment: commentProps.onUnresolveComment,
			onDeleteComment: commentProps.onDeleteComment,
			onEditComment: commentProps.onEditComment,
			onToggleReaction: commentProps.onToggleReaction,
			onActiveCommentChange: commentProps.onActiveCommentChange,
			onMoveComment: commentProps.onMoveComment,
			showCommentTools: commentProps.showCommentTools,
			commentModeActive: commentProps.commentModeActive,
			onCommentModeChange: commentProps.onCommentModeChange,
			showResolvedComments: commentProps.showResolvedComments,
			onShowResolvedChange: commentProps.onShowResolvedChange,
			commentsHidden: commentProps.commentsHidden,
			onCommentsHiddenChange: commentProps.onCommentsHiddenChange
		} : {};
		$[152] = commentAgentTransport;
		$[153] = commentProps;
		$[154] = mentionPeople;
		$[155] = readOnly;
		$[156] = t68;
	} else t68 = $[156];
	let t69;
	if ($[157] !== allowedPaths || $[158] !== assetResolver || $[159] !== availableFonts || $[160] !== chatDraft || $[161] !== compilePreview || $[162] !== componentIndex || $[163] !== components || $[164] !== copyCodeIncludesComponents || $[165] !== editorInstanceKey || $[166] !== enableAgentsV2 || $[167] !== enableComponentEditV2 || $[168] !== enableCssEditor || $[169] !== enableSidebarV2 || $[170] !== enableSkillCustomization || $[171] !== enableWebviewTweak || $[172] !== ensureComponentNames || $[173] !== flushPreviewRef || $[174] !== focusChatOnMount || $[175] !== gitPanel || $[176] !== handleActivity || $[177] !== handleAddShadcnComponents || $[178] !== handleUpdateSkillOverrides || $[179] !== iconLibraries || $[180] !== isElectron || $[181] !== leftHeader || $[182] !== notifyPlanLimit || $[183] !== onActivePageChange || $[184] !== onAddAllowedPath || $[185] !== onClearAllowedPaths || $[186] !== onComponentCreated || $[187] !== onCopySelectionLink || $[188] !== onInitialRender || $[189] !== onOpenProjectSettings || $[190] !== onProjectIconClick || $[191] !== onRemoveAllowedPath || $[192] !== onRenameProject || $[193] !== openImportChooser || $[194] !== openPreviewRef || $[195] !== previewElementId || $[196] !== previewFingerprint || $[197] !== previewPinLoaded || $[198] !== projectIconUrl || $[199] !== projectId || $[200] !== projectName || $[201] !== protoMode || $[202] !== readOnly || $[203] !== refreshComponentPaths || $[204] !== registryRevision || $[205] !== requestPropsScan || $[206] !== rightHeader || $[207] !== scanLoading || $[208] !== skillActionsRef || $[209] !== skillOverrides || $[210] !== t65 || $[211] !== t67 || $[212] !== t68) {
		t69 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalEditor, {
			onInitialCanvasReady: onInitialRender,
			onFeedback: setFeedbackDraft,
			components,
			componentIndex,
			componentsRevision: registryRevision,
			onProjectFilesEdited: refreshComponentPaths,
			iconLibraries,
			fonts: availableFonts,
			previewElementId,
			previewPinLoaded,
			previewFingerprint,
			copyCodeIncludesComponents,
			getPreviewBuildKey,
			flushPreviewRef,
			onSetPreviewElement: t65,
			assetResolver,
			projectPath: projectId,
			webBaseUrl: t66,
			compilePreview,
			onPlanLimit: notifyPlanLimit,
			readOnly,
			leftHeader,
			rightHeader,
			protoMode,
			gitPanel,
			onFileChangedRef: fileChangedRef,
			onComponentCreated,
			onActivity: handleActivity,
			serverDrivenFileRefresh: true,
			openPreviewRef,
			onActivePageChange,
			skillActionsRef,
			onCopySelectionLink,
			scanLoading,
			onRequestPropsScan: requestPropsScan,
			onEnsureComponentNames: ensureComponentNames,
			allowedPaths,
			onAddAllowedPath,
			onRemoveAllowedPath,
			onClearAllowedPaths,
			isElectron,
			onOpenProjectSettings,
			externalChatDraft: chatDraft,
			focusChatOnMount,
			onImportDesignSystem: openImportChooser,
			enableCssEditor,
			enableComponentEditV2,
			enableWebviewTweak,
			enableSkillCustomization,
			enableSidebarV2,
			enableAgentsV2,
			projectName,
			projectIconUrl,
			onProjectIconClick,
			onRenameProject,
			skillOverrides,
			onUpdateSkillOverrides: handleUpdateSkillOverrides,
			onAddShadcnComponents: handleAddShadcnComponents,
			figmaImageResolver: t67,
			...t68
		}, editorInstanceKey);
		$[157] = allowedPaths;
		$[158] = assetResolver;
		$[159] = availableFonts;
		$[160] = chatDraft;
		$[161] = compilePreview;
		$[162] = componentIndex;
		$[163] = components;
		$[164] = copyCodeIncludesComponents;
		$[165] = editorInstanceKey;
		$[166] = enableAgentsV2;
		$[167] = enableComponentEditV2;
		$[168] = enableCssEditor;
		$[169] = enableSidebarV2;
		$[170] = enableSkillCustomization;
		$[171] = enableWebviewTweak;
		$[172] = ensureComponentNames;
		$[173] = flushPreviewRef;
		$[174] = focusChatOnMount;
		$[175] = gitPanel;
		$[176] = handleActivity;
		$[177] = handleAddShadcnComponents;
		$[178] = handleUpdateSkillOverrides;
		$[179] = iconLibraries;
		$[180] = isElectron;
		$[181] = leftHeader;
		$[182] = notifyPlanLimit;
		$[183] = onActivePageChange;
		$[184] = onAddAllowedPath;
		$[185] = onClearAllowedPaths;
		$[186] = onComponentCreated;
		$[187] = onCopySelectionLink;
		$[188] = onInitialRender;
		$[189] = onOpenProjectSettings;
		$[190] = onProjectIconClick;
		$[191] = onRemoveAllowedPath;
		$[192] = onRenameProject;
		$[193] = openImportChooser;
		$[194] = openPreviewRef;
		$[195] = previewElementId;
		$[196] = previewFingerprint;
		$[197] = previewPinLoaded;
		$[198] = projectIconUrl;
		$[199] = projectId;
		$[200] = projectName;
		$[201] = protoMode;
		$[202] = readOnly;
		$[203] = refreshComponentPaths;
		$[204] = registryRevision;
		$[205] = requestPropsScan;
		$[206] = rightHeader;
		$[207] = scanLoading;
		$[208] = skillActionsRef;
		$[209] = skillOverrides;
		$[210] = t65;
		$[211] = t67;
		$[212] = t68;
		$[213] = t69;
	} else t69 = $[213];
	let t70;
	if ($[214] !== figmaDialogCount || $[215] !== figmaDialogOpen) {
		t70 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigmaConnectDialog, {
			open: figmaDialogOpen,
			imageCount: figmaDialogCount,
			onConnect: handleFigmaDialogConnect,
			onSkip: handleFigmaDialogSkip
		});
		$[214] = figmaDialogCount;
		$[215] = figmaDialogOpen;
		$[216] = t70;
	} else t70 = $[216];
	let t71;
	if ($[217] !== importOpen || $[218] !== onAddAllowedPath || $[219] !== organizationId || $[220] !== projectId) {
		t71 = importOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDesignSystemDialog, {
			projectId,
			organizationId,
			onAddAllowedPath,
			onStart: () => setImportDraft({
				id: Date.now(),
				text: "",
				send: false
			}),
			onSource: (localPath) => {
				setImportOpen(false);
				setImportDraft({
					id: Date.now(),
					text: importDesignSystemPrompt(localPath),
					send: true
				});
			},
			onClose: () => setImportOpen(false)
		});
		$[217] = importOpen;
		$[218] = onAddAllowedPath;
		$[219] = organizationId;
		$[220] = projectId;
		$[221] = t71;
	} else t71 = $[221];
	let t72;
	if ($[222] !== feedbackDraft) {
		t72 = feedbackDraft !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackDialog, {
			open: true,
			initialMessage: feedbackDraft,
			onOpenChange: (open) => {
				if (!open) setFeedbackDraft(null);
			}
		});
		$[222] = feedbackDraft;
		$[223] = t72;
	} else t72 = $[223];
	let t73;
	if ($[224] !== backend || $[225] !== t69 || $[226] !== t70 || $[227] !== t71 || $[228] !== t72) {
		t73 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BackendProvider, {
			backend,
			children: [
				t69,
				t70,
				t71,
				t72
			]
		});
		$[224] = backend;
		$[225] = t69;
		$[226] = t70;
		$[227] = t71;
		$[228] = t72;
		$[229] = t73;
	} else t73 = $[229];
	let t74;
	if ($[230] !== projectId || $[231] !== t63 || $[232] !== t64 || $[233] !== t73) {
		t74 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectFontProvider, {
			projectId,
			desktop: t63,
			canEdit: t64,
			children: t73
		}, projectId);
		$[230] = projectId;
		$[231] = t63;
		$[232] = t64;
		$[233] = t73;
		$[234] = t74;
	} else t74 = $[234];
	return t74;
}
function _temp8$2(library) {
	return getIconLibraryExternal(library);
}
function _temp7$2() {}
async function _temp6$3() {
	try {
		await projectBuilderClient.scanComponents({ forceRescan: true });
	} catch (t0) {
		const err_1 = t0;
		console.error("[EditorView] Rebuild failed:", err_1);
		throw err_1;
	}
}
function _temp5$5(n_0) {
	return n_0 + 1;
}
function _temp4$6(key) {
	return key + 1;
}
function _temp3$6() {
	return /* @__PURE__ */ new Set();
}
function _temp2$8(n) {
	return n + 1;
}
function _temp$13(resolve_0) {
	const cleanup = () => {
		window.clearTimeout(timeout);
		window.removeEventListener("petal-figma-connected", onConnected);
		window.removeEventListener("petal-figma-connect-failed", onFailed);
	};
	const timeout = window.setTimeout(() => {
		cleanup();
		resolve_0(false);
	}, 12e4);
	const onConnected = () => {
		cleanup();
		queryClient.invalidateQueries({ queryKey: ["figma-status"] });
		resolve_0(true);
	};
	const onFailed = () => {
		cleanup();
		resolve_0(false);
	};
	window.addEventListener("petal-figma-connected", onConnected);
	window.addEventListener("petal-figma-connect-failed", onFailed);
}

export { EditorView };
