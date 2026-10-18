// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/LocalFontConsent.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { Checkbox } from "../../../ui/src/components/Checkbox.js";
import { useFontPreferences } from "../hooks/useFonts.js";

function LocalFontConsent(t0) {
	const $ = (0, import_compiler_runtime.c)(41);
	const { open, onOpenChange, onEnable } = t0;
	const { update } = useFontPreferences();
	const [checked, setChecked] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	let t1;
	if ($[0] !== onEnable || $[1] !== onOpenChange || $[2] !== update) {
		t1 = async function save(enable) {
			setError("");
			setSaving(true);
			if (!enable) onOpenChange(false);
			const changes = enable ? { acceptLocalFontConsent: 1 } : { localFontPromptDismissed: true };
			try {
				await update.mutateAsync(changes);
				if (enable) {
					if (onEnable) await onEnable();
				}
				if (enable) onOpenChange(false);
			} catch (t2) {
				const e = t2;
				setError(e instanceof Error ? e.message : "Could not save your preference.");
			}
			setSaving(false);
		};
		$[0] = onEnable;
		$[1] = onOpenChange;
		$[2] = update;
		$[3] = t1;
	} else t1 = $[3];
	const save = t1;
	let t2;
	if ($[4] !== save || $[5] !== saving) {
		t2 = (value) => {
			if (!value && !saving) save(false);
		};
		$[4] = save;
		$[5] = saving;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Enable local fonts" }) });
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Petal adds the fonts you use to your project so collaborators can view and edit with them." })
		});
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (value_0) => setChecked(value_0 === true);
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== checked) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			checked,
			onCheckedChange: t5,
			className: "mt-px"
		});
		$[10] = checked;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] leading-4 text-ed-foreground",
			children: "I confirm I have the rights to upload and share the local fonts I use."
		});
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] !== t6) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex items-start gap-2.5",
			children: [t6, t7]
		});
		$[13] = t6;
		$[14] = t8;
	} else t8 = $[14];
	let t9;
	if ($[15] !== error) {
		t9 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "span",
				size: "3xs",
				variant: "danger",
				children: error
			})
		});
		$[15] = error;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== t8 || $[18] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, { children: [t8, t9] });
		$[17] = t8;
		$[18] = t9;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== save) {
		t11 = () => void save(false);
		$[20] = save;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== saving || $[23] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			disabled: saving,
			onClick: t11,
			children: "Not now"
		});
		$[22] = saving;
		$[23] = t11;
		$[24] = t12;
	} else t12 = $[24];
	const t13 = !checked || saving;
	let t14;
	if ($[25] !== save) {
		t14 = () => void save(true);
		$[25] = save;
		$[26] = t14;
	} else t14 = $[26];
	let t15;
	if ($[27] !== saving || $[28] !== t13 || $[29] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			disabled: t13,
			loading: saving,
			onClick: t14,
			children: "Enable local fonts"
		});
		$[27] = saving;
		$[28] = t13;
		$[29] = t14;
		$[30] = t15;
	} else t15 = $[30];
	let t16;
	if ($[31] !== t12 || $[32] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t12, t15] });
		$[31] = t12;
		$[32] = t15;
		$[33] = t16;
	} else t16 = $[33];
	let t17;
	if ($[34] !== t10 || $[35] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			t3,
			t4,
			t10,
			t16
		] });
		$[34] = t10;
		$[35] = t16;
		$[36] = t17;
	} else t17 = $[36];
	let t18;
	if ($[37] !== open || $[38] !== t17 || $[39] !== t2) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: t2,
			children: t17
		});
		$[37] = open;
		$[38] = t17;
		$[39] = t2;
		$[40] = t18;
	} else t18 = $[40];
	return t18;
}

export { LocalFontConsent };
