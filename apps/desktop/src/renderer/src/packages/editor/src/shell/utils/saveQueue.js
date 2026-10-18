// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/saveQueue.ts

/**
* Runs saves one at a time in the order they were queued, so a later canvas
* snapshot can't reach the server before an earlier one and be overwritten by
* it. A failed save doesn't stop the ones after it.
*/
function createSaveQueue() {
	let tail = Promise.resolve();
	return (save) => {
		const next = tail.catch(() => {}).then(save);
		tail = next;
		return next;
	};
}

export { createSaveQueue };
