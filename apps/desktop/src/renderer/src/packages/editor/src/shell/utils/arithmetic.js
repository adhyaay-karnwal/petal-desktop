// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/arithmetic.ts

var TOKEN_RE = /\s*(?:(\d+\.?\d*|\.\d+)([a-z%]*)|([-+*/^()]))/iy;
var PLAIN_NUMBER_RE = /^-?(?:\d+\.?\d*|\.\d+)$/;
var FAIL = { ok: false };
var MAX_LENGTH = 200;
var MAX_MAGNITUDE = 1e9;
var DECIMALS = 1e4;
function tokenize$1(text) {
	const tokens = [];
	let index = 0;
	const trimmedEnd = text.trimEnd().length;
	while (index < trimmedEnd) {
		TOKEN_RE.lastIndex = index;
		const match = TOKEN_RE.exec(text);
		if (!match) return null;
		if (match[3]) tokens.push({
			type: "op",
			value: match[3]
		});
		else tokens.push({
			type: "num",
			value: Number(match[1]),
			unit: match[2].toLowerCase()
		});
		index = TOKEN_RE.lastIndex;
	}
	return tokens;
}
/**
* Evaluates an expression with standard precedence. Unary minus binds looser than `^`
* (`-2^2` is -4) and `^` is right-associative. Every unit in the expression must match.
*/
function evaluateArithmetic(text) {
	if (text.length > MAX_LENGTH) return FAIL;
	const tokens = tokenize$1(text);
	if (!tokens || tokens.length === 0) return FAIL;
	let pos = 0;
	let unit = "";
	let failed = false;
	const peekOp = (...ops) => {
		const token = tokens[pos];
		return token?.type === "op" && ops.includes(token.value) ? token.value : null;
	};
	function atom() {
		const token = tokens[pos++];
		if (token?.type === "num") {
			if (token.unit) {
				if (unit && unit !== token.unit) failed = true;
				unit = token.unit;
			}
			return token.value;
		}
		if (token?.type === "op" && token.value === "(") {
			const inner = sum();
			if (peekOp(")")) pos++;
			else failed = true;
			return inner;
		}
		failed = true;
		return NaN;
	}
	function power() {
		const base = atom();
		if (!peekOp("^")) return base;
		pos++;
		return Math.pow(base, unary());
	}
	function unary() {
		if (peekOp("-")) {
			pos++;
			return -unary();
		}
		return power();
	}
	function product() {
		let left = unary();
		for (let op = peekOp("*", "/"); op; op = peekOp("*", "/")) {
			pos++;
			const right = unary();
			left = op === "*" ? left * right : left / right;
		}
		return left;
	}
	function sum() {
		let left = product();
		for (let op = peekOp("+", "-"); op; op = peekOp("+", "-")) {
			pos++;
			const right = product();
			left = op === "+" ? left + right : left - right;
		}
		return left;
	}
	const value = sum();
	if (failed || pos !== tokens.length) return FAIL;
	if (!Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE) return FAIL;
	const rounded = Math.round(value * DECIMALS) / DECIMALS;
	return {
		ok: true,
		value: rounded === 0 ? 0 : rounded,
		unit
	};
}
/** Drops characters that can't be part of a unitless arithmetic expression. */
function filterArithmeticInput(text) {
	return text.replace(/[^\d+\-*/^().\s]/g, "");
}
/**
* A plain number from a unitless text field, evaluating arithmetic when it isn't one already.
* Blank text gives `emptyValue`; text that isn't a number or valid expression gives null.
*/
function evaluateNumberInput(text, emptyValue = null) {
	const trimmed = text.trim();
	if (!trimmed) return emptyValue;
	if (PLAIN_NUMBER_RE.test(trimmed)) return Number(trimmed);
	const result = evaluateArithmetic(trimmed);
	return result.ok && !result.unit ? result.value : null;
}

export { evaluateArithmetic, evaluateNumberInput, filterArithmeticInput };
