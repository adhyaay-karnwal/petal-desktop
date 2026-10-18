// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/effect.ts
import { rgbaToCss } from "../../utils/color.js";

var DEFAULT_SHADOW_COLOR$1 = "rgba(0,0,0,0.25)";
function figmaBlurRadiusToCss(radius) {
	return (radius ?? 0) / 2;
}
function shadowCss(effect, inset) {
	const x = effect.offset?.x ?? 0;
	const y = effect.offset?.y ?? 0;
	const color = rgbaToCss(effect.color) ?? DEFAULT_SHADOW_COLOR$1;
	return `${inset ? "inset " : ""}${x}px ${y}px ${effect.radius ?? 0}px ${effect.spread ?? 0}px ${color}`;
}
function isLayerBlur(effect) {
	const type = effect.type;
	return type === "FOREGROUND_BLUR" || type === "LAYER_BLUR";
}
function warnUnresolvedEffectStyle(node, nodeId, ctx) {
	const styleId = node.styleIdForEffect?.assetRef?.key;
	if (styleId && !node.effects?.length) ctx.warnings.push({
		code: "EFFECT_STYLE_REF",
		nodeId,
		styleId
	});
}
function mapEffectStyles(node, nodeId, ctx) {
	const styles = {};
	const visible = (node.effects ?? []).filter((effect) => effect.visible !== false);
	const shadows = visible.filter((effect) => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW").map((effect) => shadowCss(effect, effect.type === "INNER_SHADOW"));
	const backdrop = visible.filter((effect) => effect.type === "BACKGROUND_BLUR").map((effect) => `blur(${figmaBlurRadiusToCss(effect.radius)}px)`);
	const filters = visible.filter(isLayerBlur).map((effect) => `blur(${figmaBlurRadiusToCss(effect.radius)}px)`);
	if (shadows.length > 0) styles.boxShadow = shadows.join(", ");
	if (filters.length > 0) styles.filter = filters.join(" ");
	if (backdrop.length > 0) {
		styles.backdropFilter = backdrop.join(" ");
		styles.WebkitBackdropFilter = backdrop.join(" ");
	}
	warnUnresolvedEffectStyle(node, nodeId, ctx);
	return styles;
}

export { mapEffectStyles };
