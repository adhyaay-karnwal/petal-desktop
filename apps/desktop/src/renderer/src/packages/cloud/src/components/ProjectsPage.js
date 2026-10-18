// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ProjectsPage.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getWebUrl } from "../client.js";
import { import_compiler_runtime, useSession } from "../hooks/useSession.js";
import { useAcceptInvite, useCreateProject, useDeleteProject, usePendingInvites, useProjects, useTrashAction, useUpdateProject } from "../hooks/useProjects.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { FileIcon, PlusIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { c$10, n$15, s$4 } from "../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/src/components/DropdownMenu.js";
import { Input } from "../../../ui/src/components/Input.js";
import { Skeleton } from "../../../ui/src/components/Skeleton.js";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/src/components/ToggleGroup.js";
import { toast } from "../../../../vendor/sonner.js";
import { isPlanLimitError$1 } from "../lib/planRecommendations.js";
import { ConfirmDialog } from "../../../editor/src/shell/components/ConfirmDialog.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { openUpgradeAfterDialog, useOpenUpgradeModal } from "./UpgradeModalProvider.js";
import { DashboardWelcomeTour } from "./DashboardWelcomeTour.js";
import { AgentConnectCard } from "./AgentConnectCard.js";
import { ProjectSearchNavProvider } from "./ProjectSearchNavContext.js";

var VIEW_MODE_KEY = "petal:projectViewMode";
/** Sort/display key: content edits, falling back to the project row's own timestamp. */
function editedTime(project) {
	return new Date(project.deletedAt ?? project.editedAt ?? project.updatedAt).getTime();
}
/**
* Live column count of the results grid, so arrow keys move the way the layout
* looks. Returns 1 for the list view, whose container is flex, not grid.
*/
function countGridColumns(container) {
	if (!container) return 1;
	const tracks = getComputedStyle(container).gridTemplateColumns;
	if (!tracks || tracks === "none") return 1;
	return Math.max(1, tracks.split(/\s+/).filter(Boolean).length);
}
function optionId(listboxId, index) {
	return `${listboxId}-option-${index}`;
}
/**
* Combobox option wiring for a result. Empty while not searching so the resting
* dashboard keeps plain card semantics.
*/
function resultOptionProps(listboxId, index, activeIndex, isSearching) {
	if (!isSearching) return { "data-project-index": index };
	return {
		"data-project-index": index,
		id: optionId(listboxId, index),
		role: "option",
		"aria-selected": index === activeIndex
	};
}
function readStoredViewMode() {
	try {
		return localStorage.getItem(VIEW_MODE_KEY) === "list" ? "list" : "grid";
	} catch {
		return "grid";
	}
}
/**
* Projects home layout: a sidebar slot plus the project list.
* Pass `ProjectsSidebar` as `sidebar`.
*/
function ProjectsPage(t0) {
	const $ = (0, import_compiler_runtime.c)(111);
	const { sidebar, organizationId, onSelectProject, onCreateStart, onCreateError, filter, search, agentConnect } = t0;
	const { user } = useSession();
	const [viewMode, setViewMode] = (0, import_react.useState)(readStoredViewMode);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = function handleViewModeChange(next) {
			if (next !== "grid" && next !== "list") return;
			setViewMode(next);
			try {
				localStorage.setItem(VIEW_MODE_KEY, next);
			} catch {}
		};
		$[0] = t1;
	} else t1 = $[0];
	const handleViewModeChange = t1;
	const { data: t2, isLoading, isError, refetch } = useProjects(organizationId, filter === "trash");
	let t3;
	if ($[1] !== t2) {
		t3 = t2 === void 0 ? [] : t2;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	const projects = t3;
	const { data: t4 } = usePendingInvites();
	let t5;
	if ($[3] !== t4) {
		t5 = t4 === void 0 ? [] : t4;
		$[3] = t4;
		$[4] = t5;
	} else t5 = $[4];
	const pendingInvites = t5;
	const acceptInvite = useAcceptInvite();
	const deleteProject = useDeleteProject();
	const createProject = useCreateProject();
	const posthog = usePostHog();
	const upgradeModal = useOpenUpgradeModal();
	let t6;
	if ($[5] !== createProject || $[6] !== onCreateError || $[7] !== onCreateStart || $[8] !== onSelectProject || $[9] !== organizationId || $[10] !== posthog || $[11] !== upgradeModal?.openUpgradeModal) {
		t6 = async function createNewFile(t7) {
			const source = t7 === void 0 ? "blank" : t7;
			if (!organizationId) return;
			onCreateStart?.();
			try {
				const { project } = await createProject.mutateAsync({
					name: "Untitled file",
					organizationId
				});
				posthog.capture("project_created", {
					project_id: project.id,
					source
				});
				onSelectProject(project.id, {
					focusChat: true,
					name: project.name
				});
			} catch (t8) {
				const err = t8;
				onCreateError?.();
				if (isPlanLimitError$1(err)) {
					openUpgradeAfterDialog(upgradeModal?.openUpgradeModal, {
						reason: err.reason,
						message: err.message
					});
					return;
				}
				toast.error(err instanceof Error ? err.message : "Failed to create file");
			}
		};
		$[5] = createProject;
		$[6] = onCreateError;
		$[7] = onCreateStart;
		$[8] = onSelectProject;
		$[9] = organizationId;
		$[10] = posthog;
		$[11] = upgradeModal?.openUpgradeModal;
		$[12] = t6;
	} else t6 = $[12];
	const createNewFile = t6;
	let t7;
	if ($[13] !== projects) {
		t7 = [...projects].sort(_temp$9);
		$[13] = projects;
		$[14] = t7;
	} else t7 = $[14];
	const sorted = t7;
	let query;
	let t8;
	if ($[15] !== search || $[16] !== sorted) {
		query = search.trim().toLowerCase();
		t8 = query ? sorted.filter((p) => p.name.toLowerCase().includes(query)) : sorted;
		$[15] = search;
		$[16] = sorted;
		$[17] = query;
		$[18] = t8;
	} else {
		query = $[17];
		t8 = $[18];
	}
	const visible = t8;
	let t9;
	if ($[19] !== visible) {
		t9 = visible.filter(_temp2$5);
		$[19] = visible;
		$[20] = t9;
	} else t9 = $[20];
	const orgProjects = t9;
	let t10;
	if ($[21] !== visible) {
		t10 = visible.filter(_temp3$3);
		$[21] = visible;
		$[22] = t10;
	} else t10 = $[22];
	const sharedProjects = t10;
	const isSearching = query.length > 0;
	const results = filter === "shared" ? sharedProjects : orgProjects;
	const listboxId = (0, import_react.useId)();
	const resultsRef = (0, import_react.useRef)(null);
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	const navKey = `${filter}:${query}`;
	const [lastNavKey, setLastNavKey] = (0, import_react.useState)(navKey);
	if (navKey !== lastNavKey) {
		setLastNavKey(navKey);
		setActiveIndex(0);
	}
	const activeIndexInRange = isSearching && results.length > 0 ? Math.min(activeIndex, results.length - 1) : -1;
	let t11;
	if ($[23] !== activeIndexInRange || $[24] !== filter || $[25] !== onSelectProject || $[26] !== results) {
		t11 = function handleSearchKeyDown(e) {
			if (activeIndexInRange < 0) return;
			if (e.key === "Enter" && filter !== "trash") {
				e.preventDefault();
				onSelectProject(results[activeIndexInRange].id, { name: results[activeIndexInRange].name });
				return;
			}
			const columns = countGridColumns(resultsRef.current);
			const vertical = e.key === "ArrowDown" || e.key === "ArrowUp";
			const horizontal = columns > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft");
			if (!vertical && !horizontal) return;
			e.preventDefault();
			const last = results.length - 1;
			const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
			const target = activeIndexInRange + (vertical ? columns : 1) * (forward ? 1 : -1);
			let next_0 = activeIndexInRange;
			if (target >= 0 && target <= last) next_0 = target;
			else if (horizontal) next_0 = Math.max(0, Math.min(last, target));
			else if (forward && Math.floor(last / columns) > Math.floor(activeIndexInRange / columns)) next_0 = last;
			setActiveIndex(next_0);
		};
		$[23] = activeIndexInRange;
		$[24] = filter;
		$[25] = onSelectProject;
		$[26] = results;
		$[27] = t11;
	} else t11 = $[27];
	const handleSearchKeyDown = t11;
	let t12;
	if ($[28] !== activeIndexInRange || $[29] !== listboxId) {
		t12 = activeIndexInRange >= 0 ? optionId(listboxId, activeIndexInRange) : null;
		$[28] = activeIndexInRange;
		$[29] = listboxId;
		$[30] = t12;
	} else t12 = $[30];
	let t13;
	if ($[31] !== handleSearchKeyDown || $[32] !== isSearching || $[33] !== listboxId || $[34] !== t12) {
		t13 = {
			onKeyDown: handleSearchKeyDown,
			activeOptionId: t12,
			listboxId,
			isActive: isSearching
		};
		$[31] = handleSearchKeyDown;
		$[32] = isSearching;
		$[33] = listboxId;
		$[34] = t12;
		$[35] = t13;
	} else t13 = $[35];
	const searchNav = t13;
	let t14;
	if ($[36] !== searchNav || $[37] !== sidebar) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-r-solid border-r border-ed-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSearchNavProvider, {
				value: searchNav,
				children: sidebar
			})
		});
		$[36] = searchNav;
		$[37] = sidebar;
		$[38] = t14;
	} else t14 = $[38];
	const t15 = filter === "trash" ? "Trash" : filter === "shared" ? "Shared with me" : "Files";
	let t16;
	if ($[39] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "h1",
				size: "sm",
				weight: "medium",
				variant: "primary",
				children: t15
			})
		});
		$[39] = t15;
		$[40] = t16;
	} else t16 = $[40];
	let t17;
	if ($[41] !== agentConnect?.mcpServer || $[42] !== createNewFile || $[43] !== createProject.isPending || $[44] !== organizationId || $[45] !== user) {
		t17 = user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardWelcomeTour, {
			userId: user.id,
			mcpServer: agentConnect?.mcpServer,
			onCreateFile: () => void createNewFile("welcome-tour"),
			creating: createProject.isPending,
			canCreate: !!organizationId
		}, user.id);
		$[41] = agentConnect?.mcpServer;
		$[42] = createNewFile;
		$[43] = createProject.isPending;
		$[44] = organizationId;
		$[45] = user;
		$[46] = t17;
	} else t17 = $[46];
	let t18;
	if ($[47] !== createNewFile || $[48] !== createProject.isPending || $[49] !== filter || $[50] !== organizationId) {
		t18 = filter === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "default",
			size: "xs",
			className: "h-6.5 has-[>svg]:pl-2! has-[>svg]:pr-3! hover:bg-ed-primary",
			LeftIcon: PlusIcon,
			onClick: () => void createNewFile(),
			disabled: !organizationId || createProject.isPending,
			loading: createProject.isPending,
			children: "New file"
		});
		$[47] = createNewFile;
		$[48] = createProject.isPending;
		$[49] = filter;
		$[50] = organizationId;
		$[51] = t18;
	} else t18 = $[51];
	let t19;
	if ($[52] !== filter || $[53] !== isSearching || $[54] !== orgProjects || $[55] !== sharedProjects || $[56] !== viewMode) {
		t19 = ((filter === "shared" ? sharedProjects : orgProjects).length > 0 || isSearching) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToggleGroup, {
			type: "single",
			size: "sm",
			value: viewMode,
			onValueChange: handleViewModeChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupItem, {
				value: "grid",
				"aria-label": "Grid view",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$4, { size: 16 })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupItem, {
				value: "list",
				"aria-label": "List view",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$10, { size: 16 })
			})]
		});
		$[52] = filter;
		$[53] = isSearching;
		$[54] = orgProjects;
		$[55] = sharedProjects;
		$[56] = viewMode;
		$[57] = t19;
	} else t19 = $[57];
	let t20;
	if ($[58] !== t17 || $[59] !== t18 || $[60] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				t17,
				t18,
				t19
			]
		});
		$[58] = t17;
		$[59] = t18;
		$[60] = t19;
		$[61] = t20;
	} else t20 = $[61];
	let t21;
	if ($[62] !== t16 || $[63] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-12.5 shrink-0 items-center justify-between border-b border-ed-divider px-4 md:px-12",
			children: [t16, t20]
		});
		$[62] = t16;
		$[63] = t20;
		$[64] = t21;
	} else t21 = $[64];
	let t22;
	if ($[65] !== agentConnect || $[66] !== createNewFile || $[67] !== filter || $[68] !== isSearching || $[69] !== user) {
		t22 = filter === "all" && !isSearching && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentConnectCard, {
			userId: user.id,
			...agentConnect,
			onNewFile: agentConnect ? () => void createNewFile("agent-card") : void 0
		}, user.id);
		$[65] = agentConnect;
		$[66] = createNewFile;
		$[67] = filter;
		$[68] = isSearching;
		$[69] = user;
		$[70] = t22;
	} else t22 = $[70];
	let t23;
	if ($[71] !== acceptInvite || $[72] !== filter || $[73] !== pendingInvites || $[74] !== posthog) {
		t23 = filter === "shared" && pendingInvites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				weight: "medium",
				variant: "tertiary",
				children: "Pending invites"
			}), pendingInvites.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 rounded-xl border border-ed-border bg-ed-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "2xs",
						weight: "medium",
						variant: "primary",
						className: "truncate",
						children: invite.projectName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
						size: "2xs",
						variant: "tertiary",
						children: [
							"From ",
							invite.inviterName,
							" · ",
							invite.permission === "editor" ? "Can edit" : invite.permission === "commenter" ? "Can comment" : "Can view"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => {
						acceptInvite.mutate(invite.token, { onSuccess: (data) => posthog.capture("invite_accepted", {
							project_id: data.projectId,
							project_name: invite.projectName,
							source: "dashboard"
						}) });
					},
					disabled: acceptInvite.isPending,
					loading: acceptInvite.isPending,
					children: "Join project"
				})]
			}, invite.id))]
		});
		$[71] = acceptInvite;
		$[72] = filter;
		$[73] = pendingInvites;
		$[74] = posthog;
		$[75] = t23;
	} else t23 = $[75];
	let t24;
	if ($[76] !== refetch) {
		t24 = () => void refetch();
		$[76] = refetch;
		$[77] = t24;
	} else t24 = $[77];
	let t25;
	if ($[78] !== deleteProject || $[79] !== posthog) {
		t25 = (project_0) => {
			deleteProject.mutate(project_0.id, {
				onSuccess: () => {
					posthog.capture("project_trashed", { project_id: project_0.id });
					toast.success("File moved to trash");
				},
				onError: _temp4$3
			});
		};
		$[78] = deleteProject;
		$[79] = posthog;
		$[80] = t25;
	} else t25 = $[80];
	const t26 = pendingInvites.length > 0;
	let t27;
	if ($[81] !== createNewFile) {
		t27 = () => void createNewFile();
		$[81] = createNewFile;
		$[82] = t27;
	} else t27 = $[82];
	let t28;
	if ($[83] !== createProject.isPending || $[84] !== filter || $[85] !== search || $[86] !== t26 || $[87] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectEmptyState, {
			filter,
			search,
			hasInvites: t26,
			onNewProject: t27,
			isCreating: createProject.isPending
		});
		$[83] = createProject.isPending;
		$[84] = filter;
		$[85] = search;
		$[86] = t26;
		$[87] = t27;
		$[88] = t28;
	} else t28 = $[88];
	let t29;
	if ($[89] !== activeIndexInRange || $[90] !== isError || $[91] !== isLoading || $[92] !== isSearching || $[93] !== listboxId || $[94] !== onSelectProject || $[95] !== results || $[96] !== t24 || $[97] !== t25 || $[98] !== t28 || $[99] !== viewMode) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectListing, {
			projects: results,
			containerRef: resultsRef,
			activeIndex: activeIndexInRange,
			listboxId,
			isSearching,
			isLoading,
			isError,
			onRetry: t24,
			viewMode,
			onSelectProject,
			onDeleteProject: t25,
			empty: t28
		});
		$[89] = activeIndexInRange;
		$[90] = isError;
		$[91] = isLoading;
		$[92] = isSearching;
		$[93] = listboxId;
		$[94] = onSelectProject;
		$[95] = results;
		$[96] = t24;
		$[97] = t25;
		$[98] = t28;
		$[99] = viewMode;
		$[100] = t29;
	} else t29 = $[100];
	let t30;
	if ($[101] !== t22 || $[102] !== t23 || $[103] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col gap-4 px-4 md:px-12 pt-8 pb-12 overflow-y-auto",
			children: [
				t22,
				t23,
				t29
			]
		});
		$[101] = t22;
		$[102] = t23;
		$[103] = t29;
		$[104] = t30;
	} else t30 = $[104];
	let t31;
	if ($[105] !== t21 || $[106] !== t30) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 flex flex-col overflow-hidden h-full",
				children: [t21, t30]
			})
		});
		$[105] = t21;
		$[106] = t30;
		$[107] = t31;
	} else t31 = $[107];
	let t32;
	if ($[108] !== t14 || $[109] !== t31) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-screen h-screen bg-ed-background",
			children: [t14, t31]
		});
		$[108] = t14;
		$[109] = t31;
		$[110] = t32;
	} else t32 = $[110];
	return t32;
}
function _temp4$3(err_0) {
	return toast.error(err_0.message);
}
function _temp3$3(p_1) {
	return p_1.shared;
}
function _temp2$5(p_0) {
	return !p_0.shared;
}
function _temp$9(a, b) {
	return editedTime(b) - editedTime(a);
}
function ProjectEmptyState(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { filter, search, hasInvites, onNewProject, isCreating } = t0;
	if (search.trim()) {
		let t1;
		if ($[0] !== search) {
			t1 = search.trim();
			$[0] = search;
			$[1] = t1;
		} else t1 = $[1];
		let t2;
		if ($[2] !== t1) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoResultsState, { query: t1 });
			$[2] = t1;
			$[3] = t2;
		} else t2 = $[3];
		return t2;
	}
	if (filter === "shared") {
		let t1;
		if ($[4] !== hasInvites) {
			t1 = hasInvites ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NothingSharedState, {});
			$[4] = hasInvites;
			$[5] = t1;
		} else t1 = $[5];
		return t1;
	}
	if (filter === "trash") {
		let t1;
		if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center h-64 text-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "2xs",
					variant: "primary",
					children: "Trash is empty"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "2xs",
					variant: "tertiary",
					children: "Files you move to trash will appear here."
				})]
			});
			$[6] = t1;
		} else t1 = $[6];
		return t1;
	}
	let t1;
	if ($[7] !== isCreating || $[8] !== onNewProject) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			onNewProject,
			isCreating
		});
		$[7] = isCreating;
		$[8] = onNewProject;
		$[9] = t1;
	} else t1 = $[9];
	return t1;
}
function ProjectListing(t0) {
	const $ = (0, import_compiler_runtime.c)(25);
	const { projects, containerRef, activeIndex, listboxId, isSearching, isLoading, isError, onRetry, viewMode, onSelectProject, onDeleteProject, empty } = t0;
	let t1;
	let t2;
	if ($[0] !== activeIndex || $[1] !== containerRef) {
		t1 = () => {
			if (activeIndex < 0) return;
			containerRef.current?.querySelector(`[data-project-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
		};
		t2 = [activeIndex, containerRef];
		$[0] = activeIndex;
		$[1] = containerRef;
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[4] !== isSearching || $[5] !== listboxId) {
		t3 = isSearching ? {
			id: listboxId,
			role: "listbox",
			"aria-label": "File search results"
		} : {};
		$[4] = isSearching;
		$[5] = listboxId;
		$[6] = t3;
	} else t3 = $[6];
	const listboxProps = t3;
	if (isError) {
		let t4;
		let t5;
		if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				weight: "medium",
				variant: "primary",
				children: "Couldn't load your files"
			});
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				variant: "tertiary",
				children: "Check your connection and try again."
			});
			$[7] = t4;
			$[8] = t5;
		} else {
			t4 = $[7];
			t5 = $[8];
		}
		let t6;
		if ($[9] !== onRetry) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center gap-3 py-16",
				role: "alert",
				children: [
					t4,
					t5,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: onRetry,
						children: "Try again"
					})
				]
			});
			$[9] = onRetry;
			$[10] = t6;
		} else t6 = $[10];
		return t6;
	}
	if (isLoading) {
		let t4;
		if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				role: "status",
				"aria-label": "Loading files",
				children: Array.from({ length: 8 }).map(_temp5$2)
			});
			$[11] = t4;
		} else t4 = $[11];
		return t4;
	}
	let t4;
	if ($[12] !== activeIndex || $[13] !== containerRef || $[14] !== empty || $[15] !== isSearching || $[16] !== listboxId || $[17] !== listboxProps || $[18] !== onDeleteProject || $[19] !== onSelectProject || $[20] !== projects || $[21] !== viewMode) {
		t4 = projects.length === 0 ? empty : viewMode === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			...listboxProps,
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5 content-start",
			children: projects.map((project, i_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, {
				project,
				optionProps: resultOptionProps(listboxId, i_0, activeIndex, isSearching),
				isActive: i_0 === activeIndex,
				onClick: () => {
					if (!project.deletedAt) onSelectProject(project.id, { name: project.name });
				},
				onDelete: () => onDeleteProject(project)
			}, project.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			...listboxProps,
			className: "flex shrink-0 flex-col rounded-2xl border border-ed-border bg-ed-card overflow-hidden",
			children: projects.map((project_0, i_1) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectRow, {
				project: project_0,
				optionProps: resultOptionProps(listboxId, i_1, activeIndex, isSearching),
				isActive: i_1 === activeIndex,
				onClick: () => {
					if (!project_0.deletedAt) onSelectProject(project_0.id, { name: project_0.name });
				},
				onDelete: () => onDeleteProject(project_0)
			}, project_0.id))
		});
		$[12] = activeIndex;
		$[13] = containerRef;
		$[14] = empty;
		$[15] = isSearching;
		$[16] = listboxId;
		$[17] = listboxProps;
		$[18] = onDeleteProject;
		$[19] = onSelectProject;
		$[20] = projects;
		$[21] = viewMode;
		$[22] = t4;
	} else t4 = $[22];
	let t5;
	if ($[23] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t4 });
		$[23] = t4;
		$[24] = t5;
	} else t5 = $[24];
	return t5;
}
/** Shared rename / copy-link / delete menu for both card and row layouts. */
function _temp5$2(_, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[16/10] w-full rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" })
		]
	}, i);
}
function ProjectMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(44);
	const { project, onDelete, className } = t0;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [showRenameProject, setShowRenameProject] = (0, import_react.useState)(false);
	const [showDeleteProject, setShowDeleteProject] = (0, import_react.useState)(false);
	const trashAction = useTrashAction();
	const posthog = usePostHog();
	const upgradeModal = useOpenUpgradeModal();
	let t1;
	if ($[0] !== posthog || $[1] !== project.id || $[2] !== project.name || $[3] !== trashAction || $[4] !== upgradeModal?.openUpgradeModal) {
		t1 = function handleTrashAction(action) {
			trashAction.mutate({
				projectId: project.id,
				action
			}, {
				onSuccess: () => {
					posthog.capture(action === "restore" ? "project_restored" : "project_deleted", {
						project_id: project.id,
						project_name: project.name
					});
					toast.success(action === "restore" ? "File restored" : "File permanently deleted");
				},
				onError: (err) => {
					if (isPlanLimitError$1(err)) openUpgradeAfterDialog(upgradeModal?.openUpgradeModal, {
						reason: err.reason,
						message: err.message
					});
					else toast.error(err.message);
				}
			});
		};
		$[0] = posthog;
		$[1] = project.id;
		$[2] = project.name;
		$[3] = trashAction;
		$[4] = upgradeModal?.openUpgradeModal;
		$[5] = t1;
	} else t1 = $[5];
	const handleTrashAction = t1;
	const hasShareLink = "linkToken" in project && project.linkToken && ("linkAccess" in project ? project.linkAccess !== "none" : true);
	let t2;
	if ($[6] !== project) {
		t2 = () => {
			if ("linkToken" in project && project.linkToken) {
				const url = `${getWebUrl()}/share/${project.linkToken}`;
				navigator.clipboard.writeText(url);
				setCopied(true);
				setTimeout(() => setCopied(false), 2e3);
			}
		};
		$[6] = project;
		$[7] = t2;
	} else t2 = $[7];
	const handleCopyLink = t2;
	const t3 = `Options for ${project.name}`;
	let t4;
	if ($[8] !== className) {
		t4 = cn$2("p-1 rounded-md text-ed-muted-foreground hover:text-ed-foreground hover:bg-ed-muted", className);
		$[8] = className;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$15, {
			size: 16,
			weight: "bold"
		});
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t3 || $[12] !== t4) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": t3,
				className: t4,
				children: t5
			})
		});
		$[11] = t3;
		$[12] = t4;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== copied || $[15] !== handleCopyLink || $[16] !== handleTrashAction || $[17] !== hasShareLink || $[18] !== onDelete || $[19] !== project.canManage || $[20] !== project.deletedAt || $[21] !== project.shared || $[22] !== trashAction.isPending) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "end",
			children: project.deletedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				disabled: trashAction.isPending,
				onClick: () => handleTrashAction("restore"),
				children: "Restore"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				disabled: trashAction.isPending,
				onClick: () => setShowDeleteProject(true),
				className: "text-ed-destructive focus:text-ed-destructive",
				children: "Permanently delete"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: () => setShowRenameProject(true),
					children: "Edit name"
				}),
				hasShareLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: handleCopyLink,
					children: copied ? "Copied!" : "Copy link"
				}),
				project.canManage !== false && !project.shared && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: onDelete,
					className: "text-ed-destructive focus:text-ed-destructive",
					children: "Move to trash"
				})
			] })
		});
		$[14] = copied;
		$[15] = handleCopyLink;
		$[16] = handleTrashAction;
		$[17] = hasShareLink;
		$[18] = onDelete;
		$[19] = project.canManage;
		$[20] = project.deletedAt;
		$[21] = project.shared;
		$[22] = trashAction.isPending;
		$[23] = t7;
	} else t7 = $[23];
	let t8;
	if ($[24] !== t6 || $[25] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t6, t7] });
		$[24] = t6;
		$[25] = t7;
		$[26] = t8;
	} else t8 = $[26];
	let t9;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => setShowRenameProject(false);
		$[27] = t9;
	} else t9 = $[27];
	let t10;
	if ($[28] !== project || $[29] !== showRenameProject) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenameProjectModal, {
			project,
			isOpen: showRenameProject,
			onClose: t9
		});
		$[28] = project;
		$[29] = showRenameProject;
		$[30] = t10;
	} else t10 = $[30];
	let t11;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = () => setShowDeleteProject(false);
		$[31] = t11;
	} else t11 = $[31];
	let t12;
	if ($[32] !== handleTrashAction) {
		t12 = () => handleTrashAction("permanent");
		$[32] = handleTrashAction;
		$[33] = t12;
	} else t12 = $[33];
	const t13 = `You're about to permanently delete “${project.name}” and everything in it. You won't be able to restore it.`;
	let t14;
	if ($[34] !== project.name || $[35] !== showDeleteProject || $[36] !== t12 || $[37] !== t13 || $[38] !== trashAction.isPending) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			isOpen: showDeleteProject,
			onClose: t11,
			onConfirm: t12,
			title: "Permanently delete file",
			description: t13,
			typeToConfirm: project.name,
			typeToConfirmLabel: "Type the file name to confirm",
			confirmText: "Permanently delete",
			isLoading: trashAction.isPending,
			destructive: true
		});
		$[34] = project.name;
		$[35] = showDeleteProject;
		$[36] = t12;
		$[37] = t13;
		$[38] = trashAction.isPending;
		$[39] = t14;
	} else t14 = $[39];
	let t15;
	if ($[40] !== t10 || $[41] !== t14 || $[42] !== t8) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t8,
			t10,
			t14
		] });
		$[40] = t10;
		$[41] = t14;
		$[42] = t8;
		$[43] = t15;
	} else t15 = $[43];
	return t15;
}
function RenameProjectModal(t0) {
	const $ = (0, import_compiler_runtime.c)(49);
	const { project, isOpen, onClose } = t0;
	const [name, setName] = (0, import_react.useState)(project.name);
	const [failed, setFailed] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== isOpen || $[1] !== project.name) {
		t1 = {
			isOpen,
			name: project.name
		};
		$[0] = isOpen;
		$[1] = project.name;
		$[2] = t1;
	} else t1 = $[2];
	const [resetKey, setResetKey] = (0, import_react.useState)(t1);
	if (isOpen !== resetKey.isOpen || project.name !== resetKey.name) {
		setResetKey({
			isOpen,
			name: project.name
		});
		if (isOpen) {
			setName(project.name);
			setFailed(false);
		}
	}
	const updateProject = useUpdateProject();
	let t2;
	if ($[3] !== name) {
		t2 = name.trim();
		$[3] = name;
		$[4] = t2;
	} else t2 = $[4];
	const trimmed = t2;
	const canSave = trimmed.length > 0 && trimmed !== project.name && !updateProject.isPending;
	let t3;
	if ($[5] !== onClose || $[6] !== project.name || $[7] !== updateProject.isPending) {
		t3 = function handleClose() {
			if (updateProject.isPending) return;
			setName(project.name);
			setFailed(false);
			onClose();
		};
		$[5] = onClose;
		$[6] = project.name;
		$[7] = updateProject.isPending;
		$[8] = t3;
	} else t3 = $[8];
	const handleClose = t3;
	let t4;
	if ($[9] !== canSave || $[10] !== onClose || $[11] !== project.id || $[12] !== trimmed || $[13] !== updateProject) {
		t4 = function handleSubmit() {
			if (!canSave) return;
			setFailed(false);
			updateProject.mutate({
				projectId: project.id,
				name: trimmed
			}, {
				onSuccess: () => {
					setFailed(false);
					onClose();
				},
				onError: () => setFailed(true)
			});
		};
		$[9] = canSave;
		$[10] = onClose;
		$[11] = project.id;
		$[12] = trimmed;
		$[13] = updateProject;
		$[14] = t4;
	} else t4 = $[14];
	const handleSubmit = t4;
	let t5;
	if ($[15] !== handleClose) {
		t5 = (open) => {
			if (!open) handleClose();
		};
		$[15] = handleClose;
		$[16] = t5;
	} else t5 = $[16];
	let t6;
	if ($[17] !== handleSubmit) {
		t6 = (e) => {
			e.preventDefault();
			handleSubmit();
		};
		$[17] = handleSubmit;
		$[18] = t6;
	} else t6 = $[18];
	let t7;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit file name" }) });
		$[19] = t7;
	} else t7 = $[19];
	let t8;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "rename-file-name",
			className: "text-[11px] leading-4 font-medium text-ed-foreground",
			children: "File name"
		});
		$[20] = t8;
	} else t8 = $[20];
	let t9;
	if ($[21] !== failed) {
		t9 = (e_0) => {
			setName(e_0.target.value);
			if (failed) setFailed(false);
		};
		$[21] = failed;
		$[22] = t9;
	} else t9 = $[22];
	let t10;
	if ($[23] !== name || $[24] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: "rename-file-name",
			size: "xs",
			autoFocus: true,
			value: name,
			onChange: t9,
			placeholder: "Untitled file",
			"aria-label": "File name",
			maxLength: 200
		});
		$[23] = name;
		$[24] = t9;
		$[25] = t10;
	} else t10 = $[25];
	let t11;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: "Shown in the file picker and the editor header."
		});
		$[26] = t11;
	} else t11 = $[26];
	let t12;
	if ($[27] !== failed) {
		t12 = failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "danger",
			children: "Couldn't rename the project. Try again."
		});
		$[27] = failed;
		$[28] = t12;
	} else t12 = $[28];
	let t13;
	if ($[29] !== t10 || $[30] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "gap-2",
			children: [
				t8,
				t10,
				t11,
				t12
			]
		});
		$[29] = t10;
		$[30] = t12;
		$[31] = t13;
	} else t13 = $[31];
	let t14;
	if ($[32] !== handleClose || $[33] !== updateProject.isPending) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "xs",
			onClick: handleClose,
			disabled: updateProject.isPending,
			children: "Cancel"
		});
		$[32] = handleClose;
		$[33] = updateProject.isPending;
		$[34] = t14;
	} else t14 = $[34];
	const t15 = !canSave;
	let t16;
	if ($[35] !== t15 || $[36] !== updateProject.isPending) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			variant: "outline",
			size: "xs",
			disabled: t15,
			loading: updateProject.isPending,
			children: "Save"
		});
		$[35] = t15;
		$[36] = updateProject.isPending;
		$[37] = t16;
	} else t16 = $[37];
	let t17;
	if ($[38] !== t14 || $[39] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t14, t16] });
		$[38] = t14;
		$[39] = t16;
		$[40] = t17;
	} else t17 = $[40];
	let t18;
	if ($[41] !== t13 || $[42] !== t17 || $[43] !== t6) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			"aria-describedby": void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: t6,
				children: [
					t7,
					t13,
					t17
				]
			})
		});
		$[41] = t13;
		$[42] = t17;
		$[43] = t6;
		$[44] = t18;
	} else t18 = $[44];
	let t19;
	if ($[45] !== isOpen || $[46] !== t18 || $[47] !== t5) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: isOpen,
			onOpenChange: t5,
			children: t18
		});
		$[45] = isOpen;
		$[46] = t18;
		$[47] = t5;
		$[48] = t19;
	} else t19 = $[48];
	return t19;
}
/** Preview image, falling back to the placeholder until one has been captured. */
function ProjectPreview(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { project, className } = t0;
	const [failedUrl, setFailedUrl] = (0, import_react.useState)(null);
	const url = project.previewUrl;
	if (!url || url === failedUrl) {
		let t1;
		if ($[0] !== className) {
			t1 = cn$2("bg-ed-muted flex items-center justify-center", className);
			$[0] = className;
			$[1] = t1;
		} else t1 = $[1];
		let t2;
		if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {
				fill: "currentColor",
				className: "h-3/5 max-h-20 w-auto text-ed-accent"
			});
			$[2] = t2;
		} else t2 = $[2];
		let t3;
		if ($[3] !== t1) {
			t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: t1,
				children: t2
			});
			$[3] = t1;
			$[4] = t3;
		} else t3 = $[4];
		return t3;
	}
	let t1;
	if ($[5] !== url) {
		t1 = () => setFailedUrl(url);
		$[5] = url;
		$[6] = t1;
	} else t1 = $[6];
	let t2;
	if ($[7] !== className) {
		t2 = cn$2("bg-ed-muted object-cover object-top", className);
		$[7] = className;
		$[8] = t2;
	} else t2 = $[8];
	let t3;
	if ($[9] !== t1 || $[10] !== t2 || $[11] !== url) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: "",
			loading: "lazy",
			onError: t1,
			className: t2
		});
		$[9] = t1;
		$[10] = t2;
		$[11] = url;
		$[12] = t3;
	} else t3 = $[12];
	return t3;
}
function ProjectCard(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	const { project, optionProps, isActive, onClick, onDelete } = t0;
	const t1 = isActive && "border-ed-primary/50 ring-[5px] ring-ed-primary/10";
	let t2;
	if ($[0] !== t1) {
		t2 = cn$2("group relative flex flex-col rounded-2xl border border-ed-border bg-ed-card overflow-hidden", t1);
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	const t3 = !!project.deletedAt;
	let t4;
	if ($[2] !== project) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectPreview, {
			project,
			className: "aspect-[16/10] w-full"
		});
		$[2] = project;
		$[3] = t4;
	} else t4 = $[3];
	let t5;
	if ($[4] !== onClick || $[5] !== t3 || $[6] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			disabled: t3,
			onClick,
			className: "text-left",
			children: t4
		});
		$[4] = onClick;
		$[5] = t3;
		$[6] = t4;
		$[7] = t5;
	} else t5 = $[7];
	const t6 = !!project.deletedAt;
	let t7;
	if ($[8] !== project.name) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			className: "max-w-full truncate",
			children: project.name
		});
		$[8] = project.name;
		$[9] = t7;
	} else t7 = $[9];
	const t8 = project.deletedAt ? "Trashed" : "Edited";
	let t9;
	if ($[10] !== project) {
		t9 = formatEditedDate(editedTime(project));
		$[10] = project;
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== t8 || $[13] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			size: "3xs",
			variant: "tertiary",
			children: [
				t8,
				" ",
				t9
			]
		});
		$[12] = t8;
		$[13] = t9;
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	if ($[15] !== onClick || $[16] !== t10 || $[17] !== t6 || $[18] !== t7) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			disabled: t6,
			onClick,
			className: "flex flex-col gap-0.5 flex-1 min-w-0 text-left",
			children: [t7, t10]
		});
		$[15] = onClick;
		$[16] = t10;
		$[17] = t6;
		$[18] = t7;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== onDelete || $[21] !== project) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectMenu, {
			project,
			onDelete,
			className: "ml-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-[state=open]:opacity-100"
		});
		$[20] = onDelete;
		$[21] = project;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== t11 || $[24] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between border-t border-ed-border px-5 py-4",
			children: [t11, t12]
		});
		$[23] = t11;
		$[24] = t12;
		$[25] = t13;
	} else t13 = $[25];
	let t14;
	if ($[26] !== optionProps || $[27] !== t13 || $[28] !== t2 || $[29] !== t5) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...optionProps,
			className: t2,
			children: [t5, t13]
		});
		$[26] = optionProps;
		$[27] = t13;
		$[28] = t2;
		$[29] = t5;
		$[30] = t14;
	} else t14 = $[30];
	return t14;
}
function ProjectRow(t0) {
	const $ = (0, import_compiler_runtime.c)(27);
	const { project, optionProps, isActive, onClick, onDelete } = t0;
	const t1 = isActive && "bg-ed-muted/60";
	let t2;
	if ($[0] !== t1) {
		t2 = cn$2("group flex items-center gap-4 px-4 py-3 border-b border-ed-border last:border-b-0 hover:bg-ed-muted/40", t1);
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	const t3 = !!project.deletedAt;
	let t4;
	if ($[2] !== project) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectPreview, {
			project,
			className: "w-20 h-12.5 sm:w-32 sm:h-20 rounded-md border border-ed-border shrink-0"
		});
		$[2] = project;
		$[3] = t4;
	} else t4 = $[3];
	let t5;
	if ($[4] !== project.name) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			className: "w-full min-w-0 truncate text-left",
			children: project.name
		});
		$[4] = project.name;
		$[5] = t5;
	} else t5 = $[5];
	const t6 = project.deletedAt ? "Trashed" : "Edited";
	let t7;
	if ($[6] !== project) {
		t7 = formatEditedDate(editedTime(project));
		$[6] = project;
		$[7] = t7;
	} else t7 = $[7];
	let t8;
	if ($[8] !== t6 || $[9] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			size: "3xs",
			variant: "tertiary",
			className: "text-left",
			children: [
				t6,
				" ",
				t7
			]
		});
		$[8] = t6;
		$[9] = t7;
		$[10] = t8;
	} else t8 = $[10];
	let t9;
	if ($[11] !== t5 || $[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col items-start gap-1 text-left",
			children: [t5, t8]
		});
		$[11] = t5;
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== onClick || $[15] !== t3 || $[16] !== t4 || $[17] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			disabled: t3,
			onClick,
			className: "flex items-center gap-4 flex-1 min-w-0 text-left",
			children: [t4, t9]
		});
		$[14] = onClick;
		$[15] = t3;
		$[16] = t4;
		$[17] = t9;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] !== onDelete || $[20] !== project) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectMenu, {
			project,
			onDelete,
			className: "shrink-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-[state=open]:opacity-100"
		});
		$[19] = onDelete;
		$[20] = project;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== optionProps || $[23] !== t10 || $[24] !== t11 || $[25] !== t2) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...optionProps,
			className: t2,
			children: [t10, t11]
		});
		$[22] = optionProps;
		$[23] = t10;
		$[24] = t11;
		$[25] = t2;
		$[26] = t12;
	} else t12 = $[26];
	return t12;
}
function NoResultsState(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { query } = t0;
	let t1;
	if ($[0] !== query) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			size: "2xs",
			variant: "tertiary",
			children: [
				"No files match “",
				query,
				"”"
			]
		});
		$[0] = query;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			variant: "tertiary",
			children: "Try a different search."
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center h-64 text-center gap-1",
			children: [t1, t2]
		});
		$[3] = t1;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function NothingSharedState() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center h-64 text-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				variant: "tertiary",
				children: "Nothing shared with you yet"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				variant: "tertiary",
				children: "When someone shares a file with you, it will appear here."
			})]
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function EmptyState(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { onNewProject, isCreating } = t0;
	let t1;
	let t2;
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-14 bg-ed-muted rounded-md mb-3" });
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			variant: "tertiary",
			children: "No files yet"
		});
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			variant: "tertiary",
			className: "mb-3",
			children: "Create a file to get started"
		});
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else {
		t1 = $[0];
		t2 = $[1];
		t3 = $[2];
	}
	let t4;
	if ($[3] !== isCreating || $[4] !== onNewProject) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center h-64 text-center gap-1",
			children: [
				t1,
				t2,
				t3,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "default",
						size: "xs",
						className: "h-6.5 has-[>svg]:pl-2! has-[>svg]:pr-3! hover:bg-ed-primary",
						LeftIcon: PlusIcon,
						onClick: onNewProject,
						disabled: isCreating,
						loading: isCreating,
						children: "New file"
					})
				})
			]
		});
		$[3] = isCreating;
		$[4] = onNewProject;
		$[5] = t4;
	} else t4 = $[5];
	return t4;
}
var editedDateFormat = new Intl.DateTimeFormat(void 0, {
	month: "long",
	day: "numeric",
	year: "numeric"
});
function formatEditedDate(editedAt) {
	const date = new Date(editedAt);
	return Number.isNaN(date.getTime()) ? "unknown" : editedDateFormat.format(date);
}

export { ProjectsPage };
