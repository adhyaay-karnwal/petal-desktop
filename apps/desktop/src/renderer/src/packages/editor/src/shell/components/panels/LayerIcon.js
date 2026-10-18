// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/LayerIcon.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/src/components/Tooltip.js";
import { getLayerAccent, getLayerIcon } from "./layerAppearance.js";

function LayerIcon(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { element, size: t1 } = t0;
	const size = t1 === void 0 ? 16 : t1;
	let t2;
	if ($[0] !== element || $[1] !== size) {
		const t3 = getLayerIcon(element);
		let t4;
		if ($[3] !== element) {
			t4 = getLayerAccent(element);
			$[3] = element;
			$[4] = t4;
		} else t4 = $[4];
		t2 = (0, import_react.createElement)(t3, {
			width: size,
			height: size,
			className: `${size === 14 ? "size-3.5" : "size-4"} shrink-0 ${t4.icon}`
		});
		$[0] = element;
		$[1] = size;
		$[2] = t2;
	} else t2 = $[2];
	const icon = t2;
	const missingComponent = element.type === "component" && !!element._componentMissing || element.type === "html" && !!element.props?.["data-component"];
	let t3;
	if ($[5] !== icon || $[6] !== missingComponent) {
		t3 = missingComponent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex",
				children: icon
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: "Component doesn't exist in this file"
		})] }) : icon;
		$[5] = icon;
		$[6] = missingComponent;
		$[7] = t3;
	} else t3 = $[7];
	return t3;
}

export { LayerIcon };
