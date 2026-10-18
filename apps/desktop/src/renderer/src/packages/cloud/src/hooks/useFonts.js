// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useFonts.ts
import { useMutation, useQuery, useQueryClient } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl } from "../client.js";
import { import_compiler_runtime } from "./useSession.js";
import { DEFAULT_FONT_PREFERENCES } from "../../../compiler/src/runtime/fontTypes.js";

async function request(path, init) {
	const response = await fetch(`${getApiUrl()}${path}`, {
		...init,
		credentials: "include"
	});
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(body.error ?? `Font request failed (${response.status}).`);
	}
	return response.json();
}
function useFontPreferences() {
	const $ = (0, import_compiler_runtime.c)(8);
	const client = useQueryClient();
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["font-preferences"],
			queryFn: _temp$15,
			staleTime: 3e4,
			retry: false
		};
		$[0] = t0;
	} else t0 = $[0];
	const query = useQuery(t0);
	let t1;
	if ($[1] !== client) {
		t1 = {
			mutationFn: _temp2$10,
			onSuccess: (data) => {
				client.setQueryData(["font-preferences"], data);
			}
		};
		$[1] = client;
		$[2] = t1;
	} else t1 = $[2];
	const update = useMutation(t1);
	const t2 = query.data ?? DEFAULT_FONT_PREFERENCES;
	let t3;
	if ($[3] !== query.data || $[4] !== query.refetch || $[5] !== t2 || $[6] !== update) {
		t3 = {
			data: query.data,
			refetch: query.refetch,
			preferences: t2,
			update
		};
		$[3] = query.data;
		$[4] = query.refetch;
		$[5] = t2;
		$[6] = update;
		$[7] = t3;
	} else t3 = $[7];
	return t3;
}
function _temp2$10(changes) {
	return request("/font-preferences", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(changes)
	});
}
function _temp$15() {
	return request("/font-preferences");
}
function useProjectFonts(projectId) {
	const $ = (0, import_compiler_runtime.c)(30);
	const client = useQueryClient();
	let t0;
	if ($[0] !== projectId) {
		t0 = ["project-fonts", projectId];
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	const key = t0;
	let t1;
	if ($[2] !== projectId) {
		t1 = async () => {
			const data = await request(`/projects/${projectId}/fonts`);
			const apiOrigin = new URL(getApiUrl() || "/", window.location.href);
			return {
				...data,
				faces: data.faces.map((face) => ({
					...face,
					url: new URL(face.url, apiOrigin).href
				}))
			};
		};
		$[2] = projectId;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== key || $[5] !== t1) {
		t2 = {
			queryKey: key,
			queryFn: t1,
			staleTime: 5e3,
			refetchInterval: 6e4
		};
		$[4] = key;
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	const query = useQuery(t2);
	let t3;
	if ($[7] !== projectId) {
		t3 = (changes) => request(`/projects/${projectId}/fonts`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(changes)
		});
		$[7] = projectId;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] !== client || $[10] !== key) {
		t4 = () => client.invalidateQueries({ queryKey: key });
		$[9] = client;
		$[10] = key;
		$[11] = t4;
	} else t4 = $[11];
	let t5;
	if ($[12] !== t3 || $[13] !== t4) {
		t5 = {
			mutationFn: t3,
			onSuccess: t4
		};
		$[12] = t3;
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	const update = useMutation(t5);
	let t6;
	if ($[15] !== projectId) {
		t6 = (family) => request(`/projects/${projectId}/fonts`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ family })
		});
		$[15] = projectId;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== client || $[18] !== key) {
		t7 = () => client.invalidateQueries({ queryKey: key });
		$[17] = client;
		$[18] = key;
		$[19] = t7;
	} else t7 = $[19];
	let t8;
	if ($[20] !== t6 || $[21] !== t7) {
		t8 = {
			mutationFn: t6,
			onSettled: t7
		};
		$[20] = t6;
		$[21] = t7;
		$[22] = t8;
	} else t8 = $[22];
	const remove = useMutation(t8);
	let t9;
	if ($[23] !== query.data || $[24] !== query.isError || $[25] !== query.isPending || $[26] !== query.refetch || $[27] !== remove || $[28] !== update) {
		t9 = {
			data: query.data,
			isPending: query.isPending,
			isError: query.isError,
			refetch: query.refetch,
			update,
			remove
		};
		$[23] = query.data;
		$[24] = query.isError;
		$[25] = query.isPending;
		$[26] = query.refetch;
		$[27] = remove;
		$[28] = update;
		$[29] = t9;
	} else t9 = $[29];
	return t9;
}
var uploadProjectFont = (projectId, bytes) => request(`/projects/${projectId}/fonts`, {
	method: "POST",
	headers: { "Content-Type": "application/octet-stream" },
	body: bytes
});

export { uploadProjectFont, useFontPreferences, useProjectFonts };
