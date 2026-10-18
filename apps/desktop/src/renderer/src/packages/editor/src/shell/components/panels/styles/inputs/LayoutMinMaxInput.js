// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/LayoutMinMaxInput.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { XIcon } from "../../../../../../../ui/src/icons.js";
import { IconBtn, InspectorControlInput, InspectorControlShell, InspectorScrubHandle, LayoutFieldLabel } from "../primitives.js";
import { inspectorPropertySupportsAuto } from "../../../../utils/unitValue.js";
import { useInspectorScrub } from "./useInspectorScrub.js";
import { UnitMenu } from "./UnitMenu.js";
import { useUnitValue } from "./useUnitValue.js";

/**
* LayoutMinMaxInput — labelled length input for the standalone Min/Max Width &
* Height rows. Tracks a dirty flag so it only writes back edited values, and
* shows the resolved unit suffix as a trailing badge.
*/
function LayoutMinMaxInput(t0) {
	const $ = (0, import_compiler_runtime.c)(45);
	const { label, tooltipLabel, value, onChange, onClear, placeholder: t1, icon, isMixedValue: t2 } = t0;
	const placeholder = t1 === void 0 ? "0" : t1;
	const isMixedValue = t2 === void 0 ? false : t2;
	const [unitMenuOpen, setUnitMenuOpen] = import_react.useState(false);
	let t3;
	if ($[0] !== label) {
		t3 = inspectorPropertySupportsAuto(label);
		$[0] = label;
		$[1] = t3;
	} else t3 = $[1];
	const allowAuto = t3;
	const t4 = value ?? "";
	let t5;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = ["none"];
		$[2] = t5;
	} else t5 = $[2];
	let t6;
	if ($[3] !== allowAuto || $[4] !== isMixedValue || $[5] !== onChange || $[6] !== t4) {
		t6 = {
			value: t4,
			onChange,
			isMixedValue,
			acceptedKeywords: t5,
			allowAuto
		};
		$[3] = allowAuto;
		$[4] = isMixedValue;
		$[5] = onChange;
		$[6] = t4;
		$[7] = t6;
	} else t6 = $[7];
	const unitValue = useUnitValue(t6);
	let t7;
	if ($[8] !== unitValue.showMixed) {
		t7 = { mixed: unitValue.showMixed };
		$[8] = unitValue.showMixed;
		$[9] = t7;
	} else t7 = $[9];
	const { scrubRef, isScrubbing, onInputKeyDown } = useInspectorScrub(unitValue.scrubValue, unitValue.applyScrub, t7);
	let t8;
	if ($[10] !== label) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutFieldLabel, { children: label });
		$[10] = label;
		$[11] = t8;
	} else t8 = $[11];
	const t9 = isScrubbing || unitMenuOpen;
	const t10 = unitValue.isInvalid || void 0;
	let t11;
	if ($[12] !== icon || $[13] !== scrubRef) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorScrubHandle, {
			ref: scrubRef,
			className: "pl-2",
			children: icon
		});
		$[12] = icon;
		$[13] = scrubRef;
		$[14] = t11;
	} else t11 = $[14];
	const t12 = unitValue.showMixed ? "" : unitValue.draft;
	let t13;
	if ($[15] !== unitValue) {
		t13 = (event) => unitValue.setDraft(event.target.value);
		$[15] = unitValue;
		$[16] = t13;
	} else t13 = $[16];
	const t14 = unitValue.showMixed ? "-" : placeholder;
	const t15 = unitValue.isInvalid || void 0;
	const t16 = unitValue.errorMessage ?? tooltipLabel;
	let t17;
	if ($[17] !== onInputKeyDown || $[18] !== t12 || $[19] !== t13 || $[20] !== t14 || $[21] !== t15 || $[22] !== t16 || $[23] !== unitValue.commit) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			value: t12,
			onChange: t13,
			onBlur: unitValue.commit,
			onKeyDown: onInputKeyDown,
			placeholder: t14,
			"aria-invalid": t15,
			tooltip: t16,
			className: "px-1"
		});
		$[17] = onInputKeyDown;
		$[18] = t12;
		$[19] = t13;
		$[20] = t14;
		$[21] = t15;
		$[22] = t16;
		$[23] = unitValue.commit;
		$[24] = t17;
	} else t17 = $[24];
	let t18;
	if ($[25] !== allowAuto || $[26] !== label || $[27] !== unitValue.selectUnit || $[28] !== unitValue.selectedUnit) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitMenu, {
			value: unitValue.selectedUnit,
			onValueChange: unitValue.selectUnit,
			label,
			onOpenChange: setUnitMenuOpen,
			allowAuto
		});
		$[25] = allowAuto;
		$[26] = label;
		$[27] = unitValue.selectUnit;
		$[28] = unitValue.selectedUnit;
		$[29] = t18;
	} else t18 = $[29];
	let t19;
	if ($[30] !== t10 || $[31] !== t11 || $[32] !== t17 || $[33] !== t18 || $[34] !== t9) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
			active: t9,
			"aria-invalid": t10,
			className: "flex-1",
			children: [
				t11,
				t17,
				t18
			]
		});
		$[30] = t10;
		$[31] = t11;
		$[32] = t17;
		$[33] = t18;
		$[34] = t9;
		$[35] = t19;
	} else t19 = $[35];
	let t20;
	if ($[36] !== label || $[37] !== onClear) {
		t20 = onClear && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: `Remove ${label}`,
			className: "shrink-0",
			onClick: (e) => {
				e.preventDefault();
				e.stopPropagation();
				onClear();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-3.75" })
		});
		$[36] = label;
		$[37] = onClear;
		$[38] = t20;
	} else t20 = $[38];
	let t21;
	if ($[39] !== t19 || $[40] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2",
			children: [t19, t20]
		});
		$[39] = t19;
		$[40] = t20;
		$[41] = t21;
	} else t21 = $[41];
	let t22;
	if ($[42] !== t21 || $[43] !== t8) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col gap-2",
			children: [t8, t21]
		});
		$[42] = t21;
		$[43] = t8;
		$[44] = t22;
	} else t22 = $[44];
	return t22;
}

export { LayoutMinMaxInput };
