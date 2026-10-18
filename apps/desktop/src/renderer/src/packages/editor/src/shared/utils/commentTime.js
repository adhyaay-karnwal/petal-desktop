// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/commentTime.ts

function formatCommentTime(dateStr) {
	const date = new Date(dateStr);
	const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 6e4));
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString();
}

export { formatCommentTime };
