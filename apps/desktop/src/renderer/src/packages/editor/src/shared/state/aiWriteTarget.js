// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/aiWriteTarget.ts

var target = null;
function getAiWriteTarget() {
	return target;
}
function publishAiWriteTarget(next) {
	if (target?.chatId === next?.chatId && target?.path === next?.path) return;
	target = next;
}

export { getAiWriteTarget, publishAiWriteTarget };
