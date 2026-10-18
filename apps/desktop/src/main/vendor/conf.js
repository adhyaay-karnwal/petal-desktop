// Reconstructed from index.js — original module: vendor/conf
import { node_assert, node_crypto, node_fs, node_path, node_process, node_util } from "../__bundle__/_preamble.js";
import { import_dist$1 } from "./@modelcontextprotocol/sdk.js";
import { deleteProperty, getProperty, hasProperty, setProperty } from "./dot-prop.js";
import { envPaths } from "./env-paths.js";
import { writeFileSync } from "./atomically.js";
import { import__2020 } from "./mimic-function.js";
import { debounceFunction } from "./debounce-fn.js";
import { concatUint8Arrays, import_semver, stringToUint8Array, uint8ArrayToString } from "./uint8array-extras.js";

var defaultEncryptionAlgorithm = "aes-256-cbc";
var supportedEncryptionAlgorithms = /* @__PURE__ */ new Set([
	"aes-256-cbc",
	"aes-256-gcm",
	"aes-256-ctr"
]);
var isSupportedEncryptionAlgorithm = (value) => typeof value === "string" && supportedEncryptionAlgorithms.has(value);
var createPlainObject = () => Object.create(null);
var isExist = (data) => data !== void 0;
var checkValueType = (key, value) => {
	const nonJsonTypes = /* @__PURE__ */ new Set([
		"undefined",
		"symbol",
		"function"
	]);
	const type = typeof value;
	if (nonJsonTypes.has(type)) throw new TypeError(`Setting a value of type \`${type}\` for key \`${key}\` is not allowed as it's not supported by JSON`);
};
var INTERNAL_KEY = "__internal__";
var MIGRATION_KEY = `${INTERNAL_KEY}.migrations.version`;
var Conf = class {
	path;
	events;
	#validator;
	#encryptionKey;
	#encryptionAlgorithm;
	#options;
	#defaultValues = {};
	#isInMigration = false;
	#watcher;
	#watchFile;
	#debouncedChangeHandler;
	constructor(partialOptions = {}) {
		const options = this.#prepareOptions(partialOptions);
		this.#options = options;
		this.#setupValidator(options);
		this.#applyDefaultValues(options);
		this.#configureSerialization(options);
		this.events = new EventTarget();
		this.#encryptionKey = options.encryptionKey;
		this.#encryptionAlgorithm = options.encryptionAlgorithm ?? defaultEncryptionAlgorithm;
		this.path = this.#resolvePath(options);
		this.#initializeStore(options);
		if (options.watch) this._watch();
	}
	get(key, defaultValue) {
		if (this.#options.accessPropertiesByDotNotation) return this._get(key, defaultValue);
		const { store } = this;
		return key in store ? store[key] : defaultValue;
	}
	set(key, value) {
		if (typeof key !== "string" && typeof key !== "object") throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
		if (typeof key !== "object" && value === void 0) throw new TypeError("Use `delete()` to clear values");
		if (this._containsReservedKey(key)) throw new TypeError(`Please don't use the ${INTERNAL_KEY} key, as it's used to manage this module internal operations.`);
		const { store } = this;
		const set = (key, value) => {
			checkValueType(key, value);
			if (this.#options.accessPropertiesByDotNotation) setProperty(store, key, value);
			else {
				if (key === "__proto__" || key === "constructor" || key === "prototype") return;
				store[key] = value;
			}
		};
		if (typeof key === "object") {
			const object = key;
			for (const [key, value] of Object.entries(object)) set(key, value);
		} else set(key, value);
		this.store = store;
	}
	has(key) {
		if (this.#options.accessPropertiesByDotNotation) return hasProperty(this.store, key);
		return key in this.store;
	}
	appendToArray(key, value) {
		checkValueType(key, value);
		const array = this.#options.accessPropertiesByDotNotation ? this._get(key, []) : key in this.store ? this.store[key] : [];
		if (!Array.isArray(array)) throw new TypeError(`The key \`${key}\` is already set to a non-array value`);
		this.set(key, [...array, value]);
	}
	/**
	Reset items to their default values, as defined by the `defaults` or `schema` option.
	
	@see `clear()` to reset all items.
	
	@param keys - The keys of the items to reset.
	*/
	reset(...keys) {
		for (const key of keys) if (isExist(this.#defaultValues[key])) this.set(key, this.#defaultValues[key]);
	}
	delete(key) {
		const { store } = this;
		if (this.#options.accessPropertiesByDotNotation) deleteProperty(store, key);
		else delete store[key];
		this.store = store;
	}
	/**
	Delete all items.
	
	This resets known items to their default values, if defined by the `defaults` or `schema` option.
	*/
	clear() {
		const newStore = createPlainObject();
		for (const key of Object.keys(this.#defaultValues)) if (isExist(this.#defaultValues[key])) {
			checkValueType(key, this.#defaultValues[key]);
			if (this.#options.accessPropertiesByDotNotation) setProperty(newStore, key, this.#defaultValues[key]);
			else newStore[key] = this.#defaultValues[key];
		}
		this.store = newStore;
	}
	onDidChange(key, callback) {
		if (typeof key !== "string") throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
		if (typeof callback !== "function") throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
		return this._handleValueChange(() => this.get(key), callback);
	}
	/**
	Watches the whole config object, calling `callback` on any changes.
	
	@param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
	@returns A function, that when called, will unsubscribe.
	*/
	onDidAnyChange(callback) {
		if (typeof callback !== "function") throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
		return this._handleStoreChange(callback);
	}
	get size() {
		return Object.keys(this.store).filter((key) => !this._isReservedKeyPath(key)).length;
	}
	/**
	Get all the config as an object or replace the current config with an object.
	
	@example
	```
	console.log(config.store);
	//=> {name: 'John', age: 30}
	```
	
	@example
	```
	config.store = {
	hello: 'world'
	};
	```
	*/
	get store() {
		try {
			const data = node_fs.default.readFileSync(this.path, this.#encryptionKey ? null : "utf8");
			const dataString = this._decryptData(data);
			const parseStore = (value) => {
				const deserializedData = this._deserialize(value);
				if (!this.#isInMigration) this._validate(deserializedData);
				return Object.assign(createPlainObject(), deserializedData);
			};
			return parseStore(dataString);
		} catch (error) {
			if (error?.code === "ENOENT") {
				this._ensureDirectory();
				return createPlainObject();
			}
			if (this.#options.clearInvalidConfig) {
				const errorInstance = error;
				if (errorInstance.name === "SyntaxError") return createPlainObject();
				if (errorInstance.message?.startsWith("Config schema violation:")) return createPlainObject();
				if (errorInstance.message === "Failed to decrypt config data.") return createPlainObject();
			}
			throw error;
		}
	}
	set store(value) {
		this._ensureDirectory();
		if (!hasProperty(value, INTERNAL_KEY)) try {
			const data = node_fs.default.readFileSync(this.path, this.#encryptionKey ? null : "utf8");
			const dataString = this._decryptData(data);
			const currentStore = this._deserialize(dataString);
			if (hasProperty(currentStore, INTERNAL_KEY)) setProperty(value, INTERNAL_KEY, getProperty(currentStore, INTERNAL_KEY));
		} catch {}
		if (!this.#isInMigration) this._validate(value);
		this._write(value);
		this.events.dispatchEvent(new Event("change"));
	}
	*[Symbol.iterator]() {
		for (const [key, value] of Object.entries(this.store)) if (!this._isReservedKeyPath(key)) yield [key, value];
	}
	/**
	Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
	*/
	_closeWatcher() {
		if (this.#watcher) {
			this.#watcher.close();
			this.#watcher = void 0;
		}
		if (this.#watchFile) {
			node_fs.default.unwatchFile(this.path);
			this.#watchFile = false;
		}
		this.#debouncedChangeHandler = void 0;
	}
	_decryptData(data) {
		const encryptionKey = this.#encryptionKey;
		if (!encryptionKey) return typeof data === "string" ? data : uint8ArrayToString(data);
		const encryptionAlgorithm = this.#encryptionAlgorithm;
		const authenticationTagLength = encryptionAlgorithm === "aes-256-gcm" ? 16 : 0;
		const separatorCodePoint = ":".codePointAt(0);
		const separatorByte = typeof data === "string" ? data.codePointAt(16) : data[16];
		if (!(separatorCodePoint !== void 0 && separatorByte === separatorCodePoint)) {
			if (encryptionAlgorithm === "aes-256-cbc") return typeof data === "string" ? data : uint8ArrayToString(data);
			throw new Error("Failed to decrypt config data.");
		}
		const getEncryptedPayload = (dataUpdate) => {
			if (authenticationTagLength === 0) return { ciphertext: dataUpdate };
			const authenticationTagStart = dataUpdate.length - authenticationTagLength;
			if (authenticationTagStart < 0) throw new Error("Invalid authentication tag length.");
			return {
				ciphertext: dataUpdate.slice(0, authenticationTagStart),
				authenticationTag: dataUpdate.slice(authenticationTagStart)
			};
		};
		const initializationVector = data.slice(0, 16);
		const slice = data.slice(17);
		const dataUpdate = typeof slice === "string" ? stringToUint8Array(slice) : slice;
		const decrypt = (salt) => {
			const { ciphertext, authenticationTag } = getEncryptedPayload(dataUpdate);
			const password = node_crypto.default.pbkdf2Sync(encryptionKey, salt, 1e4, 32, "sha512");
			const decipher = node_crypto.default.createDecipheriv(encryptionAlgorithm, password, initializationVector);
			if (authenticationTag) decipher.setAuthTag(authenticationTag);
			return uint8ArrayToString(concatUint8Arrays([decipher.update(ciphertext), decipher.final()]));
		};
		try {
			return decrypt(initializationVector);
		} catch {
			try {
				return decrypt(initializationVector.toString());
			} catch {}
		}
		if (encryptionAlgorithm === "aes-256-cbc") return typeof data === "string" ? data : uint8ArrayToString(data);
		throw new Error("Failed to decrypt config data.");
	}
	_handleStoreChange(callback) {
		let currentValue = this.store;
		const onChange = () => {
			const oldValue = currentValue;
			const newValue = this.store;
			if ((0, node_util.isDeepStrictEqual)(newValue, oldValue)) return;
			currentValue = newValue;
			callback.call(this, newValue, oldValue);
		};
		this.events.addEventListener("change", onChange);
		return () => {
			this.events.removeEventListener("change", onChange);
		};
	}
	_handleValueChange(getter, callback) {
		let currentValue = getter();
		const onChange = () => {
			const oldValue = currentValue;
			const newValue = getter();
			if ((0, node_util.isDeepStrictEqual)(newValue, oldValue)) return;
			currentValue = newValue;
			callback.call(this, newValue, oldValue);
		};
		this.events.addEventListener("change", onChange);
		return () => {
			this.events.removeEventListener("change", onChange);
		};
	}
	_deserialize = (value) => JSON.parse(value);
	_serialize = (value) => JSON.stringify(value, void 0, "	");
	_validate(data) {
		if (!this.#validator) return;
		if (this.#validator(data) || !this.#validator.errors) return;
		const errors = this.#validator.errors.map(({ instancePath, message = "" }) => `\`${instancePath.slice(1)}\` ${message}`);
		throw new Error("Config schema violation: " + errors.join("; "));
	}
	_ensureDirectory() {
		node_fs.default.mkdirSync(node_path.default.dirname(this.path), { recursive: true });
	}
	_write(value) {
		let data = this._serialize(value);
		const encryptionKey = this.#encryptionKey;
		if (encryptionKey) {
			const initializationVector = node_crypto.default.randomBytes(16);
			const password = node_crypto.default.pbkdf2Sync(encryptionKey, initializationVector, 1e4, 32, "sha512");
			const cipher = node_crypto.default.createCipheriv(this.#encryptionAlgorithm, password, initializationVector);
			const encryptedData = concatUint8Arrays([cipher.update(stringToUint8Array(data)), cipher.final()]);
			const encryptedParts = [
				initializationVector,
				stringToUint8Array(":"),
				encryptedData
			];
			if (this.#encryptionAlgorithm === "aes-256-gcm") encryptedParts.push(cipher.getAuthTag());
			data = concatUint8Arrays(encryptedParts);
		}
		if (node_process.default.env.SNAP) node_fs.default.writeFileSync(this.path, data, { mode: this.#options.configFileMode });
		else try {
			writeFileSync(this.path, data, { mode: this.#options.configFileMode });
		} catch (error) {
			if (error?.code === "EXDEV") {
				node_fs.default.writeFileSync(this.path, data, { mode: this.#options.configFileMode });
				return;
			}
			throw error;
		}
	}
	_watch() {
		this._ensureDirectory();
		if (!node_fs.default.existsSync(this.path)) this._write(createPlainObject());
		if (node_process.default.platform === "win32" || node_process.default.platform === "darwin") {
			this.#debouncedChangeHandler ??= debounceFunction(() => {
				this.events.dispatchEvent(new Event("change"));
			}, { wait: 100 });
			const directory = node_path.default.dirname(this.path);
			const basename = node_path.default.basename(this.path);
			this.#watcher = node_fs.default.watch(directory, {
				persistent: false,
				encoding: "utf8"
			}, (_eventType, filename) => {
				if (filename && filename !== basename) return;
				if (typeof this.#debouncedChangeHandler === "function") this.#debouncedChangeHandler();
			});
		} else {
			this.#debouncedChangeHandler ??= debounceFunction(() => {
				this.events.dispatchEvent(new Event("change"));
			}, { wait: 1e3 });
			node_fs.default.watchFile(this.path, { persistent: false }, (_current, _previous) => {
				if (typeof this.#debouncedChangeHandler === "function") this.#debouncedChangeHandler();
			});
			this.#watchFile = true;
		}
	}
	_migrate(migrations, versionToMigrate, beforeEachMigration) {
		let previousMigratedVersion = this._get(MIGRATION_KEY, "0.0.0");
		const newerVersions = Object.keys(migrations).filter((candidateVersion) => this._shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate));
		let storeBackup = structuredClone(this.store);
		for (const version of newerVersions) try {
			if (beforeEachMigration) beforeEachMigration(this, {
				fromVersion: previousMigratedVersion,
				toVersion: version,
				finalVersion: versionToMigrate,
				versions: newerVersions
			});
			const migration = migrations[version];
			migration?.(this);
			this._set(MIGRATION_KEY, version);
			previousMigratedVersion = version;
			storeBackup = structuredClone(this.store);
		} catch (error) {
			this.store = storeBackup;
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${errorMessage}`);
		}
		if (this._isVersionInRangeFormat(previousMigratedVersion) || !import_semver.default.eq(previousMigratedVersion, versionToMigrate)) this._set(MIGRATION_KEY, versionToMigrate);
	}
	_containsReservedKey(key) {
		if (typeof key === "string") return this._isReservedKeyPath(key);
		if (!key || typeof key !== "object") return false;
		return this._objectContainsReservedKey(key);
	}
	_objectContainsReservedKey(value) {
		if (!value || typeof value !== "object") return false;
		for (const [candidateKey, candidateValue] of Object.entries(value)) {
			if (this._isReservedKeyPath(candidateKey)) return true;
			if (this._objectContainsReservedKey(candidateValue)) return true;
		}
		return false;
	}
	_isReservedKeyPath(candidate) {
		return candidate === INTERNAL_KEY || candidate.startsWith(`${INTERNAL_KEY}.`);
	}
	_isVersionInRangeFormat(version) {
		return import_semver.default.clean(version) === null;
	}
	_shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate) {
		if (this._isVersionInRangeFormat(candidateVersion)) {
			if (previousMigratedVersion !== "0.0.0" && import_semver.default.satisfies(previousMigratedVersion, candidateVersion)) return false;
			return import_semver.default.satisfies(versionToMigrate, candidateVersion);
		}
		if (import_semver.default.lte(candidateVersion, previousMigratedVersion)) return false;
		if (import_semver.default.gt(candidateVersion, versionToMigrate)) return false;
		return true;
	}
	_get(key, defaultValue) {
		return getProperty(this.store, key, defaultValue);
	}
	_set(key, value) {
		const { store } = this;
		setProperty(store, key, value);
		this.store = store;
	}
	#prepareOptions(partialOptions) {
		const options = {
			configName: "config",
			fileExtension: "json",
			projectSuffix: "nodejs",
			clearInvalidConfig: false,
			accessPropertiesByDotNotation: true,
			configFileMode: 438,
			...partialOptions
		};
		options.encryptionAlgorithm ??= defaultEncryptionAlgorithm;
		if (!isSupportedEncryptionAlgorithm(options.encryptionAlgorithm)) throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...supportedEncryptionAlgorithms].join(", ")}`);
		if (!options.cwd) {
			if (!options.projectName) throw new Error("Please specify the `projectName` option.");
			options.cwd = envPaths(options.projectName, { suffix: options.projectSuffix }).config;
		}
		if (typeof options.fileExtension === "string") options.fileExtension = options.fileExtension.replace(/^\.+/, "");
		return options;
	}
	#setupValidator(options) {
		if (!(options.schema ?? options.ajvOptions ?? options.rootSchema)) return;
		if (options.schema && typeof options.schema !== "object") throw new TypeError("The `schema` option must be an object.");
		const ajvFormats = import_dist$1.default.default;
		const ajv = new import__2020.Ajv2020({
			allErrors: true,
			useDefaults: true,
			...options.ajvOptions
		});
		ajvFormats(ajv);
		const schema = {
			...options.rootSchema,
			type: "object",
			properties: options.schema
		};
		this.#validator = ajv.compile(schema);
		this.#captureSchemaDefaults(options.schema);
	}
	#captureSchemaDefaults(schemaConfig) {
		const schemaEntries = Object.entries(schemaConfig ?? {});
		for (const [key, schemaDefinition] of schemaEntries) {
			if (!schemaDefinition || typeof schemaDefinition !== "object") continue;
			if (!Object.hasOwn(schemaDefinition, "default")) continue;
			const { default: defaultValue } = schemaDefinition;
			if (defaultValue === void 0) continue;
			this.#defaultValues[key] = defaultValue;
		}
	}
	#applyDefaultValues(options) {
		if (options.defaults) Object.assign(this.#defaultValues, options.defaults);
	}
	#configureSerialization(options) {
		if (options.serialize) this._serialize = options.serialize;
		if (options.deserialize) this._deserialize = options.deserialize;
	}
	#resolvePath(options) {
		const normalizedFileExtension = typeof options.fileExtension === "string" ? options.fileExtension : void 0;
		const fileExtension = normalizedFileExtension ? `.${normalizedFileExtension}` : "";
		return node_path.default.resolve(options.cwd, `${options.configName ?? "config"}${fileExtension}`);
	}
	#initializeStore(options) {
		if (options.migrations) {
			this.#runMigrations(options);
			this._validate(this.store);
			return;
		}
		const fileStore = this.store;
		const storeWithDefaults = Object.assign(createPlainObject(), options.defaults ?? {}, fileStore);
		this._validate(storeWithDefaults);
		try {
			node_assert.default.deepEqual(fileStore, storeWithDefaults);
		} catch {
			this.store = storeWithDefaults;
		}
	}
	#runMigrations(options) {
		const { migrations, projectVersion } = options;
		if (!migrations) return;
		if (!projectVersion) throw new Error("Please specify the `projectVersion` option.");
		this.#isInMigration = true;
		try {
			const fileStore = this.store;
			const storeWithDefaults = Object.assign(createPlainObject(), options.defaults ?? {}, fileStore);
			try {
				node_assert.default.deepEqual(fileStore, storeWithDefaults);
			} catch {
				this._write(storeWithDefaults);
			}
			this._migrate(migrations, projectVersion, options.beforeEachMigration);
		} finally {
			this.#isInMigration = false;
		}
	}
};

export { Conf };
