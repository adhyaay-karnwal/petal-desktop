// Reconstructed from index.js — original module: vendor/stubborn-fs
import { node_fs, node_process, node_util } from "../__bundle__/_preamble.js";
import { attemptifyAsync, attemptifySync, retryifyAsync, retryifySync } from "./stubborn-utils.js";

var Handlers = {
	isChangeErrorOk: (error) => {
		if (!Handlers.isNodeError(error)) return false;
		const { code } = error;
		if (code === "ENOSYS") return true;
		if (!IS_USER_ROOT$1 && (code === "EINVAL" || code === "EPERM")) return true;
		return false;
	},
	isNodeError: (error) => {
		return error instanceof Error;
	},
	isRetriableError: (error) => {
		if (!Handlers.isNodeError(error)) return false;
		const { code } = error;
		if (code === "EMFILE" || code === "ENFILE" || code === "EAGAIN" || code === "EBUSY" || code === "EACCESS" || code === "EACCES" || code === "EACCS" || code === "EPERM") return true;
		return false;
	},
	onChangeError: (error) => {
		if (!Handlers.isNodeError(error)) throw error;
		if (Handlers.isChangeErrorOk(error)) return;
		throw error;
	}
};
var ATTEMPTIFY_CHANGE_ERROR_OPTIONS = { onError: Handlers.onChangeError };
var ATTEMPTIFY_NOOP_OPTIONS = { onError: () => void 0 };
var IS_USER_ROOT$1 = node_process.default.getuid ? !node_process.default.getuid() : false;
var RETRYIFY_OPTIONS = { isRetriable: Handlers.isRetriableError };
var FS = {
	attempt: {
		chmod: attemptifyAsync((0, node_util.promisify)(node_fs.default.chmod), ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
		chown: attemptifyAsync((0, node_util.promisify)(node_fs.default.chown), ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
		close: attemptifyAsync((0, node_util.promisify)(node_fs.default.close), ATTEMPTIFY_NOOP_OPTIONS),
		fsync: attemptifyAsync((0, node_util.promisify)(node_fs.default.fsync), ATTEMPTIFY_NOOP_OPTIONS),
		mkdir: attemptifyAsync((0, node_util.promisify)(node_fs.default.mkdir), ATTEMPTIFY_NOOP_OPTIONS),
		realpath: attemptifyAsync((0, node_util.promisify)(node_fs.default.realpath), ATTEMPTIFY_NOOP_OPTIONS),
		stat: attemptifyAsync((0, node_util.promisify)(node_fs.default.stat), ATTEMPTIFY_NOOP_OPTIONS),
		unlink: attemptifyAsync((0, node_util.promisify)(node_fs.default.unlink), ATTEMPTIFY_NOOP_OPTIONS),
		chmodSync: attemptifySync(node_fs.default.chmodSync, ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
		chownSync: attemptifySync(node_fs.default.chownSync, ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
		closeSync: attemptifySync(node_fs.default.closeSync, ATTEMPTIFY_NOOP_OPTIONS),
		existsSync: attemptifySync(node_fs.default.existsSync, ATTEMPTIFY_NOOP_OPTIONS),
		fsyncSync: attemptifySync(node_fs.default.fsync, ATTEMPTIFY_NOOP_OPTIONS),
		mkdirSync: attemptifySync(node_fs.default.mkdirSync, ATTEMPTIFY_NOOP_OPTIONS),
		realpathSync: attemptifySync(node_fs.default.realpathSync, ATTEMPTIFY_NOOP_OPTIONS),
		statSync: attemptifySync(node_fs.default.statSync, ATTEMPTIFY_NOOP_OPTIONS),
		unlinkSync: attemptifySync(node_fs.default.unlinkSync, ATTEMPTIFY_NOOP_OPTIONS)
	},
	retry: {
		close: retryifyAsync((0, node_util.promisify)(node_fs.default.close), RETRYIFY_OPTIONS),
		fsync: retryifyAsync((0, node_util.promisify)(node_fs.default.fsync), RETRYIFY_OPTIONS),
		open: retryifyAsync((0, node_util.promisify)(node_fs.default.open), RETRYIFY_OPTIONS),
		readFile: retryifyAsync((0, node_util.promisify)(node_fs.default.readFile), RETRYIFY_OPTIONS),
		rename: retryifyAsync((0, node_util.promisify)(node_fs.default.rename), RETRYIFY_OPTIONS),
		stat: retryifyAsync((0, node_util.promisify)(node_fs.default.stat), RETRYIFY_OPTIONS),
		write: retryifyAsync((0, node_util.promisify)(node_fs.default.write), RETRYIFY_OPTIONS),
		writeFile: retryifyAsync((0, node_util.promisify)(node_fs.default.writeFile), RETRYIFY_OPTIONS),
		closeSync: retryifySync(node_fs.default.closeSync, RETRYIFY_OPTIONS),
		fsyncSync: retryifySync(node_fs.default.fsyncSync, RETRYIFY_OPTIONS),
		openSync: retryifySync(node_fs.default.openSync, RETRYIFY_OPTIONS),
		readFileSync: retryifySync(node_fs.default.readFileSync, RETRYIFY_OPTIONS),
		renameSync: retryifySync(node_fs.default.renameSync, RETRYIFY_OPTIONS),
		statSync: retryifySync(node_fs.default.statSync, RETRYIFY_OPTIONS),
		writeSync: retryifySync(node_fs.default.writeSync, RETRYIFY_OPTIONS),
		writeFileSync: retryifySync(node_fs.default.writeFileSync, RETRYIFY_OPTIONS)
	}
};
var DEFAULT_WRITE_OPTIONS = {};
var DEFAULT_USER_UID = node_process.default.geteuid ? node_process.default.geteuid() : -1;
var DEFAULT_USER_GID = node_process.default.getegid ? node_process.default.getegid() : -1;
var IS_POSIX = !!node_process.default.getuid;
node_process.default.getuid && node_process.default.getuid();

export { DEFAULT_USER_GID, DEFAULT_USER_UID, DEFAULT_WRITE_OPTIONS, FS, IS_POSIX };
