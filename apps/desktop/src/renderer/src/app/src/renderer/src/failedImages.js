// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/failedImages.ts

/**
* Images in the captured subtree that failed to load: a dead or mistyped URL.
* The agent cannot tell a broken photo from an empty box in a screenshot, so
* the result names them and it fixes them all in one patch.
*/
function failedImages(el) {
	const unloaded = [...el.localName === "img" ? [el] : [], ...Array.from(el.querySelectorAll("img"))].filter((img) => img.complete && img.naturalWidth === 0 && !!img.getAttribute("src")).map((img) => ({
		id: img.closest("[data-element-id]")?.getAttribute("data-element-id") ?? "",
		src: img.getAttribute("src")
	}));
	const placeholders = [...el.matches(FAILED_PLACEHOLDER) ? [el] : [], ...Array.from(el.querySelectorAll(FAILED_PLACEHOLDER))].map((box) => ({
		id: box.getAttribute("data-element-id") ?? "",
		src: box.getAttribute("data-failed-src")
	}));
	return [...unloaded, ...placeholders].filter((img) => img.id);
}
var FAILED_PLACEHOLDER = "[data-media-placeholder=\"error\"][data-failed-src]";

export { failedImages };
