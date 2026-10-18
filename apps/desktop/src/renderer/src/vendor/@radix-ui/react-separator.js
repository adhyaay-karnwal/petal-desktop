// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-separator
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { Primitive$1 } from "./react-primitive.js";

var NAME$2 = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = import_react.forwardRef((props, forwardedRef) => {
	const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
	const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
	const semanticProps = decorative ? { role: "none" } : {
		"aria-orientation": orientation === "vertical" ? orientation : void 0,
		role: "separator"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive$1.div, {
		"data-orientation": orientation,
		...semanticProps,
		...domProps,
		ref: forwardedRef
	});
});
Separator$1.displayName = NAME$2;
function isValidOrientation(orientation) {
	return ORIENTATIONS.includes(orientation);
}
var Root$2 = Separator$1;

export { Root$2 };
