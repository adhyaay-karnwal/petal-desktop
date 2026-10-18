// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useProjectIconSettings.ts
import { import_react, useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { __bundledVitePreload } from "../../../../__bundle__/_vite_preload_helper.js";
import { getApiUrl } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";
import { getIconLibraryDependencyName } from "../../../compiler/src/runtime/settingsParser.js";
import { toast } from "../../../../vendor/sonner.js";

var projectSettingsKey = (projectId) => ["project-settings", projectId];
function isUsableIconExport(name, value) {
	return (typeof value === "function" || typeof value === "object" && value !== null && "$$typeof" in value) && /^[A-Z][a-zA-Z0-9]*$/.test(name) && !/^default$/i.test(name);
}
async function countIconExports(importPath) {
	const mod = await __bundledVitePreload(() => import(
		/* @vite-ignore */
		`https://esm.sh/${importPath}?external=react,react-dom`
), [], import.meta.url);
	return Object.entries(mod).filter(([name, value]) => isUsableIconExport(name, value)).length;
}
function collectExportSubpaths(exportsField) {
	if (!exportsField || typeof exportsField !== "object") return [];
	return Object.keys(exportsField).filter((key) => key.startsWith("./") && key !== "./package.json").map((key) => key.slice(2)).filter((key) => key && !key.includes("*"));
}
async function findIconImportSuggestions(packageName, dependencyName) {
	const encoded = dependencyName.startsWith("@") ? `@${encodeURIComponent(dependencyName.slice(1))}` : encodeURIComponent(dependencyName);
	const res = await fetch(`https://registry.npmjs.org/${encoded}/latest`);
	if (!res.ok) return [];
	const candidates = collectExportSubpaths((await res.json()).exports).map((subpath) => `${dependencyName}/${subpath}`).filter((candidate) => candidate !== packageName).slice(0, 20);
	const suggestions = [];
	for (const candidate of candidates) {
		try {
			if (await countIconExports(candidate) > 0) suggestions.push(candidate);
		} catch {}
		if (suggestions.length >= 5) break;
	}
	return suggestions;
}
function createIconSetupError(message, iconSetup) {
	const err = new Error(message);
	err.iconSetup = iconSetup;
	return err;
}
async function fetchProjectSettings(projectId) {
	const res = await fetch(`${getApiUrl()}/projects/${projectId}/settings`, { credentials: "include" });
	if (!res.ok) throw new Error(await getErrorMessage$1(res, "Failed to load project settings"));
	return res.json();
}
async function getErrorMessage$1(res, fallback) {
	const details = await res.json().catch(() => null);
	const message = typeof details?.error === "string" ? details.error : typeof details?.message === "string" ? details.message : typeof details?.details === "string" ? details.details : null;
	return `${fallback}: ${res.status}${message ? ` ${message}` : ""}`;
}
function getSettingsIconLibraries(settings) {
	return Array.isArray(settings?.iconLibraries) ? settings.iconLibraries.filter((lib) => typeof lib === "string") : [];
}
async function updatePackageJsonDependency({ projectId, projectName, dependencyName, remove }) {
	const apiUrl = getApiUrl();
	let packageFile = null;
	let packageJson = {
		name: projectName || "petal-project",
		private: true,
		dependencies: {}
	};
	const getPackageRes = await fetch(`${apiUrl}/projects/${projectId}/files/by-path?path=${encodeURIComponent("package.json")}`, { credentials: "include" });
	if (getPackageRes.ok) {
		packageFile = await getPackageRes.json();
		try {
			packageJson = JSON.parse(packageFile.content || "{}");
		} catch {
			throw new Error("package.json is not valid JSON.");
		}
	} else if (getPackageRes.status !== 404) throw new Error(await getErrorMessage$1(getPackageRes, "Failed to read package.json"));
	const dependencies = { ...packageJson.dependencies && typeof packageJson.dependencies === "object" ? packageJson.dependencies : {} };
	if (remove) delete dependencies[dependencyName];
	else dependencies[dependencyName] = dependencies[dependencyName] || "latest";
	const nextPackageJson = {
		...packageJson,
		dependencies
	};
	const content = `${JSON.stringify(nextPackageJson, null, 2)}\n`;
	if (packageFile?.id) {
		const patchRes = await fetch(`${apiUrl}/projects/${projectId}/files/${encodeURIComponent(packageFile.id)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ content })
		});
		if (!patchRes.ok) throw new Error(await getErrorMessage$1(patchRes, "Failed to update package.json"));
		return;
	}
	if (!remove) {
		const postRes = await fetch(`${apiUrl}/projects/${projectId}/files`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				path: "package.json",
				extension: "json",
				content
			})
		});
		if (!postRes.ok) throw new Error(await getErrorMessage$1(postRes, "Failed to create package.json"));
	}
}
async function patchIconLibraries(projectId, iconLibraries) {
	const res = await fetch(`${getApiUrl()}/projects/${projectId}/settings/icon-libraries`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ iconLibraries })
	});
	if (!res.ok) throw new Error(await getErrorMessage$1(res, "Failed to update icon packages"));
}
var iconMutationChains = /* @__PURE__ */ new Map();
function runIconMutationExclusive(projectId, fn) {
	const run = (iconMutationChains.get(projectId) ?? Promise.resolve()).then(fn, fn);
	iconMutationChains.set(projectId, run.then(() => {}, () => {}));
	return run;
}
function useProjectIconSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(33);
	const { projectId, projectName, settingsOpen, onCreateIconSetupChatDraft } = t0;
	const [editorSettingsRevision, setEditorSettingsRevision] = (0, import_react.useState)(0);
	const [externalChatDraft, setExternalChatDraft] = (0, import_react.useState)(null);
	let t1;
	if ($[0] !== projectId) {
		t1 = projectSettingsKey(projectId);
		$[0] = projectId;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== projectId) {
		t2 = () => fetchProjectSettings(projectId);
		$[2] = projectId;
		$[3] = t2;
	} else t2 = $[3];
	const t3 = !!projectId;
	let t4;
	if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
		t4 = {
			queryKey: t1,
			queryFn: t2,
			enabled: t3
		};
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
		$[7] = t4;
	} else t4 = $[7];
	const settingsQuery = useQuery(t4);
	const { refetch } = settingsQuery;
	let t5;
	let t6;
	if ($[8] !== refetch || $[9] !== settingsOpen) {
		t5 = () => {
			if (!settingsOpen) return;
			refetch().catch(_temp$118);
		};
		t6 = [settingsOpen, refetch];
		$[8] = refetch;
		$[9] = settingsOpen;
		$[10] = t5;
		$[11] = t6;
	} else {
		t5 = $[10];
		t6 = $[11];
	}
	(0, import_react.useEffect)(t5, t6);
	let t7;
	if ($[12] !== projectId || $[13] !== projectName) {
		t7 = async (packageName) => {
			const dependencyName = getIconLibraryDependencyName(packageName);
			let exportCount;
			try {
				exportCount = await countIconExports(packageName);
			} catch (t8) {
				const err_0 = t8;
				console.error(`[IconSettings] Failed to import ${packageName} from esm.sh:`, err_0);
				throw createIconSetupError(`Could not load ${packageName}. Check that this is a public npm import path.`, {
					attemptedPackage: packageName,
					dependencyName,
					suggestions: [],
					reason: "load_failed"
				});
			}
			if (exportCount === 0) {
				const suggestions = await findIconImportSuggestions(packageName, dependencyName).catch(_temp2$78);
				throw createIconSetupError(`${packageName} loaded, but it does not expose named React icon components.${suggestions.length > 0 ? ` Suggested import paths: ${suggestions.join(", ")}.` : " The package may require a subpath that is not published through its npm exports map."}`, {
					attemptedPackage: packageName,
					dependencyName,
					suggestions,
					reason: "zero_exports"
				});
			}
			return runIconMutationExclusive(projectId, async () => {
				await updatePackageJsonDependency({
					projectId,
					projectName,
					dependencyName
				});
				const currentSettings = await fetchProjectSettings(projectId);
				const nextLibraries = Array.from(/* @__PURE__ */ new Set([...getSettingsIconLibraries(currentSettings), packageName]));
				try {
					await patchIconLibraries(projectId, nextLibraries);
				} catch (t9) {
					const err_1 = t9;
					await updatePackageJsonDependency({
						projectId,
						dependencyName,
						remove: true
					}).catch(_temp3$57);
					throw err_1;
				}
				return {
					packageName,
					savedSettings: await fetchProjectSettings(projectId)
				};
			});
		};
		$[12] = projectId;
		$[13] = projectName;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== projectId) {
		t8 = (t9) => {
			const { packageName: packageName_0, savedSettings: savedSettings_0 } = t9;
			queryClient.setQueryData(projectSettingsKey(projectId), savedSettings_0);
			queryClient.invalidateQueries({ queryKey: projectSettingsKey(projectId) }).catch(_temp4$49);
			setEditorSettingsRevision(_temp5$42);
			toast.success(`Added icon package ${packageName_0}`);
		};
		$[15] = projectId;
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] !== t7 || $[18] !== t8) {
		t9 = {
			mutationFn: t7,
			onSuccess: t8
		};
		$[17] = t7;
		$[18] = t8;
		$[19] = t9;
	} else t9 = $[19];
	const addIconPackageMutation = useMutation(t9);
	let t10;
	if ($[20] !== projectId) {
		t10 = {
			mutationFn: async (packageName_1) => {
				const dependencyName_0 = getIconLibraryDependencyName(packageName_1);
				return runIconMutationExclusive(projectId, async () => {
					const prevLibraries = getSettingsIconLibraries(await fetchProjectSettings(projectId));
					const nextLibraries_0 = prevLibraries.filter((lib) => lib !== packageName_1);
					await patchIconLibraries(projectId, nextLibraries_0.length > 0 ? nextLibraries_0 : null);
					try {
						await updatePackageJsonDependency({
							projectId,
							dependencyName: dependencyName_0,
							remove: true
						});
					} catch (t11) {
						const err_2 = t11;
						await patchIconLibraries(projectId, prevLibraries.length > 0 ? prevLibraries : null).catch(_temp6$35);
						throw err_2;
					}
					return {
						packageName: packageName_1,
						savedSettings: await fetchProjectSettings(projectId)
					};
				});
			},
			onSuccess: (t12) => {
				const { packageName: packageName_2, savedSettings: savedSettings_2 } = t12;
				queryClient.setQueryData(projectSettingsKey(projectId), savedSettings_2);
				queryClient.invalidateQueries({ queryKey: projectSettingsKey(projectId) }).catch(_temp7$28);
				setEditorSettingsRevision(_temp8$22);
				toast.success(`Removed icon package ${packageName_2}`);
			}
		};
		$[20] = projectId;
		$[21] = t10;
	} else t10 = $[21];
	const removeIconPackageMutation = useMutation(t10);
	let t11;
	if ($[22] !== onCreateIconSetupChatDraft) {
		t11 = (context) => {
			const enabledText = context.enabledLibraries.length > 0 ? context.enabledLibraries.map(_temp9$19).join("\n") : "- none";
			const suggestionsText = context.suggestions.length > 0 ? context.suggestions.map(_temp0$17).join("\n") : "- no automatic suggestions found";
			const text = `Help me set up this icon package in the Petal project.

Attempted import path:
${context.attemptedPackage}

Issue:
${context.issue}

Currently enabled icon libraries:
${enabledText}

Suggested import paths from package export probing:
${suggestionsText}

Please inspect the Petal project package.json and icon settings. Use an import path that exports named React icon components. If the package root has no icons, use the correct exported subpath instead of the root package.`;
			onCreateIconSetupChatDraft?.(text);
			if (!onCreateIconSetupChatDraft) return;
			setExternalChatDraft({
				id: Date.now(),
				text
			});
		};
		$[22] = onCreateIconSetupChatDraft;
		$[23] = t11;
	} else t11 = $[23];
	const askAIForIconSetup = t11;
	let t12;
	if ($[24] !== settingsQuery.data) {
		t12 = getSettingsIconLibraries(settingsQuery.data);
		$[24] = settingsQuery.data;
		$[25] = t12;
	} else t12 = $[25];
	let t13;
	if ($[26] !== addIconPackageMutation.mutateAsync || $[27] !== askAIForIconSetup || $[28] !== editorSettingsRevision || $[29] !== externalChatDraft || $[30] !== removeIconPackageMutation.mutateAsync || $[31] !== t12) {
		t13 = {
			iconLibraries: t12,
			editorSettingsRevision,
			externalChatDraft,
			addIconPackage: addIconPackageMutation.mutateAsync,
			removeIconPackage: removeIconPackageMutation.mutateAsync,
			askAIForIconSetup
		};
		$[26] = addIconPackageMutation.mutateAsync;
		$[27] = askAIForIconSetup;
		$[28] = editorSettingsRevision;
		$[29] = externalChatDraft;
		$[30] = removeIconPackageMutation.mutateAsync;
		$[31] = t12;
		$[32] = t13;
	} else t13 = $[32];
	return t13;
}
function _temp0$17(suggestion) {
	return `- ${suggestion}`;
}
function _temp9$19(lib_0) {
	return `- ${lib_0}`;
}
function _temp8$22(v_0) {
	return v_0 + 1;
}
function _temp7$28() {}
function _temp6$35() {}
function _temp5$42(v) {
	return v + 1;
}
function _temp4$49() {}
function _temp3$57() {}
function _temp2$78() {
	return [];
}
function _temp$118(err) {
	console.warn("[Settings] Failed to load icon settings:", err);
}

export { fetchProjectSettings, projectSettingsKey, useProjectIconSettings };
