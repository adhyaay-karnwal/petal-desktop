// Reconstructed from index.js — original module: packages/ai/src/skills.ts
import { fs_promises, path$33, url } from "../../../__bundle__/_preamble.js";

/**
* System skills loader for the agents-v2 stack.
*
* Reads the built-in Petal skills from `packages/ai/skills/<name>/SKILL.md`
* (+ sibling reference files). This is a deliberate copy of
* `@petal/compiler/skills` so the old MCP keeps its files while agents-v2
* copies these into the per-project agent cwd.
*
* Node-only: never import this from the renderer (`@petal/ai/client`).
*/
var DEFAULT_SKILLS_ROOT = (0, path$33.join)((0, path$33.dirname)((0, url.fileURLToPath)(require("url").pathToFileURL(__filename).href)), "..", "skills");
/**
* Read all system skills from disk. Returns [] when the directory is missing.
* Never throws: a missing skill file must not prevent the agent from starting.
*/
async function loadSystemSkills(skillsRoot = DEFAULT_SKILLS_ROOT) {
	let entries;
	try {
		entries = await (0, fs_promises.readdir)(skillsRoot);
	} catch {
		return [];
	}
	const skills = [];
	for (const name of entries) {
		if (name.startsWith(".")) continue;
		const skillDir = (0, path$33.join)(skillsRoot, name);
		let st;
		try {
			st = await (0, fs_promises.stat)(skillDir);
		} catch {
			continue;
		}
		if (!st.isDirectory()) continue;
		const files = await collectFiles(skillDir, skillDir);
		if (!files.some((f) => f.path === "SKILL.md")) {
			console.warn(`[ai/skills] ${name}/SKILL.md missing — skipping`);
			continue;
		}
		skills.push({
			name,
			files
		});
	}
	return skills;
}
async function collectFiles(root, dir) {
	const out = [];
	let entries;
	try {
		entries = await (0, fs_promises.readdir)(dir);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = (0, path$33.join)(dir, entry);
		let st;
		try {
			st = await (0, fs_promises.stat)(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) out.push(...await collectFiles(root, full));
		else if (st.isFile()) out.push({
			path: (0, path$33.relative)(root, full),
			content: await (0, fs_promises.readFile)(full, "utf-8")
		});
	}
	return out;
}
/** Copy bundled skills (plus optional overrides) into `dest/.agents/skills`. */
async function writeSystemSkills(dest, options = {}) {
	const agentsSkills = (0, path$33.join)(dest, ".agents", "skills");
	await (0, fs_promises.mkdir)(agentsSkills, { recursive: true });
	const skills = await loadSystemSkills(options.skillsRoot);
	for (const skill of skills) {
		const files = options.skillOverrides?.[skill.name]?.files ?? skill.files;
		for (const file of files) {
			const full = (0, path$33.join)(agentsSkills, skill.name, file.path);
			await (0, fs_promises.mkdir)((0, path$33.dirname)(full), { recursive: true });
			await (0, fs_promises.writeFile)(full, file.content);
		}
	}
}

export { loadSystemSkills, writeSystemSkills };
