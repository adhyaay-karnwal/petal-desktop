// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-portal
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { import_react_dom } from "../../packages/compiler/src/runtime/runtime.js";
import { useLayoutEffect2 } from "./react-use-layout-effect.js";
import { Primitive } from "./react-primitive.js";

var PORTAL_NAME$7 = "Portal";
var Portal$5 = import_react.forwardRef((props, forwardedRef) => {
	const { container: containerProp, ...portalProps } = props;
	const [mounted, setMounted] = import_react.useState(false);
	useLayoutEffect2(() => setMounted(true), []);
	const container = containerProp || mounted && globalThis?.document?.body;
	return container ? import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		...portalProps,
		ref: forwardedRef
	}), container) : null;
});
Portal$5.displayName = PORTAL_NAME$7;

export { Portal$5 };
