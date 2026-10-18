// Reconstructed from index.js — original module: app/src/main/promptFolders.ts
import { node_fs_promises, node_path } from "../../../__bundle__/_preamble.js";

/**
* Design system audit core: how a product's code actually uses its design
* system's components.
*
* Reads each design system component's own variant axes (cva maps, lookup
* objects indexed by a prop, string-literal union prop types), then finds every
* JSX usage in the product and splits what it passes into intentional variants
* (a declared axis with a declared value) and overrides (styling classes, an
* inline style, or a value the component doesn't declare). Usages that pass the
* same variants and the same overrides form one group. Also records which
* design system components render which, so a component the product never
* names can still count as used through another one.
*
* Pure: the caller supplies the files and the module resolver.
*/
var promptFolders = /* @__PURE__ */ new Map();
var keyFor = (projectId, chatTabId) => JSON.stringify([projectId, chatTabId]);
/** Reject stale paths and files instead of silently starting a task without its folder. */
async function validatePromptFolders(value) {
	if (value === void 0) return [];
	if (!Array.isArray(value) || value.some((path) => typeof path !== "string" || !(0, node_path.isAbsolute)(path))) throw new Error("Attached folders must have absolute local paths.");
	const paths = [...new Set(value.map((path) => (0, node_path.resolve)(path)))];
	await Promise.all(paths.map(async (path) => {
		if (!(await (0, node_fs_promises.stat)(path).catch(() => null))?.isDirectory()) throw new Error(`Attached folder is unavailable: ${path}`);
	}));
	return paths;
}
/** Grants belong to one running request, isolated from other chats and saved settings. */
function registerPromptFolders(projectId, chatTabId, paths) {
	const key = keyFor(projectId, chatTabId);
	const grant = { paths: [...paths] };
	promptFolders.set(key, grant);
	return () => {
		if (promptFolders.get(key) === grant) promptFolders.delete(key);
	};
}
function getPromptFolders(projectId, chatTabId) {
	return chatTabId ? [...promptFolders.get(keyFor(projectId, chatTabId))?.paths ?? []] : [];
}
/** Always revoke temporary access, including when the task fails or is cancelled. */
async function withPromptFolders(projectId, chatTabId, paths, run) {
	const clear = registerPromptFolders(projectId, chatTabId, paths);
	try {
		return await run();
	} finally {
		clear();
	}
}

export { getPromptFolders, validatePromptFolders, withPromptFolders };
