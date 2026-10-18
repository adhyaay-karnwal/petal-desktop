// Reconstructed from index-C74mRL57.js — original module: vendor/estree-util-is-identifier-name

var nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
/** @type {Options} */
var emptyOptions$5 = {};
/**
* Checks if the given value is a valid identifier name.
*
* @param {string} name
*   Identifier to check.
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {boolean}
*   Whether `name` can be an identifier.
*/
function name$3(name, options) {
	return ((options || emptyOptions$5).jsx ? nameReJsx : nameRe).test(name);
}

export { name$3 };
