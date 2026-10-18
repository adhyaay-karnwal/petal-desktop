// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ImportDesignSystemIllustration.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { PetalLogo } from "../../assets/PetalLogo.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { p$3, s$5 } from "../../../../../vendor/@phosphor-icons/react.js";

/**
* Static graphic for "import your design system": the two sources (a local folder,
* a GitHub repo) with lines running into Petal. Shared by the onboarding step
* and the chat's import card. `lg` draws it 1.75x natively, so borders stay 1px; `glass`
* is for photographic backgrounds: frosted white tiles and white lines.
*/
function ImportDesignSystemIllustration(t0) {
	const $ = (0, import_compiler_runtime.c)(48);
	const { className, size: t1, glass: t2 } = t0;
	const size = t1 === void 0 ? "md" : t1;
	const glass = t2 === void 0 ? false : t2;
	const lg = size === "lg";
	const iconSize = lg ? 28 : 16;
	const k = lg ? 1.75 : 1;
	let t3;
	if ($[0] !== className) {
		t3 = cn$2("flex w-full select-none items-center justify-center rounded-xl border border-ed-border bg-ed-muted px-4 py-5", className);
		$[0] = className;
		$[1] = t3;
	} else t3 = $[1];
	const t4 = lg ? "gap-[21px]" : "gap-3";
	let t5;
	if ($[2] !== t4) {
		t5 = cn$2("flex flex-col", t4);
		$[2] = t4;
		$[3] = t5;
	} else t5 = $[3];
	let t6;
	if ($[4] !== iconSize) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(p$3, {
			size: iconSize,
			weight: "light"
		});
		$[4] = iconSize;
		$[5] = t6;
	} else t6 = $[5];
	let t7;
	if ($[6] !== glass || $[7] !== lg || $[8] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
			lg,
			glass,
			children: t6
		});
		$[6] = glass;
		$[7] = lg;
		$[8] = t6;
		$[9] = t7;
	} else t7 = $[9];
	let t8;
	if ($[10] !== iconSize) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$5, {
			size: iconSize,
			weight: "light"
		});
		$[10] = iconSize;
		$[11] = t8;
	} else t8 = $[11];
	let t9;
	if ($[12] !== glass || $[13] !== lg || $[14] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
			lg,
			glass,
			children: t8
		});
		$[12] = glass;
		$[13] = lg;
		$[14] = t8;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== t5 || $[17] !== t7 || $[18] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t5,
			children: [t7, t9]
		});
		$[16] = t5;
		$[17] = t7;
		$[18] = t9;
		$[19] = t10;
	} else t10 = $[19];
	const t11 = 56 * k;
	const t12 = 76 * k;
	const t13 = `0 0 ${56 * k} ${76 * k}`;
	const t14 = glass ? "text-white opacity-50" : "text-ed-input";
	let t15;
	if ($[20] !== t14) {
		t15 = cn$2("shrink-0", t14);
		$[20] = t14;
		$[21] = t15;
	} else t15 = $[21];
	const t16 = `M0 ${16 * k} H${22 * k} Q${28 * k} ${16 * k} ${28 * k} ${22 * k} V${32 * k} Q${28 * k} ${38 * k} ${34 * k} ${38 * k}`;
	let t17;
	if ($[22] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: t16,
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		});
		$[22] = t16;
		$[23] = t17;
	} else t17 = $[23];
	const t18 = `M0 ${60 * k} H${22 * k} Q${28 * k} ${60 * k} ${28 * k} ${54 * k} V${44 * k} Q${28 * k} ${38 * k} ${34 * k} ${38 * k}`;
	let t19;
	if ($[24] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: t18,
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		});
		$[24] = t18;
		$[25] = t19;
	} else t19 = $[25];
	const t20 = `M${34 * k} ${38 * k} H${56 * k}`;
	let t21;
	if ($[26] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: t20,
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		});
		$[26] = t20;
		$[27] = t21;
	} else t21 = $[27];
	let t22;
	if ($[28] !== t11 || $[29] !== t12 || $[30] !== t13 || $[31] !== t15 || $[32] !== t17 || $[33] !== t19 || $[34] !== t21) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: t11,
			height: t12,
			viewBox: t13,
			fill: "none",
			className: t15,
			children: [
				t17,
				t19,
				t21
			]
		});
		$[28] = t11;
		$[29] = t12;
		$[30] = t13;
		$[31] = t15;
		$[32] = t17;
		$[33] = t19;
		$[34] = t21;
		$[35] = t22;
	} else t22 = $[35];
	const t23 = lg ? "size-21 rounded-[14px]" : "size-12 rounded-lg";
	const t24 = lg ? 49 : 28;
	let t25;
	if ($[36] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalOutline, { size: t24 });
		$[36] = t24;
		$[37] = t25;
	} else t25 = $[37];
	let t26;
	if ($[38] !== glass || $[39] !== lg || $[40] !== t23 || $[41] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
			lg,
			glass,
			className: t23,
			children: t25
		});
		$[38] = glass;
		$[39] = lg;
		$[40] = t23;
		$[41] = t25;
		$[42] = t26;
	} else t26 = $[42];
	let t27;
	if ($[43] !== t10 || $[44] !== t22 || $[45] !== t26 || $[46] !== t3) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-hidden": true,
			className: t3,
			children: [
				t10,
				t22,
				t26
			]
		});
		$[43] = t10;
		$[44] = t22;
		$[45] = t26;
		$[46] = t3;
		$[47] = t27;
	} else t27 = $[47];
	return t27;
}
function Tile(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { children, className, lg, glass } = t0;
	const t1 = lg ? "size-14 rounded-[9px]" : "size-8 rounded-[5px]";
	const t2 = glass ? "border-white/30 bg-white/15 text-white backdrop-blur-md" : "border-ed-border bg-ed-background text-ed-foreground shadow-lg/4";
	let t3;
	if ($[0] !== className || $[1] !== t1 || $[2] !== t2) {
		t3 = cn$2("flex shrink-0 items-center justify-center border", t1, t2, className);
		$[0] = className;
		$[1] = t1;
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== children || $[5] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t3,
			children
		});
		$[4] = children;
		$[5] = t3;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}
/** Outline mark at a constant 1px stroke, so it matches the light-weight source icons. */
function PetalOutline({ size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalLogo, { width: size, height: size });
}

export { ImportDesignSystemIllustration };
