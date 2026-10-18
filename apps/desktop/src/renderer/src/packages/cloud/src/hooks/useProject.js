// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useProject.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApi, getApiUrl, throwApiError } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";
import { invalidateSeatQueries } from "./useBilling.js";

function useProject(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			queryKey: ["project", projectId],
			queryFn: async () => {
				const res = await getApi().projects[":projectId"].$get({ param: { projectId } });
				if (!res.ok) return null;
				return res.json();
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useQuery(t0);
}
/** File+asset bytes vs plan cap. Fetch only while project settings is open. */
function useProjectUsage(projectId, enabled) {
	const $ = (0, import_compiler_runtime.c)(7);
	let t0;
	let t1;
	if ($[0] !== projectId) {
		t0 = ["project-usage", projectId];
		t1 = async () => {
			const res = await getApi().projects[":projectId"].usage.$get({ param: { projectId } });
			if (!res.ok) return null;
			return res.json();
		};
		$[0] = projectId;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	const t2 = enabled && !!projectId;
	let t3;
	if ($[3] !== t0 || $[4] !== t1 || $[5] !== t2) {
		t3 = {
			queryKey: t0,
			queryFn: t1,
			enabled: t2,
			staleTime: 0,
			refetchOnWindowFocus: false
		};
		$[3] = t0;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return useQuery(t3);
}
function invalidateProjectUsage(projectId) {
	queryClient.invalidateQueries({ queryKey: ["project-usage", projectId] });
}
function useCreateShareLink(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (t1) => {
				const access = t1 === void 0 ? "view" : t1;
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}/share-link`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ access })
				})).ok) throw new Error("Failed to create share link");
			},
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/**
* Turn the remix link on or off (LUN-139).
*
* `allowDuplicate` is the whole mechanism: the remix URL carries the project's public
* id, and this flag is what makes that id redeemable. It is deliberately separate from
* `linkAccess`, which holds one exclusive value — folding duplication in there would
* mean giving up view access to allow copies.
*/
function useSetAllowDuplicate(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (allowDuplicate) => {
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ allowDuplicate })
				})).ok) throw new Error("Failed to update duplicate link");
			},
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Link access level and, separately, whether visitors may comment without an account. */
function useUpdateShareLinkAccess(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (input) => {
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}/share-link`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(input)
				})).ok) throw new Error("Failed to update share link access");
			},
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useRevokeShareLink(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async () => {
				await getApi().projects[":projectId"]["share-link"].$delete({ param: { projectId } });
			},
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useProjectShares(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			queryKey: ["project-shares", projectId],
			queryFn: async () => {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/shares`, { credentials: "include" });
				if (!res.ok) return {
					shares: [],
					invites: [],
					owners: []
				};
				return res.json();
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useQuery(t0);
}
function useShareWithEmail(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (t1) => {
				const { email, permission, notify } = t1;
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/shares`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						email,
						permission,
						notify
					})
				});
				const data = await res.json();
				if (!res.ok) throwApiError({
					message: data.error,
					reason: data.reason
				}, "Failed to share project");
				return data;
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] });
				invalidateSeatQueries();
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useRemoveShare(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (targetId) => {
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}/shares/${targetId}`, {
					method: "DELETE",
					credentials: "include"
				})).ok) throw new Error("Failed to remove share");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] });
				invalidateSeatQueries();
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useRemoveInvite(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (inviteId) => {
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}/invites/${inviteId}`, {
					method: "DELETE",
					credentials: "include"
				})).ok) throw new Error("Failed to remove invite");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] });
				invalidateSeatQueries();
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
var ALLOWED_PATHS_PREFIX = "petal.allowedPaths.";
function readAllowedPaths(projectId) {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(`${ALLOWED_PATHS_PREFIX}${projectId}`);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
	} catch {
		return [];
	}
}
function writeAllowedPaths(projectId, paths) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(`${ALLOWED_PATHS_PREFIX}${projectId}`, JSON.stringify(paths));
	} catch {}
}
/** Write an AI allowed path before the editor opens so chat and the terminal see it immediately. */
function addAllowedPathForProject(projectId, path) {
	const existing = readAllowedPaths(projectId);
	const next = existing.includes(path) ? existing : [...existing, path];
	writeAllowedPaths(projectId, next);
	queryClient.setQueryData(["project-allowed-paths", projectId], { allowedPaths: next });
	return next;
}
function useAllowedPaths(projectId) {
	const $ = (0, import_compiler_runtime.c)(8);
	let t0;
	if ($[0] !== projectId) {
		t0 = ["project-allowed-paths", projectId];
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	const t1 = !!projectId;
	let t2;
	if ($[2] !== projectId) {
		t2 = async () => ({ allowedPaths: projectId ? readAllowedPaths(projectId) : [] });
		$[2] = projectId;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t0 || $[5] !== t1 || $[6] !== t2) {
		t3 = {
			queryKey: t0,
			enabled: t1,
			queryFn: t2,
			staleTime: Infinity
		};
		$[4] = t0;
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
	} else t3 = $[7];
	return useQuery(t3);
}
function useUpdateAllowedPaths(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (allowedPaths) => {
				if (!projectId) return;
				writeAllowedPaths(projectId, allowedPaths);
			},
			onSuccess: (_data, allowedPaths_0) => {
				queryClient.setQueryData(["project-allowed-paths", projectId], { allowedPaths: allowedPaths_0 });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}

export { addAllowedPathForProject, invalidateProjectUsage, useAllowedPaths, useCreateShareLink, useProject, useProjectShares, useProjectUsage, useRemoveInvite, useRemoveShare, useRevokeShareLink, useSetAllowDuplicate, useShareWithEmail, useUpdateAllowedPaths, useUpdateShareLinkAccess };
