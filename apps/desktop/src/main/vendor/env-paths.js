// Reconstructed from index.js — original module: vendor/env-paths
import { node_os, node_path, node_process } from "../__bundle__/_preamble.js";

var homedir$6 = node_os.default.homedir();
var tmpdir$2 = node_os.default.tmpdir();
var { env } = node_process.default;
var macos = (name) => {
	const library = node_path.default.join(homedir$6, "Library");
	return {
		data: node_path.default.join(library, "Application Support", name),
		config: node_path.default.join(library, "Preferences", name),
		cache: node_path.default.join(library, "Caches", name),
		log: node_path.default.join(library, "Logs", name),
		temp: node_path.default.join(tmpdir$2, name)
	};
};
var windows$1 = (name) => {
	const appData = env.APPDATA || node_path.default.join(homedir$6, "AppData", "Roaming");
	const localAppData = env.LOCALAPPDATA || node_path.default.join(homedir$6, "AppData", "Local");
	return {
		data: node_path.default.join(localAppData, name, "Data"),
		config: node_path.default.join(appData, name, "Config"),
		cache: node_path.default.join(localAppData, name, "Cache"),
		log: node_path.default.join(localAppData, name, "Log"),
		temp: node_path.default.join(tmpdir$2, name)
	};
};
var linux = (name) => {
	const username = node_path.default.basename(homedir$6);
	return {
		data: node_path.default.join(env.XDG_DATA_HOME || node_path.default.join(homedir$6, ".local", "share"), name),
		config: node_path.default.join(env.XDG_CONFIG_HOME || node_path.default.join(homedir$6, ".config"), name),
		cache: node_path.default.join(env.XDG_CACHE_HOME || node_path.default.join(homedir$6, ".cache"), name),
		log: node_path.default.join(env.XDG_STATE_HOME || node_path.default.join(homedir$6, ".local", "state"), name),
		temp: node_path.default.join(tmpdir$2, username, name)
	};
};
function envPaths(name, { suffix = "nodejs" } = {}) {
	if (typeof name !== "string") throw new TypeError(`Expected a string, got ${typeof name}`);
	if (suffix) name += `-${suffix}`;
	if (node_process.default.platform === "darwin") return macos(name);
	if (node_process.default.platform === "win32") return windows$1(name);
	return linux(name);
}

export { envPaths };
