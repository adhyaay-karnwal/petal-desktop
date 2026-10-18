// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/googleFonts.ts
import { __exportAll } from "../../../../__bundle__/_runtime.js";
import { ROOT } from "../store/types.js";
import { ensureV2 } from "../store/ensureV2.js";
import { getById, walk } from "../store/read.js";
import { GOOGLE_FONTS } from "./googleFontsCatalog.js";

/**
* Google Fonts catalog access + helpers shared by the editor (font picker list)
* and the css-builder (deriving @font-face links from actual usage).
*
* Font loading is a pure function of usage: the css-builder scans inline
* font-family values across all canvas elements and emits a single combined
* Google Fonts stylesheet URL. Nothing is persisted, so unused fonts never
* linger — replacing or deleting text simply drops the family next rebuild.
*/
var googleFonts_exports = /* @__PURE__ */ __exportAll({
	GOOGLE_FONTS: () => GOOGLE_FONTS,
	buildGoogleFontsUrl: () => buildGoogleFontsUrl,
	extractInlineFontFamilies: () => extractInlineFontFamilies
});
/** Family name → available weights, for quick lookup + Google-font gating. */
var FONTS_BY_FAMILY = new Map(GOOGLE_FONTS.map((f) => [f.family.toLowerCase(), f]));
/** Extract the primary family name from a CSS font-family value, unquoted. */
function parseFontFamily(value) {
	return (value.split(",")[0]?.trim() ?? "").replace(/^["']|["']$/g, "").trim();
}
/**
* Walk canvas elements and collect the set of inline font-family names in use.
* Accepts the live editor Store or persisted wire, legacy, and envelope shapes.
*/
function extractInlineFontFamilies(input) {
	const candidate = input;
	const store = candidate?.byId instanceof Map && candidate.childrenByParent instanceof Map && candidate.parentByChild instanceof Map ? candidate : ensureV2(input);
	const families = /* @__PURE__ */ new Set();
	walk(store, ROOT, (id) => {
		const ff = getById(store, id)?.styles?.fontFamily;
		if (typeof ff === "string" && ff.trim()) {
			const name = parseFontFamily(ff);
			if (name) families.add(name);
		}
	});
	return families;
}
/**
* Build one combined Google Fonts css2 stylesheet URL for the given families,
* requesting each family's available weights. Non-Google families are ignored.
* Returns null when none of the families are Google fonts.
*/
function buildGoogleFontsUrl(families, preview = false) {
	const seen = /* @__PURE__ */ new Set();
	const params = [];
	for (const family of families) {
		const font = FONTS_BY_FAMILY.get(family.toLowerCase());
		if (!font || seen.has(font.family)) continue;
		seen.add(font.family);
		const fam = encodeURIComponent(font.family).replace(/%20/g, "+");
		const weights = font.weights;
		if (preview) params.push(`family=${fam}`);
		else if (font.italicWeights?.length) {
			const variants = [...weights.map((w) => `0,${w}`), ...font.italicWeights.map((w) => `1,${w}`)];
			params.push(`family=${fam}:ital,wght@${variants.join(";")}`);
		} else params.push(`family=${fam}${weights.length ? `:wght@${weights.join(";")}` : ""}`);
	}
	if (params.length === 0) return null;
	params.sort();
	return `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
}

export { buildGoogleFontsUrl, extractInlineFontFamilies, googleFonts_exports };
