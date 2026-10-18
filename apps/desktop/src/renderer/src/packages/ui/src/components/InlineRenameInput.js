// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/InlineRenameInput.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";

/**
* Edits a label in place. Render it where the label's text was, inside the element
* that sets its typography: the input inherits the font, has no padding or border,
* and is sized by an invisible copy of the draft, so the text doesn't move when
* editing starts or ends. The border and fill sit outside the box for the same reason.
*/
function InlineRenameInput(t0) {
	const $ = (0, import_compiler_runtime.c)(30);
	let className;
	let onCommit;
	let onDone;
	let props;
	let value;
	if ($[0] !== t0) {
		({value, onCommit, onDone, className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = onCommit;
		$[3] = onDone;
		$[4] = props;
		$[5] = value;
	} else {
		className = $[1];
		onCommit = $[2];
		onDone = $[3];
		props = $[4];
		value = $[5];
	}
	const [draft, setDraft] = import_react.useState(value);
	const inputRef = import_react.useRef(null);
	const finished = import_react.useRef(false);
	let t1;
	let t2;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const frame = requestAnimationFrame(() => {
				const input = inputRef.current;
				if (!input) return;
				input.focus({ preventScroll: true });
				input.select();
				input.scrollLeft = 0;
			});
			return () => cancelAnimationFrame(frame);
		};
		t2 = [];
		$[6] = t1;
		$[7] = t2;
	} else {
		t1 = $[6];
		t2 = $[7];
	}
	import_react.useEffect(t1, t2);
	let t3;
	if ($[8] !== draft || $[9] !== onCommit || $[10] !== onDone || $[11] !== value) {
		t3 = (save) => {
			if (finished.current) return;
			finished.current = true;
			const next = draft.trim();
			if (save && next !== value.trim()) onCommit(next);
			onDone();
		};
		$[8] = draft;
		$[9] = onCommit;
		$[10] = onDone;
		$[11] = value;
		$[12] = t3;
	} else t3 = $[12];
	const finish = t3;
	const stop = _temp$121;
	let t4;
	if ($[13] !== className) {
		t4 = cn$2("relative isolate inline-grid min-w-0 max-w-full before:pointer-events-none before:absolute before:-inset-x-[3px] before:top-1/2 before:h-5 before:-translate-y-1/2 before:-z-10 before:rounded-[2px] before:border before:border-ed-inspector-active-border", className);
		$[13] = className;
		$[14] = t4;
	} else t4 = $[14];
	let t5;
	if ($[15] !== draft) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "invisible col-start-1 row-start-1 overflow-hidden whitespace-pre pr-0.5",
			children: draft
		});
		$[15] = draft;
		$[16] = t5;
	} else t5 = $[16];
	let t6;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (event_0) => setDraft(event_0.target.value);
		$[17] = t6;
	} else t6 = $[17];
	let t7;
	let t8;
	if ($[18] !== finish) {
		t7 = () => finish(true);
		t8 = (event_1) => {
			event_1.stopPropagation();
			if (event_1.nativeEvent.isComposing || event_1.keyCode === 229) return;
			if (event_1.key === "Enter") {
				event_1.preventDefault();
				finish(true);
			}
			if (event_1.key === "Escape") {
				event_1.preventDefault();
				finish(false);
			}
		};
		$[18] = finish;
		$[19] = t7;
		$[20] = t8;
	} else {
		t7 = $[19];
		t8 = $[20];
	}
	let t9;
	if ($[21] !== draft || $[22] !== props || $[23] !== t7 || $[24] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			"data-slot": "inline-rename-input",
			type: "text",
			spellCheck: false,
			autoComplete: "off",
			...props,
			value: draft,
			onChange: t6,
			onBlur: t7,
			onKeyDown: t8,
			onPointerDown: stop,
			onMouseDown: stop,
			onClick: stop,
			onDoubleClick: stop,
			className: "col-start-1 row-start-1 m-0 w-0 min-w-full border-0 bg-transparent p-0 text-inherit outline-none select-text selection:bg-ed-primary/20"
		});
		$[21] = draft;
		$[22] = props;
		$[23] = t7;
		$[24] = t8;
		$[25] = t9;
	} else t9 = $[25];
	let t10;
	if ($[26] !== t4 || $[27] !== t5 || $[28] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: t4,
			children: [t5, t9]
		});
		$[26] = t4;
		$[27] = t5;
		$[28] = t9;
		$[29] = t10;
	} else t10 = $[29];
	return t10;
}
/**
* Holds a just-committed name while the label's source catches up: the field closes
* at once, but the name it saved often reaches the label later (a deferred render, a
* query cache that notifies on the next task, another renderer). `current` reads the
* source's name for a key; the held name is dropped as soon as that changes at all, so
* a rollback or someone else's edit still shows.
*/
function _temp$121(event) {
	return event.stopPropagation();
}
function usePendingRename(current) {
	const $ = (0, import_compiler_runtime.c)(8);
	const [pending, setPending] = import_react.useState(null);
	if (pending && current(pending.key) !== pending.from) setPending(null);
	let t0;
	if ($[0] !== pending) {
		t0 = (key, fallback) => pending?.key === key ? pending.name : fallback;
		$[0] = pending;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== current) {
		t1 = (key_0, name) => setPending({
			key: key_0,
			name,
			from: current(key_0)
		});
		$[2] = current;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => setPending(null);
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== t0 || $[6] !== t1) {
		t3 = {
			nameOf: t0,
			hold: t1,
			clear: t2
		};
		$[5] = t0;
		$[6] = t1;
		$[7] = t3;
	} else t3 = $[7];
	return t3;
}

export { InlineRenameInput, usePendingRename };
