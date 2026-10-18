// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/ContextMenuV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { FolderIcon, FolderPlusIcon, OverflowSettingsIcon, PaperclipIcon, PinIcon, PlugsIcon, PlusIcon, SparkleIcon, TerminalIcon, XIcon } from "../../../../../ui/src/icons.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../../../../../ui/src/components/DropdownMenu.js";
import { IconBtn } from "../panels/styles/primitives.js";
import { connectionDisplayName } from "../../hooks/useClaudeContext.js";
import { pickFolder } from "../ChatContextControls.js";

function folderLabel(path) {
	return path.split("/").filter(Boolean).pop() ?? path;
}
function AddLocalFolderMenuItem(t0) {
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
function FolderMenuItems(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { folders, onAdd, onRemove } = t0;
	let t1;
	if ($[0] !== folders || $[1] !== onRemove) {
		t1 = folders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [folders.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			className: "group/folder",
			onSelect: _temp$32,
			title: path,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate",
					children: folderLabel(path)
				}),
				onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					appearance: "inline",
					label: `Remove ${folderLabel(path)}`,
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
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddLocalFolderMenuItem, { onAdd });
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
/** The agents-v2 composer's `+` menu: things you add to this message. */
function _temp$32(e) {
	return e.preventDefault();
}
function ContextMenuV2(t0) {
	const $ = (0, import_compiler_runtime.c)(36);
	const { folders, onAddFolder, onRemoveFolder, onAttach, onPinSelection, onOpenSkills, mcpServers, onLoadMcpServers, selectedConnections, onConnectionChange, mcpCommand, onRunInTerminal } = t0;
	const pendingOnClose = (0, import_react.useRef)(null);
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
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = (event) => {
			const run = pendingOnClose.current;
			if (!run) return;
			pendingOnClose.current = null;
			event.preventDefault();
			run();
		};
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperclipIcon, {});
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add attachment" });
		$[2] = t3;
		$[3] = t4;
	} else {
		t3 = $[2];
		t4 = $[3];
	}
	let t5;
	if ($[4] !== onAttach) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onAttach,
			children: [t3, t4]
		});
		$[4] = onAttach;
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== folders || $[7] !== onAddFolder || $[8] !== onRemoveFolder) {
		t6 = folders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddLocalFolderMenuItem, { onAdd: onAddFolder }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Local folders" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: "min-w-48",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderMenuItems, {
				folders,
				onAdd: onAddFolder,
				onRemove: onRemoveFolder
			})
		})] });
		$[6] = folders;
		$[7] = onAddFolder;
		$[8] = onRemoveFolder;
		$[9] = t6;
	} else t6 = $[9];
	const t7 = !onPinSelection;
	let t10;
	let t8;
	let t9;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinIcon, {});
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1",
			children: "Insert selection in prompt"
		});
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: "⌘L" });
		$[10] = t10;
		$[11] = t8;
		$[12] = t9;
	} else {
		t10 = $[10];
		t8 = $[11];
		t9 = $[12];
	}
	let t11;
	if ($[13] !== onPinSelection || $[14] !== t7) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onPinSelection,
			disabled: t7,
			children: [
				t8,
				t9,
				t10
			]
		});
		$[13] = onPinSelection;
		$[14] = t7;
		$[15] = t11;
	} else t11 = $[15];
	let t12;
	if ($[16] !== onOpenSkills) {
		t12 = () => {
			pendingOnClose.current = onOpenSkills;
		};
		$[16] = onOpenSkills;
		$[17] = t12;
	} else t12 = $[17];
	let t13;
	let t14;
	let t15;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkleIcon, {});
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1",
			children: "Skills"
		});
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: "/" });
		$[18] = t13;
		$[19] = t14;
		$[20] = t15;
	} else {
		t13 = $[18];
		t14 = $[19];
		t15 = $[20];
	}
	let t16;
	if ($[21] !== t12) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: t12,
			children: [
				t13,
				t14,
				t15
			]
		});
		$[21] = t12;
		$[22] = t16;
	} else t16 = $[22];
	let t17;
	if ($[23] !== mcpCommand || $[24] !== mcpServers || $[25] !== onConnectionChange || $[26] !== onLoadMcpServers || $[27] !== onRunInTerminal || $[28] !== selectedConnections) {
		t17 = mcpServers !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionsMenu, {
			list: mcpServers,
			onOpen: onLoadMcpServers,
			selectedConnections,
			onConnectionChange: (server, selected) => {
				pendingOnClose.current = () => onConnectionChange(server, selected);
			},
			manageCommand: mcpCommand,
			onRunCommand: (command) => {
				pendingOnClose.current = () => onRunInTerminal(command);
			}
		})] });
		$[23] = mcpCommand;
		$[24] = mcpServers;
		$[25] = onConnectionChange;
		$[26] = onLoadMcpServers;
		$[27] = onRunInTerminal;
		$[28] = selectedConnections;
		$[29] = t17;
	} else t17 = $[29];
	let t18;
	if ($[30] !== t11 || $[31] !== t16 || $[32] !== t17 || $[33] !== t5 || $[34] !== t6) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
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
				t16,
				t17
			]
		})] });
		$[30] = t11;
		$[31] = t16;
		$[32] = t17;
		$[33] = t5;
		$[34] = t6;
		$[35] = t18;
	} else t18 = $[35];
	return t18;
}
/** The selected agent's MCP servers. Opening the submenu re-asks; the last list shows at once. */
function ConnectionsMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { list, onOpen, selectedConnections, onConnectionChange, manageCommand, onRunCommand } = t0;
	const unavailable = list?.unavailable;
	const installCommand = unavailable?.installCommand;
	let t1;
	if ($[0] !== onOpen) {
		t1 = (open) => {
			if (open) onOpen?.();
		};
		$[0] = onOpen;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlugsIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Connections" })] });
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== list || $[4] !== onConnectionChange || $[5] !== selectedConnections || $[6] !== unavailable) {
		t3 = list === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-2 py-1 text-ed-muted-foreground",
			children: "Asking the agent…"
		}) : unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-56 px-2 py-1 leading-snug text-ed-muted-foreground",
			children: unavailable.message
		}) : list.servers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-56 px-2 py-1 leading-snug text-ed-muted-foreground",
			children: "This agent has no MCP servers set up yet."
		}) : list.servers.map((server) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			checked: selectedConnections.includes(server.name),
			onCheckedChange: (selected) => onConnectionChange(server, selected === true),
			className: "gap-2",
			title: server.name,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: connectionDisplayName(server)
			})
		}, server.name));
		$[3] = list;
		$[4] = onConnectionChange;
		$[5] = selectedConnections;
		$[6] = unavailable;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== installCommand || $[9] !== manageCommand || $[10] !== onRunCommand || $[11] !== unavailable) {
		t4 = unavailable ? installCommand && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: () => onRunCommand(installCommand),
			title: installCommand,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Install in terminal" })]
		})] }) : manageCommand && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: () => onRunCommand(manageCommand),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Manage connections" })]
		})] });
		$[8] = installCommand;
		$[9] = manageCommand;
		$[10] = onRunCommand;
		$[11] = unavailable;
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== t3 || $[14] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubContent, {
			className: "min-w-48",
			children: [t3, t4]
		});
		$[13] = t3;
		$[14] = t4;
		$[15] = t5;
	} else t5 = $[15];
	let t6;
	if ($[16] !== t1 || $[17] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, {
			onOpenChange: t1,
			children: [t2, t5]
		});
		$[16] = t1;
		$[17] = t5;
		$[18] = t6;
	} else t6 = $[18];
	return t6;
}

export { ContextMenuV2 };
