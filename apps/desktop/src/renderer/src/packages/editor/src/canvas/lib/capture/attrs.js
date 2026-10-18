// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/capture/attrs.ts
import { CAPTURE_ATTRS, SKIP_ATTR_PREFIXES } from "./constants.js";

/**
* DOM attribute → React props extraction.
*/
/** Autofill tokens for card numbers and codes, passwords and one-time codes. */
var SENSITIVE_AUTOCOMPLETE = /(^|\s)(cc-[\w-]+|current-password|new-password|one-time-code)(\s|$)/i;
/** A password field a "show password" toggle switched to `type="text"` keeps its name. */
var SENSITIVE_NAME = /pass(word|wd)?|pwd|otp|cvc|cvv|card.?num/i;
/**
* An input whose value must not be captured: one that is secret (passwords,
* card numbers, one-time codes), browser-managed (file) or not meant to render (hidden).
*/
function isSensitiveInput(el) {
	if (typeof HTMLInputElement === "undefined" || !(el instanceof HTMLInputElement)) return false;
	if ([
		"password",
		"file",
		"hidden"
	].includes(el.type)) return true;
	if (SENSITIVE_AUTOCOMPLETE.test(el.autocomplete ?? "")) return true;
	return SENSITIVE_NAME.test(`${el.name ?? ""} ${el.id ?? ""}`);
}
/**
* Next's image optimizer serves the picture from `/_next/image?url=...`.
* `currentSrc` is that proxy (often `localhost`), which the canvas cannot
* load once the preview is gone. The `url` query is the real image.
*/
function unwrapNextImage(src) {
	try {
		const url = new URL(src, "http://localhost");
		if (url.pathname !== "/_next/image") return src;
		const inner = url.searchParams.get("url");
		if (!inner) return src;
		if (/^(https?:|data:)/i.test(inner)) return inner;
		return src;
	} catch {
		return src;
	}
}
/**
* Copy DOM attributes worth keeping to a React-style props object.
* Returns undefined if nothing meaningful was captured.
*/
function getAttrs$2(el) {
	const props = {};
	let n = 0;
	for (const attr of Array.from(el.attributes)) {
		const name = attr.name.toLowerCase();
		if (SKIP_ATTR_PREFIXES.some((p) => name.startsWith(p))) continue;
		if (name === "class") {
			if (attr.value) {
				props.className = attr.value;
				n++;
			}
		} else if (name === "style") continue;
		else if (CAPTURE_ATTRS.has(name)) {
			if (name === "value" && isSensitiveInput(el)) continue;
			const reactName = name === "for" ? "htmlFor" : name === "readonly" ? "readOnly" : name;
			props[reactName] = attr.value;
			n++;
		} else if (name.startsWith("aria-") || name.startsWith("data-")) {
			props[name] = attr.value;
			n++;
		}
	}
	if (typeof HTMLImageElement !== "undefined" && el instanceof HTMLImageElement) {
		const src = el.currentSrc || (typeof props.src === "string" ? props.src : "");
		if (src) {
			props.src = unwrapNextImage(src);
			n++;
		}
	}
	return n > 0 ? props : void 0;
}

export { getAttrs$2, isSensitiveInput };
