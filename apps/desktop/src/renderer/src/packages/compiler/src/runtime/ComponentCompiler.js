// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/ComponentCompiler.ts
import { initPetalRuntime } from "./runtime.js";

var ComponentCompiler = class {
	constructor(config = {}) {
		this.runtimeInitialized = false;
		this.projectRoot = null;
		this.config = config;
	}
	getProjectRoot() {
		return this.projectRoot;
	}
	/** Set up window.React / window.ReactDOM for the import map. */
	async initRuntime() {
		if (this.runtimeInitialized) return;
		initPetalRuntime();
		this.runtimeInitialized = true;
	}
	setProjectRoot(root) {
		if (this.projectRoot !== root) {
			this.projectRoot = root;
			window.__LUNAGRAPH_PROJECT_PATH__ = root;
			this.runtimeInitialized = false;
			document.querySelectorAll("style[data-petal-component-css]").forEach((el) => el.remove());
			initPetalRuntime();
			this.runtimeInitialized = true;
			this.config.onProjectRootChanged?.(root);
		}
	}
};
/** Recover the bare display name from a (possibly qualified) component key. */
function componentDisplayName(key) {
	const i = key.indexOf("::");
	return i === -1 ? key : key.slice(0, i);
}

export { ComponentCompiler, componentDisplayName };
