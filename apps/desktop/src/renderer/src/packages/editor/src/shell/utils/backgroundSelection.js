// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/backgroundSelection.ts
import { getTailwindCategory } from "../../shared/utils/tailwindScale.js";

var BACKGROUND_STYLE_KEYS = [
	"backgroundColor",
	"backgroundImage",
	"background",
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundBlendMode"
];
function classNameOf$2(el) {
	if ("props" in el) return String(el.props?.className ?? "");
	if (el.type === "text") return String(el.className ?? "");
	return "";
}
/** The element's `bg-*` classes, in source order. */
function backgroundClassesOf(el) {
	return classNameOf$2(el).split(/\s+/).filter((c) => c && getTailwindCategory(c) === "background");
}
function backgroundKey(el) {
	const styles = el.styles ?? {};
	return [...BACKGROUND_STYLE_KEYS.map((k) => String(styles[k] ?? "")), ...backgroundClassesOf(el).sort()].join("\0");
}
/** True when the elements don't all have the same background. */
function isBackgroundMixed(elements) {
	if (elements.length < 2) return false;
	const first = backgroundKey(elements[0]);
	return elements.some((el) => backgroundKey(el) !== first);
}
/** Every `bg-*` class used anywhere in the selection, without duplicates. */
function selectionBackgroundClasses(elements) {
	return [...new Set(elements.flatMap(backgroundClassesOf))];
}

export { isBackgroundMixed, selectionBackgroundClasses };
