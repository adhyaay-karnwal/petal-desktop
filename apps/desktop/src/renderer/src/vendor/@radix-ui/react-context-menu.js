// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-context-menu
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { useCallbackRef$1 } from "./react-use-callback-ref.js";
import { Primitive } from "./react-primitive.js";
import { createContextScope } from "./react-context.js";
import { composeEventHandlers } from "./react-collection.js";
import { useControllableState } from "./react-use-controllable-state.js";
import { Anchor2$1, Arrow2, CheckboxItem, Content2$5, Group$1, Item2$4, ItemIndicator$1, Label$1, Portal$4, RadioGroup$2, RadioItem, Root3, Separator$3, Sub, SubContent, SubTrigger, createMenuScope } from "./react-menu.js";

var CONTEXT_MENU_NAME = "ContextMenu";
var [createContextMenuContext, createContextMenuScope] = createContextScope(CONTEXT_MENU_NAME, [createMenuScope]);
var useMenuScope = createMenuScope();
var [ContextMenuProvider, useContextMenuContext] = createContextMenuContext(CONTEXT_MENU_NAME);
var ContextMenu$2 = (props) => {
	const { __scopeContextMenu, children, onOpenChange, dir, modal = true } = props;
	const [open, setOpen] = import_react.useState(false);
	const menuScope = useMenuScope(__scopeContextMenu);
	const handleOpenChangeProp = useCallbackRef$1(onOpenChange);
	const handleOpenChange = import_react.useCallback((open2) => {
		setOpen(open2);
		handleOpenChangeProp(open2);
	}, [handleOpenChangeProp]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuProvider, {
		scope: __scopeContextMenu,
		open,
		onOpenChange: handleOpenChange,
		modal,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, {
			...menuScope,
			dir,
			open,
			onOpenChange: handleOpenChange,
			modal,
			children
		})
	});
};
ContextMenu$2.displayName = CONTEXT_MENU_NAME;
var TRIGGER_NAME$3 = "ContextMenuTrigger";
var ContextMenuTrigger$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, disabled = false, ...triggerProps } = props;
	const context = useContextMenuContext(TRIGGER_NAME$3, __scopeContextMenu);
	const menuScope = useMenuScope(__scopeContextMenu);
	const pointRef = import_react.useRef({
		x: 0,
		y: 0
	});
	const virtualRef = import_react.useRef({ getBoundingClientRect: () => DOMRect.fromRect({
		width: 0,
		height: 0,
		...pointRef.current
	}) });
	const longPressTimerRef = import_react.useRef(0);
	const clearLongPress = import_react.useCallback(() => window.clearTimeout(longPressTimerRef.current), []);
	const handleOpen = (event) => {
		pointRef.current = {
			x: event.clientX,
			y: event.clientY
		};
		context.onOpenChange(true);
	};
	import_react.useEffect(() => clearLongPress, [clearLongPress]);
	import_react.useEffect(() => void (disabled && clearLongPress()), [disabled, clearLongPress]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor2$1, {
		...menuScope,
		virtualRef
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		"data-state": context.open ? "open" : "closed",
		"data-disabled": disabled ? "" : void 0,
		...triggerProps,
		ref: forwardedRef,
		style: {
			WebkitTouchCallout: "none",
			...props.style
		},
		onContextMenu: disabled ? props.onContextMenu : composeEventHandlers(props.onContextMenu, (event) => {
			clearLongPress();
			handleOpen(event);
			event.preventDefault();
		}),
		onPointerDown: disabled ? props.onPointerDown : composeEventHandlers(props.onPointerDown, whenTouchOrPen((event) => {
			clearLongPress();
			longPressTimerRef.current = window.setTimeout(() => handleOpen(event), 700);
		})),
		onPointerMove: disabled ? props.onPointerMove : composeEventHandlers(props.onPointerMove, whenTouchOrPen(clearLongPress)),
		onPointerCancel: disabled ? props.onPointerCancel : composeEventHandlers(props.onPointerCancel, whenTouchOrPen(clearLongPress)),
		onPointerUp: disabled ? props.onPointerUp : composeEventHandlers(props.onPointerUp, whenTouchOrPen(clearLongPress))
	})] });
});
ContextMenuTrigger$1.displayName = TRIGGER_NAME$3;
var PORTAL_NAME$2 = "ContextMenuPortal";
var ContextMenuPortal = (props) => {
	const { __scopeContextMenu, ...portalProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$4, {
		...menuScope,
		...portalProps
	});
};
ContextMenuPortal.displayName = PORTAL_NAME$2;
var CONTENT_NAME$3 = "ContextMenuContent";
var ContextMenuContent$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...contentProps } = props;
	const context = useContextMenuContext(CONTENT_NAME$3, __scopeContextMenu);
	const menuScope = useMenuScope(__scopeContextMenu);
	const hasInteractedOutsideRef = import_react.useRef(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$5, {
		...menuScope,
		...contentProps,
		ref: forwardedRef,
		side: "right",
		sideOffset: 2,
		align: "start",
		onCloseAutoFocus: (event) => {
			props.onCloseAutoFocus?.(event);
			if (!event.defaultPrevented && hasInteractedOutsideRef.current) event.preventDefault();
			hasInteractedOutsideRef.current = false;
		},
		onInteractOutside: (event) => {
			props.onInteractOutside?.(event);
			if (!event.defaultPrevented && !context.modal) hasInteractedOutsideRef.current = true;
		},
		style: {
			...props.style,
			"--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
			"--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
			"--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
ContextMenuContent$1.displayName = CONTENT_NAME$3;
var GROUP_NAME = "ContextMenuGroup";
var ContextMenuGroup = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...groupProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group$1, {
		...menuScope,
		...groupProps,
		ref: forwardedRef
	});
});
ContextMenuGroup.displayName = GROUP_NAME;
var LABEL_NAME = "ContextMenuLabel";
var ContextMenuLabel = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...labelProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
		...menuScope,
		...labelProps,
		ref: forwardedRef
	});
});
ContextMenuLabel.displayName = LABEL_NAME;
var ITEM_NAME$1 = "ContextMenuItem";
var ContextMenuItem$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...itemProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$4, {
		...menuScope,
		...itemProps,
		ref: forwardedRef
	});
});
ContextMenuItem$1.displayName = ITEM_NAME$1;
var CHECKBOX_ITEM_NAME = "ContextMenuCheckboxItem";
var ContextMenuCheckboxItem = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...checkboxItemProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxItem, {
		...menuScope,
		...checkboxItemProps,
		ref: forwardedRef
	});
});
ContextMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;
var RADIO_GROUP_NAME = "ContextMenuRadioGroup";
var ContextMenuRadioGroup = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...radioGroupProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$2, {
		...menuScope,
		...radioGroupProps,
		ref: forwardedRef
	});
});
ContextMenuRadioGroup.displayName = RADIO_GROUP_NAME;
var RADIO_ITEM_NAME = "ContextMenuRadioItem";
var ContextMenuRadioItem = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...radioItemProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioItem, {
		...menuScope,
		...radioItemProps,
		ref: forwardedRef
	});
});
ContextMenuRadioItem.displayName = RADIO_ITEM_NAME;
var INDICATOR_NAME = "ContextMenuItemIndicator";
var ContextMenuItemIndicator = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...itemIndicatorProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator$1, {
		...menuScope,
		...itemIndicatorProps,
		ref: forwardedRef
	});
});
ContextMenuItemIndicator.displayName = INDICATOR_NAME;
var SEPARATOR_NAME = "ContextMenuSeparator";
var ContextMenuSeparator$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...separatorProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator$3, {
		...menuScope,
		...separatorProps,
		ref: forwardedRef
	});
});
ContextMenuSeparator$1.displayName = SEPARATOR_NAME;
var ARROW_NAME$2 = "ContextMenuArrow";
var ContextMenuArrow = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...arrowProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow2, {
		...menuScope,
		...arrowProps,
		ref: forwardedRef
	});
});
ContextMenuArrow.displayName = ARROW_NAME$2;
var SUB_NAME = "ContextMenuSub";
var ContextMenuSub = (props) => {
	const { __scopeContextMenu, children, onOpenChange, open: openProp, defaultOpen } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen ?? false,
		onChange: onOpenChange,
		caller: SUB_NAME
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sub, {
		...menuScope,
		open,
		onOpenChange: setOpen,
		children
	});
};
ContextMenuSub.displayName = SUB_NAME;
var SUB_TRIGGER_NAME = "ContextMenuSubTrigger";
var ContextMenuSubTrigger = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...triggerItemProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTrigger, {
		...menuScope,
		...triggerItemProps,
		ref: forwardedRef
	});
});
ContextMenuSubTrigger.displayName = SUB_TRIGGER_NAME;
var SUB_CONTENT_NAME = "ContextMenuSubContent";
var ContextMenuSubContent = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeContextMenu, ...subContentProps } = props;
	const menuScope = useMenuScope(__scopeContextMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent, {
		...menuScope,
		...subContentProps,
		ref: forwardedRef,
		style: {
			...props.style,
			"--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
			"--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
			"--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
ContextMenuSubContent.displayName = SUB_CONTENT_NAME;
function whenTouchOrPen(handler) {
	return (event) => event.pointerType !== "mouse" ? handler(event) : void 0;
}
var Root2$4 = ContextMenu$2;
var Trigger$3 = ContextMenuTrigger$1;
var Portal2 = ContextMenuPortal;
var Content2$2 = ContextMenuContent$1;
var Item2$1 = ContextMenuItem$1;
var Separator2 = ContextMenuSeparator$1;

export { Content2$2, Item2$1, Portal2, Root2$4, Separator2, Trigger$3 };
