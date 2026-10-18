// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useSkillOverrides.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";

var SKILL_OVERRIDES_KEY = "petal-skill-overrides";
function isOverrideMap(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	for (const entry of Object.values(value)) {
		if (!entry || typeof entry !== "object" || !Array.isArray(entry.files)) return false;
		if (typeof entry.active !== "boolean") return false;
		for (const file of entry.files) if (!file || typeof file !== "object" || typeof file.path !== "string" || typeof file.content !== "string") return false;
	}
	return true;
}
function readSkillOverrides() {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(SKILL_OVERRIDES_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return isOverrideMap(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
function writeSkillOverrides(overrides) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(SKILL_OVERRIDES_KEY, JSON.stringify(overrides));
	} catch {}
}
/** Monotonic gen so out-of-order IPC replies can't wipe a newer override set. */
var skillOverrideSyncGen = 0;
/**
* Push skill overrides into Electron main so list_skills / read_skill see them.
* Inactive or empty overrides are omitted so the AI always gets the built-in skill.
* No-op outside Electron. Call immediately on every localStorage write.
*/
function syncSkillOverridesToMain(enabled, overrides) {
	if (typeof window === "undefined") return;
	const api = window.api;
	if (!api?.invoke) return;
	const gen = ++skillOverrideSyncGen;
	const applicable = {};
	if (enabled) {
		for (const [name, entry] of Object.entries(overrides)) if (entry.active && entry.files?.length) applicable[name] = entry;
	}
	api.invoke("set_skill_overrides", {
		enabled,
		overrides: applicable,
		gen
	}).catch((err) => {
		console.warn("[Skills] set_skill_overrides failed:", err);
	});
}
/** Write localStorage, update react-query cache, and sync to Electron main. */
function commitSkillOverrides(enabled, overrides) {
	writeSkillOverrides(overrides);
	queryClient.setQueryData(["skill-overrides"], { overrides });
	syncSkillOverridesToMain(enabled, overrides);
}
function useSkillOverrides() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["skill-overrides"],
			queryFn: _temp$123,
			staleTime: Infinity
		};
		$[0] = t0;
	} else t0 = $[0];
	return useQuery(t0);
}
async function _temp$123() {
	return { overrides: readSkillOverrides() };
}
function useUpdateSkillOverrides(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const enabled = t0 === void 0 ? true : t0;
	let t1;
	if ($[0] !== enabled) {
		t1 = { mutationFn: async (overrides) => {
			commitSkillOverrides(enabled, overrides);
		} };
		$[0] = enabled;
		$[1] = t1;
	} else t1 = $[1];
	return useMutation(t1);
}

export { syncSkillOverridesToMain, useSkillOverrides, useUpdateSkillOverrides };
