// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/FontSettings.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { TrashIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { Switch } from "../../../ui/src/components/Switch.js";
import { SettingRow } from "../../../editor/src/shell/components/ProjectSettingsModal/SettingRow.js";
import { useProjectFonts } from "../hooks/useFonts.js";
import { LocalFontConsent } from "./LocalFontConsent.js";

function FontSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(44);
	const { projectId, canEdit: t1 } = t0;
	const canEdit = t1 === void 0 ? false : t1;
	const project = useProjectFonts(projectId);
	const [consentOpen, setConsentOpen] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [removingFamily, setRemovingFamily] = (0, import_react.useState)(null);
	let t2;
	if ($[0] !== project.data?.faces || $[1] !== project.data?.pendingDeletionFamilies) {
		let t3;
		if ($[3] !== project.data?.pendingDeletionFamilies) {
			t3 = project.data?.pendingDeletionFamilies ?? [];
			$[3] = project.data?.pendingDeletionFamilies;
			$[4] = t3;
		} else t3 = $[4];
		t2 = /* @__PURE__ */ new Set([...project.data?.faces.map(_temp$3) ?? [], ...t3]);
		$[0] = project.data?.faces;
		$[1] = project.data?.pendingDeletionFamilies;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[5] !== t2) {
		t3 = [...t2];
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	const sharedFamilies = t3;
	let t4;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = async function save(action) {
			setError("");
			try {
				await action();
			} catch (t5) {
				const e = t5;
				setError(e instanceof Error ? e.message : "Could not save font settings.");
			}
		};
		$[7] = t4;
	} else t4 = $[7];
	const save = t4;
	const t5 = project.data?.googleFontsEnabled ?? true;
	const t6 = !canEdit || !project.data || project.update.isPending;
	let t7;
	if ($[8] !== project.update) {
		t7 = (value) => void save(() => project.update.mutateAsync({ googleFontsEnabled: value }));
		$[8] = project.update;
		$[9] = t7;
	} else t7 = $[9];
	let t8;
	if ($[10] !== t5 || $[11] !== t6 || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			divider: false,
			title: "Google Fonts",
			description: "Make Google Fonts available in this file.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				size: "sm",
				"aria-label": "Enable Google Fonts for this project",
				checked: t5,
				disabled: t6,
				onCheckedChange: t7
			})
		});
		$[10] = t5;
		$[11] = t6;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	const t9 = project.data?.localFontsEnabled ?? true;
	const t10 = !canEdit || !project.data || project.update.isPending;
	let t11;
	if ($[14] !== project.update) {
		t11 = (value_0) => {
			if (value_0) setConsentOpen(true);
			else save(() => project.update.mutateAsync({ localFontsEnabled: false }));
		};
		$[14] = project.update;
		$[15] = t11;
	} else t11 = $[15];
	let t12;
	if ($[16] !== t10 || $[17] !== t11 || $[18] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			divider: false,
			title: "Local fonts",
			description: "Use fonts from your computer in the desktop app.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				size: "sm",
				"aria-label": "Enable local fonts for this project",
				checked: t9,
				disabled: t10,
				onCheckedChange: t11
			})
		});
		$[16] = t10;
		$[17] = t11;
		$[18] = t9;
		$[19] = t12;
	} else t12 = $[19];
	let t13;
	if ($[20] !== t12 || $[21] !== t8) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "setting-row",
			className: "flex flex-col gap-4",
			children: [t8, t12]
		});
		$[20] = t12;
		$[21] = t8;
		$[22] = t13;
	} else t13 = $[22];
	let t14;
	if ($[23] !== canEdit || $[24] !== project || $[25] !== sharedFamilies) {
		t14 = (project.isPending || project.isError || sharedFamilies.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			title: "Shared fonts",
			description: "Local fonts added to this file so collaborators can use them.",
			children: project.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "tertiary",
				children: "Loading shared fonts…"
			}) : project.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				className: "self-start",
				onClick: () => void project.refetch(),
				children: "Retry loading fonts"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: sharedFamilies.map((family) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-6.5 items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "2xs",
						className: "min-w-0 truncate",
						children: family
					}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-xs",
						variant: "ghost",
						LeftIcon: TrashIcon,
						"aria-label": `Remove ${family}`,
						onClick: () => {
							project.remove.reset();
							setRemovingFamily(family);
						}
					})]
				}, family))
			})
		});
		$[23] = canEdit;
		$[24] = project;
		$[25] = sharedFamilies;
		$[26] = t14;
	} else t14 = $[26];
	let t15;
	if ($[27] !== error) {
		t15 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "text-[11px] leading-4 text-ed-destructive",
			children: error
		});
		$[27] = error;
		$[28] = t15;
	} else t15 = $[28];
	let t16;
	if ($[29] !== t13 || $[30] !== t14 || $[31] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-6",
			children: [
				t13,
				t14,
				t15
			]
		});
		$[29] = t13;
		$[30] = t14;
		$[31] = t15;
		$[32] = t16;
	} else t16 = $[32];
	let t17;
	if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = () => setRemovingFamily(null);
		$[33] = t17;
	} else t17 = $[33];
	let t18;
	if ($[34] !== project.remove || $[35] !== removingFamily) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RemoveFontDialog, {
			family: removingFamily,
			remove: project.remove,
			onClose: t17
		});
		$[34] = project.remove;
		$[35] = removingFamily;
		$[36] = t18;
	} else t18 = $[36];
	let t19;
	if ($[37] !== consentOpen || $[38] !== project.update) {
		t19 = consentOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalFontConsent, {
			open: true,
			onOpenChange: setConsentOpen,
			onEnable: () => project.update.mutateAsync({ localFontsEnabled: true })
		});
		$[37] = consentOpen;
		$[38] = project.update;
		$[39] = t19;
	} else t19 = $[39];
	let t20;
	if ($[40] !== t16 || $[41] !== t18 || $[42] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t16,
			t18,
			t19
		] });
		$[40] = t16;
		$[41] = t18;
		$[42] = t19;
		$[43] = t20;
	} else t20 = $[43];
	return t20;
}
function _temp$3(face) {
	return face.family;
}
function RemoveFontDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(35);
	const { family, remove, onClose } = t0;
	const cancelRemovalRef = (0, import_react.useRef)(null);
	const t1 = family !== null;
	let t2;
	if ($[0] !== onClose || $[1] !== remove.isPending) {
		t2 = (open) => {
			if (!open && !remove.isPending) onClose();
		};
		$[0] = onClose;
		$[1] = remove.isPending;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (event) => {
			event.preventDefault();
			cancelRemovalRef.current?.focus();
		};
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== family) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Remove ", family] }) });
		$[4] = family;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["All styles of this font are deleted from the project and server. Text using it resets to the default font for everyone.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block",
			children: "This cannot be undone."
		})] });
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== remove.error) {
		t6 = remove.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "span",
				size: "3xs",
				variant: "danger",
				children: remove.error.message
			})
		});
		$[7] = remove.error;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "pt-3",
			children: [t5, t6]
		});
		$[9] = t6;
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== onClose) {
		t8 = () => onClose();
		$[11] = onClose;
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== remove.isPending || $[14] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			ref: cancelRemovalRef,
			variant: "ghost",
			size: "xs",
			disabled: remove.isPending,
			onClick: t8,
			children: "Cancel"
		});
		$[13] = remove.isPending;
		$[14] = t8;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== family || $[17] !== onClose || $[18] !== remove) {
		t10 = async () => {
			if (!family) return;
			try {
				await remove.mutateAsync(family);
				onClose();
			} catch {}
		};
		$[16] = family;
		$[17] = onClose;
		$[18] = remove;
		$[19] = t10;
	} else t10 = $[19];
	const t11 = remove.isError ? "Retry removal" : "Remove font";
	let t12;
	if ($[20] !== remove.isPending || $[21] !== t10 || $[22] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "destructive",
			size: "xs",
			loading: remove.isPending,
			disabled: remove.isPending,
			onClick: t10,
			children: t11
		});
		$[20] = remove.isPending;
		$[21] = t10;
		$[22] = t11;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== t12 || $[25] !== t9) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t9, t12] });
		$[24] = t12;
		$[25] = t9;
		$[26] = t13;
	} else t13 = $[26];
	let t14;
	if ($[27] !== t13 || $[28] !== t4 || $[29] !== t7) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			onOpenAutoFocus: t3,
			children: [
				t4,
				t7,
				t13
			]
		});
		$[27] = t13;
		$[28] = t4;
		$[29] = t7;
		$[30] = t14;
	} else t14 = $[30];
	let t15;
	if ($[31] !== t1 || $[32] !== t14 || $[33] !== t2) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: t1,
			onOpenChange: t2,
			children: t14
		});
		$[31] = t1;
		$[32] = t14;
		$[33] = t2;
		$[34] = t15;
	} else t15 = $[34];
	return t15;
}

export { FontSettings };
