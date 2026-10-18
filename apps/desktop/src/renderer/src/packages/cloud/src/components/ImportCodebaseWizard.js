// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ImportCodebaseWizard.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getWebUrl } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { importProjectChunked } from "../hooks/useProjects.js";
import { addAllowedPathForProject } from "../hooks/useProject.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { Badge } from "../../../ui/src/components/Badge.js";
import { SearchIcon, XIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Tooltip } from "../../../ui/src/components/Tooltip.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { c$12, c$15, c$4, m$6, m$7, n$11, n$12, n$18, p$3, s$10, s$12, s$5, s$7, s$8 } from "../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../ui/src/components/DropdownMenu.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../ui/src/components/InputGroup.js";
import { RadioGroup, RadioGroupItem } from "../../../ui/src/components/RadioGroup.js";
import { ScrollArea } from "../../../ui/src/components/ScrollArea.js";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "../../../ui/src/components/Combobox.js";
import { fetchGitHubFolder, githubAccountPickerUrl, useDisconnectGitHub, useGitHubStatus, useImportFromGitHub, useInstallationRepos, useRepoTree } from "../hooks/useGit.js";
import { isPlanLimitError$1 } from "../lib/planRecommendations.js";
import { isElectronApp } from "../utils/isElectronApp.js";
import { openUpgradeAfterDialog, useOpenUpgradeModal } from "./UpgradeModalProvider.js";
import { relativeTime } from "../utils/relativeTime.js";

function watchGitHubPopup(popup) {
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["github-status"] });
		queryClient.invalidateQueries({ queryKey: ["installation-repos"] });
	};
	const onMessage = (e) => {
		if (e.data?.type === "github-app-connected") {
			popup?.close();
			refresh();
		}
	};
	window.addEventListener("message", onMessage);
	let ticks = 0;
	const id = setInterval(() => {
		refresh();
		ticks = ticks + 1;
		if (ticks >= 8) {
			clearInterval(id);
			window.removeEventListener("message", onMessage);
		}
	}, 1500);
}
function connectGitHub() {
	if (isElectronApp()) {
		const webUrl = getWebUrl() || "http://localhost:5173";
		watchGitHubPopup(window.open(`${webUrl}/github/connect?source=electron`, "github-install", "width=600,height=700,popup=yes"));
		return;
	}
	const clientId = "Iv23liAOzyFRkyMtOcEh";
	const state = crypto.randomUUID();
	localStorage.setItem("github-oauth-state", state);
	const callbackUrl = `${window.location.origin}/github/callback`;
	const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;
	watchGitHubPopup(window.open(url, "github-install", "width=600,height=700,popup=yes"));
}
/**
* Import-from-codebase wizard.
* - design-system → local folder OR GitHub folder copied to a user-picked directory → AI import
*   (`petal-import-from-project`). Desktop writes the GitHub files so local_read works like a local pick.
* - entire → GitHub and/or local folder → bulk file import (+ git sync on GitHub)
*/
function ImportCodebaseWizard(t0) {
	const $ = (0, import_compiler_runtime.c)(141);
	const { organizationId, onClose, onBack, onPickLocal, onImported, onImportStarted, onImportFailed, hasExistingComponents: t1, supportsLocalEntire: t2, existingProjectId: t3, initialStep: t4, initialTrack: t5 } = t0;
	const hasExistingComponents = t1 === void 0 ? false : t1;
	const supportsLocalEntire = t2 === void 0 ? true : t2;
	const existingProjectId = t3 === void 0 ? null : t3;
	const initialStep = t4 === void 0 ? "what" : t4;
	const initialTrack = t5 === void 0 ? "design-system" : t5;
	const [step, setStep] = (0, import_react.useState)(initialStep);
	const [track, setTrack] = (0, import_react.useState)(initialTrack);
	const { data: githubStatus } = useGitHubStatus();
	const [installationId, setInstallationId] = (0, import_react.useState)(null);
	const activeInstallation = installationId ?? githubStatus?.installations?.[0]?.installationId ?? null;
	let t6;
	if ($[0] !== githubStatus?.appSlug) {
		t6 = function addGitHubAccount() {
			watchGitHubPopup(window.open(githubAccountPickerUrl(githubStatus?.appSlug), "github-add-account", "width=800,height=700,popup=yes"));
		};
		$[0] = githubStatus?.appSlug;
		$[1] = t6;
	} else t6 = $[1];
	const addGitHubAccount = t6;
	const { data: t7, isLoading: reposLoading } = useInstallationRepos(activeInstallation, !!githubStatus?.connected && step === "github");
	const repos = t7 === void 0 ? [] : t7;
	const importFromGitHub = useImportFromGitHub();
	const disconnectGitHub = useDisconnectGitHub();
	const [repoSearch, setRepoSearch] = (0, import_react.useState)("");
	const [importError, setImportError] = (0, import_react.useState)(null);
	const [staging, setStaging] = (0, import_react.useState)(false);
	const [destFolder, setDestFolder] = (0, import_react.useState)(null);
	const busy = importFromGitHub.isPending || staging;
	const upgradeModal = useOpenUpgradeModal();
	const [selectedRepo, setSelectedRepo] = (0, import_react.useState)(null);
	const [selectedBranch, setSelectedBranch] = (0, import_react.useState)(null);
	const [selectedFolder, setSelectedFolder] = (0, import_react.useState)("");
	const treeStep = step === "confirm" || step === "folder" || step === "destination";
	const { data: repoTree, isLoading: treeLoading } = useRepoTree(treeStep ? activeInstallation : null, treeStep ? selectedRepo?.fullName ?? null : null, selectedBranch ?? void 0);
	const branch = selectedBranch ?? selectedRepo?.defaultBranch ?? repoTree?.defaultBranch ?? "";
	let t8;
	if ($[2] !== repoTree || $[3] !== selectedFolder) {
		t8 = !repoTree ? [] : !selectedFolder ? repoTree.files : repoTree.files.filter((f) => f === selectedFolder || f.startsWith(`${selectedFolder}/`));
		$[2] = repoTree;
		$[3] = selectedFolder;
		$[4] = t8;
	} else t8 = $[4];
	const fileCount = t8.length;
	let t9;
	if ($[5] !== selectedRepo || $[6] !== setSelectedBranch || $[7] !== setSelectedFolder || $[8] !== track) {
		t9 = function goToScope() {
			if (!selectedRepo) return;
			setSelectedBranch(selectedRepo.defaultBranch);
			setSelectedFolder("");
			setStep(track === "entire" ? "confirm" : "folder");
		};
		$[5] = selectedRepo;
		$[6] = setSelectedBranch;
		$[7] = setSelectedFolder;
		$[8] = track;
		$[9] = t9;
	} else t9 = $[9];
	const goToScope = t9;
	let t10;
	if ($[10] !== activeInstallation || $[11] !== branch || $[12] !== githubStatus?.installations || $[13] !== importFromGitHub || $[14] !== onClose || $[15] !== onImported || $[16] !== organizationId || $[17] !== selectedRepo || $[18] !== setImportError || $[19] !== upgradeModal?.openUpgradeModal) {
		t10 = async function handleEntireImport() {
			if (!selectedRepo || !organizationId || !activeInstallation) return;
			const accountLogin = githubStatus?.installations?.find((i) => i.installationId === activeInstallation)?.accountLogin ?? "";
			setImportError(null);
			try {
				const { project } = await importFromGitHub.mutateAsync({
					organizationId,
					repo: selectedRepo.fullName,
					branch,
					installationId: activeInstallation,
					accountLogin
				});
				onImported(project.id);
			} catch (t11) {
				const err = t11;
				if (isPlanLimitError$1(err)) {
					onClose();
					openUpgradeAfterDialog(upgradeModal?.openUpgradeModal, {
						reason: err.reason,
						message: err.message
					});
					return;
				}
				setImportError(err instanceof Error ? err.message : "Failed to import repository");
			}
		};
		$[10] = activeInstallation;
		$[11] = branch;
		$[12] = githubStatus?.installations;
		$[13] = importFromGitHub;
		$[14] = onClose;
		$[15] = onImported;
		$[16] = organizationId;
		$[17] = selectedRepo;
		$[18] = setImportError;
		$[19] = upgradeModal?.openUpgradeModal;
		$[20] = t10;
	} else t10 = $[20];
	const handleEntireImport = t10;
	let t11;
	if ($[21] !== setImportError) {
		t11 = async function pickDestFolder() {
			const electronApi = window.api;
			if (!isElectronApp() || !electronApi?.invoke) {
				setImportError("AI design system import from GitHub needs the desktop app.");
				return;
			}
			const picked = await electronApi.invoke("pick_folder", { title: "Choose a folder to pull the GitHub codebase into" });
			if (!picked?.path) return;
			setDestFolder(picked.path);
			setImportError(null);
		};
		$[21] = setImportError;
		$[22] = t11;
	} else t11 = $[22];
	const pickDestFolder = t11;
	let t12;
	if ($[23] !== activeInstallation || $[24] !== branch || $[25] !== destFolder || $[26] !== existingProjectId || $[27] !== onClose || $[28] !== onImportFailed || $[29] !== onImportStarted || $[30] !== onImported || $[31] !== organizationId || $[32] !== selectedFolder || $[33] !== selectedRepo || $[34] !== setImportError || $[35] !== upgradeModal?.openUpgradeModal) {
		t12 = async function handleDesignSystemGitHubImport() {
			if (!selectedRepo || !activeInstallation) return;
			const electronApi_0 = window.api;
			if (!isElectronApp() || !electronApi_0?.invoke) {
				setImportError("AI design system import from GitHub needs the desktop app.");
				return;
			}
			if (!existingProjectId && !organizationId) {
				setImportError("Organization required to create a file.");
				return;
			}
			if (!destFolder) {
				setImportError("Select a folder to pull the GitHub codebase into.");
				return;
			}
			setImportError(null);
			setStaging(true);
			onImportStarted?.();
			const runImport = async () => {
				const staged = await fetchGitHubFolder({
					installationId: activeInstallation,
					repo: selectedRepo.fullName,
					branch,
					path: selectedFolder || void 0
				});
				const { path: localPath } = await electronApi_0.invoke("stage_import_directory", {
					parentPath: destFolder,
					label: staged.label,
					source: {
						repo: staged.repo,
						branch: staged.branch,
						commitSha: staged.commitSha,
						path: staged.path
					},
					files: staged.files,
					assets: staged.assets
				});
				let projectId;
				if (existingProjectId) projectId = existingProjectId;
				else {
					const result = await importProjectChunked({
						organizationId,
						name: staged.label
					});
					queryClient.invalidateQueries({ queryKey: ["projects"] });
					projectId = result.project.id;
				}
				const paths = addAllowedPathForProject(projectId, localPath);
				await electronApi_0.invoke("set_allowed_paths", {
					projectId,
					paths
				});
				onImported(projectId, localPath);
			};
			await runImport().catch((err_0) => {
				if (isPlanLimitError$1(err_0)) {
					onClose();
					openUpgradeAfterDialog(upgradeModal?.openUpgradeModal, {
						reason: err_0.reason,
						message: err_0.message
					});
					return;
				}
				const message = err_0 instanceof Error ? err_0.message : "Failed to copy repository for AI import";
				if (onImportFailed) onImportFailed(message);
				else setImportError(message);
			}).finally(() => {
				setStaging(false);
			});
		};
		$[23] = activeInstallation;
		$[24] = branch;
		$[25] = destFolder;
		$[26] = existingProjectId;
		$[27] = onClose;
		$[28] = onImportFailed;
		$[29] = onImportStarted;
		$[30] = onImported;
		$[31] = organizationId;
		$[32] = selectedFolder;
		$[33] = selectedRepo;
		$[34] = setImportError;
		$[35] = upgradeModal?.openUpgradeModal;
		$[36] = t12;
	} else t12 = $[36];
	const handleDesignSystemGitHubImport = t12;
	let t13;
	if ($[37] !== githubStatus?.appSlug) {
		t13 = function adjustPermissions() {
			watchGitHubPopup(window.open(githubAccountPickerUrl(githubStatus?.appSlug), "github-permissions", "width=900,height=700,popup=yes"));
		};
		$[37] = githubStatus?.appSlug;
		$[38] = t13;
	} else t13 = $[38];
	const adjustPermissions = t13;
	const query = repoSearch.trim().toLowerCase();
	const filteredRepos = query ? repos.filter((r) => r.fullName.toLowerCase().includes(query)) : repos;
	let t14;
	if ($[39] !== activeInstallation || $[40] !== githubStatus?.installations) {
		t14 = githubStatus?.installations?.find((i_0) => i_0.installationId === activeInstallation)?.accountLogin;
		$[39] = activeInstallation;
		$[40] = githubStatus?.installations;
		$[41] = t14;
	} else t14 = $[41];
	const activeAccount = t14;
	const trackTitle = track === "entire" ? "Connect the entire codebase" : "Import your design system";
	let t15;
	if ($[42] !== busy || $[43] !== onClose) {
		t15 = (open) => {
			if (!open && !busy) onClose();
		};
		$[42] = busy;
		$[43] = onClose;
		$[44] = t15;
	} else t15 = $[44];
	let t16;
	if ($[45] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = { height: "min(85vh, 480px)" };
		$[45] = t16;
	} else t16 = $[45];
	let t17;
	let t18;
	let t19;
	if ($[46] !== busy) {
		t17 = (e) => {
			if (busy) e.preventDefault();
		};
		t18 = (e_0) => {
			if (busy) e_0.preventDefault();
		};
		t19 = (e_1) => {
			if (busy) e_1.preventDefault();
		};
		$[46] = busy;
		$[47] = t17;
		$[48] = t18;
		$[49] = t19;
	} else {
		t17 = $[47];
		t18 = $[48];
		t19 = $[49];
	}
	let t20;
	if ($[50] !== hasExistingComponents || $[51] !== onBack || $[52] !== onClose || $[53] !== step || $[54] !== track) {
		t20 = step === "what" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: "Import from codebase",
			subtitle: "Choose how you want to connect your repo to Petal."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-5 px-5 pb-5 pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
				value: track,
				onValueChange: (v) => {
					if (v === "entire" && hasExistingComponents) return;
					setTrack(v);
				},
				className: "gap-4 font-sans",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportTrackCard, {
					value: "design-system",
					selected: track === "design-system",
					onSelect: () => setTrack("design-system"),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$11, {
						size: 16,
						weight: "bold"
					}),
					title: "Import design system",
					badge: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "h-[18px] px-1.5 text-[10px] font-medium",
						children: "Recommended"
					}),
					description: "AI reads your components and adapts them into Petal via the import skill.",
					bullets: [
						"Best for monorepos or full production apps",
						"Push to a separate “design repo”",
						"Sync design system with your codebase using the MCP"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportTrackCard, {
					value: "entire",
					selected: track === "entire",
					onSelect: () => setTrack("entire"),
					disabled: hasExistingComponents,
					explanation: "This file already has components. To connect an entire codebase, start a new file.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
						size: 16,
						weight: "bold"
					}),
					title: "Connect the entire codebase",
					badge: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "h-[18px] border-0 bg-ed-warning/15 px-1.5 text-[10px] font-medium text-ed-warning-foreground",
						children: "Experimental"
					}),
					description: "Pulls all the code from your repo into Petal and keeps it in sync.",
					bullets: [
						"Best for UI libraries",
						"Push and pull to git",
						"Full access to every file and page",
						{
							text: "Only some projects work. Needs Tailwind v4 + React.",
							tone: "warn"
						}
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: "mt-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "ghost",
					onClick: onBack ?? onClose,
					children: "Back"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "outline",
					onClick: () => setStep("where"),
					children: "Next"
				})]
			})]
		})] });
		$[50] = hasExistingComponents;
		$[51] = onBack;
		$[52] = onClose;
		$[53] = step;
		$[54] = track;
		$[55] = t20;
	} else t20 = $[55];
	let t21;
	if ($[56] !== onPickLocal || $[57] !== step || $[58] !== supportsLocalEntire || $[59] !== track) {
		t21 = step === "where" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: "Where is your code?",
			subtitle: track === "design-system" ? "Link a local folder, or a GitHub folder. AI import runs the same either way (desktop)." : "Link a folder on your computer, or connect a GitHub repository."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-5 px-5 pb-5 pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportSourceCard, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
						size: 16,
						weight: "bold"
					}),
					title: "GitHub",
					description: track === "design-system" ? "Pick a repo and folder. We’ll copy it to a folder you choose, then AI imports like a local folder." : "Authorize GitHub, then pick a repo and branch.",
					onClick: () => setStep("github"),
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "outline",
						LeftIcon: s$5,
						onClick: () => setStep("github"),
						children: "Connect GitHub"
					})
				}), (track !== "entire" || supportsLocalEntire) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportSourceCard, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(p$3, {
						size: 16,
						weight: "bold"
					}),
					title: "Local folder",
					description: track === "design-system" ? "Browse to your components folder. Claude imports via the design-system skill." : "Drag a folder here or browse your computer.",
					onClick: () => onPickLocal?.(track),
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						onClick: () => onPickLocal?.(track),
						children: "Browse"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
				className: "mt-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "ghost",
					onClick: () => setStep("what"),
					children: "Back"
				})
			})]
		})] });
		$[56] = onPickLocal;
		$[57] = step;
		$[58] = supportsLocalEntire;
		$[59] = track;
		$[60] = t21;
	} else t21 = $[60];
	let t22;
	if ($[61] !== activeAccount || $[62] !== activeInstallation || $[63] !== addGitHubAccount || $[64] !== adjustPermissions || $[65] !== disconnectGitHub || $[66] !== filteredRepos || $[67] !== githubStatus?.connected || $[68] !== githubStatus?.installations || $[69] !== goToScope || $[70] !== importError || $[71] !== initialStep || $[72] !== onBack || $[73] !== onClose || $[74] !== organizationId || $[75] !== repoSearch || $[76] !== reposLoading || $[77] !== selectedRepo || $[78] !== setImportError || $[79] !== setRepoSearch || $[80] !== setSelectedRepo || $[81] !== step || $[82] !== track || $[83] !== trackTitle) {
		t22 = step === "github" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: trackTitle,
			subtitle: "Which repo would you like to import from?"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5 pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "xs",
							variant: "outline",
							isChildText: false,
							className: "gap-2",
							children: [
								activeAccount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubAvatar, {
									login: activeAccount,
									className: "size-4"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
									size: 14,
									className: "text-ed-foreground"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: activeAccount ?? "Account"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$12, {
									size: 12,
									className: "shrink-0 text-ed-muted-foreground"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "start",
						className: "w-56",
						children: [
							(githubStatus?.installations ?? []).map((inst) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setInstallationId(inst.installationId),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubAvatar, {
										login: inst.accountLogin,
										className: "size-4"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1 truncate",
										children: inst.accountLogin
									}),
									inst.installationId === activeInstallation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, {
										size: 14,
										weight: "bold"
									})
								]
							}, inst.installationId)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: addGitHubAccount,
								children: "Add GitHub account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => {
									setSelectedRepo(null);
									setInstallationId(null);
									disconnectGitHub.mutate(void 0, { onError: (err_1) => setImportError(err_1 instanceof Error ? err_1.message : "Failed to disconnect GitHub") });
								},
								children: "Disconnect GitHub"
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
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
							placeholder: "Search repositories",
							value: repoSearch,
							onChange: (e_2) => setRepoSearch(e_2.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "-mx-5 min-h-0 flex-1 border-y border-ed-border",
					viewportClassName: "px-3 py-1",
					children: reposLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-24 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "tertiary",
							children: "Loading repositories…"
						})
					}) : filteredRepos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-24 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "tertiary",
							children: "No repositories found."
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-0.5",
						children: filteredRepos.map((repo) => {
							const owner = repo.fullName.split("/")[0];
							const name = repo.fullName.slice(owner.length + 1) || repo.fullName;
							const isSelected = selectedRepo?.fullName === repo.fullName;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => setSelectedRepo(repo),
								role: "radio",
								"aria-checked": isSelected,
								className: cn$2("flex h-7 items-center gap-2 rounded px-2", isSelected ? "bg-ed-accent text-ed-accent-foreground" : "hover:bg-ed-accent hover:text-ed-accent-foreground"),
								children: [isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$8, {
									size: 16,
									weight: "fill",
									className: "shrink-0 text-ed-foreground"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$7, {
									size: 16,
									className: "shrink-0 text-ed-muted-foreground/60"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 flex-1 items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
											size: "2xs",
											weight: "medium",
											variant: "primary",
											className: "truncate",
											children: name
										}),
										repo.private && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$12, {
											size: 12,
											className: "shrink-0 text-ed-muted-foreground"
										}),
										repo.updatedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
											size: "3xs",
											weight: "regular",
											variant: "tertiary",
											className: "shrink-0",
											children: ["updated ", relativeTime(repo.updatedAt)]
										})
									]
								})]
							}, repo.fullName);
						})
					})
				}),
				importError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "danger",
					children: importError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "mt-auto items-center justify-between",
					children: [githubStatus?.connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							weight: "regular",
							variant: "tertiary",
							children: "Don't see your repo?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							size: "xs",
							isChildText: false,
							className: "h-auto p-0 text-ed-foreground underline decoration-ed-foreground/30 underline-offset-2 hover:decoration-ed-foreground",
							onClick: adjustPermissions,
							children: "Adjust your GitHub App permissions"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "xs",
							variant: "ghost",
							onClick: () => {
								setSelectedRepo(null);
								if (initialStep === "github") (onBack ?? onClose)();
								else setStep("where");
							},
							children: "Back"
						}), githubStatus?.connected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "xs",
							variant: "outline",
							onClick: goToScope,
							disabled: !selectedRepo || track === "entire" && !organizationId,
							children: "Next"
						})]
					})]
				})
			]
		})] });
		$[61] = activeAccount;
		$[62] = activeInstallation;
		$[63] = addGitHubAccount;
		$[64] = adjustPermissions;
		$[65] = disconnectGitHub;
		$[66] = filteredRepos;
		$[67] = githubStatus?.connected;
		$[68] = githubStatus?.installations;
		$[69] = goToScope;
		$[70] = importError;
		$[71] = initialStep;
		$[72] = onBack;
		$[73] = onClose;
		$[74] = organizationId;
		$[75] = repoSearch;
		$[76] = reposLoading;
		$[77] = selectedRepo;
		$[78] = setImportError;
		$[79] = setRepoSearch;
		$[80] = setSelectedRepo;
		$[81] = step;
		$[82] = track;
		$[83] = trackTitle;
		$[84] = t22;
	} else t22 = $[84];
	let t23;
	if ($[85] !== branch || $[86] !== busy || $[87] !== fileCount || $[88] !== handleEntireImport || $[89] !== importError || $[90] !== importFromGitHub.isPending || $[91] !== organizationId || $[92] !== repoTree?.branches || $[93] !== selectedRepo || $[94] !== setSelectedBranch || $[95] !== step || $[96] !== treeLoading) {
		t23 = step === "confirm" && selectedRepo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: "Connect this repo",
			subtitle: "Pick the branch to sync - the entire repo is pulled into Petal."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5 pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepoChip, { repo: selectedRepo }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col divide-y divide-ed-border overflow-hidden rounded-lg border border-ed-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-3 px-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
								size: 16,
								className: "shrink-0 text-ed-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 flex-col gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "2xs",
									weight: "medium",
									variant: "primary",
									children: "Branch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "3xs",
									weight: "regular",
									variant: "tertiary",
									children: "Petal works on this branch and pushes commits to it."
								})]
							}),
							(repoTree?.branches?.length ?? 0) > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BranchCombobox, {
								branch,
								branches: repoTree?.branches ?? [],
								onSelectBranch: setSelectedBranch,
								triggerClassName: "flex min-w-0 max-w-[220px] shrink-0 items-center gap-2 rounded-md border border-ed-input bg-transparent px-3 py-1.5 text-[11px] hover:bg-ed-muted/30 [&>svg:last-child]:shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "2xs",
									weight: "medium",
									variant: "primary",
									className: "min-w-0 truncate",
									children: branch || "main"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								content: branch || "main",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex min-w-0 max-w-[220px] shrink-0 items-center gap-2 rounded-md border border-ed-input px-3 py-1.5 shadow-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
										size: "2xs",
										weight: "medium",
										variant: "primary",
										className: "min-w-0 truncate",
										children: branch || "main"
									})
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-3 px-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(p$3, {
								size: 16,
								className: "shrink-0 text-ed-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 flex-col gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "2xs",
									weight: "medium",
									variant: "primary",
									children: "Scope"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "3xs",
									weight: "regular",
									variant: "tertiary",
									children: treeLoading ? "Reading repository…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										"Entire repository · ",
										fileCount.toLocaleString(),
										" files · respects .gitignore"
									] })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "h-[18px] shrink-0 border-0 bg-ed-warning/15 px-1.5 text-[10px] font-medium text-ed-warning-foreground",
								children: "Experimental"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-row items-start gap-3 rounded-lg border border-ed-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex shrink-0 rounded-md bg-ed-muted p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$12, {
							size: 16,
							weight: "bold",
							className: "text-ed-muted-foreground"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "2xs",
							weight: "medium",
							variant: "primary",
							children: "Everything stays in sync"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
							size: "3xs",
							weight: "regular",
							variant: "tertiary",
							children: [
								"We’ll clone ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ed-foreground",
									children: selectedRepo.fullName
								}),
								" into Petal. Changes you design here can be pushed back as commits, and can be pulled to update the code in your Petal project."
							]
						})]
					})]
				}),
				importError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "danger",
					children: importError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "ghost",
						onClick: () => setStep("github"),
						disabled: busy,
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "outline",
						onClick: () => handleEntireImport(),
						disabled: !organizationId || busy,
						loading: importFromGitHub.isPending,
						children: "Connect repository"
					})]
				})
			]
		})] });
		$[85] = branch;
		$[86] = busy;
		$[87] = fileCount;
		$[88] = handleEntireImport;
		$[89] = importError;
		$[90] = importFromGitHub.isPending;
		$[91] = organizationId;
		$[92] = repoTree?.branches;
		$[93] = selectedRepo;
		$[94] = setSelectedBranch;
		$[95] = step;
		$[96] = treeLoading;
		$[97] = t23;
	} else t23 = $[97];
	let t24;
	if ($[98] !== branch || $[99] !== busy || $[100] !== existingProjectId || $[101] !== importError || $[102] !== organizationId || $[103] !== repoTree?.branches || $[104] !== repoTree?.files || $[105] !== selectedFolder || $[106] !== selectedRepo || $[107] !== setImportError || $[108] !== setSelectedBranch || $[109] !== setSelectedFolder || $[110] !== step || $[111] !== trackTitle || $[112] !== treeLoading) {
		t24 = step === "folder" && selectedRepo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: trackTitle,
			subtitle: "Which folder contains your design system? You can choose the root if you don't know."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5 pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepoPill, {
					repo: selectedRepo,
					branch,
					branches: repoTree?.branches ?? [],
					onSelectBranch: (b) => {
						setSelectedBranch(b);
						setSelectedFolder("");
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, {
					repoName: selectedRepo.fullName.split("/")[1] ?? selectedRepo.fullName,
					files: repoTree?.files ?? [],
					loading: treeLoading,
					selected: selectedFolder,
					onSelect: setSelectedFolder
				}),
				importError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "danger",
					children: importError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "ghost",
						onClick: () => setStep("github"),
						disabled: busy,
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "outline",
						onClick: () => {
							setImportError(null);
							setStep("destination");
						},
						disabled: busy || !existingProjectId && !organizationId,
						children: "Next"
					})]
				})
			]
		})] });
		$[98] = branch;
		$[99] = busy;
		$[100] = existingProjectId;
		$[101] = importError;
		$[102] = organizationId;
		$[103] = repoTree?.branches;
		$[104] = repoTree?.files;
		$[105] = selectedFolder;
		$[106] = selectedRepo;
		$[107] = setImportError;
		$[108] = setSelectedBranch;
		$[109] = setSelectedFolder;
		$[110] = step;
		$[111] = trackTitle;
		$[112] = treeLoading;
		$[113] = t24;
	} else t24 = $[113];
	let t25;
	if ($[114] !== branch || $[115] !== busy || $[116] !== destFolder || $[117] !== existingProjectId || $[118] !== handleDesignSystemGitHubImport || $[119] !== importError || $[120] !== organizationId || $[121] !== pickDestFolder || $[122] !== selectedFolder || $[123] !== selectedRepo || $[124] !== staging || $[125] !== step || $[126] !== trackTitle) {
		t25 = step === "destination" && selectedRepo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportWizardHeader, {
			title: trackTitle,
			subtitle: "What folder would you like to clone your repo to?"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5 pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "-mx-5 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 border-y border-ed-border px-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full max-w-[440px] items-center gap-3 rounded-lg border border-ed-border p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex shrink-0 rounded-[5px] bg-ed-accent p-2 text-ed-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
										size: 20,
										weight: "light"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
									size: "2xs",
									weight: "medium",
									variant: "primary",
									className: "min-w-0 flex-1 truncate",
									children: [selectedRepo.fullName, selectedFolder ? `/${selectedFolder}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-1.5 text-[11px] text-ed-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
										size: 12,
										className: "shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: branch || "main"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$15, {
							size: 14,
							className: "text-ed-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => {
								if (!busy) pickDestFolder();
							},
							className: "flex w-full max-w-[440px] items-center gap-3 rounded-lg border border-ed-border p-4 hover:bg-ed-muted/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex shrink-0 rounded-[5px] bg-ed-accent p-2 text-ed-foreground",
									children: destFolder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$7, {
										size: 20,
										weight: "light"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(p$3, {
										size: 20,
										weight: "light"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									as: "p",
									size: "2xs",
									weight: "medium",
									variant: "primary",
									className: "min-w-0 flex-1 break-all",
									children: destFolder ?? "Local folder"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									onClick: _temp$17,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "xs",
										variant: "outline",
										onClick: () => {
											pickDestFolder();
										},
										disabled: busy,
										children: destFolder ? "Change" : "Choose a folder"
									})
								})
							]
						})
					]
				}),
				importError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "danger",
					children: importError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "ghost",
						onClick: () => setStep("folder"),
						disabled: busy,
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "outline",
						onClick: () => handleDesignSystemGitHubImport(),
						disabled: busy || !destFolder || !existingProjectId && !organizationId,
						loading: staging,
						children: "Start import"
					})]
				})
			]
		})] });
		$[114] = branch;
		$[115] = busy;
		$[116] = destFolder;
		$[117] = existingProjectId;
		$[118] = handleDesignSystemGitHubImport;
		$[119] = importError;
		$[120] = organizationId;
		$[121] = pickDestFolder;
		$[122] = selectedFolder;
		$[123] = selectedRepo;
		$[124] = staging;
		$[125] = step;
		$[126] = trackTitle;
		$[127] = t25;
	} else t25 = $[127];
	let t26;
	if ($[128] !== t17 || $[129] !== t18 || $[130] !== t19 || $[131] !== t20 || $[132] !== t21 || $[133] !== t22 || $[134] !== t23 || $[135] !== t24 || $[136] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			layout: "legacy",
			showCloseButton: false,
			className: "inset-0 m-auto flex w-[640px] max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-xl border border-ed-menu-border bg-ed-background p-0 shadow-ed-popover sm:max-w-[640px]",
			style: t16,
			onEscapeKeyDown: t17,
			onPointerDownOutside: t18,
			onInteractOutside: t19,
			children: [
				t20,
				t21,
				t22,
				t23,
				t24,
				t25
			]
		});
		$[128] = t17;
		$[129] = t18;
		$[130] = t19;
		$[131] = t20;
		$[132] = t21;
		$[133] = t22;
		$[134] = t23;
		$[135] = t24;
		$[136] = t25;
		$[137] = t26;
	} else t26 = $[137];
	let t27;
	if ($[138] !== t15 || $[139] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: true,
			onOpenChange: t15,
			children: t26
		});
		$[138] = t15;
		$[139] = t26;
		$[140] = t27;
	} else t27 = $[140];
	return t27;
}
/** GitHub serves any user/org avatar at github.com/{login}.png — no API needed. */
function _temp$17(e_3) {
	return e_3.stopPropagation();
}
function GitHubAvatar(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { login, className } = t0;
	const t1 = `https://github.com/${login}.png?size=40`;
	let t2;
	if ($[0] !== className) {
		t2 = cn$2("size-[18px] shrink-0 rounded-full bg-ed-muted object-cover", className);
		$[0] = className;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== t1 || $[3] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: t1,
			alt: "",
			className: t2
		});
		$[2] = t1;
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function countComponents(files) {
	return files.filter((f) => {
		if (!/\.(tsx|jsx)$/.test(f)) return false;
		const base = f.split("/").pop() ?? "";
		if (/\.(test|spec|stories)\./.test(base) || base.endsWith(".d.ts")) return false;
		return !/^index\.[jt]sx$/.test(base);
	}).length;
}
function subfoldersOf(files, dir) {
	const prefix = dir ? `${dir}/` : "";
	const names = /* @__PURE__ */ new Set();
	for (const f of files) {
		if (dir && !f.startsWith(prefix)) continue;
		const rest = f.slice(prefix.length);
		const slash = rest.indexOf("/");
		if (slash > 0) names.add(rest.slice(0, slash));
	}
	return Array.from(names).sort((a, b) => a.localeCompare(b));
}
function componentCountByFolder(files) {
	const counts = /* @__PURE__ */ new Map();
	for (const f of files) {
		if (!countComponents([f])) continue;
		const parts = f.split("/");
		let dir = "";
		counts.set("", (counts.get("") ?? 0) + 1);
		for (let i = 0; i < parts.length - 1; i++) {
			dir = dir ? `${dir}/${parts[i]}` : parts[i];
			counts.set(dir, (counts.get(dir) ?? 0) + 1);
		}
	}
	return counts;
}
/** Read-only chip naming the chosen repo; same shape as the account picker on the repo step. */
function RepoChip(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { repo } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
			size: 14,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== repo.fullName) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-6.5 min-w-0 items-center gap-2 rounded-[5px] border border-ed-field-border bg-ed-field px-2 text-[11px] text-ed-foreground shadow-ed-control",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: repo.fullName
			})]
		});
		$[1] = repo.fullName;
		$[2] = t2;
	} else t2 = $[2];
	return t2;
}
/**
* Branch picker. A dropdown you can search is a combobox: the trigger shows the
* current branch, and the popup's input filters `items`.
*
* Inside a modal Dialog the popup portals into the dialog content. Portalled to
* body it sits outside the dialog, whose scroll lock swallows the list's wheel
* events and whose focus trap pulls focus off the search input, closing the popup.
*/
function BranchCombobox(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { branch, branches, onSelectBranch, triggerClassName, children } = t0;
	const [query, setQuery] = (0, import_react.useState)("");
	const [container, setContainer] = (0, import_react.useState)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = (trigger) => {
			setContainer(trigger?.closest("[data-slot=\"dialog-content\"]") ?? null);
		};
		$[0] = t1;
	} else t1 = $[0];
	const findDialog = t1;
	let t2;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = (open) => {
			if (open) setQuery("");
		};
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== onSelectBranch) {
		t3 = (next) => {
			if (next) onSelectBranch(next);
		};
		$[2] = onSelectBranch;
		$[3] = t3;
	} else t3 = $[3];
	const t4 = branch || "main";
	const t5 = `Branch: ${branch || "main"}`;
	let t6;
	if ($[4] !== children || $[5] !== t5 || $[6] !== triggerClassName) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxTrigger, {
			ref: findDialog,
			"aria-label": t5,
			className: triggerClassName,
			children
		});
		$[4] = children;
		$[5] = t5;
		$[6] = triggerClassName;
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== t4 || $[9] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: t4,
			children: t6
		});
		$[8] = t4;
		$[9] = t6;
		$[10] = t7;
	} else t7 = $[10];
	let t10;
	let t8;
	let t9;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxInput, { placeholder: "Search branches" })
		});
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxEmpty, { children: "No branches found." });
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxList, { children: _temp2$11 });
		$[11] = t10;
		$[12] = t8;
		$[13] = t9;
	} else {
		t10 = $[11];
		t8 = $[12];
		t9 = $[13];
	}
	let t11;
	if ($[14] !== container) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComboboxContent, {
			align: "end",
			container,
			className: "w-64",
			children: [
				t8,
				t9,
				t10
			]
		});
		$[14] = container;
		$[15] = t11;
	} else t11 = $[15];
	let t12;
	if ($[16] !== branch || $[17] !== branches || $[18] !== query || $[19] !== t11 || $[20] !== t3 || $[21] !== t7) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Combobox, {
			items: branches,
			value: branch,
			inputValue: query,
			onInputValueChange: setQuery,
			onOpenChange: t2,
			onValueChange: t3,
			children: [t7, t11]
		});
		$[16] = branch;
		$[17] = branches;
		$[18] = query;
		$[19] = t11;
		$[20] = t3;
		$[21] = t7;
		$[22] = t12;
	} else t12 = $[22];
	return t12;
}
/** One segmented control under a step's description: the repo, a divider, then the branch picker. */
function _temp2$11(name) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComboboxItem, {
		value: name,
		className: "gap-2 pr-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
			size: 14,
			className: "size-3.5 shrink-0 text-ed-muted-foreground"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate",
			children: name
		})]
	}, name);
}
function RepoPill(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { repo, branch, branches, onSelectBranch } = t0;
	const multi = branches.length > 1;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
			size: 14,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== repo.fullName) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-2 px-2 text-ed-foreground",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: repo.fullName
			})]
		});
		$[1] = repo.fullName;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== branch || $[4] !== branches || $[5] !== multi || $[6] !== onSelectBranch) {
		t3 = multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BranchCombobox, {
			branch,
			branches,
			onSelectBranch,
			triggerClassName: "inline-flex h-full min-w-0 shrink items-center gap-1.5 rounded-none rounded-r-[4px] border-l border-ed-field-border bg-transparent px-2 text-[11px] text-ed-muted-foreground shadow-none [&>svg:last-child]:shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
				size: 12,
				className: "size-3 shrink-0 text-ed-muted-foreground"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: branch || "main"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: branch || "main",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full min-w-0 shrink items-center gap-1.5 border-l border-ed-field-border px-2 text-ed-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$6, {
					size: 12,
					className: "shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children: branch || "main"
				})]
			})
		});
		$[3] = branch;
		$[4] = branches;
		$[5] = multi;
		$[6] = onSelectBranch;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== t2 || $[9] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-6.5 min-w-0 max-w-full items-center rounded-[5px] border border-ed-field-border bg-ed-field text-[11px] shadow-ed-control",
				children: [t2, t3]
			})
		});
		$[8] = t2;
		$[9] = t3;
		$[10] = t4;
	} else t4 = $[10];
	return t4;
}
function flattenFolders(files, expanded, counts) {
	const rows = [];
	const walk = (dir, depth) => {
		for (const name of subfoldersOf(files, dir)) {
			const path = dir ? `${dir}/${name}` : name;
			const hasChildren = subfoldersOf(files, path).length > 0;
			rows.push({
				path,
				name,
				depth,
				hasChildren,
				count: counts.get(path) ?? 0
			});
			if (hasChildren && expanded.has(path)) walk(path, depth + 1);
		}
	};
	walk("", 0);
	return rows;
}
function FolderTree(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { repoName, files, loading, selected, onSelect } = t0;
	const [expanded, setExpanded] = (0, import_react.useState)(_temp3$8);
	const rows = flattenFolders(files, expanded, componentCountByFolder(files));
	const toggle = (path) => setExpanded((prev) => {
		const next = new Set(prev);
		next.has(path) ? next.delete(path) : next.add(path);
		return next;
	});
	const items = [{
		path: "",
		name: repoName,
		depth: -1,
		hasChildren: subfoldersOf(files, "").length > 0,
		count: 0,
		isRoot: true
	}, ...rows.map(_temp4$8)];
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	const rowRefs = (0, import_react.useRef)(t1);
	const focusRow = (i) => {
		const next_0 = Math.max(0, Math.min(i, items.length - 1));
		setActiveIndex(next_0);
		rowRefs.current[next_0]?.focus();
	};
	const onRowKeyDown = (e, i_0) => {
		const item = items[i_0];
		bb26: switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				focusRow(i_0 + 1);
				break bb26;
			case "ArrowUp":
				e.preventDefault();
				focusRow(i_0 - 1);
				break bb26;
			case "ArrowRight":
				e.preventDefault();
				if (item.hasChildren && !expanded.has(item.path)) toggle(item.path);
				else focusRow(i_0 + 1);
				break bb26;
			case "ArrowLeft":
				e.preventDefault();
				if (item.hasChildren && expanded.has(item.path)) toggle(item.path);
				else focusRow(i_0 - 1);
				break bb26;
			case "Home":
				e.preventDefault();
				focusRow(0);
				break bb26;
			case "End":
				e.preventDefault();
				focusRow(items.length - 1);
				break bb26;
			case "Enter":
			case " ":
				e.preventDefault();
				onSelect(item.path);
		}
	};
	const t2 = "-mx-5 flex min-h-0 flex-1 flex-col border-y border-ed-border";
	const T0 = ScrollArea;
	const t3 = "min-h-0 flex-1";
	const t4 = "px-3 py-1";
	const t5 = loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-24 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			variant: "tertiary",
			children: "Reading repository…"
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "tree",
		"aria-label": "Repository folders",
		className: "flex flex-col gap-0.5",
		children: items.map((item_0, i_1) => {
			const isSelected = selected === item_0.path;
			const isOpen = expanded.has(item_0.path);
			const Icon = isOpen ? m$7 : p$3;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: (el) => {
					rowRefs.current[i_1] = el;
				},
				role: "treeitem",
				"aria-selected": isSelected,
				"aria-expanded": item_0.hasChildren ? isOpen : void 0,
				"aria-level": item_0.depth + 2,
				tabIndex: i_1 === activeIndex ? 0 : -1,
				onFocus: () => setActiveIndex(i_1),
				onKeyDown: (e_0) => onRowKeyDown(e_0, i_1),
				onClick: () => onSelect(item_0.path),
				className: cn$2("flex h-7 items-center gap-2 rounded pr-2", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-ring focus-visible:ring-inset", isSelected ? "bg-ed-accent text-ed-accent-foreground" : "hover:bg-ed-accent hover:text-ed-accent-foreground"),
				style: { paddingLeft: 8 + (item_0.depth + 1) * 16 },
				children: [
					item_0.hasChildren ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						tabIndex: -1,
						"aria-hidden": "true",
						onClick: (e_1) => {
							e_1.stopPropagation();
							toggle(item_0.path);
						},
						className: cn$2("shrink-0", isSelected ? "text-ed-foreground" : "text-ed-muted-foreground hover:text-ed-foreground"),
						children: isOpen || item_0.isRoot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$12, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$10, { size: 12 })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-3 shrink-0" }),
					isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$8, {
						size: 16,
						weight: "fill",
						className: "shrink-0 text-ed-foreground"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$7, {
						size: 16,
						className: "shrink-0 text-ed-muted-foreground/60"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						size: 16,
						weight: isSelected ? "fill" : "regular",
						className: isSelected ? "text-ed-foreground" : "text-ed-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "2xs",
						weight: isSelected ? "medium" : "regular",
						variant: "primary",
						className: "truncate",
						children: item_0.name
					}),
					item_0.isRoot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						weight: "regular",
						variant: "tertiary",
						className: "shrink-0",
						children: "repository root"
					}),
					item_0.count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "ml-1 h-[18px] shrink-0 px-1.5 text-[10px] font-medium",
						children: [
							item_0.count,
							" component",
							item_0.count === 1 ? "" : "s",
							" found"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" })
				]
			}, item_0.path || "__root__");
		})
	});
	let t6;
	if ($[1] !== T0 || $[2] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t2,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
				className: t3,
				viewportClassName: t4,
				children: t5
			})
		});
		$[1] = T0;
		$[2] = t5;
		$[3] = t6;
	} else t6 = $[3];
	return t6;
}
/** Title row, then the optional description; no divider between them. */
function _temp4$8(r) {
	return {
		...r,
		isRoot: false
	};
}
function _temp3$8() {
	return /* @__PURE__ */ new Set();
}
function ImportWizardHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { title, subtitle, right } = t0;
	let t1;
	if ($[0] !== title) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
			className: "m-0 shrink-0 text-ed-ui font-medium leading-4 tracking-[-0.01em] text-ed-foreground",
			children: title
		});
		$[0] = title;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== right) {
		t2 = right && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 justify-end",
			children: right
		});
		$[2] = right;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-xs",
				"aria-label": "Close",
				LeftIcon: XIcon,
				className: "-mr-1.5"
			})
		});
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 items-center justify-end gap-2",
			children: [t2, t3]
		});
		$[5] = t2;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== t1 || $[8] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4 px-5 pt-3 pb-1",
			children: [t1, t4]
		});
		$[7] = t1;
		$[8] = t4;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== subtitle) {
		t6 = subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
			className: "m-0 px-5 text-[11px] leading-4 tracking-[-0.01em] text-ed-muted-foreground",
			children: subtitle
		});
		$[10] = subtitle;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] !== t5 || $[13] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
			className: "shrink-0 gap-0 text-left",
			children: [t5, t6]
		});
		$[12] = t5;
		$[13] = t6;
		$[14] = t7;
	} else t7 = $[14];
	return t7;
}
function ImportTrackCard(t0) {
	const $ = (0, import_compiler_runtime.c)(34);
	const { value, selected, onSelect, icon, title, badge, description, bullets, disabled: t1, explanation } = t0;
	const disabled = t1 === void 0 ? false : t1;
	const t2 = disabled ? void 0 : onSelect;
	let t3;
	if ($[0] !== disabled || $[1] !== selected) {
		t3 = cn$2("relative flex flex-row items-start gap-3 overflow-hidden rounded-lg border p-4", disabled ? "cursor-not-allowed border-ed-border" : cn$2(selected ? "border-ed-primary/50 shadow-2xl/7 ring-[5px] ring-ed-primary/10" : "border-ed-border hover:border-ed-foreground/20"));
		$[0] = disabled;
		$[1] = selected;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== disabled || $[4] !== value) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-0 top-0 z-20 flex justify-end p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
				value,
				disabled
			})
		});
		$[3] = disabled;
		$[4] = value;
		$[5] = t4;
	} else t4 = $[5];
	const t5 = disabled && "opacity-50";
	let t6;
	if ($[6] !== t5) {
		t6 = cn$2("flex shrink-0 rounded-md bg-ed-muted p-1.5 text-ed-foreground", t5);
		$[6] = t5;
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== icon || $[9] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t6,
			children: icon
		});
		$[8] = icon;
		$[9] = t6;
		$[10] = t7;
	} else t7 = $[10];
	const t8 = disabled && "opacity-50";
	let t9;
	if ($[11] !== t8) {
		t9 = cn$2("flex items-center gap-2", t8);
		$[11] = t8;
		$[12] = t9;
	} else t9 = $[12];
	let t10;
	if ($[13] !== title) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			children: title
		});
		$[13] = title;
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	if ($[15] !== badge || $[16] !== t10 || $[17] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t9,
			children: [t10, badge]
		});
		$[15] = badge;
		$[16] = t10;
		$[17] = t9;
		$[18] = t11;
	} else t11 = $[18];
	let t12;
	if ($[19] !== bullets || $[20] !== description || $[21] !== disabled || $[22] !== explanation) {
		t12 = disabled && explanation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			weight: "regular",
			variant: "tertiary",
			children: explanation
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			weight: "regular",
			variant: "tertiary",
			children: description
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-col gap-2",
			children: bullets.map(_temp5$7)
		})] });
		$[19] = bullets;
		$[20] = description;
		$[21] = disabled;
		$[22] = explanation;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== t11 || $[25] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-1.5",
			children: [t11, t12]
		});
		$[24] = t11;
		$[25] = t12;
		$[26] = t13;
	} else t13 = $[26];
	let t14;
	if ($[27] !== disabled || $[28] !== t13 || $[29] !== t2 || $[30] !== t3 || $[31] !== t4 || $[32] !== t7) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: t2,
			"aria-disabled": disabled,
			className: t3,
			children: [
				t4,
				t7,
				t13
			]
		});
		$[27] = disabled;
		$[28] = t13;
		$[29] = t2;
		$[30] = t3;
		$[31] = t4;
		$[32] = t7;
		$[33] = t14;
	} else t14 = $[33];
	return t14;
}
function _temp5$7(b) {
	const text = typeof b === "string" ? b : b.text;
	const warn = typeof b !== "string" && b.tone === "warn";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$4, {
			size: 14,
			weight: "bold",
			className: "shrink-0 text-amber-500"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, {
			size: 14,
			weight: "bold",
			className: "shrink-0 text-emerald-400"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			weight: "regular",
			variant: "secondary",
			children: text
		})]
	}, text);
}
function ImportSourceCard(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { icon, title, description, action, onClick } = t0;
	let t1;
	if ($[0] !== icon) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 rounded-[5px] bg-ed-accent p-2 text-ed-foreground",
			children: icon
		});
		$[0] = icon;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== title) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			className: "min-w-0 truncate",
			children: title
		});
		$[2] = title;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== description) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			weight: "regular",
			variant: "tertiary",
			children: description
		});
		$[4] = description;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t2 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col gap-1",
			children: [t2, t3]
		});
		$[6] = t2;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== action) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onClick: _temp6$5,
			children: action
		});
		$[9] = action;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== onClick || $[12] !== t1 || $[13] !== t4 || $[14] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick,
			className: "flex flex-row items-center gap-3 rounded-lg border border-ed-border p-4 hover:bg-ed-muted/50",
			children: [
				t1,
				t4,
				t5
			]
		});
		$[11] = onClick;
		$[12] = t1;
		$[13] = t4;
		$[14] = t5;
		$[15] = t6;
	} else t6 = $[15];
	return t6;
}
function _temp6$5(e) {
	return e.stopPropagation();
}

export { ImportCodebaseWizard, ImportSourceCard, ImportWizardHeader, connectGitHub, watchGitHubPopup };
