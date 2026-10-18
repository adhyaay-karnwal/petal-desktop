// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/useInspectorScrub.ts
import { import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { blurInspectorInputOnEnter } from "../primitives.js";
import { usePages } from "../../../../../shared/state/pages.js";
import { ScrubSessionContext, useScrub } from "../../../../../shared/utils/useScrub.js";

/** Some keyboards and OSes send a keyup/keydown pair for each autorepeat. */
var KEY_RELEASE_GRACE_MS = 150;
function roundStep(value, precision) {
	const f = 10 ** (precision ?? 6);
	return Math.round(value * f) / f;
}
/** Cmd/Ctrl+Z is undo; Shift+Cmd/Ctrl+Z and Ctrl+Y are redo. */
function historyKey(event) {
	if (!(event.metaKey || event.ctrlKey) || event.altKey) return null;
	const key = event.key.toLowerCase();
	if (key === "z") return event.shiftKey ? "redo" : "undo";
	return key === "y" && !event.shiftKey ? "redo" : null;
}
/** Typing edits the text, so Cmd+Z there is the browser's text undo again. */
function editsText(event) {
	if (event.metaKey || event.ctrlKey) return false;
	return event.key.length === 1 || event.key === "Backspace" || event.key === "Delete";
}
/**
* Adds inspector active-state tracking without changing the shared scrub hook,
* and arrow-key stepping for the field's input with the same value, step and
* limits as the scrub.
*/
function useInspectorScrub(getCurrentValue, onChange, t0) {
	const $ = (0, import_compiler_runtime.c)(34);
	let t1;
	if ($[0] !== t0) {
		t1 = t0 === void 0 ? {} : t0;
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const options = t1;
	const [isScrubbing, setIsScrubbing] = (0, import_react.useState)(false);
	let onEnd;
	let onStart;
	let scrubOptions;
	let t2;
	if ($[2] !== options) {
		({onStart, onEnd, mixed: t2, ...scrubOptions} = options);
		$[2] = options;
		$[3] = onEnd;
		$[4] = onStart;
		$[5] = scrubOptions;
		$[6] = t2;
	} else {
		onEnd = $[3];
		onStart = $[4];
		scrubOptions = $[5];
		t2 = $[6];
	}
	const mixed = t2 === void 0 ? false : t2;
	let t3;
	if ($[7] !== onStart) {
		t3 = (start) => {
			setIsScrubbing(true);
			onStart?.(start);
		};
		$[7] = onStart;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] !== onEnd) {
		t4 = (final) => {
			setIsScrubbing(false);
			onEnd?.(final);
		};
		$[9] = onEnd;
		$[10] = t4;
	} else t4 = $[10];
	let t5;
	if ($[11] !== scrubOptions || $[12] !== t3 || $[13] !== t4) {
		t5 = {
			...scrubOptions,
			onStart: t3,
			onEnd: t4
		};
		$[11] = scrubOptions;
		$[12] = t3;
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	const scrubRef = useScrub(getCurrentValue, onChange, t5);
	const session = (0, import_react.useContext)(ScrubSessionContext);
	let t6;
	if ($[15] !== options || $[16] !== session) {
		t6 = {
			options,
			session
		};
		$[15] = options;
		$[16] = session;
		$[17] = t6;
	} else t6 = $[17];
	const latestRef = (0, import_react.useRef)(t6);
	let t7;
	if ($[18] !== options || $[19] !== session) {
		t7 = () => {
			latestRef.current = {
				options,
				session
			};
		};
		$[18] = options;
		$[19] = session;
		$[20] = t7;
	} else t7 = $[20];
	(0, import_react.useEffect)(t7);
	const heldRef = (0, import_react.useRef)(null);
	const steppedRef = (0, import_react.useRef)(null);
	let t8;
	let t9;
	if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => () => heldRef.current?.end();
		t9 = [];
		$[21] = t8;
		$[22] = t9;
	} else {
		t8 = $[21];
		t9 = $[22];
	}
	(0, import_react.useEffect)(t8, t9);
	let t10;
	if ($[23] !== getCurrentValue || $[24] !== mixed || $[25] !== onChange || $[26] !== onStart || $[27] !== options || $[28] !== session) {
		t10 = (event) => {
			blurInspectorInputOnEnter(event);
			if (steppedRef.current === event.currentTarget) {
				const history = historyKey(event);
				if (history) {
					event.preventDefault();
					heldRef.current?.end();
					usePages.getState()[history]();
					return;
				}
				if (editsText(event)) steppedRef.current = null;
			}
			const direction = event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
			if (direction === 0 || mixed || event.metaKey || event.ctrlKey || event.altKey || event.nativeEvent.isComposing || event.currentTarget.readOnly) return;
			event.preventDefault();
			const input = event.currentTarget;
			let held = heldRef.current;
			if (held) clearTimeout(held.releaseTimer);
			if (!held) {
				const start_0 = getCurrentValue();
				const onKeyUp = (e) => {
					if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
					clearTimeout(held?.releaseTimer);
					if (held) held.releaseTimer = setTimeout(end, KEY_RELEASE_GRACE_MS);
				};
				const end = () => {
					if (heldRef.current !== held || !held) return;
					clearTimeout(held.releaseTimer);
					heldRef.current = null;
					document.removeEventListener("keyup", onKeyUp);
					input.removeEventListener("blur", end);
					latestRef.current.options.onEnd?.(held.value);
					latestRef.current.session.onEnd();
				};
				held = {
					value: Number.isFinite(start_0) ? start_0 : 0,
					end
				};
				heldRef.current = held;
				document.addEventListener("keyup", onKeyUp);
				input.addEventListener("blur", end);
				onStart?.(held.value);
				session.onStart();
			}
			const { step: t11, min, max, precision } = options;
			const step = t11 === void 0 ? 1 : t11;
			let next = roundStep(held.value + direction * step * (event.shiftKey ? 10 : 1), precision);
			if (min !== void 0 && next < min) next = min;
			if (max !== void 0 && next > max) next = max;
			if (next === held.value) return;
			held.value = next;
			if (steppedRef.current !== input) {
				steppedRef.current = input;
				input.addEventListener("blur", () => {
					if (steppedRef.current === input) steppedRef.current = null;
				}, { once: true });
			}
			onChange(next);
			requestAnimationFrame(() => {
				if (document.activeElement === input) input.select();
			});
		};
		$[23] = getCurrentValue;
		$[24] = mixed;
		$[25] = onChange;
		$[26] = onStart;
		$[27] = options;
		$[28] = session;
		$[29] = t10;
	} else t10 = $[29];
	const onInputKeyDown = t10;
	let t11;
	if ($[30] !== isScrubbing || $[31] !== onInputKeyDown || $[32] !== scrubRef) {
		t11 = {
			scrubRef,
			isScrubbing,
			onInputKeyDown
		};
		$[30] = isScrubbing;
		$[31] = onInputKeyDown;
		$[32] = scrubRef;
		$[33] = t11;
	} else t11 = $[33];
	return t11;
}

export { useInspectorScrub };
