// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/TypographySection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { AlignTextBottomIcon, AlignTextMiddleIcon, AlignTextTopIcon, FontSizeIcon, LetterSpacingIcon$1, LineHeightIcon, OverflowSettingsIcon, TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon } from "../../../../../../../ui/src/icons.js";
import { Popover, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { InspectorPopoverContent, InspectorPopoverHeader } from "../InspectorPopover.js";
import { InspectorSection } from "./InspectorSection.js";
import { TYPOGRAPHY_KEYS } from "../../../../constants.js";
import { useStyleField, useStyleOps } from "../StyleOpsContext.js";
import { isTypographyClass } from "../../../../utils/tailwindClasses.js";
import { StyleColorInput } from "../fields/color.js";
import { getFontDisplayName } from "../../../../utils/typography.js";
import { FontFamilyPicker, FontWeightPicker } from "../typography/FontPickers.js";
import { TextFormatRow } from "../typography/TextFormatRow.js";
import { StyleLetterSpacingInput } from "../fields/typography.js";
import { StyleInlineInput, StyleSectionField, StyleSectionRow, StyleToggleGroupField } from "../fields/controls.js";

/**
* Typography section — color, font family + weight, size, line-height, letter-
* spacing, alignment (text + vertical), and the B/I/U/S format popover. The
* small context-bound helpers (FontFamilyField, TextFormatPopover, the
* alignment option sets) live here since the section is their only consumer.
*/
function LetterSpacingIcon() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterSpacingIcon$1, { className: "text-ed-muted-foreground" });
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
var GENERIC_FAMILIES = /* @__PURE__ */ new Set([
	"sans-serif",
	"serif",
	"monospace",
	"cursive",
	"fantasy",
	"system-ui",
	"ui-sans-serif",
	"ui-serif",
	"ui-monospace",
	"ui-rounded",
	"-apple-system"
]);
/**
* Turn a computed `font-family` value into a friendly family name for the picker
* placeholder, or undefined if there's nothing meaningful to show. Handles
* next/font's hashed names (`__Open_Sans_e8ce7c` → "Open Sans") and skips bare
* CSS generics.
*/
function prettyInheritedFamily(computed) {
	const first = computed.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? "";
	if (!first) return void 0;
	const nextFont = first.match(/^__(.+?)(?:_Fallback)?_[0-9a-z]{6,}$/i);
	if (nextFont) return nextFont[1].replace(/_/g, " ");
	if (GENERIC_FAMILIES.has(first.toLowerCase())) return void 0;
	return first;
}
/** Font family picker bound to `fontFamily` via the StyleOps context. */
function FontFamilyField() {
	const $ = (0, import_compiler_runtime.c)(11);
	const f = useStyleField("fontFamily");
	const { fonts } = useStyleOps();
	const hasExplicit = f.isMixed || !!f.explicit;
	let t0;
	if ($[0] !== f.computed || $[1] !== hasExplicit) {
		const inherited = hasExplicit ? void 0 : prettyInheritedFamily(f.computed);
		t0 = inherited ? getFontDisplayName(inherited) : void 0;
		$[0] = f.computed;
		$[1] = hasExplicit;
		$[2] = t0;
	} else t0 = $[2];
	const inheritedFamily = t0;
	const t1 = f.isMixed ? "" : f.explicit;
	const t2 = f.source.source === "class" ? f.source.sourceClass : void 0;
	let t3;
	if ($[3] !== f.addClass || $[4] !== f.isMixed || $[5] !== f.set || $[6] !== fonts || $[7] !== inheritedFamily || $[8] !== t1 || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontFamilyPicker, {
			value: t1,
			onChange: f.set,
			onSelectClass: f.addClass,
			activeClass: t2,
			fonts,
			inheritedFamily,
			isMixed: f.isMixed
		});
		$[3] = f.addClass;
		$[4] = f.isMixed;
		$[5] = f.set;
		$[6] = fonts;
		$[7] = inheritedFamily;
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}
/** Font weight dropdown bound to the current element's effective font family. */
function FontWeightField() {
	const $ = (0, import_compiler_runtime.c)(12);
	const weight = useStyleField("fontWeight");
	const family = useStyleField("fontFamily");
	const fontStyle = useStyleField("fontStyle");
	const { fonts } = useStyleOps();
	let t0;
	if ($[0] !== family.explicit || $[1] !== fonts) {
		t0 = prettyInheritedFamily(getFontDisplayName(family.explicit, fonts));
		$[0] = family.explicit;
		$[1] = fonts;
		$[2] = t0;
	} else t0 = $[2];
	const configuredFamily = t0;
	let t1;
	if ($[3] !== family.computed) {
		t1 = prettyInheritedFamily(family.computed);
		$[3] = family.computed;
		$[4] = t1;
	} else t1 = $[4];
	const t2 = configuredFamily ?? t1 ?? "";
	const t3 = fontStyle.value || "normal";
	let t4;
	if ($[5] !== fonts || $[6] !== t2 || $[7] !== t3 || $[8] !== weight.isMixed || $[9] !== weight.set || $[10] !== weight.value) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontWeightPicker, {
			family: t2,
			value: weight.value,
			fontStyle: t3,
			fonts,
			isMixed: weight.isMixed,
			onChange: weight.set
		});
		$[5] = fonts;
		$[6] = t2;
		$[7] = t3;
		$[8] = weight.isMixed;
		$[9] = weight.set;
		$[10] = weight.value;
		$[11] = t4;
	} else t4 = $[11];
	return t4;
}
/** Faders affordance that opens the text-format toggles (B/I/U/S). */
function TextFormatPopover() {
	const $ = (0, import_compiler_runtime.c)(22);
	const { get, selectedElementId, onToggleTextFormat } = useStyleOps();
	const [open, setOpen] = (0, import_react.useState)(false);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowSettingsIcon, {});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] !== open) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Text formatting",
				active: open,
				className: "ml-auto",
				children: t0
			})
		});
		$[1] = open;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverHeader, {
			title: "Text formatting",
			closeLabel: "Close text formatting",
			onClose: () => setOpen(false)
		});
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== get) {
		t3 = get("fontWeight");
		$[4] = get;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== get) {
		t4 = get("fontStyle");
		$[6] = get;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== get) {
		t5 = get("textDecoration");
		$[8] = get;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== onToggleTextFormat || $[11] !== selectedElementId) {
		t6 = (format) => onToggleTextFormat?.(selectedElementId, format);
		$[10] = onToggleTextFormat;
		$[11] = selectedElementId;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== t3 || $[14] !== t4 || $[15] !== t5 || $[16] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverContent, {
			"aria-label": "Text formatting",
			className: "w-auto",
			children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-1 pt-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextFormatRow, {
					fontWeight: t3,
					fontStyle: t4,
					textDecoration: t5,
					onToggle: t6
				})
			})]
		});
		$[13] = t3;
		$[14] = t4;
		$[15] = t5;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== open || $[19] !== t1 || $[20] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			modal: false,
			children: [t1, t7]
		});
		$[18] = open;
		$[19] = t1;
		$[20] = t7;
		$[21] = t8;
	} else t8 = $[21];
	return t8;
}
var TEXT_ALIGN_OPTIONS = [
	{
		value: "left",
		label: "Align left",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignLeftIcon, {})
	},
	{
		value: "center",
		label: "Align center",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignCenterIcon, {})
	},
	{
		value: "right",
		label: "Align right",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignRightIcon, {})
	}
];
var VERTICAL_ALIGN_OPTIONS = [
	{
		value: "flex-start",
		label: "Align top",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignTextTopIcon, {})
	},
	{
		value: "center",
		label: "Align middle",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignTextMiddleIcon, {})
	},
	{
		value: "flex-end",
		label: "Align bottom",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignTextBottomIcon, {})
	}
];
function TypographySection() {
	const $ = (0, import_compiler_runtime.c)(19);
	const { hasAny, clear, removeClass, elementClassName, isTextContext } = useStyleOps();
	let t0;
	if ($[0] !== hasAny || $[1] !== isTextContext) {
		t0 = hasAny(...TYPOGRAPHY_KEYS) || isTextContext;
		$[0] = hasAny;
		$[1] = isTextContext;
		$[2] = t0;
	} else t0 = $[2];
	const t1 = isTextContext ? null : void 0;
	let t2;
	if ($[3] !== clear || $[4] !== elementClassName || $[5] !== removeClass) {
		t2 = () => {
			clear(...TYPOGRAPHY_KEYS, "fontStyle", "textDecoration", "backgroundImage", "backgroundClip", "WebkitBackgroundClip", "WebkitTextFillColor");
			const toRemove = (elementClassName ?? "").split(/\s+/).filter(Boolean).filter(isTypographyClass);
			if (toRemove.length) removeClass(toRemove);
		};
		$[3] = clear;
		$[4] = elementClassName;
		$[5] = removeClass;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleColorInput, {
			property: "color",
			label: "Color",
			hideLabel: true
		});
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
			label: "Font",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontFamilyField, {})
		});
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
			label: "Weight",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontWeightField, {})
		});
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StyleSectionRow, { children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
			label: "Size",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleInlineInput, {
				property: "fontSize",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FontSizeIcon, { className: "text-ed-muted-foreground" }),
				unit: "px",
				min: 0
			})
		})] });
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
			label: "Line height",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleInlineInput, {
				property: "lineHeight",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineHeightIcon, { className: "size-3.75 text-ed-muted-foreground" }),
				showUnit: false,
				unitPicker: true,
				preserveUnitless: true,
				min: 0,
				className: "[&_input]:capitalize"
			})
		});
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StyleSectionRow, { children: [t7, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
			label: "Letter spacing",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLetterSpacingInput, { icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterSpacingIcon, {}) })
		})] });
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextFormatPopover, {});
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				t3,
				t4,
				t6,
				t8,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSectionField, {
					label: "Alignment",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
						action: t9,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleToggleGroupField, {
								property: "textAlign",
								label: "Text alignment",
								defaultValue: "left",
								options: TEXT_ALIGN_OPTIONS
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleToggleGroupField, {
								property: "alignItems",
								label: "Vertical alignment",
								defaultValue: "flex-start",
								options: VERTICAL_ALIGN_OPTIONS
							})]
						})
					})
				})
			]
		});
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	if ($[15] !== t0 || $[16] !== t1 || $[17] !== t2) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			variant: "addable",
			title: "Typography",
			isSet: t0,
			action: t1,
			onAdd: _temp$64,
			onRemove: t2,
			children: t10
		});
		$[15] = t0;
		$[16] = t1;
		$[17] = t2;
		$[18] = t11;
	} else t11 = $[18];
	return t11;
}
function _temp$64() {}

export { TypographySection };
