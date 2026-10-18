// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/props/PropField.tsx
import { import_jsx_runtime } from "../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../cloud/src/hooks/useSession.js";
import { HashIcon } from "../../../../../../ui/src/icons.js";
import { Switch } from "../../../../../../ui/src/components/Switch.js";
import { INSPECTOR_CONTROL_TEXT_STYLE, InspectorControlInput, InspectorControlShell, InspectorScrubHandle, blurInspectorInputOnEnter } from "../styles/primitives.js";
import { InspectorDropdown } from "../styles/inputs/parts/InspectorDropdown.js";
import { useInspectorScrub } from "../styles/inputs/useInspectorScrub.js";
import { ColorRow } from "../styles/inputs/ColorRow.js";

/**
* PropField — a single prop row in the Props panel: truncating label on the
* left, an inspector-styled control on the right. Every row shares the same
* grid template so controls line up at the same width, and the controls reuse
* the Design inspector primitives so props and styles read as one system.
*/
/** Keep canvas shortcuts quiet while typing; Enter commits via blur. */
function handlePropInputKeyDown(e) {
	e.stopPropagation();
	blurInspectorInputOnEnter(e);
}
/**
* Label-left / control-right row. The grid template is shared by every row so
* label and control columns align across the panel; labels truncate.
*/
function PropRow(t0) {
	const $ = (0, import_compiler_runtime.c)(23);
	const { label, required: t1, scrubRef, action, rail, children } = t0;
	const required = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] !== label) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: label
		});
		$[0] = label;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== required) {
		t3 = required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 text-ed-muted-foreground",
			children: "*"
		});
		$[2] = required;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== t2 || $[5] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t2, t3] });
		$[4] = t2;
		$[5] = t3;
		$[6] = t4;
	} else t4 = $[6];
	const text = t4;
	const t5 = rail === void 0 ? "grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] items-start gap-1.5" : "grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_26px] items-start gap-1.5";
	let t6;
	if ($[7] !== scrubRef || $[8] !== text) {
		t6 = scrubRef ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			className: "min-w-0 shrink gap-1 pl-0 text-ed-ui text-ed-inspector-value",
			children: text
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex min-w-0 items-center gap-1 text-ed-ui font-normal text-ed-inspector-value",
			children: text
		});
		$[7] = scrubRef;
		$[8] = text;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== action || $[11] !== label || $[12] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-h-6.5 min-w-0 items-center gap-1",
			title: label,
			children: [t6, action]
		});
		$[10] = action;
		$[11] = label;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== children) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 items-center",
			children
		});
		$[14] = children;
		$[15] = t8;
	} else t8 = $[15];
	let t9;
	if ($[16] !== rail) {
		t9 = rail !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-[26px] items-center justify-center",
			children: rail
		});
		$[16] = rail;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== t5 || $[19] !== t7 || $[20] !== t8 || $[21] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t5,
			children: [
				t7,
				t8,
				t9
			]
		});
		$[18] = t5;
		$[19] = t7;
		$[20] = t8;
		$[21] = t9;
		$[22] = t10;
	} else t10 = $[22];
	return t10;
}
/** Keep canvas shortcuts quiet while typing; Enter commits, Shift+Enter breaks. */
function handleTextareaKeyDown(e) {
	e.stopPropagation();
	if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
		e.preventDefault();
		e.currentTarget.blur();
	}
}
var propTextAreaClasses = "col-start-1 row-start-1 w-full min-w-0 whitespace-pre-wrap break-words border-0 bg-transparent px-2 py-[5px] text-ed-ui";
function PropTextControl(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { value, placeholder, readOnly: t1, onInput, onCommit } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] !== onInput) {
		t2 = (e) => onInput(e.target.value);
		$[0] = onInput;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== onCommit || $[3] !== readOnly) {
		t3 = (e_0) => {
			if (!readOnly) onCommit(e_0.target.value);
		};
		$[2] = onCommit;
		$[3] = readOnly;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== placeholder || $[6] !== readOnly || $[7] !== t2 || $[8] !== t3 || $[9] !== value) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			rows: 1,
			value,
			readOnly,
			onChange: t2,
			onBlur: t3,
			onFocus: _temp$42,
			onKeyDown: handleTextareaKeyDown,
			placeholder,
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: `${propTextAreaClasses} resize-none overflow-hidden text-ed-inspector-value outline-none placeholder:text-ed-muted-foreground/50 disabled:pointer-events-none disabled:opacity-50`
		});
		$[5] = placeholder;
		$[6] = readOnly;
		$[7] = t2;
		$[8] = t3;
		$[9] = value;
		$[10] = t4;
	} else t4 = $[10];
	const t5 = `${value || placeholder || ""} `;
	let t6;
	if ($[11] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: `${propTextAreaClasses} invisible`,
			children: t5
		});
		$[11] = t5;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== t4 || $[14] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			className: "h-auto min-h-6.5 items-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "grid min-w-0 flex-1",
				children: [t4, t6]
			})
		});
		$[13] = t4;
		$[14] = t6;
		$[15] = t7;
	} else t7 = $[15];
	return t7;
}
function _temp$42(e_1) {
	if (!e_1.currentTarget.readOnly) e_1.currentTarget.select();
}
function PropNumberControl(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { value, placeholder, readOnly: t1, active: t2, onInput, onCommit } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const active = t2 === void 0 ? false : t2;
	let t3;
	if ($[0] !== value) {
		t3 = () => {
			const n = parseFloat(value);
			return Number.isFinite(n) ? n : 0;
		};
		$[0] = value;
		$[1] = t3;
	} else t3 = $[1];
	let t4;
	if ($[2] !== onCommit) {
		t4 = (next) => onCommit(String(next));
		$[2] = onCommit;
		$[3] = t4;
	} else t4 = $[3];
	const { scrubRef, isScrubbing } = useInspectorScrub(t3, t4);
	const t5 = active || isScrubbing;
	let t6;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HashIcon, {});
		$[4] = t6;
	} else t6 = $[4];
	let t7;
	if ($[5] !== scrubRef) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			className: "h-full w-6 shrink-0 justify-center pl-0",
			children: t6
		});
		$[5] = scrubRef;
		$[6] = t7;
	} else t7 = $[6];
	let t8;
	if ($[7] !== onInput) {
		t8 = (e) => onInput(e.target.value);
		$[7] = onInput;
		$[8] = t8;
	} else t8 = $[8];
	let t9;
	if ($[9] !== onCommit) {
		t9 = (e_0) => onCommit(e_0.target.value);
		$[9] = onCommit;
		$[10] = t9;
	} else t9 = $[10];
	let t10;
	if ($[11] !== placeholder || $[12] !== readOnly || $[13] !== t8 || $[14] !== t9 || $[15] !== value) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			type: "number",
			value,
			readOnly,
			onChange: t8,
			onBlur: t9,
			onKeyDown: handlePropInputKeyDown,
			placeholder,
			className: "pl-0 pr-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		});
		$[11] = placeholder;
		$[12] = readOnly;
		$[13] = t8;
		$[14] = t9;
		$[15] = value;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== t10 || $[18] !== t5 || $[19] !== t7) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
			active: t5,
			children: [t7, t10]
		});
		$[17] = t10;
		$[18] = t5;
		$[19] = t7;
		$[20] = t11;
	} else t11 = $[20];
	return t11;
}
function PropBooleanControl(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { label, value, isMixed: t1, onCommit } = t0;
	const t2 = !(t1 === void 0 ? false : t1) && value === "true";
	let t3;
	if ($[0] !== onCommit) {
		t3 = (checked) => onCommit(checked ? "true" : "false");
		$[0] = onCommit;
		$[1] = t3;
	} else t3 = $[1];
	let t4;
	if ($[2] !== label || $[3] !== t2 || $[4] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex min-h-6.5 items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				"aria-label": label,
				checked: t2,
				onCheckedChange: t3
			})
		});
		$[2] = label;
		$[3] = t2;
		$[4] = t3;
		$[5] = t4;
	} else t4 = $[5];
	return t4;
}
function PropSelectControl(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { label, value, options, isMixed: t1, placeholder, onCommit } = t0;
	const isMixed = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] !== isMixed || $[1] !== placeholder || $[2] !== value) {
		t2 = value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: value
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate text-ed-muted-foreground/50",
			children: isMixed ? "-" : placeholder ?? "Select"
		});
		$[0] = isMixed;
		$[1] = placeholder;
		$[2] = value;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== options) {
		t3 = options.map(_temp2$25);
		$[4] = options;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== isMixed || $[7] !== label || $[8] !== onCommit || $[9] !== t2 || $[10] !== t3 || $[11] !== value) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label,
			hasIcon: false,
			value: t2,
			selectedValue: value,
			isMixed,
			options: t3,
			onValueChange: onCommit,
			className: "w-full",
			contentClassName: "max-h-72"
		});
		$[6] = isMixed;
		$[7] = label;
		$[8] = onCommit;
		$[9] = t2;
		$[10] = t3;
		$[11] = value;
		$[12] = t4;
	} else t4 = $[12];
	return t4;
}
function _temp2$25(option) {
	return {
		value: option,
		label: option
	};
}
function PropField(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { label, required: t1, kind, options: t2, value, isMixed: t3, placeholder, readOnly: t4, action, rail, onInput, onCommit } = t0;
	const required = t1 === void 0 ? false : t1;
	let t5;
	if ($[0] !== t2) {
		t5 = t2 === void 0 ? [] : t2;
		$[0] = t2;
		$[1] = t5;
	} else t5 = $[1];
	const options = t5;
	const isMixed = t3 === void 0 ? false : t3;
	const readOnly = t4 === void 0 ? false : t4;
	let t6;
	if ($[2] !== value) {
		t6 = () => {
			const n = parseFloat(value);
			return Number.isFinite(n) ? n : 0;
		};
		$[2] = value;
		$[3] = t6;
	} else t6 = $[3];
	let t7;
	if ($[4] !== onCommit) {
		t7 = (next) => onCommit(String(next));
		$[4] = onCommit;
		$[5] = t7;
	} else t7 = $[5];
	const labelScrub = useInspectorScrub(t6, t7);
	const isNumber = kind === "number";
	const inputPlaceholder = isMixed ? "-" : placeholder;
	const t8 = isNumber && !readOnly ? labelScrub.scrubRef : void 0;
	let t9;
	if ($[6] !== inputPlaceholder || $[7] !== isMixed || $[8] !== isNumber || $[9] !== kind || $[10] !== label || $[11] !== labelScrub || $[12] !== onCommit || $[13] !== onInput || $[14] !== options || $[15] !== placeholder || $[16] !== readOnly || $[17] !== value) {
		t9 = kind === "enum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropSelectControl, {
			label,
			value,
			options,
			isMixed,
			placeholder,
			onCommit
		}) : kind === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropBooleanControl, {
			label,
			value,
			isMixed,
			onCommit
		}) : kind === "color" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
			label,
			hideLabel: true,
			value,
			isMixedValue: isMixed,
			cssProperty: "color",
			onChange: onCommit
		}) : isNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropNumberControl, {
			value,
			placeholder: inputPlaceholder,
			readOnly,
			active: labelScrub.isScrubbing,
			onInput,
			onCommit
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropTextControl, {
			value,
			placeholder: inputPlaceholder,
			readOnly,
			onInput,
			onCommit
		});
		$[6] = inputPlaceholder;
		$[7] = isMixed;
		$[8] = isNumber;
		$[9] = kind;
		$[10] = label;
		$[11] = labelScrub;
		$[12] = onCommit;
		$[13] = onInput;
		$[14] = options;
		$[15] = placeholder;
		$[16] = readOnly;
		$[17] = value;
		$[18] = t9;
	} else t9 = $[18];
	let t10;
	if ($[19] !== action || $[20] !== label || $[21] !== rail || $[22] !== required || $[23] !== t8 || $[24] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropRow, {
			label,
			required,
			scrubRef: t8,
			action,
			rail,
			children: t9
		});
		$[19] = action;
		$[20] = label;
		$[21] = rail;
		$[22] = required;
		$[23] = t8;
		$[24] = t9;
		$[25] = t10;
	} else t10 = $[25];
	return t10;
}

export { PropField, PropRow, handlePropInputKeyDown };
