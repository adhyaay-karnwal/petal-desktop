// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/InspectorSlider.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../../../ui/src/lib/utils.js";
import { InspectorControlInput, InspectorControlShell } from "../primitives.js";

/**
* A field-shaped slider: label on the left, value on the right, and the whole field drags. Dragging
* is relative to where the press started, so grabbing it never jumps the value. Double-click the
* value to type one.
*/
/** Pointer travel before a press counts as a drag, so a click (or double-click) never changes the value. */
var DRAG_THRESHOLD_PX = 3;
/** Clearance around the label and value text inside which the head hides. */
var TEXT_CLEARANCE_PX = 4;
function InspectorSlider(t0) {
	const $ = (0, import_compiler_runtime.c)(75);
	const { label, value, min, max, origin: t1, step: t2, onValueChange, onValueCommit } = t0;
	const origin = t1 === void 0 ? min : t1;
	const step = t2 === void 0 ? 1 : t2;
	const [dragging, setDragging] = import_react.useState(false);
	const [editing, setEditing] = import_react.useState(false);
	const drag = import_react.useRef(null);
	const shellRef = import_react.useRef(null);
	const labelRef = import_react.useRef(null);
	const valueRef = import_react.useRef(null);
	const [textBounds, setTextBounds] = import_react.useState(null);
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			const shell = shellRef.current;
			if (!shell) return;
			const measure = () => {
				const label_0 = labelRef.current;
				const valueEl = valueRef.current;
				const next = {
					width: shell.offsetWidth,
					labelEnd: label_0 ? label_0.offsetLeft + label_0.offsetWidth : 0,
					valueStart: valueEl ? valueEl.offsetLeft : shell.offsetWidth
				};
				setTextBounds((prev) => prev && prev.width === next.width && prev.labelEnd === next.labelEnd && prev.valueStart === next.valueStart ? prev : next);
			};
			const observer = new ResizeObserver(measure);
			for (const el of [
				shell,
				labelRef.current,
				valueRef.current
			]) if (el) observer.observe(el);
			return () => observer.disconnect();
		};
		$[0] = t3;
	} else t3 = $[0];
	let t4;
	if ($[1] !== editing) {
		t4 = [editing];
		$[1] = editing;
		$[2] = t4;
	} else t4 = $[2];
	import_react.useLayoutEffect(t3, t4);
	let t5;
	if ($[3] !== max || $[4] !== min || $[5] !== step) {
		t5 = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
		$[3] = max;
		$[4] = min;
		$[5] = step;
		$[6] = t5;
	} else t5 = $[6];
	const clamp = t5;
	let t6;
	if ($[7] !== max || $[8] !== min) {
		t6 = (v_0) => (v_0 - min) / (max - min) * 100;
		$[7] = max;
		$[8] = min;
		$[9] = t6;
	} else t6 = $[9];
	const percent = t6;
	const at = percent(value);
	const from = percent(origin);
	const headX = textBounds ? at / 100 * textBounds.width : null;
	const headUnderText = textBounds !== null && headX !== null && (headX < textBounds.labelEnd + TEXT_CLEARANCE_PX || headX > textBounds.valueStart - TEXT_CLEARANCE_PX);
	let t7;
	if ($[10] !== clamp || $[11] !== onValueChange || $[12] !== onValueCommit || $[13] !== value) {
		t7 = (delta) => {
			const next_0 = clamp(value + delta);
			if (next_0 === value) return;
			onValueChange(next_0);
			onValueCommit(next_0);
		};
		$[10] = clamp;
		$[11] = onValueChange;
		$[12] = onValueCommit;
		$[13] = value;
		$[14] = t7;
	} else t7 = $[14];
	const stepBy = t7;
	const t8 = dragging || editing;
	const t9 = editing ? -1 : 0;
	let t10;
	if ($[15] !== editing) {
		t10 = (event) => {
			if (!editing) event.preventDefault();
		};
		$[15] = editing;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== editing || $[18] !== value) {
		t11 = (event_0) => {
			if (editing || event_0.button !== 0) return;
			drag.current = {
				x: event_0.clientX,
				start: value,
				width: event_0.currentTarget.offsetWidth,
				moved: false,
				value
			};
		};
		$[17] = editing;
		$[18] = value;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== clamp || $[21] !== max || $[22] !== min || $[23] !== onValueChange) {
		t12 = (event_1) => {
			const state = drag.current;
			if (!state) return;
			const dx = event_1.clientX - state.x;
			if (!state.moved) {
				if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
				state.moved = true;
				event_1.currentTarget.setPointerCapture(event_1.pointerId);
				setDragging(true);
			}
			const next_1 = clamp(state.start + dx / state.width * (max - min));
			if (next_1 === state.value) return;
			state.value = next_1;
			onValueChange(next_1);
		};
		$[20] = clamp;
		$[21] = max;
		$[22] = min;
		$[23] = onValueChange;
		$[24] = t12;
	} else t12 = $[24];
	let t13;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = () => {
			if (drag.current && !drag.current.moved) drag.current = null;
		};
		$[25] = t13;
	} else t13 = $[25];
	let t14;
	let t15;
	if ($[26] !== onValueCommit) {
		t14 = () => {
			const state_0 = drag.current;
			drag.current = null;
			if (!state_0?.moved) return;
			setDragging(false);
			onValueCommit(state_0.value);
		};
		t15 = () => {
			const state_1 = drag.current;
			drag.current = null;
			if (!state_1?.moved) return;
			setDragging(false);
			onValueCommit(state_1.value);
		};
		$[26] = onValueCommit;
		$[27] = t14;
		$[28] = t15;
	} else {
		t14 = $[27];
		t15 = $[28];
	}
	let t16;
	if ($[29] !== editing || $[30] !== step || $[31] !== stepBy) {
		t16 = (event_2) => {
			if (editing) return;
			const delta_0 = event_2.shiftKey ? step * 10 : step;
			if (event_2.key === "ArrowRight" || event_2.key === "ArrowUp") stepBy(delta_0);
			else if (event_2.key === "ArrowLeft" || event_2.key === "ArrowDown") stepBy(-delta_0);
			else if (event_2.key === "Enter") setEditing(true);
			else return;
			event_2.preventDefault();
		};
		$[29] = editing;
		$[30] = step;
		$[31] = stepBy;
		$[32] = t16;
	} else t16 = $[32];
	const t17 = `${Math.min(from, at)}%`;
	let t18;
	if ($[33] !== at || $[34] !== from) {
		t18 = Math.abs(at - from);
		$[33] = at;
		$[34] = from;
		$[35] = t18;
	} else t18 = $[35];
	const t19 = `${t18}%`;
	let t20;
	if ($[36] !== t17 || $[37] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute inset-y-0 bg-ed-foreground/8",
			style: {
				left: t17,
				width: t19
			}
		});
		$[36] = t17;
		$[37] = t19;
		$[38] = t20;
	} else t20 = $[38];
	const t21 = dragging ? "bg-ed-foreground" : "bg-ed-foreground-secondary";
	const t22 = headUnderText && "invisible";
	let t23;
	if ($[39] !== t21 || $[40] !== t22) {
		t23 = cn$2("absolute top-1/2 hidden h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full group-hover/inspector-control:block group-focus-visible/inspector-control:block group-data-[active=true]/inspector-control:block", t21, t22);
		$[39] = t21;
		$[40] = t22;
		$[41] = t23;
	} else t23 = $[41];
	const t24 = `${at}%`;
	let t25;
	if ($[42] !== t24) {
		t25 = { left: t24 };
		$[42] = t24;
		$[43] = t25;
	} else t25 = $[43];
	let t26;
	if ($[44] !== t23 || $[45] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: t23,
			style: t25
		});
		$[44] = t23;
		$[45] = t25;
		$[46] = t26;
	} else t26 = $[46];
	const t27 = value !== origin ? "text-ed-foreground" : "text-ed-foreground-secondary";
	let t28;
	if ($[47] !== t27) {
		t28 = cn$2("relative mr-auto min-w-0 truncate pl-2", t27);
		$[47] = t27;
		$[48] = t28;
	} else t28 = $[48];
	let t29;
	if ($[49] !== label || $[50] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: labelRef,
			className: t28,
			children: label
		});
		$[49] = label;
		$[50] = t28;
		$[51] = t29;
	} else t29 = $[51];
	let t30;
	if ($[52] !== clamp || $[53] !== editing || $[54] !== onValueChange || $[55] !== onValueCommit || $[56] !== value) {
		t30 = editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderValueInput, {
			inputRef: (input) => {
				valueRef.current = input;
			},
			value,
			onDone: (typed) => {
				setEditing(false);
				if (typed === null) return;
				const next_2 = clamp(typed);
				if (next_2 === value) return;
				onValueChange(next_2);
				onValueCommit(next_2);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: valueRef,
			className: "relative shrink-0 pr-2 tabular-nums text-ed-inspector-value",
			onDoubleClick: () => setEditing(true),
			children: value
		});
		$[52] = clamp;
		$[53] = editing;
		$[54] = onValueChange;
		$[55] = onValueCommit;
		$[56] = value;
		$[57] = t30;
	} else t30 = $[57];
	let t31;
	if ($[58] !== label || $[59] !== max || $[60] !== min || $[61] !== t10 || $[62] !== t11 || $[63] !== t12 || $[64] !== t14 || $[65] !== t15 || $[66] !== t16 || $[67] !== t20 || $[68] !== t26 || $[69] !== t29 || $[70] !== t30 || $[71] !== t8 || $[72] !== t9 || $[73] !== value) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
			ref: shellRef,
			active: t8,
			role: "slider",
			tabIndex: t9,
			"aria-label": label,
			"aria-valuemin": min,
			"aria-valuemax": max,
			"aria-valuenow": value,
			className: "relative cursor-ew-resize touch-none select-none overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ed-ring",
			onMouseDown: t10,
			onPointerDown: t11,
			onPointerMove: t12,
			onPointerLeave: t13,
			onPointerUp: t14,
			onPointerCancel: t15,
			onKeyDown: t16,
			children: [
				t20,
				t26,
				t29,
				t30
			]
		});
		$[58] = label;
		$[59] = max;
		$[60] = min;
		$[61] = t10;
		$[62] = t11;
		$[63] = t12;
		$[64] = t14;
		$[65] = t15;
		$[66] = t16;
		$[67] = t20;
		$[68] = t26;
		$[69] = t29;
		$[70] = t30;
		$[71] = t8;
		$[72] = t9;
		$[73] = value;
		$[74] = t31;
	} else t31 = $[74];
	return t31;
}
/** Typing a value: Enter or blur applies it, Escape cancels. Reports `null` when nothing valid was typed. */
function SliderValueInput(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { inputRef, value, onDone } = t0;
	const [draft, setDraft] = import_react.useState(String(value));
	const done = import_react.useRef(false);
	let t1;
	if ($[0] !== onDone) {
		t1 = (typed) => {
			if (done.current) return;
			done.current = true;
			onDone(typed);
		};
		$[0] = onDone;
		$[1] = t1;
	} else t1 = $[1];
	const finish = t1;
	let t2;
	if ($[2] !== draft) {
		t2 = () => {
			const n = Number(draft.trim().replace(/^\+/, "").replace("−", "-"));
			return draft.trim() !== "" && Number.isFinite(n) ? n : null;
		};
		$[2] = draft;
		$[3] = t2;
	} else t2 = $[3];
	const parsed = t2;
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (event) => setDraft(event.target.value);
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	let t5;
	if ($[5] !== finish || $[6] !== parsed) {
		t4 = (event_1) => {
			event_1.stopPropagation();
			if (event_1.key === "Enter") finish(parsed());
			else if (event_1.key === "Escape") finish(null);
		};
		t5 = () => finish(parsed());
		$[5] = finish;
		$[6] = parsed;
		$[7] = t4;
		$[8] = t5;
	} else {
		t4 = $[7];
		t5 = $[8];
	}
	let t6;
	if ($[9] !== draft || $[10] !== inputRef || $[11] !== t4 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			ref: inputRef,
			autoFocus: true,
			value: draft,
			onChange: t3,
			onPointerDown: _temp$73,
			onKeyDown: t4,
			onBlur: t5,
			className: "relative w-12 flex-none pr-2 text-right tabular-nums"
		});
		$[9] = draft;
		$[10] = inputRef;
		$[11] = t4;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}
function _temp$73(event_0) {
	return event_0.stopPropagation();
}

export { InspectorSlider };
