// Reconstructed from index-C74mRL57.js — original module: vendor/space-separated-tokens

/**
* Serialize an array of strings as space separated-tokens.
*
* @param {Array<string|number>} values
*   List of tokens.
* @returns {string}
*   Space-separated tokens.
*/
function stringify(values) {
	return values.join(" ").trim();
}

export { stringify };
