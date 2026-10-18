// Reconstructed from index.js — original module: app/src/main/projectNavigation.ts

var ProjectApiError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
function createProjectNavigation(deps) {
	let opening;
	const creates = /* @__PURE__ */ new Map();
	async function read(path, init) {
		const response = await deps.apiFetch(path, init);
		if (!response.ok) {
			const detail = await response.json().catch(() => ({}));
			throw new ProjectApiError(response.status, `Project access failed (HTTP ${response.status}). ${detail?.error || "Use the app's existing sign-in and project access."}`);
		}
		return response.json();
	}
	function nameValue(name) {
		if (typeof name !== "string" || !name.trim() || name.trim().length > 200) throw new Error("name must contain 1–200 characters.");
		return name.trim();
	}
	async function organization(organizationId) {
		const org = organizationId ?? (await read("/session")).session?.activeOrganizationId;
		if (typeof org !== "string" || !org.trim() || org.length > 512) throw new Error("No active organization. Select an organization in Petal or supply organization_id.");
		return org;
	}
	async function list(organizationId) {
		const org = await organization(organizationId);
		const projects = await read(`/projects?organizationId=${encodeURIComponent(org)}`);
		if (!Array.isArray(projects)) throw new Error("Unexpected project list response.");
		const openIds = new Set(deps.openIds());
		const activeId = deps.activeId();
		return JSON.stringify({
			organization_id: org,
			active_project_id: activeId,
			projects: projects.map((project) => ({
				id: project.id,
				name: project.name,
				open: openIds.has(project.id),
				active: project.id === activeId
			}))
		});
	}
	async function performOpen(id) {
		const project = await read(`/projects/${encodeURIComponent(id)}`);
		if (project.id !== id || typeof project.name !== "string") throw new Error("Project response does not match the requested stable ID.");
		const wasOpen = deps.openIds().includes(id);
		await deps.openProject(id, project.name);
		const response = await deps.context(id);
		if (response.isError) throw new Error(response.content.map((item) => item.text).join("\n"));
		const context = JSON.parse(response.content.find((item) => item.type === "text")?.text ?? "null");
		if (context?.project_id !== id || !context.active_page?.id || !deps.openIds().includes(id) || !deps.isSelected(id)) throw new Error("Active project/page did not match after opening. Inspect project_list and project_context; session binding was not changed.");
		return JSON.stringify({
			...context,
			active_project_id: id,
			name: project.name,
			already_open: wasOpen
		});
	}
	async function open(id) {
		if (typeof id !== "string" || !id.trim() || id.length > 512) throw new Error("project_id is required.");
		if (opening) {
			if (opening.id !== id) throw new Error("Another project is opening. Retry shortly.");
			return opening.result;
		}
		const result = performOpen(id);
		opening = {
			id,
			result
		};
		try {
			return await result;
		} finally {
			if (opening?.result === result) opening = void 0;
		}
	}
	async function create(args) {
		const name = nameValue(args.name);
		if (args.open !== void 0 && typeof args.open !== "boolean") throw new Error("open must be a boolean.");
		if (typeof args.requestId !== "string" || !args.requestId.trim() || args.requestId.length > 512) throw new Error("request_id is required.");
		const input = JSON.stringify({
			name,
			organizationId: args.organizationId,
			open: args.open !== false
		});
		const previous = creates.get(args.requestId);
		if (previous) {
			if (previous.input !== input) throw new Error("request_id was already used with different arguments.");
			return previous.result;
		}
		let postStarted = false;
		const result = (async () => {
			const organizationId = await organization(args.organizationId);
			postStarted = true;
			const project = await read("/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					organizationId
				})
			});
			if (typeof project.id !== "string" || typeof project.name !== "string") throw new Error("Unexpected create response. Inspect project_list scope all before creating again.");
			deps.projectChanged?.(project.id, project.name);
			const created = {
				project_id: project.id,
				name: project.name,
				organization_id: organizationId,
				created: true
			};
			if (args.open === false) return JSON.stringify({
				...created,
				opened: false
			});
			try {
				return JSON.stringify({
					...JSON.parse(await open(project.id)),
					...created,
					opened: true
				});
			} catch (error) {
				return JSON.stringify({
					...created,
					opened: false,
					open_error: error instanceof Error ? error.message : String(error)
				});
			}
		})();
		creates.set(args.requestId, {
			input,
			result
		});
		result.catch((error) => {
			const rejected = error instanceof ProjectApiError && error.status >= 400 && error.status < 500 && error.status !== 408;
			if ((!postStarted || rejected) && creates.get(args.requestId)?.result === result) creates.delete(args.requestId);
		});
		return result;
	}
	async function rename(args) {
		const name = nameValue(args.name);
		if (typeof args.projectId !== "string" || !args.projectId.trim() || args.projectId.length > 512) throw new Error("project_id is required.");
		const project = await read(`/projects/${encodeURIComponent(args.projectId)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name })
		});
		if (project.id !== args.projectId || typeof project.name !== "string") throw new Error("Rename response does not match the requested project.");
		deps.projectChanged?.(project.id, project.name);
		return JSON.stringify({
			project_id: project.id,
			name: project.name,
			renamed: true
		});
	}
	return {
		list,
		open,
		create,
		rename
	};
}

export { createProjectNavigation };
