// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-arrow
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { Primitive } from "./react-primitive.js";

var NAME$4 = "Arrow";
var Arrow$1 = import_react.forwardRef((props, forwardedRef) => {
	const { children, width = 10, height = 5, ...arrowProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.svg, {
		...arrowProps,
		ref: forwardedRef,
		width,
		height,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: props.asChild ? children : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: "0,0 30,0 15,10" })
	});
});
Arrow$1.displayName = NAME$4;
var Root$5 = Arrow$1;

export { Root$5 };
