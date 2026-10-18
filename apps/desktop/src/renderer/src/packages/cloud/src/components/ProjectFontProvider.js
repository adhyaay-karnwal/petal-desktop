// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ProjectFontProvider.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { toast } from "../../../../vendor/sonner.js";
import { FontContext } from "../../../editor/src/shell/contexts/FontContext.js";
import { fontFaceCss } from "../../../compiler/src/runtime/fontTypes.js";
import { uploadProjectFont, useFontPreferences, useProjectFonts } from "../hooks/useFonts.js";
import { discoverLocalFonts, prepareLocalFamily } from "../services/localFonts.js";
import { LocalFontConsent } from "./LocalFontConsent.js";

function errorMessage(error, fallback) {
	return error instanceof Error ? error.message : fallback;
}
async function uploadFamilyFiles(projectId, files) {
	for (const file of files) await uploadProjectFont(projectId, file.bytes);
	await queryClient.invalidateQueries({ queryKey: ["project-fonts", projectId] });
}
function ProjectFontProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(69);
	const { projectId, desktop, canEdit: t1, children } = t0;
	const canEdit = t1 === void 0 ? false : t1;
	const account = useFontPreferences();
	const project = useProjectFonts(projectId);
	const [consentOpen, setConsentOpen] = (0, import_react.useState)(false);
	const [pickerOpened, setPickerOpened] = (0, import_react.useState)(0);
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			run: 0,
			fonts: [],
			error: ""
		};
		$[0] = t2;
	} else t2 = $[0];
	const [discovery, setDiscovery] = (0, import_react.useState)(t2);
	const mounted = (0, import_react.useRef)(true);
	const pendingConsent = (0, import_react.useRef)(null);
	const dismissedThisSession = (0, import_react.useRef)(false);
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = [];
		$[1] = t3;
	} else t3 = $[1];
	const transientFaces = (0, import_react.useRef)(t3);
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ new Map();
		$[2] = t4;
	} else t4 = $[2];
	const activeUploads = (0, import_react.useRef)(t4);
	let t5;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ new Set();
		$[3] = t5;
	} else t5 = $[3];
	const removalListeners = (0, import_react.useRef)(t5);
	const previousFamilies = (0, import_react.useRef)(null);
	let t6;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (listener) => {
			removalListeners.current.add(listener);
			return () => {
				removalListeners.current.delete(listener);
			};
		};
		$[4] = t6;
	} else t6 = $[4];
	const onFontsRemoved = t6;
	let t7;
	let t8;
	if ($[5] !== project.data || $[6] !== projectId) {
		t7 = () => {
			if (!project.data) return;
			const current = new Set(project.data.faces.map(_temp$14));
			const removed = previousFamilies.current?.filter((family) => !current.has(family)) ?? [];
			previousFamilies.current = [...current];
			if (!removed.length) return;
			const names = new Set(removed.map(_temp2$9));
			for (let index = transientFaces.current.length - 1; index >= 0; index--) {
				const face_0 = transientFaces.current[index];
				if (names.has(face_0.family.replace(/^["']|["']$/g, "").toLowerCase())) {
					document.fonts.delete(face_0);
					transientFaces.current.splice(index, 1);
				}
			}
			for (const family_1 of removed) toast.dismiss(`font-upload:${projectId}:${family_1}`);
			for (const listener_0 of removalListeners.current) listener_0(removed);
		};
		t8 = [project.data, projectId];
		$[5] = project.data;
		$[6] = projectId;
		$[7] = t7;
		$[8] = t8;
	} else {
		t7 = $[7];
		t8 = $[8];
	}
	(0, import_react.useEffect)(t7, t8);
	const localFontsAllowed = !!project.data && project.data.localFontsEnabled !== false;
	const enabled = desktop && localFontsAllowed && account.preferences.localFontConsentVersion === 1;
	let t10;
	let t9;
	if ($[9] !== enabled || $[10] !== pickerOpened) {
		t9 = () => {
			if (!enabled || !pickerOpened) return;
			let cancelled = false;
			discoverLocalFonts().then((fonts) => {
				if (!cancelled) setDiscovery({
					run: pickerOpened,
					fonts,
					error: ""
				});
			}).catch((e) => {
				if (!cancelled) setDiscovery((previous) => ({
					run: pickerOpened,
					fonts: previous.fonts,
					error: e.message
				}));
			});
			return () => {
				cancelled = true;
			};
		};
		t10 = [enabled, pickerOpened];
		$[9] = enabled;
		$[10] = pickerOpened;
		$[11] = t10;
		$[12] = t9;
	} else {
		t10 = $[11];
		t9 = $[12];
	}
	(0, import_react.useEffect)(t9, t10);
	const installed = discovery.fonts;
	const loading = pickerOpened > 0 && discovery.run !== pickerOpened;
	const error = discovery.run === pickerOpened ? discovery.error : "";
	let t11;
	if ($[13] !== project.data?.faces || $[14] !== projectId) {
		t11 = () => {
			const style = document.createElement("style");
			style.dataset.lgProjectFonts = projectId;
			style.textContent = (project.data?.faces ?? []).map(fontFaceCss).join("\n");
			document.head.appendChild(style);
			return () => style.remove();
		};
		$[13] = project.data?.faces;
		$[14] = projectId;
		$[15] = t11;
	} else t11 = $[15];
	const t12 = project.data?.faces;
	let t13;
	if ($[16] !== projectId || $[17] !== t12) {
		t13 = [projectId, t12];
		$[16] = projectId;
		$[17] = t12;
		$[18] = t13;
	} else t13 = $[18];
	(0, import_react.useEffect)(t11, t13);
	let t14;
	let t15;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => {
			mounted.current = true;
			const faces = transientFaces.current;
			return () => {
				mounted.current = false;
				pendingConsent.current?.resolve(false);
				pendingConsent.current = null;
				faces.forEach(_temp3$7);
			};
		};
		t15 = [];
		$[19] = t14;
		$[20] = t15;
	} else {
		t14 = $[19];
		t15 = $[20];
	}
	(0, import_react.useEffect)(t14, t15);
	let t16;
	if ($[21] !== enabled || $[22] !== installed || $[23] !== projectId) {
		t16 = async (family_2) => {
			if (!enabled) throw new Error("Enable local font sharing first.");
			const prepared = await prepareLocalFamily(installed, family_2);
			if (!mounted.current) {
				prepared.loaded.forEach(_temp4$7);
				throw new Error("The project was closed before the font loaded.");
			}
			transientFaces.current.push(...prepared.loaded);
			if (!activeUploads.current.has(family_2)) {
				const id = `font-upload:${projectId}:${family_2}`;
				const upload = async () => {
					toast.dismiss(id);
					try {
						await uploadFamilyFiles(projectId, prepared.files);
						toast.dismiss(id);
					} catch (t17) {
						const e_0 = t17;
						toast.error(`${family_2} is only available on this computer. ${errorMessage(e_0, "Upload failed.")}`, {
							id,
							duration: Infinity,
							action: {
								label: "Retry",
								onClick: () => {
									upload();
								}
							}
						});
					}
					activeUploads.current.delete(family_2);
				};
				const promise = upload();
				activeUploads.current.set(family_2, promise);
			}
			return prepared.family;
		};
		$[21] = enabled;
		$[22] = installed;
		$[23] = projectId;
		$[24] = t16;
	} else t16 = $[24];
	const selectLocalFamily = t16;
	let t17;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = () => {
			if (pendingConsent.current) return pendingConsent.current.promise;
			let resolve;
			const promise_0 = new Promise((done) => {
				resolve = done;
			});
			pendingConsent.current = {
				promise: promise_0,
				resolve
			};
			setConsentOpen(true);
			return promise_0;
		};
		$[25] = t17;
	} else t17 = $[25];
	const requestConsent = t17;
	let t18;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = (open) => {
			setConsentOpen(open);
			if (!open) {
				dismissedThisSession.current = true;
				pendingConsent.current?.resolve(true);
				pendingConsent.current = null;
			}
		};
		$[26] = t18;
	} else t18 = $[26];
	const closeConsent = t18;
	const { data: accountData, refetch: refetchAccount } = account;
	let t19;
	if ($[27] !== accountData || $[28] !== desktop || $[29] !== localFontsAllowed || $[30] !== refetchAccount) {
		t19 = async () => {
			if (!desktop || !localFontsAllowed) return true;
			setPickerOpened(_temp5$6);
			const preferences = accountData ?? (await refetchAccount()).data;
			if (!mounted.current) return false;
			if (!dismissedThisSession.current && !preferences?.localFontPromptDismissed && preferences?.localFontConsentVersion !== 1) return requestConsent();
			return true;
		};
		$[27] = accountData;
		$[28] = desktop;
		$[29] = localFontsAllowed;
		$[30] = refetchAccount;
		$[31] = t19;
	} else t19 = $[31];
	const openPicker = t19;
	let t20;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = () => {
			setPickerOpened(_temp6$4);
			return requestConsent();
		};
		$[32] = t20;
	} else t20 = $[32];
	const enableLocalFonts = t20;
	const { mutateAsync: updateProjectFonts } = project.update;
	let t21;
	if ($[33] !== updateProjectFonts) {
		t21 = async () => {
			await updateProjectFonts({ googleFontsEnabled: true });
		};
		$[33] = updateProjectFonts;
		$[34] = t21;
	} else t21 = $[34];
	const enableGoogleFonts = t21;
	const { refetch: refetchProjectFonts } = project;
	let t22;
	if ($[35] !== refetchProjectFonts) {
		t22 = () => {
			refetchProjectFonts();
		};
		$[35] = refetchProjectFonts;
		$[36] = t22;
	} else t22 = $[36];
	const retryProjectFonts = t22;
	const t23 = !project.data && project.isPending;
	const t24 = !project.data && project.isError ? "Couldn’t load project font settings." : void 0;
	const t25 = canEdit && project.data ? enableGoogleFonts : void 0;
	const t26 = !!project.data && project.data.googleFontsEnabled;
	let t27;
	if ($[37] !== project.data?.faces) {
		t27 = new Set(project.data?.faces.map(_temp7$3) ?? []);
		$[37] = project.data?.faces;
		$[38] = t27;
	} else t27 = $[38];
	let t28;
	if ($[39] !== t27) {
		t28 = [...t27];
		$[39] = t27;
		$[40] = t28;
	} else t28 = $[40];
	let t29;
	if ($[41] !== enabled || $[42] !== installed) {
		t29 = enabled ? [...new Set(installed.map(_temp8$3))].sort(_temp9$2) : [];
		$[41] = enabled;
		$[42] = installed;
		$[43] = t29;
	} else t29 = $[43];
	const t30 = desktop && !!project.data && (localFontsAllowed || canEdit);
	const t31 = enabled && loading;
	const t32 = enabled ? error : void 0;
	let t33;
	if ($[44] !== desktop || $[45] !== enabled || $[46] !== localFontsAllowed || $[47] !== openPicker || $[48] !== retryProjectFonts || $[49] !== selectLocalFamily || $[50] !== t23 || $[51] !== t24 || $[52] !== t25 || $[53] !== t26 || $[54] !== t28 || $[55] !== t29 || $[56] !== t30 || $[57] !== t31 || $[58] !== t32) {
		t33 = {
			onFontsRemoved,
			projectFontsLoading: t23,
			projectFontsError: t24,
			retryProjectFonts,
			enableGoogleFonts: t25,
			googleFontsEnabled: t26,
			projectFamilies: t28,
			localFamilies: t29,
			localEnabled: enabled,
			localFontsAllowed,
			canEnableLocalFonts: t30,
			localLoading: t31,
			localError: t32,
			desktop,
			openPicker,
			enableLocalFonts,
			selectLocalFamily
		};
		$[44] = desktop;
		$[45] = enabled;
		$[46] = localFontsAllowed;
		$[47] = openPicker;
		$[48] = retryProjectFonts;
		$[49] = selectLocalFamily;
		$[50] = t23;
		$[51] = t24;
		$[52] = t25;
		$[53] = t26;
		$[54] = t28;
		$[55] = t29;
		$[56] = t30;
		$[57] = t31;
		$[58] = t32;
		$[59] = t33;
	} else t33 = $[59];
	const environment = t33;
	let t34;
	if ($[60] !== canEdit || $[61] !== consentOpen || $[62] !== localFontsAllowed || $[63] !== updateProjectFonts) {
		t34 = consentOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalFontConsent, {
			open: consentOpen,
			onOpenChange: closeConsent,
			onEnable: !localFontsAllowed && canEdit ? () => updateProjectFonts({ localFontsEnabled: true }) : void 0
		});
		$[60] = canEdit;
		$[61] = consentOpen;
		$[62] = localFontsAllowed;
		$[63] = updateProjectFonts;
		$[64] = t34;
	} else t34 = $[64];
	let t35;
	if ($[65] !== children || $[66] !== environment || $[67] !== t34) {
		t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FontContext.Provider, {
			value: environment,
			children: [children, t34]
		});
		$[65] = children;
		$[66] = environment;
		$[67] = t34;
		$[68] = t35;
	} else t35 = $[68];
	return t35;
}
function _temp9$2(a, b) {
	return a.localeCompare(b);
}
function _temp8$3(font) {
	return font.family;
}
function _temp7$3(face_3) {
	return face_3.family;
}
function _temp6$4(value_0) {
	return value_0 + 1;
}
function _temp5$6(value) {
	return value + 1;
}
function _temp4$7(face_2) {
	return document.fonts.delete(face_2);
}
function _temp3$7(face_1) {
	return document.fonts.delete(face_1);
}
function _temp2$9(family_0) {
	return family_0.toLowerCase();
}
function _temp$14(face) {
	return face.family;
}

export { ProjectFontProvider };
