// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/lib/figmaOAuth.ts

/**
* PKCE helpers for Figma OAuth (S256).
*/
function randomString(length) {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function base64UrlEncode(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function generatePkce() {
	const verifier = randomString(32);
	return {
		verifier,
		challenge: base64UrlEncode(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)))
	};
}
function buildFigmaAuthorizeUrl(opts) {
	return `https://www.figma.com/oauth?${new URLSearchParams({
		client_id: opts.clientId,
		redirect_uri: opts.redirectUri,
		scope: opts.scope ?? "file_content:read",
		state: opts.state,
		response_type: "code",
		code_challenge: opts.codeChallenge,
		code_challenge_method: "S256"
	}).toString()}`;
}
var FIGMA_STATE_KEY = "figma-oauth-state";
var FIGMA_VERIFIER_KEY = "figma-oauth-verifier";
var FIGMA_REDIRECT_KEY = "figma-oauth-redirect";
function figmaCallbackUrl() {
	return `${window.location.origin}/figma/callback`;
}

export { FIGMA_REDIRECT_KEY, FIGMA_STATE_KEY, FIGMA_VERIFIER_KEY, buildFigmaAuthorizeUrl, figmaCallbackUrl, generatePkce };
