// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/GitPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Badge } from "../../../../ui/src/components/Badge.js";
import { ArrowClockwiseIcon, ArrowSquareOutIcon, CloudUploadIcon, FileIcon, FileMinusIcon, FilePlusIcon, GitBranchIcon, SearchIcon, SpinnerIcon } from "../../../../ui/src/icons.js";
import { Tooltip } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { n$13 } from "../../../../../vendor/@phosphor-icons/react.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/src/components/Select.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

function GitHubIcon(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { size: t1, className } = t0;
	const size = t1 === void 0 ? 16 : t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.303 16.652c-2.837-.344-4.835-2.385-4.835-5.028 0-1.074.387-2.235 1.031-3.008-.279-.709-.236-2.214.086-2.837.86-.107 2.02.344 2.708.967.816-.258 1.676-.386 2.728-.386 1.053 0 1.913.128 2.686.365.666-.602 1.848-1.053 2.708-.946.3.581.344 2.085.064 2.815.688.817 1.053 1.913 1.053 3.03 0 2.643-1.998 4.641-4.877 5.006.73.473 1.224 1.504 1.224 2.686v2.235c0 .644.537 1.01 1.182.752 3.889-1.483 6.94-5.372 6.94-10.185 0-6.081-4.942-11.044-11.022-11.044-6.081 0-10.98 4.963-10.98 11.044a10.84 10.84 0 0 0 7.112 10.206c.58.215 1.139-.172 1.139-.752v-1.719a2.768 2.768 0 0 1-1.032.215c-1.418 0-2.256-.773-2.857-2.213-.237-.58-.495-.924-.989-.988-.258-.022-.344-.129-.344-.258 0-.258.43-.451.86-.451.623 0 1.16.386 1.719 1.181.43.623.881.903 1.418.903.537 0 .881-.194 1.375-.688.365-.365.645-.687.903-.902Z" });
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== className || $[2] !== size) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			"aria-hidden": "true",
			viewBox: "0 0 24 24",
			width: size,
			height: size,
			fill: "currentColor",
			className,
			children: t2
		});
		$[1] = className;
		$[2] = size;
		$[3] = t3;
	} else t3 = $[3];
	return t3;
}
function GitPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(40);
	const { gitStatus, isLoadingStatus, githubConnected, installations, activeInstallationId, onSelectInstallation, isOwner: t1, repos, isLoadingRepos, onConnectRepo, onDisconnectRepo, onCommit, onPull, onCreateRepo, onInstallGitHubApp, onAddGitHubAccount, onDisconnectGitHub, onManageGitHub, onRefresh, isCommitting, isPulling, isCreatingRepo, isConnecting, error } = t0;
	if (!(t1 === void 0 ? true : t1)) {
		if (gitStatus?.connected) {
			let t2;
			if ($[0] !== error || $[1] !== gitStatus || $[2] !== isCommitting || $[3] !== isLoadingStatus || $[4] !== isPulling || $[5] !== onCommit || $[6] !== onDisconnectRepo || $[7] !== onManageGitHub || $[8] !== onPull || $[9] !== onRefresh) {
				t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectedView, {
					gitStatus,
					isLoadingStatus,
					onCommit,
					onPull,
					onDisconnectRepo,
					onManageGitHub,
					onRefresh,
					isCommitting,
					isPulling,
					error
				});
				$[0] = error;
				$[1] = gitStatus;
				$[2] = isCommitting;
				$[3] = isLoadingStatus;
				$[4] = isPulling;
				$[5] = onCommit;
				$[6] = onDisconnectRepo;
				$[7] = onManageGitHub;
				$[8] = onPull;
				$[9] = onRefresh;
				$[10] = t2;
			} else t2 = $[10];
			return t2;
		}
		let t2;
		if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center h-full text-center p-6 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranchIcon, {
					width: 32,
					height: 32,
					className: "text-ed-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ed-muted-foreground",
					children: "Git is not connected to this project. Ask the project owner to set it up."
				})]
			});
			$[11] = t2;
		} else t2 = $[11];
		return t2;
	}
	if (!githubConnected) {
		let t2;
		if ($[12] !== onInstallGitHubApp) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotConnectedView, { onInstall: onInstallGitHubApp });
			$[12] = onInstallGitHubApp;
			$[13] = t2;
		} else t2 = $[13];
		return t2;
	}
	if (!gitStatus?.connected) {
		let t2;
		if ($[14] !== activeInstallationId || $[15] !== error || $[16] !== installations || $[17] !== isConnecting || $[18] !== isCreatingRepo || $[19] !== isLoadingRepos || $[20] !== onAddGitHubAccount || $[21] !== onConnectRepo || $[22] !== onCreateRepo || $[23] !== onDisconnectGitHub || $[24] !== onManageGitHub || $[25] !== onRefresh || $[26] !== onSelectInstallation || $[27] !== repos) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectRepoView, {
				repos,
				isLoadingRepos,
				installations,
				activeInstallationId,
				onSelectInstallation,
				onConnectRepo,
				onCreateRepo,
				onAddGitHubAccount,
				onDisconnectGitHub,
				onManageGitHub,
				onRefresh,
				isCreatingRepo,
				isConnecting,
				error
			});
			$[14] = activeInstallationId;
			$[15] = error;
			$[16] = installations;
			$[17] = isConnecting;
			$[18] = isCreatingRepo;
			$[19] = isLoadingRepos;
			$[20] = onAddGitHubAccount;
			$[21] = onConnectRepo;
			$[22] = onCreateRepo;
			$[23] = onDisconnectGitHub;
			$[24] = onManageGitHub;
			$[25] = onRefresh;
			$[26] = onSelectInstallation;
			$[27] = repos;
			$[28] = t2;
		} else t2 = $[28];
		return t2;
	}
	let t2;
	if ($[29] !== error || $[30] !== gitStatus || $[31] !== isCommitting || $[32] !== isLoadingStatus || $[33] !== isPulling || $[34] !== onCommit || $[35] !== onDisconnectRepo || $[36] !== onManageGitHub || $[37] !== onPull || $[38] !== onRefresh) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectedView, {
			gitStatus,
			isLoadingStatus,
			onCommit,
			onPull,
			onDisconnectRepo,
			onManageGitHub,
			onRefresh,
			isCommitting,
			isPulling,
			error
		});
		$[29] = error;
		$[30] = gitStatus;
		$[31] = isCommitting;
		$[32] = isLoadingStatus;
		$[33] = isPulling;
		$[34] = onCommit;
		$[35] = onDisconnectRepo;
		$[36] = onManageGitHub;
		$[37] = onPull;
		$[38] = onRefresh;
		$[39] = t2;
	} else t2 = $[39];
	return t2;
}
function NotConnectedView(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { onInstall } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubIcon, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13px] font-medium text-ed-foreground",
					children: "Connect to GitHub"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ed-muted-foreground mt-1.5 leading-relaxed",
				children: "Push your canvas and project files to a GitHub repository for version control."
			})]
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubIcon, { size: 14 });
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium",
			children: "Connect GitHub"
		});
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	let t4;
	if ($[3] !== onInstall) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col h-full",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 px-4 pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					size: "sm",
					onClick: onInstall,
					isChildText: false,
					children: [t2, t3]
				})
			})]
		});
		$[3] = onInstall;
		$[4] = t4;
	} else t4 = $[4];
	return t4;
}
function ConnectRepoView(t0) {
	const $ = (0, import_compiler_runtime.c)(124);
	const { repos, isLoadingRepos, installations, activeInstallationId, onSelectInstallation, onConnectRepo, onCreateRepo, onAddGitHubAccount, onDisconnectGitHub, onManageGitHub, onRefresh, isCreatingRepo, isConnecting, error } = t0;
	const [newRepoName, setNewRepoName] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	let t1;
	let t2;
	if ($[0] !== error) {
		t1 = () => {
			if (error) toast.error(error);
		};
		t2 = [error];
		$[0] = error;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	const [connectingRepo, setConnectingRepo] = (0, import_react.useState)(null);
	let t3;
	if ($[3] !== repos) {
		t3 = repos ? [...new Set(repos.map(_temp$21))] : [];
		$[3] = repos;
		$[4] = t3;
	} else t3 = $[4];
	const activeOwner = t3[0] || "";
	let T0;
	let t10;
	let t11;
	let t12;
	let t13;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[5] !== activeInstallationId || $[6] !== activeOwner || $[7] !== connectingRepo || $[8] !== installations || $[9] !== isConnecting || $[10] !== isCreatingRepo || $[11] !== isLoadingRepos || $[12] !== newRepoName || $[13] !== onAddGitHubAccount || $[14] !== onConnectRepo || $[15] !== onCreateRepo || $[16] !== onRefresh || $[17] !== onSelectInstallation || $[18] !== repos || $[19] !== search) {
		const filteredRepos = repos?.filter((r_0) => {
			const [owner, name] = r_0.fullName.split("/");
			if (owner !== activeOwner) return false;
			if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		}) ?? [];
		let t14;
		if ($[31] !== newRepoName || $[32] !== onConnectRepo || $[33] !== onCreateRepo) {
			t14 = async () => {
				if (!newRepoName.trim()) return;
				try {
					const repo = await onCreateRepo(newRepoName.trim());
					await onConnectRepo(repo.fullName, repo.defaultBranch);
				} catch {}
			};
			$[31] = newRepoName;
			$[32] = onConnectRepo;
			$[33] = onCreateRepo;
			$[34] = t14;
		} else t14 = $[34];
		const handleCreateRepo = t14;
		let t15;
		if ($[35] !== onConnectRepo) {
			t15 = (repo_0) => {
				setConnectingRepo(repo_0.fullName);
				onConnectRepo(repo_0.fullName, repo_0.defaultBranch).catch(_temp2$13).finally(() => setConnectingRepo(null));
			};
			$[35] = onConnectRepo;
			$[36] = t15;
		} else t15 = $[36];
		const handleConnectExisting = t15;
		t12 = "flex flex-col h-full";
		let t16;
		let t17;
		if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
			t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubIcon, { size: 16 });
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[13px] font-medium text-ed-foreground flex-1",
				children: "Connect to GitHub"
			});
			$[37] = t16;
			$[38] = t17;
		} else {
			t16 = $[37];
			t17 = $[38];
		}
		const t18 = isLoadingRepos ? "animate-spin" : "";
		let t19;
		if ($[39] !== t18) {
			t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowClockwiseIcon, {
				width: 14,
				height: 14,
				className: t18
			});
			$[39] = t18;
			$[40] = t19;
		} else t19 = $[40];
		let t20;
		if ($[41] !== onRefresh || $[42] !== t19) {
			t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					t16,
					t17,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: "Refresh",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Refresh",
							onClick: onRefresh,
							className: "p-0.5 rounded hover:bg-ed-accent text-ed-muted-foreground hover:text-ed-foreground shrink-0",
							children: t19
						})
					})
				]
			});
			$[41] = onRefresh;
			$[42] = t19;
			$[43] = t20;
		} else t20 = $[43];
		let t21;
		if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
			t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ed-muted-foreground mt-1.5 leading-relaxed",
				children: "Push your canvas and project files to a GitHub repository for version control."
			});
			$[44] = t21;
		} else t21 = $[44];
		if ($[45] !== t20) {
			t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 pb-3",
				children: [t20, t21]
			});
			$[45] = t20;
			$[46] = t13;
		} else t13 = $[46];
		T0 = ScrollArea;
		t11 = "flex-1";
		t8 = "flex flex-col gap-6 px-4 pt-6 pb-4";
		let t22;
		if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
			t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-ed-muted-foreground",
				children: "Create new repository"
			});
			$[47] = t22;
		} else t22 = $[47];
		let t23;
		if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
			t23 = (e) => setNewRepoName(e.target.value);
			$[48] = t23;
		} else t23 = $[48];
		let t24;
		if ($[49] !== handleCreateRepo) {
			t24 = (e_0) => {
				if (e_0.key === "Enter") handleCreateRepo();
			};
			$[49] = handleCreateRepo;
			$[50] = t24;
		} else t24 = $[50];
		let t25;
		if ($[51] !== newRepoName || $[52] !== t24) {
			t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "h-8 px-3 text-[13px] bg-ed-background border border-ed-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ed-ring",
				placeholder: "my-petal-project",
				value: newRepoName,
				onChange: t23,
				onKeyDown: t24
			});
			$[51] = newRepoName;
			$[52] = t24;
			$[53] = t25;
		} else t25 = $[53];
		let t26;
		if ($[54] !== isConnecting || $[55] !== isCreatingRepo || $[56] !== newRepoName) {
			t26 = isCreatingRepo || isConnecting || !newRepoName.trim();
			$[54] = isConnecting;
			$[55] = isCreatingRepo;
			$[56] = newRepoName;
			$[57] = t26;
		} else t26 = $[57];
		let t27;
		if ($[58] !== handleCreateRepo || $[59] !== isCreatingRepo || $[60] !== t26) {
			t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				size: "sm",
				onClick: handleCreateRepo,
				disabled: t26,
				loading: isCreatingRepo,
				children: "Create Repository"
			});
			$[58] = handleCreateRepo;
			$[59] = isCreatingRepo;
			$[60] = t26;
			$[61] = t27;
		} else t27 = $[61];
		if ($[62] !== t25 || $[63] !== t27) {
			t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					t22,
					t25,
					t27
				]
			});
			$[62] = t25;
			$[63] = t27;
			$[64] = t9;
		} else t9 = $[64];
		if ($[65] === Symbol.for("react.memo_cache_sentinel")) {
			t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-ed-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-ed-muted-foreground",
						children: "or"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-ed-border" })
				]
			});
			$[65] = t10;
		} else t10 = $[65];
		t4 = "flex flex-col gap-2";
		if ($[66] === Symbol.for("react.memo_cache_sentinel")) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-ed-muted-foreground",
				children: "Connect existing repo"
			});
			$[66] = t5;
		} else t5 = $[66];
		const t28 = String(activeInstallationId ?? "");
		let t29;
		if ($[67] !== onAddGitHubAccount || $[68] !== onSelectInstallation) {
			t29 = (v) => {
				if (v === "__add__") onAddGitHubAccount();
				else onSelectInstallation?.(Number(v));
			};
			$[67] = onAddGitHubAccount;
			$[68] = onSelectInstallation;
			$[69] = t29;
		} else t29 = $[69];
		let t30;
		if ($[70] !== activeInstallationId || $[71] !== installations) {
			t30 = installations?.find((i) => i.installationId === activeInstallationId)?.accountLogin ?? "Select account";
			$[70] = activeInstallationId;
			$[71] = installations;
			$[72] = t30;
		} else t30 = $[72];
		let t31;
		if ($[73] !== t30) {
			t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "flex-1 text-[13px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { children: t30 })
			});
			$[73] = t30;
			$[74] = t31;
		} else t31 = $[74];
		let t32;
		if ($[75] !== installations) {
			t32 = installations?.map(_temp3$9);
			$[75] = installations;
			$[76] = t32;
		} else t32 = $[76];
		let t33;
		if ($[77] === Symbol.for("react.memo_cache_sentinel")) {
			t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: "__add__",
				children: "+ Add GitHub Account"
			});
			$[77] = t33;
		} else t33 = $[77];
		let t34;
		if ($[78] !== t32) {
			t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [t32, t33] });
			$[78] = t32;
			$[79] = t34;
		} else t34 = $[79];
		let t35;
		if ($[80] !== isLoadingRepos || $[81] !== t28 || $[82] !== t29 || $[83] !== t31 || $[84] !== t34) {
			t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: t28,
				onValueChange: t29,
				disabled: isLoadingRepos,
				children: [t31, t34]
			});
			$[80] = isLoadingRepos;
			$[81] = t28;
			$[82] = t29;
			$[83] = t31;
			$[84] = t34;
			$[85] = t35;
		} else t35 = $[85];
		let t36;
		if ($[86] === Symbol.for("react.memo_cache_sentinel")) {
			t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
				className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-ed-muted-foreground pointer-events-none",
				width: 14,
				height: 14
			});
			$[86] = t36;
		} else t36 = $[86];
		let t37;
		if ($[87] === Symbol.for("react.memo_cache_sentinel")) {
			t37 = (e_1) => setSearch(e_1.target.value);
			$[87] = t37;
		} else t37 = $[87];
		let t38;
		if ($[88] !== search) {
			t38 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 relative",
				children: [t36, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "w-full h-9 pl-8 pr-3 text-[13px] bg-ed-background border border-ed-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ed-ring",
					placeholder: "Search…",
					value: search,
					onChange: t37
				})]
			});
			$[88] = search;
			$[89] = t38;
		} else t38 = $[89];
		if ($[90] !== t35 || $[91] !== t38) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [t35, t38]
			});
			$[90] = t35;
			$[91] = t38;
			$[92] = t6;
		} else t6 = $[92];
		t7 = isLoadingRepos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
				className: "animate-spin text-ed-muted-foreground",
				width: 16,
				height: 16
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-ed-border rounded-md overflow-hidden",
			children: filteredRepos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 py-4 text-center text-xs text-ed-muted-foreground",
				children: search ? "No repos match your search" : "No repos found"
			}) : filteredRepos.slice(0, 20).map((repo_1) => {
				const repoName = repo_1.fullName.split("/")[1];
				const isThisConnecting = connectingRepo === repo_1.fullName;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center px-3 py-2.5 border-b border-ed-border last:border-b-0 bg-ed-background",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center shrink-0 mr-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubIcon, {
								size: 20,
								className: "text-ed-muted-foreground"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0 flex flex-col gap-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] font-medium text-ed-foreground truncate",
								children: repoName
							}), repo_1.private && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-ed-muted-foreground leading-none",
								children: "private"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 ml-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "xs",
								variant: "outline",
								onClick: () => handleConnectExisting(repo_1),
								disabled: isConnecting,
								loading: isThisConnecting,
								children: "Connect"
							})
						})
					]
				}, repo_1.fullName);
			})
		});
		$[5] = activeInstallationId;
		$[6] = activeOwner;
		$[7] = connectingRepo;
		$[8] = installations;
		$[9] = isConnecting;
		$[10] = isCreatingRepo;
		$[11] = isLoadingRepos;
		$[12] = newRepoName;
		$[13] = onAddGitHubAccount;
		$[14] = onConnectRepo;
		$[15] = onCreateRepo;
		$[16] = onRefresh;
		$[17] = onSelectInstallation;
		$[18] = repos;
		$[19] = search;
		$[20] = T0;
		$[21] = t10;
		$[22] = t11;
		$[23] = t12;
		$[24] = t13;
		$[25] = t4;
		$[26] = t5;
		$[27] = t6;
		$[28] = t7;
		$[29] = t8;
		$[30] = t9;
	} else {
		T0 = $[20];
		t10 = $[21];
		t11 = $[22];
		t12 = $[23];
		t13 = $[24];
		t4 = $[25];
		t5 = $[26];
		t6 = $[27];
		t7 = $[28];
		t8 = $[29];
		t9 = $[30];
	}
	let t14;
	if ($[93] !== t4 || $[94] !== t5 || $[95] !== t6 || $[96] !== t7) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t4,
			children: [
				t5,
				t6,
				t7
			]
		});
		$[93] = t4;
		$[94] = t5;
		$[95] = t6;
		$[96] = t7;
		$[97] = t14;
	} else t14 = $[97];
	let t15;
	if ($[98] !== t10 || $[99] !== t14 || $[100] !== t8 || $[101] !== t9) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t8,
			children: [
				t9,
				t10,
				t14
			]
		});
		$[98] = t10;
		$[99] = t14;
		$[100] = t8;
		$[101] = t9;
		$[102] = t15;
	} else t15 = $[102];
	let t16;
	if ($[103] !== T0 || $[104] !== t11 || $[105] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			className: t11,
			children: t15
		});
		$[103] = T0;
		$[104] = t11;
		$[105] = t15;
		$[106] = t16;
	} else t16 = $[106];
	let t17;
	let t18;
	if ($[107] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowSquareOutIcon, {
			width: 13,
			height: 13
		});
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs",
			children: "Manage Repos"
		});
		$[107] = t17;
		$[108] = t18;
	} else {
		t17 = $[107];
		t18 = $[108];
	}
	let t19;
	if ($[109] !== onManageGitHub) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "flex-1 text-ed-muted-foreground",
			size: "sm",
			variant: "ghost",
			onClick: onManageGitHub,
			isChildText: false,
			children: [t17, t18]
		});
		$[109] = onManageGitHub;
		$[110] = t19;
	} else t19 = $[110];
	let t20;
	if ($[111] !== onDisconnectGitHub) {
		t20 = () => {
			onDisconnectGitHub().then(_temp4$9);
		};
		$[111] = onDisconnectGitHub;
		$[112] = t20;
	} else t20 = $[112];
	let t21;
	if ($[113] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs",
			children: "Disconnect"
		});
		$[113] = t21;
	} else t21 = $[113];
	let t22;
	if ($[114] !== t20) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "flex-1 text-ed-muted-foreground",
			size: "sm",
			variant: "ghost",
			onClick: t20,
			children: t21
		});
		$[114] = t20;
		$[115] = t22;
	} else t22 = $[115];
	let t23;
	if ($[116] !== t19 || $[117] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto p-4 pt-2 flex gap-1",
			children: [t19, t22]
		});
		$[116] = t19;
		$[117] = t22;
		$[118] = t23;
	} else t23 = $[118];
	let t24;
	if ($[119] !== t12 || $[120] !== t13 || $[121] !== t16 || $[122] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t12,
			children: [
				t13,
				t16,
				t23
			]
		});
		$[119] = t12;
		$[120] = t13;
		$[121] = t16;
		$[122] = t23;
		$[123] = t24;
	} else t24 = $[123];
	return t24;
}
function _temp4$9() {
	return toast.success("GitHub disconnected");
}
function _temp3$9(inst) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
		value: String(inst.installationId),
		children: [inst.accountLogin, inst.accountType === "Organization" ? " (org)" : ""]
	}, inst.installationId);
}
function _temp2$13() {}
function _temp$21(r) {
	return r.fullName.split("/")[0];
}
function ConnectedView(t0) {
	const $ = (0, import_compiler_runtime.c)(83);
	const { gitStatus, isLoadingStatus, onCommit, onPull, onDisconnectRepo, onManageGitHub, onRefresh, isCommitting, isPulling, error } = t0;
	const [commitMessage, setCommitMessage] = (0, import_react.useState)("");
	const [showDisconnect, setShowDisconnect] = (0, import_react.useState)(false);
	let t1;
	let t2;
	if ($[0] !== error) {
		t1 = () => {
			if (error) toast.error(error);
		};
		t2 = [error];
		$[0] = error;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[3] !== commitMessage || $[4] !== onCommit) {
		t3 = async () => {
			if (!commitMessage.trim()) return;
			try {
				await onCommit(commitMessage.trim());
				setCommitMessage("");
			} catch {}
		};
		$[3] = commitMessage;
		$[4] = onCommit;
		$[5] = t3;
	} else t3 = $[5];
	const handleCommit = t3;
	let t4;
	if ($[6] !== gitStatus.changes) {
		t4 = gitStatus.changes ?? [];
		$[6] = gitStatus.changes;
		$[7] = t4;
	} else t4 = $[7];
	const changes = t4;
	const isClean = gitStatus.clean ?? changes.length === 0;
	let t5;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitHubIcon, { size: 16 });
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== gitStatus.repo) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[13px] font-medium text-ed-foreground flex-1 truncate",
			children: gitStatus.repo
		});
		$[9] = gitStatus.repo;
		$[10] = t6;
	} else t6 = $[10];
	const t7 = isLoadingStatus ? "animate-spin" : "";
	let t8;
	if ($[11] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowClockwiseIcon, {
			width: 14,
			height: 14,
			className: t7
		});
		$[11] = t7;
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== onRefresh || $[14] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: "Refresh",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Refresh",
				onClick: onRefresh,
				className: "p-0.5 rounded hover:bg-ed-accent text-ed-muted-foreground hover:text-ed-foreground shrink-0",
				children: t8
			})
		});
		$[13] = onRefresh;
		$[14] = t8;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== t6 || $[17] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				t5,
				t6,
				t9
			]
		});
		$[16] = t6;
		$[17] = t9;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranchIcon, {
			className: "text-ed-muted-foreground",
			width: 13,
			height: 13
		});
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== gitStatus.branch) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-ed-muted-foreground",
			children: gitStatus.branch
		});
		$[20] = gitStatus.branch;
		$[21] = t12;
	} else t12 = $[21];
	let t13;
	if ($[22] !== gitStatus.behind || $[23] !== isClean) {
		t13 = gitStatus.behind ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "h-[18px] px-1.5 text-[10px] ml-1 gap-[3px] text-blue-600 bg-blue-50 border-blue-300",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1.5 h-1.5 inline-block rounded-full bg-blue-500" }), "Behind"]
		}) : !isClean ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "h-[18px] px-1.5 text-[10px] ml-1 gap-[3px] text-amber-600 bg-amber-50 border-amber-300",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1.5 h-1.5 inline-block rounded-full bg-amber-500" }), "Uncommitted"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "outline",
			className: "h-[18px] px-1.5 text-[10px] ml-1 gap-[3px] text-green-600 bg-green-50 border-green-300",
			children: "Up to date"
		});
		$[22] = gitStatus.behind;
		$[23] = isClean;
		$[24] = t13;
	} else t13 = $[24];
	let t14;
	if ($[25] !== t12 || $[26] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 mt-1.5",
			children: [
				t11,
				t12,
				t13
			]
		});
		$[25] = t12;
		$[26] = t13;
		$[27] = t14;
	} else t14 = $[27];
	let t15;
	if ($[28] !== t10 || $[29] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-3.5 pb-3",
			children: [t10, t14]
		});
		$[28] = t10;
		$[29] = t14;
		$[30] = t15;
	} else t15 = $[30];
	let t16;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = (e) => setCommitMessage(e.target.value);
		$[31] = t16;
	} else t16 = $[31];
	let t17;
	if ($[32] !== handleCommit) {
		t17 = (e_0) => {
			if (e_0.key === "Enter" && (e_0.metaKey || e_0.ctrlKey)) handleCommit();
		};
		$[32] = handleCommit;
		$[33] = t17;
	} else t17 = $[33];
	let t18;
	if ($[34] !== commitMessage || $[35] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			className: "w-full h-20 px-3 py-2 text-[13px] bg-ed-background border border-ed-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ed-ring placeholder:text-ed-muted-foreground",
			placeholder: "Commit message…",
			value: commitMessage,
			onChange: t16,
			onKeyDown: t17
		});
		$[34] = commitMessage;
		$[35] = t17;
		$[36] = t18;
	} else t18 = $[36];
	let t19;
	if ($[37] !== commitMessage || $[38] !== isClean || $[39] !== isCommitting) {
		t19 = isCommitting || isClean || !commitMessage.trim();
		$[37] = commitMessage;
		$[38] = isClean;
		$[39] = isCommitting;
		$[40] = t19;
	} else t19 = $[40];
	let t20;
	let t21;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUploadIcon, {
			width: 14,
			height: 14
		});
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium",
			children: "Commit & Push"
		});
		$[41] = t20;
		$[42] = t21;
	} else {
		t20 = $[41];
		t21 = $[42];
	}
	let t22;
	if ($[43] !== handleCommit || $[44] !== isCommitting || $[45] !== t19) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "w-full",
			size: "sm",
			onClick: handleCommit,
			disabled: t19,
			loading: isCommitting,
			isChildText: false,
			children: [t20, t21]
		});
		$[43] = handleCommit;
		$[44] = isCommitting;
		$[45] = t19;
		$[46] = t22;
	} else t22 = $[46];
	let t23;
	if ($[47] !== gitStatus.behind || $[48] !== isPulling || $[49] !== onPull) {
		t23 = gitStatus.behind && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "w-full",
			size: "sm",
			variant: "outline",
			onClick: onPull,
			disabled: isPulling,
			loading: isPulling,
			children: "Pull latest"
		});
		$[47] = gitStatus.behind;
		$[48] = isPulling;
		$[49] = onPull;
		$[50] = t23;
	} else t23 = $[50];
	let t24;
	if ($[51] !== t18 || $[52] !== t22 || $[53] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 px-4 pt-4 pb-4",
			children: [
				t18,
				t22,
				t23
			]
		});
		$[51] = t18;
		$[52] = t22;
		$[53] = t23;
		$[54] = t24;
	} else t24 = $[54];
	let t25;
	if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-muted-foreground",
			children: "Changed Files"
		});
		$[55] = t25;
	} else t25 = $[55];
	let t26;
	if ($[56] !== changes.length) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 pb-1",
			children: [t25, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "h-[18px] px-1.5 text-[10px]",
				children: changes.length
			})]
		});
		$[56] = changes.length;
		$[57] = t26;
	} else t26 = $[57];
	let t27;
	if ($[58] !== changes || $[59] !== isLoadingStatus) {
		t27 = isLoadingStatus && changes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
				className: "animate-spin text-ed-muted-foreground",
				width: 16,
				height: 16
			})
		}) : changes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-2 py-6 text-center text-xs text-ed-muted-foreground",
			children: "No changes"
		}) : changes.map(_temp5$8);
		$[58] = changes;
		$[59] = isLoadingStatus;
		$[60] = t27;
	} else t27 = $[60];
	let t28;
	if ($[61] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1",
			viewportClassName: "px-2 py-1",
			children: t27
		});
		$[61] = t27;
		$[62] = t28;
	} else t28 = $[62];
	let t29;
	let t30;
	if ($[63] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowSquareOutIcon, {
			width: 13,
			height: 13
		});
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs",
			children: "Manage"
		});
		$[63] = t29;
		$[64] = t30;
	} else {
		t29 = $[63];
		t30 = $[64];
	}
	let t31;
	if ($[65] !== onManageGitHub) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "flex-1 text-ed-muted-foreground",
			size: "sm",
			variant: "ghost",
			onClick: onManageGitHub,
			isChildText: false,
			children: [t29, t30]
		});
		$[65] = onManageGitHub;
		$[66] = t31;
	} else t31 = $[66];
	let t32;
	if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "flex-1 text-ed-muted-foreground",
			size: "sm",
			variant: "ghost",
			onClick: () => setShowDisconnect(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs",
				children: "Disconnect"
			})
		});
		$[67] = t32;
	} else t32 = $[67];
	let t33;
	if ($[68] !== t31) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto p-4 pt-2 flex gap-2",
			children: [t31, t32]
		});
		$[68] = t31;
		$[69] = t33;
	} else t33 = $[69];
	let t34;
	if ($[70] === Symbol.for("react.memo_cache_sentinel")) {
		t34 = () => setShowDisconnect(false);
		$[70] = t34;
	} else t34 = $[70];
	let t35;
	if ($[71] !== onDisconnectRepo) {
		t35 = () => {
			onDisconnectRepo();
		};
		$[71] = onDisconnectRepo;
		$[72] = t35;
	} else t35 = $[72];
	let t36;
	if ($[73] !== showDisconnect || $[74] !== t35) {
		t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			isOpen: showDisconnect,
			onClose: t34,
			onConfirm: t35,
			title: "Disconnect GitHub",
			description: "This won't delete any files. You can reconnect anytime.",
			confirmText: "Disconnect"
		});
		$[73] = showDisconnect;
		$[74] = t35;
		$[75] = t36;
	} else t36 = $[75];
	let t37;
	if ($[76] !== t15 || $[77] !== t24 || $[78] !== t26 || $[79] !== t28 || $[80] !== t33 || $[81] !== t36) {
		t37 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col h-full",
			children: [
				t15,
				t24,
				t26,
				t28,
				t33,
				t36
			]
		});
		$[76] = t15;
		$[77] = t24;
		$[78] = t26;
		$[79] = t28;
		$[80] = t33;
		$[81] = t36;
		$[82] = t37;
	} else t37 = $[82];
	return t37;
}
function _temp5$8(change) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeRow, { change }, change.path);
}
function ChangeRow(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { change } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /^\.petal\/canvases\/[^/]+\/canvas\.json$/;
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== change.path) {
		t2 = t1.test(change.path);
		$[1] = change.path;
		$[2] = t2;
	} else t2 = $[2];
	const isCanvas = t2;
	let filename;
	let t3;
	if ($[3] !== change.path || $[4] !== isCanvas) {
		const parts = change.path.split("/");
		filename = parts[parts.length - 1];
		t3 = isCanvas ? "Canvas" : parts.length > 1 ? parts.slice(0, -1).join("/") : "/";
		$[3] = change.path;
		$[4] = isCanvas;
		$[5] = filename;
		$[6] = t3;
	} else {
		filename = $[5];
		t3 = $[6];
	}
	const dir = t3;
	const displayName = change.displayName ?? filename;
	const statusChar = change.status === "added" ? "A" : change.status === "deleted" ? "D" : "M";
	const statusColor = change.status === "added" ? "#22c55e" : change.status === "deleted" ? "#ef4444" : "#f59e0b";
	const RowIcon = isCanvas ? n$13 : change.status === "added" ? FilePlusIcon : change.status === "deleted" ? FileMinusIcon : FileIcon;
	let t4;
	if ($[7] !== RowIcon) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowIcon, {
			className: "text-ed-muted-foreground shrink-0",
			width: 14,
			height: 14
		});
		$[7] = RowIcon;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== displayName) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[13px] text-ed-foreground truncate flex-1 min-w-0",
			children: displayName
		});
		$[9] = displayName;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== dir) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-muted-foreground shrink-0 truncate max-w-[120px] text-right",
			children: dir
		});
		$[11] = dir;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== statusColor) {
		t7 = { color: statusColor };
		$[13] = statusColor;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== statusChar || $[16] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-semibold font-mono shrink-0",
			style: t7,
			children: statusChar
		});
		$[15] = statusChar;
		$[16] = t7;
		$[17] = t8;
	} else t8 = $[17];
	let t9;
	if ($[18] !== t4 || $[19] !== t5 || $[20] !== t6 || $[21] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 px-2 py-1.5 rounded-[5px] hover:bg-ed-accent/50 cursor-default",
			children: [
				t4,
				t5,
				t6,
				t8
			]
		});
		$[18] = t4;
		$[19] = t5;
		$[20] = t6;
		$[21] = t8;
		$[22] = t9;
	} else t9 = $[22];
	return t9;
}

export { GitPanel };
