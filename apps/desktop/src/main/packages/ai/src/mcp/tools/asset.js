// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/asset.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { defineTool, getToolContext, textResult } from "./utils.js";

/**
* Asset MCP tools.
*
* Project assets the model draws with: the registered component catalog and the
* enabled icon libraries. `search_icons` stays with the canvas tools because it
* reads the live canvas icon index. Each tool forwards its arguments to the
* host through the call context's `host`.
*/
/** The asset tool catalog; each tool drives the call context's `host`. */
function createAssetTools() {
	return [defineTool({
		name: "search_components",
		config: {
			description: "Search available project components by name. Returns names, paths, prop types (with required/examples when known), and a short usage hint for variant/size unions. Use before drafting UI — never invent raw <button>/<input> when Button/Input exist. Call with no query to list all components.",
			inputSchema: { query: require_dist$2.string().optional().describe("Optional search query to filter by component name or path (e.g. \"button\", \"table\", \"ui/\")") }
		},
		async execute(args) {
			return textResult(await getToolContext().host.searchComponents(args));
		}
	}), defineTool({
		name: "set_icon_library",
		config: {
			description: `Enable an icon library for this project so canvas JSX with <i data-icon="X" data-icon-library="Y" /> renders. This appends to the existing icon libraries; it does not remove libraries the user already enabled. Pass an npm package name or subpath import that exports React icon components as named exports. Bundled defaults are available immediately: lucide-react, @phosphor-icons/react, @heroicons/react/24/outline. For Heroicons, use a subpath such as '@heroicons/react/24/outline' because '@heroicons/react' does not export icons from its root, and use names like ArrowDownCircleIcon. Other packages are loaded dynamically in the editor. Pass a single library name (most common) or an array.`,
			inputSchema: { library: require_dist$2.union([require_dist$2.string().describe("Icon library package to enable for this project, e.g. lucide-react, @heroicons/react/24/outline, @tabler/icons-react, react-icons/fa, or @scope/icons-react."), require_dist$2.array(require_dist$2.string()).describe("Multiple icon library packages (rare — usually pick one).")]) }
		},
		async execute(args) {
			return textResult(await getToolContext().host.setIconLibrary(args));
		}
	})];
}

export { createAssetTools };
