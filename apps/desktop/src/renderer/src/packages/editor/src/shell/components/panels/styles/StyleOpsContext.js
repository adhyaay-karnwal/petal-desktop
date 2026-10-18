// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/StyleOpsContext.tsx
import { import_react } from "../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../cloud/src/hooks/useSession.js";

/**
* Style operations context — every Styles-panel section consumes this instead
* of receiving `get/set/clear/has/sourceProps/...` as props.
*
* `DesignTab` builds the ops object once (read/write a property, source info,
* class management, computed values), and section components consume it via
* `useStyleOps()` or the per-field `useStyleField(property)` hook so every
* input row collapses to one line instead of repeating ten-line wiring.
*/
/** `base` with `patch` applied; keys the patch sets to undefined are removed. */
function mergePatch$1(base, patch) {
	const merged = {
		...base,
		...patch
	};
	for (const key of Object.keys(merged)) if (merged[key] === void 0) delete merged[key];
	return merged;
}
/** Runs `updater` on `element` and returns its full new styles and props, or null for no change. */
function applyElementUpdater(element, updater) {
	const current = {
		styles: element.styles ?? {},
		props: element.props ?? {}
	};
	const patch = updater(current);
	if (!patch) return null;
	return {
		styles: patch.styles && mergePatch$1(current.styles, patch.styles),
		props: patch.props && mergePatch$1(current.props, patch.props)
	};
}
/** Members that read styles. Tracked: a consumer re-renders when one it read changes. */
var READS = /* @__PURE__ */ new Set([
	"get",
	"getExplicit",
	"getIsMixed",
	"has",
	"hasAny",
	"sourceProps"
]);
/**
* Members called only outside render (writes, and handler-only getters such as
* getStore). Handed out as stable functions calling the latest ops.
*/
var ACTIONS = /* @__PURE__ */ new Set([
	"set",
	"setMultiple",
	"clear",
	"addClass",
	"removeClass",
	"replaceClasses",
	"removeClassesByCategory",
	"addClassForProperty",
	"onUpdateElementStyles",
	"alignCanvasPosition",
	"distributeCanvasPosition",
	"onToggleTextFormat",
	"getStore"
]);
/**
* The Design tab's current StyleOps, behind a stable identity. Handing sections
* the ops object itself re-rendered every section (~800 components) on each
* selection change, even where nothing it shows changed. Sections read through
* useStyleOps, which records what they read and re-renders only when that
* changes; writes always reach the latest ops.
*/
var StyleOpsStore = class {
	constructor() {
		this.listeners = /* @__PURE__ */ new Set();
		this.actions = /* @__PURE__ */ new Map();
		this.logs = /* @__PURE__ */ new WeakMap();
		this.published = 0;
		this.ops = null;
	}
	current() {
		return this.ops;
	}
	/** Called while DesignTab renders, so sections rendering in the same pass read the new ops. */
	stage(ops) {
		this.ops = ops;
	}
	/** Called after DesignTab commits: wakes the consumers whose reads changed. */
	publish() {
		this.published++;
		for (const listener of this.listeners) listener();
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	/**
	* A view of the latest ops that records the reads made through it. A
	* consumer keeps one view until a read changes, so a compiled consumer may
	* reuse reads it made in an earlier render.
	*/
	track() {
		const log = {
			reads: [],
			since: this.published,
			ops: this.ops
		};
		const view = trackedOps(this, log);
		this.logs.set(view, log);
		return view;
	}
	/** Calls `rerender` whenever a read made through `view` changes, starting
	*  now if `view` missed a publish (a hidden inspector misses publishes while
	*  unsubscribed). */
	watch(view, rerender) {
		const check = () => {
			const log = this.logs.get(view);
			if (log && readsChanged(this.ops, log.reads)) rerender();
		};
		if (this.logs.get(view)?.since !== this.published) check();
		return this.subscribe(check);
	}
	/**
	* True when ops staged since `view`'s reads were last checked change one of
	* them. A consumer whose own state changed renders in the same pass that
	* stages the new ops, before any publish; a compiled consumer would then mix
	* fresh reads with reads it cached on the old view.
	*/
	outdated(view) {
		const log = this.logs.get(view);
		if (!log || log.ops === this.ops) return false;
		log.ops = this.ops;
		return readsChanged(this.ops, log.reads);
	}
	/** A stable function that calls the latest ops member `key`. */
	action(key) {
		let fn = this.actions.get(key);
		if (!fn) {
			fn = (...args) => this.ops[key](...args);
			this.actions.set(key, fn);
		}
		return fn;
	}
};
var StyleOpsContext = import_react.createContext(null);
function sameValue(a, b) {
	if (Object.is(a, b)) return true;
	if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
	const ka = Object.keys(a);
	if (ka.length !== Object.keys(b).length) return false;
	return ka.every((k) => {
		const va = a[k];
		const vb = b[k];
		return typeof va === "function" && typeof vb === "function" || Object.is(va, vb);
	});
}
function readsChanged(ops, reads) {
	const members = ops;
	for (const read of reads) if (!sameValue(read.kind === "action" ? typeof members[read.key] === "function" : read.kind === "field" ? members[read.key] : read.kind === "computed" ? ops.computed[read.key] : members[read.key](...read.args), read.value)) return true;
	return false;
}
function sameRead(a, b) {
	if (a.kind !== b.kind || a.key !== b.key) return false;
	if (a.kind !== "call" || b.kind !== "call") return true;
	return a.args.length === b.args.length && a.args.every((arg, i) => Object.is(arg, b.args[i]));
}
/**
* A view of the store's latest ops that records reads into `log`. The view
* outlives a render, and handlers read through it too, so a repeated read
* replaces its earlier entry instead of growing the log.
*/
function trackedOps(store, log) {
	const record = (read) => {
		const i = log.reads.findIndex((r) => sameRead(r, read));
		if (i === -1) log.reads.push(read);
		else log.reads[i] = read;
	};
	return new Proxy({}, { get(_target, key) {
		const value = Reflect.get(store.current(), key);
		if (typeof key !== "string") return value;
		if (ACTIONS.has(key)) {
			record({
				kind: "action",
				key,
				value: typeof value === "function"
			});
			return typeof value === "function" ? store.action(key) : value;
		}
		if (READS.has(key)) return (...args) => {
			const result = value(...args);
			record({
				kind: "call",
				key,
				args,
				value: result
			});
			if (!result || typeof result !== "object") return result;
			const live = { ...result };
			for (const [name, member] of Object.entries(result)) if (typeof member === "function") live[name] = (...a) => {
				return store.current()[key](...args)[name]?.(...a);
			};
			return live;
		};
		if (key === "computed") return new Proxy(value, { get(computed, prop) {
			const v = Reflect.get(computed, prop);
			if (typeof prop === "string") record({
				kind: "computed",
				key: prop,
				value: v
			});
			return v;
		} });
		record({
			kind: "field",
			key,
			value
		});
		return value;
	} });
}
function useStyleOps() {
	"use no memo";
	const store = import_react.useContext(StyleOpsContext);
	if (!store) throw new Error("useStyleOps must be used within a StyleOpsContext.Provider");
	const [view, setView] = import_react.useState(() => store.track());
	let ops = view;
	if (store.outdated(view)) {
		ops = store.track();
		setView(ops);
	}
	import_react.useLayoutEffect(() => store.watch(ops, () => setView(store.track())), [store, ops]);
	return ops;
}
/**
* Per-property hook that wraps the StyleOps context for a single CSS property.
* Collapses the repeated wiring (value/onChange/isMixed/source/addClass) into
* a single object per field.
*/
function useStyleField(property) {
	const $ = (0, import_compiler_runtime.c)(36);
	const ops = useStyleOps();
	let t0;
	if ($[0] !== ops || $[1] !== property) {
		t0 = ops.get(property);
		$[0] = ops;
		$[1] = property;
		$[2] = t0;
	} else t0 = $[2];
	const value = t0;
	let t1;
	if ($[3] !== ops || $[4] !== property) {
		t1 = ops.getIsMixed(property);
		$[3] = ops;
		$[4] = property;
		$[5] = t1;
	} else t1 = $[5];
	const isMixed = t1;
	let t2;
	if ($[6] !== ops || $[7] !== property) {
		t2 = ops.getExplicit(property);
		$[6] = ops;
		$[7] = property;
		$[8] = t2;
	} else t2 = $[8];
	const t3 = ops.computed[property] ?? "";
	let t4;
	if ($[9] !== ops || $[10] !== property) {
		t4 = ops.has(property);
		$[9] = ops;
		$[10] = property;
		$[11] = t4;
	} else t4 = $[11];
	let t5;
	if ($[12] !== ops || $[13] !== property) {
		t5 = ops.sourceProps(property);
		$[12] = ops;
		$[13] = property;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	let t7;
	let t8;
	if ($[15] !== ops || $[16] !== property) {
		t6 = (v) => ops.set(property, v);
		t7 = () => ops.clear(property);
		t8 = (cls) => ops.addClassForProperty(cls, property);
		$[15] = ops;
		$[16] = property;
		$[17] = t6;
		$[18] = t7;
		$[19] = t8;
	} else {
		t6 = $[17];
		t7 = $[18];
		t8 = $[19];
	}
	let t10;
	let t9;
	if ($[20] !== isMixed || $[21] !== value) {
		t9 = (target) => !isMixed && value === target;
		t10 = (...t11) => {
			return !isMixed && t11.includes(value);
		};
		$[20] = isMixed;
		$[21] = value;
		$[22] = t10;
		$[23] = t9;
	} else {
		t10 = $[22];
		t9 = $[23];
	}
	let t11;
	if ($[24] !== isMixed || $[25] !== t10 || $[26] !== t2 || $[27] !== t3 || $[28] !== t4 || $[29] !== t5 || $[30] !== t6 || $[31] !== t7 || $[32] !== t8 || $[33] !== t9 || $[34] !== value) {
		t11 = {
			value,
			explicit: t2,
			isMixed,
			computed: t3,
			isSet: t4,
			source: t5,
			set: t6,
			clear: t7,
			addClass: t8,
			equals: t9,
			in: t10
		};
		$[24] = isMixed;
		$[25] = t10;
		$[26] = t2;
		$[27] = t3;
		$[28] = t4;
		$[29] = t5;
		$[30] = t6;
		$[31] = t7;
		$[32] = t8;
		$[33] = t9;
		$[34] = value;
		$[35] = t11;
	} else t11 = $[35];
	return t11;
}

export { StyleOpsContext, StyleOpsStore, applyElementUpdater, mergePatch$1, useStyleField, useStyleOps };
