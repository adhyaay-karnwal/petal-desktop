// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/liveProbeChannel.ts

var probes = /* @__PURE__ */ new WeakMap();
function registerLiveProbe(guest, probe) {
	probes.set(guest, probe);
	return () => {
		if (probes.get(guest) === probe) probes.delete(guest);
	};
}
function liveProbeFor(guest) {
	return probes.get(guest) ?? null;
}
var sources = /* @__PURE__ */ new Map();
/** Each WebviewRenderer answers for its own layer: ⌘L, ⇧⌘S and comments ask it by `previewId`. */
function registerLiveSource(previewId, resolve) {
	sources.set(previewId, resolve);
	return () => {
		if (sources.get(previewId) === resolve) sources.delete(previewId);
	};
}
function liveSourceFor(previewId) {
	return sources.get(previewId) ?? null;
}

export { liveProbeFor, liveSourceFor, registerLiveProbe, registerLiveSource };
