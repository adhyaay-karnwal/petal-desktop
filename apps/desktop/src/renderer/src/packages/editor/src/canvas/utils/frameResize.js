// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/frameResize.ts
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { publishLiveSize } from "../../shared/state/liveSizeChannel.js";

var isFrameEdge = (value) => value === "e" || value === "s" || value === "se";
/**
* The frame size an edge drag of (dx, dy) canvas px gives: the dragged axes
* grow by the drag, never below `min`, in whole px.
*/
function frameEdgeSize(edge, start, dx, dy, min) {
	return {
		width: edge === "s" ? start.width : Math.round(Math.max(min.width, start.width + dx)),
		height: edge === "e" ? start.height : Math.round(Math.max(min.height, start.height + dy))
	};
}
/**
* A webview frame resized from its own edge, previewed in the DOM: at most one
* write per animation frame to the frame (its page fills it) and the selection
* box, and the size published on the live-size channel for the inspector. The
* page is written once, by `commit`, when the gesture ends with a size that
* changed. Ending without one puts every preview write back and writes
* nothing. Null when the frame is not on the canvas.
*/
function beginFrameResize({ id, edge, start, min, from, commit }) {
	const root = document.querySelector(`[data-canvas-content] [data-element-id="${CSS.escape(id)}"]`);
	if (!root) return null;
	const box = document.querySelector(`[data-selection-overlay-id="${CSS.escape(id)}"]`);
	const saved = [root, ...box ? [box] : []].map((node) => ({
		node,
		width: node.style.width,
		height: node.style.height
	}));
	const startPx = saved.map((s) => ({
		width: parseFloat(s.width),
		height: parseFloat(s.height)
	}));
	let size = start;
	let pending = null;
	let frame = null;
	const draw = () => {
		frame = null;
		if (!pending) return;
		const scale = getCamera().scale;
		size = frameEdgeSize(edge, start, (pending.x - from.x) / scale, (pending.y - from.y) / scale, min);
		const dw = size.width - start.width;
		const dh = size.height - start.height;
		saved.forEach(({ node }, i) => {
			const k = node === box ? scale : 1;
			if (!Number.isNaN(startPx[i].width)) node.style.width = `${startPx[i].width + dw * k}px`;
			if (!Number.isNaN(startPx[i].height)) node.style.height = `${startPx[i].height + dh * k}px`;
		});
		publishLiveSize({
			elementId: id,
			width: size.width,
			height: size.height
		});
	};
	return {
		move(at) {
			pending = at;
			if (frame === null) frame = requestAnimationFrame(draw);
		},
		end(shouldCommit) {
			if (frame !== null) cancelAnimationFrame(frame);
			if (shouldCommit) draw();
			for (const s of saved) {
				s.node.style.width = s.width;
				s.node.style.height = s.height;
			}
			publishLiveSize(null);
			if (shouldCommit && (size.width !== start.width || size.height !== start.height)) commit(size);
		}
	};
}

export { beginFrameResize, isFrameEdge };
