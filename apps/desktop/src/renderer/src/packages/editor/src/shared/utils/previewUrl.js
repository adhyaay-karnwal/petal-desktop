// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/previewUrl.ts

/**
* A Live Preview URL as typed ("petal.com", "localhost:3000") made
* absolute. Without a scheme, `<webview src>` resolves it against the editor's
* own origin and the preview loads the editor itself.
*/
function normalizePreviewUrl(input) {
	const url = input.trim();
	if (!url || /^[a-z][a-z\d+.-]*:\/\//i.test(url) || /^(about|data|blob):/i.test(url)) return url;
	return `${isLocalHost(url) ? "http" : "https"}://${url.replace(/^\/+/, "")}`;
}
/**
* Hosts dev servers run on without TLS get http: loopback, private IPv4
* (10/8, 172.16/12, 192.168/16, link-local 169.254/16) and `.local` names.
* The host must be typed in a plain form, so `localhostfoo.com`,
* `127.evil.com`, `10.0.0.1.nip.io` and `localhost:x@evil.com` stay public,
* and other spellings `URL` would also resolve to a local address
* (`2130706433`, `010.0.0.1`, `user@localhost`, `//localhost`) keep the https
* default. `URL` then checks the host it actually parses (`127.` is
* `0.0.0.127`); input it can't parse, like `localhost:abc`, is judged by the
* host as typed.
*/
function isLocalHost(url) {
	const authority = url.split(/[/?#\\]/, 1)[0];
	const typed = /^(localhost\.?|127(\.\d*)+|0\.0\.0\.0|\[::1\]|\d{1,3}(\.\d{1,3}){3}|[a-z\d-]+(\.[a-z\d-]+)*\.local\.?)(:[^@]*)?$/i.exec(authority);
	if (!typed) return false;
	const host = typed[1].toLowerCase();
	let hostname = host;
	try {
		hostname = new URL(`http://${url}`).hostname;
	} catch {}
	if (/^(localhost\.?|127(\.\d+){3}|0\.0\.0\.0|\[::1\])$/.test(hostname) || /\.local\.?$/.test(hostname)) return true;
	if (hostname !== host || !/^\d+(\.\d+){3}$/.test(hostname)) return false;
	const [a, b] = hostname.split(".").map(Number);
	return a === 10 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 169 && b === 254;
}

export { normalizePreviewUrl };
