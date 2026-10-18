// Reconstructed from index.js — original module: app/src/main/auth.ts
import { createAuthClient } from "../../../vendor/better-auth.js";
import { electronClient, storage } from "../../../vendor/@better-auth/electron.js";

// Built-in API server (see petalServer.js). PETAL_API_URL / PETAL_WEB_URL point at a hosted one instead.
var API_URL = process.env.PETAL_API_URL || `http://127.0.0.1:${Number(process.env.PETAL_API_PORT) || 4280}`;
var WEB_URL = process.env.PETAL_WEB_URL || API_URL;
var SCHEME = "com.petal.desktop";
/** The origin the API trusts for this app (see `trustedOrigins` in apps/api/src/auth.ts). */
var DESKTOP_ORIGIN = `${SCHEME}:/`;
var authClient = createAuthClient({
	baseURL: API_URL,
	plugins: [electronClient({
		signInURL: `${WEB_URL}/login`,
		protocol: { scheme: SCHEME },
		storage: storage()
	})]
});
function getApiUrl() {
	return API_URL;
}
function getWebUrl() {
	return WEB_URL;
}

export { DESKTOP_ORIGIN, authClient, getApiUrl, getWebUrl };
