// Petal mark: six pink petals (brand pink, Tailwind pink-400).
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";

var PETAL_D = "M 0,22 C 11,22 14,18 14,12 S 2,0 0,0 -14,6 -14,12 -11,22 0,22 Z";
var PETAL_PINK = "#F472B6";
function PetalLogo(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "-3 -3 106 106",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		...props,
		fill: PETAL_PINK,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			transform: "translate(50, 50)",
			children: [(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(0) translate(0,10) scale(1,1.8)" }),(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(60) translate(0,10) scale(1,1.8)" }),(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(120) translate(0,10) scale(1,1.8)" }),(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(180) translate(0,10) scale(1,1.8)" }),(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(240) translate(0,10) scale(1,1.8)" }),(0, import_jsx_runtime.jsx)("path", { d: PETAL_D, transform: "rotate(300) translate(0,10) scale(1,1.8)" }),]
		})
	});
}

export { PetalLogo };
