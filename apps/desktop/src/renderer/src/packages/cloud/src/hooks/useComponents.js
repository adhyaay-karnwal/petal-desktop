// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useComponents.ts
import { import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "./useSession.js";
import { componentLoader } from "../services/ComponentLoader.js";
import { ProjectUnavailableError, projectBuilderClient } from "../services/ProjectBuilderClient.js";

/**
* useComponents - Web version (project-builder)
*
* Build artifacts (modules, component index, CSS) stream over project SSE.
* Component props arrive via components:ready when distMeta already has a
* scanned props cache. When no cache exists, props scan starts on first
* component selection via POST /components/scan; props then stream via
* components:updated until components:scan_complete / components:scan_failed.
* A cached POST /scan response clears scanLoading without an SSE event.
*
* After a file save, the API syncs to project-builder and the server pushes
* modules:updated / components:updated — the client applies those events here.
*/
/**
* A registry that finished loading.
*
* `projectPath` is carried through from the previous state so the render-time
* project check does not mistake a fresh registry for a project switch.
*/
function readyState(projectPath, components, componentIndex, scanLoading) {
	return {
		projectPath,
		initialized: true,
		loading: false,
		scanLoading,
		error: null,
		components,
		componentIndex
	};
}
/**
* Drop runtime bindings the authoritative index no longer lists. Returns the
* same object when nothing is stale so the common case keeps its identity.
*/
function pickKnownComponents(components, componentIndex) {
	const known = new Set(Object.keys(componentIndex));
	const keys = Object.keys(components);
	if (keys.every((key) => known.has(key))) return components;
	const kept = {};
	for (const key of keys) if (known.has(key)) kept[key] = components[key];
	return kept;
}
function sourcePathsFromPatch(patch) {
	return [...new Set(Object.values(patch).map((entry) => entry.path).filter((path) => /\.(tsx?|jsx?)$/.test(path)))];
}
/** Latest modules:updated payload per path, held until first paint finishes. */
function mergePendingModuleUpdates(pending, modules) {
	for (const mod of modules) if (mod?.path) pending.set(mod.path, mod);
}
function takePendingModuleUpdates(pending) {
	const list = [...pending.values()];
	pending.clear();
	return list;
}
/**
* Decide whether a registry publish should remount canvas component instances.
* Identity-stable reloads (kept previous module after a failed compile) must
* not bump `registryRevision`.
*/
function componentBindingsChanged(previous, incoming) {
	for (const [key, next] of Object.entries(incoming)) if (next && previous[key] !== next) return true;
	return false;
}
function nextRegistryRevision(prevRevision, previousBindings, incomingBindings, bumpRevision) {
	if (bumpRevision === false) return prevRevision;
	if (!componentBindingsChanged(previousBindings, incomingBindings)) return prevRevision;
	return prevRevision + 1;
}
/** True when both maps hold the same keys bound to the same values. */
function sameEntries(previous, next) {
	const keys = Object.keys(next);
	return keys.length === Object.keys(previous).length && keys.every((key) => key in previous && previous[key] === next[key]);
}
/**
* Fold a loader result into the registry. SSE replays and reconnects resend
* what is already applied; returning `prev` then keeps `components` and
* `componentIndex` identities, which the canvas re-renders on.
*/
function mergeRegistryUpdate(prev, components, componentIndex, scanLoading, options) {
	let mergedComponents = prev.components;
	for (const [key, comp] of Object.entries(components)) {
		if (!comp || mergedComponents[key] === comp) continue;
		if (mergedComponents === prev.components) mergedComponents = { ...prev.components };
		mergedComponents[key] = comp;
	}
	const nextIndex = options?.replace ? sameEntries(prev.componentIndex, componentIndex) ? prev.componentIndex : componentIndex : Object.entries(componentIndex).every(([key, meta]) => prev.componentIndex[key] === meta) ? prev.componentIndex : {
		...prev.componentIndex,
		...componentIndex
	};
	const nextComponents = options?.replace ? pickKnownComponents(mergedComponents, nextIndex) : mergedComponents;
	const nextRevision = nextRegistryRevision(prev.registryRevision, prev.components, components, options?.bumpRevision);
	const nextScanLoading = scanLoading ?? prev.scanLoading;
	if (prev.initialized && !prev.loading && prev.error === null && nextComponents === prev.components && nextIndex === prev.componentIndex && nextScanLoading === prev.scanLoading && nextRevision === prev.registryRevision) return prev;
	return {
		...readyState(prev.projectPath, nextComponents, nextIndex, nextScanLoading),
		registryRevision: nextRevision
	};
}
function loadErrorMessage(err) {
	return err instanceof ProjectUnavailableError ? err.message : String(err);
}
function useComponents(projectPath, t0) {
	const $ = (0, import_compiler_runtime.c)(28);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const options = t1;
	let t2;
	if ($[2] !== projectPath) {
		t2 = () => ({
			projectPath,
			initialized: false,
			loading: projectPath !== null,
			scanLoading: false,
			error: null,
			components: {},
			componentIndex: {},
			registryRevision: 0
		});
		$[2] = projectPath;
		$[3] = t2;
	} else t2 = $[3];
	const [state, setState] = (0, import_react.useState)(t2);
	if (state.projectPath !== projectPath) setState((prev) => ({
		...prev,
		projectPath,
		loading: projectPath !== null,
		error: null,
		initialized: false,
		components: {},
		componentIndex: {}
	}));
	const projectPathRef = (0, import_react.useRef)(projectPath);
	const pendingScanComponentRef = (0, import_react.useRef)(null);
	const registryRef = (0, import_react.useRef)(state);
	const onSourceFilesUpdatedRef = (0, import_react.useRef)(options.onSourceFilesUpdated);
	let t3;
	if ($[4] !== options.onSourceFilesUpdated || $[5] !== projectPath || $[6] !== state) {
		t3 = () => {
			projectPathRef.current = projectPath;
			registryRef.current = state;
			onSourceFilesUpdatedRef.current = options.onSourceFilesUpdated;
		};
		$[4] = options.onSourceFilesUpdated;
		$[5] = projectPath;
		$[6] = state;
		$[7] = t3;
	} else t3 = $[7];
	(0, import_react.useLayoutEffect)(t3);
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (paths) => {
			if (paths.length === 0) return;
			onSourceFilesUpdatedRef.current?.(paths);
		};
		$[8] = t4;
	} else t4 = $[8];
	const notifySourceFilesUpdated = t4;
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (componentKey, t6) => {
			const timeoutMs = t6 === void 0 ? 15e3 : t6;
			return new Promise((resolve, reject) => {
				const start = Date.now();
				const check = () => {
					const { components, componentIndex } = registryRef.current;
					if (components[componentKey] && componentIndex[componentKey]) {
						resolve();
						return;
					}
					if (Date.now() - start > timeoutMs) {
						reject(/* @__PURE__ */ new Error(`Timed out waiting for component "${componentKey}"`));
						return;
					}
					requestAnimationFrame(check);
				};
				check();
			});
		};
		$[9] = t5;
	} else t5 = $[9];
	const waitForComponent = t5;
	let t6;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (components_0, componentIndex_0, scanLoading, options_0) => {
			setState((prev_0) => mergeRegistryUpdate(prev_0, components_0, componentIndex_0, scanLoading, options_0));
		};
		$[10] = t6;
	} else t6 = $[10];
	const applyRegistryUpdate = t6;
	let t7;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = async (paths_0) => {
			const sourcePaths = [...new Set(paths_0.filter(_temp$115))];
			if (!sourcePaths.length || !projectPathRef.current) return;
			const baseline = new Map(sourcePaths.map(_temp2$76));
			const deadline = Date.now() + 2500;
			while (Date.now() < deadline) {
				if (sourcePaths.some((path_1) => {
					const url = componentLoader.getModuleCodeUrl(path_1);
					return url && url !== baseline.get(path_1);
				})) break;
				await new Promise(_temp3$56);
			}
			const result = await componentLoader.reloadIndexedModules(sourcePaths);
			if (!result || projectPathRef.current === null) return;
			applyRegistryUpdate(result.components, result.componentIndex);
		};
		$[11] = t7;
	} else t7 = $[11];
	const refreshComponentPaths = t7;
	let t8;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = async (names) => {
			if (!projectPathRef.current) return;
			const result_0 = await componentLoader.ensureModulesForNames(names);
			if (!result_0 || projectPathRef.current === null) return;
			applyRegistryUpdate(result_0.components, result_0.componentIndex);
		};
		$[12] = t8;
	} else t8 = $[12];
	const ensureComponentNames = t8;
	let t9;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = (patch) => {
			notifySourceFilesUpdated(sourcePathsFromPatch(patch));
			const propsOnly = Object.values(patch).every(_temp4$48);
			componentLoader.patchComponentIndexAndLoad(patch).then((t10) => {
				const { components: components_1, componentIndex: componentIndex_1 } = t10;
				if (projectPathRef.current === null) return;
				let scanLoading_0;
				const pending = pendingScanComponentRef.current;
				if (pending && patch[pending]) {
					pendingScanComponentRef.current = null;
					scanLoading_0 = false;
				}
				applyRegistryUpdate(components_1, componentIndex_1, scanLoading_0, { bumpRevision: !propsOnly });
			});
		};
		$[13] = t9;
	} else t9 = $[13];
	const patchComponentsUpdated = t9;
	let t10;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = async (componentKey_0) => {
			const projectId = projectPathRef.current;
			if (!projectId) return;
			pendingScanComponentRef.current = componentKey_0;
			setState(_temp5$41);
			await projectBuilderClient.scanComponents({ componentKey: componentKey_0 }).then((t11) => {
				const { status } = t11;
				if (projectPathRef.current !== projectId) return;
				if (status === "cached") {
					pendingScanComponentRef.current = null;
					setState(_temp6$34);
				}
			}).catch((err) => {
				if (projectPathRef.current !== projectId) return;
				pendingScanComponentRef.current = null;
				setState((prev_3) => ({
					...prev_3,
					scanLoading: false,
					error: String(err)
				}));
			});
		};
		$[14] = t10;
	} else t10 = $[14];
	const requestPropsScan = t10;
	let t11;
	let t12;
	if ($[15] !== projectPath) {
		t11 = () => {
			if (!projectPath) {
				pendingScanComponentRef.current = null;
				return;
			}
			let cancelled = false;
			let modulesCached = false;
			let firstPaintDone = false;
			const pendingModuleUpdates = /* @__PURE__ */ new Map();
			componentLoader.setProject(projectPath);
			const onEvent = (event) => {
				if (cancelled) return;
				if (event.type === "project:unavailable") {
					const unavailable = event.payload;
					if (unavailable.projectId !== projectPath) return;
					setState((prev_4) => ({
						...prev_4,
						loading: false,
						error: unavailable.message
					}));
					return;
				}
				if (event.type === "modules:ready") {
					const modules = event.payload.modules;
					componentLoader.cacheServerModules(Array.isArray(modules) ? modules : []);
					modulesCached = true;
					return;
				}
				if (event.type === "modules:updated") {
					const modules_0 = event.payload.modules ?? [];
					const moduleList = Array.isArray(modules_0) ? modules_0 : [];
					componentLoader.cacheServerModules(moduleList);
					notifySourceFilesUpdated(moduleList.map(_temp7$27).filter(_temp8$21));
					if (!firstPaintDone && !registryRef.current.initialized) {
						mergePendingModuleUpdates(pendingModuleUpdates, moduleList);
						return;
					}
					componentLoader.reloadModulesFromServerUpdate(moduleList).then((result_1) => {
						if (cancelled || !result_1 || projectPathRef.current === null) return;
						applyRegistryUpdate(result_1.components, result_1.componentIndex, false);
					});
					return;
				}
				if (event.type === "components:ready") {
					const nextIndex = event.payload.componentIndex ?? {};
					if (Object.keys(nextIndex).length === 0) {
						firstPaintDone = true;
						setState(_temp9$18);
						return;
					}
					const bootstrap = () => {
						if (cancelled) return;
						componentLoader.loadModulesForIndex(nextIndex).then((result_2) => {
							if (cancelled) return;
							let scanLoading_1;
							const pending_0 = pendingScanComponentRef.current;
							if (pending_0 && nextIndex[pending_0]?.props !== void 0) {
								pendingScanComponentRef.current = null;
								scanLoading_1 = false;
							}
							applyRegistryUpdate(result_2.components, result_2.componentIndex, scanLoading_1, { replace: true });
							firstPaintDone = true;
							const queuedModules = takePendingModuleUpdates(pendingModuleUpdates);
							if (queuedModules.length === 0) return;
							componentLoader.reloadModulesFromServerUpdate(queuedModules).then((update) => {
								if (cancelled || !update || projectPathRef.current === null) return;
								applyRegistryUpdate(update.components, update.componentIndex, false);
							});
						});
					};
					if (modulesCached) bootstrap();
					else queueMicrotask(bootstrap);
					return;
				}
				if (event.type === "components:updated") {
					const payload_0 = event.payload;
					patchComponentsUpdated(payload_0.componentIndex);
					return;
				}
				if (event.type === "components:scan_complete") {
					pendingScanComponentRef.current = null;
					setState(_temp0$16);
					return;
				}
				if (event.type === "components:scan_failed") {
					const payload_1 = event.payload;
					console.warn("[useComponents] components:scan_failed", payload_1);
					pendingScanComponentRef.current = null;
					setState((prev_7) => ({
						...prev_7,
						scanLoading: false,
						error: payload_1.error ?? prev_7.error
					}));
					return;
				}
				if (event.type === "modules:build_failed") {
					const payload_2 = event.payload;
					console.warn("[useComponents] modules:build_failed", payload_2);
					setState((prev_8) => ({
						...prev_8,
						loading: false,
						scanLoading: false,
						error: payload_2.error ?? prev_8.error
					}));
				}
			};
			const unsub = projectBuilderClient.on(onEvent, projectPath);
			componentLoader.initRuntime().catch(_temp1$15);
			return () => {
				cancelled = true;
				unsub();
			};
		};
		t12 = [
			projectPath,
			patchComponentsUpdated,
			notifySourceFilesUpdated,
			applyRegistryUpdate
		];
		$[15] = projectPath;
		$[16] = t11;
		$[17] = t12;
	} else {
		t11 = $[16];
		t12 = $[17];
	}
	(0, import_react.useEffect)(t11, t12);
	let t13;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = async () => {
			const projectId_0 = projectPathRef.current;
			if (!projectId_0) return;
			setState(_temp10$15);
			await projectBuilderClient.connect(projectId_0).catch((err_1) => {
				if (projectPathRef.current !== projectId_0) return;
				setState((prev_10) => ({
					...prev_10,
					loading: false,
					error: loadErrorMessage(err_1)
				}));
			});
		};
		$[18] = t13;
	} else t13 = $[18];
	const reload = t13;
	let t14;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = async () => {
			const projectId_1 = projectPathRef.current;
			if (!projectId_1) return;
			setState(_temp11$12);
			await projectBuilderClient.reconnect(projectId_1).catch((err_2) => {
				if (projectPathRef.current !== projectId_1) return;
				setState((prev_12) => ({
					...prev_12,
					loading: false,
					error: loadErrorMessage(err_2)
				}));
			});
		};
		$[19] = t14;
	} else t14 = $[19];
	const reconnect = t14;
	let t15;
	if ($[20] !== state.componentIndex || $[21] !== state.components || $[22] !== state.error || $[23] !== state.initialized || $[24] !== state.loading || $[25] !== state.registryRevision || $[26] !== state.scanLoading) {
		t15 = {
			initialized: state.initialized,
			loading: state.loading,
			scanLoading: state.scanLoading,
			error: state.error,
			components: state.components,
			componentIndex: state.componentIndex,
			registryRevision: state.registryRevision,
			reload,
			reconnect,
			requestPropsScan,
			waitForComponent,
			refreshComponentPaths,
			ensureComponentNames
		};
		$[20] = state.componentIndex;
		$[21] = state.components;
		$[22] = state.error;
		$[23] = state.initialized;
		$[24] = state.loading;
		$[25] = state.registryRevision;
		$[26] = state.scanLoading;
		$[27] = t15;
	} else t15 = $[27];
	return t15;
}
function _temp11$12(prev_11) {
	return {
		...prev_11,
		loading: true,
		error: null
	};
}
function _temp10$15(prev_9) {
	return {
		...prev_9,
		loading: true
	};
}
function _temp1$15(err_0) {
	console.warn("[useComponents] Runtime init failed:", err_0);
}
function _temp0$16(prev_6) {
	return prev_6.scanLoading ? {
		...prev_6,
		scanLoading: false
	} : prev_6;
}
function _temp9$18(prev_5) {
	return mergeRegistryUpdate(prev_5, {}, {}, false);
}
function _temp8$21(path_2) {
	return /\.(tsx?|jsx?)$/.test(path_2);
}
function _temp7$27(mod) {
	return mod.path;
}
function _temp6$34(prev_2) {
	return {
		...prev_2,
		scanLoading: false
	};
}
function _temp5$41(prev_1) {
	return prev_1.scanLoading ? prev_1 : {
		...prev_1,
		scanLoading: true
	};
}
function _temp4$48(entry) {
	return entry.props !== void 0;
}
function _temp3$56(resolve_0) {
	return setTimeout(resolve_0, 200);
}
function _temp2$76(path_0) {
	return [path_0, componentLoader.getModuleCodeUrl(path_0)];
}
function _temp$115(path) {
	return /\.(tsx?|jsx?)$/.test(path);
}

export { useComponents };
