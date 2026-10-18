// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/ImageAdjustments.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { ArrowCounterClockwiseIcon, MinusIcon, PlusIcon } from "../../../../../../../ui/src/icons.js";
import { Button } from "../../../../../../../ui/src/components/Button.js";
import { IconBtn } from "../primitives.js";
import { ADJUST_KEYS } from "../../../../../shared/imageAdjust/imageAdjust.js";
import { InspectorSlider } from "../inputs/InspectorSlider.js";
import { useImageAdjust } from "./useImageAdjust.js";

/** The Color section of the image and video picker: seven adjustment sliders. */
var LABELS = {
	exposure: "Exposure",
	contrast: "Contrast",
	saturation: "Saturation",
	temperature: "Temperature",
	tint: "Tint",
	highlights: "Highlights",
	shadows: "Shadows"
};
var toPercent = (v) => Math.round((v ?? 0) * 100);
function ImageAdjustments(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	const { elementId, url, recordValue, target, apply, onPreview, onUpload, className } = t0;
	let t1;
	if ($[0] !== apply || $[1] !== elementId || $[2] !== onPreview || $[3] !== recordValue || $[4] !== target || $[5] !== url) {
		t1 = {
			elementId,
			url,
			recordValue,
			target,
			apply,
			onPreview
		};
		$[0] = apply;
		$[1] = elementId;
		$[2] = onPreview;
		$[3] = recordValue;
		$[4] = target;
		$[5] = url;
		$[6] = t1;
	} else t1 = $[6];
	const adjust = useImageAdjust(t1);
	const [open, setOpen] = useColorSectionOpen(adjust);
	let t2;
	if ($[7] !== adjust) {
		t2 = ADJUST_KEYS.some((key) => adjust.values[key]);
		$[7] = adjust;
		$[8] = t2;
	} else t2 = $[8];
	const hasValues = t2;
	let t3;
	if ($[9] !== className) {
		t3 = cn$2("flex flex-col gap-2", className);
		$[9] = className;
		$[10] = t3;
	} else t3 = $[10];
	let t4;
	if ($[11] !== open || $[12] !== setOpen) {
		t4 = (event) => {
			if (!open && !event.target.closest("button")) setOpen(true);
		};
		$[11] = open;
		$[12] = setOpen;
		$[13] = t4;
	} else t4 = $[13];
	let t5;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px] text-ed-foreground",
			children: "Color"
		});
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== adjust || $[16] !== hasValues || $[17] !== open || $[18] !== setOpen) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1.5",
			children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				adjust.status === "saving" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveProgress, { progress: adjust.progress }),
				hasValues && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Reset all",
					onClick: adjust.reset,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowCounterClockwiseIcon, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Remove",
					onClick: () => {
						adjust.reset();
						setOpen(false);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {})
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Add",
				onClick: () => setOpen(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
			})
		});
		$[15] = adjust;
		$[16] = hasValues;
		$[17] = open;
		$[18] = setOpen;
		$[19] = t6;
	} else t6 = $[19];
	let t7;
	if ($[20] !== t4 || $[21] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-6.5 items-center justify-between gap-2",
			onClick: t4,
			children: [t5, t6]
		});
		$[20] = t4;
		$[21] = t6;
		$[22] = t7;
	} else t7 = $[22];
	let t8;
	if ($[23] !== adjust || $[24] !== onUpload || $[25] !== open) {
		t8 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdjustmentFields, {
			adjust,
			onUpload
		});
		$[23] = adjust;
		$[24] = onUpload;
		$[25] = open;
		$[26] = t8;
	} else t8 = $[26];
	let t9;
	if ($[27] !== t3 || $[28] !== t7 || $[29] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			children: [t7, t8]
		});
		$[27] = t3;
		$[28] = t7;
		$[29] = t8;
		$[30] = t9;
	} else t9 = $[30];
	return t9;
}
/** Once added, the Color section stays open until removed, so scrubbing every value back to 0 doesn't fold it away. */
function useColorSectionOpen(adjust) {
	const $ = (0, import_compiler_runtime.c)(4);
	let t0;
	if ($[0] !== adjust) {
		t0 = ADJUST_KEYS.some((key) => adjust.values[key]);
		$[0] = adjust;
		$[1] = t0;
	} else t0 = $[1];
	const hasValues = t0;
	const [open, setOpen] = (0, import_react.useState)(hasValues);
	if (hasValues && !open) setOpen(true);
	let t1;
	if ($[2] !== open) {
		t1 = [open, setOpen];
		$[2] = open;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function SaveProgress(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { progress } = t0;
	let t1;
	if ($[0] !== progress) {
		t1 = progress === null ? "Saving…" : `Saving… ${Math.round(progress * 100)}%`;
		$[0] = progress;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] tabular-nums text-ed-muted-foreground",
			children: t1
		});
		$[2] = t1;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
}
/** Status lines and the seven sliders. */
function AdjustmentFields(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { adjust, onUpload } = t0;
	const { values, status, change, commitValue, retry } = adjust;
	const unreadable = status === "unreadable";
	let t1;
	if ($[0] !== retry || $[1] !== status) {
		t1 = status === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 text-[11px] text-ed-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Couldn’t save adjustment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "xs",
				onClick: retry,
				children: "Retry"
			})]
		});
		$[0] = retry;
		$[1] = status;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== status) {
		t2 = status === "unsupported" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-muted-foreground",
			children: "This video format can’t be converted in this browser."
		});
		$[3] = status;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== onUpload || $[6] !== unreadable) {
		t3 = unreadable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 text-[11px] text-ed-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hosted on another site. Upload a copy to adjust it." }), onUpload && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "xs",
				onClick: onUpload,
				children: "Upload"
			})]
		});
		$[5] = onUpload;
		$[6] = unreadable;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== change || $[9] !== commitValue || $[10] !== unreadable || $[11] !== values) {
		t4 = !unreadable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: ADJUST_KEYS.map((key) => {
				const amount = toPercent(values[key]);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSlider, {
					label: LABELS[key],
					value: amount,
					min: -100,
					max: 100,
					origin: 0,
					onValueChange: (next) => change(key, next / 100),
					onValueCommit: (next_0) => commitValue(key, next_0 / 100)
				}, key);
			})
		});
		$[8] = change;
		$[9] = commitValue;
		$[10] = unreadable;
		$[11] = values;
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== t1 || $[14] !== t2 || $[15] !== t3 || $[16] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t1,
			t2,
			t3,
			t4
		] });
		$[13] = t1;
		$[14] = t2;
		$[15] = t3;
		$[16] = t4;
		$[17] = t5;
	} else t5 = $[17];
	return t5;
}

export { ImageAdjustments };
