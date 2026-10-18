// Reconstructed from index.js — original module: vendor/stubborn-utils

var attemptifyAsync = (fn, options) => {
	const { onError } = options;
	return function attemptified(...args) {
		return fn.apply(void 0, args).catch(onError);
	};
};
var attemptifySync = (fn, options) => {
	const { onError } = options;
	return function attemptified(...args) {
		try {
			return fn.apply(void 0, args);
		} catch (error) {
			return onError(error);
		}
	};
};
var retryifyAsync = (fn, options) => {
	const { isRetriable } = options;
	return function retryified(options) {
		const { timeout } = options;
		const interval = options.interval ?? 250;
		const timestamp = Date.now() + timeout;
		return function attempt(...args) {
			return fn.apply(void 0, args).catch((error) => {
				if (!isRetriable(error)) throw error;
				if (Date.now() >= timestamp) throw error;
				const delay = Math.round(interval * Math.random());
				if (delay > 0) return new Promise((resolve) => setTimeout(resolve, delay)).then(() => attempt.apply(void 0, args));
				else return attempt.apply(void 0, args);
			});
		};
	};
};
var retryifySync = (fn, options) => {
	const { isRetriable } = options;
	return function retryified(options) {
		const { timeout } = options;
		const timestamp = Date.now() + timeout;
		return function attempt(...args) {
			while (true) try {
				return fn.apply(void 0, args);
			} catch (error) {
				if (!isRetriable(error)) throw error;
				if (Date.now() >= timestamp) throw error;
				continue;
			}
		};
	};
};

export { attemptifyAsync, attemptifySync, retryifyAsync, retryifySync };
