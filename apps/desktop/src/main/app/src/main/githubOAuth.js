// Reconstructed from index.js — original module: app/src/main/githubOAuth.ts
import { http } from "../../../__bundle__/_preamble.js";
import { authClient, getApiUrl } from "./auth.js";

/**
* Loopback receiver for the GitHub OAuth code (RFC 8252).
*
* The OAuth flow runs in the system browser, whose session belongs to whoever
* is logged in *there* — exchanging the code in that page would bind the GitHub
* token to the wrong Petal account. So the callback page hands the code
* back here instead, and we exchange it with the desktop's own session.
*
* Loopback rather than the com.petal.desktop:// scheme because custom
* schemes need OS registration, which unpackaged dev builds don't have on
* Linux (setAsDefaultProtocolClient is Windows/macOS only).
*/
/** Fixed so the web callback page can reach it without a port handshake. */
var GITHUB_OAUTH_PORT = Number(process.env.PETAL_GITHUB_OAUTH_PORT) || 23584;
var server = null;
/**
* Trade a GitHub OAuth code for tokens using the desktop's session cookie.
* Returns true when the token was stored against the signed-in account.
*/
async function exchangeGitHubCode(code) {
	if (!code) return false;
	try {
		const res = await fetch(`${getApiUrl()}/github/exchange`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: authClient.getCookie() ?? ""
			},
			body: JSON.stringify({ code })
		});
		if (!res.ok) {
			console.error("[GitHub] Code exchange failed:", res.status, await res.text());
			return false;
		}
		return true;
	} catch (err) {
		console.error("[GitHub] Code exchange error:", err);
		return false;
	}
}
function page(title, detail) {
	return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f0">
<div style="text-align:center"><p style="font-weight:500">${title}</p>
<p style="font-size:13px;color:#78716c">${detail}</p></div>`;
}
/** Start the receiver. `onConnected` fires after a successful exchange. */
function startGitHubOAuthServer(onConnected) {
	if (server) return;
	server = (0, http.createServer)(async (req, res) => {
		const url = new URL(req.url ?? "/", `http://127.0.0.1:${GITHUB_OAUTH_PORT}`);
		if (url.pathname !== "/github-connected") {
			res.writeHead(404).end();
			return;
		}
		const ok = await exchangeGitHubCode(url.searchParams.get("code"));
		res.writeHead(ok ? 200 : 400, { "Content-Type": "text/html; charset=utf-8" });
		res.end(ok ? page("GitHub connected!", "You can close this window.") : page("Connection failed", "Please try again from Petal."));
		if (ok) onConnected();
	});
	server.on("error", (err) => {
		console.error("[GitHub] OAuth receiver failed to start:", err);
		server = null;
	});
	server.listen(GITHUB_OAUTH_PORT, "127.0.0.1", () => {
		console.log(`[GitHub] OAuth receiver on http://127.0.0.1:${GITHUB_OAUTH_PORT}`);
	});
}

export { exchangeGitHubCode, startGitHubOAuthServer };
