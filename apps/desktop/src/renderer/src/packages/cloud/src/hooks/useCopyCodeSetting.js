// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useCopyCodeSetting.ts
import { import_react, useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";
import { fetchProjectSettings, projectSettingsKey } from "./useProjectIconSettings.js";

/**
* File settings → Copy code. `editorSettingsRevision` bumps after a save so the
* open editor (which loads its own copy of the settings) picks the change up.
*/
function useCopyCodeSetting(projectId) {
	const $ = (0, import_compiler_runtime.c)(14);
	const [editorSettingsRevision, setEditorSettingsRevision] = (0, import_react.useState)(0);
	let t0;
	if ($[0] !== projectId) {
		t0 = projectSettingsKey(projectId);
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== projectId) {
		t1 = () => fetchProjectSettings(projectId);
		$[2] = projectId;
		$[3] = t1;
	} else t1 = $[3];
	const t2 = !!projectId;
	let t3;
	if ($[4] !== t0 || $[5] !== t1 || $[6] !== t2) {
		t3 = {
			queryKey: t0,
			queryFn: t1,
			enabled: t2
		};
		$[4] = t0;
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
	} else t3 = $[7];
	const settingsQuery = useQuery(t3);
	let t4;
	if ($[8] !== projectId) {
		t4 = {
			mutationFn: async (includeComponents) => {
				if (!(await fetch(`${getApiUrl()}/projects/${projectId}/settings/copy-code`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ includeComponents })
				})).ok) throw new Error("Couldn't save this setting");
			},
			onSuccess: (_, includeComponents_0) => {
				queryClient.setQueryData(projectSettingsKey(projectId), (old) => ({
					...old,
					copyCodeIncludesComponents: includeComponents_0
				}));
				setEditorSettingsRevision(_temp$117);
			}
		};
		$[8] = projectId;
		$[9] = t4;
	} else t4 = $[9];
	const mutation = useMutation(t4);
	const t5 = settingsQuery.data?.copyCodeIncludesComponents === true;
	let t6;
	if ($[10] !== editorSettingsRevision || $[11] !== mutation.mutateAsync || $[12] !== t5) {
		t6 = {
			includesComponents: t5,
			setIncludesComponents: mutation.mutateAsync,
			editorSettingsRevision
		};
		$[10] = editorSettingsRevision;
		$[11] = mutation.mutateAsync;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}
function _temp$117(v) {
	return v + 1;
}

export { useCopyCodeSetting };
