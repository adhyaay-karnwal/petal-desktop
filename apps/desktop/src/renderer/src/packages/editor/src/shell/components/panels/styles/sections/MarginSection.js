// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/MarginSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { MarginAllIcon, MarginHorizontalIcon, MarginVerticalIcon } from "../../../../../../../ui/src/icons.js";
import { InspectorRailRow, LayoutFieldLabel } from "../primitives.js";
import { InspectorSection } from "./InspectorSection.js";
import { MARGIN_KEYS } from "../../../../constants.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { useClassesForProperty } from "../../../../hooks/useClassSuggestions.js";
import { LinkSidesButton, LinkedSidesGrid } from "../layout/controls.js";

/**
* Margin section — four-sides margin grid with a link/separate toggle, plus
* the class-suggestion affordance in the addable inspector-section header.
*/
function MarginSection() {
	const $ = (0, import_compiler_runtime.c)(30);
	const { hasAny, clear, setMultiple, addClass } = useStyleOps();
	const marginSuggestions = useClassesForProperty("margin");
	const [linked, setLinked] = (0, import_react.useState)(true);
	let t0;
	if ($[0] !== hasAny) {
		t0 = hasAny(...MARGIN_KEYS);
		$[0] = hasAny;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== setMultiple) {
		t1 = () => setMultiple({
			marginTop: "0px",
			marginRight: "0px",
			marginBottom: "0px",
			marginLeft: "0px"
		});
		$[2] = setMultiple;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== clear) {
		t2 = () => clear(...MARGIN_KEYS);
		$[4] = clear;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== addClass || $[7] !== clear) {
		t3 = (cls) => {
			addClass(cls);
			clear(...MARGIN_KEYS);
		};
		$[6] = addClass;
		$[7] = clear;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: "Margin" });
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== linked) {
		t5 = () => setLinked(!linked);
		$[10] = linked;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== linked || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkSidesButton, {
			kind: "margin",
			linked,
			onToggle: t5
		});
		$[12] = linked;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	let t7;
	let t8;
	let t9;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarginAllIcon, { className: "text-ed-muted-foreground" });
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarginHorizontalIcon, { className: "text-ed-muted-foreground" });
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarginVerticalIcon, { className: "text-ed-muted-foreground" });
		$[15] = t7;
		$[16] = t8;
		$[17] = t9;
	} else {
		t7 = $[15];
		t8 = $[16];
		t9 = $[17];
	}
	let t10;
	if ($[18] !== linked) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid min-w-0 grid-cols-2 gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkedSidesGrid, {
				prefix: "margin",
				linked,
				showTooltips: false,
				allSidesIcon: t7,
				linkedHorizontalIcon: t8,
				linkedVerticalIcon: t9
			})
		});
		$[18] = linked;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== t10 || $[21] !== t6) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
				action: t6,
				children: t10
			})]
		});
		$[20] = t10;
		$[21] = t6;
		$[22] = t11;
	} else t11 = $[22];
	let t12;
	if ($[23] !== marginSuggestions || $[24] !== t0 || $[25] !== t1 || $[26] !== t11 || $[27] !== t2 || $[28] !== t3) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
			reserveActionRail: true,
			variant: "addable",
			title: "Margin",
			isSet: t0,
			onAdd: t1,
			onRemove: t2,
			classSuggestions: marginSuggestions,
			cssProperty: "margin",
			onSelectClass: t3,
			children: t11
		});
		$[23] = marginSuggestions;
		$[24] = t0;
		$[25] = t1;
		$[26] = t11;
		$[27] = t2;
		$[28] = t3;
		$[29] = t12;
	} else t12 = $[29];
	return t12;
}

export { MarginSection };
