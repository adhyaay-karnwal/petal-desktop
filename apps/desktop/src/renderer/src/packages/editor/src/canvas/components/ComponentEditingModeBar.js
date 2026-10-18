// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/ComponentEditingModeBar.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CaretDownIcon, PencilIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { ButtonGroup } from "../../../../ui/src/components/ButtonGroup.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { n$16 } from "../../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";

/**
* Global mode strip shown above CanvasToolbar while a pink edit-root is
* selected. Uses ed-* tokens and @petal/ui controls.
*/
function ComponentEditingModeBar(t0) {
	const $ = (0, import_compiler_runtime.c)(62);
	const { componentName, filePath, isPreparing, onSave, onCancel } = t0;
	const [notesOpen, setNotesOpen] = (0, import_react.useState)(false);
	const [notes, setNotes] = (0, import_react.useState)("");
	const [notesForOpen, setNotesForOpen] = (0, import_react.useState)(false);
	if (notesOpen !== notesForOpen) {
		setNotesForOpen(notesOpen);
		if (notesOpen) setNotes("");
	}
	let t1;
	if ($[0] !== filePath) {
		t1 = filePath ? filePath.replace(/^.*\/(components\/|src\/)/, "$1") : void 0;
		$[0] = filePath;
		$[1] = t1;
	} else t1 = $[1];
	const shortPath = t1;
	let t2;
	if ($[2] !== notes || $[3] !== onSave) {
		t2 = () => {
			const trimmed = notes.trim();
			setNotesOpen(false);
			onSave(trimmed || void 0);
		};
		$[2] = notes;
		$[3] = onSave;
		$[4] = t2;
	} else t2 = $[4];
	const submitWithNotes = t2;
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = {
			height: 52,
			paddingLeft: 10,
			paddingRight: 10,
			borderRadius: 12,
			minWidth: 320,
			maxWidth: 560
		};
		$[5] = t3;
	} else t3 = $[5];
	const t4 = `Editing component ${componentName}`;
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-6 shrink-0 items-center justify-center rounded-md border border-ed-canvas-component-edit/40 bg-ed-canvas-component-edit/10 text-ed-canvas-component-edit",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$16, {
				size: 14,
				weight: "bold"
			})
		});
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== componentName) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "truncate text-xs font-medium text-ed-foreground",
			children: [
				"Editing component",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: componentName
				})
			]
		});
		$[7] = componentName;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== shortPath) {
		t7 = shortPath && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "truncate font-mono text-[10px] text-ed-muted-foreground",
			children: shortPath
		});
		$[9] = shortPath;
		$[10] = t7;
	} else t7 = $[10];
	let t8;
	if ($[11] !== t6 || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 items-center gap-2",
			children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [t6, t7]
			})]
		});
		$[11] = t6;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== isPreparing || $[15] !== onCancel) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			className: "h-7 px-2 text-xs text-ed-muted-foreground hover:text-ed-foreground",
			onClick: onCancel,
			disabled: isPreparing,
			children: "Discard"
		});
		$[14] = isPreparing;
		$[15] = onCancel;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== onSave) {
		t10 = () => onSave();
		$[17] = onSave;
		$[18] = t10;
	} else t10 = $[18];
	const t11 = isPreparing ? "Saving…" : "Save";
	let t12;
	if ($[19] !== isPreparing || $[20] !== t10 || $[21] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			className: "h-7 px-2.5 text-xs",
			onClick: t10,
			disabled: isPreparing,
			children: t11
		});
		$[19] = isPreparing;
		$[20] = t10;
		$[21] = t11;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {
			width: 12,
			height: 12
		});
		$[23] = t13;
	} else t13 = $[23];
	let t14;
	if ($[24] !== isPreparing) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				className: "h-7 px-1.5",
				disabled: isPreparing,
				"aria-label": "More save options",
				children: t13
			})
		});
		$[24] = isPreparing;
		$[25] = t14;
	} else t14 = $[25];
	let t15;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "end",
			className: "min-w-[200px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => setNotesOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilIcon, {
					width: 16,
					height: 16,
					className: "text-ed-muted-foreground"
				}), "Save with instructions…"]
			})
		});
		$[26] = t15;
	} else t15 = $[26];
	let t16;
	if ($[27] !== t14) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			modal: false,
			children: [t14, t15]
		});
		$[27] = t14;
		$[28] = t16;
	} else t16 = $[28];
	let t17;
	if ($[29] !== t12 || $[30] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ButtonGroup, { children: [t12, t16] });
		$[29] = t12;
		$[30] = t16;
		$[31] = t17;
	} else t17 = $[31];
	let t18;
	if ($[32] !== t17 || $[33] !== t9) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-2",
			children: [t9, t17]
		});
		$[32] = t17;
		$[33] = t9;
		$[34] = t18;
	} else t18 = $[34];
	let t19;
	if ($[35] !== t18 || $[36] !== t4 || $[37] !== t8) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex items-center gap-2 border border-ed-border bg-ed-background shadow-lg",
			style: t3,
			role: "status",
			"aria-label": t4,
			children: [t8, t18]
		});
		$[35] = t18;
		$[36] = t4;
		$[37] = t8;
		$[38] = t19;
	} else t19 = $[38];
	let t20;
	if ($[39] !== componentName) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Save ", componentName] }) });
		$[39] = componentName;
		$[40] = t20;
	} else t20 = $[40];
	let t21;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Optional notes for the merge, for example only update the user-message branch, keep hooks, or explain runtime state." })
		});
		$[41] = t21;
	} else t21 = $[41];
	let t22;
	if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = (e) => setNotes(e.target.value);
		$[42] = t22;
	} else t22 = $[42];
	let t23;
	if ($[43] !== submitWithNotes) {
		t23 = (e_0) => {
			if (e_0.key === "Enter" && (e_0.metaKey || e_0.ctrlKey)) {
				e_0.preventDefault();
				submitWithNotes();
			}
		};
		$[43] = submitWithNotes;
		$[44] = t23;
	} else t23 = $[44];
	let t24;
	if ($[45] !== notes || $[46] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			value: notes,
			onChange: t22,
			placeholder: "Add instructions (optional)…",
			"aria-label": "Instructions for the merge",
			rows: 5,
			className: "min-h-28 w-full resize-y rounded-[5px] border border-ed-field-border bg-ed-field px-2 py-1.5 text-ed-ui leading-4 text-ed-foreground placeholder:text-ed-muted-foreground/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ed-ring/50 focus-visible:border-ed-ring",
			autoFocus: true,
			onKeyDown: t23
		}) });
		$[45] = notes;
		$[46] = t23;
		$[47] = t24;
	} else t24 = $[47];
	let t25;
	if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			onClick: () => setNotesOpen(false),
			children: "Back"
		});
		$[48] = t25;
	} else t25 = $[48];
	let t26;
	if ($[49] !== isPreparing || $[50] !== submitWithNotes) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t25, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			onClick: submitWithNotes,
			loading: isPreparing,
			children: "Save"
		})] });
		$[49] = isPreparing;
		$[50] = submitWithNotes;
		$[51] = t26;
	} else t26 = $[51];
	let t27;
	if ($[52] !== t20 || $[53] !== t24 || $[54] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			t20,
			t21,
			t24,
			t26
		] });
		$[52] = t20;
		$[53] = t24;
		$[54] = t26;
		$[55] = t27;
	} else t27 = $[55];
	let t28;
	if ($[56] !== notesOpen || $[57] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: notesOpen,
			onOpenChange: setNotesOpen,
			children: t27
		});
		$[56] = notesOpen;
		$[57] = t27;
		$[58] = t28;
	} else t28 = $[58];
	let t29;
	if ($[59] !== t19 || $[60] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t19, t28] });
		$[59] = t19;
		$[60] = t28;
		$[61] = t29;
	} else t29 = $[61];
	return t29;
}

export { ComponentEditingModeBar };
