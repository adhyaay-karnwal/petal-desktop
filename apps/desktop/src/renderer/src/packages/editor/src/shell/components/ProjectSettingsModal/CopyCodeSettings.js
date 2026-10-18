// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/CopyCodeSettings.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Switch } from "../../../../../ui/src/components/Switch.js";
import { SettingRow } from "./SettingRow.js";

function CopyCodeSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { includesComponents, onChangeIncludesComponents, canEdit } = t0;
	const [error, setError] = (0, import_react.useState)(null);
	const editable = canEdit && !!onChangeIncludesComponents;
	let t1;
	if ($[0] !== onChangeIncludesComponents) {
		t1 = (checked) => {
			if (!onChangeIncludesComponents) return;
			setError(null);
			onChangeIncludesComponents(checked).catch((err) => {
				setError(err instanceof Error ? err.message : "Couldn't save this setting");
			});
		};
		$[0] = onChangeIncludesComponents;
		$[1] = t1;
	} else t1 = $[1];
	const handleChange = t1;
	const t2 = !editable;
	let t3;
	if ($[2] !== handleChange || $[3] !== includesComponents || $[4] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			size: "sm",
			"aria-label": "Include all components when copying code",
			checked: includesComponents,
			disabled: t2,
			onCheckedChange: handleChange
		});
		$[2] = handleChange;
		$[3] = includesComponents;
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== error) {
		t4 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "danger",
			children: error
		});
		$[6] = error;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== canEdit) {
		t5 = !canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: "Only people who can edit this file can change this."
		});
		$[8] = canEdit;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== t3 || $[11] !== t4 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingRow, {
			title: "Include all components when copying code",
			description: "Copies one file with every nested component's code, for people who don't have your components.",
			action: t3,
			children: [t4, t5]
		});
		$[10] = t3;
		$[11] = t4;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}

export { CopyCodeSettings };
