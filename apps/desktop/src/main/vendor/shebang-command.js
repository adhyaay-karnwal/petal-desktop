// Reconstructed from index.js — original module: vendor/shebang-command
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_shebang_regex } from "./shebang-regex.js";

var require_shebang_command = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var shebangRegex = require_shebang_regex();
	module.exports = (string = "") => {
		const match = string.match(shebangRegex);
		if (!match) return null;
		const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
		const binary = path.split("/").pop();
		if (binary === "env") return argument;
		return argument ? `${binary} ${argument}` : binary;
	};
}));

export { require_shebang_command };
