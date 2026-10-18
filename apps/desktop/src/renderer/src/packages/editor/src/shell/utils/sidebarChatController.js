// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/sidebarChatController.ts
import { getById } from "../../../../compiler/src/store/read.js";
import { normalizeChatMessages } from "./chatPersistence.js";
import { elementChatReference } from "./elementChatReference.js";

var TTL = 6e5;
var clone$1 = (value) => structuredClone(value);
var describeReference = ({ data, ...reference }) => ({
	...reference,
	...data ? { has_image: true } : {}
});
/** One instance per project renderer. Snapshots and idempotency keys never cross projects. */
var SidebarChatController = class {
	constructor(latest) {
		this.latest = latest;
		this.contexts = /* @__PURE__ */ new Map();
		this.sends = /* @__PURE__ */ new Map();
		this.reservations = /* @__PURE__ */ new Map();
		this.sending = false;
	}
	deps() {
		const deps = this.latest();
		if (this.scope !== deps.projectId) {
			this.contexts.clear();
			this.sends.clear();
			this.reservations.clear();
			this.scope = deps.projectId;
		}
		if (!deps.projectId) throw new Error("No open project.");
		return deps;
	}
	assertProject(projectId) {
		const deps = this.deps();
		if (deps.projectId !== projectId) throw new Error("Project changed during the request; nothing further was submitted.");
		return deps;
	}
	element(id, pageId) {
		const matches = this.deps().pages.flatMap((page) => {
			if (pageId && pageId !== (page.canvasId ?? page.id)) return [];
			const element = getById(page.store, id);
			return element ? [{
				element,
				page
			}] : [];
		});
		if (matches.length !== 1) throw new Error(matches.length ? `Element ${id} is ambiguous; specify page_id.` : `Element ${id} is unavailable on the requested page.`);
		return matches[0];
	}
	target(target) {
		const deps = this.deps();
		if (target.type === "component") {
			const component = deps.components[target.name];
			if (!component) throw new Error(`Unknown component: ${target.name}`);
			return {
				type: "component",
				id: `component:${target.name}`,
				name: target.name,
				...component.path ? { path: component.path } : {}
			};
		}
		if (target.type === "page") {
			const page = deps.pages.find((page) => (page.canvasId ?? page.id) === target.id);
			if (!page) throw new Error(`Unknown page: ${target.id}`);
			return {
				type: "page",
				id: `page:${target.id}`,
				pageId: target.id,
				name: page.name
			};
		}
		const { element, page } = this.element(target.id, target.page_id);
		if (target.type === "webview" && element.type !== "webview") throw new Error(`${target.id} is not a mini-browser.`);
		return elementChatReference(element, page.canvasId ?? page.id);
	}
	validate(snapshot) {
		if (Date.now() - snapshot.createdAt > TTL) throw new Error("Context expired. Capture chat_context again.");
		if (snapshot.canvas.activePage && !this.deps().pages.some((page) => (page.canvasId ?? page.id) === snapshot.canvas.activePage.id)) throw new Error("Context page is no longer available.");
		for (const reference of snapshot.references) {
			if (reference.type === "element") {
				const { element } = this.element(reference.id, reference.pageId);
				if (reference.webview && (element.type !== "webview" || element.src !== reference.webview.url)) throw new Error("Mini-browser URL changed. Capture chat_context again.");
			}
			if (reference.type === "component" && (!this.deps().components[reference.name] || this.deps().components[reference.name]?.path !== reference.path)) throw new Error("Component source changed. Capture chat_context again.");
			if (reference.region) {
				const region = reference.region;
				const ids = new Set([
					...region.inside,
					...region.within,
					...region.partial
				].map((element) => element.id));
				if (region.componentElementId) ids.add(region.componentElementId);
				for (const id of ids) this.element(id, region.pageId);
			}
			const pageId = reference.region?.pageId ?? reference.pageId;
			if (pageId && !this.deps().pages.some((page) => (page.canvasId ?? page.id) === pageId)) throw new Error("Referenced page is no longer available.");
		}
	}
	async navigate(command) {
		const projectId = this.deps().projectId;
		if (command.project_id && command.project_id !== projectId) throw new Error("Requested project does not match the bound project.");
		const key = JSON.stringify([projectId, command.page_id ?? null]);
		if (this.navigation) {
			if (this.navigation.key !== key) throw new Error("Another page navigation is in progress. Retry shortly.");
			return this.navigation.result;
		}
		const result = this.performNavigation(projectId, command.page_id);
		this.navigation = {
			key,
			result
		};
		try {
			return await result;
		} finally {
			if (this.navigation?.result === result) this.navigation = void 0;
		}
	}
	async performNavigation(projectId, pageId) {
		const deadline = Date.now() + 2e4;
		const waitReady = async () => {
			while (Date.now() < deadline) {
				const deps = this.assertProject(projectId);
				if (!deps.navigationLoading) return deps;
				await new Promise((resolve) => setTimeout(resolve, 20));
			}
			throw new Error("Project/page is still loading. Retry project_context; no verified navigation result is available.");
		};
		const deps = await waitReady();
		if (pageId) {
			if (!deps.pages.some((page) => (page.canvasId ?? page.id) === pageId)) throw new Error(`Unknown page: ${pageId}`);
			await deps.selectPage(pageId);
		}
		while (Date.now() < deadline) {
			const current = this.assertProject(projectId);
			const activeId = current.canvasContext.activePage?.id;
			const active = current.pages.find((page) => (page.canvasId ?? page.id) === activeId);
			if (!current.navigationLoading && active?.loaded !== false && active && (!pageId || activeId === pageId)) return {
				project_id: projectId,
				active_page: {
					id: activeId,
					name: active.name
				},
				pages: current.pages.map((page) => ({
					id: page.canvasId ?? page.id,
					name: page.name,
					active: (page.canvasId ?? page.id) === activeId,
					loaded: page.loaded !== false
				}))
			};
			await new Promise((resolve) => setTimeout(resolve, 20));
		}
		throw new Error("Active page did not match the requested page after loading. Inspect project_context before retrying.");
	}
	async context(command) {
		const deps = this.deps();
		const projectId = deps.projectId;
		const references = [];
		if (command.selection !== false) for (const id of deps.selection()) references.push(this.target({
			type: "element",
			id,
			page_id: deps.canvasContext.activePage?.id
		}));
		for (const target of command.targets ?? []) references.push(this.target(target));
		if (command.draft !== false) {
			const chatId = command.chat_id ?? deps.currentChatId;
			if (command.chat_id && !deps.chats.some((chat) => chat.id === chatId)) throw new Error(`Unknown chat: ${chatId}`);
			const panel = chatId ? deps.panels.get(chatId) : void 0;
			if (command.chat_id && !panel) throw new Error("Open that chat in the sidebar before capturing its draft.");
			references.push(...panel?.getMcpDraft?.().references ?? panel?.getDraftCanvasReferences() ?? []);
		}
		if (command.region) references.push(await deps.captureRegion(command.region));
		this.assertProject(projectId);
		const unique = /* @__PURE__ */ new Map();
		for (const reference of references) {
			const ref = clone$1(reference);
			if (ref.type === "element" && !ref.pageId) {
				const resolved = this.element(ref.id);
				ref.pageId = resolved.page.canvasId ?? resolved.page.id;
			}
			const key = `${ref.type}:${ref.pageId ?? ref.region?.pageId ?? ""}:${ref.id}`;
			unique.set(key, ref);
		}
		const snapshot = clone$1({
			createdAt: Date.now(),
			canvas: {
				...deps.canvasContext,
				selectedElementIds: [...unique.values()].filter((ref) => ref.type === "element").map((ref) => ref.id)
			},
			references: [...unique.values()]
		});
		this.validate(snapshot);
		for (const [id, existing] of this.contexts) if (Date.now() - existing.createdAt > TTL) this.contexts.delete(id);
		if (this.contexts.size >= 20) this.contexts.delete(this.contexts.keys().next().value);
		const context_id = `context:${crypto.randomUUID()}`;
		this.contexts.set(context_id, snapshot);
		return {
			context_id,
			canvas: snapshot.canvas,
			references: snapshot.references.map(describeReference),
			edit_scope_enforced: false
		};
	}
	async models(agentId) {
		const deps = this.deps();
		const projectId = deps.projectId;
		if (!deps.active || !deps.catalog) throw new Error("Sidebar agent chat is unavailable. Enable agents-v2 in Petal.");
		const agents = await deps.catalog.listAgents();
		if (agentId && !agents.some((agent) => agent.id === agentId)) throw new Error(`Unknown provider: ${agentId}`);
		const result = await Promise.all(agents.filter((agent) => !agentId || agent.id === agentId).map(async (agent) => {
			try {
				const status = await deps.catalog.checkStatus(agent.id);
				const models = status.installed && status.loggedIn ? await deps.catalog.listModels(agent.id) : [];
				return {
					...agent,
					installed: status.installed,
					logged_in: status.loggedIn,
					available: status.installed && status.loggedIn && models.length > 0,
					models
				};
			} catch (err) {
				return {
					...agent,
					available: false,
					error: err instanceof Error ? err.message : String(err),
					models: []
				};
			}
		}));
		this.assertProject(projectId);
		return { providers: result };
	}
	async send(command) {
		const deps = this.deps();
		const projectId = deps.projectId;
		if (deps.readOnly || deps.loading || !deps.active) throw new Error("Sidebar chat cannot submit in this project state.");
		if (this.sending) throw new Error("Another sidebar submission is in progress. Retry shortly.");
		this.sending = true;
		try {
			const reserved = this.reservations.get(command.request_id);
			const targetChatId = command.chat_id ?? reserved?.chatId;
			const existing = targetChatId ? deps.chats.find((chat) => chat.id === targetChatId) : void 0;
			if (targetChatId && !existing) throw new Error(`Unknown chat: ${targetChatId}. Use a new request_id if that chat was removed.`);
			const host = deps.host(existing?.id ?? deps.currentChatId ?? "");
			const agentId = command.agent_id ?? host.agentId;
			if (existing?.messages.length && agentId !== host.agentId) throw new Error("An existing chat keeps its provider. Start a new chat to change providers.");
			if (existing && (deps.running.has(existing.id) || deps.panels.get(existing.id)?.getMcpState?.().busy)) throw new Error("This chat is already running.");
			const provider = (await this.models(agentId)).providers[0];
			if (!provider?.available) throw new Error(`Provider ${agentId} is unavailable. Open sidebar setup; no sign-in was started.`);
			const modelId = command.model_id ?? (provider.models.some((model) => model.id === host.modelId) ? host.modelId : void 0) ?? provider.models.find((model) => model.isDefault)?.id ?? provider.models[0]?.id;
			if (!modelId || !provider.models.some((model) => model.id === modelId)) throw new Error(`Unknown model ${command.model_id} for provider ${agentId}.`);
			this.assertProject(projectId);
			const contextId = command.context_id ?? (await this.context({
				operation: "context",
				draft: false
			})).context_id;
			const snapshot = this.contexts.get(contextId);
			if (!snapshot) throw new Error("Unknown context_id. Capture chat_context in this project again.");
			this.validate(snapshot);
			const current = this.assertProject(projectId);
			const chatId = existing?.id ?? current.createChat();
			if (!command.chat_id && !reserved) this.reservations.set(command.request_id, {
				input: JSON.stringify(command),
				chatId
			});
			current.configureTab(chatId, agentId, provider.models, modelId);
			current.openChat(chatId);
			const deadline = Date.now() + 1e4;
			let panel;
			while (Date.now() < deadline) {
				panel = this.assertProject(projectId).panels.get(chatId);
				const state = panel?.getMcpState?.();
				if (state?.agentId === agentId && state.modelId === modelId && panel?.sendMcpMessage) break;
				panel = void 0;
				await new Promise((resolve) => setTimeout(resolve, 20));
			}
			if (!panel?.sendMcpMessage) throw new Error(`Could not mount sidebar chat ${chatId}. No prompt was submitted.`);
			this.validate(snapshot);
			panel.sendMcpMessage({
				prompt: command.prompt,
				modelId,
				references: clone$1(snapshot.references),
				canvasContext: clone$1(snapshot.canvas)
			});
			this.reservations.delete(command.request_id);
			return {
				accepted: true,
				chat_id: chatId,
				agent_id: agentId,
				model_id: modelId,
				context_id: contextId,
				edit_scope_enforced: false
			};
		} finally {
			this.sending = false;
		}
	}
	read(command) {
		const deps = this.deps();
		if (!command.chat_id) return { chats: deps.chats.map((chat) => ({
			chat_id: chat.id,
			title: chat.title,
			running: deps.running.has(chat.id),
			message_count: chat.messages.length
		})) };
		const chat = deps.chats.find((chat) => chat.id === command.chat_id);
		if (!chat) throw new Error(`Unknown chat: ${command.chat_id}`);
		const panel = deps.panels.get(chat.id);
		const state = panel?.getMcpState?.();
		const messages = panel?.getMcpMessages?.() ?? chat.messages;
		const offset = command.offset ?? 0;
		const limit = Math.min(100, command.limit ?? 50);
		return {
			chat_id: chat.id,
			title: chat.title,
			running: state?.busy ?? deps.running.has(chat.id),
			...state ? {
				agent_id: state.agentId,
				model_id: state.modelId,
				error: state.error,
				pending_approvals: state.approvals
			} : {},
			total_messages: messages.length,
			offset,
			messages: normalizeChatMessages(messages).slice(offset, offset + limit).map((message) => ({
				id: message.id,
				role: message.role,
				text: message.content,
				references: (message.inlineRefs ?? []).map(describeReference),
				activity: (message.parts ?? []).filter((part) => part.type.startsWith("tool-") || part.type === "dynamic-tool").map((part) => ({
					type: part.type,
					state: part.state,
					error: part.errorText
				}))
			}))
		};
	}
	async execute(command) {
		this.deps();
		if (command.operation === "navigate") return this.navigate(command);
		if (command.operation === "models") return this.models(command.agent_id);
		if (command.operation === "context") return this.context(command);
		if (command.operation === "read") return this.read(command);
		const input = JSON.stringify(command);
		const previous = this.sends.get(command.request_id);
		if (previous) {
			if (previous.input !== input) throw new Error("request_id was already used with different arguments.");
			return previous.result;
		}
		const reserved = this.reservations.get(command.request_id);
		if (reserved && reserved.input !== input) throw new Error("request_id was already used with different arguments.");
		if (!reserved && (/* @__PURE__ */ new Set([...this.sends.keys(), ...this.reservations.keys()])).size >= 100) throw new Error("Submission key limit reached for this project session. Reopen the project before submitting more; existing keys still work.");
		const result = this.send(command);
		this.sends.set(command.request_id, {
			input,
			result
		});
		result.catch(() => {
			if (this.sends.get(command.request_id)?.result === result) this.sends.delete(command.request_id);
		});
		return result;
	}
};

export { SidebarChatController };
