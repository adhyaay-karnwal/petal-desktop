// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/services/ProjectBuilderClient.ts
import { getApiUrl } from "../client.js";

/**
* True when `next` is an older build than `last`. A reconnect replays the
* persisted stylesheet, which can predate the build this client just got;
* applying it would drop the classes that build added. An unstamped payload
* after a stamped one is meta persisted before builds were stamped.
*/
function isOlderCssReady(next, last) {
	const lastBuiltAt = (last?.payload)?.builtAt;
	if (lastBuiltAt === void 0) return false;
	const nextBuiltAt = next.payload?.builtAt;
	return nextBuiltAt === void 0 || nextBuiltAt < lastBuiltAt;
}
/** The API refused the file itself (it doesn't exist, or this user can't open it). Retrying won't help. */
var ProjectUnavailableError = class extends Error {
	constructor(projectId, status) {
		super("This file doesn't exist, or you don't have access to it.");
		this.projectId = projectId;
		this.status = status;
	}
};
var UNAVAILABLE_EXCHANGE_STATUSES = /* @__PURE__ */ new Set([
	401,
	403,
	404
]);
/**
* Require two missed intervals before reconnecting. A single delayed ping must
* not tear down a healthy session.
*/
var SSE_PING_STALE_MS = 31e3;
var SSE_PING_WATCHDOG_MS = 5e3;
/** Re-mint this long before `exp` so an in-flight EventSource is not rejected. */
var EXCHANGE_TOKEN_SKEW_MS = 5e3;
/**
* Project-builder exchange tokens last about a minute and ride on the SSE URL
* when third-party cookies are blocked. An expired token plus a context cookie
* for a different project is a 403 ("Session project mismatch").
*/
function exchangeTokenUsable(token, now = Date.now()) {
	const dot = token.lastIndexOf(".");
	if (dot <= 0) return false;
	try {
		const payloadB64 = token.slice(0, dot).replace(/-/g, "+").replace(/_/g, "/");
		const padded = payloadB64 + "=".repeat((4 - payloadB64.length % 4) % 4);
		const payload = JSON.parse(atob(padded));
		return typeof payload.exp === "number" && payload.exp > now + EXCHANGE_TOKEN_SKEW_MS;
	} catch {
		return false;
	}
}
var ProjectBuilderClient = class {
	constructor() {
		this.projectId = null;
		this.builderUrl = null;
		this.builderUrlByProject = /* @__PURE__ */ new Map();
		this.exchangeTokenByProject = /* @__PURE__ */ new Map();
		this.projectAccessTokenByProject = /* @__PURE__ */ new Map();
		this.exchangePromises = /* @__PURE__ */ new Map();
		this.handlers = /* @__PURE__ */ new Set();
		this.eventSource = null;
		this.connecting = null;
		this.connectingFor = null;
		this.sseReady = Promise.resolve();
		this.resolveSseReady = null;
		this.lastCssReady = null;
		this.lastModulesReady = null;
		this.lastComponentsReady = null;
		this.lastBootstrapProjectId = null;
		this.sseSawConnected = false;
		this.lastSseMessageAt = 0;
		this.pingWatchdog = null;
		this.connectionEpoch = 0;
		this.cookieProjectId = null;
	}
	on(handler, projectId) {
		this.handlers.add(handler);
		this.replayLastBootstrapEvents(handler, projectId);
		return () => this.handlers.delete(handler);
	}
	replayLastBootstrapEvents(handler, projectId) {
		const id = projectId ?? this.projectId ?? this.lastBootstrapProjectId;
		if (!id || this.lastBootstrapProjectId !== id) return;
		const events = [
			this.lastModulesReady,
			this.lastComponentsReady,
			this.lastCssReady
		].filter((event) => event != null);
		for (const event of events) handler(event);
	}
	clearBootstrapEvents() {
		this.lastCssReady = null;
		this.lastModulesReady = null;
		this.lastComponentsReady = null;
		this.lastBootstrapProjectId = null;
	}
	/**
	* Preserve an anonymous share-link credential for API requests that mint the
	* project-builder exchange token. This avoids making anonymous access depend
	* solely on the API's share cookie.
	*/
	setProjectAccessToken(projectId, token) {
		this.projectAccessTokenByProject.set(projectId, token);
	}
	emit(event) {
		if (event.type === "css:ready") {
			if (isOlderCssReady(event, this.lastCssReady)) return;
			this.lastCssReady = event;
		}
		if (event.type === "modules:ready") this.lastModulesReady = event;
		if (event.type === "components:ready") this.lastComponentsReady = event;
		if (event.type === "modules:ready" || event.type === "components:ready" || event.type === "css:ready") this.lastBootstrapProjectId = this.projectId;
		for (const handler of this.handlers) handler(event);
	}
	beginSseReady() {
		this.markSseReady();
		this.sseReady = new Promise((resolve) => {
			this.resolveSseReady = resolve;
		});
	}
	markSseReady() {
		this.resolveSseReady?.();
		this.resolveSseReady = null;
	}
	isCurrentEpoch(epoch) {
		return epoch === this.connectionEpoch;
	}
	/** True only when EventSource is fully open — CONNECTING must not block reconnect. */
	isSseConnected(projectId) {
		const es = this.eventSource;
		return !!this.projectId && (projectId === void 0 || this.projectId === projectId) && !!es && es.readyState === EventSource.OPEN;
	}
	async connect(projectId) {
		if (this.projectId === projectId && this.builderUrl && this.isSseConnected()) {
			await this.sseReady;
			return;
		}
		if (this.projectId === projectId && this.builderUrl && this.cookieProjectId === projectId && !this.isSseConnected()) {
			const epoch = ++this.connectionEpoch;
			await this.startEventSource(epoch);
			return;
		}
		if (this.connectingFor === projectId && this.connecting) {
			await this.connecting;
			if (this.projectId === projectId && this.isSseConnected()) await this.sseReady;
			return;
		}
		this.connectingFor = projectId;
		this.connecting = this._connect(projectId).finally(() => {
			if (this.connectingFor === projectId) {
				this.connecting = null;
				this.connectingFor = null;
			}
		});
		try {
			await this.connecting;
		} catch (err) {
			if (this.connectingFor === projectId) {
				this.connecting = null;
				this.connectingFor = null;
			}
			throw err;
		}
	}
	/**
	* Returns a cached builder URL only when the context cookie still belongs to
	* this project. Otherwise callers must re-run /auth/exchange.
	*/
	cachedBuilderUrl(projectId) {
		if (this.cookieProjectId !== projectId) return null;
		if (this.builderUrl && this.projectId === projectId) return this.builderUrl;
		return this.builderUrlByProject.get(projectId) ?? null;
	}
	async ensureBuilderUrl(projectId) {
		const cached = this.cachedBuilderUrl(projectId);
		if (cached) return cached;
		let pending = this.exchangePromises.get(projectId);
		if (!pending) {
			pending = this.fetchBuilderUrl(projectId).then((url) => {
				this.builderUrlByProject.set(projectId, url);
				this.cookieProjectId = projectId;
				return url;
			}).finally(() => {
				if (this.exchangePromises.get(projectId) === pending) this.exchangePromises.delete(projectId);
			});
			this.exchangePromises.set(projectId, pending);
		}
		return pending;
	}
	async fetchBuilderUrl(projectId) {
		const projectAccessToken = this.projectAccessTokenByProject.get(projectId);
		const accessQuery = projectAccessToken ? `?token=${encodeURIComponent(projectAccessToken)}` : "";
		const exchangeRes = await fetch(`${getApiUrl()}/projects/${projectId}/project-builder/exchange${accessQuery}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		});
		if (UNAVAILABLE_EXCHANGE_STATUSES.has(exchangeRes.status)) {
			const error = new ProjectUnavailableError(projectId, exchangeRes.status);
			this.emit({
				type: "project:unavailable",
				payload: error
			});
			throw error;
		}
		if (!exchangeRes.ok) throw new Error(`Project builder exchange failed: ${exchangeRes.status}`);
		const { token, builderUrl } = await exchangeRes.json();
		if (!token || !builderUrl) throw new Error("Project builder exchange returned incomplete data");
		this.exchangeTokenByProject.set(projectId, token);
		const authRes = await fetch(`${builderUrl}/auth/exchange`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token })
		});
		if (!authRes.ok) throw new Error(`Project builder auth exchange failed: ${authRes.status}`);
		return builderUrl.replace(/\/$/, "");
	}
	projectEventsPath(projectId) {
		if (!this.builderUrl) throw new Error("Project builder URL not set");
		const url = new URL(`${this.builderUrl}/projects/${encodeURIComponent(projectId)}/events`);
		const token = this.exchangeTokenByProject.get(projectId);
		if (token) url.searchParams.set("token", token);
		return url.toString();
	}
	async _connect(projectId) {
		const epoch = ++this.connectionEpoch;
		this.teardownSse();
		if (this.lastBootstrapProjectId !== projectId) this.clearBootstrapEvents();
		if (this.projectId !== projectId) {
			this.builderUrl = null;
			this.projectId = null;
		}
		if (!this.isCurrentEpoch(epoch)) return;
		this.projectId = projectId;
		const builderUrl = await this.ensureBuilderUrl(projectId);
		if (!this.isCurrentEpoch(epoch)) return;
		this.builderUrl = builderUrl;
		await this.startEventSource(epoch);
	}
	async startEventSource(epoch) {
		if (!this.isCurrentEpoch(epoch)) return;
		if (!this.builderUrl || !this.projectId) throw new Error("Project builder URL not set");
		const token = this.exchangeTokenByProject.get(this.projectId);
		if (!token || !exchangeTokenUsable(token)) {
			this.cookieProjectId = null;
			const builderUrl = await this.ensureBuilderUrl(this.projectId);
			if (!this.isCurrentEpoch(epoch)) return;
			this.builderUrl = builderUrl;
		}
		this.beginSseReady();
		this.openEventSource(epoch, true);
		await this.sseReady;
		if (!this.isCurrentEpoch(epoch)) return;
	}
	openEventSource(epoch, allowAuthRetry) {
		if (!this.builderUrl || !this.projectId) return;
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
		this.sseSawConnected = false;
		this.lastSseMessageAt = Date.now();
		const sseProjectId = this.projectId;
		const es = new EventSource(this.projectEventsPath(sseProjectId), { withCredentials: true });
		this.eventSource = es;
		this.startPingWatchdog(epoch, sseProjectId);
		es.addEventListener("message", (e) => {
			if (!this.isCurrentEpoch(epoch) || this.eventSource !== es) return;
			try {
				const event = JSON.parse(e.data);
				this.lastSseMessageAt = Date.now();
				if (event.type === "connected") {
					this.sseSawConnected = true;
					this.markSseReady();
				}
				if (event.type === "ping") return;
				this.emit(event);
			} catch {}
		});
		es.onerror = () => {
			if (!this.isCurrentEpoch(epoch) || this.eventSource !== es) {
				es.close();
				return;
			}
			const hadConnected = this.sseSawConnected;
			es.close();
			this.eventSource = null;
			this.sseSawConnected = false;
			this.stopPingWatchdog();
			if (!hadConnected && allowAuthRetry) {
				this.retrySseAfterCookieMismatch(epoch, sseProjectId);
				return;
			}
			this.cookieProjectId = null;
			this.markSseReady();
			this.emit({ type: "disconnected" });
		};
	}
	startPingWatchdog(epoch, projectId) {
		this.stopPingWatchdog();
		this.pingWatchdog = setInterval(() => {
			if (!this.isCurrentEpoch(epoch) || this.projectId !== projectId) {
				this.stopPingWatchdog();
				return;
			}
			if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) return;
			if (!this.sseSawConnected) return;
			if (Date.now() - this.lastSseMessageAt <= SSE_PING_STALE_MS) return;
			this.cookieProjectId = null;
			this.connectionEpoch++;
			this.teardownSse();
			this.emit({ type: "disconnected" });
		}, SSE_PING_WATCHDOG_MS);
	}
	stopPingWatchdog() {
		if (this.pingWatchdog == null) return;
		clearInterval(this.pingWatchdog);
		this.pingWatchdog = null;
	}
	/**
	* After a 403-style SSE failure (stale lg-pb-ctx), force a fresh auth exchange
	* and open EventSource once more before giving up.
	*/
	async retrySseAfterCookieMismatch(epoch, projectId) {
		if (!this.isCurrentEpoch(epoch) || this.projectId !== projectId) {
			this.markSseReady();
			return;
		}
		try {
			this.cookieProjectId = null;
			const builderUrl = await this.ensureBuilderUrl(projectId);
			if (!this.isCurrentEpoch(epoch) || this.projectId !== projectId) {
				this.markSseReady();
				return;
			}
			this.builderUrl = builderUrl;
			this.openEventSource(epoch, false);
		} catch {
			this.markSseReady();
			this.emit({ type: "disconnected" });
		}
	}
	async compileSnapshotPreview(projectId, body) {
		const res = await fetch(`${getApiUrl()}/projects/${projectId}/snapshot-previews`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		const data = await res.json();
		if (!res.ok) return {
			success: false,
			error: data.error || `Snapshot preview failed: ${res.status}`
		};
		return {
			success: data.success === true,
			compiledCode: data.compiledCode,
			error: data.error
		};
	}
	async scanComponents(options) {
		const projectId = this.projectId;
		if (!projectId) throw new Error("Project builder session not connected");
		await this.connect(projectId);
		const res = await fetch(`${getApiUrl()}/projects/${projectId}/components/scan`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				componentKey: options?.componentKey,
				forceRescan: options?.forceRescan
			})
		});
		if (!res.ok) {
			const err = await res.json().catch(() => null);
			throw new Error(err?.error || `Components scan failed: ${res.status}`);
		}
		return { status: (await res.json()).status ?? "started" };
	}
	teardownSse() {
		this.stopPingWatchdog();
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
		this.sseSawConnected = false;
		this.markSseReady();
	}
	teardownInternal() {
		this.teardownSse();
		this.builderUrl = null;
		this.projectId = null;
		this.connecting = null;
		this.connectingFor = null;
	}
	disconnect() {
		this.connectionEpoch++;
		this.teardownInternal();
	}
	/**
	* Drop the live stream and open a fresh one. Unlike connect(), which is a
	* no-op while SSE is open, this forces the server to re-evaluate its build
	* gate for the session — the recovery path when the initial build stalled.
	*/
	async reconnect(projectId) {
		this.disconnect();
		await this.connect(projectId);
	}
};
var projectBuilderClient = new ProjectBuilderClient();

export { ProjectUnavailableError, projectBuilderClient };
