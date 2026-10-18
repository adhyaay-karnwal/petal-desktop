// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/AIChatSettings.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { Badge } from "../../../../../ui/src/components/Badge.js";
import { XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Input } from "../../../../../ui/src/components/Input.js";
import { publishFolderShared } from "../../../shared/state/folderShared.js";
import { SettingRow } from "./SettingRow.js";

function AIChatSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { allowedPaths, onAddAllowedPath, onRemoveAllowedPath, isElectron } = t0;
	let t1;
	if ($[0] !== isElectron) {
		t1 = async () => {
			if (!isElectron) return null;
			const invoke = window.api?.invoke;
			if (typeof invoke !== "function") return null;
			try {
				const result = await invoke("pick_folder");
				if (!result) return null;
				if (typeof result.path !== "string") return null;
				return result.path;
			} catch {
				return null;
			}
		};
		$[0] = isElectron;
		$[1] = t1;
	} else t1 = $[1];
	const pickFolder = t1;
	let t2;
	if ($[2] !== isElectron) {
		t2 = !isElectron && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "w-fit cursor-help text-[10px]",
				children: "Desktop only"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			className: "max-w-64",
			children: "Folder access is only available in the Petal desktop app."
		})] });
		$[2] = isElectron;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== allowedPaths.length || $[5] !== isElectron) {
		t3 = isElectron && allowedPaths.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-2 rounded-md bg-ed-muted/50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "tertiary",
				children: "No folders yet. The AI can only see this Petal file."
			})
		});
		$[4] = allowedPaths.length;
		$[5] = isElectron;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== allowedPaths || $[8] !== onRemoveAllowedPath) {
		let t5;
		if ($[10] !== onRemoveAllowedPath) {
			t5 = (path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					size: "xs",
					value: path,
					readOnly: true,
					"aria-label": "Allowed folder path",
					className: "flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-xs",
					variant: "ghost",
					onClick: () => onRemoveAllowedPath(path),
					"aria-label": `Stop the AI opening ${path}`,
					isChildText: false,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
						width: 12,
						height: 12,
						className: "text-ed-muted-foreground"
					})
				})]
			}, path);
			$[10] = onRemoveAllowedPath;
			$[11] = t5;
		} else t5 = $[11];
		t4 = allowedPaths.map(t5);
		$[7] = allowedPaths;
		$[8] = onRemoveAllowedPath;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[12] !== isElectron || $[13] !== onAddAllowedPath || $[14] !== pickFolder) {
		t5 = isElectron && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			className: "self-start",
			onClick: async () => {
				const picked = await pickFolder();
				if (!picked) return;
				onAddAllowedPath(picked);
				publishFolderShared(picked);
			},
			children: "Add folder"
		});
		$[12] = isElectron;
		$[13] = onAddAllowedPath;
		$[14] = pickFolder;
		$[15] = t5;
	} else t5 = $[15];
	let t6;
	if ($[16] !== isElectron) {
		t6 = !isElectron && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-2 rounded-md bg-ed-muted/50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "tertiary",
				children: "Open this file in the desktop app to give the AI a folder."
			})
		});
		$[16] = isElectron;
		$[17] = t6;
	} else t6 = $[17];
	let t7;
	if ($[18] !== t3 || $[19] !== t4 || $[20] !== t5 || $[21] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
			title: "Folders the AI can open",
			description: "The AI can read and change any file inside these folders. That's how it imports your design system or your components. Everything else on your computer stays off limits.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 w-full",
				children: [
					t3,
					t4,
					t5,
					t6
				]
			})
		});
		$[18] = t3;
		$[19] = t4;
		$[20] = t5;
		$[21] = t6;
		$[22] = t7;
	} else t7 = $[22];
	let t8;
	if ($[23] !== t2 || $[24] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-6",
			children: [t2, t7]
		});
		$[23] = t2;
		$[24] = t7;
		$[25] = t8;
	} else t8 = $[25];
	return t8;
}

export { AIChatSettings };
