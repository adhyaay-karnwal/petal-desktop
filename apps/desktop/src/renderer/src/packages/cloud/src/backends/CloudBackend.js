// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/backends/CloudBackend.ts
import { getApiUrl, throwApiError } from "../client.js";
import { announceProjectsChanged } from "../hooks/useProjects.js";
import { takePageList } from "../services/pageList.js";
import { extractClassNames, extractElementClassNames } from "../../../compiler/src/runtime/tailwindUtils.js";
import { isPlanLimitReason$1 } from "../lib/planRecommendations.js";

async function readApiError(res) {
	const body = await res.json().catch(() => null);
	return {
		error: typeof body?.error === "string" ? body.error : void 0,
		reason: typeof body?.reason === "string" ? body.reason : void 0
	};
}
function throwMaybePlanLimit(options, err, fallback) {
	if (err.reason && isPlanLimitReason$1(err.reason)) options.onPlanLimit?.({
		reason: err.reason,
		message: err.message || fallback
	});
	throwApiError(err, fallback);
}
function createCloudBackend(projectId, options = {}) {
	return {
		loadFile: async (filePath) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/files/by-path?path=${encodeURIComponent(filePath)}`, { credentials: "include" });
			if (!res.ok) return {
				success: false,
				error: `Failed to load ${filePath}: ${res.status}`
			};
			const file = await res.json();
			return {
				success: true,
				filePath: file.path,
				raw: file.content
			};
		},
		saveFile: async (opts) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/save-to-code`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(opts)
				});
				const data = await res.json().catch(() => null);
				if (!res.ok || !data || data.success !== true) return {
					success: false,
					error: typeof data?.error === "string" && data.error || `Save failed: ${res.status}`
				};
				if (data.code && data.filePath) await options.onFileChanged?.(data.filePath, data.code);
				return {
					success: true,
					filePath: data.filePath,
					code: data.code,
					instanceProps: data.instanceProps
				};
			} catch (err) {
				return {
					success: false,
					error: `Save to code failed: ${err}`
				};
			}
		},
		readFileRaw: async (filePath) => {
			let relPath = filePath;
			if (relPath.startsWith(projectId + "/")) relPath = relPath.slice(projectId.length + 1);
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/files/by-path?path=${encodeURIComponent(relPath)}`, { credentials: "include" });
			if (!res.ok) throw new Error(`Failed to read ${relPath}: ${res.status}`);
			return (await res.json()).content;
		},
		writeFileRaw: async (filePath, content) => {
			let relPath = filePath;
			if (relPath.startsWith(projectId + "/")) relPath = relPath.slice(projectId.length + 1);
			const getRes = await fetch(`${getApiUrl()}/projects/${projectId}/files/by-path?path=${encodeURIComponent(relPath)}`, { credentials: "include" });
			if (getRes.ok) {
				const file = await getRes.json();
				const patchRes = await fetch(`${getApiUrl()}/projects/${projectId}/files/${encodeURIComponent(file.id)}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ content })
				});
				if (!patchRes.ok) {
					const err = await readApiError(patchRes);
					throwMaybePlanLimit(options, {
						message: err.error,
						reason: err.reason
					}, `Failed to update file (${patchRes.status})`);
				}
			} else {
				const postRes = await fetch(`${getApiUrl()}/projects/${projectId}/files`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						path: relPath,
						content
					})
				});
				if (!postRes.ok) {
					const err = await readApiError(postRes);
					throwMaybePlanLimit(options, {
						message: err.error,
						reason: err.reason
					}, `Failed to create file (${postRes.status})`);
				}
			}
		},
		listFiles: async (dir, pattern) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/files`, { credentials: "include" });
			if (!res.ok) return [];
			return (await res.json()).filter((f) => {
				if (dir && !f.path.startsWith(dir)) return false;
				if (pattern && !f.path.endsWith(pattern)) return false;
				return true;
			}).map((f) => f.path);
		},
		watchFiles: () => {
			return () => {};
		},
		listFileVersions: async (componentName) => {
			try {
				const filesRes = await fetch(`${getApiUrl()}/projects/${projectId}/files`, { credentials: "include" });
				if (!filesRes.ok) return {
					success: true,
					versions: []
				};
				const files = await filesRes.json();
				const lower = componentName.toLowerCase();
				const match = files.find((f) => {
					return (f.path.split("/").pop()?.replace(/\.(tsx?|jsx?)$/, ""))?.toLowerCase() === lower;
				});
				if (!match) return {
					success: true,
					versions: []
				};
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/file-versions?path=${encodeURIComponent(match.path)}`, { credentials: "include" });
				if (!res.ok) return {
					success: true,
					versions: []
				};
				return await res.json();
			} catch {
				return {
					success: true,
					versions: []
				};
			}
		},
		getFileVersionContent: async (_componentName, versionFilename) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/file-versions/${encodeURIComponent(versionFilename)}`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		restoreFileVersion: async (componentName, versionFilename, filePath) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/file-versions/restore`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						versionId: versionFilename,
						filePath
					})
				});
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		loadDraft: async (componentName) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts/by-component?name=${encodeURIComponent(componentName)}`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					draft: null,
					error: `Failed: ${res.status}`
				};
				const data = await res.json();
				return {
					success: true,
					draft: data.draft,
					sourceModifiedSinceDraft: data.sourceModifiedSinceDraft
				};
			} catch (err) {
				return {
					success: false,
					draft: null,
					error: `Load draft failed: ${err}`
				};
			}
		},
		saveDraft: async (params) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(params)
				});
				if (!res.ok) return {
					success: false,
					error: (await res.json().catch(() => null))?.error || `Save draft failed: ${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `Save draft failed: ${err}`
				};
			}
		},
		deleteDraft: async (componentName) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts/by-component?name=${encodeURIComponent(componentName)}`, {
					method: "DELETE",
					credentials: "include"
				});
				if (!res.ok) return {
					success: false,
					error: `Delete draft failed: ${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `Delete draft failed: ${err}`
				};
			}
		},
		listDrafts: async () => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					drafts: [],
					error: `List drafts failed: ${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					drafts: [],
					error: `List drafts failed: ${err}`
				};
			}
		},
		listDraftVersions: async (componentName) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts/versions-by-component?name=${encodeURIComponent(componentName)}`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					versions: [],
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					versions: [],
					error: `${err}`
				};
			}
		},
		getDraftVersion: async (_componentName, versionFilename) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/draft-versions/${encodeURIComponent(versionFilename)}`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		restoreDraftVersion: async (componentName, versionFilename) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/drafts/restore-version`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						componentName,
						versionId: versionFilename
					})
				});
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		createPage: async (params) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(params)
			});
			if (!res.ok) return {
				success: false,
				error: `Failed to create page: ${res.status}`
			};
			const data = await res.json();
			return {
				success: true,
				page: data,
				id: data.id
			};
		},
		deletePage: async (pageId) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages/${encodeURIComponent(pageId)}`, {
				method: "DELETE",
				credentials: "include"
			});
			if (!res.ok) return {
				success: false,
				error: `Failed to delete page: ${res.status}`
			};
			return { success: true };
		},
		savePreview: async (image, fingerprint) => {
			const query = new URLSearchParams({ fingerprint });
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/preview?${query}`, {
				method: "POST",
				headers: { "Content-Type": "image/webp" },
				credentials: "include",
				body: image
			});
			if (!res.ok) return {
				success: false,
				error: `Failed to save preview: ${res.status}`
			};
			announceProjectsChanged({ refetch: true });
			return { success: true };
		},
		saveCanvas: async (params) => {
			if (!params.id) return {
				success: false,
				error: "Canvas ID is required for cloud save"
			};
			let newClasses;
			if (options.compiledClasses && params.elements) {
				const elementClasses = params.changedElements ? extractElementClassNames(params.changedElements) : extractClassNames(params.elements);
				const fresh = [];
				for (const cls of elementClasses) if (!options.compiledClasses.has(cls)) {
					fresh.push(cls);
					options.compiledClasses.add(cls);
				}
				if (fresh.length > 0) newClasses = fresh;
			}
			const forgetNewClasses = () => {
				for (const cls of newClasses ?? []) options.compiledClasses?.delete(cls);
			};
			const canvas = {
				zoom: params.zoom,
				pan: params.pan,
				backgroundColor: params.backgroundColor,
				backgroundToken: params.backgroundToken,
				metadata: params.metadata
			};
			let body;
			if (params.elementsJson === void 0) body = JSON.stringify({
				name: params.name,
				canvas: {
					elements: params.elements,
					...canvas
				},
				...newClasses ? { newClasses } : {}
			});
			else {
				const rest = JSON.stringify(canvas);
				const canvasJson = rest === "{}" ? `{"elements":${params.elementsJson}}` : `{"elements":${params.elementsJson},${rest.slice(1)}`;
				body = `{"name":${JSON.stringify(params.name)},"canvas":${canvasJson}${newClasses ? `,"newClasses":${JSON.stringify(newClasses)}` : ""}}`;
			}
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages/${encodeURIComponent(params.id)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body
			}).catch((err) => {
				forgetNewClasses();
				throw err;
			});
			if (!res.ok) {
				forgetNewClasses();
				return {
					success: false,
					error: `Failed to save canvas: ${res.status}`
				};
			}
			announceProjectsChanged({ refetch: false });
			return { success: true };
		},
		loadCanvas: async (canvasId) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages/${encodeURIComponent(canvasId)}`, { credentials: "include" });
			if (!res.ok) return {
				success: false,
				error: "Canvas not found"
			};
			return {
				success: true,
				canvas: (await res.json()).canvas
			};
		},
		listCanvases: async () => {
			const pages = await takePageList(projectId);
			if (!pages) return {
				success: false,
				canvases: [],
				error: "Failed to list canvases"
			};
			return {
				success: true,
				canvases: pages.map((p) => ({
					...p.canvas,
					id: p.id,
					name: p.name,
					sortOrder: p.sortOrder
				}))
			};
		},
		reorderPages: async (order) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages/reorder`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ order })
			});
			if (!res.ok) return {
				success: false,
				error: `Failed to reorder pages: ${res.status}`
			};
			return { success: true };
		},
		createComponent: async (params) => {
			const filePath = params.sourceFilePath || `components/${params.componentName}.tsx`;
			const extension = filePath.split(".").pop() || "tsx";
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/files`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					path: filePath,
					extension,
					content: params.code
				})
			});
			if (!res.ok) {
				const err = await readApiError(res);
				return {
					success: false,
					error: err.error || `Failed to create component (${res.status})`,
					reason: err.reason
				};
			}
			return {
				success: true,
				componentName: params.componentName,
				path: filePath
			};
		},
		listCanvasVersions: async (canvasId) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/canvas-versions?pageId=${encodeURIComponent(canvasId)}`, { credentials: "include" });
				if (!res.ok) return {
					success: true,
					versions: []
				};
				return await res.json();
			} catch {
				return {
					success: true,
					versions: []
				};
			}
		},
		getCanvasVersion: async (_canvasId, versionFilename) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/canvas-versions/${encodeURIComponent(versionFilename)}`, { credentials: "include" });
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		restoreCanvasVersion: async (canvasId, versionFilename) => {
			try {
				const res = await fetch(`${getApiUrl()}/projects/${projectId}/canvas-versions/restore`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						versionId: versionFilename,
						pageId: canvasId
					})
				});
				if (!res.ok) return {
					success: false,
					error: `${res.status}`
				};
				return await res.json();
			} catch (err) {
				return {
					success: false,
					error: `${err}`
				};
			}
		},
		uploadAsset: async (file, filename) => {
			try {
				const mimeType = file.type || "application/octet-stream";
				const sizeBytes = file.size;
				const assetPath = filename.includes("/") ? filename : `assets/${filename}`;
				const urlRes = await fetch(`${getApiUrl()}/projects/${projectId}/assets/upload-url`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						filename: assetPath,
						mimeType
					})
				});
				if (!urlRes.ok) return {
					success: false,
					error: `Failed to get upload URL: ${urlRes.status}`
				};
				const { uploadUrl, storageKey } = await urlRes.json();
				const putRes = await fetch(uploadUrl, {
					method: "PUT",
					headers: { "Content-Type": mimeType },
					body: file
				});
				if (!putRes.ok) return {
					success: false,
					error: `Failed to upload to storage: ${putRes.status}`
				};
				const registerRes = await fetch(`${getApiUrl()}/projects/${projectId}/assets`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						filename: assetPath,
						mimeType,
						sizeBytes: String(sizeBytes),
						storageKey
					})
				});
				if (!registerRes.ok) return {
					success: false,
					error: `Failed to register asset: ${registerRes.status}`
				};
				return {
					success: true,
					url: `/${assetPath}`
				};
			} catch (err) {
				return {
					success: false,
					error: `Asset upload failed: ${err}`
				};
			}
		},
		async *chat() {
			yield {
				type: "error",
				error: "AI chat not available in cloud viewer"
			};
		},
		listChats: async (opts) => {
			const params = new URLSearchParams();
			if (opts?.includeArchived) params.set("includeArchived", "true");
			if (opts?.summary) params.set("summary", "true");
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats?${params}`, { credentials: "include" });
			if (!res.ok) throw new Error(`Failed to list chats: ${res.status}`);
			return res.json();
		},
		getChat: async (chatId, opts) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}${opts?.includeArchived ? "?includeArchived=true" : ""}`, { credentials: "include" });
			if (res.status === 404) return null;
			if (!res.ok) throw new Error(`Failed to get chat: ${res.status}`);
			return res.json();
		},
		createChat: async (input) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(input)
			});
			if (!res.ok) throw new Error(`Failed to create chat: ${res.status}`);
			return res.json();
		},
		updateChatMessages: async (chatId, messages) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}/messages`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ messages })
			});
			if (!res.ok) throw new Error(`Failed to save chat messages: ${res.status}`);
		},
		updateChatTitle: async (chatId, title) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ title })
			});
			if (!res.ok) throw new Error(`Failed to update chat title: ${res.status}`);
		},
		archiveChat: async (chatId) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}/archive`, {
				method: "POST",
				credentials: "include"
			});
			if (!res.ok) throw new Error(`Failed to archive chat: ${res.status}`);
		},
		restoreChat: async (chatId) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}/restore`, {
				method: "POST",
				credentials: "include"
			});
			if (!res.ok) throw new Error(`Failed to restore chat: ${res.status}`);
			return res.json();
		},
		deleteChat: async (chatId) => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/chats/${chatId}`, {
				method: "DELETE",
				credentials: "include"
			});
			if (!res.ok) throw new Error(`Failed to delete chat: ${res.status}`);
		}
	};
}

export { createCloudBackend };
