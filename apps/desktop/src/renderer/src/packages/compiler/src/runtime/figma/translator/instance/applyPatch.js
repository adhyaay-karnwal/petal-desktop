// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/instance/applyPatch.ts
import { isAbsoluteInAutoLayout, parentIdOf } from "../model/node.js";
import { isNearly } from "../model/matrix.js";

function visibleChildren(subtree, parentId) {
	return [...subtree.values()].filter((node) => parentIdOf(node) === parentId && node.visible !== false);
}
function heightOf(node) {
	return node.size?.y ?? 0;
}
function heightNeededForChildren(parent, children) {
	if (parent.stackMode === "VERTICAL") {
		const stacked = children.filter((child) => !isAbsoluteInAutoLayout(child));
		const gaps = stacked.length > 1 ? (stacked.length - 1) * (parent.stackSpacing ?? 0) : 0;
		const padding = (parent.stackVerticalPadding ?? 0) + (parent.stackPaddingBottom ?? 0);
		return stacked.reduce((sum, child) => sum + heightOf(child), 0) + gaps + padding;
	}
	return children.reduce((bottom, child) => Math.max(bottom, (child.transform?.m12 ?? 0) + heightOf(child)), 0);
}
function growParentToFitText(subtree, text) {
	const parentId = parentIdOf(text);
	const parent = parentId ? subtree.get(parentId) : void 0;
	if (!parentId || !parent || parent.type === "TEXT") return;
	const size = parent.size;
	if (size) {
		const needed = heightNeededForChildren(parent, visibleChildren(subtree, parentId));
		if (needed > (size.y ?? 0)) size.y = needed;
	}
	if (text.textAutoResize === "WIDTH_AND_HEIGHT" && parent.stackMode === "HORIZONTAL" && size && "x" in size) Reflect.deleteProperty(size, "x");
}
function singleLineBaseline(template, scale, characterCount) {
	const lineHeight = (template.lineHeight ?? 0) * scale;
	const ascent = template.lineAscent !== void 0 ? template.lineAscent * scale : void 0;
	return {
		lineHeight,
		...ascent !== void 0 ? { lineAscent: ascent } : {},
		position: {
			x: 0,
			y: ascent ?? lineHeight
		},
		lineY: 0,
		firstCharacter: 0,
		endCharacter: characterCount
	};
}
function fontScale(previousFontSize, nextFontSize) {
	return previousFontSize && nextFontSize && previousFontSize > 0 ? nextFontSize / previousFontSize : 1;
}
function scaledBaseline(baseline, scale) {
	const times = (value) => value === void 0 ? void 0 : value * scale;
	return {
		...baseline,
		lineHeight: times(baseline.lineHeight),
		lineAscent: times(baseline.lineAscent),
		lineY: times(baseline.lineY),
		position: {
			...baseline.position,
			y: times(baseline.position?.y)
		}
	};
}
function rescaleForFontSize(target, scale) {
	const derived = target.derivedTextData;
	if (derived?.baselines) derived.baselines = derived.baselines.map((line) => scaledBaseline(line, scale));
	const size = target.size;
	if (!size) return;
	if (target.textAutoResize === "HEIGHT" || target.textAutoResize === "WIDTH_AND_HEIGHT") size.y = (size.y ?? 0) * scale;
	if (target.textAutoResize === "WIDTH_AND_HEIGHT") size.x = (size.x ?? 0) * scale;
}
function refreshTextMetrics(target, patch, previousFontSize, template) {
	const derived = target.derivedTextData;
	if ("derivedTextData" in patch || !derived) return;
	const scale = fontScale(previousFontSize, patch.fontSize ?? previousFontSize);
	if (patch.textData) {
		const characters = patch.textData.characters ?? "";
		delete derived.baselines;
		if (template?.lineHeight !== void 0 && !characters.includes("\n") && !isNearly(scale, 1)) {
			const baseline = singleLineBaseline(template, scale, characters.length);
			derived.baselines = [baseline];
			if (target.size) target.size.y = baseline.lineHeight ?? target.size.y;
		}
	} else if (!isNearly(scale, 1)) rescaleForFontSize(target, scale);
	if (patch.fontName) delete derived.fontMetaData;
}
function applyOverridePatch(subtree, target, patch) {
	const previousFontSize = target.fontSize;
	const templateBaseline = target.derivedTextData?.baselines ? structuredClone(target.derivedTextData.baselines)[0] : void 0;
	Object.assign(target, structuredClone(patch));
	refreshTextMetrics(target, patch, previousFontSize, templateBaseline);
	if ((!!patch.textData || patch.fontSize !== void 0) && target.visible !== false) growParentToFitText(subtree, target);
}

export { applyOverridePatch };
