// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/RadiusSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { RadiusIcon, RadiusLowerLeftIcon, RadiusLowerRightIcon, RadiusUpperLeftIcon, RadiusUpperRightIcon } from "../../../../../../../ui/src/icons.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { InspectorSection } from "./InspectorSection.js";
import { RADIUS_KEYS } from "../../../../constants.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { useClassesForProperty } from "../../../../hooks/useClassSuggestions.js";
import { MergeableFields, StyleLayoutInput } from "../fields/layout.js";

/**
* Radius section — a linked corner-radius field that can expand into four
* independently editable corners.
*/
var CORNER_KEYS = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomLeftRadius",
	"borderBottomRightRadius"
];
function RadiusSection(t0) {
	const $ = (0, import_compiler_runtime.c)(34);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const { className } = t1;
	const [linked, setLinked] = import_react.useState(true);
	const { hasAny, clear, setMultiple, addClass } = useStyleOps();
	const radiusSuggestions = useClassesForProperty("borderRadius");
	let t2;
	if ($[2] !== setMultiple) {
		t2 = (value) => setMultiple({
			borderRadius: value,
			borderTopLeftRadius: void 0,
			borderTopRightRadius: void 0,
			borderBottomLeftRadius: void 0,
			borderBottomRightRadius: void 0
		});
		$[2] = setMultiple;
		$[3] = t2;
	} else t2 = $[3];
	const setAllCorners = t2;
	let t3;
	if ($[4] !== hasAny) {
		t3 = hasAny(...RADIUS_KEYS);
		$[4] = hasAny;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== setMultiple) {
		t4 = () => setMultiple({ borderRadius: "0px" });
		$[6] = setMultiple;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== clear) {
		t5 = () => clear(...RADIUS_KEYS);
		$[8] = clear;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== addClass || $[11] !== clear) {
		t6 = (className_0) => {
			addClass(className_0);
			clear(...RADIUS_KEYS);
		};
		$[10] = addClass;
		$[11] = clear;
		$[12] = t6;
	} else t6 = $[12];
	const t7 = linked ? "Separate corners" : "Link corners";
	const t8 = !linked;
	let t9;
	if ($[13] !== linked) {
		t9 = () => setLinked(!linked);
		$[13] = linked;
		$[14] = t9;
	} else t9 = $[14];
	let t10;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusIcon, {});
		$[15] = t10;
	} else t10 = $[15];
	let t11;
	if ($[16] !== t7 || $[17] !== t8 || $[18] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t7,
			active: t8,
			onClick: t9,
			children: t10
		});
		$[16] = t7;
		$[17] = t8;
		$[18] = t9;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== linked || $[21] !== setAllCorners) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0",
			children: linked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
				property: "borderRadius",
				showTooltip: false,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusIcon, { className: "text-ed-muted-foreground" }),
				onChange: setAllCorners
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MergeableFields, {
				className: "grid min-w-0 grid-cols-2 gap-2",
				properties: CORNER_KEYS,
				label: "Radius",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusIcon, { className: "text-ed-muted-foreground" }),
				onChange: setAllCorners,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
						property: "borderTopLeftRadius",
						showTooltip: false,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusUpperLeftIcon, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
						property: "borderTopRightRadius",
						showTooltip: false,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusUpperRightIcon, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
						property: "borderBottomLeftRadius",
						showTooltip: false,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusLowerLeftIcon, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleLayoutInput, {
						property: "borderBottomRightRadius",
						showTooltip: false,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusLowerRightIcon, {})
					})
				]
			})
		});
		$[20] = linked;
		$[21] = setAllCorners;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== t11 || $[24] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: t11,
			children: t12
		});
		$[23] = t11;
		$[24] = t12;
		$[25] = t13;
	} else t13 = $[25];
	let t14;
	if ($[26] !== className || $[27] !== radiusSuggestions || $[28] !== t13 || $[29] !== t3 || $[30] !== t4 || $[31] !== t5 || $[32] !== t6) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			variant: "addable",
			title: "Radius",
			className,
			isSet: t3,
			onAdd: t4,
			onRemove: t5,
			classSuggestions: radiusSuggestions,
			cssProperty: "borderRadius",
			onSelectClass: t6,
			children: t13
		});
		$[26] = className;
		$[27] = radiusSuggestions;
		$[28] = t13;
		$[29] = t3;
		$[30] = t4;
		$[31] = t5;
		$[32] = t6;
		$[33] = t14;
	} else t14 = $[33];
	return t14;
}

export { RadiusSection };
