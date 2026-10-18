// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useInitialCanvasReady.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/** Reveal a newly opened editor only after the real page data paints; camera refinements must not block opening. */
function useInitialCanvasReady(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { pagesReady, tabLoaded, onReady } = t0;
	const notified = (0, import_react.useRef)(false);
	let t1;
	if ($[0] !== onReady) {
		t1 = () => onReady?.();
		$[0] = onReady;
		$[1] = t1;
	} else t1 = $[1];
	const notify = (0, import_react.useEffectEvent)(t1);
	const ready = pagesReady && tabLoaded;
	const enabled = !!onReady;
	let t2;
	if ($[2] !== enabled || $[3] !== notify || $[4] !== ready) {
		t2 = () => {
			if (!enabled || !ready || notified.current) return;
			let secondFrame = 0;
			const firstFrame = requestAnimationFrame(() => {
				secondFrame = requestAnimationFrame(() => {
					notified.current = true;
					notify();
				});
			});
			return () => {
				cancelAnimationFrame(firstFrame);
				cancelAnimationFrame(secondFrame);
			};
		};
		$[2] = enabled;
		$[3] = notify;
		$[4] = ready;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== enabled || $[7] !== ready) {
		t3 = [enabled, ready];
		$[6] = enabled;
		$[7] = ready;
		$[8] = t3;
	} else t3 = $[8];
	(0, import_react.useEffect)(t2, t3);
}

export { useInitialCanvasReady };
