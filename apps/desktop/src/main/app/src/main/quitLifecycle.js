// Reconstructed from index.js — original module: app/src/main/quitLifecycle.ts

/** A macOS quit must resume after asynchronous, save-aware window closing. */
function createQuitLifecycle(platform, quit) {
	let requested = false;
	let attempt = 0;
	return {
		beforeQuit: (event) => {
			requested = true;
			const current = ++attempt;
			if (event) queueMicrotask(() => {
				if (attempt === current && event.defaultPrevented) requested = false;
			});
		},
		closeCancelled: () => {
			requested = false;
			attempt++;
		},
		allWindowsClosed: () => {
			if (requested || platform !== "darwin") quit();
		}
	};
}

export { createQuitLifecycle };
