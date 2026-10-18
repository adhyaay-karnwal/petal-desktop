// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/useUnitValue.ts
import { import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { commitInspectorUnitValue, getInspectorUnitInputValue, getInspectorUnitNumericValue, getInspectorUnitSelection, parseInspectorUnitValue } from "../../../../utils/unitValue.js";

function formatSupportedValues(values) {
	if (values.length <= 1) return values[0] ?? "a supported value";
	return `${values.slice(0, -1).join(", ")}, or ${values[values.length - 1]}`;
}
function useUnitValue(t0) {
	const $ = (0, import_compiler_runtime.c)(90);
	const { value, onChange, isMixedValue: t1, defaultUnit: t2, min, max, fallbackNumericValue, strictUnits: t3, acceptedKeywords: t4, allowedUnits, preserveUnitless: t5, allowAuto: t6 } = t0;
	const isMixedValue = t1 === void 0 ? false : t1;
	const defaultUnit = t2 === void 0 ? "px" : t2;
	const strictUnits = t3 === void 0 ? true : t3;
	let t7;
	if ($[0] !== t4) {
		t7 = t4 === void 0 ? [] : t4;
		$[0] = t4;
		$[1] = t7;
	} else t7 = $[1];
	const acceptedKeywords = t7;
	const preserveUnitless = t5 === void 0 ? false : t5;
	const allowAuto = t6 === void 0 ? false : t6;
	let t8;
	if ($[2] !== value) {
		t8 = parseInspectorUnitValue(value);
		$[2] = value;
		$[3] = t8;
	} else t8 = $[3];
	const initialParsed = t8;
	let t9;
	if ($[4] !== isMixedValue || $[5] !== value) {
		t9 = isMixedValue ? "" : getInspectorUnitInputValue(value);
		$[4] = isMixedValue;
		$[5] = value;
		$[6] = t9;
	} else t9 = $[6];
	const [draft, setDraftState] = import_react.useState(t9);
	const [activeUnit, setActiveUnit] = import_react.useState(initialParsed.kind === "number" ? initialParsed.unit || (preserveUnitless ? "" : defaultUnit) : null);
	const [isDirty, setIsDirty] = import_react.useState(false);
	const [isInvalid, setIsInvalid] = import_react.useState(false);
	const [showMixed, setShowMixed] = import_react.useState(isMixedValue);
	let t10;
	if ($[7] !== defaultUnit || $[8] !== isMixedValue || $[9] !== preserveUnitless || $[10] !== value) {
		t10 = () => {
			const parsed = parseInspectorUnitValue(value);
			setDraftState(isMixedValue ? "" : getInspectorUnitInputValue(value));
			setActiveUnit(parsed.kind === "number" ? parsed.unit || (preserveUnitless ? "" : defaultUnit) : null);
			setIsDirty(false);
			setIsInvalid(false);
			setShowMixed(isMixedValue);
		};
		$[7] = defaultUnit;
		$[8] = isMixedValue;
		$[9] = preserveUnitless;
		$[10] = value;
		$[11] = t10;
	} else t10 = $[11];
	const reset = t10;
	let t11;
	let t12;
	if ($[12] !== reset) {
		t11 = () => reset();
		t12 = [reset];
		$[12] = reset;
		$[13] = t11;
		$[14] = t12;
	} else {
		t11 = $[13];
		t12 = $[14];
	}
	import_react.useEffect(t11, t12);
	let t13;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = (next) => {
			setDraftState(next);
			setIsDirty(true);
			setIsInvalid(false);
			setShowMixed(false);
		};
		$[15] = t13;
	} else t13 = $[15];
	const setDraft = t13;
	let t14;
	if ($[16] !== acceptedKeywords || $[17] !== activeUnit || $[18] !== allowAuto || $[19] !== allowedUnits || $[20] !== defaultUnit || $[21] !== draft || $[22] !== isDirty || $[23] !== max || $[24] !== min || $[25] !== onChange || $[26] !== showMixed || $[27] !== strictUnits) {
		t14 = () => {
			if (draft === "" && showMixed || !isDirty) return true;
			if (!strictUnits) {
				const nextValue = draft.trim();
				setDraftState(nextValue);
				setActiveUnit(null);
				setIsDirty(false);
				setIsInvalid(false);
				onChange(nextValue);
				return true;
			}
			const normalizedKeyword = draft.trim().toLowerCase();
			if (acceptedKeywords.includes(normalizedKeyword)) {
				setDraftState(normalizedKeyword);
				setActiveUnit(null);
				setIsDirty(false);
				setIsInvalid(false);
				onChange(normalizedKeyword);
				return true;
			}
			const result = commitInspectorUnitValue(draft, activeUnit ?? defaultUnit, {
				min,
				max,
				allowAuto
			});
			if (!result.valid) {
				setIsInvalid(true);
				return false;
			}
			if (result.unit && allowedUnits && !allowedUnits.includes(result.unit)) {
				setIsInvalid(true);
				return false;
			}
			setDraftState(result.inputValue);
			setActiveUnit(result.unit);
			setIsDirty(false);
			setIsInvalid(false);
			onChange(result.cssValue);
			return true;
		};
		$[16] = acceptedKeywords;
		$[17] = activeUnit;
		$[18] = allowAuto;
		$[19] = allowedUnits;
		$[20] = defaultUnit;
		$[21] = draft;
		$[22] = isDirty;
		$[23] = max;
		$[24] = min;
		$[25] = onChange;
		$[26] = showMixed;
		$[27] = strictUnits;
		$[28] = t14;
	} else t14 = $[28];
	const commit = t14;
	let t15;
	if ($[29] !== allowAuto || $[30] !== draft || $[31] !== fallbackNumericValue || $[32] !== max || $[33] !== min || $[34] !== onChange || $[35] !== value) {
		t15 = (selection) => {
			if (selection === "auto") {
				if (!allowAuto) {
					setIsInvalid(true);
					return;
				}
				setDraftState("Auto");
				setActiveUnit(null);
				setIsDirty(false);
				setIsInvalid(false);
				setShowMixed(false);
				onChange("auto");
				return;
			}
			let numericValue = getInspectorUnitNumericValue(draft, value) ?? fallbackNumericValue ?? 0;
			if (min !== void 0) numericValue = Math.max(min, numericValue);
			if (max !== void 0) numericValue = Math.min(max, numericValue);
			const nextDraft = String(numericValue);
			setDraftState(nextDraft);
			setActiveUnit(selection);
			setIsDirty(false);
			setIsInvalid(false);
			setShowMixed(false);
			onChange(`${nextDraft}${selection}`);
		};
		$[29] = allowAuto;
		$[30] = draft;
		$[31] = fallbackNumericValue;
		$[32] = max;
		$[33] = min;
		$[34] = onChange;
		$[35] = value;
		$[36] = t15;
	} else t15 = $[36];
	const selectUnit = t15;
	let t16;
	if ($[37] !== activeUnit || $[38] !== allowAuto || $[39] !== allowedUnits || $[40] !== defaultUnit || $[41] !== draft || $[42] !== isDirty || $[43] !== max || $[44] !== min || $[45] !== strictUnits) {
		t16 = () => {
			if (!isDirty || !strictUnits) return null;
			const result_0 = commitInspectorUnitValue(draft, activeUnit ?? defaultUnit, {
				min,
				max,
				allowAuto
			});
			if (!result_0.valid || result_0.unit === null) return null;
			if (result_0.unit && allowedUnits && !allowedUnits.includes(result_0.unit)) return null;
			return {
				value: Number(result_0.inputValue),
				unit: result_0.unit
			};
		};
		$[37] = activeUnit;
		$[38] = allowAuto;
		$[39] = allowedUnits;
		$[40] = defaultUnit;
		$[41] = draft;
		$[42] = isDirty;
		$[43] = max;
		$[44] = min;
		$[45] = strictUnits;
		$[46] = t16;
	} else t16 = $[46];
	const typedNumber = t16;
	let t17;
	if ($[47] !== draft || $[48] !== fallbackNumericValue || $[49] !== typedNumber || $[50] !== value) {
		t17 = () => typedNumber()?.value ?? getInspectorUnitNumericValue(value, draft) ?? fallbackNumericValue ?? 0;
		$[47] = draft;
		$[48] = fallbackNumericValue;
		$[49] = typedNumber;
		$[50] = value;
		$[51] = t17;
	} else t17 = $[51];
	const scrubValue = t17;
	let t18;
	if ($[52] !== activeUnit || $[53] !== defaultUnit || $[54] !== max || $[55] !== min || $[56] !== onChange || $[57] !== preserveUnitless || $[58] !== typedNumber || $[59] !== value) {
		t18 = (next_0) => {
			let numericValue_0 = next_0;
			if (min !== void 0) numericValue_0 = Math.max(min, numericValue_0);
			if (max !== void 0) numericValue_0 = Math.min(max, numericValue_0);
			const nextDraft_0 = String(numericValue_0);
			const parsedValue = parseInspectorUnitValue(value);
			const unit = typedNumber()?.unit ?? (parsedValue.kind === "number" ? parsedValue.unit || (preserveUnitless ? "" : defaultUnit) : activeUnit ?? defaultUnit);
			setDraftState(nextDraft_0);
			setActiveUnit(unit);
			setIsDirty(false);
			setIsInvalid(false);
			setShowMixed(false);
			onChange(`${nextDraft_0}${unit}`);
		};
		$[52] = activeUnit;
		$[53] = defaultUnit;
		$[54] = max;
		$[55] = min;
		$[56] = onChange;
		$[57] = preserveUnitless;
		$[58] = typedNumber;
		$[59] = value;
		$[60] = t18;
	} else t18 = $[60];
	const applyScrub = t18;
	let t19;
	if ($[61] !== activeUnit || $[62] !== draft || $[63] !== value) {
		t19 = draft.trim().toLowerCase() === "auto" ? "auto" : activeUnit || getInspectorUnitSelection(value);
		$[61] = activeUnit;
		$[62] = draft;
		$[63] = value;
		$[64] = t19;
	} else t19 = $[64];
	const selectedUnit = t19;
	let t20;
	let t21;
	let t22;
	let t23;
	let t24;
	let t25;
	if ($[65] !== allowAuto || $[66] !== allowedUnits || $[67] !== draft || $[68] !== isDirty || $[69] !== isInvalid || $[70] !== showMixed) {
		const supportedValueDescription = [...allowedUnits ?? [
			"px",
			"%",
			"em",
			"rem",
			"ch"
		], ...allowAuto ? ["Auto"] : []];
		t20 = draft;
		t21 = setDraft;
		t22 = showMixed;
		t23 = isDirty;
		t24 = isInvalid;
		t25 = isInvalid ? `Use ${formatSupportedValues(supportedValueDescription)}` : void 0;
		$[65] = allowAuto;
		$[66] = allowedUnits;
		$[67] = draft;
		$[68] = isDirty;
		$[69] = isInvalid;
		$[70] = showMixed;
		$[71] = t20;
		$[72] = t21;
		$[73] = t22;
		$[74] = t23;
		$[75] = t24;
		$[76] = t25;
	} else {
		t20 = $[71];
		t21 = $[72];
		t22 = $[73];
		t23 = $[74];
		t24 = $[75];
		t25 = $[76];
	}
	let t26;
	if ($[77] !== applyScrub || $[78] !== commit || $[79] !== reset || $[80] !== scrubValue || $[81] !== selectUnit || $[82] !== selectedUnit || $[83] !== t20 || $[84] !== t21 || $[85] !== t22 || $[86] !== t23 || $[87] !== t24 || $[88] !== t25) {
		t26 = {
			draft: t20,
			setDraft: t21,
			showMixed: t22,
			isDirty: t23,
			isInvalid: t24,
			errorMessage: t25,
			selectedUnit,
			commit,
			reset,
			selectUnit,
			scrubValue,
			applyScrub
		};
		$[77] = applyScrub;
		$[78] = commit;
		$[79] = reset;
		$[80] = scrubValue;
		$[81] = selectUnit;
		$[82] = selectedUnit;
		$[83] = t20;
		$[84] = t21;
		$[85] = t22;
		$[86] = t23;
		$[87] = t24;
		$[88] = t25;
		$[89] = t26;
	} else t26 = $[89];
	return t26;
}

export { useUnitValue };
