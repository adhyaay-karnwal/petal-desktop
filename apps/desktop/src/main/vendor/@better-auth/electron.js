// Reconstructed from index.js — original module: vendor/@better-auth/electron
import { electron, node_buffer, node_path, require_dist$2 } from "../../__bundle__/_preamble.js";
import { APIError$1, BetterAuthError, generateRandomString, getBaseURL$1, isDevelopment, isTest, parseSetCookieHeader, safeJSONParse, signInSocial } from "../better-auth.js";
import { base64$1, base64Url, createHash$1 } from "./utils.js";
import { Conf } from "../conf.js";

function isProcessType(type) {
	return typeof process !== "undefined" && process.type === type;
}
function parseProtocolScheme(protocolOption) {
	if (typeof protocolOption === "string") return {
		scheme: protocolOption,
		privileges: {}
	};
	return {
		scheme: protocolOption.scheme,
		privileges: protocolOption.privileges || {}
	};
}
function getChannelPrefixWithDelimiter(ns = "better-auth") {
	return ns.length > 0 ? ns + ":" : ns;
}
var { net } = electron.default;
var DEFAULT_MAX_BYTES = 5242880;
async function fetchUserImage(baseURL, url, options) {
	if (options?.userImageProxy?.enabled === false) return null;
	const decoded = await decodeDataImageUrl(url, options);
	if (decoded) return {
		stream: new ReadableStream({ start(controller) {
			controller.enqueue(decoded.bytes);
			controller.close();
		} }),
		mimeType: decoded.mimeType
	};
	let resolvedUrl;
	try {
		let parsed;
		try {
			parsed = new URL(url);
		} catch {
			if (!baseURL) return null;
			const base = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
			const relative = url.startsWith("/") ? url.slice(1) : url;
			parsed = new URL(relative, base);
		}
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
		if (!isDevelopment() && isLocalOrigin(parsed)) return null;
		resolvedUrl = parsed.href;
	} catch {
		return null;
	}
	const { maxSize = DEFAULT_MAX_BYTES, accept = "image/*", customValidator: validateImage = detectImageType } = options?.userImageProxy ?? {};
	const response = await net.fetch(resolvedUrl, {
		method: "GET",
		headers: { accept }
	});
	if (!response.ok) return null;
	const contentType = response.headers.get("content-type");
	if (!contentType?.startsWith("image/") || contentType.startsWith("image/svg")) return null;
	const contentLength = response.headers.get("content-length");
	if (contentLength && Number(contentLength) > maxSize) return null;
	const body = response.body;
	if (!body) return null;
	const mimeType = contentType.split(";")[0]?.trim() || "image/png";
	const reader = body.getReader();
	let totalSize = 0;
	let firstChunk = true;
	return {
		stream: new ReadableStream({
			async pull(controller) {
				const { done, value } = await reader.read();
				if (done) {
					controller.close();
					return;
				}
				totalSize += value.byteLength;
				if (totalSize > maxSize) {
					reader.cancel();
					controller.error(/* @__PURE__ */ new Error("Image exceeds maximum size"));
					return;
				}
				if (firstChunk) {
					firstChunk = false;
					if (!validateImage(value)) {
						reader.cancel();
						controller.error(/* @__PURE__ */ new Error("Invalid image type"));
						return;
					}
				}
				controller.enqueue(value);
			},
			cancel() {
				reader.cancel();
			}
		}),
		mimeType
	};
}
function normalizeUserOutput(user, options) {
	const result = { ...user };
	if (result.image && options?.userImageProxy?.enabled !== false) result.image = `${options?.userImageProxy?.scheme || "user-image"}://${result.id}`;
	return result;
}
async function decodeDataImageUrl(url, options) {
	const maxSize = options?.userImageProxy?.maxSize ?? DEFAULT_MAX_BYTES;
	const maxBase64Size = Math.ceil(maxSize * 4 / 3);
	const lower = url.toLowerCase();
	if (!lower.startsWith("data:image/") || lower.startsWith("data:image/svg")) return null;
	const markerIdx = lower.indexOf(";base64,");
	if (markerIdx === -1) return null;
	const mimeType = url.substring(5, markerIdx);
	const payload = url.substring(markerIdx + 8);
	if (!payload || payload.length > maxBase64Size) return null;
	try {
		const bytes = base64$1.decode(payload);
		const { customValidator: validateImage = detectImageType } = options?.userImageProxy ?? {};
		if (!await validateImage(bytes)) return null;
		return {
			bytes,
			mimeType
		};
	} catch {
		return null;
	}
}
function isLocalOrigin(parsed) {
	const hostname = parsed.hostname.toLowerCase();
	if (hostname === "localhost") return true;
	const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (m) {
		const a = Number(m[1]);
		const b = Number(m[2]);
		if (a === 127) return true;
		if (a === 10) return true;
		if (a === 172 && b >= 16 && b <= 31) return true;
		if (a === 192 && b === 168) return true;
		if (a === 169 && b === 254) return true;
		return false;
	}
	const h = hostname.replace(/^\[|\]$/g, "");
	if (h === "::1" || /^(0:){7}1$/.test(h) || h === "0:0:0:0:0:0:0:1") return true;
	if (/^fe[89ab][0-9a-f]/i.test(h)) return true;
	return false;
}
function detectImageType(bytes) {
	if (bytes.length < 12) return null;
	if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) return "image/png";
	if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpg";
	if (bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 56 && (bytes[4] === 55 || bytes[4] === 57) && bytes[5] === 97) return "image/gif";
	if (bytes.length >= 12 && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return "image/webp";
	if (bytes[0] === 66 && bytes[1] === 77) return "image/bmp";
	if (bytes[0] === 73 && bytes[1] === 73 && bytes[2] === 42 && bytes[3] === 0 || bytes[0] === 77 && bytes[1] === 77 && bytes[2] === 0 && bytes[3] === 42) return "image/tiff";
	if (bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return "image/x-icon";
	if (bytes.length < 16) return null;
	if (String.fromCharCode(...bytes.slice(4, 8)) !== "ftyp") return null;
	const brand = String.fromCharCode(...bytes.slice(8, 12));
	if (brand === "avif" || brand === "heic" || brand === "heif") return `image/${brand}`;
	if (brand === "heix" || brand === "hevc" || brand === "mif1" || brand === "msf1") return "image/heic";
	return null;
}
var kElectron = Symbol.for("better-auth:electron");
(() => {
	const { provider, idToken, loginHint, ...signInSocialBody } = signInSocial().options.body.shape;
	return require_dist$2.object({
		...signInSocialBody,
		provider: require_dist$2.string().nonempty().optional()
	});
})();
/**
* Opens the system browser to request user authentication.
*/
async function requestAuth(clientOptions, options, cfg) {
	if (!isProcessType("browser")) throw new BetterAuthError("`requestAuth` can only be called in the main process");
	const { randomBytes } = await import("node:crypto");
	const state = generateRandomString(16, "A-Z", "a-z", "0-9");
	const codeVerifier = base64Url.encode(randomBytes(32));
	const codeChallenge = base64Url.encode(await createHash$1("SHA-256").digest(codeVerifier));
	(globalThis[kElectron] ??= /* @__PURE__ */ new Map()).set(state, codeVerifier);
	let url = null;
	if (cfg?.provider) {
		const baseURL = getBaseURL$1(clientOptions?.baseURL, clientOptions?.basePath, void 0, true);
		if (!baseURL) {
			console.log("No base URL found in client options");
			throw APIError$1.from("INTERNAL_SERVER_ERROR", {
				code: "NO_BASE_URL",
				message: "Base URL is required to use provider-based sign-in."
			});
		}
		url = new URL(`${baseURL}/electron/init-oauth-proxy`);
		for (const [key, value] of Object.entries(cfg)) url.searchParams.set(key, typeof value === "string" ? value : JSON.stringify(value));
	} else url = new URL(options.signInURL);
	url.searchParams.set("client_id", options.clientID || "electron");
	url.searchParams.set("code_challenge", codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("state", state);
	await electron.shell.openExternal(url.toString(), { activate: true });
}
/**
* Exchanges the authorization code for a session.
*/
async function authenticate({ $fetch, options, token, getWindow, fetchOptions }) {
	if (!isProcessType("browser")) throw new BetterAuthError("`authenticate` can only be called in the main process.");
	const decoded = safeJSONParse(new TextDecoder().decode(base64Url.decode(decodeURIComponent(token))));
	const codeVerifier = globalThis[kElectron]?.get(decoded?.state);
	globalThis[kElectron]?.delete(decoded?.state);
	if (!codeVerifier) throw new BetterAuthError("Code verifier not found.");
	return await $fetch("/electron/token", {
		...fetchOptions,
		method: "POST",
		body: {
			...fetchOptions?.body || {},
			token: decoded.identifier,
			state: decoded.state,
			code_verifier: codeVerifier
		},
		onSuccess: async (ctx) => {
			let user = ctx.data?.user ?? null;
			if (user !== null && typeof options.sanitizeUser === "function") try {
				user = await options.sanitizeUser(user);
			} catch (error) {
				console.error("Error while sanitizing user", error);
				user = null;
			}
			if (user === null) return;
			user = normalizeUserOutput(user, options);
			await fetchOptions?.onSuccess?.(ctx);
			getWindow()?.webContents.send(`${getChannelPrefixWithDelimiter(options.channelPrefix)}authenticated`, user);
		}
	});
}
var { app: app$1$1, session: session$2, protocol, BrowserWindow: BrowserWindow$2, ipcMain: ipcMain$5, webContents: webContents$1$1 } = electron.default;
function withGetWindowFallback(win) {
	return win ?? (() => {
		const allWindows = BrowserWindow$2.getAllWindows();
		return allWindows.length > 0 ? allWindows[0] : null;
	});
}
function setupMain($fetch, $store, getCookie, opts, clientOptions, cfg) {
	if (!isProcessType("browser")) throw new BetterAuthError("setupMain can only be called in the main process.");
	const getWindow = withGetWindowFallback(cfg?.getWindow);
	if (!cfg || cfg.csp === true) setupCSP(clientOptions, opts);
	if (!cfg || cfg.scheme === true) registerProtocolScheme($fetch, opts, getWindow, clientOptions);
	if (!cfg || cfg.bridges === true) setupBridges({
		$fetch,
		$store,
		getCookie,
		getWindow
	}, opts, clientOptions);
	if (opts.userImageProxy?.enabled !== false) setupUserImageProxy({
		$fetch,
		getCookie
	}, opts, clientOptions);
}
/**
* Handles the deep link URL for authentication.
*/
async function handleDeepLink({ $fetch, options, url, getWindow, clientOptions }) {
	if (!isProcessType("browser")) throw new BetterAuthError("`handleDeepLink` can only be called in the main process.");
	let parsedURL = null;
	try {
		parsedURL = new URL(url);
	} catch {}
	if (!parsedURL) return;
	const { scheme } = parseProtocolScheme(options.protocol);
	if (!url.startsWith(`${scheme}:/`)) return;
	const { protocol, pathname, hostname, hash } = parsedURL;
	if (protocol !== `${scheme}:`) return;
	if ("/" + hostname + pathname !== (options.callbackPath || "/auth/callback")) return;
	if (!hash.startsWith("#token=")) return;
	await authenticate({
		$fetch,
		fetchOptions: { throw: true },
		token: hash.substring(7),
		getWindow: withGetWindowFallback(getWindow),
		options
	});
}
function registerProtocolScheme($fetch, options, getWindow, clientOptions) {
	const { scheme, privileges = {} } = typeof options.protocol === "string" ? { scheme: options.protocol } : options.protocol;
	protocol.registerSchemesAsPrivileged([{
		scheme,
		privileges: {
			standard: false,
			secure: true,
			...privileges
		}
	}]);
	let hasSetupProtocolClient = false;
	if (process?.defaultApp) {
		if (process.argv.length >= 2 && typeof process.argv[1] === "string") hasSetupProtocolClient = app$1$1.setAsDefaultProtocolClient(scheme, process.execPath, [(0, node_path.resolve)(process.argv[1])]);
	} else hasSetupProtocolClient = app$1$1.setAsDefaultProtocolClient(scheme);
	if (!hasSetupProtocolClient) console.error(`Failed to register protocol ${scheme} as default protocol client.`);
	if (!app$1$1.requestSingleInstanceLock()) app$1$1.quit();
	else {
		app$1$1.on("second-instance", async (_event, commandLine, _workingDir, url) => {
			const win = getWindow();
			if (win) {
				if (win.isMinimized()) win.restore();
				win.focus();
			}
			if (!url) {
				const maybeURL = commandLine.pop();
				if (typeof maybeURL === "string" && maybeURL.trim() !== "") try {
					url = new URL(maybeURL).toString();
				} catch {}
			}
			if (process?.platform !== "darwin" && typeof url === "string") await handleDeepLink({
				$fetch,
				options,
				url,
				getWindow,
				clientOptions
			});
		});
		app$1$1.on("open-url", async (_event, url) => {
			if (process?.platform === "darwin") await handleDeepLink({
				$fetch,
				options,
				url,
				getWindow,
				clientOptions
			});
		});
		app$1$1.whenReady().then(async () => {
			if (process?.platform !== "darwin" && typeof process.argv[1] === "string") await handleDeepLink({
				$fetch,
				options,
				url: process.argv[1],
				getWindow,
				clientOptions
			});
		});
	}
}
function setupCSP(clientOptions, options) {
	app$1$1.whenReady().then(() => {
		session$2.defaultSession.webRequest.onHeadersReceived((details, callback) => {
			const origin = new URL(clientOptions?.baseURL || "", "http://localhost").origin;
			const cspKey = Object.keys(details.responseHeaders || {}).find((k) => k.toLowerCase() === "content-security-policy");
			if (!cspKey) return callback({ responseHeaders: {
				...details.responseHeaders || {},
				"content-security-policy": `connect-src 'self' ${origin}`
			} });
			const policy = details.responseHeaders?.[cspKey]?.toString() || "";
			const csp = /* @__PURE__ */ new Map();
			for (let token of policy.split(";")) {
				token = token.trim();
				if (!token || !/^[\x00-\x7f]*$/.test(token)) continue;
				const [rawDirectiveName, ...directiveValue] = token.split(/\s+/);
				const directiveName = rawDirectiveName?.toLowerCase();
				if (!directiveName) continue;
				if (csp.has(directiveName)) continue;
				csp.set(directiveName, directiveValue);
			}
			if (csp.has("connect-src")) {
				const values = csp.get("connect-src") || [];
				if (!values.includes(origin)) values.push(origin);
				csp.set("connect-src", values);
			} else csp.set("connect-src", ["'self'", origin]);
			const userImageScheme = (options.userImageProxy?.scheme || "user-image") + ":";
			if (csp.has("img-src")) {
				const values = csp.get("img-src") || [];
				if (!values.includes(userImageScheme)) values.push(userImageScheme);
				csp.set("img-src", values);
			} else csp.set("img-src", ["'self'", userImageScheme]);
			callback({ responseHeaders: {
				...details.responseHeaders,
				"content-security-policy": Array.from(csp.entries()).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ")
			} });
		});
	});
}
/**
* Sets up IPC bridges in the main process.
*/
function setupBridges(ctx, opts, clientOptions) {
	const prefix = getChannelPrefixWithDelimiter(opts.channelPrefix);
	ctx.$store?.atoms.session?.subscribe(async (state) => {
		if (state.isPending === true) return;
		let user = state.data?.user ?? null;
		if (user !== null && typeof opts.sanitizeUser === "function") try {
			user = await opts.sanitizeUser(user);
		} catch (error) {
			console.error("Error while sanitizing user", error);
			user = null;
		}
		if (user !== null) user = normalizeUserOutput(user, opts);
		webContents$1$1.getFocusedWebContents()?.send(`${prefix}user-updated`, user);
	});
	ipcMain$5.handle(`${prefix}getUser`, async () => {
		let user = (await ctx.$fetch("/get-session", {
			method: "GET",
			headers: {
				cookie: ctx.getCookie(),
				"content-type": "application/json"
			}
		})).data?.user ?? null;
		if (user !== null && typeof opts.sanitizeUser === "function") try {
			user = await opts.sanitizeUser(user);
		} catch (error) {
			console.error("Error while sanitizing user", error);
			user = null;
		}
		if (user !== null) user = normalizeUserOutput(user, opts);
		return user ?? null;
	});
	ipcMain$5.handle(`${prefix}requestAuth`, async (_evt, options) => requestAuth(clientOptions, opts, options));
	ipcMain$5.handle(`${prefix}authenticate`, async (_evt, data) => {
		await authenticate({
			$fetch: ctx.$fetch,
			getWindow: ctx.getWindow,
			options: opts,
			token: data.token
		});
	});
	ipcMain$5.handle(`${prefix}signOut`, async () => {
		await ctx.$fetch("/sign-out", {
			method: "POST",
			body: "{}",
			headers: {
				cookie: ctx.getCookie(),
				"content-type": "application/json"
			}
		});
	});
}
function setupUserImageProxy(ctx, opts, clientOptions) {
	const hasAdminPlugin = clientOptions?.plugins?.some((plugin) => plugin.id === "admin") ?? false;
	const scheme = opts.userImageProxy?.scheme || "user-image";
	protocol.registerSchemesAsPrivileged([{
		scheme,
		privileges: {
			standard: false,
			secure: true,
			bypassCSP: true,
			stream: true
		}
	}]);
	app$1$1.whenReady().then(() => {
		protocol.handle(scheme, async (request) => {
			try {
				const userId = new URL(request.url).hostname;
				if (!userId) return new Response(null, { status: 400 });
				const headers = {
					cookie: ctx.getCookie(),
					"content-type": "application/json"
				};
				let imageUrl = null;
				const sessionResult = await ctx.$fetch("/get-session", {
					method: "GET",
					headers
				});
				if (sessionResult.data?.user?.id === userId) imageUrl = sessionResult.data.user.image;
				else if (hasAdminPlugin) imageUrl = (await ctx.$fetch(`/admin/get-user?id=${encodeURIComponent(userId)}`, {
					method: "GET",
					headers
				})).data?.user?.image;
				if (!imageUrl) return new Response(null, { status: 404 });
				const result = await fetchUserImage(clientOptions?.baseURL, imageUrl, opts);
				if (!result) return new Response(null, { status: 404 });
				return new Response(result.stream, { headers: {
					"content-type": result.mimeType,
					"cache-control": "private, max-age=3600"
				} });
			} catch {
				return new Response(null, { status: 500 });
			}
		});
	});
}
function getSetCookie(header, prevCookie) {
	const parsed = parseSetCookieHeader(header);
	let toSetCookie = {};
	parsed.forEach((cookie, key) => {
		const expiresAt = cookie["expires"];
		const maxAge = cookie["max-age"];
		const expires = maxAge ? new Date(Date.now() + Number(maxAge) * 1e3) : expiresAt ? new Date(String(expiresAt)) : null;
		toSetCookie[key] = {
			value: cookie["value"],
			expires: expires ? expires.toISOString() : null
		};
	});
	if (prevCookie) try {
		toSetCookie = {
			...JSON.parse(prevCookie),
			...toSetCookie
		};
	} catch {}
	return JSON.stringify(toSetCookie);
}
function getCookie(cookie) {
	let parsed = {};
	try {
		parsed = JSON.parse(cookie);
	} catch (_e) {}
	return Object.entries(parsed).reduce((acc, [key, value]) => {
		if (value.expires && new Date(value.expires) < /* @__PURE__ */ new Date()) return acc;
		return `${acc}; ${key}=${value.value}`;
	}, "");
}
/**
* Compare if session cookies have actually changed by comparing their values.
* Ignores expiry timestamps that naturally change on each request.
*
* @param prevCookie - Previous cookie JSON string
* @param newCookie - New cookie JSON string
* @returns true if session cookies have changed, false otherwise
*/
function hasSessionCookieChanged(prevCookie, newCookie) {
	if (!prevCookie) return true;
	try {
		const prev = JSON.parse(prevCookie);
		const next = JSON.parse(newCookie);
		const sessionKeys = /* @__PURE__ */ new Set();
		Object.keys(prev).forEach((key) => {
			if (key.includes("session_token") || key.includes("session_data")) sessionKeys.add(key);
		});
		Object.keys(next).forEach((key) => {
			if (key.includes("session_token") || key.includes("session_data")) sessionKeys.add(key);
		});
		for (const key of sessionKeys) if (prev[key]?.value !== next[key]?.value) return true;
		return false;
	} catch {
		return true;
	}
}
/**
* Check if the Set-Cookie header contains better-auth cookies.
* This prevents infinite refetching when non-better-auth cookies (like third-party cookies) change.
*
* Supports multiple cookie naming patterns:
* - Default: "better-auth.session_token", "better-auth-passkey", "__Secure-better-auth.session_token"
* - Custom prefix: "myapp.session_token", "myapp-passkey", "__Secure-myapp.session_token"
* - Custom full names: "my_custom_session_token", "custom_session_data"
* - No prefix (cookiePrefix=""): matches any cookie with known suffixes
* - Multiple prefixes: ["better-auth", "my-app"] matches cookies starting with any of the prefixes
*
* @param setCookieHeader - The Set-Cookie header value
* @param cookiePrefix - The cookie prefix(es) to check for. Can be a string, array of strings, or empty string.
* @returns true if the header contains better-auth cookies, false otherwise
*/
function hasBetterAuthCookies(setCookieHeader, cookiePrefix) {
	const cookies = parseSetCookieHeader(setCookieHeader);
	const cookieSuffixes = ["session_token", "session_data"];
	const prefixes = Array.isArray(cookiePrefix) ? cookiePrefix : [cookiePrefix];
	for (const name of cookies.keys()) {
		const nameWithoutSecure = name.startsWith("__Secure-") ? name.slice(9) : name;
		for (const prefix of prefixes) if (prefix) {
			if (nameWithoutSecure.startsWith(prefix)) return true;
		} else for (const suffix of cookieSuffixes) if (nameWithoutSecure.endsWith(suffix)) return true;
	}
	return false;
}
var { app: app$8, safeStorage, webContents: webContents$3 } = electron.default;
var storageAdapter = (storage) => {
	return {
		...storage,
		getDecrypted: (name) => {
			const item = storage.getItem(name);
			if (!item || typeof item !== "string") return null;
			return safeStorage.decryptString(node_buffer.Buffer.from(base64$1.decode(item)));
		},
		setEncrypted: (name, value) => {
			return storage.setItem(name, base64$1.encode(safeStorage.encryptString(value)));
		}
	};
};
var electronClient = (options) => {
	const opts = {
		storagePrefix: "better-auth",
		cookiePrefix: "better-auth",
		channelPrefix: "better-auth",
		callbackPath: "/auth/callback",
		...options
	};
	const { scheme } = parseProtocolScheme(opts.protocol);
	let store = null;
	const cookieName = `${opts.storagePrefix}.cookie`;
	const localCacheName = `${opts.storagePrefix}.local_cache`;
	const { getDecrypted, setEncrypted } = storageAdapter(opts.storage);
	if ((isDevelopment() || isTest()) && /^(?!\.)(?!.*\.\.)(?!.*\.$)[^.]+\.[^.]+$/.test(scheme)) console.warn("The provided scheme does not follow the reverse domain name notation. For example: `app.example.com` -> `com.example.app`.");
	return {
		id: "electron",
		fetchPlugins: [{
			id: "electron",
			name: "Electron",
			async init(url, options) {
				if (!isProcessType("browser")) throw new Error("Requests must be made from the Electron main process");
				const cookie = getCookie(getDecrypted(cookieName) || "{}");
				options ||= {};
				options.credentials = "omit";
				options.headers = {
					...options.headers,
					cookie,
					"user-agent": app$8.userAgentFallback,
					"electron-origin": `${scheme}:/`,
					"x-skip-oauth-proxy": "true"
				};
				if (url.endsWith("/sign-out")) {
					setEncrypted(cookieName, "{}");
					store?.atoms.session?.set({
						...store.atoms.session.get(),
						data: null,
						error: null,
						isPending: false
					});
					setEncrypted(localCacheName, "{}");
				}
				return {
					url,
					options
				};
			},
			hooks: {
				onSuccess: async (context) => {
					const setCookie = context.response.headers.get("set-cookie");
					if (setCookie) {
						if (hasBetterAuthCookies(setCookie, opts.cookiePrefix)) {
							const prevCookie = getDecrypted(cookieName);
							const toSetCookie = getSetCookie(setCookie || "{}", prevCookie ?? void 0);
							if (hasSessionCookieChanged(prevCookie, toSetCookie)) {
								setEncrypted(cookieName, toSetCookie);
								store?.notify("$sessionSignal");
							} else setEncrypted(cookieName, toSetCookie);
						}
					}
					if (context.request.url.toString().includes("/get-session") && !opts.disableCache) {
						const data = context.data;
						setEncrypted(localCacheName, JSON.stringify(data));
					}
				},
				onError: async (context) => {
					webContents$3.getFocusedWebContents()?.send(`${getChannelPrefixWithDelimiter(opts.channelPrefix)}error`, {
						...context.error,
						path: context.request.url
					});
				}
			}
		}],
		getActions: ($fetch, $store, clientOptions) => {
			store = $store;
			let getWindow = () => null;
			const getCookieFn = () => {
				return getCookie(getDecrypted(cookieName) || "{}");
			};
			return {
				getCookie: getCookieFn,
				authenticate: async (data) => {
					return await authenticate({
						...data,
						$fetch,
						options,
						getWindow: withGetWindowFallback(getWindow)
					});
				},
				requestAuth: (options) => requestAuth(clientOptions, opts, options),
				setupMain: (cfg) => {
					if (cfg?.getWindow) getWindow = cfg.getWindow;
					return setupMain($fetch, store, getCookieFn, opts, clientOptions, cfg);
				},
				$Infer: {}
			};
		}
	};
};
var { app: app$7 } = electron.default;
var storage = (opts) => {
	if (!app$7) return {
		getItem: () => null,
		setItem: () => {}
	};
	const config = new Conf({
		cwd: app$7.getPath("userData"),
		projectName: app$7.getName(),
		projectVersion: app$7.getVersion(),
		...opts
	});
	return {
		getItem: (key) => {
			return config.get(key, null);
		},
		setItem: (key, value) => {
			config.set(key, value);
		}
	};
};

export { electronClient, storage };
