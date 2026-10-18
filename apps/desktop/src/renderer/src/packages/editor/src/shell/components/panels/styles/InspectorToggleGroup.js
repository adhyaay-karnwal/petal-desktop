// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/InspectorToggleGroup.tsx
import { import_jsx_runtime } from "../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../cloud/src/hooks/useSession.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui/src/components/Tooltip.js";
import { ToggleGroup, ToggleGroupItem } from "../../../../../../ui/src/components/ToggleGroup.js";

/**
* Inspector-specific single-select toggle group. Interaction, accessibility
* and the selected-item styling come from the shared design-system primitive;
* this wrapper only sizes it for the inspector. It takes no className so every
* inspector toggle group looks the same.
*/
function InspectorToggleGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	let onValueChange;
	let options;
	let props;
	let value;
	if ($[0] !== t0) {
		({value, onValueChange, options, ...props} = t0);
		$[0] = t0;
		$[1] = onValueChange;
		$[2] = options;
		$[3] = props;
		$[4] = value;
	} else {
		onValueChange = $[1];
		options = $[2];
		props = $[3];
		value = $[4];
	}
	let t1;
	if ($[5] !== onValueChange) {
		t1 = (nextValue) => {
			if (nextValue) onValueChange(nextValue);
		};
		$[5] = onValueChange;
		$[6] = t1;
	} else t1 = $[6];
	let t2;
	if ($[7] !== options) {
		t2 = options.map(_temp$74);
		$[7] = options;
		$[8] = t2;
	} else t2 = $[8];
	let t3;
	if ($[9] !== props || $[10] !== t1 || $[11] !== t2 || $[12] !== value) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup, {
			type: "single",
			size: "sm",
			value,
			onValueChange: t1,
			className: "w-full min-w-0 flex-1 gap-0 text-ed-inspector-chrome",
			...props,
			children: t2
		});
		$[9] = props;
		$[10] = t1;
		$[11] = t2;
		$[12] = value;
		$[13] = t3;
	} else t3 = $[13];
	return t3;
}
function _temp$74(option) {
	const item = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupItem, {
		value: option.value,
		"aria-label": option.label,
		disabled: option.disabled,
		className: "min-w-0 flex-1 px-1 font-normal text-ed-inspector-chrome",
		children: option.content ?? option.label
	}, option.value);
	return option.tooltip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex h-full min-w-0 flex-1",
			children: item
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "top",
		sideOffset: 4,
		children: option.tooltip
	})] }, option.value) : item;
}

export { InspectorToggleGroup };
