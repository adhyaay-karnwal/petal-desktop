// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/ClassPickerContent.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { PlusIcon } from "../../../../../../../ui/src/icons.js";
import { ScrollArea } from "../../../../../../../ui/src/components/ScrollArea.js";
import { InspectorPopoverItem, InspectorPopoverSearch, InspectorPopoverSectionLabel } from "../InspectorPopover.js";
import { getAllTailwindColors } from "../../../../../shared/utils/tailwindScale.js";

/**
* Reusable class picker popover — search + arrow keys + enter to select.
* Shown from the section-header chip-icon and from individual fields'
* suggestion dropdowns. Splits results into Design System (var-based),
* Project (concrete), and the full Tailwind palette.
*/
function ClassPickerContent(t0) {
	const $ = (0, import_compiler_runtime.c)(49);
	const { suggestions, cssProperty, onSelect, sourceClass, onClose, tailwindOptions } = t0;
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedIdx, setSelectedIdx] = (0, import_react.useState)(0);
	let allItems;
	let hasColorSwatches;
	let isColor;
	if ($[0] !== cssProperty || $[1] !== search || $[2] !== suggestions || $[3] !== tailwindOptions) {
		const valid = suggestions.filter(_temp$111);
		const resolved = (!search ? valid : valid.filter((s_0) => s_0.className.toLowerCase().includes(search.toLowerCase()))).map(_temp2$72);
		const designSystem = [];
		const project = [];
		for (const s_2 of resolved) if (s_2.rawValue) designSystem.push(s_2);
		else project.push(s_2);
		let t1;
		if ($[7] !== cssProperty) {
			t1 = cssProperty && [
				"color",
				"backgroundColor",
				"borderColor"
			].includes(cssProperty);
			$[7] = cssProperty;
			$[8] = t1;
		} else t1 = $[8];
		isColor = t1;
		let t2;
		if ($[9] !== isColor || $[10] !== tailwindOptions) {
			t2 = isColor || tailwindOptions?.some(_temp3$53);
			$[9] = isColor;
			$[10] = tailwindOptions;
			$[11] = t2;
		} else t2 = $[11];
		hasColorSwatches = t2;
		const allTwOptions = tailwindOptions ?? (isColor && cssProperty ? getAllTailwindColors(cssProperty) : []);
		const twOptions = !allTwOptions.length ? [] : !search ? allTwOptions : allTwOptions.filter((s_3) => s_3.className.toLowerCase().includes(search.toLowerCase()));
		const hasTwSection = twOptions.length > 0;
		allItems = [];
		for (const s_4 of designSystem) allItems.push({
			...s_4,
			section: "designSystem"
		});
		for (const s_5 of project) allItems.push({
			...s_5,
			section: "project"
		});
		if (hasTwSection) {
			const projectNames = new Set(resolved.map(_temp4$45));
			for (const s_7 of twOptions) if (!projectNames.has(s_7.className)) allItems.push({
				className: s_7.className,
				value: s_7.value,
				resolvedValue: s_7.value,
				section: "tailwind"
			});
		}
		$[0] = cssProperty;
		$[1] = search;
		$[2] = suggestions;
		$[3] = tailwindOptions;
		$[4] = allItems;
		$[5] = hasColorSwatches;
		$[6] = isColor;
	} else {
		allItems = $[4];
		hasColorSwatches = $[5];
		isColor = $[6];
	}
	let t1;
	if ($[12] !== hasColorSwatches || $[13] !== onClose || $[14] !== onSelect || $[15] !== selectedIdx || $[16] !== sourceClass) {
		t1 = (item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverItem, {
			selected: item.section !== "tailwind" && sourceClass === item.className,
			highlighted: index === selectedIdx,
			onMouseDown: _temp5$39,
			onClick: () => {
				onSelect(item.className);
				onClose();
			},
			className: "py-[5px]",
			children: [
				hasColorSwatches && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-4 shrink-0 rounded-[4px] border border-ed-border/30",
					style: { backgroundColor: item.resolvedValue }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate font-mono",
					children: item.className
				}),
				!hasColorSwatches && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-[50%] shrink-0 truncate text-right text-ed-muted-foreground",
					children: item.resolvedValue
				})
			]
		}, `${item.section}-${item.className}`);
		$[12] = hasColorSwatches;
		$[13] = onClose;
		$[14] = onSelect;
		$[15] = selectedIdx;
		$[16] = sourceClass;
		$[17] = t1;
	} else t1 = $[17];
	const renderRow = t1;
	let t2;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = [
			{
				key: "designSystem",
				label: "Design system"
			},
			{
				key: "project",
				label: "Project"
			},
			{
				key: "tailwind",
				label: "Tailwind"
			}
		];
		$[18] = t2;
	} else t2 = $[18];
	const sections = t2;
	const t3 = isColor ? "Search colors" : "Search classes";
	let t4;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (e_0) => {
			setSearch(e_0.target.value);
			setSelectedIdx(0);
		};
		$[19] = t4;
	} else t4 = $[19];
	let t5;
	if ($[20] !== allItems || $[21] !== onClose || $[22] !== onSelect || $[23] !== search || $[24] !== selectedIdx) {
		t5 = (e_1) => {
			if (e_1.key === "ArrowDown") {
				e_1.preventDefault();
				setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1));
			} else if (e_1.key === "ArrowUp") {
				e_1.preventDefault();
				setSelectedIdx(_temp6$32);
			} else if (e_1.key === "Enter") {
				e_1.preventDefault();
				if (allItems.length > 0) {
					onSelect(allItems[selectedIdx]?.className);
					onClose();
				} else if (search.trim()) {
					onSelect(search.trim());
					onClose();
				}
			} else if (e_1.key === "Escape") onClose();
		};
		$[20] = allItems;
		$[21] = onClose;
		$[22] = onSelect;
		$[23] = search;
		$[24] = selectedIdx;
		$[25] = t5;
	} else t5 = $[25];
	const t6 = isColor ? "Search colors..." : "Search classes...";
	let t7;
	if ($[26] !== search || $[27] !== t3 || $[28] !== t5 || $[29] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverSearch, {
			"aria-label": t3,
			value: search,
			onChange: t4,
			onKeyDown: t5,
			placeholder: t6,
			autoFocus: true
		});
		$[26] = search;
		$[27] = t3;
		$[28] = t5;
		$[29] = t6;
		$[30] = t7;
	} else t7 = $[30];
	let t8;
	if ($[31] !== allItems || $[32] !== renderRow) {
		t8 = sections.map((t9) => {
			const { key, label } = t9;
			const rows = allItems.map(_temp7$25).filter((t10) => {
				const { item: item_1 } = t10;
				return item_1.section === key;
			});
			if (!rows.length) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverSectionLabel, { children: label }), rows.map((t11) => {
					const { item: item_2, index: index_1 } = t11;
					return renderRow(item_2, index_1);
				})]
			}, key);
		});
		$[31] = allItems;
		$[32] = renderRow;
		$[33] = t8;
	} else t8 = $[33];
	let t9;
	if ($[34] !== allItems.length || $[35] !== onClose || $[36] !== onSelect || $[37] !== search) {
		t9 = allItems.length === 0 && search.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverItem, {
			onClick: () => {
				onSelect(search.trim());
				onClose();
			},
			className: "py-[5px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, { className: "shrink-0 text-ed-foreground-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate font-mono",
				children: [
					"Add \"",
					search.trim(),
					"\""
				]
			})]
		});
		$[34] = allItems.length;
		$[35] = onClose;
		$[36] = onSelect;
		$[37] = search;
		$[38] = t9;
	} else t9 = $[38];
	let t10;
	if ($[39] !== allItems.length || $[40] !== search) {
		t10 = allItems.length === 0 && !search.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-1.5 py-2 text-center text-ed-muted-foreground",
			children: "No matches"
		});
		$[39] = allItems.length;
		$[40] = search;
		$[41] = t10;
	} else t10 = $[41];
	let t11;
	if ($[42] !== t10 || $[43] !== t8 || $[44] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
			className: "min-h-0 flex-1",
			viewportClassName: "max-h-75 pt-1",
			children: [
				t8,
				t9,
				t10
			]
		});
		$[42] = t10;
		$[43] = t8;
		$[44] = t9;
		$[45] = t11;
	} else t11 = $[45];
	let t12;
	if ($[46] !== t11 || $[47] !== t7) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t7, t11] });
		$[46] = t11;
		$[47] = t7;
		$[48] = t12;
	} else t12 = $[48];
	return t12;
}
function _temp7$25(item_0, index_0) {
	return {
		item: item_0,
		index: index_0
	};
}
function _temp6$32(i_0) {
	return Math.max(i_0 - 1, 0);
}
function _temp5$39(e) {
	return e.preventDefault();
}
function _temp4$45(s_6) {
	return s_6.className;
}
function _temp3$53(t) {
	return /^#[0-9a-f]{6}$/i.test(t.value);
}
function _temp2$72(s_1) {
	return {
		...s_1,
		resolvedValue: s_1.value
	};
}
function _temp$111(s) {
	return s.className && s.className.length > 0;
}

export { ClassPickerContent };
