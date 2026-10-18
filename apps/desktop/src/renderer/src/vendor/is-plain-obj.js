// Reconstructed from index-C74mRL57.js — original module: vendor/is-plain-obj

function isPlainObject$1(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

export { isPlainObject$1 };
