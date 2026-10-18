// Reconstructed from index.js — original module: packages/ai/src/agents/shared/petal-skills.ts
import { node_fs_promises, node_path } from "../../../../../__bundle__/_preamble.js";

/**
* Petal-owned skills shared by every agent driver.
*
* Petal copies its skills into the throwaway workspace
* (`<cwd>/.agents/skills`, with `.claude/skills` as a symlink), so each CLI
* discovers them as native skills. The composer picker only needs to group
* those skills under "Petal", which `petalSkillNames` and
* `tagPetalSkills` do.
*
* Node-only: `packages/ai` does not depend on the compiler package, which owns
* the v1 skill copy.
*/
/**
* Skill directory names Petal seeded into `<cwd>/.agents/skills` — the
* skills the workspace owns, as opposed to the user's own skills.
*/
async function petalSkillNames(cwd) {
	if (!cwd) return /* @__PURE__ */ new Set();
	const names = /* @__PURE__ */ new Set();
	try {
		const entries = await (0, node_fs_promises.readdir)((0, node_path.join)(cwd, ".agents", "skills"), { withFileTypes: true });
		for (const entry of entries) if (entry.isDirectory() || entry.isSymbolicLink()) names.add(entry.name);
	} catch {
		return /* @__PURE__ */ new Set();
	}
	return names;
}
/**
* Tag the skills Petal seeded so the composer picker groups them. Each is a
* SKILL.md directory Petal wrote, so it is a skill whatever the CLI reports.
*/
function tagPetalSkills(commands, petalSkills) {
	return commands.map((command) => petalSkills.has(command.name) ? {
		...command,
		source: "petal",
		skill: true
	} : command);
}

export { petalSkillNames, tagPetalSkills };
