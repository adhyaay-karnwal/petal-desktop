// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/utils/relativeTime.ts

/** Compact "updated Xh ago" style relative time from an ISO timestamp. */
function relativeTime(iso) {
	const then = new Date(iso).getTime();
	if (!then) return "";
	const s = Math.max(0, Math.floor((Date.now() - then) / 1e3));
	const m = Math.floor(s / 60);
	const h = Math.floor(m / 60);
	const d = Math.floor(h / 24);
	if (s < 60) return "just now";
	if (m < 60) return `${m}m ago`;
	if (h < 24) return `${h}h ago`;
	if (d === 1) return "yesterday";
	if (d < 7) return `${d}d ago`;
	if (d < 30) return `${Math.floor(d / 7)}w ago`;
	if (d < 365) return `${Math.floor(d / 30)}mo ago`;
	return `${Math.floor(d / 365)}y ago`;
}

export { relativeTime };
