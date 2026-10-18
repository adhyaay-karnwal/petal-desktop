// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CreateComponentModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { Input } from "../../../../ui/src/components/Input.js";

function CreateComponentModal(t0) {
	const $ = (0, import_compiler_runtime.c)(40);
	const { isOpen, onClose, onConfirm } = t0;
	const [componentName, setComponentName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [wasOpen, setWasOpen] = (0, import_react.useState)(isOpen);
	if (isOpen !== wasOpen) {
		setWasOpen(isOpen);
		if (isOpen) {
			setComponentName("");
			setError("");
		}
	}
	let t1;
	if ($[0] !== componentName || $[1] !== onClose || $[2] !== onConfirm) {
		t1 = () => {
			const trimmed = componentName.trim();
			if (!trimmed) {
				setError("Component name is required");
				return;
			}
			if (!/^[A-Z][a-zA-Z0-9]*$/.test(trimmed)) {
				setError("Component name must be PascalCase (e.g., MyButton)");
				return;
			}
			onConfirm(trimmed);
			onClose();
		};
		$[0] = componentName;
		$[1] = onClose;
		$[2] = onConfirm;
		$[3] = t1;
	} else t1 = $[3];
	const handleConfirm = t1;
	let t2;
	if ($[4] !== componentName || $[5] !== handleConfirm) {
		t2 = (e) => {
			if (e.key === "Enter" && componentName.trim()) {
				e.preventDefault();
				handleConfirm();
			}
		};
		$[4] = componentName;
		$[5] = handleConfirm;
		$[6] = t2;
	} else t2 = $[6];
	const handleKeyDown = t2;
	let t3;
	if ($[7] !== onClose) {
		t3 = (open) => !open && onClose();
		$[7] = onClose;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create component" }) });
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Turn the selected element into a reusable React component." })
		});
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "componentName",
			className: "text-ed-ui leading-4 font-medium text-ed-foreground",
			children: "Component name"
		});
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = (e_0) => {
			setComponentName(e_0.target.value);
			setError("");
		};
		$[12] = t7;
	} else t7 = $[12];
	const t8 = !!error;
	let t9;
	if ($[13] !== componentName || $[14] !== handleKeyDown || $[15] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: "componentName",
			size: "xs",
			type: "text",
			value: componentName,
			onChange: t7,
			onKeyDown: handleKeyDown,
			placeholder: "MyButton",
			autoFocus: true,
			"aria-invalid": t8
		});
		$[13] = componentName;
		$[14] = handleKeyDown;
		$[15] = t8;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== error) {
		t10 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "danger",
			children: error
		});
		$[17] = error;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: "PascalCase, for example MyButton or CardHeader."
		});
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== t10 || $[21] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "gap-2",
			children: [
				t6,
				t9,
				t10,
				t11
			]
		});
		$[20] = t10;
		$[21] = t9;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== onClose) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			onClick: onClose,
			children: "Cancel"
		});
		$[23] = onClose;
		$[24] = t13;
	} else t13 = $[24];
	let t14;
	if ($[25] !== componentName) {
		t14 = componentName.trim();
		$[25] = componentName;
		$[26] = t14;
	} else t14 = $[26];
	const t15 = !t14;
	let t16;
	if ($[27] !== handleConfirm || $[28] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: handleConfirm,
			disabled: t15,
			children: "Create component"
		});
		$[27] = handleConfirm;
		$[28] = t15;
		$[29] = t16;
	} else t16 = $[29];
	let t17;
	if ($[30] !== t13 || $[31] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t13, t16] });
		$[30] = t13;
		$[31] = t16;
		$[32] = t17;
	} else t17 = $[32];
	let t18;
	if ($[33] !== t12 || $[34] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			t4,
			t5,
			t12,
			t17
		] });
		$[33] = t12;
		$[34] = t17;
		$[35] = t18;
	} else t18 = $[35];
	let t19;
	if ($[36] !== isOpen || $[37] !== t18 || $[38] !== t3) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: isOpen,
			onOpenChange: t3,
			children: t18
		});
		$[36] = isOpen;
		$[37] = t18;
		$[38] = t3;
		$[39] = t19;
	} else t19 = $[39];
	return t19;
}

export { CreateComponentModal };
