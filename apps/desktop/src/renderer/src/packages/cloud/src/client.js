// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/client.ts
import { hc$1 } from "../../../vendor/hono.js";

var apiUrl = "";
var webUrl = "";
var apiClient = null;
function initApi(url, options) {
	apiUrl = url;
	webUrl = options?.webUrl || "";
	apiClient = hc$1(url, { init: { credentials: "include" } });
}
function getApi() {
	if (!apiClient) throw new Error("@petal/cloud: API not initialized. Call initApi(url) first.");
	return apiClient;
}
function getApiUrl() {
	return apiUrl;
}
function getWebUrl() {
	return webUrl || (typeof window !== "undefined" ? window.location.origin : "");
}
/**
* A web settings page for a specific org. Settings show the browser session's
* active org, which is separate from the desktop app's, so name the one meant.
*/
function getWebSettingsUrl(page, organizationId) {
	const url = new URL(`/settings/${page}`, getWebUrl());
	if (organizationId) url.searchParams.set("org", organizationId);
	return url.toString();
}
function isApiError(err) {
	return err instanceof Error && typeof err.reason === "string";
}
function throwApiError(err, fallback = "Request failed") {
	throw Object.assign(new Error(err.message || fallback), { reason: err.reason || "unknown" });
}

export { getApi, getApiUrl, getWebSettingsUrl, getWebUrl, initApi, isApiError, throwApiError };
