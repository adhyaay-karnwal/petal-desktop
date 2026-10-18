// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/codegen/aiShared.ts

/**
* Slash commands Petal adds to the chat. They resolve to app-owned skills
* (see `packages/compiler/skills`) through the MCP `read_skill` tool, not
* through Claude Code's own skill expansion, so the prompt spells that out.
*/
var LUNAGRAPH_SLASH_COMMANDS = [{
	name: "import-design-system",
	skill: "petal-import-from-project",
	description: "Import tokens, CSS, assets, and components from a local codebase into this file"
}];

export { LUNAGRAPH_SLASH_COMMANDS };
