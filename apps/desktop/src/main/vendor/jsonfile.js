// Reconstructed from index.js — original module: vendor/jsonfile
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_universalify } from "./universalify.js";
import { require_graceful_fs } from "./graceful-fs.js";

var require_utils$2 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	function stringify(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
		const EOF = finalEOL ? EOL : "";
		return JSON.stringify(obj, replacer, spaces).replace(/\n/g, EOL) + EOF;
	}
	function stripBom(content) {
		if (Buffer.isBuffer(content)) content = content.toString("utf8");
		return content.replace(/^\uFEFF/, "");
	}
	module.exports = {
		stringify,
		stripBom
	};
}));
var require_jsonfile$1 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var _fs;
	try {
		_fs = require_graceful_fs();
	} catch (_) {
		_fs = require("fs");
	}
	var universalify = require_universalify();
	var { stringify, stripBom } = require_utils$2();
	async function _readFile(file, options = {}) {
		if (typeof options === "string") options = { encoding: options };
		const fs$10 = options.fs || _fs;
		const shouldThrow = "throws" in options ? options.throws : true;
		let data = await universalify.fromCallback(fs$10.readFile)(file, options);
		data = stripBom(data);
		let obj;
		try {
			obj = JSON.parse(data, options ? options.reviver : null);
		} catch (err) {
			if (shouldThrow) {
				err.message = `${file}: ${err.message}`;
				throw err;
			} else return null;
		}
		return obj;
	}
	var readFile = universalify.fromPromise(_readFile);
	function readFileSync(file, options = {}) {
		if (typeof options === "string") options = { encoding: options };
		const fs$11 = options.fs || _fs;
		const shouldThrow = "throws" in options ? options.throws : true;
		try {
			let content = fs$11.readFileSync(file, options);
			content = stripBom(content);
			return JSON.parse(content, options.reviver);
		} catch (err) {
			if (shouldThrow) {
				err.message = `${file}: ${err.message}`;
				throw err;
			} else return null;
		}
	}
	async function _writeFile(file, obj, options = {}) {
		const fs$12 = options.fs || _fs;
		const str = stringify(obj, options);
		await universalify.fromCallback(fs$12.writeFile)(file, str, options);
	}
	var writeFile = universalify.fromPromise(_writeFile);
	function writeFileSync(file, obj, options = {}) {
		const fs$13 = options.fs || _fs;
		const str = stringify(obj, options);
		return fs$13.writeFileSync(file, str, options);
	}
	module.exports = {
		readFile,
		readFileSync,
		writeFile,
		writeFileSync
	};
}));

export { require_jsonfile$1, require_utils$2 };
