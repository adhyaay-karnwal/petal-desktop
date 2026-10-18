// Reconstructed from index.js — original module: app/src/main/idleDeadline.ts

function createIdleDeadline(ms, onExpire) {
	let timer = setTimeout(onExpire, ms);
	return {
		touch() {
			if (timer === void 0) return;
			clearTimeout(timer);
			timer = setTimeout(onExpire, ms);
		},
		cancel() {
			clearTimeout(timer);
			timer = void 0;
		}
	};
}

export { createIdleDeadline };
