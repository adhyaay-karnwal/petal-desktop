// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/paddingStyles.ts

var SIDES$1 = [
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft"
];
function paddingEditBase(styles, updates) {
	return SIDES$1.some((side) => side in updates) ? normalizePaddingStyles(styles) : styles;
}
function splitValues(value) {
	const parts = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < value.length; i++) {
		if (value[i] === "(") depth++;
		if (value[i] === ")") depth--;
		if (depth < 0) return [];
		if (depth === 0 && /\s/.test(value[i])) {
			if (i > start) parts.push(value.slice(start, i));
			start = i + 1;
		}
	}
	if (depth !== 0) return [];
	if (start < value.length) parts.push(value.slice(start));
	return parts;
}
/**
* Give React one property per padding side. Mixing a shorthand with its
* longhands lets React clear a side without reapplying an unchanged shorthand
* (for example when undo removes paddingLeft beside padding: 16px).
* Preserve declaration order so a later shorthand still wins over a longhand.
*/
function normalizePaddingStyles(styles) {
	if (styles?.padding == null || styles.padding === "") return styles;
	const value = styles.padding;
	if (typeof value === "string" && /var\(|env\(/.test(value)) return styles;
	const parts = typeof value === "number" ? [value] : splitValues(value.trim());
	if (!parts?.length || parts.length > 4) return styles;
	const [top, right = top, bottom = top, left = right] = parts;
	const values = [
		top,
		right,
		bottom,
		left
	];
	const result = {};
	for (const [key, entry] of Object.entries(styles)) if (key === "padding") SIDES$1.forEach((side, index) => {
		result[side] = values[index];
	});
	else result[key] = entry;
	return result;
}

export { normalizePaddingStyles, paddingEditBase };
