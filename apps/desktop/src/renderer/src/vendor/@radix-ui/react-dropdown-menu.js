// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-dropdown-menu
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { composeRefs } from "./react-compose-refs.js";
import { Primitive } from "./react-primitive.js";
import { createContextScope } from "./react-context.js";
import { composeEventHandlers } from "./react-collection.js";
import { useId$12 } from "./react-id.js";
import { useControllableState } from "./react-use-controllable-state.js";
import { Anchor2$1, Arrow2, CheckboxItem, Content2$5, Group$1, Item2$4, ItemIndicator$1, Label$1, Portal$4, RadioGroup$2, RadioItem, Root3, Separator$3, Sub, SubContent, SubTrigger, createMenuScope } from "./react-menu.js";

var DROPDOWN_MENU_NAME = "DropdownMenu";
var [createDropdownMenuContext, createDropdownMenuScope] = createContextScope(DROPDOWN_MENU_NAME, [createMenuScope]);
var useMenuScope$1 = createMenuScope();
var [DropdownMenuProvider, useDropdownMenuContext] = createDropdownMenuContext(DROPDOWN_MENU_NAME);
var DropdownMenu$1 = (props) => {
	const { __scopeDropdownMenu, children, dir, open: openProp, defaultOpen, onOpenChange, modal = true } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	const triggerRef = import_react.useRef(null);
	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen ?? false,
		onChange: onOpenChange,
		caller: DROPDOWN_MENU_NAME
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuProvider, {
		scope: __scopeDropdownMenu,
		triggerId: useId$12(),
		triggerRef,
		contentId: useId$12(),
		open,
		onOpenChange: setOpen,
		onOpenToggle: import_react.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
		modal,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, {
			...menuScope,
			open,
			onOpenChange: setOpen,
			dir,
			modal,
			children
		})
	});
};
DropdownMenu$1.displayName = DROPDOWN_MENU_NAME;
var TRIGGER_NAME$6 = "DropdownMenuTrigger";
var DropdownMenuTrigger$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
	const context = useDropdownMenuContext(TRIGGER_NAME$6, __scopeDropdownMenu);
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor2$1, {
		asChild: true,
		...menuScope,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
			type: "button",
			id: context.triggerId,
			"aria-haspopup": "menu",
			"aria-expanded": context.open,
			"aria-controls": context.open ? context.contentId : void 0,
			"data-state": context.open ? "open" : "closed",
			"data-disabled": disabled ? "" : void 0,
			disabled,
			...triggerProps,
			ref: composeRefs(forwardedRef, context.triggerRef),
			onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
				if (!disabled && event.button === 0 && event.ctrlKey === false) {
					context.onOpenToggle();
					if (!context.open) event.preventDefault();
				}
			}),
			onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
				if (disabled) return;
				if (["Enter", " "].includes(event.key)) context.onOpenToggle();
				if (event.key === "ArrowDown") context.onOpenChange(true);
				if ([
					"Enter",
					" ",
					"ArrowDown"
				].includes(event.key)) event.preventDefault();
			})
		})
	});
});
DropdownMenuTrigger$1.displayName = TRIGGER_NAME$6;
var PORTAL_NAME$4 = "DropdownMenuPortal";
var DropdownMenuPortal = (props) => {
	const { __scopeDropdownMenu, ...portalProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$4, {
		...menuScope,
		...portalProps
	});
};
DropdownMenuPortal.displayName = PORTAL_NAME$4;
var CONTENT_NAME$5 = "DropdownMenuContent";
var DropdownMenuContent$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...contentProps } = props;
	const context = useDropdownMenuContext(CONTENT_NAME$5, __scopeDropdownMenu);
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	const hasInteractedOutsideRef = import_react.useRef(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$5, {
		id: context.contentId,
		"aria-labelledby": context.triggerId,
		...menuScope,
		...contentProps,
		ref: forwardedRef,
		onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
			if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
			hasInteractedOutsideRef.current = false;
			event.preventDefault();
		}),
		onInteractOutside: composeEventHandlers(props.onInteractOutside, (event) => {
			const originalEvent = event.detail.originalEvent;
			const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
			const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
			if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
		}),
		style: {
			...props.style,
			"--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
			"--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
			"--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
DropdownMenuContent$1.displayName = CONTENT_NAME$5;
var GROUP_NAME$2 = "DropdownMenuGroup";
var DropdownMenuGroup = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...groupProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group$1, {
		...menuScope,
		...groupProps,
		ref: forwardedRef
	});
});
DropdownMenuGroup.displayName = GROUP_NAME$2;
var LABEL_NAME$2 = "DropdownMenuLabel";
var DropdownMenuLabel$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...labelProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
		...menuScope,
		...labelProps,
		ref: forwardedRef
	});
});
DropdownMenuLabel$1.displayName = LABEL_NAME$2;
var ITEM_NAME$4 = "DropdownMenuItem";
var DropdownMenuItem$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...itemProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$4, {
		...menuScope,
		...itemProps,
		ref: forwardedRef
	});
});
DropdownMenuItem$1.displayName = ITEM_NAME$4;
var CHECKBOX_ITEM_NAME$1 = "DropdownMenuCheckboxItem";
var DropdownMenuCheckboxItem$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...checkboxItemProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxItem, {
		...menuScope,
		...checkboxItemProps,
		ref: forwardedRef
	});
});
DropdownMenuCheckboxItem$1.displayName = CHECKBOX_ITEM_NAME$1;
var RADIO_GROUP_NAME$2 = "DropdownMenuRadioGroup";
var DropdownMenuRadioGroup$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...radioGroupProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$2, {
		...menuScope,
		...radioGroupProps,
		ref: forwardedRef
	});
});
DropdownMenuRadioGroup$1.displayName = RADIO_GROUP_NAME$2;
var RADIO_ITEM_NAME$1 = "DropdownMenuRadioItem";
var DropdownMenuRadioItem$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...radioItemProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioItem, {
		...menuScope,
		...radioItemProps,
		ref: forwardedRef
	});
});
DropdownMenuRadioItem$1.displayName = RADIO_ITEM_NAME$1;
var INDICATOR_NAME$3 = "DropdownMenuItemIndicator";
var DropdownMenuItemIndicator = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator$1, {
		...menuScope,
		...itemIndicatorProps,
		ref: forwardedRef
	});
});
DropdownMenuItemIndicator.displayName = INDICATOR_NAME$3;
var SEPARATOR_NAME$2 = "DropdownMenuSeparator";
var DropdownMenuSeparator$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...separatorProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator$3, {
		...menuScope,
		...separatorProps,
		ref: forwardedRef
	});
});
DropdownMenuSeparator$1.displayName = SEPARATOR_NAME$2;
var ARROW_NAME$4 = "DropdownMenuArrow";
var DropdownMenuArrow = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...arrowProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow2, {
		...menuScope,
		...arrowProps,
		ref: forwardedRef
	});
});
DropdownMenuArrow.displayName = ARROW_NAME$4;
var DropdownMenuSub$1 = (props) => {
	const { __scopeDropdownMenu, children, open: openProp, onOpenChange, defaultOpen } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen ?? false,
		onChange: onOpenChange,
		caller: "DropdownMenuSub"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sub, {
		...menuScope,
		open,
		onOpenChange: setOpen,
		children
	});
};
var SUB_TRIGGER_NAME$1 = "DropdownMenuSubTrigger";
var DropdownMenuSubTrigger$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...subTriggerProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTrigger, {
		...menuScope,
		...subTriggerProps,
		ref: forwardedRef
	});
});
DropdownMenuSubTrigger$1.displayName = SUB_TRIGGER_NAME$1;
var SUB_CONTENT_NAME$1 = "DropdownMenuSubContent";
var DropdownMenuSubContent$1 = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeDropdownMenu, ...subContentProps } = props;
	const menuScope = useMenuScope$1(__scopeDropdownMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent, {
		...menuScope,
		...subContentProps,
		ref: forwardedRef,
		style: {
			...props.style,
			"--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
			"--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
			"--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
DropdownMenuSubContent$1.displayName = SUB_CONTENT_NAME$1;
var Root2$7 = DropdownMenu$1;
var Trigger$5 = DropdownMenuTrigger$1;
var Portal2$1 = DropdownMenuPortal;
var Content2$4 = DropdownMenuContent$1;
var Label2 = DropdownMenuLabel$1;
var Item2$3 = DropdownMenuItem$1;
var CheckboxItem2 = DropdownMenuCheckboxItem$1;
var RadioGroup2 = DropdownMenuRadioGroup$1;
var RadioItem2 = DropdownMenuRadioItem$1;
var ItemIndicator2 = DropdownMenuItemIndicator;
var Separator2$1 = DropdownMenuSeparator$1;
var Sub2 = DropdownMenuSub$1;
var SubTrigger2 = DropdownMenuSubTrigger$1;
var SubContent2 = DropdownMenuSubContent$1;

export { CheckboxItem2, Content2$4, Item2$3, ItemIndicator2, Label2, Portal2$1, RadioGroup2, RadioItem2, Root2$7, Separator2$1, Sub2, SubContent2, SubTrigger2, Trigger$5 };
