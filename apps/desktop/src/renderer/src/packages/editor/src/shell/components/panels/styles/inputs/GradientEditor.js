// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/GradientEditor.tsx
// Contains an import cycle merged from: packages/editor/src/shell/components/panels/styles/inputs/GradientEditor.tsx, packages/editor/src/shell/components/panels/styles/inputs/ColorPickerPopover.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { GradientIcon, ImageIcon, MinusIcon, PlayIcon, PlusIcon, SpinnerIcon, UploadIcon } from "../../../../../../../ui/src/icons.js";
import { Tooltip } from "../../../../../../../ui/src/components/Tooltip.js";
import { e$5 } from "../../../../../../../../vendor/@phosphor-icons/react.js";
import { ScrollArea } from "../../../../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../../../../vendor/sonner.js";
import { Popover, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { IconBtn, InspectorControlInput, InspectorControlShell, blurInspectorInputOnEnter } from "../primitives.js";
import { InspectorPopoverContent, InspectorPopoverHeader, InspectorPopoverMenu, InspectorPopoverSeparator } from "../InspectorPopover.js";
import { ClassPickerContent } from "./ClassPickerContent.js";
import { InspectorDropdown } from "./parts/InspectorDropdown.js";
import { useUploadImage } from "../../../../../shared/hooks/useUploadImage.js";
import { fileToUrl } from "../../../../../shared/utils/clipboard.js";
import { useAssetResolver } from "../../../../../shared/contexts/AssetContext.js";
import { evaluateNumberInput, filterArithmeticInput } from "../../../../utils/arithmetic.js";
import { ActiveClassChip } from "./parts/ActiveClassChip.js";
import { defaultGradient, parseFill, serializeFill } from "../../../../utils/fillValue.js";
import { PopoverFieldRow } from "./PopoverFieldRow.js";
import { alphaPct, buildColor, clamp$1, colorToHex, rgbHex6 } from "../../../../utils/colorMath.js";
import { SolidColorPicker } from "./SolidColorPicker.js";

/**
* Gradient editor for the fill picker: a gradient-type dropdown (Linear /
* Radial / Angular; Diamond is shown but disabled — no CSS equivalent), a
* preview bar with draggable stop handles, and a Stops list where each stop has
* a position (drag the handle), a color swatch, a hex input and an alpha
* percentage. Edits serialize back to a gradient {@link Fill} via onChange.
*/
var GRADIENT_TYPES = [
	{
		type: "linear",
		label: "Linear"
	},
	{
		type: "radial",
		label: "Radial"
	},
	{
		type: "angular",
		label: "Angular"
	}
];
/** Left→right preview of the stops, regardless of gradient type/angle. */
function barCss(stops) {
	return `linear-gradient(to right, ${stops.slice().sort((a, b) => a.pos - b.pos).map((st) => `${st.color} ${Math.round(st.pos)}%`).join(", ")})`;
}
function GradientEditor(t0) {
	const $ = (0, import_compiler_runtime.c)(83);
	const { fill, onChange, suggestions: t1, cssProperty, className } = t0;
	let t2;
	if ($[0] !== t1) {
		t2 = t1 === void 0 ? [] : t1;
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	const suggestions = t2;
	const barRef = import_react.useRef(null);
	const [selected, setSelected] = import_react.useState(0);
	const [openStop, setOpenStop] = import_react.useState(null);
	const [draft, setDraft] = import_react.useState(null);
	const stops = fill.stops;
	const sel = Math.min(selected, stops.length - 1);
	let t3;
	if ($[2] !== suggestions) {
		t3 = (color) => suggestions.find((s) => s.value === color || s.rawValue === color)?.className;
		$[2] = suggestions;
		$[3] = t3;
	} else t3 = $[3];
	const classForColor = t3;
	let t4;
	if ($[4] !== fill.angle || $[5] !== fill.type || $[6] !== onChange || $[7] !== stops) {
		t4 = (next) => onChange({
			kind: "gradient",
			type: fill.type,
			angle: fill.angle,
			stops,
			...next
		});
		$[4] = fill.angle;
		$[5] = fill.type;
		$[6] = onChange;
		$[7] = stops;
		$[8] = t4;
	} else t4 = $[8];
	const emit = t4;
	let t5;
	if ($[9] !== emit || $[10] !== stops) {
		t5 = (i, patch) => emit({ stops: stops.map((s_0, idx) => idx === i ? {
			...s_0,
			...patch
		} : s_0) });
		$[9] = emit;
		$[10] = stops;
		$[11] = t5;
	} else t5 = $[11];
	const setStop = t5;
	let t10;
	let t11;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[12] !== classForColor || $[13] !== className || $[14] !== cssProperty || $[15] !== draft || $[16] !== emit || $[17] !== fill.angle || $[18] !== fill.type || $[19] !== onChange || $[20] !== openStop || $[21] !== sel || $[22] !== setStop || $[23] !== stops || $[24] !== suggestions) {
		const posFromClientX = (clientX) => {
			const r = barRef.current?.getBoundingClientRect();
			if (!r) return 0;
			return clamp$1((clientX - r.left) / r.width * 100, 0, 100);
		};
		const startDrag = (i_0) => (e) => {
			e.stopPropagation();
			setSelected(i_0);
			const move = (ev) => setStop(i_0, { pos: Math.round(posFromClientX(ev.clientX)) });
			const up = () => {
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		};
		let t12;
		if ($[31] !== fill.angle || $[32] !== fill.type || $[33] !== onChange || $[34] !== sel || $[35] !== stops) {
			t12 = () => {
				const next_0 = [...stops, {
					color: stops[sel]?.color ?? "#ffffff",
					pos: 50
				}];
				onChange({
					kind: "gradient",
					type: fill.type,
					angle: fill.angle,
					stops: next_0
				});
				setSelected(next_0.length - 1);
			};
			$[31] = fill.angle;
			$[32] = fill.type;
			$[33] = onChange;
			$[34] = sel;
			$[35] = stops;
			$[36] = t12;
		} else t12 = $[36];
		const addStop = t12;
		let t13;
		if ($[37] !== fill.angle || $[38] !== fill.type || $[39] !== onChange || $[40] !== stops) {
			t13 = (i_1) => {
				if (stops.length <= 2) return;
				const next_1 = stops.filter((_, idx_0) => idx_0 !== i_1);
				onChange({
					kind: "gradient",
					type: fill.type,
					angle: fill.angle,
					stops: next_1
				});
				setSelected((s_1) => Math.max(0, Math.min(s_1, next_1.length - 1)));
			};
			$[37] = fill.angle;
			$[38] = fill.type;
			$[39] = onChange;
			$[40] = stops;
			$[41] = t13;
		} else t13 = $[41];
		const removeStop = t13;
		let t14;
		if ($[42] !== fill.type) {
			t14 = GRADIENT_TYPES.find((t) => t.type === fill.type)?.label ?? "Linear";
			$[42] = fill.type;
			$[43] = t14;
		} else t14 = $[43];
		const currentTypeLabel = t14;
		const ordered = stops.map(_temp$71).sort(_temp2$47);
		if ($[44] !== className) {
			t8 = cn$2("flex flex-col gap-3", className);
			$[44] = className;
			$[45] = t8;
		} else t8 = $[45];
		const t15 = fill.type;
		let t16;
		if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
			t16 = GRADIENT_TYPES.map(_temp3$34);
			$[46] = t16;
		} else t16 = $[46];
		let t17;
		if ($[47] !== emit) {
			t17 = (value) => emit({ type: value });
			$[47] = emit;
			$[48] = t17;
		} else t17 = $[48];
		if ($[49] !== currentTypeLabel || $[50] !== fill.type || $[51] !== t17) {
			t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
					label: "Gradient type",
					value: currentTypeLabel,
					className: "flex-1",
					triggerClassName: "font-medium",
					selectedValue: t15,
					options: t16,
					onValueChange: t17
				})
			});
			$[49] = currentTypeLabel;
			$[50] = fill.type;
			$[51] = t17;
			$[52] = t9;
		} else t9 = $[52];
		let t18;
		if ($[53] !== stops) {
			t18 = barCss(stops);
			$[53] = stops;
			$[54] = t18;
		} else t18 = $[54];
		let t19;
		if ($[55] !== t18) {
			t19 = {
				height: 14,
				background: t18
			};
			$[55] = t18;
			$[56] = t19;
		} else t19 = $[56];
		const t20 = stops.map((s_3, i_3) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onPointerDown: startDrag(i_3),
			"aria-label": `Stop ${i_3 + 1}`,
			className: "absolute -translate-x-1/2 rounded-full",
			style: {
				top: -4,
				left: `${s_3.pos}%`,
				width: 22,
				height: 22,
				border: i_3 === sel ? "3px solid rgba(59,130,246,0.8)" : "3px solid #fff",
				boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
				background: `#${rgbHex6(s_3.color)}`,
				zIndex: i_3 === sel ? 2 : 1
			}
		}, i_3));
		if ($[57] !== t19 || $[58] !== t20) {
			t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: barRef,
				className: "relative rounded-full mx-3",
				style: t19,
				children: t20
			});
			$[57] = t19;
			$[58] = t20;
			$[59] = t10;
		} else t10 = $[59];
		let t21;
		if ($[60] === Symbol.for("react.memo_cache_sentinel")) {
			t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px] font-medium text-ed-foreground",
				children: "Stops"
			});
			$[60] = t21;
		} else t21 = $[60];
		let t22;
		if ($[61] === Symbol.for("react.memo_cache_sentinel")) {
			t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
			$[61] = t22;
		} else t22 = $[61];
		if ($[62] !== addStop) {
			t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [t21, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Add stop",
					onClick: addStop,
					children: t22
				})]
			});
			$[62] = addStop;
			$[63] = t11;
		} else t11 = $[63];
		t6 = "flex flex-col gap-1";
		let t23;
		if ($[64] !== classForColor || $[65] !== cssProperty || $[66] !== draft || $[67] !== openStop || $[68] !== removeStop || $[69] !== sel || $[70] !== setStop || $[71] !== stops.length || $[72] !== suggestions) {
			t23 = (t24) => {
				const { s: s_4, i: i_4 } = t24;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onPointerDown: () => setSelected(i_4),
					className: cn$2("flex items-center gap-1.5 rounded px-1.5 py-1", i_4 === sel && "bg-ed-muted/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "w-7 text-right text-[12px] font-medium text-ed-foreground",
							children: [Math.round(s_4.pos), "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
							open: openStop === i_4,
							onOpenChange: (o) => setOpenStop(o ? i_4 : null),
							modal: false,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `Stop ${i_4 + 1} color`,
									onClick: () => setSelected(i_4),
									className: "shrink-0 rounded border border-ed-border",
									style: {
										width: 22,
										height: 22,
										backgroundColor: `#${rgbHex6(s_4.color)}`
									}
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerPopover, {
								value: s_4.color,
								resolvedSolid: s_4.color,
								onChange: (v) => setStop(i_4, { color: v }),
								allowedKinds: ["solid"],
								suggestions,
								cssProperty,
								onSelectClass: (cls) => {
									const sug = suggestions.find((x) => x.className === cls);
									if (sug) setStop(i_4, { color: sug.value });
									setOpenStop(null);
								},
								onClose: () => setOpenStop(null)
							})]
						}),
						classForColor(s_4.color) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
								sourceClass: classForColor(s_4.color),
								fieldTooltip: `Stop ${i_4 + 1} color`,
								value: s_4.color,
								onClear: () => setStop(i_4, { color: `#${rgbHex6(s_4.color)}` }),
								clearTitle: "Detach",
								clearStopsPropagation: false,
								className: "h-full"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
								tooltip: `Stop ${i_4 + 1} color`,
								value: draft?.i === i_4 && draft.kind === "hex" ? draft.v : rgbHex6(s_4.color),
								onChange: (e_0) => setDraft({
									i: i_4,
									kind: "hex",
									v: e_0.target.value
								}),
								onBlur: () => {
									if (draft?.i === i_4 && draft.kind === "hex") {
										setStop(i_4, { color: buildColor(draft.v, alphaPct(s_4.color)) });
										setDraft(null);
									}
								},
								onKeyDown: blurInspectorInputOnEnter,
								className: "font-mono font-medium"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
							className: "w-15.5 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
								tooltip: `Stop ${i_4 + 1} opacity`,
								inputMode: "numeric",
								value: draft?.i === i_4 && draft.kind === "alpha" ? draft.v : String(alphaPct(s_4.color)),
								onChange: (e_1) => setDraft({
									i: i_4,
									kind: "alpha",
									v: filterArithmeticInput(e_1.target.value)
								}),
								onBlur: () => {
									if (draft?.i === i_4 && draft.kind === "alpha") {
										const typed = evaluateNumberInput(draft.v, 0);
										if (typed !== null) setStop(i_4, { color: buildColor(rgbHex6(s_4.color), Math.round(typed)) });
										setDraft(null);
									}
								},
								onKeyDown: blurInspectorInputOnEnter,
								"aria-label": "Stop opacity %",
								style: { textAlign: "right" },
								className: "px-1 text-right font-mono font-medium"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pr-1 text-[10px] text-ed-foreground",
								children: "%"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: "Remove stop",
							onClick: () => removeStop(i_4),
							disabled: stops.length <= 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {})
						})
					]
				}, i_4);
			};
			$[64] = classForColor;
			$[65] = cssProperty;
			$[66] = draft;
			$[67] = openStop;
			$[68] = removeStop;
			$[69] = sel;
			$[70] = setStop;
			$[71] = stops.length;
			$[72] = suggestions;
			$[73] = t23;
		} else t23 = $[73];
		t7 = ordered.map(t23);
		$[12] = classForColor;
		$[13] = className;
		$[14] = cssProperty;
		$[15] = draft;
		$[16] = emit;
		$[17] = fill.angle;
		$[18] = fill.type;
		$[19] = onChange;
		$[20] = openStop;
		$[21] = sel;
		$[22] = setStop;
		$[23] = stops;
		$[24] = suggestions;
		$[25] = t10;
		$[26] = t11;
		$[27] = t6;
		$[28] = t7;
		$[29] = t8;
		$[30] = t9;
	} else {
		t10 = $[25];
		t11 = $[26];
		t6 = $[27];
		t7 = $[28];
		t8 = $[29];
		t9 = $[30];
	}
	let t12;
	if ($[74] !== t6 || $[75] !== t7) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t6,
			children: t7
		});
		$[74] = t6;
		$[75] = t7;
		$[76] = t12;
	} else t12 = $[76];
	let t13;
	if ($[77] !== t10 || $[78] !== t11 || $[79] !== t12 || $[80] !== t8 || $[81] !== t9) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t8,
			children: [
				t9,
				t10,
				t11,
				t12
			]
		});
		$[77] = t10;
		$[78] = t11;
		$[79] = t12;
		$[80] = t8;
		$[81] = t9;
		$[82] = t13;
	} else t13 = $[82];
	return t13;
}
function _temp3$34(type) {
	return {
		value: type.type,
		label: type.label
	};
}
function _temp2$47(a, b) {
	return a.s.pos - b.s.pos;
}
function _temp$71(s_2, i_2) {
	return {
		s: s_2,
		i: i_2
	};
}
/**
* The fill popover shared by ColorRow. A header menu (like the font picker's
* source menu) switches between **Custom** — a fill-type row (Solid / Gradient
* / Image) over the matching editor (the custom {@link SolidColorPicker}, the
* {@link GradientEditor}, or an image URL field), followed by an "On this
* page" swatch grid sourced from the Tailwind palette — and **Libraries**, the
* searchable Tailwind color-class palette (ClassPickerContent). Available fill
* kinds are caller-controlled (`allowedKinds`).
*/
var FILL_TYPES = [
	{
		kind: "solid",
		label: "Solid",
		Icon: e$5
	},
	{
		kind: "gradient",
		label: "Gradient",
		Icon: GradientIcon
	},
	{
		kind: "image",
		label: "Image",
		Icon: ImageIcon
	},
	{
		kind: "video",
		label: "Video",
		Icon: PlayIcon
	}
];
/** First stop color of a gradient, or the solid color, as a seed. */
function seedColor(fill, resolvedSolid) {
	if (fill.kind === "gradient") return fill.stops[0]?.color ?? "#000000";
	if (fill.kind === "solid") return resolvedSolid || fill.color || "#000000";
	return resolvedSolid || "#000000";
}
var COLOR_SOURCES = [{
	value: "custom",
	label: "Custom"
}, {
	value: "libraries",
	label: "Libraries"
}];
var recentColors = [];
var SIZE_OPTIONS = [
	{
		label: "Cover",
		value: "cover"
	},
	{
		label: "Contain",
		value: "contain"
	},
	{
		label: "Fill",
		value: "100% 100%"
	},
	{
		label: "Auto",
		value: "auto"
	}
];
var VIDEO_SIZE_OPTIONS = SIZE_OPTIONS.filter((option) => option.value !== "auto");
var POSITION_OPTIONS = [
	{
		label: "Center",
		value: "center"
	},
	{
		label: "Top",
		value: "top"
	},
	{
		label: "Bottom",
		value: "bottom"
	},
	{
		label: "Left",
		value: "left"
	},
	{
		label: "Right",
		value: "right"
	},
	{
		label: "Top left",
		value: "top left"
	},
	{
		label: "Top right",
		value: "top right"
	},
	{
		label: "Bottom left",
		value: "bottom left"
	},
	{
		label: "Bottom right",
		value: "bottom right"
	}
];
var REPEAT_OPTIONS = [
	{
		label: "No repeat",
		value: "no-repeat"
	},
	{
		label: "Repeat",
		value: "repeat"
	},
	{
		label: "Repeat X",
		value: "repeat-x"
	},
	{
		label: "Repeat Y",
		value: "repeat-y"
	}
];
function ImageConfigRow(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { label, value, fallback, options, onChange } = t0;
	const current = value ?? fallback;
	let t1;
	if ($[0] !== current || $[1] !== options) {
		let t2;
		if ($[3] !== current) {
			t2 = (option) => option.value === current;
			$[3] = current;
			$[4] = t2;
		} else t2 = $[4];
		t1 = options.find(t2);
		$[0] = current;
		$[1] = options;
		$[2] = t1;
	} else t1 = $[2];
	const currentOption = t1;
	const activeLabel = currentOption?.label ?? "Custom";
	let t2;
	if ($[5] !== current || $[6] !== currentOption || $[7] !== options) {
		t2 = currentOption ? options : [{
			value: current,
			label: "Custom",
			disabled: true
		}, ...options];
		$[5] = current;
		$[6] = currentOption;
		$[7] = options;
		$[8] = t2;
	} else t2 = $[8];
	const menuOptions = t2;
	let t3;
	if ($[9] !== label) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px] text-ed-foreground",
			children: label
		});
		$[9] = label;
		$[10] = t3;
	} else t3 = $[10];
	let t4;
	if ($[11] !== activeLabel || $[12] !== current || $[13] !== label || $[14] !== menuOptions || $[15] !== onChange) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label,
			value: activeLabel,
			className: "w-full",
			selectedValue: current,
			options: menuOptions,
			onValueChange: onChange
		});
		$[11] = activeLabel;
		$[12] = current;
		$[13] = label;
		$[14] = menuOptions;
		$[15] = onChange;
		$[16] = t4;
	} else t4 = $[16];
	let t5;
	if ($[17] !== t3 || $[18] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverFieldRow, {
			label: t3,
			children: t4
		});
		$[17] = t3;
		$[18] = t4;
		$[19] = t5;
	} else t5 = $[19];
	return t5;
}
function ColorPickerPopover(props) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== props) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverContent, {
			"aria-label": "Color picker",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerBody, { ...props })
		});
		$[0] = props;
		$[1] = t0;
	} else t0 = $[1];
	return t0;
}
function ColorPickerBody(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { value, resolvedSolid, onChange, cssProperty, sourceClass, suggestions, onSelectClass, onClose, allowedKinds: t1, defaultTab: t2, imageConfig, onChangeImageConfig, imageExtras, mediaPreview, imageSizing: t3 } = t0;
	const allowedKinds = t1 === void 0 ? ["solid"] : t1;
	const defaultTab = t2 === void 0 ? "custom" : t2;
	const imageSizing = t3 === void 0 ? "background" : t3;
	const [source, setSource] = import_react.useState(onSelectClass ? defaultTab : "custom");
	const fill = parseFill(value || resolvedSolid);
	let t4;
	if ($[0] !== onChange) {
		t4 = (next) => onChange(serializeFill(next), next.kind);
		$[0] = onChange;
		$[1] = t4;
	} else t4 = $[1];
	const emit = t4;
	const uploadImage = useUploadImage();
	const resolveAsset = useAssetResolver();
	const fileInputRef = import_react.useRef(null);
	const [uploading, setUploading] = import_react.useState(false);
	const isVideo = fill.kind === "video";
	const mediaNoun = isVideo ? "video" : "image";
	let t5;
	if ($[2] !== emit || $[3] !== isVideo || $[4] !== uploadImage) {
		t5 = async (file) => {
			const kind = isVideo ? "video" : "image";
			setUploading(true);
			const result = await fileToUrl(file, uploadImage);
			setUploading(false);
			if (result.error || !result.src) {
				toast.error(result.errorMessage || `Failed to upload ${kind}`);
				return;
			}
			emit({
				kind,
				url: result.src
			});
		};
		$[2] = emit;
		$[3] = isVideo;
		$[4] = uploadImage;
		$[5] = t5;
	} else t5 = $[5];
	const handleMediaFile = t5;
	const switchKind = (kind_0) => {
		if (kind_0 === fill.kind) return;
		if (kind_0 === "solid") emit({
			kind: "solid",
			color: seedColor(fill, resolvedSolid)
		});
		else if (kind_0 === "gradient") emit(defaultGradient(seedColor(fill, resolvedSolid)));
		else emit({
			kind: kind_0,
			url: fill.kind === kind_0 ? fill.url : ""
		});
	};
	let swatches;
	if ($[6] !== suggestions) {
		swatches = [];
		const seenSwatches = /* @__PURE__ */ new Set();
		for (const c of [...recentColors, ...suggestions.map(_temp$69)]) {
			const key = (c || "").toLowerCase();
			if (!key || seenSwatches.has(key)) continue;
			seenSwatches.add(key);
			swatches.push(c);
			if (swatches.length >= 28) break;
		}
		$[6] = suggestions;
		$[7] = swatches;
	} else swatches = $[7];
	const fillTypeButton = (t6) => {
		const { kind: kind_1, label, Icon } = t6;
		const active = fill.kind === kind_1;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label,
			active,
			disabled: !allowedKinds.includes(kind_1),
			onClick: () => switchKind(kind_1),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
		}, kind_1);
	};
	const t7 = onSelectClass ? void 0 : allowedKinds.length === 1 && allowedKinds[0] !== "solid" ? FILL_TYPES.find((t8) => {
		const { kind: kind_2 } = t8;
		return kind_2 === allowedKinds[0];
	})?.label : "Color";
	let t9;
	if ($[8] !== onSelectClass || $[9] !== source) {
		t9 = onSelectClass && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverMenu, {
			label: "Color source",
			value: source,
			options: COLOR_SOURCES,
			onValueChange: setSource
		});
		$[8] = onSelectClass;
		$[9] = source;
		$[10] = t9;
	} else t9 = $[10];
	let t10;
	if ($[11] !== onClose || $[12] !== t7 || $[13] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverHeader, {
			title: t7,
			closeLabel: "Close color picker",
			onClose,
			children: t9
		});
		$[11] = onClose;
		$[12] = t7;
		$[13] = t9;
		$[14] = t10;
	} else t10 = $[14];
	const t11 = source === "libraries" && onSelectClass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerContent, {
		suggestions,
		cssProperty,
		sourceClass,
		onSelect: onSelectClass,
		onClose
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
		className: "min-h-0 flex-1",
		children: [
			allowedKinds.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-0.5 pb-1",
				children: FILL_TYPES.filter((t12) => {
					const { kind: kind_3 } = t12;
					return kind_3 !== "video" || allowedKinds.includes("video");
				}).map(fillTypeButton)
			}),
			fill.kind === "gradient" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradientEditor, {
				className: "p-1",
				fill,
				onChange: emit,
				suggestions,
				cssProperty
			}) : fill.kind === "image" || fill.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 p-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						accept: isVideo ? "video/*" : "image/*",
						hidden: true,
						onChange: (e) => {
							const file_0 = e.target.files?.[0];
							e.target.value = "";
							if (file_0) handleMediaFile(file_0);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileInputRef.current?.click(),
						disabled: uploading,
						"aria-label": fill.url ? `Replace ${mediaNoun}` : `Upload ${mediaNoun}`,
						style: !isVideo && fill.url ? { backgroundImage: `url("${typeof mediaPreview === "string" ? mediaPreview : resolveAsset(fill.url)}")` } : void 0,
						className: "group relative h-36 rounded-[5px] border border-ed-border/50 bg-ed-muted bg-center bg-cover flex items-center justify-center gap-1 text-ed-muted-foreground hover:border-ed-ring overflow-hidden",
						children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
							width: 20,
							height: 20,
							className: "animate-spin"
						}) : !fill.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadIcon, {}), " Upload"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: mediaPreview instanceof MediaStream ? void 0 : resolveAsset(fill.url),
							ref: (node) => {
								if (node && mediaPreview instanceof MediaStream) node.srcObject = mediaPreview;
							},
							muted: true,
							loop: true,
							autoPlay: true,
							playsInline: true,
							className: "absolute inset-0 size-full object-cover"
						}, mediaPreview instanceof MediaStream ? "preview" : "source"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute inset-0 flex items-center justify-center gap-1 bg-ed-background/60 text-ed-foreground opacity-0 transition-[opacity] duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadIcon, {}), " Replace"]
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
						tooltip: isVideo ? "Video URL" : "Image URL",
						value: fill.url,
						onChange: (e_0) => emit({
							kind: fill.kind,
							url: e_0.target.value.trim()
						}),
						placeholder: `Or paste ${mediaNoun} URL…`,
						className: "px-2"
					}) }),
					onChangeImageConfig && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageConfigRow, {
							label: "Resize",
							value: imageConfig?.size,
							fallback: "cover",
							options: isVideo ? VIDEO_SIZE_OPTIONS : SIZE_OPTIONS,
							onChange: (size) => onChangeImageConfig({ size })
						}), !isVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageConfigRow, {
							label: "Position",
							value: imageConfig?.position,
							fallback: "center",
							options: POSITION_OPTIONS,
							onChange: (position) => onChangeImageConfig({ position })
						}), imageSizing === "background" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageConfigRow, {
							label: "Repeat",
							value: imageConfig?.repeat,
							fallback: "no-repeat",
							options: REPEAT_OPTIONS,
							onChange: (repeat) => onChangeImageConfig({ repeat })
						})] })]
					}),
					fill.url && imageExtras
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SolidColorPicker, {
				className: "p-1",
				color: resolvedSolid || (fill.kind === "solid" ? fill.color : ""),
				onChange: (hex) => onChange(hex, "solid")
			}),
			fill.kind === "solid" && swatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 p-1",
				children: swatches.map((c_0, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: c_0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": c_0,
						onClick: () => onChange(colorToHex(c_0), "solid"),
						className: "rounded-[4px] border border-ed-border/40",
						style: {
							width: 22,
							height: 22,
							backgroundColor: c_0
						}
					})
				}, `${c_0}-${i}`))
			})] })
		]
	});
	let t13;
	if ($[15] !== t10 || $[16] !== t11) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t10, t11] });
		$[15] = t10;
		$[16] = t11;
		$[17] = t13;
	} else t13 = $[17];
	return t13;
}
function _temp$69(s) {
	return s.value;
}

export { ColorPickerPopover };
