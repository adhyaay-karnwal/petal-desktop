// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ConfirmDialog.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { Input } from "../../../../ui/src/components/Input.js";

function ConfirmDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(38);
	const { isOpen, onClose, onConfirm, title, description, confirmText: t1, cancelText: t2, typeToConfirm, typeToConfirmLabel, destructive: t3, isLoading: t4 } = t0;
	const confirmText = t1 === void 0 ? "Confirm" : t1;
	const cancelText = t2 === void 0 ? "Cancel" : t2;
	const destructive = t3 === void 0 ? false : t3;
	const isLoading = t4 === void 0 ? false : t4;
	const [typed, setTyped] = (0, import_react.useState)("");
	const [wasOpen, setWasOpen] = (0, import_react.useState)(isOpen);
	if (isOpen !== wasOpen) {
		setWasOpen(isOpen);
		if (!isOpen) setTyped("");
	}
	const canConfirm = typeToConfirm ? typed === typeToConfirm : true;
	let t5;
	if ($[0] !== onClose) {
		t5 = (open) => {
			if (!open) onClose();
		};
		$[0] = onClose;
		$[1] = t5;
	} else t5 = $[1];
	let t6;
	if ($[2] !== description) {
		t6 = !description ? { "aria-describedby": void 0 } : {};
		$[2] = description;
		$[3] = t6;
	} else t6 = $[3];
	let t7;
	if ($[4] !== title) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }) });
		$[4] = title;
		$[5] = t7;
	} else t7 = $[5];
	let t8;
	if ($[6] !== description) {
		t8 = description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: description })
		});
		$[6] = description;
		$[7] = t8;
	} else t8 = $[7];
	let t9;
	if ($[8] !== typeToConfirm || $[9] !== typeToConfirmLabel || $[10] !== typed) {
		t9 = typeToConfirm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "confirm-dialog-typed",
				className: "text-ed-ui leading-4 font-medium text-ed-foreground",
				children: typeToConfirmLabel ?? `Type ${typeToConfirm} to confirm`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "confirm-dialog-typed",
				size: "xs",
				value: typed,
				onChange: (e) => setTyped(e.target.value),
				placeholder: typeToConfirm,
				autoFocus: true
			})]
		});
		$[8] = typeToConfirm;
		$[9] = typeToConfirmLabel;
		$[10] = typed;
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== cancelText || $[13] !== isLoading || $[14] !== onClose) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			onClick: onClose,
			disabled: isLoading,
			children: cancelText
		});
		$[12] = cancelText;
		$[13] = isLoading;
		$[14] = onClose;
		$[15] = t10;
	} else t10 = $[15];
	const t11 = destructive ? "destructive" : "outline";
	let t12;
	if ($[16] !== onClose || $[17] !== onConfirm) {
		t12 = () => {
			onConfirm();
			onClose();
		};
		$[16] = onClose;
		$[17] = onConfirm;
		$[18] = t12;
	} else t12 = $[18];
	const t13 = !canConfirm || isLoading;
	let t14;
	if ($[19] !== confirmText || $[20] !== isLoading || $[21] !== t11 || $[22] !== t12 || $[23] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: t11,
			size: "xs",
			onClick: t12,
			disabled: t13,
			loading: isLoading,
			children: confirmText
		});
		$[19] = confirmText;
		$[20] = isLoading;
		$[21] = t11;
		$[22] = t12;
		$[23] = t13;
		$[24] = t14;
	} else t14 = $[24];
	let t15;
	if ($[25] !== t10 || $[26] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t10, t14] });
		$[25] = t10;
		$[26] = t14;
		$[27] = t15;
	} else t15 = $[27];
	let t16;
	if ($[28] !== t15 || $[29] !== t6 || $[30] !== t7 || $[31] !== t8 || $[32] !== t9) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			...t6,
			children: [
				t7,
				t8,
				t9,
				t15
			]
		});
		$[28] = t15;
		$[29] = t6;
		$[30] = t7;
		$[31] = t8;
		$[32] = t9;
		$[33] = t16;
	} else t16 = $[33];
	let t17;
	if ($[34] !== isOpen || $[35] !== t16 || $[36] !== t5) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: isOpen,
			onOpenChange: t5,
			children: t16
		});
		$[34] = isOpen;
		$[35] = t16;
		$[36] = t5;
		$[37] = t17;
	} else t17 = $[37];
	return t17;
}

export { ConfirmDialog };
