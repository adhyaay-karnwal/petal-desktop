// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/ColorRow.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../../../../../ui/src/components/Text.js";
import { Tooltip } from "../../../../../../../ui/src/components/Tooltip.js";
import { useIsDark } from "../../../../../../../ui/src/hooks/useIsDark.js";
import { Popover, PopoverAnchor, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { InspectorControlAction, InspectorControlInput, InspectorControlShell, InspectorScrubHandle, SourceChip, blurInspectorInputOnEnter, inspectorControlHeight, inspectorControlRadius } from "../primitives.js";
import { useAssetResolver } from "../../../../../shared/contexts/AssetContext.js";
import { useColorPickerSession } from "../../../../../shared/utils/useScrub.js";
import { evaluateNumberInput, filterArithmeticInput } from "../../../../utils/arithmetic.js";
import { useInspectorScrub } from "./useInspectorScrub.js";
import { useClassSuggestions } from "../../../../hooks/useClassSuggestions.js";
import { ActiveClassChip, ActiveClassUnlinkAction } from "./parts/ActiveClassChip.js";
import { parseFill } from "../../../../utils/fillValue.js";
import { useMixedLocalValue } from "../../../../hooks/useMixedLocalValue.js";
import { ColorTokenSuggestions } from "./parts/ColorTokenSuggestions.js";
import { canvasColorToParts, colorToHex6, colorToParts, parseColorParts, setAlphaOn, toHex6 } from "../../../../utils/colorMath.js";
import { ColorPickerPopover } from "./GradientEditor.js";
import { exactColorToken, isCssColor, isTokenQuery, matchColorTokens } from "../../../../utils/colorTokenMatch.js";

function resolveCssColor(raw, cssProperty) {
	if (!raw) return "#000000";
	if (raw.startsWith("#") || raw.startsWith("rgb")) return raw;
	try {
		const temp = document.createElement("div");
		const kebab = cssProperty ? cssProperty.replace(/([A-Z])/g, "-$1").toLowerCase() : "background-color";
		temp.style.cssText = `position:absolute;visibility:hidden;${kebab}:${raw}`;
		document.body.appendChild(temp);
		const result = window.getComputedStyle(temp)[cssProperty || "backgroundColor"] || "";
		document.body.removeChild(temp);
		return result || "#000000";
	} catch {
		return "#000000";
	}
}
function useColorValue(value, localValue, cssProperty) {
	const $ = (0, import_compiler_runtime.c)(17);
	useIsDark();
	const t0 = value || localValue;
	let t1;
	if ($[0] !== cssProperty || $[1] !== t0) {
		t1 = resolveCssColor(t0, cssProperty);
		$[0] = cssProperty;
		$[1] = t0;
		$[2] = t1;
	} else t1 = $[2];
	const resolvedColor = t1;
	let alphaLabel;
	let alphaPct;
	let displayHex;
	let t2;
	if ($[3] !== resolvedColor || $[4] !== value) {
		const colorParts = parseColorParts(resolvedColor) ?? canvasColorToParts(resolvedColor);
		displayHex = colorParts ? toHex6(colorParts.r, colorParts.g, colorParts.b) : "#000000";
		alphaPct = colorParts ? colorParts.a * 100 : 100;
		let t3;
		if ($[9] !== alphaPct) {
			t3 = Math.round(alphaPct);
			$[9] = alphaPct;
			$[10] = t3;
		} else t3 = $[10];
		alphaLabel = String(t3);
		t2 = colorParts ? setAlphaOn(displayHex, alphaPct) : value || "";
		$[3] = resolvedColor;
		$[4] = value;
		$[5] = alphaLabel;
		$[6] = alphaPct;
		$[7] = displayHex;
		$[8] = t2;
	} else {
		alphaLabel = $[5];
		alphaPct = $[6];
		displayHex = $[7];
		t2 = $[8];
	}
	const canonical = t2;
	let t3;
	if ($[11] !== alphaLabel || $[12] !== alphaPct || $[13] !== canonical || $[14] !== displayHex || $[15] !== resolvedColor) {
		t3 = {
			resolvedColor,
			displayHex,
			alphaPct,
			alphaLabel,
			canonical
		};
		$[11] = alphaLabel;
		$[12] = alphaPct;
		$[13] = canonical;
		$[14] = displayHex;
		$[15] = resolvedColor;
		$[16] = t3;
	} else t3 = $[16];
	return t3;
}
function FillPicker(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { value, resolvedSolid, onChange, allowedKinds, suggestions, cssProperty, sourceClass, onSelectClass, onClose, defaultTab, imageConfig, onChangeImageConfig, imageExtras, mediaPreview, imageSizing } = t0;
	let t1;
	if ($[0] !== onSelectClass) {
		t1 = onSelectClass ? (cls) => onSelectClass(cls) : void 0;
		$[0] = onSelectClass;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== allowedKinds || $[3] !== cssProperty || $[4] !== defaultTab || $[5] !== imageConfig || $[6] !== imageExtras || $[7] !== imageSizing || $[8] !== mediaPreview || $[9] !== onChange || $[10] !== onChangeImageConfig || $[11] !== onClose || $[12] !== resolvedSolid || $[13] !== sourceClass || $[14] !== suggestions || $[15] !== t1 || $[16] !== value) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerPopover, {
			value,
			resolvedSolid,
			onChange,
			allowedKinds,
			suggestions,
			cssProperty,
			sourceClass,
			onSelectClass: t1,
			onClose,
			defaultTab,
			imageConfig,
			onChangeImageConfig,
			imageExtras,
			mediaPreview,
			imageSizing
		});
		$[2] = allowedKinds;
		$[3] = cssProperty;
		$[4] = defaultTab;
		$[5] = imageConfig;
		$[6] = imageExtras;
		$[7] = imageSizing;
		$[8] = mediaPreview;
		$[9] = onChange;
		$[10] = onChangeImageConfig;
		$[11] = onClose;
		$[12] = resolvedSolid;
		$[13] = sourceClass;
		$[14] = suggestions;
		$[15] = t1;
		$[16] = value;
		$[17] = t2;
	} else t2 = $[17];
	return t2;
}
function ClassSwatch(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { resolvedColor } = t0;
	let t1;
	if ($[0] !== resolvedColor) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex h-full w-6 shrink-0 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-4 shrink-0 rounded-xs border border-ed-field-border",
				style: { backgroundColor: resolvedColor }
			})
		});
		$[0] = resolvedColor;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function ClassSourceRow(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { label, ariaLabel, showTooltip, interactive, open, onOpenChange, resolvedColor, resolvedValue, sourceClass, isPending, onClear, clearTitle, picker } = t0;
	let t1;
	if ($[0] !== ariaLabel || $[1] !== clearTitle || $[2] !== interactive || $[3] !== isPending || $[4] !== onClear || $[5] !== onOpenChange || $[6] !== open || $[7] !== picker || $[8] !== resolvedColor || $[9] !== resolvedValue || $[10] !== showTooltip || $[11] !== sourceClass) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: interactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open,
				onOpenChange,
				modal: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
						active: open,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlAction, {
								className: "min-w-0 flex-1 justify-start p-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSwatch, { resolvedColor }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
									sourceClass,
									fieldTooltip: showTooltip ? ariaLabel : void 0,
									value: resolvedValue,
									isPending
								})]
							})
						}), onClear && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassUnlinkAction, {
							onClear,
							title: clearTitle
						})]
					})
				}), picker]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSwatch, { resolvedColor }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassChip, {
					sourceClass,
					fieldTooltip: showTooltip ? ariaLabel : void 0,
					value: resolvedValue,
					isPending
				}),
				onClear && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveClassUnlinkAction, {
					onClear,
					title: clearTitle
				})
			] })
		});
		$[0] = ariaLabel;
		$[1] = clearTitle;
		$[2] = interactive;
		$[3] = isPending;
		$[4] = onClear;
		$[5] = onOpenChange;
		$[6] = open;
		$[7] = picker;
		$[8] = resolvedColor;
		$[9] = resolvedValue;
		$[10] = showTooltip;
		$[11] = sourceClass;
		$[12] = t1;
	} else t1 = $[12];
	let t2;
	if ($[13] !== ariaLabel || $[14] !== label || $[15] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "group",
			"aria-label": ariaLabel,
			className: "flex min-w-0 flex-1 flex-col gap-1",
			children: [label, t1]
		});
		$[13] = ariaLabel;
		$[14] = label;
		$[15] = t1;
		$[16] = t2;
	} else t2 = $[16];
	return t2;
}
function HexAlphaInputs(t0) {
	const $ = (0, import_compiler_runtime.c)(72);
	const { label, showTooltip, displayHex, alphaLabel, showMixed, onShowMixed, onCommitHex, onCommitAlpha, tokens, onSelectToken } = t0;
	const [hexDraft, setHexDraft] = import_react.useState(null);
	const [alphaDraft, setAlphaDraft] = import_react.useState(null);
	const [activeToken, setActiveToken] = import_react.useState(-1);
	const [tokensDismissed, setTokensDismissed] = import_react.useState(false);
	let t1;
	if ($[0] !== hexDraft || $[1] !== onSelectToken || $[2] !== tokens || $[3] !== tokensDismissed) {
		t1 = onSelectToken && hexDraft !== null && !tokensDismissed ? matchColorTokens(tokens, hexDraft) : [];
		$[0] = hexDraft;
		$[1] = onSelectToken;
		$[2] = tokens;
		$[3] = tokensDismissed;
		$[4] = t1;
	} else t1 = $[4];
	const tokenMatches = t1;
	let t2;
	if ($[5] !== onSelectToken) {
		t2 = (className) => {
			setHexDraft(null);
			setActiveToken(-1);
			onSelectToken?.(className);
		};
		$[5] = onSelectToken;
		$[6] = t2;
	} else t2 = $[6];
	const pickToken = t2;
	let t3;
	if ($[7] !== alphaDraft || $[8] !== alphaLabel) {
		t3 = () => evaluateNumberInput(alphaDraft ?? alphaLabel, 0) ?? 0;
		$[7] = alphaDraft;
		$[8] = alphaLabel;
		$[9] = t3;
	} else t3 = $[9];
	let t4;
	if ($[10] !== onCommitAlpha) {
		t4 = (next) => {
			const clamped = Math.max(0, Math.min(100, next));
			setAlphaDraft(String(clamped));
			onCommitAlpha(clamped);
		};
		$[10] = onCommitAlpha;
		$[11] = t4;
	} else t4 = $[11];
	const t5 = showMixed && !alphaDraft;
	let t6;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => setAlphaDraft(null);
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== t5) {
		t7 = {
			min: 0,
			max: 100,
			mixed: t5,
			onEnd: t6
		};
		$[13] = t5;
		$[14] = t7;
	} else t7 = $[14];
	const { scrubRef, onInputKeyDown } = useInspectorScrub(t3, t4, t7);
	let t8;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => setTokensDismissed(true);
		$[15] = t8;
	} else t8 = $[15];
	const t9 = showTooltip ? label : void 0;
	const t10 = hexDraft ?? (showMixed ? "" : displayHex);
	let t11;
	if ($[16] !== displayHex || $[17] !== showMixed) {
		t11 = () => setHexDraft(showMixed ? "" : displayHex);
		$[16] = displayHex;
		$[17] = showMixed;
		$[18] = t11;
	} else t11 = $[18];
	let t12;
	if ($[19] !== onShowMixed) {
		t12 = (e) => {
			const next_0 = e.target.value;
			setHexDraft(next_0);
			setTokensDismissed(false);
			setActiveToken(isCssColor(next_0) ? -1 : 0);
			onShowMixed(false);
		};
		$[19] = onShowMixed;
		$[20] = t12;
	} else t12 = $[20];
	let t13;
	if ($[21] !== hexDraft || $[22] !== onCommitHex) {
		t13 = () => {
			if (hexDraft !== null) {
				onCommitHex(hexDraft);
				setHexDraft(null);
			}
			setActiveToken(-1);
		};
		$[21] = hexDraft;
		$[22] = onCommitHex;
		$[23] = t13;
	} else t13 = $[23];
	let t14;
	if ($[24] !== activeToken || $[25] !== pickToken || $[26] !== tokenMatches) {
		t14 = (e_0) => {
			if (tokenMatches.length > 0 && !e_0.nativeEvent.isComposing) {
				const last = tokenMatches.length - 1;
				if (e_0.key === "ArrowDown" || e_0.key === "ArrowUp") {
					e_0.preventDefault();
					setActiveToken((i) => e_0.key === "ArrowDown" ? Math.min(i + 1, last) : Math.max(i - 1, -1));
					return;
				}
				if (e_0.key === "Enter" && activeToken >= 0) {
					e_0.preventDefault();
					pickToken(tokenMatches[Math.min(activeToken, last)].className);
					return;
				}
				if (e_0.key === "Escape") {
					e_0.preventDefault();
					e_0.stopPropagation();
					setTokensDismissed(true);
					return;
				}
			}
			blurInspectorInputOnEnter(e_0);
		};
		$[24] = activeToken;
		$[25] = pickToken;
		$[26] = tokenMatches;
		$[27] = t14;
	} else t14 = $[27];
	const t15 = showMixed ? "-" : "#000000";
	let t16;
	if ($[28] !== hexDraft) {
		t16 = !isTokenQuery(hexDraft ?? "") && "uppercase";
		$[28] = hexDraft;
		$[29] = t16;
	} else t16 = $[29];
	let t17;
	if ($[30] !== t16) {
		t17 = cn$2("px-1", t16);
		$[30] = t16;
		$[31] = t17;
	} else t17 = $[31];
	let t18;
	if ($[32] !== t10 || $[33] !== t11 || $[34] !== t12 || $[35] !== t13 || $[36] !== t14 || $[37] !== t15 || $[38] !== t17 || $[39] !== t9) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			tooltip: t9,
			value: t10,
			onFocus: t11,
			onChange: t12,
			onBlur: t13,
			onKeyDown: t14,
			placeholder: t15,
			className: t17
		});
		$[32] = t10;
		$[33] = t11;
		$[34] = t12;
		$[35] = t13;
		$[36] = t14;
		$[37] = t15;
		$[38] = t17;
		$[39] = t9;
		$[40] = t18;
	} else t18 = $[40];
	let t19;
	if ($[41] !== activeToken || $[42] !== pickToken || $[43] !== t18 || $[44] !== tokenMatches) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorTokenSuggestions, {
			matches: tokenMatches,
			activeIndex: activeToken,
			onPick: pickToken,
			onDismiss: t8,
			children: t18
		});
		$[41] = activeToken;
		$[42] = pickToken;
		$[43] = t18;
		$[44] = tokenMatches;
		$[45] = t19;
	} else t19 = $[45];
	const t20 = showTooltip ? `${label} opacity` : void 0;
	const t21 = alphaDraft ?? (showMixed ? "" : alphaLabel);
	let t22;
	if ($[46] !== alphaLabel || $[47] !== showMixed) {
		t22 = (event) => {
			const input = event.currentTarget;
			setAlphaDraft(showMixed ? "" : alphaLabel);
			requestAnimationFrame(() => input.select());
		};
		$[46] = alphaLabel;
		$[47] = showMixed;
		$[48] = t22;
	} else t22 = $[48];
	let t23;
	if ($[49] !== onShowMixed) {
		t23 = (e_1) => {
			onShowMixed(false);
			setAlphaDraft(filterArithmeticInput(e_1.target.value));
		};
		$[49] = onShowMixed;
		$[50] = t23;
	} else t23 = $[50];
	let t24;
	if ($[51] !== alphaDraft || $[52] !== onCommitAlpha || $[53] !== showMixed) {
		t24 = () => {
			if (alphaDraft !== null && !(showMixed && alphaDraft === "")) {
				const typed = evaluateNumberInput(alphaDraft, 0);
				if (typed !== null) onCommitAlpha(Math.round(Math.max(0, Math.min(100, typed))));
			}
			setAlphaDraft(null);
		};
		$[51] = alphaDraft;
		$[52] = onCommitAlpha;
		$[53] = showMixed;
		$[54] = t24;
	} else t24 = $[54];
	const t25 = showMixed ? "-" : "100";
	let t26;
	if ($[55] !== onInputKeyDown || $[56] !== t20 || $[57] !== t21 || $[58] !== t22 || $[59] !== t23 || $[60] !== t24 || $[61] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			tooltip: t20,
			inputMode: "decimal",
			value: t21,
			onFocus: t22,
			onChange: t23,
			onBlur: t24,
			onKeyDown: onInputKeyDown,
			"aria-label": "Opacity %",
			placeholder: t25,
			className: "pl-1.5 pr-0.5 text-right text-ed-inspector-value"
		});
		$[55] = onInputKeyDown;
		$[56] = t20;
		$[57] = t21;
		$[58] = t22;
		$[59] = t23;
		$[60] = t24;
		$[61] = t25;
		$[62] = t26;
	} else t26 = $[62];
	const t27 = showTooltip ? "Drag to adjust opacity" : void 0;
	let t28;
	if ($[63] !== scrubRef || $[64] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			"aria-hidden": void 0,
			title: t27,
			className: "pl-0.5 pr-1.5 font-normal text-ed-inspector-chrome",
			children: "%"
		});
		$[63] = scrubRef;
		$[64] = t27;
		$[65] = t28;
	} else t28 = $[65];
	let t29;
	if ($[66] !== t26 || $[67] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex h-full w-[60px] shrink-0",
			children: [t26, t28]
		});
		$[66] = t26;
		$[67] = t28;
		$[68] = t29;
	} else t29 = $[68];
	let t30;
	if ($[69] !== t19 || $[70] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t19, t29] });
		$[69] = t19;
		$[70] = t29;
		$[71] = t30;
	} else t30 = $[71];
	return t30;
}
function NativeColorInput(t0) {
	const $ = (0, import_compiler_runtime.c)(29);
	const { label, showTooltip, resolvedColor, localValue, showMixed, onLocalChange, onCommit, onPick, onEndSession } = t0;
	const t1 = showTooltip ? void 0 : false;
	let t2;
	if ($[0] !== resolvedColor) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full w-full",
			style: { backgroundColor: resolvedColor }
		});
		$[0] = resolvedColor;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== localValue) {
		t3 = colorToHex6(localValue);
		$[2] = localValue;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== onPick) {
		t4 = (e) => onPick(e.target.value);
		$[4] = onPick;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== label || $[7] !== onEndSession || $[8] !== t3 || $[9] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "color",
			"aria-label": label,
			value: t3,
			onChange: t4,
			onBlur: onEndSession,
			className: "absolute inset-0 opacity-0 w-full h-full"
		});
		$[6] = label;
		$[7] = onEndSession;
		$[8] = t3;
		$[9] = t4;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t2 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: `relative w-7 shrink-0 overflow-hidden border border-ed-field-border ${inspectorControlHeight} ${inspectorControlRadius}`,
			children: [t2, t5]
		});
		$[11] = t2;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== label || $[15] !== t1 || $[16] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: label,
			open: t1,
			children: t6
		});
		$[14] = label;
		$[15] = t1;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	const t8 = showTooltip ? label : void 0;
	const t9 = showMixed ? "" : localValue;
	let t10;
	if ($[18] !== onLocalChange) {
		t10 = (e_0) => onLocalChange(e_0.target.value);
		$[18] = onLocalChange;
		$[19] = t10;
	} else t10 = $[19];
	const t11 = showMixed ? "-" : "";
	let t12;
	if ($[20] !== onCommit || $[21] !== t10 || $[22] !== t11 || $[23] !== t8 || $[24] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
			className: "flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
				tooltip: t8,
				value: t9,
				onChange: t10,
				onBlur: onCommit,
				onKeyDown: blurInspectorInputOnEnter,
				placeholder: t11,
				className: "px-2"
			})
		});
		$[20] = onCommit;
		$[21] = t10;
		$[22] = t11;
		$[23] = t8;
		$[24] = t9;
		$[25] = t12;
	} else t12 = $[25];
	let t13;
	if ($[26] !== t12 || $[27] !== t7) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t7, t12] });
		$[26] = t12;
		$[27] = t7;
		$[28] = t13;
	} else t13 = $[28];
	return t13;
}
/** Truncates in the middle: the start shrinks to an ellipsis, the end stays whole. */
function MiddleTruncate(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { text } = t0;
	if (text.length <= 24) {
		let t1;
		if ($[0] !== text) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: text
			});
			$[0] = text;
			$[1] = t1;
		} else t1 = $[1];
		return t1;
	}
	let t1;
	if ($[2] !== text) {
		t1 = text.slice(0, -12);
		$[2] = text;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: t1
		});
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== text) {
		t3 = text.slice(-12);
		$[6] = text;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 whitespace-pre",
			children: t3
		});
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== t2 || $[11] !== t4 || $[12] !== text) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0",
			title: text,
			children: [t2, t4]
		});
		$[10] = t2;
		$[11] = t4;
		$[12] = text;
		$[13] = t5;
	} else t5 = $[13];
	return t5;
}
function FillRow(t0) {
	const $ = (0, import_compiler_runtime.c)(28);
	const { label, ariaLabel, showTooltip, editable, open, onOpenChange, onOpenPicker, swatchStyle, fillKind, fillLabel, displayHex, alphaLabel, showMixed, onShowMixed, onCommitHex, onCommitAlpha, tokens, onSelectToken, endAddon, picker, fallback, override } = t0;
	let t1;
	if ($[0] !== alphaLabel || $[1] !== ariaLabel || $[2] !== displayHex || $[3] !== editable || $[4] !== endAddon || $[5] !== fallback || $[6] !== fillKind || $[7] !== fillLabel || $[8] !== onCommitAlpha || $[9] !== onCommitHex || $[10] !== onOpenChange || $[11] !== onOpenPicker || $[12] !== onSelectToken || $[13] !== onShowMixed || $[14] !== open || $[15] !== picker || $[16] !== showMixed || $[17] !== showTooltip || $[18] !== swatchStyle || $[19] !== tokens) {
		t1 = editable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange,
			modal: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
					active: open,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
							"aria-label": "Open color picker",
							title: showTooltip ? `${ariaLabel} picker` : void 0,
							onClick: onOpenPicker,
							className: "w-6 p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-4 shrink-0 rounded-xs border border-ed-field-border bg-ed-muted",
								style: swatchStyle
							})
						}),
						fillKind === "solid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HexAlphaInputs, {
							label: ariaLabel,
							showTooltip,
							displayHex,
							alphaLabel,
							showMixed,
							onShowMixed,
							onCommitHex,
							onCommitAlpha,
							tokens,
							onSelectToken
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
							title: showTooltip ? ariaLabel : void 0,
							onClick: onOpenPicker,
							className: "min-w-0 flex-1 justify-start px-1 text-left text-ed-inspector-value",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiddleTruncate, { text: fillLabel })
						}),
						endAddon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-full shrink-0 items-center border-l border-ed-background px-2 group-hover/inspector-control:border-ed-border group-focus-within/inspector-control:!border-ed-inspector-active-border group-data-[active=true]/inspector-control:!border-ed-inspector-active-border",
							children: endAddon
						})
					]
				})
			}), picker]
		}) : fallback;
		$[0] = alphaLabel;
		$[1] = ariaLabel;
		$[2] = displayHex;
		$[3] = editable;
		$[4] = endAddon;
		$[5] = fallback;
		$[6] = fillKind;
		$[7] = fillLabel;
		$[8] = onCommitAlpha;
		$[9] = onCommitHex;
		$[10] = onOpenChange;
		$[11] = onOpenPicker;
		$[12] = onSelectToken;
		$[13] = onShowMixed;
		$[14] = open;
		$[15] = picker;
		$[16] = showMixed;
		$[17] = showTooltip;
		$[18] = swatchStyle;
		$[19] = tokens;
		$[20] = t1;
	} else t1 = $[20];
	let t2;
	if ($[21] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: t1
		});
		$[21] = t1;
		$[22] = t2;
	} else t2 = $[22];
	let t3;
	if ($[23] !== ariaLabel || $[24] !== label || $[25] !== override || $[26] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "group",
			"aria-label": ariaLabel,
			className: "flex min-w-0 flex-1 flex-col gap-1",
			children: [
				label,
				t2,
				override
			]
		});
		$[23] = ariaLabel;
		$[24] = label;
		$[25] = override;
		$[26] = t2;
		$[27] = t3;
	} else t3 = $[27];
	return t3;
}
function ColorRow(t0) {
	const $ = (0, import_compiler_runtime.c)(133);
	const { label, hideLabel: t1, showTooltip: t2, value, onChange, isMixedValue: t3, source, sourceClass, isPending: t4, onClearOverride, clearOverrideTitle, cssProperty, onSelectClass, allowedFillKinds, onChangeFill, imageConfig, onChangeImageConfig, imageExtras, mediaPreview, imageSizing, fillText, endAddon, defaultPickerTab: t5, open: controlledOpen, onOpenChange } = t0;
	const hideLabel = t1 === void 0 ? false : t1;
	const showTooltip = t2 === void 0 ? true : t2;
	const isMixedValue = t3 === void 0 ? false : t3;
	const isPending = t4 === void 0 ? false : t4;
	const defaultPickerTab = t5 === void 0 ? "custom" : t5;
	const { localValue, setLocalValue, showMixed, setShowMixed } = useMixedLocalValue(value, isMixedValue);
	const resolveAsset = useAssetResolver();
	const { showSuggestions, setShowSuggestions, allSuggestions } = useClassSuggestions(cssProperty, onSelectClass);
	const open = controlledOpen ?? showSuggestions;
	let t6;
	if ($[0] !== onOpenChange || $[1] !== setShowSuggestions) {
		t6 = (o) => onOpenChange ? onOpenChange(o) : setShowSuggestions(o);
		$[0] = onOpenChange;
		$[1] = setShowSuggestions;
		$[2] = t6;
	} else t6 = $[2];
	const setOpen = t6;
	const onPopoverOpenChange = (o_0) => {
		setOpen(o_0);
		if (!o_0) endColorSession();
	};
	const [openTab, setOpenTab] = import_react.useState(defaultPickerTab);
	let t7;
	if ($[3] !== setOpen) {
		t7 = (tab) => {
			setOpenTab(tab);
			setOpen(true);
		};
		$[3] = setOpen;
		$[4] = t7;
	} else t7 = $[4];
	const openWith = t7;
	let t8;
	if ($[5] !== onChange || $[6] !== setLocalValue || $[7] !== setShowMixed) {
		t8 = (next) => {
			setLocalValue(next);
			setShowMixed(false);
			onChange(next);
		};
		$[5] = onChange;
		$[6] = setLocalValue;
		$[7] = setShowMixed;
		$[8] = t8;
	} else t8 = $[8];
	const { onPickerChange: handlePickerChange, endSession: t9 } = useColorPickerSession(t8);
	const endColorSession = t9;
	let t10;
	if ($[9] !== allowedFillKinds) {
		t10 = allowedFillKinds ?? ["solid"];
		$[9] = allowedFillKinds;
		$[10] = t10;
	} else t10 = $[10];
	const fillKinds = t10;
	let t11;
	if ($[11] !== handlePickerChange || $[12] !== onChangeFill) {
		t11 = (next_0, kind) => {
			if (onChangeFill) onChangeFill(next_0, kind);
			else handlePickerChange(next_0);
		};
		$[11] = handlePickerChange;
		$[12] = onChangeFill;
		$[13] = t11;
	} else t11 = $[13];
	const applyFill = t11;
	const { resolvedColor, displayHex, alphaPct, alphaLabel, canonical } = useColorValue(value, localValue, cssProperty);
	let commitAlpha;
	let commitHex;
	let fill;
	let fillLabel;
	let t12;
	if ($[14] !== allSuggestions || $[15] !== alphaPct || $[16] !== applyFill || $[17] !== canonical || $[18] !== cssProperty || $[19] !== displayHex || $[20] !== fillText || $[21] !== isMixedValue || $[22] !== onChange || $[23] !== onSelectClass || $[24] !== resolveAsset || $[25] !== resolvedColor || $[26] !== showMixed || $[27] !== value) {
		fill = parseFill(value || resolvedColor);
		fillLabel = fillText || (fill.kind === "gradient" ? `${fill.type[0].toUpperCase()}${fill.type.slice(1)} Gradient` : fill.kind === "image" ? "Image" : fill.kind === "video" ? "Video" : "Color");
		let t13;
		if ($[33] !== allSuggestions || $[34] !== alphaPct || $[35] !== applyFill || $[36] !== canonical || $[37] !== cssProperty || $[38] !== displayHex || $[39] !== isMixedValue || $[40] !== onChange || $[41] !== onSelectClass) {
			t13 = (typed) => {
				const t = typed.trim();
				const parts = colorToParts(t, cssProperty);
				if (!parts) {
					if (onSelectClass) {
						const exact = exactColorToken(allSuggestions, t);
						if (exact) {
							onSelectClass(exact.className);
							return;
						}
						if (matchColorTokens(allSuggestions, t).length > 0) return;
					}
					if (t && t.toLowerCase() !== displayHex.toLowerCase()) onChange(t);
					return;
				}
				const pct = parts.hasAlpha ? parts.a * 100 : alphaPct;
				const next_1 = setAlphaOn(toHex6(parts.r, parts.g, parts.b), pct);
				if (isMixedValue || next_1.toLowerCase() !== canonical.toLowerCase()) applyFill(next_1, "solid");
			};
			$[33] = allSuggestions;
			$[34] = alphaPct;
			$[35] = applyFill;
			$[36] = canonical;
			$[37] = cssProperty;
			$[38] = displayHex;
			$[39] = isMixedValue;
			$[40] = onChange;
			$[41] = onSelectClass;
			$[42] = t13;
		} else t13 = $[42];
		commitHex = t13;
		let t14;
		if ($[43] !== applyFill || $[44] !== canonical || $[45] !== displayHex) {
			t14 = (pct_0) => {
				const next_2 = setAlphaOn(displayHex, Math.round(pct_0));
				if (next_2.toLowerCase() !== canonical.toLowerCase()) applyFill(next_2, "solid");
			};
			$[43] = applyFill;
			$[44] = canonical;
			$[45] = displayHex;
			$[46] = t14;
		} else t14 = $[46];
		commitAlpha = t14;
		t12 = showMixed ? {} : fill.kind === "gradient" ? { background: value } : fill.kind === "image" ? {
			backgroundImage: `url("${resolveAsset(fill.url)}")`,
			backgroundSize: "cover",
			backgroundPosition: "center"
		} : fill.kind === "video" ? {} : { backgroundColor: resolvedColor };
		$[14] = allSuggestions;
		$[15] = alphaPct;
		$[16] = applyFill;
		$[17] = canonical;
		$[18] = cssProperty;
		$[19] = displayHex;
		$[20] = fillText;
		$[21] = isMixedValue;
		$[22] = onChange;
		$[23] = onSelectClass;
		$[24] = resolveAsset;
		$[25] = resolvedColor;
		$[26] = showMixed;
		$[27] = value;
		$[28] = commitAlpha;
		$[29] = commitHex;
		$[30] = fill;
		$[31] = fillLabel;
		$[32] = t12;
	} else {
		commitAlpha = $[28];
		commitHex = $[29];
		fill = $[30];
		fillLabel = $[31];
		t12 = $[32];
	}
	const swatchStyle = t12;
	let t13;
	if ($[47] !== allSuggestions || $[48] !== applyFill || $[49] !== cssProperty || $[50] !== fillKinds || $[51] !== imageConfig || $[52] !== imageExtras || $[53] !== imageSizing || $[54] !== mediaPreview || $[55] !== onChangeImageConfig || $[56] !== onSelectClass || $[57] !== resolvedColor || $[58] !== setOpen || $[59] !== sourceClass || $[60] !== value) {
		t13 = (defaultTab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FillPicker, {
			value,
			resolvedSolid: resolvedColor,
			onChange: applyFill,
			allowedKinds: fillKinds,
			suggestions: allSuggestions,
			cssProperty,
			sourceClass,
			onSelectClass,
			onClose: () => setOpen(false),
			defaultTab,
			imageConfig,
			onChangeImageConfig,
			imageExtras,
			mediaPreview,
			imageSizing
		});
		$[47] = allSuggestions;
		$[48] = applyFill;
		$[49] = cssProperty;
		$[50] = fillKinds;
		$[51] = imageConfig;
		$[52] = imageExtras;
		$[53] = imageSizing;
		$[54] = mediaPreview;
		$[55] = onChangeImageConfig;
		$[56] = onSelectClass;
		$[57] = resolvedColor;
		$[58] = setOpen;
		$[59] = sourceClass;
		$[60] = value;
		$[61] = t13;
	} else t13 = $[61];
	const picker = t13;
	let t14;
	if ($[62] !== hideLabel || $[63] !== label) {
		t14 = !hideLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			children: label
		});
		$[62] = hideLabel;
		$[63] = label;
		$[64] = t14;
	} else t14 = $[64];
	const rowLabel = t14;
	if (sourceClass && source === "class") {
		const t15 = !!(cssProperty && onSelectClass);
		let t16;
		if ($[65] !== picker) {
			t16 = picker("libraries");
			$[65] = picker;
			$[66] = t16;
		} else t16 = $[66];
		let t17;
		if ($[67] !== clearOverrideTitle || $[68] !== displayHex || $[69] !== isPending || $[70] !== label || $[71] !== onClearOverride || $[72] !== onPopoverOpenChange || $[73] !== open || $[74] !== resolvedColor || $[75] !== rowLabel || $[76] !== showTooltip || $[77] !== sourceClass || $[78] !== t15 || $[79] !== t16) {
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSourceRow, {
				label: rowLabel,
				ariaLabel: label,
				showTooltip,
				interactive: t15,
				open,
				onOpenChange: onPopoverOpenChange,
				resolvedColor,
				resolvedValue: displayHex,
				sourceClass,
				isPending,
				onClear: onClearOverride,
				clearTitle: clearOverrideTitle,
				picker: t16
			});
			$[67] = clearOverrideTitle;
			$[68] = displayHex;
			$[69] = isPending;
			$[70] = label;
			$[71] = onClearOverride;
			$[72] = onPopoverOpenChange;
			$[73] = open;
			$[74] = resolvedColor;
			$[75] = rowLabel;
			$[76] = showTooltip;
			$[77] = sourceClass;
			$[78] = t15;
			$[79] = t16;
			$[80] = t17;
		} else t17 = $[80];
		return t17;
	}
	const t15 = !!cssProperty;
	let t16;
	if ($[81] !== defaultPickerTab || $[82] !== onPopoverOpenChange || $[83] !== open || $[84] !== openWith) {
		t16 = () => open ? onPopoverOpenChange(false) : openWith(defaultPickerTab);
		$[81] = defaultPickerTab;
		$[82] = onPopoverOpenChange;
		$[83] = open;
		$[84] = openWith;
		$[85] = t16;
	} else t16 = $[85];
	const t17 = fill.kind;
	let t18;
	if ($[86] !== openTab || $[87] !== picker) {
		t18 = picker(openTab);
		$[86] = openTab;
		$[87] = picker;
		$[88] = t18;
	} else t18 = $[88];
	let t19;
	if ($[89] !== setLocalValue || $[90] !== setShowMixed) {
		t19 = (v) => {
			setLocalValue(v);
			setShowMixed(false);
		};
		$[89] = setLocalValue;
		$[90] = setShowMixed;
		$[91] = t19;
	} else t19 = $[91];
	let t20;
	if ($[92] !== localValue || $[93] !== onChange || $[94] !== showMixed) {
		t20 = () => {
			if (!showMixed || localValue) onChange(localValue);
		};
		$[92] = localValue;
		$[93] = onChange;
		$[94] = showMixed;
		$[95] = t20;
	} else t20 = $[95];
	let t21;
	if ($[96] !== endColorSession || $[97] !== handlePickerChange || $[98] !== label || $[99] !== localValue || $[100] !== resolvedColor || $[101] !== showMixed || $[102] !== showTooltip || $[103] !== t19 || $[104] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeColorInput, {
			label,
			showTooltip,
			resolvedColor,
			localValue,
			showMixed,
			onLocalChange: t19,
			onCommit: t20,
			onPick: handlePickerChange,
			onEndSession: endColorSession
		});
		$[96] = endColorSession;
		$[97] = handlePickerChange;
		$[98] = label;
		$[99] = localValue;
		$[100] = resolvedColor;
		$[101] = showMixed;
		$[102] = showTooltip;
		$[103] = t19;
		$[104] = t20;
		$[105] = t21;
	} else t21 = $[105];
	let t22;
	if ($[106] !== onClearOverride || $[107] !== source || $[108] !== sourceClass) {
		t22 = sourceClass && source === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, {
				className: sourceClass,
				isOverride: true,
				onClearOverride
			})
		}) : null;
		$[106] = onClearOverride;
		$[107] = source;
		$[108] = sourceClass;
		$[109] = t22;
	} else t22 = $[109];
	let t23;
	if ($[110] !== allSuggestions || $[111] !== alphaLabel || $[112] !== commitAlpha || $[113] !== commitHex || $[114] !== displayHex || $[115] !== endAddon || $[116] !== fill.kind || $[117] !== fillLabel || $[118] !== label || $[119] !== onPopoverOpenChange || $[120] !== onSelectClass || $[121] !== open || $[122] !== rowLabel || $[123] !== setShowMixed || $[124] !== showMixed || $[125] !== showTooltip || $[126] !== swatchStyle || $[127] !== t15 || $[128] !== t16 || $[129] !== t18 || $[130] !== t21 || $[131] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FillRow, {
			label: rowLabel,
			ariaLabel: label,
			showTooltip,
			editable: t15,
			open,
			onOpenChange: onPopoverOpenChange,
			onOpenPicker: t16,
			swatchStyle,
			fillKind: t17,
			fillLabel,
			displayHex,
			alphaLabel,
			showMixed,
			onShowMixed: setShowMixed,
			onCommitHex: commitHex,
			onCommitAlpha: commitAlpha,
			tokens: allSuggestions,
			onSelectToken: onSelectClass,
			endAddon,
			picker: t18,
			fallback: t21,
			override: t22
		});
		$[110] = allSuggestions;
		$[111] = alphaLabel;
		$[112] = commitAlpha;
		$[113] = commitHex;
		$[114] = displayHex;
		$[115] = endAddon;
		$[116] = fill.kind;
		$[117] = fillLabel;
		$[118] = label;
		$[119] = onPopoverOpenChange;
		$[120] = onSelectClass;
		$[121] = open;
		$[122] = rowLabel;
		$[123] = setShowMixed;
		$[124] = showMixed;
		$[125] = showTooltip;
		$[126] = swatchStyle;
		$[127] = t15;
		$[128] = t16;
		$[129] = t18;
		$[130] = t21;
		$[131] = t22;
		$[132] = t23;
	} else t23 = $[132];
	return t23;
}

export { ColorRow };
