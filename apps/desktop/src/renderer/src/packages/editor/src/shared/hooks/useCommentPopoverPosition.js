// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/hooks/useCommentPopoverPosition.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getCamera, subscribeCamera } from "../../shell/hooks/useCommentAgent.js";

/** How much of a card stays on screen when its pin sits near the bottom edge. */
var MIN_VISIBLE_HEIGHT = 160;
/**
* Keep comment surfaces beside their pin and inside the canvas viewport. The
* position depends only on the pin and the viewport, never on the card's own
* height: a growing card extends downward in place and scrolls once it hits
* the space below, instead of jumping as it resizes.
*/
function useCommentPopoverPosition(canvasX, canvasY, width, t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const firstLineCenter = t0 === void 0 ? 21 : t0;
	const camera = (0, import_react.useSyncExternalStore)(subscribeCamera, getCamera, getCamera);
	const pinX = canvasX * camera.scale + camera.positionX;
	const pinY = canvasY * camera.scale + camera.positionY;
	const ref = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== firstLineCenter) {
		t1 = {
			width: Infinity,
			height: Infinity,
			titleCenter: firstLineCenter
		};
		$[0] = firstLineCenter;
		$[1] = t1;
	} else t1 = $[1];
	const [bounds, setBounds] = (0, import_react.useState)(t1);
	let t2;
	let t3;
	if ($[2] !== firstLineCenter) {
		t2 = () => {
			const element = ref.current;
			const viewport = element?.closest("[data-overlay-container]");
			if (!element || !viewport) return;
			const measure = () => {
				const rect = viewport.getBoundingClientRect();
				const titleRect = element.querySelector(".ed-comment-thread-header > span")?.getBoundingClientRect();
				const titleCenter = titleRect ? titleRect.top - element.getBoundingClientRect().top + titleRect.height / 2 : firstLineCenter;
				setBounds((previous) => previous.width === rect.width && previous.height === rect.height && previous.titleCenter === titleCenter ? previous : {
					width: rect.width,
					height: rect.height,
					titleCenter
				});
			};
			measure();
			const observer = new ResizeObserver(measure);
			observer.observe(viewport);
			return () => observer.disconnect();
		};
		t3 = [firstLineCenter];
		$[2] = firstLineCenter;
		$[3] = t2;
		$[4] = t3;
	} else {
		t2 = $[3];
		t3 = $[4];
	}
	(0, import_react.useLayoutEffect)(t2, t3);
	const actualWidth = Math.min(width, Math.max(0, bounds.width - 16));
	const preferredX = pinX + 44 + actualWidth > bounds.width - 8 ? pinX - actualWidth - 12 : pinX + 44;
	const top = Math.max(8, Math.min(pinY - 16 - bounds.titleCenter, bounds.height - MIN_VISIBLE_HEIGHT - 8));
	const t4 = Math.max(8, Math.min(preferredX, bounds.width - actualWidth - 8));
	const t5 = Math.max(MIN_VISIBLE_HEIGHT, Math.min(480, bounds.height - top - 8));
	let t6;
	if ($[5] !== actualWidth || $[6] !== t4 || $[7] !== t5 || $[8] !== top) {
		t6 = {
			left: t4,
			top,
			width: actualWidth,
			maxHeight: t5
		};
		$[5] = actualWidth;
		$[6] = t4;
		$[7] = t5;
		$[8] = top;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== pinX || $[11] !== pinY || $[12] !== t6) {
		t7 = {
			ref,
			pinX,
			pinY,
			style: t6
		};
		$[10] = pinX;
		$[11] = pinY;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	return t7;
}

export { useCommentPopoverPosition };
