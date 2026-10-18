// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/multiSelect.ts
import { MIXED } from "../types.js";

/**
* Get a merged value from multiple elements. Returns the common value if all
* elements have the same value, or `MIXED` if values differ.
*/
function getMergedValue(elements, getter) {
	let value = void 0;
	let first = true;
	for (const el of elements) {
		const v = getter(el);
		if (first) {
			value = v;
			first = false;
		} else if (value !== v) {
			if (typeof value === "object" && typeof v === "object") {
				if (JSON.stringify(value) !== JSON.stringify(v)) return MIXED;
			} else return MIXED;
		}
	}
	return value;
}
/** True when `value` is the MIXED sentinel. */
function isMixed(value) {
	return value === MIXED;
}

export { getMergedValue, isMixed };
