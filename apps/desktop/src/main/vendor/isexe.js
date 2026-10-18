// Reconstructed from index.js — original module: vendor/isexe
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";

var require_windows = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	module.exports = isexe;
	isexe.sync = sync;
	var fs$5 = require("fs");
	function checkPathExt(path, options) {
		var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
		if (!pathext) return true;
		pathext = pathext.split(";");
		if (pathext.indexOf("") !== -1) return true;
		for (var i = 0; i < pathext.length; i++) {
			var p = pathext[i].toLowerCase();
			if (p && path.substr(-p.length).toLowerCase() === p) return true;
		}
		return false;
	}
	function checkStat(stat, path, options) {
		if (!stat.isSymbolicLink() && !stat.isFile()) return false;
		return checkPathExt(path, options);
	}
	function isexe(path, options, cb) {
		fs$5.stat(path, function(er, stat) {
			cb(er, er ? false : checkStat(stat, path, options));
		});
	}
	function sync(path, options) {
		return checkStat(fs$5.statSync(path), path, options);
	}
}));
var require_mode = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	module.exports = isexe;
	isexe.sync = sync;
	var fs$4 = require("fs");
	function isexe(path, options, cb) {
		fs$4.stat(path, function(er, stat) {
			cb(er, er ? false : checkStat(stat, options));
		});
	}
	function sync(path, options) {
		return checkStat(fs$4.statSync(path), options);
	}
	function checkStat(stat, options) {
		return stat.isFile() && checkMode(stat, options);
	}
	function checkMode(stat, options) {
		var mod = stat.mode;
		var uid = stat.uid;
		var gid = stat.gid;
		var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
		var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
		var u = parseInt("100", 8);
		var g = parseInt("010", 8);
		var o = parseInt("001", 8);
		var ug = u | g;
		return mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
	}
}));
var require_isexe = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	require("fs");
	var core;
	if (process.platform === "win32" || global.TESTING_WINDOWS) core = require_windows();
	else core = require_mode();
	module.exports = isexe;
	isexe.sync = sync;
	function isexe(path, options, cb) {
		if (typeof options === "function") {
			cb = options;
			options = {};
		}
		if (!cb) {
			if (typeof Promise !== "function") throw new TypeError("callback not provided");
			return new Promise(function(resolve, reject) {
				isexe(path, options || {}, function(er, is) {
					if (er) reject(er);
					else resolve(is);
				});
			});
		}
		core(path, options || {}, function(er, is) {
			if (er) {
				if (er.code === "EACCES" || options && options.ignoreErrors) {
					er = null;
					is = false;
				}
			}
			cb(er, is);
		});
	}
	function sync(path, options) {
		try {
			return core.sync(path, options || {});
		} catch (er) {
			if (options && options.ignoreErrors || er.code === "EACCES") return false;
			else throw er;
		}
	}
}));
var require_index_min = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	var a = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports);
	var _ = a((i) => {
		"use strict";
		Object.defineProperty(i, "__esModule", { value: !0 });
		i.sync = i.isexe = void 0;
		var M = require("node:fs"), x = require("node:fs/promises"), q = async (t, e = {}) => {
			let { ignoreErrors: r = !1 } = e;
			try {
				return d(await (0, x.stat)(t), e);
			} catch (s) {
				let n = s;
				if (r || n.code === "EACCES") return !1;
				throw n;
			}
		};
		i.isexe = q;
		var m = (t, e = {}) => {
			let { ignoreErrors: r = !1 } = e;
			try {
				return d((0, M.statSync)(t), e);
			} catch (s) {
				let n = s;
				if (r || n.code === "EACCES") return !1;
				throw n;
			}
		};
		i.sync = m;
		var d = (t, e) => t.isFile() && A(t, e), A = (t, e) => {
			let r = e.uid ?? process.getuid?.(), s = e.groups ?? process.getgroups?.() ?? [], n = e.gid ?? process.getgid?.() ?? s[0];
			if (r === void 0 || n === void 0) throw new Error("cannot get uid or gid");
			let u = /* @__PURE__ */ new Set([n, ...s]), c = t.mode, S = t.uid, P = t.gid, f = parseInt("100", 8), l = parseInt("010", 8);
			return !!(c & parseInt("001", 8) || c & l && u.has(P) || c & f && S === r || c & 72 && r === 0);
		};
	});
	var g = a((o) => {
		"use strict";
		Object.defineProperty(o, "__esModule", { value: !0 });
		o.sync = o.isexe = void 0;
		var T = require("node:fs"), I = require("node:fs/promises"), D = require("node:path"), F = async (t, e = {}) => {
			let { ignoreErrors: r = !1 } = e;
			try {
				return y(await (0, I.stat)(t), t, e);
			} catch (s) {
				let n = s;
				if (r || n.code === "EACCES") return !1;
				throw n;
			}
		};
		o.isexe = F;
		var L = (t, e = {}) => {
			let { ignoreErrors: r = !1 } = e;
			try {
				return y((0, T.statSync)(t), t, e);
			} catch (s) {
				let n = s;
				if (r || n.code === "EACCES") return !1;
				throw n;
			}
		};
		o.sync = L;
		var B = (t, e) => {
			let { pathExt: r = process.env.PATHEXT || "" } = e, s = r.split(D.delimiter);
			if (s.indexOf("") !== -1) return !0;
			for (let n of s) {
				let u = n.toLowerCase(), c = t.substring(t.length - u.length).toLowerCase();
				if (u && c === u) return !0;
			}
			return !1;
		}, y = (t, e, r) => t.isFile() && B(e, r);
	});
	var p = a((h) => {
		"use strict";
		Object.defineProperty(h, "__esModule", { value: !0 });
	});
	var v = exports && exports.__createBinding || (Object.create ? (function(t, e, r, s) {
		s === void 0 && (s = r);
		var n = Object.getOwnPropertyDescriptor(e, r);
		(!n || ("get" in n ? !e.__esModule : n.writable || n.configurable)) && (n = {
			enumerable: !0,
			get: function() {
				return e[r];
			}
		}), Object.defineProperty(t, s, n);
	}) : (function(t, e, r, s) {
		s === void 0 && (s = r), t[s] = e[r];
	}));
	var G = exports && exports.__setModuleDefault || (Object.create ? (function(t, e) {
		Object.defineProperty(t, "default", {
			enumerable: !0,
			value: e
		});
	}) : function(t, e) {
		t.default = e;
	});
	var w = exports && exports.__importStar || (function() {
		var t = function(e) {
			return t = Object.getOwnPropertyNames || function(r) {
				var s = [];
				for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (s[s.length] = n);
				return s;
			}, t(e);
		};
		return function(e) {
			if (e && e.__esModule) return e;
			var r = {};
			if (e != null) for (var s = t(e), n = 0; n < s.length; n++) s[n] !== "default" && v(r, e, s[n]);
			return G(r, e), r;
		};
	})();
	var X = exports && exports.__exportStar || function(t, e) {
		for (var r in t) r !== "default" && !Object.prototype.hasOwnProperty.call(e, r) && v(e, t, r);
	};
	Object.defineProperty(exports, "__esModule", { value: !0 });
	exports.sync = exports.isexe = exports.posix = exports.win32 = void 0;
	var E = w(_());
	exports.posix = E;
	var O = w(g());
	exports.win32 = O;
	X(p(), exports);
	var b = (process.env._ISEXE_TEST_PLATFORM_ || process.platform) === "win32" ? O : E;
	exports.isexe = b.isexe;
	exports.sync = b.sync;
}));

export { require_index_min, require_isexe };
