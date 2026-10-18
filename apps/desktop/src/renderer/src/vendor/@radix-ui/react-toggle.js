// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-toggle
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { Primitive } from "./react-primitive.js";
import { composeEventHandlers } from "./react-collection.js";
import { useControllableState } from "./react-use-controllable-state.js";

var NAME$1 = "Toggle";
var Toggle = import_react.forwardRef((props, forwardedRef) => {
	const { pressed: pressedProp, defaultPressed, onPressedChange, ...buttonProps } = props;
	const [pressed, setPressed] = useControllableState({
		prop: pressedProp,
		onChange: onPressedChange,
		defaultProp: defaultPressed ?? false,
		caller: NAME$1
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
		type: "button",
		"aria-pressed": pressed,
		"data-state": pressed ? "on" : "off",
		"data-disabled": props.disabled ? "" : void 0,
		...buttonProps,
		ref: forwardedRef,
		onClick: composeEventHandlers(props.onClick, () => {
			if (!props.disabled) setPressed(!pressed);
		})
	});
});
Toggle.displayName = NAME$1;

export { Toggle };
