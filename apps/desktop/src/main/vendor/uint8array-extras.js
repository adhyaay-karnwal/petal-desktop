// Reconstructed from index.js — original module: vendor/uint8array-extras
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_semver } from "./semver.js";

var import_semver = /* @__PURE__ */ require_rolldown_runtime.__toESM(require_semver(), 1);
var objectToString = Object.prototype.toString;
var uint8ArrayStringified = "[object Uint8Array]";
var arrayBufferStringified = "[object ArrayBuffer]";
function isType(value, typeConstructor, typeStringified) {
	if (!value) return false;
	if (value.constructor === typeConstructor) return true;
	return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
	return isType(value, Uint8Array, uint8ArrayStringified);
}
function isArrayBuffer(value) {
	return isType(value, ArrayBuffer, arrayBufferStringified);
}
function isUint8ArrayOrArrayBuffer(value) {
	return isUint8Array(value) || isArrayBuffer(value);
}
function assertUint8Array(value) {
	if (!isUint8Array(value)) throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
}
function assertUint8ArrayOrArrayBuffer(value) {
	if (!isUint8ArrayOrArrayBuffer(value)) throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
}
function concatUint8Arrays(arrays, totalLength) {
	if (arrays.length === 0) return /* @__PURE__ */ new Uint8Array(0);
	totalLength ??= arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);
	const returnValue = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		assertUint8Array(array);
		returnValue.set(array, offset);
		offset += array.length;
	}
	return returnValue;
}
var cachedDecoders = { utf8: new globalThis.TextDecoder("utf8") };
function uint8ArrayToString(array, encoding = "utf8") {
	assertUint8ArrayOrArrayBuffer(array);
	cachedDecoders[encoding] ??= new globalThis.TextDecoder(encoding);
	return cachedDecoders[encoding].decode(array);
}
function assertString(value) {
	if (typeof value !== "string") throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
}
var cachedEncoder = new globalThis.TextEncoder();
function stringToUint8Array(string) {
	assertString(string);
	return cachedEncoder.encode(string);
}
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));

export { concatUint8Arrays, import_semver, stringToUint8Array, uint8ArrayToString };
