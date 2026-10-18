// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/createTextElement.ts
import { EDITOR_DARK_CLASS } from "../../../../ui/src/hooks/useEditorTheme.js";
import { generatePrefixedId } from "./idUtils.js";

/** Pick the higher-contrast endpoint using WCAG's sRGB relative luminance.
* https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
*/
function contrastingTextColor(red, green, blue) {
	const linear = (channel) => {
		const value = channel / 255;
		return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
	};
	const luminance = .2126 * linear(red) + .7152 * linear(green) + .0722 * linear(blue);
	return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? "#000000" : "#ffffff";
}
function insertionTextColor() {
	if (typeof document === "undefined") return "#000000";
	const dark = document.documentElement.classList.contains(EDITOR_DARK_CLASS);
	const fallback = dark ? "#ffffff" : "#000000";
	const viewport = document.querySelector("[data-canvas-viewport]");
	if (!viewport) return fallback;
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1;
	const context = canvas.getContext("2d");
	if (!context) return fallback;
	const backgrounds = [];
	for (let element = viewport; element; element = element.parentElement) backgrounds.push(getComputedStyle(element).backgroundColor);
	context.fillStyle = dark ? "#000000" : "#ffffff";
	context.fillRect(0, 0, 1, 1);
	for (const background of backgrounds.reverse()) {
		context.fillStyle = background;
		context.fillRect(0, 0, 1, 1);
	}
	const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
	return contrastingTextColor(red, green, blue);
}
/** Save the insertion-time color so changing appearance doesn't recolor text. */
function createTextElement() {
	return {
		id: generatePrefixedId("text"),
		type: "text",
		tag: "span",
		text: "Text",
		styles: { color: insertionTextColor() }
	};
}

export { createTextElement };
