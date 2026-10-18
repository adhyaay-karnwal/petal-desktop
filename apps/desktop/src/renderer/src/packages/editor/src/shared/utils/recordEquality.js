// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/recordEquality.ts

function isEmptyRecord(a) {
	return !a || Object.keys(a).length === 0;
}
/** Shallow compare; nested objects compare by JSON. Missing and empty are equal. */
function shallowEqualRecords(a, b) {
	if (a === b) return true;
	if (isEmptyRecord(a) && isEmptyRecord(b)) return true;
	if (!a || !b) return false;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	for (const k of aKeys) {
		if (!(k in b)) return false;
		if (a[k] !== b[k]) {
			if (typeof a[k] === "object" && a[k] !== null && typeof b[k] === "object" && b[k] !== null) try {
				if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
			} catch {
				return false;
			}
			else return false;
		}
	}
	return true;
}

export { shallowEqualRecords };
