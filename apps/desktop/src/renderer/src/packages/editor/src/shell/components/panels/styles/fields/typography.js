// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/fields/typography.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { AddVariableIcon } from "../../../../../../../ui/src/icons.js";
import { Popover, PopoverAnchor, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { InspectorClassPickerIndicator, InspectorControlAction, InspectorControlInput, InspectorControlShell, InspectorScrubHandle } from "../primitives.js";
import { ClassPickerPopover } from "../inputs/parts/ClassPickerPopover.js";
import { useInspectorScrub } from "../inputs/useInspectorScrub.js";
import { useStyleField } from "../StyleOpsContext.js";
import { formatLetterSpacing, letterSpacingInputToCss, parseLetterSpacing } from "../../../../utils/cssValue.js";
import { useClassSuggestions } from "../../../../hooks/useClassSuggestions.js";
import { ActiveClassChip, ActiveClassUnlinkAction } from "../inputs/parts/ActiveClassChip.js";
import { OverrideChip } from "../inputs/parts/OverrideChip.js";

/**
* Bespoke letter-spacing field bound to the StyleOps context. The ordinary
* typography values use the shared InlineInput; this stays custom for its
* percent/em conversion behavior.
*/
/**
* Letter-spacing control bound to the StyleOps context. Behaves like the
* reference tool: the unit is typed inline (the field shows "5%" / "2px"), a
* bare number is percent-of-font-size (stored as `em`), and the value is
* drag-scrubbable via the leading icon. Typed `px` is kept literal; any other
* unit falls back to `%`. The trailing caret opens the Tailwind class picker
* (tracking-*), mirroring the Margin/Padding inputs — when a class drives the
* property it shows the class chip instead. (Conversions live in cssValue.ts.)
*/
function StyleLetterSpacingInput(t0) {
	const $ = (0, import_compiler_runtime.c)(67);
	const { icon } = t0;
	const f = useStyleField("letterSpacing");
	let t1;
	if ($[0] !== f.explicit || $[1] !== f.isMixed) {
		t1 = f.isMixed ? {
			num: null,
			unit: "%"
		} : parseLetterSpacing(f.explicit);
		$[0] = f.explicit;
		$[1] = f.isMixed;
		$[2] = t1;
	} else t1 = $[2];
	const parsed = t1;
	const [draft, setDraft] = import_react.useState(null);
	const display = draft !== null ? draft : parsed.num === null ? "" : `${parsed.num}${parsed.unit}`;
	const { source, sourceClass, isPending, onClearOverride } = f.source;
	let t2;
	if ($[3] !== f) {
		t2 = (raw) => {
			const css = letterSpacingInputToCss(raw);
			setDraft(null);
			if (css !== null) f.set(css);
		};
		$[3] = f;
		$[4] = t2;
	} else t2 = $[4];
	const commit = t2;
	let t3;
	if ($[5] !== draft || $[6] !== f.explicit) {
		t3 = () => parseLetterSpacing((draft !== null ? letterSpacingInputToCss(draft) : null) ?? f.explicit);
		$[5] = draft;
		$[6] = f.explicit;
		$[7] = t3;
	} else t3 = $[7];
	const current = t3;
	let t4;
	if ($[8] !== current) {
		t4 = () => current().num ?? 0;
		$[8] = current;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== current || $[11] !== f) {
		t5 = (next) => {
			const css_0 = formatLetterSpacing(next, current().unit);
			setDraft(null);
			f.set(css_0);
		};
		$[10] = current;
		$[11] = f;
		$[12] = t5;
	} else t5 = $[12];
	const t6 = parsed.unit === "px" ? 2 : 1;
	const t7 = f.isMixed && draft === null;
	let t8;
	if ($[13] !== t6 || $[14] !== t7) {
		t8 = {
			precision: t6,
			mixed: t7
		};
		$[13] = t6;
		$[14] = t7;
		$[15] = t8;
	} else t8 = $[15];
	const { scrubRef, isScrubbing, onInputKeyDown } = useInspectorScrub(t4, t5, t8);
	const { showSuggestions, setShowSuggestions, allSuggestions } = useClassSuggestions("letterSpacing", f.addClass);
	let t9;
	if ($[16] !== setShowSuggestions) {
		t9 = () => setShowSuggestions(false);
		$[16] = setShowSuggestions;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== allSuggestions || $[19] !== f.addClass || $[20] !== sourceClass || $[21] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
			suggestions: allSuggestions,
			cssProperty: "letterSpacing",
			sourceClass,
			onSelect: f.addClass,
			onClose: t9
		});
		$[18] = allSuggestions;
		$[19] = f.addClass;
		$[20] = sourceClass;
		$[21] = t9;
		$[22] = t10;
	} else t10 = $[22];
	const picker = t10;
	let t11;
	if ($[23] !== icon || $[24] !== scrubRef) {
		t11 = icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			children: icon
		}) : null;
		$[23] = icon;
		$[24] = scrubRef;
		$[25] = t11;
	} else t11 = $[25];
	const iconHandle = t11;
	if (sourceClass && source === "class") {
		let t12;
		if ($[26] !== f.value) {
			t12 = parseLetterSpacing(f.value);
			$[26] = f.value;
			$[27] = t12;
		} else t12 = $[27];
		const resolved = t12;
		const chipValue = resolved.num === null ? "" : `${resolved.num}${resolved.unit}`;
		const t13 = isScrubbing || showSuggestions;
		let t14;
		if ($[28] !== chipValue || $[29] !== isPending || $[30] !== sourceClass) {
			t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
					className: "min-w-0 flex-1 justify-start p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
						sourceClass,
						fieldTooltip: "Letter spacing",
						value: chipValue,
						isPending
					})
				})
			});
			$[28] = chipValue;
			$[29] = isPending;
			$[30] = sourceClass;
			$[31] = t14;
		} else t14 = $[31];
		let t15;
		if ($[32] !== onClearOverride) {
			t15 = onClearOverride && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassUnlinkAction, { onClear: onClearOverride });
			$[32] = onClearOverride;
			$[33] = t15;
		} else t15 = $[33];
		let t16;
		if ($[34] !== iconHandle || $[35] !== t13 || $[36] !== t14 || $[37] !== t15) {
			t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
					active: t13,
					children: [
						iconHandle,
						t14,
						t15
					]
				})
			});
			$[34] = iconHandle;
			$[35] = t13;
			$[36] = t14;
			$[37] = t15;
			$[38] = t16;
		} else t16 = $[38];
		let t17;
		if ($[39] !== picker || $[40] !== setShowSuggestions || $[41] !== showSuggestions || $[42] !== t16) {
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showSuggestions,
				onOpenChange: setShowSuggestions,
				modal: false,
				children: [t16, picker]
			});
			$[39] = picker;
			$[40] = setShowSuggestions;
			$[41] = showSuggestions;
			$[42] = t16;
			$[43] = t17;
		} else t17 = $[43];
		return t17;
	}
	const t12 = isScrubbing || showSuggestions;
	const t13 = f.isMixed && draft === null ? "" : display;
	let t14;
	if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = (e) => setDraft(e.target.value);
		$[44] = t14;
	} else t14 = $[44];
	let t15;
	if ($[45] !== commit || $[46] !== draft) {
		t15 = () => {
			if (draft !== null) commit(draft);
		};
		$[45] = commit;
		$[46] = draft;
		$[47] = t15;
	} else t15 = $[47];
	const t16 = f.isMixed ? "-" : "0";
	let t17;
	if ($[48] !== onInputKeyDown || $[49] !== t13 || $[50] !== t15 || $[51] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			tooltip: "Letter spacing",
			value: t13,
			onChange: t14,
			onBlur: t15,
			onKeyDown: onInputKeyDown,
			placeholder: t16
		});
		$[48] = onInputKeyDown;
		$[49] = t13;
		$[50] = t15;
		$[51] = t16;
		$[52] = t17;
	} else t17 = $[52];
	let t18;
	if ($[53] !== onClearOverride || $[54] !== source || $[55] !== sourceClass) {
		t18 = sourceClass && source === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverrideChip, {
			sourceClass,
			onClearOverride,
			className: "max-w-15"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
				title: "Apply class",
				"aria-label": "Letter-spacing Tailwind classes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorClassPickerIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddVariableIcon, {}) })
			})
		});
		$[53] = onClearOverride;
		$[54] = source;
		$[55] = sourceClass;
		$[56] = t18;
	} else t18 = $[56];
	let t19;
	if ($[57] !== iconHandle || $[58] !== t12 || $[59] !== t17 || $[60] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
				active: t12,
				children: [
					iconHandle,
					t17,
					t18
				]
			})
		});
		$[57] = iconHandle;
		$[58] = t12;
		$[59] = t17;
		$[60] = t18;
		$[61] = t19;
	} else t19 = $[61];
	let t20;
	if ($[62] !== picker || $[63] !== setShowSuggestions || $[64] !== showSuggestions || $[65] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open: showSuggestions,
			onOpenChange: setShowSuggestions,
			modal: false,
			children: [t19, picker]
		});
		$[62] = picker;
		$[63] = setShowSuggestions;
		$[64] = showSuggestions;
		$[65] = t19;
		$[66] = t20;
	} else t20 = $[66];
	return t20;
}

export { StyleLetterSpacingInput };
