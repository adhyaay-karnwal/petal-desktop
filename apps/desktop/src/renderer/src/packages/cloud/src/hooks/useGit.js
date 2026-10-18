// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useGit.ts
import { import_react, useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl, throwApiError } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";

/** GitHub's account picker: the user chooses a personal account or an organization to install or configure. */
function githubAccountPickerUrl(appSlug) {
	if (appSlug) return `https://github.com/apps/${appSlug}/installations/select_target`;
	return "https://github.com/settings/installations";
}
async function gitFetch(path, options) {
	const res = await fetch(`${getApiUrl()}${path}`, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers
		}
	});
	const contentType = res.headers.get("content-type") ?? "";
	const rawBody = await res.text();
	let data = null;
	if (rawBody && contentType.includes("application/json")) try {
		data = JSON.parse(rawBody);
	} catch {
		data = null;
	}
	if (!res.ok) {
		const bodyPreview = rawBody.replace(/\s+/g, " ").trim().slice(0, 240);
		const baseMessage = data?.message || data?.error || (bodyPreview ? `Request failed: ${res.status} ${res.statusText}: ${bodyPreview}` : `Request failed: ${res.status} ${res.statusText}`);
		const details = data?.details;
		const context = [
			details?.upstreamStatus ? `GitHub ${details.upstreamStatus}` : null,
			details?.endpoint,
			details?.requestId ? `request ${details.requestId}` : null
		].filter(Boolean).join(" | ");
		const message = context ? `${baseMessage} (${context})` : baseMessage;
		if (typeof data?.reason === "string") throwApiError({
			message,
			reason: data.reason
		}, message);
		throw new Error(message);
	}
	if (!data) throw new Error("API returned an empty or non-JSON response");
	return data;
}
/** Check if the user has GitHub App connected (has installations). */
function useGitHubStatus() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["github-status"],
			queryFn: _temp$114,
			staleTime: 6e4
		};
		$[0] = t0;
	} else t0 = $[0];
	return useQuery(t0);
}
/** List repos available to a GitHub App installation. */
function _temp$114() {
	return gitFetch("/github/status");
}
function useInstallationRepos(installationId, t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const enabled = t0 === void 0 ? false : t0;
	let t1;
	let t2;
	if ($[0] !== installationId) {
		t1 = ["installation-repos", installationId];
		t2 = () => gitFetch(`/github/installations/${installationId}/repos`).then(_temp2$75);
		$[0] = installationId;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	const t3 = enabled && !!installationId;
	let t4;
	if ($[3] !== t1 || $[4] !== t2 || $[5] !== t3) {
		t4 = {
			queryKey: t1,
			queryFn: t2,
			enabled: t3,
			staleTime: 3e4
		};
		$[3] = t1;
		$[4] = t2;
		$[5] = t3;
		$[6] = t4;
	} else t4 = $[6];
	return useQuery(t4);
}
function _temp2$75(d) {
	return d.repos;
}
/** A repo's branches + file list — powers the import folder browser and scope. */
function useRepoTree(installationId, repo, ref) {
	const $ = (0, import_compiler_runtime.c)(12);
	const t0 = ref ?? null;
	let t1;
	if ($[0] !== installationId || $[1] !== repo || $[2] !== t0) {
		t1 = [
			"repo-tree",
			installationId,
			repo,
			t0
		];
		$[0] = installationId;
		$[1] = repo;
		$[2] = t0;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== installationId || $[5] !== ref || $[6] !== repo) {
		t2 = () => {
			const params = new URLSearchParams({
				installationId: String(installationId),
				repo
			});
			if (ref) params.set("ref", ref);
			return gitFetch(`/projects/git/repo-tree?${params.toString()}`);
		};
		$[4] = installationId;
		$[5] = ref;
		$[6] = repo;
		$[7] = t2;
	} else t2 = $[7];
	const t3 = !!installationId && !!repo;
	let t4;
	if ($[8] !== t1 || $[9] !== t2 || $[10] !== t3) {
		t4 = {
			queryKey: t1,
			queryFn: t2,
			enabled: t3,
			staleTime: 6e4
		};
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
	} else t4 = $[11];
	return useQuery(t4);
}
/** Create a new GitHub repository (uses user's GitHub App token). */
/** Disconnect the GitHub App from the account: every installation is forgotten. */
function useDisconnectGitHub() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp3$55,
			onSuccess: _temp4$47
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp4$47() {
	queryClient.invalidateQueries({ queryKey: ["github-status"] });
	queryClient.invalidateQueries({ queryKey: ["installation-repos"] });
}
function _temp3$55() {
	return gitFetch("/github/disconnect", { method: "DELETE" });
}
function useCreateGitHubRepo() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp5$40,
			onSuccess: _temp6$33
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
/** Get git status for a project (connection info + changes). */
function _temp6$33() {
	queryClient.invalidateQueries({ queryKey: ["installation-repos"] });
}
function _temp5$40(body) {
	return gitFetch("/projects/git/create-repo", {
		method: "POST",
		body: JSON.stringify(body)
	});
}
function useGitStatus(projectId) {
	const $ = (0, import_compiler_runtime.c)(7);
	let t0;
	let t1;
	if ($[0] !== projectId) {
		t0 = ["git-status", projectId];
		t1 = () => gitFetch(`/projects/${projectId}/git/status`);
		$[0] = projectId;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	const t2 = !!projectId;
	let t3;
	if ($[3] !== t0 || $[4] !== t1 || $[5] !== t2) {
		t3 = {
			queryKey: t0,
			queryFn: t1,
			enabled: t2,
			staleTime: 15e3,
			refetchOnWindowFocus: false
		};
		$[3] = t0;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return useQuery(t3);
}
/** Connect a GitHub repo to a project (via installation). */
function useConnectRepo(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: (body) => gitFetch(`/projects/${projectId}/git/connect`, {
				method: "POST",
				body: JSON.stringify(body)
			}),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["git-status", projectId] });
				queryClient.invalidateQueries({ queryKey: ["project", projectId] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Disconnect GitHub repo from a project. */
function useDisconnectRepo(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: () => gitFetch(`/projects/${projectId}/git/connect`, { method: "DELETE" }),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["git-status", projectId] });
				queryClient.invalidateQueries({ queryKey: ["project", projectId] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Commit DB state to GitHub. */
function useGitCommit(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: (body) => gitFetch(`/projects/${projectId}/git/commit`, {
				method: "POST",
				body: JSON.stringify(body)
			}),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["git-status", projectId] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Pull latest from GitHub into DB. */
function useGitPull(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: () => gitFetch(`/projects/${projectId}/git/pull`, { method: "POST" }),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["git-status", projectId] });
				queryClient.invalidateQueries({ queryKey: ["components", projectId] });
				queryClient.invalidateQueries({ queryKey: ["project", projectId] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Import a project from GitHub (creates new project). */
function useImportFromGitHub() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp7$26,
			onSuccess: _temp8$20
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
/** Download a GitHub folder for AI design-system import (staged to disk on desktop). */
function _temp8$20() {
	queryClient.invalidateQueries({ queryKey: ["projects"] });
}
function _temp7$26(body) {
	return gitFetch("/projects/import-from-github", {
		method: "POST",
		body: JSON.stringify(body)
	});
}
async function fetchGitHubFolder(body) {
	return gitFetch("/projects/git/fetch-folder", {
		method: "POST",
		body: JSON.stringify(body)
	});
}
/**
* Sets up all git hooks for a project and returns props ready to spread
* into `<GitPanel>`. The caller only needs to provide `onInstallGitHubApp`
* (platform-specific) and conditionally render based on `canEdit`.
*/
function useGitIntegration(projectId) {
	const $ = (0, import_compiler_runtime.c)(41);
	const { data: githubStatus } = useGitHubStatus();
	const { data: gitStatus, isLoading: isLoadingGitStatus, refetch: refetchStatus } = useGitStatus(projectId);
	const [selectedInstallationId, setSelectedInstallationId] = (0, import_react.useState)(null);
	const activeInstallation = selectedInstallationId ?? githubStatus?.installations?.[0]?.installationId ?? null;
	const { data: repos, isLoading: isLoadingRepos } = useInstallationRepos(activeInstallation, !!githubStatus?.connected && !gitStatus?.connected);
	const createGitHubRepo = useCreateGitHubRepo();
	const connectRepo = useConnectRepo(projectId);
	const disconnectRepo = useDisconnectRepo(projectId);
	const gitCommit = useGitCommit(projectId);
	const gitPull = useGitPull(projectId);
	const [gitError, setGitError] = (0, import_react.useState)(null);
	const t0 = gitStatus ?? null;
	const t1 = githubStatus?.connected;
	const t2 = githubStatus?.installations;
	let t3;
	if ($[0] !== activeInstallation || $[1] !== connectRepo || $[2] !== githubStatus?.installations) {
		t3 = async (repo, branch) => {
			if (!activeInstallation) throw new Error("No installation selected");
			const accountLogin = githubStatus?.installations?.find((i) => i.installationId === activeInstallation)?.accountLogin ?? "";
			setGitError(null);
			try {
				await connectRepo.mutateAsync({
					repo,
					branch,
					installationId: activeInstallation,
					accountLogin
				});
			} catch (t4) {
				const err = t4;
				setGitError(err.message);
				throw err;
			}
		};
		$[0] = activeInstallation;
		$[1] = connectRepo;
		$[2] = githubStatus?.installations;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== disconnectRepo) {
		t4 = async () => {
			setGitError(null);
			try {
				await disconnectRepo.mutateAsync();
			} catch (t5) {
				const err_0 = t5;
				setGitError(err_0.message);
				throw err_0;
			}
		};
		$[4] = disconnectRepo;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== gitCommit) {
		t5 = async (message) => {
			setGitError(null);
			try {
				await gitCommit.mutateAsync({ message });
			} catch (t6) {
				const err_1 = t6;
				setGitError(err_1.message);
				throw err_1;
			}
		};
		$[6] = gitCommit;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== gitPull) {
		t6 = async () => {
			setGitError(null);
			try {
				await gitPull.mutateAsync();
			} catch (t7) {
				const err_2 = t7;
				setGitError(err_2.message);
				throw err_2;
			}
		};
		$[8] = gitPull;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== createGitHubRepo) {
		t7 = async (name) => {
			setGitError(null);
			try {
				return await createGitHubRepo.mutateAsync({ name });
			} catch (t8) {
				const err_3 = t8;
				setGitError(err_3.message);
				throw err_3;
			}
		};
		$[10] = createGitHubRepo;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = async () => {
			setGitError(null);
			try {
				await gitFetch("/github/disconnect", { method: "DELETE" });
				queryClient.invalidateQueries({ queryKey: ["github-status"] });
			} catch (t9) {
				const err_4 = t9;
				setGitError(err_4.message);
				throw err_4;
			}
		};
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== githubStatus?.appSlug) {
		t9 = () => {
			window.open(githubAccountPickerUrl(githubStatus?.appSlug), "_blank");
		};
		$[13] = githubStatus?.appSlug;
		$[14] = t9;
	} else t9 = $[14];
	let t10;
	if ($[15] !== refetchStatus) {
		t10 = () => {
			refetchStatus();
			queryClient.invalidateQueries({ queryKey: ["github-status"] });
			queryClient.invalidateQueries({ queryKey: ["installation-repos"] });
		};
		$[15] = refetchStatus;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== activeInstallation || $[18] !== connectRepo.isPending || $[19] !== createGitHubRepo.isPending || $[20] !== gitCommit.isPending || $[21] !== gitError || $[22] !== gitPull.isPending || $[23] !== isLoadingGitStatus || $[24] !== isLoadingRepos || $[25] !== repos || $[26] !== t0 || $[27] !== t1 || $[28] !== t10 || $[29] !== t2 || $[30] !== t3 || $[31] !== t4 || $[32] !== t5 || $[33] !== t6 || $[34] !== t7 || $[35] !== t9) {
		t11 = {
			gitStatus: t0,
			isLoadingStatus: isLoadingGitStatus,
			githubConnected: t1,
			installations: t2,
			activeInstallationId: activeInstallation,
			onSelectInstallation: setSelectedInstallationId,
			repos,
			isLoadingRepos,
			onConnectRepo: t3,
			onDisconnectRepo: t4,
			onCommit: t5,
			onPull: t6,
			onCreateRepo: t7,
			onDisconnectGitHub: t8,
			onManageGitHub: t9,
			onRefresh: t10,
			isCommitting: gitCommit.isPending,
			isPulling: gitPull.isPending,
			isCreatingRepo: createGitHubRepo.isPending,
			isConnecting: connectRepo.isPending,
			error: gitError
		};
		$[17] = activeInstallation;
		$[18] = connectRepo.isPending;
		$[19] = createGitHubRepo.isPending;
		$[20] = gitCommit.isPending;
		$[21] = gitError;
		$[22] = gitPull.isPending;
		$[23] = isLoadingGitStatus;
		$[24] = isLoadingRepos;
		$[25] = repos;
		$[26] = t0;
		$[27] = t1;
		$[28] = t10;
		$[29] = t2;
		$[30] = t3;
		$[31] = t4;
		$[32] = t5;
		$[33] = t6;
		$[34] = t7;
		$[35] = t9;
		$[36] = t11;
	} else t11 = $[36];
	const gitPanelProps = t11;
	let t12;
	if ($[37] !== gitPanelProps || $[38] !== gitStatus || $[39] !== githubStatus) {
		t12 = {
			gitPanelProps,
			gitStatus,
			githubStatus
		};
		$[37] = gitPanelProps;
		$[38] = gitStatus;
		$[39] = githubStatus;
		$[40] = t12;
	} else t12 = $[40];
	return t12;
}

export { fetchGitHubFolder, githubAccountPickerUrl, useDisconnectGitHub, useGitHubStatus, useGitIntegration, useImportFromGitHub, useInstallationRepos, useRepoTree };
