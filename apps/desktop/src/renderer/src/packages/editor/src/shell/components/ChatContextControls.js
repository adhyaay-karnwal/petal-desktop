// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ChatContextControls.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { ClaudeIcon, FolderIcon, FolderPlusIcon, LockIcon, OverflowSettingsIcon, PaperclipIcon, PinIcon, PlugsIcon, PlusIcon, SparkleIcon, XIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { IconBtn } from "./panels/styles/primitives.js";
import { getClaudeEffortLevels, resolveClaudeEffort } from "../../../../compiler/src/codegen/claudeEffort.js";
import { connectionDisplayName, fetchClaudeConnections } from "../hooks/useClaudeContext.js";

/** Shared look for the context chips above the composer text. */
var CHIP_CLASS = "inline-flex h-6 max-w-full items-center gap-1 rounded-[5px] border border-ed-border bg-transparent text-ed-chat font-normal text-ed-foreground";
var CHAT_MODELS = [
	{
		id: "claude-fable-5-1",
		label: "Fable 5.1",
		featured: true
	},
	{
		id: "claude-fable-5",
		label: "Fable 5"
	},
	{
		id: "claude-opus-5-5",
		label: "Opus 5.5",
		featured: true
	},
	{
		id: "claude-opus-5",
		label: "Opus 5",
		featured: true
	},
	{
		id: "claude-opus-4-8",
		label: "Opus 4.8"
	},
	{
		id: "claude-opus-4-7",
		label: "Opus 4.7"
	},
	{
		id: "claude-opus-4-6",
		label: "Opus 4.6"
	},
	{
		id: "claude-sonnet-5",
		label: "Sonnet 5",
		featured: true
	},
	{
		id: "claude-sonnet-4-6",
		label: "Sonnet 4.6"
	},
	{
		id: "claude-sonnet-4-5",
		label: "Sonnet 4.5"
	},
	{
		id: "claude-haiku-4-5",
		label: "Haiku 4.5",
		featured: true
	}
];
function folderLabel$1(path) {
	return path.split("/").filter(Boolean).pop() ?? path;
}
async function pickFolder() {
	try {
		const result = await window.api?.invoke?.("pick_folder");
		return typeof result?.path === "string" ? result.path : null;
	} catch {
		return null;
	}
}
function ContextChipRemoveButton(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { label, onRemove } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-2.5" });
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== label || $[2] !== onRemove) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			appearance: "inline",
			label,
			className: "ed-context-chip-remove relative z-10 -mr-1 size-4",
			onClick: onRemove,
			children: t1
		});
		$[1] = label;
		$[2] = onRemove;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
}
/** One item of message context: a canvas selection, a pinned element, a file, an image. */
function ContextChip(t0) {
	const $ = (0, import_compiler_runtime.c)(38);
	const { icon: Icon, iconContent, label, title, onClick, onRemove, className, variant: t1 } = t0;
	const variant = t1 === void 0 ? "default" : t1;
	let content;
	let t2;
	let t3;
	let t4;
	if ($[0] !== Icon || $[1] !== className || $[2] !== iconContent || $[3] !== label || $[4] !== onClick || $[5] !== onRemove || $[6] !== title || $[7] !== variant) {
		t4 = Symbol.for("react.early_return_sentinel");
		bb0: {
			const chipClassName = cn$2(className, variant === "segment" && "ed-context-chip-segment");
			let t5;
			if ($[12] !== Icon || $[13] !== iconContent) {
				t5 = (iconContent || Icon) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ed-context-chip-icon inline-flex shrink-0",
					children: iconContent ?? (Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						width: 14,
						height: 14,
						className: "size-3.5 shrink-0 text-ed-muted-foreground"
					}))
				});
				$[12] = Icon;
				$[13] = iconContent;
				$[14] = t5;
			} else t5 = $[14];
			let t6;
			if ($[15] !== label) {
				t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children: label
				});
				$[15] = label;
				$[16] = t6;
			} else t6 = $[16];
			let t7;
			if ($[17] !== t5 || $[18] !== t6) {
				t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t5, t6] });
				$[17] = t5;
				$[18] = t6;
				$[19] = t7;
			} else t7 = $[19];
			content = t7;
			if (onClick && onRemove) {
				const t8 = title ?? label;
				const t9 = title || label;
				let t10;
				if ($[20] !== onClick || $[21] !== t8 || $[22] !== t9) {
					t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "xs",
						isChildText: false,
						className: "absolute inset-0 h-full w-full rounded-[inherit] bg-transparent! hover:bg-transparent! active:bg-transparent!",
						title: t8,
						"aria-label": t9,
						onClick
					});
					$[20] = onClick;
					$[21] = t8;
					$[22] = t9;
					$[23] = t10;
				} else t10 = $[23];
				let t11;
				if ($[24] !== content) {
					t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pointer-events-none relative inline-flex min-w-0 items-center gap-1",
						children: content
					});
					$[24] = content;
					$[25] = t11;
				} else t11 = $[25];
				const t12 = `Remove ${label}`;
				let t13;
				if ($[26] !== onRemove || $[27] !== t12) {
					t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChipRemoveButton, {
						label: t12,
						onRemove
					});
					$[26] = onRemove;
					$[27] = t12;
					$[28] = t13;
				} else t13 = $[28];
				t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-removable": true,
					className: cn$2(CHIP_CLASS, "ed-context-chip ed-context-chip-interactive relative", chipClassName),
					children: [
						t10,
						t11,
						t13
					]
				});
				break bb0;
			}
			if (onClick) {
				t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "xs",
					isChildText: false,
					className: cn$2(CHIP_CLASS, "ed-context-chip ed-context-chip-interactive", chipClassName),
					title: title ?? label,
					"aria-label": title || label,
					onClick,
					children: content
				});
				break bb0;
			}
			t2 = onRemove ? true : void 0;
			t3 = cn$2(CHIP_CLASS, "ed-context-chip", chipClassName);
		}
		$[0] = Icon;
		$[1] = className;
		$[2] = iconContent;
		$[3] = label;
		$[4] = onClick;
		$[5] = onRemove;
		$[6] = title;
		$[7] = variant;
		$[8] = content;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
	} else {
		content = $[8];
		t2 = $[9];
		t3 = $[10];
		t4 = $[11];
	}
	if (t4 !== Symbol.for("react.early_return_sentinel")) return t4;
	const t5 = title ?? label;
	let t6;
	if ($[29] !== label || $[30] !== onRemove) {
		t6 = onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChipRemoveButton, {
			label: `Remove ${label}`,
			onRemove
		});
		$[29] = label;
		$[30] = onRemove;
		$[31] = t6;
	} else t6 = $[31];
	let t7;
	if ($[32] !== content || $[33] !== t2 || $[34] !== t3 || $[35] !== t5 || $[36] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"data-removable": t2,
			className: t3,
			title: t5,
			children: [content, t6]
		});
		$[32] = content;
		$[33] = t2;
		$[34] = t3;
		$[35] = t5;
		$[36] = t6;
		$[37] = t7;
	} else t7 = $[37];
	return t7;
}
function AddLocalFolderMenuItem$1(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { onAdd } = t0;
	let t1;
	if ($[0] !== onAdd) {
		t1 = async () => {
			const path = await pickFolder();
			if (path) onAdd?.(path);
		};
		$[0] = onAdd;
		$[1] = t1;
	} else t1 = $[1];
	const handleAdd = t1;
	let t2;
	if ($[2] !== handleAdd) {
		t2 = () => void handleAdd();
		$[2] = handleAdd;
		$[3] = t2;
	} else t2 = $[3];
	const t3 = !onAdd;
	let t4;
	let t5;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlusIcon, {});
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add local folder" });
		$[4] = t4;
		$[5] = t5;
	} else {
		t4 = $[4];
		t5 = $[5];
	}
	let t6;
	if ($[6] !== t2 || $[7] !== t3) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: t2,
			disabled: t3,
			children: [t4, t5]
		});
		$[6] = t2;
		$[7] = t3;
		$[8] = t6;
	} else t6 = $[8];
	return t6;
}
/** Attached folders and their controls in the add menu. */
function FolderMenuItems$1(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { folders, onAdd, onRemove } = t0;
	let t1;
	if ($[0] !== folders || $[1] !== onRemove) {
		t1 = folders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [folders.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			className: "group/folder",
			onSelect: _temp$45,
			title: path,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate",
					children: folderLabel$1(path)
				}),
				onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					appearance: "inline",
					label: `Remove ${folderLabel$1(path)}`,
					className: "-mr-1 text-ed-muted-foreground opacity-0 group-hover/folder:opacity-100 group-focus-visible/folder:opacity-100 focus-visible:opacity-100",
					onClick: (e_0) => {
						e_0.stopPropagation();
						onRemove(path);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {})
				})
			]
		}, path)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {})] });
		$[0] = folders;
		$[1] = onRemove;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== onAdd) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddLocalFolderMenuItem$1, { onAdd });
		$[3] = onAdd;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-56 px-2 pb-1 pt-1.5 leading-snug text-ed-muted-foreground",
			children: "The agent can read and edit files in these folders."
		});
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t1 || $[7] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t1,
			t2,
			t3
		] });
		$[6] = t1;
		$[7] = t2;
		$[8] = t4;
	} else t4 = $[8];
	return t4;
}
/** One chip opens setup for all attached folders; its separate X clears the group. */
function _temp$45(e) {
	return e.preventDefault();
}
function FolderChip(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { folders, onAdd, onRemove, onClear } = t0;
	if (folders.length === 0) return null;
	let t1;
	if ($[0] !== folders[0]) {
		t1 = folderLabel$1(folders[0]);
		$[0] = folders[0];
		$[1] = t1;
	} else t1 = $[1];
	const label = t1;
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = cn$2(CHIP_CLASS, "pr-1.5 hover:bg-ed-chat-surface/80");
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== folders) {
		t3 = folders.join("\n");
		$[3] = folders;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, { className: "size-3.5 shrink-0 text-ed-muted-foreground" });
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== label) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: label
		});
		$[6] = label;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== folders.length) {
		t6 = folders.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "shrink-0 text-ed-muted-foreground",
			children: ["+", folders.length - 1]
		});
		$[8] = folders.length;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== t3 || $[11] !== t5 || $[12] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "xs",
				isChildText: false,
				className: "h-full min-w-0 shrink justify-start hover:bg-transparent has-[>svg]:pl-1 has-[>svg]:pr-0",
				"aria-label": "Local folders",
				title: t3,
				children: [
					t4,
					t5,
					t6
				]
			})
		});
		$[10] = t3;
		$[11] = t5;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== folders || $[15] !== onAdd || $[16] !== onRemove) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			restoreFocusOnPointerDismiss: false,
			align: "start",
			side: "top",
			sideOffset: 4,
			className: "min-w-48",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderMenuItems$1, {
				folders,
				onAdd,
				onRemove
			})
		});
		$[14] = folders;
		$[15] = onAdd;
		$[16] = onRemove;
		$[17] = t8;
	} else t8 = $[17];
	let t9;
	if ($[18] !== t7 || $[19] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t7, t8] });
		$[18] = t7;
		$[19] = t8;
		$[20] = t9;
	} else t9 = $[20];
	let t10;
	if ($[21] !== onClear) {
		t10 = onClear && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChipRemoveButton, {
			label: "Remove local folders",
			onRemove: onClear
		});
		$[21] = onClear;
		$[22] = t10;
	} else t10 = $[22];
	let t11;
	if ($[23] !== t10 || $[24] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"data-ph-block": true,
			className: t2,
			children: [t9, t10]
		});
		$[23] = t10;
		$[24] = t9;
		$[25] = t11;
	} else t11 = $[25];
	return t11;
}
/** The composer's `+` menu: things you add to this message. */
function ContextMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	const { folders, onAddFolder, onRemoveFolder, onAttach, onPinSelection, onOpenSkills, selectedConnections, onConnectionChange } = t0;
	const openSkillsOnClose = (0, import_react.useRef)(false);
	const manageConnectionsOnClose = (0, import_react.useRef)(false);
	const connectionOnClose = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Add to message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
			})
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== onConnectionChange || $[2] !== onOpenSkills) {
		t2 = (event) => {
			if (manageConnectionsOnClose.current) {
				manageConnectionsOnClose.current = false;
				event.preventDefault();
				window.dispatchEvent(new Event("petal-manage-connections"));
				return;
			}
			const pendingConnection = connectionOnClose.current;
			if (pendingConnection) {
				connectionOnClose.current = null;
				event.preventDefault();
				onConnectionChange(pendingConnection.connection, pendingConnection.selected);
				return;
			}
			if (!openSkillsOnClose.current) return;
			openSkillsOnClose.current = false;
			event.preventDefault();
			onOpenSkills();
		};
		$[1] = onConnectionChange;
		$[2] = onOpenSkills;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperclipIcon, {});
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add attachment" });
		$[4] = t3;
		$[5] = t4;
	} else {
		t3 = $[4];
		t4 = $[5];
	}
	let t5;
	if ($[6] !== onAttach) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onAttach,
			children: [t3, t4]
		});
		$[6] = onAttach;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== folders || $[9] !== onAddFolder || $[10] !== onRemoveFolder) {
		t6 = folders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddLocalFolderMenuItem$1, { onAdd: onAddFolder }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Local folders" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: "min-w-48",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderMenuItems$1, {
				folders,
				onAdd: onAddFolder,
				onRemove: onRemoveFolder
			})
		})] });
		$[8] = folders;
		$[9] = onAddFolder;
		$[10] = onRemoveFolder;
		$[11] = t6;
	} else t6 = $[11];
	const t7 = !onPinSelection;
	let t10;
	let t8;
	let t9;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinIcon, {});
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1",
			children: "Insert selection in prompt"
		});
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: "⌘L" });
		$[12] = t10;
		$[13] = t8;
		$[14] = t9;
	} else {
		t10 = $[12];
		t8 = $[13];
		t9 = $[14];
	}
	let t11;
	if ($[15] !== onPinSelection || $[16] !== t7) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onPinSelection,
			disabled: t7,
			children: [
				t8,
				t9,
				t10
			]
		});
		$[15] = onPinSelection;
		$[16] = t7;
		$[17] = t11;
	} else t11 = $[17];
	let t12;
	let t13;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: () => {
				openSkillsOnClose.current = true;
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1",
					children: "Skills"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: "/" })
			]
		});
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[18] = t12;
		$[19] = t13;
	} else {
		t12 = $[18];
		t13 = $[19];
	}
	let t14;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => {
			manageConnectionsOnClose.current = true;
		};
		$[20] = t14;
	} else t14 = $[20];
	let t15;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = (connection, selected) => {
			connectionOnClose.current = {
				connection,
				selected
			};
		};
		$[21] = t15;
	} else t15 = $[21];
	let t16;
	if ($[22] !== folders || $[23] !== selectedConnections) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionsMenu$1, {
			folders,
			onManage: t14,
			selectedConnections,
			onConnectionChange: t15
		});
		$[22] = folders;
		$[23] = selectedConnections;
		$[24] = t16;
	} else t16 = $[24];
	let t17;
	if ($[25] !== t11 || $[26] !== t16 || $[27] !== t2 || $[28] !== t5 || $[29] !== t6) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			restoreFocusOnPointerDismiss: false,
			align: "start",
			side: "top",
			sideOffset: 4,
			className: "min-w-48",
			onCloseAutoFocus: t2,
			children: [
				t5,
				t6,
				t11,
				t12,
				t13,
				t16
			]
		})] });
		$[25] = t11;
		$[26] = t16;
		$[27] = t2;
		$[28] = t5;
		$[29] = t6;
		$[30] = t17;
	} else t17 = $[30];
	return t17;
}
function ModelPicker(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	let model;
	let onModelChange;
	let settings;
	if ($[0] !== t0) {
		({model, onModelChange, ...settings} = t0);
		$[0] = t0;
		$[1] = model;
		$[2] = onModelChange;
		$[3] = settings;
	} else {
		model = $[1];
		onModelChange = $[2];
		settings = $[3];
	}
	let t1;
	if ($[4] !== model) {
		t1 = CHAT_MODELS.find((entry) => entry.id === model)?.label ?? model;
		$[4] = model;
		$[5] = t1;
	} else t1 = $[5];
	const label = t1;
	const t2 = `Model: ${label}`;
	let t3;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeIcon, { className: "size-4" });
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== label) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		});
		$[7] = label;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== t2 || $[10] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "xs",
				isChildText: false,
				className: "min-w-0 shrink px-1 text-ed-muted-foreground",
				"aria-label": t2,
				title: "Model",
				children: [t3, t4]
			})
		});
		$[9] = t2;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = CHAT_MODELS.filter(_temp2$28).map(_temp3$21);
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== model || $[14] !== onModelChange) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
			value: model,
			onValueChange: onModelChange,
			children: t6
		});
		$[13] = model;
		$[14] = onModelChange;
		$[15] = t7;
	} else t7 = $[15];
	let t8;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubTrigger, { children: "More models" });
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = CHAT_MODELS.filter(_temp4$21).map(_temp5$19);
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== model || $[19] !== onModelChange) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t8, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: "min-w-40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
				value: model,
				onValueChange: onModelChange,
				children: t9
			})
		})] });
		$[18] = model;
		$[19] = onModelChange;
		$[20] = t10;
	} else t10 = $[20];
	let t11;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== settings) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionsMenu$1, { ...settings });
		$[22] = settings;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== t10 || $[25] !== t12 || $[26] !== t7) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			restoreFocusOnPointerDismiss: false,
			align: "start",
			side: "top",
			sideOffset: 4,
			className: "min-w-48",
			children: [
				t7,
				t10,
				t11,
				t12
			]
		});
		$[24] = t10;
		$[25] = t12;
		$[26] = t7;
		$[27] = t13;
	} else t13 = $[27];
	let t14;
	if ($[28] !== t13 || $[29] !== t5) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t5, t13] });
		$[28] = t13;
		$[29] = t5;
		$[30] = t14;
	} else t14 = $[30];
	return t14;
}
function _temp5$19(entry_3) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: entry_3.id,
		className: "data-[state=checked]:bg-ed-accent",
		children: entry_3.label
	}, entry_3.id);
}
function _temp4$21(entry_2) {
	return !entry_2.featured;
}
function _temp3$21(entry_1) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: entry_1.id,
		className: "data-[state=checked]:bg-ed-accent",
		children: entry_1.label
	}, entry_1.id);
}
function _temp2$28(entry_0) {
	return entry_0.featured;
}
var EFFORT_LABELS = {
	low: "Low",
	medium: "Medium",
	high: "High",
	xhigh: "Extra High",
	max: "Max",
	ultracode: "Ultracode"
};
var PERMISSION_MODES$1 = [{
	value: "auto",
	label: "Auto",
	icon: SparkleIcon,
	description: "Approve routine actions automatically. Ask when needed."
}, {
	value: "ask",
	label: "Ask first",
	icon: LockIcon,
	description: "Ask before using tools that are not already allowed."
}];
function PermissionsMenu$1(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { autoApprove, onAutoApproveChange } = t0;
	const mode = PERMISSION_MODES$1[autoApprove ? 0 : 1];
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubTrigger, { children: "Permissions" });
		$[0] = t1;
	} else t1 = $[0];
	const t2 = mode.value;
	let t3;
	if ($[1] !== onAutoApproveChange) {
		t3 = (value) => onAutoApproveChange(value === "auto");
		$[1] = onAutoApproveChange;
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = PERMISSION_MODES$1.map(_temp6$14);
		$[3] = t4;
	} else t4 = $[3];
	let t5;
	if ($[4] !== mode.value || $[5] !== t3) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: "w-64",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
				"aria-label": "Permissions",
				value: t2,
				onValueChange: t3,
				children: t4
			})
		})] });
		$[4] = mode.value;
		$[5] = t3;
		$[6] = t5;
	} else t5 = $[6];
	return t5;
}
function _temp6$14(t0) {
	const { value: value_0, label, icon: Icon, description } = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: value_0,
		className: "h-auto items-start gap-2 py-2 data-[state=checked]:bg-ed-accent",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0 text-ed-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 leading-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-ed-muted-foreground",
					children: description
				})]
			})]
		})
	}, value_0);
}
function EffortPicker(t0) {
	const $ = (0, import_compiler_runtime.c)(45);
	const { model, effort, onEffortChange } = t0;
	let T0;
	let T1;
	let T2;
	let t1;
	let t10;
	let t11;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[0] !== effort || $[1] !== model || $[2] !== onEffortChange) {
		t11 = Symbol.for("react.early_return_sentinel");
		bb0: {
			const levels = getClaudeEffortLevels(model);
			let t12;
			if ($[17] !== effort || $[18] !== model) {
				t12 = resolveClaudeEffort(model, effort);
				$[17] = effort;
				$[18] = model;
				$[19] = t12;
			} else t12 = $[19];
			const effectiveEffort = t12;
			if (!effectiveEffort) {
				t11 = null;
				break bb0;
			}
			const label = EFFORT_LABELS[effectiveEffort];
			T2 = DropdownMenu;
			const t13 = `Effort: ${label}`;
			let t14;
			if ($[20] !== label) {
				t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label });
				$[20] = label;
				$[21] = t14;
			} else t14 = $[21];
			if ($[22] !== t13 || $[23] !== t14) {
				t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "xs",
						isChildText: false,
						className: "px-1 text-ed-muted-foreground",
						"aria-label": t13,
						title: "Reasoning effort",
						children: t14
					})
				});
				$[22] = t13;
				$[23] = t14;
				$[24] = t10;
			} else t10 = $[24];
			T1 = DropdownMenuContent;
			t5 = false;
			t6 = "start";
			t7 = "top";
			t8 = 4;
			t9 = "min-w-40";
			T0 = DropdownMenuRadioGroup;
			t1 = "Effort";
			t2 = effectiveEffort;
			if ($[25] !== onEffortChange) {
				t3 = (value) => onEffortChange(value);
				$[25] = onEffortChange;
				$[26] = t3;
			} else t3 = $[26];
			t4 = levels.map(_temp7$12);
		}
		$[0] = effort;
		$[1] = model;
		$[2] = onEffortChange;
		$[3] = T0;
		$[4] = T1;
		$[5] = T2;
		$[6] = t1;
		$[7] = t10;
		$[8] = t11;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
		$[12] = t5;
		$[13] = t6;
		$[14] = t7;
		$[15] = t8;
		$[16] = t9;
	} else {
		T0 = $[3];
		T1 = $[4];
		T2 = $[5];
		t1 = $[6];
		t10 = $[7];
		t11 = $[8];
		t2 = $[9];
		t3 = $[10];
		t4 = $[11];
		t5 = $[12];
		t6 = $[13];
		t7 = $[14];
		t8 = $[15];
		t9 = $[16];
	}
	if (t11 !== Symbol.for("react.early_return_sentinel")) return t11;
	let t12;
	if ($[27] !== T0 || $[28] !== t1 || $[29] !== t2 || $[30] !== t3 || $[31] !== t4) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			"aria-label": t1,
			value: t2,
			onValueChange: t3,
			children: t4
		});
		$[27] = T0;
		$[28] = t1;
		$[29] = t2;
		$[30] = t3;
		$[31] = t4;
		$[32] = t12;
	} else t12 = $[32];
	let t13;
	if ($[33] !== T1 || $[34] !== t12 || $[35] !== t5 || $[36] !== t6 || $[37] !== t7 || $[38] !== t8 || $[39] !== t9) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T1, {
			restoreFocusOnPointerDismiss: t5,
			align: t6,
			side: t7,
			sideOffset: t8,
			className: t9,
			children: t12
		});
		$[33] = T1;
		$[34] = t12;
		$[35] = t5;
		$[36] = t6;
		$[37] = t7;
		$[38] = t8;
		$[39] = t9;
		$[40] = t13;
	} else t13 = $[40];
	let t14;
	if ($[41] !== T2 || $[42] !== t10 || $[43] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T2, { children: [t10, t13] });
		$[41] = T2;
		$[42] = t10;
		$[43] = t13;
		$[44] = t14;
	} else t14 = $[44];
	return t14;
}
/**
* Connections are read from the
* user's Claude Code config, so the list is the same one the terminal has.
*/
function _temp7$12(level) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: level,
		className: "data-[state=checked]:bg-ed-accent",
		children: EFFORT_LABELS[level]
	}, level);
}
function ConnectionsMenu$1(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { folders, selectedConnections, onConnectionChange, onManage } = t0;
	const [connections, setConnections] = (0, import_react.useState)(null);
	const cwd = folders[0];
	let t1;
	if ($[0] !== cwd) {
		t1 = async () => {
			setConnections(await fetchClaudeConnections(cwd));
		};
		$[0] = cwd;
		$[1] = t1;
	} else t1 = $[1];
	const load = t1;
	let t2;
	if ($[2] !== load) {
		t2 = (open) => {
			if (open) load();
		};
		$[2] = load;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlugsIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Connections" })] });
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== connections || $[6] !== onConnectionChange || $[7] !== selectedConnections) {
		t4 = connections === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-2 py-1 text-ed-muted-foreground",
			children: "Reading your Claude config…"
		}) : connections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-56 px-2 py-1 leading-snug text-ed-muted-foreground",
			children: "No MCP servers in your Claude Code config yet."
		}) : connections.map((connection) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			checked: selectedConnections.includes(connection.name),
			onCheckedChange: (selected) => onConnectionChange(connection, selected === true),
			className: "gap-2",
			title: connection.name,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: connectionDisplayName(connection)
			})
		}, connection.name));
		$[5] = connections;
		$[6] = onConnectionChange;
		$[7] = selectedConnections;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	let t7;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {});
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Manage connections" });
		$[10] = t6;
		$[11] = t7;
	} else {
		t6 = $[10];
		t7 = $[11];
	}
	let t8;
	if ($[12] !== onManage) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onManage,
			children: [t6, t7]
		});
		$[12] = onManage;
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== t4 || $[15] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubContent, {
			className: "min-w-48",
			children: [
				t4,
				t5,
				t8
			]
		});
		$[14] = t4;
		$[15] = t8;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== t2 || $[18] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, {
			onOpenChange: t2,
			children: [t3, t9]
		});
		$[17] = t2;
		$[18] = t9;
		$[19] = t10;
	} else t10 = $[19];
	return t10;
}

export { ContextChip, ContextMenu, EffortPicker, FolderChip, ModelPicker, pickFolder };
