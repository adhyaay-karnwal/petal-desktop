// Reconstructed from index-C74mRL57.js — original module: vendor/@base-ui-components/react
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { import_react_dom } from "../../packages/compiler/src/runtime/runtime.js";
import { clamp$5, evaluate, floor, getAlignment, getAlignmentAxis, getAxisLength, getComputedStyle$1, getNodeName, getOverflowAncestors, getPaddingObject, getParentNode, getSide$1, getSideAxis, getWindow, isElement, isHTMLElement$1, isLastTraversableNode, isNode, isShadowRoot, isWebKit$1 } from "../@floating-ui/utils.js";
import { autoUpdate } from "../@floating-ui/dom.js";
import { flip, hide$1, limitShift, offset$1, shift$1, size, useFloating$1 } from "../@floating-ui/react-dom.js";
import { AnimationFrame, EMPTY_ARRAY, EMPTY_OBJECT, NOOP, ReactStore, Store, Timeout, formatErrorMessage, getReactElementRef, inertValue, isAndroid$1, isFirefox, isJSDOM, isSafari$1, mergeObjects$1, ownerDocument, useAnimationFrame, useControlled, useEnhancedClickHandler, useId$11, useIsoLayoutEffect, useMergedRefs, useMergedRefsN, useOnFirstRender, useRefWithInit, useScrollLock, useStableCallback, useStore$1, useTimeout, useValueAsRef, visuallyHidden } from "./utils.js";
import { createSelector } from "../reselect.js";

var CompositeListContext = /*#__PURE__*/ import_react.createContext({
	register: () => {},
	unregister: () => {},
	subscribeMapChange: () => {
		return () => {};
	},
	elementsRef: { current: [] },
	nextIndexRef: { current: 0 }
});
function useCompositeListContext() {
	return import_react.useContext(CompositeListContext);
}
/**
* Provides context for a list of items in a composite component.
* @internal
*/
function CompositeList(props) {
	const { children, elementsRef, labelsRef, onMapChange: onMapChangeProp } = props;
	const onMapChange = useStableCallback(onMapChangeProp);
	const nextIndexRef = import_react.useRef(0);
	const listeners = useRefWithInit(createListeners).current;
	const map = useRefWithInit(createMap).current;
	const [mapTick, setMapTick] = import_react.useState(0);
	const lastTickRef = import_react.useRef(mapTick);
	const register = useStableCallback((node, metadata) => {
		map.set(node, metadata ?? null);
		lastTickRef.current += 1;
		setMapTick(lastTickRef.current);
	});
	const unregister = useStableCallback((node) => {
		map.delete(node);
		lastTickRef.current += 1;
		setMapTick(lastTickRef.current);
	});
	const sortedMap = import_react.useMemo(() => {
		const newMap = /* @__PURE__ */ new Map();
		Array.from(map.keys()).filter((node) => node.isConnected).sort(sortByDocumentPosition).forEach((node, index) => {
			const metadata = map.get(node) ?? {};
			newMap.set(node, {
				...metadata,
				index
			});
		});
		return newMap;
	}, [map, mapTick]);
	useIsoLayoutEffect(() => {
		if (typeof MutationObserver !== "function" || sortedMap.size === 0) return;
		const mutationObserver = new MutationObserver((entries) => {
			const diff = /* @__PURE__ */ new Set();
			const updateDiff = (node) => diff.has(node) ? diff.delete(node) : diff.add(node);
			entries.forEach((entry) => {
				entry.removedNodes.forEach(updateDiff);
				entry.addedNodes.forEach(updateDiff);
			});
			if (diff.size === 0) {
				lastTickRef.current += 1;
				setMapTick(lastTickRef.current);
			}
		});
		sortedMap.forEach((_, node) => {
			if (node.parentElement) mutationObserver.observe(node.parentElement, { childList: true });
		});
		return () => {
			mutationObserver.disconnect();
		};
	}, [sortedMap]);
	useIsoLayoutEffect(() => {
		if (lastTickRef.current === mapTick) {
			if (elementsRef.current.length !== sortedMap.size) elementsRef.current.length = sortedMap.size;
			if (labelsRef && labelsRef.current.length !== sortedMap.size) labelsRef.current.length = sortedMap.size;
			nextIndexRef.current = sortedMap.size;
		}
		onMapChange(sortedMap);
	}, [
		onMapChange,
		sortedMap,
		elementsRef,
		labelsRef,
		mapTick
	]);
	useIsoLayoutEffect(() => {
		return () => {
			elementsRef.current = [];
		};
	}, [elementsRef]);
	useIsoLayoutEffect(() => {
		return () => {
			if (labelsRef) labelsRef.current = [];
		};
	}, [labelsRef]);
	const subscribeMapChange = useStableCallback((fn) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	});
	useIsoLayoutEffect(() => {
		listeners.forEach((l) => l(sortedMap));
	}, [listeners, sortedMap]);
	const contextValue = import_react.useMemo(() => ({
		register,
		unregister,
		subscribeMapChange,
		elementsRef,
		labelsRef,
		nextIndexRef
	}), [
		register,
		unregister,
		subscribeMapChange,
		elementsRef,
		labelsRef,
		nextIndexRef
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeListContext.Provider, {
		value: contextValue,
		children
	});
}
function createMap() {
	return /* @__PURE__ */ new Map();
}
function createListeners() {
	return /* @__PURE__ */ new Set();
}
function sortByDocumentPosition(a, b) {
	const position = a.compareDocumentPosition(b);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) return -1;
	if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) return 1;
	return 0;
}
/**
* @internal
*/
var DirectionContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDirection() {
	return import_react.useContext(DirectionContext)?.direction ?? "ltr";
}
function getStateAttributesProps(state, customMapping) {
	const props = {};
	for (const key in state) {
		const value = state[key];
		if (customMapping?.hasOwnProperty(key)) {
			const customProps = customMapping[key](value);
			if (customProps != null) Object.assign(props, customProps);
			continue;
		}
		if (value === true) props[`data-${key.toLowerCase()}`] = "";
		else if (value) props[`data-${key.toLowerCase()}`] = value.toString();
	}
	return props;
}
/**
* If the provided className is a string, it will be returned as is.
* Otherwise, the function will call the className function with the state as the first argument.
*
* @param className
* @param state
*/
function resolveClassName(className, state) {
	return typeof className === "function" ? className(state) : className;
}
/**
* If the provided style is an object, it will be returned as is.
* Otherwise, the function will call the style function with the state as the first argument.
*
* @param style
* @param state
*/
function resolveStyle(style, state) {
	return typeof style === "function" ? style(state) : style;
}
var EMPTY_PROPS = {};
/**
* Merges multiple sets of React props. It follows the Object.assign pattern where the rightmost object's fields overwrite
* the conflicting ones from others. This doesn't apply to event handlers, `className` and `style` props.
* Event handlers are merged such that they are called in sequence (the rightmost one being called first),
* and allows the user to prevent the subsequent event handlers from being
* executed by attaching a `preventBaseUIHandler` method.
* It also merges the `className` and `style` props, whereby the classes are concatenated
* and the rightmost styles overwrite the subsequent ones.
*
* Props can either be provided as objects or as functions that take the previous props as an argument.
* The function will receive the merged props up to that point (going from left to right):
* so in the case of `(obj1, obj2, fn, obj3)`, `fn` will receive the merged props of `obj1` and `obj2`.
* The function is responsible for chaining event handlers if needed (i.e. we don't run the merge logic).
*
* Event handlers returned by the functions are not automatically prevented when `preventBaseUIHandler` is called.
* They must check `event.baseUIHandlerPrevented` themselves and bail out if it's true.
*
* @important **`ref` is not merged.**
* @param props props to merge.
* @returns the merged props.
*/
function mergeProps$1(a, b, c, d, e) {
	let merged = { ...resolvePropsGetter(a, EMPTY_PROPS) };
	if (b) merged = mergeOne(merged, b);
	if (c) merged = mergeOne(merged, c);
	if (d) merged = mergeOne(merged, d);
	if (e) merged = mergeOne(merged, e);
	return merged;
}
function mergePropsN(props) {
	if (props.length === 0) return EMPTY_PROPS;
	if (props.length === 1) return resolvePropsGetter(props[0], EMPTY_PROPS);
	let merged = { ...resolvePropsGetter(props[0], EMPTY_PROPS) };
	for (let i = 1; i < props.length; i += 1) merged = mergeOne(merged, props[i]);
	return merged;
}
function mergeOne(merged, inputProps) {
	if (isPropsGetter(inputProps)) return inputProps(merged);
	return mutablyMergeInto(merged, inputProps);
}
/**
* Merges two sets of props. In case of conflicts, the external props take precedence.
*/
function mutablyMergeInto(mergedProps, externalProps) {
	if (!externalProps) return mergedProps;
	for (const propName in externalProps) {
		const externalPropValue = externalProps[propName];
		switch (propName) {
			case "style":
				mergedProps[propName] = mergeObjects$1(mergedProps.style, externalPropValue);
				break;
			case "className":
				mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
				break;
			default: if (isEventHandler(propName, externalPropValue)) mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
			else mergedProps[propName] = externalPropValue;
		}
	}
	return mergedProps;
}
function isEventHandler(key, value) {
	const code0 = key.charCodeAt(0);
	const code1 = key.charCodeAt(1);
	const code2 = key.charCodeAt(2);
	return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
}
function isPropsGetter(inputProps) {
	return typeof inputProps === "function";
}
function resolvePropsGetter(inputProps, previousProps) {
	if (isPropsGetter(inputProps)) return inputProps(previousProps);
	return inputProps ?? EMPTY_PROPS;
}
function mergeEventHandlers(ourHandler, theirHandler) {
	if (!theirHandler) return ourHandler;
	if (!ourHandler) return theirHandler;
	return (event) => {
		if (isSyntheticEvent(event)) {
			const baseUIEvent = event;
			makeEventPreventable(baseUIEvent);
			const result = theirHandler(baseUIEvent);
			if (!baseUIEvent.baseUIHandlerPrevented) ourHandler?.(baseUIEvent);
			return result;
		}
		const result = theirHandler(event);
		ourHandler?.(event);
		return result;
	};
}
function makeEventPreventable(event) {
	event.preventBaseUIHandler = () => {
		event.baseUIHandlerPrevented = true;
	};
	return event;
}
function mergeClassNames(ourClassName, theirClassName) {
	if (theirClassName) {
		if (ourClassName) return theirClassName + " " + ourClassName;
		return theirClassName;
	}
	return ourClassName;
}
function isSyntheticEvent(event) {
	return event != null && typeof event === "object" && "nativeEvent" in event;
}
var DISABLED_TRANSITIONS_STYLE = { style: { transition: "none" } };
/**
* Used for dropdowns that usually strictly prefer top/bottom placements and
* use `var(--available-height)` to limit their height.
*/
var DROPDOWN_COLLISION_AVOIDANCE = { fallbackAxisSide: "none" };
/**
* Special visually hidden styles for the aria-owns owner element to ensure owned element
* accessibility in iOS/Safari/VoiceControl.
* The owner element is an empty span, so most of the common visually hidden styles are not needed.
* @see https://github.com/floating-ui/floating-ui/issues/3403
*/
var ownerVisuallyHidden = {
	clipPath: "inset(50%)",
	position: "fixed",
	top: 0,
	left: 0
};
/**
* Renders a Base UI element.
*
* @param element The default HTML element to render. Can be overridden by the `render` prop.
* @param componentProps An object containing the `render` and `className` props to be used for element customization. Other props are ignored.
* @param params Additional parameters for rendering the element.
*/
function useRenderElement(element, componentProps, params = {}) {
	const renderProp = componentProps.render;
	const outProps = useRenderElementProps(componentProps, params);
	if (params.enabled === false) return null;
	return evaluateRenderProp(element, renderProp, outProps, params.state ?? EMPTY_OBJECT);
}
/**
* Computes render element final props.
*/
function useRenderElementProps(componentProps, params = {}) {
	const { className: classNameProp, style: styleProp, render: renderProp } = componentProps;
	const { state = EMPTY_OBJECT, ref, props, stateAttributesMapping, enabled = true } = params;
	const className = enabled ? resolveClassName(classNameProp, state) : void 0;
	const style = enabled ? resolveStyle(styleProp, state) : void 0;
	const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping) : EMPTY_OBJECT;
	const outProps = enabled ? mergeObjects$1(stateProps, Array.isArray(props) ? mergePropsN(props) : props) ?? EMPTY_OBJECT : EMPTY_OBJECT;
	if (typeof document !== "undefined") {
		if (!enabled) useMergedRefs(null, null);
		else if (Array.isArray(ref)) outProps.ref = useMergedRefsN([
			outProps.ref,
			getReactElementRef(renderProp),
			...ref
		]);
		else outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
	}
	if (!enabled) return EMPTY_OBJECT;
	if (className !== void 0) outProps.className = mergeClassNames(outProps.className, className);
	if (style !== void 0) outProps.style = mergeObjects$1(outProps.style, style);
	return outProps;
}
function evaluateRenderProp(element, render, props, state) {
	if (render) {
		if (typeof render === "function") return render(props, state);
		const mergedProps = mergeProps$1(props, render.props);
		mergedProps.ref = props.ref;
		return /*#__PURE__*/ import_react.cloneElement(render, mergedProps);
	}
	if (element) {
		if (typeof element === "string") return renderTag(element, props);
	}
	throw new Error(formatErrorMessage(8));
}
function renderTag(Tag, props) {
	if (Tag === "button") return /*#__PURE__*/ (0, import_react.createElement)("button", {
		type: "button",
		...props,
		key: props.key
	});
	if (Tag === "img") return /*#__PURE__*/ (0, import_react.createElement)("img", {
		alt: "",
		...props,
		key: props.key
	});
	return /*#__PURE__*/ import_react.createElement(Tag, props);
}
var none$5 = "none";
var triggerPress = "trigger-press";
var outsidePress = "outside-press";
var itemPress = "item-press";
var inputChange = "input-change";
var inputClear = "input-clear";
var focusOut = "focus-out";
var escapeKey = "escape-key";
var listNavigation = "list-navigation";
/**
* Maps a change `reason` string to the corresponding native event type.
*/
/**
* Details of custom change events emitted by Base UI components.
*/
/**
* Details of custom generic events emitted by Base UI components.
*/
/**
* Creates a Base UI event details object with the given reason and utilities
* for preventing Base UI's internal event handling.
*/
function createChangeEventDetails(reason, event, trigger, customProperties) {
	let canceled = false;
	let allowPropagation = false;
	const custom = customProperties ?? EMPTY_OBJECT;
	return {
		reason,
		event: event ?? new Event("base-ui"),
		cancel() {
			canceled = true;
		},
		allowPropagation() {
			allowPropagation = true;
		},
		get isCanceled() {
			return canceled;
		},
		get isPropagationAllowed() {
			return allowPropagation;
		},
		trigger,
		...custom
	};
}
function createGenericEventDetails(reason, event, customProperties) {
	const custom = customProperties ?? EMPTY_OBJECT;
	return {
		reason,
		event: event ?? new Event("base-ui"),
		...custom
	};
}
/**
* Wraps `useId` and prefixes generated `id`s with `base-ui-`
* @param {string | undefined} idOverride overrides the generated id when provided
* @returns {string | undefined}
*/
function useBaseUiId(idOverride) {
	return useId$11(idOverride, "base-ui");
}
/**
* If the provided argument is a ref object, returns its `current` value.
* Otherwise, returns the argument itself.
*/
function resolveRef(maybeRef) {
	if (maybeRef == null) return maybeRef;
	return "current" in maybeRef ? maybeRef.current : maybeRef;
}
/**
* Executes a function once all animations have finished on the provided element.
* @param elementOrRef - The element to watch for animations.
* @param waitForNextTick - Whether to wait for the next tick before checking for animations.
* @param treatAbortedAsFinished - Whether to treat aborted animations as finished. If `false`, and there are aborted animations,
*   the function will check again if any new animations have started and wait for them to finish.
* @returns A function that takes a callback to execute once all animations have finished, and an optional AbortSignal to abort the callback
*/
function useAnimationsFinished(elementOrRef, waitForNextTick = false, treatAbortedAsFinished = true) {
	const frame = useAnimationFrame();
	return useStableCallback((fnToExecute, signal = null) => {
		frame.cancel();
		const element = resolveRef(elementOrRef);
		if (element == null) return;
		if (typeof element.getAnimations !== "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) fnToExecute();
		else frame.request(() => {
			function exec() {
				if (!element) return;
				Promise.all(element.getAnimations().map((anim) => anim.finished)).then(() => {
					if (signal != null && signal.aborted) return;
					import_react_dom.flushSync(fnToExecute);
				}).catch(() => {
					if (treatAbortedAsFinished) {
						if (signal != null && signal.aborted) return;
						import_react_dom.flushSync(fnToExecute);
					} else if (element.getAnimations().length > 0 && element.getAnimations().some((anim) => anim.pending || anim.playState !== "finished")) exec();
				});
			}
			if (waitForNextTick) frame.request(exec);
			else exec();
		});
	});
}
/**
* Provides a status string for CSS animations.
* @param open - a boolean that determines if the element is open.
* @param enableIdleState - a boolean that enables the `'idle'` state between `'starting'` and `'ending'`
*/
function useTransitionStatus(open, enableIdleState = false, deferEndingState = false) {
	const [transitionStatus, setTransitionStatus] = import_react.useState(open && enableIdleState ? "idle" : void 0);
	const [mounted, setMounted] = import_react.useState(open);
	if (open && !mounted) {
		setMounted(true);
		setTransitionStatus("starting");
	}
	if (!open && mounted && transitionStatus !== "ending" && !deferEndingState) setTransitionStatus("ending");
	if (!open && !mounted && transitionStatus === "ending") setTransitionStatus(void 0);
	useIsoLayoutEffect(() => {
		if (!open && mounted && transitionStatus !== "ending" && deferEndingState) {
			const frame = AnimationFrame.request(() => {
				setTransitionStatus("ending");
			});
			return () => {
				AnimationFrame.cancel(frame);
			};
		}
	}, [
		open,
		mounted,
		transitionStatus,
		deferEndingState
	]);
	useIsoLayoutEffect(() => {
		if (!open || enableIdleState) return;
		const frame = AnimationFrame.request(() => {
			import_react_dom.flushSync(() => {
				setTransitionStatus(void 0);
			});
		});
		return () => {
			AnimationFrame.cancel(frame);
		};
	}, [enableIdleState, open]);
	useIsoLayoutEffect(() => {
		if (!open || !enableIdleState) return;
		if (open && mounted && transitionStatus !== "idle") setTransitionStatus("starting");
		const frame = AnimationFrame.request(() => {
			setTransitionStatus("idle");
		});
		return () => {
			AnimationFrame.cancel(frame);
		};
	}, [
		enableIdleState,
		open,
		mounted,
		setTransitionStatus,
		transitionStatus
	]);
	return import_react.useMemo(() => ({
		mounted,
		setMounted,
		transitionStatus
	}), [mounted, transitionStatus]);
}
var IndexGuessBehavior = /*#__PURE__*/ function(IndexGuessBehavior) {
	IndexGuessBehavior[IndexGuessBehavior["None"] = 0] = "None";
	IndexGuessBehavior[IndexGuessBehavior["GuessFromOrder"] = 1] = "GuessFromOrder";
	return IndexGuessBehavior;
}({});
/**
* Used to register a list item and its index (DOM position) in the `CompositeList`.
*/
function useCompositeListItem(params = {}) {
	const { label, metadata, textRef, indexGuessBehavior, index: externalIndex } = params;
	const { register, unregister, subscribeMapChange, elementsRef, labelsRef, nextIndexRef } = useCompositeListContext();
	const indexRef = import_react.useRef(-1);
	const [index, setIndex] = import_react.useState(externalIndex ?? (indexGuessBehavior === IndexGuessBehavior.GuessFromOrder ? () => {
		if (indexRef.current === -1) {
			const newIndex = nextIndexRef.current;
			nextIndexRef.current += 1;
			indexRef.current = newIndex;
		}
		return indexRef.current;
	} : -1));
	const componentRef = import_react.useRef(null);
	const ref = import_react.useCallback((node) => {
		componentRef.current = node;
		if (index !== -1 && node !== null) {
			elementsRef.current[index] = node;
			if (labelsRef) {
				const isLabelDefined = label !== void 0;
				labelsRef.current[index] = isLabelDefined ? label : textRef?.current?.textContent ?? node.textContent;
			}
		}
	}, [
		index,
		elementsRef,
		labelsRef,
		label,
		textRef
	]);
	useIsoLayoutEffect(() => {
		if (externalIndex != null) return;
		const node = componentRef.current;
		if (node) {
			register(node, metadata);
			return () => {
				unregister(node);
			};
		}
	}, [
		externalIndex,
		register,
		unregister,
		metadata
	]);
	useIsoLayoutEffect(() => {
		if (externalIndex != null) return;
		return subscribeMapChange((map) => {
			const i = componentRef.current ? map.get(componentRef.current)?.index : null;
			if (i != null) setIndex(i);
		});
	}, [
		externalIndex,
		subscribeMapChange,
		setIndex
	]);
	return import_react.useMemo(() => ({
		ref,
		index
	}), [index, ref]);
}
var TransitionStatusDataAttributes = /*#__PURE__*/ function(TransitionStatusDataAttributes) {
	/**
	* Present when the component is animating in.
	*/
	TransitionStatusDataAttributes["startingStyle"] = "data-starting-style";
	/**
	* Present when the component is animating out.
	*/
	TransitionStatusDataAttributes["endingStyle"] = "data-ending-style";
	return TransitionStatusDataAttributes;
}({});
var STARTING_HOOK = { [TransitionStatusDataAttributes.startingStyle]: "" };
var ENDING_HOOK = { [TransitionStatusDataAttributes.endingStyle]: "" };
var transitionStatusMapping = { transitionStatus(value) {
	if (value === "starting") return STARTING_HOOK;
	if (value === "ending") return ENDING_HOOK;
	return null;
} };
var CompositeRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useCompositeRootContext(optional = false) {
	const context = import_react.useContext(CompositeRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(16));
	return context;
}
function useFocusableWhenDisabled(parameters) {
	const { focusableWhenDisabled, disabled, composite = false, tabIndex: tabIndexProp = 0, isNativeButton } = parameters;
	const isFocusableComposite = composite && focusableWhenDisabled !== false;
	const isNonFocusableComposite = composite && focusableWhenDisabled === false;
	return { props: import_react.useMemo(() => {
		const additionalProps = { onKeyDown(event) {
			if (disabled && focusableWhenDisabled && event.key !== "Tab") event.preventDefault();
		} };
		if (!composite) {
			additionalProps.tabIndex = tabIndexProp;
			if (!isNativeButton && disabled) additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
		}
		if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled) additionalProps["aria-disabled"] = disabled;
		if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) additionalProps.disabled = disabled;
		return additionalProps;
	}, [
		composite,
		disabled,
		focusableWhenDisabled,
		isFocusableComposite,
		isNonFocusableComposite,
		isNativeButton,
		tabIndexProp
	]) };
}
function useButton(parameters = {}) {
	const { disabled = false, focusableWhenDisabled, tabIndex = 0, native: isNativeButton = true } = parameters;
	const elementRef = import_react.useRef(null);
	const isCompositeItem = useCompositeRootContext(true) !== void 0;
	const isValidLink = useStableCallback(() => {
		const element = elementRef.current;
		return Boolean(element?.tagName === "A" && element?.href);
	});
	const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
		focusableWhenDisabled,
		disabled,
		composite: isCompositeItem,
		tabIndex,
		isNativeButton
	});
	const updateDisabled = import_react.useCallback(() => {
		const element = elementRef.current;
		if (!isButtonElement(element)) return;
		if (isCompositeItem && disabled && focusableWhenDisabledProps.disabled === void 0 && element.disabled) element.disabled = false;
	}, [
		disabled,
		focusableWhenDisabledProps.disabled,
		isCompositeItem
	]);
	useIsoLayoutEffect(updateDisabled, [updateDisabled]);
	return {
		getButtonProps: import_react.useCallback((externalProps = {}) => {
			const { onClick: externalOnClick, onMouseDown: externalOnMouseDown, onKeyUp: externalOnKeyUp, onKeyDown: externalOnKeyDown, onPointerDown: externalOnPointerDown, ...otherExternalProps } = externalProps;
			return mergeProps$1({
				type: isNativeButton ? "button" : void 0,
				onClick(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnClick?.(event);
				},
				onMouseDown(event) {
					if (!disabled) externalOnMouseDown?.(event);
				},
				onKeyDown(event) {
					if (!disabled) {
						makeEventPreventable(event);
						externalOnKeyDown?.(event);
					}
					if (event.baseUIHandlerPrevented) return;
					const shouldClick = event.target === event.currentTarget && !isNativeButton && !isValidLink() && !disabled;
					const isEnterKey = event.key === "Enter";
					const isSpaceKey = event.key === " ";
					if (shouldClick) {
						if (isSpaceKey || isEnterKey) event.preventDefault();
						if (isEnterKey) externalOnClick?.(event);
					}
				},
				onKeyUp(event) {
					if (!disabled) {
						makeEventPreventable(event);
						externalOnKeyUp?.(event);
					}
					if (event.baseUIHandlerPrevented) return;
					if (event.target === event.currentTarget && !isNativeButton && !disabled && event.key === " ") externalOnClick?.(event);
				},
				onPointerDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnPointerDown?.(event);
				}
			}, !isNativeButton ? { role: "button" } : void 0, focusableWhenDisabledProps, otherExternalProps);
		}, [
			disabled,
			focusableWhenDisabledProps,
			isNativeButton,
			isValidLink
		]),
		buttonRef: useStableCallback((element) => {
			elementRef.current = element;
			updateDisabled();
		})
	};
}
function isButtonElement(elem) {
	return isHTMLElement$1(elem) && elem.tagName === "BUTTON";
}
var FOCUSABLE_ATTRIBUTE = "data-base-ui-focusable";
var ARROW_LEFT = "ArrowLeft";
var ARROW_RIGHT = "ArrowRight";
var ARROW_UP = "ArrowUp";
var ARROW_DOWN = "ArrowDown";
function activeElement(doc) {
	let element = doc.activeElement;
	while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
	return element;
}
function contains$2(parent, child) {
	if (!parent || !child) return false;
	const rootNode = child.getRootNode?.();
	if (parent.contains(child)) return true;
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) return true;
			next = next.parentNode || next.host;
		}
	}
	return false;
}
function getTarget(event) {
	if ("composedPath" in event) return event.composedPath()[0];
	return event.target;
}
function isEventTargetWithin(event, node) {
	if (node == null) return false;
	if ("composedPath" in event) return event.composedPath().includes(node);
	const eventAgain = event;
	return eventAgain.target != null && node.contains(eventAgain.target);
}
function isRootElement(element) {
	return element.matches("html,body");
}
function getDocument(node) {
	return node?.ownerDocument || document;
}
function isTypeableElement(element) {
	return isHTMLElement$1(element) && element.matches("input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])");
}
function isTypeableCombobox(element) {
	if (!element) return false;
	return element.getAttribute("role") === "combobox" && isTypeableElement(element);
}
function getFloatingFocusElement(floatingElement) {
	if (!floatingElement) return null;
	return floatingElement.hasAttribute("data-base-ui-focusable") ? floatingElement : floatingElement.querySelector(`[data-base-ui-focusable]`) || floatingElement;
}
function getNodeChildren(nodes, id, onlyOpenChildren = true) {
	return nodes.filter((node) => node.parentId === id && (!onlyOpenChildren || node.context?.open)).flatMap((child) => [child, ...getNodeChildren(nodes, child.id, onlyOpenChildren)]);
}
function getNodeAncestors(nodes, id) {
	let allAncestors = [];
	let currentParentId = nodes.find((node) => node.id === id)?.parentId;
	while (currentParentId) {
		const currentNode = nodes.find((node) => node.id === currentParentId);
		currentParentId = currentNode?.parentId;
		if (currentNode) allAncestors = allAncestors.concat(currentNode);
	}
	return allAncestors;
}
function stopEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}
function isReactEvent(event) {
	return "nativeEvent" in event;
}
function isVirtualClick(event) {
	if (event.mozInputSource === 0 && event.isTrusted) return true;
	if (isAndroid$1 && event.pointerType) return event.type === "click" && event.buttons === 1;
	return event.detail === 0 && !event.pointerType;
}
function isVirtualPointerEvent(event) {
	if (isJSDOM) return false;
	return !isAndroid$1 && event.width === 0 && event.height === 0 || isAndroid$1 && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "mouse" || event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "touch";
}
function isMouseLikePointerType(pointerType, strict) {
	const values = ["mouse", "pen"];
	if (!strict) values.push("", void 0);
	return values.includes(pointerType);
}
function isClickLikeEvent(event) {
	const type = event.type;
	return type === "click" || type === "mousedown" || type === "keydown" || type === "keyup";
}
function isDifferentGridRow(index, cols, prevRow) {
	return Math.floor(index / cols) !== prevRow;
}
function isIndexOutOfListBounds(listRef, index) {
	return index < 0 || index >= listRef.current.length;
}
function getMinListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef, { disabledIndices });
}
function getMaxListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef, {
		decrement: true,
		startingIndex: listRef.current.length,
		disabledIndices
	});
}
function findNonDisabledListIndex(listRef, { startingIndex = -1, decrement = false, disabledIndices, amount = 1 } = {}) {
	let index = startingIndex;
	do
		index += decrement ? -amount : amount;
	while (index >= 0 && index <= listRef.current.length - 1 && isListIndexDisabled(listRef, index, disabledIndices));
	return index;
}
function getGridNavigatedIndex(listRef, { event, orientation, loopFocus, rtl, cols, disabledIndices, minIndex, maxIndex, prevIndex, stopEvent: stop = false }) {
	let nextIndex = prevIndex;
	const rows = [];
	const rowIndexMap = {};
	let hasRoleRow = false;
	{
		let currentRowEl = null;
		let currentRowIndex = -1;
		listRef.current.forEach((el, idx) => {
			if (el == null) return;
			const rowEl = el.closest("[role=\"row\"]");
			if (rowEl) hasRoleRow = true;
			if (rowEl !== currentRowEl || currentRowIndex === -1) {
				currentRowEl = rowEl;
				currentRowIndex += 1;
				rows[currentRowIndex] = [];
			}
			rows[currentRowIndex].push(idx);
			rowIndexMap[idx] = currentRowIndex;
		});
	}
	const hasDomRows = hasRoleRow && rows.length > 0 && rows.some((row) => row.length !== cols);
	function navigateVertically(direction) {
		if (!hasDomRows || prevIndex === -1) return;
		const currentRow = rowIndexMap[prevIndex];
		if (currentRow == null) return;
		const colInRow = rows[currentRow].indexOf(prevIndex);
		let nextRow = direction === "up" ? currentRow - 1 : currentRow + 1;
		if (loopFocus) {
			if (nextRow < 0) nextRow = rows.length - 1;
			else if (nextRow >= rows.length) nextRow = 0;
		}
		const visited = /* @__PURE__ */ new Set();
		while (nextRow >= 0 && nextRow < rows.length && !visited.has(nextRow)) {
			visited.add(nextRow);
			const targetRow = rows[nextRow];
			if (targetRow.length === 0) {
				nextRow = direction === "up" ? nextRow - 1 : nextRow + 1;
				continue;
			}
			const clampedCol = Math.min(colInRow, targetRow.length - 1);
			for (let col = clampedCol; col >= 0; col -= 1) {
				const candidate = targetRow[col];
				if (!isListIndexDisabled(listRef, candidate, disabledIndices)) return candidate;
			}
			nextRow = direction === "up" ? nextRow - 1 : nextRow + 1;
			if (loopFocus) {
				if (nextRow < 0) nextRow = rows.length - 1;
				else if (nextRow >= rows.length) nextRow = 0;
			}
		}
	}
	if (event.key === "ArrowUp") {
		const domBasedCandidate = navigateVertically("up");
		if (domBasedCandidate !== void 0) {
			if (stop) stopEvent(event);
			nextIndex = domBasedCandidate;
		} else {
			if (stop) stopEvent(event);
			if (prevIndex === -1) nextIndex = maxIndex;
			else {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: nextIndex,
					amount: cols,
					decrement: true,
					disabledIndices
				});
				if (loopFocus && (prevIndex - cols < minIndex || nextIndex < 0)) {
					const col = prevIndex % cols;
					const maxCol = maxIndex % cols;
					const offset = maxIndex - (maxCol - col);
					if (maxCol === col) nextIndex = maxIndex;
					else nextIndex = maxCol > col ? offset : offset - cols;
				}
			}
			if (isIndexOutOfListBounds(listRef, nextIndex)) nextIndex = prevIndex;
		}
	}
	if (event.key === "ArrowDown") {
		const domBasedCandidate = navigateVertically("down");
		if (domBasedCandidate !== void 0) {
			if (stop) stopEvent(event);
			nextIndex = domBasedCandidate;
		} else {
			if (stop) stopEvent(event);
			if (prevIndex === -1) nextIndex = minIndex;
			else {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex,
					amount: cols,
					disabledIndices
				});
				if (loopFocus && prevIndex + cols > maxIndex) nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex % cols - cols,
					amount: cols,
					disabledIndices
				});
			}
			if (isIndexOutOfListBounds(listRef, nextIndex)) nextIndex = prevIndex;
		}
	}
	if (orientation === "both") {
		const prevRow = floor(prevIndex / cols);
		if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
			if (stop) stopEvent(event);
			if (prevIndex % cols !== cols - 1) {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex,
					disabledIndices
				});
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex - prevIndex % cols - 1,
					disabledIndices
				});
			} else if (loopFocus) nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex - prevIndex % cols - 1,
				disabledIndices
			});
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
			if (stop) stopEvent(event);
			if (prevIndex % cols !== 0) {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex,
					decrement: true,
					disabledIndices
				});
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex + (cols - prevIndex % cols),
					decrement: true,
					disabledIndices
				});
			} else if (loopFocus) nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex + (cols - prevIndex % cols),
				decrement: true,
				disabledIndices
			});
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		const lastRow = floor(maxIndex / cols) === prevRow;
		if (isIndexOutOfListBounds(listRef, nextIndex)) {
			if (loopFocus && lastRow) nextIndex = event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? maxIndex : findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex - prevIndex % cols - 1,
				disabledIndices
			});
			else nextIndex = prevIndex;
		}
	}
	return nextIndex;
}
/** For each cell index, gets the item index that occupies that cell */
function createGridCellMap(sizes, cols, dense) {
	const cellMap = [];
	let startIndex = 0;
	sizes.forEach(({ width, height }, index) => {
		if (width > cols) {}
		let itemPlaced = false;
		if (dense) startIndex = 0;
		while (!itemPlaced) {
			const targetCells = [];
			for (let i = 0; i < width; i += 1) for (let j = 0; j < height; j += 1) targetCells.push(startIndex + i + j * cols);
			if (startIndex % cols + width <= cols && targetCells.every((cell) => cellMap[cell] == null)) {
				targetCells.forEach((cell) => {
					cellMap[cell] = index;
				});
				itemPlaced = true;
			} else startIndex += 1;
		}
	});
	return [...cellMap];
}
/** Gets cell index of an item's corner or -1 when index is -1. */
function getGridCellIndexOfCorner(index, sizes, cellMap, cols, corner) {
	if (index === -1) return -1;
	const firstCellIndex = cellMap.indexOf(index);
	const sizeItem = sizes[index];
	switch (corner) {
		case "tl": return firstCellIndex;
		case "tr":
			if (!sizeItem) return firstCellIndex;
			return firstCellIndex + sizeItem.width - 1;
		case "bl":
			if (!sizeItem) return firstCellIndex;
			return firstCellIndex + (sizeItem.height - 1) * cols;
		case "br": return cellMap.lastIndexOf(index);
		default: return -1;
	}
}
/** Gets all cell indices that correspond to the specified indices */
function getGridCellIndices(indices, cellMap) {
	return cellMap.flatMap((index, cellIndex) => indices.includes(index) ? [cellIndex] : []);
}
function isListIndexDisabled(listRef, index, disabledIndices) {
	if (typeof disabledIndices === "function") return disabledIndices(index);
	if (disabledIndices) return disabledIndices.includes(index);
	const element = listRef.current[index];
	if (!element) return false;
	return element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}
/*!
* tabbable 6.4.0
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var candidateSelector = /* #__PURE__ */ [
	"input:not([inert]):not([inert] *)",
	"select:not([inert]):not([inert] *)",
	"textarea:not([inert]):not([inert] *)",
	"a[href]:not([inert]):not([inert] *)",
	"button:not([inert]):not([inert] *)",
	"[tabindex]:not(slot):not([inert]):not([inert] *)",
	"audio[controls]:not([inert]):not([inert] *)",
	"video[controls]:not([inert]):not([inert] *)",
	"[contenteditable]:not([contenteditable=\"false\"]):not([inert]):not([inert] *)",
	"details>summary:first-of-type:not([inert]):not([inert] *)",
	"details:not([inert]):not([inert] *)"
].join(",");
var NoElement = typeof Element === "undefined";
var matches$1 = NoElement ? function() {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
	var _element$getRootNode;
	return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function(element) {
	return element === null || element === void 0 ? void 0 : element.ownerDocument;
};
/**
* Determines if a node is inert or in an inert ancestor.
* @param {Node} [node]
* @param {boolean} [lookUp] If true and `node` is not inert, looks up at ancestors to
*  see if any of them are inert. If false, only `node` itself is considered.
* @returns {boolean} True if inert itself or by way of being in an inert ancestor.
*  False if `node` is falsy.
*/
var _isInert = function isInert(node, lookUp) {
	var _node$getAttribute;
	if (lookUp === void 0) lookUp = true;
	var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
	return inertAtt === "" || inertAtt === "true" || lookUp && node && (typeof node.closest === "function" ? node.closest("[inert]") : _isInert(node.parentNode));
};
/**
* Determines if a node's content is editable.
* @param {Element} [node]
* @returns True if it's content-editable; false if it's not or `node` is falsy.
*/
var isContentEditable = function isContentEditable(node) {
	var _node$getAttribute2;
	var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
	return attValue === "" || attValue === "true";
};
/**
* @param {Element} el container to check in
* @param {boolean} includeContainer add container to check
* @param {(node: Element) => boolean} filter filter candidates
* @returns {Element[]}
*/
var getCandidates = function getCandidates(el, includeContainer, filter) {
	if (_isInert(el)) return [];
	var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
	if (includeContainer && matches$1.call(el, candidateSelector)) candidates.unshift(el);
	candidates = candidates.filter(filter);
	return candidates;
};
/**
* @callback GetShadowRoot
* @param {Element} element to check for shadow root
* @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
*/
/**
* @callback ShadowRootFilter
* @param {Element} shadowHostNode the element which contains shadow content
* @returns {boolean} true if a shadow root could potentially contain valid candidates.
*/
/**
* @typedef {Object} CandidateScope
* @property {Element} scopeParent contains inner candidates
* @property {Element[]} candidates list of candidates found in the scope parent
*/
/**
* @typedef {Object} IterativeOptions
* @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
*  if a function, implies shadow support is enabled and either returns the shadow root of an element
*  or a boolean stating if it has an undisclosed shadow root
* @property {(node: Element) => boolean} filter filter candidates
* @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
* @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
*/
/**
* @param {Element[]} elements list of element containers to match candidates from
* @param {boolean} includeContainer add container list to check
* @param {IterativeOptions} options
* @returns {Array.<Element|CandidateScope>}
*/
var _getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
	var candidates = [];
	var elementsToCheck = Array.from(elements);
	while (elementsToCheck.length) {
		var element = elementsToCheck.shift();
		if (_isInert(element, false)) continue;
		if (element.tagName === "SLOT") {
			var assigned = element.assignedElements();
			var nestedCandidates = _getCandidatesIteratively(assigned.length ? assigned : element.children, true, options);
			if (options.flatten) candidates.push.apply(candidates, nestedCandidates);
			else candidates.push({
				scopeParent: element,
				candidates: nestedCandidates
			});
		} else {
			if (matches$1.call(element, candidateSelector) && options.filter(element) && (includeContainer || !elements.includes(element))) candidates.push(element);
			var shadowRoot = element.shadowRoot || typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
			var validShadowRoot = !_isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
			if (shadowRoot && validShadowRoot) {
				var _nestedCandidates = _getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
				if (options.flatten) candidates.push.apply(candidates, _nestedCandidates);
				else candidates.push({
					scopeParent: element,
					candidates: _nestedCandidates
				});
			} else elementsToCheck.unshift.apply(elementsToCheck, element.children);
		}
	}
	return candidates;
};
/**
* @private
* Determines if the node has an explicitly specified `tabindex` attribute.
* @param {HTMLElement} node
* @returns {boolean} True if so; false if not.
*/
var hasTabIndex = function hasTabIndex(node) {
	return !isNaN(parseInt(node.getAttribute("tabindex"), 10));
};
/**
* Determine the tab index of a given node.
* @param {HTMLElement} node
* @returns {number} Tab order (negative, 0, or positive number).
* @throws {Error} If `node` is falsy.
*/
var getTabIndex = function getTabIndex(node) {
	if (!node) throw new Error("No node provided");
	if (node.tabIndex < 0) {
		if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) return 0;
	}
	return node.tabIndex;
};
/**
* Determine the tab index of a given node __for sort order purposes__.
* @param {HTMLElement} node
* @param {boolean} [isScope] True for a custom element with shadow root or slot that, by default,
*  has tabIndex -1, but needs to be sorted by document order in order for its content to be
*  inserted into the correct sort position.
* @returns {number} Tab order (negative, 0, or positive number).
*/
var getSortOrderTabIndex = function getSortOrderTabIndex(node, isScope) {
	var tabIndex = getTabIndex(node);
	if (tabIndex < 0 && isScope && !hasTabIndex(node)) return 0;
	return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
	return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput(node) {
	return node.tagName === "INPUT";
};
var isHiddenInput = function isHiddenInput(node) {
	return isInput(node) && node.type === "hidden";
};
var isDetailsWithSummary = function isDetailsWithSummary(node) {
	return node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
		return child.tagName === "SUMMARY";
	});
};
var getCheckedRadio = function getCheckedRadio(nodes, form) {
	for (var i = 0; i < nodes.length; i++) if (nodes[i].checked && nodes[i].form === form) return nodes[i];
};
var isTabbableRadio = function isTabbableRadio(node) {
	if (!node.name) return true;
	var radioScope = node.form || getRootNode(node);
	var queryRadios = function queryRadios(name) {
		return radioScope.querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]");
	};
	var radioSet;
	if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") radioSet = queryRadios(window.CSS.escape(node.name));
	else try {
		radioSet = queryRadios(node.name);
	} catch (err) {
		console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
		return false;
	}
	var checked = getCheckedRadio(radioSet, node.form);
	return !checked || checked === node;
};
var isRadio = function isRadio(node) {
	return isInput(node) && node.type === "radio";
};
var isNonTabbableRadio = function isNonTabbableRadio(node) {
	return isRadio(node) && !isTabbableRadio(node);
};
var isNodeAttached = function isNodeAttached(node) {
	var _nodeRoot;
	var nodeRoot = node && getRootNode(node);
	var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
	var attached = false;
	if (nodeRoot && nodeRoot !== node) {
		var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
		attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
		while (!attached && nodeRootHost) {
			var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
			nodeRoot = getRootNode(nodeRootHost);
			nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
			attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
		}
	}
	return attached;
};
var isZeroArea = function isZeroArea(node) {
	var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
	return width === 0 && height === 0;
};
var isHidden = function isHidden(node, _ref) {
	var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
	if (displayCheck === "full-native") {
		if ("checkVisibility" in node) return !node.checkVisibility({
			checkOpacity: false,
			opacityProperty: false,
			contentVisibilityAuto: true,
			visibilityProperty: true,
			checkVisibilityCSS: true
		});
	}
	if (getComputedStyle(node).visibility === "hidden") return true;
	var nodeUnderDetails = matches$1.call(node, "details>summary:first-of-type") ? node.parentElement : node;
	if (matches$1.call(nodeUnderDetails, "details:not([open]) *")) return true;
	if (!displayCheck || displayCheck === "full" || displayCheck === "full-native" || displayCheck === "legacy-full") {
		if (typeof getShadowRoot === "function") {
			var originalNode = node;
			while (node) {
				var parentElement = node.parentElement;
				var rootNode = getRootNode(node);
				if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) return isZeroArea(node);
				else if (node.assignedSlot) node = node.assignedSlot;
				else if (!parentElement && rootNode !== node.ownerDocument) node = rootNode.host;
				else node = parentElement;
			}
			node = originalNode;
		}
		if (isNodeAttached(node)) return !node.getClientRects().length;
		if (displayCheck !== "legacy-full") return true;
	} else if (displayCheck === "non-zero-area") return isZeroArea(node);
	return false;
};
var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
	if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
		var parentNode = node.parentElement;
		while (parentNode) {
			if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
				for (var i = 0; i < parentNode.children.length; i++) {
					var child = parentNode.children.item(i);
					if (child.tagName === "LEGEND") return matches$1.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
				}
				return true;
			}
			parentNode = parentNode.parentElement;
		}
	}
	return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
	if (node.disabled || isHiddenInput(node) || isHidden(node, options) || isDetailsWithSummary(node) || isDisabledFromFieldset(node)) return false;
	return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
	if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) return false;
	return true;
};
var isShadowRootTabbable = function isShadowRootTabbable(shadowHostNode) {
	var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
	if (isNaN(tabIndex) || tabIndex >= 0) return true;
	return false;
};
/**
* @param {Array.<Element|CandidateScope>} candidates
* @returns Element[]
*/
var _sortByOrder = function sortByOrder(candidates) {
	var regularTabbables = [];
	var orderedTabbables = [];
	candidates.forEach(function(item, i) {
		var isScope = !!item.scopeParent;
		var element = isScope ? item.scopeParent : item;
		var candidateTabindex = getSortOrderTabIndex(element, isScope);
		var elements = isScope ? _sortByOrder(item.candidates) : element;
		if (candidateTabindex === 0) isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
		else orderedTabbables.push({
			documentOrder: i,
			tabIndex: candidateTabindex,
			item,
			isScope,
			content: elements
		});
	});
	return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
		sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
		return acc;
	}, []).concat(regularTabbables);
};
var tabbable = function tabbable(container, options) {
	options = options || {};
	var candidates;
	if (options.getShadowRoot) candidates = _getCandidatesIteratively([container], options.includeContainer, {
		filter: isNodeMatchingSelectorTabbable.bind(null, options),
		flatten: false,
		getShadowRoot: options.getShadowRoot,
		shadowRootFilter: isShadowRootTabbable
	});
	else candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
	return _sortByOrder(candidates);
};
var focusable = function focusable(container, options) {
	options = options || {};
	var candidates;
	if (options.getShadowRoot) candidates = _getCandidatesIteratively([container], options.includeContainer, {
		filter: isNodeMatchingSelectorFocusable.bind(null, options),
		flatten: true,
		getShadowRoot: options.getShadowRoot
	});
	else candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
	return candidates;
};
var isTabbable = function isTabbable(node, options) {
	options = options || {};
	if (!node) throw new Error("No node provided");
	if (matches$1.call(node, candidateSelector) === false) return false;
	return isNodeMatchingSelectorTabbable(options, node);
};
var getTabbableOptions = () => ({
	getShadowRoot: true,
	displayCheck: typeof ResizeObserver === "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
});
function getTabbableIn(container, dir) {
	const list = tabbable(container, getTabbableOptions());
	const len = list.length;
	if (len === 0) return;
	const active = activeElement(getDocument(container));
	const index = list.indexOf(active);
	return list[index === -1 ? dir === 1 ? 0 : len - 1 : index + dir];
}
function getNextTabbable(referenceElement) {
	return getTabbableIn(getDocument(referenceElement).body, 1) || referenceElement;
}
function getPreviousTabbable(referenceElement) {
	return getTabbableIn(getDocument(referenceElement).body, -1) || referenceElement;
}
function isOutsideEvent(event, container) {
	const containerElement = container || event.currentTarget;
	const relatedTarget = event.relatedTarget;
	return !relatedTarget || !contains$2(containerElement, relatedTarget);
}
function disableFocusInside(container) {
	tabbable(container, getTabbableOptions()).forEach((element) => {
		element.dataset.tabindex = element.getAttribute("tabindex") || "";
		element.setAttribute("tabindex", "-1");
	});
}
function enableFocusInside(container) {
	container.querySelectorAll("[data-tabindex]").forEach((element) => {
		const tabindex = element.dataset.tabindex;
		delete element.dataset.tabindex;
		if (tabindex) element.setAttribute("tabindex", tabindex);
		else element.removeAttribute("tabindex");
	});
}
/**
* Calls the provided function when the CSS open/close animation or transition completes.
*/
function useOpenChangeComplete(parameters) {
	const { enabled = true, open, ref, onComplete: onCompleteParam } = parameters;
	const openRef = useValueAsRef(open);
	const onComplete = useStableCallback(onCompleteParam);
	const runOnceAnimationsFinish = useAnimationsFinished(ref, open);
	import_react.useEffect(() => {
		if (!enabled) return;
		runOnceAnimationsFinish(() => {
			if (open === openRef.current) onComplete();
		});
	}, [
		enabled,
		open,
		onComplete,
		runOnceAnimationsFinish,
		openRef
	]);
}
function createEventEmitter() {
	const map = /* @__PURE__ */ new Map();
	return {
		emit(event, data) {
			map.get(event)?.forEach((listener) => listener(data));
		},
		on(event, listener) {
			if (!map.has(event)) map.set(event, /* @__PURE__ */ new Set());
			map.get(event).add(listener);
		},
		off(event, listener) {
			map.get(event)?.delete(listener);
		}
	};
}
var FloatingNodeContext = /*#__PURE__*/ import_react.createContext(null);
var FloatingTreeContext = /*#__PURE__*/ import_react.createContext(null);
var useFloatingParentNodeId = () => import_react.useContext(FloatingNodeContext)?.id || null;
/**
* Returns the nearest floating tree context, if available.
*/
var useFloatingTree = (externalTree) => {
	const contextTree = import_react.useContext(FloatingTreeContext);
	return externalTree ?? contextTree;
};
function createAttribute(name) {
	return `data-base-ui-${name}`;
}
/**
* @internal
*/
var FocusGuard = /*#__PURE__*/ import_react.forwardRef(function FocusGuard(props, ref) {
	const [role, setRole] = import_react.useState();
	useIsoLayoutEffect(() => {
		if (isSafari$1) setRole("button");
	}, []);
	const restProps = {
		tabIndex: 0,
		role
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
		...props,
		ref,
		style: visuallyHidden,
		"aria-hidden": role ? void 0 : true,
		...restProps,
		"data-base-ui-focus-guard": ""
	});
});
var rafId = 0;
function enqueueFocus(el, options = {}) {
	const { preventScroll = false, cancelPrevious = true, sync = false } = options;
	if (cancelPrevious) cancelAnimationFrame(rafId);
	const exec = () => el?.focus({ preventScroll });
	if (sync) exec();
	else rafId = requestAnimationFrame(exec);
}
var counters = {
	inert: /* @__PURE__ */ new WeakMap(),
	"aria-hidden": /* @__PURE__ */ new WeakMap(),
	none: /* @__PURE__ */ new WeakMap()
};
function getCounterMap(control) {
	if (control === "inert") return counters.inert;
	if (control === "aria-hidden") return counters["aria-hidden"];
	return counters.none;
}
var uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
var markerMap = {};
var lockCount = 0;
var unwrapHost = (node) => node && (node.host || unwrapHost(node.parentNode));
var correctElements = (parent, targets) => targets.map((target) => {
	if (parent.contains(target)) return target;
	const correctedTarget = unwrapHost(target);
	if (parent.contains(correctedTarget)) return correctedTarget;
	return null;
}).filter((x) => x != null);
function applyAttributeToOthers(uncorrectedAvoidElements, body, ariaHidden, inert) {
	const markerName = "data-base-ui-inert";
	const controlAttribute = inert ? "inert" : ariaHidden ? "aria-hidden" : null;
	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const elementsToKeep = /* @__PURE__ */ new Set();
	const elementsToStop = new Set(avoidElements);
	const hiddenElements = [];
	if (!markerMap[markerName]) markerMap[markerName] = /* @__PURE__ */ new WeakMap();
	const markerCounter = markerMap[markerName];
	avoidElements.forEach(keep);
	deep(body);
	elementsToKeep.clear();
	function keep(el) {
		if (!el || elementsToKeep.has(el)) return;
		elementsToKeep.add(el);
		if (el.parentNode) keep(el.parentNode);
	}
	function deep(parent) {
		if (!parent || elementsToStop.has(parent)) return;
		[].forEach.call(parent.children, (node) => {
			if (getNodeName(node) === "script") return;
			if (elementsToKeep.has(node)) deep(node);
			else {
				const attr = controlAttribute ? node.getAttribute(controlAttribute) : null;
				const alreadyHidden = attr !== null && attr !== "false";
				const counterMap = getCounterMap(controlAttribute);
				const counterValue = (counterMap.get(node) || 0) + 1;
				const markerValue = (markerCounter.get(node) || 0) + 1;
				counterMap.set(node, counterValue);
				markerCounter.set(node, markerValue);
				hiddenElements.push(node);
				if (counterValue === 1 && alreadyHidden) uncontrolledElementsSet.add(node);
				if (markerValue === 1) node.setAttribute(markerName, "");
				if (!alreadyHidden && controlAttribute) node.setAttribute(controlAttribute, controlAttribute === "inert" ? "" : "true");
			}
		});
	}
	lockCount += 1;
	return () => {
		hiddenElements.forEach((element) => {
			const counterMap = getCounterMap(controlAttribute);
			const counterValue = (counterMap.get(element) || 0) - 1;
			const markerValue = (markerCounter.get(element) || 0) - 1;
			counterMap.set(element, counterValue);
			markerCounter.set(element, markerValue);
			if (!counterValue) {
				if (!uncontrolledElementsSet.has(element) && controlAttribute) element.removeAttribute(controlAttribute);
				uncontrolledElementsSet.delete(element);
			}
			if (!markerValue) element.removeAttribute(markerName);
		});
		lockCount -= 1;
		if (!lockCount) {
			counters.inert = /* @__PURE__ */ new WeakMap();
			counters["aria-hidden"] = /* @__PURE__ */ new WeakMap();
			counters.none = /* @__PURE__ */ new WeakMap();
			uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
			markerMap = {};
		}
	};
}
function markOthers(avoidElements, ariaHidden = false, inert = false) {
	const body = getDocument(avoidElements[0]).body;
	return applyAttributeToOthers(avoidElements.concat(Array.from(body.querySelectorAll("[aria-live]"))), body, ariaHidden, inert);
}
var PortalContext = /*#__PURE__*/ import_react.createContext(null);
var usePortalContext = () => import_react.useContext(PortalContext);
var attr = createAttribute("portal");
function useFloatingPortalNode(props = {}) {
	const { ref, container: containerProp, componentProps = EMPTY_OBJECT, elementProps, elementState } = props;
	const uniqueId = useId$11();
	const parentPortalNode = usePortalContext()?.portalNode;
	const [containerElement, setContainerElement] = import_react.useState(null);
	const [portalNode, setPortalNode] = import_react.useState(null);
	const containerRef = import_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (containerProp === null) {
			if (containerRef.current) {
				containerRef.current = null;
				setPortalNode(null);
				setContainerElement(null);
			}
			return;
		}
		if (uniqueId == null) return;
		const resolvedContainer = (containerProp && (isNode(containerProp) ? containerProp : containerProp.current)) ?? parentPortalNode ?? document.body;
		if (resolvedContainer == null) {
			if (containerRef.current) {
				containerRef.current = null;
				setPortalNode(null);
				setContainerElement(null);
			}
			return;
		}
		if (containerRef.current !== resolvedContainer) {
			containerRef.current = resolvedContainer;
			setPortalNode(null);
			setContainerElement(resolvedContainer);
		}
	}, [
		containerProp,
		parentPortalNode,
		uniqueId
	]);
	const portalElement = useRenderElement("div", componentProps, {
		ref: [ref, setPortalNode],
		state: elementState,
		props: [{
			id: uniqueId,
			[attr]: ""
		}, elementProps]
	});
	return {
		portalNode,
		portalSubtree: containerElement && portalElement ? /*#__PURE__*/ import_react_dom.createPortal(portalElement, containerElement) : null
	};
}
/**
* Portals the floating element into a given container element — by default,
* outside of the app root and into the body.
* This is necessary to ensure the floating element can appear outside any
* potential parent containers that cause clipping (such as `overflow: hidden`),
* while retaining its location in the React tree.
* @see https://floating-ui.com/docs/FloatingPortal
* @internal
*/
var FloatingPortal = /*#__PURE__*/ import_react.forwardRef(function FloatingPortal(componentProps, forwardedRef) {
	const { children, container, className, render, renderGuards, ...elementProps } = componentProps;
	const { portalNode, portalSubtree } = useFloatingPortalNode({
		container,
		ref: forwardedRef,
		componentProps,
		elementProps
	});
	const beforeOutsideRef = import_react.useRef(null);
	const afterOutsideRef = import_react.useRef(null);
	const beforeInsideRef = import_react.useRef(null);
	const afterInsideRef = import_react.useRef(null);
	const [focusManagerState, setFocusManagerState] = import_react.useState(null);
	const modal = focusManagerState?.modal;
	const open = focusManagerState?.open;
	const shouldRenderGuards = typeof renderGuards === "boolean" ? renderGuards : !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode;
	import_react.useEffect(() => {
		if (!portalNode || modal) return;
		function onFocus(event) {
			if (portalNode && isOutsideEvent(event)) (event.type === "focusin" ? enableFocusInside : disableFocusInside)(portalNode);
		}
		portalNode.addEventListener("focusin", onFocus, true);
		portalNode.addEventListener("focusout", onFocus, true);
		return () => {
			portalNode.removeEventListener("focusin", onFocus, true);
			portalNode.removeEventListener("focusout", onFocus, true);
		};
	}, [portalNode, modal]);
	import_react.useEffect(() => {
		if (!portalNode || open) return;
		enableFocusInside(portalNode);
	}, [open, portalNode]);
	const portalContextValue = import_react.useMemo(() => ({
		beforeOutsideRef,
		afterOutsideRef,
		beforeInsideRef,
		afterInsideRef,
		portalNode,
		setFocusManagerState
	}), [portalNode]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [portalSubtree, /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(PortalContext.Provider, {
		value: portalContextValue,
		children: [
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
				"data-type": "outside",
				ref: beforeOutsideRef,
				onFocus: (event) => {
					if (isOutsideEvent(event, portalNode)) beforeInsideRef.current?.focus();
					else getPreviousTabbable(focusManagerState ? focusManagerState.domReference : null)?.focus();
				}
			}),
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
				"aria-owns": portalNode.id,
				style: ownerVisuallyHidden
			}),
			portalNode && /*#__PURE__*/ import_react_dom.createPortal(children, portalNode),
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
				"data-type": "outside",
				ref: afterOutsideRef,
				onFocus: (event) => {
					if (isOutsideEvent(event, portalNode)) afterInsideRef.current?.focus();
					else {
						getNextTabbable(focusManagerState ? focusManagerState.domReference : null)?.focus();
						if (focusManagerState?.closeOnFocusOut) focusManagerState?.onOpenChange(false, createChangeEventDetails("focus-out", event.nativeEvent));
					}
				}
			})
		]
	})] });
});
function getEventType(event, lastInteractionType) {
	const win = getWindow(event.target);
	if (event instanceof win.KeyboardEvent) return "keyboard";
	if (event instanceof win.FocusEvent) return lastInteractionType || "keyboard";
	if ("pointerType" in event) return event.pointerType || "keyboard";
	if ("touches" in event) return "touch";
	if (event instanceof win.MouseEvent) return lastInteractionType || (event.detail === 0 ? "keyboard" : "mouse");
	return "";
}
var LIST_LIMIT = 20;
var previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
	previouslyFocusedElements = previouslyFocusedElements.filter((el) => el.isConnected);
}
function addPreviouslyFocusedElement(element) {
	clearDisconnectedPreviouslyFocusedElements();
	if (element && getNodeName(element) !== "body") {
		previouslyFocusedElements.push(element);
		if (previouslyFocusedElements.length > LIST_LIMIT) previouslyFocusedElements = previouslyFocusedElements.slice(-20);
	}
}
function getPreviouslyFocusedElement() {
	clearDisconnectedPreviouslyFocusedElements();
	return previouslyFocusedElements[previouslyFocusedElements.length - 1];
}
function getFirstTabbableElement(container) {
	if (!container) return null;
	const tabbableOptions = getTabbableOptions();
	if (isTabbable(container, tabbableOptions)) return container;
	return tabbable(container, tabbableOptions)[0] || container;
}
function isFocusable(element) {
	if (!element || !element.isConnected) return false;
	if (typeof element.checkVisibility === "function") return element.checkVisibility();
	return getComputedStyle$1(element).display !== "none";
}
function handleTabIndex(floatingFocusElement, orderRef) {
	if (!orderRef.current.includes("floating") && !floatingFocusElement.getAttribute("role")?.includes("dialog")) return;
	const options = getTabbableOptions();
	const tabbableContent = focusable(floatingFocusElement, options).filter((element) => {
		const dataTabIndex = element.getAttribute("data-tabindex") || "";
		return isTabbable(element, options) || element.hasAttribute("data-tabindex") && !dataTabIndex.startsWith("-");
	});
	const tabIndex = floatingFocusElement.getAttribute("tabindex");
	if (orderRef.current.includes("floating") || tabbableContent.length === 0) {
		if (tabIndex !== "0") floatingFocusElement.setAttribute("tabindex", "0");
	} else if (tabIndex !== "-1" || floatingFocusElement.hasAttribute("data-tabindex") && floatingFocusElement.getAttribute("data-tabindex") !== "-1") {
		floatingFocusElement.setAttribute("tabindex", "-1");
		floatingFocusElement.setAttribute("data-tabindex", "-1");
	}
}
/**
* Provides focus management for the floating element.
* @see https://floating-ui.com/docs/FloatingFocusManager
* @internal
*/
function FloatingFocusManager(props) {
	const { context, children, disabled = false, order = ["content"], initialFocus = true, returnFocus = true, restoreFocus = false, modal = true, closeOnFocusOut = true, openInteractionType = "", getInsideElements: getInsideElementsProp = () => [], nextFocusableElement, previousFocusableElement, beforeContentFocusGuardRef, externalTree } = props;
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const domReference = store.useState("domReferenceElement");
	const floating = store.useState("floatingElement");
	const { events, dataRef } = store.context;
	const getNodeId = useStableCallback(() => dataRef.current.floatingContext?.nodeId);
	const getInsideElements = useStableCallback(getInsideElementsProp);
	const ignoreInitialFocus = initialFocus === false;
	const isUntrappedTypeableCombobox = isTypeableCombobox(domReference) && ignoreInitialFocus;
	const orderRef = useValueAsRef(order);
	const initialFocusRef = useValueAsRef(initialFocus);
	const returnFocusRef = useValueAsRef(returnFocus);
	const openInteractionTypeRef = useValueAsRef(openInteractionType);
	const tree = useFloatingTree(externalTree);
	const portalContext = usePortalContext();
	const startDismissButtonRef = import_react.useRef(null);
	const endDismissButtonRef = import_react.useRef(null);
	const preventReturnFocusRef = import_react.useRef(false);
	const isPointerDownRef = import_react.useRef(false);
	const pointerDownOutsideRef = import_react.useRef(false);
	const tabbableIndexRef = import_react.useRef(-1);
	const closeTypeRef = import_react.useRef("");
	const lastInteractionTypeRef = import_react.useRef("");
	const blurTimeout = useTimeout();
	const pointerDownTimeout = useTimeout();
	const restoreFocusFrame = useAnimationFrame();
	const isInsidePortal = portalContext != null;
	const floatingFocusElement = getFloatingFocusElement(floating);
	const getTabbableContent = useStableCallback((container = floatingFocusElement) => {
		return container ? tabbable(container, getTabbableOptions()) : [];
	});
	const getTabbableElements = useStableCallback((container) => {
		const content = getTabbableContent(container);
		return orderRef.current.map(() => content).filter(Boolean).flat();
	});
	import_react.useEffect(() => {
		if (disabled) return;
		if (!modal) return;
		function onKeyDown(event) {
			if (event.key === "Tab") {
				if (contains$2(floatingFocusElement, activeElement(getDocument(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) stopEvent(event);
			}
		}
		const doc = getDocument(floatingFocusElement);
		doc.addEventListener("keydown", onKeyDown);
		return () => {
			doc.removeEventListener("keydown", onKeyDown);
		};
	}, [
		disabled,
		domReference,
		floatingFocusElement,
		modal,
		orderRef,
		isUntrappedTypeableCombobox,
		getTabbableContent,
		getTabbableElements
	]);
	import_react.useEffect(() => {
		if (disabled) return;
		if (!floating) return;
		function handleFocusIn(event) {
			const target = getTarget(event);
			const tabbableIndex = getTabbableContent().indexOf(target);
			if (tabbableIndex !== -1) tabbableIndexRef.current = tabbableIndex;
		}
		floating.addEventListener("focusin", handleFocusIn);
		return () => {
			floating.removeEventListener("focusin", handleFocusIn);
		};
	}, [
		disabled,
		floating,
		getTabbableContent
	]);
	import_react.useEffect(() => {
		if (disabled || !open) return;
		const doc = getDocument(floatingFocusElement);
		function clearPointerDownOutside() {
			pointerDownOutsideRef.current = false;
		}
		function onPointerDown(event) {
			const target = getTarget(event);
			const pointerTargetInside = contains$2(floating, target) || contains$2(domReference, target) || contains$2(portalContext?.portalNode, target);
			pointerDownOutsideRef.current = !pointerTargetInside;
			lastInteractionTypeRef.current = event.pointerType || "keyboard";
		}
		function onKeyDown() {
			lastInteractionTypeRef.current = "keyboard";
		}
		doc.addEventListener("pointerdown", onPointerDown, true);
		doc.addEventListener("pointerup", clearPointerDownOutside, true);
		doc.addEventListener("pointercancel", clearPointerDownOutside, true);
		doc.addEventListener("keydown", onKeyDown, true);
		return () => {
			doc.removeEventListener("pointerdown", onPointerDown, true);
			doc.removeEventListener("pointerup", clearPointerDownOutside, true);
			doc.removeEventListener("pointercancel", clearPointerDownOutside, true);
			doc.removeEventListener("keydown", onKeyDown, true);
		};
	}, [
		disabled,
		floating,
		domReference,
		floatingFocusElement,
		open,
		portalContext
	]);
	import_react.useEffect(() => {
		if (disabled) return;
		if (!closeOnFocusOut) return;
		function handlePointerDown() {
			isPointerDownRef.current = true;
			pointerDownTimeout.start(0, () => {
				isPointerDownRef.current = false;
			});
		}
		function handleFocusOutside(event) {
			const relatedTarget = event.relatedTarget;
			const currentTarget = event.currentTarget;
			const target = getTarget(event);
			queueMicrotask(() => {
				const nodeId = getNodeId();
				const triggers = store.context.triggerElements;
				const movedToUnrelatedNode = !(contains$2(domReference, relatedTarget) || contains$2(floating, relatedTarget) || contains$2(relatedTarget, floating) || contains$2(portalContext?.portalNode, relatedTarget) || relatedTarget != null && triggers.hasElement(relatedTarget) || triggers.hasMatchingElement((trigger) => contains$2(trigger, relatedTarget)) || relatedTarget?.hasAttribute(createAttribute("focus-guard")) || tree && (getNodeChildren(tree.nodesRef.current, nodeId).find((node) => contains$2(node.context?.elements.floating, relatedTarget) || contains$2(node.context?.elements.domReference, relatedTarget)) || getNodeAncestors(tree.nodesRef.current, nodeId).find((node) => [node.context?.elements.floating, getFloatingFocusElement(node.context?.elements.floating)].includes(relatedTarget) || node.context?.elements.domReference === relatedTarget)));
				if (currentTarget === domReference && floatingFocusElement) handleTabIndex(floatingFocusElement, orderRef);
				if (restoreFocus && currentTarget !== domReference && !isFocusable(target) && activeElement(getDocument(floatingFocusElement)) === getDocument(floatingFocusElement).body) {
					if (isHTMLElement$1(floatingFocusElement)) {
						floatingFocusElement.focus();
						if (restoreFocus === "popup") {
							restoreFocusFrame.request(() => {
								floatingFocusElement.focus();
							});
							return;
						}
					}
					const prevTabbableIndex = tabbableIndexRef.current;
					const tabbableContent = getTabbableContent();
					const nodeToFocus = tabbableContent[prevTabbableIndex] || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
					if (isHTMLElement$1(nodeToFocus)) nodeToFocus.focus();
				}
				if (dataRef.current.insideReactTree) {
					dataRef.current.insideReactTree = false;
					return;
				}
				if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && (isUntrappedTypeableCombobox || relatedTarget !== getPreviouslyFocusedElement())) {
					preventReturnFocusRef.current = true;
					store.setOpen(false, createChangeEventDetails(focusOut, event));
				}
			});
		}
		function markInsideReactTree() {
			if (pointerDownOutsideRef.current) return;
			dataRef.current.insideReactTree = true;
			blurTimeout.start(0, () => {
				dataRef.current.insideReactTree = false;
			});
		}
		const domReferenceElement = isHTMLElement$1(domReference) ? domReference : null;
		const cleanups = [];
		if (!floating && !domReferenceElement) return;
		if (domReferenceElement) {
			domReferenceElement.addEventListener("focusout", handleFocusOutside);
			domReferenceElement.addEventListener("pointerdown", handlePointerDown);
			cleanups.push(() => {
				domReferenceElement.removeEventListener("focusout", handleFocusOutside);
				domReferenceElement.removeEventListener("pointerdown", handlePointerDown);
			});
		}
		if (floating) {
			floating.addEventListener("focusout", handleFocusOutside);
			if (portalContext) {
				floating.addEventListener("focusout", markInsideReactTree, true);
				cleanups.push(() => {
					floating.removeEventListener("focusout", markInsideReactTree, true);
				});
			}
			cleanups.push(() => {
				floating.removeEventListener("focusout", handleFocusOutside);
			});
		}
		return () => {
			cleanups.forEach((cleanup) => {
				cleanup();
			});
		};
	}, [
		disabled,
		domReference,
		floating,
		floatingFocusElement,
		modal,
		tree,
		portalContext,
		store,
		closeOnFocusOut,
		restoreFocus,
		getTabbableContent,
		isUntrappedTypeableCombobox,
		getNodeId,
		orderRef,
		dataRef,
		blurTimeout,
		pointerDownTimeout,
		restoreFocusFrame
	]);
	const beforeGuardRef = import_react.useRef(null);
	const afterGuardRef = import_react.useRef(null);
	const mergedBeforeGuardRef = useMergedRefs(beforeGuardRef, beforeContentFocusGuardRef, portalContext?.beforeInsideRef);
	const mergedAfterGuardRef = useMergedRefs(afterGuardRef, portalContext?.afterInsideRef);
	import_react.useEffect(() => {
		if (disabled || !floating || !open) return;
		const portalNodes = Array.from(portalContext?.portalNode?.querySelectorAll(`[${createAttribute("portal")}]`) || []);
		const rootAncestorComboboxDomReference = (tree ? getNodeAncestors(tree.nodesRef.current, getNodeId()) : []).find((node) => isTypeableCombobox(node.context?.elements.domReference || null))?.context?.elements.domReference;
		const cleanup = markOthers([
			floating,
			rootAncestorComboboxDomReference,
			...portalNodes,
			...getInsideElements(),
			startDismissButtonRef.current,
			endDismissButtonRef.current,
			beforeGuardRef.current,
			afterGuardRef.current,
			portalContext?.beforeOutsideRef.current,
			portalContext?.afterOutsideRef.current,
			resolveRef(previousFocusableElement),
			resolveRef(nextFocusableElement),
			isUntrappedTypeableCombobox ? domReference : null
		].filter((x) => x != null), modal || isUntrappedTypeableCombobox);
		return () => {
			cleanup();
		};
	}, [
		open,
		disabled,
		domReference,
		floating,
		modal,
		orderRef,
		portalContext,
		isUntrappedTypeableCombobox,
		tree,
		getNodeId,
		getInsideElements,
		nextFocusableElement,
		previousFocusableElement
	]);
	useIsoLayoutEffect(() => {
		if (!open || disabled || !isHTMLElement$1(floatingFocusElement)) return;
		const previouslyFocusedElement = activeElement(getDocument(floatingFocusElement));
		queueMicrotask(() => {
			const focusableElements = getTabbableElements(floatingFocusElement);
			const initialFocusValueOrFn = initialFocusRef.current;
			const resolvedInitialFocus = typeof initialFocusValueOrFn === "function" ? initialFocusValueOrFn(openInteractionTypeRef.current || "") : initialFocusValueOrFn;
			if (resolvedInitialFocus === void 0 || resolvedInitialFocus === false) return;
			let elToFocus;
			if (resolvedInitialFocus === true || resolvedInitialFocus === null) elToFocus = focusableElements[0] || floatingFocusElement;
			else elToFocus = resolveRef(resolvedInitialFocus);
			elToFocus = elToFocus || focusableElements[0] || floatingFocusElement;
			if (contains$2(floatingFocusElement, previouslyFocusedElement)) return;
			enqueueFocus(elToFocus, { preventScroll: elToFocus === floatingFocusElement });
		});
	}, [
		disabled,
		open,
		floatingFocusElement,
		ignoreInitialFocus,
		getTabbableElements,
		initialFocusRef,
		openInteractionTypeRef
	]);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) return;
		const doc = getDocument(floatingFocusElement);
		addPreviouslyFocusedElement(activeElement(doc));
		function onOpenChangeLocal(details) {
			if (!details.open) closeTypeRef.current = getEventType(details.nativeEvent, lastInteractionTypeRef.current);
			if (details.reason === "trigger-hover" && details.nativeEvent.type === "mouseleave") preventReturnFocusRef.current = true;
			if (details.reason !== "outside-press") return;
			if (details.nested) preventReturnFocusRef.current = false;
			else if (isVirtualClick(details.nativeEvent) || isVirtualPointerEvent(details.nativeEvent)) preventReturnFocusRef.current = false;
			else {
				let isPreventScrollSupported = false;
				document.createElement("div").focus({ get preventScroll() {
					isPreventScrollSupported = true;
					return false;
				} });
				if (isPreventScrollSupported) preventReturnFocusRef.current = false;
				else preventReturnFocusRef.current = true;
			}
		}
		events.on("openchange", onOpenChangeLocal);
		const fallbackEl = doc.createElement("span");
		fallbackEl.setAttribute("tabindex", "-1");
		fallbackEl.setAttribute("aria-hidden", "true");
		Object.assign(fallbackEl.style, visuallyHidden);
		if (isInsidePortal && domReference) domReference.insertAdjacentElement("afterend", fallbackEl);
		function getReturnElement() {
			const returnFocusValueOrFn = returnFocusRef.current;
			let resolvedReturnFocusValue = typeof returnFocusValueOrFn === "function" ? returnFocusValueOrFn(closeTypeRef.current) : returnFocusValueOrFn;
			if (resolvedReturnFocusValue === void 0 || resolvedReturnFocusValue === false) return null;
			if (resolvedReturnFocusValue === null) resolvedReturnFocusValue = true;
			if (typeof resolvedReturnFocusValue === "boolean") {
				const el = domReference || getPreviouslyFocusedElement();
				return el && el.isConnected ? el : fallbackEl;
			}
			const fallback = domReference || getPreviouslyFocusedElement() || fallbackEl;
			return resolveRef(resolvedReturnFocusValue) || fallback;
		}
		return () => {
			events.off("openchange", onOpenChangeLocal);
			const activeEl = activeElement(doc);
			const isFocusInsideFloatingTree = contains$2(floating, activeEl) || tree && getNodeChildren(tree.nodesRef.current, getNodeId(), false).some((node) => contains$2(node.context?.elements.floating, activeEl));
			const returnElement = getReturnElement();
			queueMicrotask(() => {
				const tabbableReturnElement = getFirstTabbableElement(returnElement);
				const hasExplicitReturnFocus = typeof returnFocusRef.current !== "boolean";
				if (returnFocusRef.current && !preventReturnFocusRef.current && isHTMLElement$1(tabbableReturnElement) && (!hasExplicitReturnFocus && tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) tabbableReturnElement.focus({ preventScroll: true });
				fallbackEl.remove();
			});
		};
	}, [
		disabled,
		floating,
		floatingFocusElement,
		returnFocusRef,
		dataRef,
		events,
		tree,
		isInsidePortal,
		domReference,
		getNodeId
	]);
	import_react.useEffect(() => {
		queueMicrotask(() => {
			preventReturnFocusRef.current = false;
		});
	}, [disabled]);
	import_react.useEffect(() => {
		if (disabled || !open) return;
		function handlePointerDown(event) {
			if (getTarget(event)?.closest(`[data-base-ui-click-trigger]`)) isPointerDownRef.current = true;
		}
		const doc = getDocument(floatingFocusElement);
		doc.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			doc.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [
		disabled,
		open,
		floatingFocusElement
	]);
	useIsoLayoutEffect(() => {
		if (disabled) return;
		if (!portalContext) return;
		portalContext.setFocusManagerState({
			modal,
			closeOnFocusOut,
			open,
			onOpenChange: store.setOpen,
			domReference
		});
		return () => {
			portalContext.setFocusManagerState(null);
		};
	}, [
		disabled,
		portalContext,
		modal,
		open,
		store,
		closeOnFocusOut,
		domReference
	]);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) return;
		handleTabIndex(floatingFocusElement, orderRef);
		return () => {
			queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
		};
	}, [
		disabled,
		floatingFocusElement,
		orderRef
	]);
	const shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedBeforeGuardRef,
			onFocus: (event) => {
				if (modal) {
					const els = getTabbableElements();
					enqueueFocus(els[els.length - 1]);
				} else if (portalContext?.portalNode) {
					preventReturnFocusRef.current = false;
					if (isOutsideEvent(event, portalContext.portalNode)) getNextTabbable(domReference)?.focus();
					else resolveRef(previousFocusableElement ?? portalContext.beforeOutsideRef)?.focus();
				}
			}
		}),
		children,
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedAfterGuardRef,
			onFocus: (event) => {
				if (modal) enqueueFocus(getTabbableElements()[0]);
				else if (portalContext?.portalNode) {
					if (closeOnFocusOut) preventReturnFocusRef.current = true;
					if (isOutsideEvent(event, portalContext.portalNode)) getPreviousTabbable(domReference)?.focus();
					else resolveRef(nextFocusableElement ?? portalContext.afterOutsideRef)?.focus();
				}
			}
		})
	] });
}
/**
* Opens or closes the floating element when clicking the reference element.
* @see https://floating-ui.com/docs/useClick
*/
function useClick(context, props = {}) {
	const store = "rootStore" in context ? context.rootStore : context;
	const dataRef = store.context.dataRef;
	const { enabled = true, event: eventOption = "click", toggle = true, ignoreMouse = false, stickIfOpen = true, touchOpenDelay = 0 } = props;
	const pointerTypeRef = import_react.useRef(void 0);
	const frame = useAnimationFrame();
	const touchOpenTimeout = useTimeout();
	const reference = import_react.useMemo(() => ({
		onPointerDown(event) {
			pointerTypeRef.current = event.pointerType;
		},
		onMouseDown(event) {
			const pointerType = pointerTypeRef.current;
			const nativeEvent = event.nativeEvent;
			const open = store.select("open");
			if (event.button !== 0 || eventOption === "click" || isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
			const openEvent = dataRef.current.openEvent;
			const openEventType = openEvent?.type;
			const hasClickedOnInactiveTrigger = store.select("domReferenceElement") !== event.currentTarget;
			const nextOpen = open && hasClickedOnInactiveTrigger || !(open && toggle && (openEvent && stickIfOpen ? openEventType === "click" || openEventType === "mousedown" : true));
			if (isTypeableElement(nativeEvent.target)) {
				const details = createChangeEventDetails(triggerPress, nativeEvent, nativeEvent.target);
				if (nextOpen && pointerType === "touch" && touchOpenDelay > 0) touchOpenTimeout.start(touchOpenDelay, () => {
					store.setOpen(true, details);
				});
				else store.setOpen(nextOpen, details);
				return;
			}
			const eventCurrentTarget = event.currentTarget;
			frame.request(() => {
				const details = createChangeEventDetails(triggerPress, nativeEvent, eventCurrentTarget);
				if (nextOpen && pointerType === "touch" && touchOpenDelay > 0) touchOpenTimeout.start(touchOpenDelay, () => {
					store.setOpen(true, details);
				});
				else store.setOpen(nextOpen, details);
			});
		},
		onClick(event) {
			if (eventOption === "mousedown-only") return;
			const pointerType = pointerTypeRef.current;
			if (eventOption === "mousedown" && pointerType) {
				pointerTypeRef.current = void 0;
				return;
			}
			if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
			const open = store.select("open");
			const openEvent = dataRef.current.openEvent;
			const hasClickedOnInactiveTrigger = store.select("domReferenceElement") !== event.currentTarget;
			const nextOpen = open && hasClickedOnInactiveTrigger || !(open && toggle && (openEvent && stickIfOpen ? isClickLikeEvent(openEvent) : true));
			const details = createChangeEventDetails(triggerPress, event.nativeEvent, event.currentTarget);
			if (nextOpen && pointerType === "touch" && touchOpenDelay > 0) touchOpenTimeout.start(touchOpenDelay, () => {
				store.setOpen(true, details);
			});
			else store.setOpen(nextOpen, details);
		},
		onKeyDown() {
			pointerTypeRef.current = void 0;
		}
	}), [
		dataRef,
		eventOption,
		ignoreMouse,
		store,
		stickIfOpen,
		toggle,
		frame,
		touchOpenTimeout,
		touchOpenDelay
	]);
	return import_react.useMemo(() => enabled ? { reference } : EMPTY_OBJECT, [enabled, reference]);
}
var bubbleHandlerKeys = {
	intentional: "onClick",
	sloppy: "onPointerDown"
};
function normalizeProp(normalizable) {
	return {
		escapeKey: typeof normalizable === "boolean" ? normalizable : normalizable?.escapeKey ?? false,
		outsidePress: typeof normalizable === "boolean" ? normalizable : normalizable?.outsidePress ?? true
	};
}
/**
* Closes the floating element when a dismissal is requested — by default, when
* the user presses the `escape` key or outside of the floating element.
* @see https://floating-ui.com/docs/useDismiss
*/
function useDismiss(context, props = {}) {
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const floatingElement = store.useState("floatingElement");
	const referenceElement = store.useState("referenceElement");
	const domReferenceElement = store.useState("domReferenceElement");
	const { onOpenChange, dataRef } = store.context;
	const { enabled = true, escapeKey: escapeKey$1 = true, outsidePress: outsidePressProp = true, outsidePressEvent = "sloppy", referencePress = false, referencePressEvent = "sloppy", ancestorScroll = false, bubbles, externalTree } = props;
	const tree = useFloatingTree(externalTree);
	const outsidePressFn = useStableCallback(typeof outsidePressProp === "function" ? outsidePressProp : () => false);
	const outsidePress$1 = typeof outsidePressProp === "function" ? outsidePressFn : outsidePressProp;
	const endedOrStartedInsideRef = import_react.useRef(false);
	const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp(bubbles);
	const touchStateRef = import_react.useRef(null);
	const cancelDismissOnEndTimeout = useTimeout();
	const clearInsideReactTreeTimeout = useTimeout();
	const clearInsideReactTree = useStableCallback(() => {
		clearInsideReactTreeTimeout.clear();
		dataRef.current.insideReactTree = false;
	});
	const isComposingRef = import_react.useRef(false);
	const currentPointerTypeRef = import_react.useRef("");
	const trackPointerType = useStableCallback((event) => {
		currentPointerTypeRef.current = event.pointerType;
	});
	const getOutsidePressEvent = useStableCallback(() => {
		const type = currentPointerTypeRef.current;
		const computedType = type === "pen" || !type ? "mouse" : type;
		const resolved = typeof outsidePressEvent === "function" ? outsidePressEvent() : outsidePressEvent;
		if (typeof resolved === "string") return resolved;
		return resolved[computedType];
	});
	const closeOnEscapeKeyDown = useStableCallback((event) => {
		if (!open || !enabled || !escapeKey$1 || event.key !== "Escape") return;
		if (isComposingRef.current) return;
		const nodeId = dataRef.current.floatingContext?.nodeId;
		const children = tree ? getNodeChildren(tree.nodesRef.current, nodeId) : [];
		if (!escapeKeyBubbles) {
			if (children.length > 0) {
				let shouldDismiss = true;
				children.forEach((child) => {
					if (child.context?.open && !child.context.dataRef.current.__escapeKeyBubbles) shouldDismiss = false;
				});
				if (!shouldDismiss) return;
			}
		}
		const eventDetails = createChangeEventDetails(escapeKey, isReactEvent(event) ? event.nativeEvent : event);
		store.setOpen(false, eventDetails);
		if (!escapeKeyBubbles && !eventDetails.isPropagationAllowed) event.stopPropagation();
	});
	const shouldIgnoreEvent = useStableCallback((event) => {
		const computedOutsidePressEvent = getOutsidePressEvent();
		return computedOutsidePressEvent === "intentional" && event.type !== "click" || computedOutsidePressEvent === "sloppy" && event.type === "click";
	});
	const markInsideReactTree = useStableCallback(() => {
		dataRef.current.insideReactTree = true;
		clearInsideReactTreeTimeout.start(0, clearInsideReactTree);
	});
	const closeOnPressOutside = useStableCallback((event, endedOrStartedInside = false) => {
		if (shouldIgnoreEvent(event)) {
			clearInsideReactTree();
			return;
		}
		if (dataRef.current.insideReactTree) {
			clearInsideReactTree();
			return;
		}
		if (getOutsidePressEvent() === "intentional" && endedOrStartedInside) return;
		if (typeof outsidePress$1 === "function" && !outsidePress$1(event)) return;
		const target = getTarget(event);
		const inertSelector = `[${createAttribute("inert")}]`;
		const markers = getDocument(store.select("floatingElement")).querySelectorAll(inertSelector);
		const triggers = store.context.triggerElements;
		if (target && (triggers.hasElement(target) || triggers.hasMatchingElement((trigger) => contains$2(trigger, target)))) return;
		let targetRootAncestor = isElement(target) ? target : null;
		while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
			const nextParent = getParentNode(targetRootAncestor);
			if (isLastTraversableNode(nextParent) || !isElement(nextParent)) break;
			targetRootAncestor = nextParent;
		}
		if (markers.length && isElement(target) && !isRootElement(target) && !contains$2(target, store.select("floatingElement")) && Array.from(markers).every((marker) => !contains$2(targetRootAncestor, marker))) return;
		if (isHTMLElement$1(target) && !("touches" in event)) {
			const lastTraversableNode = isLastTraversableNode(target);
			const style = getComputedStyle$1(target);
			const scrollRe = /auto|scroll/;
			const isScrollableX = lastTraversableNode || scrollRe.test(style.overflowX);
			const isScrollableY = lastTraversableNode || scrollRe.test(style.overflowY);
			const canScrollX = isScrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
			const canScrollY = isScrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;
			const isRTL = style.direction === "rtl";
			const pressedVerticalScrollbar = canScrollY && (isRTL ? event.offsetX <= target.offsetWidth - target.clientWidth : event.offsetX > target.clientWidth);
			const pressedHorizontalScrollbar = canScrollX && event.offsetY > target.clientHeight;
			if (pressedVerticalScrollbar || pressedHorizontalScrollbar) return;
		}
		const nodeId = dataRef.current.floatingContext?.nodeId;
		const targetIsInsideChildren = tree && getNodeChildren(tree.nodesRef.current, nodeId).some((node) => isEventTargetWithin(event, node.context?.elements.floating));
		if (isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement")) || targetIsInsideChildren) return;
		const children = tree ? getNodeChildren(tree.nodesRef.current, nodeId) : [];
		if (children.length > 0) {
			let shouldDismiss = true;
			children.forEach((child) => {
				if (child.context?.open && !child.context.dataRef.current.__outsidePressBubbles) shouldDismiss = false;
			});
			if (!shouldDismiss) return;
		}
		store.setOpen(false, createChangeEventDetails(outsidePress, event));
		clearInsideReactTree();
	});
	const handlePointerDown = useStableCallback((event) => {
		if (getOutsidePressEvent() !== "sloppy" || event.pointerType === "touch" || !store.select("open") || !enabled || isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement"))) return;
		closeOnPressOutside(event);
	});
	const handleTouchStart = useStableCallback((event) => {
		if (getOutsidePressEvent() !== "sloppy" || !store.select("open") || !enabled || isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement"))) return;
		const touch = event.touches[0];
		if (touch) {
			touchStateRef.current = {
				startTime: Date.now(),
				startX: touch.clientX,
				startY: touch.clientY,
				dismissOnTouchEnd: false,
				dismissOnMouseDown: true
			};
			cancelDismissOnEndTimeout.start(1e3, () => {
				if (touchStateRef.current) {
					touchStateRef.current.dismissOnTouchEnd = false;
					touchStateRef.current.dismissOnMouseDown = false;
				}
			});
		}
	});
	const handleTouchStartCapture = useStableCallback((event) => {
		const target = getTarget(event);
		function callback() {
			handleTouchStart(event);
			target?.removeEventListener(event.type, callback);
		}
		target?.addEventListener(event.type, callback);
	});
	const closeOnPressOutsideCapture = useStableCallback((event) => {
		const endedOrStartedInside = endedOrStartedInsideRef.current;
		endedOrStartedInsideRef.current = false;
		cancelDismissOnEndTimeout.clear();
		if (event.type === "mousedown" && touchStateRef.current && !touchStateRef.current.dismissOnMouseDown) return;
		const target = getTarget(event);
		function callback() {
			if (event.type === "pointerdown") handlePointerDown(event);
			else closeOnPressOutside(event, endedOrStartedInside);
			target?.removeEventListener(event.type, callback);
		}
		target?.addEventListener(event.type, callback);
	});
	const handleTouchMove = useStableCallback((event) => {
		if (getOutsidePressEvent() !== "sloppy" || !touchStateRef.current || isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement"))) return;
		const touch = event.touches[0];
		if (!touch) return;
		const deltaX = Math.abs(touch.clientX - touchStateRef.current.startX);
		const deltaY = Math.abs(touch.clientY - touchStateRef.current.startY);
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		if (distance > 5) touchStateRef.current.dismissOnTouchEnd = true;
		if (distance > 10) {
			closeOnPressOutside(event);
			cancelDismissOnEndTimeout.clear();
			touchStateRef.current = null;
		}
	});
	const handleTouchMoveCapture = useStableCallback((event) => {
		const target = getTarget(event);
		function callback() {
			handleTouchMove(event);
			target?.removeEventListener(event.type, callback);
		}
		target?.addEventListener(event.type, callback);
	});
	const handleTouchEnd = useStableCallback((event) => {
		if (getOutsidePressEvent() !== "sloppy" || !touchStateRef.current || isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement"))) return;
		if (touchStateRef.current.dismissOnTouchEnd) closeOnPressOutside(event);
		cancelDismissOnEndTimeout.clear();
		touchStateRef.current = null;
	});
	const handleTouchEndCapture = useStableCallback((event) => {
		const target = getTarget(event);
		function callback() {
			handleTouchEnd(event);
			target?.removeEventListener(event.type, callback);
		}
		target?.addEventListener(event.type, callback);
	});
	import_react.useEffect(() => {
		if (!open || !enabled) return;
		dataRef.current.__escapeKeyBubbles = escapeKeyBubbles;
		dataRef.current.__outsidePressBubbles = outsidePressBubbles;
		const compositionTimeout = new Timeout();
		function onScroll(event) {
			store.setOpen(false, createChangeEventDetails(none$5, event));
		}
		function handleCompositionStart() {
			compositionTimeout.clear();
			isComposingRef.current = true;
		}
		function handleCompositionEnd() {
			compositionTimeout.start(isWebKit$1() ? 5 : 0, () => {
				isComposingRef.current = false;
			});
		}
		const doc = getDocument(floatingElement);
		doc.addEventListener("pointerdown", trackPointerType, true);
		if (escapeKey$1) {
			doc.addEventListener("keydown", closeOnEscapeKeyDown);
			doc.addEventListener("compositionstart", handleCompositionStart);
			doc.addEventListener("compositionend", handleCompositionEnd);
		}
		if (outsidePress$1) {
			doc.addEventListener("click", closeOnPressOutsideCapture, true);
			doc.addEventListener("pointerdown", closeOnPressOutsideCapture, true);
			doc.addEventListener("touchstart", handleTouchStartCapture, true);
			doc.addEventListener("touchmove", handleTouchMoveCapture, true);
			doc.addEventListener("touchend", handleTouchEndCapture, true);
			doc.addEventListener("mousedown", closeOnPressOutsideCapture, true);
		}
		let ancestors = [];
		if (ancestorScroll) {
			if (isElement(domReferenceElement)) ancestors = getOverflowAncestors(domReferenceElement);
			if (isElement(floatingElement)) ancestors = ancestors.concat(getOverflowAncestors(floatingElement));
			if (!isElement(referenceElement) && referenceElement && referenceElement.contextElement) ancestors = ancestors.concat(getOverflowAncestors(referenceElement.contextElement));
		}
		ancestors = ancestors.filter((ancestor) => ancestor !== doc.defaultView?.visualViewport);
		ancestors.forEach((ancestor) => {
			ancestor.addEventListener("scroll", onScroll, { passive: true });
		});
		return () => {
			doc.removeEventListener("pointerdown", trackPointerType, true);
			if (escapeKey$1) {
				doc.removeEventListener("keydown", closeOnEscapeKeyDown);
				doc.removeEventListener("compositionstart", handleCompositionStart);
				doc.removeEventListener("compositionend", handleCompositionEnd);
			}
			if (outsidePress$1) {
				doc.removeEventListener("click", closeOnPressOutsideCapture, true);
				doc.removeEventListener("pointerdown", closeOnPressOutsideCapture, true);
				doc.removeEventListener("touchstart", handleTouchStartCapture, true);
				doc.removeEventListener("touchmove", handleTouchMoveCapture, true);
				doc.removeEventListener("touchend", handleTouchEndCapture, true);
				doc.removeEventListener("mousedown", closeOnPressOutsideCapture, true);
			}
			ancestors.forEach((ancestor) => {
				ancestor.removeEventListener("scroll", onScroll);
			});
			compositionTimeout.clear();
		};
	}, [
		dataRef,
		floatingElement,
		referenceElement,
		domReferenceElement,
		escapeKey$1,
		outsidePress$1,
		open,
		onOpenChange,
		ancestorScroll,
		enabled,
		escapeKeyBubbles,
		outsidePressBubbles,
		closeOnEscapeKeyDown,
		closeOnPressOutside,
		closeOnPressOutsideCapture,
		handlePointerDown,
		handleTouchStartCapture,
		handleTouchMoveCapture,
		handleTouchEndCapture,
		trackPointerType,
		store
	]);
	import_react.useEffect(clearInsideReactTree, [outsidePress$1, clearInsideReactTree]);
	const reference = import_react.useMemo(() => ({
		onKeyDown: closeOnEscapeKeyDown,
		...referencePress && {
			[bubbleHandlerKeys[referencePressEvent]]: (event) => {
				store.setOpen(false, createChangeEventDetails("trigger-press", event.nativeEvent));
			},
			...referencePressEvent !== "intentional" && { onClick(event) {
				store.setOpen(false, createChangeEventDetails("trigger-press", event.nativeEvent));
			} }
		}
	}), [
		closeOnEscapeKeyDown,
		store,
		referencePress,
		referencePressEvent
	]);
	const handlePressedInside = useStableCallback((event) => {
		const target = getTarget(event.nativeEvent);
		if (!contains$2(store.select("floatingElement"), target) || event.button !== 0) return;
		endedOrStartedInsideRef.current = true;
	});
	const floating = import_react.useMemo(() => ({
		onKeyDown: closeOnEscapeKeyDown,
		onPointerDown: handlePressedInside,
		onMouseDown: handlePressedInside,
		onMouseUp: handlePressedInside,
		onClickCapture: markInsideReactTree,
		onMouseDownCapture: markInsideReactTree,
		onPointerDownCapture: markInsideReactTree,
		onMouseUpCapture: markInsideReactTree,
		onTouchEndCapture: markInsideReactTree,
		onTouchMoveCapture: markInsideReactTree
	}), [
		closeOnEscapeKeyDown,
		handlePressedInside,
		markInsideReactTree
	]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating,
		trigger: reference
	} : {}, [
		enabled,
		reference,
		floating
	]);
}
var selectors$1 = {
	open: createSelector((state) => state.open),
	domReferenceElement: createSelector((state) => state.domReferenceElement),
	referenceElement: createSelector((state) => state.positionReference ?? state.referenceElement),
	floatingElement: createSelector((state) => state.floatingElement),
	floatingId: createSelector((state) => state.floatingId)
};
var FloatingRootStore = class extends ReactStore {
	constructor(options) {
		const { nested, noEmit, onOpenChange, triggerElements, ...initialState } = options;
		super({
			...initialState,
			positionReference: initialState.referenceElement,
			domReferenceElement: initialState.referenceElement
		}, {
			onOpenChange,
			dataRef: { current: {} },
			events: createEventEmitter(),
			nested,
			noEmit,
			triggerElements
		}, selectors$1);
	}
	/**
	* Emits the `openchange` event through the internal event emitter and calls the `onOpenChange` handler with the provided arguments.
	*
	* @param newOpen The new open state.
	* @param eventDetails Details about the event that triggered the open state change.
	*/
	setOpen = (newOpen, eventDetails) => {
		if (!newOpen || !this.state.open || isClickLikeEvent(eventDetails.event)) this.context.dataRef.current.openEvent = newOpen ? eventDetails.event : void 0;
		if (!this.context.noEmit) {
			const details = {
				open: newOpen,
				reason: eventDetails.reason,
				nativeEvent: eventDetails.event,
				nested: this.context.nested,
				triggerElement: eventDetails.trigger
			};
			this.context.events.emit("openchange", details);
		}
		this.context.onOpenChange?.(newOpen, eventDetails);
	};
};
/**
* Data structure to keep track of popup trigger elements by their IDs.
* Uses both a set of Elements and a map of IDs to Elements for efficient lookups.
*/
var PopupTriggerMap = class {
	constructor() {
		this.elements = /* @__PURE__ */ new Set();
		this.idMap = /* @__PURE__ */ new Map();
	}
	/**
	* Adds a trigger element with the given ID.
	*
	* Note: The provided element is assumed to not be registered under multiple IDs.
	*/
	add(id, element) {
		const existingElement = this.idMap.get(id);
		if (existingElement === element) return;
		if (existingElement !== void 0) this.elements.delete(existingElement);
		this.elements.add(element);
		this.idMap.set(id, element);
	}
	/**
	* Removes the trigger element with the given ID.
	*/
	delete(id) {
		const element = this.idMap.get(id);
		if (element) {
			this.elements.delete(element);
			this.idMap.delete(id);
		}
	}
	/**
	* Whether the given element is registered as a trigger.
	*/
	hasElement(element) {
		return this.elements.has(element);
	}
	/**
	* Whether there is a registered trigger element matching the given predicate.
	*/
	hasMatchingElement(predicate) {
		for (const element of this.elements) if (predicate(element)) return true;
		return false;
	}
	getById(id) {
		return this.idMap.get(id);
	}
	entries() {
		return this.idMap.entries();
	}
	get size() {
		return this.idMap.size;
	}
};
function useFloatingRootContext(options) {
	const { open = false, onOpenChange, elements = {} } = options;
	const floatingId = useId$11();
	const nested = useFloatingParentNodeId() != null;
	const store = useRefWithInit(() => new FloatingRootStore({
		open,
		onOpenChange,
		referenceElement: elements.reference ?? null,
		floatingElement: elements.floating ?? null,
		triggerElements: elements.triggers ?? new PopupTriggerMap(),
		floatingId,
		nested,
		noEmit: options.noEmit || false
	})).current;
	useIsoLayoutEffect(() => {
		const valuesToSync = {
			open,
			floatingId
		};
		if (elements.reference !== void 0) {
			valuesToSync.referenceElement = elements.reference;
			valuesToSync.domReferenceElement = isElement(elements.reference) ? elements.reference : null;
		}
		if (elements.floating !== void 0) valuesToSync.floatingElement = elements.floating;
		store.update(valuesToSync);
	}, [
		open,
		floatingId,
		elements.reference,
		elements.floating,
		store
	]);
	store.context.onOpenChange = onOpenChange;
	store.context.nested = nested;
	store.context.noEmit = options.noEmit || false;
	return store;
}
/**
* Provides data to position a floating element and context to add interactions.
* @see https://floating-ui.com/docs/useFloating
*/
function useFloating(options = {}) {
	const { nodeId, externalTree } = options;
	const internalRootStore = useFloatingRootContext(options);
	const rootContext = options.rootContext || internalRootStore;
	const rootContextElements = {
		reference: rootContext.useState("referenceElement"),
		floating: rootContext.useState("floatingElement"),
		domReference: rootContext.useState("domReferenceElement")
	};
	const [positionReference, setPositionReferenceRaw] = import_react.useState(null);
	const domReferenceRef = import_react.useRef(null);
	const tree = useFloatingTree(externalTree);
	useIsoLayoutEffect(() => {
		if (rootContextElements.domReference) domReferenceRef.current = rootContextElements.domReference;
	}, [rootContextElements.domReference]);
	const position = useFloating$1({
		...options,
		elements: {
			...rootContextElements,
			...positionReference && { reference: positionReference }
		}
	});
	const setPositionReference = import_react.useCallback((node) => {
		const computedPositionReference = isElement(node) ? {
			getBoundingClientRect: () => node.getBoundingClientRect(),
			getClientRects: () => node.getClientRects(),
			contextElement: node
		} : node;
		setPositionReferenceRaw(computedPositionReference);
		position.refs.setReference(computedPositionReference);
	}, [position.refs]);
	const [localDomReference, setLocalDomReference] = import_react.useState(null);
	const [localFloatingElement, setLocalFloatingElement] = import_react.useState(null);
	rootContext.useSyncedValue("referenceElement", localDomReference);
	rootContext.useSyncedValue("domReferenceElement", isElement(localDomReference) ? localDomReference : null);
	rootContext.useSyncedValue("floatingElement", localFloatingElement);
	const setReference = import_react.useCallback((node) => {
		if (isElement(node) || node === null) {
			domReferenceRef.current = node;
			setLocalDomReference(node);
		}
		if (isElement(position.refs.reference.current) || position.refs.reference.current === null || node !== null && !isElement(node)) position.refs.setReference(node);
	}, [position.refs, setLocalDomReference]);
	const setFloating = import_react.useCallback((node) => {
		setLocalFloatingElement(node);
		position.refs.setFloating(node);
	}, [position.refs]);
	const refs = import_react.useMemo(() => ({
		...position.refs,
		setReference,
		setFloating,
		setPositionReference,
		domReference: domReferenceRef
	}), [
		position.refs,
		setReference,
		setFloating,
		setPositionReference
	]);
	const elements = import_react.useMemo(() => ({
		...position.elements,
		domReference: rootContextElements.domReference
	}), [position.elements, rootContextElements.domReference]);
	const open = rootContext.useState("open");
	const floatingId = rootContext.useState("floatingId");
	const context = import_react.useMemo(() => ({
		...position,
		dataRef: rootContext.context.dataRef,
		open,
		onOpenChange: rootContext.setOpen,
		events: rootContext.context.events,
		floatingId,
		refs,
		elements,
		nodeId,
		rootStore: rootContext
	}), [
		position,
		refs,
		elements,
		nodeId,
		rootContext,
		open,
		floatingId
	]);
	useIsoLayoutEffect(() => {
		rootContext.context.dataRef.current.floatingContext = context;
		const node = tree?.nodesRef.current.find((n) => n.id === nodeId);
		if (node) node.context = context;
	});
	return import_react.useMemo(() => ({
		...position,
		context,
		refs,
		elements,
		rootStore: rootContext
	}), [
		position,
		refs,
		elements,
		context,
		rootContext
	]);
}
/**
* Merges an array of interaction hooks' props into prop getters, allowing
* event handler functions to be composed together without overwriting one
* another.
* @see https://floating-ui.com/docs/useInteractions
*/
function useInteractions(propsList = []) {
	const referenceDeps = propsList.map((key) => key?.reference);
	const floatingDeps = propsList.map((key) => key?.floating);
	const itemDeps = propsList.map((key) => key?.item);
	const triggerDeps = propsList.map((key) => key?.trigger);
	const getReferenceProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "reference"), referenceDeps);
	const getFloatingProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "floating"), floatingDeps);
	const getItemProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "item"), itemDeps);
	const getTriggerProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "trigger"), triggerDeps);
	return import_react.useMemo(() => ({
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		getTriggerProps
	}), [
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		getTriggerProps
	]);
}
function mergeProps(userProps, propsList, elementKey) {
	const eventHandlers = /* @__PURE__ */ new Map();
	const isItem = elementKey === "item";
	const outputProps = {};
	if (elementKey === "floating") {
		outputProps.tabIndex = -1;
		outputProps[FOCUSABLE_ATTRIBUTE] = "";
	}
	for (const key in userProps) {
		if (isItem && userProps) {
			if (key === "active" || key === "selected") continue;
		}
		outputProps[key] = userProps[key];
	}
	for (let i = 0; i < propsList.length; i += 1) {
		let props;
		const propsOrGetProps = propsList[i]?.[elementKey];
		if (typeof propsOrGetProps === "function") props = userProps ? propsOrGetProps(userProps) : null;
		else props = propsOrGetProps;
		if (!props) continue;
		mutablyMergeProps(outputProps, props, isItem, eventHandlers);
	}
	mutablyMergeProps(outputProps, userProps, isItem, eventHandlers);
	return outputProps;
}
function mutablyMergeProps(outputProps, props, isItem, eventHandlers) {
	for (const key in props) {
		const value = props[key];
		if (isItem && (key === "active" || key === "selected")) continue;
		if (!key.startsWith("on")) outputProps[key] = value;
		else {
			if (!eventHandlers.has(key)) eventHandlers.set(key, []);
			if (typeof value === "function") {
				eventHandlers.get(key)?.push(value);
				outputProps[key] = (...args) => {
					return eventHandlers.get(key)?.map((fn) => fn(...args)).find((val) => val !== void 0);
				};
			}
		}
	}
}
var ESCAPE = "Escape";
function doSwitch(orientation, vertical, horizontal) {
	switch (orientation) {
		case "vertical": return vertical;
		case "horizontal": return horizontal;
		default: return vertical || horizontal;
	}
}
function isMainOrientationKey(key, orientation) {
	return doSwitch(orientation, key === "ArrowUp" || key === "ArrowDown", key === "ArrowLeft" || key === "ArrowRight");
}
function isMainOrientationToEndKey(key, orientation, rtl) {
	return doSwitch(orientation, key === "ArrowDown", rtl ? key === "ArrowLeft" : key === "ArrowRight") || key === "Enter" || key === " " || key === "";
}
function isCrossOrientationOpenKey(key, orientation, rtl) {
	return doSwitch(orientation, rtl ? key === ARROW_LEFT : key === ARROW_RIGHT, key === ARROW_DOWN);
}
function isCrossOrientationCloseKey(key, orientation, rtl, cols) {
	const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT;
	const horizontal = key === ARROW_UP;
	if (orientation === "both" || orientation === "horizontal" && cols && cols > 1) return key === ESCAPE;
	return doSwitch(orientation, vertical, horizontal);
}
/**
* Adds arrow key-based navigation of a list of items, either using real DOM
* focus or virtual focus.
* @see https://floating-ui.com/docs/useListNavigation
*/
function useListNavigation(context, props) {
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const floatingElement = store.useState("floatingElement");
	const domReferenceElement = store.useState("domReferenceElement");
	const dataRef = store.context.dataRef;
	const { listRef, activeIndex, onNavigate: onNavigateProp = () => {}, enabled = true, selectedIndex = null, allowEscape = false, loopFocus = false, nested = false, rtl = false, virtual = false, focusItemOnOpen = "auto", focusItemOnHover = true, openOnArrowKeyDown = true, disabledIndices = void 0, orientation = "vertical", parentOrientation, cols = 1, scrollItemIntoView = true, itemSizes, dense = false, id, resetOnPointerLeave = true, externalTree } = props;
	const floatingFocusElementRef = useValueAsRef(getFloatingFocusElement(floatingElement));
	const parentId = useFloatingParentNodeId();
	const tree = useFloatingTree(externalTree);
	useIsoLayoutEffect(() => {
		dataRef.current.orientation = orientation;
	}, [dataRef, orientation]);
	const typeableComboboxReference = isTypeableCombobox(domReferenceElement);
	const focusItemOnOpenRef = import_react.useRef(focusItemOnOpen);
	const indexRef = import_react.useRef(selectedIndex ?? -1);
	const keyRef = import_react.useRef(null);
	const isPointerModalityRef = import_react.useRef(true);
	const onNavigate = useStableCallback((event) => {
		onNavigateProp(indexRef.current === -1 ? null : indexRef.current, event);
	});
	const previousOnNavigateRef = import_react.useRef(onNavigate);
	const previousMountedRef = import_react.useRef(!!floatingElement);
	const previousOpenRef = import_react.useRef(open);
	const forceSyncFocusRef = import_react.useRef(false);
	const forceScrollIntoViewRef = import_react.useRef(false);
	const disabledIndicesRef = useValueAsRef(disabledIndices);
	const latestOpenRef = useValueAsRef(open);
	const scrollItemIntoViewRef = useValueAsRef(scrollItemIntoView);
	const selectedIndexRef = useValueAsRef(selectedIndex);
	const resetOnPointerLeaveRef = useValueAsRef(resetOnPointerLeave);
	const focusItem = useStableCallback(() => {
		function runFocus(item) {
			if (virtual) tree?.events.emit("virtualfocus", item);
			else enqueueFocus(item, {
				sync: forceSyncFocusRef.current,
				preventScroll: true
			});
		}
		const initialItem = listRef.current[indexRef.current];
		const forceScrollIntoView = forceScrollIntoViewRef.current;
		if (initialItem) runFocus(initialItem);
		(forceSyncFocusRef.current ? (v) => v() : requestAnimationFrame)(() => {
			const waitedItem = listRef.current[indexRef.current] || initialItem;
			if (!waitedItem) return;
			if (!initialItem) runFocus(waitedItem);
			const scrollIntoViewOptions = scrollItemIntoViewRef.current;
			if (scrollIntoViewOptions && item && (forceScrollIntoView || !isPointerModalityRef.current)) waitedItem.scrollIntoView?.(typeof scrollIntoViewOptions === "boolean" ? {
				block: "nearest",
				inline: "nearest"
			} : scrollIntoViewOptions);
		});
	});
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (open && floatingElement) {
			indexRef.current = selectedIndex ?? -1;
			if (focusItemOnOpenRef.current && selectedIndex != null) {
				forceScrollIntoViewRef.current = true;
				onNavigate();
			}
		} else if (previousMountedRef.current) {
			indexRef.current = -1;
			previousOnNavigateRef.current();
		}
	}, [
		enabled,
		open,
		floatingElement,
		selectedIndex,
		onNavigate
	]);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (!open) {
			forceSyncFocusRef.current = false;
			return;
		}
		if (!floatingElement) return;
		if (activeIndex == null) {
			forceSyncFocusRef.current = false;
			if (selectedIndexRef.current != null) return;
			if (previousMountedRef.current) {
				indexRef.current = -1;
				focusItem();
			}
			if ((!previousOpenRef.current || !previousMountedRef.current) && focusItemOnOpenRef.current && (keyRef.current != null || focusItemOnOpenRef.current === true && keyRef.current == null)) {
				let runs = 0;
				const waitForListPopulated = () => {
					if (listRef.current[0] == null) {
						if (runs < 2) (runs ? requestAnimationFrame : queueMicrotask)(waitForListPopulated);
						runs += 1;
					} else {
						indexRef.current = keyRef.current == null || isMainOrientationToEndKey(keyRef.current, orientation, rtl) || nested ? getMinListIndex(listRef) : getMaxListIndex(listRef);
						keyRef.current = null;
						onNavigate();
					}
				};
				waitForListPopulated();
			}
		} else if (!isIndexOutOfListBounds(listRef, activeIndex)) {
			indexRef.current = activeIndex;
			focusItem();
			forceScrollIntoViewRef.current = false;
		}
	}, [
		enabled,
		open,
		floatingElement,
		activeIndex,
		selectedIndexRef,
		nested,
		listRef,
		orientation,
		rtl,
		onNavigate,
		focusItem,
		disabledIndicesRef
	]);
	useIsoLayoutEffect(() => {
		if (!enabled || floatingElement || !tree || virtual || !previousMountedRef.current) return;
		const nodes = tree.nodesRef.current;
		const parent = nodes.find((node) => node.id === parentId)?.context?.elements.floating;
		const activeEl = activeElement(getDocument(floatingElement));
		const treeContainsActiveEl = nodes.some((node) => node.context && contains$2(node.context.elements.floating, activeEl));
		if (parent && !treeContainsActiveEl && isPointerModalityRef.current) parent.focus({ preventScroll: true });
	}, [
		enabled,
		floatingElement,
		tree,
		parentId,
		virtual
	]);
	useIsoLayoutEffect(() => {
		previousOnNavigateRef.current = onNavigate;
		previousOpenRef.current = open;
		previousMountedRef.current = !!floatingElement;
	});
	useIsoLayoutEffect(() => {
		if (!open) {
			keyRef.current = null;
			focusItemOnOpenRef.current = focusItemOnOpen;
		}
	}, [open, focusItemOnOpen]);
	const hasActiveIndex = activeIndex != null;
	const item = import_react.useMemo(() => {
		function syncCurrentTarget(event) {
			if (!latestOpenRef.current) return;
			const index = listRef.current.indexOf(event.currentTarget);
			if (index !== -1 && indexRef.current !== index) {
				indexRef.current = index;
				onNavigate(event);
			}
		}
		return {
			onFocus(event) {
				forceSyncFocusRef.current = true;
				syncCurrentTarget(event);
			},
			onClick: ({ currentTarget }) => currentTarget.focus({ preventScroll: true }),
			onMouseMove(event) {
				forceSyncFocusRef.current = true;
				forceScrollIntoViewRef.current = false;
				if (focusItemOnHover) syncCurrentTarget(event);
			},
			onPointerLeave(event) {
				if (!latestOpenRef.current || !isPointerModalityRef.current || event.pointerType === "touch") return;
				forceSyncFocusRef.current = true;
				const relatedTarget = event.relatedTarget;
				if (!focusItemOnHover || listRef.current.includes(relatedTarget)) return;
				if (!resetOnPointerLeaveRef.current) return;
				indexRef.current = -1;
				onNavigate(event);
				if (!virtual) floatingFocusElementRef.current?.focus({ preventScroll: true });
			}
		};
	}, [
		latestOpenRef,
		floatingFocusElementRef,
		focusItemOnHover,
		listRef,
		onNavigate,
		resetOnPointerLeaveRef,
		virtual
	]);
	const getParentOrientation = import_react.useCallback(() => {
		return parentOrientation ?? tree?.nodesRef.current.find((node) => node.id === parentId)?.context?.dataRef?.current.orientation;
	}, [
		parentId,
		tree,
		parentOrientation
	]);
	const commonOnKeyDown = useStableCallback((event) => {
		isPointerModalityRef.current = false;
		forceSyncFocusRef.current = true;
		if (event.which === 229) return;
		if (!latestOpenRef.current && event.currentTarget === floatingFocusElementRef.current) return;
		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, cols)) {
			if (!isMainOrientationKey(event.key, getParentOrientation())) stopEvent(event);
			store.setOpen(false, createChangeEventDetails(listNavigation, event.nativeEvent));
			if (isHTMLElement$1(domReferenceElement)) {
				if (virtual) tree?.events.emit("virtualfocus", domReferenceElement);
				else domReferenceElement.focus();
			}
			return;
		}
		const currentIndex = indexRef.current;
		const minIndex = getMinListIndex(listRef, disabledIndices);
		const maxIndex = getMaxListIndex(listRef, disabledIndices);
		if (!typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				indexRef.current = minIndex;
				onNavigate(event);
			}
			if (event.key === "End") {
				stopEvent(event);
				indexRef.current = maxIndex;
				onNavigate(event);
			}
		}
		if (cols > 1) {
			const sizes = itemSizes || Array.from({ length: listRef.current.length }, () => ({
				width: 1,
				height: 1
			}));
			const cellMap = createGridCellMap(sizes, cols, dense);
			const minGridIndex = cellMap.findIndex((index) => index != null && !isListIndexDisabled(listRef, index, disabledIndices));
			const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(listRef, index, disabledIndices) ? cellIndex : foundIndex, -1);
			const index = cellMap[getGridNavigatedIndex({ current: cellMap.map((itemIndex) => itemIndex != null ? listRef.current[itemIndex] : null) }, {
				event,
				orientation,
				loopFocus,
				rtl,
				cols,
				disabledIndices: getGridCellIndices([...(typeof disabledIndices !== "function" ? disabledIndices : null) || listRef.current.map((_, listIndex) => isListIndexDisabled(listRef, listIndex, disabledIndices) ? listIndex : void 0), void 0], cellMap),
				minIndex: minGridIndex,
				maxIndex: maxGridIndex,
				prevIndex: getGridCellIndexOfCorner(indexRef.current > maxIndex ? minIndex : indexRef.current, sizes, cellMap, cols, event.key === "ArrowDown" ? "bl" : event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? "tr" : "tl"),
				stopEvent: true
			})];
			if (index != null) {
				indexRef.current = index;
				onNavigate(event);
			}
			if (orientation === "both") return;
		}
		if (isMainOrientationKey(event.key, orientation)) {
			stopEvent(event);
			if (open && !virtual && activeElement(event.currentTarget.ownerDocument) === event.currentTarget) {
				indexRef.current = isMainOrientationToEndKey(event.key, orientation, rtl) ? minIndex : maxIndex;
				onNavigate(event);
				return;
			}
			if (isMainOrientationToEndKey(event.key, orientation, rtl)) {
				if (loopFocus) {
					if (currentIndex >= maxIndex) {
						if (allowEscape && currentIndex !== listRef.current.length) indexRef.current = -1;
						else {
							forceSyncFocusRef.current = false;
							indexRef.current = minIndex;
						}
					} else indexRef.current = findNonDisabledListIndex(listRef, {
						startingIndex: currentIndex,
						disabledIndices
					});
				} else indexRef.current = Math.min(maxIndex, findNonDisabledListIndex(listRef, {
					startingIndex: currentIndex,
					disabledIndices
				}));
			} else if (loopFocus) {
				if (currentIndex <= minIndex) {
					if (allowEscape && currentIndex !== -1) indexRef.current = listRef.current.length;
					else {
						forceSyncFocusRef.current = false;
						indexRef.current = maxIndex;
					}
				} else indexRef.current = findNonDisabledListIndex(listRef, {
					startingIndex: currentIndex,
					decrement: true,
					disabledIndices
				});
			} else indexRef.current = Math.max(minIndex, findNonDisabledListIndex(listRef, {
				startingIndex: currentIndex,
				decrement: true,
				disabledIndices
			}));
			if (isIndexOutOfListBounds(listRef, indexRef.current)) indexRef.current = -1;
			onNavigate(event);
		}
	});
	const ariaActiveDescendantProp = import_react.useMemo(() => {
		return virtual && open && hasActiveIndex && { "aria-activedescendant": `${id}-${activeIndex}` };
	}, [
		virtual,
		open,
		hasActiveIndex,
		id,
		activeIndex
	]);
	const floating = import_react.useMemo(() => {
		return {
			"aria-orientation": orientation === "both" ? void 0 : orientation,
			...!typeableComboboxReference ? ariaActiveDescendantProp : {},
			onKeyDown(event) {
				if (event.key === "Tab" && event.shiftKey && open && !virtual) {
					const target = getTarget(event.nativeEvent);
					if (target && !contains$2(floatingFocusElementRef.current, target)) return;
					stopEvent(event);
					store.setOpen(false, createChangeEventDetails(focusOut, event.nativeEvent));
					if (isHTMLElement$1(domReferenceElement)) domReferenceElement.focus();
					return;
				}
				commonOnKeyDown(event);
			},
			onPointerMove() {
				isPointerModalityRef.current = true;
			}
		};
	}, [
		ariaActiveDescendantProp,
		commonOnKeyDown,
		floatingFocusElementRef,
		orientation,
		typeableComboboxReference,
		store,
		open,
		virtual,
		domReferenceElement
	]);
	const trigger = import_react.useMemo(() => {
		function checkVirtualMouse(event) {
			if (focusItemOnOpen === "auto" && isVirtualClick(event.nativeEvent)) focusItemOnOpenRef.current = !virtual;
		}
		function checkVirtualPointer(event) {
			focusItemOnOpenRef.current = focusItemOnOpen;
			if (focusItemOnOpen === "auto" && isVirtualPointerEvent(event.nativeEvent)) focusItemOnOpenRef.current = true;
		}
		return {
			onKeyDown(event) {
				const currentOpen = store.select("open");
				isPointerModalityRef.current = false;
				const isArrowKey = event.key.startsWith("Arrow");
				const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, getParentOrientation(), rtl);
				const isMainKey = isMainOrientationKey(event.key, orientation);
				const isNavigationKey = (nested ? isParentCrossOpenKey : isMainKey) || event.key === "Enter" || event.key.trim() === "";
				if (virtual && currentOpen) return commonOnKeyDown(event);
				if (!currentOpen && !openOnArrowKeyDown && isArrowKey) return;
				if (isNavigationKey) {
					const isParentMainKey = isMainOrientationKey(event.key, getParentOrientation());
					keyRef.current = nested && isParentMainKey ? null : event.key;
				}
				if (nested) {
					if (isParentCrossOpenKey) {
						stopEvent(event);
						if (currentOpen) {
							indexRef.current = getMinListIndex(listRef, disabledIndicesRef.current);
							onNavigate(event);
						} else store.setOpen(true, createChangeEventDetails(listNavigation, event.nativeEvent, event.currentTarget));
					}
					return;
				}
				if (isMainKey) {
					if (selectedIndexRef.current != null) indexRef.current = selectedIndexRef.current;
					stopEvent(event);
					if (!currentOpen && openOnArrowKeyDown) store.setOpen(true, createChangeEventDetails(listNavigation, event.nativeEvent, event.currentTarget));
					else commonOnKeyDown(event);
					if (currentOpen) onNavigate(event);
				}
			},
			onFocus(event) {
				if (store.select("open") && !virtual) {
					indexRef.current = -1;
					onNavigate(event);
				}
			},
			onPointerDown: checkVirtualPointer,
			onPointerEnter: checkVirtualPointer,
			onMouseDown: checkVirtualMouse,
			onClick: checkVirtualMouse
		};
	}, [
		commonOnKeyDown,
		disabledIndicesRef,
		focusItemOnOpen,
		listRef,
		nested,
		onNavigate,
		store,
		openOnArrowKeyDown,
		orientation,
		getParentOrientation,
		rtl,
		selectedIndexRef,
		virtual
	]);
	const reference = import_react.useMemo(() => {
		return {
			...ariaActiveDescendantProp,
			...trigger
		};
	}, [ariaActiveDescendantProp, trigger]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating,
		item,
		trigger
	} : {}, [
		enabled,
		reference,
		floating,
		trigger,
		item
	]);
}
/**
* Provides a matching callback that can be used to focus an item as the user
* types, often used in tandem with `useListNavigation()`.
* @see https://floating-ui.com/docs/useTypeahead
*/
function useTypeahead(context, props) {
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const dataRef = store.context.dataRef;
	const { listRef, activeIndex, onMatch: onMatchProp, onTypingChange, enabled = true, findMatch = null, resetMs = 750, ignoreKeys = EMPTY_ARRAY, selectedIndex = null } = props;
	const timeout = useTimeout();
	const stringRef = import_react.useRef("");
	const prevIndexRef = import_react.useRef(selectedIndex ?? activeIndex ?? -1);
	const matchIndexRef = import_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (open) {
			timeout.clear();
			matchIndexRef.current = null;
			stringRef.current = "";
		}
	}, [open, timeout]);
	useIsoLayoutEffect(() => {
		if (open && stringRef.current === "") prevIndexRef.current = selectedIndex ?? activeIndex ?? -1;
	}, [
		open,
		selectedIndex,
		activeIndex
	]);
	const setTypingChange = useStableCallback((value) => {
		if (value) {
			if (!dataRef.current.typing) {
				dataRef.current.typing = value;
				onTypingChange?.(value);
			}
		} else if (dataRef.current.typing) {
			dataRef.current.typing = value;
			onTypingChange?.(value);
		}
	});
	const onKeyDown = useStableCallback((event) => {
		function getMatchingIndex(list, orderedList, string) {
			const str = findMatch ? findMatch(orderedList, string) : orderedList.find((text) => text?.toLocaleLowerCase().indexOf(string.toLocaleLowerCase()) === 0);
			return str ? list.indexOf(str) : -1;
		}
		const listContent = listRef.current;
		if (stringRef.current.length > 0 && stringRef.current[0] !== " ") {
			if (getMatchingIndex(listContent, listContent, stringRef.current) === -1) setTypingChange(false);
			else if (event.key === " ") stopEvent(event);
		}
		if (listContent == null || ignoreKeys.includes(event.key) || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		if (open && event.key !== " ") {
			stopEvent(event);
			setTypingChange(true);
		}
		if (listContent.every((text) => text ? text[0]?.toLocaleLowerCase() !== text[1]?.toLocaleLowerCase() : true) && stringRef.current === event.key) {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
		}
		stringRef.current += event.key;
		timeout.start(resetMs, () => {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
			setTypingChange(false);
		});
		const prevIndex = prevIndexRef.current;
		const index = getMatchingIndex(listContent, [...listContent.slice((prevIndex || 0) + 1), ...listContent.slice(0, (prevIndex || 0) + 1)], stringRef.current);
		if (index !== -1) {
			onMatchProp?.(index);
			matchIndexRef.current = index;
		} else if (event.key !== " ") {
			stringRef.current = "";
			setTypingChange(false);
		}
	});
	const reference = import_react.useMemo(() => ({ onKeyDown }), [onKeyDown]);
	const floating = import_react.useMemo(() => {
		return {
			onKeyDown,
			onKeyUp(event) {
				if (event.key === " ") setTypingChange(false);
			}
		};
	}, [onKeyDown, setTypingChange]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating
	} : {}, [
		enabled,
		reference,
		floating
	]);
}
/**
* Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
*
* @param open The open state of the component.
*/
function useOpenInteractionType(open) {
	const [openMethod, setOpenMethod] = import_react.useState(null);
	const handleTriggerClick = useStableCallback((_, interactionType) => {
		if (!open) setOpenMethod(interactionType);
	});
	const reset = import_react.useCallback(() => {
		setOpenMethod(null);
	}, []);
	const { onClick, onPointerDown } = useEnhancedClickHandler(handleTriggerClick);
	return import_react.useMemo(() => ({
		openMethod,
		reset,
		triggerProps: {
			onClick,
			onPointerDown
		}
	}), [
		openMethod,
		reset,
		onClick,
		onPointerDown
	]);
}
var CommonPopupDataAttributes = function(CommonPopupDataAttributes) {
	/**
	* Present when the popup is open.
	*/
	CommonPopupDataAttributes["open"] = "data-open";
	/**
	* Present when the popup is closed.
	*/
	CommonPopupDataAttributes["closed"] = "data-closed";
	/**
	* Present when the popup is animating in.
	*/
	CommonPopupDataAttributes[CommonPopupDataAttributes["startingStyle"] = TransitionStatusDataAttributes.startingStyle] = "startingStyle";
	/**
	* Present when the popup is animating out.
	*/
	CommonPopupDataAttributes[CommonPopupDataAttributes["endingStyle"] = TransitionStatusDataAttributes.endingStyle] = "endingStyle";
	/**
	* Present when the anchor is hidden.
	*/
	CommonPopupDataAttributes["anchorHidden"] = "data-anchor-hidden";
	return CommonPopupDataAttributes;
}({});
var CommonTriggerDataAttributes = /*#__PURE__*/ function(CommonTriggerDataAttributes) {
	/**
	* Present when the popup is open.
	*/
	CommonTriggerDataAttributes["popupOpen"] = "data-popup-open";
	/**
	* Present when a pressable trigger is pressed.
	*/
	CommonTriggerDataAttributes["pressed"] = "data-pressed";
	return CommonTriggerDataAttributes;
}({});
CommonTriggerDataAttributes.popupOpen;
var PRESSABLE_TRIGGER_HOOK = {
	[CommonTriggerDataAttributes.popupOpen]: "",
	[CommonTriggerDataAttributes.pressed]: ""
};
var POPUP_OPEN_HOOK = { [CommonPopupDataAttributes.open]: "" };
var POPUP_CLOSED_HOOK = { [CommonPopupDataAttributes.closed]: "" };
var ANCHOR_HIDDEN_HOOK = { [CommonPopupDataAttributes.anchorHidden]: "" };
var pressableTriggerOpenStateMapping = { open(value) {
	if (value) return PRESSABLE_TRIGGER_HOOK;
	return null;
} };
var popupStateMapping = {
	open(value) {
		if (value) return POPUP_OPEN_HOOK;
		return POPUP_CLOSED_HOOK;
	},
	anchorHidden(value) {
		if (value) return ANCHOR_HIDDEN_HOOK;
		return null;
	}
};
/**
* @internal
*/
var InternalBackdrop = /*#__PURE__*/ import_react.forwardRef(function InternalBackdrop(props, ref) {
	const { cutout, ...otherProps } = props;
	let clipPath;
	if (cutout) {
		const rect = cutout?.getBoundingClientRect();
		clipPath = `polygon(
      0% 0%,
      100% 0%,
      100% 100%,
      0% 100%,
      0% 0%,
      ${rect.left}px ${rect.top}px,
      ${rect.left}px ${rect.bottom}px,
      ${rect.right}px ${rect.bottom}px,
      ${rect.right}px ${rect.top}px,
      ${rect.left}px ${rect.top}px
    )`;
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
		ref,
		role: "presentation",
		"data-base-ui-inert": "",
		...otherProps,
		style: {
			position: "fixed",
			inset: 0,
			userSelect: "none",
			WebkitUserSelect: "none",
			clipPath
		}
	});
});
var ComboboxRootContext = /*#__PURE__*/ import_react.createContext(void 0);
var ComboboxFloatingContext = /*#__PURE__*/ import_react.createContext(void 0);
var ComboboxDerivedItemsContext = /*#__PURE__*/ import_react.createContext(void 0);
var ComboboxInputValueContext = /*#__PURE__*/ import_react.createContext("");
function useComboboxRootContext() {
	const context = import_react.useContext(ComboboxRootContext);
	if (!context) throw new Error(formatErrorMessage(22));
	return context;
}
function useComboboxFloatingContext() {
	const context = import_react.useContext(ComboboxFloatingContext);
	if (!context) throw new Error(formatErrorMessage(23));
	return context;
}
function useComboboxDerivedItemsContext() {
	const context = import_react.useContext(ComboboxDerivedItemsContext);
	if (!context) throw new Error(formatErrorMessage(24));
	return context;
}
function useComboboxInputValueContext() {
	return import_react.useContext(ComboboxInputValueContext);
}
var defaultItemEquality = (item, value) => Object.is(item, value);
function compareItemEquality(item, value, comparer) {
	if (item == null || value == null) return Object.is(item, value);
	return comparer(item, value);
}
function itemIncludes(collection, value, comparer) {
	if (!collection || collection.length === 0) return false;
	return collection.some((item) => {
		if (item === void 0) return false;
		return compareItemEquality(item, value, comparer);
	});
}
function findItemIndex(collection, value, comparer) {
	if (!collection || collection.length === 0) return -1;
	return collection.findIndex((item) => {
		if (item === void 0) return false;
		return compareItemEquality(item, value, comparer);
	});
}
function removeItem(collection, value, comparer) {
	return collection.filter((item) => !compareItemEquality(item, value, comparer));
}
var selectors = {
	id: createSelector((state) => state.id),
	query: createSelector((state) => state.query),
	items: createSelector((state) => state.items),
	selectedValue: createSelector((state) => state.selectedValue),
	open: createSelector((state) => state.open),
	mounted: createSelector((state) => state.mounted),
	forceMounted: createSelector((state) => state.forceMounted),
	inline: createSelector((state) => state.inline),
	activeIndex: createSelector((state) => state.activeIndex),
	selectedIndex: createSelector((state) => state.selectedIndex),
	isActive: createSelector((state, index) => state.activeIndex === index),
	isSelected: createSelector((state, candidate) => {
		const comparer = state.isItemEqualToValue;
		const selectedValue = state.selectedValue;
		if (Array.isArray(selectedValue)) return selectedValue.some((value) => compareItemEquality(value, candidate, comparer));
		return compareItemEquality(selectedValue, candidate, comparer);
	}),
	transitionStatus: createSelector((state) => state.transitionStatus),
	popupProps: createSelector((state) => state.popupProps),
	inputProps: createSelector((state) => state.inputProps),
	triggerProps: createSelector((state) => state.triggerProps),
	getItemProps: createSelector((state) => state.getItemProps),
	positionerElement: createSelector((state) => state.positionerElement),
	listElement: createSelector((state) => state.listElement),
	triggerElement: createSelector((state) => state.triggerElement),
	inputElement: createSelector((state) => state.inputElement),
	popupSide: createSelector((state) => state.popupSide),
	openMethod: createSelector((state) => state.openMethod),
	inputInsidePopup: createSelector((state) => state.inputInsidePopup),
	selectionMode: createSelector((state) => state.selectionMode),
	listRef: createSelector((state) => state.listRef),
	labelsRef: createSelector((state) => state.labelsRef),
	popupRef: createSelector((state) => state.popupRef),
	emptyRef: createSelector((state) => state.emptyRef),
	inputRef: createSelector((state) => state.inputRef),
	keyboardActiveRef: createSelector((state) => state.keyboardActiveRef),
	chipsContainerRef: createSelector((state) => state.chipsContainerRef),
	clearRef: createSelector((state) => state.clearRef),
	valuesRef: createSelector((state) => state.valuesRef),
	allValuesRef: createSelector((state) => state.allValuesRef),
	name: createSelector((state) => state.name),
	disabled: createSelector((state) => state.disabled),
	readOnly: createSelector((state) => state.readOnly),
	required: createSelector((state) => state.required),
	grid: createSelector((state) => state.grid),
	isGrouped: createSelector((state) => state.isGrouped),
	virtualized: createSelector((state) => state.virtualized),
	onOpenChangeComplete: createSelector((state) => state.onOpenChangeComplete),
	openOnInputClick: createSelector((state) => state.openOnInputClick),
	itemToStringLabel: createSelector((state) => state.itemToStringLabel),
	isItemEqualToValue: createSelector((state) => state.isItemEqualToValue),
	modal: createSelector((state) => state.modal),
	autoHighlight: createSelector((state) => state.autoHighlight),
	submitOnItemClick: createSelector((state) => state.submitOnItemClick)
};
var FieldControlDataAttributes = /*#__PURE__*/ function(FieldControlDataAttributes) {
	/**
	* Present when the field is disabled.
	*/
	FieldControlDataAttributes["disabled"] = "data-disabled";
	/**
	* Present when the field is in valid state.
	*/
	FieldControlDataAttributes["valid"] = "data-valid";
	/**
	* Present when the field is in invalid state.
	*/
	FieldControlDataAttributes["invalid"] = "data-invalid";
	/**
	* Present when the field has been touched.
	*/
	FieldControlDataAttributes["touched"] = "data-touched";
	/**
	* Present when the field's value has changed.
	*/
	FieldControlDataAttributes["dirty"] = "data-dirty";
	/**
	* Present when the field is filled.
	*/
	FieldControlDataAttributes["filled"] = "data-filled";
	/**
	* Present when the field control is focused.
	*/
	FieldControlDataAttributes["focused"] = "data-focused";
	return FieldControlDataAttributes;
}({});
var DEFAULT_VALIDITY_STATE = {
	badInput: false,
	customError: false,
	patternMismatch: false,
	rangeOverflow: false,
	rangeUnderflow: false,
	stepMismatch: false,
	tooLong: false,
	tooShort: false,
	typeMismatch: false,
	valid: null,
	valueMissing: false
};
var fieldValidityMapping = { valid(value) {
	if (value === null) return null;
	if (value) return { [FieldControlDataAttributes.valid]: "" };
	return { [FieldControlDataAttributes.invalid]: "" };
} };
var FieldRootContext = /*#__PURE__*/ import_react.createContext({
	invalid: void 0,
	name: void 0,
	validityData: {
		state: DEFAULT_VALIDITY_STATE,
		errors: [],
		error: "",
		value: "",
		initialValue: null
	},
	setValidityData: NOOP,
	disabled: void 0,
	touched: false,
	setTouched: NOOP,
	dirty: false,
	setDirty: NOOP,
	filled: false,
	setFilled: NOOP,
	focused: false,
	setFocused: NOOP,
	validate: () => null,
	validationMode: "onSubmit",
	validationDebounceTime: 0,
	shouldValidateOnChange: () => false,
	state: {
		disabled: false,
		valid: null,
		touched: false,
		dirty: false,
		filled: false,
		focused: false
	},
	markedDirtyRef: { current: false },
	validation: {
		getValidationProps: (props = EMPTY_OBJECT) => props,
		getInputValidationProps: (props = EMPTY_OBJECT) => props,
		inputRef: { current: null },
		commit: async () => {}
	}
});
function useFieldRootContext(optional = true) {
	const context = import_react.useContext(FieldRootContext);
	if (context.setValidityData === NOOP && !optional) throw new Error(formatErrorMessage(28));
	return context;
}
/**
* Combines the field's client-side, stateful validity data with the external invalid state to
* determine the field's true validity.
*/
function getCombinedFieldValidityData(validityData, invalid) {
	return {
		...validityData,
		state: {
			...validityData.state,
			valid: !invalid && validityData.state.valid
		}
	};
}
var FormContext = /*#__PURE__*/ import_react.createContext({
	formRef: { current: { fields: /* @__PURE__ */ new Map() } },
	errors: {},
	clearErrors: NOOP,
	validationMode: "onSubmit",
	submitAttemptedRef: { current: false }
});
function useFormContext() {
	return import_react.useContext(FormContext);
}
function useField(params) {
	const { enabled = true, value, id, name, controlRef, commit } = params;
	const { formRef } = useFormContext();
	const { invalid, markedDirtyRef, validityData, setValidityData } = useFieldRootContext();
	const getValue = useStableCallback(params.getValue);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		let initialValue = value;
		if (initialValue === void 0) initialValue = getValue();
		if (validityData.initialValue === null && initialValue !== null) setValidityData((prev) => ({
			...prev,
			initialValue
		}));
	}, [
		enabled,
		setValidityData,
		value,
		validityData.initialValue,
		getValue
	]);
	useIsoLayoutEffect(() => {
		if (!enabled || !id) return;
		formRef.current.fields.set(id, {
			getValue,
			name,
			controlRef,
			validityData: getCombinedFieldValidityData(validityData, invalid),
			validate() {
				let nextValue = value;
				if (nextValue === void 0) nextValue = getValue();
				markedDirtyRef.current = true;
				import_react_dom.flushSync(() => commit(nextValue));
			}
		});
	}, [
		commit,
		controlRef,
		enabled,
		formRef,
		getValue,
		id,
		invalid,
		markedDirtyRef,
		name,
		validityData,
		value
	]);
	useIsoLayoutEffect(() => {
		const fields = formRef.current.fields;
		return () => {
			if (id) fields.delete(id);
		};
	}, [formRef, id]);
}
/**
* A context for providing [labelable elements](https://html.spec.whatwg.org/multipage/forms.html#category-label)\
* with an accessible name (label) and description.
*/
var LabelableContext = /*#__PURE__*/ import_react.createContext({
	controlId: void 0,
	setControlId: NOOP,
	labelId: void 0,
	setLabelId: NOOP,
	messageIds: [],
	setMessageIds: NOOP,
	getDescriptionProps: (externalProps) => externalProps
});
function useLabelableContext() {
	return import_react.useContext(LabelableContext);
}
function useLabelableId(params = {}) {
	const { id, implicit = false, controlRef } = params;
	const { controlId, setControlId } = useLabelableContext();
	const defaultId = useBaseUiId(id);
	useIsoLayoutEffect(() => {
		if (!implicit && !id || setControlId === NOOP) return;
		if (implicit) {
			const elem = controlRef?.current;
			if (isElement(elem) && elem.closest("label") != null) setControlId(id ?? null);
			else setControlId(controlId ?? defaultId);
		} else if (id) setControlId(id);
		return () => {
			if (id) setControlId(void 0);
		};
	}, [
		id,
		controlRef,
		controlId,
		setControlId,
		implicit,
		defaultId
	]);
	return controlId ?? defaultId;
}
function serializeValue(value) {
	if (value == null) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
function isGroupedItems(items) {
	return items != null && items.length > 0 && typeof items[0] === "object" && items[0] != null && "items" in items[0];
}
function stringifyAsLabel(item, itemToStringLabel) {
	if (itemToStringLabel && item != null) return itemToStringLabel(item) ?? "";
	if (item && typeof item === "object") {
		if ("label" in item && item.label != null) return String(item.label);
		if ("value" in item) return String(item.value);
	}
	return serializeValue(item);
}
function stringifyAsValue(item, itemToStringValue) {
	if (itemToStringValue && item != null) return itemToStringValue(item) ?? "";
	if (item && typeof item === "object" && "value" in item && "label" in item) return serializeValue(item.value);
	return serializeValue(item);
}
/**
* Enhanced filter using Intl.Collator for more robust string matching.
* Uses the provided `itemToStringLabel` function if available, otherwise falls back to:
* • When `item` is an object with a `value` property, that property is used.
* • When `item` is a primitive (e.g. `string`), it is used directly.
*/
function createCollatorItemFilter(collatorFilter, itemToStringLabel) {
	return (item, query) => {
		if (item == null) return false;
		const itemString = stringifyAsLabel(item, itemToStringLabel);
		return collatorFilter.contains(itemString, query);
	};
}
/**
* Enhanced filter for single selection mode using Intl.Collator that shows all items
* when query is empty or matches the current selection, making it easier to browse options.
*/
function createSingleSelectionCollatorFilter(collatorFilter, itemToStringLabel, selectedValue) {
	return (item, query) => {
		if (item == null) return false;
		if (!query) return true;
		const itemString = stringifyAsLabel(item, itemToStringLabel);
		const selectedString = selectedValue != null ? stringifyAsLabel(selectedValue, itemToStringLabel) : "";
		if (selectedString && collatorFilter.contains(selectedString, query) && selectedString.length === query.length) return true;
		return collatorFilter.contains(itemString, query);
	};
}
var filterCache = /* @__PURE__ */ new Map();
function stringifyLocale(locale) {
	if (Array.isArray(locale)) return locale.map((value) => stringifyLocale(value)).join(",");
	if (locale == null) return "";
	return String(locale);
}
function getFilter(options = {}) {
	const mergedOptions = {
		usage: "search",
		sensitivity: "base",
		ignorePunctuation: true,
		...options
	};
	const cacheKey = `${stringifyLocale(options.locale)}|${JSON.stringify(mergedOptions)}`;
	const cachedFilter = filterCache.get(cacheKey);
	if (cachedFilter) return cachedFilter;
	const collator = new Intl.Collator(options.locale, mergedOptions);
	const filter = {
		contains(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			for (let i = 0; i <= itemString.length - query.length; i += 1) if (collator.compare(itemString.slice(i, i + query.length), query) === 0) return true;
			return false;
		},
		startsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			return collator.compare(itemString.slice(0, query.length), query) === 0;
		},
		endsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			const queryLength = query.length;
			return itemString.length >= queryLength && collator.compare(itemString.slice(itemString.length - queryLength), query) === 0;
		}
	};
	filterCache.set(cacheKey, filter);
	return filter;
}
/**
* Matches items against a query using `Intl.Collator` for robust string matching.
*/
var useCoreFilter = getFilter;
function useValueChanged(value, onChange) {
	const valueRef = import_react.useRef(value);
	const onChangeCallback = useStableCallback(onChange);
	useIsoLayoutEffect(() => {
		if (valueRef.current === value) return;
		onChangeCallback(valueRef.current);
	}, [value, onChangeCallback]);
	useIsoLayoutEffect(() => {
		valueRef.current = value;
	}, [value]);
}
var NO_ACTIVE_VALUE = Symbol("none");
var INITIAL_LAST_HIGHLIGHT = {
	value: NO_ACTIVE_VALUE,
	index: -1
};
/**
* @internal
*/
function AriaCombobox(props) {
	const { id: idProp, onOpenChangeComplete: onOpenChangeCompleteProp, defaultSelectedValue = null, selectedValue: selectedValueProp, onSelectedValueChange, defaultInputValue: defaultInputValueProp, inputValue: inputValueProp, selectionMode = "none", onItemHighlighted: onItemHighlightedProp, name: nameProp, disabled: disabledProp = false, readOnly = false, required = false, inputRef: inputRefProp, grid = false, items, filteredItems: filteredItemsProp, filter: filterProp, openOnInputClick = true, autoHighlight = false, keepHighlight = false, highlightItemOnHover = true, itemToStringLabel, itemToStringValue, isItemEqualToValue = defaultItemEquality, virtualized = false, inline: inlineProp = false, fillInputOnItemPress = true, modal = false, limit = -1, autoComplete = "list", locale, submitOnItemClick = false } = props;
	const { clearErrors } = useFormContext();
	const { setDirty, validityData, shouldValidateOnChange, setFilled, name: fieldName, disabled: fieldDisabled, validation } = useFieldRootContext();
	const id = useLabelableId({ id: idProp });
	const collatorFilter = useCoreFilter({ locale });
	const [queryChangedAfterOpen, setQueryChangedAfterOpen] = import_react.useState(false);
	const [closeQuery, setCloseQuery] = import_react.useState(null);
	const listRef = import_react.useRef([]);
	const labelsRef = import_react.useRef([]);
	const popupRef = import_react.useRef(null);
	const inputRef = import_react.useRef(null);
	const emptyRef = import_react.useRef(null);
	const keyboardActiveRef = import_react.useRef(true);
	const hadInputClearRef = import_react.useRef(false);
	const chipsContainerRef = import_react.useRef(null);
	const clearRef = import_react.useRef(null);
	const selectionEventRef = import_react.useRef(null);
	const lastHighlightRef = import_react.useRef(INITIAL_LAST_HIGHLIGHT);
	const pendingQueryHighlightRef = import_react.useRef(null);
	/**
	* Contains the currently visible list of item values post-filtering.
	*/
	const valuesRef = import_react.useRef([]);
	/**
	* Contains all item values in a stable, unfiltered order.
	* This is only used when `items` prop is not provided.
	* It accumulates values on first mount and does not remove them on unmount due to
	* filtering, providing a stable index for selected value tracking.
	*/
	const allValuesRef = import_react.useRef([]);
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const multiple = selectionMode === "multiple";
	const single = selectionMode === "single";
	const hasInputValue = inputValueProp !== void 0 || defaultInputValueProp !== void 0;
	const hasItems = items !== void 0;
	const hasFilteredItemsProp = filteredItemsProp !== void 0;
	let autoHighlightMode;
	if (autoHighlight === "always") autoHighlightMode = "always";
	else autoHighlightMode = autoHighlight ? "input-change" : false;
	const [selectedValue, setSelectedValueUnwrapped] = useControlled({
		controlled: selectedValueProp,
		default: multiple ? defaultSelectedValue ?? EMPTY_ARRAY : defaultSelectedValue,
		name: "Combobox",
		state: "selectedValue"
	});
	const filter = import_react.useMemo(() => {
		if (filterProp === null) return () => true;
		if (filterProp !== void 0) return filterProp;
		if (single && !queryChangedAfterOpen) return createSingleSelectionCollatorFilter(collatorFilter, itemToStringLabel, selectedValue);
		return createCollatorItemFilter(collatorFilter, itemToStringLabel);
	}, [
		filterProp,
		single,
		selectedValue,
		queryChangedAfterOpen,
		collatorFilter,
		itemToStringLabel
	]);
	const initialDefaultInputValue = useRefWithInit(() => {
		if (hasInputValue) return defaultInputValueProp ?? "";
		if (single) return stringifyAsLabel(selectedValue, itemToStringLabel);
		return "";
	}).current;
	const [inputValue, setInputValueUnwrapped] = useControlled({
		controlled: inputValueProp,
		default: initialDefaultInputValue,
		name: "Combobox",
		state: "inputValue"
	});
	const [open, setOpenUnwrapped] = useControlled({
		controlled: props.open,
		default: props.defaultOpen,
		name: "Combobox",
		state: "open"
	});
	const isGrouped = isGroupedItems(items);
	const query = closeQuery ?? (inputValue === "" ? "" : String(inputValue).trim());
	const selectedLabelString = single ? stringifyAsLabel(selectedValue, itemToStringLabel) : "";
	const shouldBypassFiltering = single && !queryChangedAfterOpen && query !== "" && selectedLabelString !== "" && selectedLabelString.length === query.length && collatorFilter.contains(selectedLabelString, query);
	const filterQuery = shouldBypassFiltering ? "" : query;
	const shouldIgnoreExternalFiltering = hasItems && hasFilteredItemsProp && shouldBypassFiltering;
	const flatItems = import_react.useMemo(() => {
		if (!items) return EMPTY_ARRAY;
		if (isGrouped) return items.flatMap((group) => group.items);
		return items;
	}, [items, isGrouped]);
	const filteredItems = import_react.useMemo(() => {
		if (filteredItemsProp && !shouldIgnoreExternalFiltering) return filteredItemsProp;
		if (!items) return EMPTY_ARRAY;
		if (isGrouped) {
			const groupedItems = items;
			const resultingGroups = [];
			let currentCount = 0;
			for (const group of groupedItems) {
				if (limit > -1 && currentCount >= limit) break;
				const candidateItems = filterQuery === "" ? group.items : group.items.filter((item) => filter(item, filterQuery, itemToStringLabel));
				if (candidateItems.length === 0) continue;
				const remainingLimit = limit > -1 ? limit - currentCount : Infinity;
				const itemsToTake = candidateItems.slice(0, remainingLimit);
				if (itemsToTake.length > 0) {
					const newGroup = {
						...group,
						items: itemsToTake
					};
					resultingGroups.push(newGroup);
					currentCount += itemsToTake.length;
				}
			}
			return resultingGroups;
		}
		if (filterQuery === "") return limit > -1 ? flatItems.slice(0, limit) : flatItems;
		const limitedItems = [];
		for (const item of flatItems) {
			if (limit > -1 && limitedItems.length >= limit) break;
			if (filter(item, filterQuery, itemToStringLabel)) limitedItems.push(item);
		}
		return limitedItems;
	}, [
		filteredItemsProp,
		shouldIgnoreExternalFiltering,
		items,
		isGrouped,
		filterQuery,
		limit,
		filter,
		itemToStringLabel,
		flatItems
	]);
	const flatFilteredItems = import_react.useMemo(() => {
		if (isGrouped) return filteredItems.flatMap((g) => g.items);
		return filteredItems;
	}, [filteredItems, isGrouped]);
	const store = useRefWithInit(() => new Store({
		id,
		selectedValue,
		open,
		filter,
		query,
		items,
		selectionMode,
		listRef,
		labelsRef,
		popupRef,
		emptyRef,
		inputRef,
		keyboardActiveRef,
		chipsContainerRef,
		clearRef,
		valuesRef,
		allValuesRef,
		selectionEventRef,
		name,
		disabled,
		readOnly,
		required,
		grid,
		isGrouped,
		virtualized,
		openOnInputClick,
		itemToStringLabel,
		isItemEqualToValue,
		modal,
		autoHighlight: autoHighlightMode,
		submitOnItemClick,
		hasInputValue,
		mounted: false,
		forceMounted: false,
		transitionStatus: "idle",
		inline: inlineProp,
		activeIndex: null,
		selectedIndex: null,
		popupProps: {},
		inputProps: {},
		triggerProps: {},
		positionerElement: null,
		listElement: null,
		triggerElement: null,
		inputElement: null,
		popupSide: null,
		openMethod: null,
		inputInsidePopup: true,
		onOpenChangeComplete: onOpenChangeCompleteProp || NOOP,
		setOpen: NOOP,
		setInputValue: NOOP,
		setSelectedValue: NOOP,
		setIndices: NOOP,
		onItemHighlighted: NOOP,
		handleSelection: NOOP,
		getItemProps: () => EMPTY_OBJECT,
		forceMount: NOOP,
		requestSubmit: NOOP
	})).current;
	const formValue = selectionMode === "none" ? inputValue : selectedValue;
	const onItemHighlighted = useStableCallback(onItemHighlightedProp);
	const onOpenChangeComplete = useStableCallback(onOpenChangeCompleteProp);
	const activeIndex = useStore$1(store, selectors.activeIndex);
	const selectedIndex = useStore$1(store, selectors.selectedIndex);
	const positionerElement = useStore$1(store, selectors.positionerElement);
	const listElement = useStore$1(store, selectors.listElement);
	const triggerElement = useStore$1(store, selectors.triggerElement);
	const inputElement = useStore$1(store, selectors.inputElement);
	const inline = useStore$1(store, selectors.inline);
	const inputInsidePopup = useStore$1(store, selectors.inputInsidePopup);
	const triggerRef = useValueAsRef(triggerElement);
	const { mounted, setMounted, transitionStatus } = useTransitionStatus(open);
	const { openMethod, triggerProps, reset: resetOpenInteractionType } = useOpenInteractionType(open);
	useField({
		id,
		name,
		commit: validation.commit,
		value: formValue,
		controlRef: inputInsidePopup ? triggerRef : inputRef,
		getValue: () => formValue
	});
	const forceMount = useStableCallback(() => {
		if (items) labelsRef.current = flatFilteredItems.map((item) => stringifyAsLabel(item, itemToStringLabel));
		else store.set("forceMounted", true);
	});
	const initialSelectedValueRef = import_react.useRef(selectedValue);
	useIsoLayoutEffect(() => {
		if (selectedValue !== initialSelectedValueRef.current) forceMount();
	}, [forceMount, selectedValue]);
	const setIndices = useStableCallback((options) => {
		store.update(options);
		const type = options.type || "none";
		if (options.activeIndex === void 0) return;
		if (options.activeIndex === null) {
			if (lastHighlightRef.current !== INITIAL_LAST_HIGHLIGHT) {
				lastHighlightRef.current = INITIAL_LAST_HIGHLIGHT;
				onItemHighlighted(void 0, createGenericEventDetails(type, void 0, { index: -1 }));
			}
		} else {
			const activeValue = valuesRef.current[options.activeIndex];
			lastHighlightRef.current = {
				value: activeValue,
				index: options.activeIndex
			};
			onItemHighlighted(activeValue, createGenericEventDetails(type, void 0, { index: options.activeIndex }));
		}
	});
	const setInputValue = useStableCallback((next, eventDetails) => {
		hadInputClearRef.current = eventDetails.reason === inputClear;
		props.onInputValueChange?.(next, eventDetails);
		if (eventDetails.isCanceled) return;
		if (eventDetails.reason === "input-change") {
			const hasQuery = next.trim() !== "";
			if (hasQuery) setQueryChangedAfterOpen(true);
			pendingQueryHighlightRef.current = { hasQuery };
			if (hasQuery && autoHighlightMode && store.state.activeIndex == null) store.set("activeIndex", 0);
		}
		setInputValueUnwrapped(next);
	});
	const setOpen = useStableCallback((nextOpen, eventDetails) => {
		if (open === nextOpen) return;
		if (eventDetails.reason === "escape-key" && hasItems && flatFilteredItems.length === 0 && !store.state.emptyRef.current) eventDetails.allowPropagation();
		props.onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		if (!nextOpen && queryChangedAfterOpen) {
			if (single) {
				setCloseQuery(query);
				if (query === "") setQueryChangedAfterOpen(false);
			} else if (multiple) {
				if (inline || inputInsidePopup) setIndices({ activeIndex: null });
				else setCloseQuery(query);
				setInputValue("", createChangeEventDetails(inputClear, eventDetails.event));
			}
		}
		setOpenUnwrapped(nextOpen);
	});
	const setSelectedValue = useStableCallback((nextValue, eventDetails) => {
		onSelectedValueChange?.(nextValue, eventDetails);
		if (eventDetails.isCanceled) return;
		setSelectedValueUnwrapped(nextValue);
		if (selectionMode === "none" && popupRef.current && fillInputOnItemPress || single && !store.state.inputInsidePopup) setInputValue(stringifyAsLabel(nextValue, itemToStringLabel), createChangeEventDetails(eventDetails.reason, eventDetails.event));
		if (single && nextValue != null && eventDetails.reason !== "input-change" && queryChangedAfterOpen) setCloseQuery(query);
	});
	const handleSelection = useStableCallback((event, passedValue) => {
		let value = passedValue;
		if (value === void 0) {
			if (activeIndex === null) return;
			value = valuesRef.current[activeIndex];
		}
		const targetEl = getTarget(event);
		const overrideEvent = selectionEventRef.current ?? event;
		selectionEventRef.current = null;
		const eventDetails = createChangeEventDetails(itemPress, overrideEvent);
		const href = targetEl?.closest("a")?.getAttribute("href");
		if (href) {
			if (href.startsWith("#")) setOpen(false, eventDetails);
			return;
		}
		if (multiple) {
			const currentSelectedValue = Array.isArray(selectedValue) ? selectedValue : [];
			const nextValue = itemIncludes(currentSelectedValue, value, store.state.isItemEqualToValue) ? removeItem(currentSelectedValue, value, store.state.isItemEqualToValue) : [...currentSelectedValue, value];
			setSelectedValue(nextValue, eventDetails);
			if (!(inputRef.current ? inputRef.current.value.trim() !== "" : false)) return;
			if (store.state.inputInsidePopup) setInputValue("", createChangeEventDetails(inputClear, eventDetails.event));
			else setOpen(false, eventDetails);
		} else {
			setSelectedValue(value, eventDetails);
			setOpen(false, eventDetails);
		}
	});
	const requestSubmit = useStableCallback(() => {
		if (!store.state.submitOnItemClick) return;
		const form = store.state.inputElement?.form;
		if (form && typeof form.requestSubmit === "function") form.requestSubmit();
	});
	const handleUnmount = useStableCallback(() => {
		setMounted(false);
		onOpenChangeComplete?.(false);
		setQueryChangedAfterOpen(false);
		resetOpenInteractionType();
		setCloseQuery(null);
		if (selectionMode === "none") setIndices({
			activeIndex: null,
			selectedIndex: null
		});
		else setIndices({ activeIndex: null });
		if (multiple && inputRef.current && inputRef.current.value !== "" && !hadInputClearRef.current) setInputValue("", createChangeEventDetails(inputClear));
		if (single) {
			if (store.state.inputInsidePopup) {
				if (inputRef.current && inputRef.current.value !== "") setInputValue("", createChangeEventDetails(inputClear));
			} else {
				const stringVal = stringifyAsLabel(selectedValue, itemToStringLabel);
				if (inputRef.current && inputRef.current.value !== stringVal) setInputValue(stringVal, createChangeEventDetails(stringVal === "" ? inputClear : none$5));
			}
		}
	});
	const resolvedPopupRef = import_react.useMemo(() => {
		if (inline && positionerElement) return { current: positionerElement.closest("[role=\"dialog\"]") };
		return popupRef;
	}, [inline, positionerElement]);
	useOpenChangeComplete({
		enabled: !props.actionsRef,
		open,
		ref: resolvedPopupRef,
		onComplete() {
			if (!open) handleUnmount();
		}
	});
	import_react.useImperativeHandle(props.actionsRef, () => ({ unmount: handleUnmount }), [handleUnmount]);
	useIsoLayoutEffect(function syncSelectedIndex() {
		if (open || selectionMode === "none") return;
		const registry = items ? flatItems : allValuesRef.current;
		if (multiple) {
			const currentValue = Array.isArray(selectedValue) ? selectedValue : [];
			const lastValue = currentValue[currentValue.length - 1];
			const lastIndex = findItemIndex(registry, lastValue, isItemEqualToValue);
			setIndices({ selectedIndex: lastIndex === -1 ? null : lastIndex });
		} else {
			const index = findItemIndex(registry, selectedValue, isItemEqualToValue);
			setIndices({ selectedIndex: index === -1 ? null : index });
		}
	}, [
		open,
		selectedValue,
		items,
		selectionMode,
		flatItems,
		multiple,
		isItemEqualToValue,
		setIndices
	]);
	useIsoLayoutEffect(() => {
		if (items) {
			valuesRef.current = flatFilteredItems;
			listRef.current.length = flatFilteredItems.length;
		}
	}, [items, flatFilteredItems]);
	useIsoLayoutEffect(() => {
		const pendingHighlight = pendingQueryHighlightRef.current;
		if (pendingHighlight) {
			if (pendingHighlight.hasQuery) {
				if (autoHighlightMode) store.set("activeIndex", 0);
			} else if (autoHighlightMode === "always") store.set("activeIndex", 0);
			pendingQueryHighlightRef.current = null;
		}
		if (!open && !inline) return;
		const candidateItems = hasItems || hasFilteredItemsProp ? flatFilteredItems : valuesRef.current;
		const storeActiveIndex = store.state.activeIndex;
		if (storeActiveIndex == null) {
			if (autoHighlightMode === "always" && candidateItems.length > 0) {
				store.set("activeIndex", 0);
				return;
			}
			if (lastHighlightRef.current !== INITIAL_LAST_HIGHLIGHT) {
				lastHighlightRef.current = INITIAL_LAST_HIGHLIGHT;
				store.state.onItemHighlighted(void 0, createGenericEventDetails(none$5, void 0, { index: -1 }));
			}
			return;
		}
		if (storeActiveIndex >= candidateItems.length) {
			if (lastHighlightRef.current !== INITIAL_LAST_HIGHLIGHT) {
				lastHighlightRef.current = INITIAL_LAST_HIGHLIGHT;
				store.state.onItemHighlighted(void 0, createGenericEventDetails(none$5, void 0, { index: -1 }));
			}
			store.set("activeIndex", null);
			return;
		}
		const nextActiveValue = candidateItems[storeActiveIndex];
		const lastHighlightedValue = lastHighlightRef.current.value;
		const isSameItem = lastHighlightedValue !== NO_ACTIVE_VALUE && store.state.isItemEqualToValue(nextActiveValue, lastHighlightedValue);
		if (lastHighlightRef.current.index !== storeActiveIndex || !isSameItem) {
			lastHighlightRef.current = {
				value: nextActiveValue,
				index: storeActiveIndex
			};
			store.state.onItemHighlighted(nextActiveValue, createGenericEventDetails(none$5, void 0, { index: storeActiveIndex }));
		}
	}, [
		activeIndex,
		autoHighlightMode,
		hasFilteredItemsProp,
		hasItems,
		flatFilteredItems,
		inline,
		open,
		store
	]);
	useIsoLayoutEffect(() => {
		if (!items || selectionMode === "none") return;
		const registry = flatItems;
		if (multiple) {
			const current = Array.isArray(selectedValue) ? selectedValue : EMPTY_ARRAY;
			const next = current.filter((v) => itemIncludes(registry, v, store.state.isItemEqualToValue));
			if (next.length !== current.length) setSelectedValueUnwrapped(next);
			return;
		}
		if (selectedValue == null ? true : itemIncludes(registry, selectedValue, store.state.isItemEqualToValue)) return;
		let fallback = null;
		if (defaultSelectedValue != null && itemIncludes(registry, defaultSelectedValue, store.state.isItemEqualToValue)) fallback = defaultSelectedValue;
		setSelectedValueUnwrapped(fallback);
		if (!store.state.inputInsidePopup) {
			const stringVal = stringifyAsLabel(fallback, itemToStringLabel);
			if (inputRef.current && inputRef.current.value !== stringVal) setInputValue(stringVal, createChangeEventDetails(none$5));
		}
	}, [
		items,
		flatItems,
		multiple,
		selectionMode,
		selectedValue,
		defaultSelectedValue,
		setSelectedValueUnwrapped,
		itemToStringLabel,
		store,
		setInputValue
	]);
	useIsoLayoutEffect(() => {
		if (selectionMode === "none") {
			setFilled(String(inputValue) !== "");
			return;
		}
		setFilled(multiple ? Array.isArray(selectedValue) && selectedValue.length > 0 : selectedValue != null);
	}, [
		setFilled,
		selectionMode,
		inputValue,
		selectedValue,
		multiple
	]);
	import_react.useEffect(() => {
		if (hasItems && autoHighlightMode && flatFilteredItems.length === 0) setIndices({ activeIndex: null });
	}, [
		hasItems,
		autoHighlightMode,
		flatFilteredItems.length,
		setIndices
	]);
	useValueChanged(query, () => {
		if (!open || query === "" || query === String(initialDefaultInputValue)) return;
		setQueryChangedAfterOpen(true);
	});
	useValueChanged(selectedValue, () => {
		if (selectionMode === "none") return;
		clearErrors(name);
		setDirty(selectedValue !== validityData.initialValue);
		if (shouldValidateOnChange()) validation.commit(selectedValue);
		else validation.commit(selectedValue, true);
		if (multiple && store.state.selectedIndex !== null && (!Array.isArray(selectedValue) || selectedValue.length === 0)) setIndices({
			activeIndex: null,
			selectedIndex: null
		});
		if (single && !hasInputValue && !inputInsidePopup) {
			const nextInputValue = stringifyAsLabel(selectedValue, itemToStringLabel);
			if (inputValue !== nextInputValue) setInputValue(nextInputValue, createChangeEventDetails(none$5));
		}
	});
	useValueChanged(inputValue, () => {
		if (selectionMode !== "none") return;
		clearErrors(name);
		setDirty(inputValue !== validityData.initialValue);
		if (shouldValidateOnChange()) validation.commit(inputValue);
		else validation.commit(inputValue, true);
	});
	useValueChanged(items, () => {
		if (!single || hasInputValue || inputInsidePopup || queryChangedAfterOpen) return;
		const nextInputValue = stringifyAsLabel(selectedValue, itemToStringLabel);
		if (inputValue !== nextInputValue) setInputValue(nextInputValue, createChangeEventDetails(none$5));
	});
	const floatingRootContext = useFloatingRootContext({
		open: inline ? true : open,
		onOpenChange: setOpen,
		elements: {
			reference: inputInsidePopup ? triggerElement : inputElement,
			floating: positionerElement
		}
	});
	let ariaHasPopup;
	let ariaExpanded;
	if (!inline) {
		ariaHasPopup = grid ? "grid" : "listbox";
		ariaExpanded = open ? "true" : "false";
	}
	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
		import_react.useMemo(() => {
			const isPlainInput = inputElement?.tagName === "INPUT";
			const shouldApplyAria = isPlainInput || open;
			const reference = isPlainInput ? {
				autoComplete: "off",
				spellCheck: "false",
				autoCorrect: "off",
				autoCapitalize: "none"
			} : {};
			if (shouldApplyAria) {
				reference.role = "combobox";
				reference["aria-expanded"] = ariaExpanded;
				reference["aria-haspopup"] = ariaHasPopup;
				reference["aria-controls"] = open ? listElement?.id : void 0;
				reference["aria-autocomplete"] = autoComplete;
			}
			return {
				reference,
				floating: { role: "presentation" }
			};
		}, [
			inputElement,
			open,
			ariaExpanded,
			ariaHasPopup,
			listElement?.id,
			autoComplete
		]),
		useClick(floatingRootContext, {
			enabled: !readOnly && !disabled && openOnInputClick,
			event: "mousedown-only",
			toggle: false,
			touchOpenDelay: inputInsidePopup ? 0 : 50
		}),
		useDismiss(floatingRootContext, {
			enabled: !readOnly && !disabled && !inline,
			outsidePressEvent: {
				mouse: "sloppy",
				touch: "intentional"
			},
			bubbles: inline ? true : void 0,
			outsidePress(event) {
				const target = getTarget(event);
				return !contains$2(triggerElement, target) && !contains$2(clearRef.current, target) && !contains$2(chipsContainerRef.current, target);
			}
		}),
		useListNavigation(floatingRootContext, {
			enabled: !readOnly && !disabled,
			id,
			listRef,
			activeIndex,
			selectedIndex,
			virtual: true,
			loopFocus: true,
			allowEscape: !autoHighlightMode,
			focusItemOnOpen: queryChangedAfterOpen || selectionMode === "none" && !autoHighlightMode ? false : "auto",
			focusItemOnHover: highlightItemOnHover,
			resetOnPointerLeave: !keepHighlight,
			cols: grid ? 2 : 1,
			orientation: grid ? "horizontal" : void 0,
			disabledIndices: EMPTY_ARRAY,
			onNavigate(nextActiveIndex, event) {
				if (!event && !open || transitionStatus === "ending") return;
				if (!event) setIndices({ activeIndex: nextActiveIndex });
				else setIndices({
					activeIndex: nextActiveIndex,
					type: keyboardActiveRef.current ? "keyboard" : "pointer"
				});
			}
		})
	]);
	useOnFirstRender(() => {
		store.update({
			inline: inlineProp,
			popupProps: getFloatingProps(),
			inputProps: getReferenceProps(),
			triggerProps,
			getItemProps,
			setOpen,
			setInputValue,
			setSelectedValue,
			setIndices,
			onItemHighlighted,
			handleSelection,
			forceMount,
			requestSubmit
		});
	});
	useIsoLayoutEffect(() => {
		store.update({
			id,
			selectedValue,
			open,
			mounted,
			transitionStatus,
			items,
			inline: inlineProp,
			popupProps: getFloatingProps(),
			inputProps: getReferenceProps(),
			triggerProps,
			openMethod,
			getItemProps,
			selectionMode,
			name,
			disabled,
			readOnly,
			required,
			grid,
			isGrouped,
			virtualized,
			onOpenChangeComplete,
			openOnInputClick,
			itemToStringLabel,
			modal,
			autoHighlight: autoHighlightMode,
			isItemEqualToValue,
			submitOnItemClick,
			hasInputValue,
			requestSubmit
		});
	}, [
		store,
		id,
		selectedValue,
		open,
		mounted,
		transitionStatus,
		items,
		getFloatingProps,
		getReferenceProps,
		getItemProps,
		openMethod,
		triggerProps,
		selectionMode,
		name,
		disabled,
		readOnly,
		required,
		validation,
		grid,
		isGrouped,
		virtualized,
		onOpenChangeComplete,
		openOnInputClick,
		itemToStringLabel,
		modal,
		isItemEqualToValue,
		submitOnItemClick,
		hasInputValue,
		inlineProp,
		requestSubmit,
		autoHighlightMode
	]);
	const hiddenInputRef = useMergedRefs(inputRefProp, validation.inputRef);
	const itemsContextValue = import_react.useMemo(() => ({
		query,
		filteredItems,
		flatFilteredItems
	}), [
		query,
		filteredItems,
		flatFilteredItems
	]);
	const serializedValue = import_react.useMemo(() => {
		if (Array.isArray(formValue)) return "";
		return stringifyAsValue(formValue, itemToStringValue);
	}, [formValue, itemToStringValue]);
	const hasMultipleSelection = multiple && Array.isArray(selectedValue) && selectedValue.length > 0;
	const hiddenInputs = import_react.useMemo(() => {
		if (!multiple || !Array.isArray(selectedValue) || !name) return null;
		return selectedValue.map((value) => {
			const currentSerializedValue = stringifyAsValue(value, itemToStringValue);
			return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name,
				value: currentSerializedValue
			}, currentSerializedValue);
		});
	}, [
		multiple,
		selectedValue,
		name,
		itemToStringValue
	]);
	const children = /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		props.children,
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
			...validation.getInputValidationProps({
				onFocus() {
					if (inputInsidePopup) {
						triggerElement?.focus();
						return;
					}
					(inputRef.current || triggerElement)?.focus();
				},
				onChange(event) {
					if (event.nativeEvent.defaultPrevented) return;
					const nextValue = event.target.value;
					const details = createChangeEventDetails(inputChange, event.nativeEvent);
					function handleChange() {
						if (multiple) return;
						if (selectionMode === "none") {
							setDirty(nextValue !== validityData.initialValue);
							setInputValue(nextValue, details);
							if (shouldValidateOnChange()) validation.commit(nextValue);
							return;
						}
						const matchingValue = valuesRef.current.find((v) => {
							if (stringifyAsValue(v, itemToStringValue).toLowerCase() === nextValue.toLowerCase()) return true;
							return false;
						});
						if (matchingValue != null) {
							setDirty(matchingValue !== validityData.initialValue);
							setSelectedValue?.(matchingValue, details);
							if (shouldValidateOnChange()) validation.commit(matchingValue);
						}
					}
					if (items) handleChange();
					else {
						forceMount();
						queueMicrotask(handleChange);
					}
				}
			}),
			id,
			name: multiple || selectionMode === "none" ? void 0 : name,
			disabled,
			required: required && !hasMultipleSelection,
			readOnly,
			value: serializedValue,
			ref: hiddenInputRef,
			style: visuallyHidden,
			tabIndex: -1,
			"aria-hidden": true
		}),
		hiddenInputs
	] });
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxRootContext.Provider, {
		value: store,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxFloatingContext.Provider, {
			value: floatingRootContext,
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxDerivedItemsContext.Provider, {
				value: itemsContextValue,
				children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxInputValueContext.Provider, {
					value: inputValue,
					children
				})
			})
		})
	});
}
function getPseudoElementBounds(element) {
	const elementRect = element.getBoundingClientRect();
	const beforeStyles = window.getComputedStyle(element, "::before");
	const afterStyles = window.getComputedStyle(element, "::after");
	if (!(beforeStyles.content !== "none" || afterStyles.content !== "none")) return elementRect;
	const beforeWidth = parseFloat(beforeStyles.width) || 0;
	const beforeHeight = parseFloat(beforeStyles.height) || 0;
	const afterWidth = parseFloat(afterStyles.width) || 0;
	const afterHeight = parseFloat(afterStyles.height) || 0;
	const totalWidth = Math.max(elementRect.width, beforeWidth, afterWidth);
	const totalHeight = Math.max(elementRect.height, beforeHeight, afterHeight);
	const widthDiff = totalWidth - elementRect.width;
	const heightDiff = totalHeight - elementRect.height;
	return {
		left: elementRect.left - widthDiff / 2,
		right: elementRect.right + widthDiff / 2,
		top: elementRect.top - heightDiff / 2,
		bottom: elementRect.bottom + heightDiff / 2
	};
}
var BOUNDARY_OFFSET = 2;
var stateAttributesMapping$2 = {
	...pressableTriggerOpenStateMapping,
	...fieldValidityMapping
};
/**
* A button that opens the popup.
* Renders a `<button>` element.
*/
var ComboboxTrigger$1 = /*#__PURE__*/ import_react.forwardRef(function ComboboxTrigger(componentProps, forwardedRef) {
	const { render, className, nativeButton = true, disabled: disabledProp = false, ...elementProps } = componentProps;
	const { state: fieldState, disabled: fieldDisabled, setTouched, setFocused, validationMode, validation } = useFieldRootContext();
	const { labelId } = useLabelableContext();
	const store = useComboboxRootContext();
	const selectionMode = useStore$1(store, selectors.selectionMode);
	const comboboxDisabled = useStore$1(store, selectors.disabled);
	const readOnly = useStore$1(store, selectors.readOnly);
	const listElement = useStore$1(store, selectors.listElement);
	const triggerProps = useStore$1(store, selectors.triggerProps);
	const triggerElement = useStore$1(store, selectors.triggerElement);
	const inputInsidePopup = useStore$1(store, selectors.inputInsidePopup);
	const open = useStore$1(store, selectors.open);
	const selectedValue = useStore$1(store, selectors.selectedValue);
	const activeIndex = useStore$1(store, selectors.activeIndex);
	const selectedIndex = useStore$1(store, selectors.selectedIndex);
	const floatingRootContext = useComboboxFloatingContext();
	const inputValue = useComboboxInputValueContext();
	const focusTimeout = useTimeout();
	const disabled = fieldDisabled || comboboxDisabled || disabledProp;
	const currentPointerTypeRef = import_react.useRef("");
	function trackPointerType(event) {
		currentPointerTypeRef.current = event.pointerType;
	}
	const domReference = floatingRootContext.select("domReferenceElement");
	import_react.useEffect(() => {
		if (!inputInsidePopup) return;
		if (triggerElement && triggerElement !== domReference) floatingRootContext.set("domReferenceElement", triggerElement);
	}, [
		triggerElement,
		domReference,
		floatingRootContext,
		inputInsidePopup
	]);
	const { reference: triggerTypeaheadProps } = useTypeahead(floatingRootContext, {
		enabled: !open && !readOnly && !comboboxDisabled && selectionMode === "single",
		listRef: store.state.labelsRef,
		activeIndex,
		selectedIndex,
		onMatch(index) {
			const nextSelectedValue = store.state.valuesRef.current[index];
			if (nextSelectedValue !== void 0) store.state.setSelectedValue(nextSelectedValue, createChangeEventDetails("none"));
		}
	});
	const { reference: triggerClickProps } = useClick(floatingRootContext, {
		enabled: !readOnly && !comboboxDisabled,
		event: "mousedown"
	});
	const { buttonRef, getButtonProps } = useButton({
		native: nativeButton,
		disabled
	});
	const state = import_react.useMemo(() => ({
		...fieldState,
		open,
		disabled
	}), [
		fieldState,
		open,
		disabled
	]);
	return useRenderElement("button", componentProps, {
		ref: [
			forwardedRef,
			buttonRef,
			useStableCallback((element) => {
				store.set("triggerElement", element);
			})
		],
		state,
		props: [
			triggerProps,
			triggerClickProps,
			triggerTypeaheadProps,
			{
				tabIndex: inputInsidePopup ? 0 : -1,
				disabled,
				role: inputInsidePopup ? "combobox" : void 0,
				"aria-expanded": open ? "true" : "false",
				"aria-haspopup": inputInsidePopup ? "dialog" : "listbox",
				"aria-controls": open ? listElement?.id : void 0,
				"aria-readonly": readOnly || void 0,
				"aria-labelledby": labelId,
				onPointerDown: trackPointerType,
				onPointerEnter: trackPointerType,
				onFocus() {
					setFocused(true);
					if (disabled || readOnly) return;
					focusTimeout.start(0, store.state.forceMount);
				},
				onBlur() {
					setTouched(true);
					setFocused(false);
					if (validationMode === "onBlur") {
						const valueToValidate = selectionMode === "none" ? inputValue : selectedValue;
						validation.commit(valueToValidate);
					}
				},
				onMouseDown(event) {
					if (disabled || readOnly) return;
					if (!inputInsidePopup) floatingRootContext.set("domReferenceElement", event.currentTarget);
					store.state.forceMount();
					if (currentPointerTypeRef.current !== "touch") {
						store.state.inputRef.current?.focus();
						if (!inputInsidePopup) event.preventDefault();
					}
					if (open) return;
					const doc = ownerDocument(event.currentTarget);
					function handleMouseUp(mouseEvent) {
						if (!triggerElement) return;
						const mouseUpTarget = getTarget(mouseEvent);
						const positioner = store.state.positionerElement;
						const list = store.state.listElement;
						if (contains$2(triggerElement, mouseUpTarget) || contains$2(positioner, mouseUpTarget) || contains$2(list, mouseUpTarget) || mouseUpTarget === triggerElement) return;
						const bounds = getPseudoElementBounds(triggerElement);
						const withinHorizontal = mouseEvent.clientX >= bounds.left - BOUNDARY_OFFSET && mouseEvent.clientX <= bounds.right + BOUNDARY_OFFSET;
						const withinVertical = mouseEvent.clientY >= bounds.top - BOUNDARY_OFFSET && mouseEvent.clientY <= bounds.bottom + BOUNDARY_OFFSET;
						if (withinHorizontal && withinVertical) return;
						store.state.setOpen(false, createChangeEventDetails("cancel-open", mouseEvent));
					}
					if (inputInsidePopup) doc.addEventListener("mouseup", handleMouseUp, { once: true });
				},
				onKeyDown(event) {
					if (disabled || readOnly) return;
					if (event.key === "ArrowDown" || event.key === "ArrowUp") {
						stopEvent(event);
						store.state.setOpen(true, createChangeEventDetails(listNavigation, event.nativeEvent));
						store.state.inputRef.current?.focus();
					}
				}
			},
			validation ? validation.getValidationProps(elementProps) : elementProps,
			getButtonProps
		],
		stateAttributesMapping: stateAttributesMapping$2
	});
});
var ComboboxChipsContext = /*#__PURE__*/ import_react.createContext(void 0);
function useComboboxChipsContext() {
	return import_react.useContext(ComboboxChipsContext);
}
var ComboboxPositionerContext = /*#__PURE__*/ import_react.createContext(void 0);
function useComboboxPositionerContext(optional) {
	const context = import_react.useContext(ComboboxPositionerContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(21));
	return context;
}
var stateAttributesMapping$1 = {
	...pressableTriggerOpenStateMapping,
	...fieldValidityMapping,
	popupSide: (side) => side ? { "data-popup-side": side } : null,
	listEmpty: (empty) => empty ? { "data-list-empty": "" } : null
};
/**
* A text input to search for items in the list.
* Renders an `<input>` element.
*/
var ComboboxInput$1 = /*#__PURE__*/ import_react.forwardRef(function ComboboxInput(componentProps, forwardedRef) {
	const { render, className, disabled: disabledProp = false, id: idProp, ...elementProps } = componentProps;
	const { state: fieldState, disabled: fieldDisabled, setTouched, setFocused, validationMode, validation } = useFieldRootContext();
	const { labelId } = useLabelableContext();
	const comboboxChipsContext = useComboboxChipsContext();
	const positioning = useComboboxPositionerContext(true);
	const hasPositionerParent = Boolean(positioning);
	const store = useComboboxRootContext();
	const { filteredItems } = useComboboxDerivedItemsContext();
	const inputValue = useComboboxInputValueContext();
	const id = useBaseUiId(idProp);
	const direction = useDirection();
	const comboboxDisabled = useStore$1(store, selectors.disabled);
	const readOnly = useStore$1(store, selectors.readOnly);
	const name = useStore$1(store, selectors.name);
	const selectionMode = useStore$1(store, selectors.selectionMode);
	const autoHighlightMode = useStore$1(store, selectors.autoHighlight);
	const inputProps = useStore$1(store, selectors.inputProps);
	const triggerProps = useStore$1(store, selectors.triggerProps);
	const open = useStore$1(store, selectors.open);
	const mounted = useStore$1(store, selectors.mounted);
	const selectedValue = useStore$1(store, selectors.selectedValue);
	const popupSideValue = useStore$1(store, selectors.popupSide);
	const positionerElement = useStore$1(store, selectors.positionerElement);
	const autoHighlightEnabled = Boolean(autoHighlightMode);
	const popupSide = mounted && positionerElement ? popupSideValue : null;
	const disabled = fieldDisabled || comboboxDisabled || disabledProp;
	const listEmpty = filteredItems.length === 0;
	const [composingValue, setComposingValue] = import_react.useState(null);
	const isComposingRef = import_react.useRef(false);
	const setInputElement = useStableCallback((element) => {
		const isInsidePopup = hasPositionerParent || store.state.inline;
		if (isInsidePopup && !store.state.hasInputValue) store.state.setInputValue("", createChangeEventDetails(none$5));
		store.update({
			inputElement: element,
			inputInsidePopup: isInsidePopup
		});
	});
	const state = import_react.useMemo(() => ({
		...fieldState,
		open,
		disabled,
		readOnly,
		popupSide,
		listEmpty
	}), [
		fieldState,
		open,
		disabled,
		readOnly,
		popupSide,
		listEmpty
	]);
	function handleKeyDown(event) {
		if (!comboboxChipsContext) return;
		let nextIndex;
		const { highlightedChipIndex } = comboboxChipsContext;
		if (highlightedChipIndex !== void 0) {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				if (highlightedChipIndex > 0) nextIndex = highlightedChipIndex - 1;
				else nextIndex = void 0;
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				if (highlightedChipIndex < selectedValue.length - 1) nextIndex = highlightedChipIndex + 1;
				else nextIndex = void 0;
			} else if (event.key === "Backspace" || event.key === "Delete") {
				event.preventDefault();
				const computedNextIndex = highlightedChipIndex >= selectedValue.length - 1 ? selectedValue.length - 2 : highlightedChipIndex;
				nextIndex = computedNextIndex >= 0 ? computedNextIndex : void 0;
				store.state.setIndices({
					activeIndex: null,
					selectedIndex: null,
					type: "keyboard"
				});
			}
			return nextIndex;
		}
		if (event.key === "ArrowLeft" && (event.currentTarget.selectionStart ?? 0) === 0 && selectedValue.length > 0) {
			event.preventDefault();
			nextIndex = Math.max(selectedValue.length - 1, 0);
		} else if (event.key === "Backspace" && event.currentTarget.value === "" && selectedValue.length > 0) {
			store.state.setIndices({
				activeIndex: null,
				selectedIndex: null,
				type: "keyboard"
			});
			event.preventDefault();
		}
		return nextIndex;
	}
	return useRenderElement("input", componentProps, {
		state,
		ref: [
			forwardedRef,
			store.state.inputRef,
			setInputElement
		],
		props: [
			inputProps,
			triggerProps,
			{
				type: "text",
				value: componentProps.value ?? composingValue ?? inputValue,
				"aria-readonly": readOnly || void 0,
				"aria-labelledby": labelId,
				disabled,
				readOnly,
				...selectionMode === "none" && name && { name },
				id,
				onFocus() {
					setFocused(true);
				},
				onBlur() {
					setTouched(true);
					setFocused(false);
					if (validationMode === "onBlur") {
						const valueToValidate = selectionMode === "none" ? inputValue : selectedValue;
						validation.commit(valueToValidate);
					}
				},
				onCompositionStart(event) {
					if (isAndroid$1) return;
					isComposingRef.current = true;
					setComposingValue(event.currentTarget.value);
				},
				onCompositionEnd(event) {
					isComposingRef.current = false;
					const next = event.currentTarget.value;
					setComposingValue(null);
					store.state.setInputValue(next, createChangeEventDetails(inputChange, event.nativeEvent));
				},
				onChange(event) {
					if (isComposingRef.current) {
						const nextVal = event.currentTarget.value;
						setComposingValue(nextVal);
						if (nextVal === "" && !store.state.openOnInputClick && !store.state.inputInsidePopup) store.state.setOpen(false, createChangeEventDetails(inputClear, event.nativeEvent));
						const trimmed = nextVal.trim();
						const shouldMaintainHighlight = autoHighlightEnabled && trimmed !== "";
						if (!readOnly && !disabled) {
							if (trimmed !== "") {
								store.state.setOpen(true, createChangeEventDetails(inputChange, event.nativeEvent));
								if (!autoHighlightEnabled) store.state.setIndices({
									activeIndex: null,
									selectedIndex: null,
									type: store.state.keyboardActiveRef.current ? "keyboard" : "pointer"
								});
							}
						}
						if (open && store.state.activeIndex !== null && !shouldMaintainHighlight) store.state.setIndices({
							activeIndex: null,
							selectedIndex: null,
							type: store.state.keyboardActiveRef.current ? "keyboard" : "pointer"
						});
						return;
					}
					store.state.setInputValue(event.currentTarget.value, createChangeEventDetails(inputChange, event.nativeEvent));
					const empty = event.currentTarget.value === "";
					const clearDetails = createChangeEventDetails(inputClear, event.nativeEvent);
					if (empty && !store.state.inputInsidePopup) {
						if (selectionMode === "single") store.state.setSelectedValue(null, clearDetails);
						if (!store.state.openOnInputClick) store.state.setOpen(false, clearDetails);
					}
					const trimmed = event.currentTarget.value.trim();
					if (!readOnly && !disabled) {
						if (trimmed !== "") {
							store.state.setOpen(true, createChangeEventDetails(inputChange, event.nativeEvent));
							if (!autoHighlightEnabled) store.state.setIndices({
								activeIndex: null,
								selectedIndex: null,
								type: store.state.keyboardActiveRef.current ? "keyboard" : "pointer"
							});
						}
					}
					if (open && store.state.activeIndex !== null && !autoHighlightEnabled) store.state.setIndices({
						activeIndex: null,
						selectedIndex: null,
						type: store.state.keyboardActiveRef.current ? "keyboard" : "pointer"
					});
				},
				onKeyDown(event) {
					if (disabled || readOnly) return;
					if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
					store.state.keyboardActiveRef.current = true;
					const input = event.currentTarget;
					const scrollAmount = input.scrollWidth - input.clientWidth;
					const isRTL = direction === "rtl";
					if (event.key === "Home") {
						stopEvent(event);
						const cursor = isFirefox && isRTL ? input.value.length : 0;
						input.setSelectionRange(cursor, cursor);
						input.scrollLeft = 0;
						return;
					}
					if (event.key === "End") {
						stopEvent(event);
						const cursor = isFirefox && isRTL ? 0 : input.value.length;
						input.setSelectionRange(cursor, cursor);
						input.scrollLeft = isRTL ? -scrollAmount : scrollAmount;
						return;
					}
					if (!mounted && event.key === "Escape") {
						const isClear = selectionMode === "multiple" && Array.isArray(selectedValue) ? selectedValue.length === 0 : selectedValue === null;
						const details = createChangeEventDetails(escapeKey, event.nativeEvent);
						const value = selectionMode === "multiple" ? [] : null;
						store.state.setInputValue("", details);
						store.state.setSelectedValue(value, details);
						if (!isClear && !store.state.inline && !details.isPropagationAllowed) event.stopPropagation();
						return;
					}
					if (comboboxChipsContext && event.key === "Backspace" && input.value === "" && comboboxChipsContext.highlightedChipIndex === void 0 && Array.isArray(selectedValue) && selectedValue.length > 0) {
						const newValue = selectedValue.slice(0, -1);
						store.state.setIndices({
							activeIndex: null,
							selectedIndex: null,
							type: store.state.keyboardActiveRef.current ? "keyboard" : "pointer"
						});
						store.state.setSelectedValue(newValue, createChangeEventDetails(none$5, event.nativeEvent));
						return;
					}
					const nextIndex = handleKeyDown(event);
					comboboxChipsContext?.setHighlightedChipIndex(nextIndex);
					if (nextIndex !== void 0) comboboxChipsContext?.chipsRef.current[nextIndex]?.focus();
					else store.state.inputRef.current?.focus();
					if (event.which === 229) return;
					if (event.key === "Enter" && open) {
						const activeIndex = store.state.activeIndex;
						const nativeEvent = event.nativeEvent;
						if (activeIndex === null) {
							store.state.setOpen(false, createChangeEventDetails(none$5, nativeEvent));
							return;
						}
						stopEvent(event);
						const listItem = store.state.listRef.current[activeIndex];
						if (listItem) {
							store.state.selectionEventRef.current = nativeEvent;
							listItem.click();
							store.state.selectionEventRef.current = null;
						}
					}
				},
				onPointerMove() {
					store.state.keyboardActiveRef.current = false;
				},
				onPointerDown() {
					store.state.keyboardActiveRef.current = false;
				}
			},
			validation ? validation.getValidationProps(elementProps) : elementProps
		],
		stateAttributesMapping: stateAttributesMapping$1
	});
});
var GroupCollectionContext = /*#__PURE__*/ import_react.createContext(null);
function useGroupCollectionContext() {
	return import_react.useContext(GroupCollectionContext);
}
/**
* Renders filtered list items.
* Doesn't render its own HTML element.
*
* If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.
*/
function ComboboxCollection(props) {
	const { children } = props;
	const { filteredItems } = useComboboxDerivedItemsContext();
	const groupContext = useGroupCollectionContext();
	const itemsToRender = groupContext ? groupContext.items : filteredItems;
	if (!itemsToRender) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: itemsToRender.map(children) });
}
/**
* A list container for the items.
* Renders a `<div>` element.
*/
var ComboboxList$1 = /*#__PURE__*/ import_react.forwardRef(function ComboboxList(componentProps, forwardedRef) {
	var _ComboboxCollection;
	const { render, className, children, ...elementProps } = componentProps;
	const store = useComboboxRootContext();
	const floatingRootContext = useComboboxFloatingContext();
	const hasPositionerContext = Boolean(useComboboxPositionerContext(true));
	const { filteredItems } = useComboboxDerivedItemsContext();
	const items = useStore$1(store, selectors.items);
	const labelsRef = useStore$1(store, selectors.labelsRef);
	const listRef = useStore$1(store, selectors.listRef);
	const selectionMode = useStore$1(store, selectors.selectionMode);
	const grid = useStore$1(store, selectors.grid);
	const popupProps = useStore$1(store, selectors.popupProps);
	const disabled = useStore$1(store, selectors.disabled);
	const readOnly = useStore$1(store, selectors.readOnly);
	const virtualized = useStore$1(store, selectors.virtualized);
	const multiple = selectionMode === "multiple";
	const empty = filteredItems.length === 0;
	const setPositionerElement = useStableCallback((element) => {
		store.set("positionerElement", element);
	});
	const setListElement = useStableCallback((element) => {
		store.set("listElement", element);
	});
	const resolvedChildren = import_react.useMemo(() => {
		if (typeof children === "function") return _ComboboxCollection || (_ComboboxCollection = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxCollection, { children }));
		return children;
	}, [children]);
	const state = import_react.useMemo(() => ({ empty }), [empty]);
	const floatingId = floatingRootContext.useState("floatingId");
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [
			forwardedRef,
			setListElement,
			hasPositionerContext ? null : setPositionerElement
		],
		props: [
			popupProps,
			{
				children: resolvedChildren,
				tabIndex: -1,
				id: floatingId,
				role: grid ? "grid" : "listbox",
				"aria-multiselectable": multiple ? "true" : void 0,
				onKeyDown(event) {
					if (disabled || readOnly) return;
					if (event.key === "Enter") {
						const activeIndex = store.state.activeIndex;
						if (activeIndex == null) return;
						stopEvent(event);
						const nativeEvent = event.nativeEvent;
						const listItem = store.state.listRef.current[activeIndex];
						if (listItem) {
							store.state.selectionEventRef.current = nativeEvent;
							listItem.click();
							store.state.selectionEventRef.current = null;
						}
					}
				},
				onKeyDownCapture() {
					store.state.keyboardActiveRef.current = true;
				},
				onPointerMoveCapture() {
					store.state.keyboardActiveRef.current = false;
				}
			},
			elementProps
		]
	});
	if (virtualized) return element;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
		elementsRef: listRef,
		labelsRef: items ? void 0 : labelsRef,
		children: element
	});
});
var ComboboxPortalContext = /*#__PURE__*/ import_react.createContext(void 0);
function useComboboxPortalContext() {
	const context = import_react.useContext(ComboboxPortalContext);
	if (context === void 0) throw new Error(formatErrorMessage(20));
	return context;
}
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*/
var ComboboxPortal = /*#__PURE__*/ import_react.forwardRef(function ComboboxPortal(props, forwardedRef) {
	const { keepMounted = false, ...portalProps } = props;
	const store = useComboboxRootContext();
	const mounted = useStore$1(store, selectors.mounted);
	const forceMounted = useStore$1(store, selectors.forceMounted);
	if (!(mounted || keepMounted || forceMounted)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxPortalContext.Provider, {
		value: keepMounted,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingPortal, {
			ref: forwardedRef,
			...portalProps
		})
	});
});
/**
* Fork of the original `arrow` middleware from Floating UI that allows
* configuring the offset parent.
*/
var baseArrow = (options) => ({
	name: "arrow",
	options,
	async fn(state) {
		const { x, y, placement, rects, platform, elements, middlewareData } = state;
		const { element, padding = 0, offsetParent = "real" } = evaluate(options, state) || {};
		if (element == null) return {};
		const paddingObject = getPaddingObject(padding);
		const coords = {
			x,
			y
		};
		const axis = getAlignmentAxis(placement);
		const length = getAxisLength(axis);
		const arrowDimensions = await platform.getDimensions(element);
		const isYAxis = axis === "y";
		const minProp = isYAxis ? "top" : "left";
		const maxProp = isYAxis ? "bottom" : "right";
		const clientProp = isYAxis ? "clientHeight" : "clientWidth";
		const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
		const startDiff = coords[axis] - rects.reference[axis];
		const arrowOffsetParent = offsetParent === "real" ? await platform.getOffsetParent?.(element) : elements.floating;
		let clientSize = elements.floating[clientProp] || rects.floating[length];
		if (!clientSize || !await platform.isElement?.(arrowOffsetParent)) clientSize = elements.floating[clientProp] || rects.floating[length];
		const centerToReference = endDiff / 2 - startDiff / 2;
		const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
		const minPadding = Math.min(paddingObject[minProp], largestPossiblePadding);
		const maxPadding = Math.min(paddingObject[maxProp], largestPossiblePadding);
		const min = minPadding;
		const max = clientSize - arrowDimensions[length] - maxPadding;
		const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
		const offset = clamp$5(min, center, max);
		const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
		const alignmentOffset = shouldAddOffset ? center < min ? center - min : center - max : 0;
		return {
			[axis]: coords[axis] + alignmentOffset,
			data: {
				[axis]: offset,
				centerOffset: center - offset - alignmentOffset,
				...shouldAddOffset && { alignmentOffset }
			},
			reset: shouldAddOffset
		};
	}
});
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* This wraps the core `arrow` middleware to allow React refs as the element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$1 = (options, deps) => ({
	...baseArrow(options),
	options: [options, deps]
});
var hide = {
	name: "hide",
	async fn(state) {
		const { width, height, x, y } = state.rects.reference;
		const anchorHidden = width === 0 && height === 0 && x === 0 && y === 0;
		return { data: { referenceHidden: (await hide$1().fn(state)).data?.referenceHidden || anchorHidden } };
	}
};
var DEFAULT_SIDES = {
	sideX: "left",
	sideY: "top"
};
function getLogicalSide(sideParam, renderedSide, isRtl) {
	const isLogicalSideParam = sideParam === "inline-start" || sideParam === "inline-end";
	return {
		top: "top",
		right: isLogicalSideParam ? isRtl ? "inline-start" : "inline-end" : "right",
		bottom: "bottom",
		left: isLogicalSideParam ? isRtl ? "inline-end" : "inline-start" : "left"
	}[renderedSide];
}
function getOffsetData(state, sideParam, isRtl) {
	const { rects, placement } = state;
	return {
		side: getLogicalSide(sideParam, getSide$1(placement), isRtl),
		align: getAlignment(placement) || "center",
		anchor: {
			width: rects.reference.width,
			height: rects.reference.height
		},
		positioner: {
			width: rects.floating.width,
			height: rects.floating.height
		}
	};
}
/**
* Provides standardized anchor positioning behavior for floating elements. Wraps Floating UI's
* `useFloating` hook.
*/
function useAnchorPositioning(params) {
	const { anchor, positionMethod = "absolute", side: sideParam = "bottom", sideOffset = 0, align = "center", alignOffset = 0, collisionBoundary, collisionPadding: collisionPaddingParam = 5, sticky = false, arrowPadding = 5, disableAnchorTracking = false, keepMounted = false, floatingRootContext, mounted, collisionAvoidance, shiftCrossAxis = false, nodeId, adaptiveOrigin, lazyFlip = false, externalTree } = params;
	const [mountSide, setMountSide] = import_react.useState(null);
	if (!mounted && mountSide !== null) setMountSide(null);
	const collisionAvoidanceSide = collisionAvoidance.side || "flip";
	const collisionAvoidanceAlign = collisionAvoidance.align || "flip";
	const collisionAvoidanceFallbackAxisSide = collisionAvoidance.fallbackAxisSide || "end";
	const anchorFn = typeof anchor === "function" ? anchor : void 0;
	const anchorFnCallback = useStableCallback(anchorFn);
	const anchorDep = anchorFn ? anchorFnCallback : anchor;
	const anchorValueRef = useValueAsRef(anchor);
	const isRtl = useDirection() === "rtl";
	const side = mountSide || {
		top: "top",
		right: "right",
		bottom: "bottom",
		left: "left",
		"inline-end": isRtl ? "left" : "right",
		"inline-start": isRtl ? "right" : "left"
	}[sideParam];
	const placement = align === "center" ? side : `${side}-${align}`;
	let collisionPadding = collisionPaddingParam;
	const bias = 1;
	const biasTop = sideParam === "bottom" ? bias : 0;
	const biasBottom = sideParam === "top" ? bias : 0;
	const biasLeft = sideParam === "right" ? bias : 0;
	const biasRight = sideParam === "left" ? bias : 0;
	if (typeof collisionPadding === "number") collisionPadding = {
		top: collisionPadding + biasTop,
		right: collisionPadding + biasRight,
		bottom: collisionPadding + biasBottom,
		left: collisionPadding + biasLeft
	};
	else if (collisionPadding) collisionPadding = {
		top: (collisionPadding.top || 0) + biasTop,
		right: (collisionPadding.right || 0) + biasRight,
		bottom: (collisionPadding.bottom || 0) + biasBottom,
		left: (collisionPadding.left || 0) + biasLeft
	};
	const commonCollisionProps = {
		boundary: collisionBoundary === "clipping-ancestors" ? "clippingAncestors" : collisionBoundary,
		padding: collisionPadding
	};
	const arrowRef = import_react.useRef(null);
	const sideOffsetRef = useValueAsRef(sideOffset);
	const alignOffsetRef = useValueAsRef(alignOffset);
	const middleware = [offset$1((state) => {
		const data = getOffsetData(state, sideParam, isRtl);
		const sideAxis = typeof sideOffsetRef.current === "function" ? sideOffsetRef.current(data) : sideOffsetRef.current;
		const alignAxis = typeof alignOffsetRef.current === "function" ? alignOffsetRef.current(data) : alignOffsetRef.current;
		return {
			mainAxis: sideAxis,
			crossAxis: alignAxis,
			alignmentAxis: alignAxis
		};
	}, [
		typeof sideOffset !== "function" ? sideOffset : 0,
		typeof alignOffset !== "function" ? alignOffset : 0,
		isRtl,
		sideParam
	])];
	const shiftDisabled = collisionAvoidanceAlign === "none" && collisionAvoidanceSide !== "shift";
	const crossAxisShiftEnabled = !shiftDisabled && (sticky || shiftCrossAxis || collisionAvoidanceSide === "shift");
	const flipMiddleware = collisionAvoidanceSide === "none" ? null : flip({
		...commonCollisionProps,
		padding: {
			top: collisionPadding.top + bias,
			right: collisionPadding.right + bias,
			bottom: collisionPadding.bottom + bias,
			left: collisionPadding.left + bias
		},
		mainAxis: !shiftCrossAxis && collisionAvoidanceSide === "flip",
		crossAxis: collisionAvoidanceAlign === "flip" ? "alignment" : false,
		fallbackAxisSideDirection: collisionAvoidanceFallbackAxisSide
	});
	const shiftMiddleware = shiftDisabled ? null : shift$1((data) => {
		const html = ownerDocument(data.elements.floating).documentElement;
		return {
			...commonCollisionProps,
			rootBoundary: shiftCrossAxis ? {
				x: 0,
				y: 0,
				width: html.clientWidth,
				height: html.clientHeight
			} : void 0,
			mainAxis: collisionAvoidanceAlign !== "none",
			crossAxis: crossAxisShiftEnabled,
			limiter: sticky || shiftCrossAxis ? void 0 : limitShift((limitData) => {
				if (!arrowRef.current) return {};
				const { width, height } = arrowRef.current.getBoundingClientRect();
				const sideAxis = getSideAxis(getSide$1(limitData.placement));
				const arrowSize = sideAxis === "y" ? width : height;
				const offsetAmount = sideAxis === "y" ? collisionPadding.left + collisionPadding.right : collisionPadding.top + collisionPadding.bottom;
				return { offset: arrowSize / 2 + offsetAmount / 2 };
			})
		};
	}, [
		commonCollisionProps,
		sticky,
		shiftCrossAxis,
		collisionPadding,
		collisionAvoidanceAlign
	]);
	if (collisionAvoidanceSide === "shift" || collisionAvoidanceAlign === "shift" || align === "center") middleware.push(shiftMiddleware, flipMiddleware);
	else middleware.push(flipMiddleware, shiftMiddleware);
	middleware.push(size({
		...commonCollisionProps,
		apply({ elements: { floating }, rects: { reference }, availableWidth, availableHeight }) {
			Object.entries({
				"--available-width": `${availableWidth}px`,
				"--available-height": `${availableHeight}px`,
				"--anchor-width": `${reference.width}px`,
				"--anchor-height": `${reference.height}px`
			}).forEach(([key, value]) => {
				floating.style.setProperty(key, value);
			});
		}
	}), arrow$1(() => ({
		element: arrowRef.current || document.createElement("div"),
		padding: arrowPadding,
		offsetParent: "floating"
	}), [arrowPadding]), {
		name: "transformOrigin",
		fn(state) {
			const { elements, middlewareData, placement: renderedPlacement, rects, y } = state;
			const currentRenderedSide = getSide$1(renderedPlacement);
			const currentRenderedAxis = getSideAxis(currentRenderedSide);
			const arrowEl = arrowRef.current;
			const arrowX = middlewareData.arrow?.x || 0;
			const arrowY = middlewareData.arrow?.y || 0;
			const arrowWidth = arrowEl?.clientWidth || 0;
			const arrowHeight = arrowEl?.clientHeight || 0;
			const transformX = arrowX + arrowWidth / 2;
			const transformY = arrowY + arrowHeight / 2;
			const shiftY = Math.abs(middlewareData.shift?.y || 0);
			const halfAnchorHeight = rects.reference.height / 2;
			const sideOffsetValue = typeof sideOffset === "function" ? sideOffset(getOffsetData(state, sideParam, isRtl)) : sideOffset;
			const isOverlappingAnchor = shiftY > sideOffsetValue;
			const adjacentTransformOrigin = {
				top: `${transformX}px calc(100% + ${sideOffsetValue}px)`,
				bottom: `${transformX}px ${-sideOffsetValue}px`,
				left: `calc(100% + ${sideOffsetValue}px) ${transformY}px`,
				right: `${-sideOffsetValue}px ${transformY}px`
			}[currentRenderedSide];
			const overlapTransformOrigin = `${transformX}px ${rects.reference.y + halfAnchorHeight - y}px`;
			elements.floating.style.setProperty("--transform-origin", crossAxisShiftEnabled && currentRenderedAxis === "y" && isOverlappingAnchor ? overlapTransformOrigin : adjacentTransformOrigin);
			return {};
		}
	}, hide, adaptiveOrigin);
	useIsoLayoutEffect(() => {
		if (!mounted && floatingRootContext) floatingRootContext.update({
			referenceElement: null,
			floatingElement: null,
			domReferenceElement: null
		});
	}, [mounted, floatingRootContext]);
	const autoUpdateOptions = import_react.useMemo(() => ({
		elementResize: !disableAnchorTracking && typeof ResizeObserver !== "undefined",
		layoutShift: !disableAnchorTracking && typeof IntersectionObserver !== "undefined"
	}), [disableAnchorTracking]);
	const { refs, elements, x, y, middlewareData, update, placement: renderedPlacement, context, isPositioned, floatingStyles: originalFloatingStyles } = useFloating({
		rootContext: floatingRootContext,
		placement,
		middleware,
		strategy: positionMethod,
		whileElementsMounted: keepMounted ? void 0 : (...args) => autoUpdate(...args, autoUpdateOptions),
		nodeId,
		externalTree
	});
	const { sideX, sideY } = middlewareData.adaptiveOrigin || DEFAULT_SIDES;
	const resolvedPosition = isPositioned ? positionMethod : "fixed";
	const floatingStyles = import_react.useMemo(() => adaptiveOrigin ? {
		position: resolvedPosition,
		[sideX]: x,
		[sideY]: y
	} : {
		position: resolvedPosition,
		...originalFloatingStyles
	}, [
		adaptiveOrigin,
		resolvedPosition,
		sideX,
		x,
		sideY,
		y,
		originalFloatingStyles
	]);
	const registeredPositionReferenceRef = import_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (!mounted) return;
		const anchorValue = anchorValueRef.current;
		const resolvedAnchor = typeof anchorValue === "function" ? anchorValue() : anchorValue;
		const finalAnchor = (isRef(resolvedAnchor) ? resolvedAnchor.current : resolvedAnchor) || null;
		if (finalAnchor !== registeredPositionReferenceRef.current) {
			refs.setPositionReference(finalAnchor);
			registeredPositionReferenceRef.current = finalAnchor;
		}
	}, [
		mounted,
		refs,
		anchorDep,
		anchorValueRef
	]);
	import_react.useEffect(() => {
		if (!mounted) return;
		const anchorValue = anchorValueRef.current;
		if (typeof anchorValue === "function") return;
		if (isRef(anchorValue) && anchorValue.current !== registeredPositionReferenceRef.current) {
			refs.setPositionReference(anchorValue.current);
			registeredPositionReferenceRef.current = anchorValue.current;
		}
	}, [
		mounted,
		refs,
		anchorDep,
		anchorValueRef
	]);
	import_react.useEffect(() => {
		if (keepMounted && mounted && elements.domReference && elements.floating) return autoUpdate(elements.domReference, elements.floating, update, autoUpdateOptions);
	}, [
		keepMounted,
		mounted,
		elements,
		update,
		autoUpdateOptions
	]);
	const renderedSide = getSide$1(renderedPlacement);
	const logicalRenderedSide = getLogicalSide(sideParam, renderedSide, isRtl);
	const renderedAlign = getAlignment(renderedPlacement) || "center";
	const anchorHidden = Boolean(middlewareData.hide?.referenceHidden);
	/**
	* Locks the flip (makes it "sticky") so it doesn't prefer a given placement
	* and flips back lazily, not eagerly. Ideal for filtered lists that change
	* the size of the popup dynamically to avoid unwanted flipping when typing.
	*/
	useIsoLayoutEffect(() => {
		if (lazyFlip && mounted && isPositioned) setMountSide(renderedSide);
	}, [
		lazyFlip,
		mounted,
		isPositioned,
		renderedSide
	]);
	const arrowStyles = import_react.useMemo(() => ({
		position: "absolute",
		top: middlewareData.arrow?.y,
		left: middlewareData.arrow?.x
	}), [middlewareData.arrow]);
	const arrowUncentered = middlewareData.arrow?.centerOffset !== 0;
	return import_react.useMemo(() => ({
		positionerStyles: floatingStyles,
		arrowStyles,
		arrowRef,
		arrowUncentered,
		side: logicalRenderedSide,
		align: renderedAlign,
		physicalSide: renderedSide,
		anchorHidden,
		refs,
		context,
		isPositioned,
		update
	}), [
		floatingStyles,
		arrowStyles,
		arrowRef,
		arrowUncentered,
		logicalRenderedSide,
		renderedAlign,
		renderedSide,
		anchorHidden,
		refs,
		context,
		isPositioned,
		update
	]);
}
function isRef(param) {
	return param != null && "current" in param;
}
/**
* Positions the popup against the trigger.
* Renders a `<div>` element.
*/
var ComboboxPositioner = /*#__PURE__*/ import_react.forwardRef(function ComboboxPositioner(componentProps, forwardedRef) {
	const { render, className, anchor, positionMethod = "absolute", side = "bottom", align = "center", sideOffset = 0, alignOffset = 0, collisionBoundary = "clipping-ancestors", collisionPadding = 5, arrowPadding = 5, sticky = false, disableAnchorTracking = false, collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE, ...elementProps } = componentProps;
	const store = useComboboxRootContext();
	const { filteredItems } = useComboboxDerivedItemsContext();
	const floatingRootContext = useComboboxFloatingContext();
	const keepMounted = useComboboxPortalContext();
	const modal = useStore$1(store, selectors.modal);
	const open = useStore$1(store, selectors.open);
	const mounted = useStore$1(store, selectors.mounted);
	const openMethod = useStore$1(store, selectors.openMethod);
	const triggerElement = useStore$1(store, selectors.triggerElement);
	const inputElement = useStore$1(store, selectors.inputElement);
	const inputInsidePopup = useStore$1(store, selectors.inputInsidePopup);
	const empty = filteredItems.length === 0;
	const positioning = useAnchorPositioning({
		anchor: anchor ?? (inputInsidePopup ? triggerElement : inputElement),
		floatingRootContext,
		positionMethod,
		mounted,
		side,
		sideOffset,
		align,
		alignOffset,
		arrowPadding,
		collisionBoundary,
		collisionPadding,
		sticky,
		disableAnchorTracking,
		keepMounted,
		collisionAvoidance,
		lazyFlip: true
	});
	useScrollLock(open && modal && openMethod !== "touch", triggerElement);
	const defaultProps = import_react.useMemo(() => {
		const style = { ...positioning.positionerStyles };
		if (!open) style.pointerEvents = "none";
		return {
			role: "presentation",
			hidden: !mounted,
			style
		};
	}, [
		open,
		mounted,
		positioning.positionerStyles
	]);
	const state = import_react.useMemo(() => ({
		open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		empty
	}), [
		open,
		positioning.side,
		positioning.align,
		positioning.anchorHidden,
		empty
	]);
	useIsoLayoutEffect(() => {
		store.set("popupSide", positioning.side);
	}, [store, positioning.side]);
	const contextValue = import_react.useMemo(() => ({
		side: positioning.side,
		align: positioning.align,
		arrowRef: positioning.arrowRef,
		arrowUncentered: positioning.arrowUncentered,
		arrowStyles: positioning.arrowStyles,
		anchorHidden: positioning.anchorHidden,
		isPositioned: positioning.isPositioned
	}), [
		positioning.side,
		positioning.align,
		positioning.arrowRef,
		positioning.arrowUncentered,
		positioning.arrowStyles,
		positioning.anchorHidden,
		positioning.isPositioned
	]);
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [forwardedRef, useStableCallback((element) => {
			store.set("positionerElement", element);
		})],
		props: [defaultProps, elementProps],
		stateAttributesMapping: popupStateMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(ComboboxPositionerContext.Provider, {
		value: contextValue,
		children: [mounted && modal && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InternalBackdrop, {
			inert: inertValue(!open),
			cutout: inputElement ?? triggerElement
		}), element]
	});
});
function getDisabledMountTransitionStyles(transitionStatus) {
	return transitionStatus === "starting" ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT;
}
var stateAttributesMapping = {
	...popupStateMapping,
	...transitionStatusMapping
};
/**
* A container for the list.
* Renders a `<div>` element.
*/
var ComboboxPopup = /*#__PURE__*/ import_react.forwardRef(function ComboboxPopup(componentProps, forwardedRef) {
	const { render, className, initialFocus, finalFocus, ...elementProps } = componentProps;
	const store = useComboboxRootContext();
	const positioning = useComboboxPositionerContext();
	const floatingRootContext = useComboboxFloatingContext();
	const { filteredItems } = useComboboxDerivedItemsContext();
	const mounted = useStore$1(store, selectors.mounted);
	const open = useStore$1(store, selectors.open);
	const openMethod = useStore$1(store, selectors.openMethod);
	const transitionStatus = useStore$1(store, selectors.transitionStatus);
	const inputInsidePopup = useStore$1(store, selectors.inputInsidePopup);
	const inputElement = useStore$1(store, selectors.inputElement);
	const empty = filteredItems.length === 0;
	useOpenChangeComplete({
		open,
		ref: store.state.popupRef,
		onComplete() {
			if (open) store.state.onOpenChangeComplete(true);
		}
	});
	const element = useRenderElement("div", componentProps, {
		state: import_react.useMemo(() => ({
			open,
			side: positioning.side,
			align: positioning.align,
			anchorHidden: positioning.anchorHidden,
			transitionStatus,
			empty
		}), [
			open,
			positioning.side,
			positioning.align,
			positioning.anchorHidden,
			transitionStatus,
			empty
		]),
		ref: [forwardedRef, store.state.popupRef],
		props: [
			{
				role: inputInsidePopup ? "dialog" : "presentation",
				tabIndex: -1,
				onFocus(event) {
					const target = getTarget(event.nativeEvent);
					if (openMethod !== "touch" && (contains$2(store.state.listElement, target) || target === event.currentTarget)) store.state.inputRef.current?.focus();
				}
			},
			getDisabledMountTransitionStyles(transitionStatus),
			elementProps
		],
		stateAttributesMapping
	});
	const resolvedInitialFocus = initialFocus === void 0 ? inputInsidePopup ? (interactionType) => interactionType === "touch" ? store.state.popupRef.current : inputElement : false : initialFocus;
	let resolvedFinalFocus;
	if (finalFocus != null) resolvedFinalFocus = finalFocus;
	else resolvedFinalFocus = inputInsidePopup ? void 0 : false;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingFocusManager, {
		context: floatingRootContext,
		disabled: !mounted,
		modal: !inputInsidePopup,
		openInteractionType: openMethod,
		initialFocus: resolvedInitialFocus,
		returnFocus: resolvedFinalFocus,
		children: element
	});
});
var ComboboxItemContext = /*#__PURE__*/ import_react.createContext(void 0);
function useComboboxItemContext() {
	const context = import_react.useContext(ComboboxItemContext);
	if (!context) throw new Error(formatErrorMessage(19));
	return context;
}
var ComboboxRowContext = /*#__PURE__*/ import_react.createContext(false);
function useComboboxRowContext() {
	return import_react.useContext(ComboboxRowContext);
}
/**
* An individual item in the list.
* Renders a `<div>` element.
*/
var ComboboxItem$1 = /*#__PURE__*/ import_react.memo(/*#__PURE__*/ import_react.forwardRef(function ComboboxItem(componentProps, forwardedRef) {
	const { render, className, value = null, index: indexProp, disabled = false, nativeButton = false, ...elementProps } = componentProps;
	const didPointerDownRef = import_react.useRef(false);
	const textRef = import_react.useRef(null);
	const listItem = useCompositeListItem({
		index: indexProp,
		textRef,
		indexGuessBehavior: IndexGuessBehavior.GuessFromOrder
	});
	const store = useComboboxRootContext();
	const isRow = useComboboxRowContext();
	const { flatFilteredItems } = useComboboxDerivedItemsContext();
	const open = useStore$1(store, selectors.open);
	const selectionMode = useStore$1(store, selectors.selectionMode);
	const readOnly = useStore$1(store, selectors.readOnly);
	const virtualized = useStore$1(store, selectors.virtualized);
	const isItemEqualToValue = useStore$1(store, selectors.isItemEqualToValue);
	const selectable = selectionMode !== "none";
	const index = indexProp ?? (virtualized ? findItemIndex(flatFilteredItems, value, isItemEqualToValue) : listItem.index);
	const hasRegistered = listItem.index !== -1;
	const rootId = useStore$1(store, selectors.id);
	const highlighted = useStore$1(store, selectors.isActive, index);
	const matchesSelectedValue = useStore$1(store, selectors.isSelected, value);
	const items = useStore$1(store, selectors.items);
	const getItemProps = useStore$1(store, selectors.getItemProps);
	const itemRef = import_react.useRef(null);
	const id = rootId != null && hasRegistered ? `${rootId}-${index}` : void 0;
	const selected = matchesSelectedValue && selectable;
	useIsoLayoutEffect(() => {
		if (!(hasRegistered && (virtualized || indexProp != null))) return;
		const list = store.state.listRef.current;
		list[index] = itemRef.current;
		return () => {
			delete list[index];
		};
	}, [
		hasRegistered,
		virtualized,
		index,
		indexProp,
		store
	]);
	useIsoLayoutEffect(() => {
		if (!hasRegistered || items) return;
		const visibleMap = store.state.valuesRef.current;
		visibleMap[index] = value;
		if (selectionMode !== "none") store.state.allValuesRef.current.push(value);
		return () => {
			delete visibleMap[index];
		};
	}, [
		hasRegistered,
		items,
		index,
		value,
		store,
		selectionMode
	]);
	useIsoLayoutEffect(() => {
		if (!open) {
			didPointerDownRef.current = false;
			return;
		}
		if (!hasRegistered || items) return;
		const selectedValue = store.state.selectedValue;
		if (compareItemEquality(Array.isArray(selectedValue) ? selectedValue[selectedValue.length - 1] : selectedValue, value, isItemEqualToValue)) store.set("selectedIndex", index);
	}, [
		hasRegistered,
		items,
		open,
		store,
		index,
		value,
		isItemEqualToValue
	]);
	const state = import_react.useMemo(() => ({
		disabled,
		selected,
		highlighted
	}), [
		disabled,
		selected,
		highlighted
	]);
	const rootProps = getItemProps({
		active: highlighted,
		selected
	});
	rootProps.id = void 0;
	rootProps.onFocus = void 0;
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled: true,
		native: nativeButton
	});
	function commitSelection(nativeEvent) {
		function selectItem() {
			store.state.handleSelection(nativeEvent, value);
		}
		if (store.state.submitOnItemClick) {
			import_react_dom.flushSync(selectItem);
			store.state.requestSubmit();
		} else selectItem();
	}
	const defaultProps = {
		id,
		role: isRow ? "gridcell" : "option",
		"aria-disabled": disabled || void 0,
		"aria-selected": selectable ? selected : void 0,
		tabIndex: void 0,
		onPointerDownCapture(event) {
			didPointerDownRef.current = true;
			event.preventDefault();
		},
		onClick(event) {
			if (disabled || readOnly) return;
			commitSelection(event.nativeEvent);
		},
		onMouseUp(event) {
			const pointerStartedOnItem = didPointerDownRef.current;
			didPointerDownRef.current = false;
			if (disabled || readOnly || event.button !== 0 || pointerStartedOnItem || !highlighted) return;
			commitSelection(event.nativeEvent);
		}
	};
	const element = useRenderElement("div", componentProps, {
		ref: [
			buttonRef,
			forwardedRef,
			listItem.ref,
			itemRef
		],
		state,
		props: [
			rootProps,
			defaultProps,
			elementProps,
			getButtonProps
		]
	});
	const contextValue = import_react.useMemo(() => ({
		selected,
		textRef
	}), [selected, textRef]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxItemContext.Provider, {
		value: contextValue,
		children: element
	});
}));
/**
* Renders its children only when the list is empty.
* Requires the `items` prop on the root component.
* Announces changes politely to screen readers.
* Renders a `<div>` element.
*/
var ComboboxEmpty$1 = /*#__PURE__*/ import_react.forwardRef(function ComboboxEmpty(componentProps, forwardedRef) {
	const { render, className, children: childrenProp, ...elementProps } = componentProps;
	const { filteredItems } = useComboboxDerivedItemsContext();
	const store = useComboboxRootContext();
	const children = filteredItems.length === 0 ? childrenProp : null;
	return useRenderElement("div", componentProps, {
		ref: [forwardedRef, store.state.emptyRef],
		props: [{
			children,
			role: "status",
			"aria-live": "polite",
			"aria-atomic": true
		}, elementProps]
	});
});
/**
* Groups all parts of the combobox.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
function ComboboxRoot(props) {
	const { multiple = false, defaultValue, value, onValueChange, ...other } = props;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(AriaCombobox, {
		...other,
		selectionMode: multiple ? "multiple" : "single",
		selectedValue: value,
		defaultSelectedValue: defaultValue,
		onSelectedValueChange: onValueChange
	});
}
/**
* Indicates whether the item is selected.
* Renders a `<span>` element.
*/
var ComboboxItemIndicator = /*#__PURE__*/ import_react.forwardRef(function ComboboxItemIndicator(componentProps, forwardedRef) {
	const keepMounted = componentProps.keepMounted ?? false;
	const { selected } = useComboboxItemContext();
	if (!(keepMounted || selected)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Inner, {
		...componentProps,
		ref: forwardedRef
	});
});
var Inner = /*#__PURE__*/ import_react.memo(/*#__PURE__*/ import_react.forwardRef((componentProps, forwardedRef) => {
	const { render, className, keepMounted, ...elementProps } = componentProps;
	const { selected } = useComboboxItemContext();
	const indicatorRef = import_react.useRef(null);
	const { transitionStatus, setMounted } = useTransitionStatus(selected);
	const state = import_react.useMemo(() => ({
		selected,
		transitionStatus
	}), [selected, transitionStatus]);
	const element = useRenderElement("span", componentProps, {
		ref: [forwardedRef, indicatorRef],
		state,
		props: [{
			"aria-hidden": true,
			children: "✔️"
		}, elementProps],
		stateAttributesMapping: transitionStatusMapping
	});
	useOpenChangeComplete({
		open: selected,
		ref: indicatorRef,
		onComplete() {
			if (!selected) setMounted(false);
		}
	});
	return element;
}));

export { ComboboxEmpty$1, ComboboxInput$1, ComboboxItem$1, ComboboxItemIndicator, ComboboxList$1, ComboboxPopup, ComboboxPortal, ComboboxPositioner, ComboboxRoot, ComboboxTrigger$1 };
