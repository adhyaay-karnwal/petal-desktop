// Reconstructed from index.js — original module: vendor/@babel/code-frame
import { require_rolldown_runtime } from "../../__bundle__/_preamble.js";
import { require_lib$7 } from "./helper-validator-identifier.js";
import { require_picocolors } from "../picocolors.js";
import { require_js_tokens } from "../js-tokens.js";

var require_lib$3 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var picocolors = require_picocolors();
	var jsTokens = require_js_tokens();
	var helperValidatorIdentifier = require_lib$7();
	function isColorSupported() {
		return typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false") ? false : picocolors.isColorSupported;
	}
	var compose = (f, g) => (v) => f(g(v));
	function buildDefs(colors) {
		return {
			keyword: colors.cyan,
			capitalized: colors.yellow,
			jsxIdentifier: colors.yellow,
			punctuator: colors.yellow,
			number: colors.magenta,
			string: colors.green,
			regex: colors.magenta,
			comment: colors.gray,
			invalid: compose(compose(colors.white, colors.bgRed), colors.bold),
			gutter: colors.gray,
			marker: compose(colors.red, colors.bold),
			message: compose(colors.red, colors.bold),
			reset: colors.reset
		};
	}
	var defsOn = buildDefs(picocolors.createColors(true));
	var defsOff = buildDefs(picocolors.createColors(false));
	function getDefs(enabled) {
		return enabled ? defsOn : defsOff;
	}
	var sometimesKeywords = /* @__PURE__ */ new Set([
		"as",
		"async",
		"from",
		"get",
		"of",
		"set"
	]);
	var NEWLINE$1 = /\r\n|[\n\r\u2028\u2029]/;
	var BRACKET = /^[()[\]{}]$/;
	var tokenize;
	var JSX_TAG = /^[a-z][\w-]*$/i;
	var getTokenType = function(token, offset, text) {
		if (token.type === "name") {
			const tokenValue = token.value;
			if (helperValidatorIdentifier.isKeyword(tokenValue) || helperValidatorIdentifier.isStrictReservedWord(tokenValue, true) || sometimesKeywords.has(tokenValue)) return "keyword";
			if (JSX_TAG.test(tokenValue) && (text[offset - 1] === "<" || text.slice(offset - 2, offset) === "</")) return "jsxIdentifier";
			const firstChar = String.fromCodePoint(tokenValue.codePointAt(0));
			if (firstChar !== firstChar.toLowerCase()) return "capitalized";
		}
		if (token.type === "punctuator" && BRACKET.test(token.value)) return "bracket";
		if (token.type === "invalid" && (token.value === "@" || token.value === "#")) return "punctuator";
		return token.type;
	};
	tokenize = function* (text) {
		let match;
		while (match = jsTokens.default.exec(text)) {
			const token = jsTokens.matchToToken(match);
			yield {
				type: getTokenType(token, match.index, text),
				value: token.value
			};
		}
	};
	function highlight(text) {
		if (text === "") return "";
		const defs = getDefs(true);
		let highlighted = "";
		for (const { type, value } of tokenize(text)) if (type in defs) highlighted += value.split(NEWLINE$1).map((str) => defs[type](str)).join("\n");
		else highlighted += value;
		return highlighted;
	}
	var deprecationWarningShown = false;
	var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
	function getMarkerLines(loc, source, opts, startLineBaseZero) {
		const startLoc = Object.assign({
			column: 0,
			line: -1
		}, loc.start);
		const endLoc = Object.assign({}, startLoc, loc.end);
		const { linesAbove = 2, linesBelow = 3 } = opts || {};
		const startLine = startLoc.line - startLineBaseZero;
		const startColumn = startLoc.column;
		const endLine = endLoc.line - startLineBaseZero;
		const endColumn = endLoc.column;
		let start = Math.max(startLine - (linesAbove + 1), 0);
		let end = Math.min(source.length, endLine + linesBelow);
		if (startLine === -1) start = 0;
		if (endLine === -1) end = source.length;
		const lineDiff = endLine - startLine;
		const markerLines = {};
		if (lineDiff) for (let i = 0; i <= lineDiff; i++) {
			const lineNumber = i + startLine;
			if (!startColumn) markerLines[lineNumber] = true;
			else if (i === 0) markerLines[lineNumber] = [startColumn, source[lineNumber - 1].length - startColumn + 1];
			else if (i === lineDiff) markerLines[lineNumber] = [0, endColumn];
			else markerLines[lineNumber] = [0, source[lineNumber - i].length];
		}
		else if (startColumn === endColumn) {
			if (startColumn) markerLines[startLine] = [startColumn, 0];
			else markerLines[startLine] = true;
		} else markerLines[startLine] = [startColumn, endColumn - startColumn];
		return {
			start,
			end,
			markerLines
		};
	}
	function codeFrameColumns(rawLines, loc, opts = {}) {
		const shouldHighlight = opts.forceColor || isColorSupported() && opts.highlightCode;
		const startLineBaseZero = (opts.startLine || 1) - 1;
		const defs = getDefs(shouldHighlight);
		const { start, end, markerLines } = getMarkerLines(loc, rawLines.split(NEWLINE), opts, startLineBaseZero);
		const hasColumns = loc.start && typeof loc.start.column === "number";
		const numberMaxWidth = String(end + startLineBaseZero).length;
		let frame = (shouldHighlight ? highlight(rawLines) : rawLines).split(NEWLINE, end).slice(start, end).map((line, index) => {
			const number = start + 1 + index;
			const gutter = ` ${` ${number + startLineBaseZero}`.slice(-numberMaxWidth)} |`;
			const hasMarker = markerLines[number];
			const lastMarkerLine = !markerLines[number + 1];
			if (hasMarker) {
				let markerLine = "";
				if (Array.isArray(hasMarker)) {
					const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
					const numberOfMarkers = hasMarker[1] || 1;
					markerLine = [
						"\n ",
						defs.gutter(gutter.replace(/\d/g, " ")),
						" ",
						markerSpacing,
						defs.marker("^").repeat(numberOfMarkers)
					].join("");
					if (lastMarkerLine && opts.message) markerLine += " " + defs.message(opts.message);
				}
				return [
					defs.marker(">"),
					defs.gutter(gutter),
					line.length > 0 ? ` ${line}` : "",
					markerLine
				].join("");
			} else return ` ${defs.gutter(gutter)}${line.length > 0 ? ` ${line}` : ""}`;
		}).join("\n");
		if (opts.message && !hasColumns) frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
		if (shouldHighlight) return defs.reset(frame);
		else return frame;
	}
	function index(rawLines, lineNumber, colNumber, opts = {}) {
		if (!deprecationWarningShown) {
			deprecationWarningShown = true;
			const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
			if (process.emitWarning) process.emitWarning(message, "DeprecationWarning");
			else {
				const deprecationError = /* @__PURE__ */ new Error(message);
				deprecationError.name = "DeprecationWarning";
				console.warn(/* @__PURE__ */ new Error(message));
			}
		}
		colNumber = Math.max(colNumber, 0);
		return codeFrameColumns(rawLines, { start: {
			column: colNumber,
			line: lineNumber
		} }, opts);
	}
	exports.codeFrameColumns = codeFrameColumns;
	exports.default = index;
	exports.highlight = highlight;
}));

export { require_lib$3 };
