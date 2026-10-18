// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/parts/InspectorDropdown.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../../ui/src/lib/utils.js";
import { Tooltip } from "../../../../../../../../ui/src/components/Tooltip.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "../../../../../../../../ui/src/components/Select.js";
import { INSPECTOR_CONTROL_TEXT_STYLE, InspectorControlShell } from "../../primitives.js";

var MENU_ALIGNMENT_OFFSET = 4;
/** Standard inspector select whose selected item opens over the trigger. */
function InspectorDropdown(t0) {
	const $ = (0, import_compiler_runtime.c)(42);
	const { label, value, selectedValue, options, onValueChange, isMixed: t1, hasIcon: t2, className, triggerClassName, contentClassName, onOpenChange, disabled: t3 } = t0;
	const isMixed = t1 === void 0 ? false : t1;
	const hasIcon = t2 === void 0 ? true : t2;
	const disabled = t3 === void 0 ? false : t3;
	const [open, setOpen] = import_react.useState(false);
	let t4;
	if ($[0] !== options || $[1] !== selectedValue) {
		let t5;
		if ($[3] !== selectedValue) {
			t5 = (option) => option.value === selectedValue;
			$[3] = selectedValue;
			$[4] = t5;
		} else t5 = $[4];
		t4 = options.some(t5);
		$[0] = options;
		$[1] = selectedValue;
		$[2] = t4;
	} else t4 = $[2];
	const hasSelection = t4;
	const [triggerWidth, setTriggerWidth] = import_react.useState();
	const [horizontalOffset, setHorizontalOffset] = import_react.useState(0);
	const [positioned, setPositioned] = import_react.useState(false);
	const shellRef = import_react.useRef(null);
	const triggerRef = import_react.useRef(null);
	const contentRef = import_react.useRef(null);
	const optionGroups = options.reduce(_temp$110, []);
	let t5;
	if ($[5] !== hasSelection || $[6] !== open) {
		t5 = () => {
			if (!open || !hasSelection) return;
			const frame = requestAnimationFrame(() => {
				const shell = shellRef.current?.getBoundingClientRect();
				const content = contentRef.current?.getBoundingClientRect();
				if (shell && content) {
					setHorizontalOffset(shell.left - content.left - MENU_ALIGNMENT_OFFSET);
					setPositioned(true);
				}
			});
			return () => cancelAnimationFrame(frame);
		};
		$[5] = hasSelection;
		$[6] = open;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== hasSelection || $[9] !== open || $[10] !== triggerWidth) {
		t6 = [
			open,
			hasSelection,
			triggerWidth
		];
		$[8] = hasSelection;
		$[9] = open;
		$[10] = triggerWidth;
		$[11] = t6;
	} else t6 = $[11];
	import_react.useLayoutEffect(t5, t6);
	const T0 = Select;
	let t7;
	if ($[12] !== onValueChange || $[13] !== open) {
		t7 = (next) => {
			if (open) onValueChange(next);
		};
		$[12] = onValueChange;
		$[13] = open;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== onOpenChange) {
		t8 = (nextOpen) => {
			if (nextOpen) {
				setHorizontalOffset(0);
				setPositioned(false);
				setTriggerWidth(shellRef.current?.getBoundingClientRect().width);
			}
			setOpen(nextOpen);
			onOpenChange?.(nextOpen);
		};
		$[15] = onOpenChange;
		$[16] = t8;
	} else t8 = $[16];
	const t9 = !hasIcon && "pl-2";
	let t10;
	if ($[17] !== t9 || $[18] !== triggerClassName) {
		t10 = cn$2("h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-1 py-0 pr-1.5 text-ed-ui font-normal text-ed-inspector-value shadow-none focus:ring-0 [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:text-ed-inspector-chrome [&>svg]:opacity-100", t9, triggerClassName);
		$[17] = t9;
		$[18] = triggerClassName;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== value) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
			asChild: true,
			placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate text-left",
				children: value
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate text-left",
				children: value
			})
		});
		$[20] = value;
		$[21] = t11;
	} else t11 = $[21];
	let t12;
	if ($[22] !== label || $[23] !== t10 || $[24] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			ref: triggerRef,
			"aria-label": label,
			size: "xs",
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: t10,
			children: t11
		});
		$[22] = label;
		$[23] = t10;
		$[24] = t11;
		$[25] = t12;
	} else t12 = $[25];
	let t13;
	if ($[26] !== label || $[27] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: label,
			children: t12
		});
		$[26] = label;
		$[27] = t12;
		$[28] = t13;
	} else t13 = $[28];
	let t14;
	if ($[29] !== className || $[30] !== open || $[31] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			ref: shellRef,
			active: open,
			className,
			children: t13
		});
		$[29] = className;
		$[30] = open;
		$[31] = t13;
		$[32] = t14;
	} else t14 = $[32];
	const t15 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
		ref: contentRef,
		position: hasSelection ? "item-aligned" : "popper",
		style: {
			...INSPECTOR_CONTROL_TEXT_STYLE,
			minWidth: triggerWidth === void 0 ? void 0 : triggerWidth + (hasSelection ? MENU_ALIGNMENT_OFFSET : 0),
			marginLeft: hasSelection ? horizontalOffset : 0,
			visibility: positioned || !hasSelection ? "visible" : "hidden"
		},
		className: cn$2("w-max min-w-0", isMixed && "[&_[role=option]>span:first-child]:invisible", contentClassName),
		onCloseAutoFocus: (event) => {
			event.preventDefault();
			triggerRef.current?.blur();
		},
		onEscapeKeyDown: _temp2$71,
		onKeyDown: _temp3$52,
		children: optionGroups.map(_temp5$38)
	});
	let t16;
	if ($[33] !== T0 || $[34] !== disabled || $[35] !== open || $[36] !== selectedValue || $[37] !== t14 || $[38] !== t15 || $[39] !== t7 || $[40] !== t8) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			value: selectedValue,
			onValueChange: t7,
			disabled,
			open,
			onOpenChange: t8,
			children: [t14, t15]
		});
		$[33] = T0;
		$[34] = disabled;
		$[35] = open;
		$[36] = selectedValue;
		$[37] = t14;
		$[38] = t15;
		$[39] = t7;
		$[40] = t8;
		$[41] = t16;
	} else t16 = $[41];
	return t16;
}
function _temp5$38(group, groupIndex) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [groupIndex > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectGroup, { children: [group.label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel, {
		className: "px-1.5 py-1 text-[10px] font-normal text-ed-foreground-secondary",
		children: group.label
	}), group.options.map(_temp4$44)] })] }, group.label ?? groupIndex);
}
function _temp4$44(option_1) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
		value: option_1.value,
		disabled: option_1.disabled,
		className: "justify-start gap-1.5 whitespace-nowrap px-1 [&>span:first-child]:ml-0 [&>span:first-child]:size-4",
		children: option_1.label
	}, option_1.value);
}
function _temp3$52(event_1) {
	return event_1.stopPropagation();
}
function _temp2$71(event_0) {
	return event_0.stopPropagation();
}
function _temp$110(groups, option_0) {
	const previous = groups[groups.length - 1];
	if (previous && previous.label === option_0.group) previous.options.push(option_0);
	else groups.push({
		label: option_0.group,
		options: [option_0]
	});
	return groups;
}

export { InspectorDropdown };
