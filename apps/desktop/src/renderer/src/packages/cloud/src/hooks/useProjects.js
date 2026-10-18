// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useProjects.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApi, getApiUrl, throwApiError } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";

/**
* Each open file in the desktop app is its own renderer with its own query
* cache, separate from the dashboard's, so invalidating locally never reaches
* the dashboard. The channel carries it across (and across browser tabs).
*/
var projectsChannel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("petal:projects");
projectsChannel?.addEventListener("message", (event) => invalidateProjects(event.data));
/**
* `refetch: false` only marks the list stale, so it refetches when a dashboard
* next shows — for saves, which land every second or so while editing.
*/
function invalidateProjects({ refetch, projectId }) {
	queryClient.invalidateQueries({
		queryKey: ["projects"],
		refetchType: refetch ? "active" : "none"
	});
	if (projectId) queryClient.invalidateQueries({ queryKey: ["project", projectId] });
}
/** The project list changed: invalidate it here and in every other open window or tab. */
function announceProjectsChanged(change) {
	invalidateProjects(change);
	projectsChannel?.postMessage(change);
}
/**
* The desktop dashboard stays mounted behind the file tabs, so returning to it
* never remounts the list; call this when it's shown again.
*/
function refetchStaleProjects() {
	queryClient.refetchQueries({
		queryKey: ["projects"],
		stale: true
	});
}
function useProjects(organizationId, t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const trash = t0 === void 0 ? false : t0;
	let t1;
	if ($[0] !== trash) {
		t1 = { trash };
		$[0] = trash;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== organizationId || $[3] !== t1) {
		t2 = [
			"projects",
			organizationId,
			t1
		];
		$[2] = organizationId;
		$[3] = t1;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== organizationId || $[6] !== trash) {
		t3 = async () => {
			const res = await (trash ? getApi().projects.trash : getApi().projects).$get({ query: { organizationId } });
			if (!res.ok) throw new Error("Couldn’t load your files. Try again.");
			return res.json();
		};
		$[5] = organizationId;
		$[6] = trash;
		$[7] = t3;
	} else t3 = $[7];
	const t4 = !!organizationId;
	let t5;
	if ($[8] !== t2 || $[9] !== t3 || $[10] !== t4) {
		t5 = {
			queryKey: t2,
			queryFn: t3,
			enabled: t4
		};
		$[8] = t2;
		$[9] = t3;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	return useQuery(t5);
}
function useCreateProject() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp$126,
			onSuccess: _temp2$81
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp2$81() {
	return queryClient.invalidateQueries({ queryKey: ["projects"] });
}
async function _temp$126(body) {
	const res = await getApi().projects.$post({ json: body });
	if (!res.ok) {
		const data = await res.json();
		throwApiError({
			message: data.error,
			reason: data.reason
		}, "Failed to create project");
	}
	return { project: await res.json() };
}
function useSeedTemplate() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp3$60,
			onSuccess: _temp4$51
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp4$51(_data, projectId_0) {
	queryClient.invalidateQueries({ queryKey: ["projects"] });
	queryClient.invalidateQueries({ queryKey: ["project", projectId_0] });
}
async function _temp3$60(projectId) {
	const res = await fetch(`${getApiUrl()}/projects/${projectId}/seed-template`, {
		method: "POST",
		credentials: "include"
	});
	if (!res.ok) {
		const body = await res.text();
		let message = "Failed to import starter components";
		try {
			const data = JSON.parse(body);
			if (data.error) message = data.error;
		} catch {
			if (body.trim()) message = body.trim();
		}
		throw new Error(message);
	}
	return res.json();
}
function useDeleteProject() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp5$43,
			onSuccess: _temp6$36
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp6$36() {
	return queryClient.invalidateQueries({ queryKey: ["projects"] });
}
async function _temp5$43(projectId) {
	if (!(await getApi().projects[":projectId"].$delete({ param: { projectId } })).ok) throw new Error("Could not move this file to trash. Try again.");
}
function useTrashAction() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp7$29,
			onSuccess: _temp8$23
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp8$23(_data, t0) {
	const { projectId: projectId_0 } = t0;
	queryClient.invalidateQueries({ queryKey: ["projects"] });
	queryClient.removeQueries({ queryKey: ["project", projectId_0] });
}
async function _temp7$29(t0) {
	const { projectId, action } = t0;
	const endpoint = getApi().projects[":projectId"];
	const res = action === "restore" ? await endpoint.restore.$post({ param: { projectId } }) : await endpoint.permanent.$delete({ param: { projectId } });
	if (!res.ok) {
		const data = await res.json();
		throwApiError({
			message: data.error,
			reason: data.reason
		}, "Could not update this file. Try again.");
	}
}
function useUpdateProject() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp9$20,
			onMutate: _temp0$18,
			onError: _temp1$16,
			onSettled: _temp10$16
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp10$16(_data, _error_0, t0) {
	const { projectId: projectId_1 } = t0;
	return announceProjectsChanged({
		refetch: true,
		projectId: projectId_1
	});
}
function _temp1$16(_error, t0, context) {
	const { projectId: projectId_0 } = t0;
	if (context?.previous) queryClient.setQueryData(["project", projectId_0], context.previous);
}
async function _temp0$18(t0) {
	const { projectId, name } = t0;
	await queryClient.cancelQueries({ queryKey: ["project", projectId] });
	const previous = queryClient.getQueryData(["project", projectId]);
	queryClient.setQueryData(["project", projectId], (project) => project && {
		...project,
		name
	});
	return { previous };
}
async function _temp9$20(body) {
	const res = await getApi().projects[":projectId"].$patch({
		param: { projectId: body.projectId },
		json: { name: body.name }
	});
	if (!res.ok) {
		const data = await res.json();
		throw new Error(data.error || "Failed to update project");
	}
	return res.json();
}
function usePendingInvites() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["pending-invites"],
			queryFn: _temp11$13
		};
		$[0] = t0;
	} else t0 = $[0];
	return useQuery(t0);
}
async function _temp11$13() {
	const res = await fetch(`${getApiUrl()}/projects/invites`, { credentials: "include" });
	if (!res.ok) return [];
	return res.json();
}
function useAcceptInvite() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp12$10,
			onSuccess: _temp13$10
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
function _temp13$10() {
	queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
	queryClient.invalidateQueries({ queryKey: ["projects"] });
}
async function _temp12$10(inviteId) {
	const res = await fetch(`${getApiUrl()}/projects/invites/${inviteId}/accept`, {
		method: "POST",
		credentials: "include"
	});
	if (!res.ok) throw new Error("Failed to accept invite");
	return res.json();
}
var FILE_BATCH_SIZE = 50;
var ASSET_BATCH_SIZE = 5;
/** UTF-8 byte length of a string — must match the server's Buffer.byteLength. */
var textEncoder$1 = new TextEncoder();
function byteLength(s) {
	return textEncoder$1.encode(s).length;
}
async function apiFetch(path, body) {
	return fetch(`${getApiUrl()}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body)
	});
}
async function importProjectChunked(body, onProgress) {
	const { files = [], assets = [], canvases = [] } = body;
	const progress = {
		phase: "creating",
		filesUploaded: 0,
		filesTotal: files.length,
		assetsUploaded: 0,
		assetsTotal: assets.length
	};
	onProgress?.(progress);
	const totalBytes = files.reduce((sum, f) => sum + byteLength(f.content), 0) + assets.reduce((sum, a) => sum + (a.size || 0), 0);
	const createRes = await apiFetch("/import", {
		organizationId: body.organizationId,
		name: body.name,
		totalBytes,
		canvases: canvases.length > 0 ? canvases : void 0
	});
	if (!createRes.ok) {
		const data = await createRes.json();
		throwApiError({
			message: data.error,
			reason: data.reason
		}, "Failed to create project");
	}
	const { project } = await createRes.json();
	const projectId = project.id;
	progress.phase = "files";
	onProgress?.(progress);
	for (let i = 0; i < files.length; i += FILE_BATCH_SIZE) {
		const batch = files.slice(i, i + FILE_BATCH_SIZE);
		const res = await apiFetch("/import/files", {
			projectId,
			files: batch
		});
		if (!res.ok) {
			const data = await res.json();
			throwApiError({
				message: data.error,
				reason: data.reason
			}, `Failed to upload files batch ${i}`);
		}
		progress.filesUploaded += batch.length;
		onProgress?.(progress);
	}
	if (assets.length > 0) {
		progress.phase = "assets";
		onProgress?.(progress);
		for (let i = 0; i < assets.length; i += ASSET_BATCH_SIZE) {
			const batch = assets.slice(i, i + ASSET_BATCH_SIZE);
			const res = await apiFetch("/import/assets", {
				projectId,
				assets: batch
			});
			if (!res.ok) {
				const data = await res.json();
				throwApiError({
					message: data.error,
					reason: data.reason
				}, `Failed to upload assets batch ${i}`);
			}
			const result = await res.json();
			progress.assetsUploaded += result.uploaded ?? batch.length;
			onProgress?.(progress);
		}
	}
	progress.phase = "done";
	onProgress?.(progress);
	return {
		project,
		imported: {
			files: progress.filesUploaded,
			pages: canvases.length,
			assets: progress.assetsUploaded
		}
	};
}

export { announceProjectsChanged, importProjectChunked, invalidateProjects, refetchStaleProjects, useAcceptInvite, useCreateProject, useDeleteProject, usePendingInvites, useProjects, useSeedTemplate, useTrashAction, useUpdateProject };
