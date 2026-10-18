// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/camera.ts
import { MIN_CANVAS_SCALE, clampCanvasScale } from "../utils/zoom.js";
import { cameraToFitRect } from "../utils/fitCamera.js";

/**
* Camera arithmetic for the input machine's camera states. Points are in
* viewport space: px from the canvas viewport's top-left corner.
*/
function panCamera(camera, dx, dy) {
	return {
		scale: camera.scale,
		positionX: camera.positionX + dx,
		positionY: camera.positionY + dy
	};
}
/** Change scale, clamped, keeping the canvas point under `at` where it is on screen. */
function zoomCameraAt(camera, scale, at) {
	const next = clampCanvasScale(scale);
	const ratio = next / camera.scale;
	return {
		scale: next,
		positionX: at.x - (at.x - camera.positionX) * ratio,
		positionY: at.y - (at.y - camera.positionY) * ratio
	};
}
/**
* The camera that fills the viewport with the box dragged from `a` to `b`
* (either corner first), centred, with no padding and within the canvas zoom
* range. Null when the box is under 1px on a side.
*/
function zoomCameraToRegion(camera, a, b, viewport) {
	const width = Math.abs(b.x - a.x);
	const height = Math.abs(b.y - a.y);
	if (!(width >= 1) || !(height >= 1)) return null;
	return cameraToFitRect({
		x: (Math.min(a.x, b.x) - camera.positionX) / camera.scale,
		y: (Math.min(a.y, b.y) - camera.positionY) / camera.scale,
		width: width / camera.scale,
		height: height / camera.scale
	}, viewport, {
		padding: 0,
		minScale: MIN_CANVAS_SCALE,
		maxScale: 256
	});
}
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
var midpoint = (a, b) => ({
	x: (a.x + b.x) / 2,
	y: (a.y + b.y) / 2
});
/**
* One pinch step, as react-zoom-pan-pinch computed it: scale by the change in
* distance since the pinch began, about the current midpoint, then pan by how
* far the midpoint moved since the last step.
*/
function pinchCamera(camera, pinch, a, b) {
	const center = midpoint(a, b);
	return panCamera(pinch.startDistance > 0 ? zoomCameraAt(camera, pinch.startScale * (distance(a, b) / pinch.startDistance), center) : camera, center.x - pinch.lastCenter.x, center.y - pinch.lastCenter.y);
}
var browserFrames = {
	request: (callback) => requestAnimationFrame(callback),
	cancel: (id) => cancelAnimationFrame(id),
	now: () => performance.now()
};
/** The camera's transform string, in react-zoom-pan-pinch's format; specs and canvas readers parse it. */
var cameraTransform = (c) => `translate(${c.positionX}px, ${c.positionY}px) scale(${c.scale})`;
var easeOut = (t) => -Math.cos(t * Math.PI) / 2 + .5;
var validCamera = (c) => Number.isFinite(c.scale) && c.scale > 0 && Number.isFinite(c.positionX) && Number.isFinite(c.positionY);
/**
* Applies the canvas camera to the content element as a CSS transform and
* reports every applied camera to `publish`. One style write per change, no
* layout reads.
*/
function createCameraApplier(content, initial, publish, frames = browserFrames) {
	let current = {
		scale: initial.scale,
		positionX: initial.positionX,
		positionY: initial.positionY
	};
	let frame = null;
	content.style.transform = cameraTransform(current);
	const write = (next) => {
		if (!validCamera(next)) return;
		current = {
			scale: next.scale,
			positionX: next.positionX,
			positionY: next.positionY
		};
		content.style.transform = cameraTransform(current);
		publish(current);
	};
	const stop = () => {
		if (frame !== null) frames.cancel(frame);
		frame = null;
	};
	return {
		get: () => current,
		set(next) {
			stop();
			write(next);
		},
		animate(next, durationMs) {
			stop();
			if (!validCamera(next)) return;
			if (durationMs <= 0) {
				write(next);
				return;
			}
			const from = current;
			const startedAt = frames.now();
			const step = () => {
				const t = (frames.now() - startedAt) / durationMs;
				if (t >= 1) {
					frame = null;
					write(next);
					return;
				}
				const k = easeOut(t);
				write({
					scale: from.scale + (next.scale - from.scale) * k,
					positionX: from.positionX + (next.positionX - from.positionX) * k,
					positionY: from.positionY + (next.positionY - from.positionY) * k
				});
				frame = frames.request(step);
			};
			frame = frames.request(step);
		},
		stop
	};
}

export { createCameraApplier, distance, midpoint, panCamera, pinchCamera, zoomCameraAt, zoomCameraToRegion };
