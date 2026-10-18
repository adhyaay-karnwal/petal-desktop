// Reconstructed from index.js — original module: app/src/main/sidebarChat.ts
import { electron, node_crypto } from "../../../__bundle__/_preamble.js";
import { createIdleDeadline } from "./idleDeadline.js";
import { SIDEBAR_CHAT_PROGRESS_CHANNEL, SIDEBAR_CHAT_REQUEST_CHANNEL, SIDEBAR_CHAT_RESULT_CHANNEL } from "../../../packages/ai/src/sidebarChat.js";
import { findContentsForProject } from "../../../packages/ai/src/protocol.js";

/** Project-scoped RPC into the renderer that owns the sidebar and its context. */
async function handleSidebarChat(projectId, command) {
	const contents = findContentsForProject(projectId);
	const error = (text) => ({
		isError: true,
		content: [{
			type: "text",
			text
		}]
	});
	if (!contents || contents.isDestroyed()) return error(`No renderer is open for project ${projectId}.`);
	return new Promise((resolve) => {
		const requestId = (0, node_crypto.randomUUID)();
		let settled = false;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			deadline.cancel();
			electron.ipcMain.removeListener(SIDEBAR_CHAT_RESULT_CHANNEL, reply);
			electron.ipcMain.removeListener(SIDEBAR_CHAT_PROGRESS_CHANNEL, progress);
			contents.removeListener("destroyed", closed);
			resolve(result);
		};
		const closed = () => finish(error("Project renderer closed."));
		const progress = (event, payload) => {
			if (event.sender === contents && payload?.requestId === requestId) deadline.touch();
		};
		const reply = (event, response) => {
			if (event.sender !== contents || response?.requestId !== requestId) return;
			finish(response.result.ok ? { content: [{
				type: "text",
				text: JSON.stringify(response.result.data)
			}] } : error(response.result.error));
		};
		const deadline = createIdleDeadline(3e4, () => finish(error(command.operation === "navigate" ? "Project/page context request went idle. Inspect project_context before retrying; navigation may have completed." : "Sidebar chat request went idle. A send may already have started; retry with the same request_id and arguments, or inspect chat_read.")));
		electron.ipcMain.on(SIDEBAR_CHAT_RESULT_CHANNEL, reply);
		electron.ipcMain.on(SIDEBAR_CHAT_PROGRESS_CHANNEL, progress);
		contents.once("destroyed", closed);
		try {
			contents.send(SIDEBAR_CHAT_REQUEST_CHANNEL, {
				requestId,
				projectId,
				command
			});
		} catch (err) {
			finish(error(err instanceof Error ? err.message : String(err)));
		}
	});
}

export { handleSidebarChat };
