// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/fields/color.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { useStyleField, useStyleOps } from "../StyleOpsContext.js";
import { isTransparentColor } from "../../../../utils/fillValue.js";
import { ColorRow } from "../inputs/ColorRow.js";

/**
* Color field bound to the StyleOps context. Solid and gradient fills are
* supported on background and text (`color`); background gradients live in the
* `background` shorthand, text gradients via background-clip:text. Other color
* properties (e.g. border) are solid-only.
*/
function StyleColorInput(t0) {
	const $ = (0, import_compiler_runtime.c)(39);
	const { property, label, hideLabel, fallbackProperty, onChange } = t0;
	const f = useStyleField(property);
	const fallback = useStyleField(fallbackProperty ?? property);
	const textGrad = useStyleField("backgroundImage");
	const ops = useStyleOps();
	const classValue = f.source.source === "class" ? f.value : "";
	const isBg = property === "backgroundColor" || property === "background";
	const isText = property === "color";
	const textHasGradient = isText && /gradient/i.test(textGrad.explicit || "");
	let t1;
	if ($[0] !== classValue || $[1] !== f.computed || $[2] !== f.explicit || $[3] !== f.isMixed || $[4] !== fallback || $[5] !== fallbackProperty || $[6] !== isText || $[7] !== textGrad || $[8] !== textHasGradient) {
		t1 = f.isMixed ? "" : textHasGradient ? textGrad.explicit : classValue || f.explicit || (fallbackProperty ? fallback.explicit : "") || (isText && !isTransparentColor(f.computed) ? f.computed : "");
		$[0] = classValue;
		$[1] = f.computed;
		$[2] = f.explicit;
		$[3] = f.isMixed;
		$[4] = fallback;
		$[5] = fallbackProperty;
		$[6] = isText;
		$[7] = textGrad;
		$[8] = textHasGradient;
		$[9] = t1;
	} else t1 = $[9];
	const value = t1;
	let t2;
	if ($[10] !== f.source || $[11] !== ops) {
		t2 = () => {
			const srcClass = f.source.sourceClass;
			if (srcClass) ops.removeClass(srcClass);
		};
		$[10] = f.source;
		$[11] = ops;
		$[12] = t2;
	} else t2 = $[12];
	const dropTextColorClass = t2;
	let t3;
	if ($[13] !== dropTextColorClass || $[14] !== ops) {
		t3 = (v) => {
			dropTextColorClass();
			ops.setMultiple({
				color: v,
				backgroundImage: void 0,
				backgroundClip: void 0,
				WebkitBackgroundClip: void 0,
				WebkitTextFillColor: void 0
			});
		};
		$[13] = dropTextColorClass;
		$[14] = ops;
		$[15] = t3;
	} else t3 = $[15];
	const setTextSolid = t3;
	let t4;
	if ($[16] !== dropTextColorClass || $[17] !== ops) {
		t4 = (v_0) => {
			dropTextColorClass();
			ops.setMultiple({
				backgroundImage: v_0,
				backgroundClip: "text",
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
				color: "transparent"
			});
		};
		$[16] = dropTextColorClass;
		$[17] = ops;
		$[18] = t4;
	} else t4 = $[18];
	const setTextGradient = t4;
	const t5 = onChange ?? (isText ? setTextSolid : f.set);
	let t6;
	if ($[19] !== isBg || $[20] !== isText) {
		t6 = isBg || isText ? ["solid", "gradient"] : void 0;
		$[19] = isBg;
		$[20] = isText;
		$[21] = t6;
	} else t6 = $[21];
	let t7;
	if ($[22] !== isBg || $[23] !== isText || $[24] !== ops || $[25] !== setTextGradient || $[26] !== setTextSolid) {
		t7 = isBg ? (next, kind) => ops.setMultiple(kind === "solid" ? {
			background: void 0,
			backgroundImage: void 0,
			backgroundColor: next
		} : {
			backgroundColor: void 0,
			backgroundImage: void 0,
			background: next
		}) : isText ? (next_0, kind_0) => kind_0 === "solid" ? setTextSolid(next_0) : setTextGradient(next_0) : void 0;
		$[22] = isBg;
		$[23] = isText;
		$[24] = ops;
		$[25] = setTextGradient;
		$[26] = setTextSolid;
		$[27] = t7;
	} else t7 = $[27];
	let t8;
	if ($[28] !== f.addClass || $[29] !== f.isMixed || $[30] !== f.source || $[31] !== hideLabel || $[32] !== label || $[33] !== property || $[34] !== t5 || $[35] !== t6 || $[36] !== t7 || $[37] !== value) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
			label,
			hideLabel,
			value,
			onChange: t5,
			isMixedValue: f.isMixed,
			...f.source,
			cssProperty: property,
			onSelectClass: f.addClass,
			allowedFillKinds: t6,
			onChangeFill: t7
		});
		$[28] = f.addClass;
		$[29] = f.isMixed;
		$[30] = f.source;
		$[31] = hideLabel;
		$[32] = label;
		$[33] = property;
		$[34] = t5;
		$[35] = t6;
		$[36] = t7;
		$[37] = value;
		$[38] = t8;
	} else t8 = $[38];
	return t8;
}

export { StyleColorInput };
