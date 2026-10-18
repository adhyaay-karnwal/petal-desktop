// Reconstructed from index-C74mRL57.js — original module: vendor/@tanstack/react-virtual
import { import_react } from "./react-query.js";
import { import_react_dom } from "../../packages/compiler/src/runtime/runtime.js";
import { Virtualizer, elementScroll, observeElementOffset, observeElementRect } from "./virtual-core.js";

var useIsomorphicLayoutEffect = typeof document !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
function useVirtualizerBase({ useFlushSync = true, directDomUpdates = false, directDomUpdatesMode = "transform", ...options }) {
	const rerender = import_react.useReducer((x) => x + 1, 0)[1];
	const directRef = import_react.useRef({
		enabled: directDomUpdates,
		mode: directDomUpdatesMode,
		container: null,
		lastSize: null,
		lastPositions: /* @__PURE__ */ new WeakMap(),
		prevRange: null
	});
	directRef.current.enabled = directDomUpdates;
	directRef.current.mode = directDomUpdatesMode;
	const measuringFromRef = import_react.useRef(false);
	const applyContainerSize = (instance2) => {
		const state = directRef.current;
		if (!state.enabled || !state.container) return;
		const totalSize = instance2.getTotalSize();
		if (totalSize !== state.lastSize) {
			state.lastSize = totalSize;
			const sizeAxis = instance2.options.horizontal ? "width" : "height";
			state.container.style[sizeAxis] = `${totalSize}px`;
		}
	};
	const applyDirectStyles = (instance2) => {
		const state = directRef.current;
		if (!state.enabled || !state.container) return;
		applyContainerSize(instance2);
		const horizontal = !!instance2.options.horizontal;
		const useTransform = state.mode === "transform";
		const posAxis = horizontal ? "left" : "top";
		const scrollMargin = instance2.options.scrollMargin;
		const items = instance2.getVirtualItems();
		for (const item of items) {
			const next = item.start - scrollMargin;
			const el = instance2.elementsCache.get(item.key);
			if (!el) continue;
			if (state.lastPositions.get(el) === next) continue;
			state.lastPositions.set(el, next);
			if (useTransform) el.style.transform = horizontal ? `translate3d(${next}px, 0, 0)` : `translate3d(0, ${next}px, 0)`;
			else el.style[posAxis] = `${next}px`;
		}
	};
	const resolvedOptions = {
		...options,
		onChange: (instance2, sync) => {
			var _a;
			const state = directRef.current;
			let shouldRerender = true;
			if (state.enabled) {
				applyDirectStyles(instance2);
				const range = instance2.range;
				const prev = state.prevRange;
				shouldRerender = !prev || prev.isScrolling !== instance2.isScrolling || prev.startIndex !== (range == null ? void 0 : range.startIndex) || prev.endIndex !== (range == null ? void 0 : range.endIndex);
				if (shouldRerender) state.prevRange = range ? {
					startIndex: range.startIndex,
					endIndex: range.endIndex,
					isScrolling: instance2.isScrolling
				} : null;
			}
			if (shouldRerender) {
				if (useFlushSync && sync && !measuringFromRef.current) (0, import_react_dom.flushSync)(rerender);
				else rerender();
			}
			(_a = options.onChange) == null || _a.call(options, instance2, sync);
		}
	};
	const [instance] = import_react.useState(() => {
		const v = new Virtualizer(resolvedOptions);
		const measureElement = v.measureElement;
		v.measureElement = (node) => {
			measuringFromRef.current = true;
			try {
				measureElement(node);
			} finally {
				measuringFromRef.current = false;
			}
		};
		return Object.assign(v, { containerRef: (node) => {
			const state = directRef.current;
			state.container = node;
			state.lastSize = null;
			if (node && state.enabled) {
				const total = v.getTotalSize();
				state.lastSize = total;
				const axis = v.options.horizontal ? "width" : "height";
				node.style[axis] = `${total}px`;
			}
		} });
	});
	instance.setOptions(resolvedOptions);
	useIsomorphicLayoutEffect(() => {
		return instance._didMount();
	}, []);
	useIsomorphicLayoutEffect(() => {
		applyContainerSize(instance);
		return instance._willUpdate();
	});
	useIsomorphicLayoutEffect(() => {
		applyDirectStyles(instance);
	});
	return instance;
}
function useVirtualizer(options) {
	return useVirtualizerBase({
		observeElementRect,
		observeElementOffset,
		scrollToFn: elementScroll,
		...options
	});
}

export { useVirtualizer };
