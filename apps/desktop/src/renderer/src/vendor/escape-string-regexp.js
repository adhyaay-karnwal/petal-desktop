// Reconstructed from index-C74mRL57.js — original module: vendor/escape-string-regexp

function escapeStringRegexp(string) {
	if (typeof string !== "string") throw new TypeError("Expected a string");
	return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

export { escapeStringRegexp };
