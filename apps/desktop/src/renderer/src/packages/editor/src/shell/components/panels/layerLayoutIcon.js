// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/layerLayoutIcon.ts
import { LayerBlockIcon, LayerFlexHCenterIcon, LayerFlexHEndIcon, LayerFlexHStartIcon, LayerFlexVCenterIcon, LayerFlexVEndIcon, LayerFlexVStartIcon, LayerGridIcon } from "../../../../../ui/src/icons.js";
import { parseTailwindClass } from "../../../shared/utils/tailwindScale.js";

/** Resolve stored layout without measuring every layer on the canvas. */
function getLayerLayoutIcon(element) {
	const classStyles = {};
	const className = "props" in element ? element.props?.className : void 0;
	if (typeof className === "string") for (const token of className.split(/\s+/)) Object.assign(classStyles, parseTailwindClass(token));
	const get = (property) => element.styles?.[property] || classStyles[property];
	const display = get("display");
	if (display === "grid" || display === "inline-grid") return LayerGridIcon;
	if (display !== "flex" && display !== "inline-flex") return LayerBlockIcon;
	const direction = get("flexDirection");
	const column = direction === "column" || direction === "column-reverse";
	const alignment = get("alignItems")?.replace(/^(safe|unsafe)\s+/, "");
	if (alignment === "center") return column ? LayerFlexVCenterIcon : LayerFlexHCenterIcon;
	if (alignment === "flex-end" || alignment === "end" || alignment === "self-end") return column ? LayerFlexVEndIcon : LayerFlexHEndIcon;
	return column ? LayerFlexVStartIcon : LayerFlexHStartIcon;
}

export { getLayerLayoutIcon };
