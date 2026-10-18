// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/WebviewEditPanel.tsx
import { import_jsx_runtime } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { CaretDownIcon, CaretUpIcon, CodeIcon, GlobeIcon, LightningIcon } from "../../../../../ui/src/icons.js";
import { m$11 } from "../../../../../../vendor/@phosphor-icons/react.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { ensureV2 } from "../../../../../compiler/src/store/ensureV2.js";
import { IconBtn, InspectorControlInput, InspectorControlShell, InspectorRailRow, blurInspectorInputOnEnter } from "./styles/primitives.js";
import { InspectorSection } from "./styles/sections/InspectorSection.js";
import { InspectorDropdown } from "./styles/inputs/parts/InspectorDropdown.js";
import { Panel, PanelGroup$1 } from "../../../../../../vendor/react-resizable-panels.js";
import { PanelDivider } from "../../../shared/components/PanelDivider.js";
import { useWebviewEditState, webviewEditStore } from "../../../shared/state/webviewEditStore.js";
import { normalizePreviewUrl } from "../../../shared/utils/previewUrl.js";
import { previewPageOfFrame } from "../../../canvas/utils/renderElement.js";
import { DimensionInput } from "./styles/inputs/DimensionInput.js";
import { StylesPanelTabs } from "./StylesPanelTabs.js";

/**
* WebviewEditPanel — right-sidebar controls + change list for a live-webview
* edit session. The webview itself renders on the canvas (WebviewRenderer);
* all of its chrome lives here so the canvas frame stays clean.
*
* Reads/drives the shared webviewEditStore. Shows:
*   - URL, size and Refresh (Interact / Capture / Snapshot live in PreviewToolbar)
*   - the current selection + its tier badge (Direct edit vs Requires AI)
*   - the categorized change list (deterministic vs AI)
*/
var LIVE_ID = "live-tweak";
/** The smallest page the preview renders at (WebviewRenderer clamps to it too). */
var MIN_PAGE_SIZE = 200;
/** Common device viewport presets for the webview size. */
var SIZE_PRESETS = [
	{
		name: "iPhone",
		w: 390,
		h: 844
	},
	{
		name: "iPad",
		w: 834,
		h: 1112
	},
	{
		name: "Laptop",
		w: 1280,
		h: 800
	},
	{
		name: "MacBook Pro 14\"",
		w: 1512,
		h: 982
	},
	{
		name: "Desktop",
		w: 1920,
		h: 1080
	}
];
/**
* The real Styles panel, reused for a LIVE element. Builds a synthetic store
* from the selection and routes the panel's class/style outputs to deterministic
* source edits. This is a SEPARATE instance from the canvas one — same component,
* different inputs — so canvas styling behavior is untouched.
*/
function LiveStylesPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { selection } = t0;
	const t1 = selection.tag || "div";
	let t2;
	if ($[0] !== selection.className || $[1] !== t1) {
		t2 = ensureV2([{
			id: LIVE_ID,
			type: "html",
			tag: t1,
			props: { className: selection.className },
			styles: {},
			children: []
		}]);
		$[0] = selection.className;
		$[1] = t1;
		$[2] = t2;
	} else t2 = $[2];
	const store = t2;
	let t3;
	if ($[3] !== store) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylesPanelTabs, {
			selectedElementId: LIVE_ID,
			store,
			onUpdateElementStyles: _temp$56,
			onUpdateElementProps: _temp2$36
		});
		$[3] = store;
		$[4] = t3;
	} else t3 = $[4];
	return t3;
}
function _temp2$36(_id_0, props) {
	if (typeof props.className === "string") webviewEditStore.getActions()?.applyClassName(props.className);
}
function _temp$56(_id, styles) {
	const out = {};
	for (const [k, v] of Object.entries(styles)) if (v != null) out[k] = String(v);
	if (Object.keys(out).length) webviewEditStore.getActions()?.applyStyles(out);
}
function TierBadge(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { tier } = t0;
	if (tier === "direct") {
		let t1;
		if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
				style: {
					background: "rgba(34,197,94,0.12)",
					color: "#16a34a"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeIcon, {
					width: 12,
					height: 12
				}), " Direct edit"]
			});
			$[0] = t1;
		} else t1 = $[0];
		return t1;
	}
	if (tier === "ai") {
		let t1;
		if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
				style: {
					background: "rgba(168,85,247,0.12)",
					color: "#9333ea"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LightningIcon, {
					width: 12,
					height: 12
				}), " Requires AI"]
			});
			$[1] = t1;
		} else t1 = $[1];
		return t1;
	}
	let t1;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-ed-muted-foreground",
			style: { background: "var(--ed-accent, rgba(0,0,0,0.06))" },
			children: "…"
		});
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}
/** The inspector's "Live Preview" section: URL, size and device preset. */
function WebviewEditPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(79);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const { onNavigate } = t1;
	const s = useWebviewEditState();
	let t2;
	if ($[2] !== onNavigate || $[3] !== s.webviewUrl) {
		t2 = (url) => {
			const next = normalizePreviewUrl(url);
			if (!next || next === s.webviewUrl) return;
			if (onNavigate) onNavigate(next);
			else webviewEditStore.getActions()?.navigate(next);
		};
		$[2] = onNavigate;
		$[3] = s.webviewUrl;
		$[4] = t2;
	} else t2 = $[4];
	const goTo = t2;
	let t3;
	if ($[5] !== s.webviewHeight || $[6] !== s.webviewWidth) {
		t3 = SIZE_PRESETS.find((p) => p.w === s.webviewWidth && p.h === s.webviewHeight);
		$[5] = s.webviewHeight;
		$[6] = s.webviewWidth;
		$[7] = t3;
	} else t3 = $[7];
	const preset = t3;
	const liveSize = s.activeWebviewId;
	const setPageSize = _temp3$26;
	let t4;
	if ($[8] !== s.changes) {
		t4 = s.changes.filter(_temp4$25);
		$[8] = s.changes;
		$[9] = t4;
	} else t4 = $[9];
	const direct = t4;
	let t5;
	if ($[10] !== s.changes) {
		t5 = s.changes.filter(_temp5$22);
		$[10] = s.changes;
		$[11] = t5;
	} else t5 = $[11];
	const ai = t5;
	let t6;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Reload",
			onClick: _temp6$17,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$11, { size: 16 })
		});
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeIcon, { className: "ml-1.5 shrink-0 text-ed-inspector-chrome" });
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== goTo) {
		t8 = (e) => goTo(e.target.value);
		$[14] = goTo;
		$[15] = t8;
	} else t8 = $[15];
	let t9;
	if ($[16] !== s.webviewUrl || $[17] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: t6,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, { children: [t7, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
				"aria-label": "URL",
				defaultValue: s.webviewUrl,
				spellCheck: false,
				onKeyDown: blurInspectorInputOnEnter,
				onBlur: t8
			}, s.webviewUrl)] })
		});
		$[16] = s.webviewUrl;
		$[17] = t8;
		$[18] = t9;
	} else t9 = $[18];
	const t10 = s.fittedHeight ? "Restore height" : "Fit to page height";
	let t11;
	if ($[19] !== s.fittedHeight) {
		t11 = s.fittedHeight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretUpIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, {});
		$[19] = s.fittedHeight;
		$[20] = t11;
	} else t11 = $[20];
	let t12;
	if ($[21] !== s.fittedHeight || $[22] !== t10 || $[23] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t10,
			active: s.fittedHeight,
			onClick: _temp7$14,
			children: t11
		});
		$[21] = s.fittedHeight;
		$[22] = t10;
		$[23] = t11;
		$[24] = t12;
	} else t12 = $[24];
	const t13 = `${s.webviewWidth}px`;
	let t14;
	if ($[25] !== liveSize) {
		t14 = liveSize ? {
			elementId: liveSize,
			text: _temp8$10
		} : void 0;
		$[25] = liveSize;
		$[26] = t14;
	} else t14 = $[26];
	let t15;
	if ($[27] !== s.webviewHeight) {
		t15 = (v) => setPageSize(parseFloat(v), s.webviewHeight);
		$[27] = s.webviewHeight;
		$[28] = t15;
	} else t15 = $[28];
	let t16;
	if ($[29] !== t13 || $[30] !== t14 || $[31] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label: "W",
			ariaLabel: "Page width",
			value: t13,
			fixedPixels: true,
			min: MIN_PAGE_SIZE,
			live: t14,
			onChange: t15
		});
		$[29] = t13;
		$[30] = t14;
		$[31] = t15;
		$[32] = t16;
	} else t16 = $[32];
	const t17 = `${s.webviewHeight}px`;
	let t18;
	if ($[33] !== liveSize) {
		t18 = liveSize ? {
			elementId: liveSize,
			text: _temp9$8
		} : void 0;
		$[33] = liveSize;
		$[34] = t18;
	} else t18 = $[34];
	let t19;
	if ($[35] !== s.webviewWidth) {
		t19 = (v_0) => setPageSize(s.webviewWidth, parseFloat(v_0));
		$[35] = s.webviewWidth;
		$[36] = t19;
	} else t19 = $[36];
	let t20;
	if ($[37] !== t17 || $[38] !== t18 || $[39] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label: "H",
			ariaLabel: "Page height",
			value: t17,
			fixedPixels: true,
			min: MIN_PAGE_SIZE,
			live: t18,
			onChange: t19
		});
		$[37] = t17;
		$[38] = t18;
		$[39] = t19;
		$[40] = t20;
	} else t20 = $[40];
	let t21;
	if ($[41] !== t16 || $[42] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 grid-cols-2 gap-2",
			children: [t16, t20]
		});
		$[41] = t16;
		$[42] = t20;
		$[43] = t21;
	} else t21 = $[43];
	let t22;
	if ($[44] !== t12 || $[45] !== t21) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: t12,
			children: t21
		});
		$[44] = t12;
		$[45] = t21;
		$[46] = t22;
	} else t22 = $[46];
	const t23 = preset?.name ?? "Custom";
	const t24 = preset?.name ?? "";
	let t25;
	let t26;
	if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = SIZE_PRESETS.map(_temp0$7);
		t26 = (name) => {
			const p_1 = SIZE_PRESETS.find((x) => x.name === name);
			if (p_1) setPageSize(p_1.w, p_1.h);
		};
		$[47] = t25;
		$[48] = t26;
	} else {
		t25 = $[47];
		t26 = $[48];
	}
	let t27;
	if ($[49] !== t23 || $[50] !== t24) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label: "Device preset",
			hasIcon: false,
			value: t23,
			selectedValue: t24,
			options: t25,
			onValueChange: t26
		}) });
		$[49] = t23;
		$[50] = t24;
		$[51] = t27;
	} else t27 = $[51];
	let t28;
	if ($[52] !== t22 || $[53] !== t27 || $[54] !== t9) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-b border-ed-divider",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorSection, {
				title: "Live Preview",
				reserveActionRail: true,
				children: [
					t9,
					t22,
					t27
				]
			})
		});
		$[52] = t22;
		$[53] = t27;
		$[54] = t9;
		$[55] = t28;
	} else t28 = $[55];
	let t29;
	if ($[56] !== s.mode || $[57] !== s.selection) {
		t29 = s.mode === "edit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-2.5 border-b border-ed-border shrink-0",
			children: !s.selection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] text-ed-muted-foreground",
				children: "Click an element in the preview to edit it."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px] font-semibold",
							children: `<${s.selection.tag}>`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TierBadge, { tier: s.selection.tier })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-ed-muted-foreground truncate",
						children: s.selection.src ? `${s.selection.src.filePath.split("/").slice(-1)[0]}:${s.selection.src.lineNumber}` : s.selection.resolveState === "failed" ? "couldn’t locate in source" : "resolving…"
					}),
					s.selection.resolveState === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px]",
						style: { color: "#d97706" },
						children: "This element couldn’t be pinpointed in source (ambiguous, dynamic, or unsupported framework). Edit it via AI or Capture instead."
					}),
					s.selection.tier === "ai" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-ed-muted-foreground",
						children: "Styling comes from the component definition — changes will be saved via AI."
					}),
					s.selection.resolveState === "resolved" && s.selection.tier !== "ai" && s.selection.text != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] text-ed-muted-foreground",
							children: "Text"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: s.selection.text,
							className: "w-full mt-1 px-2 py-1.5 rounded-md border border-ed-border bg-ed-background text-[12px]",
							onKeyDown: _temp1$7,
							onBlur: (e_1) => {
								if (e_1.target.value !== s.selection.text) webviewEditStore.getActions()?.commitText(e_1.target.value);
							}
						}, s.selection.text ?? "")]
					})
				]
			})
		});
		$[56] = s.mode;
		$[57] = s.selection;
		$[58] = t29;
	} else t29 = $[58];
	let t30;
	if ($[59] !== s.syncing) {
		t30 = s.syncing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-3 py-2 border-b border-ed-border shrink-0 text-[12px] flex items-center gap-2",
			style: { color: "#2563eb" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" }), "Syncing to app…"]
		});
		$[59] = s.syncing;
		$[60] = t30;
	} else t30 = $[60];
	let t31;
	if ($[61] !== s.status || $[62] !== s.syncing) {
		t31 = s.status && !s.syncing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-2 border-b border-ed-border shrink-0 text-[12px]",
			style: { color: "#d97706" },
			children: s.status
		});
		$[61] = s.status;
		$[62] = s.syncing;
		$[63] = t31;
	} else t31 = $[63];
	let t32;
	if ($[64] !== s.changes) {
		t32 = s.changes.some(_temp10$7) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-3 py-2 border-b border-ed-border shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: _temp11$7,
				className: "w-full bg-ed-foreground text-ed-background hover:opacity-90",
				style: {
					height: 32,
					borderRadius: 8,
					border: "none",
					fontSize: 12,
					fontWeight: 600
				},
				children: [
					"Save to code (",
					s.changes.filter(_temp12$5).length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-ed-muted-foreground mt-1 text-center",
				children: "Edits preview live; nothing is written until you save."
			})]
		});
		$[64] = s.changes;
		$[65] = t32;
	} else t32 = $[65];
	let t33;
	if ($[66] !== ai || $[67] !== direct || $[68] !== s.changes.length || $[69] !== s.mode || $[70] !== s.selection) {
		t33 = s.mode === "edit" && (s.selection && s.selection.tier !== "ai" && s.selection.resolveState === "resolved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelGroup$1, {
			direction: "vertical",
			autoSaveId: "webview-changes-styles",
			className: "flex-1 min-h-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					defaultSize: 30,
					minSize: 10,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangesList, {
						direct,
						ai,
						count: s.changes.length
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelDivider, { className: "bg-ed-border" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					defaultSize: 70,
					minSize: 20,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
						className: "h-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStylesPanel, { selection: s.selection })
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-h-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangesList, {
				direct,
				ai,
				count: s.changes.length
			})
		}));
		$[66] = ai;
		$[67] = direct;
		$[68] = s.changes.length;
		$[69] = s.mode;
		$[70] = s.selection;
		$[71] = t33;
	} else t33 = $[71];
	let t34;
	if ($[72] !== t28 || $[73] !== t29 || $[74] !== t30 || $[75] !== t31 || $[76] !== t32 || $[77] !== t33) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-full flex flex-col overflow-hidden text-ed-foreground",
			children: [
				t28,
				t29,
				t30,
				t31,
				t32,
				t33
			]
		});
		$[72] = t28;
		$[73] = t29;
		$[74] = t30;
		$[75] = t31;
		$[76] = t32;
		$[77] = t33;
		$[78] = t34;
	} else t34 = $[78];
	return t34;
}
function _temp12$5(c_1) {
	return !c_1.saved;
}
function _temp11$7() {
	return webviewEditStore.getActions()?.saveToCode();
}
function _temp10$7(c_2) {
	return !c_2.saved;
}
function _temp1$7(e_0) {
	if (e_0.key === "Enter") webviewEditStore.getActions()?.commitText(e_0.target.value);
}
function _temp0$7(p_0) {
	return {
		value: p_0.name,
		label: `${p_0.name}  ${p_0.w} × ${p_0.h}`
	};
}
function _temp9$8(size_0) {
	return String(previewPageOfFrame(size_0).height);
}
function _temp8$10(size) {
	return String(previewPageOfFrame(size).width);
}
function _temp7$14() {
	return webviewEditStore.requestFitHeight();
}
function _temp6$17() {
	return webviewEditStore.requestRefresh();
}
function _temp5$22(c_0) {
	return c_0.tier === "ai";
}
function _temp4$25(c) {
	return c.tier === "direct";
}
function _temp3$26(width, height) {
	if (!Number.isFinite(width) || !Number.isFinite(height)) return;
	webviewEditStore.getActions()?.setSize(Math.round(width), Math.round(height));
}
function ChangesList(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { direct, ai, count } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px] font-medium",
			children: "Changes"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== count) {
		t2 = count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "text-[11px] text-ed-muted-foreground hover:text-ed-foreground",
			onClick: _temp13$5,
			children: "Clear"
		});
		$[1] = count;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-2",
			children: [t1, t2]
		});
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== ai || $[6] !== count || $[7] !== direct) {
		t4 = count === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[12px] text-ed-muted-foreground",
			children: "No changes yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeGroup, {
				title: "Direct (written to code)",
				tier: "direct",
				changes: direct
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeGroup, {
				title: "Requires AI",
				tier: "ai",
				changes: ai
			})]
		});
		$[5] = ai;
		$[6] = count;
		$[7] = direct;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== t3 || $[10] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
			className: "h-full",
			viewportClassName: "p-3",
			children: [t3, t4]
		});
		$[9] = t3;
		$[10] = t4;
		$[11] = t5;
	} else t5 = $[11];
	return t5;
}
function _temp13$5() {
	return webviewEditStore.getActions()?.discardChanges();
}
function ChangeGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { title, tier, changes } = t0;
	if (changes.length === 0) return null;
	let t1;
	if ($[0] !== tier) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TierBadge, { tier });
		$[0] = tier;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== title) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-muted-foreground",
			children: title
		});
		$[2] = title;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 mb-1.5",
			children: [t1, t2]
		});
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== changes) {
		t4 = changes.map(_temp14$5);
		$[7] = changes;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-1",
			children: t4
		});
		$[9] = t4;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t3 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t3, t5] });
		$[11] = t3;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}
function _temp14$5(c) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-ed-border px-2.5 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px] font-medium truncate",
				children: c.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-ed-muted-foreground",
				children: c.saved ? "saved" : "staged"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[11px] text-ed-muted-foreground",
			children: [
				c.property,
				": ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "line-through",
					children: c.before || "∅"
				}),
				" → ",
				c.after
			]
		})]
	}, c.id);
}

export { WebviewEditPanel };
