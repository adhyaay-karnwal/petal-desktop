// Reconstructed from index.js — original module: vendor/atomically
import { node_path } from "../__bundle__/_preamble.js";
import { DEFAULT_USER_GID, DEFAULT_USER_UID, DEFAULT_WRITE_OPTIONS, FS, IS_POSIX } from "./stubborn-fs.js";
import { whenExit } from "./when-exit.js";

var isException = (value) => {
	return value instanceof Error && "code" in value;
};
var isString = (value) => {
	return typeof value === "string";
};
var isUndefined = (value) => {
	return value === void 0;
};
var Temp = {
	store: {},
	create: (filePath) => {
		const randomness = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6);
		return `${filePath}${`.tmp-${Date.now().toString().slice(-10)}${randomness}`}`;
	},
	get: (filePath, creator, purge = true) => {
		const tempPath = Temp.truncate(creator(filePath));
		if (tempPath in Temp.store) return Temp.get(filePath, creator, purge);
		Temp.store[tempPath] = purge;
		const disposer = () => delete Temp.store[tempPath];
		return [tempPath, disposer];
	},
	purge: (filePath) => {
		if (!Temp.store[filePath]) return;
		delete Temp.store[filePath];
		FS.attempt.unlink(filePath);
	},
	purgeSync: (filePath) => {
		if (!Temp.store[filePath]) return;
		delete Temp.store[filePath];
		FS.attempt.unlinkSync(filePath);
	},
	purgeSyncAll: () => {
		for (const filePath in Temp.store) Temp.purgeSync(filePath);
	},
	truncate: (filePath) => {
		const basename = node_path.default.basename(filePath);
		if (basename.length <= 128) return filePath;
		const truncable = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(basename);
		if (!truncable) return filePath;
		const truncationLength = basename.length - 128;
		return `${filePath.slice(0, -basename.length)}${truncable[1]}${truncable[2].slice(0, -truncationLength)}${truncable[3]}`;
	}
};
whenExit(Temp.purgeSyncAll);
function writeFileSync(filePath, data, options = DEFAULT_WRITE_OPTIONS) {
	if (isString(options)) return writeFileSync(filePath, data, { encoding: options });
	const retryOptions = { timeout: options.timeout ?? 1e3 };
	let tempDisposer = null;
	let tempPath = null;
	let fd = null;
	try {
		const filePathReal = FS.attempt.realpathSync(filePath);
		const filePathExists = !!filePathReal;
		filePath = filePathReal || filePath;
		[tempPath, tempDisposer] = Temp.get(filePath, options.tmpCreate || Temp.create, !(options.tmpPurge === false));
		const useStatChown = IS_POSIX && isUndefined(options.chown);
		const useStatMode = isUndefined(options.mode);
		if (filePathExists && (useStatChown || useStatMode)) {
			const stats = FS.attempt.statSync(filePath);
			if (stats) {
				options = { ...options };
				if (useStatChown) options.chown = {
					uid: stats.uid,
					gid: stats.gid
				};
				if (useStatMode) options.mode = stats.mode;
			}
		}
		if (!filePathExists) {
			const parentPath = node_path.default.dirname(filePath);
			FS.attempt.mkdirSync(parentPath, {
				mode: 511,
				recursive: true
			});
		}
		fd = FS.retry.openSync(retryOptions)(tempPath, "w", options.mode || 438);
		if (options.tmpCreated) options.tmpCreated(tempPath);
		if (isString(data)) FS.retry.writeSync(retryOptions)(fd, data, 0, options.encoding || "utf8");
		else if (!isUndefined(data)) FS.retry.writeSync(retryOptions)(fd, data, 0, data.length, 0);
		if (options.fsync !== false) {
			if (options.fsyncWait !== false) FS.retry.fsyncSync(retryOptions)(fd);
			else FS.attempt.fsync(fd);
		}
		FS.retry.closeSync(retryOptions)(fd);
		fd = null;
		if (options.chown && (options.chown.uid !== DEFAULT_USER_UID || options.chown.gid !== DEFAULT_USER_GID)) FS.attempt.chownSync(tempPath, options.chown.uid, options.chown.gid);
		if (options.mode && options.mode !== 438) FS.attempt.chmodSync(tempPath, options.mode);
		try {
			FS.retry.renameSync(retryOptions)(tempPath, filePath);
		} catch (error) {
			if (!isException(error)) throw error;
			if (error.code !== "ENAMETOOLONG") throw error;
			FS.retry.renameSync(retryOptions)(tempPath, Temp.truncate(filePath));
		}
		tempDisposer();
		tempPath = null;
	} finally {
		if (fd) FS.attempt.closeSync(fd);
		if (tempPath) Temp.purge(tempPath);
	}
}

export { writeFileSync };
