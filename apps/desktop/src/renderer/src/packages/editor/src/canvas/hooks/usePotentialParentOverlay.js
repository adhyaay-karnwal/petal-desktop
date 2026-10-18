// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/usePotentialParentOverlay.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { potentialParentRect } from "../utils/dragGuides.js";

/** The container a panel or file drag would drop into, outlined. An element drag's own layer draws its outline. */
function usePotentialParentOverlay({ overlayContainer, potentialParentId }) {
	const renderPotentialParentOverlay = () => {
		if (!potentialParentId) return null;
		const baseRect = overlayContainer?.getBoundingClientRect();
		const parentRect = potentialParentRect(potentialParentId);
		if (!baseRect || !parentRect) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-potential-parent-outline": potentialParentId,
			className: "absolute pointer-events-none outline outline-2 outline-ed-canvas-selection",
			style: {
				left: parentRect.left - baseRect.left,
				top: parentRect.top - baseRect.top,
				width: parentRect.width,
				height: parentRect.height
			}
		});
	};
	return { renderPotentialParentOverlay };
}

export { usePotentialParentOverlay };
