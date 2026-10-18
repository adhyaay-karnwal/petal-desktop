// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/textHighlight.ts

/**
* Hovered and selected text is underlined on the element itself (Figma-style)
* rather than boxed in the overlay, so the underline is editor chrome living in
* the design's DOM. The marker holds the node's own decoration so anything
* reading that DOM — the thumbnail capture — can put it back for the read.
*/
var TEXT_HIGHLIGHT_ATTR = "data-lg-text-highlight";
function setDecoration(el, d) {
	el.style.textDecorationLine = d.line;
	el.style.textDecorationColor = d.color;
	el.style.textDecorationThickness = d.thickness;
}
/** Underline `el` in the selection colour; returns the restore. */
function applyTextHighlight(el, thickness) {
	const prev = {
		line: el.style.textDecorationLine,
		color: el.style.textDecorationColor,
		thickness: el.style.textDecorationThickness
	};
	el.setAttribute(TEXT_HIGHLIGHT_ATTR, JSON.stringify(prev));
	setDecoration(el, {
		line: "underline",
		color: "var(--ed-canvas-selection)",
		thickness
	});
	return () => {
		setDecoration(el, prev);
		el.removeAttribute(TEXT_HIGHLIGHT_ATTR);
	};
}
/** Undo every highlight inside `root` while it is rasterized; returns the restore. */
function suspendTextHighlights(root) {
	const marked = root.matches(`[${TEXT_HIGHLIGHT_ATTR}]`) ? [root] : [];
	const restores = [];
	for (const el of [...marked, ...root.querySelectorAll(`[${TEXT_HIGHLIGHT_ATTR}]`)]) {
		const highlight = {
			line: el.style.textDecorationLine,
			color: el.style.textDecorationColor,
			thickness: el.style.textDecorationThickness
		};
		setDecoration(el, JSON.parse(el.getAttribute(TEXT_HIGHLIGHT_ATTR)));
		restores.push(() => setDecoration(el, highlight));
	}
	return () => {
		for (const restore of restores) restore();
	};
}

export { applyTextHighlight, suspendTextHighlights };
