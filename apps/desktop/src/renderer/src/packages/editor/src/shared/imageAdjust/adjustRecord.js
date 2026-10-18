// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/adjustRecord.ts
import { ADJUST_KEYS, isNeutralAdjust } from "./imageAdjust.js";

function parseAdjustRecord(value) {
	if (typeof value !== "string" || !value) return {};
	let parsed;
	try {
		parsed = JSON.parse(value);
	} catch {
		return {};
	}
	if (!parsed || typeof parsed !== "object") return {};
	const record = {};
	for (const [url, entry] of Object.entries(parsed)) {
		const { source, adjust } = entry ?? {};
		if (typeof source !== "string" || !adjust || typeof adjust !== "object") continue;
		const clean = {};
		for (const key of ADJUST_KEYS) {
			const v = adjust[key];
			if (typeof v === "number" && Number.isFinite(v) && v !== 0) clean[key] = Math.max(-1, Math.min(1, v));
		}
		record[url] = {
			source,
			adjust: clean
		};
	}
	return record;
}
/** The original image and current slider values for whatever URL is shown now. */
function resolveAdjust(record, url) {
	return record[url] ?? {
		source: url,
		adjust: {}
	};
}
/** Record after showing `shownUrl`, keeping only entries still in use; undefined when empty. */
function nextAdjustRecord(record, shownUrl, entry, urlsInUse) {
	const keep = new Set(urlsInUse);
	const next = {};
	for (const [url, value] of Object.entries(record)) if (keep.has(url) && url !== shownUrl) next[url] = value;
	if (!isNeutralAdjust(entry.adjust)) next[shownUrl] = entry;
	return Object.keys(next).length ? JSON.stringify(next) : void 0;
}

export { nextAdjustRecord, parseAdjustRecord, resolveAdjust };
