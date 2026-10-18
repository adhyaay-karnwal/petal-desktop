// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/lib/cameraStore.ts

var PREFIX = "petal.canvasCamera.";
var LEGACY_GLOBAL_KEY = "petal-canvas-transform";
var LEGACY_CLEARED_FLAG = "petal.canvasCamera.__legacyCleared";
function keyFor(projectId) {
	return `${PREFIX}${projectId}`;
}
/**
* One-time removal of the pre-LUN-224 global camera. It was a single matrix
* shared by every file, so there is nothing per-project to migrate out of it —
* restoring it anywhere would just reinstate the cross-file leak.
*/
function clearLegacyGlobalOnce() {
	if (typeof window === "undefined") return;
	try {
		if (localStorage.getItem(LEGACY_CLEARED_FLAG)) return;
		localStorage.removeItem(LEGACY_GLOBAL_KEY);
		localStorage.setItem(LEGACY_CLEARED_FLAG, "1");
	} catch {}
}
/** Stored JSON is user-writable and survives across versions — a NaN scale here would wreck the canvas. */
function isCamera(value) {
	if (!value || typeof value !== "object") return false;
	const c = value;
	return typeof c.scale === "number" && Number.isFinite(c.scale) && c.scale > 0 && typeof c.positionX === "number" && Number.isFinite(c.positionX) && typeof c.positionY === "number" && Number.isFinite(c.positionY);
}
function readAll(projectId) {
	if (typeof window === "undefined") return {};
	clearLegacyGlobalOnce();
	try {
		const raw = localStorage.getItem(keyFor(projectId));
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		const out = {};
		for (const [pageId, camera] of Object.entries(parsed)) if (isCamera(camera)) out[pageId] = camera;
		return out;
	} catch {
		return {};
	}
}
function readCamera(projectId, pageId) {
	if (!projectId || !pageId) return null;
	return readAll(projectId)[pageId] ?? null;
}
function writeCamera(projectId, pageId, camera) {
	if (typeof window === "undefined") return;
	if (!projectId || !pageId || !isCamera(camera)) return;
	try {
		const all = readAll(projectId);
		all[pageId] = camera;
		localStorage.setItem(keyFor(projectId), JSON.stringify(all));
	} catch {}
}

export { readCamera, writeCamera };
