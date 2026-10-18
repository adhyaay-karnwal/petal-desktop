// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/hover.ts
import { create$1, subscribeWithSelector } from "../../../../../vendor/zustand.js";
import { getVisibleTree, usePages } from "./pages.js";

var useHover = create$1()(subscribeWithSelector((set, get) => ({
	hoveredId: null,
	source: "canvas",
	setHovered: (id, source) => {
		if (get().hoveredId === id) return;
		set({
			hoveredId: id,
			source
		});
	},
	clearHover: (id) => {
		const { hoveredId } = get();
		if (hoveredId === null || id !== void 0 && hoveredId !== id) return;
		set({ hoveredId: null });
	}
})));
usePages.subscribe((s) => s.activePageId, () => useHover.getState().clearHover());
usePages.subscribe((s) => s.editRevision, () => {
	const { hoveredId, clearHover } = useHover.getState();
	if (hoveredId !== null && !getVisibleTree().byId.has(hoveredId)) clearHover();
});

export { useHover };
