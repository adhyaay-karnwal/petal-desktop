// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/innerPickStore.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";

/**
* Selection *inside* a component instance or a Live Preview, and which
* components currently take real clicks.
*
* The rules, applied to content that is not layers:
*  - Components: ⌘-hover / ⌘-click outline and pick the deepest element
*    under the cursor, ⇧⏎ climbs to the parent. A plain click is never a
*    pick; it selects the layer, or goes to the content of one that is
*    interactive (toggled with I). ⌥-drag on the pick, or ⌘⌥-drag anywhere
*    inside, pulls a snapshot out; any other ⌥-drag duplicates the layer.
*  - Previews: static until double-clicked (or switched live from the
*    toolbar), then the page gets the pointer. Interact uses it as is;
*    Capture (I) picks the deepest element on click and pulls it out on drag
*    (see `webviewEditStore.live` / `tool` and PreviewToolbar).
*  - In both, Esc lets go.
*
* Components (`InnerPicker`) and previews (`WebviewRenderer`) drive their own
* outlines and hit-testing; this store is the one place the editor reads the
* result from (⌘L, Esc, the snapshot button).
*/
var state$2 = {
	interactiveIds: /* @__PURE__ */ new Set(),
	inner: null
};
var listeners$4 = /* @__PURE__ */ new Set();
/**
* Live box per layer, read on demand (⌘L). The stored `hit` is what the pick
* was when made; pan and zoom move it on screen every frame, and pushing that
* through the store would re-render every subscriber per frame.
*/
var hitResolvers = /* @__PURE__ */ new Map();
function emit$1(next) {
	state$2 = {
		...state$2,
		...next
	};
	listeners$4.forEach((l) => l());
}
var innerPickStore = {
	getState: () => state$2,
	subscribe(listener) {
		listeners$4.add(listener);
		return () => listeners$4.delete(listener);
	},
	setInteractive(id, on) {
		if (state$2.interactiveIds.has(id) === on) return;
		const next = new Set(state$2.interactiveIds);
		if (on) next.add(id);
		else next.delete(id);
		emit$1({ interactiveIds: next });
	},
	toggleInteractive(id) {
		innerPickStore.setInteractive(id, !state$2.interactiveIds.has(id));
	},
	/** Step inside a layer (no pick yet). A different layer replaces the previous one. */
	enter(layerId, kind) {
		if (state$2.inner?.layerId === layerId) return;
		emit$1({ inner: {
			layerId,
			kind,
			hit: null
		} });
	},
	setHit(layerId, kind, hit) {
		emit$1({ inner: {
			layerId,
			kind,
			hit
		} });
	},
	/** A layer's way of reporting where its pick is right now (screen px). */
	registerHitResolver(layerId, resolve) {
		hitResolvers.set(layerId, resolve);
		return () => {
			if (hitResolvers.get(layerId) === resolve) hitResolvers.delete(layerId);
		};
	},
	/** The current pick's box as it is on screen now, or the stored one. */
	currentHit() {
		const inner = state$2.inner;
		if (!inner) return null;
		const resolve = hitResolvers.get(inner.layerId);
		return resolve ? resolve() ?? inner.hit : inner.hit;
	},
	/** Leave the layer. With `layerId`, only if that layer is the one entered. */
	clear(layerId) {
		if (!state$2.inner) return;
		if (layerId && state$2.inner.layerId !== layerId) return;
		emit$1({ inner: null });
	}
};
function useInnerPickState() {
	return (0, import_react.useSyncExternalStore)(innerPickStore.subscribe, innerPickStore.getState, innerPickStore.getState);
}

export { innerPickStore, useInnerPickState };
