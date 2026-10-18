// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/PanelSearchInput.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { SearchIcon } from "../../../../../ui/src/icons.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../../../ui/src/components/InputGroup.js";

function PanelSearchInput(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { value, onChange, placeholder, inputRef, onKeyDown, className, "aria-label": ariaLabel } = t0;
	let t1;
	if ($[0] !== className) {
		t1 = cn$2("shadow-none focus-within:ring-0!", className);
		$[0] = className;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
			align: "inline-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
				width: 16,
				height: 16,
				className: "size-4 text-ed-foreground-secondary",
				"aria-hidden": "true"
			})
		});
		$[2] = t2;
	} else t2 = $[2];
	const t3 = ariaLabel ?? placeholder;
	let t4;
	if ($[3] !== onChange) {
		t4 = (e) => onChange(e.target.value);
		$[3] = onChange;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== inputRef || $[6] !== onKeyDown || $[7] !== placeholder || $[8] !== t3 || $[9] !== t4 || $[10] !== value) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
			ref: inputRef,
			type: "search",
			"aria-label": t3,
			placeholder,
			value,
			onChange: t4,
			onKeyDown
		});
		$[5] = inputRef;
		$[6] = onKeyDown;
		$[7] = placeholder;
		$[8] = t3;
		$[9] = t4;
		$[10] = value;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== t1 || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
			size: "xs",
			className: t1,
			children: [t2, t5]
		});
		$[12] = t1;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	return t6;
}

export { PanelSearchInput };
