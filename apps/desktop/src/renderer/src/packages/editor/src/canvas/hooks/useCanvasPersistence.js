// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/useCanvasPersistence.ts
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { useBackend } from "../../backends/BackendContext.js";

/**
* Run a backend call and report a rejection instead of throwing.
*
* The React Compiler bails out on a `try` statement whose body contains a
* conditional, logical or optional-chaining expression ("Support value blocks
* ... within a try/catch statement"), and on any `try` with a `finally` clause.
* So the risky `await` lives here, where nothing conditional happens, and every
* branch on the outcome stays in the hook body.
*/
async function safeCall(call) {
	try {
		return {
			ok: true,
			value: await call()
		};
	} catch (error) {
		return {
			ok: false,
			error
		};
	}
}
var toErrorMessage = (error) => error instanceof Error ? error.message : "Unknown error";
function useCanvasPersistence() {
	const $ = (0, import_compiler_runtime.c)(27);
	const backend = useBackend();
	let t0;
	if ($[0] !== backend) {
		t0 = async (params) => {
			try {
				const result = await backend.createPage(params);
				if (!result.success) {
					let errorMessage_0 = "Failed to create page";
					if (result.error) errorMessage_0 = result.error;
					return {
						success: false,
						error: errorMessage_0
					};
				}
				return result;
			} catch (t1) {
				const err = t1;
				return {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error"
				};
			}
		};
		$[0] = backend;
		$[1] = t0;
	} else t0 = $[1];
	const createPage = t0;
	let saveCanvas;
	let t1;
	if ($[2] !== backend) {
		saveCanvas = async (params_0) => {
			if (params_0.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params_0.id)) {
				console.warn(`[saveCanvas] Skipping save — canvas id '${params_0.id}' is not a UUID (placeholder before pages loaded)`);
				return { success: true };
			}
			const called = await safeCall(() => backend.saveCanvas(params_0));
			let outcome;
			if (!called.ok) outcome = {
				success: false,
				error: toErrorMessage(called.error)
			};
			else if (!called.value.success) outcome = {
				success: false,
				error: called.value.error ?? "Failed to save canvas"
			};
			else outcome = called.value;
			return outcome;
		};
		t1 = async (image, fingerprint) => {
			if (!backend?.savePreview) return {
				success: false,
				error: "Backend has no preview storage"
			};
			return backend.savePreview(image, fingerprint);
		};
		$[2] = backend;
		$[3] = saveCanvas;
		$[4] = t1;
	} else {
		saveCanvas = $[3];
		t1 = $[4];
	}
	const savePreview = t1;
	let createComponent;
	let getCanvasVersion;
	let listCanvasVersions;
	let listCanvases;
	let loadCanvas;
	let restoreCanvasVersion;
	let t2;
	if ($[5] !== backend) {
		loadCanvas = async (canvasId) => {
			const called_0 = await safeCall(() => backend.loadCanvas(canvasId));
			let outcome_0;
			if (!called_0.ok) outcome_0 = {
				success: false,
				error: toErrorMessage(called_0.error)
			};
			else if (!called_0.value.success) outcome_0 = {
				success: false,
				error: called_0.value.error ?? "Failed to load canvas"
			};
			else outcome_0 = called_0.value;
			return outcome_0;
		};
		listCanvases = async () => {
			const called_1 = await safeCall(() => backend.listCanvases());
			let outcome_1;
			if (!called_1.ok) outcome_1 = {
				success: false,
				error: toErrorMessage(called_1.error),
				canvases: []
			};
			else if (!called_1.value.success) outcome_1 = {
				success: false,
				error: called_1.value.error ?? "Failed to list canvases",
				canvases: []
			};
			else {
				let canvases = called_1.value.canvases;
				if (!canvases) canvases = [];
				outcome_1 = {
					...called_1.value,
					canvases
				};
			}
			return outcome_1;
		};
		createComponent = async (params_1) => {
			const called_2 = await safeCall(() => backend.createComponent(params_1));
			let outcome_2;
			if (!called_2.ok) outcome_2 = {
				success: false,
				error: toErrorMessage(called_2.error)
			};
			else if (!called_2.value.success) outcome_2 = called_2.value;
			else outcome_2 = called_2.value;
			return outcome_2;
		};
		listCanvasVersions = async (canvasId_0) => {
			const called_3 = await safeCall(() => backend.listCanvasVersions(canvasId_0));
			let outcome_3;
			if (!called_3.ok) outcome_3 = {
				success: false,
				error: toErrorMessage(called_3.error),
				versions: []
			};
			else if (!called_3.value.success) outcome_3 = {
				success: false,
				error: called_3.value.error ?? "Failed to list versions",
				versions: []
			};
			else {
				let versions = called_3.value.versions;
				if (!versions) versions = [];
				outcome_3 = {
					...called_3.value,
					versions
				};
			}
			return outcome_3;
		};
		getCanvasVersion = async (canvasId_1, versionFilename) => {
			const called_4 = await safeCall(() => backend.getCanvasVersion(canvasId_1, versionFilename));
			let outcome_4;
			if (!called_4.ok) outcome_4 = {
				success: false,
				error: toErrorMessage(called_4.error)
			};
			else if (!called_4.value.success) outcome_4 = {
				success: false,
				error: called_4.value.error ?? "Failed to get version"
			};
			else outcome_4 = called_4.value;
			return outcome_4;
		};
		restoreCanvasVersion = async (canvasId_2, versionFilename_0) => {
			const called_5 = await safeCall(() => backend.restoreCanvasVersion(canvasId_2, versionFilename_0));
			let outcome_5;
			if (!called_5.ok) outcome_5 = {
				success: false,
				error: toErrorMessage(called_5.error)
			};
			else if (!called_5.value.success) outcome_5 = {
				success: false,
				error: called_5.value.error ?? "Failed to restore version"
			};
			else outcome_5 = called_5.value;
			return outcome_5;
		};
		t2 = async (pageId) => {
			try {
				return await backend.deletePage(pageId);
			} catch (t3) {
				const err_0 = t3;
				return {
					success: false,
					error: err_0 instanceof Error ? err_0.message : "Unknown error"
				};
			}
		};
		$[5] = backend;
		$[6] = createComponent;
		$[7] = getCanvasVersion;
		$[8] = listCanvasVersions;
		$[9] = listCanvases;
		$[10] = loadCanvas;
		$[11] = restoreCanvasVersion;
		$[12] = t2;
	} else {
		createComponent = $[6];
		getCanvasVersion = $[7];
		listCanvasVersions = $[8];
		listCanvases = $[9];
		loadCanvas = $[10];
		restoreCanvasVersion = $[11];
		t2 = $[12];
	}
	const deletePage = t2;
	let t3;
	if ($[13] !== backend) {
		t3 = async (order) => {
			try {
				return await backend.reorderPages(order);
			} catch (t4) {
				const err_1 = t4;
				return {
					success: false,
					error: err_1 instanceof Error ? err_1.message : "Unknown error"
				};
			}
		};
		$[13] = backend;
		$[14] = t3;
	} else t3 = $[14];
	const reorderPages = t3;
	let t4;
	if ($[15] !== createComponent || $[16] !== createPage || $[17] !== deletePage || $[18] !== getCanvasVersion || $[19] !== listCanvasVersions || $[20] !== listCanvases || $[21] !== loadCanvas || $[22] !== reorderPages || $[23] !== restoreCanvasVersion || $[24] !== saveCanvas || $[25] !== savePreview) {
		t4 = {
			createPage,
			deletePage,
			reorderPages,
			saveCanvas,
			savePreview,
			loadCanvas,
			listCanvases,
			createComponent,
			listCanvasVersions,
			getCanvasVersion,
			restoreCanvasVersion
		};
		$[15] = createComponent;
		$[16] = createPage;
		$[17] = deletePage;
		$[18] = getCanvasVersion;
		$[19] = listCanvasVersions;
		$[20] = listCanvases;
		$[21] = loadCanvas;
		$[22] = reorderPages;
		$[23] = restoreCanvasVersion;
		$[24] = saveCanvas;
		$[25] = savePreview;
		$[26] = t4;
	} else t4 = $[26];
	return t4;
}

export { useCanvasPersistence };
