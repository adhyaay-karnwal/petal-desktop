// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatPersistence.ts

/** Read both legacy transcripts and agents-v2 UIMessage records in the legacy editor. */
function normalizeChatMessages(value) {
	if (!Array.isArray(value)) return [];
	return value.flatMap((message) => {
		if (!message || typeof message !== "object" || typeof message.id !== "string" || message.role !== "user" && message.role !== "assistant") return [];
		const metadata = message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata) ? message.metadata : {};
		const content = Array.isArray(message.parts) ? message.parts.flatMap((part) => part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string" ? [part.text] : []).join("\n") : typeof message.content === "string" ? message.content : "";
		return [{
			...metadata,
			...message,
			content
		}];
	});
}
/** Serializes saves and archive operations so a late save cannot recreate a closed chat. */
var ChatPersistence = class {
	constructor(backend) {
		this.backend = backend;
		this.ids = /* @__PURE__ */ new Map();
		this.queues = /* @__PURE__ */ new Map();
		this.archived = /* @__PURE__ */ new Set();
		this.renamedTitles = /* @__PURE__ */ new Map();
	}
	idFor(id) {
		return this.ids.get(id) ?? (id.startsWith("local-") ? null : id);
	}
	isArchived(id) {
		return this.archived.has(id);
	}
	enqueue(id, run) {
		const result = (this.queues.get(id) ?? Promise.resolve()).catch(() => {}).then(run);
		this.queues.set(id, result);
		const cleanup = () => {
			if (this.queues.get(id) === result) this.queues.delete(id);
		};
		result.then(cleanup, cleanup);
		return result;
	}
	async saveNow(tab, limit = 500) {
		const title = this.renamedTitles.get(tab.id) ?? tab.title;
		const messages = tab.messages?.slice(-limit).map(({ screenshots: _screenshots, ...message }) => message) ?? null;
		const id = this.idFor(tab.id);
		if (!id && messages && this.backend?.createChat) {
			const result = await this.backend.createChat({
				title: title ?? void 0,
				messages
			});
			this.ids.set(tab.id, result.id);
			return result.id;
		}
		if (id && messages && this.backend?.updateChatMessages) await this.backend.updateChatMessages(id, messages);
		if (id && title && this.backend?.updateChatTitle) await this.backend.updateChatTitle(id, title);
		return id;
	}
	save(tab) {
		return this.enqueue(tab.id, () => this.archived.has(tab.id) ? Promise.resolve(this.idFor(tab.id)) : this.saveNow(tab));
	}
	rename(tab, title) {
		this.renamedTitles.set(tab.id, title);
		return this.save({
			...tab,
			title
		});
	}
	async archive(tab) {
		if (!this.backend?.archiveChat || !this.backend.restoreChat) throw new Error("Chat archiving is unavailable.");
		if (this.archived.has(tab.id)) throw new Error("This chat is already being archived.");
		this.archived.add(tab.id);
		try {
			return await this.enqueue(tab.id, async () => {
				const id = await this.saveNow(tab, 500);
				if (!id) throw new Error("Could not save the chat before archiving.");
				await this.backend.archiveChat(id);
				return id;
			});
		} catch (error) {
			this.archived.delete(tab.id);
			throw error;
		}
	}
	async restore(id) {
		if (!this.backend?.restoreChat) throw new Error("Chat restore is unavailable.");
		const chat = await this.backend.restoreChat(id);
		this.archived.delete(id);
		for (const [localId, dbId] of this.ids) if (dbId === id) this.archived.delete(localId);
		return chat;
	}
};

export { ChatPersistence, normalizeChatMessages };
