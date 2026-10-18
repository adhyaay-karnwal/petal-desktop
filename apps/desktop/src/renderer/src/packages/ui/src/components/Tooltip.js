// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Tooltip.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_react_dom } from "../../../compiler/src/runtime/runtime.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Anchor, Content$2, Root2$8 } from "../../../../vendor/@radix-ui/react-popper.js";

var CONTENT_ID = "petal-tooltip";
var TooltipStore = class {
	constructor(delayDuration, skipDelayDuration) {
		this.delayDuration = delayDuration;
		this.skipDelayDuration = skipDelayDuration;
		this.shown = null;
		this.listeners = /* @__PURE__ */ new Set();
		this.contents = /* @__PURE__ */ new WeakMap();
		this.checks = /* @__PURE__ */ new WeakMap();
		this.pending = null;
		this.pressed = null;
		this.lastClosedAt = -Infinity;
		this.subscribe = (listener) => {
			this.listeners.add(listener);
			return () => {
				this.listeners.delete(listener);
			};
		};
		this.getSnapshot = () => this.shown;
	}
	setContent(owner, content) {
		this.contents.set(owner, content);
		if (this.shown?.owner !== owner) return;
		this.shown = {
			...this.shown,
			content
		};
		this.emit();
	}
	setCanOpen(owner, canOpen) {
		if (canOpen) this.checks.set(owner, canOpen);
		else this.checks.delete(owner);
	}
	hover(owner, anchor) {
		if (this.pressed === owner || this.shown?.owner === owner || this.pending === owner) return;
		this.cancel();
		if (this.shown || performance.now() - this.lastClosedAt < this.skipDelayDuration) {
			this.show(owner, anchor);
			return;
		}
		this.pending = owner;
		this.timer = setTimeout(() => {
			this.pending = null;
			if (anchor.isConnected) this.show(owner, anchor);
		}, this.delayDuration);
	}
	focus(owner, anchor) {
		if (this.pressed !== owner) this.show(owner, anchor);
	}
	press(owner) {
		this.pressed = owner;
		this.hide(owner);
	}
	leave(owner) {
		if (this.pressed === owner) this.pressed = null;
		this.hide(owner);
	}
	release(owner) {
		if (this.pressed === owner) this.pressed = null;
		this.hide(owner);
		this.contents.delete(owner);
		this.checks.delete(owner);
	}
	hide(owner) {
		if (this.pending === owner) this.cancel();
		if (this.shown?.owner !== owner) return;
		this.shown.anchor.removeAttribute("aria-describedby");
		this.shown = null;
		this.lastClosedAt = performance.now();
		this.emit();
	}
	show(owner, anchor) {
		this.cancel();
		const content = this.contents.get(owner);
		if (!content || this.checks.get(owner)?.(anchor) === false) return;
		if (this.shown) this.shown.anchor.removeAttribute("aria-describedby");
		anchor.setAttribute("aria-describedby", CONTENT_ID);
		this.shown = {
			owner,
			anchor,
			content
		};
		this.emit();
	}
	cancel() {
		clearTimeout(this.timer);
		this.pending = null;
	}
	emit() {
		for (const listener of this.listeners) listener();
	}
};
var TooltipStoreContext = import_react.createContext(null);
function useTooltipStore() {
	const store = import_react.useContext(TooltipStoreContext);
	if (!store) throw new Error("Tooltip must be used within TooltipProvider");
	return store;
}
/** Delays are read once, when the provider mounts. */
function TooltipProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { delayDuration: t1, skipDelayDuration: t2, children } = t0;
	const delayDuration = t1 === void 0 ? 1e3 : t1;
	const skipDelayDuration = t2 === void 0 ? 300 : t2;
	let t3;
	if ($[0] !== delayDuration || $[1] !== skipDelayDuration) {
		t3 = () => new TooltipStore(delayDuration, skipDelayDuration);
		$[0] = delayDuration;
		$[1] = skipDelayDuration;
		$[2] = t3;
	} else t3 = $[2];
	const [store] = import_react.useState(t3);
	let t4;
	if ($[3] !== store) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipLayer, { store });
		$[3] = store;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== children || $[6] !== store || $[7] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipStoreContext.Provider, {
			value: store,
			children: [children, t4]
		});
		$[5] = children;
		$[6] = store;
		$[7] = t4;
		$[8] = t5;
	} else t5 = $[8];
	return t5;
}
function TooltipLayer(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { store } = t0;
	const shown = import_react.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
	let t1;
	let t2;
	if ($[0] !== shown || $[1] !== store) {
		t1 = () => {
			if (!shown) return;
			const { owner, anchor } = shown;
			const onKeyDown = (event) => {
				if (event.key === "Escape") store.hide(owner);
			};
			const onScroll = (event_0) => {
				if (event_0.target instanceof Node && event_0.target.contains(anchor)) store.hide(owner);
			};
			document.addEventListener("keydown", onKeyDown);
			window.addEventListener("scroll", onScroll, {
				capture: true,
				passive: true
			});
			return () => {
				document.removeEventListener("keydown", onKeyDown);
				window.removeEventListener("scroll", onScroll, { capture: true });
			};
		};
		t2 = [shown, store];
		$[0] = shown;
		$[1] = store;
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	import_react.useEffect(t1, t2);
	if (!shown) return null;
	const { side: t3, sideOffset: t4, align, className, children } = shown.content;
	const side = t3 === void 0 ? "bottom" : t3;
	const sideOffset = t4 === void 0 ? 4 : t4;
	let t5;
	if ($[4] !== shown.anchor) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor, { virtualRef: { current: shown.anchor } });
		$[4] = shown.anchor;
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== className) {
		t6 = cn$2("bg-ed-tooltip text-ed-tooltip-foreground border border-ed-tooltip-border z-50 w-fit max-w-64 rounded px-2 py-1 text-[11px] leading-3 text-balance pointer-events-none", className);
		$[6] = className;
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== align || $[9] !== children || $[10] !== side || $[11] !== sideOffset || $[12] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content$2, {
			id: CONTENT_ID,
			role: "tooltip",
			"data-slot": "tooltip-content",
			side,
			sideOffset,
			align,
			className: t6,
			children
		});
		$[8] = align;
		$[9] = children;
		$[10] = side;
		$[11] = sideOffset;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== t5 || $[15] !== t7) {
		t8 = (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2$8, { children: [t5, t7] }), document.body);
		$[14] = t5;
		$[15] = t7;
		$[16] = t8;
	} else t8 = $[16];
	return t8;
}
function compose(theirs, ours) {
	return (event) => {
		theirs?.(event);
		ours(event);
	};
}
/** Clones `child` with the handlers that drive the shared layer. */
function useTrigger(child, owner, disabled) {
	const $ = (0, import_compiler_runtime.c)(62);
	const store = useTooltipStore();
	let t0;
	let t1;
	if ($[0] !== owner || $[1] !== store) {
		t0 = () => () => store.release(owner);
		t1 = [store, owner];
		$[0] = owner;
		$[1] = store;
		$[2] = t0;
		$[3] = t1;
	} else {
		t0 = $[2];
		t1 = $[3];
	}
	import_react.useEffect(t0, t1);
	let t2;
	let t3;
	if ($[4] !== disabled || $[5] !== owner || $[6] !== store) {
		t2 = () => {
			if (disabled) store.hide(owner);
		};
		t3 = [
			disabled,
			store,
			owner
		];
		$[4] = disabled;
		$[5] = owner;
		$[6] = store;
		$[7] = t2;
		$[8] = t3;
	} else {
		t2 = $[7];
		t3 = $[8];
	}
	import_react.useEffect(t2, t3);
	if (disabled || !import_react.isValidElement(child)) return child;
	const props = child.props;
	let t4;
	if ($[9] !== child || $[10] !== owner || $[11] !== props.onBlur || $[12] !== props.onClick || $[13] !== props.onFocus || $[14] !== props.onPointerDown || $[15] !== props.onPointerLeave || $[16] !== props.onPointerMove || $[17] !== store) {
		let t5;
		if ($[19] !== owner || $[20] !== store) {
			t5 = (event) => {
				if (event.pointerType !== "touch") store.hover(owner, event.currentTarget);
			};
			$[19] = owner;
			$[20] = store;
			$[21] = t5;
		} else t5 = $[21];
		let t6;
		if ($[22] !== props.onPointerMove || $[23] !== t5) {
			t6 = compose(props.onPointerMove, t5);
			$[22] = props.onPointerMove;
			$[23] = t5;
			$[24] = t6;
		} else t6 = $[24];
		let t7;
		if ($[25] !== owner || $[26] !== store) {
			t7 = () => store.leave(owner);
			$[25] = owner;
			$[26] = store;
			$[27] = t7;
		} else t7 = $[27];
		let t8;
		if ($[28] !== props.onPointerLeave || $[29] !== t7) {
			t8 = compose(props.onPointerLeave, t7);
			$[28] = props.onPointerLeave;
			$[29] = t7;
			$[30] = t8;
		} else t8 = $[30];
		let t9;
		if ($[31] !== owner || $[32] !== store) {
			t9 = () => store.press(owner);
			$[31] = owner;
			$[32] = store;
			$[33] = t9;
		} else t9 = $[33];
		let t10;
		if ($[34] !== props.onPointerDown || $[35] !== t9) {
			t10 = compose(props.onPointerDown, t9);
			$[34] = props.onPointerDown;
			$[35] = t9;
			$[36] = t10;
		} else t10 = $[36];
		let t11;
		if ($[37] !== owner || $[38] !== store) {
			t11 = (event_0) => store.focus(owner, event_0.currentTarget);
			$[37] = owner;
			$[38] = store;
			$[39] = t11;
		} else t11 = $[39];
		let t12;
		if ($[40] !== props.onFocus || $[41] !== t11) {
			t12 = compose(props.onFocus, t11);
			$[40] = props.onFocus;
			$[41] = t11;
			$[42] = t12;
		} else t12 = $[42];
		let t13;
		if ($[43] !== owner || $[44] !== store) {
			t13 = () => store.hide(owner);
			$[43] = owner;
			$[44] = store;
			$[45] = t13;
		} else t13 = $[45];
		let t14;
		if ($[46] !== props.onBlur || $[47] !== t13) {
			t14 = compose(props.onBlur, t13);
			$[46] = props.onBlur;
			$[47] = t13;
			$[48] = t14;
		} else t14 = $[48];
		let t15;
		if ($[49] !== owner || $[50] !== store) {
			t15 = () => store.hide(owner);
			$[49] = owner;
			$[50] = store;
			$[51] = t15;
		} else t15 = $[51];
		let t16;
		if ($[52] !== props.onClick || $[53] !== t15) {
			t16 = compose(props.onClick, t15);
			$[52] = props.onClick;
			$[53] = t15;
			$[54] = t16;
		} else t16 = $[54];
		let t17;
		if ($[55] !== t10 || $[56] !== t12 || $[57] !== t14 || $[58] !== t16 || $[59] !== t6 || $[60] !== t8) {
			t17 = {
				onPointerMove: t6,
				onPointerLeave: t8,
				onPointerDown: t10,
				onFocus: t12,
				onBlur: t14,
				onClick: t16
			};
			$[55] = t10;
			$[56] = t12;
			$[57] = t14;
			$[58] = t16;
			$[59] = t6;
			$[60] = t8;
			$[61] = t17;
		} else t17 = $[61];
		t4 = import_react.cloneElement(child, t17);
		$[9] = child;
		$[10] = owner;
		$[11] = props.onBlur;
		$[12] = props.onClick;
		$[13] = props.onFocus;
		$[14] = props.onPointerDown;
		$[15] = props.onPointerLeave;
		$[16] = props.onPointerMove;
		$[17] = store;
		$[18] = t4;
	} else t4 = $[18];
	return t4;
}
var TooltipSlotContext = import_react.createContext(null);
/**
* `<Tooltip content={...} contentProps={...}>{child}</Tooltip>`, or composed:
* `<Tooltip><TooltipTrigger asChild>{child}</TooltipTrigger><TooltipContent>...`.
* `open={false}` suppresses the tooltip.
*/
function Tooltip(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { content, contentProps, open, canOpen, children } = t0;
	const [owner] = import_react.useState(_temp$122);
	const store = useTooltipStore();
	const withContent = content !== void 0;
	const disabled = open === false;
	const trigger = useTrigger(withContent ? children : null, owner, disabled);
	let t1;
	if ($[0] !== canOpen || $[1] !== content || $[2] !== contentProps || $[3] !== owner || $[4] !== store || $[5] !== withContent) {
		t1 = () => {
			store.setCanOpen(owner, canOpen);
			if (withContent) store.setContent(owner, {
				...contentProps,
				children: content
			});
		};
		$[0] = canOpen;
		$[1] = content;
		$[2] = contentProps;
		$[3] = owner;
		$[4] = store;
		$[5] = withContent;
		$[6] = t1;
	} else t1 = $[6];
	import_react.useLayoutEffect(t1);
	if (withContent) return trigger;
	let t2;
	if ($[7] !== disabled || $[8] !== owner) {
		t2 = {
			owner,
			disabled
		};
		$[7] = disabled;
		$[8] = owner;
		$[9] = t2;
	} else t2 = $[9];
	let t3;
	if ($[10] !== children || $[11] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipSlotContext.Provider, {
			value: t2,
			children
		});
		$[10] = children;
		$[11] = t2;
		$[12] = t3;
	} else t3 = $[12];
	return t3;
}
function _temp$122() {
	return {};
}
function useSlot(component) {
	const slot = import_react.useContext(TooltipSlotContext);
	if (!slot) throw new Error(`${component} must be used within Tooltip`);
	return slot;
}
/** Always behaves as `asChild`: the child element is the trigger. */
function TooltipTrigger(t0) {
	const { children } = t0;
	const { owner, disabled } = useSlot("TooltipTrigger");
	return useTrigger(children, owner, disabled);
}
/** Renders nothing in place; hands its content to the shared layer. */
function TooltipContent(props) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { owner } = useSlot("TooltipContent");
	const store = useTooltipStore();
	let t0;
	if ($[0] !== owner || $[1] !== props || $[2] !== store) {
		t0 = () => {
			store.setContent(owner, props);
		};
		$[0] = owner;
		$[1] = props;
		$[2] = store;
		$[3] = t0;
	} else t0 = $[3];
	import_react.useLayoutEffect(t0);
	return null;
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
