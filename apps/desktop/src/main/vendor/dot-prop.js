// Reconstructed from index.js — original module: vendor/dot-prop

var isObject$1 = (value) => {
	const type = typeof value;
	return value !== null && (type === "object" || type === "function");
};
var disallowedKeys = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
var MAX_ARRAY_INDEX = 1e6;
var isDigit = (character) => character >= "0" && character <= "9";
function shouldCoerceToNumber(segment) {
	if (segment === "0") return true;
	if (/^[1-9]\d*$/.test(segment)) {
		const parsedNumber = Number.parseInt(segment, 10);
		return parsedNumber <= Number.MAX_SAFE_INTEGER && parsedNumber <= MAX_ARRAY_INDEX;
	}
	return false;
}
function processSegment(segment, parts) {
	if (disallowedKeys.has(segment)) return false;
	if (segment && shouldCoerceToNumber(segment)) parts.push(Number.parseInt(segment, 10));
	else parts.push(segment);
	return true;
}
function parsePath(path) {
	if (typeof path !== "string") throw new TypeError(`Expected a string, got ${typeof path}`);
	const parts = [];
	let currentSegment = "";
	let currentPart = "start";
	let isEscaping = false;
	let position = 0;
	for (const character of path) {
		position++;
		if (isEscaping) {
			currentSegment += character;
			isEscaping = false;
			continue;
		}
		if (character === "\\") {
			if (currentPart === "index") throw new Error(`Invalid character '${character}' in an index at position ${position}`);
			if (currentPart === "indexEnd") throw new Error(`Invalid character '${character}' after an index at position ${position}`);
			isEscaping = true;
			currentPart = currentPart === "start" ? "property" : currentPart;
			continue;
		}
		switch (character) {
			case ".":
				if (currentPart === "index") throw new Error(`Invalid character '${character}' in an index at position ${position}`);
				if (currentPart === "indexEnd") {
					currentPart = "property";
					break;
				}
				if (!processSegment(currentSegment, parts)) return [];
				currentSegment = "";
				currentPart = "property";
				break;
			case "[":
				if (currentPart === "index") throw new Error(`Invalid character '${character}' in an index at position ${position}`);
				if (currentPart === "indexEnd") {
					currentPart = "index";
					break;
				}
				if (currentPart === "property" || currentPart === "start") {
					if ((currentSegment || currentPart === "property") && !processSegment(currentSegment, parts)) return [];
					currentSegment = "";
				}
				currentPart = "index";
				break;
			case "]":
				if (currentPart === "index") {
					if (currentSegment === "") {
						currentSegment = (parts.pop() || "") + "[]";
						currentPart = "property";
					} else {
						const parsedNumber = Number.parseInt(currentSegment, 10);
						if (!Number.isNaN(parsedNumber) && Number.isFinite(parsedNumber) && parsedNumber >= 0 && parsedNumber <= Number.MAX_SAFE_INTEGER && parsedNumber <= MAX_ARRAY_INDEX && currentSegment === String(parsedNumber)) parts.push(parsedNumber);
						else parts.push(currentSegment);
						currentSegment = "";
						currentPart = "indexEnd";
					}
					break;
				}
				if (currentPart === "indexEnd") throw new Error(`Invalid character '${character}' after an index at position ${position}`);
				currentSegment += character;
				break;
			default:
				if (currentPart === "index" && !isDigit(character)) throw new Error(`Invalid character '${character}' in an index at position ${position}`);
				if (currentPart === "indexEnd") throw new Error(`Invalid character '${character}' after an index at position ${position}`);
				if (currentPart === "start") currentPart = "property";
				currentSegment += character;
		}
	}
	if (isEscaping) currentSegment += "\\";
	switch (currentPart) {
		case "property":
			if (!processSegment(currentSegment, parts)) return [];
			break;
		case "index": throw new Error("Index was not closed");
		case "start": parts.push("");
	}
	return parts;
}
function normalizePath(path) {
	if (typeof path === "string") return parsePath(path);
	if (Array.isArray(path)) {
		const normalized = [];
		for (const [index, segment] of path.entries()) {
			if (typeof segment !== "string" && typeof segment !== "number") throw new TypeError(`Expected a string or number for path segment at index ${index}, got ${typeof segment}`);
			if (typeof segment === "number" && !Number.isFinite(segment)) throw new TypeError(`Path segment at index ${index} must be a finite number, got ${segment}`);
			if (disallowedKeys.has(segment)) return [];
			if (typeof segment === "string" && shouldCoerceToNumber(segment)) normalized.push(Number.parseInt(segment, 10));
			else normalized.push(segment);
		}
		return normalized;
	}
	return [];
}
function getProperty(object, path, value) {
	if (!isObject$1(object) || typeof path !== "string" && !Array.isArray(path)) return value === void 0 ? object : value;
	const pathArray = normalizePath(path);
	if (pathArray.length === 0) return value;
	for (let index = 0; index < pathArray.length; index++) {
		const key = pathArray[index];
		object = object[key];
		if (object === void 0 || object === null) {
			if (index !== pathArray.length - 1) return value;
			break;
		}
	}
	return object === void 0 ? value : object;
}
function setProperty(object, path, value) {
	if (!isObject$1(object) || typeof path !== "string" && !Array.isArray(path)) return object;
	const root = object;
	const pathArray = normalizePath(path);
	if (pathArray.length === 0) return object;
	for (let index = 0; index < pathArray.length; index++) {
		const key = pathArray[index];
		if (index === pathArray.length - 1) object[key] = value;
		else if (!isObject$1(object[key])) {
			const shouldCreateArray = typeof pathArray[index + 1] === "number";
			object[key] = shouldCreateArray ? [] : {};
		}
		object = object[key];
	}
	return root;
}
function deleteProperty(object, path) {
	if (!isObject$1(object) || typeof path !== "string" && !Array.isArray(path)) return false;
	const pathArray = normalizePath(path);
	if (pathArray.length === 0) return false;
	for (let index = 0; index < pathArray.length; index++) {
		const key = pathArray[index];
		if (index === pathArray.length - 1) {
			if (!Object.hasOwn(object, key)) return false;
			delete object[key];
			return true;
		}
		object = object[key];
		if (!isObject$1(object)) return false;
	}
}
function hasProperty(object, path) {
	if (!isObject$1(object) || typeof path !== "string" && !Array.isArray(path)) return false;
	const pathArray = normalizePath(path);
	if (pathArray.length === 0) return false;
	for (const key of pathArray) {
		if (!isObject$1(object) || !(key in object)) return false;
		object = object[key];
	}
	return true;
}

export { deleteProperty, getProperty, hasProperty, setProperty };
