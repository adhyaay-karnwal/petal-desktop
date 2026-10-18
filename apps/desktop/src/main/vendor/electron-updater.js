// Reconstructed from index.js — original module: vendor/electron-updater
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";
import { require_lib$9 } from "./fs-extra.js";
import { require_out } from "./builder-util-runtime.js";
import { require_js_yaml } from "./js-yaml.js";
import { require_main$1 } from "./lazy-val.js";
import { require_semver } from "./semver.js";
import { require_lodash_isequal } from "./lodash.isequal.js";
import { require_lodash_escaperegexp } from "./lodash.escaperegexp.js";

var require_DownloadedUpdateHelper = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DownloadedUpdateHelper = void 0;
	exports.createTempUpdateFile = createTempUpdateFile;
	var crypto_1$2 = require("crypto");
	var fs_1$4 = require("fs");
	var isEqual = require_lodash_isequal();
	var fs_extra_1 = require_lib$9();
	var path$19 = require("path");
	/** @private **/
	var DownloadedUpdateHelper = class {
		constructor(cacheDir) {
			this.cacheDir = cacheDir;
			this._file = null;
			this._packageFile = null;
			this.versionInfo = null;
			this.fileInfo = null;
			this._downloadedFileInfo = null;
		}
		get downloadedFileInfo() {
			return this._downloadedFileInfo;
		}
		get file() {
			return this._file;
		}
		get packageFile() {
			return this._packageFile;
		}
		get cacheDirForPendingUpdate() {
			return path$19.join(this.cacheDir, "pending");
		}
		async validateDownloadedPath(updateFile, updateInfo, fileInfo, logger) {
			if (this.versionInfo != null && this.file === updateFile && this.fileInfo != null) {
				if (isEqual(this.versionInfo, updateInfo) && isEqual(this.fileInfo.info, fileInfo.info) && await (0, fs_extra_1.pathExists)(updateFile)) return updateFile;
				else return null;
			}
			const cachedUpdateFile = await this.getValidCachedUpdateFile(fileInfo, logger);
			if (cachedUpdateFile === null) return null;
			logger.info(`Update has already been downloaded to ${updateFile}).`);
			this._file = cachedUpdateFile;
			return cachedUpdateFile;
		}
		async setDownloadedFile(downloadedFile, packageFile, versionInfo, fileInfo, updateFileName, isSaveCache) {
			this._file = downloadedFile;
			this._packageFile = packageFile;
			this.versionInfo = versionInfo;
			this.fileInfo = fileInfo;
			this._downloadedFileInfo = {
				fileName: updateFileName,
				sha512: fileInfo.info.sha512,
				isAdminRightsRequired: fileInfo.info.isAdminRightsRequired === true
			};
			if (isSaveCache) await (0, fs_extra_1.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
		}
		async clear() {
			this._file = null;
			this._packageFile = null;
			this.versionInfo = null;
			this.fileInfo = null;
			await this.cleanCacheDirForPendingUpdate();
		}
		async cleanCacheDirForPendingUpdate() {
			try {
				await (0, fs_extra_1.emptyDir)(this.cacheDirForPendingUpdate);
			} catch (_ignore) {}
		}
		/**
		* Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
		* @param fileInfo
		* @param logger
		*/
		async getValidCachedUpdateFile(fileInfo, logger) {
			const updateInfoFilePath = this.getUpdateInfoFile();
			if (!await (0, fs_extra_1.pathExists)(updateInfoFilePath)) return null;
			let cachedInfo;
			try {
				cachedInfo = await (0, fs_extra_1.readJson)(updateInfoFilePath);
			} catch (error) {
				let message = `No cached update info available`;
				if (error.code !== "ENOENT") {
					await this.cleanCacheDirForPendingUpdate();
					message += ` (error on read: ${error.message})`;
				}
				logger.info(message);
				return null;
			}
			if (!((cachedInfo === null || cachedInfo === void 0 ? void 0 : cachedInfo.fileName) !== null)) {
				logger.warn(`Cached update info is corrupted: no fileName, directory for cached update will be cleaned`);
				await this.cleanCacheDirForPendingUpdate();
				return null;
			}
			if (fileInfo.info.sha512 !== cachedInfo.sha512) {
				logger.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${cachedInfo.sha512}, expected: ${fileInfo.info.sha512}. Directory for cached update will be cleaned`);
				await this.cleanCacheDirForPendingUpdate();
				return null;
			}
			const updateFile = path$19.join(this.cacheDirForPendingUpdate, cachedInfo.fileName);
			if (!await (0, fs_extra_1.pathExists)(updateFile)) {
				logger.info("Cached update file doesn't exist");
				return null;
			}
			const sha512 = await hashFile(updateFile);
			if (fileInfo.info.sha512 !== sha512) {
				logger.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${sha512}, expected: ${fileInfo.info.sha512}`);
				await this.cleanCacheDirForPendingUpdate();
				return null;
			}
			this._downloadedFileInfo = cachedInfo;
			return updateFile;
		}
		getUpdateInfoFile() {
			return path$19.join(this.cacheDirForPendingUpdate, "update-info.json");
		}
	};
	exports.DownloadedUpdateHelper = DownloadedUpdateHelper;
	function hashFile(file, algorithm = "sha512", encoding = "base64", options) {
		return new Promise((resolve, reject) => {
			const hash = (0, crypto_1$2.createHash)(algorithm);
			hash.on("error", reject).setEncoding(encoding);
			(0, fs_1$4.createReadStream)(file, {
				...options,
				highWaterMark: 1048576
			}).on("error", reject).on("end", () => {
				hash.end();
				resolve(hash.read());
			}).pipe(hash, { end: false });
		});
	}
	async function createTempUpdateFile(name, cacheDir, log) {
		let nameCounter = 0;
		let result = path$19.join(cacheDir, name);
		for (let i = 0; i < 3; i++) try {
			await (0, fs_extra_1.unlink)(result);
			return result;
		} catch (e) {
			if (e.code === "ENOENT") return result;
			log.warn(`Error on remove temp update file: ${e}`);
			result = path$19.join(cacheDir, `${nameCounter++}-${name}`);
		}
		return result;
	}
}));
var require_AppAdapter = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getAppCacheDir = getAppCacheDir;
	var path$18 = require("path");
	var os_1$1 = require("os");
	function getAppCacheDir() {
		const homedir = (0, os_1$1.homedir)();
		let result;
		if (process.platform === "win32") result = process.env["LOCALAPPDATA"] || path$18.join(homedir, "AppData", "Local");
		else if (process.platform === "darwin") result = path$18.join(homedir, "Library", "Caches");
		else result = process.env["XDG_CACHE_HOME"] || path$18.join(homedir, ".cache");
		return result;
	}
}));
var require_ElectronAppAdapter = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ElectronAppAdapter = void 0;
	var path$17 = require("path");
	var AppAdapter_1 = require_AppAdapter();
	var ElectronAppAdapter = class {
		constructor(app = require("electron").app) {
			this.app = app;
		}
		whenReady() {
			return this.app.whenReady();
		}
		get version() {
			return this.app.getVersion();
		}
		get name() {
			return this.app.getName();
		}
		get isPackaged() {
			return this.app.isPackaged === true;
		}
		get appUpdateConfigPath() {
			return this.isPackaged ? path$17.join(process.resourcesPath, "app-update.yml") : path$17.join(this.app.getAppPath(), "dev-app-update.yml");
		}
		get userDataPath() {
			return this.app.getPath("userData");
		}
		get baseCachePath() {
			return (0, AppAdapter_1.getAppCacheDir)();
		}
		quit() {
			this.app.quit();
		}
		relaunch() {
			this.app.relaunch();
		}
		onQuit(handler) {
			this.app.once("quit", (_, exitCode) => handler(exitCode));
		}
	};
	exports.ElectronAppAdapter = ElectronAppAdapter;
}));
var require_electronHttpExecutor = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ElectronHttpExecutor = exports.NET_SESSION_NAME = void 0;
	exports.getNetSession = getNetSession;
	var builder_util_runtime_1 = require_out();
	exports.NET_SESSION_NAME = "electron-updater";
	function getNetSession() {
		return require("electron").session.fromPartition(exports.NET_SESSION_NAME, { cache: false });
	}
	var ElectronHttpExecutor = class extends builder_util_runtime_1.HttpExecutor {
		constructor(proxyLoginCallback) {
			super();
			this.proxyLoginCallback = proxyLoginCallback;
			this.cachedSession = null;
		}
		async download(url, destination, options) {
			return await options.cancellationToken.createPromise((resolve, reject, onCancel) => {
				const requestOptions = {
					headers: options.headers || void 0,
					redirect: "manual"
				};
				(0, builder_util_runtime_1.configureRequestUrl)(url, requestOptions);
				(0, builder_util_runtime_1.configureRequestOptions)(requestOptions);
				this.doDownload(requestOptions, {
					destination,
					options,
					onCancel,
					callback: (error) => {
						if (error == null) resolve(destination);
						else reject(error);
					},
					responseHandler: null
				}, 0);
			});
		}
		createRequest(options, callback) {
			if (options.headers && options.headers.Host) {
				options.host = options.headers.Host;
				delete options.headers.Host;
			}
			if (this.cachedSession == null) this.cachedSession = getNetSession();
			const request = require("electron").net.request({
				...options,
				session: this.cachedSession
			});
			request.on("response", callback);
			if (this.proxyLoginCallback != null) request.on("login", this.proxyLoginCallback);
			return request;
		}
		addRedirectHandlers(request, options, reject, redirectCount, handler) {
			request.on("redirect", (statusCode, method, redirectUrl) => {
				request.abort();
				if (redirectCount > this.maxRedirects) reject(this.createMaxRedirectError());
				else handler(builder_util_runtime_1.HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options));
			});
		}
	};
	exports.ElectronHttpExecutor = ElectronHttpExecutor;
}));
var require_util$2 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.newBaseUrl = newBaseUrl;
	exports.newUrlFromBase = newUrlFromBase;
	exports.getChannelFilename = getChannelFilename;
	var url_1$6 = require("url");
	/** @internal */
	function newBaseUrl(url$16) {
		const result = new url_1$6.URL(url$16);
		if (!result.pathname.endsWith("/")) result.pathname += "/";
		return result;
	}
	function newUrlFromBase(pathname, baseUrl, addRandomQueryToAvoidCaching = false) {
		const result = new url_1$6.URL(pathname, baseUrl);
		const search = baseUrl.search;
		if (search != null && search.length !== 0) result.search = search;
		else if (addRandomQueryToAvoidCaching) result.search = `noCache=${Date.now().toString(32)}`;
		return result;
	}
	function getChannelFilename(channel) {
		return `${channel}.yml`;
	}
}));
var require_Provider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Provider = void 0;
	exports.findFile = findFile;
	exports.parseUpdateInfo = parseUpdateInfo;
	exports.getFileList = getFileList;
	exports.resolveFiles = resolveFiles;
	var builder_util_runtime_1 = require_out();
	var js_yaml_1 = require_js_yaml();
	var url_1$5 = require("url");
	var util_1 = require_util$2();
	var escapeRegExp = require_lodash_escaperegexp();
	var Provider = class {
		constructor(runtimeOptions) {
			this.runtimeOptions = runtimeOptions;
			this.requestHeaders = null;
			this.executor = runtimeOptions.executor;
		}
		getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl = null) {
			const newBlockMapUrl = (0, util_1.newUrlFromBase)(`${baseUrl.pathname}.blockmap`, baseUrl);
			return [(0, util_1.newUrlFromBase)(`${baseUrl.pathname.replace(new RegExp(escapeRegExp(newVersion), "g"), oldVersion)}.blockmap`, oldBlockMapFileBaseUrl ? new url_1$5.URL(oldBlockMapFileBaseUrl) : baseUrl), newBlockMapUrl];
		}
		get isUseMultipleRangeRequest() {
			return this.runtimeOptions.isUseMultipleRangeRequest !== false;
		}
		getChannelFilePrefix() {
			if (this.runtimeOptions.platform === "linux") {
				const arch = process.env["TEST_UPDATER_ARCH"] || process.arch;
				return "-linux" + (arch === "x64" ? "" : `-${arch}`);
			} else return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
		}
		getDefaultChannelName() {
			return this.getCustomChannelName("latest");
		}
		getCustomChannelName(channel) {
			return `${channel}${this.getChannelFilePrefix()}`;
		}
		get fileExtraDownloadHeaders() {
			return null;
		}
		setRequestHeaders(value) {
			this.requestHeaders = value;
		}
		/**
		* Method to perform API request only to resolve update info, but not to download update.
		*/
		httpRequest(url$14, headers, cancellationToken) {
			return this.executor.request(this.createRequestOptions(url$14, headers), cancellationToken);
		}
		createRequestOptions(url$15, headers) {
			const result = {};
			if (this.requestHeaders == null) {
				if (headers != null) result.headers = headers;
			} else result.headers = headers == null ? this.requestHeaders : {
				...this.requestHeaders,
				...headers
			};
			(0, builder_util_runtime_1.configureRequestUrl)(url$15, result);
			return result;
		}
	};
	exports.Provider = Provider;
	function findFile(files, extension, not) {
		var _a;
		if (files.length === 0) throw (0, builder_util_runtime_1.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
		const filteredFiles = files.filter((it) => it.url.pathname.toLowerCase().endsWith(`.${extension.toLowerCase()}`));
		const result = (_a = filteredFiles.find((it) => [it.url.pathname, it.info.url].some((n) => n.includes(process.arch)))) !== null && _a !== void 0 ? _a : filteredFiles.shift();
		if (result) return result;
		else if (not == null) return files[0];
		else return files.find((fileInfo) => !not.some((ext) => fileInfo.url.pathname.toLowerCase().endsWith(`.${ext.toLowerCase()}`)));
	}
	function parseUpdateInfo(rawData, channelFile, channelFileUrl) {
		if (rawData == null) throw (0, builder_util_runtime_1.newError)(`Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
		let result;
		try {
			result = (0, js_yaml_1.load)(rawData);
		} catch (e) {
			throw (0, builder_util_runtime_1.newError)(`Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}, rawData: ${rawData}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
		}
		return result;
	}
	function getFileList(updateInfo) {
		const files = updateInfo.files;
		if (files != null && files.length > 0) return files;
		if (updateInfo.path != null) return [{
			url: updateInfo.path,
			sha2: updateInfo.sha2,
			sha512: updateInfo.sha512
		}];
		else throw (0, builder_util_runtime_1.newError)(`No files provided: ${(0, builder_util_runtime_1.safeStringifyJson)(updateInfo)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
	}
	function resolveFiles(updateInfo, baseUrl, pathTransformer = (p) => p) {
		const result = getFileList(updateInfo).map((fileInfo) => {
			if (fileInfo.sha2 == null && fileInfo.sha512 == null) throw (0, builder_util_runtime_1.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, builder_util_runtime_1.safeStringifyJson)(fileInfo)}`, "ERR_UPDATER_NO_CHECKSUM");
			return {
				url: (0, util_1.newUrlFromBase)(pathTransformer(fileInfo.url), baseUrl),
				info: fileInfo
			};
		});
		const packages = updateInfo.packages;
		const packageInfo = packages == null ? null : packages[process.arch] || packages.ia32;
		if (packageInfo != null) result[0].packageInfo = {
			...packageInfo,
			path: (0, util_1.newUrlFromBase)(pathTransformer(packageInfo.path), baseUrl).href
		};
		return result;
	}
}));
var require_GenericProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GenericProvider = void 0;
	var builder_util_runtime_1 = require_out();
	var util_1 = require_util$2();
	var Provider_1 = require_Provider();
	var GenericProvider = class extends Provider_1.Provider {
		constructor(configuration, updater, runtimeOptions) {
			super(runtimeOptions);
			this.configuration = configuration;
			this.updater = updater;
			this.baseUrl = (0, util_1.newBaseUrl)(this.configuration.url);
		}
		get channel() {
			const result = this.updater.channel || this.configuration.channel;
			return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
		}
		async getLatestVersion() {
			const channelFile = (0, util_1.getChannelFilename)(this.channel);
			const channelUrl = (0, util_1.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
			for (let attemptNumber = 0;; attemptNumber++) try {
				return (0, Provider_1.parseUpdateInfo)(await this.httpRequest(channelUrl), channelFile, channelUrl);
			} catch (e) {
				if (e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) throw (0, builder_util_runtime_1.newError)(`Cannot find channel "${channelFile}" update info: ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
				else if (e.code === "ECONNREFUSED") {
					if (attemptNumber < 3) {
						await new Promise((resolve, reject) => {
							try {
								setTimeout(resolve, 1e3 * attemptNumber);
							} catch (e) {
								reject(e);
							}
						});
						continue;
					}
				}
				throw e;
			}
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.resolveFiles)(updateInfo, this.baseUrl);
		}
	};
	exports.GenericProvider = GenericProvider;
}));
var require_BitbucketProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BitbucketProvider = void 0;
	var builder_util_runtime_1 = require_out();
	var util_1 = require_util$2();
	var Provider_1 = require_Provider();
	var BitbucketProvider = class extends Provider_1.Provider {
		constructor(configuration, updater, runtimeOptions) {
			super({
				...runtimeOptions,
				isUseMultipleRangeRequest: false
			});
			this.configuration = configuration;
			this.updater = updater;
			const { owner, slug } = configuration;
			this.baseUrl = (0, util_1.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${owner}/${slug}/downloads`);
		}
		get channel() {
			return this.updater.channel || this.configuration.channel || "latest";
		}
		async getLatestVersion() {
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const channelFile = (0, util_1.getChannelFilename)(this.getCustomChannelName(this.channel));
			const channelUrl = (0, util_1.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
			try {
				const updateInfo = await this.httpRequest(channelUrl, void 0, cancellationToken);
				return (0, Provider_1.parseUpdateInfo)(updateInfo, channelFile, channelUrl);
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
			}
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.resolveFiles)(updateInfo, this.baseUrl);
		}
		toString() {
			const { owner, slug } = this.configuration;
			return `Bitbucket (owner: ${owner}, slug: ${slug}, channel: ${this.channel})`;
		}
	};
	exports.BitbucketProvider = BitbucketProvider;
}));
var require_GitHubProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GitHubProvider = exports.BaseGitHubProvider = void 0;
	exports.computeReleaseNotes = computeReleaseNotes;
	var builder_util_runtime_1 = require_out();
	var semver = require_semver();
	var url_1$4 = require("url");
	var util_1 = require_util$2();
	var Provider_1 = require_Provider();
	var hrefRegExp = /\/tag\/([^/]+)$/;
	var BaseGitHubProvider = class extends Provider_1.Provider {
		constructor(options, defaultHost, runtimeOptions) {
			super({
				...runtimeOptions,
				isUseMultipleRangeRequest: false
			});
			this.options = options;
			this.baseUrl = (0, util_1.newBaseUrl)((0, builder_util_runtime_1.githubUrl)(options, defaultHost));
			const apiHost = defaultHost === "github.com" ? "api.github.com" : defaultHost;
			this.baseApiUrl = (0, util_1.newBaseUrl)((0, builder_util_runtime_1.githubUrl)(options, apiHost));
		}
		computeGithubBasePath(result) {
			const host = this.options.host;
			return host && !["github.com", "api.github.com"].includes(host) ? `/api/v3${result}` : result;
		}
	};
	exports.BaseGitHubProvider = BaseGitHubProvider;
	var GitHubProvider = class extends BaseGitHubProvider {
		constructor(options, updater, runtimeOptions) {
			super(options, "github.com", runtimeOptions);
			this.options = options;
			this.updater = updater;
		}
		get channel() {
			const result = this.updater.channel || this.options.channel;
			return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
		}
		async getLatestVersion() {
			var _a, _b, _c, _d, _e;
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const feedXml = await this.httpRequest((0, util_1.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), { accept: "application/xml, application/atom+xml, text/xml, */*" }, cancellationToken);
			const feed = (0, builder_util_runtime_1.parseXml)(feedXml);
			let latestRelease = feed.element("entry", false, `No published versions on GitHub`);
			let tag = null;
			try {
				if (this.updater.allowPrerelease) {
					const currentChannel = ((_a = this.updater) === null || _a === void 0 ? void 0 : _a.channel) || ((_b = semver.prerelease(this.updater.currentVersion)) === null || _b === void 0 ? void 0 : _b[0]) || null;
					if (currentChannel === null) tag = hrefRegExp.exec(latestRelease.element("link").attribute("href"))[1];
					else for (const element of feed.getElements("entry")) {
						const hrefElement = hrefRegExp.exec(element.element("link").attribute("href"));
						if (hrefElement === null) continue;
						const hrefTag = hrefElement[1];
						const hrefChannel = ((_c = semver.prerelease(hrefTag)) === null || _c === void 0 ? void 0 : _c[0]) || null;
						const shouldFetchVersion = !currentChannel || ["alpha", "beta"].includes(currentChannel);
						const isCustomChannel = hrefChannel !== null && !["alpha", "beta"].includes(String(hrefChannel));
						if (shouldFetchVersion && !isCustomChannel && !(currentChannel === "beta" && hrefChannel === "alpha")) {
							tag = hrefTag;
							break;
						}
						if (hrefChannel && hrefChannel === currentChannel) {
							tag = hrefTag;
							break;
						}
					}
				} else {
					tag = await this.getLatestTagName(cancellationToken);
					for (const element of feed.getElements("entry")) if (hrefRegExp.exec(element.element("link").attribute("href"))[1] === tag) {
						latestRelease = element;
						break;
					}
				}
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Cannot parse releases feed: ${e.stack || e.message},\nXML:\n${feedXml}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
			}
			if (tag == null) throw (0, builder_util_runtime_1.newError)(`No published versions on GitHub`, "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
			let rawData;
			let channelFile = "";
			let channelFileUrl = "";
			const fetchData = async (channelName) => {
				channelFile = (0, util_1.getChannelFilename)(channelName);
				channelFileUrl = (0, util_1.newUrlFromBase)(this.getBaseDownloadPath(String(tag), channelFile), this.baseUrl);
				const requestOptions = this.createRequestOptions(channelFileUrl);
				try {
					return await this.executor.request(requestOptions, cancellationToken);
				} catch (e) {
					if (e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) throw (0, builder_util_runtime_1.newError)(`Cannot find ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
					throw e;
				}
			};
			try {
				let channel = this.channel;
				if (this.updater.allowPrerelease && ((_d = semver.prerelease(tag)) === null || _d === void 0 ? void 0 : _d[0])) channel = this.getCustomChannelName(String((_e = semver.prerelease(tag)) === null || _e === void 0 ? void 0 : _e[0]));
				rawData = await fetchData(channel);
			} catch (e) {
				if (this.updater.allowPrerelease) rawData = await fetchData(this.getDefaultChannelName());
				else throw e;
			}
			const result = (0, Provider_1.parseUpdateInfo)(rawData, channelFile, channelFileUrl);
			if (result.releaseName == null) result.releaseName = latestRelease.elementValueOrEmpty("title");
			if (result.releaseNotes == null) result.releaseNotes = computeReleaseNotes(this.updater.currentVersion, this.updater.fullChangelog, feed, latestRelease);
			return {
				tag,
				...result
			};
		}
		async getLatestTagName(cancellationToken) {
			const options = this.options;
			const url$13 = options.host == null || options.host === "github.com" ? (0, util_1.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new url_1$4.URL(`${this.computeGithubBasePath(`/repos/${options.owner}/${options.repo}/releases`)}/latest`, this.baseApiUrl);
			try {
				const rawData = await this.httpRequest(url$13, { Accept: "application/json" }, cancellationToken);
				if (rawData == null) return null;
				return JSON.parse(rawData).tag_name;
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Unable to find latest version on GitHub (${url$13}), please ensure a production release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
			}
		}
		get basePath() {
			return `/${this.options.owner}/${this.options.repo}/releases`;
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.resolveFiles)(updateInfo, this.baseUrl, (p) => this.getBaseDownloadPath(updateInfo.tag, p.replace(/ /g, "-")));
		}
		getBaseDownloadPath(tag, fileName) {
			return `${this.basePath}/download/${tag}/${fileName}`;
		}
	};
	exports.GitHubProvider = GitHubProvider;
	function getNoteValue(parent) {
		const result = parent.elementValueOrEmpty("content");
		return result === "No content." ? "" : result;
	}
	function computeReleaseNotes(currentVersion, isFullChangelog, feed, latestRelease) {
		if (!isFullChangelog) return getNoteValue(latestRelease);
		const releaseNotes = [];
		for (const release of feed.getElements("entry")) {
			const versionRelease = /\/tag\/v?([^/]+)$/.exec(release.element("link").attribute("href"))[1];
			if (semver.lt(currentVersion, versionRelease)) releaseNotes.push({
				version: versionRelease,
				note: getNoteValue(release)
			});
		}
		return releaseNotes.sort((a, b) => semver.rcompare(a.version, b.version));
	}
}));
var require_GitLabProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GitLabProvider = void 0;
	var builder_util_runtime_1 = require_out();
	var url_1$3 = require("url");
	var escapeRegExp = require_lodash_escaperegexp();
	var util_1 = require_util$2();
	var Provider_1 = require_Provider();
	var GitLabProvider = class extends Provider_1.Provider {
		/**
		* Normalizes filenames by replacing spaces and underscores with dashes.
		*
		* This is a workaround to handle filename formatting differences between tools:
		* - electron-builder formats filenames like "test file.txt" as "test-file.txt"
		* - GitLab may provide asset URLs using underscores, such as "test_file.txt"
		*
		* Because of this mismatch, we can't reliably extract the correct filename from
		* the asset path without normalization. This function ensures consistent matching
		* across different filename formats by converting all spaces and underscores to dashes.
		*
		* @param filename The filename to normalize
		* @returns The normalized filename with spaces and underscores replaced by dashes
		*/
		normalizeFilename(filename) {
			return filename.replace(/ |_/g, "-");
		}
		constructor(options, updater, runtimeOptions) {
			super({
				...runtimeOptions,
				isUseMultipleRangeRequest: false
			});
			this.options = options;
			this.updater = updater;
			this.cachedLatestVersion = null;
			const host = options.host || "gitlab.com";
			this.baseApiUrl = (0, util_1.newBaseUrl)(`https://${host}/api/v4`);
		}
		get channel() {
			const result = this.updater.channel || this.options.channel;
			return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
		}
		async getLatestVersion() {
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const latestReleaseUrl = (0, util_1.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
			let latestRelease;
			try {
				const header = {
					"Content-Type": "application/json",
					...this.setAuthHeaderForToken(this.options.token || null)
				};
				const releaseResponse = await this.httpRequest(latestReleaseUrl, header, cancellationToken);
				if (!releaseResponse) throw (0, builder_util_runtime_1.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
				latestRelease = JSON.parse(releaseResponse);
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Unable to find latest release on GitLab (${latestReleaseUrl}): ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
			}
			const tag = latestRelease.tag_name;
			let rawData = null;
			let channelFile = "";
			let channelFileUrl = null;
			const fetchChannelData = async (channelName) => {
				channelFile = (0, util_1.getChannelFilename)(channelName);
				const channelAsset = latestRelease.assets.links.find((asset) => asset.name === channelFile);
				if (!channelAsset) throw (0, builder_util_runtime_1.newError)(`Cannot find ${channelFile} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
				channelFileUrl = new url_1$3.URL(channelAsset.direct_asset_url);
				const headers = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
				try {
					const result = await this.httpRequest(channelFileUrl, headers, cancellationToken);
					if (!result) throw (0, builder_util_runtime_1.newError)(`Empty response from ${channelFileUrl}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
					return result;
				} catch (e) {
					if (e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) throw (0, builder_util_runtime_1.newError)(`Cannot find ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
					throw e;
				}
			};
			try {
				rawData = await fetchChannelData(this.channel);
			} catch (e) {
				if (this.channel !== this.getDefaultChannelName()) rawData = await fetchChannelData(this.getDefaultChannelName());
				else throw e;
			}
			if (!rawData) throw (0, builder_util_runtime_1.newError)(`Unable to parse channel data from ${channelFile}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
			const result = (0, Provider_1.parseUpdateInfo)(rawData, channelFile, channelFileUrl);
			if (result.releaseName == null) result.releaseName = latestRelease.name;
			if (result.releaseNotes == null) result.releaseNotes = latestRelease.description || null;
			const assetsMap = /* @__PURE__ */ new Map();
			for (const asset of latestRelease.assets.links) assetsMap.set(this.normalizeFilename(asset.name), asset.direct_asset_url);
			const gitlabUpdateInfo = {
				tag,
				assets: assetsMap,
				...result
			};
			this.cachedLatestVersion = gitlabUpdateInfo;
			return gitlabUpdateInfo;
		}
		/**
		* Utility function to convert GitlabReleaseAsset to Map<string, string>
		* Maps asset names to their download URLs
		*/
		convertAssetsToMap(assets) {
			const assetsMap = /* @__PURE__ */ new Map();
			for (const asset of assets.links) assetsMap.set(this.normalizeFilename(asset.name), asset.direct_asset_url);
			return assetsMap;
		}
		/**
		* Find blockmap file URL in assets map for a specific filename
		*/
		findBlockMapInAssets(assets, filename) {
			const possibleBlockMapNames = [`${filename}.blockmap`, `${this.normalizeFilename(filename)}.blockmap`];
			for (const blockMapName of possibleBlockMapNames) {
				const assetUrl = assets.get(blockMapName);
				if (assetUrl) return new url_1$3.URL(assetUrl);
			}
			return null;
		}
		async fetchReleaseInfoByVersion(version) {
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const possibleReleaseIds = [`v${version}`, version];
			for (const releaseId of possibleReleaseIds) {
				const releaseUrl = (0, util_1.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(releaseId)}`, this.baseApiUrl);
				try {
					const header = {
						"Content-Type": "application/json",
						...this.setAuthHeaderForToken(this.options.token || null)
					};
					const releaseResponse = await this.httpRequest(releaseUrl, header, cancellationToken);
					if (releaseResponse) return JSON.parse(releaseResponse);
				} catch (e) {
					if (e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) continue;
					throw (0, builder_util_runtime_1.newError)(`Unable to find release ${releaseId} on GitLab (${releaseUrl}): ${e.stack || e.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
				}
			}
			throw (0, builder_util_runtime_1.newError)(`Unable to find release with version ${version} (tried: ${possibleReleaseIds.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
		}
		setAuthHeaderForToken(token) {
			const headers = {};
			if (token != null) {
				if (token.startsWith("Bearer")) headers.authorization = token;
				else headers["PRIVATE-TOKEN"] = token;
			}
			return headers;
		}
		/**
		* Get version info for blockmap files, using cache when possible
		*/
		async getVersionInfoForBlockMap(version) {
			if (this.cachedLatestVersion && this.cachedLatestVersion.version === version) return this.cachedLatestVersion.assets;
			const versionInfo = await this.fetchReleaseInfoByVersion(version);
			if (versionInfo && versionInfo.assets) return this.convertAssetsToMap(versionInfo.assets);
			return null;
		}
		/**
		* Find blockmap URLs from version assets
		*/
		async findBlockMapUrlsFromAssets(oldVersion, newVersion, baseFilename) {
			let newBlockMapUrl = null;
			let oldBlockMapUrl = null;
			const newVersionAssets = await this.getVersionInfoForBlockMap(newVersion);
			if (newVersionAssets) newBlockMapUrl = this.findBlockMapInAssets(newVersionAssets, baseFilename);
			const oldVersionAssets = await this.getVersionInfoForBlockMap(oldVersion);
			if (oldVersionAssets) {
				const oldFilename = baseFilename.replace(new RegExp(escapeRegExp(newVersion), "g"), oldVersion);
				oldBlockMapUrl = this.findBlockMapInAssets(oldVersionAssets, oldFilename);
			}
			return [oldBlockMapUrl, newBlockMapUrl];
		}
		async getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl = null) {
			if (this.options.uploadTarget === "project_upload") {
				const baseFilename = baseUrl.pathname.split("/").pop() || "";
				const [oldBlockMapUrl, newBlockMapUrl] = await this.findBlockMapUrlsFromAssets(oldVersion, newVersion, baseFilename);
				if (!newBlockMapUrl) throw (0, builder_util_runtime_1.newError)(`Cannot find blockmap file for ${newVersion} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
				if (!oldBlockMapUrl) throw (0, builder_util_runtime_1.newError)(`Cannot find blockmap file for ${oldVersion} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
				return [oldBlockMapUrl, newBlockMapUrl];
			} else return super.getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl);
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.getFileList)(updateInfo).map((fileInfo) => {
				const matchingAssetName = [fileInfo.url, this.normalizeFilename(fileInfo.url)].find((name) => updateInfo.assets.has(name));
				const assetUrl = matchingAssetName ? updateInfo.assets.get(matchingAssetName) : void 0;
				if (!assetUrl) throw (0, builder_util_runtime_1.newError)(`Cannot find asset "${fileInfo.url}" in GitLab release assets. Available assets: ${Array.from(updateInfo.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
				return {
					url: new url_1$3.URL(assetUrl),
					info: fileInfo
				};
			});
		}
		toString() {
			return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
		}
	};
	exports.GitLabProvider = GitLabProvider;
}));
var require_KeygenProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.KeygenProvider = void 0;
	var builder_util_runtime_1 = require_out();
	var util_1 = require_util$2();
	var Provider_1 = require_Provider();
	var KeygenProvider = class extends Provider_1.Provider {
		constructor(configuration, updater, runtimeOptions) {
			super({
				...runtimeOptions,
				isUseMultipleRangeRequest: false
			});
			this.configuration = configuration;
			this.updater = updater;
			this.defaultHostname = "api.keygen.sh";
			const host = this.configuration.host || this.defaultHostname;
			this.baseUrl = (0, util_1.newBaseUrl)(`https://${host}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
		}
		get channel() {
			return this.updater.channel || this.configuration.channel || "stable";
		}
		async getLatestVersion() {
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const channelFile = (0, util_1.getChannelFilename)(this.getCustomChannelName(this.channel));
			const channelUrl = (0, util_1.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
			try {
				const updateInfo = await this.httpRequest(channelUrl, {
					Accept: "application/vnd.api+json",
					"Keygen-Version": "1.1"
				}, cancellationToken);
				return (0, Provider_1.parseUpdateInfo)(updateInfo, channelFile, channelUrl);
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
			}
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.resolveFiles)(updateInfo, this.baseUrl);
		}
		toString() {
			const { account, product, platform } = this.configuration;
			return `Keygen (account: ${account}, product: ${product}, platform: ${platform}, channel: ${this.channel})`;
		}
	};
	exports.KeygenProvider = KeygenProvider;
}));
var require_PrivateGitHubProvider = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrivateGitHubProvider = void 0;
	var builder_util_runtime_1 = require_out();
	var js_yaml_1 = require_js_yaml();
	var path$16 = require("path");
	var url_1$2 = require("url");
	var util_1 = require_util$2();
	var GitHubProvider_1 = require_GitHubProvider();
	var Provider_1 = require_Provider();
	var PrivateGitHubProvider = class extends GitHubProvider_1.BaseGitHubProvider {
		constructor(options, updater, token, runtimeOptions) {
			super(options, "api.github.com", runtimeOptions);
			this.updater = updater;
			this.token = token;
		}
		createRequestOptions(url$10, headers) {
			const result = super.createRequestOptions(url$10, headers);
			result.redirect = "manual";
			return result;
		}
		async getLatestVersion() {
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			const channelFile = (0, util_1.getChannelFilename)(this.getDefaultChannelName());
			const releaseInfo = await this.getLatestVersionInfo(cancellationToken);
			const asset = releaseInfo.assets.find((it) => it.name === channelFile);
			if (asset == null) throw (0, builder_util_runtime_1.newError)(`Cannot find ${channelFile} in the release ${releaseInfo.html_url || releaseInfo.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
			const url$11 = new url_1$2.URL(asset.url);
			let result;
			try {
				result = (0, js_yaml_1.load)(await this.httpRequest(url$11, this.configureHeaders("application/octet-stream"), cancellationToken));
			} catch (e) {
				if (e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) throw (0, builder_util_runtime_1.newError)(`Cannot find ${channelFile} in the latest release artifacts (${url$11}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
				throw e;
			}
			result.assets = releaseInfo.assets;
			return result;
		}
		get fileExtraDownloadHeaders() {
			return this.configureHeaders("application/octet-stream");
		}
		configureHeaders(accept) {
			return {
				accept,
				authorization: `token ${this.token}`
			};
		}
		async getLatestVersionInfo(cancellationToken) {
			const allowPrerelease = this.updater.allowPrerelease;
			let basePath = this.basePath;
			if (!allowPrerelease) basePath = `${basePath}/latest`;
			const url$12 = (0, util_1.newUrlFromBase)(basePath, this.baseUrl);
			try {
				const version = JSON.parse(await this.httpRequest(url$12, this.configureHeaders("application/vnd.github.v3+json"), cancellationToken));
				if (allowPrerelease) return version.find((it) => it.prerelease) || version[0];
				else return version;
			} catch (e) {
				throw (0, builder_util_runtime_1.newError)(`Unable to find latest version on GitHub (${url$12}), please ensure a production release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
			}
		}
		get basePath() {
			return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
		}
		resolveFiles(updateInfo) {
			return (0, Provider_1.getFileList)(updateInfo).map((it) => {
				const name = path$16.posix.basename(it.url).replace(/ /g, "-");
				const asset = updateInfo.assets.find((it) => it != null && it.name === name);
				if (asset == null) throw (0, builder_util_runtime_1.newError)(`Cannot find asset "${name}" in: ${JSON.stringify(updateInfo.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
				return {
					url: new url_1$2.URL(asset.url),
					info: it
				};
			});
		}
	};
	exports.PrivateGitHubProvider = PrivateGitHubProvider;
}));
var require_providerFactory = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isUrlProbablySupportMultiRangeRequests = isUrlProbablySupportMultiRangeRequests;
	exports.createClient = createClient;
	var builder_util_runtime_1 = require_out();
	var BitbucketProvider_1 = require_BitbucketProvider();
	var GenericProvider_1 = require_GenericProvider();
	var GitHubProvider_1 = require_GitHubProvider();
	var GitLabProvider_1 = require_GitLabProvider();
	var KeygenProvider_1 = require_KeygenProvider();
	var PrivateGitHubProvider_1 = require_PrivateGitHubProvider();
	function isUrlProbablySupportMultiRangeRequests(url) {
		return !url.includes("s3.amazonaws.com");
	}
	function createClient(data, updater, runtimeOptions) {
		if (typeof data === "string") throw (0, builder_util_runtime_1.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
		const provider = data.provider;
		switch (provider) {
			case "github": {
				const githubOptions = data;
				const token = (githubOptions.private ? process.env["GH_TOKEN"] || process.env["GITHUB_TOKEN"] : null) || githubOptions.token;
				if (token == null) return new GitHubProvider_1.GitHubProvider(githubOptions, updater, runtimeOptions);
				else return new PrivateGitHubProvider_1.PrivateGitHubProvider(githubOptions, updater, token, runtimeOptions);
			}
			case "bitbucket": return new BitbucketProvider_1.BitbucketProvider(data, updater, runtimeOptions);
			case "gitlab": return new GitLabProvider_1.GitLabProvider(data, updater, runtimeOptions);
			case "keygen": return new KeygenProvider_1.KeygenProvider(data, updater, runtimeOptions);
			case "s3":
			case "spaces": return new GenericProvider_1.GenericProvider({
				provider: "generic",
				url: (0, builder_util_runtime_1.getS3LikeProviderBaseUrl)(data),
				channel: data.channel || null
			}, updater, {
				...runtimeOptions,
				isUseMultipleRangeRequest: false
			});
			case "generic": {
				const options = data;
				return new GenericProvider_1.GenericProvider(options, updater, {
					...runtimeOptions,
					isUseMultipleRangeRequest: options.useMultipleRangeRequest !== false && isUrlProbablySupportMultiRangeRequests(options.url)
				});
			}
			case "custom": {
				const options = data;
				const constructor = options.updateProvider;
				if (!constructor) throw (0, builder_util_runtime_1.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
				return new constructor(options, updater, runtimeOptions);
			}
			default: throw (0, builder_util_runtime_1.newError)(`Unsupported provider: ${provider}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
		}
	}
}));
var require_downloadPlanBuilder = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OperationKind = void 0;
	exports.computeOperations = computeOperations;
	var OperationKind;
	(function(OperationKind) {
		OperationKind[OperationKind["COPY"] = 0] = "COPY";
		OperationKind[OperationKind["DOWNLOAD"] = 1] = "DOWNLOAD";
	})(OperationKind || (exports.OperationKind = OperationKind = {}));
	function computeOperations(oldBlockMap, newBlockMap, logger) {
		const nameToOldBlocks = buildBlockFileMap(oldBlockMap.files);
		const nameToNewBlocks = buildBlockFileMap(newBlockMap.files);
		let lastOperation = null;
		const blockMapFile = newBlockMap.files[0];
		const operations = [];
		const name = blockMapFile.name;
		const oldEntry = nameToOldBlocks.get(name);
		if (oldEntry == null) throw new Error(`no file ${name} in old blockmap`);
		const newFile = nameToNewBlocks.get(name);
		let changedBlockCount = 0;
		const { checksumToOffset: checksumToOldOffset, checksumToOldSize } = buildChecksumMap(nameToOldBlocks.get(name), oldEntry.offset, logger);
		let newOffset = blockMapFile.offset;
		for (let i = 0; i < newFile.checksums.length; newOffset += newFile.sizes[i], i++) {
			const blockSize = newFile.sizes[i];
			const checksum = newFile.checksums[i];
			let oldOffset = checksumToOldOffset.get(checksum);
			if (oldOffset != null && checksumToOldSize.get(checksum) !== blockSize) {
				logger.warn(`Checksum ("${checksum}") matches, but size differs (old: ${checksumToOldSize.get(checksum)}, new: ${blockSize})`);
				oldOffset = void 0;
			}
			if (oldOffset === void 0) {
				changedBlockCount++;
				if (lastOperation != null && lastOperation.kind === OperationKind.DOWNLOAD && lastOperation.end === newOffset) lastOperation.end += blockSize;
				else {
					lastOperation = {
						kind: OperationKind.DOWNLOAD,
						start: newOffset,
						end: newOffset + blockSize
					};
					validateAndAdd(lastOperation, operations, checksum, i);
				}
			} else if (lastOperation != null && lastOperation.kind === OperationKind.COPY && lastOperation.end === oldOffset) lastOperation.end += blockSize;
			else {
				lastOperation = {
					kind: OperationKind.COPY,
					start: oldOffset,
					end: oldOffset + blockSize
				};
				validateAndAdd(lastOperation, operations, checksum, i);
			}
		}
		if (changedBlockCount > 0) logger.info(`File${blockMapFile.name === "file" ? "" : " " + blockMapFile.name} has ${changedBlockCount} changed blocks`);
		return operations;
	}
	var isValidateOperationRange = process.env["DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES"] === "true";
	function validateAndAdd(operation, operations, checksum, index) {
		if (isValidateOperationRange && operations.length !== 0) {
			const lastOperation = operations[operations.length - 1];
			if (lastOperation.kind === operation.kind && operation.start < lastOperation.end && operation.start > lastOperation.start) {
				const min = [
					lastOperation.start,
					lastOperation.end,
					operation.start,
					operation.end
				].reduce((p, v) => p < v ? p : v);
				throw new Error(`operation (block index: ${index}, checksum: ${checksum}, kind: ${OperationKind[operation.kind]}) overlaps previous operation (checksum: ${checksum}):\nabs: ${lastOperation.start} until ${lastOperation.end} and ${operation.start} until ${operation.end}\nrel: ${lastOperation.start - min} until ${lastOperation.end - min} and ${operation.start - min} until ${operation.end - min}`);
			}
		}
		operations.push(operation);
	}
	function buildChecksumMap(file, fileOffset, logger) {
		const checksumToOffset = /* @__PURE__ */ new Map();
		const checksumToSize = /* @__PURE__ */ new Map();
		let offset = fileOffset;
		for (let i = 0; i < file.checksums.length; i++) {
			const checksum = file.checksums[i];
			const size = file.sizes[i];
			const existing = checksumToSize.get(checksum);
			if (existing === void 0) {
				checksumToOffset.set(checksum, offset);
				checksumToSize.set(checksum, size);
			} else if (logger.debug != null) {
				const sizeExplanation = existing === size ? "(same size)" : `(size: ${existing}, this size: ${size})`;
				logger.debug(`${checksum} duplicated in blockmap ${sizeExplanation}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
			}
			offset += size;
		}
		return {
			checksumToOffset,
			checksumToOldSize: checksumToSize
		};
	}
	function buildBlockFileMap(list) {
		const result = /* @__PURE__ */ new Map();
		for (const item of list) result.set(item.name, item);
		return result;
	}
}));
var require_DataSplitter = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DataSplitter = void 0;
	exports.copyData = copyData;
	var builder_util_runtime_1 = require_out();
	var fs_1$3 = require("fs");
	var stream_1$1 = require("stream");
	var downloadPlanBuilder_1 = require_downloadPlanBuilder();
	var DOUBLE_CRLF = Buffer.from("\r\n\r\n");
	var ReadState;
	(function(ReadState) {
		ReadState[ReadState["INIT"] = 0] = "INIT";
		ReadState[ReadState["HEADER"] = 1] = "HEADER";
		ReadState[ReadState["BODY"] = 2] = "BODY";
	})(ReadState || (ReadState = {}));
	function copyData(task, out, oldFileFd, reject, resolve) {
		const readStream = (0, fs_1$3.createReadStream)("", {
			fd: oldFileFd,
			autoClose: false,
			start: task.start,
			end: task.end - 1
		});
		readStream.on("error", reject);
		readStream.once("end", resolve);
		readStream.pipe(out, { end: false });
	}
	var DataSplitter = class extends stream_1$1.Writable {
		constructor(out, options, partIndexToTaskIndex, boundary, partIndexToLength, finishHandler) {
			super();
			this.out = out;
			this.options = options;
			this.partIndexToTaskIndex = partIndexToTaskIndex;
			this.partIndexToLength = partIndexToLength;
			this.finishHandler = finishHandler;
			this.partIndex = -1;
			this.headerListBuffer = null;
			this.readState = ReadState.INIT;
			this.ignoreByteCount = 0;
			this.remainingPartDataCount = 0;
			this.actualPartLength = 0;
			this.boundaryLength = boundary.length + 4;
			this.ignoreByteCount = this.boundaryLength - 2;
		}
		get isFinished() {
			return this.partIndex === this.partIndexToLength.length;
		}
		_write(data, encoding, callback) {
			if (this.isFinished) {
				console.error(`Trailing ignored data: ${data.length} bytes`);
				return;
			}
			this.handleData(data).then(callback).catch(callback);
		}
		async handleData(chunk) {
			let start = 0;
			if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0) throw (0, builder_util_runtime_1.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
			if (this.ignoreByteCount > 0) {
				const toIgnore = Math.min(this.ignoreByteCount, chunk.length);
				this.ignoreByteCount -= toIgnore;
				start = toIgnore;
			} else if (this.remainingPartDataCount > 0) {
				const toRead = Math.min(this.remainingPartDataCount, chunk.length);
				this.remainingPartDataCount -= toRead;
				await this.processPartData(chunk, 0, toRead);
				start = toRead;
			}
			if (start === chunk.length) return;
			if (this.readState === ReadState.HEADER) {
				const headerListEnd = this.searchHeaderListEnd(chunk, start);
				if (headerListEnd === -1) return;
				start = headerListEnd;
				this.readState = ReadState.BODY;
				this.headerListBuffer = null;
			}
			while (true) {
				if (this.readState === ReadState.BODY) this.readState = ReadState.INIT;
				else {
					this.partIndex++;
					let taskIndex = this.partIndexToTaskIndex.get(this.partIndex);
					if (taskIndex == null) {
						if (this.isFinished) taskIndex = this.options.end;
						else throw (0, builder_util_runtime_1.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
					}
					const prevTaskIndex = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
					if (prevTaskIndex < taskIndex) await this.copyExistingData(prevTaskIndex, taskIndex);
					else if (prevTaskIndex > taskIndex) throw (0, builder_util_runtime_1.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
					if (this.isFinished) {
						this.onPartEnd();
						this.finishHandler();
						return;
					}
					start = this.searchHeaderListEnd(chunk, start);
					if (start === -1) {
						this.readState = ReadState.HEADER;
						return;
					}
				}
				const partLength = this.partIndexToLength[this.partIndex];
				const end = start + partLength;
				const effectiveEnd = Math.min(end, chunk.length);
				await this.processPartStarted(chunk, start, effectiveEnd);
				this.remainingPartDataCount = partLength - (effectiveEnd - start);
				if (this.remainingPartDataCount > 0) return;
				start = end + this.boundaryLength;
				if (start >= chunk.length) {
					this.ignoreByteCount = this.boundaryLength - (chunk.length - end);
					return;
				}
			}
		}
		copyExistingData(index, end) {
			return new Promise((resolve, reject) => {
				const w = () => {
					if (index === end) {
						resolve();
						return;
					}
					const task = this.options.tasks[index];
					if (task.kind !== downloadPlanBuilder_1.OperationKind.COPY) {
						reject(/* @__PURE__ */ new Error("Task kind must be COPY"));
						return;
					}
					copyData(task, this.out, this.options.oldFileFd, reject, () => {
						index++;
						w();
					});
				};
				w();
			});
		}
		searchHeaderListEnd(chunk, readOffset) {
			const headerListEnd = chunk.indexOf(DOUBLE_CRLF, readOffset);
			if (headerListEnd !== -1) return headerListEnd + DOUBLE_CRLF.length;
			const partialChunk = readOffset === 0 ? chunk : chunk.slice(readOffset);
			if (this.headerListBuffer == null) this.headerListBuffer = partialChunk;
			else this.headerListBuffer = Buffer.concat([this.headerListBuffer, partialChunk]);
			return -1;
		}
		onPartEnd() {
			const expectedLength = this.partIndexToLength[this.partIndex - 1];
			if (this.actualPartLength !== expectedLength) throw (0, builder_util_runtime_1.newError)(`Expected length: ${expectedLength} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
			this.actualPartLength = 0;
		}
		processPartStarted(data, start, end) {
			if (this.partIndex !== 0) this.onPartEnd();
			return this.processPartData(data, start, end);
		}
		processPartData(data, start, end) {
			this.actualPartLength += end - start;
			const out = this.out;
			if (out.write(start === 0 && data.length === end ? data : data.slice(start, end))) return Promise.resolve();
			else return new Promise((resolve, reject) => {
				out.on("error", reject);
				out.once("drain", () => {
					out.removeListener("error", reject);
					resolve();
				});
			});
		}
	};
	exports.DataSplitter = DataSplitter;
}));
var require_multipleRangeDownloader = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.executeTasksUsingMultipleRangeRequests = executeTasksUsingMultipleRangeRequests;
	exports.checkIsRangesSupported = checkIsRangesSupported;
	var builder_util_runtime_1 = require_out();
	var DataSplitter_1 = require_DataSplitter();
	var downloadPlanBuilder_1 = require_downloadPlanBuilder();
	function executeTasksUsingMultipleRangeRequests(differentialDownloader, tasks, out, oldFileFd, reject) {
		const w = (taskOffset) => {
			if (taskOffset >= tasks.length) {
				if (differentialDownloader.fileMetadataBuffer != null) out.write(differentialDownloader.fileMetadataBuffer);
				out.end();
				return;
			}
			const nextOffset = taskOffset + 1e3;
			doExecuteTasks(differentialDownloader, {
				tasks,
				start: taskOffset,
				end: Math.min(tasks.length, nextOffset),
				oldFileFd
			}, out, () => w(nextOffset), reject);
		};
		return w;
	}
	function doExecuteTasks(differentialDownloader, options, out, resolve, reject) {
		let ranges = "bytes=";
		let partCount = 0;
		const partIndexToTaskIndex = /* @__PURE__ */ new Map();
		const partIndexToLength = [];
		for (let i = options.start; i < options.end; i++) {
			const task = options.tasks[i];
			if (task.kind === downloadPlanBuilder_1.OperationKind.DOWNLOAD) {
				ranges += `${task.start}-${task.end - 1}, `;
				partIndexToTaskIndex.set(partCount, i);
				partCount++;
				partIndexToLength.push(task.end - task.start);
			}
		}
		if (partCount <= 1) {
			const w = (index) => {
				if (index >= options.end) {
					resolve();
					return;
				}
				const task = options.tasks[index++];
				if (task.kind === downloadPlanBuilder_1.OperationKind.COPY) (0, DataSplitter_1.copyData)(task, out, options.oldFileFd, reject, () => w(index));
				else {
					const requestOptions = differentialDownloader.createRequestOptions();
					requestOptions.headers.Range = `bytes=${task.start}-${task.end - 1}`;
					const request = differentialDownloader.httpExecutor.createRequest(requestOptions, (response) => {
						response.on("error", reject);
						if (!checkIsRangesSupported(response, reject)) return;
						response.pipe(out, { end: false });
						response.once("end", () => w(index));
					});
					differentialDownloader.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
					request.end();
				}
			};
			w(options.start);
			return;
		}
		const requestOptions = differentialDownloader.createRequestOptions();
		requestOptions.headers.Range = ranges.substring(0, ranges.length - 2);
		const request = differentialDownloader.httpExecutor.createRequest(requestOptions, (response) => {
			if (!checkIsRangesSupported(response, reject)) return;
			const contentType = (0, builder_util_runtime_1.safeGetHeader)(response, "content-type");
			const m = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(contentType);
			if (m == null) {
				reject(/* @__PURE__ */ new Error(`Content-Type "multipart/byteranges" is expected, but got "${contentType}"`));
				return;
			}
			const dicer = new DataSplitter_1.DataSplitter(out, options, partIndexToTaskIndex, m[1] || m[2], partIndexToLength, resolve);
			dicer.on("error", reject);
			response.pipe(dicer);
			response.on("end", () => {
				setTimeout(() => {
					request.abort();
					reject(/* @__PURE__ */ new Error("Response ends without calling any handlers"));
				}, 1e4);
			});
		});
		differentialDownloader.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
		request.end();
	}
	function checkIsRangesSupported(response, reject) {
		if (response.statusCode >= 400) {
			reject((0, builder_util_runtime_1.createHttpError)(response));
			return false;
		}
		if (response.statusCode !== 206) {
			const acceptRanges = (0, builder_util_runtime_1.safeGetHeader)(response, "accept-ranges");
			if (acceptRanges == null || acceptRanges === "none") {
				reject(/* @__PURE__ */ new Error(`Server doesn't support Accept-Ranges (response code ${response.statusCode})`));
				return false;
			}
		}
		return true;
	}
}));
var require_ProgressDifferentialDownloadCallbackTransform = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProgressDifferentialDownloadCallbackTransform = void 0;
	var stream_1 = require("stream");
	var OperationKind;
	(function(OperationKind) {
		OperationKind[OperationKind["COPY"] = 0] = "COPY";
		OperationKind[OperationKind["DOWNLOAD"] = 1] = "DOWNLOAD";
	})(OperationKind || (OperationKind = {}));
	var ProgressDifferentialDownloadCallbackTransform = class extends stream_1.Transform {
		constructor(progressDifferentialDownloadInfo, cancellationToken, onProgress) {
			super();
			this.progressDifferentialDownloadInfo = progressDifferentialDownloadInfo;
			this.cancellationToken = cancellationToken;
			this.onProgress = onProgress;
			this.start = Date.now();
			this.transferred = 0;
			this.delta = 0;
			this.expectedBytes = 0;
			this.index = 0;
			this.operationType = OperationKind.COPY;
			this.nextUpdate = this.start + 1e3;
		}
		_transform(chunk, encoding, callback) {
			if (this.cancellationToken.cancelled) {
				callback(/* @__PURE__ */ new Error("cancelled"), null);
				return;
			}
			if (this.operationType == OperationKind.COPY) {
				callback(null, chunk);
				return;
			}
			this.transferred += chunk.length;
			this.delta += chunk.length;
			const now = Date.now();
			if (now >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal) {
				this.nextUpdate = now + 1e3;
				this.onProgress({
					total: this.progressDifferentialDownloadInfo.grandTotal,
					delta: this.delta,
					transferred: this.transferred,
					percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
					bytesPerSecond: Math.round(this.transferred / ((now - this.start) / 1e3))
				});
				this.delta = 0;
			}
			callback(null, chunk);
		}
		beginFileCopy() {
			this.operationType = OperationKind.COPY;
		}
		beginRangeDownload() {
			this.operationType = OperationKind.DOWNLOAD;
			this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
		}
		endRangeDownload() {
			if (this.transferred !== this.progressDifferentialDownloadInfo.grandTotal) this.onProgress({
				total: this.progressDifferentialDownloadInfo.grandTotal,
				delta: this.delta,
				transferred: this.transferred,
				percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
				bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
			});
		}
		_flush(callback) {
			if (this.cancellationToken.cancelled) {
				callback(/* @__PURE__ */ new Error("cancelled"));
				return;
			}
			this.onProgress({
				total: this.progressDifferentialDownloadInfo.grandTotal,
				delta: this.delta,
				transferred: this.transferred,
				percent: 100,
				bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
			});
			this.delta = 0;
			this.transferred = 0;
			callback(null);
		}
	};
	exports.ProgressDifferentialDownloadCallbackTransform = ProgressDifferentialDownloadCallbackTransform;
}));
var require_DifferentialDownloader = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DifferentialDownloader = void 0;
	var builder_util_runtime_1 = require_out();
	var fs_extra_1 = require_lib$9();
	var fs_1$2 = require("fs");
	var DataSplitter_1 = require_DataSplitter();
	var url_1$1 = require("url");
	var downloadPlanBuilder_1 = require_downloadPlanBuilder();
	var multipleRangeDownloader_1 = require_multipleRangeDownloader();
	var ProgressDifferentialDownloadCallbackTransform_1 = require_ProgressDifferentialDownloadCallbackTransform();
	var DifferentialDownloader = class {
		constructor(blockAwareFileInfo, httpExecutor, options) {
			this.blockAwareFileInfo = blockAwareFileInfo;
			this.httpExecutor = httpExecutor;
			this.options = options;
			this.fileMetadataBuffer = null;
			this.logger = options.logger;
		}
		createRequestOptions() {
			const result = { headers: {
				...this.options.requestHeaders,
				accept: "*/*"
			} };
			(0, builder_util_runtime_1.configureRequestUrl)(this.options.newUrl, result);
			(0, builder_util_runtime_1.configureRequestOptions)(result);
			return result;
		}
		doDownload(oldBlockMap, newBlockMap) {
			if (oldBlockMap.version !== newBlockMap.version) throw new Error(`version is different (${oldBlockMap.version} - ${newBlockMap.version}), full download is required`);
			const logger = this.logger;
			const operations = (0, downloadPlanBuilder_1.computeOperations)(oldBlockMap, newBlockMap, logger);
			if (logger.debug != null) logger.debug(JSON.stringify(operations, null, 2));
			let downloadSize = 0;
			let copySize = 0;
			for (const operation of operations) {
				const length = operation.end - operation.start;
				if (operation.kind === downloadPlanBuilder_1.OperationKind.DOWNLOAD) downloadSize += length;
				else copySize += length;
			}
			const newSize = this.blockAwareFileInfo.size;
			if (downloadSize + copySize + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== newSize) throw new Error(`Internal error, size mismatch: downloadSize: ${downloadSize}, copySize: ${copySize}, newSize: ${newSize}`);
			logger.info(`Full: ${formatBytes(newSize)}, To download: ${formatBytes(downloadSize)} (${Math.round(downloadSize / (newSize / 100))}%)`);
			return this.downloadFile(operations);
		}
		downloadFile(tasks) {
			const fdList = [];
			const closeFiles = () => {
				return Promise.all(fdList.map((openedFile) => {
					return (0, fs_extra_1.close)(openedFile.descriptor).catch((e) => {
						this.logger.error(`cannot close file "${openedFile.path}": ${e}`);
					});
				}));
			};
			return this.doDownloadFile(tasks, fdList).then(closeFiles).catch((e) => {
				return closeFiles().catch((closeFilesError) => {
					try {
						this.logger.error(`cannot close files: ${closeFilesError}`);
					} catch (errorOnLog) {
						try {
							console.error(errorOnLog);
						} catch (_ignored) {}
					}
					throw e;
				}).then(() => {
					throw e;
				});
			});
		}
		async doDownloadFile(tasks, fdList) {
			const oldFileFd = await (0, fs_extra_1.open)(this.options.oldFile, "r");
			fdList.push({
				descriptor: oldFileFd,
				path: this.options.oldFile
			});
			const newFileFd = await (0, fs_extra_1.open)(this.options.newFile, "w");
			fdList.push({
				descriptor: newFileFd,
				path: this.options.newFile
			});
			const fileOut = (0, fs_1$2.createWriteStream)(this.options.newFile, { fd: newFileFd });
			await new Promise((resolve, reject) => {
				const streams = [];
				let downloadInfoTransform = void 0;
				if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
					const expectedByteCounts = [];
					let grandTotalBytes = 0;
					for (const task of tasks) if (task.kind === downloadPlanBuilder_1.OperationKind.DOWNLOAD) {
						expectedByteCounts.push(task.end - task.start);
						grandTotalBytes += task.end - task.start;
					}
					const progressDifferentialDownloadInfo = {
						expectedByteCounts,
						grandTotal: grandTotalBytes
					};
					downloadInfoTransform = new ProgressDifferentialDownloadCallbackTransform_1.ProgressDifferentialDownloadCallbackTransform(progressDifferentialDownloadInfo, this.options.cancellationToken, this.options.onProgress);
					streams.push(downloadInfoTransform);
				}
				const digestTransform = new builder_util_runtime_1.DigestTransform(this.blockAwareFileInfo.sha512);
				digestTransform.isValidateOnEnd = false;
				streams.push(digestTransform);
				fileOut.on("finish", () => {
					fileOut.close(() => {
						fdList.splice(1, 1);
						try {
							digestTransform.validate();
						} catch (e) {
							reject(e);
							return;
						}
						resolve(void 0);
					});
				});
				streams.push(fileOut);
				let lastStream = null;
				for (const stream of streams) {
					stream.on("error", reject);
					if (lastStream == null) lastStream = stream;
					else lastStream = lastStream.pipe(stream);
				}
				const firstStream = streams[0];
				let w;
				if (this.options.isUseMultipleRangeRequest) {
					w = (0, multipleRangeDownloader_1.executeTasksUsingMultipleRangeRequests)(this, tasks, firstStream, oldFileFd, reject);
					w(0);
					return;
				}
				let downloadOperationCount = 0;
				let actualUrl = null;
				this.logger.info(`Differential download: ${this.options.newUrl}`);
				const requestOptions = this.createRequestOptions();
				requestOptions.redirect = "manual";
				w = (index) => {
					var _a, _b;
					if (index >= tasks.length) {
						if (this.fileMetadataBuffer != null) firstStream.write(this.fileMetadataBuffer);
						firstStream.end();
						return;
					}
					const operation = tasks[index++];
					if (operation.kind === downloadPlanBuilder_1.OperationKind.COPY) {
						if (downloadInfoTransform) downloadInfoTransform.beginFileCopy();
						(0, DataSplitter_1.copyData)(operation, firstStream, oldFileFd, reject, () => w(index));
						return;
					}
					const range = `bytes=${operation.start}-${operation.end - 1}`;
					requestOptions.headers.range = range;
					(_b = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug) === null || _b === void 0 || _b.call(_a, `download range: ${range}`);
					if (downloadInfoTransform) downloadInfoTransform.beginRangeDownload();
					const request = this.httpExecutor.createRequest(requestOptions, (response) => {
						response.on("error", reject);
						response.on("aborted", () => {
							reject(/* @__PURE__ */ new Error("response has been aborted by the server"));
						});
						if (response.statusCode >= 400) reject((0, builder_util_runtime_1.createHttpError)(response));
						response.pipe(firstStream, { end: false });
						response.once("end", () => {
							if (downloadInfoTransform) downloadInfoTransform.endRangeDownload();
							if (++downloadOperationCount === 100) {
								downloadOperationCount = 0;
								setTimeout(() => w(index), 1e3);
							} else w(index);
						});
					});
					request.on("redirect", (statusCode, method, redirectUrl) => {
						this.logger.info(`Redirect to ${removeQuery(redirectUrl)}`);
						actualUrl = redirectUrl;
						(0, builder_util_runtime_1.configureRequestUrl)(new url_1$1.URL(actualUrl), requestOptions);
						request.followRedirect();
					});
					this.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
					request.end();
				};
				w(0);
			});
		}
		async readRemoteBytes(start, endInclusive) {
			const buffer = Buffer.allocUnsafe(endInclusive + 1 - start);
			const requestOptions = this.createRequestOptions();
			requestOptions.headers.range = `bytes=${start}-${endInclusive}`;
			let position = 0;
			await this.request(requestOptions, (chunk) => {
				chunk.copy(buffer, position);
				position += chunk.length;
			});
			if (position !== buffer.length) throw new Error(`Received data length ${position} is not equal to expected ${buffer.length}`);
			return buffer;
		}
		request(requestOptions, dataHandler) {
			return new Promise((resolve, reject) => {
				const request = this.httpExecutor.createRequest(requestOptions, (response) => {
					if (!(0, multipleRangeDownloader_1.checkIsRangesSupported)(response, reject)) return;
					response.on("error", reject);
					response.on("aborted", () => {
						reject(/* @__PURE__ */ new Error("response has been aborted by the server"));
					});
					response.on("data", dataHandler);
					response.on("end", () => resolve());
				});
				this.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
				request.end();
			});
		}
	};
	exports.DifferentialDownloader = DifferentialDownloader;
	function formatBytes(value, symbol = " KB") {
		return new Intl.NumberFormat("en").format((value / 1024).toFixed(2)) + symbol;
	}
	function removeQuery(url$9) {
		const index = url$9.indexOf("?");
		return index < 0 ? url$9 : url$9.substring(0, index);
	}
}));
var require_GenericDifferentialDownloader = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GenericDifferentialDownloader = void 0;
	var DifferentialDownloader_1 = require_DifferentialDownloader();
	var GenericDifferentialDownloader = class extends DifferentialDownloader_1.DifferentialDownloader {
		download(oldBlockMap, newBlockMap) {
			return this.doDownload(oldBlockMap, newBlockMap);
		}
	};
	exports.GenericDifferentialDownloader = GenericDifferentialDownloader;
}));
var require_types$2 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UpdaterSignal = exports.UPDATE_DOWNLOADED = exports.DOWNLOAD_PROGRESS = exports.CancellationToken = void 0;
	exports.addHandler = addHandler;
	var builder_util_runtime_1 = require_out();
	Object.defineProperty(exports, "CancellationToken", {
		enumerable: true,
		get: function() {
			return builder_util_runtime_1.CancellationToken;
		}
	});
	exports.DOWNLOAD_PROGRESS = "download-progress";
	exports.UPDATE_DOWNLOADED = "update-downloaded";
	var UpdaterSignal = class {
		constructor(emitter) {
			this.emitter = emitter;
		}
		/**
		* Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
		*/
		login(handler) {
			addHandler(this.emitter, "login", handler);
		}
		progress(handler) {
			addHandler(this.emitter, exports.DOWNLOAD_PROGRESS, handler);
		}
		updateDownloaded(handler) {
			addHandler(this.emitter, exports.UPDATE_DOWNLOADED, handler);
		}
		updateCancelled(handler) {
			addHandler(this.emitter, "update-cancelled", handler);
		}
	};
	exports.UpdaterSignal = UpdaterSignal;
	function addHandler(emitter, event, handler) {
		emitter.on(event, handler);
	}
}));
var require_AppUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoOpLogger = exports.AppUpdater = void 0;
	var builder_util_runtime_1 = require_out();
	var crypto_1$1 = require("crypto");
	var os_1 = require("os");
	var events_1 = require("events");
	var fs_extra_1 = require_lib$9();
	var js_yaml_1 = require_js_yaml();
	var lazy_val_1 = require_main$1();
	var path$15 = require("path");
	var semver_1 = require_semver();
	var DownloadedUpdateHelper_1 = require_DownloadedUpdateHelper();
	var ElectronAppAdapter_1 = require_ElectronAppAdapter();
	var electronHttpExecutor_1 = require_electronHttpExecutor();
	var GenericProvider_1 = require_GenericProvider();
	var providerFactory_1 = require_providerFactory();
	var zlib_1$1 = require("zlib");
	var GenericDifferentialDownloader_1 = require_GenericDifferentialDownloader();
	var types_1 = require_types$2();
	exports.AppUpdater = class AppUpdater extends events_1.EventEmitter {
		/**
		* Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
		*/
		get channel() {
			return this._channel;
		}
		/**
		* Set the update channel. Overrides `channel` in the update configuration.
		*
		* `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
		*/
		set channel(value) {
			if (this._channel != null) {
				if (typeof value !== "string") throw (0, builder_util_runtime_1.newError)(`Channel must be a string, but got: ${value}`, "ERR_UPDATER_INVALID_CHANNEL");
				else if (value.length === 0) throw (0, builder_util_runtime_1.newError)(`Channel must be not an empty string`, "ERR_UPDATER_INVALID_CHANNEL");
			}
			this._channel = value;
			this.allowDowngrade = true;
		}
		/**
		*  Shortcut for explicitly adding auth tokens to request headers
		*/
		addAuthHeader(token) {
			this.requestHeaders = Object.assign({}, this.requestHeaders, { authorization: token });
		}
		get netSession() {
			return (0, electronHttpExecutor_1.getNetSession)();
		}
		/**
		* The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
		* Set it to `null` if you would like to disable a logging feature.
		*/
		get logger() {
			return this._logger;
		}
		set logger(value) {
			this._logger = value == null ? new NoOpLogger() : value;
		}
		/**
		* test only
		* @private
		*/
		set updateConfigPath(value) {
			this.clientPromise = null;
			this._appUpdateConfigPath = value;
			this.configOnDisk = new lazy_val_1.Lazy(() => this.loadUpdateConfig());
		}
		/**
		* Allows developer to override default logic for determining if an update is supported.
		* The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
		*/
		get isUpdateSupported() {
			return this._isUpdateSupported;
		}
		set isUpdateSupported(value) {
			if (value) this._isUpdateSupported = value;
		}
		/**
		* Allows developer to override default logic for determining if the user is below the rollout threshold.
		* The default logic compares the staging percentage with numerical representation of user ID.
		* An override can define custom logic, or bypass it if needed.
		*/
		get isUserWithinRollout() {
			return this._isUserWithinRollout;
		}
		set isUserWithinRollout(value) {
			if (value) this._isUserWithinRollout = value;
		}
		constructor(options, app) {
			super();
			/**
			* Whether to automatically download an update when it is found.
			* @default true
			*/
			this.autoDownload = true;
			/**
			* Whether to automatically install a downloaded update on app quit (if `quitAndInstall` was not called before).
			* @default true
			*/
			this.autoInstallOnAppQuit = true;
			/**
			* Whether to run the app after finish install when run the installer is NOT in silent mode.
			* @default true
			*/
			this.autoRunAppAfterInstall = true;
			/**
			* *GitHub provider only.* Whether to allow update to pre-release versions. Defaults to `true` if application version contains prerelease components (e.g. `0.12.1-alpha.1`, here `alpha` is a prerelease component), otherwise `false`.
			*
			* If `true`, downgrade will be allowed (`allowDowngrade` will be set to `true`).
			*/
			this.allowPrerelease = false;
			/**
			* *GitHub provider only.* Get all release notes (from current version to latest), not just the latest.
			* @default false
			*/
			this.fullChangelog = false;
			/**
			* Whether to allow version downgrade (when a user from the beta channel wants to go back to the stable channel).
			*
			* Taken in account only if channel differs (pre-release version component in terms of semantic versioning).
			*
			* @default false
			*/
			this.allowDowngrade = false;
			/**
			* Web installer files might not have signature verification, this switch prevents to load them unless it is needed.
			*
			* Currently false to prevent breaking the current API, but it should be changed to default true at some point that
			* breaking changes are allowed.
			*
			* @default false
			*/
			this.disableWebInstaller = false;
			/**
			* *NSIS only* Disable differential downloads and always perform full download of installer.
			*
			* @default false
			*/
			this.disableDifferentialDownload = false;
			/**
			* Allows developer to force the updater to work in "dev" mode, looking for "dev-app-update.yml" instead of "app-update.yml"
			* Dev: `path.join(this.app.getAppPath(), "dev-app-update.yml")`
			* Prod: `path.join(process.resourcesPath!, "app-update.yml")`
			*
			* @default false
			*/
			this.forceDevUpdateConfig = false;
			/**
			* The base URL of the old block map file.
			*
			* When null, the updater will use the base URL of the update file to download the update.
			* When set, the updater will use this string as the base URL of the old block map file.
			* Some servers like github cannot download the old block map file from latest release,
			* so you need to compute the old block map file base URL manually.
			*
			* @default null
			*/
			this.previousBlockmapBaseUrlOverride = null;
			this._channel = null;
			this.downloadedUpdateHelper = null;
			/**
			*  The request headers.
			*/
			this.requestHeaders = null;
			this._logger = console;
			/**
			* For type safety you can use signals, e.g. `autoUpdater.signals.updateDownloaded(() => {})` instead of `autoUpdater.on('update-available', () => {})`
			*/
			this.signals = new types_1.UpdaterSignal(this);
			this._appUpdateConfigPath = null;
			this._isUpdateSupported = (updateInfo) => this.checkIfUpdateSupported(updateInfo);
			this._isUserWithinRollout = (updateInfo) => this.isStagingMatch(updateInfo);
			this.clientPromise = null;
			this.stagingUserIdPromise = new lazy_val_1.Lazy(() => this.getOrCreateStagingUserId());
			/** @internal */
			this.configOnDisk = new lazy_val_1.Lazy(() => this.loadUpdateConfig());
			this.checkForUpdatesPromise = null;
			this.downloadPromise = null;
			this.updateInfoAndProvider = null;
			/**
			* @private
			* @internal
			*/
			this._testOnlyOptions = null;
			this.on("error", (error) => {
				this._logger.error(`Error: ${error.stack || error.message}`);
			});
			if (app == null) {
				this.app = new ElectronAppAdapter_1.ElectronAppAdapter();
				this.httpExecutor = new electronHttpExecutor_1.ElectronHttpExecutor((authInfo, callback) => this.emit("login", authInfo, callback));
			} else {
				this.app = app;
				this.httpExecutor = null;
			}
			const currentVersionString = this.app.version;
			const currentVersion = (0, semver_1.parse)(currentVersionString);
			if (currentVersion == null) throw (0, builder_util_runtime_1.newError)(`App version is not a valid semver version: "${currentVersionString}"`, "ERR_UPDATER_INVALID_VERSION");
			this.currentVersion = currentVersion;
			this.allowPrerelease = hasPrereleaseComponents(currentVersion);
			if (options != null) {
				this.setFeedURL(options);
				if (typeof options !== "string" && options.requestHeaders) this.requestHeaders = options.requestHeaders;
			}
		}
		getFeedURL() {
			return "Deprecated. Do not use it.";
		}
		/**
		* Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
		* @param options If you want to override configuration in the `app-update.yml`.
		*/
		setFeedURL(options) {
			const runtimeOptions = this.createProviderRuntimeOptions();
			let provider;
			if (typeof options === "string") provider = new GenericProvider_1.GenericProvider({
				provider: "generic",
				url: options
			}, this, {
				...runtimeOptions,
				isUseMultipleRangeRequest: (0, providerFactory_1.isUrlProbablySupportMultiRangeRequests)(options)
			});
			else provider = (0, providerFactory_1.createClient)(options, this, runtimeOptions);
			this.clientPromise = Promise.resolve(provider);
		}
		/**
		* Asks the server whether there is an update.
		* @returns null if the updater is disabled, otherwise info about the latest version
		*/
		checkForUpdates() {
			if (!this.isUpdaterActive()) return Promise.resolve(null);
			let checkForUpdatesPromise = this.checkForUpdatesPromise;
			if (checkForUpdatesPromise != null) {
				this._logger.info("Checking for update (already in progress)");
				return checkForUpdatesPromise;
			}
			const nullizePromise = () => this.checkForUpdatesPromise = null;
			this._logger.info("Checking for update");
			checkForUpdatesPromise = this.doCheckForUpdates().then((it) => {
				nullizePromise();
				return it;
			}).catch((e) => {
				nullizePromise();
				this.emit("error", e, `Cannot check for updates: ${(e.stack || e).toString()}`);
				throw e;
			});
			this.checkForUpdatesPromise = checkForUpdatesPromise;
			return checkForUpdatesPromise;
		}
		isUpdaterActive() {
			if (!(this.app.isPackaged || this.forceDevUpdateConfig)) {
				this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced");
				return false;
			}
			return true;
		}
		checkForUpdatesAndNotify(downloadNotification) {
			return this.checkForUpdates().then((it) => {
				if (!(it === null || it === void 0 ? void 0 : it.downloadPromise)) {
					if (this._logger.debug != null) this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null");
					return it;
				}
				it.downloadPromise.then(() => {
					const notificationContent = AppUpdater.formatDownloadNotification(it.updateInfo.version, this.app.name, downloadNotification);
					new (require("electron")).Notification(notificationContent).show();
				});
				return it;
			});
		}
		static formatDownloadNotification(version, appName, downloadNotification) {
			if (downloadNotification == null) downloadNotification = {
				title: "A new update is ready to install",
				body: `{appName} version {version} has been downloaded and will be automatically installed on exit`
			};
			downloadNotification = {
				title: downloadNotification.title.replace("{appName}", appName).replace("{version}", version),
				body: downloadNotification.body.replace("{appName}", appName).replace("{version}", version)
			};
			return downloadNotification;
		}
		async isStagingMatch(updateInfo) {
			const rawStagingPercentage = updateInfo.stagingPercentage;
			let stagingPercentage = rawStagingPercentage;
			if (stagingPercentage == null) return true;
			stagingPercentage = parseInt(stagingPercentage, 10);
			if (isNaN(stagingPercentage)) {
				this._logger.warn(`Staging percentage is NaN: ${rawStagingPercentage}`);
				return true;
			}
			stagingPercentage = stagingPercentage / 100;
			const stagingUserId = await this.stagingUserIdPromise.value;
			const percentage = builder_util_runtime_1.UUID.parse(stagingUserId).readUInt32BE(12) / 4294967295;
			this._logger.info(`Staging percentage: ${stagingPercentage}, percentage: ${percentage}, user id: ${stagingUserId}`);
			return percentage < stagingPercentage;
		}
		computeFinalHeaders(headers) {
			if (this.requestHeaders != null) Object.assign(headers, this.requestHeaders);
			return headers;
		}
		async isUpdateAvailable(updateInfo) {
			const latestVersion = (0, semver_1.parse)(updateInfo.version);
			if (latestVersion == null) throw (0, builder_util_runtime_1.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${updateInfo.version}"`, "ERR_UPDATER_INVALID_VERSION");
			const currentVersion = this.currentVersion;
			if ((0, semver_1.eq)(latestVersion, currentVersion)) return false;
			if (!await Promise.resolve(this.isUpdateSupported(updateInfo))) return false;
			if (!await Promise.resolve(this.isUserWithinRollout(updateInfo))) return false;
			const isLatestVersionNewer = (0, semver_1.gt)(latestVersion, currentVersion);
			const isLatestVersionOlder = (0, semver_1.lt)(latestVersion, currentVersion);
			if (isLatestVersionNewer) return true;
			return this.allowDowngrade && isLatestVersionOlder;
		}
		checkIfUpdateSupported(updateInfo) {
			const minimumSystemVersion = updateInfo === null || updateInfo === void 0 ? void 0 : updateInfo.minimumSystemVersion;
			const currentOSVersion = (0, os_1.release)();
			if (minimumSystemVersion) try {
				if ((0, semver_1.lt)(currentOSVersion, minimumSystemVersion)) {
					this._logger.info(`Current OS version ${currentOSVersion} is less than the minimum OS version required ${minimumSystemVersion} for version ${currentOSVersion}`);
					return false;
				}
			} catch (e) {
				this._logger.warn(`Failed to compare current OS version(${currentOSVersion}) with minimum OS version(${minimumSystemVersion}): ${(e.message || e).toString()}`);
			}
			return true;
		}
		async getUpdateInfoAndProvider() {
			await this.app.whenReady();
			if (this.clientPromise == null) this.clientPromise = this.configOnDisk.value.then((it) => (0, providerFactory_1.createClient)(it, this, this.createProviderRuntimeOptions()));
			const client = await this.clientPromise;
			const stagingUserId = await this.stagingUserIdPromise.value;
			client.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": stagingUserId }));
			return {
				info: await client.getLatestVersion(),
				provider: client
			};
		}
		createProviderRuntimeOptions() {
			return {
				isUseMultipleRangeRequest: true,
				platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
				executor: this.httpExecutor
			};
		}
		async doCheckForUpdates() {
			this.emit("checking-for-update");
			const result = await this.getUpdateInfoAndProvider();
			const updateInfo = result.info;
			if (!await this.isUpdateAvailable(updateInfo)) {
				this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${updateInfo.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`);
				this.emit("update-not-available", updateInfo);
				return {
					isUpdateAvailable: false,
					versionInfo: updateInfo,
					updateInfo
				};
			}
			this.updateInfoAndProvider = result;
			this.onUpdateAvailable(updateInfo);
			const cancellationToken = new builder_util_runtime_1.CancellationToken();
			return {
				isUpdateAvailable: true,
				versionInfo: updateInfo,
				updateInfo,
				cancellationToken,
				downloadPromise: this.autoDownload ? this.downloadUpdate(cancellationToken) : null
			};
		}
		onUpdateAvailable(updateInfo) {
			this._logger.info(`Found version ${updateInfo.version} (url: ${(0, builder_util_runtime_1.asArray)(updateInfo.files).map((it) => it.url).join(", ")})`);
			this.emit("update-available", updateInfo);
		}
		/**
		* Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
		* @returns {Promise<Array<string>>} Paths to downloaded files.
		*/
		downloadUpdate(cancellationToken = new builder_util_runtime_1.CancellationToken()) {
			const updateInfoAndProvider = this.updateInfoAndProvider;
			if (updateInfoAndProvider == null) {
				const error = /* @__PURE__ */ new Error("Please check update first");
				this.dispatchError(error);
				return Promise.reject(error);
			}
			if (this.downloadPromise != null) {
				this._logger.info("Downloading update (already in progress)");
				return this.downloadPromise;
			}
			this._logger.info(`Downloading update from ${(0, builder_util_runtime_1.asArray)(updateInfoAndProvider.info.files).map((it) => it.url).join(", ")}`);
			const errorHandler = (e) => {
				if (!(e instanceof builder_util_runtime_1.CancellationError)) try {
					this.dispatchError(e);
				} catch (nestedError) {
					this._logger.warn(`Cannot dispatch error event: ${nestedError.stack || nestedError}`);
				}
				return e;
			};
			this.downloadPromise = this.doDownloadUpdate({
				updateInfoAndProvider,
				requestHeaders: this.computeRequestHeaders(updateInfoAndProvider.provider),
				cancellationToken,
				disableWebInstaller: this.disableWebInstaller,
				disableDifferentialDownload: this.disableDifferentialDownload
			}).catch((e) => {
				throw errorHandler(e);
			}).finally(() => {
				this.downloadPromise = null;
			});
			return this.downloadPromise;
		}
		dispatchError(e) {
			this.emit("error", e, (e.stack || e).toString());
		}
		dispatchUpdateDownloaded(event) {
			this.emit(types_1.UPDATE_DOWNLOADED, event);
		}
		async loadUpdateConfig() {
			if (this._appUpdateConfigPath == null) this._appUpdateConfigPath = this.app.appUpdateConfigPath;
			return (0, js_yaml_1.load)(await (0, fs_extra_1.readFile)(this._appUpdateConfigPath, "utf-8"));
		}
		computeRequestHeaders(provider) {
			const fileExtraDownloadHeaders = provider.fileExtraDownloadHeaders;
			if (fileExtraDownloadHeaders != null) {
				const requestHeaders = this.requestHeaders;
				return requestHeaders == null ? fileExtraDownloadHeaders : {
					...fileExtraDownloadHeaders,
					...requestHeaders
				};
			}
			return this.computeFinalHeaders({ accept: "*/*" });
		}
		async getOrCreateStagingUserId() {
			const file = path$15.join(this.app.userDataPath, ".updaterId");
			try {
				const id = await (0, fs_extra_1.readFile)(file, "utf-8");
				if (builder_util_runtime_1.UUID.check(id)) return id;
				else this._logger.warn(`Staging user id file exists, but content was invalid: ${id}`);
			} catch (e) {
				if (e.code !== "ENOENT") this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${e}`);
			}
			const id = builder_util_runtime_1.UUID.v5((0, crypto_1$1.randomBytes)(4096), builder_util_runtime_1.UUID.OID);
			this._logger.info(`Generated new staging user ID: ${id}`);
			try {
				await (0, fs_extra_1.outputFile)(file, id);
			} catch (e) {
				this._logger.warn(`Couldn't write out staging user ID: ${e}`);
			}
			return id;
		}
		/** @internal */
		get isAddNoCacheQuery() {
			const headers = this.requestHeaders;
			if (headers == null) return true;
			for (const headerName of Object.keys(headers)) {
				const s = headerName.toLowerCase();
				if (s === "authorization" || s === "private-token") return false;
			}
			return true;
		}
		async getOrCreateDownloadHelper() {
			let result = this.downloadedUpdateHelper;
			if (result == null) {
				const dirName = (await this.configOnDisk.value).updaterCacheDirName;
				const logger = this._logger;
				if (dirName == null) logger.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
				const cacheDir = path$15.join(this.app.baseCachePath, dirName || this.app.name);
				if (logger.debug != null) logger.debug(`updater cache dir: ${cacheDir}`);
				result = new DownloadedUpdateHelper_1.DownloadedUpdateHelper(cacheDir);
				this.downloadedUpdateHelper = result;
			}
			return result;
		}
		async executeDownload(taskOptions) {
			const fileInfo = taskOptions.fileInfo;
			const downloadOptions = {
				headers: taskOptions.downloadUpdateOptions.requestHeaders,
				cancellationToken: taskOptions.downloadUpdateOptions.cancellationToken,
				sha2: fileInfo.info.sha2,
				sha512: fileInfo.info.sha512
			};
			if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
			const updateInfo = taskOptions.downloadUpdateOptions.updateInfoAndProvider.info;
			const version = updateInfo.version;
			const packageInfo = fileInfo.packageInfo;
			function getCacheUpdateFileName() {
				const urlPath = decodeURIComponent(taskOptions.fileInfo.url.pathname);
				if (urlPath.toLowerCase().endsWith(`.${taskOptions.fileExtension.toLowerCase()}`)) return path$15.basename(urlPath);
				else return taskOptions.fileInfo.info.url;
			}
			const downloadedUpdateHelper = await this.getOrCreateDownloadHelper();
			const cacheDir = downloadedUpdateHelper.cacheDirForPendingUpdate;
			await (0, fs_extra_1.mkdir)(cacheDir, { recursive: true });
			const updateFileName = getCacheUpdateFileName();
			let updateFile = path$15.join(cacheDir, updateFileName);
			const packageFile = packageInfo == null ? null : path$15.join(cacheDir, `package-${version}${path$15.extname(packageInfo.path) || ".7z"}`);
			const done = async (isSaveCache) => {
				await downloadedUpdateHelper.setDownloadedFile(updateFile, packageFile, updateInfo, fileInfo, updateFileName, isSaveCache);
				await taskOptions.done({
					...updateInfo,
					downloadedFile: updateFile
				});
				const currentBlockMapFile = path$15.join(cacheDir, "current.blockmap");
				if (await (0, fs_extra_1.pathExists)(currentBlockMapFile)) await (0, fs_extra_1.copyFile)(currentBlockMapFile, path$15.join(downloadedUpdateHelper.cacheDir, "current.blockmap"));
				return packageFile == null ? [updateFile] : [updateFile, packageFile];
			};
			const log = this._logger;
			const cachedUpdateFile = await downloadedUpdateHelper.validateDownloadedPath(updateFile, updateInfo, fileInfo, log);
			if (cachedUpdateFile != null) {
				updateFile = cachedUpdateFile;
				return await done(false);
			}
			const removeFileIfAny = async () => {
				await downloadedUpdateHelper.clear().catch(() => {});
				return await (0, fs_extra_1.unlink)(updateFile).catch(() => {});
			};
			const tempUpdateFile = await (0, DownloadedUpdateHelper_1.createTempUpdateFile)(`temp-${updateFileName}`, cacheDir, log);
			try {
				await taskOptions.task(tempUpdateFile, downloadOptions, packageFile, removeFileIfAny);
				await (0, builder_util_runtime_1.retry)(() => (0, fs_extra_1.rename)(tempUpdateFile, updateFile), {
					retries: 60,
					interval: 500,
					shouldRetry: (error) => {
						if (error instanceof Error && /^EBUSY:/.test(error.message)) return true;
						log.warn(`Cannot rename temp file to final file: ${error.message || error.stack}`);
						return false;
					}
				});
			} catch (e) {
				await removeFileIfAny();
				if (e instanceof builder_util_runtime_1.CancellationError) {
					log.info("cancelled");
					this.emit("update-cancelled", updateInfo);
				}
				throw e;
			}
			log.info(`New version ${version} has been downloaded to ${updateFile}`);
			return await done(true);
		}
		async differentialDownloadInstaller(fileInfo, downloadUpdateOptions, installerPath, provider, oldInstallerFileName) {
			try {
				if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload) return true;
				const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
				const blockmapFileUrls = await provider.getBlockMapFiles(fileInfo.url, this.app.version, downloadUpdateOptions.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
				this._logger.info(`Download block maps (old: "${blockmapFileUrls[0]}", new: ${blockmapFileUrls[1]})`);
				const downloadBlockMap = async (url) => {
					const data = await this.httpExecutor.downloadToBuffer(url, {
						headers: downloadUpdateOptions.requestHeaders,
						cancellationToken: downloadUpdateOptions.cancellationToken
					});
					if (data == null || data.length === 0) throw new Error(`Blockmap "${url.href}" is empty`);
					try {
						return JSON.parse((0, zlib_1$1.gunzipSync)(data).toString());
					} catch (e) {
						throw new Error(`Cannot parse blockmap "${url.href}", error: ${e}`);
					}
				};
				const downloadOptions = {
					newUrl: fileInfo.url,
					oldFile: path$15.join(this.downloadedUpdateHelper.cacheDir, oldInstallerFileName),
					logger: this._logger,
					newFile: installerPath,
					isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
					requestHeaders: downloadUpdateOptions.requestHeaders,
					cancellationToken: downloadUpdateOptions.cancellationToken
				};
				if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
				const saveBlockMapToCacheDir = async (blockMapData, cacheDir) => {
					const blockMapFile = path$15.join(cacheDir, "current.blockmap");
					await (0, fs_extra_1.outputFile)(blockMapFile, (0, zlib_1$1.gzipSync)(JSON.stringify(blockMapData)));
				};
				const getBlockMapFromCacheDir = async (cacheDir) => {
					const blockMapFile = path$15.join(cacheDir, "current.blockmap");
					try {
						if (await (0, fs_extra_1.pathExists)(blockMapFile)) return JSON.parse((0, zlib_1$1.gunzipSync)(await (0, fs_extra_1.readFile)(blockMapFile)).toString());
					} catch (e) {
						this._logger.warn(`Cannot parse blockmap "${blockMapFile}", error: ${e}`);
					}
					return null;
				};
				const newBlockMapData = await downloadBlockMap(blockmapFileUrls[1]);
				await saveBlockMapToCacheDir(newBlockMapData, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
				let oldBlockMapData = await getBlockMapFromCacheDir(this.downloadedUpdateHelper.cacheDir);
				if (oldBlockMapData == null) oldBlockMapData = await downloadBlockMap(blockmapFileUrls[0]);
				await new GenericDifferentialDownloader_1.GenericDifferentialDownloader(fileInfo.info, this.httpExecutor, downloadOptions).download(oldBlockMapData, newBlockMapData);
				return false;
			} catch (e) {
				this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
				if (this._testOnlyOptions != null) throw e;
				return true;
			}
		}
	};
	function hasPrereleaseComponents(version) {
		const versionPrereleaseComponent = (0, semver_1.prerelease)(version);
		return versionPrereleaseComponent != null && versionPrereleaseComponent.length > 0;
	}
	/** @private */
	var NoOpLogger = class {
		info(message) {}
		warn(message) {}
		error(message) {}
	};
	exports.NoOpLogger = NoOpLogger;
}));
var require_BaseUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BaseUpdater = void 0;
	var child_process_1$3 = require("child_process");
	var AppUpdater_1 = require_AppUpdater();
	var BaseUpdater = class extends AppUpdater_1.AppUpdater {
		constructor(options, app) {
			super(options, app);
			this.quitAndInstallCalled = false;
			this.quitHandlerAdded = false;
		}
		quitAndInstall(isSilent = false, isForceRunAfter = false) {
			this._logger.info(`Install on explicit quitAndInstall`);
			if (this.install(isSilent, isSilent ? isForceRunAfter : this.autoRunAppAfterInstall)) setImmediate(() => {
				require("electron").autoUpdater.emit("before-quit-for-update");
				this.app.quit();
			});
			else this.quitAndInstallCalled = false;
		}
		executeDownload(taskOptions) {
			return super.executeDownload({
				...taskOptions,
				done: (event) => {
					this.dispatchUpdateDownloaded(event);
					this.addQuitHandler();
					return Promise.resolve();
				}
			});
		}
		get installerPath() {
			return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
		}
		install(isSilent = false, isForceRunAfter = false) {
			if (this.quitAndInstallCalled) {
				this._logger.warn("install call ignored: quitAndInstallCalled is set to true");
				return false;
			}
			const downloadedUpdateHelper = this.downloadedUpdateHelper;
			const installerPath = this.installerPath;
			const downloadedFileInfo = downloadedUpdateHelper == null ? null : downloadedUpdateHelper.downloadedFileInfo;
			if (installerPath == null || downloadedFileInfo == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			this.quitAndInstallCalled = true;
			try {
				this._logger.info(`Install: isSilent: ${isSilent}, isForceRunAfter: ${isForceRunAfter}`);
				return this.doInstall({
					isSilent,
					isForceRunAfter,
					isAdminRightsRequired: downloadedFileInfo.isAdminRightsRequired
				});
			} catch (e) {
				this.dispatchError(e);
				return false;
			}
		}
		addQuitHandler() {
			if (this.quitHandlerAdded || !this.autoInstallOnAppQuit) return;
			this.quitHandlerAdded = true;
			this.app.onQuit((exitCode) => {
				if (this.quitAndInstallCalled) {
					this._logger.info("Update installer has already been triggered. Quitting application.");
					return;
				}
				if (!this.autoInstallOnAppQuit) {
					this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
					return;
				}
				if (exitCode !== 0) {
					this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${exitCode}`);
					return;
				}
				this._logger.info("Auto install update on quit");
				this.install(true, false);
			});
		}
		spawnSyncLog(cmd, args = [], env = {}) {
			this._logger.info(`Executing: ${cmd} with args: ${args}`);
			const { error, status, stdout, stderr } = (0, child_process_1$3.spawnSync)(cmd, args, {
				env: {
					...process.env,
					...env
				},
				encoding: "utf-8",
				shell: true
			});
			if (error != null) {
				this._logger.error(stderr);
				throw error;
			} else if (status != null && status !== 0) {
				this._logger.error(stderr);
				throw new Error(`Command ${cmd} exited with code ${status}`);
			}
			return stdout.trim();
		}
		/**
		* This handles both node 8 and node 10 way of emitting error when spawning a process
		*   - node 8: Throws the error
		*   - node 10: Emit the error(Need to listen with on)
		*/
		async spawnLog(cmd, args = [], env = void 0, stdio = "ignore") {
			this._logger.info(`Executing: ${cmd} with args: ${args}`);
			return new Promise((resolve, reject) => {
				try {
					const params = {
						stdio,
						env,
						detached: true
					};
					const p = (0, child_process_1$3.spawn)(cmd, args, params);
					p.on("error", (error) => {
						reject(error);
					});
					p.unref();
					if (p.pid !== void 0) resolve(true);
				} catch (error) {
					reject(error);
				}
			});
		}
	};
	exports.BaseUpdater = BaseUpdater;
}));
var require_FileWithEmbeddedBlockMapDifferentialDownloader = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
	var fs_extra_1 = require_lib$9();
	var DifferentialDownloader_1 = require_DifferentialDownloader();
	var zlib_1 = require("zlib");
	var FileWithEmbeddedBlockMapDifferentialDownloader = class extends DifferentialDownloader_1.DifferentialDownloader {
		async download() {
			const packageInfo = this.blockAwareFileInfo;
			const fileSize = packageInfo.size;
			const offset = fileSize - (packageInfo.blockMapSize + 4);
			this.fileMetadataBuffer = await this.readRemoteBytes(offset, fileSize - 1);
			const newBlockMap = readBlockMap(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
			await this.doDownload(await readEmbeddedBlockMapData(this.options.oldFile), newBlockMap);
		}
	};
	exports.FileWithEmbeddedBlockMapDifferentialDownloader = FileWithEmbeddedBlockMapDifferentialDownloader;
	function readBlockMap(data) {
		return JSON.parse((0, zlib_1.inflateRawSync)(data).toString());
	}
	async function readEmbeddedBlockMapData(file) {
		const fd = await (0, fs_extra_1.open)(file, "r");
		try {
			const fileSize = (await (0, fs_extra_1.fstat)(fd)).size;
			const sizeBuffer = Buffer.allocUnsafe(4);
			await (0, fs_extra_1.read)(fd, sizeBuffer, 0, sizeBuffer.length, fileSize - sizeBuffer.length);
			const dataBuffer = Buffer.allocUnsafe(sizeBuffer.readUInt32BE(0));
			await (0, fs_extra_1.read)(fd, dataBuffer, 0, dataBuffer.length, fileSize - sizeBuffer.length - dataBuffer.length);
			await (0, fs_extra_1.close)(fd);
			return readBlockMap(dataBuffer);
		} catch (e) {
			await (0, fs_extra_1.close)(fd);
			throw e;
		}
	}
}));
var require_AppImageUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AppImageUpdater = void 0;
	var builder_util_runtime_1 = require_out();
	var child_process_1$2 = require("child_process");
	var fs_extra_1 = require_lib$9();
	var fs_1$1 = require("fs");
	var path$14 = require("path");
	var BaseUpdater_1 = require_BaseUpdater();
	var FileWithEmbeddedBlockMapDifferentialDownloader_1 = require_FileWithEmbeddedBlockMapDifferentialDownloader();
	var Provider_1 = require_Provider();
	var types_1 = require_types$2();
	var AppImageUpdater = class extends BaseUpdater_1.BaseUpdater {
		constructor(options, app) {
			super(options, app);
		}
		isUpdaterActive() {
			if (process.env["APPIMAGE"] == null && !this.forceDevUpdateConfig) {
				if (process.env["SNAP"] == null) this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage");
				else this._logger.info("SNAP env is defined, updater is disabled");
				return false;
			}
			return super.isUpdaterActive();
		}
		/*** @private */
		doDownloadUpdate(downloadUpdateOptions) {
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "AppImage", [
				"rpm",
				"deb",
				"pacman"
			]);
			return this.executeDownload({
				fileExtension: "AppImage",
				fileInfo,
				downloadUpdateOptions,
				task: async (updateFile, downloadOptions) => {
					const oldFile = process.env["APPIMAGE"];
					if (oldFile == null) throw (0, builder_util_runtime_1.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
					if (downloadUpdateOptions.disableDifferentialDownload || await this.downloadDifferential(fileInfo, oldFile, updateFile, provider, downloadUpdateOptions)) await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
					await (0, fs_extra_1.chmod)(updateFile, 493);
				}
			});
		}
		async downloadDifferential(fileInfo, oldFile, updateFile, provider, downloadUpdateOptions) {
			try {
				const downloadOptions = {
					newUrl: fileInfo.url,
					oldFile,
					logger: this._logger,
					newFile: updateFile,
					isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
					requestHeaders: downloadUpdateOptions.requestHeaders,
					cancellationToken: downloadUpdateOptions.cancellationToken
				};
				if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
				await new FileWithEmbeddedBlockMapDifferentialDownloader_1.FileWithEmbeddedBlockMapDifferentialDownloader(fileInfo.info, this.httpExecutor, downloadOptions).download();
				return false;
			} catch (e) {
				this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
				return process.platform === "linux";
			}
		}
		doInstall(options) {
			const appImageFile = process.env["APPIMAGE"];
			if (appImageFile == null) throw (0, builder_util_runtime_1.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
			(0, fs_1$1.unlinkSync)(appImageFile);
			let destination;
			const existingBaseName = path$14.basename(appImageFile);
			const installerPath = this.installerPath;
			if (installerPath == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			if (path$14.basename(installerPath) === existingBaseName || !/\d+\.\d+\.\d+/.test(existingBaseName)) destination = appImageFile;
			else destination = path$14.join(path$14.dirname(appImageFile), path$14.basename(installerPath));
			(0, child_process_1$2.execFileSync)("mv", [
				"-f",
				installerPath,
				destination
			]);
			if (destination !== appImageFile) this.emit("appimage-filename-updated", destination);
			const env = {
				...process.env,
				APPIMAGE_SILENT_INSTALL: "true"
			};
			if (options.isForceRunAfter) this.spawnLog(destination, [], env);
			else {
				env.APPIMAGE_EXIT_AFTER_INSTALL = "true";
				(0, child_process_1$2.execFileSync)(destination, [], { env });
			}
			return true;
		}
	};
	exports.AppImageUpdater = AppImageUpdater;
}));
var require_LinuxUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LinuxUpdater = void 0;
	var BaseUpdater_1 = require_BaseUpdater();
	var LinuxUpdater = class extends BaseUpdater_1.BaseUpdater {
		constructor(options, app) {
			super(options, app);
		}
		/**
		* Returns true if the current process is running as root.
		*/
		isRunningAsRoot() {
			var _a;
			return ((_a = process.getuid) === null || _a === void 0 ? void 0 : _a.call(process)) === 0;
		}
		/**
		* Sanitizies the installer path for using with command line tools.
		*/
		get installerPath() {
			var _a, _b;
			return (_b = (_a = super.installerPath) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && _b !== void 0 ? _b : null;
		}
		runCommandWithSudoIfNeeded(commandWithArgs) {
			if (this.isRunningAsRoot()) {
				this._logger.info("Running as root, no need to use sudo");
				return this.spawnSyncLog(commandWithArgs[0], commandWithArgs.slice(1));
			}
			const { name } = this.app;
			const installComment = `"${name} would like to update"`;
			const sudo = this.sudoWithArgs(installComment);
			this._logger.info(`Running as non-root user, using sudo to install: ${sudo}`);
			let wrapper = `"`;
			if (/pkexec/i.test(sudo[0]) || sudo[0] === "sudo") wrapper = "";
			return this.spawnSyncLog(sudo[0], [
				...sudo.length > 1 ? sudo.slice(1) : [],
				`${wrapper}/bin/bash`,
				"-c",
				`'${commandWithArgs.join(" ")}'${wrapper}`
			]);
		}
		sudoWithArgs(installComment) {
			const sudo = this.determineSudoCommand();
			const command = [sudo];
			if (/kdesudo/i.test(sudo)) {
				command.push("--comment", installComment);
				command.push("-c");
			} else if (/gksudo/i.test(sudo)) command.push("--message", installComment);
			else if (/pkexec/i.test(sudo)) command.push("--disable-internal-agent");
			return command;
		}
		hasCommand(cmd) {
			try {
				this.spawnSyncLog(`command`, ["-v", cmd]);
				return true;
			} catch {
				return false;
			}
		}
		determineSudoCommand() {
			for (const sudo of [
				"gksudo",
				"kdesudo",
				"pkexec",
				"beesu"
			]) if (this.hasCommand(sudo)) return sudo;
			return "sudo";
		}
		/**
		* Detects the package manager to use based on the available commands.
		* Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
		* If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
		* Otherwise, it checks for the presence of the specified package manager commands in the order provided.
		* @param pms - An array of package manager commands to check for, in priority order.
		* @returns The detected package manager command or "unknown" if none are found.
		*/
		detectPackageManager(pms) {
			var _a;
			const pmOverride = (_a = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || _a === void 0 ? void 0 : _a.trim();
			if (pmOverride) return pmOverride;
			for (const pm of pms) if (this.hasCommand(pm)) return pm;
			this._logger.warn(`No package manager found in the list: ${pms.join(", ")}. Defaulting to the first one: ${pms[0]}`);
			return pms[0];
		}
	};
	exports.LinuxUpdater = LinuxUpdater;
}));
var require_DebUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DebUpdater = void 0;
	var Provider_1 = require_Provider();
	var types_1 = require_types$2();
	var LinuxUpdater_1 = require_LinuxUpdater();
	exports.DebUpdater = class DebUpdater extends LinuxUpdater_1.LinuxUpdater {
		constructor(options, app) {
			super(options, app);
		}
		/*** @private */
		doDownloadUpdate(downloadUpdateOptions) {
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "deb", [
				"AppImage",
				"rpm",
				"pacman"
			]);
			return this.executeDownload({
				fileExtension: "deb",
				fileInfo,
				downloadUpdateOptions,
				task: async (updateFile, downloadOptions) => {
					if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
					await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
				}
			});
		}
		doInstall(options) {
			const installerPath = this.installerPath;
			if (installerPath == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			if (!this.hasCommand("dpkg") && !this.hasCommand("apt")) {
				this.dispatchError(/* @__PURE__ */ new Error("Neither dpkg nor apt command found. Cannot install .deb package."));
				return false;
			}
			const packageManager = this.detectPackageManager(["dpkg", "apt"]);
			try {
				DebUpdater.installWithCommandRunner(packageManager, installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
			} catch (error) {
				this.dispatchError(error);
				return false;
			}
			if (options.isForceRunAfter) this.app.relaunch();
			return true;
		}
		static installWithCommandRunner(packageManager, installerPath, commandRunner, logger) {
			var _a;
			if (packageManager === "dpkg") try {
				commandRunner([
					"dpkg",
					"-i",
					installerPath
				]);
			} catch (error) {
				logger.warn((_a = error.message) !== null && _a !== void 0 ? _a : error);
				logger.warn("dpkg installation failed, trying to fix broken dependencies with apt-get");
				commandRunner([
					"apt-get",
					"install",
					"-f",
					"-y"
				]);
			}
			else if (packageManager === "apt") {
				logger.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured.");
				commandRunner([
					"apt",
					"install",
					"-y",
					"--allow-unauthenticated",
					"--allow-downgrades",
					"--allow-change-held-packages",
					installerPath
				]);
			} else throw new Error(`Package manager ${packageManager} not supported`);
		}
	};
}));
var require_PacmanUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PacmanUpdater = void 0;
	var types_1 = require_types$2();
	var Provider_1 = require_Provider();
	var LinuxUpdater_1 = require_LinuxUpdater();
	exports.PacmanUpdater = class PacmanUpdater extends LinuxUpdater_1.LinuxUpdater {
		constructor(options, app) {
			super(options, app);
		}
		/*** @private */
		doDownloadUpdate(downloadUpdateOptions) {
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "pacman", [
				"AppImage",
				"deb",
				"rpm"
			]);
			return this.executeDownload({
				fileExtension: "pacman",
				fileInfo,
				downloadUpdateOptions,
				task: async (updateFile, downloadOptions) => {
					if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
					await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
				}
			});
		}
		doInstall(options) {
			const installerPath = this.installerPath;
			if (installerPath == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			try {
				PacmanUpdater.installWithCommandRunner(installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
			} catch (error) {
				this.dispatchError(error);
				return false;
			}
			if (options.isForceRunAfter) this.app.relaunch();
			return true;
		}
		static installWithCommandRunner(installerPath, commandRunner, logger) {
			var _a;
			try {
				commandRunner([
					"pacman",
					"-U",
					"--noconfirm",
					installerPath
				]);
			} catch (error) {
				logger.warn((_a = error.message) !== null && _a !== void 0 ? _a : error);
				logger.warn("pacman installation failed, attempting to update package database and retry");
				try {
					commandRunner([
						"pacman",
						"-Sy",
						"--noconfirm"
					]);
					commandRunner([
						"pacman",
						"-U",
						"--noconfirm",
						installerPath
					]);
				} catch (retryError) {
					logger.error("Retry after pacman -Sy failed");
					throw retryError;
				}
			}
		}
	};
}));
var require_RpmUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RpmUpdater = void 0;
	var types_1 = require_types$2();
	var Provider_1 = require_Provider();
	var LinuxUpdater_1 = require_LinuxUpdater();
	exports.RpmUpdater = class RpmUpdater extends LinuxUpdater_1.LinuxUpdater {
		constructor(options, app) {
			super(options, app);
		}
		/*** @private */
		doDownloadUpdate(downloadUpdateOptions) {
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "rpm", [
				"AppImage",
				"deb",
				"pacman"
			]);
			return this.executeDownload({
				fileExtension: "rpm",
				fileInfo,
				downloadUpdateOptions,
				task: async (updateFile, downloadOptions) => {
					if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
					await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
				}
			});
		}
		doInstall(options) {
			const installerPath = this.installerPath;
			if (installerPath == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			const packageManager = this.detectPackageManager([
				"zypper",
				"dnf",
				"yum",
				"rpm"
			]);
			try {
				RpmUpdater.installWithCommandRunner(packageManager, installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
			} catch (error) {
				this.dispatchError(error);
				return false;
			}
			if (options.isForceRunAfter) this.app.relaunch();
			return true;
		}
		static installWithCommandRunner(packageManager, installerPath, commandRunner, logger) {
			if (packageManager === "zypper") return commandRunner([
				"zypper",
				"--non-interactive",
				"--no-refresh",
				"install",
				"--allow-unsigned-rpm",
				"-f",
				installerPath
			]);
			if (packageManager === "dnf") return commandRunner([
				"dnf",
				"install",
				"--nogpgcheck",
				"-y",
				installerPath
			]);
			if (packageManager === "yum") return commandRunner([
				"yum",
				"install",
				"--nogpgcheck",
				"-y",
				installerPath
			]);
			if (packageManager === "rpm") {
				logger.warn("Installing with rpm only (no dependency resolution).");
				return commandRunner([
					"rpm",
					"-Uvh",
					"--replacepkgs",
					"--replacefiles",
					"--nodeps",
					installerPath
				]);
			}
			throw new Error(`Package manager ${packageManager} not supported`);
		}
	};
}));
var require_MacUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MacUpdater = void 0;
	var builder_util_runtime_1 = require_out();
	var fs_extra_1 = require_lib$9();
	var fs_1 = require("fs");
	var path$13 = require("path");
	var http_1 = require("http");
	var AppUpdater_1 = require_AppUpdater();
	var Provider_1 = require_Provider();
	var child_process_1$1 = require("child_process");
	var crypto_1 = require("crypto");
	var MacUpdater = class extends AppUpdater_1.AppUpdater {
		constructor(options, app) {
			super(options, app);
			this.nativeUpdater = require("electron").autoUpdater;
			this.squirrelDownloadedUpdate = false;
			this.nativeUpdater.on("error", (it) => {
				this._logger.warn(it);
				this.emit("error", it);
			});
			this.nativeUpdater.on("update-downloaded", () => {
				this.squirrelDownloadedUpdate = true;
				this.debug("nativeUpdater.update-downloaded");
			});
		}
		debug(message) {
			if (this._logger.debug != null) this._logger.debug(message);
		}
		closeServerIfExists() {
			if (this.server) {
				this.debug("Closing proxy server");
				this.server.close((err) => {
					if (err) this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
				});
			}
		}
		async doDownloadUpdate(downloadUpdateOptions) {
			let files = downloadUpdateOptions.updateInfoAndProvider.provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info);
			const log = this._logger;
			const sysctlRosettaInfoKey = "sysctl.proc_translated";
			let isRosetta = false;
			try {
				this.debug("Checking for macOS Rosetta environment");
				isRosetta = (0, child_process_1$1.execFileSync)("sysctl", [sysctlRosettaInfoKey], { encoding: "utf8" }).includes(`${sysctlRosettaInfoKey}: 1`);
				log.info(`Checked for macOS Rosetta environment (isRosetta=${isRosetta})`);
			} catch (e) {
				log.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${e}`);
			}
			let isArm64Mac = false;
			try {
				this.debug("Checking for arm64 in uname");
				const isArm = (0, child_process_1$1.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
				log.info(`Checked 'uname -a': arm64=${isArm}`);
				isArm64Mac = isArm64Mac || isArm;
			} catch (e) {
				log.warn(`uname shell command to check for arm64 failed: ${e}`);
			}
			isArm64Mac = isArm64Mac || process.arch === "arm64" || isRosetta;
			const isArm64 = (file) => {
				var _a;
				return file.url.pathname.includes("arm64") || ((_a = file.info.url) === null || _a === void 0 ? void 0 : _a.includes("arm64"));
			};
			if (isArm64Mac && files.some(isArm64)) files = files.filter((file) => isArm64Mac === isArm64(file));
			else files = files.filter((file) => !isArm64(file));
			const zipFileInfo = (0, Provider_1.findFile)(files, "zip", ["pkg", "dmg"]);
			if (zipFileInfo == null) throw (0, builder_util_runtime_1.newError)(`ZIP file not provided: ${(0, builder_util_runtime_1.safeStringifyJson)(files)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const CURRENT_MAC_APP_ZIP_FILE_NAME = "update.zip";
			return this.executeDownload({
				fileExtension: "zip",
				fileInfo: zipFileInfo,
				downloadUpdateOptions,
				task: async (destinationFile, downloadOptions) => {
					const cachedUpdateFilePath = path$13.join(this.downloadedUpdateHelper.cacheDir, CURRENT_MAC_APP_ZIP_FILE_NAME);
					const canDifferentialDownload = () => {
						if (!(0, fs_extra_1.pathExistsSync)(cachedUpdateFilePath)) {
							log.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download");
							return false;
						}
						return !downloadUpdateOptions.disableDifferentialDownload;
					};
					let differentialDownloadFailed = true;
					if (canDifferentialDownload()) differentialDownloadFailed = await this.differentialDownloadInstaller(zipFileInfo, downloadUpdateOptions, destinationFile, provider, CURRENT_MAC_APP_ZIP_FILE_NAME);
					if (differentialDownloadFailed) await this.httpExecutor.download(zipFileInfo.url, destinationFile, downloadOptions);
				},
				done: async (event) => {
					if (!downloadUpdateOptions.disableDifferentialDownload) try {
						const cachedUpdateFilePath = path$13.join(this.downloadedUpdateHelper.cacheDir, CURRENT_MAC_APP_ZIP_FILE_NAME);
						await (0, fs_extra_1.copyFile)(event.downloadedFile, cachedUpdateFilePath);
					} catch (error) {
						this._logger.warn(`Unable to copy file for caching for future differential downloads: ${error.message}`);
					}
					return this.updateDownloaded(zipFileInfo, event);
				}
			});
		}
		async updateDownloaded(zipFileInfo, event) {
			var _a;
			const downloadedFile = event.downloadedFile;
			const updateFileSize = (_a = zipFileInfo.info.size) !== null && _a !== void 0 ? _a : (await (0, fs_extra_1.stat)(downloadedFile)).size;
			const log = this._logger;
			const logContext = `fileToProxy=${zipFileInfo.url.href}`;
			this.closeServerIfExists();
			this.debug(`Creating proxy server for native Squirrel.Mac (${logContext})`);
			this.server = (0, http_1.createServer)();
			this.debug(`Proxy server for native Squirrel.Mac is created (${logContext})`);
			this.server.on("close", () => {
				log.info(`Proxy server for native Squirrel.Mac is closed (${logContext})`);
			});
			const getServerUrl = (s) => {
				const address = s.address();
				if (typeof address === "string") return address;
				return `http://127.0.0.1:${address === null || address === void 0 ? void 0 : address.port}`;
			};
			return await new Promise((resolve, reject) => {
				const pass = (0, crypto_1.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
				const authInfo = Buffer.from(`autoupdater:${pass}`, "ascii");
				const fileUrl = `/${(0, crypto_1.randomBytes)(64).toString("hex")}.zip`;
				this.server.on("request", (request, response) => {
					const requestUrl = request.url;
					log.info(`${requestUrl} requested`);
					if (requestUrl === "/") {
						if (!request.headers.authorization || request.headers.authorization.indexOf("Basic ") === -1) {
							response.statusCode = 401;
							response.statusMessage = "Invalid Authentication Credentials";
							response.end();
							log.warn("No authenthication info");
							return;
						}
						const base64Credentials = request.headers.authorization.split(" ")[1];
						const [username, password] = Buffer.from(base64Credentials, "base64").toString("ascii").split(":");
						if (username !== "autoupdater" || password !== pass) {
							response.statusCode = 401;
							response.statusMessage = "Invalid Authentication Credentials";
							response.end();
							log.warn("Invalid authenthication credentials");
							return;
						}
						const data = Buffer.from(`{ "url": "${getServerUrl(this.server)}${fileUrl}" }`);
						response.writeHead(200, {
							"Content-Type": "application/json",
							"Content-Length": data.length
						});
						response.end(data);
						return;
					}
					if (!requestUrl.startsWith(fileUrl)) {
						log.warn(`${requestUrl} requested, but not supported`);
						response.writeHead(404);
						response.end();
						return;
					}
					log.info(`${fileUrl} requested by Squirrel.Mac, pipe ${downloadedFile}`);
					let errorOccurred = false;
					response.on("finish", () => {
						if (!errorOccurred) {
							this.nativeUpdater.removeListener("error", reject);
							resolve([]);
						}
					});
					const readStream = (0, fs_1.createReadStream)(downloadedFile);
					readStream.on("error", (error) => {
						try {
							response.end();
						} catch (e) {
							log.warn(`cannot end response: ${e}`);
						}
						errorOccurred = true;
						this.nativeUpdater.removeListener("error", reject);
						reject(/* @__PURE__ */ new Error(`Cannot pipe "${downloadedFile}": ${error}`));
					});
					response.writeHead(200, {
						"Content-Type": "application/zip",
						"Content-Length": updateFileSize
					});
					readStream.pipe(response);
				});
				this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${logContext})`);
				this.server.listen(0, "127.0.0.1", () => {
					this.debug(`Proxy server for native Squirrel.Mac is listening (address=${getServerUrl(this.server)}, ${logContext})`);
					this.nativeUpdater.setFeedURL({
						url: getServerUrl(this.server),
						headers: {
							"Cache-Control": "no-cache",
							Authorization: `Basic ${authInfo.toString("base64")}`
						}
					});
					this.dispatchUpdateDownloaded(event);
					if (this.autoInstallOnAppQuit) {
						this.nativeUpdater.once("error", reject);
						this.nativeUpdater.checkForUpdates();
					} else resolve([]);
				});
			});
		}
		handleUpdateDownloaded() {
			if (this.autoRunAppAfterInstall) this.nativeUpdater.quitAndInstall();
			else this.app.quit();
			this.closeServerIfExists();
		}
		quitAndInstall() {
			if (this.squirrelDownloadedUpdate) this.handleUpdateDownloaded();
			else {
				this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded());
				if (!this.autoInstallOnAppQuit)
 /**
				* If this was not `true` previously then MacUpdater.doDownloadUpdate()
				* would not actually initiate the downloading by electron's autoUpdater
				*/
				this.nativeUpdater.checkForUpdates();
			}
		}
	};
	exports.MacUpdater = MacUpdater;
}));
var require_windowsExecutableCodeSignatureVerifier = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.verifySignature = verifySignature;
	var builder_util_runtime_1 = require_out();
	var child_process_1 = require("child_process");
	var os$2 = require("os");
	var path$12 = require("path");
	function preparePowerShellExec(command, timeout) {
		return [
			`set "PSModulePath=" & chcp 65001 >NUL & powershell.exe`,
			[
				"-NoProfile",
				"-NonInteractive",
				"-InputFormat",
				"None",
				"-Command",
				command
			],
			{
				shell: true,
				timeout
			}
		];
	}
	function verifySignature(publisherNames, unescapedTempUpdateFile, logger) {
		return new Promise((resolve, reject) => {
			const tempUpdateFile = unescapedTempUpdateFile.replace(/'/g, "''");
			logger.info(`Verifying signature ${tempUpdateFile}`);
			(0, child_process_1.execFile)(...preparePowerShellExec(`"Get-AuthenticodeSignature -LiteralPath '${tempUpdateFile}' | ConvertTo-Json -Compress"`, 2e4), (error, stdout, stderr) => {
				var _a;
				try {
					if (error != null || stderr) {
						handleError(logger, error, stderr, reject);
						resolve(null);
						return;
					}
					const data = parseOut(stdout);
					if (data.Status === 0) {
						try {
							const normlaizedUpdateFilePath = path$12.normalize(data.Path);
							const normalizedTempUpdateFile = path$12.normalize(unescapedTempUpdateFile);
							logger.info(`LiteralPath: ${normlaizedUpdateFilePath}. Update Path: ${normalizedTempUpdateFile}`);
							if (normlaizedUpdateFilePath !== normalizedTempUpdateFile) {
								handleError(logger, /* @__PURE__ */ new Error(`LiteralPath of ${normlaizedUpdateFilePath} is different than ${normalizedTempUpdateFile}`), stderr, reject);
								resolve(null);
								return;
							}
						} catch (error) {
							logger.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(_a = error.message) !== null && _a !== void 0 ? _a : error.stack}`);
						}
						const subject = (0, builder_util_runtime_1.parseDn)(data.SignerCertificate.Subject);
						let match = false;
						for (const name of publisherNames) {
							const dn = (0, builder_util_runtime_1.parseDn)(name);
							if (dn.size) match = Array.from(dn.keys()).every((key) => {
								return dn.get(key) === subject.get(key);
							});
							else if (name === subject.get("CN")) {
								logger.warn(`Signature validated using only CN ${name}. Please add your full Distinguished Name (DN) to publisherNames configuration`);
								match = true;
							}
							if (match) {
								resolve(null);
								return;
							}
						}
					}
					const result = `publisherNames: ${publisherNames.join(" | ")}, raw info: ` + JSON.stringify(data, (name, value) => name === "RawData" ? void 0 : value, 2);
					logger.warn(`Sign verification failed, installer signed with incorrect certificate: ${result}`);
					resolve(result);
				} catch (e) {
					handleError(logger, e, null, reject);
					resolve(null);
					return;
				}
			});
		});
	}
	function parseOut(out) {
		const data = JSON.parse(out);
		delete data.PrivateKey;
		delete data.IsOSBinary;
		delete data.SignatureType;
		const signerCertificate = data.SignerCertificate;
		if (signerCertificate != null) {
			delete signerCertificate.Archived;
			delete signerCertificate.Extensions;
			delete signerCertificate.Handle;
			delete signerCertificate.HasPrivateKey;
			delete signerCertificate.SubjectName;
		}
		return data;
	}
	function handleError(logger, error, stderr, reject) {
		if (isOldWin6()) {
			logger.warn(`Cannot execute Get-AuthenticodeSignature: ${error || stderr}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
			return;
		}
		try {
			(0, child_process_1.execFileSync)(...preparePowerShellExec("ConvertTo-Json test", 1e4));
		} catch (testError) {
			logger.warn(`Cannot execute ConvertTo-Json: ${testError.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
			return;
		}
		if (error != null) reject(error);
		if (stderr) reject(/* @__PURE__ */ new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${stderr}. Failing signature validation due to unknown stderr.`));
	}
	function isOldWin6() {
		const winVersion = os$2.release();
		return winVersion.startsWith("6.") && !winVersion.startsWith("6.3");
	}
}));
var require_NsisUpdater = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NsisUpdater = void 0;
	var builder_util_runtime_1 = require_out();
	var path$11 = require("path");
	var BaseUpdater_1 = require_BaseUpdater();
	var FileWithEmbeddedBlockMapDifferentialDownloader_1 = require_FileWithEmbeddedBlockMapDifferentialDownloader();
	var types_1 = require_types$2();
	var Provider_1 = require_Provider();
	var fs_extra_1 = require_lib$9();
	var windowsExecutableCodeSignatureVerifier_1 = require_windowsExecutableCodeSignatureVerifier();
	var url_1 = require("url");
	var NsisUpdater = class extends BaseUpdater_1.BaseUpdater {
		constructor(options, app) {
			super(options, app);
			this._verifyUpdateCodeSignature = (publisherNames, unescapedTempUpdateFile) => (0, windowsExecutableCodeSignatureVerifier_1.verifySignature)(publisherNames, unescapedTempUpdateFile, this._logger);
		}
		/**
		* The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
		* The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
		*/
		get verifyUpdateCodeSignature() {
			return this._verifyUpdateCodeSignature;
		}
		set verifyUpdateCodeSignature(value) {
			if (value) this._verifyUpdateCodeSignature = value;
		}
		/*** @private */
		doDownloadUpdate(downloadUpdateOptions) {
			const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
			const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "exe");
			return this.executeDownload({
				fileExtension: "exe",
				downloadUpdateOptions,
				fileInfo,
				task: async (destinationFile, downloadOptions, packageFile, removeTempDirIfAny) => {
					const packageInfo = fileInfo.packageInfo;
					const isWebInstaller = packageInfo != null && packageFile != null;
					if (isWebInstaller && downloadUpdateOptions.disableWebInstaller) throw (0, builder_util_runtime_1.newError)(`Unable to download new version ${downloadUpdateOptions.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
					if (!isWebInstaller && !downloadUpdateOptions.disableWebInstaller) this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version.");
					if (isWebInstaller || downloadUpdateOptions.disableDifferentialDownload || await this.differentialDownloadInstaller(fileInfo, downloadUpdateOptions, destinationFile, provider, builder_util_runtime_1.CURRENT_APP_INSTALLER_FILE_NAME)) await this.httpExecutor.download(fileInfo.url, destinationFile, downloadOptions);
					const signatureVerificationStatus = await this.verifySignature(destinationFile);
					if (signatureVerificationStatus != null) {
						await removeTempDirIfAny();
						throw (0, builder_util_runtime_1.newError)(`New version ${downloadUpdateOptions.updateInfoAndProvider.info.version} is not signed by the application owner: ${signatureVerificationStatus}`, "ERR_UPDATER_INVALID_SIGNATURE");
					}
					if (isWebInstaller) {
						if (await this.differentialDownloadWebPackage(downloadUpdateOptions, packageInfo, packageFile, provider)) try {
							await this.httpExecutor.download(new url_1.URL(packageInfo.path), packageFile, {
								headers: downloadUpdateOptions.requestHeaders,
								cancellationToken: downloadUpdateOptions.cancellationToken,
								sha512: packageInfo.sha512
							});
						} catch (e) {
							try {
								await (0, fs_extra_1.unlink)(packageFile);
							} catch (_ignored) {}
							throw e;
						}
					}
				}
			});
		}
		async verifySignature(tempUpdateFile) {
			let publisherName;
			try {
				publisherName = (await this.configOnDisk.value).publisherName;
				if (publisherName == null) return null;
			} catch (e) {
				if (e.code === "ENOENT") return null;
				throw e;
			}
			return await this._verifyUpdateCodeSignature(Array.isArray(publisherName) ? publisherName : [publisherName], tempUpdateFile);
		}
		doInstall(options) {
			const installerPath = this.installerPath;
			if (installerPath == null) {
				this.dispatchError(/* @__PURE__ */ new Error("No update filepath provided, can't quit and install"));
				return false;
			}
			const args = ["--updated"];
			if (options.isSilent) args.push("/S");
			if (options.isForceRunAfter) args.push("--force-run");
			if (this.installDirectory) args.push(`/D=${this.installDirectory}`);
			const packagePath = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
			if (packagePath != null) args.push(`--package-file=${packagePath}`);
			const callUsingElevation = () => {
				this.spawnLog(path$11.join(process.resourcesPath, "elevate.exe"), [installerPath].concat(args)).catch((e) => this.dispatchError(e));
			};
			if (options.isAdminRightsRequired) {
				this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe");
				callUsingElevation();
				return true;
			}
			this.spawnLog(installerPath, args).catch((e) => {
				const errorCode = e.code;
				this._logger.info(`Cannot run installer: error code: ${errorCode}, error message: "${e.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`);
				if (errorCode === "UNKNOWN" || errorCode === "EACCES") callUsingElevation();
				else if (errorCode === "ENOENT") require("electron").shell.openPath(installerPath).catch((err) => this.dispatchError(err));
				else this.dispatchError(e);
			});
			return true;
		}
		async differentialDownloadWebPackage(downloadUpdateOptions, packageInfo, packagePath, provider) {
			if (packageInfo.blockMapSize == null) return true;
			try {
				const downloadOptions = {
					newUrl: new url_1.URL(packageInfo.path),
					oldFile: path$11.join(this.downloadedUpdateHelper.cacheDir, builder_util_runtime_1.CURRENT_APP_PACKAGE_FILE_NAME),
					logger: this._logger,
					newFile: packagePath,
					requestHeaders: this.requestHeaders,
					isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
					cancellationToken: downloadUpdateOptions.cancellationToken
				};
				if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
				await new FileWithEmbeddedBlockMapDifferentialDownloader_1.FileWithEmbeddedBlockMapDifferentialDownloader(packageInfo, this.httpExecutor, downloadOptions).download();
			} catch (e) {
				this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
				return process.platform === "win32";
			}
			return false;
		}
	};
	exports.NsisUpdater = NsisUpdater;
}));

export { require_AppImageUpdater, require_AppUpdater, require_BaseUpdater, require_DebUpdater, require_MacUpdater, require_NsisUpdater, require_PacmanUpdater, require_Provider, require_RpmUpdater, require_types$2 };
