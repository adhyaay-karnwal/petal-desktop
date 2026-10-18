// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CanvasContextChip.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { CodeIcon, CrosshairIcon, DiamondIcon } from "../../../../ui/src/icons.js";
import { getElementLabel } from "./panels/layerSearch.js";
import { getLayerAccent } from "./panels/layerAppearance.js";
import { LayerIcon } from "./panels/LayerIcon.js";
import { ContextChip } from "./ChatContextControls.js";

var hoverColors = {
	"text-ed-layer-missing": "hover:text-ed-layer-missing",
	"text-ed-layer-capture": "hover:text-ed-layer-capture",
	"text-ed-layer-webview": "hover:text-ed-layer-webview",
	"text-ed-inspector-value": "hover:text-ed-inspector-value"
};
/** Canvas sources and action results share neutral chips with Layers icon colors. */
function CanvasContextChip(t0) {
	const $ = (0, import_compiler_runtime.c)(45);
	const { element, label, component, title, onClick, onRemove, className, variant, showNavigationIcon: t1 } = t0;
	const showNavigationIcon = t1 === void 0 ? true : t1;
	let T0;
	let navigate;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;
	if ($[0] !== className || $[1] !== component || $[2] !== element || $[3] !== label || $[4] !== onClick || $[5] !== onRemove || $[6] !== showNavigationIcon || $[7] !== title || $[8] !== variant) {
		const layerAccent = element ? getLayerAccent(element).label : component ? "text-ed-layer-component" : void 0;
		const isComponent = layerAccent === "text-ed-layer-component";
		const labelClass = isComponent ? "text-ed-inspector-value" : layerAccent;
		let t7;
		if ($[16] !== element || $[17] !== label) {
			t7 = label ?? (element ? getElementLabel(element) : "Element");
			$[16] = element;
			$[17] = label;
			$[18] = t7;
		} else t7 = $[18];
		const resolvedLabel = t7;
		navigate = element && !onRemove ? onClick : void 0;
		T0 = ContextChip;
		t2 = variant;
		const t8 = isComponent && "text-ed-layer-component";
		let t9;
		if ($[19] !== t8) {
			t9 = cn$2("relative inline-flex size-3.5 shrink-0", t8);
			$[19] = t8;
			$[20] = t9;
		} else t9 = $[20];
		const t10 = navigate && showNavigationIcon && "ed-context-chip-rest-icon";
		let t11;
		if ($[21] !== t10) {
			t11 = cn$2("inline-flex", t10);
			$[21] = t10;
			$[22] = t11;
		} else t11 = $[22];
		let t12;
		if ($[23] !== component || $[24] !== element) {
			t12 = element ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerIcon, {
				element,
				size: 14
			}) : component ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiamondIcon, {
				width: 14,
				height: 14,
				className: "size-3.5 shrink-0 text-ed-layer-component opacity-60"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeIcon, {
				width: 14,
				height: 14,
				className: "size-3.5 shrink-0 text-ed-muted-foreground opacity-60"
			});
			$[23] = component;
			$[24] = element;
			$[25] = t12;
		} else t12 = $[25];
		let t13;
		if ($[26] !== t11 || $[27] !== t12) {
			t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: t11,
				children: t12
			});
			$[26] = t11;
			$[27] = t12;
			$[28] = t13;
		} else t13 = $[28];
		let t14;
		if ($[29] !== navigate || $[30] !== showNavigationIcon) {
			t14 = navigate && showNavigationIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, {
				"aria-hidden": "true",
				width: 14,
				height: 14,
				className: "ed-context-chip-target-icon pointer-events-none absolute inset-0 size-3.5"
			});
			$[29] = navigate;
			$[30] = showNavigationIcon;
			$[31] = t14;
		} else t14 = $[31];
		if ($[32] !== t13 || $[33] !== t14 || $[34] !== t9) {
			t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: t9,
				children: [t13, t14]
			});
			$[32] = t13;
			$[33] = t14;
			$[34] = t9;
			$[35] = t3;
		} else t3 = $[35];
		t4 = resolvedLabel;
		t5 = title ?? (onRemove ? `Remove ${resolvedLabel}` : navigate ? `Show ${resolvedLabel} on canvas` : resolvedLabel);
		t6 = cn$2(labelClass, labelClass && hoverColors[labelClass], className);
		$[0] = className;
		$[1] = component;
		$[2] = element;
		$[3] = label;
		$[4] = onClick;
		$[5] = onRemove;
		$[6] = showNavigationIcon;
		$[7] = title;
		$[8] = variant;
		$[9] = T0;
		$[10] = navigate;
		$[11] = t2;
		$[12] = t3;
		$[13] = t4;
		$[14] = t5;
		$[15] = t6;
	} else {
		T0 = $[9];
		navigate = $[10];
		t2 = $[11];
		t3 = $[12];
		t4 = $[13];
		t5 = $[14];
		t6 = $[15];
	}
	const t7 = onRemove ?? navigate;
	let t8;
	if ($[36] !== T0 || $[37] !== onRemove || $[38] !== t2 || $[39] !== t3 || $[40] !== t4 || $[41] !== t5 || $[42] !== t6 || $[43] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			variant: t2,
			iconContent: t3,
			label: t4,
			title: t5,
			className: t6,
			onClick: t7,
			onRemove
		});
		$[36] = T0;
		$[37] = onRemove;
		$[38] = t2;
		$[39] = t3;
		$[40] = t4;
		$[41] = t5;
		$[42] = t6;
		$[43] = t7;
		$[44] = t8;
	} else t8 = $[44];
	return t8;
}

export { CanvasContextChip };
