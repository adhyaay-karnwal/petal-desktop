// Reconstructed from index.js — original module: vendor/path-key
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";

var require_path_key = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var pathKey = (options = {}) => {
		const environment = options.env || process.env;
		if ((options.platform || process.platform) !== "win32") return "PATH";
		return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
	};
	module.exports = pathKey;
	module.exports.default = pathKey;
}));

export { require_path_key };
