// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/OnboardingOptionGroup.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { n$18 } from "../../../../vendor/@phosphor-icons/react.js";
import { Input } from "../../../ui/src/components/Input.js";

function OnboardingOptionGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(44);
	const { group, selected, onChange, labelId, descId, otherText, onOtherTextChange } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	const rowRefs = (0, import_react.useRef)(t1);
	const inline = group.layout === "inline";
	const grid = group.layout === "grid";
	const otherId = group.other?.option.id;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	if ($[1] !== descId || $[2] !== grid || $[3] !== group.multi || $[4] !== group.options || $[5] !== group.other || $[6] !== inline || $[7] !== labelId || $[8] !== onChange || $[9] !== onOtherTextChange || $[10] !== otherId || $[11] !== selected) {
		const allOptions = group.other ? [...group.options, group.other.option] : group.options;
		let t8;
		if ($[18] !== group.multi || $[19] !== onChange || $[20] !== onOtherTextChange || $[21] !== otherId || $[22] !== selected) {
			t8 = (id) => {
				if (group.multi) {
					const willDeselect = selected.includes(id);
					onChange(willDeselect ? selected.filter((x) => x !== id) : [...selected, id]);
					if (id === otherId && willDeselect) onOtherTextChange?.("");
				} else {
					onChange([id]);
					if (otherId && id !== otherId) onOtherTextChange?.("");
				}
			};
			$[18] = group.multi;
			$[19] = onChange;
			$[20] = onOtherTextChange;
			$[21] = otherId;
			$[22] = selected;
			$[23] = t8;
		} else t8 = $[23];
		const toggle = t8;
		let t9;
		if ($[24] !== selected) {
			t9 = (o) => selected.includes(o.id);
			$[24] = selected;
			$[25] = t9;
		} else t9 = $[25];
		const activeIndex = Math.max(0, allOptions.findIndex(t9));
		const handleKeyDown = (e, index, id_0) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				toggle(id_0);
				return;
			}
			if (group.multi) return;
			const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
			if (dir === 0) return;
			e.preventDefault();
			const n = allOptions.length;
			const next = (index + dir + n) % n;
			toggle(allOptions[next].id);
			rowRefs.current[next]?.focus();
		};
		const renderRow = (opt, index_0) => {
			const isSelected = selected.includes(opt.id);
			const { id: id_1, label, Icon } = opt;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: (el) => {
					rowRefs.current[index_0] = el;
				},
				role: group.multi ? "checkbox" : "radio",
				"aria-checked": isSelected,
				tabIndex: group.multi ? 0 : index_0 === activeIndex ? 0 : -1,
				onClick: () => toggle(id_1),
				onKeyDown: (e_0) => handleKeyDown(e_0, index_0, id_1),
				className: cn$2("flex items-center gap-3 rounded-xl border border-ed-border px-4 py-2.5 text-ed-foreground outline-none", "focus-visible:ring-2 focus-visible:ring-ed-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ed-background", inline && "flex-1 justify-center gap-2", isSelected ? "bg-ed-secondary" : "hover:bg-ed-secondary/50"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						weight: "bold",
						size: 16,
						"aria-hidden": true,
						className: isSelected ? "text-ed-foreground" : "text-ed-muted-foreground",
						style: { flexShrink: 0 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "sm",
						weight: isSelected ? "medium" : "regular",
						children: label
					}),
					!inline && isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$18, {
						size: 16,
						"aria-hidden": true,
						className: "ml-auto shrink-0 text-ed-foreground"
					})
				]
			}, id_1);
		};
		const gridRows = Math.ceil(group.options.length / 2);
		const options = grid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-flow-col auto-cols-fr gap-2",
			style: { gridTemplateRows: `repeat(${gridRows}, auto)` },
			children: group.options.map((o_0, i) => renderRow(o_0, i))
		}) : group.options.map((o_1, i_0) => renderRow(o_1, i_0));
		const t10 = inline ? "flex-row" : "flex-col";
		if ($[26] !== t10) {
			t2 = cn$2("flex gap-2", t10);
			$[26] = t10;
			$[27] = t2;
		} else t2 = $[27];
		t3 = group.multi ? "group" : "radiogroup";
		t4 = labelId;
		t5 = descId;
		t6 = options;
		t7 = group.other && renderRow(group.other.option, group.options.length);
		$[1] = descId;
		$[2] = grid;
		$[3] = group.multi;
		$[4] = group.options;
		$[5] = group.other;
		$[6] = inline;
		$[7] = labelId;
		$[8] = onChange;
		$[9] = onOtherTextChange;
		$[10] = otherId;
		$[11] = selected;
		$[12] = t2;
		$[13] = t3;
		$[14] = t4;
		$[15] = t5;
		$[16] = t6;
		$[17] = t7;
	} else {
		t2 = $[12];
		t3 = $[13];
		t4 = $[14];
		t5 = $[15];
		t6 = $[16];
		t7 = $[17];
	}
	let t8;
	if ($[28] !== t2 || $[29] !== t3 || $[30] !== t4 || $[31] !== t5 || $[32] !== t6 || $[33] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t2,
			role: t3,
			"aria-labelledby": t4,
			"aria-describedby": t5,
			children: [t6, t7]
		});
		$[28] = t2;
		$[29] = t3;
		$[30] = t4;
		$[31] = t5;
		$[32] = t6;
		$[33] = t7;
		$[34] = t8;
	} else t8 = $[34];
	const groupEl = t8;
	if (!group.other || !selected.includes(group.other.option.id)) return groupEl;
	const t9 = otherText ?? "";
	let t10;
	if ($[35] !== onOtherTextChange) {
		t10 = (e_1) => onOtherTextChange?.(e_1.target.value);
		$[35] = onOtherTextChange;
		$[36] = t10;
	} else t10 = $[36];
	let t11;
	if ($[37] !== group.other.placeholder || $[38] !== t10 || $[39] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			autoFocus: true,
			value: t9,
			onChange: t10,
			placeholder: group.other.placeholder,
			"aria-label": group.other.placeholder,
			className: "h-[42px] rounded-xl px-4"
		});
		$[37] = group.other.placeholder;
		$[38] = t10;
		$[39] = t9;
		$[40] = t11;
	} else t11 = $[40];
	let t12;
	if ($[41] !== groupEl || $[42] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [groupEl, t11]
		});
		$[41] = groupEl;
		$[42] = t11;
		$[43] = t12;
	} else t12 = $[43];
	return t12;
}

export { OnboardingOptionGroup };
