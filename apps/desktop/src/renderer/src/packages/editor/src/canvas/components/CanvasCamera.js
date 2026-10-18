// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasCamera.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { publishCamera } from "../../shell/hooks/useCommentAgent.js";
import { createCameraApplier } from "../input/camera.js";

/** The wrapper and content styles the canvas layout was built on (from react-zoom-pan-pinch). */
var WRAPPER_STYLE = {
	position: "relative",
	width: "100%",
	height: "100%",
	overflow: "hidden",
	margin: 0,
	padding: 0,
	userSelect: "none",
	WebkitUserSelect: "none",
	WebkitTouchCallout: "none",
	transform: "translate3d(0, 0, 0)"
};
var CONTENT_STYLE = {
	display: "flex",
	flexWrap: "wrap",
	width: "100%",
	height: "100%",
	margin: 0,
	padding: 0,
	transformOrigin: "0% 0%"
};
/**
* The canvas camera: the box the view clips to and the content it transforms.
* The input machine moves it through the applier this hands to `applierRef`.
*
* The elements keep react-zoom-pan-pinch's class names,
* `react-transform-wrapper` and `react-transform-component`: canvas code and
* specs find the transformed content by them.
*
* `overlay` sits in the wrapper over the content, untransformed: Canvas's mode
* cursor layer.
*/
function CanvasCamera(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { initial, applierRef, overlay, children } = t0;
	const contentRef = (0, import_react.useRef)(null);
	const initialRef = (0, import_react.useRef)(initial);
	let t1;
	let t2;
	if ($[0] !== applierRef) {
		t1 = () => {
			const applier = createCameraApplier(contentRef.current, initialRef.current, publishCamera);
			applierRef.current = applier;
			return () => {
				applier.stop();
				if (applierRef.current === applier) applierRef.current = null;
			};
		};
		t2 = [applierRef];
		$[0] = applierRef;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	let t3;
	if ($[3] !== children) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: contentRef,
			className: "react-transform-component",
			style: CONTENT_STYLE,
			children
		});
		$[3] = children;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== overlay || $[6] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-camera": "",
			className: "react-transform-wrapper",
			style: WRAPPER_STYLE,
			children: [t3, overlay]
		});
		$[5] = overlay;
		$[6] = t3;
		$[7] = t4;
	} else t4 = $[7];
	return t4;
}

export { CanvasCamera };
