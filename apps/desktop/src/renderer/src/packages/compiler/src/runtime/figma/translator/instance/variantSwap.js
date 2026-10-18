// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/variantSwap.ts
import { figGuidKey } from "../../utils/node.js";
import { figmaNodeById } from "../model/node.js";

var VARIANT_LAYOUT_FIELDS = [
	"stackMode",
	"stackSpacing",
	"stackPrimarySizing",
	"stackCounterSizing",
	"stackPrimaryAlignItems",
	"stackCounterAlignItems",
	"stackHorizontalPadding",
	"stackVerticalPadding",
	"stackPaddingRight",
	"stackPaddingBottom",
	"frameMaskDisabled",
	"clipsContent"
];
function copyFieldFrom(target, source, field) {
	const value = source[field];
	if (value !== void 0) target[field] = structuredClone(value);
	else delete target[field];
}
function swapToVariant(target, variantId, ctx) {
	const variantKey = figGuidKey(variantId);
	const variant = variantKey ? figmaNodeById(ctx, variantKey) : void 0;
	if (target.type !== "INSTANCE" || !variant) return;
	target.symbolData = {
		...target.symbolData,
		symbolID: variantId
	};
	if (variant.size) target.size = structuredClone(variant.size);
	copyFieldFrom(target, variant, "effects");
	for (const field of VARIANT_LAYOUT_FIELDS) copyFieldFrom(target, variant, field);
}

export { swapToVariant };
