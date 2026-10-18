// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ImportDesignSystemDialog.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogContent } from "../../../ui/src/components/Dialog.js";
import { p$3, s$5 } from "../../../../vendor/@phosphor-icons/react.js";
import { toast } from "../../../../vendor/sonner.js";
import { githubAccountPickerUrl, useGitHubStatus } from "../hooks/useGit.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { ImportCodebaseWizard, ImportSourceCard, ImportWizardHeader, connectGitHub, watchGitHubPopup } from "./ImportCodebaseWizard.js";

var CLONE_TOAST_ID = "import-design-system-clone";
/** The prompt the agent receives once a source is chosen. */
var importDesignSystemPrompt = (localPath) => `Import the design system from ${localPath} using the petal-import-from-project skill.`;
/**
* "Where is your design system?" — the chooser behind every import entry point on the
* desktop (chat card, onboarding CTA, Components panel). A local folder is picked with the
* native dialog and shared with the agent; a GitHub repo goes through the codebase wizard,
* which copies the chosen folder to disk so the agent reads it like a local pick. Either way
* `onSource` receives the local path and the caller sends the import prompt.
*/
function ImportDesignSystemDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(54);
	const { projectId, organizationId, onAddAllowedPath, onSource, onStart, onClose } = t0;
	const posthog = usePostHog();
	let t1;
	if ($[0] !== onSource || $[1] !== posthog || $[2] !== projectId) {
		t1 = (localPath, source) => {
			posthog.capture("design_system_import_started", {
				project_id: projectId,
				source
			});
			onSource(localPath);
		};
		$[0] = onSource;
		$[1] = posthog;
		$[2] = projectId;
		$[3] = t1;
	} else t1 = $[3];
	const startImport = t1;
	const [github, setGithub] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const { data: githubStatus } = useGitHubStatus();
	const githubAuthorised = !!githubStatus?.connected;
	const githubReady = githubAuthorised && (githubStatus?.installations?.length ?? 0) > 0;
	const [connectRequested, setConnectRequested] = (0, import_react.useState)("none");
	let t2;
	if ($[4] !== githubStatus?.appSlug) {
		t2 = () => {
			watchGitHubPopup(window.open(githubAccountPickerUrl(githubStatus?.appSlug), "github-install", "width=800,height=700,popup=yes"));
		};
		$[4] = githubStatus?.appSlug;
		$[5] = t2;
	} else t2 = $[5];
	const installGitHubApp = t2;
	if (connectRequested !== "none" && githubReady) {
		setConnectRequested("none");
		setGithub(true);
	} else if (connectRequested === "authorise" && githubAuthorised) {
		setConnectRequested("install");
		installGitHubApp();
	}
	let t3;
	if ($[6] !== githubAuthorised || $[7] !== githubReady || $[8] !== installGitHubApp) {
		t3 = () => {
			if (githubReady) setGithub(true);
			else if (githubAuthorised) {
				setConnectRequested("install");
				installGitHubApp();
			} else {
				setConnectRequested("authorise");
				connectGitHub();
			}
		};
		$[6] = githubAuthorised;
		$[7] = githubReady;
		$[8] = installGitHubApp;
		$[9] = t3;
	} else t3 = $[9];
	const openGithub = t3;
	let t4;
	if ($[10] !== onAddAllowedPath || $[11] !== startImport) {
		t4 = async function pickLocalFolder() {
			const electronApi = window.api;
			if (!electronApi?.invoke) {
				setError("Importing a local folder needs the desktop app.");
				return;
			}
			const picked = await electronApi.invoke("pick_folder", { title: "Choose the codebase to import your design system from" });
			if (!picked?.path) return;
			onAddAllowedPath?.(picked.path);
			startImport(picked.path, "local");
		};
		$[10] = onAddAllowedPath;
		$[11] = startImport;
		$[12] = t4;
	} else t4 = $[12];
	const pickLocalFolder = t4;
	if (github) {
		let t5;
		if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
			t5 = () => setGithub(false);
			$[13] = t5;
		} else t5 = $[13];
		let t6;
		if ($[14] !== onClose || $[15] !== onStart) {
			t6 = () => {
				toast.loading("Cloning your repo…", { id: CLONE_TOAST_ID });
				onStart?.();
				onClose();
			};
			$[14] = onClose;
			$[15] = onStart;
			$[16] = t6;
		} else t6 = $[16];
		let t7;
		if ($[17] !== startImport) {
			t7 = (_importProjectId, localPath_0) => {
				toast.dismiss(CLONE_TOAST_ID);
				if (localPath_0) startImport(localPath_0, "github");
			};
			$[17] = startImport;
			$[18] = t7;
		} else t7 = $[18];
		let t8;
		if ($[19] !== onClose || $[20] !== organizationId || $[21] !== projectId || $[22] !== t6 || $[23] !== t7) {
			t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportCodebaseWizard, {
				organizationId,
				existingProjectId: projectId,
				initialStep: "github",
				initialTrack: "design-system",
				onClose,
				onBack: t5,
				onImportStarted: t6,
				onImported: t7,
				onImportFailed: _temp$16
			});
			$[19] = onClose;
			$[20] = organizationId;
			$[21] = projectId;
			$[22] = t6;
			$[23] = t7;
			$[24] = t8;
		} else t8 = $[24];
		return t8;
	}
	let t5;
	if ($[25] !== onClose) {
		t5 = (open) => {
			if (!open) onClose();
		};
		$[25] = onClose;
		$[26] = t5;
	} else t5 = $[26];
	let t6;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, { title: "Import your design system" });
		$[27] = t6;
	} else t6 = $[27];
	let t7;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(p$3, {
			size: 20,
			weight: "light"
		});
		$[28] = t7;
	} else t7 = $[28];
	let t8;
	if ($[29] !== pickLocalFolder) {
		t8 = () => void pickLocalFolder();
		$[29] = pickLocalFolder;
		$[30] = t8;
	} else t8 = $[30];
	let t9;
	if ($[31] !== pickLocalFolder) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			onClick: () => void pickLocalFolder(),
			children: "Browse"
		});
		$[31] = pickLocalFolder;
		$[32] = t9;
	} else t9 = $[32];
	let t10;
	if ($[33] !== t8 || $[34] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportSourceCard, {
			icon: t7,
			title: "Local codebase",
			description: "Choose a project folder on your computer.",
			onClick: t8,
			action: t9
		});
		$[33] = t8;
		$[34] = t9;
		$[35] = t10;
	} else t10 = $[35];
	let t11;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
			size: 20,
			weight: "light"
		});
		$[36] = t11;
	} else t11 = $[36];
	const t12 = githubReady ? "Choose a repo" : "Connect GitHub";
	let t13;
	if ($[37] !== openGithub || $[38] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			onClick: openGithub,
			children: t12
		});
		$[37] = openGithub;
		$[38] = t12;
		$[39] = t13;
	} else t13 = $[39];
	let t14;
	if ($[40] !== openGithub || $[41] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportSourceCard, {
			icon: t11,
			title: "GitHub repository",
			description: "Choose a repo to import its design system.",
			onClick: openGithub,
			action: t13
		});
		$[40] = openGithub;
		$[41] = t13;
		$[42] = t14;
	} else t14 = $[42];
	let t15;
	if ($[43] !== t10 || $[44] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [t10, t14]
		});
		$[43] = t10;
		$[44] = t14;
		$[45] = t15;
	} else t15 = $[45];
	let t16;
	if ($[46] !== error) {
		t16 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "alert",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "danger",
				children: error
			})
		});
		$[46] = error;
		$[47] = t16;
	} else t16 = $[47];
	let t17;
	if ($[48] !== t15 || $[49] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			layout: "legacy",
			showCloseButton: false,
			"aria-describedby": void 0,
			className: "inset-0 m-auto flex h-fit w-[520px] max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-xl border border-ed-menu-border bg-ed-background p-0 shadow-ed-popover sm:max-w-[520px]",
			children: [t6, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5 px-5 pb-5 pt-3",
				children: [t15, t16]
			})]
		});
		$[48] = t15;
		$[49] = t16;
		$[50] = t17;
	} else t17 = $[50];
	let t18;
	if ($[51] !== t17 || $[52] !== t5) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: true,
			onOpenChange: t5,
			children: t17
		});
		$[51] = t17;
		$[52] = t5;
		$[53] = t18;
	} else t18 = $[53];
	return t18;
}
function _temp$16(message) {
	return toast.error(message, { id: CLONE_TOAST_ID });
}

export { ImportDesignSystemDialog, importDesignSystemPrompt };
