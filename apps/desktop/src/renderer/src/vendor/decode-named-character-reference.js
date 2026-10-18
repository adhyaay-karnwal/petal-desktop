// Reconstructed from index-C74mRL57.js — original module: vendor/decode-named-character-reference

var element$1 = document.createElement("i");
/**
* @param {string} value
* @returns {string | false}
*/
function decodeNamedCharacterReference(value) {
	const characterReference = "&" + value + ";";
	element$1.innerHTML = characterReference;
	const character = element$1.textContent;
	if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") return false;
	return character === characterReference ? false : character;
}

export { decodeNamedCharacterReference };
