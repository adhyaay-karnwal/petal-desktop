// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useBackendActions.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { useBackend } from "../../backends/BackendContext.js";

function useBackendActions() {
	const $ = (0, import_compiler_runtime.c)(40);
	const backend = useBackend();
	const [isSaving, setIsSaving] = (0, import_react.useState)(false);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	let t0;
	if ($[0] !== backend) {
		t0 = (filePath) => {
			setIsLoading(true);
			setError(null);
			return backend.loadFile(filePath).then((result) => {
				if (!result.success) {
					const errorMessage = result.error || "Failed to load file";
					setError(errorMessage);
					return {
						success: false,
						error: errorMessage
					};
				}
				return result;
			}).catch((err) => {
				const errorMessage_0 = err instanceof Error ? err.message : "Unknown error";
				setError(errorMessage_0);
				return {
					success: false,
					error: errorMessage_0
				};
			}).finally(() => setIsLoading(false));
		};
		$[0] = backend;
		$[1] = t0;
	} else t0 = $[1];
	const loadFile = t0;
	let t1;
	if ($[2] !== backend) {
		t1 = (options) => {
			setIsSaving(true);
			setError(null);
			return backend.saveFile(options).then((result_0) => {
				if (!result_0.success) {
					const errorMessage_1 = result_0.error || "Failed to save file";
					setError(errorMessage_1);
					return {
						success: false,
						error: errorMessage_1
					};
				}
				return result_0;
			}).catch((err_0) => {
				const errorMessage_2 = err_0 instanceof Error ? err_0.message : "Unknown error";
				setError(errorMessage_2);
				return {
					success: false,
					error: errorMessage_2
				};
			}).finally(() => setIsSaving(false));
		};
		$[2] = backend;
		$[3] = t1;
	} else t1 = $[3];
	const saveFile = t1;
	let t2;
	if ($[4] !== backend) {
		t2 = async (componentName) => {
			try {
				return await backend.loadDraft(componentName);
			} catch (t3) {
				const err_1 = t3;
				return {
					success: false,
					draft: null,
					error: err_1 instanceof Error ? err_1.message : "Unknown error"
				};
			}
		};
		$[4] = backend;
		$[5] = t2;
	} else t2 = $[5];
	const loadDraft = t2;
	let t3;
	if ($[6] !== backend) {
		t3 = async (params) => {
			try {
				return await backend.saveDraft(params);
			} catch (t4) {
				const err_2 = t4;
				return {
					success: false,
					error: err_2 instanceof Error ? err_2.message : "Unknown error"
				};
			}
		};
		$[6] = backend;
		$[7] = t3;
	} else t3 = $[7];
	const saveDraft = t3;
	let t4;
	if ($[8] !== backend) {
		t4 = async (componentName_0) => {
			try {
				return await backend.deleteDraft(componentName_0);
			} catch (t5) {
				const err_3 = t5;
				return {
					success: false,
					error: err_3 instanceof Error ? err_3.message : "Unknown error"
				};
			}
		};
		$[8] = backend;
		$[9] = t4;
	} else t4 = $[9];
	const deleteDraft = t4;
	let t5;
	if ($[10] !== backend) {
		t5 = async () => {
			try {
				return await backend.listDrafts();
			} catch (t6) {
				const err_4 = t6;
				return {
					success: false,
					drafts: [],
					error: err_4 instanceof Error ? err_4.message : "Unknown error"
				};
			}
		};
		$[10] = backend;
		$[11] = t5;
	} else t5 = $[11];
	const listDrafts = t5;
	let t6;
	if ($[12] !== backend) {
		t6 = async (componentName_1) => {
			try {
				return await backend.listDraftVersions(componentName_1);
			} catch (t7) {
				const err_5 = t7;
				return {
					success: false,
					versions: [],
					error: err_5 instanceof Error ? err_5.message : "Unknown error"
				};
			}
		};
		$[12] = backend;
		$[13] = t6;
	} else t6 = $[13];
	const listDraftVersions = t6;
	let t7;
	if ($[14] !== backend) {
		t7 = async (componentName_2, versionFilename) => {
			try {
				return await backend.getDraftVersion(componentName_2, versionFilename);
			} catch (t8) {
				const err_6 = t8;
				return {
					success: false,
					error: err_6 instanceof Error ? err_6.message : "Unknown error"
				};
			}
		};
		$[14] = backend;
		$[15] = t7;
	} else t7 = $[15];
	const getDraftVersion = t7;
	let t8;
	if ($[16] !== backend) {
		t8 = async (componentName_3, versionFilename_0) => {
			try {
				return await backend.restoreDraftVersion(componentName_3, versionFilename_0);
			} catch (t9) {
				const err_7 = t9;
				return {
					success: false,
					error: err_7 instanceof Error ? err_7.message : "Unknown error"
				};
			}
		};
		$[16] = backend;
		$[17] = t8;
	} else t8 = $[17];
	const restoreDraftVersion = t8;
	let t9;
	if ($[18] !== backend) {
		t9 = async (componentName_4, filePath_0) => {
			try {
				return await backend.listFileVersions(componentName_4, filePath_0);
			} catch (t10) {
				return {
					success: false,
					versions: [],
					error: String(t10)
				};
			}
		};
		$[18] = backend;
		$[19] = t9;
	} else t9 = $[19];
	const listFileVersions = t9;
	let t10;
	if ($[20] !== backend) {
		t10 = async (componentName_5, versionFilename_1, filePath_1) => {
			try {
				return await backend.restoreFileVersion(componentName_5, versionFilename_1, filePath_1);
			} catch (t11) {
				return {
					success: false,
					error: String(t11)
				};
			}
		};
		$[20] = backend;
		$[21] = t10;
	} else t10 = $[21];
	const restoreFileVersion = t10;
	let t11;
	if ($[22] !== backend) {
		t11 = async (componentName_6, versionFilename_2) => {
			try {
				return await backend.getFileVersionContent(componentName_6, versionFilename_2);
			} catch (t12) {
				return {
					success: false,
					error: String(t12)
				};
			}
		};
		$[22] = backend;
		$[23] = t11;
	} else t11 = $[23];
	const getFileVersionContent = t11;
	let t12;
	if ($[24] !== deleteDraft || $[25] !== error || $[26] !== getDraftVersion || $[27] !== getFileVersionContent || $[28] !== isLoading || $[29] !== isSaving || $[30] !== listDraftVersions || $[31] !== listDrafts || $[32] !== listFileVersions || $[33] !== loadDraft || $[34] !== loadFile || $[35] !== restoreDraftVersion || $[36] !== restoreFileVersion || $[37] !== saveDraft || $[38] !== saveFile) {
		t12 = {
			loadFile,
			saveFile,
			loadDraft,
			saveDraft,
			deleteDraft,
			listDrafts,
			listDraftVersions,
			getDraftVersion,
			restoreDraftVersion,
			listFileVersions,
			restoreFileVersion,
			getFileVersionContent,
			isLoading,
			isSaving,
			error
		};
		$[24] = deleteDraft;
		$[25] = error;
		$[26] = getDraftVersion;
		$[27] = getFileVersionContent;
		$[28] = isLoading;
		$[29] = isSaving;
		$[30] = listDraftVersions;
		$[31] = listDrafts;
		$[32] = listFileVersions;
		$[33] = loadDraft;
		$[34] = loadFile;
		$[35] = restoreDraftVersion;
		$[36] = restoreFileVersion;
		$[37] = saveDraft;
		$[38] = saveFile;
		$[39] = t12;
	} else t12 = $[39];
	return t12;
}

export { useBackendActions };
