// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/GeneralSettings.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { Badge } from "../../../../../ui/src/components/Badge.js";
import { DatabaseIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Input } from "../../../../../ui/src/components/Input.js";
import { SettingRow } from "./SettingRow.js";

function formatProjectBytes(bytes) {
	const KB = 1024;
	const MB = 1048576;
	if (bytes < KB) return `${bytes} B`;
	if (bytes < MB) {
		const kb = bytes / KB;
		return kb >= 10 ? `${Math.round(kb)} KB` : `${kb.toFixed(1)} KB`;
	}
	const mb = bytes / MB;
	return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}
function GeneralSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(36);
	const { projectName, onRenameProject, canRename: t1, projectSize } = t0;
	const canRename = t1 === void 0 ? false : t1;
	const [name, setName] = (0, import_react.useState)(projectName);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [syncedProjectName, setSyncedProjectName] = (0, import_react.useState)(projectName);
	if (syncedProjectName !== projectName) {
		setSyncedProjectName(projectName);
		setName(projectName);
		setError(null);
	}
	let t2;
	if ($[0] !== name) {
		t2 = name.trim();
		$[0] = name;
		$[1] = t2;
	} else t2 = $[1];
	const trimmed = t2;
	const dirty = trimmed.length > 0 && trimmed !== projectName;
	const canSave = canRename && !!onRenameProject && dirty && !saving;
	let t3;
	if ($[2] !== canSave || $[3] !== onRenameProject || $[4] !== trimmed) {
		t3 = () => {
			if (!canSave || !onRenameProject) return;
			setSaving(true);
			setError(null);
			onRenameProject(trimmed).catch((err) => {
				setError(err instanceof Error ? err.message : "Couldn't rename file");
			}).finally(() => setSaving(false));
		};
		$[2] = canSave;
		$[3] = onRenameProject;
		$[4] = trimmed;
		$[5] = t3;
	} else t3 = $[5];
	const handleSave = t3;
	let t4;
	if ($[6] !== error) {
		t4 = (e) => {
			setName(e.target.value);
			if (error) setError(null);
		};
		$[6] = error;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== handleSave) {
		t5 = (e_0) => {
			if (e_0.key === "Enter") {
				e_0.preventDefault();
				handleSave();
			}
		};
		$[8] = handleSave;
		$[9] = t5;
	} else t5 = $[9];
	const t6 = !canRename || saving;
	let t7;
	if ($[10] !== name || $[11] !== t4 || $[12] !== t5 || $[13] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			size: "xs",
			value: name,
			onChange: t4,
			onKeyDown: t5,
			placeholder: "Untitled file",
			"aria-label": "File name",
			maxLength: 200,
			disabled: t6,
			className: "max-w-[360px]"
		});
		$[10] = name;
		$[11] = t4;
		$[12] = t5;
		$[13] = t6;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== canRename || $[16] !== canSave || $[17] !== handleSave || $[18] !== saving) {
		t8 = canRename && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			disabled: !canSave,
			onClick: () => void handleSave(),
			children: saving ? "Saving…" : "Save"
		});
		$[15] = canRename;
		$[16] = canSave;
		$[17] = handleSave;
		$[18] = saving;
		$[19] = t8;
	} else t8 = $[19];
	let t9;
	if ($[20] !== t7 || $[21] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [t7, t8]
		});
		$[20] = t7;
		$[21] = t8;
		$[22] = t9;
	} else t9 = $[22];
	let t10;
	if ($[23] !== error) {
		t10 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "danger",
			children: error
		});
		$[23] = error;
		$[24] = t10;
	} else t10 = $[24];
	let t11;
	if ($[25] !== canRename) {
		t11 = !canRename && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: "Only project owners can rename this project."
		});
		$[25] = canRename;
		$[26] = t11;
	} else t11 = $[26];
	let t12;
	if ($[27] !== t10 || $[28] !== t11 || $[29] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			title: "File name",
			description: "Shown in the file picker and the editor header.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					t9,
					t10,
					t11
				]
			})
		});
		$[27] = t10;
		$[28] = t11;
		$[29] = t9;
		$[30] = t12;
	} else t12 = $[30];
	let t13;
	if ($[31] !== projectSize) {
		t13 = projectSize != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSizeRow, { size: projectSize });
		$[31] = projectSize;
		$[32] = t13;
	} else t13 = $[32];
	let t14;
	if ($[33] !== t12 || $[34] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-6",
			children: [t12, t13]
		});
		$[33] = t12;
		$[34] = t13;
		$[35] = t14;
	} else t14 = $[35];
	return t14;
}
function ProjectSizeRow(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { size } = t0;
	const { usedBytes, maxBytes } = size;
	const hasCap = maxBytes != null && maxBytes > 0;
	const usedPct = hasCap ? Math.min(100, usedBytes / maxBytes * 100) : 0;
	const barColor = hasCap && usedBytes >= maxBytes ? "bg-ed-destructive" : hasCap && usedPct >= 80 ? "bg-ed-warning" : "bg-ed-foreground";
	let t1;
	if ($[0] !== usedBytes) {
		t1 = formatProjectBytes(usedBytes);
		$[0] = usedBytes;
		$[1] = t1;
	} else t1 = $[1];
	const usedLabel = t1;
	let t2;
	if ($[2] !== hasCap || $[3] !== maxBytes) {
		t2 = hasCap ? formatProjectBytes(maxBytes) : "Unlimited";
		$[2] = hasCap;
		$[3] = maxBytes;
		$[4] = t2;
	} else t2 = $[4];
	const limitLabel = t2;
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatabaseIcon, {
			width: 12,
			height: 12,
			className: "text-ed-muted-foreground"
		});
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== limitLabel || $[7] !== usedLabel) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "gap-1.5 border-ed-field-border bg-ed-field px-2.5 py-1 text-ed-ui leading-4 text-ed-foreground shadow-ed-control",
			children: [
				t3,
				usedLabel,
				" of ",
				limitLabel
			]
		});
		$[6] = limitLabel;
		$[7] = usedLabel;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== barColor || $[10] !== hasCap || $[11] !== usedPct) {
		t5 = hasCap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 w-full max-w-[360px] overflow-hidden rounded-full bg-ed-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `h-full rounded-full ${barColor}`,
				style: { width: `${usedPct}%` }
			})
		});
		$[9] = barColor;
		$[10] = hasCap;
		$[11] = usedPct;
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] !== t4 || $[14] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			title: "File size",
			description: "Code and assets in this file, counted against your plan.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-start gap-2",
				children: [t4, t5]
			})
		});
		$[13] = t4;
		$[14] = t5;
		$[15] = t6;
	} else t6 = $[15];
	return t6;
}

export { GeneralSettings };
