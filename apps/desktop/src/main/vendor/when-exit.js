// Reconstructed from index.js — original module: vendor/when-exit
import { node_process } from "../__bundle__/_preamble.js";

var IS_LINUX = node_process.default.platform === "linux";
var IS_WINDOWS = node_process.default.platform === "win32";
var Signals = [
	"SIGHUP",
	"SIGINT",
	"SIGTERM"
];
if (!IS_WINDOWS) Signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
if (IS_LINUX) Signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
var Interceptor = class {
	constructor() {
		this.callbacks = /* @__PURE__ */ new Set();
		this.exited = false;
		this.exit = (signal) => {
			if (this.exited) return;
			this.exited = true;
			for (const callback of this.callbacks) callback();
			if (signal) {
				if (IS_WINDOWS && signal !== "SIGINT" && signal !== "SIGTERM" && signal !== "SIGKILL") node_process.default.kill(node_process.default.pid, "SIGTERM");
				else node_process.default.kill(node_process.default.pid, signal);
			}
		};
		this.hook = () => {
			node_process.default.once("exit", () => this.exit());
			for (const signal of Signals) try {
				node_process.default.once(signal, () => this.exit(signal));
			} catch {}
		};
		this.register = (callback) => {
			this.callbacks.add(callback);
			return () => {
				this.callbacks.delete(callback);
			};
		};
		this.hook();
	}
};
var whenExit = new Interceptor().register;

export { whenExit };
