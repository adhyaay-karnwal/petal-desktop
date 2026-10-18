// Reconstructed from index.js — original module: packages/compiler/src/runtime/skills.ts
import { fs_promises, path$33, url } from "../../../../__bundle__/_preamble.js";

/**
* System skills loader.
*
* Petal ships built-in skills (e.g. `petal-import-from-project`) as files in
* `packages/compiler/skills/<name>/SKILL.md` (+ optional sibling files). They live
* in code, not the DB — they're versioned with releases, no migrations, no per-org
* duplication. This loader walks that directory and returns each skill as a
* normalized record so the host process (Electron main / cloud API) can serve
* them to the AI through the Petal MCP `list_skills` / `read_skill` tools.
*
* This file is system (built-in) skills only.
*/
var DEFAULT_SKILLS_ROOT$1 = (0, path$33.join)((0, path$33.dirname)((0, url.fileURLToPath)(require("url").pathToFileURL(__filename).href)), "..", "..", "skills");
/**
* Read all system skills from disk.
*
* Each direct subdirectory of `packages/compiler/skills/` is treated as a skill;
* its `SKILL.md` is required (skipped with a warning if missing), other files are
* read recursively and included verbatim so claude can pick them up as references.
*
* Returns [] if the skills directory doesn't exist (e.g. broken install). Never throws —
* a missing skill file should not prevent claude from starting.
*/
async function loadSystemSkills$1(skillsRoot = DEFAULT_SKILLS_ROOT$1) {
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
		const files = await collectFiles$1(skillDir, skillDir);
		if (!files.some((f) => f.path === "SKILL.md")) {
			console.warn(`[skills] ${name}/SKILL.md missing — skipping`);
			continue;
		}
		skills.push({
			name,
			files
		});
	}
	return skills;
}
async function collectFiles$1(root, dir) {
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
		if (st.isDirectory()) out.push(...await collectFiles$1(root, full));
		else if (st.isFile()) {
			const content = await (0, fs_promises.readFile)(full, "utf-8");
			out.push({
				path: (0, path$33.relative)(root, full),
				content
			});
		}
	}
	return out;
}

export { loadSystemSkills$1 };
