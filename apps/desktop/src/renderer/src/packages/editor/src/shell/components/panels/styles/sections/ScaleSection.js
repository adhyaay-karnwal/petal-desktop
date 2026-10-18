// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/ScaleSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { LockAspectRatioIcon, PlusIcon, ScaleIcon } from "../../../../../../../ui/src/icons.js";
import { getParentId } from "../../../../../../../compiler/src/store/read.js";
import { resolveVisibleElement$1 } from "../../../../../shared/utils/visibleElement.js";
import { IconBtn, InspectorRailRow } from "../primitives.js";
import { InspectorSection } from "./InspectorSection.js";
import { getTransformScales, multiplyTransformScale, removeScaleAnchorTransform, removeTransformScale } from "../../../../../shared/utils/scaleTransform.js";
import { linearFromTransform } from "../../../../../canvas/utils/transformMatrix.js";
import { useActiveTool } from "../../../../../shared/state/activeTool.js";
import { getLiveSize, subscribeLiveSize } from "../../../../../shared/state/liveSizeChannel.js";
import { DimensionInput } from "../inputs/DimensionInput.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { LayoutValueInput } from "../inputs/LayoutValueInput.js";

function scaledNode(elementId, findCanvasNodes) {
	const raw = findCanvasNodes(elementId)[0];
	return raw ? resolveVisibleElement$1(raw) : null;
}
function measure(element, findCanvasNodes, live = false) {
	const node = scaledNode(element.id, findCanvasNodes);
	const computed = node ? window.getComputedStyle(node) : null;
	const transform = (live ? node?.style.transform : void 0) || element.styles?.transform || computed?.transform || "";
	const matrix = linearFromTransform(computed?.transform);
	const scales = getTransformScales(transform);
	return {
		id: element.id,
		transform,
		scale: scales.x,
		scaleY: scales.y,
		width: (node?.offsetWidth || parseFloat(String(element.styles?.width)) || 0) * Math.hypot(matrix.a, matrix.b),
		height: (node?.offsetHeight || parseFloat(String(element.styles?.height)) || 0) * Math.hypot(matrix.c, matrix.d)
	};
}
function sameMeasurements(a, b) {
	return a.length === b.length && a.every((m, i) => m.id === b[i].id && m.transform === b[i].transform && m.scale === b[i].scale && m.scaleY === b[i].scaleY && m.width === b[i].width && m.height === b[i].height);
}
/** Comma-joined ids of the selected elements that have no selected ancestor. */
function selectionRootIds(store, elements) {
	const selectedIds = new Set(elements.map((element) => element.id));
	return elements.filter((element) => {
		let parent = getParentId(store, element.id);
		while (parent && parent !== "ROOT") {
			if (selectedIds.has(parent)) return false;
			parent = getParentId(store, parent);
		}
		return true;
	}).map((element) => element.id).join(",");
}
function ScaleSection(t0) {
	const $ = (0, import_compiler_runtime.c)(119);
	const { elements, rootIds, onApply } = t0;
	const { activeTool, scaleFocusVersion, setActiveTool, scaleAspectLocked, setScaleAspectLocked } = useActiveTool();
	const { readOnly, findCanvasNodes } = useStyleOps();
	const sectionRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	const [measurements, setMeasurements] = (0, import_react.useState)(t1);
	let t2;
	if ($[1] !== elements) {
		t2 = elements.map(_temp$76).join(",");
		$[1] = elements;
		$[2] = t2;
	} else t2 = $[2];
	const selectionKey = t2;
	let t3;
	if ($[3] !== rootIds) {
		t3 = new Set(rootIds.split(","));
		$[3] = rootIds;
		$[4] = t3;
	} else t3 = $[4];
	const ids = t3;
	let t4;
	if ($[5] !== elements || $[6] !== ids) {
		let t5;
		if ($[8] !== ids) {
			t5 = (element_0) => ids.has(element_0.id);
			$[8] = ids;
			$[9] = t5;
		} else t5 = $[9];
		t4 = elements.filter(t5);
		$[5] = elements;
		$[6] = ids;
		$[7] = t4;
	} else t4 = $[7];
	const roots = t4;
	let t5;
	let t6;
	if ($[10] !== findCanvasNodes || $[11] !== roots) {
		t5 = () => {
			let frame = null;
			let observed = [];
			const previewing = () => {
				const size = getLiveSize();
				return !!size && roots.some((element_1) => element_1.id === size.elementId);
			};
			const scheduleMeasure = function scheduleMeasure() {
				if (frame !== null || previewing()) return;
				frame = requestAnimationFrame(() => {
					frame = null;
					if (observed.some(_temp2$50)) observe();
					const next = roots.map((element_2) => measure(element_2, findCanvasNodes, true));
					setMeasurements((prev) => sameMeasurements(prev, next) ? prev : next);
				});
			};
			const mutations = new MutationObserver(scheduleMeasure);
			const resizes = new ResizeObserver(scheduleMeasure);
			function observe() {
				mutations.disconnect();
				resizes.disconnect();
				observed = roots.flatMap((element_3) => scaledNode(element_3.id, findCanvasNodes) ?? []);
				for (const node_0 of observed) {
					mutations.observe(node_0, {
						attributes: true,
						attributeFilter: ["style"]
					});
					resizes.observe(node_0, { box: "border-box" });
				}
			}
			observe();
			scheduleMeasure();
			const unsubscribeLiveSize = subscribeLiveSize((size_0) => {
				if (!size_0) scheduleMeasure();
			});
			return () => {
				unsubscribeLiveSize();
				mutations.disconnect();
				resizes.disconnect();
				if (frame !== null) cancelAnimationFrame(frame);
			};
		};
		t6 = [roots, findCanvasNodes];
		$[10] = findCanvasNodes;
		$[11] = roots;
		$[12] = t5;
		$[13] = t6;
	} else {
		t5 = $[12];
		t6 = $[13];
	}
	(0, import_react.useEffect)(t5, t6);
	let t7;
	if ($[14] !== activeTool) {
		t7 = () => {
			if (activeTool !== "scale") return;
			sectionRef.current?.scrollIntoView({ block: "nearest" });
		};
		$[14] = activeTool;
		$[15] = t7;
	} else t7 = $[15];
	let t8;
	if ($[16] !== activeTool || $[17] !== scaleFocusVersion || $[18] !== selectionKey) {
		t8 = [
			activeTool,
			scaleFocusVersion,
			selectionKey
		];
		$[16] = activeTool;
		$[17] = scaleFocusVersion;
		$[18] = selectionKey;
		$[19] = t8;
	} else t8 = $[19];
	(0, import_react.useEffect)(t7, t8);
	const format = _temp3$36;
	let t9;
	if ($[20] !== measurements[0]) {
		t9 = (key) => format(measurements[0]?.[key]);
		$[20] = measurements[0];
		$[21] = t9;
	} else t9 = $[21];
	const value = t9;
	let t10;
	if ($[22] !== findCanvasNodes || $[23] !== roots[0] || $[24] !== roots.length) {
		t10 = (key_0) => roots.length === 1 ? {
			elementId: roots[0].id,
			text: () => format(measure(roots[0], findCanvasNodes, true)[key_0])
		} : void 0;
		$[22] = findCanvasNodes;
		$[23] = roots[0];
		$[24] = roots.length;
		$[25] = t10;
	} else t10 = $[25];
	const live = t10;
	let t11;
	if ($[26] !== measurements) {
		t11 = (key_1) => measurements.some((m) => Math.abs(m[key_1] - measurements[0][key_1]) > .001 || key_1 === "scale" && Math.abs(m.scale - m.scaleY) > .001);
		$[26] = measurements;
		$[27] = t11;
	} else t11 = $[27];
	const mixed = t11;
	let t12;
	if ($[28] !== findCanvasNodes || $[29] !== onApply || $[30] !== readOnly || $[31] !== roots || $[32] !== scaleAspectLocked) {
		t12 = (key_2, input) => {
			const next_0 = Number(input.replace(/px$/, ""));
			if (readOnly || !Number.isFinite(next_0) || next_0 <= 0) return;
			const transforms = /* @__PURE__ */ new Map();
			for (const element_4 of roots) {
				const current = measure(element_4, findCanvasNodes);
				if (current[key_2] <= 0 || current.scaleY <= 0) continue;
				const ratio = next_0 / current[key_2];
				const x = key_2 === "height" && !scaleAspectLocked ? 1 : ratio;
				const y = key_2 === "scale" ? next_0 / current.scaleY : key_2 === "width" && !scaleAspectLocked ? 1 : ratio;
				transforms.set(element_4.id, multiplyTransformScale(current.transform, x, y));
			}
			onApply(transforms);
		};
		$[28] = findCanvasNodes;
		$[29] = onApply;
		$[30] = readOnly;
		$[31] = roots;
		$[32] = scaleAspectLocked;
		$[33] = t12;
	} else t12 = $[33];
	const apply = t12;
	let t13;
	if ($[34] !== activeTool || $[35] !== measurements || $[36] !== roots) {
		t13 = activeTool === "scale" || roots.some(_temp4$31) || measurements.some(_temp5$28);
		$[34] = activeTool;
		$[35] = measurements;
		$[36] = roots;
		$[37] = t13;
	} else t13 = $[37];
	const isSet = t13;
	let t14;
	if ($[38] !== findCanvasNodes || $[39] !== onApply || $[40] !== readOnly || $[41] !== roots) {
		t14 = () => {
			if (readOnly) return;
			onApply(new Map(roots.map((element_6) => {
				const { transform: transform_0 } = measure(element_6, findCanvasNodes);
				return [element_6.id, `${transform_0 === "none" ? "" : transform_0} scale(1)`.trim()];
			})));
		};
		$[38] = findCanvasNodes;
		$[39] = onApply;
		$[40] = readOnly;
		$[41] = roots;
		$[42] = t14;
	} else t14 = $[42];
	const addScale = t14;
	let t15;
	if ($[43] !== activeTool || $[44] !== findCanvasNodes || $[45] !== onApply || $[46] !== readOnly || $[47] !== roots || $[48] !== setActiveTool) {
		t15 = () => {
			if (readOnly) return;
			onApply(new Map(roots.map((element_7) => {
				const base = removeScaleAnchorTransform(measure(element_7, findCanvasNodes).transform, element_7.scaleAnchorTransform);
				return [element_7.id, removeTransformScale(base)];
			})));
			if (activeTool === "scale") setActiveTool("move");
		};
		$[43] = activeTool;
		$[44] = findCanvasNodes;
		$[45] = onApply;
		$[46] = readOnly;
		$[47] = roots;
		$[48] = setActiveTool;
		$[49] = t15;
	} else t15 = $[49];
	const t16 = readOnly ? void 0 : t15;
	let t17;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[50] = t17;
	} else t17 = $[50];
	let t18;
	if ($[51] !== addScale || $[52] !== readOnly) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Add scale",
			disabled: readOnly,
			onClick: addScale,
			children: t17
		});
		$[51] = addScale;
		$[52] = readOnly;
		$[53] = t18;
	} else t18 = $[53];
	const t19 = scaleAspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio";
	let t20;
	if ($[54] !== scaleAspectLocked || $[55] !== setScaleAspectLocked) {
		t20 = () => setScaleAspectLocked(!scaleAspectLocked);
		$[54] = scaleAspectLocked;
		$[55] = setScaleAspectLocked;
		$[56] = t20;
	} else t20 = $[56];
	let t21;
	if ($[57] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockAspectRatioIcon, {});
		$[57] = t21;
	} else t21 = $[57];
	let t22;
	if ($[58] !== readOnly || $[59] !== scaleAspectLocked || $[60] !== t19 || $[61] !== t20) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t19,
			active: scaleAspectLocked,
			disabled: readOnly,
			onClick: t20,
			children: t21
		});
		$[58] = readOnly;
		$[59] = scaleAspectLocked;
		$[60] = t19;
		$[61] = t20;
		$[62] = t22;
	} else t22 = $[62];
	let t23;
	if ($[63] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleIcon, {});
		$[63] = t23;
	} else t23 = $[63];
	const t24 = value("scale");
	let t25;
	if ($[64] !== mixed) {
		t25 = mixed("scale");
		$[64] = mixed;
		$[65] = t25;
	} else t25 = $[65];
	let t26;
	if ($[66] !== apply) {
		t26 = (v) => apply("scale", v);
		$[66] = apply;
		$[67] = t26;
	} else t26 = $[67];
	let t27;
	if ($[68] !== readOnly || $[69] !== t24 || $[70] !== t25 || $[71] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutValueInput, {
			icon: t23,
			ariaLabel: "Scale factor",
			tooltipLabel: "Scale factor",
			value: t24,
			unit: "",
			suffix: "x",
			inlineSuffix: true,
			min: .01,
			scrubStep: .5,
			scrubPrecision: 1,
			disabled: readOnly,
			isMixedValue: t25,
			onChange: t26
		});
		$[68] = readOnly;
		$[69] = t24;
		$[70] = t25;
		$[71] = t26;
		$[72] = t27;
	} else t27 = $[72];
	let t28;
	if ($[73] !== scaleAspectLocked) {
		t28 = scaleAspectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute left-1/2 top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 bg-ed-muted" });
		$[73] = scaleAspectLocked;
		$[74] = t28;
	} else t28 = $[74];
	const t29 = value("width");
	let t30;
	if ($[75] !== mixed) {
		t30 = mixed("width");
		$[75] = mixed;
		$[76] = t30;
	} else t30 = $[76];
	let t31;
	if ($[77] !== apply) {
		t31 = (v_0) => apply("width", v_0);
		$[77] = apply;
		$[78] = t31;
	} else t31 = $[78];
	let t32;
	if ($[79] !== live) {
		t32 = live("width");
		$[79] = live;
		$[80] = t32;
	} else t32 = $[80];
	let t33;
	if ($[81] !== readOnly || $[82] !== t29 || $[83] !== t30 || $[84] !== t31 || $[85] !== t32) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label: "W",
			ariaLabel: "Scaled width",
			value: t29,
			fixedPixels: true,
			min: .01,
			disabled: readOnly,
			isMixedValue: t30,
			onChange: t31,
			live: t32
		});
		$[81] = readOnly;
		$[82] = t29;
		$[83] = t30;
		$[84] = t31;
		$[85] = t32;
		$[86] = t33;
	} else t33 = $[86];
	const t34 = value("height");
	let t35;
	if ($[87] !== mixed) {
		t35 = mixed("height");
		$[87] = mixed;
		$[88] = t35;
	} else t35 = $[88];
	let t36;
	if ($[89] !== apply) {
		t36 = (v_1) => apply("height", v_1);
		$[89] = apply;
		$[90] = t36;
	} else t36 = $[90];
	let t37;
	if ($[91] !== live) {
		t37 = live("height");
		$[91] = live;
		$[92] = t37;
	} else t37 = $[92];
	let t38;
	if ($[93] !== readOnly || $[94] !== t34 || $[95] !== t35 || $[96] !== t36 || $[97] !== t37) {
		t38 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimensionInput, {
			label: "H",
			ariaLabel: "Scaled height",
			value: t34,
			fixedPixels: true,
			min: .01,
			disabled: readOnly,
			isMixedValue: t35,
			onChange: t36,
			live: t37
		});
		$[93] = readOnly;
		$[94] = t34;
		$[95] = t35;
		$[96] = t36;
		$[97] = t37;
		$[98] = t38;
	} else t38 = $[98];
	let t39;
	if ($[99] !== t28 || $[100] !== t33 || $[101] !== t38) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative col-span-2 grid min-w-0 grid-cols-2 gap-2",
			children: [
				t28,
				t33,
				t38
			]
		});
		$[99] = t28;
		$[100] = t33;
		$[101] = t38;
		$[102] = t39;
	} else t39 = $[102];
	let t40;
	if ($[103] !== t27 || $[104] !== t39) {
		t40 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 grid-cols-3 gap-2",
			children: [t27, t39]
		});
		$[103] = t27;
		$[104] = t39;
		$[105] = t40;
	} else t40 = $[105];
	let t41;
	if ($[106] !== t22 || $[107] !== t40) {
		t41 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: t22,
			children: t40
		});
		$[106] = t22;
		$[107] = t40;
		$[108] = t41;
	} else t41 = $[108];
	let t42;
	if ($[109] !== readOnly || $[110] !== t41) {
		t42 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
			disabled: readOnly,
			className: "min-w-0 space-y-2",
			children: t41
		});
		$[109] = readOnly;
		$[110] = t41;
		$[111] = t42;
	} else t42 = $[111];
	let t43;
	if ($[112] !== addScale || $[113] !== isSet || $[114] !== selectionKey || $[115] !== t16 || $[116] !== t18 || $[117] !== t42) {
		t43 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sectionRef,
			tabIndex: -1,
			"aria-label": "Scale",
			"data-scale-section": true,
			className: "outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ed-ring",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
				title: "Scale",
				reserveActionRail: true,
				variant: "addable",
				isSet,
				onAdd: addScale,
				onRemove: t16,
				optimisticOpenOnAdd: false,
				collapsedAction: t18,
				children: t42
			}, selectionKey)
		});
		$[112] = addScale;
		$[113] = isSet;
		$[114] = selectionKey;
		$[115] = t16;
		$[116] = t18;
		$[117] = t42;
		$[118] = t43;
	} else t43 = $[118];
	return t43;
}
function _temp5$28(t0) {
	const { scale, scaleY, transform } = t0;
	return Math.abs(scale - 1) > 1e-6 || Math.abs(scaleY - 1) > 1e-6 || /\bscale\(\s*1(?:\.0*)?\s*\)/.test(transform);
}
function _temp4$31(element_5) {
	return element_5.scaleAnchorTransform || element_5.scalePivot;
}
function _temp3$36(n) {
	return n === void 0 ? "" : String(Number(n.toFixed(3)));
}
function _temp2$50(node) {
	return !node.isConnected;
}
function _temp$76(element) {
	return element.id;
}

export { ScaleSection, selectionRootIds };
