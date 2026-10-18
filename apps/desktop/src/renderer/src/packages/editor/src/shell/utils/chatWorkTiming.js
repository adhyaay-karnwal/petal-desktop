// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/chatWorkTiming.ts

/** Start elapsed-work tracking from the submission event, never from render. */
function startChatWork(startedAt, setStartedAt) {
	const now = Date.now();
	startedAt.current = now;
	setStartedAt(now);
}

export { startChatWork };
