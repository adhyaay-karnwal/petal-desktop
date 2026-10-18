// Reconstructed from index.js — original module: vendor/which
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_index_min, require_isexe } from "./isexe.js";

var require_which = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
	var path$5 = require("path");
	var COLON = isWindows ? ";" : ":";
	var isexe = require_isexe();
	var getNotFoundError = (cmd) => Object.assign(/* @__PURE__ */ new Error(`not found: ${cmd}`), { code: "ENOENT" });
	var getPathInfo = (cmd, opt) => {
		const colon = opt.colon || COLON;
		const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [...isWindows ? [process.cwd()] : [], ...(opt.path || process.env.PATH || 
		/* istanbul ignore next: very unusual */ "").split(colon)];
		const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
		const pathExt = isWindows ? pathExtExe.split(colon) : [""];
		if (isWindows) {
			if (cmd.indexOf(".") !== -1 && pathExt[0] !== "") pathExt.unshift("");
		}
		return {
			pathEnv,
			pathExt,
			pathExtExe
		};
	};
	var which = (cmd, opt, cb) => {
		if (typeof opt === "function") {
			cb = opt;
			opt = {};
		}
		if (!opt) opt = {};
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		const step = (i) => new Promise((resolve, reject) => {
			if (i === pathEnv.length) return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
			const ppRaw = pathEnv[i];
			const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
			const pCmd = path$5.join(pathPart, cmd);
			const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
			resolve(subStep(p, i, 0));
		});
		const subStep = (p, i, ii) => new Promise((resolve, reject) => {
			if (ii === pathExt.length) return resolve(step(i + 1));
			const ext = pathExt[ii];
			isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
				if (!er && is) {
					if (opt.all) found.push(p + ext);
					else return resolve(p + ext);
				}
				return resolve(subStep(p, i, ii + 1));
			});
		});
		return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
	};
	var whichSync = (cmd, opt) => {
		opt = opt || {};
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		for (let i = 0; i < pathEnv.length; i++) {
			const ppRaw = pathEnv[i];
			const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
			const pCmd = path$5.join(pathPart, cmd);
			const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
			for (let j = 0; j < pathExt.length; j++) {
				const cur = p + pathExt[j];
				try {
					if (isexe.sync(cur, { pathExt: pathExtExe })) {
						if (opt.all) found.push(cur);
						else return cur;
					}
				} catch (ex) {}
			}
		}
		if (opt.all && found.length) return found;
		if (opt.nothrow) return null;
		throw getNotFoundError(cmd);
	};
	module.exports = which;
	which.sync = whichSync;
}));
var require_lib = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var { isexe, sync: isexeSync } = require_index_min();
	var { join: join$16, delimiter: delimiter$1, sep: sep$1, posix } = require("path");
	var isWindows = process.platform === "win32";
	/* istanbul ignore next */
	var rSlash = new RegExp(`[${posix.sep}${sep$1 === posix.sep ? "" : sep$1}]`.replace(/(\\)/g, "\\$1"));
	var rRel = new RegExp(`^\\.${rSlash.source}`);
	var getNotFoundError = (cmd) => Object.assign(/* @__PURE__ */ new Error(`not found: ${cmd}`), { code: "ENOENT" });
	var getPathInfo = (cmd, { path: optPath = process.env.PATH, pathExt: optPathExt = process.env.PATHEXT, delimiter: optDelimiter = delimiter$1 }) => {
		const pathEnv = cmd.match(rSlash) ? [""] : [...isWindows ? [process.cwd()] : [], ...(optPath || /* istanbul ignore next: very unusual */ "").split(optDelimiter)];
		if (isWindows) {
			const pathExtExe = optPathExt || [
				".EXE",
				".CMD",
				".BAT",
				".COM"
			].join(optDelimiter);
			const pathExt = pathExtExe.split(optDelimiter).flatMap((item) => [item, item.toLowerCase()]);
			if (cmd.includes(".") && pathExt[0] !== "") pathExt.unshift("");
			return {
				pathEnv,
				pathExt,
				pathExtExe
			};
		}
		return {
			pathEnv,
			pathExt: [""]
		};
	};
	var getPathPart = (raw, cmd) => {
		const pathPart = /^".*"$/.test(raw) ? raw.slice(1, -1) : raw;
		return (!pathPart && rRel.test(cmd) ? cmd.slice(0, 2) : "") + join$16(pathPart, cmd);
	};
	var which = async (cmd, opt = {}) => {
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		for (const envPart of pathEnv) {
			const p = getPathPart(envPart, cmd);
			for (const ext of pathExt) {
				const withExt = p + ext;
				if (await isexe(withExt, {
					pathExt: pathExtExe,
					ignoreErrors: true
				})) {
					if (!opt.all) return withExt;
					found.push(withExt);
				}
			}
		}
		if (opt.all && found.length) return found;
		if (opt.nothrow) return null;
		throw getNotFoundError(cmd);
	};
	var whichSync = (cmd, opt = {}) => {
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		for (const pathEnvPart of pathEnv) {
			const p = getPathPart(pathEnvPart, cmd);
			for (const ext of pathExt) {
				const withExt = p + ext;
				if (isexeSync(withExt, {
					pathExt: pathExtExe,
					ignoreErrors: true
				})) {
					if (!opt.all) return withExt;
					found.push(withExt);
				}
			}
		}
		if (opt.all && found.length) return found;
		if (opt.nothrow) return null;
		throw getNotFoundError(cmd);
	};
	module.exports = which;
	which.sync = whichSync;
}));

export { require_lib, require_which };
