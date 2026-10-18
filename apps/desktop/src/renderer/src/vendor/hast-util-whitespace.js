// Reconstructed from index-C74mRL57.js — original module: vendor/hast-util-whitespace

/**
* @typedef {import('hast').Nodes} Nodes
*/
var re$1 = /[ \t\n\f\r]/g;
/**
* Check if the given value is *inter-element whitespace*.
*
* @param {Nodes | string} thing
*   Thing to check (`Node` or `string`).
* @returns {boolean}
*   Whether the `value` is inter-element whitespace (`boolean`): consisting of
*   zero or more of space, tab (`\t`), line feed (`\n`), carriage return
*   (`\r`), or form feed (`\f`); if a node is passed it must be a `Text` node,
*   whose `value` field is checked.
*/
function whitespace(thing) {
	return typeof thing === "object" ? thing.type === "text" ? empty$2(thing.value) : false : empty$2(thing);
}
/**
* @param {string} value
* @returns {boolean}
*/
function empty$2(value) {
	return value.replace(re$1, "") === "";
}

export { whitespace };
