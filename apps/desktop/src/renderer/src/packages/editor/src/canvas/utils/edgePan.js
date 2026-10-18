// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/edgePan.ts

/**
* Edge auto-pan for drags: while the pointer sits within the zone at a viewport
* edge, the canvas pans that way, faster the closer to the edge. Shared by
* dnd-kit canvas drags (Canvas.tsx) and the Live Preview ⌥-drag, which is a
* plain pointer drag that lives outside dnd-kit.
*/
var DRAG_EDGE_PAN_ZONE = 64;
var DRAG_EDGE_PAN_MAX_SPEED = 900;
/** Pan velocity (px/s, positive moves content toward the end edge) for one axis. */
function getDragEdgePanVelocity(position, start, end) {
	const beforeStartEdge = start + DRAG_EDGE_PAN_ZONE - position;
	if (beforeStartEdge > 0) {
		const strength = Math.min(beforeStartEdge / DRAG_EDGE_PAN_ZONE, 1);
		return DRAG_EDGE_PAN_MAX_SPEED * strength * strength;
	}
	const afterEndEdge = position - (end - DRAG_EDGE_PAN_ZONE);
	if (afterEndEdge > 0) {
		const strength = Math.min(afterEndEdge / DRAG_EDGE_PAN_ZONE, 1);
		return -900 * strength * strength;
	}
	return 0;
}
/**
* Run the per-frame loop until the returned stop function is called. `pan`
* receives the camera offset to add this frame (px). Elapsed time is capped so
* a stalled frame doesn't jump.
*/
function startEdgePanLoop(input) {
	let frameId = 0;
	let previousTime = performance.now();
	const tick = (now) => {
		const elapsedSeconds = Math.min((now - previousTime) / 1e3, .05);
		previousTime = now;
		const pointer = input.getPointer();
		if (pointer) {
			const rect = input.viewport.getBoundingClientRect();
			const velocityX = getDragEdgePanVelocity(pointer.x, rect.left, rect.right);
			const velocityY = getDragEdgePanVelocity(pointer.y, rect.top, rect.bottom);
			if (velocityX !== 0 || velocityY !== 0) input.pan(velocityX * elapsedSeconds, velocityY * elapsedSeconds);
		}
		frameId = requestAnimationFrame(tick);
	};
	frameId = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(frameId);
}

export { startEdgePanLoop };
