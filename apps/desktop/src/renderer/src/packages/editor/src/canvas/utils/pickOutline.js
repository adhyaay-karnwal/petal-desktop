// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/pickOutline.ts

var PICK_COLOR = "var(--ed-canvas-selection)";
/** A pick inside a component uses the component's purple. */
var COMPONENT_PICK_COLOR = "var(--ed-canvas-component)";
var COMPONENT_PICK_OUTLINE = `1px solid ${COMPONENT_PICK_COLOR}`;
var PICK_HOVER_OUTLINE = `1px solid ${PICK_COLOR}`;
var PICK_SELECT_OUTLINE = `1px solid ${PICK_COLOR}`;
var pickLabelStyle = {
	color: PICK_COLOR,
	font: "500 13px/20px var(--ed-font-sans, -apple-system, system-ui, sans-serif)",
	letterSpacing: "-0.01em",
	whiteSpace: "nowrap",
	pointerEvents: "none"
};
/**
* An editor colour as a concrete value, for a Live Preview's guest page,
* which cannot read the editor's CSS variables.
*/
function resolvedPickColor(variable = "--ed-canvas-selection") {
	if (typeof document === "undefined") return "rgb(59, 130, 246)";
	return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || "rgb(59, 130, 246)";
}

export { COMPONENT_PICK_COLOR, COMPONENT_PICK_OUTLINE, PICK_HOVER_OUTLINE, PICK_SELECT_OUTLINE, pickLabelStyle, resolvedPickColor };
