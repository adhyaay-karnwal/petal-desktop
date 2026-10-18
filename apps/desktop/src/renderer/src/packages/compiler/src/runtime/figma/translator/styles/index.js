// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/index.ts
import { figmaParent, isAbsoluteInAutoLayout, isAutoLayoutFrame } from "../model/node.js";
import { rotatedInSlotStyles } from "./rotationSlot.js";
import { absolutePositionStyles } from "./position.js";
import { mapAutoLayoutChildStyles } from "./autoLayoutChild.js";
import { mapContainerLayoutStyles } from "./autoLayoutContainer.js";
import { cornerRadiusCss, inheritedTopRadiusCss } from "./cornerRadius.js";
import { mapEffectStyles } from "./effect.js";
import { mapFillStyles } from "./fill.js";
import { mapStrokeStyles } from "./stroke.js";
import { withoutKeys } from "./withoutKeys.js";
import { mapTextStyles, withoutAutoSizedDimensions } from "./text.js";

function placementOf(node, ctx, options) {
	const parent = figmaParent(node, ctx);
	return {
		parent,
		flowsInAutoLayout: (parent ? isAutoLayoutFrame(parent) : false) && !isAbsoluteInAutoLayout(node) && !options.rotationSlot
	};
}
function placementStyles(node, ctx, placement, options) {
	if (options.rotationSlot) return rotatedInSlotStyles(node, options.rotationSlot);
	return placement.flowsInAutoLayout ? mapAutoLayoutChildStyles(node, ctx) : absolutePositionStyles(node);
}
function opacityStyles(node) {
	return node.opacity !== void 0 && node.opacity < 1 ? { opacity: node.opacity } : {};
}
function containerStyles$1(node, nodeId, ctx, placement, options) {
	const borderRadius = cornerRadiusCss(node) ?? (placement.parent ? inheritedTopRadiusCss(node, ctx) : void 0);
	const needsContainingBlock = options.asCanvasRoot || placement.flowsInAutoLayout;
	return {
		...mapContainerLayoutStyles(node, nodeId, ctx),
		...mapFillStyles(node, nodeId, ctx),
		...mapStrokeStyles(node, nodeId, ctx),
		...borderRadius ? { borderRadius } : {},
		...needsContainingBlock ? { position: "relative" } : {}
	};
}
function lineStyles(node) {
	return {
		height: 1,
		width: node.size?.x ?? 1
	};
}
function layeredBoxShadow(...shadows) {
	const present = shadows.filter((shadow) => !!shadow);
	return present.length > 0 ? { boxShadow: present.join(", ") } : {};
}
function nodeStylesToCss(node, nodeId, ctx, options = {}) {
	const placement = placementOf(node, ctx, options);
	const effects = mapEffectStyles(node, nodeId, ctx);
	const container = options.container ? containerStyles$1(node, nodeId, ctx, placement, options) : {};
	let styles = {
		...placementStyles(node, ctx, placement, options),
		...effects,
		...opacityStyles(node),
		...container,
		...layeredBoxShadow(container.boxShadow, effects.boxShadow)
	};
	if (options.asCanvasRoot) styles = withoutKeys(styles, [
		"left",
		"top",
		"right",
		"bottom"
	]);
	if (node.type === "TEXT") styles = withoutAutoSizedDimensions(node, {
		...styles,
		...mapTextStyles(node, nodeId, ctx)
	});
	if (node.type === "LINE") styles = {
		...styles,
		...lineStyles(node)
	};
	return styles;
}

export { nodeStylesToCss };
