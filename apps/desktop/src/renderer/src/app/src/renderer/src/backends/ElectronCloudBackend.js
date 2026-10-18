// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/backends/ElectronCloudBackend.ts
import { createCloudBackend } from "../../../../../packages/cloud/src/backends/CloudBackend.js";
import { captureElementImage, captureLivePreviewPage } from "../../../../../packages/editor/src/shared/utils/captureElementImage.js";

/**
* ElectronCloudBackend — wraps the shared CloudBackend from @petal/cloud
* but overrides saveFile (server API or local Claude CLI via IPC) and chat
* (Claude CLI via IPC).
*
* Everything else (file CRUD, drafts, versions, canvases, assets)
* goes through the cloud API, same as the web app.
*/
/**
* Strip non-serializable values (functions) from a flat list of FEElement
* (used for `attachedElements` on chat options — those are individual
* elements from selections, not a Store payload).
*
* For canvas wire payloads (StoreWireV2), `toWire` already strips at the
* conversion boundary; callers don't need to re-strip.
*/
function stripNonSerializable(elements) {
	return elements.map((el) => {
		const cleaned = {};
		for (const key of Object.keys(el)) {
			if (key === "componentRef" || key === "isRegistered") continue;
			const val = el[key];
			if (typeof val === "function") continue;
			if (key === "children" && Array.isArray(val)) cleaned.children = stripNonSerializable(val);
			else if (key === "props" && val && typeof val === "object") {
				const cleanedProps = {};
				for (const [pk, pv] of Object.entries(val)) if (typeof pv !== "function") cleanedProps[pk] = pv;
				cleaned.props = cleanedProps;
			} else cleaned[key] = val;
		}
		return cleaned;
	});
}
function createElectronCloudBackend(projectId, options = {}) {
	const cloud = createCloudBackend(projectId, options);
	const unsubFileChanged = window.api.on("file_changed", (event) => {
		if (String(event.projectId) === String(projectId) && event.filePath && event.content) options.onFileChanged?.(event.filePath, event.content, event.isNew);
	});
	const unsubFileDeleted = window.api.on("file_deleted", (event) => {
		if (String(event.projectId) === String(projectId) && event.filePath) options.onFileDeleted?.(event.filePath);
	});
	const unsubSettingsChanged = window.api.on("settings_changed", (event) => {
		if (String(event.projectId) === String(projectId) && event.key) options.onSettingsChanged?.(event.key);
	});
	const unsubPlanLimit = window.api.on("plan_limit", (event) => {
		if (String(event.projectId) === String(projectId) && event.reason && event.message) options.onPlanLimit?.({
			reason: event.reason,
			message: event.message
		});
	});
	return {
		...cloud,
		dispose: () => {
			unsubFileChanged();
			unsubFileDeleted();
			unsubSettingsChanged();
			unsubPlanLimit();
		},
		saveFile: async (opts) => {
			try {
				const elements = Array.isArray(opts.elements) ? stripNonSerializable(opts.elements) : opts.elements;
				const result = await window.api.invoke("save_file", {
					projectId,
					options: {
						...opts,
						elements
					}
				});
				if (result.success && result.code && result.filePath) await options.onFileChanged?.(result.filePath, result.code);
				return result;
			} catch (error) {
				return {
					success: false,
					error: String(error)
				};
			}
		},
		generateChatTitle: (input) => window.api.invoke("ai_chat_title", input),
		async *chat(messages, _tools, chatOptions) {
			const eventChannel = `chat-stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			const sessionId = crypto.randomUUID();
			const queue = [];
			let resolve = null;
			let finished = false;
			const wake = () => {
				if (resolve) {
					resolve();
					resolve = null;
				}
			};
			const onAbort = () => {
				window.api.invoke("ai_chat_cancel", { sessionId });
				finished = true;
				queue.push({ type: "done" });
				wake();
			};
			chatOptions?.signal?.addEventListener("abort", onAbort);
			if (chatOptions?.signal?.aborted) onAbort();
			const unsub = window.api.on(eventChannel, (event) => {
				if (event.type === "text") queue.push({
					type: "text",
					text: event.content
				});
				else if (event.type === "final_text") queue.push({
					type: "final_text",
					text: event.content
				});
				else if (event.type === "thinking") queue.push({
					type: "thinking",
					text: event.content
				});
				else if (event.type === "thinking_progress") queue.push({
					type: "thinking_progress",
					tokens: event.tokens
				});
				else if (event.type === "tool_activity") queue.push({
					type: "tool_use",
					id: event.id || "",
					name: event.name,
					input: event.input
				});
				else if (event.type === "tool_approval") queue.push({
					type: "tool_approval",
					approvalId: event.approvalId,
					toolName: event.toolName,
					args: event.args,
					origin: event.origin,
					sensitive: event.sensitive
				});
				else if (event.type === "mcp_tool_result") queue.push({
					type: "mcp_tool_result",
					name: event.name,
					args: event.args,
					success: event.success,
					error: event.error,
					createdElementIds: event.createdElementIds,
					reason: event.reason
				});
				else if (event.type === "done") {
					queue.push({ type: "done" });
					finished = true;
				} else if (event.type === "error") {
					queue.push({
						type: "error",
						error: event.message || event.error || "Unknown error",
						errorInfo: event.errorInfo
					});
					finished = true;
				} else if (event.type === "screenshot_request") {
					const captureScreenshot = async () => {
						try {
							const elementId = event.elementId;
							let el = null;
							if (elementId) {
								el = document.querySelector(`[data-element-id="${elementId}"]`);
								if (!el) for (const iframe of Array.from(document.querySelectorAll("iframe"))) try {
									const iframeDoc = iframe.contentDocument;
									if (iframeDoc) {
										const found = iframeDoc.querySelector(`[data-element-id="${elementId}"]`);
										if (found) {
											el = found;
											break;
										}
									}
								} catch {}
							}
							if (!el) {
								window.api.send("screenshot_result", {
									requestId: event.requestId,
									dataUrl: null
								});
								return;
							}
							const preview = await captureLivePreviewPage(el);
							if (preview) {
								window.api.send("screenshot_result", preview.dataUrl || !preview.url ? {
									requestId: event.requestId,
									dataUrl: preview.dataUrl
								} : {
									requestId: event.requestId,
									iframeUrl: preview.url,
									iframeSize: {
										width: el.offsetWidth || 1200,
										height: el.offsetHeight || 800
									}
								});
								return;
							}
							const iframeEl = el.querySelector("iframe");
							const iframeSrc = iframeEl?.src;
							let isCrossOrigin = false;
							if (iframeEl) {
								try {
									iframeEl.contentDocument;
								} catch {
									isCrossOrigin = true;
								}
								if (!iframeEl.contentDocument) isCrossOrigin = true;
							}
							if (!isCrossOrigin) try {
								const dataUrl = await captureElementImage(el);
								window.api.send("screenshot_result", {
									requestId: event.requestId,
									dataUrl
								});
								return;
							} catch {}
							if (iframeSrc) {
								const iframeWidth = iframeEl.offsetWidth || 1200;
								const iframeHeight = iframeEl.offsetHeight || 800;
								window.api.send("screenshot_result", {
									requestId: event.requestId,
									iframeUrl: iframeSrc,
									iframeSize: {
										width: iframeWidth,
										height: iframeHeight
									}
								});
							} else window.api.send("screenshot_result", {
								requestId: event.requestId,
								dataUrl: null
							});
						} catch (err) {
							console.warn("[Screenshot] Screenshot failed:", err);
							window.api.send("screenshot_result", {
								requestId: event.requestId,
								dataUrl: null
							});
						}
					};
					captureScreenshot();
				} else if (event.type === "folder_access_needed") queue.push({
					type: "folder_access_needed",
					requestId: event.requestId,
					path: event.path
				});
				else if (event.type === "screenshot_captured") queue.push({
					type: "screenshot",
					dataUrl: event.dataUrl,
					elementId: event.elementId
				});
				else if (event.type === "debug") {}
				wake();
			});
			try {
				const { signal: _signal, ...ipcOptions } = chatOptions ?? {};
				window.api.invoke("ai_chat", {
					projectId,
					messages,
					sessionId,
					options: {
						...ipcOptions,
						elements: chatOptions?.elements ? Array.isArray(chatOptions.elements) ? stripNonSerializable(chatOptions.elements) : chatOptions.elements : void 0,
						attachedElements: chatOptions?.attachedElements ? stripNonSerializable(chatOptions.attachedElements) : void 0
					},
					eventChannel
				}).catch((err) => {
					queue.push({
						type: "error",
						error: String(err)
					});
					finished = true;
					wake();
				});
				while (!finished || queue.length > 0) {
					if (chatOptions?.signal?.aborted) return;
					if (queue.length === 0) await new Promise((r) => {
						resolve = r;
					});
					while (queue.length > 0) {
						if (chatOptions?.signal?.aborted) return;
						const event = queue.shift();
						if (event.type === "done") {
							if (chatOptions?.signal?.aborted) return;
							await new Promise((r) => setTimeout(r, 150));
							while (queue.length > 0) {
								const late = queue.shift();
								if (late.type !== "done") yield late;
							}
							return;
						}
						yield event;
					}
				}
			} finally {
				chatOptions?.signal?.removeEventListener("abort", onAbort);
				unsub();
			}
		}
	};
}

export { createElectronCloudBackend };
