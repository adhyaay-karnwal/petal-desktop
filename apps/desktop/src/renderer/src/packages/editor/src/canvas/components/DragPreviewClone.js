// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/DragPreviewClone.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/**
* A dragged element's preview: a DOM clone of the element as the canvas shows it at pickup.
* Rendering the element again through React re-rendered and re-mounted its whole subtree,
* ~1 s for a 5k-node layer and more for each element dragged with it; a clone takes ~10 ms.
*
* The clone is taken in the pickup commit, before useDndCanvas hides the original (child
* layout effects run before the parent's). It sits in the drag layer's copy host where a React
* render of the element used to, sized to the element's box at pickup.
*/
function DragPreviewClone(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { elementId, rect, startScale, sized } = t0;
	const hostRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== elementId || $[1] !== rect || $[2] !== sized || $[3] !== startScale) {
		t1 = () => {
			const host = hostRef.current;
			const source = document.querySelector(`[data-element-id="${CSS.escape(elementId)}"]:not([data-drag-overlay] *)`);
			if (!host || !source) return;
			host.replaceChildren(clonePreview(source, sized ? rect : void 0, startScale));
			return () => host.replaceChildren();
		};
		t2 = [
			elementId,
			rect,
			startScale,
			sized
		];
		$[0] = elementId;
		$[1] = rect;
		$[2] = sized;
		$[3] = startScale;
		$[4] = t1;
		$[5] = t2;
	} else {
		t1 = $[4];
		t2 = $[5];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	let t3;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hostRef,
			style: { display: "contents" }
		});
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function clonePreview(source, rect, startScale) {
	const clone = source.cloneNode(true);
	if (clone.hasAttribute("data-drag-source")) {
		clone.removeAttribute("data-drag-source");
		clone.style.opacity = "";
		clone.style.visibility = "";
	}
	quietEmbeddedMedia(source, clone);
	if (!rect) return clone;
	let boxClone = clone;
	for (let i = 0; i < (rect.box?.depth ?? 0) && boxClone.firstElementChild instanceof HTMLElement; i++) boxClone = boxClone.firstElementChild;
	const style = boxClone.style;
	style.width = `${rect.preview?.width ?? rect.width / startScale}px`;
	style.height = `${rect.preview?.height ?? rect.height / startScale}px`;
	if (rect.preview) {
		style.boxSizing = "border-box";
		style.transform = rect.preview.transform;
		style.transformOrigin = "0 0";
	}
	style.margin = "0";
	if (rect.box?.positioned) {
		style.position = "relative";
		style.inset = "auto";
	}
	return clone;
}
/** A clone of an iframe or video would load and play a second copy; a canvas clone is blank. */
function quietEmbeddedMedia(source, clone) {
	for (const frame of clone.querySelectorAll("iframe")) {
		frame.removeAttribute("src");
		frame.removeAttribute("srcdoc");
	}
	const videos = source.querySelectorAll("video");
	clone.querySelectorAll("video").forEach((video, i) => {
		video.muted = true;
		video.autoplay = false;
		video.pause();
		const time = videos[i]?.currentTime;
		if (time) video.currentTime = time;
	});
	const canvases = source.querySelectorAll("canvas");
	clone.querySelectorAll("canvas").forEach((canvas, i) => {
		const from = canvases[i];
		if (!from?.width || !from.height) return;
		try {
			canvas.getContext("2d")?.drawImage(from, 0, 0);
		} catch {}
	});
}

export { DragPreviewClone };
