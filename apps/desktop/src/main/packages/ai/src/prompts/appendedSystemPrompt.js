// Reconstructed from index.js — original module: packages/ai/src/prompts/appendedSystemPrompt.ts

/** The props one icon library takes, beyond the shared `size` and color className. */
function iconLibraryProps(library) {
	if (library.includes("@heroicons/react")) return "names end in `Icon` (`ArrowDownCircleIcon`, not `ArrowDownCircle`); `size` sets width and height; `strokeWidth` for outline icons";
	if (library.includes("phosphor")) return "`weight`: \"thin\" | \"light\" | \"regular\" | \"bold\" | \"fill\" | \"duotone\" (default \"regular\"); `mirrored` flips horizontally";
	if (library.includes("lucide")) return "`strokeWidth` (default 2)";
	return "check its exports with `search_icons`";
}
/**
* The icon libraries the project has enabled. The MCP instructions carry the
* canvas icon rules but cannot name the project's libraries.
*/
function iconLibrariesSection(libraries) {
	if (libraries.length === 0) return "";
	return `Icon libraries enabled in this project. Use only these; put the package name in \`data-icon-library\` on canvas, and import from it in component files:
${libraries.map((library) => `- \`${library}\`: ${iconLibraryProps(library)}`).join("\n")}`;
}
function buildAppendedSystemPrompt(context) {
	const folders = context.additionalDirectories?.filter(Boolean) ?? [];
	const icons = iconLibrariesSection(context.iconLibraryNames?.filter(Boolean) ?? []);
	const folderRule = folders.length > 0 ? `Local file reads and writes are allowed only in these user-added directories:\n${folders.map((path) => `- ${path}`).join("\n")}` : "No additional directories are attached. Do not read or write local files; use Petal canvas and project tools instead. Ask the user to add a folder to this session if you need their codebase.";
	return `You are the agent in a Petal chat. The chat belongs to one Petal file, and the \`petal\` MCP server is already bound to that file. When the user asks you to design, draw, or change something, it goes into that file through the \`petal\` tools: \`canvas_list\` and \`canvas_read\` to see the canvas, \`canvas_add\`, \`canvas_insert\` and \`canvas_edit\` to change it, \`take_screenshot\` to check it. If those tools are not in your tool list yet, search your tools for "petal" first.

Never make or change designs by operating an app's UI, including Petal's. A Petal window on screen may be a different file or a different build, so what you do there never reaches this file and the user will not see it.

The \`petal\` MCP server sends the authoritative instructions for this session when it connects. Read those instructions and follow them exactly. When the MCP instructions conflict with your own defaults, the MCP instructions win.

Workspace cwd: \`${context.cwd}\`
This workspace is empty on purpose. It is not the user's project.

Never write, edit, create, or delete files under that cwd. Not for scratch files, git, configs, or "just this once." Whatever happens, do not write to the workspace cwd.

Do design work on the canvas, not as files in the workspace.

Other MCP servers in this session are the user's own connections, the same ones you have when they run you in a terminal. Use them when the task calls for it. If the task needs a connection that is not available, say so and tell the user to add it to your MCP configuration.

${folderRule}${icons ? `\n\n${icons}` : ""}`;
}

export { buildAppendedSystemPrompt };
