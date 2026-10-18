// Reconstructed from index.js — original module: app/src/main/mcpTransport.ts

var MCP_SESSION_HEADER$1 = "mcp-session-id";
var SSE_HEARTBEAT_MS = 15e3;
function readMcpSessionHeader(req) {
	const raw = req.headers[MCP_SESSION_HEADER$1];
	return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : void 0;
}
function clientAcceptsEventStream(req) {
	return String(req.headers.accept ?? "").includes("text/event-stream");
}
function formatMcpSseEvent(data) {
	return `event: message\ndata: ${JSON.stringify(data)}\n\n`;
}
function matchRoute(req) {
	if (!req.url) return null;
	const url = new URL(req.url, "http://127.0.0.1");
	const legacy = url.pathname.match(/^\/mcp\/([^/]+)$/);
	const isSessionRoute = url.pathname === "/mcp" || url.pathname === "/mcp/";
	if (!legacy && !isSessionRoute) return null;
	return {
		url,
		legacyProjectId: legacy ? decodeURIComponent(legacy[1]) : void 0,
		isSessionRoute
	};
}
function sendJson(res, status, body) {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(body));
}
function sendEmpty(res, status, headers) {
	res.writeHead(status, headers);
	res.end();
}
function createMcpRequestListener(deps) {
	const { sessions, dispatch, getOpenProjectCount, isTrustedRequest, onPartialBody, log, logError } = deps;
	/**
	* The standalone SSE stream clients open after initialize. It carries no
	* JSON-RPC today — it exists so the client has a live channel — so closing it
	* is routine and must never end the session.
	*/
	function openEventStream(req, res, route) {
		if (route.legacyProjectId) {
			sendEmpty(res, 405, { Allow: "POST" });
			return;
		}
		const sessionId = readMcpSessionHeader(req);
		if (!sessionId || !sessions.has(sessionId)) {
			sendEmpty(res, 404);
			return;
		}
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"Mcp-Session-Id": sessionId
		});
		sessions.addStream(sessionId, res);
		res.write(": connected\n\n");
		const heartbeat = setInterval(() => {
			if (!res.writableEnded) res.write(": ping\n\n");
		}, SSE_HEARTBEAT_MS);
		const cleanup = () => {
			clearInterval(heartbeat);
			sessions.removeStream(sessionId, res);
		};
		req.on("close", cleanup);
		res.on("close", cleanup);
	}
	function deleteSession(req, res) {
		const sessionId = readMcpSessionHeader(req);
		if (!sessionId || !sessions.has(sessionId)) {
			sendEmpty(res, 404);
			return;
		}
		sessions.destroy(sessionId);
		sendEmpty(res, 204);
	}
	async function readBody(req, route, chatTabId) {
		const boundProjectId = route.legacyProjectId ?? (() => {
			const sessionId = readMcpSessionHeader(req);
			return sessionId ? sessions.projectIdOf(sessionId) : void 0;
		})();
		let body = "";
		for await (const chunk of req) {
			body += typeof chunk === "string" ? chunk : chunk.toString();
			onPartialBody?.(boundProjectId, body, chatTabId);
		}
		return body;
	}
	async function handlePost(req, res, route) {
		const chatTabId = route.url.searchParams.get("chatTab") || void 0;
		if (route.legacyProjectId && !chatTabId) {
			sendJson(res, 400, {
				jsonrpc: "2.0",
				error: {
					code: -32602,
					message: "In-app MCP requires ?chatTab=<chatTabId> on /mcp/<projectId>"
				}
			});
			return;
		}
		const sessionId = readMcpSessionHeader(req);
		const body = await readBody(req, route, chatTabId);
		const clientGone = new AbortController();
		res.on("close", () => {
			if (!res.writableFinished) clientGone.abort();
		});
		let message;
		try {
			message = JSON.parse(body);
		} catch (err) {
			logError?.("Malformed request body", err);
			sendJson(res, 400, {
				jsonrpc: "2.0",
				id: null,
				error: {
					code: -32700,
					message: "Parse error"
				}
			});
			return;
		}
		try {
			logRequest(message);
			writeDispatchResult(req, res, route, await dispatch(route.legacyProjectId ? void 0 : sessionId, message, {
				legacyProjectId: route.legacyProjectId,
				legacyChatTabId: chatTabId,
				signal: clientGone.signal
			}));
		} catch (err) {
			logError?.("Dispatch failed", err);
			if (!res.headersSent) sendJson(res, 500, {
				jsonrpc: "2.0",
				id: message?.id ?? null,
				error: {
					code: -32603,
					message: "Internal error"
				}
			});
		}
	}
	function writeDispatchResult(req, res, route, result) {
		const headers = {};
		if (result.sessionId && !route.legacyProjectId) headers["Mcp-Session-Id"] = result.sessionId;
		const useSse = result.body !== void 0 && result.status < 400 && clientAcceptsEventStream(req);
		if (useSse) {
			headers["Content-Type"] = "text/event-stream";
			headers["Cache-Control"] = "no-cache";
		} else headers["Content-Type"] = "application/json";
		res.writeHead(result.status, headers);
		if (result.body === void 0) {
			res.end();
			return;
		}
		res.end(useSse ? formatMcpSseEvent(result.body) : JSON.stringify(result.body));
	}
	function logRequest(message) {
		if (!log) return;
		const method = message?.method;
		if (method === "tools/call") {
			const args = message?.params?.arguments ?? {};
			const detail = args.file_path || args.pattern || args.path || "";
			log(`${message?.params?.name}${detail ? ` → ${detail}` : ""}`);
		} else if (method !== "notifications/initialized") log(String(method));
	}
	return async function handleRequest(req, res) {
		if (!isTrustedRequest(req.headers)) {
			sendEmpty(res, 403);
			return;
		}
		if (req.method === "GET" && req.url === "/health") {
			sendJson(res, 200, {
				status: "ok",
				open_project_count: getOpenProjectCount()
			});
			return;
		}
		const route = matchRoute(req);
		if (!route) {
			sendEmpty(res, 404);
			return;
		}
		if (req.method === "GET") return openEventStream(req, res, route);
		if (req.method === "DELETE" && route.isSessionRoute) return deleteSession(req, res);
		if (req.method === "POST") return handlePost(req, res, route);
		sendEmpty(res, 405, { Allow: "POST" });
	};
}

export { createMcpRequestListener };
