// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/text.ts
import { firstSolidColor } from "./color.js";
import { hasLineBreaks } from "./textContent.js";
import { withoutKeys } from "./withoutKeys.js";

var FALLBACK_FONT_STACK = `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
var TEXT_ALIGN = {
	LEFT: "left",
	CENTER: "center",
	RIGHT: "right",
	JUSTIFIED: "justify"
};
var WEIGHT_BY_STYLE_KEYWORD = [
	[["thin", "hairline"], 100],
	[["extralight", "ultralight"], 200],
	[["light"], 300],
	[["regular"], 400],
	[["medium"], 500],
	[["semibold", "demibold"], 600],
	[["bold"], 700],
	[["extrabold", "ultrabold"], 800],
	[["black", "heavy"], 900]
];
function fontWeightFromStyleName(style) {
	if (!style) return void 0;
	const name = style.toLowerCase().replace(/[\s_-]+/g, "");
	if (name === "normal") return 400;
	return WEIGHT_BY_STYLE_KEYWORD.flatMap(([keywords, weight]) => keywords.filter((keyword) => name.includes(keyword)).map((keyword) => ({
		keyword,
		weight
	}))).sort((a, b) => b.keyword.length - a.keyword.length)[0]?.weight;
}
function fontWeightFromMeta(fontName, meta) {
	if (!meta?.length) return void 0;
	if (fontName?.family || fontName?.style) {
		const match = meta.find((entry) => (!fontName.style || entry.key?.style === fontName.style) && (!fontName.family || entry.key?.family === fontName.family));
		if (match?.fontWeight !== void 0) return match.fontWeight;
	}
	return meta[0]?.fontWeight;
}
function fontStyles(node) {
	const style = node.textData?.style;
	const fontSize = style?.fontSize ?? node.fontSize;
	const family = style?.fontFamily ?? node.fontName?.family;
	const weight = style?.fontWeight ?? fontWeightFromStyleName(node.fontName?.style) ?? fontWeightFromMeta(node.fontName, node.derivedTextData?.fontMetaData);
	return {
		...fontSize ? { fontSize } : {},
		...family ? { fontFamily: `"${family}", ${FALLBACK_FONT_STACK}` } : {},
		...weight ? { fontWeight: weight } : {}
	};
}
function colorStyles(node, nodeId, ctx) {
	const color = firstSolidColor(node.textData?.style?.fillPaints ?? node.fillPaints, nodeId, ctx);
	return color ? { color } : {};
}
function letterSpacingCss(spacing) {
	if (spacing?.value === void 0) return void 0;
	if (spacing.units === "PIXELS") return `${spacing.value}px`;
	if (spacing.units === "PERCENT") return `${spacing.value / 100}em`;
}
function decorationStyles(node) {
	if (node.textDecoration === "UNDERLINE") return { textDecoration: "underline" };
	if (node.textDecoration === "STRIKETHROUGH") return { textDecoration: "line-through" };
	return {};
}
var CAP_TO_BASELINE_TRIM = {
	textBoxTrim: "trim-both",
	textBoxEdge: "cap alphabetic"
};
function roundedPx(value) {
	return Math.round(value * 100) / 100;
}
function baselineAlignedStyles(node) {
	const baselines = node.derivedTextData?.baselines;
	const firstBaseline = baselines?.[0]?.position?.y;
	const lastBaseline = baselines?.[baselines.length - 1]?.position?.y;
	const height = node.size?.y;
	if (firstBaseline === void 0 || lastBaseline === void 0 || !height) return null;
	return {
		...CAP_TO_BASELINE_TRIM,
		paddingTop: `calc(${roundedPx(firstBaseline)}px - 1cap)`,
		paddingBottom: Math.max(roundedPx(height - lastBaseline), 0)
	};
}
function verticalTrimStyles(node) {
	const aligned = isLineClamped(node) ? null : baselineAlignedStyles(node);
	if (aligned) return aligned;
	return node.leadingTrim === "CAP_HEIGHT" ? CAP_TO_BASELINE_TRIM : {};
}
function measuredLineHeight(node) {
	return node.derivedTextData?.baselines?.find((line) => typeof line.lineHeight === "number" && line.lineHeight > 0)?.lineHeight;
}
function lineHeightCss(node) {
	const measured = measuredLineHeight(node);
	if (measured !== void 0) return `${measured}px`;
	const lineHeight = node.lineHeight;
	if (lineHeight?.value === void 0) return void 0;
	if (lineHeight.units === "PERCENT") return lineHeight.value / 100;
	if (lineHeight.units === "PIXELS") return `${lineHeight.value}px`;
	if (lineHeight.units === "RAW") return lineHeight.value;
}
function hasMeasuredWidth(node) {
	return !!node.size?.x;
}
function wrappingStyles(node) {
	const autoResize = node.textAutoResize;
	if (hasLineBreaks(node)) return {
		whiteSpace: "pre",
		...(autoResize === "HEIGHT" || autoResize === "WIDTH_AND_HEIGHT") && hasMeasuredWidth(node) ? { display: "block" } : {}
	};
	if (autoResize === "WIDTH_AND_HEIGHT") return { whiteSpace: "nowrap" };
	if (autoResize === "HEIGHT" && hasMeasuredWidth(node)) return { display: "block" };
	return {};
}
function isLineClamped(node) {
	return node.textTruncation === "ENDING" && (node.maxLines ?? 0) > 0;
}
function maxLinesStyles(node) {
	if (!isLineClamped(node)) return {};
	return {
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: node.maxLines,
		overflow: "hidden"
	};
}
function mapTextStyles(node, nodeId, ctx) {
	const letterSpacing = letterSpacingCss(node.letterSpacing);
	const lineHeight = lineHeightCss(node);
	const textAlign = node.textAlignHorizontal ? TEXT_ALIGN[node.textAlignHorizontal] : void 0;
	return {
		...fontStyles(node),
		...colorStyles(node, nodeId, ctx),
		...letterSpacing ? { letterSpacing } : {},
		...decorationStyles(node),
		...verticalTrimStyles(node),
		...lineHeight !== void 0 ? { lineHeight } : {},
		...textAlign ? { textAlign } : {},
		...wrappingStyles(node),
		...maxLinesStyles(node)
	};
}
function autoSizedDimensions(node) {
	switch (node.textAutoResize) {
		case "WIDTH_AND_HEIGHT": return ["width", "height"];
		case "HEIGHT": return hasLineBreaks(node) ? [] : ["height"];
		case "WIDTH": return ["width"];
		default: return [];
	}
}
function withoutAutoSizedDimensions(node, styles) {
	return withoutKeys(styles, autoSizedDimensions(node));
}

export { mapTextStyles, withoutAutoSizedDimensions };
