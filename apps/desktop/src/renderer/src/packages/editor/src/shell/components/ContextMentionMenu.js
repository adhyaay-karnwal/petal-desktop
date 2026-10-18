// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ContextMentionMenu.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { DiamondIcon, FileIcon } from "../../../../ui/src/icons.js";
import { ComposerSuggestionGroup, ComposerSuggestionItem, ComposerSuggestionMenu } from "./ComposerSuggestionMenu.js";

var groups = [
	{
		type: "connection",
		label: "Connections"
	},
	{
		type: "component",
		label: "Components"
	},
	{
		type: "page",
		label: "Pages"
	}
];
function ContextMentionMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { id, options, selectedIndex, onHover, onSelect, loading } = t0;
	let T0;
	let t1;
	let t2;
	let t3;
	let t4;
	if ($[0] !== id || $[1] !== loading || $[2] !== onHover || $[3] !== onSelect || $[4] !== options || $[5] !== selectedIndex) {
		const entries = options.map(_temp$47);
		T0 = ComposerSuggestionMenu;
		t1 = id;
		t2 = "Add context";
		t3 = selectedIndex;
		t4 = groups.map((group) => {
			const items = entries.filter((t5) => {
				const { option: option_0 } = t5;
				return option_0.type === group.type;
			});
			const pending = loading && group.type === "connection";
			if (!items.length && !pending) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-label": group.label,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerSuggestionGroup, { children: group.label }),
					pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-6.5 items-center px-1.5 text-ed-muted-foreground",
						children: "Loading connections…"
					}),
					items.map((t6) => {
						const { option: option_1, index: index_0 } = t6;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposerSuggestionItem, {
							id: `${id}-option-${index_0}`,
							index: index_0,
							selected: index_0 === selectedIndex,
							onHover,
							onSelect: () => onSelect(option_1),
							children: [
								option_1.type === "component" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiamondIcon, { className: "size-4 shrink-0 text-ed-layer-component" }),
								option_1.type === "page" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, { className: "size-4 shrink-0 text-ed-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: option_1.displayName ?? option_1.name
								})
							]
						}, option_1.id);
					})
				]
			}, group.type);
		});
		$[0] = id;
		$[1] = loading;
		$[2] = onHover;
		$[3] = onSelect;
		$[4] = options;
		$[5] = selectedIndex;
		$[6] = T0;
		$[7] = t1;
		$[8] = t2;
		$[9] = t3;
		$[10] = t4;
	} else {
		T0 = $[6];
		t1 = $[7];
		t2 = $[8];
		t3 = $[9];
		t4 = $[10];
	}
	let t5;
	if ($[11] !== loading || $[12] !== options.length) {
		t5 = !options.length && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-1.5 py-1 text-ed-muted-foreground",
			children: "No matching context"
		});
		$[11] = loading;
		$[12] = options.length;
		$[13] = t5;
	} else t5 = $[13];
	let t6;
	if ($[14] !== T0 || $[15] !== t1 || $[16] !== t2 || $[17] !== t3 || $[18] !== t4 || $[19] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			id: t1,
			label: t2,
			selectedIndex: t3,
			children: [t4, t5]
		});
		$[14] = T0;
		$[15] = t1;
		$[16] = t2;
		$[17] = t3;
		$[18] = t4;
		$[19] = t5;
		$[20] = t6;
	} else t6 = $[20];
	return t6;
}
function _temp$47(option, index) {
	return {
		option,
		index
	};
}

export { ContextMentionMenu };
