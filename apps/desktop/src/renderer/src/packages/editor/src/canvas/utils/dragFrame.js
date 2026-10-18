// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/dragFrame.ts

function screenToCanvas(pt, frame) {
	return {
		x: (pt.x - frame.originX - frame.panX) / frame.scale,
		y: (pt.y - frame.originY - frame.panY) / frame.scale
	};
}
function canvasToScreen(pt, frame) {
	return {
		x: pt.x * frame.scale + frame.originX + frame.panX,
		y: pt.y * frame.scale + frame.originY + frame.panY
	};
}
function mapScreenPoint(pt, from, to) {
	if (!(from.scale > 0) || !(to.scale > 0)) return pt;
	return canvasToScreen(screenToCanvas(pt, from), to);
}
function previewZoomDrift(startRect, startPointer, startScale, liveScale) {
	if (!(startScale > 0)) return {
		x: 0,
		y: 0
	};
	const ratioChange = liveScale / startScale - 1;
	return {
		x: (startRect.left - startPointer.x) * ratioChange,
		y: (startRect.top - startPointer.y) * ratioChange
	};
}

export { mapScreenPoint, previewZoomDrift, screenToCanvas };
