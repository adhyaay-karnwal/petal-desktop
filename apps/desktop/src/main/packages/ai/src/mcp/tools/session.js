// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/session.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { defineTool, getToolContext, textResult } from "./utils.js";

/**
* Session-binding MCP tools.
*
* `project_list` / `project_pick` let an external client (Cursor, a CLI) choose
* which open Petal project its session works on. They are registered only
* on a bare `/mcp` transport (no `projectId` query), so in-app chat never sees
* them: the host binds that session from the URL. Everything else here follows
* the other tool families — forward through the call context's `host` and let
* the host dispatcher answer.
*/
/** The session-binding tool catalog; each tool drives the call context's `host`. */
function createSessionTools() {
	return [
		defineTool({
			name: "project_create",
			config: {
				description: "Create a new top-level Petal design file in the current workspace or organization_id. Opens the file and binds this session by default; open=false creates without switching. Returns its stable project_id. request_id prevents duplicate creation within this app run: reuse the same key and arguments after an uncertain response. If created=true and opened=false, retry project_open with the returned ID. This creates a design file on Home, not a source-code file inside a project.",
				inputSchema: {
					name: require_dist$2.string().trim().min(1).max(200),
					organization_id: require_dist$2.string().min(1).max(512).optional(),
					request_id: require_dist$2.string().min(1).max(512),
					open: require_dist$2.boolean().optional()
				}
			},
			async execute(args) {
				return textResult((await getToolContext().host.createProject({
					name: args.name,
					organizationId: args.organization_id,
					requestId: args.request_id,
					open: args.open
				})).text);
			}
		}),
		defineTool({
			name: "project_rename",
			config: {
				description: "Rename a top-level Petal design file by stable project_id, including a closed file. Requires owner access enforced by the API. Updates Home and any open desktop tab without opening the file or changing this session binding. This changes the design file name, not a source-code path.",
				inputSchema: {
					project_id: require_dist$2.string().min(1).max(512),
					name: require_dist$2.string().trim().min(1).max(200)
				}
			},
			async execute(args) {
				return textResult((await getToolContext().host.renameProject({
					projectId: args.project_id,
					name: args.name
				})).text);
			}
		}),
		defineTool({
			name: "project_open",
			config: {
				description: "Open an accessible project by stable ID through Petal desktop tab navigation, reusing an existing tab when open. Waits for the renderer and active page to load, verifies active context, then binds this MCP session. Preserves other tabs and edits. Discover unopened IDs with project_list scope all.",
				inputSchema: { project_id: require_dist$2.string().min(1).max(512) }
			},
			async execute(args) {
				return textResult((await getToolContext().host.openProject({ projectId: args.project_id })).text);
			}
		}),
		defineTool({
			name: "project_list",
			config: {
				description: "List projects currently open in Petal. Returns one line per project with name and id; (active tab) marks the selected project in the last-used Petal window, even when another app has focus. For requests about the current/open tab, bind that marked project with project_pick; if none is marked (for example Home is selected), ask which project. This does not change an existing session binding. Call this first when no project is bound, or when the user asks to switch projects. If exactly one project is open, call project_pick with its id immediately without asking the user.",
				inputSchema: {
					scope: require_dist$2._enum(["open", "all"]).optional().describe("Default open. Use all to discover accessible projects, including unopened projects, in the current organization."),
					organization_id: require_dist$2.string().min(1).max(512).optional().describe("Optional organization ID for scope all; defaults to the authenticated app session organization.")
				}
			},
			async execute(args) {
				return textResult((await getToolContext().host.listOpenProjects({
					scope: args.scope,
					organizationId: args.organization_id
				})).text);
			}
		}),
		defineTool({
			name: "project_pick",
			config: {
				description: "Bind this MCP session to a project that is open in Petal. Required before other project/canvas tools. Call again with a different project_id only when the user explicitly asks to switch projects.",
				inputSchema: { project_id: require_dist$2.string().describe("Project id from project_list (the value after \"id: \")") }
			},
			async execute(args) {
				const data = await getToolContext().host.pickProject({ projectId: args.project_id });
				return textResult(`Working on: ${data.name} (${data.projectId})`);
			}
		})
	];
}

export { createSessionTools };
