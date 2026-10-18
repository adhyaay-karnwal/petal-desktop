// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ShareAccessRow.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { CaretDownIcon } from "../../../ui/src/icons.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../../../ui/src/components/DropdownMenu.js";

function ShareAccessRow(t0) {
	const $ = (0, import_compiler_runtime.c)(39);
	const { icon, name, description, status, access, value, options, disabled, onChange, onRemove, removeLabel: t1 } = t0;
	const removeLabel = t1 === void 0 ? "remove" : t1;
	let t2;
	if ($[0] !== icon) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-1.5 flex size-6 shrink-0 items-center justify-center text-ed-muted-foreground",
			children: icon
		});
		$[0] = icon;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== name) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-ed-foreground",
			children: name
		});
		$[2] = name;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== status) {
		t4 = status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 whitespace-nowrap text-ed-muted-foreground",
			children: status
		});
		$[4] = status;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== description) {
		t5 = description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden truncate text-ed-muted-foreground sm:inline",
			children: description
		});
		$[6] = description;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t3 || $[9] !== t4 || $[10] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-1 items-baseline gap-1.5 text-[11px] leading-4",
			children: [
				t3,
				t4,
				t5
			]
		});
		$[8] = t3;
		$[9] = t4;
		$[10] = t5;
		$[11] = t6;
	} else t6 = $[11];
	const t7 = `${name}: ${access}`;
	let t8;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "size-3 shrink-0" });
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] !== access || $[14] !== disabled || $[15] !== t7) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				"aria-label": t7,
				className: "flex h-6.5 shrink-0 items-center gap-1.5 rounded-[5px] px-2 text-[11px] leading-4 text-ed-muted-foreground hover:bg-ed-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ed-ring disabled:opacity-50 data-[state=open]:bg-ed-accent",
				children: [access, t8]
			})
		});
		$[13] = access;
		$[14] = disabled;
		$[15] = t7;
		$[16] = t9;
	} else t9 = $[16];
	let t10;
	if ($[17] !== onChange || $[18] !== value) {
		t10 = (next) => {
			if (next !== value) onChange(next);
		};
		$[17] = onChange;
		$[18] = value;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== options) {
		t11 = options.map(_temp$7);
		$[20] = options;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== t10 || $[23] !== t11 || $[24] !== value) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
			value,
			onValueChange: t10,
			children: t11
		});
		$[22] = t10;
		$[23] = t11;
		$[24] = value;
		$[25] = t12;
	} else t12 = $[25];
	let t13;
	if ($[26] !== onRemove || $[27] !== removeLabel) {
		t13 = onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			className: "text-ed-destructive",
			onSelect: onRemove,
			children: removeLabel
		});
		$[26] = onRemove;
		$[27] = removeLabel;
		$[28] = t13;
	} else t13 = $[28];
	let t14;
	if ($[29] !== t12 || $[30] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			children: [t12, t13]
		});
		$[29] = t12;
		$[30] = t13;
		$[31] = t14;
	} else t14 = $[31];
	let t15;
	if ($[32] !== t14 || $[33] !== t9) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t9, t14] });
		$[32] = t14;
		$[33] = t9;
		$[34] = t15;
	} else t15 = $[34];
	let t16;
	if ($[35] !== t15 || $[36] !== t2 || $[37] !== t6) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex h-8 items-center gap-1 px-2",
			children: [
				t2,
				t6,
				t15
			]
		});
		$[35] = t15;
		$[36] = t2;
		$[37] = t6;
		$[38] = t16;
	} else t16 = $[38];
	return t16;
}
function _temp$7(option) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: option.value,
		children: option.label
	}, option.value);
}

export { ShareAccessRow };
