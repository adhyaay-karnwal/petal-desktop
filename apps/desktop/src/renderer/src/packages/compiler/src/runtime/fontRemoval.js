// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/fontRemoval.ts

var DEFAULT_FONT_FAMILY = "ui-sans-serif, system-ui, sans-serif";
var normalize$6 = (value) => value.trim().replace(/^["']|["']$/g, "").toLowerCase();
function fontRemovalNames(families) {
	return new Set(families.map(normalize$6));
}
function referencesRemovedFont(value, names) {
	return (value.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,]+/g) ?? []).some((part) => names.has(normalize$6(part)));
}
function resetFontShorthand(value, names) {
	for (const name of names) {
		const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const pattern = new RegExp(`(^|[\\s,])(?:"${escaped}"|'${escaped}'|${escaped})(?=\\s*(?:,|$))`, "gi");
		value = value.replace(pattern, `$1${DEFAULT_FONT_FAMILY}`);
	}
	return value;
}
function resetFontClasses(value, names) {
	return value.replace(/\S+/g, (token) => {
		const match = token.match(/^(.*:)?font-\[(?:family-name:)?(.+)\]$/);
		if (!match || !referencesRemovedFont(match[2].replace(/_/g, " "), names)) return token;
		return `${match[1] ?? ""}font-sans`;
	});
}
/** Preserve untouched objects so this can also update live immutable canvas stores. */
function resetRemovedFonts(value, families) {
	if (!families.length) return value;
	const names = fontRemovalNames(families);
	function visit(input) {
		if (!input || typeof input !== "object") return input;
		if (input instanceof Map) {
			let next;
			for (const [key, item] of input) {
				const updated = visit(item);
				if (updated !== item) {
					next ??= new Map(input);
					next.set(key, updated);
				}
			}
			return next ?? input;
		}
		let next;
		for (const [key, item] of Object.entries(input)) {
			const updated = (key === "fontFamily" || key === "font-family") && typeof item === "string" && referencesRemovedFont(item, names) ? DEFAULT_FONT_FAMILY : key === "font" && typeof item === "string" ? resetFontShorthand(item, names) : (key === "className" || key === "class") && typeof item === "string" ? resetFontClasses(item, names) : visit(item);
			if (updated !== item) {
				next ??= Array.isArray(input) ? [...input] : { ...input };
				next[key] = updated;
			}
		}
		return next ?? input;
	}
	return visit(value);
}

export { resetRemovedFonts };
