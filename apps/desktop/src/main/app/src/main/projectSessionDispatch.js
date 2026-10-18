// Reconstructed from index.js — original module: app/src/main/projectSessionDispatch.ts

var tools = {
	listOpenProjects: "project_list",
	pickProject: "project_pick",
	openProject: "project_open",
	createProject: "project_create",
	renameProject: "project_rename"
};
function isProjectSessionCommand(command) {
	return Object.hasOwn(tools, command.type);
}
async function dispatchProjectSession(command, host) {
	try {
		if (!host.hasSession && [
			"pickProject",
			"openProject",
			"createProject"
		].includes(command.type)) throw new Error(`${tools[command.type]} requires an MCP session`);
		switch (command.type) {
			case "listOpenProjects": return {
				ok: true,
				data: { text: await host.list(command.args) }
			};
			case "renameProject": return {
				ok: true,
				data: { text: await host.rename(command.args) }
			};
			case "createProject": {
				const text = await host.create(command.args);
				const created = JSON.parse(text);
				if (created.opened === true) host.bind(created.project_id);
				return {
					ok: true,
					data: { text }
				};
			}
			case "openProject": {
				const text = await host.open(command.args.projectId);
				host.bind(command.args.projectId);
				return {
					ok: true,
					data: { text }
				};
			}
			case "pickProject": {
				const { projectId } = command.args;
				if (typeof projectId !== "string" || !projectId.trim()) throw new Error("project_id is required");
				const ids = host.openIds();
				if (!ids.length) throw new Error("Open a project in Petal first");
				if (!ids.includes(projectId)) throw new Error(`Project "${projectId}" is not open. Open projects:\n${await host.openList()}`);
				const name = await host.name(projectId);
				host.bind(projectId);
				return {
					ok: true,
					data: {
						projectId,
						name
					}
				};
			}
		}
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
/** The legacy wire adapter contains no independent binding rules. */
async function handleLegacyProjectSession(name, args, host) {
	let command;
	switch (name) {
		case "project_list":
			command = {
				type: "listOpenProjects",
				args: {
					scope: args.scope,
					organizationId: args.organization_id
				}
			};
			break;
		case "project_pick":
			command = {
				type: "pickProject",
				args: { projectId: args.project_id }
			};
			break;
		case "project_open":
			command = {
				type: "openProject",
				args: { projectId: args.project_id }
			};
			break;
		case "project_create":
			command = {
				type: "createProject",
				args: {
					name: args.name,
					requestId: args.request_id,
					organizationId: args.organization_id,
					open: args.open
				}
			};
			break;
		case "project_rename":
			command = {
				type: "renameProject",
				args: {
					projectId: args.project_id,
					name: args.name
				}
			};
			break;
		default: return;
	}
	const result = await dispatchProjectSession(command, host);
	if (!result.ok) return {
		isError: true,
		content: [{
			type: "text",
			text: result.error
		}]
	};
	const data = result.data;
	if (data && typeof data === "object") {
		if ("text" in data && typeof data.text === "string") return { content: [{
			type: "text",
			text: data.text
		}] };
		if ("projectId" in data && "name" in data && typeof data.projectId === "string" && typeof data.name === "string") return { content: [{
			type: "text",
			text: `Working on: ${data.name} (${data.projectId})`
		}] };
	}
	return {
		isError: true,
		content: [{
			type: "text",
			text: "Unexpected project session result"
		}]
	};
}

export { dispatchProjectSession, handleLegacyProjectSession, isProjectSessionCommand };
