// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/fontUtils.ts
import { clearGoogleFontLinks, syncGoogleFontLinks } from "../../shell/utils/fontLoader.js";
import { cssString } from "../../../../compiler/src/runtime/fontTypes.js";

/**
* Font Utilities — Browser-side font injection
*
* Shared across web cloud and Electron renderer.
* Takes parsed font config and injects <link>, @font-face, and CSS variables into the DOM.
*/
var LOCAL_FONTS_STYLE_ID = "petal-project-local-fonts";
var FONT_VARS_STYLE_ID = "petal-project-font-vars";
var FONT_FAMILY_STYLE_ID = "petal-project-font-style";
/** Document order: later tags win ties between the variable blocks. */
var STYLE_IDS = [
	LOCAL_FONTS_STYLE_ID,
	FONT_VARS_STYLE_ID,
	FONT_FAMILY_STYLE_ID
];
/**
* Apply fonts to the document.
*
* - Google fonts → inject <link> to Google Fonts CDN + CSS variable bindings
* - Local fonts → generate @font-face rules + CSS variable bindings
* - Sets font-family on canvas elements
*
* @param fonts - Parsed font config from parseFontsFromLayout()
* @param assetResolver - How to resolve local font paths. Either:
*   - A string prefix: final URL = `${prefix}/app/${fontPath}`  (Electron)
*   - A function: final URL = resolver(`app/${fontPath}`)  (Cloud — for query-param APIs)
*/
function applyFonts(fonts, assetResolver) {
	const styles = /* @__PURE__ */ new Map();
	let primaryFontFamily = null;
	if (fonts.local.length > 0) {
		const fontFaceRules = [];
		const cssVarBindings = [];
		for (const localFont of fonts.local) {
			if (!primaryFontFamily) primaryFontFamily = localFont.name;
			cssVarBindings.push(`  ${localFont.variable}: "${localFont.name}";`);
			for (const file of localFont.files) {
				const fontPath = file.path;
				const segments = [];
				for (const segment of `${localFont.basePath ?? "app"}/${fontPath}`.split("/")) if (segment === "..") segments.pop();
				else if (segment && segment !== ".") segments.push(segment);
				const relativePath = segments.join("/");
				const fontUrl = typeof assetResolver === "function" ? assetResolver(relativePath) : assetResolver ? `${assetResolver}/${relativePath}` : `/${relativePath}`;
				const ext = fontPath.split(".").pop();
				const format = ext === "otf" ? "opentype" : ext === "ttf" ? "truetype" : ext === "woff2" ? "woff2" : "woff";
				fontFaceRules.push(`@font-face { font-family: "${localFont.name}"; src: url("${fontUrl}") format("${format}"); font-weight: ${file.weight}; font-style: ${file.style}; font-display: swap; }`);
			}
		}
		if (fontFaceRules.length > 0) {
			const varBlock = cssVarBindings.length > 0 ? `\n[data-element-id], .petal-canvas {\n${cssVarBindings.join("\n")}\n}` : "";
			styles.set(LOCAL_FONTS_STYLE_ID, fontFaceRules.join("\n") + varBlock);
		}
	}
	if (fonts.google.length > 0) {
		const localFamilies = new Set(fonts.local.map((font) => font.name.toLowerCase()));
		const googleFamilies = [];
		for (const font of fonts.google) {
			const name = font.name.replace(/_/g, " ");
			if (!localFamilies.has(name.toLowerCase())) googleFamilies.push(name);
		}
		syncGoogleFontLinks("project", googleFamilies);
		const cssVarRules = [];
		for (const f of fonts.google) if (f.variable) {
			const displayName = f.name.replace(/_/g, " ");
			cssVarRules.push(`  ${f.variable}: "${displayName}";`);
		}
		if (cssVarRules.length > 0) styles.set(FONT_VARS_STYLE_ID, `:root, [data-element-id], .petal-canvas {\n${cssVarRules.join("\n")}\n}`);
		if (!primaryFontFamily) primaryFontFamily = fonts.google[0].name.replace(/_/g, " ");
	}
	if (primaryFontFamily) {
		const fontFamily = `${cssString(primaryFontFamily)}, sans-serif`;
		styles.set(FONT_FAMILY_STYLE_ID, `@layer base { :where([data-canvas-root-id], .petal-canvas) { font-family: ${fontFamily}; } }`);
	}
	if (fonts.google.length === 0) clearGoogleFontLinks("project");
	syncStyles(styles);
}
/**
* Remove all font-related style/link elements injected by applyFonts.
*/
function cleanupFonts() {
	clearGoogleFontLinks("project");
	for (const id of STYLE_IDS) document.getElementById(id)?.remove();
}
/**
* Bring the style tags in line with `styles`, touching only the ones that
* differ. Inserting or rewriting a `<style>` restyles the whole document,
* which on a large canvas costs hundreds of milliseconds.
*/
function syncStyles(styles) {
	let next = null;
	for (let index = STYLE_IDS.length - 1; index >= 0; index--) {
		const id = STYLE_IDS[index];
		let el = document.getElementById(id);
		const content = styles.get(id);
		if (content === void 0) {
			el?.remove();
			continue;
		}
		if (!el) {
			el = document.createElement("style");
			el.id = id;
			el.textContent = content;
			document.head.insertBefore(el, next);
		} else if (el.textContent !== content) el.textContent = content;
		next = el;
	}
}

export { applyFonts, cleanupFonts };
