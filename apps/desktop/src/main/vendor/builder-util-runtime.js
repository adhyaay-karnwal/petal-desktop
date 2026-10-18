// Reconstructed from index.js — original module: vendor/builder-util-runtime
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_src } from "./debug.js";
import { require_sax } from "./sax.js";

var require_CancellationToken = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CancellationError = exports.CancellationToken = void 0;
	var events_1$1 = require("events");
	var CancellationToken = class extends events_1$1.EventEmitter {
		get cancelled() {
			return this._cancelled || this._parent != null && this._parent.cancelled;
		}
		set parent(value) {
			this.removeParentCancelHandler();
			this._parent = value;
			this.parentCancelHandler = () => this.cancel();
			this._parent.onCancel(this.parentCancelHandler);
		}
		constructor(parent) {
			super();
			this.parentCancelHandler = null;
			this._parent = null;
			this._cancelled = false;
			if (parent != null) this.parent = parent;
		}
		cancel() {
			this._cancelled = true;
			this.emit("cancel");
		}
		onCancel(handler) {
			if (this.cancelled) handler();
			else this.once("cancel", handler);
		}
		createPromise(callback) {
			if (this.cancelled) return Promise.reject(new CancellationError());
			const finallyHandler = () => {
				if (cancelHandler != null) try {
					this.removeListener("cancel", cancelHandler);
					cancelHandler = null;
				} catch (_ignore) {}
			};
			let cancelHandler = null;
			return new Promise((resolve, reject) => {
				let addedCancelHandler = null;
				cancelHandler = () => {
					try {
						if (addedCancelHandler != null) {
							addedCancelHandler();
							addedCancelHandler = null;
						}
					} finally {
						reject(new CancellationError());
					}
				};
				if (this.cancelled) {
					cancelHandler();
					return;
				}
				this.onCancel(cancelHandler);
				callback(resolve, reject, (callback) => {
					addedCancelHandler = callback;
				});
			}).then((it) => {
				finallyHandler();
				return it;
			}).catch((e) => {
				finallyHandler();
				throw e;
			});
		}
		removeParentCancelHandler() {
			const parent = this._parent;
			if (parent != null && this.parentCancelHandler != null) {
				parent.removeListener("cancel", this.parentCancelHandler);
				this.parentCancelHandler = null;
			}
		}
		dispose() {
			try {
				this.removeParentCancelHandler();
			} finally {
				this.removeAllListeners();
				this._parent = null;
			}
		}
	};
	exports.CancellationToken = CancellationToken;
	var CancellationError = class extends Error {
		constructor() {
			super("cancelled");
		}
	};
	exports.CancellationError = CancellationError;
}));
var require_error = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.newError = newError;
	function newError(message, code) {
		const error = new Error(message);
		error.code = code;
		return error;
	}
}));
var require_ProgressCallbackTransform = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProgressCallbackTransform = void 0;
	var stream_1$3 = require("stream");
	var ProgressCallbackTransform = class extends stream_1$3.Transform {
		constructor(total, cancellationToken, onProgress) {
			super();
			this.total = total;
			this.cancellationToken = cancellationToken;
			this.onProgress = onProgress;
			this.start = Date.now();
			this.transferred = 0;
			this.delta = 0;
			this.nextUpdate = this.start + 1e3;
		}
		_transform(chunk, encoding, callback) {
			if (this.cancellationToken.cancelled) {
				callback(/* @__PURE__ */ new Error("cancelled"), null);
				return;
			}
			this.transferred += chunk.length;
			this.delta += chunk.length;
			const now = Date.now();
			if (now >= this.nextUpdate && this.transferred !== this.total) {
				this.nextUpdate = now + 1e3;
				this.onProgress({
					total: this.total,
					delta: this.delta,
					transferred: this.transferred,
					percent: this.transferred / this.total * 100,
					bytesPerSecond: Math.round(this.transferred / ((now - this.start) / 1e3))
				});
				this.delta = 0;
			}
			callback(null, chunk);
		}
		_flush(callback) {
			if (this.cancellationToken.cancelled) {
				callback(/* @__PURE__ */ new Error("cancelled"));
				return;
			}
			this.onProgress({
				total: this.total,
				delta: this.delta,
				transferred: this.total,
				percent: 100,
				bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
			});
			this.delta = 0;
			callback(null);
		}
	};
	exports.ProgressCallbackTransform = ProgressCallbackTransform;
}));
var require_httpExecutor = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DigestTransform = exports.HttpExecutor = exports.HttpError = void 0;
	exports.createHttpError = createHttpError;
	exports.parseJson = parseJson;
	exports.configureRequestOptionsFromUrl = configureRequestOptionsFromUrl;
	exports.configureRequestUrl = configureRequestUrl;
	exports.safeGetHeader = safeGetHeader;
	exports.configureRequestOptions = configureRequestOptions;
	exports.safeStringifyJson = safeStringifyJson;
	var crypto_1$4 = require("crypto");
	var debug_1 = require_src();
	var fs_1$5 = require("fs");
	var stream_1$2 = require("stream");
	var url_1$7 = require("url");
	var CancellationToken_1 = require_CancellationToken();
	var error_1 = require_error();
	var ProgressCallbackTransform_1 = require_ProgressCallbackTransform();
	var debug = (0, debug_1.default)("electron-builder");
	function createHttpError(response, description = null) {
		return new HttpError(response.statusCode || -1, `${response.statusCode} ${response.statusMessage}` + (description == null ? "" : "\n" + JSON.stringify(description, null, "  ")) + "\nHeaders: " + safeStringifyJson(response.headers), description);
	}
	var HTTP_STATUS_CODES = /* @__PURE__ */ new Map([
		[429, "Too many requests"],
		[400, "Bad request"],
		[403, "Forbidden"],
		[404, "Not found"],
		[405, "Method not allowed"],
		[406, "Not acceptable"],
		[408, "Request timeout"],
		[413, "Request entity too large"],
		[500, "Internal server error"],
		[502, "Bad gateway"],
		[503, "Service unavailable"],
		[504, "Gateway timeout"],
		[505, "HTTP version not supported"]
	]);
	var HttpError = class extends Error {
		constructor(statusCode, message = `HTTP error: ${HTTP_STATUS_CODES.get(statusCode) || statusCode}`, description = null) {
			super(message);
			this.statusCode = statusCode;
			this.description = description;
			this.name = "HttpError";
			this.code = `HTTP_ERROR_${statusCode}`;
		}
		isServerError() {
			return this.statusCode >= 500 && this.statusCode <= 599;
		}
	};
	exports.HttpError = HttpError;
	function parseJson(result) {
		return result.then((it) => it == null || it.length === 0 ? null : JSON.parse(it));
	}
	exports.HttpExecutor = class HttpExecutor {
		constructor() {
			this.maxRedirects = 10;
		}
		request(options, cancellationToken = new CancellationToken_1.CancellationToken(), data) {
			configureRequestOptions(options);
			const json = data == null ? void 0 : JSON.stringify(data);
			const encodedData = json ? Buffer.from(json) : void 0;
			if (encodedData != null) {
				debug(json);
				const { headers, ...opts } = options;
				options = {
					method: "post",
					headers: {
						"Content-Type": "application/json",
						"Content-Length": encodedData.length,
						...headers
					},
					...opts
				};
			}
			return this.doApiRequest(options, cancellationToken, (it) => it.end(encodedData));
		}
		doApiRequest(options, cancellationToken, requestProcessor, redirectCount = 0) {
			if (debug.enabled) debug(`Request: ${safeStringifyJson(options)}`);
			return cancellationToken.createPromise((resolve, reject, onCancel) => {
				const request = this.createRequest(options, (response) => {
					try {
						this.handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor);
					} catch (e) {
						reject(e);
					}
				});
				this.addErrorAndTimeoutHandlers(request, reject, options.timeout);
				this.addRedirectHandlers(request, options, reject, redirectCount, (options) => {
					this.doApiRequest(options, cancellationToken, requestProcessor, redirectCount).then(resolve).catch(reject);
				});
				requestProcessor(request, reject);
				onCancel(() => request.abort());
			});
		}
		addRedirectHandlers(request, options, reject, redirectCount, handler) {}
		addErrorAndTimeoutHandlers(request, reject, timeout = 6e4) {
			this.addTimeOutHandler(request, reject, timeout);
			request.on("error", reject);
			request.on("aborted", () => {
				reject(/* @__PURE__ */ new Error("Request has been aborted by the server"));
			});
		}
		handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor) {
			var _a;
			if (debug.enabled) debug(`Response: ${response.statusCode} ${response.statusMessage}, request options: ${safeStringifyJson(options)}`);
			if (response.statusCode === 404) {
				reject(createHttpError(response, `method: ${options.method || "GET"} url: ${options.protocol || "https:"}//${options.hostname}${options.port ? `:${options.port}` : ""}${options.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
				return;
			} else if (response.statusCode === 204) {
				resolve();
				return;
			}
			const code = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 0;
			const shouldRedirect = code >= 300 && code < 400;
			const redirectUrl = safeGetHeader(response, "location");
			if (shouldRedirect && redirectUrl != null) {
				if (redirectCount > this.maxRedirects) {
					reject(this.createMaxRedirectError());
					return;
				}
				this.doApiRequest(HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options), cancellationToken, requestProcessor, redirectCount).then(resolve).catch(reject);
				return;
			}
			response.setEncoding("utf8");
			let data = "";
			response.on("error", reject);
			response.on("data", (chunk) => data += chunk);
			response.on("end", () => {
				try {
					if (response.statusCode != null && response.statusCode >= 400) {
						const contentType = safeGetHeader(response, "content-type");
						const isJson = contentType != null && (Array.isArray(contentType) ? contentType.find((it) => it.includes("json")) != null : contentType.includes("json"));
						reject(createHttpError(response, `method: ${options.method || "GET"} url: ${options.protocol || "https:"}//${options.hostname}${options.port ? `:${options.port}` : ""}${options.path}

          Data:
          ${isJson ? JSON.stringify(JSON.parse(data)) : data}
          `));
					} else resolve(data.length === 0 ? null : data);
				} catch (e) {
					reject(e);
				}
			});
		}
		async downloadToBuffer(url$17, options) {
			return await options.cancellationToken.createPromise((resolve, reject, onCancel) => {
				const responseChunks = [];
				const requestOptions = {
					headers: options.headers || void 0,
					redirect: "manual"
				};
				configureRequestUrl(url$17, requestOptions);
				configureRequestOptions(requestOptions);
				this.doDownload(requestOptions, {
					destination: null,
					options,
					onCancel,
					callback: (error) => {
						if (error == null) resolve(Buffer.concat(responseChunks));
						else reject(error);
					},
					responseHandler: (response, callback) => {
						let receivedLength = 0;
						response.on("data", (chunk) => {
							receivedLength += chunk.length;
							if (receivedLength > 524288e3) {
								callback(/* @__PURE__ */ new Error("Maximum allowed size is 500 MB"));
								return;
							}
							responseChunks.push(chunk);
						});
						response.on("end", () => {
							callback(null);
						});
					}
				}, 0);
			});
		}
		doDownload(requestOptions, options, redirectCount) {
			const request = this.createRequest(requestOptions, (response) => {
				if (response.statusCode >= 400) {
					options.callback(/* @__PURE__ */ new Error(`Cannot download "${requestOptions.protocol || "https:"}//${requestOptions.hostname}${requestOptions.path}", status ${response.statusCode}: ${response.statusMessage}`));
					return;
				}
				response.on("error", options.callback);
				const redirectUrl = safeGetHeader(response, "location");
				if (redirectUrl != null) {
					if (redirectCount < this.maxRedirects) this.doDownload(HttpExecutor.prepareRedirectUrlOptions(redirectUrl, requestOptions), options, redirectCount++);
					else options.callback(this.createMaxRedirectError());
					return;
				}
				if (options.responseHandler == null) configurePipes(options, response);
				else options.responseHandler(response, options.callback);
			});
			this.addErrorAndTimeoutHandlers(request, options.callback, requestOptions.timeout);
			this.addRedirectHandlers(request, requestOptions, options.callback, redirectCount, (requestOptions) => {
				this.doDownload(requestOptions, options, redirectCount++);
			});
			request.end();
		}
		createMaxRedirectError() {
			return /* @__PURE__ */ new Error(`Too many redirects (> ${this.maxRedirects})`);
		}
		addTimeOutHandler(request, callback, timeout) {
			request.on("socket", (socket) => {
				socket.setTimeout(timeout, () => {
					request.abort();
					callback(/* @__PURE__ */ new Error("Request timed out"));
				});
			});
		}
		static prepareRedirectUrlOptions(redirectUrl, options) {
			const newOptions = configureRequestOptionsFromUrl(redirectUrl, { ...options });
			const headers = newOptions.headers;
			if (headers === null || headers === void 0 ? void 0 : headers.authorization) {
				const originalUrl = HttpExecutor.reconstructOriginalUrl(options);
				const parsedRedirectUrl = parseUrl(redirectUrl, options);
				if (HttpExecutor.isCrossOriginRedirect(originalUrl, parsedRedirectUrl)) {
					if (debug.enabled) debug(`Given the cross-origin redirect (from ${originalUrl.host} to ${parsedRedirectUrl.host}), the Authorization header will be stripped out.`);
					delete headers.authorization;
				}
			}
			return newOptions;
		}
		static reconstructOriginalUrl(options) {
			const protocol = options.protocol || "https:";
			if (!options.hostname) throw new Error("Missing hostname in request options");
			const hostname = options.hostname;
			const port = options.port ? `:${options.port}` : "";
			const path = options.path || "/";
			return new url_1$7.URL(`${protocol}//${hostname}${port}${path}`);
		}
		static isCrossOriginRedirect(originalUrl, redirectUrl) {
			if (originalUrl.hostname.toLowerCase() !== redirectUrl.hostname.toLowerCase()) return true;
			if (originalUrl.protocol === "http:" && ["80", ""].includes(originalUrl.port) && redirectUrl.protocol === "https:" && ["443", ""].includes(redirectUrl.port)) return false;
			if (originalUrl.protocol !== redirectUrl.protocol) return true;
			return originalUrl.port !== redirectUrl.port;
		}
		static retryOnServerError(task, maxRetries = 3) {
			for (let attemptNumber = 0;; attemptNumber++) try {
				return task();
			} catch (e) {
				if (attemptNumber < maxRetries && (e instanceof HttpError && e.isServerError() || e.code === "EPIPE")) continue;
				throw e;
			}
		}
	};
	function parseUrl(url$18, options) {
		try {
			return new url_1$7.URL(url$18);
		} catch {
			const hostname = options.hostname;
			const baseUrl = `${options.protocol || "https:"}//${hostname}${options.port ? `:${options.port}` : ""}`;
			return new url_1$7.URL(url$18, baseUrl);
		}
	}
	function configureRequestOptionsFromUrl(url$19, options) {
		const result = configureRequestOptions(options);
		configureRequestUrl(parseUrl(url$19, options), result);
		return result;
	}
	function configureRequestUrl(url$20, options) {
		options.protocol = url$20.protocol;
		options.hostname = url$20.hostname;
		if (url$20.port) options.port = url$20.port;
		else if (options.port) delete options.port;
		options.path = url$20.pathname + url$20.search;
	}
	var DigestTransform = class extends stream_1$2.Transform {
		get actual() {
			return this._actual;
		}
		constructor(expected, algorithm = "sha512", encoding = "base64") {
			super();
			this.expected = expected;
			this.algorithm = algorithm;
			this.encoding = encoding;
			this._actual = null;
			this.isValidateOnEnd = true;
			this.digester = (0, crypto_1$4.createHash)(algorithm);
		}
		_transform(chunk, encoding, callback) {
			this.digester.update(chunk);
			callback(null, chunk);
		}
		_flush(callback) {
			this._actual = this.digester.digest(this.encoding);
			if (this.isValidateOnEnd) try {
				this.validate();
			} catch (e) {
				callback(e);
				return;
			}
			callback(null);
		}
		validate() {
			if (this._actual == null) throw (0, error_1.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
			if (this._actual !== this.expected) throw (0, error_1.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
			return null;
		}
	};
	exports.DigestTransform = DigestTransform;
	function checkSha2(sha2Header, sha2, callback) {
		if (sha2Header != null && sha2 != null && sha2Header !== sha2) {
			callback(/* @__PURE__ */ new Error(`checksum mismatch: expected ${sha2} but got ${sha2Header} (X-Checksum-Sha2 header)`));
			return false;
		}
		return true;
	}
	function safeGetHeader(response, headerKey) {
		const value = response.headers[headerKey];
		if (value == null) return null;
		else if (Array.isArray(value)) return value.length === 0 ? null : value[value.length - 1];
		else return value;
	}
	function configurePipes(options, response) {
		if (!checkSha2(safeGetHeader(response, "X-Checksum-Sha2"), options.options.sha2, options.callback)) return;
		const streams = [];
		if (options.options.onProgress != null) {
			const contentLength = safeGetHeader(response, "content-length");
			if (contentLength != null) streams.push(new ProgressCallbackTransform_1.ProgressCallbackTransform(parseInt(contentLength, 10), options.options.cancellationToken, options.options.onProgress));
		}
		const sha512 = options.options.sha512;
		if (sha512 != null) streams.push(new DigestTransform(sha512, "sha512", sha512.length === 128 && !sha512.includes("+") && !sha512.includes("Z") && !sha512.includes("=") ? "hex" : "base64"));
		else if (options.options.sha2 != null) streams.push(new DigestTransform(options.options.sha2, "sha256", "hex"));
		const fileOut = (0, fs_1$5.createWriteStream)(options.destination);
		streams.push(fileOut);
		let lastStream = response;
		for (const stream of streams) {
			stream.on("error", (error) => {
				fileOut.close();
				if (!options.options.cancellationToken.cancelled) options.callback(error);
			});
			lastStream = lastStream.pipe(stream);
		}
		fileOut.on("finish", () => {
			fileOut.close(options.callback);
		});
	}
	function configureRequestOptions(options, token, method) {
		if (method != null) options.method = method;
		options.headers = { ...options.headers };
		const headers = options.headers;
		if (token != null) headers.authorization = token.startsWith("Basic") || token.startsWith("Bearer") ? token : `token ${token}`;
		if (headers["User-Agent"] == null) headers["User-Agent"] = "electron-builder";
		if (method == null || method === "GET" || headers["Cache-Control"] == null) headers["Cache-Control"] = "no-cache";
		if (options.protocol == null && process.versions.electron != null) options.protocol = "https:";
		return options;
	}
	function safeStringifyJson(data, skippedNames) {
		return JSON.stringify(data, (name, value) => {
			if (name.endsWith("Authorization") || name.endsWith("authorization") || name.endsWith("Password") || name.endsWith("PASSWORD") || name.endsWith("Token") || name.includes("password") || name.includes("token") || skippedNames != null && skippedNames.has(name)) return "<stripped sensitive data>";
			return value;
		}, 2);
	}
}));
var require_MemoLazy = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MemoLazy = void 0;
	var MemoLazy = class {
		constructor(selector, creator) {
			this.selector = selector;
			this.creator = creator;
			this.selected = void 0;
			this._value = void 0;
		}
		get hasValue() {
			return this._value !== void 0;
		}
		get value() {
			const selected = this.selector();
			if (this._value !== void 0 && equals(this.selected, selected)) return this._value;
			this.selected = selected;
			const result = this.creator(selected);
			this.value = result;
			return result;
		}
		set value(value) {
			this._value = value;
		}
	};
	exports.MemoLazy = MemoLazy;
	function equals(firstValue, secondValue) {
		if (typeof firstValue === "object" && firstValue !== null && typeof secondValue === "object" && secondValue !== null) {
			const keys1 = Object.keys(firstValue);
			const keys2 = Object.keys(secondValue);
			return keys1.length === keys2.length && keys1.every((key) => equals(firstValue[key], secondValue[key]));
		}
		return firstValue === secondValue;
	}
}));
var require_publishOptions = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.githubUrl = githubUrl;
	exports.githubTagPrefix = githubTagPrefix;
	exports.getS3LikeProviderBaseUrl = getS3LikeProviderBaseUrl;
	/** @private */
	function githubUrl(options, defaultHost = "github.com") {
		return `${options.protocol || "https"}://${options.host || defaultHost}`;
	}
	function githubTagPrefix(options) {
		var _a;
		if (options.tagNamePrefix) return options.tagNamePrefix;
		if ((_a = options.vPrefixedTagName) !== null && _a !== void 0 ? _a : true) return "v";
		return "";
	}
	function getS3LikeProviderBaseUrl(configuration) {
		const provider = configuration.provider;
		if (provider === "s3") return s3Url(configuration);
		if (provider === "spaces") return spacesUrl(configuration);
		throw new Error(`Not supported provider: ${provider}`);
	}
	function s3Url(options) {
		let url;
		if (options.accelerate == true) url = `https://${options.bucket}.s3-accelerate.amazonaws.com`;
		else if (options.endpoint != null) url = `${options.endpoint}/${options.bucket}`;
		else if (options.bucket.includes(".")) {
			if (options.region == null) throw new Error(`Bucket name "${options.bucket}" includes a dot, but S3 region is missing`);
			if (options.region === "us-east-1") url = `https://s3.amazonaws.com/${options.bucket}`;
			else url = `https://s3-${options.region}.amazonaws.com/${options.bucket}`;
		} else if (options.region === "cn-north-1") url = `https://${options.bucket}.s3.${options.region}.amazonaws.com.cn`;
		else url = `https://${options.bucket}.s3.amazonaws.com`;
		return appendPath(url, options.path);
	}
	function appendPath(url, p) {
		if (p != null && p.length > 0) {
			if (!p.startsWith("/")) url += "/";
			url += p;
		}
		return url;
	}
	function spacesUrl(options) {
		if (options.name == null) throw new Error(`name is missing`);
		if (options.region == null) throw new Error(`region is missing`);
		return appendPath(`https://${options.name}.${options.region}.digitaloceanspaces.com`, options.path);
	}
}));
var require_retry = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.retry = retry;
	var CancellationToken_1 = require_CancellationToken();
	async function retry(task, options) {
		var _a;
		const { retries: retryCount, interval, backoff = 0, attempt = 0, shouldRetry, cancellationToken = new CancellationToken_1.CancellationToken() } = options;
		try {
			return await task();
		} catch (error) {
			if (await Promise.resolve((_a = shouldRetry === null || shouldRetry === void 0 ? void 0 : shouldRetry(error)) !== null && _a !== void 0 ? _a : true) && retryCount > 0 && !cancellationToken.cancelled) {
				await new Promise((resolve) => setTimeout(resolve, interval + backoff * attempt));
				return await retry(task, {
					...options,
					retries: retryCount - 1,
					attempt: attempt + 1
				});
			} else throw error;
		}
	}
}));
var require_rfc2253Parser = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseDn = parseDn;
	function parseDn(seq) {
		let quoted = false;
		let key = null;
		let token = "";
		let nextNonSpace = 0;
		seq = seq.trim();
		const result = /* @__PURE__ */ new Map();
		for (let i = 0; i <= seq.length; i++) {
			if (i === seq.length) {
				if (key !== null) result.set(key, token);
				break;
			}
			const ch = seq[i];
			if (quoted) {
				if (ch === "\"") {
					quoted = false;
					continue;
				}
			} else {
				if (ch === "\"") {
					quoted = true;
					continue;
				}
				if (ch === "\\") {
					i++;
					const ord = parseInt(seq.slice(i, i + 2), 16);
					if (Number.isNaN(ord)) token += seq[i];
					else {
						i++;
						token += String.fromCharCode(ord);
					}
					continue;
				}
				if (key === null && ch === "=") {
					key = token;
					token = "";
					continue;
				}
				if (ch === "," || ch === ";" || ch === "+") {
					if (key !== null) result.set(key, token);
					key = null;
					token = "";
					continue;
				}
			}
			if (ch === " " && !quoted) {
				if (token.length === 0) continue;
				if (i > nextNonSpace) {
					let j = i;
					while (seq[j] === " ") j++;
					nextNonSpace = j;
				}
				if (nextNonSpace >= seq.length || seq[nextNonSpace] === "," || seq[nextNonSpace] === ";" || key === null && seq[nextNonSpace] === "=" || key !== null && seq[nextNonSpace] === "+") {
					i = nextNonSpace - 1;
					continue;
				}
			}
			token += ch;
		}
		return result;
	}
}));
var require_uuid = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.nil = exports.UUID = void 0;
	var crypto_1$3 = require("crypto");
	var error_1 = require_error();
	var invalidName = "options.name must be either a string or a Buffer";
	var randomHost = (0, crypto_1$3.randomBytes)(16);
	randomHost[0] = randomHost[0] | 1;
	var hex2byte = {};
	var byte2hex = [];
	for (let i = 0; i < 256; i++) {
		const hex = (i + 256).toString(16).substr(1);
		hex2byte[hex] = i;
		byte2hex[i] = hex;
	}
	var UUID = class UUID {
		constructor(uuid) {
			this.ascii = null;
			this.binary = null;
			const check = UUID.check(uuid);
			if (!check) throw new Error("not a UUID");
			this.version = check.version;
			if (check.format === "ascii") this.ascii = uuid;
			else this.binary = uuid;
		}
		static v5(name, namespace) {
			return uuidNamed(name, "sha1", 80, namespace);
		}
		toString() {
			if (this.ascii == null) this.ascii = stringify(this.binary);
			return this.ascii;
		}
		inspect() {
			return `UUID v${this.version} ${this.toString()}`;
		}
		static check(uuid, offset = 0) {
			if (typeof uuid === "string") {
				uuid = uuid.toLowerCase();
				if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(uuid)) return false;
				if (uuid === "00000000-0000-0000-0000-000000000000") return {
					version: void 0,
					variant: "nil",
					format: "ascii"
				};
				return {
					version: (hex2byte[uuid[14] + uuid[15]] & 240) >> 4,
					variant: getVariant((hex2byte[uuid[19] + uuid[20]] & 224) >> 5),
					format: "ascii"
				};
			}
			if (Buffer.isBuffer(uuid)) {
				if (uuid.length < offset + 16) return false;
				let i = 0;
				for (; i < 16; i++) if (uuid[offset + i] !== 0) break;
				if (i === 16) return {
					version: void 0,
					variant: "nil",
					format: "binary"
				};
				return {
					version: (uuid[offset + 6] & 240) >> 4,
					variant: getVariant((uuid[offset + 8] & 224) >> 5),
					format: "binary"
				};
			}
			throw (0, error_1.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
		}
		static parse(input) {
			const buffer = Buffer.allocUnsafe(16);
			let j = 0;
			for (let i = 0; i < 16; i++) {
				buffer[i] = hex2byte[input[j++] + input[j++]];
				if (i === 3 || i === 5 || i === 7 || i === 9) j += 1;
			}
			return buffer;
		}
	};
	exports.UUID = UUID;
	UUID.OID = UUID.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
	function getVariant(bits) {
		switch (bits) {
			case 0:
			case 1:
			case 3: return "ncs";
			case 4:
			case 5: return "rfc4122";
			case 6: return "microsoft";
			default: return "future";
		}
	}
	var UuidEncoding;
	(function(UuidEncoding) {
		UuidEncoding[UuidEncoding["ASCII"] = 0] = "ASCII";
		UuidEncoding[UuidEncoding["BINARY"] = 1] = "BINARY";
		UuidEncoding[UuidEncoding["OBJECT"] = 2] = "OBJECT";
	})(UuidEncoding || (UuidEncoding = {}));
	function uuidNamed(name, hashMethod, version, namespace, encoding = UuidEncoding.ASCII) {
		const hash = (0, crypto_1$3.createHash)(hashMethod);
		if (typeof name !== "string" && !Buffer.isBuffer(name)) throw (0, error_1.newError)(invalidName, "ERR_INVALID_UUID_NAME");
		hash.update(namespace);
		hash.update(name);
		const buffer = hash.digest();
		let result;
		switch (encoding) {
			case UuidEncoding.BINARY:
				buffer[6] = buffer[6] & 15 | version;
				buffer[8] = buffer[8] & 63 | 128;
				result = buffer;
				break;
			case UuidEncoding.OBJECT:
				buffer[6] = buffer[6] & 15 | version;
				buffer[8] = buffer[8] & 63 | 128;
				result = new UUID(buffer);
				break;
			default: result = byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6] & 15 | version] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8] & 63 | 128] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
		}
		return result;
	}
	function stringify(buffer) {
		return byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6]] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8]] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
	}
	exports.nil = new UUID("00000000-0000-0000-0000-000000000000");
}));
var require_xml = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.XElement = void 0;
	exports.parseXml = parseXml;
	var sax = require_sax();
	var error_1 = require_error();
	var XElement = class {
		constructor(name) {
			this.name = name;
			this.value = "";
			this.attributes = null;
			this.isCData = false;
			this.elements = null;
			if (!name) throw (0, error_1.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
			if (!isValidName(name)) throw (0, error_1.newError)(`Invalid element name: ${name}`, "ERR_XML_ELEMENT_INVALID_NAME");
		}
		attribute(name) {
			const result = this.attributes === null ? null : this.attributes[name];
			if (result == null) throw (0, error_1.newError)(`No attribute "${name}"`, "ERR_XML_MISSED_ATTRIBUTE");
			return result;
		}
		removeAttribute(name) {
			if (this.attributes !== null) delete this.attributes[name];
		}
		element(name, ignoreCase = false, errorIfMissed = null) {
			const result = this.elementOrNull(name, ignoreCase);
			if (result === null) throw (0, error_1.newError)(errorIfMissed || `No element "${name}"`, "ERR_XML_MISSED_ELEMENT");
			return result;
		}
		elementOrNull(name, ignoreCase = false) {
			if (this.elements === null) return null;
			for (const element of this.elements) if (isNameEquals(element, name, ignoreCase)) return element;
			return null;
		}
		getElements(name, ignoreCase = false) {
			if (this.elements === null) return [];
			return this.elements.filter((it) => isNameEquals(it, name, ignoreCase));
		}
		elementValueOrEmpty(name, ignoreCase = false) {
			const element = this.elementOrNull(name, ignoreCase);
			return element === null ? "" : element.value;
		}
	};
	exports.XElement = XElement;
	var NAME_REG_EXP = /* @__PURE__ */ new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
	function isValidName(name) {
		return NAME_REG_EXP.test(name);
	}
	function isNameEquals(element, name, ignoreCase) {
		const elementName = element.name;
		return elementName === name || ignoreCase === true && elementName.length === name.length && elementName.toLowerCase() === name.toLowerCase();
	}
	function parseXml(data) {
		let rootElement = null;
		const parser = sax.parser(true, {});
		const elements = [];
		parser.onopentag = (saxElement) => {
			const element = new XElement(saxElement.name);
			element.attributes = saxElement.attributes;
			if (rootElement === null) rootElement = element;
			else {
				const parent = elements[elements.length - 1];
				if (parent.elements == null) parent.elements = [];
				parent.elements.push(element);
			}
			elements.push(element);
		};
		parser.onclosetag = () => {
			elements.pop();
		};
		parser.ontext = (text) => {
			if (elements.length > 0) elements[elements.length - 1].value = text;
		};
		parser.oncdata = (cdata) => {
			const element = elements[elements.length - 1];
			element.value = cdata;
			element.isCData = true;
		};
		parser.onerror = (err) => {
			throw err;
		};
		parser.write(data);
		return rootElement;
	}
}));
var require_out = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CURRENT_APP_PACKAGE_FILE_NAME = exports.CURRENT_APP_INSTALLER_FILE_NAME = exports.XElement = exports.parseXml = exports.UUID = exports.parseDn = exports.retry = exports.githubTagPrefix = exports.githubUrl = exports.getS3LikeProviderBaseUrl = exports.ProgressCallbackTransform = exports.MemoLazy = exports.safeStringifyJson = exports.safeGetHeader = exports.parseJson = exports.HttpExecutor = exports.HttpError = exports.DigestTransform = exports.createHttpError = exports.configureRequestUrl = exports.configureRequestOptionsFromUrl = exports.configureRequestOptions = exports.newError = exports.CancellationToken = exports.CancellationError = void 0;
	exports.asArray = asArray;
	var CancellationToken_1 = require_CancellationToken();
	Object.defineProperty(exports, "CancellationError", {
		enumerable: true,
		get: function() {
			return CancellationToken_1.CancellationError;
		}
	});
	Object.defineProperty(exports, "CancellationToken", {
		enumerable: true,
		get: function() {
			return CancellationToken_1.CancellationToken;
		}
	});
	var error_1 = require_error();
	Object.defineProperty(exports, "newError", {
		enumerable: true,
		get: function() {
			return error_1.newError;
		}
	});
	var httpExecutor_1 = require_httpExecutor();
	Object.defineProperty(exports, "configureRequestOptions", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.configureRequestOptions;
		}
	});
	Object.defineProperty(exports, "configureRequestOptionsFromUrl", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.configureRequestOptionsFromUrl;
		}
	});
	Object.defineProperty(exports, "configureRequestUrl", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.configureRequestUrl;
		}
	});
	Object.defineProperty(exports, "createHttpError", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.createHttpError;
		}
	});
	Object.defineProperty(exports, "DigestTransform", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.DigestTransform;
		}
	});
	Object.defineProperty(exports, "HttpError", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.HttpError;
		}
	});
	Object.defineProperty(exports, "HttpExecutor", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.HttpExecutor;
		}
	});
	Object.defineProperty(exports, "parseJson", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.parseJson;
		}
	});
	Object.defineProperty(exports, "safeGetHeader", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.safeGetHeader;
		}
	});
	Object.defineProperty(exports, "safeStringifyJson", {
		enumerable: true,
		get: function() {
			return httpExecutor_1.safeStringifyJson;
		}
	});
	var MemoLazy_1 = require_MemoLazy();
	Object.defineProperty(exports, "MemoLazy", {
		enumerable: true,
		get: function() {
			return MemoLazy_1.MemoLazy;
		}
	});
	var ProgressCallbackTransform_1 = require_ProgressCallbackTransform();
	Object.defineProperty(exports, "ProgressCallbackTransform", {
		enumerable: true,
		get: function() {
			return ProgressCallbackTransform_1.ProgressCallbackTransform;
		}
	});
	var publishOptions_1 = require_publishOptions();
	Object.defineProperty(exports, "getS3LikeProviderBaseUrl", {
		enumerable: true,
		get: function() {
			return publishOptions_1.getS3LikeProviderBaseUrl;
		}
	});
	Object.defineProperty(exports, "githubUrl", {
		enumerable: true,
		get: function() {
			return publishOptions_1.githubUrl;
		}
	});
	Object.defineProperty(exports, "githubTagPrefix", {
		enumerable: true,
		get: function() {
			return publishOptions_1.githubTagPrefix;
		}
	});
	var retry_1 = require_retry();
	Object.defineProperty(exports, "retry", {
		enumerable: true,
		get: function() {
			return retry_1.retry;
		}
	});
	var rfc2253Parser_1 = require_rfc2253Parser();
	Object.defineProperty(exports, "parseDn", {
		enumerable: true,
		get: function() {
			return rfc2253Parser_1.parseDn;
		}
	});
	var uuid_1 = require_uuid();
	Object.defineProperty(exports, "UUID", {
		enumerable: true,
		get: function() {
			return uuid_1.UUID;
		}
	});
	var xml_1 = require_xml();
	Object.defineProperty(exports, "parseXml", {
		enumerable: true,
		get: function() {
			return xml_1.parseXml;
		}
	});
	Object.defineProperty(exports, "XElement", {
		enumerable: true,
		get: function() {
			return xml_1.XElement;
		}
	});
	exports.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe";
	exports.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
	function asArray(v) {
		if (v == null) return [];
		else if (Array.isArray(v)) return v;
		else return [v];
	}
}));

export { require_out };
