// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/App.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getWebSettingsUrl, getWebUrl } from "../../../../packages/cloud/src/client.js";
import { queryClient } from "../../../../packages/cloud/src/queryClient.js";
import { analyticsClientConfig } from "../../../../packages/cloud/src/lib/analyticsClient.js";
import { import_compiler_runtime, useSession } from "../../../../packages/cloud/src/hooks/useSession.js";
import { invalidateProjects, useUpdateProject } from "../../../../packages/cloud/src/hooks/useProjects.js";
import { useAllowedPaths, useProject, useProjectUsage, useUpdateAllowedPaths } from "../../../../packages/cloud/src/hooks/useProject.js";
import { syncSkillOverridesToMain, useSkillOverrides } from "../../../../packages/cloud/src/hooks/useSkillOverrides.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../packages/ui/src/components/Avatar.js";
import { Text$4 } from "../../../../packages/ui/src/components/Text.js";
import { TooltipProvider } from "../../../../packages/ui/src/components/Tooltip.js";
import { Button } from "../../../../packages/ui/src/components/Button.js";
import { c$8, m$10, n$8, n$9, s$14 } from "../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../packages/ui/src/components/DropdownMenu.js";
import { toast } from "../../../../vendor/sonner.js";
import { Toaster } from "../../../../packages/ui/src/components/Sonner.js";
import { EditorThemeProvider } from "../../../../packages/ui/src/hooks/EditorThemeProvider.js";
import { EditorLoadingScreen } from "../../../../packages/ui/src/components/EditorLoadingScreen.js";
import { useProjectIconSettings } from "../../../../packages/cloud/src/hooks/useProjectIconSettings.js";
import { useCopyCodeSetting } from "../../../../packages/cloud/src/hooks/useCopyCodeSetting.js";
import { useCommentThread, useComments, useCreateComment, useDeleteComment, useResolveComment, useToggleReaction, useUnresolveComment, useUpdateComment } from "../../../../packages/cloud/src/hooks/useComments.js";
import { useGitIntegration } from "../../../../packages/cloud/src/hooks/useGit.js";
import { useClaudeStatus } from "../../../../packages/editor/src/shell/hooks/useClaudeStatus.js";
import { GLOBAL_SHORTCUTS } from "../../../../packages/editor/src/shared/shortcuts/catalog.js";
import { soleSelectedElementId } from "../../../../packages/editor/src/canvas/utils/selection.js";
import { getSelectedElementIds } from "../../../../packages/editor/src/shared/state/selection.js";
import { useGlobalShortcut } from "../../../../packages/editor/src/shared/shortcuts/useGlobalShortcut.js";
import { ClaudeCodeSetupModal } from "../../../../packages/editor/src/shell/components/ClaudeCodeSetupModal.js";
import { ProjectSettingsModal } from "../../../../packages/editor/src/shell/components/ProjectSettingsModal/ProjectSettingsModal.js";
import { GitPanel } from "../../../../packages/editor/src/shell/components/GitPanel.js";
import { HeaderActions } from "../../../../packages/editor/src/shell/components/HeaderActions.js";
import { useMcpConnect } from "../../../../packages/editor/src/shell/components/McpConnectButton.js";
import { lf } from "../../../../vendor/posthog-js.js";
import { PostHogProvider, usePostHog } from "../../../../vendor/@posthog/react.js";
import { createLocalPostHog } from "./localPostHog.js";
import { UpgradeModalProvider } from "../../../../packages/cloud/src/components/UpgradeModalProvider.js";
import { logoText_default } from "../../../../packages/cloud/src/assets/logoText.png.js";
import { logoIcon_default } from "../../../../packages/cloud/src/assets/logoIcon.png.js";
import { EditorView } from "../../../../packages/cloud/src/components/EditorView.js";
import { ProjectsPage } from "../../../../packages/cloud/src/components/ProjectsPage.js";
import { ProjectsSidebar, ProjectsSidebarContent, ProjectsSidebarHeader } from "../../../../packages/cloud/src/components/ProjectsSidebar.js";
import { ShareDialog, buildShareUrl } from "../../../../packages/cloud/src/components/ShareDialog.js";
import { LoginSplash } from "../../../../packages/cloud/src/components/LoginSplash.js";
import { OnboardingFlow } from "../../../../packages/cloud/src/components/OnboardingFlow.js";
import { FontSettings } from "../../../../packages/cloud/src/components/FontSettings.js";
import { createElectronCloudBackend } from "./backends/ElectronCloudBackend.js";
import { DesktopFileLoading, useDesktopFileLoading } from "./components/DesktopFileLoading.js";
import { DesktopTabs } from "./components/DesktopTabs.js";
import { UpdateNotification } from "./components/UpdateNotification.js";
import { OpenFilePalette } from "./components/OpenFilePalette.js";

var projectTabParams = new URLSearchParams(window.location.search);
var PROJECT_TAB_ID = projectTabParams.get("projectTab");
var CSS_EDITOR_FEATURE_FLAG = "project-css-editor";
var COMPONENT_EDIT_V2_FEATURE_FLAG = "component-edit-v2";
var WEBVIEW_EDIT_FEATURE_FLAG = "webview-edit";
var SKILL_CUSTOMIZATION_FEATURE_FLAG = "skill-customization";
var LEFT_SIDEBAR_V2_FEATURE_FLAG = "left-sidebar-v2";
var AGENTS_V2_FEATURE_FLAG = "agents-v2";
var readFeatureFlag = (posthog, flag, whenUnknown) => {
	const value = posthog.getFeatureFlag(flag, { send_event: false });
	return value === void 0 ? whenUnknown : value === true;
};
/** `whenUnknown` is returned until PostHog answers, and forever if it never does. */
function useElectronFeatureFlagEnabled(flag, t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const whenUnknown = t0 === void 0 ? false : t0;
	const posthog = usePostHog();
	let t1;
	if ($[0] !== flag || $[1] !== posthog || $[2] !== whenUnknown) {
		t1 = () => readFeatureFlag(posthog, flag, whenUnknown);
		$[0] = flag;
		$[1] = posthog;
		$[2] = whenUnknown;
		$[3] = t1;
	} else t1 = $[3];
	const [enabled, setEnabled] = (0, import_react.useState)(t1);
	let t2;
	let t3;
	if ($[4] !== flag || $[5] !== posthog || $[6] !== whenUnknown) {
		t2 = () => {
			const update = () => setEnabled(readFeatureFlag(posthog, flag, whenUnknown));
			update();
			const unsubscribe = posthog.onFeatureFlags(update);
			posthog.reloadFeatureFlags();
			return unsubscribe;
		};
		t3 = [
			posthog,
			flag,
			whenUnknown
		];
		$[4] = flag;
		$[5] = posthog;
		$[6] = whenUnknown;
		$[7] = t2;
		$[8] = t3;
	} else {
		t2 = $[7];
		t3 = $[8];
	}
	(0, import_react.useEffect)(t2, t3);
	return enabled;
}
/**
* The live flag until main reports a stack, then whichever stack main started.
* A later flag answer swaps the server; this follows that broadcast so the
* editor does not stay on the first stack.
*/
function useAgentsV2Stack() {
	const $ = (0, import_compiler_runtime.c)(2);
	const live = useElectronFeatureFlagEnabled(AGENTS_V2_FEATURE_FLAG);
	const [main, setMain] = (0, import_react.useState)(null);
	let t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => {
			let cancelled = false;
			const apply = (stack) => {
				if (cancelled || stack !== "v1" && stack !== "v2") return;
				setMain(stack === "v2");
			};
			const unsubscribe = window.api.on("mcp_stack", apply);
			window.api.invoke("get:mcp-stack").then(apply).catch(_temp);
			return () => {
				cancelled = true;
				unsubscribe();
			};
		};
		t1 = [];
		$[0] = t0;
		$[1] = t1;
	} else {
		t0 = $[0];
		t1 = $[1];
	}
	(0, import_react.useEffect)(t0, t1);
	return main ?? live;
}
/** Survives reloads and extra windows, so identity is re-sent on change only. */
function _temp() {}
var IDENTITY_KEY = "lg_posthog_identity";
var readLastIdentity = () => {
	try {
		return localStorage.getItem(IDENTITY_KEY) ?? "";
	} catch {
		return "";
	}
};
var writeLastIdentity = (value) => {
	try {
		value ? localStorage.setItem(IDENTITY_KEY, value) : localStorage.removeItem(IDENTITY_KEY);
	} catch {}
};
function PostHogIdentifier(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { user, org, loading } = t0;
	const posthog = usePostHog();
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = readLastIdentity();
		$[0] = t1;
	} else t1 = $[0];
	const identityRef = (0, import_react.useRef)(t1);
	let t2;
	let t3;
	if ($[1] !== loading || $[2] !== org.id || $[3] !== org.name || $[4] !== org.role || $[5] !== posthog || $[6] !== user) {
		t2 = () => {
			if (loading) return;
			if (user) {
				const identity = JSON.stringify([
					user.id,
					user.email,
					user.name,
					org.id,
					org.name,
					org.role
				]);
				if (identity === identityRef.current && posthog.get_distinct_id() === user.id) return;
				identityRef.current = identity;
				writeLastIdentity(identity);
				posthog.identify(user.id, {
					email: user.email || void 0,
					name: user.name || void 0,
					org_id: org.id,
					org_role: org.role ?? null
				}, {
					signup_date: (/* @__PURE__ */ new Date()).toISOString(),
					first_platform: "desktop"
				});
				if (org.id) posthog.group("organization", org.id, { name: org.name ?? void 0 });
			} else if (posthog.get_property("$user_state") === "identified") {
				posthog.reset();
				identityRef.current = "";
				writeLastIdentity("");
			}
		};
		t3 = [
			posthog,
			user,
			org.id,
			org.name,
			org.role,
			loading
		];
		$[1] = loading;
		$[2] = org.id;
		$[3] = org.name;
		$[4] = org.role;
		$[5] = posthog;
		$[6] = user;
		$[7] = t2;
		$[8] = t3;
	} else {
		t2 = $[7];
		t3 = $[8];
	}
	(0, import_react.useEffect)(t2, t3);
	return null;
}
var ELECTRON_DRAG = { WebkitAppRegion: "drag" };
var ELECTRON_NO_DRAG = { WebkitAppRegion: "no-drag" };
/** Shown after Sign up / Log in — browser handoff lives on its own screen. */
function AuthWaitingScreen(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { error, authCode, pasteLoading, onAuthCodeChange, onPasteCode, onDismiss } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: logoText_default,
			alt: "Petal",
			className: "h-7 w-auto shrink-0 object-contain [.editor-dark_&]:invert"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-row items-center justify-between gap-3 mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "m-0 min-w-0 text-base leading-6 tracking-[-0.02em] font-semibold text-ed-foreground",
				children: "Authenticating..."
			})
		});
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "pointer-events-none w-fit",
			RightIcon: s$14,
			tabIndex: -1,
			"aria-busy": true,
			children: "Opening in browser..."
		});
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== onDismiss) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-fit shrink-0",
				variant: "secondary",
				onClick: onDismiss,
				children: "Cancel"
			})]
		});
		$[3] = onDismiss;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			variant: "tertiary",
			children: "Waiting for sign in in your browser..."
		});
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== authCode || $[7] !== onAuthCodeChange || $[8] !== onPasteCode || $[9] !== pasteLoading) {
		t6 = false;
		$[6] = authCode;
		$[7] = onAuthCodeChange;
		$[8] = onPasteCode;
		$[9] = pasteLoading;
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] !== error) {
		t7 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "xs",
			className: "text-ed-destructive",
			children: error
		});
		$[11] = error;
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] !== t4 || $[14] !== t6 || $[15] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-screen w-full overflow-auto bg-ed-muted",
			style: ELECTRON_DRAG,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-full flex-col items-center justify-center gap-6 p-6",
				children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-ed-border bg-ed-background px-8 py-8 shadow-2xl/7",
					style: ELECTRON_NO_DRAG,
					children: [
						t2,
						t4,
						t5,
						t6,
						t7
					]
				})]
			})
		});
		$[13] = t4;
		$[14] = t6;
		$[15] = t7;
		$[16] = t8;
	} else t8 = $[16];
	return t8;
}
function LoginScreen() {
	const $ = (0, import_compiler_runtime.c)(12);
	const [waitingForBrowser, setWaitingForBrowser] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [authCode, setAuthCode] = (0, import_react.useState)("");
	const [pasteLoading, setPasteLoading] = (0, import_react.useState)(false);
	let t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => {
			const unsubError = window.onAuthError?.((ctx) => {
				setError(ctx.message);
			});
			return () => {
				unsubError?.();
			};
		};
		t1 = [];
		$[0] = t0;
		$[1] = t1;
	} else {
		t0 = $[0];
		t1 = $[1];
	}
	(0, import_react.useEffect)(t0, t1);
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = async () => {
			setWaitingForBrowser(true);
			setError(null);
			try {
				await window.requestAuth();
			} catch (t3) {
				const err = t3;
				setError(err instanceof Error ? err.message : String(err));
			}
		};
		$[2] = t2;
	} else t2 = $[2];
	const handleSignIn = t2;
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			setWaitingForBrowser(false);
			setError(null);
			setAuthCode("");
		};
		$[3] = t3;
	} else t3 = $[3];
	const handleDismiss = t3;
	let t4;
	if ($[4] !== authCode) {
		t4 = async () => {
			const code = authCode.trim();
			if (!code) return;
			setPasteLoading(true);
			setError(null);
			try {
				await window.authenticate({ token: code });
			} catch (t5) {
				const err_0 = t5;
				setError(err_0 instanceof Error ? err_0.message : String(err_0));
				setPasteLoading(false);
			}
		};
		$[4] = authCode;
		$[5] = t4;
	} else t4 = $[5];
	const handlePasteCode = t4;
	if (waitingForBrowser) {
		let t5;
		if ($[6] !== authCode || $[7] !== error || $[8] !== handlePasteCode || $[9] !== pasteLoading) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthWaitingScreen, {
				error,
				authCode,
				pasteLoading,
				onAuthCodeChange: setAuthCode,
				onPasteCode: handlePasteCode,
				onDismiss: handleDismiss
			});
			$[6] = authCode;
			$[7] = error;
			$[8] = handlePasteCode;
			$[9] = pasteLoading;
			$[10] = t5;
		} else t5 = $[10];
		return t5;
	}
	let t5;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginSplash, {
			draggableBackdrop: true,
			onSignUp: handleSignIn,
			onLogIn: handleSignIn
		});
		$[11] = t5;
	} else t5 = $[11];
	return t5;
}
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("[ErrorBoundary]", error, errorInfo);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 bg-ed-card text-ed-destructive h-screen flex flex-col items-center justify-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					as: "h2",
					size: "lg",
					weight: "semibold",
					variant: "danger",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-5 p-5 bg-ed-background rounded-lg max-w-[80%] overflow-auto text-sm",
					children: this.state.error?.message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => this.setState({
						hasError: false,
						error: null
					}),
					className: "mt-5",
					children: "Try Again"
				})
			]
		});
		return this.props.children;
	}
};
function AppContent() {
	const $ = (0, import_compiler_runtime.c)(90);
	const posthog = usePostHog();
	const enableAgentsV2 = useAgentsV2Stack();
	const { user, session, loading: sessionLoading } = useSession();
	const setFileLoading = useDesktopFileLoading();
	let t0;
	if ($[0] !== setFileLoading) {
		t0 = (id, options) => {
			setFileLoading(true);
			window.api.invoke("desktop_tabs_open", {
				projectId: id,
				focusChat: options?.focusChat,
				name: options?.name
			}).catch(_temp2).finally(() => setFileLoading(false));
		};
		$[0] = setFileLoading;
		$[1] = t0;
	} else t0 = $[1];
	const openProject = t0;
	let t1;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = projectTabParams.get("focusChat");
		$[2] = t1;
	} else t1 = $[2];
	const focusChatOnOpen = t1 === "1";
	const [onboarded, setOnboarded] = (0, import_react.useState)(false);
	const [claudeSetupOpen, setClaudeSetupOpen] = (0, import_react.useState)(false);
	const claude = useClaudeStatus();
	let t2;
	if ($[3] !== enableAgentsV2) {
		t2 = () => window.api.getMcpInfo({ agentsV2: enableAgentsV2 });
		$[3] = enableAgentsV2;
		$[4] = t2;
	} else t2 = $[4];
	const { openMcp: openDashboardMcp, mcpModal: dashboardMcpModal } = useMcpConnect(t2);
	let t3;
	let t4;
	if ($[5] !== posthog) {
		t3 = () => {
			const apply = () => {
				const value = posthog.getFeatureFlag(AGENTS_V2_FEATURE_FLAG, { send_event: false });
				if (value !== true && value !== false) return;
				window.api.setMcpStack(value);
			};
			const unsubscribe = posthog.onFeatureFlags(apply);
			posthog.reloadFeatureFlags();
			return unsubscribe;
		};
		t4 = [posthog];
		$[5] = posthog;
		$[6] = t3;
		$[7] = t4;
	} else {
		t3 = $[6];
		t4 = $[7];
	}
	(0, import_react.useEffect)(t3, t4);
	const [mcpServer, setMcpServer] = (0, import_react.useState)(null);
	let t5;
	let t6;
	if ($[8] !== enableAgentsV2) {
		t5 = () => {
			let cancelled = false;
			const check = () => {
				window.api.getMcpInfo({ agentsV2: enableAgentsV2 }).then((info) => {
					if (!cancelled) setMcpServer(info);
				}).catch(() => {
					if (!cancelled) setMcpServer(null);
				});
			};
			check();
			window.addEventListener("focus", check);
			return () => {
				cancelled = true;
				window.removeEventListener("focus", check);
			};
		};
		t6 = [enableAgentsV2];
		$[8] = enableAgentsV2;
		$[9] = t5;
		$[10] = t6;
	} else {
		t5 = $[9];
		t6 = $[10];
	}
	(0, import_react.useEffect)(t5, t6);
	const [projectFilter, setProjectFilter] = (0, import_react.useState)("all");
	const [projectSearch, setProjectSearch] = (0, import_react.useState)("");
	let t7;
	let t8;
	if ($[11] !== posthog) {
		t7 = () => {
			const unsubAuth = window.onAuthenticated?.(() => {
				posthog.capture("user_signed_in", { method: "browser_handoff" });
				queryClient.invalidateQueries({ queryKey: ["session"] });
			});
			return () => {
				unsubAuth?.();
			};
		};
		t8 = [posthog];
		$[11] = posthog;
		$[12] = t7;
		$[13] = t8;
	} else {
		t7 = $[12];
		t8 = $[13];
	}
	(0, import_react.useEffect)(t7, t8);
	let t9;
	if ($[14] !== claude) {
		t9 = (next) => {
			setClaudeSetupOpen(next);
			if (!next) claude.refresh();
		};
		$[14] = claude;
		$[15] = t9;
	} else t9 = $[15];
	const closeClaudeSetup = t9;
	let t10;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = [];
		$[16] = t10;
	} else t10 = $[16];
	(0, import_react.useEffect)(_temp4, t10);
	let t11;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = [];
		$[17] = t11;
	} else t11 = $[17];
	(0, import_react.useEffect)(_temp7, t11);
	let t12;
	let t13;
	if ($[18] !== openProject) {
		t12 = () => {
			if (PROJECT_TAB_ID) return;
			window.api.invoke("get_pending_deep_link").then((id_0) => {
				if (id_0) openProject(id_0);
			}).catch(_temp8);
			const unsubscribe_0 = window.api.on("deep-link-project", (projectId_0) => {
				openProject(projectId_0);
			});
			return () => unsubscribe_0();
		};
		t13 = [openProject];
		$[18] = openProject;
		$[19] = t12;
		$[20] = t13;
	} else {
		t12 = $[19];
		t13 = $[20];
	}
	(0, import_react.useEffect)(t12, t13);
	let t14;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = [];
		$[21] = t14;
	} else t14 = $[21];
	(0, import_react.useEffect)(_temp0, t14);
	let t15;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = [];
		$[22] = t15;
	} else t15 = $[22];
	(0, import_react.useEffect)(_temp13, t15);
	let t16;
	if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = [];
		$[23] = t16;
	} else t16 = $[23];
	(0, import_react.useEffect)(_temp15, t16);
	let t17;
	if ($[24] !== posthog) {
		t17 = async () => {
			posthog.capture("user_signed_out", void 0, { send_instantly: true });
			posthog.reset();
			try {
				await window.signOut();
			} catch {}
			window.api.invoke("desktop_tabs_sign_out");
			queryClient.setQueryData(["session"], null);
			queryClient.clear();
		};
		$[24] = posthog;
		$[25] = t17;
	} else t17 = $[25];
	const handleSignOut = t17;
	let content;
	if (sessionLoading) {
		let t18;
		if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
			t18 = PROJECT_TAB_ID ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorLoadingScreen, {
				logoSrc: logoIcon_default,
				className: "h-screen"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-screen h-screen flex items-center justify-center bg-ed-background",
				style: { WebkitAppRegion: "drag" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 border-[3px] border-ed-border border-t-ed-primary rounded-full animate-spin" })
			});
			$[26] = t18;
		} else t18 = $[26];
		content = t18;
	} else if (!user) {
		let t18;
		if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
			$[27] = t18;
		} else t18 = $[27];
		content = t18;
	} else if (!onboarded && !user.onboardingCompleted) {
		let t18;
		if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingFlow, { onComplete: () => setOnboarded(true) });
			$[28] = t18;
		} else t18 = $[28];
		content = t18;
	} else if (!PROJECT_TAB_ID) {
		let t18;
		if ($[29] !== handleSignOut || $[30] !== projectSearch || $[31] !== user) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsSidebarHeader, {
				user,
				onSignOut: handleSignOut,
				search: projectSearch,
				onSearchChange: setProjectSearch
			});
			$[29] = handleSignOut;
			$[30] = projectSearch;
			$[31] = user;
			$[32] = t18;
		} else t18 = $[32];
		let t19;
		if ($[33] !== session?.activeOrganizationId) {
			t19 = () => window.open(getWebSettingsUrl("usage", session?.activeOrganizationId ?? null), "_blank");
			$[33] = session?.activeOrganizationId;
			$[34] = t19;
		} else t19 = $[34];
		let t20;
		if ($[35] !== projectFilter || $[36] !== t19) {
			t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsSidebarContent, {
				filter: projectFilter,
				setFilter: setProjectFilter,
				onOpenSettings: t19
			});
			$[35] = projectFilter;
			$[36] = t19;
			$[37] = t20;
		} else t20 = $[37];
		let t21;
		if ($[38] !== t18 || $[39] !== t20) {
			t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsSidebar, {
				header: t18,
				content: t20
			});
			$[38] = t18;
			$[39] = t20;
			$[40] = t21;
		} else t21 = $[40];
		const t22 = session?.activeOrganizationId ?? null;
		let t23;
		let t24;
		if ($[41] !== setFileLoading) {
			t23 = () => setFileLoading(true);
			t24 = () => setFileLoading(false);
			$[41] = setFileLoading;
			$[42] = t23;
			$[43] = t24;
		} else {
			t23 = $[42];
			t24 = $[43];
		}
		let t25;
		if ($[44] !== openProject || $[45] !== posthog) {
			t25 = (id_1, options_0) => {
				posthog.capture("project_opened", {
					project_id: id_1,
					source: "desktop"
				});
				openProject(id_1, options_0);
			};
			$[44] = openProject;
			$[45] = posthog;
			$[46] = t25;
		} else t25 = $[46];
		let t26;
		if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
			t26 = () => setClaudeSetupOpen(true);
			$[47] = t26;
		} else t26 = $[47];
		let t27;
		if ($[48] !== openDashboardMcp) {
			t27 = () => void openDashboardMcp();
			$[48] = openDashboardMcp;
			$[49] = t27;
		} else t27 = $[49];
		let t28;
		if ($[50] !== claude.status || $[51] !== mcpServer || $[52] !== t27) {
			t28 = {
				onSetUpClaude: t26,
				onConnectMcp: t27,
				claudeStatus: claude.status,
				mcpServer
			};
			$[50] = claude.status;
			$[51] = mcpServer;
			$[52] = t27;
			$[53] = t28;
		} else t28 = $[53];
		let t29;
		if ($[54] !== projectFilter || $[55] !== projectSearch || $[56] !== t21 || $[57] !== t22 || $[58] !== t23 || $[59] !== t24 || $[60] !== t25 || $[61] !== t28) {
			t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full w-full electron-project-picker",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPage, {
					sidebar: t21,
					organizationId: t22,
					onCreateStart: t23,
					onCreateError: t24,
					onSelectProject: t25,
					filter: projectFilter,
					search: projectSearch,
					agentConnect: t28
				})
			});
			$[54] = projectFilter;
			$[55] = projectSearch;
			$[56] = t21;
			$[57] = t22;
			$[58] = t23;
			$[59] = t24;
			$[60] = t25;
			$[61] = t28;
			$[62] = t29;
		} else t29 = $[62];
		content = t29;
	} else {
		let t18;
		if ($[63] !== handleSignOut || $[64] !== user) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElectronEditor, {
				projectId: PROJECT_TAB_ID,
				user,
				onBack: _temp16,
				onSignOut: handleSignOut,
				focusChatOnMount: focusChatOnOpen
			}) });
			$[63] = handleSignOut;
			$[64] = user;
			$[65] = t18;
		} else t18 = $[65];
		content = t18;
	}
	const t18 = user ?? null;
	const t19 = session?.activeOrganizationId ?? null;
	const t20 = session?.activeOrganizationName;
	const t21 = session?.activeOrganizationRole;
	let t22;
	if ($[66] !== t19 || $[67] !== t20 || $[68] !== t21) {
		t22 = {
			id: t19,
			name: t20,
			role: t21
		};
		$[66] = t19;
		$[67] = t20;
		$[68] = t21;
		$[69] = t22;
	} else t22 = $[69];
	let t23;
	if ($[70] !== sessionLoading || $[71] !== t18 || $[72] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostHogIdentifier, {
			user: t18,
			org: t22,
			loading: sessionLoading
		});
		$[70] = sessionLoading;
		$[71] = t18;
		$[72] = t22;
		$[73] = t23;
	} else t23 = $[73];
	let t24;
	if ($[74] !== content || $[75] !== onboarded || $[76] !== session?.activeOrganizationId || $[77] !== sessionLoading || $[78] !== user) {
		t24 = user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UpgradeModalProvider, {
			organizationId: session?.activeOrganizationId ?? null,
			children: [!PROJECT_TAB_ID && !sessionLoading && (onboarded || user.onboardingCompleted) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-screen flex-col overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopTabs, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1",
					children: content
				})]
			}) : content, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenFilePalette, {})]
		}) : content;
		$[74] = content;
		$[75] = onboarded;
		$[76] = session?.activeOrganizationId;
		$[77] = sessionLoading;
		$[78] = user;
		$[79] = t24;
	} else t24 = $[79];
	let t25;
	if ($[80] !== claudeSetupOpen || $[81] !== closeClaudeSetup || $[82] !== user) {
		t25 = user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupModal, {
			open: claudeSetupOpen,
			onOpenChange: closeClaudeSetup
		});
		$[80] = claudeSetupOpen;
		$[81] = closeClaudeSetup;
		$[82] = user;
		$[83] = t25;
	} else t25 = $[83];
	const t26 = user && dashboardMcpModal;
	let t27;
	if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {});
		$[84] = t27;
	} else t27 = $[84];
	let t28;
	if ($[85] !== t23 || $[86] !== t24 || $[87] !== t25 || $[88] !== t26) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t23,
			t24,
			t25,
			t26,
			t27
		] });
		$[85] = t23;
		$[86] = t24;
		$[87] = t25;
		$[88] = t26;
		$[89] = t28;
	} else t28 = $[89];
	return t28;
}
function _temp16() {
	window.api.invoke("desktop_tabs_select", { projectId: null });
}
function _temp15() {
	const unsubscribe_2 = window.api.on("desktop_signed_out", _temp14);
	return () => unsubscribe_2();
}
function _temp14() {
	queryClient.setQueryData(["session"], null);
	queryClient.clear();
	window.location.reload();
}
function _temp13() {
	const showUpdateToast = _temp11;
	window.api.invoke("get-pending-update").then((version) => {
		if (version) showUpdateToast();
	}).catch(_temp12);
	const unsubscribe_1 = window.api.on("update-downloaded", showUpdateToast);
	return () => unsubscribe_1();
}
function _temp12() {}
function _temp11() {
	toast.custom(_temp10, {
		id: "app-update",
		duration: Infinity,
		classNames: { toast: "p-0! gap-0!" }
	});
}
function _temp10(toastId) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpdateNotification, {
		onRestart: _temp1,
		onDismiss: () => toast.dismiss(toastId)
	});
}
function _temp1() {
	window.api.invoke("install-update");
}
function _temp0() {
	if (!window.api?.on) return;
	return window.api.on("clear-caches-and-reload", _temp9);
}
async function _temp9() {
	await window.api.invoke("clear_all_caches");
	try {
		indexedDB.deleteDatabase("petal-component-cache");
	} catch {}
	window.location.reload();
}
function _temp8() {}
function _temp7() {
	if (!window.api?.on) return;
	const offConnected = window.api.on("figma-connected", _temp5);
	const offFailed = window.api.on("figma-connect-failed", _temp6);
	return () => {
		offConnected();
		offFailed();
	};
}
function _temp6() {
	window.dispatchEvent(new CustomEvent("petal-figma-connect-failed"));
}
function _temp5() {
	queryClient.invalidateQueries({ queryKey: ["figma-status"] });
	window.dispatchEvent(new CustomEvent("petal-figma-connected"));
}
function _temp4() {
	if (!window.api?.on) return;
	return window.api.on("github-connected", _temp3);
}
function _temp3() {
	queryClient.invalidateQueries({ queryKey: ["github-status"] });
}
function _temp2(error) {
	console.error("[Tabs] Failed to open file", error);
	toast.error("Could not open file", { description: error instanceof Error ? error.message : String(error) });
}
var posthogClient = createLocalPostHog();
function App() {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = [];
		$[0] = t0;
	} else t0 = $[0];
	(0, import_react.useEffect)(_temp18, t0);
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostHogProvider, {
			client: posthogClient,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopFileLoading, {
				projectView: !!PROJECT_TAB_ID,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppContent, {})
			}) }) })
		});
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function _temp18() {
	const unsubscribe = window.api.on("project_metadata_changed", _temp17);
	return () => unsubscribe();
}
function _temp17(t0) {
	const { projectId } = t0;
	invalidateProjects({
		refetch: true,
		projectId
	});
}
function ElectronEditor(t0) {
	const $ = (0, import_compiler_runtime.c)(241);
	const { projectId, user, onBack, onSignOut, focusChatOnMount } = t0;
	const posthog = usePostHog();
	const setFileLoading = useDesktopFileLoading();
	const enableCssEditor = useElectronFeatureFlagEnabled(CSS_EDITOR_FEATURE_FLAG);
	const enableComponentEditV2 = useElectronFeatureFlagEnabled(COMPONENT_EDIT_V2_FEATURE_FLAG);
	const enableWebviewTweak = useElectronFeatureFlagEnabled(WEBVIEW_EDIT_FEATURE_FLAG);
	const enableSkillCustomization = useElectronFeatureFlagEnabled(SKILL_CUSTOMIZATION_FEATURE_FLAG);
	const enableSidebarV2 = useElectronFeatureFlagEnabled(LEFT_SIDEBAR_V2_FEATURE_FLAG, true);
	const enableAgentsV2 = useAgentsV2Stack();
	const { data: project } = useProject(projectId);
	const permission = project?.currentUserPermission;
	let t1;
	if ($[0] !== permission || $[1] !== project) {
		t1 = () => {
			if (project?.name) window.api.invoke("desktop_tabs_update", {
				name: project.name,
				canRename: permission === "owner"
			});
		};
		$[0] = permission;
		$[1] = project;
		$[2] = t1;
	} else t1 = $[2];
	const t2 = project?.name;
	let t3;
	if ($[3] !== permission || $[4] !== t2) {
		t3 = [t2, permission];
		$[3] = permission;
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	(0, import_react.useEffect)(t1, t3);
	const canEdit = permission === "editor" || permission === "owner";
	const readOnly = !canEdit;
	const [appVersion, setAppVersion] = (0, import_react.useState)(null);
	const [showShare, setShowShare] = (0, import_react.useState)(false);
	let t4;
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => {
			window.api.invoke("get_app_info").then((info) => {
				setAppVersion(info.version);
			}).catch(_temp19);
		};
		t5 = [];
		$[6] = t4;
		$[7] = t5;
	} else {
		t4 = $[6];
		t5 = $[7];
	}
	(0, import_react.useEffect)(t4, t5);
	const { data: allowedPathsData } = useAllowedPaths(projectId);
	let t6;
	if ($[8] !== allowedPathsData?.allowedPaths) {
		t6 = allowedPathsData?.allowedPaths ?? [];
		$[8] = allowedPathsData?.allowedPaths;
		$[9] = t6;
	} else t6 = $[9];
	const allowedPaths = t6;
	const updateAllowedPaths = useUpdateAllowedPaths(projectId);
	let t7;
	let t8;
	if ($[10] !== allowedPaths || $[11] !== projectId) {
		t7 = () => {
			if (!projectId) return;
			window.api.invoke("set_allowed_paths", {
				projectId,
				paths: allowedPaths
			}).catch(_temp20);
		};
		t8 = [projectId, allowedPaths];
		$[10] = allowedPaths;
		$[11] = projectId;
		$[12] = t7;
		$[13] = t8;
	} else {
		t7 = $[12];
		t8 = $[13];
	}
	(0, import_react.useEffect)(t7, t8);
	const { data: skillOverridesData, isFetched: skillOverridesFetched } = useSkillOverrides();
	let t9;
	if ($[14] !== skillOverridesData?.overrides) {
		t9 = skillOverridesData?.overrides ?? {};
		$[14] = skillOverridesData?.overrides;
		$[15] = t9;
	} else t9 = $[15];
	const skillOverrides = t9;
	let t10;
	let t11;
	if ($[16] !== enableSkillCustomization || $[17] !== skillOverrides || $[18] !== skillOverridesFetched) {
		t10 = () => {
			if (!skillOverridesFetched) return;
			syncSkillOverridesToMain(enableSkillCustomization, enableSkillCustomization ? skillOverrides : {});
		};
		t11 = [
			enableSkillCustomization,
			skillOverrides,
			skillOverridesFetched
		];
		$[16] = enableSkillCustomization;
		$[17] = skillOverrides;
		$[18] = skillOverridesFetched;
		$[19] = t10;
		$[20] = t11;
	} else {
		t10 = $[19];
		t11 = $[20];
	}
	(0, import_react.useEffect)(t10, t11);
	let t12;
	if ($[21] !== allowedPaths || $[22] !== updateAllowedPaths) {
		t12 = (path) => {
			if (allowedPaths.includes(path)) return;
			updateAllowedPaths.mutate([...allowedPaths, path]);
		};
		$[21] = allowedPaths;
		$[22] = updateAllowedPaths;
		$[23] = t12;
	} else t12 = $[23];
	const handleAddAllowedPath = t12;
	let t13;
	if ($[24] !== allowedPaths || $[25] !== updateAllowedPaths) {
		t13 = (path_0) => {
			updateAllowedPaths.mutate(allowedPaths.filter((p) => p !== path_0));
		};
		$[24] = allowedPaths;
		$[25] = updateAllowedPaths;
		$[26] = t13;
	} else t13 = $[26];
	const handleRemoveAllowedPath = t13;
	const [projectSettingsOpen, setProjectSettingsOpen] = (0, import_react.useState)(false);
	const { data: projectUsage } = useProjectUsage(projectId, projectSettingsOpen);
	const [projectSettingsSection, setProjectSettingsSection] = (0, import_react.useState)("general");
	const updateProject = useUpdateProject();
	const copyCodeSetting = useCopyCodeSetting(projectId);
	const t14 = project?.name;
	let t15;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = () => setProjectSettingsOpen(false);
		$[27] = t15;
	} else t15 = $[27];
	let t16;
	if ($[28] !== projectId || $[29] !== projectSettingsOpen || $[30] !== t14) {
		t16 = {
			projectId,
			projectName: t14,
			settingsOpen: projectSettingsOpen,
			onCreateIconSetupChatDraft: t15
		};
		$[28] = projectId;
		$[29] = projectSettingsOpen;
		$[30] = t14;
		$[31] = t16;
	} else t16 = $[31];
	const { iconLibraries: projectIconLibraries, editorSettingsRevision, externalChatDraft, addIconPackage: handleAddIconPackage, removeIconPackage: handleRemoveIconPackage, askAIForIconSetup: handleAskAIForIconSetup } = useProjectIconSettings(t16);
	const skillActionsRef = (0, import_react.useRef)(null);
	let t17;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = (t18) => {
			setProjectSettingsSection(t18 === void 0 ? "general" : t18);
			setProjectSettingsOpen(true);
		};
		$[32] = t17;
	} else t17 = $[32];
	const handleOpenProjectSettings = t17;
	let t18;
	if ($[33] !== projectId || $[34] !== updateProject) {
		t18 = async (name) => {
			await updateProject.mutateAsync({
				projectId,
				name
			});
		};
		$[33] = projectId;
		$[34] = updateProject;
		$[35] = t18;
	} else t18 = $[35];
	const handleRenameProject = t18;
	let t19;
	if ($[36] !== permission || $[37] !== projectId || $[38] !== updateProject) {
		t19 = permission === "owner" ? (name_0) => updateProject.mutate({
			projectId,
			name: name_0
		}, { onError: _temp21 }) : void 0;
		$[36] = permission;
		$[37] = projectId;
		$[38] = updateProject;
		$[39] = t19;
	} else t19 = $[39];
	const handleInlineRename = t19;
	const [activePageId, setActivePageId] = (0, import_react.useState)(null);
	const [activeCommentId, setActiveCommentId] = (0, import_react.useState)(null);
	const [commentMode, setCommentMode] = (0, import_react.useState)(false);
	const [showResolved, setShowResolved] = (0, import_react.useState)(false);
	const [commentsHidden, setCommentsHidden] = (0, import_react.useState)(false);
	const [rescanning, setRescanning] = (0, import_react.useState)(false);
	const rebuildRef = (0, import_react.useRef)(null);
	const openPreviewRef = (0, import_react.useRef)(null);
	const flushPreviewRef = (0, import_react.useRef)(null);
	let t20;
	let t21;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = () => window.api.on("desktop_tab_flush_thumbnail", (requestId) => {
			Promise.resolve(flushPreviewRef.current?.()).finally(() => {
				window.api.send("desktop_tab_thumbnail_flushed", requestId);
			});
		});
		t21 = [];
		$[40] = t20;
		$[41] = t21;
	} else {
		t20 = $[40];
		t21 = $[41];
	}
	(0, import_react.useEffect)(t20, t21);
	let t22;
	if ($[42] !== activePageId || $[43] !== posthog || $[44] !== projectId) {
		t22 = (trigger) => {
			posthog.capture("present_opened", {
				project_id: projectId,
				trigger
			});
			const webUrl = getWebUrl();
			const params = new URLSearchParams();
			const selectedElementId = soleSelectedElementId(getSelectedElementIds());
			if (selectedElementId) params.set("element", selectedElementId);
			if (activePageId) params.set("page", activePageId);
			const qs = params.toString();
			window.open(`${webUrl}/proto/${projectId}${qs ? `?${qs}` : ""}`, "_blank");
		};
		$[42] = activePageId;
		$[43] = posthog;
		$[44] = projectId;
		$[45] = t22;
	} else t22 = $[45];
	const handlePresent = t22;
	let t23;
	if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = () => {
			openPreviewRef.current?.();
		};
		$[46] = t23;
	} else t23 = $[46];
	const handleOpenPreviewWindow = t23;
	let t24;
	if ($[47] !== handlePresent) {
		t24 = (e) => {
			e.preventDefault();
			handlePresent("shortcut");
		};
		$[47] = handlePresent;
		$[48] = t24;
	} else t24 = $[48];
	useGlobalShortcut("present", t24);
	const { gitPanelProps, githubStatus } = useGitIntegration(projectId);
	let t25;
	if ($[49] !== project) {
		t25 = async (elementId, pageId) => {
			const linkToken = project && "linkToken" in project && project.linkToken && project.linkAccess !== "none" ? String(project.linkToken) : null;
			if (!linkToken) {
				toast.error("Create a share link first");
				setShowShare(true);
				return;
			}
			await navigator.clipboard.writeText(buildShareUrl(linkToken, elementId, pageId));
			toast.success("Copied link to selection");
		};
		$[49] = project;
		$[50] = t25;
	} else t25 = $[50];
	const handleCopySelectionLink = t25;
	let t26;
	if ($[51] !== posthog || $[52] !== projectId || $[53] !== rescanning) {
		t26 = async () => {
			if (rescanning || !rebuildRef.current) return;
			posthog.capture("rescan_triggered", { project_id: projectId });
			setRescanning(true);
			await rebuildRef.current().finally(() => {
				setRescanning(false);
			});
		};
		$[51] = posthog;
		$[52] = projectId;
		$[53] = rescanning;
		$[54] = t26;
	} else t26 = $[54];
	const handleRescan = t26;
	const commentsQuery = useComments(projectId, void 0, true);
	let t27;
	if ($[55] !== commentsQuery.data?.pages) {
		t27 = commentsQuery.data?.pages.flatMap(_temp22) ?? [];
		$[55] = commentsQuery.data?.pages;
		$[56] = t27;
	} else t27 = $[56];
	const allComments = t27;
	const threadQuery = useCommentThread(projectId, activeCommentId ?? "");
	const createComment = useCreateComment(projectId);
	const updateComment = useUpdateComment(projectId);
	const deleteComment = useDeleteComment(projectId);
	const resolveComment = useResolveComment(projectId);
	const unresolveComment = useUnresolveComment(projectId);
	const toggleReaction = useToggleReaction(projectId);
	let t28;
	if ($[57] !== threadQuery.data) {
		t28 = threadQuery.data ?? [];
		$[57] = threadQuery.data;
		$[58] = t28;
	} else t28 = $[58];
	const t29 = commentsQuery.isPending || commentsQuery.isFetchingNextPage;
	let t30;
	if ($[59] !== commentsQuery) {
		t30 = () => {
			commentsQuery.refetch();
		};
		$[59] = commentsQuery;
		$[60] = t30;
	} else t30 = $[60];
	const t31 = user?.id ?? null;
	const t32 = user?.name ?? null;
	const t33 = user?.image ?? null;
	let t34;
	if ($[61] !== t32 || $[62] !== t33) {
		t34 = {
			name: t32,
			image: t33
		};
		$[61] = t32;
		$[62] = t33;
		$[63] = t34;
	} else t34 = $[63];
	let t35;
	if ($[64] !== createComment || $[65] !== posthog || $[66] !== projectId) {
		t35 = (c) => createComment.mutateAsync({
			pageId: c.pageId,
			body: c.body,
			mentionSpans: c.mentionSpans,
			canvasX: c.canvasX,
			canvasY: c.canvasY,
			elementId: c.elementId,
			anchorX: c.anchorX,
			anchorY: c.anchorY,
			...c.attachments?.length ? { attachments: c.attachments } : {}
		}).then((created) => {
			posthog.capture("comment_created", {
				project_id: projectId,
				page_id: c.pageId,
				has_attachments: !!c.attachments?.length
			});
			return created;
		});
		$[64] = createComment;
		$[65] = posthog;
		$[66] = projectId;
		$[67] = t35;
	} else t35 = $[67];
	let t36;
	if ($[68] !== createComment) {
		t36 = (r) => createComment.mutateAsync({
			pageId: r.pageId,
			parentId: r.parentId,
			body: r.body,
			mentionSpans: r.mentionSpans,
			attachments: r.attachments
		});
		$[68] = createComment;
		$[69] = t36;
	} else t36 = $[69];
	let t37;
	if ($[70] !== resolveComment) {
		t37 = (id) => resolveComment.mutate(id);
		$[70] = resolveComment;
		$[71] = t37;
	} else t37 = $[71];
	let t38;
	if ($[72] !== unresolveComment) {
		t38 = (id_0) => unresolveComment.mutate(id_0);
		$[72] = unresolveComment;
		$[73] = t38;
	} else t38 = $[73];
	let t39;
	if ($[74] !== deleteComment) {
		t39 = (id_1) => deleteComment.mutate(id_1);
		$[74] = deleteComment;
		$[75] = t39;
	} else t39 = $[75];
	let t40;
	if ($[76] !== updateComment) {
		t40 = (id_2, body, mentionSpans) => updateComment.mutateAsync({
			id: id_2,
			body,
			mentionSpans
		});
		$[76] = updateComment;
		$[77] = t40;
	} else t40 = $[77];
	let t41;
	if ($[78] !== toggleReaction) {
		t41 = (id_3, emoji) => toggleReaction.mutate({
			id: id_3,
			emoji
		});
		$[78] = toggleReaction;
		$[79] = t41;
	} else t41 = $[79];
	let t42;
	if ($[80] !== updateComment) {
		t42 = (id_4, canvasX, canvasY, anchor) => updateComment.mutate({
			id: id_4,
			canvasX,
			canvasY,
			...anchor
		});
		$[80] = updateComment;
		$[81] = t42;
	} else t42 = $[81];
	let t43;
	if ($[82] === Symbol.for("react.memo_cache_sentinel")) {
		t43 = (id_5) => setActiveCommentId(id_5);
		$[82] = t43;
	} else t43 = $[82];
	let t44;
	if ($[83] !== allComments || $[84] !== commentMode || $[85] !== commentsHidden || $[86] !== commentsQuery.isError || $[87] !== showResolved || $[88] !== t28 || $[89] !== t29 || $[90] !== t30 || $[91] !== t31 || $[92] !== t34 || $[93] !== t35 || $[94] !== t36 || $[95] !== t37 || $[96] !== t38 || $[97] !== t39 || $[98] !== t40 || $[99] !== t41 || $[100] !== t42) {
		t44 = {
			comments: allComments,
			commentReplies: t28,
			commentsLoading: t29,
			commentsError: commentsQuery.isError,
			onRetryComments: t30,
			currentUserId: t31,
			currentUser: t34,
			showCommentTools: true,
			onCreateComment: t35,
			onCreateReply: t36,
			onResolveComment: t37,
			onUnresolveComment: t38,
			onDeleteComment: t39,
			onEditComment: t40,
			onToggleReaction: t41,
			onMoveComment: t42,
			onActiveCommentChange: t43,
			commentModeActive: commentMode,
			onCommentModeChange: setCommentMode,
			showResolvedComments: showResolved,
			onShowResolvedChange: setShowResolved,
			commentsHidden,
			onCommentsHiddenChange: setCommentsHidden
		};
		$[83] = allComments;
		$[84] = commentMode;
		$[85] = commentsHidden;
		$[86] = commentsQuery.isError;
		$[87] = showResolved;
		$[88] = t28;
		$[89] = t29;
		$[90] = t30;
		$[91] = t31;
		$[92] = t34;
		$[93] = t35;
		$[94] = t36;
		$[95] = t37;
		$[96] = t38;
		$[97] = t39;
		$[98] = t40;
		$[99] = t41;
		$[100] = t42;
		$[101] = t44;
	} else t44 = $[101];
	const commentProps = t44;
	let t45;
	if ($[102] !== user) {
		t45 = user?.name ? user.name.split(" ").map(_temp23).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() ?? "?";
		$[102] = user;
		$[103] = t45;
	} else t45 = $[103];
	const userInitials = t45;
	const openGitHubOAuth = _temp24;
	let t46;
	if ($[104] !== canEdit || $[105] !== gitPanelProps || $[106] !== githubStatus || $[107] !== permission) {
		t46 = canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitPanel, {
			...gitPanelProps,
			isOwner: permission === "owner",
			onInstallGitHubApp: openGitHubOAuth,
			onAddGitHubAccount: () => {
				if (!githubStatus?.appSlug) return;
				window.open(`https://github.com/apps/${githubStatus.appSlug}/installations/select_target`, "_blank");
			}
		}) : null;
		$[104] = canEdit;
		$[105] = gitPanelProps;
		$[106] = githubStatus;
		$[107] = permission;
		$[108] = t46;
	} else t46 = $[108];
	const gitPanelElement = t46;
	let t47;
	if ($[109] !== enableAgentsV2) {
		t47 = () => window.api.getMcpInfo({ agentsV2: enableAgentsV2 });
		$[109] = enableAgentsV2;
		$[110] = t47;
	} else t47 = $[110];
	const { openMcp, mcpModal } = useMcpConnect(t47);
	let t48;
	if ($[111] === Symbol.for("react.memo_cache_sentinel")) {
		t48 = { WebkitAppRegion: "no-drag" };
		$[111] = t48;
	} else t48 = $[111];
	const t49 = user?.image ?? void 0;
	const t50 = user?.name ?? "";
	let t51;
	if ($[112] !== t49 || $[113] !== t50) {
		t51 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
			src: t49,
			alt: t50
		});
		$[112] = t49;
		$[113] = t50;
		$[114] = t51;
	} else t51 = $[114];
	let t52;
	if ($[115] !== userInitials) {
		t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
			className: "bg-ed-field leading-none group-data-[size=sm]/avatar:text-[10px]",
			children: userInitials
		});
		$[115] = userInitials;
		$[116] = t52;
	} else t52 = $[116];
	let t53;
	if ($[117] !== t51 || $[118] !== t52) {
		t53 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
			size: "sm",
			className: "border border-ed-border group-hover:outline-2 group-hover:outline-ed-border",
			children: [t51, t52]
		});
		$[117] = t51;
		$[118] = t52;
		$[119] = t53;
	} else t53 = $[119];
	let t54;
	if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
		t54 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			width: "12",
			height: "12",
			viewBox: "0 0 12 12",
			fill: "none",
			className: "text-ed-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M3 5L6 8L9 5",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		});
		$[120] = t54;
	} else t54 = $[120];
	let t55;
	if ($[121] !== t53) {
		t55 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "xs",
				className: "group p-0 has-[>svg]:px-0 hover:bg-transparent",
				isChildText: false,
				children: [t53, t54]
			})
		});
		$[121] = t53;
		$[122] = t55;
	} else t55 = $[122];
	const t56 = user?.name;
	let t57;
	if ($[123] !== t56) {
		t57 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium text-ed-foreground",
			children: t56
		});
		$[123] = t56;
		$[124] = t57;
	} else t57 = $[124];
	const t58 = user?.email;
	let t59;
	if ($[125] !== t58) {
		t59 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-ed-muted-foreground",
			children: t58
		});
		$[125] = t58;
		$[126] = t59;
	} else t59 = $[126];
	let t60;
	if ($[127] !== t57 || $[128] !== t59) {
		t60 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-2 py-1.5",
			children: [t57, t59]
		});
		$[127] = t57;
		$[128] = t59;
		$[129] = t60;
	} else t60 = $[129];
	let t61;
	if ($[130] === Symbol.for("react.memo_cache_sentinel")) {
		t61 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[130] = t61;
	} else t61 = $[130];
	const t62 = rescanning ? "animate-spin" : "";
	let t63;
	if ($[131] !== t62) {
		t63 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$10, {
			size: 14,
			className: t62
		});
		$[131] = t62;
		$[132] = t63;
	} else t63 = $[132];
	const t64 = rescanning ? "Rescanning..." : "Rescan components";
	let t65;
	if ($[133] !== handleRescan || $[134] !== rescanning || $[135] !== t63 || $[136] !== t64) {
		t65 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: handleRescan,
			disabled: rescanning,
			children: [t63, t64]
		});
		$[133] = handleRescan;
		$[134] = rescanning;
		$[135] = t63;
		$[136] = t64;
		$[137] = t65;
	} else t65 = $[137];
	let t66;
	if ($[138] === Symbol.for("react.memo_cache_sentinel")) {
		t66 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[138] = t66;
	} else t66 = $[138];
	let t67;
	if ($[139] !== onSignOut) {
		t67 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onClick: onSignOut,
			children: "Sign out"
		});
		$[139] = onSignOut;
		$[140] = t67;
	} else t67 = $[140];
	let t68;
	if ($[141] !== appVersion) {
		t68 = appVersion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-2 py-1 text-[10px] text-ed-muted-foreground",
			children: ["v", appVersion]
		})] });
		$[141] = appVersion;
		$[142] = t68;
	} else t68 = $[142];
	let t69;
	if ($[143] !== t60 || $[144] !== t65 || $[145] !== t67 || $[146] !== t68) {
		t69 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "start",
			children: [
				t60,
				t61,
				t65,
				t66,
				t67,
				t68
			]
		});
		$[143] = t60;
		$[144] = t65;
		$[145] = t67;
		$[146] = t68;
		$[147] = t69;
	} else t69 = $[147];
	let t70;
	if ($[148] !== t55 || $[149] !== t69) {
		t70 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t55, t69]
		});
		$[148] = t55;
		$[149] = t69;
		$[150] = t70;
	} else t70 = $[150];
	let t71;
	if ($[151] === Symbol.for("react.memo_cache_sentinel")) {
		t71 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-xs",
				"aria-label": "Present or preview",
				isChildText: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$9, { size: 14 })
			})
		});
		$[151] = t71;
	} else t71 = $[151];
	let t72;
	if ($[152] !== handlePresent) {
		t72 = () => handlePresent("menu");
		$[152] = handlePresent;
		$[153] = t72;
	} else t72 = $[153];
	let t73;
	if ($[154] === Symbol.for("react.memo_cache_sentinel")) {
		t73 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$9, { size: 15 });
		$[154] = t73;
	} else t73 = $[154];
	let t74;
	if ($[155] === Symbol.for("react.memo_cache_sentinel")) {
		t74 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-auto pl-4 text-xs text-muted-foreground",
			children: GLOBAL_SHORTCUTS.present.keyLabel
		});
		$[155] = t74;
	} else t74 = $[155];
	let t75;
	if ($[156] !== t72) {
		t75 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: t72,
			children: [
				t73,
				"Present",
				t74
			]
		});
		$[156] = t72;
		$[157] = t75;
	} else t75 = $[157];
	let t76;
	if ($[158] === Symbol.for("react.memo_cache_sentinel")) {
		t76 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$8, { size: 15 });
		$[158] = t76;
	} else t76 = $[158];
	let t77;
	if ($[159] === Symbol.for("react.memo_cache_sentinel")) {
		t77 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: handleOpenPreviewWindow,
			children: [
				t76,
				"Preview",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto pl-4 text-xs text-muted-foreground",
					children: GLOBAL_SHORTCUTS.togglePreviewWindow.keyLabel
				})
			]
		});
		$[159] = t77;
	} else t77 = $[159];
	let t78;
	if ($[160] !== t75) {
		t78 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t71, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				children: [t75, t77]
			})]
		});
		$[160] = t75;
		$[161] = t78;
	} else t78 = $[161];
	let t79;
	if ($[162] !== canEdit || $[163] !== openMcp) {
		t79 = !canEdit ? [] : [{
			key: "mcp",
			inline: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "xs",
				variant: "ghost",
				isChildText: false,
				onClick: () => void openMcp(),
				title: "Connect external MCP agent",
				children: "MCP"
			}),
			menuItem: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => void openMcp(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$8, {
					size: 15,
					className: "text-ed-muted-foreground"
				}), "Connect MCP"]
			})
		}];
		$[162] = canEdit;
		$[163] = openMcp;
		$[164] = t79;
	} else t79 = $[164];
	let t80;
	if ($[165] !== canEdit || $[166] !== posthog || $[167] !== projectId) {
		t80 = canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: () => {
				posthog.capture("share_dialog_opened", { project_id: projectId });
				setShowShare(true);
			},
			size: "xs",
			children: "Share"
		}) : null;
		$[165] = canEdit;
		$[166] = posthog;
		$[167] = projectId;
		$[168] = t80;
	} else t80 = $[168];
	let t81;
	if ($[169] !== t78 || $[170] !== t79 || $[171] !== t80) {
		t81 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderActions, {
			leading: t78,
			collapsible: t79,
			trailing: t80
		});
		$[169] = t78;
		$[170] = t79;
		$[171] = t80;
		$[172] = t81;
	} else t81 = $[172];
	let t82;
	if ($[173] !== t70 || $[174] !== t81) {
		t82 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between p-3",
			style: t48,
			children: [t70, t81]
		});
		$[173] = t70;
		$[174] = t81;
		$[175] = t82;
	} else t82 = $[175];
	const rightHeader = t82;
	let t83;
	if ($[176] !== setFileLoading) {
		t83 = () => {
			setFileLoading(false);
			window.api.invoke("desktop_tabs_ready");
		};
		$[176] = setFileLoading;
		$[177] = t83;
	} else t83 = $[177];
	const t84 = editorSettingsRevision + copyCodeSetting.editorSettingsRevision;
	const t85 = permission === "viewer" ? void 0 : commentProps;
	let t86;
	if ($[178] !== updateAllowedPaths) {
		t86 = () => updateAllowedPaths.mutate([]);
		$[178] = updateAllowedPaths;
		$[179] = t86;
	} else t86 = $[179];
	const t87 = project?.name ?? "Loading...";
	let t88;
	if ($[180] !== allowedPaths || $[181] !== enableAgentsV2 || $[182] !== enableComponentEditV2 || $[183] !== enableCssEditor || $[184] !== enableSidebarV2 || $[185] !== enableSkillCustomization || $[186] !== enableWebviewTweak || $[187] !== externalChatDraft || $[188] !== focusChatOnMount || $[189] !== gitPanelElement || $[190] !== handleAddAllowedPath || $[191] !== handleCopySelectionLink || $[192] !== handleInlineRename || $[193] !== handleRemoveAllowedPath || $[194] !== onBack || $[195] !== projectId || $[196] !== readOnly || $[197] !== rightHeader || $[198] !== t83 || $[199] !== t84 || $[200] !== t85 || $[201] !== t86 || $[202] !== t87) {
		t88 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-h-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorView, {
				onInitialRender: t83,
				settingsRevision: t84,
				projectPath: projectId,
				readOnly,
				createBackend: createElectronCloudBackend,
				leftHeader: null,
				rightHeader,
				gitPanel: gitPanelElement,
				onActivePageChange: setActivePageId,
				onCopySelectionLink: handleCopySelectionLink,
				commentProps: t85,
				onRebuildRef: rebuildRef,
				openPreviewRef,
				skillActionsRef,
				flushPreviewRef,
				allowedPaths,
				onAddAllowedPath: handleAddAllowedPath,
				onRemoveAllowedPath: handleRemoveAllowedPath,
				onClearAllowedPaths: t86,
				onOpenProjectSettings: handleOpenProjectSettings,
				externalChatDraft,
				focusChatOnMount,
				enableCssEditor,
				enableComponentEditV2,
				enableWebviewTweak,
				enableSkillCustomization,
				enableSidebarV2,
				enableAgentsV2,
				projectName: t87,
				onRenameProject: handleInlineRename,
				projectIconUrl: logoIcon_default,
				onProjectIconClick: onBack,
				isElectron: true
			}, projectId)
		});
		$[180] = allowedPaths;
		$[181] = enableAgentsV2;
		$[182] = enableComponentEditV2;
		$[183] = enableCssEditor;
		$[184] = enableSidebarV2;
		$[185] = enableSkillCustomization;
		$[186] = enableWebviewTweak;
		$[187] = externalChatDraft;
		$[188] = focusChatOnMount;
		$[189] = gitPanelElement;
		$[190] = handleAddAllowedPath;
		$[191] = handleCopySelectionLink;
		$[192] = handleInlineRename;
		$[193] = handleRemoveAllowedPath;
		$[194] = onBack;
		$[195] = projectId;
		$[196] = readOnly;
		$[197] = rightHeader;
		$[198] = t83;
		$[199] = t84;
		$[200] = t85;
		$[201] = t86;
		$[202] = t87;
		$[203] = t88;
	} else t88 = $[203];
	let t89;
	if ($[204] !== activePageId || $[205] !== projectId || $[206] !== showShare) {
		t89 = showShare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareDialog, {
			projectId,
			onClose: () => setShowShare(false),
			activePageId
		});
		$[204] = activePageId;
		$[205] = projectId;
		$[206] = showShare;
		$[207] = t89;
	} else t89 = $[207];
	const t90 = permission === "owner" || permission === "editor";
	let t91;
	if ($[208] !== projectId || $[209] !== t90) {
		t91 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontSettings, {
			projectId,
			canEdit: t90
		});
		$[208] = projectId;
		$[209] = t90;
		$[210] = t91;
	} else t91 = $[210];
	const t92 = project?.name ?? "";
	const t93 = permission === "owner";
	let t94;
	if ($[211] !== canEdit || $[212] !== enableSkillCustomization || $[213] !== skillOverrides) {
		t94 = enableSkillCustomization && canEdit ? {
			overrides: skillOverrides,
			onOpenSkill: (skill) => {
				setProjectSettingsOpen(false);
				skillActionsRef.current?.onOpenSkill(skill);
			},
			onResetSkill: (name_1) => skillActionsRef.current?.onResetSkill(name_1),
			onToggleSkillActive: (name_2, active) => skillActionsRef.current?.onToggleSkillActive(name_2, active)
		} : void 0;
		$[211] = canEdit;
		$[212] = enableSkillCustomization;
		$[213] = skillOverrides;
		$[214] = t94;
	} else t94 = $[214];
	let t95;
	if ($[215] !== projectUsage) {
		t95 = typeof projectUsage?.usedBytes === "number" ? {
			usedBytes: projectUsage.usedBytes,
			maxBytes: projectUsage.maxProjectBytes ?? null
		} : null;
		$[215] = projectUsage;
		$[216] = t95;
	} else t95 = $[216];
	let t96;
	if ($[217] !== allowedPaths || $[218] !== canEdit || $[219] !== copyCodeSetting.includesComponents || $[220] !== copyCodeSetting.setIncludesComponents || $[221] !== handleAddAllowedPath || $[222] !== handleAddIconPackage || $[223] !== handleAskAIForIconSetup || $[224] !== handleRemoveAllowedPath || $[225] !== handleRemoveIconPackage || $[226] !== handleRenameProject || $[227] !== projectIconLibraries || $[228] !== projectSettingsOpen || $[229] !== projectSettingsSection || $[230] !== t91 || $[231] !== t92 || $[232] !== t93 || $[233] !== t94 || $[234] !== t95) {
		t96 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSettingsModal, {
			fontSettings: t91,
			open: projectSettingsOpen,
			onOpenChange: setProjectSettingsOpen,
			projectName: t92,
			onRenameProject: handleRenameProject,
			canRename: t93,
			allowedPaths,
			onAddAllowedPath: handleAddAllowedPath,
			onRemoveAllowedPath: handleRemoveAllowedPath,
			iconLibraries: projectIconLibraries,
			onAddIconPackage: handleAddIconPackage,
			onRemoveIconPackage: handleRemoveIconPackage,
			onAskAIForIconSetup: handleAskAIForIconSetup,
			isElectron: true,
			initialSection: projectSettingsSection,
			copyCodeIncludesComponents: copyCodeSetting.includesComponents,
			onChangeCopyCodeIncludesComponents: copyCodeSetting.setIncludesComponents,
			canEditCopyCode: canEdit,
			skills: t94,
			projectSize: t95
		});
		$[217] = allowedPaths;
		$[218] = canEdit;
		$[219] = copyCodeSetting.includesComponents;
		$[220] = copyCodeSetting.setIncludesComponents;
		$[221] = handleAddAllowedPath;
		$[222] = handleAddIconPackage;
		$[223] = handleAskAIForIconSetup;
		$[224] = handleRemoveAllowedPath;
		$[225] = handleRemoveIconPackage;
		$[226] = handleRenameProject;
		$[227] = projectIconLibraries;
		$[228] = projectSettingsOpen;
		$[229] = projectSettingsSection;
		$[230] = t91;
		$[231] = t92;
		$[232] = t93;
		$[233] = t94;
		$[234] = t95;
		$[235] = t96;
	} else t96 = $[235];
	let t97;
	if ($[236] !== mcpModal || $[237] !== t88 || $[238] !== t89 || $[239] !== t96) {
		t97 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-screen h-screen flex flex-col",
			children: [
				t88,
				t89,
				mcpModal,
				t96
			]
		});
		$[236] = mcpModal;
		$[237] = t88;
		$[238] = t89;
		$[239] = t96;
		$[240] = t97;
	} else t97 = $[240];
	return t97;
}
function _temp24() {
	const webUrl_0 = getWebUrl();
	window.open(`${webUrl_0}/github/connect?source=electron`, "_blank");
}
function _temp23(n) {
	return n[0];
}
function _temp22(p_0) {
	return p_0.items;
}
function _temp21() {
	return toast.error("Couldn't rename file");
}
function _temp20(err) {
	return console.warn("[Settings] set_allowed_paths failed:", err);
}
function _temp19() {}

export { App };
