// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-hover-card
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { useComposedRefs } from "./react-compose-refs.js";
import { Primitive } from "./react-primitive.js";
import { createContextScope } from "./react-context.js";
import { composeEventHandlers } from "./react-collection.js";
import { DismissableLayer } from "./react-dismissable-layer.js";
import { Anchor, Arrow, Content$2, Root2$8, createPopperScope } from "./react-popper.js";
import { Portal$5 } from "./react-portal.js";
import { Presence } from "./react-presence.js";
import { useControllableState } from "./react-use-controllable-state.js";

var originalBodyUserSelect;
var HOVERCARD_NAME = "HoverCard";
var [createHoverCardContext, createHoverCardScope] = createContextScope(HOVERCARD_NAME, [createPopperScope]);
var usePopperScope$1 = createPopperScope();
var [HoverCardProvider, useHoverCardContext] = createHoverCardContext(HOVERCARD_NAME);
var HoverCard$1 = (props) => {
	const { __scopeHoverCard, children, open: openProp, defaultOpen, onOpenChange, openDelay = 700, closeDelay = 300 } = props;
	const popperScope = usePopperScope$1(__scopeHoverCard);
	const openTimerRef = import_react.useRef(0);
	const closeTimerRef = import_react.useRef(0);
	const hasSelectionRef = import_react.useRef(false);
	const isPointerDownOnContentRef = import_react.useRef(false);
	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen ?? false,
		onChange: onOpenChange,
		caller: HOVERCARD_NAME
	});
	const handleOpen = import_react.useCallback(() => {
		clearTimeout(closeTimerRef.current);
		openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay);
	}, [openDelay, setOpen]);
	const handleClose = import_react.useCallback(() => {
		clearTimeout(openTimerRef.current);
		if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
	}, [closeDelay, setOpen]);
	const handleDismiss = import_react.useCallback(() => setOpen(false), [setOpen]);
	import_react.useEffect(() => {
		return () => {
			clearTimeout(openTimerRef.current);
			clearTimeout(closeTimerRef.current);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardProvider, {
		scope: __scopeHoverCard,
		open,
		onOpenChange: setOpen,
		onOpen: handleOpen,
		onClose: handleClose,
		onDismiss: handleDismiss,
		hasSelectionRef,
		isPointerDownOnContentRef,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2$8, {
			...popperScope,
			children
		})
	});
};
HoverCard$1.displayName = HOVERCARD_NAME;
var TRIGGER_NAME$2 = "HoverCardTrigger";
var HoverCardTrigger$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeHoverCard, ...triggerProps } = props;
	const context = useHoverCardContext(TRIGGER_NAME$2, __scopeHoverCard);
	const popperScope = usePopperScope$1(__scopeHoverCard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor, {
		asChild: true,
		...popperScope,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.a, {
			"data-state": context.open ? "open" : "closed",
			...triggerProps,
			ref: forwardedRef,
			onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
			onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
			onFocus: composeEventHandlers(props.onFocus, context.onOpen),
			onBlur: composeEventHandlers(props.onBlur, context.onClose),
			onTouchStart: composeEventHandlers(props.onTouchStart, (event) => event.preventDefault())
		})
	});
});
HoverCardTrigger$1.displayName = TRIGGER_NAME$2;
var PORTAL_NAME$1 = "HoverCardPortal";
var [PortalProvider$1, usePortalContext$2] = createHoverCardContext(PORTAL_NAME$1, { forceMount: void 0 });
var HoverCardPortal = (props) => {
	const { __scopeHoverCard, forceMount, children, container } = props;
	const context = useHoverCardContext(PORTAL_NAME$1, __scopeHoverCard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalProvider$1, {
		scope: __scopeHoverCard,
		forceMount,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
			present: forceMount || context.open,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$5, {
				asChild: true,
				container,
				children
			})
		})
	});
};
HoverCardPortal.displayName = PORTAL_NAME$1;
var CONTENT_NAME$2 = "HoverCardContent";
var HoverCardContent$1 = import_react.forwardRef((props, forwardedRef) => {
	const portalContext = usePortalContext$2(CONTENT_NAME$2, props.__scopeHoverCard);
	const { forceMount = portalContext.forceMount, ...contentProps } = props;
	const context = useHoverCardContext(CONTENT_NAME$2, props.__scopeHoverCard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || context.open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContentImpl, {
			"data-state": context.open ? "open" : "closed",
			...contentProps,
			onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
			onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
			ref: forwardedRef
		})
	});
});
HoverCardContent$1.displayName = CONTENT_NAME$2;
var HoverCardContentImpl = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeHoverCard, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, ...contentProps } = props;
	const context = useHoverCardContext(CONTENT_NAME$2, __scopeHoverCard);
	const popperScope = usePopperScope$1(__scopeHoverCard);
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(forwardedRef, ref);
	const [containSelection, setContainSelection] = import_react.useState(false);
	import_react.useEffect(() => {
		if (containSelection) {
			const body = document.body;
			originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
			body.style.userSelect = "none";
			body.style.webkitUserSelect = "none";
			return () => {
				body.style.userSelect = originalBodyUserSelect;
				body.style.webkitUserSelect = originalBodyUserSelect;
			};
		}
	}, [containSelection]);
	import_react.useEffect(() => {
		if (ref.current) {
			const handlePointerUp = () => {
				setContainSelection(false);
				context.isPointerDownOnContentRef.current = false;
				setTimeout(() => {
					if (document.getSelection()?.toString() !== "") context.hasSelectionRef.current = true;
				});
			};
			document.addEventListener("pointerup", handlePointerUp);
			return () => {
				document.removeEventListener("pointerup", handlePointerUp);
				context.hasSelectionRef.current = false;
				context.isPointerDownOnContentRef.current = false;
			};
		}
	}, [context.isPointerDownOnContentRef, context.hasSelectionRef]);
	import_react.useEffect(() => {
		if (ref.current) getTabbableNodes(ref.current).forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DismissableLayer, {
		asChild: true,
		disableOutsidePointerEvents: false,
		onInteractOutside,
		onEscapeKeyDown,
		onPointerDownOutside,
		onFocusOutside: composeEventHandlers(onFocusOutside, (event) => {
			event.preventDefault();
		}),
		onDismiss: context.onDismiss,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content$2, {
			...popperScope,
			...contentProps,
			onPointerDown: composeEventHandlers(contentProps.onPointerDown, (event) => {
				if (event.currentTarget.contains(event.target)) setContainSelection(true);
				context.hasSelectionRef.current = false;
				context.isPointerDownOnContentRef.current = true;
			}),
			ref: composedRefs,
			style: {
				...contentProps.style,
				userSelect: containSelection ? "text" : void 0,
				WebkitUserSelect: containSelection ? "text" : void 0,
				"--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
				"--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
				"--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
				"--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
				"--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)"
			}
		})
	});
});
var ARROW_NAME$1 = "HoverCardArrow";
var HoverCardArrow = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeHoverCard, ...arrowProps } = props;
	const popperScope = usePopperScope$1(__scopeHoverCard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, {
		...popperScope,
		...arrowProps,
		ref: forwardedRef
	});
});
HoverCardArrow.displayName = ARROW_NAME$1;
function excludeTouch(eventHandler) {
	return (event) => event.pointerType === "touch" ? void 0 : eventHandler();
}
function getTabbableNodes(container) {
	const nodes = [];
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: (node) => {
		return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	while (walker.nextNode()) nodes.push(walker.currentNode);
	return nodes;
}
var Root2$3 = HoverCard$1;
var Trigger$2 = HoverCardTrigger$1;
var Portal$1 = HoverCardPortal;
var Content2$1 = HoverCardContent$1;

export { Content2$1, Portal$1, Root2$3, Trigger$2 };
